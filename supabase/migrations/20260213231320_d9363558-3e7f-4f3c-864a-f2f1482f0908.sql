
-- =============================================
-- Admin Portal Database Schema
-- =============================================

-- 1. admin_users — Super admin whitelist
CREATE TABLE public.admin_users (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'super_admin',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only authenticated admin users can read their own entry
CREATE POLICY "Admin users can read own entry"
  ON public.admin_users FOR SELECT
  USING (auth.jwt() ->> 'email' = email);

-- Seed the super admin
INSERT INTO public.admin_users (email, role) VALUES ('benjamin.o.anenu@gmail.com', 'super_admin');

-- 2. admin_analytics — Client-side event tracking
CREATE TABLE public.admin_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL,
  event_target text NOT NULL,
  event_metadata jsonb DEFAULT '{}'::jsonb,
  session_id text NOT NULL,
  device_type text DEFAULT 'desktop',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_analytics ENABLE ROW LEVEL SECURITY;

-- Anyone can insert analytics events (anonymous tracking)
CREATE POLICY "Anyone can insert analytics"
  ON public.admin_analytics FOR INSERT
  WITH CHECK (
    event_type IS NOT NULL
    AND event_target IS NOT NULL
    AND session_id IS NOT NULL
    AND length(event_target) <= 500
  );

-- Only authenticated admins can read analytics
CREATE POLICY "Admins can read analytics"
  ON public.admin_analytics FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE email = auth.jwt() ->> 'email')
  );

-- 3. admin_ai_usage — AI consumption tracking
CREATE TABLE public.admin_ai_usage (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid,
  model text,
  input_tokens integer DEFAULT 0,
  output_tokens integer DEFAULT 0,
  tool_calls jsonb DEFAULT '[]'::jsonb,
  latency_ms integer DEFAULT 0,
  status_code integer DEFAULT 200,
  estimated_cost_usd numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_ai_usage ENABLE ROW LEVEL SECURITY;

-- Only authenticated admins can read AI usage
CREATE POLICY "Admins can read AI usage"
  ON public.admin_ai_usage FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE email = auth.jwt() ->> 'email')
  );

-- 4. admin_service_health — Third-party service monitoring
CREATE TABLE public.admin_service_health (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name text NOT NULL,
  endpoint text NOT NULL,
  status_code integer DEFAULT 200,
  latency_ms integer DEFAULT 0,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_service_health ENABLE ROW LEVEL SECURITY;

-- Only authenticated admins can read service health
CREATE POLICY "Admins can read service health"
  ON public.admin_service_health FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE email = auth.jwt() ->> 'email')
  );

-- 5. admin_costs — Manual cost entries
CREATE TABLE public.admin_costs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category text NOT NULL,
  amount_usd numeric NOT NULL DEFAULT 0,
  period text NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_costs ENABLE ROW LEVEL SECURITY;

-- Only authenticated admins can CRUD costs
CREATE POLICY "Admins can read costs"
  ON public.admin_costs FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE email = auth.jwt() ->> 'email')
  );

CREATE POLICY "Admins can insert costs"
  ON public.admin_costs FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE email = auth.jwt() ->> 'email')
  );

CREATE POLICY "Admins can update costs"
  ON public.admin_costs FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE email = auth.jwt() ->> 'email')
  );

CREATE POLICY "Admins can delete costs"
  ON public.admin_costs FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE email = auth.jwt() ->> 'email')
  );

-- Rate limiting trigger for admin_analytics
CREATE OR REPLACE FUNCTION public.check_analytics_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  recent_count integer;
BEGIN
  SELECT count(*) INTO recent_count
  FROM public.admin_analytics
  WHERE session_id = NEW.session_id
    AND created_at > now() - interval '1 minute';

  IF recent_count >= 100 THEN
    RAISE EXCEPTION 'Analytics rate limit exceeded: max 100 events/minute per session';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER check_analytics_rate
  BEFORE INSERT ON public.admin_analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.check_analytics_rate_limit();
