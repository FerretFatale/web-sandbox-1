# Feature: TaskMaster_Brain

## 1) Purpose and outcomes

TaskMaster_Brain is the planning engine. Its sole public function is to decompose a user goal into an ordered, dependency-aware step list and submit that plan to the Consensus Engine for approval.

- TaskMaster never executes steps. It generates plans only. Vault_Brain owns the approve/reject decision.
- Success means the output plan has a non-empty `steps` list, measurable `success_criteria`, and an explicit `done_when` on every non-report step.
- After submission, the system is in `pending_approval` status — the operator approves via `api_approve_plan`.

## 2) The two-stage planning pipeline

```
User goal
    ↓
STAGE 1: THINKER  (via _call_json_model → THINKER_CASCADE)
  Produces:
    - internal_monologue  (chain-of-thought reasoning)
    - identified_tools    (what tools will be needed)
    - complexity          "low" | "medium" | "high"
    - recommended_model   (hint for paid-tier selection)
    ↓
STAGE 2: PLANNER  (via _call_json_model → THINKER_CASCADE)
  Produces:
    - proposal_summary                (plain English plan description)
    - confidence_score                (0.0 – 1.0)
    - estimated_total_duration_seconds
    - steps[]                         (title, description, done_when, owner, dependencies, ...)
    ↓
api_submit_proposal() → mission_state["taskmaster_proposal"]
System status → pending_approval
```

## 3) Public API

### `api_create_execution_plan(user_goal: str, revision_context: str = "") -> dict`

The only public entry point. Invoked by Vault_Brain during the planning phase.

```python
# Standard first-run planning
result = api_create_execution_plan("Rebuild the email triage pipeline")
# {"status": "success"|"error", ...}

# Revision cycle — provide feedback from the prior dissatisfied review
result = api_create_execution_plan(
    user_goal="Rebuild the email triage pipeline",
    revision_context="Test coverage for stage B is missing. Add tests before marking complete."
)
```

**Guards:**
- Returns an error if `mission_state["status"] == "pending_satisfaction"`. The operator must respond to the current outcome before a new plan can be created.
- If `master_objective` matches the current active mission, existing state (including completed steps) is preserved and injected into the PLANNER context.

## 4) Cascade model selection

TaskMaster never hardcodes a model. `_call_json_model()` uses `api_cascade_query(THINKER_CASCADE, ...)` — free-tier models first, paid Gemini only if all free models fail:

```python
# Current THINKER_CASCADE order (from Toolkit/omni_router.py):
THINKER_CASCADE = [
    ("hf", "meta-llama/Llama-3.3-70B-Instruct"),      # HF — requires HF_TOKEN
    "nvidia/nemotron-3-super-120b-a12b:free",
    "nousresearch/hermes-3-llama-3.1-405b:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "deepseek/deepseek-r1:free",
    "deepseek/deepseek-chat-v3-0324:free",
    "qwen/qwen3-30b-a3b:free",
    "microsoft/phi-4-reasoning-plus:free",
    "google/gemma-3-27b-it:free",
    "nvidia/nemotron-nano-12b-2-vl:free",
    "google/gemma-3-12b-it:free",
    "meta-llama/llama-3.2-3b-instruct:free",
    "google/gemini-2.5-flash",   # paid — only reached when all free models exhausted
    "google/gemini-2.5-pro",     # paid — high-complexity fallback
]
```

**Paid-tier selection when cascade reaches Gemini:**
- `complexity == "high"` → `gemini-2.5-pro`
- `complexity == "medium"` or `"low"` → `gemini-2.5-flash`

Model governance compliance is checked via `api_check_tier_compliance("task_planning", selected_model)`. Violations are logged to the mission event_log but do not block execution.

## 5) Preserved completed steps

On revision cycles, TaskMaster injects already-completed steps into the PLANNER prompt to prevent re-planning work that is done:

```
Previously completed steps (DO NOT re-plan these):
- [STEP_001] Install dependencies       (done_when: pip install exits 0)
- [STEP_002] Write IMAP timeout logic   (done_when: test_proton_bridge.py passes)
```

