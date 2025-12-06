import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, 
  Users, 
  Trophy,
  Package,
  LogOut,
  Menu, 
  Bell,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  ClipboardList,
  CheckCircle2
} from 'lucide-react';

// ----------------------------------------------------------------------
// 1. DATA
// ----------------------------------------------------------------------
const MODULES = {
  confirmation: [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: LayoutDashboard,
      path: '/employee/confirmation/dashboard',
      description: 'Vue d\'ensemble'
    },
    {
      id: 'clients',
      label: 'Clients',
      icon: Users,
      path: '/employee/confirmation/clients',
      description: 'Gestion des clients'
    },
    {
      id: 'tasks',
      label: 'Tâches',
      icon:  ClipboardList, // Ensure ClipboardList is imported or use existing icon
      path: '/employee/confirmation/tasks',
      description: 'Mes tâches'
    },
    {
      id: 'leaderboard',
      label: 'Leaderboard',
      icon: Trophy,
      path: '/employee/confirmation/leaderboard',
      description: 'Classement'
    }
  ],
  packaging: [
    {
      id: 'queue',
      label: 'File de Colis',
      icon: Package,
      path: '/employee/packaging/queue',
      description: 'Préparation des commandes'
    },
    {
      id: 'tasks',
      label: 'Tâches',
      icon: ClipboardList,
      path: '/employee/packaging/tasks',
      description: 'Mes tâches'
    },
  ], 
  // Fallback for generic employee or if role missing
  default: [
     {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: LayoutDashboard,
      path: '/employee',
      description: 'Accueil'
    }
  ]
};

import { taskAPI } from '../../services/api';

// ... (MODULES remains the same)

// ----------------------------------------------------------------------
// 2. COMPONENTS
// ----------------------------------------------------------------------

