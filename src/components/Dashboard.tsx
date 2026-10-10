import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext.tsx';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Crosshair, 
  Layers, 
  Send, 
  Calendar, 
  BarChart3, 
  Users, 
  FileSpreadsheet, 
  Printer, 
  Search, 
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { FirearmRegistration } from '../types/index.ts';

interface DashboardProps {
  onNavigateToRecord: (record: FirearmRegistration, targetView: 'idCard' | 'certificate') => void;
  onNavigateToNew: () => void;
  onNavigateToApprovals: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigateToRecord,
  onNavigateToNew,
  onNavigateToApprovals,
}) => {
  const { records, branding, user, sendWarningNotice, renewRegistration } = useSystem();
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [warningFeedback, setWarningFeedback] = useState<string | null>(null);

  // Today
  const today = new Date();

  // Metrics calculation
  const totalFirearms = records.length;
  const approvedCount = records.filter(r => r.status === 'የጸደቀ').length;
  const pendingCount = records.filter(r => r.status === 'በሂደት ላይ').length;
  const suspendedCount = records.filter(r => r.status === 'የታገደ').length;
  const surrenderedCount = records.filter(r => r.status === 'ገቢ የተደረገ' || r.isSurrendered).length;

  // Total bullets and magazines
  const totalBullets = records.reduce((sum, r) => sum + (Number(r.bulletCount) || 0), 0);
  const totalMagazines = records.reduce((sum, r) => sum + (Number(r.magazineCount) || 0), 0);

  // Expired records (expiryDate < today)
  const expiredRecords = records.filter(r => {
    return new Date(r.expiryDate) < today;
  });

  // Expiring soon (within 30 days)
  const expiringSoonRecords = records.filter(r => {
    const exp = new Date(r.expiryDate);
    const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
  });

  // Group by firearm type
  const typeMap: { [key: string]: { count: number; bullets: number; magazines: number; govt: number; private: number } } = {};
  records.forEach(r => {
    const type = r.firearmType || 'ሌላ';
    if (!typeMap[type]) {
      typeMap[type] = { count: 0, bullets: 0, magazines: 0, govt: 0, private: 0 };
    }
    typeMap[type].count += 1;
    typeMap[type].bullets += Number(r.bulletCount) || 0;
    typeMap[type].magazines += Number(r.magazineCount) || 0;
    if (r.ownership === 'የመንግስት') {
      typeMap[type].govt += 1;
    } else {
      typeMap[type].private += 1;
    }
  });

  // Group by Ownership
  const govtCount = records.filter(r => r.ownership === 'የመንግስት').length;
  const privateCount = records.filter(r => r.ownership === 'የግል').length;

  // Monthly breakdown
  const monthlyData = [
    { month: 'መስከረም / Sep', count: 18, bullets: 420 },
    { month: 'ጥቅምት / Oct', count: 24, bullets: 680 },
    { month: 'ህዳር / Nov', count: 31, bullets: 890 },
    { month: 'ታህሳስ / Dec', count: 27, bullets: 710 },
    { month: 'ጥር / Jan', count: 35, bullets: 1100 },
    { month: 'የካቲት / Feb', count: 42, bullets: 1450 },
    { month: 'መጋቢት / Mar', count: records.length, bullets: totalBullets },
  ];

  const handleSendWarning = (id: string, name: string) => {
    sendWarningNotice(id);
    setWarningFeedback(`የማደሻ ማስጠንቀቂያ ደብዳቤ/መልእክት ለ${name} እና ለመዝጋቢ ፖሊስ ተልኳል!`);
    setTimeout(() => setWarningFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & Notification Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/30 p-6 shadow-xl backdrop-blur-md gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-amber-500/20 px-3 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/30">
              {branding.processNameAm}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {today.toLocaleDateString('am-ET', { dateStyle: 'full' })}
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-white font-serif tracking-wide">
            የጦር መሳሪያ ምዝገባና ማረጋገጫ ዳሽቦርድ
          </h1>
          <p className="text-xs text-slate-300">
            እንኳን ደህና መጡ <b>{user?.fullName}</b> ({user?.role === 'OFFICIAL' ? 'የስራ ሂደት ሃላፊ' : 'መዝጋቢ አድሚን'})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {user?.role === 'OFFICIAL' ? (
            <button
              onClick={onNavigateToApprovals}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-500 hover:to-emerald-400 transition cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>የማጽደቂያ መድረክ ({pendingCount} ሰነዶች ይጠብቃሉ)</span>
            </button>
          ) : (
            <>
              {pendingCount > 0 && (
                <button
                  onClick={onNavigateToApprovals}
                  className="flex items-center gap-2 rounded-xl bg-amber-500/20 px-4 py-2.5 text-xs font-bold text-amber-400 border border-amber-500/40 hover:bg-amber-500/30 transition animate-pulse cursor-pointer"
                >
                  <Clock className="h-4 w-4" />
                  <span>{pendingCount} ወደ ሃላፊው የተላኩ ሰነዶች</span>
                </button>
              )}

              <button
                onClick={onNavigateToNew}
                className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition cursor-pointer"
              >
                <Crosshair className="h-4 w-4" />
                + አዲስ መሳሪያ መዝግብ
              </button>
            </>
          )}
        </div>
      </div>

      {/* Warning Feedback Banner */}
      {warningFeedback && (
        <div className="flex items-center justify-between rounded-2xl border border-emerald-500/50 bg-emerald-500/15 p-4 text-xs font-bold text-emerald-300 shadow">
          <span>{warningFeedback}</span>
          <button onClick={() => setWarningFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. AGGREGATE SUMMARY STATS CARDS                               */}
      {/* ============================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Firearms */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">ጠቅላላ የተመዘገቡ መሳሪያዎች</span>
            <Shield className="h-5 w-5 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">{totalFirearms}</div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-2 gap-1">
            <span>የጸደቁ፡ <b className="text-emerald-400">{approvedCount}</b></span>
            <span>ገቢ፡ <b className="text-rose-400">{surrenderedCount}</b></span>
            <span>በሂደት፡ <b className="text-amber-400">{pendingCount}</b></span>
          </div>
        </div>

        {/* Total Bullets */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">የጥይት ጠቅላላ ድምር</span>
            <Crosshair className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">{totalBullets.toLocaleString()}</div>
          <div className="mt-2 text-[11px] text-slate-400 border-t border-slate-800 pt-2">
            ጠቅላላ የካርታ ብዛት፡ <b className="text-slate-200">{totalMagazines} ካርታዎች</b>
          </div>
        </div>

        {/* Ownership Split */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">የመሳሪያ ንብረትነት</span>
            <Users className="h-5 w-5 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-black text-blue-400 font-mono">{govtCount}</div>
            <span className="text-xs text-slate-400">የመንግስት</span>
            <span className="text-slate-600">|</span>
            <div className="text-2xl font-black text-amber-400 font-mono">{privateCount}</div>
            <span className="text-xs text-slate-400">የግል</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 border-t border-slate-800 pt-2">
            የመንግስት ድርሻ: {totalFirearms > 0 ? Math.round((govtCount / totalFirearms) * 100) : 0}%
          </div>
        </div>

        {/* Overdue / Expired Licenses */}
        <div className={`rounded-2xl border p-5 shadow-lg relative overflow-hidden ${
          expiredRecords.length > 0 
            ? 'border-rose-500/60 bg-rose-950/40 text-rose-200' 
            : 'border-slate-800 bg-slate-900/80 text-slate-400'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">ቀነ-ገደብ ያለፈባቸው (የታገዱ)</span>
            <AlertTriangle className={`h-5 w-5 ${expiredRecords.length > 0 ? 'text-rose-500 animate-bounce' : 'text-slate-500'}`} />
          </div>
          <div className="text-3xl font-black text-rose-400 font-mono">{expiredRecords.length}</div>
          <div className="mt-2 text-[11px] text-slate-300 border-t border-rose-900/50 pt-2">
            በ1 ወር ውስጥ የሚታደሱ፡ <b className="text-amber-300">{expiringSoonRecords.length}</b>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. OVERDUE RENEWAL TRACKER & WARNING DISPATCH TABLE            */}
      {/* ============================================================== */}
      {expiredRecords.length > 0 && (
        <div className="rounded-3xl border-2 border-rose-500/50 bg-rose-950/20 p-6 shadow-xl backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-rose-500/30 pb-3 gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-500" />
              <div>
                <h3 className="text-base font-black text-rose-300 font-serif">
                  ቀነ-ገደብ ያለፈባቸው የጦር መሳሪያዎች (ማስጠንቀቂያ የሚያስፈልጋቸው)
                </h3>
                <p className="text-xs text-rose-200/80">
                  መሳሪያዉ ከተፈቀደለት 1 አመት ስላለፈው ታግዷል፤ ባለመሳሪያው ቀርቦ እንዲያድስ ማስጠንቀቂያ ይላኩ
                </p>
              </div>
            </div>
            <span className="rounded-full bg-rose-600/30 px-3 py-1 text-xs font-black text-rose-300 border border-rose-500/40">
              {expiredRecords.length} የታገዱ መሳሪያዎች
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-rose-900/40 text-slate-400">
                  <th className="py-2">የመታወቂያ ቁጥር</th>
                  <th className="py-2">የባለመሳሪያው ስም</th>
                  <th className="py-2">የመሳሪያው አይነት</th>
                  <th className="py-2">ንምራ ቁጥር</th>
                  <th className="py-2">ያበቃበት ቀን</th>
                  <th className="py-2 text-right">እርምጃ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-950/30">
                {expiredRecords.map(r => (
                  <tr key={r.id} className="hover:bg-rose-900/10">
                    <td className="py-3 font-mono font-bold text-amber-300">{r.idCardNumber}</td>
                    <td className="py-3 font-bold text-white">{r.fullName}</td>
                    <td className="py-3 text-slate-300">{r.firearmType}</td>
                    <td className="py-3 font-mono text-slate-300">{r.serialNumber}</td>
                    <td className="py-3 font-semibold text-rose-400">{r.expiryDate} (ያለፈበት)</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleSendWarning(r.id, r.fullName)}
                          className={`rounded-lg px-3 py-1 text-xs font-bold transition flex items-center gap-1 ${
                            r.warningNoticeSent
                              ? 'bg-slate-800 text-slate-400 border border-slate-700'
                              : 'bg-rose-600 text-white hover:bg-rose-500 shadow'
                          }`}
                        >
                          <Send className="h-3 w-3" />
                          {r.warningNoticeSent ? 'ማስጠንቀቂያ ተልኳል' : 'ማስጠንቀቂያ ላክ'}
                        </button>
                        <button
                          onClick={() => renewRegistration(r.id)}
                          className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-500 transition shadow"
                        >
                          ፈቃድ አድስ
                        </button>
                        <button
                          onClick={() => onNavigateToRecord(r, 'idCard')}
                          className="rounded-lg bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:text-white"
                        >
                          እይ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. FIREARMS BREAKDOWN BY TYPE WITH VISUAL BAR CHARTS            */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Firearm Types & Ammo Bar Stats */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div>
              <h3 className="text-base font-black text-amber-400 font-serif">
                የተመዘገቡ የጦር መሳሪያዎች በዓይነትና ጥይት ብዛት (Firearm Types Breakdown)
              </h3>
              <p className="text-xs text-slate-400">
                ተመሳሳይ መሳሪያዎች ተለይተው በጠቅላላ ድምር ቀርበዋል
              </p>
            </div>
            <BarChart3 className="h-5 w-5 text-amber-400" />
          </div>

          <div className="space-y-4">
            {Object.entries(typeMap).map(([type, stats]) => {
              const percentage = totalFirearms > 0 ? Math.round((stats.count / totalFirearms) * 100) : 0;
              return (
                <div key={type} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{type}</span>
                      <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[10px] text-amber-300">
                        {stats.count} መሳሪያዎች
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="text-emerald-400 font-semibold">{stats.bullets} ጥይቶች</span>
                      <span className="text-slate-400">{stats.magazines} ካርታዎች</span>
                      <span className="font-bold text-amber-400">{percentage}%</span>
                    </div>
                  </div>

                  {/* Visual Bar representation */}
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                    <span>የመንግስት፡ {stats.govt} | የግል፡ {stats.private}</span>
                    <span className="text-slate-400 font-mono">ንብረትነት</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Monthly Report & Summary Generator */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-black text-amber-400 font-serif">
                የወርሃዊ ሪፖርት ማጠቃለያ (Monthly Report)
              </h3>
              <Calendar className="h-5 w-5 text-amber-400" />
            </div>

            <div className="space-y-3">
              {monthlyData.slice(-4).map((m, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-xl bg-slate-950 p-3 text-xs border border-slate-800">
                  <span className="font-semibold text-slate-300">{m.month}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white font-mono">{m.count} መሳሪያዎች</span>
                    <span className="text-emerald-400 font-mono text-[11px]">{m.bullets} ጥይት</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 border-t border-slate-800 pt-4">
            <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-3 text-xs text-amber-200">
              <p className="font-bold">ኦፊሴላዊ የፖሊስ ኮሚሽን ሪፖርት</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                ሪፖርቱ በወር የተመዘገቡ የጦር መሳሪያዎች፣ ጥይቶች፣ የጸደቁና የታገዱ ፈቃዶች ሙሉ ዝርዝር ያካትታል፡፡
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition"
            >
              <Printer className="h-4 w-4 text-amber-400" />
              የወሩን ሪፖርት ፕሪንት አድርግ (Print Monthly Report)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
