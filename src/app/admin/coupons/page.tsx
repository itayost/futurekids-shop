'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Ticket, Trash2, Plus } from 'lucide-react';
import type { Coupon } from '@/lib/coupons';

export default function CouponsAdminPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: '', discount_type: 'percent', discount_value: '',
    min_subtotal: '', max_uses: '', expires_at: '',
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/coupons');
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
      } else {
        setError('שגיאה בטעינת קופונים');
      }
    } catch {
      setError('שגיאה בטעינת קופונים');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ code: '', discount_type: 'percent', discount_value: '', min_subtotal: '', max_uses: '', expires_at: '' });
        load();
      } else {
        const data = await res.json();
        setError(data.error || 'שגיאה ביצירת קופון');
      }
    } catch {
      setError('שגיאה ביצירת קופון');
    }
  };

  const toggle = async (c: Coupon) => {
    try {
      await fetch('/api/coupons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: c.id, active: !c.active }),
      });
      load();
    } catch {
      setError('שגיאה בעדכון קופון');
    }
  };

  const remove = async (id: string) => {
    try {
      await fetch(`/api/coupons?id=${id}`, { method: 'DELETE' });
      load();
    } catch {
      setError('שגיאה במחיקת קופון');
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black flex items-center gap-3">
            <Ticket className="w-8 h-8" />
            קופונים
          </h1>
          <Link href="/admin" className="inline-flex items-center gap-1 font-bold text-gray-600 hover:text-[#545454]">
            <ChevronRight className="w-5 h-5" />
            חזרה להזמנות
          </Link>
        </div>

        {/* Create form */}
        <form onSubmit={create} className="bg-white border-4 border-[#545454] rounded-xl p-4 hard-shadow mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="קוד (למשל SAVE10)" className="input-brutal rounded-lg p-3 bg-gray-50" />
          <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className="input-brutal rounded-lg p-3 bg-gray-50">
            <option value="percent">אחוז (%)</option>
            <option value="fixed">סכום קבוע (₪)</option>
          </select>
          <input required type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} placeholder="ערך ההנחה" className="input-brutal rounded-lg p-3 bg-gray-50" />
          <input type="number" value={form.min_subtotal} onChange={(e) => setForm({ ...form, min_subtotal: e.target.value })} placeholder="מינימום הזמנה (אופציונלי)" className="input-brutal rounded-lg p-3 bg-gray-50" />
          <input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} placeholder="מקסימום שימושים (אופציונלי)" className="input-brutal rounded-lg p-3 bg-gray-50" />
          <input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} className="input-brutal rounded-lg p-3 bg-gray-50" />
          <button type="submit" className="btn-retro bg-pink-500 text-white font-bold rounded-lg px-4 py-3 border-2 border-[#545454] flex items-center justify-center gap-2 md:col-span-3">
            <Plus className="w-5 h-5" />
            צור קופון
          </button>
          {error && <p className="text-red-600 font-bold md:col-span-3">{error}</p>}
        </form>

        {/* List */}
        {loading ? (
          <p className="text-center text-gray-500 font-bold">טוען...</p>
        ) : coupons.length === 0 ? (
          <p className="text-center text-gray-500 font-bold">אין קופונים עדיין</p>
        ) : (
          <div className="space-y-3">
            {coupons.map((c) => (
              <div key={c.id} className="bg-white border-4 border-[#545454] rounded-xl p-4 hard-shadow flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="font-black text-lg">{c.code}</span>
                  <span className="text-gray-600 mr-2">
                    {c.discount_type === 'percent' ? `${c.discount_value}%` : `₪${c.discount_value}`}
                  </span>
                  {c.min_subtotal != null && <span className="text-sm text-gray-500 mr-2">מעל ₪{c.min_subtotal}</span>}
                  {c.max_uses != null && <span className="text-sm text-gray-500 mr-2">{c.used_count}/{c.max_uses} שימושים</span>}
                  {c.expires_at && <span className="text-sm text-gray-500 mr-2">עד {new Date(c.expires_at).toLocaleDateString('he-IL')}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggle(c)} className={`font-bold rounded-lg px-3 py-2 border-2 border-[#545454] ${c.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.active ? 'פעיל' : 'כבוי'}
                  </button>
                  <button onClick={() => remove(c.id)} className="text-red-600 hover:text-red-800 p-2">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
