import { useRef, useEffect, useState } from 'react';
import { Smile, ShieldAlert } from 'lucide-react';
import { useFaceEmotion, Emotion } from '../utils/useFaceEmotion';
import { motion, AnimatePresence } from 'framer-motion';

interface FaceEmotionDetectorProps {
  enabled: boolean;
  onEmotionChange?: (emotion: Emotion | null) => void;
  className?: string;
  compact?: boolean;
}

const EMOTION_MAP: Record<Emotion, { emoji: string; label: string; color: string }> = {
  happy: { emoji: '😊', label: 'Senang', color: 'text-green-400 bg-green-400/20 border-green-400/30' },
  sad: { emoji: '😢', label: 'Sedih', color: 'text-blue-400 bg-blue-400/20 border-blue-400/30' },
  angry: { emoji: '😡', label: 'Marah', color: 'text-red-400 bg-red-400/20 border-red-400/30' },
  fearful: { emoji: '😰', label: 'Takut', color: 'text-purple-400 bg-purple-400/20 border-purple-400/30' },
  disgusted: { emoji: '🤢', label: 'Jijik', color: 'text-emerald-400 bg-emerald-400/20 border-emerald-400/30' },
  surprised: { emoji: '😲', label: 'Terkejut', color: 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30' },
  neutral: { emoji: '😐', label: 'Netral', color: 'text-gray-300 bg-gray-400/20 border-gray-400/30' }
};

export function FaceEmotionDetector({ enabled, onEmotionChange, className = "", compact = false }: FaceEmotionDetectorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const { 
    isModelsLoaded, 
    currentEmotion, 
    emotionScores,
    hasFace,
    error 
  } = useFaceEmotion({
    videoRef,
    enabled: enabled && !!stream,
    intervalMs: 500
  });

  // Start/Stop camera stream
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    async function setupCamera() {
      if (enabled) {
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              width: { ideal: compact ? 320 : 640 },
              height: { ideal: compact ? 240 : 480 },
              facingMode: 'user'
            } 
          });
          
          activeStream = mediaStream;
          setStream(mediaStream);
          setPermissionDenied(false);

          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
            // Need to play it
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play().catch(console.error);
            };
          }
        } catch (err) {
          console.error("Camera access error:", err);
          setPermissionDenied(true);
        }
      } else {
        // Stop stream
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
          if (videoRef.current) {
            videoRef.current.srcObject = null;
          }
        }
      }
    }

    setupCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [enabled, compact]); // intentional dependency omit for stream to avoid re-triggering

  // Report emotion up
  useEffect(() => {
    if (onEmotionChange) {
      onEmotionChange(currentEmotion);
    }
  }, [currentEmotion, onEmotionChange]);

  if (!enabled && !compact) return null;

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 ${className}`}>
      {/* Video element */}
      <video
        ref={videoRef}
        muted
        playsInline
        className={`w-full h-full object-cover origin-center ${compact ? 'scale-x-[-1]' : 'scale-x-[-1]'} transition-opacity duration-500 ${
          enabled && stream ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Overlays */}
      <div className="absolute inset-0 pointer-events-none p-3 flex flex-col justify-between">
        
        {/* Top bar: Status */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-black/40 backdrop-blur-md rounded-full">
            <span className={`w-2 h-2 rounded-full ${enabled && stream ? "bg-red-500 animate-pulse" : "bg-gray-500"}`} />
            <span className="text-[10px] font-medium text-white/80 uppercase tracking-wider">
              {enabled ? (isModelsLoaded ? "Active" : "Loading Model...") : "Camera Off"}
            </span>
          </div>

          {!compact && hasFace && currentEmotion && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2"
            >
               <span className="text-2xl drop-shadow-md">{EMOTION_MAP[currentEmotion].emoji}</span>
            </motion.div>
          )}
        </div>

        {/* Center: Permissions error */}
        {permissionDenied && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 p-4 text-center backdrop-blur-sm">
            <ShieldAlert className="w-8 h-8 text-red-400 mb-2" />
            <p className="text-xs text-white/90">Akses kamera diblokir.</p>
            <p className="text-[10px] text-white/50 mt-1">Izinkan di pengaturan browser.</p>
          </div>
        )}
        
        {/* Center: Generic Error */}
        {error && !permissionDenied && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 p-4 text-center backdrop-blur-sm">
            <ShieldAlert className="w-6 h-6 text-yellow-400 mb-2" />
            <p className="text-[10px] text-white/90">{error}</p>
          </div>
        )}

        {/* Center: Face tracking visualizer (if needed, but mostly relying on bottom bar) */}
        {!hasFace && enabled && stream && isModelsLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 border border-dashed border-white/30 rounded-xl animate-[spin_10s_linear_infinite]" />
            <div className="absolute animate-pulse text-white/30">
              <Smile className="w-8 h-8" />
            </div>
          </div>
        )}

        {/* Bottom bar: Emotion Label & Confidence */}
        <div className="mt-auto">
          <AnimatePresence mode="wait">
            {hasFace && currentEmotion && emotionScores && (
              <motion.div
                key={currentEmotion}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 10, opacity: 0 }}
                className={`px-3 py-2 rounded-xl backdrop-blur-md border shadow-lg flex items-center gap-2 ${EMOTION_MAP[currentEmotion].color}`}
              >
                {compact && <span className="text-base leading-none">{EMOTION_MAP[currentEmotion].emoji}</span>}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider truncate">
                    {EMOTION_MAP[currentEmotion].label}
                  </p>
                  {/* Progress bar for confidence */}
                  <div className="h-1 bg-black/20 rounded-full mt-1 overflow-hidden">
                    <motion.div 
                      className="h-full bg-current opacity-70"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round(emotionScores[currentEmotion] * 100)}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
                <span className="text-[10px] font-mono opacity-80 shrink-0">
                  {Math.round(emotionScores[currentEmotion] * 100)}%
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
