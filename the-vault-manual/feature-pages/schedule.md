# Feature: Schedule

## 1) Purpose and outcomes

The Schedule system coordinates daily/weekly planning, event tracking, calendar views, and end-of-day processing. Three modules work together: `living_schedule.py` (daily/weekly planner), `events_calendar.py` (birthdays, special events, public holidays, iCal export), and `calendar_views.py` (planning horizons and summaries).

## 2) Daily and weekly planning: `Schedule/living_schedule.py`

### `api_get_rolling_week() -> dict`

Retrieves the next 7 days of tasks starting from today, mapping actual dates to the corresponding day-of-week JSON files.

```python
from Schedule.living_schedule import api_get_rolling_week

result = api_get_rolling_week()
# {
#   "status": "success",
#   "data": {
#     "2026-05-14 (Thursday)": ["task 1", "task 2"],
#     "2026-05-15 (Friday)": ["task 3"],
#     ...
#   }
# }
```

### `api_get_weekly_planner() -> dict`

Retrieves the full standard weekly planner (Monday–Sunday).

### `api_schedule_task(day_of_week: str, task_description: str) -> dict`

Schedules a new task for a specific day.

```python
from Schedule.living_schedule import api_schedule_task

result = api_schedule_task("Thursday", "Review Q2 financial projections")
# {"status": "success", "data": {"message": "Successfully scheduled '...' for Thursday."}}
# {"status": "error", "message": "'Thurs' is not a valid day of the week."}
```

Valid days: `Monday`, `Tuesday`, `Wednesday`, `Thursday`, `Friday`, `Saturday`, `Sunday` (case-insensitive, capitalized internally).

### `api_generate_schedule() -> dict`

Generates today's schedule from `Weekly_Planner/` and actively managed projects only. Ignores raw/outdated task lists.

**Optional features (controlled by env vars):**
- `WELLBEING_SCHEDULE_INJECTION=true` — reads `Health/wellbeing_state.json` and prepends today's `focus_intent` as a header annotation
- `ONBOARDING_SCAN_ENABLED=true` (default) — checks `Onboarding/inbox/` for completed forms at schedule generation time

### `api_process_end_of_day() -> dict`

Runs end-of-day processing: marks completed tasks, rolls unfinished items forward, updates planner state.

### `api_run_backlog_audit() -> dict`

Audits the weekly planner for stale items and generates a cleanup report.

### `api_tidy_weekly_planner() -> dict`

Applies automated cleanup to the weekly planner (removes completed items, consolidates duplicates).

### `api_save_reference_list(name: str, items: list, consumables: list | None = None) -> dict`

Saves a named reference list (e.g. shopping list, supply checklist) to `Schedule/reference_lists.json`.

## 3) Events calendar: `Schedule/events_calendar.py`

### `api_add_birthday(name: str, date_mmdd: str, notes: str = "") -> dict`

Adds a birthday to the calendar.

```python
from Schedule.events_calendar import api_add_birthday, api_get_upcoming_events

result = api_add_birthday("Alex", "07-15", notes="Likes ferret-themed gifts")
# {"status": "success", "data": {"message": "Birthday for Alex on 07-15 added."}}
```

### `api_list_birthdays() -> list`

Returns all registered birthdays.

### `api_add_special_event(name: str, date: str, ...) -> dict`

Adds a special event (appointment, launch date, deadline) to the calendar.

### `api_list_special_events() -> list`

Returns all special events.

### `api_add_public_holiday(name: str, date: str, region: str = "") -> dict`

Adds a public holiday to the calendar with optional region tag.

### `api_list_public_holidays() -> list`

Returns all public holidays.

### `api_get_upcoming_events(days_ahead: int = 30) -> dict`

Returns all events (birthdays + special + holidays) in the next N days, sorted by date.

```python
result = api_get_upcoming_events(days_ahead=14)
# {
#   "status": "success",
#   "data": {
#     "events": [
#       {"type": "birthday", "name": "Alex", "date": "07-15", "days_until": 4},
#       {"type": "special_event", "name": "NDIS Review", "date": "2026-05-20", "days_until": 6}
#     ]
#   }
# }
```

### `api_sync_events_to_reminders(...) -> dict`

Syncs calendar events to the system reminders surface (if configured).

### `api_remove_event(event_id: str) -> dict`

Removes a specific event by ID.

### `api_export_to_ical(...) -> dict`

Exports the full calendar (birthdays + special events + holidays) to an `.ical` file.

## 4) Calendar views: `Schedule/calendar_views.py`

### `api_get_view(horizon: str) -> dict`

Returns a planning view for the specified horizon.

```python
from Schedule.calendar_views import api_get_view, api_list_horizons

horizons = api_list_horizons()
# ["today", "week", "fortnight", "month", "quarter"]

result = api_get_view("week")
# {"status": "success", "data": {"horizon": "week", "tasks": {...}, "events": [...]}}
```

### `api_list_horizons() -> list`

Returns all available horizon labels.

### `api_get_planning_summary() -> dict`

Returns a consolidated planning summary across all horizons: today's tasks, upcoming events, weekly load.

## 5) Storage layout

```
Schedule/
  living_schedule.py          ← daily/weekly planner API
  events_calendar.py          ← birthday, events, holiday, iCal API
  calendar_views.py           ← horizon views and planning summary
  Weekly_Planner/             ← one JSON file per day of week
    Monday.json ... Sunday.json
  reference_lists.json        ← named reference lists
  events.json                 ← all calendar events
Health/
  wellbeing_state.json        ← today's focus_intent (optional injection)
Onboarding/inbox/             ← completed onboarding forms (scanned at schedule run)
```

## 6) Configuration

| Variable | Default | Purpose |
|---|---|---|
| `WELLBEING_SCHEDULE_INJECTION` | `false` | Inject today's wellbeing focus_intent into schedule header |
| `ONBOARDING_SCAN_ENABLED` | `true` | Check `Onboarding/inbox/` for completed forms at schedule time |

## 7) Testing

```bash
python -m pytest Copilot_Tests/test_schedule.py -v
python -m pytest Copilot_Tests/test_events_calendar.py -v
```

Tests cover: rolling week date mapping, day validation in schedule_task, upcoming events date filtering, iCal export format.

## 8) Dependencies and integrations

- `Schedule/living_schedule.py` — daily/weekly planner
- `Schedule/events_calendar.py` — events, birthdays, holidays, iCal export
- `Schedule/calendar_views.py` — horizon views and summaries
- `Routines/Current_Routines.json` — routines consumed at schedule generation
- `Goals/ambitions.py` — `api_insert_ambition_plan` writes schedule blocks
- `Health/wellbeing_state.json` — optional wellbeing focus injection
- `Onboarding/inbox/` — completed form scanning trigger
- `Human_Input_Forms/form_schedule_preferences.url` — operator preference form

## 9) Change log and manual maintenance

- Last reviewed: 2026-05-14
- Source of truth: `Schedule/living_schedule.py`, `Schedule/events_calendar.py`, `Schedule/calendar_views.py`
- Update triggers: new schedule API, new event type added, horizon list changed, env var behaviour changed, iCal format updated.

## 10) Dependencies and integrations

- `Schedule/living_schedule.py`
- `Schedule/events_calendar.py`
- `Schedule/calendar_views.py`
- `Routines/Current_Routines.json` and `Goals/ambitions.py` insertion coupling

## 11) Change log and manual maintenance

Keep this page synchronized with schedule API changes, event schema updates, and planner-horizon behavior changes.
