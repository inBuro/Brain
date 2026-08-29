import SwiftUI

/// A skill's description, with its trigger-phrase and slash-command sections
/// spaced and colored apart, plus — always last — controls to append more of
/// either straight into that skill's SKILL.md on disk.
struct DescriptionPopover: View {
    let entry: SkillEntry
    var onTriggersSaved: () -> Void = {}

    @State private var isEditingTriggers = false
    @State private var isConfirmingDelete = false
    @State private var deleteError: String?

    var body: some View {
        let parts = Self.parseSections(entry.description ?? "")
        let triggerSection = parts.sections.first { $0.label == "Text-triggers" }
        let commandSection = parts.sections.first { $0.label == "Slash-triggers" }
        let triggerPhrases = (triggerSection?.text ?? "")
            .split(separator: ",")
            .map { Self.stripTrailingPeriod($0.trimmingCharacters(in: .whitespaces)) }
            .filter { !$0.isEmpty }
        let commandEntries = (commandSection?.text ?? "")
            .split(separator: ",")
            .map { Self.stripTrailingPeriod($0.trimmingCharacters(in: .whitespaces)) }
            .filter { !$0.isEmpty }

        VStack(alignment: .leading, spacing: 10) {
            if let path = entry.path {
                HStack {
                    Spacer()
                    if isConfirmingDelete {
                        HStack(spacing: 6) {
                            Text("Delete?")
                                .font(.system(size: 10))
                                .foregroundStyle(.secondary)
                            Button("Confirm") {
                                do {
                                    try SkillFileEditor.archiveSkill(at: path)
                                    onTriggersSaved()
                                } catch {
                                    deleteError = error.localizedDescription
                                }
                                isConfirmingDelete = false
                            }
                            .buttonStyle(.plain)
                            .foregroundStyle(.red)
                            Button("Cancel") { isConfirmingDelete = false }
                                .buttonStyle(.plain)
                        }
                        .font(.system(size: 10))
                    } else {
                        Button("Delete Skill") { isConfirmingDelete = true }
                            .buttonStyle(.plain)
                            .font(.system(size: 10))
                            .foregroundStyle(.red)
                    }
                }
                if let deleteError {
                    Text("Error: \(deleteError)")
                        .font(.caption2)
                        .foregroundStyle(.red)
                }
            }

            Text(parts.main)
                .font(.system(size: 11))
                .foregroundStyle(.white)
                .fixedSize(horizontal: false, vertical: true)

            VStack(alignment: .leading, spacing: 4) {
                if let triggerSection {
                    VStack(alignment: .leading, spacing: 2) {
                        HStack {
                            Text(triggerSection.label)
                                .font(.system(size: 11))
                                .foregroundStyle(.white)
                            Spacer()
                            if entry.path != nil {
                                Button(isEditingTriggers ? "Done" : "Edit") {
                                    isEditingTriggers.toggle()
                                }
                                .buttonStyle(.plain)
                                .font(.system(size: 10))
                                .foregroundStyle(.secondary)
                            }
                        }

                        if isEditingTriggers, let path = entry.path {
                            VStack(alignment: .leading, spacing: 3) {
                                ForEach(triggerPhrases, id: \.self) { phrase in
                                    HStack(spacing: 4) {
                                        Button {
                                            try? SkillFileEditor.removeTriggerPhrase(phrase, from: path)
                                            onTriggersSaved()
                                        } label: {
                                            Image(systemName: "xmark.circle.fill")
                                                .font(.system(size: 11))
                                                .foregroundStyle(.secondary)
                                        }
                                        .buttonStyle(.plain)
                                        Text(phrase)
                                            .font(.system(size: 11))
                                            .foregroundStyle(.white)
                                            .opacity(0.8)
                                            .fixedSize(horizontal: false, vertical: true)
                                    }
                                }
                            }
                        } else {
                            VStack(alignment: .leading, spacing: 3) {
                                ForEach(triggerPhrases, id: \.self) { phrase in
                                    Text(phrase)
                                        .font(.system(size: 11))
                                        .foregroundStyle(.white)
                                        .opacity(0.8)
                                        .fixedSize(horizontal: false, vertical: true)
                                }
                            }
                        }
                    }
                }
                if let path = entry.path {
                    AppendField(
                        label: "Text-trigger",
                        placeholder: "separate with commas",
                        onSave: { try SkillFileEditor.appendTriggers($0, to: path) },
                        onSaved: onTriggersSaved
                    )
                }
            }

            VStack(alignment: .leading, spacing: 4) {
                if let commandSection {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(commandSection.label)
                            .font(.system(size: 11))
                            .foregroundStyle(.white)
                        VStack(alignment: .leading, spacing: 3) {
                            ForEach(commandEntries, id: \.self) { entry in
                                Text(entry)
                                    .font(.system(size: 11))
                                    .foregroundStyle(.white)
                                    .opacity(0.8)
                                    .fixedSize(horizontal: false, vertical: true)
                            }
                        }
                    }
                }
                if let path = entry.path {
                    AppendField(
                        label: "/trigger",
                        placeholder: "e.g. /brief, /prd",
                        onSave: { try SkillFileEditor.appendCommands($0, to: path) },
                        onSaved: onTriggersSaved
                    )
                }
            }
        }
        .padding(10)
        .frame(width: 260)
    }

    /// Splits a description into the main prose and every recognized marker
    /// The last comma-separated item in a section carries the sentence's
    /// trailing period (the section text is a fragment ending in "."). Strip
    /// it so the last row in the list doesn't show a stray dot.
    private static func stripTrailingPeriod(_ text: String) -> String {
        text.hasSuffix(".") ? String(text.dropLast()) : text
    }

    /// section that follows it (trigger phrases, slash commands, …), each as
    /// (label, text) in the order they appear. No marker found -> no sections.
    /// Labels are shown in English regardless of the marker actually written
    /// on disk (still Russian, matching the project's file-content convention
    /// — this translation is display-only).
    private static func parseSections(_ text: String) -> (main: String, sections: [(label: String, text: String)]) {
        let groups: [(canonical: String, display: String, variants: [String])] = [
            ("Триггеры:", "Text-triggers", SkillFileEditor.triggerVariants),
            ("Команды:", "Slash-triggers", SkillFileEditor.commandVariants),
        ]

        var matches: [(range: Range<String.Index>, canonical: String, display: String)] = []
        for group in groups {
            for variant in group.variants {
                if let range = text.range(of: variant) {
                    matches.append((range, group.canonical, group.display))
                }
            }
        }
        matches.sort { $0.range.lowerBound < $1.range.lowerBound }

        guard let first = matches.first else { return (text, []) }
        let main = String(text[text.startIndex..<first.range.lowerBound])
            .trimmingCharacters(in: .whitespacesAndNewlines)

        var sections: [(label: String, text: String)] = []
        for (index, match) in matches.enumerated() {
            let contentEnd = index + 1 < matches.count ? matches[index + 1].range.lowerBound : text.endIndex
            let content = String(text[match.range.upperBound..<contentEnd])
                .trimmingCharacters(in: .whitespacesAndNewlines)
            sections.append((match.display, content))
        }
        return (main, sections)
    }
}

