import AppKit
import SwiftUI

/// The real system popover material (`NSVisualEffectView`, `.popover`) —
/// used as the panel's background so both the pinned and unpinned states
/// get the actual native vibrancy/blur chrome, not a hand-picked flat color
/// standing in for it.
struct VisualEffectBackground: NSViewRepresentable {
    var cornerRadius: CGFloat = 0

    func makeNSView(context: Context) -> NSVisualEffectView {
        let view = NSVisualEffectView()
        view.material = .popover
        view.blendingMode = .behindWindow
        view.state = .active
        // Rounding via the view's own layer (rather than a SwiftUI
        // `.clipShape` on top) keeps this the real, live, native blur —
        // masking a `NSViewRepresentable` from the SwiftUI side risks
        // baking it into a static snapshot instead.
        view.wantsLayer = true
        view.layer?.cornerRadius = cornerRadius
        view.layer?.masksToBounds = true
        return view
    }

    func updateNSView(_ nsView: NSVisualEffectView, context: Context) {
        nsView.layer?.cornerRadius = cornerRadius
    }
}
