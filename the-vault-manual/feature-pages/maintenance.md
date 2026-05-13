# Feature: Maintenance

## 1) Purpose and outcomes

The Vault entered maintenance mode after Phase 10 (RC tag `vault-rc-20260501`). In maintenance mode, bug fixes and hygiene commits are preferred over new features. New features require a proposal in `Human_Input_Proposal_Queue.txt`. Architecture files require documented rationale and tests before any change.

## 2) Maintenance cadence

### Daily (before any Copilot session)

```bash
git status --short
git --no-pager log --oneline -5
python -m pytest Copilot_Tests/test_backlog_lint.py -q
```

Also review:
- `Human_Input.txt` — any new blockers?
- `KAOS OS ACTIVE BACKLOG.txt` — any new tasks?

### Weekly

```bash
# Full test suite (excluding live service, local-only, and slow tests)
python -m pytest Copilot_Tests/ -m "not live_service and not local_only and not private_data and not slow" -q

# Vault snapshot and state summary
python Toolkit/vault_snapshot_generator.py
python Toolkit/vault_state_summary.py

# Registry and report coverage refresh
python Toolkit/report_coverage_registry_manager.py --refresh --validate --write-summary

# Output lifecycle audit
python Toolkit/copilot_output_lifecycle_audit.py --write-summary

# Root inventory governance
python Toolkit/root_inventory_governance.py --lint --write-summary

# Verify manual is current
python Toolkit/manual_publisher.py --verify --target ferretfatale

# Check KAOS mirror
# cd ../KAOS && git log --oneline -5
```

## 3) Maintenance definitions

| Work type | Rule |
|---|---|
| Bugfix | Allowed freely. Small, test-backed. |
| Hygiene | Allowed. Import cleanup, dead-code removal (with evidence). |
| Refactor | Allowed when architecture-aware and test-backed. |
| New feature | Blocked unless proposal in `Human_Input_Proposal_Queue.txt` is approved. |
| Architecture file changes | Require documented rationale + tests before any edit. |

## 4) Architecture files (high-risk, protected)

Changes to these files require Gatekeeper review evidence and test coverage:

```
vault_brain.py
TaskMaster_Brain.py
vault_config.py
Toolkit/models_manager.py
Toolkit/omni_router.py
Toolkit/registry_sync.py
persona_manifest.json
Custom_Tools_Registry.py
AGENTS.md
.github/copilot-instructions.md
```

Do NOT change the mission-state field shape, persona/model routing, or routing fallback behavior without updating all downstream consumers and tests in the same commit.

## 5) Maintenance health check: `Toolkit/run_maintenance_health_check.py`

```bash
python Toolkit/run_maintenance_health_check.py
```

Checks:
- Python syntax validity across all `.py` files
- Import chain completeness
- Mission state read/write round-trip
- Registry sync integrity
- Backlog lint pass

## 6) Audit cadence monitor: `Toolkit/audit_cadence_monitor.py`

Tracks whether all scheduled audit workflows have run within their required cadence window.

```python
from Toolkit.audit_cadence_monitor import api_run_audit_cadence_check

result = api_run_audit_cadence_check()
# {"status": "success", "data": {"overdue": [str, ...], "on_schedule": [str, ...]}}
```

Overdue audit types are also written to `AUDITS_BACKLOG.txt`.

## 7) Backlog scheduler: `Toolkit/backlog_maintenance.py`

```python
from Toolkit.backlog_maintenance import api_start_backlog_scheduler, api_stop_backlog_scheduler, api_backlog_scheduler_status

# Start the background scheduler (runs audit cadence + backlog hygiene periodically)
result = api_start_backlog_scheduler()
# {"status": "success", "data": {"scheduler_id": str, "next_run": str}}

# Check status
result = api_backlog_scheduler_status()
# {"status": "success", "data": {"running": bool, "last_run": str, "next_run": str}}

# Stop
result = api_stop_backlog_scheduler()
```

## 8) Pre-commit requirements

Before every commit touching backlog or checklist files:

```bash
python -m pytest Copilot_Tests/test_backlog_lint.py -q
```

This lint test verifies:
- All backlog task blocks have required fields (48-dash separator, TASK:, STATUS:, GOAL:, STEPS:)
- No forbidden phrasing in backlog items
- ACTIVE TASK INDEX count matches actual unchecked task count

## 9) Baseline reference

| Item | Value |
|---|---|
| Maintenance baseline commit | `f59e7e1` — vault-rc-20260501 |
| Phase 11 entry commit | `a91ea15` |
| Tag | `vault-rc-20260501` |

Use `git log --oneline -1` at session start to verify current HEAD before any session.

## 10) Copilot output lifecycle

Every file in `docs/copilot-output/{reference,audits,action-packets,completion-reports,archive}/` must be tracked in `docs/copilot-output/copilot_output_registry.json`. Registry entries require meaningful `intent_class` and `owner` fields, not path-only placeholders.

## 11) Dependencies and integrations

- `Toolkit/run_maintenance_health_check.py` — system health sweep
- `Toolkit/backlog_maintenance.py` — scheduled backlog hygiene
- `Toolkit/audit_cadence_monitor.py` — cadence tracking
- `Toolkit/vault_snapshot_generator.py` — weekly vault snapshots
- `Toolkit/manual_publisher.py` — manual currency verification
- `Copilot_Tests/test_backlog_lint.py` — pre-commit backlog lint
- `docs/copilot-output/reference/00-authority/maintenance_mode_operating_rules.md` — full operating rules
- `Human_Input_Proposal_Queue.txt` — new feature proposal surface

## 12) Change log and manual maintenance

- Last reviewed: 2026-05-14
- Source of truth: `docs/copilot-output/reference/00-authority/maintenance_mode_operating_rules.md`
- Update triggers: cadence schedule changed, new maintenance command added, health check tests changed, architecture file list changed.
