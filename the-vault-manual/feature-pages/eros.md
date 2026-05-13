# Feature: Eros (Emotional Context System)

## 1) Purpose and outcomes

Eros is The_Vault's emotional context layer. It maintains a short-lived buffer of the operator's
current emotional state, energy level, and communication preferences, and provides a separate
relationship-context bridge for social-aware AI responses. The system is privacy-first: no raw
personal data is ever committed to the repository, and diagnostic language about mental health
conditions is explicitly forbidden.

## 2) Emotional state buffer: `Toolkit/eros_hold_buffer.py`

Buffer storage: `Archives/eros_hold_buffer.json`
Failure log: `Archives/eros_flush_failures.json`

### `api_update_eros_buffer(emotional_state, energy_level, communication_hints, temporary_overrides, expires_at, session_id) -> dict`

Writes or updates the emotional context buffer.

```python
from Toolkit.eros_hold_buffer import api_update_eros_buffer

result = api_update_eros_buffer(
    emotional_state="excited",
    energy_level="high",
    communication_hints=["concise", "no-fluff"],
    temporary_overrides={"formality": "casual"},
    session_id="",        # auto-generates ISO timestamp if empty
    expires_at="",        # auto-sets to end-of-day if empty
)
# {"status": "success", "buffer": {...}}
```

**Parameters:**
- `emotional_state: str` — free-text description of current state (e.g., `"focused"`, `"tired"`, `"anxious"`)
- `energy_level: str` — `"low"` | `"normal"` | `"high"`
- `communication_hints: list` — list of communication style preferences
- `temporary_overrides: dict` — per-session style overrides (e.g., `{"formality": "casual"}`)
- `expires_at: str` — ISO 8601 timestamp; defaults to `_end_of_day_iso()` if empty
- `session_id: str` — identifier for this session; defaults to current ISO timestamp if empty

### `api_load_eros_buffer() -> dict`

Reads the current buffer. Auto-deletes the file if expired.

```python
from Toolkit.eros_hold_buffer import api_load_eros_buffer

result = api_load_eros_buffer()
# {
#   "status": "success",
#   "buffer": {
#     "emotional_state": "focused",
#     "energy_level": "high",
#     "communication_hints": ["concise"],
#     "expires_at": "2026-05-14T23:59:59",
#     "session_id": "2026-05-14T09:00:00"
#   },
#   "expired": False
# }
# or {"status": "not_found", "buffer": {}, "expired": False}  <- if no buffer exists
# or {"status": "expired", "buffer": {}, "expired": True}     <- if buffer expired
```

## 3) Forbidden diagnostic language

The buffer rejects any input containing these exact phrases (case-insensitive):

```python
_FORBIDDEN_DIAGNOSTIC_PHRASES = [
    "is depressed",
    "has anxiety disorder",
    "mentally unwell",
    "predicted emotional state",
]
```

If any forbidden phrase appears in input text, the function returns immediately:

```python
result = api_update_eros_buffer(emotional_state="is depressed")
# {"status": "error", "message": "Diagnostic language is forbidden in Eros buffer input."}
```

This applies to all text fields: `emotional_state`, `communication_hints`, `temporary_overrides`.

## 4) Relationship context bridge: `Toolkit/eros_context.py`

Relationship state file: `Social_and_Memories/relationship_state.json`
- Human-maintained
- Listed in `.gitignore` — never committed to the repository
- Never read by automated scans

### `api_load_relationship_context() -> dict`

Reads the bridge file.

```python
from Toolkit.eros_context import api_load_relationship_context

result = api_load_relationship_context()
# {"status": "success", "data": {...}}       <- if bridge file exists
# {"status": "not_found", "data": {}}        <- if bridge file is absent
```

### `api_get_relationship_summary() -> dict`

Returns a summarized, AI-safe view of the relationship context.

```python
result = api_get_relationship_summary()
# {
#   "available": True,
#   "active_connections": ["..."][:5],    <- max 5 entries
#   "upcoming_events": ["..."][:5],       <- max 5 entries
#   "notes": "..."
# }
```

**Privacy rule:** Only the bridge file (`Social_and_Memories/relationship_state.json`) is ever
read by code. Raw `Social_and_Memories/` subcategory files are never scanned by any API.
No relationship data is ever written to committed repository files.

## 5) Buffer expiry behavior

The buffer auto-expires at end-of-day by default. When `api_load_eros_buffer()` reads a buffer
with an `expires_at` timestamp in the past:

1. Returns `{"status": "expired", "buffer": {}, "expired": True}`
2. Deletes the buffer file immediately
3. Logs the expiry event

## 6) Storage layout

```
Archives/
  eros_hold_buffer.json       <- current session buffer (auto-deleted when expired)
  eros_flush_failures.json    <- log of failed buffer writes
Social_and_Memories/
  relationship_state.json     <- human-maintained bridge file (gitignored)
```

## 7) Integration with vault_brain.py

When the vault processes a user message:

1. `api_load_eros_buffer()` is called to check for active emotional context
2. If buffer exists and is not expired, the context is injected into the active persona's system prompt
3. `communication_hints` directly influence response tone
4. `energy_level` modulates verbosity (low energy → shorter responses)
5. If no buffer exists, persona uses its default communication style

## 8) Testing

```bash
python -m pytest Copilot_Tests/test_eros_buffer.py -v
python -m pytest Copilot_Tests/test_eros_context.py -v
```

Key test cases: forbidden phrases are rejected, expired buffer auto-deletes, relationship context
returns `not_found` gracefully, `session_id` defaults to ISO timestamp.

## 9) Dependencies and integrations

- `Toolkit/eros_hold_buffer.py` — emotional state buffer
- `Toolkit/eros_context.py` — relationship context bridge
- `Archives/eros_hold_buffer.json` — buffer storage (auto-managed)
- `Social_and_Memories/relationship_state.json` — human-maintained bridge (gitignored)
- `vault_brain.py` — consumes buffer at mission start

## 10) Change log and manual maintenance

- Last reviewed: 2026-05-14
- Source of truth: `Toolkit/eros_hold_buffer.py`, `Toolkit/eros_context.py`
- Update triggers: new forbidden phrases added, expiry behavior changed, relationship bridge schema changed.
