/** ShipYard Web — dashboard orchestration UI */

/** @type {{ projectId: string, baseTree: Record<string, unknown>, annotations: Array<{ filePath: string, action: string, notes: string, linkedSpec?: string }> }} */
const currentProjectContext = {
  projectId: "SHIPYARD",
  baseTree: {},
  annotations: [],
};

/** @param {string} s */
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function getOrchSlug() {
  const el = document.getElementById("orch-slug");
  return el ? /** @type {HTMLInputElement} */ (el).value.trim().toUpperCase() : "SHIPYARD";
}

function syncProjectContextSlug(slug) {
  currentProjectContext.projectId = slug;
}

/** @param {string[]} paths */
function pathsToNestedTree(paths) {
  /** @type {Record<string, unknown>} */
  const root = {};
  for (const raw of paths) {
    const cleanPath = raw.trim().replace(/\\/g, "/");
    if (!cleanPath) continue;
    const segments = cleanPath.split("/").filter(Boolean);
    /** @type {Record<string, unknown>} */
    let level = root;
    segments.forEach((segment, index) => {
      const isFile = index === segments.length - 1;
      if (!level[segment]) {
        level[segment] = isFile ? { type: "file" } : { type: "directory", children: {} };
      }
      const node = /** @type {{ type: string, children?: Record<string, unknown> }} */ (level[segment]);
      if (!isFile && node.children) {
        level = node.children;
      }
    });
  }
  return root;
}

/** @param {string} filePath */
function getAnnotationForPath(filePath) {
  return currentProjectContext.annotations.find((a) => a.filePath === filePath);
}

/** @param {string} s */
function escapeAttr(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

/** @param {Record<string, unknown>} tree */
function renderTree(tree, basePath = "") {
  const entries = Object.entries(tree).sort(([a], [b]) => a.localeCompare(b));
  if (!entries.length) {
    return '<p class="text-slate-500 text-sm">No paths parsed yet.</p>';
  }
  const items = entries
    .map(([name, node]) => {
      const fullPath = basePath ? `${basePath}/${name}` : name;
      const n = /** @type {{ type: string, children?: Record<string, unknown> }} */ (node);
      if (n.type === "directory" && n.children) {
        return `<li class="ml-2">
          <details open class="group">
            <summary class="cursor-pointer text-amber-300/90 select-none">${escapeHtml(name)}/</summary>
            <ul class="border-l border-slate-700 ml-2 pl-2 mt-1 space-y-0.5">${renderTree(n.children, fullPath)}</ul>
          </details>
        </li>`;
      }
      const ann = getAnnotationForPath(fullPath);
      const badge = ann
        ? `<span class="text-emerald-400 text-xs ml-1">[${escapeHtml(ann.action)}]</span>`
        : "";
      return `<li class="ml-2">
        <button type="button" data-tree-file="${escapeAttr(fullPath)}"
          class="text-left text-cyan-300 hover:text-cyan-200 hover:underline font-mono text-sm">
          ${escapeHtml(name)}${badge}
        </button>
      </li>`;
    })
    .join("");
  return items;
}

function renderTreePreview() {
  const preview = document.getElementById("tree-preview");
  if (!preview) return;
  preview.innerHTML = `<ul class="space-y-0.5">${renderTree(currentProjectContext.baseTree)}</ul>`;
}

/** @param {string} filePath */
function openAnnotationPanel(filePath) {
  const panel = document.getElementById("annotation-panel");
  const pathEl = document.getElementById("ann-file-path");
  const actionEl = document.getElementById("ann-action");
  const notesEl = document.getElementById("ann-notes");
  const specEl = document.getElementById("ann-linked-spec");
  if (!panel || !pathEl || !actionEl || !notesEl || !specEl) return;

  const existing = getAnnotationForPath(filePath);
  pathEl.textContent = filePath;
  /** @type {HTMLSelectElement} */ (actionEl).value = existing?.action ?? "NOTE";
  /** @type {HTMLTextAreaElement} */ (notesEl).value = existing?.notes ?? "";
  /** @type {HTMLInputElement} */ (specEl).value = existing?.linkedSpec ?? "";
  panel.classList.remove("hidden");
  panel.dataset.filePath = filePath;
}

async function saveCurrentAnnotation() {
  const panel = document.getElementById("annotation-panel");
  if (!panel?.dataset.filePath) return;
  const filePath = panel.dataset.filePath;
  const action = /** @type {HTMLSelectElement} */ (document.getElementById("ann-action")).value;
  const notes = /** @type {HTMLTextAreaElement} */ (document.getElementById("ann-notes")).value.trim();
  const linkedSpec = /** @type {HTMLInputElement} */ (document.getElementById("ann-linked-spec")).value.trim();

  const entry = { filePath, action, notes, linkedSpec: linkedSpec || undefined };
  const idx = currentProjectContext.annotations.findIndex((a) => a.filePath === filePath);
  if (idx >= 0) {
    currentProjectContext.annotations[idx] = entry;
  } else {
    currentProjectContext.annotations.push(entry);
  }

  const slug = getOrchSlug();
  const res = await fetch(`/api/workspaces/${slug}/annotations`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      annotations: [{ file_path: filePath, action, notes, linked_spec: linkedSpec || undefined }],
    }),
  });
  const data = await res.json();
  orchOut(JSON.stringify(data, null, 2));
  renderTreePreview();
}

