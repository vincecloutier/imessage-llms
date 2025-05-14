export type { User } from "@supabase/supabase-js";

export type Profile = {
    id: string;
    attributes: Record<string, unknown>;
    sender_address: string;
    telegram_username: string;
}
  
export type Persona = {
    id: string;
    attributes: Record<string, unknown>;
    is_imessage_persona: boolean;
    is_telegram_persona: boolean;
}

export type Message = {
    role: 'user' | 'assistant';
    content: string;
    file_path?: string | null;
    attachmentFile?: File | null;
}

export type SaveEntityPayload = {
    id?: string;
    attributes: Record<string, any>;
    sender_address?: string | null;
    telegram_username?: string | null;
    is_imessage_persona?: boolean;
    is_telegram_persona?: boolean;
}