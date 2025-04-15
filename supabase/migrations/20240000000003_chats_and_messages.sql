-- Create personas table
CREATE TABLE IF NOT EXISTS public.personas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.personas ENABLE ROW LEVEL SECURITY;


-- Create RLS Policies
CREATE POLICY "Users can view own personas" ON public.personas
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own personas" ON public.personas
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own personas" ON public.personas
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own personas" ON public.personas
    FOR DELETE USING (auth.uid() = user_id);
