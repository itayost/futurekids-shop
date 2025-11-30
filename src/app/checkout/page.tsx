'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Lock, ShoppingBag } from 'lucide-react';
import { useCart } from '@/components/CartProvider';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    address: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Submit order to API
    // For now, just simulate order creation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    clearCart();
    router.push('/success');
  };

  if (items.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center p-6">
        <div className="bg-white border-4 border-black rounded-2xl p-12 hard-shadow text-center max-w-md">
          <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h1 className="text-2xl font-black mb-4">הסל ריק</h1>
          <p className="text-gray-600 mb-6">הוסיפו ספרים לסל כדי להמשיך לתשלום</p>
          <Link
            href="/"
            className="btn-retro inline-block bg-pink-500 text-white px-8 py-3 rounded-xl font-bold border-2 border-black hover:bg-pink-600"
          >
            חזרה לחנות
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-6 max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-bold text-gray-600 mb-8 hover:text-black"
        >
          <ChevronLeft className="w-5 h-5" />
          חזרה לחנות
        </Link>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Form Section */}
          <div className="lg:w-2/3 bg-white border-4 border-black rounded-2xl p-8 hard-shadow h-fit">
            <h1 className="text-3xl font-black mb-8 flex items-center gap-3">
              <span className="bg-black text-white w-10 h-10 rounded-full flex items-center justify-center text-lg">
                1
              </span>
              פרטים למשלוח
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-md font-bold text-gray-900 mb-2">שם פרטי</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="input-brutal w-full rounded-lg p-3 text-lg bg-gray-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-md font-bold text-gray-900 mb-2">שם משפחה</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="input-brutal w-full rounded-lg p-3 text-lg bg-gray-50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-md font-bold text-gray-900 mb-2">אימייל</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-brutal w-full rounded-lg p-3 text-lg bg-gray-50"
                  required
                />
              </div>

              <div>
                <label className="block text-md font-bold text-gray-900 mb-2">טלפון</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-brutal w-full rounded-lg p-3 text-lg bg-gray-50"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-md font-bold text-gray-900 mb-2">עיר</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="input-brutal w-full rounded-lg p-3 text-lg bg-gray-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-md font-bold text-gray-900 mb-2">כתובת</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="input-brutal w-full rounded-lg p-3 text-lg bg-gray-50"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-retro bg-pink-500 text-white text-xl w-full py-4 rounded-xl font-black border-2 border-black hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'מעבד...' : 'להשלמת ההזמנה'}
              </button>

              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Lock className="w-4 h-4" />
                החשבונית תישלח במייל (iCount)
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white border-4 border-black rounded-2xl p-6 hard-shadow lg:sticky lg:top-24">
              <h2 className="text-xl font-black mb-6">סיכום הזמנה</h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-4">
                    <div className="w-16 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={50}
                        height={70}
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-sm">{item.name}</h3>
                      <p className="text-gray-500 text-sm">כמות: {item.quantity}</p>
                      <p className="font-black text-pink-500">₪{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-black pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">סה&quot;כ:</span>
                  <span className="text-3xl font-black">₪{total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
