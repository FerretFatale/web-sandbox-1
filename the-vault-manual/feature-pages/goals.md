# Feature: Goals

## 1) Purpose and outcomes

The Goals system converts high-level ambitions and life goals into structured, executable plans. It has two main entry points: `Goals/ambitions.py` (structured intake + AI plan generation + approval loop) and `Goals/goals_assessment.py` (assessment, knowledge mapping, direct goal addition). Plans produced by the Ambitions module propagate into Goals, Routines, and Schedule upon human approval.

## 2) Ambitions pipeline: `Goals/ambitions.py`

### Stage A flow

```
api_intake_ambition()         → saves ambition in pending_plan state
    ↓
api_generate_ambition_plan()  → AI cascade produces structured draft plan
    ↓
api_review_ambition_plan()    → returns plan for human review
    ↓
api_respond_to_ambition_plan() → human approves/excludes/rejects/reconstructs
    ↓
api_insert_ambition_plan()    → propagates goals, routines, schedule blocks
```

Stage A does NOT auto-execute plans, launch external services, or bypass the human approval gate.

### `api_intake_ambition(text: str, topic_hint: str = "", delayed_start: str = "", notes: str = "") -> dict`

Saves an ambition text dump for planning. Returns an `ambition_id` for all subsequent calls.

```python
from Goals.ambitions import api_intake_ambition

result = api_intake_ambition(
    text="I want to build a sustainable home gym practice that I actually maintain for more than 3 months.",
    topic_hint="health",
    delayed_start="2026-06-01",
    notes="Previous attempts failed due to lack of structured schedule."
)
# {"status": "success", "ambition_id": "amb_a1b2c3d4", "message": "...saved. Call api_generate_ambition_plan..."}
```

**Ambition statuses:** `pending_plan` → `plan_ready` → `approved` / `rejected` → `inserted`

### `api_generate_ambition_plan(ambition_id: str) -> dict`

Generates a structured draft plan using THINKER_CASCADE (or fallback plan if router unavailable).

```python
from Goals.ambitions import api_generate_ambition_plan

result = api_generate_ambition_plan("amb_a1b2c3d4")
# {
#   "status": "success",
#   "plan": {
#     "summary": str,
#     "goals": [{"title": str, "description": str, "category": str}, ...],
#     "routines": [{"title": str, "frequency": str, "duration_mins": int}, ...],
#     "schedule_blocks": [{"day": str, "time_slot": str, "label": str}, ...],
#     "questions": [str, ...],
#     "creative_expansions": [str, ...]
#   }
# }
```

### `api_review_ambition_plan(ambition_id: str) -> dict`

Returns the current plan for human review. Call after `api_generate_ambition_plan`.

### `api_respond_to_ambition_plan(ambition_id: str, response: str, ...) -> dict`

Accepts human decision on the plan:
- `"approve"` — marks the ambition as approved and ready to insert
- `"reject"` — marks the ambition as rejected
- `"reconstruct"` — triggers a plan regeneration with new context
- `"exclude"` — removes specific items from the plan before approval

### `api_insert_ambition_plan(ambition_id: str) -> dict`

Propagates the approved plan into:
- `Goals/Verified_Goals.json` — goal objects
- `Routines/Current_Routines.json` — routine daily steps
- `Schedule/Weekly_Planner/` — schedule block injections

### `api_list_ambitions(status_filter: str = "") -> dict`

Lists all ambitions, optionally filtered by status (`"pending_plan"`, `"plan_ready"`, `"approved"`, `"inserted"`, `"rejected"`).

## 3) Goals assessment: `Goals/goals_assessment.py`

### `api_add_new_goal(goal_name: str, goal_brain_dump: str) -> dict`

Directly adds a goal with AI pre-processing (maps goal against the vault knowledge map to identify relevant existing content).

```python
from Goals.goals_assessment import api_add_new_goal

result = api_add_new_goal(
    goal_name="Launch Ferret Fatale Brand",
    goal_brain_dump="Full rebrand with website, social, and product photography by August..."
)
# {"status": "success", "data": {"goal_name": str, "project_path": str, "strategy_summary": str}}
```

### `api_run_assessment() -> dict`

Runs an AI assessment of current goals: identifies stale goals, conflicting priorities, and gaps.

### `api_generate_knowledge_map() -> dict`

Generates `Toolkit/Vault_Knowledge_Map.txt` — a map of all vault triggers, subcategories, and loose files. Used as context for goal planning.

## 4) Goals definition: `Goals/goals_define.py`

### `api_define_project_roadmap(project_name: str) -> dict`

Generates a structured roadmap for a named project. Reads from `Goals/Ongoing_Projects/`.

### `api_get_life_goals_context() -> dict`

Returns the current life goals context as a structured dict. Used as context injection for other AI calls.

### `api_notify_health_of_goal(...) -> dict`

Sends a cross-module notification to the Health module when a new goal has health implications (e.g. fitness, sleep, diet).

## 5) Managed goals: `Goals/update_managed_goals.py`

### `api_sync_managed_goal(project_key: str) -> dict`

Syncs the progress state of a managed project (from Ongoing_Projects) into the goals registry.

## 6) Storage layout

```
Goals/
  ambitions.json          ← all ambitions (pending, approved, rejected, inserted)
  Verified_Goals.json     ← verified active goals
  Ongoing_Projects/       ← active project folders
  ambitions.py
  goals_assessment.py
  goals_define.py
  update_managed_goals.py
Toolkit/
  Vault_Knowledge_Map.txt ← generated by api_generate_knowledge_map()
```

## 7) Testing

```bash
python -m pytest Copilot_Tests/test_ambitions.py -v
```

Ambitions tests cover: intake validation, plan generation with fallback, approval state transitions, insert propagation into goals/routines/schedule. All tests use local fixtures only.

## 8) Dependencies and integrations

- `Goals/ambitions.py` — ambition intake and approval pipeline
- `Goals/goals_assessment.py` — knowledge map, assessment, direct goal add
- `Goals/goals_define.py` — roadmap, life goals context
- `Goals/update_managed_goals.py` — sync managed project states
- `Goals/Verified_Goals.json` — active goals store
- `Routines/Current_Routines.json` — insertion target for routines
- `Schedule/Weekly_Planner/` — insertion target for schedule blocks
- `Toolkit/omni_router.py` (THINKER_CASCADE) — AI plan generation
- `Human_Input_Forms/goals_profile.md` — onboarding form

## 9) Change log and manual maintenance

- Last reviewed: 2026-05-14
- Source of truth: `Goals/ambitions.py`, `Goals/goals_assessment.py`
- Update triggers: new ambition status value, approval response options changed, insertion targets changed, plan schema fields added.

## 10) Dependencies and integrations

- `Goals/ambitions.py` for intake/plan/review/insert state flow
- `Goals/goals_assessment.py` for assessment and knowledge-map generation
- `Routines/Current_Routines.json` insertion target
- `Schedule/Weekly_Planner/` insertion target
- `Toolkit/omni_router.py` cascade planning path

## 11) Change log and manual maintenance

This page is maintained alongside ambition pipeline updates. When ambition state values,
insert targets, or plan schema fields change, update this feature page in the same lane.
