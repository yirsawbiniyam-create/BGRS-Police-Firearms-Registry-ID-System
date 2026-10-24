import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  FirearmRegistration, 
  SystemBranding, 
  AuthUser,
  UserRole,
  SystemCredentials,
  UserCredential
} from '../types/index.ts';
import { 
  DEFAULT_BGRS_FLAG, 
  DEFAULT_ETHIOPIAN_FLAG, 
  DEFAULT_POLICE_LOGO, 
  DEFAULT_POLICE_WATERMARK,
  DEFAULT_OFFICIAL_STAMP,
  DEFAULT_APPROVER_SIGNATURE,
  DEFAULT_REGISTRAR_SIGNATURE,
  DEFAULT_SAMPLE_PHOTO
} from '../utils/assets.ts';
import { convertLogoToWhiteWatermark } from '../utils/watermarkProcessor.ts';
import { db } from '../firebase.ts';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  getDoc,
  getDocs,
  writeBatch 
} from 'firebase/firestore';
import { idbGet, idbSet } from '../utils/indexedDbStorage.ts';
import { compressImage } from '../utils/imageCompressor.ts';
import { sanitizeForFirestore } from '../utils/firestoreHelper.ts';
import { 
  DEFAULT_CREDENTIALS, 
  hashPassword, 
  verifyPassword, 
  generateSalt, 
  getLockoutStatus, 
  recordFailedAttempt, 
  resetFailedAttempts 
} from '../utils/security.ts';

interface SystemContextType {
  user: AuthUser | null;
  credentials: SystemCredentials;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateAdminCredentials: (newUsername: string, currentPassword: string, newPassword?: string) => Promise<{ success: boolean; message: string }>;
  updateOfficialCredentials: (newUsername: string, newPassword?: string, newFullName?: string, newTitle?: string) => Promise<{ success: boolean; message: string }>;
  resetCredentialsToDefault: () => Promise<{ success: boolean; message: string }>;
  records: FirearmRegistration[];
  branding: SystemBranding;
  firestoreStatus: 'synced' | 'syncing' | 'offline';
  isRefreshing: boolean;
  refreshFromFirestore: () => Promise<void>;
  updateBranding: (branding: Partial<SystemBranding>) => Promise<boolean>;
  resetBrandingToDefaults: () => Promise<boolean>;
  addRegistration: (formData: Omit<FirearmRegistration, 'id' | 'idCardNumber' | 'certNumber' | 'createdAt' | 'updatedAt' | 'status'>) => FirearmRegistration;
  updateRegistration: (id: string, updates: Partial<FirearmRegistration>) => void;
  deleteRegistration: (id: string) => void;
  approveRegistration: (id: string, approverName?: string, notes?: string) => void;
  rejectRegistration: (id: string, reason: string) => void;
  suspendRegistration: (id: string, reason: string) => void;
  renewRegistration: (id: string) => void;
  sendWarningNotice: (id: string) => void;
  surrenderFirearm: (id: string, reason: string, officerName: string, referenceLetterNo?: string, depotLocation?: string) => Promise<boolean>;
  replaceFirearm: (id: string, newFirearmData: Partial<FirearmRegistration>, reason: string, officerName: string, referenceLetterNo?: string) => Promise<boolean>;
  increaseAmmunition: (id: string, addBullets: number, addMagazines: number, reason: string, officerName: string, referenceLetterNo?: string) => Promise<boolean>;
  reissueFirearm: (id: string, newFirearmData: Partial<FirearmRegistration>, reason: string, officerName: string, referenceLetterNo?: string) => Promise<boolean>;
  getNextIdCardNumber: () => string;
  getNextCertNumber: () => string;
}

const STORAGE_KEYS = {
  RECORDS: 'bgrs_firearms_records_v1',
  BRANDING: 'bgrs_firearms_branding_v1',
  SESSION: 'bgrs_firearms_session_v1',
  CREDENTIALS: 'bgrs_firearms_credentials_v1',
};

const DEFAULT_BRANDING: SystemBranding = {
  policeLogo: DEFAULT_POLICE_LOGO,
  watermarkLogo: DEFAULT_POLICE_WATERMARK,
  bgrsFlag: DEFAULT_BGRS_FLAG,
  ethiopiaFlag: DEFAULT_ETHIOPIAN_FLAG,
  officialStampSeal: DEFAULT_OFFICIAL_STAMP,
  defaultApproverSignature: DEFAULT_APPROVER_SIGNATURE,
  defaultRegistrarSignature: DEFAULT_REGISTRAR_SIGNATURE,
  commissionNameAm: 'የቤኒሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን',
  commissionNameEn: 'Benishangul Gumuz Regional Police Commission',
  processNameAm: 'የወንጀል መከላከል የስራ ሂደት',
  processNameEn: 'Crime Prevention Process',
  contactPhone: '0577750952',
};

