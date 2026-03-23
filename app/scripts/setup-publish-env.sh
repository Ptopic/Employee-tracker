#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENV_EXAMPLE="${APP_DIR}/.env.example"
ENV_FILE="${APP_DIR}/.env"

if [[ ! -f "${ENV_EXAMPLE}" ]]; then
  echo "❌ Missing ${ENV_EXAMPLE}."
  exit 1
fi

if [[ -f "${ENV_FILE}" ]]; then
  read -r -p "⚠️  ${ENV_FILE} already exists. Overwrite? (y/N): " OVERWRITE
  if [[ ! "${OVERWRITE:-}" =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
  fi
fi

cp "${ENV_EXAMPLE}" "${ENV_FILE}"

echo ""
echo "🔧 Interactive .env setup"
echo "Press Enter to keep default shown in [brackets]."
echo ""

prompt() {
  local key="$1"
  local current="$2"
  local value
  read -r -p "${key} [${current}]: " value
  if [[ -z "${value}" ]]; then
    printf '%s' "${current}"
  else
    printf '%s' "${value}"
  fi
}

prompt_secret() {
  local key="$1"
  local current="$2"
  local value
  read -r -s -p "${key} [hidden]: " value
  echo ""
  if [[ -z "${value}" ]]; then
    printf '%s' "${current}"
  else
    printf '%s' "${value}"
  fi
}

get_current() {
  local key="$1"
  local line
  line=$(grep -E "^${key}=" "${ENV_FILE}" || true)
  printf '%s' "${line#*=}"
}

set_kv() {
  local key="$1"
  local value="$2"
  python3 - <<PY
from pathlib import Path
path = Path(${ENV_FILE@Q})
key = ${key@Q}
value = ${value@Q}
lines = path.read_text().splitlines()
out = []
replaced = False
for line in lines:
    if line.startswith(key + "="):
        out.append(f"{key}={value}")
        replaced = True
    else:
        out.append(line)
if not replaced:
    out.append(f"{key}={value}")
path.write_text("\n".join(out) + "\n")
PY
}

# Runtime
set_kv "EXPO_PUBLIC_API_URL" "$(prompt "EXPO_PUBLIC_API_URL" "$(get_current EXPO_PUBLIC_API_URL)")"
set_kv "EXPO_PUBLIC_GOOGLE_CLIENT_ID" "$(prompt "EXPO_PUBLIC_GOOGLE_CLIENT_ID" "$(get_current EXPO_PUBLIC_GOOGLE_CLIENT_ID)")"
set_kv "EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID" "$(prompt "EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID" "$(get_current EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID)")"
set_kv "EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID" "$(prompt "EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID" "$(get_current EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID)")"

# iOS
set_kv "FASTLANE_API_KEY_ID" "$(prompt "FASTLANE_API_KEY_ID" "$(get_current FASTLANE_API_KEY_ID)")"
set_kv "FASTLANE_API_ISSUER_ID" "$(prompt "FASTLANE_API_ISSUER_ID" "$(get_current FASTLANE_API_ISSUER_ID)")"
set_kv "FASTLANE_API_KEY" "$(prompt_secret "FASTLANE_API_KEY (base64 p8)" "$(get_current FASTLANE_API_KEY)")"
set_kv "FASTLANE_BUNDLE_IDENTIFIER" "$(prompt "FASTLANE_BUNDLE_IDENTIFIER" "$(get_current FASTLANE_BUNDLE_IDENTIFIER)")"
set_kv "FASTLANE_TEAM_ID" "$(prompt "FASTLANE_TEAM_ID" "$(get_current FASTLANE_TEAM_ID)")"
set_kv "IOS_SCHEME" "$(prompt "IOS_SCHEME" "$(get_current IOS_SCHEME)")"
set_kv "IOS_WORKSPACE" "$(prompt "IOS_WORKSPACE" "$(get_current IOS_WORKSPACE)")"
set_kv "IOS_XCODEPROJ" "$(prompt "IOS_XCODEPROJ" "$(get_current IOS_XCODEPROJ)")"
set_kv "IOS_OUTPUT_DIR" "$(prompt "IOS_OUTPUT_DIR" "$(get_current IOS_OUTPUT_DIR)")"
set_kv "IOS_OUTPUT_NAME" "$(prompt "IOS_OUTPUT_NAME" "$(get_current IOS_OUTPUT_NAME)")"
set_kv "IOS_SKIP_WAITING_FOR_BUILD_PROCESSING" "$(prompt "IOS_SKIP_WAITING_FOR_BUILD_PROCESSING" "$(get_current IOS_SKIP_WAITING_FOR_BUILD_PROCESSING)")"

# Android
set_kv "PLAY_STORE_JSON_KEY_PATH" "$(prompt "PLAY_STORE_JSON_KEY_PATH" "$(get_current PLAY_STORE_JSON_KEY_PATH)")"
set_kv "PLAY_STORE_PACKAGE_NAME" "$(prompt "PLAY_STORE_PACKAGE_NAME" "$(get_current PLAY_STORE_PACKAGE_NAME)")"
set_kv "PLAY_STORE_TRACK" "$(prompt "PLAY_STORE_TRACK" "$(get_current PLAY_STORE_TRACK)")"
set_kv "PLAY_STORE_RELEASE_STATUS" "$(prompt "PLAY_STORE_RELEASE_STATUS" "$(get_current PLAY_STORE_RELEASE_STATUS)")"
set_kv "ANDROID_RELEASE_KEYSTORE_PATH" "$(prompt "ANDROID_RELEASE_KEYSTORE_PATH" "$(get_current ANDROID_RELEASE_KEYSTORE_PATH)")"
set_kv "ANDROID_RELEASE_KEYSTORE_PASSWORD" "$(prompt_secret "ANDROID_RELEASE_KEYSTORE_PASSWORD" "$(get_current ANDROID_RELEASE_KEYSTORE_PASSWORD)")"
set_kv "ANDROID_RELEASE_KEY_ALIAS" "$(prompt "ANDROID_RELEASE_KEY_ALIAS" "$(get_current ANDROID_RELEASE_KEY_ALIAS)")"
set_kv "ANDROID_RELEASE_KEY_PASSWORD" "$(prompt_secret "ANDROID_RELEASE_KEY_PASSWORD" "$(get_current ANDROID_RELEASE_KEY_PASSWORD)")"

echo ""
echo "✅ Wrote ${ENV_FILE}"
echo "Next:"
echo "  cd app"
echo "  npm run check:publish"
