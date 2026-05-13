# Feature: Research

## 1) Purpose and outcomes

The Vault research system has two distinct layers: a personal research project manager (`Internal_Memory_Retrieval/research_manager.py`) for storing structured notes on topics, and a specialized actuarial data source registry (`Research/actuarial_tables.py`) for validated data table sources. Web research is routed through the Websearch module.

## 2) Personal research projects: `research_manager.py`

Lightweight project store for ongoing personal research. Each project is a JSON file in `Personal_and_Health/Research_Projects/`.

### `api_create_research_project(project_title: str, initial_content: str) -> dict`

Creates a new research project with an initial note.

```python
from Internal_Memory_Retrieval.research_manager import (
    api_create_research_project,
    api_add_research_note,
)

# Create a new project
result = api_create_research_project(
    project_title="NDIS Funding Categories",
    initial_content="Initial research on support categories and eligibility..."
)
# {"status": "success", "data": {"message": "Research project 'NDIS Funding Categories' created successfully."}}
# {"status": "error", "message": "Research project '...' already exists."}
```

**Storage:** `<vault_root>/Personal_and_Health/Research_Projects/<title>.json`

**Project file format:**
```json
{
  "title": "NDIS Funding Categories",
  "created_at": "2026-05-14T12:00:00",
  "notes": [
    {"timestamp": "2026-05-14T12:00:00", "content": "Initial research..."}
  ]
}
```

### `api_add_research_note(project_title: str, note_content: str) -> dict`

Appends a timestamped note to an existing project.

```python
result = api_add_research_note(
    project_title="NDIS Funding Categories",
    note_content="Capacity Building supports include therapy, skill development, and support coordination."
)
# {"status": "success", "data": {"message": "Note added to research project '...' successfully."}}
# {"status": "error", "message": "Research project '...' does not exist."}
```

## 3) Actuarial data registry: `Research/actuarial_tables.py`

A validated registry of approved statistical data sources for financial modelling, life expectancy, and actuarial calculations. Sources must be registered and approved before use.

### `api_list_actuarial_table_sources() -> dict`

```python
from Research.actuarial_tables import api_list_actuarial_table_sources

result = api_list_actuarial_table_sources()
# {"status": "success", "data": {"sources": [{"id": str, "name": str, "status": str}, ...]}}
```

### `api_get_actuarial_tables_status() -> dict`

Returns the current registry state: number of approved sources, pending proposals, last updated.

### `api_query_actuarial_table_stub(source_id: str, ...) -> dict`

Queries a stub data representation for a registered source. Used for testing and dry-run calculations.

```python
from Research.actuarial_tables import api_query_actuarial_table_stub

result = api_query_actuarial_table_stub(
    source_id="abs_life_tables_2022",
    age=35,
    sex="female",
)
# {"status": "success", "data": {"life_expectancy": float, "source": str}}
```

### `api_list_approved_actuarial_sources() -> dict`

Returns only sources with `"status": "approved"`. Use this before any actuarial calculation to confirm source availability.

### `api_get_actuarial_source(source_id: str) -> dict`

Fetch full metadata for a specific source.

### `api_validate_actuarial_source_registry() -> dict`

Checks registry integrity: all required fields present, no duplicate IDs, no approved sources with missing metadata.

### `api_propose_actuarial_source(source_id: str, ...) -> dict`

Adds a new source to the registry in `"pending_review"` state. Requires human approval in `Human_Input.txt` before it becomes `"approved"`.

### `api_query_actuarial_table_fixture(source_id: str, ...) -> dict`

Queries fixture data (test data) for a source. Used in tests without live API calls.

## 4) Websearch module

Web research is handled by `Websearch/` rather than this module:

```
Websearch/
  web_search.py           ← general web search
  deep_research.py        ← multi-source deep research with synthesis
  research_validator.py   ← source credibility and claim validation
```

Websearch APIs follow the same `{"status": "success"|"error", "data": {...}}` shape. All web research calls route through omni_router (R1 rule applies).

## 5) Research storage layout

```
Personal_and_Health/
  Research_Projects/      ← personal research project JSON files
Research/
  actuarial_tables.py     ← actuarial data registry
  actuarial_sources.json  ← registered source definitions
Websearch/
  web_search.py
  deep_research.py
  research_validator.py
```

## 6) Research governance

- New actuarial sources require `api_propose_actuarial_source` + human approval before use.
- All web research calls route through omni_router (SR-001 applies).
- Research outputs written to vault dirs are never committed to git by default (treat as personal data).
- Source proposals that pass `api_validate_actuarial_source_registry` can be approved via `Human_Input.txt`.

## 7) Testing

```bash
python -m pytest Copilot_Tests/test_actuarial_tables.py -v
```

Actuarial tests use fixture data (`api_query_actuarial_table_fixture`) to verify query logic without live data dependencies.

## 8) Dependencies and integrations

- `Internal_Memory_Retrieval/research_manager.py` — personal project store
- `Research/actuarial_tables.py` — actuarial registry and queries
- `Websearch/` — web research and synthesis
- `Toolkit/omni_router.py` — all AI calls for web research synthesis
- `Human_Input.txt` — source approval gate

## 9) Change log and manual maintenance

- Last reviewed: 2026-05-14
- Source of truth: `Internal_Memory_Retrieval/research_manager.py`, `Research/actuarial_tables.py`
- Update triggers: new research source registered/approved, websearch API changed, new research module added.
