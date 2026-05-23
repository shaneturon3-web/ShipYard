# ShipYard Local Execution Bridge

Polls **ShipYard Web** for `provisioning` deployments and updates D1 status via authenticated API.

## Setup (OptiPlex)

```bash
export SHIPYARD_WEB_URL="https://shipyard-web.shaneturon3.workers.dev"
export SHIPYARD_BRIDGE_SECRET="<from: cd ~/ShipYard/web && wrangler secret put SHIPYARD_BRIDGE_SECRET>"
export SHIPYARD_BRIDGE_SLUG="SHIPYARD"
chmod +x ~/ShipYard/bridge/shipyard-bridge-agent.sh
```

## Run

```bash
# One poll cycle
SHIPYARD_BRIDGE_ONCE=1 ~/ShipYard/bridge/shipyard-bridge-agent.sh

# Daemon-style loop (30s)
~/ShipYard/bridge/shipyard-bridge-agent.sh
```

## systemd (optional)

```ini
[Unit]
Description=ShipYard execution bridge
After=network-online.target tailscaled.service

[Service]
Type=simple
User=shane
EnvironmentFile=%h/.config/shipyard-bridge.env
ExecStart=%h/ShipYard/bridge/shipyard-bridge-agent.sh
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Store secrets only in `~/.config/shipyard-bridge.env` (mode 600). Never commit secrets.

## Safety

- Runs `shipyard refurbish` before accepting deploy; exits 1 on gaps
- Does **not** auto-run `sync_control_tower.sh --apply`
- Does **not** run Docker unless you extend the script with explicit operator-approved blocks
