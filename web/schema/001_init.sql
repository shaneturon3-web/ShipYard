-- ShipYard Web — D1 schema (Architect Pack 001)

CREATE TABLE IF NOT EXISTS projects (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  phase TEXT NOT NULL DEFAULT 'Research',
  sync_state TEXT NOT NULL DEFAULT 'unknown',
  handoff_ready INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_audit_feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_slug TEXT NOT NULL,
  agent_type TEXT NOT NULL,
  suggestion TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (project_slug) REFERENCES projects(slug)
);

CREATE INDEX IF NOT EXISTS idx_audit_project ON ai_audit_feedback(project_slug);
