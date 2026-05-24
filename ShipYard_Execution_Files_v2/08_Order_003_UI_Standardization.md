# Order 003: UI Standardization (Restrained Dark)

**Role:** ShipYard Implementation / PORTFOLIO  
**Handoff slug:** `PORTFOLIO`  
**Execution root:** `~/Projects/corporate-identity/`

**Objective:** Credibility Architecture visual style across the unified domain. **No Tailwind/shadcn required** — Astro components + shared CSS tokens satisfy the spec.

## DONE_LIST
**Completed:** 2026-05-24

- [x] Create `src/styles/tokens.css` with restrained dark palette:
  - Background: `#0a0a0a`
  - Surface: `#1a1a1a`
  - Border: `#2a2a2a`
  - Primary text: `#f5f5f5`
- [x] Import tokens on gallery and case-file pages (`projects/index.astro`, `projects/[slug].astro`, site `index.astro`).
- [x] Apply 12-column grid system with structured spacing on `/projects/` (existing grid verified).
- [x] Confirm `StatusBadge.astro` implements NOW (green/pulse), PILOT (blue/steady), FUTURE (grey/outline).
