# Personas - Your AI Team

The_Vault uses persona specialization. Each persona has:
1. a domain,
2. allowed tools,
3. allowed delegations,
4. safety boundaries.

## How to choose a persona quickly

1. Architecture and governance changes: `Vault_Architect`.
2. System coordination and escalation: `Vault_Brain`.
3. Multi-step plan decomposition: `TaskMaster_Brain` (planner controller).
4. Security/risk checks: `Security`.
5. Business and website planning: `Business_Ops`.
6. Operations rhythm and schedule: `Admin_Assistant`.

## Persona handoff principle

If a task spans domains, start with the persona that owns the highest-risk boundary, then delegate downward.

Example:
1. deployment-impact change -> `Vault_Brain`/`Security` boundary,
2. implementation via `Master_Coder`,
3. documentation via writer/manual lanes.

See full persona map: `10_persona_directory.md`.
See complete tool list: `appendix_persona_tool_catalog.md`.
