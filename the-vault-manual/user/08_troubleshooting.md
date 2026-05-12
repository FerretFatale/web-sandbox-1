# Troubleshooting

## Fast triage sequence

1. Confirm objective and target surface are explicit.
2. Check for blockers/approval requirements.
3. Check repository state (`git status --short`).
4. Re-run deterministic tests for touched area.
5. Narrow scope and retry smallest safe action.

## Symptom -> response map

1. Wrong persona seems active:
- Rephrase request with explicit domain/owner.
- Ask for persona-specific handoff.

2. Task loops without completion:
- Require step-level success criteria.
- Check partial blockers and unresolved human inputs.

3. External action blocked:
- Confirm approval flag and credential availability.
- Run dry-run first and inspect blockers.

4. Docs or manual drift:
- Run manual staleness and split tests.
- Update source-of-truth docs before publish.

5. Unsure what changed:
- Review recent commits and file diffs before new edits.

## Escalation

Escalate to human decision when risk is high, authority is ambiguous, or live external mutation is requested.
