// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "SkillOptimizer",
    platforms: [.macOS(.v13)],
    targets: [
        .executableTarget(name: "SkillOptimizer", path: "Sources/SkillOptimizer")
    ]
)
