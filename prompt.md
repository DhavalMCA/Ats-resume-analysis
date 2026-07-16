# Resume ATS Analyzer — Build Spec

Build a premium, client-side **Resume ATS Analyzer** as a single-page React app — **no backend, no server-side database**. Everything runs in the browser using the user's own LLM API key (BYOK — Bring Your Own Key).

---

## 0. First Question to Ask (Before Building)

Before writing code, ask:

> Which AI provider would you like to use?
> **a)** OpenAI
> **b)** Google Gemini (FREE tier available via Google AI Studio — uses `gemini-2.0-flash`)
>
> If you don't have a key yet:
>
> **Gemini (FREE)**
> 1. Go to https://aistudio.google.com/apikey
> 2. Sign in with any Google account
> 3. Click "Create API key" → "Create API key in new project"
> 4. Copy the key (starts with `AIza…`)
>
> **OpenAI (paid)**
> 1. Go to https://platform.openai.com/api-keys
> 2. Sign in, click "Create new secret key"
> 3. Copy the key (starts with `sk-…`)
> 4. Ensure at least $1 of credits at https://platform.openai.com/billing
>
> Reply with `a` or `b`.

Wait for the answer, then build with the chosen provider as the default in the UI's provider selector — but support **both** providers in code.

---

## 1. Core Concept

- User pastes an **OpenAI or Gemini API key** into the header (stored only in `sessionStorage` under `byok_llm_key` — never sent anywhere except the LLM API).
- User uploads a **PDF resume** (parsed locally with `pdfjs-dist` in a web worker — never uploaded to a server).
- User pastes a **job description**.
- "Run ATS analysis" makes a direct browser call to OpenAI/Gemini, returning a strict JSON-shaped analysis.
- Results shown in **two columns**: annotated PDF (left, colored severity highlights) + metrics/rewrites (right).
- Past analyses stored locally in **IndexedDB**, reloadable via a history drawer.

---

## 2. Tech Stack (Strict — No Substitutions)

- React 18 (CRA or Vite — match platform default)
- TailwindCSS
- shadcn/ui: Button, Textarea, Tooltip, Sheet (drawer), Toaster (sonner)
- `lucide-react` icons (no emoji icons)
- `pdfjs-dist` — PDF render + text extraction
- `jspdf` — Export PDF feature
- Native IndexedDB or `idb` wrapper — history
- React Context — light/dark theme
- **No backend.** No Mongo. No Express/FastAPI for app logic.

---

## 3. File Structure

```
/src/
├── App.js
├── index.css                     # Tailwind + custom keyframes (§11)
├── components/
│   ├── Analyzer.jsx               # Main orchestrator + state
│   ├── Header.jsx                 # Logo + BYOK input + provider selector + theme toggle
│   ├── PdfUploader.jsx            # Drag-drop upload w/ parsing animation
│   ├── PdfHighlightViewer.jsx     # Canvas-rendered PDF + absolute-positioned highlights
│   ├── SuggestionCard.jsx         # Before/after rewrite card, copy button, impact badge
│   ├── AtsScoreRing.jsx           # SVG circular progress chart
│   ├── ThemeProvider.jsx          # Light/dark context
│   ├── HistoryDrawer.jsx          # Slide-in sheet, past analyses from IndexedDB
│   ├── HrPerspective.jsx          # Recruiter verdict card
│   ├── AuthenticityPanel.jsx      # 8 authenticity dimensions
│   ├── FlaggedPatterns.jsx        # AI-language patterns flagged
│   ├── ExperienceRealism.jsx      # YOE vs seniority claims check
│   └── ui/                        # shadcn primitives
└── lib/
    ├── llm.js                     # Provider-agnostic LLM client (OpenAI + Gemini)
    ├── pdfUtils.js                # PDF.js text extraction + line bounding boxes
    ├── history.js                 # IndexedDB wrapper
    └── pdf.js                     # jspdf export logic
```

---

## 4. BYOK + Provider Support (Critical)

Header must contain:

