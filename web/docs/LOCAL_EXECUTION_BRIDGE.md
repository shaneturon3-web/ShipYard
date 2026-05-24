# Local Execution Bridge (Tailscale)

ShipYard Web Workers **do not** run Docker or shell commands. Deploy instructions are routed to the OptiPlex node.

## Flow

1. UI calls `POST /api/deploy/:slug` (or alias `POST /api/projects/:slug/deploy`) on `https://shipyard.shaneturon.ca`.
2. Worker inserts `deployment_events` row (`provisioning`) and sets `projects.status = provisioning`.
3. Bridge agent (local) polls `GET /api/deploy/:slug/queue` **or** receives webhook on Tailscale hostname.
4. Agent runs approved instruction schema (see below). `shipyard refurbish` must pass first.
5. Agent `PATCH`es event status → `building` → `live` | `failed`, which syncs `projects.status` to `active` or `failed`.

## Instruction schema (`instruction_json`)

| Field | Required | Description |
|-------|----------|-------------|
| `action` | No | `scaffold` runs local project creation; omit for acknowledge-only |
| `project_name` | When `action=scaffold` | Human name passed to `shipyard new` |
| `target` | No | e.g. `local-optiplex` |
| `transport` | No | e.g. `tailscale-bridge` |
| `docker_compose` | No | Reserved; never auto-applied from edge |
| `note` | No | Operator comment |

Example scaffold deploy from UI:

```json
{
  "action": "scaffold",
  "project_name": "My App",
  "transport": "tailscale-bridge"
}
```

Example default deploy (acknowledge-only):

```json
{
  "target": "local-optiplex",
  "transport": "tailscale-bridge",
  "note": "Semantic router only — bridge agent executes"
}
```

## Bridge agent

Script: `~/ShipYard/bridge/shipyard-bridge-agent.sh`

Requirements:

- Tailscale IP or MagicDNS hostname in `~/.machine_env` as `EXECUTION_BRIDGE_URL` (optional metadata)
- Shared secret `SHIPYARD_BRIDGE_SECRET` (Wrangler secret, not in repo)
- Poll interval 30s or webhook listener on `:8788` (local only)
- `shipyard` CLI on PATH, or `SHIPYARD_REPO` pointing at `~/ShipYard`

Scaffold execution order:

1. Poll queue for `provisioning` events
2. `shipyard refurbish <SLUG>` — abort with `failed` if gaps
3. Parse `instruction_json.action`
4. If `scaffold`: `shipyard new "<project_name>"` (wraps `new_project_scaffold.py`)
5. PATCH event with truncated stdout/stderr in `log_tail`

## Operator setup

```bash
# On OptiPlex — example only
export SHIPYARD_WEB_URL="https://shipyard.shaneturon.ca"
export SHIPYARD_BRIDGE_SECRET="<from wrangler secret put>"
export SHIPYARD_BRIDGE_SLUG="SHIPYARD"
# tailscale status → note 100.x address
SHIPYARD_BRIDGE_ONCE=1 ~/ShipYard/bridge/shipyard-bridge-agent.sh
```

## Safety

- Never auto-run `sync_control_tower.sh --apply` from bridge
- `shipyard refurbish` must pass before deploy instructions execute
- Quarantine failed deploy logs under `~/CONTROL TOWER/07_LOGS/`
