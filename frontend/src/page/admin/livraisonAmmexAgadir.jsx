import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, Plus, Edit2, Trash2, X, Check, Calendar, AlertCircle, 
  CheckCircle, ChevronDown, Package, Eye, EyeOff, MapPin, 
  Clock, Truck, ChevronRight, Phone, User, RotateCcw, Filter
} from 'lucide-react';
import { productAPI, villeAPI } from '../../services/api';

// --- 1. UTILITY COMPONENTS ---

const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-6 right-6 z-[60] animate-in slide-in-from-right-10 fade-in duration-300">
      <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md
        ${type === "success" ? "bg-emerald-50/90 border-emerald-200 text-emerald-800" : "bg-red-50/90 border-red-200 text-red-800"}`}>
        {type === "success" ? (
          <CheckCircle size={24} className="text-emerald-500" />
        ) : (
          <AlertCircle size={24} className="text-red-500" />
        )}
        <div>
          <h4 className="font-bold text-sm">{type === "success" ? "Succès" : "Erreur"}</h4>
          <p className="text-xs opacity-90">{message}</p>
        </div>
        <button onClick={onClose} className="ml-4 opacity-50 hover:opacity-100">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

// --- 2. FILTER TABS ---
const FilterTabs = ({ activeFilter, setActiveFilter, stats }) => {
  const tabs = [
    { id: 'all', label: 'Tous', count: stats.total, color: 'bg-slate-100 text-slate-700' },
    { id: 'ammex', label: 'Ammex', count: stats.ammex, color: 'bg-blue-100 text-blue-700' },
    { id: 'agadir', label: 'Agadir', count: stats.agadir, color: 'bg-green-100 text-green-700' },
    { id: 'delivered', label: 'Livré', count: stats.delivered, color: 'bg-emerald-100 text-emerald-700' },
    { id: 'pending', label: 'En cours', count: stats.pending, color: 'bg-amber-100 text-amber-700' },
    { id: 'returned', label: 'Retourné', count: stats.returned, color: 'bg-red-100 text-red-700' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveFilter(tab.id)}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeFilter === tab.id
              ? `${tab.color} ring-2 ring-offset-2 ring-blue-500/30`
              : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
          }`}
        >
          {tab.label}
          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
            activeFilter === tab.id ? 'bg-white/50' : 'bg-slate-200'
          }`}>
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
};

// --- 3. DELIVERY DETAIL MODAL ---

const DeliveryDetailModal = ({ isOpen, onClose, delivery, products, villes }) => {
  if (!isOpen || !delivery) return null;

  const product = products.find(p => p.id === delivery.productId);
  const ville = villes.find(v => v.id === delivery.ville);

  const getStatusConfig = () => {
    const stage = delivery.stage?.toLowerCase() || '';
    if (stage.includes('livré') || stage.includes('livre')) return { color: 'emerald', label: 'Livré' };
    if (stage.includes('retour')) return { color: 'red', label: 'Retourné' };
    if (stage.includes('annul')) return { color: 'red', label: 'Annulé' };
    if (stage.includes('out') || stage.includes('delivery')) return { color: 'blue', label: 'En livraison' };
    return { color: 'amber', label: 'En cours' };
  };

  const status = getStatusConfig();

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Détails de Livraison</h2>
            <p className="text-sm text-slate-500">ID: #{delivery.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-6 overflow-y-auto">
          {/* Product & Client Info */}
          <div className="bg-slate-50 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-200">
                {product?.image ? (
                  <img src={product.image} className="w-full h-full object-cover rounded-xl" alt={product.nom} />
                ) : (
                  <Package size={24} className="text-slate-400" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-slate-800">{product?.nom || delivery.productName || 'Produit'}</h3>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="font-bold text-emerald-600">{delivery.prix} DH</span>
                  {delivery.nbPiece > 1 && (
                    <span className="text-slate-400">• {delivery.nbPiece} pièces</span>
                  )}
                </div>
              </div>
              <span className={`px-4 py-2 rounded-xl text-sm font-bold bg-${status.color}-100 text-${status.color}-700`}>
                {status.label}
              </span>
            </div>
          </div>

          {/* Client Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-100 rounded-xl p-4">
              <div className="flex items-center gap-2 text-blue-500 mb-2">
                <User size={16} />
                <span className="text-xs font-bold uppercase">Client</span>
              </div>
              <p className="font-bold text-slate-800">{delivery.clientName}</p>
            </div>
            <div className="bg-green-100 rounded-xl p-4">
              <div className="flex items-center gap-2 text-green-500 mb-2">
                <Phone size={16} />
                <span className="text-xs font-bold uppercase">Téléphone</span>
              </div>
              <p className="font-bold text-slate-800 font-mono">{delivery.tel}</p>
            </div>
            <div className="bg-purple-100 rounded-xl p-4">
              <div className="flex items-center gap-2 text-purple-500 mb-2">
                <MapPin size={16} />
                <span className="text-xs font-bold uppercase">Ville</span>
              </div>
              <p className="font-bold text-slate-800">{ville?.name || delivery.ville}</p>
            </div>
            <div className="bg-orange-100 rounded-xl p-4">
              <div className="flex items-center gap-2 text-orange-500 mb-2">
                <Truck size={16} />
                <span className="text-xs font-bold uppercase">Pipeline</span>
              </div>
              <p className="font-bold text-slate-800">{delivery.pipelineId === 2 ? 'Agadir' : 'Ammex'}</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-slate-400" />
              <h4 className="font-bold text-slate-700 uppercase text-xs tracking-wider">Historique</h4>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Date de création</span>
                <span className="font-medium text-slate-700">
                  {delivery.dateCreated 
                    ? new Date(delivery.dateCreated).toLocaleDateString("fr-FR", { day: '2-digit', month: 'long', year: 'numeric' })
                    : 'N/A'
                  }
                </span>
              </div>
              {delivery.dateReport && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Date de relance</span>
                  <span className="font-medium text-amber-600">
                    {new Date(delivery.dateReport).toLocaleDateString("fr-FR", { day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Comments */}
          {delivery.commentaire && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-700 uppercase text-xs tracking-wider">Commentaire</h4>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <p className="text-sm text-amber-800">{delivery.commentaire}</p>
              </div>
            </div>
          )}
        </div>

        <div className="px-8 py-5 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 rounded-xl text-slate-600 font-semibold bg-white border border-slate-200 hover:bg-slate-100 transition-all"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// --- 4. DELIVERY CARD COMPONENT ---

const DeliveryCard = ({ delivery, products, villes, onView, onDelete }) => {
  const product = products.find(p => p.id === delivery.productId);
  const ville = villes.find(v => v.id === delivery.ville);

  const getStatusConfig = () => {
    const stage = delivery.stage?.toLowerCase() || '';
    if (stage.includes('livré') || stage.includes('livre')) {
      return { bg: 'bg-emerald-100 border-emerald-300', badge: 'bg-white/50 text-emerald-800', label: 'Livré', icon: CheckCircle, iconColor: 'text-emerald-600' };
    }
    if (stage.includes('retour')) {
      return { bg: 'bg-red-100 border-red-300', badge: 'bg-white/50 text-red-800', label: 'Retourné', icon: RotateCcw, iconColor: 'text-red-600' };
    }
    if (stage.includes('annul')) {
      return { bg: 'bg-slate-100 border-slate-300', badge: 'bg-white/50 text-slate-800', label: 'Annulé', icon: X, iconColor: 'text-slate-600' };
    }
    if (stage.includes('out') || stage.includes('delivery')) {
      return { bg: 'bg-blue-100 border-blue-300', badge: 'bg-white/50 text-blue-800', label: 'En livraison', icon: Truck, iconColor: 'text-blue-600' };
    }
    return { bg: 'bg-amber-100 border-amber-300', badge: 'bg-white/50 text-amber-800', label: 'En cours', icon: Clock, iconColor: 'text-amber-600' };
  };

  const status = getStatusConfig();
  const StatusIcon = status.icon;
  const isAgadir = delivery.pipelineId === 2;

  return (
    <div
      className={`group relative rounded-2xl border-2 p-5 transition-all duration-300 hover:shadow-lg cursor-pointer ${status.bg}`}
      onClick={() => onView(delivery)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* Product Image */}
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-200 overflow-hidden">
              {product?.image ? (
                <img src={product.image} className="w-full h-full object-cover" alt={product.nom} />
              ) : (
                <Package size={20} className="text-slate-400" />
              )}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center bg-white shadow-sm ${status.iconColor}`}>
              <StatusIcon size={14} />
            </div>
          </div>

          {/* Delivery Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-bold text-slate-800 truncate">{delivery.clientName}</h3>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${status.badge}`}>
                {status.label}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isAgadir ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                {isAgadir ? 'AGADIR' : 'AMMEX'}
              </span>
            </div>
            <p className="text-sm text-slate-600 line-clamp-1 mb-2">{product?.nom || delivery.productName}</p>
            <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {ville?.name || delivery.ville}
              </span>
              <span className="flex items-center gap-1">
                <Phone size={12} />
                {delivery.tel}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {delivery.dateCreated ? new Date(delivery.dateCreated).toLocaleDateString("fr-FR", { day: '2-digit', month: 'short' }) : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Price & Actions */}
        <div className="flex flex-col items-end gap-2">
          <span className="text-lg font-bold text-emerald-600">{delivery.prix} DH</span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView(delivery);
              }}
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition"
            >
              <Eye size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(delivery);
              }}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition"
            >
              <Trash2 size={16} />
            </button>
            <ChevronRight size={18} className="text-slate-400 ml-1" />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 5. MAIN PAGE COMPONENT ---

