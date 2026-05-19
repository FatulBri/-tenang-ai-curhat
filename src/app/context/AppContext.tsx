import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp?: string;
}

export interface Curhat {
  id: string;
  messages: ChatMessage[];
  timestamp: Date;
  mood: string;
  category?: string;
  persona?: string;
  bookmarked?: boolean;
}

export interface MoodEntry {
  id: string;
  mood: string;
  date: Date;
}

export interface GratitudeEntry {
  id: string;
  content: string;
  date: Date;
}

export interface Bottle {
  id: string;
  message: string;
  timestamp: Date;
  isUserMessage?: boolean;
}

export interface Quest {
  id: string;
  text: string;
  completed: boolean;
  type: 'drink' | 'stretch' | 'praise' | 'breathe' | 'walk';
}

export interface TimeCapsule {
  id: string;
  message: string;
  createdAt: Date;
  openAt: Date;
  isOpened: boolean;
}

interface AppContextType {
  curhats: Curhat[];
  addCurhat: (curhat: Curhat) => void;
  moods: MoodEntry[];
  addMood: (mood: MoodEntry) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  currentCurhat: Curhat | null;
  setCurrentCurhat: (curhat: Curhat | null) => void;
  updateCurhatMessages: (id: string, newMessages: ChatMessage[]) => void;
  deleteCurhat: (id: string) => void;
  toggleBookmark: (id: string) => void;
  clearAllCurhats: () => void;
  aiName: string;
  setAiName: (name: string) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (v: boolean) => void;
  // Voice settings
  autoTTS: boolean;
  setAutoTTS: (v: boolean) => void;
  ttsSpeed: number;
  setTtsSpeed: (v: number) => void;
  ttsVoice: string;
  setTtsVoice: (v: string) => void;
  speechLang: string;
  setSpeechLang: (v: string) => void;
  faceDetectionEnabled: boolean;
  setFaceDetectionEnabled: (v: boolean) => void;
  streak: number;
  badges: Badge[];
  growthScore: number;
  isBlooming: boolean;
  exportData: () => void;
  importData: (file: File) => Promise<boolean>;
  incognitoMode: boolean;
  setIncognitoMode: (v: boolean) => void;
  appPin: string | null;
  setAppPin: (v: string | null) => void;
  isAppLocked: boolean;
  setIsAppLocked: (v: boolean) => void;
  // Gratitude Garden
  gratitudes: GratitudeEntry[];
  addGratitude: (content: string) => void;
  // Bottle System
  bottles: Bottle[];
  sendBottle: (message: string) => void;
  getNewBottle: () => Bottle | null;
  // Adaptive Theming
  themeColor: string;
  setThemeColor: (color: string) => void;
  // Quests
  quests: Quest[];
  completeQuest: (id: string) => void;
  // Time Capsules
  capsules: TimeCapsule[];
  createCapsule: (message: string, days: number) => void;
  openCapsule: (id: string) => void;
  // Privacy & a11y
  autoDeleteDays: number;
  setAutoDeleteDays: (days: number) => void;
  reducedMotion: boolean;
  setReducedMotion: (v: boolean) => void;
  fontScale: "normal" | "large" | "x-large";
  setFontScale: (scale: "normal" | "large" | "x-large") => void;
}

export interface Badge {
  id: string;
  title: string;
  emoji: string;
  description: string;
  unlocked: boolean;
}


