
'use server';

/**
 * @fileOverview Soundtrack suggestion AI agent.
 *
 * - suggestSoundtrack - A function that handles the soundtrack suggestion process.
 * - SuggestSoundtrackInput - The input type for the suggestSoundtrack function.
 * - SuggestSoundtrackOutput - The return type for the suggestSoundtrack function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSoundtrackInputSchema = z.object({
  score: z.number().describe('The current score of the game.'),
  level: z.number().describe('The current level of the game.'),
  linesCleared: z.number().describe('The number of lines cleared in the game.'),
  gameState: z
    .enum(['playing', 'paused', 'gameOver'])
    .describe('The current state of the game.'),
});
export type SuggestSoundtrackInput = z.infer<typeof SuggestSoundtrackInputSchema>;

const SuggestSoundtrackOutputSchema = z.object({
  suggestedSoundtrack: z
    .string()
    .describe('A suggested soundtrack based on the game state.'),
  reason: z.string().describe('The reason for suggesting the soundtrack.'),
});
export type SuggestSoundtrackOutput = z.infer<typeof SuggestSoundtrackOutputSchema>;

export async function suggestSoundtrack(input: SuggestSoundtrackInput): Promise<SuggestSoundtrackOutput> {
  return suggestSoundtrackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSoundtrackPrompt',
  input: {schema: SuggestSoundtrackInputSchema},
  output: {schema: SuggestSoundtrackOutputSchema},
  prompt: `You are a music expert specializing in suggesting soundtracks for video games. Based on the game state, score, level, and lines cleared, you will suggest a soundtrack that matches the mood of the game.

Game State: {{{gameState}}}
Score: {{{score}}}
Level: {{{level}}}
Lines Cleared: {{{linesCleared}}}

Suggest a soundtrack and explain why it fits the current game situation. Return the suggested soundtrack and the reason for the suggestion in the output.`,
});

const suggestSoundtrackFlow = ai.defineFlow(
  {
    name: 'suggestSoundtrackFlow',
    inputSchema: SuggestSoundtrackInputSchema,
    outputSchema: SuggestSoundtrackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
