'use server';
/**
 * @fileOverview Langor AI Practice Session Flow.
 * 
 * This flow handles the conversation logic for a language learning session.
 * It takes the user's spoken text and returns an AI response along with 
 * immediate grammar feedback and corrections.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PracticeInputSchema = z.object({
  userInput: z.string().describe('The text transcribed from the user\'s speech.'),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    text: z.string()
  })).optional().describe('The previous turns in the conversation.'),
  topic: z.string().optional().default('Hobbies and Interests'),
});

const PracticeOutputSchema = z.object({
  aiResponse: z.string().describe('The natural conversational response from the AI tutor.'),
  feedback: z.object({
    originalText: z.string(),
    correctedText: z.string().optional(),
    explanation: z.string().optional(),
    hasCorrection: z.boolean(),
  }).describe('Grammar and fluency feedback on the user\'s last input.'),
});

export type PracticeInput = z.infer<typeof PracticeInputSchema>;
export type PracticeOutput = z.infer<typeof PracticeOutputSchema>;

const practicePrompt = ai.definePrompt({
  name: 'practicePrompt',
  input: { schema: PracticeInputSchema },
  output: { schema: PracticeOutputSchema },
  prompt: `You are Langor AI, a friendly and professional language tutor. 
  
  Current Topic: {{{topic}}}

  Your goal is to:
  1. Continue a natural, engaging conversation with the user.
  2. Subtly correct any grammar or vocabulary mistakes they make.
  3. Keep your responses concise (1-3 sentences) to maintain a good voice-chat rhythm.

  In the 'feedback' object:
  - 'hasCorrection' should be true ONLY if there is a significant grammar or phrasing error.
  - Provide a 'correctedText' that sounds more native.
  - Provide a brief 'explanation' (e.g., "Use 'playing' after 'enjoy'").

  User Input: {{{userInput}}}`,
});

export async function startPracticeSession(input: PracticeInput): Promise<PracticeOutput> {
  return practiceFlow(input);
}

const practiceFlow = ai.defineFlow(
  {
    name: 'practiceFlow',
    inputSchema: PracticeInputSchema,
    outputSchema: PracticeOutputSchema,
  },
  async (input) => {
    const { output } = await practicePrompt(input);
    if (!output) throw new Error('AI failed to generate a response');
    return output;
  }
);
