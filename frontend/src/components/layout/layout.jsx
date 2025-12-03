import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Briefcase, CheckSquare,
  FileText, Settings, ChevronRight, ChevronLeft,
  CreditCard, UserCheck, Bell, LogOut, Menu, X
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
      label: 'Gestion RH',
      icon: Users,
      type: 'category',
      subItems: [
        { id: 'list', label: 'Liste des Employés', icon: Users, path: '/admin/employees' },
        { id: 'payment', label: 'Paiement', icon: CreditCard, path: '/admin/paiement' },
        { id: 'presence', label: 'Présence', icon: UserCheck, path: '/admin/presence' }
      ]
    },
    {
      id: 'opportunities',
      label: 'Opportunités',
      icon: Briefcase,
      path: '/admin/opportunities',
      type: 'link'
    },
    {
      id: 'tasks',
      label: 'Tâches',
      icon: CheckSquare,
      path: '/admin/tasks',
      type: 'link'
    },
    {
      id: 'reports',
      label: 'Rapports',
      icon: FileText,
      path: '/admin/reports',
      type: 'link'
    }
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
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`
          ${isCollapsed ? 'w-20' : 'w-72'}
          bg-white border-r border-slate-200 flex flex-col h-screen transition-all duration-300 shadow-lg z-50
          fixed left-0 top-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-blue-700">
          
          <div className={`flex items-center gap-3 overflow-hidden transition-all ${
            isCollapsed ? 'w-0 opacity-0' : 'w-full opacity-100'
          }`}>
            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-blue-600 font-bold text-lg">
              C
            </div>
            <span className="font-bold text-xl text-white tracking-tight">
              CRM<span className="font-normal">Pro</span>
            </span>
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:block p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors absolute -right-3 top-7 border border-white/20 shadow-lg"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>


        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            if (item.type === 'link') {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all group relative ${
                    isActive ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <item.icon size={20} className={isActive ? 'text-blue-600' : ''} />
                  {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}

                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
                      {item.label}
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
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                      hasActiveChild ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={20} className={hasActiveChild ? 'text-blue-600' : ''} />
                      {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
                    </div>

                    {!isCollapsed && (
                      <ChevronRight
                        size={16}
                        className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      />
                    )}
                  </button>

                  {isExpanded && !isCollapsed && (
                    <div className="ml-4 pl-4 border-l-2 border-slate-200 space-y-1 mt-1">
                      {item.subItems.map((sub) => {
                        const isSubActive = location.pathname === sub.path;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => handleNavigation(sub.path)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                              isSubActive ? 'text-blue-600 font-semibold bg-blue-50/70' : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <sub.icon size={16} />
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

        <div className="p-4 border-t border-slate-200 space-y-1 bg-slate-50/50">
          <button
            onClick={() => navigate('/admin/settings')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-white transition-all"
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
        bg-white border-b border-slate-200 fixed top-0 right-0 z-30 transition-all duration-300
        left-0 ${isCollapsed ? 'lg:left-20' : 'lg:left-72'}
      `}
    >
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="hidden sm:block text-sm text-slate-500 mt-0.5">Bienvenue dans votre espace CRM</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button className="relative p-2 sm:p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          <button className="hidden sm:block p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
            <Settings size={20} />
          </button>

          <div className="hidden md:block h-10 w-px bg-slate-200"></div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-slate-900">Abdlkrim Samoudi</p>
              <p className="text-xs text-slate-500">Administrateur</p>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-md text-sm">
              AB
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="hidden sm:block p-2.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
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
    <div className="min-h-screen bg-slate-50">
      
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
