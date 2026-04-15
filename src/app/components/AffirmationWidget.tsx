import { useState, useEffect } from "react";
import { Quote, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AFFIRMATIONS = [
  "Setiap langkah kecil yang kamu ambil hari ini berharga.",
  "Kamu berhak mendapatkan ketenangan dan kebahagiaan.",
  "Perasaanmu valid. Tidak apa-apa untuk merasa tidak baik-baik saja.",
  "Kamu lebih kuat dari yang kamu bayangkan.",
  "Hari ini adalah awal yang baru. Tarik napas, buang perlahan.",
  "Kamu tidak sendirian. Ada pendengar di sini untukmu.",
  "Keberanianmu bercerita adalah bukti kekuatan luar biasa.",
  "Fokuslah pada apa yang bisa kamu kendalikan hari ini.",
  "Istirahat bukan berarti menyerah. Kamu manusia, bukan mesin.",
  "Dunia ini sedikit lebih indah karena kehadiranmu di sini.",
  "Segala sesuatu yang berat akan terasa lebih ringan seiring berjalannya waktu.",
  "Berikan dirimu izin untuk melepas beban yang bukan milikmu.",
  "Satu hari yang buruk tidak mendefinisikan seluruh hidupmu.",
  "Kamu sedang berproses, dan itu sudah sangat cukup.",
  "Kebaikan yang kamu berikan pada orang lain, berikan juga pada dirimu sendiri."
];

export function AffirmationWidget() {
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Set random initial affirmation
    setIndex(Math.floor(Math.random() * AFFIRMATIONS.length));
    setIsVisible(true);
  }, []);

  const handleRefresh = () => {
    setIsVisible(false);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % AFFIRMATIONS.length);
      setIsVisible(true);
    }, 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl mx-auto mt-8 mb-12"
    >
      <div className="relative p-8 rounded-3xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/40 dark:border-white/5 shadow-xl overflow-hidden group">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-teal-500/20 transition-colors" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <Quote className="w-8 h-8 text-teal-500/50 mb-4" />
          
          <AnimatePresence mode="wait">
            {isVisible && (
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-xl md:text-2xl font-medium text-gray-800 dark:text-gray-100 italic leading-relaxed"
              >
                "{AFFIRMATIONS[index]}"
              </motion.p>
            )}
          </AnimatePresence>

          <button
            onClick={handleRefresh}
            className="mt-6 p-2 rounded-full hover:bg-teal-50 dark:hover:bg-teal-900/20 text-teal-600 dark:text-teal-400 transition-all active:rotate-180 duration-500"
            title="Dapatkan afirmasi baru"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
