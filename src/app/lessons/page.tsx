import Image from 'next/image';
import { BookOpen, Download, FileDown } from 'lucide-react';

const lessons = [
  {
    id: 1,
    title: 'בינה מלאכותית',
    description: 'מערך שיעור בהשראת ספר הבינה המלאכותית',
    color: 'sky',
    bgColor: 'bg-sky-100',
    textColor: 'text-sky-500',
    downloadUrl: '/lessons/מערך שיעור בינה מלאכותית.pdf',
  },
  {
    id: 2,
    title: 'סודות ההצפנה',
    description: 'מערך שיעור בהשראת ספר סודות ההצפנה',
    color: 'pink',
    bgColor: 'bg-pink-100',
    textColor: 'text-pink-500',
    downloadUrl: '/lessons/מערך שיעור סודות ההצפנה.pdf',
  },
  {
    id: 3,
    title: 'אלגוריתמים',
    description: 'מערך שיעור בהשראת ספר האלגוריתמים',
    color: 'emerald',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-500',
    downloadUrl: '/lessons/מערך שיעור אלגוריתמים.pdf',
  },
];

export default function LessonsPage() {
  return (
    <div className="bg-amber-50 min-h-screen">
      <div className="container mx-auto px-6 py-16">
        {/* Author Intro Card */}
        <div className="bg-white border-4 border-black rounded-3xl p-8 mb-16 hard-shadow flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 bg-sky-100 border-4 border-black rounded-full overflow-hidden flex-shrink-0">
            <Image
              src="/Stav.png"
              alt="ד״ר סתיו אלבר"
              width={128}
              height={128}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center md:text-right">
            <h1 className="text-3xl font-black mb-4">מערכי שיעור</h1>
            <p className="text-gray-600 text-lg">
              להסביר לילדים בגילאי בית ספר יסודי איך עובד &apos;מפתח הצפנה&apos; או מה זה &apos;אלגוריתם&apos; זה אתגר לא פשוט. בדיוק בשביל זה הקמתי את המאגר הזה. פיתחתי עבורכם שלושה מערכי שיעור מובנים ומפורטים – אחד בהשראת כל ספר בסדרה (בינה מלאכותית, הצפנה ואלגוריתמים). כל מערך שיעור עומד בפני עצמו וכולל את כל התוכן וההנחיות שצריך כדי להעביר פעילות מעשירה, חווייתית ומרתקת בכיתה או בבית. הקבצים פתוחים להורדה ולשימוש חופשי, כדי לתת לכם כלים לגדל כאן את הדור הבא של החוקרים והממציאים.
            </p>
          </div>
        </div>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="bg-white border-4 border-black rounded-3xl p-8 hard-shadow">
              <div className={`w-16 h-16 ${lesson.bgColor} ${lesson.textColor} rounded-2xl flex items-center justify-center border-2 border-black mb-6`}>
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black mb-4">{lesson.title}</h3>
              <p className="text-gray-600 mb-6">
                {lesson.description}
              </p>
              <a
                href={lesson.downloadUrl}
                download
                className={`w-full ${lesson.bgColor} ${lesson.textColor} border-2 border-black rounded-xl p-4 font-bold flex items-center justify-center gap-2 hover:opacity-80 transition-opacity`}
              >
                <FileDown className="w-5 h-5" />
                הורדה
              </a>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-16 bg-sky-50 border-4 border-black rounded-3xl p-8 text-center hard-shadow max-w-2xl mx-auto">
          <Download className="w-12 h-12 mx-auto text-sky-500 mb-4" />
          <h3 className="text-2xl font-black mb-4">שימוש חופשי</h3>
          <p className="text-gray-700">
            מערכי השיעור פתוחים לשימוש חופשי למורים, מדריכים והורים. הורידו, הדפיסו והעבירו שיעורים מעשירים!
          </p>
        </div>
      </div>
    </div>
  );
}
