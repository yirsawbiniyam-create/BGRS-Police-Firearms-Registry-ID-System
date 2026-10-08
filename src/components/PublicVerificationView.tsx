import React from 'react';
import { FirearmRegistration, SystemBranding } from '../types/index.ts';
import { ShieldCheck, ShieldAlert, AlertTriangle, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { IdCardView } from './IdCardView.tsx';

interface PublicVerificationViewProps {
  registration: FirearmRegistration | null;
  idNumber: string;
  branding: SystemBranding;
  onBackToApp?: () => void;
}

export const PublicVerificationView: React.FC<PublicVerificationViewProps> = ({
  registration,
  idNumber,
  branding,
  onBackToApp,
}) => {
  if (!registration) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4 text-white">
        <div className="w-full max-w-md rounded-2xl border border-rose-800 bg-slate-900 p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/20 text-rose-500 mb-4">
            <XCircle className="h-10 w-10" />
          </div>
          <h2 className="text-xl font-bold text-rose-400">
            መታወቂያው አልተገኘም! (Record Not Found)
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            የተፈለገው የመታወቂያ ቁጥር <b>{idNumber}</b> በቤኒሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን የጦር መሳሪያ ምዝገባ ዳታቤዝ ውስጥ አልተገኘም፡፡
          </p>
          <div className="mt-4 rounded-xl bg-slate-800/80 p-3 text-xs text-amber-400">
            ይህ መታወቂያ ህጋዊ ላይሆን ወይም ሀሰተኛ ሊሆን ስለሚችል ለፖሊስ በስልክ ቁጥር <b>{branding.contactPhone}</b> ያሳውቁ፡፡
          </div>
          {onBackToApp && (
            <button
              onClick={onBackToApp}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700"
            >
              <ArrowLeft className="h-4 w-4" /> ወደ ዋናው ሲስተም ተመለስ
            </button>
          )}
        </div>
      </div>
    );
  }

  const isExpired = new Date(registration.expiryDate) < new Date();
  const isApproved = registration.status === 'የጸደቀ';
  const isSuspended = registration.status === 'የታገደ';

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      <div className="mx-auto max-w-3xl">
        {/* Top Header Banner */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 drop-shadow">
              <img src={branding.policeLogo} alt="Police Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <h1 className="text-lg font-black text-amber-400 font-serif">
                {branding.commissionNameAm}
              </h1>
              <p className="text-xs font-semibold text-slate-300">
                የጦር መሳሪያ ፈቃድና መታወቂያ ዲጂታል ማረጋገጫ ፖርታል (Digital Verification)
              </p>
            </div>
          </div>
          {onBackToApp && (
            <button
              onClick={onBackToApp}
              className="mt-2 text-xs text-amber-400 underline hover:text-amber-300"
            >
              ወደ ዋናው ሲስተም መግቢያ ተመለስ
            </button>
          )}
        </div>

        {/* 1. CRITICAL STATUS BANNER */}
        {isExpired || isSuspended ? (
          <div className="mb-6 rounded-2xl border-4 border-rose-600 bg-rose-950/80 p-6 text-center shadow-2xl backdrop-blur-sm animate-pulse">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg mb-3">
              <ShieldAlert className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-black text-rose-400 tracking-wider">
              መሳሪያዉ ታግዷል!
            </h2>
            <p className="mt-1 text-sm font-bold text-rose-200">
              {isSuspended 
                ? 'ይህ የጦር መሳሪያ በፖሊስ ኮሚሽኑ ውሳኔ ሙሉ በሙሉ ታግዷል!' 
                : 'የመታወቂያው የአንድ ዓመት የአገልግሎት ጊዜ ስላለፈበት ፈቃዱ ታግዷል!'}
            </p>
            <p className="mt-2 text-xs text-slate-300">
              የሚያበቃበት ቀን፡ <b>{registration.expiryDate}</b> ነበር፡፡ ባለመሳሪያው በአስቸኳይ ቀርቦ ማደስ አለበት፡፡
            </p>
          </div>
        ) : !isApproved ? (
          <div className="mb-6 rounded-2xl border-2 border-amber-500 bg-amber-950/50 p-5 text-center shadow-xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 mb-2">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-amber-300">
              ይህ የጦር መሳሪያ ፈቃድ በሂደት ላይ ያለ / ያልጸደቀ ነው
            </h2>
            <p className="text-xs text-slate-300">
              ይህ መታወቂያ በስራ ሂደት ሃላፊ እስካልጸደቀ ድረስ ህጋዊ እንቅስቃሴ ማድረግ አይፈቀድም፡፡
            </p>
          </div>
        ) : (
          <div className="mb-6 rounded-2xl border-2 border-emerald-500 bg-emerald-950/40 p-5 text-center shadow-xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mb-2">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-black text-emerald-400 tracking-wide">
              ህጋዊ እና የተረጋገጠ የጦር መሳሪያ ፈቃድ
            </h2>
            <p className="text-xs text-emerald-200 font-medium">
              በቤኒሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን የወንጀል መከላከል ሂደት በይፋ የተመዘገበና የጸደቀ ህጋዊ ሰነድ ነው፡፡
            </p>
          </div>
        )}

        {/* 2. RENDER THE AUTHENTIC ID CARD FRONT VIEW */}
        <div className="flex flex-col items-center">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-amber-400">
            የተረጋገጠው የመታወቂያ ካርድ ገጽታ
          </h3>
          <IdCardView
            registration={registration}
            branding={branding}
            showPrintActions={false}
          />
        </div>

        {/* 3. VERIFIED READ-ONLY DETAILS TABLE */}
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
          <h3 className="mb-4 border-b border-slate-800 pb-2 text-sm font-bold text-amber-400 flex items-center justify-between">
            <span>የተመዘገቡ ይፋዊ ዝርዝር መረጃዎች</span>
            <span className="text-xs font-mono text-slate-400">ID: {registration.idCardNumber}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400">ሙሉ ስም፡</span>
              <p className="font-bold text-slate-100 text-sm">{registration.fullName}</p>
            </div>
            <div>
              <span className="text-slate-400">ዜግነት እና ዕድሜ፡</span>
              <p className="font-semibold text-slate-200">{registration.nationality} • {registration.age} ዓመት</p>
            </div>
            <div>
              <span className="text-slate-400">የመኖሪያ አድራሻ፡</span>
              <p className="font-medium text-slate-200">
                {registration.region}፣ {registration.zone}፣ {registration.woreda}፣ {registration.kebele}
              </p>
            </div>
            <div>
              <span className="text-slate-400">ስራ እና ሃላፊነት፡</span>
              <p className="font-medium text-slate-200">
                {registration.occupation} {registration.positionRole ? `(${registration.positionRole})` : ''}
              </p>
            </div>
            <div className="border-t border-slate-800 pt-2">
              <span className="text-slate-400">የመሳሪያው አይነት፡</span>
              <p className="font-black text-amber-300">{registration.firearmType}</p>
            </div>
            <div className="border-t border-slate-800 pt-2">
              <span className="text-slate-400">ንምራ ቁጥር (Serial Number)፡</span>
              <p className="font-mono font-black text-white bg-slate-800 px-2 py-0.5 rounded inline-block">
                {registration.serialNumber}
              </p>
            </div>
            <div>
              <span className="text-slate-400">የጥይትና ካርታ ብዛት፡</span>
              <p className="font-semibold text-slate-200">
                ጥይት: {registration.bulletCount} | ካርታ: {registration.magazineCount} ({registration.ownership})
              </p>
            </div>
            <div>
              <span className="text-slate-400">የመሳሪያው ይዘት እና ሀገር፡</span>
              <p className="font-semibold text-slate-200">
                {registration.mechanism} • {registration.countryOfOrigin}
              </p>
            </div>
            <div className="border-t border-slate-800 pt-2">
              <span className="text-slate-400">የተሰጠበት ቀን፡</span>
              <p className="font-semibold text-slate-200">{registration.registrationDate}</p>
            </div>
            <div className="border-t border-slate-800 pt-2">
              <span className="text-slate-400">የሚያበቃበት ቀን፡</span>
              <p className={`font-bold ${isExpired ? 'text-rose-400' : 'text-emerald-400'}`}>
                {registration.expiryDate} {isExpired ? '(ጊዜው አልፏል)' : '(ህጋዊ)'}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-3 text-center text-[11px] text-slate-400">
            ይህ ገጽ በኪውአርኮድ (QR Code) በይፋ የተረጋገጠ የፖሊስ ኮሚሽን ሰነድ መመልከቻ ብቻ ነው፡፡ መረጃዎችን ማስተካከል ወይም መቀየር አይቻልም፡፡
            <br />
            ለማንኛውም ጥያቄ ወይም የጥቆማ መረጃ በስልክ <b>{branding.contactPhone}</b> ይደውሉ፡፡
          </div>
        </div>
      </div>
    </div>
  );
};
