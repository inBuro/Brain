import AppKit
import SwiftUI

/// A thin strip along the window's bottom edge that supplies drag-to-resize
/// by hand. `NSPanel`'s `.resizable` style mask alone does nothing visible
/// here — edge-drag resizing normally comes from a titled window's
/// border/frame view, which a borderless panel (`AppWindowController`) has
/// none of. This view is the missing hit area: hover sets the resize
/// cursor, drag adjusts the window's height while keeping the top edge
/// fixed — the panel is anchored under the menu-bar icon, so it should grow
/// and shrink from the bottom, not shift the icon-aligned top edge.
/// A visible grip capsule was tried here and dropped — it read as a stray
/// smudge rather than a native affordance, worse than having none at all.
/// The hit area is just wider (10pt) instead, to make it findable by feel.
struct ResizeHandle: NSViewRepresentable {
    /// Resize only makes sense once the window is pinned: while unpinned,
    /// two things would otherwise fight it — `SkillDensityModel`'s own
    /// auto-resize-to-content on every scan refresh, and a manual resize's
    /// `setFrame` call (origin *and* size at once) being indistinguishable
    /// from a user drag to the drag-monitor that auto-pins on background
    /// drags, silently pinning the window as a side effect of a resize the
    /// user didn't intend to pin anything with. Requiring a pin first keeps
    /// "move/pin" and "resize" as two separate, sequential actions instead
    /// of accidentally coupled ones.
    var isEnabled: Bool = true

    func makeNSView(context: Context) -> ResizeHandleView { ResizeHandleView() }
    func updateNSView(_ nsView: ResizeHandleView, context: Context) {
        nsView.isEnabled = isEnabled
    }
}

final class ResizeHandleView: NSView {
    var isEnabled = true
    private var startFrame: NSRect = .zero
    private var startMouseY: CGFloat = 0
    private var trackingArea: NSTrackingArea?

    // Cursor *rects* (`resetCursorRects`/`addCursorRect`) only got
    // re-established on whatever triggers AppKit's own cursor-rect
    // invalidation — which our manual `window.setFrame(...)` resize below
    // doesn't reliably trigger for a borderless panel, so the resize
    // cursor showed exactly once (the window's first cursor-rect pass)
    // and never again after. A `.cursorUpdate` tracking area is the
    // more robust mechanism for this: `updateTrackingAreas()` is called by
    // AppKit whenever this view's own geometry might have changed, so the
    // area always matches the current bounds regardless of how the resize
    // happened.
    override func updateTrackingAreas() {
        super.updateTrackingAreas()
        if let trackingArea {
            removeTrackingArea(trackingArea)
        }
        let area = NSTrackingArea(
            rect: bounds,
            options: [.activeAlways, .cursorUpdate, .mouseEnteredAndExited],
            owner: self
        )
        addTrackingArea(area)
        trackingArea = area
    }

    // Both `cursorUpdate` and explicit `mouseEntered`/`mouseExited` set the
    // cursor — belt and suspenders, since which of these actually fires
    // reliably for a borderless `.nonactivatingPanel` proved inconsistent
    // in practice.
    override func cursorUpdate(with event: NSEvent) {
        (isEnabled ? NSCursor.resizeUpDown : NSCursor.arrow).set()
    }

    override func mouseEntered(with event: NSEvent) {
        (isEnabled ? NSCursor.resizeUpDown : NSCursor.arrow).set()
    }

    override func mouseExited(with event: NSEvent) {
        NSCursor.arrow.set()
    }

    override func mouseDown(with event: NSEvent) {
        guard isEnabled, let window else { return }
        AppWindowController.shared.beginManualResize()
        startFrame = window.frame
        startMouseY = NSEvent.mouseLocation.y
    }

    override func mouseUp(with event: NSEvent) {
        AppWindowController.shared.endManualResize()
    }

    override func mouseDragged(with event: NSEvent) {
        guard isEnabled, let window else { return }
        // Screen Y grows upward; dragging the bottom edge down (making the
        // window taller) moves the mouse to a *smaller* Y, so the delta is
        // subtracted, not added, to go from mouse movement to height change.
        let dy = NSEvent.mouseLocation.y - startMouseY
        let rawHeight = startFrame.height - dy
        let newHeight = min(window.maxSize.height, max(window.minSize.height, rawHeight))
        let topEdge = startFrame.origin.y + startFrame.height
        window.setFrame(
            NSRect(x: startFrame.origin.x, y: topEdge - newHeight, width: startFrame.width, height: newHeight),
            display: true
        )
    }
}
