import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Gamepad2, Share2, Check, Copy, Users, LogIn, Trash2, RotateCcw, ClipboardCopy, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { parseMapString, type GeneratedMap } from "@/lib/map-data";
import { resolveRankedChoiceDraft, generateDraftOrder, getSnakeOrder, type FateMessage as FateMessageType } from "@/lib/draft-resolver";
import { generateGameName } from "@/lib/game-names";
import HexMapBoard from "@/components/map/HexMapBoard";
import ZoomableMapContainer from "@/components/map/ZoomableMapContainer";
import PlayerList, { type GamePlayerInfo } from "@/components/game/PlayerList";
import FactionDraftPanel from "@/components/game/FactionDraftPanel";
import SliceDraftPanel from "@/components/game/SliceDraftPanel";
import StrategyDraftPanel from "@/components/game/StrategyDraftPanel";
import FateMessage from "@/components/game/FateMessage";
import GameResultsPanel from "@/components/game/GameResultsPanel";
// GameCompleteSummary removed — standings now shown inline in PlayerList
import MapLegend from "@/components/map/MapLegend";
import TopNav from "@/components/TopNav";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import heroBg from "@/assets/hero-bg.jpg";

interface GameData {
  id: string;
  map_string: string;
  player_count: number;
  user_id: string;
  status: string;
  draft_order: number[] | null;
  notes: string | null;
  setup_mode: string;
  name: string | null;
}

