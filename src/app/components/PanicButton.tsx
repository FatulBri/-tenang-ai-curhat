import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Wind, X, Phone } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { BreathingExercise } from "./BreathingExercise";
import { GroundingExercise } from "./GroundingExercise";

export function PanicButton() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const [showGrounding, setShowGrounding] = useState(false);

  return (
    <>
      {/* Breathing Exercise Overlay */}
      <AnimatePresence>
        {showBreathing && (
          <BreathingExercise onClose={() => setShowBreathing(false)} />
        )}
        {showGrounding && (
          <GroundingExercise onClose={() => setShowGrounding(false)} />
        )}
      </AnimatePresence>

      {/* Expanded Menu */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            {/* Menu Items */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="fixed bottom-28 right-8 z-50 flex flex-col gap-3 items-end"
            >
              <button
                onClick={() => { setOpen(false); navigate("/hotline"); }}
                className="flex items-center gap-3 px-5 py-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl shadow-xl font-semibold text-sm transition-all hover:-translate-y-0.5"
              >
                <Phone className="w-4 h-4" />
                Hotline Darurat 🆘
              </button>
              <button
                onClick={() => { setOpen(false); setShowBreathing(true); }}
                className="flex items-center gap-3 px-5 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-2xl shadow-xl font-semibold text-sm transition-all hover:-translate-y-0.5"
              >
                <Wind className="w-4 h-4" />
                Latihan Napas 🧘
              </button>
              <button
                onClick={() => { setOpen(false); setShowGrounding(true); }}
                className="flex items-center gap-3 px-5 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-2xl shadow-xl font-semibold text-sm transition-all hover:-translate-y-0.5"
              >
                <AlertCircle className="w-4 h-4" />
                Teknik Grounding ⚓
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-2xl flex items-center justify-center group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: open
            ? ["0 0 0 0 rgba(239,68,68,0)"]
            : ["0 0 0 0 rgba(239,68,68,0.7)", "0 0 0 20px rgba(239,68,68,0)"],
        }}
        transition={{ duration: 1.5, repeat: open ? 0 : Infinity }}
        aria-label="Emergency Help"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X className="w-7 h-7" />
            </motion.div>
          ) : (
            <motion.div key="alert" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <AlertCircle className="w-8 h-8" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tooltip */}
        {!open && (
          <span className="absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Butuh Bantuan?
          </span>
        )}
      </motion.button>
    </>
  );
}
