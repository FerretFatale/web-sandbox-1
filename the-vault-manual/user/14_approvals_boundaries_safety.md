# Approvals, Boundaries, and Safety

## Default rule

Read/write/test/edit operations inside the repo are routine. Live external writes, pushes, credential mutations, and production-impact actions are approval-gated.

If unsure, default to proposal-first + dry-run.

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

## Domain examples

1. Social pipeline draft generation: local-safe.
2. Social post publish: approval-gated.
3. Finance summary generation: local-safe.
4. Modifying live billing/account integrations: approval-gated.
5. Manual content rewrite: local-safe.
6. Live web publish/deploy: approval-gated.

## Safety protocol

1. State risk level.
2. State exact impacted surfaces.
3. State rollback/recovery path.
4. Require explicit approve signal before live mutation.

## Partial-state safety rule

If approval is missing, mark partial and record exact unblock step.
