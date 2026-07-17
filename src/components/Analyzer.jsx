import React, { useState, useEffect } from 'react';
import { HeroSection } from './HeroSection';
import { PdfUploader } from './PdfUploader';
import { PdfHighlightViewer } from './PdfHighlightViewer';
import { AtsScoreRing } from './AtsScoreRing';
import { HrPerspective } from './HrPerspective';
import { AuthenticityPanel } from './AuthenticityPanel';
import { ExperienceRealism } from './ExperienceRealism';
import { FlaggedPatterns } from './FlaggedPatterns';
import { SuggestionCard } from './SuggestionCard';
import { analyzeResume } from '../lib/llm';
import { saveAnalysis } from '../lib/history';
import { exportAnalysisReport } from '../lib/pdfExport';
import { 
  Sparkles, Download, RotateCcw, FileText, CheckCircle2, 
  AlertCircle, ChevronDown, ChevronUp, Key, ShieldCheck 
} from 'lucide-react';

const SAMPLE_JOB_DESCRIPTION = `Senior Frontend Engineer (React & TypeScript)

Responsibilities:
- Architect and develop high-performance, responsive web applications using React 18, TypeScript, and TailwindCSS.
- Optimize frontend bundle size, web vitals, memory footprint, and rendering pipeline for complex client-side applications.
- Collaborate with Product and UI/UX designers to implement scalable component libraries, design systems, and micro-interactions.
- Champion frontend testing best practices (Jest, React Testing Library, Playwright), performance profiling, and CI/CD automation.

Requirements:
- 5+ years of software development experience with expertise in modern JavaScript (ESNext), TypeScript, React, state management, and HTML5 canvas/SVG rendering.
- Proven track record of shipping production-grade applications with zero backend latency, offline capabilities (PWA/IndexedDB), and accessibility compliance (WCAG 2.1 AA).
- Deep understanding of Web Workers, asynchronous JS concurrency, performance metrics (LCP, CLS, FID), and state synchronization.`;