const SidebarItem = ({ item, isActive, onClick, isMobile }) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
      ${isActive 
        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
        : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'
      }
    `}
  >
    <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'} />
    <span className={isMobile ? 'block' : 'hidden lg:block'}>{item.label}</span>
  </button>
);

// ----------------------------------------------------------------------
// 3. NOTIFICATION DROPDOWN
// ----------------------------------------------------------------------

const NotificationDropdown = ({ tasks, onValidate, onClose }) => {
  if (tasks.length === 0) {
    return (
      <div className="absolute top-16 right-4 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 z-50 animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center text-slate-500">
           <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
             <Bell className="w-6 h-6 text-slate-300" />
           </div>
           <p className="font-medium text-sm">Aucune nouvelle tâche</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-16 right-4 w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
       <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800">
            Notifications 
            <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs">{tasks.length}</span>
          </h3>
       </div>
       <div className="max-h-[400px] overflow-y-auto">
          {tasks.map(task => (
            <div key={task.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors">
               <div className="flex justify-between items-start mb-2">
                 <h4 className="font-bold text-slate-700 text-sm">{task.title || 'Nouvelle tâche'}</h4>
                 <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                   {new Date(task.dateCreated).toLocaleDateString()}
                 </span>
               </div>
               <p className="text-xs text-slate-500 mb-3 line-clamp-2">{task.description}</p>
               <button 
                 onClick={() => onValidate(task.id)}
                 className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
               >
                 <CheckCircle2 size={14} />
                 Confirmer la lecture
               </button>
            </div>
          ))}
       </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 4. HEADER COMPONENT
// ----------------------------------------------------------------------

const TopHeader = ({ isMobileOpen, setIsMobileOpen, title, notifications, onValidate, showDropdown, setShowDropdown }) => {
  const navigate = useNavigate();
  
  return (
    <header className="h-16 md:h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20 w-full relative">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="lg:hidden p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl active:scale-95 transition-transform"
        >
          <Menu size={24} />
        </button>
        
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className={`p-2 rounded-xl transition-all relative ${showDropdown ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Bell size={20} />
            {notifications?.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full border border-white text-[10px] text-white flex items-center justify-center font-bold">
                {notifications.length}
              </span>
            )}
          </button>
          
          {showDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
              <NotificationDropdown tasks={notifications || []} onValidate={onValidate} onClose={() => setShowDropdown(false)} />
            </>
          )}
        </div>

        <button 
          onClick={() => { localStorage.clear(); navigate('/'); }}
          className="p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all flex items-center gap-2"
          title="Se déconnecter"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export function EmployeeLayout({ children, mode = 'default' }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get User Role from LocalStorage (just for profile info)
  const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
  
  // Select modules based on mode prop
  // mode: 'confirmation' | 'packaging' | default
  let currentModules = [];
  if (mode === 'confirmation') {
    currentModules = MODULES.confirmation;
  } else if (mode === 'packaging') {
     currentModules = MODULES.packaging;
  } else {
     currentModules = MODULES.default;
  }

  const fetchNotifications = async () => {
      try {
          const allTasks = await taskAPI.getAll();
          const myPendingTasks = allTasks.filter(t => {
              const isMyTask = t.assignedTo === user.name || 
                             t.assignedTo === user.role ||
                             (t.assignedTo === 'confirmation' && mode === 'confirmation') ||
                             (t.assignedTo === 'packaging' && mode === 'packaging');
              
              // Only get 'En attente' tasks for notification
              return isMyTask && t.status === 'En attente';
          });
          setPendingTasks(myPendingTasks);
      } catch (error) {
          console.error("Error fetching notifications", error);
      }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [user.name, user.role, mode]);

  const handleValidateTask = async (taskId) => {
      try {
          // Update task to 'Validé'
          await taskAPI.update(taskId, { status: 'Validé' });
          
          // Remove locally for immediate UI update
          setPendingTasks(prev => prev.filter(t => t.id !== taskId));
          
          // Close dropdown if empty
          if (pendingTasks.length <= 1) setShowDropdown(false);
          
          // Optional: Navigate to tasks page
          const tasksModule = currentModules.find(m => m.id === 'tasks');
          if (tasksModule && location.pathname !== tasksModule.path) {
              navigate(tasksModule.path);
          }
      } catch (error) {
          console.error("Error validating task", error);
      }
  };

  // Find current active module for title
  const activeModule = currentModules.find(m => m.path === location.pathname) || currentModules[0];
  
  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans text-slate-800">
      
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-100 flex flex-col transition-transform duration-300 ease-out lg:relative lg:translate-x-0
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-20 flex items-center justify-center border-b border-slate-50">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="currentColor" className="text-[#1325ec] w-8 h-8">
              <circle cx="12" cy="12" r="3" />
              <circle cx="12" cy="5" r="2" opacity="0.2" />
              <circle cx="12" cy="19" r="2" opacity="0.2" />
              <circle cx="5" cy="12" r="2" opacity="0.2" />
              <circle cx="19" cy="12" r="2" opacity="0.2" />
            </svg>
            <span className="text-xl font-bold tracking-wide text-slate-900">Platform</span>
          </div>
        </div>

        <div className="p-4 space-y-2 flex-1 overflow-y-auto">
          {currentModules.map((item) => (
            <SidebarItem 
              key={item.id} 
              item={item} 
              isActive={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                setIsMobileOpen(false);
              }}
              isMobile={true} // Always show labels in this sidebar style
            />
          ))}
        </div>

        <div className="p-4 border-t border-slate-50">
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl">
            <img 
               src={user.avatar || "https://i.pravatar.cc/150?img=12"} 
               alt="Profile" 
               className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate">{user.name || 'Utilisateur'}</p>
              <p className="text-xs text-slate-500 truncate capitalize">{user.role || 'Employé'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopHeader 
          isMobileOpen={isMobileOpen} 
          setIsMobileOpen={setIsMobileOpen}
          title={activeModule?.label || 'Espace Employé'} 
          notifications={pendingTasks}
          onValidate={handleValidateTask}
          showDropdown={showDropdown}
          setShowDropdown={setShowDropdown}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth bg-[#F8FAFC]">
          <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500 slide-in-from-bottom-2">
            {children}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
