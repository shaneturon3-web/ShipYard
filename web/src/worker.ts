import { authorizeOrchestration, isProtectedOrchestrationPath } from "./access";
import { handleOrchestrationApi } from "./orchestration";
import type { Env, NewProjectBody, NewProjectResponse, ProjectRow } from "./types";

export type { Env };

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
};

function slugify(name: string): string {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function nowIso(): string {
  return new Date().toISOString();
}

async function listProjects(db: D1Database): Promise<ProjectRow[]> {
  const { results } = await db
    .prepare(
      `SELECT slug, name, status, phase, sync_state, handoff_ready, created_at, updated_at
       FROM projects ORDER BY slug`,
    )
    .all<ProjectRow>();
  return results ?? [];
}

async function getProject(db: D1Database, slug: string): Promise<ProjectRow | null> {
  return db
    .prepare(
      `SELECT slug, name, status, phase, sync_state, handoff_ready, created_at, updated_at
       FROM projects WHERE slug = ?`,
    )
    .bind(slug)
    .first<ProjectRow>();
}

async function createPendingProject(
  db: D1Database,
  name: string,
  slugInput?: string,
): Promise<NewProjectResponse> {
  const slug = slugInput ? slugify(slugInput) : slugify(name);
  const ts = nowIso();
  await db
    .prepare(
      `INSERT INTO projects (slug, name, status, phase, sync_state, handoff_ready, created_at, updated_at)
       VALUES (?, ?, 'pending', 'Research', 'unknown', 0, ?, ?)
       ON CONFLICT(slug) DO UPDATE SET
         name = excluded.name,
         status = 'pending',
         updated_at = excluded.updated_at`,
    )
    .bind(slug, name, ts, ts)
    .run();

  const kebab = name.toLowerCase().replace(/\s+/g, "-").replace(/_/g, "-");
  return {
    slug,
    status: "pending",
    shipyard_command: `shipyard new "${name}"`,
    message: `Pending scaffold. Run locally: shipyard new "${name}" then shipyard refurbish ${slug}`,
  };
}

async function auditProject(env: Env, slug: string): Promise<Response> {
  const project = await getProject(env.DB, slug);
  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404, headers: JSON_HEADERS });
  }

  const key = `planning/${slug}/blueprint.md`;
  const object = env.PLANNING ? await env.PLANNING.get(key) : null;
  if (object) {
    const body = await object.text();
    return Response.json(
      {
        slug,
        source: "r2",
        key,
        content: body,
        handoff_path: `$HOME/CONTROL TOWER/05_HANDOFFS/projects/${slug}/`,
      },
      { headers: JSON_HEADERS },
    );
  }

  return Response.json(
    {
      slug,
      source: "stub",
      handoff_path: `$HOME/CONTROL TOWER/05_HANDOFFS/projects/${slug}/`,
      planning_files: [
        "planning/INTAKE.md",
        "planning/STATE.md",
        "planning/DOMAIN.md",
        "planning/FILE_INVENTORY.md",
        "planning/sprints/001-discovery-architecture/blueprint.md",
        "planning/sprints/001-discovery-architecture/acceptance.md",
      ],
      note: "Upload planning snapshots to R2 bucket shipyard-planning or read from Drive handoff folder.",
      project,
    },
    { headers: JSON_HEADERS },
  );
}

async function handleApi(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  if (isProtectedOrchestrationPath(path)) {
    const denied = authorizeOrchestration(request, env);
    if (denied) return denied;
  }

  if (path === "/api/projects" && request.method === "GET") {
    const projects = await listProjects(env.DB);
    return Response.json({ projects }, { headers: JSON_HEADERS });
  }

  if (path === "/api/new" && request.method === "POST") {
    let body: NewProjectBody;
    try {
      body = (await request.json()) as NewProjectBody;
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400, headers: JSON_HEADERS });
    }
    if (!body.name?.trim()) {
      return Response.json({ error: "name is required" }, { status: 400, headers: JSON_HEADERS });
    }
    const created = await createPendingProject(env.DB, body.name, body.slug);
    return Response.json(created, { status: 201, headers: JSON_HEADERS });
  }

  const projectMatch = path.match(/^\/api\/projects\/([A-Z0-9_]+)$/);
  if (projectMatch && request.method === "GET") {
    const slug = projectMatch[1];
    const project = await getProject(env.DB, slug);
    if (!project) {
      return Response.json({ error: "Not found" }, { status: 404, headers: JSON_HEADERS });
    }
    return Response.json({ project }, { headers: JSON_HEADERS });
  }

  const auditMatch = path.match(/^\/api\/audit\/([A-Z0-9_]+)$/);
  if (auditMatch && request.method === "GET") {
    return auditProject(env, auditMatch[1]);
  }

  const orchestration = await handleOrchestrationApi(request, env, path);
  if (orchestration) return orchestration;

  return Response.json({ error: "Not found" }, { status: 404, headers: JSON_HEADERS });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      return handleApi(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};
