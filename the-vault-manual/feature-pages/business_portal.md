# Feature: Business Portal

## 1) Purpose and outcomes

The Business Portal manages brand identities, account registries, revenue planning, and marketing strategy across Ferret Fatale, Pet Pantheon, Tawney, and future projects. It operates read-only by default with explicit `approved=True` required for any writes. No live social connections. No credentials stored.

## 2) Brand registry: `Business/brand_registry.py`

Local registry of brands and accounts. Three required brand IDs: `ferret_fatale`, `pet_pantheon`, `tawney_public`, `future_project`.

### `api_list_brands() -> dict`

Lists all registered brands. Private notes are redacted.

```python
from Business.brand_registry import api_list_brands

result = api_list_brands()
# {
#   "status": "ok",
#   "brands": [
#     {"id": "ferret_fatale", "name": "Ferret Fatale", "private_notes": "[PRIVATE - redacted]", "accounts": [...]},
#     ...
#   ],
#   "count": 4,
#   "registry_version": "1.0.0"
# }
```

### `api_get_brand_profile(brand_id: str) -> dict`

Get full profile for a specific brand. Private notes are always redacted in output.

```python
result = api_get_brand_profile("ferret_fatale")
# {"status": "ok", "brand": {"id": "ferret_fatale", "name": "...", "accounts": [...]}}
# {"status": "error", "message": "Brand not found: 'unknown_id'"}
```

### `api_list_brand_accounts(brand_id: str = "") -> dict`

Lists all account entries across brands, or for a specific brand.

```python
result = api_list_brand_accounts(brand_id="ferret_fatale")
# {"status": "ok", "accounts": [{"brand_id": str, "brand_name": str, "platform": str, ...}], "count": int}
```

**Valid platforms:** `youtube`, `tiktok`, `instagram`, `twitter_x`, `patreon`, `twitch`, `linkedin`, `facebook`, `threads`, `bluesky`, `newsletter`, `website`, `discord`, `reddit`, `pinterest`.

### `api_validate_brand_registry() -> dict`

Validates registry: required brands present, schema fields complete, no forbidden credential fields.

```python
result = api_validate_brand_registry()
# {"status": "ok", "valid": bool, "errors": [str, ...], "warnings": [str, ...], "registry_version": str}
```

**Forbidden fields:** `password`, `token`, `api_key`, `secret`, `credential`, `oauth` (raises error if found).

### `api_propose_brand_account(brand_id: str, platform: str, username: str, ...) -> dict`

Proposes a new account entry for human review. Requires human approval before any account is considered active.

```python
result = api_propose_brand_account(
    brand_id="ferret_fatale",
    platform="tiktok",
    username="@ferretfatale",
    notes="Main video channel",
)
# {"status": "proposed", "proposal_id": str}
```

### `api_get_brand_social_performance_summary(brand_id: str) -> dict`

Returns a local-only performance summary compiled from stored notes (no live API connections).

## 3) Revenue framework: `Business/revenue_framework.py`

Autonomous revenue and self-iteration framework. Stages A/B/C:
- **Stage A:** local only — target intake, pathway evaluation, AI plan, iteration logging
- **Stage B:** real cost tracking integrated with `budget_manager.py`
- **Stage C:** marketing queue with per-post approval gate (no live posting without `approved=True`)

### `api_set_revenue_target(target_name: str, amount: float, currency: str = "AUD", timeframe_days: int = 90, purpose: str = "", skills_context: str = "") -> dict`

Defines a revenue target.

```python
from Business.revenue_framework import api_set_revenue_target, api_generate_revenue_plan

result = api_set_revenue_target(
    target_name="Fund Cursor subscription",
    amount=80.00,
    currency="AUD",
    timeframe_days=30,
    purpose="Cover monthly AI tooling cost",
    skills_context="writing, design, AI prompting",
)
# {"status": "success", "target_id": str, "target": {...}}
```

### `api_generate_revenue_plan(target_id: str) -> dict`

Evaluates applicable pathways and generates an AI-assisted revenue plan for the target.

```python
result = api_generate_revenue_plan(target_id)
# {
#   "status": "success",
#   "plan": {
#     "recommended_pathways": [{"id": str, "label": str, "score": float}, ...],
#     "action_steps": [str, ...],
#     "legal_notes": str
#   }
# }
```

**Known pathways:** `digital_products`, `freelance_services`, `content_creation`, `software_as_a_service`, `affiliate_marketing`.

### `api_log_revenue_iteration(target_id: str, action_taken: str, result: str, amount_earned: float = 0) -> dict`

Logs an iteration (action taken and result) against a target.

### `api_get_revenue_iterations(target_id: str) -> dict`

Returns all logged iterations for a target.

## 4) Social media manager: `Business/social_media_manager.py`

### `api_get_social_calendar(brand_id: str, days_ahead: int = 14) -> dict`

Returns the upcoming social posting calendar for a brand.

### `api_queue_post(brand_id: str, platform: str, content: str, scheduled_for: str, approved: bool = False) -> dict`

Queues a social post. `approved=False` by default — posts are held until explicitly approved.

## 5) Storage layout

```
Business/
  brand_registry.py           ← brand/account registry API
  brand_registry.json         ← canonical brand definitions
  brand_account_proposals.json  ← pending account proposals
  revenue_framework.py        ← revenue planning API
  revenue_targets.json        ← all revenue targets
  revenue_plans.json          ← generated plans
  revenue_iterations.json     ← iteration logs
  social_media_manager.py     ← social calendar and post queue
  business_ops.py             ← business operations API
  business_plan_redteam.py    ← red-team critique of business plans
  website_workflow.py         ← website content workflow
```

## 6) Security constraints

- `_FORBIDDEN_FIELDS` set: `password`, `token`, `api_key`, `secret`, `credential`, `oauth` — registry validation fails if any brand record contains these keys.
- No live social API calls without `approved=True` + a configured publisher module.
- `private_notes` is always redacted to `"[PRIVATE — redacted]"` in all API outputs.

## 7) Testing

```bash
python -m pytest Copilot_Tests/test_brand_registry.py -v
python -m pytest Copilot_Tests/test_revenue_framework.py -v
```

## 8) Dependencies and integrations

- `Business/brand_registry.py`, `brand_registry.json` — brand/account store
- `Business/revenue_framework.py` — revenue planning and iteration logging
- `Business/social_media_manager.py` — social calendar and post queue
- `Finances/budget_manager.py` — Stage B cost tracking integration
- `Toolkit/omni_router.py` — AI revenue plan generation
- `Human_Input.txt` — approval gate for account proposals and live posts

## 9) Change log and manual maintenance

- Last reviewed: 2026-05-14
- Source of truth: `Business/brand_registry.py`, `Business/revenue_framework.py`
- Update triggers: new brand added, new platform added to valid list, revenue pathway added, Stage C publisher configured.

## 10) Dependencies and integrations

- `Business/brand_registry.py` and `Business/brand_registry.json`
- `Business/revenue_framework.py` and revenue state files
- `Business/social_media_manager.py` queueing path
- `Finances/budget_manager.py` Stage B integration

## 11) Change log and manual maintenance

Keep this page synchronized with brand schema updates, pathway additions, and publish-gate rules.
