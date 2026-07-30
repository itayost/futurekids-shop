'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Users, Download, ShoppingCart, Search } from 'lucide-react';
import { buildMembersCsv } from '@/lib/members-csv';

interface Member {
  email: string;
  first_name: string | null;
  created_at: string;
  unsubscribed_at: string | null;
  welcome_sent_at: string | null;
  cart_total: number | null;
  cart_updated_at: string | null;
  orders_count: number;
}

export default function MembersAdminPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/members');
        if (res.ok) {
          const data = await res.json();
          setMembers(data.members || []);
        } else if (res.status === 401) {
          setError('יש להתחבר דרך עמוד האדמין');
        } else {
          setError('שגיאה בטעינת חברי המועדון');
        }
      } catch {
        setError('שגיאה בטעינת חברי המועדון');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) => m.email.includes(q) || (m.first_name || '').toLowerCase().includes(q)
    );
  }, [members, query]);

  const activeCount = members.filter((m) => !m.unsubscribed_at).length;
  const openCarts = members.filter((m) => m.cart_total != null).length;

  const exportCsv = () => {
    const blob = new Blob([buildMembersCsv(members)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'club-members.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black flex items-center gap-3">
            <Users className="w-8 h-8" />
            מועדון לקוחות
          </h1>
          <Link href="/admin" className="inline-flex items-center gap-1 font-bold text-gray-600 hover:text-[#545454]">
            <ChevronRight className="w-5 h-5" />
            חזרה להזמנות
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'חברים', value: members.length },
            { label: 'פעילים', value: activeCount },
            { label: 'הוסרו', value: members.length - activeCount },
            { label: 'סלים פתוחים', value: openCarts },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border-4 border-[#545454] rounded-xl p-4 hard-shadow text-center">
              <p className="text-3xl font-black">{stat.value}</p>
              <p className="text-sm font-bold text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Search + export */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-5 h-5 text-gray-400 absolute top-1/2 -translate-y-1/2 right-3" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="חיפוש לפי אימייל או שם"
              className="input-brutal rounded-lg p-3 pr-10 bg-white w-full"
            />
          </div>
          <button
            onClick={exportCsv}
            disabled={members.length === 0}
            className="btn-retro bg-pink-500 text-white font-bold rounded-lg px-4 py-3 border-2 border-[#545454] flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            ייצוא CSV
          </button>
        </div>

        {/* List */}
        {loading ? (
          <p className="text-center text-gray-500 font-bold">טוען...</p>
        ) : error ? (
          <p className="text-center text-red-600 font-bold">{error}</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-500 font-bold">
            {members.length === 0 ? 'אין חברים במועדון עדיין' : 'אין תוצאות לחיפוש'}
          </p>
        ) : (
          <div className="space-y-3">
            {filtered.map((m) => (
              <div key={m.email} className="bg-white border-4 border-[#545454] rounded-xl p-4 hard-shadow flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black" dir="ltr">{m.email}</span>
                    {m.first_name && <span className="text-gray-600 font-bold">{m.first_name}</span>}
                    <span className={`text-sm font-bold rounded-full px-3 py-0.5 border-2 border-[#545454] ${m.unsubscribed_at ? 'bg-gray-100 text-gray-500' : 'bg-emerald-100 text-emerald-700'}`}>
                      {m.unsubscribed_at ? 'הוסר' : 'פעיל'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    הצטרפות: {new Date(m.created_at).toLocaleDateString('he-IL')}
                    {m.orders_count > 0 && <span className="mr-3">הזמנות ששולמו: {m.orders_count}</span>}
                  </p>
                </div>
                {m.cart_total != null && (
                  <div className="inline-flex items-center gap-2 bg-amber-50 border-2 border-[#545454] rounded-lg px-3 py-2 font-bold text-sm">
                    <ShoppingCart className="w-4 h-4" />
                    סל פתוח: ₪{m.cart_total}
                    {m.cart_updated_at && (
                      <span className="text-gray-500 font-medium">
                        ({new Date(m.cart_updated_at).toLocaleDateString('he-IL')})
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
