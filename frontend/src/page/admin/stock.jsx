import React, { useState, useEffect } from 'react';
import { Search, Package, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

import { productAPI } from '../../services/api';

export default function StockListPage() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
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

  const filteredProducts = products.filter(product =>
    product.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.categorie?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (stock, alerteStock) => {
    if (stock <= alerteStock) return { color: 'red', label: 'Stock Faible', icon: AlertCircle };
    if (stock <= alerteStock * 2) return { color: 'orange', label: 'Stock Moyen', icon: TrendingDown };
    return { color: 'green', label: 'Stock Bon', icon: TrendingUp };
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-8 font-sans text-slate-800">
      
      {/* HEADER */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">État du Stock</h1>
            <p className="text-slate-500 mt-1 font-medium">Consultez les quantités disponibles par produit.</p>
          </div>
        </div>
        
        <div className="relative mt-6 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher un produit..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" 
          />
        </div>
      </div>

      {/* PRODUCTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => {
          const status = getStockStatus(product.stock || 0, product.alerteStock || 10);
          const StatusIcon = status.icon;
          
          return (
            <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
              {/* Product Image */}
              <div className="h-48 bg-slate-100 overflow-hidden relative">
                <img 
                  src={product.image} 
                  alt={product.nom} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    status.color === 'green' ? 'bg-emerald-100 text-emerald-700' :
                    status.color === 'orange' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {status.label}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-lg mb-1">{product.nom}</h3>
                    <p className="text-xs text-slate-500 font-semibold uppercase">{product.categorie}</p>
                  </div>
                  <Package className="text-slate-300" size={24} />
                </div>

                {/* Stock Info */}
                <div className="bg-slate-50 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase">Stock Actuel</span>
                    <div className="flex items-center gap-2">
                      <StatusIcon size={16} className={
                        status.color === 'green' ? 'text-emerald-600' :
                        status.color === 'orange' ? 'text-orange-600' :
                        'text-red-600'
                      } />
                      <span className={`text-2xl font-black ${
                        status.color === 'green' ? 'text-emerald-600' :
                        status.color === 'orange' ? 'text-orange-600' :
                        'text-red-600'
                      }`}>
                        {product.stock || 0}
                      </span>
                      <span className="text-sm text-slate-500 font-medium">{product.uniteCalcul}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                    <span className="text-xs text-slate-500">Alerte Stock</span>
                    <span className="text-sm font-bold text-orange-600">{product.alerteStock || 10} {product.uniteCalcul}</span>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Type</span>
                    <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-xs">{product.type}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Business</span>
                    <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-xs">{product.business || 'N/A'}</span>
                  </div>
                  {product.fragile && (
                    <div className="flex items-center gap-2 text-xs bg-red-50 text-red-700 px-2 py-1 rounded">
                      <AlertCircle size={14} />
                      <span className="font-bold">Produit Fragile</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
          <Package size={48} className="mx-auto mb-4 text-slate-300" />
          <p className="text-slate-400 font-medium">Aucun produit trouvé</p>
        </div>
      )}
    </div>
  );
}
