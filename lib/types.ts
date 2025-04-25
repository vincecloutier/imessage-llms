export type Profile = {
    id: string;
    attributes: Record<string, unknown>;
    sender_address: string;
  }
  
export type Persona = {
    id: string;
    attributes: Record<string, unknown>;
    sender_address: string;
}

export type Message = {
    role: 'user' | 'assistant';
    content: string;
    file_path?: string | null;
}