import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const isDryRun = process.argv.includes("--dry-run");
const isCheck = process.argv.includes("--check");
const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const requiredEnvVars = [
  "PLAY_STORE_JSON_KEY_PATH",
  "ANDROID_RELEASE_KEYSTORE_PATH",
  "ANDROID_RELEASE_KEYSTORE_PASSWORD",
  "ANDROID_RELEASE_KEY_ALIAS",
  "ANDROID_RELEASE_KEY_PASSWORD",
];

function getMissingEnvVars(envVars) {
  return envVars.filter((key) => !process.env[key]?.trim());
}

function resolveFromAppRoot(inputPath) {
  return path.isAbsolute(inputPath) ? inputPath : path.join(appRoot, inputPath);
}

if (isDryRun) {
  console.log("[dry-run] fastlane android release_local");
  process.exit(0);
}

if (isCheck) {
  const checkResult = spawnSync("fastlane", ["--version"], {
    stdio: "pipe",
    encoding: "utf8",
  });

  if (typeof checkResult.status !== "number" || checkResult.status !== 0) {
    console.error(
      "Fastlane not found in current environment. Install/configure Fastlane before publishing.",
    );
    process.exit(1);
  }

  const versionText =
    typeof checkResult.stdout === "string" ? checkResult.stdout.trim() : "";
  console.log(`Fastlane detected${versionText ? `: ${versionText}` : "."}`);

  const missing = getMissingEnvVars(requiredEnvVars);
  if (missing.length > 0) {
    console.error(`Missing required env vars: ${missing.join(", ")}`);
    process.exit(1);
  }

  const playStoreKeyPath = resolveFromAppRoot(process.env.PLAY_STORE_JSON_KEY_PATH);
  const keystorePath = resolveFromAppRoot(process.env.ANDROID_RELEASE_KEYSTORE_PATH);

  if (!existsSync(playStoreKeyPath)) {
    console.error(`PLAY_STORE_JSON_KEY_PATH file not found: ${playStoreKeyPath}`);
    process.exit(1);
  }

  if (!existsSync(keystorePath)) {
    console.error(`ANDROID_RELEASE_KEYSTORE_PATH file not found: ${keystorePath}`);
    process.exit(1);
  }

  console.log("Android publish env vars are configured.");
  process.exit(0);
}

const missing = getMissingEnvVars(requiredEnvVars);
if (missing.length > 0) {
  console.error(`Missing required env vars: ${missing.join(", ")}`);
  process.exit(1);
}

const result = spawnSync("fastlane", ["android", "release_local"], {
  stdio: "inherit",
  cwd: appRoot,
});

if (typeof result.status !== "number" || result.status !== 0) {
  process.exit(result.status ?? 1);
}
