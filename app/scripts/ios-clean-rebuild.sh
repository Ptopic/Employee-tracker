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
# IOS_RUN_AFTER_BUILD=true
# IOS_SIMULATOR_NAME='iPhone 16'
# APPLE_TEAM_ID=RFRVD795TK
# FASTLANE_TEAM_ID=RFRVD795TK

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

IOS_SCHEME="${IOS_SCHEME:-saveit}"
IOS_WORKSPACE="${IOS_WORKSPACE:-ios/saveit.xcworkspace}"
IOS_XCODEPROJ="${IOS_XCODEPROJ:-ios/saveit.xcodeproj}"
IOS_CONFIGURATION="${IOS_CONFIGURATION:-Debug}"
IOS_DESTINATION="${IOS_DESTINATION:-generic/platform=iOS}"
IOS_RUN_AFTER_BUILD="${IOS_RUN_AFTER_BUILD:-false}"
IOS_SIMULATOR_NAME="${IOS_SIMULATOR_NAME:-}"
APPLE_TEAM_ID="${APPLE_TEAM_ID:-${FASTLANE_TEAM_ID:-}}"

echo "==> Xcode version"
xcodebuild -version || true

echo "==> 1) Deep clean iOS/native caches"
rm -rf ios
rm -rf ~/Library/Developer/Xcode/DerivedData/*
rm -rf ~/Library/Developer/Xcode/ModuleCache.noindex
rm -rf ~/Library/Caches/CocoaPods
rm -rf ~/Library/Caches/org.cocoapods.CocoaPods

echo "==> 2) Force New Architecture for pod install"
unset RCT_NEW_ARCH_ENABLED

echo "==> 3) Re-generate native iOS project from Expo config"
npx expo prebuild -p ios --clean

echo "==> 4) Install CocoaPods (deep reset)"
cd ios
pod deintegrate
RCT_NEW_ARCH_ENABLED=1 pod install --repo-update
cd "$ROOT_DIR"

echo "==> 5) Patch Xcode project build settings"
# safe no-op if string not found
sed -i '' 's/ENABLE_USER_SCRIPT_SANDBOXING = YES;/ENABLE_USER_SCRIPT_SANDBOXING = NO;/g' "$IOS_XCODEPROJ/project.pbxproj" || true

if [[ -n "$APPLE_TEAM_ID" ]]; then
  echo "   - Setting DEVELOPMENT_TEAM=$APPLE_TEAM_ID in project.pbxproj"
  sed -E -i '' "s/DEVELOPMENT_TEAM = [A-Z0-9]*;/DEVELOPMENT_TEAM = ${APPLE_TEAM_ID};/g" "$IOS_XCODEPROJ/project.pbxproj" || true
fi

echo "==> 6) Build with xcodebuild"
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

if [[ "$IOS_RUN_AFTER_BUILD" == "true" ]]; then
  echo "==> 7) Launch app via Expo run:ios"
  if [[ -n "$IOS_SIMULATOR_NAME" ]]; then
    npx expo run:ios --simulator "$IOS_SIMULATOR_NAME"
  else
    npx expo run:ios --simulator
  fi
fi

echo ""
echo "✅ iOS clean rebuild done."
echo "Tip: if you still see Swift/modulemap errors, make sure you are on stable Xcode (not beta)."
echo "Next:"
echo " open $IOS_WORKSPACE"
echo " - Signing & Capabilities -> Automatically manage signing ON"
echo " - Select your Team"
echo " - Run on device/simulator"
