import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext.tsx';
import { 
  Shield, 
  Lock, 
  KeyRound, 
  User, 
  Check, 
  AlertCircle, 
  AlertTriangle, 
  RotateCcw, 
  Loader2, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Fingerprint,
  CheckCircle2,
  LockKeyhole
} from 'lucide-react';

export const SecuritySettings: React.FC = () => {
  const { 
    user, 
    credentials, 
    updateAdminCredentials, 
    updateOfficialCredentials, 
    resetCredentialsToDefault 
  } = useSystem();

  // Admin Form State
  const [adminUsername, setAdminUsername] = useState(credentials.admin.username);
  const [adminCurrentPass, setAdminCurrentPass] = useState('');
  const [adminNewPass, setAdminNewPass] = useState('');
  const [adminConfirmPass, setAdminConfirmPass] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminMessage, setAdminMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Official Form State
  const [officialUsername, setOfficialUsername] = useState(credentials.official.username);
  const [officialFullName, setOfficialFullName] = useState(credentials.official.fullName);
  const [officialTitle, setOfficialTitle] = useState(credentials.official.title);
  const [officialNewPass, setOfficialNewPass] = useState('');
  const [officialConfirmPass, setOfficialConfirmPass] = useState('');
  const [showOfficialPass, setShowOfficialPass] = useState(false);
  const [officialLoading, setOfficialLoading] = useState(false);
  const [officialMessage, setOfficialMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Reset Modal
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const isAdmin = user?.role === 'ADMIN';

  // Calculate password strength
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-700' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) return { score: 1, label: 'ደካማ (Weak)', color: 'bg-rose-500' };
    if (score <= 3) return { score: 2, label: 'መካከለኛ (Medium)', color: 'bg-amber-500' };
    return { score: 3, label: 'እጅግ ጠንካራ (Strong)', color: 'bg-emerald-500' };
  };

  const adminPassStrength = getPasswordStrength(adminNewPass);
  const officialPassStrength = getPasswordStrength(officialNewPass);

  // Handle Admin Credentials Update
  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminMessage(null);

    if (!adminUsername.trim()) {
      setAdminMessage({ type: 'error', text: 'እባክዎ ትክክለኛ የአድሚን የተጠቃሚ ስም (Username) ያስገቡ!' });
      return;
    }

    if (!adminCurrentPass) {
      setAdminMessage({ type: 'error', text: 'ለውጡን ለማስቀመጥ አሁን የሚጠቀሙበትን የይለፍ ቃል (Current Password) ማስገባት ግዴታ ነው!' });
      return;
    }

    if (adminNewPass) {
      if (adminNewPass.length < 6) {
        setAdminMessage({ type: 'error', text: 'አዲሱ የይለፍ ቃል ቢያንስ 6 ፊደላት ወይም ቁጥሮች ሊኖሩት ይገባል!' });
        return;
      }
      if (adminNewPass !== adminConfirmPass) {
        setAdminMessage({ type: 'error', text: 'አዲሱ የይለፍ ቃል እና ማረጋገጫው አይመሳሰሉም!' });
        return;
      }
    }

    setAdminLoading(true);
    try {
      const res = await updateAdminCredentials(
        adminUsername,
        adminCurrentPass,
        adminNewPass || undefined
      );

      if (res.success) {
        setAdminMessage({ type: 'success', text: res.message });
        setAdminCurrentPass('');
        setAdminNewPass('');
        setAdminConfirmPass('');
      } else {
        setAdminMessage({ type: 'error', text: res.message });
      }
    } catch {
      setAdminMessage({ type: 'error', text: 'የአድሚን መረጃ ሲቀየር ስህተት ተፈጥሯል፤ እባክዎ እንደገና ይሞክሩ፡፡' });
    } finally {
      setAdminLoading(false);
    }
  };

  // Handle Official Credentials Update
  const handleUpdateOfficial = async (e: React.FormEvent) => {
    e.preventDefault();
    setOfficialMessage(null);

    if (!officialUsername.trim()) {
      setOfficialMessage({ type: 'error', text: 'እባክዎ የሃላፊውን ትክክለኛ የተጠቃሚ ስም (Username) ያስገቡ!' });
      return;
    }

    if (officialNewPass) {
      if (officialNewPass.length < 6) {
        setOfficialMessage({ type: 'error', text: 'አዲሱ የይለፍ ቃል ቢያንስ 6 ፊደላት ወይም ቁጥሮች ሊኖሩት ይገባል!' });
        return;
      }
      if (officialNewPass !== officialConfirmPass) {
        setOfficialMessage({ type: 'error', text: 'የተረጋገጠው የይለፍ ቃል አይመሳሰልም!' });
        return;
      }
    }

    setOfficialLoading(true);
    try {
      const res = await updateOfficialCredentials(
        officialUsername,
        officialNewPass || undefined,
        officialFullName,
        officialTitle
      );

      if (res.success) {
        setOfficialMessage({ type: 'success', text: res.message });
        setOfficialNewPass('');
        setOfficialConfirmPass('');
      } else {
        setOfficialMessage({ type: 'error', text: res.message });
      }
    } catch {
      setOfficialMessage({ type: 'error', text: 'የሃላፊው መረጃ ሲቀየር ስህተት ተፈጥሯል፤ እባክዎ እንደገና ይሞክሩ፡፡' });
    } finally {
      setOfficialLoading(false);
    }
  };

  // Handle Factory Reset
  const handleResetDefaults = async () => {
    if (!confirm('ሁሉንም የተጠቃሚ ስሞች እና የይለፍ ቃሎች ወደ ነባሪው የመነሻ መረጃ (admin / Admin@1234 እና admin2026 / Admin@2026) መመለስ ይፈልጋሉ?')) {
      return;
    }
    setIsResetting(true);
    try {
      const res = await resetCredentialsToDefault();
      setResetMessage(res.message);
      setAdminUsername('admin');
      setOfficialUsername('admin2026');
      setOfficialFullName('ኮማንደር መንግስቱ በቀለ');
      setOfficialTitle('የወንጀል መከላከል የስራ ሂደት ሃላፊ');
      setTimeout(() => setResetMessage(null), 5000);
    } catch {
      alert('የይለፍ ቃል ዳግም ማስጀመር አልተሳካም፡፡');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Non-Admin Notice */}
      {!isAdmin && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs font-semibold text-amber-300 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-400" />
          <span>
            ማሳሰቢያ፡ የተጠቃሚ ስሞችን እና የይለፍ ቃሎችን መቀየር የሚችለው <b>ዋናው የመረጃ እና ምዝገባ አድሚን (Super Admin)</b> ብቻ ነው፡፡
          </span>
        </div>
      )}

      {/* Global Reset Notification */}
      {resetMessage && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/15 p-4 text-xs font-bold text-emerald-300 flex items-center gap-2.5">
          <Check className="h-5 w-5 text-emerald-400" />
          <span>{resetMessage}</span>
        </div>
      )}

      {/* Grid: Admin Credentials Card & Official Credentials Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ========================================================= */}
        {/* CARD 1: MAIN ADMIN USERNAME & PASSWORD                    */}
        {/* ========================================================= */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white font-serif">
                    1. የዋና አድሚን መለያ እና የይለፍ ቃል (Admin Account)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    አድሚኑ የራሱን የተጠቃሚ ስም እና የይለፍ ቃል ይቀይራል
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30">
                ዋና አድሚን
              </span>
            </div>

            {/* Current Account Details Tag */}
            <div className="mb-4 rounded-xl bg-slate-950 p-3 border border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">አሁን ያለው የአድሚን ዩዘርኔም፡</span>
              <span className="font-mono font-bold text-amber-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-700">
                {credentials.admin.username}
              </span>
            </div>

            {adminMessage && (
              <div className={`mb-4 flex items-center gap-2 rounded-xl p-3 text-xs font-bold border ${
                adminMessage.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
              }`}>
                {adminMessage.type === 'success' ? (
                  <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                )}
                <span>{adminMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdateAdmin} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  አዲስ የአድሚን የተጠቃሚ ስም (New Username) *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    disabled={!isAdmin}
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-white focus:border-amber-500 focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1 flex items-center justify-between">
                  <span>አሁን የሚጠቀሙበት የይለፍ ቃል (Current Password) *</span>
                  <span className="text-[10px] text-amber-400">ለደህንነት ማረጋገጫ</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type={showAdminPass ? 'text' : 'password'}
                    required
                    disabled={!isAdmin}
                    value={adminCurrentPass}
                    onChange={(e) => setAdminCurrentPass(e.target.value)}
                    placeholder="አሁን ያለዎትን የይለፍ ቃል ያስገቡ"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-10 text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPass(!showAdminPass)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showAdminPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  አዲስ የይለፍ ቃል (New Password - ባዶ ከተተወ አይቀየርም)
                </label>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type={showAdminPass ? 'text' : 'password'}
                    disabled={!isAdmin}
                    value={adminNewPass}
                    onChange={(e) => setAdminNewPass(e.target.value)}
                    placeholder="አዲስ የይለፍ ቃል (ቢያንስ 6 ፊደላት)"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none disabled:opacity-50"
                  />
                </div>
                {adminNewPass && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-slate-800 overflow-hidden">
                      <div className={`h-full ${adminPassStrength.color}`} style={{ width: `${(adminPassStrength.score / 3) * 100}%` }}></div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">{adminPassStrength.label}</span>
                  </div>
                )}
              </div>

              {adminNewPass && (
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    አዲሱን የይለፍ ቃል ያረጋግጡ (Confirm New Password) *
                  </label>
                  <div className="relative">
                    <LockKeyhole className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type={showAdminPass ? 'text' : 'password'}
                      required
                      disabled={!isAdmin}
                      value={adminConfirmPass}
                      onChange={(e) => setAdminConfirmPass(e.target.value)}
                      placeholder="አዲሱን የይለፍ ቃል ደግመው ያስገቡ"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none disabled:opacity-50"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={adminLoading || !isAdmin}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-xs font-black text-slate-950 hover:bg-amber-400 transition disabled:opacity-50 cursor-pointer shadow-md"
              >
                {adminLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                <span>የአድሚን መረጃዎችን አድስ (Save Admin Changes)</span>
              </button>
            </form>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CARD 2: OFFICIAL / APPROVER USERNAME & PASSWORD           */}
        {/* ========================================================= */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white font-serif">
                    2. የስራ ሂደት ሃላፊ መለያ እና የይለፍ ቃል (Official Account)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    አድሚኑ የሃላፊውን የተጠቃሚ ስም እና የይለፍ ቃል ይቀይራል
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-500/30">
                የስራ ሂደት ሃላፊ
              </span>
            </div>

            {/* Current Account Details Tag */}
            <div className="mb-4 rounded-xl bg-slate-950 p-3 border border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">አሁን ያለው የሃላፊው ዩዘርኔም፡</span>
              <span className="font-mono font-bold text-blue-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-700">
                {credentials.official.username}
              </span>
            </div>

            {officialMessage && (
              <div className={`mb-4 flex items-center gap-2 rounded-xl p-3 text-xs font-bold border ${
                officialMessage.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
              }`}>
                {officialMessage.type === 'success' ? (
                  <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                )}
                <span>{officialMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdateOfficial} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  የሃላፊው የተጠቃሚ ስም (Official Username) *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    disabled={!isAdmin}
                    value={officialUsername}
                    onChange={(e) => setOfficialUsername(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-white focus:border-blue-500 focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    የሃላፊው ሙሉ ስም (Full Name)
                  </label>
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={officialFullName}
                    onChange={(e) => setOfficialFullName(e.target.value)}
                    placeholder="ለምሳሌ፡ ኮማንደር መንግስቱ በቀለ"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    የስራ ማዕረግ (Title / Role)
                  </label>
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={officialTitle}
                    onChange={(e) => setOfficialTitle(e.target.value)}
                    placeholder="ለምሳሌ፡ የወንጀል መከላከል የስራ ሂደት ሃላፊ"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  አዲስ የሃላፊው የይለፍ ቃል (New Password - ባዶ ከተተወ አይቀየርም)
                </label>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type={showOfficialPass ? 'text' : 'password'}
                    disabled={!isAdmin}
                    value={officialNewPass}
                    onChange={(e) => setOfficialNewPass(e.target.value)}
                    placeholder="አዲስ የይለፍ ቃል ለሃላፊው ይፍጠሩ"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-10 text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOfficialPass(!showOfficialPass)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showOfficialPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {officialNewPass && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-slate-800 overflow-hidden">
                      <div className={`h-full ${officialPassStrength.color}`} style={{ width: `${(officialPassStrength.score / 3) * 100}%` }}></div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">{officialPassStrength.label}</span>
                  </div>
                )}
              </div>

              {officialNewPass && (
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    የተፈጠረውን የይለፍ ቃል ያረጋግጡ (Confirm Password) *
                  </label>
                  <div className="relative">
                    <LockKeyhole className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type={showOfficialPass ? 'text' : 'password'}
                      required
                      disabled={!isAdmin}
                      value={officialConfirmPass}
                      onChange={(e) => setOfficialConfirmPass(e.target.value)}
                      placeholder="የሃላፊውን የይለፍ ቃል ደግመው ያስገቡ"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={officialLoading || !isAdmin}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-black text-white hover:bg-blue-500 transition disabled:opacity-50 cursor-pointer shadow-md"
              >
                {officialLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                <span>የሃላፊውን መረጃዎች አድስ (Save Official Changes)</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. ANTI-HACK & HARDENING ARCHITECTURE DASHBOARD           */}
      {/* ========================================================= */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
        <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3 mb-5">
          <Shield className="h-6 w-6 text-emerald-400" />
          <div>
            <h3 className="text-base font-black text-white font-serif">
              የሲስተም ደህንነት እና ፀረ-ጥቃት ጋሻ (Anti-Hack & System Hardening Status)
            </h3>
            <p className="text-xs text-slate-400">
              ይህ ሲስተም በማንም ሰው ወይም ጠላፊ (Hacker) እንዳይደፈር የተተገበሩ ቴክኒካዊ ጥበቃዎች
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-4">
            <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold">
              <Fingerprint className="h-4 w-4" />
              <span>ክሪፕቶግራፊክ ምስጠራ</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              የይለፍ ቃሎች በWeb Crypto API እና በ<b>Salted SHA-256</b> ተመስጥረው ነው የሚቀመጡት፤ በግልፅ ፅሁፍ አይገኙም፡፡
            </p>
            <span className="mt-3 inline-block rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-black text-emerald-300">
              100% ደህንነቱ የተጠበቀ
            </span>
          </div>

          <div className="rounded-2xl border border-blue-500/30 bg-blue-950/30 p-4">
            <div className="flex items-center gap-2 mb-2 text-blue-400 font-bold">
              <Lock className="h-4 w-4" />
              <span>ፀረ-ተደጋጋሚ ሙከራ</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              ማንም ሰው የይለፍ ቃል ለመገመት ከ5 ጊዜ በላይ ከሞከረ ሲስተሙ በራስ-ሰር ለ<b>30 ሰከንድ ይቆለፋል</b> (Anti-Brute Force)፡፡
            </p>
            <span className="mt-3 inline-block rounded-full bg-blue-500/20 px-2 py-0.5 text-[9px] font-black text-blue-300">
              ገባሪ ጥበቃ (Active)
            </span>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-amber-950/30 p-4">
            <div className="flex items-center gap-2 mb-2 text-amber-400 font-bold">
              <ShieldCheck className="h-4 w-4" />
              <span>የአድሚን ብቻ ቁጥጥር</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              የይለፍ ቃል እና ዩዘርኔም መቀየር የሚችለው የተፈቀደለት ዋናው <b>አድሚን ብቻ</b> ነው፤ ሌላ ማንም ሊቀይረው አይችልም፡፡
            </p>
            <span className="mt-3 inline-block rounded-full bg-amber-500/20 px-2 py-0.5 text-[9px] font-black text-amber-300">
              RBAC የተረጋገጠ
            </span>
          </div>

          <div className="rounded-2xl border border-purple-500/30 bg-purple-950/30 p-4">
            <div className="flex items-center gap-2 mb-2 text-purple-400 font-bold">
              <CheckCircle2 className="h-4 w-4" />
              <span>ደመና ማዕከል (Cloud Sync)</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              የተቀየሩ መረጃዎች በቀጥታ በክላውድ <b>Firestore</b> ውስጥ ሴቭ ስለሚደረጉ ኮምፒውተሩ ቢዘጋም አይጠፉም፡፡
            </p>
            <span className="mt-3 inline-block rounded-full bg-purple-500/20 px-2 py-0.5 text-[9px] font-black text-purple-300">
              ፋየርስቶር ሴቭድ
            </span>
          </div>
        </div>

        {/* Emergency Reset Button */}
        {isAdmin && (
          <div className="mt-6 border-t border-slate-800 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-slate-300">
                ድንገተኛ የመለያ ዳግም ማስጀመሪያ (Emergency Factory Reset)
              </p>
              <p className="text-[11px] text-slate-500">
                የተቀየሩት የይለፍ ቃሎች ቢረሱ ወደ መጀመሪያው የመነሻ ይለፍ ቃል (Default) ይመልሳል
              </p>
            </div>
            <button
              onClick={handleResetDefaults}
              disabled={isResetting}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-rose-400 hover:bg-rose-950/50 hover:border-rose-600 transition cursor-pointer self-start sm:self-auto"
            >
              {isResetting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
              <span>ነባሪ ይለፍ ቃሎችን መልስ (Reset Defaults)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
