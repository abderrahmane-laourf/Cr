import React, { useState, useEffect } from 'react';
import {
  Search, Plus, Edit2, Trash2, Eye, X, Check,
  LayoutDashboard, Users, Box, Workflow, Package, ShoppingCart,
  Factory, Megaphone, ListTodo, Building, Wallet,
  Coins, FileText, Settings, ChevronDown, CheckCircle, AlertCircle, 
  ShieldCheck, MoreHorizontal, UserCog, Key, Lock, Shield
} from 'lucide-react';
import { employeeAPI } from '../../services/api';

// --- 1. CONFIGURATION DES ACTIONS (CRUD) ---
const ACTION_TYPES = {
  view:   { id: 'view',   label: 'Lecture',   color: 'emerald', icon: Eye },
  create: { id: 'create', label: 'Ajout',     color: 'blue',    icon: Plus },
  edit:   { id: 'edit',   label: 'Modif.',    color: 'amber',   icon: Edit2 },
  delete: { id: 'delete', label: 'Suppr.',    color: 'red',     icon: Trash2 },
};

// --- 2. DATA MATCHING YOUR LAYOUT ---
const PERMISSION_MODULES = [
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
    category: "Pipeline",
    icon: Workflow,
    items: [
      { id: 'pipeline-dash', label: 'Dashboard Pipeline', actions: ['view'] },
      { id: 'pipeline-kanban', label: 'Management Pipeline', actions: ['view', 'create', 'edit', 'delete'] },
      { id: 'pipeline-list', label: 'Liste des clients', actions: ['view', 'create', 'edit', 'delete'] },
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
    category: "Achats",
    icon: ShoppingCart,
    items: [
      { id: 'buy-bon', label: 'Bons d\'achat', actions: ['view', 'create', 'edit', 'delete'] },
      { id: 'buy-supp', label: 'Fournisseurs', actions: ['view', 'create', 'edit', 'delete'] },
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
    category: "Publicité",
    icon: Megaphone,
    items: [
      { id: 'ads-dash', label: 'Dashboard Pubs', actions: ['view'] },
      { id: 'ads-list', label: 'Liste des publicités', actions: ['view', 'create', 'edit', 'delete'] },
    ]
  },
  {
    category: "Tâches",
    icon: ListTodo,
    items: [
      { id: 'task-list', label: 'Liste des taches', actions: ['view', 'create', 'edit', 'delete'] },
    ]
  },
  {
    category: "Actifs",
    icon: Building,
    items: [
      { id: 'actifs-dash', label: 'Dashboard Actifs', actions: ['view'] },
      { id: 'actifs-list', label: 'Liste des actifs', actions: ['view', 'create', 'edit', 'delete'] },
    ]
  },
  {
    category: "Dettes",
    icon: Wallet,
    items: [
      { id: 'debts-dash', label: 'Dashboard Dettes', actions: ['view'] },
      { id: 'debts-list', label: 'Liste des Dettes', actions: ['view', 'create', 'edit'] },
    ]
  },
  {
    category: "Petite Caisse",
    icon: Coins,
    items: [
      { id: 'petitecaisse-list', label: 'Mouvements Caisse', actions: ['view', 'create', 'edit'] },
    ]
  },
  {
    category: "Rapports",
    icon: FileText,
    items: [
      { id: 'rapports-list', label: 'Liste des rapports', actions: ['view', 'create'] },
    ]
  },
  {
    category: "Paramètres",
    icon: Settings,
    items: [
      { id: 'business', label: 'Business', actions: ['view', 'edit'] },
    ]
  }
];

// --- 3. TOAST COMPONENT ---
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-right-10 fade-in duration-300">
      <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl border backdrop-blur-md
        ${type === 'success' ? 'bg-emerald-50/95 border-emerald-200 text-emerald-800' : 'bg-red-50/95 border-red-200 text-red-800'}`}>
        {type === 'success' ? <CheckCircle size={20} className="text-emerald-500" /> : <AlertCircle size={20} className="text-red-500" />}
        <div>
          <h4 className="font-bold text-sm">{type === 'success' ? 'Succès' : 'Erreur'}</h4>
          <p className="text-xs opacity-90">{message}</p>
        </div>
      </div>
    </div>
  );
};

// --- 4. PERMISSIONS MODAL ---
const PermissionsModal = ({ isOpen, onClose, employee, onSave }) => {
  const [permissions, setPermissions] = useState(new Set());
  const [activeCategory, setActiveCategory] = useState(PERMISSION_MODULES[0]?.category);

  useEffect(() => {
    if (isOpen && employee) {
      setPermissions(new Set(employee.permissions || []));
      if(PERMISSION_MODULES.length > 0) setActiveCategory(PERMISSION_MODULES[0].category);
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
    const allPermissions = new Set();
    PERMISSION_MODULES.forEach(module => {
      module.items.forEach(item => {
        item.actions.forEach(action => allPermissions.add(`${item.id}:${action}`));
      });
    });
    setPermissions(allPermissions);
  };

  const activeModuleData = PERMISSION_MODULES.find(m => m.category === activeCategory);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all overflow-hidden">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 border-2 border-white shadow-lg flex items-center justify-center overflow-hidden">
              <img src={employee.avatar || "https://i.pravatar.cc/150"} alt={employee.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">{employee.name}</h3>
              <p className="text-sm text-slate-500 font-medium">Configuration des accès</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={selectAll} className="text-sm font-semibold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors">
               Tout activer
             </button>
             <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
               <X size={20} />
             </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
            {/* Sidebar Categories */}
            <div className="w-64 bg-slate-50 border-r border-slate-100 overflow-y-auto custom-scrollbar p-3 space-y-1">
                {PERMISSION_MODULES.map((module) => {
                    const Icon = module.icon;
                    const isActive = activeCategory === module.category;
                    const activeCount = module.items.reduce((acc, item) => acc + item.actions.filter(a => permissions.has(`${item.id}:${a}`)).length, 0);
                    
                    return (
                        <button
                            key={module.category}
                            onClick={() => setActiveCategory(module.category)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all
                                ${isActive ? 'bg-white shadow-md text-blue-600 ring-1 ring-blue-50' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
                        >
                            <div className="flex items-center gap-3">
                                <Icon size={18} />
                                <span>{module.category}</span>
                            </div>
                            {activeCount > 0 && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'}`}>
                                    {activeCount}
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
                {activeModuleData && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-blue-600">
                                <activeModuleData.icon size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">{activeModuleData.category}</h2>
                                <p className="text-slate-500 text-sm">Gérez les permissions pour ce module.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {activeModuleData.items.map((item) => {
                                const allActive = item.actions.every(act => permissions.has(`${item.id}:${act}`));
                                
                                return (
                                    <div key={item.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    onClick={() => toggleModuleAll(item)}
                                                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center cursor-pointer transition-all 
                                                        ${allActive ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 hover:border-blue-400'}`}
                                                >
                                                    <Check size={12} strokeWidth={3} className={allActive ? '' : 'opacity-0'} />
                                                </div>
                                                <span className="font-bold text-slate-800">{item.label}</span>
                                            </div>
                                            <div className="h-px flex-1 bg-slate-50 mx-4 hidden sm:block"></div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 sm:pl-8">
                                            {item.actions.map(actionType => {
                                                const config = ACTION_TYPES[actionType];
                                                const isActive = permissions.has(`${item.id}:${actionType}`);
                                                const ActionIcon = config.icon;

                                                return (
                                                    <button
                                                        key={actionType}
                                                        onClick={() => togglePermission(item.id, actionType)}
                                                        className={`
                                                            flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border
                                                            ${isActive 
                                                                ? `bg-${config.color}-50 text-${config.color}-700 border-${config.color}-200 shadow-sm` 
                                                                : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-white hover:border-slate-200'}
                                                        `}
                                                    >
                                                        <ActionIcon size={14} />
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
                )}
            </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-slate-500 font-bold hover:bg-slate-50 transition-colors">
            Annuler
          </button>
          <button onClick={() => { onSave(employee.id, Array.from(permissions)); onClose(); }} className="px-8 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all flex items-center gap-2">
            <Check size={18} />
            Enregistrer les modifications
          </button>
        </div>

      </div>
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
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  const handleOpenModal = (employee) => { setSelectedEmployee(employee); setModalOpen(true); };

  const handleSavePermissions = async (id, newPermissions) => {
    try {
      await employeeAPI.patch(id, { permissions: newPermissions });
      setToast({ message: "Permissions sauvegardées !", type: 'success' });
      loadEmployees();
    } catch (error) {
      setToast({ message: "Erreur de sauvegarde", type: 'error' });
    }
  };

  const filteredEmployees = employees.filter(emp => emp.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50/50 p-8 font-sans text-slate-800">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-[1600px] mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl shadow-lg shadow-indigo-500/20 text-white">
                    <ShieldCheck size={32} strokeWidth={1.5} />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Gestion des Permissions</h1>
                    <div className="flex items-center gap-3 mt-1.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                            {employees.length} collaborateurs
                        </span>
                    </div>
                </div>
            </div>

            <div className="relative group w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <input 
                    type="text" 
                    placeholder="Rechercher un collaborateur..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-100 text-slate-700 font-medium focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-400"
                />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
              {loading ? Array.from({length:6}).map((_,i) => (
                  <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 animate-pulse h-48"></div>
              )) : filteredEmployees.map(employee => (
                  <div key={employee.id} className="group bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenModal(employee)} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-colors">
                              <Settings size={20} />
                          </button>
                      </div>

                      <div className="flex flex-col items-center text-center">
                          <div className="relative mb-4">
                              <div className="w-20 h-20 rounded-full p-1 bg-white border-2 border-slate-100 shadow-sm group-hover:border-indigo-200 transition-colors">
                                  <img src={employee.avatar || "https://i.pravatar.cc/150"} className="w-full h-full rounded-full object-cover" alt="" />
                              </div>
                              <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-4 border-white ${employee.active ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                          </div>
                          
                          <h3 className="text-lg font-bold text-slate-800 mb-1">{employee.name}</h3>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-6 ${
                              employee.role === 'Admin' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                          }`}>
                              {employee.role}
                          </span>

                          <div className="w-full bg-slate-50 rounded-2xl p-4 flex items-center justify-between border border-slate-100">
                              <div className="text-left">
                                  <span className="block text-xs font-bold text-slate-400 uppercase">Permissions</span>
                                  <span className="text-xl font-extrabold text-slate-800">{employee.permissions.length}</span>
                              </div>
                              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                  <Lock size={20} />
                              </div>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
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