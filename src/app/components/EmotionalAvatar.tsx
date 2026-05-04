import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Emotion } from "../utils/useFaceEmotion";

interface Props {
  emotion: Emotion | null;
  compact?: boolean;
}

const AVATAR_STATES: Record<string, { face: string; bg: string; message: string; bodyAnim: object }> = {
  happy: {
    face: "😊",
    bg: "from-amber-400/20 to-yellow-300/20",
    message: "Senang melihatmu tersenyum!",
    bodyAnim: { y: [0, -6, 0], rotate: [0, 3, -3, 0] },
  },
  sad: {
    face: "🥺",
    bg: "from-blue-400/20 to-indigo-400/20",
    message: "Aku di sini, ceritakan perasaanmu...",
    bodyAnim: { y: [0, 2, 0], rotate: [0, -2, 2, 0] },
  },
  angry: {
    face: "😟",
    bg: "from-red-400/20 to-orange-400/20",
    message: "Tarik napas dalam... aku menemanimu.",
    bodyAnim: { y: [0, -2, 0], scale: [1, 1.02, 1] },
  },
  surprised: {
    face: "😲",
    bg: "from-purple-400/20 to-pink-400/20",
    message: "Wah! Ada apa? Cerita dong!",
    bodyAnim: { y: [0, -10, -5], scale: [1, 1.1, 1] },
  },
  fearful: {
    face: "😰",
    bg: "from-gray-400/20 to-slate-400/20",
    message: "Tidak apa-apa, kamu aman di sini.",
    bodyAnim: { x: [-2, 2, -2, 0], y: [0, 1, 0] },
  },
  disgusted: {
    face: "😣",
    bg: "from-green-400/20 to-emerald-400/20",
    message: "Keluarkan saja, jangan ditahan.",
    bodyAnim: { rotate: [-3, 3, 0], y: [0, 2, 0] },
  },
  neutral: {
    face: "🙂",
    bg: "from-teal-400/20 to-cyan-300/20",
    message: "Halo! Aku siap mendengarkan.",
    bodyAnim: { y: [0, -3, 0] },
  },
};

const DEFAULT_STATE = AVATAR_STATES.neutral;

export function EmotionalAvatar({ emotion, compact = false }: Props) {
  const [state, setState] = useState(DEFAULT_STATE);
  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    if (emotion && AVATAR_STATES[emotion]) {
      setState(AVATAR_STATES[emotion]);
      setShowBubble(true);
      const t = setTimeout(() => setShowBubble(false), 4000);
      return () => clearTimeout(t);
    } else {
      setState(DEFAULT_STATE);
    }
  }, [emotion]);

  if (compact) {
    return (
      <motion.div
        className="flex items-center gap-2"
        animate={state.bodyAnim}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="text-2xl filter drop-shadow-md">{state.face}</span>
      </motion.div>
    );
  }

  return (
    <div className="relative flex flex-col items-center">
      {/* Speech Bubble */}
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.9 }}
            className="absolute -top-14 left-1/2 -translate-x-1/2 w-48 p-2.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 dark:border-slate-700/50 z-20"
          >
            <p className="text-[10px] font-medium text-gray-700 dark:text-gray-300 text-center leading-snug">
              {state.message}
            </p>
            {/* Bubble Tail */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-white/90 dark:bg-slate-800/90 rotate-45 border-r border-b border-white/30 dark:border-slate-700/50" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar Body */}
      <motion.div
        className={`relative w-16 h-16 rounded-full bg-gradient-to-br ${state.bg} flex items-center justify-center shadow-lg border-2 border-white/20 dark:border-white/10 cursor-pointer`}
        animate={state.bodyAnim}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ scale: 1.15 }}
        onClick={() => setShowBubble(true)}
      >
        <span className="text-3xl filter drop-shadow-md select-none">{state.face}</span>
        
        {/* Glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-teal-400/30"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
    </div>
  );
}
