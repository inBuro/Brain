import Foundation

/// Reads and writes trigger phrases / slash-command references straight into
/// a skill's actual `description:` frontmatter field on disk, so they
/// genuinely steer the router (triggers) or just document the relationship
/// (commands) — not just an in-app note.
enum SkillFileEditor {
    enum EditError: Error {
        case frontmatterNotFound
        case descriptionNotFound
    }

    /// Recognized marker groups: each group's variants are treated as the
    /// same logical section when parsing, and its first (canonical) form is
    /// what gets written when creating a new section.
    static let triggerVariants = ["Триггерные фразы", "Триггеры (RU):", "Триггеры:"]
    static let commandVariants = ["Команды:"]
    static let allMarkerVariants = triggerVariants + commandVariants

    static func appendTriggers(_ phrases: String, to url: URL) throws {
        try rewrite(at: url, canonicalMarker: "Триггеры:", variants: triggerVariants) { current in
            mergedDescription(current, canonicalMarker: "Триггеры:", variants: triggerVariants, appending: phrases)
        }
    }

    static func appendCommands(_ commands: String, to url: URL) throws {
        try rewrite(at: url, canonicalMarker: "Команды:", variants: commandVariants) { current in
            mergedDescription(current, canonicalMarker: "Команды:", variants: commandVariants, appending: commands)
        }
    }

    /// Removes one comma-separated phrase from the "Триггеры:" section. If
    /// that was the last phrase, the whole section is dropped rather than
    /// left as an empty "Триггеры: .".
    static func removeTriggerPhrase(_ phrase: String, from url: URL) throws {
        try rewrite(at: url, canonicalMarker: "Триггеры:", variants: triggerVariants) { current in
            removingPhrase(phrase, from: current, canonicalMarker: "Триггеры:", variants: triggerVariants)
        }
    }

    /// Archives a skill instead of deleting it outright: moves its whole
    /// folder (SKILL.md plus any reference files/subfolders alongside it) to
    /// `~/.claude/skills/_archive/skills-retired-<today>/<folder-name>/`,
    /// matching this environment's own retirement convention — reversible by
    /// just moving the folder back.
    static func archiveSkill(at skillFileURL: URL) throws {
        let skillFolder = skillFileURL.deletingLastPathComponent()
        let folderName = skillFolder.lastPathComponent

        guard let skillsRoot = archiveRoot(for: skillFolder) else {
            throw EditError.frontmatterNotFound
        }

        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd"
        let today = dateFormatter.string(from: Date())

        let archiveDir = skillsRoot
            .appendingPathComponent("_archive")
            .appendingPathComponent("skills-retired-\(today)")
        try FileManager.default.createDirectory(at: archiveDir, withIntermediateDirectories: true)

        var destination = archiveDir.appendingPathComponent(folderName)
        var suffix = 2
        while FileManager.default.fileExists(atPath: destination.path) {
            destination = archiveDir.appendingPathComponent("\(folderName)-\(suffix)")
            suffix += 1
        }

        try FileManager.default.moveItem(at: skillFolder, to: destination)
    }

    /// Walks up from a skill's folder to find the "skills" root directory it
    /// lives under (".../.claude/skills"), so the archive lands as a sibling
    /// of the router groups rather than nested inside one.
    private static func archiveRoot(for skillFolder: URL) -> URL? {
        var current = skillFolder
        while current.pathComponents.count > 1 {
            if current.lastPathComponent == "skills" { return current }
            current = current.deletingLastPathComponent()
        }
        return nil
    }

    // MARK: - Shared read/transform/write plumbing

    private static func rewrite(at url: URL, canonicalMarker: String, variants: [String], transform: (String) -> String) throws {
        var lines = try String(contentsOf: url, encoding: .utf8)
            .components(separatedBy: "\n")

        guard lines.first == "---" else { throw EditError.frontmatterNotFound }
        guard let closingIndex = lines.dropFirst().firstIndex(of: "---") else {
            throw EditError.frontmatterNotFound
        }

        guard let descLineIndex = (1..<closingIndex).first(where: { lines[$0].hasPrefix("description:") })
        else { throw EditError.descriptionNotFound }

        let afterColon = String(lines[descLineIndex].dropFirst("description:".count))
            .trimmingCharacters(in: .whitespaces)

        var endIndex = descLineIndex
        let currentText: String
        let wasBlockScalar = afterColon.isEmpty || afterColon == ">-" || afterColon == "|" || afterColon == "|-"

        if wasBlockScalar {
            // Folded/literal block scalar: gather the indented continuation lines.
            var collected: [String] = []
            var i = descLineIndex + 1
            while i < closingIndex, lines[i].hasPrefix(" ") {
                collected.append(lines[i].trimmingCharacters(in: .whitespaces))
                endIndex = i
                i += 1
            }
            currentText = collected.joined(separator: " ")
        } else {
            var value = afterColon
            if value.hasPrefix("\""), value.hasSuffix("\""), value.count >= 2 {
                value = String(value.dropFirst().dropLast())
            }
            currentText = value
        }

        let newText = transform(currentText)
        // Always writing back inline used to silently flatten a block-scalar
        // (`>-`) description into a single-line one on the very first edit —
        // and worse, an inline plain scalar is only valid YAML for a limited
        // character set, so a phrase containing e.g. ": " could write out
        // genuinely broken frontmatter that Claude Code's own skill loader
        // would then fail to parse. Round-tripping the original block-scalar
        // style, and quoting an inline value whenever it isn't safe bare,
        // keeps every write valid YAML regardless of what the phrases say.
        let replacementLines: [String]
        if wasBlockScalar {
            replacementLines = ["description: >-", "  \(newText)"]
        } else if isSafeAsPlainScalar(newText) {
            replacementLines = ["description: \(newText)"]
        } else {
            replacementLines = ["description: \(yamlDoubleQuoted(newText))"]
        }
        lines.replaceSubrange(descLineIndex...endIndex, with: replacementLines)

        try lines.joined(separator: "\n").write(to: url, atomically: true, encoding: .utf8)
    }

