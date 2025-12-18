import { createPortal } from 'react-dom';
import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Edit2, Trash2, Eye, X, Check, 
  MapPin, Calendar, Upload, AlertCircle, CheckCircle, 
  ChevronDown, Building, DollarSign, Camera, Phone,
  AlertTriangle, Printer, FileText
} from 'lucide-react';
import Swal from 'sweetalert2';

// ============================================================================
// 1. UTILITY COMPONENTS (Styled with #018790)
// ============================================================================

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
          <h4 className="font-bold text-sm">{type === 'success' ? 'SuccÃ¨s' : 'Erreur'}</h4>
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
        className={`w-full pl-4 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm placeholder-slate-400 focus:bg-white focus:border-[#018790] focus:ring-4 focus:ring-[#018790]/10 outline-none transition-all duration-200 disabled:bg-slate-100 disabled:text-slate-500`}
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
            className={`w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:bg-white focus:border-[#018790] focus:ring-4 focus:ring-[#018790]/10 outline-none transition-all duration-200 appearance-none disabled:bg-slate-100 disabled:text-slate-500 cursor-pointer`}
            value={value}
            onChange={onChange}
        >
            <option value="">SÃ©lectionner</option>
            {options.map((opt, idx) => (
                <option key={idx} value={opt}>{opt}</option>
            ))}
        </select>
        {!disabled && <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><ChevronDown size={16} /></div>}
      </div>
    </div>
);

