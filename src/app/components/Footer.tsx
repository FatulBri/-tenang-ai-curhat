import { Heart, Shield, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-t border-gray-200 dark:border-slate-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-6 h-6 text-teal-500 fill-teal-500" />
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-purple-600 dark:from-teal-400 dark:to-purple-400">
                TENANG
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Platform curhat anonim berbasis AI yang menyediakan ruang aman untuk kesehatan mental Anda.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Fitur Kami
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>• Curhat Anonim dengan AI</li>
              <li>• Mood Tracker Harian</li>
              <li>• Statistik Emosional</li>
              <li>• Hotline Darurat 24/7</li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Penting
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              TENANG adalah alat dukungan emosional, bukan pengganti bantuan profesional. 
              Untuk masalah kesehatan mental yang serius, harap hubungi profesional berlisensi.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2025 Bari Fathul. Dibuat dengan 💙 untuk kesehatan mental Indonesia.
          </p>
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-teal-600 dark:text-gray-400 dark:hover:text-teal-400 transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}