# EXECUTION_POINTER — QPC Virtual Clinic

| Field | Value |
|-------|--------|
| **Public mount** | **https://qpc.shaneturon.ca** |
| Registry | QPC-20260525-01 |
| Work order | WO-QPC-001 |
| Status | ACTIVE → UNIFIED INTERFACE ISOLATION |
| Execution root | `~/ShipYard/projects/qpc-virtual-clinic/` |
| App entry | `apps/qpc-clinic` (Next.js, port 3010) |
| Work orders (Drive) | `QPC Virtual Clinic + Website/work-orders/` |
| Future production | `qpcclinic.ca` or `quebecpsychologyclinic.ca` |

## Boundaries

- PsyNova `~/PsyNova` — READ-ONLY (GATE_E)
- Do not import Jane/Stripe/Twilio outside `adapters/`
