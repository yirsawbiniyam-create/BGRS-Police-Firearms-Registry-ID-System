import React, { useState, useEffect } from 'react';
import { FirearmRegistration, SystemBranding } from '../types/index.ts';
import { ShieldAlert, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { IdCardView } from './IdCardView.tsx';
import { db } from '../firebase.ts';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

interface PublicVerificationViewProps {
  registration: FirearmRegistration | null;
  idNumber: string;
  branding: SystemBranding;
}

export const PublicVerificationView: React.FC<PublicVerificationViewProps> = ({
  registration: initialRegistration,
  idNumber,
  branding: initialBranding,
}) => {
  const [record, setRecord] = useState<FirearmRegistration | null>(initialRegistration);
  const [branding, setBranding] = useState<SystemBranding>(initialBranding);
  const [isLoading, setIsLoading] = useState<boolean>(!initialRegistration);

  // Fast live lookup from Firestore so status (approved / expired / suspended / deleted) is always real-time
  useEffect(() => {
    let isMounted = true;

    async function verifyLiveFromFirestore() {
      try {
        const cleanId = decodeURIComponent(idNumber).trim();
        const normalizedId = cleanId.replace(/ቤጌፖ/g, 'ቤጉፖ');
        const legacyId = cleanId.replace(/ቤጉፖ/g, 'ቤጌፖ');
        const candidates = Array.from(new Set([normalizedId, cleanId, legacyId]));
        const recordsCol = collection(db, 'firearms_records');

        // Fetch branding + matching record in parallel for instant response
        const [brandingSnap, ...querySnaps] = await Promise.all([
          getDoc(doc(db, 'system_config', 'branding')).catch(() => null),
          ...candidates.map((cand) => getDocs(query(recordsCol, where('idCardNumber', '==', cand)))),
        ]);

        if (!isMounted) return;

        if (brandingSnap && brandingSnap.exists()) {
          setBranding((prev) => ({ ...prev, ...(brandingSnap.data() as SystemBranding) }));
        }

        for (const snap of querySnaps) {
          if (!snap.empty) {
            const found = snap.docs[0].data() as FirearmRegistration;
            const normalizedFound = found.idCardNumber?.includes('ቤጌፖ')
              ? { ...found, idCardNumber: found.idCardNumber.replace(/ቤጌፖ/g, 'ቤጉፖ') }
              : found;
            setRecord(normalizedFound);
            setIsLoading(false);
            return;
          }
        }

        // Direct document ID check
        const directSnap = await getDoc(doc(db, 'firearms_records', cleanId)).catch(() => null);
        if (directSnap && directSnap.exists() && isMounted) {
          const found = directSnap.data() as FirearmRegistration;
          const normalizedFound = found.idCardNumber?.includes('ቤጌፖ')
            ? { ...found, idCardNumber: found.idCardNumber.replace(/ቤጌፖ/g, 'ቤጉፖ') }
            : found;
          setRecord(normalizedFound);
          setIsLoading(false);
          return;
        }

        // Fallback case-insensitive check only if not already resolved
        if (!initialRegistration) {
          const allSnap = await getDocs(recordsCol);
          if (!allSnap.empty && isMounted) {
            let matched: FirearmRegistration | null = null;
            allSnap.forEach((d) => {
              const data = d.data() as FirearmRegistration;
              const recIdLower = (data.idCardNumber || '').toLowerCase();
              const recIdNorm = recIdLower.replace(/ቤጌፖ/g, 'ቤጉፖ');
              if (
                recIdLower === cleanId.toLowerCase() ||
                recIdNorm === normalizedId.toLowerCase()
              ) {
                matched = data.idCardNumber?.includes('ቤጌፖ')
                  ? { ...data, idCardNumber: data.idCardNumber.replace(/ቤጌፖ/g, 'ቤጉፖ') }
                  : data;
              }
            });
            if (matched) {
              setRecord(matched);
            }
          }
        }
      } catch (err) {
        console.error('Verification lookup notice:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    verifyLiveFromFirestore();

    return () => {
      isMounted = false;
    };
  }, [idNumber, initialRegistration]);

  // 1. Minimal Fast Loading Screen (View-only, zero navigation)
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-white select-none">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-9 w-9 animate-spin text-amber-400" />
          <span className="text-sm font-black text-amber-300">በማረጋገጥ ላይ...</span>
        </div>
      </div>
    );
  }

  const isApproved = record?.status === 'የጸደቀ';

  // 2. Unregistered OR Not Approved by Manager -> Show NOTHING of the ID card / person details!
  if (!record || !isApproved) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-white select-none">
        <div className="flex max-w-sm flex-col items-center gap-3 rounded-2xl border-2 border-rose-700 bg-rose-950/60 px-6 py-7 text-center shadow-2xl">
          <XCircle className="h-12 w-12 text-rose-500" />
          <p className="text-base font-black text-rose-300">
            ያልተመዘገበ ወይም በሃላፊ ያልተፈቀደ መታወቂያ
          </p>
        </div>
      </div>
    );
  }

  const isExpired = new Date(record.expiryDate) < new Date();
  const isSuspended = record.status === 'የታገደ';
  const isSurrendered = record.status === 'ገቢ የተደረገ' || Boolean(record.isSurrendered);
  const isInvalid = isExpired || isSuspended || isSurrendered;

  // 3. Approved & Registered -> Show ONLY Authenticity Status + Front ID Card (View-Only, Zero Extra Text/Navigation)
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 px-3 py-6 text-slate-100 select-none">
      {isInvalid ? (
        <div className="flex items-center gap-2 rounded-xl border-2 border-rose-600 bg-rose-950/85 px-5 py-2.5 text-center shadow-lg">
          <ShieldAlert className="h-5 w-5 shrink-0 text-rose-400" />
          <span className="text-sm font-black text-rose-200">
            {isExpired
              ? 'የማያገልግል መሳሪያ ፈቃድ — ፈቃዱ አያገለግልም'
              : 'የማያገልግል መሳሪያ ፈቃድ — ታግዷል / ገቢ ተደርጓል'}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-xl border-2 border-emerald-500 bg-emerald-950/80 px-5 py-2.5 text-center shadow-lg">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          <span className="text-sm font-black text-emerald-300">
            ትክክለኛ እና በሃላፊ የጸደቀ መታወቂያ
          </span>
        </div>
      )}

      {/* Front ID Card Only — Strictly View-Only, No Back Card, No Tabs, No Buttons, No Links */}
      <IdCardView
        registration={record}
        branding={branding}
        frontOnly={true}
        showPrintActions={false}
      />
    </div>
  );
};
