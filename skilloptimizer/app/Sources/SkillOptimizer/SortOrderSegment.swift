import AppKit
import SwiftUI

/// A single-segment `NSSegmentedControl`, wrapped for SwiftUI. Renders with
/// the exact same native bezel as the timeframe `Picker(.segmented)` right
/// next to it — no more hand-matched colors/shadows/hairlines chasing that
/// bezel by eye (see the repeated back-and-forth in SkillDensityMenu's git
/// history before this). `.selectOne` tracking keeps the segment visually
/// "pressed" permanently, like an always-active tab; the control still sends
/// its action on every click regardless of the segment already being
/// selected, which is what lets this double as a toggle button.
struct SortOrderSegment: NSViewRepresentable {
    let title: String
    let action: () -> Void

    func makeNSView(context: Context) -> NSSegmentedControl {
        let control = NSSegmentedControl(
            labels: [title],
            trackingMode: .selectOne,
            target: context.coordinator,
            action: #selector(Coordinator.fired)
        )
        control.font = .systemFont(ofSize: 11)
        control.setWidth(44, forSegment: 0)
        control.selectedSegment = 0
        return control
    }

    func updateNSView(_ nsView: NSSegmentedControl, context: Context) {
        nsView.setLabel(title, forSegment: 0)
        nsView.selectedSegment = 0
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(action: action)
    }

    final class Coordinator: NSObject {
        let action: () -> Void
        init(action: @escaping () -> Void) { self.action = action }
        @objc func fired() { action() }
    }
}
