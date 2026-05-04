import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { LandingPage } from "./pages/LandingPage";
import { CurhatPage } from "./pages/CurhatPage";
import { ResponsePage } from "./pages/ResponsePage";
import { MoodTrackerPage } from "./pages/MoodTrackerPage";
import { MoodStatsPage } from "./pages/MoodStatsPage";
import { HistoryPage } from "./pages/HistoryPage";
import { HotlinePage } from "./pages/HotlinePage";
import { SettingsPage } from "./pages/SettingsPage";
import { VoiceCurhatPage } from "./pages/VoiceCurhatPage";
import { GardenPage } from "./pages/GardenPage";
import { SelfCarePage } from "./pages/SelfCarePage";
import { PanicButton } from "./components/PanicButton";
import { AmbientPlayer } from "./components/AmbientPlayer";
import { OnboardingModal } from "./components/OnboardingModal";
import { PinLock } from "./components/PinLock";
import { DailyGachaModal } from "./components/DailyGachaModal";
import { Toaster } from "sonner";
import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    document.title = "TENANG AI Anonymous Curhat";
  }, []);

  return (
    <AppProvider>
      <PinLock />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <div className="min-h-screen">
          <Toaster position="top-right" richColors closeButton />
          <OnboardingModal />
          <AmbientPlayer />
          <DailyGachaModal />

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
          </Routes>

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