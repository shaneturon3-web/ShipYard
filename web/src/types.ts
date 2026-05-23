export interface Env {
  DB: D1Database;
  PLANNING?: R2Bucket;
  ASSETS: Fetcher;
  ENVIRONMENT: string;
  /** Set to "false" only for local wrangler dev. */
  ACCESS_ENFORCE?: string;
  /** Bridge + automation bearer token (wrangler secret). */
  SHIPYARD_BRIDGE_SECRET?: string;
}

export interface ProjectRow {
  slug: string;
  name: string;
  status: string;
  phase: string;
  sync_state: string;
  handoff_ready: number;
  created_at: string;
  updated_at: string;
}

export interface NewProjectBody {
  name: string;
  slug?: string;
}

export interface NewProjectResponse {
  slug: string;
  status: string;
  shipyard_command: string;
  message: string;
}
