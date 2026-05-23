# Cloudflare Access — ShipYard Web

Orchestration routes (`/api/workspaces/*`, `/api/deploy/*`, `/api/sugar-cube/*`) require:

1. **Browser:** valid `Cf-Access-Jwt-Assertion` (Zero Trust Access application), or  
2. **Bridge/automation:** `Authorization: Bearer <SHIPYARD_BRIDGE_SECRET>`

## 1. Set bridge secret

```bash
cd ~/ShipYard/web
wrangler secret put SHIPYARD_BRIDGE_SECRET
wrangler deploy
```

## 2. Zero Trust application

In Cloudflare dashboard → **Zero Trust** → **Access** → **Applications**:

| Field | Value |
|-------|--------|
| Type | Self-hosted |
| Domain | `shipyard-web.shaneturon3.workers.dev` |
| Path | `/api/workspaces/*`, `/api/deploy/*`, `/api/sugar-cube/*` (or protect entire host) |
| Policy | Allow your identity (email OTP / Google) |

Public read routes (`GET /api/projects`, dashboard HTML) can stay open unless you add a second Access app for `/`.

## 3. Local development

In `wrangler.jsonc` for dev, set `"ACCESS_ENFORCE": "false"` under `vars` (production uses `"true"`).

## 4. Verify

```bash
# Should 401 without auth
curl -sS -o /dev/null -w "%{http_code}\n" -X POST \
  https://shipyard-web.shaneturon3.workers.dev/api/deploy/SHIPYARD

# Should 201 with bridge secret
curl -sS -X POST -H "Authorization: Bearer $SHIPYARD_BRIDGE_SECRET" \
  -H "content-type: application/json" \
  -d '{"target":"local-optiplex"}' \
  https://shipyard-web.shaneturon3.workers.dev/api/deploy/SHIPYARD
```
