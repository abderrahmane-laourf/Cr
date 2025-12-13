import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Edit2, Trash2, Eye, X, Upload, Check, 
  User, FileText, Shield, ChevronLeft, ChevronRight, EyeOff, 
  Camera, AlertCircle, CheckCircle, Lock, ChevronDown, Briefcase 
} from 'lucide-react';
import { employeeAPI } from '../../services/api';
import Swal from 'sweetalert2';
import SpotlightCard from '../../util/SpotlightCard';

// --- 1. CONSTANTES & DONNÉES ---

const PERMISSION_MODULES = [
  {
    category: "Tableau de bord & Général",
    items: [
      { id: 'dashboard', label: 'Tableau de bord' },
      { id: 'cities', label: 'Villes' },
      { id: 'blacklist', label: 'Black List' },
    ]
  },
  {
    category: "Gestion des Colis",
    items: [
      { id: 'parcels_view', label: 'Voir les Colis' },
      { id: 'parcels_all', label: 'Voir tous les colis' },
      { id: 'parcels_tracking', label: 'Suivi' },
      { id: 'claims', label: 'Réclamations' },
      { id: 'pickup', label: 'Ramassage' },
    ]
  },
  {
    category: "Documents & Bons",
    items: [
      { id: 'delivery_note', label: 'Bons de livraison' },
      { id: 'receipt_note', label: 'Bons de réception' },
      { id: 'return_note', label: 'Bons de retour' },
      { id: 'crbt', label: 'CRBT' },
    ]
  },
  {
    category: "Produits & Stocks",
    items: [
      { id: 'products', label: 'Produits' },
    ]
  },
  {
    category: "Configuration Étiquettes",
    items: [
      { id: 'label_name', label: 'Afficher le nom sur l\'étiquette' },
      { id: 'label_phone', label: 'Afficher le téléphone sur l\'étiquette' },
    ]
  },
  {
    category: "Finance",
    items: [
      { id: 'payments', label: 'Paiements' },
    ]
  }
];

// --- 2. COMPOSANTS UTILITAIRES ---

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
    <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider group-focus-within:text-[#018790] transition-colors">
      {label} {!disabled && <span className="text-rose-400">*</span>}
    </label>
    <div className="relative">
      {options ? (
        <div className="relative">
          <select 
            disabled={disabled}
            className={`w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:bg-white focus:border-[#018790] focus:ring-4 focus:ring-[#018790]/10 outline-none transition-all duration-200 appearance-none disabled:bg-slate-100 disabled:text-slate-500 cursor-pointer`}
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
          className={`w-full pl-4 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm placeholder-slate-400 focus:bg-white focus:border-[#018790] focus:ring-4 focus:ring-[#018790]/10 outline-none transition-all duration-200 disabled:bg-slate-100 disabled:text-slate-500`}
          value={value}
          onChange={onChange}
        />
      )}
    </div>
  </div>
);

// --- SOUS-COMPOSANTS DU MODAL (STEPS) ---

