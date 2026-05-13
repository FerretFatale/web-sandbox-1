# Feature: Business Portal

## 1) Purpose and outcomes
- This page documents production behavior for the Business Portal surface in The_Vault, including how the feature is invoked, routed, governed, and validated.
- Success means requests are converted into deterministic actions with traceable outputs, explicit blockers, and no unsafe side effects.
- Primary users are operator lanes in VS Code/Copilot and CLI-driven maintenance lanes.

## 2) User-facing workflow
1. Operator submits request in natural language or explicit command form.
2. Vault-level routing classifies intent and chooses the correct feature lane.
3. If approvals or credentials are required, the lane is deferred with explicit `Human_Input.txt` actions.
4. If internal execution is safe, the lane proceeds with bounded scope and evidence capture.
5. Results are returned with status, evidence, and next-step instructions.

## 3) Backend flow (stage-by-stage)
1. Intake and intent normalization at brain/router entry.
2. Preconditions and gate checks (approval, authority, maintenance-mode scope, policy constraints).
3. Execution against the tool/function layer mapped for this feature.
4. Persistence and governance capture (logs, backlog updates, review artifacts).
5. Post-run validation and blocker surfacing.

## 4) Frontend flow (stage-by-stage)
1. UI or chat surface receives operator instruction.
2. In-progress execution state shows lane progression and blockers.
3. Success state shows changed files, tests, and governance impacts.
4. Error state shows deterministic recovery actions rather than silent failure.
5. Recovery path routes unresolved dependencies to human-input or backlog surfaces.

## 5) Function and tool surface
- Key callable functions for this feature:
- `api_list_brands`
- `api_get_brand_profile`
- `api_get_social_calendar`
- Supporting architecture surfaces include Vault_Brain orchestration, TaskMaster planning, and gated tool invocation patterns.
- Human-approval gates remain mandatory for external write, remote push, or production credential mutation actions.

## 6) Configuration and preconditions
- Required environment and path assumptions are validated before execution.
- Default model/tool routing follows omni-router and model governance when no explicit model is set.
- If preconditions fail, the lane must surface a blocker and avoid speculative behavior.

## 7) Data model, storage, and sorting
- Inputs are structured into deterministic payloads where possible.
- Outputs are persisted to project-standard stores (json/jsonl/markdown/backlog surfaces) based on lane type.
- Sorting, indexing, and retention are governed by repository policies and maintenance cadence.
- Sensitive fields must be redacted from publish-bound artifacts.

## 8) Governance, risks, and controls
- Risk controls include maintenance-mode gates, authority-map checks, and human-approval barriers.
- Gatekeeper artifacts are required for policy-impacting or architecture-impacting changes.
- Any unresolved dependency is recorded explicitly in human-input/backlog systems.

## 9) Testing and verification
- Deterministic tests for feature behavior and contract shape are required before closeout.
- Dry-run paths are preferred before live mutations.
- Publish-readiness must pass manual quality gates and safety gates.

## 10) Dependencies and integrations
- Primary evidence-backed source files for this feature:
- `Business/brand_registry.py`
- `Business/social_media_manager.py`
- `Business/website_workflow.py`
- External integrations are optional and gated; internal replication should be prioritized when sustainable.

## 11) Change log and manual maintenance
- Last reviewed: 2026-05-13
- Source-of-truth files:
- `Business/brand_registry.py`
- `Business/social_media_manager.py`
- `Business/website_workflow.py`
- Update triggers: routing changes, approval-gate changes, function signature changes, model-governance changes, persistence contract changes.
