import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Send, RotateCcw, Sparkles } from "lucide-react";
import ChatMessage from "./ChatMessage";
import QuickPrompts from "./QuickPrompts";
import FactionSelector from "./FactionSelector";
import { streamChat } from "@/lib/chat-stream";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

const ChatInterface = () => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFaction, setSelectedFaction] = useState<string | null>(null);
  const [opponents, setOpponents] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Msg = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";

    const upsertAssistant = (nextChunk: string) => {
      assistantSoFar += nextChunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    await streamChat({
      messages: [...messages, userMsg],
      faction: selectedFaction || undefined,
      opponents: opponents.length > 0 ? opponents : undefined,
      onDelta: (chunk) => upsertAssistant(chunk),
      onDone: () => setIsLoading(false),
      onError: (error) => {
        setIsLoading(false);
        toast.error(error);
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header bar */}
      <div className="flex-shrink-0 p-4 space-y-3">
        <FactionSelector
          selectedFaction={selectedFaction}
          opponents={opponents}
          onFactionChange={setSelectedFaction}
          onOpponentsChange={setOpponents}
        />
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-6 py-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-3"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center glow-gold">
                <Sparkles className="w-8 h-8 text-gold" />
              </div>
              <h2 className="font-display text-lg text-foreground tracking-wide">
                Galactic Codex
              </h2>
              <p className="text-sm text-muted-foreground max-w-sm font-body">
                Your AI companion for Twilight Imperium 4th Edition. Ask about rules,
                factions, mechanics, or strategy.
              </p>
            </motion.div>

            <QuickPrompts onSelect={sendMessage} />
          </div>
        ) : (
          messages.map((msg, i) => (
            <ChatMessage
              key={i}
              role={msg.role}
              content={msg.content}
              isStreaming={
                isLoading &&
                msg.role === "assistant" &&
                i === messages.length - 1
              }
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 p-4 border-t border-border bg-card/50">
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about TI4 rules, factions, or strategy..."
              rows={1}
              className="w-full resize-none rounded-xl bg-muted/40 border border-border px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/20 transition-colors"
              style={{ minHeight: "44px", maxHeight: "120px" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "44px";
                target.style.height = Math.min(target.scrollHeight, 120) + "px";
              }}
            />
          </div>

          {messages.length > 0 && (
            <button
              type="button"
              onClick={resetChat}
              className="flex-shrink-0 w-11 h-11 rounded-xl bg-muted/40 border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors flex items-center justify-center"
              title="New conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
