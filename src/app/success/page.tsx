import Link from 'next/link';
import { CheckCircle, Home, Mail } from 'lucide-react';

export default function SuccessPage() {
  return (
    <div className="bg-emerald-50 min-h-screen flex items-center justify-center p-6">
      <div className="bg-white border-4 border-black rounded-3xl p-12 hard-shadow text-center max-w-lg">
        <div className="w-24 h-24 bg-emerald-100 border-4 border-black rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle className="w-12 h-12 text-emerald-600" strokeWidth={3} />
        </div>

        <h1 className="text-4xl font-black text-gray-900 mb-4">ההזמנה התקבלה!</h1>

        <p className="text-xl text-gray-700 mb-8 leading-relaxed">
          תודה רבה על הרכישה! הספרים שלכם בדרך אליכם.
        </p>

        <div className="bg-gray-50 border-2 border-black rounded-xl p-6 mb-8">
          <div className="flex items-center justify-center gap-2 text-gray-600 mb-2">
            <Mail className="w-5 h-5" />
            <span className="font-medium">אישור הזמנה נשלח למייל</span>
          </div>
          <p className="text-sm text-gray-500">
            בדקו את תיבת הדואר הנכנס (כולל ספאם) לאישור ופרטי המשלוח
          </p>
        </div>

        <Link
          href="/"
          className="btn-retro inline-flex items-center justify-center gap-2 bg-pink-500 text-white px-8 py-4 rounded-xl font-black text-lg border-2 border-black hover:bg-pink-600 w-full"
        >
          <Home className="w-5 h-5" />
          חזרה לחנות
        </Link>
      </div>
    </div>
  );
}
