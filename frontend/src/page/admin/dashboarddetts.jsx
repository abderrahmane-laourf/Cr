import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  DollarSign, CheckCircle, Clock, AlertTriangle, FileText, 
  Briefcase, TrendingDown, TrendingUp, Search, Filter, Eye, X
} from 'lucide-react';

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6'];

// Add Tajawal Font
const fontStyle = document.createElement('style');
fontStyle.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
  body { font-family: 'Tajawal', sans-serif; }
`;
document.head.appendChild(fontStyle);

export default function FinanceDashboard() {
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

  // --- Filtering Logic ---
  const filteredDebts = debts.filter(d => {
    const matchDate = (!dateFrom || d.date >= dateFrom) && (!dateTo || d.date <= dateTo);
    const matchSupplier = selectedSupplier === 'All' || d.supplier === selectedSupplier;
    const matchType = debtType === 'All' || (d.type || 'Service') === debtType;
    const matchStatus = filterStatus === 'All' || 
                        (filterStatus === 'Paid' ? d.status === 'Payé' : d.status !== 'Payé');
    return matchDate && matchSupplier && matchType && matchStatus;
  });

  // --- KPI Calculations ---
  
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

// --- Aggregation by Supplier ---
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

  // Determine Status Badge per Supplier
  const getSupplierStatus = (data) => {
      if (data.remaining === 0) return { label: 'Soldé', color: 'bg-emerald-100 text-emerald-700' };
      if (data.chequePendingCount > 0) return { label: 'Partiel', color: 'bg-orange-100 text-orange-700' };
      return { label: 'Non Payé', color: 'bg-red-100 text-red-700' };
  };

  // Unique Suppliers for Dropdown
  const uniqueSuppliers = [...new Set(debts.map(d => d.supplier))].filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 text-slate-800 font-sans" dir="ltr">
      
      {/* 1. Header & Controls */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
           <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                 <Briefcase className="text-blue-600" size={28} />
                 Tableau de Bord Financier
              </h1>
              <p className="text-slate-600 font-medium mt-1">
                 Suivi des Dettes Fournisseurs & Cycle de Vie des Chèques
              </p>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 w-full md:w-auto">
               <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-blue-500" />
               <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-blue-500" />
               <select value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-blue-500">
                   <option value="All">Tous Fournisseurs</option>
                   {uniqueSuppliers.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
               <button className="flex items-center justify-center gap-2 p-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors">
                   <Filter size={16} /> Filtrer
               </button>
           </div>
        </div>
      </div>

      {/* 2. Debt Summary Section */}
      <SectionTitle icon={<Coins className="text-blue-600" />} title="Résumé des Dettes" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
         <StatsCard 
            title="Fournisseurs Actifs" 
            value={activeSuppliersCount} 
            unit="" 
            subText="Dans la période"
            borderColor="border-indigo-500"
         />
         <StatsCard 
            title="Total des Dettes" 
            value={totalDebt} 
            unit="DH" 
            subText={`${filteredDebts.length} Factures`}
            borderColor="border-blue-500"
         />
         <StatsCard 
            title="Dettes Payées" 
            value={totalPaid} 
            unit="DH" 
            subText="Réglées"
            borderColor="border-emerald-500"
            textColor="text-emerald-700"
         />
         <StatsCard 
            title="Dettes Restantes" 
            value={totalRemaining}  
            unit="DH" 
            subText="À Payer"
            borderColor="border-red-500"
            textColor="text-red-600"
         />
      </div>

      {/* 3. Cheque Summary Section */}
      <SectionTitle icon={<FileText className="text-purple-600" />} title="Résumé des Chèques" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <StatsCard 
             title="Total Chèques Émis" 
             value={chequeTotal} 
             unit="DH"
             subText={`${chequeCount} Chèques`}
             borderColor="border-purple-500"
         />
         <StatsCard 
             title="Chèques Encaissés (Cashed)" 
             value={chequePaid} 
             unit="DH"
             subText={`${chequeCashedCount} Chèques`}
             borderColor="border-teal-500"
             textColor="text-teal-700"
         />
         <StatsCard 
             title="Chèques en Attente (Pending)" 
             value={chequePending} 
             unit="DH"
             subText={`${chequePendingCount} Chèques`}
             borderColor="border-orange-500"
             textColor="text-orange-600"
         />
      </div>

      {/* 4. Detailed Report Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
             <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                 <List size={20} className="text-slate-400"/> Rapport Détaillé par Fournisseur
             </h3>
             <button className="text-blue-600 hover:text-blue-800 text-sm font-bold">Exporter CSV</button>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                   <tr>
                      <th className="px-6 py-4">Fournisseur</th>
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
                               <tr key={idx} className="hover:bg-blue-50/30 transition-colors font-medium text-sm">
                                   <td className="px-6 py-4 text-slate-900 font-bold">{s.name}</td>
                                   
                                   <td className="px-6 py-4 text-center">{formatMoney(s.totalDebt)}</td>
                                   <td className="px-6 py-4 text-center text-emerald-600">{formatMoney(s.paid)}</td>
                                   <td className="px-6 py-4 text-center text-red-600 font-bold bg-red-50/30 rounded-lg">{formatMoney(s.remaining)}</td>
                                   
                                   <td className="px-6 py-4 text-center text-slate-500 border-l border-slate-100">
                                       <div className="flex flex-col">
                                           <span className="font-bold text-slate-700">{formatMoney(s.chequeTotal)}</span>
                                           <span className="text-[10px]">{s.chequeTotalCount} chèques</span>
                                       </div>
                                   </td>
                                   <td className="px-6 py-4 text-center text-emerald-600 font-bold bg-emerald-50/10">
                                        <div className="flex flex-col">
                                           <span>{formatMoney(s.chequePaid)}</span>
                                           <span className="text-[10px] font-normal">{s.chequePaidCount} chèques</span>
                                       </div>
                                   </td>
                                   <td className="px-6 py-4 text-center text-orange-600 font-bold bg-orange-50/10">
                                        <div className="flex flex-col">
                                           <span>{formatMoney(s.chequePending)}</span>
                                           <span className="text-[10px] font-normal">{s.chequePendingCount} chèques</span>
                                       </div>
                                   </td>
                                   
                                   <td className="px-6 py-4 text-center">
                                       <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-bold ${status.color}`}>
                                           {status.label}
                                       </span>
                                   </td>
                                   <td className="px-6 py-4 text-center">
                                       <button 
                                           onClick={() => { setSelectedProof(s.name); setShowProofModal(true); }}
                                           className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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

      {/* Proof Modal */}
      {showProofModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Documents: {selectedProof}</h3>
                    <button onClick={() => setShowProofModal(false)}><X size={20}/></button>
                </div>
                <div className="bg-slate-50 rounded-xl h-48 flex items-center justify-center flex-col gap-2 border-2 border-dashed border-slate-200">
                    <FileText size={32} className="text-slate-300" />
                    <p className="text-slate-400 text-sm">Aucun document joint pour ce fournisseur.</p>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}

// Helper Components
const SectionTitle = ({ icon, title }) => (
    <div className="flex items-center gap-2 mb-4 px-1">
        <div className="p-1.5 bg-white rounded-lg shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100">{icon}</div>
        <h3 className="font-bold text-lg text-slate-800">{title}</h3>
    </div>
);

const StatsCard = ({ title, value, unit, subText, borderColor, textColor = "text-slate-800" }) => (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border-l-4 ${borderColor} border-y border-r border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow`}>
        <div className="flex justify-between items-start mb-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</h4>
            <div className={`w-2 h-2 rounded-full ${borderColor.replace('border-', 'bg-')}`}></div>
        </div>
        <div>
            <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-extrabold ${textColor}`}>{typeof value === 'number' ? value.toLocaleString() : value}</span>
                <span className="text-xs font-bold text-slate-400">{unit}</span>
            </div>
            {subText && <p className="text-xs font-medium text-slate-400 mt-1">{subText}</p>}
        </div>
    </div>
);

const formatMoney = (amount) => {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
