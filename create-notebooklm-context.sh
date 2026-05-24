#!/bin/bash
set -e

echo "=== Creating NotebookLM Persistent Context ==="

LOCAL_CONTEXT="$HOME/NOTEBOOKLM_CONTEXT"
rm -rf "$LOCAL_CONTEXT"
mkdir -p "$LOCAL_CONTEXT"

HANDOFF_PORTFOLIO="$HOME/CONTROL TOWER/05_HANDOFFS/projects/PORTFOLIO/planning"
EXEC_PORTFOLIO="$HOME/Projects/corporate-identity"

echo "Copying PORTFOLIO handoff (CONTROL TOWER)..."
if [[ -d "$HANDOFF_PORTFOLIO" ]]; then
  cp -r "$HANDOFF_PORTFOLIO" "$LOCAL_CONTEXT/portfolio-handoff/"
else
  echo "Warning: PORTFOLIO handoff planning not found at $HANDOFF_PORTFOLIO"
fi

echo "Copying corporate-identity execution docs..."
if [[ -d "$EXEC_PORTFOLIO/docs" ]]; then
  cp -r "$EXEC_PORTFOLIO/docs" "$LOCAL_CONTEXT/corporate-identity-docs/"
elif [[ -d "$EXEC_PORTFOLIO/planning" ]]; then
  cp -r "$EXEC_PORTFOLIO/planning" "$LOCAL_CONTEXT/corporate-identity/"
else
  echo "Warning: corporate-identity docs/planning not found"
fi

echo "Copying ShipYard Web v2 project..."
cp -r "$HOME/Projects/20260523-shipyard-web-v2/planning" "$LOCAL_CONTEXT/shipyard-web-v2/" 2>/dev/null \
  || cp -r "$HOME/CONTROL TOWER/05_HANDOFFS/projects/SHIPYARD_WEB_V2/planning" "$LOCAL_CONTEXT/shipyard-web-v2/" 2>/dev/null \
  || echo "Warning: ShipYard Web v2 planning not found"

cat > "$LOCAL_CONTEXT/README_NOTEBOOKLM.md" << EOF
# NOTEBOOKLM MASTER CONTEXT - Shane Turon

Last updated: $(date -Iseconds)

Active Architect projects (index slugs):
- PORTFOLIO (shaneturon.ca — handoff + corporate-identity)
- shipyard-web-v2

Always read planning/INTAKE.md first for the slug you are working on.
EOF

echo "Syncing to Google Drive..."
rclone sync "$LOCAL_CONTEXT" gdrive:NOTEBOOKLM_CONTEXT --progress --verbose

echo "=== Done ==="
echo "Google Drive folder: NOTEBOOKLM_CONTEXT"
ls "$LOCAL_CONTEXT"
