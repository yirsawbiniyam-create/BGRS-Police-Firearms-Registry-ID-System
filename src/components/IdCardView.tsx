import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { FirearmRegistration, SystemBranding } from '../types/index.ts';
import { FirearmLifecycleModal } from './FirearmLifecycleModal.tsx';
import { encodeCode128B } from '../utils/barcode.ts';
import { Printer, ShieldCheck, AlertTriangle, Lock, Download, User, Scissors, Check, SlidersHorizontal, CreditCard, ArrowRightLeft, Archive, Phone } from 'lucide-react';

interface IdCardViewProps {
  registration: FirearmRegistration;
  branding: SystemBranding;
  isApprover?: boolean;
  onEdit?: () => void;
  showPrintActions?: boolean;
  frontOnly?: boolean;
}

export type PrintLayoutMode = 'foldable' | 'sideBySide' | 'duplex' | 'frontOnly' | 'backOnly';

export const IdCardView: React.FC<IdCardViewProps> = ({
  registration,
  branding,
  isApprover = false,
  onEdit,
  showPrintActions = true,
  frontOnly = false,
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [printLayout, setPrintLayout] = useState<PrintLayoutMode>('foldable');
  const [showCropMarks, setShowCropMarks] = useState<boolean>(true);
  const [screenZoom, setScreenZoom] = useState<'atm' | 'large'>('atm');
  const [showLifecycleModal, setShowLifecycleModal] = useState<boolean>(false);
  const printContainerRef = useRef<HTMLDivElement>(null);

  // Use the user's uploaded logo completely untouched (no whitening/erasing) inside a circular watermark
  const isCustomPoliceLogo =
    Boolean(branding.policeLogo) && !branding.policeLogo.startsWith('data:image/svg+xml');
  const watermarkLogoSrc = isCustomPoliceLogo
    ? branding.policeLogo
    : branding.watermarkLogo || branding.policeLogo;

  // Check if expired: expiry date < today
  const isExpired = new Date(registration.expiryDate) < new Date();
  const isApproved = registration.status === 'የጸደቀ';
  const isSuspended = registration.status === 'የታገደ';
  const isSurrendered = registration.status === 'ገቢ የተደረገ' || registration.isSurrendered;
  const serialBarcode = encodeCode128B(registration.serialNumber || 'SN-0000');

  // Verification URL that will be encoded inside the QR Code
  const verificationUrl = `${window.location.origin}${window.location.pathname}?verify=${encodeURIComponent(
    registration.idCardNumber
  )}`;

  useEffect(() => {
    if (!isApproved) {
      setQrCodeDataUrl('');
      return;
    }
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
  }, [verificationUrl, registration.idCardNumber, isApproved]);

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
  // Rich colored Police Royal Blue main card (neither dark/black nor white)
  // transitioning smoothly into a whitish zone strictly around the borderless
  // portrait, with a full-bleed circular Police Logo.
  // =========================================================================
  const renderFrontCard = () => (
    <div 
      className="relative overflow-hidden rounded-2xl shadow-2xl border-2 border-amber-500/90 select-none"
      style={{
        width: '420px',
        height: '265px',
        background: 'linear-gradient(100deg, #98bce4 0%, #b1cfee 36%, #cbe0f5 56%, #e7f0f9 68%, #f7f9fc 78%, #ffffff 90%, #ffffff 100%)',
        boxSizing: 'border-box',
      }}
    >
      {/* Golden Inner Trim & Pure Whitish Glow Localized Around Right Portrait Zone */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl border-[2.5px] border-amber-400/80 shadow-inner" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 140px 150px at 85% 52%, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.9) 55%, transparent 100%)',
        }}
      />
      
      {/* Subtle Security Guilloche Pattern Overlay */}
      <div className="pointer-events-none absolute inset-0 security-pattern opacity-15" />

      {/* Unapproved watermark overlay */}
      {!isApproved && (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center rotate-[-20deg]">
          <div className="border-2 border-amber-600 bg-white/95 px-4 py-1.5 rounded-lg text-center shadow-2xl">
            <span className="text-xs font-black text-amber-900 tracking-wider">
              የሃላፊውን ማጽደቅ በመጠባበቅ ላይ
            </span>
            <p className="text-[7.5px] font-bold text-slate-800">
              እስኪጸድቅ ድረስ ፕሪንት ማድረግ የተከለከለ ነው
            </p>
          </div>
        </div>
      )}

      {/* Surrendered watermark overlay */}
      {isSurrendered && (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center rotate-[-15deg]">
          <div className="border-2 border-rose-600 bg-rose-50/95 px-4 py-1.5 rounded-xl text-center shadow-2xl">
            <span className="text-xs font-black text-rose-800 tracking-wider">
              ይህ መሳሪያ ገቢ ተደርጓል (በግምጃ ቤት)
            </span>
            <p className="text-[7.5px] font-bold text-rose-700">
              {registration.surrenderReason ? `ምክንያት፡ ${registration.surrenderReason}` : 'በፖሊስ ግምጃ ቤት ተረክቧል'}
            </p>
          </div>
        </div>
      )}

      <div className="relative z-10 flex h-full flex-col justify-between">
        {/* 1. Header: Unified Royal Police Blue Banner with Left BGRS Flag, Crisp Circular Police Crest & Titles, Right Ethiopian Flag */}
        <div
          className="px-3 pt-1.5 pb-1 border-b-2 border-amber-400/85 shadow-sm"
          style={{
            background: 'linear-gradient(90deg, #11305c 0%, #1b4885 50%, #11305c 100%)',
          }}
        >
          <div className="flex items-center justify-between gap-1">
            {/* Left: Benishangul Gumuz Flag */}
            <div className="flex items-center flex-shrink-0">
              <div className="h-6 w-10 overflow-hidden rounded shadow-sm border border-amber-300/60">
                <img 
                  src={branding.bgrsFlag} 
                  alt="BGRS Flag" 
                  className="h-full w-full object-cover" 
                />
              </div>
            </div>

            {/* Center: Strictly Circular Police Logo Filling Its Circle & Commission Title */}
            <div className="flex items-center justify-center gap-2 px-1 min-w-0">
              <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-full border-[1.5px] border-amber-300 bg-white shadow-md">
                <img 
                  src={branding.policeLogo} 
                  alt="Police Logo" 
                  className="h-full w-full rounded-full object-cover object-center" 
                />
              </div>
              <div className="flex flex-col items-center text-center min-w-0">
                <span className="text-[9px] font-black tracking-wide text-amber-300 font-serif leading-tight drop-shadow-xs">
                  {branding.commissionNameAm}
                </span>
                <span className="text-[7.5px] font-extrabold text-sky-200 tracking-tight">
                  የጦር መሳሪያ ፈቃድ መታወቂያ
                </span>
              </div>
            </div>

            {/* Right: Ethiopian Flag */}
            <div className="flex items-center flex-shrink-0">
              <div className="h-6 w-10 overflow-hidden rounded shadow-sm border border-amber-300/60">
                <img 
                  src={branding.ethiopiaFlag} 
                  alt="Ethiopia Flag" 
                  className="h-full w-full object-cover" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Middle Body: Left Spacious Bold Non-White Colored Data + Raised Gold ID & Phone Strip, Right Uncropped Portrait + Serial Barcode */}
        <div className="flex flex-1 items-stretch justify-between gap-1 px-2.5 py-1 min-h-0">
          {/* Left Details Column - Spacious, Slightly Larger Text Extending Downward to Barcode Level */}
          <div className="flex flex-1 flex-col justify-between min-w-0 pt-0.5 pb-0.5">
            {/* Raised Top Highlight Row: Distinct Gold-Embossed ID Card Number + Paired Phone Number */}
            <div className="flex flex-wrap items-center justify-between gap-1 pb-1 border-b border-blue-900/25">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[8px] font-black text-[#092147] tracking-tight">
                  መታወቂያ ቁጥር፡
                </span>
                <span
                  className="inline-block rounded-md border border-amber-700/60 px-2 py-0.5 font-serif text-[10.5px] font-black tracking-[0.08em] text-[#7c1111] shadow-sm"
                  style={{
                    background: 'linear-gradient(135deg, #fef08a 0%, #facc15 50%, #f59e0b 100%)',
                  }}
                >
                  {registration.idCardNumber}
                </span>
              </div>
              {registration.phoneNumber && (
                <span className="inline-flex items-center gap-1 rounded-md border border-blue-900/35 bg-white/80 px-1.5 py-0.5 font-mono text-[8px] font-black text-[#0a234f] shadow-2xs">
                  <Phone className="h-2.5 w-2.5 text-blue-800 flex-shrink-0" />
                  <span>{registration.phoneNumber}</span>
                </span>
              )}
            </div>

            {/* Spaced Data Rows Distributed Downward to Align With Barcode — Smaller Blue Labels vs Larger Bold Distinct-Color Answers */}
            <div className="flex flex-1 flex-col justify-evenly pt-1 pb-0.5 gap-1">
              {/* Full Name */}
              <div className="leading-[1.24] break-words whitespace-normal">
                <span className="text-[7.5px] font-bold text-[#1e3a8a] mr-1">ሙሉ ስም፡</span>
                <span className="text-[11.5px] font-black text-[#7f1d1d]">
                  {registration.fullName}
                </span>
              </div>

              {/* Address */}
              <div className="leading-[1.24] break-words whitespace-normal">
                <span className="text-[7.5px] font-bold text-[#1e3a8a] mr-1">አድራሻ፡</span>
                <span className="text-[9.5px] font-black text-slate-950">
                  {registration.region}፣ {registration.zone}፣ {registration.woreda}፣ {registration.kebele}
                  {registration.houseNumber ? ` (ቤ/ቁ ${registration.houseNumber})` : ''}
                </span>
              </div>

              {/* Work & Responsibility */}
              <div className="leading-[1.24] break-words whitespace-normal">
                <span className="text-[7.5px] font-bold text-[#1e3a8a] mr-1">ስራ/ሃላፊነት፡</span>
                <span className="text-[9.5px] font-black text-[#4c1d95]">
                  {registration.occupation} ({registration.positionRole || 'የግል'})
                </span>
              </div>

              {/* Firearm Type on Its Own Separate Line */}
              <div className="leading-[1.24] break-words whitespace-normal">
                <span className="text-[7.5px] font-bold text-[#1e3a8a] mr-1">መሳሪያ፡</span>
                <span className="text-[9.5px] font-black text-[#064e3b]">
                  {registration.firearmType} ({registration.ownership})
                </span>
              </div>

              {/* Bullets & Magazines on Its Own Separate Line Below */}
              <div className="leading-[1.24] break-words whitespace-normal">
                <span className="text-[7.5px] font-bold text-[#1e3a8a] mr-1">ጥይት/ካርታ፡</span>
                <span className="text-[9.5px] font-black text-[#9a3412]">
                  ጥይት: {registration.bulletCount} • ካርታ: {registration.magazineCount}
                </span>
              </div>
            </div>
          </div>

          {/* Right Side: Full Uncropped Portrait + Firearm Serial Number Barcode Underneath */}
          <div className="relative flex w-[96px] flex-shrink-0 flex-col items-center justify-between py-0.5">
            {/* Uncropped Portrait Photo */}
            <div className="relative h-[112px] w-[94px] flex items-center justify-center">
              {registration.photoUrl ? (
                <img 
                  src={registration.photoUrl} 
                  alt={registration.fullName}
                  className="max-h-full max-w-full object-contain mix-blend-multiply" 
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center text-slate-500">
                  <User className="h-10 w-10 text-slate-500/75" />
                  <span className="text-[7px] font-bold text-slate-600 mt-0.5">ፎቶ የለም</span>
                </div>
              )}
            </div>

            {/* Firearm Serial Number Barcode + Stylized Text Directly Under Photo */}
            <div className="flex w-full flex-col items-center">
              <div className="w-[94px] rounded-sm border border-slate-300/75 bg-white/95 px-1 py-[2px] shadow-2xs">
                <svg
                  viewBox={`0 0 ${serialBarcode.totalWidth} 24`}
                  className="block h-[14px] w-full"
                  preserveAspectRatio="none"
                  shapeRendering="crispEdges"
                  aria-label={`Serial barcode ${registration.serialNumber}`}
                >
                  {serialBarcode.bars.map((bar, idx) => (
                    <rect
                      key={idx}
                      x={bar.x}
                      y={0}
                      width={bar.width}
                      height={24}
                      fill="#090d16"
                    />
                  ))}
                </svg>
              </div>
              <div className="mt-[2px] w-full text-center leading-tight break-all">
                <span className="mr-0.5 text-[6.5px] font-black text-blue-950">ንምራ፡</span>
                <span className="font-mono text-[7.8px] font-black tracking-[0.06em] text-slate-950">
                  {registration.serialNumber}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Bottom Signature Strip: Frosted Off-White Band so Dark-Ink Signatures & Expiry Date Stay 100% Crisp */}
        <div
          className="flex items-end justify-between border-t-2 border-amber-500/80 px-3.5 pt-1 pb-2 text-[8px]"
          style={{
            background: 'linear-gradient(90deg, #dce6f2 0%, #eaf0f7 55%, #f4f6f9 100%)',
          }}
        >
          {/* Owner Signature */}
          <div className="flex flex-col items-center">
            <div className="h-5 w-20 flex items-center justify-center">
              {registration.ownerSignature ? (
                <img 
                  src={registration.ownerSignature} 
                  alt="Owner Signature" 
                  className="max-h-full max-w-full object-contain mix-blend-multiply contrast-125" 
                />
              ) : (
                <span className="text-[7.5px] italic text-slate-700 font-mono font-bold">ተፈርሟል</span>
              )}
            </div>
            <span className="font-extrabold text-slate-900 text-[7.5px]">
              የባለመሳሪያው ፊርማ
            </span>
          </div>

          {/* Validity Expiry Indicator */}
          <div className="flex flex-col items-center text-center">
            <span className={`text-[7.5px] font-black ${isExpired ? 'text-red-700' : 'text-blue-950'}`}>
              የሚያበቃበት፡ {registration.expiryDate}
            </span>
            <span className="text-[6.5px] font-mono font-black text-amber-900 tracking-widest">
              BENISHANGUL GUMUZ POLICE
            </span>
          </div>

          {/* Approver Signature */}
          <div className="flex flex-col items-center">
            <div className="h-5 w-20 flex items-center justify-center">
              {isApproved ? (
                <img 
                  src={registration.approverSignature || branding.defaultApproverSignature} 
                  alt="Approver Signature" 
                  className="max-h-full max-w-full object-contain mix-blend-multiply contrast-125" 
                />
              ) : (
                <span className="text-[7px] text-amber-900 italic font-bold">ይጸድቃል</span>
              )}
            </div>
            <span className="font-extrabold text-slate-900 text-[7.5px]">
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

      {/* Central Watermark: User's Uploaded Logo Intact Inside a Circle (No Rectangle, No Whitening, No Cropping) */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.34]">
        <div className="h-48 w-48 overflow-hidden rounded-full flex items-center justify-center">
          <img
            src={watermarkLogoSrc}
            alt="Police Logo Watermark"
            className="h-full w-full rounded-full object-cover object-center"
          />
        </div>
      </div>

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

      <div className="relative z-10 flex h-full flex-col justify-between p-3">
        {/* Top Bar: Emergency Line & Title */}
        <div className="flex flex-wrap items-center justify-between gap-1 border-b-2 border-black/40 pb-1 text-[9px]">
          <span className="font-black text-black tracking-wide leading-tight">
            {branding.commissionNameAm || 'የቤኒሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን'}
          </span>
          <span className="font-black text-blue-950 whitespace-nowrap">
            ስልክ ቁጥር {branding.contactPhone}
          </span>
        </div>

        {/* Middle Section: Large QR Code on Left, Uncropped Notice & Rules on Right */}
        <div className="my-1 flex flex-1 items-center gap-2.5 min-h-0">
          {/* Left: QR Code (Hidden until Approved by Manager) */}
          <div className="flex flex-col items-center justify-center flex-shrink-0">
            {isApproved ? (
              <div className="h-[104px] w-[104px] rounded-lg border-2 border-black bg-white p-1 shadow-sm flex items-center justify-center">
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
            ) : (
              <div className="h-[104px] w-[104px] rounded-lg border-2 border-dashed border-amber-700 bg-amber-50/95 p-2 shadow-sm flex flex-col items-center justify-center text-center">
                <Lock className="h-5 w-5 text-amber-800 mb-1" />
                <span className="text-[7px] font-black text-amber-900 leading-tight">
                  በሃላፊ እስኪጸድቅ ስካን ማድረጊያ አይታይም
                </span>
              </div>
            )}
            <span className="mt-1 text-[7.5px] font-black text-black">
              {isApproved ? 'ለማረጋገጥ ስካን ያድርጉ' : 'ማጽደቅ ይጠብቃል'}
            </span>
          </div>

          {/* Right: Strict Notice Body Text (All bold, pitch black, zero clipping) */}
          <div className="flex flex-1 flex-col justify-center space-y-1 text-left min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-black text-[11px] text-red-700 underline decoration-red-600 decoration-2">
                ጥብቅ ማሳሰቢያ
              </span>
            </div>

            <p className="text-[8px] leading-[1.26] font-bold text-black break-words whitespace-normal">
              ይህ የመታወቂያ በየአመቱ የሚታደስ ሲሆን መታወቂያዉ ካልታደሰ በየትኛዉም ቦታ ለሚያጋጥማችሁ ችግር ፈቃድ ሰጪ አካል ተጠያቂ አይሆንም፡፡
            </p>

            <div className="space-y-0.5 text-[7.2px] leading-[1.24] font-bold text-black border-t-2 border-black/30 pt-1 break-words whitespace-normal">
              <p>1. መሳሪያዉን ከተፈቀደለት ግለሰብ/ድርጅት ውጭ ለሌላ ማስተላለፍ በጥብቅ የተከለከለ ነዉ፡፡</p>
              <p>2. ያስመዘገበዉ መሳሪያ ወይም ጥይት መጠን ሲጨምር ቀርቦ እንደገና ማስመዝገብ አለበት፡፡</p>
              <p>3. ይህ መታወቂያ ህጋዊ የሚሆነው በፖሊስ ኮሚሽኑ የወንጀል መከላከል ሂደት ሲረጋገጥ ብቻ ነው።</p>
            </div>
          </div>
        </div>

        {/* Bottom: Dates and Distinct ID Number (All crisp & uncropped) */}
        <div className="flex flex-wrap items-center justify-between gap-1 border-t-2 border-black/30 pt-1 text-[7.8px] text-black">
          <div className="flex flex-wrap gap-2.5 font-bold text-black">
            <span>የተሰጠበት ቀን፡ <b className="font-black text-black">{registration.registrationDate}</b></span>
            <span>የሚያበቃበት ቀን፡ <b className={isExpired ? 'font-black text-red-700' : 'font-black text-black'}>{registration.expiryDate}</b></span>
          </div>
          <div className="font-serif font-black tracking-[0.06em] text-[#7c1111] bg-amber-100 px-2 py-0.5 rounded border border-amber-500/80 shadow-2xs">
            {registration.idCardNumber}
          </div>
        </div>
      </div>
    </div>
  );

  // ATM Card Slot Wrapper:
  // Strictly renders in international standard ATM / CR80 card dimension (85.6mm x 54mm)
  const renderAtmCardSlot = (face: 'front' | 'back') => {
    return (
      <div 
        className="atm-card-slot relative overflow-hidden select-none border border-slate-700/60 print:border-none shadow-xl print:shadow-none"
        style={{
          width: screenZoom === 'atm' ? '85.6mm' : '420px',
          height: screenZoom === 'atm' ? '54mm' : '265px',
          minWidth: screenZoom === 'atm' ? '85.6mm' : '420px',
          minHeight: screenZoom === 'atm' ? '54mm' : '265px',
          maxWidth: screenZoom === 'atm' ? '85.6mm' : '420px',
          maxHeight: screenZoom === 'atm' ? '54mm' : '265px',
          borderRadius: screenZoom === 'atm' ? '3.18mm' : '16px',
          boxSizing: 'border-box',
        }}
      >
        <div
          className="atm-card-scale-inner origin-top-left"
          style={{
            width: '420px',
            height: '265px',
            minWidth: '420px',
            minHeight: '265px',
            transform: screenZoom === 'atm' ? 'scale(0.7703037)' : 'scale(1)',
            transformOrigin: '0 0',
          }}
        >
          {face === 'front' ? renderFrontCard() : renderBackCard()}
        </div>
      </div>
    );
  };

  // Helper component: Professional Corner Crop Marks
  const renderCropCorner = (position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right') => {
    if (!showCropMarks) return null;
    const baseClass = "pointer-events-none absolute w-3.5 h-3.5 border-black border-opacity-80 z-20";
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

  if (frontOnly) {
    return (
      <div className="flex w-full items-center justify-center">
        <div className="origin-center scale-[0.82] min-[390px]:scale-[0.9] sm:scale-100 transition-transform">
          {renderFrontCard()}
        </div>
      </div>
    );
  }

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
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <div className="flex items-center gap-1 text-xs text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    <CreditCard className="h-3 w-3 text-amber-400" />
                    <span>የካርድ ልኬት፡ የኤቲኤም ሳይዝ (ATM CR-80: 85.6 × 54 ሚሜ)</span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {!isApproved 
                      ? '• ማሳሰቢያ፡ በኮሚሽነሩ ወይም በሃላፊው እስኪጸድቅ ድረስ ፕሪንት አይደረግም፡፡' 
                      : '• ፊት እና ኋላ በአንድ ጊዜ በኤቲኤም ሳይዝ ፕሪንት ይደረጋል'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Lifecycle button */}
              <button
                onClick={() => setShowLifecycleModal(true)}
                title="መሳሪያ መቀየር፣ ገቢ ማድረግ፣ ጥይትና ካርት መጨመር፣ ወይም ሌላ ማውጣት (መታወቂያ ቁጥሩ እንዳለ ሆኖ)"
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600/25 border border-indigo-500/40 px-3.5 py-2 text-xs font-bold text-indigo-300 transition hover:bg-indigo-600/40 cursor-pointer shadow-sm"
              >
                <ArrowRightLeft className="h-3.5 w-3.5 text-indigo-400" />
                <span>ቅየራ / ገቢ / ጥይት</span>
                {registration.lifecycleHistory && registration.lifecycleHistory.length > 0 && (
                  <span className="rounded-full bg-indigo-500/50 px-1 text-[9px] font-mono text-indigo-100">
                    {registration.lifecycleHistory.length}
                  </span>
                )}
              </button>

              {onEdit && (
                <button
                  onClick={onEdit}
                  className="rounded-xl bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 cursor-pointer"
                >
                  መረጃውን አድስ
                </button>
              )}

              {/* PRIMARY ACTION: PRINT BOTH FRONT & BACK AT ONCE IN ATM SIZE */}
              <button
                onClick={() => handlePrint()}
                disabled={!isApproved}
                title={!isApproved ? 'በሃላፊው እስኪጸድቅ ፕሪንት ማድረግ አይቻልም' : 'በኤቲኤም ሳይዝ ፊት እና ኋላ በአንድ ጊዜ ፕሪንት አድርግ'}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-xs md:text-sm font-black text-slate-950 shadow-xl transition hover:from-amber-400 hover:to-amber-500 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
              >
                <Printer className="h-4 w-4 md:h-5 md:w-5" />
                <span>በኤቲኤም ሳይዝ በአንድ ጊዜ ፕሪንት አድርግ</span>
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
                በአንድ ገጽ ተጣጣፊ (Foldable ATM)
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
                <CreditCard className="h-3.5 w-3.5" />
                ጎን ለጎን በአንድ ገጽ (Side-by-Side ATM)
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
                ባለ ሁለት ገጽ / PVC (Duplex CR80)
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

            {/* Screen Zoom & Crop Marks Toggle */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
                <span className="text-slate-400 px-1.5 font-medium">ስክሪን ላይ፦</span>
                <button
                  onClick={() => setScreenZoom('atm')}
                  className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                    screenZoom === 'atm' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  ትክክለኛ ATM
                </button>
                <button
                  onClick={() => setScreenZoom('large')}
                  className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                    screenZoom === 'large' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  ተለቅ ያለ (420px)
                </button>
              </div>

              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={showCropMarks}
                  onChange={(e) => setShowCropMarks(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-0 cursor-pointer"
                />
                <span className="font-medium text-xs">የመቁረጫ ምልክቶች</span>
              </label>
            </div>
          </div>

          {/* Universal Printer Compatibility Advice Note */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-200/90 flex flex-col gap-1">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <CreditCard className="h-4 w-4 text-amber-400" />
              <span>በኤቲኤም (ATM CR-80: 85.6 × 54 ሚሜ) ልኬት ፊትና ኋላ በአንድ ጊዜ ይታተማል፦</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              • <b>መደበኛ ወረቀት / ፎቶ ወረቀት (A4):</b> ፊት እና ኋላ በኤቲኤም ሳይዝ (85.6 ሚሜ x 54 ሚሜ) ተጣጥፎ ወይም ጎን ለጎን በአንድ ጊዜ ይታተማል፤ ቆርጠው በኤቲኤም ላሚኔሽን ኪስ ወይም ቦርሳ ውስጥ ይገባል።<br />
              • <b>የፕላስቲክ ካርድ ፕሪንተሮች (PVC Printers):</b> Evolis, Zebra, Fargo, Datacard, Canon Card Tray — በቀጥታ በፕላስቲክ ካርዱ ላይ ፊትና ኋላ ያትማል።<br />
              • <b>ጠቃሚ ምክር፡</b> በፕሪንተር አማራጭ ውስጥ Scale ላይ <b>"Actual size" (100%)</b> መምረጥዎን እና <b>"Background graphics" (የጀርባ ምስል/ቀለም)</b> ማብራትዎን ያረጋግጡ።
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
        {/* Ideal for ATM card laminating pouches (Photo paper / PVC / A4)    */}
        {/* ----------------------------------------------------------------- */}
        {printLayout === 'foldable' && (
          <div className="id-card-sheet-page flex flex-col items-center justify-center p-2">
            {/* Sheet Official Header (Print only) */}
            <div className="print-only mb-2 text-center border-b border-black/30 pb-1 w-[85.6mm] max-w-[85.6mm]">
              <span className="text-[10px] font-black text-black leading-tight block">
                {branding.commissionNameAm}
              </span>
              <span className="text-[7.5px] font-bold text-black block">
                ይፋዊ የጦር መሳሪያ ፈቃድ መታወቂያ (ATM CR-80: 85.6 × 54 ሚሜ)
              </span>
              <p className="text-[7px] font-mono font-bold text-black mt-0.5">
                መታወቂያ ቁጥር፡ {registration.idCardNumber} | {registration.fullName}
              </p>
            </div>

            {/* Foldable ID Card Pair in ATM Size */}
            <div className="relative flex flex-col items-center">
              {renderCropCorner('top-left')}
              {renderCropCorner('top-right')}

              {/* Front Card (85.6mm x 54mm) */}
              <div className="relative">
                {renderAtmCardSlot('front')}
              </div>

              {/* Dotted Center Fold Line with Scissors */}
              <div 
                className="atm-fold-line my-1.5 border-t-2 border-dashed border-black/70 relative flex items-center justify-center"
                style={{ width: screenZoom === 'atm' ? '85.6mm' : '420px' }}
              >
                <span className="bg-white px-2 py-0.5 text-[7px] font-black text-black flex items-center gap-1 border border-black/40 rounded-full shadow-sm">
                  <Scissors className="h-2 w-2 text-black" />
                  የማጠፊያ መስመር (Fold along line • ATM 85.6mm)
                </span>
              </div>

              {/* Back Card (85.6mm x 54mm) */}
              <div className="relative">
                {renderAtmCardSlot('back')}
              </div>

              {renderCropCorner('bottom-left')}
              {renderCropCorner('bottom-right')}
            </div>

            {/* Sheet Official Footer (Print only) */}
            <div className="print-only mt-2 text-center border-t border-black/30 pt-1 w-[85.6mm] max-w-[85.6mm] text-[7px] font-bold text-black">
              ማሳሰቢያ፡ ይህ መታወቂያ ህጋዊ የሚሆነው በፖሊስ ኮሚሽኑ ማህተም እና ፊርማ ሲረጋገጥ ብቻ ነው።
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
            <div className="print-only mb-3 text-center border-b border-black/30 pb-1 w-full max-w-[190mm]">
              <span className="text-[11px] font-black text-black leading-tight block">
                {branding.commissionNameAm}
              </span>
              <span className="text-[8px] font-bold text-black block">
                ይፋዊ የጦር መሳሪያ ፈቃድ መታወቂያ (ATM CR-80: 85.6 × 54 ሚሜ)
              </span>
              <p className="text-[7.5px] font-mono font-bold text-black mt-0.5">
                መታወቂያ ቁጥር፡ {registration.idCardNumber} | ባለቤት፡ {registration.fullName}
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              {/* Front Card with its own crop marks */}
              <div className="relative">
                {renderCropCorner('top-left')}
                {renderCropCorner('top-right')}
                {renderCropCorner('bottom-left')}
                {renderCropCorner('bottom-right')}
                {renderAtmCardSlot('front')}
              </div>

              {/* Back Card with its own crop marks */}
              <div className="relative">
                {renderCropCorner('top-left')}
                {renderCropCorner('top-right')}
                {renderCropCorner('bottom-left')}
                {renderCropCorner('bottom-right')}
                {renderAtmCardSlot('back')}
              </div>
            </div>

            {/* Sheet Official Footer (Print only) */}
            <div className="print-only mt-3 text-center border-t border-black/30 pt-1 w-full max-w-[190mm] text-[7px] font-bold text-black">
              ማሳሰቢያ፡ ይህ መታወቂያ ህጋዊ የሚሆነው በፖሊስ ኮሚሽኑ ማህተም እና ፊርማ ሲረጋገጥ ብቻ ነው።
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* LAYOUT 3: DUPLEX (2 PAGES - PAGE 1 FRONT, PAGE 2 BACK)           */}
        {/* For double-sided printers or PVC card printers with flipper       */}
        {/* ----------------------------------------------------------------- */}
        {printLayout === 'duplex' && (
          <div className="w-full flex flex-col items-center gap-6">
            {/* Page 1: Front */}
            <div className="id-card-duplex-page print-page-break flex flex-col items-center justify-center">
              <div className="print-only mb-2 text-center">
                <span className="text-[9px] font-black text-black">የመታወቂያ የፊት ገጽ (ATM Front 85.6 × 54 ሚሜ)</span>
              </div>
              <div className="relative">
                {renderCropCorner('top-left')}
                {renderCropCorner('top-right')}
                {renderCropCorner('bottom-left')}
                {renderCropCorner('bottom-right')}
                {renderAtmCardSlot('front')}
              </div>
            </div>

            {/* Page 2: Back */}
            <div className="id-card-duplex-page flex flex-col items-center justify-center">
              <div className="print-only mb-2 text-center">
                <span className="text-[9px] font-black text-black">የመታወቂያ የኋላ ገጽ (ATM Back 85.6 × 54 ሚሜ)</span>
              </div>
              <div className="relative">
                {renderCropCorner('top-left')}
                {renderCropCorner('top-right')}
                {renderCropCorner('bottom-left')}
                {renderCropCorner('bottom-right')}
                {renderAtmCardSlot('back')}
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
              {renderAtmCardSlot('front')}
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
              {renderAtmCardSlot('back')}
            </div>
          </div>
        )}

      </div>

      {/* Firearm Lifecycle Management Modal */}
      {showLifecycleModal && (
        <FirearmLifecycleModal
          registration={registration}
          onClose={() => setShowLifecycleModal(false)}
        />
      )}
    </div>
  );
};
