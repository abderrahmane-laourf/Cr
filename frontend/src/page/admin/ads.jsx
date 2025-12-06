import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Edit2, Trash2, Eye, X, Check, 
  Megaphone, Calendar, User, Package, Settings
} from 'lucide-react';
import Swal from 'sweetalert2';

// API Configuration
const API_URL = 'http://localhost:3000';

// Toast Component
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-6 right-6 z-[60] animate-in slide-in-from-right-10 fade-in duration-300">
      <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md
        ${type === 'success' ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800' : 'bg-red-50/90 border-red-200 text-red-800'}`}>
        {type === 'success' ? <Check size={24} className="text-emerald-500" /> : <X size={24} className="text-red-500" />}
        <div>
          <h4 className="font-bold text-sm">{type === 'success' ? 'Succès' : 'Erreur'}</h4>
          <p className="text-xs opacity-90">{message}</p>
        </div>
        <button onClick={onClose} className="ml-4 opacity-50 hover:opacity-100"><X size={16}/></button>
      </div>
    </div>
  );
};

export default function AdsPage() {
  const [ads, setAds] = useState([]);
  const [products, setProducts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [platforms] = useState(['Facebook', 'TikTok', 'Instagram', 'Google']);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedAd, setSelectedAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Settings
  const [targetCPO, setTargetCPO] = useState(20);
  
  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    platform: 'Facebook',
    project: 'Alpha',
    productId: '',
    campaignName: '',
    goal: 'Traffic',
    employeeId: '',
    whatsappNumber: '',
    dailyBudget: 0,
    orders: 0,
    spent: 0
  });

  useEffect(() => {
    loadData();
    loadSettings();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [adsRes, productsRes, employeesRes] = await Promise.all([
        fetch(`${API_URL}/ads`).catch(() => ({ ok: false, json: async () => [] })),
        fetch(`${API_URL}/products`),
        fetch(`${API_URL}/employees`)
      ]);

      if (adsRes.ok) setAds(await adsRes.json());
      if (productsRes.ok) setProducts(await productsRes.json());
      if (employeesRes.ok) setEmployees(await employeesRes.json());
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Erreur de chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = () => {
    const saved = localStorage.getItem('adsSettings');
    if (saved) {
      const settings = JSON.parse(saved);
      setTargetCPO(settings.targetCPO || 20);
    }
  };

  const saveSettings = () => {
    localStorage.setItem('adsSettings', JSON.stringify({ targetCPO }));
    setIsSettingsOpen(false);
    showToast('Paramètres sauvegardés avec succès', 'success');
  };

  // Auto-fill WhatsApp when employee changes
  useEffect(() => {
    if (formData.employeeId) {
      const employee = employees.find(e => e.id === formData.employeeId);
      if (employee) {
        setFormData(prev => ({ ...prev, whatsappNumber: employee.phone || '' }));
      }
    }
  }, [formData.employeeId, employees]);

  const handleSave = async () => {
    if (!formData.platform || !formData.productId || !formData.employeeId || !formData.campaignName) {
      showToast('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    try {
      const product = products.find(p => p.id === formData.productId);
      const employee = employees.find(e => e.id === formData.employeeId);
      
      const adData = {
        ...formData,
        productName: product ? product.nom : 'Inconnu',
        employeeName: employee ? employee.name : 'Inconnu',
        cpo: formData.orders > 0 ? (formData.spent / formData.orders).toFixed(2) : 0,
        dateCreated: new Date().toISOString()
      };

      if (modalMode === 'add') {
        const newAd = { id: Date.now().toString(), ...adData };
        const response = await fetch(`${API_URL}/ads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newAd)
        });
        if (response.ok) {
          setAds([...ads, newAd]);
          showToast('Publicité ajoutée avec succès !', 'success');
        }
      } else if (modalMode === 'edit') {
        const response = await fetch(`${API_URL}/ads/${selectedAd.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...selectedAd, ...adData })
        });
        if (response.ok) {
          setAds(ads.map(ad => ad.id === selectedAd.id ? { ...selectedAd, ...adData } : ad));
          showToast('Modifications enregistrées !', 'success');
        }
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving ad:', error);
      showToast('Erreur lors de la sauvegarde', 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Cette action est irréversible !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        await fetch(`${API_URL}/ads/${id}`, { method: 'DELETE' });
        setAds(ads.filter(ad => ad.id !== id));
        Swal.fire('Supprimé !', 'La publicité a été supprimée.', 'success');
      } catch (error) {
        console.error('Error deleting:', error);
        Swal.fire('Erreur', 'Erreur lors de la suppression', 'error');
      }
    }
  };

  const handleOpenAdd = () => {
    setModalMode('add');
    setSelectedAd(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ad) => {
    setModalMode('edit');
    setSelectedAd(ad);
    setFormData({
      date: ad.date,
      platform: ad.platform,
      project: ad.project,
      productId: ad.productId,
      campaignName: ad.campaignName,
      goal: ad.goal,
      employeeId: ad.employeeId,
      whatsappNumber: ad.whatsappNumber,
      dailyBudget: ad.dailyBudget,
      orders: ad.orders,
      spent: ad.spent
    });
    setIsModalOpen(true);
  };

  const handleOpenView = (ad) => {
    setModalMode('view');
    setSelectedAd(ad);
    setFormData({
      date: ad.date,
      platform: ad.platform,
      project: ad.project,
      productId: ad.productId,
      campaignName: ad.campaignName,
      goal: ad.goal,
      employeeId: ad.employeeId,
      whatsappNumber: ad.whatsappNumber,
      dailyBudget: ad.dailyBudget,
      orders: ad.orders,
      spent: ad.spent
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      platform: 'Facebook',
      project: 'Alpha',
      productId: '',
      campaignName: '',
      goal: 'Traffic',
      employeeId: '',
      whatsappNumber: '',
      dailyBudget: 0,
      orders: 0,
      spent: 0
    });
  };

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  // Simple search filter
  const filteredAds = ads.filter(ad => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (ad.campaignName && ad.campaignName.toLowerCase().includes(searchLower)) ||
      (ad.productName && ad.productName.toLowerCase().includes(searchLower)) ||
      (ad.employeeName && ad.employeeName.toLowerCase().includes(searchLower)) ||
      (ad.platform && ad.platform.toLowerCase().includes(searchLower))
    );
  });

  const isViewMode = modalMode === 'view';
  const modalTitle = modalMode === 'add' ? 'Nouvelle Publicité' : modalMode === 'edit' ? 'Modifier la Publicité' : 'Détails de la Publicité';

  return (
    <div className="min-h-screen bg-slate-50/50 p-8 font-sans text-slate-800 relative">
      
      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                <Megaphone size={24} />
             </div>
             <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Liste des Publicités</h1>
                <p className="text-slate-500 mt-1 font-medium">Gérez vos campagnes publicitaires</p>
             </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-all shadow-lg shadow-slate-500/30 font-semibold"
            >
              <Settings size={20} /> Paramètres
            </button>
            <button 
              onClick={handleOpenAdd}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 font-semibold"
            >
              <Plus size={20} /> Nouvelle Publicité
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Rechercher une campagne, produit, employé..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Plateforme</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Campagne</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Produit</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Employé</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Budget/Jour</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Dépensé</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Commandes</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">CPO</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAds.length > 0 ? (
                filteredAds.map((ad) => {
                  const cpo = ad.orders > 0 ? (ad.spent / ad.orders).toFixed(2) : 0;
                  const cpoStatus = cpo > targetCPO ? 'text-red-600' : 'text-emerald-600';
                  
                  return (
                    <tr key={ad.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-slate-400" />
                          {new Date(ad.date).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold
                          ${ad.platform === 'Facebook' ? 'bg-blue-100 text-blue-800' : 
                            ad.platform === 'TikTok' ? 'bg-pink-100 text-pink-800' :
                            ad.platform === 'Instagram' ? 'bg-purple-100 text-purple-800' :
                            'bg-green-100 text-green-800'}`}>
                          {ad.platform}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <span className="font-bold text-slate-800 block">{ad.campaignName}</span>
                          <span className="text-xs text-slate-500">{ad.goal}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2">
                           <Package size={16} className="text-blue-500" />
                           <span className="font-medium text-slate-700">{ad.productName}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2">
                           <User size={16} className="text-emerald-500" />
                           <span className="font-medium text-slate-700">{ad.employeeName}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-blue-600">{parseFloat(ad.dailyBudget).toFixed(2)} MAD</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-orange-600">{parseFloat(ad.spent).toFixed(2)} MAD</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                          {ad.orders}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${cpoStatus}`}>{cpo} MAD</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleOpenView(ad)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Voir"><Eye size={18} /></button>
                          <button onClick={() => handleOpenEdit(ad)} className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition" title="Modifier"><Edit2 size={18} /></button>
                          <button onClick={() => handleDelete(ad.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Supprimer"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                   <td colSpan="10" className="px-6 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                         <Megaphone size={32} className="opacity-20" />
                         <span>Aucune publicité trouvée</span>
                      </div>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="bg-slate-50 p-2 rounded-lg text-slate-600">
                  <Settings size={24} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Paramètres des Publicités</h2>
              </div>
              <button onClick={() => setIsSettingsOpen(false)} className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors"><X size={24} /></button>
            </div>

            <div className="p-8">
              <div className="group">
                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">
                  Coût par Commande Cible (Target CPO)
                </label>
                <input 
                  type="number"
                  min="0"
                  step="0.01"
                  value={targetCPO}
                  onChange={(e) => setTargetCPO(parseFloat(e.target.value) || 0)}
                  className="w-full pl-4 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all duration-200"
                  placeholder="20"
                />
                <p className="text-xs text-slate-500 mt-2 ml-1">Les CPO supérieurs à cette valeur seront affichés en rouge</p>
              </div>
            </div>

            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 rounded-b-3xl flex justify-end items-center gap-3">
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="px-6 py-2.5 rounded-xl text-slate-600 font-semibold hover:bg-white border border-transparent hover:border-slate-200 transition-all"
              >
                Annuler
              </button>
              <button 
                onClick={saveSettings}
                className="px-8 py-3 rounded-xl text-white font-semibold flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/30 transition-all"
              >
                <Check size={18} /> Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
             
             {/* Modal Header */}
             <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
               <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                     <Megaphone size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">{modalTitle}</h2>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors"><X size={24} /></button>
             </div>

             {/* Modal Body */}
             <div className="p-8 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   
                   {/* Date */}
                   <div className="group">
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider group-focus-within:text-purple-600 transition-colors">
                         Date <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                         <input 
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({...formData, date: e.target.value})}
                            disabled={isViewMode}
                            className="w-full pl-4 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all duration-200 disabled:bg-slate-100 disabled:text-slate-500"
                         />
                         <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                      </div>
                   </div>

                   {/* Platform */}
                   <div className="group">
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider group-focus-within:text-purple-600 transition-colors">
                         Plateforme <span className="text-red-400">*</span>
                      </label>
                      <select
                         value={formData.platform}
                         onChange={(e) => setFormData({...formData, platform: e.target.value})}
                         disabled={isViewMode}
                         className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all duration-200 appearance-none cursor-pointer disabled:bg-slate-100 disabled:text-slate-500"
                      >
                         {platforms.map(p => (
                           <option key={p} value={p}>{p}</option>
                         ))}
                      </select>
                   </div>

                   {/* Project (Disabled) */}
                   <div className="group">
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">
                         Projet
                      </label>
                      <select
                         value={formData.project}
                         onChange={(e) => setFormData({...formData, project: e.target.value})}
                         disabled={true}
                         className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-sm outline-none transition-all duration-200 appearance-none cursor-not-allowed"
                      >
                         <option value="Alpha">Alpha</option>
                         <option value="Beta">Beta</option>
                      </select>
                   </div>

                   {/* Product */}
                   <div className="group">
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider group-focus-within:text-purple-600 transition-colors">
                         Produit <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                         <select
                            value={formData.productId}
                            onChange={(e) => setFormData({...formData, productId: e.target.value})}
                            disabled={isViewMode}
                            className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all duration-200 appearance-none cursor-pointer disabled:bg-slate-100 disabled:text-slate-500"
                         >
                            <option value="">Sélectionner un produit</option>
                            {products.map(p => (
                               <option key={p.id} value={p.id}>{p.nom}</option>
                            ))}
                         </select>
                         <Package className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                      </div>
                   </div>

                   {/* Campaign Name */}
                   <div className="group md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider group-focus-within:text-purple-600 transition-colors">
                         Nom de la Campagne <span className="text-red-400">*</span>
                      </label>
                      <input 
                         type="text"
                         value={formData.campaignName}
                         onChange={(e) => setFormData({...formData, campaignName: e.target.value})}
                         disabled={isViewMode}
                         className="w-full pl-4 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all duration-200 disabled:bg-slate-100 disabled:text-slate-500"
                         placeholder="Ex: Campagne Serum Vitamine C - Janvier 2025"
                      />
                   </div>

                   {/* Goal */}
                   <div className="group">
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider group-focus-within:text-purple-600 transition-colors">
                         Type / Objectif <span className="text-red-400">*</span>
                      </label>
                      <select
                         value={formData.goal}
                         onChange={(e) => setFormData({...formData, goal: e.target.value})}
                         disabled={isViewMode}
                         className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all duration-200 appearance-none cursor-pointer disabled:bg-slate-100 disabled:text-slate-500"
                      >
                         <option value="Traffic">Traffic</option>
                         <option value="Sales">Ventes</option>
                         <option value="Message">Messages</option>
                         <option value="Leads">Leads</option>
                      </select>
                   </div>

                   {/* Employee */}
                   <div className="group">
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider group-focus-within:text-purple-600 transition-colors">
                         Employé <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                         <select
                            value={formData.employeeId}
                            onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                            disabled={isViewMode}
                            className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all duration-200 appearance-none cursor-pointer disabled:bg-slate-100 disabled:text-slate-500"
                         >
                            <option value="">Sélectionner un employé</option>
                            {employees.map(e => (
                               <option key={e.id} value={e.id}>{e.name}</option>
                            ))}
                         </select>
                         <User className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                      </div>
                   </div>

                   {/* WhatsApp Number (Auto-filled) */}
                   <div className="group md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">
                         Numéro WhatsApp
                      </label>
                      <input 
                         type="text"
                         value={formData.whatsappNumber}
                         onChange={(e) => setFormData({...formData, whatsappNumber: e.target.value})}
                         disabled={isViewMode}
                         className="w-full pl-4 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all duration-200 disabled:bg-slate-100 disabled:text-slate-500"
                         placeholder="Auto-rempli depuis l'employé"
                      />
                   </div>

                   {/* Daily Budget */}
                   <div className="group">
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider group-focus-within:text-purple-600 transition-colors">
                         Budget Quotidien (MAD)
                      </label>
                      <input 
                         type="number"
                         min="0"
                         step="0.01"
                         value={formData.dailyBudget}
                         onChange={(e) => setFormData({...formData, dailyBudget: parseFloat(e.target.value) || 0})}
                         disabled={isViewMode}
                         className="w-full pl-4 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all duration-200 disabled:bg-slate-100 disabled:text-slate-500"
                         placeholder="0.00"
                      />
                   </div>

                   {/* Orders */}
                   <div className="group">
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider group-focus-within:text-purple-600 transition-colors">
                         Nombre de Commandes
                      </label>
                      <input 
                         type="number"
                         min="0"
                         value={formData.orders}
                         onChange={(e) => setFormData({...formData, orders: parseInt(e.target.value) || 0})}
                         disabled={isViewMode}
                         className="w-full pl-4 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all duration-200 disabled:bg-slate-100 disabled:text-slate-500"
                         placeholder="0"
                      />
                   </div>

                   {/* Spent */}
                   <div className="group md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider group-focus-within:text-purple-600 transition-colors">
                         Dépenses (Spend) (MAD)
                      </label>
                      <input 
                         type="number"
                         min="0"
                         step="0.01"
                         value={formData.spent}
                         onChange={(e) => setFormData({...formData, spent: parseFloat(e.target.value) || 0})}
                         disabled={isViewMode}
                         className="w-full pl-4 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all duration-200 disabled:bg-slate-100 disabled:text-slate-500"
                         placeholder="0.00"
                      />
                   </div>

                </div>
             </div>

             {/* Footer */}
             <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 rounded-b-3xl flex justify-end items-center gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl text-slate-600 font-semibold hover:bg-white border border-transparent hover:border-slate-200 transition-all"
                >
                  {isViewMode ? 'Fermer' : 'Annuler'}
                </button>
                {!isViewMode && (
                  <button 
                    onClick={handleSave}
                    className="px-8 py-3 rounded-xl text-white font-semibold flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/30 transition-all"
                  >
                    <Check size={18} /> Sauvegarder
                  </button>
                )}
             </div>

          </div>
        </div>
      )}

    </div>
  );
}
