# Feature: Contextual Thinking

## 1) Purpose and outcomes

Contextual Thinking is the vault's runtime telemetry and behavioral analytics layer. It tracks which
personas and bots are used, how often, and with what outcomes. It also provides sentiment analysis
for user inputs and maintains persona usage profiles. All data is stored locally in
`Contextual_Thinking/` and is never committed to the repository.

## 2) Bot/persona profiling: `Contextual_Thinking/bot_profiler.py`

### `api_get_use_profiles() -> dict`

Returns all current use profiles for all bots/personas tracked in the system.

```python
from Contextual_Thinking.bot_profiler import api_get_use_profiles

result = api_get_use_profiles()
# {
#   "status": "success",
#   "profiles": [
#     {
#       "bot_id": "Vault_Architect",
#       "task_categories": {"refactor": 12, "audit": 5},
#       "success_rate": 0.94,
#       "last_used": "2026-05-14T11:00:00"
#     },
#     ...
#   ]
# }
```

### `api_log_bot_usage(bot_id, task_category, task_description, success, feedback) -> dict`

Logs a single bot/persona usage event.

```python
from Contextual_Thinking.bot_profiler import api_log_bot_usage

result = api_log_bot_usage(
    bot_id="Vault_Architect",
    task_category="refactor",
    task_description="Batch 5 feature page rebuild",
    success=True,
    feedback="Fast, complete output",
)
# {"status": "success", "logged": {...}}
```

### `api_update_bot_profile(bot_id: str, ...) -> dict`

Updates the stored profile for a bot. Called automatically after each logged usage.

Storage files:
- `Contextual_Thinking/bot_usage_history.json` — raw event log
- `Contextual_Thinking/use_profile.json` — current session profile
- `Use_Profiles.json` (vault root) — historical profile archive

## 3) Persona tracker: `Contextual_Thinking/persona_tracker.py`

### `api_log_persona_usage(persona_id, task_type, tools_used, success, mission_id) -> dict`

Logs a persona invocation with mission context. Called by `vault_brain.py` at the end of each run.

```python
from Contextual_Thinking.persona_tracker import api_log_persona_usage

result = api_log_persona_usage(
    persona_id="Vault_Architect",
    task_type="code_review",
    tools_used=["api_read_file", "api_search"],
    success=True,
    mission_id="MISSION_2026_001",
)
# {"status": "success", "logged": {...}}
```

### `api_get_persona_profile(persona_id: str) -> dict`

Returns a persona's aggregated usage profile: total invocations, success rate, common task types,
most-used tools.

```python
result = api_get_persona_profile("Vault_Architect")
# {
#   "status": "success",
#   "profile": {
#     "persona_id": "Vault_Architect",
#     "total_invocations": 143,
#     "success_rate": 0.96,
#     "common_tasks": ["refactor", "audit", "build"],
#     "top_tools": ["api_read_file", "api_list_dir"]
#   }
# }
```

Storage: `Contextual_Thinking/persona_use_profiles.json`

## 4) Sentiment analysis: `Contextual_Thinking/sentiment_analyzer.py`

### `api_analyze_sentiment(text: str) -> dict`

Analyzes the emotional tone of a user message to adjust persona response style.

```python
from Contextual_Thinking.sentiment_analyzer import api_analyze_sentiment

result = api_analyze_sentiment("I am really frustrated with this not working")
# {
#   "status": "success",
#   "sentiment": "negative",
#   "intensity": 0.72,
#   "tone_tags": ["frustrated", "urgent"],
#   "recommended_style": "empathetic_direct"
# }
```

Called by `vault_brain.py` on user intake as `_sa_analyze`. The result is passed to the active
persona's response context to modulate tone. Import alias used: `from
Contextual_Thinking.sentiment_analyzer import api_analyze_sentiment as _sa_analyze`.

## 5) Cost tracker: `Contextual_Thinking/cost_tracker.py`

Tracks cumulative AI API costs across all sessions. Integrates with `Toolkit/models_manager.py`
token pricing data.

```python
from Contextual_Thinking.cost_tracker import api_get_session_cost_summary

result = api_get_session_cost_summary()
# {"status": "success", "total_cost_usd": 0.34, "model_breakdown": {...}}
```

## 6) Storage layout

```
Contextual_Thinking/
  bot_profiler.py                <- bot/persona usage logger
  persona_tracker.py             <- persona profile aggregation
  sentiment_analyzer.py          <- user sentiment detection
  cost_tracker.py                <- API cost tracking
  bot_usage_history.json         <- raw bot usage log
  persona_use_profiles.json      <- aggregated persona profiles
  use_profile.json               <- active session profile
  HuggingFace_Catalog.md         <- HuggingFace model reference catalog
  Goals_Calendar.json            <- goals calendar snapshot
  Master_Calendar.json           <- master calendar snapshot
  Vault_Directory_Tree.txt       <- last-generated vault directory tree
  Human_Readable_Overview.txt    <- last-generated human-readable vault summary
  kaos_paths.py                  <- path resolution utilities
  Skills_Index.json              <- snapshot of Skills_Index at last sync
```

## 7) Integration with vault_brain.py

`vault_brain.py` imports from `Contextual_Thinking` on startup (lines 58, 64, 303):

```python
from Contextual_Thinking.bot_profiler import api_log_bot_usage        # line 58
from Contextual_Thinking.persona_tracker import api_log_persona_usage  # line 64
from Contextual_Thinking.sentiment_analyzer import api_analyze_sentiment as _sa_analyze  # line 303
```

All three are called automatically during mission execution. If any import fails, the vault
degrades gracefully (imports are wrapped in try/except with a None fallback).

`vault_brain.py` also reads `Contextual_Thinking/Persona_Manifest.json` as a secondary reference
for persona validation (cross-checked against the root `persona_manifest.json`).

## 8) Testing

```bash
python -m pytest Copilot_Tests/test_contextual_thinking.py -v
```

## 9) Dependencies and integrations

- `Contextual_Thinking/bot_profiler.py` — usage telemetry
- `Contextual_Thinking/persona_tracker.py` — persona profile aggregation
- `Contextual_Thinking/sentiment_analyzer.py` — tone detection
- `Contextual_Thinking/cost_tracker.py` — cost tracking
- `vault_brain.py` — primary consumer (imports all four on boot)
- `Toolkit/models_manager.py` — model pricing for cost tracker
- `Use_Profiles.json` (vault root) — historical profile archive

## 10) Change log and manual maintenance

- Last reviewed: 2026-05-14
- Source of truth: `Contextual_Thinking/` directory
- Update triggers: new tracker module added, sentiment categories changed, persona_tracker schema changed.
