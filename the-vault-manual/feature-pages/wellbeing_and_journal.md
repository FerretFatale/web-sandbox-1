# Feature: Wellbeing & Journal

## 1) Purpose and outcomes

This page covers three closely related personal health tools:

- **`Health/wellbeing_state.py`** — daily focus intent and wellbeing check-ins
- **`Health/journal.py`** — private daily journal entries with optional mood context
- **`Health/psych_library.py`** — coping strategy library and anxiety/panic episode log

All data is **strictly local**. None of it is sent to external services. AI access to journal content requires an explicit opt-in environment variable and is disabled by default.

> **Important:** The psych library and journal are personal support tools only — not crisis services or clinical treatment. If you are in immediate danger, call emergency services (000 in Australia). For mental health crisis support, call Lifeline: **13 11 14** (Australia).

---

## 2) Wellbeing state: `Health/wellbeing_state.py`

### Daily check-in: `api_log_wellbeing_checkin()`

Sets your wellbeing state for the day — energy, mood, pain level, and a focus intent. The focus intent can optionally be injected into your schedule as a daily header.

```python
from Health.wellbeing_state import api_log_wellbeing_checkin

result = api_log_wellbeing_checkin(
    energy_level=6,        # 1–10
    mood_rating=7,         # 1–10
    pain_level=2,          # 0–10 (0 = none)
    focus_intent="Work on project proposals, keep today light.",
    tone_mode="focused",   # default | playful | focused | gentle | energised
    approved=True,
)
# {"status": "success", "data": {"date": "2026-05-14", "energy_level": 6, ...}}
```

**Tone modes** adjust how the vault communicates with you for the rest of the day:
- `default` — normal Vault tone
- `gentle` — softer, more patient responses
- `focused` — concise, goal-oriented
- `energised` — upbeat and motivating
- `playful` — light and fun

### Read today's state: `api_get_wellbeing_state()`

```python
from Health.wellbeing_state import api_get_wellbeing_state

result = api_get_wellbeing_state()
# {"status": "success", "data": {"date": "...", "energy_level": 6, "focus_intent": "...", ...}}
```

### Schedule injection

If `WELLBEING_SCHEDULE_INJECTION=true` is set in your `.env`, the living schedule module will prepend today's `focus_intent` as an annotation at the top of the day's schedule when you call `api_generate_schedule()`.

---

## 3) Journal: `Health/journal.py`

### Add an entry: `api_add_journal_entry()`

```python
from Health.journal import api_add_journal_entry

result = api_add_journal_entry(
    text="Had a rough morning but managed to get the gym session in. Feeling better now.",
    entry_type="general",   # general | health | mood | symptom | reflection
    mood_rating=6,          # 1–10, optional
    date="2026-05-14",      # defaults to today
    tags=["gym", "morning", "stress"],
)
# {"status": "success", "data": {"entry_id": "...", "date": "...", ...}}
```

Multiple entries per day are supported. Each entry gets a unique ID.

### Read entries: `api_get_journal_entries()`

```python
from Health.journal import api_get_journal_entries

result = api_get_journal_entries(date="2026-05-14")
# Returns all entries for that date

result = api_get_journal_entries(start_date="2026-05-01", end_date="2026-05-14")
```

### AI access control

By default, AI cascades cannot read journal entries. To allow the AI to glance at recent entries (for context in wellbeing queries), explicitly set `WELLBEING_JOURNAL_AI_GLANCE=true` in your `.env`. This was deliberately defaulted to false per a conscious privacy decision.

### Storage

Journal entries are stored in `Health/Journal/journal_YYYY-MM-DD.json` — one file per day, local-only.

---

## 4) Psych support library: `Health/psych_library.py`

### Add a coping strategy: `api_add_coping_strategy()`

Build your own library of what works for you:

```python
from Health.psych_library import api_add_coping_strategy

result = api_add_coping_strategy(
    name="Box breathing",
    strategy_type="breathing",   # breathing | grounding | movement | distraction
                                 # social | sensory | cognitive | journaling | other
    description="Inhale 4 counts, hold 4, exhale 4, hold 4. Repeat 4 times.",
    liked=True,
    notes="Works best when I catch anxiety early.",
)
```

### Get coping strategies: `api_get_coping_strategies()`

```python
from Health.psych_library import api_get_coping_strategies

# Get all liked strategies
result = api_get_coping_strategies(liked_only=True)

# Get by type
result = api_get_coping_strategies(strategy_type="grounding")
```

### Log a panic/anxiety episode: `api_log_panic_episode()`

```python
from Health.psych_library import api_log_panic_episode

result = api_log_panic_episode(
    trigger="Work deadline pressure",
    intensity=6,          # 1–10
    duration_minutes=20,
    strategies_used=["Box breathing", "Cold water on face"],
    outcome="Calmed down after ~15 min. Finished the work task.",
    notes="Started escalating during a Teams call.",
)
# Episode is also filed as a journal entry automatically
```

### Read episode history: `api_get_panic_log()`

```python
from Health.psych_library import api_get_panic_log

result = api_get_panic_log(days_back=90)
# Included in psych appointment packs
```

### Storage

| File | Contents |
|------|----------|
| `Health/psych_library.json` | Coping strategy library |
| `Health/panic_log.json` | Anxiety/panic episode log |
| `Health/Journal/journal_YYYY-MM-DD.json` | Journal entries (episodes filed here too) |
