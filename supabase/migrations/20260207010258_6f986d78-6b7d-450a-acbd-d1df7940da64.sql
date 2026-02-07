-- Allow game hosts to update game_players records for their games
CREATE POLICY "Hosts can update their game players"
  ON public.game_players
  FOR UPDATE
  USING (is_game_owner(game_id));