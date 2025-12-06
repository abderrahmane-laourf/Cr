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
  FileBarChart
} from 'lucide-react';

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
      { id: 'dashboard', label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { id: 'emp-list', label: 'Liste des Employés', path: '/admin/employees', icon: Users },
      { id: 'emp-pay', label: 'Paiement & Salaires', path: '/admin/paiement', icon: CreditCard },
      { id: 'emp-presence', label: 'Suivi de Présence', path: '/admin/presence', icon: UserCheck }
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
    id: 'pertes',
    label: 'Gestion des pertes',
    icon: TrendingDown,
    description: 'Gestion des pertes',
    subItems: [
      { id: 'pertes-list', label: 'Liste des pertes', path: '/admin/pertes', icon: AlertTriangle },
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
    icon: Wallet, 
    path:'/admin/petitecaisse',
    description:'Gestion de la caisse',
    subItems:[
      {id:'petitecaisse-list',label:'Mouvements Caisse',path:'/admin/petitecaisse',icon:Wallet},
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
];

// ----------------------------------------------------------------------
// 2. PRIMARY RAIL
// ----------------------------------------------------------------------
const PrimaryRail = ({ activeModule, setActiveModule, isMobile }) => {
  const railClasses = `
    flex flex-col items-center py-3 z-50
    bg-white text-slate-700 border-r border-slate-100 shadow-lg
    ${isMobile ? 'w-16' : 'w-16'} 
    h-full flex-shrink-0 transition-all duration-300
  `;

  return (
    <div className={railClasses}>
      <div className="mb-4 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
        <span className="font-bold text-lg text-white">C</span>
      </div>

      <div className="flex-1 w-full space-y-2 px-2 flex flex-col items-center overflow-y-auto overflow-x-hidden custom-scrollbar">
        {MODULES.map((module) => {
          const isActive = activeModule === module.id;
          
          return (
            <button
              key={module.id}
              onClick={() => setActiveModule(module.id)}
              className={`
                group relative w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0
                ${isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'}
              `}
            >
              <module.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              
              {/* Tooltip on right */}
              <div className="absolute left-14 px-2 py-1 text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl bg-slate-800 text-white border-none">
                {module.label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 3. SECONDARY PANEL
// ----------------------------------------------------------------------
const SecondaryPanel = ({ activeModuleId, isMobile, onCloseMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeModule = MODULES.find(m => m.id === activeModuleId) || MODULES[0];

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) onCloseMobile();
  };

  return (
    <div className="w-64 bg-white h-full border-r border-slate-100 flex flex-col shadow-sm relative z-40 flex-shrink-0">
      <div className="h-24 px-6 flex flex-col justify-center border-b border-slate-50">
        <span className="text-xs font-bold text-blue-600 tracking-wider uppercase mb-1 opacity-80">
          Module Actif
        </span>
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
const TopHeader = ({ isMobileOpen, setIsMobileOpen, activeModuleId }) => {
  const navigate = useNavigate();
  const location = useLocation();

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

        <button className="relative w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>

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
          onCloseMobile={() => setIsMobileOpen(false)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F8FAFC]">
        <TopHeader 
          isMobileOpen={isMobileOpen} 
          setIsMobileOpen={setIsMobileOpen} 
          activeModuleId={activeModule} 
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