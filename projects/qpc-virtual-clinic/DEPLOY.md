# QPC deploy

| Surface | URL |
|---------|-----|
| **Public mount (target)** | https://qpc.shaneturon.ca |
| **Pages (live now)** | https://qpc-clinic.pages.dev/fr/ |

## Deploy

```bash
cd ~/ShipYard/projects/qpc-virtual-clinic/apps/qpc-clinic
npm run deploy
```

## Custom domain

In Cloudflare dashboard: **Pages → qpc-clinic → Custom domains → Add `qpc.shaneturon.ca`**.

Zone `shaneturon.ca` is already on the account (corporate-identity).
