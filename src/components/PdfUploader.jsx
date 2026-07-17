import React, { useState, useRef } from 'react';
import { FileUp, FileText, CheckCircle2, AlertCircle, Trash2, Loader2 } from 'lucide-react';
import { parsePdfDocument } from '../lib/pdfUtils';

export function PdfUploader({ onPdfParsed, parsedPdf, onClearPdf }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (file) => {
    if (!file || file.size === 0) {
      setError('Selected file is empty or invalid.');
      return;
    }

    const hasPdfExtension = file.name.toLowerCase().endsWith('.pdf');
    const hasPdfMime = file.type === 'application/pdf' || file.type === '';

    if (!hasPdfExtension || !hasPdfMime) {
      setError('Please select a valid PDF document (.pdf).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('PDF file size must be less than 10MB.');
      return;
    }

    setError(null);
    setIsParsing(true);

    try {
      const parsedData = await parsePdfDocument(file);
      onPdfParsed({
        file,
        fileName: file.name,
        fileSize: file.size,
        ...parsedData,
      });
    } catch (err) {
      console.error('PDF Parsing Error:', err);
      setError('Failed to parse PDF document locally. Please ensure it is a valid PDF.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className="w-full">
      <label className="block text-xs font-mono font-semibold uppercase tracking-[0.2em] text-slate-400 mb-2">
        1. Upload Resume (PDF)
      </label>

      {parsedPdf ? (
        /* Parsed State Card */
        <div className="p-4 bg-slate-900/90 border border-emerald-500/30 rounded-2xl flex items-center justify-between shadow-lg relative group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-medium text-sm text-white max-w-[200px] sm:max-w-xs truncate">
                  {parsedPdf.fileName}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  Parsed locally · never uploaded
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                {(parsedPdf.fileSize / 1024).toFixed(1)} KB · {parsedPdf.pageCount} {parsedPdf.pageCount === 1 ? 'Page' : 'Pages'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClearPdf}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-all"
            title="Remove PDF"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Dropzone Card */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          data-testid="pdf-dropzone"
          className={`relative cursor-pointer p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center ${
            isDragging
              ? 'border-amber-400 bg-amber-500/10 scale-[1.01]'
              : 'border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900/90'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf,application/pdf"
            onChange={(e) => handleFileChange(e.target.files?.[0])}
            className="hidden"
            data-testid="pdf-file-input"
          />

          {isParsing ? (
            <div className="flex flex-col items-center gap-2 py-4">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
              <p className="text-sm font-mono text-slate-300">Extracting text & page coordinates locally...</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3 shadow-lg shadow-amber-500/5">
                <FileUp className="w-6 h-6" />
              </div>
              <p className="font-heading font-semibold text-sm text-white mb-1">
                Drag and drop your PDF resume here, or <span className="text-amber-400 underline decoration-amber-400/40">browse</span>
              </p>
              <p className="text-xs font-mono text-slate-500">
                PDF format only · Max 10MB · Parsed completely inside your browser
              </p>
            </>
          )}
        </div>
      )}

      {error && (
        <div className="mt-2 text-xs font-mono text-red-400 flex items-center gap-1.5 p-2 bg-red-500/10 border border-red-500/20 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
