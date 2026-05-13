# Feature: Coding and Model Routing

## 1) Purpose and outcomes

`Toolkit/omni_router.py` is the universal AI inference router for The Vault. It translates every model call to the correct provider (Google, OpenAI, Anthropic, DeepSeek, OpenRouter, HuggingFace, local), applies PII redaction, and implements cost-optimizing free-first cascade logic.

- No file in The Vault hardcodes a model name or API key in application code. All AI calls go through `api_route_request` or `api_cascade_query`.
- `Master_Coder` persona owns software engineering tasks and requires a Security review (SR-001) before submitting code changes.
- Breaking this rule accumulates silent per-token costs and bypasses the governance tier system.

## 2) Core routing: `api_route_request`

```python
from Toolkit.omni_router import api_route_request

result = api_route_request(
    bot_id="KAOS_THINKER",         # key from Use_Profiles.json
    prompt="Explain the mission state machine.",
    system_prompt="You are a precise technical writer.",  # optional
    temperature=0.2,               # default: 0.2
    response_mime_type=None,       # set "application/json" for structured JSON output
)
# Returns: {"status": "success"|"error", "response": "..."}  or  {"status": "error", "message": "..."}
```

**Provider detection order:**
1. Look up `bot_id` in `Use_Profiles.json` → read `Provider` field
2. If not found, apply heuristic fallbacks:

| `bot_id` pattern | Resolved provider |
|---|---|
| contains `gpt` or `o1` | `OPENAI` |
| contains `claude` | `ANTHROPIC` |
| contains `gemini` + (flash/nano/lite) + `GOOGLE_API_PAID_KEY` set | `GOOGLE_PAID` |
| contains `gemini` (pro/full) | `GOOGLE` |
| contains `maton` | `MATON` (always errors — not an LLM provider) |
| contains `deepseek` + `DEEPSEEK_API_KEY` set | `DEEPSEEK` |
| anything else | `OPENROUTER` |

## 3) Cascade queries: `api_cascade_query`

For cost-optimized inference, use `api_cascade_query` with a pre-defined cascade list. It tries each model in order and returns the first successful non-empty response.

```python
from Toolkit.omni_router import api_cascade_query, THINKER_CASCADE

result = api_cascade_query(
    cascade=THINKER_CASCADE,
    prompt="Analyze this plan for risks.",
    task_category="task_planning",   # enables scoring, scout injection, premium selection
    temperature=0.1,
)
# Returns: {"status": "success", "response": "..."}
```

**`THINKER_CASCADE` — current model order:**

```python
THINKER_CASCADE = [
    ("hf", "meta-llama/Llama-3.3-70B-Instruct"),   # HF — requires HF_TOKEN in .env
    "nvidia/nemotron-3-super-120b-a12b:free",
    "nousresearch/hermes-3-llama-3.1-405b:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "deepseek/deepseek-r1:free",
    "deepseek/deepseek-chat-v3-0324:free",
    "qwen/qwen3-30b-a3b:free",
    "microsoft/phi-4-reasoning-plus:free",
    "google/gemma-3-27b-it:free",
    "nvidia/nemotron-nano-12b-2-vl:free",
    "google/gemma-3-12b-it:free",
    "meta-llama/llama-3.2-3b-instruct:free",
    "google/gemini-2.5-flash",   # paid — only reached when all free models exhausted
    "google/gemini-2.5-pro",     # paid — high-complexity fallback
]
```

**Warning:** Never add OpenAI or Anthropic model IDs to `THINKER_CASCADE` or `CODER_CASCADE`. Both providers are fully wired but must only be called via explicit `bot_id` profiles. Adding them to cascades bypasses cheap-first ordering and accumulates silent per-token costs.

## 4) Cascade intelligence phases

When `task_category` is non-empty, three enrichment phases run before the cascade executes:

| Phase | What it does |
|---|---|
| **Phase 2 (Score sort)** | Re-orders cascade within cost tiers by `Category_Scores[task_category]` descending. Models with fewer than 3 total uses keep their original position (treated as neutral score 50). |
| **Phase 3 (Scout inject)** | Injects talent-scout-discovered OpenRouter models not already in the cascade, placed immediately before the paid tail. At most `_SCOUT_INJECTION_CAP` models injected per call. |
| **Phase 4 (Premium select)** | If any model has `Category_Scores[task_category] >= premium_threshold` AND `Total_Uses >= _PREMIUM_MIN_USES`, elevates it to position 0. Best proven model always goes first. |

All three phases are skipped when `task_category=""` (safe for anonymous callers, no profile writes).

## 5) Provider adapters and API keys