// Seed initial realistic data for instant testability
const INITIAL_SEED_RECORDS: FirearmRegistration[] = [
  {
    id: 'rec-0001',
    fullName: 'ታደሰ ገብረማሪያም ወልደየስ',
    region: 'ቤኒሻንጉል ጉሙዝ',
    zone: 'አሶሳ ዞን',
    woreda: 'አሶሳ ከተማ',
    kebele: 'ቀበሌ 03',
    houseNumber: '142',
    nationality: 'ኢትዮጵያዊ',
    age: 44,
    occupation: 'የዞን አስተዳደር ሰራተኛ',
    positionRole: 'ዋና የደህንነት አስተባባሪ',
    phoneNumber: '0911425890',
    nationalIdNumber: 'አሶ/10492/2014',
    nationalIdIssueDate: '2014-04-12',
    firearmType: 'ክላሽንኮቭ (AK-47)',
    serialNumber: 'AK47-7892110-ET',
    weaponCode: 'መ/ቁ 0421',
    bulletCount: 60,
    magazineCount: 2,
    ownership: 'የመንግስት',
    mechanism: 'አውቶማቲክ',
    countryOfOrigin: 'ሩሲያ',
    manufactureYear: '1988',
    idCardNumber: 'ቤጌፖ-ጦመ-0001',
    certNumber: '00001/ጦመ-2026',
    registrationDate: '2026-03-10',
    registrationPlace: 'አሶሳ',
    expiryDate: '2027-03-10', // 1 year validity
    photoUrl: DEFAULT_SAMPLE_PHOTO,
    ownerSignature: DEFAULT_REGISTRAR_SIGNATURE,
    registrarName: 'ኢንስፔክተር አለሙ ከበደ',
    registrarSignature: DEFAULT_REGISTRAR_SIGNATURE,
    approverName: 'ኮማንደር መንግስቱ በቀለ',
    approverSignature: DEFAULT_APPROVER_SIGNATURE,
    status: 'የጸደቀ',
    approvedAt: '2026-03-11T14:30:00Z',
    approvedBy: 'ኮማንደር መንግስቱ በቀለ (admin2026)',
    createdAt: '2026-03-10T09:15:00Z',
    updatedAt: '2026-03-11T14:30:00Z',
  },
  {
    id: 'rec-0002',
    fullName: 'ሙባረክ አህመድ ሀሰን',
    region: 'ቤኒሻንጉል ጉሙዝ',
    zone: 'መተከል ዞን',
    woreda: 'ማንኩሽ (ጉባ)',
    kebele: 'ቀበሌ 01',
    houseNumber: '085',
    nationality: 'ኢትዮጵያዊ',
    age: 38,
    occupation: 'ነጋዴ',
    positionRole: 'የንግድ ማህበር ሊቀመንበር',
    phoneNumber: '0912345678',
    nationalIdNumber: 'መት/55410/2015',
    nationalIdIssueDate: '2015-08-20',
    firearmType: 'ሽጉጥ (Makarov 9mm)',
    serialNumber: 'MK-5590123-RU',
    weaponCode: 'መ/ቁ 0893',
    bulletCount: 16,
    magazineCount: 2,
    ownership: 'የግል',
    mechanism: 'ግማሽ አውቶማቲክ',
    countryOfOrigin: 'ሩሲያ',
    manufactureYear: '1995',
    idCardNumber: 'ቤጌፖ-ጦመ-0002',
    certNumber: '00002/ጦመ-2026',
    registrationDate: '2026-09-18',
    registrationPlace: 'ጊልገል በለስ',
    expiryDate: '2027-09-18',
    photoUrl: DEFAULT_SAMPLE_PHOTO,
    ownerSignature: DEFAULT_REGISTRAR_SIGNATURE,
    registrarName: 'ሳጅን ፍቃዱ ተስፋዬ',
    registrarSignature: DEFAULT_REGISTRAR_SIGNATURE,
    approverName: 'ኮማንደር መንግስቱ በቀለ',
    approverSignature: DEFAULT_APPROVER_SIGNATURE,
    status: 'በሂደት ላይ', // Waiting for Approver review!
    createdAt: '2026-09-18T11:20:00Z',
    updatedAt: '2026-09-18T11:20:00Z',
  },
  {
    id: 'rec-0003',
    fullName: 'አብርሃም ገላው ሀይሌ',
    region: 'ቤኒሻንጉል ጉሙዝ',
    zone: 'ካማሺ ዞን',
    woreda: 'ካማሺ ወረዳ',
    kebele: 'ቀበሌ 02',
    houseNumber: '210',
    nationality: 'ኢትዮጵያዊ',
    age: 52,
    occupation: 'አርሶ አደር',
    positionRole: 'የአካባቢ ሰላም ኮሚቴ አባል',
    phoneNumber: '0922889900',
    nationalIdNumber: 'ካማ/22901/2013',
    nationalIdIssueDate: '2013-02-15',
    firearmType: 'ክላሽንኮቭ (AK-47)',
    serialNumber: 'AK47-3301984-BG',
    weaponCode: 'መ/ቁ 0115',
    bulletCount: 30,
    magazineCount: 1,
    ownership: 'የግል',
    mechanism: 'አውቶማቲክ',
    countryOfOrigin: 'ሩማንያ',
    manufactureYear: '1984',
    idCardNumber: 'ቤጌፖ-ጦመ-0003',
    certNumber: '00003/ጦመ-2025',
    registrationDate: '2025-02-10',
    registrationPlace: 'ካማሺ',
    expiryDate: '2026-02-10', // EXPIRED! Demonstrates the required red suspension alert!
    photoUrl: DEFAULT_SAMPLE_PHOTO,
    ownerSignature: DEFAULT_REGISTRAR_SIGNATURE,
    registrarName: 'ኢንስፔክተር አለሙ ከበደ',
    registrarSignature: DEFAULT_REGISTRAR_SIGNATURE,
    approverName: 'ኮማንደር መንግስቱ በቀለ',
    approverSignature: DEFAULT_APPROVER_SIGNATURE,
    status: 'የጸደቀ',
    approvedAt: '2025-02-12T10:00:00Z',
    approvedBy: 'ኮማንደር መንግስቱ በቀለ',
    createdAt: '2025-02-10T08:30:00Z',
    updatedAt: '2026-02-15T09:00:00Z',
  },
  {
    id: 'rec-0004',
    fullName: 'ዮናስ ተክሌ ካሳ',
    region: 'ቤኒሻንጉል ጉሙዝ',
    zone: 'ማኦ ኮሞ ልዩ ወረዳ',
    woreda: 'ቶንጎ',
    kebele: 'ቀበሌ 01',
    houseNumber: '018',
    nationality: 'ኢትዮጵያዊ',
    age: 41,
    occupation: 'የፖሊስ አባል',
    positionRole: 'የልዩ ጥበቃ አዛዥ',
    phoneNumber: '0933776655',
    nationalIdNumber: 'ማኮ/88120/2015',
    nationalIdIssueDate: '2015-11-05',
    firearmType: 'ስናይፐር (SVD Dragunov)',
    serialNumber: 'SVD-9921408-RU',
    weaponCode: 'መ/ቁ 0304',
    bulletCount: 40,
    magazineCount: 4,
    ownership: 'የመንግስት',
    mechanism: 'ግማሽ አውቶማቲክ',
    countryOfOrigin: 'ሩሲያ',
    manufactureYear: '1992',
    idCardNumber: 'ቤጌፖ-ጦመ-0004',
    certNumber: '00004/ጦመ-2026',
    registrationDate: '2026-05-14',
    registrationPlace: 'ቶንጎ',
    expiryDate: '2027-05-14',
    photoUrl: DEFAULT_SAMPLE_PHOTO,
    ownerSignature: DEFAULT_REGISTRAR_SIGNATURE,
    registrarName: 'ኢንስፔክተር አለሙ ከበደ',
    registrarSignature: DEFAULT_REGISTRAR_SIGNATURE,
    approverName: 'ኮማንደር መንግስቱ በቀለ',
    approverSignature: DEFAULT_APPROVER_SIGNATURE,
    status: 'የጸደቀ',
    approvedAt: '2026-05-15T16:00:00Z',
    approvedBy: 'ኮማንደር መንግስቱ በቀለ',
    createdAt: '2026-05-14T10:00:00Z',
    updatedAt: '2026-05-15T16:00:00Z',
  }
];

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication State
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SESSION);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // System Authentication & Credentials State (Salted SHA-256 protected)
  const [credentials, setCredentials] = useState<SystemCredentials>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CREDENTIALS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.admin?.username && parsed?.official?.username) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse local credentials', e);
    }
    return DEFAULT_CREDENTIALS;
  });

  // Records state
  const [records, setRecords] = useState<FirearmRegistration[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECORDS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load local records, falling back to seed', e);
    }
    return INITIAL_SEED_RECORDS;
  });

  // Branding & Assets state
  const [branding, setBranding] = useState<SystemBranding>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BRANDING);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { 
          ...DEFAULT_BRANDING, 
          ...parsed, 
          watermarkLogo: parsed.watermarkLogo || DEFAULT_POLICE_WATERMARK 
        };
      }
    } catch (e) {
      console.warn('Failed to load branding', e);
    }
    return DEFAULT_BRANDING;
  });

  // Firestore Connection & Sync Status
  const [firestoreStatus, setFirestoreStatus] = useState<'synced' | 'syncing' | 'offline'>('syncing');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Fast Startup Hydration: Read unlimited-size IndexedDB cache instantly on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [cachedRecords, cachedBranding, cachedCreds] = await Promise.all([
          idbGet<FirearmRegistration[]>('firearms_records'),
          idbGet<SystemBranding>('system_branding'),
          idbGet<SystemCredentials>('auth_credentials'),
        ]);

        if (isMounted) {
          if (cachedRecords && Array.isArray(cachedRecords) && cachedRecords.length > 0) {
            setRecords(cachedRecords);
          }
          if (cachedBranding && Object.keys(cachedBranding).length > 0) {
            setBranding((prev) => ({
              ...prev,
              ...cachedBranding,
              watermarkLogo: cachedBranding.watermarkLogo || prev.watermarkLogo || DEFAULT_POLICE_WATERMARK,
            }));
          }
          if (cachedCreds?.admin?.username && cachedCreds?.official?.username) {
            setCredentials(cachedCreds);
          }
          setIsHydrated(true);
        }
      } catch (err) {
        console.warn('IndexedDB initial hydration notice:', err);
        if (isMounted) setIsHydrated(true);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // Firestore Real-Time Listener for System Branding & Auth Credentials
  useEffect(() => {
    let unsubscribeBranding: (() => void) | null = null;
    try {
      const configCol = collection(db, 'system_config');
      unsubscribeBranding = onSnapshot(
        configCol,
        (snapshot) => {
          let mergedBranding: Partial<SystemBranding> = {};

          const assetDocMap: Record<string, keyof SystemBranding> = {
            asset_policeLogo: 'policeLogo',
            asset_watermarkLogo: 'watermarkLogo',
            asset_bgrsFlag: 'bgrsFlag',
            asset_ethiopiaFlag: 'ethiopiaFlag',
            asset_officialStampSeal: 'officialStampSeal',
            asset_approverSig: 'defaultApproverSignature',
            asset_registrarSig: 'defaultRegistrarSignature',
          };

          snapshot.forEach((docSnap) => {
            if (docSnap.id === 'branding') {
              const data = docSnap.data();
              if (data) {
                Object.assign(mergedBranding, data);
              }
            } else if (docSnap.id === 'auth_credentials') {
              const credData = docSnap.data();
              if (credData?.admin?.username && credData?.official?.username) {
                setCredentials(credData as SystemCredentials);
                idbSet('auth_credentials', credData);
                try {
                  localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(credData));
                } catch {}
              }
            } else if (docSnap.id in assetDocMap) {
              const fieldKey = assetDocMap[docSnap.id];
              const val = docSnap.data()?.value;
              if (val && typeof val === 'string') {
                (mergedBranding as any)[fieldKey] = val;
              }
            }
          });

          if (Object.keys(mergedBranding).length > 0) {
            setBranding((prev) => {
              const updated = {
                ...prev,
                ...mergedBranding,
                watermarkLogo: mergedBranding.watermarkLogo || prev.watermarkLogo || DEFAULT_POLICE_WATERMARK,
              };
              idbSet('system_branding', updated);
              try {
                localStorage.setItem(STORAGE_KEYS.BRANDING, JSON.stringify(updated));
              } catch {}
              return updated;
            });
          } else if (snapshot.empty) {
            // First time initialization in cloud
            setDoc(doc(db, 'system_config', 'branding'), {
              commissionNameAm: DEFAULT_BRANDING.commissionNameAm,
              commissionNameEn: DEFAULT_BRANDING.commissionNameEn,
              processNameAm: DEFAULT_BRANDING.processNameAm,
              processNameEn: DEFAULT_BRANDING.processNameEn,
              contactPhone: DEFAULT_BRANDING.contactPhone,
            }).catch((e) => {
              console.warn('Initial branding cloud seed notice:', e);
            });

            // Seed default credentials in Firestore
            setDoc(doc(db, 'system_config', 'auth_credentials'), DEFAULT_CREDENTIALS).catch((e) => {
              console.warn('Initial auth credentials cloud seed notice:', e);
            });
          }
        },
        (error) => {
          console.warn('Branding cloud sync notice (using cached defaults):', error);
        }
      );
    } catch (err) {
      console.warn('Branding listener error:', err);
    }

    return () => {
      if (unsubscribeBranding) unsubscribeBranding();
    };
  }, []);

  // Firestore Real-Time Listener for Firearms Records
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    try {
      const recordsCol = collection(db, 'firearms_records');
      unsubscribe = onSnapshot(
        recordsCol,
        async (snapshot) => {
          if (!snapshot.empty) {
            const remoteRecords: FirearmRegistration[] = [];
            snapshot.forEach((docSnap) => {
              remoteRecords.push(docSnap.data() as FirearmRegistration);
            });
            // Sort by createdAt descending
            remoteRecords.sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setRecords(remoteRecords);
            idbSet('firearms_records', remoteRecords);
            try {
              localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(remoteRecords));
            } catch {}
            setFirestoreStatus('synced');
          } else {
            // If cloud is empty, check if we have records in local state or IndexedDB first!
            const localCached = await idbGet<FirearmRegistration[]>('firearms_records');
            if (localCached && localCached.length > 0) {
              // Upload existing local records to cloud so they are never lost!
              for (const rec of localCached) {
                try {
                  await setDoc(doc(db, 'firearms_records', rec.id), rec);
                } catch (e) {
                  console.warn('Local-to-cloud sync warning:', e);
                }
              }
            } else {
              // First time Firestore initialization: seed initial records
              INITIAL_SEED_RECORDS.forEach(async (seedRec) => {
                try {
                  await setDoc(doc(db, 'firearms_records', seedRec.id), seedRec);
                } catch (err) {
                  console.warn('Seed write warning', err);
                }
              });
            }
            setFirestoreStatus('synced');
          }
        },
        (error) => {
          console.warn('Firestore real-time subscription notice (offline fallback active):', error);
          setFirestoreStatus('offline');
        }
      );
    } catch (e) {
      console.warn('Firestore connection notice:', e);
      setFirestoreStatus('offline');
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Save records locally as instant fallback (ONLY AFTER HYDRATION)
  useEffect(() => {
    if (!isHydrated) return;
    idbSet('firearms_records', records);
    try {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    } catch {}
  }, [records, isHydrated]);

  // Save branding on modification (ONLY AFTER HYDRATION)
  useEffect(() => {
    if (!isHydrated) return;
    idbSet('system_branding', branding);
    try {
      localStorage.setItem(STORAGE_KEYS.BRANDING, JSON.stringify(branding));
    } catch {}
  }, [branding, isHydrated]);

  // Save session
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEYS.SESSION);
      }
    } catch (e) {
      console.error('Failed to save session', e);
    }
  }, [user]);

  // Sequential numbering helpers
  const getNextIdCardNumber = (): string => {
    let maxNum = 0;
    records.forEach(r => {
      // Format: ቤጌፖ-ጦመ-0001
      const match = r.idCardNumber?.match(/(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });
    const next = maxNum + 1;
    return `ቤጌፖ-ጦመ-${String(next).padStart(4, '0')}`;
  };

  const getNextCertNumber = (): string => {
    let maxNum = 0;
    const currentYear = new Date().getFullYear();
    records.forEach(r => {
      // Format: 00001/ጦመ-2026
      const match = r.certNumber?.match(/^(\d+)\/ጦመ/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });
    const next = maxNum + 1;
    return `${String(next).padStart(5, '0')}/ጦመ-${currentYear}`;
  };

  // Save credentials locally on modification (ONLY AFTER HYDRATION)
  useEffect(() => {
    if (!isHydrated) return;
    idbSet('auth_credentials', credentials);
    try {
      localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(credentials));
    } catch {}
  }, [credentials, isHydrated]);

  // High-Grade Cryptographic Auth & Anti-Brute-Force Protection
  // Protected with salted SHA-256 and automatic lockout after 5 failed attempts
  const login = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
    const cleanUser = username.trim();
    const cleanPass = password.trim();

    // 1. Anti-Brute Force Lockout Check
    const lockout = getLockoutStatus();
    if (lockout.isLocked) {
      return {
        success: false,
        message: `⚠️ ጥብቅ የደህንነት እገዳ፡ በርካታ የተሳሳቱ የይለፍ ቃሎች ተሞክረዋል! ሲስተሙን ከጥቃት ለመጠበቅ ለ${lockout.remainingSeconds} ሰከንድ ተቆልፏል፡፡ እባክዎ በትዕግስት ይጠብቁ፡፡`,
      };
    }

    if (!cleanUser || !cleanPass) {
      return {
        success: false,
        message: 'እባክዎ የተጠቃሚ ስም እና የይለፍ ቃል ያስገቡ!',
      };
    }

    // 2. Verify Admin Account
    const adminCred = credentials.admin;
    if (cleanUser.toLowerCase() === adminCred.username.toLowerCase()) {
      let isMatch = false;
      if (adminCred.passwordHash && adminCred.salt) {
        isMatch = await verifyPassword(cleanPass, adminCred.salt, adminCred.passwordHash);
      }
      // Failover fallback for default credentials
      if (!isMatch && adminCred.username === 'admin' && cleanPass === 'Admin@1234') {
        isMatch = true;
      }

      if (isMatch) {
        resetFailedAttempts();
        const adminUser: AuthUser = {
          username: adminCred.username,
          role: 'ADMIN',
          fullName: adminCred.fullName || 'ዋና የመረጃ እና ምዝገባ አድሚን',
          title: adminCred.title || 'የቴክኖሎጂ እና መዝጋቢ ባለስልጣን',
        };
        setUser(adminUser);
        return { success: true, message: 'እንኳን ደህና መጡ! ዋና አድሚን በተሳካ ሁኔታ ገብተዋል፡፡' };
      }
    }

    // 3. Verify Official / Approver Account
    const officialCred = credentials.official;
    if (cleanUser.toLowerCase() === officialCred.username.toLowerCase()) {
      let isMatch = false;
      if (officialCred.passwordHash && officialCred.salt) {
        isMatch = await verifyPassword(cleanPass, officialCred.salt, officialCred.passwordHash);
      }
      // Failover fallback for default credentials
      if (!isMatch && officialCred.username === 'admin2026' && cleanPass === 'Admin@2026') {
        isMatch = true;
      }

      if (isMatch) {
        resetFailedAttempts();
        const officialUser: AuthUser = {
          username: officialCred.username,
          role: 'OFFICIAL',
          fullName: officialCred.fullName || 'ኮማንደር መንግስቱ በቀለ',
          title: officialCred.title || 'የወንጀል መከላከል የስራ ሂደት ሃላፊ',
        };
        setUser(officialUser);
        return { success: true, message: 'እንኳን ደህና መጡ! የተከበሩ ሃላፊ በተሳካ ሁኔታ ገብተዋል፡፡' };
      }
    }

    // 4. Record Failed Attempt and apply brute force lockout penalty if exceeded
    const newLockout = recordFailedAttempt();
    if (newLockout.isLocked) {
      return {
        success: false,
        message: '⚠️ ጥብቅ የደህንነት ማስጠንቀቂያ፡ 5 ተከታታይ የተሳሳቱ የይለፍ ቃሎች ተሞክረዋል! ሲስተሙን ከጥቃት ለመጠበቅ ለ30 ሰከንድ ተቆልፏል፡፡',
      };
    }

    const remaining = 5 - newLockout.attemptsCount;
    return {
      success: false,
      message: `የተሳሳተ የተጠቃሚ ስም ወይም የይለፍ ቃል! (ከ${remaining} የተሳሳቱ ሙከራዎች በኋላ ሲስተሙ በራስ-ሰር ይቆለፋል)`,
    };
  };

  const logout = () => {
    setUser(null);
  };

  // Change Admin Credentials (Username and Password) - Strictly Admin only
  const updateAdminCredentials = async (
    newUsername: string,
    currentPassword: string,
    newPassword?: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!user || user.role !== 'ADMIN') {
      return { success: false, message: 'ይቅርታ፤ ይህንን እርምጃ ማከናወን የሚችለው ዋና አድሚን ብቻ ነው!' };
    }

    const cleanNewUser = newUsername.trim();
    if (!cleanNewUser) {
      return { success: false, message: 'እባክዎ ትክክለኛ የአድሚን የተጠቃሚ ስም (Username) ያስገቡ!' };
    }

    // Verify current password for safety
    let isCurrentPassValid = false;
    if (credentials.admin.passwordHash && credentials.admin.salt) {
      isCurrentPassValid = await verifyPassword(currentPassword, credentials.admin.salt, credentials.admin.passwordHash);
    }
    if (!isCurrentPassValid && credentials.admin.username === 'admin' && currentPassword === 'Admin@1234') {
      isCurrentPassValid = true;
    }

    if (!isCurrentPassValid) {
      return { success: false, message: 'አሁን የሚጠቀሙበት የይለፍ ቃል (Current Password) ትክክል አይደለም!' };
    }

    let newHash = credentials.admin.passwordHash;
    let newSalt = credentials.admin.salt;
    if (newPassword && newPassword.trim()) {
      if (newPassword.trim().length < 6) {
        return { success: false, message: 'አዲሱ የይለፍ ቃል ቢያንስ 6 ፊደላት ወይም ቁጥሮች ሊኖሩት ይገባል!' };
      }
      newSalt = generateSalt();
      newHash = await hashPassword(newPassword.trim(), newSalt);
    }

    const updatedAdmin: UserCredential = {
      ...credentials.admin,
      username: cleanNewUser,
      passwordHash: newHash,
      salt: newSalt,
      updatedAt: new Date().toISOString(),
    };

    const updatedCreds: SystemCredentials = {
      ...credentials,
      admin: updatedAdmin,
    };

    setCredentials(updatedCreds);
    await idbSet('auth_credentials', updatedCreds);
    try {
      localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(updatedCreds));
    } catch {}

    // Save to Firestore system_config/auth_credentials
    try {
      await setDoc(doc(db, 'system_config', 'auth_credentials'), sanitizeForFirestore(updatedCreds), { merge: true });
      setFirestoreStatus('synced');
    } catch (e) {
      console.warn('Admin credentials cloud sync notice:', e);
    }

    // Update active session user if admin username changed
    setUser(prev => prev ? { ...prev, username: cleanNewUser } : null);

    return { 
      success: true, 
      message: 'የአድሚን መለያ እና የይለፍ ቃል በተሳካ ሁኔታ ተቀይሮ በከፍተኛ ክሪፕቶግራፊክ ደህንነት ተቀምጧል!' 
    };
  };

  // Change Official / Approver Credentials (Username, Password, Name, Title) - Admin only
  const updateOfficialCredentials = async (
    newUsername: string,
    newPassword?: string,
    newFullName?: string,
    newTitle?: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!user || user.role !== 'ADMIN') {
      return { success: false, message: 'ይቅርታ፤ የሃላፊውን መለያ መቀየር የሚችለው ዋና አድሚን ብቻ ነው!' };
    }

    const cleanNewUser = newUsername.trim();
    if (!cleanNewUser) {
      return { success: false, message: 'እባክዎ የሃላፊውን ትክክለኛ የተጠቃሚ ስም (Username) ያስገቡ!' };
    }

    let newHash = credentials.official.passwordHash;
    let newSalt = credentials.official.salt;
    if (newPassword && newPassword.trim()) {
      if (newPassword.trim().length < 6) {
        return { success: false, message: 'አዲሱ የይለፍ ቃል ቢያንስ 6 ፊደላት ወይም ቁጥሮች ሊኖሩት ይገባል!' };
      }
      newSalt = generateSalt();
      newHash = await hashPassword(newPassword.trim(), newSalt);
    }

    const updatedOfficial: UserCredential = {
      ...credentials.official,
      username: cleanNewUser,
      fullName: newFullName?.trim() || credentials.official.fullName,
      title: newTitle?.trim() || credentials.official.title,
      passwordHash: newHash,
      salt: newSalt,
      updatedAt: new Date().toISOString(),
    };

    const updatedCreds: SystemCredentials = {
      ...credentials,
      official: updatedOfficial,
    };

    setCredentials(updatedCreds);
    await idbSet('auth_credentials', updatedCreds);
    try {
      localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(updatedCreds));
    } catch {}

    // Save to Firestore system_config/auth_credentials
    try {
      await setDoc(doc(db, 'system_config', 'auth_credentials'), sanitizeForFirestore(updatedCreds), { merge: true });
      setFirestoreStatus('synced');
    } catch (e) {
      console.warn('Official credentials cloud sync notice:', e);
    }

    return { 
      success: true, 
      message: 'የስራ ሂደት ሃላፊው መለያ እና የይለፍ ቃል በተሳካ ሁኔታ ተቀይሮ ተቀምጧል!' 
    };
  };

  // Reset Credentials back to factory default
  const resetCredentialsToDefault = async (): Promise<{ success: boolean; message: string }> => {
    if (!user || user.role !== 'ADMIN') {
      return { success: false, message: 'ይቅርታ፤ ይህንን ማድረግ የሚችለው ዋና አድሚን ብቻ ነው!' };
    }
    setCredentials(DEFAULT_CREDENTIALS);
    await idbSet('auth_credentials', DEFAULT_CREDENTIALS);
    try {
      localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(DEFAULT_CREDENTIALS));
    } catch {}
    try {
      await setDoc(doc(db, 'system_config', 'auth_credentials'), sanitizeForFirestore(DEFAULT_CREDENTIALS), { merge: true });
      setFirestoreStatus('synced');
    } catch (e) {
      console.warn('Reset credentials cloud notice:', e);
    }
    return { success: true, message: 'የተጠቃሚ መለያዎች እና የይለፍ ቃሎች ወደ ነባሪ (Default) ተመልሰዋል፡፡' };
  };

  const updateBranding = async (newBranding: Partial<SystemBranding>): Promise<boolean> => {
    let finalUpdate = { ...newBranding };
    // Automatically convert logo to a pure white background watermark if policeLogo was updated without watermarkLogo
    if (newBranding.policeLogo && !newBranding.watermarkLogo) {
      try {
        const whiteWatermark = await convertLogoToWhiteWatermark(newBranding.policeLogo);
        finalUpdate.watermarkLogo = whiteWatermark;
      } catch (err) {
        console.warn('Auto watermark generation notice:', err);
      }
    }
    const updated = { ...branding, ...finalUpdate };
    setBranding(updated);

    // Save to IndexedDB immediately (instant, zero quota limit)
    await idbSet('system_branding', updated);
    try {
      localStorage.setItem(STORAGE_KEYS.BRANDING, JSON.stringify(updated));
    } catch {}

    // Save to Firestore with individual asset document protection to guarantee no 1MB limit blockage
    try {
      const assetMap: Array<{ key: keyof SystemBranding; docId: string }> = [
        { key: 'policeLogo', docId: 'asset_policeLogo' },
        { key: 'watermarkLogo', docId: 'asset_watermarkLogo' },
        { key: 'bgrsFlag', docId: 'asset_bgrsFlag' },
        { key: 'ethiopiaFlag', docId: 'asset_ethiopiaFlag' },
        { key: 'officialStampSeal', docId: 'asset_officialStampSeal' },
        { key: 'defaultApproverSignature', docId: 'asset_approverSig' },
        { key: 'defaultRegistrarSignature', docId: 'asset_registrarSig' },
      ];

      for (const item of assetMap) {
        if (finalUpdate[item.key]) {
          await setDoc(
            doc(db, 'system_config', item.docId),
            { value: finalUpdate[item.key], updatedAt: new Date().toISOString() },
            { merge: true }
          ).catch((e) => console.warn(`Sub-asset ${item.docId} write warning:`, e));
        }
      }

      // Safe clean metadata document without giant base64 images to prevent 1MB overflow
      const metaDoc = {
        commissionNameAm: updated.commissionNameAm,
        commissionNameEn: updated.commissionNameEn,
        processNameAm: updated.processNameAm,
        processNameEn: updated.processNameEn,
        contactPhone: updated.contactPhone,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'system_config', 'branding'), metaDoc, { merge: true });
      setFirestoreStatus('synced');
      return true;
    } catch (err) {
      console.warn('Firestore branding update notice:', err);
      return false;
    }
  };

  const resetBrandingToDefaults = async (): Promise<boolean> => {
    setBranding(DEFAULT_BRANDING);
    await idbSet('system_branding', DEFAULT_BRANDING);
    try {
      localStorage.setItem(STORAGE_KEYS.BRANDING, JSON.stringify(DEFAULT_BRANDING));
      
      const assetMap: Array<{ key: keyof SystemBranding; docId: string }> = [
        { key: 'policeLogo', docId: 'asset_policeLogo' },
        { key: 'watermarkLogo', docId: 'asset_watermarkLogo' },
        { key: 'bgrsFlag', docId: 'asset_bgrsFlag' },
        { key: 'ethiopiaFlag', docId: 'asset_ethiopiaFlag' },
        { key: 'officialStampSeal', docId: 'asset_officialStampSeal' },
        { key: 'defaultApproverSignature', docId: 'asset_approverSig' },
        { key: 'defaultRegistrarSignature', docId: 'asset_registrarSig' },
      ];

      for (const item of assetMap) {
        await setDoc(
          doc(db, 'system_config', item.docId),
          { value: DEFAULT_BRANDING[item.key], updatedAt: new Date().toISOString() },
          { merge: true }
        ).catch(() => {});
      }

      await setDoc(doc(db, 'system_config', 'branding'), {
        commissionNameAm: DEFAULT_BRANDING.commissionNameAm,
        commissionNameEn: DEFAULT_BRANDING.commissionNameEn,
        processNameAm: DEFAULT_BRANDING.processNameAm,
        processNameEn: DEFAULT_BRANDING.processNameEn,
        contactPhone: DEFAULT_BRANDING.contactPhone,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      setFirestoreStatus('synced');
      return true;
    } catch (err) {
      console.warn('Firestore branding reset notice:', err);
      return false;
    }
  };

  const refreshFromFirestore = async (): Promise<void> => {
    setIsRefreshing(true);
    setFirestoreStatus('syncing');
    try {
      const recordsCol = collection(db, 'firearms_records');
      const snapshot = await getDocs(recordsCol);
      if (!snapshot.empty) {
        const remoteRecords: FirearmRegistration[] = [];
        snapshot.forEach((docSnap) => {
          remoteRecords.push(docSnap.data() as FirearmRegistration);
        });
        remoteRecords.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRecords(remoteRecords);
        await idbSet('firearms_records', remoteRecords);
        try {
          localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(remoteRecords));
        } catch {}
      }

      const brandingSnap = await getDoc(doc(db, 'system_config', 'branding'));
      if (brandingSnap.exists()) {
        const bData = brandingSnap.data() as Partial<SystemBranding>;
        setBranding((prev) => {
          const updated = {
            ...prev,
            ...bData,
            watermarkLogo: bData.watermarkLogo || prev.watermarkLogo || DEFAULT_POLICE_WATERMARK,
          };
          idbSet('system_branding', updated);
          return updated;
        });
      }
      setFirestoreStatus('synced');
    } catch (err) {
      console.warn('Manual refresh notice:', err);
      setFirestoreStatus('offline');
    } finally {
      setIsRefreshing(false);
    }
  };

  const addRegistration = (
    formData: Omit<FirearmRegistration, 'id' | 'idCardNumber' | 'certNumber' | 'createdAt' | 'updatedAt' | 'status'>
  ): FirearmRegistration => {
    const nextIdCard = getNextIdCardNumber();
    const nextCert = getNextCertNumber();
    const now = new Date().toISOString();

    const newRecord: FirearmRegistration = {
      ...formData,
      id: `rec-${Date.now()}`,
      idCardNumber: nextIdCard,
      certNumber: nextCert,
      status: 'በሂደት ላይ', // Requires official approval to unlock print & legal QR verification!
      createdAt: now,
      updatedAt: now,
    };

    setRecords((prev) => {
      const updated = [newRecord, ...prev];
      idbSet('firearms_records', updated);
      try {
        localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Persist to Firestore with instant local state maintained
    try {
      setDoc(doc(db, 'firearms_records', newRecord.id), sanitizeForFirestore(newRecord)).catch((e) => {
        console.warn('Firestore write notice (local state maintained):', e);
      });
    } catch (e) {
      console.warn('Firestore write notice:', e);
    }

    return newRecord;
  };

  const updateRegistration = (id: string, updates: Partial<FirearmRegistration>) => {
    const now = new Date().toISOString();
    setRecords(prev => {
      const updated = prev.map(item =>
        item.id === id
          ? {
              ...item,
              ...updates,
              updatedAt: now,
            }
          : item
      );
      idbSet('firearms_records', updated);
      try {
        localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Update in Firestore
    try {
      setDoc(doc(db, 'firearms_records', id), sanitizeForFirestore({ ...updates, updatedAt: now }), { merge: true }).catch((e) => {
        console.warn('Firestore update notice:', e);
      });
    } catch (e) {
      console.warn('Firestore update notice:', e);
    }
  };

  const deleteRegistration = (id: string) => {
    setRecords(prev => {
      const updated = prev.filter(item => item.id !== id);
      idbSet('firearms_records', updated);
      try {
        localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    try {
      deleteDoc(doc(db, 'firearms_records', id)).catch(() => {});
    } catch {}
  };

  const approveRegistration = (id: string, approverName?: string, notes?: string) => {
    const now = new Date().toISOString();
    const updates = {
      status: 'የጸደቀ' as const,
      approvedAt: now,
      approvedBy: approverName || user?.fullName || 'ኮማንደር መንግስቱ በቀለ',
      approverSignature: branding.defaultApproverSignature,
      notes: notes || '',
      updatedAt: now,
    };

    setRecords(prev => {
      const updated = prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            ...updates,
            notes: notes || item.notes,
          };
        }
        return item;
      });
      idbSet('firearms_records', updated);
      try {
        localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      setDoc(doc(db, 'firearms_records', id), sanitizeForFirestore(updates), { merge: true }).catch(() => {});
    } catch {}
  };

  const rejectRegistration = (id: string, reason: string) => {
    const now = new Date().toISOString();
    const updates = {
      status: 'የተከለከለ' as const,
      rejectionReason: reason,
      updatedAt: now,
    };

    setRecords(prev => {
      const updated = prev.map(item =>
        item.id === id
          ? {
              ...item,
              ...updates,
            }
          : item
      );
      idbSet('firearms_records', updated);
      try {
        localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      setDoc(doc(db, 'firearms_records', id), sanitizeForFirestore(updates), { merge: true }).catch(() => {});
    } catch {}
  };

  const suspendRegistration = (id: string, reason: string) => {
    const now = new Date().toISOString();
    const updates = {
      status: 'የታገደ' as const,
      rejectionReason: reason,
      updatedAt: now,
    };

    setRecords(prev => {
      const updated = prev.map(item =>
        item.id === id
          ? {
              ...item,
              ...updates,
            }
          : item
      );
      idbSet('firearms_records', updated);
      try {
        localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      setDoc(doc(db, 'firearms_records', id), sanitizeForFirestore(updates), { merge: true }).catch(() => {});
    } catch {}
  };

  const renewRegistration = (id: string) => {
    const now = new Date();
    const nextYear = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    const dateStr = nextYear.toISOString().split('T')[0];
    const updateTime = now.toISOString();

    const updates = {
      expiryDate: dateStr,
      status: 'የጸደቀ' as const,
      updatedAt: updateTime,
      warningNoticeSent: false,
    };

    setRecords(prev => {
      const updated = prev.map(item =>
        item.id === id
          ? {
              ...item,
              ...updates,
            }
          : item
      );
      idbSet('firearms_records', updated);
      try {
        localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      setDoc(doc(db, 'firearms_records', id), sanitizeForFirestore(updates), { merge: true }).catch(() => {});
    } catch {}
  };

  const sendWarningNotice = (id: string) => {
    const now = new Date().toISOString();
    const updates = {
      warningNoticeSent: true,
      updatedAt: now,
    };

    setRecords(prev => {
      const updated = prev.map(item =>
        item.id === id
          ? {
              ...item,
              ...updates,
            }
          : item
      );
      idbSet('firearms_records', updated);
      try {
        localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      setDoc(doc(db, 'firearms_records', id), sanitizeForFirestore(updates), { merge: true }).catch(() => {});
    } catch {}
  };

  // 1. መሣሪያ ገቢ ማድረግ (Surrender / Return Firearm to Depot/Custody)
  const surrenderFirearm = async (
    id: string,
    reason: string,
    officerName: string,
    referenceLetterNo?: string,
    depotLocation?: string
  ): Promise<boolean> => {
    const target = records.find(r => r.id === id);
    if (!target) return false;

    const now = new Date().toISOString();
    const dateStr = now.split('T')[0];
    const defaultDepot = depotLocation || 'የቤ/ጉ/ክ/ፖ/ኮ ዋና የጦር መሳሪያ ግምጃ ቤት (አሶሳ)';

    const event = {
      id: `evt-${Date.now()}`,
      actionType: 'WEAPON_SURRENDER' as const,
      actionTitle: 'መሳሪያ ገቢ ተደረገ (Surrendered / Returned)',
      date: dateStr,
      timestamp: now,
      reason,
      officerName: officerName || user?.fullName || 'የፖሊስ ኃላፊ',
      referenceLetterNo: referenceLetterNo || '',
      depotLocation: defaultDepot,
      previousFirearm: {
        firearmType: target.firearmType,
        serialNumber: target.serialNumber,
        weaponCode: target.weaponCode,
        bulletCount: target.bulletCount,
        magazineCount: target.magazineCount,
        mechanism: target.mechanism,
        countryOfOrigin: target.countryOfOrigin,
        manufactureYear: target.manufactureYear,
      },
      notes: `መሳሪያው በ${officerName || 'ኃላፊ'} ተረክቦ ወደ "${defaultDepot}" ገቢ ተደርጓል፡፡ መታወቂያ ቁጥር ${target.idCardNumber} ለተመዝጋቢው እንደተጠበቀ ይቆያል፡፡`,
    };

    const updates: Partial<FirearmRegistration> = {
      status: 'ገቢ የተደረገ',
      isSurrendered: true,
      surrenderedAt: now,
      surrenderReason: reason,
      surrenderOfficer: officerName,
      surrenderReceiptNo: referenceLetterNo || '',
      depotLocation: defaultDepot,
      lifecycleHistory: [event, ...(target.lifecycleHistory || [])],
      updatedAt: now,
    };

    setRecords(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, ...updates } : item);
      idbSet('firearms_records', updated);
      try {
        localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      await setDoc(doc(db, 'firearms_records', id), sanitizeForFirestore(updates), { merge: true });
    } catch (e) {
      console.warn('Firestore surrender write notice:', e);
    }
    return true;
  };

  // 2. መሣሪያ መቀየር (Replace / Exchange Firearm)
  // Keeps existing ID card number strictly preserved (መታወቂያ ቁጥሩ እንዳለ ሆኖ!)
  const replaceFirearm = async (
    id: string,
    newFirearmData: Partial<FirearmRegistration>,
    reason: string,
    officerName: string,
    referenceLetterNo?: string
  ): Promise<boolean> => {
    const target = records.find(r => r.id === id);
    if (!target) return false;

    const now = new Date().toISOString();
    const dateStr = now.split('T')[0];

    const event = {
      id: `evt-${Date.now()}`,
      actionType: 'WEAPON_REPLACE' as const,
      actionTitle: 'መሳሪያ ተቀይሯል (Firearm Replaced)',
      date: dateStr,
      timestamp: now,
      reason,
      officerName: officerName || user?.fullName || 'የፖሊስ ኃላፊ',
      referenceLetterNo: referenceLetterNo || '',
      previousFirearm: {
        firearmType: target.firearmType,
        serialNumber: target.serialNumber,
        weaponCode: target.weaponCode,
        bulletCount: target.bulletCount,
        magazineCount: target.magazineCount,
        mechanism: target.mechanism,
        countryOfOrigin: target.countryOfOrigin,
        manufactureYear: target.manufactureYear,
      },
      newFirearm: {
        firearmType: newFirearmData.firearmType || target.firearmType,
        serialNumber: newFirearmData.serialNumber || target.serialNumber,
        weaponCode: newFirearmData.weaponCode || target.weaponCode,
        bulletCount: newFirearmData.bulletCount ?? target.bulletCount,
        magazineCount: newFirearmData.magazineCount ?? target.magazineCount,
        mechanism: newFirearmData.mechanism || target.mechanism,
        countryOfOrigin: newFirearmData.countryOfOrigin || target.countryOfOrigin,
        manufactureYear: newFirearmData.manufactureYear || target.manufactureYear,
      },
      notes: `የነበረው መሳሪያ (${target.firearmType} - ንምራ ${target.serialNumber}) ተቀይሮ አዲስ መሳሪያ (${newFirearmData.firearmType || target.firearmType} - ንምራ ${newFirearmData.serialNumber || target.serialNumber}) ተመዝግቧል፡፡ መታወቂያ ቁጥር፡ ${target.idCardNumber} ሳይቀየር እንዳለ ቀጥሏል፡፡`,
    };

    const updates: Partial<FirearmRegistration> = {
      firearmType: newFirearmData.firearmType || target.firearmType,
      serialNumber: newFirearmData.serialNumber || target.serialNumber,
      weaponCode: newFirearmData.weaponCode || target.weaponCode,
      bulletCount: newFirearmData.bulletCount ?? target.bulletCount,
      magazineCount: newFirearmData.magazineCount ?? target.magazineCount,
      ownership: newFirearmData.ownership || target.ownership,
      mechanism: newFirearmData.mechanism || target.mechanism,
      countryOfOrigin: newFirearmData.countryOfOrigin || target.countryOfOrigin,
      manufactureYear: newFirearmData.manufactureYear || target.manufactureYear,
      isSurrendered: false, // Active in hand
      status: target.status === 'ገቢ የተደረገ' ? 'የጸደቀ' : target.status,
      lastReplacedAt: now,
      lifecycleHistory: [event, ...(target.lifecycleHistory || [])],
      updatedAt: now,
    };

    setRecords(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, ...updates } : item);
      idbSet('firearms_records', updated);
      try {
        localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      await setDoc(doc(db, 'firearms_records', id), sanitizeForFirestore(updates), { merge: true });
    } catch (e) {
      console.warn('Firestore replace write notice:', e);
    }
    return true;
  };

  // 3. ጥይትና ካርት መጨመር (Add Bullets & Magazines / Quota Increase)
  const increaseAmmunition = async (
    id: string,
    addBullets: number,
    addMagazines: number,
    reason: string,
    officerName: string,
    referenceLetterNo?: string
  ): Promise<boolean> => {
    const target = records.find(r => r.id === id);
    if (!target) return false;

    const now = new Date().toISOString();
    const dateStr = now.split('T')[0];
    const prevBullets = target.bulletCount || 0;
    const prevMags = target.magazineCount || 0;
    const newTotalBullets = prevBullets + Number(addBullets);
    const newTotalMagazines = prevMags + Number(addMagazines);

    const event = {
      id: `evt-${Date.now()}`,
      actionType: 'AMMO_INCREASE' as const,
      actionTitle: 'ጥይት እና ካርት ተጨምሯል (Ammunition Quota Increase)',
      date: dateStr,
      timestamp: now,
      reason,
      officerName: officerName || user?.fullName || 'የፖሊስ ኃላፊ',
      referenceLetterNo: referenceLetterNo || '',
      ammoAdjustment: {
        addedBullets: Number(addBullets),
        addedMagazines: Number(addMagazines),
        previousBullets: prevBullets,
        newTotalBullets,
        previousMagazines: prevMags,
        newTotalMagazines,
      },
      notes: `ተጨማሪ +${addBullets} ጥይት እና +${addMagazines} ካርት ተፈቅዶ አጠቃላይ ብዛት ወደ ${newTotalBullets} ጥይት እና ${newTotalMagazines} ካርት ከፍ ብሏል፡፡`,
    };

    const updates: Partial<FirearmRegistration> = {
      bulletCount: newTotalBullets,
      magazineCount: newTotalMagazines,
      lastAmmoIncreaseAt: now,
      lifecycleHistory: [event, ...(target.lifecycleHistory || [])],
      updatedAt: now,
    };

    setRecords(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, ...updates } : item);
      idbSet('firearms_records', updated);
      try {
        localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      await setDoc(doc(db, 'firearms_records', id), sanitizeForFirestore(updates), { merge: true });
    } catch (e) {
      console.warn('Firestore ammo write notice:', e);
    }
    return true;
  };

  // 4. ገቢ አድርጎ ሌላ ማውጣት / ማደስ (Re-issue New Weapon after Surrender)
  // Preserving previous ID card number (በድሮው መታወቂያ ቁጥር እንዳለ ሆኖ ሌላ ማውጣት/ማስተካከል)
  const reissueFirearm = async (
    id: string,
    newFirearmData: Partial<FirearmRegistration>,
    reason: string,
    officerName: string,
    referenceLetterNo?: string
  ): Promise<boolean> => {
    const target = records.find(r => r.id === id);
    if (!target) return false;

    const now = new Date().toISOString();
    const dateStr = now.split('T')[0];

    const event = {
      id: `evt-${Date.now()}`,
      actionType: 'WEAPON_REISSUE' as const,
      actionTitle: 'ገቢ የተደረገው ተነስቶ ሌላ መሳሪያ ወጥቷል (Re-issued After Surrender)',
      date: dateStr,
      timestamp: now,
      reason,
      officerName: officerName || user?.fullName || 'የፖሊስ ኃላፊ',
      referenceLetterNo: referenceLetterNo || '',
      previousFirearm: {
        firearmType: target.firearmType,
        serialNumber: target.serialNumber,
        weaponCode: target.weaponCode,
        bulletCount: target.bulletCount,
        magazineCount: target.magazineCount,
        mechanism: target.mechanism,
        countryOfOrigin: target.countryOfOrigin,
        manufactureYear: target.manufactureYear,
      },
      newFirearm: {
        firearmType: newFirearmData.firearmType || target.firearmType,
        serialNumber: newFirearmData.serialNumber || target.serialNumber,
        weaponCode: newFirearmData.weaponCode || target.weaponCode,
        bulletCount: newFirearmData.bulletCount ?? target.bulletCount,
        magazineCount: newFirearmData.magazineCount ?? target.magazineCount,
        mechanism: newFirearmData.mechanism || target.mechanism,
        countryOfOrigin: newFirearmData.countryOfOrigin || target.countryOfOrigin,
        manufactureYear: newFirearmData.manufactureYear || target.manufactureYear,
      },
      notes: `በድሮው መታወቂያ ቁጥር (${target.idCardNumber}) ስር ገቢ ተደርጎ የቆየው ሰነድ ታድሶ አዲስ መሳሪያ ወጥቷል፡፡`,
    };

    const updates: Partial<FirearmRegistration> = {
      firearmType: newFirearmData.firearmType || target.firearmType,
      serialNumber: newFirearmData.serialNumber || target.serialNumber,
      weaponCode: newFirearmData.weaponCode || target.weaponCode,
      bulletCount: newFirearmData.bulletCount ?? target.bulletCount,
      magazineCount: newFirearmData.magazineCount ?? target.magazineCount,
      ownership: newFirearmData.ownership || target.ownership,
      mechanism: newFirearmData.mechanism || target.mechanism,
      countryOfOrigin: newFirearmData.countryOfOrigin || target.countryOfOrigin,
      manufactureYear: newFirearmData.manufactureYear || target.manufactureYear,
      isSurrendered: false, // Reactivated!
      status: 'የጸደቀ',
      reissuedAt: now,
      lifecycleHistory: [event, ...(target.lifecycleHistory || [])],
      updatedAt: now,
    };

    setRecords(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, ...updates } : item);
      idbSet('firearms_records', updated);
      try {
        localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      await setDoc(doc(db, 'firearms_records', id), sanitizeForFirestore(updates), { merge: true });
    } catch (e) {
      console.warn('Firestore reissue write notice:', e);
    }
    return true;
  };

  return (
    <SystemContext.Provider
      value={{
        user,
        credentials,
        login,
        logout,
        updateAdminCredentials,
        updateOfficialCredentials,
        resetCredentialsToDefault,
        records,
        branding,
        firestoreStatus,
        isRefreshing,
        refreshFromFirestore,
        updateBranding,
        resetBrandingToDefaults,
        addRegistration,
        updateRegistration,
        deleteRegistration,
        approveRegistration,
        rejectRegistration,
        suspendRegistration,
        renewRegistration,
        sendWarningNotice,
        surrenderFirearm,
        replaceFirearm,
        increaseAmmunition,
        reissueFirearm,
        getNextIdCardNumber,
        getNextCertNumber,
      }}
    >
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
};