    /// Not a full YAML-safety check — covers what actually shows up in skill
    /// descriptions (a colon-space anywhere, or a leading reserved indicator
    /// character), which is what separates "still parses" from silent
    /// corruption when writing a plain (unquoted) scalar back to disk.
    private static func isSafeAsPlainScalar(_ text: String) -> Bool {
        guard let first = text.first else { return true }
        let reservedLeading: Set<Character> = ["\"", "'", "{", "[", "&", "*", "!", "|", ">", "%", "@", "`", "#", "-", "?", ":", ","]
        if reservedLeading.contains(first) { return false }
        if text.contains(": ") || text.hasSuffix(":") || text.hasSuffix(" ") { return false }
        return true
    }

    private static func yamlDoubleQuoted(_ text: String) -> String {
        let escaped = text
            .replacingOccurrences(of: "\\", with: "\\\\")
            .replacingOccurrences(of: "\"", with: "\\\"")
        return "\"\(escaped)\""
    }

    // MARK: - Text transforms

    private static func mergedDescription(_ currentText: String, canonicalMarker: String, variants: [String], appending newText: String) -> String {
        let targetMatch = variants.compactMap { variant in
            currentText.range(of: variant).map { (range: $0, variant: variant) }
        }.min { $0.range.lowerBound < $1.range.lowerBound }

        guard let target = targetMatch else {
            // This marker doesn't exist yet — append a fresh section at the very end.
            var base = currentText.trimmingCharacters(in: .whitespaces)
            if !base.isEmpty, !base.hasSuffix(".") { base += "." }
            return (base.isEmpty ? "" : base + " ") + "\(canonicalMarker) \(newText)."
        }

        let (sectionContent, before, after) = section(of: currentText, at: target.range, matchedVariant: target.variant)
        let mergedSection = "\(canonicalMarker) \(sectionContent), \(newText)."
        return after.isEmpty ? "\(before)\(mergedSection)" : "\(before)\(mergedSection) \(after)"
    }

    private static func removingPhrase(_ phrase: String, from currentText: String, canonicalMarker: String, variants: [String]) -> String {
        let targetMatch = variants.compactMap { variant in
            currentText.range(of: variant).map { (range: $0, variant: variant) }
        }.min { $0.range.lowerBound < $1.range.lowerBound }

        guard let target = targetMatch else { return currentText }

        let (sectionContent, before, after) = section(of: currentText, at: target.range, matchedVariant: target.variant)
        let remaining = sectionContent
            .split(separator: ",")
            .map { $0.trimmingCharacters(in: .whitespaces) }
            .filter { !$0.isEmpty && $0 != phrase }

        if remaining.isEmpty {
            // Drop the whole section rather than leave "Триггеры: .".
            let trimmedBefore = before.trimmingCharacters(in: .whitespaces)
            if trimmedBefore.isEmpty { return after }
            return after.isEmpty ? trimmedBefore : "\(trimmedBefore) \(after)"
        }

        let mergedSection = "\(canonicalMarker) \(remaining.joined(separator: ", "))."
        return after.isEmpty ? "\(before)\(mergedSection)" : "\(before)\(mergedSection) \(after)"
    }

    /// Given a match for one of this section's marker variants, returns its
    /// trimmed content (period stripped), plus everything before and after
    /// the section (the latter trimmed) so callers can splice a replacement
    /// back in.
    ///
    /// The boundary search excludes only the *matched* variant, not its whole
    /// group — a file that (through some earlier edit or hand-tweak) mixes
    /// two spellings of the same group, e.g. both "Триггеры:" and
    /// "Триггерные фразы:", must still stop at the second one. Excluding the
    /// whole group let that second marker's own label text get swallowed
    /// into the section content and re-written into the phrase list.
    private static func section(of text: String, at markerRange: Range<String.Index>, matchedVariant: String) -> (content: String, before: String, after: String) {
        let otherMarkers = allMarkerVariants.filter { $0 != matchedVariant }
        let searchRange = markerRange.upperBound..<text.endIndex
        let nextBoundary = otherMarkers.compactMap { text.range(of: $0, range: searchRange) }
            .map { $0.lowerBound }
            .min() ?? text.endIndex

        var content = String(text[markerRange.upperBound..<nextBoundary])
            .trimmingCharacters(in: .whitespacesAndNewlines)
        if content.hasSuffix(".") { content.removeLast() }

        let before = String(text[text.startIndex..<markerRange.lowerBound])
        let after = String(text[nextBoundary...]).trimmingCharacters(in: .whitespacesAndNewlines)
        return (content, before, after)
    }
}
