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
# FASTLANE_TEAM_ID=RFRVD795TK

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

IOS_SCHEME="${IOS_SCHEME:-saveit}"
IOS_WORKSPACE="${IOS_WORKSPACE:-ios/saveit.xcworkspace}"
IOS_XCODEPROJ="${IOS_XCODEPROJ:-ios/saveit.xcodeproj}"
IOS_CONFIGURATION="${IOS_CONFIGURATION:-Debug}"
IOS_DESTINATION="${IOS_DESTINATION:-generic/platform=iOS}"
APPLE_TEAM_ID="${APPLE_TEAM_ID:-${FASTLANE_TEAM_ID:-}}"

echo "==> 1) Clean caches"
rm -rf ios
rm -rf ~/Library/Developer/Xcode/DerivedData/*

echo "==> 2) Re-generate native iOS project from Expo config"
npx expo prebuild -p ios --clean

echo "==> 3) Install CocoaPods"
cd ios
pod install --repo-update
cd "$ROOT_DIR"

echo "==> 4) Patch Xcode project build settings"
# safe no-op if string not found
sed -i '' 's/ENABLE_USER_SCRIPT_SANDBOXING = YES;/ENABLE_USER_SCRIPT_SANDBOXING = NO;/g' "$IOS_XCODEPROJ/project.pbxproj" || true

if [[ -n "$APPLE_TEAM_ID" ]]; then
  echo "   - Setting DEVELOPMENT_TEAM=$APPLE_TEAM_ID in project.pbxproj"
  sed -E -i '' "s/DEVELOPMENT_TEAM = [A-Z0-9]*;/DEVELOPMENT_TEAM = ${APPLE_TEAM_ID};/g" "$IOS_XCODEPROJ/project.pbxproj" || true
fi

echo "==> 5) Build with xcodebuild"
XCODEBUILD_ARGS=(
  -workspace "$IOS_WORKSPACE"
  -scheme "$IOS_SCHEME"
  -configuration "$IOS_CONFIGURATION"
  -destination "$IOS_DESTINATION"
  -allowProvisioningUpdates
)

if [[ -n "$APPLE_TEAM_ID" ]]; then
  XCODEBUILD_ARGS+=(
    DEVELOPMENT_TEAM="$APPLE_TEAM_ID"
    CODE_SIGN_STYLE=Automatic
  )
else
  echo "⚠️ APPLE_TEAM_ID/FASTLANE_TEAM_ID not set. If signing fails, export one of them and rerun."
fi

xcodebuild "${XCODEBUILD_ARGS[@]}" clean build

echo ""
echo "✅ iOS clean rebuild done."
echo "Next:"
echo " open $IOS_WORKSPACE"
echo " - Signing & Capabilities -> Automatically manage signing ON"
echo " - Select your Team"
echo " - Run on device/simulator"
