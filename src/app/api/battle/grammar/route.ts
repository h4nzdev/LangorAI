import { NextResponse } from 'next/server'

const GROQ_URL   = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'

const SYSTEM_PROMPT = `You are a strict English grammar checker for a competitive language battle game.

Check the spoken English text for grammar errors and respond with JSON only.

Format: {"hasError": boolean, "corrections": [{"incorrect": string, "correct": string, "explanation": string}]}

Count as errors:
- Wrong verb tense: "I go yesterday" → "I went yesterday"
- Subject-verb disagreement: "She don't" → "She doesn't", "They is" → "They are"
- Missing/wrong article: "I am student" → "I am a student"
- Wrong pronoun case: "Her went" → "She went"
- Double negatives: "I don't have nothing" → "I don't have anything"
- Uncountable noun with article: "a grammar" → "grammar", "a advice" → "advice"
- Make + object + verb-ing: "make it working" → "make it work"
- I am agree/disagree: "I am agree" → "I agree"

Do NOT flag:
- Informal speech or contractions (gonna, wanna, that's)
- Filler words (um, uh, like, you know)
- Slightly informal but grammatically acceptable phrases
- Speech-to-text capitalization or punctuation artifacts

Keep explanations under 12 words. Be strict but fair — this is a real competition.`

async function callGroq(transcript: string, apiKey: string) {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model:           GROQ_MODEL,
      response_format: { type: 'json_object' },
      temperature:     0.1,
      max_tokens:      300,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: `Check this spoken English: "${transcript}"` },
      ],
    }),
  })

  if (!res.ok) throw new Error(`Groq ${res.status}`)
  const data = await res.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('Empty Groq response')
  return JSON.parse(content)
}

export async function POST(request: Request) {
  try {
    const { transcript, apiKey, freeSession } = await request.json()

    if (!transcript?.trim()) {
      return NextResponse.json({ hasError: false, corrections: [] })
    }

    // Priority: user's own Groq key → built-in free-trial key → no AI
    let keyToUse: string | null = null

    if (typeof apiKey === 'string' && apiKey.startsWith('gsk_')) {
      keyToUse = apiKey
    } else if (freeSession === true && process.env.GROQ_API_KEY) {
      keyToUse = process.env.GROQ_API_KEY
    }

    if (!keyToUse) {
      return NextResponse.json({ hasError: false, corrections: [] })
    }

    const result = await callGroq(transcript, keyToUse)
    return NextResponse.json(result ?? { hasError: false, corrections: [] })
  } catch (error) {
    console.error('[Grammar API]', error)
    return NextResponse.json(
      { hasError: false, corrections: [], error: 'Grammar check unavailable' },
      { status: 500 }
    )
  }
}
