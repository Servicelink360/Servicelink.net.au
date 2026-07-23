import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.join(scriptDir, "..");
const nodeArgs = ["--env-file=.env"];

const extraArgs = process.argv.slice(2);

function run(scriptName) {
  const scriptPath = path.join(scriptDir, scriptName);
  const result = spawnSync(process.execPath, [...nodeArgs, scriptPath, ...extraArgs], {
    stdio: "inherit",
    cwd: webRoot,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("Step 1/2 — Gemini service descriptions\n");
run("seed-gemini-services.mjs");

console.log("\nStep 2/2 — Gemini location service pages\n");
run("seed-gemini-location-pages.mjs");

console.log("\nGemini SEO content seed complete.");
