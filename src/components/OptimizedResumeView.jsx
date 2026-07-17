import React, { useState, useEffect } from 'react';
import { exportOptimizedResumePdf } from '../lib/pdfExport';
import { 
  Download, Sparkles, FileText, CheckCircle2, User, Mail, Phone, 
  MapPin, Globe, Briefcase, Eye, Check, RefreshCw
} from 'lucide-react';

export function OptimizedResumeView({ originalText, suggestions, fileName }) {
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    location: '',
    website: ''
  });

  const [resumeBody, setResumeBody] = useState('');
  const [showDiffHighlight, setShowDiffHighlight] = useState(true);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const safeSuggestions = Array.isArray(suggestions) ? suggestions : [];

  // 1. Automatically reconstruct optimized text on load
  useEffect(() => {
    if (!originalText) return;
    // Attempt to extract name and basic info from original text
    const lines = originalText.split('\n');
    let inferredName = '';
    let inferredTitle = '';
    let inferredEmail = '';
    let inferredPhone = '';

    // Simple heuristic parser for header info
    for (let i = 0; i < Math.min(lines.length, 10); i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Email check
      if (line.includes('@') && !inferredEmail) {
        const match = line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        if (match) inferredEmail = match[0];
      }
      
      // Phone check
      if ((line.match(/\+?\d[\d-\s()]{7,}\d/) || line.includes('+')) && !inferredPhone) {
        const match = line.match(/\+?[\d-\s()]{8,15}/);
        if (match) inferredPhone = match[0].trim();
      }

      // Name is usually the very first non-empty line of text
      if (!inferredName && line.length > 2 && line.length < 35 && !line.includes('@') && !line.includes('http')) {
        inferredName = line;
      } else if (inferredName && !inferredTitle && line.length > 2 && line.length < 40 && !line.includes('@') && !line.includes('http')) {
        inferredTitle = line;
      }
    }

    setPersonalInfo({
      fullName: inferredName || 'Your Name',
      jobTitle: inferredTitle || 'Target Professional Role',
      email: inferredEmail || 'email@example.com',
      phone: inferredPhone || '(123) 456-7890',
      location: 'City, State',
      website: 'linkedin.com/in/username'
    });

    // Reconstruct body text by applying all suggestions
    let optimizedText = originalText;
    
    // Sort suggestions by length descending to avoid partial matching conflicts
    const sortedSuggestions = [...safeSuggestions].sort((a, b) => {
      const aLen = a?.original?.length || 0;
      const bLen = b?.original?.length || 0;
      return bLen - aLen;
    });
    
    sortedSuggestions.forEach(s => {
      if (s && s.original && s.improved && optimizedText.includes(s.original)) {
        // Use regex with safety escape to replace
        const escapedOriginal = s.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        optimizedText = optimizedText.replace(new RegExp(escapOriginal, 'g'), s.improved);
      }
    });

    // Strip out inferred header lines from main body to avoid duplication
    const bodyLines = optimizedText.split('\n');
    let headerLinesCount = 0;
    
    // Skip first few lines if they match our inferred header info (only if non-empty to avoid matching empty strings)
    for (let i = 0; i < Math.min(bodyLines.length, 8); i++) {
      const line = bodyLines[i].trim();
      if (!line) continue;
      if (
        (inferredName && line === inferredName) || 
        (inferredTitle && line === inferredTitle) || 
        (inferredEmail && line.includes(inferredEmail)) || 
        (inferredPhone && line.includes(inferredPhone))
      ) {
        headerLinesCount = i + 1;
      }
    }
    
    setResumeBody(bodyLines.slice(headerLinesCount).join('\n'));
  }, [originalText, safeSuggestions]);

  const handleDownload = () => {
    exportOptimizedResumePdf({
      fileName,
      personalInfo,
      resumeText: resumeBody
    });
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all edits to the original optimized text?')) {
      let optimizedText = originalText;
      safeSuggestions.forEach(s => {
        if (s && s.original && s.improved) {
          optimizedText = optimizedText.replaceAll(s.original, s.improved);
        }
      });
      setResumeBody(optimizedText);
    }
  };

  // 2. Parse body text into structured elements for the live preview
  const previewLines = resumeBody.split('\n');

  const renderPreviewLine = (line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={idx} className="h-2" />;

    // Render Section Header
    if (trimmed.startsWith('#') || (
      trimmed.toUpperCase() === trimmed && 
      trimmed.length > 3 && 
      !trimmed.startsWith('-') && 
      !trimmed.startsWith('•')
    )) {
      const headerText = trimmed.replace(/^#\s*/, '').trim();
      return (
        <div key={idx} className="mt-4 mb-2 first:mt-0">
          <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900">
            {headerText}
          </h4>
          <div className="h-[1px] bg-slate-300 w-full mt-1" />
        </div>
      );
    }

    // Render Bullet Points
    if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*')) {
      const bulletContent = trimmed.replace(/^[-•*]\s*/, '').trim();
      
      // Heuristic: check if this bullet has been rewritten
      let isRewritten = false;
      if (showDiffHighlight) {
        isRewritten = safeSuggestions.some(s => s && s.improved && bulletContent.includes(s.improved));
      }

      return (
        <div key={idx} className="pl-4 relative py-0.5 text-[9.5px] leading-relaxed text-slate-700 font-sans flex items-start gap-1">
          <span className="absolute left-1.5 top-1.5 w-1 h-1 rounded-full bg-slate-800 shrink-0" />
          <span className={isRewritten ? 'bg-emerald-500/15 border-l-2 border-emerald-500 pl-1.5 py-0.5 rounded-r-md text-slate-800 font-medium' : ''}>
            {bulletContent}
          </span>
        </div>
      );
    }

    // Render Standard Line
    return (
      <p key={idx} className="text-[9.5px] leading-relaxed text-slate-700 font-sans mb-1.5">
        {trimmed}
      </p>
    );
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[750px] animate-fade-up">
      
      {/* Exporter Toolbar */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-heading font-extrabold text-sm text-white">ATS-Optimized Workspace</span>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
              PRINT READY
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Apply edits, format, and download an ATS-compatible single-column PDF
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Highlight Rewrites Toggle */}
          <button
            type="button"
            onClick={() => setShowDiffHighlight(!showDiffHighlight)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border transition-all ${
              showDiffHighlight
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Highlight lines containing AI improvements"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Show Diff Highlights</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            data-testid="download-optimized-resume-btn"
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-heading font-extrabold text-sm rounded-xl hover:from-amber-400 hover:to-amber-300 transition-all shadow-lg shadow-amber-500/10"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4 shrink-0" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 shrink-0" />
                <span>Download ATS PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor & Preview Side-by-Side Workspace */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        
        {/* LEFT COLUMN: Input & Body Editor (50%) */}
        <div className="w-full md:w-1/2 border-r border-slate-800/80 flex flex-col min-h-0 bg-slate-900/40">
          
          {/* Personal Info Grid */}
          <div className="p-4 border-b border-slate-800 bg-slate-900/60 grid grid-cols-2 gap-3 shrink-0">
            <div className="relative">
              <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Full Name"
                value={personalInfo.fullName}
                onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 transition-colors placeholder-slate-600 font-mono"
              />
            </div>
            
            <div className="relative">
              <Briefcase className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Job Title"
                value={personalInfo.jobTitle}
                onChange={(e) => setPersonalInfo({ ...personalInfo, jobTitle: e.target.value })}
                className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 transition-colors placeholder-slate-600 font-mono"
              />
            </div>

            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="Email"
                value={personalInfo.email}
                onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 transition-colors placeholder-slate-600 font-mono"
              />
            </div>

            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Phone"
                value={personalInfo.phone}
                onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 transition-colors placeholder-slate-600 font-mono"
              />
            </div>

            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Location"
                value={personalInfo.location}
                onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 transition-colors placeholder-slate-600 font-mono"
              />
            </div>

            <div className="relative">
              <Globe className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Website / LinkedIn"
                value={personalInfo.website}
                onChange={(e) => setPersonalInfo({ ...personalInfo, website: e.target.value })}
                className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 transition-colors placeholder-slate-600 font-mono"
              />
            </div>
          </div>

          {/* Main Body Area */}
          <div className="flex-1 flex flex-col p-4 space-y-2 min-h-0">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Resume Text Body (Markdown headers & bullet support)</span>
              <button
                type="button"
                onClick={handleReset}
                className="hover:text-amber-400 flex items-center gap-1.5 transition-colors"
                title="Discard edits"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
            
            <textarea
              value={resumeBody}
              onChange={(e) => setResumeBody(e.target.value)}
              placeholder="Structure your resume here. Use ALL CAPS or # for sections, and hyphens (-) or asterisks (*) for bullet points."
              className="flex-1 w-full p-4 bg-slate-950 border border-slate-850 rounded-2xl text-xs font-mono text-slate-300 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/40 resize-none overflow-y-auto leading-relaxed custom-scrollbar"
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Print Layout Live Preview (50%) */}
        <div className="w-full md:w-1/2 p-6 overflow-y-auto bg-slate-950 flex justify-center items-start custom-scrollbar">
          
          {/* Visual Paper Sheet */}
          <div className="bg-white shadow-2xl rounded-sm w-full max-w-[500px] aspect-[1/1.414] border border-slate-200 p-8 text-slate-800 relative selection:bg-amber-100 flex flex-col select-none">
            
            {/* Margins Guideline (subtle edge dashed lines) */}
            <div className="absolute inset-4 border border-dashed border-slate-100 pointer-events-none rounded-sm" />
            
            {/* Header info */}
            <div className="text-center space-y-1.5 z-10 shrink-0">
              <h3 className="font-sans font-bold text-lg text-slate-900 tracking-tight leading-none">
                {personalInfo.fullName || 'Your Name'}
              </h3>
              
              {personalInfo.jobTitle && (
                <p className="font-sans text-[10px] font-medium text-slate-500 tracking-wide">
                  {personalInfo.jobTitle}
                </p>
              )}
              
              <div className="text-[7.5px] text-slate-400 flex flex-wrap justify-center gap-x-2 gap-y-0.5 pt-0.5 leading-none">
                {personalInfo.email && <span>{personalInfo.email}</span>}
                {personalInfo.phone && <span>• {personalInfo.phone}</span>}
                {personalInfo.location && <span>• {personalInfo.location}</span>}
                {personalInfo.website && <span>• {personalInfo.website}</span>}
              </div>
              
              <div className="h-[1px] bg-slate-200 w-full pt-1" />
            </div>

            {/* Resume Main Body preview */}
            <div className="mt-4 flex-1 overflow-hidden z-10 space-y-1">
              {previewLines.map((line, idx) => renderPreviewLine(line, idx))}
            </div>

            {/* PDF print watermark warning */}
            <div className="absolute bottom-2 right-4 text-[7px] font-mono text-slate-300 pointer-events-none">
              A4/Letter Printable Grid System
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
