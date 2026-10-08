import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext.tsx';
import { FirearmRegistration } from '../types/index.ts';
import { 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  IdCard, 
  AlertCircle, 
  Search,
  Lock,
  UserCheck
} from 'lucide-react';

interface ApprovalQueueProps {
  onViewRecord: (record: FirearmRegistration, targetView: 'idCard' | 'certificate') => void;
}

export const ApprovalQueue: React.FC<ApprovalQueueProps> = ({ onViewRecord }) => {
  const { records, approveRegistration, rejectRegistration, user } = useSystem();
  const [selectedRecord, setSelectedRecord] = useState<FirearmRegistration | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const pendingRecords = records.filter((r) => r.status === 'በሂደት ላይ');
  const isOfficialUser = user?.role === 'OFFICIAL';

  const handleApprove = (id: string, name: string) => {
    approveRegistration(id, user?.fullName, approvalNotes || 'በይፋ ተረጋግጦ ጸድቋል');
    setActionSuccessMsg(`የ${name} የጦር መሳሪያ ምዝገባ በይፋ ጸድቋል! ፕሪንት ማድረግ ተፈቅዷል፡፡`);
    setSelectedRecord(null);
    setApprovalNotes('');
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleReject = (id: string, name: string) => {
    if (!rejectionReason.trim()) {
      alert('እባክዎ የተከለከለበትን ምክንያት ይግለጹ!');
      return;
    }
    rejectRegistration(id, rejectionReason);
    setActionSuccessMsg(`የ${name} የጦር መሳሪያ ምዝገባ ውድቅ ተደርጓል፡፡`);
    setSelectedRecord(null);
    setRejectionReason('');
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
              የስራ ሂደት ሃላፊ ማረጋገጫ ክፍል
            </span>
            <span className="text-xs text-slate-400 font-mono">
              admin2026 Review Portal
            </span>
          </div>
          <h2 className="mt-1 text-xl font-black text-white font-serif tracking-wide">
            የጦር መሳሪያ ምዝገባ ማጽደቂያ እና ማረጋገጫ (Official Approval Queue)
          </h2>
          <p className="text-xs text-slate-400">
            ማሳሰቢያ፡ መታወቂያው እና ሰርቲፊኬቱ ፕሪንት የሚደረጉትና በኪውአር ኮድ ህጋዊ የሚሆኑት በስራ ሂደት ሃላፊው ሲጸድቁ ብቻ ነው!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-2xl border border-amber-500/40 bg-slate-900 px-4 py-2 text-xs font-bold text-amber-400">
            {pendingRecords.length} ማረጋገጫ የሚጠብቁ ሰነዶች
          </span>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/50 bg-emerald-500/15 p-4 text-xs font-bold text-emerald-300 shadow">
          <CheckCircle className="h-5 w-5 text-emerald-400" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Role permission alert */}
      {!isOfficialUser && (
        <div className="rounded-2xl border border-amber-500/50 bg-amber-500/10 p-4 text-xs text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-400 shrink-0" />
            <div>
              <b>የመዝጋቢ አድሚን እይታ፡</b> ማጽደቅ የሚችሉት የስራ ሂደት ሃላፊው (ኮማንደር መንግስቱ በቀለ - <b>admin2026</b>) ናቸው፡፡ አድሚኑ መዝግቦ ያቀርባል፤ ሃላፊው አጽድቆ ፕሪንት ይፈቅዳል፡፡
            </div>
          </div>
        </div>
      )}

      {pendingRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/60 p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 mb-3">
            <CheckCircle className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-white">
            በአሁኑ ሰዓት ማረጋገጫ የሚጠብቅ ሰነድ የለም!
          </h3>
          <p className="mt-1 text-xs text-slate-400 max-w-sm">
            ሁሉም የተመዘገቡ የጦር መሳሪያዎች በስራ ሂደት ሃላፊው ተረጋግጠው ጸድቀዋል፡፡
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pendingRecords.map((r) => (
            <div
              key={r.id}
              className="rounded-3xl border border-amber-500/40 bg-slate-900/90 p-6 shadow-xl backdrop-blur-md flex flex-col justify-between"
            >
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-10 overflow-hidden rounded-md border-2 border-amber-400 bg-slate-950 shadow">
                      <img
                        src={r.photoUrl}
                        alt={r.fullName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-white">{r.fullName}</h4>
                      <p className="text-xs text-slate-400">
                        {r.woreda}፣ {r.kebele} • {r.occupation}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {r.idCardNumber}
                    </span>
                    <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                      {r.certNumber}
                    </span>
                  </div>
                </div>

                {/* Firearm Specs Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 mb-4">
                  <div>
                    <span className="text-slate-400">የመሳሪያው አይነት፡</span>
                    <p className="font-bold text-amber-300">{r.firearmType}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">ንምራ ቁጥር (Serial)፡</span>
                    <p className="font-mono font-bold text-white">{r.serialNumber}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">የጥይት / ካርታ ብዛት፡</span>
                    <p className="font-bold text-emerald-400">
                      {r.bulletCount} ጥይት | {r.magazineCount} ካርታ
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">ንብረትነት / አሰራር፡</span>
                    <p className="font-medium text-slate-300">
                      {r.ownership} ({r.mechanism})
                    </p>
                  </div>
                  <div className="col-span-2 border-t border-slate-800 pt-1.5 flex justify-between text-[11px]">
                    <span className="text-slate-400">የመዘገበው፡ <b>{r.registrarName}</b></span>
                    <span className="text-slate-400">የተመዘገበበት፡ <b>{r.registrationDate}</b></span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-slate-800 pt-4 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onViewRecord(r, 'idCard')}
                      className="flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700"
                    >
                      <IdCard className="h-3.5 w-3.5 text-amber-400" /> መታወቂያ እይ
                    </button>
                    <button
                      onClick={() => onViewRecord(r, 'certificate')}
                      className="flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700"
                    >
                      <FileText className="h-3.5 w-3.5 text-slate-400" /> ሰርቲፊኬት እይ
                    </button>
                  </div>

                  {/* Approval Actions: STRICTLY FOR OFFICIAL ONLY */}
                  {isOfficialUser ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const reason = prompt('የተከለከለበትን ወይም ማስተካከያ የሚያስፈልገውን ምክንያት ያስገቡ፡');
                          if (reason) handleReject(r.id, r.fullName);
                        }}
                        className="rounded-xl border border-rose-500/50 bg-rose-950/30 px-3 py-2 text-xs font-bold text-rose-300 hover:bg-rose-900/40 cursor-pointer"
                      >
                        መልስ / ከልክል
                      </button>
                      <button
                        onClick={() => handleApprove(r.id, r.fullName)}
                        className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2 text-xs font-black text-white shadow-lg hover:from-emerald-500 hover:to-emerald-400 active:scale-[0.98] cursor-pointer"
                      >
                        <UserCheck className="h-4 w-4" />
                        አጽድቅ እና ፕሪንት ፍቀድ
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 rounded-xl bg-slate-950/80 px-3.5 py-1.5 border border-amber-500/30 text-amber-300 text-xs font-medium">
                      <Lock className="h-3.5 w-3.5 text-amber-400" />
                      <span>የሃላፊውን (admin2026) ማረጋገጫ በመጠባበቅ ላይ • አድሚኑ ማጽደቅ አይችልም</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
