# Feature: Budget

## 1) Purpose and outcomes

The Budget system tracks income and expenses, provides monthly summaries with category breakdowns, integrates food budget targets from the Health module, and generates tax export summaries. All financial data is stored locally. No external payment APIs are connected. An explicit disclaimer is returned with all financial outputs.

## 2) Core API: `Finances/budget_manager.py`

### `api_log_expense(amount: float, category: str, description: str = "", date: str | None = None) -> dict`

Logs an expense to `Finances/transactions.json`.

```python
from Finances.budget_manager import api_log_expense

result = api_log_expense(
    amount=47.80,
    category="food",
    description="Weekly groceries",
    date="2026-05-14",
)
# {
#   "status": "success",
#   "entry": {
#     "type": "expense",
#     "amount": 47.80,
#     "category": "food",
#     "description": "Weekly groceries",
#     "date": "2026-05-14",
#     "logged_at": "2026-05-14T11:32:00"
#   },
#   "disclaimer": "..."
# }
```

- `amount` must be positive. Returns `{"status": "error"}` if zero or negative.
- `category` is lowercased and stripped automatically.
- `date` defaults to today if not provided (ISO `YYYY-MM-DD` format).

### `api_log_income(amount: float, source: str, description: str = "", date: str | None = None) -> dict`

Logs income to `Finances/transactions.json`.

```python
result = api_log_income(
    amount=1200.00,
    source="freelance",
    description="Web design project",
)
# {"status": "success", "entry": {...}, "disclaimer": "..."}
```

### `api_get_budget_summary(month: str | None = None) -> dict`

Returns a budget summary for the given month. Defaults to current month.

```python
from Finances.budget_manager import api_get_budget_summary

result = api_get_budget_summary(month="2026-05")
# {
#   "month": "2026-05",
#   "total_income": 2400.00,
#   "total_expenses": 1850.20,
#   "net": 549.80,
#   "top_categories": [
#     {"category": "food", "total": 380.00},
#     {"category": "utilities", "total": 210.00},
#     ...
#   ],
#   "food_summary": {
#     "spent": 380.00,
#     "budget_target": 465.00,
#     "remaining": 85.00
#   },
#   "disclaimer": "..."
# }
```

**`food_summary`** is only present when `Health/food_plan.json` contains a `daily_budget` value. Monthly target is calculated as `daily_budget * days_in_month`.

### `api_get_spending_trends(months: int = 3) -> dict`

Returns spending trends across the last N months, broken down by category.

```python
result = api_get_spending_trends(months=6)
# {"status": "success", "data": {"trends": [{"month": str, "categories": {...}}, ...]}}
```

### `api_log_meal_cost(meal_description: str, cost: float, date: str | None = None) -> dict`

Logs a meal as a `"food"` category expense (shortcut for food tracking).

### `api_generate_tax_summary(year: int | None = None) -> dict`

Generates a tax-period summary (income, expenses, net) for the given year (defaults to current year). Exports to `Archives/Tax_Exports/`.

```python
from Finances.budget_manager import api_generate_tax_summary

result = api_generate_tax_summary(year=2026)
# {"status": "success", "data": {"year": int, "total_income": float, "total_expenses": float, "tax_export_path": str}}
```

### `api_research_investment(query: str, model: str | None = None) -> dict`

Generates an AI-assisted research summary on an investment topic. Routes through omni_router.

### `api_log_investment_note(ticker_or_topic: str, notes: str) -> dict`

Logs a manual investment note or annotation.

### `api_run_ai_allocator() -> dict`

Runs the AI budget allocator: generates a strategic summary and actionable tasks based on the current financial profile, active goals, and recent ledger. Uses `BUDGET_PROMPT` system prompt.

### `api_deep_cleanup_scan() -> dict`

Scans for ghost data: duplicate records, already-recorded notes, and stale ledger items.

### `api_apply_allocator_triage(new_tasks: list[str], app_idx: list[int], arc_idx: list[int], sno_idx: list[int]) -> dict`

Applies the allocator output: appends approved tasks, archives reviewed items, snoozes deferred items.

## 3) Food budget integration

The food budget tracking is a Stage C integration between `Finances/budget_manager.py` and `Health/food_plan.json`.

```python
# Health/food_plan.json
{"daily_budget": 15.00, "notes": "Low FODMAP focus"}

# budget_manager reads this automatically when generating summaries
# api_get_budget_summary().food_summary will be populated if daily_budget is set
```

## 4) Financial data storage

```
Finances/
  budget_manager.py           ← core budget API
  transactions.json           ← all income and expense entries (append-only)
  crypto_tracker.py           ← api_get_bitcoin_price (live price query)

DATA_VAULT/Admin_and_Cashflow/
  Financial_Profile.json      ← user financial profile
  Financial_Goals.json        ← financial goals
  Ledger.json                 ← historical ledger
  Budget_Tasks.json           ← current budget tasks
  Deferred_Budget_Tasks.json  ← snoozed tasks

DATA_VAULT/Archives/
  Tax_Exports/                ← annual tax summary exports (CSV + JSON)
  Smart_Archives/Budget_Archive.json  ← archived/resolved budget items
  Financial_Documents/        ← historical financial documents
```

## 5) Configuration

| Variable | Purpose |
|---|---|
| `VAULT_ROOT` | Vault root path (from `vault_config.py`) |
| `DATA_VAULT` | External data vault path for financial profile/goals/ledger |
| `API_KEY` (omni_router) | Required if using `api_research_investment` |

## 6) Disclaimer

All financial API responses include a `"disclaimer"` field. The budget system does NOT provide professional financial advice, tax guidance, or investment recommendations. All outputs are for personal planning use only.

## 7) Testing

```bash
python -m pytest Copilot_Tests/test_budget.py -v
```

Tests cover: log expense validation (negative amount rejection), log income, monthly summary calculations, food_summary integration, tax summary export, allocator output shape.

## 8) Dependencies and integrations

- `Finances/budget_manager.py` — core budget API
- `Finances/crypto_tracker.py` — `api_get_bitcoin_price`
- `Health/food_plan.json` — daily food budget target
- `Toolkit/omni_router.py` — investment research routing
- `Human_Input_Forms/form_financial_profile.url` — operator onboarding form

## 9) Change log and manual maintenance

- Last reviewed: 2026-05-14
- Source of truth: `Finances/budget_manager.py`
- Update triggers: new expense category, food budget integration changed, tax export format changed, new financial API added.

## 10) Dependencies and integrations

- `Finances/budget_manager.py` primary runtime surface
- `Health/food_plan.json` monthly food budget target input
- `Toolkit/omni_router.py` research routing path
- `DATA_VAULT/Admin_and_Cashflow/*` profile, goals, and ledger files

## 11) Change log and manual maintenance

Keep this page updated when budget API fields, allocator behavior, or tax export formats change.
