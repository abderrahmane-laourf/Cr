import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, Plus, Calendar, X, Check, ChevronDown, 
  Clock, AlertTriangle, TrendingUp, TrendingDown, Trash2, Edit2
} from 'lucide-react';
import { employeeAPI, presenceAPI, calculateDailyRate, calculateHourlyRate } from '../../services/api';
import Swal from 'sweetalert2';
import SpotlightCard from '../../util/SpotlightCard';

// --- UTILITAIRES ---
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
};

// --- MODAL SIMPLIFIÉ (JOURS & HEURES) ---
const AddAttendanceModal = ({ isOpen, onClose, onSave, employees, defaultEmployeeId, initialData }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    date: new Date().toISOString().slice(0, 10),
    daysAdj: '', // Input jour
    hoursAdj: '', // Input heure
    note: ''
  });

  // Reset/Init form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          ...initialData,
          employeeId: initialData.employeeId,
          daysAdj: initialData.daysAdj,
          hoursAdj: initialData.hoursAdj,
          note: initialData.note || ''
        });
      } else {
        setFormData({
          employeeId: defaultEmployeeId || '',
          date: new Date().toISOString().slice(0, 10),
          daysAdj: '',
          hoursAdj: '',
          note: ''
        });
      }
    }
  }, [isOpen, defaultEmployeeId, initialData]);

  // Stable onChange handler to prevent input focus loss
  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Get selected employee to show rates (Loose comparison for string/number IDs)
  const selectedEmployee = employees?.find(e => String(e.id) === String(formData.employeeId));

  // Calculate rates from selected employee
  const dailyRate = selectedEmployee ? calculateDailyRate(selectedEmployee.salary) : 0;
  const hourlyRate = selectedEmployee ? calculateHourlyRate(dailyRate) : 0;
  const formatCurrency = (amount) => Math.round(amount * 100) / 100;

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.employeeId) return;

    onSave({
      ...formData,
      employeeId: formData.employeeId, // Keep as string/number as is
      daysAdj: parseFloat(formData.daysAdj || 0),
      hoursAdj: parseFloat(formData.hoursAdj || 0),
    });
    onClose();
  };

  // Helper pour la couleur des inputs
  const getInputColor = (val) => {
    if (val > 0) return 'border-emerald-300 text-emerald-700 bg-emerald-50 focus:border-emerald-500'; // Positif (Gain)
    if (val < 0) return 'border-red-300 text-red-700 bg-red-50 focus:border-red-500'; // Négatif (Perte)
    return 'border-slate-200 text-slate-700 bg-white focus:border-[#2563EB]'; // Neutre
  };

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <SpotlightCard theme="light" className="w-full max-w-2xl flex flex-col animate-in zoom-in-95 duration-200 !p-0 bg-white dark:bg-slate-900">
        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-[#1e3a8a]">{initialData ? 'Modifier Présence' : 'Ajouter Présence'}</h2>
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
                  onChange={e => handleFieldChange('employeeId', e.target.value)}
                  required
                >
                  <option value="">Sélectionner...</option>
                  {employees?.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
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
                onChange={e => handleFieldChange('date', e.target.value)}
              />
            </div>
            {/* Show employee salary info */}
            {selectedEmployee && (
              <div className="md:col-span-2 bg-[#1e3a8a]/5 p-3 rounded-lg border border-[#1e3a8a]/10">
                <p className="text-xs text-[#2563EB] font-semibold">Salaire: {selectedEmployee.salary} MAD/mois</p>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <p className="text-[10px] text-slate-600">📅 Jour: {formatCurrency(dailyRate)} MAD</p>
                  <p className="text-[10px] text-slate-600">⏰ Heure: {formatCurrency(hourlyRate)} MAD</p>
                </div>
              </div>
            )}
          </div>

          {/* Ligne 2 : Inputs Financiers (Jours & Heures) */}
          <div className="bg-[#1e3a8a]/5 p-6 rounded-2xl border border-[#1e3a8a]/10 space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={18} className="text-[#2563EB]"/>
                <h3 className="font-bold text-[#1e3a8a] text-sm">Impact sur Salaire (Commission / Déduction)</h3>
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
                      onChange={e => handleFieldChange('daysAdj', e.target.value)}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                       <Calendar size={18} className={formData.daysAdj !== '' && formData.daysAdj != 0 ? (formData.daysAdj > 0 ? 'text-emerald-500' : 'text-red-500') : 'text-slate-300'} />
                    </div>
                  </div>
                  {formData.daysAdj > 0 && <p className="text-[10px] text-emerald-600 font-bold ml-1">✨ Commission: +{formatCurrency(formData.daysAdj * dailyRate)} MAD</p>}
                  {formData.daysAdj < 0 && <p className="text-[10px] text-red-500 font-bold ml-1">⚠️ Déduction: -{formatCurrency(Math.abs(formData.daysAdj) * dailyRate)} MAD</p>}
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
                      onChange={e => handleFieldChange('hoursAdj', e.target.value)}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                       <Clock size={18} className={formData.hoursAdj !== '' && formData.hoursAdj != 0 ? (formData.hoursAdj > 0 ? 'text-emerald-500' : 'text-red-500') : 'text-slate-300'} />
                    </div>
                  </div>
                  {formData.hoursAdj > 0 && <p className="text-[10px] text-emerald-600 font-bold ml-1">✨ Commission: +{formatCurrency(formData.hoursAdj * hourlyRate)} MAD</p>}
                  {formData.hoursAdj < 0 && <p className="text-[10px] text-red-500 font-bold ml-1">⚠️ Déduction: -{formatCurrency(Math.abs(formData.hoursAdj) * hourlyRate)} MAD</p>}
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
              onChange={e => handleFieldChange('note', e.target.value)}
            />
          </div>

          <button type="submit" className="w-full py-4 rounded-xl bg-[#2563EB] text-white font-bold text-lg hover:bg-[#1e3a8a] shadow-xl shadow-blue-900/20 transition-all flex items-center justify-center gap-2">
             <Check size={20} /> Sauvegarder
          </button>
        </form>
      </SpotlightCard>
    </div>,
    document.body
  );
};

// --- PAGE PRINCIPALE ---
export default function AttendancePage() {
  const [attendanceList, setAttendanceList] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [expandedEmployeeId, setExpandedEmployeeId] = useState(null);
  const [preSelectedEmployeeId, setPreSelectedEmployeeId] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [empData, presenceData] = await Promise.all([
        employeeAPI.getAll(),
        presenceAPI.getAll()
      ]);
      setEmployees(empData || []); // Ensure array
      setAttendanceList(presenceData || []); // Ensure array
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleEmployee = (id) => {
    setExpandedEmployeeId(expandedEmployeeId === id ? null : id);
  };

  const handleAddAttendance = async (record) => {
    try {
      if (record.id) {
        await presenceAPI.update(record.id, record);
      } else {
        await presenceAPI.create(record);
      }
      loadData();
      setExpandedEmployeeId(record.employeeId);
      setIsAddModalOpen(false);
      setEditingRecord(null);
    } catch (error) {
      console.error('Error adding/updating attendance:', error);
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setIsAddModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Vous ne pourrez pas revenir en arrière !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        await presenceAPI.delete(id);
        Swal.fire(
          'Supprimé !',
          'L\'enregistrement a été supprimé.',
          'success'
        );
        loadData();
      } catch (error) {
        console.error('Error deleting attendance:', error);
        Swal.fire(
          'Erreur !',
          'Une erreur est survenue lors de la suppression.',
          'error'
        );
      }
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function pour afficher les Badges d'impact
  const ImpactBadge = ({ value, unit, employee }) => {
    if (!value || value === 0) return null;
    const isPositive = value > 0;
    
    // Calculate monetary value
    let moneyImpact = 0;
    if (employee) {
      const dailyRate = calculateDailyRate(employee.salary);
      const hourlyRate = calculateHourlyRate(dailyRate);
      
      if (unit.includes('Jour')) {
        moneyImpact = Math.abs(value) * dailyRate;
      } else if (unit.includes('Heure')) {
        moneyImpact = Math.abs(value) * hourlyRate;
      }
    }
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${isPositive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
        {isPositive ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
        {isPositive ? '+' : ''}{value} {unit} 
        <span className="opacity-70 font-normal ml-0.5">({Math.round(moneyImpact * 100) / 100} MAD)</span>
      </span>
    );
  };

  return (
    <div className="w-full min-h-screen bg-transparent animate-[fade-in_0.6s_ease-out] p-8 font-sans text-slate-800 dark:text-slate-200">
      
      {/* HEADER */}
      <SpotlightCard theme="light" className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#2563EB] tracking-tight">Suivi Présence & Impact Paie</h1>
            <p className="text-slate-500 mt-1 font-medium">Gérez les heures sup et absences pour le calcul des salaires.</p>
          </div>
          <button 
            onClick={() => {
              setPreSelectedEmployeeId(null);
              setEditingRecord(null);
              setIsAddModalOpen(true);
            }} 
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#2563EB] text-white rounded-xl hover:bg-[#1e3a8a] transition-all shadow-lg shadow-blue-900/20 font-semibold"
          >
            <Plus size={20} /> Ajouter Ajustement
          </button>
        </div>
        <div className="relative mt-6 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2563EB]/50" size={20} />
          <input type="text" placeholder="Chercher un employé..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all" />
        </div>
      </SpotlightCard>

      {/* LISTE ACCORDÉON */}
      <div className="space-y-4">
        {filteredEmployees.map(employee => {
          // Compare IDs as strings to avoid mismatch issues
          const records = attendanceList.filter(a => String(a.employeeId) === String(employee.id)).sort((a,b) => new Date(b.date) - new Date(a.date));
          const isExpanded = expandedEmployeeId === employee.id;

          // Calculs rapides pour l'aperçu
          const totalHoursBonus = records.reduce((sum, r) => sum + (r.hoursAdj || 0), 0);
          const totalDaysBonus = records.reduce((sum, r) => sum + (r.daysAdj || 0), 0);

          return (
            <SpotlightCard theme="light" key={employee.id} className={`!border transition-all duration-300 overflow-hidden !p-0 ${isExpanded ? '!border-[#2563EB] shadow-md' : '!border-slate-200 shadow-sm'}`}>
              
              {/* Résumé Employé */}
              <div onClick={() => toggleEmployee(employee.id)} className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-colors overflow-hidden ${isExpanded ? 'bg-[#2563EB]/10 ring-4 ring-[#2563EB]/5' : 'bg-slate-100'}`}>
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
                <div className="flex items-center gap-3">
                  {/* ADD PRESENCE BUTTON */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreSelectedEmployeeId(employee.id);
                      setEditingRecord(null);
                      setIsAddModalOpen(true);
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-[#2563EB]/10 text-[#2563EB] hover:bg-[#1e3a8a] hover:text-white transition-all border border-[#2563EB]/20"
                    title="Ajouter une présence"
                  >
                    <Plus size={18} />
                  </button>

                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${isExpanded ? 'bg-[#2563EB] border-[#2563EB] text-white rotate-180' : 'bg-white border-slate-200 text-slate-400'}`}>
                      <ChevronDown size={18} />
                  </div>
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
                                <ImpactBadge value={record.daysAdj} unit="Jour(s)" employee={employee} />
                                {!record.daysAdj && <span className="text-slate-300">-</span>}
                              </td>
                              
                              <td className="px-5 py-4">
                                <ImpactBadge value={record.hoursAdj} unit="Heure(s)" employee={employee} />
                                {!record.hoursAdj && <span className="text-slate-300">-</span>}
                              </td>

                              <td className="px-5 py-4 text-slate-400 italic text-xs truncate max-w-[200px]">{record.note || 'Aucune note'}</td>
                              
                               <td className="px-5 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => handleEdit(record)} className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition">
                                    <Edit2 size={16}/>
                                  </button>
                                  <button onClick={() => handleDelete(record.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                                    <Trash2 size={16}/>
                                  </button>
                                </div>
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
            </SpotlightCard>
          );
        })}
      </div>

      <AddAttendanceModal 
        isOpen={isAddModalOpen} 
        onClose={() => { setIsAddModalOpen(false); setEditingRecord(null); }} 
        onSave={handleAddAttendance}
        employees={employees}
        defaultEmployeeId={preSelectedEmployeeId}
        initialData={editingRecord}
      />
    </div>
  );
}