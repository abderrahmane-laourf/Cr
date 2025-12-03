import React, { useState, useEffect } from 'react';
import { Search, Package, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

// Mock API - Replace with actual API calls
const stockAPI = {
  getAll: async () => {
    const response = await fetch('http://localhost:3000/products');
    return response.json();
  }
};

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
      const data = await stockAPI.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (total) => {
    if (total < 50) return { color: 'red', label: 'Stock Faible', icon: AlertCircle };
    if (total < 100) return { color: 'orange', label: 'Stock Moyen', icon: TrendingDown };
    return { color: 'green', label: 'Stock Bon', icon: TrendingUp };
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-8 font-sans text-slate-800">
      
      {/* HEADER */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">État du Stock</h1>
            <p className="text-slate-500 mt-1 font-medium">Consultez les quantités disponibles par produit et entrepôt.</p>
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
          const status = getStockStatus(product.stockTotal);
          const StatusIcon = status.icon;
          
          return (
            <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
              {/* Product Image */}
              <div className="h-48 bg-slate-100 overflow-hidden relative">
                <img 
                  src={product.image} 
                  alt={product.name} 
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
                    <h3 className="font-bold text-slate-800 text-lg mb-1">{product.name}</h3>
                    <p className="text-xs text-slate-500 font-semibold uppercase">{product.category}</p>
                  </div>
                  <Package className="text-slate-300" size={24} />
                </div>

                {/* Total Stock */}
                <div className="bg-slate-50 rounded-xl p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">Stock Total</span>
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
                        {product.stockTotal}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Warehouse Breakdown */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2">Par Entrepôt</p>
                  {Object.entries(product.warehouses).map(([warehouse, quantity]) => (
                    <div key={warehouse} className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">{warehouse}</span>
                      <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{quantity}</span>
                    </div>
                  ))}
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
