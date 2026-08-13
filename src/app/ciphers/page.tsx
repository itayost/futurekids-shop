import type { Metadata } from 'next';
import Image from 'next/image';
import { ExternalLink, FileDown, KeyRound, Sparkles } from 'lucide-react';

const PDF_URL = '/ciphers/ciphers-through-the-ages.pdf';
const PDF_FILENAME = 'צפנים מכל הזמנים - סתיו אלבר.pdf';
const APP_URL =
  'https://gemini-web-ui-preprod.corp.google.com/corp/share/c1aced5e23b6?e=GeminiEnterpriseForGooglersLaunch::Experiment';

export const metadata: Metadata = {
  title: 'צפנים מכל הזמנים',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CiphersPage() {
  return (
    <div className="bg-amber-50 min-h-screen">
      <div className="container mx-auto px-6 py-16">
        {/* Intro Card */}
        <div className="bg-white border-4 border-[#545454] rounded-3xl p-8 mb-16 hard-shadow flex flex-col md:flex-row items-center gap-8 max-w-5xl mx-auto">
          <div className="w-32 h-32 bg-pink-100 border-4 border-[#545454] rounded-full overflow-hidden flex-shrink-0">
            <Image
              src="/Stav.png"
              alt="ד״ר סתיו אלבר"
              width={128}
              height={128}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center md:text-right">
            <h1 className="text-3xl font-black mb-2">צפנים מכל הזמנים</h1>
            <p className="text-pink-500 font-bold text-lg mb-4">מאת ד״ר סתיו אלבר</p>
            <p className="text-gray-600 text-lg">
              מסע בין הצפנים ששינו את ההיסטוריה - מהצופן של קיסר ועד ההצפנה שמגנה על
              המידע שלנו היום. הורידו את הספר המלא, ואז נסו את הצפנים בעצמכם באפליקציה
              האינטראקטיבית.
            </p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Download */}
          <div className="bg-white border-4 border-[#545454] rounded-3xl p-8 hard-shadow flex flex-col">
            <div className="w-16 h-16 bg-pink-100 text-pink-500 rounded-2xl flex items-center justify-center border-2 border-[#545454] mb-6">
              <KeyRound className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black mb-4">הספר המלא להורדה</h2>
            <p className="text-gray-600 mb-6 flex-grow">
              קובץ PDF להורדה, לקריאה ולהדפסה חופשית.
            </p>
            <a
              href={PDF_URL}
              download={PDF_FILENAME}
              className="w-full bg-pink-100 text-pink-500 border-2 border-[#545454] rounded-xl p-4 font-bold flex items-center justify-center gap-2 hover:opacity-80 transition-opacity"
            >
              <FileDown className="w-5 h-5" />
              הורדת הספר
            </a>
          </div>

          {/* Interactive app */}
          <div className="bg-white border-4 border-[#545454] rounded-3xl p-8 hard-shadow flex flex-col">
            <div className="w-16 h-16 bg-sky-100 text-sky-500 rounded-2xl flex items-center justify-center border-2 border-[#545454] mb-6">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black mb-4">שחקו עם הצפנים</h2>
            <p className="text-gray-600 mb-6 flex-grow">
              אפליקציה אינטראקטיבית להצפנה ולפענוח של הצפנים שבספר.
              <span className="block mt-2 text-sm text-gray-500">
                הכניסה דורשת חשבון Google ארגוני.
              </span>
            </p>
            <a
              href={APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-sky-100 text-sky-500 border-2 border-[#545454] rounded-xl p-4 font-bold flex items-center justify-center gap-2 hover:opacity-80 transition-opacity"
            >
              <ExternalLink className="w-5 h-5" />
              לאפליקציה
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
