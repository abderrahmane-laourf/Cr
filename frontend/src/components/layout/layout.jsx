import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Briefcase, CheckSquare,
  FileText, Settings, ChevronRight, ChevronLeft,
  CreditCard, UserCheck, Bell, LogOut, Menu, X, Package,
  // Zid hadou:
  Box, ClipboardList, ArrowLeftRight, History, Diff
} from 'lucide-react';

// SIDEBAR
export function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedCategory, setExpandedCategory] = useState('employees');

  const NAV_ITEMS = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin/dashboard',
      type: 'link'
    },
    {
      id: 'employees',
      label: 'Gestion des employees',
      icon: Users,
      type: 'category',
      subItems: [
        { id: 'list', label: 'Liste des Employés', icon: Users, path: '/admin/employees' },
        { id: 'payment', label: 'Paiement', icon: CreditCard, path: '/admin/paiement' },
        { id: 'presence', label: 'Présence', icon: UserCheck, path: '/admin/presence' }
      ]
    },
    {
      id: 'gestionProduit',
      label: 'Produit',
      icon: Package,
      path: '/admin/Product',
      type: 'link'
    },
    {
      id: 'gestionStock',
      label: 'Gestion de Stock',
      icon: Box, // Bdelt Users b Box hit hada stock
      type: 'category',
      subItems: [
        {
          id: 'Dashboard',
          label: 'Dashboard',
          icon: Users,
          path: '/admin/stock/Dashboard'
        },
        { 
          id: 'stock-list', 
          label: 'État du Stock', 
          icon: ClipboardList, // Icon mnasb l la liste
          path: '/admin/stock' 
        },
        { 
          id: 'stock-transfer', 
          label: 'Transferts', // Correction: Transfere -> Transferts
          icon: ArrowLeftRight, // Icon dyal lchange
          path: '/admin/stock/transfer' 
        },
        { 
          id: 'stock-movement', 
          label: 'Mouvements', 
          icon: History, // Icon dyal l historiq
          path: '/admin/stock/movements' 
        }
      ]
    },
    {
      id: 'achat',
      label: 'Gestion des Achat',
      icon: Package,
      type: 'category',
      subItems: [
        { id: 'BonAchat', label: 'Bon Achat', icon: FileText, path: '/admin/BonAchat' },
        { id: 'suppliers', label: 'Fournisseurs', icon: Users, path: '/admin/suppliers' },
      ]
    },
  ];

  const toggleCategory = (id) => {
    if (isCollapsed) setIsCollapsed(false);
    setExpandedCategory(expandedCategory === id ? '' : id);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileOpen(false);
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`
          ${isCollapsed ? 'w-20' : 'w-72'}
          bg-white border-r border-slate-200 flex flex-col h-screen transition-all duration-300 shadow-xl z-50
          fixed left-0 top-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-200/50 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
          
          <div className={`flex items-center gap-3 overflow-hidden transition-all relative z-10 ${
            isCollapsed ? 'w-0 opacity-0' : 'w-full opacity-100'
          }`}>
            <div className="w-10 h-10 rounded-xl bg-white shadow-lg flex items-center justify-center text-blue-600 font-bold text-lg">
              C
            </div>
            <span className="font-bold text-2xl text-white tracking-tight drop-shadow-sm">
              CRM<span className="font-light">Pro</span>
            </span>
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:block p-2 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all duration-300 absolute -right-3.5 top-7 border border-white/30 shadow-xl hover:shadow-2xl hover:scale-110 z-10"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-2 text-white hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm relative z-10"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            if (item.type === 'link') {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-md shadow-blue-100/50 scale-[1.02]' 
                      : 'text-slate-600 hover:bg-slate-50 hover:scale-[1.01]'
                  }`}
                >
                  <item.icon size={20} className={isActive ? 'text-blue-600' : 'group-hover:scale-110 transition-transform'} />
                  {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}

                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap shadow-xl z-50">
                      {item.label}
                      <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                    </div>
                  )}
                </button>
              );
            }

            if (item.type === 'category') {
              const isExpanded = expandedCategory === item.id;
              const hasActiveChild = item.subItems?.some(sub => sub.path === location.pathname);

              return (
                <div key={item.id} className="space-y-1">
                  <button
                    onClick={() => toggleCategory(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 ${
                      hasActiveChild 
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-md shadow-blue-100/50' 
                        : 'text-slate-600 hover:bg-slate-50 hover:scale-[1.01]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={20} className={hasActiveChild ? 'text-blue-600' : ''} />
                      {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
                    </div>

                    {!isCollapsed && (
                      <ChevronRight
                        size={16}
                        className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}
                      />
                    )}
                  </button>

                  {isExpanded && !isCollapsed && (
                    <div className="ml-4 pl-4 border-l-2 border-blue-200 space-y-1.5 mt-2">
                      {item.subItems.map((sub) => {
                        const isSubActive = location.pathname === sub.path;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => handleNavigation(sub.path)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                              isSubActive 
                                ? 'text-blue-700 font-semibold bg-blue-50 shadow-sm scale-[1.02]' 
                                : 'text-slate-600 hover:bg-slate-50 hover:translate-x-0.5'
                            }`}
                          >
                            <sub.icon size={16} className={isSubActive ? 'text-blue-600' : ''} />
                            <span>{sub.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 space-y-1 bg-gradient-to-b from-slate-50/30 to-slate-50">
          <button
            onClick={() => navigate('/admin/settings')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-white hover:shadow-md transition-all duration-200"
          >
            <Settings size={20} />
            {!isCollapsed && <span className="font-medium text-sm">Paramètres</span>}
          </button>
        </div>

      </aside>
    </>
  );
}

// HEADER
export function Header({ isCollapsed, isMobileOpen, setIsMobileOpen }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <header
      className={`
        bg-white/80 backdrop-blur-md border-b border-slate-200 fixed top-0 right-0 z-30 transition-all duration-300 shadow-sm
        left-0 ${isCollapsed ? 'lg:left-20' : 'lg:left-72'}
      `}
    >
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="lg:hidden p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200 hover:scale-105"
          >
            <Menu size={24} />
          </button>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="hidden sm:block text-sm text-slate-500 mt-0.5">Bienvenue dans votre espace CRM</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button className="relative p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200 hover:scale-105">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
          </button>

          <button className="hidden sm:block p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200 hover:scale-105">
            <Settings size={20} />
          </button>

          <div className="hidden md:block h-10 w-px bg-slate-200"></div>

          <div className="flex items-center gap-2 sm:gap-3 hover:bg-slate-50 px-2 py-1.5 rounded-xl transition-all duration-200 cursor-pointer">
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-slate-900">Abdlkrim Samoudi</p>
              <p className="text-xs text-slate-500">Administrateur</p>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg text-sm ring-2 ring-blue-100">
              AB
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="hidden sm:block p-2.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-105"
          >
            <LogOut size={20} />
          </button>
        </div>

      </div>
    </header>
  );
}

// ADMIN LAYOUT
export function AdminLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50/30">
      
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      <Header
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      <main
        className={`
          transition-all duration-300 pt-20 min-h-screen
          ${isCollapsed ? 'lg:ml-20' : 'lg:ml-72'}
        `}
      >
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </main>

    </div>
  );
}