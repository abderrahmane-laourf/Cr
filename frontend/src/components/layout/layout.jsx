import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, 
  Users, 
  Briefcase, 
  CheckSquare,
  FileText, 
  Settings, 
  ChevronRight, 
  ChevronLeft,
  CreditCard, 
  UserCheck, 
  Bell, 
  LogOut, 
  Menu, 
  X, 
  Package,
  Box, 
  ClipboardList, 
  ArrowLeftRight, 
  History, 
  Diff, 
  Truck, 
  ShoppingCart, 
  Search,
  AlertTriangle,
  Factory,  
  Workflow, 
  List,
  TrendingDown,
  Megaphone,
  ListTodo,
  Wallet,
  Building,
  KanbanSquare,
  Store,
  Coins,
  FileBarChart,
  PanelLeftClose,
  PanelLeftOpen,
  CheckCircle2,
  Clipboard,
  ShieldCheck,
  Banknote,
  Smartphone
} from 'lucide-react';
import api from '../../services/api';

// ----------------------------------------------------------------------
// 1. DATA
// ----------------------------------------------------------------------
const MODULES = [
  {
    id: 'dashboard',
    label: 'Tableau de bord',
    icon: LayoutDashboard,
    path: '/admin/dashboard',
    description: 'Vue d\'ensemble'
  },
  {
    id: 'employees',
    label: 'Ressources Humaines',
    icon: Users,
    description: 'Gestion du personnel',
    subItems: [
      { id: 'dashboard', label: 'Dashboard', path: '/admin/employees/dashboard', icon: LayoutDashboard },
      { id: 'emp-list', label: 'Liste des Employés', path: '/admin/employees', icon: Users },
      { id: 'emp-pay', label: 'Paiement & Salaires', path: '/admin/paiement', icon: CreditCard },
      { id: 'emp-presence', label: 'Suivi de Présence', path: '/admin/presence', icon: UserCheck },
      { id: 'emp-permissions', label: 'Permissions', path: '/admin/permissions', icon: ShieldCheck },
      { id: 'emp-affectations', label: 'Affectations', path: '/admin/affectations', icon: Clipboard },
    ]
  },
  {
    id: 'stock',
    label: 'Gestion de Stock',
    icon: Box,
    description: 'Inventaire et Mouvements',
    subItems: [
      { id: 'stock-dash', label: 'Dashboard Stock', path: '/admin/stock/dashboard', icon: LayoutDashboard },
      { id: 'stock-state', label: 'État du Stock', path: '/admin/stock', icon: ClipboardList },
      { id: 'stock-transfer', label: 'Transferts', path: '/admin/stock/transfer', icon: Truck },
      { id: 'stock-move', label: 'Historique', path: '/admin/stock/movements', icon: History },
    ]
  },
  {
    id: 'pipeline',
    label: 'Pipeline',
    icon: Workflow,
    path: '/admin/pipeline',
    description: 'Gestion du pipeline',
    subItems: [
      { id: 'pipeline-dash', label: 'Dashboard', path: '/admin/pipeline/dashboard', icon: LayoutDashboard },
      { id: 'pipeline-kanban', label: 'Management Pipeline', path: '/admin/pipeline', icon: List },
      { id: 'pipeline-list', label: 'Liste des clients', path: '/admin/pipeline/list', icon: List },
    ]
  },
  {
    id: 'produit',
    label: 'Catalogue',
    icon: Package,
    description: 'Produits et Services',
    subItems: [
      { id: 'prod-dash', label: 'Dashboard', path: '/admin/products/dashboard', icon: LayoutDashboard },
      { id: 'prod-list', label: 'Tous les Produits', path: '/admin/products', icon: Package },
    ]
  },
  {
    id: 'achat',
    label: 'Achats',
    icon: ShoppingCart,
    description: 'Fournisseurs et Commandes',
    subItems: [
      { id: 'buy-bon', label: 'Bons d\'achat', path: '/admin/bon-achat', icon: FileText },
      { id: 'buy-supp', label: 'Fournisseurs', path: '/admin/suppliers', icon: Users },
    ]
  }, 
  {
    id: 'production',
    label: 'Production',
    icon: Factory,
    description: 'Production',
    subItems: [
      {id: 'prod-dash', label: 'Dashboard', path: '/admin/production/dashboard', icon: LayoutDashboard},
      {id: 'prod-manage', label: 'Gestion de Production', path: '/admin/production', icon: Factory},
    ]
  },
  {
    id:'ads',
    label : 'Publicité',
    icon : Megaphone,
    path : '/admin/ads',
    description : 'Campagnes et Pubs',
    subItems : [
      { id: 'ads-dash', label: 'Dashboard', path: '/admin/ads/dashboard', icon: LayoutDashboard },
      { id: 'ads-list', label: 'Liste des publicités', path: '/admin/ads', icon: Megaphone },
    ]
  },
  {
    id:'task',
    label : 'Tâches',
    icon : ListTodo,
    path : '/admin/task',
    description : 'Gestion des taches',
    subItems : [
      { id: 'task-list', label: 'Liste des taches', path: '/admin/task', icon: ListTodo },
    ]
  },
  {
    id: 'actifs',
    label: 'Actifs',
    icon: Building,
    path: '/admin/actifs',
    description: 'Gestion des actifs',
    subItems: [
      { id: 'actifs-dash', label: 'Dashboard', path: '/admin/actifs/dashboard', icon: LayoutDashboard },
      { id: 'actifs-list', label: 'Liste des actifs', path: '/admin/actifs', icon: Building },
    ]
  },
  {
    id: 'dettes',
    label: 'Dettes',
    icon: Wallet,
    path: '/admin/debts',
    description: 'Gestion des dettes',
    subItems: [
      { id: 'debts-dash', label: 'Dashboard', path: '/admin/debts/dashboard', icon: LayoutDashboard },
      { id: 'debts-list', label: 'Liste des Dettes', path: '/admin/debts', icon: List }
    ]
  },
  {
    id:'petitecaisse',
    label:'Petite Caisse',
    icon: Coins, 
    path:'/admin/petitecaisse',
    description:'Gestion de la caisse',
    subItems:[
      {id:'petitecaisse-nav',label:'Tableau de Bord',path:'/admin/petitecaisse',icon:Wallet},
    ]
  },
  {
    id:'rapport',
    label:'Rapports',
    icon: FileText,
    path:'/admin/rapport',
    description:'Analyses et stats',
    subItems:[
      {id:'rapports-list',label:'Liste des rapports',path:'/admin/rapports',icon:FileText},
    ]
  },
  {
    id: 'settings',
    label: 'Paramètres',
    icon: Settings,
    path: '/admin/settings',
    description: 'Configuration'
  }
];

