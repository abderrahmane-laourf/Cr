import React, { useState, useEffect } from 'react';
import { 
  Package, AlertTriangle, Eye, Calendar, 
  Search as SearchIcon, MapPin, User, Phone, RotateCcw, Filter
} from 'lucide-react';
import { productAPI, villeAPI } from '../../services/api';

const EMPLOYEES = ['Mohamed', 'Fatima', 'Youssef', 'Amina', 'Hassan', 'Khadija'];

export default function RetournerAdmin() {
  const [colis, setColis] = useState([]);
  const [products, setProducts] = useState([]);
  const [villes, setVilles] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [selectedColisForTracking, setSelectedColisForTracking] = useState(null);
  
  // Filters
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterVille, setFilterVille] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');

  // --- INITIALIZATION ---
  useEffect(() => {
    loadData();
    
    // Auto-refresh when localStorage changes
    const handleStorageChange = () => loadData();
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      const [productsData, villesData] = await Promise.all([
        productAPI.getAll().catch(() => []),
        villeAPI.getAll().catch(() => [])
      ]);
      
      setProducts(productsData);
      setVilles(villesData);

      const savedColis = localStorage.getItem('colis');
      if (savedColis) {
        setColis(JSON.parse(savedColis));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // --- FILTERING ---
  const filteredColis = colis.filter(c => {
    // 1. Only show "Retourner" stage from both pipelines
    const isRetourner = c.stage === 'Retourner' || c.stage === 'Retourner-AG' || c.stage === 'Returned';
    if (!isRetourner) return false;

    // 2. Search
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      const matchesName = c.clientName?.toLowerCase().includes(searchLower);
      const matchesPhone = c.tel?.toLowerCase().includes(searchLower);
      const matchesProduct = c.productName?.toLowerCase().includes(searchLower);
      if (!matchesName && !matchesPhone && !matchesProduct) return false;
    }

    // 3. Date Filter
    if (filterStartDate || filterEndDate) {
      const colisDate = new Date(c.dateCreated);
      if (filterStartDate && colisDate < new Date(filterStartDate)) return false;
      if (filterEndDate) {
        const endDate = new Date(filterEndDate);
        endDate.setHours(23, 59, 59, 999);
        if (colisDate > endDate) return false;
      }
    }

    // 4. Ville Filter
    if (filterVille && c.ville !== filterVille) return false;

    // 5. Employee Filter
    if (filterEmployee && c.employee !== filterEmployee) return false;

    return true;
  });

  // Sort by date (most recent first)
  const sortedColis = filteredColis.sort((a, b) => {
    return new Date(b.dateCreated) - new Date(a.dateCreated);
  });

  const checkUrgency = (item) => {
    if (!item.dateReport) return false;
    const reportDate = new Date(item.dateReport);
    const now = new Date();
    const hoursUntil = (reportDate - now) / (1000 * 60 * 60);
    return hoursUntil <= 24; 
  };

  // --- TRACKING MODAL ---
  const TrackingModal = ({ colis, onClose }) => {
    if (!colis) return null;

    const product = products.find(p => p.id === colis.productId);
    const ville = villes.find(v => v.id === colis.ville);

    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Détails du Colis</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <Eye size={20} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-16 h-16 rounded-xl bg-slate-100 shrink-0 overflow-hidden border-2 border-white shadow-sm">
                {product?.image ? (
                  <img src={product.image} className="w-full h-full object-cover" alt={product.nom} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={24} className="text-slate-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-800">{product?.nom || colis.productName}</h4>
                <p className="text-sm text-slate-500">Prix: {colis.prix} DH</p>
                {colis.nbPiece > 1 && (
                  <p className="text-xs text-slate-500">Quantité: {colis.nbPiece} pièces</p>
                )}
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <User size={16} className="text-slate-400" />
                <span className="font-medium text-slate-700">{colis.clientName}</span>
              </div>
              <div className="flex items-center gap-2">
                <User size={16} className="text-slate-400" />
                <span className="text-slate-500">Vendeur: <span className="font-medium text-slate-700">{colis.employee}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-slate-400" />
                <span className="text-slate-600">{colis.tel}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-slate-400" />
                <span className="text-slate-600">{ville?.name || colis.ville} - {colis.quartier}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Statut:</span>
                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg font-semibold">
                  Retourner
                </span>
              </div>
              {colis.dateReport && (
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-slate-500">Date de relance:</span>
                  <span className="text-slate-700 font-medium">
                    {new Date(colis.dateReport).toLocaleDateString('fr-FR', { 
                      day: '2-digit', 
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              )}
              {colis.commentaire && (
                <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Commentaire:</p>
                  <p className="text-sm text-slate-700">{colis.commentaire}</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-b-2xl">
            <button 
              onClick={onClose}
              className="w-full py-2 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-all font-semibold"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-transparent p-4 font-sans text-slate-900 animate-in fade-in duration-500">
      <div className="w-full mx-auto max-w-[1800px]">
        
        {/* HEADER */}
        <div className="glass-card bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
                <RotateCcw size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Gestion des Retours</h2>
                <p className="text-slate-500 font-medium">Suivi global des colis retournés</p>
              </div>
            </div>
            <div className="px-4 py-2 bg-amber-50 text-amber-700 rounded-xl font-bold border border-amber-100 flex items-center gap-2">
              <Package size={18} />
              {sortedColis.length} Colis
            </div>
          </div>
          
          {/* SEARCH & FILTER BAR */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                
                {/* Search */}
                <div className="lg:col-span-2 relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                    type="text" 
                    value={searchText} 
                    onChange={e => setSearchText(e.target.value)} 
                    placeholder="Chercher par client, tél, produit..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all outline-none" 
                    />
                </div>

                {/* Filter Employee */}
                <select
                    value={filterEmployee}
                    onChange={(e) => setFilterEmployee(e.target.value)}
                    className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none cursor-pointer"
                >
                    <option value="">Tous les employés</option>
                    {EMPLOYEES.map(emp => (
                    <option key={emp} value={emp}>{emp}</option>
                    ))}
                </select>

                {/* Filter Ville */}
                <select
                    value={filterVille}
                    onChange={(e) => setFilterVille(e.target.value)}
                    className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none cursor-pointer"
                >
                    <option value="">Toutes les villes</option>
                    {villes.map(v => (
                    <option key={v.id} value={v.name}>{v.name}</option>
                    ))}
                </select>

                {/* Date Range - Simplified for layout */}
                <div className="relative">
                    <input 
                      type="date"
                      value={filterStartDate}
                      onChange={(e) => setFilterStartDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                    />
                </div>
            </div>
          </div>
        </div>

        {/* KANBAN / LIST VIEW */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
             <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <RotateCcw size={18} className="text-amber-600" />
                Liste des Retours
             </h3>
          </div>

          <div className="p-6 min-h-[400px]">
            {sortedColis.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <RotateCcw size={32} className="opacity-50" />
                </div>
                <p className="font-medium text-lg text-slate-600">Aucun retour trouvé</p>
                <p className="text-sm">Modifiez vos filtres ou revenez plus tard.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {sortedColis.map((colisItem) => {
                  const product = products.find(p => p.id === colisItem.productId);
                  const ville = villes.find(v => v.id === colisItem.ville);

                  return (
                    <div 
                      key={colisItem.id} 
                      className="group bg-white rounded-xl border border-slate-200 p-4 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                      onClick={() => { setSelectedColisForTracking(colisItem); setShowTrackingModal(true); }}
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                      <div className="flex gap-4 items-start pl-2">
                        {/* Image */}
                        <div className="w-16 h-16 rounded-lg bg-slate-100 shrink-0 overflow-hidden border border-slate-100">
                          {product?.image ? (
                            <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={product.nom} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Package size={20} />
                            </div>
                          )}
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-800 truncate mb-0.5">{product?.nom || colisItem.productName}</h4>
                          <p className="text-sm text-slate-500 font-medium truncate">{colisItem.clientName}</p>
                          
                          <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                            <span className="flex items-center gap-1"><MapPin size={12} /> {ville?.name}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><User size={12} /> {colisItem.employee}</span>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                           <span className="block font-bold text-amber-600 text-lg">{colisItem.prix} <span className="text-xs">DH</span></span>
                           <span className="inline-block mt-2 px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-bold uppercase tracking-wide border border-amber-100">
                             Retour
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
      </div>

      {/* TRACKING MODAL */}
      {showTrackingModal && (
        <TrackingModal 
          colis={selectedColisForTracking} 
          onClose={() => { setShowTrackingModal(false); setSelectedColisForTracking(null); }} 
        />
      )}
    </div>
  );
}
