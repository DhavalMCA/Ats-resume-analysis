# Resume Intelligence — Master Build & Security Specification

Build a premium, client-side **Resume ATS Analyzer & Authenticity Audit Application** as a single-page React app with **zero backend servers and zero database dependencies**. Everything runs strictly in the browser using Bring Your Own Key (BYOK) AI API credentials.

---

## 1. Core Architecture & Privacy Principles

- **100% Client-Side Privacy**: All processing (PDF parsing, layout calculation, LLM API calls, report generation) occurs strictly in the browser.
- **BYOK (Bring Your Own Key)**: User API keys live in `sessionStorage` (`byok_llm_key`, `byok_provider`, `byok_model`) and are sent ONLY directly to the selected AI provider endpoint.
- **Supported Providers**:
  1. **Google Gemini** (Free tier available — `gemini-2.0-flash`, `gemini-1.5-flash`, `gemini-1.5-pro`)
  2. **Groq Cloud** (`llama-3.3-70b-versatile`, `llama-3.1-8b-instant`, `deepseek-r1-distill-llama-70b`)
  3. **Mistral AI** (`mistral-large-latest`, `pixtral-large-latest`, `mistral-small-latest`, `codestral-latest`)
  4. **OpenAI ChatGPT** (`gpt-4o-mini`, `gpt-4o`, `o3-mini`)
- **Local PDF Processing**: Resumes are parsed locally using `pdfjs-dist` inside a browser Web Worker (text extraction + line bounding box coordinates).
- **Offline History**: Past scan reports auto-save locally to IndexedDB (`ats_history_db`).

---

## 2. Comprehensive UI/UX Design System Specification

### Color Tokens & Palette
- **Theme Modes**: Dual theme support with Dark Mode default (`#0a0d14`) and high-contrast Light Mode (`#f8fafc`).
- **Primary Accent**: Amber / Gold (`#f59e0b`, `#fbbf24`, `#d97706`) with animated gradient text.
- **Success Accent**: Emerald Green (`#10b981`, `#059669`) for positive ATS score boosts and submit-ready indicators.
- **Severity Colors**: High (`#ef4444` red), Medium (`#f59e0b` amber), Low (`#facc15` yellow).
- **Background Details**: Subtle 32px tech grid pattern (`bg-tech-grid`) and two floating ambient blurred radial blobs (`ambient-blob-1`, `ambient-blob-2`).

### Typography Architecture
- **Display Headings (`font-heading`)**: `Bricolage Grotesque` or `Space Grotesk`.
- **Body Text (`font-sans`)**: `Inter`.
- **Code, Badges & Scores (`font-mono`)**: `JetBrains Mono`.
- **Fluid Scaling**:
  - `h1`: `clamp(2rem, 5vw + 1rem, 3.75rem)`
  - `h2`: `clamp(1.5rem, 3vw + 0.75rem, 2.5rem)`
  - `h3`: `clamp(1.125rem, 2vw + 0.5rem, 1.5rem)`

### Component Layout Specs
1. **Header Navbar**:
   - Sticky top bar (`backdrop-blur-xl bg-[#0a0d14]/85`).
   - Logo + `BYOK v1.0` badge + `100% Client-Side Audit` pill.
   - Provider buttons (Groq, Gemini, Mistral, OpenAI), Model dropdown selector (`max-w-[170px]`), Password-masked API key input with eye toggle + inline `Save` button.
   - Compact 2-column mobile layout (`lg:hidden`) ensuring zero element overlapping on 320px–1024px screens.
   - Action triggers: Zero Backend Help tooltip, History drawer button with counter badge, Theme toggle (sun/moon).
2. **Hero Section**:
   - Badges: `[ LOCAL-FIRST · BYOK ]` and `[ PRIVACY FIRST ]`.
   - Title: `Resume Intelligence for the ATS era.` with animated gradient text on `Intelligence`.
   - 4-Cell Stat Strip: 8 Dimensions Authenticity Audit, 0 Servers, 100% BYOK, 85–98 Target Score.
3. **Input & Upload Section**:
   - Drag-and-Drop PDF Uploader with file size (max 10MB) & `.pdf` MIME validation, loading spinner animation, and local parse badge (`Parsed locally · never uploaded`).
   - Job Description Textarea with `Cmd/Ctrl + Enter` shortcut handler + `+ Load sample Senior Frontend JD` quick fill button.
   - Primary CTA Button: `Run ATS Analysis` with sweep-light shimmer animation (`shimmer-button`) when enabled, loading beam (`tracing-beam`) during processing.
4. **Dual-Column Results Inspector**:
   - **Left Column (~58% sticky on desktop)**: Interactive PDF Inspector rendering canvas pages with color-tinted line bounding boxes matched to AI-detected issues. Hover tooltip shows issue pattern & severity. Click on suggestion card auto-scrolls PDF to matched line with pulse glow (`highlight-pulse`).
   - **Right Column (~42%)**:
     - "Good Enough to Submit" banner (when score ≥ 88).
     - Dual SVG Circular Score Rings (`AtsScoreRing` — Current Score → Target Score) + Delta badge.
     - Recruiter HR Perspective card (verdict badge, first impression, strengths, red flags).
     - Authenticity Index (8 horizontal dimension progress bars).
     - Experience & Claims Realism (YOE vs implied seniority, mismatch severity, unverifiable claims with recruiter probing questions accordion).
     - Flagged AI Language Patterns list.
     - Top Missing ATS Keywords chips.
     - Strategic Bullet Rewrites: Priority Impact Rewrites list + Optional Polish accordion. Each card has a one-click `Copy` button.

