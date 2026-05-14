# Human-Gated Setup Items

Use this section whenever external systems are involved.

Human-gated means: the system can prepare work, but a person must approve (or provide credentials) before live mutation happens.

## Typical human-gated categories

1. API credentials and account linking.
2. External publishing/deployment actions.
3. Email/social account mutation actions.
4. New platform onboarding requiring approvals.
5. Any operation with legal, billing, or high-risk account impact.

## Common Vault feature areas that trigger gating

1. Social posting and external channel writes.
2. Email send/mutate actions.
3. Deployment or production environment changes.
4. New external integrations requiring secrets.
5. Remote repository operations (for example, push/merge).

## Setup readiness checklist

1. Target account confirmed.
2. Required credentials available locally.
3. Dry-run path available.
4. Explicit approval path documented.
5. Rollback approach defined.

## Beginner setup sequence

If you are new, do this in order:

1. Confirm what system will be touched.
2. Decide if this is read-only or write-capable work.
3. Prepare local credentials outside committed files.
4. Run dry-run or preview mode first.
5. Ask for explicit approval before live write.
6. Capture verification evidence after execution.

## Approval confirmation template

1. Surface: what system/account is affected.
2. Action: what mutation will happen.
3. Scope: exact files or entities affected.
4. Risk: low/medium/high and why.
5. Human decision: approve/defer/reject.

## What to do when approval is missing

1. Mark lane as partial, not complete.
2. Record blocker and required decision.
3. Continue internal prep that does not mutate external systems.
4. Resume live lane only after approval is explicit.