export function Analyzer({ 
  apiKey, 
  provider, 
  model,
  onHistoryUpdated,
  selectedHistoryItem 
}) {
  const [parsedPdf, setParsedPdf] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [activeHighlightText, setActiveHighlightText] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Restore state when item selected from History Drawer
  useEffect(() => {
    if (selectedHistoryItem) {
      setJobDescription(selectedHistoryItem.jobDescription || '');
      setAnalysisResult(selectedHistoryItem.result);
      setErrorMsg(null);
      // Re-hydrate PDF from blob if present
      if (selectedHistoryItem.fileBlob) {
        import('../lib/pdfUtils').then(({ parsePdfDocument }) => {
          parsePdfDocument(selectedHistoryItem.fileBlob).then((parsedData) => {
            setParsedPdf({
              fileName: selectedHistoryItem.fileName,
              fileSize: selectedHistoryItem.fileBlob.size,
              ...parsedData,
            });
          });
        });
      }
    }
  }, [selectedHistoryItem]);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const canRunAnalysis = Boolean(apiKey && apiKey.trim() && parsedPdf?.fullText && jobDescription.trim());

  const handleRunAnalysis = async () => {
    if (!canRunAnalysis || isAnalyzing) return;

    setErrorMsg(null);
    setIsAnalyzing(true);
    setActiveHighlightText(null);

    try {
      const result = await analyzeResume({
        provider,
        model,
        apiKey,
        resume: parsedPdf.fullText,
        jobDescription,
      });

      setAnalysisResult(result);
      showToast('ATS Analysis completed successfully!', 'success');

      // Auto-save to IndexedDB history
      try {
        await saveAnalysis({
          fileName: parsedPdf.fileName,
          fileBlob: parsedPdf.file,
          resumeText: parsedPdf.fullText,
          jobDescription,
          result,
        });
        onHistoryUpdated?.();
      } catch (hErr) {
        console.error('Failed to save to history:', hErr);
      }

      // Smooth scroll to results
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);

    } catch (err) {
      console.error('Analysis Failed:', err);
      setErrorMsg(err.message || 'An unexpected error occurred during analysis.');
      showToast(err.message || 'Analysis failed', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      if (canRunAnalysis) {
        handleRunAnalysis();
      }
    }
  };

  const handleClear = () => {
    setParsedPdf(null);
    setJobDescription('');
    setAnalysisResult(null);
    setErrorMsg(null);
    setActiveHighlightText(null);
  };

  const handleLoadSampleJd = () => {
    setJobDescription(SAMPLE_JOB_DESCRIPTION);
  };

  const handleExportPdf = () => {
    if (!analysisResult) return;
    exportAnalysisReport({
      fileName: parsedPdf?.fileName,
      result: analysisResult,
      jobDescription,
    });
    showToast('Report PDF downloaded!', 'success');
  };

  // Split rewrites into required vs optional polish
  const suggestions = analysisResult?.suggestions || [];
  const requiredRewrites = suggestions.filter(s => s.priority === 'required' || !s.priority);
  const optionalRewrites = suggestions.filter(s => s.priority === 'optional');

  const atsBefore = analysisResult?.ats_score_before || 0;
  const atsAfter = analysisResult?.ats_score_after || 0;
  const scoreDelta = atsAfter - atsBefore;

  return (
    <div className="space-y-10 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-up">
          <div className={`p-4 rounded-2xl border shadow-2xl flex items-center gap-3 font-mono text-xs ${
            toastMessage.type === 'error'
              ? 'bg-red-950/90 border-red-500/50 text-red-200'
              : 'bg-slate-900/95 border-emerald-500/50 text-emerald-300'
          }`}>
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <span>{toastMessage.msg}</span>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <HeroSection provider={provider} model={model} />

      {/* Input Form Section */}
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <div className="p-6 sm:p-8 bg-slate-900/80 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-md space-y-6">
          
          {/* Step 1: Upload PDF */}
          <PdfUploader
            onPdfParsed={setParsedPdf}
            parsedPdf={parsedPdf}
            onClearPdf={() => setParsedPdf(null)}
          />

          {/* Step 2: Job Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-mono font-semibold uppercase tracking-[0.2em] text-slate-400">
                2. Paste Target Job Description
              </label>

              <button
                type="button"
                onClick={handleLoadSampleJd}
                className="text-xs font-mono text-amber-400 hover:text-amber-300 hover:underline"
              >
                + Load sample Senior Frontend JD
              </button>
            </div>

            <textarea
              rows={6}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              data-testid="job-description-textarea"
              placeholder="Paste the target job description here (Cmd/Ctrl + Enter to run)..."
              className="w-full p-4 bg-slate-950/60 border border-slate-800 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50 transition-all font-sans leading-relaxed resize-y"
            />
          </div>

          {/* Warning Banner if API key missing */}
          {!apiKey && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-3 text-xs font-mono text-amber-300">
              <Key className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                Please paste and save your {provider === 'gemini' ? 'Google Gemini' : 'OpenAI'} API key in the header above to run analysis.
              </span>
            </div>
          )}

          {/* Error Message Banner */}
          {errorMsg && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3 text-xs font-mono text-red-300">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <div className="space-y-0.5">
                <p className="font-bold text-red-200">Analysis Error</p>
                <p>{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={handleClear}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-mono text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear All Inputs
            </button>

            <button
              type="button"
              onClick={handleRunAnalysis}
              disabled={!canRunAnalysis || isAnalyzing}
              data-testid="run-ats-analysis-btn"
              className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-heading font-extrabold text-sm tracking-wide transition-all shadow-xl flex items-center justify-center gap-2.5 ${
                canRunAnalysis && !isAnalyzing
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 hover:from-amber-400 hover:to-amber-300 shadow-amber-500/20 hover:scale-[1.02] shimmer-button cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/60'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing ? 'Analyzing Resume Architecture...' : 'Run ATS Analysis'}
            </button>
          </div>

          {/* Progress Beam Bar during analysis */}
          {isAnalyzing && (
            <div className="space-y-2 pt-2 animate-fade-up">
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-emerald-400 w-1/2 rounded-full animation-tracing-beam" />
              </div>
              <p className="text-center font-mono text-xs text-amber-400 flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                Parsing resume · matching keywords · evaluating recruiter dimensions · generating rewrites
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Results Section (Dual Column Layout) */}
      {analysisResult && (
        <div id="results-section" className="max-w-7xl mx-auto px-4 pt-8 border-t border-slate-800/80 animate-fade-up space-y-6">
          
          {/* Top Banner: Good Enough to Submit */}
          {atsBefore >= 88 && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs sm:text-sm text-emerald-300 flex items-start gap-3 shadow-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Good Enough to Submit! </span>
                Your resume is already in submit-ready range ({atsBefore}/100). Below are a couple of high-impact rewrites. Everything else is optional polish — don't feel pressured to chase 100.
              </div>
            </div>
          )}

          {/* Dual Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Sticky Canvas PDF Inspector (~58%) */}
            <div className="lg:col-span-7 lg:sticky lg:top-24">
              <PdfHighlightViewer
                pages={parsedPdf?.pages}
                aiDetectedLines={analysisResult.ai_detected_lines}
                activeHighlightText={activeHighlightText}
              />
            </div>

            {/* RIGHT COLUMN: Metrics & Rewrites (~42%) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Score Card Banner */}
              <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-extrabold text-lg text-white">ATS Impact Index</span>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
                      +{scoreDelta > 0 ? scoreDelta : 0} PTS DELTA
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleExportPdf}
                    data-testid="export-pdf-btn"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-mono border border-slate-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" /> Export PDF
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-around gap-4 py-2">
                  <AtsScoreRing score={atsBefore} label="Current Score" color="amber" size={105} />
                  <div className="text-xl font-heading font-extrabold text-slate-500 hidden sm:block">→</div>
                  <AtsScoreRing score={atsAfter} label="Optimized Target" color="emerald" size={105} />
                </div>
              </div>

              {/* Recruiter HR Perspective */}
              <HrPerspective hrPerspective={analysisResult.hr_perspective} />

              {/* Authenticity Breakdown */}
              <AuthenticityPanel
                authenticityScore={analysisResult.authenticity_score}
                dimensionScores={analysisResult.dimension_scores}
              />

              {/* Experience & Claims Realism */}
              <ExperienceRealism
                experienceRealism={analysisResult.experience_realism}
                unverifiableClaims={analysisResult.unverifiable_claims}
              />

              {/* Flagged AI Patterns */}
              <FlaggedPatterns
                flaggedPatterns={analysisResult.flagged_patterns}
                onSelectHighlight={setActiveHighlightText}
              />

              {/* Missing Keywords */}
              {analysisResult.ats_missing_keywords?.length > 0 && (
                <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl space-y-3">
                  <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" /> Top Missing ATS Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.ats_missing_keywords.map((kw, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 text-xs font-mono font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-lg"
                      >
                        + {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Rewrites Section */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-extrabold text-lg text-white">
                    Strategic Bullet Rewrites
                  </h3>
                  <span className="text-xs font-mono text-slate-400">
                    {suggestions.length} Suggestions Generated
                  </span>
                </div>

                {/* Required Rewrites */}
                {requiredRewrites.length > 0 && (
                  <div className="space-y-3">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                      Priority Impact Rewrites ({requiredRewrites.length})
                    </span>
                    {requiredRewrites.map((s, idx) => (
                      <SuggestionCard
                        key={idx}
                        suggestion={s}
                        index={idx}
                        onSelectHighlight={setActiveHighlightText}
                      />
                    ))}
                  </div>
                )}

                {/* Optional Polish Accordion */}
                {optionalRewrites.length > 0 && (
                  <details className="group border border-slate-800 bg-slate-900/60 rounded-2xl overflow-hidden shadow-lg">
                    <summary className="p-4 cursor-pointer flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 select-none">
                      <span>Optional Polish ({optionalRewrites.length} Fine-Tuning Edits)</span>
                      <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="p-4 pt-0 space-y-3 border-t border-slate-800/80">
                      {optionalRewrites.map((s, idx) => (
                        <SuggestionCard
                          key={idx}
                          suggestion={s}
                          index={requiredRewrites.length + idx}
                          onSelectHighlight={setActiveHighlightText}
                        />
                      ))}
                    </div>
                  </details>
                )}

              </div>

            </div>

          </div>

        </div>
      )}

      {/* Privacy Guarantee Footer */}
      <footer className="max-w-4xl mx-auto px-4 pt-12 border-t border-slate-800/60 text-center space-y-2">
        <p className="text-xs font-mono text-slate-500 leading-relaxed max-w-2xl mx-auto">
          "Your API key never touches our servers — it lives only in this browser tab. Your PDF is parsed locally and never uploaded. The only network call is directly from your browser to OpenAI/Google."
        </p>
        <p className="text-[11px] font-mono text-slate-600">
          Built with React 18 · Tailwind CSS · pdfjs-dist · jspdf · IndexedDB
        </p>
      </footer>
    </div>
  );
}
