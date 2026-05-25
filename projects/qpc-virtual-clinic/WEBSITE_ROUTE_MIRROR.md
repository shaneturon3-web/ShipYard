# Website route mirror — QPC ↔ ecosystem patterns

QPC public site should **mirror operational routing logic** used on PsyNova / corporate-identity (intake → triage → external scheduling), while presenting as a **premium clinic website**, not a SaaS dashboard.

## Public surface (indexed)

| QPC route | Purpose | Mirror reference |
|-----------|---------|------------------|
| `/` | Human-centered home; therapist as hero | PsyNova `/#/` calm clinical tone (invert palette: warm minimal, not dark Ferrari) |
| `/about` | Therapist presence, credentials, voice | Portfolio `/professional/` trust patterns |
| `/services` | Core specialties (anxiety, ADHD, trauma, …) | PsyNova `/#/services` grid semantics |
| `/multicultural-support` | Multicultural positioning | **New** — required |
| `/immigrant-adaptation` | Immigration / bicultural stress | **New** — required |
| `/languages` | EN / FR / ES operational languages | Global language module toggle pattern |
| `/book` | Human-centered intake entry | PsyNova booking/triage entry (hidden orchestration) |
| `/contact` | WhatsApp + SMS + email lower-friction | Corporate-identity contact modules |

## Intake flow (behavioral mirror)

```text
Website entry → language selection → specialty selection → triage (PsyNova logic)
  → therapist fit → Jane scheduling → Google Calendar → Zoom → follow-up
```

Patient perception: organized clinic.  
System reality: PsyNova decides; SaaS executes.

## Protected surface (noindex)

| Route | Role |
|-------|------|
| `/admin` | Clinic admin |
| `/ops` | Operations |
| `/workflows` | Workflow continuity |
| `/analytics` | PILOT-only internal |
| `/triage` | Triage orchestration UI |

## Host migration

| Phase | Host |
|-------|------|
| NOW | `qpc.shaneturon.ca` |
| FUTURE | `qpcclinic.ca` or `quebecpsychologyclinic.ca` |

## Execution target (when assigned)

Planned app shell per escalata: `/apps/qpc-clinic` adjacent to `psynova-core`, `shared-ui`, `shared-triage`, `shared-i18n` — **create only when WO-QPC-001 Cursor order is approved for apply.**
