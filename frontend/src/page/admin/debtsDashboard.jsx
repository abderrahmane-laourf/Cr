import React, { useState, useEffect } from 'react';
import { 
  Briefcase, DollarSign, CheckCircle, AlertTriangle, 
  FileText, Clock, Filter, Eye, X, List, Wallet
} from 'lucide-react';

const DebtsDashboard = () => {
  // --- STATE ---
  const [debts, setDebts] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('All');
  const [debtType, setDebtType] = useState('All'); // 'Good', 'Service', 'Loan'
  
  // For Proof Modal
  const [showProofModal, setShowProofModal] = useState(false);
  const [selectedProof, setSelectedProof] = useState(null);

  // --- LOAD DATA ---
  useEffect(() => {
     // 1. Try to load from localStorage
     const savedDebts = localStorage.getItem('finance_debts_db');
     if (savedDebts) {
         setDebts(JSON.parse(savedDebts));
     } else {
         // Fallback or Empty
         setDebts([]);
     }

     // Set Date Range Defaults (Last 30 Days)
     const end = new Date();
     const start = new Date();
     start.setDate(start.getDate() - 30);
     setDateTo(end.toISOString().split('T')[0]);
     setDateFrom(start.toISOString().split('T')[0]);
  }, []);

  // --- FILTERING LOGIC ---
  const filteredDebts = debts.filter(d => {
      // 1. Date Filter (Check 'date' field)
      const dDate = d.date;
      const matchDate = (!dateFrom || dDate >= dateFrom) && (!dateTo || dDate <= dateTo);
      
      // 2. Supplier Filter
      const matchSupplier = selectedSupplier === 'All' || d.supplier === selectedSupplier;

      // 3. Type Filter
      const matchType = debtType === 'All' || d.type === debtType;

      return matchDate && matchSupplier && matchType;
  });

  // --- KPI CALCULATIONS ---
  // Debt Overview
  const totalDebt = filteredDebts.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
  const totalPaid = filteredDebts.filter(d => d.status === 'Payé').reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
  const totalRemaining = totalDebt - totalPaid;

  // Cheque Overview
  const cheques = filteredDebts.filter(d => (d.paymentMethod || '').toLowerCase().includes('chèque')); // Adjust based on your data structure
  const chequeCount = cheques.length;
  const chequeTotal = cheques.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
  
  const chequePaid = cheques.filter(d => d.status === 'Payé').reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
  const chequeCashedCount = cheques.filter(d => d.status === 'Payé').length;
  
  const chequePending = chequeTotal - chequePaid;
  const chequePendingCount = chequeCount - chequeCashedCount;

  // --- Aggregation by Supplier ---
  const supplierStats = {};
  filteredDebts.forEach(d => {
      if (!supplierStats[d.supplier]) {
          supplierStats[d.supplier] = {
              name: d.supplier,
              totalDebt: 0,
              paid: 0,
              remaining: 0,
              pendingCheques: 0,
              pendingChequeValue: 0
          };
      }
      const amount = parseFloat(d.amount) || 0;
      supplierStats[d.supplier].totalDebt += amount;
      
      if (d.status === 'Payé') {
          supplierStats[d.supplier].paid += amount;
      } else {
          supplierStats[d.supplier].remaining += amount;
      }

      if ((d.paymentMethod || '').toLowerCase().includes('chèque') && d.status !== 'Payé') {
          supplierStats[d.supplier].pendingCheques += 1;
          supplierStats[d.supplier].pendingChequeValue += amount;
      }
  });
  
  const supplierData = Object.values(supplierStats);

  // Determine Status Badge per Supplier
  const getSupplierStatus = (data) => {
      if (data.remaining === 0) return { label: 'Soldé (Cleared)', color: 'bg-emerald-100 text-emerald-700' };
      if (data.pendingCheques > 0) return { label: `Chèques en attente (${data.pendingCheques})`, color: 'bg-orange-100 text-orange-700' };
      return { label: 'Non Payé (Unpaid)', color: 'bg-red-100 text-red-700' };
  };

  // Unique Suppliers for Dropdown
  const uniqueSuppliers = [...new Set(debts.map(d => d.supplier))].filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 text-slate-800" dir="ltr">
      
      {/* 1. Header & Controls */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
           <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                 <Briefcase className="text-blue-600" size={32} />
                 Tableau de Bord Dettes & Chèques
              </h1>
              <p className="text-slate-500 font-medium mt-1 text-lg">
                 Suivi des comptes fournisseurs et cycle de vie des chèques
              </p>
           </div>
        </div>

        {/* Control Panel (Filters) */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
           <div className="flex flex-col gap-1.5">
               <label className="text-xs font-bold text-slate-500">De (Date)</label>
               <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl font-medium" />
           </div>
           <div className="flex flex-col gap-1.5">
               <label className="text-xs font-bold text-slate-500">À (Date)</label>
               <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl font-medium" />
           </div>
           <div className="flex flex-col gap-1.5">
               <label className="text-xs font-bold text-slate-500">Fournisseur</label>
               <select value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl font-medium">
                   <option value="All">Tous les Fournisseurs</option>
                   {uniqueSuppliers.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
           </div>
           <div className="flex flex-col gap-1.5">
               <label className="text-xs font-bold text-slate-500">Type de Dette</label>
               <select value={debtType} onChange={e => setDebtType(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl font-medium">
                   <option value="All">Tout</option>
                   <option value="Good">Marchandise</option>
                   <option value="Service">Service</option>
                   <option value="Loan">Prêt</option>
               </select>
           </div>
        </div>
      </div>

      {/* 2. Financial KPIs */}
      
      {/* Row 1: Debt Overview */}
      <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
         <Wallet className="text-blue-500" /> Résumé des Dettes
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <KpiCard 
            title="Total Dettes" 
            value={totalDebt} 
            icon={<DollarSign size={28}/>} 
            color="bg-gradient-to-br from-blue-500 to-blue-600" 
            bgColor="bg-blue-50" 
            textColor="text-blue-700" 
            borderColor="border-blue-100"
         />
         <KpiCard 
            title="Total Payé" 
            value={totalPaid} 
            icon={<CheckCircle size={28}/>} 
            color="bg-gradient-to-br from-emerald-500 to-emerald-600" 
            bgColor="bg-emerald-50" 
            textColor="text-emerald-700" 
            borderColor="border-emerald-100"
         />
         <KpiCard 
            title="Reste à Payer" 
            value={totalRemaining} 
            icon={<AlertTriangle size={28}/>} 
            color="bg-gradient-to-br from-red-500 to-red-600" 
            bgColor="bg-red-50" 
            textColor="text-red-700" 
            isDanger={totalRemaining > 0}
            borderColor="border-red-100"
         />
      </div>

      {/* Row 2: Cheque Overview */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-orange-600"></div>
        <h3 className="text-2xl font-extrabold text-slate-800 mb-6 flex items-center gap-3">
            <span className="p-2 bg-orange-100 rounded-lg text-orange-600"><FileText size={24} /></span>
            Résumé des Chèques
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KpiCard 
                title="Chèques Émis (Total)" 
                value={chequeTotal} 
                subValue={`${chequeCount} Chèques`}
                icon={<FileText size={24}/>} 
                color="bg-slate-700" 
                bgColor="bg-slate-100" 
                textColor="text-slate-700" 
                borderColor="border-slate-200"
            />
            <KpiCard 
                title="Chèques Encaissés" 
                value={chequePaid} 
                subValue={`${chequeCashedCount} Chèques`}
                icon={<CheckCircle size={24}/>} 
                color="bg-emerald-600" 
                bgColor="bg-emerald-50" 
                textColor="text-emerald-700" 
                borderColor="border-emerald-200"
            />
            <KpiCard 
                title="Chèques en Attente" 
                value={chequePending} 
                subValue={`${chequePendingCount} Chèques`}
                icon={<Clock size={24}/>} 
                color="bg-orange-500" 
                bgColor="bg-orange-50" 
                textColor="text-orange-700" 
                isWarning={chequePending > 0}
                borderColor="border-orange-200"
            />
        </div>
      </div>

      {/* 3. Supplier Aggregation Report */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 backdrop-blur-sm">
             <div>
                <h3 className="font-extrabold text-xl text-slate-900 ml-2">Détails par Fournisseur</h3>
                <p className="text-slate-500 text-sm mt-1">Vue consolidée des paiements</p>
             </div>
             <button className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 rounded-xl transition-all shadow-sm"><Filter size={20}/></button>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead className="bg-slate-50/80 text-slate-500 text-xs uppercase font-extrabold tracking-wider border-b border-slate-100">
                   <tr>
                      <th className="px-8 py-5">Fournisseur</th>
                      <th className="px-8 py-5">Total Dettes</th>
                      <th className="px-8 py-5">Payé</th>
                      <th className="px-8 py-5">Restant</th>
                      <th className="px-8 py-5 text-center">Chèques en Attente</th>
                      <th className="px-8 py-5 text-center">Statut</th>
                      <th className="px-8 py-5 text-center">Preuve</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {supplierData.length > 0 ? (
                       supplierData.map((s, idx) => {
                           const status = getSupplierStatus(s);
                           return (
                               <tr key={idx} className="hover:bg-blue-50/30 transition-colors duration-200 font-medium group">
                                   <td className="px-8 py-5 text-slate-900 font-bold text-base flex items-center gap-3">
                                       <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold border border-slate-200">
                                           {s.name.charAt(0)}
                                       </div>
                                       {s.name}
                                   </td>
                                   <td className="px-8 py-5 text-slate-600 font-bold">{s.totalDebt.toLocaleString()} <span className="text-xs font-normal text-slate-400">DH</span></td>
                                   <td className="px-8 py-5 text-emerald-600 font-bold">{s.paid.toLocaleString()} <span className="text-xs font-normal text-emerald-400">DH</span></td>
                                   <td className="px-8 py-5 text-red-600 font-bold">{s.remaining.toLocaleString()} <span className="text-xs font-normal text-red-400">DH</span></td>
                                   <td className="px-8 py-5 text-center align-middle">
                                       {s.pendingCheques > 0 ? (
                                           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-700 text-xs font-bold shadow-sm">
                                               <Clock size={14} className="animate-pulse" /> 
                                               <span>{s.pendingCheques}</span>
                                               <span className="opacity-60 text-[10px] border-r border-orange-200 pr-2 mr-1 h-3 flex items-center">{s.pendingChequeValue.toLocaleString()} DH</span>
                                           </div>
                                       ) : (
                                           <span className="text-slate-300">-</span>
                                       )}
                                   </td>
                                   <td className="px-8 py-5 text-center align-middle">
                                       <span className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-bold border ${status.color}`}>
                                           {status.label}
                                       </span>
                                   </td>
                                   <td className="px-8 py-5 text-center align-middle">
                                       <button 
                                           onClick={() => { setSelectedProof(s.name); setShowProofModal(true); }}
                                           className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100" title="Voir les documents"
                                        >
                                           <Eye size={20} />
                                       </button>
                                   </td>
                               </tr>
                           );
                       })
                   ) : (
                       <tr><td colSpan="7" className="p-12 text-center text-slate-400 font-medium">Aucune donnée disponible</td></tr>
                   )}
                </tbody>
             </table>
          </div>
      </div>

      {/* Proof Modal */}
      {showProofModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4" dir="ltr">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg animate-in zoom-in-95 duration-200 border border-slate-100">
                <div className="flex justify-between items-start mb-6 border-b border-slate-50 pb-4">
                    <div>
                        <h3 className="font-extrabold text-2xl text-slate-900">Documents</h3>
                        <p className="text-slate-500 text-sm mt-1">Fournisseur: <span className="font-semibold text-blue-600">{selectedProof}</span></p>
                    </div>
                    <button onClick={() => setShowProofModal(false)} className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors"><X size={20}/></button>
                </div>
                <div className="bg-slate-50 rounded-2xl h-64 flex items-center justify-center flex-col gap-3 border-2 border-dashed border-slate-200 hover:border-slate-300 transition-colors group cursor-pointer">
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                        <FileText size={32} className="text-slate-300 group-hover:text-blue-400 transition-colors" />
                    </div>
                    <p className="text-slate-400 font-medium text-sm">Aucun document joint pour ce fournisseur.</p>
                </div>
                <div className="mt-6 flex justify-end">
                    <button onClick={() => setShowProofModal(false)} className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20">Fermer</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}

// Sub-Component for Cards
function KpiCard({ title, value, subValue, icon, color, bgColor, textColor, isWarning, isDanger, borderColor = "border-slate-200" }) {
    return (
        <div className={`p-6 rounded-3xl shadow-sm border ${borderColor} flex items-center justify-between relative overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-white`}>
            {/* Decorative Gradients */}
            {isDanger && <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-transparent opacity-50" />}
            {isWarning && <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-transparent opacity-50" />}
            
            <div className="relative z-10">
                <p className="text-slate-500 text-xs font-extrabold uppercase tracking-wide mb-2 opacity-80">{title}</p>
                <div className="flex items-baseline gap-1">
                    <h3 className={`text-3xl font-black ${textColor} tracking-tight`}>{value.toLocaleString()}</h3>
                    <span className="text-sm font-semibold text-slate-400">DH</span>
                </div>
                {subValue && (
                    <div className="mt-2 inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-xs font-bold text-slate-600">{subValue}</span>
                    </div>
                )}
            </div>
            
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bgColor} ${textColor} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-inner relative z-10`}>
                {icon}
            </div>
        </div>
    );
}

export default DebtsDashboard;
