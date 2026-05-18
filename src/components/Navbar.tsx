import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Moon, Sun, Search, User, LogOut, Menu, X, Globe, MapPin, ArrowLeft } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { Country, City } from 'country-state-city';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { items } = useCart();
  const { user, userData, isAdmin, signIn, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleBack = () => {
    navigate(-1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    navigate(`/?${params.toString()}`);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-black bg-white dark:border-zinc-900/50 dark:bg-black/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-12">
          {/* Logo & Back Button */}
          <div className="flex items-center gap-4">
            {!isHome && (
              <button
                onClick={handleBack}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black border border-black hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:border-zinc-800 transition-all active:scale-90"
                title="Back"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <Link to="/" className="flex items-center gap-3 shrink-0 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black dark:bg-red-600 font-bold text-white shadow-xl group-hover:scale-110 transition-transform">R</div>
              <span className="text-xl font-black italic tracking-tighter text-black dark:text-white uppercase">ROBOTECH</span>
            </Link>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden flex-1 items-center md:flex max-w-lg bg-white dark:bg-zinc-900/50 rounded-2xl p-1.5 border border-black dark:border-zinc-800 focus-within:ring-1 focus-within:ring-black/10 dark:focus-within:border-red-600/50 transition-all">
            <div className="relative flex-1 flex items-center px-4">
              <Search className="h-4 w-4 text-zinc-400 absolute left-4" />
              <input
                type="text"
                placeholder={t('common.search')}
                className="h-10 w-full bg-transparent pl-8 pr-4 py-1 text-sm text-black dark:text-white outline-none placeholder:text-zinc-400 font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <button type="submit" className="bg-black dark:bg-red-600 hover:bg-zinc-800 dark:hover:bg-red-500 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all">
              Execute
            </button>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-6">
            {/* Language Selection */}
            <div className="hidden lg:flex gap-4 text-[9px] font-black tracking-[0.2em]">
              {['uz', 'en', 'ru'].map((lng) => (
                <button 
                  key={lng}
                  onClick={() => changeLanguage(lng)} 
                  className={cn(
                    "transition-all uppercase py-1 px-2 rounded-md",
                    i18n.language === lng 
                      ? "text-white bg-black dark:text-red-500 dark:bg-red-500/5 dark:border dark:border-red-500/20" 
                      : "text-zinc-400 hover:text-black dark:hover:text-white"
                  )}
                >
                  {lng === 'uz' ? 'UZB' : lng === 'en' ? 'ENG' : 'RUS'}
                </button>
              ))}
            </div>

            <div className="h-4 w-[1px] bg-black dark:bg-zinc-800 hidden md:block" />

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 text-zinc-400 hover:text-black dark:hover:text-red-500 transition-colors"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-zinc-900 text-black dark:text-zinc-500 hover:bg-zinc-50 dark:hover:text-red-500 border border-black dark:border-zinc-800 transition-all hover:scale-105"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-black dark:bg-red-600 text-[9px] font-black text-white shadow-lg border-2 border-white dark:border-black">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Profile */}
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-1 rounded-xl border border-black dark:border-zinc-800">
                  <div className="h-8 w-8 rounded-lg bg-black dark:bg-red-600 flex items-center justify-center text-[10px] font-black text-white uppercase italic">
                    {userData?.name?.slice(0, 2) || user.email?.slice(0, 2)}
                  </div>
                  <button 
                    onClick={logout}
                    className="p-2 text-zinc-400 hover:text-black dark:hover:text-red-500 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={signIn}
                className="flex items-center gap-2 rounded-xl bg-black dark:bg-zinc-100 px-5 py-2.5 text-[10px] font-black text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white transition-all uppercase tracking-widest sm:flex"
              >
                Launch Protocol
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
