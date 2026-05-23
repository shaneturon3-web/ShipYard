-- ShipYard Web — Orchestration state machine (Architect Pack 001 v2)

CREATE TABLE IF NOT EXISTS project_workspaces (
  project_slug TEXT PRIMARY KEY,
  before_state_json TEXT,
  target_state_json TEXT,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (project_slug) REFERENCES projects(slug)
);

CREATE TABLE IF NOT EXISTS tree_nodes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_slug TEXT NOT NULL,
  path TEXT NOT NULL,
  tag TEXT NOT NULL DEFAULT 'unchanged',
  density_score REAL,
  metadata_json TEXT,
  updated_at TEXT NOT NULL,
  UNIQUE (project_slug, path),
  FOREIGN KEY (project_slug) REFERENCES projects(slug)
);

CREATE TABLE IF NOT EXISTS deployment_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_slug TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'provisioning',
  instruction_json TEXT NOT NULL,
  log_tail TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (project_slug) REFERENCES projects(slug)
);

CREATE TABLE IF NOT EXISTS sugar_cubes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_slug TEXT NOT NULL,
  bundle_json TEXT NOT NULL,
  compressed_hint TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (project_slug) REFERENCES projects(slug)
);

CREATE INDEX IF NOT EXISTS idx_tree_project ON tree_nodes(project_slug);
CREATE INDEX IF NOT EXISTS idx_deploy_project ON deployment_events(project_slug);
CREATE INDEX IF NOT EXISTS idx_sugar_project ON sugar_cubes(project_slug);
