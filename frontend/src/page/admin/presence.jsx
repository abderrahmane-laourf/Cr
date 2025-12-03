import React, { useState } from 'react';
import { 
  Search, Plus, Calendar, X, Check, ChevronDown, 
  Clock, AlertTriangle, TrendingUp, TrendingDown, Trash2 
} from 'lucide-react';

// --- DONNÉES DE DÉPART ---
const EMPLOYEES = [
  { id: 1, name: 'Ahmed Benali', role: 'Admin', avatar: 'https://i.pravatar.cc/150?img=11' },
  { id: 2, name: 'Sarah Idrissi', role: 'Manager', avatar: 'https://i.pravatar.cc/150?img=5' },
  { id: 3, name: 'Karim Tazi', role: 'Employé', avatar: 'https://i.pravatar.cc/150?img=3' },
];

const INITIAL_ATTENDANCE = [
  { id: 1, employeeId: 1, date: '2023-12-02', daysAdj: 0, hoursAdj: 2, note: 'Heures sup projet Alpha' }, // +2h (Commission)
  { id: 2, employeeId: 2, date: '2023-12-01', daysAdj: -1, hoursAdj: 0, note: 'Absence injustifiée' }, // -1 jour (Déduction)
  { id: 3, employeeId: 3, date: '2023-12-03', daysAdj: 0, hoursAdj: -2, note: 'Retard matin' }, // -2h (Déduction)
];

// --- UTILITAIRES ---
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
};

