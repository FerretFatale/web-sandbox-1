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

6. Feature exists but user cannot find it:
- Use the user manual chapter map and feature index.
- Add discoverability note to the relevant chapter when missing.

7. External integration appears unavailable:
- Check whether the lane is truly blocked or just unconfigured.
- Distinguish missing approval from missing capability.

8. Scheduled automation behaves unexpectedly:
- Verify schedule source, timezone assumptions, and latest run evidence.
- Re-run with minimal test case before broad retry.

9. Health or memory output looks stale:
- Confirm data source timestamp.
- Verify retrieval lane and retention/archival status.
- Rebuild summaries from current records.

10. Social or content pipeline stops at final step:
- Confirm whether final publish is human-gated.
- Check for missing approval instead of treating as runtime failure.

## Domain-specific troubleshooting shortcuts

### Scheduling

1. Validate event source and date range.
2. Check reminder timing assumptions.
3. Re-run weekly or daily planner generation in isolation.

### Health tracking

1. Confirm input format consistency.
2. Verify latest logs are included in summary window.
3. Rebuild trend outputs with explicit time range.

### Finance and business

1. Confirm period boundaries (weekly/monthly).
2. Validate category mapping.
3. Re-run summary computation before decision output.

### Memory and research

1. Confirm scope: user, session, or repository memory.
2. Validate retrieval surface and freshness.
3. Remove stale assumptions and rerun with updated context.

## Escalation

Escalate to human decision when risk is high, authority is ambiguous, or live external mutation is requested.

## When to stop and mark partial

Stop and mark partial if:

1. approval is required but missing,
2. credentials are unavailable,
3. risk exceeds current lane authority,
4. objective cannot be met safely with internal-only actions.
