
-- Add email and player_user_id columns to game_players
ALTER TABLE public.game_players 
ADD COLUMN email text,
ADD COLUMN player_user_id uuid REFERENCES public.profiles(id);

-- Indexes for efficient lookups
CREATE INDEX idx_game_players_email ON public.game_players(email);
CREATE INDEX idx_game_players_player_user_id ON public.game_players(player_user_id);

-- Auto-resolve email to player_user_id on insert
CREATE OR REPLACE FUNCTION public.resolve_player_user_on_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IS NOT NULL AND NEW.player_user_id IS NULL THEN
    SELECT id INTO NEW.player_user_id
    FROM public.profiles
    WHERE LOWER(email) = LOWER(NEW.email)
    LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER resolve_player_user
BEFORE INSERT ON public.game_players
FOR EACH ROW
EXECUTE FUNCTION public.resolve_player_user_on_insert();

-- When a new user registers and validates email, link existing game records
CREATE OR REPLACE FUNCTION public.link_games_on_profile_create()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IS NOT NULL THEN
    UPDATE public.game_players
    SET player_user_id = NEW.id
    WHERE LOWER(email) = LOWER(NEW.email)
      AND player_user_id IS NULL;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created_link_games
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.link_games_on_profile_create();

-- Security definer to check if user is a game participant
CREATE OR REPLACE FUNCTION public.is_game_participant(_game_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.game_players
    WHERE game_id = _game_id AND player_user_id = auth.uid()
  );
$$;

-- Players can view game records they're linked to
CREATE POLICY "Players can view their game records"
ON public.game_players
FOR SELECT
USING (player_user_id = auth.uid());

-- Players can update their own nickname (once they register & validate email)
CREATE POLICY "Players can update their own name"
ON public.game_players
FOR UPDATE
USING (player_user_id = auth.uid());

-- Players can view games they participated in
CREATE POLICY "Players can view games they participated in"
ON public.games
FOR SELECT
USING (public.is_game_participant(id));
