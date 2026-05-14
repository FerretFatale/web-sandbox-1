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
5. "Map available features for this domain before execution."
6. "Explain like I am new; avoid advanced assumptions."

## Anti-patterns

1. "Do everything" without boundaries.
2. External mutation without explicit approval.
3. Declaring complete before deterministic validation.
4. Mixing unrelated lanes into one commit.
5. Assuming missing setup means missing capability.
6. Treating blocked approval as runtime failure.

## Efficiency tricks

1. Reuse established playbooks from `11_workflow_playbooks.md`.
2. Keep a standing list of repeat prompts that work.
3. Ask for a short risk register at plan time.
4. Use domain-by-domain checklists to avoid missing features.
5. Ask for "what exists today" before requesting new build work.

## Discoverability pattern (recommended)

When starting a lane, run this pattern:

1. "List all relevant built-in features in this domain."
2. "Show what is ready now vs roadmap."
3. "Give me beginner operating steps for ready features."
4. "Mark what requires approval or credentials."

## Beginner safety pattern

Use this exact shape for high-stakes requests:

1. objective,
2. in-scope surface,
3. out-of-scope surface,
4. approval expectations,
5. stop condition.
