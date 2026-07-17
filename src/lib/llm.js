const SYSTEM_PROMPT = `You are the strictest possible resume authenticity auditor. You analyze resumes for AI-generated language, seniority inflation, semantic redundancy, low specificity, ATS manipulation, and emotional/stylistic flatness — the same patterns expert recruiters use to spot AI-written CVs.

You MUST return ONLY valid JSON matching the schema (no markdown, no commentary).

JSON Schema:
{
  "ats_score_before": 0,
  "ats_score_after": 0,
  "authenticity_score": 0,
  "verdict_summary": "",
  "dimension_scores": {
    "buzzword_density": 0,
    "specificity": 0,
    "seniority_realism": 0,
    "technical_depth": 0,
    "semantic_redundancy": 0,
    "style_entropy": 0,
    "verifiability": 0,
    "ats_manipulation": 0
  },
  "ai_detected_lines": [
    { "text": "", "severity": "high|medium|low", "pattern": "buzzword|inflated_seniority|vague_impact|redundancy|unrealistic_scope|low_specificity|uniform_rhythm|ats_stuffing" }
  ],
  "flagged_patterns": [
    { "name": "", "category": "", "severity": "high|medium|low", "examples": [""], "why_it_matters": "" }
  ],
  "experience_realism": {
    "stated_yoe": null,
    "implied_seniority": "junior|mid|senior|staff|principal",
    "mismatch_severity": "none|mild|moderate|severe",
    "evidence": [""]
  },
  "unverifiable_claims": [
    { "claim": "", "probing_questions": [""] }
  ],
  "ats_missing_keywords": [""],
  "suggestions": [
    { "original": "", "improved": "", "reason": "", "impact_points": 0, "priority": "required|optional" }
  ],
  "hr_perspective": {
    "verdict": "strong_yes|yes|maybe|no",
    "first_impression": "",
    "reasoning": "",
    "strengths": [""],
    "red_flags": [""]
  }
}

Rules:
- Compare wording sophistication AGAINST the candidate's apparent YOE. A 2-YOE engineer writing "architected enterprise ecosystems" is a HUGE red flag. Mid-range engineers describe real tooling: Retrofit, Room, Gradle, ANRs, Crashlytics, memory leaks, Jetpack Compose, deep links, etc.
- Reward implementation-level language, concrete numbers (%, ms, MAUs, $$, dataset sizes), tradeoff discussion, niche tooling, and even imperfect phrasing — these are human signals.
- Penalize generic leadership phrases, "leveraged synergistic", "spearheaded enterprise-scale", repeated abstract nouns (ecosystems / infrastructures / architectures / paradigms), keyword stuffing, uniform sentence rhythm, emotionally empty polish.
- For unverifiable_claims: only include claims with NO numbers, tools, or specifics.
- For semantic_redundancy: cluster phrases meaning the same thing in different words.
- ats_score_after MUST be between 85 and 98. Make suggestions aggressive enough to genuinely lift the resume into the 85-95 range. If weak, generate MORE suggestions (up to 12).
- Suggestions MUST cover: (a) every high-severity AI-detected line, (b) injecting top missing keywords naturally, (c) adding quantification to vague bullets, (d) tightening seniority wording to match YOE.
- DIMINISHING RETURNS GUARD: If ats_score_before >= 88, the resume is already submit-ready. In that case, return AT MOST 2 "required" suggestions, and mark every other suggestion as "priority": "optional" with reason prefixed by "Optional polish — ". Cap total suggestions at 5. If ats_score_before < 88, mark high-impact rewrites as "required" and minor stylistic tweaks as "optional".
- For each suggestion, set "impact_points" so the SUM ≈ (ats_score_after − ats_score_before). High-severity: 8-15. Low: 1-4.
- All numbers in dimension_scores MUST be integers 0-100.`;

