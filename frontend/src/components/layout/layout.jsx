import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet, NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Box, Workflow, Package, ShoppingCart,
  Factory, Megaphone, ListTodo, Building, Wallet, Coins, FileText, 
  Settings, ChevronRight, ChevronDown, Bell, LogOut, Menu, X, 
  Search, User, ChevronUp
} from 'lucide-react';

// ----------------------------------------------------------------------
// 1. DATA CONFIGURATION
// ----------------------------------------------------------------------
const MODULES = [
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, path: '/admin/dashboard' },
  {
    id: 'employees', label: 'Ressources Humaines', icon: Users,
    subItems: [
      { id: 'emp-list', label: 'Liste des Employés', path: '/admin/employees' },
      { id: 'emp-pay', label: 'Paiement & Salaires', path: '/admin/paiement' },
      { id: 'emp-presence', label: 'Suivi de Présence', path: '/admin/presence' },
      { id: 'emp-permissions', label: 'Permissions', path: '/admin/permissions' },
    ]
  },
  {
    id: 'stock', label: 'Gestion de Stock', icon: Box,
    subItems: [
      { id: 'stock-dash', label: 'Dashboard Stock', path: '/admin/stock/dashboard' },
      { id: 'stock-state', label: 'État du Stock', path: '/admin/stock' },
      { id: 'stock-transfer', label: 'Transferts', path: '/admin/stock/transfer' },
    ]
  },
  {
    id: 'pipeline', label: 'Pipeline ', icon: Workflow,
    subItems: [
      { id: 'pipeline-dash', label: 'Dashboard', path: '/admin/pipeline/dashboard' },
      { id: 'pipeline-kanban', label: 'Management Pipeline ', path: '/admin/pipeline' },
      { id: 'pipeline-list', label: 'Liste Clients', path: '/admin/pipeline/list' },
    ]
  },
  { id: 'produit', label: 'Catalogue', icon: Package, path: '/admin/products' },
  { id: 'achat', label: 'Achats', icon: ShoppingCart, path: '/admin/suppliers' },
  { id: 'production', label: 'Production', icon: Factory, path: '/admin/production' },
  { id: 'ads', label : 'Marketing', icon : Megaphone, path: '/admin/ads' },
  { id: 'task', label : 'Tâches', icon : ListTodo, path : '/admin/task' },
  { id: 'finance', label: 'Finance', icon: Wallet, path: '/admin/debts' },
  { id: 'settings', label: 'Paramètres', icon: Settings, path: '/admin/settings' }
];

// ----------------------------------------------------------------------
// 2. SUB-COMPONENTS
// ----------------------------------------------------------------------

const SidebarItem = ({ item, toggleExpand, expandedItems, setSidebarOpen }) => {
  const location = useLocation();
  const hasSubItems = item.subItems && item.subItems.length > 0;
  const isExpanded = expandedItems[item.id];
  
  // Check if current path matches item or subitems
  const isActive = location.pathname === item.path || item.subItems?.some(sub => sub.path === location.pathname);

  if (hasSubItems) {
    return (
      <div className="mb-1">
        <button
          onClick={() => toggleExpand(item.id)}
          className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors
            ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
          `}
        >
          <div className="flex items-center gap-3">
            <item.icon size={20} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
            <span>{item.label}</span>
          </div>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {/* Dropdown */}
        <div className={`overflow-hidden transition-all duration-200 ${isExpanded ? 'max-h-96' : 'max-h-0'}`}>
          <div className="mt-1 ml-4 border-l-2 border-slate-100 pl-2 space-y-1">
            {item.subItems.map((sub) => (
              <NavLink
                key={sub.id}
                to={sub.path}
                onClick={() => setSidebarOpen(false)} // Close sidebar on mobile when clicked
                className={({ isActive }) => `
                  block px-4 py-2 text-sm rounded-lg transition-colors
                  ${isActive 
                    ? 'text-blue-700 font-semibold bg-blue-50/50' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}
                `}
              >
                {sub.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Single Item
  return (
    <NavLink
      to={item.path}
      onClick={() => setSidebarOpen(false)}
      className={({ isActive }) => `
        flex items-center gap-3 px-4 py-3 mb-1 text-sm font-medium rounded-lg transition-colors
        ${isActive 
          ? 'bg-blue-600 text-white shadow-sm' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
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

// ----------------------------------------------------------------------
// 3. MAIN LAYOUT
// ----------------------------------------------------------------------

export function AdminLayout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const location = useLocation();

  const toggleExpand = (id) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Determine Page Title
  let pageTitle = "Dashboard";
  MODULES.forEach(m => {
    if (m.path === location.pathname) pageTitle = m.label;
    m.subItems?.forEach(sub => {
      if (sub.path === location.pathname) pageTitle = sub.label;
    });
  });

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">

      {/* --- MOBILE OVERLAY --- */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:static lg:translate-x-0 flex flex-col
      `}>
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="p-2 bg-blue-600 rounded-lg mr-3">
             <Box className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">NEXUS</span>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-slate-400">
            <X size={24} />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {MODULES.map((module) => (
            <SidebarItem 
              key={module.id} 
              item={module} 
              toggleExpand={toggleExpand}
              expandedItems={expandedItems}
              setSidebarOpen={setSidebarOpen}
            />
          ))}
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              A
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-slate-700 truncate">Admin User</p>
              <p className="text-xs text-slate-500 truncate">admin@nexus.com</p>
            </div>
            <LogOut size={16} className="text-slate-400" />
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 lg:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-bold text-slate-800">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-4">
             {/* Search */}
            <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-2">
              <Search size={18} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                className="bg-transparent border-none outline-none text-sm ml-2 w-48 text-slate-700"
              />
            </div>
            
            {/* Notification */}
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
             {children}
             <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}