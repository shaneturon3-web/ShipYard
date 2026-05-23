import type { Env } from "./types";

/** Routes that mutate orchestration state or expose deploy queue. */
const PROTECTED_PREFIXES = [
  "/api/workspaces/",
  "/api/deploy/",
  "/api/sugar-cube/",
];

export function isProtectedOrchestrationPath(path: string): boolean {
  return PROTECTED_PREFIXES.some((p) => path.startsWith(p));
}

/**
 * Cloudflare Access JWT (browser) or bridge bearer secret (automation).
 * Set ACCESS_ENFORCE=false in wrangler vars only for local dev.
 */
export function authorizeOrchestration(request: Request, env: Env): Response | null {
  if (env.ACCESS_ENFORCE === "false") {
    return null;
  }

  const accessJwt = request.headers.get("Cf-Access-Jwt-Assertion");
  if (accessJwt) {
    return null;
  }

  const auth = request.headers.get("Authorization") ?? "";
  const secret = env.SHIPYARD_BRIDGE_SECRET;
  if (secret && auth === `Bearer ${secret}`) {
    return null;
  }

  return new Response(
    JSON.stringify({
      error: "Unauthorized",
      hint:
        "Use Cloudflare Access (browser) or Authorization: Bearer <SHIPYARD_BRIDGE_SECRET> for bridge/API automation.",
    }),
    {
      status: 401,
      headers: { "content-type": "application/json; charset=utf-8" },
    },
  );
}
