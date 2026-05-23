/** Client-side tree parser (JS MVP; WASM module per blueprint). */
function parseTreeManifest(text) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const nodes = [];
  for (const line of lines) {
    const path = line.replace(/^[-*]\s*/, "").replace(/\\/g, "/");
    if (!path || path.startsWith("#")) continue;
    nodes.push({
      path,
      tag: "unchanged",
      density_score: Math.min(1, 1 / Math.max(1, path.split("/").length)),
    });
  }
  return nodes;
}
