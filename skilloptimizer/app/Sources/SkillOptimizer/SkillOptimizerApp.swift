import SwiftUI

@main
struct SkillOptimizerApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate

    // No real scene content — the menu bar icon and popup are both owned
    // directly by `AppDelegate` (`NSStatusItem` + `AppWindowController`).
    // SwiftUI still requires at least one Scene for `App` to be valid.
    var body: some Scene {
        Settings {
            EmptyView()
        }
    }
}
