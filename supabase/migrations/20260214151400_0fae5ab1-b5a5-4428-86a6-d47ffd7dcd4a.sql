CREATE OR REPLACE FUNCTION public.check_analytics_rate_limit()
  RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
  SET search_path TO 'public' AS $$
DECLARE recent_count integer;
BEGIN
  SELECT count(*) INTO recent_count
  FROM public.admin_analytics
  WHERE session_id = NEW.session_id
    AND created_at > now() - interval '1 minute';
  IF recent_count >= 500 THEN
    RAISE EXCEPTION 'Analytics rate limit exceeded: max 500 events/minute per session';
  END IF;
  RETURN NEW;
END; $$;