import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, FileDown, Puzzle } from 'lucide-react';

const PDF_URL = '/riddles/riddles-booklet.pdf';
const PDF_FILENAME = 'חוברת חידות - סתיו אלבר ושמרית שולמן.pdf';

export const metadata: Metadata = {
  title: 'חוברת חידות',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RiddlesBookletPage() {
  return (
    <div className="bg-amber-50 min-h-screen">
      <div className="container mx-auto px-6 py-16">
        {/* Intro Card */}
        <div className="bg-white border-4 border-[#545454] rounded-3xl p-8 mb-16 hard-shadow flex flex-col md:flex-row items-center gap-8 max-w-5xl mx-auto">
          <div className="w-32 border-4 border-[#545454] rounded-2xl overflow-hidden flex-shrink-0">
            <Image
              src="/riddles/cover.jpg"
              alt="כריכת הספר חידה! לכל המשפחה"
              width={128}
              height={178}
              className="w-full h-auto"
            />
          </div>
          <div className="text-center md:text-right">
            <h1 className="text-3xl font-black mb-2">חוברת חידות</h1>
            <p className="text-orange-500 font-bold text-lg mb-4">
              מאת ד״ר סתיו אלבר ושמרית שולמן
            </p>
            <p className="text-gray-600 text-lg">
              טעימה מהספר ״חידה!״ - משחקי מילים, הצפנה, מספרים ותבניות לכל המשפחה.
              הורידו את החוברת, הדפיסו ונסו לפתור יחד.
            </p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Download */}
          <div className="bg-white border-4 border-[#545454] rounded-3xl p-8 hard-shadow flex flex-col">
            <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-2xl flex items-center justify-center border-2 border-[#545454] mb-6">
              <Puzzle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black mb-4">החוברת להורדה</h2>
            <p className="text-gray-600 mb-6 flex-grow">
              קובץ PDF להורדה, לקריאה ולהדפסה חופשית.
            </p>
            <a
              href={PDF_URL}
              download={PDF_FILENAME}
              className="w-full bg-orange-100 text-orange-500 border-2 border-[#545454] rounded-xl p-4 font-bold flex items-center justify-center gap-2 hover:opacity-80 transition-opacity"
            >
              <FileDown className="w-5 h-5" />
              הורדת החוברת
            </a>
          </div>

          {/* Full book */}
          <div className="bg-white border-4 border-[#545454] rounded-3xl p-8 hard-shadow flex flex-col">
            <div className="w-16 h-16 bg-sky-100 text-sky-500 rounded-2xl flex items-center justify-center border-2 border-[#545454] mb-6">
              <BookOpen className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black mb-4">רוצים עוד חידות?</h2>
            <p className="text-gray-600 mb-6 flex-grow">
              הספר המלא ״חידה!״ מחכה לכם עם עוד הרבה חידות לכל המשפחה.
            </p>
            <Link
              href="/riddles"
              className="w-full bg-sky-100 text-sky-500 border-2 border-[#545454] rounded-xl p-4 font-bold flex items-center justify-center gap-2 hover:opacity-80 transition-opacity"
            >
              <BookOpen className="w-5 h-5" />
              לספר המלא
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
