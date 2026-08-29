import Foundation

struct SkillMetadata {
    /// name -> frontmatter description
    var descriptions: [String: String] = [:]
    /// subskill name -> parent router name, derived from
    /// ".../skills/<router>/subskills/<subskill>/SKILL.md"
    var parents: [String: String] = [:]
    /// name -> SKILL.md file path, for personal skills only (not plugin
    /// cache files — those are managed by the plugin system, not editable).
    var paths: [String: URL] = [:]
}

/// Reads each skill's frontmatter (`name:`, `description:`) out of every
/// SKILL.md under ~/.claude/skills and ~/.claude/plugins, keyed the same way
/// the Skill tool records invocations ("name" for personal skills,
/// "plugin:name" for plugin-provided ones), and records which router group
/// each subskill belongs to.
actor SkillDescriptionIndex {
    private let skillsDir: URL
    private let pluginsCacheDir: URL

    init() {
        let home = FileManager.default.homeDirectoryForCurrentUser
        skillsDir = home.appendingPathComponent(".claude/skills")
        pluginsCacheDir = home.appendingPathComponent(".claude/plugins/cache")
    }

    func buildIndex() -> SkillMetadata {
        var metadata = SkillMetadata()

        for url in Self.findSkillFiles(under: skillsDir) {
            guard let (name, description) = Self.parseFrontmatter(url) else { continue }
            metadata.descriptions[name] = description
            metadata.paths[name] = url
            if let router = Self.routerName(from: url) {
                metadata.parents[name] = router
            }
        }

        for url in Self.findSkillFiles(under: pluginsCacheDir) {
            guard let (name, description) = Self.parseFrontmatter(url) else { continue }
            metadata.descriptions[name] = description
            if let plugin = Self.pluginName(from: url) {
                metadata.descriptions["\(plugin):\(name)"] = description
            }
        }

        return metadata
    }

    private static func findSkillFiles(under root: URL) -> [URL] {
        guard let enumerator = FileManager.default.enumerator(
            at: root,
            includingPropertiesForKeys: nil,
            options: [.skipsHiddenFiles],
            errorHandler: { _, _ in true } // a file moved/renamed mid-walk shouldn't abort the rest
        ) else { return [] }

        var results: [URL] = []
        for case let url as URL in enumerator {
            guard url.lastPathComponent == "SKILL.md" else { continue }
            guard !url.pathComponents.contains("_archive") else { continue }
            results.append(url)
        }
        return results
    }

    private static func pluginName(from skillFileURL: URL) -> String? {
        let components = skillFileURL.pathComponents
        guard let cacheIndex = components.firstIndex(of: "cache"),
              cacheIndex + 2 < components.count
        else { return nil }
        return components[cacheIndex + 2]
    }

    /// ".../skills/<router>/subskills/<subskill>/SKILL.md" -> <router>
    private static func routerName(from skillFileURL: URL) -> String? {
        let components = skillFileURL.pathComponents
        guard let subskillsIndex = components.firstIndex(of: "subskills"),
              subskillsIndex > 0,
              subskillsIndex + 2 < components.count,
              components[subskillsIndex + 2] == "SKILL.md"
        else { return nil }
        return components[subskillsIndex - 1]
    }

    private static func parseFrontmatter(_ url: URL) -> (name: String, description: String)? {
        guard let text = try? String(contentsOf: url, encoding: .utf8) else { return nil }

        let lines = text.components(separatedBy: .newlines)
        guard lines.first == "---" else { return nil }
        guard let closingIndex = lines.dropFirst().firstIndex(of: "---") else { return nil }

        var name: String?
        var description: String?

        var i = 1
        while i < closingIndex {
            let line = lines[i]
            if let value = fieldValue(line, key: "name:") { name = value }

            if line.hasPrefix("description:") {
                let afterColon = String(line.dropFirst("description:".count)).trimmingCharacters(in: .whitespaces)
                if afterColon.isEmpty || afterColon == ">-" || afterColon == "|" || afterColon == "|-" {
                    // Folded/literal block scalar: gather the indented continuation lines.
                    var collected: [String] = []
                    var j = i + 1
                    while j < closingIndex, lines[j].hasPrefix(" ") {
                        collected.append(lines[j].trimmingCharacters(in: .whitespaces))
                        j += 1
                    }
                    description = collected.joined(separator: " ")
                    i = j
                    continue
                } else {
                    description = unquoted(afterColon)
                }
            }
            i += 1
        }

        guard let name, let description else { return nil }
        return (name, description)
    }

    private static func fieldValue(_ line: String, key: String) -> String? {
        guard line.hasPrefix(key) else { return nil }
        return unquoted(String(line.dropFirst(key.count)).trimmingCharacters(in: .whitespaces))
    }

    private static func unquoted(_ value: String) -> String {
        guard value.hasPrefix("\""), value.hasSuffix("\""), value.count >= 2 else { return value }
        return String(value.dropFirst().dropLast())
    }
}
