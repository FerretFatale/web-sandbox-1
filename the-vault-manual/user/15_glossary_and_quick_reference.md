# Glossary and Quick Reference

## Glossary

1. Lane: a bounded unit of work.
2. Enshrine: formal codification of repeatable process into governance docs.
3. Gatekeeper Review: structured governance closeout with evidence.
4. Assimilation: converting successful external capability usage into internal reusable process.
5. Partial completion: safe paused state when blocked.
6. Discoverability pass: explicitly mapping existing features before planning new work.
7. Human-gated action: operation requiring explicit person approval.

## Capability atlas (what exists in The_Vault)

Use this as your fast feature map:

1. Planning and mission orchestration
2. Scheduling and reminders
3. Goals and routines
4. Health logging and continuity tracking
5. Memory systems (user/session/repo)
6. Finance and business operations
7. Social/content workflows
8. Image/video creative support
9. Internal and external research retrieval
10. Governance, approval, and safety protocols

For full routing (domain -> persona -> playbook -> setup -> approval), use: `17_feature_discovery_table.md`.

## Quick operator commands

1. `python Toolkit/manual_updater.py --staleness-report`
2. `python Toolkit/manual_publisher.py --prepare --target web-sandbox-1`
3. `python Toolkit/manual_publisher.py --publish --target web-sandbox-1 --dry-run`
4. `python Toolkit/manual_publisher.py --verify --target web-sandbox-1`
5. `python -m pytest Copilot_Tests/test_manual_split.py -q`
6. `python -m pytest Copilot_Tests/test_manual_publisher.py -q`
7. `python -m pytest Copilot_Tests/test_backlog_lint.py -q`

If your environment differs, ask for the equivalent run command in your configured interpreter.

## Quick prompts

1. "Proposal-first, no implementation yet."
2. "Execute phases 1-2 only, then stop for review."
3. "Run dry-run and summarize blockers before live action."
4. "Scoped commit only; exclude unrelated workspace changes."
5. "Show me the capability map for this domain before implementation."
