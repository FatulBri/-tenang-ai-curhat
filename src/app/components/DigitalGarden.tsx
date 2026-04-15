import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";
import { Flower, Wind, Sparkles } from "lucide-react";

export function DigitalGarden() {
  const { growthScore, isBlooming, streak } = useApp();

  // Growth Thresholds
  const level = growthScore < 5 ? 0 : 
               growthScore < 15 ? 1 : 
               growthScore < 30 ? 2 : 
               growthScore < 50 ? 3 : 4;

  const stemHeight = [20, 60, 100, 140, 180][level];
  const leafCount = [0, 2, 4, 8, 12][level];
  const scale = [0.8, 1, 1.2, 1.4, 1.6][level];

  // Plant colors based on health/streak
  const plantColor = streak > 3 ? "#14b8a6" : "#2dd4bf"; // More vivid green for streaks

  return (
    <div className="relative w-full max-w-xs aspect-square flex items-center justify-center bg-white/5 dark:bg-slate-900/40 backdrop-blur-3xl rounded-full border border-white/10 shadow-2xl overflow-hidden group">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-t from-teal-500/10 to-transparent flex items-end justify-center">
         <div className="w-full h-1 bg-teal-500/20 blur-sm" />
      </div>

      {/* Floating Particles for high streak */}
      {streak >= 3 && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 100 }}
              animate={{ 
                opacity: [0, 1, 0], 
                y: -100, 
                x: Math.sin(i) * 30 
              }}
              transition={{ 
                duration: 3 + i, 
                repeat: Infinity, 
                delay: i * 0.5 
              }}
              className="absolute left-1/2 bottom-10"
            >
              <Sparkles className="w-3 h-3 text-yellow-400" />
            </motion.div>
          ))}
        </div>
      )}

      {/* The Plant SVG */}
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-[0_0_20px_rgba(20,184,166,0.3)]"
        style={{ transform: `scale(${level > 0 ? 1 : 0.8})` }}
      >
        {/* Pot */}
        <path
          d="M70 180 L130 180 L140 150 L60 150 Z"
          fill="#475569"
          className="dark:fill-slate-700"
        />
        
        {/* Main Stem */}
        <motion.path
          d={`M100 150 Q95 ${150 - stemHeight/2} 100 ${150 - stemHeight}`}
          stroke={plantColor}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />

        {/* Leaves */}
        {[...Array(leafCount)].map((_, i) => {
          const side = i % 2 === 0 ? 1 : -1;
          const yPos = 140 - (i * (stemHeight / leafCount));
          return (
            <motion.path
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              d={`M100 ${yPos} Q${100 + 30 * side} ${yPos - 10} ${100 + 40 * side} ${yPos - 20} Q${100 + 20 * side} ${yPos + 10} 100 ${yPos}`}
              fill={plantColor}
              className="origin-center"
              style={{ transformOrigin: `100px ${yPos}px` }}
            />
          );
        })}

        {/* Flowers (if blooming) */}
        {isBlooming && (
          <motion.g
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10, delay: 1.2 }}
          >
             <circle cx="100" cy={150 - stemHeight} r="12" fill="#f59e0b" />
             {[...Array(6)].map((_, i) => (
                <motion.circle
                  key={i}
                  cx={100 + Math.cos((i * 60 * Math.PI) / 180) * 15}
                  cy={(150 - stemHeight) + Math.sin((i * 60 * Math.PI) / 180) * 15}
                  r="8"
                  fill="#fbbf24"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                />
             ))}
          </motion.g>
        )}

        {/* Level 0 - Seed */}
        {level === 0 && (
           <motion.circle
             cx="100" cy="145" r="4"
             fill="#8b5cf6"
             animate={{ scale: [1, 1.4, 1] }}
             transition={{ duration: 2, repeat: Infinity }}
           />
        )}
      </svg>

      {/* Info Overlay */}
      <div className="absolute top-6 left-0 right-0 flex flex-col items-center">
         <p className="text-[10px] font-bold text-teal-500 uppercase tracking-[0.2em] mb-1">Status Taman</p>
         <h4 className="text-sm font-bold text-white flex items-center gap-2">
            {level === 0 ? "Biji Harapan" : 
             level === 1 ? "Tunas Kecil" : 
             level === 2 ? "Tanaman Muda" : 
             level === 3 ? "Taman Rimbun" : "Pohon Kedamaian"}
            {isBlooming && <span className="text-yellow-400">✨</span>}
         </h4>
      </div>

      {/* Hover Stats */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-sm pointer-events-none">
         <div className="text-center space-y-2">
            <p className="text-xs text-gray-300">Skor Pertumbuhan</p>
            <p className="text-2xl font-black text-white">{growthScore}</p>
            <div className="flex items-center gap-1 justify-center text-[10px] text-teal-400 font-bold">
               <Flower className="w-3 h-3" /> {isBlooming ? "SEDANG BERBUNGA" : "BELUM BERBUNGA"}
            </div>
         </div>
      </div>
    </div>
  );
}
