# Feature: Human Input and Backlogs

## 1) Purpose and outcomes

The human input and backlog system is the bridge between automated agent execution and human decision-making. It captures every blocked item, approval-gated action, and pending task in a structured, auditable format.

- `Human_Input.txt` — active human-required actions (read first; this is what is waiting on you)
- `KAOS OS ACTIVE BACKLOG.txt` — active task list for agent execution
- `Human_Input_Forms/` — 19 structured data-gathering forms for operator onboarding
- Routing is deterministic: agents always know which surface to write to and operators always know where to look.

## 2) Human_Input.txt — the escalation surface

The canonical interface between automated agents and the human operator. Everything blocked, approval-gated, or requiring credentials goes here.

**Status values:**
- `[ ]` — not started
- `[~]` — partially complete, blocked, or awaiting human input
- `[x]` — complete and verified

**Required block format (enforced by `api_format_human_action_block`):**

```
--------------------------------------------------
TASK:
<task title>

STATUS:
Blocked / Human action needed

WHY:
<brief explanation>

RISK LEVEL:
Low / Moderate / High

ACTION NEEDED FROM HUMAN:
<exact action steps>

FILES / SYSTEMS AFFECTED:
<paths, services, or integrations>

NEXT SAFE STEP AFTER HUMAN INPUT:
<exact next step>
--------------------------------------------------
```

**After completing an item:** Move it to `Human_Input_Completed_Log.txt`.  
**For design proposals:** Move to `Human_Input_Proposal_Queue.txt`.  
**For historical reference:** Move to `Human_Input_Review_Notes.txt`.

## 3) KAOS OS ACTIVE BACKLOG.txt — task execution surface

The active task list for agent execution. Uses a standardized format with a mandatory `ACTIVE TASK INDEX` header.

**Task status markers:**
- `[ ] TASK:` — unchecked (ready for execution)
- `[~] TASK:` — blocked or in progress
- `[x] TASK:` — complete (must be moved to archive, not left active)

**Task block format:**

```
--------------------------------------------------
[ ] TASK: <Task Title>
Mode: implementation allowed | verify-and-fix | readonly
Model: <model name>
Agent: <agent name>

Task: <detailed task description>
--------------------------------------------------
```

**ACTIVE TASK INDEX** (required at file top):
```
ACTIVE TASK INDEX
==================================================
[ ] UNCHECKED (N tasks)

 1. [ ] Task Title One
 2. [ ] Task Title Two

[~] BLOCKED (M tasks)

 3. [~] Blocked Task Title
```

## 4) Backlog append API

### `api_append_tasks(task_blocks_text: str, dry_run: bool = False, ...) -> dict`

Appends formatted task blocks to the active backlog without duplicates. Deduplicates against both the active backlog and the archive.

```python
from Toolkit.backlog_append import api_append_tasks

task_text = """
--------------------------------------------------
[ ] TASK: Rebuild IMAP timeout logic
Mode: implementation allowed
Model: Claude Sonnet 4.6
Agent: Vault Runtime Refactorer

Task: Add explicit timeout + finally cleanup to all imaplib calls in proton_bridge.py.
--------------------------------------------------
"""

result = api_append_tasks(task_text, dry_run=False)
# {"status": "success", "appended": 1, "skipped": 0, "details": [...], "message": str}

# Dry run to preview without writing
result = api_append_tasks(task_text, dry_run=True)
```

**Deduplication:** Case-insensitive title match against both `KAOS OS ACTIVE BACKLOG.txt` and `KAOS OS BACKLOG ARCHIVE.txt`. Already-archived tasks are never re-added.

**Index rebuild:** After appending, automatically rebuilds the `ACTIVE TASK INDEX` with correct counts and numbering.

## 5) Backlog lint API

### `api_detect_intra_active_duplicates(backlog_file: Path | None = None) -> list[str]`

Detects duplicate task titles within the active backlog.

### `api_detect_forbidden_backlog_phrasing(backlog_file: Path | None = None) -> list`

Checks for prohibited phrasing patterns that indicate stale or malformed entries.

