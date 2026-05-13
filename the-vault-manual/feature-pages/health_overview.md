# Feature: Health Overview

## 1) Purpose and outcomes

The Health module is a comprehensive **local-only** personal health administration system. It is not a medical device and does not provide diagnoses or treatment advice. It gives you a structured way to track, log, and summarise your health data so you can arrive at appointments informed, notice patterns in your own body, and manage the administrative side of healthcare.

The Health module covers: nutrition logging, fitness and exercise, sleep, hydration, cycle tracking, mood, prescriptions, wellbeing state, journaling, mental health coping strategies, appointment packs, and a health to-do queue.

> All health data is stored locally in `Health/`. Nothing is transmitted to external services.

## 2) Health administrative to-do: `Health/health_lieutenant.py`

Track health appointments, prescription refills, test results, referrals, and check-ins as an action table.

```python
from Health.health_lieutenant import api_add_health_todo, api_list_health_todos, api_update_health_todo_status

# Add a task
result = api_add_health_todo(
    task="Book GP appointment — annual blood test",
    task_type="appointment",   # appointment | prescription | checkin | test_results | referral | other
    priority="high",           # high | medium | low
    due_date="2026-06-01",
    notes="Ask about iron levels",
)
# {"status": "success", "action": "added", "todo": {"id": "...", "task": "...", ...}}

# List all pending
result = api_list_health_todos(status_filter="pending")

# Mark done
result = api_update_health_todo_status(todo_id="abc123", new_status="done")
```

**Statuses:** `pending`, `in_progress`, `done`, `cancelled`

## 3) Personal health profile: `Health/personal_profile.json`

Stores your baseline personal health profile — age, height, weight, allergies, chronic conditions, medications summary. Read and updated via the health persona.

## 4) Health insight queue: `Health/health_insight_queue.py`

Queues health-related insights and nudges for the morning briefing. Insights are generated from patterns in logged data (sleep, hydration, nutrition) and surfaced once — they don't repeat until new data warrants it.

```python
from Health.health_insight_queue import api_get_pending_insights, api_mark_insight_seen

insights = api_get_pending_insights()
api_mark_insight_seen(insight_id="insight_abc123")
```

## 5) Appointment preparation packs: `Health/appointment_pack.py`

Generates a structured data packet ready to bring to a medical appointment. Assembles recent logs (food/calories, exercise, sleep, mood, prescriptions) into a single summary. No diagnosis or medical interpretation — data assembly only.

```python
from Health.appointment_pack import api_generate_appointment_pack

# General GP pack (last 14 days)
result = api_generate_appointment_pack(pack_type="general_doctor", days_back=14)

# Psych appointment pack (mood trends, panic episodes, coping strategies)
result = api_generate_appointment_pack(pack_type="psych", days_back=30)

# {"status": "success", "pack_path": "Health/Appointment_Packs/pack_2026-05-14_general_doctor.json"}
```

**Pack types:** `general_doctor`, `specialist`, `psych`

Saved to `Health/Appointment_Packs/` as JSON. You can read the file or ask the vault to summarise it.

## 6) Health module map

| Feature | File | Page |
|---------|------|------|
| Cycle / period tracking | `Health/reproductive_health_tracker.py` | [Reproductive Health](feature-viewer.html?p=reproductive_health) |
| Fitness & exercise | `Health/fitness_tracker.py` | [Fitness & Exercise](feature-viewer.html?p=fitness_and_exercise) |
| Nutrition & food logging | `Health/health_tracker.py` | [Nutrition & Food](feature-viewer.html?p=nutrition_and_food) |
| Sleep tracking | `Health/sleep_tracker.py` | [Sleep](feature-viewer.html?p=sleep) |
| Hydration tracking | `Health/hydration_tracker.py` | [Hydration](feature-viewer.html?p=hydration) |
| Prescriptions | `Health/prescription_tracker.py` | [Prescriptions](feature-viewer.html?p=prescriptions) |
| Wellbeing + journal | `Health/wellbeing_state.py`, `Health/journal.py` | [Wellbeing & Journal](feature-viewer.html?p=wellbeing_and_journal) |
| Psych / coping | `Health/psych_library.py` | [Psych Support](feature-viewer.html?p=psych_support) |
| Kitchen / food plan | `Toolkit/kitchen_inventory.py` | [Kitchen & Shopping](feature-viewer.html?p=shopping_and_kitchen) |
| Admin to-dos | `Health/health_lieutenant.py` | This page |
| Appointment packs | `Health/appointment_pack.py` | This page |
