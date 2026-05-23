# ShipYard Web (Cloudflare)

MVP dashboard and API for CONTROL TOWER project index (Architect Pack 001).

## Prerequisites

- Node.js 20+
- Cloudflare account (`wrangler login`) for deploy

## Local development

```bash
cd ~/ShipYard/web
npm install
npm run db:local    # D1 schema + seed
npm run dev         # http://localhost:8787
```

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/projects` | List projects from D1 |
| GET | `/api/projects/:SLUG` | Project detail |
| POST | `/api/new` | Create pending row + `shipyard new` command |
| GET | `/api/audit/:SLUG` | Audit stub / R2 blueprint |

## Production

| URL | Purpose |
|-----|---------|
| https://shipyard-web.shaneturon3.workers.dev/ | Dashboard |
| https://shipyard-web.shaneturon3.workers.dev/api/projects | Project list (JSON) |
| https://shipyard-web.shaneturon3.workers.dev/api/audit/SHIPYARD | Audit API (NotebookLM/tools) |

D1 database: `shipyard-db` (`e71b0ca4-bdd9-4b9b-bade-1388d4bb825a`). R2 disabled until enabled on account.

## Deploy

```bash
wrangler login   # once
wrangler d1 create shipyard-db   # once; update database_id in wrangler.jsonc
npm run db:migrate -- --remote
npm run db:seed -- --remote
wrangler deploy
```

Enable **Cloudflare Access** on the production hostname in dashboard.

## CLI bridge

The web UI does **not** run shell commands. After `POST /api/new`, run the returned `shipyard_command` on your local node, then `shipyard refurbish <SLUG>`.

## Artifacts

Planning source: `~/CONTROL TOWER/05_HANDOFFS/projects/SHIPYARD/planning/`
