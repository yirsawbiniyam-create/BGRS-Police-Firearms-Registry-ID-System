import React, { useState, useEffect } from 'react';
import { FirearmRegistration, SystemBranding } from '../types/index.ts';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  IdCard, 
  FileText,
  Lock,
  PhoneCall
} from 'lucide-react';
import { IdCardView } from './IdCardView.tsx';
import { CertificateView } from './CertificateView.tsx';
import { db } from '../firebase.ts';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

interface PublicVerificationViewProps {
  registration: FirearmRegistration | null;
  idNumber: string;
  branding: SystemBranding;
  onBackToApp?: () => void;
}

export const PublicVerificationView: React.FC<PublicVerificationViewProps> = ({
  registration: initialRegistration,
  idNumber,
  branding: initialBranding,
  onBackToApp,
}) => {
  const [record, setRecord] = useState<FirearmRegistration | null>(initialRegistration);
  const [branding, setBranding] = useState<SystemBranding>(initialBranding);
  const [isLoading, setIsLoading] = useState<boolean>(!initialRegistration);
  const [activeTab, setActiveTab] = useState<'idCard' | 'certificate'>('idCard');

  // Direct Firestore real-time lookup when scanned on another device or phone
  useEffect(() => {
    let isMounted = true;

    async function fetchFromFirestore() {
      // 1. Fetch latest branding (Logos & Flags) from Firestore
      try {
        const brandingSnap = await getDoc(doc(db, 'system_config', 'branding'));
        if (brandingSnap.exists() && isMounted) {
          setBranding((prev) => ({ ...prev, ...(brandingSnap.data() as SystemBranding) }));
        }
      } catch (e) {
        console.warn('Branding fetch notice:', e);
      }

      // 2. If record is already provided, no need to query records
      if (initialRegistration) {
        if (isMounted) setIsLoading(false);
        return;
      }

      // 3. Query firearms_records collection for this ID number
      try {
        const cleanId = decodeURIComponent(idNumber).trim();
        const recordsCol = collection(db, 'firearms_records');

        // Try searching by idCardNumber
        const q = query(recordsCol, where('idCardNumber', '==', cleanId));
        const querySnap = await getDocs(q);

        if (!querySnap.empty && isMounted) {
          const found = querySnap.docs[0].data() as FirearmRegistration;
          setRecord(found);
          setIsLoading(false);
          return;
        }

        // Try direct document ID
        const docSnap = await getDoc(doc(db, 'firearms_records', cleanId));
        if (docSnap.exists() && isMounted) {
          setRecord(docSnap.data() as FirearmRegistration);
          setIsLoading(false);
          return;
        }

        // Try case-insensitive or certNumber match from all records
        const allSnap = await getDocs(recordsCol);
        if (!allSnap.empty && isMounted) {
          let matched: FirearmRegistration | null = null;
          allSnap.forEach((d) => {
            const data = d.data() as FirearmRegistration;
            if (
              data.idCardNumber?.toLowerCase() === cleanId.toLowerCase() ||
              data.certNumber?.toLowerCase() === cleanId.toLowerCase() ||
              data.serialNumber?.toLowerCase() === cleanId.toLowerCase()
            ) {
              matched = data;
            }
          });
          if (matched) {
            setRecord(matched);
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error('Firestore record verification query notice:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchFromFirestore();

    return () => {
      isMounted = false;
    };
  }, [idNumber, initialRegistration]);

  // Loading state with police commission flags and logo
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4 text-white">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-8 text-center shadow-2xl backdrop-blur-md">
          {/* Header with flags and logo during loading */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-8 w-12 overflow-hidden rounded border border-slate-600 shadow">
              <img src={branding.bgrsFlag} alt="BGRS Flag" className="h-full w-full object-cover" />
            </div>
            <div className="h-14 w-14 drop-shadow">
              <img src={branding.policeLogo} alt="Police Logo" className="h-full w-full object-contain" />
            </div>
            <div className="h-8 w-12 overflow-hidden rounded border border-slate-600 shadow">
              <img src={branding.ethiopiaFlag} alt="Ethiopia Flag" className="h-full w-full object-cover" />
            </div>
          </div>

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 mb-4">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
          <h2 className="text-lg font-black text-amber-400 font-serif">
            የጦር መሳሪያ ሰነድ ከዳታቤዝ በመፈለግ ላይ...
          </h2>
          <p className="mt-2 text-xs text-slate-400 font-mono">
            መታወቂያ ቁጥር፡ {decodeURIComponent(idNumber)}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            ከቤኒሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን ደመና ዳታቤዝ (Cloud Firestore) በማረጋገጥ ላይ...
          </p>
        </div>
      </div>
    );
  }

  // Not found state (still shows flags and logo!)
  if (!record) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4 text-white">
        <div className="w-full max-w-md rounded-3xl border border-rose-800 bg-slate-900/95 p-8 text-center shadow-2xl backdrop-blur-md">
          {/* Top flags and institutional logo */}
          <div className="flex items-center justify-center gap-3 mb-5 border-b border-slate-800 pb-4">
            <div className="h-8 w-12 overflow-hidden rounded border border-slate-600 shadow">
              <img src={branding.bgrsFlag} alt="BGRS Flag" className="h-full w-full object-cover" />
            </div>
            <div className="h-14 w-14 drop-shadow">
              <img src={branding.policeLogo} alt="Police Logo" className="h-full w-full object-contain" />
            </div>
            <div className="h-8 w-12 overflow-hidden rounded border border-slate-600 shadow">
              <img src={branding.ethiopiaFlag} alt="Ethiopia Flag" className="h-full w-full object-cover" />
            </div>
          </div>

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/20 text-rose-500 mb-3">
            <XCircle className="h-10 w-10" />
          </div>
          <h2 className="text-xl font-black text-rose-400 font-serif">
            መታወቂያው አልተገኘም! (Record Not Found)
          </h2>
          <p className="mt-2 text-xs text-slate-300">
            የተፈለገው የመታወቂያ ቁጥር <b className="font-mono text-amber-400 bg-slate-800 px-2 py-0.5 rounded">{decodeURIComponent(idNumber)}</b> በቤኒሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን የጦር መሳሪያ ምዝገባ ዳታቤዝ ውስጥ አልተገኘም፡፡
          </p>
          <div className="mt-4 rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-amber-300">
            ይህ ሰነድ ህጋዊ ላይሆን ወይም ሀሰተኛ ሊሆን ስለሚችል ለፖሊስ በስልክ ቁጥር <b>{branding.contactPhone}</b> ያሳውቁ፡፡
          </div>
          {onBackToApp && (
            <button
              onClick={onBackToApp}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" /> ወደ ዋናው ሲስተም ተመለስ
            </button>
          )}
        </div>
      </div>
    );
  }

  const isExpired = new Date(record.expiryDate) < new Date();
  const isApproved = record.status === 'የጸደቀ';
  const isSuspended = record.status === 'የታገደ';

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      <div className="mx-auto max-w-4xl">
        {/* ============================================================== */}
        {/* TOP OFFICIAL HEADER: FLAGS & POLICE LOGO ALWAYS VISIBLE       */}
        {/* ============================================================== */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-md mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
            {/* Left Flag: Benishangul Gumuz Regional State */}
            <div className="flex items-center gap-2">
              <div className="h-9 w-14 overflow-hidden rounded border border-slate-600 shadow">
                <img src={branding.bgrsFlag} alt="BGRS Flag" className="h-full w-full object-cover" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 hidden sm:inline">
                ቤ/ጉ/ክ/መ
              </span>
            </div>

            {/* Center: Official Police Crest and Titles */}
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-2">
                <div className="h-12 w-12 drop-shadow">
                  <img src={branding.policeLogo} alt="Police Logo" className="h-full w-full object-contain" />
                </div>
                <div>
                  <h1 className="text-base font-black text-amber-400 font-serif leading-tight">
                    {branding.commissionNameAm}
                  </h1>
                  <h2 className="text-xs font-bold text-slate-200 leading-tight">
                    የጦር መሳሪያ ፈቃድና መታወቂያ ዲጂታል ማረጋገጫ ፖርታል
                  </h2>
                </div>
              </div>
              <span className="mt-1 text-[10px] font-semibold text-slate-400 tracking-wider">
                Official Digital Firearms Verification Portal
              </span>
            </div>

            {/* Right Flag: Ethiopian National Flag */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 hidden sm:inline">
                ኢ.ፌ.ዴ.ሪ
              </span>
              <div className="h-9 w-14 overflow-hidden rounded border border-slate-600 shadow">
                <img src={branding.ethiopiaFlag} alt="Ethiopian Flag" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-mono text-slate-400">
              የተረጋገጠ መታወቂያ፡ <b className="text-amber-400">{record.idCardNumber}</b>
            </span>
            {onBackToApp && (
              <button
                onClick={onBackToApp}
                className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold transition"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> ወደ ሲስተም መግቢያ ተመለስ
              </button>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* 1. CRITICAL STATUS BANNER                                      */}
        {/* ============================================================== */}
        {isExpired || isSuspended ? (
          <div className="mb-6 rounded-3xl border-4 border-rose-600 bg-rose-950/80 p-6 text-center shadow-2xl backdrop-blur-sm animate-pulse">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg mb-3">
              <ShieldAlert className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-black text-rose-300 tracking-wider">
              መሳሪያዉ ታግዷል! (LICENSE EXPIRED / SUSPENDED)
            </h2>
            <p className="mt-1 text-sm font-bold text-rose-200">
              {isSuspended 
                ? 'ይህ የጦር መሳሪያ በፖሊስ ኮሚሽኑ ውሳኔ ሙሉ በሙሉ ታግዷል!' 
                : 'የመታወቂያው የአንድ ዓመት የአገልግሎት ጊዜ ስላለፈበት ፈቃዱ ታግዷል!'}
            </p>
            <p className="mt-2 text-xs text-slate-300">
              ያበቃበት ቀን፡ <b>{record.expiryDate}</b> ነበር፡፡ ባለመሳሪያው በአስቸኳይ ቀርቦ ፈቃዱን ማደስ አለበት፡፡
            </p>
          </div>
        ) : !isApproved ? (
          <div className="mb-6 rounded-3xl border-2 border-amber-500 bg-amber-950/60 p-6 text-center shadow-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 mb-2">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-black text-amber-300">
              ይህ የጦር መሳሪያ ፈቃድ በሂደት ላይ ያለ / ያልጸደቀ ነው
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              ይህ መታወቂያ በስራ ሂደት ሃላፊው እስካልጸደቀ ድረስ ህጋዊ እንቅስቃሴ ማድረግ የተከለከለ ነው፡፡
            </p>
          </div>
        ) : (
          <div className="mb-6 rounded-3xl border-2 border-emerald-500 bg-emerald-950/60 p-6 text-center shadow-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mb-2">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-black text-emerald-400 tracking-wide font-serif">
              ህጋዊ እና በይፋ የተረጋገጠ የጦር መሳሪያ ፈቃድ
            </h2>
            <p className="text-xs text-emerald-200 font-medium mt-1">
              በቤኒሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን የወንጀል መከላከል ሂደት በይፋ የተመዘገበና የጸደቀ ህጋዊ ሰነድ ነው፡፡
            </p>
          </div>
        )}

        {/* View Switcher Tabs: ATM ID Card vs A4 Certificate */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab('idCard')}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition cursor-pointer ${
              activeTab === 'idCard'
                ? 'bg-amber-500 text-slate-950 shadow-lg'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <IdCard className="h-4 w-4" />
            የኤቲኤም መታወቂያ ካርድ (ATM ID Card)
          </button>
          <button
            onClick={() => setActiveTab('certificate')}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition cursor-pointer ${
              activeTab === 'certificate'
                ? 'bg-amber-500 text-slate-950 shadow-lg'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <FileText className="h-4 w-4" />
            የA4 ምዝገባ ሰርቲፊኬት (A4 Certificate)
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: AUTHENTIC ATM ID CARD                                  */}
        {/* ============================================================== */}
        {activeTab === 'idCard' && (
          <div className="flex flex-col items-center">
            <IdCardView
              registration={record}
              branding={branding}
              showPrintActions={false}
            />
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: A4 OFFICIAL CERTIFICATE                                */}
        {/* ============================================================== */}
        {activeTab === 'certificate' && (
          <div className="flex flex-col items-center">
            <CertificateView
              registration={record}
              branding={branding}
              showActions={false}
            />
          </div>
        )}

        {/* ============================================================== */}
        {/* 3. VERIFIED READ-ONLY SUMMARY DETAILS TABLE                    */}
        {/* ============================================================== */}
        <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
          <h3 className="mb-4 border-b border-slate-800 pb-2 text-sm font-bold text-amber-400 flex items-center justify-between">
            <span>የተመዘገቡ ይፋዊ ዝርዝር መረጃዎች</span>
            <span className="text-xs font-mono text-slate-400">የመ/ቁ፡ {record.certNumber}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400">ሙሉ ስም፡</span>
              <p className="font-bold text-slate-100 text-sm">{record.fullName}</p>
            </div>
            <div>
              <span className="text-slate-400">ዜግነት እና ዕድሜ፡</span>
              <p className="font-semibold text-slate-200">{record.nationality} • {record.age} ዓመት</p>
            </div>
            <div>
              <span className="text-slate-400">የመኖሪያ አድራሻ፡</span>
              <p className="font-medium text-slate-200">
                {record.region}፣ {record.zone}፣ {record.woreda}፣ {record.kebele}
              </p>
            </div>
            <div>
              <span className="text-slate-400">ስራ እና ሃላፊነት፡</span>
              <p className="font-medium text-slate-200">
                {record.occupation} {record.positionRole ? `(${record.positionRole})` : ''}
              </p>
            </div>
            <div className="border-t border-slate-800 pt-2">
              <span className="text-slate-400">የመሳሪያው አይነት፡</span>
              <p className="font-black text-amber-300">{record.firearmType}</p>
            </div>
            <div className="border-t border-slate-800 pt-2">
              <span className="text-slate-400">ንምራ ቁጥር (Serial Number)፡</span>
              <p className="font-mono font-black text-white bg-slate-800 px-2 py-0.5 rounded inline-block">
                {record.serialNumber}
              </p>
            </div>
            <div>
              <span className="text-slate-400">የጥይትና ካርታ ብዛት፡</span>
              <p className="font-semibold text-slate-200">
                ጥይት: {record.bulletCount} | ካርታ: {record.magazineCount} ({record.ownership})
              </p>
            </div>
            <div>
              <span className="text-slate-400">የመሳሪያው ይዘት እና ሀገር፡</span>
              <p className="font-semibold text-slate-200">
                {record.mechanism} • {record.countryOfOrigin} ({record.manufactureYear} ዓ/ም)
              </p>
            </div>
            <div className="border-t border-slate-800 pt-2">
              <span className="text-slate-400">የተሰጠበት ቀን፡</span>
              <p className="font-semibold text-slate-200">{record.registrationDate}</p>
            </div>
            <div className="border-t border-slate-800 pt-2">
              <span className="text-slate-400">የሚያበቃበት ቀን፡</span>
              <p className={`font-bold ${isExpired ? 'text-rose-400' : 'text-emerald-400'}`}>
                {record.expiryDate} {isExpired ? '(ጊዜው አልፏል)' : '(ህጋዊ ፈቃድ)'}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-4 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
            <p>
              ይህ ገጽ በኪውአርኮድ (QR Code) በይፋ የተረጋገጠ የፖሊስ ኮሚሽን ሰነድ መመልከቻ ብቻ ነው፡፡
            </p>
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <PhoneCall className="h-4 w-4" />
              <span>ለማንኛውም ጥያቄ ወይም የጥቆማ መረጃ በስልክ <b>{branding.contactPhone}</b> ይደውሉ፡፡</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