async function loadWorkspaceState(slug) {
  syncProjectContextSlug(slug);
  try {
    const [treeRes, annRes] = await Promise.all([
      fetch(`/api/workspaces/${slug}/tree/nested`, { credentials: "include" }),
      fetch(`/api/workspaces/${slug}/annotations`, { credentials: "include" }),
    ]);
    if (treeRes.ok) {
      const treeData = await treeRes.json();
      if (treeData.tree && Object.keys(treeData.tree).length) {
        currentProjectContext.baseTree = treeData.tree;
      }
    }
    if (annRes.ok) {
      const annData = await annRes.json();
      currentProjectContext.annotations = (annData.annotations || []).map(
        /** @param {{ file_path: string, action: string, notes?: string, linked_spec?: string }} a */
        (a) => ({
          filePath: a.file_path,
          action: a.action,
          notes: a.notes ?? "",
          linkedSpec: a.linked_spec,
        }),
      );
    }
    renderTreePreview();
  } catch {
    /* optional reload */
  }
}

/** @param {Record<string, unknown>} data */
function renderProjects(data) {
  const projects = data.projects || [];
  if (!projects.length) {
    return '<p class="text-slate-500">No projects in D1. Run: npm run db:local</p>';
  }
  const rows = projects
    .map((p) => {
      const ready = p.handoff_ready ? "Yes" : "No";
      const readyClass = p.handoff_ready ? "text-emerald-400" : "text-slate-400";
      const statusClass =
        p.status === "provisioning"
          ? "text-amber-400"
          : p.status === "failed"
            ? "text-red-400"
            : "text-slate-300";
      return `<tr class="border-t border-slate-800">
        <td class="py-3 pr-4 font-mono text-cyan-300">${p.slug}</td>
        <td class="py-3 pr-4">${escapeHtml(p.name)}</td>
        <td class="py-3 pr-4 ${statusClass}">${escapeHtml(p.status ?? "active")}</td>
        <td class="py-3 pr-4">${escapeHtml(p.phase)}</td>
        <td class="py-3 pr-4">${escapeHtml(p.sync_state)}</td>
        <td class="py-3 pr-4 ${readyClass}">${ready}</td>
        <td class="py-3 flex flex-wrap gap-2 items-center">
          <button type="button" data-deploy-slug="${p.slug}"
            class="text-amber-400 hover:text-amber-300 text-sm font-medium">Deploy</button>
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
          <th class="pb-2 pr-4">Status</th>
          <th class="pb-2 pr-4">Phase</th>
          <th class="pb-2 pr-4">Sync</th>
          <th class="pb-2 pr-4">Handoff ready</th>
          <th class="pb-2">Actions</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
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

document.getElementById("project-list")?.addEventListener("click", async (ev) => {
  const target = /** @type {HTMLElement} */ (ev.target);
  const btn = target.closest("[data-deploy-slug]");
  if (!btn) return;
  const slug = btn.getAttribute("data-deploy-slug");
  if (!slug) return;
  await deployProject(slug, { note: "Deploy from project table" });
});

document.getElementById("tree-preview")?.addEventListener("click", (ev) => {
  const target = /** @type {HTMLElement} */ (ev.target);
  const btn = target.closest("[data-tree-file]");
  if (!btn) return;
  const filePath = btn.getAttribute("data-tree-file");
  if (filePath) openAnnotationPanel(filePath);
});

function orchOut(text) {
  const el = document.getElementById("orch-result");
  if (el) el.textContent = text;
}

/** @param {string} text */
async function ingestTreeText(text) {
  const slug = getOrchSlug();
  syncProjectContextSlug(slug);
  const nodes = await parseTreeManifest(text);
  currentProjectContext.baseTree = pathsToNestedTree(nodes.map((n) => n.path));
  renderTreePreview();

  const res = await fetch(`/api/workspaces/${slug}/tree`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ nodes }),
  });
  const data = await res.json();
  orchOut(JSON.stringify(data, null, 2));
}

document.getElementById("btn-parse-tree")?.addEventListener("click", async () => {
  const text = /** @type {HTMLTextAreaElement} */ (document.getElementById("tree-input")).value;
  await ingestTreeText(text);
});

document.getElementById("tree-file-input")?.addEventListener("change", async (ev) => {
  const input = /** @type {HTMLInputElement} */ (ev.target);
  const file = input.files?.[0];
  if (!file) return;
  const text = await file.text();
  const textarea = document.getElementById("tree-input");
  if (textarea) /** @type {HTMLTextAreaElement} */ (textarea).value = text;
  await ingestTreeText(text);
  input.value = "";
});

document.getElementById("btn-save-annotation")?.addEventListener("click", () => {
  saveCurrentAnnotation();
});

document.getElementById("btn-close-annotation")?.addEventListener("click", () => {
  document.getElementById("annotation-panel")?.classList.add("hidden");
});

document.getElementById("orch-slug")?.addEventListener("change", () => {
  loadWorkspaceState(getOrchSlug());
});

function startDeployStream(slug) {
  const el = document.getElementById("deploy-stream");
  if (!el) return;
  el.textContent = "Connecting SSE…\n";
  const es = new EventSource(`/api/deploy/${slug}/stream`);
  es.onmessage = (ev) => {
    el.textContent += `${ev.data}\n`;
    el.scrollTop = el.scrollHeight;
  };
  es.onerror = () => {
    el.textContent += "[stream ended]\n";
    es.close();
  };
}

/**
 * @param {string} slug
 * @param {Record<string, unknown>} [instruction]
 */
async function deployProject(slug, instruction = {}) {
  const orchSlug = document.getElementById("orch-slug");
  if (orchSlug) /** @type {HTMLInputElement} */ (orchSlug).value = slug;

  const payload = {
    target: "local-optiplex",
    transport: "tailscale-bridge",
    docker_compose: null,
    note: "Semantic router only — bridge agent executes",
    ...instruction,
  };

  const res = await fetch(`/api/deploy/${slug}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  orchOut(JSON.stringify(data, null, 2));
  if (res.ok) {
    startDeployStream(slug);
    htmx.trigger("#project-list", "load");
  }
  return data;
}

document.getElementById("btn-deploy")?.addEventListener("click", async () => {
  await deployProject(getOrchSlug());
});

document.getElementById("btn-deploy-scaffold")?.addEventListener("click", async () => {
  const slug = getOrchSlug();
  const nameInput = document.getElementById("scaffold-name");
  const projectName = nameInput
    ? /** @type {HTMLInputElement} */ (nameInput).value.trim()
    : slug.replace(/_/g, " ");
  await deployProject(slug, {
    action: "scaffold",
    project_name: projectName || slug,
    transport: "tailscale-bridge",
  });
});

async function exportSugarCubeBundle() {
  const slug = getOrchSlug();
  const clientAnnotations = currentProjectContext.annotations.map((a) => ({
    file_path: a.filePath,
    action: a.action,
    notes: a.notes,
    linked_spec: a.linkedSpec,
  }));

  const res = await fetch(`/api/sugar-cube/${slug}/export`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ annotations: clientAnnotations }),
  });
  const serverBundle = await res.json();
  if (!res.ok) {
    orchOut(JSON.stringify(serverBundle, null, 2));
    return;
  }

  const bundle = {
    package: "Sugar_Cube_Handoff_Bundle",
    timestamp: new Date().toISOString(),
    gravityScore: "high-density",
    context: {
      project: slug,
      mutations: serverBundle.context?.mutations ?? clientAnnotations.map((a) => ({
        filePath: a.file_path,
        action: a.action,
        notes: a.notes,
        linkedSpec: a.linked_spec,
      })),
    },
    ...serverBundle,
  };

  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sugar_cube_${slug}_handoff.txt`;
  a.click();
  URL.revokeObjectURL(url);
  orchOut(`Downloaded sugar_cube_${slug}_handoff.txt (${bundle.context.mutations.length} mutations)`);
}

document.getElementById("btn-sugar")?.addEventListener("click", () => {
  exportSugarCubeBundle();
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
  const scaffoldName = document.getElementById("scaffold-name");
  if (scaffoldName) /** @type {HTMLInputElement} */ (scaffoldName).value = String(name);
  htmx.trigger("#project-list", "load");
});

loadWorkspaceState(getOrchSlug());
