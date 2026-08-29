import Foundation

struct SkillEntry: Identifiable {
    var id: String { name }
    let name: String
    let count: Int
    let windowCount: Int
    let description: String?
    let path: URL?
}
