# Feature: Vault_Brain

## 1) Purpose and outcomes

Vault_Brain is the mission-state authority and orchestration runtime for The Vault. It owns the complete task lifecycle from first planning call through user satisfaction review. Every state transition is logged, every approval is gated, and every failure has an explicit recovery path.

- Operators use Vault_Brain to create missions, advance execution, approve or reject plans, and confirm outcomes.
- Developers extend it by adding step execution paths, council scoring, or new transition guards.
- All 20+ public functions follow the `api_*` prefix convention and return `{"status": "success|error", ...}`.

## 2) Mission lifecycle state machine

```
idle → planning → pending_approval → executing → pending_satisfaction → complete
                       ↑                  ↑
              api_reject_plan       api_fail_mission (back to planning)
                 (feedback)         api_confirm_satisfaction(False)
```

| From | Trigger | To |
|---|---|---|
| `idle` | `api_create_mission(master_objective)` | `planning` |
| `planning` | `api_create_execution_plan()` (TaskMaster) | `pending_approval` |
| `pending_approval` | `api_approve_plan()` — passes CE1/CE2/CE3 | `executing` |
| `pending_approval` | `api_reject_plan(feedback)` | `planning` |
| `executing` | `api_complete_mission(summary)` | `pending_satisfaction` |
| `executing` | `api_fail_mission(reason)` | `planning` |
| `pending_satisfaction` | `api_confirm_satisfaction(satisfied=True)` | `complete` |
| `pending_satisfaction` | `api_confirm_satisfaction(satisfied=False, feedback)` | `planning` |

## 3) Public API reference

### `api_create_mission(master_objective: str) -> dict`

Creates a new mission in `planning` state. Writes `.kaos_mission.json`.

```python
result = api_create_mission("Rebuild the email triage pipeline")
# {"status": "success", "mission_state": {"status": "planning", "phase": "plan", ...}}
```

### `api_get_mission_state() -> dict`

Returns the full current mission state.

```python
state = api_get_mission_state()
mission = state["mission_state"]
print(mission["status"])       # "executing"
print(len(mission["steps"]))   # number of planned steps
```

### `api_approve_plan() -> dict`

Advances `pending_approval → executing`. Runs three pre-approval reviewers in sequence:
1. **CE1** `plan_quality_reviewer` — hard quality checks (blocks on fail)
2. **CE2** `plan_conflict_detector` — dependency/conflict detection
3. **CE3** `plan_reasoning_reviewer` — reasoning quality advisory

Blocked if CE1 returns `"fail"` status. Advisory from CE2/CE3 is logged but does not block.

### `api_reject_plan(feedback: str) -> dict`

Returns to `planning`. Injects `feedback` into the mission ledger so TaskMaster sees it on the next planning cycle.

```python
api_reject_plan("Step 3 is missing done_when — TaskMaster must fix before re-submission.")
```

### `api_update_step_status(step_id: str, status: str, notes: str = "") -> dict`

Updates a step's execution status. Automatically normalizes LLM-generated aliases before validation.

**Valid statuses:** `pending`, `running`, `complete`, `failed`, `blocked`, `skipped`

**Accepted aliases** (auto-normalized):

| Alias | Canonical |
|---|---|
| `completed` | `complete` |
| `done` | `complete` |
| `in_progress` | `running` |
| `in-progress` | `running` |
| `errored` | `failed` |

```python
api_update_step_status("STEP_001", "complete", "File written to Archives/")
api_update_step_status("STEP_002", "completed")  # alias → "complete"
```

### `api_record_step_output(step_id: str, output_json: str) -> dict`

Persists a step's structured output (JSON string) into the mission state for audit.

```python
import json
api_record_step_output("STEP_001", json.dumps({"files_changed": ["vault_brain.py"]}))
```

### `api_complete_mission(summary: str = "", future_context_notes: str = "") -> dict`

Advances `executing → pending_satisfaction`. `future_context_notes` is archived with the mission record so the next session has context on why decisions were made.

```python
api_complete_mission(
    summary="Rebuilt email triage pipeline with IMAP timeout protection.",
    future_context_notes="Proton Bridge session pressure was the root cause — see KAOS STALL protocol."
)
```

### `api_confirm_satisfaction(satisfied: bool, feedback: str = "") -> dict`

- `satisfied=True` → archives mission to `Archives/Completed_Missions_Log.json`, transitions to `complete`.
- `satisfied=False` → injects `feedback` into ledger, transitions back to `planning`.

```python
api_confirm_satisfaction(satisfied=False, feedback="Test coverage for stage B is missing.")
```

### `api_fail_mission(reason: str, future_context_notes: str = "") -> dict`

Transitions `executing → planning` with an explicit failure reason in the event log.

```python
api_fail_mission("IMAP timeout — Proton Bridge session stalled after 3 retries.")
```

### `api_delegate_step_to_sub_agent(step_id: str, role_description: str, task_instructions: str) -> dict`

Assigns a step to a named sub-agent for parallel execution. The sub-agent writes its output via `api_record_step_output` before the step is marked complete.

### `api_get_active_step(mission: dict) -> dict | None`

Returns the currently `running` step, or `None` if no step is in-flight.

### `api_get_next_ready_step(mission: dict) -> dict | None`

Returns the next `pending` step whose dependencies are all `complete`, or `None` if no step is ready.

### `api_reopen_last_mission_as_addendum(addendum_goal: str, addendum_notes: str = "") -> dict`

Reopens the last archived mission to append follow-up work. Use when a session completes but immediately spawns new related work under the same mission ID.

