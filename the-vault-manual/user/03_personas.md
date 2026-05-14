# Personas - Your AI Team

The_Vault uses persona specialization instead of one general-purpose assistant.

Think of personas as team members with specific job descriptions.

## What every persona includes

Each persona has:

1. a domain (what it is responsible for),
2. allowed tools (what it is permitted to do),
3. allowed delegations (who it can hand off to),
4. safety boundaries (what it must not do).

## Why this matters for beginners

Choosing the right persona improves:

1. accuracy,
2. speed,
3. and safety.

Choosing the wrong persona often causes loops, vague output, or unnecessary escalation.

## Fast persona chooser

Use this quick map:

1. **System coordination / high-level escalation** -> `Vault_Brain`
2. **Architecture and structure decisions** -> `Vault_Architect`
3. **Multi-step planning and decomposition** -> `TaskMaster_Brain`
4. **Security or risk checks** -> `Security`
5. **Business and website strategy** -> `Business_Ops`
6. **Scheduling / operations cadence** -> `Admin_Assistant`
7. **Implementation and code lanes** -> `Master_Coder`

## Handoff rule (important)

If work crosses multiple domains:

1. Start with the persona that owns the highest-risk boundary.
2. Delegate downward to execution personas.
3. Return to high-risk owner for final safety confirmation.

### Example

1. Deploy-impacting request starts with `Vault_Brain` or `Security`.
2. Coding work is handled by `Master_Coder`.
3. Documentation updates follow in manual lanes.

## Beginner mistakes to avoid

1. Starting with implementation when the risk boundary is unclear.
2. Asking one persona to do everything.
3. Skipping explicit owner identification for mixed-domain tasks.

## Where to go deeper

1. Full persona map: `10_persona_directory.md`
2. Full tool-level grants: `appendix_persona_tool_catalog.md`
