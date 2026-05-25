# Human — Capability contracts (PsyNova / QPC Virtuelle)

**Registry:** QPC-20260525-01 · Phases 01–04  
**Machine source:** `core/capabilities/types.ts`, `core/capabilities/interfaces.ts`

## Scheduling

Clinicians and patients interact through abstract scheduling only. Jane App is a **disposable adapter** — not part of core vocabulary.

| Operation | Intent |
|-----------|--------|
| `getAvailability` | List open clinical slots for a provider in a date range |
| `createAppointment` | Book session; returns appointment id + telehealth join URL |
| `cancelAppointment` | Release slot; returns success boolean |

## Billing

Stripe (or successor) sits behind `BillingCapability`. Core never names Stripe in patient-facing flows.

| Operation | Intent |
|-----------|--------|
| `createInvoice` | Issue CAD invoice linked to an appointment |
| `verifyPaymentStatus` | Confirm payment before confirming session |

## Triage

Intake text is evaluated into `PatientMetadata` (language preference, specialty focus). **Clinical judgment remains with the licensed professional** — triage routes only; it does not diagnose.

## Language

All consumer surfaces resolve copy through `shared/i18n/` (EN / FR / ES). Default operational locale for Quebec: **French**.
