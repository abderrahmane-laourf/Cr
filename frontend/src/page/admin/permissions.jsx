import React, { useState, useEffect } from 'react';
import {
  Search, Plus, Edit2, Trash2, Eye, X, Check,
  LayoutDashboard, Users, Box, Workflow, Package, ShoppingCart,
  Factory, Megaphone, ListTodo, Building, Wallet,
  Coins, FileText, Settings, Key, Lock, Shield,
  Filter, Briefcase, UserSearch, Trophy, ShieldCheck, Zap, ScanBarcode, Truck
} from 'lucide-react';
import { employeeAPI } from '../../services/api';
import SpotlightCard from '../../util/SpotlightCard';

// --- 1. CONFIGURATION DES ACTIONS ---
const ACTION_TYPES = {
  // Standard
  view:   { id: 'view',   label: 'Voir',      color: 'emerald', icon: Eye },
  create: { id: 'create', label: 'Ajout',     color: 'blue',    icon: Plus },
  edit:   { id: 'edit',   label: 'Modif.',    color: 'amber',   icon: Edit2 },
  delete: { id: 'delete', label: 'Suppr.',    color: 'red',     icon: Trash2 },
  
  // Custom for Employees
  process: { id: 'process', label: 'Scanner/Traiter', color: 'purple', icon: ScanBarcode },
  update_status: { id: 'update_status', label: 'Changer Statut', color: 'cyan', icon: Zap },

  // Filters
  filter_pipeline: { id: 'filter_pipeline', label: 'Filtre Pipeline',  color: 'violet', icon: Filter },
  filter_employee: { id: 'filter_employee', label: 'Filtre Employé',   color: 'indigo', icon: UserSearch },
  filter_business: { id: 'filter_business', label: 'Filtre Business',  color: 'pink',   icon: Briefcase },
};

// --- DATA: MODULES ADMIN / MANAGER ---
const ADMIN_MODULES = [
  {
    category: "Tableau de bord",
    icon: LayoutDashboard,
    items: [
      { id: 'main_dashboard', label: 'Vue d\'ensemble', actions: ['view'] },
    ]
  },
  {
    category: "Ressources Humaines",
    icon: Users,
    items: [
      { id: 'hr_dashboard', label: 'Dashboard RH', actions: ['view'] },
      { id: 'emp-list', label: 'Liste des Employés', actions: ['view', 'create', 'edit', 'delete'] },
      { id: 'emp-pay', label: 'Paiement & Salaires', actions: ['view', 'create', 'edit'] },
      { id: 'emp-presence', label: 'Suivi de Présence', actions: ['view', 'edit'] },
      { id: 'emp-perm', label: 'Permissions', actions: ['view', 'edit'] },
      { id: 'emp-affect', label: 'Affectation', actions: ['view', 'edit'] }
    ]
  },
  {
    category: "Gestion de Stock",
    icon: Box,
    items: [
      { id: 'stock-dash', label: 'Dashboard Stock', actions: ['view'] },
      { id: 'stock-state', label: 'État du Stock', actions: ['view', 'edit'] },
      { id: 'stock-transfer', label: 'Transferts', actions: ['view', 'create', 'delete'] },
      { id: 'stock-move', label: 'Historique', actions: ['view'] },
    ]
  },
  {
    category: "Pipeline CRM",
    icon: Workflow,
    items: [
      { id: 'pipeline-dash', label: 'Dashboard Pipeline', actions: ['view'] },
      { id: 'pipeline-kanban', label: 'Management Pipeline', actions: ['view', 'create', 'edit', 'delete'] },
      { id: 'pipeline-list', label: 'Liste des clients', actions: ['view', 'create', 'filter_pipeline', 'filter_employee', 'filter_business'] },
    ]
  },
  {
    category: "Catalogue",
    icon: Package,
    items: [
      { id: 'prod-dash', label: 'Dashboard Produits', actions: ['view'] },
      { id: 'prod-list', label: 'Tous les Produits', actions: ['view', 'create', 'edit', 'delete'] },
    ]
  },
  {
    category: "Production",
    icon: Factory,
    items: [
      { id: 'prod-production-dash', label: 'Dashboard Production', actions: ['view'] },
      { id: 'prod-manage', label: 'Gestion de Production', actions: ['view', 'create', 'edit'] },
    ]
  },
  {
    category: "Finance & Achats",
    icon: Wallet,
    items: [
      { id: 'buy-bon', label: 'Bons d\'achat', actions: ['view', 'create', 'edit'] },
      { id: 'buy-supp', label: 'Fournisseurs', actions: ['view', 'create', 'edit'] },
      { id: 'debts-dash', label: 'Dashboard Dettes', actions: ['view'] },
      { id: 'debts-list', label: 'Liste des Dettes', actions: ['view', 'create', 'edit'] },
    ]
  },
  {
    category: "Actifs / Pubs",
    icon: Building,
    items: [
      { id: 'actifs-dash', label: 'Dashboard Actifs', actions: ['view'] },
      { id: 'actifs-list', label: 'Liste des actifs', actions: ['view', 'create', 'edit'] },
      { id: 'ads-dash', label: 'Dashboard Pubs', actions: ['view'] },
      { id: 'ads-list', label: 'Liste des publicités', actions: ['view', 'create', 'edit'] },
    ]
  },
  {
    category: "Tâches & Rapports",
    icon: ListTodo,
    items: [
      { id: 'task-list', label: 'Gestion des taches', actions: ['view', 'create', 'edit', 'delete'] },
      { id: 'rapports-list', label: 'Rapports', actions: ['view', 'create'] },
    ]
  },
  {
    category: "Workspace Confirmation",
    icon: Users,
    items: [
      { id: 'conf_dashboard', label: 'Tableau de bord', actions: ['view'] },
      { id: 'conf_clients', label: 'Mes Clients', actions: ['view', 'edit', 'update_status'] },
      { id: 'conf_tasks', label: 'Mes Tâches', actions: ['view', 'update_status'] },
      { id: 'conf_leaderboard', label: 'Classement', actions: ['view'] },
    ]
  },
  {
    category: "Workspace Packaging",
    icon: Package,
    items: [
      { id: 'pack_dashboard', label: 'Tableau de bord', actions: ['view'] },
      { id: 'pack_queue', label: 'File de Colis (Scan)', actions: ['view', 'process'] },
      { id: 'pack_tasks', label: 'Mes Tâches', actions: ['view', 'update_status'] },
    ]
  }
];

