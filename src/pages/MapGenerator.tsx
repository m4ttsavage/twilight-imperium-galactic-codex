import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Map, RefreshCw, ExternalLink, Copy, Share2, Check } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { generateMap, getSupportedPlayerCounts, parseMapString, exportMapString, type GeneratedMap } from "@/lib/map-data";
import { getTilesForBanks, type TileBank } from "@/lib/tile-database";
import { improveBalance } from "@/lib/map-balance";
import ImportMapDialog from "@/components/map/ImportMapDialog";
import SaveGameDialog from "@/components/SaveGameDialog";
import { TI4_FACTIONS } from "@/lib/factions";
import HexMapBoard from "@/components/map/HexMapBoard";
import ZoomableMapContainer from "@/components/map/ZoomableMapContainer";
import SlicePanel from "@/components/map/SlicePanel";
import SystemBankSelector from "@/components/map/SystemBankSelector";
import BalanceDropdown from "@/components/map/BalanceDropdown";
import FactionPickerDialog from "@/components/map/FactionPickerDialog";
import MapLegend from "@/components/map/MapLegend";
import FloatingChat from "@/components/FloatingChat";
import { useIsMobile } from "@/hooks/use-mobile";
import TopNav from "@/components/TopNav";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import heroBg from "@/assets/hero-bg.jpg";

const MapGenerator = () => {
  const { user, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const [playerCount, setPlayerCount] = useState(6);
  const [map, setMap] = useState<GeneratedMap | null>(null);
  const [sliceFactions, setSliceFactions] = useState<(string | null)[]>([]);
  const [sliceNicknames, setSliceNicknames] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [enabledBanks, setEnabledBanks] = useState<TileBank[]>(["base", "pok", "te"]);
  const [activePickerSlice, setActivePickerSlice] = useState<number | null>(null);
  const [gameSetupFactions, setGameSetupFactions] = useState<string[]>([]);
  const [gameSetupNicknames, setGameSetupNicknames] = useState<Record<string, string>>({});

  // Load from URL param, localStorage, or generate default
  useEffect(() => {
    const mapParam = searchParams.get("map");
    if (mapParam) {
      try {
        const imported = parseMapString(mapParam);
        setPlayerCount(imported.playerCount);
        setMap(imported);
        setSliceFactions(Array(imported.playerCount).fill(null));
        setSliceNicknames(Array(imported.playerCount).fill(""));
        return;
      } catch { /* fall through */ }
    }

    try {
      const raw = localStorage.getItem("ti4-game-setup");
      if (!raw) throw new Error();
      const setup = JSON.parse(raw);
      const allFactions: string[] = [];
      if (setup.selectedFaction) allFactions.push(setup.selectedFaction);
      if (setup.opponents?.length) allFactions.push(...setup.opponents);
      if (allFactions.length >= 1) {
        setGameSetupFactions(allFactions);
        setGameSetupNicknames(setup.nicknames || {});
      }
      if (allFactions.length >= 3 && allFactions.length <= 6) {
        setPlayerCount(allFactions.length);
        const newMap = generateMap(allFactions.length);
        setMap(newMap);
        setSliceFactions(Array(newMap.playerCount).fill(null));
        setSliceNicknames(Array(newMap.playerCount).fill(""));
        return;
      }
    } catch { /* ignore */ }
    const newMap = generateMap(6);
    setMap(newMap);
    setSliceFactions(Array(6).fill(null));
    setSliceNicknames(Array(6).fill(""));
  }, []);

  const getFilteredTiles = useCallback(() => {
    return getTilesForBanks(enabledBanks);
  }, [enabledBanks]);

  const handleGenerate = useCallback(() => {
    const { blue, red } = getFilteredTiles();
    const newMap = generateMap(playerCount, blue, red);
    setMap(newMap);
    setSliceFactions((prev) => {
      if (prev.length === playerCount) return prev;
      return Array(playerCount).fill(null);
    });
    setSliceNicknames((prev) => {
      if (prev.length === playerCount) return prev;
      return Array(playerCount).fill("");
    });
  }, [playerCount, getFilteredTiles]);

  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count);
    const { blue, red } = getFilteredTiles();
    const newMap = generateMap(count, blue, red);
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
    // Auto-populate nickname from game setup when assigning a faction
    if (factionName && gameSetupNicknames[factionName]) {
      setSliceNicknames((prev) => {
        const next = [...prev];
        next[sliceIndex] = gameSetupNicknames[factionName];
        return next;
      });
    } else if (!factionName) {
      setSliceNicknames((prev) => {
        const next = [...prev];
        next[sliceIndex] = "";
        return next;
      });
    }
  };

  const handleNickname = (sliceIndex: number, nickname: string) => {
    setSliceNicknames((prev) => {
      const next = [...prev];
      next[sliceIndex] = nickname;
      return next;
    });
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

  const handleHomeClick = useCallback((sliceIndex: number) => {
    setActivePickerSlice(sliceIndex);
  }, []);

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

  const allFactionNames = gameSetupFactions.length > 0
    ? gameSetupFactions
    : TI4_FACTIONS.map((f) => f.name);

  return (
    <div className="relative flex flex-col h-screen overflow-hidden bg-background">
      {/* Background */}
      <div className="absolute inset-0 opacity-10 bg-cover bg-center" style={{ backgroundImage: `url(${heroBg})` }} />
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/90 to-background" />

      <div className="relative z-10 flex flex-col h-full w-full">
        <TopNav />

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-shrink-0 px-4 lg:px-8 pb-3"
        >
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
            <div className="ml-auto flex items-center gap-2 flex-wrap">
              <SystemBankSelector enabled={enabledBanks} onChange={setEnabledBanks} />
              <BalanceDropdown onBalance={handleBalance} disabled={!map} />
              <ImportMapDialog onImport={(imported) => {
                setPlayerCount(imported.playerCount);
                setMap(imported);
                setSliceFactions(Array(imported.playerCount).fill(null));
                setSliceNicknames(Array(imported.playerCount).fill(""));
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
              {map && user && (
                <SaveGameDialog map={map} sliceFactions={sliceFactions} sliceNicknames={sliceNicknames} />
              )}
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
              className="flex flex-col gap-4"
            >
              {/* Slice assignments — compact grid above map */}
              <SlicePanel
                map={map}
                sliceFactions={sliceFactions}
                sliceNicknames={sliceNicknames}
                availableFactions={allFactionNames}
                factionNicknames={gameSetupNicknames}
                onAssign={handleAssign}
                onNickname={handleNickname}
              />

              {/* Legend + Map */}
              <MapLegend />
              <ZoomableMapContainer>
                <HexMapBoard
                  map={map}
                  sliceFactions={sliceFactions}
                  sliceNicknames={sliceNicknames}
                  onHomeClick={handleHomeClick}
                />
              </ZoomableMapContainer>
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

      {/* Faction picker dialog for home hex clicks */}
      {activePickerSlice !== null && (
        <FactionPickerDialog
          open={true}
          sliceIndex={activePickerSlice}
          currentFaction={sliceFactions[activePickerSlice] ?? null}
          assignedFactions={sliceFactions}
          onSelect={(faction) => handleAssign(activePickerSlice, faction)}
          onClose={() => setActivePickerSlice(null)}
        />
      )}

      {/* Floating AI Chat */}
      <FloatingChat />
    </div>
  );
};

export default MapGenerator;
