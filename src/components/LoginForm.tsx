import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext.tsx';
import { Shield, Lock, User, KeyRound, AlertCircle } from 'lucide-react';

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

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-100 via-white to-slate-100 p-4 selection:bg-blue-900 selection:text-white">
      {/* Subtle Background Security Rings and Soft Light Accents */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-100/60 blur-3xl"></div>
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-amber-100/50 blur-3xl"></div>

      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-9 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.12)]">
        {/* Top Police Logo (Clean & Authentic, Police Commission Emblem Only, Transparent) */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-3 flex h-32 w-32 items-center justify-center transition duration-200 hover:scale-105">
            <img
              src={branding.policeLogo}
              alt="Police Commission Logo"
              className="h-full w-full object-contain filter drop-shadow-[0_8px_16px_rgba(15,23,42,0.15)]"
            />
          </div>

          {/* High-Contrast Dignified Titles in Amharic & English */}
          <h1 className="mt-1 text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-serif leading-tight">
            የጦር መሳሪያ ምዝገባ እና ማረጋገጫ ሲስተም
          </h1>
          <h2 className="mt-1 text-[11px] font-extrabold uppercase tracking-wider text-blue-900">
            Firearms Registration & Verification System
          </h2>
          <p className="mt-1.5 text-xs font-bold text-amber-800">
            {branding.commissionNameAm} • {branding.processNameAm}
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mt-5 flex items-center gap-2.5 rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs font-semibold text-rose-800 shadow-xs">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Professional Login Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              የተጠቃሚ ስም (Username)
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="የተጠቃሚ ስም (Username)"
                className="w-full rounded-xl border border-slate-300 bg-slate-50/80 py-2.5 pl-10 pr-3 text-sm font-medium text-slate-900 placeholder-slate-400 shadow-2xs transition focus:border-blue-700 focus:bg-white focus:outline-none focus:ring-3 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              የይለፍ ቃል (Password)
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="የይለፍ ቃልዎን ያስገቡ"
                className="w-full rounded-xl border border-slate-300 bg-slate-50/80 py-2.5 pl-10 pr-3 text-sm font-medium text-slate-900 placeholder-slate-400 shadow-2xs transition focus:border-blue-700 focus:bg-white focus:outline-none focus:ring-3 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Professional High-Authority Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 py-3.5 px-4 text-sm font-extrabold text-white shadow-md shadow-blue-950/20 transition-all duration-200 hover:from-blue-900 hover:to-slate-850 hover:shadow-lg active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer border border-blue-900/30"
          >
            <KeyRound className="h-4 w-4 text-amber-400" />
            <span>{isLoading ? 'በመግባት ላይ...' : 'ወደ ሲስተሙ ግባ (Sign In)'}</span>
          </button>
        </form>

        {/* Institutional Security Notice (የአድሚኑ እና የሀላፊዉ መረጃዎች ተደብቀዋል) */}
        <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-slate-50 border border-slate-200 py-2.5 px-3 text-xs font-semibold text-slate-700">
          <Shield className="h-4 w-4 text-blue-900 shrink-0" />
          <span>የቤኒሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን ደህንነቱ የተጠበቀ መግቢያ</span>
        </div>

        {/* Footer Attribution with crisp text */}
        <div className="mt-6 border-t border-slate-200 pt-4 text-center">
          <p className="text-[10px] text-slate-600 leading-tight">
            የተዘጋጀዉ በቤኒሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን ቴክኖሎጂ ማስፋፊያና መረጃ ማዕከል{' '}
            <span className="font-extrabold text-blue-950">(D.I BY)</span>
          </p>
          <p className="mt-1 text-[9px] text-slate-500 font-medium">
            Assosa, Benishangul Gumuz Regional State, Ethiopia
          </p>
        </div>
      </div>
    </div>
  );
};
