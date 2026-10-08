import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext.tsx';
import { FirearmOwnership, FirearmMechanism, FirearmRegistration } from '../types/index.ts';
import { 
  FileText, 
  Camera, 
  Edit3, 
  CheckCircle, 
  Save, 
  ArrowRight, 
  IdCard, 
  Shield, 
  Printer, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { PhotoStudioModal } from './PhotoStudioModal.tsx';
import { SignatureModal } from './SignatureModal.tsx';
import { DEFAULT_SAMPLE_PHOTO, DEFAULT_REGISTRAR_SIGNATURE } from '../utils/assets.ts';

interface RegistrationFormProps {
  onSuccess: (savedRecord: FirearmRegistration, targetView: 'idCard' | 'certificate') => void;
  initialData?: FirearmRegistration | null;
  onCancel?: () => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  onSuccess,
  initialData,
  onCancel,
}) => {
  const { 
    addRegistration, 
    updateRegistration, 
    getNextIdCardNumber, 
    getNextCertNumber, 
    branding, 
    user 
  } = useSystem();

  // Form Fields State
  const [fullName, setFullName] = useState(initialData?.fullName || '');
  const [region, setRegion] = useState(initialData?.region || 'ቤኒሻንጉል ጉሙዝ');
  const [zone, setZone] = useState(initialData?.zone || 'አሶሳ ዞን');
  const [woreda, setWoreda] = useState(initialData?.woreda || 'አሶሳ ከተማ');
  const [kebele, setKebele] = useState(initialData?.kebele || '');
  const [houseNumber, setHouseNumber] = useState(initialData?.houseNumber || '');
  const [nationality, setNationality] = useState(initialData?.nationality || 'ኢትዮጵያዊ');
  const [age, setAge] = useState<number | ''>(initialData?.age || 35);
  const [occupation, setOccupation] = useState(initialData?.occupation || '');
  const [positionRole, setPositionRole] = useState(initialData?.positionRole || '');
  const [nationalIdNumber, setNationalIdNumber] = useState(initialData?.nationalIdNumber || '');
  const [nationalIdIssueDate, setNationalIdIssueDate] = useState(initialData?.nationalIdIssueDate || '2016-01-10');

  // Firearm Details
  const [firearmType, setFirearmType] = useState(initialData?.firearmType || 'ክላሽንኮቭ (AK-47)');
  const [serialNumber, setSerialNumber] = useState(initialData?.serialNumber || '');
  const [weaponCode, setWeaponCode] = useState(initialData?.weaponCode || '');
  const [bulletCount, setBulletCount] = useState<number | ''>(initialData?.bulletCount ?? 30);
  const [magazineCount, setMagazineCount] = useState<number | ''>(initialData?.magazineCount ?? 2);
  const [ownership, setOwnership] = useState<FirearmOwnership>(initialData?.ownership || 'የግል');
  const [mechanism, setMechanism] = useState<FirearmMechanism>(initialData?.mechanism || 'አውቶማቲክ');
  const [countryOfOrigin, setCountryOfOrigin] = useState(initialData?.countryOfOrigin || 'ሩሲያ');
  const [manufactureYear, setManufactureYear] = useState(initialData?.manufactureYear || '1990');

  // Dates and Places
  const [registrationPlace, setRegistrationPlace] = useState(initialData?.registrationPlace || 'አሶሳ');
  const [registrationDate, setRegistrationDate] = useState(
    initialData?.registrationDate || new Date().toISOString().split('T')[0]
  );
  const [expiryDate, setExpiryDate] = useState(() => {
    if (initialData?.expiryDate) return initialData.expiryDate;
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  });

  // Media
  const [photoUrl, setPhotoUrl] = useState<string>(initialData?.photoUrl || DEFAULT_SAMPLE_PHOTO);
  const [ownerSignature, setOwnerSignature] = useState<string>(initialData?.ownerSignature || '');
  const [registrarName, setRegistrarName] = useState(
    initialData?.registrarName || user?.fullName || 'ኢንስፔክተር አለሙ ከበደ'
  );

  // Modals
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

  // Preview generated next numbers
  const nextIdNum = initialData?.idCardNumber || getNextIdCardNumber();
  const nextCertNum = initialData?.certNumber || getNextCertNumber();

  const handleDateChange = (newRegDate: string) => {
    setRegistrationDate(newRegDate);
    try {
      const d = new Date(newRegDate);
      d.setFullYear(d.getFullYear() + 1);
      setExpiryDate(d.toISOString().split('T')[0]);
    } catch {
      // fallback
    }
  };

  const handleSubmit = (e: React.FormEvent, targetAction: 'idCard' | 'certificate') => {
    e.preventDefault();

    if (!fullName.trim()) {
      alert('እባክዎ ሙሉ ስም ያስገቡ!');
      return;
    }
    if (!serialNumber.trim()) {
      alert('እባክዎ የመሳሪያውን ንምራ ቁጥር (Serial Number) ያስገቡ!');
      return;
    }

    if (initialData) {
      updateRegistration(initialData.id, {
        fullName,
        region,
        zone,
        woreda,
        kebele,
        houseNumber,
        nationality,
        age: Number(age) || 30,
        occupation,
        positionRole,
        nationalIdNumber,
        nationalIdIssueDate,
        firearmType,
        serialNumber,
        weaponCode,
        bulletCount: Number(bulletCount) || 0,
        magazineCount: Number(magazineCount) || 1,
        ownership,
        mechanism,
        countryOfOrigin,
        manufactureYear,
        registrationPlace,
        registrationDate,
        expiryDate,
        photoUrl,
        ownerSignature,
        registrarName,
      });

      const updated = {
        ...initialData,
        fullName,
        region,
        zone,
        woreda,
        kebele,
        houseNumber,
        nationality,
        age: Number(age) || 30,
        occupation,
        positionRole,
        nationalIdNumber,
        nationalIdIssueDate,
        firearmType,
        serialNumber,
        weaponCode,
        bulletCount: Number(bulletCount) || 0,
        magazineCount: Number(magazineCount) || 1,
        ownership,
        mechanism,
        countryOfOrigin,
        manufactureYear,
        registrationPlace,
        registrationDate,
        expiryDate,
        photoUrl,
        ownerSignature,
        registrarName,
      };
      onSuccess(updated, targetAction);
    } else {
      const saved = addRegistration({
        fullName,
        region,
        zone,
        woreda,
        kebele,
        houseNumber,
        nationality,
        age: Number(age) || 30,
        occupation,
        positionRole,
        nationalIdNumber,
        nationalIdIssueDate,
        firearmType,
        serialNumber,
        weaponCode,
        bulletCount: Number(bulletCount) || 0,
        magazineCount: Number(magazineCount) || 1,
        ownership,
        mechanism,
        countryOfOrigin,
        manufactureYear,
        registrationPlace,
        registrationDate,
        expiryDate,
        photoUrl,
        ownerSignature: ownerSignature || DEFAULT_REGISTRAR_SIGNATURE,
        registrarName,
        registrarSignature: DEFAULT_REGISTRAR_SIGNATURE,
        approverName: 'ኮማንደር መንግስቱ በቀለ',
        approverSignature: branding.defaultApproverSignature,
      });
      onSuccess(saved, targetAction);
    }
  };

  return (
    <div className="mx-auto max-w-4xl rounded-3xl border border-slate-800 bg-slate-900/90 p-6 md:p-8 shadow-2xl backdrop-blur-md">
      {/* Header with Title and Auto-Generated Numbers */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-amber-500/20 px-2.5 py-1 text-xs font-black text-amber-400 border border-amber-500/30">
              ይፋዊ መመዝገቢያ ቅጽ
            </span>
            <span className="text-xs text-slate-400">
              በግለሰቦችና ተቋማት እጅ የሚገኙ የጦር መሳሪያዎች ምዝገባ
            </span>
          </div>
          <h2 className="mt-1 text-xl font-black text-slate-100 font-serif">
            {initialData ? 'የጦር መሳሪያ ምዝገባ ማሻሻያ' : 'የጦር መሳሪያ ምዝገባ ቅጽ (Firearm Registration Form)'}
          </h2>
          <p className="text-xs text-slate-400">
            {branding.commissionNameAm} • {branding.processNameAm}
          </p>
        </div>

        {/* Auto Sequential Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-xl border border-amber-500/40 bg-slate-950 p-2.5 text-right">
            <div className="text-[10px] font-bold text-amber-400">ራስ-ሰር መታወቂያ ቁጥር</div>
            <div className="font-mono text-xs font-black text-white">{nextIdNum}</div>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-right">
            <div className="text-[10px] font-bold text-slate-400">የምስክር ወረቀት ቁጥር</div>
            <div className="font-mono text-xs font-black text-slate-200">{nextCertNum}</div>
          </div>
        </div>
      </div>

      <form className="mt-6 space-y-6">
        {/* ============================================================== */}
        {/* SECTION 1: REGISTRANT PHOTO & PERSONAL IDENTITY                */}
        {/* ============================================================== */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
          <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-xs text-amber-400">1</span>
              የባለመሳሪያው ሙሉ መረጃ እና 3x4 ጉርድ ፎቶ
            </h3>
            <span className="text-xs text-slate-400">ንጥል 1 - 6</span>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Passport Photo Frame & Studio Launcher */}
            <div className="flex flex-col items-center">
              <div className="relative h-36 w-28 overflow-hidden rounded-xl border-2 border-amber-400/80 bg-slate-900 p-0.5 shadow-xl">
                <img
                  src={photoUrl}
                  alt="Passport 3x4"
                  className="h-full w-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(true)}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 transition hover:opacity-100 text-white cursor-pointer"
                >
                  <Camera className="h-6 w-6 text-amber-400" />
                  <span className="mt-1 text-[10px] font-bold">ፎቶ ቀይር/አንሳ</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(true)}
                className="mt-2 flex items-center gap-1.5 rounded-lg bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/40 hover:bg-amber-500/30 cursor-pointer"
              >
                <Camera className="h-3.5 w-3.5" /> ፎቶ ቀይር (3x4)
              </button>
              <span className="mt-1 text-[9px] text-slate-500 text-center max-w-[120px]">
                መታወቂያው ላይ የገባው ፎቶ ሰርቲፊኬቱ ላይም ይገባል
              </span>
            </div>

            {/* Registrant Form Inputs */}
            <div className="grid flex-1 grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  1. ሙሉ ስም (Full Name) *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="የአያት ስም ጨምሮ ሙሉ ስም"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  3. ዜግነት (Nationality)
                </label>
                <input
                  type="text"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  4. ዕድሜ (Age)
                </label>
                <input
                  type="number"
                  min="18"
                  max="100"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value) || '')}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  5. ስራ (Occupation)
                </label>
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="ምሳሌ፡ አርሶ አደር፣ ነጋዴ፣ ፖሊስ"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  ሃላፊነት (Position / Role)
                </label>
                <input
                  type="text"
                  value={positionRole}
                  onChange={(e) => setPositionRole(e.target.value)}
                  placeholder="ምሳሌ፡ የጥበቃ ሃላፊ፣ የግል"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  6. መታወቂያ ቁጥር (ID Card No.)
                </label>
                <input
                  type="text"
                  value={nationalIdNumber}
                  onChange={(e) => setNationalIdNumber(e.target.value)}
                  placeholder="የቀበሌ ወይም ብሔራዊ መታወቂያ ቁጥር"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  መታወቂያው የተሰጠበት ቀን (ID Issue Date)
                </label>
                <input
                  type="date"
                  value={nationalIdIssueDate}
                  onChange={(e) => setNationalIdIssueDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Detailed Residential Address (ንጥል 2) */}
          <div className="mt-4 border-t border-slate-800 pt-4">
            <label className="block text-xs font-bold text-slate-300 mb-2">
              2. የመኖሪያ አድራሻ (Residential Address)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <span className="text-[11px] text-slate-400">ክልል</span>
                <input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-400">ዞን</span>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="አሶሳ ዞን">አሶሳ ዞን</option>
                  <option value="መተከል ዞን">መተከል ዞን</option>
                  <option value="ካማሺ ዞን">ካማሺ ዞን</option>
                  <option value="ማኦ ኮሞ ልዩ ወረዳ">ማኦ ኮሞ ልዩ ወረዳ</option>
                </select>
              </div>
              <div>
                <span className="text-[11px] text-slate-400">ወረዳ</span>
                <input
                  type="text"
                  value={woreda}
                  onChange={(e) => setWoreda(e.target.value)}
                  placeholder="ወረዳ"
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-400">ቀበሌ</span>
                <input
                  type="text"
                  value={kebele}
                  onChange={(e) => setKebele(e.target.value)}
                  placeholder="ቀበሌ 01"
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-400">የቤት ቁጥር</span>
                <input
                  type="text"
                  value={houseNumber}
                  onChange={(e) => setHouseNumber(e.target.value)}
                  placeholder="የቤት ቁ."
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SECTION 2: FIREARM TECHNICAL SPECIFICATIONS                    */}
        {/* ============================================================== */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
          <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-xs text-amber-400">2</span>
              የጦር መሳሪያው ዝርዝር መረጃ (Firearm Specifications)
            </h3>
            <span className="text-xs text-slate-400">ንጥል 7 - 10</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                7. የመሳሪያው አይነት (Firearm Type) *
              </label>
              <select
                value={firearmType}
                onChange={(e) => setFirearmType(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="ክላሽንኮቭ (AK-47)">ክላሽንኮቭ (AK-47)</option>
                <option value="ሽጉጥ (Makarov 9mm)">ሽጉጥ (Makarov 9mm)</option>
                <option value="ሽጉጥ (Star/Beretta)">ሽጉጥ (Star / Beretta)</option>
                <option value="ስናይፐር (SVD Dragunov)">ስናይፐር (SVD Dragunov)</option>
                <option value="ኤም-16 (M-16)">ኤም-16 (M-16)</option>
                <option value="ብሬን (Bren Gun)">ብሬን (Bren Gun)</option>
                <option value="ሌላ አይነት">ሌላ አይነት</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                ንምራ ቁጥር (Serial Number) *
              </label>
              <input
                type="text"
                required
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="ለምሳሌ፡ AK47-889102"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-mono text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                የመሳሪያ ቁጥር (የመ/ቁ)
              </label>
              <input
                type="text"
                value={weaponCode}
                onChange={(e) => setWeaponCode(e.target.value)}
                placeholder="ለምሳሌ፡ መ/ቁ 0422"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                8. የጥይት ብዛት (Bullet Count)
              </label>
              <input
                type="number"
                min="0"
                value={bulletCount}
                onChange={(e) => setBulletCount(Number(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                የካርታ ብዛት (Magazine Count)
              </label>
              <input
                type="number"
                min="0"
                value={magazineCount}
                onChange={(e) => setMagazineCount(Number(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                የመሳሪያው ባለቤትነት (Ownership)
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOwnership('የግል')}
                  className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                    ownership === 'የግል'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  የግል (Private)
                </button>
                <button
                  type="button"
                  onClick={() => setOwnership('የመንግስት')}
                  className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                    ownership === 'የመንግስት'
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  የመንግስት (Govt)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                9. የመሳሪያው ይዘት (Mechanism)
              </label>
              <select
                value={mechanism}
                onChange={(e) => setMechanism(e.target.value as FirearmMechanism)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="አውቶማቲክ">አውቶማቲክ (Automatic)</option>
                <option value="ግማሽ አውቶማቲክ">ግማሽ አውቶማቲክ (Semi-Automatic)</option>
                <option value="አንድ በአንድ የሚተኩስ">አንድ በአንድ የሚተኩስ (Bolt/Single)</option>
                <option value="ሌላ">ሌላ (Other)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                10. የተሰራበት ሀገር (Country of Origin)
              </label>
              <input
                type="text"
                value={countryOfOrigin}
                onChange={(e) => setCountryOfOrigin(e.target.value)}
                placeholder="ለምሳሌ፡ ሩሲያ፣ ቻይና፣ ዩጎዝላቪያ"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                የተሰራበት ዓ/ም (Manufacture Year)
              </label>
              <input
                type="text"
                value={manufactureYear}
                onChange={(e) => setManufactureYear(e.target.value)}
                placeholder="ለምሳሌ፡ 1985"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SECTION 3: SIGNATURES, LOCATION & DATES                        */}
        {/* ============================================================== */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
          <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-xs text-amber-400">3</span>
              ፊርማዎች፣ የተመዘገበበት ቦታ እና የአገልግሎት ማብቂያ ቀን
            </h3>
            <span className="text-xs text-slate-400">የአንድ አመት አገልግሎት</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                የተመዘገበበት ቦታ (Registration Location)
              </label>
              <input
                type="text"
                value={registrationPlace}
                onChange={(e) => setRegistrationPlace(e.target.value)}
                placeholder="አሶሳ"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                የተመዘገበበት ቀን (Registration Date)
              </label>
              <input
                type="date"
                value={registrationDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1">
                የሚያበቃበት / የሚታደስበት ቀን (Expiry Date - 1 Year)
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full rounded-xl border border-amber-500/50 bg-slate-900 px-3 py-2 text-sm font-bold text-amber-300 focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Owner Signature Launcher */}
            <div className="md:col-span-1 rounded-xl border border-slate-800 bg-slate-900/80 p-3">
              <span className="block text-xs font-bold text-slate-300 mb-2">
                የባለመሳሪያው ዲጂታል ፊርማ
              </span>
              <div className="flex items-center gap-3">
                <div className="h-12 w-28 overflow-hidden rounded-lg border border-slate-700 bg-white flex items-center justify-center p-1">
                  {ownerSignature ? (
                    <img src={ownerSignature} alt="Signature" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">ያልተፈረመ</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsSignatureModalOpen(true)}
                  className="flex items-center gap-1 rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-400 border border-amber-500/40 hover:bg-amber-500/30 cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5" /> ፈርም
                </button>
              </div>
            </div>

            {/* Registrar Name */}
            <div className="md:col-span-2 rounded-xl border border-slate-800 bg-slate-900/80 p-3">
              <span className="block text-xs font-bold text-slate-300 mb-1">
                የመዝጋቢ ባለስልጣን ስም (Registrar Official)
              </span>
              <input
                type="text"
                value={registrarName}
                onChange={(e) => setRegistrarName(e.target.value)}
                placeholder="ኢንስፔክተር አለሙ ከበደ"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white"
              />
              <span className="mt-1 block text-[10px] text-slate-500">
                የኮሚሽኑ ህጋዊ ማህተም እና የሃላፊው ፍቃድ በሲስተሙ አውቶማቲክ ይተገበራል፡፡
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SUBMISSION & IMMEDIATE NEXT STEP BUTTONS                       */}
        {/* ============================================================== */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-800 pt-5">
          <div className="text-xs text-amber-300/90 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400"></span>
            <span>አድሚኑ መዝግቦ ወደ ሃላፊው ይልካል፤ የስራ ሂደት ሃላፊው ካጸደቀው በኋላ ብቻ ፕሪንት ይደረጋል፡፡</span>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 w-full md:w-auto">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                ተመለስ
              </button>
            )}

            {/* Submit and Send to Official (መዝግበህ ወደ ሃላፊው ላክ) */}
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'idCard')}
              className="flex flex-1 md:flex-none items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-sm font-extrabold text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] cursor-pointer"
            >
              <IdCard className="h-4 w-4" />
              መዝግበህ ወደ ሃላፊው ላክ (Send to Approver)
            </button>

            {/* Submit and Preview Certificate */}
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'certificate')}
              className="flex flex-1 md:flex-none items-center justify-center gap-2 rounded-xl bg-slate-800 px-5 py-3 text-sm font-bold text-slate-200 border border-slate-700 hover:bg-slate-700 active:scale-[0.98] cursor-pointer"
            >
              <FileText className="h-4 w-4" />
              ወደ ሃላፊው ላክና ሰርቲፊኬት እይ
            </button>
          </div>
        </div>
      </form>

      {/* Modals */}
      <PhotoStudioModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onPhotoSelected={(newPhoto) => setPhotoUrl(newPhoto)}
        currentPhoto={photoUrl}
      />

      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onSignatureSaved={(sig) => setOwnerSignature(sig)}
      />
    </div>
  );
};
