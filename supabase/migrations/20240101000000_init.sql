-- Create a table for patients
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_id_local TEXT NOT NULL,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Turn on Row Level Security
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Create policies so doctors can only see their own patients
CREATE POLICY "Users can view their own patients" 
ON public.patients FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own patients" 
ON public.patients FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own patients" 
ON public.patients FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own patients" 
ON public.patients FOR DELETE 
USING (auth.uid() = user_id);
