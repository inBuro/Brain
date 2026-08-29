import SwiftUI
import AppKit

/// Invisible helper view that reaches up to its enclosing NSScrollView and
/// forces a `.mini` control size on its scroller — roughly half the default
/// thickness. SwiftUI's ScrollView has no direct knob for scroller width.
struct ThinScrollbar: NSViewRepresentable {
    func makeNSView(context: Context) -> NSView {
        let view = NSView(frame: .zero)
        DispatchQueue.main.async {
            guard let scrollView = view.enclosingScrollView else { return }
            scrollView.verticalScroller?.controlSize = .mini
            scrollView.horizontalScroller?.controlSize = .mini
        }
        return view
    }

    func updateNSView(_ nsView: NSView, context: Context) {}
}
