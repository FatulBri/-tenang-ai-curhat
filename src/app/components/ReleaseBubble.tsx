import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wind, Send, Sparkles } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
  onClose: () => void;
}

interface Bubble {
  id: string;
  text: string;
  x: number;
  y: number;
}

export function ReleaseBubble({ onClose }: Props) {
  const [text, setText] = useState("");
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  const handleRelease = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newBubble: Bubble = {
      id: Date.now().toString(),
      text: text,
      x: Math.random() * 40 - 20, // Random drift
      y: 0
    };

    setBubbles(prev => [...prev, newBubble]);
    setText("");

    // Remove bubble after animation
    setTimeout(() => {
      setBubbles(prev => prev.filter(b => b.id !== newBubble.id));
    }, 4000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#030213]/95 backdrop-blur-2xl p-6 overflow-hidden"
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-50"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Floating Bubbles Layer */}
      <div className="absolute inset-0 pointer-events-none">
        <AnimatePresence>
          {bubbles.map(b => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, scale: 0.5, y: 100, x: "50%" }}
              animate={{ 
                opacity: [0, 1, 1, 0], 
                scale: [0.5, 1.2, 1, 0.8], 
                y: -600,
                x: `calc(50% + ${b.x}px)`
              }}
              transition={{ duration: 4, ease: "easeOut" }}
              className="absolute left-0 w-max max-w-[200px] px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center text-center"
            >
              <p className="text-white text-sm font-medium italic truncate">{b.text}</p>
              <div className="absolute -z-10 inset-0 bg-teal-400/20 rounded-full blur-xl animate-pulse" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="max-w-md w-full relative z-10 text-center space-y-8">
        <div className="space-y-3">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-teal-500/20">
            <Wind className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-widest">Lepaskan Saja</h2>
          <p className="text-white/50 text-sm">Tulis beban pikiranmu, biarkan ia melayang pergi dan menghilang selamanya.</p>
        </div>

        <form onSubmit={handleRelease} className="space-y-4">
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Apa yang memberatimu saat ini?"
              className="w-full h-32 bg-white/5 border border-white/10 rounded-3xl p-6 text-white placeholder:text-white/20 outline-none focus:ring-2 focus:ring-teal-500/50 transition-all resize-none"
            />
            {text && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="absolute bottom-4 right-4"
              >
                <Sparkles className="w-5 h-5 text-teal-400 animate-pulse" />
              </motion.div>
            )}
          </div>
          
          <Button 
            type="submit"
            disabled={!text.trim()}
            className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white py-8 rounded-2xl font-bold text-lg shadow-xl shadow-teal-500/20 group"
          >
            Lepaskan Sekarang <Send className="w-5 h-5 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Button>
        </form>

        <p className="text-[10px] text-white/20 uppercase tracking-[0.2em]">Pesanmu tidak akan disimpan di mana pun.</p>
      </div>
    </motion.div>
  );
}
