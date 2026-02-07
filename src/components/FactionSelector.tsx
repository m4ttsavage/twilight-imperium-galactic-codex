import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, X, Shield, Swords, UserPen, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { TI4_FACTIONS, type Faction } from "@/lib/factions";
interface FactionSelectorProps {
  selectedFaction: string | null;
  opponents: string[];
  nicknames: Record<string, string>;
  onFactionChange: (faction: string | null) => void;
  onOpponentsChange: (opponents: string[]) => void;
  onNicknamesChange: (nicknames: Record<string, string>) => void;
  defaultNickname?: string;
}
const FactionSelector = ({
  selectedFaction,
  opponents,
  nicknames,
  onFactionChange,
  onOpponentsChange,
  onNicknamesChange,
  defaultNickname,
}: FactionSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"my" | "opponents">("my");
  const [editingNickname, setEditingNickname] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const selectedFactionData = TI4_FACTIONS.find((f) => f.name === selectedFaction);

  // Auto-fill nickname from profile display name when selecting "My Faction"
  useEffect(() => {
    if (selectedFaction && defaultNickname && !nicknames[selectedFaction]) {
      onNicknamesChange({ ...nicknames, [selectedFaction]: defaultNickname });
    }
  }, [selectedFaction, defaultNickname]);
  const toggleOpponent = (factionName: string) => {
    if (factionName === selectedFaction) return;
    if (opponents.includes(factionName)) {
      onOpponentsChange(opponents.filter((o) => o !== factionName));
      // Clean up nickname
      const updated = {
        ...nicknames,
      };
      delete updated[factionName];
      onNicknamesChange(updated);
    } else {
      onOpponentsChange([...opponents, factionName]);
    }
  };
  const setNickname = (factionName: string, nickname: string) => {
    onNicknamesChange({
      ...nicknames,
      [factionName]: nickname,
    });
  };
  const formatLabel = (factionName: string) => {
    const nick = nicknames[factionName];
    if (nick) return `${TI4_FACTIONS.find((f) => f.name === factionName)?.shortName} [${nick}]`;
    return TI4_FACTIONS.find((f) => f.name === factionName)?.shortName || factionName;
  };
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-muted/40 border border-border hover:border-gold/30 transition-colors min-h-[52px]"
      >
        <div className="flex items-center gap-2 min-w-0">
          {selectedFactionData ? (
            <img
              src={selectedFactionData.icon}
              alt={selectedFactionData.shortName}
              className="w-5 h-5 object-contain flex-shrink-0"
            />
          ) : (
            <Shield className="w-4 h-4 text-gold flex-shrink-0" />
          )}
          <span className="font-body text-foreground font-bold text-sm leading-snug whitespace-normal">
            {selectedFaction ? (
              formatLabel(selectedFaction)
            ) : (
              <>
                Set up your game by{" "}
                <span className="text-gold underline decoration-gold/50 hover:decoration-gold cursor-pointer transition-colors">
                  choosing factions
                </span>
                . Then visit the{" "}
                <Link
                  to="/game/new"
                  className="text-gold underline decoration-gold/50 hover:decoration-gold transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  Create Game
                </Link>{" "}
                to select starting positions and strategies.
              </>
            )}
          </span>
          {opponents.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-teal-dim/50 text-teal font-body flex-shrink-0">
              vs {opponents.length}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{
              opacity: 0,
              y: -8,
              height: 0,
            }}
            animate={{
              opacity: 1,
              y: 0,
              height: "auto",
            }}
            exit={{
              opacity: 0,
              y: -8,
              height: 0,
            }}
            className="absolute z-50 top-full mt-2 left-0 right-0 bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Tabs */}
            <div className="flex border-b border-border">
              <button
                onClick={() => setActiveTab("my")}
                className={`flex-1 px-4 py-2.5 text-xs font-display tracking-wider uppercase transition-colors ${activeTab === "my" ? "text-gold border-b-2 border-gold" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Shield className="w-3 h-3 inline mr-1.5" />
                My Faction
              </button>
              <button
                onClick={() => setActiveTab("opponents")}
                className={`flex-1 px-4 py-2.5 text-xs font-display tracking-wider uppercase transition-colors ${activeTab === "opponents" ? "text-teal border-b-2 border-teal" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Swords className="w-3 h-3 inline mr-1.5" />
                Opponents
              </button>
            </div>

            {/* Search */}
            <div className="p-2 border-b border-border">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search factions…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 rounded-lg bg-muted/40 border border-border text-xs font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-teal/40 transition-colors"
                />
              </div>
            </div>

            {/* Faction Grid */}
            <div className="p-3 max-h-80 overflow-y-auto">
              {activeTab === "my" && (
                <div className="space-y-2">
                  {selectedFaction && (
                    <>
                      <button
                        onClick={() => {
                          onFactionChange(null);
                          const updated = {
                            ...nicknames,
                          };
                          delete updated[selectedFaction];
                          onNicknamesChange(updated);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <X className="w-3 h-3" />
                        Clear selection
                      </button>
                      <NicknameInput
                        factionName={selectedFaction}
                        nickname={nicknames[selectedFaction] || ""}
                        onChange={(nick) => setNickname(selectedFaction, nick)}
                      />
                    </>
                  )}
                  <FactionList
                    factions={TI4_FACTIONS}
                    selected={selectedFaction ? [selectedFaction] : []}
                    disabled={[]}
                    search={search}
                    onToggle={(name) => {
                      onFactionChange(name);
                      setActiveTab("opponents");
                      setSearch("");
                    }}
                  />
                </div>
              )}
              {activeTab === "opponents" && (
                <div className="space-y-2">
                  {opponents.length > 0 && (
                    <>
                      <button
                        onClick={() => {
                          onOpponentsChange([]);
                          // Clean up all opponent nicknames
                          const updated = {
                            ...nicknames,
                          };
                          opponents.forEach((o) => delete updated[o]);
                          onNicknamesChange(updated);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <X className="w-3 h-3" />
                        Clear all opponents
                      </button>
                      {/* Nickname editors for selected opponents */}
                      <div className="space-y-1 mb-2">
                        {opponents.map((opp) => (
                          <NicknameInput
                            key={opp}
                            factionName={opp}
                            nickname={nicknames[opp] || ""}
                            onChange={(nick) => setNickname(opp, nick)}
                          />
                        ))}
                      </div>
                    </>
                  )}
                  <FactionList
                    factions={TI4_FACTIONS}
                    selected={opponents}
                    disabled={selectedFaction ? [selectedFaction] : []}
                    search={search}
                    onToggle={toggleOpponent}
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
function NicknameInput({
  factionName,
  nickname,
  onChange,
}: {
  factionName: string;
  nickname: string;
  onChange: (nick: string) => void;
}) {
  const faction = TI4_FACTIONS.find((f) => f.name === factionName);
  if (!faction) return null;
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/30">
      <UserPen className="w-3 h-3 text-muted-foreground flex-shrink-0" />
      <span className="text-[10px] text-muted-foreground font-body flex-shrink-0 truncate max-w-[100px]">
        {faction.shortName}
      </span>
      <input
        type="text"
        value={nickname}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Player name..."
        className="flex-1 min-w-0 text-[11px] font-body bg-transparent border-b border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/40 py-0.5"
      />
    </div>
  );
}
function FactionList({
  factions,
  selected,
  disabled,
  search,
  onToggle,
}: {
  factions: Faction[];
  selected: string[];
  disabled: string[];
  search: string;
  onToggle: (name: string) => void;
}) {
  const query = search.toLowerCase();
  const filtered = query
    ? factions.filter(
        (f) =>
          f.name.toLowerCase().includes(query) ||
          f.shortName.toLowerCase().includes(query),
      )
    : factions;
  const baseFactions = filtered.filter((f) => f.expansion === "base");
  const pokFactions = filtered.filter((f) => f.expansion === "pok");
  const teFactions = filtered.filter((f) => f.expansion === "te");
  return (
    <div className="space-y-3">
      {filtered.length === 0 ? (
        <p className="text-xs text-muted-foreground font-body p-3 text-center">
          No factions found
        </p>
      ) : (
        <>
          <ExpansionGroup
            label="Base Game"
            labelColor="text-muted-foreground"
            factions={baseFactions}
            selected={selected}
            disabled={disabled}
            onToggle={onToggle}
          />
          <ExpansionGroup
            label="Prophecy of Kings"
            labelColor="text-muted-foreground"
            factions={pokFactions}
            selected={selected}
            disabled={disabled}
            onToggle={onToggle}
          />
          <ExpansionGroup
            label="Thunder's Edge"
            labelColor="text-teal"
            factions={teFactions}
            selected={selected}
            disabled={disabled}
            onToggle={onToggle}
          />
        </>
      )}
    </div>
  );
}
function ExpansionGroup({
  label,
  labelColor,
  factions,
  selected,
  disabled,
  onToggle,
}: {
  label: string;
  labelColor: string;
  factions: Faction[];
  selected: string[];
  disabled: string[];
  onToggle: (name: string) => void;
}) {
  return (
    <div>
      <p className={`text-[10px] font-display uppercase tracking-widest ${labelColor} mb-1.5 px-1`}>{label}</p>
      <div className="space-y-0.5">
        {factions.map((f) => (
          <FactionRow
            key={f.name}
            faction={f}
            isSelected={selected.includes(f.name)}
            isDisabled={disabled.includes(f.name)}
            onClick={() => onToggle(f.name)}
          />
        ))}
      </div>
    </div>
  );
}
function FactionRow({
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
      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all ${isDisabled ? "opacity-30 cursor-not-allowed bg-muted/10" : isSelected ? "bg-gold/15 border border-gold/30" : "bg-transparent border border-transparent hover:bg-muted/40"}`}
    >
      <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden">
        <img src={faction.icon} alt={faction.shortName} className="w-5 h-5 object-contain" />
      </div>
      <span
        className={`text-[12px] font-body font-medium truncate ${isDisabled ? "text-muted-foreground" : isSelected ? "text-gold" : "text-foreground/80"}`}
      >
        {faction.name}
      </span>
    </button>
  );
}
export default FactionSelector;
