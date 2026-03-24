import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
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
	"FASTLANE_API_KEY_ID",
	"FASTLANE_API_ISSUER_ID",
	"FASTLANE_API_KEY",
];

function getMissingEnvVars(envVars) {
	return envVars.filter((key) => !process.env[key]?.trim());
}

function isValidBase64(value) {
	if (!value) {
		return false;
	}

	if (value.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(value)) {
		return false;
	}

	try {
		return Buffer.from(value, "base64").toString("base64") === value;
	} catch {
		return false;
	}
}

function getApiKeyBase64Value(input) {
	const trimmed = input?.trim();

	if (!trimmed) {
		return null;
	}

	const withoutWrappingQuotes =
		(trimmed.startsWith('"') && trimmed.endsWith('"')) ||
		(trimmed.startsWith("'") && trimmed.endsWith("'"))
			? trimmed.slice(1, -1)
			: trimmed;

	const normalizedBase64 = withoutWrappingQuotes
		.replace(/\s+/g, "")
		.replace(/-/g, "+")
		.replace(/_/g, "/");
	if (isValidBase64(normalizedBase64)) {
		return normalizedBase64;
	}

	const sanitizedBase64 = normalizedBase64.replace(/[^A-Za-z0-9+/=]/g, "");
	if (isValidBase64(sanitizedBase64)) {
		return sanitizedBase64;
	}

	const normalizedPem = withoutWrappingQuotes.replace(/\\n/g, "\n");
	if (normalizedPem.includes("-----BEGIN PRIVATE KEY-----")) {
		return Buffer.from(normalizedPem, "utf8").toString("base64");
	}

	const keyPath = path.isAbsolute(withoutWrappingQuotes)
		? withoutWrappingQuotes
		: path.join(appRoot, withoutWrappingQuotes);
	if (existsSync(keyPath)) {
		const keyContent = readFileSync(keyPath, "utf8").trim();
		if (keyContent.includes("-----BEGIN PRIVATE KEY-----")) {
			return Buffer.from(keyContent, "utf8").toString("base64");
		}
	}

	return null;
}

function loadPublishEnv() {
	if (!existsSync(envFilePath)) {
		return;
	}

	process.loadEnvFile(envFilePath);
}

function discoverFirstFileWithExtension(directoryPath, extension) {
	if (!existsSync(directoryPath)) {
		return null;
	}

	for (const entry of readdirSync(directoryPath, { withFileTypes: true })) {
		if (entry.isDirectory() && entry.name.endsWith(extension)) {
			return path.join(directoryPath, entry.name);
		}
	}

	return null;
}

function discoverIosWorkspacePath() {
	if (process.env.IOS_WORKSPACE?.trim()) {
		return path.isAbsolute(process.env.IOS_WORKSPACE)
			? process.env.IOS_WORKSPACE
			: path.join(appRoot, process.env.IOS_WORKSPACE);
	}

	return discoverFirstFileWithExtension(
		path.join(appRoot, "ios"),
		".xcworkspace",
	);
}

function discoverIosXcodeprojPath() {
	if (process.env.IOS_XCODEPROJ?.trim()) {
		return path.isAbsolute(process.env.IOS_XCODEPROJ)
			? process.env.IOS_XCODEPROJ
			: path.join(appRoot, process.env.IOS_XCODEPROJ);
	}

	return discoverFirstFileWithExtension(
		path.join(appRoot, "ios"),
		".xcodeproj",
	);
}

function toRelativeFromAppRoot(inputPath) {
	return path.relative(appRoot, inputPath).replaceAll("\\", "/");
}

function ensureIosProjectGenerated() {
	const prebuild = spawnSync(
		"npx",
		["expo", "prebuild", "--platform", "ios", "--non-interactive"],
		{
			stdio: "inherit",
			cwd: appRoot,
		},
	);

	if (typeof prebuild.status !== "number" || prebuild.status !== 0) {
		console.error("Failed to generate iOS project with Expo prebuild.");
		process.exit(prebuild.status ?? 1);
	}
}

function resolveIosProjectPaths({ allowGenerate }) {
	let workspacePath = discoverIosWorkspacePath();
	let xcodeprojPath = discoverIosXcodeprojPath();

	if ((!workspacePath || !xcodeprojPath) && allowGenerate) {
		console.log(
			"iOS native project files not found. Running Expo prebuild for iOS...",
		);
		ensureIosProjectGenerated();
		workspacePath = discoverIosWorkspacePath();
		xcodeprojPath = discoverIosXcodeprojPath();
	}

	if (!workspacePath || !xcodeprojPath) {
		return null;
	}

	if (!existsSync(workspacePath) || !existsSync(xcodeprojPath)) {
		return null;
	}

	return {
		workspacePath,
		xcodeprojPath,
		workspaceRelativePath: toRelativeFromAppRoot(workspacePath),
		xcodeprojRelativePath: toRelativeFromAppRoot(xcodeprojPath),
	};
}

loadPublishEnv();

if (isDryRun) {
	console.log("[dry-run] fastlane ios release_local");
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

	const iosPaths = resolveIosProjectPaths({ allowGenerate: false });
	if (!iosPaths) {
		console.error(
			"iOS native project is missing. Run 'npx expo prebuild --platform ios' (or execute publish without --check to auto-generate it).",
		);
		process.exit(1);
	}

	process.env.IOS_WORKSPACE = iosPaths.workspaceRelativePath;
	process.env.IOS_XCODEPROJ = iosPaths.xcodeprojRelativePath;

	const apiKeyBase64 = getApiKeyBase64Value(process.env.FASTLANE_API_KEY);
	if (!apiKeyBase64) {
		console.error(
			"FASTLANE_API_KEY must be valid base64 or raw .p8 private key content.",
		);
		process.exit(1);
	}

	process.env.FASTLANE_API_KEY = apiKeyBase64;

	console.log("iOS publish env vars are configured.");
	process.exit(0);
}

const missing = getMissingEnvVars(requiredEnvVars);
if (missing.length > 0) {
	console.error(`Missing required env vars: ${missing.join(", ")}`);
	process.exit(1);
}

const iosPaths = resolveIosProjectPaths({ allowGenerate: true });
if (!iosPaths) {
	console.error(
		"Could not locate generated iOS workspace/project even after prebuild. Set IOS_WORKSPACE and IOS_XCODEPROJ to valid paths.",
	);
	process.exit(1);
}

process.env.IOS_WORKSPACE = iosPaths.workspaceRelativePath;
process.env.IOS_XCODEPROJ = iosPaths.xcodeprojRelativePath;

const apiKeyBase64 = getApiKeyBase64Value(process.env.FASTLANE_API_KEY);
if (!apiKeyBase64) {
	console.error(
		"FASTLANE_API_KEY must be valid base64 or raw .p8 private key content.",
	);
	process.exit(1);
}

process.env.FASTLANE_API_KEY = apiKeyBase64;

const result = spawnSync("fastlane", ["ios", "release_local"], {
	stdio: "inherit",
	cwd: appRoot,
});

if (typeof result.status !== "number" || result.status !== 0) {
	process.exit(result.status ?? 1);
}
