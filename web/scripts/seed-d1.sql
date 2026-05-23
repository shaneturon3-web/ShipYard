-- Seed from CONTROL TOWER 06_PROJECT_INDEX/PROJECT_INDEX.md
INSERT OR REPLACE INTO projects (slug, name, status, phase, sync_state, handoff_ready, created_at, updated_at) VALUES
  ('CONTROL_TOWER', 'orchestration root', 'active', 'Architectural', 'unknown', 0, datetime('now'), datetime('now')),
  ('SUGARCUBE_DOCTRINE', 'doctrine root', 'active', 'Research', 'unknown', 0, datetime('now'), datetime('now')),
  ('PSYNOVA', 'product/business project', 'active', 'Research', 'unknown', 0, datetime('now'), datetime('now')),
  ('E4C_CASE', 'case-management project', 'active', 'Research', 'unknown', 0, datetime('now'), datetime('now')),
  ('FAMILY_OS', 'family/system project', 'active', 'Research', 'unknown', 0, datetime('now'), datetime('now')),
  ('JOB_SEARCH', 'employment transition project', 'active', 'Research', 'unknown', 0, datetime('now'), datetime('now')),
  ('PORTFOLIO', 'public/professional narrative project', 'active', 'Research', 'unknown', 0, datetime('now'), datetime('now')),
  ('SHIPYARD', 'Phase-2 orchestration CLI', 'active', 'Architectural', 'unknown', 1, datetime('now'), datetime('now'));
