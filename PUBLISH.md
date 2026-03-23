# PUBLISH.md — Local mobile publishing (Expo + Fastlane, no EAS cloud)

This guide is the **full checklist** for publishing Android testing builds and iOS TestFlight builds from your own machine.

It is written so you can reuse the same flow across other Expo apps.

---

## 0) What this project already uses

This repo publishes with:

- **Fastlane** (local)
- **Xcode** for iOS build/archive
- **Gradle** for Android bundle
- **App Store Connect API key** (instead of Apple ID password flows)
- **Google Play service account JSON key**

Key scripts:

```bash
npm run check:publish
npm run publish:ios
npm run publish:android
npm run publish:all
```

---

## 1) One-time machine setup (Mac)

### 1.1 Install required tools

```bash
# Xcode from App Store first, then:
xcode-select --install

# Ruby (if missing), then fastlane
sudo gem install fastlane

# Node + npm (recommend nvm)
node -v
npm -v

# Java for Android builds
java -version
```

### 1.2 Xcode first-run tasks

1. Open **Xcode** once
2. Accept license if prompted
3. Xcode → **Settings** → **Accounts** → sign in with Apple account that has App Store Connect access
4. (Optional) Xcode → **Settings** → **Locations** → select latest Command Line Tools

### 1.3 Android first-run tasks

1. Install **Android Studio**
2. Open SDK Manager and install:
   - Android SDK Platform (latest stable)
   - Android SDK Build-Tools
   - Android Platform-Tools
   - Android Command-line tools
3. Ensure `java -version` works in terminal

---

## 2) Environment file for this app

In `app/` you can either do it manually or use the interactive helper.

### Option A: interactive helper (recommended)

```bash
cd app
npm run setup:publish-env
```

### Option B: manual

```bash
cd app
cp .env.example .env
```

Then fill every value.

---

## 3) iOS: how to get App Store Connect keys (step-by-step)

You need these vars:

- `FASTLANE_API_KEY_ID`
- `FASTLANE_API_ISSUER_ID`
- `FASTLANE_API_KEY` (base64 encoded `.p8` contents)

### 3.1 Create API key in App Store Connect

1. Go to: **https://appstoreconnect.apple.com/**
2. Login with account that has admin/app-manager rights
3. Top menu → **Users and Access**
4. Open **Integrations** tab
5. Under **App Store Connect API** click **+** (Generate API Key)
6. Enter:
   - Name: e.g. `fastlane-local-publish`
   - Access: usually **App Manager** (or role with build upload permission)
7. Click **Generate**
8. Download the `.p8` file immediately (Apple shows it only once)

From this screen you get:

- **Key ID** → `FASTLANE_API_KEY_ID`
- **Issuer ID** → `FASTLANE_API_ISSUER_ID`

### 3.2 Convert `.p8` to base64 for `.env`

In terminal:

```bash
base64 -i AuthKey_XXXXXXX.p8 | tr -d '\n'
```

Copy output into:

```env
FASTLANE_API_KEY=...long_base64_string...
```

### 3.3 iOS app identity values

Match these to your app:

- `FASTLANE_BUNDLE_IDENTIFIER` → e.g. `com.petartopic.saveit`
- `IOS_SCHEME` → Xcode scheme (here: `saveit`)
- `IOS_WORKSPACE` → usually `ios/<app>.xcworkspace`
- `IOS_XCODEPROJ` → usually `ios/<app>.xcodeproj`

---

## 4) Android: how to get Google Play upload keys (step-by-step)

You need:

- `PLAY_STORE_JSON_KEY_PATH`
- `ANDROID_RELEASE_KEYSTORE_PATH`
- `ANDROID_RELEASE_KEYSTORE_PASSWORD`
- `ANDROID_RELEASE_KEY_ALIAS`
- `ANDROID_RELEASE_KEY_PASSWORD`

### 4.1 Create Google Play service account + JSON key

#### A) Create/choose Google Cloud project

1. Go to: **https://console.cloud.google.com/**
2. Select existing project (recommended same org) or create new

#### B) Enable API

1. Go to **APIs & Services → Library**
2. Search **Google Play Android Developer API**
3. Click it → **Enable**

#### C) Create service account key

1. Go to **IAM & Admin → Service Accounts**
2. Click **Create Service Account**
3. Name: e.g. `play-publisher-fastlane`
4. Finish creation
5. Open that service account
6. **Keys** tab → **Add Key → Create new key → JSON**
7. Download JSON file