const LivraisonAmmexAgadir = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [products, setProducts] = useState([]);
  const [villes, setVilles] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, villesData] = await Promise.all([
        productAPI.getAll().catch(() => []),
        villeAPI.getAll().catch(() => [])
      ]);
      
      setProducts(productsData);
      setVilles(villesData);

      // Load deliveries from localStorage
      const savedColis = JSON.parse(localStorage.getItem('colis') || '[]');
      // Filter for both Ammex (pipelineId: 1) and Agadir (pipelineId: 2)
      const allDeliveries = savedColis.filter(c => c.pipelineId === 1 || c.pipelineId === 2);
      setDeliveries(allDeliveries);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleDeleteDelivery = (delivery) => {
    if (window.confirm(`Supprimer la livraison pour ${delivery.clientName}?`)) {
      const updatedDeliveries = deliveries.filter(d => d.id !== delivery.id);
      setDeliveries(updatedDeliveries);
      
      // Update localStorage
      const allColis = JSON.parse(localStorage.getItem('colis') || '[]');
      const updatedColis = allColis.filter(c => c.id !== delivery.id);
      localStorage.setItem('colis', JSON.stringify(updatedColis));
      
      setToast({ message: "Livraison supprimée", type: "success" });
    }
  };

  // Calculate stats
  const stats = {
    total: deliveries.length,
    ammex: deliveries.filter(d => d.pipelineId === 1).length,
    agadir: deliveries.filter(d => d.pipelineId === 2).length,
    delivered: deliveries.filter(d => {
      const stage = d.stage?.toLowerCase() || '';
      return stage.includes('livré') || stage.includes('livre');
    }).length,
    pending: deliveries.filter(d => {
      const stage = d.stage?.toLowerCase() || '';
      return !stage.includes('livré') && !stage.includes('livre') && !stage.includes('retour') && !stage.includes('annul');
    }).length,
    returned: deliveries.filter(d => {
      const stage = d.stage?.toLowerCase() || '';
      return stage.includes('retour');
    }).length,
  };

  // Filter deliveries
  const filteredDeliveries = deliveries.filter((delivery) => {
    // Search filter
    const matchesSearch =
      delivery.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.tel?.includes(searchTerm) ||
      delivery.productName?.toLowerCase().includes(searchTerm.toLowerCase());

    // Category filter
    let matchesCategory = true;
    const stage = delivery.stage?.toLowerCase() || '';
    
    if (activeFilter === 'ammex') {
      matchesCategory = delivery.pipelineId === 1;
    } else if (activeFilter === 'agadir') {
      matchesCategory = delivery.pipelineId === 2;
    } else if (activeFilter === 'delivered') {
      matchesCategory = stage.includes('livré') || stage.includes('livre');
    } else if (activeFilter === 'pending') {
      matchesCategory = !stage.includes('livré') && !stage.includes('livre') && !stage.includes('retour') && !stage.includes('annul');
    } else if (activeFilter === 'returned') {
      matchesCategory = stage.includes('retour');
    }

    // Date filter
    let matchesDate = true;
    if (dateFilter) {
      const deliveryDate = delivery.dateCreated ? new Date(delivery.dateCreated).toISOString().split('T')[0] : '';
      matchesDate = deliveryDate === dateFilter;
    }

    return matchesSearch && matchesCategory && matchesDate;
  });

  // Sort by date (most recent first)
  const sortedDeliveries = filteredDeliveries.sort((a, b) => {
    return new Date(b.dateCreated || 0) - new Date(a.dateCreated || 0);
  });

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8 font-sans text-slate-800 dark:text-slate-200">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="glass-card p-6 md:p-8 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Truck size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Livraisons
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Ammex & Agadir • {stats.total} livraisons
              </p>
            </div>
          </div>
        </div>

        {/* Search & Date Filter */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par client, téléphone, produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-6">
          <FilterTabs activeFilter={activeFilter} setActiveFilter={setActiveFilter} stats={stats} />
        </div>
      </div>

      {/* Delivery Grid */}
      {sortedDeliveries.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Package size={48} className="text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-400">Aucune livraison trouvée</h3>
          <p className="text-sm text-slate-400 mt-1">Aucune livraison ne correspond à vos critères</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sortedDeliveries.map((delivery) => (
            <DeliveryCard
              key={delivery.id}
              delivery={delivery}
              products={products}
              villes={villes}
              onView={(d) => setSelectedDelivery(d)}
              onDelete={handleDeleteDelivery}
            />
          ))}
        </div>
      )}

      <DeliveryDetailModal 
        isOpen={!!selectedDelivery} 
        onClose={() => setSelectedDelivery(null)} 
        delivery={selectedDelivery}
        products={products}
        villes={villes}
      />
    </div>
  );
};

export default LivraisonAmmexAgadir;
