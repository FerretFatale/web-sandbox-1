# Feature: Prescriptions & Medications

## 1) Purpose and outcomes

`Health/prescription_tracker.py` is a **personal administrative tracker** for managing medication schedules, food constraints, refill dates, and prescriber information. It is an organisational tool — it keeps your medication admin in one place so you don't miss a refill or forget timing instructions.

> **ADMINISTRATIVE ONLY — not medical advice.** This module records logistics and timing only. It does not provide dosing guidance, interactions checking, contraindication analysis, or clinical recommendations. Always follow your prescriber's instructions. Do not alter medications based on app data alone. Contact your healthcare provider or pharmacist for medical questions.

## 2) Add a prescription: `api_add_prescription()`

```python
from Health.prescription_tracker import api_add_prescription

result = api_add_prescription(
    name="Sertraline",
    dose="50mg",
    frequency="once daily",
    timing_notes="Morning with food",
    food_constraints="Take with food to reduce nausea",
    refill_date="2026-06-15",
    prescriber="Dr Smith",
    notes="Review at 6-week appointment",
)
# {"status": "success", "action": "added", "prescription": {"id": "...", "name": "Sertraline", ...}}
```

## 3) List all prescriptions: `api_list_prescriptions()`

```python
from Health.prescription_tracker import api_list_prescriptions

result = api_list_prescriptions(active_only=True)
# {"status": "success", "data": {"prescriptions": [...], "count": 3}}
```

## 4) Update a prescription: `api_update_prescription()`

Pass the `prescription_id` from the original add call:

```python
from Health.prescription_tracker import api_update_prescription

result = api_update_prescription(
    prescription_id="rx_abc123",
    refill_date="2026-07-20",
    notes="Dose increased to 100mg at last review",
)
```

## 5) Deactivate a prescription: `api_deactivate_prescription()`

When a medication is discontinued, mark it inactive rather than deleting it — this preserves history:

```python
from Health.prescription_tracker import api_deactivate_prescription

result = api_deactivate_prescription(prescription_id="rx_abc123")
```

## 6) Refill reminders

The prescription record stores a `refill_date`. The [Health Lieutenant](feature-viewer.html?p=health_overview) (admin to-do system) can be used to create a `prescription` type task timed around the refill date. The appointment pack system also includes active prescriptions in GP summary packets.

## 7) Storage

| File | Contents |
|------|----------|
| `Health/prescriptions.json` | All prescription records (active and inactive) |

File is local-only and not committed to git.

## 8) Appointment integration

When generating an appointment pack via `Health/appointment_pack.py`, active prescriptions are automatically included in the summary. This means you arrive at each appointment with an up-to-date medication list — no scrambling to remember names or doses.

See [Health Overview](feature-viewer.html?p=health_overview) for full appointment pack documentation.
