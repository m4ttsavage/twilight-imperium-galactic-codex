
-- Create a rate limiting table for tracking per-user request counts
CREATE TABLE public.chat_rate_limits (
  user_id UUID NOT NULL PRIMARY KEY,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only edge functions (service role) should access this table directly
-- No user-facing policies needed since access is via SECURITY DEFINER function

-- Create a function to check and increment rate limit
-- Returns true if allowed, false if rate limited
CREATE OR REPLACE FUNCTION public.check_chat_rate_limit(_user_id UUID, _max_requests INTEGER DEFAULT 30, _window_seconds INTEGER DEFAULT 60)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  _current RECORD;
  _now TIMESTAMPTZ := now();
BEGIN
  -- Try to get existing record
  SELECT request_count, window_start INTO _current
  FROM public.chat_rate_limits
  WHERE user_id = _user_id;

  IF NOT FOUND THEN
    -- First request ever
    INSERT INTO public.chat_rate_limits (user_id, request_count, window_start)
    VALUES (_user_id, 1, _now);
    RETURN TRUE;
  END IF;

  -- Check if window has expired
  IF _current.window_start + (_window_seconds || ' seconds')::INTERVAL < _now THEN
    -- Reset window
    UPDATE public.chat_rate_limits
    SET request_count = 1, window_start = _now
    WHERE user_id = _user_id;
    RETURN TRUE;
  END IF;

  -- Window still active, check count
  IF _current.request_count >= _max_requests THEN
    RETURN FALSE;
  END IF;

  -- Increment
  UPDATE public.chat_rate_limits
  SET request_count = request_count + 1
  WHERE user_id = _user_id;
  RETURN TRUE;
END;
$$;
