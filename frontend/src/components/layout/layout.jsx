import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet, NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Briefcase, CheckSquare, FileText, Settings, 
  ChevronRight, ChevronDown, CreditCard, UserCheck, Bell, LogOut, Menu, 
  X, Package, Box, ClipboardList, Truck, History, Workflow, List, 
  ShoppingCart, Search, Factory, Megaphone, ListTodo, Building, Wallet, 
  Coins, PanelLeftClose, PanelLeftOpen, ShieldCheck, Clipboard
} from 'lucide-react';
import api from '../../services/api';

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
      { id: 'prod-dash', label: 'Dashboard', path: '/admin/products/dashboard' },
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
      {id: 'prod-dash', label: 'Dashboard', path: '/admin/production/dashboard'},
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
  const hasSubItems = item.subItems && item.subItems.length > 0;
  
  // Logic to determine if the Parent should look "Active" (i.e., one of its children is selected)
  // We use this to color the icon/text, but NOT the background, to keep it clean.
  const isParentActive = isActive; 

  if (hasSubItems) {
    return (
      <div className="mb-1">
        {/* PARENT ITEM (Category) */}
        <button
          onClick={toggleExpand}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
            ${isParentActive 
              ? 'text-slate-800 bg-slate-100' // Active Parent: Darker text, Light Grey BG (Not Blue)
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900' // Inactive Parent
            }`}
        >
          <div className="flex items-center gap-3">
            {/* Icon Color: Blue if parent is active, Gray otherwise */}
            <item.icon size={20} className={isParentActive ? 'text-blue-600' : 'text-slate-400'} />
            <span>{item.label}</span>
          </div>
          <ChevronRight 
            size={16} 
            className={`transition-transform duration-200 ${isExpanded ? 'rotate-90 text-slate-600' : 'text-slate-400'}`} 
          />
        </button>
        
        {/* CHILD ITEMS (Sub-menu) */}
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
          <div className="pl-3 space-y-1 relative">
            {/* Vertical Guide Line */}
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
  {/* Dot manually based on location */}
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

  // TOP LEVEL ITEM (No children) - e.g. Dashboard
  return (
    <NavLink
      to={item.path}
      onClick={onClick}
      className={({ isActive }) => `
        flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg text-sm font-medium transition-all duration-200
        ${isActive 
          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' // Active: Solid Blue
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }
      `}
    >
      <item.icon size={20} className={item.path === location.pathname ? 'text-white' : 'text-slate-400'} />
      <span>{item.label}</span>
    </NavLink>
  );
};

const Header = ({ isSidebarOpen, setSidebarOpen, pageTitle }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const user = JSON.parse(localStorage.getItem('currentUser') || '{}');

  useEffect(() => {
    const fetchTasks = async () => {
        try {
            const tasks = await api.task.getAll();
            setNotifications(tasks.filter(t => t.status !== 'Done' && t.status !== 'Completed'));
        } catch(e) { /* ignore */ }
    };
    fetchTasks();
  }, []);

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-lg font-bold text-slate-800 hidden sm:block">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative transition-colors"
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
                    {notifications.length === 0 ? <p className="p-4 text-center text-xs text-slate-400">Rien à signaler</p> : 
                     notifications.map(n => (
                         <div key={n.id} className="px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 cursor-pointer">
                             <p className="text-sm font-medium text-slate-700 truncate">{n.description}</p>
                         </div>
                     ))
                    }
                </div>
              </div>
            </>
          )}
        </div>

        <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block" />
        
        <div className="flex items-center gap-3 pl-1">
          <div className="text-right hidden md:block">
            <div className="text-sm font-bold text-slate-700">{user.name || 'Admin'}</div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">{user.role || 'Gérant'}</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
             <img 
               src={user.avatar || "https://i.pravatar.cc/150?img=12"} 
               alt="Profile" 
               className="w-full h-full object-cover"
             />
          </div>
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
    // Determine which module is active to auto-expand accordion
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

  const handleLogout = () => {
    if(window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
      localStorage.clear();
      navigate('/');
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-800">
      
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 shadow-xl lg:shadow-none lg:static transition-transform duration-300 ease-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/>
            </svg>
          </div>
          <span className="font-bold text-xl text-slate-800 tracking-tight">Platform</span>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="space-y-0.5">
            {MODULES.map((module) => {
              // Check if any child path matches the current location
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

        {/* LOGOUT BUTTON SECTION */}
        <div className="p-4 border-t border-slate-100">
           <button 
             onClick={handleLogout}
             className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition-all active:scale-95"
           >
             <LogOut size={18} />
             <span>Déconnexion</span>
           </button>
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
          <div className="max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-3 duration-500">
             {children}
             <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}