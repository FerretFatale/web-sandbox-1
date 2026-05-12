# Glossary and Quick Reference

## Glossary

1. Lane: a bounded unit of work.
2. Enshrine: formal codification of repeatable process into governance docs.
3. Gatekeeper Review: structured governance closeout with evidence.
4. Assimilation: converting successful external capability usage into internal reusable process.
5. Partial completion: safe paused state when blocked.

## Quick operator commands

1. `python Toolkit/manual_updater.py --staleness-report`
2. `python Toolkit/manual_publisher.py --prepare --target web-sandbox-1`
3. `python Toolkit/manual_publisher.py --publish --target web-sandbox-1 --dry-run`
4. `python Toolkit/manual_publisher.py --verify --target web-sandbox-1`
5. `python -m pytest Copilot_Tests/test_manual_split.py -q`
6. `python -m pytest Copilot_Tests/test_manual_publisher.py -q`
7. `python -m pytest Copilot_Tests/test_backlog_lint.py -q`

## Quick prompts

1. "Proposal-first, no implementation yet."
2. "Execute phases 1-2 only, then stop for review."
3. "Run dry-run and summarize blockers before live action."
4. "Scoped commit only; exclude unrelated workspace changes."
