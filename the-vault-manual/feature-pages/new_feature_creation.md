# Feature: New Feature Creation

## 1) Purpose and outcomes

New feature creation in The_Vault follows a structured proposal-then-build process. During
maintenance mode (Phase 11+), new features are blocked until an approved proposal exists in
`Human_Input_Proposal_Queue.txt`. The `Vault_Architecture/` toolkit provides cellular division
planning, env var registration, and expansion pack application.

## 2) Architecture tools: `Vault_Architecture/vault_architect.py`

### `api_generate_restructure_plan(target_category: str) -> dict`

Reads a bloated category folder and uses Gemini to generate a cellular division plan: new
subcategories, relocation rules, and re-categorized items.

```python
from Vault_Architecture.vault_architect import api_generate_restructure_plan

result = api_generate_restructure_plan(target_category="Goals")
# {
#   "status": "success",
#   "data": {
#     "new_sub_rules_markdown": "## Goals\n* LifeGoals: life, legacy, vision...\n* ProjectGoals: ...",
#     "reallocated_items": [
#       {"text": "Write the novel", "new_sub_category": "LifeGoals"},
#       ...
#     ]
#   }
# }
```

Requires `API_KEY` in `.env` (routes through Gemini). Reads `Notes.json` and `Tasks.json` from the
target category directory. System prompt role: "Master Architect". Max retries: `MAX_RETRIES = 5`.

### `api_apply_restructure_plan(target_category: str, plan_json: str) -> dict`

Applies a previously generated restructure plan:
- Appends new subcategory rules to `subcategory_rules.txt` via `append_rules()`
- Creates new subcategory directories
- Moves items to their new homes

```python
result = api_apply_restructure_plan(
    target_category="Goals",
    plan_json=json.dumps(result["data"]),
)
# {"status": "success", "data": {"subcategories_created": [...], "items_moved": 4}}
```

### `api_vault_architect(target_category: str) -> dict`

Convenience wrapper that calls `api_generate_restructure_plan` then `api_apply_restructure_plan`
in sequence.

## 3) New env var registration: `Vault_Architecture/env_writer.py`

When a new feature requires a new environment variable:

```python
from Vault_Architecture.env_writer import api_add_env_var

result = api_add_env_var(
    var_name="MY_NEW_API_KEY",
    default_value="",
    description="API key for MyService — required for api_call_myservice()",
)
# {"status": "success", "var_name": "MY_NEW_API_KEY"}
```

Appends to the local `.env` file without overwriting existing entries. Secrets are never committed
to the repository.

## 4) Vault expansion: `Vault_Architecture/apply_expansions.py`

Applies a pre-defined expansion pack (new category, new rules, new initial data files) to the vault.

```bash
python Vault_Architecture/apply_expansions.py --expansion-pack <name>
```

## 5) Proposal workflow (mandatory in maintenance mode)

For all new features during Phase 11+ (maintenance mode):

```
1. Write a proposal entry in Human_Input_Proposal_Queue.txt:
   - PROPOSAL ID: PROP_<YYYY>_<SEQ>
   - TITLE: Brief feature name
   - STATUS: [PENDING REVIEW]
   - IMPACT SURFACE: which files/dirs will change
   - PROPOSAL: full description with motivation and use case
   - DECISION: [ ] Approve / [ ] Reject / [ ] Defer

2. Human marks [x] Approve

3. Agent picks up in next session:
   a. Write tests first (TDD red phase)
   b. Implement minimal code (TDD green phase)
   c. Refactor with architecture-safety review
   d. Register api_* functions in custom_tools_registry.py
   e. Regenerate Skills_Index.json via registry_sync
   f. Update persona_manifest.json if new tools need persona assignment
   g. Update manual_change_log.jsonl
   h. Git checkpoint
```

## 6) Registry registration (required for all new API functions)

Every new `api_*` function must be registered in `custom_tools_registry.py` and `Skills_Index.json`.

```python
# custom_tools_registry.py — add entry
{
    "function_name": "api_my_new_function",
    "module": "MyFeature/my_module",
    "description": "What this function does. Be specific enough for the AI to invoke correctly.",
    "allowed_personas": ["Vault_Architect"],
    "risk_class": "low",
}
```

Then regenerate the registry:

```bash
python Toolkit/registry_sync.py --write
python -m pytest Copilot_Tests/test_registry.py -v
```

## 7) Architecture file protection

Do NOT modify these files during new feature creation without a formal review:

- `vault_brain.py` — primary mission orchestrator
- `TaskMaster_Brain.py` — plan generation
- `Toolkit/omni_router.py` — AI routing
- `persona_manifest.json` — persona definitions
- `AGENTS.md` — agent operating guide
- `.github/copilot-instructions.md` — Copilot governance

If a new feature requires changes to these files, that is a separate PR scope from the feature
implementation itself.

## 8) Testing requirements

```bash
# Minimum test suite before merge:
python -m pytest Copilot_Tests/test_<new_feature>.py -v
python -m pytest Copilot_Tests/test_registry.py -v
python -m pytest Copilot_Tests/test_backlog_lint.py -q
```

## 9) Standard directory structure for a new feature

```
MyFeature/
  __init__.py
  my_module.py          <- api_* functions
  my_data.json          <- storage file (initialized empty)
Copilot_Tests/
  test_my_feature.py    <- deterministic tests
docs/manual/feature-pages/
  my_feature.md         <- this manual page
```

## 10) Subcategory rules update

When a restructure plan creates new subcategories, `subcategory_rules.txt` is updated:

```text
## Goals
* LifeGoals: items relating to life purpose, legacy, vision, values
* ProjectGoals: items relating to active projects, milestones, sprints
* CareerGoals: items relating to professional growth and income
```

## 11) Related tools in `Vault_Architecture/`

```
Vault_Architecture/
  vault_architect.py       <- api_vault_architect / api_generate_restructure_plan / api_apply_restructure_plan
  env_writer.py            <- api_add_env_var
  apply_expansions.py      <- expansion pack application
  audit_structure.py       <- audits vault folder structure
  auto_expand.py           <- auto-expansion logic
  reassess_vault.py        <- reassessment and re-classification tool
```

## 12) Dependencies and integrations

- `Vault_Architecture/vault_architect.py` — cellular division and restructuring
- `Vault_Architecture/env_writer.py` — env var registration
- `Vault_Architecture/apply_expansions.py` — expansion pack application
- `custom_tools_registry.py` — tool registration
- `Toolkit/registry_sync.py` — Skills_Index regeneration
- `Human_Input_Proposal_Queue.txt` — feature proposal surface
- `subcategory_rules.txt` — updated by `append_rules()` during apply

## 13) Change log and manual maintenance

- Last reviewed: 2026-05-14
- Source of truth: `Vault_Architecture/`, `custom_tools_registry.py`, `AGENTS.md`
- Update triggers: new creation step added, proposal workflow changed, registry format changed.
