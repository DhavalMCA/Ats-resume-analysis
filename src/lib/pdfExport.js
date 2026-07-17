import { jsPDF } from 'jspdf';

export function exportAnalysisReport({ fileName, result, jobDescription }) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(245, 158, 11); // Amber
  doc.text('Resume ATS Analysis & Authenticity Audit', 14, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text(`Target File: ${fileName || 'Resume.pdf'} | Generated: ${new Date().toLocaleDateString()}`, 14, y);
  y += 12;

  doc.setLineWidth(0.5);
  doc.setDrawColor(220, 220, 220);
  doc.line(14, y, pageWidth - 14, y);
  y += 12;

  // Key Metrics Banner
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text('Key Scores & Assessment', 14, y);
  y += 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129); // Emerald
  doc.text(`Initial ATS Score: ${result.ats_score_before}/100`, 14, y);
  doc.text(`Target Improved Score: ${result.ats_score_after}/100`, 85, y);
  doc.text(`Authenticity Index: ${result.authenticity_score}/100`, 160, y);
  y += 12;

  // HR Verdict Card
  if (result.hr_perspective) {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, y, pageWidth - 28, 28, 3, 3, 'F');

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(`Recruiter Verdict: ${result.hr_perspective.verdict?.toUpperCase() || 'EVALUATED'}`, 18, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    const firstImp = result.hr_perspective.first_impression || result.verdict_summary || '';
    const splitImp = doc.splitTextToSize(firstImp, pageWidth - 36);
    doc.text(splitImp, 18, y + 16);
    y += 34;
  }

  // Missing Keywords Section
  if (result.ats_missing_keywords && result.ats_missing_keywords.length > 0) {
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('Top Missing ATS Keywords:', 14, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(180, 83, 9); // Amber text
    const kwText = result.ats_missing_keywords.join(', ');
    const splitKw = doc.splitTextToSize(kwText, pageWidth - 28);
    doc.text(splitKw, 14, y);
    y += splitKw.length * 5 + 6;
  }

  // Required Rewrites
  const requiredList = (result.suggestions || []).filter(s => s.priority === 'required' || !s.priority);
  const optionalList = (result.suggestions || []).filter(s => s.priority === 'optional');

  if (requiredList.length > 0) {
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(185, 28, 28); // Red-ish header for high priority
    doc.text('Required Strategic Rewrites', 14, y);
    y += 8;

    for (let i = 0; i < requiredList.length; i++) {
      const s = requiredList[i];
      checkPageBreak(40);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text(`#${i + 1} Original (+${s.impact_points || 5} pts):`, 14, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      const splitOrig = doc.splitTextToSize(`"${s.original}"`, pageWidth - 32);
      doc.text(splitOrig, 18, y);
      y += splitOrig.length * 4.5 + 2;

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129); // Emerald
      doc.text('Improved Wording:', 14, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      const splitImp = doc.splitTextToSize(`"${s.improved}"`, pageWidth - 32);
      doc.text(splitImp, 18, y);
      y += splitImp.length * 4.5 + 2;

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`Rationale: ${s.reason}`, 18, y);
      y += 8;
    }
  }

  // Optional Polish Rewrites
  if (optionalList.length > 0) {
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text('Optional Fine-Tuning Polish', 14, y);
    y += 8;

    for (let i = 0; i < optionalList.length; i++) {
      const s = optionalList[i];
      checkPageBreak(30);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Optional #${i + 1}: ${s.improved}`, 14, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`Reason: ${s.reason}`, 18, y);
      y += 7;
    }
  }

  function checkPageBreak(neededHeight) {
    if (y + neededHeight > doc.internal.pageSize.getHeight() - 15) {
      doc.addPage();
      y = 20;
    }
  }

  doc.save(`ATS_Analysis_${fileName ? fileName.replace(/\.[^/.]+$/, "") : "Resume"}.pdf`);
}