// --- MODAL SIMPLIFIÉ (JOURS & HEURES) ---
const AddAttendanceModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    date: new Date().toISOString().slice(0, 10),
    daysAdj: '', // Input jour
    hoursAdj: '', // Input heure
    note: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.employeeId) return;

    onSave({
      ...formData,
      employeeId: parseInt(formData.employeeId),
      daysAdj: parseFloat(formData.daysAdj || 0),
      hoursAdj: parseFloat(formData.hoursAdj || 0),
    });
    onClose();
  };

  // Helper pour la couleur des inputs
  const getInputColor = (val) => {
    if (val > 0) return 'border-emerald-300 text-emerald-700 bg-emerald-50 focus:border-emerald-500'; // Positif (Gain)
    if (val < 0) return 'border-red-300 text-red-700 bg-red-50 focus:border-red-500'; // Négatif (Perte)
    return 'border-slate-200 text-slate-700 bg-white focus:border-blue-500'; // Neutre
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Modifier Présence & Salaire</h2>
          <button onClick={onClose} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Ligne 1 : Employé & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Employé <span className="text-red-400">*</span></label>
              <div className="relative">
                <select 
                  className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 outline-none appearance-none"
                  value={formData.employeeId}
                  onChange={e => setFormData({...formData, employeeId: e.target.value})}
                  required
                >
                  <option value="">Sélectionner...</option>
                  {EMPLOYEES.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Date</label>
              <input 
                type="date" 
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>
          </div>

          {/* Ligne 2 : Inputs Financiers (Jours & Heures) */}
          <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={18} className="text-blue-600"/>
                <h3 className="font-bold text-blue-900 text-sm">Impact sur Salaire (Commission / Déduction)</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* INPUT JOURS */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex justify-between">
                    <span>Ajustement Jours</span>
                    <span className="text-[10px] text-slate-400">Ex: +1 ou -1</span>
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      step="0.5"
                      placeholder="0" 
                      className={`w-full px-4 py-3 rounded-xl border text-lg font-bold outline-none transition-colors ${getInputColor(formData.daysAdj)}`}
                      value={formData.daysAdj}
                      onChange={e => setFormData({...formData, daysAdj: e.target.value})}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                       <Calendar size={18} className={formData.daysAdj !== '' && formData.daysAdj != 0 ? (formData.daysAdj > 0 ? 'text-emerald-500' : 'text-red-500') : 'text-slate-300'} />
                    </div>
                  </div>
                  {formData.daysAdj > 0 && <p className="text-[10px] text-emerald-600 font-bold ml-1">✨ Ajoute une Commission (Prime)</p>}
                  {formData.daysAdj < 0 && <p className="text-[10px] text-red-500 font-bold ml-1">⚠️ Ajoute une Déduction (Retenue)</p>}
                </div>

                {/* INPUT HEURES */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex justify-between">
                    <span>Ajustement Heures</span>
                    <span className="text-[10px] text-slate-400">Ex: +2 ou -2</span>
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      step="0.5"
                      placeholder="0" 
                      className={`w-full px-4 py-3 rounded-xl border text-lg font-bold outline-none transition-colors ${getInputColor(formData.hoursAdj)}`}
                      value={formData.hoursAdj}
                      onChange={e => setFormData({...formData, hoursAdj: e.target.value})}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                       <Clock size={18} className={formData.hoursAdj !== '' && formData.hoursAdj != 0 ? (formData.hoursAdj > 0 ? 'text-emerald-500' : 'text-red-500') : 'text-slate-300'} />
                    </div>
                  </div>
                  {formData.hoursAdj > 0 && <p className="text-[10px] text-emerald-600 font-bold ml-1">✨ Ajoute une Commission (Heures Sup)</p>}
                  {formData.hoursAdj < 0 && <p className="text-[10px] text-red-500 font-bold ml-1">⚠️ Ajoute une Déduction (Retard)</p>}
                </div>
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Note (Optionnel)</label>
            <input 
              type="text" 
              placeholder="Ex: Heures supplémentaires projet X..." 
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none"
              value={formData.note}
              onChange={e => setFormData({...formData, note: e.target.value})}
            />
          </div>

          <button type="submit" className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
             <Check size={20} /> Sauvegarder
          </button>
        </form>
      </div>
    </div>
  );
};

// --- PAGE PRINCIPALE ---
export default function AttendancePage() {
  const [attendanceList, setAttendanceList] = useState(INITIAL_ATTENDANCE);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [expandedEmployeeId, setExpandedEmployeeId] = useState(null);

  const toggleEmployee = (id) => {
    setExpandedEmployeeId(expandedEmployeeId === id ? null : id);
  };

  const handleAddAttendance = (record) => {
    const newRecord = { ...record, id: Date.now() };
    setAttendanceList([newRecord, ...attendanceList]);
    setExpandedEmployeeId(record.employeeId);
  };

  const handleDelete = (id) => {
      if(window.confirm("Supprimer cet enregistrement ?")) {
          setAttendanceList(prev => prev.filter(a => a.id !== id));
      }
  };

  const filteredEmployees = EMPLOYEES.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fonction pour afficher les Badges d'impact
  const ImpactBadge = ({ value, unit, type }) => {
    if (!value || value === 0) return null;
    const isPositive = value > 0;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${isPositive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
        {isPositive ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
        {isPositive ? '+' : ''}{value} {unit} 
        <span className="opacity-70 font-normal ml-0.5">({isPositive ? 'Commission' : 'Déduction'})</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-8 font-sans text-slate-800">
      
      {/* HEADER */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Suivi Présence & Impact Paie</h1>
            <p className="text-slate-500 mt-1 font-medium">Gérez les heures sup et absences pour le calcul des salaires.</p>
          </div>
          <button onClick={() => setIsAddModalOpen(true)} className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 font-semibold">
            <Plus size={20} /> Ajouter Ajustement
          </button>
        </div>
        <div className="relative mt-6 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input type="text" placeholder="Chercher un employé..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
        </div>
      </div>

      {/* LISTE ACCORDÉON */}
      <div className="space-y-4">
        {filteredEmployees.map(employee => {
          const records = attendanceList.filter(a => a.employeeId === employee.id).sort((a,b) => new Date(b.date) - new Date(a.date));
          const isExpanded = expandedEmployeeId === employee.id;

          // Calculs rapides pour l'aperçu
          const totalHoursBonus = records.reduce((sum, r) => sum + (r.hoursAdj || 0), 0);
          const totalDaysBonus = records.reduce((sum, r) => sum + (r.daysAdj || 0), 0);

          return (
            <div key={employee.id} className={`bg-white border rounded-2xl transition-all duration-300 overflow-hidden ${isExpanded ? 'border-blue-200 shadow-md' : 'border-slate-200 shadow-sm'}`}>
              
              {/* Résumé Employé */}
              <div onClick={() => toggleEmployee(employee.id)} className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-colors overflow-hidden ${isExpanded ? 'bg-blue-100 ring-4 ring-blue-50' : 'bg-slate-100'}`}>
                    <img src={employee.avatar} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{employee.name}</h3>
                    <div className="flex gap-3 mt-1 text-xs font-bold">
                        <span className={`${totalHoursBonus >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                           {totalHoursBonus > 0 ? '+' : ''}{totalHoursBonus}h Cumulées
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className={`${totalDaysBonus >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                           {totalDaysBonus > 0 ? '+' : ''}{totalDaysBonus} Jours Cumulés
                        </span>
                    </div>
                  </div>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${isExpanded ? 'bg-blue-600 border-blue-600 text-white rotate-180' : 'bg-white border-slate-200 text-slate-400'}`}>
                    <ChevronDown size={18} />
                </div>
              </div>

              {/* Tableau Détails */}
              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-6 animate-in slide-in-from-top-2">
                  {records.length > 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                          <tr>
                            <th className="px-5 py-3">Date</th>
                            <th className="px-5 py-3">Impact Jours</th>
                            <th className="px-5 py-3">Impact Heures</th>
                            <th className="px-5 py-3">Note</th>
                            <th className="px-5 py-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {records.map(record => (
                            <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-5 py-4 font-medium text-slate-700">{formatDate(record.date)}</td>
                              
                              <td className="px-5 py-4">
                                <ImpactBadge value={record.daysAdj} unit="Jour(s)" />
                                {!record.daysAdj && <span className="text-slate-300">-</span>}
                              </td>
                              
                              <td className="px-5 py-4">
                                <ImpactBadge value={record.hoursAdj} unit="Heure(s)" />
                                {!record.hoursAdj && <span className="text-slate-300">-</span>}
                              </td>

                              <td className="px-5 py-4 text-slate-400 italic text-xs truncate max-w-[200px]">{record.note || 'Aucune note'}</td>
                              
                              <td className="px-5 py-4 text-right">
                                <button onClick={() => handleDelete(record.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                                    <Trash2 size={16}/>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                      <AlertTriangle size={32} className="mx-auto mb-2 opacity-20"/>
                      <p>Aucun ajustement enregistré.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <AddAttendanceModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSave={handleAddAttendance} 
      />
    </div>
  );
}