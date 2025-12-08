import React, { useState, useEffect } from 'react';
import { 
  DollarSign, ShoppingCart, Target, Calendar, 
  TrendingUp, Megaphone, Package, User, Settings
} from 'lucide-react';

// API Configuration
const API_URL = 'http://localhost:3000';

export default function AdsDashboard() {
  const [ads, setAds] = useState([]);
  const [products, setProducts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [targetCPO, setTargetCPO] = useState(20);
  
  // Filters
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    project: 'All',
    productId: 'All',
    employeeId: 'All',
    minOrders: '',
    maxOrders: ''
  });

  useEffect(() => {
    loadData();
    loadSettings();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [adsRes, productsRes, employeesRes] = await Promise.all([
        fetch(`${API_URL}/ads`).catch(() => ({ ok: false, json: async () => [] })),
        fetch(`${API_URL}/products`),
        fetch(`${API_URL}/employees`)
      ]);

      if (adsRes.ok) setAds(await adsRes.json());
      if (productsRes.ok) setProducts(await productsRes.json());
      if (employeesRes.ok) setEmployees(await employeesRes.json());
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = () => {
    const saved = localStorage.getItem('adsSettings');
    if (saved) {
      const settings = JSON.parse(saved);
      setTargetCPO(settings.targetCPO || 20);
    }
  };

  // Apply filters
  const filteredAds = ads.filter(ad => {
    const adDate = new Date(ad.date);
    const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : null;
    const dateTo = filters.dateTo ? new Date(filters.dateTo) : null;
    
    if (dateFrom && adDate < dateFrom) return false;
    if (dateTo && adDate > dateTo) return false;
    if (filters.project !== 'All' && ad.project !== filters.project) return false;
    if (filters.productId !== 'All' && ad.productId !== filters.productId) return false;
    if (filters.employeeId !== 'All' && ad.employeeId !== filters.employeeId) return false;
    if (filters.minOrders && ad.orders < parseInt(filters.minOrders)) return false;
    if (filters.maxOrders && ad.orders > parseInt(filters.maxOrders)) return false;
    
    return true;
  });

  // Calculate totals
  const totalSpent = filteredAds.reduce((sum, ad) => sum + (parseFloat(ad.spent) || 0), 0);
  const totalOrders = filteredAds.reduce((sum, ad) => sum + (parseInt(ad.orders) || 0), 0);
  const averageCPO = totalOrders > 0 ? (totalSpent / totalOrders).toFixed(2) : 0;

  // Group by platform
  const platformStats = filteredAds.reduce((acc, ad) => {
    if (!acc[ad.platform]) {
      acc[ad.platform] = { orders: 0, spent: 0, count: 0 };
    }
    acc[ad.platform].orders += ad.orders || 0;
    acc[ad.platform].spent += parseFloat(ad.spent) || 0;
    acc[ad.platform].count += 1;
    return acc;
  }, {});

  // Top performing campaigns
  const topCampaigns = [...filteredAds]
    .sort((a, b) => (b.orders || 0) - (a.orders || 0))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50/50 p-8 font-sans text-slate-800">
      
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
            <Megaphone size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard Publicités</h1>
            <p className="text-slate-500 mt-1 font-medium">Vue d'ensemble de vos campagnes publicitaires</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Filtres</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="group">
            <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Date De</label>
            <input 
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
              className="w-full pl-4 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200"
            />
          </div>

          <div className="group">
            <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Date À</label>
            <input 
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
              className="w-full pl-4 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all duration-200"
            />
          </div>

          <div className="group">
            <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Projet</label>
            <select
              value={filters.project}
              onChange={(e) => setFilters({...filters, project: e.target.value})}
              className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all duration-200 appearance-none cursor-pointer"
            >
              <option value="All">Tous les projets</option>
              <option value="Alpha">Alpha</option>
              <option value="Beta">Beta</option>
            </select>
          </div>

          <div className="group">
            <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Produit</label>
            <select
              value={filters.productId}
              onChange={(e) => setFilters({...filters, productId: e.target.value})}
              className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all duration-200 appearance-none cursor-pointer"
            >
              <option value="All">Tous les produits</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.nom}</option>
              ))}
            </select>
          </div>

          <div className="group">
            <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Employé</label>
            <select
              value={filters.employeeId}
              onChange={(e) => setFilters({...filters, employeeId: e.target.value})}
              className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all duration-200 appearance-none cursor-pointer"
            >
              <option value="All">Tous les employés</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>

          <div className="group">
            <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Commandes Min</label>
            <input 
              type="number"
              min="0"
              value={filters.minOrders}
              onChange={(e) => setFilters({...filters, minOrders: e.target.value})}
              className="w-full pl-4 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all duration-200"
              placeholder="Min"
            />
          </div>

          <div className="group">
            <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Commandes Max</label>
            <input 
              type="number"
              min="0"
              value={filters.maxOrders}
              onChange={(e) => setFilters({...filters, maxOrders: e.target.value})}
              className="w-full pl-4 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all duration-200"
              placeholder="Max"
            />
          </div>
        </div>
      </div>

      {/* 3 Categories Dashboard: Estimation, Goal, Data & Success */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* 1. ESTIMATION */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-bl-full -mr-4 -mt-4" />
          <div className="flex items-center gap-2 mb-6 relative">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Calendar size={20} /></div>
            <h3 className="font-bold text-slate-700">Estimations</h3>
          </div>
          
          <div className="space-y-6 relative flex-1">
             <div>
                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Budget Estimé / Jour</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-800">
                        {(filteredAds.length > 0 ? (filteredAds.reduce((sum, ad) => sum + (parseFloat(ad.dailyBudget) || 0), 0) / filteredAds.length) : 0).toFixed(0)} 
                    </span>
                    <span className="text-sm font-bold text-slate-500">MAD</span>
                </div>
             </div>

             <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-blue-700">Projection Commandes</span>
                    <TrendingUp size={16} className="text-blue-500" />
                </div>
                <p className="text-3xl font-black text-blue-800">
                    {totalSpent > 0 ? ((totalSpent * 1.2 / (parseFloat(averageCPO) || 1))).toFixed(0) : 0}
                </p>
                <p className="text-[10px] text-blue-500 mt-1 font-medium opacity-80">Basé sur une augmentation de 20%</p>
             </div>
          </div>
        </div>

        {/* 2. GOAL (OBJECTIFS) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-50 rounded-bl-full -mr-4 -mt-4" />
          <div className="flex items-center gap-2 mb-6 relative">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Target size={20} /></div>
            <h3 className="font-bold text-slate-700">Objectifs (Goals)</h3>
          </div>
          
          <div className="space-y-6 relative flex-1">
             <div>
                <div className="flex justify-between items-center mb-1">
                    <p className="text-xs text-slate-400 font-bold uppercase">Target CPO</p>
                    <button className="text-[10px] font-bold text-purple-600 hover:underline">Modifier</button>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-purple-800">{targetCPO}</span>
                    <span className="text-sm font-bold text-slate-500">MAD</span>
                </div>
                <input 
                    type="range" min="5" max="100" value={targetCPO} 
                    onChange={(e) => { setTargetCPO(e.target.value); localStorage.setItem('adsSettings', JSON.stringify({ targetCPO: e.target.value })); }}
                    className="w-full mt-2 h-2 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
             </div>

             <div className="grid grid-cols-2 gap-3">
                 <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                    <p className="text-[10px] font-bold text-purple-500 uppercase">Target ROAS</p>
                    <p className="text-xl font-black text-purple-800">3.5</p>
                 </div>
                 <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                    <p className="text-[10px] font-bold text-purple-500 uppercase">Min Orders</p>
                    <p className="text-xl font-black text-purple-800">50/j</p>
                 </div>
             </div>
          </div>
        </div>

        {/* 3. DATA & SUCCESS (RÉUSSITE) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-50 rounded-bl-full -mr-4 -mt-4" />
          <div className="flex items-center gap-2 mb-6 relative">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><DollarSign size={20} /></div>
            <h3 className="font-bold text-slate-700">Data & Réussite</h3>
          </div>
          
          <div className="space-y-4 relative flex-1">
             <div className="flex justify-between items-end pb-3 border-b border-slate-50">
                <div>
                   <p className="text-xs text-slate-400 font-bold uppercase">Dépenses (Actual)</p>
                   <p className="text-xl font-black text-slate-800">{totalSpent.toFixed(0)} <span className="text-sm text-slate-400 font-bold">DH</span></p>
                </div>
                <div className="text-right">
                   <p className="text-xs text-slate-400 font-bold uppercase">Commandes</p>
                   <p className="text-xl font-black text-slate-800">{totalOrders}</p>
                </div>
             </div>

             <div>
                <p className="text-xs text-slate-400 font-bold uppercase mb-2">KPI Réussite (CPO Actual vs Goal)</p>
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                        <span className={`text-2xl font-black ${parseFloat(averageCPO) <= targetCPO ? 'text-emerald-500' : 'text-red-500'}`}>
                            {averageCPO}
                        </span>
                        <span className="text-xs font-bold text-slate-400 ml-1">MAD</span>
                    </div>
                    
                    <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${parseFloat(averageCPO) <= targetCPO ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {parseFloat(averageCPO) <= targetCPO ? <TrendingUp size={14}/> : <TrendingDown size={14}/>}
                        {parseFloat(averageCPO) <= targetCPO ? 'Succès' : 'Échec'}
                    </div>
                </div>
             </div>
          </div>
        </div>

      </div>

      {/* Platform Performance & Top Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Platform Performance */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Megaphone size={20} className="text-blue-600" />
            Performance par Plateforme
          </h2>
          <div className="space-y-4">
            {Object.entries(platformStats).map(([platform, stats]) => {
              const cpo = stats.orders > 0 ? (stats.spent / stats.orders).toFixed(2) : 0;
              const platformColor = 
                platform === 'Facebook' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                platform === 'TikTok' ? 'bg-pink-100 text-pink-800 border-pink-200' :
                platform === 'Instagram' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                'bg-green-100 text-green-800 border-green-200';
              
              return (
                <div key={platform} className="border border-slate-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${platformColor}`}>
                      {platform}
                    </span>
                    <span className="text-xs text-slate-500">{stats.count} campagnes</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Commandes</p>
                      <p className="text-lg font-bold text-slate-800">{stats.orders}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Dépensé</p>
                      <p className="text-lg font-bold text-orange-600">{stats.spent.toFixed(2)} MAD</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">CPO</p>
                      <p className={`text-lg font-bold ${parseFloat(cpo) > targetCPO ? 'text-red-600' : 'text-emerald-600'}`}>
                        {cpo} MAD
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            {Object.keys(platformStats).length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <Megaphone size={32} className="mx-auto mb-2 opacity-20" />
                <p>Aucune donnée disponible</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Campaigns */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-600" />
            Top 5 Campagnes
          </h2>
          <div className="space-y-3">
            {topCampaigns.map((ad, index) => (
              <div key={ad.id} className="border border-slate-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <h3 className="font-bold text-slate-800 text-sm">{ad.campaignName}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Package size={12} />
                      <span>{ad.productName}</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                    {ad.orders} commandes
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">CPO: <span className="font-bold text-slate-700">{ad.orders > 0 ? (ad.spent / ad.orders).toFixed(2) : 0} MAD</span></span>
                  <span className="text-slate-500">Dépensé: <span className="font-bold text-orange-600">{parseFloat(ad.spent).toFixed(2)} MAD</span></span>
                </div>
              </div>
            ))}
            {topCampaigns.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <TrendingUp size={32} className="mx-auto mb-2 opacity-20" />
                <p>Aucune campagne disponible</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Résumé</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500 font-medium mb-1">Campagnes Actives</p>
            <p className="text-2xl font-bold text-slate-800">{filteredAds.length}</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500 font-medium mb-1">Budget Moyen/Jour</p>
            <p className="text-2xl font-bold text-slate-800">
              {filteredAds.length > 0 
                ? (filteredAds.reduce((sum, ad) => sum + (parseFloat(ad.dailyBudget) || 0), 0) / filteredAds.length).toFixed(2)
                : 0} MAD
            </p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500 font-medium mb-1">Taux de Conversion</p>
            <p className="text-2xl font-bold text-slate-800">
              {totalOrders > 0 && totalSpent > 0 ? ((totalOrders / filteredAds.length) * 100).toFixed(1) : 0}%
            </p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500 font-medium mb-1">ROI Estimé</p>
            <p className="text-2xl font-bold text-emerald-600">
              {totalSpent > 0 ? ((totalOrders * 100 - totalSpent) / totalSpent * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
