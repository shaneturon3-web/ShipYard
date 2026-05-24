import type { Env } from "./types";

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
};

function nowIso(): string {
  return new Date().toISOString();
}

interface TreeNodeInput {
  path: string;
  tag?: string;
  density_score?: number;
  metadata?: Record<string, unknown>;
}

export interface AnnotationInput {
  file_path: string;
  action?: string;
  notes?: string;
  linked_spec?: string;
}

async function setProjectStatus(db: D1Database, slug: string, status: string): Promise<void> {
  const ts = nowIso();
  await db
    .prepare(`UPDATE projects SET status = ?, updated_at = ? WHERE slug = ?`)
    .bind(status, ts, slug)
    .run();
}

export function pathsToNestedTree(paths: string[]): Record<string, unknown> {
  const root: Record<string, unknown> = {};
  for (const raw of paths) {
    const cleanPath = raw.trim().replace(/\\/g, "/");
    if (!cleanPath) continue;
    const segments = cleanPath.split("/").filter(Boolean);
    let level = root;
    segments.forEach((segment, index) => {
      const isFile = index === segments.length - 1;
      if (!level[segment]) {
        level[segment] = isFile ? { type: "file" } : { type: "directory", children: {} };
      }
      const node = level[segment] as { type: string; children?: Record<string, unknown> };
      if (!isFile && node.children) {
        level = node.children;
      }
    });
  }
  return root;
}

export async function listAnnotations(db: D1Database, slug: string) {
  const { results } = await db
    .prepare(
      `SELECT id, project_slug, file_path, action, notes, linked_spec, updated_at
       FROM project_annotations WHERE project_slug = ? ORDER BY file_path`,
    )
    .bind(slug)
    .all();
  return results ?? [];
}

export async function saveAnnotations(
  db: D1Database,
  slug: string,
  annotations: AnnotationInput[],
): Promise<number> {
  const ts = nowIso();
  let count = 0;
  for (const ann of annotations) {
    if (!ann.file_path?.trim()) continue;
    await db
      .prepare(
        `INSERT INTO project_annotations (project_slug, file_path, action, notes, linked_spec, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(project_slug, file_path) DO UPDATE SET
           action = excluded.action,
           notes = excluded.notes,
           linked_spec = excluded.linked_spec,
           updated_at = excluded.updated_at`,
      )
      .bind(
        slug,
        ann.file_path.trim(),
        ann.action ?? "NOTE",
        ann.notes ?? null,
        ann.linked_spec ?? null,
        ts,
      )
      .run();
    count += 1;
  }
  return count;
}

export async function saveTreeNodes(
  db: D1Database,
  slug: string,
  nodes: TreeNodeInput[],
): Promise<number> {
  const ts = nowIso();
  let count = 0;
  for (const node of nodes) {
    await db
      .prepare(
        `INSERT INTO tree_nodes (project_slug, path, tag, density_score, metadata_json, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(project_slug, path) DO UPDATE SET
           tag = excluded.tag,
           density_score = excluded.density_score,
           metadata_json = excluded.metadata_json,
           updated_at = excluded.updated_at`,
      )
      .bind(
        slug,
        node.path,
        node.tag ?? "unchanged",
        node.density_score ?? null,
        node.metadata ? JSON.stringify(node.metadata) : null,
        ts,
      )
      .run();
    count += 1;
  }
  await db
    .prepare(
      `INSERT INTO project_workspaces (project_slug, before_state_json, target_state_json, updated_at)
       VALUES (?, NULL, ?, ?)
       ON CONFLICT(project_slug) DO UPDATE SET target_state_json = excluded.target_state_json, updated_at = excluded.updated_at`,
    )
    .bind(slug, JSON.stringify({ node_count: count, parsed_at: ts }), ts)
    .run();
  return count;
}

export async function listTreeNodes(db: D1Database, slug: string) {
  const { results } = await db
    .prepare(
      `SELECT id, project_slug, path, tag, density_score, metadata_json, updated_at
       FROM tree_nodes WHERE project_slug = ? ORDER BY path`,
    )
    .bind(slug)
    .all();
  return results ?? [];
}

export async function createDeployment(
  db: D1Database,
  slug: string,
  instruction: Record<string, unknown>,
): Promise<{ id: number; status: string; bridge_hint: string }> {
  const ts = nowIso();
  const result = await db
    .prepare(
      `INSERT INTO deployment_events (project_slug, status, instruction_json, log_tail, created_at, updated_at)
       VALUES (?, 'provisioning', ?, ?, ?, ?)`,
    )
    .bind(slug, JSON.stringify(instruction), "Awaiting local execution bridge", ts, ts)
    .run();
  const id = Number(result.meta.last_row_id ?? 0);
  await setProjectStatus(db, slug, "provisioning");
  return {
    id,
    status: "provisioning",
    bridge_hint: "Poll GET /api/deploy/:slug/queue from Tailscale agent — see docs/LOCAL_EXECUTION_BRIDGE.md",
  };
}