// --- TOAST COMPONENT ---
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-right-10 fade-in duration-300">
      <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg border backdrop-blur-md
        ${type === 'success' ? 'bg-[#005461] text-white border-[#005461]' : 'bg-red-50 text-red-800 border-red-100'}`}>
        <div className={`p-1 rounded-full ${type === 'success' ? 'bg-white/20' : 'bg-red-500/20'}`}>
           {type === 'success' ? <Check size={16} className="text-white" /> : <X size={16} className="text-red-500" />}
        </div>
        <div>
          <h4 className="font-semibold text-sm">{type === 'success' ? 'Succès' : 'Erreur'}</h4>
          <p className="text-xs opacity-70 mt-0.5 text-white/80">{message}</p>
        </div>
      </div>
    </div>
  );
};

// --- PERMISSIONS MODAL ---
const PermissionsModal = ({ isOpen, onClose, employee, onSave }) => {
  const [permissions, setPermissions] = useState(new Set());
  const [activeCategory, setActiveCategory] = useState(null);
  
  // Use ADMIN_MODULES for everyone for now (simplified)
  const modulesConfig = ADMIN_MODULES;

  useEffect(() => {
    if (isOpen && employee) {
      setPermissions(new Set(employee.permissions || []));
      if(ADMIN_MODULES.length > 0) setActiveCategory(ADMIN_MODULES[0].category);
    }
  }, [isOpen, employee]);

  if (!isOpen || !employee) return null;

  const togglePermission = (moduleId, actionId) => {
    const permString = `${moduleId}:${actionId}`;
    const newPerms = new Set(permissions);
    if (newPerms.has(permString)) newPerms.delete(permString);
    else newPerms.add(permString);
    setPermissions(newPerms);
  };

  const toggleModuleAll = (moduleItem) => {
    const allActions = moduleItem.actions.map(act => `${moduleItem.id}:${act}`);
    const isFull = allActions.every(p => permissions.has(p));
    const newPerms = new Set(permissions);
    if (isFull) allActions.forEach(p => newPerms.delete(p)); 
    else allActions.forEach(p => newPerms.add(p)); 
    setPermissions(newPerms);
  };

  const selectAll = () => {
    const allPossible = [];
    modulesConfig.forEach(module => {
      module.items.forEach(item => {
        item.actions.forEach(action => allPossible.push(`${item.id}:${action}`));
      });
    });

    const isAllSelected = allPossible.every(p => permissions.has(p));

    if (isAllSelected) {
      setPermissions(new Set());
    } else {
      setPermissions(new Set(allPossible));
    }
  };

  const activeModuleData = modulesConfig.find(m => m.category === activeCategory);

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all">
      <SpotlightCard theme="light" className="w-full max-w-6xl h-[85vh] flex flex-col !p-0 overflow-hidden border border-slate-200">
        
        {/* Header - Simple & Clean */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-slate-100 shadow-sm">
                <img src={employee.avatar || "https://i.pravatar.cc/150"} alt={employee.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-[#005461]">{employee.name}</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Configuration des accès</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={selectAll} className="text-xs font-bold text-slate-500 hover:text-[#005461] hover:bg-[#005461]/5 px-4 py-2.5 rounded-xl transition-colors border border-slate-200">
               Tout cocher / Décocher
             </button>
             <button onClick={onClose} className="p-2.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
               <X size={20} />
             </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
            {/* Sidebar Categories - Minimalist */}
            <div className="w-72 bg-slate-50/50 border-r border-slate-100 overflow-y-auto p-4 space-y-1">
                {modulesConfig.map((module) => {
                    const Icon = module.icon;
                    const isActive = activeCategory === module.category;
                    const activeCount = module.items.reduce((acc, item) => acc + item.actions.filter(a => permissions.has(`${item.id}:${a}`)).length, 0);
                    
                    return (
                        <button
                            key={module.category}
                            onClick={() => setActiveCategory(module.category)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all
                                ${isActive 
                                    ? 'bg-white text-[#005461] shadow-md shadow-slate-200 border border-slate-100' 
                                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 border border-transparent'}`}
                        >
                            <div className="flex items-center gap-3">
                                <Icon size={18} className={isActive ? 'text-[#018790]' : 'text-slate-400'} />
                                <span>{module.category}</span>
                            </div>
                            {activeCount > 0 && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${isActive ? 'bg-[#005461]/10 text-[#005461]' : 'bg-slate-200 text-slate-500'}`}>
                                    {activeCount}
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-8 bg-white/80">
                {activeModuleData ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                            <div className="p-2 bg-[#005461]/5 rounded-lg text-[#005461]">
                                <activeModuleData.icon size={24} />
                            </div>
                            <h2 className="text-xl font-extrabold text-[#005461]">{activeModuleData.category}</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {activeModuleData.items.map((item) => {
                                const allActive = item.actions.every(act => permissions.has(`${item.id}:${act}`));
                                
                                return (
                                    <div key={item.id} className="p-6 rounded-2xl border border-slate-100 hover:border-[#018790]/30 hover:bg-[#005461]/[0.02] transition-colors bg-white">
                                        <div className="flex items-center gap-4 mb-5 cursor-pointer" onClick={() => toggleModuleAll(item)}>
                                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${allActive ? 'bg-[#005461] border-[#005461] text-white scale-110 shadow-lg shadow-[#005461]/20' : 'border-slate-300 bg-white hover:border-[#018790]'}`}>
                                                {allActive && <Check size={14} strokeWidth={4} />}
                                            </div>
                                            <span className="font-bold text-lg text-slate-800">{item.label}</span>
                                        </div>

                                        <div className="flex flex-wrap gap-3 pl-10">
                                            {item.actions.map(actionType => {
                                                const config = ACTION_TYPES[actionType];
                                                if (!config) return null;

                                                const isActive = permissions.has(`${item.id}:${actionType}`);
                                                // Simplified Icon (optional)
                                                // const ActionIcon = config.icon; 

                                                return (
                                                    <button
                                                        key={actionType}
                                                        onClick={() => togglePermission(item.id, actionType)}
                                                        className={`
                                                            px-4 py-2 rounded-lg text-xs font-bold border-2 transition-all duration-200 flex items-center gap-2
                                                            ${isActive 
                                                                ? 'bg-[#005461] text-white border-[#005461] shadow-md shadow-[#005461]/20' 
                                                                : 'bg-white text-slate-500 border-slate-200 hover:border-[#018790] hover:text-[#018790]'}
                                                        `}
                                                    >
                                                        {isActive && <Check size={12} strokeWidth={3} />}
                                                        {config.label}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300">
                    <LayoutDashboard size={48} className="mb-4 opacity-50" />
                    <p className="font-bold text-lg">Sélectionnez une catégorie à gauche</p>
                  </div>
                )}
            </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-6 py-3 rounded-xl text-slate-600 font-bold hover:bg-white border border-transparent hover:border-slate-200 text-sm transition-all">
            Annuler
          </button>
          <button 
            onClick={() => { onSave(employee.id, Array.from(permissions)); onClose(); }} 
            className="px-8 py-3 rounded-xl bg-[#005461] text-white font-bold text-sm hover:bg-[#016f76] shadow-lg shadow-cyan-900/20 transition-all flex items-center gap-2"
          >
            <Check size={18} />
            Enregistrer les modifications
          </button>
        </div>

      </SpotlightCard>
    </div>
  );
};

