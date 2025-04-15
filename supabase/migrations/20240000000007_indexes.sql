-- Enable pg_trgm for text search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Indexes for the users table
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

-- Indexes for the personas table
CREATE INDEX IF NOT EXISTS idx_personas_user_id ON public.personas(user_id);
CREATE INDEX IF NOT EXISTS idx_personas_created_at ON public.personas(created_at);
CREATE INDEX IF NOT EXISTS idx_personas_updated_at ON public.personas(updated_at);

-- Indexes for the messages table
CREATE INDEX IF NOT EXISTS idx_messages_persona_id ON public.messages(persona_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_role ON public.messages(role);

-- Add compression for large text fields
ALTER TABLE public.messages ALTER COLUMN content SET STORAGE EXTENDED;

