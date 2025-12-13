import React, { useState, useEffect } from 'react';
import { Package, Plus, X, Trash2, Calendar, DollarSign, Eye, Search, ArrowRight, Filter } from 'lucide-react';
import { productionAPI, productAPI } from '../../services/api';
import Swal from 'sweetalert2';
import SpotlightCard from '../../util/SpotlightCard';

export default function ProductionManagement() {
  const [productions, setProductions] = useState([]);
  const [products, setProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProduction, setSelectedProduction] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productionsData, productsData] = await Promise.all([
        productionAPI.getAll(),
        productAPI.getAll()
      ]);
      
      setProductions(productionsData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleAddProduction = async (newProduction) => {
    try {
      await productionAPI.create(newProduction);
      loadData();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding production:', error);
    }
  };

  const handleDeleteProduction = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette production?')) {
      try {
        await productionAPI.delete(id);
        loadData();
      } catch (error) {
        console.error('Error deleting production:', error);
      }
    }
  };

  const handleViewProduction = (production) => {
    setSelectedProduction(production);
    setShowViewModal(true);
  };

  // Filter productions
  const filteredProductions = productions.filter(prod => {
    // Text search filter
    if (searchText) {
      const product = products.find(p => p.id === prod.productId);
      const productName = product?.nom?.toLowerCase() || '';
      const searchLower = searchText.toLowerCase();
      if (!productName.includes(searchLower)) {
        return false;
      }
    }
    
    // Date filter
    if (searchDate) {
      const prodDate = new Date(prod.date).toISOString().split('T')[0];
      if (prodDate !== searchDate) {
        return false;
      }
    }
    
    return true;
  });

  return (
    <div className="w-full min-h-screen bg-transparent p-6 space-y-8 animate-[fade-in_0.6s_ease-out]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-transparent p-6 rounded-3xl border border-slate-100/50">
        <div>
          <h1 className="text-2xl font-extrabold text-[#018790]">Gestion de Production</h1>
          <p className="text-slate-500">Gérez vos opérations de fabrication</p>
        </div>
        <div className="mt-4 sm:mt-0">
            <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#005461] hover:bg-[#016f76] text-white rounded-xl transition-all shadow-lg shadow-cyan-900/20 font-bold"
            >
                <Plus size={20} /> Nouvelle Production
            </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* Search */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Search size={12}/> Recherche</label>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#018790]/50" size={18} />
                    <input 
                        type="text" 
                        placeholder="Rechercher par produit..." 
                        value={searchText} 
                        onChange={(e) => setSearchText(e.target.value)} 
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#018790]/10 focus:border-[#018790] transition-all" 
                    />
                </div>
            </div>
            
            {/* Date Filter */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Calendar size={12}/> Date</label>
                <input
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#018790]/10 focus:border-[#018790] transition-all"
                />
            </div>

            {/* Clear Filters */}
            {(searchText || searchDate) && (
              <button
                onClick={() => {
                  setSearchText('');
                  setSearchDate('');
                }}
                className="px-4 py-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 text-sm font-bold transition-all flex items-center justify-center gap-2 h-[42px]"
              >
                <X size={16} />
                Effacer les filtres
              </button>
            )}
         </div>
      </div>

      {/* Productions Table */}
      <SpotlightCard theme="light" className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#005461]/5 border-b border-[#005461]/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#005461] uppercase tracking-wider">#</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#005461] uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#005461] uppercase tracking-wider">Produit</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#005461] uppercase tracking-wider">Quantité</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#005461] uppercase tracking-wider">Coût Unitaire</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#005461] uppercase tracking-wider">Coût Total</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-[#005461] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProductions.map((prod, index) => {
                const product = products.find(p => p.id === prod.productId);
                const totalCost = prod.unitCost * prod.quantity;
                
                return (
                  <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 text-sm text-slate-500 font-mono">{index + 1}</td>
                    <td className="px-6 py-4 text-sm text-slate-800 font-medium">
                      {new Date(prod.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                <Package size={16} />
                            </div>
                            <span className="text-sm font-bold text-slate-700">{product?.nom || 'N/A'}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-800 font-medium">
                        {prod.quantity} <span className="text-xs text-slate-400">{product?.uniteCalcul}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-emerald-600 font-bold">
                      {prod.unitCost.toFixed(2)} DH
                    </td>
                    <td className="px-6 py-4 text-sm text-[#018790] font-bold">
                      {totalCost.toFixed(2)} DH
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewProduction(prod)}
                          className="p-2 text-slate-400 hover:text-[#018790] hover:bg-[#018790]/10 rounded-lg transition-colors"
                          title="Voir détails"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduction(prod.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredProductions.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>Aucune production trouvée</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SpotlightCard>

      {/* Add Production Modal */}
      {showAddModal && (
        <AddProductionModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddProduction}
          products={products}
        />
      )}

      {/* View Production Modal */}
      {showViewModal && selectedProduction && (
        <ProductionDetailsModal
          production={selectedProduction}
          products={products}
          onClose={() => {
            setShowViewModal(false);
            setSelectedProduction(null);
          }}
        />
      )}
    </div>
  );
}

// Add Production Modal Component
function AddProductionModal({ onClose, onAdd, products }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    productId: '',
    quantity: 1,
    rawMaterials: []
  });

  const [currentMaterial, setCurrentMaterial] = useState({
    productId: '',
    quantity: 1
  });

  // Calculate costs
  const calculateCosts = () => {
    let totalMaterialCost = 0;
    
    formData.rawMaterials.forEach(material => {
      const product = products.find(p => p.id === material.productId);
      if (product) {
        totalMaterialCost += product.prixAchat * material.quantity;
      }
    });

    const unitCost = formData.quantity > 0 ? totalMaterialCost / formData.quantity : 0;

    return { totalMaterialCost, unitCost };
  };

  const { totalMaterialCost, unitCost } = calculateCosts();

  const handleAddMaterial = () => {
    if (!currentMaterial.productId || currentMaterial.quantity <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Attention',
        text: 'Veuillez sélectionner une matière première et une quantité valide',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    // Vérifier le stock disponible
    const selectedProduct = products.find(p => p.id === currentMaterial.productId);
    const stockDisponible = selectedProduct?.stock || 0;
    
    if (currentMaterial.quantity > stockDisponible) {
      Swal.fire({
        icon: 'error',
        title: 'Stock insuffisant!',
        html: `
          <div class="text-left">
            <p class="mb-2"><strong>Stock disponible:</strong> ${stockDisponible} ${selectedProduct?.uniteCalcul}</p>
            <p class="mb-2"><strong>Quantité demandée:</strong> ${currentMaterial.quantity} ${selectedProduct?.uniteCalcul}</p>
            <p class="text-red-600 font-semibold mt-3">⚠️ Veuillez réduire la quantité.</p>
          </div>
        `,
        confirmButtonColor: '#ef4444'
      });
      return;
    }

    setFormData({
      ...formData,
      rawMaterials: [...formData.rawMaterials, { ...currentMaterial }]
    });

    setCurrentMaterial({ productId: '', quantity: 1 });
  };

  const handleRemoveMaterial = (index) => {
    setFormData({
      ...formData,
      rawMaterials: formData.rawMaterials.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = () => {
    if (!formData.productId || !formData.quantity || formData.rawMaterials.length === 0) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const production = {
      id: Date.now().toString(),
      date: formData.date,
      productId: formData.productId,
      quantity: parseInt(formData.quantity),
      rawMaterials: formData.rawMaterials,
      unitCost: unitCost,
      totalCost: totalMaterialCost
    };

    onAdd(production);
  };

  // Filter products - only "Fabriqué" for final product, only "Matière Première" for raw materials
  const finalProducts = products.filter(p => p.type === 'Fabriqué');
  const rawMaterialProducts = products.filter(p => p.type === 'Matière Première');

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <SpotlightCard theme="light" className="w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col !p-0 !bg-white/90">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-[#005461]/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#005461]/10 rounded-lg flex items-center justify-center">
              <Plus className="w-6 h-6 text-[#005461]" />
            </div>
            <h2 className="text-xl font-bold text-[#005461]">Nouvelle Production</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-full transition shadow-sm">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
          {/* Date and Product Selection */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                Date de Production *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:bg-white focus:border-[#018790] focus:ring-4 focus:ring-[#018790]/10 outline-none transition-all font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                Produit Final *
              </label>
              <select
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:bg-white focus:border-[#018790] focus:ring-4 focus:ring-[#018790]/10 outline-none transition-all font-bold"
              >
                <option value="">Sélectionner un produit</option>
                {finalProducts.map(p => (
                  <option key={p.id} value={p.id}>{p.nom}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
              Quantité à Produire *
            </label>
            <input
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:bg-white focus:border-[#018790] focus:ring-4 focus:ring-[#018790]/10 outline-none transition-all font-bold"
            />
          </div>

          {/* Raw Materials Section */}
          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider flex items-center gap-2">
                <Package size={16} className="text-[#018790]" />
                Matières Premières Utilisées
            </h3>
            
            {/* Add Material Form */}
            <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                    Matière Première
                  </label>
                  <select
                    value={currentMaterial.productId}
                    onChange={(e) => setCurrentMaterial({ ...currentMaterial, productId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 focus:border-[#018790] focus:ring-2 focus:ring-[#018790]/10 outline-none transition-all font-medium"
                  >
                    <option value="">Sélectionner</option>
                    {rawMaterialProducts.map(p => (
                      <option key={p.id} value={p.id}>{p.nom}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                    Quantité
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      value={currentMaterial.quantity}
                      onChange={(e) => setCurrentMaterial({ ...currentMaterial, quantity: parseFloat(e.target.value) })}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 focus:border-[#018790] focus:ring-2 focus:ring-[#018790]/10 outline-none transition-all font-bold"
                    />
                    
                    {/* Stock disponible badge */}
                    {currentMaterial.productId && (() => {
                      const selectedProduct = rawMaterialProducts.find(p => p.id === currentMaterial.productId);
                      const stockActuel = selectedProduct?.stock || 0;
                      const isLowStock = currentMaterial.quantity > stockActuel;
                      
                      return (
                        <div className={`px-3 py-2.5 rounded-xl flex items-center gap-1.5 border ${isLowStock ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
                          <Package size={16} className={isLowStock ? 'text-red-600' : 'text-emerald-600'} />
                          <span className={`text-xs font-bold ${isLowStock ? 'text-red-700' : 'text-emerald-700'}`}>
                            {stockActuel}
                          </span>
                        </div>
                      );
                    })()}
                    
                    <button
                      onClick={handleAddMaterial}
                      className="px-4 py-2.5 bg-[#005461] text-white rounded-xl hover:bg-[#016f76] transition-all font-semibold shadow-lg shadow-cyan-900/20"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Materials List */}
            <div className="space-y-2">
              {formData.rawMaterials.map((material, index) => {
                const product = products.find(p => p.id === material.productId);
                const cost = product ? product.prixAchat * material.quantity : 0;

                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                    <div className="flex-1">
                      <span className="font-bold text-slate-800">{product?.nom}</span>
                      <span className="text-sm text-slate-500 ml-2">
                        x {material.quantity} {product?.uniteCalcul}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-emerald-600">
                        {cost.toFixed(2)} DH
                      </span>
                      <button
                        onClick={() => handleRemoveMaterial(index)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cost Calculation */}
          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Calcul des Coûts</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
                  Coût Total des Matières
                </div>
                <div className="text-2xl font-black text-emerald-700">
                  {totalMaterialCost.toFixed(2)} DH
                </div>
              </div>

              <div className="bg-[#005461]/5 rounded-xl p-4 border border-[#005461]/10">
                <div className="text-xs font-bold text-[#005461] uppercase tracking-wider mb-1">
                  Coût Unitaire du Produit
                </div>
                <div className="text-2xl font-black text-[#005461]">
                  {unitCost.toFixed(2)} DH
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-[#005461] text-white rounded-xl hover:bg-[#016f76] font-bold shadow-lg shadow-cyan-900/20 transition-all"
            >
              Enregistrer Production
            </button>
          </div>
        </div>
      </SpotlightCard>
    </div>
  );
}

function ProductionDetailsModal({ production, products, onClose }) {
    const product = products.find(p => p.id === production.productId);
  
    return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <SpotlightCard theme="light" className="w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col !p-0 !bg-white/90">
          <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-[#005461]/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#005461]/10 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-[#005461]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#005461]">Détails de Production</h2>
                <p className="text-sm text-slate-500 font-medium">
                  {new Date(production.date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-full transition shadow-sm">
              <X className="w-6 h-6" />
            </button>
          </div>
  
          <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Produit</span>
                <div className="text-lg font-bold text-slate-800 mt-1">{product?.nom}</div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quantité Produite</span>
                <div className="text-lg font-bold text-slate-800 mt-1">{production.quantity}</div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Coût Total</span>
                <div className="text-lg font-bold text-[#018790] mt-1">{(production.unitCost * production.quantity).toFixed(2)} DH</div>
              </div>
            </div>
  
            {/* Materials List */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider flex items-center gap-2">
                <Package className="w-5 h-5 text-[#018790]" />
                Matières Premières Utilisées
              </h3>
              <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Matière</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Quantité</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Coût</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {production.rawMaterials?.map((material, index) => {
                      const matProduct = products.find(p => p.id === material.productId);
                      const cost = matProduct ? matProduct.prixAchat * material.quantity : 0;
                      
                      return (
                        <tr key={index} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 text-sm font-bold text-slate-800">
                            {matProduct?.nom}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                            {material.quantity} {matProduct?.uniteCalcul}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">
                            {cost.toFixed(2)} DH
                          </td>
                        </tr>
                      );
                    })}
                    {(!production.rawMaterials || production.rawMaterials.length === 0) && (
                      <tr>
                        <td colSpan="3" className="px-6 py-8 text-center text-slate-400">
                          Aucun détail sur les matières premières
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-100">
                    <tr>
                      <td colSpan="2" className="px-6 py-4 text-sm font-bold text-slate-600 text-right">
                        Total Matières
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-emerald-600 text-right">
                        {(production.unitCost * production.quantity).toFixed(2)} DH
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
  
          <div className="p-6 border-t border-slate-100 bg-slate-50/50 rounded-b-3xl flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold transition-all shadow-sm"
            >
              Fermer
            </button>
          </div>
        </SpotlightCard>
      </div>
    );
  }
