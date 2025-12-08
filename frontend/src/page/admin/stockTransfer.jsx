import React, { useState, useEffect } from 'react';
import { 
  Calendar, Package, Truck, ArrowRight, ChevronDown, AlertCircle, Plus, X, Search
} from 'lucide-react';

import { 
  stockTransferAPI, stockMovementAPI, productAPI, warehouseAPI 
} from '../../services/api';

// Helper: Format Date
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// ----------------------------------------------------------------------
// 2. MODAL FORMULAIRE
// ----------------------------------------------------------------------
const TransferModal = ({ isOpen, onClose, onSave, products, warehouses, isSaving }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    productId: '',
    quantity: '',
    sourceWarehouse: '',
    destinationWarehouse: ''
  });

  const [error, setError] = useState('');

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  // Get current stock for selected product in selected warehouse
  const getStockInWarehouse = (productId, warehouseName) => {
    if (!productId || !warehouseName) return null;
    const product = products.find(p => String(p.id) === String(productId));
    if (!product) return null;
    
    // Check if product is in this warehouse
    if (product.magasin === warehouseName) {
      return product.stock || 0;
    }
    return 0; // Product not in this warehouse
  };

  const selectedProduct = products.find(p => String(p.id) === String(formData.productId));
  const sourceStock = getStockInWarehouse(formData.productId, formData.sourceWarehouse);
  const destStock = getStockInWarehouse(formData.productId, formData.destinationWarehouse);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.sourceWarehouse === formData.destinationWarehouse) {
      setError('Impossible de transférer vers le même entrepôt.');
      return;
    }
    if (!formData.productId || !formData.quantity || !formData.sourceWarehouse || !formData.destinationWarehouse) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    // Check if enough stock in source
    if (sourceStock !== null && parseInt(formData.quantity) > sourceStock) {
      setError(`Stock insuffisant dans ${formData.sourceWarehouse}. Disponible: ${sourceStock}`);
      return;
    }
    
    onSave({
      ...formData,
      productName: selectedProduct?.nom,
      quantity: parseInt(formData.quantity),
      status: 'Complété',
      userId: '1',
      userName: 'Admin'
    });

    setFormData({
      date: new Date().toISOString().slice(0, 10),
      productId: '',
      quantity: '',
      sourceWarehouse: '',
      destinationWarehouse: ''
    });
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col animate-in zoom-in-95 duration-200">
        
          {/* Header */}
         <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Truck className="text-blue-600" size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Nouveau Transfert</h2>
              <p className="text-xs text-slate-500 mt-0.5">Déplacer des produits entre entrepôts</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition">
            <X size={20}/>
          </button>
        </div>

        {/* Form */}
        {/* ------------------------------------- */}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                Date <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="date" 
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  value={formData.date}
                  onChange={e => handleFieldChange('date', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Product */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                Produit <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select 
                  className="w-full pl-12 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 outline-none appearance-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  value={formData.productId}
                  onChange={e => handleFieldChange('productId', e.target.value)}
                  required
                >
                  <option value="">-- Choisir un produit --</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>{product.nom}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                Quantité <span className="text-red-400">*</span>
              </label>
              <input 
                type="number" 
                min="1"
                placeholder="Ex: 10" 
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                value={formData.quantity}
                onChange={e => handleFieldChange('quantity', e.target.value)}
                required
              />
            </div>

            {/* Source */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                De l'entrepôt <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select 
                  className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 outline-none appearance-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  value={formData.sourceWarehouse}
                  onChange={e => handleFieldChange('sourceWarehouse', e.target.value)}
                  required
                >
                  <option value="">-- Choisir --</option>
                  {warehouses.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
              {/* Show source stock */}
              {formData.productId && formData.sourceWarehouse && sourceStock !== null && (
                <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg">
                  <Package size={14} className="text-blue-600" />
                  <span className="text-xs font-semibold text-blue-700">
                    Stock actuel: <span className="font-black">{sourceStock}</span> {selectedProduct?.uniteCalcul || 'unités'}
                  </span>
                </div>
              )}
            </div>

            {/* Destination */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                Vers l'entrepôt <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select 
                  className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 outline-none appearance-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  value={formData.destinationWarehouse}
                  onChange={e => handleFieldChange('destinationWarehouse', e.target.value)}
                  required
                >
                  <option value="">-- Choisir --</option>
                  {warehouses.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
              {/* Show destination stock */}
              {formData.productId && formData.destinationWarehouse && destStock !== null && (
                <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-lg">
                  <Package size={14} className="text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-700">
                    Stock actuel: <span className="font-black">{destStock}</span> {selectedProduct?.uniteCalcul || 'unités'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-colors">
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={isSaving}
              className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold shadow-lg shadow-blue-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isSaving ? 'Traitement...' : 'Confirmer le transfert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 3. PAGE PRINCIPALE
// ----------------------------------------------------------------------
export default function StockTransferPage() {
  const [transfers, setTransfers] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [transfersData, productsData, warehousesData] = await Promise.all([
        stockTransferAPI.getAll(),
        productAPI.getAll(),
        warehouseAPI.getAll()
      ]);
      setTransfers(transfersData);
      setProducts(productsData);
      setWarehouses(warehousesData);
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  // LOGIQUE COMPLETE : TRANSFERT + MOUVEMENTS AUTOMATIQUES
  const handleProcessTransfer = async (transferData) => {
    setIsSaving(true);
    try {
      // 1. Créer l'enregistrement
      const newTransfer = await stockTransferAPI.create(transferData);

      // 2. Créer les Mouvements (Sortie / Entrée)
      const currentUser = { id: '1', name: 'Admin', avatar: '' };

      // A. Sortie (-)
      await stockMovementAPI.create({
        productId: transferData.productId,
        productName: transferData.productName,
        type: 'Sortie',
        reason: `Transfert vers ${transferData.destinationWarehouse}`,
        quantity: -Math.abs(transferData.quantity),
        warehouse: transferData.sourceWarehouse,
        date: transferData.date,
        userId: currentUser.id,
        userName: currentUser.name,
        note: `Ref Transfert #${newTransfer.id}`
      });

      // B. Entrée (+)
      await stockMovementAPI.create({
        productId: transferData.productId,
        productName: transferData.productName,
        type: 'Entrée',
        reason: `Transfert depuis ${transferData.sourceWarehouse}`,
        quantity: Math.abs(transferData.quantity),
        warehouse: transferData.destinationWarehouse,
        date: transferData.date,
        userId: currentUser.id,
        userName: currentUser.name,
        note: `Ref Transfert #${newTransfer.id}`
      });

      await loadData();
      setIsModalOpen(false);

    } catch (error) {
      console.error('Erreur lors du transfert:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredTransfers = transfers.filter(transfer =>
    transfer.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.sourceWarehouse?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.destinationWarehouse?.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] p-6 font-sans text-slate-800">
      
      {/* Header Page */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Transferts de Stock</h1>
          <p className="text-slate-500 text-sm mt-1">Gérez les déplacements de produits entre vos dépôts.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
        >
          <Plus size={18} /> Nouveau Transfert
        </button>
      </div>

      {/* Barre de Recherche */}
      <div className="mb-6 relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Rechercher (produit, dépôt...)" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-sm" 
        />
      </div>

      {/* TABLEAU (Sans Action ni Status) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Produit</th>
                <th className="px-6 py-4 font-semibold text-center">Quantité</th>
                <th className="px-6 py-4 font-semibold">Source</th>
                <th className="px-6 py-4 font-semibold"></th>
                <th className="px-6 py-4 font-semibold">Destination</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {filteredTransfers.map((transfer) => (
                <tr key={transfer.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4 text-slate-500 font-medium">
                    {formatDate(transfer.date)}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700">
                    {transfer.productName}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg font-bold text-xs border border-blue-100">
                      {transfer.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {transfer.sourceWarehouse}
                  </td>
                  <td className="px-6 py-4 text-center text-slate-300">
                    <ArrowRight size={16} className="mx-auto group-hover:text-blue-400 transition-colors" />
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">
                    {transfer.destinationWarehouse}
                  </td>
                </tr>
              ))}
              
              {filteredTransfers.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Truck size={32} className="opacity-20" />
                      <p>Aucun transfert trouvé</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TransferModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleProcessTransfer}
        products={products}
        warehouses={warehouses}
        isSaving={isSaving}
      />
    </div>
  );
}