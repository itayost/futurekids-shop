'use client';

import { useState, useEffect } from 'react';
import { Lock, Package, User, MapPin, Phone, Mail, Calendar, ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  city: string;
  status: string;
  total: number;
  created_at: string;
  paid_at: string | null;
  items: OrderItem[];
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth');
      const data = await response.json();
      setIsAuthenticated(data.authenticated);
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsChecking(false);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError('');

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        setPassword('');
      } else {
        setError('סיסמה שגויה');
      }
    } catch {
      setError('שגיאה בהתחברות');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    setIsAuthenticated(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'PAID':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'ממתין';
      case 'PAID':
        return 'שולם';
      case 'SHIPPED':
        return 'נשלח';
      case 'DELIVERED':
        return 'נמסר';
      case 'CANCELLED':
        return 'בוטל';
      default:
        return status;
    }
  };

  if (isChecking) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center p-6">
        <div className="animate-spin w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center p-6">
        <div className="bg-white border-4 border-black rounded-2xl p-8 hard-shadow max-w-md w-full">
          <div className="w-16 h-16 bg-pink-100 border-4 border-black rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-pink-600" />
          </div>
          <h1 className="text-2xl font-black text-center mb-6">ניהול הזמנות</h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-md font-bold text-gray-900 mb-2">סיסמה</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-brutal w-full rounded-lg p-3 text-lg bg-gray-50"
                placeholder="הזינו סיסמת מנהל"
                required
                disabled={isLoggingIn}
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm font-bold text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="btn-retro bg-pink-500 text-white w-full py-3 rounded-xl font-black border-2 border-black hover:bg-pink-600 disabled:opacity-50"
            >
              {isLoggingIn ? 'מתחבר...' : 'כניסה'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black flex items-center gap-3">
            <Package className="w-8 h-8" />
            ניהול הזמנות
          </h1>
          <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-black font-bold"
          >
            התנתק
          </button>
        </div>

        {loading ? (
          <div className="bg-white border-4 border-black rounded-2xl p-12 hard-shadow text-center">
            <div className="animate-spin w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 font-bold">טוען הזמנות...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border-4 border-black rounded-2xl p-12 hard-shadow text-center">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-black mb-2">אין הזמנות עדיין</h2>
            <p className="text-gray-600">הזמנות חדשות יופיעו כאן</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white border-4 border-black rounded-xl p-4 hard-shadow">
              <p className="font-bold text-gray-600">
                סה&quot;כ {orders.length} הזמנות
              </p>
            </div>

            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border-4 border-black rounded-2xl hard-shadow overflow-hidden"
              >
                <button
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  className="w-full p-6 text-right"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {expandedOrder === order.id ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                      <span className={`px-3 py-1 rounded-full text-sm font-bold border-2 ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="text-2xl font-black">₪{order.total}</p>
                      <p className="text-sm text-gray-500">{order.items.length} פריטים</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-bold">{order.first_name} {order.last_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{formatDate(order.created_at)}</span>
                    </div>
                  </div>
                </button>

                {expandedOrder === order.id && (
                  <div className="border-t-4 border-black p-6 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-3">
                        <h3 className="font-black text-lg mb-3">פרטי לקוח</h3>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{order.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{order.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{order.address}, {order.city}</span>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-black text-lg mb-3">פריטים בהזמנה</h3>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex justify-between items-center bg-white p-3 rounded-lg border-2 border-black"
                            >
                              <div>
                                <p className="font-bold">{item.productName}</p>
                                <p className="text-sm text-gray-500">כמות: {item.quantity}</p>
                              </div>
                              <p className="font-black text-pink-500">₪{item.price * item.quantity}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t-2 border-gray-300">
                      <span className="text-sm text-gray-500">
                        מזהה הזמנה: {order.id.slice(0, 8)}...
                      </span>
                      <span className="text-xl font-black">
                        סה&quot;כ: ₪{order.total}
                      </span>
                    </div>
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
