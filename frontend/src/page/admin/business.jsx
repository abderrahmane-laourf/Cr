import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Edit2, Trash2, X, Check, 
  Briefcase, Key, ChevronLeft, ChevronRight, AlertCircle, CheckCircle
} from 'lucide-react';
import { businessAPI } from '../../services/api';
import Swal from 'sweetalert2';

// --- COMPOSANTS UTILITAIRES ---

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

const InputField = ({ label, type = "text", placeholder, options, value, onChange, disabled }) => (
  <div className="group">
    <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider group-focus-within:text-blue-600 transition-colors">
      {label} {!disabled && <span className="text-red-400">*</span>}
    </label>
    <div className="relative">
      {options ? (
        <div className="relative">
          <select 
            disabled={disabled}
            className={`w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 appearance-none disabled:bg-slate-100 disabled:text-slate-500 cursor-pointer`}
            value={value}
            onChange={onChange}
          >
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          {!disabled && <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><ChevronLeft className="rotate-[-90deg]" size={14} /></div>}
        </div>
      ) : (
        <input 
          type={type} 
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full pl-4 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 disabled:bg-slate-100 disabled:text-slate-500`}
          value={value}
          onChange={onChange}
        />
      )}
    </div>
  </div>
);

const Stepper = ({ step, setStep }) => {
  const steps = [ 
    { id: 1, label: "Infos Business", icon: Briefcase }, 
    { id: 2, label: "Configuration API", icon: Key }
  ];
  
  const progress = ((step - 1) / (steps.length - 1)) * 100;
  
  return (
    <div className="mb-8 px-4">
      <div className="relative h-1 bg-slate-100 rounded-full mb-6 mx-8 mt-2">
        <div className="absolute top-0 left-0 h-full bg-blue-600 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
        <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 flex justify-between">
          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = step >= s.id;
            return (
              <button 
                key={s.id} 
                onClick={() => setStep(s.id)}
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 cursor-pointer
                  ${isActive ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-110' : 'bg-white border-slate-200 text-slate-300 hover:border-blue-300'}`}
                title={s.label}
              >
                <Icon size={16} />
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex justify-between px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
         {steps.map(s => <span key={s.id} className={`${step >= s.id ? 'text-blue-600' : ''}`}>{s.label}</span>)}
      </div>
    </div>
  );
};

const Step1 = ({ formData, handleInputChange, isViewMode }) => (
  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
    <div className="flex justify-center mb-8">
      <div className="w-24 h-24 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
        <Briefcase size={40} />
      </div>
    </div>
    <div className="grid grid-cols-1 gap-5">
      <InputField label="Nom du Business" value={formData.name} onChange={(e) => handleInputChange('name', e)} disabled={isViewMode} placeholder="Ex: Herboclear" />
    </div>
  </div>
);

const Step2 = ({ formData, handleInputChange, isViewMode }) => (
  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
     <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6 flex items-start gap-3">
      <Key className="text-amber-600 shrink-0 mt-0.5" size={18} />
      <div><h4 className="text-sm font-bold text-amber-800">Configuration API</h4><p className="text-xs text-amber-600 mt-1">Ces informations sont sensibles. Assurez-vous de les copier correctement depuis votre fournisseur.</p></div>
    </div>
    <div className="grid grid-cols-1 gap-5">
      <InputField label="ID API" value={formData.apiId} onChange={(e) => handleInputChange('apiId', e)} disabled={isViewMode} placeholder="Ex: API-HERBO-001" />
      <InputField label="Token API" value={formData.apiToken} onChange={(e) => handleInputChange('apiToken', e)} disabled={isViewMode} placeholder="Ex: tk_live_..." />
    </div>
  </div>
);

