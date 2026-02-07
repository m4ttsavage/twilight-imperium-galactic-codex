
-- Add server-side email format validation on game_players table
ALTER TABLE public.game_players ADD CONSTRAINT check_email_format
  CHECK (email IS NULL OR email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$');
