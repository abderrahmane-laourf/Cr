import React, { useState, useEffect } from 'react';
import { 
  Package, AlertTriangle, Eye, Calendar, 
  Search as SearchIcon, MapPin, User, Phone, RotateCcw
} from 'lucide-react';
import { productAPI, villeAPI } from '../../../services/api';

export default function Retourner() {
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
  const [filterCategory, setFilterCategory] = useState('');

  // Get Current User
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

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
    // 1. Employee Filter (STRICT: Only show my colis)
    if (currentUser.name && c.employee !== currentUser.name) return false;

    // 2. Only show "Retourner" stage from both pipelines
    const isRetourner = c.stage === 'Retourner' || c.stage === 'Retourner-AG';
    if (!isRetourner) return false;

    // 3. Search
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      const matchesName = c.clientName?.toLowerCase().includes(searchLower);
      const matchesPhone = c.tel?.toLowerCase().includes(searchLower);
      const matchesProduct = c.productName?.toLowerCase().includes(searchLower);
      if (!matchesName && !matchesPhone && !matchesProduct) return false;
    }

    // 4. Date Filter
    if (filterStartDate || filterEndDate) {
      const colisDate = new Date(c.dateCreated);
      if (filterStartDate && colisDate < new Date(filterStartDate)) return false;
      if (filterEndDate) {
        const endDate = new Date(filterEndDate);
        endDate.setHours(23, 59, 59, 999);
        if (colisDate > endDate) return false;
      }
    }

    // 5. Ville Filter
    if (filterVille && c.ville !== filterVille) return false;

    // 6. Category Filter
    if (filterCategory && c.category !== filterCategory) return false;

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
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
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
              className="w-full py-2 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-all"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 font-sans">
      <div className="w-full mx-auto max-w-[1800px]">
        
        {/* HEADER */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center text-white">
                <RotateCcw size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Pipeline Retourner</h2>
                <p className="text-xs text-slate-500">{sortedColis.length} colis à retraiter</p>
              </div>
            </div>
          </div>
          
          {/* Search & Filter */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="relative lg:col-span-2">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  value={searchText} 
                  onChange={e => setSearchText(e.target.value)} 
                  placeholder="Rechercher par nom, téléphone, produit..." 
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-100 transition-all placeholder:text-slate-400" 
                />
              </div>

              <select
                value={filterVille}
                onChange={(e) => setFilterVille(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                <option value="">Toutes les villes</option>
                {villes.map(v => (
                  <option key={v.id} value={v.name}>{v.name}</option>
                ))}
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                <option value="">Toutes les catégories</option>
                {[...new Set(products.map(p => p.category))].filter(Boolean).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            {/* Date Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="date" 
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-100 outline-none"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="date" 
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-100 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* KANBAN STAGE - RETOURNER */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xl shadow-slate-200/50">
          {/* Stage Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-amber-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
                <RotateCcw size={18} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Retourner</h3>
                <p className="text-xs text-slate-500">{sortedColis.length} colis</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
              {sortedColis.length}
            </span>
          </div>

          {/* Stage Content */}
          <div className="space-y-3 min-h-[400px]">
            {sortedColis.length === 0 ? (
              <div className="text-center py-12">
                <RotateCcw size={48} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-600 font-medium">Aucun colis à retourner</p>
                <p className="text-xs text-slate-400 mt-1">Les colis avec statut "Retourner" apparaîtront ici</p>
              </div>
            ) : (
              sortedColis.map((colisItem) => {
                const product = products.find(p => p.id === colisItem.productId);
                const ville = villes.find(v => v.id === colisItem.ville);
                const hasDateAlert = checkUrgency(colisItem);

                return (
                  <div 
                    key={colisItem.id} 
                    className={`bg-white rounded-xl p-4 border-2 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                      hasDateAlert ? 'border-red-300 bg-red-50' : 'border-slate-200'
                    }`}
                    onClick={() => { setSelectedColisForTracking(colisItem); setShowTrackingModal(true); }}
                  >
                    <div className="flex gap-3 items-start">
                      <div className="w-14 h-14 rounded-xl bg-slate-100 shrink-0 overflow-hidden border-2 border-white shadow-sm">
                        {product?.image ? (
                          <img src={product.image} className="w-full h-full object-cover" alt={product.nom} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={20} className="text-slate-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm truncate text-slate-800">{product?.nom || colisItem.productName}</h4>
                        <p className="text-xs text-slate-600 font-medium truncate">{colisItem.clientName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-500 truncate flex items-center gap-0.5">
                            <MapPin size={10} /> {ville?.name || colisItem.ville}
                          </span>
                          <span className="text-xs text-slate-500">{colisItem.tel}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-amber-600 whitespace-nowrap">{colisItem.prix} DH</p>
                        {hasDateAlert && (
                          <span className="text-[9px] text-red-600 font-bold flex items-center gap-0.5 mt-0.5">
                            <AlertTriangle size={10} /> Urgent
                          </span>
                        )}
                        <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-semibold">
                          Retourner
                        </span>
                      </div>
                    </div>
                    
                    {colisItem.dateReport && (
                      <div className={`mt-2 pt-2 border-t ${hasDateAlert ? 'border-red-200' : 'border-slate-100'}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-slate-500 flex items-center gap-1">
                            <Calendar size={10} /> Relance:
                          </span>
                          <span className={`text-[10px] font-bold ${hasDateAlert ? 'text-red-600' : 'text-slate-700'}`}>
                            {new Date(colisItem.dateReport).toLocaleDateString('fr-FR', { 
                              day: '2-digit', 
                              month: 'short', 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
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
