import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { seedProducts } from '../lib/seed';
import { formatPrice, cn } from '../lib/utils';
import { Search, ShoppingCart, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Product {
  id: string;
  name_uz: string;
  name_en: string;
  name_ru: string;
  description_uz: string;
  description_en: string;
  description_ru: string;
  price: number;
  image: string;
  category: string;
  stock: number;
}

export default function Home() {
  const { t, i18n } = useTranslation();
  const { addToCart } = useCart();
  const location = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const { user, isAdmin } = useAuth();

  // Read search params from URL
  const queryParams = new URLSearchParams(location.search);
  const searchTerm = queryParams.get('q') || '';

  useEffect(() => {
    if (user) {
      seedProducts(user);
    }
    const q = query(collection(db, 'products'), orderBy('updatedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
    });
    return () => unsubscribe();
  }, [user]);

  const filteredProducts = products.filter(p => {
    const name = (p[`name_${i18n.language}` as keyof Product] as string)?.toLowerCase() || '';
    return name.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-12">
      {/* Search Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center bg-white dark:bg-zinc-900/50 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
      >
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter italic uppercase">Robotics manifest</h1>
          {searchTerm && (
            <p className="text-[10px] text-zinc-500 mt-2 uppercase tracking-[0.2em] font-black">
              Scan Results: <span className="text-red-600">"{searchTerm}"</span>
            </p>
          )}
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-[10px] font-black uppercase tracking-widest text-zinc-500 border border-zinc-200 dark:border-zinc-800">Grid Interface</div>
        </div>
      </motion.div>

      {/* Grid or Empty State */}
      {loading ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-[400px] animate-pulse rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-24 w-24 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-8 border border-zinc-200 dark:border-zinc-800">
            <ShoppingBag className="h-10 w-10 text-zinc-400 dark:text-zinc-600" />
          </div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter italic">No Inventory Detected</h2>
          <p className="text-zinc-500 max-w-md mt-4 text-sm font-medium">The system manifest is currently empty. Initializing logistics stream...</p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.div 
            layout
            className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filteredProducts.map((p, index) => {
              const name = p[`name_${i18n.language}` as keyof Product] as string;
              const desc = p[`description_${i18n.language}` as keyof Product] as string;
              
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ 
                    duration: 0.6, 
                    delay: (index % 4) * 0.1,
                    ease: [0.215, 0.61, 0.355, 1] 
                  }}
                  key={p.id}
                  className="group flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 transition-all hover:border-zinc-900 dark:hover:border-red-600/50 cursor-pointer overflow-hidden shadow-sm hover:shadow-2xl"
                >
                  <div className="aspect-square bg-zinc-50 dark:bg-zinc-800 rounded-xl mb-6 flex items-center justify-center overflow-hidden border border-zinc-200 dark:border-zinc-700">
                    <img
                      src={p.image}
                      alt={name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  
                  <div className="flex flex-col flex-1">
                    <span className="text-[9px] font-black uppercase mb-2 tracking-[0.2em] text-red-600 opacity-60">
                      {p.category}
                    </span>
                    <h3 className="text-zinc-900 dark:text-white font-black text-sm mb-2 line-clamp-1 uppercase tracking-tight italic">{name}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 line-clamp-2 leading-relaxed font-medium">{desc}</p>
                    
                    <div className="mt-auto flex justify-between items-center">
                      <span className="text-lg font-black text-zinc-900 dark:text-white tracking-tighter">{formatPrice(p.price)}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart({ id: p.id, name, price: p.price, image: p.image });
                        }}
                        disabled={p.stock === 0}
                        className="p-3 bg-zinc-900 dark:bg-red-600 text-white rounded-xl hover:bg-black dark:hover:bg-red-500 shadow-xl transition-all disabled:opacity-20 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
