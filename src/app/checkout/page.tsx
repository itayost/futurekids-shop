'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Lock, ShoppingBag, Gift, Truck, MapPin } from 'lucide-react';
import { useCart } from '@/components/CartProvider';
import PickupPointSelector from '@/components/PickupPointSelector';
import { PickupPoint } from '@/types';

type ShippingOption = 'pickup-point' | 'delivery';

const SHIPPING_OPTIONS = {
  'pickup-point': { label: 'נקודות איסוף', price: 20, icon: MapPin },
  delivery: { label: 'משלוח עד הבית', price: 40, icon: Truck },
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, bundleDiscount, bundleName, hasBundle, total } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shippingMethod, setShippingMethod] = useState<ShippingOption>('pickup-point');
  const [selectedPickupPoint, setSelectedPickupPoint] = useState<PickupPoint | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    address: '',
  });

  const shippingCost = SHIPPING_OPTIONS[shippingMethod].price;
  const finalTotal = total + shippingCost;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validate pickup point selection
    if (shippingMethod === 'pickup-point' && !selectedPickupPoint) {
      setError('יש לבחור נקודת איסוף');
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare address data based on shipping method
      const addressData = shippingMethod === 'pickup-point' && selectedPickupPoint
        ? {
            city: selectedPickupPoint.city,
            address: `${selectedPickupPoint.name} - ${selectedPickupPoint.street} ${selectedPickupPoint.house}`,
            pickupPointCode: selectedPickupPoint.code,
            pickupPointName: selectedPickupPoint.name,
          }
        : {
            city: formData.city,
            address: formData.address,
          };

      // Call checkout API - creates order and returns payment page URL
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          ...addressData,
          items: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          bundleDiscount,
          bundleName,
          shippingMethod,
          shippingCost,
          total: finalTotal,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create order');
      }

      // Redirect to iCount payment page
      if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else {
        // Fallback if no payment URL (shouldn't happen)
        router.push('/success');
      }
    } catch (err) {
      console.error('Error submitting order:', err);
      setError(err instanceof Error ? err.message : 'אירעה שגיאה בשליחת ההזמנה. אנא נסו שוב.');
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center p-6">
        <div className="bg-white border-4 border-[#545454] rounded-2xl p-12 hard-shadow text-center max-w-md">
          <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h1 className="text-2xl font-black mb-4">הסל ריק</h1>
          <p className="text-gray-600 mb-6">הוסיפו ספרים לסל כדי להמשיך לתשלום</p>
          <Link
            href="/"
            className="btn-retro inline-block bg-pink-500 text-white px-8 py-3 rounded-xl font-bold border-2 border-[#545454] hover:bg-pink-600"
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
          className="inline-flex items-center gap-2 font-bold text-gray-600 mb-8 hover:text-[#545454]"
        >
          <ChevronLeft className="w-5 h-5" />
          חזרה לחנות
        </Link>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Form Section */}
          <div className="lg:w-2/3 space-y-6">
            {/* Shipping Selection */}
            <div className="bg-white border-4 border-[#545454] rounded-2xl p-8 hard-shadow">
              <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
                <span className="bg-black text-white w-10 h-10 rounded-full flex items-center justify-center text-lg">
                  1
                </span>
                אופן קבלת ההזמנה
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(Object.entries(SHIPPING_OPTIONS) as [ShippingOption, typeof SHIPPING_OPTIONS['pickup-point']][]).map(([key, option]) => {
                  const Icon = option.icon;
                  const isSelected = shippingMethod === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setShippingMethod(key)}
                      className={`p-6 rounded-xl border-4 transition-all text-right ${
                        isSelected
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          isSelected ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-500'
                        }`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-black text-lg">{option.label}</p>
                          <p className={`font-bold ${isSelected ? 'text-pink-500' : 'text-gray-500'}`}>
                            ₪{option.price}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-white border-4 border-[#545454] rounded-2xl p-8 hard-shadow">
              <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
                <span className="bg-black text-white w-10 h-10 rounded-full flex items-center justify-center text-lg">
                  2
                </span>
                פרטים למשלוח
              </h2>

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

              {/* Pickup Point Selector - shown when pickup-point is selected */}
              {shippingMethod === 'pickup-point' && (
                <PickupPointSelector
                  selectedPoint={selectedPickupPoint}
                  onSelect={setSelectedPickupPoint}
                />
              )}

              {/* City/Address - shown only for home delivery */}
              {shippingMethod === 'delivery' && (
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
              )}

              {error && (
                <div className="bg-red-50 border-2 border-red-500 rounded-xl p-4 text-red-700 font-bold text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-retro bg-pink-500 text-white text-xl w-full py-4 rounded-xl font-black border-2 border-[#545454] hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'מעבר לתשלום...' : 'המשך לתשלום מאובטח'}
              </button>

              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Lock className="w-4 h-4" />
                תועברו לדף תשלום מאובטח | החשבונית תישלח למייל
              </div>
            </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white border-4 border-[#545454] rounded-2xl p-6 hard-shadow lg:sticky lg:top-24">
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

              <div className="border-t-2 border-[#545454] pt-4 space-y-2">
                {/* Subtotal */}
                <div className="flex justify-between items-center text-gray-600">
                  <span>סכום ביניים:</span>
                  <span className="font-bold">₪{subtotal}</span>
                </div>

                {/* Bundle Discount */}
                {hasBundle && (
                  <div className="flex justify-between items-center text-emerald-600">
                    <span className="flex items-center gap-1">
                      <Gift size={16} />
                      הנחת מארז:
                    </span>
                    <span className="font-bold">-₪{bundleDiscount}</span>
                  </div>
                )}

                {/* Shipping */}
                <div className="flex justify-between items-center text-gray-600">
                  <span className="flex items-center gap-1">
                    {shippingMethod === 'delivery' ? <Truck size={16} /> : <MapPin size={16} />}
                    {SHIPPING_OPTIONS[shippingMethod].label}:
                  </span>
                  <span className="font-bold">₪{shippingCost}</span>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-lg font-bold">סה&quot;כ:</span>
                  <span className="text-3xl font-black">₪{finalTotal}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
