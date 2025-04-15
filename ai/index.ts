import { createOpenRouter } from '@openrouter/ai-sdk-provider';

export const customModel = () => {
  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  });
  return openrouter.chat("google/gemini-2.0-flash-001");
};
