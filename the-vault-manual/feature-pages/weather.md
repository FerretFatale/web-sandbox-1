# Feature: Weather Intelligence

## 1) Purpose and outcomes

`Toolkit/weather_intelligence.py` provides weather-aware planning helpers. Get current conditions, risk windows for upcoming tasks, and schedule advisories — all integrated with your location (default: Bendigo, AU).

Requires: `OPENWEATHER_API_KEY` in `.env` or environment. Free tier at openweathermap.org is sufficient for personal use.

## 2) Current weather: `api_weather_now()`

```python
from Toolkit.weather_intelligence import api_weather_now

result = api_weather_now(location="Bendigo,AU")
# {
#   "status": "success",
#   "available": True,
#   "location": "Bendigo,AU",
#   "description": "partly cloudy",
#   "temp_c": 18.4,
#   "feels_like_c": 17.1,
#   "humidity_pct": 55,
#   "wind_kmh": 12.3,
#   "uv_index": null,
#   "retrieved_at": "2026-05-14T10:00:00"
# }
```

If no API key is configured, returns `{"available": False, "message": "OPENWEATHER_API_KEY not set"}` rather than raising an error.

## 3) Risk window: `api_weather_risk_window()`

Scans the next N hours of forecast data and returns a structured risk assessment — useful for planning outdoor tasks, exercise, or events:

```python
from Toolkit.weather_intelligence import api_weather_risk_window

result = api_weather_risk_window(
    location="Bendigo,AU",
    horizon_hours=24,    # look ahead up to 5 days / 120 hours
)
# {
#   "status": "success",
#   "location": "Bendigo,AU",
#   "horizon_hours": 24,
#   "risk_windows": [
#     {"time": "2026-05-14T14:00:00", "condition": "heavy rain", "risk": "high"},
#     {"time": "2026-05-14T16:00:00", "condition": "thunderstorm", "risk": "very_high"}
#   ],
#   "summary": "High risk of heavy rain 2–4pm. Morning is clear.",
#   "recommendation": "Schedule outdoor tasks before midday."
# }
```

## 4) Schedule advisory: `api_schedule_weather_advisory()`

Given a task description, returns a weather-informed scheduling recommendation:

```python
from Toolkit.weather_intelligence import api_schedule_weather_advisory

result = api_schedule_weather_advisory(
    task_context="Outdoor gardening session, ~2 hours",
    location="Bendigo,AU",
)
# {
#   "status": "success",
#   "advisory": "Best window: tomorrow morning 9–11am. Avoid afternoon — 60% chance of rain after 2pm.",
#   "risk_level": "low_morning_high_afternoon"
# }
```

## 5) Configuration

Set your default location in `.env` to avoid passing it every time. The location string format follows the OpenWeather standard: `City,CountryCode` (e.g. `Bendigo,AU`, `Melbourne,AU`, `London,GB`).

```
OPENWEATHER_API_KEY=your_api_key_here
```

The vault reads this from `.env` at runtime — never commit your API key to git.

## 6) Integration with schedule and routines

- The morning briefing includes current weather conditions when the health/schedule persona is active.
- Routines and schedule blocks for outdoor activities can query the risk window to surface weather warnings.
- Stage B planning: weather risk will be optionally injected into the daily schedule alongside the wellbeing state.

## 7) Fails safely

If the OpenWeather API is unreachable or the key is not set, all functions return `{"available": False}` with a descriptive message — they never raise unhandled exceptions. This means weather data is a soft enhancement, not a hard dependency.
