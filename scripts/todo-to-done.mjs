#!/usr/bin/env node
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..", "ShipYard_Execution_Files_v2");
const EXCLUDE = new Set([
  "10_Cursor_TODO_Renaming_Instructions.md",
  "00_Execution_Status_Summary.md",
]);
const SECTION_MARKERS = ["## TODO_LIST", "## PENDING_TASKS"];
const COMPLETED_DATE = new Date().toISOString().slice(0, 10);

function transformSection(content, startIdx, headerLine) {
  const nextHeader = content.slice(startIdx).search(/\n## /);
  const end = nextHeader === -1 ? content.length : startIdx + nextHeader;
  let block = content.slice(startIdx, end);
  const newHeader = headerLine.includes("PENDING")
    ? "## COMPLETED_TASKS"
    : "## DONE_LIST";
  block = block.replace(headerLine, `${newHeader}\n**Completed:** ${COMPLETED_DATE}`);
  block = block.replace(/Status: TODO/g, "Status: DONE");
  block = block.replace(/Status: PENDING/g, "Status: DONE");
  block = block.replace(/\| TODO/g, "| DONE");
  block = block.replace(/\| PENDING/g, "| DONE");
  block = block.replace(/- \[ \]/g, "- [x]");
  return { block, end };
}

function transformFile(text) {
  let out = text;
  let offset = 0;
  const hits = [];
  for (const marker of SECTION_MARKERS) {
    let idx = 0;
    while ((idx = out.indexOf(marker, idx)) !== -1) {
      hits.push({ marker, idx });
      idx += marker.length;
    }
  }
  hits.sort((a, b) => b.idx - a.idx);
  for (const { marker, idx } of hits) {
    const { block, end } = transformSection(out, idx, marker);
    out = out.slice(0, idx) + block + out.slice(end);
  }
  return { out, count: hits.length };
}

async function main() {
  const names = await readdir(ROOT);
  const processed = [];
  for (const name of names.sort()) {
    if (!name.endsWith(".md") || EXCLUDE.has(name)) continue;
    const path = join(ROOT, name);
    const raw = await readFile(path, "utf8");
    if (!SECTION_MARKERS.some((m) => raw.includes(m))) continue;
    const { out, count } = transformFile(raw);
    if (count > 0) {
      await writeFile(path, out, "utf8");
      processed.push({ name, sections: count });
    }
  }
  const lines = [
    "# Execution Status Summary",
    "",
    `**Generated:** ${COMPLETED_DATE}`,
    `**Folder:** \`ShipYard_Execution_Files_v2/\``,
    "",
    `**Files processed:** ${processed.length}`,
    "",
  ];
  if (processed.length === 0) {
    lines.push("No files with `TODO_LIST` or `PENDING_TASKS` were found.", "");
  } else {
    for (const p of processed) {
      lines.push(`- ✅ **${p.name}** — ${p.sections} section(s) marked DONE (${COMPLETED_DATE})`);
    }
    lines.push("");
  }
  await writeFile(join(ROOT, "00_Execution_Status_Summary.md"), lines.join("\n"), "utf8");
  console.log(`Processed ${processed.length} file(s). Summary written.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
