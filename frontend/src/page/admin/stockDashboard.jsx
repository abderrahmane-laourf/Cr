import React, { useState, useEffect } from 'react';
import { Package, TrendingUp, TrendingDown, Truck, ArrowLeftRight, History, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StockDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    lowStockProducts: 0,
    totalMovements: 0,
    totalTransfers: 0,
    pendingTransfers: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Fetch products
      const productsRes = await fetch('http://localhost:3000/products');
      const products = await productsRes.json();
      
      // Fetch movements
      const movementsRes = await fetch('http://localhost:3000/stockMovements');
      const movements = await movementsRes.json();
      
      // Fetch transfers
      const transfersRes = await fetch('http://localhost:3000/stockTransfers');
      const transfers = await transfersRes.json();

      const totalStock = products.reduce((sum, p) => sum + p.stockTotal, 0);
      const lowStock = products.filter(p => p.stockTotal < 50).length;
      const pending = transfers.filter(t => t.status === 'En cours').length;

      setStats({
        totalProducts: products.length,
        totalStock,
        lowStockProducts: lowStock,
        totalMovements: movements.length,
        totalTransfers: transfers.length,
        pendingTransfers: pending
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const cards = [
    {
      title: 'Total Produits',
      value: stats.totalProducts,
      icon: Package,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      path: '/admin/stock'
    },
    {
      title: 'Stock Total',
      value: stats.totalStock,
      icon: TrendingUp,
      color: 'emerald',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      path: '/admin/stock'
    },
    {
      title: 'Stock Faible',
      value: stats.lowStockProducts,
      icon: AlertTriangle,
      color: 'red',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      path: '/admin/stock'
    },
    {
      title: 'Mouvements',
      value: stats.totalMovements,
      icon: History,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      path: '/admin/stock/movements'
    },
    {
      title: 'Transferts Total',
      value: stats.totalTransfers,
      icon: Truck,
      color: 'indigo',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      path: '/admin/stock/transfer'
    },
    {
      title: 'Transferts En Cours',
      value: stats.pendingTransfers,
      icon: ArrowLeftRight,
      color: 'orange',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      path: '/admin/stock/transfer'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 p-8 font-sans text-slate-800">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Dashboard - Gestion de Stock
        </h1>
        <p className="text-slate-500 mt-1 font-medium">
          Vue d'ensemble de votre inventaire et mouvements
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Actions Rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/admin/stock')}
            className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <Package className="text-slate-400 group-hover:text-blue-600" size={24} />
            <div className="text-left">
              <h3 className="font-bold text-slate-800">Voir Stock</h3>
              <p className="text-xs text-slate-500">État des produits</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/admin/stock/movements')}
            className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 hover:border-purple-500 hover:bg-purple-50 transition-all group"
          >
            <History className="text-slate-400 group-hover:text-purple-600" size={24} />
            <div className="text-left">
              <h3 className="font-bold text-slate-800">Ajuster Stock</h3>
              <p className="text-xs text-slate-500">Nouveau mouvement</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/admin/stock/transfer')}
            className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 hover:border-orange-500 hover:bg-orange-50 transition-all group"
          >
            <Truck className="text-slate-400 group-hover:text-orange-600" size={24} />
            <div className="text-left">
              <h3 className="font-bold text-slate-800">Nouveau Transfert</h3>
              <p className="text-xs text-slate-500">Entre entrepôts</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
