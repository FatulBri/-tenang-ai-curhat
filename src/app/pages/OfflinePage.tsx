import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone, WifiOff, ArrowLeft, ExternalLink } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";

type Hotline = { name: string; number: string; description: string; type: string };

export function OfflinePage() {
  const [hotlines, setHotlines] = useState<Hotline[]>([]);
  const [emergencyNote, setEmergencyNote] = useState("");
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    fetch("/hotlines-offline.json")
      .then((r) => r.json())
      .then((data) => {
        setHotlines(data.hotlines ?? []);
        setEmergencyNote(data.emergencyNote ?? "");
      })
      .catch(() => {
        setHotlines([
          { name: "Sejiwa", number: "119", description: "Kesehatan jiwa 24/7", type: "call" },
          { name: "Kemenkes", number: "500-454", description: "Konseling mental", type: "call" },
        ]);
      });
  }, []);

  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  return (
    <motion.div className="min-h-screen bg-[#fafafc] dark:bg-[#030213] flex flex-col">
      <Navigation />
      <main className="max-w-2xl mx-auto px-6 py-10 flex-1 w-full space-y-6">
        <Card className="p-8 text-center border-amber-200 dark:border-amber-800/50 bg-amber-50/80 dark:bg-amber-950/30">
          <WifiOff className="w-12 h-12 text-amber-600 mx-auto mb-4" aria-hidden />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Mode Offline</h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
            Halaman ini tersedia tanpa internet. Gunakan hotline di bawah jika Anda butuh bantuan segera.
          </p>
          {emergencyNote && (
            <p className="text-xs text-amber-800 dark:text-amber-200 font-medium">{emergencyNote}</p>
          )}
        </Card>

        <div className="space-y-3" role="list">
          {hotlines.map((h) => (
            <Card
              key={h.number}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-gray-100 dark:border-slate-800"
              role="listitem"
            >
              <motion.div layout>
                <h2 className="font-bold text-gray-900 dark:text-white">{h.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{h.description}</p>
                <p className="text-lg font-mono font-bold text-teal-600 dark:text-teal-400 mt-1">{h.number}</p>
              </motion.div>
              <a
                href={`tel:${h.number.replace(/[^\d+]/g, "")}`}
                className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 py-3 rounded-xl transition-colors"
              >
                <Phone className="w-4 h-4" />
                Telepon
              </a>
            </Card>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/hotline">
              <ExternalLink className="w-4 h-4 mr-2" />
              Halaman hotline lengkap
            </Link>
          </Button>
          {online && (
            <Button asChild className="rounded-xl bg-teal-600 hover:bg-teal-700">
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke beranda
              </Link>
            </Button>
          )}
        </div>
      </main>
      <Footer />
    </motion.div>
  );
}
