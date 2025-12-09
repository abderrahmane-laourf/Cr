import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet, NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Briefcase, CheckSquare, FileText, Settings, 
  ChevronRight, ChevronDown, CreditCard, UserCheck, Bell, LogOut, Menu, 
  X, Package, Box, ClipboardList, Truck, History, Workflow, List, 
  ShoppingCart, Search, Factory, Megaphone, ListTodo, Building, Wallet, 
  Coins, PanelLeftClose, PanelLeftOpen, ShieldCheck, Clipboard, User
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
      { id: 'stock-state', label: 'État du Stock', path: '/admin/stock' },
      { id: 'stock-transfer', label: 'Transferts', path: '/admin/stock/transfer' },
      { id: 'stock-move', label: 'Historique', path: '/admin/stock/movements' },
    ]
  },
  {
    id: 'pipeline',
    label: 'Pipeline',
    icon: Workflow,
    subItems: [
      { id: 'pipeline-dash', label: 'Dashboard', path: '/admin/pipeline/dashboard' },
      { id: 'pipeline-kanban', label: 'Pipeline', path: '/admin/pipeline' },
      { id: 'pipeline-list', label: 'Liste Clients', path: '/admin/pipeline/list' },
    ]
  },
  {
    id: 'produit',
    label: 'Catalogue',
    icon: Package,
    subItems: [
      { id: 'prod-list', label: 'Tous les Produits', path: '/admin/products' },
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
      {id: 'prod-manage', label: 'Gestion', path: '/admin/production'},
    ]
  },
  {
    id:'ads',
    label : 'Publicité',
    icon : Megaphone,
    subItems : [
      { id: 'ads-dash', label: 'Dashboard', path: '/admin/ads/dashboard' },
      { id: 'ads-list', label: 'Liste', path: '/admin/ads' },
    ]
  },
  {
    id:'task',
    label : 'Tâches',
    icon : ListTodo,
    path : '/admin/task',
  },
  {
    id: 'actifs',
    label: 'Actifs',
    icon: Building,
    subItems: [
      { id: 'actifs-list', label: 'Liste', path: '/admin/actifs' },
    ]
  },
  {
    id: 'dettes',
    label: 'Dettes',
    icon: Wallet,
    subItems: [
      { id: 'debts-list', label: 'Liste', path: '/admin/debts' }
    ]
  },
  {
    id:'petitecaisse',
    label:'Petite Caisse',
    icon: Coins, 
    path:'/admin/petitecaisse',
  },
  {
    id:'rapport',
    label:'Rapports',
    icon: FileText,
    path:'/admin/rapport',
  },
  {
    id: 'settings',
    label: 'Paramètres',
    icon: Settings,
    path: '/admin/settings',
  }
];

// ----------------------------------------------------------------------
// COMPONENTS
// ----------------------------------------------------------------------

