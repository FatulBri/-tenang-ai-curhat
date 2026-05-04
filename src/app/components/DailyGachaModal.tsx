import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Heart } from "lucide-react";
import { Button } from "./ui/button";
import confetti from "canvas-confetti";

const CARDS = [
  { text: "Kamu sudah berjuang dengan sangat keras hari ini. Istirahatlah, kamu pantas mendapatkannya.", color: "from-pink-400 to-rose-500", emoji: "🌸" },
  { text: "Setiap langkah kecil adalah kemajuan. Jangan pernah meremehkan usahamu.", color: "from-teal-400 to-emerald-500", emoji: "🌱" },
  { text: "Perasaanmu valid. Tidak apa-apa untuk tidak merasa baik-baik saja.", color: "from-blue-400 to-indigo-500", emoji: "🌊" },
  { text: "Kamu lebih kuat dari apa yang kamu pikirkan. Badai ini pasti berlalu.", color: "from-purple-400 to-fuchsia-500", emoji: "✨" },
  { text: "Tarik napas dalam. Kamu memegang kendali atas responmu, bukan duniamu.", color: "from-amber-400 to-orange-500", emoji: "☀️" },
  { text: "Keberanian tidak selalu mengaum. Terkadang keberanian adalah suara kecil di akhir hari yang berkata: aku akan mencoba lagi besok.", color: "from-indigo-500 to-purple-600", emoji: "🌙" },
  { text: "Kamu bukan beban. Kehadiranmu sangat berarti bagi orang-orang di sekitarmu.", color: "from-emerald-400 to-cyan-500", emoji: "🕊️" },
  { text: "Fokuslah pada seberapa jauh kamu telah berjalan, bukan seberapa jauh lagi kamu harus pergi.", color: "from-orange-400 to-red-500", emoji: "🏔️" },
];

const LS_KEY = "tenang_daily_gacha_date";

export function DailyGachaModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [card, setCard] = useState(CARDS[0]);

  useEffect(() => {
    // Check if user already drew today
    const lastDate = localStorage.getItem(LS_KEY);
    const today = new Date().toDateString();
    
    if (lastDate !== today) {
      // Pick random card
      const randomCard = CARDS[Math.floor(Math.random() * CARDS.length)];
      setCard(randomCard);
      // Small delay so it doesn't instantly block everything
      const t = setTimeout(() => setIsOpen(true), 2000);
      return () => clearTimeout(t);
    }
  }, []);

  const handleDraw = () => {
    setIsFlipped(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#14b8a6', '#a855f7', '#ec4899', '#f59e0b']
    });
    localStorage.setItem(LS_KEY, new Date().toDateString());
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#030213]/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="relative max-w-sm w-full"
        >
          <button
            onClick={() => setIsOpen(false)}
            className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-400" /> Afirmasi Harian
            </h2>
            <p className="text-white/70 text-sm">Pesan semesta untukmu hari ini</p>
          </div>

          {/* Perspective Container */}
          <div className="relative w-full aspect-[3/4] cursor-pointer" style={{ perspective: "1000px" }} onClick={!isFlipped ? handleDraw : undefined}>
            {/* Card wrapper */}
            <motion.div
              className="w-full h-full relative preserve-3d"
              initial={false}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 60, damping: 15 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Front (Unflipped) */}
              <div 
                className="absolute inset-0 backface-hidden rounded-3xl shadow-2xl border-4 border-white/10 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-900 overflow-hidden group"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10 text-center"
                >
                  <Heart className="w-16 h-16 text-pink-400 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]" />
                  <p className="text-white font-bold tracking-widest text-lg uppercase group-hover:scale-105 transition-transform">Ketuk untuk Membuka</p>
                </motion.div>
                
                {/* Decorative border */}
                <div className="absolute inset-3 border border-white/20 rounded-2xl pointer-events-none" />
              </div>

              {/* Back (Flipped) */}
              <div 
                className={`absolute inset-0 backface-hidden rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8 bg-gradient-to-br ${card.color}`}
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                <div className="absolute inset-0 bg-white/10 mix-blend-overlay" />
                <div className="relative z-10 text-center">
                  <span className="text-6xl filter drop-shadow-lg mb-6 block">{card.emoji}</span>
                  <p className="text-white text-xl font-bold leading-relaxed drop-shadow-md">
                    "{card.text}"
                  </p>
                </div>
                {/* Decorative border */}
                <div className="absolute inset-3 border border-white/30 rounded-2xl pointer-events-none" />
              </div>
            </motion.div>
          </div>

          <AnimatePresence>
            {isFlipped && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-center"
              >
                <Button onClick={() => setIsOpen(false)} className="bg-white text-purple-900 hover:bg-gray-100 rounded-xl px-8 font-bold">
                  Terima Kasih, Semesta ✨
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
