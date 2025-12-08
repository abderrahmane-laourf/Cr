import React, { useState, useEffect } from 'react';
import { 
  Search, Package, AlertCircle, TrendingUp, TrendingDown,
  LayoutGrid, LayoutList, Download, FileSpreadsheet, FileText,
  Truck, PackageCheck, Warehouse, ChevronDown
} from 'lucide-react';

import { productAPI } from '../../services/api';

export default function StockListPage() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [warehouseFilter, setWarehouseFilter] = useState('Tous');
  const [categoryFilter, setCategoryFilter] = useState('Tous');
  const [businessFilter, setBusinessFilter] = useState('Tous');
  
  // View mode
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

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

  // Mock delivery data - in real app, this would come from orders/deliveries API
  const getDeliveryStatus = (productId) => {
    // Simulate delivery statuses
    const random = productId % 3;
    return {
      enLivraison: random === 0 ? Math.floor(Math.random() * 20) : 0,
      enPreparation: random === 1 ? Math.floor(Math.random() * 15) : 0
    };
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.categorie?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'Tous' || product.categorie === categoryFilter;
    const matchesBusiness = businessFilter === 'Tous' || product.business === businessFilter;
    const matchesWarehouse = warehouseFilter === 'Tous' || product.magasin === warehouseFilter;
    
    return matchesSearch && matchesCategory && matchesBusiness && matchesWarehouse;
  });

  const getStockStatus = (stock, alerteStock) => {
    if (stock <= alerteStock) return { color: 'red', label: 'Stock Faible', icon: AlertCircle };
    if (stock <= alerteStock * 2) return { color: 'orange', label: 'Stock Moyen', icon: TrendingDown };
    return { color: 'green', label: 'Stock Bon', icon: TrendingUp };
  };

  // Export to Excel
  const exportToExcel = () => {
    const data = filteredProducts.map(product => {
      const delivery = getDeliveryStatus(product.id);
      const total = (product.stock || 0) + delivery.enLivraison + delivery.enPreparation;
      const status = getStockStatus(product.stock || 0, product.alerteStock || 10);
      
      return {
        'Produit': product.nom,
        'Catégorie': product.categorie,
        'Business': product.business || 'N/A',
        'Stock Actuel': product.stock || 0,
        'En Livraison': delivery.enLivraison,
        'En Préparation': delivery.enPreparation,
        'Total': total,
        'Statut': status.label
      };
    });

    // Simple CSV export (for Excel compatibility)
    const headers = Object.keys(data[0] || {});
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => `"${row[h]}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `stock_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  // Export to CSV
  const exportToCSV = () => {
    exportToExcel(); // Same implementation for now
  };

  const categories = ['Tous', ...new Set(products.map(p => p.categorie).filter(Boolean))];
  const businesses = ['Tous', ...new Set(products.map(p => p.business).filter(Boolean))];
  const warehouses = ['Tous', ...new Set(products.map(p => p.magasin).filter(Boolean))];

  return (
    <div className="min-h-screen bg-slate-50/50 p-8 font-sans text-slate-800">
      
      {/* HEADER */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">État du Stock</h1>
            <p className="text-slate-500 mt-1 font-medium">Consultez les quantités disponibles par produit.</p>
          </div>
          
          {/* Export Buttons */}
          <div className="flex items-center gap-3">
            <button 
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 font-semibold text-sm"
            >
              <FileSpreadsheet size={18} /> Excel
            </button>
            <button 
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 font-semibold text-sm"
            >
              <FileText size={18} /> CSV
            </button>
          </div>
        </div>

        {/* Filters & View Toggle */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Rechercher un produit..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" 
            />
          </div>

          {/* Warehouse Filter */}
          <div className="relative">
            <select 
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="w-full md:w-48 pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
            >
              {warehouses.map(wh => <option key={wh} value={wh}>{wh === 'Tous' ? 'Tous Magasins' : wh}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full md:w-48 pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat === 'Tous' ? 'Toutes catégories' : cat}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>

          {/* Business Filter */}
          <div className="relative">
            <select 
              value={businessFilter}
              onChange={(e) => setBusinessFilter(e.target.value)}
              className="w-full md:w-48 pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
            >
              {businesses.map(biz => <option key={biz} value={biz}>{biz === 'Tous' ? 'Tous Business' : biz}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                viewMode === 'cards' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <LayoutGrid size={18} className="inline mr-1" /> Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                viewMode === 'table' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <LayoutList size={18} className="inline mr-1" /> Table
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      {viewMode === 'cards' ? (
        /* CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map(product => {
            const delivery = getDeliveryStatus(product.id);
            const stockActuel = product.stock || 0;
            const total = stockActuel + delivery.enLivraison + delivery.enPreparation;
            const status = getStockStatus(stockActuel, product.alerteStock || 10);
            const StatusIcon = status.icon;
            
            return (
              <div key={product.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Compact Header with Circular Image */}
                <div className="p-4 flex items-center gap-3 border-b border-slate-100">
                  <img 
                    src={product.image} 
                    alt={product.nom} 
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100 shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 text-sm truncate">{product.nom}</h3>
                    <p className="text-xs text-slate-500 font-semibold">{product.categorie}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                    status.color === 'green' ? 'bg-emerald-100 text-emerald-700' :
                    status.color === 'orange' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {status.label}
                  </span>
                </div>

                {/* Stock Info - Compact */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Package size={14} /> Stock Actuel
                    </span>
                    <span className={`font-bold ${
                      status.color === 'green' ? 'text-emerald-600' :
                      status.color === 'orange' ? 'text-orange-600' :
                      'text-red-600'
                    }`}>
                      {stockActuel} {product.uniteCalcul}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Truck size={14} /> En Livraison
                    </span>
                    <span className="font-semibold text-blue-600">{delivery.enLivraison} {product.uniteCalcul}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-1">
                      <PackageCheck size={14} /> En Préparation
                    </span>
                    <span className="font-semibold text-purple-600">{delivery.enPreparation} {product.uniteCalcul}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-100">
                    <span className="text-slate-700 font-bold">Total</span>
                    <span className="font-black text-slate-800">{total} {product.uniteCalcul}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Produit</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Catégorie</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Business</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Stock Actuel</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">En Livraison</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">En Préparation</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredProducts.map(product => {
                  const delivery = getDeliveryStatus(product.id);
                  const stockActuel = product.stock || 0;
                  const total = stockActuel + delivery.enLivraison + delivery.enPreparation;
                  const status = getStockStatus(stockActuel, product.alerteStock || 10);
                  
                  return (
                    <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={product.image} 
                            alt={product.nom} 
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 shadow-sm"
                          />
                          <span className="font-semibold text-slate-800">{product.nom}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                          {product.categorie}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-700">{product.business || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${
                          status.color === 'green' ? 'text-emerald-600' :
                          status.color === 'orange' ? 'text-orange-600' :
                          'text-red-600'
                        }`}>
                          {stockActuel} {product.uniteCalcul}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-blue-600">{delivery.enLivraison} {product.uniteCalcul}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-purple-600">{delivery.enPreparation} {product.uniteCalcul}</td>
                      <td className="px-6 py-4 text-sm font-black text-slate-800">{total} {product.uniteCalcul}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          status.color === 'green' ? 'bg-emerald-100 text-emerald-700' :
                          status.color === 'orange' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredProducts.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
          <Package size={48} className="mx-auto mb-4 text-slate-300" />
          <p className="text-slate-400 font-medium">Aucun produit trouvé</p>
        </div>
      )}
    </div>
  );
}
