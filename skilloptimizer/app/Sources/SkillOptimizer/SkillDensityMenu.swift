import SwiftUI

struct SkillDensityMenu: View {
    @ObservedObject var model: SkillDensityModel

    /// MenuBarExtra's `.window` style doesn't resize the popup to fit
    /// content on its own — flexible frame constraints (maxHeight) on the
    /// list are silently ignored. Computing an explicit height here from the
    /// actual row count, capped at 650pt, is what actually drives the window
    /// size: short lists get a short window, long ones scroll within the cap.
    private var scrollHeight: CGFloat {
        let rowCount = model.groups.reduce(0) { $0 + 1 + $1.children.count }
        guard rowCount > 0 else { return 0 }
        let rowHeight: CGFloat = 22
        let rowSpacing: CGFloat = 6
        let verticalPadding: CGFloat = 24
        let content = CGFloat(rowCount) * rowHeight + CGFloat(rowCount - 1) * rowSpacing + verticalPadding
        return min(650, content)
    }

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
                    model.sortOrder = model.sortOrder == .activity ? .alphabetical : .activity
                } label: {
                    Group {
                        if model.sortOrder == .activity {
                            Text("321")
                                .monospacedDigit()
                        } else {
                            Text("ABC")
                        }
                    }
                    .font(.system(size: 11))
                    .frame(width: 44, height: 22)
                    .background(
                        ZStack(alignment: .top) {
                            RoundedRectangle(cornerRadius: 5)
                                .fill(Color(white: 106.0 / 255.0))
                            // The segmented timeframe picker has a hairline
                            // highlight along its top edge (part of its native
                            // bezel); this button mirrors it so both controls
                            // read as the same visual family.
                            // Rectangle() (no cornerRadius) renders a hard 2px
                            // physical line on Retina — crisp hairline. Using
                            // RoundedRectangle(cornerRadius:1) on a 1pt-tall shape
                            // degrades it into a capsule/oval and blurs 3-4px.
                            Rectangle()
                                .fill(Color(white: 72.0 / 255.0))
                                .frame(height: 1)
                        }
                        .clipShape(RoundedRectangle(cornerRadius: 5))
                    )
                }
                .buttonStyle(.plain)
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
                .frame(height: scrollHeight)
            }

            Divider()

            HStack(spacing: 0) {
                Button {
                    model.refresh()
                } label: {
                    HStack(spacing: 7) {
                        Group {
                            if model.isLoading {
                                AnimatedEllipsisText("Indexing skills")
                            } else {
                                Text("Updated: \(model.lastUpdated.formatted(date: .omitted, time: .standard))")
                            }
                        }
                        .font(.caption)
                        .foregroundStyle(.white)
                        if !model.isLoading {
                            Image(systemName: "arrow.clockwise")
                                .font(.system(size: 11))
                                .offset(y: -2)
                        }
                    }
                }
                .buttonStyle(.plain)
                .disabled(model.isLoading)

                Spacer()

                Button {
                    model.isPinned.toggle()
                    if model.isPinned {
                        PinnedPanelController.shared.show(model: model)
                        NSApp.keyWindow?.close()
                    } else {
                        PinnedPanelController.shared.hide()
                    }
                } label: {
                    Image(systemName: model.isPinned ? "pin.fill" : "pin")
                        .font(.system(size: 11))
                        .foregroundStyle(model.isPinned ? .white : .secondary)
                        .opacity(model.isPinned ? 1 : 0.4)
                }
                .buttonStyle(.plain)
                .help(model.isPinned ? "Unpin — click to close floating window" : "Pin to float above other windows")
                .padding(.trailing, 8)

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
        .frame(maxHeight: 740)
    }
}

private struct SkillRow: View {
    let entry: SkillEntry
    var showCount: Bool = true
    var onTriggersSaved: () -> Void = {}
    var onAcknowledge: (String) -> Void = { _ in }
    @State private var showInfo = false

    var body: some View {
        HStack(spacing: 6) {
            Group {
                if entry.description != nil {
                    Button {
                        showInfo.toggle()
                    } label: {
                        HStack(spacing: 3) {
                            Text(entry.name)
                                .lineLimit(1)
                            Image(systemName: "chevron.right")
                                .font(.system(size: 8))
                                .foregroundStyle(.tertiary)
                        }
                    }
                    .buttonStyle(.plain)
                    .popover(isPresented: $showInfo, arrowEdge: .trailing) {
                        DescriptionPopover(entry: entry, onTriggersSaved: onTriggersSaved)
                    }
                } else {
                    Text(entry.name)
                        .lineLimit(1)
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
    }
}