const GameLobby = () => {
  const { id: gameId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [game, setGame] = useState<GameData | null>(null);
  const [players, setPlayers] = useState<GamePlayerInfo[]>([]);
  const [loadingGame, setLoadingGame] = useState(true);
  const [fateMessages, setFateMessages] = useState<FateMessageType[]>([]);
  const [copied, setCopied] = useState(false);
  const [copiedMap, setCopiedMap] = useState(false);
  const [joining, setJoining] = useState(false);

  const parsedMap = useMemo<GeneratedMap | null>(() => {
    if (!game) return null;
    try {
      return parseMapString(game.map_string);
    } catch {
      return null;
    }
  }, [game]);

  // Fetch game + players
  const fetchGame = useCallback(async () => {
    if (!gameId) return;
    const { data: gameData, error: gameError } = await supabase
      .from("games")
      .select("*")
      .eq("id", gameId)
      .single();

    if (gameError) {
      toast.error("Game not found");
      navigate("/");
      return;
    }

    const { data: playerData } = await supabase
      .from("game_players")
      .select("*")
      .eq("game_id", gameId)
      .order("joined_at" as any, { ascending: true });

    setGame(gameData as unknown as GameData);
    setPlayers((playerData as unknown as GamePlayerInfo[]) || []);
    setLoadingGame(false);
  }, [gameId, navigate]);

  useEffect(() => {
    fetchGame();
  }, [fetchGame]);

  // Realtime subscriptions
  useEffect(() => {
    if (!gameId) return;

    const channel = supabase
      .channel(`game-${gameId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "games", filter: `id=eq.${gameId}` },
        () => fetchGame(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "game_players", filter: `game_id=eq.${gameId}` },
        () => fetchGame(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, fetchGame]);

  const isHost = user && game && game.user_id === user.id;
  const myPlayer = players.find((p) => p.player_user_id === user?.id);
  const isSpectator = user && !myPlayer;
  const isAnon = !user && !authLoading;

  // Join game
  const handleJoin = async () => {
    if (!user || !gameId || !game) return;
    if (players.length >= game.player_count) {
      toast.error("Game is full");
      return;
    }
    setJoining(true);
    try {
      const { error } = await supabase
        .from("game_players")
        .insert({
          game_id: gameId,
          player_user_id: user.id,
          slice_index: -1,
        } as any);
      if (error) throw error;
      toast.success("Joined the game!");
    } catch (err: any) {
      toast.error(err.message || "Failed to join game");
    } finally {
      setJoining(false);
    }
  };

  // Copy share link
  const handleCopyLink = () => {
    const url = `${window.location.origin}/game/${gameId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success("Game link copied!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Export map string
  const handleExportMap = () => {
    if (!game) return;
    navigator.clipboard.writeText(game.map_string).then(() => {
      setCopiedMap(true);
      toast.success("Map string copied to clipboard");
      setTimeout(() => setCopiedMap(false), 2000);
    });
  };

  // Regenerate game name (host only)
  const handleRegenerateName = async () => {
    if (!gameId || !game) return;
    const newName = generateGameName();
    const { error } = await supabase
      .from("games")
      .update({ name: newName } as any)
      .eq("id", gameId);
    if (error) {
      toast.error("Failed to update game name");
      return;
    }
    setGame((prev) => (prev ? { ...prev, name: newName } : prev));
    toast.success("Game renamed!");
  };

  // Delete game (host only)
  const handleDeleteGame = async () => {
    if (!gameId) return;
    const { error } = await supabase.from("games").delete().eq("id", gameId);
    if (error) {
      toast.error("Failed to delete game");
    } else {
      toast.success("Game deleted");
      navigate("/profile");
    }
  };

  // Complete game (host only)
  const handleCompleteGame = async (
    results: { playerId: string; placement: number | null; victoryPoints: number | null }[],
    notes: string
  ) => {
    if (!gameId || !game) return;
    try {
      // Update each player's placement and VP
      for (const r of results) {
        const { error } = await supabase
          .from("game_players")
          .update({
            placement: r.placement,
            victory_points: r.victoryPoints,
          } as any)
          .eq("id", r.playerId);
        if (error) throw error;
      }

      // Update game status and notes
      const updateData: any = { status: "complete" };
      if (notes.trim()) updateData.notes = notes.trim();
      const { error } = await supabase
        .from("games")
        .update(updateData)
        .eq("id", gameId);
      if (error) throw error;

      toast.success("Game results recorded!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save results");
    }
  };

  // Revert game from complete back to ready (host only)
  const handleRevertToReady = async () => {
    if (!gameId || !game) return;
    try {
      // Clear placement and VP for all players
      for (const p of players) {
        const { error } = await supabase
          .from("game_players")
          .update({ placement: null, victory_points: null } as any)
          .eq("id", p.id);
        if (error) throw error;
      }
      // Set status back to ready, clear notes
      const { error } = await supabase
        .from("games")
        .update({ status: "ready", notes: null } as any)
        .eq("id", gameId);
      if (error) throw error;
      toast.success("Game reverted to In Progress");
    } catch (err: any) {
      toast.error(err.message || "Failed to revert game");
    }
  };

  // Faction draft: lock in preferences
  const handleFactionSubmit = async (pref1: string, pref2: string, pref3: string) => {
    if (!myPlayer) return;
    const { error } = await supabase
      .from("game_players")
      .update({
        faction_pref_1: pref1,
        faction_pref_2: pref2,
        faction_pref_3: pref3,
        faction_locked: true,
      } as any)
      .eq("id", myPlayer.id);

    if (error) {
      toast.error("Failed to submit preferences");
      return;
    }

    // Check if all players have locked in
    const updatedPlayers = players.map((p) =>
      p.id === myPlayer.id ? { ...p, faction_pref_1: pref1, faction_pref_2: pref2, faction_pref_3: pref3, faction_locked: true } as any : p,
    );

    const allLocked = updatedPlayers.every((p: any) => p.faction_locked);
    if (allLocked && isHost && game) {
      // Resolve draft
      const prefs = updatedPlayers.map((p: any) => ({
        playerId: p.id,
        playerName: p.nickname || "Player",
        pref1: p.faction_pref_1 || "",
        pref2: p.faction_pref_2 || "",
        pref3: p.faction_pref_3 || "",
      }));

      const result = resolveRankedChoiceDraft(prefs);
      setFateMessages(result.fateMessages);

      // Update each player's faction assignment
      for (const [playerId, factionName] of Object.entries(result.assignments)) {
        await supabase
          .from("game_players")
          .update({ faction_name: factionName } as any)
          .eq("id", playerId);
      }

      // Generate draft order and advance phase
      const draftOrder = generateDraftOrder(game.player_count);
      
      // Assign draft positions to players
      for (let i = 0; i < updatedPlayers.length; i++) {
        await supabase
          .from("game_players")
          .update({ draft_position: i } as any)
          .eq("id", updatedPlayers[i].id);
      }

      await supabase
        .from("games")
        .update({ status: "slice_draft", draft_order: draftOrder } as any)
        .eq("id", game.id);
    }
  };

  // Slice draft: select slice
  const handleSliceSelect = async (sliceIndex: number) => {
    if (!myPlayer || !game) return;
    const { error } = await supabase
      .from("game_players")
      .update({ slice_index: sliceIndex } as any)
      .eq("id", myPlayer.id);

    if (error) {
      toast.error("Failed to select slice");
      return;
    }

    // Check if all slices assigned
    const pickedCount = players.filter((p) => p.slice_index >= 0).length + 1;
    if (pickedCount >= game.player_count) {
      // Advance to strategy draft
      await supabase
        .from("games")
        .update({ status: "strategy_draft" } as any)
        .eq("id", game.id);
    }
  };

  // Strategy draft: select card
  const handleStrategySelect = async (cardNumber: number) => {
    if (!myPlayer || !game) return;
    const { error } = await supabase
      .from("game_players")
      .update({ strategy_card: cardNumber } as any)
      .eq("id", myPlayer.id);

    if (error) {
      toast.error("Failed to select strategy card");
      return;
    }

    // Check if all strategy cards assigned
    const pickedCount = players.filter((p) => p.strategy_card !== null).length + 1;
    if (pickedCount >= game.player_count) {
      await supabase
        .from("games")
        .update({ status: "ready" } as any)
        .eq("id", game.id);
    }
  };

  // Derived state for drafts
  const draftOrder = game?.draft_order || [];
  const strategyOrder = getSnakeOrder(draftOrder);
  const slicePickCount = players.filter((p) => p.slice_index >= 0).length;
  const strategyPickCount = players.filter((p) => p.strategy_card !== null).length;
  const availableSlices = Array.from({ length: game?.player_count || 0 }, (_, i) => i)
    .filter((i) => !players.some((p) => p.slice_index === i));

  const currentSliceTurnPosition = draftOrder[slicePickCount];
  const currentSliceTurnPlayer = players.find((p) => p.draft_position === currentSliceTurnPosition);

  const currentStrategyTurnPosition = strategyOrder[strategyPickCount];
  const currentStrategyTurnPlayer = players.find((p) => p.draft_position === currentStrategyTurnPosition);

  const currentTurnPlayerId =
    game?.status === "slice_draft" ? currentSliceTurnPlayer?.player_user_id || null :
    game?.status === "strategy_draft" ? currentStrategyTurnPlayer?.player_user_id || null :
    null;

  const takenCards: Record<number, string> = {};
  players.forEach((p) => {
    if (p.strategy_card !== null) {
      takenCards[p.strategy_card] = p.nickname || "Player";
    }
  });

  const sliceFactions = useMemo(() => {
    if (!parsedMap) return [];
    const factions: (string | null)[] = Array(parsedMap.playerCount).fill(null);
    players.forEach((p) => {
      if (p.slice_index >= 0 && p.slice_index < factions.length && p.faction_name) {
        factions[p.slice_index] = p.faction_name;
      }
    });
    return factions;
  }, [parsedMap, players]);

  const sliceNicknames = useMemo(() => {
    if (!parsedMap) return [];
    const names: string[] = Array(parsedMap.playerCount).fill("");
    players.forEach((p) => {
      if (p.slice_index >= 0 && p.slice_index < names.length) {
        names[p.slice_index] = p.nickname || "";
      }
    });
    return names;
  }, [parsedMap, players]);

  const statusLabel: Record<string, string> = {
    setup: "Setting Up",
    faction_draft: "Faction Draft",
    slice_draft: "Slice Draft",
    strategy_draft: "Strategy Draft",
    ready: "In Progress",
    complete: "Completed",
  };

  if (loadingGame) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <p className="text-xs font-body text-muted-foreground">Loading game…</p>
      </div>
    );
  }

  if (!game) return null;

  return (
    <div className="relative flex flex-col h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 opacity-10 bg-cover bg-center" style={{ backgroundImage: `url(${heroBg})` }} />
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/90 to-background" />

      <div className="relative z-10 flex flex-col h-full w-full">
        <TopNav />

        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-shrink-0 px-4 lg:px-8 pb-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center glow-gold">
              <Gamepad2 className="w-5 h-5 text-gold" />
            </div>
            <div className="flex-1">
              <h1 className="font-display text-sm tracking-widest text-foreground uppercase">
                Game Lobby
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-body text-muted-foreground tracking-wide">
                  {game.player_count} players
                </span>
                <span className="text-[8px] font-display uppercase tracking-wider px-1.5 py-0.5 rounded bg-gold/10 border border-gold/20 text-gold">
                  {statusLabel[game.status] || game.status}
                </span>
                {game.name && (
                  <>
                    <span className="text-muted-foreground/40">|</span>
                    <span className="text-[9px] font-display uppercase tracking-wider text-muted-foreground">Game Name:</span>
                    <span className="text-[10px] font-body text-gold/80 tracking-wide italic">
                      {game.name}
                    </span>
                    {isHost && (
                      <button
                        onClick={handleRegenerateName}
                        className="p-0.5 rounded hover:bg-gold/10 text-muted-foreground hover:text-gold transition-colors"
                        title="Generate new name"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isHost && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive hover:bg-destructive/20 transition-colors text-[10px] font-display uppercase tracking-wider">
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this game?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the game and all player data. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteGame} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete Game
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <button
                onClick={handleExportMap}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/30 border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-[10px] font-display uppercase tracking-wider"
              >
                {copiedMap ? <Check className="w-3 h-3 text-green-400" /> : <ClipboardCopy className="w-3 h-3" />}
                {copiedMap ? "Copied" : "Export Map"}
              </button>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/30 border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-[10px] font-display uppercase tracking-wider"
              >
                {copied ? <Check className="w-3 h-3 text-green-400" /> : <Share2 className="w-3 h-3" />}
                {copied ? "Copied" : "Share Link"}
              </button>
            </div>
          </div>
        </motion.header>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-8 pb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Left: Map */}
            <div className="flex-1 min-w-0 order-2 lg:order-1">
              {parsedMap && (
                <div className="space-y-2">
                  <ZoomableMapContainer>
                    <HexMapBoard
                      map={parsedMap}
                      sliceFactions={sliceFactions}
                      sliceNicknames={sliceNicknames}
                    />
                  </ZoomableMapContainer>
                  <MapLegend />
                </div>
              )}
            </div>

            {/* Right: Sidebar — shows first on mobile (order-1), second on lg (order-2) */}
            <div className="w-full lg:w-80 space-y-4 order-1 lg:order-2">
              {/* Player list / standings */}
              <PlayerList
                players={players}
                hostId={game.user_id}
                currentUserId={user?.id || null}
                gameStatus={game.status}
                currentTurnPlayerId={currentTurnPlayerId}
                playerCount={game.player_count}
                notes={game.notes}
              />

              {/* Join button for non-participants */}
              {isAnon && (
                <div className="rounded-lg border border-gold/20 bg-gold/5 p-3 space-y-2">
                  <p className="text-xs font-body text-foreground">
                    Sign in to join this game and participate in the draft.
                  </p>
                  <button
                    onClick={() => navigate("/auth")}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gold/20 border border-gold/30 text-gold hover:bg-gold/30 transition-colors text-xs font-display uppercase tracking-wider"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Sign In
                  </button>
                </div>
              )}

              {isSpectator && players.length < game.player_count && (
                <button
                  onClick={handleJoin}
                  disabled={joining}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gold/20 border border-gold/30 text-gold hover:bg-gold/30 transition-colors text-xs font-display uppercase tracking-wider disabled:opacity-50"
                >
                  <Users className="w-3.5 h-3.5" />
                  {joining ? "Joining…" : "Join Game"}
                </button>
              )}

              {isSpectator && players.length >= game.player_count && (
                <div className="rounded-lg border border-border bg-muted/10 p-3">
                  <p className="text-[10px] font-body text-muted-foreground italic">
                    Spectating — the game is full.
                  </p>
                </div>
              )}

              {/* Phase-specific panels */}
              {myPlayer && game.status === "faction_draft" && (
                <FactionDraftPanel
                  onSubmit={handleFactionSubmit}
                  locked={myPlayer.faction_locked}
                  assignedFaction={myPlayer.faction_name}
                />
              )}

              {/* Fate messages */}
              {fateMessages.length > 0 && <FateMessage messages={fateMessages} />}

              {myPlayer && game.status === "slice_draft" && (
                <SliceDraftPanel
                  draftOrder={draftOrder}
                  currentPickIndex={slicePickCount}
                  myDraftPosition={myPlayer.draft_position}
                  availableSlices={availableSlices}
                  playerCount={game.player_count}
                  onSelect={handleSliceSelect}
                  selections={{}}
                />
              )}

              {myPlayer && game.status === "strategy_draft" && (
                <StrategyDraftPanel
                  strategyOrder={strategyOrder}
                  currentPickIndex={strategyPickCount}
                  myDraftPosition={myPlayer.draft_position}
                  takenCards={takenCards}
                  playerCount={game.player_count}
                  onSelect={handleStrategySelect}
                />
              )}

              {game.status === "ready" && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-teal/30 bg-teal/5 p-4 space-y-2">
                    <h3 className="font-display text-xs tracking-widest uppercase text-teal">
                      🎉 Game In Progress
                    </h3>
                    <p className="text-[10px] font-body text-foreground/80">
                      {game.setup_mode === "host_chooses"
                        ? "All assignments were made by the host. The galaxy awaits!"
                        : "All factions, slices, and strategy cards have been assigned. The galaxy awaits!"}
                    </p>
                    {game.setup_mode === "host_chooses" && (
                      <span className="inline-block text-[8px] font-display uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted/30 border border-border text-muted-foreground">
                        Host Setup
                      </span>
                    )}
                  </div>

                  {isHost && (
                    <GameResultsPanel
                      players={players}
                      onSubmit={handleCompleteGame}
                    />
                  )}
                </div>
              )}

              {game.status === "complete" && isHost && (
                <button
                  onClick={handleRevertToReady}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-muted/20 border border-border text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors text-[10px] font-display uppercase tracking-wider"
                >
                  <RotateCcw className="w-3 h-3" />
                  Revert to In Progress
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameLobby;
