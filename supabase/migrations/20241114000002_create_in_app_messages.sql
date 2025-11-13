
-- Create the in_app_messages table
CREATE TABLE IF NOT EXISTS public.in_app_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add comments to the table and columns
COMMENT ON TABLE public.in_app_messages IS 'Stores in-app messages to be broadcast to users in real-time.';
COMMENT ON COLUMN public.in_app_messages.id IS 'Unique identifier for the message.';
COMMENT ON COLUMN public.in_app_messages.title IS 'The title of the pop-up message.';
COMMENT ON COLUMN public.in_app_messages.message IS 'The main content of the pop-up message.';
COMMENT ON COLUMN public.in_app_messages.created_at IS 'The timestamp when the message was created.';


-- Enable Row-Level Security (RLS) for the table
ALTER TABLE public.in_app_messages ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
-- This policy lets any signed-in user receive the real-time messages.
CREATE POLICY "Allow authenticated read access"
ON public.in_app_messages
FOR SELECT
TO authenticated
USING (true);

-- Grant usage on the schema to the service_role
GRANT USAGE ON SCHEMA public TO service_role;

-- Grant permissions for the service_role (used by server-side functions/direct access)
-- This allows you to insert messages from the Supabase Studio or a backend function.
GRANT ALL ON TABLE public.in_app_messages TO service_role;
GRANT ALL ON SEQUENCE in_app_messages_id_seq TO service_role;

-- Setup the publication for real-time
-- This tells Supabase to broadcast changes on this table.
ALTER PUBLICATION supabase_realtime ADD TABLE public.in_app_messages;

