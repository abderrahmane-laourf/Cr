import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Users, Briefcase, CheckSquare,
  FileText, Settings, ChevronRight, ChevronLeft,
  CreditCard, UserCheck, Bell, LogOut, Menu, X, Package,
  Box, ClipboardList, ArrowLeftRight, History, Diff, Truck, ShoppingCart, Search
} from 'lucide-react';

// ----------------------------------------------------------------------
// 1. DATA (Keep same structure)
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
      { id: 'stock-move', label: 'Historique', path: '/admin/stock/movements', icon: History }
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
  }
];

// ----------------------------------------------------------------------
// 2. PRIMARY RAIL (No changes needed here, same as before)
// ----------------------------------------------------------------------
const PrimaryRail = ({ activeModule, setActiveModule, isMobile }) => {
  return (
    <div className={`
      flex flex-col items-center py-6 bg-slate-900 text-white z-50
      ${isMobile ? 'w-20' : 'w-20'} 
      h-full border-r border-slate-800 shadow-2xl flex-shrink-0
    `}>
      <div className="mb-8 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
        <span className="font-bold text-xl text-white">C</span>
      </div>

      <div className="flex-1 w-full space-y-4 px-3 flex flex-col items-center">
        {MODULES.map((module) => {
          const isActive = activeModule === module.id;
          return (
            <button
              key={module.id}
              onClick={() => setActiveModule(module.id)}
              className={`
                group relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }
              `}
            >
              <module.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <div className="absolute left-14 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl border border-slate-700">
                {module.label}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-auto space-y-4 pb-4">
         {/* Bottom Icons... */}
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 3. SECONDARY PANEL (Updated to handle mobile close)
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
// 4. TOP HEADER (Updated: DYNAMIC TITLE)
// ----------------------------------------------------------------------
const TopHeader = ({ isMobileOpen, setIsMobileOpen, activeModuleId }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Get current Module Info
  const currentModule = MODULES.find(m => m.id === activeModuleId) || MODULES[0];
  
  // 2. Get Current Page Info (Sub-item)
  let currentPageLabel = "Aperçu";
  if (currentModule.subItems) {
    const foundSub = currentModule.subItems.find(sub => sub.path === location.pathname);
    if (foundSub) currentPageLabel = foundSub.label;
  } else if (location.pathname === currentModule.path) {
    currentPageLabel = currentModule.label;
  }

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-20 w-full">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
        >
          <Menu size={20} />
        </button>
        
        {/* DYNAMIC BREADCRUMB / TITLE */}
        <div className="flex flex-col">
          <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wide">
             {currentModule.label}
          </div>
          <div className="flex items-center gap-2 text-lg font-bold text-slate-800">
             {currentPageLabel}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
           <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
           <input 
            type="text" 
            placeholder="Rechercher..." 
            className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white w-64 transition-all"
           />
        </div>

        <button className="relative p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>

        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

        <button 
          onClick={() => { localStorage.clear(); navigate('/'); }}
          className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-red-600 transition-colors"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

// ----------------------------------------------------------------------
// 5. MAIN LAYOUT (Updated: FULL WIDTH CONTENT)
// ----------------------------------------------------------------------
export function AdminLayout({ children }) {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const foundModule = MODULES.find(m => {
      if (m.path === location.pathname) return true;
      if (m.subItems && m.subItems.some(sub => sub.path === location.pathname)) return true;
      return false;
    });
    if (foundModule) setActiveModule(foundModule.id);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      
      {/* MOBILE OVERLAY */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* DOUBLE SIDEBAR CONTAINER */}
      <div className={`
        fixed inset-y-0 left-0 z-50 flex transition-transform duration-300 lg:relative lg:translate-x-0
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

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Pass activeModuleId to Header to make it dynamic */}
        <TopHeader 
          isMobileOpen={isMobileOpen} 
          setIsMobileOpen={setIsMobileOpen} 
          activeModuleId={activeModule} 
        />
        
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] scroll-smooth p-4 sm:p-6">
          {/* REMOVED: max-w-7xl mx-auto (Now it's full width) */}
          <div className="w-full h-full animate-in fade-in duration-500 slide-in-from-bottom-4">
            {children}
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  );
}