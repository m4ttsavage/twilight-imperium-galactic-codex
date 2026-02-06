import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Map, RefreshCw, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { generateMap, getSupportedPlayerCounts, type GeneratedMap } from "@/lib/map-data";
import ImportMapDialog from "@/components/map/ImportMapDialog";
import { TI4_FACTIONS } from "@/lib/factions";
import HexMapBoard from "@/components/map/HexMapBoard";
import SlicePanel from "@/components/map/SlicePanel";
import FloatingChat from "@/components/FloatingChat";
import heroBg from "@/assets/hero-bg.jpg";

const MapGenerator = () => {
  const [playerCount, setPlayerCount] = useState(6);
  const [map, setMap] = useState<GeneratedMap | null>(null);
  const [sliceFactions, setSliceFactions] = useState<(string | null)[]>([]);
  const [sliceNicknames, setSliceNicknames] = useState<string[]>([]);

  // Read game setup from localStorage (set by ChatInterface)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("ti4-game-setup");
      if (!raw) return;
      const setup = JSON.parse(raw);
      const allFactions: string[] = [];
      if (setup.selectedFaction) allFactions.push(setup.selectedFaction);
      if (setup.opponents?.length) allFactions.push(...setup.opponents);
      if (allFactions.length >= 3 && allFactions.length <= 6) {
        setPlayerCount(allFactions.length);
        const newMap = generateMap(allFactions.length);
        setMap(newMap);
        const factions = allFactions.slice(0, newMap.playerCount);
        setSliceFactions(factions.concat(Array(newMap.playerCount - factions.length).fill(null)));
        const nicks = factions.map((f) => setup.nicknames?.[f] || "");
        setSliceNicknames(nicks.concat(Array(newMap.playerCount - nicks.length).fill("")));
        return;
      }
    } catch { /* ignore */ }
    const newMap = generateMap(6);
    setMap(newMap);
    setSliceFactions(Array(6).fill(null));
    setSliceNicknames(Array(6).fill(""));
  }, []);

  const handleGenerate = useCallback(() => {
    const newMap = generateMap(playerCount);
    setMap(newMap);
    setSliceFactions((prev) => {
      if (prev.length === playerCount) return prev;
      return Array(playerCount).fill(null);
    });
    setSliceNicknames((prev) => {
      if (prev.length === playerCount) return prev;
      return Array(playerCount).fill("");
    });
  }, [playerCount]);

  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count);
    const newMap = generateMap(count);
    setMap(newMap);
    setSliceFactions(Array(count).fill(null));
    setSliceNicknames(Array(count).fill(""));
  };

  const handleAssign = (sliceIndex: number, factionName: string | null) => {
    setSliceFactions((prev) => {
      const next = [...prev];
      next[sliceIndex] = factionName;
      return next;
    });
  };

  const handleNickname = (sliceIndex: number, nickname: string) => {
    setSliceNicknames((prev) => {
      const next = [...prev];
      next[sliceIndex] = nickname;
      return next;
    });
  };

  const allFactionNames = TI4_FACTIONS.map((f) => f.name);

  return (
    <div className="relative flex flex-col h-screen overflow-hidden bg-background">
      {/* Background */}
      <div className="absolute inset-0 opacity-10 bg-cover bg-center" style={{ backgroundImage: `url(${heroBg})` }} />
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/90 to-background" />

      <div className="relative z-10 flex flex-col h-full w-full">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-shrink-0 px-4 lg:px-8 pt-5 pb-3"
        >
          <div className="flex items-center gap-3 mb-3">
            <Link to="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-xs font-body">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Chat
            </Link>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center glow-gold">
              <Map className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h1 className="font-display text-sm tracking-widest text-foreground uppercase">
                Map Generator
              </h1>
              <p className="text-[10px] font-body text-muted-foreground tracking-wide">
                Generate balanced galaxy maps & assign slices to factions
              </p>
            </div>
          </div>

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
            <div className="ml-auto flex items-center gap-2">
              <ImportMapDialog onImport={(imported) => {
                setPlayerCount(imported.playerCount);
                setMap(imported);
                setSliceFactions(Array(imported.playerCount).fill(null));
                setSliceNicknames(Array(imported.playerCount).fill(""));
              }} />
              <button
                onClick={handleGenerate}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 transition-colors text-[10px] font-display uppercase tracking-wider"
              >
                <RefreshCw className="w-3 h-3" />
                Regenerate
              </button>
            </div>
          </div>
        </motion.header>

        {/* Content: side-by-side on desktop, stacked on mobile */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-8 pb-6">
          {map && (
            <motion.div
              key={`${map.playerCount}-${map.hexes.length}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col lg:flex-row gap-4 lg:gap-6 lg:items-start"
            >
              {/* Map — takes more space on desktop */}
              <div className="flex-1 min-w-0">
                <div className="rounded-xl border border-border bg-card/40 p-2 overflow-hidden">
                  <HexMapBoard map={map} sliceFactions={sliceFactions} />
                </div>
              </div>

              {/* Slice panel — sidebar on desktop */}
              <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
                <SlicePanel
                  map={map}
                  sliceFactions={sliceFactions}
                  sliceNicknames={sliceNicknames}
                  availableFactions={allFactionNames}
                  onAssign={handleAssign}
                  onNickname={handleNickname}
                />
              </div>
            </motion.div>
          )}

          {/* Attribution */}
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

      {/* Floating AI Chat */}
      <FloatingChat />
    </div>
  );
};

export default MapGenerator;
