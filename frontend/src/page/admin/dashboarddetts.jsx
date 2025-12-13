import React, { useState, useEffect } from 'react';
import { 
  DollarSign, CheckCircle, Clock, AlertTriangle, FileText, 
  Briefcase, Filter, Eye, X, Wallet, Coins, List, Calendar, User, Search
} from 'lucide-react';

// ----------------------------------------------------------------------
// UI COMPONENTS (Inline for portability)
// ----------------------------------------------------------------------

const SpotlightCard = ({ children, className = "", theme = "light" }) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
      theme === 'dark' 
        ? 'bg-[#005461] border-slate-700 shadow-xl' 
        : 'bg-white border-slate-100 shadow-sm hover:shadow-md'
    } ${className}`}>
      <div className="relative z-10 p-6 h-full">
        {children}
      </div>
    </div>
  );
};

const Section = ({ title, icon: Icon, children }) => (
    <div className="space-y-4 animate-[fade-in_0.5s_ease-out]">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-[#018790]/10 rounded-lg text-[#018790]">
                {Icon ? <Icon size={24} /> : <FileText size={24} />}
            </div>
            <h2 className="text-xl font-bold text-slate-800">{title}</h2>
        </div>
        {children}
    </div>
);

const StatCard = ({ label, value, sub, color, icon: Icon, borderColor }) => (
    <SpotlightCard theme="light" className={`flex flex-col justify-between h-full border-l-4 ${borderColor}`}> 
        <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</span>
            {Icon && <Icon size={18} className="text-[#018790]" />}
        </div>
        <div>
            <div className={`text-2xl font-black ${color || 'text-slate-800'}`}>{value}</div>
            {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
        </div>
    </SpotlightCard>
);

// ----------------------------------------------------------------------
// LOGIC & MAIN COMPONENT
// ----------------------------------------------------------------------

// Add Tajawal Font (As per your logic request)
const fontStyle = document.createElement('style');
fontStyle.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
  body { font-family: 'Tajawal', sans-serif; }
`;
document.head.appendChild(fontStyle);

