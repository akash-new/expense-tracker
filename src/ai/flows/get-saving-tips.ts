// src/ai/flows/get-saving-tips.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow that provides personalized saving tips based on user spending habits.
 *
 * - getSavingTips - An exported function that calls the getSavingTipsFlow.
 * - GetSavingTipsInput - The input type for the getSavingTips function.
 * - GetSavingTipsOutput - The output type for the getSavingTips function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Debug logging function
function debugLog(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log(`[DEBUG][${timestamp}] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

const GetSavingTipsInputSchema = z.object({
  spendingHabits: z
    .string()
    .describe(
      'A detailed description of the user\'s spending habits, including categories and amounts spent.'
    ),
});
export type GetSavingTipsInput = z.infer<typeof GetSavingTipsInputSchema>;

const GetSavingTipsOutputSchema = z.object({
  savingTips: z
    .string()
    .describe('Personalized saving tips based on the provided spending habits.'),
});
export type GetSavingTipsOutput = z.infer<typeof GetSavingTipsOutputSchema>;

export async function getSavingTips(input: GetSavingTipsInput): Promise<GetSavingTipsOutput> {
  debugLog("getSavingTips called with input:", input);
  
  try {
    // Check Google AI API key
    const apiKey = process.env.GOOGLE_API_KEY;
    debugLog("Google API Key status:", { exists: !!apiKey, length: apiKey?.length });
    
    // Get results from the flow
    const result = await getSavingTipsFlow(input);
    debugLog("getSavingTipsFlow result:", result);
    
    return result;
  } catch (error) {
    debugLog("Error in getSavingTips:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

const prompt = ai.definePrompt({
  name: 'getSavingTipsPrompt',
  input: {schema: GetSavingTipsInputSchema},
  output: {schema: GetSavingTipsOutputSchema},
  prompt: `You are a personal finance advisor. Based on the user's spending habits, provide personalized saving tips.

Spending Habits: {{{spendingHabits}}}

Provide specific and actionable advice to help the user save money.`,
});

const getSavingTipsFlow = ai.defineFlow(
  {
    name: 'getSavingTipsFlow',
    inputSchema: GetSavingTipsInputSchema,
    outputSchema: GetSavingTipsOutputSchema,
  },
  async input => {
    debugLog("getSavingTipsFlow started with input:", input);
    
    try {
      const promptResult = await prompt(input);
      debugLog("Prompt execution result:", promptResult);
      
      if (!promptResult.output) {
        debugLog("Warning: No output returned from prompt");
        throw new Error("AI service did not return any output. Please check your API key configuration.");
      }
      
      return promptResult.output;
    } catch (error) {
      debugLog("Error in getSavingTipsFlow:", {
        message: error instanceof Error ? error.message : String(error),
        name: error instanceof Error ? error.name : 'Unknown Error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }
);
