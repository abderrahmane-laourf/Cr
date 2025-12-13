import React, { useState, useEffect } from 'react';
import { Package, Search, Calendar, User, Phone, MapPin, Truck, AlertTriangle, X } from 'lucide-react';
import { productAPI, villeAPI } from '../../services/api';

export default function Retourner() {
  const [colis, setColis] = useState([]);
  const [products, setProducts] = useState([]);
  const [villes, setVilles] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [filterVille, setFilterVille] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBusiness, setFilterBusiness] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load colis from localStorage
      const savedColis = JSON.parse(localStorage.getItem('colis') || '[]');
      
      // Filter only "Retourner" stage
      const retournerColis = savedColis.filter(c => 
        c.stage === 'Retourner' || 
        c.stage === 'Retourné' || 
        c.stage?.toLowerCase().includes('retour')
      );
      
      setColis(retournerColis);

      // Load products and cities
      const [productsData, villesData] = await Promise.all([
        productAPI.getAll().catch(() => []),
        villeAPI.getAll().catch(() => [])
      ]);
      
      setProducts(productsData);
      setVilles(villesData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Filter colis
  const filteredColis = colis.filter(c => {
    // Text search
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      const matchesClient = c.clientName?.toLowerCase().includes(searchLower);
      const matchesPhone = c.tel?.includes(searchText);
      const matchesId = c.id?.toString().includes(searchText);
      
      if (!matchesClient && !matchesPhone && !matchesId) {
        return false;
      }
    }
    
    // Date filter
    if (searchDate) {
      const colisDate = new Date(c.dateCreated).toISOString().split('T')[0];
      if (colisDate !== searchDate) {
        return false;
      }
    }

    // Ville filter
    if (filterVille && c.ville !== filterVille) return false;

    // Category filter
    if (filterCategory && c.category !== filterCategory) return false;

    // Business filter
    if (filterBusiness && c.storeName !== filterBusiness) return false;

    // Employee filter
    if (filterEmployee && c.livreurName !== filterEmployee) return false;
    
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="w-full">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Colis Retournés
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Gestion des retours • {filteredColis.length} colis
                </p>
              </div>
            </div>
          </div>

          {/* Search Filters - In Header like Livraison Agadir */}
          <div className="flex flex-col gap-4 pt-4 border-t border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Rechercher par client, téléphone, ID..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>
              
              <select
                value={filterVille}
                onChange={(e) => setFilterVille(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              >
                <option value="">Toutes les villes</option>
                {villes.map(v => (
                  <option key={v.id} value={v.name}>{v.name}</option>
                ))}
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              >
                <option value="">Toutes les catégories</option>
                {[...new Set(products.map(p => p.category))].filter(Boolean).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={filterBusiness}
                onChange={(e) => setFilterBusiness(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              >
                <option value="">Tous les business</option>
                {[...new Set(colis.map(c => c.storeName))].filter(Boolean).map(store => (
                  <option key={store} value={store}>{store}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
               <select
                value={filterEmployee}
                onChange={(e) => setFilterEmployee(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              >
                <option value="">Tous les employés</option>
                {[...new Set(colis.map(c => c.livreurName))].filter(Boolean).map(emp => (
                  <option key={emp} value={emp}>{emp}</option>
                ))}
              </select>

              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stage Card - Similar to the image */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Stage Header */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <AlertTriangle className="text-white" size={18} />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white">Retourner</h2>
            </div>
            <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm">
              {filteredColis.length}
            </span>
          </div>

          {/* Colis Cards */}
          <div className="p-4">
            {filteredColis.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">Vide</h3>
                <p className="text-sm text-slate-500">Aucun colis retourné</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredColis.map((c) => {
                  const product = products.find(p => p.id === c.productId);
                  const ville = villes.find(v => v.id === c.villeId);
                  
                  return (
                    <div key={c.id} className="bg-slate-50 hover:bg-slate-100 rounded-xl p-3 sm:p-4 border border-slate-200 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1 space-y-2">
                          {/* Client & ID */}
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-500">#{c.id}</span>
                            <span className="text-sm font-bold text-slate-900">{c.clientName}</span>
                          </div>
                          
                          {/* Details Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                            <div className="flex items-center gap-2 text-slate-600">
                              <Package size={14} className="text-slate-400 flex-shrink-0" />
                              <span className="truncate">{product?.nom || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                              <MapPin size={14} className="text-slate-400 flex-shrink-0" />
                              <span className="truncate">{ville?.name || c.ville || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                              <Phone size={14} className="text-slate-400 flex-shrink-0" />
                              <span className="font-mono">{c.tel}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                              <Calendar size={14} className="text-slate-400 flex-shrink-0" />
                              <span>{new Date(c.dateCreated).toLocaleDateString('fr-FR')}</span>
                            </div>
                          </div>
                        </div>

                        {/* Price Badge */}
                        <div className="flex items-center justify-between sm:justify-end gap-2">
                          <span className="text-xs sm:text-sm font-bold text-red-600">
                            {c.prix ? `${c.prix} DH` : '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        {filteredColis.length > 0 && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="text-red-600" size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Total Retournés</p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900">{filteredColis.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Package className="text-orange-600" size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Total Articles</p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900">
                    {filteredColis.reduce((sum, c) => sum + (parseInt(c.nbPiece) || 1), 0)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Truck className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Valeur Totale</p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900">
                    {filteredColis.reduce((sum, c) => sum + (parseFloat(c.prix) || 0), 0).toFixed(2)} DH
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
