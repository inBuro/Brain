import AppKit
import Combine
import SwiftUI

/// Owns the single real window the popup lives in, in both its states.
///
/// History worth knowing before touching this file again: this went through
/// three different designs in one session.
/// 1. A custom `NSPanel`, manually positioned at a fixed screen corner —
///    wrong, because the icon isn't at the screen's actual corner (system
///    icons sit further right).
/// 2. A real `NSPopover` shown `relativeTo:` the status-item button — gets
///    positioning and vibrancy right for free, but always draws its anchor
///    arrow, and there is no supported way to suppress it (attempts to fake
///    it out via an extended `positioningRect` broke the horizontal
///    alignment instead of hiding the arrow).
/// 3. Back to a custom `NSPanel` (this version), but positioned correctly
///    this time — from `button.window.frame`, the button's *real* on-screen
///    frame, not a guessed screen corner. Native-looking (real
///    `NSVisualEffectView` `.popover` material via `VisualEffectBackground`,
///    same corner radius as system chrome) without the arrow, because a
///    plain panel never draws one.
///
/// One recurring bug class across all this: `NSWindow.didMoveNotification`
/// fires for *every* frame change, including our own programmatic
/// repositioning (initial icon-anchor, resize-driven re-anchor) — not just
/// real user drags. A boolean flag set/cleared synchronously around
/// `setFrameOrigin` does NOT reliably guard this, because the notification
/// can be delivered after the flag is already cleared. The fix used here:
/// don't listen for moves at all while we're the one causing them —
/// unsubscribe before each programmatic move, resubscribe shortly after.
@MainActor
final class AppWindowController: NSObject, NSWindowDelegate {
    static let shared = AppWindowController()

    /// Set once by `AppDelegate` — gives the real, current icon position.
    weak var statusButton: NSStatusBarButton?

    private var panel: NSPanel?
    private var outsideClickMonitor: Any?
    private var escMonitor: Any?
    private var dragMonitor: Any?
    private var groupsCancellable: AnyCancellable?
    // `NSWindow.isVisible` proved unreliable for this borderless/nonactivating
    // panel (read back false immediately after a confirmed-on-screen
    // `makeKeyAndOrderFront`) — tracking our own state avoids trusting it.
    private var isOpen = false
    // Set for the duration of a `ResizeHandleView` drag. Every intermediate
    // frame during that drag fires `didResizeNotification`, which would
    // otherwise call `anchorNearIcon` mid-gesture using whatever size
    // happened to land first — fighting the drag's own `setFrame` calls and
    // occasionally leaving the panel off-screen once the two disagreed.
    private var isManuallyResizing = false

    func beginManualResize() { isManuallyResizing = true }
    func endManualResize() { isManuallyResizing = false }

    /// Same corner radius as the system's own popover chrome.
    private static let cornerRadius: CGFloat = 10

    func toggle(model: SkillDensityModel) {
        if isOpen {
            if model.isPinned {
                panel?.makeKeyAndOrderFront(nil)
                NSApp.activate(ignoringOtherApps: true)
            } else {
                close(model: model)
            }
        } else {
            open(model: model)
        }
    }

    func updatePinned(_ pinned: Bool, model: SkillDensityModel) {
        guard let panel else { return }
        panel.level = pinned ? .floating : .popUpMenu
        panel.collectionBehavior = pinned ? [.canJoinAllSpaces, .fullScreenAuxiliary] : [.moveToActiveSpace]
        // Same floor regardless of pin state — shrinking too far risks
        // clipping the header/footer chrome itself, not just hiding rows.
        panel.minSize = NSSize(width: 300, height: 128)
        if pinned {
            removeOutsideClickMonitor()
            removeDragMonitor()
        } else {
            installOutsideClickMonitor(model: model)
            scheduleDragMonitor(panel: panel, model: model)
        }
    }

    private func open(model: SkillDensityModel) {
        let panel = self.panel ?? makePanel(model: model)
        self.panel = panel
        isOpen = true

        anchorNearIcon(panel, model: model)
        updatePinned(model.isPinned, model: model)
        panel.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
        installEscMonitor(model: model)
    }

