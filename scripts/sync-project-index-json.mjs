#!/usr/bin/env node
/**
 * Regenerate CONTROL TOWER 06_PROJECT_INDEX/PROJECT_INDEX.json from PROJECT_INDEX.md
 */
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const INDEX_DIR = join(
  process.env.HOME ?? "/home/shane",
  "CONTROL TOWER",
  "06_PROJECT_INDEX"
);
const MD_PATH = join(INDEX_DIR, "PROJECT_INDEX.md");
const JSON_PATH = join(INDEX_DIR, "PROJECT_INDEX.json");
const ENTRY_RE = /^-\s+`([^`]+)`\s*=\s*(.+?)\s*$/;

const md = await readFile(MD_PATH, "utf8");
const projects = [];
for (const line of md.split("\n")) {
  const m = line.trim().match(ENTRY_RE);
  if (m) projects.push({ slug: m[1], name: m[2] });
}

const payload = {
  generated: new Date().toISOString().slice(0, 10),
  source: "06_PROJECT_INDEX/PROJECT_INDEX.md",
  note: "Mirror for ShipYard Web D1; CLI canonical source remains PROJECT_INDEX.md",
  projects,
};

await writeFile(JSON_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(`Wrote ${projects.length} projects to ${JSON_PATH}`);
