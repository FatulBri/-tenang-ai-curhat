import { useNavigate } from "react-router-dom";
import { Heart, Shield, MessageCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300 flex flex-col">
      <Navigation />

      <div className="max-w-4xl mx-auto px-6 py-16 flex flex-col items-center justify-center flex-1">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <Heart className="w-12 h-12 text-teal-500 fill-teal-500 animate-pulse" />
            <h1 className="text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-purple-600 dark:from-teal-400 dark:to-purple-400">
              TENANG
            </h1>
          </div>

          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-200 italic">
            Ceritakan, Kami Dengarkan
          </p>

          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Platform curhat anonim berbasis AI yang menyediakan ruang aman untuk mengekspresikan perasaan Anda.
            Dapatkan respon empatik dan dukungan tanpa penilaian.
          </p>
        </div>

        {/* CTA Button */}
        <Button
          onClick={() => navigate("/curhat")}
          className="bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600 text-white px-12 py-6 rounded-full text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
        >
          Mulai Curhat
        </Button>

        {/* 3 Steps Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-16 w-full">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg text-center space-y-3 border border-teal-100 dark:border-slate-700">
            <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mx-auto">
              <MessageCircle className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="text-lg text-gray-800 dark:text-gray-100">1. Tulis Ceritamu</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Ekspresikan perasaan dan pikiran Anda dengan bebas
            </p>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg text-center space-y-3 border border-purple-100 dark:border-slate-700">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg text-gray-800 dark:text-gray-100">2. Terima Dukungan</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              AI kami akan memberikan respon empatik dan mendukung
            </p>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg text-center space-y-3 border border-blue-100 dark:border-slate-700">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg text-gray-800 dark:text-gray-100">3. Pantau Mood</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Lacak perjalanan emosional Anda dari waktu ke waktu
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-12 text-center max-w-2xl">
          <Shield className="w-4 h-4 inline mr-1" />
          Disclaimer: TENANG adalah platform dukungan emosional berbasis AI. Untuk masalah kesehatan mental yang serius,
          harap konsultasikan dengan profesional kesehatan mental berlisensi.
        </p>
      </div>

      <Footer />

      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-200 dark:bg-teal-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-200 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
    </div>
  );
}