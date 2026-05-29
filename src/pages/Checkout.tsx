import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { formatPrice } from '../lib/utils';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Country, City } from 'country-state-city';
import { MapPin, Phone, Globe, Home, CheckCircle2, Search } from 'lucide-react';
import { motion } from 'motion/react';

export default function Checkout() {
  const { t } = useTranslation();
  const { items, total, clearCart } = useCart();
  const { user, signInGuest } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      signInGuest().catch(err => console.error("Auto guest sign-in on checkout failed:", err));
    }
  }, [user, signInGuest]);

  const [formData, setFormData] = useState({
    country: '',
    city: '',
    address: '',
    phone: '',
    dialCode: '+998', // Default for UZ
    telegram: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [citySearch, setCitySearch] = useState('');

  const countries = Country.getAllCountries().filter(c => 
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );
  
  const selectedCountryObj = Country.getAllCountries().find(c => c.isoCode === formData.country);
  const cities = formData.country ? City.getCitiesOfCountry(formData.country).filter(c =>
    c.name.toLowerCase().includes(citySearch.toLowerCase())
  ) : [];

  const handleCountrySelect = (isoCode: string) => {
    setFormData(prev => ({ ...prev, country: isoCode, city: '' }));
    setCountrySearch('');
  };

  const handleCitySelect = (cityName: string) => {
    setFormData(prev => ({ ...prev, city: cityName }));
    setCitySearch('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    let activeUser = user || auth.currentUser;
    if (!activeUser) {
      try {
        await signInGuest();
        activeUser = auth.currentUser;
      } catch (err) {
        alert("Buyurtma berish uchun tizimga ulanishda xatolik yuz berdi. Iltimos, qaytadan urining.");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      // Sanitize items to ensure no undefined values
      const sanitizedItems = items.map(item => ({
        id: String(item.id || ''),
        name: String(item.name || 'Unknown Item'),
        price: Number(item.price) || 0,
        image: String(item.image || ''),
        quantity: Number(item.quantity) || 1
      }));

      if (!formData.telegram.trim()) {
        alert("Iltimos, Telegram raqamingizni yoki username-ingizni kiriting! (Bu maydon majburiy / Mandatory field)");
        setIsSubmitting(false);
        return;
      }

      const customerInfo = {
        phone: `${formData.dialCode}${formData.phone}`.trim(),
        telegram: String(formData.telegram || '').trim(),
        country: String(selectedCountryObj?.name || formData.country || ''),
        city: String(formData.city || ''),
        address: String(formData.address || '')
      };

      const orderRef = await addDoc(collection(db, 'orders'), {
        userId: activeUser?.uid || 'guest_user',
        items: sanitizedItems,
        total: Number(total) || 0,
        customerInfo,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // Send Telegram Notification
      try {
        await fetch('/api/notify-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderRef.id,
            customerInfo,
            items: sanitizedItems.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
            total: Number(total) || 0
          })
        });
      } catch (err) {
        console.error('Failed to notify telegram:', err);
      }
      
      setOrderSuccess(true);
      clearCart();
      setTimeout(() => navigate('/'), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'orders');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-8 text-center bg-white dark:bg-zinc-950 min-h-[60vh] rounded-3xl border border-zinc-100 dark:border-zinc-900 shadow-xl">
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          className="rounded-full bg-red-50 dark:bg-red-900/10 p-10 border border-red-100 dark:border-red-900/30"
        >
          <CheckCircle2 className="h-20 w-20 text-red-600" />
        </motion.div>
        <div className="space-y-4 px-6 md:px-12">
          <h2 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white uppercase italic tracking-tighter leading-tight">
            Buyurtmangiz qabul qilindi, o'zimiz aloqaga chiqamiz
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 font-bold uppercase text-[10px] tracking-[0.3em] animate-pulse">Redirecting to System Root...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <h2 className="text-5xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase italic">
          Logistics <span className="text-red-600">Manifest</span>
        </h2>
        <p className="text-xs font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-600">Protocol: Secure Data Transmission</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-10 group">
          <div className="space-y-8 rounded-3xl border border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950 p-10 shadow-2xl shadow-zinc-100 dark:shadow-red-900/5 transition-all hover:border-red-600/30">
            {/* Phone Section */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600">
                <Phone className="h-3 w-3 text-red-600" />
                Contact Frequency
              </label>
              <div className="flex bg-zinc-50 dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 focus-within:border-red-600 transition-all">
                <div className="relative group/dial">
                  <select 
                    className="bg-zinc-100 dark:bg-zinc-800 px-5 py-4 text-xs font-black border-r border-zinc-200 dark:border-zinc-700 outline-none text-zinc-900 dark:text-white appearance-none cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors pr-10"
                    value={formData.dialCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, dialCode: e.target.value }))}
                  >
                    <option value="+998">UZ +998</option>
                    <option value="+1">US +1</option>
                    <option value="+7">RU +7</option>
                    <option value="+44">UK +44</option>
                    <option value="+49">DE +49</option>
                    <option value="+90">TR +90</option>
                    <option value="+971">AE +971</option>
                  </select>
                  <Globe className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-400 dark:text-zinc-600 pointer-events-none" />
                </div>
                <input
                  type="tel"
                  required
                  placeholder="00 000 00 00"
                  className="flex-1 bg-transparent px-6 py-4 text-sm text-zinc-900 dark:text-white outline-none font-black tracking-widest placeholder:opacity-30"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>

            {/* Telegram Section */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-650">
                <span className="text-md leading-none">✈️</span>
                Telegram Raqam yoki Username
              </label>
              <div className="flex bg-zinc-50 dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 focus-within:border-red-600 transition-all">
                <input
                  type="text"
                  required
                  placeholder="+998901234567 yoki @username"
                  className="flex-1 bg-transparent px-6 py-4 text-sm text-zinc-900 dark:text-white outline-none font-black tracking-widest placeholder:opacity-30"
                  value={formData.telegram}
                  onChange={(e) => setFormData(prev => ({ ...prev, telegram: e.target.value }))}
                />
              </div>
              <p className="text-[10px] font-black text-red-600 tracking-wider pl-1 uppercase">
                * Majburiy maydon, kiritilmasa buyurtma olinmaydi!
              </p>
            </div>

            {/* Location Section */}
            <div className="space-y-8">
              {/* Country */}
              <div className="relative space-y-3">
                <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600">
                  <Globe className="h-3 w-3 text-red-600" />
                  Source Region
                </label>
                <div className="relative bg-zinc-50 dark:bg-zinc-900 rounded-2xl flex items-center px-5 border border-zinc-100 dark:border-zinc-800 focus-within:border-red-600 transition-all">
                  <Search className="h-4 w-4 text-zinc-400 dark:text-zinc-600" />
                  <input
                    type="text"
                    placeholder="Identify country..."
                    className="w-full bg-transparent p-4 text-sm text-zinc-900 dark:text-white outline-none font-bold italic placeholder:opacity-30"
                    value={countrySearch || (selectedCountryObj?.name || '')}
                    onChange={(e) => {
                      setCountrySearch(e.target.value);
                      if (!e.target.value) setFormData(prev => ({ ...prev, country: '' }));
                    }}
                  />
                  {countrySearch && (
                    <div className="absolute left-0 right-0 z-20 mt-[320px] max-h-60 overflow-y-auto rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl p-2 no-scrollbar">
                      {countries.map(c => (
                        <button
                          key={c.isoCode}
                          type="button"
                          className="w-full px-5 py-3 text-left text-xs font-black uppercase tracking-tight hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-900 dark:text-white transition-all rounded-xl"
                          onClick={() => handleCountrySelect(c.isoCode)}
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* City */}
              <div className="relative space-y-3">
                <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600">
                  <MapPin className="h-3 w-3 text-red-600" />
                  Logistics Hub
                </label>
                <div className="relative bg-zinc-50 dark:bg-zinc-900 rounded-2xl flex items-center px-5 border border-zinc-100 dark:border-zinc-800 focus-within:border-red-600 transition-all">
                  <Search className="h-4 w-4 text-zinc-400 dark:text-zinc-600" />
                  <input
                    type="text"
                    disabled={!formData.country}
                    placeholder={formData.country ? "Identify city..." : "Awaiting Country ID"}
                    className="w-full bg-transparent p-4 text-sm text-zinc-900 dark:text-white outline-none disabled:opacity-20 font-bold italic placeholder:opacity-30"
                    value={citySearch || formData.city}
                    onChange={(e) => setCitySearch(e.target.value)}
                  />
                  {citySearch && cities.length > 0 && (
                    <div className="absolute left-0 right-0 z-20 mt-[320px] max-h-60 overflow-y-auto rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl p-2 no-scrollbar">
                      {cities.map(c => (
                        <button
                          key={c.name}
                          type="button"
                          className="w-full px-5 py-3 text-left text-xs font-black uppercase tracking-tight hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-900 dark:text-white transition-all rounded-xl"
                          onClick={() => handleCitySelect(c.name)}
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600">
                <Home className="h-3 w-3 text-red-600" />
                Endpoint Address
              </label>
              <textarea
                required
                rows={4}
                placeholder="Sector, Block, Physical Coordinates..."
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-6 py-4 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-red-600 transition-all resize-none font-bold placeholder:opacity-30"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Summary Side */}
        <div className="space-y-8">
          <div className="rounded-3xl border border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950 p-10 shadow-sm transition-all sticky top-24">
            <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase italic tracking-tighter mb-8 pb-4 border-b border-zinc-100 dark:border-zinc-900">Summary Manifest</h3>
            <div className="space-y-4 mb-10">
              {items.map(item => (
                <div key={item.id} className="flex justify-between items-center text-[11px] font-black uppercase tracking-tight">
                  <span className="text-zinc-500 dark:text-zinc-400 italic line-clamp-1 flex-1">{item.name}</span>
                  <span className="text-red-600 mx-4 shrink-0">x{item.quantity}</span>
                  <span className="text-zinc-900 dark:text-white shrink-0">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            
            <div className="space-y-4 pt-8 border-t border-zinc-100 dark:border-zinc-900">
              <div className="flex justify-between text-xs font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600">
                <span>Infrastructure total</span>
                <span className="text-zinc-900 dark:text-white">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between items-end pt-4">
                <span className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em]">Final Charge</span>
                <span className="text-4xl font-black text-red-600 tracking-tighter italic">{formatPrice(total)}</span>
              </div>
            </div>

            <div className="mt-12 space-y-4">
              <button
                type="submit"
                disabled={isSubmitting || !formData.city || !formData.country}
                className="w-full bg-zinc-900 dark:bg-red-600 hover:bg-black dark:hover:bg-red-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-red-900/10 active:scale-[0.98] transition-all uppercase tracking-[0.3em] text-[10px] disabled:opacity-20"
              >
                {isSubmitting ? 'Transmitting Data...' : 'Authorize Transaction'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/cart')}
                className="w-full bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-400 dark:text-zinc-600 font-black py-4 rounded-2xl transition-all uppercase tracking-[0.2em] text-[10px]"
              >
                Return to Buffer
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
