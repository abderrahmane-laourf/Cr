import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, Outlet, NavLink } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  LayoutDashboard, Users, Box, Workflow, Truck, ShoppingCart, Factory, 
  Megaphone, Building, Wallet, Coins, FileText, Trophy, History, ListTodo, 
  Settings, Plus, Menu, X, Search, Bell, MessageSquare, CircleArrowLeft, 
  ChevronRight, LogOut, Loader2 ,DollarSign, // Added Loader2
} from 'lucide-react';

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
// 1. PROJECT SIDEBAR (Premium Liquid Design)
// ----------------------------------------------------------------------
const ProjectSidebar = () => {
    const [projects, setProjects] = useState([
        { id: 1, name: 'Main CRM', initial: 'M', color: 'bg-emerald-500', active: true },
        { id: 2, name: 'Alpha Team', initial: 'A', color: 'bg-indigo-500', active: false },
    ]);

    const handleAddProject = async () => {
        const { value: projectName } = await Swal.fire({
            title: 'Nouveau Projet',
            input: 'text',
            inputLabel: 'Nom du projet',
            inputPlaceholder: 'Entrez le nom du projet...',
            showCancelButton: true,
            confirmButtonText: 'Créer',
            cancelButtonText: 'Annuler',
            confirmButtonColor: '#005461',
            cancelButtonColor: '#EF4444',
            inputValidator: (value) => {
                if (!value) return 'Le nom du projet est requis !';
            }
        });

        if (projectName) {
            const colors = ['bg-blue-500', 'bg-orange-500', 'bg-purple-500', 'bg-cyan-500', 'bg-rose-500'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            
            setProjects([...projects, {
                id: Date.now(),
                name: projectName,
                initial: projectName.charAt(0).toUpperCase(),
                color: randomColor,
                active: false
            }]);
        }
    };

    const handleProjectClick = (id) => {
        setProjects(projects.map(p => ({ ...p, active: p.id === id })));
    };

    return (
       <nav className="flex flex-col items-center bg-[#005461] w-[72px] flex-shrink-0 z-50 h-full no-scrollbar relative transition-all duration-300">

  {/* TOP SPACER */}
  <div className="flex-1" />

  {/* PROJECTS — FIXED CENTER */}
  <div className="flex flex-col gap-3 w-full items-center">
    {projects.map((project) => (
      <div 
        key={project.id} 
        onClick={() => handleProjectClick(project.id)}
        className="relative w-full flex items-center justify-center cursor-pointer group h-[50px]"
      >

        {/* ACTIVE CUTOUT */}
        {project.active && (
          <>
            <div className="absolute top-0 right-0 w-[60px] h-full bg-white rounded-l-[16px] z-10" />
            
          </>
        )}

        {/* PROJECT CIRCLE */}
        <div
          className={`
            relative z-30 w-11 h-11 flex items-center justify-center 
            font-bold shadow-md transition-all duration-300
            ${project.active 
              ? 'rounded-[14px] bg-[#005461] text-white'
              : `rounded-full ${project.color} text-white hover:scale-105`
            }
          `}
        >
          {project.initial}
        </div>

        {/* TOOLTIP */}
        <div className="absolute left-[80px] top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-[60]">
          {project.name}
        </div>
      </div>
    ))}
  </div>

  {/* BOTTOM SPACER */}
  <div className="flex-1" />

  {/* ADD PROJECT BUTTON (FIXED BOTTOM) */}
  <button
    onClick={handleAddProject}
    className="mb-6 w-11 h-11 flex items-center justify-center rounded-full bg-[#00424d] hover:bg-emerald-500 transition-all"
  >
    <Plus size={22} />
  </button>
</nav>

    );
};
// ----------------------------------------------------------------------
// 2. MAIN NAV SIDEBAR ITEMS
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
            ${isActive ? 'text-emerald-800 font-bold bg-emerald-50' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 group-hover/sidebar:bg-gray-50'}
            ${showLabel ? 'px-3 justify-between' : 'justify-center px-0'} 
          `}
        >
          <div className={`flex items-center ${showLabel ? 'gap-3' : 'gap-0'}`}>
            <div className="flex-shrink-0 flex items-center justify-center">
               <item.icon size={22} className={isActive ? 'text-emerald-600' : 'text-gray-400'} />
            </div>
            {showLabel && (
                <span className="truncate transition-opacity duration-200">{item.label}</span>
            )}
          </div>
          {showLabel && (
            <ChevronRight 
                size={16} 
                className={`transition-transform duration-200 ${isExpanded ? 'rotate-90 text-emerald-600' : 'text-gray-400'}`} 
            />
          )}

          {/* === TOOLTIP RIGHT === */}
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
            <div className={`absolute left-[21px] top-0 bottom-0 w-px ${isActive ? 'bg-emerald-200' : 'bg-gray-200'}`} />
            {item.subItems.map((sub) => (
              <NavLink
                key={sub.id}
                to={sub.path}
                onClick={onClick}
                end
                className={({ isActive }) => `
                  relative flex items-center pl-9 pr-3 py-2 rounded-lg text-sm transition-all duration-200
                  ${isActive ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
                `}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-[18px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-sm ring-4 ring-emerald-50/50"></span>
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
        ${isActive ? 'bg-emerald-100 text-emerald-900 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
        ${showLabel ? 'px-3 gap-3 justify-start' : 'px-0 gap-0 justify-center'}
      `}
    >
      {({ isActive }) => (
        <>
            <div className="flex-shrink-0 flex items-center justify-center">
                <item.icon size={22} className={isActive ? 'text-emerald-700' : 'text-gray-400'} />
            </div>
            {showLabel && (
                <span className="truncate transition-opacity duration-200">{item.label}</span>
            )}
            
            {/* === TOOLTIP RIGHT === */}
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
// 3. HEADER
// ----------------------------------------------------------------------
const Header = ({ isSidebarOpen, setSidebarOpen, pageTitle, toggleSidebarLock, isSidebarLocked, searchTerm, setSearchTerm }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
        try {
            const mockTasks = [
              { id: 1, description: 'Nouvelle tâche assignée', status: 'Pending' },
              { id: 2, description: 'Stock faible détecté', status: 'Pending' }
            ];
            setNotifications(mockTasks.filter(t => t.status !== 'Pending' && t.status !== 'Completed'));
        } catch(e) { /* ignore */ }
    };
    fetchTasks();
  }, []);

  return (
    <header className="h-16 bg-white flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 transition-all duration-300">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg lg:hidden transition-colors"
        >
          <Menu size={24} />
        </button>

        <button 
          onClick={toggleSidebarLock}
          className="hidden lg:flex p-1.5 text-slate-400 hover:text-emerald-600 transition-colors"
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
                className="w-full bg-slate-50 border-none rounded-full py-2 pl-10 pr-4 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
            />
        </div>
      </div>

      <div className="flex items-center gap-3">
         <button 
            onClick={() => navigate('/admin/logs')}
            className="p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-full transition-colors"
            title="Logs"
         >
            <History size={20} />
         </button>
        
        <div className="h-8 w-px bg-gray-100 mx-1 hidden sm:block" />

        <button 
            className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full transition-colors"
            title="Messages"
         >
            <MessageSquare size={20} />
        </button>

        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full relative transition-colors"
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>
          
          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden">
                <div className="px-4 py-2 border-b border-gray-50 font-semibold text-sm">Notifications</div>
                <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-center text-xs text-gray-400">Rien à signaler</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 cursor-pointer transition-colors">
                          <p className="text-sm font-medium text-gray-700 truncate">{n.description}</p>
                        </div>
                      ))
                    )}
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
// 4. MAIN LAYOUT WITH CHILDREN LOADING
// ----------------------------------------------------------------------

