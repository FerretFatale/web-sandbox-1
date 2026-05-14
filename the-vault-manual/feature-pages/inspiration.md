# Feature: Inspiration

## 1) Purpose and outcomes

Inspiration is the 17th persona in `persona_manifest.json`. Its role is to receive raw ambitions
from the operator, clarify them without mutation, and hold them for future routing. It also owns
the affirmation engine: generating daily affirmation sets from personal context and surfacing
creative assets for design work. Inspiration explicitly does NOT make goal decisions or plan
decompositions — those require human boundary approval.

## 2) Persona definition

```json
{
  "persona_id": "Inspiration",
  "position": 17,
  "role": "receive raw ambitions, clarify, route",
  "allowed_tools": [
    "api_intake_ambition",
    "api_list_ambitions",
    "api_generate_daily_affirmations",
    "api_get_affirmations_cached",
    "api_generate_morning_affirmations",
    "api_read_morning_affirmations"
  ]
}
```

## 3) Ambition intake: `api_intake_ambition`

Saves a raw ambition to the ambitions queue. Zero AI call. Zero goal mutation.

```python
result = api_intake_ambition(
    text="I want to build a ferret rescue sanctuary with on-site vets.",
    source="morning_voice_note",
)
# {"status": "success", "ambition_id": "AMB_abc123", "stored_at": "2026-05-14T08:00:00"}
```

Raw text is stored exactly as entered. No AI processing occurs. No goal objects are created.

### `api_list_ambitions() -> dict`

Read-only listing of all items in the ambitions queue.

```python
result = api_list_ambitions()
# {
#   "status": "success",
#   "ambitions": [
#     {"ambition_id": "AMB_abc123", "text": "...", "stored_at": str, "source": str},
#     ...
#   ],
#   "count": 1
# }
```

**Tools Inspiration does NOT own** (require human boundary decision via `Human_Input_Proposal_Queue.txt`):
- `api_generate_ambition_plan` — converts ambition to goal plan
- `api_review_ambition_plan` — reviews a generated plan
- `api_respond_to_ambition_plan` — responds to plan review
- `api_insert_ambition_plan` — inserts plan into Goals system

## 4) Affirmation engine: `Toolkit/affirmation_engine.py`

### `api_generate_daily_affirmations(force: bool = False) -> dict`

Generates today's affirmation set from personal context.

```python
from Toolkit.affirmation_engine import api_generate_daily_affirmations

result = api_generate_daily_affirmations(force=False)
# {
#   "status": "success" | "fallback" | "error",
#   "date": "2026-05-14",
#   "base": ["I am capable.", "I build every day."],      <- static from inspiration_feed.json
#   "generated": ["Your ferret work inspires others."],  <- AI-generated additions
#   "combined": ["I am capable.", ..., "Your ferret..."], <- base + generated
#   "source": "gemini" | "cache" | "base_only",
#   "word_of_the_year": "Expansion"
# }
```

**Input files read:**
- `inspiration_feed.json` — base affirmations and word of the year
- `life_goals_state.json` — current life goals for personalization
- `wellness_state.json` — current wellness context

**Cache behavior:**
- `force=False`: returns cached result if today's cache exists (no AI call)
- `force=True`: regenerates even if cache exists

**Fallback:** If Gemini call fails, returns `base` affirmations only with `"source": "base_only"`.

### `api_get_affirmations_cached() -> dict`

Returns today's cached affirmations without any regeneration. Safe to call at any time.

```python
result = api_get_affirmations_cached()
# {"status": "success", "affirmations": [...], "date": "2026-05-14", "cached": True}
# or {"status": "not_cached", "message": "No cache for today."} if not yet generated
```

### `api_clear_affirmations_cache() -> dict`

Clears today's cache so the next call to `api_generate_daily_affirmations` forces regeneration.

## 5) Morning affirmation ritual

```python
# Generate morning affirmations (same as daily but for morning display)
api_generate_morning_affirmations()

# Read the morning affirmations (read-only)
api_read_morning_affirmations()
```

## 6) Creative and design inspiration

Inspiration also connects to the creative asset toolkit for design and visual inspiration work.

### `Creative/canva_asset_registry.py`

```python
api_list_canva_assets()          # list all registered Canva assets
api_get_canva_asset(asset_id)    # get a specific asset
api_register_canva_asset(...)    # register a new Canva asset
api_validate_canva_asset_registry()  # validate the asset registry
```

### `Creative/design_brief_generator.py`

```python
api_create_design_brief(...)     # generate a design brief for a project
api_list_design_briefs()         # list all design briefs
api_review_design_brief(brief_id)  # review an existing brief
```

### `Creative/canva_brand_kits.py`

```python
api_list_canva_brand_kits()      # list all brand kits
api_register_canva_brand_kit(...)  # register a new brand kit
api_list_canva_templates()       # list available Canva templates
api_register_canva_template(...) # register a template
```

## 7) Tests

```bash
python -m pytest Copilot_Tests/test_inspiration.py -v
```

Key test cases (from `Skills_Index.json`):
- `test_load_inspiration_returns_base_affirmations` — base affirmations loaded when cache cold
- `test_empty_inspiration_returns_error` — empty `inspiration_feed.json` returns error
- `test_inspiration_persona_exists_and_is_valid` — persona in `persona_manifest.json` with required fields
- `test_inspiration_owns_ambition_intake_tools` — `api_intake_ambition` and `api_list_ambitions` are allowed
- `test_b2_inspiration_no_add_new_goal` — `api_add_new_goal` is NOT in Inspiration's allowed_tools

## 8) Storage layout

```
Toolkit/
  affirmation_engine.py           <- api_generate_daily_affirmations, api_get_affirmations_cached
Creative/
  canva_asset_registry.py         <- Canva asset management
  design_brief_generator.py       <- design brief generation
  canva_brand_kits.py             <- brand kit management
Goals/
  inspiration_feed.json           <- base affirmations and word of the year
  life_goals_state.json           <- life goals (read-only by affirmation engine)
Health/
  wellness_state.json             <- wellness context (read-only by affirmation engine)
```

## 9) Dependencies and integrations

- `Toolkit/affirmation_engine.py` — affirmation generation
- `persona_manifest.json` — Inspiration persona definition (entry 17)
- `inspiration_feed.json` — base affirmation data
- `life_goals_state.json` — personalization input
- `wellness_state.json` — wellness context input
- `Human_Input_Proposal_Queue.txt` — required for ambition pipeline expansion

## 10) Change log and manual maintenance

- Last reviewed: 2026-05-14
- Source of truth: `Toolkit/affirmation_engine.py`, `persona_manifest.json` entry 17
- Update triggers: new affirmation source added, ambition intake schema changed, creative tools added.

## 11) Change log and manual maintenance

Keep this page synchronized with Inspiration persona scope and affirmation engine updates.
When allowed tools or forbidden boundaries change, update this document and re-run publish checks.
