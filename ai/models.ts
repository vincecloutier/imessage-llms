// Define your models here.

export interface Model {
  id: string;
  label: string;
  apiIdentifier: string;
  description: string;
}

export const models: Array<Model> = [
  {
    id: 'gemini-2.0-flash',
    label: 'Gemini 2.0 Flash',
    apiIdentifier: 'google/gemini-2.0-flash-001',
    description: 'Small model for fast, lightweight tasks',
  },
  {
    id: 'gemini-2.5-pro',
    label: 'Gemini 2.5 Pro',
    apiIdentifier: 'google/gemini-2.5-pro-preview-03-25',
    description: 'For complex, multi-step tasks',
  },
] as const;

export const DEFAULT_MODEL_NAME: string = 'gemini-2.0-flash';
