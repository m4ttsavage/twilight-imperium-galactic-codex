import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { STRATEGY_CARDS } from "@/lib/strategy-cards";
import TopNav from "@/components/TopNav";
import FloatingChat from "@/components/FloatingChat";
import heroBg from "@/assets/hero-bg.jpg";

const StrategyReference = () => {
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
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center glow-gold">
              <Shield className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h1 className="font-display text-sm tracking-widest text-foreground uppercase">
                Strategy Cards
              </h1>
              <p className="text-[10px] font-body text-muted-foreground tracking-wide">
                All 8 strategy cards with primary and secondary abilities
              </p>
            </div>
          </div>
        </motion.header>

        <div className="flex-1 overflow-y-auto px-4 lg:px-8 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl">
            {STRATEGY_CARDS.map((card, idx) => (
              <motion.div
                key={card.number}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="rounded-xl border border-border bg-card/40 p-4 space-y-3"
              >
                {/* Header */}
                <div className="flex items-center gap-3">
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-display font-bold text-white shadow-md"
                    style={{ backgroundColor: card.color }}
                  >
                    {card.number}
                  </span>
                  <h2 className="font-display text-sm tracking-widest uppercase text-foreground">
                    {card.name}
                  </h2>
                </div>

                {/* Initiative */}
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-display uppercase tracking-widest text-muted-foreground">
                    Initiative
                  </span>
                  <span className="text-xs font-body text-foreground font-medium">
                    {card.number}
                  </span>
                </div>

                {/* Primary */}
                <div className="space-y-1">
                  <span className="text-[9px] font-display uppercase tracking-widest text-gold">
                    Primary Ability
                  </span>
                  <p className="text-xs font-body text-foreground/85 leading-relaxed">
                    {card.primary}
                  </p>
                </div>

                {/* Secondary */}
                <div className="space-y-1">
                  <span className="text-[9px] font-display uppercase tracking-widest text-teal">
                    Secondary Ability
                  </span>
                  <p className="text-xs font-body text-muted-foreground leading-relaxed">
                    {card.secondary}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <FloatingChat />
    </div>
  );
};

export default StrategyReference;
