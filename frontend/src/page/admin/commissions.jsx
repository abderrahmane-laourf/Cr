import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  User, Package, Save, RotateCcw, DollarSign, 
  TrendingUp, CheckCircle, AlertCircle, X, ChevronDown, 
  Search, Plus, Trash2, Edit2, AlertTriangle, Briefcase, Zap
} from 'lucide-react';
import { employeeAPI, productAPI } from '../../services/api';
import Swal from 'sweetalert2';
import SpotlightCard from '../../util/SpotlightCard';

// --- MODAL AJOUT/EDITION COMMISSION ---
const AddCommissionModal = ({ isOpen, onClose, onSave, employees, products, defaultEmployeeId, initialData }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    productId: '',
    c1: '',
    c2: '',
    c3: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
            employeeId: initialData.employeeId, // Should be passed
            productId: initialData.productId,
            c1: initialData.c1 || '',
            c2: initialData.c2 || '',
            c3: initialData.c3 || ''
        });
      } else {
        setFormData({
          employeeId: defaultEmployeeId || '',
          productId: '',
          c1: '',
          c2: '',
          c3: ''
        });
      }
    }
  }, [isOpen, defaultEmployeeId, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.employeeId || !formData.productId) {
        Swal.fire('Erreur', 'Veuillez sélectionner un employé et un produit', 'error');
        return;
    }
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <SpotlightCard theme="light" className="w-full max-w-xl flex flex-col animate-in zoom-in-95 duration-200 !p-0 bg-white dark:bg-slate-900">
        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-[#1e3a8a]">
            {initialData ? 'Modifier Commission' : 'Ajouter Commission'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Employé */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Employé</label>
                <div className="relative">
                    <select
                        value={formData.employeeId}
                        onChange={e => setFormData({...formData, employeeId: e.target.value})}
                        disabled={!!initialData || !!defaultEmployeeId} // Disable if editing or pre-selected
                        className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] appearance-none"
                    >
                        <option value="">Sélectionner un employé</option>
                        {employees.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                    </select>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2563EB]">
                        <User size={18} />
                    </div>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
            </div>

            {/* Produit */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Produit</label>
                <div className="relative">
                    <select
                        value={formData.productId}
                        onChange={e => setFormData({...formData, productId: e.target.value})}
                        disabled={!!initialData} // Disable product selection when editing
                        className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] appearance-none"
                    >
                        <option value="">Sélectionner un produit</option>
                        {products.map(prod => (
                            <option key={prod.id} value={prod.id}>{prod.name}</option>
                        ))}
                    </select>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2563EB]">
                        <Package size={18} />
                    </div>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
            </div>

            {/* Commissions */}
            <div className="bg-[#1e3a8a]/5 p-6 rounded-2xl border border-[#1e3a8a]/10 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <DollarSign size={18} className="text-[#2563EB]"/>
                    <h3 className="font-bold text-[#1e3a8a] text-sm">Valeurs Commission (MAD)</h3>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Prix 1</label>
                        <input
                            type="number"
                            placeholder="0"
                            value={formData.c1}
                            onChange={(e) => setFormData({...formData, c1: e.target.value})}
                            className="w-full px-3 py-2 bg-white border border-[#1e3a8a]/20 rounded-lg text-center font-bold text-[#1e3a8a] focus:outline-none focus:border-[#2563EB]"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Prix 2</label>
                        <input
                            type="number"
                            placeholder="0"
                            value={formData.c2}
                            onChange={(e) => setFormData({...formData, c2: e.target.value})}
                            className="w-full px-3 py-2 bg-white border border-[#1e3a8a]/20 rounded-lg text-center font-bold text-[#1e3a8a] focus:outline-none focus:border-[#2563EB]"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Prix 3</label>
                        <input
                            type="number"
                            placeholder="0"
                            value={formData.c3}
                            onChange={(e) => setFormData({...formData, c3: e.target.value})}
                            className="w-full px-3 py-2 bg-white border border-[#1e3a8a]/20 rounded-lg text-center font-bold text-[#1e3a8a] focus:outline-none focus:border-[#2563EB]"
                        />
                    </div>
                </div>
            </div>

            <button type="submit" className="w-full py-4 rounded-xl bg-[#2563EB] text-white font-bold text-lg hover:bg-[#1e3a8a] shadow-xl shadow-blue-900/20 transition-all flex items-center justify-center gap-2">
                <Save size={20} /> Enregistrer
            </button>
        </form>
      </SpotlightCard>
    </div>,
    document.body
  );
};

