'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import ContactForm from '@/components/ContactForm';

function ContactContent() {
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get('success') === 'true';

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-emerald-50 border-4 border-emerald-500 rounded-3xl p-8 hard-shadow text-center">
          <CheckCircle className="w-16 h-16 mx-auto text-emerald-500 mb-4" />
          <h2 className="text-2xl font-black mb-4 text-emerald-700">ההודעה נשלחה בהצלחה!</h2>
          <p className="text-gray-600 mb-6">תודה שפניתם אליי. אחזור אליכם בהקדם.</p>
          <a
            href="/contact"
            className="btn-retro inline-block bg-pink-500 text-white px-6 py-3 rounded-xl font-bold border-2 border-[#545454] hover:bg-pink-600"
          >
            שליחת הודעה נוספת
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <ContactForm />
    </div>
  );
}

export default function ContactPage() {
  return (
    <div className="bg-amber-50 min-h-screen">
      <div className="container mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block bg-pink-500 text-white px-4 py-2 rounded-full font-bold text-sm mb-4">
            דברו איתי
          </div>
          <h1 className="text-5xl font-black text-[#545454] mb-6">צור קשר</h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            יש לכם שאלה? רוצים להזמין הרצאה או סדנה? אשמח לשמוע מכם!
          </p>
        </div>

        <Suspense fallback={<div className="text-center py-10">טוען...</div>}>
          <ContactContent />
        </Suspense>
      </div>
    </div>
  );
}
