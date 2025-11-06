
'use server';
/**
 * @fileOverview An AI flow to analyze a user's addiction problems based on their signup data.
 *
 * - analyzeUserProblems - A function that takes user data and returns an analysis and relevant stats.
 * - AnalyzeUserProblemsInput - The input type for the analyzeUserProblems function.
 * - AnalyzeUserProblemsOutput - The return type for the analyzeUserProblems function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AnalyzeUserProblemsInputSchema = z.object({
  category: z.string().optional().describe('The addiction category the user selected (e.g., Porn, Alcohol, Smoking).'),
  age: z.string().optional().describe('The age range of the user.'),
  gender: z.string().optional().describe('The gender of the user.'),
  triggers: z.string().optional().describe('The relapse triggers the user identified.'),
  motivation: z.string().optional().describe('The user\'s stated motivation for quitting.'),
  goals: z.array(z.string()).optional().describe('The goals the user wants to achieve.'),
});
export type AnalyzeUserProblemsInput = z.infer<typeof AnalyzeUserProblemsInputSchema>;

const AnalyzeUserProblemsOutputSchema = z.object({
  summary: z.string().describe("A brief, encouraging summary of the user's situation. Acknowledge their courage for starting. Connect their triggers, motivations, and goals into a short narrative."),
  stats: z.string().describe("A relevant, encouraging statistic or general statement that helps the user feel they are not alone. This should be phrased positively. For example: 'Many people who want to quit [category] share similar goals, like improving their health and relationships. You're part of a large community seeking positive change.' Avoid making up specific numbers."),
});
export type AnalyzeUserProblemsOutput = z.infer<typeof AnalyzeUserProblemsOutputSchema>;

export async function analyzeUserProblems(input: AnalyzeUserProblemsInput): Promise<AnalyzeUserProblemsOutput> {
    // Ensure at least one piece of data is present to avoid empty prompts
    if (Object.values(input).every(val => !val || (Array.isArray(val) && val.length === 0))) {
        return {
            summary: "Welcome! Taking the first step is the most important part of any journey. We're here to support you as you define your path to a healthier life.",
            stats: "Every journey is unique, and you're in the right place to start yours. Many people have walked this path before, and you can too."
        };
    }
  return analyzeUserProblemsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeUserProblemsPrompt',
  input: { schema: AnalyzeUserProblemsInputSchema },
  output: { schema: AnalyzeUserProblemsOutputSchema },
  prompt: `You are an empathetic and encouraging AI assistant for 'Triumph Over Vice', an app that helps people overcome addictions.

Your task is to provide a brief, personalized analysis for a new user based on their signup information. Your tone should be supportive, non-judgmental, and empowering.

**User Information:**
- Addiction Category: {{{category}}}
- Age Range: {{{age}}}
- Gender: {{{gender}}}
- Identified Triggers: {{{triggers}}}
- Stated Motivation: {{{motivation}}}
- Personal Goals: {{{goals}}}

**Your Response:**

Generate a response with two parts:

1.  **Summary:** Write a 2-3 sentence summary.
    - Start by acknowledging their courage for taking this step.
    - Briefly connect their stated goals and motivations to the journey they are starting.
    - Frame their triggers not as weaknesses, but as challenges to be understood and managed.

2.  **Stats/Community Context:** Write a 1-2 sentence statement to help them feel less alone.
    - Provide a general, encouraging statistic or statement related to their category or goals.
    - DO NOT invent specific numbers (e.g., "78% of people..."). Instead, use phrases like "Many people find...", "It's common for...", or "You're not alone in feeling...".
    - Frame the statistic in a positive and hopeful light.

**Example Output:**

"summary": "Taking this step to regain control from {{{category}}} is a powerful act of self-care. It's inspiring that you're driven by a desire for {{{motivation}}} and want to achieve goals like {{{goals}}}. Understanding that {{{triggers}}} is a key challenge is the first step to developing new, healthier coping strategies."
"stats": "You're not alone. Many people who struggle with {{{category}}} report that stress and boredom are major factors, and millions have successfully quit, finding new freedom and improved well-being."

---
Generate the analysis for the user information provided.`,
});

const analyzeUserProblemsFlow = ai.defineFlow(
  {
    name: 'analyzeUserProblemsFlow',
    inputSchema: AnalyzeUserProblemsInputSchema,
    outputSchema: AnalyzeUserProblemsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("The AI model did not return a valid analysis.");
    }
    return output;
  }
);
