import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { PanicButton } from "./components/PanicButton";
import { AmbientPlayer } from "./components/AmbientPlayer";
import { OnboardingModal } from "./components/OnboardingModal";
import { PinLock } from "./components/PinLock";
import { DailyGachaModal } from "./components/DailyGachaModal";
import { OfflineBanner } from "./components/OfflineBanner";
import { AppNotifications } from "./components/AppNotifications";
import { Toaster } from "sonner";

const LandingPage = lazy(() => import("./pages/LandingPage").then((m) => ({ default: m.LandingPage })));
const CurhatPage = lazy(() => import("./pages/CurhatPage").then((m) => ({ default: m.CurhatPage })));
const ResponsePage = lazy(() => import("./pages/ResponsePage").then((m) => ({ default: m.ResponsePage })));
const MoodTrackerPage = lazy(() => import("./pages/MoodTrackerPage").then((m) => ({ default: m.MoodTrackerPage })));
const MoodStatsPage = lazy(() => import("./pages/MoodStatsPage").then((m) => ({ default: m.MoodStatsPage })));
const HistoryPage = lazy(() => import("./pages/HistoryPage").then((m) => ({ default: m.HistoryPage })));
const HotlinePage = lazy(() => import("./pages/HotlinePage").then((m) => ({ default: m.HotlinePage })));
const SettingsPage = lazy(() => import("./pages/SettingsPage").then((m) => ({ default: m.SettingsPage })));
const VoiceCurhatPage = lazy(() => import("./pages/VoiceCurhatPage").then((m) => ({ default: m.VoiceCurhatPage })));
const GardenPage = lazy(() => import("./pages/GardenPage").then((m) => ({ default: m.GardenPage })));
const SelfCarePage = lazy(() => import("./pages/SelfCarePage").then((m) => ({ default: m.SelfCarePage })));
const OfflinePage = lazy(() => import("./pages/OfflinePage").then((m) => ({ default: m.OfflinePage })));

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafc] dark:bg-[#030213] transition-colors">
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-11 w-11 rounded-full border-2 border-teal-500/25 border-t-teal-500 dark:border-teal-400/20 dark:border-t-teal-400 animate-spin"
          aria-hidden
        />
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Memuat…</p>
      </div>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    document.title = "TENANG AI Anonymous Curhat";
  }, []);

  return (
    <AppProvider>
      <PinLock />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <div className="min-h-screen relative overflow-hidden">
          <div className="noise-overlay" />
          <Toaster position="top-right" richColors closeButton />
          <OnboardingModal />
          <AmbientPlayer />
          <DailyGachaModal />
          <OfflineBanner />
          <AppNotifications />

          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/curhat" element={<CurhatPage />} />
              <Route path="/response" element={<ResponsePage />} />
              <Route path="/mood-tracker" element={<MoodTrackerPage />} />
              <Route path="/mood-stats" element={<MoodStatsPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/hotline" element={<HotlinePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/voice-curhat" element={<VoiceCurhatPage />} />
              <Route path="/garden" element={<GardenPage />} />
              <Route path="/self-care" element={<SelfCarePage />} />
              <Route path="/offline" element={<OfflinePage />} />
            </Routes>
          </Suspense>

          {/* Floating Panic Button - visible on all pages except hotline */}
          <Routes>
            <Route path="/hotline" element={null} />
            <Route path="*" element={<PanicButton />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
