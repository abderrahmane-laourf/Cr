import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, Search, Trash2, Edit2, Save, X, Package, 
  AlertCircle, TrendingUp, TrendingDown, Box, Truck
} from 'lucide-react';
import { productAPI, settingsAPI } from '../../services/api';
import SpotlightCard from '../../util/SpotlightCard';

export default function PackagingPage() {
  const [packagings, setPackagings] = useState([]);
  const [products, setProducts] = useState([]);
  const [packagingTypes, setPackagingTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPackaging, setCurrentPackaging] = useState(null); // null for add, object for edit
  const [formData, setFormData] = useState({
    id: '',
    productId: '',
    piecesPerPackage: 1,
    alertStock: 10,
    currentStock: 0,
    name: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const productsData = await productAPI.getAll();
      setProducts(productsData);
      
      const typesData = settingsAPI.getPackagingTypes();
      setPackagingTypes(typesData);
      
      // Load packagings from localStorage for now (mock API)
      const savedPackagings = localStorage.getItem('packagings');
      if (savedPackagings) {
        setPackagings(JSON.parse(savedPackagings));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePackagings = (newPackagings) => {
    setPackagings(newPackagings);
    localStorage.setItem('packagings', JSON.stringify(newPackagings));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentPackaging) {
      // Edit
      const updated = packagings.map(p => p.id === currentPackaging.id ? { ...formData, id: currentPackaging.id } : p);
      savePackagings(updated);
    } else {
      // Add
      const newPkg = { ...formData, id: Date.now().toString() };
      savePackagings([...packagings, newPkg]);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet emballage ?')) {
      const updated = packagings.filter(p => p.id !== id);
      savePackagings(updated);
    }
  };

  const openModal = (pkg = null) => {
    if (pkg) {
      setCurrentPackaging(pkg);
      setFormData(pkg);
    } else {
      setCurrentPackaging(null);
      setFormData({
        id: '',
        productId: products.length > 0 ? products[0].id : '',
        piecesPerPackage: 1,
        alertStock: 10,
        currentStock: 0,
        name: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentPackaging(null);
  };

  const getStockStatus = (stock, alert) => {
    if (stock <= alert) return { color: 'red', label: 'Alerte', icon: AlertCircle };
    if (stock <= alert * 2) return { color: 'orange', label: 'Faible', icon: TrendingDown };
    return { color: 'green', label: 'Bon', icon: TrendingUp };
  };

  const filteredPackagings = packagings.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    products.find(prod => prod.id == p.productId)?.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-transparent p-8 font-sans text-slate-800 animate-[fade-in_0.6s_ease-out]">
      <div className="max-w-[1600px] mx-auto">
      
        {/* Header */}
        <SpotlightCard theme="light" className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-[#018790] tracking-tight">Gestion des Emballages</h1>
              <p className="text-slate-500 mt-1 font-medium">Gérez votre stock d'emballages et cartons</p>
            </div>
            <div className="flex gap-3">
              <Link 
                to="/admin/packaging/tracking"
                className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-[#005461] text-[#005461] rounded-xl hover:bg-[#005461]/5 transition-all font-bold active:scale-95"
              >
                <Truck size={20} strokeWidth={2.5} /> Suivi Packaging
              </Link>
              <button 
                onClick={() => openModal()}
                className="flex items-center gap-2 px-6 py-3 bg-[#005461] text-white rounded-xl hover:bg-[#016f76] transition-all shadow-lg shadow-cyan-900/20 font-bold active:scale-95"
              >
                <Plus size={20} strokeWidth={2.5} /> Nouvel Emballage
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#018790]/50" size={20} />
            <input 
              type="text" 
              placeholder="Rechercher un emballage ou produit..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#018790]/20 focus:border-[#018790] transition-all font-medium"
            />
          </div>
        </SpotlightCard>

        {/* Table List View */}
        <SpotlightCard theme="light" className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#005461]/5 border-b border-[#005461]/10">
                  <th className="px-6 py-4 text-xs font-bold text-[#005461] uppercase tracking-wider">Type d'emballage</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#005461] uppercase tracking-wider">Produit Associé</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#005461] uppercase tracking-wider">Stock Emballage</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#005461] uppercase tracking-wider">Stock Produit (Ref)</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#005461] uppercase tracking-wider">Seuil Alerte</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#005461] uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#005461] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPackagings.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Box size={32} className="opacity-20" />
                        <p>Aucun emballage trouvé</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                    filteredPackagings.map(pkg => {
                    const product = products.find(p => p.id == pkg.productId);
                    const packagingStock = pkg.currentStock || 0;
                    const status = getStockStatus(packagingStock, pkg.alertStock);
                    const StatusIcon = status.icon;

                    return (
                      <tr key={pkg.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#005461]/10 flex items-center justify-center text-[#005461]">
                              <Box size={16} />
                            </div>
                            <span className="font-bold text-slate-800">{pkg.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-700">{product?.nom || 'Produit inconnu'}</div>
                        </td>
                        <td className="px-6 py-4">
                            <span className={`text-sm font-black ${
                            packagingStock <= pkg.alertStock ? 'text-red-600' : 
                            status.color === 'orange' ? 'text-orange-600' : 'text-emerald-600'
                          }`}>
                            {packagingStock}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-semibold">
                            {product?.stock || 0}
                        </td>
                        <td className={`px-6 py-4 font-bold ${packagingStock <= pkg.alertStock ? 'text-red-600' : 'text-slate-500'}`}>
                          {pkg.alertStock}
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                              status.color === 'green' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                              status.color === 'orange' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-red-50 text-red-700 border-red-100'
                          }`}>
                            <StatusIcon size={14} />
                            {status.label}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openModal(pkg)} className="p-2 hover:bg-[#005461]/5 rounded-lg text-slate-400 hover:text-[#005461] transition-colors">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDelete(pkg.id)} className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </SpotlightCard>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <SpotlightCard theme="light" className="w-full max-w-lg !p-0 !bg-white/95 animate-in zoom-in-95 duration-200 flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-[#005461]/5">
                <h3 className="font-bold text-lg text-[#005461]">
                  {currentPackaging ? 'Modifier Emballage' : 'Nouvel Emballage'}
                </h3>
                <button onClick={closeModal} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Type d'emballage</label>
                  <select 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#018790]/20 focus:border-[#018790] font-medium transition-all"
                  >
                      <option value="">Sélectionner un type</option>
                      {packagingTypes.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Produit associé</label>
                  <select 
                    required
                    value={formData.productId}
                    onChange={e => setFormData({...formData, productId: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#018790]/20 focus:border-[#018790] font-medium transition-all"
                  >
                    <option value="">Sélectionner un produit</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.nom} ({p.categorie})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Stock Produit</label>
                      <div className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-bold">
                        {formData.productId ? (products.find(p => p.id == formData.productId)?.stock || 0) : 0}
                      </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Seuil d'alerte</label>
                    <input 
                      required
                      type="number" 
                      min="0"
                      value={formData.alertStock}
                      onChange={e => setFormData({...formData, alertStock: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#018790]/20 focus:border-[#018790] font-medium transition-all"
                    />
                  </div>
                </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Stock Actuel</label>
                    <input 
                      required
                      type="number" 
                      min="0"
                      value={formData.currentStock}
                      onChange={e => setFormData({...formData, currentStock: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#018790]/20 focus:border-[#018790] font-medium transition-all"
                    />
                  </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={closeModal}
                    className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 px-4 py-3 bg-[#005461] text-white rounded-xl font-bold hover:bg-[#016f76] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20"
                  >
                    <Save size={18} /> Enregistrer
                  </button>
                </div>
              </form>
            </SpotlightCard>
          </div>
        )}
      </div>
    </div>
  );
}
