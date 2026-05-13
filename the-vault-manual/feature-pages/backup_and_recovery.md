# Feature: Backup and Recovery

## 1) Purpose and outcomes

Backup and recovery covers vault snapshots, legacy code archiving, quarantine management, and
incident-recovery procedures. The system protects vault state through periodic snapshots, safely
isolates problematic code in quarantine, and provides structured recovery pathways from failed or
incomplete operations.

## 2) Vault snapshots: `Toolkit/vault_snapshot_generator.py`

Generates a complete vault snapshot for weekly health verification.

```bash
python Toolkit/vault_snapshot_generator.py
```

Produces a snapshot file in `Archives/Vault_Snapshots/` with:
- File count and directory tree summary
- Registry and config file hashes
- Active mission state (sanitized)
- Test suite summary (pass/fail count)
- Persona manifest checksum

### When to run
- Weekly (part of standard maintenance cadence)
- Before and after major architecture changes
- After promotion of KAOS code into The_Vault

## 3) Legacy code archive: `Recovery/`

All code quarantined or archived for safety review lands in `Recovery/`.

```
Recovery/
  Legacy_Code_Archive/          <- finalized archived code (reviewed, no rollback needed)
  Legacy_Code_Intake/           <- staging area for code being reviewed before permanent archive
  legacy_intake_report.json     <- manifest of files in intake pipeline
  quarantine_audit_report.json  <- latest quarantine audit results
```

### Intake protocol

When code is identified as potentially unsafe, stale, or architecture-breaking:

1. Copy to `Recovery/Legacy_Code_Intake/` (do not delete the original yet)
2. Update `legacy_intake_report.json` with: filename, reason for quarantine, date, risk level
3. Run review — compare against production contract, tests, and wiring evidence
4. If safe to remove: move to `Legacy_Code_Archive/`, update intake report with decision
5. If contains active dependencies: revert from intake, file as architecture blocker in `Human_Input.txt`

### Quarantine audit: `quarantine_audit_report.json`

```json
{
  "audit_date": "2026-05-14",
  "quarantined_files": [
    {
      "filename": "old_router.py",
      "reason": "Replaced by omni_router.py",
      "quarantine_date": "2026-04-01",
      "status": "pending_review",
      "risk_level": "low"
    }
  ],
  "pending_review_count": 1,
  "cleared_count": 3
}
```

## 4) Vault state summary: `Toolkit/vault_state_summary.py`

Generates a human-readable summary of the current vault state, including:
- Active personas and their tool assignments
- Mission state and blocker summary
- Backlog item counts
- Registry sync status

```bash
python Toolkit/vault_state_summary.py
```

## 5) Report coverage and registry governance

Weekly maintenance tools:

```bash
python Toolkit/report_coverage_registry_manager.py --refresh --validate --write-summary
python Toolkit/copilot_output_lifecycle_audit.py --write-summary
python Toolkit/root_inventory_governance.py --lint --write-summary
```

These tools verify that all referenced files exist, all registry entries have valid source modules,
and all lifecycle-tracked docs are in the correct bucket.

## 6) Recovery from a failed mission

If a mission fails mid-execution and leaves `.kaos_mission.json` in a broken state:

```python
from Consensus_Engine.state_io_manager import api_write_mission_state

# Reset mission to safe terminal state
api_write_mission_state({
    "mission_id": "RECOVERY_MANUAL",
    "title": "Manual recovery",
    "status": "TERMINATED",
    "current_blocker": "Mission failure — operator reset",
    "original_request": "[Recovery reset]",
})
```

If state is unresolvable, delete `.kaos_mission.json` and restart. The vault reinitializes from
`persona_manifest.json` and `vault_config.py` on next boot.

## 7) Recovery from broken registry

```bash
# Rebuild registry from source
python fix_registry.py

# Verify sync
python -m pytest Copilot_Tests/test_registry_sync.py -v
```

## 8) Deduplication: `resolve_clones.py`

Scans the vault for duplicated files and surfaces conflicts for operator review.

```bash
python resolve_clones.py
```

Returns a list of clone pairs with file paths, size comparison, and last-modified dates.
Never auto-deletes — operator reviews and approves removals.

## 9) KAOS mirror recovery

If the local KAOS sandbox diverges from The_Vault:

```bash
# Check divergence
cd C:\Users\LittleChickpea\OneDrive\Documents\KAOS
git log --oneline -5

# Compare a specific file
diff The_Vault/vault_brain.py KAOS/vault_brain.py
```

Always treat The_Vault as the authority. Re-mirror from The_Vault outward, not inward.

## 10) Git baseline and RC tag

The production-stable baseline is tagged `vault-rc-20260501` at commit `f59e7e1`.

```bash
# Reset to known-good baseline (destructive — confirm first)
git checkout vault-rc-20260501

# Create a new RC tag after a successful maintenance cycle
git tag vault-rc-YYYYMMDD
```

## 11) Financial and personal data backups

- All personal data is in the DATA_VAULT path (defined in `vault_config.py`)
- OneDrive provides cloud version history for most files
- For critical files (Financial_Profile.json, Ledger.json): export copies to `Archives/Financial_Documents/`
- Tax exports land in `Archives/Tax_Exports/` via `api_generate_tax_summary()`
- Smart archives at `Archives/Smart_Archives/` are auto-managed by the archive engine

## 12) Pre-commit test gate

```bash
python -m pytest Copilot_Tests/test_backlog_lint.py -q
```

This must pass before any commit touching backlog or checklist files.

## 13) Dependencies and integrations

- `Recovery/` — legacy code intake and archive
- `Toolkit/vault_snapshot_generator.py` — weekly snapshot
- `Toolkit/vault_state_summary.py` — human-readable state summary
- `Consensus_Engine/state_io_manager.py` — mission state read/write
- `fix_registry.py` — registry rebuild
- `resolve_clones.py` — deduplication tool
- `Daemon_Log.txt` — daemon execution log
- `Archives/Vault_Snapshots/` — snapshot storage

## 14) Change log and manual maintenance

- Last reviewed: 2026-05-14
- Source of truth: `Recovery/`, `Toolkit/vault_snapshot_generator.py`, `Consensus_Engine/state_io_manager.py`
- Update triggers: new recovery procedure added, quarantine process changed, snapshot format changed.
