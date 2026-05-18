import React, { Suspense, lazy, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import './lib/i18n';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));

function BackgroundMusic() {
  const [playing, setPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const toggle = () => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
      setPlaying(!playing);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-[100] flex items-center gap-3">
      <button 
        onClick={toggle}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-red-600 shadow-xl hover:scale-110 active:scale-95 transition-all"
      >
        {playing ? <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }}>🔊</motion.div> : "🔈"}
      </button>
      <audio 
        ref={audioRef} 
        loop 
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" 
      />
      {playing && (
        <span className="text-[10px] font-black uppercase tracking-widest text-red-600 animate-pulse">System Audio Active</span>
      )}
    </div>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-zinc-100 selection:bg-red-500/30 transition-colors duration-300">
      <BackgroundMusic />
      {/* Background Glow Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-5 dark:opacity-20 transition-opacity duration-700">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-zinc-900/10 dark:bg-red-600/50 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] -left-[5%] w-[30%] h-[30%] bg-zinc-200/50 dark:bg-zinc-100/10 rounded-full blur-[100px]" />
      </div>

      <Navbar />
      <main className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Suspense fallback={
          <div className="flex h-[60vh] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
          </div>
        }>
          {children}
        </Suspense>
      </main>
      
      {/* Footer Branding */}
      <footer className="relative border-t border-black dark:border-zinc-900 bg-white dark:bg-zinc-900/10 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-black dark:bg-red-600 font-black text-[10px] text-white">R</div>
            <span className="text-sm font-black italic tracking-widest text-black dark:text-white uppercase">ROBOTECH SYSTEMS</span>
          </div>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
            <a href="#" className="hover:text-black dark:hover:text-red-500 transition-colors">Documentation</a>
            <a href="#" className="hover:text-black dark:hover:text-red-500 transition-colors">Privacy Protocol</a>
            <a href="#" className="hover:text-black dark:hover:text-red-500 transition-colors">Global Support</a>
          </div>
          <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-600 uppercase tracking-widest">© 2024 ROBOTECH. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Layout>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
