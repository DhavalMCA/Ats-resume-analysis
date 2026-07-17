import * as pdfjsLib from 'pdfjs-dist';

// Set up worker src to CDN for pdfjs-dist 3.11.174
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

/**
 * Parses an arrayBuffer or File to extract text lines and canvas images
 */
export async function parsePdfDocument(fileOrBuffer) {
  let arrayBuffer;
  if (fileOrBuffer instanceof File || fileOrBuffer instanceof Blob) {
    arrayBuffer = await fileOrBuffer.arrayBuffer();
  } else {
    arrayBuffer = fileOrBuffer;
  }

  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const pageCount = pdfDoc.numPages;

  const pagesData = [];
  let fullText = '';

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: 1.5 });

    // Render page to offscreen canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    const dataUrl = canvas.toDataURL('image/png');

    // Extract text content & bounding boxes
    const textContent = await page.getTextContent();
    const lineBoxes = extractLineBoxes(textContent.items, viewport);

    const pageText = lineBoxes.map(b => b.text).join('\n');
    fullText += (fullText ? '\n\n' : '') + pageText;

    pagesData.push({
      pageIndex: i - 1,
      width: viewport.width,
      height: viewport.height,
      dataUrl,
      lineBoxes,
    });
  }

  return {
    fullText,
    pages: pagesData,
    pageCount,
  };
}

/**
 * Group pdfjs text items by line Y-coordinate and produce bounding boxes
 */
function extractLineBoxes(items, viewport) {
  if (!items || items.length === 0) return [];

  // Group items by approximate Y coordinate (rounded to 3px tolerance)
  const linesMap = new Map();

  for (const item of items) {
    if (!item.str || !item.str.trim()) continue;

    // Item transform matrix: [scaleX, skewY, skewX, scaleY, translateX, translateY]
    const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
    const x = tx[4];
    const y = tx[5] - (item.height * viewport.scale || 10);
    const width = item.width * viewport.scale;
    const height = (item.height || 10) * viewport.scale;

    const yKey = Math.round(y / 4) * 4;

    if (!linesMap.has(yKey)) {
      linesMap.set(yKey, []);
    }
    linesMap.get(yKey).push({
      str: item.str,
      x,
      y,
      width,
      height,
    });
  }

  const lineBoxes = [];

  for (const [yKey, lineItems] of linesMap.entries()) {
    lineItems.sort((a, b) => a.x - b.x);

    const fullStr = lineItems.map(i => i.str).join(' ');
    const minX = Math.min(...lineItems.map(i => i.x));
    const maxX = Math.max(...lineItems.map(i => i.x + i.width));
    const minY = Math.min(...lineItems.map(i => i.y));
    const maxY = Math.max(...lineItems.map(i => i.y + i.height));

    lineBoxes.push({
      text: fullStr,
      x: minX,
      y: minY,
      width: maxX - minX,
      height: Math.max(12, maxY - minY),
      normalizedText: normalizeText(fullStr),
    });
  }

  // Sort lineBoxes top-to-bottom (ascending y in viewport coords)
  lineBoxes.sort((a, b) => a.y - b.y);

  return lineBoxes;
}

function normalizeText(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Fuzzy-match an AI detected line against line boxes across pages.
 * Overlap threshold: ≥ 70% token match ratio.
 */
export function findMatchingLineBox(detectedText, pagesData) {
  const normTarget = normalizeText(detectedText);
  if (!normTarget) return null;

  const targetTokens = new Set(normTarget.split(' ').filter(Boolean));
  if (targetTokens.size === 0) return null;

  let bestMatch = null;
  let highestScore = 0;

  for (const page of pagesData) {
    for (const box of page.lineBoxes) {
      if (!box.normalizedText) continue;

      const boxTokens = box.normalizedText.split(' ').filter(Boolean);
      if (boxTokens.length === 0) continue;

      let sharedCount = 0;
      for (const token of boxTokens) {
        if (targetTokens.has(token)) {
          sharedCount++;
        }
      }

      // Overlap score relative to target
      const score = sharedCount / Math.max(targetTokens.size, 1);

      // Also check exact substring matches
      const isSub = box.normalizedText.includes(normTarget) || normTarget.includes(box.normalizedText);

      if ((score >= 0.65 || isSub) && score > highestScore) {
        highestScore = score;
        bestMatch = {
          pageIndex: page.pageIndex,
          box,
          score,
        };
      }
    }
  }

  return bestMatch;
}
