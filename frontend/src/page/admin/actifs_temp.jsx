import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Edit2, Trash2, Eye, X, Check, 
  MapPin, Calendar, Upload, AlertCircle, CheckCircle, 
  ChevronDown, Building, DollarSign, Camera, Phone,
  AlertTriangle, Printer, Filter
} from 'lucide-react';
import Swal from 'sweetalert2';
import SpotlightCard from '../../util/SpotlightCard';

// --- 1. UTILITY COMPONENTS ---

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-6 right-6 z-[60] animate-in slide-in-from-right-10 fade-in duration-300">
      <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md
        ${type === 'success' ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800' : 'bg-red-50/90 border-red-200 text-red-800'}`}>
        {type === 'success' ? <CheckCircle size={24} className="text-emerald-500" /> : <AlertCircle size={24} className="text-red-500" />}
        <div>
          <h4 className="font-bold text-sm">{type === 'success' ? 'Succès' : 'Erreur'}</h4>
          <p className="text-xs opacity-90">{message}</p>
        </div>
        <button onClick={onClose} className="ml-4 opacity-50 hover:opacity-100"><X size={16}/></button>
      </div>
    </div>
  );
};

const InputField = ({ label, type = "text", placeholder, value, onChange, disabled }) => (
  <div className="group">
    <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider group-focus-within:text-[#018790] transition-colors">
      {label} {!disabled && <span className="text-red-400">*</span>}
    </label>
    <div className="relative">
      <input 
        type={type} 
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full pl-4 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm placeholder-slate-400 focus:bg-white focus:border-[#018790] focus:ring-4 focus:ring-[#018790]/10 outline-none transition-all duration-200 disabled:bg-slate-100 disabled:text-slate-500 font-bold`}
        value={value}
        onChange={onChange}
      />
    </div>
  </div>
);

const SelectField = ({ label, options, value, onChange, disabled }) => (
    <div className="group">
      <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider group-focus-within:text-[#018790] transition-colors">
        {label} {!disabled && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <select 
            disabled={disabled}
            className={`w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:bg-white focus:border-[#018790] focus:ring-4 focus:ring-[#018790]/10 outline-none transition-all duration-200 appearance-none disabled:bg-slate-100 disabled:text-slate-500 cursor-pointer font-bold`}
            value={value}
            onChange={onChange}
        >
            <option value="">Sélectionner</option>
            {options.map((opt, idx) => (
                <option key={idx} value={opt}>{opt}</option>
            ))}
        </select>
        {!disabled && <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><ChevronDown size={16} /></div>}
      </div>
    </div>
);

// --- 2. MODAL FOR ASSETS ---

const AssetModal = ({ isOpen, onClose, onSave, initialData, mode }) => {
    const isViewMode = mode === 'view';
    
    // Default form data
    const [formData, setFormData] = useState({
        photo: '',
        name: '',
        category: '',
        purchaseValue: '',
        date: new Date().toISOString().split('T')[0],
        project: 'Alpha', // Disabled/Default
        supplierName: '',
        supplierPhone: '',
        status: 'Bon état' 
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(initialData);
            } else {
                // Reset for new entry
                setFormData({
                    photo: '',
                    name: '',
                    category: '',
                    purchaseValue: '',
                    date: new Date().toISOString().split('T')[0],
                    project: 'Alpha',
                    supplierName: '',
                    supplierPhone: '',
                    status: 'Bon état'
                });
            }
        }
    }, [isOpen, initialData]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <SpotlightCard theme="light" className="w-full max-w-2xl max-h-[90vh] flex flex-col !p-0 bg-white/90 dark:bg-slate-900 overflow-hidden">
                <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100 bg-[#005461]/5">
                    <div>
                        <h2 className="text-2xl font-bold text-[#005461]">
                            {mode === 'add' ? 'Ajouter Un Actif' : mode === 'edit' ? "Modifier l'Actif" : "Détails de l'Actif"}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-full transition-colors shadow-sm">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar">
                    
                    {/* Photo Uploader */}
                    <div className="flex justify-center mb-8">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                                {formData.photo ? (
                                    <img src={formData.photo} alt="Asset" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center text-slate-400">
                                        <Camera className="mx-auto mb-2" size={24} />
                                        <span className="text-xs font-bold">Photo</span>
                                    </div>
                                )}
                            </div>
                            {!isViewMode && (
                                <label className="absolute -bottom-2 -right-2 bg-[#005461] p-2 rounded-full text-white cursor-pointer shadow-lg hover:bg-[#016f76] transition-all">
                                    <Upload size={16} />
                                    <input type="button" className="hidden" onClick={() => handleChange('photo', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=150&q=80')} />
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InputField 
                            label="Nom de l'élément" 
                            value={formData.name} 
                            onChange={(e) => handleChange('name', e.target.value)} 
                            disabled={isViewMode} 
                        />
                        
                        <SelectField 
                            label="Catégorie" 
                            options={['Mobilier', 'Informatique', 'Véhicules', 'Machines']} 
                            value={formData.category} 
                            onChange={(e) => handleChange('category', e.target.value)} 
                            disabled={isViewMode} 
                        />

                        <InputField 
                            label="Valeur d'achat (MAD)" 
                            type="number"
                            value={formData.purchaseValue} 
                            onChange={(e) => handleChange('purchaseValue', e.target.value)} 
                            disabled={isViewMode} 
                        />

                        <SelectField 
                            label="État (Status)" 
                            options={['Bon état', 'Endommagé', 'En maintenance']} 
                            value={formData.status} 
                            onChange={(e) => handleChange('status', e.target.value)} 
                            disabled={isViewMode} 
                        />

                        {/* Disabled Fields as requested */}
                        <InputField 
                            label="Date d'acquisition" 
                            type="date"
                            value={formData.date} 
                            onChange={(e) => handleChange('date', e.target.value)} 
                            disabled={true} 
                        />

                        <InputField 
                            label="Projet" 
                            value={formData.project} 
                            onChange={(e) => handleChange('project', e.target.value)} 
                            disabled={true} 
                        />

                        <div className="md:col-span-2 border-t border-slate-100 pt-4 mt-2">
                             <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wider">
                                <Building size={16} className="text-[#018790]"/> Informations Fournisseur
                             </h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <InputField 
                                    label="Nom du Fournisseur" 
                                    value={formData.supplierName} 
                                    onChange={(e) => handleChange('supplierName', e.target.value)} 
                                    disabled={isViewMode} 
                                />
                                <InputField 
                                    label="Tél Fournisseur" 
                                    value={formData.supplierPhone} 
                                    onChange={(e) => handleChange('supplierPhone', e.target.value)} 
                                    disabled={isViewMode} 
                                />
                             </div>
                        </div>
                    </div>

                    {!isViewMode && (
                        <div className="pt-8 flex justify-end gap-3 mt-4 border-t border-slate-100">
                            <button 
                                type="button" 
                                onClick={onClose}
                                className="px-6 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
                            >
                                Annuler
                            </button>
                            <button 
                                type="submit"
                                className="px-8 py-2.5 rounded-xl text-white font-bold flex items-center gap-2 bg-[#005461] hover:bg-[#016f76] shadow-lg shadow-cyan-900/20 transition-all"
                            >
                                <Check size={18} /> {mode === 'add' ? 'Enregistrer' : 'Modifier'}
                            </button>
                        </div>
                    )}
                </form>
            </SpotlightCard>
        </div>
    );
};

// --- 2.5 DAMAGE REPORT MODAL ---

const DamageReportModal = ({ isOpen, onClose, asset, onSave }) => {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        cause: ''
    });

    if (!isOpen || !asset) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(asset.id, formData);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[60] p-4">
            <SpotlightCard theme="light" className="w-full max-w-lg flex flex-col !p-0 bg-white/90 dark:bg-slate-900 border-l-4 border-rose-500 overflow-hidden">
                <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100 bg-rose-50">
                    <div>
                        <h2 className="text-xl font-bold text-rose-700 flex items-center gap-2">
                            <AlertTriangle className="text-rose-600" /> Signaler une Avarie
                        </h2>
                        <p className="text-sm text-rose-600/70 font-medium">Actif: <span className="font-bold">{asset.name}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white hover:bg-rose-100 text-rose-400 hover:text-rose-600 rounded-full transition-colors shadow-sm">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <InputField 
                        label="Date du constat" 
                        type="date"
                        value={formData.date} 
                        onChange={(e) => setFormData({...formData, date: e.target.value})} 
                    />

                    <div className="group">
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">
                            Cause / Description <span className="text-red-400">*</span>
                        </label>
                        <textarea 
                            rows="4"
                            required
                            className="w-full pl-4 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all resize-none font-bold"
                            placeholder="Décrivez la nature et la cause du dommage..."
                            value={formData.cause}
                            onChange={(e) => setFormData({...formData, cause: e.target.value})}
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
                        >
                            Annuler
                        </button>
                        <button 
                            type="submit"
                            className="px-6 py-2.5 rounded-xl text-white font-bold flex items-center gap-2 bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-500/30 transition-all"
                        >
                            <AlertTriangle size={18} /> Confirmer Dommage
                        </button>
                    </div>
                </form>
            </SpotlightCard>
        </div>
    );
};

// --- 3. MAIN PAGE COMPONENT ---

const AssetsPage = () => {
  const [assets, setAssets] = useState([]); // Start empty, load from LS
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDamageModalOpen, setIsDamageModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('assets_db');
    if (saved) {
      setAssets(JSON.parse(saved));
    } else {
        // Initial Mock Data if empty
        const initialData = [
            { id: 1, photo: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=150', name: 'MacBook Pro M1', category: 'Informatique', purchaseValue: 15000, date: '2024-01-15', project: 'Alpha', supplierName: 'Global Info', supplierPhone: '0661123456', status: 'Bon état', quantity: 1 },
            { id: 2, photo: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=150', name: 'Bureau Angle', category: 'Mobilier', purchaseValue: 2500, date: '2023-11-20', project: 'Beta', supplierName: 'Ikea Business', supplierPhone: '0522987654', status: 'Bon état', quantity: 5 },
        ];
        setAssets(initialData);
        localStorage.setItem('assets_db', JSON.stringify(initialData));
    }
  }, []);

  // Save to LocalStorage whenever assets change
  useEffect(() => {
    if (assets.length > 0) {
        localStorage.setItem('assets_db', JSON.stringify(assets));
    }
  }, [assets]);

  const showToast = (msg, type = 'success') => setToast({ message: msg, type });

  const handleSave = (data) => {
    if (modalMode === 'add') {
        const newAsset = { ...data, id: Date.now() };
        setAssets([...assets, newAsset]);
        showToast('Actif ajouté avec succès');
    } else {
        setAssets(assets.map(a => a.id === selectedAsset.id ? { ...a, ...data } : a));
        showToast('Actif modifié avec succès');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    Swal.fire({
        title: 'Êtes-vous sûr?',
        text: "Cette action est irréversible!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#cbd5e1',
        confirmButtonText: 'Oui, supprimer!',
        cancelButtonText: 'Annuler',
        background: '#fff',
        borderRadius: '1rem'
    }).then((result) => {
        if (result.isConfirmed) {
            setAssets(assets.filter(a => a.id !== id));
            showToast('Actif supprimé', 'error');
        }
    });
  };

  const handleDamageReport = (id, reportData) => {
    setAssets(assets.map(a => a.id === id ? { ...a, status: 'Endommagé', damageReport: reportData } : a));
    setIsDamageModalOpen(false);
    showToast('Avarie signalée avec succès', 'error');
  };

  const openModal = (mode, asset = null) => {
    setModalMode(mode);
    setSelectedAsset(asset);
    setIsModalOpen(true);
  };

  const filteredAssets = assets.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-transparent p-6 space-y-8 animate-[fade-in_0.6s_ease-out]">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-transparent p-6 rounded-3xl border border-slate-100/50">
        <div>
          <h1 className="text-2xl font-extrabold text-[#018790]">Gestion des Actifs</h1>
          <p className="text-slate-500">Inventaire et suivi du matériel</p>
        </div>
        <div className="mt-4 sm:mt-0">
            <button 
                onClick={() => openModal('add')}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#005461] hover:bg-[#016f76] text-white rounded-xl transition-all shadow-lg shadow-cyan-900/20 font-bold"
            >
                <Plus size={20} /> Nouvel Actif
            </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* Search */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Search size={12}/> Recherche Rapide</label>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#018790]/50" size={18} />
                    <input 
                        type="text" 
                        placeholder="Rechercher par nom, catégorie..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#018790]/10 focus:border-[#018790] transition-all" 
                    />
                </div>
            </div>
            
            {/* Clear Filters */}
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 text-sm font-bold transition-all flex items-center justify-center gap-2 h-[42px]"
              >
                <X size={16} />
                Effacer
              </button>
            )}
         </div>
      </div>

      {/* Assets Table */}
      <SpotlightCard theme="light" className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#005461]/5 border-b border-[#005461]/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#005461] uppercase tracking-wider">Actif</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#005461] uppercase tracking-wider">Catégorie</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#005461] uppercase tracking-wider">Valeur</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#005461] uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#005461] uppercase tracking-wider">État</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-[#005461] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
                            {asset.photo ? (
                                <img src={asset.photo} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    <Camera size={16} />
                                </div>
                            )}
                        </div>
                        <div>
                            <div className="font-bold text-slate-800">{asset.name}</div>
                            <div className="text-xs text-slate-500 font-medium">{asset.project}</div>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                        {asset.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-[#018790]">
                    {parseFloat(asset.purchaseValue).toLocaleString()} DH
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                    {new Date(asset.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border
                        ${asset.status === 'Bon état' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                          asset.status === 'Endommagé' ? 'bg-rose-50 text-rose-700 border-rose-100' : 
                          'bg-amber-50 text-amber-700 border-amber-100'}`}>
                        {asset.status === 'Bon état' ? <CheckCircle size={12}/> : <AlertTriangle size={12}/>}
                        {asset.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => openModal('view', asset)}
                            className="p-2 text-slate-400 hover:text-[#018790] hover:bg-[#018790]/10 rounded-lg transition-colors"
                            title="Voir détails"
                        >
                            <Eye size={18} />
                        </button>
                        <button 
                            onClick={() => openModal('edit', asset)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Modifier"
                        >
                            <Edit2 size={18} />
                        </button>
                        <button 
                            onClick={() => { setSelectedAsset(asset); setIsDamageModalOpen(true); }}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Signaler Avarie"
                        >
                            <AlertTriangle size={18} />
                        </button>
                        <button 
                            onClick={() => handleDelete(asset.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Supprimer"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAssets.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Search className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="font-medium">Aucun actif trouvé</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SpotlightCard>

      <AssetModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        initialData={selectedAsset}
        mode={modalMode}
      />

      <DamageReportModal 
        isOpen={isDamageModalOpen}
        onClose={() => setIsDamageModalOpen(false)}
        asset={selectedAsset}
        onSave={handleDamageReport}
      />
    </div>
  );
};

export default AssetsPage;