const Stepper = ({ step, setStep }) => {
  // 4 étapes maintenant
  const steps = [ 
    { id: 1, label: "Infos", icon: User }, 
    { id: 2, label: "Docs", icon: FileText }, 
    { id: 3, label: "Accès", icon: Shield }
  ];
  
  const progress = ((step - 1) / (steps.length - 1)) * 100;
  
  return (
    <div className="mb-8 px-4">
      <div className="relative h-1 bg-slate-100 rounded-full mb-6 mx-8 mt-2">
        <div className="absolute top-0 left-0 h-full bg-[#018790] rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
        <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 flex justify-between">
          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = step >= s.id;
            return (
              <button 
                key={s.id} 
                // ICI : On rend l'icône cliquable pour naviguer
                onClick={() => setStep(s.id)}
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 cursor-pointer
                  ${isActive ? 'bg-[#005461] border-[#005461] text-white shadow-lg scale-110' : 'bg-white border-slate-200 text-slate-300 hover:border-[#018790]/50'}`}
                title={s.label}
              >
                <Icon size={16} />
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex justify-between px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
         {steps.map(s => <span key={s.id} className={`${step >= s.id ? 'text-[#005461]' : ''}`}>{s.label}</span>)}
      </div>
    </div>
  );
};

const Step1 = ({ formData, handleInputChange, isViewMode, setFormData }) => (
  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
    <div className="flex justify-center mb-8">
      <div className="relative group">
        <div className="w-28 h-28 rounded-full bg-slate-50 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden ring-1 ring-slate-100">
           {formData.avatar ? <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <User size={40} className="text-slate-300" />}
        </div>
        {!isViewMode && (
          <label className="absolute bottom-1 right-1 bg-[#018790] p-2.5 rounded-full text-white cursor-pointer shadow-lg hover:bg-[#005461] transition-all">
            <Camera size={16} />
            <input type="button" className="hidden" onClick={() => setFormData(p => ({...p, avatar: 'https://i.pravatar.cc/150?img=' + Math.floor(Math.random()*50)}))} />
          </label>
        )}
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <InputField label="Prénom" value={formData.firstName} onChange={(e) => handleInputChange('firstName', e)} disabled={isViewMode} />
      <InputField label="Nom" value={formData.lastName} onChange={(e) => handleInputChange('lastName', e)} disabled={isViewMode} />
      <InputField label="Téléphone Personnelle" value={formData.phone} onChange={(e) => handleInputChange('phone', e)} disabled={isViewMode} />
      <InputField label="CIN" value={formData.cin} onChange={(e) => handleInputChange('cin', e)} disabled={isViewMode} />
      <InputField label="N° CNSS" value={formData.cnss} onChange={(e) => handleInputChange('cnss', e)} disabled={isViewMode} />
      <InputField label="Salaire (MAD)" type="number" value={formData.salary} onChange={(e) => handleInputChange('salary', e)} disabled={isViewMode} />
      <InputField label="Banque" type="select" options={["CIH", "Attijari", "BMCE"]} value={formData.bank} onChange={(e) => handleInputChange('bank', e)} disabled={isViewMode} />
      <InputField label="RIB" value={formData.rib} onChange={(e) => handleInputChange('rib', e)} disabled={isViewMode} />
      <InputField label="Business" type="select" options={["Herboclear", "Commit"]} value={formData.business} onChange={(e) => handleInputChange('business', e)} disabled={isViewMode} />
    </div>
  </div>
);

const Step2 = ({ isViewMode }) => (
  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
     <div className="bg-[#005461]/5 border border-[#005461]/10 rounded-xl p-4 mb-6 flex items-start gap-3">
      <AlertCircle className="text-[#018790] shrink-0 mt-0.5" size={18} />
      <div><h4 className="text-sm font-bold text-[#005461]">Documents</h4><p className="text-xs text-[#018790] mt-1">Gérer les documents ici (CIN, Contrat, Diplôme).</p></div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {['cin', 'contract', 'diploma', 'non_concurrence'].map(key => (
          <div key={key} className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center ${isViewMode ? 'opacity-70 bg-slate-50' : 'hover:border-[#018790] cursor-pointer bg-white group'}`}>
              <div className="w-10 h-10 rounded-full bg-[#005461]/5 text-[#018790] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"><Upload size={20}/></div>
              <h4 className="text-sm font-bold text-slate-700 capitalize">{key}</h4>
          </div>
      ))}
    </div>
  </div>
);

const Step3 = ({ formData, handleInputChange, isViewMode, showPassword, setShowPassword }) => (
  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
    <div className="bg-slate-50 p-6 rounded-2xl mb-6 border border-slate-100">
      <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><Shield size={16} className="text-[#018790]"/> Connexion</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputField label="Login" value={formData.login} onChange={(e) => handleInputChange('login', e)} disabled={isViewMode} />
          <div className="relative">
              <InputField label="Mot de passe" type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => handleInputChange('password', e)} disabled={isViewMode} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 bottom-3 text-slate-400 hover:text-[#018790]"><Eye size={18}/></button>
          </div>
          <div className="md:col-span-2">
              <InputField label="Rôle" type="select" options={["Employé", "Manager", "Admin"]} value={formData.role} onChange={(e) => handleInputChange('role', e)} disabled={isViewMode} />
          </div>
      </div>
    </div>
  </div>
);