### `api_restore_preflight_checkpoint() -> dict`

Restores mission state from the pre-flight checkpoint saved at plan approval. Use when execution went wrong and the plan needs to restart from a clean state.

### `api_check_preflight_checkpoint_health(goal_id: str = "") -> dict`

Verifies the preflight checkpoint is present, valid JSON, and matches the specified `goal_id`. Returns `{"healthy": bool, "reason": str}`.

### `api_clear_mission() -> dict`

Resets mission state to `idle`. Only safe after `complete` or in explicit recovery scenarios. Does not archive.

### `api_get_active_eros_context_for_session() -> dict`

Returns active Eros context entries relevant to the current session. Used by Eros-aware personas to load relational memory.

### `api_flush_eros_context_on_session_end(dry_run: bool = True, reason: str = "session_end") -> dict`

Flushes session-scoped Eros context at session close. `dry_run=True` by default — set to `False` to commit.

### `api_apply_livestream_privacy_filters(text: str) -> str`

Redacts sensitive terms from text before display on a livestream or public surface.

## 4) Step schema

Each step in `mission_state["steps"]` after `api_approve_plan`:

```json
{
  "step_id":    "STEP_001",
  "step_number": 1,
  "title":      "Rebuild IMAP timeout logic",
  "description": "Add explicit timeout + finally cleanup to proton_bridge.py",
  "done_when":  "test_proton_bridge.py passes, no stale session warnings",
  "owner":      "Master_Coder",
  "dependencies": [],
  "status":     "pending",
  "output":     null,
  "execution_log": []
}
```

## 5) Council voting (plan approval gate)

Before `api_approve_plan` writes the approval transition, three personas vote on the plan using `THINKER_CASCADE` (free models first):

| Persona | Evaluates |
|---|---|
| `Vault_Architect` | Safety, clarity, reversibility (score 1-10) |
| `Strategist` | Alignment with objectives, risk management (score 1-10) |
| `Critic` | Potential failure modes, blind spots (score 1-10) |

Votes **block approval** only when `high_risk=True` AND average score `< 5.0`. Otherwise advisory.

In tests, set `COUNCIL_MOCK=True` (env var) or `COUNCIL_MOCK_SCORES="7,8,7"` to bypass live calls.

## 6) Forbidden step owner tools

These tools must never appear as the `owner` of an executing step. If TaskMaster generates a plan with one of these as an owner, the execute phase refuses to grant that tool:

```python
_EXECUTE_OWNER_FORBIDDEN = {
    "api_approve_plan", "api_reject_plan", "api_complete_mission",
    "api_fail_mission", "api_create_mission", "api_create_execution_plan",
    "api_confirm_satisfaction", "api_clear_mission",
    "api_restore_preflight_checkpoint",
}
```

This prevents any step from hijacking the mission state machine from inside its own execution.

## 7) Mission state storage

| File | Role |
|---|---|
| `.kaos_mission.json` | Legacy single-agent path (still read/written for backward compat) |
| `.kaos_missions/default.json` | Per-agent file for the default agent |
| `.kaos_missions/{agent_id}.json` | Private file per named sub-agent |
| `.kaos_missions/_registry.json` | Rebuilt atomically after every write; all agents read this for shared state overview |

Writes are atomic: `.tmp` file → rename. Up to 5 retries at 100ms intervals handle Windows file-lock contention.

## 8) Governance and security

- **SR-002 (deploy guard):** `api_approve_plan` may only be called by Vault_Brain orchestration. TaskMaster generates plans; only Vault_Brain approves them.
- Vault_Brain runs at temperature `0.0` — deterministic, no creative hallucination in orchestration logic.
- All state transitions are logged to `mission["event_log"]` with ISO 8601 timestamps.
- Completed missions are archived to `Archives/Completed_Missions_Log.json`.
- Intent log written to `.kaos_intent_log.jsonl` for audit purposes.

## 9) Testing

```bash
python -m pytest Copilot_Tests/test_vault_brain_smoke.py -v
python -m pytest Copilot_Tests/test_vault_governance.py -v
python -m pytest Copilot_Tests/test_brain_layer_boundaries.py -v
python -m pytest Copilot_Tests/test_deploy_guard.py -v
```

The smoke harness uses AST-based extraction + `tmp_path` sandbox. No live LLM calls, no production file mutations. Full lifecycle covered: create → approve → execute → complete → satisfy → archive.

## 10) Dependencies and integrations

- `vault_brain.py` — primary source
- `Consensus_Engine/state_io_manager.py` — atomic mission read/write
- `Consensus_Engine/plan_quality_reviewer.py` — CE1 hard quality checks
- `Consensus_Engine/plan_conflict_detector.py` — CE2 conflict detection
- `Consensus_Engine/plan_reasoning_reviewer.py` — CE3 reasoning advisory
- `TaskMaster_Brain.py` — plan generation (`api_create_execution_plan`)
- `Toolkit/omni_router.py` — council vote model routing
- `Toolkit/tool_scope_router.py` — allowed-tool scoping per step
- `Toolkit/context_purge.py` — context cleanup between sessions
- `Archives/Completed_Missions_Log.json` — completed mission archive
- `.kaos_mission.json` / `.kaos_missions/` — state store
- `.kaos_intent_log.jsonl` — intent audit log

## 11) Change log and manual maintenance

- Last reviewed: 2026-05-14
- Source of truth: `vault_brain.py`
- Update triggers: new `api_*` function added, step status enum changed, state machine transition changed, council threshold changed, forbidden tool set changed, storage paths changed.
