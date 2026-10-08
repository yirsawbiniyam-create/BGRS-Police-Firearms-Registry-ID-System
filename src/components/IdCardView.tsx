import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { FirearmRegistration, SystemBranding } from '../types/index.ts';
import { Printer, ShieldCheck, AlertTriangle, Lock, Download, User, Scissors, Check, SlidersHorizontal } from 'lucide-react';

interface IdCardViewProps {
  registration: FirearmRegistration;
  branding: SystemBranding;
  isApprover?: boolean;
  onEdit?: () => void;
  showPrintActions?: boolean;
}

export type PrintLayoutMode = 'foldable' | 'sideBySide' | 'duplex' | 'frontOnly' | 'backOnly';

export const IdCardView: React.FC<IdCardViewProps> = ({
  registration,
  branding,
  isApprover = false,
  onEdit,
  showPrintActions = true,
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [printLayout, setPrintLayout] = useState<PrintLayoutMode>('foldable');
  const [showCropMarks, setShowCropMarks] = useState<boolean>(true);
  const printContainerRef = useRef<HTMLDivElement>(null);

  // Check if expired: expiry date < today
  const isExpired = new Date(registration.expiryDate) < new Date();
  const isApproved = registration.status === 'የጸደቀ';
  const isSuspended = registration.status === 'የታገደ';

  // Verification URL that will be encoded inside the QR Code
  const verificationUrl = `${window.location.origin}${window.location.pathname}?verify=${encodeURIComponent(
    registration.idCardNumber
  )}`;

  useEffect(() => {
    QRCode.toDataURL(verificationUrl, {
      width: 320,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error('Failed to generate QR code', err));
  }, [verificationUrl, registration.idCardNumber]);

  const handlePrint = (layoutOverride?: PrintLayoutMode) => {
    if (!isApproved) return;
    if (layoutOverride) {
      setPrintLayout(layoutOverride);
      setTimeout(() => {
        window.print();
      }, 80);
    } else {
      window.print();
    }
  };

  // =========================================================================
  // RENDER: FRONT SIDE (የፊት ገጽ)
  // No white text! All labels & values in bold amber, gold, and vibrant colors.
  // =========================================================================
  const renderFrontCard = () => (
    <div 
      className="relative overflow-hidden rounded-2xl shadow-2xl border-2 border-amber-500/90 select-none"
      style={{
        width: '420px',
        height: '265px',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 45%, #1e1b4b 100%)',
        boxSizing: 'border-box',
      }}
    >
      {/* Golden Metallic Border & Radial Accents */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl border-[3px] border-amber-400/90 shadow-inner" />
      <div className="pointer-events-none absolute -top-24 -left-24 h-48 w-48 rounded-full bg-amber-500/15 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-amber-500/15 blur-2xl" />
      
      {/* Security Guilloche Pattern Overlay (No watermark logo on front) */}
      <div className="pointer-events-none absolute inset-0 security-pattern opacity-30" />

      {/* Unapproved watermark overlay */}
      {!isApproved && (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center rotate-[-20deg]">
          <div className="border-2 border-amber-400/80 bg-black/85 px-4 py-1.5 rounded-lg text-center shadow-2xl">
            <span className="text-xs font-black text-amber-300 tracking-wider">
              የሃላፊውን ማጽደቅ በመጠባበቅ ላይ
            </span>
            <p className="text-[7.5px] font-bold text-amber-100">
              እስኪጸድቅ ድረስ ፕሪንት ማድረግ የተከለከለ ነው
            </p>
          </div>
        </div>
      )}

      <div className="relative z-10 flex h-full flex-col justify-between p-3.5">
        {/* 1. Header: Left BGRS Flag, Center Police Crest & Titles, Right Ethiopian Flag */}
        <div>
          <div className="flex items-center justify-between border-b border-amber-400/40 pb-1.5">
            {/* Left: Benishangul Gumuz Flag */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <div className="h-6 w-10 overflow-hidden rounded shadow border border-amber-300/40">
                <img 
                  src={branding.bgrsFlag} 
                  alt="BGRS Flag" 
                  className="h-full w-full object-cover" 
                />
              </div>
            </div>

            {/* Center: Police Logo between flags with Commission Title (መሀል ላይ ያለዉ የፖሊስ ሎጎ እንዳለ) */}
            <div className="flex items-center justify-center gap-2 px-1">
              <div className="h-7 w-7 flex-shrink-0 overflow-hidden rounded-full border border-amber-300/60 bg-white/10 p-0.5 shadow-sm">
                <img 
                  src={branding.policeLogo} 
                  alt="Police Logo" 
                  className="h-full w-full object-contain filter drop-shadow" 
                />
              </div>
              <div className="flex flex-col items-center text-center">
                <span className="text-[9.5px] font-extrabold tracking-wide text-amber-300 drop-shadow-sm font-serif leading-tight">
                  {branding.commissionNameAm}
                </span>
                <span className="text-[8px] font-bold text-amber-200/90 tracking-tight">
                  የጦር መሳሪያ ፈቃድ ወረቀት
                </span>
              </div>
            </div>

            {/* Right: Ethiopian Flag */}
            <div className="flex items-center gap-1 flex-shrink-0">
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
          {/* Left Details Grid (All values in bold vibrant amber/gold/emerald - No white text!) */}
          <div className="flex flex-1 flex-col justify-center space-y-0.5 text-[9.5px]">
            {/* ID Number */}
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-amber-400">መታወቂያ ቁጥር፡</span>
              <span className="font-black text-amber-300 tracking-wider font-mono text-[10.5px] bg-amber-500/25 px-1.5 py-0.5 rounded border border-amber-400/50 shadow-sm">
                {registration.idCardNumber}
              </span>
            </div>

            {/* Full Name */}
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-amber-300">ሙሉ ስም፡</span>
              <span className="font-black text-amber-200 text-[11px] truncate max-w-[195px] drop-shadow-sm">
                {registration.fullName}
              </span>
            </div>

            {/* Address */}
            <div className="flex items-center gap-1 text-[8.5px]">
              <span className="font-extrabold text-amber-400">አድራሻ፡</span>
              <span className="font-bold text-amber-100 truncate max-w-[205px]">
                {registration.region}፣ {registration.zone}፣ {registration.woreda}፣ {registration.kebele}
              </span>
            </div>

            {/* Work & Responsibility */}
            <div className="flex items-center gap-1 text-[8.5px]">
              <span className="font-extrabold text-amber-300">ስራ/ሃላፊነት፡</span>
              <span className="text-amber-100 font-extrabold truncate max-w-[180px]">
                {registration.occupation} ({registration.positionRole || 'የግል'})
              </span>
            </div>

            {/* Firearm Type & Ammo */}
            <div className="flex items-center gap-1 text-[8.5px]">
              <span className="font-extrabold text-amber-400">መሳሪያ/ጥይት፡</span>
              <span className="font-black text-emerald-300 truncate max-w-[180px]">
                {registration.firearmType} • ጥይት: {registration.bulletCount}
              </span>
            </div>

            {/* Serial No & Ownership */}
            <div className="flex items-center gap-1 text-[8.5px]">
              <span className="font-extrabold text-amber-300">ንምራ ቁጥር፡</span>
              <span className="font-mono font-black text-amber-200 tracking-wider bg-slate-900/70 px-1.5 py-0.5 rounded border border-amber-400/40">
                {registration.serialNumber} ({registration.ownership})
              </span>
            </div>
          </div>

          {/* Right Side: 3x4 Passport Photo */}
          <div className="flex flex-col items-center">
            <div className="relative h-28 w-21 overflow-hidden rounded-md border-2 border-amber-400 bg-white p-0.5 shadow-md">
              {registration.photoUrl ? (
                <img 
                  src={registration.photoUrl} 
                  alt={registration.fullName}
                  className="h-full w-full object-cover rounded-sm" 
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-slate-800 text-amber-300 rounded-sm">
                  <User className="h-10 w-10 text-amber-400/80" />
                  <span className="text-[6.5px] font-bold text-amber-200 mt-0.5">የፎቶ ቦታ</span>
                </div>
              )}
              {/* Hologram Simulated Badge in Corner of Photo */}
              <div className="pointer-events-none absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border border-amber-300/80 bg-gradient-to-tr from-amber-400 to-sky-300 opacity-80" />
            </div>
            <span className="mt-0.5 text-[7px] font-bold text-amber-300">
              3x4 ጉርድ ፎቶ
            </span>
          </div>
        </div>

        {/* 3. Bottom: Signatures and Expiry */}
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
                <span className="text-[7.5px] italic text-amber-300/80 font-mono font-bold">ተፈርሟል</span>
              )}
            </div>
            <span className="font-extrabold text-amber-300 text-[7.5px]">
              የባለመሳሪያው ፊርማ
            </span>
          </div>

          {/* Validity Expiry Indicator */}
          <div className="flex flex-col items-center text-center">
            <span className="text-[7.5px] font-extrabold text-amber-300">የሚያበቃበት፡ {registration.expiryDate}</span>
            <span className="text-[6.5px] font-mono font-black text-amber-400 tracking-widest">
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
                <span className="text-[7px] text-amber-300/80 italic font-bold">ይጸድቃል</span>
              )}
            </div>
            <span className="font-extrabold text-amber-300 text-[7.5px]">
              የሃላፊው ፊርማ
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // =========================================================================
  // RENDER: BACK SIDE (የኋላ ገጽ)
  // All text bold, pitch-black, dark, crisp and prominent!
  // =========================================================================
  const renderBackCard = () => (
    <div 
      className="relative overflow-hidden rounded-2xl shadow-2xl border-2 border-black bg-white text-black select-none"
      style={{
        width: '420px',
        height: '265px',
        boxSizing: 'border-box',
      }}
    >
      {/* Outer Border */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl border-[3px] border-amber-600/40" />

      {/* Police Logo Watermark in Center (በመታወቂያዉ በስተጀርባ ላይ የፖሊስ ኮሚሽኑ ሎጎ) */}
      <div 
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-20"
        style={{
          backgroundImage: `url(${branding.policeLogo})`,
          backgroundPosition: 'center',
          backgroundSize: '46%',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Expired Warning Watermark Overlay in Red */}
      {(isExpired || isSuspended) && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rotate-[-15deg] overflow-hidden">
          <div className="border-4 border-red-700 bg-red-600/20 px-6 py-2 rounded-xl text-center shadow-lg">
            <span className="text-2xl font-black text-red-700 tracking-wider">
              መሳሪያዉ ታግዷል!
            </span>
            <p className="text-[10px] font-black text-red-800">
              {isSuspended ? 'ፈቃዱ በኮሚሽኑ ውሳኔ ታግዷል' : 'ፈቃዱ ያበቃ እና ያልታደሰ'}
            </p>
          </div>
        </div>
      )}

      <div className="relative z-10 flex h-full flex-col justify-between p-3.5">
        {/* Top Bar: Emergency Line & Title */}
        <div className="flex items-center justify-between border-b-2 border-black/40 pb-1 text-[9.5px]">
          <span className="font-black text-black tracking-wider">
            የቤኒሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን
          </span>
          <span className="font-black text-blue-950">
            ስልክ ቁጥር {branding.contactPhone}
          </span>
        </div>

        {/* Middle Section: Large QR Code on Left, Notice & Rules on Right */}
        <div className="my-1 flex flex-1 items-center gap-3">
          {/* Left: QR Code */}
          <div className="flex flex-col items-center justify-center flex-shrink-0">
            <div className="h-28 w-28 rounded-lg border-2 border-black bg-white p-1 shadow-sm flex items-center justify-center">
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
            <span className="mt-1 text-[7.5px] font-black text-black">
              ለማረጋገጥ ስካን ያድርጉ
            </span>
          </div>

          {/* Right: Strict Notice Body Text (All bold, pitch black) */}
          <div className="flex flex-1 flex-col justify-center space-y-1 text-left">
            <div className="flex items-center gap-1">
              <span className="font-black text-[11.5px] text-red-700 underline decoration-red-600 decoration-2">
                ጥብቅ ማሳሰቢያ
              </span>
            </div>

            <p className="text-[8.5px] leading-snug font-bold text-black">
              ይህ የመታወቂያ በየአመቱ የሚታደስ ሲሆን መታወቂያዉ ካልታደሰ በየትኛዉም ቦታ ለሚያጋጥማችሁ ችግር ፈቃድ ሰጪ አካል ተጠያቂ አይሆንም፡፡
            </p>

            <div className="space-y-0.5 text-[7.5px] font-bold text-black border-t-2 border-black/30 pt-1">
              <p>1. መሳሪያዉን ከተፈቀደለት ግለሰብ/ድርጅት ውጭ ለሌላ ማስተላለፍ በጥብቅ የተከለከለ ነዉ፡፡</p>
              <p>2. ያስመዘገበዉ መሳሪያ ወይም ጥይት መጠን ሲጨምር ቀርቦ እንደገና ማስመዝገብ አለበት፡፡</p>
              <p>3. ይህ መታወቂያ ህጋዊ የሚሆነው በፖሊስ ኮሚሽኑ የወንጀል መከላከል ሂደት ሲረጋገጥ ብቻ ነው።</p>
            </div>
          </div>
        </div>

        {/* Bottom: Dates and ID Number (All bold black) */}
        <div className="flex items-center justify-between border-t-2 border-black/30 pt-1 text-[8px] text-black">
          <div className="flex gap-3 font-bold text-black">
            <span>የተሰጠበት ቀን፡ <b className="font-black text-black">{registration.registrationDate}</b></span>
            <span>የሚያበቃበት ቀን፡ <b className={isExpired ? 'font-black text-red-700' : 'font-black text-black'}>{registration.expiryDate}</b></span>
          </div>
          <div className="font-mono font-black text-black bg-slate-100 px-1.5 py-0.5 rounded border border-black/40">
            {registration.idCardNumber}
          </div>
        </div>
      </div>
    </div>
  );

  // Helper component: Professional Corner Crop Marks
  const renderCropCorner = (position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right') => {
    if (!showCropMarks) return null;
    const baseClass = "pointer-events-none absolute w-3 h-3 border-black border-opacity-70 z-20";
    switch (position) {
      case 'top-left':
        return <div className={`${baseClass} -top-1.5 -left-1.5 border-t-2 border-l-2`} />;
      case 'top-right':
        return <div className={`${baseClass} -top-1.5 -right-1.5 border-t-2 border-r-2`} />;
      case 'bottom-left':
        return <div className={`${baseClass} -bottom-1.5 -left-1.5 border-b-2 border-l-2`} />;
      case 'bottom-right':
        return <div className={`${baseClass} -bottom-1.5 -right-1.5 border-b-2 border-r-2`} />;
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-5xl">
      {/* =================================================================== */}
      {/* PROFESSIONAL PRINT CONTROLS TOOLBAR (Hidden in Print)               */}
      {/* =================================================================== */}
      {showPrintActions && (
        <div className="no-print flex w-full flex-col gap-4 rounded-2xl border border-slate-700 bg-slate-900/95 p-5 shadow-2xl backdrop-blur-md">
          {/* Status & Record Identity Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl font-bold text-white shadow-lg ${
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
                  <span className="font-black text-slate-100 text-base">
                    {registration.fullName}
                  </span>
                  <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-400/30">
                    {registration.idCardNumber}
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
                    {!isApproved ? 'በሃላፊ ያልጸደቀ' : isExpired ? 'ጊዜው ያለፈበት' : registration.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {!isApproved 
                    ? 'ማሳሰቢያ፡ ይህ መታወቂያ በኮሚሽነሩ ወይም በሃላፊው እስኪጸድቅ ድረስ ፕሪንት አይደረግም፡፡' 
                    : isExpired 
                    ? 'ማሳሰቢያ፡ መታወቂያው ከተሰጠበት 1 ዓመት ስላለፈው መሳሪያው ታግዷል!' 
                    : 'የተረጋገጠ ይፋዊ የጦር መሳሪያ ፈቃድ መታወቂያ ካርድ (CR80 Standard)'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="rounded-xl bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 cursor-pointer"
                >
                  መረጃውን አድስ
                </button>
              )}

              {/* PRIMARY ACTION: PRINT BOTH FRONT & BACK AT ONCE */}
              <button
                onClick={() => handlePrint()}
                disabled={!isApproved}
                title={!isApproved ? 'በሃላፊው እስኪጸድቅ ፕሪንት ማድረግ አይቻልም' : 'ሁለቱንም በአንድ ጊዜ ፕሪንት አድርግ'}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-sm font-black text-slate-950 shadow-xl transition hover:from-amber-400 hover:to-amber-500 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
              >
                <Printer className="h-5 w-5" />
                ሁለቱንም በአንድ ጊዜ ፕሪንት አድርግ
              </button>
            </div>
          </div>

          {/* PRINT FORMAT & OPTIONS SELECTOR */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-300 flex items-center gap-1">
                <SlidersHorizontal className="h-3.5 w-3.5 text-amber-400" />
                የህትመት አቀማመጥ፦
              </span>

              {/* Option 1: Foldable 1-Page (Recommended for Lamination) */}
              <button
                onClick={() => setPrintLayout('foldable')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition cursor-pointer ${
                  printLayout === 'foldable'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Scissors className="h-3.5 w-3.5" />
                በአንድ ገጽ ተጣጣፊ (Foldable)
              </button>

              {/* Option 2: Side-by-Side 1-Page */}
              <button
                onClick={() => setPrintLayout('sideBySide')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition cursor-pointer ${
                  printLayout === 'sideBySide'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                ጎን ለጎን በአንድ ገጽ (Side-by-Side)
              </button>

              {/* Option 3: Duplex 2 Pages */}
              <button
                onClick={() => setPrintLayout('duplex')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition cursor-pointer ${
                  printLayout === 'duplex'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                ባለ ሁለት ገጽ (Duplex 2 Pages)
              </button>

              {/* Option 4: Front Only */}
              <button
                onClick={() => setPrintLayout('frontOnly')}
                className={`rounded-lg px-2.5 py-1.5 font-bold transition cursor-pointer ${
                  printLayout === 'frontOnly'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                የፊት ብቻ
              </button>

              {/* Option 5: Back Only */}
              <button
                onClick={() => setPrintLayout('backOnly')}
                className={`rounded-lg px-2.5 py-1.5 font-bold transition cursor-pointer ${
                  printLayout === 'backOnly'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                የኋላ ብቻ
              </button>
            </div>

            {/* Toggle Crop Marks */}
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={showCropMarks}
                  onChange={(e) => setShowCropMarks(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-0 cursor-pointer"
                />
                <span className="font-medium text-xs">የመቁረጫ ምልክቶች (Crop Marks)</span>
              </label>
            </div>
          </div>

          {/* Universal Printer Compatibility Advice Note */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5 text-[11px] text-amber-200/90 flex items-center justify-between">
            <p>
              💡 <b>ሁሉንም ፕሪንተሮች ይደግፋል፡</b> Canon, Epson, HP, Brother, Xerox ወይም PVC Card ፕሪንተሮች (Evolis, Zebra)። 
              በፕሪንተርዎ አማራጭ ላይ <b>"Background graphics" (የጀርባ ምስል)</b> ማብራትዎን ያረጋግጡ።
            </p>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* PRINT CONTAINER ACCORDING TO SELECTED LAYOUT                        */}
      {/* =================================================================== */}
      <div ref={printContainerRef} className="w-full flex justify-center">

        {/* ----------------------------------------------------------------- */}
        {/* LAYOUT 1: FOLDABLE (TOP & BOTTOM WITH FOLD LINE - STRICT 1 PAGE)  */}
        {/* Ideal for card laminating pouches (Photo paper / PVC / A4)        */}
        {/* ----------------------------------------------------------------- */}
        {printLayout === 'foldable' && (
          <div className="id-card-sheet-page flex flex-col items-center justify-center p-2">
            {/* Sheet Official Header (Print only) */}
            <div className="print-only mb-3 text-center border-b border-black/30 pb-1 w-full max-w-[440px]">
              <span className="text-[11px] font-black text-black">
                የቤኒሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን — ይፋዊ የመታወቂያ ካርድ ማተሚያ ሰነድ
              </span>
              <p className="text-[8.5px] font-bold text-black mt-0.5">
                መታወቂያ ቁጥር፡ {registration.idCardNumber} | ባለቤት፡ {registration.fullName} | ቅጽ፡ BGRS-POL-ID-01
              </p>
            </div>

            {/* Foldable ID Card Pair */}
            <div className="relative flex flex-col items-center">
              {renderCropCorner('top-left')}
              {renderCropCorner('top-right')}

              {/* Front Card */}
              <div className="relative">
                {renderFrontCard()}
              </div>

              {/* Dotted Center Fold Line with Scissors */}
              <div className="w-[420px] my-2 border-t-2 border-dashed border-black/60 relative flex items-center justify-center">
                <span className="bg-white px-2 text-[8px] font-black text-black flex items-center gap-1 border border-black/30 rounded-full">
                  <Scissors className="h-2.5 w-2.5 text-black" />
                  የማጠፊያ መስመር (Fold along this line and laminate)
                </span>
              </div>

              {/* Back Card */}
              <div className="relative">
                {renderBackCard()}
              </div>

              {renderCropCorner('bottom-left')}
              {renderCropCorner('bottom-right')}
            </div>

            {/* Sheet Official Footer (Print only) */}
            <div className="print-only mt-3 text-center border-t border-black/30 pt-1 w-full max-w-[440px] text-[7.5px] font-bold text-black">
              ማሳሰቢያ፡ ይህ መታወቂያ ህጋዊ የሚሆነው በፖሊስ ኮሚሽኑ የወንጀል መከላከል ሂደት ሲረጋገጥ ብቻ ነው።
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* LAYOUT 2: SIDE-BY-SIDE (FRONT & BACK HORIZONTAL - STRICT 1 PAGE)  */}
        {/* Fits A4 width with safe margins on any printer                    */}
        {/* ----------------------------------------------------------------- */}
        {printLayout === 'sideBySide' && (
          <div className="id-card-sheet-page flex flex-col items-center justify-center p-2">
            {/* Sheet Official Header (Print only) */}
            <div className="print-only mb-4 text-center border-b border-black/30 pb-1 w-full">
              <span className="text-[12px] font-black text-black">
                የቤኒሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን — ይፋዊ የመታወቂያ ካርድ ማተሚያ ሰነድ
              </span>
              <p className="text-[9px] font-bold text-black mt-0.5">
                መታወቂያ ቁጥር፡ {registration.idCardNumber} | ባለቤት፡ {registration.fullName} | ቅጽ፡ BGRS-POL-ID-01
              </p>
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-center gap-6">
              {/* Front Card with its own crop marks */}
              <div className="relative">
                {renderCropCorner('top-left')}
                {renderCropCorner('top-right')}
                {renderCropCorner('bottom-left')}
                {renderCropCorner('bottom-right')}
                {renderFrontCard()}
              </div>

              {/* Back Card with its own crop marks */}
              <div className="relative">
                {renderCropCorner('top-left')}
                {renderCropCorner('top-right')}
                {renderCropCorner('bottom-left')}
                {renderCropCorner('bottom-right')}
                {renderBackCard()}
              </div>
            </div>

            {/* Sheet Official Footer (Print only) */}
            <div className="print-only mt-4 text-center border-t border-black/30 pt-1 w-full text-[8px] font-bold text-black">
              ማሳሰቢያ፡ ይህ መታወቂያ ህጋዊ የሚሆነው በፖሊስ ኮሚሽኑ ማህተም እና ፊርማ ሲረጋገጥ ብቻ ነው።
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* LAYOUT 3: DUPLEX (2 PAGES - PAGE 1 FRONT, PAGE 2 BACK)           */}
        {/* For double-sided printers or PVC card printers with flipper       */}
        {/* ----------------------------------------------------------------- */}
        {printLayout === 'duplex' && (
          <div className="w-full flex flex-col items-center gap-8">
            {/* Page 1: Front */}
            <div className="id-card-duplex-page print-page-break flex flex-col items-center justify-center">
              <div className="print-only mb-3 text-center">
                <span className="text-[10px] font-black text-black">የመታወቂያ የፊት ገጽ (Front Face)</span>
              </div>
              <div className="relative">
                {renderCropCorner('top-left')}
                {renderCropCorner('top-right')}
                {renderCropCorner('bottom-left')}
                {renderCropCorner('bottom-right')}
                {renderFrontCard()}
              </div>
            </div>

            {/* Page 2: Back */}
            <div className="id-card-duplex-page flex flex-col items-center justify-center">
              <div className="print-only mb-3 text-center">
                <span className="text-[10px] font-black text-black">የመታወቂያ የኋላ ገጽ (Back Face)</span>
              </div>
              <div className="relative">
                {renderCropCorner('top-left')}
                {renderCropCorner('top-right')}
                {renderCropCorner('bottom-left')}
                {renderCropCorner('bottom-right')}
                {renderBackCard()}
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* LAYOUT 4: FRONT ONLY                                              */}
        {/* ----------------------------------------------------------------- */}
        {printLayout === 'frontOnly' && (
          <div className="id-card-duplex-page flex flex-col items-center justify-center p-2">
            <div className="relative">
              {renderCropCorner('top-left')}
              {renderCropCorner('top-right')}
              {renderCropCorner('bottom-left')}
              {renderCropCorner('bottom-right')}
              {renderFrontCard()}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* LAYOUT 5: BACK ONLY                                               */}
        {/* ----------------------------------------------------------------- */}
        {printLayout === 'backOnly' && (
          <div className="id-card-duplex-page flex flex-col items-center justify-center p-2">
            <div className="relative">
              {renderCropCorner('top-left')}
              {renderCropCorner('top-right')}
              {renderCropCorner('bottom-left')}
              {renderCropCorner('bottom-right')}
              {renderBackCard()}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
