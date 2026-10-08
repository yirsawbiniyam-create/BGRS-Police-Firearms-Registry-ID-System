export type UserRole = 'ADMIN' | 'OFFICIAL' | 'PUBLIC';

export interface AuthUser {
  username: string;
  role: UserRole;
  fullName: string;
  title: string;
}

export type FirearmOwnership = 'የመንግስት' | 'የግል';

export type FirearmMechanism = 
  | 'አውቶማቲክ' 
  | 'ግማሽ አውቶማቲክ' 
  | 'አንድ በአንድ የሚተኩስ' 
  | 'ሌላ';

export type RegistrationStatus = 
  | 'በሂደት ላይ'    // Pending Approval
  | 'የጸደቀ'         // Approved
  | 'የተከለከለ'       // Rejected
  | 'የታገደ';        // Suspended / Revoked

export interface FirearmRegistration {
  id: string;
  // Registrant Info (የባለመሳሪያው መረጃ)
  fullName: string;                // 1. ሙሉ ስም
  region: string;                  // 2. ክልል (default: ቤኒሻንጉል ጉሙዝ)
  zone: string;                    // ዞን (e.g., አሶሳ, መተከል, ካማሺ, ማኦ ኮሞ)
  woreda: string;                  // ወረዳ
  kebele: string;                  // ቀበሌ
  houseNumber: string;             // የቤት ቁጥር
  nationality: string;             // 3. ዜግነት (default: ኢትዮጵያዊ)
  age: number;                     // 4. ዕድሜ
  occupation: string;              // 5. ስራ
  positionRole: string;            // ሃላፊነት
  nationalIdNumber: string;        // 6. መታወቂያ ቁጥር
  nationalIdIssueDate: string;     // የተሰጠበት ቀን
  
  // Firearm Info (የመሳሪያው መረጃ)
  firearmType: string;             // 7. የመሳሪያው አይነት (ክላሽንኮቭ, ሽጉጥ, ወዘተ)
  serialNumber: string;            // ንምራ ቁጥር (Serial No)
  weaponCode: string;              // የመ/ቁ (Firearm Reg Code)
  bulletCount: number;             // 8. የጥይት ብዛት
  magazineCount: number;           // የካርታ ብዛት
  ownership: FirearmOwnership;     // የመንግስት / የግል
  mechanism: FirearmMechanism;     // 9. የመሳሪያው ይዘት
  countryOfOrigin: string;         // 10. የተሰራበት ሀገር
  manufactureYear: string;         // ዓ/ም (የተሰራበት ዓ/ም)
  
  // Identification & Official Numbers
  idCardNumber: string;            // e.g. ቤጌፖ-ጦመ-0001
  certNumber: string;              // e.g. 00001/ጦመ-2026
  
  // Registration & Validation Details
  registrationDate: string;        // የተመዘገበበት ቀንና ዓ/ም
  registrationPlace: string;       // የተመዘገበበት ቦታ (e.g., አሶሳ)
  expiryDate: string;              // የሚታደስበት ጊዜ (1 year from issue)
  
  // Signatures and Photos
  photoUrl: string;                // ጉርድ ፎቶ 3x4
  ownerSignature: string;          // የባለ መሳሪያው ፊርማ
  registrarName: string;           // የመዝጋቢ ባለስልጣን ስም
  registrarSignature: string;      // የመዝጋቢ ፊርማ
  approverName: string;            // የሀላፊው ስም
  approverSignature: string;       // የሀላፊው ፊርማ

  // Approval Lifecycle
  status: RegistrationStatus;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  warningNoticeSent?: boolean;
  notes?: string;

  createdAt: string;
  updatedAt: string;
}

export interface SystemBranding {
  policeLogo: string;
  bgrsFlag: string;
  ethiopiaFlag: string;
  officialStampSeal: string;
  defaultApproverSignature: string;
  defaultRegistrarSignature: string;
  commissionNameAm: string;
  commissionNameEn: string;
  processNameAm: string;
  processNameEn: string;
  contactPhone: string;
}

export interface MonthlyStats {
  month: string;
  totalRegistered: number;
  approvedCount: number;
  expiredCount: number;
  totalBullets: number;
}
