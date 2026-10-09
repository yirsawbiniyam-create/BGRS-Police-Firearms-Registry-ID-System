import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext.tsx';
import { 
  Settings, 
  Upload, 
  RotateCcw, 
  Check, 
  Shield, 
  Flag, 
  PenTool, 
  Phone,
  Sparkles,
  CloudCheck,
  Loader2,
  Image as ImageIcon,
  Wand2
} from 'lucide-react';
import { compressImage } from '../utils/imageCompressor.ts';
import { convertLogoToWhiteWatermark } from '../utils/watermarkProcessor.ts';

export const SystemSettings: React.FC = () => {
  const { branding, updateBranding, resetBrandingToDefaults, firestoreStatus } = useSystem();
  const [phone, setPhone] = useState(branding.contactPhone);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'policeLogo' | 'watermarkLogo' | 'bgrsFlag' | 'ethiopiaFlag' | 'officialStampSeal' | 'defaultApproverSignature' | 'defaultRegistrarSignature'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Compress to ensure it easily fits within Firestore limits and loads rapidly across all devices
      const compressedDataUrl = await compressImage(file, 600, 600, 0.9);
      
      if (field === 'policeLogo') {
        // Automatically convert the logo into a pure white background watermark as well!
        const whiteWatermark = await convertLogoToWhiteWatermark(compressedDataUrl);
        await updateBranding({ 
          policeLogo: compressedDataUrl,
          watermarkLogo: whiteWatermark
        });
      } else if (field === 'watermarkLogo') {
        // Ensure uploaded watermark also has background converted to white/transparent
        const whiteWatermark = await convertLogoToWhiteWatermark(compressedDataUrl);
        await updateBranding({ watermarkLogo: whiteWatermark });
      } else {
        await updateBranding({ [field]: compressedDataUrl });
      }
      triggerSuccess();
    } catch (err) {
      console.error('Failed to compress/save image:', err);
      alert('ምስሉን ማዘጋጀት አልተቻለም፤ እባክዎ እንደገና ይሞክሩ፡፡');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAutoConvertWatermark = async () => {
    if (!branding.policeLogo) return;
    setIsUploading(true);
    try {
      const whiteWatermark = await convertLogoToWhiteWatermark(branding.policeLogo);
      await updateBranding({ watermarkLogo: whiteWatermark });
      triggerSuccess();
    } catch (err) {
      console.error('Failed to auto-convert watermark:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerSuccess = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    await updateBranding({ contactPhone: phone });
    setIsUploading(false);
    triggerSuccess();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-black text-white font-serif tracking-wide">
            የሲስተም አርማዎችና ሰንደቅ አላማዎች ማስተካከያ (System Branding & Assets)
          </h2>
          <p className="text-xs text-slate-400">
            አንዴ ያስገቧቸው ሎጎዎች፣ ሰንደቅ አላማዎችና ማህተሞች ሴቭ ሆነው ይቀመጣሉ፤ በተደጋጋሚ ማስገባት አይጠበቅብዎትም
          </p>
        </div>

        <button
          onClick={() => {
            if (confirm('ሁሉንም አርማዎችና ሰንደቅ አላማዎች ወደ ቀደመው ኦፊሴላዊ ቅርፅ መመለስ ይፈልጋሉ?')) {
              resetBrandingToDefaults();
              triggerSuccess();
            }
          }}
          className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700 transition"
        >
          <RotateCcw className="h-4 w-4" /> ወደ ነባሪ መልስ (Reset Defaults)
        </button>
      </div>

      {isUploading && (
        <div className="flex items-center gap-2 rounded-2xl border border-amber-500/50 bg-amber-500/15 p-4 text-xs font-bold text-amber-300 shadow">
          <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
          <span>ምስሉን በማዘጋጀትና ፋየርስቶር (Firestore) ላይ በቀጥታ ሴቭ በማድረግ ላይ...</span>
        </div>
      )}

      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/50 bg-emerald-500/15 p-4 text-xs font-bold text-emerald-300 shadow">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>ማስተካከያው በቀጥታ ፋየርስቶር (Firestore) ላይ ሴቭ ሆኗል፤ በሁሉም ኮምፒውተሮችና ስልኮች ላይ በቅጽበት ይደርሳል!</span>
        </div>
      )}

      {/* Asset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Benishangul Gumuz Police Logo */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <Shield className="h-4 w-4" /> የቤኒሻንጉል ጉሙዝ ክልል ፖሊስ አርማ
              </span>
              <span className="text-[10px] text-slate-400">ዋና ሎጎ</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              በመግቢያው፣ በመታወቂያው እና በሰርቲፊኬቱ ራስጌና በዋተር ማርክ የሚያገለግል
            </p>
            <div className="flex items-center justify-center rounded-2xl bg-slate-950 p-4 border border-slate-800 h-36">
              <img
                src={branding.policeLogo}
                alt="Police Logo"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>
          <label className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition">
            <Upload className="h-4 w-4 text-amber-400" /> አዲስ ሎጎ ጫን
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'policeLogo')}
              className="hidden"
            />
          </label>
        </div>

        {/* 1.2. Watermark Logo (Pure White Background & Enlarged Size) */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> የዋተር ማርክ ሎጎ (ነጭ ባክግራውንድ እና ተለቅ ያለ)
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                ነጭ ባክግራውንድ
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              በሰርቲፊኬቱ እና በመታወቂያው ጀርባ ላይ ተለቅ ብሎ ባክግራውንዱ ነጭ ሆኖ የሚቀመጥ ይፋዊ ዋተርማርክ
            </p>
            {/* Pure white background container to verify the watermark blends with white paper */}
            <div className="flex items-center justify-center rounded-2xl bg-white p-4 border border-slate-700 h-36 relative overflow-hidden shadow-inner">
              <img
                src={branding.watermarkLogo || branding.policeLogo}
                alt="Watermark Logo"
                className="max-h-full max-w-full object-contain filter drop-shadow-sm"
              />
              <span className="absolute bottom-1 right-2 text-[9px] font-bold text-slate-400">
                የወረቀት እይታ (White Paper)
              </span>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleAutoConvertWatermark}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-500/15 border border-amber-500/40 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/25 transition"
            >
              <Wand2 className="h-4 w-4 text-amber-400" /> ከዋናው ሎጎ ባክግራውንዱን ወደ ነጭ ቀይር
            </button>
            <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition">
              <Upload className="h-4 w-4 text-amber-400" /> የተለየ ዋተርማርክ ጫን
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'watermarkLogo')}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* 2. Benishangul Gumuz Regional Flag */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <Flag className="h-4 w-4" /> የቤኒሻንጉል ጉሙዝ ክልል ሰንደቅ አላማ
              </span>
              <span className="text-[10px] text-slate-400">የግራ ራስጌ</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              በመታወቂያው እና በሰርቲፊኬቱ በስተግራ ራስጌ ላይ የሚቀመጥ
            </p>
            <div className="flex items-center justify-center rounded-2xl bg-slate-950 p-4 border border-slate-800 h-36">
              <img
                src={branding.bgrsFlag}
                alt="BGRS Flag"
                className="max-h-full max-w-full object-contain rounded"
              />
            </div>
          </div>
          <label className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition">
            <Upload className="h-4 w-4 text-amber-400" /> አዲስ የክልል ባንዲራ ጫን
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'bgrsFlag')}
              className="hidden"
            />
          </label>
        </div>

        {/* 3. Ethiopian National Flag */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <Flag className="h-4 w-4" /> የኢትዮጵያ ሰንደቅ አላማ
              </span>
              <span className="text-[10px] text-slate-400">የቀኝ ራስጌ</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              በመታወቂያው እና በሰርቲፊኬቱ በስተቀኝ ራስጌ ላይ የሚቀመጥ
            </p>
            <div className="flex items-center justify-center rounded-2xl bg-slate-950 p-4 border border-slate-800 h-36">
              <img
                src={branding.ethiopiaFlag}
                alt="Ethiopia Flag"
                className="max-h-full max-w-full object-contain rounded"
              />
            </div>
          </div>
          <label className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition">
            <Upload className="h-4 w-4 text-amber-400" /> አዲስ የሀገር ባንዲራ ጫን
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'ethiopiaFlag')}
              className="hidden"
            />
          </label>
        </div>

        {/* 4. Official Approver Signature */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <PenTool className="h-4 w-4" /> የኮማንደር / የስራ ሂደት ሃላፊ ፊርማ
              </span>
              <span className="text-[10px] text-slate-400">ኦፊሴላዊ ማረጋገጫ</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              ሃላፊው ሲያጸድቅ በመታወቂያው እና በሰርቲፊኬቱ ላይ በራስ-ሰር የሚተገበር
            </p>
            <div className="flex items-center justify-center rounded-2xl bg-white p-4 border border-slate-800 h-36">
              <img
                src={branding.defaultApproverSignature}
                alt="Approver Signature"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>
          <label className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition">
            <Upload className="h-4 w-4 text-amber-400" /> አዲስ የሃላፊ ፊርማ ጫን
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'defaultApproverSignature')}
              className="hidden"
            />
          </label>
        </div>

        {/* 5. Registrar Default Signature */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <PenTool className="h-4 w-4" /> የመዝጋቢው ፖሊስ ባለስልጣን ፊርማ
              </span>
              <span className="text-[10px] text-slate-400">የመዝጋቢ ፊርማ</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              በምዝገባ ሰርቲፊኬት እና ሰነዶች ላይ በመዝጋቢነት የሚቀመጥ ፊርማ
            </p>
            <div className="flex items-center justify-center rounded-2xl bg-white p-4 border border-slate-800 h-36">
              <img
                src={branding.defaultRegistrarSignature}
                alt="Registrar Signature"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>
          <label className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition">
            <Upload className="h-4 w-4 text-amber-400" /> አዲስ የመዝጋቢ ፊርማ ጫን
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'defaultRegistrarSignature')}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Emergency Contact Phone Config */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
        <h3 className="text-sm font-bold text-amber-400 mb-2 flex items-center gap-2">
          <Phone className="h-4 w-4" /> በመታወቂያው ጀርባ ላይ የሚታተም የፖሊስ ኮሚሽን ስልክ ቁጥር
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          በመታወቂያው ጀርባ ላይ በጥብቅ ማሳሰቢያው ስር የሚጻፈው ስልክ ቁጥር
        </p>
        <form onSubmit={handleSavePhone} className="flex gap-3 max-w-md">
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition cursor-pointer"
          >
            አስቀምጥ
          </button>
        </form>
      </div>

      {/* Firestore Security Rules Helper (Hidden / Collapsed by default) */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
        <details className="group">
          <summary className="flex cursor-pointer items-center justify-between text-xs font-bold text-slate-400 hover:text-amber-400">
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-400" /> የፋየርስቶር ደህንነት ደንብ (Firestore Security Rules - firestore.rules)
            </span>
            <span className="text-[10px] text-slate-500 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="mt-4 space-y-3">
            <p className="text-xs text-slate-400">
              በFirebase Console ውስጥ <b>Firestore Database → Rules</b> ውስጥ የሚለጠፈው ይፋዊ የደህንነት ደንብ፡
            </p>
            <pre className="rounded-xl bg-slate-950 p-4 font-mono text-[11px] text-emerald-400 overflow-x-auto border border-slate-800">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Firearms Registry collection
    match /firearms_records/{recordId} {
      allow read: if true; // Public QR verification allowed
      allow create, update, delete: if true; // Authorized police administrators
    }

    // System Branding & Settings
    match /system_config/{configId} {
      allow read: if true;
      allow write: if true;
    }
  }
}`}
            </pre>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /firearms_records/{recordId} {
      allow read: if true;
      allow create, update, delete: if true;
    }
    match /system_config/{configId} {
      allow read: if true;
      allow write: if true;
    }
  }
}`);
                alert('የፋየርስቶር ደንብ (Firestore Rules) ኮፒ ተደርጓል!');
              }}
              className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 transition"
            >
              ደንቡን ኮፒ አድርግ (Copy Rules)
            </button>
          </div>
        </details>
      </div>
    </div>
  );
};
