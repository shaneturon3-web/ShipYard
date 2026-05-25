# QPC Virtual Clinic + Website

**Slug:** `QPC_VIRTUAL_CLINIC`  
**Public identity:** Quebec Psychology Clinic (QPC)  
**Internal infrastructure:** PsyNova (reusable; do not conflate public brand)  
**Doctrine version:** `24-MAY-2026.01`  
**Canonical control (Drive):** `NOTEBOOKLM_CONTEXT/projects/qpc-virtual-clinic/`

## Separation rule

| Tree | Path | Role |
|------|------|------|
| GDrive / NotebookLM | `NOTEBOOKLM_CONTEXT/projects/qpc-virtual-clinic/` | **Single point of control** — work orders, ChatGPT note, sequence index |
| Cursor execution mirror | `~/ShipYard/projects/qpc-virtual-clinic/` | Read-only mirror of work orders; no mixing with `psynova/` or `shipyard/` |
| Future handoff | `~/CONTROL TOWER/05_HANDOFFS/projects/QPC_VIRTUAL_CLINIC/` | Architect phase (not created in this drop) |

## Work-order pairs

Each order is two files in `work-orders/` (same directory, same `pair_id`):

- `*_HUMAN.md` — strategy, clinical positioning, operator decisions (ChatGPT / NotebookLM Architect)
- `*_CURSOR.md` — Engineering execution under CONTROL TOWER leash (Cursor Agent only)

**Sequence:** `00_SEQUENCE_INDEX.md`

## Protocol (mandatory)

1. Read `NOTEBOOKLM_CONTEXT/00_OPERATOR_AI_PROTOCOLS_INDEX.md` before any cloud AI work.
2. Read `~/ShipYard/00_ORCHESTRATION_CONTROL.md` (or CT mirror) at start of every Cursor Engineering session.
3. **No production deploy** until operator moves approved order to `NOTEBOOKLM_CONTEXT/Deployed/`.
4. **PsyNova production** (`~/PsyNova`) is READ-ONLY (GATE_E) — borrow patterns, do not refactor live SPA from ShipYard.
5. Local preview: `npm run demo:local` in target execution repo when assigned in `EXECUTION_POINTER.md`.

## Sync to Drive

```bash
rclone copy "$HOME/NOTEBOOKLM_CONTEXT/projects/qpc-virtual-clinic" \
  gdrive:NOTEBOOKLM_CONTEXT/projects/qpc-virtual-clinic --verbose
```

Or full workflow sync: `~/ShipYard/scripts/sync-notebooklm-workflow.sh`
