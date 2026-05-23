#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const out = join(dir, "../../public/tree-parser.wasm");
const asc = join(dir, "../../node_modules/.bin/asc");

const r = spawnSync(
  asc,
  [join(dir, "index.ts"), "-o", out, "-O", "--exportRuntime", "--runtime", "stub"],
  { stdio: "inherit", encoding: "utf8" },
);
process.exit(r.status ?? 1);
