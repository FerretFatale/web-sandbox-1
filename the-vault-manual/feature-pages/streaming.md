# Feature: Streaming & Twitch

## 1) Purpose and outcomes

The Streaming module provides safe, local-first infrastructure for Twitch channel management and content workflow. It covers channel inventory, VOD metadata management, transcription job queuing, clip planning, and Streamer.bot automation — all without storing credentials in committed files.

All **live reads** require `dry_run=False, approved=True`. All **write actions** are gated by explicit approval and dry-run modes.

---

## 2) Twitch channel management: `Streaming/twitch_manager.py`

### Setup check: `api_validate_twitch_setup()`

```python
from Streaming.twitch_manager import api_validate_twitch_setup

result = api_validate_twitch_setup()
# {
#   "status": "success",
#   "configured": True,
#   "channel_name": "FerretFatale",
#   "missing_keys": [],
#   "required_scopes": [...],
#   "write_scopes_gated": [...]
# }
```

**Required environment variables** (set in `.env` — never commit):
```
TWITCH_CLIENT_ID
TWITCH_CLIENT_SECRET
TWITCH_ACCESS_TOKEN
TWITCH_REFRESH_TOKEN
TWITCH_CHANNEL_NAME
TWITCH_BROADCASTER_ID
```

### Read channel inventory: `api_read_channel_inventory()`

Fetches read-only channel data — subscriptions, recent redemptions, polls, predictions, bits leaderboard:

```python
from Streaming.twitch_manager import api_read_channel_inventory

result = api_read_channel_inventory(dry_run=False, approved=True)
# Returns dict with subscriptions, redemptions, polls, predictions, bits_leaderboard
```

**Required read scopes:** `channel:read:redemptions`, `channel:read:subscriptions`, `channel:read:polls`, `channel:read:predictions`, `chat:read`, `bits:read`, `moderation:read`

**Write scopes are gated** — no channel mutations occur without explicit implementation in a future stage.

---

## 3) VOD manifest: `Streaming/vod_manifest.py`

A local registry of VOD metadata. No video downloads or file processing.

### Register a VOD: `api_register_vod()`

```python
from Streaming.vod_manifest import api_register_vod

result = api_register_vod(
    vod_id="twitch_123456789",
    title="Chill coding stream — ferret cam special",
    source_platform="twitch",   # twitch | youtube | local | other
    local_path="D:/Streams/2026-05-14_stream.mp4",   # optional
    metadata={
        "duration_minutes": 180,
        "game": "Just Chatting",
        "date": "2026-05-14",
    },
    dry_run=False,
    approved=True,
)
```

### List VODs: `api_list_vods()`

```python
from Streaming.vod_manifest import api_list_vods

result = api_list_vods(status_filter="registered")
```

**VOD statuses:** `registered`, `downloaded`, `transcribed`, `clipped`, `uploaded`, `archived`, `error`

### Update VOD status: `api_update_vod_status()`

```python
from Streaming.vod_manifest import api_update_vod_status

result = api_update_vod_status(
    vod_id="twitch_123456789",
    new_status="transcribed",
    dry_run=False,
    approved=True,
)
```

---

## 4) VOD transcription queue: `Streaming/vod_transcription_queue.py`

A local job queue for transcription tasks. The queue records intent — no actual transcription runs in this module.

```python
from Streaming.vod_transcription_queue import api_create_transcription_job

result = api_create_transcription_job(
    vod_id="twitch_123456789",
    model="whisper-large",   # whisper-large | whisper-medium | whisper-small | whisper-tiny | local | auto
    dry_run=False,
    approved=True,
)

# List pending jobs
from Streaming.vod_transcription_queue import api_list_transcription_jobs
result = api_list_transcription_jobs(status_filter="pending")
```

---

## 5) Streamer.bot bridge: `Streaming/streamerbot_bridge.py`

Stage A: local config validation and setup status check. No live WebSocket connections yet.

```python
from Streaming.streamerbot_bridge import api_get_streamerbot_setup_status

result = api_get_streamerbot_setup_status()
# {
#   "status": "success",
#   "configured": True,
#   "host": "localhost",
#   "port": 7474,
#   "websocket_url": "ws://localhost:7474/",
#   "auth_configured": True,
#   "missing_keys": []
# }
```

**Required environment variables:**
```
STREAMERBOT_HOST
STREAMERBOT_PORT
STREAMERBOT_WEBSOCKET_URL
STREAMERBOT_AUTH_TOKEN
```

---

## 6) Streaming module roadmap

| Component | Stage | Status |
|-----------|-------|--------|
| Twitch setup validation | A | ✅ Implemented |
| Channel read inventory | B | ✅ Implemented (requires live tokens) |
| VOD metadata registry | B | ✅ Implemented |
| VOD transcription queue | C | ✅ Queue only (no execution) |
| Streamer.bot config check | A | ✅ Implemented |
| Streamer.bot live actions | B | Deferred — pending WebSocket implementation |
| Clip planning | C | Scaffold in progress |
| Twitch change planner | B | In progress |

---

## 7) Security notes

- No credentials are ever stored in committed files. All tokens and keys are read exclusively from `.env` or environment variables.
- Live reads require both `dry_run=False` AND `approved=True` — both flags must be set.
- Write scopes are gated and will not execute channel mutations without a fully approved future implementation.
- The VOD path validator rejects traversal sequences (`..`, `//`, `\\\\`) and non-absolute paths.
