# Feature: Image Creation

## 1) Purpose and outcomes

The Image Creation module provides a local pipeline for AI image generation using HuggingFace models, A/B testing of prompts, AI-judged quality comparison, and refinement workflows. It also supports local model execution when an internet connection is unavailable.

---

## 2) Generate images: `Image_Creation/huggingface_tool.py`

The primary image generation interface. Calls HuggingFace Inference API with structured prompts.

```python
from Image_Creation.huggingface_tool import api_generate_image

result = api_generate_image(
    prompt="A sleek black ferret wearing tiny sunglasses, digital art, dark cinematic lighting, highly detailed",
    negative_prompt="blurry, low quality, watermark, text",
    model="stabilityai/stable-diffusion-xl-base-1.0",
    width=1024,
    height=1024,
    num_inference_steps=30,
    guidance_scale=7.5,
    output_filename="ferret_sunglasses.png",
    approved=True,
)
# {"status": "success", "output_path": "Images/output/ferret_sunglasses.png"}
```

Requires `HUGGINGFACE_API_KEY` in `.env`.

---

## 3) A/B prompt testing: `Image_Creation/hf_ab_testing.py`

Generate two versions of an image from different prompts, then compare results.

```python
from Image_Creation.hf_ab_testing import api_run_ab_test

result = api_run_ab_test(
    prompt_a="Ferret in a gothic library, oil painting style, dark tones",
    prompt_b="Ferret in a gothic library, digital art, neon accents, high contrast",
    model="stabilityai/stable-diffusion-xl-base-1.0",
    test_name="gothic_ferret_style_comparison",
    approved=True,
)
# {
#   "status": "success",
#   "test_id": "ab_2026-05-14_gothic_ferret",
#   "image_a_path": "Images/ab_tests/..._a.png",
#   "image_b_path": "Images/ab_tests/..._b.png"
# }
```

---

## 4) AI judge: `Image_Creation/hf_judge.py`

Uses a vision model to evaluate two images and select the better one based on specified criteria.

```python
from Image_Creation.hf_judge import api_judge_images

result = api_judge_images(
    image_a_path="Images/ab_tests/gothic_ferret_a.png",
    image_b_path="Images/ab_tests/gothic_ferret_b.png",
    criteria="visual quality, adherence to prompt, artistic appeal, composition",
    test_id="ab_2026-05-14_gothic_ferret",
)
# {
#   "status": "success",
#   "winner": "image_b",
#   "reasoning": "Image B has stronger contrast and better compositional balance...",
#   "scores": {"image_a": 7.2, "image_b": 8.5}
# }
```

---

## 5) Image refinement: `Image_Creation/hf_refiner.py`

Takes a generated image and applies iterative refinement — improving details, adjusting style, or upscaling:

```python
from Image_Creation.hf_refiner import api_refine_image

result = api_refine_image(
    source_image_path="Images/output/ferret_sunglasses.png",
    refinement_prompt="Add more detail to the ferret's fur, enhance the sunglasses reflection",
    strength=0.4,   # 0.0–1.0 (lower = more conservative change)
    approved=True,
)
```

---

## 6) Local model: `Image_Creation/local_model.py`

Runs image generation locally without API calls. Requires a locally installed diffusion model:

```python
from Image_Creation.local_model import api_generate_local

result = api_generate_local(
    prompt="...",
    model_path="D:/Models/stable-diffusion-xl",
    approved=True,
)
```

---

## 7) Image inbox processing: `Image_Creation/process_image_inbox.py`

Processes images from the inbox folder — applies automated sorting, tagging, and routing to the appropriate output directories:

```python
from Image_Creation.process_image_inbox import api_process_inbox

result = api_process_inbox(approved=True)
```

Drop images into `Images/inbox/` to process them through the pipeline.

---

## 8) Cost tracking: `Image_Creation/cost_tracker.py`

Tracks API usage and generation costs across HuggingFace calls:

```python
from Image_Creation.cost_tracker import api_get_cost_summary

result = api_get_cost_summary(period="monthly")
# {"status": "success", "data": {"api_calls": 142, "estimated_cost_usd": 2.84, ...}}
```

---

## 9) Storage

| Location | Contents |
|----------|----------|
| `Images/output/` | Primary generated images |
| `Images/inbox/` | Images pending processing |
| `Images/wardrobe/` | Wardrobe photo inventory |
| `Images/ab_tests/` | A/B test image pairs |
| `Image_Creation/cost_log.json` | API usage and cost tracking |

---

## 10) Configuration

```
HUGGINGFACE_API_KEY=your_token_here
```

Set in `.env` — never commit to git. All generation functions fail safely if the key is absent, returning `{"status": "error", "message": "HUGGINGFACE_API_KEY not set"}` rather than raising.

---

## 11) Typical workflow

1. Draft a prompt and negative prompt.
2. Run an A/B test with two prompt variations.
3. Use the AI judge to pick the winner.
4. Apply refinement passes to the winning image.
5. Route final images to the appropriate output directory.
6. Register finished assets in the [Canva/Creative registry](feature-viewer.html?p=design_and_creative) if they'll be used in branded content.
