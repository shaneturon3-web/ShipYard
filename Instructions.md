# ShipYard Instructions

## How to Use ShipYard (CONTROL TOWER Project Orchestrator)

### 1. Activation

```bash
cd ~/ShipYard
./setup-shipyard.sh    # first time only
source .venv/bin/activate
shipyard --help
```

### 2. Commands

```bash
shipyard new "Project Name"
shipyard list
shipyard refurbish PSYNOVA
shipyard sync PSYNOVA
shipyard register --all
```

### 3. Dual-root workflow

| Tree | Path |
|------|------|
| Handoff (Cloud AI) | `~/CONTROL TOWER/05_HANDOFFS/projects/<SLUG>/` |
| Execution (Cursor) | `~/Projects/<date>-slug/` |

### 4. Architect → Builder

1. `shipyard new "My New Project"`
2. Fill `INTAKE.md` in handoff folder
3. Open `CLOUD_AI_ENTRY.md` in Gemini/ChatGPT (Architect)
4. Save Architect Pack 001 into handoff `planning/`
5. `shipyard refurbish <SLUG>` then `shipyard sync <SLUG>`
6. Operator: `~/CONTROL TOWER/09_SYNCHRONIZATION/sync_control_tower.sh --apply`
7. Cursor builds at path in `EXECUTION_POINTER.md`

### 5. Locations

| What | Where |
|------|--------|
| ShipYard CLI | `~/ShipYard/` |
| CONTROL TOWER | `~/CONTROL TOWER/` |
| Project index | `~/CONTROL TOWER/06_PROJECT_INDEX/` |
| Per-slug handoffs | `~/CONTROL TOWER/05_HANDOFFS/projects/<SLUG>/` |
| GDrive mount | `~/mnt/gdrive/CONTROL TOWER/` |

### 6. Interactive menu

```bash
~/ShipYard/bin/shipyard-launch.sh
# or install: ~/ShipYard/bin/install-desktop-entry.sh
```

See `~/CONTROL TOWER/10_ORCHESTRATION/SHIPYARD.md` and `04_GLOBAL_RULES/README-CLOUD-AI.md`.

### 7. NotebookLM (Architect)

1. Open `04_GLOBAL_RULES/NOTEBOOKLM-ARCHITECTURE-SPECIFICATION.md`
2. Upload sources from `NOTEBOOKLM-SOURCE-MANIFEST.md` into notebook `CT-<SLUG>-Architect`
3. Run Studio Prompt A; save files to `05_HANDOFFS/projects/<SLUG>/`
4. `shipyard refurbish <SLUG>` then sync