---

## 3. Mandatory AI Security Rules & Constraints

In accordance with project security guidelines (`security-rules-for-ai-generated-apps.md`):

1. **Secrets Security**:
   - No hardcoded API keys in frontend source files. `.env`, `.env.local`, `.env.*.local` listed in `.gitignore`.
   - `.env.example` file provided for environment template setup.
2. **Input Bounds & Sanitization**:
   - Maximum input string length limit enforced (`50,000` chars for resume and job description) to prevent payload flooding, prompt injection attacks, and excessive token charges.
3. **Token Limits & Cost Protection**:
   - `max_tokens: 4096` enforced on OpenAI, Groq, and Mistral calls; `maxOutputTokens: 4096` on Gemini API calls.
4. **Upload Validation**:
   - Client-side MIME (`application/pdf`), `.pdf` extension, non-zero byte check, and max 10MB file size cap.
5. **Security Headers**:
   - Meta security tags in `index.html`: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.
6. **XSS Prevention**:
   - Strict avoidance of `dangerouslySetInnerHTML`, `innerHTML`, or dynamic `eval()`. Safe JSON schema extraction in `parseJsonResponse`.
7. **Error Masking**:
   - User-friendly error messages for invalid keys (401), rate limits (429), or empty responses without leaking stack traces.

---

## 4. Output JSON Schema & System Prompt

Both Gemini, OpenAI, Groq, and Mistral calls MUST use the following system prompt and return valid JSON matching this exact structure:

### System Prompt
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

### JSON Schema
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
    { "text": "", "severity": "high|medium|low", "pattern": "buzzword|inflated_seniority|vague_impact|redundancy|unrealistic_scope|low_specificity|uniform_rhythm|ats_stuffing" }
  ],
  "flagged_patterns": [
    { "name": "", "category": "", "severity": "high|medium|low", "examples": [""], "why_it_matters": "" }
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
    { "original": "", "improved": "", "reason": "", "impact_points": 0, "priority": "required|optional" }
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

---

## 5. Tech Stack & File Structure

```
/
├── CLAUDE.md                       # Security rule guidelines for AI agents
├── .cursorrules                    # IDE security constraints
├── .env.example                    # Sample environment template
├── index.html                      # Security meta headers + font links
├── tailwind.config.js              # Theme extend, colors, fonts
├── src/
│   ├── main.jsx                    # React entrypoint
│   ├── App.jsx                     # Root state & ThemeProvider wrapper
│   ├── index.css                   # Fluid typography, themes, keyframes
│   ├── components/
│   │   ├── Analyzer.jsx            # Main orchestrator & dual-column layout
│   │   ├── Header.jsx              # Navbar, provider pills, model select, BYOK input
│   │   ├── HeroSection.jsx         # Title, badge pills, stat strip
│   │   ├── PdfUploader.jsx         # Drag-drop local PDF loader
│   │   ├── PdfHighlightViewer.jsx  # Interactive canvas PDF inspector + bounding boxes
│   │   ├── SuggestionCard.jsx      # Before/After comparison, copy button
│   │   ├── AtsScoreRing.jsx        # SVG score progress ring
│   │   ├── ThemeProvider.jsx       # Dark/Light theme context
│   │   ├── HistoryDrawer.jsx       # Local IndexedDB history drawer
│   │   ├── HrPerspective.jsx       # Recruiter verdict summary card
│   │   ├── AuthenticityPanel.jsx   # 8-dimension authenticity progress bars
│   │   ├── FlaggedPatterns.jsx     # AI language patterns card
│   │   └── ExperienceRealism.jsx   # YOE alignment & claims probing accordion
│   └── lib/
│       ├── llm.js                  # Gemini, Groq, Mistral, OpenAI API clients
│       ├── pdfUtils.js             # Local PDF.js parsing & bounding box calculation
│       ├── history.js              # IndexedDB storage wrapper
│       └── pdfExport.js            # jsPDF report export generator
```

---

## 6. Acceptance & Verification Checklist

- [x] 100% Client-Side execution — zero backend server requirements.
- [x] Multi-Provider BYOK (Gemini, Groq, Mistral, OpenAI) supported at runtime.
- [x] Strict security controls: `.env.example`, input bounds (50k chars), `max_tokens` limits (4096), non-zero byte PDF validation, security meta headers.
- [x] Full Dark (`#0a0d14`) and Light (`#f8fafc`) theme toggle working across all cards, inputs, and popups.
- [x] Responsive layout optimized across mobile (320px+), tablet, and desktop monitors with zero navbar component overlap.
- [x] Local PDF canvas rendering with interactive line highlighting & scroll-to-line sync.
- [x] IndexedDB scan history drawer with full report re-hydration.
- [x] Single-click PDF report export (`jsPDF`).