/// A collapsed "Add X" control that expands into a comma-separated text
/// field + Save/Cancel, writing straight to the skill's file on save.
private struct AppendField: View {
    let label: String
    let placeholder: String
    let onSave: (String) throws -> Void
    var onSaved: () -> Void = {}

    @State private var isAdding = false
    @State private var text = ""
    @State private var status: String?

    var body: some View {
        if isAdding {
            VStack(alignment: .leading, spacing: 6) {
                TextField(placeholder, text: $text, axis: .vertical)
                    .textFieldStyle(.roundedBorder)
                    .lineLimit(2...5)
                    .font(.system(size: 11))

                HStack {
                    Button("Save") { save() }
                        .disabled(text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                    Button("Cancel") {
                        isAdding = false
                        text = ""
                        status = nil
                    }
                    if let status {
                        Text(status)
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                    }
                }
            }
        } else {
            Button {
                isAdding = true
            } label: {
                HStack(spacing: 4) {
                    Text("+")
                    Text(label)
                }
            }
            .buttonStyle(.plain)
            .font(.system(size: 11))
            .foregroundStyle(.orange)
        }
    }

    private func save() {
        let value = text.trimmingCharacters(in: .whitespacesAndNewlines)
        do {
            try onSave(value)
            status = "Saved"
            isAdding = false
            text = ""
            onSaved()
        } catch {
            status = "Error: \(error.localizedDescription)"
        }
    }
}
