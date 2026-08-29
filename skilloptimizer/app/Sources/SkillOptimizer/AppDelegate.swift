import AppKit

/// Owns the real `NSStatusItem` directly instead of going through
/// `MenuBarExtra`. MenuBarExtra's `.window` style secretly toggles an
/// invisible shell window open/closed on every click, and piggybacking on
/// that (via `onAppear`/`onDisappear`) proved unreliable in practice —
/// clicks sometimes needed two or three presses to register as one toggle.
/// A plain `NSStatusItem` button with a target/action fires exactly once
/// per click, every time, and its `button.window.frame` is the *real* icon
/// position — no more guessing where to anchor the popup from a 1x1 shell.
@MainActor
final class AppDelegate: NSObject, NSApplicationDelegate {
    let model = SkillDensityModel()
    private var statusItem: NSStatusItem?

    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApplication.shared.setActivationPolicy(.accessory)

        let item = NSStatusBar.system.statusItem(withLength: NSStatusItem.squareLength)
        if let button = item.button {
            let icon = NSImage(systemSymbolName: "chart.bar.fill", accessibilityDescription: "Skill Optimizer")
            icon?.isTemplate = true
            if let size = icon?.size {
                icon?.size = NSSize(width: size.width - 2, height: size.height - 2)
            }
            button.image = icon
            button.target = self
            button.action = #selector(statusItemClicked)
        }
        statusItem = item
        AppWindowController.shared.statusButton = item.button
    }

    @objc private func statusItemClicked() {
        AppWindowController.shared.toggle(model: model)
    }
}