- Password-masked API key input with show/hide eye toggle
- "Save key" button → writes to `sessionStorage["byok_llm_key"]`
- Provider selector (segmented control / dropdown): **OpenAI** / **Gemini**. Default = choice from §0. Persist in `sessionStorage["byok_provider"]`.
- Key auto-loads on app start.
- Inline hint under input: *"Don't have a key? Get a free Gemini key at aistudio.google.com/apikey or an OpenAI key at platform.openai.com/api-keys."*

`/src/lib/llm.js` exposes:

```js
export async function analyzeResume({ provider, apiKey, resume, jobDescription, signal })
```

Dispatches to `callOpenAI(...)` or `callGemini(...)` based on `provider`.

**OpenAI:**
- `POST https://api.openai.com/v1/chat/completions`
- Model: `gpt-4o-mini`
- `response_format: { type: "json_object" }`
- `temperature: 0.35`
- Auth: `Bearer ${apiKey}`

**Gemini:**
- `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`
- System prompt as first `contents[]` user message, or via `systemInstruction`
- `generationConfig.responseMimeType = "application/json"`
- `temperature: 0.35`
- Parse `candidates[0].content.parts[0].text` as JSON

Both must produce **identical** output JSON (§6). Surface friendly errors for invalid key (401), rate limits (429), malformed JSON.

---

## 5. PDF Upload + Local Parsing

- Drag-and-drop zone with browse fallback. PDF only, max 10MB.
- `pdfjs-dist` worker from CDN or local copy — file never uploaded.
- Per page: render to canvas **and** extract text lines with bounding boxes (x, y, width, height in canvas-pixel coords).
- Expose `resumeText` (full plain text) and `lineBoxes` per page.
- Show a "Parsed locally · never uploaded" pill once parsed.

---

## 6. Strict Output JSON Schema

LLM must return **only** valid JSON matching this shape (use in both system prompts):

```json
{
  "ats_score_before": 0,
  "ats_score_after": 0,
  "authenticity_score": 0,
  "verdict_summary": "",
  "dimension_scores": {
    "buzzword_density": 0,
    "specificity": 0,
    "seniority_realism": 0,
    "technical_depth": 0,
    "semantic_redundancy": 0,
    "style_entropy": 0,
    "verifiability": 0,
    "ats_manipulation": 0
  },
  "ai_detected_lines": [
    { "text": "", "severity": "high|medium|low",
      "pattern": "buzzword|inflated_seniority|vague_impact|redundancy|unrealistic_scope|low_specificity|uniform_rhythm|ats_stuffing" }
  ],
  "flagged_patterns": [
    { "name": "", "category": "", "severity": "high|medium|low",
      "examples": [""], "why_it_matters": "" }
  ],
  "experience_realism": {
    "stated_yoe": null,
    "implied_seniority": "junior|mid|senior|staff|principal",
    "mismatch_severity": "none|mild|moderate|severe",
    "evidence": [""]
  },
  "unverifiable_claims": [
    { "claim": "", "probing_questions": [""] }
  ],
  "ats_missing_keywords": [""],
  "suggestions": [
    { "original": "", "improved": "", "reason": "",
      "impact_points": 0, "priority": "required|optional" }
  ],
  "hr_perspective": {
    "verdict": "strong_yes|yes|maybe|no",
    "first_impression": "",
    "reasoning": "",
    "strengths": [""],
    "red_flags": [""]
  }
}
```

- `ats_score_before` / `ats_score_after`: int 0–100
- `authenticity_score`: int 0–100 (how human-authored the resume feels)
- All `dimension_scores`: int 0–100
- `impact_points`: int 1–15
- `first_impression`: max 220 chars

---

## 7. System Prompt (Use Verbatim, Both Providers)

