import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Building2, ArrowLeft } from 'lucide-react';

export default function GamesPage() {
  return (
    <div className="bg-amber-50 min-h-screen">
      <div className="container mx-auto px-6 py-16">
        {/* Author Intro Card */}
        <div className="bg-white border-4 border-black rounded-3xl p-8 mb-16 hard-shadow flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 bg-emerald-100 border-4 border-black rounded-full overflow-hidden flex-shrink-0">
            <Image
              src="/Stav.png"
              alt="ד״ר סתיו אלבר"
              width={128}
              height={128}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center md:text-right">
            <h1 className="text-3xl font-black mb-4">משחקים אינטראקטיביים</h1>
            <p className="text-gray-600 text-lg">
              אני מאמינה שכדי להתאהב במדע, צריך להרגיש אותו בידיים. המשחקים האינטראקטיביים שאני מפתחת הם הרבה יותר מעוד פעילות העשרה; הם משחקי קבוצה בעולם האמיתי, שנועדו לקחת נושאים טכנולוגיים מורכבים – כמו הצפנה, אלגוריתמים ובינה מלאכותית – ולהפוך אותם להרפתקה סוחפת ומלאת אדרנלין.
            </p>
          </div>
        </div>

        {/* Organizations Section */}
        <div className="bg-white border-4 border-black rounded-3xl p-8 hard-shadow mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center border-2 border-black">
              <Building2 className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-black">גופים וארגונים שבחרו בחוויה</h2>
          </div>

          {/* Logos placeholder */}
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
            <p className="text-gray-500 font-medium">לוגואים יתווספו בקרוב</p>
          </div>
        </div>

        {/* CTA - Check out the books */}
        <div className="bg-emerald-50 border-4 border-black rounded-3xl p-8 text-center hard-shadow">
          <Sparkles className="w-12 h-12 mx-auto text-emerald-500 mb-4" />
          <h3 className="text-2xl font-black mb-4">בינתיים, הכירו את הספרים!</h3>
          <p className="text-gray-700 max-w-xl mx-auto mb-6">
            הספרים והחוברות שלנו מלאים בפעילויות, חידות ומשחקים שאפשר לעשות בבית או בכיתה.
          </p>
          <Link
            href="/#books"
            className="btn-retro inline-flex items-center gap-2 bg-emerald-500 text-white px-8 py-4 rounded-xl font-black text-lg border-2 border-black hover:bg-emerald-600"
          >
            <ArrowLeft className="w-5 h-5" />
            לספרים שלנו
          </Link>
        </div>
      </div>
    </div>
  );
}
