# Feature: Governance & Consensus Engine

## 1) Purpose and outcomes

The Consensus Engine is the governance and approval layer that prevents unauthorized mutations, catches bad plans before execution, and produces auditable verdicts for every promoted action.

- The Consensus Engine is **read-only and advisory** — it never mutates mission state directly. Only Vault_Brain transitions state.
- Success means no plan reaches execution without passing deterministic quality checks, no destructive action runs without a checkpoint, and every governance decision has an explicit rule ID in the audit log.
- The three CE pre-approval reviewers (CE1, CE2, CE3) run automatically on every `api_approve_plan` call.

## 2) Consensus Engine component map

| File | Role |
|---|---|
| `Consensus_Engine/state_io_manager.py` | Atomic per-agent mission read/write + checkpoint management |
| `Consensus_Engine/taskmaster_integration.py` | Submit TaskMaster proposals into mission state with full step schema |
| `Consensus_Engine/voting_engine.py` | 30/30/40 weighted voting; 65% threshold for APPROVED |
| `Consensus_Engine/plan_quality_reviewer.py` | CE1: deterministic quality checks on plans (no LLM calls) |
| `Consensus_Engine/plan_conflict_detector.py` | CE2: dependency and conflict detection between steps |
| `Consensus_Engine/plan_reasoning_reviewer.py` | CE3: reasoning quality advisory |
| `Consensus_Engine/phase_state_machine.py` | Mission phase transition validation |
| `Consensus_Engine/rollback_orchestrator.py` | Rollback sequences when governance fails mid-execution |
| `Consensus_Engine/audit_engine.py` | Governance event audit logging |
| `Consensus_Engine/analytics_engine.py` | Mission performance and outcome analytics |
| `Consensus_Engine/kaos_governance_logger.py` | Structured event capture for the audit trail |

## 3) Mission state I/O

```python
from Consensus_Engine.state_io_manager import (
    api_read_mission_state,
    api_write_mission_state,
    api_create_checkpoint,
    api_restore_checkpoint,
    api_list_checkpoints,
    api_close_mission,
    api_delete_checkpoint,
)

# Read current mission (per-agent with legacy fallback)
result = api_read_mission_state(agent_id="default")
# {"status": "success", "data": {mission_state}, "message": "Mission state read successfully."}

# Write mission state (atomic, rebuilds shared registry)
result = api_write_mission_state(mission_state=my_dict, agent_id="default")
# {"status": "success", "data": {"file_written": "...", "size_bytes": N}, ...}

# Create checkpoint before a destructive operation
result = api_create_checkpoint(
    checkpoint_id="pre-email-rebuild",
    checkpoint_name="Before email triage rebuild",
    agent_id="default"
)

# List all available checkpoints
checkpoints = api_list_checkpoints()

# Restore from checkpoint if something went wrong
result = api_restore_checkpoint("pre-email-rebuild", agent_id="default")
```

**Storage layout:**

```
.kaos_mission.json              ← legacy path (default agent, backward compat)
.kaos_missions/
  default.json                  ← per-agent file for default agent
  sub_agent_1.json              ← parallel sub-agent execution
  _registry.json                ← rebuilt atomically after each write; all agents read this
```

Writes are atomic via `.tmp` → rename. Up to 5 retries with 100ms backoff handle Windows file-lock contention. Each write stamps `agent_id` into the mission so readers know the owner.

## 4) CE1: Plan quality review

`plan_quality_reviewer.api_review_plan_quality()` runs before every `api_approve_plan`. All checks are deterministic — zero LLM calls.

```python
from Consensus_Engine.plan_quality_reviewer import api_review_plan_quality
result = api_review_plan_quality(mission)
# {"status": "pass"|"warn"|"fail", "issues": [...], "warnings": [...], "message": "..."}
```

**Hard errors (status `"fail"` — block approval):**

| Code | Condition | Required fix |
|---|---|---|
| `QUALITY:NO_SUCCESS_CRITERIA` | `mission["success_criteria"]` is empty or missing | Re-draft with at least one measurable success criterion |
| `QUALITY:NO_STEPS` | `steps` list is empty | Plan must have at least one step |
| `QUALITY:STEP_BUDGET_EXCEEDED` | `len(steps) > 20` | Reduce step count — prefer minimum steps to reach objective |
| `QUALITY:NO_DONE_WHEN` (STEP_00N) | Non-report step missing `done_when` | Every non-report step needs an explicit verification condition |

**Soft warnings (logged, do not block):**
- `owner` field missing on a step
- `human_inputs_required` is malformed (not a list)

Step types in `{"report"}` are exempt from the `done_when` requirement.

## 5) Runtime governance decisions

`Toolkit/runtime_test_governance.py` (`api_check_governance`) applies these rules at execution time:

