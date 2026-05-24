# Cursor TODO → DONE Renaming Instructions

## Scope

Process every `.md` file in `ShipYard_Execution_Files_v2/` that contains:

- `## TODO_LIST`, or
- `## PENDING_TASKS`

## Transform rules

1. Section headers:
   - `## TODO_LIST` → `## DONE_LIST`
   - `## PENDING_TASKS` → `## COMPLETED_TASKS`
2. Status tokens (case-sensitive):
   - `Status: TODO` → `Status: DONE`
   - `Status: PENDING` → `Status: DONE`
   - `| TODO` → `| DONE`
   - `| PENDING` → `| DONE`
3. Checklist items: `- [ ]` → `- [x]` within processed sections only.
4. Append after the section header line:
   - `**Completed:** YYYY-MM-DD` (America/Toronto local date when script runs)

## Exclusions

Do not modify:

- `10_Cursor_TODO_Renaming_Instructions.md`
- `00_Execution_Status_Summary.md`

## Automation

```bash
cd ~/ShipYard
node scripts/todo-to-done.mjs
```

## Output

Writes `00_Execution_Status_Summary.md` with green checkmarks per processed file.
