import { useNavigate } from "react-router-dom";
import { Heart, Shield, MessageCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { motion } from "framer-motion";
import { AffirmationWidget } from "../components/AffirmationWidget";
import { DigitalGarden } from "../components/DigitalGarden";

export function LandingPage() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as any, stiffness: 100, damping: 20 }
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafc] dark:bg-[#030213] transition-colors duration-500 flex flex-col relative">
      <Navigation />

      <main className="max-w-4xl mx-auto px-6 py-16 flex flex-col items-center justify-center flex-1 relative z-10 w-full">
        <motion.div
          className="text-center space-y-6 mb-16 w-full"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="inline-flex items-center gap-3 mb-4" variants={itemVariants}>
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="absolute inset-0 bg-teal-400 blur-xl opacity-30 rounded-full"
              />
              <Heart className="w-14 h-14 text-teal-500 fill-teal-500 relative z-10" />
            </div>
            <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-teal-500 via-teal-400 to-purple-600 dark:from-teal-300 dark:via-teal-200 dark:to-purple-500">
              TENANG
            </h1>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="text-2xl md:text-3xl font-medium text-gray-700 dark:text-gray-200 italic"
          >
            Ceritakan, Kami Dengarkan
          </motion.p>

          <motion.p
            variants={itemVariants}
            className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed border-l-4 border-teal-400/50 pl-6 text-left md:text-center md:border-l-0 md:pl-0"
          >
            Platform curhat anonim rahasia berbasis AI yang memberikan Anda ruang paling aman untuk berekspresi.
            Tanpa penghakiman, hanya pengertian dan dukungan emosional yang Anda butuhkan.
          </motion.p>

          <motion.div variants={itemVariants} className="pt-8 w-full max-w-xs mx-auto">
            <Button
              onClick={() => navigate("/curhat")}
              className="w-full bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white px-10 py-7 rounded-2xl text-xl font-semibold shadow-[0_0_40px_rgba(20,184,166,0.3)] hover:shadow-[0_0_60px_rgba(168,85,247,0.4)] dark:shadow-[0_0_40px_rgba(20,184,166,0.2)] dark:hover:shadow-[0_0_60px_rgba(168,85,247,0.3)] transform transition-transform duration-300 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
              <span className="relative z-10 flex items-center justify-center gap-2">Mulai Curhat <MessageCircle className="w-5 h-5 ml-1 group-hover:scale-110 transition-transform" /></span>
            </Button>
          </motion.div>

          <AffirmationWidget />
          
          <div className="w-full flex justify-center py-8">
            <DigitalGarden />
          </div>
        </motion.div>

        {/* Features/Steps Grid */}
        <motion.div
          className="grid md:grid-cols-3 gap-6 w-full"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {/* Card 1 */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-8 rounded-3xl shadow-xl hover:shadow-2xl border border-white/40 dark:border-white/5 transition-all w-full flex flex-col items-center text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 dark:bg-teal-500/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-teal-500/20 transition-colors"></div>
            <div className="w-14 h-14 bg-teal-100 dark:bg-teal-900/40 rounded-2xl flex items-center justify-center mb-6 shadow-inner ring-1 ring-teal-500/20">
              <MessageCircle className="w-7 h-7 text-teal-600 dark:text-teal-400 drop-shadow-sm" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">1. Tulis Ceritamu</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-snug">
              Tuangkan beban pikiran dan perasaanmu dengan bebas tanpa khawatir dihakimi.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-8 rounded-3xl shadow-xl hover:shadow-2xl border border-white/40 dark:border-white/5 transition-all w-full flex flex-col items-center text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-purple-500/20 transition-colors"></div>
            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/40 rounded-2xl flex items-center justify-center mb-6 shadow-inner ring-1 ring-purple-500/20">
              <Heart className="w-7 h-7 text-purple-600 dark:text-purple-400 drop-shadow-sm" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">2. Terima Dukungan</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-snug">
              AI kami dirancang untuk mendengarkan empati dan memberikan saran positif.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-8 rounded-3xl shadow-xl hover:shadow-2xl border border-white/40 dark:border-white/5 transition-all w-full flex flex-col items-center text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-500/20 transition-colors"></div>
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center mb-6 shadow-inner ring-1 ring-blue-500/20">
              <Shield className="w-7 h-7 text-blue-600 dark:text-blue-400 drop-shadow-sm" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">3. Sangat Rahasia</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-snug">
              Semuanya 100% anonim. Kami menjaga ruang privasi Anda dengan aman.
            </p>
          </motion.div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 max-w-2xl text-center"
        >
          <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700/50">
            <Shield className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              TENANG adalah AI penunjang. Untuk masalah serius, konsultasilah ke profesional.
            </p>
          </div>
        </motion.div>
      </main>

      <Footer />

      {/* Modern Background Decorations (Glass/Aurora specific) */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Light mode base */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#fafafc] to-white dark:hidden"></div>
        {/* Dark mode base */}
        <div className="absolute inset-0 bg-[#030213] hidden dark:block"></div>

        {/* Glowing Orbs - Enhanced for Landing */}
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, 100, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[10%] w-[50vw] h-[50vw] bg-teal-400/20 dark:bg-teal-600/20 rounded-full filter blur-[120px]" 
        />
        <motion.div 
          animate={{ x: [0, -70, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[10%] w-[45vw] h-[45vw] bg-purple-400/20 dark:bg-purple-700/20 rounded-full filter blur-[120px]" 
        />
      </div>
    </div>
  );
}