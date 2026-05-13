# Feature: Security

## 1) Purpose and outcomes

The Vault security surface has three active enforcement layers: the provider boundary policy (controls which code paths may use direct SDK calls vs. omni_router), runtime governance rules (HALT/ESCALATE/CONTINUE decisions during execution), and the private info filter (PII redaction before any external model call).

- **SR-001:** All new code touching AI providers must route through `omni_router.api_route_request` or `api_cascade_query`. Direct SDK calls require a documented exemption in `PROVIDER_POLICY["exempt_paths"]`.
- **SR-002 (deploy guard):** `api_approve_plan` may only be called by Vault_Brain. TaskMaster generates plans; Vault_Brain approves them.
- Security reviews are required before any code submission by Master_Coder (15 tools).

## 2) Provider boundary policy

`Toolkit/provider_boundary_policy.py` enforces which execution paths must route through omni_router and which may use direct provider SDKs.

### Routed paths (must use omni_router)

| Rule | Label | Required call |
|---|---|---|
| R1 | Text generation | `omni_router.api_route_request()` |
| R2 | JSON planning / structured output | `omni_router.api_route_request()` with json_mode=True |
| R3 | Model selection and routing decisions | `models_manager.get_ai_profile()` + omni_router |
| R4 | Cascade fallback execution | `omni_router.api_cascade_query()` |

### Exempt paths (may use direct SDK with justification)

| Exempt ID | Context | Justification |
|---|---|---|
| X1 | `vault_brain.py` | Uses `google.genai` directly for Gemini tool-calling because response_schema and tool objects have no provider-agnostic abstraction yet |
| X2 | `Toolkit/gemini_schema_sanitizer.py` | Converts tool schemas into Gemini-compatible format — SDK-specific by definition |

### Provider boundary API

```python
from Toolkit.provider_boundary_policy import (
    api_get_provider_rules,
    api_audit_provider_boundary,
    api_check_is_exempt,
)

# Get the full policy dict
rules = api_get_provider_rules()

# Audit a source file for direct-provider violations
result = api_audit_provider_boundary("Toolkit/omni_router.py")
# {
#   "status": "pass"|"violations_found",
#   "violations": [{"line": int, "pattern": str, "context": str}, ...],
#   "exempt": bool
# }

# Check if a named context is in the exempt list
is_exempt = api_check_is_exempt("vault_brain.py")  # True (X1)
```

## 3) Runtime governance rules

All execution paths must evaluate `api_check_governance(test_result)` before continuing.

### Stop conditions (HALT)

| ID | Label | Threshold | Description |
|---|---|---|---|
| S1 | Consecutive failure threshold | 3 failures | 3+ consecutive step failures on the same task |
| S2 | Mission state corruption | 1 | Mission JSON missing required keys or unparseable |
| S3 | Infinite loop detected | 3 | Same tool called with identical args 3+ times without state change |
| S4 | Consecutive provider timeouts | 2 | 2+ consecutive provider timeouts with no successful call |
| S5 | Irreversible write without checkpoint | 1 | Destructive write attempted without a preceding checkpoint |

### Escalation rules (ESCALATE)

| ID | Label | Threshold | Description |
|---|---|---|---|
| E1 | Repeated step failure | 2 | Same step fails twice — escalate before retry #3 |
| E2 | Provider API error | 1 | Non-timeout provider error (429, 500) |
| E3 | Tool timeout | 1 | Any tool call exceeds expected execution time |
| E4 | Missing credential | 1 | Required env key not set at runtime |

### Continue conditions

| ID | Label | Description |
|---|---|---|
| C1 | Single failure with fallback | One failure with valid fallback provider or retry path |
| C2 | Non-critical warning | Warning emitted, no state change, no data loss |
| C3 | Successful step completion | Step completed with expected output |

### Governance API

