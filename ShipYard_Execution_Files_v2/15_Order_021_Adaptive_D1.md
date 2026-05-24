# Order 021: Adaptive Design Core & D1 Orchestrator

**Handoff slug:** `PORTFOLIO`  
**Execution root:** `~/Projects/corporate-identity/`

## DONE_LIST
**Completed:** 2026-05-24

- [x] `src/lib/core/adaptive-renderer.ts` + `adaptive-db.ts`
- [x] D1 tables `project_data`, `module_config` — `db/migrations/004-adaptive-expansion.sql`
- [x] `functions/api/gallery/projects.ts` merge + RBAC filter
- [x] `D1GalleryBridge.tsx` — D1-only cards without redeploy
- [x] `ProjectCard.astro` — `permissionLevel`, `viewerRole`, `category`
- [x] Seed row `d1-orchestrator-demo` + case page

## Operator

```bash
npm run db:adaptive:remote   # or db:adaptive:local
npm run build && npm run deploy
```

Insert new gallery row:

```sql
INSERT INTO project_data (slug, title, tagline, status, layer, category, architecture_json, href, permission_level, hidden, draft, sort_order, created_at, updated_at)
VALUES (...);
```

Gallery: `/projects/` — D1 cards append via API.