| Rule ID | Trigger condition | Decision |
|---|---|---|
| **S1** | `consecutive_failures >= 3` | **HALT** |
| **S2** | `mission_state_valid == False` | **HALT** |
| **S3** | `loop_detected == True` | **HALT** |
| **S4** | provider timeout count >= 2 | **HALT** |
| **S5** | destructive write attempted without checkpoint | **HALT** |
| **E1** | `step_failures >= 2` | ESCALATE |
| **E2** | `provider_error == True` | ESCALATE |
| **E4** | `credential_missing == True` | ESCALATE |

**HALT always takes priority over ESCALATE** when multiple conditions are present.

```python
from Toolkit.runtime_test_governance import api_check_governance

# S1 alone: HALT
result = api_check_governance({"consecutive_failures": 3})
# {"decision": "HALT", "rule_id": "S1", ...}

# E1 alone: ESCALATE
result = api_check_governance({"step_failures": 2})
# {"decision": "ESCALATE", "rule_id": "E1", ...}

# HALT wins when both S1 and E2 apply
result = api_check_governance({"consecutive_failures": 3, "provider_error": True})
# {"decision": "HALT", "rule_id": "S1", ...}

# No conditions: continue
result = api_check_governance({})
# {"decision": "CONTINUE", ...}
```

## 6) Voting engine (30/30/40 weighted system)

Multi-agent votes are weighted before the 65% consensus threshold is applied:

| Voter type | Weight |
|---|---|
| `kaos` (orchestrator) | 30% |
| `taskmaster` (planner) | 30% |
| `subbot` (executors) | 40% |

Valid vote values: `"approved"`, `"rejected"`, `"conditional"`, `"abstain"`

```python
from Consensus_Engine.voting_engine import api_submit_vote

api_submit_vote(
    mission_state=mission,
    voter_id="Vault_Brain",
    voter_type="kaos",           # "kaos" | "taskmaster" | "subbot"
    vote="approved",             # "approved" | "rejected" | "conditional" | "abstain"
    confidence_score=0.85,
    reasoning="Plan meets all CE1 checks and every step has a done_when.",
)
```

`confidence_score` must be `0.0–1.0`; values outside this range return an error.

## 7) Proposal submission

```python
from Consensus_Engine.taskmaster_integration import api_submit_proposal

result = api_submit_proposal(
    mission_state=mission,
    proposal_id="prop_001",
    proposal_summary="Rebuild email pipeline in 4 steps.",
    steps=[
        {
            "step_id": "STEP_001",
            "title": "Add IMAP timeout",
            "description": "Wrap imaplib calls with explicit timeout + finally cleanup.",
            "done_when": "test_proton_bridge.py passes",
            "dependencies": [],
        }
    ],
    confidence_score=0.88,
    llm_model_used="gemini-2.5-flash",
    estimated_total_duration_seconds=1200,
)
```

**Validation on submission:**
- `confidence_score` must be `0.0–1.0`
- `steps` must be a non-empty list

Each step is stored in `mission_state["taskmaster_proposal"]["steps"]` with full schema: `status: "pending"`, `output: null`, `execution_log: []`, `assigned_to`, `actual_duration_seconds: null`.

All submissions are also appended to `.kaos_audit_log.json` for detached audit tracking.

## 8) When a checkpoint is required

| Scenario | Checkpoint required? |
|---|---|
| Before destructive file write (delete, overwrite) | **Yes** (S5 blocks without one) |
| Before external API write with `approved=True` | **Yes** |
| Before `git push` to remote | **Yes** |
| Before schema migration | **Yes** |
| Before read-only operations | No |
| Before generating a plan | No |

Creating a checkpoint before any irreversible operation is the single most effective way to prevent an S5 governance HALT.

## 9) Testing

```bash
python -m pytest Copilot_Tests/test_vault_governance.py -v
python -m pytest Copilot_Tests/test_governance_phase8.py -v
python -m pytest Copilot_Tests/test_consensus_performance.py -v
python -m pytest Copilot_Tests/test_mission_control.py -v
```

`test_vault_governance.py` covers all HALT rules (S1–S5), all ESCALATE rules (E1, E2, E4), HALT-over-ESCALATE priority, clean-state CONTINUE, and result shape contracts — fully deterministic, no LLM calls.

## 10) Dependencies and integrations

- `Consensus_Engine/` — all files listed in section 2
- `vault_brain.py` — calls `api_approve_plan`, which triggers CE1/CE2/CE3 in sequence
- `TaskMaster_Brain.py` — generates proposals, calls `api_submit_proposal`
- `Toolkit/runtime_test_governance.py` — execution-phase governance rules
- `Toolkit/provider_boundary_policy.py` — provider-level safety boundaries
- `.kaos_missions/_registry.json` — shared state registry for multi-agent reads
- `.kaos_audit_log.json` — detached audit log for proposal submissions
- `Archives/Completed_Missions_Log.json` — archived completed missions

## 11) Change log and manual maintenance

- Last reviewed: 2026-05-14
- Source of truth: `Consensus_Engine/` directory
- Update triggers: new governance rule added, CE check added, voting weights changed, checkpoint policy changed, state file schema changed, new Consensus Engine component added.
