import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet, NavLink } from 'react-router-dom';
import {
  LayoutDashboard, 
  Users, 
  Trophy, 
  Package, 
  LogOut, 
  Menu, 
  Bell, 
  ClipboardList, 
  Check, 
  X, 
  AlertCircle,
  ChevronRight,
  ChevronDown,
  User,
  Settings,
  MapPin
} from 'lucide-react';
import { taskAPI } from '../../services/api';

// ----------------------------------------------------------------------
// DATA
// ----------------------------------------------------------------------
const MOCK_NOTIFICATIONS = [
  {
    id: 901,
    title: "Urgent : Validation retour client",
    description: "Le client X demande un retour. Vérifier l'état du colis.",
    status: "En attente",
    assignedTo: "confirmation",
    dateCreated: new Date().toISOString()
  },
  {
    id: 902,
    title: "Inventaire fin de mois",
    description: "Compter les cartons de la zone B.",
    status: "En attente",
    assignedTo: "packaging",
    dateCreated: new Date().toISOString()
  }
];

const MODULES = {
  confirmation: [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, path: '/employee/confirmation/dashboard' },
    { id: 'clients-ammex', label: 'Livraison Ammex', icon: Users, path: '/employee/confirmation/clients' },
    { id: 'clients-agadir', label: 'Livraison Agadir', icon: MapPin, path: '/employee/confirmation/clientsagadir' },
    { id: 'tasks', label: 'Tâches', icon: ClipboardList, path: '/employee/confirmation/tasks' },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, path: '/employee/confirmation/leaderboard' }
  ],
  confirmation_manager: [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, path: '/employee/confirmation-manager/dashboard' },
    { id: 'clients', label: 'Liste Clients', icon: Users, path: '/employee/confirmation-manager/clients' },
    { id: 'tasks', label: 'Tâches', icon: ClipboardList, path: '/employee/confirmation-manager/tasks' },
  ],
  packaging: [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, path: '/employee/packaging/dashboard' },
    { id: 'queue', label: 'File de Colis', icon: Package, path: '/employee/packaging/queue' },
    { id: 'tasks', label: 'Tâches', icon: ClipboardList, path: '/employee/packaging/tasks' },
  ],
  delivery: [
    { id: 'dashboard', label: 'Dashboard Livreur', icon: LayoutDashboard, path: '/employee/delivery/dashboard' },
    { id: 'run', label: 'Mes Colis Agadir', icon: MapPin, path: '/employee/delivery/run' },
    { id: 'tasks', label: 'Tâches', icon: ClipboardList, path: '/employee/delivery/tasks' },
  ],
  delivery_manager: [
    { id: 'dashboard', label: 'Dashboard Chef', icon: LayoutDashboard, path: '/employee/delivery-manager/dashboard' },
    { id: 'dispatch', label: 'Suivi Global', icon: MapPin, path: '/employee/delivery-manager/dispatch' }, // The "Pipeline" for the manager
    { id: 'drivers', label: 'Mes Livreurs', icon: Users, path: '/employee/delivery-manager/drivers' },
  ], 
  default: [
     { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, path: '/employee' },
     { id: 'tasks', label: 'Tâches', icon: ClipboardList, path: '/employee/tasks' },
  ]
};

// ----------------------------------------------------------------------
// COMPONENTS
// ----------------------------------------------------------------------

const SidebarItem = ({ item, isActive, isExpanded, toggleExpand, onClick, badgeCount }) => {
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
        flex items-center justify-between px-3 py-2.5 mb-1 rounded-lg text-sm font-medium transition-all duration-200
        ${isActive 
          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }
      `}
    >
      {({ isActive }) => (
        <>
          <div className="flex items-center gap-3">
            <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-400'} />
            <span>{item.label}</span>
          </div>
          {badgeCount > 0 && (
             <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white text-blue-600' : 'bg-red-500 text-white'}`}>
               {badgeCount}
             </span>
          )}
        </>
      )}
    </NavLink>
  );
};

