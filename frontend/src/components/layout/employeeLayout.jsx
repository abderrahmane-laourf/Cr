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
  ClipboardList,
  CheckCircle2,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { taskAPI } from '../../services/api';

// ----------------------------------------------------------------------
// 1. DATA DE DÉMONSTRATION (Pour voir l'exemple tout de suite)
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
    { id: 'clients', label: 'Clients', icon: Users, path: '/employee/confirmation/clients' },
    { id: 'tasks', label: 'Tâches', icon: ClipboardList, path: '/employee/confirmation/tasks' }, // Badge apparaîtra ici
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, path: '/employee/confirmation/leaderboard' }
  ],
  packaging: [
    { id: 'queue', label: 'File de Colis', icon: Package, path: '/employee/packaging/queue' },
    { id: 'tasks', label: 'Tâches', icon: ClipboardList, path: '/employee/packaging/tasks' },
  ], 
  default: [
     { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, path: '/employee' },
     { id: 'tasks', label: 'Tâches', icon: ClipboardList, path: '/employee/tasks' },
  ]
};

// ----------------------------------------------------------------------
// 2. SIDEBAR ITEM (Avec le Badge Rouge)
// ----------------------------------------------------------------------
const SidebarItem = ({ item, isActive, onClick, isMobile, badgeCount }) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
      ${isActive 
        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
        : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'
      }
    `}
  >
    <div className="flex items-center gap-3">
      <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'} />
      <span className={isMobile ? 'block' : 'hidden lg:block'}>{item.label}</span>
    </div>

    {/* BADGE ROUGE : Nombre de tâches à faire */}
    {item.id === 'tasks' && badgeCount > 0 && (
      <div className={`
        flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-[11px] font-bold shadow-sm animate-in zoom-in
        ${isActive ? 'bg-white text-blue-600' : 'bg-red-500 text-white'}
      `}>
        {badgeCount}
      </div>
    )}
  </button>
);

// ----------------------------------------------------------------------
// 3. DROPDOWN NOTIFICATION (Liste des tâches à accepter)
// ----------------------------------------------------------------------
const NotificationDropdown = ({ tasks, onAccept, onClose }) => {
  return (
    <div className="absolute top-16 right-4 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
       {/* En-tête */}
       <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/80 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-red-500" />
            <h3 className="font-bold text-slate-800">À accepter</h3>
            <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-[10px] font-bold">{tasks.length}</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
            <X size={16}/>
          </button>
       </div>
       
       {/* Liste */}
       <div className="max-h-[400px] overflow-y-auto bg-slate-50/30">
          {tasks.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
               <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                 <Bell className="w-6 h-6 text-slate-300" />
               </div>
               <p className="text-sm font-medium">Vous êtes à jour !</p>
            </div>
          ) : (
            tasks.map(task => (
              <div key={task.id} className="p-4 border-b border-slate-100 bg-white hover:bg-slate-50 transition-colors group">
                 <div className="flex justify-between items-start mb-2">
                   <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">
                     {task.title || "Nouvelle tâche"}
                   </h4>
                   <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                     {new Date(task.dateCreated).toLocaleDateString()}
                   </span>
                 </div>
                 <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">{task.description}</p>
                 
                 <button 
                   onClick={() => onAccept(task.id)}
                   className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-bold transition-all hover:bg-slate-800 active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10"
                 >
                   <Check size={14} />
                   Accepter la tâche
                 </button>
              </div>
            ))
          )}
       </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 4. HEADER PRINCIPAL
// ----------------------------------------------------------------------
const TopHeader = ({ isMobileOpen, setIsMobileOpen, title, notifications, onAccept, showDropdown, setShowDropdown }) => {
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

      <div className="flex items-center gap-2 md:gap-3">
        {/* BOUTON CLOCHE */}
        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className={`p-2.5 rounded-xl transition-all relative ${showDropdown ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Bell size={20} />
            {notifications?.length > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse shadow-sm" />
            )}
          </button>
          
          {showDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
              <NotificationDropdown 
                tasks={notifications || []} 
                onAccept={onAccept} 
                onClose={() => setShowDropdown(false)} 
              />
            </>
          )}
        </div>

        <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block"></div>

        <button 
          onClick={() => { localStorage.clear(); navigate('/'); }}
          className="p-2.5 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all flex items-center gap-2"
          title="Se déconnecter"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

// ----------------------------------------------------------------------
// 5. LAYOUT PRINCIPAL
// ----------------------------------------------------------------------
export function EmployeeLayout({ children, mode = 'default' }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  // INITIALISATION AVEC DONNÉES MOCK POUR L'EXEMPLE
  const [pendingTasks, setPendingTasks] = useState(MOCK_NOTIFICATIONS); 
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
  
  let currentModules = [];
  if (mode === 'confirmation') currentModules = MODULES.confirmation;
  else if (mode === 'packaging') currentModules = MODULES.packaging;
  else currentModules = MODULES.default;

  // Récupération des données API (Optionnel si vous voulez garder le mock)
  const fetchNotifications = async () => {
      try {
          const allTasks = await taskAPI.getAll();
          // Logique de filtre... (simulée ici par le mock pour l'exemple)
          // setPendingTasks(...) 
      } catch (error) {
          console.log("Mode démo : utilisation des données statiques");
      }
  };

  useEffect(() => {
    // fetchNotifications(); // Décommenter pour utiliser l'API réelle
  }, []);

  // Action : Accepter une tâche
  const handleAcceptTask = async (taskId) => {
      try {
          // 1. Simulation API (On met à jour le statut)
          // await taskAPI.update(taskId, { status: 'En cours' });
          
          // 2. Mise à jour de l'affichage (On retire la tâche de la liste des notifs)
          setPendingTasks(prev => prev.filter(t => t.id !== taskId));
          
          // 3. Navigation vers la page des tâches
          const tasksModule = currentModules.find(m => m.id === 'tasks');
          if (tasksModule && location.pathname !== tasksModule.path) {
              navigate(tasksModule.path);
          }
          
          // 4. Fermer le dropdown s'il est vide
          if (pendingTasks.length <= 1) setShowDropdown(false);

      } catch (error) {
          console.error("Erreur", error);
      }
  };

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
            <span className="text-xl font-bold tracking-wide text-blue-700">MyPlatform</span>
          </div>
        </div>

        <div className="p-4 space-y-2 flex-1 overflow-y-auto">
          {currentModules.map((item) => (
            <SidebarItem 
              key={item.id} 
              item={item} 
              isActive={location.pathname === item.path}
              // LOGIQUE DU BADGE : On passe le nombre seulement si c'est 'tasks'
              badgeCount={item.id === 'tasks' ? pendingTasks.length : 0}
              onClick={() => {
                navigate(item.path);
                setIsMobileOpen(false);
              }}
              isMobile={true} 
            />
          ))}
        </div>

        <div className="p-4 border-t border-slate-50">
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
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
          onAccept={handleAcceptTask}
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