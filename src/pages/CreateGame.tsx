import { useState, useCallback, useRef, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { RefreshCw, ExternalLink, Copy, Share2, Check, Gamepad2, Users, UserCog, LogIn } from "lucide-react";
import { generateMap, getSupportedPlayerCounts, parseMapString, exportMapString, type GeneratedMap } from "@/lib/map-data";
import { getTilesForBanks, type TileBank } from "@/lib/tile-database";
import { improveBalance } from "@/lib/map-balance";
import ImportMapDialog from "@/components/map/ImportMapDialog";
import HexMapBoard from "@/components/map/HexMapBoard";
import SystemBankSelector from "@/components/map/SystemBankSelector";
import BalanceDropdown from "@/components/map/BalanceDropdown";
import MapLegend from "@/components/map/MapLegend";
import FloatingChat from "@/components/FloatingChat";
import TopNav from "@/components/TopNav";
import HostSetupPanel, { type PlayerAssignment, type InitialPlayerData } from "@/components/game/HostSetupPanel";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import heroBg from "@/assets/hero-bg.jpg";

type SetupMode = "players_choose" | "host_chooses";

const CreateGame = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [playerCount, setPlayerCount] = useState(6);
  const [map, setMap] = useState<GeneratedMap | null>(() => {
    const mapParam = searchParams.get("map");
    if (mapParam) {
      try {
        const imported = parseMapString(mapParam);
        return imported;
      } catch { /* fall through */ }
    }
    return generateMap(6);
  });
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [enabledBanks, setEnabledBanks] = useState<TileBank[]>(["base", "pok", "te"]);
  const [creating, setCreating] = useState(false);
  const [setupMode, setSetupMode] = useState<SetupMode>("players_choose");
  const [hostValid, setHostValid] = useState(false);
  const hostAssignmentsRef = useRef<PlayerAssignment[]>([]);

  // Read persisted faction/player data from codex page
  const initialPlayerData = useMemo<InitialPlayerData[]>(() => {
    try {
      const raw = localStorage.getItem("ti4-game-setup");
      if (!raw) return [];
      const data = JSON.parse(raw);
      const result: InitialPlayerData[] = [];
      // Add selected faction with its nickname
      if (data.selectedFaction) {
        result.push({
          factionName: data.selectedFaction,
          playerName: data.nicknames?.[data.selectedFaction] || "",
        });
      }
      // Add opponents with their nicknames
      if (Array.isArray(data.opponents)) {
        for (const opp of data.opponents) {
          result.push({
            factionName: opp,
            playerName: data.nicknames?.[opp] || "",
          });
        }
      }
      return result;
    } catch {
      return [];
    }
  }, []);

  const handleAssignmentsChange = useCallback((assignments: PlayerAssignment[], valid: boolean) => {
    hostAssignmentsRef.current = assignments;
    setHostValid(valid);
  }, []);

  const getFilteredTiles = useCallback(() => {
    return getTilesForBanks(enabledBanks);
  }, [enabledBanks]);

  const handleGenerate = useCallback(() => {
    const { blue, red } = getFilteredTiles();
    const newMap = generateMap(playerCount, blue, red);
    setMap(newMap);
  }, [playerCount, getFilteredTiles]);

  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count);
    const { blue, red } = getFilteredTiles();
    const newMap = generateMap(count, blue, red);
    setMap(newMap);
  };

  const handleBalance = useCallback(
    (metric: "resources" | "influence" | "total") => {
      if (!map) return;
      const improved = improveBalance(map, metric);
      setMap(improved);
      const label = metric === "total" ? "overall balance" : metric;
      toast.success(`Improved ${label}`);
    },
    [map],
  );

  const handleExport = useCallback(() => {
    if (!map) return;
    const mapString = exportMapString(map);
    navigator.clipboard.writeText(mapString).then(() => {
      setCopied(true);
      toast.success("Map string copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    });
  }, [map]);

  const handleShare = useCallback(() => {
    if (!map) return;
    const mapString = exportMapString(map);
    const url = new URL(window.location.href);
    url.searchParams.set("map", mapString);
    url.hash = "";
    navigator.clipboard.writeText(url.toString()).then(() => {
      setShared(true);
      setSearchParams({ map: mapString }, { replace: true });
      toast.success("Share link copied to clipboard");
      setTimeout(() => setShared(false), 2000);
    });
  }, [map, setSearchParams]);

  const handleCreateGame = async () => {
    if (!map || !user) return;

    if (setupMode === "host_chooses") {
      const assignments = hostAssignmentsRef.current;
      if (!hostValid) {
        toast.error("Please fill in all player assignments before creating the game.");
        return;
      }

      setCreating(true);
      try {
        const mapString = exportMapString(map);
        const { data: game, error } = await supabase
          .from("games")
          .insert({
            user_id: user.id,
            map_string: mapString,
            player_count: map.playerCount,
            status: "ready",
            setup_mode: "host_chooses",
          } as any)
          .select("id")
          .single();

        if (error) throw error;

        // Insert all player rows (without email - that goes to private table)
        const playerRows = assignments.map((a) => ({
          game_id: game.id,
          nickname: a.name.trim(),
          faction_name: a.factionName,
          slice_index: a.sliceIndex,
          strategy_card: a.strategyCard,
          faction_locked: true,
          player_user_id: null,
        }));

        const { data: insertedPlayers, error: insertError } = await supabase
          .from("game_players")
          .insert(playerRows as any)
          .select("id");

        if (insertError) throw insertError;

        // Insert emails into private table (only host can access)
        const emailRows = assignments
          .map((a, i) => ({
            game_player_id: insertedPlayers[i].id,
            game_id: game.id,
            email: a.email.trim(),
          }))
          .filter((row) => row.email.length > 0);

        if (emailRows.length > 0) {
          const { error: emailError } = await supabase
            .from("game_player_emails" as any)
            .insert(emailRows as any);
          if (emailError) throw emailError;
        }

        toast.success("Game created with all assignments!");
        navigate(`/game/${game.id}`);
      } catch (err: any) {
        toast.error(err.message || "Failed to create game");
      } finally {
        setCreating(false);
      }
      return;
    }

    // Players Choose mode (existing behavior)
    setCreating(true);
    try {
      const mapString = exportMapString(map);
      const { data: game, error } = await supabase
        .from("games")
        .insert({
          user_id: user.id,
          map_string: mapString,
          player_count: map.playerCount,
          status: "faction_draft",
          setup_mode: "players_choose",
        } as any)
        .select("id")
        .single();

      if (error) throw error;

      // Host auto-joins as the first player
      const { error: joinError } = await supabase
        .from("game_players")
        .insert({
          game_id: game.id,
          player_user_id: user.id,
          slice_index: -1,
          nickname: null,
        } as any);

      if (joinError) throw joinError;

      toast.success("Game created! Share the link with your players.");
      navigate(`/game/${game.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create game");
    } finally {
      setCreating(false);
    }
  };

  const isHostChoosesValid = setupMode === "host_chooses" ? hostValid : true;

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
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center glow-gold">
              <Gamepad2 className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h1 className="font-display text-sm tracking-widest text-foreground uppercase">
                Create Game
              </h1>
              <p className="text-[10px] font-body text-muted-foreground tracking-wide">
                Generate a balanced galaxy map, then create a multiplayer game lobby
              </p>
            </div>
          </div>

          {/* Setup Mode Toggle */}
          {user && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-display uppercase tracking-widest text-muted-foreground">
                Setup
              </span>
              <button
                onClick={() => setSetupMode("players_choose")}
                className={`flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-lg font-body transition-colors ${
                  setupMode === "players_choose"
                    ? "bg-gold/20 text-gold border border-gold/30"
                    : "bg-muted/30 text-muted-foreground border border-transparent hover:text-foreground"
                }`}
              >
                <Users className="w-3 h-3" />
                Players Choose
              </button>
              <button
                onClick={() => setSetupMode("host_chooses")}
                className={`flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-lg font-body transition-colors ${
                  setupMode === "host_chooses"
                    ? "bg-gold/20 text-gold border border-gold/30"
                    : "bg-muted/30 text-muted-foreground border border-transparent hover:text-foreground"
                }`}
              >
                <UserCog className="w-3 h-3" />
                Host Chooses
              </button>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-display uppercase tracking-widest text-muted-foreground">
              Players
            </span>
            {getSupportedPlayerCounts().map((n) => (
              <button
                key={n}
                onClick={() => handlePlayerCountChange(n)}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-body transition-colors ${
                  playerCount === n
                    ? "bg-gold/20 text-gold border border-gold/30"
                    : "bg-muted/30 text-muted-foreground border border-transparent hover:text-foreground"
                }`}
              >
                {n}p
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2 flex-wrap">
              <SystemBankSelector enabled={enabledBanks} onChange={setEnabledBanks} />
              <BalanceDropdown onBalance={handleBalance} disabled={!map} />
              <ImportMapDialog onImport={(imported) => {
                setPlayerCount(imported.playerCount);
                setMap(imported);
              }} />
              <button
                onClick={handleExport}
                disabled={!map}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/30 border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-[10px] font-display uppercase tracking-wider disabled:opacity-40"
              >
                {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied" : "Export"}
              </button>
              <button
                onClick={handleShare}
                disabled={!map}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/30 border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-[10px] font-display uppercase tracking-wider disabled:opacity-40"
              >
                {shared ? <Check className="w-3 h-3 text-green-400" /> : <Share2 className="w-3 h-3" />}
                {shared ? "Copied" : "Share"}
              </button>
              <button
                onClick={handleGenerate}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/30 border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-[10px] font-display uppercase tracking-wider"
              >
                <RefreshCw className="w-3 h-3" />
                Regenerate
              </button>
              {map && user && (
                <button
                  onClick={handleCreateGame}
                  disabled={creating}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gold/20 border border-gold/30 text-gold hover:bg-gold/30 transition-colors text-[10px] font-display uppercase tracking-wider disabled:opacity-50"
                >
                  <Gamepad2 className="w-3.5 h-3.5" />
                  {creating ? "Creating…" : "Create Game"}
                </button>
              )}
              {setupMode === "host_chooses" && !hostValid && map && user && (
                <span className="text-[9px] font-body text-muted-foreground italic">
                  Fill in all assignments to create
                </span>
              )}
              {!user && !authLoading && (
                <button
                  onClick={() => navigate("/auth")}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gold/20 border border-gold/30 text-gold hover:bg-gold/30 transition-colors text-[10px] font-display uppercase tracking-wider animate-pulse hover:animate-none"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign in to set up games & track results
                </button>
              )}
            </div>
          </div>
        </motion.header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-8 pb-6">
          {map && (
            <motion.div
              key={`${map.playerCount}-${map.hexes.length}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-3"
            >
              {/* Host Setup Panel — above the map */}
              {setupMode === "host_chooses" && user && (
                <div className="rounded-xl border border-border bg-card/40 p-3">
                  <HostSetupPanel
                    playerCount={playerCount}
                    initialData={initialPlayerData}
                    onAssignmentsChange={handleAssignmentsChange}
                  />
                </div>
              )}

              <div className="rounded-xl border border-border bg-card/40 p-2 overflow-hidden">
                <HexMapBoard
                  map={map}
                  sliceFactions={Array(map.playerCount).fill(null)}
                  sliceNicknames={Array(map.playerCount).fill("")}
                />
              </div>
              <MapLegend />
            </motion.div>
          )}

          <div className="text-center py-3 mt-4 border-t border-border/50">
            <p className="text-[9px] text-muted-foreground/60 font-body">
              Map generation inspired by{" "}
              <a
                href="https://joepinion.github.io/ti4-map-lab/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal/70 hover:text-teal transition-colors inline-flex items-center gap-0.5"
              >
                TI4 Map Lab
                <ExternalLink className="w-2.5 h-2.5" />
              </a>{" "}
              by Joe Ellis. This is a fan project — Twilight Imperium is © Fantasy Flight Games.
            </p>
          </div>
        </div>
      </div>

      <FloatingChat />
    </div>
  );
};

export default CreateGame;
