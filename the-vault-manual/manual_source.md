# The Vault — Operator Manual (Canonical Source)

> **Source role:** This file is the canonical prose source for `docs/manual/index.html`.
> When updating the manual, edit this file first, then rebuild `index.html` from it.
> Never let the two drift. Run `python -m pytest Copilot_Tests/test_manual_updater.py -q` after any manual change.

---

## A. Executive Overview

**The Vault** is a local-first, personally owned AI operating system. It coordinates a 20-persona agent system, a multi-layer orchestration brain, a governed tool registry, and a rich set of domain-specific capabilities spanning memory, scheduling, health, finances, shopping, social communication, and creative work.

The system runs locally in Python on Windows and calls large language models (LLMs) via [OpenRouter](https://openrouter.ai) as the primary gateway. No data is sent to any cloud service except through explicitly configured API calls. There is no background sync, no subscription model, and no automatic outbound network activity.

### Design principles

- **The Vault is authoritative.** KAOS is the sandbox — it is never the source of truth.
- **Secrets stay in `.env`.** Nothing sensitive is committed to git.
- **Every write-capable or destructive action is gated behind human approval.** No persona may deploy, post, or mutate production state without explicit approval.
- **All agent-callable functions use the `api_` naming convention.** Functions without this prefix are internal helpers and are not exposed to the agent runtime.
- **Security gates SR-001, SR-002, and SR-003 are all resolved and enforced in production.**

---

## B. Authority Model

| Repository | Role | Path |
|---|---|---|
| **The Vault** | Production / Authoritative | `C:\Users\LittleChickpea\OneDrive\Documents\The_Vault` |
| KAOS | Sandbox / Mirror only | `C:\Users\LittleChickpea\OneDrive\Documents\KAOS` |

**Key rule:** KAOS is never the source of truth. Mirror only policy-approved files from The_Vault → KAOS. Do not mirror secrets, `Human_Input.txt`, or runtime churn files.

### Generated vs. source files

- `custom_tools_registry.py` — **Generated**. Do not hand-edit. Regenerate via `Toolkit/registry_sync.py`.
- `persona_manifest.json` — **Authoritative**. Root-level copy is the runtime dispatch table. `Contextual_Thinking/Persona_Manifest.json` is stale — do not use it.
- `Skills_Index.json` — **Authoritative**. Regenerate via `api_index_folder_skills()` when tools change.
- `.kaos_mission.json` — **Runtime state**. Managed by `vault_brain.py` / `state_io_manager.py`. Never hand-edit during an active mission.

---

## C. Quick Start — Operator Guide

This section is for operators (humans running the system) and developers making changes to The Vault.

### Prerequisites

- Python 3.11+ installed
- Git configured with push access to `FerretFatale/KAOS` (The_Vault repo)
- A valid `.env` file at the repo root with at minimum `OPENROUTER_API_KEY` set

### Step 1 — Install dependencies

```bash
cd C:\Users\LittleChickpea\OneDrive\Documents\The_Vault
pip install -r requirements.txt
```

### Step 2 — Run the test suite

```bash
python -m pytest Copilot_Tests/ -q --tb=short
```

Expected: 800+ tests passing, 0 failures. If tests fail before you have made any changes, check `git log --oneline -5` and compare against the last known-good commit.

### Step 3 — Check system state

```bash
# Persona count
python -c "import json; m=json.load(open('persona_manifest.json')); print(len(m), 'personas:', list(m.keys()))"

# Unchecked backlog tasks
# Open KAOS OS ACTIVE BACKLOG.txt and look for [ ] items

# Active human blockers
# Open Human_Input.txt and look for TASK: blocks
```

### Step 4 — Start the system

```bash
python boot_kaos.py
```

This starts the main boot sequence. The system initializes personas, checks credentials from `.env`, and reports readiness. No external network calls happen at boot unless an LLM call is triggered.

### What Copilot agents must do at task start

1. Read `AGENTS.md`
2. Read `docs/copilot-context/system-context.md` and `authority-map.md`
3. Run `git log --oneline -10` and `git status --short`
4. Read `KAOS OS ACTIVE BACKLOG.txt` for unchecked `[ ]` tasks
5. Read `Human_Input.txt` for active blockers
6. Identify the single next unchecked task and verify it is not already done in current files
7. Implement, test, stage, and commit only that task

### Common mistakes to avoid

- Do not stage `Health/*.json`, `Recovery/*.json`, `Toolkit/.backlog_pass_log.json`, or other runtime churn files
- Do not edit `.kaos_mission.json` by hand during an active mission
- Do not add secrets or API keys to committed files — use `.env` only
- Do not run `git add -A` without reviewing what will be staged
- Do not mark a task `[x]` unless code is committed and tests pass
- Do not trust backlog markers without verifying actual repo state

---

## D. Repo / Folder Map

The Vault root contains:

- `vault_brain.py` — System coordinator (routing, human-action tracking, proposals)
- `TaskMaster_Brain.py` — Mission orchestrator (LLM planner, step dispatch)
- `vault_config.py` — Canonical path constants (VAULT_ROOT, DATA_VAULT, etc.)
- `boot_kaos.py` — System boot entry point
- `persona_manifest.json` — Authoritative runtime dispatch table (20 personas)
- `custom_tools_registry.py` — Generated tool registry (do not hand-edit)
- `Skills_Index.json` — Human-readable tool index keyed by module path
- `integration_auditor.py` — KAOS → The_Vault contract validator
- `vault_integrator.py` — KAOS → The_Vault promotion engine

Key folders:

- `Toolkit/` — All domain modules with `api_` prefix functions
- `Consensus_Engine/` — Governance audit layer
- `Contextual_Thinking/` — Thinking quality and context management
- `Copilot_Tests/` — All test files (pytest)
- `docs/manual/` — Operator manual source and build output
- `docs/copilot-context/` — Agent primer files (system-context, authority-map, etc.)
- `docs/copilot-output/` — Living governance documents (persona audit, risk register, etc.)
- `Human_Input_Forms/` — Detailed forms for complex human blockers
- `Health/` — Personal health data files (runtime only, never committed)
- `Schedule/` — Calendar and reminder data
- `Finances/` — Budget and financial data
- `Business/` — Business planning, grant tracking, Ferret Fatale content
- `social_module/` — Social profile management
- `Memory_Setting/` — Memory configuration
- `My_Memories/` — Generated memory summaries

---

## E. Brain Layer

The brain layer is the orchestration core of The Vault. It consists of four components, each with distinct responsibilities.

### Vault_Brain (`vault_brain.py`)

Vault_Brain is the system coordinator operating at temperature 0.0. It routes tasks to appropriate personas, tracks human action entries, manages proposals, and controls operating modes. It does **not** perform domain execution — it does not write code, create content, run schedules, or call external services directly.

Key responsibilities:
- Task routing to appropriate personas
- Human-action entry management (`Human_Input.txt`)
- Proposal queue management
- Backlog phase coordination
- Deploy guard enforcement (SR-002)
- Context budget management for LLM calls (E2 thinking: context purge wiring)
- Deploy tools (SR-002): only Vault_Brain can trigger deployment operations

Thinking quality improvements implemented:
- E1: Success-criteria injection into step prompts
- E2: Context-purge wiring; memory notes truncated to 500 tokens in boot_brain

### TaskMaster_Brain (`TaskMaster_Brain.py`)

TaskMaster_Brain is the mission orchestrator and LLM planner. It generates step-by-step execution plans, dispatches steps to personas, and enforces planning discipline. It is the entry point for multi-step agent missions.

Key rules:
- **Rule 5 — PRESERVED STEPS**: Steps marked `complete` in mission state must not be re-planned. This prevents wasteful re-execution of already-completed work.
- **Core skill disambiguation**: Every persona has a `core_skill` field. TaskMaster_Brain uses it to route ambiguous requests to the right specialist. Missing `core_skill` defaults to "Data Processing" and makes all personas look identical to the LLM planner.
- M4/T4 risk fields: Mission and task records carry risk metadata for planning decisions.

### Consensus_Engine (`Consensus_Engine/`)

Consensus_Engine is the governance auditor and decision scorer. It validates phase transitions, scores consensus outcomes, and audits decisions. It is **read-only with no side effects** — it does not execute missions, write domain content, or perform mutations.

Notable: `api_transition_phase` (a destructive mutation) is explicitly excluded from Consensus_Engine by design — it belongs to Vault_Brain.

Capabilities (34 tools): voting and consensus scoring, governance logging, phase read/validate operations, state read-only access and analytics.

### Contextual_Thinking (`Contextual_Thinking/`)

Contextual_Thinking is the thinking quality layer. It manages contextual rules, persona-level thinking preferences, and context-window budget strategies that enable higher-quality LLM outputs. It works alongside Vault_Brain's E2 context-purge wiring to keep prompts within budget.

Capabilities (12 tools): context selection, persona-aware prompt shaping, reasoning scaffolds.

---

## F. Persona System

The system has **20 active personas**, each with a defined domain, tool grants, delegated scope, and a `core_skill` used by TaskMaster_Brain for routing.

`persona_manifest.json` at repo root is the **sole authoritative runtime dispatch table**. The copy in `Contextual_Thinking/Persona_Manifest.json` is stale — do not use it.

### Personas at a glance

| Persona ID | Domain | Tools | Core purpose |
|---|---|---|---|
| `Vault_Brain` | System coordination | 21 | Temperature 0.0. Routing + gating only. |
| `Consensus_Engine` | Governance audit | 34 | Read-only decision scoring. |
| `Admin_Assistant` | General administration | 81 | Broadest tool grant; manages most domain workflows. |
| `Conversationalist` | Social conversation | 53 | Voice assignment, message queuing, tone management. |
| `Medical` | Health & wellbeing | 55 | Wellbeing stages 1–5, food plan, health checks. |
| `Image_Processor` | Image generation | 48 | Design queue, Replicate API, image tooling. |
| `Business_Ops` | Business planning | 39 | Grant tracking, red-team, website workflows. |
| `Contextual_Thinking` | Thinking quality | 12 | Context budgets, reasoning scaffolds. |
| `Vault_Architect` | Architecture & system design | 17 | KAOS integration, contracts, test matrix. |
| `Websearch` | Web search & retrieval | 12 | Static HTTP fetch; JS-rendered blocked. |
| `CFO` | Financial intelligence | 16 | Budget, expenses, grant tracking, shopping. |
| `Master_Coder` | Code generation & debugging | 15 | Refactoring, code analysis, test writing. |
| `Security` | Security & approval gating | 15 | SR-001/002/003 enforcement, secrets audit. |
| `External_Memory_Retrieval` | External memory | 16 | Long-term memory retrieval. |
| `Living_Memory` | Active/living memory | 16 | Contextual memory during active sessions. |
| `Internal_Memory_Retrieval` | Internal memory | 7 | Lightweight in-session memory access. |
| `Videographer` | Video & content creation | 8 | Stream tooling, Ferret Fatale content. |
| `Goals` | Goal framing & decomposition | 12 | Ambitions → projects, milestones, roadmaps, success criteria. |
| `Inspiration` | Inspiration & ideation | 4 | Creative prompts, idea generation. |
| `Routines` | Routine design | 5 | Habit scaffolding, routine structures. |

### Persona scope boundaries (what each must NOT do)

- No persona may grant tools not registered in `custom_tools_registry.py`
- Vault_Brain and Consensus_Engine operate at system tier — they coordinate; they do not execute domain work
- Personas may delegate to other personas only via explicit `allowed_delegations` in the manifest
- GitHub Copilot agents are development tools, not runtime dispatch targets — never add them to the manifest
- Business_Ops may plan and request website deployments but may NOT execute them; Vault_Brain approval is required
- Goals persona handles framing and decomposition only — it does not schedule, execute, or manage logistics
- Medical persona handles health data only — it does not make medical recommendations or access external health services
- Security persona enforces gates and audits secrets — it does not perform application-level security testing

---

## G. Tool Registry

The tool registry is a three-file system.

### Registry files

| File | Role | Edit policy |
|---|---|---|
| `custom_tools_registry.py` | Generated registry of all callable tools | **Never hand-edit** — regenerate via `Toolkit/registry_sync.py` |
| `persona_manifest.json` | Per-persona tool grants and delegations | Edit carefully; runtime-critical; all edits must update linked docs |
| `Skills_Index.json` | Human-readable tool index keyed by module path | Regenerate via `api_index_folder_skills()`. Only `api_` prefix functions. |

### Registering a new tool

1. Implement the function in the appropriate `Toolkit/` module
2. Name it with `api_` prefix
3. Add it to `Skills_Index.json` (or regenerate)
4. Run `Toolkit/registry_sync.py` to regenerate `custom_tools_registry.py`
5. Add it to the relevant persona's `allowed_tools` in `persona_manifest.json`
6. Run tests to confirm no regressions

**Important:** `api_generate_vault_architect_task` lives in `Toolkit/prompt_forge.py` as a developer-facing helper. It is NOT registered in the runtime registry. Do NOT add it to any persona's `allowed_tools`.

---

## H. Human Input System

The Human Input system is the primary channel for agent-to-human communication when blockers, approvals, or credentials are required.

### Files

| File | Purpose | Rule |
|---|---|---|
| `Human_Input.txt` | Active blockers requiring human action | Append-only. Never overwrite entries. Each entry uses standard block format. |
| `Human_Input_Completed_Log.txt` | Short ledger of resolved items | Append when an entry from Human_Input.txt is resolved. |
| `Human_Input_Proposal_Queue.txt` | Proposals/roadmap items awaiting YES/NO | Append new proposals; resolve or reject with date annotation. |
| `Human_Input_Review_Notes.txt` | Archive / reference / resolved notes | Archive content, not active control. |
| `Human_Input_Forms/` | Detailed forms for complex blockers | One `.md` file per blocked item; linked from Human_Input.txt entries. |

### Standard entry format

```
--------------------------------------------------
TASK:
<task title>

STATUS:
Deferred / Blocked / Human approval needed

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

---

## I. Backlog System

The backlog is the authoritative task-order source for Copilot execution passes.

### Files

| File | Role |
|---|---|
| `KAOS OS ACTIVE BACKLOG.txt` | Live backlog — controlling file for agent task execution |
| `KAOS OS BACKLOG ARCHIVE.txt` | Completed-task archive (permanent record) |
| `KAOS OS ACTIVE SANDBOX BACKLOG.txt` | Sandbox/proposal staging tasks |

### Task status markers

| Marker | Meaning |
|---|---|
| `[ ]` | Not started — agent will pick this up next |
| `[~]` | Partially complete, blocked, or awaiting human input |
| `[x]` | Complete and verified — do not re-execute |

### Backlog rules

- Process one unchecked item at a time in file order
- Never reorder items; only append new ones or mark complete
- Mark `[x]` only after code is committed and tests pass
- If blocked: mark `[~]` and append to `Human_Input.txt`
- Do not put completed work back in the active backlog
- Verify current repository state before trusting backlog status

---

## J. Governance Documents

These documents are living references that must be updated whenever their source of truth changes.

| Document | Location | Purpose |
|---|---|---|
| Risk Register | `docs/copilot-output/risk_register.md` | All security findings, credential blockers, and CFM items |
| State Summary | `docs/copilot-output/vault_state_summary.md` | Operator-facing summary of current system state |
| Systems Snapshot | `docs/copilot-output/vault_systems_snapshot.md` | Feature/status map; generated by `Toolkit/vault_snapshot_generator.py` |
| Persona Audit | `docs/copilot-output/persona_audit.md` | Full 20-persona audit: tools, status, action plan |
| Persona Thread Map | `docs/copilot-output/persona_thread_map.md` | Human-facing chat-thread-to-persona mapping |
| Document Reference Index | `docs/copilot-context/document-reference-index.md` | Classification of every document |
| System Context | `docs/copilot-context/system-context.md` | Agent primer — canonical file locations, persona count, system facts |
| Authority Map | `docs/copilot-context/authority-map.md` | Source-of-truth vs fallback classification |
| Contribution Standards | `docs/contribution-standards.md` | Contribution rules for every doc category |

---

## K. Security and Approval Gates

### Security gates

| Gate | Name | Status | Enforced by |
|---|---|---|---|
| SR-001 | VAULT_ROOT path guard | RESOLVED | `vault_config.py` — `VAULT_ROOT` constant used throughout. No hard-coded paths in runtime. |
| SR-002 | Deploy guard — Vault_Brain only | RESOLVED | Deploy tools are only grantable by Vault_Brain. No persona below system tier can trigger deployment. |
| SR-003 | Destructive-code dry_run gate | RESOLVED | All destructive operations default `dry_run=True`. Must be explicitly set to `False` by human approval flow. |

### No-secrets rule

No secrets, API keys, or tokens may appear in committed files. All credentials belong in `.env` only. GitGuardian alerts on this repo have been resolved (confirmed 2026-04-30).

### External integration gate

Any task touching external services, websites, plugins, channels, APIs, or credentials defaults to **roadmap/scaffold/action-list first** unless the implementation is tiny, local, and clearly safe.

---

## L. Deployment / Website Workflow

Deploy operations are gated at the Vault_Brain tier. No domain persona or sub-agent may trigger deployment without Vault_Brain authorization.

### Permitted deployment targets

- **Allowed:** `ferretfatale.github.io` (GitHub Pages site — separate dedicated repo)
- **Forbidden:** GitHub Pages on The_Vault repo
- **Forbidden:** GitHub Pages on KAOS repo
- **Forbidden:** KAOS as a deployment target for any content

### Website delivery workflow

1. Business_Ops persona handles website planning and content design
2. Vault_Brain approval required before any live deployment action
3. Publishing to `ferretfatale.github.io` requires a separate repo push operation — use `Toolkit/manual_publisher.py`
4. The sandbox-first model must be followed: publish to `web-sandbox-1` preview, confirm, then promote

---

## M. Manual Backend Publishing Workflow

The manual publishing system allows The_Vault to copy, stage, and push the operator manual to approved GitHub Pages targets without any manual file copying by the operator.

### Publisher module

`Toolkit/manual_publisher.py`

### Config file

`docs/manual/manual_publish_targets.json` — defines targets, safe copy patterns, and forbidden patterns.

### Current target status

| Target | Role | Status |
|---|---|---|
| `web-sandbox-1` | Preview / sandbox | Path missing — repo must be cloned locally |
| `ferretfatale.github.io` | Final / public | Path missing — repo must be cloned locally |
| `The_Vault` | — | **DISALLOWED** |
| `KAOS` | — | **DISALLOWED** |

### Publisher API

| Function | Purpose |
|---|---|
| `api_get_manual_publish_targets()` | Returns config for all publish targets |
| `api_prepare_manual_publish(target, dry_run=True)` | Validates target and lists files that would be copied — no writes |
| `api_publish_manual_to_pages_target(target, dry_run=True, publish_approved=False)` | Copies files, optionally commits/pushes. Dry-run by default. |
| `api_verify_hosted_manual(url, target)` | Checks if hosted URL is live and contains expected content. Network required. |
| `api_promote_manual_to_public_target(dry_run=True, publish_approved=False)` | Shortcut for promoting to `ferretfatale.github.io`. |

### Safety gates (always enforced)

- `dry_run=True` is the default — no files are copied unless explicitly set to `False`
- `publish_approved=False` prevents any `git push` — must be explicitly `True`
- The_Vault and KAOS are refused as targets regardless of arguments
- Dirty target repos are refused unless `allow_dirty_target=True` is passed
- Only files matching `safe_copy_patterns` in config may be copied
- Forbidden files (`.env`, `Human_Input*.txt`, `Health/*.json`, `Recovery/*.json`, runtime logs) are never copied

### Typical workflow

```bash
# Step 1: Pre-flight check
python Toolkit/manual_publisher.py --prepare --target web-sandbox-1

# Step 2: Dry-run publish
python Toolkit/manual_publisher.py --publish --target web-sandbox-1 --dry-run

# Step 3: Live copy (no push yet)
python Toolkit/manual_publisher.py --publish --target web-sandbox-1

# Step 4: Push after review
python Toolkit/manual_publisher.py --publish --target web-sandbox-1 --approved

# Step 5: Verify hosted output
python Toolkit/manual_publisher.py --verify --target web-sandbox-1
```

### Sandbox-first, promote-later

Always publish to `web-sandbox-1` first. Review the hosted preview. Only promote to `ferretfatale.github.io` after explicit approval.

---

## N. Memory and Retrieval

| Component | File / Module | Purpose |
|---|---|---|
| Memory builder | `scribe_memory_builder.py` | Generates `My_Memories/` summaries from runtime state |
| Vault memory | `Toolkit/vault_memory.py` | In-session memory access and lookups |
| External retrieval | `External_Memory_Retrieval` persona | 16 tools for long-term / external memory access |
| Internal retrieval | `Internal_Memory_Retrieval` persona | 7 tools for lightweight in-session access |
| Living memory | `Living_Memory` persona | 16 tools for contextual active-session memory |
| KAOS memories | `KAOS/My_Memories/` | Sandbox evidence only — never copy to The_Vault without review |

Memory regeneration is manual-only: run `scribe_memory_builder.py` manually. No daemon trigger is implemented yet.

---

## O. Websearch and Scraping Limits

The Vault has tiered web access capabilities. Some are implemented; others are blocked pending software installation or ToS review.

### What works now

- **Static HTTP fetch** — `Toolkit/web_fetcher.py` → `api_fetch_url_static()` — working
- **ALDI specials scraping** — `Toolkit/shopping_assistant.py` → `api_fetch_aldi_specials()` — working (static HTML, 6h cache)
- **JS-rendered page fetch scaffold** — `api_fetch_url_js_rendered()` exists but requires Playwright installed

### What is blocked

- **Playwright/Chromium**: not installed. When needed: `pip install playwright && playwright install chromium`
- **Account scraping (`api_scrape_account`)**: blocked on platform credentials and ToS review. Intentionally unowned.
- **Social media platform APIs**: each requires credentials and explicit ToS approval.

### Policy

- Static scraping is only safe for public pages where ToS permits it
- Do not scrape pages behind login without explicit per-site approval
- Any new scraping target must be reviewed against its ToS before implementation
- Cache results where possible — ALDI scraper uses a 6-hour TTL

---

## P. Shopping Assistant

Managed by `Admin_Assistant` and `CFO` personas. Current implementation: ALDI Stage B2 static scraper.

Module: `Toolkit/shopping_assistant.py`

- `api_fetch_aldi_specials()` — Fetches ALDI AU weekly specials via static HTML scraping
- `_parse_aldi_specials_html(html)` — Parses article tile structure with multi-fallback selectors
- Cache: `Finances/aldi_specials_cache.json` (6h TTL — runtime only, not committed)
- Tests: 18 offline fixture tests in `Copilot_Tests/test_aldi_scraper.py`
- Other supermarkets: not yet implemented

---

## Q. Social / Discord / Twitch / OCR

`social_module/` provides social profile management, voice assignment, message queuing, and relationship tracking.

- `social_module/social_profiles_builder.py` — Profile CRUD, contact data, social profile management
- `Toolkit/social_response_queue.py` — Incoming message queue for social platforms
- `Toolkit/voice_assignment.py` — Selects the right communication voice for a given contact

**No outbound messages may be sent to any platform without human review of each draft.**

### Discord

Stage A read-only approved but not yet implemented. `DISCORD_BOT_TOKEN` required. See `Human_Input.txt` for the setup action. Stage B (bot account posting) is also blocked.

### Twitch

Integration scaffold only. Credentials and two-role model decision pending. See `Human_Input_Forms/` for the details form.

### OCR chat capture

`Toolkit/chat_ocr_capture.py` — `api_archive_ocr_session()` scaffold implemented. Requires Tesseract binary + Python OCR packages (not installed). Stage B: ready to implement once dependencies are installed.

---

## R. Email / Maton

`Toolkit/maton_client.py` — integration gateway for Gmail, Outlook, GitHub, Google Drive, and other services via the Maton platform.

**All live Maton calls are currently blocked.** Three keys are missing from `.env`: `MATON_API_KEY`, `MATON_GATEWAY_URL`, `MATON_CTRL_URL`.

When unblocked — Stage A (read-only):
- `api_sanitize_email_body(text)` — **Must** be called before passing any email body to an LLM
- `api_maton_google_mail_list_inbox(max_results)` — List Gmail inbox
- `api_maton_outlook_list_inbox(max_results)` — List Outlook inbox (multi-path fallback)
- `api_maton_gmail_list_labels()` — List all Gmail labels/folders
- `api_maton_email_heuristic_triage(messages)` — Classify messages (phishing/spam/marketing/urgent/legitimate)
- `api_maton_extract_email_obligations(messages)` — Extract DEADLINE, DEBT_NOTICE, FORM_REQUIRED patterns

Email Stage A is **READ-ONLY**. No mark-as-read, move, archive, delete, or send is implemented. All write operations require per-app human approval and have not been built yet.

---

## S. Health / Food / Personal Forms

`Health/wellbeing_state.py` implements a 5-stage wellbeing framework, managed by the `Medical` persona (55 tools).

| Stage | Capability | Status |
|---|---|---|
| Stage 1 | Physical health tracking (food, hydration, sleep) | Active |
| Stage 2 | Mental wellbeing check-in | Active |
| Stage 3 | Goal-alignment check | Active |
| Stage 4 | Journaling / reflection | Manual-read only |
| Stage 5 | Default check-in prompt | Active |

Morning briefings: `Toolkit/morning_briefing.py` — daily summary including reminders, health state, goals progress, and schedule.

**Health JSON files (`Health/*.json`) are runtime personal data. Do not commit them.**

---

## T. Finances / Business

### Budget Manager

`Finances/budget_manager.py` — income/expense tracking, budget categories, balance summaries. Uses `DATA_VAULT` constant from `vault_config.py`.

### Business tools

- `Business/grant_tracker.py` — Grant application tracking, status, deadlines
- `Business/business_plan_redteam.py` — Red-team adversarial review of business plans (LLM-assisted)
- `Business/ferret_fatale/` — Content creator hub: stream redeems, Twitch/Kick strategy, Yeah The Girlz notes

---

## U. OpenClaw / Ollama / Local-Model Future Plan

The Vault is designed to support local LLM inference as an alternative to cloud-hosted models via OpenRouter. This is **not yet implemented** but the integration points are defined.

**Current status: DEFERRED.** Ollama is not yet installed on this machine. No local model inference is operational.

### Integration plan (when ready)

- `Toolkit/local_model.py` — Wrapper for Ollama API calls (scaffold only)
- `Toolkit/omni_router.py` — Add `LOCAL` and `OLLAMA` routing modes; model cascade falls back to local before erroring
- See `Human_Input_Forms/openclaw_sandbox_details.md` for the pre-approved KAOS sandbox evaluation plan

### Why local models matter

Local inference via Ollama reduces dependency on OpenRouter for non-sensitive tasks, enables offline operation, and provides a fallback when API quotas are exhausted.

### Steps to proceed when Ollama is installed

1. `ollama pull <model-name>` (e.g. `llama3.2`)
2. Test via `Toolkit/local_model.py` stub
3. Update `Toolkit/omni_router.py` to support `LOCAL` routing mode
4. Run the OpenClaw sandbox evaluation per `Human_Input_Forms/openclaw_sandbox_details.md`
5. Update `persona_manifest.json` to allow specific personas to use local routing
6. Add tests for local model fallback behavior

**Do not promote any local model integration to production without running the sandbox evaluation first.**

---

## V. Testing and Validation

Tests live in `Copilot_Tests/`. The primary suite is `test_runtime_authority_paths.py`.

### Key test files

| Test file | Coverage |
|---|---|
| `test_runtime_authority_paths.py` | Authority paths, routing, model cascade, KAOS integration, social module, schedule, health, email, Human_Input_Hub, Skills_Index |
| `test_backlog_lint.py` | Backlog format validation, lint rules, template sentinel handling (13 tests) |
| `test_aldi_scraper.py` | 18 offline fixture tests for ALDI static scraper |
| `test_brain_thinking_contracts.py` | 44 thinking quality contracts including E2 context-purge wiring and preserved-steps rule |
| `test_manual_updater.py` | Manual meta parsing, change ledger, dry-run batch update (42 tests) |
| `test_manual_publisher.py` | Publisher safety gates, dry-run, refuse KAOS/Vault, no-secrets (new) |
| `test_backlog_integrity.py` | Backlog scheduler + manual batch integration (39 tests) |

Expected total: 800+ tests passing. No live credentials needed for the test suite.

### Run targeted groups

```bash
python -m pytest Copilot_Tests/ -k "aldi" -v
python -m pytest Copilot_Tests/ -k "manual" -v
python -m pytest Copilot_Tests/ -k "thinking" -v
python -m pytest Copilot_Tests/ -k "backlog" -v
```

---

## W. Runtime Churn — Files Never to Stage

The following files change during normal operation and must never be staged or committed.

| File / Pattern | What it contains | Why never staged |
|---|---|---|
| `Health/*.json` | Personal health data | Personal data — never committed |
| `Recovery/*.json` | Recovery state | Personal data — never committed |
| `Toolkit/.backlog_pass_log.json` | Scheduler pass log | Runtime ephemera |
| `Toolkit/.hf_preferences.json` | HuggingFace preferences cache | Runtime ephemera |
| `Images/Morning_Briefings/*.json` | Morning briefing outputs | Session outputs |
| `Onboarding/scan_log.json` | Onboarding scan state | Runtime ephemera |
| `Schedule/reminders.json` | Live reminder state | Changes constantly |
| `Finances/aldi_specials_cache.json` | ALDI specials cache (6h TTL) | Ephemeral cache |
| `.kaos_mission.json` | Active mission state | Live session state — never committed mid-mission |
| `Daemon_Log.txt` | Daemon runtime log | Log file |

Before every `git add`: run `git status --short` and review. Use `git add <specific-file>` rather than `git add -A`.

To unstage an accidentally staged file: `git restore --staged <file>`

---

## X. Troubleshooting and Recovery

### Manual appears stale

1. Run `python Toolkit/manual_updater.py --staleness-report`
2. Check `docs/manual/manual_change_log.jsonl` for pending entries
3. Run `python Toolkit/manual_updater.py --morning-batch --dry-run`
4. If persona count is wrong: `python -c "import json; m=json.load(open('persona_manifest.json')); print(len(m), list(m.keys()))"`
5. If test count is wrong: `python -m pytest Copilot_Tests/ --collect-only -q 2>&1 | Select-String "test session starts"`

### Persona count mismatch

Expected: 20 personas in `persona_manifest.json`. Run:
```bash
python -c "import json; m=json.load(open('persona_manifest.json')); print(len(m), list(m.keys()))"
```

### Test failures after a Copilot pass

1. Run `python -m pytest Copilot_Tests/ -q --tb=short`
2. Common causes: stale string assertions, import path changes, generated file not regenerated
3. For shopping assistant failures: check if ALDI HTML structure changed
4. For thinking contract failures: check if `vault_brain.py` E1/E2 wiring changed

### Failed Copilot run recovery

1. Run `git status --short` to see what changed
2. Check `git diff HEAD` for partial changes
3. Do NOT stage runtime churn files
4. Check `Human_Input.txt` for any newly appended blockers
5. Use `git restore --staged <file>` to unstage any accidental stages

---

## Y. How to Update This Manual

This manual has two parts:
- `docs/manual/manual_source.md` — canonical prose source (edit this first)
- `docs/manual/index.html` — the built HTML output (keep in sync with source)

### Quick update (existing section, small change)

1. Identify stale sections: `python Toolkit/manual_updater.py --staleness-report`
2. Edit the relevant section in `docs/manual/manual_source.md`
3. Edit the matching `<section id="...">` in `docs/manual/index.html`
4. Run tests: `python -m pytest Copilot_Tests/test_manual_updater.py -q`
5. Mark section updated: `api_mark_section_updated("section-id")`
6. Commit: `git commit -m "docs(manual): update <section-id> — <brief reason>"`

### Full update (adding new sections or major rewrite)

1. Update `docs/manual/manual_source.md` with new prose
2. Update `docs/manual/index.html` HTML to match
3. Add new section ID to `docs/manual/manual_meta.json`
4. Update the nav in `index.html` to include the new section link
5. Update `docs/manual/MAINTENANCE.md` section table
6. Run all tests: `python -m pytest Copilot_Tests/test_manual_updater.py -q`
7. Commit both files together

### Publish the updated manual

```bash
python Toolkit/manual_publisher.py --prepare --target web-sandbox-1
python Toolkit/manual_publisher.py --publish --target web-sandbox-1 --dry-run
python Toolkit/manual_publisher.py --publish --target web-sandbox-1 --approved
python Toolkit/manual_publisher.py --verify --target web-sandbox-1
```

### What tests to run

- `test_manual_updater.py` — any time manual HTML or `manual_meta.json` changes
- `test_manual_publisher.py` — any time `manual_publisher.py` or `manual_publish_targets.json` changes
- `test_backlog_lint.py` — any time backlog or control docs change
- `test_runtime_authority_paths.py` — any time Toolkit modules or authority paths change

### Common mistakes

- Describing features as implemented when they are only scaffolded — always check the actual source code
- Forgetting to update `manual_source.md` when editing HTML, leaving the two out of sync
- Forgetting to update `manual_meta.json` after adding a new section
- Editing the manual in HTML only and losing the prose source