Only steps with `status == "complete"` in the existing mission are injected. This is the critical anti-regression guard for multi-cycle missions.

## 6) Step output schema

The PLANNER must generate steps matching this schema. CE1 (`plan_quality_reviewer`) blocks approval if any field is invalid:

```json
{
  "step_id":                    "STEP_001",
  "title":                      "Add IMAP timeout to proton_bridge.py",
  "description":                "Wrap all imaplib calls with explicit timeout + finally cleanup.",
  "done_when":                  "test_proton_bridge.py passes with no stale session warnings",
  "owner":                      "Master_Coder",
  "dependencies":               [],
  "estimated_duration_seconds": 300,
  "required_resources":         [],
  "expected_output_schema":     {}
}
```

`done_when` is **mandatory** on all non-report steps. Omitting it causes CE1 hard failure: `QUALITY:NO_DONE_WHEN`.

## 7) Context injected into the PLANNER prompt

Every planning call includes:
- `vault_rules.txt` — operational constraints and safety rules
- `subcategory_rules.txt` — domain-specific routing constraints
- `Use_Profiles.json` — registered bot/persona profiles for `owner` assignment
- Mission ledger (prior attempt history) — if revision cycle
- Preserved completed steps — if revision cycle
- `revision_context` content — if provided by caller
- Matching workflow templates — via `api_find_matching_workflow()`
- Taste profile preferences — via `api_get_taste_profile()` (tone, brevity, style)

## 8) Common failure modes

| Symptom | Cause | Fix |
|---|---|---|
| `"A mission is awaiting your satisfaction review"` | Called while in `pending_satisfaction` | Call `api_confirm_satisfaction` first |
| CE1 `fail`: `QUALITY:NO_SUCCESS_CRITERIA` | PLANNER omitted `success_criteria` | Add revision_context: "Include at least one measurable success criterion" |
| CE1 `fail`: `QUALITY:NO_DONE_WHEN` on STEP_00N | PLANNER omitted `done_when` | Add revision_context: "Every step requires an explicit done_when condition" |
| CE1 `fail`: `QUALITY:STEP_BUDGET_EXCEEDED` | Plan exceeds 20 steps | Add revision_context: "Condense to fewer than 20 steps" |
| Plan re-plans completed work | Missing preserved-steps injection | Verify `existing_mission["steps"]` has `status=="complete"` entries |
| THINKER returns empty/invalid JSON | Free cascade exhausted, Gemini key missing | Verify `API_KEY` in `.env`; check `HF_TOKEN` for HF head |

## 9) Testing

```bash
python -m pytest Copilot_Tests/test_taskmaster_cascade.py -v
python -m pytest Copilot_Tests/test_brain_thinking_contracts.py -v
```

`test_taskmaster_cascade.py` verifies (headless, no live API calls):
- Cascade success → Gemini NOT called
- Cascade fully exhausted → Gemini fallback called exactly once
- `HAS_OMNI_ROUTER=False` → Gemini called directly from the start
- Custom `fallback_model` forwarded correctly to the Gemini call
- `safe_json_loads`: plain JSON, markdown-fenced JSON, plain-fence JSON all parsed correctly

## 10) Dependencies and integrations

- `TaskMaster_Brain.py` — primary source
- `Toolkit/omni_router.py` — `api_cascade_query`, `THINKER_CASCADE`
- `Consensus_Engine/taskmaster_integration.py` — `api_submit_proposal`
- `Consensus_Engine/plan_quality_reviewer.py` — CE1 quality gate (runs at approval, not generation)
- `Toolkit/model_governance.py` — tier compliance logging
- `Toolkit/kaos_taste_profile.py` — user preference injection
- `Toolkit/workflow_memory.py` — workflow template reuse
- `Use_Profiles.json` — bot persona profiles for `owner` field
- `vault_rules.txt` — injected into every PLANNER call

## 11) Change log and manual maintenance

- Last reviewed: 2026-05-14
- Source of truth: `TaskMaster_Brain.py`
- Update triggers: THINKER_CASCADE order changed, PLANNER prompt changed, step schema fields changed, new planning guards added, model governance tier logic changed, preserved-steps behavior changed.
