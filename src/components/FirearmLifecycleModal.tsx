import React, { useState } from 'react';
import { FirearmRegistration, FirearmMechanism, FirearmOwnership, FirearmLifecycleEvent } from '../types/index.ts';
import { useSystem } from '../context/SystemContext.tsx';
import { 
  ArrowRightLeft, 
  Archive, 
  PlusCircle, 
  History, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Shield, 
  FileText, 
  Printer, 
  RotateCcw,
  BadgeAlert,
  Info
} from 'lucide-react';

interface FirearmLifecycleModalProps {
  registration: FirearmRegistration;
  onClose: () => void;
  onSuccess?: () => void;
}

type TabType = 'replace' | 'surrender' | 'ammo' | 'reissue' | 'history';

export const FirearmLifecycleModal: React.FC<FirearmLifecycleModalProps> = ({
  registration,
  onClose,
  onSuccess,
}) => {
  const { user, replaceFirearm, surrenderFirearm, increaseAmmunition, reissueFirearm } = useSystem();
  
  // Initial tab selection
  const [activeTab, setActiveTab] = useState<TabType>(
    registration.status === 'ገቢ የተደረገ' ? 'reissue' : 'replace'
  );

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Tab 1: Replace Firearm Form State
  const [replaceData, setReplaceData] = useState({
    firearmType: registration.firearmType,
    serialNumber: '',
    weaponCode: '',
    bulletCount: registration.bulletCount,
    magazineCount: registration.magazineCount,
    ownership: registration.ownership,
    mechanism: registration.mechanism,
    countryOfOrigin: registration.countryOfOrigin || '',
    manufactureYear: registration.manufactureYear || '',
    reason: '',
    officerName: user?.fullName || 'ኢንስፔክተር አለሙ ከበደ',
    referenceLetterNo: '',
  });

  // Tab 2: Surrender Firearm Form State
  const [surrenderData, setSurrenderData] = useState({
    reason: '',
    depotLocation: 'የቤ/ጉ/ክ/ፖ/ኮ ዋና የጦር መሳሪያ ግምጃ ቤት (አሶሳ)',
    officerName: user?.fullName || 'ኢንስፔክተር አለሙ ከበደ',
    referenceLetterNo: '',
  });

  // Tab 3: Increase Ammo Form State
  const [ammoData, setAmmoData] = useState({
    addBullets: 30,
    addMagazines: 1,
    reason: '',
    officerName: user?.fullName || 'ኮማንደር መንግስቱ በቀለ',
    referenceLetterNo: '',
  });

  // Tab 4: Re-issue Firearm Form State
  const [reissueData, setReissueData] = useState({
    firearmType: 'ክላሽንኮቭ (AK-47)',
    serialNumber: '',
    weaponCode: '',
    bulletCount: 60,
    magazineCount: 2,
    ownership: registration.ownership,
    mechanism: 'አውቶማቲክ' as FirearmMechanism,
    countryOfOrigin: 'ሩሲያ',
    manufactureYear: '1990',
    reason: 'ገቢ ተደርጎ የቆየው ሰነድ ታድሶ በድጋሚ የስራ ስምሪት መሳሪያ ወጥቷል',
    officerName: user?.fullName || 'ኮማንደር መንግስቱ በቀለ',
    referenceLetterNo: '',
  });

  // Handle Replace Firearm Submit
  const handleReplaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replaceData.reason.trim()) {
      setErrorMsg('እባክዎ የመሳሪያውን የቅየራ ምክንያት ያስገቡ!');
      return;
    }
    if (!replaceData.serialNumber.trim()) {
      setErrorMsg('እባክዎ የአዲሱን መሳሪያ ንምራ ቁጥር ያስገቡ!');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await replaceFirearm(
        registration.id,
        {
          firearmType: replaceData.firearmType,
          serialNumber: replaceData.serialNumber.trim(),
          weaponCode: replaceData.weaponCode.trim() || `መ/ቁ ${Math.floor(1000 + Math.random() * 9000)}`,
          bulletCount: Number(replaceData.bulletCount),
          magazineCount: Number(replaceData.magazineCount),
          ownership: replaceData.ownership,
          mechanism: replaceData.mechanism,
          countryOfOrigin: replaceData.countryOfOrigin,
          manufactureYear: replaceData.manufactureYear,
        },
        replaceData.reason.trim(),
        replaceData.officerName.trim(),
        replaceData.referenceLetterNo.trim()
      );
      setSuccessMsg('መሳሪያው በተሳካ ሁኔታ ተቀይሯል! መታወቂያ ቁጥሩ እንዳለ ተጠብቆ ተመዝግቧል፡፡');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch {
      setErrorMsg('መሳሪያውን መቀየር አልተቻለም፡፡ እባክዎ እንደገና ይሞክሩ፡፡');
    } finally {
      setLoading(false);
    }
  };

  // Handle Surrender Firearm Submit
  const handleSurrenderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!surrenderData.reason.trim()) {
      setErrorMsg('እባክዎ መሳሪያው ገቢ የተደረገበትን ህጋዊ ምክንያት ያስገቡ!');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await surrenderFirearm(
        registration.id,
        surrenderData.reason.trim(),
        surrenderData.officerName.trim(),
        surrenderData.referenceLetterNo.trim(),
        surrenderData.depotLocation.trim()
      );
      setSuccessMsg('መሳሪያው በግምጃ ቤት ገቢ ተደርጓል! የተጠቃሚው መታወቂያ ቁጥር በመዝገብ ተይዞ ይቆያል፡፡');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch {
      setErrorMsg('መሳሪያውን ገቢ ማድረግ አልተቻለም፡፡ እባክዎ እንደገና ይሞክሩ፡፡');
    } finally {
      setLoading(false);
    }
  };

  // Handle Ammo Increase Submit
  const handleAmmoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ammoData.reason.trim()) {
      setErrorMsg('እባክዎ የጥይትና ካርት ጭማሪውን ምክንያት ያስገቡ!');
      return;
    }
    if (ammoData.addBullets <= 0 && ammoData.addMagazines <= 0) {
      setErrorMsg('እባክዎ የሚጨመረው የጥይት ወይም የካርታ መጠን ከ 0 በላይ ያድርጉ!');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await increaseAmmunition(
        registration.id,
        Number(ammoData.addBullets),
        Number(ammoData.addMagazines),
        ammoData.reason.trim(),
        ammoData.officerName.trim(),
        ammoData.referenceLetterNo.trim()
      );
      setSuccessMsg(`ተጨማሪ ${ammoData.addBullets} ጥይት እና ${ammoData.addMagazines} ካርት በተሳካ ሁኔታ ተጨምሯል!`);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch {
      setErrorMsg('ጥይትና ካርት መጨመር አልተቻለም፡፡ እባክዎ እንደገና ይሞክሩ፡፡');
    } finally {
      setLoading(false);
    }
  };

  // Handle Re-issue Submit
  const handleReissueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reissueData.reason.trim()) {
      setErrorMsg('እባክዎ ሌላ መሳሪያ የመስጠት/የማውጣት ህጋዊ ምክንያት ያስገቡ!');
      return;
    }
    if (!reissueData.serialNumber.trim()) {
      setErrorMsg('እባክዎ የወጣውን አዲስ መሳሪያ ንምራ ቁጥር ያስገቡ!');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await reissueFirearm(
        registration.id,
        {
          firearmType: reissueData.firearmType,
          serialNumber: reissueData.serialNumber.trim(),
          weaponCode: reissueData.weaponCode.trim() || `መ/ቁ ${Math.floor(1000 + Math.random() * 9000)}`,
          bulletCount: Number(reissueData.bulletCount),
          magazineCount: Number(reissueData.magazineCount),
          ownership: reissueData.ownership,
          mechanism: reissueData.mechanism,
          countryOfOrigin: reissueData.countryOfOrigin,
          manufactureYear: reissueData.manufactureYear,
        },
        reissueData.reason.trim(),
        reissueData.officerName.trim(),
        reissueData.referenceLetterNo.trim()
      );
      setSuccessMsg('በድሮው መታወቂያ ቁጥር አዲስ መሳሪያ ወጥቷል! ሰነዱ በድጋሚ ታድሶ ጸድቋል፡፡');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch {
      setErrorMsg('መሳሪያውን መልሶ ማውጣት አልተቻለም፡፡ እባክዎ እንደገና ይሞክሩ፡፡');
    } finally {
      setLoading(false);
    }
  };

  const isSurrendered = registration.status === 'ገቢ የተደረገ' || registration.isSurrendered;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-500/10 p-2 text-amber-400 border border-amber-500/30">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white font-serif">
                የመሳሪያ ቅየራ፣ ገቢ እና የጥይት ማስተካከያ ማዕከል
              </h2>
              <p className="text-xs text-slate-400">
                ቀደም ሲል የተሰጠ ፈቃድ እና መታወቂያ ሳይቀየር በድሮው መዝገብ ላይ የሚደረጉ ማስተካከያዎች
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Citizen Brief Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-800/60 px-6 py-3 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-3">
            <div className="h-10 w-9 overflow-hidden rounded-lg border border-amber-500/50 bg-slate-950">
              <img
                src={registration.photoUrl}
                alt={registration.fullName}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <div className="font-bold text-white text-sm">{registration.fullName}</div>
              <div className="text-[11px] text-slate-400">
                {registration.woreda}፣ {registration.kebele} | {registration.occupation}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-slate-900 border border-slate-700 px-3 py-1">
              <span className="text-[10px] text-slate-400 block font-sans">የመታወቂያ ቁጥር (የማይቀየር)፡</span>
              <span className="font-mono font-bold text-amber-400 text-xs">{registration.idCardNumber}</span>
            </div>

            <div className="rounded-lg bg-slate-900 border border-slate-700 px-3 py-1">
              <span className="text-[10px] text-slate-400 block">የያዙት መሳሪያ፡</span>
              <span className="font-bold text-slate-200 text-xs">{registration.firearmType} ({registration.serialNumber})</span>
            </div>

            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
              isSurrendered 
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}>
              {isSurrendered ? 'ገቢ የተደረገ' : registration.status}
            </span>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-800 bg-slate-950/70 px-6 pt-2 overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab('replace')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'replace'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <ArrowRightLeft className="h-4 w-4" />
            1. መሳሪያ መቀየር (Exchange)
          </button>

          <button
            onClick={() => setActiveTab('surrender')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'surrender'
                ? 'border-rose-500 text-rose-400 bg-rose-500/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Archive className="h-4 w-4" />
            2. መሳሪያ ገቢ ማድረግ (Surrender)
          </button>

          <button
            onClick={() => setActiveTab('ammo')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'ammo'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <PlusCircle className="h-4 w-4" />
            3. ጥይትና ካርት መጨመር (+Ammo)
          </button>

          <button
            onClick={() => setActiveTab('reissue')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'reissue'
                ? 'border-sky-500 text-sky-400 bg-sky-500/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <RotateCcw className="h-4 w-4" />
            4. ገቢ የተደረገውን ሌላ ማውጣት (Re-issue)
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'history'
                ? 'border-purple-500 text-purple-400 bg-purple-500/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <History className="h-4 w-4" />
            5. የለውጥ እና የገቢ ታሪክ ({registration.lifecycleHistory?.length || 0})
          </button>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Body / Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 text-xs">
          {/* TAB 1: REPLACE FIREARM */}
          {activeTab === 'replace' && (
            <form onSubmit={handleReplaceSubmit} className="space-y-4">
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
                <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
                  <Info className="h-4 w-4" />
                  <span>የመታወቂያ ቁጥሩ እንዳለ ሆኖ መሳሪያውን መቀየር</span>
                </div>
                <p className="text-slate-300 text-[11.5px]">
                  ባለፈቃዱ የነበረውን መሳሪያ ({registration.firearmType} - ንምራ {registration.serialNumber}) አስረክቦ ሌላ መሳሪያ ሲቀይር፤ 
                  የቀድሞ መታወቂያ ቁጥር (<span className="text-amber-400 font-mono font-bold">{registration.idCardNumber}</span>) እንዳለ ሆኖ አዲሱ መሳሪያ በሰነዱ ላይ ይተካል፡፡
                </p>
              </div>

              {/* Firearm Specs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    አዲሱ የመሳሪያ አይነት *
                  </label>
                  <select
                    value={replaceData.firearmType}
                    onChange={(e) => setReplaceData({ ...replaceData, firearmType: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  >
                    <option value="ክላሽንኮቭ (AK-47)">ክላሽንኮቭ (AK-47)</option>
                    <option value="ሽጉጥ (Makarov 9mm)">ሽጉጥ (Makarov 9mm)</option>
                    <option value="ሽጉጥ (Star Pistol)">ሽጉጥ (Star Pistol)</option>
                    <option value="ሽጉጥ (Beretta 9mm)">ሽጉጥ (Beretta 9mm)</option>
                    <option value="ሽጉጥ (Glock 19)">ሽጉጥ (Glock 19)</option>
                    <option value="ስናይፐር (Dragunov)">ስናይፐር (Dragunov)</option>
                    <option value="ቀላል መትረየስ (RPK)">ቀላል መትረየስ (RPK)</option>
                    <option value="ኤም-16 (M16 Rifle)">ኤም-16 (M16 Rifle)</option>
                    <option value="አዳኝ ጠመንጃ (Hunting Rifle)">አዳኝ ጠመንጃ (Hunting Rifle)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    አዲሱ ንምራ ቁጥር (Serial Number) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ለምሳሌ፡ AK47-889021-ET"
                    value={replaceData.serialNumber}
                    onChange={(e) => setReplaceData({ ...replaceData, serialNumber: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    የመ/ቁ (Weapon Code)
                  </label>
                  <input
                    type="text"
                    placeholder="ለምሳሌ፡ መ/ቁ 0892"
                    value={replaceData.weaponCode}
                    onChange={(e) => setReplaceData({ ...replaceData, weaponCode: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    የመሳሪያው ይዘት (Mechanism)
                  </label>
                  <select
                    value={replaceData.mechanism}
                    onChange={(e) => setReplaceData({ ...replaceData, mechanism: e.target.value as FirearmMechanism })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  >
                    <option value="አውቶማቲክ">አውቶማቲክ</option>
                    <option value="ግማሽ አውቶማቲክ">ግማሽ አውቶማቲክ</option>
                    <option value="አንድ በአንድ የሚተኩስ">አንድ በአንድ የሚተኩስ</option>
                    <option value="ሌላ">ሌላ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    የጥይት ብዛት
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={replaceData.bulletCount}
                    onChange={(e) => setReplaceData({ ...replaceData, bulletCount: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    የካርታ ብዛት
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={replaceData.magazineCount}
                    onChange={(e) => setReplaceData({ ...replaceData, magazineCount: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    የተሰራበት ሀገር
                  </label>
                  <input
                    type="text"
                    value={replaceData.countryOfOrigin}
                    onChange={(e) => setReplaceData({ ...replaceData, countryOfOrigin: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                    placeholder="ሩሲያ / አሜሪካ / ጀርመን..."
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    የተሰራበት ዓ/ም
                  </label>
                  <input
                    type="text"
                    value={replaceData.manufactureYear}
                    onChange={(e) => setReplaceData({ ...replaceData, manufactureYear: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white font-mono"
                    placeholder="1985"
                  />
                </div>
              </div>

              {/* Justification & Authorization */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="block text-amber-400 font-bold mb-1">
                    የመሳሪያ ቅየራው ምክንያት (ከነምክንያቱ ማስቀመጥ ግዴታ ነው) *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={replaceData.reason}
                    onChange={(e) => setReplaceData({ ...replaceData, reason: e.target.value })}
                    placeholder="ለምሳሌ፡ የቀድሞው መሳሪያ በመበላሸቱና ጥገና ባለማግኘቱ ምክንያት በኮሚሽኑ ፈቃድ አዲስ መሳሪያ ተቀይሯል..."
                    className="w-full rounded-xl border border-amber-500/50 bg-slate-950 px-3 py-2 text-white placeholder-slate-600 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      የፈቀደው ኃላፊ ስም *
                    </label>
                    <input
                      type="text"
                      required
                      value={replaceData.officerName}
                      onChange={(e) => setReplaceData({ ...replaceData, officerName: e.target.value })}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      የማመልከቻ / የደብዳቤ ቁጥር
                    </label>
                    <input
                      type="text"
                      placeholder="ለምሳሌ፡ ደብዳቤ ቁጥር ጦመ/1402/2026"
                      value={replaceData.referenceLetterNo}
                      onChange={(e) => setReplaceData({ ...replaceData, referenceLetterNo: e.target.value })}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl bg-slate-800 px-4 py-2.5 text-slate-300 hover:bg-slate-700 font-bold cursor-pointer"
                >
                  ተመለስ
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-amber-500 px-6 py-2.5 text-slate-950 font-black hover:bg-amber-400 transition shadow-lg cursor-pointer flex items-center gap-2"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                  {loading ? 'እየተመዘገበ ነው...' : 'መሳሪያውን ቀይርና አስቀምጥ'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SURRENDER FIREARM */}
          {activeTab === 'surrender' && (
            <form onSubmit={handleSurrenderSubmit} className="space-y-4">
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4">
                <div className="flex items-center gap-2 text-rose-400 font-bold mb-1">
                  <Archive className="h-4 w-4" />
                  <span>መሳሪያውን ወደ ፖሊስ ግምጃ ቤት ገቢ ማድረግ</span>
                </div>
                <p className="text-slate-300 text-[11.5px]">
                  ይህ እርምጃ ባለፈቃዱ የያዘውን መሳሪያ ({registration.firearmType} - ንምራ {registration.serialNumber}) ገቢ አድርጎ በግምጃ ቤት እንዲቀመጥ ያደርጋል፡፡ 
                  የባለፈቃዱ ሰነድ እና መታወቂያ ቁጥር በመዝገብ እንደተጠበቀ ይቆያል፡፡
                </p>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-rose-400 font-bold mb-1">
                  የመሳሪያው ገቢ የተደረገበት ምክንያት (ከነምክንያቱ ማስቀመጥ ግዴታ ነው) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={surrenderData.reason}
                  onChange={(e) => setSurrenderData({ ...surrenderData, reason: e.target.value })}
                  placeholder="ለምሳሌ፡ በፈቃደኝነት ገቢ የተደረገ / የስራ ዝውውር / ከስራ መልቀቅ / የጡረታ መውጣት / ለጥገና / በፍርድ ቤት ትዕዛዝ..."
                  className="w-full rounded-xl border border-rose-500/50 bg-slate-950 px-3 py-2 text-white placeholder-slate-600 focus:border-rose-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    መሳሪያው የተቀመጠበት ግምጃ ቤት *
                  </label>
                  <input
                    type="text"
                    required
                    value={surrenderData.depotLocation}
                    onChange={(e) => setSurrenderData({ ...surrenderData, depotLocation: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    መሳሪያውን የተረከበው ኃላፊ ስም *
                  </label>
                  <input
                    type="text"
                    required
                    value={surrenderData.officerName}
                    onChange={(e) => setSurrenderData({ ...surrenderData, officerName: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-300 font-bold mb-1">
                    የማስረከቢያ ደረሰኝ ወይም የደብዳቤ ቁጥር
                  </label>
                  <input
                    type="text"
                    placeholder="ለምሳሌ፡ ገቢ ደረሰኝ ቁጥር 0491/2026"
                    value={surrenderData.referenceLetterNo}
                    onChange={(e) => setSurrenderData({ ...surrenderData, referenceLetterNo: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl bg-slate-800 px-4 py-2.5 text-slate-300 hover:bg-slate-700 font-bold cursor-pointer"
                >
                  ተመለስ
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-rose-600 px-6 py-2.5 text-white font-black hover:bg-rose-500 transition shadow-lg cursor-pointer flex items-center gap-2"
                >
                  <Archive className="h-4 w-4" />
                  {loading ? 'እየተመዘገበ ነው...' : 'መሳሪያውን ገቢ አድርግ'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: INCREASE AMMUNITION & MAGAZINES */}
          {activeTab === 'ammo' && (
            <form onSubmit={handleAmmoSubmit} className="space-y-4">
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                  <PlusCircle className="h-4 w-4" />
                  <span>ጥይት እና ካርት መጨመር (Ammunition Quota Increase)</span>
                </div>
                <p className="text-slate-300 text-[11.5px]">
                  ለተመዘገበው መሳሪያ ተጨማሪ ጥይትና ካርታ በህጋዊ ፈቃድ ሲጨመር በሰነዱ ላይ አዲሱ ድምር ይመዘገባል፡፡
                </p>
              </div>

              {/* Current Status vs Added */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400 block">የነበረው የጥይት ብዛት፡</span>
                  <div className="font-mono text-xl font-black text-amber-400">{registration.bulletCount} ጥይቶች</div>
                  <span className="text-[11px] text-slate-400 block pt-1">የነበረው የካርታ ብዛት፡</span>
                  <div className="font-mono text-base font-bold text-slate-200">{registration.magazineCount} ካርታ</div>
                </div>

                <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4">
                  <span className="text-[11px] text-slate-400 block">አዲሱ ጠቅላላ ድምር (ከጭማሪው በኋላ)፡</span>
                  <div className="font-mono text-xl font-black text-emerald-400">
                    {registration.bulletCount + Number(ammoData.addBullets)} ጥይቶች
                  </div>
                  <span className="text-[11px] text-slate-400 block pt-1">አዲሱ ጠቅላላ ካርታ፡</span>
                  <div className="font-mono text-base font-bold text-emerald-300">
                    {registration.magazineCount + Number(ammoData.addMagazines)} ካርታ
                  </div>
                </div>
              </div>

              {/* Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-emerald-400 font-bold mb-1">
                    የሚጨመረው የጥይት ብዛት (+ Bullets) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={ammoData.addBullets}
                    onChange={(e) => setAmmoData({ ...ammoData, addBullets: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white font-mono font-bold text-base"
                  />
                </div>

                <div>
                  <label className="block text-emerald-400 font-bold mb-1">
                    የሚጨመረው የካርታ ብዛት (+ Magazines) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={ammoData.addMagazines}
                    onChange={(e) => setAmmoData({ ...ammoData, addMagazines: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white font-mono font-bold text-base"
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-emerald-400 font-bold mb-1">
                  የጭማሪው ህጋዊ ምክንያት (ከነምክንያቱ ማስቀመጥ ግዴታ ነው) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={ammoData.reason}
                  onChange={(e) => setAmmoData({ ...ammoData, reason: e.target.value })}
                  placeholder="ለምሳሌ፡ በዞኑ የደህንነት ጥበቃ መስፋፋት ምክንያት ተጨማሪ 30 ጥይቶች እና 1 ካርታ ተፈቅዷል..."
                  className="w-full rounded-xl border border-emerald-500/50 bg-slate-950 px-3 py-2 text-white placeholder-slate-600 focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    የፈቀደው ኃላፊ ስም *
                  </label>
                  <input
                    type="text"
                    required
                    value={ammoData.officerName}
                    onChange={(e) => setAmmoData({ ...ammoData, officerName: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    የፈቃድ ደብዳቤ / ማመልከቻ ቁጥር
                  </label>
                  <input
                    type="text"
                    placeholder="ለምሳሌ፡ ፈቃድ ቁጥር ጦመ/ጥይት/052/2026"
                    value={ammoData.referenceLetterNo}
                    onChange={(e) => setAmmoData({ ...ammoData, referenceLetterNo: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl bg-slate-800 px-4 py-2.5 text-slate-300 hover:bg-slate-700 font-bold cursor-pointer"
                >
                  ተመለስ
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-emerald-600 px-6 py-2.5 text-white font-black hover:bg-emerald-500 transition shadow-lg cursor-pointer flex items-center gap-2"
                >
                  <PlusCircle className="h-4 w-4" />
                  {loading ? 'እየተመዘገበ ነው...' : 'ተጨማሪ ጥይትና ካርት መዝግብ'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: RE-ISSUE AFTER SURRENDER */}
          {activeTab === 'reissue' && (
            <form onSubmit={handleReissueSubmit} className="space-y-4">
              <div className="rounded-2xl border border-sky-500/30 bg-sky-500/5 p-4">
                <div className="flex items-center gap-2 text-sky-400 font-bold mb-1">
                  <RotateCcw className="h-4 w-4" />
                  <span>ገቢ ተደርጎ የነበረውን በድሮው መታወቂያ ቁጥር ሌላ መሳሪያ ማውጣት</span>
                </div>
                <p className="text-slate-300 text-[11.5px]">
                  ቀደም ሲል መሳሪያ ገቢ አድርጎ የቆየ ባለመታወቂያ ሌላ አዲስ መሳሪያ ሲወጣለት፤ 
                  የቀድሞው መታወቂያ ቁጥር (<span className="text-sky-400 font-mono font-bold">{registration.idCardNumber}</span>) እንዳለ ሆኖ 
                  አዲሱ መሳሪያ በሰነዱ ላይ ይተካል፣ ሁኔታውም ወደ «የጸደቀ» ይመለሳል፡፡
                </p>
              </div>

              {/* Firearm Specs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    የሚወጣው አዲሱ የመሳሪያ አይነት *
                  </label>
                  <select
                    value={reissueData.firearmType}
                    onChange={(e) => setReissueData({ ...reissueData, firearmType: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  >
                    <option value="ክላሽንኮቭ (AK-47)">ክላሽንኮቭ (AK-47)</option>
                    <option value="ሽጉጥ (Makarov 9mm)">ሽጉጥ (Makarov 9mm)</option>
                    <option value="ሽጉጥ (Star Pistol)">ሽጉጥ (Star Pistol)</option>
                    <option value="ሽጉጥ (Beretta 9mm)">ሽጉጥ (Beretta 9mm)</option>
                    <option value="ሽጉጥ (Glock 19)">ሽጉጥ (Glock 19)</option>
                    <option value="ስናይፐር (Dragunov)">ስናይፐር (Dragunov)</option>
                    <option value="ቀላል መትረየስ (RPK)">ቀላል መትረየስ (RPK)</option>
                    <option value="ኤም-16 (M16 Rifle)">ኤም-16 (M16 Rifle)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    አዲሱ ንምራ ቁጥር (Serial Number) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ለምሳሌ፡ AK47-991201-ET"
                    value={reissueData.serialNumber}
                    onChange={(e) => setReissueData({ ...reissueData, serialNumber: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    የመ/ቁ (Weapon Code)
                  </label>
                  <input
                    type="text"
                    placeholder="ለምሳሌ፡ መ/ቁ 0950"
                    value={reissueData.weaponCode}
                    onChange={(e) => setReissueData({ ...reissueData, weaponCode: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    የመሳሪያው ይዘት (Mechanism)
                  </label>
                  <select
                    value={reissueData.mechanism}
                    onChange={(e) => setReissueData({ ...reissueData, mechanism: e.target.value as FirearmMechanism })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  >
                    <option value="አውቶማቲክ">አውቶማቲክ</option>
                    <option value="ግማሽ አውቶማቲክ">ግማሽ አውቶማቲክ</option>
                    <option value="አንድ በአንድ የሚተኩስ">አንድ በአንድ የሚተኩስ</option>
                    <option value="ሌላ">ሌላ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    የጥይት ብዛት
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={reissueData.bulletCount}
                    onChange={(e) => setReissueData({ ...reissueData, bulletCount: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    የካርታ ብዛት
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={reissueData.magazineCount}
                    onChange={(e) => setReissueData({ ...reissueData, magazineCount: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sky-400 font-bold mb-1">
                  ሌላ መሳሪያ የማውጣት ህጋዊ ምክንያት (ከነምክንያቱ ማስቀመጥ ግዴታ ነው) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={reissueData.reason}
                  onChange={(e) => setReissueData({ ...reissueData, reason: e.target.value })}
                  placeholder="ለምሳሌ፡ ግለሰቡ በስራ ስምሪት ወደ አዲስ ሃላፊነት በመመደባቸው ምክንያት በድሮው መታወቂያ ቁጥር ሌላ መሳሪያ ወጥቷል..."
                  className="w-full rounded-xl border border-sky-500/50 bg-slate-950 px-3 py-2 text-white placeholder-slate-600 focus:border-sky-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    የፈቀደው ኃላፊ ስም *
                  </label>
                  <input
                    type="text"
                    required
                    value={reissueData.officerName}
                    onChange={(e) => setReissueData({ ...reissueData, officerName: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    የስምሪት / የፈቃድ ደብዳቤ ቁጥር
                  </label>
                  <input
                    type="text"
                    placeholder="ለምሳሌ፡ ጦመ/ውሳኔ/088/2026"
                    value={reissueData.referenceLetterNo}
                    onChange={(e) => setReissueData({ ...reissueData, referenceLetterNo: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl bg-slate-800 px-4 py-2.5 text-slate-300 hover:bg-slate-700 font-bold cursor-pointer"
                >
                  ተመለስ
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-sky-600 px-6 py-2.5 text-white font-black hover:bg-sky-500 transition shadow-lg cursor-pointer flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  {loading ? 'እየተመዘገበ ነው...' : 'ሌላ መሳሪያ አውጣና ሰነዱን አድስ'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 5: LIFECYCLE HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    የመሳሪያ ቅየራ፣ ገቢ እና የጥይት ለውጥ ታሪክ (Audit History)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    በዚህ መዝገብ ላይ በኮሚሽኑ የተከናወኑ ይፋዊ እርምጃዎች በሙሉ
                  </p>
                </div>
              </div>

              {(!registration.lifecycleHistory || registration.lifecycleHistory.length === 0) ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-8 text-center text-slate-400">
                  <History className="h-8 w-8 mx-auto text-slate-600 mb-2" />
                  <p className="font-semibold">እስካሁን ምንም አይነት የመሳሪያ ቅየራ፣ ገቢ ወይም የጥይት ጭማሪ ታሪክ አልተመዘገበም፡፡</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    መሳሪያ ሲቀየር፣ ገቢ ሲደረግ ወይም ጥይት ሲጨመር ዝርዝሩ እዚህ ጋር በታሪክነት ይቀመጣል፡፡
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {registration.lifecycleHistory.map((evt, idx) => {
                    const isSurr = evt.actionType === 'WEAPON_SURRENDER';
                    const isRep = evt.actionType === 'WEAPON_REPLACE';
                    const isAmmo = evt.actionType === 'AMMO_INCREASE';
                    const isReissue = evt.actionType === 'WEAPON_REISSUE';

                    return (
                      <div
                        key={evt.id || idx}
                        className={`rounded-2xl border p-4 transition ${
                          isSurr
                            ? 'border-rose-500/30 bg-rose-500/5'
                            : isRep
                            ? 'border-amber-500/30 bg-amber-500/5'
                            : isAmmo
                            ? 'border-emerald-500/30 bg-emerald-500/5'
                            : 'border-sky-500/30 bg-sky-500/5'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              isSurr
                                ? 'bg-rose-500/20 text-rose-300'
                                : isRep
                                ? 'bg-amber-500/20 text-amber-300'
                                : isAmmo
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-sky-500/20 text-sky-300'
                            }`}>
                              {evt.actionTitle}
                            </span>
                            <span className="font-mono text-[11px] text-slate-400">{evt.date}</span>
                          </div>

                          <div className="text-[11px] text-slate-300">
                            የፈቀደው/የተረከበው፡ <span className="font-bold text-white">{evt.officerName}</span>
                            {evt.referenceLetterNo && (
                              <span className="text-slate-400 font-mono ml-2">({evt.referenceLetterNo})</span>
                            )}
                          </div>
                        </div>

                        {/* Compulsory Reason */}
                        <div className="mb-2">
                          <span className="text-slate-400 text-[10px] font-bold block uppercase tracking-wider">
                            ህጋዊ ምክንያት (Reason):
                          </span>
                          <p className="text-slate-200 font-medium text-xs mt-0.5 bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                            {evt.reason}
                          </p>
                        </div>

                        {/* Before and After details */}
                        {isRep && evt.previousFirearm && evt.newFirearm && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] bg-slate-950/40 p-2.5 rounded-xl">
                            <div>
                              <span className="text-rose-400 font-bold block">የቀድሞው መሳሪያ፡</span>
                              <div className="text-slate-300">
                                {evt.previousFirearm.firearmType} | ንምራ፡ <span className="font-mono">{evt.previousFirearm.serialNumber}</span>
                              </div>
                            </div>
                            <div>
                              <span className="text-emerald-400 font-bold block">አዲሱ የተተካው መሳሪያ፡</span>
                              <div className="text-white font-bold">
                                {evt.newFirearm.firearmType} | ንምራ፡ <span className="font-mono">{evt.newFirearm.serialNumber}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {isAmmo && evt.ammoAdjustment && (
                          <div className="text-[11px] bg-slate-950/40 p-2.5 rounded-xl flex items-center justify-between">
                            <span className="text-slate-300">
                              የተጨመረው፡ <span className="font-bold text-emerald-400">+{evt.ammoAdjustment.addedBullets} ጥይት</span> እና <span className="font-bold text-emerald-400">+{evt.ammoAdjustment.addedMagazines} ካርታ</span>
                            </span>
                            <span className="text-slate-300">
                              አጠቃላይ ድምር፡ <span className="font-bold text-white">{evt.ammoAdjustment.newTotalBullets} ጥይት</span>፣ <span className="font-bold text-white">{evt.ammoAdjustment.newTotalMagazines} ካርታ</span>
                            </span>
                          </div>
                        )}

                        {isSurr && evt.depotLocation && (
                          <div className="text-[11px] text-slate-300 bg-slate-950/40 p-2 rounded-xl">
                            የተቀመጠበት ግምጃ ቤት፡ <span className="font-bold text-rose-300">{evt.depotLocation}</span>
                          </div>
                        )}

                        {evt.notes && (
                          <p className="text-[10px] text-slate-400 mt-2 italic">
                            ማስታወሻ፡ {evt.notes}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
