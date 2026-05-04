import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Moon, Play, Pause, SkipForward } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useTextToSpeech } from "../utils/useVoice";
import { Button } from "./ui/button";

interface Props {
  onClose: () => void;
}

const SLEEP_STORIES = [
  {
    title: "Sungai di Hutan Bambu",
    paragraphs: [
      "Bayangkan kamu sedang berjalan di sebuah hutan bambu yang sangat tenang. Angin bertiup lembut, membuat daun-daun bambu bergoyang pelan dan mengeluarkan suara seperti bisikan.",
      "Di kejauhan, kamu mendengar suara air mengalir. Kamu mengikuti suara itu dan menemukan sungai kecil yang jernih. Airnya berkilau ditimpa cahaya bulan.",
      "Kamu duduk di tepi sungai, melepas sepatumu, dan merasakan rumput lembut di bawah kakimu. Udara malam begitu sejuk dan segar.",
      "Perlahan, semua beban yang kamu pikul hari ini larut bersama aliran air. Setiap napasmu menjadi lebih dalam, lebih tenang. Matamu terasa berat.",
      "Kamu berbaring di atas rumput, menatap langit malam yang penuh bintang. Satu per satu, bintang-bintang itu berkedip seolah mengucapkan selamat malam untukmu. Tidurlah dengan tenang."
    ]
  },
  {
    title: "Awan yang Mengantar Tidur",
    paragraphs: [
      "Bayangkan tubuhmu terbaring di atas awan putih yang sangat lembut. Awan ini hangat, nyaman, dan mengapung perlahan di langit senja.",
      "Di bawahmu, dunia terlihat kecil dan jauh. Semua kekhawatiran, semua masalah, terlihat sangat kecil dari ketinggian ini.",
      "Awan membawamu terbang pelan melewati pegunungan yang tertutup salju. Udaranya bersih dan dingin, tapi awanmu menjagamu tetap hangat.",
      "Langit berubah dari jingga menjadi ungu, lalu biru tua. Bintang pertama muncul, lalu yang kedua, lalu ribuan bintang menghiasi langit.",
      "Awan berhenti di sebuah lembah yang sunyi. Di sini tidak ada suara, tidak ada gangguan. Hanya kamu, dan ketenangan yang memelukmu. Selamat tidur."
    ]
  },
  {
    title: "Toko Buku Ajaib",
    paragraphs: [
      "Kamu menemukan sebuah toko buku kecil di ujung gang yang belum pernah kamu lihat sebelumnya. Pintunya terbuat dari kayu tua, dan bel kecil berbunyi saat kamu masuk.",
      "Di dalam, ribuan buku tersusun rapi dari lantai hingga langit-langit. Udara tercium seperti kertas tua dan vanila. Sebuah lampu minyak berkedip lembut di sudut ruangan.",
      "Seorang kucing tua bermata hijau menghampirimu dan mengajakmu duduk di kursi empuk di dekat jendela. Di luar jendela, hujan mulai turun perlahan.",
      "Kamu membuka sebuah buku secara acak. Halaman pertamanya bertuliskan: 'Cerita ini ditulis khusus untukmu. Setiap bab adalah sebuah mimpi indah.'",
      "Suara hujan dan kehangatan toko buku ini membuatmu mengantuk. Kucing itu bergelung di pangkuanmu, mendengkur pelan. Buku itu menutup sendiri. Tidurlah."
    ]
  }
];

export function SleepStoryModal({ onClose }: Props) {
  const [story] = useState(() => SLEEP_STORIES[Math.floor(Math.random() * SLEEP_STORIES.length)]);
  const [currentPara, setCurrentPara] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { ttsVoice, speechLang } = useApp();
  const { speak, stop, isSpeaking } = useTextToSpeech({ voiceURI: ttsVoice, lang: speechLang, rate: 0.8 });

  const readCurrentParagraph = (paraIndex: number) => {
    if (paraIndex >= story.paragraphs.length) {
      setIsFinished(true);
      setIsPlaying(false);
      return;
    }
    setCurrentPara(paraIndex);
    speak(story.paragraphs[paraIndex]);

    // Estimate reading time: ~100 words per minute at rate 0.8
    const wordCount = story.paragraphs[paraIndex].split(" ").length;
    const readTimeMs = (wordCount / 100) * 60 * 1000 * 1.3; // 1.3x buffer

    timerRef.current = setTimeout(() => {
      readCurrentParagraph(paraIndex + 1);
    }, readTimeMs + 1500); // +1.5s pause between paragraphs
  };

  const handlePlay = () => {
    if (isPlaying) {
      // Pause
      stop();
      if (timerRef.current) clearTimeout(timerRef.current);
      setIsPlaying(false);
    } else {
      // Play
      setIsPlaying(true);
      readCurrentParagraph(currentPara);
    }
  };

  const handleNext = () => {
    stop();
    if (timerRef.current) clearTimeout(timerRef.current);
    if (currentPara < story.paragraphs.length - 1) {
      const next = currentPara + 1;
      setCurrentPara(next);
      if (isPlaying) {
        readCurrentParagraph(next);
      }
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      stop();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [stop]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#030213]/98 backdrop-blur-xl p-6"
    >
      {/* Stars background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
          />
        ))}
      </div>

      {/* Close button */}
      <button
        onClick={() => { stop(); onClose(); }}
        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-20"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="max-w-lg w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Moon className="w-12 h-12 text-indigo-300 mx-auto mb-4 drop-shadow-[0_0_20px_rgba(129,140,248,0.5)]" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-1">{story.title}</h2>
          <p className="text-indigo-300/60 text-sm">Dongeng Pengantar Tidur</p>
        </div>

        {/* Story Text */}
        <div className="min-h-[180px] flex items-center justify-center mb-10">
          <AnimatePresence mode="wait">
            {!isFinished ? (
              <motion.p
                key={currentPara}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-white/80 text-lg leading-relaxed text-center font-serif italic"
              >
                "{story.paragraphs[currentPara]}"
              </motion.p>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4"
              >
                <span className="text-5xl">🌙</span>
                <p className="text-white/60 text-lg font-serif italic">Selamat malam, mimpi indah...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {story.paragraphs.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === currentPara ? "w-8 bg-indigo-400" : i < currentPara ? "w-4 bg-indigo-400/40" : "w-4 bg-white/10"
              }`}
            />
          ))}
        </div>

        {/* Controls */}
        {!isFinished ? (
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={handlePlay}
              className="w-14 h-14 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
              size="icon"
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current pl-1" />}
            </Button>
            <Button
              onClick={handleNext}
              variant="ghost"
              className="text-white/40 hover:text-white/80 rounded-full"
              size="icon"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>
        ) : (
          <div className="flex justify-center">
            <Button
              onClick={onClose}
              className="bg-white/10 hover:bg-white/20 text-white rounded-xl px-8 py-5 font-semibold"
            >
              Selamat Tidur 💤
            </Button>
          </div>
        )}

        {/* Tip */}
        <p className="mt-8 text-white/15 text-xs text-center max-w-xs mx-auto">
          Nyalakan Soundscapes (🎵 hujan / jangkrik) untuk pengalaman tidur yang lebih mendalam.
        </p>
      </div>
    </motion.div>
  );
}
