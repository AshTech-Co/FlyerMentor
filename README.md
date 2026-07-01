# FlyerMentor

AI-powered design mentor for flyers and social graphics.

---

## Problem statement

Small businesses, event organisers, and independent creators publish flyers and social graphics every day without access to professional design feedback. They rely on gut feel, copy templates blindly, or spend money on freelancers — with no way to understand *why* a design works or doesn't before it goes live. The result is low-quality visual content that undersells their events, products, and brands.

There is no accessible, instant tool that gives a creator the kind of structured, principled critique a trained designer would offer — tied to named design principles, scored objectively, and actionable enough to act on immediately.

---

## Solution description

FlyerMentor is an AI design mentor web app. A creator uploads a flyer or social graphic (PNG/JPG/WebP) and receives:

- An **overall design score** (1–10) with a visual ring indicator
- A **six-category breakdown** — Visual Hierarchy, Alignment & Grid, Contrast, Whitespace, Typography, and Color Harmony — each scored and colour-coded (green ≥ 7, amber 4–6, red < 4)
- **Mentor fix cards** for the three weakest categories: one concrete, actionable change per category (e.g. *"Add a 70% opacity dark overlay behind the text block to bring contrast ratio above WCAG AA 4.5:1"*)

The experience is designed to feel like a design school professor reviewing your work — specific, constructive, tied to named principles — not an automated grading machine.

---

## AI approach and architecture

```
User uploads image
       │
       ▼
FastAPI backend (Python)
  • Validates file type & size
  • Encodes image as base64 data URI
  • Builds a structured chat prompt (system + user + image)
       │
       ▼
IBM watsonx.ai
  Model: meta-llama/llama-3-2-11b-vision-instruct
  Temperature: 0.2  (consistent, repeatable scoring)
  Single API call → scoring + fix generation
       │
       ▼
Structured JSON response
  { overall_score, scores{…×6}, fixes[…×3] }
       │
       ▼
React frontend renders
  Score ring · Category bars · Mentor fix cards
```

**Key AI design decisions:**

- **Single call** for both scoring and fix generation — minimises latency and avoids score/fix inconsistency across separate calls
- **Low temperature (0.2)** — reproducible scores; the same flyer should score similarly on repeated runs
- **Forced JSON output** with no markdown fences or preamble — the frontend renders directly from the parsed object, no fragile text parsing
- **Named-principle observations** required in the prompt — the model must cite a design principle (e.g. Gestalt proximity, WCAG contrast ratio) not just say "looks good"
- **Regex JSON extraction** as a safety net — strips any accidental surrounding text before `json.loads`

---

## Selected challenge theme

**Reimagine Creative Industries with AI**

FlyerMentor directly addresses the gap between professional design knowledge and everyday creators. It puts a senior design critic in the pocket of anyone publishing visual content — democratising access to structured creative feedback that was previously only available through expensive consultants or design school education.

---

## How IBM Bob was used

IBM Bob was used end-to-end to plan, scaffold, and build FlyerMentor during the hackathon:

1. **Architecture planning** — the build prompt (`flyermentor_build_prompt.md`) was written collaboratively with Bob to define the scoring rubric, AI prompt structure, JSON schema, tech stack, and build priority order before a single line of code was written
2. **Full-stack scaffolding** — Bob generated the complete React + Vite frontend (upload screen, loading state, results dashboard with score ring and fix cards) and the FastAPI backend in a single session
3. **AI integration** — Bob wrote the IBM watsonx.ai integration using `ibm-watsonx-ai` SDK, including the vision chat message format, credential wiring, and JSON safety parsing
4. **Iterative refinement** — the AI provider was swapped from Anthropic to IBM watsonx.ai mid-session; Bob updated every affected file (`main.py`, `requirements.txt`, `.env.example`, `README.md`) in one pass with no manual editing required
5. **Documentation** — this README was written by Bob, including the problem statement, architecture diagram, and credential setup guide

> FlyerMentor was built entirely inside Bob — from the first design decision to the final commit message.

---

## Quick start

### 1. Backend

```bash
cd backend
cp .env.example .env          # fill in IBM_WATSONX_API_KEY and IBM_WATSONX_PROJECT_ID
python -m venv .venv
.venv\Scripts\activate        # Windows  (source .venv/bin/activate on Mac/Linux)
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at **http://localhost:8000**

### 2. Frontend

```bash
cd frontend
cp .env.example .env          # VITE_API_URL=http://localhost:8000 (already set)
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

### 3. Open the app

Navigate to [http://localhost:5173](http://localhost:5173), upload a flyer PNG/JPG/WebP, and get your AI design critique.

---

## File structure

```
FlyerMentor/
├── backend/
│   ├── main.py          # FastAPI — image upload → watsonx.ai → JSON
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.jsx               # root state machine
    │   ├── UploadScreen.jsx      # drag-and-drop upload with preview
    │   ├── LoadingScreen.jsx     # analyzing state
    │   ├── ResultsDashboard.jsx  # score ring, category bars, fix cards
    │   └── index.css             # all styles
    └── vite.config.js            # dev proxy → localhost:8000
```

## Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `IBM_WATSONX_API_KEY` | `backend/.env` | IBM watsonx API key |
| `IBM_WATSONX_PROJECT_ID` | `backend/.env` | watsonx project ID |
| `IBM_WATSONX_URL` | `backend/.env` | watsonx endpoint (default: us-south) |
| `VITE_API_URL` | `frontend/.env` | Backend base URL |

## Getting IBM watsonx credentials

1. Log in to [IBM watsonx.ai](https://dataplatform.cloud.ibm.com/)
2. **API key**: IBM Cloud → Manage → Access (IAM) → API keys → Create
3. **Project ID**: Open your watsonx project → Manage tab → copy the Project ID
4. **URL**: use `https://us-south.ml.cloud.ibm.com` (or the region matching your project)
