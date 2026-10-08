import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext.tsx';
import { FirearmRegistration } from '../types/index.ts';
import { 
  Search, 
  Filter, 
  IdCard, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  Printer, 
  Eye, 
  Lock, 
  RefreshCw,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

interface FirearmsListProps {
  onSelectRecord: (record: FirearmRegistration, targetView: 'idCard' | 'certificate') => void;
  onEditRecord: (record: FirearmRegistration) => void;
}

export const FirearmsList: React.FC<FirearmsListProps> = ({
  onSelectRecord,
  onEditRecord,
}) => {
  const { records, deleteRegistration, renewRegistration, user } = useSystem();
  const [activeTab, setActiveTab] = useState<'all' | 'idCards' | 'certificates' | 'expired'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterOwnership, setFilterOwnership] = useState('all');

  const today = new Date();

  // Filtered list
  const filteredRecords = records.filter((r) => {
    // Search match
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      r.fullName.toLowerCase().includes(term) ||
      r.idCardNumber.toLowerCase().includes(term) ||
      r.serialNumber.toLowerCase().includes(term) ||
      r.woreda.toLowerCase().includes(term) ||
      r.firearmType.toLowerCase().includes(term);

    if (!matchesSearch) return false;

    // Filter by type
    if (filterType !== 'all' && !r.firearmType.includes(filterType)) return false;

    // Filter by ownership
    if (filterOwnership !== 'all' && r.ownership !== filterOwnership) return false;

    // Tab filter
    if (activeTab === 'expired') {
      return new Date(r.expiryDate) < today;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-black text-white font-serif tracking-wide">
            የተመዘገቡ ሰዎችና ሰነዶች ማህደር (Firearms Registry Files)
          </h2>
          <p className="text-xs text-slate-400">
            አንድ የተዋሀደ ፋይል፤ የመታወቂያ ካርዶች እና የሰርቲፊኬቶች ይፋዊ መዝገብ
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="በስም፣ በመታወቂያ ቁጥር፣ በንምራ..."
            className="w-full rounded-xl border border-slate-700 bg-slate-900/90 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Tabs & Secondary Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
              activeTab === 'all'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ጠቅላላ ማህደር ({records.length})
          </button>
          <button
            onClick={() => setActiveTab('idCards')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
              activeTab === 'idCards'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <IdCard className="h-3.5 w-3.5" />
            የመታወቂያ ካርዶች ለብቻ
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
              activeTab === 'certificates'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            የምስክር ወረቀቶች ለብቻ
          </button>
          <button
            onClick={() => setActiveTab('expired')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
              activeTab === 'expired'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-rose-400'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            ቀነ-ገደብ ያለፈባቸው ({records.filter(r => new Date(r.expiryDate) < today).length})
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300"
          >
            <option value="all">ሁሉም የመሳሪያ አይነቶች</option>
            <option value="ክላሽንኮቭ">ክላሽንኮቭ (AK-47)</option>
            <option value="ሽጉጥ">ሽጉጥ (Pistol)</option>
            <option value="ስናይፐር">ስናይፐር</option>
          </select>

          <select
            value={filterOwnership}
            onChange={(e) => setFilterOwnership(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300"
          >
            <option value="all">ሁሉም ንብረትነት</option>
            <option value="የግል">የግል ንብረት</option>
            <option value="የመንግስት">የመንግስት ንብረት</option>
          </select>
        </div>
      </div>

      {/* Main Records Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 shadow-2xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 uppercase font-semibold">
                <th className="py-3.5 px-4">ፎቶ</th>
                <th className="py-3.5 px-4">የመታወቂያ ቁጥር / ሰርቲፊኬት</th>
                <th className="py-3.5 px-4">ሙሉ ስም እና አድራሻ</th>
                <th className="py-3.5 px-4">የመሳሪያ ዝርዝር</th>
                <th className="py-3.5 px-4">ጥይት / ካርታ</th>
                <th className="py-3.5 px-4">የሚያበቃበት ቀን</th>
                <th className="py-3.5 px-4">ሁኔታ (Status)</th>
                <th className="py-3.5 px-4 text-right">ሰነዶች እና እርምጃዎች</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    ምንም የተመዘገበ ሰነድ አልተገኘም፡፡
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => {
                  const isExpired = new Date(r.expiryDate) < today;
                  const isApproved = r.status === 'የጸደቀ';

                  return (
                    <tr key={r.id} className="transition hover:bg-slate-800/40">
                      {/* Photo Thumbnail */}
                      <td className="py-3 px-4">
                        <div className="h-11 w-9 overflow-hidden rounded-md border border-amber-500/60 bg-slate-950">
                          <img
                            src={r.photoUrl}
                            alt={r.fullName}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </td>

                      {/* ID & Cert Number */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-amber-400">{r.idCardNumber}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{r.certNumber}</div>
                      </td>

                      {/* Full Name & Address */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-white text-sm">{r.fullName}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                          {r.woreda}፣ {r.kebele} ({r.occupation})
                        </div>
                      </td>

                      {/* Firearm Specs */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">{r.firearmType}</div>
                        <div className="font-mono text-[10px] text-slate-400">
                          ንምራ፡ <span className="text-white">{r.serialNumber}</span> ({r.ownership})
                        </div>
                      </td>

                      {/* Bullets & Magazines */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-emerald-400">{r.bulletCount} ጥይቶች</div>
                        <div className="text-[10px] text-slate-400">{r.magazineCount} ካርታ</div>
                      </td>

                      {/* Expiry Date */}
                      <td className="py-3 px-4">
                        <div className={`font-semibold ${isExpired ? 'text-rose-400 font-bold' : 'text-slate-300'}`}>
                          {r.expiryDate}
                        </div>
                        {isExpired && (
                          <span className="text-[9.5px] font-bold text-rose-500">
                            (ጊዜው ያለፈበት / የታገደ)
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          !isApproved
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : isExpired
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}>
                          {!isApproved ? (
                            <>
                              <Clock className="h-3 w-3" /> በሂደት ላይ
                            </>
                          ) : isExpired ? (
                            <>
                              <AlertTriangle className="h-3 w-3" /> የታገደ
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-3 w-3" /> የጸደቀ
                            </>
                          )}
                        </span>
                      </td>

                      {/* Document Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Official direct approve if pending */}
                          {user?.role === 'OFFICIAL' && !isApproved && (
                            <button
                              onClick={() => {
                                onSelectRecord(r, 'idCard');
                              }}
                              className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-500 shadow cursor-pointer"
                            >
                              አጽድቅ
                            </button>
                          )}

                          {/* View ATM ID Card */}
                          <button
                            onClick={() => onSelectRecord(r, 'idCard')}
                            title={isApproved ? "የኤቲኤም ሳይዝ መታወቂያውን እይ / ፕሪንት አድርግ" : "መታወቂያውን እይ (በሃላፊው እስኪጸድቅ ፕሪንት አይደረግም)"}
                            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition border ${
                              isApproved 
                                ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border-amber-500/40'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            <IdCard className="h-3.5 w-3.5" /> 
                            <span>መታወቂያ</span>
                            {!isApproved && <Lock className="h-3 w-3 text-amber-400" />}
                          </button>

                          {/* View A4 Certificate */}
                          <button
                            onClick={() => onSelectRecord(r, 'certificate')}
                            title={isApproved ? "የA4 ምስክር ወረቀቱን እይ / ፕሪንት አድርግ" : "ሰርቲፊኬቱን እይ (በሃላፊው እስኪጸድቅ ፕሪንት አይደረግም)"}
                            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition border ${
                              isApproved
                                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
                                : 'bg-slate-900 text-slate-500 border-slate-800'
                            }`}
                          >
                            <FileText className="h-3.5 w-3.5" /> 
                            <span>ሰርቲፊኬት</span>
                            {!isApproved && <Lock className="h-3 w-3 text-amber-400" />}
                          </button>

                          {/* Edit (allowed for Admin / when expired or specs change) */}
                          <button
                            onClick={() => onEditRecord(r)}
                            title="መረጃ አሻሽል / Edit"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>

                          {/* Renew permit if expired */}
                          {isExpired && (
                            <button
                              onClick={() => renewRegistration(r.id)}
                              title="ፈቃድ አድስ (1 አመት ጨምር)"
                              className="rounded-lg p-1.5 text-emerald-400 hover:bg-slate-800 hover:text-emerald-300"
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {/* Delete (Admin only) */}
                          {user?.role === 'ADMIN' && (
                            <button
                              onClick={() => {
                                if (confirm(`የ${r.fullName} ሰነድ በእርግጥ ይሰረዝ?`)) {
                                  deleteRegistration(r.id);
                                }
                              }}
                              title="ሰርዝ"
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-950/40 hover:text-rose-400"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
