# ShipYard

CONTROL TOWER orchestration CLI and Cloudflare Workers dashboard.

- **CLI** (`shipyard/`): local project indexing, handoff scaffolding, sync validation
- **Web** (`web/`): [ShipYard Web](https://shipyard-web.shaneturon3.workers.dev/) — D1-backed orchestration UI and semantic router API

## Web (Workers + D1)

```bash
cd web
npm install
npm run dev
npm run deploy
npm run db:orchestration:remote   # apply 002 schema to production D1
```

See `web/docs/LOCAL_EXECUTION_BRIDGE.md` for the Tailscale execution bridge design.

## CLI

```bash
pip install -e .
shipyard list
shipyard refurbish SHIPYARD
shipyard sync SHIPYARD   # validates only; prints apply command
```

Handoff source of truth: `~/CONTROL TOWER/05_HANDOFFS/projects/<SLUG>/`
