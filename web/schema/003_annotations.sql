-- ShipYard Web — file annotations for Sugar Cube handoff

CREATE TABLE IF NOT EXISTS project_annotations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_slug TEXT NOT NULL,
  file_path TEXT NOT NULL,
  action TEXT NOT NULL DEFAULT 'NOTE',
  notes TEXT,
  linked_spec TEXT,
  updated_at TEXT NOT NULL,
  UNIQUE (project_slug, file_path),
  FOREIGN KEY (project_slug) REFERENCES projects(slug)
);

CREATE INDEX IF NOT EXISTS idx_annotations_project ON project_annotations(project_slug);
