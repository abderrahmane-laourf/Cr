import React, { useState, useEffect } from 'react';
import { 
  Package, TrendingUp, AlertTriangle, DollarSign, 
  ShoppingCart, Layers, PieChart, BarChart3, CheckCircle
} from 'lucide-react';
import { productAPI } from '../../services/api';
import { Link } from 'react-router-dom';

export default function ProductDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productAPI.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock <= p.alerteStock);
  const totalStockValue = products.reduce((sum, p) => sum + (p.stock * p.prixAchat), 0);
  const fragileProducts = products.filter(p => p.fragile).length;

  // Group by category
  const productsByCategory = products.reduce((acc, product) => {
    acc[product.categorie] = (acc[product.categorie] || 0) + 1;
    return acc;
  }, {});

  // Group by type
  const productsByType = products.reduce((acc, product) => {
    acc[product.type] = (acc[product.type] || 0) + 1;
    return acc;
  }, {});

  const StatCard = ({ icon: Icon, title, value, subtitle, color, link }) => (
    <Link to={link || '#'} className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">{title}</p>
          <h3 className={`text-4xl font-extrabold ${color} mb-1`}>{value}</h3>
          {subtitle && <p className="text-xs text-slate-600 font-medium">{subtitle}</p>}
        </div>
        <div className={`p-4 rounded-xl ${color.replace('text', 'bg')}/10 group-hover:scale-110 transition-transform`}>
          <Icon size={28} className={color} />
        </div>
      </div>
    </Link>
  );

  const CategoryCard = ({ category, count }) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-600 text-xs font-bold uppercase mb-1">{category}</p>
          <p className="text-slate-800 text-2xl font-extrabold">{count}</p>
        </div>
        <PieChart className="text-blue-500" size={32} />
      </div>
    </div>
  );

  const TypeCard = ({ type, count, percentage }) => {
    const maxWidth = 100;
    const width = (count / totalProducts) * maxWidth;
    
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-slate-700">{type}</span>
          <span className="text-xs font-bold text-slate-500">{count} produits</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${width}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-1 text-right">{percentage}%</p>
      </div>
    );
  };

  const LowStockItem = ({ product }) => (
    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100 hover:bg-orange-100 transition-colors">
      <img src={product.image} alt={product.nom} className="w-12 h-12 rounded-lg object-cover shadow-sm" />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-slate-800 truncate">{product.nom}</p>
        <p className="text-xs text-slate-500">{product.categorie}</p>
      </div>
      <div className="text-right">
        <p className="text-xs text-orange-600 font-bold flex items-center gap-1">
          <AlertTriangle size={14} />
          {product.stock} {product.uniteCalcul}
        </p>
        <p className="text-xs text-slate-400">Alerte: {product.alerteStock}</p>
      </div>
    </div>
  );

  const RecentProduct = ({ product }) => (
    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 hover:shadow-md transition-all">
      <img src={product.image} alt={product.nom} className="w-12 h-12 rounded-lg object-cover shadow-sm" />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-slate-800 truncate">{product.nom}</p>
        <p className="text-xs text-slate-500">{product.type} • {product.categorie}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-emerald-600">{product.prix1} MAD</p>
        <p className="text-xs text-slate-400">{product.stock} {product.uniteCalcul}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-8 flex items-center justify-center">
        <div className="text-center">
          <Package size={48} className="text-slate-300 animate-pulse mx-auto mb-4" />
          <p className="text-slate-500 font-semibold">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-8 font-sans text-slate-800">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Tableau de Bord Produits</h1>
        <p className="text-slate-600 font-medium">Vue d'ensemble de votre catalogue produits</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={Package}
          title="Total Produits"
          value={totalProducts}
          subtitle="Dans le catalogue"
          color="text-blue-600"
          link="/admin/products"
        />
        <StatCard 
          icon={AlertTriangle}
          title="Stock Faible"
          value={lowStockProducts.length}
          subtitle="Nécessite réapprovisionnement"
          color="text-orange-600"
        />
        <StatCard 
          icon={DollarSign}
          title="Valeur Stock"
          value={`${totalStockValue.toFixed(0)} MAD`}
          subtitle="Valeur totale d'achat"
          color="text-emerald-600"
        />
        <StatCard 
          icon={ShoppingCart}
          title="Produits Fragiles"
          value={fragileProducts}
          subtitle="Nécessite attention"
          color="text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Categories */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Layers className="text-blue-600" size={24} />
              <h2 className="text-xl font-bold text-slate-800">Par Catégorie</h2>
            </div>
            <div className="space-y-3">
              {Object.entries(productsByCategory).map(([category, count]) => (
                <CategoryCard 
                  key={category} 
                  category={category} 
                  count={count}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Types */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="text-blue-600" size={24} />
              <h2 className="text-xl font-bold text-slate-800">Par Type</h2>
            </div>
            <div className="space-y-4">
              {Object.entries(productsByType).map(([type, count]) => (
                <TypeCard 
                  key={type} 
                  type={type} 
                  count={count}
                  percentage={((count / totalProducts) * 100).toFixed(1)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="text-orange-600" size={24} />
            <h2 className="text-xl font-bold text-slate-800">Alertes Stock Faible</h2>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map(product => (
                <LowStockItem key={product.id} product={product} />
              ))
            ) : (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle size={40} className="mx-auto mb-2 opacity-20" />
                <p className="text-sm">Aucune alerte de stock</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-emerald-600" size={24} />
            <h2 className="text-xl font-bold text-slate-800">Produits Récents</h2>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
            {products.slice(0, 5).map(product => (
              <RecentProduct key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
