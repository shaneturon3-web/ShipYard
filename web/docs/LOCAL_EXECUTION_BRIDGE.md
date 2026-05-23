# Local Execution Bridge (Tailscale)

ShipYard Web Workers **do not** run Docker or shell commands. Deploy instructions are routed to the OptiPlex node.

## Flow

1. UI calls `POST /api/deploy/:slug` on `shipyard-web.*.workers.dev`.
2. Worker inserts `deployment_events` row (`provisioning`).
3. Bridge agent (local) polls `GET /api/deploy/:slug/queue` **or** receives webhook on Tailscale hostname.
4. Agent runs approved instruction schema (Docker compose path, env vars from D1 only).
5. Agent `PATCH`es event status → `building` → `live` | `failed`.

## Bridge agent (stub)

Place script at `~/ShipYard/bridge/shipyard-bridge-agent.sh` (future). Requirements:

- Tailscale IP or MagicDNS hostname in `~/.machine_env` as `EXECUTION_BRIDGE_URL`
- Shared secret `SHIPYARD_BRIDGE_SECRET` (Wrangler secret, not in repo)
- Poll interval 30s or webhook listener on `:8788` (local only)

## Operator setup

```bash
# On OptiPlex — example only
export SHIPYARD_WEB_URL="https://shipyard-web.shaneturon3.workers.dev"
export SHIPYARD_BRIDGE_SECRET="<from wrangler secret put>"
# tailscale status → note 100.x address
```

## Safety

- Never auto-run `sync_control_tower.sh --apply` from bridge
- `shipyard refurbish` must pass before deploy instructions execute
- Quarantine failed deploy logs under `~/CONTROL TOWER/07_LOGS/`