    private func close(model: SkillDensityModel) {
        panel?.orderOut(nil)
        isOpen = false
        removeOutsideClickMonitor()
        removeEscMonitor()
        removeDragMonitor()
        // If this fires mid-resize-drag (e.g. Escape while the resize
        // handle is held down), `orderOut` hides the panel before
        // `ResizeHandleView.mouseUp` can ever be delivered to end the drag
        // — AppKit doesn't reliably deliver mouseUp to a window that just
        // got hidden. Without this, `isManuallyResizing` would stay stuck
        // `true` for the rest of the app's lifetime, permanently disabling
        // the icon re-anchor on every future content-size change.
        endManualResize()
    }

    private func makePanel(model: SkillDensityModel) -> NSPanel {
        let hosting = NSHostingController(
            rootView: SkillDensityMenu(model: model)
                .background(VisualEffectBackground(cornerRadius: Self.cornerRadius))
        )
        // Sizing is manual from here on (initial height below, then the
        // user's own resize) — `.preferredContentSize` would otherwise keep
        // fighting a manual resize back to the content's own ideal size on
        // every SwiftUI update.
        hosting.sizingOptions = []

        let panel = NSPanel(
            contentRect: NSRect(x: 0, y: 0, width: 300, height: model.idealHeight),
            // `.resizable` enables drag-resize (and the matching resize
            // cursor) on all edges by default; `windowWillResize(_:to:)`
            // below locks the width component so only height ever changes.
            styleMask: [.borderless, .nonactivatingPanel, .resizable],
            backing: .buffered,
            defer: false
        )
        panel.contentViewController = hosting
        // `NSHostingController` collapses the window to its content's size
        // *at that exact instant* the moment it's assigned as
        // `contentViewController` — before SwiftUI has laid anything out
        // against a real display, which can be near-zero. This overrides
        // that one-time auto-fit back to the size we actually want.
        panel.setContentSize(NSSize(width: 300, height: model.idealHeight))
        panel.isFloatingPanel = true
        panel.isMovableByWindowBackground = true
        panel.hasShadow = true
        panel.isReleasedWhenClosed = false
        panel.isOpaque = false
        panel.backgroundColor = .clear
        panel.delegate = self
        panel.minSize = NSSize(width: 300, height: 128) // overwritten by updatePinned right after open(), kept in sync so it's never briefly wrong
        panel.maxSize = NSSize(width: 300, height: NSScreen.main?.frame.height ?? 2000)

        NotificationCenter.default.addObserver(
            forName: NSWindow.didResizeNotification, object: panel, queue: .main
        ) { [weak self] _ in
            Task { @MainActor in
                guard let self, let panel = self.panel, self.isOpen, !self.isManuallyResizing else { return }
                self.anchorNearIcon(panel, model: model)
            }
        }

        // Turning off `sizingOptions` (above) means nothing else keeps the
        // window in sync with the list any more — without this, a panel
        // created while the scan is still running (the common case: opening
        // is near-instant, indexing isn't) stays stuck at the tiny
        // "Indexing skills…" height forever, even once real data arrives a
        // moment later. Only applies pre-pin: once the user takes manual
        // control of the height (pin, or a drag which auto-pins), further
        // data refreshes must never override that choice.
        groupsCancellable = model.$groups.sink { [weak self, weak panel] _ in
            // `@Published`'s own publisher emits from `willSet` — reading
            // `model.groups` (via `idealHeight`) synchronously here would
            // see the *old* value, one update behind. Deferring a tick
            // reads it after the actual assignment has landed.
            DispatchQueue.main.async {
                guard self != nil, let panel, !model.isPinned else { return }
                panel.setContentSize(NSSize(width: 300, height: model.idealHeight))
            }
        }

        return panel
    }

