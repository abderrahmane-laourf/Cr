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

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl p-6 border border-orange-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">Dépenses Totales</p>
              <p className="text-3xl font-extrabold text-orange-900 mt-2">{totalSpent.toFixed(2)} MAD</p>
            </div>
            <div className="w-14 h-14 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg">
              <DollarSign size={28} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-orange-700">
            <TrendingUp size={14} />
            <span className="font-medium">Basé sur {filteredAds.length} campagnes</span>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 border border-blue-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Total Commandes</p>
              <p className="text-3xl font-extrabold text-blue-900 mt-2">{totalOrders}</p>
            </div>
            <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg">
              <ShoppingCart size={28} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-blue-700">
            <TrendingUp size={14} />
            <span className="font-medium">Toutes plateformes confondues</span>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-6 border border-emerald-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">CPO Moyen</p>
              <p className="text-3xl font-extrabold text-emerald-900 mt-2">{averageCPO} MAD</p>
            </div>
            <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Target size={28} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-700">
            <Target size={14} />
            <span className="font-medium">Target: {targetCPO} MAD</span>
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
