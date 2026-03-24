#!/usr/bin/env bash
set -euo pipefail

# Usage:
# ./scripts/ios-clean-rebuild.sh
# Optional env:
# IOS_SCHEME=saveit
# IOS_WORKSPACE=ios/saveit.xcworkspace
# IOS_XCODEPROJ=ios/saveit.xcodeproj
# IOS_CONFIGURATION=Debug
# IOS_DESTINATION='generic/platform=iOS' # or a device id destination
# APPLE_TEAM_ID=RFRVD795TK

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

IOS_SCHEME="${IOS_SCHEME:-saveit}"
IOS_WORKSPACE="${IOS_WORKSPACE:-ios/saveit.xcworkspace}"
IOS_XCODEPROJ="${IOS_XCODEPROJ:-ios/saveit.xcodeproj}"
IOS_CONFIGURATION="${IOS_CONFIGURATION:-Debug}"
IOS_DESTINATION="${IOS_DESTINATION:-generic/platform=iOS}"

echo "==> 1) Clean caches"
rm -rf ios
rm -rf ~/Library/Developer/Xcode/DerivedData/*

echo "==> 2) Re-generate native iOS project from Expo config"
npx expo prebuild -p ios --clean

echo "==> 3) Install CocoaPods"
cd ios
pod install --repo-update
cd "$ROOT_DIR"

echo "==> 4) Ensure Xcode project has Script Sandboxing disabled (common RN/Expo issue)"
# safe no-op if string not found
sed -i '' 's/ENABLE_USER_SCRIPT_SANDBOXING = YES;/ENABLE_USER_SCRIPT_SANDBOXING = NO;/g' "$IOS_XCODEPROJ/project.pbxproj" || true

echo "==> 5) Build with xcodebuild (with optional team override)"
if [[ -n "${APPLE_TEAM_ID:-}" ]]; then
  xcodebuild \
    -workspace "$IOS_WORKSPACE" \
    -scheme "$IOS_SCHEME" \
    -configuration "$IOS_CONFIGURATION" \
    -destination "$IOS_DESTINATION" \
    DEVELOPMENT_TEAM="$APPLE_TEAM_ID" \
    CODE_SIGN_STYLE=Automatic \
    clean build
else
  xcodebuild \
    -workspace "$IOS_WORKSPACE" \
    -scheme "$IOS_SCHEME" \
    -configuration "$IOS_CONFIGURATION" \
    -destination "$IOS_DESTINATION" \
    clean build
fi

echo ""
echo "✅ iOS clean rebuild done."
echo "Next:"
echo " open $IOS_WORKSPACE"
echo " - Signing & Capabilities -> Automatically manage signing ON"
echo " - Select your Team"
echo " - Run on device/simulator"
