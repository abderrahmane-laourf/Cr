import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { 
  Building, AlertTriangle, Search, 
  DollarSign, Archive, Wrench, Package, CheckCircle, Filter, X, Calendar
} from 'lucide-react';
import SpotlightCard from '../../util/SpotlightCard';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function AssetsDashboard() {
  const [assets, setAssets] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('assets_db');
    if (saved) {
      setAssets(JSON.parse(saved));
    }
  }, []);

  // Filter Logic
  const filteredAssets = assets.filter(asset => {
    const textMatch = (asset.name?.toLowerCase().includes(filterText.toLowerCase()) || 
                      asset.category?.toLowerCase().includes(filterText.toLowerCase()));
    
    const catMatch = filterCategory === 'All' || asset.category === filterCategory;
    
    const statusMatch = filterStatus === 'All' || 
                        (filterStatus === 'Damaged' ? asset.status === 'Endommagé' : 
                         filterStatus === 'Active' ? asset.status === 'Bon état' : true);
    
    let dateMatch = true;
    if (dateFrom && asset.date) dateMatch = dateMatch && asset.date >= dateFrom;
    if (dateTo && asset.date) dateMatch = dateMatch && asset.date <= dateTo;

    return textMatch && catMatch && statusMatch && dateMatch;
  });

  // KPI Calculations
  const stats = {
    totalValue: filteredAssets.reduce((sum, a) => sum + (parseFloat(a.value) || 0), 0),
    totalCount: filteredAssets.length,
    damagedCount: filteredAssets.filter(a => a.status === 'Endommagé').length,
    activeCount: filteredAssets.filter(a => a.status === 'Bon état').length
  };

  // Charts Data
  const categoryData = Object.entries(
    filteredAssets.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const statusData = [
    { name: 'Bon état', value: stats.activeCount },
    { name: 'Endommagé', value: stats.damagedCount },
    { name: 'En réparation', value: filteredAssets.filter(a => a.status === 'En réparation').length }
  ].filter(d => d.value > 0);

  return (
    <div className="w-full min-h-screen bg-transparent p-6 space-y-8 animate-[fade-in_0.6s_ease-out]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-transparent p-6 rounded-3xl border border-slate-100/50">
        <div>
          <h1 className="text-2xl font-extrabold text-[#2563EB]">Tableau de Bord des Actifs</h1>
          <p className="text-slate-500">Vue d'ensemble de votre inventaire et équipements</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Search */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Search size={12}/> Recherche</label>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2563EB]/50" size={18} />
                    <input 
                        type="text" 
                        placeholder="Nom, catégorie..." 
                        value={filterText} 
                        onChange={(e) => setFilterText(e.target.value)} 
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all" 
                    />
                </div>
            </div>
            
            {/* Category Filter */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Filter size={12}/> Catégorie</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
                >
                  <option value="All">Toutes les catégories</option>
                  <option value="Électronique">Électronique</option>
                  <option value="Mobilier">Mobilier</option>
                  <option value="Véhicule">Véhicule</option>
                  <option value="Autre">Autre</option>
                </select>
            </div>

            {/* Date Filter */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Calendar size={12}/> Date Début</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
                />
            </div>

            {/* Clear Filters */}
            {(filterText || filterCategory !== 'All' || dateFrom) && (
              <button
                onClick={() => {
                  setFilterText('');
                  setFilterCategory('All');
                  setDateFrom('');
                  setDateTo('');
                }}
                className="px-4 py-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 text-sm font-bold transition-all flex items-center justify-center gap-2 h-[42px]"
              >
                <X size={16} />
                Effacer
              </button>
            )}
         </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SpotlightCard theme="light" className="bg-white border-slate-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Valeur Totale</p>
              <h3 className="text-2xl font-black text-[#2563EB] mt-1">
                {stats.totalValue.toLocaleString()} DH
              </h3>
            </div>
            <div className="p-3 bg-[#2563EB]/10 rounded-xl">
              <DollarSign className="w-6 h-6 text-[#2563EB]" />
            </div>
          </div>
        </SpotlightCard>

        <SpotlightCard theme="light" className="bg-white border-slate-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Actifs</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">
                {stats.totalCount}
              </h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </SpotlightCard>

        <SpotlightCard theme="light" className="bg-white border-slate-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">En Bon État</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">
                {stats.activeCount}
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
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Endommagés</p>
              <h3 className="text-2xl font-black text-rose-600 mt-1">
                {stats.damagedCount}
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
        {/* Category Distribution */}
        <SpotlightCard theme="light" className="bg-white border-slate-100">
          <h3 className="text-lg font-bold text-[#1e3a8a] mb-6 flex items-center gap-2">
            <Building className="w-5 h-5" />
            Répartition par Catégorie
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
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
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SpotlightCard>

        {/* Status Distribution */}
        <SpotlightCard theme="light" className="bg-white border-slate-100">
          <h3 className="text-lg font-bold text-[#1e3a8a] mb-6 flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            État des Actifs
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
}
