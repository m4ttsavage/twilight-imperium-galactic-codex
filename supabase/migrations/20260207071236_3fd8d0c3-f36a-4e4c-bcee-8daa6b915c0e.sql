
-- Drop the view
DROP VIEW IF EXISTS public.user_email_lookup;

-- Create a SECURITY DEFINER function that returns email for a given user ID
CREATE OR REPLACE FUNCTION public.get_user_email_by_id(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT email FROM auth.users WHERE id = _user_id LIMIT 1;
$$;

-- Revoke execute from public-facing roles
REVOKE EXECUTE ON FUNCTION public.get_user_email_by_id(uuid) FROM anon, authenticated;

-- Update link_games_on_profile_create to use the function
CREATE OR REPLACE FUNCTION public.link_games_on_profile_create()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _email TEXT;
BEGIN
  SELECT public.get_user_email_by_id(NEW.id) INTO _email;
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
$function$;

-- Create a helper for reverse lookup (email -> id) used by the other function
CREATE OR REPLACE FUNCTION public.get_user_id_by_email(_email text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT id FROM auth.users WHERE LOWER(email) = LOWER(_email) LIMIT 1;
$$;

-- Revoke execute from public-facing roles
REVOKE EXECUTE ON FUNCTION public.get_user_id_by_email(text) FROM anon, authenticated;

-- Update resolve_player_user_on_email_insert to use the function
CREATE OR REPLACE FUNCTION public.resolve_player_user_on_email_insert()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.email IS NOT NULL THEN
    UPDATE public.game_players
    SET player_user_id = public.get_user_id_by_email(NEW.email)
    WHERE id = NEW.game_player_id
      AND player_user_id IS NULL;
  END IF;
  RETURN NEW;
END;
$function$;
