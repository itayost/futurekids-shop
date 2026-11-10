import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, Bot, FileDown } from 'lucide-react';

const PDF_URL = '/lessons/robots-lesson.pdf';
const PDF_FILENAME = 'מערך שיעור - רובוטים - ד״ר סתיו אלבר.pdf';

export const metadata: Metadata = {
  title: 'מערך שיעור - רובוטים',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RobotsLessonPage() {
  return (
    <div className="bg-amber-50 min-h-screen">
      <div className="container mx-auto px-6 py-16">
        {/* Intro Card */}
        <div className="bg-white border-4 border-[#545454] rounded-3xl p-8 mb-16 hard-shadow flex flex-col md:flex-row items-center gap-8 max-w-5xl mx-auto">
          <div className="w-32 border-4 border-[#545454] rounded-2xl overflow-hidden flex-shrink-0">
            <Image
              src="/lessons/robots-cover.jpg"
              alt="העמוד הראשון של מערך השיעור רובוטים"
              width={128}
              height={181}
              className="w-full h-auto"
            />
          </div>
          <div className="text-center md:text-right">
            <h1 className="text-3xl font-black mb-2">מערך שיעור - רובוטים</h1>
            <p className="text-orange-500 font-bold text-lg mb-4">
              מאת ד״ר סתיו אלבר
            </p>
            <p className="text-gray-600 text-lg">
              מערך שיעור לילדי גן (טרום-חובה וחובה), כ-45 דקות, בהשראת הספר ״אלגוריתמים לילדים״.
              הילדים מכירים רובוטים מחיי היומיום, משחקים ב״רובוט אוסף לכלוכים״ ולומדים שרובוט פועל רק לפי הוראות מדויקות.
            </p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Download */}
          <div className="bg-white border-4 border-[#545454] rounded-3xl p-8 hard-shadow flex flex-col">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-2xl flex items-center justify-center border-2 border-[#545454] mb-6">
              <Bot className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black mb-4">מערך השיעור להורדה</h2>
            <p className="text-gray-600 mb-6 flex-grow">
              קובץ PDF להורדה, להדפסה ולשימוש חופשי בגן, בכיתה או בבית.
            </p>
            <a
              href={PDF_URL}
              download={PDF_FILENAME}
              className="w-full bg-emerald-100 text-emerald-500 border-2 border-[#545454] rounded-xl p-4 font-bold flex items-center justify-center gap-2 hover:opacity-80 transition-opacity"
            >
              <FileDown className="w-5 h-5" />
              הורדת מערך השיעור
            </a>
          </div>

          {/* Source book */}
          <div className="bg-white border-4 border-[#545454] rounded-3xl p-8 hard-shadow flex flex-col">
            <div className="w-16 h-16 bg-sky-100 text-sky-500 rounded-2xl flex items-center justify-center border-2 border-[#545454] mb-6">
              <BookOpen className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black mb-4">הספר שמאחורי השיעור</h2>
            <p className="text-gray-600 mb-6 flex-grow">
              ״אלגוריתמים לילדים״ - מסע אל החשיבה המחשבית, עם עוד הרבה רעיונות לגלות יחד.
            </p>
            <Link
              href="/products/algorithms"
              className="w-full bg-sky-100 text-sky-500 border-2 border-[#545454] rounded-xl p-4 font-bold flex items-center justify-center gap-2 hover:opacity-80 transition-opacity"
            >
              <BookOpen className="w-5 h-5" />
              לספר
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
