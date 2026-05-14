# Feature: Routines

## 1) Purpose and outcomes

The Routines system builds and maintains personalized behavior routines using an AI Behavioral Scientist model. Routines are created through a goal-driven draft cycle, saved as structured markdown plans + JSON daily steps, and consumed by the Schedule module. Vault context (wellness state, life goals, existing routines) is injected automatically.

## 2) Core API: `Routines/build_routines.py`

### `api_draft_routine(routine_goal: str, previous_feedback: Optional[str] = None, base_context: Optional[str] = None) -> dict`

Generates a routine draft based on the goal and full vault context. Uses Gemini 2.5 Pro with a behavioral scientist system prompt.

```python
from Routines.build_routines import api_draft_routine

result = api_draft_routine(
    routine_goal="Morning energy routine that fits within 30 minutes before work",
    previous_feedback=None,
)
# {
#   "status": "success",
#   "data": {
#     "markdown_plan": "# Morning Energy Routine\n...",
#     "actionable_daily_steps": [
#       "5 min: Get up immediately, no snooze",
#       "10 min: Cold shower",
#       "5 min: Herbal tea + supplements",
#       "10 min: Brief movement / stretching"
#     ]
#   }
# }
```

**Context injected automatically:**
- `DATA_VAULT/Routines/routines_state.json` (bridge file, preferred)
- `DATA_VAULT/Personal_and_Wellness/wellness_state.json` (bridge file)
- `DATA_VAULT/Life_Goals/life_goals_state.json` (bridge file)
- Fallback: raw JSON files in `Personal_and_Wellness/`, `Life_Goals/`, `Routines/` directories

**Revision cycle:** Pass `previous_feedback` to re-draft with adjustments without losing the original goal context.

**Error states:**
- `{"status": "error", "message": "Empty response from API"}` — Gemini returned null
- `{"status": "error", "message": str(e)}` — API call failure

### `api_save_routine(routine_goal: str, markdown_plan: str, daily_steps_json: str) -> dict`

Saves the finalized routine plan and daily steps.

```python
from Routines.build_routines import api_save_routine
import json

result = api_save_routine(
    routine_goal="Morning energy routine",
    markdown_plan=result["data"]["markdown_plan"],
    daily_steps_json=json.dumps(result["data"]["actionable_daily_steps"]),
)
# {
#   "status": "success",
#   "data": {
#     "filepath": "Routines/Routine_Plans/Morning_energy_routine_Plan.md",
#     "steps_added": 4
#   }
# }
```

**Storage writes:**
- Markdown plan → `Routines/Routine_Plans/<safe_name>_Plan.md`
- Daily steps (de-duplicated) → appended to `Routines/Current_Routines.json`

**Note:** Only new steps (not already in `Current_Routines.json`) are added. `steps_added: 0` means all steps were already present.

### `api_get_current_routines() -> dict`

Returns the current contents of `Routines/Current_Routines.json` as a list.

```python
from Routines.build_routines import api_get_current_routines

result = api_get_current_routines()
# {"status": "success", "data": ["Step 1", "Step 2", ...]}
```

### `api_list_saved_routines() -> dict`

Lists all saved routine plan files in `Routines/Routine_Plans/`.

```python
result = api_list_saved_routines()
# {"status": "success", "data": ["Morning_energy_routine_Plan.md", ...]}
```

### `api_notify_health_of_routine(...) -> dict`

Sends a cross-module notification to the Health module when a routine has health implications. Used to keep wellness state in sync.

## 3) Draft-refine-save workflow

The recommended workflow for creating a new routine:

```
1. api_draft_routine(routine_goal) → review the draft
2. api_draft_routine(routine_goal, previous_feedback="...") → refine if needed
3. api_save_routine(routine_goal, markdown_plan, daily_steps_json) → commit it
4. api_get_current_routines() → verify steps were added
```

## 4) Storage layout

```
Routines/
  build_routines.py           ← core API
  Current_Routines.json       ← active daily steps (flat list, de-duplicated)
  Routine_Plans/              ← saved markdown routine plans
    <goal_name>_Plan.md       ← one file per saved routine

DATA_VAULT/Routines/
  routines_state.json         ← bridge file for context injection (preferred)
```

## 5) Configuration

| Variable | Purpose |
|---|---|
| `API_KEY` | Gemini API key for `api_draft_routine` |
| `VAULT_ROOT` | Vault root path (from `vault_config.py`) |
| `DATA_VAULT` | External data vault path for bridge files |
| `WELLBEING_SCHEDULE_INJECTION` | If `true`, health/wellbeing state is injected at schedule generation time (env var, default false) |

## 6) Testing

```bash
python -m pytest Copilot_Tests/test_routines.py -v
```

Tests cover: draft generation (mocked Gemini), save writes correct files, de-duplication of existing steps, `api_get_current_routines` reads correctly, `api_list_saved_routines` lists correctly.

## 7) Dependencies and integrations

- `Routines/build_routines.py` — core routine API
- `Routines/Current_Routines.json` — active daily steps
- `Routines/Routine_Plans/` — markdown plan storage
- `Goals/ambitions.py` — `api_insert_ambition_plan` writes to `Current_Routines.json`
- `Schedule/living_schedule.py` — consumes routines when generating daily schedule
- `Health/` — `api_notify_health_of_routine` target
- `Human_Input_Forms/form_routines_preferences.url` — operator preference form

## 8) Change log and manual maintenance

- Last reviewed: 2026-05-14
- Source of truth: `Routines/build_routines.py`
- Update triggers: new routine API, context injection sources changed, model changed from Gemini 2.5 Pro, storage paths changed.

## 9) Testing and verification

Primary deterministic checks live in `Copilot_Tests/test_routines.py` and verify draft generation,
save behavior, and de-duplication. Re-run those tests after any API shape or storage-path change.

## 10) Dependencies and integrations

- `Routines/build_routines.py`
- `Goals/ambitions.py` insertion path
- `Schedule/living_schedule.py` routine consumption path
- `Health/` notification targets for health-aware routines

## 11) Change log and manual maintenance

Update this page when routine generation prompts, insertion targets, or planner coupling behavior changes.
