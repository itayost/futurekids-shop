'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, Home, RefreshCw, Loader2 } from 'lucide-react';

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const errorMessage = searchParams.get('error');

  return (
    <div className="bg-red-50 min-h-screen flex items-center justify-center p-6">
      <div className="bg-white border-4 border-black rounded-3xl p-12 hard-shadow text-center max-w-lg">
        <div className="w-24 h-24 bg-red-100 border-4 border-black rounded-full flex items-center justify-center mx-auto mb-8">
          <XCircle className="w-12 h-12 text-red-600" strokeWidth={3} />
        </div>

        <h1 className="text-4xl font-black text-gray-900 mb-4">התשלום נכשל</h1>

        <p className="text-xl text-gray-700 mb-8 leading-relaxed">
          {errorMessage || 'לא הצלחנו לעבד את התשלום. אנא נסו שוב.'}
        </p>

        {orderId && (
          <p className="text-sm text-gray-500 mb-6">
            מספר הזמנה: {orderId.slice(0, 8)}...
          </p>
        )}

        <div className="space-y-4">
          <Link
            href="/checkout"
            className="btn-retro inline-flex items-center justify-center gap-2 bg-pink-500 text-white px-8 py-4 rounded-xl font-black text-lg border-2 border-black hover:bg-pink-600 w-full"
          >
            <RefreshCw className="w-5 h-5" />
            נסה שוב
          </Link>

          <Link
            href="/"
            className="btn-retro inline-flex items-center justify-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-lg border-2 border-black hover:bg-gray-50 w-full"
          >
            <Home className="w-5 h-5" />
            חזרה לחנות
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-6">
      <Loader2 className="w-12 h-12 text-pink-500 animate-spin" />
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PaymentFailedContent />
    </Suspense>
  );
}
