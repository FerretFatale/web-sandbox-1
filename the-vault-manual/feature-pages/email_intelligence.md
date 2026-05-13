# Feature: Email Intelligence

## 1) Purpose and outcomes

`Toolkit/email_intelligence.py` is the Stage B email intelligence engine. It classifies, triages, and plans inbox organization with strict read-only safety guarantees. No live mailbox writes happen in this module — all outputs are dry-run plans stored locally in `Email_Intelligence/`.

**Guaranteed safety invariants (cannot be disabled):**
- `no_delete_guarantee = True` — never deletes or trashes emails
- `no_send_guarantee = True` — never sends or replies
- `no_write_guarantee = True` — never writes to a live mailbox
- `dry_run_default = True` — all public APIs default to dry-run

## 2) Stage architecture

| Stage | File | Status | Scope |
|---|---|---|---|
| **A** | `Toolkit/maton_client.py` | Complete | Read inbox, heuristic triage, obligation extraction |
| **B0** | `Toolkit/email_intelligence.py` | Complete | Mailbox census, sender frequency, stale folder detection |
| **B** | `Toolkit/email_intelligence.py` | Complete | Full taxonomy classification, dry-run tagging plan |
| **C** | Pending approval | — | Apply labels/categories to live mailbox |
| **D** | Pending approval | — | Archive/move emails |
| **E** | Pending approval | — | Move to Trash (never permanent delete by default) |
| **F** | Future | — | Learning loop, sender/category scoring history |

## 3) Classification and triage APIs

### `api_email_classify_messages(messages: list) -> list`

Classifies a list of message dicts using the full taxonomy. Heuristic-only — no LLM calls, no network calls.

```python
from Toolkit.email_intelligence import api_email_classify_messages

result = api_email_classify_messages([
    {"subject": "Your invoice #1234 is ready", "from": "billing@company.com"},
    {"subject": "New message from Alex", "from": "noreply@facebook.com"},
])
# Returns same list with "classification" and "signals" keys added to each message
```

**Minimum required fields per message:** `subject` (str), `from` (str).  
Optional: `snippet`, `body_preview`, `triage` (from Stage A output).

### `api_email_triage_with_urgency(messages: list) -> list`

Classifies messages and assigns `action_urgency` to each. The recommended entry point when building an inbox triage view.

```python
from Toolkit.email_intelligence import api_email_triage_with_urgency

result = api_email_triage_with_urgency(messages)
# Each message gets "classification", "signals", and "action_urgency" fields
```

**Urgency values:**
- `info_only` — read and file; no further action required
- `must_do` — requires active human response (payment, security, deadline)
- `appt_reminder` — appointment, meeting, or calendar event to confirm

### `api_cluster_unknown_emails(classified_messages: list) -> dict`

Clusters emails classified as `"unknown"` by sender address (primary) and subject similarity (secondary). Infers a suggested classification per cluster.

```python
result = api_cluster_unknown_emails(classified_messages)
# {
#   "status": "ok"|"no_unknowns",
#   "total_input": int,
#   "total_unknowns": int,
#   "cluster_count": int,
#   "clusters": [
#     {
#       "sender_address": str,
#       "count": int,
#       "subjects": [str],
#       "suggested_classification": str,
#       "confidence": "high"|"medium"|"low"
#     }, ...
#   ]
# }
```

## 4) Mailbox census

### `api_email_mailbox_census(source: str = "gmail", max_messages_per_folder: int = 20, ...) -> dict`

Orchestrates a read-only full-mailbox survey: lists folders, samples recent messages, classifies them, computes sender frequency, detects stale folders, and builds a suggested taxonomy.

```python
from Toolkit.email_intelligence import api_email_mailbox_census

result = api_email_mailbox_census(
    source="gmail",               # "gmail" or "outlook"
    max_messages_per_folder=20,
    account_alias="tawneylc",     # optional multi-account alias
)
# {
#   "status": str,
#   "source": "gmail"|"outlook",
#   "generated_at": ISO 8601 str,
#   "total_folders": int,
#   "total_messages_sampled": int,
#   "sender_stats": {...},
#   "classification_distribution": {...},
#   "classified_sample": [...],   # capped at 100 messages
#   "stale_folders": [...],
#   "suggested_taxonomy": {...},
#   "no_delete_guarantee": True,
#   "no_send_guarantee": True,
#   "no_write_guarantee": True,
# }
```

