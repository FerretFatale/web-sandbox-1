# Feature: Grants & Business Operations

## 1) Purpose and outcomes

This page covers two business management tools:

- **`Business/grant_tracker.py`** — track grant opportunities, application status, and deadlines
- **`Business/living_business_plan.py`** + **`Business/business_ops.py`** + **`Business/revenue_framework.py`** — living business plan, operational tracking, and revenue modelling

These tools are local-only planning surfaces. No grant submissions or financial transactions are performed by the vault.

---

## 2) Grant tracker: `Business/grant_tracker.py`

### Log a grant opportunity: `api_log_grant_opportunity()`

```python
from Business.grant_tracker import api_log_grant_opportunity

result = api_log_grant_opportunity(
    grant_name="Create NSW Small Arts Grants",
    funder="Create NSW",
    max_amount_aud=15000,
    deadline="2026-08-31",
    entity="Ferret_Fatale",
    relevance_notes="Applicable to digital arts / streaming content projects",
    application_url="https://create.nsw.gov.au/funding-and-support/grant-programs/",
    status="identified",   # see statuses below
)
# {"status": "success", "action": "added", "grant": {"grant_id": "...", ...}}
```

**Grant statuses:**
| Status | Meaning |
|--------|---------|
| `identified` | Found, not yet reviewed |
| `reviewing` | Currently being assessed for eligibility |
| `eligible` | Confirmed eligible |
| `applied` | Application submitted |
| `awarded` | Grant received |
| `rejected` | Application unsuccessful |
| `not_applicable` | Not eligible or not relevant |
| `expired` | Deadline passed without applying |

### Update a grant: `api_update_grant_status()`

```python
from Business.grant_tracker import api_update_grant_status

result = api_update_grant_status(
    grant_id="grant_abc123",
    new_status="applied",
    notes="Submitted 2026-07-15. Reference: NSW-2026-AF-7829.",
)
```

### List grants: `api_list_grants()`

```python
from Business.grant_tracker import api_list_grants

# All active/eligible grants
result = api_list_grants(status_filter=["eligible", "reviewing"])

# All grants
result = api_list_grants()
```

**Stage B (future):** AI relevance scoring via omni_router; grant discovery via Websearch module.
**Stage C (future):** Full application workflow with Goals integration and deadline alerts.

---

## 3) Living business plan: `Business/living_business_plan.py`

The living business plan is a structured, AI-assisted document that evolves as the business grows. It covers vision, mission, target market, revenue streams, operational structure, and milestones.

```python
from Business.living_business_plan import api_get_business_plan, api_update_business_plan_section

# Read current plan
result = api_get_business_plan()

# Update a section
result = api_update_business_plan_section(
    section="revenue_streams",
    content="Primary: Twitch subscriptions and bits. Secondary: digital product sales. Tertiary: brand partnerships.",
    approved=True,
)
```

---

## 4) Business milestones: `Business/business_milestone_tracker.py`

Track progress against business milestones:

```python
from Business.business_milestone_tracker import api_add_milestone, api_list_milestones

result = api_add_milestone(
    title="Reach 100 Twitch followers",
    target_date="2026-08-01",
    category="growth",
    notes="Current: 23 followers",
)

result = api_list_milestones(status_filter="in_progress")
```

---

## 5) Revenue framework: `Business/revenue_framework.py`

Models and tracks the revenue structure across income streams:

```python
from Business.revenue_framework import api_get_revenue_summary, api_log_revenue_event

# Log a revenue event
result = api_log_revenue_event(
    stream="twitch_subscriptions",
    amount_aud=45.00,
    date="2026-05-14",
    notes="May subscriber batch",
)

# Summary
result = api_get_revenue_summary(period="monthly")
```

---

## 6) Storage

| File | Contents |
|------|----------|
| `Business/grant_opportunities.json` | Grant opportunity records |
| `Business/living_business_plan.json` | Current business plan |
| `Business/milestone_tracker.json` | Business milestone records |
| `Business/revenue_log.json` | Revenue event log |

---

## 7) Related pages

- [Budget](feature-viewer.html?p=budget) — day-to-day expense and income tracking
- [Business Portal](feature-viewer.html?p=business_portal) — business portal overview
- [Social Media](feature-viewer.html?p=social_media) — content planning and brand management
- [Goals](feature-viewer.html?p=goals) — long-term ambitions including business goals
