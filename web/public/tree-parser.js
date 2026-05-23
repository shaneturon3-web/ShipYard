/** Tree manifest parser — WASM (AssemblyScript) primary, JS fallback. */
const WASM_URL = "/tree-parser.wasm";

let wasmExports = null;

function parseTreeManifestJs(text) {
  const lines = text
    .split("\n")
    .map((l) => l.trim().replace(/^[-*]\s*/, "").replace(/\\/g, "/"))
    .filter((line) => line && !line.startsWith("#"));
  return lines.map((path) => ({
    path,
    tag: "unchanged",
    density_score: Math.min(1, 1 / Math.max(1, path.split("/").length)),
  }));
}

async function loadWasm() {
  if (wasmExports) return wasmExports;
  const resp = await fetch(WASM_URL);
  if (!resp.ok) throw new Error(`WASM fetch ${resp.status}`);
  const { instance } = await WebAssembly.instantiateStreaming(resp, {
    env: {
      abort: () => {
        throw new Error("WASM abort");
      },
    },
  });
  wasmExports = instance.exports;
  return wasmExports;
}

async function parseTreeManifestWasm(text) {
  const exports = await loadWasm();
  const parseManifest = exports.parseManifest;
  if (!parseManifest) throw new Error("parseManifest export missing");
  const json = parseManifest(text);
  return JSON.parse(json);
}

async function parseTreeManifest(text) {
  try {
    return await parseTreeManifestWasm(text);
  } catch (err) {
    console.warn("tree-parser WASM fallback:", err);
    return parseTreeManifestJs(text);
  }
}
