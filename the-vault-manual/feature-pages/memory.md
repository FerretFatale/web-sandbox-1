# Feature: Memory

## 1) Purpose and outcomes
- Capture, retrieve, and operationalize durable context across missions without leaking sensitive data.
- Success requires deterministic execution, explicit blocker reporting, and auditable state transitions.
- This page is for both operator usage and maintenance governance.

## 2) User-facing workflow
1. User/operator submits an objective tied to this feature.
2. Vault_Brain or TaskMaster_Brain routes the request to the mapped capability lane.
3. Preconditions (authority, approvals, credentials, maintenance gates) are checked before mutation.
4. Output is returned with status, evidence, and required next actions.
5. Unmet dependencies are written to human-input/backlog surfaces.

## 3) Backend flow (stage-by-stage)
1. Intake normalization and intent classification.
2. Policy and risk gating (including approval-required checks).
3. Tool/function execution against this feature's mapped API surface.
4. Persistence to canonical stores (json/jsonl/markdown/log/audit surfaces as applicable).
5. Post-run verification and optional gatekeeper capture.

## 4) Frontend flow (stage-by-stage)
1. User prompt enters CLI/VS Code/Copilot interface.
2. In-progress state presents objective and blocker status.
3. Completion state includes changed artifacts and validation summary.
4. Failure state includes deterministic recovery path.
5. Escalation state routes unresolved requirements to Human_Input/backlog.

## 5) Function and tool surface
- `api_build_semantic_memory`
- `api_query_memory`
- `api_deep_query_memory`
- `api_get_memory_status`
- `api_find_matching_workflow`

## 6) Configuration and preconditions
- Default model/tool routing follows omni-router and model governance when no explicit model is provided.
- Runtime mutation requires approval when external write, remote push, or credential mutation is involved.
- Missing prerequisites must fail closed with explicit blocker output.

## 7) Data model, storage, and sorting
- Inputs are normalized into structured payloads where possible.
- Outputs are written to stable storage and governance surfaces according to risk class.
- Sensitive fields are redacted from publish-facing artifacts.

## 8) Governance, risks, and controls
- Authority and maintenance-mode controls are mandatory.
- High-risk actions require explicit human approval.
- Policy-impacting changes require Gatekeeper review evidence.

## 9) Testing and verification
- Use deterministic tests for behavior contracts and safety constraints.
- Prefer dry-run pathways before irreversible actions.
- For front-facing outputs, run quality gates and post-publish visual QA.

## 10) Dependencies and integrations
- `Toolkit/vault_memory.py`
- `Toolkit/memory_source_registry.py`
- `Toolkit/workflow_memory.py`
- `vault_brain.py`

## 11) Change log and manual maintenance
- Last reviewed: 2026-05-13
- Update triggers: function signature changes, routing changes, policy changes, storage contract changes.
- If this feature changes, queue a manual update entry in `docs/manual/manual_change_log.jsonl`.
