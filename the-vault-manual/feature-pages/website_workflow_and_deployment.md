# Feature: Website Workflow and Deployment

## 1) Purpose and outcomes

The website workflow manages structured intake of website requests, platform evaluation,
AI-generated build plans, and deployment scaffolding. It operates in three stages: Stage A (local
intake and planning), Stage B (GitHub Pages scaffold generation), Stage C (live deployment via
Vercel/Netlify — approval-gated). KAOS (FerretFatale/KAOS) is explicitly blocked as a deployment
target.

## 2) Core API: `Business/website_workflow.py`

### `api_check_deployment_target_safety(repo_name: str) -> dict`

Verifies that a repository is a valid public deployment target.

```python
from Business.website_workflow import api_check_deployment_target_safety

result = api_check_deployment_target_safety("FerretFatale/KAOS")
# {"ok": False, "reason": "'FerretFatale/KAOS' is a forbidden deployment target..."}

result = api_check_deployment_target_safety("FerretFatale/ferretfatale-site")
# {"ok": True}
```

Forbidden repos constant: `_FORBIDDEN_DEPLOYMENT_REPOS = {"kaos", "ferretfatale/kaos"}`.
Guardrail rule: `_DEPLOYMENT_GUARDRAIL_RULE = "KAOS (FerretFatale/KAOS) is NOT a public
website or Pages deployment target."`

### `api_intake_website_request(site_name, brand_id, site_type, description, ...) -> dict`

**Stage A.** Intakes a new website request. Stores to `Business/website_requests.json`.

```python
from Business.website_workflow import api_intake_website_request

result = api_intake_website_request(
    site_name="Ferret Fatale Portfolio",
    brand_id="ferret_fatale",
    site_type="portfolio",
    description="Static portfolio site for ferret content and art.",
)
# {"status": "success", "request_id": "REQ_abc123", "request": {...}}
```

### `api_evaluate_website_strategy(request_id: str) -> dict`

**Stage A.** Scores applicable platforms against the site type and returns ranked recommendations.

```python
result = api_evaluate_website_strategy("REQ_abc123")
# {
#   "status": "success",
#   "recommendations": [
#     {"platform": "github_pages", "score": 0.92, "cost": "free", "notes": str},
#     {"platform": "netlify",      "score": 0.78, "cost": "free_tier", "notes": str},
#     ...
#   ]
# }
```

### `api_generate_website_build_plan(request_id: str, model: str | None = None) -> dict`

**Stage A.** Generates an AI-assisted build plan for the approved request. Stores to
`Business/website_build_plans.json`.

```python
result = api_generate_website_build_plan("REQ_abc123")
# {
#   "status": "success",
#   "plan_id": "PLAN_xyz789",
#   "plan": {
#     "sections": [{"name": str, "content_brief": str}, ...],
#     "tech_stack": str,
#     "estimated_pages": 4,
#     "deploy_platform": "github_pages"
#   }
# }
```

### `api_generate_github_pages_scaffold(plan_id: str, target_repo: str | None = None) -> dict`

**Stage B.** Generates a local GitHub Pages scaffold (HTML, CSS, navigation) from the build plan.
Does NOT push to GitHub. Human reviews the output before any deploy action.

```python
result = api_generate_github_pages_scaffold(
    plan_id="PLAN_xyz789",
    target_repo="FerretFatale/ferretfatale-site",
)
# {"status": "success", "scaffold_path": "Business/scaffolds/ferretfatale-site/", ...}
```

### `api_deploy_to_vercel(plan_id: str, api_key: str | None = None, approved: bool = False) -> dict`

**Stage C.** Deploys the approved build plan to Vercel. Requires `VERCEL_API_KEY` in `.env` and
`approved=True`.

```python
result = api_deploy_to_vercel(plan_id="PLAN_xyz789", approved=True)
# {"status": "success", "deployment_url": "https://...", "deploy_id": str}
# or {"status": "blocked", "reason": "approved=False — human approval required"}
```

### `api_deploy_to_netlify(plan_id: str, api_key: str | None = None, approved: bool = False) -> dict`

**Stage C.** Deploys the approved build plan to Netlify. Requires `NETLIFY_API_KEY` in `.env` and
`approved=True`.

## 3) Platform registry

| Platform        | Cost          | Best for                        | Notes                                  |
|-----------------|---------------|---------------------------------|----------------------------------------|
| `github_pages`  | Free          | Portfolio, docs, static, blog   | Dedicated PUBLIC repo only, NOT KAOS   |
| `netlify`       | Free tier     | Landing, forms, JAMstack        | Requires `NETLIFY_API_KEY` in `.env`   |
| `vercel`        | Free tier     | Next.js, React, JAMstack        | Requires `VERCEL_API_KEY` in `.env`    |
| `carrd`         | Paid (domain) | One-page, landing               | Manual account — no automation yet     |
| `maton`         | Account req.  | No-code, visual                 | `MATON_API_KEY` + `MATON_GATEWAY_URL`  |
| `ventraip`      | Paid hosting  | PHP, WordPress, custom domain   | Stage C — SFTP credentials in `.env`   |

## 4) Configuration

| Variable              | Purpose                                |
|-----------------------|----------------------------------------|
| `VERCEL_API_KEY`      | Vercel deployment API key              |
| `NETLIFY_API_KEY`     | Netlify deployment API key             |
| `MATON_API_KEY`       | Maton no-code platform key             |
| `MATON_GATEWAY_URL`   | Maton gateway URL                      |
| `MATON_CTRL_URL`      | Maton controller URL                   |
| `VENTRAIP_SFTP_HOST`  | VentraIP SFTP host (Stage C, pending)  |
| `VENTRAIP_SFTP_USER`  | VentraIP SFTP user                     |
| `VENTRAIP_SFTP_PASS`  | VentraIP SFTP password                 |

## 5) Storage layout

```
Business/
  website_workflow.py       <- core website workflow API
  website_requests.json     <- all intake requests
  website_build_plans.json  <- generated build plans
  scaffolds/                <- generated local scaffolds (not committed)
```

## 6) Deployment guardrails summary

- `api_check_deployment_target_safety()` is called before every Stage B/C operation
- All Stage C operations default to `approved=False` — blocked until human approval
- VentraIP deployment is Stage C and pending full credential setup (see `Human_Input.txt`)
- GitHub Pages deploys use a dedicated PUBLIC repository, never KAOS or The_Vault

## 7) Testing

```bash
python -m pytest Copilot_Tests/test_website_workflow.py -v
```

Test cases cover: deployment guardrail blocks KAOS repo, intake validation, platform evaluation
scoring, Stage C `approved=False` rejection, scaffold generation does not deploy.

## 8) Dependencies and integrations

- `Business/website_workflow.py` — core API
- `Business/brand_registry.py` — brand validation for intake requests
- `Toolkit/omni_router.py` — AI-generated build plans
- `Human_Input.txt` — VentraIP credentials and approval blockers
- `VERCEL_API_KEY`, `NETLIFY_API_KEY` — `.env` only, never committed

## 9) Change log and manual maintenance

- Last reviewed: 2026-05-14
- Source of truth: `Business/website_workflow.py`
- Update triggers: new platform added, guardrail repos updated, Stage C automated, deploy API changed.
