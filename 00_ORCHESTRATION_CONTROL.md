# 00 — Orchestration Control (Command Leash)

**Order:** RE-SYNC-DOCTRINE-01 · Doctrine + handshake sync to Cursor  
**Doctrine version:** `24-MAY-2026.01`  
**Role:** Control Tower — single point of truth for Cursor / cloud AI execution  
**Canonical path:** `CONTROL TOWER/00_ORCHESTRATION_CONTROL.md` (mirror: `~/ShipYard/00_ORCHESTRATION_CONTROL.md`)

> **Protocol:** Cursor MUST read this file at the start of every Engineering session. After every task: log SUCCESS or FAILED. Fetch handshake from `NOTEBOOKLM_CONTEXT/operator-ai-protocols/01-ai-handshake-continuity/` — applied locally via `sync-cursor-rules-from-notebooklm-pack.sh`.

---

## Live audit bridge (Cloudflare tunnel)

| Field | Value |
|-------|-------|
| Status | **ACTIVE** — `NOTEBOOKLM_CONTEXT/00_LIVE_ENTRY.md` |
| Tunnel | https://chubby-pamela-humidity-agriculture.trycloudflare.com |
| System State | `/system-state/` · `/api/system/state` |
| System State UI | `/system-state/` on shipyard perimeter (Mission Control dashboard) |
| System State API | `/api/system/state` |
| Local stack | `cd ~/Projects/corporate-identity && npm run demo:local` |
| Stop | `npm run demo:stop` |
| Rule sync | `~/ShipYard/scripts/sync-cursor-rules-from-notebooklm-pack.sh` |

---

## Cursor rules sync matrix (RE-SYNC-DOCTRINE-01)

| Rule file | Source pack | `~/.cursor/rules` | CT registry |
|-----------|-------------|-------------------|-------------|
| `ai_handshake_continuity_v1.mdc` | `01-ai-handshake-continuity/` | ACTIVE | synced |
| `control-tower-protocol.mdc` | `02-cursor-rules-active/` | ACTIVE | synced |
| `control-tower-sync.mdc` | `02-cursor-rules-active/` | ACTIVE | synced |
| `estafeta-protocol.mdc` | `02-cursor-rules-active/` | ACTIVE | synced |
| SugarCubes `*.mdc` | `03-sugarcubes-cursor-rules/` | `sugarcubes-reference/` | synced |

---

## Execution log

| ID | Order / task | Status | Notes (UTC) |
|----|----------------|--------|-------------|
| LEASH-01 | Orchestration leash + Drive live entry | SUCCESS | 2026-05-24 |
| SYNC-01-01 | Handshake → `~/.cursor/rules/` | SUCCESS | From NOTEBOOKLM pack |
| SYNC-01-02 | CONTROL TOWER + Estafeta + SC rules aligned | SUCCESS | sync-cursor-rules script |
| SYNC-01-03 | `/system-state/` Mission Control dashboard | SUCCESS | corporate-identity |
| SYNC-01-04 | Metric: admin abyss → 6 hours/week UI | SUCCESS | ProSpine dashboard + API default 6 |
| SYNC-01-06 | Audit bridge publish | SUCCESS | demo:local + Drive `00_LIVE_ENTRY` |
| STAB-01 | No-Fly Zone + Gate E perimeter | SUCCESS | `PERIMETER_NO_FLY_ZONE.md` |
| STAB-02 | Institutional hero + 25-unit strip | SUCCESS | `master-units.ts` + `index.astro` |
| STAB-03 | Marketing plug (targeting + nurture) | SUCCESS | `src/modules/marketing/` |
| STAB-04 | Master registry gallery | SUCCESS | `/case-files/` |
| STAB-05 | ProSpine landing template | SUCCESS | `/professional/` |
| STAB-06 | Production deploy (STABILIZED-GROWTH-01) | SUCCESS | `main` → f87bb937 |
| REVERT-01 | PsyNova wrong Elite restore | FAILED | Used pre-migration.20260523 — not afternoon state |
| REVERT-02 | PsyNova quarantine restore (223405) | SUCCESS | psynova.shaneturon.ca afternoon shell live |
| REVERT-03 | PsyNova forensic share sync | SUCCESS | `/srv/shared/PsyNova` → live; pre-migration forbidden in PERIMETER |
| DEPLOY-01 | Administrative spine P1/P3 | SUCCESS | shipyard-web + corporate-identity main; D1 005 + identity |
| DEPLOY-02 | Meta CAPI + AiSensy | PENDING | Pages secrets + external API keys |
| QPC-00 | QPC Virtual Clinic work-order pack (10 pairs) | SUCCESS | 2026-05-25 — NOTEBOOKLM_CONTEXT/projects/qpc-virtual-clinic |
| QPC-001 | WO-QPC-001 / QPC-20260525-01 unified interface isolation shell | SUCCESS | 2026-05-25 — apps/qpc-clinic + core/capabilities + adapters + shared/i18n |
| QPC-01 | MASTER PsyNova/QPC Virtuelle Phases 01–04 | SUCCESS | 2026-05-25 — types/interfaces, class adapters, dictionary, Virtuelle shell; baseline compile OK |

---

## State matrix (Ready local · Not committed remote)

| Area | Repo / path | Local state | Remote / production |
|------|-------------|-------------|---------------------|
| Cursor rules | `~/.cursor/rules/` | Handshake + CT + SC reference | N/A (machine-local) |
| System State | `corporate-identity` `/system-state/` | New page + API | Deployed |
| Demo + doctrine | `corporate-identity` | Stabilized Growth deployed | Production Pages (2026-05-25) |
| Operator protocols pack | `NOTEBOOKLM_CONTEXT/operator-ai-protocols/` | 46 files on Drive | Synced |
| QPC clinic shell | `projects/qpc-virtual-clinic/apps/qpc-clinic` | Next.js + interface isolation | Local dev :3010 |

---

## Error registry

| When (UTC) | Source | Symptom | Resolution |
|------------|--------|---------|------------|
| 2026-05-24 | cloudflared | HTTP 530 transient | Restart demo:local |

---

## Doctrine checklist (24-MAY-2026.01)

- [x] **~6 hours per week** — cards, ProSpine API, institutional root
- [x] **Shipyard** public typo (repo `~/ShipYard` unchanged)
- [x] AI handshake in Cursor rules
- [x] System State dashboard on shipyard perimeter
- [x] **Gate E (modified):** Perimeter protection — PsyNova READ-ONLY; L4 + institutional root only
- [x] Stabilized Growth — hero, 25-unit live strip, master registry gallery
- [x] Marketing plug — targeting + WhatsApp nurture (webhook handoff)
- [x] ProSpine landing — 6 Hours/Week Billable Recovery
- [ ] PsyNova full port (046–049) — **CANCELLED for L4**; protect production flagship instead

---

*Last updated (UTC):* 2026-05-25 — Phase Stabilized Growth · production live