// ----------------------------------------------------------------------
// HEADER
// ----------------------------------------------------------------------
const Header = ({ isSidebarOpen, setSidebarOpen, pageTitle, notifications, onAccept }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const user = JSON.parse(localStorage.getItem('currentUser') || '{}');

  const handleLogout = () => {
    if(window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
      localStorage.clear();
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
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
            )}
          </button>
          
          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 top-12 w-80 md:w-96 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
                 {/* En-tête */}
                 <div className="px-4 py-3 border-b border-slate-50 flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={16} className="text-red-500" />
                      <h3 className="font-bold text-sm text-slate-800">Tâches à accepter</h3>
                      <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-[10px] font-bold">{notifications.length}</span>
                    </div>
                 </div>
                 
                 {/* Liste */}
                 <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-500">
                         <p className="text-sm">Aucune nouvelle tâche.</p>
                      </div>
                    ) : (
                      notifications.map(task => (
                        <div key={task.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                           <div className="flex justify-between items-start mb-1">
                             <h4 className="font-semibold text-slate-800 text-sm">{task.title || "Nouvelle tâche"}</h4>
                             <span className="text-[10px] text-slate-400">{new Date(task.dateCreated).toLocaleDateString()}</span>
                           </div>
                           <p className="text-xs text-slate-500 mb-3 line-clamp-2">{task.description}</p>
                           <button 
                             onClick={() => { onAccept(task.id); if(notifications.length<=1) setShowNotifications(false); }}
                             className="w-full py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                           >
                             <Check size={14} />
                             Accepter
                           </button>
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
              <div className="text-sm font-bold text-slate-700">{user.name || 'Employé'}</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide bg-slate-100 px-2 py-0.5 rounded-full mt-0.5 inline-block text-center">
                {['admin', 'manager', 'employee', 'confirmation_manager'].includes(user.role) 
                  ? (user.role === 'confirmation_manager' ? 'Gérant' : user.role) 
                  : 'Staff'}
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-blue-100 overflow-hidden flex items-center justify-center">
              {user.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-semibold text-sm">
                  {(user.name || 'E').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <ChevronDown size={16} className={`text-slate-400 transition-transform hidden md:block ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>

          {showProfileMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
              <div className="absolute right-0 top-14 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                  <div className="font-semibold text-sm text-slate-800">{user.name || 'Employé'}</div>
                  <div className="text-xs text-slate-500">{user.role || 'Staff'}</div>
                </div>
                <div className="p-2">
                  <button onClick={() => setShowProfileMenu(false)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                    <User size={18} className="text-slate-400" />
                    <span>Mon profil</span>
                  </button>
                </div>
                <div className="p-2 border-t border-slate-100">
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors font-medium">
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

export function EmployeeLayout({ children, mode = 'default' }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState({});
  const [pendingTasks, setPendingTasks] = useState(MOCK_NOTIFICATIONS);
  const location = useLocation();
  const navigate = useNavigate();

  // Determine current modules
  let currentModules = [];
  if (mode === 'confirmation') currentModules = MODULES.confirmation;
  else if (mode === 'confirmation_manager') currentModules = MODULES.confirmation_manager;
  else if (mode === 'packaging') currentModules = MODULES.packaging;
  else if (mode === 'delivery') currentModules = MODULES.delivery;
  else if (mode === 'delivery_manager') currentModules = MODULES.delivery_manager;
  else currentModules = MODULES.default;

  // Determine Page Title
  let pageTitle = "Espace Employé";
  currentModules.forEach(m => {
    if (m.path === location.pathname) pageTitle = m.label;
    m.subItems?.forEach(sub => {
      if (sub.path === location.pathname) pageTitle = `${m.label} - ${sub.label}`;
    });
  });

  const toggleExpand = (id) => {
    setExpandedMenu(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAcceptTask = async (taskId) => {
    try {
        setPendingTasks(prev => prev.filter(t => t.id !== taskId));
        
        const tasksModule = currentModules.find(m => m.id === 'tasks');
        if (tasksModule && location.pathname !== tasksModule.path) {
            navigate(tasksModule.path);
        }
    } catch (error) {
        console.error("Erreur", error);
    }
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
            .sidebar-scroll::-webkit-scrollbar { width: 6px; }
            .sidebar-scroll::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
            .sidebar-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            .sidebar-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
          `}</style>
          <div className="space-y-0.5 sidebar-scroll">
            {currentModules.map((module) => {
              const isActive = module.path === location.pathname || module.subItems?.some(s => s.path === location.pathname);
              return (
                <SidebarItem 
                  key={module.id} 
                  item={module} 
                  isActive={isActive}
                  isExpanded={expandedMenu[module.id]}
                  toggleExpand={() => toggleExpand(module.id)}
                  onClick={() => setSidebarOpen(false)} 
                  badgeCount={module.id === 'tasks' ? pendingTasks.length : 0}
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
          notifications={pendingTasks}
          onAccept={handleAcceptTask}
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