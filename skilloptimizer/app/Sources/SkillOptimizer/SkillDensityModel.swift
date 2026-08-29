import Foundation

enum Timeframe: String, CaseIterable, Identifiable {
    case day = "24 hours"
    case week = "Week"
    case month = "Month"

    var id: String { rawValue }
}

enum SortOrder {
    case activity
    case alphabetical
}

@MainActor
final class SkillDensityModel: ObservableObject {
    @Published private(set) var groups: [SkillGroup] = []
    @Published private(set) var lastUpdated = Date()
    @Published private(set) var isLoading = false
    @Published var timeframe: Timeframe = .day {
        didSet { recompute() }
    }
    @Published var sortOrder: SortOrder = .activity {
        didSet { recompute() }
    }
    /// Whether the popup is currently detached into a floating always-on-top
    /// panel instead of the transient menu-bar popover. Deliberately not
    /// persisted — starting pinned after a relaunch would be a surprise, not
    /// a convenience (see docs/pin_mode_spec.md).
    @Published var isPinned: Bool = false

    private var scanner = SkillScanner()
    private var descriptionIndex = SkillDescriptionIndex()
    private var timer: Timer?
    private var allEvents: [SkillEvent] = []
    private var metadata = SkillMetadata()
    private var acknowledgedAt: [String: Date] = SkillDensityModel.loadAcknowledgedAt() {
        didSet { SkillDensityModel.saveAcknowledgedAt(acknowledgedAt) }
    }

    var totalCount: Int { groups.reduce(0) { $0 + $1.entry.count + $1.children.reduce(0) { $0 + $1.count } } }

    init() {
        refresh()
        timer = Timer.scheduledTimer(withTimeInterval: 60, repeats: true) { [weak self] _ in
            Task { @MainActor in self?.refresh() }
        }
    }

    /// Dismisses a skill's green delta by raising its personal counting
    /// floor to now — a click on "+N" means "seen this", not "erase history".
    /// The next real invocation of that skill starts a fresh +1 from here.
    func acknowledge(_ name: String) {
        acknowledgedAt[name] = Date()
        recompute()
    }

    func refresh() {
        isLoading = true
        Task {
            async let eventsScan = scanner.scanEvents()
            async let descriptionScan = descriptionIndex.buildIndex()
            let (events, metadataResult) = await (eventsScan, descriptionScan)

            allEvents = events
            metadata = metadataResult
            recompute()
            lastUpdated = Date()
            isLoading = false
        }
    }

    private func recompute() {
        let rollingCutoff: Date
        switch timeframe {
        case .day:
            rollingCutoff = Calendar.current.date(byAdding: .hour, value: -24, to: Date()) ?? .distantPast
        case .week:
            rollingCutoff = Calendar.current.date(byAdding: .day, value: -7, to: Date()) ?? .distantPast
        case .month:
            rollingCutoff = Calendar.current.date(byAdding: .month, value: -1, to: Date()) ?? .distantPast
        }
        var total: [String: Int] = [:]
        var window: [String: Int] = [:]
        for event in allEvents {
            let name = normalizedName(event.skill)
            total[name, default: 0] += 1
            let cutoff = max(rollingCutoff, acknowledgedAt[name] ?? .distantPast)
            if event.date >= cutoff { window[name, default: 0] += 1 }
        }

        func entry(for name: String) -> SkillEntry {
            let key: String? = metadata.descriptions[name] != nil ? name : Self.lastComponent(of: name)
            let description = key.flatMap { metadata.descriptions[$0] }
            let path = key.flatMap { metadata.paths[$0] }
            return SkillEntry(name: name, count: total[name] ?? 0, windowCount: window[name] ?? 0, description: description, path: path)
        }

        // Only show names that resolve to a SKILL.md that exists today —
        // historical invocations of a since-deleted/renamed skill (or a
        // built-in with no file to check at all) are excluded rather than
        // kept around as ghosts.
        //
        // Every invoked name that has a parent router is a child; everything
        // else (routers themselves, and skills with no subskill structure)
        // is top-level.
        let invokedNames = Set(total.keys).filter(currentlyExists)
        var childrenByRouter: [String: [SkillEntry]] = [:]
        var topLevelNames: Set<String> = []

        for name in invokedNames {
            if let router = metadata.parents[name] {
                childrenByRouter[router, default: []].append(entry(for: name))
            } else {
                topLevelNames.insert(name)
            }
        }

        // A router might only ever surface via its subskills (never invoked
        // directly) — still needs a (zero-count) header row to hang them off.
        for router in childrenByRouter.keys {
            topLevelNames.insert(router)
        }

        groups = topLevelNames
            .map { name -> SkillGroup in
                let children = (childrenByRouter[name] ?? []).sorted { lhs, rhs in
                    switch sortOrder {
                    case .activity:
                        return lhs.count != rhs.count ? lhs.count > rhs.count : lhs.name < rhs.name
                    case .alphabetical:
                        return lhs.name < rhs.name
                    }
                }
                return SkillGroup(entry: entry(for: name), children: children)
            }
            .sorted { lhs, rhs in
                switch sortOrder {
                case .activity:
                    // Rank by the group's most-used row (itself or any child),
                    // not a hidden sum and not the router's own count alone —
                    // a router with 2 direct calls but a child called 5 times
                    // is exactly as "busy" as that child, and a router with 3
                    // direct calls and 20 rarely-used children isn't busier
                    // than a flat skill called 15 times.
                    func rank(_ group: SkillGroup) -> Int {
                        max(group.entry.count, group.children.map(\.count).max() ?? 0)
                    }
                    let lhsRank = rank(lhs), rhsRank = rank(rhs)
                    return lhsRank != rhsRank ? lhsRank > rhsRank : lhs.entry.name < rhs.entry.name
                case .alphabetical:
                    return lhs.entry.name < rhs.entry.name
                }
            }
    }

