
-- Add game lobby columns to games table
ALTER TABLE public.games 
  ADD COLUMN status text NOT NULL DEFAULT 'setup',
  ADD COLUMN draft_order integer[];

-- Add draft tracking columns to game_players table
ALTER TABLE public.game_players
  ADD COLUMN strategy_card integer,
  ADD COLUMN draft_position integer,
  ADD COLUMN joined_at timestamptz DEFAULT now(),
  ADD COLUMN faction_pref_1 text,
  ADD COLUMN faction_pref_2 text,
  ADD COLUMN faction_pref_3 text,
  ADD COLUMN faction_locked boolean DEFAULT false;

-- Allow any authenticated user to VIEW games (for joining via link and spectating)
CREATE POLICY "Authenticated users can view any game"
  ON public.games FOR SELECT
  TO authenticated
  USING (true);

-- Allow host to update their own game (status, draft_order, etc.)
CREATE POLICY "Host can update their own game"
  ON public.games FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow any authenticated user to VIEW game_players (spectators can see draft state)
CREATE POLICY "Authenticated users can view game players"
  ON public.game_players FOR SELECT
  TO authenticated
  USING (true);

-- Allow anon users to view games (spectators without login)
CREATE POLICY "Anyone can view games"
  ON public.games FOR SELECT
  TO anon
  USING (true);

-- Allow anon users to view game players (spectators without login)
CREATE POLICY "Anyone can view game players"
  ON public.game_players FOR SELECT
  TO anon
  USING (true);

-- Allow authenticated users to join a game (insert themselves)
CREATE POLICY "Authenticated users can join games"
  ON public.game_players FOR INSERT
  TO authenticated
  WITH CHECK (player_user_id = auth.uid());

-- Allow players to update their own draft picks
CREATE POLICY "Players can update own draft picks"
  ON public.game_players FOR UPDATE
  TO authenticated
  USING (player_user_id = auth.uid());

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.games;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_players;
