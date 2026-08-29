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
    /// "plugin:name" -> bare "name", for plugin skills that can also be
    /// invoked/recorded under their bare name. One physical skill must
    /// have exactly one entry in `descriptions` (that's the candidate set
    /// for the zero-count list) — this is a lookup for folding the other
    /// spelling's invocation events into the canonical bare name, not a
    /// second registration of the same skill.
    var aliases: [String: String] = [:]
}

/// Reads each skill's frontmatter (`name:`, `description:`) out of every
/// SKILL.md under ~/.claude/skills and ~/.claude/plugins, keyed the same way
/// the Skill tool records invocations ("name" for personal skills,
/// "plugin:name" for plugin-provided ones), and records which router group
/// each subskill belongs to.
actor SkillDescriptionIndex {
    private let skillsDir: URL
    private let pluginsCacheDir: URL
    private let settingsFile: URL

    init() {
        let home = FileManager.default.homeDirectoryForCurrentUser
        skillsDir = home.appendingPathComponent(".claude/skills")
        pluginsCacheDir = home.appendingPathComponent(".claude/plugins/cache")
        settingsFile = home.appendingPathComponent(".claude/settings.json")
    }

    func buildIndex() -> SkillMetadata {
        var metadata = SkillMetadata()
        let enabledPlugins = Self.readEnabledPlugins(settingsFile)

        for url in Self.findSkillFiles(under: skillsDir) {
            guard let (name, description) = Self.parseFrontmatter(url) else { continue }
            metadata.descriptions[name] = description
            metadata.paths[name] = url
            if let router = Self.routerName(from: url) {
                // `parents` (like every other table here) is keyed on the
                // bare subskill name, with no room for two different
                // routers to each have their own "overview" — that's a
                // real gap (two genuinely distinct skills would end up
                // merged into one row, whichever router's file the
                // enumerator happens to visit last), but resolving it
                // properly means qualifying subskill identity by
                // (router, name) everywhere downstream, including the
                // `UserDefaults` acknowledgment keys — a bigger change than
                // this collision, in practice quite rare for a personal
                // skill library, currently warrants. First-registered wins
                // here, at least, so the outcome doesn't depend on
                // filesystem enumeration order and flip between runs.
                if metadata.parents[name] == nil {
                    metadata.parents[name] = router
                }
            }
        }

        for url in Self.findSkillFiles(under: pluginsCacheDir) {
            // A disabled plugin (`"plugin@marketplace": false` in
            // settings.json) can never actually fire — it's not "dead
            // weight to clean up", it's already off. Every skill folder
            // under a disabled plugin's cache would otherwise flood the
            // list at zero invocations once zero-count skills are shown at
            // all (see `SkillDensityModel`), which is how this was found.
            if let key = Self.enabledPluginsKey(from: url), enabledPlugins[key] == false {
                continue
            }
            guard let (name, description) = Self.parseFrontmatter(url) else { continue }
            metadata.descriptions[name] = description
            if let plugin = Self.pluginName(from: url) {
                metadata.aliases["\(plugin):\(name)"] = name
            }
        }

        return metadata
    }

    /// Reads `enabledPlugins` from `~/.claude/settings.json` — a flat
    /// `{"plugin@marketplace": true/false}` map. A minimal hand-rolled
    /// parse (not full `JSONSerialization`) since this file can contain
    /// permission-list values this actor has no reason to model; only the
    /// one top-level key matters here.
    private static func readEnabledPlugins(_ url: URL) -> [String: Bool] {
        guard let data = try? Data(contentsOf: url),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let enabled = json["enabledPlugins"] as? [String: Bool]
        else { return [:] }
        return enabled
    }

    /// ".../plugins/cache/<marketplace>/<plugin>/<version>/..." ->
    /// "<plugin>@<marketplace>", matching the `enabledPlugins` key format.
    private static func enabledPluginsKey(from skillFileURL: URL) -> String? {
        let components = skillFileURL.pathComponents
        guard let cacheIndex = components.firstIndex(of: "cache"),
              cacheIndex + 2 < components.count
        else { return nil }
        let marketplace = components[cacheIndex + 1]
        let plugin = components[cacheIndex + 2]
        return "\(plugin)@\(marketplace)"
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
