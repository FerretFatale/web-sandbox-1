# Approvals, Boundaries, and Safety

## Default rule

Read/write/test/edit operations inside the repo are routine. Live external writes, pushes, credential mutations, and production-impact actions are approval-gated.

## Always approval-gated examples

1. Publishing to external hosted targets with live mutation.
2. Posting/sending actions against live external accounts.
3. Changes to production secrets/environment values.
4. Push-to-remote when policy requires explicit confirmation.

## Boundary matrix

1. Local docs/code edits: allowed within scoped lane.
2. Deterministic local tests: expected before closeout.
3. Dry-run external actions: preferred first step.
4. Live external actions: only when explicitly approved.

## Safety protocol

1. State risk level.
2. State exact impacted surfaces.
3. State rollback/recovery path.
4. Require explicit approve signal before live mutation.
