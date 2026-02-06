import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, X, Shield, Swords } from "lucide-react";
import { TI4_FACTIONS, type Faction } from "@/lib/factions";

interface FactionSelectorProps {
  selectedFaction: string | null;
  opponents: string[];
  onFactionChange: (faction: string | null) => void;
  onOpponentsChange: (opponents: string[]) => void;
}

const FactionSelector = ({
  selectedFaction,
  opponents,
  onFactionChange,
  onOpponentsChange,
}: FactionSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"my" | "opponents">("my");

  const selectedFactionData = TI4_FACTIONS.find((f) => f.name === selectedFaction);

  const toggleOpponent = (factionName: string) => {
    if (factionName === selectedFaction) return;
    if (opponents.includes(factionName)) {
      onOpponentsChange(opponents.filter((o) => o !== factionName));
    } else {
      onOpponentsChange([...opponents, factionName]);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-muted/40 border border-border hover:border-gold/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-gold" />
          <span className="text-sm font-body text-foreground">
            {selectedFaction || "Set up your game"}
          </span>
          {opponents.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-teal-dim/50 text-teal font-body">
              vs {opponents.length}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className="absolute z-50 top-full mt-2 left-0 right-0 bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Tabs */}
            <div className="flex border-b border-border">
              <button
                onClick={() => setActiveTab("my")}
                className={`flex-1 px-4 py-2.5 text-xs font-display tracking-wider uppercase transition-colors ${
                  activeTab === "my"
                    ? "text-gold border-b-2 border-gold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Shield className="w-3 h-3 inline mr-1.5" />
                My Faction
              </button>
              <button
                onClick={() => setActiveTab("opponents")}
                className={`flex-1 px-4 py-2.5 text-xs font-display tracking-wider uppercase transition-colors ${
                  activeTab === "opponents"
                    ? "text-teal border-b-2 border-teal"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Swords className="w-3 h-3 inline mr-1.5" />
                Opponents
              </button>
            </div>

            {/* Faction Grid */}
            <div className="p-3 max-h-64 overflow-y-auto">
              {activeTab === "my" && (
                <div className="space-y-2">
                  {selectedFaction && (
                    <button
                      onClick={() => onFactionChange(null)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <X className="w-3 h-3" />
                      Clear selection
                    </button>
                  )}
                  <FactionGrid
                    factions={TI4_FACTIONS}
                    selected={selectedFaction ? [selectedFaction] : []}
                    disabled={[]}
                    onToggle={(name) => {
                      onFactionChange(name);
                      setActiveTab("opponents");
                    }}
                    mode="single"
                  />
                </div>
              )}
              {activeTab === "opponents" && (
                <div className="space-y-2">
                  {opponents.length > 0 && (
                    <button
                      onClick={() => onOpponentsChange([])}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <X className="w-3 h-3" />
                      Clear all opponents
                    </button>
                  )}
                  <FactionGrid
                    factions={TI4_FACTIONS}
                    selected={opponents}
                    disabled={selectedFaction ? [selectedFaction] : []}
                    onToggle={toggleOpponent}
                    mode="multi"
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function FactionGrid({
  factions,
  selected,
  disabled,
  onToggle,
  mode,
}: {
  factions: Faction[];
  selected: string[];
  disabled: string[];
  onToggle: (name: string) => void;
  mode: "single" | "multi";
}) {
  const baseFactions = factions.filter((f) => f.expansion === "base");
  const pokFactions = factions.filter((f) => f.expansion === "pok");

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[10px] font-display uppercase tracking-widest text-muted-foreground mb-1.5 px-1">
          Base Game
        </p>
        <div className="grid grid-cols-3 gap-1">
          {baseFactions.map((f) => (
            <FactionChip
              key={f.name}
              faction={f}
              isSelected={selected.includes(f.name)}
              isDisabled={disabled.includes(f.name)}
              onClick={() => onToggle(f.name)}
            />
          ))}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-display uppercase tracking-widest text-muted-foreground mb-1.5 px-1">
          Prophecy of Kings
        </p>
        <div className="grid grid-cols-3 gap-1">
          {pokFactions.map((f) => (
            <FactionChip
              key={f.name}
              faction={f}
              isSelected={selected.includes(f.name)}
              isDisabled={disabled.includes(f.name)}
              onClick={() => onToggle(f.name)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function FactionChip({
  faction,
  isSelected,
  isDisabled,
  onClick,
}: {
  faction: Faction;
  isSelected: boolean;
  isDisabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`px-2 py-1.5 rounded-lg text-[11px] font-body font-medium transition-all truncate ${
        isDisabled
          ? "opacity-30 cursor-not-allowed bg-muted/20 text-muted-foreground"
          : isSelected
          ? "bg-gold/20 text-gold border border-gold/40"
          : "bg-muted/30 text-foreground/70 border border-transparent hover:bg-muted/50 hover:text-foreground"
      }`}
    >
      {faction.shortName}
    </button>
  );
}

export default FactionSelector;