export async function updateDeploymentEvent(
  db: D1Database,
  slug: string,
  eventId: number,
  status: string,
  logTail?: string,
): Promise<boolean> {
  const allowed = ["provisioning", "building", "live", "failed"];
  if (!allowed.includes(status)) {
    return false;
  }
  const ts = nowIso();
  const result = await db
    .prepare(
      `UPDATE deployment_events
       SET status = ?, log_tail = COALESCE(?, log_tail), updated_at = ?
       WHERE id = ? AND project_slug = ?`,
    )
    .bind(status, logTail ?? null, ts, eventId, slug)
    .run();
  const changed = (result.meta.changes ?? 0) > 0;
  if (changed && (status === "live" || status === "failed")) {
    await setProjectStatus(db, slug, status === "live" ? "active" : "failed");
  }
  return changed;
}

export async function listDeployments(db: D1Database, slug: string) {
  const { results } = await db
    .prepare(
      `SELECT id, project_slug, status, instruction_json, log_tail, created_at, updated_at
       FROM deployment_events WHERE project_slug = ? ORDER BY id DESC LIMIT 20`,
    )
    .bind(slug)
    .all();
  return results ?? [];
}

function annotationToMutation(row: {
  file_path: string;
  action: string;
  notes: string | null;
  linked_spec: string | null;
}) {
  return {
    filePath: row.file_path,
    action: row.action,
    notes: row.notes ?? "",
    linkedSpec: row.linked_spec ?? undefined,
  };
}

export async function exportSugarCube(
  db: D1Database,
  slug: string,
  clientAnnotations?: AnnotationInput[],
): Promise<Record<string, unknown>> {
  const nodes = await listTreeNodes(db, slug);
  const deployments = await listDeployments(db, slug);
  const annotations = await listAnnotations(db, slug);
  const workspace = await db
    .prepare(`SELECT * FROM project_workspaces WHERE project_slug = ?`)
    .bind(slug)
    .first();

  const tagMutations = (nodes as { path: string; tag: string }[])
    .filter((n) => n.tag && n.tag !== "unchanged")
    .map((n) => ({
      filePath: n.path,
      action: n.tag.toUpperCase(),
      notes: "",
      linkedSpec: undefined,
    }));

  const dbMutations = (annotations as {
    file_path: string;
    action: string;
    notes: string | null;
    linked_spec: string | null;
  }[]).map(annotationToMutation);

  const clientMutations = (clientAnnotations ?? []).map((a) => ({
    filePath: a.file_path,
    action: a.action ?? "NOTE",
    notes: a.notes ?? "",
    linkedSpec: a.linked_spec,
  }));

  const byPath = new Map<string, ReturnType<typeof annotationToMutation>>();
  for (const m of [...tagMutations, ...dbMutations, ...clientMutations]) {
    byPath.set(m.filePath, m);
  }
  const mutations = [...byPath.values()];

  const generatedAt = nowIso();
  const bundle = {
    slug,
    generated_at: generatedAt,
    sugar_cube_version: "1.0",
    package: "Sugar_Cube_Handoff_Bundle",
    timestamp: generatedAt,
    gravityScore: "high-density",
    context: {
      project: slug,
      mutations,
    },
    workspace,
    tree_nodes: nodes,
    annotations,
    recent_deployments: deployments,
    handoff_path: `$HOME/CONTROL TOWER/05_HANDOFFS/projects/${slug}/`,
    control_tower_phase: "Architectural",
    instructions_for_ai:
      "Recreate project intent from tree_nodes tags and workspace target_state_json. Do not execute deploy instructions without operator approval.",
  };

  const ts = nowIso();
  await db
    .prepare(
      `INSERT INTO sugar_cubes (project_slug, bundle_json, compressed_hint, created_at)
       VALUES (?, ?, ?, ?)`,
    )
    .bind(slug, JSON.stringify(bundle), "use bundle_json directly", ts)
    .run();

  return bundle;
}

async function handleDeployPost(
  env: Env,
  slug: string,
  request: Request,
): Promise<Response> {
  const instruction = (await request.json()) as Record<string, unknown>;
  const event = await createDeployment(env.DB, slug, instruction);
  return Response.json({ slug, ...event }, { status: 201, headers: JSON_HEADERS });
}