// --- MODAL BULK APPLY ---
const BulkApplyModal = ({ isOpen, onClose, onSave, preSelectedEmployee, employees }) => {
  const [formData, setFormData] = useState({ c1: '', c2: '', c3: '' });
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
        setFormData({ c1: '', c2: '', c3: '' });
        // Whether we have a pre-selected employee or not
        setSelectedEmployeeId(preSelectedEmployee ? preSelectedEmployee.id : '');
    }
  }, [isOpen, preSelectedEmployee]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedEmployeeId) {
        Swal.fire('Erreur', 'Veuillez sélectionner un employé', 'error');
        return;
    }
    if (!formData.c1 && !formData.c2 && !formData.c3) {
      Swal.fire('Attention', 'Veuillez saisir au moins une valeur', 'warning');
      return;
    }
    // Return the selected employee ID along with the data
    onSave({ ...formData, targetEmployeeId: selectedEmployeeId });
    onClose();
  };
  
  const currentEmployeeName = preSelectedEmployee 
    ? preSelectedEmployee.name 
    : (employees.find(e => String(e.id) === String(selectedEmployeeId))?.name || '...');

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <SpotlightCard theme="light" className="w-full max-w-lg flex flex-col animate-in zoom-in-95 duration-200 !p-0 bg-white dark:bg-slate-900">
        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
            <div>
                <h2 className="text-xl font-bold text-[#1e3a8a]">Application Rapide</h2>
                <p className="text-xs text-slate-500 mt-1">
                    Appliquer à TOUS les produits pour <span className="font-bold text-[#2563EB]">{currentEmployeeName}</span>
                </p>
            </div>
          <button onClick={onClose} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
            
            {/* Si aucun employé présélectionné (Header Click), afficher le Select */}
            {!preSelectedEmployee && (
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Employé Cible</label>
                    <div className="relative">
                        <select
                            value={selectedEmployeeId}
                            onChange={e => setSelectedEmployeeId(e.target.value)}
                            className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] appearance-none"
                        >
                            <option value="">-- Choisir un employé --</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.name}</option>
                            ))}
                        </select>
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2563EB]">
                            <User size={18} />
                        </div>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                </div>
            )}

            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex gap-3 items-start">
                <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={18} />
                <p className="text-xs text-orange-800 leading-relaxed">
                    Cette action va <strong>écraser</strong> toutes les commissions existantes de cet employé et appliquer ces valeurs à <strong>tous les produits</strong>.
                </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Prix 1</label>
                    <input
                        type="number"
                        placeholder="0"
                        value={formData.c1}
                        onChange={(e) => setFormData({...formData, c1: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-center font-bold text-[#1e3a8a] focus:outline-none focus:border-[#2563EB]"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Prix 2</label>
                    <input
                        type="number"
                        placeholder="0"
                        value={formData.c2}
                        onChange={(e) => setFormData({...formData, c2: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-center font-bold text-[#1e3a8a] focus:outline-none focus:border-[#2563EB]"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Prix 3</label>
                    <input
                        type="number"
                        placeholder="0"
                        value={formData.c3}
                        onChange={(e) => setFormData({...formData, c3: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-center font-bold text-[#1e3a8a] focus:outline-none focus:border-[#2563EB]"
                    />
                </div>
            </div>

            <div className="flex gap-3 pt-4">
                <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition">
                    Annuler
                </button>
                <button type="submit" className="flex-[2] py-3 bg-[#2563EB] text-white font-bold rounded-xl hover:bg-[#1e3a8a] shadow-lg shadow-blue-900/20 transition flex items-center justify-center gap-2">
                    <TrendingUp size={18} /> Appliquer à tous
                </button>
            </div>
        </form>
      </SpotlightCard>
    </div>,
    document.body
  );
};


// --- PAGE PRINCIPALE ---
const CommissionsPage = () => {
    const [employees, setEmployees] = useState([]);
    const [products, setProducts] = useState([]);
    const [commissions, setCommissions] = useState({});
    
    // UI State
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedEmployeeId, setExpandedEmployeeId] = useState(null);
    
    // Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null); 
    const [preSelectedEmployeeId, setPreSelectedEmployeeId] = useState(null);

    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [bulkEmployee, setBulkEmployee] = useState(null); // If null, means triggered from header

    // Initial Load
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [empsData, prodsData] = await Promise.all([
                employeeAPI.getAll(),
                productAPI.getAll()
            ]);
            setEmployees(empsData);
            setProducts(prodsData);
            
            const savedCommissions = JSON.parse(localStorage.getItem('sys_commissions') || '{}');
            setCommissions(savedCommissions);
        } catch (error) {
            console.error('Erreur chargement:', error);
            Swal.fire('Erreur', 'Impossible de charger les données: ' + error.message, 'error');
        }
    };

    const saveCommissionsToStorage = (newCommissions) => {
        setCommissions(newCommissions);
        localStorage.setItem('sys_commissions', JSON.stringify(newCommissions));
    };

    const handleSaveCommission = (data) => {
        const { employeeId, productId, c1, c2, c3 } = data;
        
        const newCommissions = { ...commissions };
        if (!newCommissions[employeeId]) newCommissions[employeeId] = {};
        
        newCommissions[employeeId][productId] = { c1, c2, c3 };
        
        saveCommissionsToStorage(newCommissions);
        Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: 'Commission enregistrée',
            timer: 1000,
            showConfirmButton: false
        });
        
        if (expandedEmployeeId !== employeeId) setExpandedEmployeeId(employeeId);
    };

    const handleBulkApply = (data) => {
        const { c1, c2, c3, targetEmployeeId } = data;
        
        // Find the employee object for confirmation message
        const targetEmployee = employees.find(e => String(e.id) === String(targetEmployeeId));
        if (!targetEmployee) return;

        const newCommissions = { ...commissions };
        if (!newCommissions[targetEmployeeId]) newCommissions[targetEmployeeId] = {};

        // Loop all products and set commissions
        products.forEach(prod => {
             newCommissions[targetEmployeeId][prod.id] = { 
                 c1: c1 !== '' ? c1 : (newCommissions[targetEmployeeId][prod.id]?.c1 || ''),
                 c2: c2 !== '' ? c2 : (newCommissions[targetEmployeeId][prod.id]?.c2 || ''),
                 c3: c3 !== '' ? c3 : (newCommissions[targetEmployeeId][prod.id]?.c3 || '')
             };
        });

        saveCommissionsToStorage(newCommissions);
        Swal.fire({
            icon: 'success', 
            title: 'Mise à jour réussie',
            text: `Les commissions ont été appliquées à ${products.length} produits pour ${targetEmployee.name}`,
            timer: 1500,
            showConfirmButton: false
        });
        setExpandedEmployeeId(targetEmployeeId);
    };

    const handleDeleteCommission = (empId, prodId) => {
        Swal.fire({
            title: 'Supprimer ?',
            text: "Irréversible.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonText: 'Annuler'
        }).then((result) => {
            if (result.isConfirmed) {
                const newCommissions = { ...commissions };
                if (newCommissions[empId]) {
                    delete newCommissions[empId][prodId];
                    if (Object.keys(newCommissions[empId]).length === 0) {
                        delete newCommissions[empId];
                    }
                }
                saveCommissionsToStorage(newCommissions);
                Swal.fire('Supprimé', '', 'success');
            }
        });
    };
    
    const handleResetAll = () => {
         Swal.fire({
            title: 'Réinitialiser TOUT ?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Tout effacer',
            cancelButtonText: 'Annuler'
        }).then((result) => {
            if(result.isConfirmed) {
                saveCommissionsToStorage({});
                Swal.fire('Réinitialisé', '', 'success');
            }
        });
    };

    const filteredEmployees = employees.filter(emp => 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleEmployee = (id) => {
        setExpandedEmployeeId(expandedEmployeeId === id ? null : id);
    };

    const openModal = (empId = null, existingData = null) => {
        setPreSelectedEmployeeId(empId);
        setModalData(existingData); 
        setIsModalOpen(true);
    };

    const openBulkModal = (employee = null) => {
        setBulkEmployee(employee);
        setIsBulkModalOpen(true);
    };

    return (
        <div className="w-full min-h-screen bg-transparent animate-[fade-in_0.6s_ease-out] p-8 font-sans text-slate-800 dark:text-slate-200">
            
            {/* Header */}
            <SpotlightCard theme="light" className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-[#2563EB] tracking-tight flex items-center gap-3">
                            <DollarSign className="text-[#1e3a8a]" size={32} />
                            Gestion Commissions
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium">Configurez les commissions par produit pour chaque employé.</p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={handleResetAll}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all font-semibold border border-red-100"
                            title="Réinitialiser toutes les commissions"
                        >
                            <RotateCcw size={20} />
                        </button>
                        
                        {/* GLOBAL BULK APPLY */}
                         <button 
                            onClick={() => openBulkModal(null)}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#e0e7ff] text-[#2563EB] rounded-xl hover:bg-[#dbeafe] transition-all font-bold border border-[#2563EB]/10"
                            title="Appliquer à tous (Bulk Global)"
                        >
                            <Zap size={20} /> <span className="hidden sm:inline">Bulk Apply</span>
                        </button>

                        <button 
                            onClick={() => openModal()}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#2563EB] text-white rounded-xl hover:bg-[#1e3a8a] transition-all shadow-lg shadow-blue-900/20 font-semibold"
                        >
                            <Plus size={20} /> Ajouter Commission
                        </button>
                    </div>
                </div>
                <div className="relative mt-6 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2563EB]/50" size={20} />
                    <input 
                        type="text" 
                        placeholder="Chercher un employé..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all" 
                    />
                </div>
            </SpotlightCard>

            {/* Liste Accordéon */}
            <div className="space-y-4">
                {filteredEmployees.map(employee => {
                    const empCommissions = commissions[employee.id] || {};
                    const commissionCount = Object.keys(empCommissions).length;
                    const isExpanded = expandedEmployeeId === employee.id;

                    return (
                        <SpotlightCard theme="light" key={employee.id} className={`!border transition-all duration-300 overflow-hidden !p-0 ${isExpanded ? '!border-[#2563EB] shadow-md' : '!border-slate-200 shadow-sm'}`}>
                            
                            {/* Header de la carte employé */}
                            <div onClick={() => toggleEmployee(employee.id)} className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-colors overflow-hidden ${isExpanded ? 'bg-[#2563EB]/10 ring-4 ring-[#2563EB]/5' : 'bg-slate-100'}`}>
                                        <User size={24} className={isExpanded ? 'text-[#2563EB]' : 'text-slate-400'} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg">{employee.name}</h3>
                                        <div className="flex gap-3 mt-1 text-xs font-bold text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <Briefcase size={12} /> {employee.role || 'Employé'}
                                            </span>
                                            <span className="text-slate-300">|</span>
                                            <span className={`${commissionCount > 0 ? 'text-[#2563EB]' : 'text-slate-400'}`}>
                                                {commissionCount} produits configurés
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* BULK APPLY BUTTON (Individual) */}
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openBulkModal(employee);
                                        }}
                                        className="h-9 px-4 rounded-xl flex items-center gap-2 bg-[#2563EB]/10 text-[#2563EB] hover:bg-[#2563EB] hover:text-white transition-all text-xs font-bold border border-[#2563EB]/20"
                                        title="Appliquer commisions à tous"
                                    >
                                        <Zap size={16} className={isExpanded ? "animate-pulse" : ""} />
                                        <span className="hidden sm:inline">Bulk Apply</span>
                                    </button>
                                    
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openModal(employee.id);
                                        }}
                                        className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-[#2563EB] hover:text-white transition-all border border-slate-200"
                                        title="Ajouter une commission unique"
                                    >
                                        <Plus size={18} />
                                    </button>
                                    
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${isExpanded ? 'bg-[#2563EB] text-white rotate-180' : 'bg-white text-slate-300'}`}>
                                        <ChevronDown size={20} />
                                    </div>
                                </div>
                            </div>

                            {/* Contenu Déroulant (Tableau des commissions) */}
                            {isExpanded && (
                                <div className="border-t border-slate-100 bg-slate-50/50 p-6 animate-in slide-in-from-top-2">
                                    {commissionCount > 0 ? (
                                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-[#2563EB]/5 text-[#1e3a8a] font-bold uppercase text-xs border-b border-[#2563EB]/10">
                                                    <tr>
                                                        <th className="px-5 py-3">Produit</th>
                                                        <th className="px-5 py-3 text-center">Comm. Prix 1</th>
                                                        <th className="px-5 py-3 text-center">Comm. Prix 2</th>
                                                        <th className="px-5 py-3 text-center">Comm. Prix 3</th>
                                                        <th className="px-5 py-3 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {Object.entries(empCommissions).map(([prodId, comms]) => {
                                                        const product = products.find(p => String(p.id) === String(prodId));
                                                        // Skip if product not found (deleted?)
                                                        if (!product) return null;

                                                        return (
                                                            <tr key={prodId} className="hover:bg-slate-50 transition-colors">
                                                                <td className="px-5 py-3">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-500">
                                                                            <Package size={16} />
                                                                        </div>
                                                                        <span className="font-semibold text-slate-700">{product.name}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-5 py-3 text-center">
                                                                    {comms.c1 ? <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">{comms.c1} DH</span> : <span className="text-slate-300">-</span>}
                                                                </td>
                                                                <td className="px-5 py-3 text-center">
                                                                    {comms.c2 ? <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">{comms.c2} DH</span> : <span className="text-slate-300">-</span>}
                                                                </td>
                                                                <td className="px-5 py-3 text-center">
                                                                    {comms.c3 ? <span className="font-bold text-violet-600 bg-violet-50 px-2 py-1 rounded border border-violet-100">{comms.c3} DH</span> : <span className="text-slate-300">-</span>}
                                                                </td>
                                                                <td className="px-5 py-3 text-right">
                                                                    <div className="flex items-center justify-end gap-2">
                                                                        <button 
                                                                            onClick={() => openModal(employee.id, { ...comms, productId: prodId, employeeId: employee.id })}
                                                                            className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition"
                                                                            title="Modifier"
                                                                        >
                                                                            <Edit2 size={16}/>
                                                                        </button>
                                                                        <button 
                                                                            onClick={() => handleDeleteCommission(employee.id, prodId)}
                                                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                                                            title="Supprimer"
                                                                        >
                                                                            <Trash2 size={16}/>
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                                            <AlertTriangle size={32} className="mx-auto mb-2 opacity-20"/>
                                            <p className="text-sm">Aucune commission configurée.</p>
                                            <div className="flex gap-3 justify-center mt-4">
                                                <button 
                                                    onClick={() => openBulkModal(employee)}
                                                    className="px-4 py-2 bg-[#2563EB]/10 text-[#2563EB] text-sm font-bold rounded-lg hover:bg-[#2563EB] hover:text-white transition-all flex items-center gap-2"
                                                >
                                                    <Zap size={16} /> Configurer Tout (Bulk)
                                                </button>
                                                <button 
                                                    onClick={() => openModal(employee.id)}
                                                    className="px-4 py-2 bg-slate-100 text-slate-600 text-sm font-bold rounded-lg hover:bg-slate-200 transition-all flex items-center gap-2"
                                                >
                                                    <Plus size={16} /> Unique
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </SpotlightCard>
                    );
                })}
            </div>

            {/* Modal Add Single */}
            <AddCommissionModal 
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setModalData(null); }}
                onSave={handleSaveCommission}
                employees={employees}
                products={products}
                defaultEmployeeId={preSelectedEmployeeId}
                initialData={modalData}
            />

            {/* Modal Bulk */}
            <BulkApplyModal
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                onSave={handleBulkApply}
                preSelectedEmployee={bulkEmployee}
                employees={employees}
                employeeName={bulkEmployee?.name}
            />

        </div>
    );
};

export default CommissionsPage;
