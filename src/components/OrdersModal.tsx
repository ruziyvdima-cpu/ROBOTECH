import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock, ClipboardList, Package, Hourglass, Trash2, CheckCircle } from 'lucide-react';
import { formatPrice } from '../lib/utils';

interface OrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: any;
  customerInfo: {
    phone: string;
    telegram?: string;
    country: string;
    city: string;
    address: string;
  };
}

const ORDER_LIFETIME_MS = 2 * 24 * 60 * 60 * 1000; // 2 days in milliseconds

export default function OrdersModal({ isOpen, onClose }: OrdersModalProps) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  // Update a ticking timer for real-time countdown
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000 * 60 * 5); // tick every 5 minutes is fine for rough countdowns
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (!user || !isOpen) return;

    setLoading(true);
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const orderList: Order[] = [];
      const expiredPromises: Promise<void>[] = [];

      for (const d of snapshot.docs) {
        const orderData = d.data();
        const orderId = d.id;
        
        // Convert firestore timestamp
        let createdAtMs = Date.now();
        if (orderData.createdAt) {
          createdAtMs = orderData.createdAt.toMillis?.() || orderData.createdAt.seconds * 1000;
        }

        const ageMs = Date.now() - createdAtMs;

        if (ageMs > ORDER_LIFETIME_MS) {
          // AUTO DELETE EXPIRED ORDERS FROM FIRESTORE
          console.log(`Auto-deleting expired order ${orderId} placed ${new Date(createdAtMs).toLocaleDateString()}`);
          expiredPromises.push(deleteDoc(doc(db, 'orders', orderId)));
        } else {
          orderList.push({
            id: orderId,
            ...orderData
          } as Order);
        }
      }

      if (expiredPromises.length > 0) {
        await Promise.all(expiredPromises);
      }

      setOrders(orderList);
      setLoading(false);
    }, (error) => {
      console.error("Error listening to orders:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, isOpen]);

  // Format remaining time countdown (Uzbek)
  const getRemainingTimeText = (createdAt: any) => {
    if (!createdAt) return "Hisoblanmoqda...";
    const createdAtMs = createdAt.toMillis?.() || createdAt.seconds * 1000 || Date.now();
    const expiresAtMs = createdAtMs + ORDER_LIFETIME_MS;
    const remainingMs = expiresAtMs - now;

    if (remainingMs <= 0) return "Muddati tugadi (O'chirilmoqda)";

    const hoursTotal = Math.floor(remainingMs / (1000 * 60 * 60));
    const days = Math.floor(hoursTotal / 24);
    const hours = hoursTotal % 24;
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days} kun ${hours} soat qoldi`;
    }
    return `${hours} soat ${minutes} daqiqa qoldi`;
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm("Buyurtmani bekor qilishni va o'chirishni xohlaysizmi?")) {
      try {
        await deleteDoc(doc(db, 'orders', orderId));
      } catch (err) {
        console.error("Failed to delete order:", err);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-end p-0 md:p-4 bg-black/70 backdrop-blur-xs">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="h-full w-full max-w-lg md:rounded-3xl border-l border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 p-6 md:p-8 flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-zinc-100 dark:border-zinc-900 shrink-0">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-5 w-5 text-red-600" />
            <div>
              <h2 className="text-xl font-black italic text-zinc-900 dark:text-white uppercase tracking-tight">Buyurtmalarim</h2>
              <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Order Protocol Manifest</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-400 hover:text-black dark:hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto py-6 no-scrollbar space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-4">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Sinxronizatsiya yuklanmoqda...</p>
            </div>
          ) : !user ? (
            <div className="text-center py-12 space-y-4">
              <p className="text-sm font-bold text-zinc-500">Iltimos, avval ro'yxatdan o'ting yoki tizimga kiring.</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 bg-zinc-50 dark:bg-zinc-900/20 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-900">
              <Package className="h-12 w-12 text-zinc-300 dark:text-zinc-700" />
              <div>
                <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight italic">Faol buyurtmalar yo'q</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-650 max-w-xs mt-2">Hozirda hech qanday faol buyurtmangiz mavjud emas. Buyurtmalar 2 kundan so'ng avtomatik tarzda o'chib ketadi.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div 
                  key={order.id} 
                  className="rounded-2xl border border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-900/10 p-5 shadow-sm space-y-4 hover:border-red-600/20 transition-all group"
                >
                  {/* Order Top Meta */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-650 uppercase tracking-widest block">BUYURTMA ID</span>
                      <code className="text-[11px] font-black text-zinc-8 line-clamp-1 break-all bg-zinc-100 dark:bg-zinc-900 py-1 px-2.5 rounded-lg select-all border border-zinc-200/50 dark:border-zinc-800 text-zinc-905 dark:text-zinc-300">{order.id}</code>
                    </div>
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="p-2 shrink-0 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                      title="Buyurtmani o'chirish"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-4 text-[10px] font-black uppercase tracking-tight py-2 border-y border-zinc-100/50 dark:border-zinc-900/50">
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Calendar className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                      <span>{order.createdAt ? new Date(order.createdAt?.toMillis?.() || order.createdAt?.seconds * 1000).toLocaleDateString() : 'Noma\'lum'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Clock className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                      <span>{order.createdAt ? new Date(order.createdAt?.toMillis?.() || order.createdAt?.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Noma\'lum'}</span>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-650 uppercase tracking-widest">Mahsulotlar</span>
                    <div className="space-y-1.5 pl-2 max-h-36 overflow-y-auto no-scrollbar">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[10px] uppercase font-black">
                          <span className="text-zinc-500 italic line-clamp-1">{item.name}</span>
                          <span className="text-red-600 font-bold mx-2">x{item.quantity}</span>
                          <span className="text-zinc-905 dark:text-white">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Lifetime Tracker Slider / Info */}
                  <div className="bg-red-500/5 dark:bg-red-600/5 border border-red-500/10 dark:border-red-600/10 rounded-xl p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase">
                      <span className="text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                        <Hourglass className="h-3.5 w-3.5 text-red-600 animate-pulse" />
                        Jarayon holati:
                      </span>
                      <span className="text-red-600 italic tracking-wider">Jarayonda</span>
                    </div>
                    
                    <div className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 uppercase">
                      <Clock className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                      <span>Tizimda o'chish vaqti: <b>{getRemainingTimeText(order.createdAt)}</b></span>
                    </div>
                  </div>

                  {/* Total and destination */}
                  <div className="flex justify-between items-end pt-2 border-t border-zinc-100 dark:border-zinc-900">
                    <div className="text-[10px] text-zinc-400 dark:text-zinc-600 font-black uppercase">
                      Telegram: <span className="text-zinc-800 dark:text-zinc-300 font-bold">{order.customerInfo?.telegram || 'Kiritilmagan'}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-650 block uppercase tracking-widest">JAMI TO'LOV</span>
                      <span className="text-md font-black text-red-600 italic">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Warning */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900 shrink-0 flex items-center gap-2.5 text-[9px] font-black tracking-wider text-zinc-400 dark:text-zinc-650 uppercase">
          <CheckCircle className="h-4 w-4 text-red-600 shrink-0" />
          <span>Xavfsizlik protokoli: buyurtmalar 2 kundan so'ng avtomatik tarzda o'chadi.</span>
        </div>
      </motion.div>
    </div>
  );
}
