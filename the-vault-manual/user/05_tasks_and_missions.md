# Managing Tasks and Missions

This chapter explains how work moves from request to completion inside The_Vault.

## What is a task vs a mission?

1. **Task** = one bounded action with one clear output.
2. **Mission** = multi-step work with dependencies, checkpoints, and validation.

If the work touches many files, personas, or approvals, treat it as a mission.

## Mission lifecycle (operator view)

1. **Intake**
	- Capture objective, scope, and constraints.
2. **Planning**
	- Break into step IDs and define completion evidence.
3. **Approval phase (when required)**
	- Confirm high-risk operations before execution.
4. **Execution**
	- Run one safe tranche at a time.
5. **Validation**
	- Run deterministic checks for changed surfaces.
6. **Closure**
	- Record outcome, partials, and next lane.

## Practical step format (recommended)

For each step, define:

1. Step ID
2. Owner persona
3. Inputs
4. Expected output
5. Validation check
6. Stop condition

## Checkpoint discipline

Checkpoint after each independently verifiable milestone - not only at the end.

Good checkpoint examples:

1. "Chapters 1-4 rewritten and reviewed"
2. "Public guide diagrams validated"
3. "Manual tests pass for updated surfaces"

## Partial completion policy

Use partial status when blocked. Never force false completion.

A valid partial report includes:

1. what was completed,
2. what is blocked,
3. exact human action needed,
4. next safe step after unblocking.

## Mission failure recovery

If execution fails:

1. capture exact failure point,
2. isolate changed surfaces,
3. restore known-good state using normal git workflow,
4. resume with narrower scope and explicit success criteria.

## Feature-aware examples

Mission examples from real Vault capabilities:

1. Scheduling mission: weekly planner + reminders + events sync.
2. Health mission: mood/exercise/food logs + appointment update packet.
3. Finance mission: expenses/income + monthly summary + trends.
4. Social mission: draft queue + approval path + export workflow.
