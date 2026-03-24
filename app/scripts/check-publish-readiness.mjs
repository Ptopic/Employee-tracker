import { spawnSync } from "node:child_process";

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    env: process.env,
  });

  return typeof result.status === "number" ? result.status : 1;
}

const checks = [
  ["node", ["-v"]],
  ["npm", ["-v"]],
  ["xcodebuild", ["-version"]],
  ["java", ["-version"]],
  ["fastlane", ["--version"]],
  ["npm", ["run", "publish:ios:raw", "--", "--check"]],
  ["npm", ["run", "publish:android:raw", "--", "--check"]],
];

for (const [command, args] of checks) {
  console.log(`\n==> ${command} ${args.join(" ")}`);
  const status = run(command, args);
  if (status !== 0) {
    process.exit(status);
  }
}

console.log("\nAll publishing checks passed.");
