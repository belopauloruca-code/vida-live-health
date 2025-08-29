-- Create dr_ajuda_messages table for chat history
CREATE TABLE public.dr_ajuda_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_id UUID,
  metadata JSONB
);

-- Create index for performance
CREATE INDEX idx_dr_ajuda_messages_user_created ON public.dr_ajuda_messages (user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.dr_ajuda_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own messages" 
ON public.dr_ajuda_messages 
FOR SELECT 
USING ((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create their own messages" 
ON public.dr_ajuda_messages 
FOR INSERT 
WITH CHECK ((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update their own messages" 
ON public.dr_ajuda_messages 
FOR UPDATE 
USING ((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can delete their own messages" 
ON public.dr_ajuda_messages 
FOR DELETE 
USING ((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));