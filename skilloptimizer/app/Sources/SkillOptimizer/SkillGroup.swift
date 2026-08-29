import Foundation

struct SkillGroup: Identifiable {
    var id: String { entry.name }
    let entry: SkillEntry
    let children: [SkillEntry]
}
