# Feature: Nutrition & Food Logging

## 1) Purpose and outcomes

`Health/health_tracker.py` provides AI-assisted food and nutrition logging. Describe what you ate in plain English and the vault uses an AI cascade to estimate calories and macros, then stores the result locally.

> **Non-medical notice:** Nutrition estimates are approximations only, not clinical nutrition advice. Calorie and macro values are AI-generated estimates based on typical serving sizes. Consult a registered dietitian for clinical guidance.

## 2) Log a meal: `api_log_health_metric()`

```python
from Health.health_tracker import api_log_health_metric

result = api_log_health_metric(
    food_description="Large bowl of oat porridge with a banana and a tablespoon of peanut butter",
    date="2026-05-14",   # ISO date, defaults to today
)
# {
#   "status": "success",
#   "data": {
#     "date": "2026-05-14",
#     "food": "Large bowl of oat porridge...",
#     "calories": 420,
#     "fat_g": 12.5,
#     "fibre_g": 7.2,
#     "carbs_g": 58.0,
#     "logged_at": "2026-05-14T09:45:00"
#   }
# }
```

The description is sent to the AI cascade (not an external nutrition database) — so be descriptive. "Large bowl of pasta with creamy carbonara sauce, two slices of garlic bread" gives better estimates than just "pasta".

Multiple meals per day are supported — each call appends an entry to the daily log.

## 3) Read daily nutrition data: `api_read_health_data()`

```python
from Health.health_tracker import api_read_health_data

result = api_read_health_data(date="2026-05-14")
# {
#   "status": "success",
#   "data": {
#     "date": "2026-05-14",
#     "entries": [
#       {"food": "Oat porridge...", "calories": 420, "fat_g": 12.5, ...},
#       {"food": "Chicken salad wrap", "calories": 380, "fat_g": 14.0, ...}
#     ],
#     "totals": {"calories": 800, "fat_g": 26.5, "fibre_g": 12.4, "carbs_g": 94.0}
#   }
# }
```

## 4) Nutrition targets: `Health/nutrition_targets.json`

You can store personal daily macro targets in this file. The appointment_pack module references these targets when building your GP summary. Set via the health management persona or direct file edit.

Example structure:
```json
{
  "calories": 1800,
  "protein_g": 80,
  "fat_g": 60,
  "carbs_g": 220,
  "fibre_g": 25
}
```

## 5) Food plan: `Health/food_plan.json`

A structured weekly meal plan, managed through the [Shopping Assistant](feature-viewer.html?p=shopping_and_kitchen). The food plan feeds into shopping list generation — what's on the plan becomes a shopping requirement.

## 6) Storage

| File | Contents |
|------|----------|
| `Health/Food_Logs/food_log_YYYY-MM-DD.json` | Daily food log entries (one file per day) |
| `Health/nutrition_targets.json` | Personal macro targets |
| `Health/food_plan.json` | Weekly meal plan |

Files are local-only and not committed to git.

## 7) Practical tips

- Log meals as you eat them rather than reconstructing at end of day — accuracy drops quickly from memory.
- The vault can aggregate several days of logs into an appointment summary via [Appointment Packs](feature-viewer.html?p=health_overview).
- Combine with [Hydration](feature-viewer.html?p=hydration) tracking for a more complete daily health picture.
- The [Shopping Assistant](feature-viewer.html?p=shopping_and_kitchen) can cross-reference your food plan against your kitchen inventory to generate a targeted shopping list.
