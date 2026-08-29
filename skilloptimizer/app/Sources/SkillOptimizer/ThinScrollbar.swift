import SwiftUI
import AppKit

/// Invisible helper view that reaches up to its enclosing NSScrollView and
/// forces the thin floating-knob look: no background track, permanently
/// visible rather than fading after a scroll. SwiftUI's ScrollView has no
/// direct knob for any of this.
///
/// `scrollerStyle` normally just mirrors the system's own "Show scroll
/// bars" preference (System Settings > General > Appearance) — with that
/// set to "Always" (as opposed to "Automatically based on mouse or
/// trackpad"), `NSScrollView` defaults to `.legacy` style, which draws a
/// solid background track behind the knob everywhere on the system,
/// Finder included. Forcing `.overlay` here overrides that *for this one
/// scroll view* — a knob with no track, which is what this list looked
/// like before some edit dropped this override down to just the
/// `.mini` control size. `autohidesScrollers = false` keeps that knob
/// always drawn instead of fading out between scrolls, since `.overlay`
/// alone would otherwise auto-hide it like a trackpad-only interaction.
struct ThinScrollbar: NSViewRepresentable {
    func makeNSView(context: Context) -> NSView {
        let view = NSView(frame: .zero)
        DispatchQueue.main.async {
            guard let scrollView = view.enclosingScrollView else { return }
            scrollView.scrollerStyle = .overlay
            scrollView.autohidesScrollers = false
            scrollView.verticalScroller?.controlSize = .mini
            scrollView.horizontalScroller?.controlSize = .mini
        }
        return view
    }

    func updateNSView(_ nsView: NSView, context: Context) {}
}