### `api_audit_backlog_integrity(backlog_file: Path | None = None) -> dict`

Full integrity audit: duplicate detection, forbidden phrasing, index consistency, task count vs. index count.

### `api_fix_backlog_integrity(backlog_file: Path | None = None, dry_run: bool = True) -> dict`

Automatically fixes detectable integrity issues. Always run with `dry_run=True` first.

```python
from Toolkit.backlog_lint import api_audit_backlog_integrity, api_fix_backlog_integrity

# Audit
result = api_audit_backlog_integrity()
# {"status": "ok"|"issues_found", "issues": [...], "count": int}

# Preview fixes
result = api_fix_backlog_integrity(dry_run=True)
# {"status": str, "fixes_planned": [...], "dry_run": True}

# Apply fixes
result = api_fix_backlog_integrity(dry_run=False)
```

## 6) Human Input Forms

`Human_Input_Forms/` contains 19 structured forms for operator data gathering. These are populated by the human and consumed by onboarding and feature-configuration flows:

| Form | Purpose |
|---|---|
| `email_maton_write_approval.md` | Approval gate for Stage C email writes |
| `email_safety_approval_policy.md` | Email safety gate policy |
| `github_pages_scope_decision.md` | GitHub Pages deployment scope |
| `health_profile_onboarding.md` | Health data for routines/schedule features |
| `food_preferences_restrictions.md` | Food preferences for shopping/meal features |
| `goals_profile.md` (via form link) | Goals and priorities |
| `ventraip_credential_setup.md` | VentraIP hosting credentials |
| `twitch_dual_role_setup.md` | Twitch streaming configuration |
| `ocr_contact_allowlist.md` | OCR contact import allowlist |
| `coping_strategies_seed.md` | Mental health coping pattern seed data |

Forms are linked from the Human_Input Hub (`Human_Input_Hub/`) as `.url` shortcuts.

## 7) Routing decisions — which surface to use

| Scenario | Write to |
|---|---|
| Agent blocked on credentials or approval | `Human_Input.txt` |
| New executable task ready for agent execution | `KAOS OS ACTIVE BACKLOG.txt` |
| Design proposal for future consideration | `Human_Input_Proposal_Queue.txt` |
| Historical reference or decision record | `Human_Input_Review_Notes.txt` |
| Completed human action | `Human_Input_Completed_Log.txt` |
| Approved task that needs to be promoted to active | Promote `[APPROVED]` → `[ ] TASK` in backlog |
| External write requiring human approval | `Human_Input_Forms/` + `Human_Input.txt` |

## 8) Testing

```bash
python -m pytest Copilot_Tests/test_backlog_lint.py -v
python -m pytest Copilot_Tests/test_backlog_append.py -v
```

Run `python -m pytest Copilot_Tests/test_backlog_lint.py -q` before every commit touching backlog or checklist files (maintenance-mode requirement).

## 9) Dependencies and integrations

- `Human_Input.txt` — active blocked items
- `KAOS OS ACTIVE BACKLOG.txt` — active task queue
- `KAOS OS BACKLOG ARCHIVE.txt` — completed/archived tasks
- `Human_Input_Completed_Log.txt` — completed human actions log
- `Human_Input_Proposal_Queue.txt` — design proposals
- `Human_Input_Review_Notes.txt` — historical reference
- `Toolkit/backlog_append.py` — `api_append_tasks`, deduplication, index rebuild
- `Toolkit/backlog_lint.py` — integrity audit and auto-fix
- `Toolkit/backlog_paths.py` — path resolution (supports overrides for tests)
- `Toolkit/runtime_test_governance.py` — `api_format_human_action_block`
- `Human_Input_Hub/` — shortcut links to all human-facing surfaces
- `Human_Input_Forms/` — structured data-gathering forms

## 10) Change log and manual maintenance

- Last reviewed: 2026-05-14
- Source of truth: `Toolkit/backlog_append.py`, `Toolkit/backlog_lint.py`, `Human_Input.txt`
- Update triggers: new backlog format rule, new form added, routing decision changed, new status marker type, Human_Input_Hub links changed.
