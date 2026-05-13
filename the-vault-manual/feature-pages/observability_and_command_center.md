# Feature: Observability and Command Center

## 1) Purpose and outcomes

The observability layer gives operators a real-time view of vault health, active mission state,
pending attention items, and operator task history. The primary interface is `vault_dashboard.py`,
a Tkinter GUI with a FERRET FATALE NEON NOIR theme. The state bridge (`vault_state_bridge.py`)
exposes all observability data as API functions accessible from any persona.

## 2) Dashboard GUI: `vault_dashboard.py`

Launch:
```bash
python vault_dashboard.py
```

### Theme constants

```python
BG_COLOR      = "#08080a"    # deep background
PANEL_BG      = "#121217"    # panel background
TEXT_MAIN     = "#e2e8f0"    # primary text
NEON_PINK     = "#ff2a85"    # primary accent
NEON_CYAN     = "#00f0ff"    # command center accent
NEON_PURPLE   = "#b026ff"    # security accent
NEON_GREEN    = "#00ff66"    # financial accent
NEON_GOLD     = "#f39c12"    # architect accent
ELECTRIC_BLUE = "#3498db"    # information color
NEON_RED      = "#e74c3c"    # project HQ accent
NEON_TEAL     = "#00e5cc"    # health accent
```

### Dashboard panels

| Icon | Label           | View ID        | Color       | Description                                        |
|------|-----------------|----------------|-------------|----------------------------------------------------|
| ⚡   | COMMAND CENTER  | command_center | NEON_CYAN   | Fast intake, daily execution, and deep extraction  |
| 🎯   | PROJECT HQ      | project_hq     | NEON_RED    | Goals, projects, tasks, and planning tools         |
| 💰   | FINANCIAL HQ    | financial_hq   | NEON_GREEN  | Budget, ledger, tax, and financial tracking        |
| 🫀   | HEALTH HQ       | health_hq      | NEON_TEAL   | Health, nutrition, wellness, and routine management |
| 🧬   | VAULT ARCHITECT | vault_architect | NEON_GOLD   | Vault structure, note organization, expansion      |
| 🛡️  | SECURITY & QC   | security_qc    | NEON_PURPLE | Security scanning, auditing, quality control       |
| —    | OS STATUS       | status         | —           | Real-time vault health and mission state           |

### Lazy-loaded imports

The dashboard defers these imports until first use to minimize startup time:

- `Toolkit/operator_task_log.py` — `api_log_operator_task_started/completed/failed`
- `Toolkit/vault_state_bridge.py` — `api_get_pending_attention_items`
- `Toolkit/human_input_router.py` — `api_transition_item`
- `Toolkit/mission_control.py` — `api_force_close_mission`

## 3) State bridge API: `Toolkit/vault_state_bridge.py`

The state bridge aggregates health and status data from all vault subsystems.

### Health and mission

```python
api_get_observability_health() -> dict
# Returns: vault component health checks, stale file warnings, service reachability

api_get_current_mission_summary() -> dict
# Returns: active mission id, title, status, current_blocker

api_get_pending_attention_items() -> dict
# Returns: items from Human_Input.txt requiring operator action

api_get_recent_operator_tasks(limit: int = 10) -> dict
# Returns: last N operator task log entries
```

### Dashboard state aggregators

```python
api_get_operator_dashboard_state() -> dict
# Full dashboard state: mission + health + attention items + recent tasks

api_get_command_center_state() -> dict
# Command center panel state: inbox status, today's schedule, active mission

api_get_workstream_control_state() -> dict
# Workstream panel state: goal counts, project counts, task counts
```

### Integration and proposal health

```python
api_get_integration_readiness_summary() -> dict
# KAOS/The_Vault integration readiness: contract coverage, test matrix coverage

api_get_workstream_status_summary() -> dict
# Goals/projects/tasks counts, completion rates

api_get_proposal_status_summary() -> dict
# Human_Input_Proposal_Queue.txt: pending, approved, rejected counts
```

### Docs and tests health

```python
api_get_docs_freshness_summary() -> dict
# Days since last manual update, stale doc count

api_get_safe_test_status_summary() -> dict
# Last test run result, failing test count, coverage summary

api_get_runtime_artifact_warning_summary() -> dict
# Orphaned JSON files, stale cache files, large files
```

### Storage health

```python
api_get_state_storage_health() -> dict
# JSON file health: malformed files, missing required files, oversized stores
```

## 4) Operator task log: `Toolkit/operator_task_log.py`

Records operator-initiated tasks for audit and review in the dashboard.

```python
from Toolkit.operator_task_log import (
    api_log_operator_task_started,
    api_log_operator_task_completed,
    api_log_operator_task_failed,
    api_list_operator_tasks,
)

api_log_operator_task_started(task_name="email_triage", context={"inbox": "proton"})
# {"status": "success", "task_id": "OT_abc123", "started_at": str}

api_log_operator_task_completed(task_id="OT_abc123", result_summary="6 emails processed")
# {"status": "success"}

api_log_operator_task_failed(task_id="OT_abc123", error_message="Connection refused")
# {"status": "success"}

api_list_operator_tasks(limit=20)
# {"status": "success", "tasks": [...], "count": 20}
```

## 5) Daemon log: `Daemon_Log.txt`

`vault_sensory_system.py` writes all background watchdog events to `Daemon_Log.txt` at vault root
using `SafeLogger`. The OS STATUS panel reads from this file to show recent activity.

## 6) Example: checking vault health from a persona

```python
from Toolkit.vault_state_bridge import api_get_observability_health

health = api_get_observability_health()
if health["status"] == "success":
    for component, status in health["data"]["components"].items():
        if status != "ok":
            print(f"WARNING: {component} is {status}")
```

## 7) Testing

```bash
python -m pytest Copilot_Tests/test_vault_state_bridge.py -v
python -m pytest Copilot_Tests/test_operator_task_log.py -v
```

Key test cases: health check returns all components, mission summary returns active mission, 
pending attention items includes Human_Input items, operator task lifecycle (start/complete/fail).

## 8) Storage layout

```
vault_dashboard.py                  <- GUI entry point
Toolkit/
  vault_state_bridge.py             <- all observability API functions
  operator_task_log.py              <- operator task lifecycle logging
  human_input_router.py             <- attention item routing
  mission_control.py                <- force-close mission API
Daemon_Log.txt                      <- background event log (watchdog)
```

## 9) Dependencies and integrations

- `Toolkit/vault_state_bridge.py` — all state bridge APIs
- `vault_brain.py` — mission state (read by state bridge)
- `Human_Input.txt` — attention items source
- `Daemon_Log.txt` — background event stream
- `.kaos_mission.json` — active mission state

## 10) Change log and manual maintenance

- Last reviewed: 2026-05-14
- Source of truth: `vault_dashboard.py`, `Toolkit/vault_state_bridge.py`
- Update triggers: new panel added, theme colors changed, new state bridge API added, operator task schema changed.
