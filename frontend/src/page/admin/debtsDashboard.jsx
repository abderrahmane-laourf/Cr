import React, { useState } from 'react';
import { 
  BarChart, PieChart, TrendingUp, Filter, Calendar, 
  DollarSign, AlertCircle, CheckCircle, Clock 
} from 'lucide-react';

const DebtsDashboard = () => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [supplier, setSupplier] = useState('All');
  const [status, setStatus] = useState('All');

  // Mock Stats
  const stats = {
      count: 24,
      totalAmount: 185000,
      openAmount: 42000,
      dueSoon: 3 // Count of debts due in <= 3 days
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-8 font-sans text-slate-800">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tableau de Bord Dettes</h1>
        <p className="text-slate-500 mt-1 font-medium">Vue d'ensemble des créances et flux de trésorerie.</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
        <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Filter size={16} className="text-blue-500" /> Filtres
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="group">
                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Date De</label>
                <input 
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full pl-4 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                />
            </div>
            <div className="group">
                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Date Jusqu'à</label>
                <input 
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full pl-4 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                />
            </div>
            <div className="group">
                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Fournisseur</label>
                <select 
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full pl-4 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                >
                    <option value="All">Tous les fournisseurs</option>
                    <option value="Global Info">Global Info</option>
                    <option value="Bricoma">Bricoma</option>
                </select>
            </div>
            <div className="group">
                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Statut</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full pl-4 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                >
                    <option value="All">Tous les statuts</option>
                    <option value="Open">Ouvert</option>
                    <option value="Paid">Fermé / Payé</option>
                </select>
            </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        
        {/* Count */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:border-blue-300 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                    <TrendingUp size={24} />
                </div>
            </div>
            <div>
                <h3 className="text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1">Nombre de Dettes (عدد الديون)</h3>
                <p className="text-3xl font-black text-slate-900">{stats.count}</p>
            </div>
        </div>

        {/* Total Amount */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:border-purple-300 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                    <DollarSign size={24} />
                </div>
            </div>
            <div>
                <h3 className="text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1">Total Global (المجموع الإجمالي)</h3>
                <p className="text-2xl font-black text-slate-900">{stats.totalAmount.toLocaleString()} <span className="text-sm text-slate-400">MAD</span></p>
            </div>
        </div>

        {/* Open Amount */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:border-emerald-300 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                    <CheckCircle size={24} />
                </div>
            </div>
            <div>
                <h3 className="text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1">Restant à payer (المجموع المفتوح)</h3>
                <p className="text-2xl font-black text-slate-900">{stats.openAmount.toLocaleString()} <span className="text-sm text-slate-400">MAD</span></p>
            </div>
        </div>

        {/* Due Soon */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between border-l-4 border-l-orange-500 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                    <Clock size={24} />
                </div>
                <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full animate-pulse">Urgent</span>
            </div>
            <div>
                <h3 className="text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1">Proche Échéance (3j) (مستحق قريبًا)</h3>
                <p className="text-3xl font-black text-slate-900">{stats.dueSoon}</p>
            </div>
        </div>

      </div>

    </div>
  );
};

export default DebtsDashboard;
