import React, { useState, useEffect } from 'react';
import { SystemProvider, useSystem } from './context/SystemContext.tsx';
import { FirearmRegistration } from './types/index.ts';
import { LoginForm } from './components/LoginForm.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { RegistrationForm } from './components/RegistrationForm.tsx';
import { FirearmsList } from './components/FirearmsList.tsx';
import { ApprovalQueue } from './components/ApprovalQueue.tsx';
import { SystemSettings } from './components/SystemSettings.tsx';
import { IdCardView } from './components/IdCardView.tsx';
import { CertificateView } from './components/CertificateView.tsx';
import { PublicVerificationView } from './components/PublicVerificationView.tsx';
import { ArrowLeft, IdCard, FileText, Printer, CheckCircle } from 'lucide-react';

type AppView = 
  | 'dashboard' 
  | 'newRegistration' 
  | 'records' 
  | 'approvals' 
  | 'settings' 
  | 'viewIdCard' 
  | 'viewCertificate' 
  | 'editRegistration';

const MainApp: React.FC = () => {
  const { user, records, branding } = useSystem();
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [activeRecord, setActiveRecord] = useState<FirearmRegistration | null>(null);
  const [verifyIdParam, setVerifyIdParam] = useState<string | null>(null);

  // Check URL query for public QR verification: ?verify=ቤጌፖ-ጦመ-0001
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verifyCode = params.get('verify');
    if (verifyCode) {
      setVerifyIdParam(verifyCode);
    }
  }, []);

  // When QR code is scanned: Isolated public verification view.
  // Strictly verifies authenticity and validity only; prevents entry into the main dashboard/system.
  if (verifyIdParam) {
    const targetRecord = records.find(
      r => r.idCardNumber.toLowerCase() === verifyIdParam.toLowerCase()
    ) || null;

    return (
      <PublicVerificationView
        registration={targetRecord}
        idNumber={verifyIdParam}
        branding={branding}
      />
    );
  }

  // If not authenticated, render Login Screen
  if (!user) {
    return <LoginForm />;
  }

  // Handlers
  const handleSelectRecord = (record: FirearmRegistration, targetView: 'idCard' | 'certificate') => {
    setActiveRecord(record);
    setCurrentView(targetView === 'idCard' ? 'viewIdCard' : 'viewCertificate');
  };

  const handleEditRecord = (record: FirearmRegistration) => {
    setActiveRecord(record);
    setCurrentView('editRegistration');
  };

  const handleRegistrationSuccess = (
    savedRecord: FirearmRegistration, 
    targetView: 'idCard' | 'certificate'
  ) => {
    setActiveRecord(savedRecord);
    setCurrentView(targetView === 'idCard' ? 'viewIdCard' : 'viewCertificate');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navbar */}
      <div className="no-print">
        <Navbar
          currentView={currentView}
          onNavigate={(view) => {
            setCurrentView(view);
            setActiveRecord(null);
          }}
        />
      </div>

      {/* Main Container */}
      <main className="flex-1 px-4 py-6 md:px-8 max-w-7xl mx-auto w-full">
        {/* VIEW 1: DASHBOARD */}
        {currentView === 'dashboard' && (
          <Dashboard
            onNavigateToRecord={handleSelectRecord}
            onNavigateToNew={() => setCurrentView('newRegistration')}
            onNavigateToApprovals={() => setCurrentView('approvals')}
          />
        )}

        {/* VIEW 2: NEW REGISTRATION */}
        {currentView === 'newRegistration' && (
          <RegistrationForm
            onSuccess={handleRegistrationSuccess}
            onCancel={() => setCurrentView('dashboard')}
          />
        )}

        {/* VIEW 3: EDIT EXISTING RECORD */}
        {currentView === 'editRegistration' && activeRecord && (
          <RegistrationForm
            initialData={activeRecord}
            onSuccess={handleRegistrationSuccess}
            onCancel={() => setCurrentView('records')}
          />
        )}

        {/* VIEW 4: MASTER RECORDS FILES */}
        {currentView === 'records' && (
          <FirearmsList
            onSelectRecord={handleSelectRecord}
            onEditRecord={handleEditRecord}
          />
        )}

        {/* VIEW 5: OFFICIAL APPROVAL QUEUE */}
        {currentView === 'approvals' && (
          <ApprovalQueue
            onViewRecord={handleSelectRecord}
          />
        )}

        {/* VIEW 6: SYSTEM ASSETS & BRANDING SETTINGS */}
        {currentView === 'settings' && (
          <SystemSettings />
        )}

        {/* VIEW 7: ATM-SIZED ID CARD (FRONT & BACK) */}
        {currentView === 'viewIdCard' && activeRecord && (
          <div className="space-y-6">
            <div className="no-print flex items-center justify-between border-b border-slate-800 pb-4">
              <button
                onClick={() => setCurrentView('records')}
                className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700 transition cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" /> ወደ ሰነዶች ዝርዝር ተመለስ
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentView('viewCertificate')}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-amber-400 hover:bg-slate-700 transition cursor-pointer"
                >
                  <FileText className="h-4 w-4" /> የA4 ሰርቲፊኬቱን እይ
                </button>
              </div>
            </div>

            <IdCardView
              registration={activeRecord}
              branding={branding}
              isApprover={user.role === 'OFFICIAL'}
              onEdit={() => setCurrentView('editRegistration')}
              showPrintActions={true}
            />
          </div>
        )}

        {/* VIEW 8: A4 REGISTRATION CERTIFICATE */}
        {currentView === 'viewCertificate' && activeRecord && (
          <div className="space-y-6">
            <div className="no-print flex items-center justify-between border-b border-slate-800 pb-4">
              <button
                onClick={() => setCurrentView('records')}
                className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700 transition cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" /> ወደ ሰነዶች ዝርዝር ተመለስ
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentView('viewIdCard')}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-amber-400 hover:bg-slate-700 transition cursor-pointer"
                >
                  <IdCard className="h-4 w-4" /> የኤቲኤም መታወቂያውን እይ
                </button>
              </div>
            </div>

            <CertificateView
              registration={activeRecord}
              branding={branding}
              onBack={() => setCurrentView('records')}
              showActions={true}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="no-print mt-auto border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <p>
          የቤኒሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን የጦር መሳሪያ ምዝገባ እና ማረጋገጫ ሲስተም
        </p>
        <p className="text-[10px] text-slate-600 mt-0.5">
          የተዘጋጀዉ በቤኒሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን ቴክኖሎጂ ማስፋፊያና መረጃ ማዕከል (D.I BY)
        </p>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <SystemProvider>
      <MainApp />
    </SystemProvider>
  );
}
