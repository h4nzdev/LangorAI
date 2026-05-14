import { NextResponse } from 'next/server'
import { ai } from '@/ai/genkit'
import { genkit, z } from 'genkit'
import { googleAI } from '@genkit-ai/google-genai'

const GrammarOutputSchema = z.object({
  hasError: z.boolean(),
  corrections: z.array(z.object({
    incorrect: z.string(),
    correct: z.string(),
    explanation: z.string(),
  })),
})

export async function POST(request: Request) {
  try {
    const { transcript, apiKey } = await request.json()
    if (!transcript?.trim()) {
      return NextResponse.json({ hasError: false, corrections: [] })
    }

    const aiInstance = apiKey
      ? genkit({ plugins: [googleAI({ apiKey })], model: 'googleai/gemini-2.5-flash' })
      : ai

    const grammarPrompt = aiInstance.definePrompt({
      name: 'battleGrammarCheck',
      input: { schema: z.object({ transcript: z.string() }) },
      output: { schema: GrammarOutputSchema },
      prompt: `You are a strict English grammar checker for a competitive language battle game.

Check this spoken English text for grammar errors: "{{{transcript}}}"

Return JSON:
- hasError: true ONLY when there is a clear, unambiguous grammar mistake
- corrections: array of objects with "incorrect" (the wrong phrase), "correct" (the fixed version), "explanation" (max 12 words)

Count as errors:
- Wrong verb tense: "I go yesterday" → "I went yesterday"
- Subject-verb disagreement: "She don't" → "She doesn't", "They is" → "They are", "He have" → "He has"
- Missing/wrong article: "I am student" → "I am a student"
- Wrong pronoun case: "Her went to store" → "She went to the store"
- Double negatives: "I don't have nothing" → "I don't have anything"

Do NOT count as errors:
- Informal speech or contractions (that's, gonna, wanna)
- Filler words (um, uh, like, you know)
- Slightly informal but grammatically acceptable phrases
- Regional/dialectal variations that are widely accepted

Be strict but fair — this is a real competition.`,
    })

    const { output } = await grammarPrompt({ transcript })
    return NextResponse.json(output ?? { hasError: false, corrections: [] })
  } catch (error) {
    console.error('[Grammar API]', error)
    return NextResponse.json(
      { hasError: false, corrections: [], error: 'Grammar check unavailable' },
      { status: 500 }
    )
  }
}