```
You are the strictest possible resume authenticity auditor. You analyze resumes for AI-generated language, seniority inflation, semantic redundancy, low specificity, ATS manipulation, and emotional/stylistic flatness — the same patterns expert recruiters use to spot AI-written CVs.

You MUST return ONLY valid JSON matching the schema (no markdown, no commentary).

Rules:
- Compare wording sophistication AGAINST the candidate's apparent YOE. A 2-YOE engineer writing "architected enterprise ecosystems" is a HUGE red flag. Mid-range engineers describe real tooling: Retrofit, Room, Gradle, ANRs, Crashlytics, memory leaks, Jetpack Compose, deep links, etc.
- Reward implementation-level language, concrete numbers (%, ms, MAUs, $$, dataset sizes), tradeoff discussion, niche tooling, and even imperfect phrasing — these are human signals.
- Penalize generic leadership phrases, "leveraged synergistic", "spearheaded enterprise-scale", repeated abstract nouns (ecosystems / infrastructures / architectures / paradigms), keyword stuffing, uniform sentence rhythm, emotionally empty polish.
- For unverifiable_claims: only include claims with NO numbers, tools, or specifics.
- For semantic_redundancy: cluster phrases meaning the same thing in different words.
- ats_score_after MUST be between 85 and 98. Make suggestions aggressive enough to genuinely lift the resume into the 85-95 range. If weak, generate MORE suggestions (up to 12).
- Suggestions MUST cover: (a) every high-severity AI-detected line, (b) injecting top missing keywords naturally, (c) adding quantification to vague bullets, (d) tightening seniority wording to match YOE.
- DIMINISHING RETURNS GUARD: If ats_score_before >= 88, the resume is already submit-ready. In that case, return AT MOST 2 "required" suggestions, and mark every other suggestion as "priority": "optional" with reason prefixed by "Optional polish — ". Cap total suggestions at 5. If ats_score_before < 88, mark high-impact rewrites as "required" and minor stylistic tweaks as "optional".
- For each suggestion, set "impact_points" so the SUM ≈ (ats_score_after − ats_score_before). High-severity: 8-15. Low: 1-4.
- All numbers in dimension_scores MUST be integers 0-100.
```

**User message format:**

```
JOB DESCRIPTION:
"""
<jd>
"""

RESUME:
"""
<resume>
"""

Return the JSON analysis now.
```

---

## 8. Results UI — Two-Column Layout

### Left column (sticky on desktop, ~58% width)
- Renders actual PDF pages as `<img>` from canvas data URLs.
- For each `ai_detected_lines` entry, fuzzy-match against extracted `lineBoxes` (normalize text, ≥75% token overlap) and overlay an absolute-positioned `<div>`:
  - Red tint = high severity, amber = medium, yellow = low (semi-transparent, `mix-blend-multiply`).
  - Hover: tooltip with pattern name + severity + matched line text (native `title`, or shadcn Tooltip).
  - Severity legend chip row above the PDF.

### Right column (~42% width)
1. **"Good enough to submit" banner** (green) — shown only when `ats_score_before >= 88`: *"Your resume is already in submit-ready range (X/100). Below are a couple of high-impact rewrites. Everything else is optional polish — don't feel pressured to chase 100."*
2. **ATS Score card** — two `AtsScoreRing` SVGs (Before → After) + "+X pts" delta badge.
3. **HR Perspective card** — verdict pill (strong_yes/yes/maybe/no, color-coded), first impression, reasoning, strengths, red flags.
4. **Authenticity Panel** — overall score + 8 dimension bars with labels.
5. **Experience Realism** — stated YOE vs implied seniority, mismatch badge, evidence list, then unverifiable claims with collapsible probing questions.
6. **Flagged Patterns** — detected AI-language patterns; each card scrolls the PDF to its related highlight on click.
7. **Missing Keywords** — pill chips of `ats_missing_keywords`.
8. **Rewrites, split in two:**
   - **Required rewrites** — `priority === "required"`, shown prominently.
   - **Optional polish (not required)** — collapsed `<details>` accordion, closed by default, `priority === "optional"`.
   - Each `SuggestionCard`:
     - Header: `Rewrite #NN · Click to locate`, "OPTIONAL" badge if applicable, `+X pts` emerald badge, copy button.
     - Body: Before (strikethrough red) → After (amber accent), two columns.
     - Footer: "Why" reasoning.
     - Click → scrolls left PDF to matching highlight, pulses it (ring-amber animation).

---

## 9. History (IndexedDB)

