import React, { useState, useEffect } from 'react';
import { 
  Briefcase, DollarSign, CheckCircle, AlertTriangle, 
  FileText, Clock, Filter, Eye, X, List, Wallet, Calendar, Search
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import SpotlightCard from '../../util/SpotlightCard';

const COLORS = ['#018790', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

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
  const totalDebt = filteredDebts.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
  const paidDebt = filteredDebts.filter(d => d.status === 'Payé').reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
  const pendingDebt = filteredDebts.filter(d => d.status === 'Pending').reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
  const overdueDebt = filteredDebts.filter(d => d.status === 'Overdue').reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);

  // --- CHART DATA ---
  const typeData = Object.entries(
    filteredDebts.reduce((acc, curr) => {
      acc[curr.type] = (acc[curr.type] || 0) + parseFloat(curr.amount || 0);
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const statusData = [
    { name: 'Payé', value: paidDebt },
    { name: 'En attente', value: pendingDebt },
    { name: 'En retard', value: overdueDebt }
  ].filter(d => d.value > 0);

  // Unique Suppliers for Filter
  const suppliers = [...new Set(debts.map(d => d.supplier))];

  return (
    <div className="w-full min-h-screen bg-transparent p-6 space-y-8 animate-[fade-in_0.6s_ease-out]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-transparent p-6 rounded-3xl border border-slate-100/50">
        <div>
          <h1 className="text-2xl font-extrabold text-[#018790]">Tableau de Bord des Dettes</h1>
          <p className="text-slate-500">Suivi des créances et paiements fournisseurs</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Date Range */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Calendar size={12}/> Du</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#018790]/10 focus:border-[#018790] transition-all"
                />
            </div>
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Calendar size={12}/> Au</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#018790]/10 focus:border-[#018790] transition-all"
                />
            </div>

            {/* Supplier Filter */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Filter size={12}/> Fournisseur</label>
                <select
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#018790]/10 focus:border-[#018790] transition-all"
                >
                  <option value="All">Tous les fournisseurs</option>
                  {suppliers.map((s, i) => <option key={i} value={s}>{s}</option>)}
                </select>
            </div>

            {/* Type Filter */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Filter size={12}/> Type</label>
                <select
                  value={debtType}
                  onChange={(e) => setDebtType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#018790]/10 focus:border-[#018790] transition-all"
                >
                  <option value="All">Tous les types</option>
                  <option value="Good">Marchandises</option>
                  <option value="Service">Services</option>
                  <option value="Loan">Prêts</option>
                </select>
            </div>
         </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SpotlightCard theme="light" className="bg-white border-slate-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Dettes</p>
              <h3 className="text-2xl font-black text-[#018790] mt-1">
                {totalDebt.toLocaleString()} DH
              </h3>
            </div>
            <div className="p-3 bg-[#018790]/10 rounded-xl">
              <Wallet className="w-6 h-6 text-[#018790]" />
            </div>
          </div>
        </SpotlightCard>

        <SpotlightCard theme="light" className="bg-white border-slate-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Payé</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">
                {paidDebt.toLocaleString()} DH
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </SpotlightCard>

        <SpotlightCard theme="light" className="bg-white border-slate-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">En Attente</p>
              <h3 className="text-2xl font-black text-amber-500 mt-1">
                {pendingDebt.toLocaleString()} DH
              </h3>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl">
              <Clock className="w-6 h-6 text-amber-500" />
            </div>
          </div>
        </SpotlightCard>

        <SpotlightCard theme="light" className="bg-white border-slate-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">En Retard</p>
              <h3 className="text-2xl font-black text-rose-600 mt-1">
                {overdueDebt.toLocaleString()} DH
              </h3>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-rose-600" />
            </div>
          </div>
        </SpotlightCard>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Type Distribution */}
        <SpotlightCard theme="light" className="bg-white border-slate-100">
          <h3 className="text-lg font-bold text-[#005461] mb-6 flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Répartition par Type
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                  }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SpotlightCard>

        {/* Status Distribution */}
        <SpotlightCard theme="light" className="bg-white border-slate-100">
          <h3 className="text-lg font-bold text-[#005461] mb-6 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            État des Paiements
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                  }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SpotlightCard>
      </div>
    </div>
  );
};

export default DebtsDashboard;
