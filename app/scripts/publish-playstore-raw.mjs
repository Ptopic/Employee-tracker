import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const isDryRun = process.argv.includes("--dry-run");
const isCheck = process.argv.includes("--check");
const appRoot = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"..",
);
const envFilePath = path.join(appRoot, ".env");
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

function ensureAndroidProjectGenerated() {
	if (existsSync(path.join(appRoot, "android", "settings.gradle"))) {
		return;
	}

	console.log(
		"Android native project files not found. Running Expo prebuild for Android...",
	);

	const prebuild = spawnSync(
		"npx",
		["expo", "prebuild", "--platform", "android", "--non-interactive"],
		{
			stdio: "inherit",
			cwd: appRoot,
		},
	);

	if (typeof prebuild.status !== "number" || prebuild.status !== 0) {
		console.error("Failed to generate Android project with Expo prebuild.");
		process.exit(prebuild.status ?? 1);
	}
}

function loadPublishEnv() {
	if (!existsSync(envFilePath)) {
		return;
	}

	process.loadEnvFile(envFilePath);
}

function getFastlaneEnv() {
	const fastlaneEnv = { ...process.env };
	const androidHome = fastlaneEnv.ANDROID_HOME?.trim();
	const androidSdkRoot = fastlaneEnv.ANDROID_SDK_ROOT?.trim();

	if (androidHome && androidSdkRoot && androidHome !== androidSdkRoot) {
		fastlaneEnv.ANDROID_SDK_ROOT = androidHome;
	}

	if (!androidHome && androidSdkRoot) {
		fastlaneEnv.ANDROID_HOME = androidSdkRoot;
	}

	if (androidHome && !androidSdkRoot) {
		fastlaneEnv.ANDROID_SDK_ROOT = androidHome;
	}

	return fastlaneEnv;
}

function getPlayStorePackageName() {
	const envPackageName = process.env.PLAY_STORE_PACKAGE_NAME?.trim();
	if (envPackageName) {
		return envPackageName;
	}

	const appJsonPath = path.join(appRoot, "app.json");
	if (!existsSync(appJsonPath)) {
		return null;
	}

	try {
		const appJson = JSON.parse(readFileSync(appJsonPath, "utf8"));
		return appJson?.expo?.android?.package?.trim() || null;
	} catch {
		return null;
	}
}

function getServiceAccountEmail(jsonKeyPath) {
	try {
		const json = JSON.parse(readFileSync(jsonKeyPath, "utf8"));
		const email = json?.client_email;
		return typeof email === "string" && email.trim() ? email.trim() : null;
	} catch {
		return null;
	}
}

loadPublishEnv();
ensureAndroidProjectGenerated();

if (isDryRun) {
	console.log("[dry-run] fastlane android release_local");
	process.exit(0);
}

if (isCheck) {
	const fastlaneEnv = getFastlaneEnv();
	const checkResult = spawnSync("fastlane", ["--version"], {
		stdio: "pipe",
		encoding: "utf8",
		env: fastlaneEnv,
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

	const playStoreKeyPath = resolveFromAppRoot(
		process.env.PLAY_STORE_JSON_KEY_PATH,
	);
	const keystorePath = resolveFromAppRoot(
		process.env.ANDROID_RELEASE_KEYSTORE_PATH,
	);

	if (!existsSync(playStoreKeyPath)) {
		console.error(
			`PLAY_STORE_JSON_KEY_PATH file not found: ${playStoreKeyPath}`,
		);
		process.exit(1);
	}

	if (!existsSync(keystorePath)) {
		console.error(
			`ANDROID_RELEASE_KEYSTORE_PATH file not found: ${keystorePath}`,
		);
		process.exit(1);
	}

	const playStorePackageName = getPlayStorePackageName();
	if (!playStorePackageName) {
		console.error(
			"Could not determine PLAY_STORE_PACKAGE_NAME. Set it in .env or app.json (expo.android.package).",
		);
		process.exit(1);
	}

	const playTrack = process.env.PLAY_STORE_TRACK?.trim() || "internal";
	const serviceAccountEmail = getServiceAccountEmail(playStoreKeyPath);
	const apiProbe = spawnSync(
		"fastlane",
		[
			"run",
			"google_play_track_version_codes",
			`package_name:${playStorePackageName}`,
			`json_key:${playStoreKeyPath}`,
			`track:${playTrack}`,
		],
		{
			stdio: "pipe",
			encoding: "utf8",
			env: fastlaneEnv,
		},
	);

	if (typeof apiProbe.status !== "number" || apiProbe.status !== 0) {
		const stderrText =
			typeof apiProbe.stderr === "string" ? apiProbe.stderr.trim() : "";
		const stdoutText =
			typeof apiProbe.stdout === "string" ? apiProbe.stdout.trim() : "";
		const outputText = [stderrText, stdoutText].filter(Boolean).join("\n");

		if (outputText.includes("Package not found")) {
			const serviceAccountHint = serviceAccountEmail
				? ` Service account to grant: ${serviceAccountEmail}.`
				: "";
			console.error(
				`Google Play package '${playStorePackageName}' was not found for this service account. ` +
					"Create/import that app in Play Console, grant the service account access, or set PLAY_STORE_PACKAGE_NAME to the correct existing package." +
					serviceAccountHint,
			);
		} else {
			console.error("Google Play API validation failed.");
			if (outputText) {
				console.error(outputText);
			}
		}
		process.exit(1);
	}

	console.log("Android publish env vars and Play API access are configured.");
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
	env: getFastlaneEnv(),
});

if (typeof result.status !== "number" || result.status !== 0) {
	process.exit(result.status ?? 1);
}
