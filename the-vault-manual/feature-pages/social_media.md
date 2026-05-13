# Feature: Social Media & Brand Management

## 1) Purpose and outcomes

`Business/social_media_manager.py` provides brand-aware social media content planning and campaign management — locally, with no live platform connections in Stage A. All actual posting requires explicit human approval and is performed through native platform tools, not automated by the vault.

`Business/brand_registry.py` maintains the master brand identity registry, storing brand guidelines, colour palettes, tone of voice, and target audience profiles for each entity (Ferret Fatale and related brands).

---

## 2) Brand registry: `Business/brand_registry.py`

### Register a brand: `api_add_brand()`

```python
from Business.brand_registry import api_add_brand

result = api_add_brand(
    brand_id="ferret_fatale",
    display_name="Ferret Fatale",
    tagline="Chaotic good energy.",
    primary_colors=["#10a37f", "#0a0a0b"],
    tone_of_voice=["witty", "warm", "direct", "irreverent"],
    target_audiences=["ADHD adults", "ferret owners", "cozy tech folks"],
    platforms=["twitch", "instagram", "tiktok"],
    approved=True,
)
```

### List brands: `api_list_brands()`

```python
from Business.brand_registry import api_list_brands

result = api_list_brands()
```

The brand registry is referenced by the social media manager when creating campaigns — posts inherit the brand's tone and visual identity metadata.

---

## 3) Social media campaigns: `Business/social_media_manager.py`

### Create a campaign: `api_create_social_campaign()`

```python
from Business.social_media_manager import api_create_social_campaign

result = api_create_social_campaign(
    brand_id="ferret_fatale",
    title="May launch campaign",
    objective="Promote new Twitch channel launch to existing community",
    platforms=["instagram", "tiktok", "twitter"],
    start_date="2026-05-20",
    end_date="2026-05-31",
    approved=True,
)
# {"status": "success", "campaign_id": "campaign_abc123", ...}
```

**Campaign statuses:** `draft` → `pending_approval` → `approved` → `active` → `completed` / `archived`

### Create a post draft: `api_create_post_draft()`

```python
from Business.social_media_manager import api_create_post_draft

result = api_create_post_draft(
    campaign_id="campaign_abc123",
    brand_id="ferret_fatale",
    platform="instagram",
    content="Finally launching the Twitch channel this Friday! Come watch ferrets destroy everything I own 🐾 Link in bio.",
    media_notes="Use the photo of Noodle sitting on the keyboard",
    scheduled_date="2026-05-20",
    tags=["ferret", "gaming", "twitch", "launch"],
    approved=True,
)
```

### List drafts: `api_list_post_drafts()`

```python
from Business.social_media_manager import api_list_post_drafts

result = api_list_post_drafts(brand_id="ferret_fatale", status_filter="pending_approval")
```

### Approve a draft: `api_update_post_status()`

```python
from Business.social_media_manager import api_update_post_status

result = api_update_post_status(
    post_id="post_abc123",
    new_status="approved",
    approved=True,
)
```

---

## 4) Campaign orchestrator: `Toolkit/campaign_orchestrator.py`

The campaign orchestrator coordinates multi-platform content deployment planning — taking an approved campaign and generating a cross-platform posting schedule:

```python
from Toolkit.campaign_orchestrator import api_generate_campaign_schedule

result = api_generate_campaign_schedule(campaign_id="campaign_abc123")
# Returns a day-by-day posting schedule across all platforms in the campaign
```

---

## 5) Storage

| File | Contents |
|------|----------|
| `Business/brand_registry.json` | Brand identity records |
| `Business/social_campaigns.json` | Campaign records |
| `Business/social_post_drafts.json` | Post draft records |

---

## 6) Security and posting rules

- No credentials are stored in committed files.
- The vault **never posts directly** to any social platform. All posting is done by the human operator through native platform tools.
- Post content is approved through the vault status workflow then executed manually.
- `api_create_post_draft()` and `api_create_social_campaign()` both require `approved=True` to write.
- Forbidden field names (`password`, `token`, `api_key`, `secret`, `credential`, `oauth`) are rejected from all input dicts.
