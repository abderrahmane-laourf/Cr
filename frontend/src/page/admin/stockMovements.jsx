import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, Plus, Calendar, Filter, X, Check, ChevronDown,
  AlertTriangle, ArrowUpCircle, ArrowDownCircle
} from 'lucide-react';

import { stockMovementAPI, productAPI } from '../../services/api';
import SpotlightCard from '../../util/SpotlightCard';

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
};

// Stock Adjustment Modal
const StockAdjustmentModal = ({ isOpen, onClose, onSave, products }) => {
  const [formData, setFormData] = useState({
    productId: '',
    type: 'Entrée',
    reason: '',
    quantity: '',
    note: ''
  });

  const entryReasons = [
    'Correction de stock'
  ];

  const exitReasons = [
    'Vente hors-site',
    'Cassé / Abimé',
    'Vol / Perte',
    'Cadeau / Marketing',
    'Périmé',
    'Correction de stock'
  ];

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Auto-select reason when type changes to Entrée
    if (field === 'type') {
      if (value === 'Entrée') {
        setFormData(prev => ({ ...prev, reason: 'Correction de stock' }));
      } else {
        setFormData(prev => ({ ...prev, reason: '' }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.productId || !formData.quantity || !formData.reason) return;

    const selectedProduct = products.find(p => String(p.id) === String(formData.productId));
    const quantity = formData.type === 'Sortie' ? -Math.abs(parseFloat(formData.quantity)) : Math.abs(parseFloat(formData.quantity));

    onSave({
      ...formData,
      productName: selectedProduct?.nom,
      quantity,
      date: new Date().toISOString().slice(0, 10),
      warehouse: 'Magasin Central', // Default warehouse
      userId: '1', // Current user
      userName: 'Bernard Anouith',
      userAvatar: 'https://i.pravatar.cc/150?img=33'
    });
    
    // Reset form
    setFormData({
      productId: '',
      type: 'Entrée',
      reason: '',
      quantity: '',
      note: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  const reasons = formData.type === 'Sortie' ? exitReasons : entryReasons;

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <SpotlightCard theme="light" className="w-full max-w-2xl flex flex-col animate-in zoom-in-95 duration-200 !p-0 bg-white/95 dark:bg-slate-900">
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
          <h2 className="text-2xl font-bold text-[#1e3a8a]">Ajuster le Stock</h2>
          <button onClick={onClose} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition">
            <X size={20}/>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Product Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">
              Produit <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <select 
                className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none appearance-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all cursor-pointer"
                value={formData.productId}
                onChange={e => handleFieldChange('productId', e.target.value)}
                required
              >
                <option value="">-- Choisir un produit --</option>
                {products?.map(product => (
                  <option key={product.id} value={product.id} className="dark:bg-slate-800">{product.nom}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>

          {/* Movement Type Toggle */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">
              Type de Mouvement <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleFieldChange('type', 'Entrée')}
                className={`py-3 px-4 rounded-xl font-bold text-sm transition-all ${
                  formData.type === 'Entrée'
                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-500'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <ArrowUpCircle className="inline mr-2" size={18} />
                Entrée (+)
              </button>
              <button
                type="button"
                onClick={() => handleFieldChange('type', 'Sortie')}
                className={`py-3 px-4 rounded-xl font-bold text-sm transition-all ${
                  formData.type === 'Sortie'
                    ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-2 border-red-500'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <ArrowDownCircle className="inline mr-2" size={18} />
                Sortie (-)
              </button>
            </div>
          </div>

          {/* Reason Selection - Only show for Sortie */}
          {formData.type === 'Sortie' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                Motif <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <select 
                  className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none appearance-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all cursor-pointer"
                  value={formData.reason}
                  onChange={e => handleFieldChange('reason', e.target.value)}
                  required
                >
                  <option value="">-- Choisir un motif --</option>
                  {reasons.map(reason => (
                    <option key={reason} value={reason} className="dark:bg-slate-800">{reason}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>
          )}

          {/* Info for Entrée */}
          {formData.type === 'Entrée' && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-start gap-3">
              <ArrowUpCircle className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Correction de stock</h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                  Cette entrée sera enregistrée comme une correction de stock automatiquement.
                </p>
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">
              Quantité <span className="text-rose-400">*</span>
            </label>
            <input 
              type="number" 
              min="1"
              step="1"
              placeholder="Ex: 10" 
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all"
              value={formData.quantity}
              onChange={e => handleFieldChange('quantity', e.target.value)}
              required
            />
          </div>

          {/* Warning Alert for Sortie */}
          {formData.type === 'Sortie' && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="text-sm font-bold text-orange-800 dark:text-orange-300">Attention</h4>
                <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
                  Cette action va réduire le stock physique. Assurez-vous que le produit est bien sorti du dépôt.
                </p>
              </div>
            </div>
          )}

          {/* Note */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">
              Note (Optionnel)
            </label>
            <textarea 
              rows="3"
              placeholder="Ajouter des détails supplémentaires..." 
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all resize-none"
              value={formData.note}
              onChange={e => handleFieldChange('note', e.target.value)}
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              Annuler
            </button>
            <button 
              type="submit"
              className="flex-1 py-3 rounded-xl bg-[#1e3a8a] text-white font-semibold hover:bg-[#1e40af] shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
            >
              <Check size={20} />
              Confirmer
            </button>
          </div>
        </form>
      </SpotlightCard>
    </div>,
    document.body
  );
};

// Main Page Component
export default function StockMovementsPage() {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [movementsData, productsData] = await Promise.all([
        stockMovementAPI.getAll(),
        productAPI.getAll()
      ]);
      setMovements(movementsData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMovement = async (movement) => {
    try {
      await stockMovementAPI.create(movement);
      loadData();
    } catch (error) {
      console.error('Error adding movement:', error);
    }
  };

  const filteredMovements = movements.filter(movement => {
    const matchesSearch = movement.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movement.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || movement.type === typeFilter;
    return matchesSearch && matchesType;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="min-h-screen bg-transparent p-8 font-sans text-slate-800 dark:text-slate-200">
      <div className="max-w-[1600px] mx-auto">
        
        {/* HEADER */}
        <SpotlightCard theme="light" className="mb-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-[#2563EB] tracking-tight">Historique des Mouvements</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Suivez toutes les entrées et sorties de stock.</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1e3a8a] text-white rounded-xl hover:bg-[#1e40af] transition-all shadow-lg shadow-blue-900/20 font-semibold"
            >
              <Plus size={20} /> Nouvel Ajustement
            </button>
          </div>
          
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mt-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2563EB]/50" size={20} />
              <input 
                type="text" 
                placeholder="Rechercher un mouvement..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] text-slate-900 dark:text-white transition-all" 
              />
            </div>
            
            <div className="relative">
              <select 
                value={typeFilter} 
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full md:w-48 pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all appearance-none cursor-pointer"
              >
                <option value="All" className="dark:bg-slate-800">Tous les types</option>
                <option value="Entrée" className="dark:bg-slate-800">Entrées</option>
                <option value="Sortie" className="dark:bg-slate-800">Sorties</option>
              </select>
              <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>
        </SpotlightCard>

        {/* MOVEMENTS TABLE */}
        <SpotlightCard theme="light" className="p-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <div className="overflow-x-auto">
             <table className="w-full">
              <thead>
                <tr className="bg-[#1e3a8a]/5 dark:bg-[#1e3a8a]/20 border-b border-[#1e3a8a]/10 dark:border-slate-700">
                  <th className="text-left px-6 py-4 text-xs font-bold text-[#1e3a8a] dark:text-blue-400 uppercase tracking-wider">Date</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-[#1e3a8a] dark:text-blue-400 uppercase tracking-wider">Produit</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-[#1e3a8a] dark:text-blue-400 uppercase tracking-wider">Entrepôt</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-[#1e3a8a] dark:text-blue-400 uppercase tracking-wider">Type</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-[#1e3a8a] dark:text-blue-400 uppercase tracking-wider">Motif</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-[#1e3a8a] dark:text-blue-400 uppercase tracking-wider">Quantité</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-[#1e3a8a] dark:text-blue-400 uppercase tracking-wider">Utilisateur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                {filteredMovements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        {formatDate(movement.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{movement.productName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg font-medium">
                        {movement.warehouse || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {movement.type === 'Sortie' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-100 dark:border-red-800">
                          <ArrowDownCircle size={14} />
                          Sortie
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800">
                          <ArrowUpCircle size={14} />
                          Entrée
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {movement.reason}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-lg font-black ${
                        movement.quantity > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={movement.userAvatar} 
                          alt={movement.userName}
                          className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-slate-700 shadow-sm"
                        />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{movement.userName}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredMovements.length === 0 && (
              <div className="p-10 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center">
                <Search size={40} className="mb-2 opacity-20" />
                <p>Aucun mouvement trouvé</p>
              </div>
            )}
          </div>
        </SpotlightCard>

        {/* Modal */}
        <StockAdjustmentModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleAddMovement}
          products={products}
        />
      </div>
    </div>
  );
}
