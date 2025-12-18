import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, Outlet, NavLink } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  LayoutDashboard, Users, Box, Workflow, Truck, ShoppingCart, Factory, 
  Megaphone, Building, Wallet, Coins, FileText, Trophy, History, ListTodo, 
  Settings, Menu, X, Search, Bell, MessageSquare, CircleArrowLeft, 
  ChevronRight, LogOut, Loader2, DollarSign
} from 'lucide-react';
import DarkVeil from '../../util/darkvielle';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../../context/ThemeContext';

// ----------------------------------------------------------------------
// DATA
// ----------------------------------------------------------------------
const MODULES = [
  {
    id: 'dashboard',
    label: 'Tableau de bord',
    icon: LayoutDashboard,
    path: '/admin/dashboard',
  },
  {
    id: 'employees',
    label: 'Ressources Humaines',
    icon: Users,
    subItems: [
      { id: 'emp-dash', label: 'Dashboard', path: '/admin/employees/dashboard' },
      { id: 'emp-list', label: 'Liste des Employés', path: '/admin/employees' },
      { id: 'emp-pay', label: 'Paiement & Salaires', path: '/admin/paiement' },
      { id: 'emp-presence', label: 'Suivi de Présence', path: '/admin/presence' },
      { id: 'emp-commissions', label: 'Commissions', path: '/admin/commissions' },
      { id: 'emp-permissions', label: 'Permissions', path: '/admin/permissions' },
      { id: 'emp-affectations', label: 'Affectations', path: '/admin/affectations' },
    ]
  },
  {
    id: 'stock',
    label: 'Gestion de Stock',
    icon: Box,
    subItems: [
      { id: 'stock-dash', label: 'Dashboard Stock', path: '/admin/stock/dashboard' },
      { id: 'prod-dash', label: 'Dashboard Produit', path: '/admin/products/dashboard' },
      { id: 'prod-list', label: 'Tous les Produits', path: '/admin/products' },
      { id: 'stock-state', label: 'État du Stock', path: '/admin/stock' },
      { id: 'stock-transfer', label: 'Transferts', path: '/admin/stock/transfer' },
      { id: 'stock-move', label: 'Historique', path: '/admin/stock/movements' },
      { id: 'stock-packaging', label: 'Emballages', path: '/admin/stock/packaging' },
      { id: 'stock-tracking', label: 'Suivi Packaging', path: '/admin/packaging/tracking' },
    ]
  },
  {
    id: 'pipeline',
    label: 'Pipeline',
    icon: Workflow,
    subItems: [
      { id: 'pipeline-dash', label: 'Dashboard', path: '/admin/pipeline/dashboard' },
      { id: 'pipeline-kanban', label: 'Pipeline', path: '/admin/pipeline' },
      { id: 'pipeline-list', label: 'Livraison Ammex', path: '/admin/pipeline/list' },
      { id: 'pipeline-list-agadir', label: 'Livraison Agadir', path: '/admin/pipelineagadir' },
      { id: 'pipeline-retourner', label: 'Retourner', path: '/admin/retourner' },
    ]
  },
  {
    id: 'details-livraison',
    label: 'Détails de Livraison',
    icon: Truck,
    subItems: [
      { id: 'historique-livraison', label: 'Historique de Livraison', path: '/admin/historiquepaiementlivraison' },
      { id: 'tracking-livreur', label: 'Tracking Livraison', path: '/admin/tracking-livreur' },
      { id: 'gestion-settlements', label: 'check livreur', path: '/admin/settlements'},
    ]
  },
  {
    id: 'achat',
    label: 'Achats',
    icon: ShoppingCart,
    subItems: [
      { id: 'buy-bon', label: 'Bons d\'achat', path: '/admin/bon-achat' },
      { id: 'buy-supp', label: 'Fournisseurs', path: '/admin/suppliers' },
    ]
  }, 
  {
    id: 'production',
    label: 'Production',
    icon: Factory,
    subItems: [
      { id: 'production-dash', label: 'Dashboard', path: '/admin/production/dashboard' },
      { id: 'prod-manage', label: 'Gestion', path: '/admin/production' },
    ]
  },
  {
    id:'marketing',
    label : 'Marketing',
    icon : Megaphone,
    subItems : [
      { id: 'marketing-whatsapp', label: 'WhatsApp', path: '/admin/marketing/whatsapp' },
      { id: 'marketing-meta', label: 'Meta', path: '/admin/marketing/meta' },
      { id: 'marketing-tiktok', label: 'TikTok', path: '/admin/marketing/tiktok' },
      { id: 'marketing-google', label: 'Google Ads', path: '/admin/marketing/google-ads' },
    ]
  },
  {
    id: 'actifs',
    label: 'Actifs',
    icon: Building,
    subItems: [
      { id: 'actifs-dash', label: 'Dashboard', path: '/admin/actifs/dashboard' },
      { id: 'actifs-list', label: 'Liste', path: '/admin/actifs' },
    ]
  },
  {
    id: 'dettes',
    label: 'Dettes',
    icon: Wallet,
    subItems: [
      { id: 'debts-dash', label: 'Dashboard', path: '/admin/debts/dashboard' },
      { id: 'debts-list', label: 'Liste', path: '/admin/debts' }
    ]
  },
  {
    id: 'petitecaisse',
    label: 'Petite Caisse',
    icon: Coins, 
    subItems: [
        { id: 'petitecaisse-dash', label: 'Dashboard', path: '/admin/petitecaisse/dashboard' },
        { id: 'petitecaisse-manage', label: 'Gestion', path: '/admin/petitecaisse' },
    ]
  },
  {
    id: 'sold',
    label: 'Sold',
    icon: DollarSign,
    path: '/admin/sold'
  },
  {
    id:'rapport',
    label:'Rapports',
    icon: FileText,
    path:'/admin/rapport',
  },
  {
    id: 'challenges',
    label: 'Challenges',
    icon: Trophy,
    path: '/admin/challenges',
  },
  {
    id: 'logs',
    label: 'Journal d\'Activité',
    icon: History,
    path: '/admin/logs',
  },
  {
    id:'task',
    label : 'Tâches',
    icon : ListTodo,
    path : '/admin/task',
  },
];

