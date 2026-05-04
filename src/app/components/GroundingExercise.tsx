import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, Hand, Volume2, VolumeX, Flower, Utensils, ChevronRight, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";
import { useTextToSpeech } from "../utils/useVoice";
import { useApp } from "../context/AppContext";

interface Props {
  onClose: () => void;
}

const STEPS = [
  {
    count: 5,
    icon: Eye,
    title: "Lihat",
    instruction: "Sebutkan 5 benda yang bisa kamu lihat saat ini di sekitarmu.",
    color: "text-blue-400",
    bg: "bg-blue-400/20"
  },
  {
    count: 4,
    icon: Hand,
    title: "Sentuh",
    instruction: "Sebutkan 4 benda yang bisa kamu rasakan sentuhannya (misal: baju, meja, rambut).",
    color: "text-orange-400",
    bg: "bg-orange-400/20"
  },
  {
    count: 3,
    icon: Volume2,
    title: "Dengar",
    instruction: "Sebutkan 3 suara yang bisa kamu dengar (misal: detik jam, angin, kendaraan).",
    color: "text-purple-400",
    bg: "bg-purple-400/20"
  },
  {
    count: 2,
    icon: Flower,
    title: "Cium",
    instruction: "Sebutkan 2 aroma yang bisa kamu cium atau bayangkan aromanya.",
    color: "text-pink-400",
    bg: "bg-pink-400/20"
  },
  {
    count: 1,
    icon: Utensils,
    title: "Rasa",
    instruction: "Sebutkan 1 rasa yang bisa kamu rasakan di mulutmu atau bayangkan rasanya.",
    color: "text-teal-400",
    bg: "bg-teal-400/20"
  }
];

export function GroundingExercise({ onClose }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [voiceGuide, setVoiceGuide] = useState(true);

  const { ttsVoice, speechLang } = useApp();
  const { speak, stop } = useTextToSpeech({ voiceURI: ttsVoice, lang: speechLang, rate: 0.95 });

  const step = STEPS[currentStep];

  useEffect(() => {
    if (voiceGuide && !isFinished) {
      speak(step.instruction);
    } else if (isFinished && voiceGuide) {
      speak("Bagus sekali. Tarik napas panjang, dan hembuskan. Anda sudah lebih tenang sekarang.");
    }
  }, [currentStep, voiceGuide, isFinished, step.instruction, speak]);

  // Cleanup
  useEffect(() => {
    return () => stop();
  }, [stop]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#030213]/95 backdrop-blur-3xl p-6"
    >
      {/* Top Controls */}
      <div className="absolute top-6 right-6 flex gap-3">
        <button
          onClick={() => {
            setVoiceGuide(v => !v);
            if (voiceGuide) stop();
            else if (!isFinished) speak(STEPS[currentStep].instruction);
          }}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            voiceGuide ? "bg-teal-500/20 text-teal-300 hover:bg-teal-500/30" : "bg-white/10 hover:bg-white/20 text-gray-400"
          }`}
          title={voiceGuide ? "Matikan Pemandu Suara" : "Nyalakan Pemandu Suara"}
        >
          {voiceGuide ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="max-w-md w-full">
        <AnimatePresence mode="wait">
          {!isFinished ? (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center text-center space-y-8"
            >
              {/* Step indicator */}
              <div className="flex gap-2">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentStep ? "w-8 bg-teal-500" : i < currentStep ? "w-4 bg-teal-500/40" : "w-4 bg-white/10"
                    }`}
                  />
                ))}
              </div>

              {/* Icon Circle */}
              <div className={`w-32 h-32 rounded-full ${step.bg} flex items-center justify-center relative`}>
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: [0.8, 1.1, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  <step.icon className={`w-14 h-14 ${step.color}`} />
                </motion.div>
                <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-white text-[#030213] flex items-center justify-center font-bold text-xl shadow-xl">
                  {step.count}
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-white uppercase tracking-wider">{step.title}</h2>
                <p className="text-gray-400 text-lg leading-relaxed">
                  {step.instruction}
                </p>
              </div>

              {/* Progress interaction */}
              <Button
                onClick={handleNext}
                className="bg-teal-500 hover:bg-teal-600 text-white px-10 py-6 rounded-2xl text-lg font-semibold shadow-xl transition-all hover:scale-105 active:scale-95 group"
              >
                Lanjut <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center space-y-8"
            >
              <div className="w-24 h-24 rounded-full bg-teal-500/20 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-16 h-16 text-teal-400" />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-white">Sudah Lebih Baik?</h2>
                <p className="text-gray-400">
                  Teknik grounding membantu kamu kembali ke masa kini dan menenangkan pikiran yang melayang.
                </p>
              </div>
              <Button
                onClick={onClose}
                className="w-full bg-white text-black hover:bg-gray-200 py-6 rounded-2xl font-bold text-lg"
              >
                Selesai
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="mt-12 text-white/20 text-xs max-w-xs text-center">
        Teknik 5-4-3-2-1 adalah metode mindfulness untuk mengatasi kecemasan dengan fokus pada panca indera.
      </p>
    </motion.div>
  );
}
