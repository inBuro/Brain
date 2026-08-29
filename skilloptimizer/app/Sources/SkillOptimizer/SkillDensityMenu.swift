import SwiftUI

struct SkillDensityMenu: View {
    @ObservedObject var model: SkillDensityModel

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(spacing: 8) {
                Picker("", selection: $model.timeframe) {
                    ForEach(Timeframe.allCases) { timeframe in
                        Text(timeframe.rawValue).tag(timeframe)
                    }
                }
                .pickerStyle(.segmented)
                .labelsHidden()

                Button {
                    model.isPinned.toggle()
                    AppWindowController.shared.updatePinned(model.isPinned, model: model)
                } label: {
                    Image(systemName: model.isPinned ? "pin.fill" : "pin")
                        .font(.system(size: 11))
                        .foregroundStyle(model.isPinned ? .white : .secondary)
                        .opacity(model.isPinned ? 1 : 0.4)
                        // Resting at an angle (unpinned) vs. pushed straight
                        // in, filled (pinned) — the same glyph, just rotated.
                        .rotationEffect(.degrees(model.isPinned ? 0 : 45))
                }
                .buttonStyle(.plain)
                .help(model.isPinned ? "Unpin — click to close floating window" : "Pin to float above other windows")

                SortOrderSegment(title: model.sortOrder == .activity ? "321" : "ABC") {
                    model.sortOrder = model.sortOrder == .activity ? .alphabetical : .activity
                }
                .frame(width: 44, height: 22)
                .help(model.sortOrder == .activity ? "Sorted by activity — click for alphabetical" : "Sorted alphabetically — click for activity")
            }
            .padding(.horizontal, 12)
            .padding(.top, 12)
            .padding(.bottom, 8)

            Divider()

            if model.groups.isEmpty && !model.isLoading {
                Text("No skills invoked yet")
                    .foregroundStyle(.secondary)
                    .padding(12)
            } else if !model.groups.isEmpty {
                ScrollView {
                    VStack(alignment: .leading, spacing: 6) {
                        ForEach(model.groups) { group in
                            SkillRow(entry: group.entry, showCount: group.children.isEmpty, onTriggersSaved: model.refresh, onAcknowledge: model.acknowledge)
                            ForEach(group.children) { child in
                                SkillRow(entry: child, onTriggersSaved: model.refresh, onAcknowledge: model.acknowledge)
                                    .padding(.leading, 16)
                            }
                        }
                    }
                    .padding(12)
                    .background(ThinScrollbar())
                }
                // Fills whatever height the window (now user-resizable,
                // vertically only — see `AppWindowController`) actually is,
                // rather than a size computed from row count. The window's
                // *initial* height still comes from a row-count estimate
                // (`SkillDensityModel.idealHeight`), set once when it's
                // created — this is just what happens after that, as the
                // window grows/shrinks.
                .frame(maxHeight: .infinity)
            }

            Divider()

            HStack(spacing: 0) {
                Button {
                    model.refresh()
                } label: {
                    HStack(spacing: 7) {
                        Image(systemName: "arrow.clockwise")
                            .font(.system(size: 11))
                            // List rows carry an extra 8pt leading padding
                            // (added later, to clear the description
                            // popover's arrow from the row text) that this
                            // needs to match, net of the glyph's own small
                            // optical bearing.
                            .padding(.leading, 6)
                            .offset(y: -1)
                        if model.isLoading {
                            AnimatedEllipsisText("Indexing skills")
                                .font(.caption2)
                                .foregroundStyle(.white)
                        } else {
                            Text(model.lastUpdated.formatted(.dateTime.hour(.twoDigits(amPM: .omitted)).minute(.twoDigits).second(.twoDigits)))
                                .font(.caption2)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
                .buttonStyle(.plain)
                .disabled(model.isLoading)

                Spacer()

                Button {
                    NSApplication.shared.terminate(nil)
                } label: {
                    HStack(spacing: 4) {
                        Text("⌘Q")
                            .foregroundStyle(.secondary)
                            .opacity(0.4)
                        Text("Quit")
                    }
                }
                .buttonStyle(.plain)
                .keyboardShortcut("q", modifiers: .command)
            }
            .padding(12)
        }
        .frame(width: 300)
        .frame(maxHeight: .infinity, alignment: .top)
        .overlay(alignment: .bottom) {
            ResizeHandle(isEnabled: model.isPinned && !model.isLoading)
                .frame(height: 10)
        }
    }
}

private struct SkillRow: View {
    let entry: SkillEntry
    var showCount: Bool = true
    var onTriggersSaved: () -> Void = {}
    var onAcknowledge: (String) -> Void = { _ in }
    @State private var showInfo = false
    @State private var isHovering = false

    var body: some View {
        HStack(spacing: 6) {
            Group {
                if entry.description != nil {
                    Button {
                        showInfo.toggle()
                    } label: {
                        Text(entry.name)
                            .lineLimit(1)
                    }
                    .buttonStyle(.plain)
                    .padding(.leading, 8)
                    .popover(isPresented: $showInfo, arrowEdge: .leading) {
                        DescriptionPopover(entry: entry, onTriggersSaved: onTriggersSaved)
                    }
                } else {
                    Text(entry.name)
                        .lineLimit(1)
                        // Matches the leading padding on the button branch
                        // above so rows with and without a popover still
                        // line up — this padding exists to push the popover
                        // 8pt clear of the row text, not to indent this row.
                        .padding(.leading, 8)
                }
            }
            .layoutPriority(0)

            Spacer(minLength: 8)

            if showCount {
                if entry.windowCount > 0 {
                    Button {
                        onAcknowledge(entry.name)
                    } label: {
                        Text("+\(entry.windowCount)")
                            .foregroundStyle(.green)
                            .monospacedDigit()
                    }
                    .buttonStyle(.plain)
                    .fixedSize()
                }

                Text("\(entry.count)")
                    .foregroundStyle(.secondary)
                    .monospacedDigit()
                    .fixedSize()
                    .frame(minWidth: 20, alignment: .leading)
                    .layoutPriority(1)
            }
        }
        .frame(height: 16)
        .opacity(isHovering ? 1 : 0.8)
        .onHover { isHovering = $0 }
    }
}
