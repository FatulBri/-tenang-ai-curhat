import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { motion } from "motion/react";

export function PanicButton() {
  const navigate = useNavigate();

  return (
    <motion.button
      onClick={() => navigate("/hotline")}
      className="fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-2xl flex items-center justify-center group"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        boxShadow: [
          "0 0 0 0 rgba(239, 68, 68, 0.7)",
          "0 0 0 20px rgba(239, 68, 68, 0)",
        ],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        repeatType: "loop",
      }}
      aria-label="Emergency Help"
    >
      <AlertCircle className="w-8 h-8" />
      
      {/* Tooltip */}
      <span className="absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Butuh Bantuan Darurat?
      </span>
    </motion.button>
  );
}
