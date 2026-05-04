import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wind, Volume2, VolumeX } from "lucide-react";
import { useTextToSpeech } from "../utils/useVoice";
import { useApp } from "../context/AppContext";

interface Props {
  onClose: () => void;
}

type Phase = "inhale" | "hold" | "exhale" | "rest";

const PHASES: { phase: Phase; label: string; duration: number; instruction: string; color: string }[] = [
  { phase: "inhale",  label: "Tarik Napas",  duration: 4, instruction: "Hirup perlahan melalui hidung...",  color: "#14b8a6" },
  { phase: "hold",    label: "Tahan",         duration: 7, instruction: "Tahan napasmu...",                  color: "#a855f7" },
  { phase: "exhale",  label: "Buang Napas",   duration: 8, instruction: "Hembuskan perlahan lewat mulut...", color: "#3b82f6" },
  { phase: "rest",    label: "Istirahat",     duration: 2, instruction: "Rileks sejenak...",                 color: "#6b7280" },
];

export function BreathingExercise({ onClose }: Props) {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [count, setCount] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [running, setRunning] = useState(true);
  const [voiceGuide, setVoiceGuide] = useState(true);

  const { ttsVoice, speechLang } = useApp();
  const { speak, stop } = useTextToSpeech({ voiceURI: ttsVoice, lang: speechLang, rate: 0.9 });

  const current = PHASES[phaseIdx];

  useEffect(() => {
    if (running && voiceGuide) {
      speak(current.label);
    }
  }, [phaseIdx, running, voiceGuide, current.label, speak]);

  // Clean up speech on close
  useEffect(() => {
    return () => stop();
  }, [stop]);

  const nextPhase = useCallback(() => {
    setPhaseIdx(prev => {
      const next = (prev + 1) % PHASES.length;
      if (next === 0) setCycles(c => c + 1);
      return next;
    });
    setCount(0);
  }, []);

  useEffect(() => {
    if (!running) return;
    if (count >= current.duration) {
      nextPhase();
      return;
    }
    const t = setTimeout(() => setCount(c => c + 1), 1000);
    return () => clearTimeout(t);
  }, [count, current.duration, running, nextPhase]);

  const circleScale = current.phase === "inhale"
    ? 1 + (count / current.duration) * 0.6
    : current.phase === "exhale"
      ? 1.6 - (count / current.duration) * 0.6
      : current.phase === "hold" ? 1.6 : 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#030213]/95 backdrop-blur-xl"
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Wind className="w-5 h-5 text-teal-400" />
          <p className="text-teal-400 font-semibold text-sm uppercase tracking-widest">Latihan Napas 4-7-8</p>
        </div>
        <p className="text-white/40 text-sm">Siklus selesai: <span className="text-white font-bold">{cycles}</span></p>
      </div>

      {/* Breathing Circle */}
      <div className="relative flex items-center justify-center w-60 h-60 mb-10">
        {/* Outer pulse ring */}
        <motion.div
          className="absolute rounded-full border-2 border-white/10"
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.1, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{ width: "100%", height: "100%" }}
        />
        {/* Main circle */}
        <motion.div
          className="rounded-full shadow-2xl flex items-center justify-center"
          animate={{ scale: circleScale }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
          style={{
            width: 160, height: 160,
            background: `radial-gradient(circle, ${current.color}cc, ${current.color}44)`,
            boxShadow: `0 0 60px ${current.color}66`,
          }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={current.phase}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-white text-5xl font-bold tabular-nums"
            >
              {current.duration - count}
            </motion.span>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Phase label */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.phase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-center"
        >
          <p className="text-2xl font-bold text-white mb-1">{current.label}</p>
          <p className="text-white/50 text-sm">{current.instruction}</p>
        </motion.div>
      </AnimatePresence>

      {/* Phase dots */}
      <div className="flex gap-3 mt-10">
        {PHASES.map((p, i) => (
          <div
            key={p.phase}
            className="h-1.5 rounded-full transition-all duration-500"
            style={{
              width: i === phaseIdx ? 24 : 8,
              background: i === phaseIdx ? current.color : "rgba(255,255,255,0.15)"
            }}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="mt-8 flex gap-3">
        <button
          onClick={() => setRunning(r => !r)}
          className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-colors flex items-center gap-2"
        >
          {running ? "⏸ Jeda" : "▶ Lanjutkan"}
        </button>
        <button
          onClick={() => {
            setVoiceGuide(v => !v);
            if (voiceGuide) stop();
          }}
          className={`px-4 py-2.5 rounded-full text-white text-sm font-semibold transition-colors flex items-center gap-2 ${
            voiceGuide ? "bg-teal-500/20 text-teal-300 hover:bg-teal-500/30" : "bg-white/10 hover:bg-white/20 text-gray-400"
          }`}
          title={voiceGuide ? "Matikan Pemandu Suara" : "Nyalakan Pemandu Suara"}
        >
          {voiceGuide ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      <p className="mt-6 text-white/20 text-xs max-w-xs text-center">
        Teknik 4-7-8 membantu menenangkan sistem saraf dan mengurangi kecemasan secara cepat.
      </p>
    </motion.div>
  );
}
