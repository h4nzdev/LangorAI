'use server';
/**
 * @fileOverview Langor AI Practice Session and Analysis Flows.
 * 
 * - startPracticeSession: Handles turn-by-turn conversation and immediate feedback.
 * - summarizeSession: Analyzes the complete session to provide final scores and recommendations.
 */

import { ai as globalAi } from '@/ai/genkit';
import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const PracticeInputSchema = z.object({
  userInput: z.string().describe('The text transcribed from the user\'s speech.'),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    text: z.string()
  })).optional().describe('The previous turns in the conversation.'),
  topic: z.string().optional().default('Hobbies and Interests'),
  interviewer: z.string().optional().default('Langor AI'),
  apiKey: z.string().optional().describe('An optional user-provided Google AI API Key.'),
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

export async function startPracticeSession(input: PracticeInput): Promise<PracticeOutput> {
  const aiInstance = input.apiKey 
    ? genkit({ plugins: [googleAI({ apiKey: input.apiKey })], model: 'googleai/gemini-2.5-flash' }) 
    : globalAi;

  const practicePrompt = aiInstance.definePrompt({
    name: 'practicePrompt',
    input: { schema: PracticeInputSchema },
    output: { schema: PracticeOutputSchema },
    prompt: `You are {{{interviewer}}}, a friendly and professional language tutor. 
    
    Current Scenario: {{{topic}}}

    INSTRUCTIONS FOR SCENARIO:
    - If Scenario is "Job Interview": You are a professional hiring manager. Ask probing questions about the user's career, strengths, and experience. Use formal business English.
    - If Scenario is "Reporting": You are a senior executive or stakeholder. Ask for specific project data, status updates, and professional summaries. Focus on business clarity.
    - If Scenario is "Casual Chat" or anything else: You are a friendly language partner. Keep the tone social and engaging, focusing on hobbies and daily life.

    YOUR GOALS:
    1. Maintain your persona and the scenario context perfectly.
    2. Subtly correct any grammar or vocabulary mistakes they make in the 'feedback' object.
    3. Keep your responses concise (1-3 sentences).

    In the 'feedback' object:
    - 'hasCorrection' should be true ONLY if there is a significant grammar or phrasing error.
    - Provide a 'correctedText' that sounds more native.
    - Provide a brief 'explanation'.

    Conversation History:
    {{#each history}}
    {{role}}: {{text}}
    {{/each}}

    User Input: {{{userInput}}}`,
  });

  const { output } = await practicePrompt(input);
  if (!output) throw new Error('AI failed to generate a response');
  return output;
}

// Analysis Flow
const SummarizeInputSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'model', 'system']),
    text: z.string()
  })),
  apiKey: z.string().optional(),
});

const SummarizeOutputSchema = z.object({
  overallScore: z.number().min(0).max(100),
  metrics: z.object({
    fluency: z.number().min(0).max(100),
    grammar: z.number().min(0).max(100),
    vocabulary: z.number().min(0).max(100),
    pronunciation: z.number().min(0).max(100).describe('Estimate based on text patterns and transcription quality.'),
  }),
  insights: z.object({
    fluency: z.string(),
    grammar: z.string(),
    vocabulary: z.string(),
    pronunciation: z.string(),
  }),
  keyImprovements: z.array(z.object({
    error: z.string(),
    correction: z.string(),
    rule: z.string(),
  })).max(3),
  recommendedExercise: z.object({
    title: z.string(),
    description: z.string(),
  }),
});

export type SummarizeOutput = z.infer<typeof SummarizeOutputSchema>;

export async function summarizeSession(input: z.infer<typeof SummarizeInputSchema>): Promise<SummarizeOutput> {
  const aiInstance = input.apiKey 
    ? genkit({ plugins: [googleAI({ apiKey: input.apiKey })], model: 'googleai/gemini-2.5-flash' }) 
    : globalAi;

  const summaryPrompt = aiInstance.definePrompt({
    name: 'summaryPrompt',
    input: { schema: SummarizeInputSchema },
    output: { schema: SummarizeOutputSchema },
    prompt: `You are a Language Learning Analyst. Analyze the following conversation history between a student and an AI tutor.
    
    Provide a comprehensive evaluation of the student's performance.
    
    Conversation History:
    {{#each history}}
    {{role}}: {{text}}
    {{/each}}
    
    Evaluation Guidelines:
    - Overall Score: A weighted average of all metrics.
    - Metrics: Score from 0-100.
    - Insights: Brief, encouraging descriptions for each metric.
    - Key Improvements: Pick up to 3 most important grammar or vocabulary mistakes to highlight.
    - Recommended Exercise: Suggest a specific focus area for the next session based on weaknesses.`,
  });

  const { output } = await summaryPrompt(input);
  if (!output) throw new Error('Failed to generate session summary');
  return output;
}
