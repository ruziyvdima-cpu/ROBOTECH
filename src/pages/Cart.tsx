import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../lib/utils';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Cart() {
  const { t } = useTranslation();
  const { items, removeFromCart, updateQuantity, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="rounded-full bg-zinc-100 p-8 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <ShoppingBag className="h-10 w-10 text-zinc-400 dark:text-zinc-600" />
        </div>
        <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase italic tracking-tighter">{t('common.emptyCart')}</h2>
        <Link to="/" className="text-red-600 font-bold hover:underline text-xs uppercase tracking-widest">
          {t('common.back')}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
      {/* Cart Items */}
      <div className="lg:col-span-2 space-y-8">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-900 pb-6">
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase italic">{t('nav.cart')}</h2>
          <span className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-600 tracking-[0.2em]">{items.length} units detected</span>
        </div>
        
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                key={item.id}
                className="group flex flex-col sm:flex-row items-center gap-6 rounded-2xl border border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950 p-5 transition-all hover:border-red-600/30"
              >
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>
                
                <div className="flex flex-1 flex-col justify-between py-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight italic">{item.name}</h3>
                      <p className="text-[9px] font-black text-red-600 uppercase tracking-widest mt-1 opacity-60">Serial: {item.id.slice(0, 8)}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-zinc-400 hover:text-red-500 transition-colors p-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 rounded-lg bg-zinc-100 dark:bg-zinc-900 p-1 border border-zinc-200 dark:border-zinc-800">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="flex h-7 w-7 items-center justify-center rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white hover:text-red-600 transition-colors border border-zinc-200 dark:border-zinc-700 shadow-sm"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-black text-zinc-900 dark:text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="flex h-7 w-7 items-center justify-center rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white hover:text-red-600 transition-colors border border-zinc-200 dark:border-zinc-700 shadow-sm"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="text-base font-black text-zinc-900 dark:text-white tracking-tighter">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Summary */}
      <div className="lg:col-span-1">
        <div className="sticky top-24 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-8 shadow-2xl shadow-zinc-200 dark:shadow-red-900/5 transition-all">
          <h2 className="mb-6 text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter italic">{t('common.total')} Manifest</h2>
          
          <div className="space-y-4 border-b border-zinc-100 dark:border-zinc-900 pb-8">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500 font-bold uppercase tracking-widest">Subtotal</span>
              <span className="text-zinc-900 dark:text-white font-black">{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500 font-bold uppercase tracking-widest">Logistics</span>
              <span className="text-red-600 font-black uppercase tracking-widest">Calculated</span>
            </div>
            <div className="flex justify-between pt-6">
              <span className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest">Grand Total</span>
              <span className="text-2xl font-black text-red-600 tracking-tighter">{formatPrice(total)}</span>
            </div>
          </div>
          
          <div className="mt-10 space-y-4">
            <Link
              to="/checkout"
              className="flex w-full items-center justify-center rounded-xl bg-zinc-900 dark:bg-red-600 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl hover:bg-black dark:hover:bg-red-500 active:scale-[0.98] transition-all"
            >
              {t('common.checkout')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              to="/"
              className="flex w-full items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900 py-4 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors border border-zinc-200 dark:border-zinc-800"
            >
              {t('common.back')} Catalog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
