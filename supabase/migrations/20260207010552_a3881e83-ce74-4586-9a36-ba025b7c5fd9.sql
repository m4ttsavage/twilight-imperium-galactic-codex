-- Drop overly permissive SELECT policies on game_players
DROP POLICY IF EXISTS "Anyone can view game players" ON public.game_players;
DROP POLICY IF EXISTS "Authenticated users can view game players" ON public.game_players;
DROP POLICY IF EXISTS "Players can view their game records" ON public.game_players;