const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [curhats, setCurhats] = useState<Curhat[]>(() => {
    const saved = localStorage.getItem("tenang_curhats");
    if (!saved) return [];
    try {
      // Re-hydrate Date objects
      const parsed = JSON.parse(saved);
      return parsed.map((c: any) => ({
        ...c,
        timestamp: new Date(c.timestamp)
      }));
    } catch { return []; }
  });

  const [moods, setMoods] = useState<MoodEntry[]>(() => {
    const saved = localStorage.getItem("tenang_moods");
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return parsed.map((m: any) => ({
        ...m,
        date: new Date(m.date)
      }));
    } catch { return []; }
  });

  const [gratitudes, setGratitudes] = useState<GratitudeEntry[]>(() => {
    const saved = localStorage.getItem("tenang_gratitudes");
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return parsed.map((g: any) => ({ ...g, date: new Date(g.date) }));
    } catch { return []; }
  });

  const [bottles, setBottles] = useState<Bottle[]>(() => {
    const saved = localStorage.getItem("tenang_bottles");
    if (!saved) {
      // Default initial bottles
      return [
        { id: "b1", message: "Jangan lupa untuk bernapas dalam-dalam hari ini. Kamu hebat!", timestamp: new Date(), isUserMessage: false },
        { id: "b2", message: "Semuanya akan membaik pada waktunya. Tetap semangat!", timestamp: new Date(), isUserMessage: false },
        { id: "b3", message: "Kamu tidak sendirian. Kita semua berjuang bersama.", timestamp: new Date(), isUserMessage: false },
      ];
    }
    try {
      const parsed = JSON.parse(saved);
      return parsed.map((b: any) => ({ ...b, timestamp: new Date(b.timestamp) }));
    } catch { return []; }
  });

  const [darkMode, setDarkMode] = useState(false);
  const [currentCurhat, setCurrentCurhat] = useState<Curhat | null>(null);
  const [aiName, setAiName] = useState(() => localStorage.getItem("tenang_ai_name") || "Tenang AI");
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => localStorage.getItem("tenang_notif") === "true");

  // Voice settings
  const [autoTTS, setAutoTTS] = useState(() => localStorage.getItem("tenang_auto_tts") === "true");
  const [ttsSpeed, setTtsSpeed] = useState(() => parseFloat(localStorage.getItem("tenang_tts_speed") || "1"));
  const [ttsVoice, setTtsVoice] = useState(() => localStorage.getItem("tenang_tts_voice") || "");
  const [speechLang, setSpeechLang] = useState(() => localStorage.getItem("tenang_speech_lang") || "id-ID");
  
  // Face Detection settings
  const [faceDetectionEnabled, setFaceDetectionEnabled] = useState(() => localStorage.getItem("tenang_face_detection") === "true");

  // Privacy Settings
  const [incognitoMode, setIncognitoMode] = useState(() => localStorage.getItem("tenang_incognito") === "true");
  const [appPin, setAppPin] = useState<string | null>(() => localStorage.getItem("tenang_pin") || null);
  const [isAppLocked, setIsAppLocked] = useState(() => !!localStorage.getItem("tenang_pin"));
  const [themeColor, setThemeColor] = useState("#14b8a6"); // Default teal-500
  const [autoDeleteDays, setAutoDeleteDays] = useState(() =>
    parseInt(localStorage.getItem("tenang_auto_delete_days") || "0", 10)
  );
  const [reducedMotion, setReducedMotion] = useState(() => {
    const saved = localStorage.getItem("tenang_reduced_motion");
    if (saved !== null) return saved === "true";
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  const [fontScale, setFontScale] = useState<"normal" | "large" | "x-large">(() => {
    const saved = localStorage.getItem("tenang_font_scale");
    if (saved === "large" || saved === "x-large") return saved;
    return "normal";
  });

  const [quests, setQuests] = useState<Quest[]>(() => {
    const saved = localStorage.getItem("tenang_quests");
    const lastDate = localStorage.getItem("tenang_quests_date");
    const today = new Date().toDateString();

    if (saved && lastDate === today) {
      return JSON.parse(saved);
    }
    
    // Generate new quests for the day
    const allQuests: Quest[] = [
      { id: "q1", text: "Minum segelas air putih", completed: false, type: "drink" },
      { id: "q2", text: "Tarik napas dalam 3 kali", completed: false, type: "breathe" },
      { id: "q3", text: "Berikan 1 pujian untuk dirimu", completed: false, type: "praise" },
      { id: "q4", text: "Peregangan leher dan bahu", completed: false, type: "stretch" },
      { id: "q5", text: "Jalan santai selama 5 menit", completed: false, type: "walk" },
    ];
    // Pick 3 random
    const picked = allQuests.sort(() => 0.5 - Math.random()).slice(0, 3);
    localStorage.setItem("tenang_quests_date", today);
    return picked;
  });

  const [capsules, setCapsules] = useState<TimeCapsule[]>(() => {
    const saved = localStorage.getItem("tenang_capsules");
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return parsed.map((c: any) => ({
        ...c,
        createdAt: new Date(c.createdAt),
        openAt: new Date(c.openAt)
      }));
    } catch { return []; }
  });

  // Calculate streak (consecutive days with mood or curhat entries)
  const streak = (() => {
    const allDates = new Set<string>();
    curhats.forEach(c => allDates.add(new Date(c.timestamp).toDateString()));
    moods.forEach(m => allDates.add(new Date(m.date).toDateString()));
    let count = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (allDates.has(d.toDateString())) {
        count++;
      } else {
        break;
      }
    }
    return count;
  })();

  // Calculate badges
  const badges: Badge[] = [
    { id: "first_curhat", title: "Langkah Pertama", emoji: "🌱", description: "Menulis curhat pertamamu", unlocked: curhats.length >= 1 },
    { id: "five_curhats", title: "Penulis Aktif", emoji: "✍️", description: "Menulis 5 curhat", unlocked: curhats.length >= 5 },
    { id: "ten_curhats", title: "Jiwa Terbuka", emoji: "💎", description: "Menulis 10 curhat", unlocked: curhats.length >= 10 },
    { id: "first_mood", title: "Pemantau Emosi", emoji: "🎯", description: "Pertama kali mencatat mood", unlocked: moods.length >= 1 },
    { id: "week_mood", title: "Konsisten 7 Hari", emoji: "📅", description: "Mencatat mood selama 7 hari", unlocked: moods.length >= 7 },
    { id: "streak_3", title: "On Fire!", emoji: "🔥", description: "Streak 3 hari berturut-turut", unlocked: streak >= 3 },
    { id: "streak_7", title: "Seminggu Penuh", emoji: "⭐", description: "Streak 7 hari berturut-turut", unlocked: streak >= 7 },
    { id: "streak_30", title: "Master Konsistensi", emoji: "👑", description: "Streak 30 hari berturut-turut", unlocked: streak >= 30 },
    { id: "bookmark_1", title: "Kolektor Hikmat", emoji: "📌", description: "Menyimpan curhat pertama", unlocked: curhats.some(c => c.bookmarked) },
  ];

  // Calculate Garden Growth
  const growthScore = curhats.length * 5 + moods.length * 2;
  
  // Calculate Blooming state (at least 2 positive moods in last 3 days)
  const isBlooming = (() => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const recentPositive = moods.filter(m => 
      new Date(m.date) >= threeDaysAgo && 
      ["happy", "very-happy"].includes(m.mood)
    );
    return recentPositive.length >= 2;
  })();

  // Sync back to localStorage
  useEffect(() => {
    if (!incognitoMode) {
      localStorage.setItem("tenang_curhats", JSON.stringify(curhats));
    } else {
      localStorage.removeItem("tenang_curhats"); // Clear immediately if entering incognito
    }
  }, [curhats, incognitoMode]);

  useEffect(() => {
    localStorage.setItem("tenang_moods", JSON.stringify(moods));
  }, [moods]);

  useEffect(() => {
    localStorage.setItem("tenang_gratitudes", JSON.stringify(gratitudes));
  }, [gratitudes]);

  useEffect(() => {
    localStorage.setItem("tenang_bottles", JSON.stringify(bottles));
  }, [bottles]);

  useEffect(() => {
    localStorage.setItem("tenang_quests", JSON.stringify(quests));
  }, [quests]);

  useEffect(() => {
    localStorage.setItem("tenang_capsules", JSON.stringify(capsules));
  }, [capsules]);

  // Kunci Gemini tidak lagi disimpan di browser — hapus sisa lama sekali.
  useEffect(() => {
    try {
      const flag = "tenang_gemini_key_migrated_v2";
      if (!localStorage.getItem(flag)) {
        localStorage.removeItem("gemini_api_key");
        localStorage.setItem(flag, "1");
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    localStorage.setItem("tenang_ai_name", aiName);
  }, [aiName]);

  useEffect(() => {
    localStorage.setItem("tenang_notif", notificationsEnabled ? "true" : "false");
  }, [notificationsEnabled]);

  useEffect(() => {
    localStorage.setItem("tenang_auto_tts", autoTTS ? "true" : "false");
  }, [autoTTS]);

  useEffect(() => {
    localStorage.setItem("tenang_tts_speed", ttsSpeed.toString());
  }, [ttsSpeed]);

  useEffect(() => {
    localStorage.setItem("tenang_tts_voice", ttsVoice);
  }, [ttsVoice]);

  useEffect(() => {
    localStorage.setItem("tenang_speech_lang", speechLang);
  }, [speechLang]);

  useEffect(() => {
    localStorage.setItem("tenang_face_detection", faceDetectionEnabled ? "true" : "false");
  }, [faceDetectionEnabled]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("tenang_incognito", incognitoMode ? "true" : "false");
  }, [incognitoMode]);

  useEffect(() => {
    if (appPin) {
      localStorage.setItem("tenang_pin", appPin);
    } else {
      localStorage.removeItem("tenang_pin");
    }
  }, [appPin]);

  // Update CSS variable for global theming
  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', themeColor);
  }, [themeColor]);

  useEffect(() => {
    localStorage.setItem("tenang_auto_delete_days", String(autoDeleteDays));
  }, [autoDeleteDays]);

  useEffect(() => {
    localStorage.setItem("tenang_reduced_motion", reducedMotion ? "true" : "false");
    document.documentElement.classList.toggle("reduce-motion", reducedMotion);
  }, [reducedMotion]);

  useEffect(() => {
    localStorage.setItem("tenang_font_scale", fontScale);
    document.documentElement.classList.remove("font-scale-normal", "font-scale-large", "font-scale-x-large");
    document.documentElement.classList.add(
      fontScale === "normal" ? "font-scale-normal" : fontScale === "large" ? "font-scale-large" : "font-scale-x-large"
    );
  }, [fontScale]);

  const pruneOldData = () => {
    if (autoDeleteDays <= 0) return;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - autoDeleteDays);
    setCurhats((prev) => prev.filter((c) => new Date(c.timestamp) >= cutoff));
    setMoods((prev) => prev.filter((m) => new Date(m.date) >= cutoff));
  };

  useEffect(() => {
    pruneOldData();
    const interval = setInterval(pruneOldData, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [autoDeleteDays]); // eslint-disable-line react-hooks/exhaustive-deps

  // Lock app on visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && appPin) {
        setIsAppLocked(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [appPin]);

  const addCurhat = (curhat: Curhat) => {
    setCurhats(prev => [curhat, ...prev]);
  };

  const updateCurhatMessages = (id: string, newMessages: ChatMessage[]) => {
    setCurhats(prev => prev.map(c => c.id === id ? { ...c, messages: newMessages } : c));
    if (currentCurhat?.id === id) {
      setCurrentCurhat(prev => prev ? { ...prev, messages: newMessages } : null);
    }
  };

  const addMood = (mood: MoodEntry) => {
    setMoods(prev => [mood, ...prev]);
  };

  const deleteCurhat = (id: string) => {
    setCurhats(prev => prev.filter(c => c.id !== id));
  };

  const toggleBookmark = (id: string) => {
    setCurhats(prev => prev.map(c => c.id === id ? { ...c, bookmarked: !c.bookmarked } : c));
  };

  const clearAllCurhats = () => {
    if (window.confirm("Hapus seluruh riwayat curhat? Tindakan ini tidak bisa dibatalkan.")) {
      setCurhats([]);
    }
  };

  const addGratitude = (content: string) => {
    const newEntry: GratitudeEntry = {
      id: Date.now().toString(),
      content,
      date: new Date(),
    };
    setGratitudes(prev => [newEntry, ...prev]);
  };

  const sendBottle = (message: string) => {
    const newBottle: Bottle = {
      id: Date.now().toString(),
      message,
      timestamp: new Date(),
      isUserMessage: true,
    };
    setBottles(prev => [newBottle, ...prev]);
  };

  const getNewBottle = () => {
    if (bottles.length === 0) return null;
    // Get a random bottle that is NOT a user message (to simulate global pool)
    // Or just any random one if all are user messages
    const others = bottles.filter(b => !b.isUserMessage);
    const source = others.length > 0 ? others : bottles;
    return source[Math.floor(Math.random() * source.length)];
  };

  const completeQuest = (id: string) => {
    setQuests(prev => prev.map(q => q.id === id ? { ...q, completed: true } : q));
  };

  const createCapsule = (message: string, days: number) => {
    const now = new Date();
    const openAt = new Date(now);
    openAt.setDate(now.getDate() + days);
    
    const newCapsule: TimeCapsule = {
      id: Date.now().toString(),
      message,
      createdAt: now,
      openAt,
      isOpened: false
    };
    setCapsules(prev => [newCapsule, ...prev]);
  };

  const openCapsule = (id: string) => {
    setCapsules(prev => prev.map(c => c.id === id ? { ...c, isOpened: true } : c));
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const exportData = () => {
    const data = {
      curhats,
      moods,
      settings: { aiName, darkMode, notificationsEnabled }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tenang_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = async (file: File): Promise<boolean> => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (data.curhats) setCurhats(data.curhats.map((c: any) => ({ ...c, timestamp: new Date(c.timestamp) })));
      if (data.moods) setMoods(data.moods.map((m: any) => ({ ...m, date: new Date(m.date) })));
      if (data.settings?.aiName) setAiName(data.settings.aiName);
      if (data.settings?.darkMode !== undefined) setDarkMode(data.settings.darkMode);
      return true;
    } catch (e) {
      console.error("Import failed", e);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        curhats,
        addCurhat,
        moods,
        addMood,
        darkMode,
        toggleDarkMode,
        currentCurhat,
        setCurrentCurhat,
        updateCurhatMessages,
        deleteCurhat,
        toggleBookmark,
        clearAllCurhats,
        aiName,
        setAiName,
        notificationsEnabled,
        setNotificationsEnabled,
        autoTTS,
        setAutoTTS,
        ttsSpeed,
        setTtsSpeed,
        ttsVoice,
        setTtsVoice,
        speechLang,
        setSpeechLang,
        faceDetectionEnabled,
        setFaceDetectionEnabled,
        streak,
        badges,
        growthScore,
        isBlooming,
        exportData,
        importData,
        incognitoMode,
        setIncognitoMode,
        appPin,
        setAppPin,
        isAppLocked,
        setIsAppLocked,
        gratitudes,
        addGratitude,
        bottles,
        sendBottle,
        getNewBottle,
        themeColor,
        setThemeColor,
        quests,
        completeQuest,
        capsules,
        createCapsule,
        openCapsule,
        autoDeleteDays,
        setAutoDeleteDays,
        reducedMotion,
        setReducedMotion,
        fontScale,
        setFontScale,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
