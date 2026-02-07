
-- 1. Update handle_new_user() to stop inserting email into profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

-- 2. Update link_games_on_profile_create() to get email from auth.users instead of profiles
CREATE OR REPLACE FUNCTION public.link_games_on_profile_create()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _email TEXT;
BEGIN
  SELECT email INTO _email FROM auth.users WHERE id = NEW.id;
  IF _email IS NOT NULL THEN
    UPDATE public.game_players gp
    SET player_user_id = NEW.id
    FROM public.game_player_emails gpe
    WHERE gpe.game_player_id = gp.id
      AND LOWER(gpe.email) = LOWER(_email)
      AND gp.player_user_id IS NULL;
  END IF;
  RETURN NEW;
END;
$$;

-- 3. Update resolve_player_user_on_email_insert() to query auth.users instead of profiles
CREATE OR REPLACE FUNCTION public.resolve_player_user_on_email_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.email IS NOT NULL THEN
    UPDATE public.game_players
    SET player_user_id = (
      SELECT au.id FROM auth.users au
      WHERE LOWER(au.email) = LOWER(NEW.email)
      LIMIT 1
    )
    WHERE id = NEW.game_player_id
      AND player_user_id IS NULL;
  END IF;
  RETURN NEW;
END;
$$;

-- 4. Drop the email column from profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;
