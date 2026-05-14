# How to Talk to The_Vault

This chapter teaches you how to give instructions that are clear, safe, and easy to execute.

If you remember one thing: **be explicit about outcome, scope, and boundaries.**

## The 4-part request pattern (default)

Use this for almost every request:

1. **Objective** - what you want done.
2. **Scope** - what files/surfaces are in-bounds.
3. **Constraints** - approvals, safety rules, timing limits.
4. **Success criteria** - how completion will be judged.

### Example (strong)

"Objective: improve user manual readability for beginners.
Scope: `docs/manual/user/*.md` only.
Constraints: no runtime code changes, no publish action.
Success: all chapters expanded with examples and plain language."

### Example (weak)

"Make docs better."

Why weak? No target, no safety limits, no completion signal.

## Quick task vs mission (how to choose)

1. **Quick task**
	- One clear output
	- Low ambiguity
	- Minimal side effects
	- Example: "Fix typos in chapter 3 only"
2. **Mission**
	- Multi-step
	- Cross-file dependencies
	- Needs checkpoints and validation
	- Example: "Overhaul all manual surfaces for different audiences"

## Prompt templates you can reuse

1. **Proposal first**
	- "Give me a short plan, risks, and acceptance criteria before implementing."
2. **Safe execution**
	- "Run dry-run first and list blockers before any live action."
3. **Scope lock**
	- "Touch docs only; no runtime code changes."
4. **Checkpoint flow**
	- "Execute phase 1, then stop and report before phase 2."

## How to reduce misunderstandings

Before execution, confirm:

1. Target files are named.
2. Out-of-scope surfaces are named.
3. Approval status is clear for external actions.
4. Validation expectations are stated.

## Feedback format when results miss

Use this correction format:

1. What was wrong.
2. What must change.
3. What should stay unchanged.
4. How strict the next pass should be.

### Example correction

"The tone is still too technical for beginners.
Keep the structure, but add practical examples after each concept.
Do not change section order.
Re-run only docs tests after edits."

## Beginner pro-tip

If you feel uncertain, ask for:

1. a one-screen summary,
2. a step-by-step plan,
3. a risk list,
4. and a clear stop point.
