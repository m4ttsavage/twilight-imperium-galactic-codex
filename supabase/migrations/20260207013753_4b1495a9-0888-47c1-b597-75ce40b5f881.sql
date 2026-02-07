
-- =============================================
-- Move email to private table with host-only access
-- =============================================

-- 1. Drop old trigger FIRST (before dropping function)
DROP TRIGGER IF EXISTS resolve_player_user ON public.game_players;
DROP TRIGGER IF EXISTS resolve_player_user_on_insert ON public.game_players;

-- 2. Drop old function
DROP FUNCTION IF EXISTS public.resolve_player_user_on_insert();

-- 3. Remove email constraints and column from game_players
ALTER TABLE public.game_players DROP CONSTRAINT IF EXISTS check_email_format;
ALTER TABLE public.game_players DROP CONSTRAINT IF EXISTS check_email_length;
ALTER TABLE public.game_players DROP COLUMN IF EXISTS email;

-- 4. Create private email table
CREATE TABLE public.game_player_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_player_id uuid NOT NULL UNIQUE REFERENCES public.game_players(id) ON DELETE CASCADE,
  game_id uuid NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Enable RLS - host only
ALTER TABLE public.game_player_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Game owners can view player emails"
  ON public.game_player_emails FOR SELECT
  USING (is_game_owner(game_id));

CREATE POLICY "Game owners can insert player emails"
  ON public.game_player_emails FOR INSERT
  WITH CHECK (is_game_owner(game_id));

CREATE POLICY "Game owners can update player emails"
  ON public.game_player_emails FOR UPDATE
  USING (is_game_owner(game_id));

CREATE POLICY "Game owners can delete player emails"
  ON public.game_player_emails FOR DELETE
  USING (is_game_owner(game_id));

-- 6. Add constraints
ALTER TABLE public.game_player_emails ADD CONSTRAINT check_gpe_email_length
  CHECK (length(email) <= 255);

ALTER TABLE public.game_player_emails ADD CONSTRAINT check_gpe_email_format
  CHECK (email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$');

-- 7. New trigger: resolve player_user_id when email is inserted
CREATE OR REPLACE FUNCTION public.resolve_player_user_on_email_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IS NOT NULL THEN
    UPDATE public.game_players
    SET player_user_id = (
      SELECT p.id FROM public.profiles p
      WHERE LOWER(p.email) = LOWER(NEW.email)
      LIMIT 1
    )
    WHERE id = NEW.game_player_id
      AND player_user_id IS NULL;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER resolve_player_on_email_insert
  AFTER INSERT ON public.game_player_emails
  FOR EACH ROW
  EXECUTE FUNCTION public.resolve_player_user_on_email_insert();

-- 8. Update link_games_on_profile_create to use new table
CREATE OR REPLACE FUNCTION public.link_games_on_profile_create()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IS NOT NULL THEN
    UPDATE public.game_players gp
    SET player_user_id = NEW.id
    FROM public.game_player_emails gpe
    WHERE gpe.game_player_id = gp.id
      AND LOWER(gpe.email) = LOWER(NEW.email)
      AND gp.player_user_id IS NULL;
  END IF;
  RETURN NEW;
END;
$$;
