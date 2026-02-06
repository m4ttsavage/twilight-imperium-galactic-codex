import { motion } from "framer-motion";
import { BookOpen, Users, Compass, Swords } from "lucide-react";

interface QuickPromptsProps {
  onSelect: (prompt: string) => void;
}

const prompts = [
  {
    icon: BookOpen,
    label: "Rules",
    prompt: "I'm new - what are the basic rules of Twilight Imperium?",
    color: "text-gold",
    borderColor: "border-gold/20 hover:border-gold/40",
  },
  {
    icon: Users,
    label: "Factions",
    prompt: "Tell me about the faction I'm playing. What are their unique abilities, leaders, and best strategies?",
    color: "text-teal",
    borderColor: "border-teal/20 hover:border-teal/40",
  },
  {
    icon: Compass,
    label: "Mechanics",
    prompt: "Walk me through the structure of a full round in TI4. What happens in each phase and what should I be thinking about?",
    color: "text-star",
    borderColor: "border-star/20 hover:border-star/40",
  },
  {
    icon: Swords,
    label: "Strategy",
    prompt: "Based on my faction and opponents, what are the key matchups I should be aware of? What are my relative strengths and weaknesses?",
    color: "text-gold",
    borderColor: "border-gold/20 hover:border-gold/40",
  },
];

const QuickPrompts = ({ onSelect }: QuickPromptsProps) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {prompts.map((item, index) => (
        <motion.button
          key={item.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          onClick={() => onSelect(item.prompt)}
          className={`group flex flex-col items-start gap-2 p-4 rounded-xl bg-muted/30 border ${item.borderColor} transition-all duration-300 hover:bg-muted/50 text-left`}
        >
          <item.icon className={`w-5 h-5 ${item.color} transition-transform group-hover:scale-110`} />
          <span className="font-display text-xs tracking-wider uppercase text-foreground">
            {item.label}
          </span>
          <span className="text-xs text-muted-foreground line-clamp-2 font-body">
            {item.prompt}
          </span>
        </motion.button>
      ))}
    </div>
  );
};

export default QuickPrompts;
