#!/bin/bash
set -e

echo "=== Creating NotebookLM Persistent Context ==="

LOCAL_CONTEXT="$HOME/NOTEBOOKLM_CONTEXT"
rm -rf "$LOCAL_CONTEXT"
mkdir -p "$LOCAL_CONTEXT"

echo "Copying Portfolio project..."
cp -r "/home/shane/Projects/20260523-shaneturon.ca-portfolio-redesign/planning" "$LOCAL_CONTEXT/shaneturon-portfolio/" || echo "Warning: Portfolio planning not found"

echo "Copying ShipYard Web v2 project..."
cp -r "/home/shane/Projects/20260523-shipyard-web-v2/planning" "$LOCAL_CONTEXT/shipyard-web-v2/" || echo "Warning: ShipYard v2 planning not found"

# Create master index
cat > "$LOCAL_CONTEXT/README_NOTEBOOKLM.md" << 'EOF'
# NOTEBOOKLM MASTER CONTEXT - Shane Turon

Last updated: $(date)

This folder contains the active Architect projects.

Projects:
- shaneturon-portfolio
- shipyard-web-v2

Always read planning/INTAKE.md first.
EOF

echo "Syncing to Google Drive..."
rclone sync "$LOCAL_CONTEXT" gdrive:NOTEBOOKLM_CONTEXT --progress --verbose

echo "=== Done ==="
echo "Google Drive folder: NOTEBOOKLM_CONTEXT"
ls "$LOCAL_CONTEXT"
