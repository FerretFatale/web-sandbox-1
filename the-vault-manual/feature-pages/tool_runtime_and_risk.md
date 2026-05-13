# Feature: Tool Runtime and Risk

## 1) Purpose and outcomes

The tool runtime and risk layer governs how tools are invoked, what execution policies apply, and when governance rules must halt or escalate a running session. Two modules form the core: `runtime_test_governance.py` (HALT/ESCALATE/CONTINUE rules) and `provider_boundary_policy.py` (which execution paths may use direct SDK calls).

- Every runtime test pass must evaluate `api_check_governance()` before continuing.
- Every new code path touching AI providers must pass a provider boundary audit.
- The Consensus Engine's Rollback Orchestrator is the active recovery path when governance fires HALT.

## 2) Runtime governance: `api_check_governance`

```python
from Toolkit.runtime_test_governance import api_check_governance

result = api_check_governance({
    # HALT triggers
    "consecutive_failures": 3,     # S1
    "mission_state_valid": False,  # S2
    "loop_detected": True,         # S3
    "provider_timeouts": 2,        # S4
    "destructive_write_without_checkpoint": True,  # S5

    # ESCALATE triggers
    "step_failures": 2,            # E1
    "provider_error": True,        # E2
    "tool_timeout": True,          # E3
    "credential_missing": True,    # E4

    # CONTINUE triggers
    "warning_only": True,          # C2
})
# {"decision": "HALT"|"ESCALATE"|"CONTINUE", "rule_id": str, "label": str, ...}
```

**Decision priority:** HALT > ESCALATE > CONTINUE. When both HALT and ESCALATE conditions are present, HALT always wins.

## 3) Complete governance rule set

### Stop conditions (HALT execution immediately)

| ID | Label | Threshold | Trigger field |
|---|---|---|---|
| S1 | Consecutive failure threshold | 3 | `consecutive_failures >= 3` |
| S2 | Mission state corruption | 1 | `mission_state_valid == False` |
| S3 | Infinite loop detected | 3 | `loop_detected == True` |
| S4 | Consecutive provider timeouts | 2 | `provider_timeouts >= 2` |
| S5 | Irreversible write without checkpoint | 1 | `destructive_write_without_checkpoint == True` |

### Escalation rules (notify human, try fallback)

| ID | Label | Threshold | Trigger field |
|---|---|---|---|
| E1 | Repeated step failure | 2 | `step_failures >= 2` |
| E2 | Provider API error | 1 | `provider_error == True` |
| E3 | Tool timeout | 1 | `tool_timeout == True` |
| E4 | Missing credential | 1 | `credential_missing == True` |

### Continue conditions

| ID | Label | Description |
|---|---|---|
| C1 | Single failure with fallback | One failure with valid fallback path available |
| C2 | Non-critical warning only | Warning emitted, no state change, no data loss |
| C3 | Successful step completion | Step completed with expected output |

## 4) Checkpoint requirements

Governance requires a checkpoint in the following situations (S5 fires otherwise):

```python
# Required checkpoint triggers:
"After every successful mission phase completion."
"Before any destructive write (delete, overwrite of a production control file)."
"Before and after any provider switch or model change mid-mission."
"After every external API call that produces persistent state."
"At the end of a test run (pass or fail) before reporting results."
```

## 5) Rollback triggers

These conditions trigger a rollback via `Consensus_Engine/rollback_orchestrator.py`:

```python
"Mission state JSON becomes unparseable."
"A step writes to a production file and the subsequent step fails."
"Halt condition S1, S2, or S5 fires."
"Human operator explicitly requests rollback via Human_Input.txt."
```

## 6) Governance support tools

### `api_get_governance_rules() -> dict`

Returns the complete GOVERNANCE_RULES dict with all stop conditions, escalation rules, continue conditions, checkpoint requirements, rollback triggers, and the human action block format.

```python
rules = api_get_governance_rules()
print(rules["stop_conditions"])        # [S1, S2, S3, S4, S5]
print(rules["escalation_rules"])       # [E1, E2, E3, E4]
print(rules["checkpoint_requirements"]) # list of requirement strings
```

### `api_format_human_action_block(task, status, why, risk, action_needed, files_affected, next_step) -> str`

Produces a standard human-action-needed block for `Human_Input.txt`.

```python
block = api_format_human_action_block(
    task="Proton Bridge reconnect",
    status="Blocked",
    why="IMAP session timed out after 3 retries. Likely stale client connection.",
    risk="Moderate",
    action_needed="Kill and restart Proton Bridge. Check for stale IMAP sessions on 127.0.0.1:1143.",
    files_affected="Toolkit/proton_bridge.py, .env (IMAP config)",
    next_step="Re-run test_proton_bridge.py after restart.",
)
```

### `api_generate_operator_playbook(context: dict | None = None) -> str`

Generates an operator-facing markdown playbook for the current execution context. Includes all governance rules, current risk context, and recommended actions.

## 7) Provider boundary audit

```python
from Toolkit.provider_boundary_policy import api_audit_provider_boundary

# Audit a file for direct provider SDK calls that violate policy
result = api_audit_provider_boundary("Toolkit/some_new_tool.py")
# {
#   "status": "pass"|"violations_found",
#   "file": str,
#   "violations": [
#     {"line": int, "pattern": str, "context": str},
#   ],
#   "exempt": bool,
#   "exempt_reason": str | None,
# }
```

Run this audit on every new Python file that touches AI provider SDKs. Files with violations that are not in the exempt list must be refactored to route through `omni_router.api_route_request`.

## 8) Governance in the execution flow

Standard execution flow with governance gates:

```
Mission created
    ↓
Plan approved (CE1/CE2/CE3 pass)
    ↓
For each step:
    1. api_check_governance(current_state)   ← must return CONTINUE
    2. Execute step
    3. Update step status
    4. api_check_governance(updated_state)   ← HALT fires rollback, ESCALATE files Human_Input
    5. api_create_checkpoint() (if phase boundary)
    ↓
api_complete_mission() → pending_satisfaction
```

## 9) Testing

```bash
python -m pytest Copilot_Tests/test_vault_governance.py -v
python -m pytest Copilot_Tests/test_deploy_guard.py -v
python -m pytest Copilot_Tests/test_brain_layer_boundaries.py -v
```

All governance tests are deterministic. `test_vault_governance.py` verifies every HALT and ESCALATE rule individually and verifies HALT-over-ESCALATE priority.

## 10) Dependencies and integrations

- `Toolkit/runtime_test_governance.py` — governance rules, `api_check_governance`, `api_format_human_action_block`
- `Toolkit/provider_boundary_policy.py` — boundary policy, `api_audit_provider_boundary`
- `Consensus_Engine/rollback_orchestrator.py` — active rollback on HALT
- `Consensus_Engine/state_io_manager.py` — checkpoint create/restore
- `vault_brain.py` — calls governance before each execution phase
- `Human_Input.txt` — escalation target when ESCALATE fires

## 11) Change log and manual maintenance

- Last reviewed: 2026-05-14
- Source of truth: `Toolkit/runtime_test_governance.py`, `Toolkit/provider_boundary_policy.py`
- Update triggers: new governance rule added, threshold changed, new exempt path added, rollback trigger changed, new checkpoint requirement added.
