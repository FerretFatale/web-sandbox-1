# Feature: Fitness & Exercise

## 1) Purpose and outcomes

`Health/fitness_tracker.py` provides local-only fitness goal setting, workout routine management, and workout logging. Track what you do, build structured routines, and review your exercise history without leaving the vault.

> **Non-medical notice:** This module tracks fitness activities only. It does not provide medical advice, diagnoses, exercise prescriptions, or injury guidance. Consult a healthcare or fitness professional before starting any new exercise programme, especially if you have existing health conditions.

## 2) Fitness goals: `api_set_fitness_goal()` / `api_list_fitness_goals()`

```python
from Health.fitness_tracker import api_set_fitness_goal, api_list_fitness_goals

result = api_set_fitness_goal(
    title="Run 5km without stopping",
    description="Build up running endurance over 8 weeks",
    category="cardio",       # strength | cardio | flexibility | balance | general | other
    target_date="2026-07-01",
    notes="Start with run/walk intervals",
    approved=True,
)
# {"status": "success", "action": "added", "goal": {"id": "...", "title": "...", ...}}

# List active goals
result = api_list_fitness_goals(status_filter="active")
```

**Goal statuses:** `active`, `paused`, `completed`, `archived`

## 3) Workout routines: `api_save_workout_routine()` / `api_list_workout_routines()`

A routine is a named, repeatable workout template. You build it once and log against it.

```python
from Health.fitness_tracker import api_save_workout_routine

result = api_save_workout_routine(
    name="Upper Body Strength A",
    exercises=[
        {"name": "Push-ups", "sets": 3, "reps": 12, "rest_seconds": 60},
        {"name": "Dumbbell rows", "sets": 3, "reps": 10, "weight_kg": 8, "rest_seconds": 90},
        {"name": "Shoulder press", "sets": 3, "reps": 10, "weight_kg": 6, "rest_seconds": 90},
    ],
    notes="Rest 2–3 days before repeating.",
    approved=True,
)
# {"status": "success", "action": "saved", "routine_id": "..."}
```

**Exercise fields:** `name` (required), `sets`, `reps`, `weight_kg`, `duration_seconds`, `distance_km`, `rest_seconds`, `notes`

## 4) Log a workout: `api_log_workout()`

```python
from Health.fitness_tracker import api_log_workout

result = api_log_workout(
    date="2026-05-14",
    routine_id="routine_abc123",   # optional: link to a saved routine
    exercises_completed=[
        {"name": "Push-ups", "sets_completed": 3, "reps_completed": [10, 10, 8]},
        {"name": "Dumbbell rows", "sets_completed": 3, "reps_completed": [10, 10, 10], "weight_kg": 8},
    ],
    duration_minutes=40,
    effort="moderate",             # very_light | light | moderate | hard | very_hard
    notes="Felt good. Pushed through the last set.",
    approved=True,
)
# {"status": "success", "workout_id": "..."}
```

## 5) Review history: `api_get_workout_history()`

```python
from Health.fitness_tracker import api_get_workout_history

result = api_get_workout_history(start_date="2026-05-01", end_date="2026-05-14")
# {"status": "success", "data": {"workouts": [...], "count": 6}}
```

## 6) Storage

| File | Contents |
|------|----------|
| `Health/fitness_goals.json` | Fitness goal records |
| `Health/workout_routines.json` | Saved workout routine templates |
| `Health/workout_log.json` | Logged workout sessions |

All files are local-only and not committed to git.

## 7) Workflow: building a habit

1. Create fitness goals with `api_set_fitness_goal()` — these give direction.
2. Build routines with `api_save_workout_routine()` — these are reusable templates.
3. Log each session with `api_log_workout()` — link to a routine ID for easy reference.
4. Review history with `api_get_workout_history()` — see trends over time.
5. Optionally create an ambition in the [Goals system](feature-viewer.html?p=goals) and let it generate a full plan including schedule blocks.
