/** @param {Record<string, unknown>} data */
function renderProjects(data) {
  const projects = data.projects || [];
  if (!projects.length) {
    return '<p class="text-slate-500">No projects in D1. Run: npm run db:local</p>';
  }
  const rows = projects
    .map((p) => {
      const ready = p.handoff_ready ? "Yes" : "No";
      const readyClass = p.handoff_ready
        ? "text-emerald-400"
        : "text-slate-400";
      return `<tr class="border-t border-slate-800">
        <td class="py-3 pr-4 font-mono text-cyan-300">${p.slug}</td>
        <td class="py-3 pr-4">${escapeHtml(p.name)}</td>
        <td class="py-3 pr-4">${escapeHtml(p.phase)}</td>
        <td class="py-3 pr-4">${escapeHtml(p.sync_state)}</td>
        <td class="py-3 pr-4 ${readyClass}">${ready}</td>
        <td class="py-3">
          <a class="text-cyan-400 hover:underline text-sm" href="/api/audit/${p.slug}" target="_blank">audit</a>
        </td>
      </tr>`;
    })
    .join("");

  return `<div class="overflow-x-auto">
    <table class="w-full text-sm text-left">
      <thead class="text-slate-400">
        <tr>
          <th class="pb-2 pr-4">Slug</th>
          <th class="pb-2 pr-4">Name</th>
          <th class="pb-2 pr-4">Phase</th>
          <th class="pb-2 pr-4">Sync</th>
          <th class="pb-2 pr-4">Handoff ready</th>
          <th class="pb-2">API</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

/** @param {string} s */
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

document.body.addEventListener("htmx:beforeSwap", (ev) => {
  const detail = /** @type {CustomEvent} */ (ev).detail;
  if (detail.target?.id !== "project-list") return;
  if (!detail.xhr || detail.xhr.responseURL?.includes("/api/projects") === false) return;
  try {
    const data = JSON.parse(detail.xhr.responseText);
    detail.serverResponse = renderProjects(data);
    detail.shouldSwap = true;
    detail.isError = false;
  } catch {
    /* keep default */
  }
});

function orchOut(text) {
  const el = document.getElementById("orch-result");
  if (el) el.textContent = text;
}

document.getElementById("btn-parse-tree")?.addEventListener("click", async () => {
  const slug = /** @type {HTMLInputElement} */ (document.getElementById("orch-slug")).value.trim();
  const text = /** @type {HTMLTextAreaElement} */ (document.getElementById("tree-input")).value;
  const nodes = parseTreeManifest(text);
  const preview = document.getElementById("tree-preview");
  if (preview) {
    preview.innerHTML = nodes
      .map((n) => `<li>${escapeHtml(n.path)} <span class="text-violet-400">[${n.tag}]</span></li>`)
      .join("");
  }
  const res = await fetch(`/api/workspaces/${slug}/tree`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ nodes }),
  });
  const data = await res.json();
  orchOut(JSON.stringify(data, null, 2));
});

document.getElementById("btn-deploy")?.addEventListener("click", async () => {
  const slug = /** @type {HTMLInputElement} */ (document.getElementById("orch-slug")).value.trim();
  const res = await fetch(`/api/deploy/${slug}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      target: "local-optiplex",
      transport: "tailscale-bridge",
      docker_compose: null,
      note: "Semantic router only — bridge agent executes",
    }),
  });
  orchOut(JSON.stringify(await res.json(), null, 2));
});

document.getElementById("btn-sugar")?.addEventListener("click", async () => {
  const slug = /** @type {HTMLInputElement} */ (document.getElementById("orch-slug")).value.trim();
  const res = await fetch(`/api/sugar-cube/${slug}/export`);
  orchOut(JSON.stringify(await res.json(), null, 2));
});

document.getElementById("new-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = /** @type {HTMLFormElement} */ (e.target);
  const name = new FormData(form).get("name");
  const out = document.getElementById("new-result");
  if (!out || !name) return;
  const res = await fetch("/api/new", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: String(name) }),
  });
  const data = await res.json();
  out.textContent = JSON.stringify(data, null, 2);
  out.classList.remove("hidden");
  htmx.trigger("#project-list", "load");
});