```python
from Toolkit.runtime_test_governance import (
    api_check_governance,
    api_get_governance_rules,
    api_format_human_action_block,
    api_generate_operator_playbook,
)

# Check whether execution should continue, escalate, or halt
result = api_check_governance({
    "consecutive_failures": 2,
    "provider_error": True,
})
# {"decision": "ESCALATE", "rule_id": "E1", "label": "Repeated step failure", ...}

# Generate a human-readable operator playbook for the current context
playbook = api_generate_operator_playbook({"task": "Email triage rebuild"})

# Produce a standard human-action-needed block for Human_Input.txt
block = api_format_human_action_block(
    task="GitHub MCP Auth",
    status="Blocked",
    why="PAT not yet authenticated in Copilot CLI",
    risk="Low",
    action_needed="Run `gh auth login` and verify token scope",
    files_affected=".github/",
    next_step="Re-run integration test after auth",
)
```

## 4) Private info filter

All prompts pass through `Toolkit/private_info_filter.py` before any external model call:

- Replaces personal names and identifiers from `vault_config.PRIVATE_INFO_BLOCKLIST_NAMES` with anonymized tokens
- Restores originals in the response before returning to the caller
- Controlled by `PRIVATE_INFO_FILTER_ENABLED` in `vault_config.py`
- Filter substitution audit trail written to `.kaos_filter_audit.jsonl`

Enabled by default. Disable only in tests or explicitly approved contexts.

## 5) Checkpoint requirements

Governance rule S5 requires a checkpoint before any of the following:

```
• Any destructive file write (delete, overwrite of a production control file)
• Any external API call that produces persistent state
• Before and after any provider switch or model change mid-mission
• After every successful mission phase completion
• At the end of any test run (pass or fail) before reporting results
```

Create checkpoints via `Consensus_Engine/state_io_manager.api_create_checkpoint()`.

## 6) Rollback triggers

Execution must roll back when:

- Mission state JSON becomes unparseable
- A step writes to a production file and the subsequent step fails
- Halt condition S1, S2, or S5 fires
- Human operator explicitly requests rollback via `Human_Input.txt`

Rollback is orchestrated by `Consensus_Engine/rollback_orchestrator.py`.

## 7) Human action block format

When a blocker requires human input, write to `Human_Input.txt` using this format:

```
--------------------------------------------------
TASK:
<task title>

STATUS:
Blocked / Human action needed

WHY:
<brief explanation>

RISK LEVEL:
Low / Moderate / High

ACTION NEEDED FROM HUMAN:
<exact action steps>

FILES / SYSTEMS AFFECTED:
<paths, services, or integrations>

NEXT SAFE STEP AFTER HUMAN INPUT:
<exact next step>
--------------------------------------------------
```

This format is the canonical interface between automated agents and the human operator.

## 8) Testing

```bash
python -m pytest Copilot_Tests/test_vault_governance.py -v
python -m pytest Copilot_Tests/test_deploy_guard.py -v
python -m pytest Copilot_Tests/test_brain_layer_boundaries.py -v
```

`test_vault_governance.py` verifies all HALT rules (S1–S5), all ESCALATE rules (E1, E2, E4), HALT priority over ESCALATE, result shape contracts — all deterministic, no live calls.

## 9) Dependencies and integrations

- `Toolkit/provider_boundary_policy.py` — boundary enforcement
- `Toolkit/runtime_test_governance.py` — HALT/ESCALATE/CONTINUE rules
- `Toolkit/private_info_filter.py` — PII redaction
- `Consensus_Engine/rollback_orchestrator.py` — rollback on governance failure
- `vault_config.py` — `PRIVATE_INFO_FILTER_ENABLED`, `PRIVATE_INFO_BLOCKLIST_NAMES`
- `Human_Input.txt` — escalation surface for human-blocked actions
- `.kaos_filter_audit.jsonl` — PII filter audit trail

## 10) Change log and manual maintenance

- Last reviewed: 2026-05-14
- Source of truth: `Toolkit/provider_boundary_policy.py`, `Toolkit/runtime_test_governance.py`
- Update triggers: new governance rule, new exempt path, filter blocklist changed, new SR rule added, rollback trigger changed.
