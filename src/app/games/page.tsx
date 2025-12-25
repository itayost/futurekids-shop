import { Gamepad2, Lock, Brain, GitBranch } from 'lucide-react';

export default function GamesPage() {
  return (
    <div className="bg-amber-50 min-h-screen">
      <div className="container mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block bg-emerald-500 text-white px-4 py-2 rounded-full font-bold text-sm mb-4">
            ללמוד דרך משחק
          </div>
          <h1 className="text-5xl font-black text-gray-900 mb-6">משחקים אינטראקטיביים</h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            משחקים חינמיים שמלווים את הספרים ומאפשרים לילדים להתנסות בעצמם במושגים שלמדו
          </p>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
