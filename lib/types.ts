export type { User } from '@supabase/supabase-js'

export type Profile = {
  id: string
  display_name: string
  imessage_address: string | null
  telegram_address: string | null
}

export type Persona = {
  id: string
  user_id: string
  display_name: string
  prompt: string
  temperature: string
  model: string
  is_imessage_persona: boolean
  is_telegram_persona: boolean
}

export type Message = {
  role: 'user' | 'assistant'
  content: string
  file_path?: string | null
  attachmentFile?: File | null
  created_at: string
}

export type SaveEntityPayload = {
  id?: string
  attributes: Record<string, any>
  sender_address?: string | null
  telegram_username?: string | null
  is_imessage_persona?: boolean
  is_telegram_persona?: boolean
}

export type Conversation = {
  id: string
  name: string
  lastMessage: string
  lastMessageTime: string
  is_unread: boolean
}
