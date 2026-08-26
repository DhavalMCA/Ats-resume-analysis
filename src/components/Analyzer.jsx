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
import { AiPromptPanel } from './AiPromptPanel';
import { BrandMark } from './BrandMark';
import { analyzeResume } from '../lib/llm';
import { saveAnalysis } from '../lib/history';
import { exportAnalysisReport, exportChangesPdf, exportOptimizedResumeMarkdown } from '../lib/pdfExport';
import { 
  Sparkles, Download, RotateCcw, FileText, CheckCircle2, 
  AlertCircle, ChevronDown, ChevronUp, Key, ShieldCheck, FileText as FileIcon,
  Check, ArrowRight, Layers, Lock, Cpu
} from 'lucide-react';

const SAMPLE_JDS = {
  frontend: {
    title: 'Senior Frontend',
    text: `Senior Frontend Engineer (React & TypeScript)

Responsibilities:
- Architect and develop high-performance, responsive web applications using React 18, TypeScript, and TailwindCSS.
- Optimize frontend bundle size, web vitals, memory footprint, and rendering pipeline for complex client-side applications.
- Collaborate with Product and UI/UX designers to implement scalable component libraries, design systems, and micro-interactions.
- Champion frontend testing best practices (Jest, React Testing Library, Playwright), performance profiling, and CI/CD automation.

Requirements:
- 5+ years of software development experience with expertise in modern JavaScript (ESNext), TypeScript, React, state management, and HTML5 canvas/SVG rendering.
- Proven track record of shipping production-grade applications with zero backend latency, offline capabilities (PWA/IndexedDB), and accessibility compliance (WCAG 2.1 AA).
- Deep understanding of Web Workers, asynchronous JS concurrency, performance metrics (LCP, CLS, FID), and state synchronization.`
  },
  fullstack: {
    title: 'Full-Stack Eng',
    text: `Full-Stack Software Engineer (Node.js, React & Cloud)

Responsibilities:
- Design and build end-to-end web applications, microservices, and APIs using Node.js, Next.js, TypeScript, and PostgreSQL.
- Implement robust authentication, data encryption, rate limiting, and RBAC authorization across distributed microservices.
- Manage CI/CD pipelines, containerized deployments (Docker, Kubernetes), and cloud infrastructure on AWS/GCP.
- Monitor application performance (APM, Datadog), write comprehensive unit/integration tests, and troubleshoot production issues.

Requirements:
- 4+ years of full-stack engineering experience building production systems at scale.
- Hands-on expertise with RESTful & GraphQL APIs, ORMs (Prisma, Drizzle), serverless architectures, and SQL database tuning.
- Strong knowledge of security best practices (OWASP Top 10, XSS/CSRF prevention, secret management) and system architecture.`
  },
  devops: {
    title: 'DevOps / Cloud',
    text: `Senior Cloud DevOps & Site Reliability Engineer (AWS & K8s)

Responsibilities:
- Automate cloud infrastructure provisioning using Terraform, Helm, and Ansible across AWS multi-region deployments.
- Build and maintain highly resilient Kubernetes clusters, Service Mesh (Istio), and GitOps deployment pipelines (ArgoCD).
- Establish end-to-end observability, distributed tracing, alerting, and SLA/SLO monitoring using Prometheus, Grafana, and Jaeger.
- Enforce infrastructure security hardening, IAM least-privilege policies, zero-trust networking, and automated compliance scanning.

Requirements:
- 5+ years in DevOps, SRE, or Cloud Infrastructure engineering with deep AWS/GCP and Linux sysadmin expertise.
- Production experience with Docker, Kubernetes, Infrastructure-as-Code (Terraform), Python/Bash scripting, and CI/CD workflows.
- Strong problem-solving skills for incident management, disaster recovery planning, and cost optimization.`
  }
};