export function exportChangesPdf({ fileName, result }) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  const suggestions = result?.suggestions || [];
  const requiredList = suggestions.filter(s => s.priority === 'required' || !s.priority);
  const optionalList = suggestions.filter(s => s.priority === 'optional');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(245, 158, 11); // Amber
  doc.text('Resume Changes & Bullet Rewrites', 14, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text(`Target File: ${fileName || 'Resume.pdf'} | Total Suggestions: ${suggestions.length} | Exported: ${new Date().toLocaleDateString()}`, 14, y);
  y += 10;

  doc.setLineWidth(0.5);
  doc.setDrawColor(220, 220, 220);
  doc.line(14, y, pageWidth - 14, y);
  y += 12;

  // Impact Summary
  if (result?.ats_score_before !== undefined && result?.ats_score_after !== undefined) {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, y, pageWidth - 28, 18, 3, 3, 'F');

    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(`ATS Score Improvement: ${result.ats_score_before} -> ${result.ats_score_after} pts (+${result.ats_score_after - result.ats_score_before} pts)`, 18, y + 11);
    y += 24;
  }

  // Required Priority Rewrites
  if (requiredList.length > 0) {
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(220, 38, 38);
    doc.text(`Priority Strategic Rewrites (${requiredList.length})`, 14, y);
    y += 8;

    requiredList.forEach((s, idx) => {
      checkPageBreak(45);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text(`#${idx + 1} Original (+${s.impact_points || 5} pts impact):`, 14, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      const splitOrig = doc.splitTextToSize(`"${s.original}"`, pageWidth - 32);
      doc.text(splitOrig, 18, y);
      y += splitOrig.length * 4.5 + 3;

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129); // Emerald
      doc.text('Improved Bullet:', 14, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      const splitImp = doc.splitTextToSize(`"${s.improved}"`, pageWidth - 32);
      doc.text(splitImp, 18, y);
      y += splitImp.length * 4.5 + 3;

      if (s.reason) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(148, 163, 184);
        const splitReason = doc.splitTextToSize(`Reason: ${s.reason}`, pageWidth - 32);
        doc.text(splitReason, 18, y);
        y += splitReason.length * 4 + 4;
      }

      y += 4;
    });
  }

  // Optional Polish Rewrites
  if (optionalList.length > 0) {
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text(`Optional Fine-Tuning Polish (${optionalList.length})`, 14, y);
    y += 8;

    optionalList.forEach((s, idx) => {
      checkPageBreak(35);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Optional #${idx + 1}:`, 14, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      const splitImp = doc.splitTextToSize(`"${s.improved}"`, pageWidth - 32);
      doc.text(splitImp, 18, y);
      y += splitImp.length * 4.5 + 2;

      if (s.reason) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(148, 163, 184);
        const splitReason = doc.splitTextToSize(`Reason: ${s.reason}`, pageWidth - 32);
        doc.text(splitReason, 18, y);
        y += splitReason.length * 4 + 4;
      }
      y += 4;
    });
  }

  function checkPageBreak(neededHeight) {
    if (y + neededHeight > doc.internal.pageSize.getHeight() - 15) {
      doc.addPage();
      y = 20;
    }
  }

  doc.save(`Resume_Changes_${fileName ? fileName.replace(/\.[^/.]+$/, "") : "Rewrites"}.pdf`);
}

