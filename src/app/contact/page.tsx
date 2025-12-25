import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="bg-amber-50 min-h-screen">
      <div className="container mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block bg-pink-500 text-white px-4 py-2 rounded-full font-bold text-sm mb-4">
            דברו איתי
          </div>
          <h1 className="text-5xl font-black text-gray-900 mb-6">צור קשר</h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            יש לכם שאלה? רוצים להזמין הרצאה או סדנה? אשמח לשמוע מכם!
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Info Card */}
          <div className="bg-white border-4 border-black rounded-3xl p-8 hard-shadow">
            <h2 className="text-2xl font-black mb-8">פרטי התקשרות</h2>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-pink-100 text-pink-500 rounded-xl flex items-center justify-center border-2 border-black flex-shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">אימייל</p>
                  <a href="mailto:stav.elbar@gmail.com" className="font-bold hover:text-pink-500 transition">
                    stav.elbar@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-sky-100 text-sky-500 rounded-xl flex items-center justify-center border-2 border-black flex-shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">טלפון</p>
                  <p className="font-bold">ניתן ליצור קשר באימייל</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-500 rounded-xl flex items-center justify-center border-2 border-black flex-shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">מיקום</p>
                  <p className="font-bold">ישראל</p>
                </div>
              </div>
            </div>
          </div>

          {/* What I Offer Card */}
          <div className="bg-pink-50 border-4 border-black rounded-3xl p-8 hard-shadow">
            <h2 className="text-2xl font-black mb-8">במה אוכל לעזור?</h2>

            <div className="space-y-4">
              <div className="bg-white border-2 border-black rounded-xl p-4">
                <h3 className="font-bold mb-1">הרצאות לילדים</h3>
                <p className="text-gray-600 text-sm">הרצאות מרתקות על הצפנה, AI ואלגוריתמים לבתי ספר וקייטנות</p>
              </div>

              <div className="bg-white border-2 border-black rounded-xl p-4">
                <h3 className="font-bold mb-1">סדנאות להורים וילדים</h3>
                <p className="text-gray-600 text-sm">פעילויות משותפות שמקרבות בין הורים וילדים דרך הטכנולוגיה</p>
              </div>

              <div className="bg-white border-2 border-black rounded-xl p-4">
                <h3 className="font-bold mb-1">הרצאות למורים</h3>
                <p className="text-gray-600 text-sm">הכשרה והשראה למורים שרוצים ללמד טכנולוגיה בכיתה</p>
              </div>

              <div className="bg-white border-2 border-black rounded-xl p-4">
                <h3 className="font-bold mb-1">הופעות בתקשורת</h3>
                <p className="text-gray-600 text-sm">פודקאסטים, ראיונות וכתבות על חינוך טכנולוגי</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Box */}
        <div className="mt-16 bg-black text-white rounded-3xl p-8 text-center max-w-2xl mx-auto">
          <MessageCircle className="w-12 h-12 mx-auto text-pink-400 mb-4" />
          <h3 className="text-2xl font-black mb-4">מחכה לשמוע מכם!</h3>
          <p className="text-gray-300 mb-6">
            שלחו אימייל ואחזור אליכם בהקדם האפשרי
          </p>
          <a
            href="mailto:stav.elbar@gmail.com"
            className="btn-retro inline-block bg-pink-500 text-white px-10 py-4 rounded-xl font-black text-lg border-2 border-white hover:bg-pink-600"
          >
            שלחו אימייל
          </a>
        </div>
      </div>
    </div>
  );
}
