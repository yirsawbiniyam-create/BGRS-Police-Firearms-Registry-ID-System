import React from 'react';
import { useSystem } from '../context/SystemContext.tsx';
import { 
  Shield, 
  Crosshair, 
  FileText, 
  CheckCircle, 
  Settings, 
  LogOut, 
  User, 
  Clock, 
  BarChart2, 
  Menu, 
  X,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: 'dashboard' | 'newRegistration' | 'records' | 'approvals' | 'settings') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { user, logout, branding, records } = useSystem();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const pendingCount = records.filter(r => r.status === 'በሂደት ላይ').length;
  const isOfficial = user?.role === 'OFFICIAL';

  // The Official (ሀላፊ / አጽዳቂ) does NOT register new weapons; only inspects and approves completed files!
  const navItems = isOfficial
    ? [
        { id: 'dashboard', label: 'ዳሽቦርድ', icon: BarChart2 },
        { id: 'approvals', label: 'የማጽደቂያ መድረክ (መቆጣጠሪያ)', icon: CheckCircle, badge: pendingCount },
        { id: 'records', label: 'የተመዘገቡ ማህደሮች', icon: FileText },
        { id: 'settings', label: 'አርማዎችና ቅንብር', icon: Settings },
      ]
    : [
        { id: 'dashboard', label: 'ዳሽቦርድ', icon: BarChart2 },
        { id: 'newRegistration', label: '+ አዲስ ምዝገባ', icon: Crosshair },
        { id: 'records', label: 'የተመዘገቡ ማህደሮች', icon: FileText },
        { id: 'approvals', label: 'የማጽደቂያ ሁኔታ', icon: CheckCircle, badge: pendingCount },
        { id: 'settings', label: 'አርማዎችና ሩልስ', icon: Settings },
      ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Brand & Emblem Logo */}
        <div 
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="h-11 w-11 transition group-hover:scale-105 drop-shadow">
            <img
              src={branding.policeLogo}
              alt="Police Crest"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black text-amber-400 font-serif tracking-wide leading-tight group-hover:text-amber-300">
              {branding.commissionNameAm}
            </span>
            <span className="text-[10px] font-semibold text-slate-300 leading-tight">
              የጦር መሳሪያ ምዝገባ እና ማረጋገጫ ሲስተም
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as any)}
                className={`relative flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`ml-1 rounded-full px-1.5 py-0.2 text-[9px] font-black ${
                    isActive ? 'bg-slate-950 text-amber-400' : 'bg-amber-500 text-slate-950 animate-pulse'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Role Badge & Logout */}
        <div className="hidden md:flex items-center gap-3">
          {/* Firestore Cloud Sync Badge */}
          <div 
            title="Firebase Project: fregistry-id-system"
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/60 py-1.5 px-2.5 text-[10px] font-mono text-slate-300"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            <span>fregistry-id-system</span>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 py-1.5 px-3">
            <div className={`h-2 w-2 rounded-full ${isOfficial ? 'bg-emerald-400' : 'bg-amber-400'} animate-ping`}></div>
            <div className="flex flex-col text-right">
              <span className="text-[11px] font-extrabold text-white leading-tight">
                {user?.fullName}
              </span>
              <span className="text-[9px] font-mono text-amber-300/80 leading-tight">
                {isOfficial ? 'የስራ ሂደት ሃላፊ (admin2026)' : 'መዝጋቢ አድሚን (admin)'}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            title="ውጣ (Logout)"
            className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 p-2 text-xs font-semibold text-slate-400 hover:bg-rose-950/40 hover:text-rose-400 transition cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-400 md:hidden"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-800 bg-slate-950 p-4 md:hidden space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id as any);
                  setMobileMenuOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl p-3 text-xs font-bold ${
                  isActive ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-slate-950">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
            <span className="text-xs text-slate-400">{user?.fullName}</span>
            <button
              onClick={logout}
              className="flex items-center gap-1 text-xs text-rose-400 font-bold"
            >
              <LogOut className="h-3.5 w-3.5" /> ውጣ
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
