import React, { useState, useMemo } from "react";
import { Copy, CheckCheck, Sparkles, ChevronDown, Download } from "lucide-react";

/**
 * Segments `text` highlighting all `keywords` occurrences.
 * Returns [{text, highlight}] array.
 */
function segmentText(text, keywords) {
  if (!keywords?.length) return [{ text, highlight: false }];
  const sorted = [...keywords].sort((a, b) => b.length - a.length);
  const pattern = sorted.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const regex = new RegExp(`(${pattern})`, "gi");
  const parts = [];
  let last = 0, match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push({ text: text.slice(last, match.index), highlight: false });
    parts.push({ text: match[0], highlight: true });
    last = regex.lastIndex;
  }
  if (last < text.length) parts.push({ text: text.slice(last), highlight: false });
  return parts;
}

export function AiPromptPanel({ analysisResult, jobDescription, resumeText }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const prompt = useMemo(() => {
    if (!analysisResult || !jobDescription) return "";
    const missing = (analysisResult.ats_missing_keywords || []).join(", ");
    const suggestions = (analysisResult.suggestions || [])
      .map((s, i) => `${i + 1}. ORIGINAL: "${s.original}"\n   IMPROVED: "${s.improved}"\n   REASON: ${s.reason}`)
      .join("\n\n");
    const hrVerdict = analysisResult.hr_perspective?.verdict || "N/A";
    const atsBefore = analysisResult.ats_score_before ?? 0;
    const atsAfter = analysisResult.ats_score_after ?? 0;
    const authScore = analysisResult.authenticity_score ?? 0;
    const verdictSummary = analysisResult.verdict_summary || "";

    return `You are an expert ATS resume consultant and career coach. I need you to help me enhance my resume for the following job description.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 JOB DESCRIPTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${jobDescription.trim()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 MY CURRENT ATS ANALYSIS RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• ATS Score (Before Optimization): ${atsBefore}/100
• ATS Score (After Suggested Fixes): ${atsAfter}/100
• Authenticity Score: ${authScore}/100
• Recruiter HR Verdict: ${hrVerdict.replace(/_/g, " ").toUpperCase()}
• Summary: ${verdictSummary}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔑 MISSING ATS KEYWORDS (must integrate)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${missing || "None identified — resume is already keyword-rich."}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✏️ AI-SUGGESTED BULLET REWRITES (for context)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${suggestions || "No rewrites suggested."}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 MY RESUME TEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${(resumeText || "").trim()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 YOUR TASK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Using all the context above, please:

1. **Keyword Integration** — Rewrite any resume bullets that are weak or vague to naturally incorporate the MISSING ATS KEYWORDS listed above. Each keyword should appear at least once in context, not keyword-stuffed.

2. **Bullet Strength** — Apply the AI-suggested rewrites where relevant. Strengthen bullets with: specific metrics (%, numbers, $, ms, MAUs), concrete tools/technologies, and outcome-focused language.

3. **Tone & Authenticity** — Match the language complexity to the candidate's apparent years of experience. Avoid buzzwords like "spearheaded", "leveraged synergistic", "architected enterprise ecosystems" unless the experience genuinely warrants them.

4. **ATS Formatting** — Ensure all bullets start with a strong action verb. Keep each bullet to 1–2 lines. Remove any keyword stuffing, columns, tables, or decorative formatting that ATS parsers reject.

5. **Final Output** — Return the full, updated resume in clean Markdown format, ready to copy-paste. Bold the newly added or changed keywords so I can review them easily.

Be direct, specific, and ruthlessly practical. Prioritize changes that will move the ATS score from ${atsBefore} toward ${atsAfter}+.`;
  }, [analysisResult, jobDescription, resumeText]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
    } catch {
      const el = document.createElement("textarea");
      el.value = prompt;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([prompt], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "updated_resume.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!analysisResult) return null;

  const keywords = analysisResult.ats_missing_keywords || [];
  const segments = segmentText(prompt, keywords);
  const kwCount = keywords.length;

  return (
    <div className="p-5 bg-slate-900/90 border border-violet-500/30 rounded-2xl shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm text-white leading-tight">
              AI Enhancement Prompt
            </h3>
            <p className="text-[10px] font-mono text-slate-500 mt-0.5">
              Copy &amp; paste into ChatGPT, Claude, or Gemini
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {kwCount > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
              {kwCount} keywords
            </span>
          )}
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title={open ? "Collapse" : "Expand prompt"}
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* Collapsed row */}
      {!open && (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs text-slate-400 font-mono flex-1 min-w-0 truncate">
            JD + {kwCount} missing keywords + {analysisResult.suggestions?.length ?? 0} rewrites + resume → ready for any AI
          </p>
          <button
            type="button"
            onClick={handleDownload}
            data-testid="download-updated-resume-btn"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all shadow-md shrink-0 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 hover:border-teal-400/50"
            title="Download updated_resume.md"
          >
            <Download className="w-3.5 h-3.5" /> Download .md
          </button>
          <button
            type="button"
            onClick={handleCopy}
            data-testid="copy-ai-prompt-btn"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all shadow-md shrink-0 ${
              copied
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white border border-violet-500/40"
            }`}
          >
            {copied ? (
              <><CheckCheck className="w-3.5 h-3.5" /> Copied!</>
            ) : (
              <><Copy className="w-3.5 h-3.5" /> Copy Prompt</>
            )}
          </button>
        </div>
      )}

      {/* Expanded viewer */}
      {open && (
        <div className="space-y-3">
          {kwCount > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Highlighted keywords:</span>
              {keywords.slice(0, 12).map((kw, i) => (
                <span key={i} className="px-1.5 py-0.5 text-[10px] font-mono bg-amber-400/15 text-amber-300 border border-amber-400/25 rounded">
                  {kw}
                </span>
              ))}
              {kwCount > 12 && <span className="text-[10px] font-mono text-slate-500">+{kwCount - 12} more</span>}
            </div>
          )}

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 max-h-80 overflow-y-auto">
            <pre className="text-[11px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
              {segments.map((seg, i) =>
                seg.highlight ? (
                  <mark key={i} className="bg-amber-400/25 text-amber-200 rounded px-0.5 not-italic font-semibold">
                    {seg.text}
                  </mark>
                ) : (
                  <span key={i}>{seg.text}</span>
                )
              )}
            </pre>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleDownload}
              data-testid="download-updated-resume-expanded-btn"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-heading font-bold transition-all shadow-md bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 hover:border-teal-400/50"
              title="Download updated_resume.md"
            >
              <Download className="w-3.5 h-3.5" /> Download updated_resume.md
            </button>
            <button
              type="button"
              onClick={handleCopy}
              data-testid="copy-ai-prompt-expanded-btn"
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-heading font-bold transition-all shadow-md ${
                copied
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white border border-violet-500/40 hover:scale-[1.02]"
              }`}
            >
              {copied ? (
                <><CheckCheck className="w-3.5 h-3.5" /> Copied!</>
              ) : (
                <><Copy className="w-3.5 h-3.5" /> Copy Full Prompt</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
