'use client';

import { useState, useEffect, useMemo } from 'react';
import { Lock, Package, User, MapPin, Phone, Mail, Calendar, ShoppingBag, ChevronDown, ChevronUp, Search, Trash2, Truck, Gift } from 'lucide-react';

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
  shipping_method: string | null;
  shipping_cost: number | null;
  pickup_point_code: string | null;
  pickup_point_name: string | null;
  bundle_discount: number | null;
  bundle_name: string | null;
  items: OrderItem[];
}

const STATUSES = [
  { value: 'PENDING', label: 'ממתין', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { value: 'PAID', label: 'שולם', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'SHIPPED', label: 'נשלח', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  { value: 'DELIVERED', label: 'נמסר', color: 'bg-green-100 text-green-800 border-green-300' },
  { value: 'CANCELLED', label: 'בוטל', color: 'bg-red-100 text-red-800 border-red-300' },
];

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

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

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId);
    try {
      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (response.ok) {
        setOrders(orders.map(o =>
          o.id === orderId ? { ...o, status: newStatus } : o
        ));
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDelete = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders?id=${orderId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setOrders(orders.filter(o => o.id !== orderId));
        setDeleteConfirm(null);
      }
    } catch (err) {
      console.error('Error deleting order:', err);
    }
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

  const getStatusInfo = (status: string) => {
    return STATUSES.find(s => s.value === status) || STATUSES[0];
  };

  const getShippingLabel = (order: Order) => {
    if (order.shipping_method === 'pickup-point') {
      return order.pickup_point_name || 'נקודת איסוף';
    }
    if (order.shipping_method === 'delivery') {
      return 'משלוח עד הבית';
    }
    return null;
  };

  // Filter orders based on search and status
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Status filter
      if (statusFilter && order.status !== statusFilter) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchFields = [
          order.first_name,
          order.last_name,
          order.email,
          order.phone,
          order.city,
          `${order.first_name} ${order.last_name}`,
        ].map(f => f?.toLowerCase() || '');

        return searchFields.some(field => field.includes(query));
      }

      return true;
    });
  }, [orders, searchQuery, statusFilter]);

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
        <div className="bg-white border-4 border-[#545454] rounded-2xl p-8 hard-shadow max-w-md w-full">
          <div className="w-16 h-16 bg-pink-100 border-4 border-[#545454] rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-pink-600" />
          </div>
          <h1 className="text-2xl font-black text-center mb-6">ניהול הזמנות</h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-md font-bold text-[#545454] mb-2">סיסמה</label>
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
              className="btn-retro bg-pink-500 text-white w-full py-3 rounded-xl font-black border-2 border-[#545454] hover:bg-pink-600 disabled:opacity-50"
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
            className="text-gray-600 hover:text-[#545454] font-bold"
          >
            התנתק
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white border-4 border-[#545454] rounded-xl p-4 hard-shadow mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="חיפוש לפי שם, אימייל, טלפון..."
                className="input-brutal w-full rounded-lg p-3 pr-10 text-lg bg-gray-50"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-brutal rounded-lg p-3 text-lg bg-gray-50 min-w-[150px]"
            >
              <option value="">כל הסטטוסים</option>
              {STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="bg-white border-4 border-[#545454] rounded-2xl p-12 hard-shadow text-center">
            <div className="animate-spin w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 font-bold">טוען הזמנות...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white border-4 border-[#545454] rounded-2xl p-12 hard-shadow text-center">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-black mb-2">
              {orders.length === 0 ? 'אין הזמנות עדיין' : 'לא נמצאו הזמנות'}
            </h2>
            <p className="text-gray-600">
              {orders.length === 0 ? 'הזמנות חדשות יופיעו כאן' : 'נסה לשנות את החיפוש או הסינון'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white border-4 border-[#545454] rounded-xl p-4 hard-shadow flex justify-between items-center">
              <p className="font-bold text-gray-600">
                {filteredOrders.length === orders.length
                  ? `סה"כ ${orders.length} הזמנות`
                  : `מציג ${filteredOrders.length} מתוך ${orders.length} הזמנות`
                }
              </p>
            </div>

            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white border-4 border-[#545454] rounded-2xl hard-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start gap-4">
                    {/* Left side - expand/collapse + status */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {expandedOrder === order.id ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>

                      {/* Status Dropdown */}
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={updatingStatus === order.id}
                        className={`px-3 py-1.5 rounded-full text-sm font-bold border-2 cursor-pointer ${getStatusInfo(order.status).color} ${updatingStatus === order.id ? 'opacity-50' : ''}`}
                      >
                        {STATUSES.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Right side - total */}
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
                    {getShippingLabel(order) && (
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-gray-400" />
                        <span className="text-purple-600 font-medium">{getShippingLabel(order)}</span>
                      </div>
                    )}
                    {order.bundle_name && (
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-pink-500" />
                        <span className="text-pink-600 font-medium">{order.bundle_name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {expandedOrder === order.id && (
                  <div className="border-t-4 border-[#545454] p-6 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-3">
                        <h3 className="font-black text-lg mb-3">פרטי לקוח</h3>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <a href={`mailto:${order.email}`} className="text-blue-600 hover:underline">{order.email}</a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <a href={`tel:${order.phone}`} className="text-blue-600 hover:underline">{order.phone}</a>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{order.address}, {order.city}</span>
                        </div>
                        {getShippingLabel(order) && (
                          <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                            <Truck className="w-4 h-4 text-purple-500" />
                            <span className="font-bold text-purple-600">{getShippingLabel(order)}</span>
                            {order.shipping_cost && (
                              <span className="text-gray-500">(₪{order.shipping_cost})</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="font-black text-lg mb-3">פריטים בהזמנה</h3>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex justify-between items-center bg-white p-3 rounded-lg border-2 border-[#545454]"
                            >
                              <div>
                                <p className="font-bold">{item.productName}</p>
                                <p className="text-sm text-gray-500">כמות: {item.quantity}</p>
                              </div>
                              <p className="font-black text-pink-500">₪{item.price * item.quantity}</p>
                            </div>
                          ))}
                        </div>

                        {/* Bundle & Shipping Summary */}
                        {(order.bundle_discount || order.shipping_cost) && (
                          <div className="mt-4 pt-3 border-t border-gray-200 space-y-2">
                            {order.bundle_name && order.bundle_discount && order.bundle_discount > 0 && (
                              <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                  <Gift className="w-4 h-4 text-pink-500" />
                                  <span className="text-pink-600 font-medium">{order.bundle_name}</span>
                                </div>
                                <span className="text-green-600 font-bold">-₪{order.bundle_discount}</span>
                              </div>
                            )}
                            {order.shipping_cost && order.shipping_cost > 0 && (
                              <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                  <Truck className="w-4 h-4 text-purple-500" />
                                  <span className="text-purple-600 font-medium">{getShippingLabel(order)}</span>
                                </div>
                                <span className="font-bold">₪{order.shipping_cost}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t-2 border-gray-300">
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">
                          מזהה: {order.id.slice(0, 8)}...
                        </span>

                        {/* Delete Button */}
                        {deleteConfirm === order.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDelete(order.id)}
                              className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 transition-colors"
                            >
                              אישור מחיקה
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-300 transition-colors"
                            >
                              ביטול
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(order.id)}
                            className="flex items-center gap-1 text-red-500 hover:text-red-700 text-sm font-bold transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            מחק
                          </button>
                        )}
                      </div>

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
