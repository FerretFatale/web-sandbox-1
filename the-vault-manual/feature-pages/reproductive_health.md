# Feature: Reproductive Health Tracker

## 1) Purpose and outcomes

`Health/reproductive_health_tracker.py` is a private, **local-only** cycle and reproductive health tracking tool. It logs menstrual flow, symptoms, mood, energy, appetite, and exercise capacity by day. Data never leaves your device — no external transmission, no cloud sync.

> **Privacy notice:** All data is stored in `Health/reproductive_health_log.json` and `Health/mood_log.json` on your local filesystem only. This module is a personal logging tool. It does **not** provide medical advice, diagnoses, treatment recommendations, or fertility/pregnancy predictions. Consult a qualified healthcare provider for medical decisions.

## 2) Log a cycle day: `api_log_cycle_day()`

```python
from Health.reproductive_health_tracker import api_log_cycle_day

result = api_log_cycle_day(
    date="2026-05-14",          # ISO date, defaults to today
    flow="medium",              # "", "spotting", "light", "medium", "heavy"
    symptoms=["cramps", "fatigue"],  # see valid symptoms below
    mood="neutral",             # "", "positive", "neutral", "irritable", "anxious", "low"
    energy="low",               # "", "high", "normal", "low", "very_low"
    appetite="cravings",        # "", "increased", "normal", "decreased", "cravings"
    exercise_capacity="rest_day",  # "", "full", "reduced", "rest_day"
    notes="Lower back cramp today, early start.",
)
# {"status": "success", "data": {"date": "2026-05-14", "flow": "medium", ...}}
```

**Valid symptoms:** `cramps`, `headache`, `fatigue`, `bloating`, `backache`, `nausea`, `breast_tenderness`, `other`

Symptoms is a list — pass multiple at once. Repeated calls on the same date **update** the entry in place rather than duplicating it.

## 3) Read cycle data: `api_get_cycle_log()`

```python
from Health.reproductive_health_tracker import api_get_cycle_log

# Read all entries
result = api_get_cycle_log()

# Read with date range
result = api_get_cycle_log(start_date="2026-04-01", end_date="2026-05-01")

# {"status": "success", "data": {"entries": [...], "count": 14}}
```

## 4) Mood log: `api_log_mood()` / `api_get_mood_log()`

Mood can also be logged independently from cycle data, for days where you want to track mood without recording cycle flow:

```python
from Health.reproductive_health_tracker import api_log_mood, api_get_mood_log

api_log_mood(date="2026-05-14", mood="anxious", notes="Big presentation day")
result = api_get_mood_log(start_date="2026-05-01", end_date="2026-05-14")
```

## 5) Cycle insights: `api_get_cycle_insights()`

Returns a summary of recent cycle data — average cycle length, average flow duration, most common symptoms, mood distribution:

```python
from Health.reproductive_health_tracker import api_get_cycle_insights

result = api_get_cycle_insights(lookback_days=90)
# {
#   "status": "success",
#   "data": {
#     "entries_in_window": 24,
#     "flow_days": 18,
#     "symptom_frequency": {"cramps": 12, "fatigue": 9, ...},
#     "mood_distribution": {"neutral": 40, "low": 20, ...},
#     "energy_distribution": {"low": 35, "normal": 45, ...}
#   }
# }
```

## 6) Storage

| File | Contents |
|------|----------|
| `Health/reproductive_health_log.json` | All cycle day entries |
| `Health/mood_log.json` | Independent mood entries |

Both files are **not committed** — they are local runtime only and excluded from git. They persist between sessions as long as your local filesystem is intact.

## 7) Privacy and safety

- All data stays on your local machine. No external API calls.
- The module returns a `privacy_notice` field with every write operation as a reminder.
- This is **not** a fertility prediction tool and does not calculate ovulation windows, pregnancy probabilities, or safe/unsafe period estimates.
- For medical concerns about your cycle, consult a GP or gynaecologist.
