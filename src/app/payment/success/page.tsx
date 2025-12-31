'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Home, Mail, Loader2 } from 'lucide-react';

function LoadingFallback() {
  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-6">
      <div className="bg-white border-4 border-[#545454] rounded-3xl p-12 hard-shadow text-center max-w-lg">
        <Loader2 className="w-16 h-16 mx-auto text-pink-500 animate-spin mb-6" />
        <h1 className="text-2xl font-black text-gray-900 mb-4">טוען...</h1>
      </div>
    </div>
  );
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const paymentId = searchParams.get('payment_id');
  const docId = searchParams.get('doc_id');

  const [isVerifying, setIsVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError('מספר הזמנה חסר');
      setIsVerifying(false);
      return;
    }

    // Verify payment and update order status
    const verifyPayment = async () => {
      try {
        const response = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, paymentId, docId }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          setVerified(true);
          // Clear cart from localStorage
          localStorage.removeItem('futurekids-cart');
        } else {
          setError(result.error || 'אירעה שגיאה באימות התשלום');
        }
      } catch {
        setError('אירעה שגיאה באימות התשלום');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [orderId, paymentId, docId]);

  if (isVerifying) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center p-6">
        <div className="bg-white border-4 border-[#545454] rounded-3xl p-12 hard-shadow text-center max-w-lg">
          <Loader2 className="w-16 h-16 mx-auto text-pink-500 animate-spin mb-6" />
          <h1 className="text-2xl font-black text-gray-900 mb-4">מאמת את התשלום...</h1>
          <p className="text-gray-600">אנא המתינו רגע</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 min-h-screen flex items-center justify-center p-6">
        <div className="bg-white border-4 border-[#545454] rounded-3xl p-12 hard-shadow text-center max-w-lg">
          <div className="w-24 h-24 bg-red-100 border-4 border-[#545454] rounded-full flex items-center justify-center mx-auto mb-8">
            <span className="text-4xl">❌</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4">שגיאה</h1>
          <p className="text-lg text-gray-700 mb-8">{error}</p>
          <Link
            href="/"
            className="btn-retro inline-flex items-center justify-center gap-2 bg-pink-500 text-white px-8 py-4 rounded-xl font-black text-lg border-2 border-[#545454] hover:bg-pink-600"
          >
            <Home className="w-5 h-5" />
            חזרה לחנות
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-emerald-50 min-h-screen flex items-center justify-center p-6">
      <div className="bg-white border-4 border-[#545454] rounded-3xl p-12 hard-shadow text-center max-w-lg">
        <div className="w-24 h-24 bg-emerald-100 border-4 border-[#545454] rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle className="w-12 h-12 text-emerald-600" strokeWidth={3} />
        </div>

        <h1 className="text-4xl font-black text-gray-900 mb-4">התשלום הושלם!</h1>

        <p className="text-xl text-gray-700 mb-8 leading-relaxed">
          תודה רבה על הרכישה! הספרים שלכם בדרך אליכם.
        </p>

        <div className="bg-gray-50 border-2 border-[#545454] rounded-xl p-6 mb-8">
          <div className="flex items-center justify-center gap-2 text-gray-600 mb-2">
            <Mail className="w-5 h-5" />
            <span className="font-medium">חשבונית נשלחה למייל</span>
          </div>
          <p className="text-sm text-gray-500">
            בדקו את תיבת הדואר הנכנס (כולל ספאם) לחשבונית ופרטי המשלוח
          </p>
          {orderId && (
            <p className="text-xs text-gray-400 mt-2">
              מספר הזמנה: {orderId.slice(0, 8)}...
            </p>
          )}
        </div>

        <Link
          href="/"
          className="btn-retro inline-flex items-center justify-center gap-2 bg-pink-500 text-white px-8 py-4 rounded-xl font-black text-lg border-2 border-[#545454] hover:bg-pink-600 w-full"
        >
          <Home className="w-5 h-5" />
          חזרה לחנות
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