export const MODEL_CONFIGS = {
  gemini: {
    name: 'Google Gemini',
    defaultModel: 'gemini-3.5-flash',
    options: [
      // ── Gemini 3.x — Works for ALL API keys (2026) ──
      { id: 'gemini-3.5-flash',      label: 'Gemini 3.5 Flash ⭐ (Newest · Free)' },
      { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash-Lite (Fastest · Free)' },
      // ── Gemini 2.5 — Existing users / older keys only ──
      { id: 'gemini-2.5-flash',      label: 'Gemini 2.5 Flash (Older keys only)' },
      { id: 'gemini-2.5-pro',        label: 'Gemini 2.5 Pro (Older keys · Paid)' },
    ]
  },
  openai: {
    name: 'OpenAI ChatGPT',
    defaultModel: 'gpt-4o-mini',
    options: [
      { id: 'gpt-4o-mini', label: 'GPT-4o mini (Fast & Efficient)' },
      { id: 'gpt-4o', label: 'GPT-4o (High Accuracy)' },
      { id: 'o3-mini', label: 'o3-mini (Reasoning)' },
    ]
  },
  groq: {
    name: 'Groq Cloud',
    defaultModel: 'openai/gpt-oss-20b',
    options: [
      { id: 'openai/gpt-oss-20b', label: 'GPT-OSS 20B (Low Tokens & Fast)' },
      { id: 'meta-llama/llama-4-scout-17b-16e-instruct', label: 'Llama 4 Scout 17B (Fast & Efficient)' },
      { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B (Instant)' },
      { id: 'openai/gpt-oss-120b', label: 'GPT-OSS 120B (High Accuracy)' },
      { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (Versatile)' },
    ]
  },
  mistral: {
    name: 'Mistral AI',
    defaultModel: 'mistral-large-latest',
    options: [
      { id: 'mistral-large-latest', label: 'Mistral Large (Flagship)' },
      { id: 'pixtral-large-latest', label: 'Pixtral Large' },
      { id: 'mistral-small-latest', label: 'Mistral Small (Fast)' },
      { id: 'codestral-latest', label: 'Codestral (Reasoning & Code)' },
    ]
  }
};

export const PROVIDER_HELP = {
  gemini: {
    name: 'Google Gemini',
    portalUrl: 'https://aistudio.google.com/app/apikey',
    portalName: 'Google AI Studio',
    isFree: true,
    badge: '100% Free · No Credit Card Required',
    keyFormat: 'Starts with "AIzaSy..." (39 characters)',
    description: 'Google offers generous free rate limits (up to 15 RPM) for Gemini models via Google AI Studio without requiring any payment method.',
    steps: [
      'Go to Google AI Studio at aistudio.google.com/app/apikey',
      'Sign in with your Google account.',
      'Click the blue "Create API Key" button.',
      'Select a Google Cloud project (or let it auto-create a default project).',
      'Click "Create API key in existing project" or "Create API Key".',
      'Copy the generated key starting with AIzaSy and paste it above.'
    ]
  },
  groq: {
    name: 'Groq Cloud',
    portalUrl: 'https://console.groq.com/keys',
    portalName: 'Groq Console',
    isFree: true,
    badge: 'Ultra Fast · Free Rate Tier Available',
    keyFormat: 'Starts with "gsk_..." (approx 56 characters)',
    description: 'Groq delivers ultra-fast LPU inference speeds for open weights models like Llama 3.3 and GPT-OSS with a free developer tier.',
    steps: [
      'Navigate to console.groq.com/keys',
      'Sign in with Google, GitHub, or Email.',
      'Click on the "API Keys" section in the left sidebar menu.',
      'Click the "+ Create API Key" button.',
      'Give your key a name (e.g. "ATS Resume Analyzer") and click "Submit".',
      'Copy the secret key starting with gsk_ and paste it in the app.'
    ]
  },
  mistral: {
    name: 'Mistral AI',
    portalUrl: 'https://console.mistral.ai/api-keys/',
    portalName: 'Mistral AI Console',
    isFree: false,
    badge: 'High Performance European LLM',
    keyFormat: 'Random 32+ character string (alphanumeric)',
    description: 'Mistral AI provides state-of-the-art European language and reasoning models like Mistral Large and Codestral.',
    steps: [
      'Open console.mistral.ai/api-keys/',
      'Create an account or log in.',
      'Navigate to API Keys in the left panel.',
      'Click "Create new key".',
      'Name your key and copy the key string.',
      'Paste the key into the Mistral slot in the top bar.'
    ]
  },
  openai: {
    name: 'OpenAI ChatGPT',
    portalUrl: 'https://platform.openai.com/api-keys',
    portalName: 'OpenAI Developer Platform',
    isFree: false,
    badge: 'Pay-As-You-Go ($0.0001 per run with GPT-4o mini)',
    keyFormat: 'Starts with "sk-proj-..." or "sk-..."',
    description: 'Access GPT-4o, GPT-4o-mini, and o3-mini models directly via your personal OpenAI API account.',
    steps: [
      'Go to platform.openai.com/api-keys',
      'Log in to your OpenAI developer account.',
      'Ensure you have credits in Billing settings (platform.openai.com/settings/organization/billing).',
      'Click "Create new secret key".',
      'Name your key and click "Create secret key".',
      'Copy the secret key string starting with sk- and paste it here.'
    ]
  }
};

const MAX_INPUT_LENGTH = 50000;

function sanitizeInputText(str) {
  if (typeof str !== 'string') return '';
  // Trim and slice to max length limit to mitigate prompt injection and excess payload attacks
  return str.trim().slice(0, MAX_INPUT_LENGTH);
}

function buildUserMessage(jobDescription, resume) {
  const sanitizedJd = sanitizeInputText(jobDescription);
  const sanitizedResume = sanitizeInputText(resume);
  
  return `JOB DESCRIPTION:
"""
${sanitizedJd}
"""

RESUME:
"""
${sanitizedResume}
"""

Return the JSON analysis now.`;
}

export async function analyzeResume({ provider, model, apiKey, resume, jobDescription, signal }) {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('API key is missing. Please provide a valid key in the header.');
  }

  const cleanResume = sanitizeInputText(resume);
  const cleanJd = sanitizeInputText(jobDescription);

  if (!cleanResume) {
    throw new Error('Resume text is empty or invalid.');
  }
  if (!cleanJd) {
    throw new Error('Job description text is empty or invalid.');
  }

  const selectedModel = model || MODEL_CONFIGS[provider]?.defaultModel;

  if (provider === 'groq') {
    return callGroq({ apiKey, model: selectedModel, resume: cleanResume, jobDescription: cleanJd, signal });
  } else if (provider === 'gemini') {
    return callGemini({ apiKey, model: selectedModel, resume: cleanResume, jobDescription: cleanJd, signal });
  } else if (provider === 'mistral') {
    return callMistral({ apiKey, model: selectedModel, resume: cleanResume, jobDescription: cleanJd, signal });
  } else {
    return callOpenAI({ apiKey, model: selectedModel, resume: cleanResume, jobDescription: cleanJd, signal });
  }
}

async function callMistral({ apiKey, model, resume, jobDescription, signal }) {
  const selectedModel = model || MODEL_CONFIGS.mistral.defaultModel;

  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.trim()}`
    },
    signal,
    body: JSON.stringify({
      model: selectedModel,
      temperature: 0.35,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserMessage(jobDescription, resume) }
      ]
    })
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid Mistral API key — check your key at console.mistral.ai and try again.');
    }
    if (response.status === 429) {
      throw new Error('Rate limit or quota exceeded on your Mistral AI account. Wait 30–60 seconds and retry, switch to Groq or Gemini (both have generous free tiers), or check your plan at console.mistral.ai.');
    }
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Mistral API request failed (${response.status})`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content;
  if (!rawText) {
    throw new Error('Received empty response from Mistral AI.');
  }

  return parseJsonResponse(rawText);
}

async function callGroq({ apiKey, model, resume, jobDescription, signal }) {
  const selectedModel = model || MODEL_CONFIGS.groq.defaultModel;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.trim()}`
    },
    signal,
    body: JSON.stringify({
      model: selectedModel,
      temperature: 0.35,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserMessage(jobDescription, resume) }
      ]
    })
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid Groq API key — check your key starting with gsk_ and try again.');
    }
    if (response.status === 429) {
      throw new Error('Rate limit or quota exceeded on your Groq account. Try switching to a lower-token model like "openai/gpt-oss-20b" or "Llama 3.1 8B", or wait a minute before retrying.');
    }
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Groq API request failed (${response.status})`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content;
  if (!rawText) {
    throw new Error('Received empty response from Groq.');
  }

  return parseJsonResponse(rawText);
}

