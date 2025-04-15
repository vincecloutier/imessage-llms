-- Create Messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    persona_id UUID NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL, 
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Add message policies
CREATE POLICY "Users can view messages from their personas" ON public.messages
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.personas WHERE id = persona_id
        )
    );

CREATE POLICY "Users can create messages in their personas" ON public.messages
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM public.personas WHERE id = persona_id
        )
    ); 