| Provider | Route function | Required `.env` key |
|---|---|---|
| Google (pro models) | `_route_google` | `API_KEY` |
| Google (flash/cheap) | `_route_google` | `GOOGLE_API_PAID_KEY` |
| OpenAI | `_route_openai` | `OPENAI_API_KEY` |
| Anthropic | `_route_anthropic` | `ANTHROPIC_API_KEY` |
| DeepSeek | `_route_deepseek` | `DEEPSEEK_API_KEY` |
| OpenRouter | `_route_openrouter` | `OPENROUTER_API_KEY` |
| HuggingFace Inference | `api_query_huggingface` | `HF_TOKEN` |
| Local (Ollama/LM Studio) | `_call_local_model` | server running at localhost |
| Maton | `_route_maton` | — (always returns error) |

**Maton is not an LLM provider.** Routing LLM prompts to it always returns an error with instructions to use `Toolkit/maton_client.py` for app-integration calls (GitHub, Gmail, Drive, etc.).

## 6) Private info filter

All prompts pass through `Toolkit/private_info_filter.py` before dispatch:

- Replaces personal names from `PRIVATE_INFO_BLOCKLIST_NAMES` (defined in `vault_config.py`) with anonymized tokens
- Restores originals in the response before returning to caller
- Enabled/disabled by `PRIVATE_INFO_FILTER_ENABLED` in `vault_config.py`
- Audit log appended to `.kaos_filter_audit.jsonl`

This ensures PII is never sent to external AI providers.

## 7) OpenRouter model name formatting

OpenRouter requires `"provider/model"` format. `_route_openrouter` applies automatic prefixes for bare model names:

| Pattern | Formatted as |
|---|---|
| `deepseek-*` | `deepseek/model-name` |
| `qwen-*` | `qwen/model-name` |
| `llama-*` | `meta-llama/model-name` |
| Already has `/` | Passed through unchanged |
| Unknown bare name | Passed through as-is (OpenRouter supports aliases) |

For production reliability, always use full `"provider/model"` slugs in `Use_Profiles.json`.

## 8) Master_Coder workflow and the Security gate

Master_Coder (15 tools) owns all software engineering work. Required pattern for any code change:

1. Master_Coder drafts the change
2. Security persona reviews for OWASP Top 10 and SR-001 compliance
3. Only after Security clearance may Master_Coder submit

Correct model-call pattern:

```python
# ✅ Correct — routes through omni_router, respects cost tiers
from Toolkit.omni_router import api_cascade_query, THINKER_CASCADE
result = api_cascade_query(THINKER_CASCADE, prompt, task_category="code_review")

# ❌ Wrong — hardcoded model name, bypasses routing and tier governance
from google import genai
client.models.generate_content(model="gemini-2.5-pro", contents=prompt)
```

## 9) Testing

```bash
python -m pytest Copilot_Tests/test_omni_router_dispatch.py -v
python -m pytest Copilot_Tests/test_omni_router_cascade.py -v
python -m pytest Copilot_Tests/test_omni_router_json_mode.py -v
python -m pytest Copilot_Tests/test_omni_router_phase5.py -v
python -m pytest Copilot_Tests/test_omni_router_score_sort.py -v
```

`test_omni_router_dispatch.py` covers all 10 dispatch branches, profiler-driven provider detection, heuristic fallbacks (gpt/claude/gemini/maton/deepseek/unknown), private filter invocation, mime_type forwarding, and exception handling — all headless with mocked adapters.

## 10) Dependencies and integrations

- `Toolkit/omni_router.py` — primary source
- `Use_Profiles.json` / `Contextual_Thinking/bot_profiler.py` — provider lookup and scoring
- `Toolkit/private_info_filter.py` — PII redaction before dispatch
- `Toolkit/huggingface_tool.py` — HF Inference API adapter
- `Toolkit/local_model.py` — Ollama/LM Studio adapter
- `Toolkit/maton_client.py` — Maton app integrations (NOT for LLM calls)
- `vault_config.py` — `PRIVATE_INFO_FILTER_ENABLED`, `PRIVATE_INFO_BLOCKLIST_NAMES`
- `.env` — all API keys (`API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `DEEPSEEK_API_KEY`, `OPENROUTER_API_KEY`, `HF_TOKEN`, `GOOGLE_API_PAID_KEY`)

## 11) Change log and manual maintenance

- Last reviewed: 2026-05-14
- Source of truth: `Toolkit/omni_router.py`
- Update triggers: new provider adapter added, cascade order changed, private filter rules changed, new scoring phase added, OpenRouter prefix heuristics changed, premium selection thresholds changed.