Save file somewhere safe, example:

```text
/Users/<you>/keys/play/saveit-play-service-account.json
```

Set in `.env`:

```env
PLAY_STORE_JSON_KEY_PATH=/Users/<you>/keys/play/saveit-play-service-account.json
```

#### D) Grant permissions in Google Play Console

1. Go to **https://play.google.com/console**
2. Select your app
3. Left menu → **Users and permissions**
4. **Invite new users**
5. Add service account email (looks like `name@project.iam.gserviceaccount.com`)
6. Grant at least rights to upload/edit releases
   - Typically: **Release manager** (or equivalent custom permissions)
7. Save invite/permissions

> If fastlane upload returns permission errors, this step is usually the reason.

### 4.2 Create Android upload keystore (if you don’t already have one)

```bash
keytool -genkeypair \
  -v \
  -storetype JKS \
  -keystore upload-keystore.jks \
  -alias upload \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

Move this `.jks` to a secure local path and set:

```env
ANDROID_RELEASE_KEYSTORE_PATH=/Users/<you>/keys/android/upload-keystore.jks
ANDROID_RELEASE_KEYSTORE_PASSWORD=...
ANDROID_RELEASE_KEY_ALIAS=upload
ANDROID_RELEASE_KEY_PASSWORD=...
```

### 4.3 Play track defaults

This project defaults to safer testing values:

- `PLAY_STORE_TRACK=internal`
- `PLAY_STORE_RELEASE_STATUS=draft`

So uploads go to internal testing/draft first.

---

## 5) App-specific IDs you must keep aligned

For every Expo app, verify these match each other:

- `app.json`:
  - `expo.ios.bundleIdentifier`
  - `expo.android.package`
- `.env`:
  - `FASTLANE_BUNDLE_IDENTIFIER`
  - `PLAY_STORE_PACKAGE_NAME`
- Store consoles:
  - App Store Connect app bundle id
  - Google Play package name

If they mismatch, upload fails.

---

## 6) Validate everything before publishing

Run:

```bash
cd app
npm run check:publish
```

This checks:

- node/npm available
- xcodebuild available
- java available
- fastlane available
- required env vars exist
- required files (Play JSON + keystore) exist
- iOS API key looks valid base64

---

## 7) Publish commands

From `app/`:

### iOS TestFlight

```bash
npm run publish:ios
```

### Android internal testing (Play Console)

```bash
npm run publish:android
```

### Both

```bash
npm run publish:all
```

---

## 8) Where builds appear

### iOS

- App Store Connect → your app → **TestFlight**
- Build may take processing time before testers can install

### Android

- Play Console → your app → **Testing → Internal testing**
- If release status is draft, review and roll out from console

---

## 9) Common failures and fixes

### “Fastlane not found”

Install fastlane and ensure shell PATH is correct:

```bash
fastlane --version
```

### “Missing required env vars”

Open `.env`, fill all required entries from `.env.example`.

### iOS auth errors (401/403)

- Wrong key id / issuer id
- `.p8` not base64 encoded properly
- API key lacks permissions

### Android permission errors

- Service account not granted proper Play Console rights
- Wrong JSON key path

### Android signing errors

- Wrong keystore path
- Wrong alias/passwords
- Keystore does not match expected upload key

### Bundle/package mismatch

Ensure package IDs are identical across config + store listing.

---

## 10) Security hygiene (important)

- Never commit real `.env` secrets
- Never commit `.p8` private keys or Play JSON keys
- Keep keys in a local secure folder (or a secret manager)
- Rotate keys if leaked

Recommended local key folder pattern:

```text
~/keys/mobile/<app-name>/
```

---

## 11) Reusing this on other Expo apps

For a new app, copy these parts:

1. `fastlane/` lanes
2. `scripts/publish-ios-appstore.mjs`
3. `scripts/publish-playstore-raw.mjs`
4. `scripts/publish-mobile-with-version-bump.mjs`
5. `scripts/check-publish-readiness.mjs`
6. `.env.example`

Then only change:

- Bundle/package IDs
- Scheme/workspace names
- API keys and file paths

---

## 12) Quick checklist (TL;DR)

1. `cd app && npm run setup:publish-env` (or copy `.env.example` manually)
2. Fill/confirm iOS + Android secrets/paths
3. `npm run check:publish`
4. `npm run publish:ios`
5. `npm run publish:android`

If this sequence passes, local publishing is set up correctly without EAS cloud builds.
