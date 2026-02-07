
-- Force RLS on game_player_emails so even table owners respect policies
ALTER TABLE public.game_player_emails FORCE ROW LEVEL SECURITY;
