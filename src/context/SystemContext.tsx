import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  FirearmRegistration, 
  SystemBranding, 
  AuthUser,
  UserRole
} from '../types/index.ts';
import { 
  DEFAULT_BGRS_FLAG, 
  DEFAULT_ETHIOPIAN_FLAG, 
  DEFAULT_POLICE_LOGO, 
  DEFAULT_OFFICIAL_STAMP,
  DEFAULT_APPROVER_SIGNATURE,
  DEFAULT_REGISTRAR_SIGNATURE,
  DEFAULT_SAMPLE_PHOTO
} from '../utils/assets.ts';
import { db } from '../firebase.ts';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs,
  writeBatch 
} from 'firebase/firestore';

interface SystemContextType {
  user: AuthUser | null;
  login: (username: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  records: FirearmRegistration[];
  branding: SystemBranding;
  firestoreStatus: 'synced' | 'syncing' | 'offline';
  updateBranding: (branding: Partial<SystemBranding>) => void;
  resetBrandingToDefaults: () => void;
  addRegistration: (formData: Omit<FirearmRegistration, 'id' | 'idCardNumber' | 'certNumber' | 'createdAt' | 'updatedAt' | 'status'>) => FirearmRegistration;
  updateRegistration: (id: string, updates: Partial<FirearmRegistration>) => void;
  deleteRegistration: (id: string) => void;
  approveRegistration: (id: string, approverName?: string, notes?: string) => void;
  rejectRegistration: (id: string, reason: string) => void;
  suspendRegistration: (id: string, reason: string) => void;
  renewRegistration: (id: string) => void;
  sendWarningNotice: (id: string) => void;
  getNextIdCardNumber: () => string;
  getNextCertNumber: () => string;
}

const STORAGE_KEYS = {
  RECORDS: 'bgrs_firearms_records_v1',
  BRANDING: 'bgrs_firearms_branding_v1',
  SESSION: 'bgrs_firearms_session_v1',
};

const DEFAULT_BRANDING: SystemBranding = {
  policeLogo: DEFAULT_POLICE_LOGO,
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
        return { ...DEFAULT_BRANDING, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load branding', e);
    }
    return DEFAULT_BRANDING;
  });

  // Firestore Connection & Sync Status
  const [firestoreStatus, setFirestoreStatus] = useState<'synced' | 'syncing' | 'offline'>('syncing');

  // Firestore Real-Time Listener for Firearms Records
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    try {
      const recordsCol = collection(db, 'firearms_records');
      unsubscribe = onSnapshot(
        recordsCol,
        (snapshot) => {
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
            setFirestoreStatus('synced');
          } else {
            // First time Firestore initialization: seed initial records
            INITIAL_SEED_RECORDS.forEach(async (seedRec) => {
              try {
                await setDoc(doc(db, 'firearms_records', seedRec.id), seedRec);
              } catch (err) {
                console.warn('Seed write warning', err);
              }
            });
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

  // Save records locally as instant fallback
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save records to localStorage', e);
    }
  }, [records]);

  // Save branding on modification
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BRANDING, JSON.stringify(branding));
    } catch (e) {
      console.error('Failed to save branding to localStorage', e);
    }
  }, [branding]);

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

  // Auth Logic according to prompt:
  // Admin: username "admin", password "Admin@1234"
  // Official / Approver: username "admin2026", password "Admin@2026"
  const login = (username: string, password: string) => {
    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (cleanUser === 'admin' && cleanPass === 'Admin@1234') {
      const adminUser: AuthUser = {
        username: 'admin',
        role: 'ADMIN',
        fullName: 'ዋና የመረጃ እና ምዝገባ አድሚን',
        title: 'የቴክኖሎጂ እና መዝጋቢ ባለስልጣን',
      };
      setUser(adminUser);
      return { success: true, message: 'እንኳን ደህና መጡ! አድሚን በተሳካ ሁኔታ ገብተዋል፡፡' };
    }

    if (cleanUser === 'admin2026' && cleanPass === 'Admin@2026') {
      const officialUser: AuthUser = {
        username: 'admin2026',
        role: 'OFFICIAL',
        fullName: 'ኮማንደር መንግስቱ በቀለ',
        title: 'የወንጀል መከላከል የስራ ሂደት ሃላፊ',
      };
      setUser(officialUser);
      return { success: true, message: 'እንኳን ደህና መጡ! የተከበሩ ሃላፊ በተሳካ ሁኔታ ገብተዋል፡፡' };
    }

    return { 
      success: false, 
      message: 'የተሳሳተ የተጠቃሚ ስም ወይም የይለፍ ቃል! እባክዎ እንደገና ይሞክሩ፡፡' 
    };
  };

  const logout = () => {
    setUser(null);
  };

  const updateBranding = (newBranding: Partial<SystemBranding>) => {
    const updated = { ...branding, ...newBranding };
    setBranding(updated);
    try {
      setDoc(doc(db, 'system_config', 'branding'), updated, { merge: true }).catch(() => {});
    } catch {}
  };

  const resetBrandingToDefaults = () => {
    setBranding(DEFAULT_BRANDING);
    try {
      setDoc(doc(db, 'system_config', 'branding'), DEFAULT_BRANDING).catch(() => {});
    } catch {}
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

    setRecords(prev => [newRecord, ...prev]);

    // Persist to Firestore
    try {
      setDoc(doc(db, 'firearms_records', newRecord.id), newRecord).catch((e) => {
        console.warn('Firestore write notice (local state maintained):', e);
      });
    } catch (e) {
      console.warn('Firestore write notice:', e);
    }

    return newRecord;
  };

  const updateRegistration = (id: string, updates: Partial<FirearmRegistration>) => {
    const now = new Date().toISOString();
    setRecords(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              ...updates,
              updatedAt: now,
            }
          : item
      )
    );

    // Update in Firestore
    try {
      updateDoc(doc(db, 'firearms_records', id), {
        ...updates,
        updatedAt: now,
      }).catch((e) => {
        console.warn('Firestore update notice:', e);
      });
    } catch (e) {
      console.warn('Firestore update notice:', e);
    }
  };

  const deleteRegistration = (id: string) => {
    setRecords(prev => prev.filter(item => item.id !== id));
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
      notes,
      updatedAt: now,
    };

    setRecords(prev =>
      prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            ...updates,
            notes: notes || item.notes,
          };
        }
        return item;
      })
    );

    try {
      updateDoc(doc(db, 'firearms_records', id), updates).catch(() => {});
    } catch {}
  };

  const rejectRegistration = (id: string, reason: string) => {
    const now = new Date().toISOString();
    const updates = {
      status: 'የተከለከለ' as const,
      rejectionReason: reason,
      updatedAt: now,
    };

    setRecords(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              ...updates,
            }
          : item
      )
    );

    try {
      updateDoc(doc(db, 'firearms_records', id), updates).catch(() => {});
    } catch {}
  };

  const suspendRegistration = (id: string, reason: string) => {
    const now = new Date().toISOString();
    const updates = {
      status: 'የታገደ' as const,
      rejectionReason: reason,
      updatedAt: now,
    };

    setRecords(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              ...updates,
            }
          : item
      )
    );

    try {
      updateDoc(doc(db, 'firearms_records', id), updates).catch(() => {});
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

    setRecords(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              ...updates,
            }
          : item
      )
    );

    try {
      updateDoc(doc(db, 'firearms_records', id), updates).catch(() => {});
    } catch {}
  };

  const sendWarningNotice = (id: string) => {
    const now = new Date().toISOString();
    setRecords(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              warningNoticeSent: true,
              updatedAt: now,
            }
          : item
      )
    );

    try {
      updateDoc(doc(db, 'firearms_records', id), {
        warningNoticeSent: true,
        updatedAt: now,
      }).catch(() => {});
    } catch {}
  };

  return (
    <SystemContext.Provider
      value={{
        user,
        login,
        logout,
        records,
        branding,
        firestoreStatus,
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
