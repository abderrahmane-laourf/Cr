import React, { useState, useEffect } from 'react';
import { 
  Truck, Package, MapPin, Navigation, Phone, CheckCircle, 
  XCircle, Clock, Calendar, DollarSign, ChevronRight, Filter 
} from 'lucide-react';
import { employeeAPI } from '../../../services/api';

const StatCard = ({ title, value, icon: Icon, color, subValue }) => (
  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between transition-all">
    <div>
      <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{value}</h3>
      {subValue && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">{subValue}</p>}
    </div>
    <div className={`p-3 rounded-xl ${color} text-white shadow-md`}>
      <Icon size={24} />
    </div>
  </div>
);

export default function DeliveryDashboard() {
  const [stats, setStats] = useState({
    delivered: 0,
    pending: 0,
    returned: 0,
    cash: 0,
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [allColis, setAllColis] = useState([]);
  const [filteredColis, setFilteredColis] = useState([]);
  
  // Filter states
  const [filterDate, setFilterDate] = useState('');
  const [filterProduct, setFilterProduct] = useState('all');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadStats();
    loadProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filterDate, filterProduct, allColis]);

  const loadProducts = () => {
    const savedProducts = JSON.parse(localStorage.getItem('products')) || [];
    setProducts(savedProducts);
  };

  const applyFilters = () => {
    let filtered = [...allColis];

    // Filter by date
    if (filterDate) {
      filtered = filtered.filter(c => {
        const colisDate = new Date(c.dateCreated).toISOString().split('T')[0];
        return colisDate === filterDate;
      });
    }

    // Filter by product
    if (filterProduct !== 'all') {
      filtered = filtered.filter(c => c.productId === parseInt(filterProduct));
    }

    setFilteredColis(filtered);
    
    // Recalculate stats with filtered data
    const delivered = filtered.filter(c => c.stage === 'Livré-AG' || c.stage === 'Livré').length;
    const pending = filtered.filter(c => c.stage === 'Out for Delivery-AG' || c.stage === 'Packaging-AG').length;
    const returned = filtered.filter(c => c.stage === 'Annulé-AG').length;
    const cash = filtered
      .filter(c => c.stage === 'Livré-AG' || c.stage === 'Livré')
      .reduce((sum, c) => sum + (parseFloat(c.prix) || 0), 0);

    setStats({
      delivered,
      pending,
      returned,
      cash: Math.round(cash)
    });
  };

  const loadStats = () => {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    setCurrentUser(user);
    
    const savedColis = JSON.parse(localStorage.getItem('colis')) || [];
    
    // Filter only Agadir pipeline (pipelineId === 2) and delivery stages
    const agadirColis = savedColis.filter(c => c.pipelineId === 2);
    setAllColis(agadirColis);
    setFilteredColis(agadirColis);
    
    const delivered = agadirColis.filter(c => c.stage === 'Livré-AG' || c.stage === 'Livré').length;
    const pending = agadirColis.filter(c => c.stage === 'Out for Delivery-AG' || c.stage === 'Packaging-AG').length;
    const returned = agadirColis.filter(c => c.stage === 'Annulé-AG').length;
    const cash = agadirColis
      .filter(c => c.stage === 'Livré-AG' || c.stage === 'Livré')
      .reduce((sum, c) => sum + (parseFloat(c.prix) || 0), 0);

    setStats({
      delivered,
      pending,
      returned,
      cash: Math.round(cash)
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 px-4 sm:px-0 text-slate-800 dark:text-slate-200">
      {/* Header Mobile-First */}
      <div className="flex flex-col gap-2">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Truck className="text-orange-600" size={24} />
          Livraison Agadir
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">Bonjour {currentUser?.name || 'Livreur'}, prêt pour la tournée ?</p>
      </div>

      {/* MOTIVATION STATISTICS PANEL */}
      <div className="w-full bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-6 shadow-2xl shadow-blue-500/30 border border-blue-400/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-extrabold text-lg flex items-center gap-2">
            <Package className="text-blue-100" size={24} />
            Tes Gains Aujourd'hui
          </h2>
          <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <p className="text-white text-xs font-bold">
              {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
            </p>
          </div>
        </div>

        {/* Statistics Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Ch7al Rbti (Combien gagné) */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">Ch7al Rbti</p>
            <p className="text-white text-3xl font-black">
              {(() => {
                const delivered = allColis.filter(c => c.stage === 'Livré-AG' || c.stage === 'Livré');
                const earned = delivered.reduce((sum, c) => sum + (c.prix * 0.15), 0); // 15% commission
                return earned.toFixed(2);
              })()}
              <span className="text-lg ml-1 text-blue-200">DH</span>
            </p>
            <p className="text-blue-200 text-xs mt-1">
              {allColis.filter(c => c.stage === 'Livré-AG' || c.stage === 'Livré').length} colis livrés
            </p>
          </div>

          {/* Ch7al Lba9i (Combien reste) */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">Ch7al Lba9i</p>
            <p className="text-white text-3xl font-black">
              {(() => {
                const pending = allColis.filter(c => c.stage === 'Out for Delivery-AG' || c.stage === 'Packaging-AG');
                const potential = pending.reduce((sum, c) => sum + (c.prix * 0.15), 0);
                return potential.toFixed(2);
              })()}
              <span className="text-lg ml-1 text-blue-200">DH</span>
            </p>
            <p className="text-blue-200 text-xs mt-1">
              {allColis.filter(c => c.stage === 'Out for Delivery-AG' || c.stage === 'Packaging-AG').length} colis en cours
            </p>
          </div>

          {/* Total Potential */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 sm:col-span-2 lg:col-span-1">
            <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">Total Possible</p>
            <p className="text-white text-3xl font-black">
              {(() => {
                const total = allColis.reduce((sum, c) => sum + (c.prix * 0.15), 0);
                return total.toFixed(2);
              })()}
              <span className="text-lg ml-1 text-blue-200">DH</span>
            </p>
            <p className="text-blue-200 text-xs mt-1">
              {allColis.length} colis au total
            </p>
          </div>
        </div>

        {/* Progress Bar - 100% Width */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white text-sm font-bold">Progression</p>
            <p className="text-white text-sm font-black">
              {allColis.length > 0 ? Math.round((allColis.filter(c => c.stage === 'Livré-AG' || c.stage === 'Livré').length / allColis.length) * 100) : 0}%
            </p>
          </div>
          <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/30">
            <div 
              className="h-full bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 rounded-full transition-all duration-500 ease-out shadow-lg"
              style={{ 
                width: `${allColis.length > 0 ? (allColis.filter(c => c.stage === 'Livré-AG' || c.stage === 'Livré').length / allColis.length) * 100 : 0}%` 
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-blue-100 text-xs">
              {allColis.filter(c => c.stage === 'Livré-AG' || c.stage === 'Livré').length} / {allColis.length} livrés
            </p>
            <p className="text-blue-100 text-xs font-bold">
              {allColis.length > 0 ? allColis.filter(c => c.stage === 'Out for Delivery-AG' || c.stage === 'Packaging-AG').length : 0} restants
            </p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="text-slate-600 dark:text-slate-400" size={20} />
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base">Filtres</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Date Filter */}
          <div className="relative">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-200 text-sm sm:text-base"
            />
          </div>
          
          {/* Product Filter */}
          <div className="relative">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">Produit</label>
            <select
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-200 appearance-none text-sm sm:text-base"
            >
              <option value="all">Tous les produits</option>
              {products.map(product => (
                <option key={product.id} value={product.id} className="dark:bg-slate-800">
                  {product.nom}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Reset Filters Button */}
        {(filterDate || filterProduct !== 'all') && (
          <button
            onClick={() => {
              setFilterDate('');
              setFilterProduct('all');
            }}
            className="mt-3 text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-bold flex items-center gap-1"
          >
            <XCircle size={14} />
            Réinitialiser les filtres
          </button>
        )}
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <StatCard 
          title="Livrés" 
          value={stats.delivered} 
          icon={CheckCircle} 
          color="bg-emerald-500" 
          subValue={`Sur ${filteredColis.length} colis`}
        />
        <StatCard 
          title="En attente" 
          value={stats.pending} 
          icon={Clock} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Cash (DH)" 
          value={`${stats.cash} DH`} 
          icon={DollarSign} 
          color="bg-slate-800 dark:bg-slate-950/50"
        />
        <StatCard 
          title="Retours" 
          value={stats.returned} 
          icon={XCircle} 
          color="bg-red-500" 
        />
      </div>

      {/* Recent Activity / Next Stop */}
      <div>
        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-3 sm:mb-4 text-base sm:text-lg">Prochain Arrêt</h3>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 transition-all">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-base sm:text-lg">
                1
            </div>
            <div className="flex-1 w-full">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base">Mme. Fatima Zahra</h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Quartier Talborjt, Rue 12</p>
                <div className="flex gap-2 mt-2">
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold">250 DH</span>
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded text-[10px] font-bold">COD</span>
                </div>
            </div>
            <a href="tel:+212600000000" className="p-2 sm:p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/50 self-end sm:self-center">
                <Phone size={18} />
            </a>
        </div>
      </div>
    </div>
  );
}
