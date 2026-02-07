-- Allow game participants to view game_players for their games
CREATE POLICY "Participants can view game players"
  ON public.game_players
  FOR SELECT
  USING (is_game_participant(game_id));