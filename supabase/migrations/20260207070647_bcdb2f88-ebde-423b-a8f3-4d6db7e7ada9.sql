
-- Create a minimal SECURITY DEFINER view that exposes only id and email
CREATE OR REPLACE VIEW public.user_email_lookup
WITH (security_invoker = false)
AS
  SELECT id, email
  FROM auth.users;

-- Revoke direct access from public roles; only SECURITY DEFINER functions will use it
REVOKE ALL ON public.user_email_lookup FROM anon, authenticated;

-- Update link_games_on_profile_create to use the view instead of auth.users
CREATE OR REPLACE FUNCTION public.link_games_on_profile_create()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _email TEXT;
BEGIN
  SELECT email INTO _email FROM public.user_email_lookup WHERE id = NEW.id;
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

-- Update resolve_player_user_on_email_insert to use the view instead of auth.users
CREATE OR REPLACE FUNCTION public.resolve_player_user_on_email_insert()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.email IS NOT NULL THEN
    UPDATE public.game_players
    SET player_user_id = (
      SELECT uel.id FROM public.user_email_lookup uel
      WHERE LOWER(uel.email) = LOWER(NEW.email)
      LIMIT 1
    )
    WHERE id = NEW.game_player_id
      AND player_user_id IS NULL;
  END IF;
  RETURN NEW;
END;
$function$;
