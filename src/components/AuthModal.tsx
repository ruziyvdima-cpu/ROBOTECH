import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User as UserIcon, AlertTriangle, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signIn, signInWithEmail, signUpWithEmail } = useAuth();
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLoginTab) {
        await signInWithEmail(email, password);
      } else {
        if (!name.trim()) {
          throw new Error("Iltimos, ismingizni kiriting / Please enter your name");
        }
        await signUpWithEmail(email, password, name);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      let uzMsg = err.message;
      if (err.code === 'auth/email-already-in-use') {
        uzMsg = "Bu email manzili allaqachon ro'yxatdan o'tgan! / Email already registered.";
      } else if (err.code === 'auth/invalid-credential') {
        uzMsg = "Email yoki parol noto'g'ri! / Invalid email or password.";
      } else if (err.code === 'auth/weak-password') {
        uzMsg = "Parol juda oddiy! (Kamida 6 ta belgi kiriting) / Password too weak.";
      } else if (err.code === 'auth/invalid-email') {
        uzMsg = "Email shakli noto'g'ri! / Invalid email format.";
      }
      setError(uzMsg || String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signIn();
      onClose();
    } catch (err: any) {
      setError("Google sign-in blocked by sandbox or browser. Write email & password instead! / Google login blocklandi. Email va Parol orqali kiring.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-8 shadow-2xl"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-850 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-black dark:bg-red-600 font-bold text-[10px] text-white">R</div>
            <span className="text-xs font-black tracking-[0.2em] text-zinc-400 dark:text-zinc-600 uppercase">ACCESS PROTOCOL</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:text-black dark:hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-2 p-1.5 bg-zinc-50 dark:bg-zinc-900 overflow-hidden rounded-2xl mb-8 border border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => { setIsLoginTab(true); setError(''); }}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${
              isLoginTab 
                ? 'bg-black text-white dark:bg-red-600 dark:text-white shadow-md' 
                : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Kirish (Log In)
          </button>
          <button
            type="button"
            onClick={() => { setIsLoginTab(false); setError(''); }}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${
              !isLoginTab 
                ? 'bg-black text-white dark:bg-red-600 dark:text-white shadow-md' 
                : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Ro'yxatdan o'tish (Register)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Field - Register Only */}
          {!isLoginTab && (
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-650 flex items-center gap-2">
                <UserIcon className="h-3 w-3 text-red-600" /> Ismingiz
              </label>
              <div className="flex items-center px-4 py-3.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl focus-within:border-red-600/50 transition-all">
                <input
                  type="text"
                  required
                  placeholder="Ismingizni kiriting"
                  className="w-full bg-transparent text-sm text-zinc-900 dark:text-white outline-none font-bold"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-650 flex items-center gap-2">
              <Mail className="h-3 w-3 text-red-600" /> Email Manzil
            </label>
            <div className="flex items-center px-4 py-3.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl focus-within:border-red-600/50 transition-all">
              <input
                type="email"
                required
                placeholder="misol@robotech.uz"
                className="w-full bg-transparent text-sm text-zinc-900 dark:text-white outline-none font-bold"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-650 flex items-center gap-2">
              <Lock className="h-3 w-3 text-red-600" /> Maxfiy Parol
            </label>
            <div className="flex items-center px-4 py-3.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl focus-within:border-red-600/50 transition-all">
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••"
                className="w-full bg-transparent text-sm text-zinc-900 dark:text-white outline-none font-bold tracking-widest"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 text-[10px] font-black text-red-600 uppercase flex gap-2.5 items-start mt-2"
              >
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
                <span className="leading-tight">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-zinc-900 hover:bg-black dark:bg-red-600 dark:hover:bg-red-500 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] transition-all cursor-pointer shadow-lg active:scale-[0.98] disabled:opacity-35"
          >
            {loading ? 'Tekshirilmoqda...' : isLoginTab ? 'Tizimga Kirish' : "Ro'yxatdan O'tish"}
          </button>
        </form>

        {/* Separator */}
        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-zinc-100 dark:border-zinc-900"></div>
          <span className="flex-shrink mx-4 text-[9px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-600">Yoki / Or</span>
          <div className="flex-grow border-t border-zinc-100 dark:border-zinc-900"></div>
        </div>

        {/* Google Provider Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-805 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] transition-all cursor-pointer active:scale-[0.98]"
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Google Orqali Kirish
        </button>

        <div className="mt-8 flex items-center justify-center gap-2 text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
          <ShieldCheck className="h-3.5 w-3.5 text-zinc-400 dark:text-red-500 shrink-0" />
          End-to-End Encryption Enabled
        </div>
      </motion.div>
    </div>
  );
}
