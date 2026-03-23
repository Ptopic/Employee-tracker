import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const target = process.argv[2];
const isDryRun = process.argv.includes("--dry-run");
const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const appJsonPath = path.join(appRoot, "app.json");

if (!["ios", "android", "all"].includes(target)) {
  console.error(
    "Usage: node scripts/publish-mobile-with-version-bump.mjs <ios|android|all> [--dry-run]",
  );
  process.exit(1);
}

function bumpPatchVersion(version) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) {
    throw new Error(`Unsupported version format: ${version}. Expected x.y.z`);
  }

  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]) + 1;

  return `${major}.${minor}.${patch}`;
}

function runNpmScript(scriptName) {
  if (isDryRun) {
    console.log(`[dry-run] npm run ${scriptName}`);
    return;
  }

  const result = spawnSync("npm", ["run", scriptName], {
    stdio: "inherit",
    cwd: appRoot,
  });

  if (typeof result.status !== "number" || result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const appJson = JSON.parse(readFileSync(appJsonPath, "utf8"));
const currentVersion =
  typeof appJson?.expo?.version === "string" ? appJson.expo.version : null;

if (!currentVersion) {
  console.error("app.json expo.version is missing.");
  process.exit(1);
}

const nextVersion = bumpPatchVersion(currentVersion);

if (isDryRun) {
  console.log(`[dry-run] App version bump: ${currentVersion} -> ${nextVersion}`);
} else {
  appJson.expo.version = nextVersion;
  writeFileSync(appJsonPath, `${JSON.stringify(appJson, null, 2)}\n`);
  console.log(`App version bumped: ${currentVersion} -> ${nextVersion}`);
}

if (target === "ios") {
  runNpmScript("publish:ios:raw");
} else if (target === "android") {
  runNpmScript("publish:android:raw");
} else {
  runNpmScript("publish:ios:raw");
  runNpmScript("publish:android:raw");
}