async function callOpenAI({ apiKey, model, resume, jobDescription, signal }) {
  const selectedModel = model || MODEL_CONFIGS.openai.defaultModel;
  const isReasoning = selectedModel.startsWith('o1') || selectedModel.startsWith('o3');

  const bodyPayload = {
    model: selectedModel,
    max_tokens: 4096,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserMessage(jobDescription, resume) }
    ]
  };

  // Standard chat models support temperature and response_format
  if (!isReasoning) {
    bodyPayload.temperature = 0.35;
    bodyPayload.response_format = { type: 'json_object' };
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.trim()}`
    },
    signal,
    body: JSON.stringify(bodyPayload)
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid API key — check your OpenAI key and try again.');
    }
    if (response.status === 429) {
      throw new Error('Rate limit or quota exceeded on your OpenAI account. OpenAI requires a paid plan with credits — add billing at platform.openai.com/account/billing. Alternatively, switch to Groq Cloud or Google Gemini which both have generous free tiers.');
    }
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `OpenAI API request failed (${response.status})`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content;
  if (!rawText) {
    throw new Error('Received empty response from OpenAI.');
  }

  return parseJsonResponse(rawText);
}

async function callGemini({ apiKey, model, resume, jobDescription, signal }) {
  const selectedModel = model || MODEL_CONFIGS.gemini.defaultModel;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey.trim()}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    signal,
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${SYSTEM_PROMPT}\n\n${buildUserMessage(jobDescription, resume)}` }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.35,
        maxOutputTokens: 8192
      }
    })
  });

  if (!response.ok) {
    if (response.status === 404) {
      // Model name is invalid or not found in v1beta
      const errData = await response.json().catch(() => ({}));
      const apiMsg = errData.error?.message || '';
      throw new Error(
        `Gemini model not found: the model you selected (${selectedModel}) is no longer available. ` +
        `Google shut down Gemini 1.5 and 2.0 models in 2025–2026. Please switch to Gemini 3.5 Flash or Gemini 2.5 Flash in the model dropdown.` +
        (apiMsg ? ` (API: ${apiMsg})` : '')
      );
    }
    if (response.status === 400 || response.status === 401 || response.status === 403) {
      throw new Error('Invalid API key — check your Gemini key at aistudio.google.com/apikey and try again.');
    }
    if (response.status === 429) {
      throw new Error('Rate limit or free tier quota exceeded on your Google Gemini account. Please wait 30–60 seconds, switch to Groq (free) in the header, or generate a new free key at aistudio.google.com/apikey.');
    }
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Gemini API request failed (${response.status})`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error('Received empty response from Gemini.');
  }

  return parseJsonResponse(rawText);
}

function parseJsonResponse(text) {
  try {
    // 1. Try direct parse first (ideal case - model returned clean JSON)
    try {
      return sanitizeResponse(JSON.parse(text.trim()));
    } catch (_) { /* fall through */ }

    // 2. Strip markdown code fences: ```json ... ``` or ``` ... ```
    const stripped = text
      .replace(/^```(?:json)?\s*/im, '')
      .replace(/```\s*$/im, '')
      .trim();
    try {
      return sanitizeResponse(JSON.parse(stripped));
    } catch (_) { /* fall through */ }

    // 3. Extract the first complete JSON object from anywhere in the text
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const jsonSlice = text.slice(firstBrace, lastBrace + 1);
      try {
        return sanitizeResponse(JSON.parse(jsonSlice));
      } catch (_) { /* fall through */ }
    }

    // 4. Nothing worked
    console.error('Failed to parse LLM JSON. Raw text:', text?.slice(0, 500));
    throw new Error('PARSE_FAILED');
  } catch (err) {
    if (err.message === 'PARSE_FAILED') {
      throw new Error('Failed to parse AI response as valid JSON. The model may have returned a non-JSON reply. Try again or switch to a different model.');
    }
    throw err;
  }
}

function sanitizeResponse(parsed) {
  // Validate essential fields and sanitize arrays
  return {
    ats_score_before:    typeof parsed.ats_score_before    === 'number' ? parsed.ats_score_before    : 0,
    ats_score_after:     typeof parsed.ats_score_after     === 'number' ? parsed.ats_score_after     : 0,
    authenticity_score:  typeof parsed.authenticity_score  === 'number' ? parsed.authenticity_score  : 0,
    verdict_summary:     String(parsed.verdict_summary || ''),
    dimension_scores:    parsed.dimension_scores    && typeof parsed.dimension_scores    === 'object' ? parsed.dimension_scores    : {},
    ai_detected_lines:   Array.isArray(parsed.ai_detected_lines)   ? parsed.ai_detected_lines   : [],
    flagged_patterns:    Array.isArray(parsed.flagged_patterns)    ? parsed.flagged_patterns    : [],
    experience_realism:  parsed.experience_realism  && typeof parsed.experience_realism  === 'object' ? parsed.experience_realism  : {},
    unverifiable_claims: Array.isArray(parsed.unverifiable_claims) ? parsed.unverifiable_claims : [],
    ats_missing_keywords:Array.isArray(parsed.ats_missing_keywords)? parsed.ats_missing_keywords: [],
    suggestions:         Array.isArray(parsed.suggestions)         ? parsed.suggestions         : [],
    hr_perspective:      parsed.hr_perspective      && typeof parsed.hr_perspective      === 'object' ? parsed.hr_perspective      : {}
  };
}

export async function verifyApiKey({ provider, apiKey }) {
  if (!apiKey || !apiKey.trim()) {
    return { ok: false, message: 'Please enter an API key.' };
  }

  const trimmedKey = apiKey.trim();

  try {
    if (provider === 'gemini') {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${trimmedKey}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { ok: false, message: err.error?.message || `Invalid Gemini key (Status ${res.status})` };
      }
      return { ok: true, message: 'Gemini API key is valid!' };
    } 

    if (provider === 'groq') {
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { 'Authorization': `Bearer ${trimmedKey}` }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { ok: false, message: err.error?.message || `Invalid Groq key (Status ${res.status})` };
      }
      return { ok: true, message: 'Groq API key is valid!' };
    }

    if (provider === 'mistral') {
      const res = await fetch('https://api.mistral.ai/v1/models', {
        headers: { 'Authorization': `Bearer ${trimmedKey}` }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { ok: false, message: err.error?.message || `Invalid Mistral key (Status ${res.status})` };
      }
      return { ok: true, message: 'Mistral API key is valid!' };
    }

    if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { 'Authorization': `Bearer ${trimmedKey}` }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { ok: false, message: err.error?.message || `Invalid OpenAI key (Status ${res.status})` };
      }
      return { ok: true, message: 'OpenAI API key is valid!' };
    }

    return { ok: false, message: 'Unsupported provider selected.' };
  } catch (err) {
    return { ok: false, message: err.message || 'Connection check failed.' };
  }
}