// ============================================================================
// 2. MODAL FOR ASSETS
// ============================================================================

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
        status: 'Bon Ã©tat' 
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(initialData);
            } else {
                setFormData({
                    photo: '',
                    name: '',
                    category: '',
                    purchaseValue: '',
                    date: new Date().toISOString().split('T')[0],
                    project: 'Alpha',
                    supplierName: '',
                    supplierPhone: '',
                    status: 'Bon Ã©tat'
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

    return createPortal(
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">
                            {mode === 'add' ? 'Ajouter Un Actif' : mode === 'edit' ? "Modifier l'Actif" : "DÃ©tails de l'Actif"}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors">
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
                                        <span className="text-xs">Photo</span>
                                    </div>
                                )}
                            </div>
                            {!isViewMode && (
                                <label className="absolute -bottom-2 -right-2 bg-[#018790] p-2 rounded-full text-white cursor-pointer shadow-lg hover:bg-[#006a70] transition-all">
                                    <Upload size={16} />
                                    <input type="button" className="hidden" onClick={() => handleChange('photo', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=150&q=80')} />
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InputField 
                            label="Nom de l'Ã©lÃ©ment" 
                            value={formData.name} 
                            onChange={(e) => handleChange('name', e.target.value)} 
                            disabled={isViewMode} 
                        />
                        
                        <SelectField 
                            label="CatÃ©gorie" 
                            options={['Mobilier', 'Informatique', 'VÃ©hicules', 'Machines']} 
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
                            label="Ã‰tat (Status)" 
                            options={['Bon Ã©tat', 'EndommagÃ©', 'En maintenance']} 
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
                             <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
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
                                    label="TÃ©l Fournisseur" 
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
                                className="px-6 py-2.5 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
                            >
                                Annuler
                            </button>
                            <button 
                                type="submit"
                                className="px-8 py-2.5 rounded-xl text-white font-semibold flex items-center gap-2 bg-[#018790] hover:bg-[#006a70] shadow-lg shadow-teal-900/20 transition-all"
                            >
                                <Check size={18} /> {mode === 'add' ? 'Enregistrer' : 'Modifier'}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>,
        document.body
    );
};

// ============================================================================
// 2.5 DAMAGE REPORT MODAL
// ============================================================================

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

    return createPortal(
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col animate-in zoom-in-95 duration-200 border-l-4 border-red-500">
                <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <AlertTriangle className="text-red-500" /> Signaler une Avarie
                        </h2>
                        <p className="text-sm text-slate-500">Actif: <span className="font-bold text-slate-700">{asset.name}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors">
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
                            className="w-full pl-4 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all resize-none"
                            placeholder="DÃ©crivez la nature et la cause du dommage..."
                            value={formData.cause}
                            onChange={(e) => setFormData({...formData, cause: e.target.value})}
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
                        >
                            Annuler
                        </button>
                        <button 
                            type="submit"
                            className="px-6 py-2.5 rounded-xl text-white font-bold flex items-center gap-2 bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all"
                        >
                            <AlertTriangle size={18} /> Confirmer Dommage
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

// ============================================================================
// 3. MAIN PAGE COMPONENT
// ============================================================================

const AssetsPage = () => {
  const [assets, setAssets] = useState([]); 
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDamageModalOpen, setIsDamageModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for Checkboxes
  const [selectedIds, setSelectedIds] = useState([]);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('assets_db');
    if (saved) {
      setAssets(JSON.parse(saved));
    } else {
        const initialData = [
            { id: 1, photo: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=150', name: 'MacBook Pro M1', category: 'Informatique', purchaseValue: 15000, date: '2024-01-15', project: 'Alpha', supplierName: 'Global Info', supplierPhone: '0661123456', status: 'Bon Ã©tat', quantity: 1 },
            { id: 2, photo: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=150', name: 'Bureau Angle', category: 'Mobilier', purchaseValue: 2500, date: '2023-11-20', project: 'Beta', supplierName: 'Ikea Business', supplierPhone: '0522987654', status: 'Bon Ã©tat', quantity: 5 },
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

  // Handle Select Logic
  const handleSelectAll = (e) => {
      if (e.target.checked) {
          setSelectedIds(filteredAssets.map(a => a.id));
      } else {
          setSelectedIds([]);
      }
  };

  const handleSelectOne = (id) => {
      if (selectedIds.includes(id)) {
          setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
      } else {
          setSelectedIds([...selectedIds, id]);
      }
  };

  const handleOpenAdd = () => {
    setModalMode('add');
    setSelectedAsset(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (asset) => {
    setModalMode('edit');
    setSelectedAsset(asset);
    setIsModalOpen(true);
  };

  const handleOpenView = (asset) => {
    setModalMode('view');
    setSelectedAsset(asset);
    setIsModalOpen(true);
  };

  const handleOpenDamage = (asset) => {
      setSelectedAsset(asset);
      setIsDamageModalOpen(true);
  };

  const handleDelete = (id) => {
      Swal.fire({
          title: 'ÃŠtes-vous sÃ»r ?',
          text: "Cette action est irrÃ©versible !",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#EF4444',
          cancelButtonColor: '#94A3B8',
          confirmButtonText: 'Oui, supprimer !',
          cancelButtonText: 'Annuler'
      }).then((result) => {
          if (result.isConfirmed) {
              setAssets(assets.filter(a => a.id !== id));
              Swal.fire('SupprimÃ©!', "L'actif a Ã©tÃ© supprimÃ©.", 'success');
          }
      });
  };

  const handleSave = (assetData) => {
      if (modalMode === 'add') {
          setAssets([...assets, { ...assetData, id: Date.now() }]);
          setToast({ message: "Actif ajoutÃ© avec succÃ¨s !", type: "success" });
      } else {
          setAssets(assets.map(a => a.id === selectedAsset.id ? { ...assetData, id: a.id } : a));
          setToast({ message: "Actif modifiÃ© avec succÃ¨s !", type: "success" });
      }
      setIsModalOpen(false);
  };

  const handleSaveDamage = (assetId, damageData) => {
    setAssets(assets.map(a => 
        a.id === assetId 
        ? { ...a, status: 'EndommagÃ©' } 
        : a
    ));
    setIsDamageModalOpen(false);
    setToast({ message: "Avarie signalÃ©e avec succÃ¨s ! Statut mis Ã  jour.", type: "success" });
  };

  const handlePrintContract = () => {
    // Logic remains same, potentially use selectedIds to print only selected
    const printWindow = window.open('', '_blank');
    const currentDate = new Date().toLocaleDateString('ar-MA');
    
    // Only print filtered or selected items
    const itemsToPrint = selectedIds.length > 0 
        ? assets.filter(a => selectedIds.includes(a.id)) 
        : filteredAssets;

    const rows = itemsToPrint.map(asset => `
      <tr>
        <td>${asset.name}</td>
        <td>${asset.category}</td>
        <td>${asset.status}</td>
        <td>${asset.id}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <title>Ù…Ø­Ø¶Ø± Ø§Ø³ØªÙ„Ø§Ù… Ø¹Ù‡Ø¯Ø©</title>
        <style>
          body { font-family: 'Arial', sans-serif; padding: 40px; direction: rtl; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .title { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .sub-title { font-size: 18px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 30px; }
          th, td { border: 1px solid #000; padding: 12px; text-align: center; }
          th { background-color: #f8f9fa; font-weight: bold; }
          .content { margin-top: 30px; line-height: 1.6; font-size: 16px; }
          .footer { margin-top: 80px; display: flex; justify-content: space-between; page-break-inside: avoid; }
          .signature-section { text-align: center; width: 250px; }
          .signature-box { border: 1px solid #000; height: 100px; margin-top: 15px; border-radius: 8px; }
          @media print {
            @page { margin: 1cm; size: A4; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">Ù…Ø­Ø¶Ø± ØªØ³Ù„ÙŠÙ… ÙˆØ§Ø³ØªÙ„Ø§Ù… Ø¹Ù‡Ø¯Ø©</div>
          <div class="sub-title">Custody Handover Protocol</div>
        </div>
        <div class="content">
          <br /><br />
          <table>
            <thead>
              <tr>
                <th width="35%">Ø§Ù„Ø§Ø³Ù… (Item)</th>
                <th width="25%">Ø§Ù„ÙØ¦Ø© (Category)</th>
                <th width="25%">Ø§Ù„Ø­Ø§Ù„Ø© (Status)</th>
                <th width="15%">Ø§Ù„ÙƒÙˆØ¯ (Code)</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <div class="footer">
          <div class="signature-section"><p><strong>ØªÙˆÙ‚ÙŠØ¹ Ø§Ù„Ù…Ø³ØªÙ„Ù…</strong></p><p>Ø§Ù„ØªØ§Ø±ÙŠØ®: ${currentDate}</p><div class="signature-box"></div></div>
          <div class="signature-section"><p><strong>Ø§Ù„Ù…Ø³Ø¤ÙˆÙ„ Ø§Ù„Ø¥Ø¯Ø§Ø±ÙŠ</strong></p><p>Ø§Ù„ØªØ§Ø±ÙŠØ®: ${currentDate}</p><div class="signature-box"></div></div>
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const filteredAssets = assets.filter(a => 
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      a.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-transparent p-6 space-y-8 animate-[fade-in_0.6s_ease-out] dark:text-slate-200">
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/50 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                <Building className="text-[#018790]" size={32}/> Gestion des Actifs
            </h1>
            <p className="text-slate-500 dark:text-slate-300 mt-1 font-medium">Suivez votre inventaire, équipements et mobilier.</p>
          </div>
          <div className="flex gap-3">
            {selectedIds.length > 0 && (
                <button 
                onClick={handlePrintContract}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all font-semibold"
                >
                <Printer size={20} /> Imprimer ({selectedIds.length})
                </button>
            )}
            <button 
              onClick={handlePrintContract}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white/50 text-slate-700 border border-slate-200/50 rounded-xl hover:bg-white/10 transition-all font-semibold"
            >
              <Printer size={20} /> Tout Imprimer
            </button>
            <button 
              onClick={handleOpenAdd}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#018790] text-white rounded-xl hover:bg-[#006a70] transition-all shadow-lg shadow-teal-900/20 font-semibold"
            >
              <Plus size={20} /> Ajouter un actif
            </button>
          </div>
        </div>
        
        <div className="mt-6 max-w-md relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
                type="text" 
                placeholder="Rechercher par nom, catégorie..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#018790]/20 focus:border-[#018790] transition-all" 
            />
        </div>
      </div>

      {/* Assets Grid/List */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/20 border-b border-slate-200/50">
              <tr>
                {/* CHECKBOX COLUMN HEADER */}
                <th className="px-6 py-4 text-left">
                    <input 
                        type="checkbox" 
                        checked={selectedIds.length === filteredAssets.length && filteredAssets.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-[#018790] rounded border-gray-300 focus:ring-[#018790] cursor-pointer accent-[#018790]"
                    />
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actif</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">CatÃ©gorie</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Valeur</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Projet</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fournisseur</th>
                <th className="text-center px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Statut</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAssets.length === 0 ? (
                 <tr>
                    <td colSpan="8" className="p-10 text-center text-slate-400">
                        <div className="flex flex-col items-center">
                            <Building size={40} className="mb-2 opacity-20" />
                            <p>Aucun actif trouvÃ©</p>
                        </div>
                    </td>
                 </tr>
              ) : (
                filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50/80 transition-colors group">
                    {/* CHECKBOX COLUMN ROW */}
                    <td className="px-6 py-4">
                        <input 
                            type="checkbox" 
                            checked={selectedIds.includes(asset.id)}
                            onChange={() => handleSelectOne(asset.id)}
                            className="w-4 h-4 text-[#018790] rounded border-gray-300 focus:ring-[#018790] cursor-pointer accent-[#018790]"
                        />
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <img src={asset.photo} alt={asset.name} className="w-12 h-12 rounded-lg object-cover ring-1 ring-slate-100 bg-slate-50" />
                            <span className="font-bold text-slate-800">{asset.name}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                           {asset.category}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-slate-700">
                        {parseInt(asset.purchaseValue).toLocaleString()} MAD
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-slate-900">{asset.date}</span>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wide">{asset.project}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex flex-col">
                            <span className="text-sm text-slate-700">{asset.supplierName}</span>
                            <span className="text-xs text-slate-400">{asset.supplierPhone}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold
                            ${asset.status === 'Bon Ã©tat' ? 'bg-emerald-100 text-emerald-700' : 
                              asset.status === 'EndommagÃ©' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}
                        `}>
                           {asset.status}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {asset.status !== 'EndommagÃ©' && (
                            <button onClick={() => handleOpenDamage(asset)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Signaler Avarie">
                                <AlertTriangle size={18} />
                            </button>
                        )}
                        <button onClick={() => handleOpenView(asset)} className="p-2 text-slate-400 hover:text-[#018790] hover:bg-[#018790]/10 rounded-lg transition" title="Voir">
                            <Eye size={18} />
                        </button>
                        <button onClick={() => handleOpenEdit(asset)} className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition" title="Modifier">
                            <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(asset.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Supprimer">
                            <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
        onSave={handleSaveDamage}
      />
    </div>
  );
};

export default AssetsPage;
