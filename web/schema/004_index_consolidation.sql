-- PROJECT_INDEX consolidation 2026-05-22: apply on remote D1 after deploy
-- Removes merged/hidden slugs; aligns with seed-d1.sql

UPDATE projects SET slug = 'MARKETING', name = 'Marketing', updated_at = datetime('now')
  WHERE slug = 'JOB_SEARCH';

UPDATE project_workspaces SET project_slug = 'MARKETING' WHERE project_slug = 'JOB_SEARCH';

UPDATE projects SET name = 'shaneturon.ca website and public narrative', phase = 'Engineering', handoff_ready = 1, updated_at = datetime('now')
  WHERE slug = 'PORTFOLIO';

UPDATE projects SET name = 'doctrine root; includes family/system operating context (formerly FAMILY_OS)', updated_at = datetime('now')
  WHERE slug = 'SUGARCUBE_DOCTRINE';

DELETE FROM project_workspaces WHERE project_slug IN (
  'E4C_CASE',
  'FAMILY_OS',
  'SHANETURON.CA_PORTFOLIO',
  'SHANETURON.CA_PORTFOLIO_REDESIGN'
);

DELETE FROM projects WHERE slug IN (
  'E4C_CASE',
  'FAMILY_OS',
  'SHANETURON.CA_PORTFOLIO',
  'SHANETURON.CA_PORTFOLIO_REDESIGN'
);
