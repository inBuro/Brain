import SwiftUI

/// "Indexing skills" followed by three always-visible dots at 40% opacity,
/// with one dot at a time lit up to 100% in sequence — a classic
/// loading-indicator pulse rather than a growing "." -> ".." -> "..." count.
struct AnimatedEllipsisText: View {
    let base: String
    @State private var activeIndex = 0

    private let timer = Timer.publish(every: 0.3, on: .main, in: .common).autoconnect()

    init(_ base: String) {
        self.base = base
    }

    var body: some View {
        HStack(spacing: 0) {
            Text(base)
            ForEach(0..<3, id: \.self) { index in
                Text(".")
                    .opacity(index == activeIndex ? 1.0 : 0.4)
            }
        }
        .onReceive(timer) { _ in
            activeIndex = (activeIndex + 1) % 3
        }
    }
}
