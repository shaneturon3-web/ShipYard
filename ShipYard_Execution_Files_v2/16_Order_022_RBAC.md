# Order 022: RBAC

**Completed:** 2026-05-24

- [x] `src/lib/auth/roles.ts` — BACKEND_ADMIN, PROFESSIONAL_USER, OFFICE_ADMIN, SUPERVISOR, ACCOUNTANT
- [x] Supervisor/accountant PII redaction in `ProSpineDashboard` + dashboard API flag
- [x] Gallery `?role=` query param on `/projects/` and `/professional/dashboard/`

## Verify

- `/professional/dashboard/?role=SUPERVISOR` — Analista metrics, redacted client labels
- `/projects/?role=BACKEND_ADMIN` — hidden holdings entry via D1 (not static markdown)
