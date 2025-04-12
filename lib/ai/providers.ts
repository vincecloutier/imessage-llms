import { customProvider } from 'ai';
import { xai } from '@ai-sdk/xai';

export const myProvider = customProvider({
  languageModels: {
        'chat-model': xai('grok-2-1212'),
        'title-model': xai('grok-2-1212'),
        'artifact-model': xai('grok-2-1212'),
      },
});