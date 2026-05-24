-- Seed from CONTROL TOWER 06_PROJECT_INDEX/PROJECT_INDEX.md (2026-05-22 consolidation)
INSERT OR REPLACE INTO projects (slug, name, status, phase, sync_state, handoff_ready, created_at, updated_at) VALUES
  ('CONTROL_TOWER', 'orchestration root', 'active', 'Architectural', 'unknown', 0, datetime('now'), datetime('now')),
  ('SUGARCUBE_DOCTRINE', 'doctrine root; includes family/system operating context (formerly FAMILY_OS)', 'active', 'Research', 'unknown', 0, datetime('now'), datetime('now')),
  ('PSYNOVA', 'product/business project', 'active', 'Research', 'unknown', 0, datetime('now'), datetime('now')),
  ('MARKETING', 'Marketing', 'active', 'Research', 'unknown', 0, datetime('now'), datetime('now')),
  ('PORTFOLIO', 'shaneturon.ca website and public narrative', 'active', 'Engineering', 'unknown', 1, datetime('now'), datetime('now')),
  ('SHIPYARD', 'Phase-2 orchestration CLI', 'active', 'Architectural', 'unknown', 1, datetime('now'), datetime('now')),
  ('SHIPYARD_WEB_V2___PUBLIC_TOOL', 'ShipYard Web v2 - Public Tool', 'active', 'Research', 'unknown', 0, datetime('now'), datetime('now')),
  ('SHIPYARD_WEB_V2', 'ShipYard Web v2', 'active', 'Research', 'unknown', 0, datetime('now'), datetime('now'));
