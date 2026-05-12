# Tips, Tricks, and Operator Patterns

## High-value patterns

1. Always specify in-scope and out-of-scope surfaces.
2. Ask for dry-run first on risky/external actions.
3. Require success criteria before large execution.
4. Split large asks into checkpointed phases.
5. Ask for explicit blocker list before pausing.

## Prompt templates

1. "Proposal-first, then execute phase 1 only."
2. "Implement docs lane only; no runtime code changes."
3. "Run validation and report only failing assertions."
4. "Do not widen scope; checkpoint after each milestone."

## Anti-patterns

1. "Do everything" without boundaries.
2. External mutation without explicit approval.
3. Declaring complete before deterministic validation.
4. Mixing unrelated lanes into one commit.

## Efficiency tricks

1. Reuse established playbooks from `11_workflow_playbooks.md`.
2. Keep a standing list of repeat prompts that work.
3. Ask for a short risk register at plan time.