- DB: `ats_history_db`, store: `analyses`, keyPath: `id`.
- Entry shape: `{ id, createdAt, fileName, fileBlob, resumeText, jobDescription, result }`.
- Auto-save after every successful analysis.
- `HistoryDrawer` (shadcn `Sheet`): newest-first list with file name, time-ago, before→after scores. Click restores full state (re-hydrates File from stored Blob).

---

## 10. Export PDF

"Export PDF" button uses `jspdf` for a clean report: title, scores (before/after), verdict, HR perspective, missing keywords, all rewrites (required first, then optional). No need to embed original PDF.

---

## 11. Premium UI Polish (Non-Negotiable)

- Dark mode default; light/dark toggle in header. CSS variables for theming.
- Palette: amber/gold primary (`#f59e0b`-ish), emerald success, red severity, deep neutral backgrounds. **No purple/violet gradients.**
- Typography: display font for headlines (e.g. "Bricolage Grotesque" / "Space Grotesk"), JetBrains Mono for labels/captions, system font for body. Heavy letter-spacing on small uppercase mono labels (`tracking-[0.2em]`).
- Background: subtle tech-grid (`bg-tech-grid`), 2–3 ambient blurred radial blobs animated slowly (`.ambient-blobs`). Subtle grain overlay.
- Keyframes in `index.css`:
  - `anim-float` — slow Y bobbing, stat strip cards, staggered delays
  - `anim-breath` — gentle scale pulse on BYOK status pill
  - `anim-blink` — small dot indicator
  - `anim-gradient-text` — animated amber gradient on word "Intelligence"
  - `tracing-beam` — analyzing-state horizontal shimmer
  - `btn-shimmer` — sweep-light on primary CTA when enabled
  - `animate-fade-up` — entrance animation for results
  - `animate-pulse-beam` — dot in loading caption
- Hero: `[ LOCAL-FIRST · BYOK ]` + `[ PRIVACY FIRST ]` pills → big black display headline `Resume Intelligence for the ATS era.` (second word animated amber gradient). Below: 4-cell stat strip (Authenticity dimensions / Servers your data touches / 100% your key / 85+ target score).
- Every interactive element: `data-testid` (kebab-case, function-based).
- Sonner toasts for success/error.
- Buttons: amber primary CTA (`Run ATS analysis`) with shimmer when enabled.

---

## 12. UX Details That Matter

- "Load sample JD" button → populates sample senior frontend engineer JD.
- "Clear" button → wipes inputs and result.
- Analyze button disabled until: key present + resume parsed + JD non-empty.
- During analysis: thin amber `tracing-beam` progress bar + "Parsing resume · matching keywords · generating rewrites" caption.
- On success: toast + auto-scroll to `#results`.
- On 401: "Invalid API key — check it and try again."
- On 429: "Rate limit or quota exceeded on your API account."
- Cmd/Ctrl+Enter in JD textarea triggers analysis if enabled.

---

## 13. Privacy Copy (Footer + Header Tooltip)

> "Your API key never touches our servers — it lives only in this browser tab. Your PDF is parsed locally and never uploaded. The only network call is directly from your browser to OpenAI/Google."

---

## 14. Acceptance Checklist

Before saying "done", verify:

- [ ] App runs with no console errors on first load (no API key needed to render)
- [ ] Provider switch (OpenAI ↔ Gemini) works at runtime; chosen provider used for next analysis
- [ ] Bad key → friendly 401 error toast
- [ ] PDF uploads parse locally, render in left column with severity legend
- [ ] Highlights overlay the correct lines on the PDF
- [ ] Clicking a suggestion scrolls left PDF and pulses matched highlight
- [ ] "Good enough to submit" banner appears only when `ats_score_before >= 88`
- [ ] Optional polish suggestions live in a collapsed accordion, not the main list
- [ ] History drawer lists past analyses, fully restores state on click
- [ ] Export PDF downloads a valid report file
- [ ] Light/dark mode both look polished
- [ ] All animations are subtle, not distracting

Build the entire app in one shot. Do not stub anything. Do not add a backend. Do not store the API key anywhere except `sessionStorage`. After development, guide the user on how to use the app and how to get/paste an API key.