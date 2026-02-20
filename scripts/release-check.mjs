import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { resolve } from "node:path";

const projectRoot = process.cwd();

const requiredPaths = [
  "dist/index.js",
  "dist/index.d.ts",
  "dist/config-cli.js",
  "README.md",
  "LICENSE",
];

async function ensurePathExists(path) {
  const abs = resolve(projectRoot, path);
  await access(abs, constants.F_OK);
}

async function readJson(path) {
  const abs = resolve(projectRoot, path);
  const content = await readFile(abs, "utf8");
  return JSON.parse(content);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  for (const path of requiredPaths) {
    await ensurePathExists(path);
  }

  const pkg = await readJson("package.json");

  assert(typeof pkg.name === "string" && pkg.name.length > 0, "package.json 缺少有效 name");
  assert(typeof pkg.version === "string" && pkg.version.length > 0, "package.json 缺少有效 version");
  assert(pkg.main === "dist/index.js", "package.json main 必须指向 dist/index.js");
  assert(pkg.types === "dist/index.d.ts", "package.json types 必须指向 dist/index.d.ts");
  assert(pkg.bin?.["metaso-mcp"] === "./dist/index.js", "package.json bin.metaso-mcp 必须指向 ./dist/index.js");
  assert(Array.isArray(pkg.files) && pkg.files.includes("dist"), "package.json files 必须包含 dist");
  assert(pkg.publishConfig?.access === "public", "package.json publishConfig.access 必须是 public");

  console.log("Release check passed.");
}

main().catch((error) => {
  console.error("Release check failed:", error.message);
  process.exit(1);
});
