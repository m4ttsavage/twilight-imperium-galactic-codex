import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

const ChatMessage = ({ role, content, isStreaming }: ChatMessageProps) => {
  const isAssistant = role === "assistant";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isAssistant ? "" : "flex-row-reverse"}`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
          isAssistant
            ? "bg-teal-dim border border-teal/30"
            : "bg-gold-dim border border-gold/30"
        }`}
      >
        {isAssistant ? (
          <Bot className="w-4 h-4 text-teal" />
        ) : (
          <User className="w-4 h-4 text-gold" />
        )}
      </div>

      {/* Message content */}
      <div
        className={`flex-1 max-w-[85%] rounded-xl px-4 py-3 ${
          isAssistant
            ? "bg-muted/50 border border-border"
            : "bg-gold-dim/30 border border-gold/20"
        }`}
      >
        {isAssistant ? (
          <div className="prose prose-invert prose-sm max-w-none font-body text-foreground/90 [&_h1]:font-display [&_h2]:font-display [&_h3]:font-display [&_h1]:text-gold [&_h2]:text-gold [&_h3]:text-teal [&_strong]:text-foreground [&_code]:text-teal [&_code]:bg-muted [&_code]:px-1 [&_code]:rounded [&_blockquote]:border-l-gold [&_blockquote]:bg-muted/50 [&_blockquote]:py-1 [&_a]:text-teal [&_li]:marker:text-gold-dim">
            <ReactMarkdown>{content}</ReactMarkdown>
            {isStreaming && (
              <span className="inline-flex gap-1 ml-1 align-middle">
                <span className="typing-dot w-1.5 h-1.5 rounded-full bg-teal" />
                <span className="typing-dot w-1.5 h-1.5 rounded-full bg-teal" />
                <span className="typing-dot w-1.5 h-1.5 rounded-full bg-teal" />
              </span>
            )}
          </div>
        ) : (
          <p className="text-sm font-body text-foreground">{content}</p>
        )}
      </div>
    </motion.div>
  );
};

export default ChatMessage;