export default function FinanceDashboard() {
  // --- STATE (Logic Preserved) ---
  const [debts, setDebts] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('All');
  const [debtType, setDebtType] = useState('All'); // Goods, Service, Loan
  const [filterStatus, setFilterStatus] = useState('All');

  // Proof Modal
  const [showProofModal, setShowProofModal] = useState(false);
  const [selectedProof, setSelectedProof] = useState(null);

  // Load Data
  useEffect(() => {
    const saved = localStorage.getItem('finance_debts_db');
    if (saved) {
      setDebts(JSON.parse(saved));
    }
  }, []);

  // --- Filtering Logic (Preserved) ---
  const filteredDebts = debts.filter(d => {
    const matchDate = (!dateFrom || d.date >= dateFrom) && (!dateTo || d.date <= dateTo);
    const matchSupplier = selectedSupplier === 'All' || d.supplier === selectedSupplier;
    const matchType = debtType === 'All' || (d.type || 'Service') === debtType;
    const matchStatus = filterStatus === 'All' || 
                        (filterStatus === 'Paid' ? d.status === 'Payé' : d.status !== 'Payé');
    return matchDate && matchSupplier && matchType && matchStatus;
  });

  // --- KPI Calculations (Preserved) ---
  
  // 1. Debt Overview
  const totalDebt = filteredDebts.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
  const totalPaid = filteredDebts.filter(d => d.status === 'Payé').reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
  const totalRemaining = totalDebt - totalPaid;

  // 2. Cheque Overview
  const cheques = filteredDebts.filter(d => (d.paymentMethod || '').toLowerCase().includes('chèque'));
  const chequeTotal = cheques.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
  const chequePaid = cheques.filter(d => d.status === 'Payé').reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0); // Cashed
  const chequePending = chequeTotal - chequePaid; // Pending

  const chequeCount = cheques.length;
  const chequeCashedCount = cheques.filter(d => d.status === 'Payé').length;
  const chequePendingCount = chequeCount - chequeCashedCount;

  // --- Aggregation by Supplier (Preserved) ---
  const supplierStats = {};
  const activeSuppliersSet = new Set();

  filteredDebts.forEach(d => {
      activeSuppliersSet.add(d.supplier);

      if (!supplierStats[d.supplier]) {
          supplierStats[d.supplier] = {
              name: d.supplier,
              totalDebt: 0,
              paid: 0,
              remaining: 0,
              chequeTotal: 0,
              chequeTotalCount: 0,
              chequePaid: 0,
              chequePaidCount: 0,
              chequePending: 0,
              chequePendingCount: 0
          };
      }
      const amount = parseFloat(d.amount) || 0;
      supplierStats[d.supplier].totalDebt += amount;
      
      if (d.status === 'Payé') {
          supplierStats[d.supplier].paid += amount;
      } else {
          supplierStats[d.supplier].remaining += amount;
      }

      if ((d.paymentMethod || '').toLowerCase().includes('chèque')) {
          supplierStats[d.supplier].chequeTotal += amount;
          supplierStats[d.supplier].chequeTotalCount += 1;

          if (d.status === 'Payé') {
              supplierStats[d.supplier].chequePaid += amount;
              supplierStats[d.supplier].chequePaidCount += 1;
          } else {
              supplierStats[d.supplier].chequePending += amount;
              supplierStats[d.supplier].chequePendingCount += 1;
          }
      }
  });
  
  const supplierData = Object.values(supplierStats);
  const activeSuppliersCount = activeSuppliersSet.size;

  // Helpers
  const getSupplierStatus = (data) => {
      if (data.remaining === 0) return { label: 'Soldé', color: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20' };
      if (data.chequePendingCount > 0) return { label: 'Partiel', color: 'bg-orange-50 text-orange-700 ring-1 ring-orange-600/20' };
      return { label: 'Non Payé', color: 'bg-red-50 text-red-700 ring-1 ring-red-600/20' };
  };

  const uniqueSuppliers = [...new Set(debts.map(d => d.supplier))].filter(Boolean);
  const fmt = (n) => parseFloat(n).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const num = (n) => parseInt(n).toLocaleString('fr-FR');

  return (
    <div className="w-full min-h-screen bg-transparent p-6 space-y-8 animate-[fade-in_0.6s_ease-out]">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-transparent p-6 rounded-3xl border border-slate-100/50">
            <div>
                <h1 className="text-2xl font-extrabold text-[#018790] flex items-center gap-3">
                   <Briefcase size={28} />
                   Tableau de Bord Financier
                </h1>
                <p className="text-slate-500 mt-1">Suivi des Dettes Fournisseurs & Cycle de Vie des Chèques</p>
            </div>
            <div className="flex gap-3 mt-4 sm:mt-0">
                 {/* Logic Placeholder for Action Button if needed */}
            </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                {/* Date From */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Calendar size={12}/> Date Début</label>
                    <input 
                        type="date" 
                        value={dateFrom} 
                        onChange={e => setDateFrom(e.target.value)}
                        className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#018790]/20 text-sm font-semibold transition-all text-slate-600 w-full" 
                    />
                </div>
                {/* Date To */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Calendar size={12}/> Date Fin</label>
                    <input 
                        type="date" 
                        value={dateTo} 
                        onChange={e => setDateTo(e.target.value)}
                        className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#018790]/20 text-sm font-semibold transition-all text-slate-600 w-full" 
                    />
                </div>
                {/* Supplier */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><User size={12}/> Fournisseur</label>
                    <div className="relative">
                        <select 
                            value={selectedSupplier} 
                            onChange={e => setSelectedSupplier(e.target.value)}
                            className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#018790]/20 text-sm font-semibold text-slate-600 appearance-none cursor-pointer transition-all shadow-sm"
                        >
                            <option value="All">Tous les Fournisseurs</option>
                            {uniqueSuppliers.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                    </div>
                </div>
                {/* Filter Button (Visual only based on your logic usually auto-updating) */}
                <button className="px-4 py-2.5 bg-[#018790] text-white rounded-xl hover:bg-[#006a70] transition-colors font-bold shadow-lg shadow-teal-900/20 flex items-center justify-center gap-2">
                    <Filter size={18} />
                    <span>Filtrer</span>
                </button>
             </div>
        </div>

        {/* 1. DEBT SUMMARY */}
        <Section title="Résumé des Dettes" icon={Coins}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    label="Fournisseurs Actifs" 
                    value={activeSuppliersCount} 
                    sub="Dans la période"
                    borderColor="border-indigo-500"
                    icon={Briefcase}
                />
                <StatCard 
                    label="Total des Dettes" 
                    value={`${fmt(totalDebt)} DH`} 
                    sub={`${filteredDebts.length} Factures`}
                    borderColor="border-blue-500"
                    icon={DollarSign}
                />
                <StatCard 
                    label="Dettes Payées" 
                    value={`${fmt(totalPaid)} DH`}
                    sub="Réglées"
                    borderColor="border-emerald-500"
                    color="text-emerald-600"
                    icon={CheckCircle}
                />
                <StatCard 
                    label="Dettes Restantes" 
                    value={`${fmt(totalRemaining)} DH`}
                    sub="À Payer"
                    borderColor="border-red-500"
                    color="text-red-600"
                    icon={AlertTriangle}
                />
            </div>
        </Section>

        {/* 2. CHEQUE SUMMARY */}
        <Section title="Gestion des Chèques" icon={FileText}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <StatCard 
                     label="Total Chèques Émis" 
                     value={`${fmt(chequeTotal)} DH`} 
                     sub={`${chequeCount} Chèques`}
                     borderColor="border-purple-500"
                 />
                 <StatCard 
                     label="Chèques Encaissés (Cashed)" 
                     value={`${fmt(chequePaid)} DH`} 
                     sub={`${chequeCashedCount} Chèques`}
                     borderColor="border-emerald-500"
                     color="text-emerald-700"
                 />
                 <StatCard 
                     label="Chèques en Attente (Pending)" 
                     value={`${fmt(chequePending)} DH`} 
                     sub={`${chequePendingCount} Chèques`}
                     borderColor="border-orange-500"
                     color="text-orange-600"
                 />
            </div>
        </Section>

        {/* 3. DETAILED REPORT TABLE */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <div className="flex items-center gap-2">
                     <List size={20} className="text-[#018790]"/> 
                     <h3 className="font-bold text-lg text-slate-800">Rapport Détaillé par Fournisseur</h3>
                 </div>
             </div>
             
             <div className="overflow-x-auto">
                 <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                       <tr>
                          <th className="px-6 py-4 text-left">Fournisseur</th>
                          <th className="px-6 py-4 text-center">Total Dettes</th>
                          <th className="px-6 py-4 text-center text-emerald-600">Payé</th>
                          <th className="px-6 py-4 text-center text-red-600">Restant</th>
                          <th className="px-6 py-4 text-center bg-slate-50">Total Chèques</th>
                          <th className="px-6 py-4 text-center bg-emerald-50/50 text-emerald-700">Chq. Payés</th>
                          <th className="px-6 py-4 text-center bg-orange-50/50 text-orange-700">Chq. Attente</th>
                          <th className="px-6 py-4 text-center">Statut</th>
                          <th className="px-6 py-4 text-center">Action</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {supplierData.length > 0 ? (
                           supplierData.map((s, idx) => {
                               const status = getSupplierStatus(s);
                               return (
                                   <tr key={idx} className="hover:bg-slate-50 transition-colors font-medium">
                                       <td className="px-6 py-4 text-slate-800 font-bold">{s.name}</td>
                                       
                                       <td className="px-6 py-4 text-center font-mono text-slate-600">{fmt(s.totalDebt)}</td>
                                       <td className="px-6 py-4 text-center text-emerald-600 font-mono">{fmt(s.paid)}</td>
                                       <td className="px-6 py-4 text-center">
                                            <span className="font-mono font-bold text-red-600 bg-red-50 px-2 py-1 rounded">{fmt(s.remaining)}</span>
                                       </td>
                                       
                                       <td className="px-6 py-4 text-center text-slate-500 border-l border-slate-100">
                                           <div className="flex flex-col items-center">
                                               <span className="font-bold text-slate-700 font-mono">{fmt(s.chequeTotal)}</span>
                                               <span className="text-[10px] uppercase tracking-wide">{s.chequeTotalCount} chèques</span>
                                           </div>
                                       </td>
                                       <td className="px-6 py-4 text-center text-emerald-600 font-bold bg-emerald-50/10">
                                            <div className="flex flex-col items-center">
                                               <span className="font-mono">{fmt(s.chequePaid)}</span>
                                               <span className="text-[10px] font-normal uppercase">{s.chequePaidCount} chèques</span>
                                           </div>
                                       </td>
                                       <td className="px-6 py-4 text-center text-orange-600 font-bold bg-orange-50/10">
                                            <div className="flex flex-col items-center">
                                               <span className="font-mono">{fmt(s.chequePending)}</span>
                                               <span className="text-[10px] font-normal uppercase">{s.chequePendingCount} chèques</span>
                                           </div>
                                       </td>
                                       
                                       <td className="px-6 py-4 text-center">
                                           <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold shadow-sm ${status.color}`}>
                                               {status.label}
                                           </span>
                                       </td>
                                       <td className="px-6 py-4 text-center">
                                           <button 
                                               onClick={() => { setSelectedProof(s.name); setShowProofModal(true); }}
                                               className="p-2 text-slate-400 hover:text-[#018790] hover:bg-[#018790]/10 rounded-xl transition-colors"
                                               title="Voir Documents"
                                            >
                                               <Eye size={18} />
                                           </button>
                                       </td>
                                   </tr>
                               );
                           })
                       ) : (
                           <tr><td colSpan="9" className="p-12 text-center text-slate-400">Aucune donnée trouvée</td></tr>
                       )}
                    </tbody>
                 </table>
             </div>
        </div>

        {/* PROOF MODAL */}
        {showProofModal && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4 transition-opacity">
                <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg border border-slate-100 animate-[scale-in_0.2s_ease-out]">
                    <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                        <h3 className="font-extrabold text-xl text-slate-800">Documents : {selectedProof}</h3>
                        <button 
                            onClick={() => setShowProofModal(false)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        >
                            <X size={20}/>
                        </button>
                    </div>
                    
                    <div className="bg-slate-50 rounded-2xl h-48 flex items-center justify-center flex-col gap-3 border-2 border-dashed border-slate-200 group hover:border-[#018790]/30 transition-colors">
                        <div className="p-4 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                            <FileText size={32} className="text-slate-300 group-hover:text-[#018790]" />
                        </div>
                        <p className="text-slate-400 text-sm font-medium">Aucun document joint pour ce fournisseur.</p>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button 
                            onClick={() => setShowProofModal(false)}
                            className="px-5 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-colors"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        )}

    </div>
  );
}