    private static let acknowledgedDefaultsKey = "SkillOptimizer.acknowledgedAt"
    /// Pre-rebrand bundle ID — read once as a migration fallback so renaming
    /// the app doesn't reset everyone's dismissed "+N" badges.
    private static let legacyBundleID = "brain.kirill.skilldensitybar"
    private static let legacyDefaultsKey = "SkillDensityBar.acknowledgedAt"

    private static func loadAcknowledgedAt() -> [String: Date] {
        if let raw = UserDefaults.standard.dictionary(forKey: acknowledgedDefaultsKey) {
            return raw.compactMapValues { $0 as? Date }
        }
        if let legacyRaw = UserDefaults(suiteName: legacyBundleID)?.dictionary(forKey: legacyDefaultsKey) {
            let migrated = legacyRaw.compactMapValues { $0 as? Date }
            if !migrated.isEmpty { saveAcknowledgedAt(migrated) }
            return migrated
        }
        return [:]
    }

    private static func saveAcknowledgedAt(_ value: [String: Date]) {
        UserDefaults.standard.set(value, forKey: acknowledgedDefaultsKey)
    }

    /// True when `name` still resolves to a real SKILL.md on disk (directly,
    /// or via the "plugin:name" / "router:subskill" compound-name fallback).
    private func currentlyExists(_ name: String) -> Bool {
        if metadata.descriptions[name] != nil { return true }
        if let suffix = Self.lastComponent(of: name), metadata.descriptions[suffix] != nil { return true }
        return false
    }

    /// For "plugin:skill" names whose plugin prefix no longer resolves
    /// (e.g. the plugin was archived outside the plugin-cache layout),
    /// fall back to matching on the bare skill name after the colon.
    private static func lastComponent(of name: String) -> String? {
        guard let colonIndex = name.lastIndex(of: ":") else { return nil }
        return String(name[name.index(after: colonIndex)...])
    }

    /// Some subskills were historically invoked directly as "router:subskill"
    /// (an older addressing convention) and are now invoked as the bare
    /// subskill name via the router-Read pattern. Collapse the old compound
    /// form into the bare name whenever it genuinely matches a known
    /// router/subskill pair, so the same skill doesn't split into two rows —
    /// one nested, one a duplicate top-level "router:subskill" entry.
    /// Plugin-prefixed names (e.g. "figma:figma-use") are untouched since
    /// they don't correspond to a subskills-folder router.
    private func normalizedName(_ name: String) -> String {
        // "interfaces:" was the vendor pack's plugin-style prefix from when
        // it briefly lived outside ~/.claude/skills; it's a personal skill
        // group now, so that prefix is purely legacy addressing.
        if name.hasPrefix("interfaces:") {
            return String(name.dropFirst("interfaces:".count))
        }
        guard let colonIndex = name.lastIndex(of: ":") else { return name }
        let prefix = String(name[name.startIndex..<colonIndex])
        let suffix = String(name[name.index(after: colonIndex)...])
        return metadata.parents[suffix] == prefix ? suffix : name
    }
}