// --- NOUVELLE ÉTAPE : PERMISSIONS ---
const Step4 = ({ formData, toggleCategory, togglePermission, isViewMode }) => (
  <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
    <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-start gap-3">
      <Lock className="text-orange-600 shrink-0 mt-0.5" size={18} />
      <div>
        <h4 className="text-sm font-bold text-orange-800">Permissions Avancées</h4>
        <p className="text-xs text-orange-600 mt-1">
          Définissez précisément ce que cet utilisateur peut voir ou faire.
        </p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {PERMISSION_MODULES.map((module, idx) => {
        const allSelected = module.items.every(i => (formData.permissions || []).includes(i.id));
        
        return (
          <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
            {/* En-tête de catégorie */}
            <div 
              className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center cursor-pointer hover:bg-slate-100"
              onClick={() => toggleCategory(module.items)}
            >
              <h4 className="font-bold text-sm text-slate-700">{module.category}</h4>
              {!isViewMode && (
                <span className={`text-xs px-2 py-0.5 rounded-full border ${allSelected ? 'bg-[#005461]/10 text-[#005461] border-[#005461]/20' : 'bg-white text-slate-500 border-slate-200'}`}>
                  {allSelected ? 'Tout' : 'Sélect'}
                </span>
              )}
            </div>
            
            {/* Liste des permissions */}
            <div className="p-3 space-y-2">
              {module.items.map(item => {
                const isChecked = (formData.permissions || []).includes(item.id);
                return (
                  <div 
                    key={item.id} 
                    onClick={() => togglePermission(item.id)}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-200 select-none
                      ${isViewMode ? 'cursor-default' : 'cursor-pointer hover:bg-slate-50'}
                      ${isChecked ? 'bg-[#005461]/5' : ''}
                    `}
                  >
                    <div className={`
                      w-5 h-5 rounded border flex items-center justify-center transition-colors
                      ${isChecked 
                        ? 'bg-[#005461] border-[#005461] text-white' 
                        : 'bg-white border-slate-300 text-transparent'}
                    `}>
                      <Check size={12} strokeWidth={4} />
                    </div>
                    <span className={`text-sm ${isChecked ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

// --- 3. MODAL PRINCIPAL ---

const EmployeeModal = ({ isOpen, onClose, mode, initialData, onSave }) => {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  
  // État initial vide
  const emptyForm = {
    avatar: '',
    firstName: '', lastName: '', phone: '', cin: '', cnss: '',
    salary: '', bank: 'CIH', rib: '', project: 'Alpha', business: 'Herboclear',
    login: '', password: '', role: 'Employé',
    permissions: [] // Ajout du tableau de permissions
  };

  const [formData, setFormData] = useState(emptyForm);

  // Reset ou remplissage du formulaire à l'ouverture
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      if ((mode === 'edit' || mode === 'view') && initialData) {
        // On s'assure que permissions existe bien
        setFormData({ ...emptyForm, ...initialData, permissions: initialData.permissions || [] });
      } else {
        setFormData(emptyForm);
      }
    }
  }, [isOpen, mode, initialData]);

  if (!isOpen) return null;

  const isViewMode = mode === 'view';
  const modalTitle = mode === 'add' ? 'Ajouter un Employé' : mode === 'edit' ? 'Modifier l\'Employé' : 'Détails de l\'Employé';

  const handleInputChange = (field, e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  // Gestion des permissions (Case à cocher unique)
  const togglePermission = (id) => {
    if (isViewMode) return;
    setFormData(prev => {
      const currentPerms = prev.permissions || [];
      if (currentPerms.includes(id)) {
        return { ...prev, permissions: currentPerms.filter(p => p !== id) };
      } else {
        return { ...prev, permissions: [...currentPerms, id] };
      }
    });
  };

  // Gestion des permissions (Tout cocher/décocher par catégorie)
  const toggleCategory = (items) => {
    if (isViewMode) return;
    const itemIds = items.map(i => i.id);
    const currentPerms = formData.permissions || [];
    const allSelected = itemIds.every(id => currentPerms.includes(id));

    setFormData(prev => {
      let newPerms = [...(prev.permissions || [])];
      if (allSelected) {
        // Tout décocher
        newPerms = newPerms.filter(id => !itemIds.includes(id));
      } else {
        // Tout cocher (sans doublons)
        itemIds.forEach(id => {
          if (!newPerms.includes(id)) newPerms.push(id);
        });
      }
      return { ...prev, permissions: newPerms };
    });
  };

  const handleSubmit = () => {
    const fullName = `${formData.firstName} ${formData.lastName}`;
    onSave({ ...formData, name: fullName });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <SpotlightCard theme="light" className="w-full max-w-4xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 !p-0 !bg-white/80">
        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100/50">
          <div><h2 className="text-2xl font-bold text-[#005461]">{modalTitle}</h2></div>
          <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-full transition-colors"><X size={24} /></button>
        </div>
        
        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
          <Stepper step={step} setStep={setStep} />
          {step === 1 && <Step1 formData={formData} handleInputChange={handleInputChange} isViewMode={isViewMode} setFormData={setFormData} />}
          {step === 2 && <Step2 isViewMode={isViewMode} />}
          {step === 3 && <Step3 formData={formData} handleInputChange={handleInputChange} isViewMode={isViewMode} showPassword={showPassword} setShowPassword={setShowPassword} />} 
        </div>
        
        <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 rounded-b-3xl flex justify-between items-center">
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} className="px-6 py-2.5 rounded-xl text-slate-600 font-semibold hover:bg-white border border-transparent hover:border-slate-200 flex items-center gap-2 transition-all"><ChevronLeft size={18} /> Précédent</button>
          ) : <div />}
          
          {step < 3 ? (
             <button onClick={() => setStep(step + 1)} className="px-8 py-3 rounded-xl text-white font-semibold flex items-center gap-2 bg-[#005461] hover:bg-[#016f76] shadow-lg shadow-cyan-900/20 transition-all">Suivant <ChevronRight size={18} /></button>
          ) : (
             !isViewMode && (
                <button onClick={handleSubmit} className="px-8 py-3 rounded-xl text-white font-semibold flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/30 transition-all">
                    <Check size={18} /> {mode === 'add' ? 'Créer le compte' : 'Sauvegarder'}
                </button>
             )
          )}
        </div>
      </SpotlightCard>
    </div>
  );
};

// --- 4. PAGE PRINCIPALE ---

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [businessFilter, setBusinessFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  
  // États pour le Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'view'
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  // État pour le Toast
  const [toast, setToast] = useState(null);

  // --- FETCH EMPLOYEES ON MOUNT ---
  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeAPI.getAll();
      setEmployees(data);
    } catch (error) {
      console.error('Error loading employees:', error);
      showToast('Erreur de chargement des employés', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS CRUD ---

  const handleSave = async (employeeData) => {
    try {
      if (modalMode === 'add') {
        const newEmployee = {
          ...employeeData,
          active: true,
          avatar: employeeData.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`
        };
        await employeeAPI.create(newEmployee);
        showToast("Employé ajouté avec succès !", "success");
      } else if (modalMode === 'edit') {
        await employeeAPI.update(selectedEmployee.id, employeeData);
        showToast("Modifications enregistrées !", "success");
      }
      setIsModalOpen(false);
      loadEmployees(); // Refresh list
    } catch (error) {
      console.error('Error saving employee:', error);
      showToast('Erreur lors de la sauvegarde', 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Vous ne pourrez pas revenir en arrière !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        await employeeAPI.delete(id);
        Swal.fire(
          'Supprimé !',
          'L\'employé a été supprimé.',
          'success'
        );
        loadEmployees(); // Refresh list
      } catch (error) {
        console.error('Error deleting employee:', error);
        Swal.fire(
          'Erreur !',
          'Une erreur est survenue lors de la suppression.',
          'error'
        );
      }
    }
  };

  const handleOpenView = (employee) => {
    setModalMode('view');
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (employee) => {
    setModalMode('edit');
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleOpenAdd = () => {
    setModalMode('add');
    setSelectedEmployee(null);
    setIsModalOpen(true);
  };

  const toggleStatus = async (id) => {
    try {
      const employee = employees.find(emp => emp.id === id);
      const newStatus = !employee.active;
      await employeeAPI.patch(id, { active: newStatus });
      showToast(newStatus ? "Employé activé" : "Employé désactivé", "success");
      loadEmployees(); // Refresh list
    } catch (error) {
      console.error('Error toggling status:', error);
      showToast('Erreur lors du changement de statut', 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = (emp.name && emp.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (emp.phone && emp.phone.includes(searchTerm)) ||
      (emp.cin && emp.cin.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'All' || emp.role === roleFilter;
    const matchesBusiness = businessFilter === 'All' || emp.business === businessFilter;
    return matchesSearch && matchesRole && matchesBusiness;
  });

  return (
    <div className="w-full min-h-screen bg-transparent animate-[fade-in_0.6s_ease-out] p-6 font-sans text-slate-800 relative space-y-8">
      
      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-transparent p-6 rounded-3xl border border-slate-100/50">
        <div>
          <h1 className="text-2xl font-extrabold text-[#018790]">Gestion des Employés</h1>
          <p className="text-slate-500">Visualisez et gérez votre équipe efficacement.</p>
        </div>
        <div className="mt-4 sm:mt-0">
            <button 
                onClick={handleOpenAdd}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#005461] hover:bg-[#016f76] text-white rounded-xl transition-all shadow-lg shadow-cyan-900/20 font-bold"
            >
                <Plus size={20} /> Ajouter un membre
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
                        placeholder="Nom, tél ou CIN..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#018790]/10 focus:border-[#018790] transition-all" 
                    />
                </div>
            </div>
            
            {/* Role Filter */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Shield size={12}/> Rôle</label>
                <div className="relative">
                    <select 
                    value={roleFilter} 
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#018790]/10 focus:border-[#018790] transition-all appearance-none cursor-pointer"
                    >
                    <option value="All">Tous les rôles</option>
                    <option value="Employé">Employé</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
            </div>

            {/* Business Filter */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Briefcase size={12}/> Business</label>
                <div className="relative">
                    <select 
                    value={businessFilter} 
                    onChange={(e) => setBusinessFilter(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#018790]/10 focus:border-[#018790] transition-all appearance-none cursor-pointer"
                    >
                    <option value="All">Tous les Business</option>
                    <option value="Herboclear">Herboclear</option>
                    <option value="Commit">Commit</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
            </div>
         </div>
      </div>

      {/* Table */}
      <SpotlightCard theme="light" className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#005461]/5 border-b border-[#005461]/10">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-bold text-[#005461] uppercase tracking-wider">Employé</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-[#005461] uppercase tracking-wider">Contact</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-[#005461] uppercase tracking-wider">CIN / Rôle</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-[#005461] uppercase tracking-wider">Statut</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-[#005461] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                         <img src={employee.avatar} alt={employee.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm" />
                         <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${employee.active ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                      </div>
                      <div>
                        <span className="block font-semibold text-slate-800">{employee.name}</span>
                        <span className="text-xs text-slate-400">{employee.business}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">{employee.phone}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-start gap-1">
                        <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">{employee.cin}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase
                            ${employee.role === 'Manager' ? 'bg-purple-100 text-purple-700' : 
                            employee.role === 'Admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-50 text-blue-600'}`}>
                        {employee.role}
                        </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <button onClick={() => toggleStatus(employee.id)}>
                        <div className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${employee.active ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${employee.active ? 'translate-x-5' : ''}`} />
                        </div>
                     </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenView(employee)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Voir"><Eye size={18} /></button>
                      <button onClick={() => handleOpenEdit(employee)} className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition" title="Modifier"><Edit2 size={18} /></button>
                      <button onClick={() => handleDelete(employee.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Supprimer"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredEmployees.length === 0 && (
            <div className="p-10 text-center text-slate-400 flex flex-col items-center">
                <Search size={40} className="mb-2 opacity-20" />
                <p>Aucun employé trouvé</p>
            </div>
          )}
        </div>
      </SpotlightCard>

      {/* Integration du Modal */}
      <EmployeeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        mode={modalMode}
        initialData={selectedEmployee}
        onSave={handleSave}
      />
    </div>
  );
}