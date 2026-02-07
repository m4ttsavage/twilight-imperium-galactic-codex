const MapLegend = () => {
  const techItems = [
    { label: "Biotic", color: "#22c55e" },
    { label: "Warfare", color: "#ef4444" },
    { label: "Propulsion", color: "#3b82f6" },
    { label: "Cybernetic", color: "#eab308" },
    { label: "No Tech", color: "#94a3b8" },
  ];

  const anomalyItems = [
    { label: "Asteroid Field", color: "#8b7a6e", symbol: "◆" },
    { label: "Supernova", color: "#ff6600", symbol: "✦" },
    { label: "Gravity Rift", color: "#9966ff", symbol: "◎" },
    { label: "Nebula", color: "#ff66aa", symbol: "☁" },
    { label: "Entropic Scar", color: "#00ffcc", symbol: "⚡" },
  ];

  const wormholeItems = [
    { label: "Alpha (α)", color: "#6699ff" },
    { label: "Beta (β)", color: "#ff9944" },
  ];

  return (
    <div className="rounded-lg border border-border bg-card/60 px-3 py-2">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
        {/* Tech specialties */}
        <div className="space-y-1">
          <p className="text-[9px] font-display uppercase tracking-wider text-muted-foreground/70">
            Planet Tech
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5">
            {techItems.map((item) => (
              <div key={item.label} className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full inline-block border border-white/10"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[10px] font-body text-foreground/70">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Anomalies */}
        <div className="space-y-1">
          <p className="text-[9px] font-display uppercase tracking-wider text-muted-foreground/70">
            Anomalies
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5">
            {anomalyItems.map((item) => (
              <div key={item.label} className="flex items-center gap-1">
                <span
                  className="text-[10px] leading-none"
                  style={{ color: item.color }}
                >
                  {item.symbol}
                </span>
                <span className="text-[10px] font-body text-foreground/70">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Wormholes */}
        <div className="space-y-1">
          <p className="text-[9px] font-display uppercase tracking-wider text-muted-foreground/70">
            Wormholes
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5">
            {wormholeItems.map((item) => (
              <div key={item.label} className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full inline-block border"
                  style={{ backgroundColor: item.color + "30", borderColor: item.color }}
                />
                <span className="text-[10px] font-body text-foreground/70">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Slice Stats */}
        <div className="space-y-1">
          <p className="text-[9px] font-display uppercase tracking-wider text-muted-foreground/70">
            Slice Stats
          </p>
          <div className="flex items-center gap-1">
            <span className="inline-flex items-center gap-0.5 text-[10px] font-body">
              <span className="font-semibold" style={{ color: "#4ade80" }}>R</span>
              <span className="text-muted-foreground/50">/</span>
              <span className="font-semibold" style={{ color: "#60a5fa" }}>I</span>
            </span>
            <span className="text-[10px] font-body text-foreground/70">
              = <span className="font-semibold" style={{ color: "#4ade80" }}>Resources</span> / <span className="font-semibold" style={{ color: "#60a5fa" }}>Influence</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapLegend;
