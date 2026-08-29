import AppKit
import SwiftUI

/// Owns the single floating `NSPanel` that hosts the popup's content when
/// pinned (docs/pin_mode_spec.md). A real second window, not a patch on top
/// of the transient `MenuBarExtra` popover — that's what makes `.popover`
/// inside it (the per-skill description) render anchored correctly, unlike
/// inside the MenuBarExtra bezel.
@MainActor
final class PinnedPanelController {
    static let shared = PinnedPanelController()

    private var panel: NSPanel?
    private var escMonitor: Any?

    var isVisible: Bool { panel != nil }

    func show(model: SkillDensityModel) {
        if let panel {
            bringToFront(panel)
            return
        }

        // Fixed size matching the transient popup's own dimensions
        // (`SkillDensityMenu` hardcodes `.frame(width: 300)` /
        // `.frame(maxHeight: 740)`) rather than measuring
        // `NSHostingController.view.fittingSize`, which isn't reliable
        // before the view has ever been laid out in a real window.
        let panelSize = NSSize(width: 300, height: 734)

        // The popup has no opaque background of its own — inside
        // `MenuBarExtra(.window)` the system supplies the dark vibrancy
        // chrome for free. A plain `NSPanel` doesn't, so the hosted content
        // needs an explicit background matching the app's real dark theme.
        let hosting = NSHostingController(
            rootView: SkillDensityMenu(model: model)
                .background(Color(white: 32.0 / 255.0))
        )

        let panel = NSPanel(
            contentRect: NSRect(origin: .zero, size: panelSize),
            styleMask: [.borderless, .nonactivatingPanel],
            backing: .buffered,
            defer: false
        )
        panel.contentViewController = hosting
        panel.isFloatingPanel = true
        panel.level = .floating
        panel.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary]
        panel.isMovableByWindowBackground = true
        panel.hasShadow = true
        panel.isReleasedWhenClosed = false
        panel.isOpaque = true
        panel.backgroundColor = NSColor(white: 32.0 / 255.0, alpha: 1)

        // Land roughly where the menu-bar popover itself would appear: right
        // edge of the screen, just under the menu bar. MenuBarExtra doesn't
        // expose its own NSStatusItem frame, so this is the closest reliable
        // approximation without reaching into private API.
        if let screen = NSScreen.main {
            let vf = screen.visibleFrame
            let origin = NSPoint(x: vf.maxX - panelSize.width - 8, y: vf.maxY - panelSize.height - 4)
            panel.setFrame(NSRect(origin: origin, size: panelSize), display: true)
        }

        panel.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
        self.panel = panel

        escMonitor = NSEvent.addLocalMonitorForEvents(matching: .keyDown) { [weak self] event in
            guard let self, self.panel != nil else { return event }
            if event.keyCode == 53 { // Escape
                model.isPinned = false
                self.hide()
                return nil
            }
            return event
        }
    }

    func bringToFront(_ panel: NSPanel? = nil) {
        let target = panel ?? self.panel
        target?.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }

    func hide() {
        panel?.orderOut(nil)
        panel = nil
        if let escMonitor {
            NSEvent.removeMonitor(escMonitor)
        }
        escMonitor = nil
    }
}
