# Feature: Data Sorting

## 1) Purpose and outcomes

The data sorting pipeline uses a file-system watchdog to detect new files and automatically route
them to the correct vault category. The watchdog monitors `THE_INBOX.txt`, `Image_Inbox/`, and
`To_Sort/` directories. Files placed in `To_Sort/` are routed by AI using `vault_rules.txt`
category definitions. The debounce prevents duplicate triggers when many files arrive at once.

## 2) Watchdog: `vault_sensory_system.py`

### Class: `VaultSensorySystem(FileSystemEventHandler)`

File-system event handler that boots a watchdog observer and routes changes to the appropriate
processing API.

Watched paths:
- `THE_INBOX.txt` — text message inbox
- `Image_Inbox/` — image file inbox
- `To_Sort/` — unsorted file staging area

Debounce: `5.0 seconds` — prevents spam when 50+ files are dropped at once.

### `api_boot_sensory_system() -> dict`

Starts the watchdog observer in the background.

```python
from vault_sensory_system import api_boot_sensory_system

result = api_boot_sensory_system()
# {"status": "success", "message": "Sensory system active", "watching": ["THE_INBOX.txt", "Image_Inbox/", "To_Sort/"]}
```

Background thread logs all events to `Daemon_Log.txt` via `SafeLogger`.

### `execute_task(task_name: str)`

Internal method that runs the named API call in a background thread (non-blocking). Used to keep
the watchdog event loop responsive even for slow API calls.

### `can_trigger(task_name: str) -> bool`

Returns `True` if the debounce period for `task_name` has elapsed. Prevents repeated triggers
within 5.0 seconds.

### Event routing

| Trigger                     | API called                       |
|-----------------------------|----------------------------------|
| `THE_INBOX.txt` modified    | `api_process_inbox()`            |
| `Image_Inbox/` file added   | `api_process_image_inbox()`      |
| `To_Sort/` file added       | `api_auto_sort()`                |

## 3) Auto-sorter: `Toolkit/auto_sorter.py`

### `api_auto_sort() -> dict`

Scans `To_Sort/` for loose files and routes each one to the correct vault category using AI.

```python
from Toolkit.auto_sorter import api_auto_sort

result = api_auto_sort()
# {
#   "status": "success",
#   "data": {
#     "files_moved": 4,
#     "details": [
#       {"filename": "budget_notes.txt", "destination": "Finances/To_Ingest/"},
#       {"filename": "recipe.md",        "destination": "Health/To_Ingest/"},
#       ...
#     ]
#   }
# }
```

- Reads `vault_rules.txt` for category definitions (builds context for AI prompt)
- Uses `PROMPT` constant to ask Gemini for the best category for each file
- Physically moves the file to `{Category}/To_Ingest/` as a lobby (not final location)
- Collision protection: never overwrites an existing file at the destination
- Empty or missing `To_Sort/` directory returns `{"status": "success", "data": {"files_moved": 0}}`
- Uses `load_config()` from `models_manager` to get the active model

### Configuration

```
TO_SORT_DIR = "To_Sort"              <- staging area (set in auto_sorter.py)
RULES_FILE  = "vault_rules.txt"      <- category definitions
API_KEY     = os.environ.get('API_KEY')
```

## 4) Inbox processor: `Memory_Setting/process_inbox.py`

### `api_process_inbox() -> dict`

Processes entries in `THE_INBOX.txt`:
- Parses each line as a new memory/note/task
- Routes to the correct category via AI classification
- Moves processed lines to permanent storage
- Clears the processed lines from `THE_INBOX.txt`

```python
from Memory_Setting.process_inbox import api_process_inbox

result = api_process_inbox()
# {"status": "success", "data": {"processed": int, "details": [...]}}
```

## 5) Image inbox: `Memory_Setting/process_image_inbox.py`

### `api_process_image_inbox() -> dict`

Processes image files that land in `Image_Inbox/`:
- Extracts text/metadata via vision API
- Routes to correct category
- Moves to `{Category}/To_Ingest/` lobby

## 6) Sorting workflow (end-to-end)

```
1. Drop file into To_Sort/
2. Watchdog detects FileCreatedEvent within 5 seconds
3. can_trigger() checks 5s debounce — passes if no recent trigger
4. execute_task("api_auto_sort") spawns background thread
5. api_auto_sort() reads vault_rules.txt and sends each file to Gemini
6. Gemini returns category label for each file
7. File is moved to {Category}/To_Ingest/ with collision protection
8. Event logged to Daemon_Log.txt
9. Discord notification sent if DISCORD_WEBHOOK_URL is set in .env
```

## 7) Daemon log: `Daemon_Log.txt`

All watchdog events and sorting actions are written to `Daemon_Log.txt` at vault root.

```
[2026-05-14 09:32:01] [SENSORY] File added: To_Sort/budget_notes.txt
[2026-05-14 09:32:02] [AUTO_SORT] Moved budget_notes.txt -> Finances/To_Ingest/
[2026-05-14 09:32:02] [DISCORD] Notification sent
```

## 8) Running the watchdog manually

```bash
python vault_sensory_system.py
```

This blocks and runs the watchdog observer until interrupted. For background execution, see
`install_daemon.py`.

## 9) Testing

```bash
python -m pytest Copilot_Tests/test_auto_sorter.py -v
python -m pytest Copilot_Tests/test_sensory_system.py -v
```

Key test cases: empty `To_Sort/` returns success with 0 moved, collision protection, debounce
prevents double-trigger, vault_rules.txt is read before AI call.

## 10) Dependencies and integrations

- `vault_sensory_system.py` — watchdog observer
- `Toolkit/auto_sorter.py` — file routing API
- `Memory_Setting/process_inbox.py` — text inbox processor
- `Memory_Setting/process_image_inbox.py` — image inbox processor
- `vault_rules.txt` — category rules for AI routing
- `Daemon_Log.txt` — event log
- `Toolkit/models_manager.py` — active model config

## 11) Change log and manual maintenance

- Last reviewed: 2026-05-14
- Source of truth: `vault_sensory_system.py`, `Toolkit/auto_sorter.py`
- Update triggers: new watched path added, debounce timing changed, sorting prompt changed, lobby path changed.