export function exportOptimizedResumePdf({ fileName, personalInfo, resumeText }) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18; // Standard 0.7-inch margins
  const contentWidth = pageWidth - 2 * margin;
  let y = 18;

  // 1. Header (Name and contact details)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // slate-900
  
  const name = personalInfo.fullName?.trim() || 'Resume Candidate';
  const nameWidth = doc.getTextWidth(name);
  doc.text(name, (pageWidth - nameWidth) / 2, y);
  y += 6;

  // Job Title if present
  if (personalInfo.jobTitle?.trim()) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105); // slate-600
    const title = personalInfo.jobTitle.trim();
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, y);
    y += 5;
  }

  // Contact details
  const contacts = [];
  if (personalInfo.email?.trim()) contacts.push(personalInfo.email.trim());
  if (personalInfo.phone?.trim()) contacts.push(personalInfo.phone.trim());
  if (personalInfo.location?.trim()) contacts.push(personalInfo.location.trim());
  if (personalInfo.website?.trim()) contacts.push(personalInfo.website.trim());

  if (contacts.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // slate-500
    const contactText = contacts.join('   |   ');
    const contactWidth = doc.getTextWidth(contactText);
    doc.text(contactText, (pageWidth - contactWidth) / 2, y);
    y += 8;
  }

  // Thin line below contact info
  doc.setLineWidth(0.3);
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // 2. Parse and render body text line-by-line
  const lines = (resumeText || '').split('\n');
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59); // slate-800
  
  const isSectionHeader = (line) => {
    const trimmed = line.trim();
    if (!trimmed) return false;
    // Starts with #
    if (trimmed.startsWith('#')) return true;
    
    // Check if it's all uppercase and one of the standard section names
    const cleanStr = trimmed.toUpperCase().replace(/[^A-Z\s]/g, '').trim();
    const standardHeaders = [
      'EXPERIENCE', 'WORK EXPERIENCE', 'EDUCATION', 'SUMMARY', 
      'PROFESSIONAL SUMMARY', 'SKILLS', 'TECHNICAL SKILLS', 
      'PROJECTS', 'CERTIFICATIONS', 'PUBLICATIONS', 'LANGUAGES',
      'SUMMARY OF QUALIFICATIONS', 'ORGANIZATIONS', 'AWARDS'
    ];
    return standardHeaders.some(h => cleanStr === h || cleanStr.startsWith(h + ' '));
  };

  const isBulletPoint = (line) => {
    const trimmed = line.trim();
    return trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*');
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) {
      y += 2.5; // empty space
      continue;
    }

    if (isSectionHeader(line)) {
      // Clean section header name
      const headerName = trimmed.replace(/^#\s*/, '').trim();
      
      checkPageBreak(20);
      y += 3; // space before section
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text(headerName, margin, y);
      
      // Draw horizontal underline
      y += 2;
      doc.setLineWidth(0.4);
      doc.setDrawColor(148, 163, 184); // slate-400
      doc.line(margin, y, pageWidth - margin, y);
      y += 5.5;
      
    } else if (isBulletPoint(line)) {
      // Bullet point bullet
      const cleanBulletText = trimmed.replace(/^[-•*]\s*/, '').trim();
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59); // slate-800

      // Split text into wrapped lines
      // We indent bullets by 4mm and print text at 8mm
      const indentTextX = margin + 5;
      const bulletWidth = contentWidth - 5;
      const wrappedLines = doc.splitTextToSize(cleanBulletText, bulletWidth);
      
      checkPageBreak(wrappedLines.length * 4.5);
      
      // Draw bullet circle
      doc.setFont('helvetica', 'bold');
      doc.text('•', margin + 1, y);
      
      doc.setFont('helvetica', 'normal');
      for (let j = 0; j < wrappedLines.length; j++) {
        doc.text(wrappedLines[j], indentTextX, y);
        if (j < wrappedLines.length - 1) {
          y += 4.5;
        }
      }
      y += 5; // space between bullets
      
    } else {
      // Standard line
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59); // slate-800
      
      const wrappedLines = doc.splitTextToSize(trimmed, contentWidth);
      checkPageBreak(wrappedLines.length * 4.5);
      
      for (let j = 0; j < wrappedLines.length; j++) {
        doc.text(wrappedLines[j], margin, y);
        if (j < wrappedLines.length - 1) {
          y += 4.5;
        }
      }
      y += 5;
    }
  }

  function checkPageBreak(neededHeight) {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  }

  const cleanFileName = fileName ? fileName.replace(/\.[^/.]+$/, "") : "Optimized_Resume";
  doc.save(`${cleanFileName}_Optimized.pdf`);
}

export function exportOptimizedResumeDirect({ fileName, resumeText, suggestions }) {
  const safeSuggestions = Array.isArray(suggestions) ? suggestions : [];
  const lines = (resumeText || '').split('\n');
  
  let inferredName = '';
  let inferredTitle = '';
  let inferredEmail = '';
  let inferredPhone = '';

  // Extract basic details from top of resume
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    if (line.includes('@') && !inferredEmail) {
      const match = line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (match) inferredEmail = match[0];
    }
    
    if ((line.match(/\+?\d[\d-\s()]{7,}\d/) || line.includes('+')) && !inferredPhone) {
      const match = line.match(/\+?[\d-\s()]{8,15}/);
      if (match) inferredPhone = match[0].trim();
    }

    if (!inferredName && line.length > 2 && line.length < 35 && !line.includes('@') && !line.includes('http')) {
      inferredName = line;
    } else if (inferredName && !inferredTitle && line.length > 2 && line.length < 40 && !line.includes('@') && !line.includes('http')) {
      inferredTitle = line;
    }
  }

  // Reconstruct body text by applying all suggestions
  let optimizedText = resumeText || '';
  
  // Sort suggestions by length descending to avoid partial matching conflicts
  const sortedSuggestions = [...safeSuggestions].sort((a, b) => {
    const aLen = a?.original?.length || 0;
    const bLen = b?.original?.length || 0;
    return bLen - aLen;
  });
  
  sortedSuggestions.forEach(s => {
    if (s && s.original && s.improved && optimizedText.includes(s.original)) {
      const escapedOriginal = s.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      optimizedText = optimizedText.replace(new RegExp(escapOriginal, 'g'), s.improved);
    }
  });

  // Strip inferred headers from body lines to avoid duplicate headers in the clean PDF
  const bodyLines = optimizedText.split('\n');
  let headerLinesCount = 0;
  
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

  const finalBody = bodyLines.slice(headerLinesCount).join('\n');

  // Trigger print-ready PDF export
  exportOptimizedResumePdf({
    fileName,
    personalInfo: {
      fullName: inferredName || 'Resume Candidate',
      jobTitle: inferredTitle || 'Target Professional',
      email: inferredEmail || '',
      phone: inferredPhone || '',
      location: 'City, State',
      website: ''
    },
    resumeText: finalBody
  });
}



