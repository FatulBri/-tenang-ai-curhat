import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Phone, MessageCircle, ExternalLink, ArrowLeft } from "lucide-react";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";

const hotlines = [
  {
    name: "Sejiwa (Into The Light)",
    number: "119",
    description: "Layanan kesehatan jiwa 24/7",
    type: "call",
  },
  {
    name: "Kemenkes RI",
    number: "500-454",
    description: "Layanan konseling kesehatan mental",
    type: "call",
  },
  {
    name: "HIMPSI",
    number: "(021) 319-02-925",
    description: "Himpunan Psikologi Indonesia",
    type: "call",
  },
  {
    name: "LSM Jangan Bunuh Diri",
    number: "(021) 9696-9293 / 7256-526 / 7257-826",
    description: "Konseling pencegahan bunuh diri",
    type: "call",
  },
  {
    name: "Yayasan Pulih",
    number: "021-788-42580",
    description: "Layanan psikososial",
    type: "call",
  },
];

const resources = [
  {
    name: "Halodoc - Konsultasi Psikolog Online",
    url: "https://www.halodoc.com",
    description: "Konsultasi dengan psikolog berlisensi",
  },
  {
    name: "Alodokter - Kesehatan Mental",
    url: "https://www.alodokter.com",
    description: "Artikel dan konsultasi kesehatan mental",
  },
  {
    name: "Into The Light Indonesia",
    url: "https://www.intothelightid.org",
    description: "Komunitas dukungan kesehatan mental",
  },
];

export function HotlinePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300 flex flex-col">
      <Navigation />

      <main className="max-w-4xl mx-auto px-6 py-8 flex-1">
        {/* Emergency Message */}
        <Card className="p-8 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800 mb-8 text-center">
          <div className="text-5xl mb-4">🆘</div>
          <h1 className="text-2xl text-gray-800 dark:text-gray-100 mb-3">
            Kamu Tidak Sendirian
          </h1>
          <p className="text-gray-700 dark:text-gray-200 mb-4 leading-relaxed max-w-2xl mx-auto">
            Jika kamu sedang dalam krisis atau membutuhkan bantuan segera,
            silakan hubungi layanan darurat di bawah ini. Ada profesional yang siap membantu 24/7.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Untuk keadaan darurat medis, hubungi 118 atau 119
          </p>
        </Card>

        {/* Hotlines */}
        <div className="mb-8">
          <h2 className="text-2xl text-gray-800 dark:text-gray-100 mb-4">
            Hotline Kesehatan Mental
          </h2>
          <div className="space-y-4">
            {hotlines.map((hotline, index) => (
              <Card
                key={index}
                className="p-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm hover:shadow-xl transition-all border-teal-100 dark:border-slate-700"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg text-gray-800 dark:text-gray-100 mb-1">
                      {hotline.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {hotline.description}
                    </p>
                    <a
                      href={`tel:${hotline.number.replace(/[\s\(\)\-]/g, '')}`}
                      className="inline-flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
                    >
                      <Phone className="w-4 h-4" />
                      <span>{hotline.number}</span>
                    </a>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div className="mb-8">
          <h2 className="text-2xl text-gray-800 dark:text-gray-100 mb-4">
            Sumber Daya Online
          </h2>
          <div className="space-y-4">
            {resources.map((resource, index) => (
              <Card
                key={index}
                className="p-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm hover:shadow-xl transition-all border-purple-100 dark:border-slate-700"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg text-gray-800 dark:text-gray-100 mb-1">
                      {resource.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {resource.description}
                    </p>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Kunjungi Website</span>
                    </a>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Back Button */}
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="w-full border-2 border-teal-500 dark:border-teal-400 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 py-6 rounded-xl"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Kembali
        </Button>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
            💙 Mencari bantuan adalah tanda kekuatan, bukan kelemahan. Kamu layak mendapatkan dukungan dan perawatan.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}