export function AdminLayout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false); 
  const [expandedMenu, setExpandedMenu] = useState({}); 
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('currentUser') || '{}');

  const [isLocked, setIsLocked] = useState(() => {
    const saved = localStorage.getItem('adminSidebarLocked');
    return saved ? JSON.parse(saved) : false;
  });
  const [isHovered, setIsHovered] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleSidebarLock = () => {
    setIsLocked(prev => {
      const newState = !prev;
      localStorage.setItem('adminSidebarLocked', JSON.stringify(newState));
      return newState;
    });
  };

  const pageTitle = useMemo(() => {
    const currentPath = location.pathname;
    const foundModule = MODULES.find(m => m.path === currentPath);
    if (foundModule) return foundModule.label;

    for (const module of MODULES) {
      if (module.subItems) {
        const foundSub = module.subItems.find(sub => sub.path === currentPath);
        if (foundSub) return foundSub.label;
      }
    }
    return 'Dashboard';
  }, [location.pathname]);

  // --- CONTENT LOADING STATE ---
  const [pageLoading, setPageLoading] = useState(false);

  // Trigger loading animation on Route Change
  useEffect(() => {
    setPageLoading(true);
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 1500); // 1.5 Seconds Loading
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const isSidebarFull = isLocked || isHovered;

  useEffect(() => {
    const activeModule = MODULES.find(m => m.subItems?.some(sub => sub.path === location.pathname));
    if (activeModule) {
      setExpandedMenu(prev => ({ ...prev, [activeModule.id]: true }));
    }
  }, [location.pathname]);

  const filteredModules = useMemo(() => {
      if (!searchTerm) return MODULES;
      const lowerTerm = searchTerm.toLowerCase();
      return MODULES.filter(module => {
           const matchesLabel = module.label.toLowerCase().includes(lowerTerm);
           const matchesSub = module.subItems?.some(sub => sub.label.toLowerCase().includes(lowerTerm));
           return matchesLabel || matchesSub;
      });
  }, [searchTerm]);

  const toggleExpand = (id) => {
    setExpandedMenu(prev => {
        const isCurrentlyOpen = prev[id];
        if (isCurrentlyOpen) return {}; 
        return { [id]: true }; 
   });
  };

  const handleLogout = () => {
    if(window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
      try { localStorage.clear(); } catch(e) { /* ignore */ }
      navigate('/');
    }
  };

  return (
    <div className="flex h-screen bg-white font-sans text-slate-800">
      
      {/* 1. PROJECT SIDEBAR RAIL */}
      <ProjectSidebar />

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 2. MAIN NAV SIDEBAR */}
      <aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          fixed inset-y-0 left-[72px] z-40 bg-white shadow-xl lg:shadow-none lg:static 
          transition-[width,transform] duration-300 ease-in-out flex flex-col justify-between
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isSidebarFull ? 'w-72' : 'w-24'}
        `}
      >
        <div className="flex flex-col h-full overflow-hidden">
            <div className={`h-20 flex items-center flex-shrink-0 transition-all duration-300 ${isSidebarFull ? 'px-8 justify-start' : 'px-0 justify-center'}`}>
            
            <div className="flex items-center gap-3">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F57] hover:bg-red-600 transition-colors shadow-sm"></div>
                    <div className="w-3 h-3 rounded-full bg-[#FEBC2E] hover:bg-yellow-500 transition-colors shadow-sm"></div>
                    <div className="w-3 h-3 rounded-full bg-[#28C840] hover:bg-green-600 transition-colors shadow-sm"></div>
                </div>
                
                <span className={`font-bold text-2xl text-slate-800 tracking-tight whitespace-nowrap transition-all duration-300 ${isSidebarFull ? 'opacity-100 ml-4' : 'opacity-0 w-0 overflow-hidden ml-0'}`}>
                    Platform
                </span>
            </div>

            <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
            </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 no-scrollbar group/sidebar space-y-2" style={{ overflowX: 'hidden' }}>
                <div className="space-y-1.5">
                    {filteredModules.map((module) => {
                    const isActive = module.path === location.pathname || module.subItems?.some(s => s.path === location.pathname);
                    
                    return (
                        <SidebarItem 
                        key={module.id} 
                        item={module} 
                        isActive={isActive}
                        isExpanded={expandedMenu[module.id]}
                        toggleExpand={() => toggleExpand(module.id)}
                        onClick={() => setSidebarOpen(false)} 
                        isSidebarFull={isSidebarFull}
                        />
                    );
                    })}
                </div>
            </div>

            <div className="p-3 bg-white flex-shrink-0">
                <NavLink
                    to="/admin/settings"
                    title="Settings"
                    className={({ isActive }) => `
                        flex items-center gap-3 py-2.5 mb-2 rounded-xl text-sm font-medium transition-all duration-200 group relative
                        ${isActive ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'}
                        ${isSidebarFull ? 'px-3 justify-start' : 'px-0 justify-center'}
                    `}
                    >
                    <div className="flex-shrink-0">
                        <Settings size={22} />
                    </div>
                    <span className={`truncate transition-all duration-300 ${isSidebarFull ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>
                        Paramètres
                    </span>

                    {/* === SETTINGS TOOLTIP RIGHT === */}
                    {!isSidebarFull && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[100] shadow-lg">
                            Paramètres
                            <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-r-4 border-y-transparent border-r-gray-900"></div>
                        </div>
                    )}
                </NavLink>

                <div className={`flex items-center gap-3 py-2 rounded-xl border border-transparent hover:border-gray-100 hover:bg-gray-50 transition-all cursor-pointer group relative ${isSidebarFull ? 'px-2' : 'px-0 justify-center'}`} onClick={handleLogout}>
                    <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold overflow-hidden flex-shrink-0">
                        {user.avatar ? (
                            <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span>{(user.name || 'A').charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                    <div className={`flex flex-col min-w-0 transition-all duration-300 ${isSidebarFull ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>
                        <span className="text-sm font-semibold text-gray-700 truncate">{user.name || 'Admin'}</span>
                        <span className="text-xs text-gray-400 truncate">{user.role || 'Gérant'}</span>
                    </div>
                    {isSidebarFull && (
                        <LogOut size={16} className="ml-auto text-gray-300 hover:text-red-500 transition-colors" />
                    )}

                    {/* === PROFILE TOOLTIP RIGHT === */}
                    {!isSidebarFull && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[100] shadow-lg">
                            Se déconnecter
                            <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-r-4 border-y-transparent border-r-gray-900"></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white"> 
        <Header 
          isSidebarOpen={isSidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          pageTitle={pageTitle}
          toggleSidebarLock={toggleSidebarLock}
          isSidebarLocked={isLocked}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
        
        <main className="flex-1 overflow-hidden bg-slate-100 rounded-tl-3xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] border-t border-l border-gray-200/50 relative">
          
          <div className="h-full overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth no-scrollbar">
            <div className="w-full mx-auto min-h-full relative">
               
               {/* === THE LOADER INSIDE CHILDREN === */}
               {pageLoading ? (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/80 backdrop-blur-sm z-50">
                    <Loader2 size={48} className="text-[#018790] animate-spin mb-4" />
                    <p className="text-slate-500 font-medium animate-pulse">Chargement...</p>
                 </div>
               ) : (
                 <div className="animate-[fadeIn_0.5s_ease-out]">
                    {children}
                    <Outlet />
                 </div>
               )}

            </div>
          </div>
          
        </main>
      </div>
    </div>
  );
}