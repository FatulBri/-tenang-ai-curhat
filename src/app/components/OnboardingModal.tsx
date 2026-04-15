import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Shield, MessageCircle, Sparkles, ChevronRight, X, Key } from "lucide-react";
import { Button } from "./ui/button";
import { useApp } from "../context/AppContext";

const STORAGE_KEY = "tenang_onboarding_done";

const steps = [
  {
    icon: <Heart className="w-10 h-10 text-teal-500 fill-teal-100 dark:fill-teal-900" />,
    gradient: "from-teal-400 to-cyan-400",
    title: "Selamat Datang di TENANG 💙",
    desc: "Ruang aman untukmu melepaskan semua yang terpendam. Ceritakan apa saja — tidak ada yang menghakimimu di sini.",
  },
  {
    icon: <MessageCircle className="w-10 h-10 text-purple-500" />,
    gradient: "from-purple-400 to-pink-400",
    title: "Chat Berkelanjutan 🤝",
    desc: "Tidak perlu berhenti di satu pesan. Lanjutkan obrolan dengan AI sepanjang yang kamu mau, seperti ngobrol dengan sahabat.",
  },
  {
    icon: <Sparkles className="w-10 h-10 text-amber-500" />,
    gradient: "from-amber-400 to-orange-400",
    title: "AI yang Empati 🧠",
    desc: "Pilih karakter AI yang paling nyaman: Psikolog, Sahabat, Orang Tua, atau Motivator — semuanya siap mendengarkanmu.",
  },
  {
    icon: <Shield className="w-10 h-10 text-blue-500" />,
    gradient: "from-blue-400 to-indigo-400",
    title: "100% Anonim & Rahasia 🔒",
    desc: "Semua ceritamu tersimpan di perangkatmu sendiri. Tidak ada akun, tidak ada server, tidak ada yang tahu identitasmu.",
  },
  {
    icon: <Key className="w-10 h-10 text-emerald-500" />,
    gradient: "from-emerald-400 to-teal-400",
    title: "Koneksikan AI 🏠",
    desc: "Masukkan Gemini API Key Anda untuk mulai curhat. Jika belum punya, Anda bisa melewati langkah ini.",
    isInput: true,
  },
];

export function OnboardingModal() {
  const { setApiKey, apiKey: currentKey } = useApp();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [localKey, setLocalKey] = useState(currentKey || "");

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      // Small delay so page animations don't conflict
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  const isLast = step === steps.length - 1;
  const current = steps[step];

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={finish}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.88, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-700/60 overflow-hidden">

              {/* Coloured top bar */}
              <div className={`h-2 w-full bg-gradient-to-r ${current.gradient}`} />

              {/* Close */}
              <button
                onClick={finish}
                className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Content */}
              <div className="px-8 pt-8 pb-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col items-center text-center gap-5"
                  >
                    {/* Icon with glow */}
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br ${current.gradient} bg-opacity-10 p-4 shadow-lg`}>
                      {current.icon}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 leading-snug">
                        {current.title}
                      </h2>
                      <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                        {current.desc}
                      </p>
                    </div>

                    {current.isInput && (
                      <div className="w-full mt-2">
                        <input
                          type="password"
                          placeholder="Masukkan API Key (AIzaSy...)"
                          value={localKey}
                          onChange={(e) => setLocalKey(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/30 focus:outline-none transition-all"
                        />
                        <p className="text-[10px] text-gray-400 mt-2">
                          Key ini disimpan aman di browser Anda.
                        </p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Step dots */}
              <div className="flex justify-center gap-1.5 pb-2">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === step
                        ? `w-6 bg-gradient-to-r ${current.gradient}`
                        : "w-1.5 bg-gray-200 dark:bg-slate-700"
                    }`}
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="px-8 pb-8 pt-4 flex gap-3">
                {isLast ? (
                  <Button
                    onClick={() => {
                      if (localKey) setApiKey(localKey);
                      finish();
                    }}
                    className={`w-full bg-gradient-to-r ${current.gradient} text-white rounded-xl py-6 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all`}
                  >
                    Selesai & Mulai 🚀
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      onClick={finish}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-medium"
                    >
                      Lewati
                    </Button>
                    <Button
                      onClick={() => setStep(s => s + 1)}
                      className={`flex-1 bg-gradient-to-r ${current.gradient} text-white rounded-xl py-5 font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all`}
                    >
                      Lanjut <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
