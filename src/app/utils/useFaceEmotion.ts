import { useState, useEffect, useRef, useCallback } from 'react';
import * as faceapi from '@vladmandic/face-api';

export type Emotion = 'neutral' | 'happy' | 'sad' | 'angry' | 'fearful' | 'disgusted' | 'surprised';

// CDN URL for the pre-trained weights
const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';

interface UseFaceEmotionOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  enabled: boolean;
  intervalMs?: number;
}

export function useFaceEmotion({ videoRef, enabled, intervalMs = 500 }: UseFaceEmotionOptions) {
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<Emotion | null>(null);
  const [emotionScores, setEmotionScores] = useState<Record<string, number> | null>(null);
  const [hasFace, setHasFace] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const detectIntervalRef = useRef<number | null>(null);

  // Load models on mount
  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        setIsModelsLoaded(true);
      } catch (err) {
        console.error("Error loading face models:", err);
        setError("Gagal memuat model deteksi wajah. Periksa koneksi internet.");
      }
    };
    
    if (!isModelsLoaded) {
      loadModels();
    }
  }, [isModelsLoaded]);

  const startDetection = useCallback(async () => {
    if (!enabled || !isModelsLoaded || !videoRef.current || isDetecting) return;
    
    setIsDetecting(true);
    
    detectIntervalRef.current = window.setInterval(async () => {
      if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) {
        return;
      }

      try {
        const detection = await faceapi.detectSingleFace(
          videoRef.current, 
          new faceapi.TinyFaceDetectorOptions()
        ).withFaceExpressions();

        if (detection) {
          setHasFace(true);
          const expressions = detection.expressions;
          setEmotionScores(expressions as unknown as Record<string, number>);
          
          // Find the emotion with the highest probability
          const highestEmotion = Object.keys(expressions).reduce((a, b) => 
            // @ts-ignore
            expressions[a] > expressions[b] ? a : b
          ) as Emotion;
          
          setCurrentEmotion(highestEmotion);
        } else {
          setHasFace(false);
          setCurrentEmotion(null);
          setEmotionScores(null);
        }
      } catch (err) {
        console.error("Face detection error:", err);
      }
    }, intervalMs);
    
  }, [enabled, isModelsLoaded, videoRef, intervalMs, isDetecting]);

  const stopDetection = useCallback(() => {
    if (detectIntervalRef.current) {
      window.clearInterval(detectIntervalRef.current);
      detectIntervalRef.current = null;
    }
    setIsDetecting(false);
    setCurrentEmotion(null);
    setEmotionScores(null);
    setHasFace(false);
  }, []);

  useEffect(() => {
    if (enabled && isModelsLoaded && !isDetecting && videoRef.current?.readyState === 4) {
      startDetection();
    } else if (!enabled && isDetecting) {
      stopDetection();
    }

    return () => {
      stopDetection();
    };
  }, [enabled, isModelsLoaded, startDetection, stopDetection, isDetecting, videoRef]);

  return {
    isModelsLoaded,
    isDetecting,
    currentEmotion,
    emotionScores,
    hasFace,
    error,
    startDetection,
    stopDetection
  };
}
