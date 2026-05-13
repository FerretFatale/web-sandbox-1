# Feature: Hydration Tracking

## 1) Purpose and outcomes

`Health/hydration_tracker.py` tracks daily fluid intake against a configurable daily target. Simple, local-only, no dependencies. Log drinks throughout the day and see how close you are to your goal.

> **Non-medical notice:** This module tracks self-reported fluid intake. It does not provide medical advice about hydration requirements. Individual hydration needs vary based on body weight, activity level, climate, and health conditions. Consult a healthcare provider for clinical guidance.

## 2) Log a drink: `api_log_hydration()`

```python
from Health.hydration_tracker import api_log_hydration

result = api_log_hydration(
    amount_ml=350,        # fluid amount in millilitres
    drink_type="water",   # optional description (water, coffee, tea, juice, etc.)
    date="2026-05-14",    # defaults to today
    notes="Post-workout",
)
# {
#   "status": "success",
#   "data": {
#     "date": "2026-05-14",
#     "entry": {"amount_ml": 350, "drink_type": "water", ...},
#     "daily_total_ml": 950,
#     "target_ml": 2000,
#     "progress_pct": 47.5
#   }
# }
```

Maximum single entry is 2000 ml (safety cap against accidental over-logging).

## 3) Read today's intake: `api_get_hydration_today()`

```python
from Health.hydration_tracker import api_get_hydration_today

result = api_get_hydration_today()
# {
#   "status": "success",
#   "data": {
#     "date": "2026-05-14",
#     "total_ml": 1400,
#     "target_ml": 2000,
#     "remaining_ml": 600,
#     "progress_pct": 70.0,
#     "entries": [...]
#   }
# }
```

## 4) Read historical data: `api_get_hydration_history()`

```python
from Health.hydration_tracker import api_get_hydration_history

result = api_get_hydration_history(start_date="2026-05-01", end_date="2026-05-14")
# {"status": "success", "data": {"days": [...], "average_daily_ml": 1650}}
```

## 5) Set your daily target: `api_set_hydration_target()`

The default target is **2000 ml/day**. Change it to match your needs:

```python
from Health.hydration_tracker import api_set_hydration_target

result = api_set_hydration_target(target_ml=2500, approved=True)
# {"status": "success", "data": {"target_ml": 2500}}
```

## 6) Storage

| File | Contents |
|------|----------|
| `Health/hydration_log.json` | All intake entries keyed by date |
| `Health/hydration_target.json` | Your configurable daily target |

Files are local-only and not committed to git.

## 7) Practical tips

- Log coffee, tea, and other beverages — they all count toward daily fluid intake (with different hydration values, but the tracker records ml without adjusting for diuretic effects).
- The morning briefing can include today's hydration progress if the health persona is active.
- Low hydration averages surface as insights in the Health Insight Queue.
