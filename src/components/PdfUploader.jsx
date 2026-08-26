import React, { useState, useRef } from 'react';
import { parsePdfDocument } from '../lib/pdfUtils';
import { BrandMark } from './BrandMark';
import { 
  FileUp, FileText, CheckCircle2, AlertCircle, Trash2, Loader2, RefreshCw
} from 'lucide-react';

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
      setError('Please select a valid PDF document (.pdf). Unsupported file format.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('PDF file size exceeds 10MB limit. Please upload a smaller PDF file.');
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
      setError('Failed to parse PDF document locally. Please ensure it is a valid, unencrypted PDF.');
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
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#13232F] dark:text-slate-200">
          Step 1: Resume Document
        </label>
        {parsedPdf && (
          <span className="text-[11px] font-mono text-[#3B7A57] dark:text-[#4E9A70] flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Ready for review
          </span>
        )}
      </div>

      {parsedPdf ? (
        /* Parsed State Card — Paper Card */
        <div className="p-4 bg-[#FFFDF8] dark:bg-[#162432] border border-[#A8D0B5] dark:border-[#245037] rounded-2xl flex items-center justify-between shadow-sm relative group">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#EBF4EE] dark:bg-[#13261C] border border-[#A8D0B5] dark:border-[#245037] flex items-center justify-center text-[#3B7A57] dark:text-[#4E9A70] shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-heading font-bold text-sm text-[#13232F] dark:text-white truncate max-w-xs sm:max-w-md">
                  {parsedPdf.fileName}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-semibold bg-[#EBF4EE] dark:bg-[#13261C] text-[#3B7A57] dark:text-[#4E9A70] rounded-full border border-[#A8D0B5] dark:border-[#245037]">
                  <CheckCircle2 className="w-3 h-3" />
                  Parsed locally · Zero upload
                </span>
              </div>
              <p className="text-[11px] font-mono text-[#52667A] dark:text-slate-400 mt-0.5">
                {(parsedPdf.fileSize / 1024).toFixed(1)} KB · {parsedPdf.pageCount} {parsedPdf.pageCount === 1 ? 'Page' : 'Pages'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-[#52667A] dark:text-slate-400 hover:text-[#D99A2B] hover:bg-[#F6F2EA] dark:hover:bg-[#1C2D3E] rounded-xl transition-all"
              title="Replace PDF resume"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClearPdf}
              className="p-2 text-[#52667A] dark:text-slate-400 hover:text-[#B85242] hover:bg-[#FBF0EE] dark:hover:bg-[#2A1715] rounded-xl transition-all"
              title="Remove PDF resume"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Dropzone Card — Paper Dropzone */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          data-testid="pdf-dropzone"
          className={`relative cursor-pointer p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center ${
            isDragging
              ? 'border-[#D99A2B] bg-[#FAF3E5] dark:bg-[#272216] scale-[1.01]'
              : 'border-[#E2D9C8] dark:border-[#223446] hover:border-[#D99A2B] bg-[#FFFDF8] dark:bg-[#162432] hover:bg-[#F6F2EA]/60 dark:hover:bg-[#1C2D3E]/60 shadow-sm'
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
            <div className="flex flex-col items-center gap-2.5 py-4">
              <Loader2 className="w-8 h-8 text-[#D99A2B] animate-spin" />
              <p className="text-xs font-mono text-[#13232F] dark:text-slate-200">
                Reading PDF structure & page bounding coordinates locally…
              </p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-[#FAF3E5] dark:bg-[#272216] border border-[#E8C98F] dark:border-[#5C4722] flex items-center justify-center text-[#D99A2B] mb-3 shadow-sm">
                <BrandMark size={24} />
              </div>
              <p className="font-heading font-semibold text-sm text-[#13232F] dark:text-white mb-1">
                Drop your resume here, or <span className="text-[#D99A2B] underline decoration-[#D99A2B]/40">browse for a PDF</span>
              </p>
              <p className="text-xs font-mono text-[#52667A] dark:text-slate-400">
                PDF format only · Maximum 10MB · Parsed 100% inside your browser
              </p>
            </>
          )}
        </div>
      )}

      {error && (
        <div className="text-xs font-mono text-[#B85242] dark:text-[#D96957] flex items-center gap-2 p-3 bg-[#FBF0EE] dark:bg-[#2A1715] border border-[#E8B8B0] dark:border-[#592922] rounded-xl animate-fade-down">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
