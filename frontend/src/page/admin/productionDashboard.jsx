import React, { useState, useEffect } from 'react';
import { Factory, Package, DollarSign, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { productionAPI } from '../../services/api';

export default function ProductionDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProductions: 0,
    totalQuantity: 0,
    totalCost: 0,
    thisMonthProductions: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Fetch productions
      const productions = await productionAPI.getAll();
      
      // Calculate stats
      const totalQuantity = productions.reduce((sum, p) => sum + p.quantity, 0);
      const totalCost = productions.reduce((sum, p) => sum + (p.unitCost * p.quantity), 0);
      
      // This month productions
      const now = new Date();
      const thisMonth = productions.filter(p => {
        const prodDate = new Date(p.date);
        return prodDate.getMonth() === now.getMonth() && 
               prodDate.getFullYear() === now.getFullYear();
      });

      setStats({
        totalProductions: productions.length,
        totalQuantity,
        totalCost,
        thisMonthProductions: thisMonth.length
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const cards = [
    {
      title: 'Total Productions',
      value: stats.totalProductions,
      icon: Factory,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      path: '/admin/production'
    },
    {
      title: 'Quantité Totale',
      value: stats.totalQuantity,
      icon: Package,
      color: 'emerald',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      path: '/admin/production'
    },
    {
      title: 'Coût Total',
      value: `${Math.round(stats.totalCost).toLocaleString()} DH`,
      icon: DollarSign,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      path: '/admin/production'
    },
    {
      title: 'Ce Mois',
      value: stats.thisMonthProductions,
      icon: Calendar,
      color: 'orange',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      path: '/admin/production'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 p-8 font-sans text-slate-800">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Dashboard - Gestion de Production
        </h1>
        <p className="text-slate-500 mt-1 font-medium">
          Vue d'ensemble de vos opérations de fabrication
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              onClick={() => navigate(card.path)}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${card.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className={card.iconColor} size={24} />
                </div>
                <TrendingUp className="text-slate-300 group-hover:text-emerald-500 transition-colors" size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
                {card.title}
              </h3>
              <p className="text-3xl font-black text-slate-800">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Actions Rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/admin/production')}
            className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <Factory className="text-slate-400 group-hover:text-blue-600" size={24} />
            <div className="text-left">
              <h3 className="font-bold text-slate-800">Nouvelle Production</h3>
              <p className="text-xs text-slate-500">Enregistrer une production</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/admin/products')}
            className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 hover:border-purple-500 hover:bg-purple-50 transition-all group"
          >
            <Package className="text-slate-400 group-hover:text-purple-600" size={24} />
            <div className="text-left">
              <h3 className="font-bold text-slate-800">Gérer Produits</h3>
              <p className="text-xs text-slate-500">Voir le catalogue</p>
            </div>
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertCircle size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-blue-900 mb-1">
              Gestion de Production
            </h3>
            <p className="text-xs text-blue-700 leading-relaxed">
              Suivez vos opérations de fabrication, gérez les matières premières utilisées et calculez automatiquement les coûts de production. 
              Toutes vos données sont synchronisées en temps réel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
