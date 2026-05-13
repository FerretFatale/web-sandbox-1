# Feature: Living Schedule & Event Management

## 1) Purpose and outcomes

The Schedule system is the backbone of daily and weekly time management in The_Vault. It covers rolling weekly planning, task scheduling, end-of-day processing, event tracking, and calendar views. This page dives deeper into the day-to-day use of the living schedule — how to organise, move, and manage tasks across your week.

> The existing [Schedule](feature-viewer.html?p=schedule) page covers the full API reference. This page focuses on practical workflows: how to reorganise your week, roll incomplete tasks, and integrate your schedule with wellbeing and events.

---

## 2) How the living schedule works

The living schedule (`Schedule/living_schedule.py`) stores your week as seven JSON files — one per day — in `Schedule/Weekly_Planner/`. Each file holds a list of tasks for that day of the week.

When you call `api_get_rolling_week()`, it maps the next 7 calendar days to the appropriate day files, so Monday's plan always shows on actual Mondays regardless of when you created the tasks.

The schedule is **self-healing** — if a day's JSON file is malformed, the module automatically attempts rescue to preserve your data.

---

## 3) Scheduling and reorganising tasks

### Add a task to a specific day

```python
from Schedule.living_schedule import api_schedule_task

result = api_schedule_task("Thursday", "Call insurance company about renewal")
# {"status": "success", "data": {"message": "Successfully scheduled '...' for Thursday."}}
```

### Move a task to a different day

There isn't a single `api_move_task()` function — the workflow is to remove from one day and schedule on another:

```python
from Schedule.living_schedule import api_remove_task, api_schedule_task

# Step 1: Remove from current day
remove_result = api_remove_task("Monday", "Call insurance company about renewal")

# Step 2: Schedule on the new day
schedule_result = api_schedule_task("Wednesday", "Call insurance company about renewal")
```

### Complete and roll forward unfinished tasks

End-of-day processing automatically handles rolling:

```python
from Schedule.living_schedule import api_process_end_of_day

result = api_process_end_of_day()
# Marks today's completed tasks, rolls uncompleted items to tomorrow,
# and updates the planner state.
```

---

## 4) Viewing your schedule

### Rolling week view (next 7 days mapped to real dates)

```python
from Schedule.living_schedule import api_get_rolling_week

result = api_get_rolling_week()
# {
#   "status": "success",
#   "data": {
#     "2026-05-14 (Thursday)": ["Review project proposal", "Call dentist"],
#     "2026-05-15 (Friday)": ["Submit invoice", "Grocery run"],
#     ...
#   }
# }
```

### Full weekly planner (Monday–Sunday)

```python
from Schedule.living_schedule import api_get_weekly_planner

result = api_get_weekly_planner()
```

### Today's schedule (with optional wellbeing injection)

```python
from Schedule.living_schedule import api_generate_schedule

result = api_generate_schedule()
# If WELLBEING_SCHEDULE_INJECTION=true in .env, today's focus_intent appears at the top
```

---

## 5) Wellbeing integration

Set `WELLBEING_SCHEDULE_INJECTION=true` in your `.env` to have your daily [Wellbeing check-in](feature-viewer.html?p=wellbeing_and_journal) focus intent appear as a header annotation in today's schedule. For example, if you set your focus intent to "Keep it gentle today — recovery day", that annotation will appear at the top of `api_generate_schedule()` output.

---

## 6) Events calendar: birthdays, holidays, and special events

The events calendar (`Schedule/events_calendar.py`) is separate from the weekly planner — it holds recurring and fixed dates that don't belong in any one week's plan.

### Add a birthday

```python
from Schedule.events_calendar import api_add_birthday

result = api_add_birthday("Alex", "07-15", notes="Likes ferret-themed gifts")
```

### Add a special event

```python
from Schedule.events_calendar import api_add_special_event

result = api_add_special_event(
    name="Annual vet checkup",
    date="2026-06-20",
    recurring=True,
    notes="Book 3 weeks in advance",
)
```

### Get upcoming events

```python
from Schedule.events_calendar import api_get_upcoming_events

result = api_get_upcoming_events(lookahead_days=14)
# Returns birthdays, special events, and public holidays in the next 14 days
```

### Sync events to reminders

```python
from Schedule.events_calendar import api_sync_events_to_reminders

result = api_sync_events_to_reminders(advance_days=7)
# Writes advance-notice reminders to Schedule/reminders.json
# Events within 7 days surface as active reminders
```

---

## 7) Planner housekeeping

### Audit for stale items

```python
from Schedule.living_schedule import api_run_backlog_audit

result = api_run_backlog_audit()
# Returns list of items that have been on the planner for a long time without being completed
```

### Tidy the weekly planner

```python
from Schedule.living_schedule import api_tidy_weekly_planner

result = api_tidy_weekly_planner()
# Removes completed items, consolidates duplicates, cleans up formatting
```

---

## 8) Reference lists

Save reusable named lists (shopping runs, recurring checklists) to the schedule system:

```python
from Schedule.living_schedule import api_save_reference_list

result = api_save_reference_list(
    name="Chemist run",
    items=["Vitamin D", "Magnesium", "Band-aids"],
    consumables=["Vitamin D", "Magnesium"],
)
```

---

## 9) Storage

| File/Folder | Contents |
|-------------|----------|
| `Schedule/Weekly_Planner/Monday.json` | Monday tasks |
| `Schedule/Weekly_Planner/Tuesday.json` | Tuesday tasks |
| ... (one file per day) | |
| `Schedule/events_calendar.json` | Birthdays, events, holidays |
| `Schedule/reminders.json` | Active advance reminders |
| `Schedule/reference_lists.json` | Saved named reference lists |