export async function handleOrchestrationApi(
  request: Request,
  env: Env,
  path: string,
): Promise<Response | null> {
  const treePost = path.match(/^\/api\/workspaces\/([A-Z0-9_]+)\/tree$/);
  if (treePost && request.method === "POST") {
    const slug = treePost[1];
    const body = (await request.json()) as { nodes?: TreeNodeInput[] };
    if (!body.nodes?.length) {
      return Response.json({ error: "nodes array required" }, { status: 400, headers: JSON_HEADERS });
    }
    const count = await saveTreeNodes(env.DB, slug, body.nodes);
    return Response.json({ slug, saved: count }, { headers: JSON_HEADERS });
  }

  const treeGet = path.match(/^\/api\/workspaces\/([A-Z0-9_]+)\/tree$/);
  if (treeGet && request.method === "GET") {
    const slug = treeGet[1];
    const nodes = await listTreeNodes(env.DB, slug);
    return Response.json({ slug, nodes }, { headers: JSON_HEADERS });
  }

  const treeNested = path.match(/^\/api\/workspaces\/([A-Z0-9_]+)\/tree\/nested$/);
  if (treeNested && request.method === "GET") {
    const slug = treeNested[1];
    const nodes = await listTreeNodes(env.DB, slug);
    const paths = (nodes as { path: string }[]).map((n) => n.path);
    return Response.json(
      { slug, tree: pathsToNestedTree(paths), paths },
      { headers: JSON_HEADERS },
    );
  }

  const annGet = path.match(/^\/api\/workspaces\/([A-Z0-9_]+)\/annotations$/);
  if (annGet && request.method === "GET") {
    const slug = annGet[1];
    const annotations = await listAnnotations(env.DB, slug);
    return Response.json({ slug, annotations }, { headers: JSON_HEADERS });
  }

  const annPost = path.match(/^\/api\/workspaces\/([A-Z0-9_]+)\/annotations$/);
  if (annPost && request.method === "POST") {
    const slug = annPost[1];
    const body = (await request.json()) as { annotations?: AnnotationInput[] };
    if (!body.annotations?.length) {
      return Response.json({ error: "annotations array required" }, { status: 400, headers: JSON_HEADERS });
    }
    const saved = await saveAnnotations(env.DB, slug, body.annotations);
    return Response.json({ slug, saved }, { headers: JSON_HEADERS });
  }

  const deployPost = path.match(/^\/api\/deploy\/([A-Z0-9_]+)$/);
  if (deployPost && request.method === "POST") {
    return handleDeployPost(env, deployPost[1], request);
  }

  const deployAlias = path.match(/^\/api\/projects\/([A-Z0-9_]+)\/deploy$/);
  if (deployAlias && request.method === "POST") {
    return handleDeployPost(env, deployAlias[1], request);
  }

  const deployQueue = path.match(/^\/api\/deploy\/([A-Z0-9_]+)\/queue$/);
  if (deployQueue && request.method === "GET") {
    const slug = deployQueue[1];
    const { results } = await env.DB
      .prepare(
        `SELECT id, project_slug, status, instruction_json, created_at
         FROM deployment_events WHERE project_slug = ? AND status = 'provisioning' ORDER BY id ASC`,
      )
      .bind(slug)
      .all();
    return Response.json({ slug, pending: results ?? [] }, { headers: JSON_HEADERS });
  }

  const deployEvents = path.match(/^\/api\/deploy\/([A-Z0-9_]+)\/events$/);
  if (deployEvents && request.method === "GET") {
    const slug = deployEvents[1];
    const events = await listDeployments(env.DB, slug);
    return Response.json({ slug, events }, { headers: JSON_HEADERS });
  }

  const sugar = path.match(/^\/api\/sugar-cube\/([A-Z0-9_]+)\/export$/);
  if (sugar && (request.method === "GET" || request.method === "POST")) {
    const slug = sugar[1];
    let clientAnnotations: AnnotationInput[] | undefined;
    if (request.method === "POST") {
      const body = (await request.json()) as { annotations?: AnnotationInput[] };
      clientAnnotations = body.annotations;
    }
    const bundle = await exportSugarCube(env.DB, slug, clientAnnotations);
    return Response.json(bundle, { headers: JSON_HEADERS });
  }

  const deployPatch = path.match(/^\/api\/deploy\/([A-Z0-9_]+)\/events\/(\d+)$/);
  if (deployPatch && request.method === "PATCH") {
    const slug = deployPatch[1];
    const eventId = Number(deployPatch[2]);
    const body = (await request.json()) as { status?: string; log_tail?: string };
    if (!body.status) {
      return Response.json({ error: "status required" }, { status: 400, headers: JSON_HEADERS });
    }
    const ok = await updateDeploymentEvent(env.DB, slug, eventId, body.status, body.log_tail);
    if (!ok) {
      return Response.json({ error: "Not found or invalid status" }, { status: 404, headers: JSON_HEADERS });
    }
    return Response.json({ slug, id: eventId, status: body.status }, { headers: JSON_HEADERS });
  }

  const deployStream = path.match(/^\/api\/deploy\/([A-Z0-9_]+)\/stream$/);
  if (deployStream && request.method === "GET") {
    const slug = deployStream[1];
    const encoder = new TextEncoder();
    let lastId = 0;
    const stream = new ReadableStream({
      async start(controller) {
        const send = (payload: unknown) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        };
        send({ type: "connected", slug });
        for (let i = 0; i < 30; i++) {
          const events = await listDeployments(env.DB, slug);
          const latest = events[0] as { id?: number; status?: string; log_tail?: string } | undefined;
          if (latest?.id && latest.id !== lastId) {
            lastId = latest.id;
            send({ type: "event", event: latest });
          } else if (latest) {
            send({ type: "heartbeat", status: latest.status, id: latest.id });
          }
          await new Promise((r) => setTimeout(r, 2000));
        }
        controller.close();
      },
    });
    return new Response(stream, {
      headers: {
        "content-type": "text/event-stream",
        "cache-control": "no-cache",
        connection: "keep-alive",
      },
    });
  }

  return null;
}