For tests, pass `prefetched_folders` and `prefetched_messages` to skip live API calls entirely.

## 5) Tagging plan generation

### `api_email_generate_tagging_plan(classified_messages: list, source: str = "gmail", ...) -> dict`

Generates a dry-run label/category plan from classified messages. Writes output to `Email_Intelligence/`.

### `api_email_generate_gmail_label_plan(classified_messages: list) -> dict`

Produces a Gmail-specific label hierarchy plan.

### `api_email_generate_outlook_category_plan(classified_messages: list) -> dict`

Produces an Outlook category plan.

### `api_email_get_latest_plan(source: str = "gmail") -> dict`

Reads the most recently generated tagging plan from `Email_Intelligence/`. Returns `{"status": "success"|"error", "plan": {...}}`.

## 6) Unknown cluster review

### `api_run_unknown_cluster_review(classified_messages: list, ...) -> dict`

Runs cluster analysis on unknown emails, persists cluster history, and generates a review report. Accumulates results in `Email_Intelligence/unknown_clusters/accumulated.json`.

## 7) Spam and stale folder audit

### `api_audit_spam_folder(source: str = "gmail", ...) -> dict`

Samples the spam folder, classifies messages, and identifies false positives (legitimate emails incorrectly marked spam).

### `api_email_detect_stale_folders(folders: list, classified_messages: list, ...) -> list`

Identifies folders with no recent activity or low-value content.

## 8) Sorting policy

### `api_email_load_sorting_policy() -> dict`

Loads `Toolkit/email_sorting_policy.json`. Returns the full sorting policy including category priorities, auto-archive rules, and action thresholds.

### `api_email_draft_policy_from_census(census_result: Any) -> dict`

Generates a draft sorting policy from a census result. Writes to `Email_Intelligence/` as a draft for human review before adoption.

## 9) CLI usage

```bash
# Generate a tagging plan for Gmail
python Toolkit/email_intelligence.py --plan --source gmail

# Generate a tagging plan for Outlook
python Toolkit/email_intelligence.py --plan --source outlook

# Classify a pre-fetched message file
python Toolkit/email_intelligence.py --classify --file messages.json

# Get the latest generated plan
python Toolkit/email_intelligence.py --latest --source gmail
```

## 10) Output storage

All plan outputs are written to `Email_Intelligence/` (gitignored — never committed):

```
Email_Intelligence/
  mailbox_census/         ← census reports by account and date
  taxonomy_calibration/   ← taxonomy calibration reports
    folder_mapping/       ← folder-to-taxonomy mapping reports
  unknown_clusters/       ← unknown email cluster analysis
    history/              ← timestamped cluster history
    accumulated.json      ← running cluster accumulation
  spam_audits/            ← spam folder audit reports
```

## 11) Configuration and credentials

| Variable | Purpose |
|---|---|
| `MATON_API_KEY` | Required for live message fetching via Maton |
| `MATON_GATEWAY_URL` | Required for live Maton API calls |
| `MATON_DEFAULT_GMAIL_CONNECTION_ID` | Gmail account connection in Maton |
| `MATON_DEFAULT_OUTLOOK_CONNECTION_ID` | Outlook account connection in Maton |

All credentials are read from `.env` only. Stage C and above (live mailbox writes) require explicit human approval in `Human_Input.txt` before implementation.

## 12) Testing

```bash
python -m pytest Copilot_Tests/test_email_intelligence.py -v
python -m pytest Copilot_Tests/test_email_classify_urgency.py -v
```

All tests use `prefetched_folders` and `prefetched_messages` to avoid live API calls. Safety guarantees are verified: no delete, no send, no write paths reachable in any test scenario.

## 13) Dependencies and integrations

- `Toolkit/email_intelligence.py` — primary source (Stage B/B0)
- `Toolkit/maton_client.py` — Stage A (read inbox, heuristic triage)
- `Toolkit/email_sorting_policy.json` — sorting policy config
- `Toolkit/email_taxonomy.json` — full email classification taxonomy
- `Email_Intelligence/` — output directory (gitignored)
- `Human_Input_Forms/email_maton_write_approval.md` — Stage C write approval form
- `Human_Input_Forms/email_safety_approval_policy.md` — safety gate policy

## 14) Change log and manual maintenance

- Last reviewed: 2026-05-14
- Source of truth: `Toolkit/email_intelligence.py`
- Update triggers: new classification taxonomy category, new API function, safety guarantee changed, Stage C/D/E approval received, new credential variable.
