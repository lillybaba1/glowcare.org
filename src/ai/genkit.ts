import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

declare global {
  // eslint-disable-next-line no-var
  var __genkit: ReturnType<typeof genkit> | undefined;
}

const ai =
  globalThis.__genkit ??
  genkit({
    plugins: [googleAI()],
    model: 'googleai/gemini-2.0-flash',
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__genkit = ai;
}

export { ai };
