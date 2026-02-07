import { motion, AnimatePresence } from "framer-motion";
import type { FateMessage as FateMessageType } from "@/lib/draft-resolver";

interface Props {
  messages: FateMessageType[];
}

const FateMessage = ({ messages }: Props) => {
  if (messages.length === 0) return null;

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {messages.map((msg, i) => (
          <motion.div
            key={`${msg.winnerId}-${msg.loserId}`}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, delay: i * 0.3 }}
            className="rounded-lg border border-gold/20 bg-gold/5 p-3"
          >
            <p className="text-xs font-body text-foreground leading-relaxed">
              ✨ {msg.message}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default FateMessage;