// ----------------------------------------------------------------------
// 1. SIDEBAR ITEM COMPONENT
// ----------------------------------------------------------------------
const SidebarItem = ({ item, isActive, isExpanded, toggleExpand, onClick, isSidebarFull }) => {
  const hasSubItems = item.subItems && item.subItems.length > 0;
  const showLabel = isSidebarFull; 

  if (hasSubItems) {
    return (
      <div className="mb-1 group/item relative">
        <button
          onClick={toggleExpand}
          className={`w-full flex items-center rounded-xl text-sm font-medium transition-all duration-200 py-2.5 relative group
            ${isActive ? 'text-blue-800 font-bold bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:hover:bg-slate-800 dark:hover:text-gray-200 group-hover/sidebar:bg-gray-50 dark:group-hover/sidebar:bg-slate-800'}
            ${showLabel ? 'px-3 justify-between' : 'justify-center px-0'} 
          `}
        >
          <div className={`flex items-center ${showLabel ? 'gap-3' : 'gap-0'}`}>
            <div className="flex-shrink-0 flex items-center justify-center">
               <item.icon size={22} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
            </div>
            {showLabel && (
                <span className="truncate transition-opacity duration-200">{item.label}</span>
            )}
          </div>
          {showLabel && (
            <ChevronRight 
                size={16} 
                className={`transition-transform duration-200 ${isExpanded ? 'rotate-90 text-blue-600' : 'text-gray-400'}`} 
            />
          )}

          {!showLabel && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[100] shadow-lg">
                {item.label}
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-r-4 border-y-transparent border-r-gray-900"></div>
            </div>
          )}
        </button>
        
        <div className={`overflow-hidden transition-all duration-300 ease-in-out 
          ${isExpanded && showLabel ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}`
        }>
          <div className="pl-3 space-y-1 relative">
            <div className={`absolute left-[21px] top-0 bottom-0 w-px ${isActive ? 'bg-blue-200' : 'bg-gray-200'}`} />
            {item.subItems.map((sub) => (
              <NavLink
                key={sub.id}
                to={sub.path}
                onClick={onClick}
                end
                className={({ isActive }) => `
                  relative flex items-center pl-9 pr-3 py-2 rounded-lg text-sm transition-all duration-200
                  ${isActive ? 'bg-blue-50 text-blue-700 font-semibold dark:bg-blue-900/20 dark:text-blue-300' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-slate-800'}
                `}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-[18px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-sm ring-4 ring-blue-50/50"></span>
                    )}
                    <span className="truncate">{sub.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <NavLink
      to={item.path}
      onClick={onClick}
      end
      className={({ isActive }) => `
        flex items-center mb-1 rounded-xl text-sm font-medium transition-all duration-200 group py-2.5 relative
        ${isActive ? 'bg-blue-100 text-blue-900 shadow-sm dark:bg-blue-900/30 dark:text-blue-300' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:hover:bg-slate-800 dark:hover:text-gray-200'}
        ${showLabel ? 'px-3 gap-3 justify-start' : 'px-0 gap-0 justify-center'}
      `}
    >
      {({ isActive }) => (
        <>
            <div className="flex-shrink-0 flex items-center justify-center">
                <item.icon size={22} className={isActive ? 'text-blue-700' : 'text-gray-400'} />
            </div>
            {showLabel && (
                <span className="truncate transition-opacity duration-200">{item.label}</span>
            )}
            
            {!showLabel && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[100] shadow-lg">
                    {item.label}
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-r-4 border-y-transparent border-r-gray-900"></div>
                </div>
            )}
        </>
      )}
    </NavLink>
  );
};


// ----------------------------------------------------------------------
// 2. HEADER
// ----------------------------------------------------------------------
const Header = ({ isSidebarOpen, setSidebarOpen, toggleSidebarLock, isSidebarLocked, searchTerm, setSearchTerm }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    { id: 1, description: 'Nouvelle tâche assignée' },
    { id: 2, description: 'Stock faible détecté' }
  ]);

  return (
    <header className="h-16 bg-transparent flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 transition-all duration-300">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg lg:hidden transition-colors"
        >
          <Menu size={24} />
        </button>

        <button 
          onClick={toggleSidebarLock}
          className="hidden lg:flex p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
          title={isSidebarLocked ? "Unlock Sidebar" : "Lock Sidebar"}
        >
           <CircleArrowLeft strokeWidth={1.5} size={28} className={`transition-transform duration-300 ${!isSidebarLocked ? 'rotate-180' : ''}`} />
        </button>

        <div className="relative hidden md:flex items-center max-w-md w-full ml-2">
            <Search size={18} className="absolute left-3 text-slate-400" />
            <input 
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-full py-2 pl-10 pr-4 text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all"
            />
        </div>
      </div>

      <div className="flex items-center gap-3">
         <ThemeToggle />
         <button onClick={() => navigate('/admin/logs')} className="p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 rounded-full transition-colors">
            <History size={20} />
         </button>
        <div className="h-8 w-px bg-gray-100 mx-1 hidden sm:block" />
        <button className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full transition-colors">
            <MessageSquare size={20} />
        </button>

        <div className="relative">
          <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-600 dark:hover:text-gray-200 rounded-full relative transition-colors">
            <Bell size={20} />
            {notifications.length > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>}
          </button>
          
          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 top-12 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-50 dark:border-slate-800 font-semibold text-sm text-slate-800 dark:text-slate-200">Notifications</div>
                <div className="max-h-64 overflow-y-auto">
                    {notifications.map(n => (
                      <div key={n.id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 border-b border-gray-50 dark:border-slate-800 last:border-0 cursor-pointer">
                        <p className="text-sm font-medium text-gray-700 dark:text-slate-300 truncate">{n.description}</p>
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

// ----------------------------------------------------------------------
// 3. MAIN LAYOUT
// ----------------------------------------------------------------------
export function AdminLayout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false); 
  const [expandedMenu, setExpandedMenu] = useState({}); 
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('currentUser') || '{}');

  /* Use actualTheme for layout-sensitive visuals */
  const { actualTheme } = useTheme();

  /* ... existing state declarations ... */

  const [isLocked, setIsLocked] = useState(() => {
    const saved = localStorage.getItem('adminSidebarLocked');
    return saved ? JSON.parse(saved) : false;
  });
  const [isHovered, setIsHovered] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageLoading, setPageLoading] = useState(false);

  const isSidebarFull = isLocked || isHovered;

  useEffect(() => {
    setPageLoading(true);
    const timer = setTimeout(() => setPageLoading(false), 800);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const toggleSidebarLock = () => {
    setIsLocked(prev => {
      localStorage.setItem('adminSidebarLocked', JSON.stringify(!prev));
      return !prev;
    });
  };

  const filteredModules = useMemo(() => {
      if (!searchTerm) return MODULES;
      const lowerTerm = searchTerm.toLowerCase();
      return MODULES.filter(m => m.label.toLowerCase().includes(lowerTerm) || m.subItems?.some(s => s.label.toLowerCase().includes(lowerTerm)));
  }, [searchTerm]);

  const toggleExpand = (id) => {
    setExpandedMenu(prev => ({ [id]: !prev[id] }));
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Déconnexion',
      text: "Voulez-vous vraiment vous déconnecter ?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, déconnexion',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        navigate('/');
      }
    });
  };

  return (
    <div className="flex h-screen bg-transparent font-sans text-slate-800 dark:text-slate-200 overflow-hidden">
      
      {/* 1. MAIN NAV SIDEBAR (Starts from the left) */}
      <aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          fixed inset-y-0 left-0 z-40 bg-white/20 dark:bg-slate-900/40 backdrop-blur-xl lg:shadow-none lg:static border-r border-slate-200/20
          transition-[width,transform] duration-300 ease-in-out flex flex-col justify-between
          ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
          ${isSidebarFull ? 'w-72' : 'w-24'}
        `}
      >
        <div className="flex flex-col h-full overflow-hidden">
            <div className={`h-20 flex items-center flex-shrink-0 transition-all duration-300 ${isSidebarFull ? 'px-8' : 'justify-center'}`}>
                <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    {isSidebarFull && <span className="font-bold text-xl ml-4 tracking-tight">Platform</span>}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 space-y-2 no-scrollbar">
                {filteredModules.map((module) => (
                    <SidebarItem 
                      key={module.id} 
                      item={module} 
                      isActive={module.path === location.pathname || module.subItems?.some(s => s.path === location.pathname)}
                      isExpanded={expandedMenu[module.id]}
                      toggleExpand={() => toggleExpand(module.id)}
                      onClick={() => setSidebarOpen(false)} 
                      isSidebarFull={isSidebarFull}
                    />
                ))}
            </div>

            <div className="p-4 border-t border-gray-50 dark:border-slate-800">
                <NavLink to="/admin/settings" className={({ isActive }) => `flex items-center gap-3 py-2.5 mb-2 rounded-xl text-sm group relative ${isActive ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-gray-200'} ${isSidebarFull ? 'px-3' : 'justify-center'}`}>
                    <Settings size={22} />
                    {isSidebarFull && <span>Paramètres</span>}
                </NavLink>

                <div onClick={handleLogout} className={`flex items-center gap-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 cursor-pointer group relative ${isSidebarFull ? 'px-2' : 'justify-center'}`}>
                    <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold">
                        {(user.name || 'Admin')[0]}
                    </div>
                    {isSidebarFull && (
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold truncate dark:text-gray-200">{user.name || 'Admin'}</span>
                            <span className="text-xs text-red-500">Déconnexion</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-transparent"> 
        <Header 
          isSidebarOpen={isSidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          toggleSidebarLock={toggleSidebarLock}
          isSidebarLocked={isLocked}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
        
        <main className="flex-1 overflow-hidden bg-transparent relative lg:rounded-tl-[2rem]">
          <div className="absolute inset-0 pointer-events-none">
             <DarkVeil isLight={actualTheme === 'light'} hueShift={45} speed={0.15} />
          </div>

          <div className="h-full overflow-y-auto p-4 md:p-8 relative z-10 no-scrollbar">
             {pageLoading ? (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm z-50">
                  <Loader2 size={40} className="text-blue-600 animate-spin mb-4" />
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Chargement...</p>
               </div>
             ) : (
               <div className="animate-in fade-in duration-500">
                  {children}
                  <Outlet />
               </div>
             )}
          </div>
        </main>
      </div>
    </div>
  );
}