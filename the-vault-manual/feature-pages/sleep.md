# Feature: Sleep Tracking

## 1) Purpose and outcomes

`Health/sleep_tracker.py` logs your sleep sessions — bedtime, wake time, duration, quality, and notes. Over time it builds a personal sleep history you can review for patterns or bring to a health appointment.

> **Non-medical notice:** This module records self-reported sleep data only. It does not diagnose sleep disorders, provide medical advice, or analyse sleep stages. Consult a GP or sleep specialist for medical concerns about sleep.

## 2) Log a sleep session: `api_log_sleep()`

```python
from Health.sleep_tracker import api_log_sleep

result = api_log_sleep(
    bedtime="23:00",         # HH:MM 24h format
    wake_time="07:15",       # HH:MM 24h format
    quality_rating=7,        # 1–10 (1 = terrible, 10 = perfect)
    date="2026-05-14",       # ISO date of wake-up day, defaults to today
    notes="Woke up once around 3am, fell back asleep quickly.",
)
# {
#   "status": "success",
#   "data": {
#     "date": "2026-05-14",
#     "bedtime": "23:00",
#     "wake_time": "07:15",
#     "duration_hours": 8.25,
#     "quality_rating": 7,
#     "notes": "..."
#   }
# }
```

Duration is calculated automatically from bedtime and wake time, handling midnight crossover correctly.

Quality rating is self-reported (1–10). There is no automatic scoring — rate how you felt when you woke up.

## 3) Read sleep data: `api_read_sleep_data()`

```python
from Health.sleep_tracker import api_read_sleep_data

# Single day
result = api_read_sleep_data(date="2026-05-14")

# Date range
result = api_read_sleep_data(start_date="2026-05-01", end_date="2026-05-14")
# {
#   "status": "success",
#   "data": {
#     "entries": [...],
#     "average_duration_hours": 7.4,
#     "average_quality_rating": 6.8
#   }
# }
```

## 4) Sleep summary: `api_get_sleep_summary()`

Returns a weekly/monthly digest — average duration, average quality, best nights, worst nights:

```python
from Health.sleep_tracker import api_get_sleep_summary

result = api_get_sleep_summary(days_back=30)
```

## 5) Storage

| File | Contents |
|------|----------|
| `Health/Sleep_Logs/sleep_log_YYYY-MM-DD.json` | Daily sleep entries (one file per wake date) |

Files are local-only and not committed to git.

## 6) Integration with other health features

- Sleep data is included in [Appointment Pack](feature-viewer.html?p=health_overview) summaries.
- The [Wellbeing State](feature-viewer.html?p=wellbeing_and_journal) check-in can reference how rested you feel.
- If you're using [Routines](feature-viewer.html?p=routines), a consistent bedtime routine can be built and tracked against your sleep log.
- Low quality ratings over multiple nights can surface as insights in the Health Insight Queue for the morning briefing.