    /// Centers the panel horizontally under the real status-item icon, top
    /// edge flush with the icon's bottom — the same spot a native dropdown
    /// occupies, read from the button's actual on-screen frame rather than
    /// approximated from screen geometry. Also used for the resize-driven
    /// re-anchor when the list's height changes, which is why this always
    /// pauses/resumes the drag monitor around the move, not just on open.
    private func anchorNearIcon(_ panel: NSPanel, model: SkillDensityModel) {
        guard let screen = NSScreen.main else { return }
        let vf = screen.visibleFrame
        let size = panel.frame.size

        let origin: NSPoint
        if let iconWindow = statusButton?.window {
            // Left-aligned to the icon, not centered — matches how native
            // menu-bar dropdowns actually tend to sit (their left edge
            // roughly under the icon, extending right), not centered under
            // a narrow icon with the dropdown straddling both sides of it.
            // Offset by the header's own 12pt leading padding
            // (`SkillDensityMenu`'s header `HStack`) so the *visible*
            // "24h" tab — not the panel's outer edge — lines up flush
            // with the icon's left edge.
            let icon = iconWindow.frame
            let x = min(icon.minX - 12, vf.maxX - size.width - 4)
            // The window can never need to be taller than the room actually
            // available between the icon and the bottom of the visible
            // screen (Dock excluded) — `maxSize` was previously the raw
            // screen height regardless of icon position, which let a big
            // enough manual resize push the bottom edge past the visible
            // screen. Recomputed here (not just once at panel creation) so
            // it stays correct if the icon or screen geometry ever changes.
            panel.maxSize = NSSize(width: panel.maxSize.width, height: max(panel.minSize.height, icon.minY - vf.minY))
            origin = NSPoint(x: max(x, vf.minX + 4), y: max(icon.minY - size.height, vf.minY))
        } else {
            origin = NSPoint(x: vf.maxX - size.width - 8, y: vf.maxY - size.height - 4)
        }

        removeDragMonitor()
        panel.setFrameOrigin(origin)
        if !model.isPinned {
            scheduleDragMonitor(panel: panel, model: model)
        }
    }

    /// The user actually dragging the unpinned dropdown by its background
    /// only makes sense if it then behaves like the pinned, stays-put
    /// window — otherwise it'd just vanish on the next outside click,
    /// wherever they moved it to. So treat a real drag as the same gesture
    /// as pressing the pin button. Resubscribed with a short delay after
    /// every programmatic move (see `anchorNearIcon`) so it never confuses
    /// that move for a drag.
    private func scheduleDragMonitor(panel: NSPanel, model: SkillDensityModel) {
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) { [weak self] in
            guard let self, self.isOpen, self.panel === panel, !model.isPinned else { return }
            self.removeDragMonitor() // idempotent: harmless if called more than once per open
            self.dragMonitor = NotificationCenter.default.addObserver(
                forName: NSWindow.didMoveNotification, object: panel, queue: .main
            ) { [weak self] _ in
                Task { @MainActor in
                    guard let self, !model.isPinned else { return }
                    model.isPinned = true
                    self.updatePinned(true, model: model)
                }
            }
        }
    }

    private func removeDragMonitor() {
        if let dragMonitor {
            NotificationCenter.default.removeObserver(dragMonitor)
        }
        dragMonitor = nil
    }

    /// Unpinned behaves like a normal dropdown: any click outside the panel
    /// dismisses it.
    private func installOutsideClickMonitor(model: SkillDensityModel) {
        removeOutsideClickMonitor()
        outsideClickMonitor = NSEvent.addGlobalMonitorForEvents(matching: [.leftMouseDown, .rightMouseDown]) { [weak self] _ in
            guard let self, let panel = self.panel, !model.isPinned else { return }
            let location = NSEvent.mouseLocation
            if panel.frame.contains(location) { return }
            // Only *our own* status-item button is excluded — that click
            // is the button's own action re-toggling the panel, not the
            // user dismissing it, and without this exclusion the same
            // click would both close the panel here *and* reopen it via
            // the button's action, racing on every click. Clicking any
            // *other* menu-bar item (WiFi, clock, Control Center, etc.)
            // must still close this panel, exactly like a native dropdown
            // does when a sibling one opens — excluding the whole menu bar
            // strip instead of just our icon broke that.
            if let iconFrame = self.statusButton?.window?.frame, iconFrame.contains(location) { return }
            self.close(model: model)
        }
    }

    private func removeOutsideClickMonitor() {
        if let outsideClickMonitor {
            NSEvent.removeMonitor(outsideClickMonitor)
        }
        outsideClickMonitor = nil
    }

    private func installEscMonitor(model: SkillDensityModel) {
        if escMonitor != nil { return }
        escMonitor = NSEvent.addLocalMonitorForEvents(matching: .keyDown) { [weak self] event in
            guard let self, self.panel != nil else { return event }
            if event.keyCode == 53 { // Escape
                model.isPinned = false
                self.close(model: model)
                return nil
            }
            return event
        }
    }

    private func removeEscMonitor() {
        if let escMonitor {
            NSEvent.removeMonitor(escMonitor)
        }
        escMonitor = nil
    }

    /// Only the height is ever meant to change by dragging — width stays
    /// fixed at 300 regardless of which edge/corner the user grabs.
    func windowWillResize(_ sender: NSWindow, to frameSize: NSSize) -> NSSize {
        NSSize(width: 300, height: frameSize.height)
    }
}
