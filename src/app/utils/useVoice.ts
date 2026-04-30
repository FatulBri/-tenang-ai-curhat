import { useState, useRef, useCallback, useEffect } from "react";

// ─── Speech Recognition Hook ────────────────────────────────────────────────
interface UseSpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const { lang = "id-ID", continuous = true, onResult, onError } = options;
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(32).fill(0));
  const animFrameRef = useRef<number>(0);

  const isSupported = typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const startAudioVisualizer = useCallback(() => {
    const updateLevels = () => {
      // Fake audio levels using Math.random for visual effect
      // This completely avoids any getUserMedia / microphone hardware conflicts
      // with SpeechRecognition on all devices (especially mobile).
      const levels = Array.from({ length: 32 }, () => Math.random() * 0.6 + 0.1);
      setAudioLevels(levels);
      
      // Update at a slower rate so it looks like a real voice wave
      animFrameRef.current = window.setTimeout(updateLevels, 100) as unknown as number;
    };
    
    // Clear any existing
    if (animFrameRef.current) clearTimeout(animFrameRef.current);
    updateLevels();
  }, []);

  const stopAudioVisualizer = useCallback(() => {
    if (animFrameRef.current) {
      clearTimeout(animFrameRef.current);
      animFrameRef.current = 0;
    }
    setAudioLevels(new Array(32).fill(0));
  }, []);

  const start = useCallback(() => {
    if (!isSupported) {
      onError?.("Browser tidak mendukung fitur suara (Gunakan Chrome/Edge).");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
      // Auto-restart if continuous and still should be listening
      if (continuous && recognitionRef.current === recognition) {
        try { recognition.start(); } catch { /* already stopped */ }
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech error", event.error);
      if (event.error !== "no-speech" && event.error !== "aborted") {
        onError?.(event.error);
        setIsListening(false);
      }
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        onResult?.(finalTranscript);
      }
      setInterimTranscript(interim);
    };

    recognitionRef.current = recognition;
    recognition.start();
    
    // Karena kita sekarang menggunakan fake audio visualizer, 
    // kita bisa jalankan ini dengan aman di semua perangkat (termasuk mobile)
    // tanpa takut konflik akses mikrofon
    startAudioVisualizer();
  }, [isSupported, lang, continuous, onResult, onError, startAudioVisualizer]);

  const stop = useCallback(() => {
    const recognition = recognitionRef.current;
    recognitionRef.current = null; // prevent auto-restart
    if (recognition) {
      recognition.stop();
    }
    setIsListening(false);
    setInterimTranscript("");
    stopAudioVisualizer();
  }, [stopAudioVisualizer]);

  const toggle = useCallback(() => {
    if (isListening) {
      stop();
    } else {
      start();
    }
  }, [isListening, start, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        const rec = recognitionRef.current;
        recognitionRef.current = null;
        rec.stop();
      }
      stopAudioVisualizer();
    };
  }, [stopAudioVisualizer]);

  return {
    isListening,
    interimTranscript,
    audioLevels,
    isSupported,
    start,
    stop,
    toggle,
  };
}

// ─── Text-to-Speech Hook ────────────────────────────────────────────────────
interface UseTextToSpeechOptions {
  rate?: number;
  voiceURI?: string;
  lang?: string;
  onStart?: () => void;
  onEnd?: () => void;
}

export function useTextToSpeech(options: UseTextToSpeechOptions = {}) {
  const { rate = 1, voiceURI, lang = "id-ID", onStart, onEnd } = options;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentText, setCurrentText] = useState("");
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  // Load available voices
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      setVoices(allVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [isSupported]);

  const speak = useCallback((text: string) => {
    if (!isSupported || !text.trim()) return;

    // Cancel previous
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.lang = lang;

    // Try to find selected voice
    if (voiceURI) {
      const selected = voices.find(v => v.voiceURI === voiceURI);
      if (selected) utterance.voice = selected;
    } else {
      // Auto-pick Indonesian voice if available
      const idVoice = voices.find(v => v.lang.startsWith("id"));
      if (idVoice) utterance.voice = idVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      setCurrentText(text);
      onStart?.();
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentText("");
      onEnd?.();
    };

    utterance.onerror = (event) => {
      console.error("TTS Error:", event);
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentText("");
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported, rate, lang, voiceURI, voices, onStart, onEnd]);

  const pause = useCallback(() => {
    if (isSupported && isSpeaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isSupported, isSpeaking]);

  const resume = useCallback(() => {
    if (isSupported && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isSupported, isPaused]);

  const stopSpeaking = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentText("");
    }
  }, [isSupported]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  return {
    isSpeaking,
    isPaused,
    voices,
    currentText,
    isSupported,
    speak,
    pause,
    resume,
    stop: stopSpeaking,
  };
}
