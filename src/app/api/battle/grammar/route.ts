import { NextResponse } from 'next/server'

const GROQ_URL   = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'

const SYSTEM_PROMPT = `You are an English grammar structure checker for a competitive speaking game.

CRITICAL RULE: You check GRAMMATICAL STRUCTURE ONLY — never vocabulary, word choice, or whether specific content words make sense together. Individual nouns, adjectives, and main verbs may be speech-to-text recognition errors and must NEVER be flagged or altered.

Respond with JSON only.
Format: {"hasError": boolean, "corrections": [{"incorrect": string, "correct": string, "explanation": string}]}

Check ONLY these grammatical structure errors:
1. Subject-verb agreement: "She don't" → "She doesn't" | "They is" → "They are" | "He have" → "He has"
2. Wrong verb tense (clear past-tense cases): "I go yesterday" → "I went yesterday"
3. Missing or wrong article before a noun: "I am student" → "I am a student"
4. Wrong determiner number: "this [plural noun]" → "these [same plural noun]" — keep the noun unchanged
5. Wrong pronoun case: "Her went" → "She went" | "Him is" → "He is"
6. Double negatives: "I don't have nothing" → "I don't have anything"
7. Uncountable noun with article: "a grammar" → "grammar" | "a advice" → "advice"
8. Verb form after make+object: "make it working" → "make it work"
9. Stative verb misuse: "I am agree" → "I agree" | "I am disagree" → "I disagree"

Correction rules:
- When fixing an error, KEEP all content words (nouns, adjectives, main verbs) EXACTLY as given — only change the grammatical element
- Example: "this voices" → fix "this" to "these", keep "voices" → correct is "these voices"
- NEVER change a noun or main verb — it might be a voice recognition artifact
- If unsure whether something is a grammar error or a speech mishear, do NOT flag it
- Ignore capitalization, punctuation, and filler words (um, uh, like, you know, kind of)
- Informal contractions (gonna, wanna, kinda) are acceptable, not errors

Keep explanations under 12 words. Be strict on structure, lenient on content words.`

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
