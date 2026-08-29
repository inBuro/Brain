import Foundation

struct SkillEvent {
    let skill: String
    let date: Date
}

/// Extracts Skill-tool invocations from Claude Code session transcripts
/// (~/.claude/projects/**/*.jsonl), plus one more thing the Skill tool alone
/// misses: router skills (e.g. "seo") don't re-invoke their subskills
/// (e.g. "ai-seo") through the Skill tool — they just `Read` the subskill's
/// SKILL.md file directly. A Read of ".../<router>/subskills/<subskill>/SKILL.md"
/// immediately after that router was invoked counts as a use of <subskill>.
///
/// Caches per-file event lists keyed by mtime so unchanged transcripts aren't
/// re-parsed on every refresh. An actor so the (potentially multi-second) scan
/// never blocks the main thread.
actor SkillScanner {
    private struct FileCache {
        var mtime: Date
        var events: [SkillEvent]
    }

    private var cache: [String: FileCache] = [:]
    private let projectsDir: URL

    init() {
        projectsDir = FileManager.default.homeDirectoryForCurrentUser
            .appendingPathComponent(".claude/projects")
    }

    func scanEvents() -> [SkillEvent] {
        var all: [SkillEvent] = []

        guard let enumerator = FileManager.default.enumerator(
            at: projectsDir,
            includingPropertiesForKeys: [.contentModificationDateKey],
            options: [.skipsHiddenFiles],
            errorHandler: { _, _ in true } // a transcript rotated/removed mid-walk shouldn't abort the rest
        ) else { return all }

        for case let fileURL as URL in enumerator {
            guard fileURL.pathExtension == "jsonl" else { continue }
            let path = fileURL.path
            let mtime = (try? fileURL.resourceValues(forKeys: [.contentModificationDateKey]))?
                .contentModificationDate ?? .distantPast

            if let cached = cache[path], cached.mtime == mtime {
                all.append(contentsOf: cached.events)
                continue
            }

            let events = Self.parseEvents(in: fileURL)
            cache[path] = FileCache(mtime: mtime, events: events)
            all.append(contentsOf: events)
        }

        return all
    }

    private static let dateFormatter: ISO8601DateFormatter = {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter
    }()

    private static func parseEvents(in url: URL) -> [SkillEvent] {
        var events: [SkillEvent] = []
        guard let text = try? String(contentsOf: url, encoding: .utf8) else { return events }

        var lastRouterSkill: String?

        text.enumerateLines { line, _ in
            guard line.contains("\"Skill\"") || line.contains("\"Read\"") else { return }
            guard let data = line.data(using: .utf8),
                  let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                  let timestampString = obj["timestamp"] as? String,
                  let date = dateFormatter.date(from: timestampString),
                  let message = obj["message"] as? [String: Any],
                  let content = message["content"] as? [[String: Any]]
            else { return }

            for item in content {
                guard item["type"] as? String == "tool_use",
                      let toolName = item["name"] as? String,
                      let input = item["input"] as? [String: Any]
                else { continue }

                if toolName == "Skill", let skill = input["skill"] as? String {
                    events.append(SkillEvent(skill: skill, date: date))
                    lastRouterSkill = skill
                } else if toolName == "Read", let filePath = input["file_path"] as? String,
                          let (router, subskill) = routerSubskill(from: filePath),
                          router == lastRouterSkill {
                    events.append(SkillEvent(skill: subskill, date: date))
                }
            }
        }

        return events
    }

    /// Parses ".../skills/<router>/subskills/<subskill>/SKILL.md" into (router, subskill).
    private static func routerSubskill(from filePath: String) -> (router: String, subskill: String)? {
        let components = filePath.split(separator: "/").map(String.init)
        guard let subskillsIndex = components.firstIndex(of: "subskills"),
              subskillsIndex > 0,
              subskillsIndex + 2 < components.count,
              components[subskillsIndex + 2] == "SKILL.md"
        else { return nil }
        return (router: components[subskillsIndex - 1], subskill: components[subskillsIndex + 1])
    }
}
