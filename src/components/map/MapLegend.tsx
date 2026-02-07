interface MapLegendProps {
  compact?: boolean;
}

const MapLegend = ({ compact = false }: MapLegendProps) => {
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

  if (compact) {
    return (
      <div className="rounded-lg border border-border bg-card/60 p-2.5 space-y-2">
        <h4 className="text-[10px] font-display uppercase tracking-widest text-muted-foreground">
          Legend
        </h4>

        {/* Tech */}
        <div className="space-y-1">
          <p className="text-[8px] font-display uppercase tracking-wider text-muted-foreground/70">
            Planet Tech
          </p>
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
            {techItems.map((item) => (
              <div key={item.label} className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full inline-block border border-white/10 flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[9px] font-body text-foreground/70 truncate">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Anomalies */}
        <div className="space-y-1">
          <p className="text-[8px] font-display uppercase tracking-wider text-muted-foreground/70">
            Anomalies
          </p>
          <div className="grid grid-cols-1 gap-y-0.5">
            {anomalyItems.map((item) => (
              <div key={item.label} className="flex items-center gap-1">
                <span
                  className="text-[9px] leading-none flex-shrink-0 w-3 text-center"
                  style={{ color: item.color }}
                >
                  {item.symbol}
                </span>
                <span className="text-[9px] font-body text-foreground/70 truncate">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Wormholes */}
        <div className="space-y-1">
          <p className="text-[8px] font-display uppercase tracking-wider text-muted-foreground/70">
            Wormholes
          </p>
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
            {wormholeItems.map((item) => (
              <div key={item.label} className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full inline-block border flex-shrink-0"
                  style={{ backgroundColor: item.color + "30", borderColor: item.color }}
                />
                <span className="text-[9px] font-body text-foreground/70 truncate">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Slice Stats */}
        <div className="space-y-1">
          <p className="text-[8px] font-display uppercase tracking-wider text-muted-foreground/70">
            Slice Stats
          </p>
          <div className="flex items-center gap-1">
            <span className="inline-flex items-center gap-0.5 text-[9px] font-body">
              <span className="font-semibold" style={{ color: "#4ade80" }}>R</span>
              <span className="text-muted-foreground/50">/</span>
              <span className="font-semibold" style={{ color: "#60a5fa" }}>I</span>
            </span>
            <span className="text-[9px] font-body text-foreground/70">
              = <span className="font-semibold" style={{ color: "#4ade80" }}>Res</span> / <span className="font-semibold" style={{ color: "#60a5fa" }}>Inf</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card/60 p-3 space-y-3">
      <h4 className="text-[10px] font-display uppercase tracking-widest text-muted-foreground">
        Map Legend
      </h4>

      {/* Tech specialties */}
      <div className="space-y-1.5">
        <p className="text-[9px] font-display uppercase tracking-wider text-muted-foreground/70">
          Planet Tech
        </p>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {techItems.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block border border-white/10"
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
      <div className="space-y-1.5">
        <p className="text-[9px] font-display uppercase tracking-wider text-muted-foreground/70">
          Anomalies
        </p>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {anomalyItems.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
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
      <div className="space-y-1.5">
        <p className="text-[9px] font-display uppercase tracking-wider text-muted-foreground/70">
          Wormholes
        </p>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {wormholeItems.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block border"
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
      <div className="space-y-1.5">
        <p className="text-[9px] font-display uppercase tracking-wider text-muted-foreground/70">
          Slice Stats
        </p>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-0.5 text-[10px] font-body">
            <span className="font-semibold" style={{ color: "#4ade80" }}>R</span>
            <span className="text-muted-foreground/50">/</span>
            <span className="font-semibold" style={{ color: "#60a5fa" }}>I</span>
          </span>
          <span className="text-[10px] font-body text-foreground/70">
            = Total <span className="font-semibold" style={{ color: "#4ade80" }}>Resources</span> / <span className="font-semibold" style={{ color: "#60a5fa" }}>Influence</span> in a slice (shown on home hexes)
          </span>
        </div>
      </div>
    </div>
  );
};

export default MapLegend;
