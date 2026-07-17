# Resume Intelligence — ATS Resume Analyzer & Authenticity Audit

**[Live App →](https://ats-resume-analysis-sigma.vercel.app/)**

Client-side, privacy-first ATS resume analyzer. Upload a resume PDF + job description, get an ATS score, authenticity audit, and line-by-line rewrite suggestions — powered by your own AI API key (BYOK). Zero backend, zero database, zero uploads to any server except your chosen AI provider.


---

## ✨ Features

- **100% Client-Side** — PDF parsing, layout analysis, and AI calls all run in-browser. Nothing touches a server you don't control.
- **BYOK (Bring Your Own Key)** — Plug in your own API key for Gemini, Groq, Mistral, or OpenAI. Key stays in `sessionStorage`, sent only to the provider you pick.
- **ATS Score + Authenticity Index** — Before/after ATS score (target 85–98), plus an 8-dimension authenticity audit (buzzword density, specificity, seniority realism, technical depth, semantic redundancy, style entropy, verifiability, ATS manipulation).
- **AI-Language Detection** — Flags inflated seniority, vague impact statements, redundant phrasing, and keyword stuffing — the same patterns recruiters use to spot AI-written resumes.
- **Interactive PDF Inspector** — Canvas-rendered PDF with color-coded, clickable bounding boxes tied to each flagged line.
- **Recruiter HR Perspective** — Simulated recruiter verdict: first impression, strengths, red flags.
- **Experience Realism Check** — Flags YOE vs. implied-seniority mismatches, with probing questions for unverifiable claims.
- **Strategic Rewrites** — Before/after bullet rewrites with one-click copy, prioritized as required vs. optional.
- **Missing Keywords** — ATS keyword gaps vs. the job description.
- **Local History** — Past scans auto-saved to IndexedDB. No account, no cloud sync.
- **PDF Report Export** — Download the full audit as a PDF.
- **Dark/Light Theme**, fully responsive (320px–1024px+).

---

## 🧱 Tech Stack

| Layer | Tech |
|---|---|
| Framework | React 18 + Vite 5 |
| Styling | Tailwind CSS |
| Icons | lucide-react |
| PDF parsing | pdfjs-dist (Web Worker) |
| PDF export | jsPDF |
| Local storage | IndexedDB (via `idb`) |
| AI Providers | Google Gemini, Groq Cloud, Mistral AI, OpenAI |

---

## 🚀 Getting Started

```bash
git clone https://github.com/DhavalMCA/Ats-resume-analysis.git
cd Ats-resume-analysis
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

No `.env` setup needed to run the app — AI provider keys are entered by the user at runtime in the UI (BYOK) and never stored in code or `.env` files. See `.env.example` if you're extending the project with build-time config.

---

## 🔑 Using the App

1. Open the app and pick an AI provider (Gemini / Groq / Mistral / OpenAI) in the header.
2. Paste your API key (masked input, stored only in `sessionStorage` for the session).
3. Upload a resume PDF (max 10MB, parsed locally).
4. Paste the target job description, or load the sample JD.
5. Run analysis — get your ATS score, authenticity audit, and rewrite suggestions.

Supported models include `gemini-2.0-flash`, `llama-3.3-70b-versatile` (Groq), `mistral-large-latest`, and `gpt-4o-mini`, among others.

---

## 🔒 Security & Privacy

- No API keys hardcoded or committed — `.env*` files are gitignored.
- Input length capped (50,000 chars) to guard against prompt injection and payload flooding.
- `max_tokens` capped per-provider to control cost.
- Strict PDF upload validation (MIME type, extension, size, non-zero bytes).
- No `dangerouslySetInnerHTML`, `innerHTML`, or `eval()` — AI JSON responses are parsed safely.
- Security headers set in `index.html` (`X-Content-Type-Options`, `Referrer-Policy`).
- Full detail in [`security-rules-for-ai-generated-apps.md`](./security-rules-for-ai-generated-apps.md).

---

## 📁 Project Structure

```
src/
├── main.jsx                    # React entrypoint
├── App.jsx                     # Root state & ThemeProvider
├── components/
│   ├── Analyzer.jsx            # Main orchestrator, dual-column layout
│   ├── Header.jsx               # Navbar, provider/model select, BYOK input
│   ├── HeroSection.jsx
│   ├── PdfUploader.jsx
│   ├── PdfHighlightViewer.jsx  # Canvas PDF inspector + bounding boxes
│   ├── SuggestionCard.jsx
│   ├── AtsScoreRing.jsx
│   ├── ThemeProvider.jsx
│   ├── HistoryDrawer.jsx
│   ├── HrPerspective.jsx
│   ├── AuthenticityPanel.jsx
│   ├── FlaggedPatterns.jsx
│   └── ExperienceRealism.jsx
└── lib/
    ├── llm.js                  # Gemini/Groq/Mistral/OpenAI clients
    ├── pdfUtils.js              # PDF.js parsing + bounding box calc
    ├── history.js                # IndexedDB wrapper
    └── pdfExport.js              # jsPDF report generator
```

---

## 🗺️ Roadmap

- [ ] More AI providers
- [ ] Cover letter analysis
- [ ] Batch resume comparison



## 👤 Author

**Dhaval Prajapati** — [Portfolio](https://dhaval-prajapati.onrender.com) · [GitHub](https://github.com/DhavalMCA)
