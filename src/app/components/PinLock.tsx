import { useState, useEffect } from "react";
import { Lock, AlertCircle } from "lucide-react";
import { useApp } from "../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";

export function PinLock() {
  const { isAppLocked, setIsAppLocked, appPin } = useApp();
  const [inputPin, setInputPin] = useState("");
  const [error, setError] = useState(false);

  // Clear input when lock screen appears
  useEffect(() => {
    if (isAppLocked) {
      setInputPin("");
      setError(false);
    }
  }, [isAppLocked]);

  const handleKeyPress = (num: string) => {
    if (inputPin.length < 4) {
      const newPin = inputPin + num;
      setInputPin(newPin);
      setError(false);
      
      if (newPin.length === 4) {
        if (newPin === appPin) {
          // Success!
          setTimeout(() => setIsAppLocked(false), 200);
        } else {
          // Error
          setError(true);
          setTimeout(() => setInputPin(""), 500);
        }
      }
    }
  };

  const handleBackspace = () => {
    setInputPin(prev => prev.slice(0, -1));
    setError(false);
  };

  if (!isAppLocked) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-[#030213]/90 backdrop-blur-3xl flex flex-col items-center justify-center p-6"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="max-w-xs w-full bg-slate-900/80 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col items-center"
        >
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-colors ${error ? 'bg-red-500/20 text-red-500' : 'bg-teal-500/20 text-teal-500'}`}>
            {error ? <AlertCircle className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
          </div>
          
          <h2 className="text-xl font-bold text-white mb-2">Aplikasi Terkunci</h2>
          <p className="text-gray-400 text-sm text-center mb-8">Masukkan PIN untuk membuka kembali riwayat curhat Anda.</p>

          {/* Dots */}
          <div className="flex gap-4 mb-8">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={error ? { x: [-5, 5, -5, 5, 0] } : {}}
                transition={{ duration: 0.4 }}
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  inputPin.length > i 
                    ? error ? "bg-red-500 border-red-500" : "bg-teal-400 border-teal-400" 
                    : "border-gray-600 bg-transparent"
                }`}
              />
            ))}
          </div>

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-4 w-full">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleKeyPress(num.toString())}
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-medium text-white hover:bg-white/10 active:bg-white/20 transition-colors mx-auto"
              >
                {num}
              </button>
            ))}
            <div /> {/* Empty space */}
            <button
              onClick={() => handleKeyPress("0")}
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-medium text-white hover:bg-white/10 active:bg-white/20 transition-colors mx-auto"
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              className="w-16 h-16 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 active:bg-white/20 transition-colors mx-auto"
            >
              ⌫
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
