# Feature: Wardrobe

## 1) Purpose and outcomes

`Toolkit/wardrobe_manager.py` is a digital wardrobe for The_Vault. Register your clothing items with photos and tags, build and save named outfits, and browse your inventory — all locally stored with no external dependencies in Stage A.

Stage A (currently implemented): manual photo + tag registration, outfit building, inventory browsing.
Stage B (deferred — requires Google API key): AI auto-tagging via Gemini Vision — automatically extracts category, colour, pattern, material, occasion, and season from a garment photo.
Stage C (deferred — requires model cascade): AI outfit suggestions based on weather, occasion, and your style goals.

## 2) Register a garment: `api_add_garment()`

Drop photos into `Images/wardrobe/inbox/` then register them:

```python
from Toolkit.wardrobe_manager import api_add_garment

result = api_add_garment(
    filename="blue_floral_dress.jpg",
    category="dress",         # top | bottom | dress | outerwear | shoes | accessory | other
    color=["blue", "white"],  # list of colours
    pattern="floral",         # solid | floral | stripe | check | print | other
    occasion=["casual", "daywear"],
    season=["spring", "summer"],
    style_tags=["feminine", "flowy"],
    brand="ASOS",
    material="cotton blend",
    user_notes="Favourite summer dress",
    approved=True,
)
# {
#   "status": "success",
#   "garment": {
#     "garment_id": "g-2026-05-14-1",
#     "filename": "blue_floral_dress.jpg",
#     "image_path": "Images/wardrobe/inventory/blue_floral_dress.jpg",
#     "category": "dress",
#     "color": ["blue", "white"],
#     ...
#   }
# }
```

The photo is moved from `Images/wardrobe/inbox/` to `Images/wardrobe/inventory/` on registration.

## 3) Browse your wardrobe: `api_list_wardrobe()`

```python
from Toolkit.wardrobe_manager import api_list_wardrobe

# All items
result = api_list_wardrobe()

# Filter by category
result = api_list_wardrobe(category="dress")

# Filter by season and colour
result = api_list_wardrobe(season="summer", color="blue")

# Filter by occasion
result = api_list_wardrobe(occasion="casual")
```

## 4) Get a garment: `api_get_garment()`

```python
from Toolkit.wardrobe_manager import api_get_garment

result = api_get_garment(garment_id="g-2026-05-14-1")
```

## 5) Update tags: `api_tag_garment()`

```python
from Toolkit.wardrobe_manager import api_tag_garment

result = api_tag_garment(
    garment_id="g-2026-05-14-1",
    style_tags=["feminine", "flowy", "date-night"],
    occasion=["casual", "daywear", "dinner"],
    approved=True,
)
```

## 6) Build and save outfits: `api_build_outfit()`

```python
from Toolkit.wardrobe_manager import api_build_outfit

result = api_build_outfit(
    name="Summer garden party",
    garment_ids=["g-2026-05-14-1", "g-2026-04-30-3", "g-2026-04-20-2"],
    notes="Blue floral dress, white sandals, woven bag. Dressy casual.",
    occasion="daywear",
    approved=True,
)
# {"status": "success", "outfit": {"outfit_id": "...", "name": "Summer garden party", ...}}
```

## 7) Browse saved outfits: `api_list_outfits()` / `api_get_outfit()`

```python
from Toolkit.wardrobe_manager import api_list_outfits, api_get_outfit

result = api_list_outfits(occasion="casual")
result = api_get_outfit(outfit_id="outfit_abc123")
```

## 8) Remove a garment: `api_remove_garment()`

Marks a garment inactive (soft delete — preserves history):

```python
from Toolkit.wardrobe_manager import api_remove_garment

result = api_remove_garment(garment_id="g-2026-05-14-1", approved=True)
```

## 9) Storage

| File | Path |
|------|------|
| Garment inventory | `Images/wardrobe/wardrobe_inventory.json` |
| Outfit records | `Images/wardrobe/outfits.json` |
| Incoming photos | `Images/wardrobe/inbox/` |
| Registered photos | `Images/wardrobe/inventory/` |

## 10) Garment schema reference

```json
{
  "garment_id": "g-YYYY-MM-DD-N",
  "filename": "blue_floral_dress.jpg",
  "image_path": "Images/wardrobe/inventory/blue_floral_dress.jpg",
  "category": "dress",
  "color": ["blue", "white"],
  "pattern": "floral",
  "material": "cotton blend",
  "brand": "ASOS",
  "occasion": ["casual", "daywear"],
  "season": ["spring", "summer"],
  "style_tags": ["feminine", "flowy"],
  "user_notes": "",
  "added_at": "2026-05-14T10:30:00",
  "last_worn": null,
  "active": true,
  "_ai_tagged": false
}
```

`_ai_tagged` will be `true` once Stage B auto-tagging (Gemini Vision) is implemented.

## 11) Capability map

Call `api_get_wardrobe_capability_map()` to see the current stage status and what is planned for future stages.
