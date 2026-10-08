import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext.tsx';
import { Shield, Lock, User, KeyRound, AlertCircle, Sparkles } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const { login, branding } = useSystem();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = login(username, password);
      if (!res.success) {
        setErrorMessage(res.message);
      }
      setIsLoading(false);
    }, 300);
  };

  // Quick autofill buttons for evaluation ease
  const handleQuickLogin = (role: 'admin' | 'official') => {
    if (role === 'admin') {
      setUsername('admin');
      setPassword('Admin@1234');
    } else {
      setUsername('admin2026');
      setPassword('Admin@2026');
    }
    setErrorMessage(null);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-950 p-4 selection:bg-amber-500 selection:text-slate-950">
      {/* Background radial aura glow */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl"></div>
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl"></div>

      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl backdrop-blur-md">
        {/* Top Flags & Police Crest */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-4 mb-2">
            <div className="h-7 w-12 overflow-hidden rounded border border-amber-400/40 shadow">
              <img src={branding.bgrsFlag} alt="BGRS Flag" className="h-full w-full object-cover" />
            </div>
            
            {/* Main Police Commission Emblem Logo */}
            <div className="relative h-24 w-24 drop-shadow-2xl transition hover:scale-105">
              <img
                src={branding.policeLogo}
                alt="Police Logo"
                className="h-full w-full object-contain"
              />
            </div>

            <div className="h-7 w-12 overflow-hidden rounded border border-amber-400/40 shadow">
              <img src={branding.ethiopiaFlag} alt="Ethiopian Flag" className="h-full w-full object-cover" />
            </div>
          </div>

          {/* Title in Amharic & English */}
          <h1 className="mt-2 text-xl font-black text-amber-400 tracking-wide font-serif">
            የጦር መሳሪያ ምዝገባ እና ማረጋገጫ ሲስተም
          </h1>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Firearms Registration & Verification System
          </h2>
          <p className="mt-1 text-[11px] font-medium text-amber-200/80">
            {branding.commissionNameAm} • {branding.processNameAm}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-5 flex items-center gap-2 rounded-xl border border-rose-500/50 bg-rose-500/15 p-3 text-xs font-medium text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              የተጠቃሚ ስም (Username)
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin ወይም admin2026"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              የይለፍ ቃል (Password)
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 py-3 text-sm font-extrabold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:from-amber-400 hover:to-amber-300 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            <KeyRound className="h-4 w-4" />
            {isLoading ? 'በመግባት ላይ...' : 'ግባ (Login)'}
          </button>
        </form>

        {/* Quick Credentials Switcher */}
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-amber-400 mb-2">
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> ለመሞከር ፈጣን መግቢያ
            </span>
            <span className="text-slate-400 text-[10px]">1-ክሊክ ምረጥ</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="flex flex-col items-start rounded-xl border border-slate-700 bg-slate-800/80 p-2 text-left transition hover:border-amber-500 hover:bg-slate-800 cursor-pointer"
            >
              <span className="text-[11px] font-extrabold text-amber-300">አድሚን (Admin)</span>
              <span className="text-[9px] font-mono text-slate-400">admin • Admin@1234</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('official')}
              className="flex flex-col items-start rounded-xl border border-slate-700 bg-slate-800/80 p-2 text-left transition hover:border-amber-500 hover:bg-slate-800 cursor-pointer"
            >
              <span className="text-[11px] font-extrabold text-emerald-300">ሃላፊ / አጽዳቂ</span>
              <span className="text-[9px] font-mono text-slate-400">admin2026 • Admin@2026</span>
            </button>
          </div>
        </div>

        {/* Requested Footer Attribution */}
        <div className="mt-6 border-t border-slate-800 pt-4 text-center">
          <p className="text-[10px] text-slate-400 leading-tight">
            የተዘጋጀዉ በቤኒሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን ቴክኖሎጂ ማስፋፊያና መረጃ ማዕከል <span className="font-bold text-amber-400">(D.I BY)</span>
          </p>
          <p className="mt-1 text-[9px] text-slate-500">
            Assosa, Benishangul Gumuz Regional State, Ethiopia
          </p>
        </div>
      </div>
    </div>
  );
};
