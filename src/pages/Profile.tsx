import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, User, History } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import GameHistoryCard from "@/components/GameHistoryCard";
import TopNav from "@/components/TopNav";
import { toast } from "sonner";
import heroBg from "@/assets/hero-bg.jpg";

interface GamePlayer {
  id: string;
  slice_index: number;
  faction_name: string | null;
  nickname: string | null;
  placement: number | null;
  victory_points: number | null;
}

interface Game {
  id: string;
  map_string: string;
  player_count: number;
  notes: string | null;
  played_at: string;
  created_at: string;
  name: string | null;
  game_players: GamePlayer[];
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [loadingGames, setLoadingGames] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchGames = async () => {
      const { data, error } = await supabase
        .from("games")
        .select("*, game_players(*)")
        .order("played_at", { ascending: false });

      if (error) {
        toast.error("Failed to load games");
      } else {
        setGames((data as unknown as Game[]) || []);
      }
      setLoadingGames(false);
    };
    fetchGames();
  }, [user]);

  const handleViewMap = (mapString: string) => {
    navigate(`/game/new?map=${encodeURIComponent(mapString)}`);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  if (loading) return null;
  if (!user) return null;

  return (
    <div className="relative flex flex-col h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 opacity-10 bg-cover bg-center" style={{ backgroundImage: `url(${heroBg})` }} />
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/90 to-background" />

      <div className="relative z-10 flex flex-col h-full max-w-2xl mx-auto w-full">
        <TopNav />
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-shrink-0 px-4 pb-3"
        >

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal/10 border border-teal/30 flex items-center justify-center glow-teal">
              <User className="w-5 h-5 text-teal" />
            </div>
            <div className="flex-1">
              <h1 className="font-display text-sm tracking-widest text-foreground uppercase">
                Profile
              </h1>
              <p className="text-[10px] font-body text-muted-foreground tracking-wide">
                {user.email}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive hover:bg-destructive/20 transition-colors text-[10px] font-display uppercase tracking-wider"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </motion.header>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex-1 overflow-y-auto px-4 pb-6"
        >
          <div className="flex items-center gap-2 mb-3 mt-2">
            <History className="w-4 h-4 text-gold" />
            <h2 className="font-display text-xs tracking-widest text-foreground uppercase">
              Game History
            </h2>
            <span className="text-[10px] font-body text-muted-foreground">
              ({games.length} game{games.length !== 1 ? "s" : ""})
            </span>
          </div>

          {loadingGames ? (
            <div className="text-center py-12">
              <p className="text-xs text-muted-foreground font-body">Loading games…</p>
            </div>
          ) : games.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <p className="text-xs text-muted-foreground font-body">
                No games saved yet
              </p>
              <Link
                to="/game/new"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 transition-colors text-[10px] font-display uppercase tracking-wider"
              >
                Create a Game
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {games.map((game) => (
                <GameHistoryCard
                  key={game.id}
                  game={game}
                  onViewMap={handleViewMap}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
