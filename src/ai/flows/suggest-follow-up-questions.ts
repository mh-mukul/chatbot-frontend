'use server';
/**
 * @fileOverview Provides follow-up question suggestions based on the current conversation.
 *
 * - suggestFollowUpQuestions - A function that suggests follow-up questions.
 * - SuggestFollowUpQuestionsInput - The input type for the suggestFollowUpQuestions function.
 * - SuggestFollowUpQuestionsOutput - The return type for the suggestFollowUpQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestFollowUpQuestionsInputSchema = z.object({
  conversationHistory: z.string().describe('The history of the conversation thus far.'),
  currentResponse: z.string().describe('The most recent response from the AI.'),
});
export type SuggestFollowUpQuestionsInput = z.infer<typeof SuggestFollowUpQuestionsInputSchema>;

const SuggestFollowUpQuestionsOutputSchema = z.object({
  followUpQuestions: z.array(z.string()).describe('An array of suggested follow-up questions.'),
});
export type SuggestFollowUpQuestionsOutput = z.infer<typeof SuggestFollowUpQuestionsOutputSchema>;

export async function suggestFollowUpQuestions(input: SuggestFollowUpQuestionsInput): Promise<SuggestFollowUpQuestionsOutput> {
  return suggestFollowUpQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestFollowUpQuestionsPrompt',
  input: {schema: SuggestFollowUpQuestionsInputSchema},
  output: {schema: SuggestFollowUpQuestionsOutputSchema},
  prompt: `Given the following conversation history and the AI's current response, suggest three follow-up questions that the user might ask to explore the topic in more detail.\n\nConversation History: {{{conversationHistory}}}\n\nCurrent Response: {{{currentResponse}}}\n\nFollow-Up Questions:`, // Ensure the output matches the schema
});

const suggestFollowUpQuestionsFlow = ai.defineFlow(
  {
    name: 'suggestFollowUpQuestionsFlow',
    inputSchema: SuggestFollowUpQuestionsInputSchema,
    outputSchema: SuggestFollowUpQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
