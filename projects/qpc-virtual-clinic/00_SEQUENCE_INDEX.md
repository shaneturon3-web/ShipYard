# QPC work-order sequence index

**Project:** QPC Virtual Clinic + Website  
**Generated (UTC):** 2026-05-25T13:07:44Z  
**Control point:** `NOTEBOOKLM_CONTEXT/projects/qpc-virtual-clinic/work-orders/`  
**Pairs:** Human (Architect) + Cursor (Engineering) — same directory, linked by `pair_id`

| Seq | pair_id | Scheduled (UTC) | Human file | Cursor file | Phase |
|-----|---------|-----------------|------------|-------------|-------|
| 1 | WO-QPC-001 | 2026-05-25T14:00:00Z | `WO-QPC-001_20260525T140000Z_HUMAN.md` | `WO-QPC-001_20260525T140000Z_CURSOR.md` | Executive architecture + repo structure |
| 2 | WO-QPC-002 | 2026-05-25T15:30:00Z | `WO-QPC-002_20260525T153000Z_HUMAN.md` | `WO-QPC-002_20260525T153000Z_CURSOR.md` | Human-first branding |
| 3 | WO-QPC-003 | 2026-05-25T17:00:00Z | `WO-QPC-003_20260525T170000Z_HUMAN.md` | `WO-QPC-003_20260525T170000Z_CURSOR.md` | Trilingual system |
| 4 | WO-QPC-004 | 2026-05-25T18:30:00Z | `WO-QPC-004_20260525T183000Z_HUMAN.md` | `WO-QPC-004_20260525T183000Z_CURSOR.md` | Booking triage integration |
| 5 | WO-QPC-005 | 2026-05-25T20:00:00Z | `WO-QPC-005_20260525T200000Z_HUMAN.md` | `WO-QPC-005_20260525T200000Z_CURSOR.md` | Wrapper integrations (Jane, Zoom, Stripe, WhatsApp, …) |
| 6 | WO-QPC-006 | 2026-05-25T21:30:00Z | `WO-QPC-006_20260525T213000Z_HUMAN.md` | `WO-QPC-006_20260525T213000Z_CURSOR.md` | AI assistance policy |
| 7 | WO-QPC-007 | 2026-05-26T14:00:00Z | `WO-QPC-007_20260526T140000Z_HUMAN.md` | `WO-QPC-007_20260526T140000Z_CURSOR.md` | Public website experience |
| 8 | WO-QPC-008 | 2026-05-26T15:30:00Z | `WO-QPC-008_20260526T153000Z_HUMAN.md` | `WO-QPC-008_20260526T153000Z_CURSOR.md` | Mandatory public pages |
| 9 | WO-QPC-009 | 2026-05-26T17:00:00Z | `WO-QPC-009_20260526T170000Z_HUMAN.md` | `WO-QPC-009_20260526T170000Z_CURSOR.md` | Internal operations (protected) |
| 10 | WO-QPC-010 | 2026-05-26T18:30:00Z | `WO-QPC-010_20260526T183000Z_HUMAN.md` | `WO-QPC-010_20260526T183000Z_CURSOR.md` | Migration + deployment phases |

## Execution gate

- **Scheduled** = intended order; operator may slip dates.
- **Cursor** must not start order *N+1* until order *N* is logged **SUCCESS** in `00_ORCHESTRATION_CONTROL.md` (or project-local log when created).
- **Deploy:** No production until paired order approved into `NOTEBOOKLM_CONTEXT/Deployed/`.

## Source

Split from ChatGPT drop: *QPC — Quebec Psychology Clinic · Operational Deployment Escaleta · HUMAN-FIRST DEPLOYMENT TRACK* (2026-05-25).
