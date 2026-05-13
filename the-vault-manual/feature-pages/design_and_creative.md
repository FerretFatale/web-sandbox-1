# Feature: Design & Creative

## 1) Purpose and outcomes

The Creative module provides tools for managing Canva assets, brand design kits, and AI-assisted design brief generation. It bridges your brand identity (stored in the brand registry) with structured creative output requests.

---

## 2) Canva asset registry: `Creative/canva_asset_registry.py`

Maintains a local index of your Canva designs — covers, social posts, banners, thumbnails, and templates — so you can find and reference them without opening Canva directly.

### Register an asset: `api_add_canva_asset()`

```python
from Creative.canva_asset_registry import api_add_canva_asset

result = api_add_canva_asset(
    asset_name="Ferret Fatale — Twitch Banner v2",
    asset_type="banner",        # banner | post | cover | thumbnail | template | other
    canva_url="https://www.canva.com/design/DAxxxxxx/...",
    brand_id="ferret_fatale",
    tags=["twitch", "banner", "launch"],
    dimensions="1920x480",
    notes="Main channel banner — current live version",
    approved=True,
)
```

### Browse assets: `api_list_canva_assets()`

```python
from Creative.canva_asset_registry import api_list_canva_assets

# All assets for a brand
result = api_list_canva_assets(brand_id="ferret_fatale")

# Filter by type
result = api_list_canva_assets(asset_type="thumbnail")
```

### Update asset status: `api_update_canva_asset()`

Mark assets as active/archived as designs evolve:

```python
from Creative.canva_asset_registry import api_update_canva_asset

result = api_update_canva_asset(
    asset_id="canva_abc123",
    status="archived",
    notes="Replaced by v3 banner",
    approved=True,
)
```

---

## 3) Canva brand kits: `Creative/canva_brand_kits.py`

Stores structured brand kit data — colours, fonts, logos — that maps to your Canva brand kits. This is the local canonical source for brand visual identity.

```python
from Creative.canva_brand_kits import api_get_brand_kit, api_update_brand_kit

result = api_get_brand_kit(brand_id="ferret_fatale")
# {
#   "brand_id": "ferret_fatale",
#   "colors": {
#     "primary": "#10a37f",
#     "background": "#0a0a0b",
#     "accent": "#ff007f"
#   },
#   "fonts": {
#     "heading": "Inter",
#     "body": "Inter",
#     "accent": "JetBrains Mono"
#   },
#   "logo_variants": ["light_bg", "dark_bg", "icon_only"]
# }
```

---

## 4) Design brief generator: `Creative/design_brief_generator.py`

Generates structured design briefs for new creative assets. You provide the objective and context; the vault generates a complete brief ready to use in Canva or with a designer.

```python
from Creative.design_brief_generator import api_generate_design_brief

result = api_generate_design_brief(
    asset_type="thumbnail",
    brand_id="ferret_fatale",
    purpose="YouTube VOD thumbnail for first ferret stream",
    key_message="The chaos begins. Watch live.",
    target_audience="Gaming / cozy streaming community",
    tone=["bold", "playful", "dark"],
    additional_notes="Should feature a ferret prominently. Dark background. High contrast.",
)
# {
#   "status": "success",
#   "brief": {
#     "title": "Ferret Fatale — First Stream Thumbnail",
#     "dimensions": "1280x720",
#     "color_palette": ["#10a37f", "#0a0a0b", "#ff007f"],
#     "font_suggestion": "Inter Bold / JetBrains Mono",
#     "layout_guidance": "...",
#     "copy": "THE CHAOS BEGINS",
#     "imagery_direction": "...",
#     "accessibility_notes": "..."
#   }
# }
```

---

## 5) Storage

| File | Contents |
|------|----------|
| `Creative/canva_assets.json` | Canva asset registry |
| `Creative/canva_brand_kits.json` | Brand kit definitions |
| `Creative/design_briefs/` | Generated brief files |

---

## 6) Workflow: creating new creative assets

1. Ensure the brand kit is up to date via `api_update_brand_kit()`.
2. Generate a design brief with `api_generate_design_brief()`.
3. Use the brief to create the asset in Canva.
4. Register the completed asset in `api_add_canva_asset()` with its Canva URL.
5. When a campaign needs assets, `api_list_canva_assets()` returns matching options.

---

## 7) Related pages

- [Social Media](feature-viewer.html?p=social_media) — campaigns use Canva assets
- [Business Portal](feature-viewer.html?p=business_portal) — brand overview
