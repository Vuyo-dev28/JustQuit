
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
  triggers: z.array(z.string()).optional().describe('The relapse triggers the user identified.'),
  motivation: z.string().optional().describe('The user\'s stated motivation for quitting.'),
  goals: z.array(z.string()).optional().describe('The goals the user wants to achieve.'),
});
export type AnalyzeUserProblemsInput = z.infer<typeof AnalyzeUserProblemsInputSchema>;

const AnalyzeUserProblemsOutputSchema = z.object({
  summary: z.string().describe("A brief, encouraging summary of the user's situation. Acknowledge their courage for starting. Connect their triggers, motivations, and goals into a short narrative."),
  struggleStat: z.string().describe("A compelling, large-number statistic representing the community. For example: 'Millions worldwide' or '1 in 5 adults'. This should be a short, impactful phrase."),
  successRate: z.number().describe("The success rate of users in the app. This should be a fixed value of 80."),
});
export type AnalyzeUserProblemsOutput = z.infer<typeof AnalyzeUserProblemsOutputSchema>;

const fallbackAnalysis: AnalyzeUserProblemsOutput = {
    summary: "Welcome! Taking the first step is the most important part of any journey. We're here to support you as you define your path to a healthier life.",
    struggleStat: "Millions worldwide",
    successRate: 80,
};


const promptTemplate = `You are an empathetic and encouraging AI assistant for 'JustQuit', an app that helps people overcome addictions.

Your task is to provide a brief, personalized analysis for a new user based on their signup information. Your tone should be supportive, non-judgmental, and empowering.

**User Information:**
- Addiction Category: {{{category}}}
- Age Range: {{{age}}}
- Gender: {{{gender}}}
- Identified Triggers: {{#each triggers}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
- Stated Motivation: {{{motivation}}}
- Personal Goals: {{#each goals}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

**Your Response:**

Generate a response with three parts:

1.  **Summary:** Write a 2-3 sentence summary.
    - Start by acknowledging their courage for taking this step.
    - Briefly connect their stated goals and motivations to the journey they are starting.
    - Frame their triggers not as weaknesses, but as challenges to be understood and managed.

2.  **Struggle Stat:** Provide a short, impactful phrase about the number of people who face similar challenges to make the user feel part of a larger community. Examples: 'Millions worldwide', '1 in 5 adults', 'Thousands in your city'. Be general and avoid making up precise numbers.

3.  **Success Rate:** Set this to the number 80.

**Example Output:**

"summary": "Taking this step to regain control from {{{category}}} is a powerful act of self-care. It's inspiring that you're driven by a desire for {{{motivation}}} and want to achieve goals like {{#each goals}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}. Understanding that {{#each triggers}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}} is a key challenge is the first step to developing new, healthier coping strategies."
"struggleStat": "Millions worldwide"
"successRate": 80

---
Generate the analysis for the user information provided.`;

const analyzeUserProblemsFlow = ai.defineFlow({
    name: 'analyzeUserProblemsFlow',
    inputSchema: AnalyzeUserProblemsInputSchema,
    outputSchema: AnalyzeUserProblemsOutputSchema,
}, async (input) => {
    try {
        const { output } = await ai.generate({
          prompt: promptTemplate,
          input,
          output: {
            schema: AnalyzeUserProblemsOutputSchema,
          },
        });

        if (!output) {
          console.error("The AI model did not return a valid analysis.");
          return fallbackAnalysis;
        }
        // Ensure success rate is always 80
        return { ...output, successRate: 80 };
      } catch (e: any) {
        console.error("AI analysis flow failed, returning fallback.", e.message);
        return fallbackAnalysis;
      }
});


export async function analyzeUserProblems(input: AnalyzeUserProblemsInput): Promise<AnalyzeUserProblemsOutput> {
    // Ensure at least one piece of data is present to avoid empty prompts
    if (Object.values(input).every(val => !val || (Array.isArray(val) && val.length === 0))) {
        return fallbackAnalysis;
    }
    // Directly call the async flow logic
    return await analyzeUserProblemsFlow(input);
}
