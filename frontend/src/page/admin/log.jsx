import React, { useState, useEffect } from 'react';
import { 
  History, Search, Filter, Calendar, User, 
  MapPin, Clock, ArrowRight, Shield, AlertTriangle, 
  CheckCircle, FileText, Activity 
} from 'lucide-react';

const mockLogs = [
  { id: 1, type: 'Connexion', user: 'Sarah Idrissi', role: 'Employé', action: 'Connexion au système', date: '2023-11-20 08:30:00', details: 'IP: 192.168.1.15', status: 'success' },
  { id: 2, type: 'Pipeline', user: 'Admin', role: 'Administrateur', action: 'Déplacement de "Client A" vers Livraison', date: '2023-11-20 09:15:00', details: 'Pipeline: Livreur Agadir', status: 'success' },
  { id: 3, type: 'Sécurité', user: 'Inconnu', role: 'N/A', action: 'Tentative de connexion échouée', date: '2023-11-20 09:16:00', details: 'User: admin_test', status: 'warning' },
  { id: 4, type: 'Produit', user: 'Ahmed Benali', role: 'Manager', action: 'Modification stock "Sérum"', date: '2023-11-20 10:00:00', details: 'Stock: 45 -> 50', status: 'success' },
  { id: 5, type: 'Affectation', user: 'Admin', role: 'Administrateur', action: 'Nouvelle affectation matériel', date: '2023-11-20 11:30:00', details: 'Employé: Sarah Idrissi', status: 'success' },
];

const LogIcon = ({ type }) => {
  switch (type) {
    case 'Connexion': return <User size={16} className="text-blue-600" />;
    case 'Pipeline': return <Activity size={16} className="text-purple-600" />;
    case 'Sécurité': return <Shield size={16} className="text-red-600" />;
    case 'Produit': return <FileText size={16} className="text-emerald-600" />;
    default: return <History size={16} className="text-slate-600" />;
  }
};

const LogStatus = ({ status }) => {
  if (status === 'success') return <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100"><CheckCircle size={10} /> Succès</span>;
  if (status === 'warning') return <span className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100"><AlertTriangle size={10} /> Alerte</span>;
  return <span className="text-xs text-slate-500">Info</span>;
};

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    // Simulate fetching logs
    setLogs(mockLogs);
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || log.type === typeFilter;
    const matchesDate = !dateFilter || log.date.startsWith(dateFilter);
    return matchesSearch && matchesType && matchesDate;
  });

  const uniqueTypes = ['All', ...new Set(logs.map(l => l.type))];

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10 font-sans text-slate-800">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                <History className="text-slate-900" /> Journal d'Activité
              </h1>
              <p className="text-slate-500 mt-1 font-medium">Historique complet des actions et événements système.</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Rechercher par utilisateur ou action..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-medium text-sm"
              />
            </div>

            <div className="flex gap-4">
               <div className="relative">
                  <select 
                    value={typeFilter} 
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all appearance-none cursor-pointer min-w-[150px]"
                  >
                    {uniqueTypes.map(t => <option key={t} value={t}>{t === 'All' ? 'Tous les types' : t}</option>)}
                  </select>
                  <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
               </div>

               <div className="relative">
                  <input 
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all cursor-pointer"
                  />
               </div>
            </div>
          </div>
        </div>

        {/* Timeline / List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-400">Aucun historique trouvé.</div>
          ) : (
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-px bg-slate-100 hidden md:block"></div>
              <ul className="divide-y divide-slate-50">
                {filteredLogs.map((log) => (
                  <li key={log.id} className="group hover:bg-slate-50/50 transition-colors p-6 relative">
                    <div className="flex flex-col md:flex-row md:items-center gap-6 relative z-10">
                      
                      {/* Icon Bubble */}
                      <div className="hidden md:flex flex-col items-center">
                         <div className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
                           <LogIcon type={log.type} />
                         </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-1">
                          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                            {log.user} 
                            <span className="font-normal text-slate-400 text-xs px-2 py-0.5 bg-slate-100 rounded-full">{log.role}</span>
                          </h4>
                          <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                            <Clock size={12} /> {log.date}
                          </span>
                        </div>
                        <p className="text-slate-600 text-sm font-medium">{log.action}</p>
                        <div className="flex items-center gap-4 mt-2">
                           <LogStatus status={log.status} />
                           {log.details && <span className="text-xs text-slate-400 italic border-l border-slate-200 pl-3">{log.details}</span>}
                        </div>
                      </div>

                      <div className="md:text-right hidden group-hover:block transition-all">
                        <button className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                          Détails <ArrowRight size={12} />
                        </button>
                      </div>

                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
