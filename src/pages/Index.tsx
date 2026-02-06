import { motion } from "framer-motion";
import ChatInterface from "@/components/ChatInterface";
import TopNav from "@/components/TopNav";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  return (
    <div className="relative flex flex-col h-screen overflow-hidden bg-background">
      {/* Background image */}
      <div
        className="absolute inset-0 opacity-15 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/90 to-background" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full w-full">
        <TopNav />

        {/* Title bar */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-shrink-0 flex items-center px-4 pt-2 pb-2 max-w-3xl mx-auto w-full"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center glow-gold">
              <span className="font-display text-sm text-gold font-bold">TI</span>
            </div>
            <div>
              <h1 className="font-display text-sm tracking-widest text-foreground uppercase">
                Galactic Codex
              </h1>
              <p className="text-[10px] font-body text-muted-foreground tracking-wide">
                Twilight Imperium 4th Edition • AI Companion
              </p>
            </div>
          </div>
        </motion.header>

        {/* Chat */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex-1 min-h-0 max-w-3xl mx-auto w-full"
        >
          <ChatInterface />
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
