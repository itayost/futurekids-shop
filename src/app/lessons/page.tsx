import { BookOpen, Download, GraduationCap } from 'lucide-react';

export default function LessonsPage() {
  return (
    <div className="bg-amber-50 min-h-screen">
      <div className="container mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block bg-sky-500 text-white px-4 py-2 rounded-full font-bold text-sm mb-4">
            למורים ולמחנכים
          </div>
          <h1 className="text-5xl font-black text-gray-900 mb-6">מערכי שיעור</h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            מערכי שיעור מוכנים להורדה בחינם, המבוססים על הספרים ומותאמים לכיתות שונות
          </p>
        </div>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Encryption Lesson */}
          <div className="bg-white border-4 border-black rounded-3xl p-8 hard-shadow">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-pink-100 text-pink-500 rounded-xl flex items-center justify-center border-2 border-black">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black">סודות ההצפנה</h3>
                <p className="text-gray-500 text-sm">כיתות ד׳-ו׳</p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              מערך שיעור המלמד את עקרונות ההצפנה דרך פעילויות מעשיות וחידות לפיענוח
            </p>
            <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
              <p className="text-gray-500 font-medium">בקרוב להורדה!</p>
            </div>
          </div>

          {/* AI Lesson */}
          <div className="bg-white border-4 border-black rounded-3xl p-8 hard-shadow">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-sky-100 text-sky-500 rounded-xl flex items-center justify-center border-2 border-black">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black">בינה מלאכותית</h3>
                <p className="text-gray-500 text-sm">כיתות ד׳-ו׳</p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              מערך שיעור להכרות עם עולם הבינה המלאכותית דרך דוגמאות מהחיים ופעילויות אינטראקטיביות
            </p>
            <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
              <p className="text-gray-500 font-medium">בקרוב להורדה!</p>
            </div>
          </div>

          {/* Algorithms Lesson */}
          <div className="bg-white border-4 border-black rounded-3xl p-8 hard-shadow">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-500 rounded-xl flex items-center justify-center border-2 border-black">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black">אלגוריתמים</h3>
                <p className="text-gray-500 text-sm">כיתות ד׳-ו׳</p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              מערך שיעור המלמד חשיבה אלגוריתמית דרך משחקים ופעילויות קבוצתיות
            </p>
            <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
              <p className="text-gray-500 font-medium">בקרוב להורדה!</p>
            </div>
          </div>

          {/* Combined Workshop */}
          <div className="bg-white border-4 border-black rounded-3xl p-8 hard-shadow">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-amber-100 text-amber-500 rounded-xl flex items-center justify-center border-2 border-black">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black">סדנה משולבת</h3>
                <p className="text-gray-500 text-sm">כל הגילאים</p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              יום פעילות שלם המשלב את שלושת הנושאים בפעילויות מגוונות
            </p>
            <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
              <p className="text-gray-500 font-medium">בקרוב להורדה!</p>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-16 bg-sky-50 border-4 border-black rounded-3xl p-8 text-center hard-shadow max-w-2xl mx-auto">
          <Download className="w-12 h-12 mx-auto text-sky-500 mb-4" />
          <h3 className="text-2xl font-black mb-4">רוצים לקבל עדכון?</h3>
          <p className="text-gray-700">
            המערכים בהכנה ויהיו זמינים להורדה בקרוב. צרו קשר ונעדכן אתכם כשהם מוכנים!
          </p>
        </div>
      </div>
    </div>
  );
}
