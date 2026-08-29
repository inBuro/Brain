import SwiftUI

@main
struct SkillOptimizerApp: App {
    @StateObject private var model = SkillDensityModel()

    init() {
        NSApplication.shared.setActivationPolicy(.accessory)
    }

    var body: some Scene {
        MenuBarExtra {
            Group {
                if model.isPinned {
                    // Clicking the status item while pinned should bring the
                    // real floating panel forward, not open a second, normal
                    // transient popup alongside it.
                    Color.clear
                        .frame(width: 1, height: 1)
                        .onAppear {
                            PinnedPanelController.shared.bringToFront()
                            NSApp.keyWindow?.close()
                        }
                } else {
                    SkillDensityMenu(model: model)
                }
            }
        } label: {
            Label("\(model.totalCount)", systemImage: "chart.bar.fill")
        }
        .menuBarExtraStyle(.window)
    }
}
