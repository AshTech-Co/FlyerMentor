# FlyerMentor — Build Prompt

## Project summary

Build a web application called FlyerMentor that analyzes uploaded flyers, posters, or social graphics and gives the creator a structured critique based on core graphic design principles, then generates concrete, actionable fixes for the weakest areas. The product should feel like a design mentor reviewing work, not an automated grading system, so explanations matter as much as scores.

Theme alignment: this is a personalized creative assistant that helps creators improve and finish work faster, fitting the "Reimagine Creative Industries with AI" hackathon brief.

## Core user flow

1. User uploads an image of a flyer or design (PNG/JPG/PDF page).
2. App sends the image to an AI vision model for analysis.
3. App displays an overall score, a six-category breakdown, and a panel of mentor fixes for the weakest categories.
4. User can toggle an annotated overlay on the original image showing where issues were detected (arrows, highlighted regions, grid lines).
5. User can re-upload a revised version and see the score change, demonstrating the "before and after" loop.

## Scoring rubric (six categories)

1. **Visual hierarchy** — does the eye move through the design in the intended order; is the most important content (headline, CTA) clearly dominant
2. **Alignment and grid** — are elements aligned to a consistent grid or axis, or do they feel scattered
3. **Contrast** — sufficient contrast between text and background, and between elements of different importance
4. **Whitespace** — enough breathing room, intentional grouping via spacing, not cramped
5. **Typography** — appropriate font pairing (not too many families/weights), legibility
6. **Color harmony** — palette coherence and appropriateness for the design's tone

Each category gets a 1–10 score plus a one-line observation tied to a named principle. The three lowest-scoring categories also get a concrete, actionable fix (not generic advice).

## Technical architecture

### Frontend
- React (Vite) single-page app
- Screens: upload screen, loading/analyzing state, results dashboard
- Results dashboard shows: image thumbnail, overall score, six-category bar breakdown (color-coded: green ≥7, amber 4–6, red <4), mentor fix cards for the three weakest categories
- Optional: annotated overlay toggle using an SVG layer positioned over the uploaded image
- Optional: re-upload flow to compare before/after scores side by side

### Backend
- Lightweight API (FastAPI or Express) that:
  - Accepts image upload
  - Encodes image as base64
  - Sends image + rubric prompt to the AI vision model
  - Validates and parses the JSON response
  - Returns structured data to frontend
- Keep this thin. Most of the "intelligence" lives in the prompt, not custom backend logic.

### AI integration
- Use a vision-capable LLM (e.g. Claude with vision) for both scoring and fix generation in a single call to minimize latency and API calls
- Use a low temperature (0.2–0.3) for consistent, repeatable scoring
- Force structured JSON output, no markdown fences, no preamble, so the frontend can render directly without fragile text parsing
- Optional enhancement: run a lightweight OpenCV pass to extract objective metrics (contrast ratio, whitespace percentage, color count, symmetry/balance via center-of-mass) and inject those numbers into the prompt as supporting evidence. This makes scores feel more objective and gives you a strong demo line ("measured contrast ratio: 2.1:1, WCAG AA requires 4.5:1").

### System prompt for the AI model

```
You are a senior graphic design critic with expertise in visual hierarchy,
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
}
```

## UI / design direction

- Clean, flat, minimal interface, no gradients or heavy shadows
- Score bars color-coded by band: green (≥7), amber (4–6), red (<4)
- Mentor fix cards limited to the three weakest categories, to keep focus and avoid overwhelming the user
- Use a neutral, modern sans-serif typeface; avoid decorative fonts that compete with the uploaded design content
- Optional brand direction: pick one accent color for scores/CTAs, keep everything else neutral gray/white so uploaded flyers remain the visual focal point

## Build priority order (for limited hackathon time)

**Must have:**
1. Image upload
2. AI scoring call with structured JSON output
3. Results dashboard with six-category breakdown and overall score
4. At least 2–3 mentor fix explanations rendered clearly

**Nice to have (cut first if short on time):**
5. OpenCV objective metrics layer
6. Annotated SVG overlay on the image
7. Before/after comparison flow for re-uploaded revisions
8. Export results as a shareable PDF report

**Cut entirely if needed:**
- Full AI image regeneration of a "fixed" flyer (unpredictable output, high risk for live demo)
- Multi-language support
- User accounts / saved history

## Demo script

1. Open with the problem: small businesses and creators rely on templates or freelancers with no way to validate design quality before publishing.
2. Upload a real (or deliberately flawed) flyer live.
3. Walk through the score breakdown as it populates.
4. Highlight the annotated overlay (if built) as the visual "wow" moment.
5. Read out one mentor fix explanation to show it teaches, not just grades.
6. Close by reinforcing the differentiator: AI as a design mentor, not just a judge, built using IBM Bob.

## Tech stack summary

- Frontend: React + Vite
- Backend: FastAPI or Express (team's choice)
- AI model: Claude with vision (single call for scoring + fixes)
- Optional CV layer: Python + OpenCV
- Optional overlay: SVG rendered on top of uploaded image
- Deployment: any standard static host + serverless function, keep infra minimal for hackathon time constraints
