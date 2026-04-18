CREATE TABLE public.signup_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT,
  display_name TEXT,
  email_sent BOOLEAN NOT NULL DEFAULT false,
  email_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.signup_notifications ENABLE ROW LEVEL SECURITY;

-- No public access. Only the service role (used by the edge function and Cloud dashboard) can see this.
-- This intentionally has no policies so RLS blocks all client reads.

CREATE INDEX idx_signup_notifications_created ON public.signup_notifications(created_at DESC);
