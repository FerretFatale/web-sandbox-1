# How to Talk to The_Vault

## Core prompting pattern

Use this structure for most requests:
1. Objective: what outcome you want.
2. Scope: what files/surfaces are in-bounds.
3. Constraints: safety, approvals, deadlines.
4. Success criteria: how you know it is done.

## Quick tasks vs missions

1. Quick task: single output, low ambiguity, limited side effects.
2. Mission: multi-step, dependency-driven, cross-surface changes.

## High-signal prompt examples

1. "Create a checklist and execute only steps 1-2, then stop for review."
2. "Update docs only, no runtime code changes."
3. "Run dry-run first, summarize blockers before live action."
4. "Use proposal-first: give me plan, risks, and acceptance criteria before implementing."

## Avoid ambiguity

1. Name target surface explicitly (`docs/manual/public/...`, `Toolkit/...`).
2. State if external writes are allowed.
3. State whether commit is expected.
4. State what should not be touched.

## Revision feedback style

When a result misses, respond with:
1. what was wrong,
2. what must change,
3. what should stay unchanged,
4. how strict the next pass should be.
