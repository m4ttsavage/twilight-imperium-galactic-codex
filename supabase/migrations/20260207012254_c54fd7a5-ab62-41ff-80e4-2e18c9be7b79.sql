
-- =============================================
-- Server-side input validation constraints
-- =============================================

-- Games table constraints
ALTER TABLE public.games ADD CONSTRAINT check_player_count 
  CHECK (player_count >= 3 AND player_count <= 8);

ALTER TABLE public.games ADD CONSTRAINT check_map_string_length 
  CHECK (length(map_string) <= 50000);

ALTER TABLE public.games ADD CONSTRAINT check_notes_length 
  CHECK (notes IS NULL OR length(notes) <= 2000);

ALTER TABLE public.games ADD CONSTRAINT check_status_valid
  CHECK (status IN ('setup', 'faction_draft', 'slice_draft', 'strategy_draft', 'ready'));

-- Game players table constraints
ALTER TABLE public.game_players ADD CONSTRAINT check_slice_index
  CHECK (slice_index >= -1 AND slice_index <= 7);

ALTER TABLE public.game_players ADD CONSTRAINT check_placement 
  CHECK (placement IS NULL OR (placement >= 1 AND placement <= 8));

ALTER TABLE public.game_players ADD CONSTRAINT check_victory_points 
  CHECK (victory_points IS NULL OR (victory_points >= 0 AND victory_points <= 20));

ALTER TABLE public.game_players ADD CONSTRAINT check_strategy_card
  CHECK (strategy_card IS NULL OR (strategy_card >= 1 AND strategy_card <= 8));

ALTER TABLE public.game_players ADD CONSTRAINT check_draft_position
  CHECK (draft_position IS NULL OR (draft_position >= 0 AND draft_position <= 7));

ALTER TABLE public.game_players ADD CONSTRAINT check_nickname_length 
  CHECK (nickname IS NULL OR length(nickname) <= 100);

ALTER TABLE public.game_players ADD CONSTRAINT check_faction_name_length
  CHECK (faction_name IS NULL OR length(faction_name) <= 100);

ALTER TABLE public.game_players ADD CONSTRAINT check_faction_pref_length
  CHECK (
    (faction_pref_1 IS NULL OR length(faction_pref_1) <= 100) AND
    (faction_pref_2 IS NULL OR length(faction_pref_2) <= 100) AND
    (faction_pref_3 IS NULL OR length(faction_pref_3) <= 100)
  );

ALTER TABLE public.game_players ADD CONSTRAINT check_email_length
  CHECK (email IS NULL OR length(email) <= 255);

-- Profiles table constraints
ALTER TABLE public.profiles ADD CONSTRAINT check_display_name_length
  CHECK (display_name IS NULL OR length(display_name) <= 100);

ALTER TABLE public.profiles ADD CONSTRAINT check_email_length
  CHECK (email IS NULL OR length(email) <= 255);

ALTER TABLE public.profiles ADD CONSTRAINT check_avatar_url_length
  CHECK (avatar_url IS NULL OR length(avatar_url) <= 2000);
