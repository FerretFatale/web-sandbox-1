# Feature: Workflow Memory and Templates

## 1) Purpose and outcomes

Workflow memory records completed missions as reusable knowledge. Templates codify repeatable
processes for reuse. Together they form an institutional memory layer that prevents repeated effort
and informs future AI decisions. Workflows are capped at 200 entries (LRU). Contact details are
automatically redacted before storage.

## 2) Core API: `Toolkit/workflow_memory.py`

Storage paths:
- `Archives/Workflow_Memory.json` — workflow memory (max 200 entries)
- `workflow_templates.json` (vault root or Archives/) — workflow templates

### `api_record_workflow(goal_id, master_objective, tools_used, personas_used, models_used, steps_count, summary, future_context_notes, ...) -> dict`

Records a completed mission as a reusable memory entry.

```python
from Toolkit.workflow_memory import api_record_workflow

result = api_record_workflow(
    goal_id="biz_plan_ferret_2026",
    master_objective="Generate red-team business plan review",
    tools_used=["api_generate_business_plan", "api_critique_plan"],
    personas_used=["Vault_Architect"],
    models_used=["google/gemini-2.5-flash"],
    steps_count=3,
    summary="Plan generated and critiqued. Top risk: market saturation.",
    future_context_notes="Entity: [Business]. Skills needed: writing, AI.",
)
# {"status": "success", "recorded": {...}}
```

**Fields stored per entry:**
- `goal_id`, `master_objective`, `recorded_at` (ISO timestamp)
- `tools_used`, `personas_used`, `models_used`, `steps_count`
- `summary` (contact details redacted)
- `future_context_notes` (contact details redacted)
- `telemetry_version: "2.0"`
- `persona_tool_usage` (normalized list-of-dicts, see Section 5)
- `attempted_tool_calls` (normalized list-of-dicts)

### `api_find_matching_workflow(objective: str, n_results: int = 3, min_overlap: float = 0.25) -> dict`

Finds past workflows with similar objectives using keyword token overlap matching.

```python
result = api_find_matching_workflow("email triage with urgency scoring", n_results=3)
# {
#   "status": "success",
#   "matches": [
#     {"goal_id": str, "master_objective": str, "overlap_score": 0.71, "summary": str},
#     ...
#   ]
# }
```

- Uses `_tokenize()` to strip stopwords and compare token sets
- Returns empty list if no matches exceed `min_overlap`
- Returns `{"status": "no_history"}` if `Workflow_Memory.json` is empty

### `api_create_workflow_template(template_id, name, description, tags, steps, ...) -> dict`

Creates a reusable process template for workflows that repeat across missions.

```python
result = api_create_workflow_template(
    template_id="email_triage_v1",
    name="Email Triage with Urgency Scoring",
    description="Standard inbox triage with urgency tier assignment.",
    tags=["email", "triage", "inbox"],
    steps=[
        {"step": 1, "action": "Run api_email_mailbox_census", "expected_output": "census_report"},
        {"step": 2, "action": "Apply urgency scoring via api_email_triage_with_urgency", "expected_output": "scored_list"},
    ],
)
# {"status": "success", "template": {...}}
```

### `api_get_workflow_template(template_id: str) -> dict`

```python
result = api_get_workflow_template("email_triage_v1")
# {"status": "success", "template": {...}}
# {"status": "error", "message": "Template not found: 'unknown_id'"}
```

### `api_list_workflow_templates(tag: Optional[str] = None) -> dict`

Lists all templates, optionally filtered by tag.

```python
result = api_list_workflow_templates(tag="email")
# {"status": "success", "templates": [...], "count": 2}
```

### `api_update_workflow_template(template_id: str, ...) -> dict`

Updates specific fields on an existing template.

### `api_apply_workflow_template(template_id: str, mission_context: str = "") -> dict`

Expands a template into a ready-to-execute step list, substituting mission context where applicable.

```python
result = api_apply_workflow_template("email_triage_v1", mission_context="Process weekend inbox")
# {"status": "success", "steps": [{"step": 1, "action": str, ...}, ...]}
```

### `api_record_template_usage(template_id: str, success: bool, outcome_summary: str = "") -> dict`

Logs a template invocation outcome for health analysis.

### `api_analyze_template_health(template_id: str) -> dict`

Returns success rate, usage count, and staleness signal for a template.

```python
result = api_analyze_template_health("email_triage_v1")
# {"status": "success", "health": {"usage_count": 12, "success_rate": 0.92, "stale": False}}
```

### `api_detect_orphan_workflows(days_old: int = 7) -> dict`

Finds workflow records that have no matching template and are older than `days_old` days.

```python
result = api_detect_orphan_workflows(days_old=14)
# {"status": "success", "orphans": [...], "count": 3}
```

## 3) Privacy: contact detail redaction

Before any text is persisted to `Workflow_Memory.json`, the module strips:
- Email addresses via `_EMAIL_RE` pattern → replaced with `[EMAIL_REDACTED]`
- Phone numbers via `_PHONE_RE` pattern → replaced with `[PHONE_REDACTED]`

Redaction is applied to `summary` and `future_context_notes` fields automatically.

## 4) LRU cap: max 200 entries

When `Workflow_Memory.json` reaches 200 entries, the oldest entry is evicted before the new one
is written. This prevents unbounded growth.

## 5) Telemetry normalization: `persona_tool_usage`

The `persona_tool_usage` field accepts both dict and list formats and normalizes to a stable
list-of-dicts at write time:

```python
# Input (dict format — legacy)
{"Vault_Architect": {"api_read_file": 3, "api_search": 1}}

# Stored as (normalized list)
[
  {"persona_name": "Vault_Architect", "tool_name": "api_read_file", "count": 3},
  {"persona_name": "Vault_Architect", "tool_name": "api_search", "count": 1},
]
```

## 6) Storage layout

```
Archives/
  Workflow_Memory.json        <- all recorded workflows (max 200 entries, LRU)
workflow_templates.json       <- all workflow templates (vault root or Archives/)
```

## 7) Testing

```bash
python -m pytest Copilot_Tests/test_workflow_memory.py -v
```

Key test cases: record + retrieve, find_matching with overlap threshold, template create/get/list,
redaction of emails and phones, LRU eviction at 200 entries.

## 8) Dependencies and integrations

- `Toolkit/workflow_memory.py` — all workflow memory and template APIs
- `vault_brain.py` — calls `api_record_workflow` at mission completion
- `Archives/Workflow_Memory.json` — canonical workflow store
- `workflow_templates.json` — canonical template store

## 9) Change log and manual maintenance

- Last reviewed: 2026-05-14
- Source of truth: `Toolkit/workflow_memory.py`
- Update triggers: new template API added, max entries cap changed, redaction pattern updated, telemetry schema changed.
