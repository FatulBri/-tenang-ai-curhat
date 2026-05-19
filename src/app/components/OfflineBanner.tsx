import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { WifiOff, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const onOffline = () => setOffline(true);
    const onOnline = () => setOffline(false);
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  return (
    <AnimatePresence>
      {offline && (
        <motion.div
          initial={{ opacity: 0, y: -48 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -48 }}
          className="fixed top-0 left-0 right-0 z-[200] bg-amber-600 text-white px-4 py-2.5 shadow-lg"
          role="alert"
        >
          <motion.div layout className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-2 text-sm font-medium">
            <WifiOff className="w-4 h-4 shrink-0" aria-hidden />
            <span>Anda sedang offline. AI tidak tersedia.</span>
            <Link
              to="/offline"
              className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-amber-100"
            >
              <Phone className="w-3.5 h-3.5" />
              Lihat hotline darurat
            </Link>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
