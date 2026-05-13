# Feature: <Feature Name>

## 1) Purpose and outcomes
- What this feature is for.
- What success looks like.
- Who should use it and when.

## 2) User-facing workflow
1. Entry points (UI/command/prompt).
2. Required inputs.
3. Optional inputs.
4. Output expectations.
5. Failure and fallback behavior.

## 3) Backend flow (stage-by-stage)
1. Router/dispatch stage.
2. Validation/precondition stage.
3. Brain/agent execution stage.
4. Persistence/logging stage.
5. Post-processing and feedback stage.

## 4) Frontend flow (stage-by-stage)
1. UI state before action.
2. Action processing states.
3. Success render state.
4. Error render state.
5. Recovery actions.

## 5) Function and tool surface
- Core functions/APIs.
- Supporting helpers.
- Connected tools/skills/MCPs.
- Explicit human-approval gates.

## 6) Configuration and preconditions
- Required configs.
- Defaults.
- What omni-router chooses when model is not defined.
- Security and policy boundaries.

## 7) Data model, storage, and sorting
- Inputs and schema expectations.
- Storage locations.
- Sorting/indexing/retention behavior.
- Privacy and redaction requirements.

## 8) Governance, risks, and controls
- High-risk actions.
- Gatekeeper checkpoints.
- Review artifacts and evidence required.
- Escalation paths (`Human_Input.txt`, backlog lanes).

## 9) Testing and verification
- Required deterministic tests.
- Smoke tests.
- Publish-readiness checks.
- Common regressions.

## 10) Dependencies and integrations
- Upstream systems.
- Downstream systems.
- External tools used to fill gaps.
- Assimilation decision (internalize / keep external / defer).

## 11) Change log and manual maintenance
- Last reviewed date.
- Source-of-truth files.
- Trigger conditions that require manual updates.

