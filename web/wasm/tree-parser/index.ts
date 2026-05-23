/** AssemblyScript tree manifest parser — one path per line. */

function trimLine(line: string): string {
  let s = line.trim();
  if (s.length > 0 && (s.charCodeAt(0) == 45 || s.charCodeAt(0) == 42)) {
    let i = 0;
    while (i < s.length) {
      const c = s.charCodeAt(i);
      if (c == 45 || c == 42 || c == 32) {
        i++;
        continue;
      }
      break;
    }
    if (i > 0) s = s.substring(i).trim();
  }
  return s.replaceAll("\\", "/");
}

function escapeJsonString(value: string): string {
  let out = "";
  for (let i = 0; i < value.length; i++) {
    const c = value.charCodeAt(i);
    if (c == 34 || c == 92) out += "\\";
    out += String.fromCharCode(c);
  }
  return out;
}

export function parseManifest(text: string): string {
  const lines = text.split("\n");
  let json = "[";
  let first = true;
  for (let i = 0; i < lines.length; i++) {
    const path = trimLine(lines[i]);
    if (path.length == 0) continue;
    if (path.charCodeAt(0) == 35) continue;
    if (!first) json += ",";
    first = false;
    const parts = path.split("/");
    const depth = parts.length > 0 ? parts.length : 1;
    let density = 1.0 / <f64>depth;
    if (density > 1.0) density = 1.0;
    json += `{"path":"${escapeJsonString(path)}","tag":"unchanged","density_score":${density.toString()}}`;
  }
  json += "]";
  return json;
}
