# The Vault Feature Pages

This directory is the authoritative page-per-feature manual source for major Vault capabilities.

## Coverage mandate
- Every major feature must have one dedicated page in this folder.
- Each page must follow `TEMPLATE_feature_page.md`.
- No page may be published if template placeholders or incomplete scaffold text remain.

## Current feature page map
- `memory.md`
- `goals.md`
- `inspiration.md`
- `routines.md`
- `budget.md`
- `eros.md`
- `new_feature_creation.md`
- `data_sorting.md`
- `email_intelligence.md`
- `business_portal.md`
- `coding_and_model_routing.md`
- `contextual_thinking.md`
- `security.md`
- `maintenance.md`
- `governance.md`
- `vault_brain.md`
- `taskmaster_brain.md`
- `human_input_and_backlogs.md`
- `research.md`
- `schedule.md`

## Authoring workflow
1. Duplicate the template for new features.
2. Fill all sections with evidence-backed content.
3. Register the page in `feature_page_registry.json` with required source files and functions.
4. Link source-of-truth code/doc paths in section 11.
5. Run manual tests:
`python -m pytest Copilot_Tests/test_manual_quality_gate.py Copilot_Tests/test_manual_publisher.py Copilot_Tests/test_manual_split.py Copilot_Tests/test_manual_updater.py -q`
6. Publish only after quality gates pass.
