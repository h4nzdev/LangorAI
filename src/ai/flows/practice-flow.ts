'use server';

import { z } from 'zod';

const GROQ_URL   = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

async function callGroq(
  messages: { role: string; content: string }[],
  maxTokens = 600,
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not configured');

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model:           GROQ_MODEL,
      response_format: { type: 'json_object' },
      temperature:     0.7,
      max_tokens:      maxTokens,
      messages,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq ${res.status}: ${err}`);
  }

  const data    = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty Groq response');
  return content;
}

// ── Practice session ──────────────────────────────────────────────────────────

const PracticeInputSchema = z.object({
  userInput:   z.string(),
  history:     z.array(z.object({ role: z.enum(['user', 'model']), text: z.string() })).optional(),
  topic:       z.string().optional().default('Hobbies and Interests'),
  interviewer: z.string().optional().default('Langor AI'),
  apiKey:      z.string().optional(), // kept for back-compat but ignored — Groq is built-in
});

const PracticeOutputSchema = z.object({
  aiResponse: z.string(),
  feedback: z.object({
    originalText:  z.string(),
    correctedText: z.string().optional(),
    explanation:   z.string().optional(),
    hasCorrection: z.boolean(),
  }),
});

export type PracticeInput  = z.infer<typeof PracticeInputSchema>;
export type PracticeOutput = z.infer<typeof PracticeOutputSchema>;

export async function startPracticeSession(input: PracticeInput): Promise<PracticeOutput> {
  const tutor    = input.interviewer ?? 'Langor AI';
  const topic    = input.topic       ?? 'Hobbies and Interests';
  const history  = input.history     ?? [];

  const historyText = history
    .map(h => `${h.role === 'user' ? 'Student' : 'Tutor'}: ${h.text}`)
    .join('\n');

  const systemPrompt =
`You are ${tutor}, a friendly language tutor helping a student practise spoken English.
Current Scenario: ${topic}

PERSONA:
- "Job Interview": professional hiring manager, formal business English, probing career questions.
- "Reporting": senior executive, ask for project data and professional summaries.
- Anything else: friendly language partner, casual tone, hobbies and daily life.

RULES:
1. Stay in persona. Keep your response to 1-3 sentences.
2. Gently correct grammar/vocabulary mistakes in the feedback field only — never in your spoken response.
3. Set hasCorrection to true ONLY for real grammar or phrasing errors, not minor informalities.

Respond ONLY with valid JSON:
{
  "aiResponse": "<your 1-3 sentence conversational response>",
  "feedback": {
    "originalText": "<student's exact text>",
    "correctedText": "<corrected version if hasCorrection is true, otherwise same as original>",
    "explanation": "<one-sentence explanation if hasCorrection is true, otherwise empty string>",
    "hasCorrection": <true|false>
  }
}`;

  const userMessage = historyText
    ? `${historyText}\nStudent: ${input.userInput}`
    : `Student: ${input.userInput}`;

  try {
    const raw    = await callGroq([
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userMessage },
    ]);
    const parsed = JSON.parse(raw);

    return {
      aiResponse: parsed.aiResponse ?? 'Could you tell me more about that?',
      feedback: {
        originalText:  parsed.feedback?.originalText  ?? input.userInput,
        correctedText: parsed.feedback?.correctedText  ?? undefined,
        explanation:   parsed.feedback?.explanation    ?? undefined,
        hasCorrection: parsed.feedback?.hasCorrection  ?? false,
      },
    };
  } catch {
    return {
      aiResponse: 'That\'s interesting! Could you elaborate a bit more?',
      feedback: { originalText: input.userInput, hasCorrection: false },
    };
  }
}

// ── Session summary ───────────────────────────────────────────────────────────

const SummarizeInputSchema = z.object({
  history: z.array(z.object({ role: z.enum(['user', 'model', 'system']), text: z.string() })),
  apiKey:  z.string().optional(), // kept for back-compat, ignored
});

const SummarizeOutputSchema = z.object({
  overallScore: z.number().min(0).max(100),
  metrics: z.object({
    fluency:       z.number().min(0).max(100),
    grammar:       z.number().min(0).max(100),
    vocabulary:    z.number().min(0).max(100),
    pronunciation: z.number().min(0).max(100),
  }),
  insights: z.object({
    fluency:       z.string(),
    grammar:       z.string(),
    vocabulary:    z.string(),
    pronunciation: z.string(),
  }),
  keyImprovements: z.array(z.object({
    error:      z.string(),
    correction: z.string(),
    rule:       z.string(),
  })).max(3),
  recommendedExercise: z.object({
    title:       z.string(),
    description: z.string(),
  }),
});

export type SummarizeOutput = z.infer<typeof SummarizeOutputSchema>;

export async function summarizeSession(
  input: z.infer<typeof SummarizeInputSchema>,
): Promise<SummarizeOutput> {
  const historyText = input.history
    .filter(h => h.role !== 'system')
    .map(h => `${h.role === 'user' ? 'Student' : 'Tutor'}: ${h.text}`)
    .join('\n');

  const systemPrompt =
`You are a Language Learning Analyst. Evaluate the student's spoken English from the conversation below.

Respond ONLY with valid JSON:
{
  "overallScore": <number 0-100>,
  "metrics": {
    "fluency":       <number 0-100>,
    "grammar":       <number 0-100>,
    "vocabulary":    <number 0-100>,
    "pronunciation": <number 0-100>
  },
  "insights": {
    "fluency":       "<one encouraging sentence>",
    "grammar":       "<one encouraging sentence>",
    "vocabulary":    "<one encouraging sentence>",
    "pronunciation": "<one encouraging sentence>"
  },
  "keyImprovements": [
    { "error": "<what was wrong>", "correction": "<the fix>", "rule": "<grammar rule>" }
  ],
  "recommendedExercise": {
    "title":       "<short exercise name>",
    "description": "<what to practise and why>"
  }
}

Guidelines:
- overallScore = weighted average of all four metrics
- keyImprovements: max 3 items, most important errors only
- Be encouraging and constructive in all insight strings`;

  try {
    const raw    = await callGroq(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: `Conversation:\n${historyText}` },
      ],
      800,
    );
    return JSON.parse(raw) as SummarizeOutput;
  } catch {
    return {
      overallScore: 70,
      metrics:      { fluency: 70, grammar: 70, vocabulary: 70, pronunciation: 70 },
      insights:     {
        fluency:       'You spoke at a good pace throughout the session.',
        grammar:       'Your sentence structures were mostly correct.',
        vocabulary:    'You used a reasonable range of vocabulary.',
        pronunciation: 'Your pronunciation was generally clear.',
      },
      keyImprovements:     [],
      recommendedExercise: { title: 'Daily Speaking', description: 'Practise speaking for 5 minutes daily on any topic.' },
    };
  }
}
