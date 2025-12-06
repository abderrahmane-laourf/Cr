import React, { useState } from 'react';
import { 
  LayoutDashboard, Building, AlertTriangle, CheckCircle, 
  Calendar, Filter, TrendingUp, Archive
} from 'lucide-react';

const AssetsDashboard = () => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [category, setCategory] = useState('All');

  // Mock Stats
  const stats = {
      total: 124,
      new: 15,
      damaged: 4,
      value: 450000
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-8 font-sans text-slate-800">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard Actifs</h1>
        <p className="text-slate-500 mt-1 font-medium">Vue d'ensemble de l'état du patrimoine.</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
        <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Filter size={16} className="text-blue-500" /> Filtres
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Catégorie</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full pl-4 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                >
                    <option value="All">Toutes les catégories</option>
                    <option value="Mobilier">Mobilier</option>
                    <option value="Informatique">Informatique</option>
                    <option value="Véhicules">Véhicules</option>
                    <option value="Machines">Machines</option>
                </select>
            </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Total Assets (French/Arabic mixed as requested contextually) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between group hover:border-blue-300 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                    <Building size={24} />
                </div>
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">+12%</span>
            </div>
            <div>
                <h3 className="text-slate-500 font-bold text-sm uppercase tracking-wider mb-1">Nombre d'éléments (عدد العناصر)</h3>
                <p className="text-3xl font-black text-slate-900">{stats.total}</p>
            </div>
        </div>

        {/* New Assets */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between group hover:border-emerald-300 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                    <CheckCircle size={24} />
                </div>
                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full">+5 this month</span>
            </div>
            <div>
                <h3 className="text-slate-500 font-bold text-sm uppercase tracking-wider mb-1">Nouvelles Acquisitions (جديدة)</h3>
                <p className="text-3xl font-black text-slate-900">{stats.new}</p>
            </div>
        </div>

        {/* Damaged Assets */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between group hover:border-red-300 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                    <AlertTriangle size={24} />
                </div>
                <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">Action Requise</span>
            </div>
            <div>
                <h3 className="text-slate-500 font-bold text-sm uppercase tracking-wider mb-1">Actifs Endommagés (متضررة)</h3>
                <p className="text-3xl font-black text-slate-900">{stats.damaged}</p>
            </div>
        </div>

      </div>

      {/* Additional value summary */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-4 mb-2">
            <Archive className="text-slate-400" />
            <h3 className="font-bold text-lg opacity-90">Valeur Totale du Parc</h3>
        </div>
        <p className="text-5xl font-black tracking-tight">{stats.value.toLocaleString()} <span className="text-2xl font-medium text-slate-400">MAD</span></p>
      </div>

    </div>
  );
};

export default AssetsDashboard;
