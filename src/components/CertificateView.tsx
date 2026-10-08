import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { FirearmRegistration, SystemBranding } from '../types/index.ts';
import { Printer, ShieldCheck, Lock, AlertTriangle, ArrowLeft } from 'lucide-react';

interface CertificateViewProps {
  registration: FirearmRegistration;
  branding: SystemBranding;
  onBack?: () => void;
  showActions?: boolean;
}

export const CertificateView: React.FC<CertificateViewProps> = ({
  registration,
  branding,
  onBack,
  showActions = true,
}) => {
  const [certQrUrl, setCertQrUrl] = useState<string>('');
  const isApproved = registration.status === 'የጸደቀ';
  const isExpired = new Date(registration.expiryDate) < new Date();

  // Verification URL for QR Code scanner
  const verificationUrl = `${window.location.origin}${window.location.pathname}?verify=${registration.idCardNumber}`;

  useEffect(() => {
    QRCode.toDataURL(verificationUrl, {
      width: 280,
      margin: 1,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => setCertQrUrl(url))
      .catch((err) => console.error('Failed to generate Certificate QR code', err));
  }, [verificationUrl, registration.idCardNumber]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Top Action Bar */}
      {showActions && (
        <div className="no-print flex w-full max-w-4xl items-center justify-between gap-4 rounded-xl border border-slate-700 bg-slate-800/90 p-4 shadow-lg">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-1.5 rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-600"
              >
                <ArrowLeft className="h-4 w-4" /> ተመለስ
              </button>
            )}
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                የጦር መሳሪያ ምዝገባ ምስክር ወረቀት (Official A4 Certificate)
              </h2>
              <p className="text-xs text-slate-400">
                ቁጥር፡ {registration.certNumber} • የመታወቂያ ቁጥር፡ {registration.idCardNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isApproved && (
              <span className="flex items-center gap-1.5 rounded-lg bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-500/40">
                <Lock className="h-3.5 w-3.5" /> በሃላፊው እስኪጸድቅ ፕሪንት አይደረግም
              </span>
            )}
            <button
              onClick={handlePrint}
              disabled={!isApproved}
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-slate-950 shadow-md transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Printer className="h-4 w-4" />
              ሰርቲፊኬቱን ፕሪንት አድርግ (A4)
            </button>
          </div>
        </div>
      )}

      {/* A4 Printable Certificate Page */}
      <div 
        className="print-avoid-break relative overflow-hidden bg-white text-slate-950 shadow-2xl border-8 border-double border-amber-900/60 p-8 md:p-12"
        style={{
          width: '100%',
          maxWidth: '820px',
          minHeight: '1120px', // Standard A4 Aspect Ratio proportions
        }}
      >
        {/* Subtle Guilloche/Ornamental Certificate Border Line */}
        <div className="pointer-events-none absolute inset-3 border-2 border-amber-600/60"></div>
        <div className="pointer-events-none absolute inset-4 border border-slate-300"></div>

        {/* Central Watermark: Benishangul Gumuz Police Logo */}
        <div 
          className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-7"
          style={{
            backgroundImage: `url(${branding.policeLogo})`,
            backgroundPosition: 'center',
            backgroundSize: '55%',
            backgroundRepeat: 'no-repeat',
          }}
        />

        {/* Unapproved Warning Overlay */}
        {!isApproved && (
          <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center rotate-[-25deg]">
            <div className="border-4 border-dashed border-amber-600/70 bg-amber-500/10 px-12 py-4 rounded-2xl text-center shadow-lg">
              <span className="text-2xl font-black text-amber-900 tracking-widest font-serif">
                የስራ ሂደት ሃላፊውን ማጽደቅ በመጠባበቅ ላይ
              </span>
              <p className="mt-1 text-xs font-bold text-amber-800">
                ማረጋገጫ ሳይሰጥ ህጋዊ አገልግሎት አይሰጥም • ፕሪንት ማድረግ የተከለከለ ነው
              </p>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 1. TOP HEADER SECTION                                          */}
        {/* ============================================================== */}
        <div className="relative z-10">
          <div className="flex items-start justify-between border-b-2 border-amber-700/80 pb-4">
            {/* Left: Benishangul Gumuz Regional Flag */}
            <div className="flex flex-col items-center">
              <div className="h-14 w-24 overflow-hidden rounded border border-slate-400 shadow-sm">
                <img 
                  src={branding.bgrsFlag} 
                  alt="Benishangul Gumuz Flag" 
                  className="h-full w-full object-cover" 
                />
              </div>
              <span className="mt-1 text-[9px] font-bold text-slate-600">
                የቤኒሻንጉል ጉሙዝ ክልል
              </span>
            </div>

            {/* Center: Police Crest + Process Title in Amharic & English */}
            <div className="flex flex-col items-center text-center px-4">
              <div className="h-20 w-20 drop-shadow-md">
                <img 
                  src={branding.policeLogo} 
                  alt="Police Crest" 
                  className="h-full w-full object-contain" 
                />
              </div>
              <h1 className="mt-2 text-base font-extrabold text-slate-900 tracking-wide font-serif">
                {branding.commissionNameAm}
              </h1>
              <h2 className="text-sm font-bold text-amber-900">
                በቤ/ጉ/ ፖሊስ ኮሚሽን የወንጀል መከላከል የስራ ሂደት
              </h2>
              <span className="text-[11px] font-semibold text-slate-600 tracking-wider">
                B/G/ Police Commission Crime Prevention Process
              </span>
            </div>

            {/* Right: Ethiopian National Flag */}
            <div className="flex flex-col items-center">
              <div className="h-14 w-24 overflow-hidden rounded border border-slate-400 shadow-sm">
                <img 
                  src={branding.ethiopiaFlag} 
                  alt="Ethiopia Flag" 
                  className="h-full w-full object-cover" 
                />
              </div>
              <span className="mt-1 text-[9px] font-bold text-slate-600">
                የኢ.ፌ.ዴ.ሪ ሰንደቅ ዓላማ
              </span>
            </div>
          </div>

          {/* Registration Number, Date & Authenticity QR Code on Right Header */}
          <div className="mt-3 flex items-center justify-between text-xs">
            <div className="inline-flex items-center gap-1.5 rounded bg-amber-50 px-3 py-1.5 border border-amber-200">
              <span className="font-bold text-amber-900">የመታወቂያ ካርድ ቁጥር፡</span>
              <span className="font-mono font-black text-slate-900">{registration.idCardNumber}</span>
            </div>

            {/* Right: Sequential Cert Number, Date & Scannable QR Code */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end space-y-0.5">
                <div className="font-mono text-xs">
                  <span className="font-bold text-slate-700">ቁጥር፡ </span>
                  <span className="font-black text-amber-900 bg-amber-100/60 px-2 py-0.5 rounded border border-amber-300">
                    {registration.certNumber}
                  </span>
                </div>
                <div className="text-xs">
                  <span className="font-semibold text-slate-600">ቀን፡ </span>
                  <span className="font-bold text-slate-900">{registration.registrationDate}</span>
                </div>
              </div>

              {/* Scannable Certificate Authenticity QR Code */}
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 overflow-hidden rounded border-2 border-slate-300 bg-white p-0.5 shadow-sm">
                  {certQrUrl ? (
                    <img src={certQrUrl} alt="Certificate QR Code" className="h-full w-full object-contain" />
                  ) : (
                    <div className="h-full w-full bg-slate-100 animate-pulse" />
                  )}
                </div>
                <span className="text-[7.5px] font-bold text-slate-500">ለማረጋገጥ ስካን</span>
              </div>
            </div>
          </div>

          {/* Certificate Main Title Banner */}
          <div className="my-5 flex justify-center">
            <div className="relative border-b-2 border-t-2 border-amber-800 bg-amber-50/70 px-8 py-2 text-center shadow-sm">
              <h3 className="text-xl font-black text-amber-950 tracking-wider font-serif">
                የጦር መሳሪያ ምዝገባ ምስክር ወረቀት
              </h3>
              <p className="text-[11px] font-semibold text-amber-900">
                FIREARMS REGISTRATION & LICENSING CERTIFICATE
              </p>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. BODY SECTION (FULL REGISTRATION RECORD TABLE & DETAILS)     */}
        {/* ============================================================== */}
        <div className="relative z-10 space-y-4 text-xs leading-relaxed">
          {/* Top Row: Passport Photo & Primary Owner Identity */}
          <div className="flex items-start gap-4 rounded-xl border border-slate-300 bg-slate-50/60 p-3.5">
            {/* Auto-synced 3x4 Passport Photo */}
            <div className="flex flex-col items-center">
              <div className="h-32 w-24 overflow-hidden rounded-md border-2 border-amber-700 bg-white p-0.5 shadow">
                <img 
                  src={registration.photoUrl || branding.policeLogo} 
                  alt={registration.fullName} 
                  className="h-full w-full object-cover" 
                />
              </div>
              <span className="mt-1 text-[9px] font-bold text-slate-600">
                የባለመሳሪያው ፎቶ
              </span>
            </div>

            {/* Registrant Identity Grid (Items 1 - 6) */}
            <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-2">
              <div className="col-span-2 border-b border-slate-200 pb-1">
                <span className="font-bold text-slate-700">1. ሙሉ ስም፡ </span>
                <span className="text-sm font-black text-slate-900">{registration.fullName}</span>
              </div>

              <div>
                <span className="font-bold text-slate-700">2. የመኖሪያ አድራሻ፡ </span>
                <span className="font-semibold text-slate-900">
                  {registration.region} ክልል፣ {registration.zone}፣ {registration.woreda}፣ {registration.kebele}፣ የቤት ቁጥር {registration.houseNumber || '---'}
                </span>
              </div>

              <div>
                <span className="font-bold text-slate-700">3. ዜግነት፡ </span>
                <span className="font-semibold text-slate-900">{registration.nationality}</span>
              </div>

              <div>
                <span className="font-bold text-slate-700">4. ዕድሜ፡ </span>
                <span className="font-semibold text-slate-900">{registration.age} ዓመት</span>
              </div>

              <div>
                <span className="font-bold text-slate-700">5. ስራ እና ሃላፊነት፡ </span>
                <span className="font-semibold text-slate-900">
                  {registration.occupation} {registration.positionRole ? `(${registration.positionRole})` : ''}
                </span>
              </div>

              <div className="col-span-2 border-t border-slate-200 pt-1">
                <span className="font-bold text-slate-700">6. የመታወቂያ ቁጥር እና የተሰጠበት ቀን፡ </span>
                <span className="font-mono font-bold text-slate-900">
                  {registration.nationalIdNumber}
                </span>
                <span className="ml-2 text-slate-600">
                  (የተሰጠበት ቀን፡ {registration.nationalIdIssueDate})
                </span>
              </div>
            </div>
          </div>

          {/* Firearm Detailed Specifications Grid (Items 7 - 10) */}
          <div className="rounded-xl border border-slate-300 bg-white p-3.5 shadow-sm">
            <h4 className="mb-2 border-b border-amber-700/40 pb-1 text-xs font-bold text-amber-900">
              የተመዘገበው የጦር መሳሪያ ዝርዝር መረጃ (Firearm Specifications)
            </h4>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <span className="font-bold text-slate-700">7. የመሳሪያው አይነት፡ </span>
                <span className="font-black text-slate-900">{registration.firearmType}</span>
              </div>

              <div>
                <span className="font-bold text-slate-700">ንምራ ቁጥር (Serial No)፡ </span>
                <span className="font-mono font-black text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                  {registration.serialNumber}
                </span>
              </div>

              <div>
                <span className="font-bold text-slate-700">የመሳሪያ ቁጥር (መ/ቁ)፡ </span>
                <span className="font-semibold text-slate-900">{registration.weaponCode || '---'}</span>
              </div>

              <div>
                <span className="font-bold text-slate-700">8. የጥይት ብዛት እና የካርታ ብዛት፡ </span>
                <span className="font-bold text-slate-900">
                  ጥይት፡ {registration.bulletCount} | ካርታ፡ {registration.magazineCount}
                </span>
              </div>

              <div>
                <span className="font-bold text-slate-700">የመሳሪያው ንብረትነት፡ </span>
                <span className={`font-black ${registration.ownership === 'የመንግስት' ? 'text-blue-900' : 'text-emerald-900'}`}>
                  {registration.ownership}
                </span>
              </div>

              <div>
                <span className="font-bold text-slate-700">9. የመሳሪያው ይዘት/አሰራር፡ </span>
                <span className="font-semibold text-slate-900">{registration.mechanism}</span>
              </div>

              <div className="col-span-2 border-t border-slate-200 pt-1">
                <span className="font-bold text-slate-700">10. የተሰራበት ሀገር እና ዓ/ም፡ </span>
                <span className="font-semibold text-slate-900">
                  ሀገር፡ {registration.countryOfOrigin || 'ያልታወቀ'} • ዓ/ም፡ {registration.manufactureYear || '---'}
                </span>
              </div>
            </div>
          </div>

          {/* Formal Certification Statement */}
          <div className="my-3 rounded-lg border-2 border-amber-600/40 bg-amber-50/80 p-3 text-center">
            <p className="text-sm font-extrabold text-amber-950 font-serif">
              “ከላይ የተጠቀሰው መሳሪያ ለማስመዝገብ ይህ የምስክር ወረቀት ተሰጥቷቸዋል፡፡”
            </p>
            <p className="mt-0.5 text-[10px] text-slate-600">
              ይህ ሰነድ ህጋዊ የጦር መሳሪያ ምዝገባ ማረጋገጫ ሲሆን በፖሊስ ኮሚሽኑ ውሳኔና ፈቃድ የተሰጠ ነው፡፡
            </p>
          </div>

          {/* ============================================================== */}
          {/* 3. SIGNATURES & OFFICIAL STAMP SECTION                         */}
          {/* ============================================================== */}
          <div className="rounded-xl border border-slate-300 bg-slate-50/60 p-4">
            <div className="grid grid-cols-3 gap-4 items-end text-center">
              {/* Registrar Official */}
              <div className="flex flex-col items-center">
                <div className="h-12 w-full flex items-center justify-center">
                  <img 
                    src={registration.registrarSignature || branding.defaultApproverSignature} 
                    alt="Registrar Signature" 
                    className="max-h-full max-w-full object-contain" 
                  />
                </div>
                <div className="w-full border-t border-slate-400 pt-1">
                  <p className="font-bold text-slate-900">{registration.registrarName || 'ኢንስፔክተር አለሙ ከበደ'}</p>
                  <p className="text-[10px] text-slate-600">የመዝጋቢ ባለስልጣን ስምና ፊርማ</p>
                  <p className="text-[9px] text-slate-500">የተመዘገበበት ቦታ፡ {registration.registrationPlace}</p>
                </div>
              </div>

              {/* Owner / Receiver */}
              <div className="flex flex-col items-center">
                <div className="h-12 w-full flex items-center justify-center">
                  {registration.ownerSignature ? (
                    <img 
                      src={registration.ownerSignature} 
                      alt="Owner Signature" 
                      className="max-h-full max-w-full object-contain" 
                    />
                  ) : (
                    <span className="text-[11px] italic text-slate-400">የተረካቢ ፊርማ</span>
                  )}
                </div>
                <div className="w-full border-t border-slate-400 pt-1">
                  <p className="font-bold text-slate-900">{registration.fullName}</p>
                  <p className="text-[10px] text-slate-600">የተረካቢው ስምና ፊርማ</p>
                  <p className="text-[9px] text-slate-500">ቀን፡ {registration.registrationDate}</p>
                </div>
              </div>

              {/* Approving Official & Official Seal Stamp (Using Police Logo as Round Seal) */}
              <div className="relative flex flex-col items-center">
                {/* Official Round Stamp Overlay using Police Commission Logo */}
                {isApproved && (
                  <div className="absolute -top-12 -right-3 h-28 w-28 pointer-events-none z-20 rotate-[-12deg] opacity-90 drop-shadow-sm">
                    <div className="relative h-full w-full rounded-full border-4 border-dashed border-blue-900 bg-blue-900/5 p-1 flex items-center justify-center">
                      <div className="h-full w-full rounded-full border-2 border-blue-800 p-1 flex flex-col items-center justify-center text-center">
                        {/* Police Logo as Central Seal Device */}
                        <div className="h-14 w-14 opacity-95">
                          <img
                            src={branding.policeLogo}
                            alt="Police Seal Logo"
                            className="h-full w-full object-contain filter hue-rotate-190 contrast-125"
                          />
                        </div>
                        <span className="text-[7.5px] font-black tracking-tight text-blue-900 leading-none">
                          ክብ ማህተም • ጸድቋል
                        </span>
                        <span className="text-[6.5px] font-bold text-blue-800 leading-none">
                          አሶሳ / ASSOSA
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="h-12 w-full flex items-center justify-center">
                  {isApproved ? (
                    <img 
                      src={registration.approverSignature || branding.defaultApproverSignature} 
                      alt="Approver Signature" 
                      className="max-h-full max-w-full object-contain" 
                    />
                  ) : (
                    <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                      ማረጋገጫ ይጠብቃል
                    </span>
                  )}
                </div>
                <div className="w-full border-t border-slate-400 pt-1">
                  <p className="font-bold text-slate-900">
                    {registration.approverName || branding.commissionNameAm}
                  </p>
                  <p className="text-[10px] text-slate-600">የስራ ሂደት ሃላፊ ማረጋገጫ</p>
                  <p className="text-[9px] text-emerald-800 font-bold">
                    {isApproved ? 'የጸደቀና ህጋዊ ማህተም ያረፈበት' : 'በሂደት ላይ'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* 4. STRICT WARNING SECTION (ጥብቅ ማሳሰቢያ)                        */}
          {/* ============================================================== */}
          <div className="mt-4 rounded-xl border-2 border-rose-300 bg-rose-50/70 p-3.5 text-[10.5px]">
            <h5 className="mb-1 text-xs font-black text-rose-800 underline decoration-rose-400">
              ጥብቅ ማሳሰቢያ፡-
            </h5>
            <ol className="list-decimal space-y-1 pl-4 font-medium text-slate-800">
              <li>
                <b>መሳሪያዉ ከተፈቀደለት ግለሰብ/ድርጅት ለሌላ አሳልፎ መስጠት በጥብቅ የተከለከለ ነዉ፡፡</b>
              </li>
              <li>
                <b>ያስመዘገበዉ መሳሪያ ወይም ጥይት መጠን ሲጨምር ቀርቦ እንደገና ማስመዝገብ አለበት፡፡</b>
              </li>
              <li>
                <b>መሳሪያዉ የሚታደስበት ጊዜ መታወቂያዉ ከተሰጠበት ቀን ጀምሮ አንድ አመት ብቻ ይሆናል፡፡</b>
              </li>
            </ol>
          </div>

          {/* Bottom Footer Notice */}
          <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-[9px] text-slate-500">
            <span>የቤኒሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን የወንጀል መከላከል የስራ ሂደት</span>
            <span>ስልክ፡ {branding.contactPhone} • አሶሳ፣ ኢትዮጵያ</span>
            <span>ቅጽ 01/2026</span>
          </div>
        </div>
      </div>
    </div>
  );
};
