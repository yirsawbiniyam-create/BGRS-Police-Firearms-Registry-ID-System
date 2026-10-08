import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { FirearmRegistration, SystemBranding } from '../types/index.ts';
import { Printer, ShieldCheck, AlertTriangle, Lock, Eye, Download } from 'lucide-react';

interface IdCardViewProps {
  registration: FirearmRegistration;
  branding: SystemBranding;
  isApprover?: boolean;
  onEdit?: () => void;
  showPrintActions?: boolean;
}

export const IdCardView: React.FC<IdCardViewProps> = ({
  registration,
  branding,
  isApprover = false,
  onEdit,
  showPrintActions = true,
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const printContainerRef = useRef<HTMLDivElement>(null);

  // Check if expired: expiry date < today
  const isExpired = new Date(registration.expiryDate) < new Date();
  const isApproved = registration.status === 'የጸደቀ';
  const isSuspended = registration.status === 'የታገደ';

  // Verification URL that will be encoded inside the QR Code
  // In production it links to the host with verification query parameter
  const verificationUrl = `${window.location.origin}${window.location.pathname}?verify=${registration.idCardNumber}`;

  useEffect(() => {
    QRCode.toDataURL(verificationUrl, {
      width: 320,
      margin: 1,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error('Failed to generate QR code', err));
  }, [verificationUrl, registration.idCardNumber]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Top Banner Actions & Status Warnings */}
      {showPrintActions && (
        <div className="no-print flex w-full max-w-4xl flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-800/90 p-4 shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white shadow ${
              !isApproved 
                ? 'bg-amber-500' 
                : isExpired || isSuspended 
                ? 'bg-rose-600' 
                : 'bg-emerald-600'
            }`}>
              {!isApproved ? (
                <Lock className="h-5 w-5" />
              ) : isExpired || isSuspended ? (
                <AlertTriangle className="h-5 w-5" />
              ) : (
                <ShieldCheck className="h-5 w-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100">
                  {registration.fullName} - {registration.idCardNumber}
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  !isApproved
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                    : isExpired
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : isSuspended
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {!isApproved ? 'በሃላፊ ያልጸደቀ (Unapproved)' : isExpired ? 'ጊዜው ያለፈበት (Expired)' : registration.status}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {!isApproved 
                  ? 'ማሳሰቢያ፡ ይህ መታወቂያ በሃላፊው እስኪጸድቅ ድረስ ፕሪንት አይደረግም፡፡' 
                  : isExpired 
                  ? 'ማሳሰቢያ፡ መታወቂያው ከተሰጠበት 1 ዓመት ስላለፈው መሳሪያው ታግዷል!' 
                  : 'የተረጋገጠ ህጋዊ የጦር መሳሪያ ፈቃድ መታወቂያ ካርድ'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="rounded-lg bg-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-600"
              >
                መረጃውን አድስ / Edit
              </button>
            )}

            <button
              onClick={handlePrint}
              disabled={!isApproved}
              title={!isApproved ? 'በሃላፊው እስኪጸድቅ ፕሪንት ማድረግ አይቻልም' : 'መታወቂያውን ፕሪንት አድርግ'}
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-slate-950 shadow-md transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Printer className="h-4 w-4" />
              መታወቂያውን ፕሪንት አድርግ (ATM Size)
            </button>
          </div>
        </div>
      )}

      {/* ID Card Front and Back Display Container */}
      <div 
        ref={printContainerRef}
        className="print-avoid-break flex flex-col md:flex-row items-center justify-center gap-6 p-2"
      >
        {/* ============================================================== */}
        {/* FRONT SIDE (የፊት ገጽ) - Golden Professional Theme              */}
        {/* ATM Size Ratio CR80 (85.6mm x 53.98mm, ratio 1.586)             */}
        {/* ============================================================== */}
        <div 
          className="relative overflow-hidden rounded-2xl shadow-2xl transition-transform hover:scale-[1.01] border-2 border-amber-500/80"
          style={{
            width: '420px',
            height: '265px',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 45%, #1e1b4b 100%)',
          }}
        >
          {/* Subtle Golden Metallic Border & Radial Accents */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl border-[3px] border-amber-400/90 shadow-inner"></div>
          <div className="pointer-events-none absolute -top-24 -left-24 h-48 w-48 rounded-full bg-amber-500/15 blur-2xl"></div>
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-amber-500/15 blur-2xl"></div>
          
          {/* Security Guilloche Pattern Overlay */}
          <div className="pointer-events-none absolute inset-0 security-pattern opacity-30"></div>

          {/* Watermark Police Logo on Front */}
          <div 
            className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-25"
            style={{
              backgroundImage: `url(${branding.policeLogo})`,
              backgroundPosition: 'center',
              backgroundSize: '48%',
              backgroundRepeat: 'no-repeat',
            }}
          />

          {/* Unapproved watermark overlay */}
          {!isApproved && (
            <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center rotate-[-20deg]">
              <div className="border-2 border-amber-400/80 bg-black/85 px-4 py-1.5 rounded-lg text-center shadow-2xl">
                <span className="text-xs font-black text-amber-300 tracking-wider">
                  የሃላፊውን ማጽደቅ በመጠባበቅ ላይ
                </span>
                <p className="text-[7.5px] font-bold text-slate-300">
                  እስኪጸድቅ ድረስ ፕሪንት ማድረግ የተከለከለ ነው
                </p>
              </div>
            </div>
          )}

          <div className="relative z-10 flex h-full flex-col justify-between p-3.5">
            {/* 1. Header: Left BGRS Flag, Center Police Crest, Right Ethiopian Flag */}
            <div>
              <div className="flex items-center justify-between border-b border-amber-400/40 pb-1.5">
                {/* Left: Benishangul Gumuz Flag */}
                <div className="flex items-center gap-1">
                  <div className="h-6 w-10 overflow-hidden rounded shadow border border-amber-300/40">
                    <img 
                      src={branding.bgrsFlag} 
                      alt="BGRS Flag" 
                      className="h-full w-full object-cover" 
                    />
                  </div>
                </div>

                {/* Center: Police Logo + Title */}
                <div className="flex flex-col items-center text-center">
                  <div className="flex items-center gap-1.5">
                    <div className="h-7 w-7 drop-shadow-md">
                      <img 
                        src={branding.policeLogo} 
                        alt="Police Logo" 
                        className="h-full w-full object-contain" 
                      />
                    </div>
                    <div className="flex flex-col text-center">
                      <span className="text-[10px] font-extrabold tracking-wide text-amber-300 drop-shadow-sm font-serif">
                        {branding.commissionNameAm}
                      </span>
                      <span className="text-[8px] font-bold text-amber-200/90 tracking-tighter">
                        የጦር መሳሪያ ፈቃድ ወረቀት
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Ethiopian Flag */}
                <div className="flex items-center gap-1">
                  <div className="h-6 w-10 overflow-hidden rounded shadow border border-amber-300/40">
                    <img 
                      src={branding.ethiopiaFlag} 
                      alt="Ethiopia Flag" 
                      className="h-full w-full object-cover" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Middle Body: Left Data Columns, Right 3x4 Passport Photo */}
            <div className="mt-1 flex flex-1 items-center justify-between gap-2">
              {/* Left Details Grid */}
              <div className="flex flex-1 flex-col justify-center space-y-0.5 text-[9.5px]">
                {/* ID Number */}
                <div className="flex items-center gap-1">
                  <span className="font-bold text-amber-400">መታወቂያ ቁጥር፡</span>
                  <span className="font-black text-white tracking-wider font-mono text-[10px] bg-amber-500/20 px-1 rounded border border-amber-400/30">
                    {registration.idCardNumber}
                  </span>
                </div>

                {/* Full Name */}
                <div className="flex items-center gap-1">
                  <span className="font-bold text-amber-300">ሙሉ ስም፡</span>
                  <span className="font-extrabold text-white text-[10px] truncate max-w-[190px]">
                    {registration.fullName}
                  </span>
                </div>

                {/* Address */}
                <div className="flex items-center gap-1 text-[8.5px] text-slate-200">
                  <span className="font-semibold text-amber-400">አድራሻ፡</span>
                  <span className="truncate max-w-[200px]">
                    {registration.region}፣ {registration.zone}፣ {registration.woreda}፣ {registration.kebele}
                  </span>
                </div>

                {/* Work & Responsibility */}
                <div className="flex items-center gap-1 text-[8.5px]">
                  <span className="font-semibold text-amber-300">ስራ/ሃላፊነት፡</span>
                  <span className="text-slate-100 font-medium truncate max-w-[170px]">
                    {registration.occupation} ({registration.positionRole || 'የግል'})
                  </span>
                </div>

                {/* Firearm Type & Ammo */}
                <div className="flex items-center gap-1 text-[8.5px]">
                  <span className="font-bold text-amber-400">መሳሪያ/ጥይት፡</span>
                  <span className="font-bold text-emerald-300 truncate max-w-[170px]">
                    {registration.firearmType} • ጥይት: {registration.bulletCount}
                  </span>
                </div>

                {/* Serial No & Ownership */}
                <div className="flex items-center gap-1 text-[8.5px]">
                  <span className="font-semibold text-amber-300">ንምራ ቁጥር፡</span>
                  <span className="font-mono text-white tracking-tight">
                    {registration.serialNumber} ({registration.ownership})
                  </span>
                </div>
              </div>

              {/* Right Side: 3x4 Passport Photo with neat white-ish border */}
              <div className="flex flex-col items-center">
                <div className="relative h-28 w-21 overflow-hidden rounded-md border-2 border-amber-300 bg-white p-0.5 shadow-md">
                  <img 
                    src={registration.photoUrl || branding.policeLogo} 
                    alt={registration.fullName}
                    className="h-full w-full object-cover rounded-sm" 
                  />
                  {/* Hologram Simulated Badge in Corner of Photo */}
                  <div className="pointer-events-none absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border border-amber-300/80 bg-gradient-to-tr from-amber-400 to-sky-300 opacity-80"></div>
                </div>
                <span className="mt-0.5 text-[7px] font-bold text-amber-300/90">
                  3x4 ጉርድ ፎቶ
                </span>
              </div>
            </div>

            {/* 3. Bottom: Signatures straight across */}
            <div className="mt-0.5 flex items-end justify-between border-t border-amber-400/40 pt-1 text-[8px]">
              {/* Owner Signature */}
              <div className="flex flex-col items-center">
                <div className="h-6 w-20 flex items-center justify-center">
                  {registration.ownerSignature ? (
                    <img 
                      src={registration.ownerSignature} 
                      alt="Owner Signature" 
                      className="max-h-full max-w-full object-contain filter invert drop-shadow" 
                    />
                  ) : (
                    <span className="text-[7.5px] italic text-slate-400 font-mono">ተፈርሟል</span>
                  )}
                </div>
                <span className="font-semibold text-amber-300 text-[7.5px]">
                  የባለመሳሪያው ፊርማ
                </span>
              </div>

              {/* Validity Expiry Indicator */}
              <div className="flex flex-col items-center text-center">
                <span className="text-[7px] text-slate-300">የሚያበቃበት፡ {registration.expiryDate}</span>
                <span className="text-[6.5px] font-mono text-amber-400/80 tracking-widest">
                  BENISHANGUL GUMUZ POLICE
                </span>
              </div>

              {/* Approver Signature */}
              <div className="flex flex-col items-center">
                <div className="h-6 w-20 flex items-center justify-center">
                  {isApproved ? (
                    <img 
                      src={registration.approverSignature || branding.defaultApproverSignature} 
                      alt="Approver Signature" 
                      className="max-h-full max-w-full object-contain filter invert drop-shadow" 
                    />
                  ) : (
                    <span className="text-[7px] text-amber-400 italic">ይጸድቃል</span>
                  )}
                </div>
                <span className="font-semibold text-amber-300 text-[7.5px]">
                  የሃላፊው ፊርማ
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* BACK SIDE (የኋላ ገጽ) - Crisp White Background, Watermark, QR  */}
        {/* ============================================================== */}
        <div 
          className="relative overflow-hidden rounded-2xl shadow-2xl transition-transform hover:scale-[1.01] border-2 border-slate-300 bg-white text-slate-900"
          style={{
            width: '420px',
            height: '265px',
          }}
        >
          {/* Subtle Outer Border */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl border-[3px] border-amber-600/30"></div>

          {/* Police Logo Watermark in Center (በመታወቂያዉ በስተጀርባ ላይ የፖሊስ ኮሚሽኑ ሎጎ በዋተር ማርክ) */}
          <div 
            className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-22"
            style={{
              backgroundImage: `url(${branding.policeLogo})`,
              backgroundPosition: 'center',
              backgroundSize: '48%',
              backgroundRepeat: 'no-repeat',
            }}
          />

          {/* Expired Warning Watermark Overlay in Red (መሳሪያው ታግዷል!) */}
          {(isExpired || isSuspended) && (
            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rotate-[-15deg] overflow-hidden">
              <div className="border-4 border-rose-600/90 bg-rose-600/15 px-6 py-2 rounded-xl text-center shadow-lg">
                <span className="text-2xl font-black text-rose-700 tracking-wider">
                  መሳሪያዉ ታግዷል!
                </span>
                <p className="text-[10px] font-bold text-rose-800">
                  {isSuspended ? 'ፈቃዱ በኮሚሽኑ ውሳኔ ታግዷል' : 'ፈቃዱ ያበቃ እና ያልታደሰ'}
                </p>
              </div>
            </div>
          )}

          <div className="relative z-10 flex h-full flex-col justify-between p-3.5">
            {/* Top Bar: Emergency Line & Title */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-1 text-[9px]">
              <span className="font-black text-slate-800 tracking-wider">
                የቤኒሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን
              </span>
              <span className="font-bold text-blue-900">
                ስልክ ቁጥር {branding.contactPhone}
              </span>
            </div>

            {/* Middle Section: Large QR Code on Left, Notice & Rules on Right */}
            <div className="my-1 flex flex-1 items-center gap-3">
              {/* Left: Large QR Code for Authenticity & Verification */}
              <div className="flex flex-col items-center justify-center">
                <div className="h-28 w-28 rounded-lg border-2 border-slate-300 bg-white p-1 shadow-sm flex items-center justify-center">
                  {qrCodeDataUrl ? (
                    <img 
                      src={qrCodeDataUrl} 
                      alt="Verification QR Code" 
                      className="h-full w-full object-contain" 
                    />
                  ) : (
                    <div className="h-full w-full animate-pulse bg-slate-100" />
                  )}
                </div>
                <span className="mt-0.5 text-[7px] font-bold text-slate-600">
                  ለማረጋገጥ ስካን ያድርጉ
                </span>
              </div>

              {/* Right: Strict Notice Body Text */}
              <div className="flex flex-1 flex-col justify-center space-y-1 text-left">
                <div className="flex items-center gap-1">
                  <span className="font-black text-[11px] text-rose-700 underline decoration-rose-300">
                    ጥብቅ ማሳሰቢያ
                  </span>
                </div>

                <p className="text-[8px] leading-tight font-medium text-slate-800">
                  ይህ የመታወቂያ በየአመቱ የሚታደስ ሲሆን መታወቂያዉ ካልታደሰ በየትኛዉም ቦታ ለሚያጋጥማችሁ ችግር ፈቃድ ሰጪ አካል ተጠያቂ አይሆንም፡፡
                </p>

                <div className="space-y-0.5 text-[7px] text-slate-700 border-t border-slate-200 pt-1">
                  <p>1. መሳሪያዉን ከተፈቀደለት ግለሰብ/ድርጅት ውጭ ለሌላ ማስተላለፍ በጥብቅ የተከለከለ ነዉ፡፡</p>
                  <p>2. ያስመዘገበዉ መሳሪያ ወይም ጥይት መጠን ሲጨምር ቀርቦ እንደገና ማስመዝገብ አለበት፡፡</p>
                  <p>3. ይህ መታወቂያ ህጋዊ የሚሆነው በፖሊስ ኮሚሽኑ የወንጀል መከላከል ሂደት ሲረጋገጥ ብቻ ነው።</p>
                </div>
              </div>
            </div>

            {/* Bottom: Dates, Serial, and Micro-Stamp */}
            <div className="flex items-center justify-between border-t border-slate-200 pt-1 text-[7.5px] text-slate-600">
              <div className="flex gap-2">
                <span>የተሰጠበት ቀን፡ <b>{registration.registrationDate}</b></span>
                <span>የሚያበቃበት ቀን፡ <b className={isExpired ? 'text-rose-600' : 'text-slate-800'}>{registration.expiryDate}</b></span>
              </div>
              <div className="font-mono font-bold text-slate-800">
                {registration.idCardNumber}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
