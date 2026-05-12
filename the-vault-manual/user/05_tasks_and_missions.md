# Managing Tasks and Missions

## Task lifecycle

1. Define objective and completion signal.
2. Classify risk and approval needs.
3. Execute smallest safe unit.
4. Validate with deterministic evidence.
5. Record outcome and next lane.

## Mission workflow

1. Intake and analysis.
2. Plan with step IDs and success criteria.
3. Execute with checkpointing.
4. Re-plan if blockers emerge.
5. Close with validation and documentation update.

## When to checkpoint commit

Checkpoint after each independently verifiable milestone, not only at the end.

## Partial completion policy

Use partial status when blocked; do not force false completion.

## Mission failure recovery

1. capture exact failure point,
2. isolate changed surfaces,
3. restore to known-good state via normal git workflow,
4. resume with narrower scope.
