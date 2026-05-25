# QPC — Unified Interface Isolation (WO-QPC-001 / QPC-20260525-01)

**Master directive:** PsyNova / QPC Virtuelle — Phases 01–04 (linear)

## Layout

```text
projects/qpc-virtual-clinic/
  human/                    # Human-readable contracts & dictionary reference
  apps/qpc-clinic/          # Next.js clinical wrapper (machine runtime)
  core/capabilities/        # types.ts, interfaces.ts (+ legacy providers)
  adapters/                 # Jane, Stripe, Triage rules, Twilio — fetch only, no SDKs
  shared/i18n/              # dictionary.ts + locale JSON catalogs
```

## Interface Isolation Rule (binding)

1. **No vendor SDKs or vendor API imports** outside `/adapters/`.
2. **`/core/capabilities/`** defines clinical interfaces only (`SchedulingProvider`, `BillingProvider`, `MessagingProvider`).
3. **`/apps/qpc-clinic`** routes all operational data through `@core/capabilities` types via `lib/registry.ts` (sole composition root).
4. **`/shared/i18n/`** is the only source for user-facing copy (trilingual native).
5. **Zero visible AI** in public strings or metadata.

## Run locally

```bash
cd ~/ShipYard/projects/qpc-virtual-clinic
npm install
npm run dev
# http://localhost:3010/en
```

Without `JANE_API_KEY`, scheduling uses Jane stub (demo-safe).