const SidebarItem = ({ item, isActive, isExpanded, toggleExpand, onClick }) => {
  const location = useLocation();
  const hasSubItems = item.subItems && item.subItems.length > 0;
  const isParentActive = isActive; 

  if (hasSubItems) {
    return (
      <div className="mb-1">
        {/* PARENT ITEM */}
        <button
          onClick={toggleExpand}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
            ${isParentActive 
              ? 'text-slate-800 bg-slate-100' 
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
        >
          <div className="flex items-center gap-3">
            <item.icon size={20} className={isParentActive ? 'text-blue-600' : 'text-slate-400'} />
            <span>{item.label}</span>
          </div>
          <ChevronRight 
            size={16} 
            className={`transition-transform duration-200 ${isExpanded ? 'rotate-90 text-slate-600' : 'text-slate-400'}`} 
          />
        </button>
        
        {/* CHILD ITEMS */}
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
          <div className="pl-3 space-y-1 relative">
            <div className="absolute left-[21px] top-0 bottom-0 w-px bg-slate-200" />
            {item.subItems.map((sub) => (
              <NavLink
                key={sub.id}
                to={sub.path}
                onClick={onClick}
                className={({ isActive }) => `
                  relative flex items-center pl-9 pr-3 py-2 rounded-lg text-sm transition-all duration-200
                  ${isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}
                `}
              >
                {location.pathname === sub.path && (
                  <span className="absolute left-[18px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full shadow-sm ring-4 ring-blue-50"></span>
                )}
                {sub.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // TOP LEVEL ITEM
  return (
    <NavLink
      to={item.path}
      onClick={onClick}
      className={({ isActive }) => `
        flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg text-sm font-medium transition-all duration-200
        ${isActive 
          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }
      `}
    >
      {({ isActive }) => (
        <>
          <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-400'} />
          <span>{item.label}</span>
        </>
      )}
    </NavLink>
  );
};

const Header = ({ isSidebarOpen, setSidebarOpen, pageTitle }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const user = JSON.parse(localStorage.getItem('currentUser') || '{}');

  useEffect(() => {
    const fetchTasks = async () => {
        try {
            // Mock API call - replace with your actual API
            const mockTasks = [
              { id: 1, description: 'Nouvelle tâche assignée', status: 'Pending' },
              { id: 2, description: 'Stock faible détecté', status: 'Pending' }
            ];
            setNotifications(mockTasks.filter(t => t.status !== 'Done' && t.status !== 'Completed'));
        } catch(e) { /* ignore */ }
    };
    fetchTasks();
  }, []);

  const handleLogout = () => {
    if(window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
      // Clear localStorage and navigate
      try {
        localStorage.clear();
      } catch(e) { /* ignore */ }
      navigate('/');
    }
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden transition-colors"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-lg font-bold text-slate-800 hidden sm:block">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* NOTIFICATIONS */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg relative transition-colors"
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>
          
          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 overflow-hidden">
                <div className="px-4 py-2 border-b border-slate-50 font-semibold text-sm">Notifications</div>
                <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-center text-xs text-slate-400">Rien à signaler</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 cursor-pointer transition-colors">
                          <p className="text-sm font-medium text-slate-700 truncate">{n.description}</p>
                        </div>
                      ))
                    )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block" />
        
        {/* PROFILE DROPDOWN */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 pl-1 pr-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="text-right hidden md:block">
              <div className="text-sm font-bold text-slate-700">{user.name || 'Admin'}</div>
              <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">{user.role || 'Gérant'}</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-blue-100 overflow-hidden flex items-center justify-center">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-semibold text-sm">
                  {(user.name || 'A').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <ChevronDown 
              size={16} 
              className={`text-slate-400 transition-transform hidden md:block ${showProfileMenu ? 'rotate-180' : ''}`} 
            />
          </button>

          {showProfileMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
              <div className="absolute right-0 top-14 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                  <div className="font-semibold text-sm text-slate-800">{user.name || 'Admin'}</div>
                  <div className="text-xs text-slate-500">{user.role || 'Gérant'}</div>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/admin/settings');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <User size={18} className="text-slate-400" />
                    <span>Mon profil</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/admin/settings');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Settings size={18} className="text-slate-400" />
                    <span>Paramètres</span>
                  </button>
                </div>
                <div className="p-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                  >
                    <LogOut size={18} />
                    <span>Déconnexion</span>
                  </button>
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
// MAIN LAYOUT
// ----------------------------------------------------------------------

export function AdminLayout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState({}); 
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const activeModule = MODULES.find(m => m.subItems?.some(sub => sub.path === location.pathname));
    if (activeModule) {
      setExpandedMenu(prev => ({ ...prev, [activeModule.id]: true }));
    }
  }, [location.pathname]);

  let pageTitle = "Dashboard";
  MODULES.forEach(m => {
    if (m.path === location.pathname) pageTitle = m.label;
    m.subItems?.forEach(sub => {
      if (sub.path === location.pathname) pageTitle = `${m.label} - ${sub.label}`;
    });
  });

  const toggleExpand = (id) => {
    setExpandedMenu(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 shadow-xl lg:shadow-none lg:static transition-transform duration-300 ease-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-200 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/>
            </svg>
          </div>
          <span className="font-bold text-xl text-slate-800 tracking-tight">Platform</span>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto p-4" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 #f1f5f9'
        }}>
          <style>{`
            .sidebar-scroll::-webkit-scrollbar {
              width: 6px;
            }
            .sidebar-scroll::-webkit-scrollbar-track {
              background: #f1f5f9;
              border-radius: 10px;
            }
            .sidebar-scroll::-webkit-scrollbar-thumb {
              background: #cbd5e1;
              border-radius: 10px;
            }
            .sidebar-scroll::-webkit-scrollbar-thumb:hover {
              background: #94a3b8;
            }
          `}</style>
          <div className="space-y-0.5 sidebar-scroll">
            {MODULES.map((module) => {
              const isActive = module.path === location.pathname || module.subItems?.some(s => s.path === location.pathname);
              
              return (
                <SidebarItem 
                  key={module.id} 
                  item={module} 
                  isActive={isActive}
                  isExpanded={expandedMenu[module.id]}
                  toggleExpand={() => toggleExpand(module.id)}
                  onClick={() => setSidebarOpen(false)} 
                />
              );
            })}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header 
          isSidebarOpen={isSidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          pageTitle={pageTitle} 
        />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto w-full">
             {children}
             <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}