// ----------------------------------------------------------------------
// 2. PRIMARY RAIL
// ----------------------------------------------------------------------
const PrimaryRail = ({ activeModule, setActiveModule, isMobile }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Width transition
  const railClasses = `
    flex flex-col py-4 z-50
    bg-white text-slate-700 border-r border-slate-200 shadow-xl
    h-full flex-shrink-0 transition-all duration-300 ease-in-out relative
    ${isHovered ? 'w-64' : 'w-20'}
  `;

  return (
    <div 
      className={railClasses}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Brand Icon */}
      <div className={`mb-6 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isHovered ? 'px-6 justify-start gap-3' : ''}`}>
        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="currentColor" className="text-[#1325ec] w-10 h-10">
            <circle cx="12" cy="12" r="3" />
            <circle cx="12" cy="5" r="2" opacity="0.2" />
            <circle cx="12" cy="19" r="2" opacity="0.2" />
            <circle cx="5" cy="12" r="2" opacity="0.2" />
            <circle cx="19" cy="12" r="2" opacity="0.2" />
          </svg>
        </div>
        <div className={`font-bold text-xl tracking-wide text-slate-900 whitespace-nowrap overflow-hidden transition-all duration-300 ${isHovered ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0'}`}>
           Platform
        </div>
      </div>

      <div className="flex-1 w-full space-y-1.5 px-3 flex flex-col overflow-y-auto overflow-x-hidden custom-scrollbar">
        {MODULES.map((module) => {
          const isActive = activeModule === module.id;
          
          return (
            <button
              key={module.id}
              onClick={() => setActiveModule(module.id)}
              className={`
                relative w-full h-12 rounded-xl flex items-center transition-all duration-200 group
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
                }
                ${isHovered ? 'px-4 justify-start gap-3' : 'justify-center'}
              `}
            >
              <module.icon 
                size={22} 
                strokeWidth={isActive ? 2.5 : 2} 
                className={`flex-shrink-0 transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} 
              />
              
              <span className={`font-semibold whitespace-nowrap overflow-hidden transition-all duration-300 ${isHovered ? 'opacity-100 max-w-[200px] translate-x-0' : 'opacity-0 max-w-0 -translate-x-4'}`}>
                {module.label}
              </span>

              {/* Active Indicator Dot when collapsed */}
              {isActive && !isHovered && (
                <div className="absolute right-2 top-2 w-2 h-2 rounded-full bg-white/30 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Profile Section */}
      <div className="mt-auto px-3 pb-4 pt-2 w-full">
         <button className={`
            w-full flex items-center rounded-xl border border-slate-100 p-1.5 hover:bg-slate-50 transition-all group overflow-hidden
            ${isHovered ? 'justify-start gap-3' : 'justify-center'}
         `}>
           <div className="w-10 h-10 rounded-full border-2 border-white shadow-md overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
             <img 
               src={JSON.parse(localStorage.getItem('currentUser') || '{}').avatar || "https://i.pravatar.cc/150?img=12"} 
               alt="Profile" 
               className="w-full h-full object-cover"
             />
           </div>
           
           <div className={`text-left overflow-hidden transition-all duration-300 ${isHovered ? 'opacity-100 max-w-[150px]' : 'opacity-0 max-w-0 hidden'}`}>
              <div className="font-bold text-sm text-slate-800 truncate">
                {JSON.parse(localStorage.getItem('currentUser') || '{}').name || 'Utilisateur'}
              </div>
              <div className="text-xs text-slate-500 truncate">
                {JSON.parse(localStorage.getItem('currentUser') || '{}').role || 'Admin'}
              </div>
           </div>
         </button>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 3. SECONDARY PANEL
// ----------------------------------------------------------------------
const SecondaryPanel = ({ activeModuleId, isMobile, onCloseMobile, isOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeModule = MODULES.find(m => m.id === activeModuleId) || MODULES[0];

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) onCloseMobile();
  };

  return (
    <div className={`
      bg-white h-full border-r border-slate-100 flex flex-col shadow-sm relative z-40 flex-shrink-0 transition-all duration-300 ease-in-out
      ${isOpen ? 'w-64 opacity-100 translate-x-0' : 'w-0 opacity-0 -translate-x-10 pointer-events-none lg:w-0 lg:opacity-0'}
    `}>
      <div className="h-24 px-6 flex flex-col justify-center border-b border-slate-50 relative group/header">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-blue-600 tracking-wider uppercase mb-1 opacity-80">
            Module Actif
          </span>
          <button 
            onClick={() => onCloseMobile()} 
            className="hidden lg:flex items-center justify-center w-8 h-8 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-full transition-all opacity-0 group-hover/header:opacity-100"
            title="Masquer le panneau"
          >
            <PanelLeftClose size={16} />
          </button>
        </div>
        <h2 className="text-xl font-bold text-slate-800 leading-tight">
          {activeModule.label}
        </h2>
        <p className="text-xs text-slate-400 font-medium mt-1">
          {activeModule.description}
        </p>
      </div>

      <div className="p-4 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
        {!activeModule.subItems ? (
           <button
             onClick={() => handleNavigate(activeModule.path)}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
               ${location.pathname === activeModule.path
                 ? 'bg-blue-50 text-blue-700 border border-blue-100/50 shadow-sm'
                 : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
               }`}
           >
             <LayoutDashboard size={18} />
             <span>Vue globale</span>
           </button>
        ) : (
          activeModule.subItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 group
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-50 to-white text-blue-700 shadow-sm border border-blue-100/50 translate-x-1' 
                    : 'text-slate-600 hover:bg-slate-50 hover:translate-x-1'
                  }
                `}
              >
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200
                  ${isActive ? 'bg-blue-100/50 text-blue-600' : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:shadow-sm'}
                `}>
                  <item.icon size={16} />
                </div>
                <span>{item.label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 4. TOP HEADER
// ----------------------------------------------------------------------
const TopHeader = ({ isMobileOpen, setIsMobileOpen, activeModuleId, isSecondaryOpen, setIsSecondaryOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Sync notifications with tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const tasks = await api.task.getAll();
        // Count tasks that are not 'Done' or 'Completed'
        const activeTasks = tasks.filter(t => t.status !== 'Done' && t.status !== 'Completed');
        setNotifications(activeTasks);
      } catch (error) {
        console.error("Failed to fetch tasks for notifications", error);
      }
    };

    fetchTasks();
    // Poll every 30 seconds to keep sync
    const interval = setInterval(fetchTasks, 30000);
    return () => clearInterval(interval);
  }, []);

  const currentModule = MODULES.find(m => m.id === activeModuleId) || MODULES[0];
  
  let currentPageLabel = "Aperçu";
  if (currentModule.subItems) {
    const foundSub = currentModule.subItems.find(sub => sub.path === location.pathname);
    if (foundSub) currentPageLabel = foundSub.label;
  } else if (location.pathname === currentModule.path) {
    currentPageLabel = currentModule.label;
  }

  return (
    <header className="h-16 md:h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20 w-full">
      <div className="flex items-center gap-4">
        {/* Desktop Toggle */}
        {!isSecondaryOpen && (
          <button 
            onClick={() => setIsSecondaryOpen(true)}
            className="hidden lg:flex items-center justify-center w-10 h-10 bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-full shadow-sm transition-all"
            title="Afficher le panneau"
          >
            <PanelLeftOpen size={20} />
          </button>
        )}

        {/* Mobile Toggle - Improved sizing/touch target */}
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="lg:hidden p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl active:scale-95 transition-transform"
        >
          <Menu size={24} />
        </button>
        
        <div className="flex flex-col justify-center">
          <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wide">
             {currentModule.label}
          </div>
          <div className="flex items-center gap-2 text-base md:text-lg font-bold text-slate-800 line-clamp-1">
             {currentPageLabel}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Search - Hidden on small mobile */}
        <div className="relative hidden md:block mr-2">
           <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
           <input 
            type="text" 
            placeholder="Rechercher..." 
            className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white w-48 lg:w-64 transition-all"
           />
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`w-12 h-12 flex items-center justify-center rounded-xl transition-colors ${showNotifications ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <Bell size={28} />
            {notifications.length > 0 && (
              <span className="absolute top-3 right-3 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                {notifications.length}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
              <div className="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
                  <h3 className="font-semibold text-slate-800 text-sm">Notifications</h3>
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{notifications.length} nouvelles</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center flex flex-col items-center text-slate-400">
                       <Bell size={32} className="opacity-20 mb-2"/>
                       <span className="text-sm">Aucune notification</span>
                    </div>
                  ) : (
                    notifications.map(task => (
                      <div key={task.id} className="p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-default group">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border ${
                            task.status === 'Accepted' ? 'bg-green-50 text-green-600 border-green-100' :
                            task.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                            'bg-amber-50 text-amber-600 border-amber-100'
                          }`}>
                            {task.status}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(task.dateCreated).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 font-medium leading-snug group-hover:text-blue-700 transition-colors">
                          {task.description}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-2 border-t border-slate-50 bg-slate-50/50 rounded-b-2xl">
                    <button className="w-full py-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg transition-all" onClick={() => {navigate('/admin/task'); setShowNotifications(false)}}>
                        Voir toutes les tâches
                    </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="h-8 w-px bg-slate-200 hidden sm:block mx-1"></div>

        <button 
          onClick={() => { localStorage.clear(); navigate('/'); }}
          className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
          title="Se déconnecter"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

// ----------------------------------------------------------------------
// 5. MAIN LAYOUT
// ----------------------------------------------------------------------
export function AdminLayout({ children }) {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSecondaryOpen, setIsSecondaryOpen] = useState(true);
  const location = useLocation();
  
  // Auto-sync active module logic
  useEffect(() => {
    const foundModule = MODULES.find(m => {
      if (m.path === location.pathname) return true;
      if (m.subItems && m.subItems.some(sub => sub.path === location.pathname)) return true;
      return false;
    });
    if (foundModule) setActiveModule(foundModule.id);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans text-slate-800 antialiased">
      
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-50 flex h-full shadow-2xl lg:shadow-none transition-transform duration-300 ease-out lg:relative lg:translate-x-0
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <PrimaryRail 
          activeModule={activeModule} 
          setActiveModule={setActiveModule}
          isMobile={isMobileOpen}
        />
        <SecondaryPanel 
          activeModuleId={activeModule}
          isMobile={isMobileOpen}
          onCloseMobile={() => isMobileOpen ? setIsMobileOpen(false) : setIsSecondaryOpen(false)}
          isOpen={isMobileOpen || isSecondaryOpen}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F8FAFC]">
        <TopHeader 
          isMobileOpen={isMobileOpen} 
          setIsMobileOpen={setIsMobileOpen} 
          activeModuleId={activeModule}
          isSecondaryOpen={isSecondaryOpen}
          setIsSecondaryOpen={setIsSecondaryOpen}
        />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 scroll-smooth">
          <div className="w-full max-w-[2000px] mx-auto animate-in fade-in duration-500 slide-in-from-bottom-2">
            {children}
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  );
}