const BusinessModal = ({ isOpen, onClose, mode, initialData, onSave }) => {
  const [step, setStep] = useState(1);
  
  const emptyForm = {
    name: '',
    apiId: '',
    apiToken: ''
  };

  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      if ((mode === 'edit' || mode === 'view') && initialData) {
        setFormData({ ...emptyForm, ...initialData });
      } else {
        setFormData(emptyForm);
      }
    }
  }, [isOpen, mode, initialData]);

  if (!isOpen) return null;

  const isViewMode = mode === 'view';
  const modalTitle = mode === 'add' ? 'Ajouter un Business' : mode === 'edit' ? 'Modifier le Business' : 'Détails du Business';

  const handleInputChange = (field, e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
          <div><h2 className="text-2xl font-bold text-slate-800">{modalTitle}</h2></div>
          <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors"><X size={24} /></button>
        </div>
        
        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
          <Stepper step={step} setStep={setStep} />
          {step === 1 && <Step1 formData={formData} handleInputChange={handleInputChange} isViewMode={isViewMode} />}
          {step === 2 && <Step2 formData={formData} handleInputChange={handleInputChange} isViewMode={isViewMode} />}
        </div>
        
        <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 rounded-b-3xl flex justify-between items-center">
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} className="px-6 py-2.5 rounded-xl text-slate-600 font-semibold hover:bg-white border border-transparent hover:border-slate-200 flex items-center gap-2 transition-all"><ChevronLeft size={18} /> Précédent</button>
          ) : <div />}
          
          {step < 2 ? (
             <button onClick={() => setStep(step + 1)} className="px-8 py-3 rounded-xl text-white font-semibold flex items-center gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all">Suivant <ChevronRight size={18} /></button>
          ) : (
             !isViewMode && (
                <button onClick={handleSubmit} className="px-8 py-3 rounded-xl text-white font-semibold flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/30 transition-all">
                    <Check size={18} /> {mode === 'add' ? 'Créer' : 'Sauvegarder'}
                </button>
             )
          )}
        </div>
      </div>
    </div>
  );
};

export default function BusinessPage() {
  const [businesses, setBusinesses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    try {
      setLoading(true);
      const data = await businessAPI.getAll();
      setBusinesses(data);
    } catch (error) {
      console.error('Error loading businesses:', error);
      showToast('Erreur de chargement des business', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data) => {
    try {
      if (modalMode === 'add') {
        await businessAPI.create(data);
        showToast("Business ajouté avec succès !", "success");
      } else if (modalMode === 'edit') {
        await businessAPI.update(selectedBusiness.id, data);
        showToast("Modifications enregistrées !", "success");
      }
      setIsModalOpen(false);
      loadBusinesses();
    } catch (error) {
      console.error('Error saving business:', error);
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
        await businessAPI.delete(id);
        Swal.fire('Supprimé !', 'Le business a été supprimé.', 'success');
        loadBusinesses();
      } catch (error) {
        console.error('Error deleting business:', error);
        Swal.fire('Erreur !', 'Une erreur est survenue.', 'error');
      }
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const filteredBusinesses = businesses.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (b.apiId && b.apiId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50/50 p-8 font-sans text-slate-800 relative">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gestion des Business</h1>
            <p className="text-slate-500 mt-1 font-medium">Gérez vos entités commerciales et leurs accès API.</p>
          </div>
          <button 
            onClick={() => { setModalMode('add'); setSelectedBusiness(null); setIsModalOpen(true); }}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 font-semibold"
          >
            <Plus size={20} /> Nouveau Business
          </button>
        </div>
        
        <div className="mt-6 relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher par nom ou ID API..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Key</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Token</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredBusinesses.map((business) => (
                <tr key={business.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs ring-1 ring-blue-100">
                         {business.name?.substring(0,2).toUpperCase()}
                       </div>
                       <span className="font-semibold text-slate-800">{business.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <span className="text-sm font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                        {business.apiId || '-'}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400 font-mono">
                    {business.apiToken ? '••••••••••••••••' : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setModalMode('view'); setSelectedBusiness(business); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 size={18} /></button>
                      <button onClick={() => { setModalMode('edit'); setSelectedBusiness(business); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition"><Key size={18} /></button>
                      <button onClick={() => handleDelete(business.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredBusinesses.length === 0 && (
            <div className="p-10 text-center text-slate-400 flex flex-col items-center">
                <Briefcase size={40} className="mb-2 opacity-20" />
                <p>Aucun business trouvé</p>
            </div>
          )}
        </div>
      </div>

      <BusinessModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        mode={modalMode}
        initialData={selectedBusiness}
        onSave={handleSave}
      />
    </div>
  );
}
