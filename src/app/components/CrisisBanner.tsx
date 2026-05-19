import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Phone, X, Heart } from "lucide-react";
import { detectCrisis } from "../../../shared/crisis";

interface CrisisBannerProps {
  text: string;
  onDismiss?: () => void;
}

export function CrisisBanner({ text, onDismiss }: CrisisBannerProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(detectCrisis(text));
  }, [text]);

  const dismiss = () => {
    setShow(false);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="w-full"
        >
          <div className="relative bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl p-5 shadow-2xl shadow-red-500/30 border border-red-400/30 overflow-hidden">
            {/* Pulse background */}
            <div className="absolute inset-0 bg-white/5 animate-pulse pointer-events-none rounded-2xl" />

            {/* Dismiss */}
            <button
              onClick={dismiss}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>

            <div className="flex gap-4 items-start pr-8">
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-yellow-300 flex-shrink-0" />
                  <p className="text-white font-bold text-sm">Kami Peduli Padamu 💙</p>
                </div>
                <p className="text-red-100 text-sm leading-relaxed mb-4">
                  Sepertinya kamu sedang dalam tekanan yang sangat berat. Kamu tidak harus menanggung ini sendirian.
                  Tolong hubungi bantuan profesional sekarang — mereka siap mendengarkan!
                </p>

                {/* Hotline Buttons */}
                <div className="flex flex-wrap gap-2">
                  <a
                    href="tel:119ext8"
                    className="flex items-center gap-2 bg-white text-red-600 font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-red-50 transition-colors shadow-md"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    119 ext 8 — Hotline Darurat
                  </a>
                  <a
                    href="tel:1500454"
                    className="flex items-center gap-2 bg-white/20 text-white font-semibold text-xs px-4 py-2.5 rounded-xl hover:bg-white/30 transition-colors border border-white/30"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    1500-454 — Into The Light
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Hook — returns true if crisis keywords detected in text */
export function useDetectCrisis(text: string) {
  return detectCrisis(text);
}