// --- 5. MAIN PAGE ---
export default function PermissionsPage() {
  const [employees, setEmployees] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => { loadEmployees(); }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeAPI.getAll();
      setEmployees(data.map(e => ({...e, permissions: e.permissions || []})));
    } catch (error) {
      console.error("Failed to load", error);
      // Fallback data
      setEmployees([
          { id: 1, name: "Ali Benamor", role: "Admin", active: true, permissions: ['pipeline-list:view', 'pipeline-list:filter_business'] },
          { id: 2, name: "Sara Alami", role: "Manager", active: true, permissions: [] },
          { id: 3, name: "Khadija", role: "confirmation", active: true, permissions: ['conf_clients:view'] },
          { id: 4, name: "Adil", role: "packaging", active: true, permissions: [] },
          { id: 5, name: "Karim", role: "delivery", active: true, permissions: [] },
          { id: 6, name: "Sef Livreur", role: "delivery_manager", active: true, permissions: [] }
      ]);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  const handleOpenModal = (employee) => { setSelectedEmployee(employee); setModalOpen(true); };

  const handleSavePermissions = async (id, newPermissions) => {
    try {
      await employeeAPI.patch(id, { permissions: newPermissions });
      setToast({ message: "Permissions mises à jour avec succès !", type: 'success' });
      loadEmployees();
    } catch (error) {
        setToast({ message: "Permissions sauvegardées (Mode démo)", type: 'success' });
        setEmployees(prev => prev.map(e => e.id === id ? {...e, permissions: newPermissions} : e));
    }
  };

  const filteredEmployees = employees.filter(emp => emp.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="w-full min-h-screen bg-transparent animate-[fade-in_0.6s_ease-out] p-8 font-sans text-slate-800 relative">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="w-full space-y-8">
          {/* Header */}
          <SpotlightCard theme="light" className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                 <h1 className="text-3xl font-extrabold text-[#018790] tracking-tight mb-2">Gestion des Permissions</h1>
                 <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Système actif
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                        {employees.length} collaborateurs
                    </span>
                 </div>
              </div>

              <div className="relative group w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#018790]/50" size={20} />
                <input 
                    type="text" 
                    placeholder="Rechercher un membre..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#018790]/10 focus:border-[#018790] transition-all font-semibold"
                />
              </div>
            </div>
          </SpotlightCard>

          <SpotlightCard theme="light" className="!p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#005461]/5 border-b border-[#005461]/10">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-bold text-[#005461] uppercase tracking-wider">Employé</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-[#005461] uppercase tracking-wider">Rôle</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-[#005461] uppercase tracking-wider">Statut</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-[#005461] uppercase tracking-wider">Permissions</th>
                    <th className="text-right px-6 py-4 text-xs font-bold text-[#005461] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                     <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                           <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-[#005461]"></div>
                        </td>
                     </tr>
                  ) : filteredEmployees.length === 0 ? (
                     <tr>
                        <td colSpan="5" className="px-6 py-10 text-center text-slate-400 flex flex-col items-center">
                           <Search size={40} className="mb-2 opacity-20" />
                           <p>Aucun employé trouvé</p>
                        </td>
                     </tr>
                  ) : (
                    filteredEmployees.map(employee => (
                      <tr key={employee.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                               <img src={employee.avatar || "https://i.pravatar.cc/150"} alt={employee.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm" />
                               <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${employee.active ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                            </div>
                            <div>
                               <span className="block font-bold text-slate-800">{employee.name}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border
                              ${employee.role === 'Admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 
                                employee.role === 'confirmation' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                employee.role === 'delivery' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                employee.role === 'delivery_manager' ? 'bg-slate-800 text-white border-slate-900' :
                                'bg-blue-50 text-blue-600 border-blue-100'
                              }`}>
                              {employee.role}
                           </span>
                        </td>
                        <td className="px-6 py-4">
                            <span className={`text-xs font-bold ${employee.active ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {employee.active ? 'Actif' : 'Inactif'}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-2 text-slate-600 bg-slate-50 inline-flex px-3 py-1.5 rounded-lg border border-slate-100 group-hover:bg-white group-hover:border-[#018790]/20 transition-all">
                              <UnlockIcon hasPermissions={employee.permissions.length > 0} />
                              <span className="text-xs font-bold">{employee.permissions.length} accès configurés</span>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <button 
                             onClick={() => handleOpenModal(employee)} 
                             className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-[#005461] hover:border-[#005461] hover:text-white transition-all shadow-sm group-hover:shadow-md"
                           >
                              <Settings size={14} />
                              Configurer
                           </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </SpotlightCard>
      </div>

      <PermissionsModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        employee={selectedEmployee} 
        onSave={handleSavePermissions} 
      />
    </div>
  );
}

const UnlockIcon = ({ hasPermissions }) => {
    return hasPermissions ? <ShieldCheck size={18} className="text-[#018790]" /> : <Lock size={18} className="opacity-50" />;
}