export function Analyzer({ 
  apiKey, 
  provider, 
  model,
  onHistoryUpdated,
  selectedHistoryItem,
  onOpenApiKeyGuide
}) {
  const [parsedPdf, setParsedPdf] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [activeHighlightText, setActiveHighlightText] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Restore state when item selected from History Drawer
  useEffect(() => {
    if (selectedHistoryItem) {
      setJobDescription(selectedHistoryItem.jobDescription || '');
      setAnalysisResult(selectedHistoryItem.result);
      setErrorMsg(null);
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

  const hasApiKey = Boolean(apiKey && apiKey.trim());
  const hasPdf = Boolean(parsedPdf?.fullText);
  const hasJd = Boolean(jobDescription.trim());
  const canRunAnalysis = hasApiKey && hasPdf && hasJd;

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

  const handleExportPdf = () => {
    if (!analysisResult) return;
    exportAnalysisReport({
      fileName: parsedPdf?.fileName,
      result: analysisResult,
      jobDescription,
    });
    showToast('Report PDF downloaded!', 'success');
  };

  const handleExportChangesPdf = () => {
    if (!analysisResult) return;
    exportChangesPdf({
      fileName: parsedPdf?.fileName,
      result: analysisResult,
    });
    showToast('Changes PDF exported successfully!', 'success');
  };

  const handleExportOptimizedResumeMarkdown = () => {
    if (!analysisResult || !parsedPdf) return;
    exportOptimizedResumeMarkdown({
      fileName: parsedPdf.fileName,
      resumeText: parsedPdf.fullText,
      suggestions: analysisResult.suggestions
    });
    showToast('Optimized Resume Markdown downloaded!', 'success');
  };

  const suggestions = analysisResult?.suggestions || [];
  const requiredRewrites = suggestions.filter(s => s.priority === 'required' || !s.priority);
  const optionalRewrites = suggestions.filter(s => s.priority === 'optional');

  const atsBefore = analysisResult?.ats_score_before || 0;
  const atsAfter = analysisResult?.ats_score_after || 0;
  const scoreDelta = atsAfter - atsBefore;

  return (
    <div className="space-y-16 pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-up">
          <div className={`p-4 rounded-2xl border shadow-xl flex items-center gap-3 font-mono text-xs ${
            toastMessage.type === 'error'
              ? 'bg-[#FBF0EE] border-[#E8B8B0] text-[#B85242] dark:bg-[#2A1715] dark:text-[#D96957]'
              : 'bg-[#FFFDF8] border-[#A8D0B5] text-[#3B7A57] dark:bg-[#162432] dark:text-[#4E9A70]'
          }`}>
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-[#B85242] shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-[#3B7A57] shrink-0" />
            )}
            <span>{toastMessage.msg}</span>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <HeroSection 
        provider={provider} 
        model={model} 
        onLoadSampleJd={() => setJobDescription(SAMPLE_JDS.frontend.text)} 
      />

      {/* How-it-Works Section */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#D99A2B]">
            Three-Step Review Process
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#13232F] dark:text-white">
            How Resume Intelligence works.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-[#FFFDF8] dark:bg-[#162432] border border-[#E2D9C8] dark:border-[#223446] rounded-2xl space-y-3 shadow-sm relative">
            <span className="text-2xl font-mono font-bold text-[#D99A2B]">01</span>
            <h3 className="font-heading font-bold text-lg text-[#13232F] dark:text-white">Bring the context</h3>
            <p className="text-xs text-[#52667A] dark:text-slate-300 leading-relaxed font-sans">
              Upload your PDF resume and paste the target job description. PDF parsing runs entirely inside your browser tab.
            </p>
          </div>

          <div className="p-6 bg-[#FFFDF8] dark:bg-[#162432] border border-[#E2D9C8] dark:border-[#223446] rounded-2xl space-y-3 shadow-sm relative">
            <span className="text-2xl font-mono font-bold text-[#D99A2B]">02</span>
            <h3 className="font-heading font-bold text-lg text-[#13232F] dark:text-white">See the evidence</h3>
            <p className="text-xs text-[#52667A] dark:text-slate-300 leading-relaxed font-sans">
              Inspect missing keywords, formatting risks, recruiter red flags, and bounding-box text highlights directly on your document pages.
            </p>
          </div>

          <div className="p-6 bg-[#FFFDF8] dark:bg-[#162432] border border-[#E2D9C8] dark:border-[#223446] rounded-2xl space-y-3 shadow-sm relative">
            <span className="text-2xl font-mono font-bold text-[#D99A2B]">03</span>
            <h3 className="font-heading font-bold text-lg text-[#13232F] dark:text-white">Make the edit</h3>
            <p className="text-xs text-[#52667A] dark:text-slate-300 leading-relaxed font-sans">
              Apply prioritized bullet rewrites with concrete metric enhancements, or export full ATS report PDF and Markdown.
            </p>
          </div>
        </div>
      </section>

      {/* Main Review Desk Workspace */}
      <section id="intake-desk" className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Review Desk Container */}
        <div className="p-6 sm:p-8 bg-[#FFFDF8] dark:bg-[#162432] border border-[#E2D9C8] dark:border-[#223446] rounded-3xl shadow-md space-y-6">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E2D9C8] dark:border-[#223446]">
            <div className="flex items-center gap-2">
              <BrandMark size={24} />
              <h2 className="font-heading font-bold text-lg text-[#13232F] dark:text-white">
                Intake Workspace
              </h2>
            </div>
            <span className="text-xs font-mono text-[#52667A] dark:text-slate-400 hidden sm:inline">
              Review Desk v1.0
            </span>
          </div>

          {/* 2-Column Desk Grid (Desktop) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Step 1: Resume Upload Surface (~6 cols) */}
            <div className="lg:col-span-6">
              <PdfUploader
                onPdfParsed={setParsedPdf}
                parsedPdf={parsedPdf}
                onClearPdf={() => setParsedPdf(null)}
              />
            </div>

            {/* Step 2: Target Role Panel (~6 cols) */}
            <div className="lg:col-span-6 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#13232F] dark:text-slate-200">
                  Step 2: Target Role
                </label>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-mono text-[#52667A] dark:text-slate-400 uppercase">Samples:</span>
                  {Object.entries(SAMPLE_JDS).map(([key, sample]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setJobDescription(sample.text)}
                      className="px-2 py-0.5 text-[11px] font-mono bg-[#FAF3E5] dark:bg-[#272216] text-[#D99A2B] border border-[#E8C98F] dark:border-[#5C4722] rounded-lg transition-colors hover:bg-[#D99A2B]/20"
                    >
                      + {sample.title}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows={6}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                onKeyDown={handleKeyDown}
                data-testid="job-description-textarea"
                placeholder="Paste the target job description here (Cmd/Ctrl + Enter to run)..."
                className="w-full p-4 bg-[#FFFDF8] dark:bg-[#0F1720] border border-[#E2D9C8] dark:border-[#223446] rounded-2xl text-xs sm:text-sm text-[#13232F] dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#D99A2B] font-sans leading-relaxed resize-y shadow-inner"
              />

              <div className="flex items-center justify-between text-[11px] font-mono text-[#52667A] dark:text-slate-400">
                <span>{jobDescription.length.toLocaleString()} chars</span>
                <span>{hasJd ? '✓ Role added' : 'Paste JD text to begin'}</span>
              </div>
            </div>

          </div>

          {/* Review Readiness Status Strip */}
          <div className="p-4 bg-[#F6F2EA] dark:bg-[#0F1720] border border-[#EDE5D6] dark:border-[#1C2D3E] rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="font-bold text-[#13232F] dark:text-white uppercase tracking-wider text-[11px]">
                Readiness Check:
              </span>
              <span className={`flex items-center gap-1.5 ${hasPdf ? 'text-[#3B7A57] dark:text-[#4E9A70]' : 'text-[#D99A2B]'}`}>
                {hasPdf ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                1. Resume PDF ({hasPdf ? 'Ready' : 'Needs PDF'})
              </span>
              <span className={`flex items-center gap-1.5 ${hasJd ? 'text-[#3B7A57] dark:text-[#4E9A70]' : 'text-[#D99A2B]'}`}>
                {hasJd ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                2. Target Role ({hasJd ? 'Ready' : 'Needs Text'})
              </span>
              <span className={`flex items-center gap-1.5 ${hasApiKey ? 'text-[#3B7A57] dark:text-[#4E9A70]' : 'text-[#D99A2B]'}`}>
                {hasApiKey ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Key className="w-3.5 h-3.5" />}
                3. Key ({hasApiKey ? `${provider} Set` : 'Key Needed'})
              </span>
            </div>

            {!hasApiKey && (
              <button
                type="button"
                onClick={onOpenApiKeyGuide}
                className="text-xs font-mono text-[#D99A2B] hover:underline font-bold"
              >
                + Configure API Key →
              </button>
            )}
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-4 bg-[#FBF0EE] dark:bg-[#2A1715] border border-[#E8B8B0] dark:border-[#592922] rounded-2xl text-xs font-mono text-[#B85242] dark:text-[#D96957] space-y-3 animate-fade-down">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="font-bold text-sm">Analysis Error</p>
                  <p className="leading-relaxed">{errorMsg}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pl-8">
                <button
                  type="button"
                  onClick={onOpenApiKeyGuide}
                  className="px-3 py-1.5 bg-[#FFFDF8] dark:bg-[#162432] border border-[#E8B8B0] rounded-xl text-xs font-bold transition-all"
                >
                  🔑 Key Guide &amp; Free Keys
                </button>
                <button
                  type="button"
                  onClick={() => setErrorMsg(null)}
                  className="px-3 py-1.5 bg-[#F6F2EA] dark:bg-[#0F1720] border border-[#EDE5D6] text-[#52667A] rounded-xl text-xs font-bold"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Primary Action Button Area */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-[#E2D9C8] dark:border-[#223446]">
            <button
              type="button"
              onClick={handleClear}
              className="w-full sm:w-auto px-4 py-2 text-xs font-mono text-[#52667A] dark:text-slate-400 hover:text-[#13232F] dark:hover:text-white flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear All Inputs
            </button>

            <button
              type="button"
              onClick={handleRunAnalysis}
              disabled={!canRunAnalysis || isAnalyzing}
              data-testid="run-ats-analysis-btn"
              className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-mono font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2.5 ${
                canRunAnalysis && !isAnalyzing
                  ? 'btn-saffron cursor-pointer'
                  : 'bg-[#F6F2EA] dark:bg-[#1C2D3E] text-[#8295A6] dark:text-slate-500 cursor-not-allowed border border-[#EDE5D6] dark:border-[#223446]'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing ? 'Analyzing Resume Architecture…' : 'Run ATS Analysis'}
            </button>
          </div>

          <p className="text-center text-[11px] font-mono text-[#52667A] dark:text-slate-400 pt-1">
            Review begins locally inside your browser tab — no files are stored on external servers.
          </p>

          {/* Stage-based Progress Panel during analysis */}
          {isAnalyzing && (
            <div className="p-5 bg-[#FAF3E5] dark:bg-[#272216] border border-[#E8C98F] dark:border-[#5C4722] rounded-2xl space-y-3 animate-fade-up">
              <div className="w-full h-2 bg-[#F6F2EA] dark:bg-[#0F1720] rounded-full overflow-hidden relative">
                <div className="absolute inset-0 bg-[#D99A2B] w-1/2 rounded-full animation-tracing-beam" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] font-mono text-[#52667A] dark:text-slate-300">
                <div className="flex items-center gap-1.5 font-bold text-[#D99A2B]">
                  <span className="w-2 h-2 rounded-full bg-[#D99A2B] animate-ping" />
                  1. Reading resume
                </div>
                <div>2. Comparing role language</div>
                <div>3. Checking ATS formatting</div>
                <div>4. Preparing recommendations</div>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Results Section */}
      {analysisResult && (
        <section id="results-section" className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 space-y-6 animate-fade-up">
          
          {/* Top Banner: Good Enough to Submit */}
          {atsBefore >= 88 && (
            <div className="p-4 bg-[#EBF4EE] dark:bg-[#13261C] border border-[#A8D0B5] dark:border-[#245037] rounded-2xl text-xs sm:text-sm text-[#3B7A57] dark:text-[#4E9A70] flex items-start gap-3 shadow-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Good Enough to Submit! </span>
                Your resume is already in submit-ready range ({atsBefore}/100). Below are a couple of high-impact rewrites. Everything else is optional polish — don't feel pressured to chase 100.
              </div>
            </div>
          )}

          {/* Asymmetric Dual Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Sticky Canvas PDF Inspector (~58%) */}
            <div className="lg:col-span-7 lg:sticky lg:top-20">
              <PdfHighlightViewer
                pages={parsedPdf?.pages}
                aiDetectedLines={analysisResult.ai_detected_lines}
                activeHighlightText={activeHighlightText}
              />
            </div>

            {/* RIGHT COLUMN: Metrics & Evidence (~42%) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Score Card Banner */}
              <div className="p-6 bg-[#FFFDF8] dark:bg-[#162432] border border-[#E2D9C8] dark:border-[#223446] rounded-3xl shadow-sm space-y-4">
                <div className="flex flex-col gap-3 border-b border-[#E2D9C8] dark:border-[#223446] pb-3">
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-extrabold text-lg text-[#13232F] dark:text-white">ATS Impact Index</span>
                    <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-[#FAF3E5] dark:bg-[#272216] text-[#D99A2B] border border-[#E8C98F] dark:border-[#5C4722] rounded-full shrink-0">
                      +{scoreDelta > 0 ? scoreDelta : 0} PTS DELTA
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleExportOptimizedResumeMarkdown}
                      data-testid="export-optimized-resume-btn"
                      className="flex items-center gap-1.5 px-4 py-2 btn-saffron rounded-xl text-xs font-mono font-bold transition-all shadow-sm shrink-0 flex-1 justify-center whitespace-nowrap"
                      title="Download fully optimized ATS-compatible resume in Markdown format (.md)"
                    >
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>Download ATS Resume (.md)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportChangesPdf}
                      data-testid="export-changes-pdf-btn"
                      className="flex items-center gap-1.5 px-3 py-2 bg-[#F6F2EA] dark:bg-[#1C2D3E] text-[#D99A2B] border border-[#E2D9C8] dark:border-[#223446] rounded-xl text-xs font-mono font-medium transition-all shrink-0 justify-center whitespace-nowrap"
                      title="Export bullet changes to PDF"
                    >
                      <Download className="w-3.5 h-3.5 shrink-0" />
                      <span>Changes PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportPdf}
                      data-testid="export-pdf-btn"
                      className="flex items-center gap-1.5 px-3 py-2 bg-[#F6F2EA] dark:bg-[#1C2D3E] text-[#52667A] dark:text-slate-300 border border-[#E2D9C8] dark:border-[#223446] rounded-xl text-xs font-mono font-medium transition-all shrink-0 justify-center whitespace-nowrap"
                      title="Export full ATS report to PDF"
                    >
                      <FileIcon className="w-3.5 h-3.5 text-[#52667A] shrink-0" />
                      <span>Report PDF</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-around gap-4 py-2">
                  <AtsScoreRing score={atsBefore} label="Current Score" color="amber" size={105} />
                  <div className="text-xl font-heading font-extrabold text-[#52667A] hidden sm:block">→</div>
                  <AtsScoreRing score={atsAfter} label="Target Score" color="emerald" size={105} />
                </div>
              </div>

              {/* Recruiter HR Verdict */}
              <HrPerspective hrPerspective={analysisResult.hr_perspective} />

              {/* Authenticity Index */}
              <AuthenticityPanel
                authenticityScore={analysisResult.authenticity_score}
                dimensionScores={analysisResult.dimension_scores}
              />

              {/* Experience Realism & Claims */}
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
                <div className="p-5 bg-[#FFFDF8] dark:bg-[#162432] border border-[#E2D9C8] dark:border-[#223446] rounded-2xl shadow-sm space-y-3">
                  <h3 className="font-heading font-bold text-sm text-[#13232F] dark:text-white flex items-center gap-2">
                    <FileIcon className="w-4 h-4 text-[#D99A2B]" /> Top Missing ATS Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.ats_missing_keywords.map((kw, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 text-xs font-mono font-medium bg-[#FAF3E5] dark:bg-[#272216] text-[#D99A2B] border border-[#E8C98F] dark:border-[#5C4722] rounded-lg"
                      >
                        + {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Enhancement Prompt */}
              <AiPromptPanel
                analysisResult={analysisResult}
                jobDescription={jobDescription}
                resumeText={parsedPdf?.fullText}
              />

              {/* Rewrites Section */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-heading font-extrabold text-lg text-[#13232F] dark:text-white">
                    Strategic Bullet Rewrites
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-[#52667A] dark:text-slate-400">
                      {suggestions.length} Suggestions
                    </span>
                    <button
                      type="button"
                      onClick={handleExportOptimizedResumeMarkdown}
                      className="flex items-center gap-1 px-2.5 py-1 bg-[#EBF4EE] dark:bg-[#13261C] text-[#3B7A57] dark:text-[#4E9A70] border border-[#A8D0B5] dark:border-[#245037] rounded-lg text-xs font-mono transition-colors"
                      title="Download Optimized Resume Markdown"
                    >
                      <Sparkles className="w-3 h-3 text-[#3B7A57]" /> Download Resume (.md)
                    </button>
                  </div>
                </div>

                {/* Required Rewrites */}
                {requiredRewrites.length > 0 && (
                  <div className="space-y-3">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#D99A2B] flex items-center gap-1">
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
                  <details className="group border border-[#E2D9C8] dark:border-[#223446] bg-[#FFFDF8] dark:bg-[#162432] rounded-2xl overflow-hidden shadow-sm">
                    <summary className="p-4 cursor-pointer flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-[#52667A] dark:text-slate-400 hover:text-[#13232F] dark:hover:text-slate-200 select-none">
                      <span>Optional Polish ({optionalRewrites.length} Fine-Tuning Edits)</span>
                      <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="p-4 pt-0 space-y-3 border-t border-[#E2D9C8] dark:border-[#223446]">
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
        </section>
      )}

      {/* Privacy Section */}
      <section id="privacy" className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="p-6 sm:p-8 bg-[#FFFDF8] dark:bg-[#162432] border border-[#E2D9C8] dark:border-[#223446] rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#EBF4EE] dark:bg-[#13261C] border border-[#A8D0B5] dark:border-[#245037] rounded-2xl text-[#3B7A57] dark:text-[#4E9A70]">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-xl text-[#13232F] dark:text-white">
                Browser-First Privacy Guarantee
              </h2>
              <p className="text-xs font-mono text-[#52667A] dark:text-slate-400">
                Zero Cloud File Uploads · BYOK Security Model
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans text-[#52667A] dark:text-slate-300 leading-relaxed pt-2">
            <div className="p-4 bg-[#F6F2EA] dark:bg-[#0F1720] border border-[#EDE5D6] dark:border-[#1C2D3E] rounded-2xl space-y-1">
              <h4 className="font-mono font-bold text-[#13232F] dark:text-white">1. Local PDF Extraction</h4>
              <p>Your resume file is parsed using `pdfjs-dist` strictly inside browser worker threads. PDF binary data is never transmitted to any application backend.</p>
            </div>

            <div className="p-4 bg-[#F6F2EA] dark:bg-[#0F1720] border border-[#EDE5D6] dark:border-[#1C2D3E] rounded-2xl space-y-1">
              <h4 className="font-mono font-bold text-[#13232F] dark:text-white">2. Direct BYOK Transmission</h4>
              <p>API requests are sent directly from your browser client to Google Gemini, Groq, Mistral, or OpenAI using the API key saved in `sessionStorage`.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (FAQ) Accordion */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        <h2 className="font-heading text-2xl font-bold text-[#13232F] dark:text-white text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {[
            {
              q: "What is an ATS resume score?",
              a: "An ATS (Applicant Tracking System) resume score rating measures how well your resume matches a job description and how easily it can be parsed by automated software. Our analyzer highlights formatting risks, missing keywords, and readability gaps."
            },
            {
              q: "Is my resume data stored?",
              a: "No. Analysis runs client-side inside your browser tab using your own API key (BYOK). Your PDF is parsed locally and never uploaded to external application servers."
            },
            {
              q: "How can I improve my ATS score for free?",
              a: "Tailor your resume to the target job description, insert relevant keywords naturally into bullet points, avoid complex multi-column formatting, and quantify achievements with concrete numbers."
            },
            {
              q: "Do I need to sign up to use the ATS resume checker?",
              a: "No signup or registration is required. You can check your resume compatibility completely anonymously and instantly."
            }
          ].map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div 
                key={index} 
                className="border border-[#E2D9C8] dark:border-[#223446] bg-[#FFFDF8] dark:bg-[#162432] rounded-2xl overflow-hidden shadow-sm transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full p-4 flex items-center justify-between text-left font-sans text-sm font-semibold text-[#13232F] dark:text-slate-200 hover:text-[#D99A2B] transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#D99A2B] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#52667A] shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 font-sans text-xs sm:text-sm text-[#52667A] dark:text-slate-400 leading-relaxed border-t border-[#EDE5D6] dark:border-[#223446] pt-3 animate-fade-down">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 pt-12 border-t border-[#E2D9C8] dark:border-[#223446] text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <BrandMark size={20} />
          <span className="font-heading font-extrabold text-sm text-[#13232F] dark:text-white">
            Resume<span className="text-[#D99A2B]">Intelligence</span>
          </span>
        </div>
        <p className="text-xs font-mono text-[#52667A] dark:text-slate-500 leading-relaxed max-w-xl mx-auto">
          Quiet Signal · Document Review Workspace · BYOK Architecture
        </p>
        <p className="text-[11px] font-mono text-[#8295A6] dark:text-slate-600">
          Built with Next.js 14 · React 18 · Tailwind CSS · pdfjs-dist · IndexedDB
        </p>
      </footer>

    </div>
  );
}
