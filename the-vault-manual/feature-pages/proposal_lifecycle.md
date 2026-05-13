# Feature: Proposal Lifecycle

## 1) Purpose and outcomes

The proposal lifecycle tracks TaskMaster execution proposals from submission through approval, step-level execution, and final outcome. Proposals are stored in mission state and logged to a detached audit log (`kaos_audit_log.json`). The integration point is `Consensus_Engine/taskmaster_integration.py`.

## 2) Core API: `Consensus_Engine/taskmaster_integration.py`

### `api_submit_proposal(mission_state, proposal_id, proposal_summary, steps, confidence_score, llm_model_used, estimated_total_duration_seconds) -> dict`

Submits a TaskMaster proposal to mission state. All steps are stored with normalized schema.

```python
from Consensus_Engine.taskmaster_integration import api_submit_proposal

result = api_submit_proposal(
    mission_state=current_state,
    proposal_id="PROP_001",
    proposal_summary="Three-step plan to refactor email triage",
    steps=[
        {
            "step_id": "STEP_001",
            "title": "Analyze current inbox state",
            "description": "Run api_email_mailbox_census to get baseline.",
            "estimated_duration_seconds": 30,
            "dependencies": [],
        },
        {
            "step_id": "STEP_002",
            "title": "Apply triage with urgency scoring",
            "description": "Run api_email_triage_with_urgency on staged messages.",
            "estimated_duration_seconds": 60,
            "dependencies": ["STEP_001"],
        },
    ],
    confidence_score=0.85,
    llm_model_used="google/gemini-2.5-flash",
    estimated_total_duration_seconds=90,
)
# {"status": "success", "data": {"proposal_id": "PROP_001", "steps_count": 2, "confidence_score": 0.85}, "message": "..."}
```

**Validation rules:**
- `confidence_score` must be between `0.0` and `1.0`
- `steps` must be a non-empty list

**Side effects:**
- Writes audit event (`EVT_NNN`) to `.kaos_audit_log.json` (detached from mission state)
- Removes `audit_trail` from mission state to save tokens

### Step schema (stored per step)

| Field | Type | Notes |
|---|---|---|
| `step_id` | str | e.g. `"STEP_001"` |
| `step_number` | int | 1-indexed |
| `title` | str | Short step label |
| `description` | str | Full description |
| `estimated_duration_seconds` | int | Default: 300 |
| `dependencies` | list[str] | step_ids that must complete first |
| `required_resources` | list | Required tools or data |
| `expected_output_schema` | dict | Expected output shape |
| `status` | str | `"pending"` → `"completed"` / `"failed"` |
| `assigned_to` | str | Persona or agent |
| `actual_duration_seconds` | int \| None | Filled on completion |
| `output` | Any \| None | Step output |
| `execution_log` | list | Runtime log entries |

### `api_get_proposal_status(mission_state: dict) -> dict`

Returns current proposal status and progress.

```python
from Consensus_Engine.taskmaster_integration import api_get_proposal_status

result = api_get_proposal_status(mission_state)
# {
#   "status": "success",
#   "data": {
#     "proposal_id": "PROP_001",
#     "proposal_summary": str,
#     "approved_by_kaos": bool,
#     "confidence_score": 0.85,
#     "total_steps": 2,
#     "completed_steps": 0,
#     "failed_steps": 0,
#     "in_progress": 0,
#     "pending": 2,
#     "progress_pct": 0.0
#   },
#   "message": "..."
# }
```

## 3) Proposal queue: `Human_Input_Proposal_Queue.txt`

For operator-level proposals (new features, architecture changes) that require human decision before implementation:

```
==================================================
PROPOSAL ID:     PROP_2026_MAY_001
TITLE:           Add websocket support to vault_brain
STATUS:          [PENDING REVIEW]
SUBMITTED:       2026-05-14
SUBMITTED BY:    Vault_Architect
PRIORITY:        Medium
IMPACT SURFACE:  vault_brain.py, Toolkit/

PROPOSAL:
  Add a websocket listener so external clients can subscribe to
  mission state changes in real time.

DECISION:
  [ ] Approve
  [ ] Reject
  [ ] Defer
==================================================
```

## 4) Proposal lifecycle states

```
submitted → pending_approval → approved → in_progress → completed
                             → rejected
                             → deferred
```

For TaskMaster proposals in mission state, the `approved_by_kaos` boolean marks the transition from `pending_approval` to `approved`.

## 5) Audit log: `.kaos_audit_log.json`

Detached from mission state. Stores all proposal events with `event_id`, `timestamp`, `event_type`, `actor`, and `details`. Updated atomically on each proposal submission.

```json
{
  "total_events": 3,
  "events": [
    {
      "event_id": "EVT_001",
      "timestamp": "2026-05-14T11:00:00+00:00",
      "event_type": "taskmaster_proposal_submitted",
      "actor": "TaskMaster",
      "details": "Proposal with 2 steps, confidence 0.85"
    }
  ]
}
```

## 6) Testing

```bash
python -m pytest Copilot_Tests/test_taskmaster_integration.py -v
```

The integration module includes built-in test functions:

```python
from Consensus_Engine.taskmaster_integration import test_api_submit_proposal, test_api_get_proposal_status

result = test_api_submit_proposal()
# {"test": "test_api_submit_proposal", "status": "passed"}

result = test_api_get_proposal_status()
# {"test": "test_api_get_proposal_status", "status": "passed"}
```

## 7) Dependencies and integrations

- `Consensus_Engine/taskmaster_integration.py` — proposal submission and status
- `TaskMaster_Brain.py` — generates proposals via THINKER_CASCADE then submits via `api_submit_proposal`
- `vault_brain.py` — reads proposal status to advance mission lifecycle
- `.kaos_audit_log.json` — detached audit event store
- `Consensus_Engine/state_io_manager.py` — reads/writes mission state
- `Human_Input_Proposal_Queue.txt` — operator-level proposal review surface

## 8) Change log and manual maintenance

- Last reviewed: 2026-05-14
- Source of truth: `Consensus_Engine/taskmaster_integration.py`
- Update triggers: new proposal status value, step schema field added, audit log format changed, `approved_by_kaos` logic changed.
