import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { FirearmRegistration, SystemBranding } from '../types/index.ts';
import { Printer, Lock, ArrowLeft, User } from 'lucide-react';

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

  // Verification URL that links directly to the public verification portal
  const verificationUrl = `${window.location.origin}${window.location.pathname}?verify=${encodeURIComponent(
    registration.idCardNumber
  )}`;

  useEffect(() => {
    QRCode.toDataURL(verificationUrl, {
      width: 260,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
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
    <div className="flex flex-col items-center gap-4">
      {/* Top Action Bar (Hidden when printing) */}
      {showActions && (
        <div className="no-print flex w-full max-w-4xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/95 p-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 transition cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" /> ተመለስ
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-white">
                  የጦር መሳሪያ ምዝገባ ምስክር ወረቀት (Official Certificate)
                </h2>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  isApproved 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {isApproved ? 'የጸደቀ (Approved)' : 'በሂደት ላይ (Unapproved)'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                የመ/ካርድ ቁጥር፡ <span className="text-amber-400 font-bold">{registration.idCardNumber}</span> • የምስክር ወረቀት ቁጥር፡ {registration.certNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isApproved && (
              <span className="flex items-center gap-1.5 rounded-xl bg-amber-500/15 px-3 py-1.5 text-xs font-bold text-amber-300 border border-amber-500/40">
                <Lock className="h-3.5 w-3.5" /> በሃላፊው እስኪጸድቅ ፕሪንት አይደረግም
              </span>
            )}
            <button
              onClick={handlePrint}
              disabled={!isApproved}
              title={isApproved ? "ሰርቲፊኬቱን በአንድ A4 ገፅ ፕሪንት አድርግ" : "በስራ ሂደት ሃላፊው እስኪጸድቅ ፕሪንት ማድረግ አይቻልም"}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              ሰርቲፊኬቱን ፕሪንት አድርግ (1 ገጽ A4)
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STRICT SINGLE PAGE A4 CERTIFICATE (የኤ4 ደንብ መሰረት 1 ገጽ ሰነድ)     */}
      {/* 210mm x 297mm - FULL PAGE FIT WITH HEADER & FOOTER            */}
      {/* ============================================================== */}
      <div 
        className="certificate-a4-page relative overflow-hidden bg-white text-slate-950 shadow-2xl border-[6px] border-amber-900/90 flex flex-col justify-between"
        style={{
          width: '210mm',
          height: '297mm',
          maxHeight: '297mm',
          minHeight: '297mm',
          boxSizing: 'border-box',
          padding: '8mm 10mm',
          fontFamily: "'Noto Sans Ethiopic', system-ui, sans-serif",
        }}
      >
        {/* Delicate Certificate Double Outer Border & Security Filigree Accents */}
        <div className="pointer-events-none absolute inset-1.5 border-2 border-amber-800/70"></div>
        <div className="pointer-events-none absolute inset-3 border border-amber-600/40"></div>
        <div className="pointer-events-none absolute top-3 left-3 h-6 w-6 border-t-2 border-l-2 border-amber-900"></div>
        <div className="pointer-events-none absolute top-3 right-3 h-6 w-6 border-t-2 border-r-2 border-amber-900"></div>
        <div className="pointer-events-none absolute bottom-3 left-3 h-6 w-6 border-b-2 border-l-2 border-amber-900"></div>
        <div className="pointer-events-none absolute bottom-3 right-3 h-6 w-6 border-b-2 border-r-2 border-amber-900"></div>

        {/* Central Watermark: Police Commission Logo (Clearly Visible and Dignified) */}
        <div 
          className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.30]"
          style={{
            backgroundImage: `url(${branding.policeLogo})`,
            backgroundPosition: 'center 46%',
            backgroundSize: '430px',
            backgroundRepeat: 'no-repeat',
          }}
        />

        {/* Watermark Notice if Pending Approval */}
        {!isApproved && (
          <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center rotate-[-22deg]">
            <div className="border-4 border-dashed border-amber-700/80 bg-amber-500/15 px-10 py-3 rounded-2xl text-center shadow-xl">
              <span className="text-xl font-black text-amber-950 tracking-wider font-serif">
                የስራ ሂደት ሃላፊውን ማረጋገጫ በመጠባበቅ ላይ
              </span>
              <p className="mt-0.5 text-[10px] font-bold text-amber-900">
                ማረጋገጫ ሳይሰጥ ህጋዊ አገልግሎት አይሰጥም • ፕሪንት ማድረግ የተከለከለ ነው
              </p>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 1. TOP HEADER SECTION (ሄደር ያለበት - FORMAL INSTITUTIONAL HEADER) */}
        {/* ============================================================== */}
        <div className="relative z-10 shrink-0">
          <div className="flex items-center justify-between border-b-2 border-amber-900 pb-2">
            {/* Left: Benishangul Gumuz Regional State Flag */}
            <div className="flex flex-col items-center">
              <div className="h-11 w-18 overflow-hidden rounded border border-slate-500 shadow-sm">
                <img 
                  src={branding.bgrsFlag} 
                  alt="Benishangul Gumuz Flag" 
                  className="h-full w-full object-cover" 
                />
              </div>
              <span className="mt-0.5 text-[8.5px] font-bold text-slate-800">
                የቤ/ጉ/ክ/ መንግስት
              </span>
            </div>

            {/* Center: Institutional Titles & Police Crest */}
            <div className="flex flex-col items-center text-center px-2">
              <div className="flex items-center gap-2.5">
                <div className="h-13 w-13 drop-shadow">
                  <img 
                    src={branding.policeLogo} 
                    alt="Police Crest" 
                    className="h-full w-full object-contain" 
                  />
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-700 tracking-wider">
                    በኢትዮጵያ ፌዴራላዊ ዲሞክራሲያዊ ሪፐብሊክ
                  </p>
                  <h1 className="text-base font-black text-slate-950 tracking-wide font-serif leading-tight">
                    {branding.commissionNameAm}
                  </h1>
                  <h2 className="text-xs font-extrabold text-amber-950 leading-tight">
                    {branding.processNameAm}
                  </h2>
                  <span className="text-[9px] font-bold text-slate-600 tracking-wider">
                    የጦር መሳሪያ ምዝገባና ፈቃድ ቁጥጥር ዋና ክፍል
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Ethiopian National Flag */}
            <div className="flex flex-col items-center">
              <div className="h-11 w-18 overflow-hidden rounded border border-slate-500 shadow-sm">
                <img 
                  src={branding.ethiopiaFlag} 
                  alt="Ethiopia Flag" 
                  className="h-full w-full object-cover" 
                />
              </div>
              <span className="mt-0.5 text-[8.5px] font-bold text-slate-800">
                የኢ.ፌ.ዴ.ሪ ሰንደቅ
              </span>
            </div>
          </div>

          {/* Registration Metadata Strip & Scannable Authenticity QR Code */}
          <div className="mt-1.5 flex items-center justify-between py-1 px-1 border-b border-amber-900/30">
            <div className="flex items-center gap-2">
              <div className="rounded bg-amber-50 px-2.5 py-1 border border-amber-300 text-[11px]">
                <span className="font-bold text-amber-950">የመታወቂያ ቁጥር፡ </span>
                <span className="font-mono font-black text-slate-950">{registration.idCardNumber}</span>
              </div>
              <div className="rounded bg-slate-50 px-2.5 py-1 border border-slate-300 text-[11px]">
                <span className="font-bold text-slate-700">የምስክር ወረቀት ቁጥር፡ </span>
                <span className="font-mono font-black text-slate-950">{registration.certNumber}</span>
              </div>
            </div>

            {/* Right: Date & Header Authenticity QR Code */}
            <div className="flex items-center gap-2.5">
              <div className="text-right text-[11px] leading-tight">
                <div>
                  <span className="font-semibold text-slate-600">የተሰጠበት ቀን፡ </span>
                  <span className="font-bold text-slate-950">{registration.registrationDate}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-600">የሚያበቃበት፡ </span>
                  <span className={`font-bold ${isExpired ? 'text-rose-700' : 'text-slate-900'}`}>
                    {registration.expiryDate} (1 አመት)
                  </span>
                </div>
              </div>

              {/* Scannable Real-Time Authenticity QR Code */}
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 overflow-hidden rounded border border-slate-400 bg-white p-0.5 shadow-sm">
                  {certQrUrl ? (
                    <img src={certQrUrl} alt="Certificate QR Code" className="h-full w-full object-contain" />
                  ) : (
                    <div className="h-full w-full bg-slate-200 animate-pulse" />
                  )}
                </div>
                <span className="text-[7px] font-bold text-slate-600">ስካን ማረጋገጫ</span>
              </div>
            </div>
          </div>

          {/* Certificate Main Title Banner */}
          <div className="mt-2 flex justify-center">
            <div className="border-y-2 border-amber-900 bg-gradient-to-r from-amber-50 via-amber-100/90 to-amber-50 px-8 py-1.5 text-center w-full shadow-sm">
              <h3 className="text-base font-black text-amber-950 tracking-wider font-serif">
                የጦር መሳሪያ ምዝገባ እና ህጋዊ ይዞታ ምስክር ወረቀት
              </h3>
              <p className="text-[10px] font-extrabold text-amber-900 tracking-wide font-sans">
                OFFICIAL FIREARMS REGISTRATION & LICENSING CERTIFICATE
              </p>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. BODY SECTION (ሙሉውን ወረቀት እንዲሞላ የተደራጀ - 10 MAIN FIELDS)  */}
        {/* ============================================================== */}
        <div className="relative z-10 flex flex-col justify-between flex-1 my-2 gap-2 text-[11px] leading-tight">
          {/* Card 1: Registrant Personal Information (የባለመሳሪያው መረጃ) */}
          <div className="rounded-xl border border-slate-300 bg-white/95 p-3 shadow-sm">
            <div className="flex items-center gap-3">
              {/* Auto-embedded Passport Photo */}
              <div className="flex flex-col items-center justify-center shrink-0">
                <div className="h-29 w-23 overflow-hidden rounded-md border-2 border-amber-800 bg-white p-0.5 shadow">
                  {registration.photoUrl ? (
                    <img 
                      src={registration.photoUrl} 
                      alt={registration.fullName} 
                      className="h-full w-full object-cover rounded-sm" 
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-slate-100 text-slate-400">
                      <User className="h-10 w-10 text-slate-400" />
                      <span className="text-[7.5px] font-bold text-slate-500 mt-1">ጉርድ ፎቶ</span>
                    </div>
                  )}
                </div>
                <span className="mt-0.5 text-[8px] font-bold text-slate-700">
                  የባለመሳሪያው ፎቶ
                </span>
              </div>

              {/* Registrant Full Data Grid */}
              <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-1.5 self-center">
                <div className="col-span-2 border-b border-slate-200 pb-1 flex items-baseline justify-between">
                  <div>
                    <span className="font-bold text-slate-700">1. ሙሉ ስም፡ </span>
                    <span className="text-sm font-black text-slate-950 font-serif">{registration.fullName}</span>
                  </div>
                  <span className="text-[9.5px] font-bold text-amber-950 bg-amber-100/90 px-2 py-0.5 rounded border border-amber-300">
                    ባለፈቃድ (Licensee)
                  </span>
                </div>

                <div className="col-span-2">
                  <span className="font-bold text-slate-700">2. የመኖሪያ አድራሻ፡ </span>
                  <span className="font-semibold text-slate-950">
                    {registration.region} ክልል፣ {registration.zone}፣ {registration.woreda}፣ {registration.kebele}፣ የቤት ቁጥር {registration.houseNumber || '---'}
                  </span>
                </div>

                <div>
                  <span className="font-bold text-slate-700">3. ዜግነት፡ </span>
                  <span className="font-semibold text-slate-950">{registration.nationality}</span>
                </div>

                <div>
                  <span className="font-bold text-slate-700">4. ዕድሜ፡ </span>
                  <span className="font-semibold text-slate-950">{registration.age} ዓመት</span>
                </div>

                <div>
                  <span className="font-bold text-slate-700">5. ስራ እና ሃላፊነት፡ </span>
                  <span className="font-semibold text-slate-950">
                    {registration.occupation} {registration.positionRole ? `(${registration.positionRole})` : ''}
                  </span>
                </div>

                <div>
                  <span className="font-bold text-slate-700">6. መታወቂያ ቁጥር እና ቀን፡ </span>
                  <span className="font-mono font-bold text-slate-950">
                    {registration.nationalIdNumber}
                  </span>
                  <span className="ml-1 text-[10px] text-slate-600">
                    ({registration.nationalIdIssueDate})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Weapon Technical Specifications (የመሳሪያው ቴክኒካዊ ዝርዝር መረጃ) */}
          <div className="rounded-xl border border-slate-300 bg-white/95 p-3 shadow-sm">
            <h4 className="mb-2 text-[10.5px] font-black text-amber-950 border-b border-amber-200 pb-1 flex items-center justify-between">
              <span>የተመዘገበው የጦር መሳሪያ ዝርዝር መረጃ (Firearm Specifications)</span>
              <span className="font-mono text-[9px] text-slate-600">ምዝገባ ደረጃ፡ ህጋዊ ይዞታ</span>
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <span className="font-bold text-slate-700">7. የመሳሪያዉ አይነት፡ </span>
                <span className="font-black text-slate-950">{registration.firearmType}</span>
              </div>

              <div>
                <span className="font-bold text-slate-700">ንምራ ቁጥር (Serial No)፡ </span>
                <span className="font-mono font-black text-slate-950 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                  {registration.serialNumber}
                </span>
              </div>

              <div>
                <span className="font-bold text-slate-700">የመሳሪያ ቁጥር (የመ/ቁ)፡ </span>
                <span className="font-semibold text-slate-950">{registration.weaponCode || '---'}</span>
              </div>

              <div>
                <span className="font-bold text-slate-700">8. የጥይትና የካርታ ብዛት፡ </span>
                <span className="font-bold text-slate-950">
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
                <span className="font-bold text-slate-700">9. የመሳሪያዉ ይዘት/አሰራር፡ </span>
                <span className="font-semibold text-slate-950">{registration.mechanism}</span>
              </div>

              <div className="col-span-2 border-t border-slate-200 pt-1.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-700">10. የተሰራበት ሀገርና ዓ/ም፡ </span>
                  <span className="font-semibold text-slate-950">
                    ሀገር፡ {registration.countryOfOrigin || 'ያልታወቀ'} • ዓ/ም፡ {registration.manufactureYear || '---'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-600">
                  <span>የምዝገባ ሁኔታ፡ </span>
                  <span className="font-bold text-emerald-800">ህጋዊ ፈቃድ የተሰጠው</span>
                </div>
              </div>
            </div>
          </div>

          {/* Attestation Banner */}
          <div className="rounded-lg border border-amber-700/60 bg-amber-50/90 py-1.5 px-3 text-center shadow-xs">
            <p className="text-xs font-black text-amber-950 font-serif leading-tight">
              “ከላይ ሙሉ ስማቸውና ዝርዝር መረጃቸው የተጠቀሰው ባለመሳሪያ በቤኒሻንጉል ጉሙዝ ክልላዊ መንግስት ፖሊስ ኮሚሽን የወንጀል መከላከል ዘርፍ ህጉ በሚያዘው መሰረት መሳሪያውን በይፋ አስመዝግበው ህጋዊ ፈቃድ የተሰጣቸው ስለመሆኑ ይህ ይፋዊ የምስክር ወረቀት ተሰጥቷቸዋል፡፡”
            </p>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. FOOTER SECTION (ግርጌ ያለበት - SIGNATURES, STAMP, WARNINGS)    */}
        {/* ============================================================== */}
        <div className="relative z-10 shrink-0 space-y-2">
          {/* Signatures & Circular Official Police Seal Section */}
          <div className="relative rounded-xl border border-slate-300 bg-slate-50/90 p-2.5">
            <div className="grid grid-cols-3 gap-3 items-end text-center">
              {/* 1. Registrar Signature Section */}
              <div className="flex flex-col items-center">
                <div className="h-11 w-full flex items-center justify-center">
                  <img 
                    src={registration.registrarSignature || branding.defaultRegistrarSignature} 
                    alt="Registrar Signature" 
                    className="max-h-full max-w-full object-contain" 
                  />
                </div>
                <div className="w-full border-t border-slate-400 pt-1">
                  <p className="font-bold text-slate-950 text-[10.5px]">
                    {registration.registrarName || 'ኢንስፔክተር አለሙ ከበደ'}
                  </p>
                  <p className="text-[9px] text-slate-600 font-semibold">የመዝጋቢ ባለስልጣን ስምና ፊርማ</p>
                  <p className="text-[8px] text-slate-500">ቦታ፡ {registration.registrationPlace} • {registration.registrationDate}</p>
                </div>
              </div>

              {/* 2. Recipient / Owner Signature Section */}
              <div className="flex flex-col items-center">
                <div className="h-11 w-full flex items-center justify-center">
                  {registration.ownerSignature ? (
                    <img 
                      src={registration.ownerSignature} 
                      alt="Owner Signature" 
                      className="max-h-full max-w-full object-contain" 
                    />
                  ) : (
                    <span className="text-[10px] italic text-slate-400">የተረካቢ ፊርማ</span>
                  )}
                </div>
                <div className="w-full border-t border-slate-400 pt-1">
                  <p className="font-bold text-slate-950 text-[10.5px]">{registration.fullName}</p>
                  <p className="text-[9px] text-slate-600 font-semibold">የተረካቢዉ (ባለመሳሪያው) ስምና ፊርማ</p>
                  <p className="text-[8px] text-slate-500">ቀን፡ {registration.registrationDate}</p>
                </div>
              </div>

              {/* 3. Approver Signature & Institutional Circular Stamp (ክብ ማህተም) */}
              <div className="relative flex flex-col items-center">
                {/* Official Circular Stamp using Police Logo as Institutional Seal */}
                <div className="absolute -top-11 -right-2 h-28 w-28 pointer-events-none z-20 rotate-[-8deg] opacity-95">
                  <div className="relative h-full w-full rounded-full border-[3px] border-dashed border-blue-900 bg-blue-900/5 p-1 flex items-center justify-center shadow-sm">
                    <div className="h-full w-full rounded-full border-2 border-blue-800 p-0.5 flex flex-col items-center justify-center text-center">
                      <span className="text-[7px] font-black tracking-tight text-blue-950 leading-none">
                        የቤ/ጉ/ ፖሊስ ኮሚሽን
                      </span>
                      {/* Institutional Police Logo as Seal Core */}
                      <div className="h-13 w-13 my-0.5">
                        <img
                          src={branding.policeLogo}
                          alt="Police Round Seal"
                          className="h-full w-full object-contain filter contrast-125"
                        />
                      </div>
                      <span className="text-[6.5px] font-black tracking-tight text-blue-900 leading-none">
                        ★ ክብ ማህተም • ጸድቋል ★
                      </span>
                      <span className="text-[6px] font-bold text-blue-800 leading-none">
                        አሶሳ / ASSOSA
                      </span>
                    </div>
                  </div>
                </div>

                <div className="h-11 w-full flex items-center justify-center">
                  {isApproved ? (
                    <img 
                      src={registration.approverSignature || branding.defaultApproverSignature} 
                      alt="Approver Signature" 
                      className="max-h-full max-w-full object-contain" 
                    />
                  ) : (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded">
                      ማረጋገጫ ይጠብቃል
                    </span>
                  )}
                </div>
                <div className="w-full border-t border-slate-400 pt-1">
                  <p className="font-bold text-slate-950 text-[10.5px]">
                    {registration.approverName || 'ኮማንደር መንግስቱ በቀለ'}
                  </p>
                  <p className="text-[9px] text-slate-600 font-semibold">የስራ ሂደት ሃላፊ ማረጋገጫ</p>
                  <p className="text-[8px] text-emerald-800 font-black">
                    {isApproved ? 'የጸደቀና ይፋዊ ማህተም ያረፈበት' : 'በሂደት ላይ'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Strict Legal Warning Section (ጥብቅ ማሳሰቢያ) */}
          <div className="rounded-lg border-2 border-rose-300 bg-rose-50/90 p-2 text-[10px]">
            <h5 className="mb-0.5 text-[10.5px] font-black text-rose-900 underline decoration-rose-400">
              ጥብቅ ማሳሰቢያ፡-
            </h5>
            <ol className="list-decimal space-y-0.5 pl-4 font-semibold text-slate-900">
              <li>
                <b>መሳሪያዉ ከተፈቀደለት ግለሰብ/ድርጅት/ለሌላ ሶስተኛ ወገን አሳልፎ መስጠት፣ ማከራየት ወይም መሸጥ በህግ በጥብቅ የተከለከለ ነዉ፡፡</b>
              </li>
              <li>
                <b>ያስመዘገበዉ መሳሪያ ወይም ጥይት መጠን ሲቀየር በ15 ቀናት ውስጥ ለፖሊስ ኮሚሽኑ ቀርቦ እንደገና ማስመዝገብ ግዴታ ነዉ፡፡</b>
              </li>
              <li>
                <b>ይህ የምስክር ወረቀት የጸናው መታወቂያው ከተሰጠበት ቀን ጀምሮ ለ1 (አንድ) ዓመት ብቻ ሲሆን ጊዜው ከማለፉ በፊት መታደስ አለበት፡፡</b>
              </li>
            </ol>
          </div>

          {/* Bottom Footer Notice (የግርጌ ማህደረ ጽሁፍ) */}
          <div className="flex items-center justify-between border-t border-slate-300 pt-1 text-[8.5px] text-slate-600">
            <span>የቤኒሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን የወንጀል መከላከል የስራ ሂደት</span>
            <span>ስልክ፡ {branding.contactPhone} • ፖ.ሳ.ቁ፡ 120 • አሶሳ፣ ኢትዮጵያ</span>
            <span className="font-mono font-bold text-slate-700">ቅጽ BGRS-POL-FA-01/2026</span>
          </div>
        </div>
      </div>
    </div>
  );
};
