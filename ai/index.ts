import { createOpenRouter } from '@openrouter/ai-sdk-provider';

export const customModel = (apiIdentifier: string) => {
  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  });
  return openrouter.chat(apiIdentifier);
};
