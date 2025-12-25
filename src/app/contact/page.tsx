import ContactForm from '@/components/ContactForm';

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
          {/* Contact Form */}
          <ContactForm />

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

      </div>
    </div>
  );
}
