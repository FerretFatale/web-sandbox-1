# Feature: Shopping & Kitchen

## 1) Purpose and outcomes

Two closely integrated tools cover your food supply chain end-to-end:

- **`Toolkit/shopping_assistant.py`** — weekly food planning, shopping list generation, household regulars, food budget tracking, and local specials/price comparison (Bendigo, VIC, Australia focus)
- **`Toolkit/kitchen_inventory.py`** — kitchen stocktake tracking with categories, quantities, expiry dates, and food-plan gap detection

Together they answer: *what do I need to buy, and what have I already got?*

---

## 2) Weekly food plan: `shopping_assistant`

### Set your weekly meal plan: `api_set_food_plan()`

```python
from Toolkit.shopping_assistant import api_set_food_plan

result = api_set_food_plan(
    meals=[
        {"day": "Monday", "meal": "Chicken stir-fry with rice"},
        {"day": "Tuesday", "meal": "Lentil soup with crusty bread"},
        {"day": "Wednesday", "meal": "Pasta with bolognese"},
        {"day": "Thursday", "meal": "Baked salmon with roasted vegetables"},
        {"day": "Friday", "meal": "Homemade pizza"},
        {"day": "Saturday", "meal": "Tacos"},
        {"day": "Sunday", "meal": "Roast chicken with potatoes"},
    ],
    approved=True,
)
```

### Generate shopping list: `api_generate_shopping_list()`

Generates a shopping list from the current food plan:

```python
from Toolkit.shopping_assistant import api_generate_shopping_list

result = api_generate_shopping_list()
# {"status": "success", "data": {"shopping_list": ["chicken breast 500g", "rice 1kg", ...], "count": 24}}
```

Optionally cross-references with kitchen inventory to remove items you already have enough of.

### Household regulars: `api_add_household_regular()` / `api_get_household_regulars()`

Items you always need regardless of the meal plan (toilet paper, coffee, etc.):

```python
from Toolkit.shopping_assistant import api_add_household_regular, api_get_household_regulars

api_add_household_regular(name="Coffee (ground)", category="pantry", notes="1 bag per fortnight")
result = api_get_household_regulars()
```

### Price history: `api_log_price_observation()` / `api_get_best_price()`

Track prices across stores over time:

```python
from Toolkit.shopping_assistant import api_log_price_observation, api_get_best_price

api_log_price_observation(
    item="Chicken breast 500g",
    store="Woolworths Bendigo",
    price_aud=7.50,
    unit="500g",
    date="2026-05-14",
)

result = api_get_best_price(item="Chicken breast 500g")
# {"best_store": "Woolworths Bendigo", "price": 7.50, "recorded_on": "2026-05-14"}
```

---

## 3) Food budget: `shopping_assistant`

### Set budget targets: `api_set_food_budget()`

```python
from Toolkit.shopping_assistant import api_set_food_budget

result = api_set_food_budget(weekly_aud=150, fortnightly_aud=280, monthly_aud=580)
```

### Budget summary: `api_get_food_budget_summary()`

Compares estimated spend against budget targets:

```python
from Toolkit.shopping_assistant import api_get_food_budget_summary

result = api_get_food_budget_summary()
# {"weekly": {"budget": 150, "estimated_spend": 130, "status": "under_budget"}, ...}
```

---

## 4) Live specials: `api_fetch_aldi_specials()` / `api_get_active_specials()`

The shopping assistant can pull live specials from ALDI (static HTML, no login required):

```python
from Toolkit.shopping_assistant import api_fetch_aldi_specials, api_match_specials_to_food_plan

# Fetch live ALDI specials (requires internet)
specials = api_fetch_aldi_specials()

# Cross-reference against your food plan
matches = api_match_specials_to_food_plan()
# Shows which food plan items are currently on special
```

**Current scraper status:**
| Store | Status |
|-------|--------|
| ALDI (national) | ✅ Live — static HTML |
| IGA | Pending HTML verification |
| Woolworths / Coles | Blocked — JS-rendered, requires Playwright |
| Local Bendigo producers | Pending source verification |

---

## 5) Kitchen inventory: `Toolkit/kitchen_inventory.py`

### Add/update an item: `api_update_inventory_item()`

```python
from Toolkit.kitchen_inventory import api_update_inventory_item

result = api_update_inventory_item(
    name="Rolled oats",
    quantity=800,
    unit="g",           # g | ml | kg | L | units
    category="Pantry",  # Pantry | Fridge | Freezer | Spices | Drinks | Other
    location="Top shelf",
    expiry_date="2026-12-01",
    approved=True,
)
```

### Browse inventory: `api_get_inventory()`

```python
from Toolkit.kitchen_inventory import api_get_inventory

# All items
result = api_get_inventory()

# Filter by category
result = api_get_inventory(category="Fridge")

# Items nearing expiry (next 7 days)
result = api_get_inventory(expiring_within_days=7)
```

### Confirm a stocktake: `api_confirm_stocktake()`

Marks items as confirmed-today. Items not confirmed in the last 7 days (configurable) surface as needing re-check:

```python
from Toolkit.kitchen_inventory import api_confirm_stocktake

result = api_confirm_stocktake(item_names=["Rolled oats", "Rice", "Pasta"])
```

### Find shopping gaps: `api_get_shopping_gaps()`

Cross-references your food plan against inventory to identify what's missing:

```python
from Toolkit.kitchen_inventory import api_get_shopping_gaps

result = api_get_shopping_gaps()
# {"status": "success", "data": {"gaps": ["Chicken breast", "Broccoli"], "count": 8}}
```

### Remove an item: `api_remove_inventory_item()`

```python
from Toolkit.kitchen_inventory import api_remove_inventory_item

result = api_remove_inventory_item(name="Rolled oats", approved=True)
```

---

## 6) Storage

| File | Contents |
|------|----------|
| `Health/food_plan.json` | Weekly meal plan |
| `Health/kitchen_inventory.json` | Kitchen item inventory |
| `Finances/food_budget.json` | Food budget horizon targets |
| `Finances/price_comparison_log.json` | Price history across stores |
| `Finances/store_specials_log.json` | Scraped/logged specials |

---

## 7) Typical weekly workflow

1. Update the food plan at the start of each week with `api_set_food_plan()`.
2. Run `api_get_shopping_gaps()` to see what the plan needs that isn't in the kitchen.
3. Run `api_match_specials_to_food_plan()` to see if any plan items are on special.
4. Combine into a final shopping list with `api_generate_shopping_list()`.
5. After shopping, update inventory with `api_update_inventory_item()` for new items.
6. Log prices for comparison with `api_log_price_observation()`.
