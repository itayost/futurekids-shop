import Image from 'next/image';
import { Gamepad2, Lock, Brain, GitBranch, Building2 } from 'lucide-react';

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

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Encryption Game */}
          <div className="bg-white border-4 border-black rounded-3xl p-8 hard-shadow">
            <div className="w-16 h-16 bg-pink-100 text-pink-500 rounded-2xl flex items-center justify-center border-2 border-black mb-6">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black mb-4">משחק ההצפנה</h3>
            <p className="text-gray-600 mb-6">
              התנסו בצפנים עתיקים - צופן קיסר, אטבש ועוד. פענחו מסרים סודיים וצרו הצפנות משלכם!
            </p>
            <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
              <p className="text-gray-500 font-medium">בקרוב!</p>
            </div>
          </div>

          {/* AI Game */}
          <div className="bg-white border-4 border-black rounded-3xl p-8 hard-shadow">
            <div className="w-16 h-16 bg-sky-100 text-sky-500 rounded-2xl flex items-center justify-center border-2 border-black mb-6">
              <Brain className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black mb-4">משחק הבינה המלאכותית</h3>
            <p className="text-gray-600 mb-6">
              לימדו מכונה לזהות צורות וצבעים, הבינו איך AI לומד ומשתפר מדוגמאות!
            </p>
            <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
              <p className="text-gray-500 font-medium">בקרוב!</p>
            </div>
          </div>

          {/* Algorithms Game */}
          <div className="bg-white border-4 border-black rounded-3xl p-8 hard-shadow">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-2xl flex items-center justify-center border-2 border-black mb-6">
              <GitBranch className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black mb-4">משחק האלגוריתמים</h3>
            <p className="text-gray-600 mb-6">
              פתרו חידות לוגיות וראו איך אלגוריתמים מסדרים ומחפשים מידע בצורה חכמה!
            </p>
            <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
              <p className="text-gray-500 font-medium">בקרוב!</p>
            </div>
          </div>
        </div>

        {/* Organizations Section */}
        <div className="bg-white border-4 border-black rounded-3xl p-8 hard-shadow">
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

        {/* Info Box */}
        <div className="mt-16 bg-emerald-50 border-4 border-black rounded-3xl p-8 text-center hard-shadow">
          <Gamepad2 className="w-12 h-12 mx-auto text-emerald-500 mb-4" />
          <h3 className="text-2xl font-black mb-4">משחקים נוספים בדרך!</h3>
          <p className="text-gray-700 max-w-xl mx-auto">
            אנחנו עובדים על משחקים חדשים שילוו את הספרים. הישארו מעודכנים!
          </p>
        </div>
      </div>
    </div>
  );
}
