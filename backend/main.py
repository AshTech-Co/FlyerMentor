import os
import base64
import json
import re
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ibm_watsonx_ai import APIClient, Credentials
from ibm_watsonx_ai.foundation_models import ModelInference
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="FlyerMentor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

IBM_WATSONX_API_KEY = os.getenv("IBM_WATSONX_API_KEY")
IBM_WATSONX_PROJECT_ID = os.getenv("IBM_WATSONX_PROJECT_ID")
IBM_WATSONX_URL = os.getenv("IBM_WATSONX_URL", "https://us-south.ml.cloud.ibm.com")

# Vision-capable model available on IBM watsonx.ai
VISION_MODEL = "meta-llama/llama-3-2-11b-vision-instruct"

SYSTEM_PROMPT = """You are a senior graphic design critic with expertise in visual hierarchy,
typography, color theory, and composition. You evaluate flyers and designs
against established design principles, the way a design school professor
would grade a portfolio piece: specific, constructive, and tied to named
principles rather than vague taste.

You will be shown an image of a flyer or design. Evaluate it across these
six categories. For each category, give a score from 1-10 and a single
specific observation tied to a named design principle (not generic praise
or criticism).

Categories:
1. visual_hierarchy - Does the eye move through the design in an intended
   order? Is the most important info (headline, CTA) clearly dominant?
2. alignment_and_grid - Are elements aligned to a consistent grid or axis?
   Is there evidence of intentional structure vs. scattered placement?
3. contrast - Is there sufficient contrast (color, size, weight) between
   foreground text and background, and between elements of different
   importance?
4. whitespace - Is there enough breathing room around elements, or does
   the design feel cramped? Is whitespace used intentionally to group
   related items?
5. typography - Are font choices appropriate and well-paired (not too
   many families/weights)? Is text legible at expected viewing distance?
6. color_harmony - Do the colors work together (complementary, analogous,
   or intentional clash)? Is the palette appropriate for the design's tone?

For the THREE lowest-scoring categories, also provide a "fix" field: one
concrete, actionable change the designer could make (not "improve contrast"
but "darken the body text from light gray to near-black, or add a 70%
opacity dark overlay behind the text block").

Respond ONLY with valid JSON in this exact structure, no markdown fences,
no preamble:

{
  "overall_score": <1-10 average>,
  "scores": {
    "visual_hierarchy": {"score": <1-10>, "observation": "<string>"},
    "alignment_and_grid": {"score": <1-10>, "observation": "<string>"},
    "contrast": {"score": <1-10>, "observation": "<string>"},
    "whitespace": {"score": <1-10>, "observation": "<string>"},
    "typography": {"score": <1-10>, "observation": "<string>"},
    "color_harmony": {"score": <1-10>, "observation": "<string>"}
  },
  "fixes": [
    {"category": "<category_key>", "fix": "<string>"},
    {"category": "<category_key>", "fix": "<string>"},
    {"category": "<category_key>", "fix": "<string>"}
  ]
}"""

USER_PROMPT = "Analyze this flyer and provide your critique as JSON."


def get_media_type(filename: str) -> str:
    ext = filename.lower().split(".")[-1]
    mapping = {
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "png": "image/png",
        "gif": "image/gif",
        "webp": "image/webp",
    }
    return mapping.get(ext, "image/jpeg")


def get_watsonx_client() -> ModelInference:
    if not IBM_WATSONX_API_KEY:
        raise HTTPException(status_code=500, detail="IBM_WATSONX_API_KEY is not configured")
    if not IBM_WATSONX_PROJECT_ID:
        raise HTTPException(status_code=500, detail="IBM_WATSONX_PROJECT_ID is not configured")

    credentials = Credentials(
        url=IBM_WATSONX_URL,
        api_key=IBM_WATSONX_API_KEY,
    )
    return ModelInference(
        model_id=VISION_MODEL,
        credentials=credentials,
        project_id=IBM_WATSONX_PROJECT_ID,
        params={
            "temperature": 0.2,
            "max_new_tokens": 1024,
        },
    )


@app.post("/analyze")
async def analyze_flyer(file: UploadFile = File(...)):
    allowed = {"image/jpeg", "image/png", "image/gif", "image/webp"}
    content_type = file.content_type or get_media_type(file.filename or "image.jpg")
    if content_type not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {content_type}. Use PNG, JPG, GIF, or WebP.",
        )

    image_data = await file.read()
    if len(image_data) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum 20 MB.")

    media_type = get_media_type(file.filename or "image.jpg")
    b64 = base64.standard_b64encode(image_data).decode("utf-8")
    data_uri = f"data:{media_type};base64,{b64}"

    model = get_watsonx_client()

    # Build chat messages with vision content
    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT,
        },
        {
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {"url": data_uri},
                },
                {
                    "type": "text",
                    "text": USER_PROMPT,
                },
            ],
        },
    ]

    try:
        response = model.chat(messages=messages)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"IBM watsonx AI error: {str(e)}")

    # Extract text from response
    raw = response["choices"][0]["message"]["content"].strip()

    # Strip any accidental markdown fences
    raw = re.sub(r"^```[a-z]*\n?", "", raw)
    raw = re.sub(r"\n?```$", "", raw)

    # Extract JSON object if surrounded by extra text
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if match:
        raw = match.group(0)

    try:
        result = json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail="AI returned malformed JSON. Please try again.")

    return result


@app.get("/health")
def health():
    return {"status": "ok"}
