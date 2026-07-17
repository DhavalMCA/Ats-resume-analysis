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

