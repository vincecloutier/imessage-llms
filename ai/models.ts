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
] as const;

export const DEFAULT_MODEL_NAME: string = 'gemini-2.0-flash';
