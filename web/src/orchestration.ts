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
  return (result.meta.changes ?? 0) > 0;
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

export async function exportSugarCube(db: D1Database, slug: string): Promise<Record<string, unknown>> {
  const nodes = await listTreeNodes(db, slug);
  const deployments = await listDeployments(db, slug);
  const workspace = await db
    .prepare(`SELECT * FROM project_workspaces WHERE project_slug = ?`)
    .bind(slug)
    .first();

  const bundle = {
    slug,
    generated_at: nowIso(),
    sugar_cube_version: "1.0",
    workspace,
    tree_nodes: nodes,
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

  const deployPost = path.match(/^\/api\/deploy\/([A-Z0-9_]+)$/);
  if (deployPost && request.method === "POST") {
    const slug = deployPost[1];
    const instruction = (await request.json()) as Record<string, unknown>;
    const event = await createDeployment(env.DB, slug, instruction);
    return Response.json({ slug, ...event }, { status: 201, headers: JSON_HEADERS });
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
  if (sugar && request.method === "GET") {
    const slug = sugar[1];
    const bundle = await exportSugarCube(env.DB, slug);
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
