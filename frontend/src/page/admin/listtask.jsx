import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Edit2, Trash2, Eye, X, Check, 
  MapPin, Calendar, Clock, AlertCircle, CheckCircle, 
  ChevronDown, Filter, FileText, User
} from 'lucide-react';

// --- 1. UTILITY COMPONENTS ---

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-6 right-6 z-[60] animate-in slide-in-from-right-10 fade-in duration-300">
      <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md
        ${type === 'success' ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800' : 'bg-red-50/90 border-red-200 text-red-800'}`}>
        {type === 'success' ? <CheckCircle size={24} className="text-emerald-500" /> : <AlertCircle size={24} className="text-red-500" />}
        <div>
          <h4 className="font-bold text-sm">{type === 'success' ? 'Succès' : 'Erreur'}</h4>
          <p className="text-xs opacity-90">{message}</p>
        </div>
        <button onClick={onClose} className="ml-4 opacity-50 hover:opacity-100"><X size={16}/></button>
      </div>
    </div>
  );
};

const InputField = ({ label, type = "text", placeholder, value, onChange, disabled }) => (
  <div className="group">
    <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider group-focus-within:text-blue-600 transition-colors">
      {label} {!disabled && <span className="text-red-400">*</span>}
    </label>
    <div className="relative">
      <input 
        type={type} 
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full pl-4 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 disabled:bg-slate-100 disabled:text-slate-500`}
        value={value}
        onChange={onChange}
      />
    </div>
  </div>
);

const SelectField = ({ label, options, value, onChange, disabled }) => (
    <div className="group">
      <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider group-focus-within:text-blue-600 transition-colors">
        {label} {!disabled && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <select 
            disabled={disabled}
            className={`w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 appearance-none disabled:bg-slate-100 disabled:text-slate-500 cursor-pointer`}
            value={value}
            onChange={onChange}
        >
            <option value="">Sélectionner</option>
            {options.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.name}</option>
            ))}
        </select>
        {!disabled && <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><ChevronDown size={16} /></div>}
      </div>
    </div>
);

const TextAreaField = ({ label, placeholder, value, onChange, disabled }) => (
    <div className="group">
      <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider group-focus-within:text-blue-600 transition-colors">
        {label} {!disabled && <span className="text-red-400">*</span>}
      </label>
      <textarea
        rows="3"
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full pl-4 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 disabled:bg-slate-100 disabled:text-slate-500 resize-none`}
        value={value}
        onChange={onChange}
      />
    </div>
);

// --- 2. MODAL COMPONENT ---

const TaskModal = ({ isOpen, onClose, employees, onSave }) => {
    const [formData, setFormData] = useState({
        employeeId: '',
        startDate: new Date().toISOString().split('T')[0],
        days: 1,
        description: ''
    });

    useEffect(() => {
        if (!isOpen) {
            setFormData({
                employeeId: '',
                startDate: new Date().toISOString().split('T')[0],
                days: 1,
                description: ''
            });
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.employeeId || !formData.description) return;
        
        // Find employee name for the dashboard
        const emp = employees.find(e => e.id.toString() === formData.employeeId.toString());
        
        onSave({ ...formData, employeeName: emp ? emp.name : 'Inconnu' });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Nouvelle Tâche</h2>
                        <p className="text-sm text-slate-500">Attribuer une tâche à un employé</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    <SelectField 
                        label="Employé" 
                        options={employees} 
                        value={formData.employeeId} 
                        onChange={(e) => setFormData({...formData, employeeId: e.target.value})} 
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <InputField 
                            label="Date de début" 
                            type="date" 
                            value={formData.startDate} 
                            onChange={(e) => handleChange({ target: { name: 'startDate', value: e.target.value } })} 
                        />
                        <InputField 
                            label="Durée (Jours)" 
                            type="number" 
                            value={formData.days} 
                            onChange={(e) => handleChange({ target: { name: 'days', value: e.target.value } })} 
                        />
                    </div>

                    <TextAreaField 
                        label="Description de la tâche" 
                        placeholder="Détails de la tâche..." 
                        value={formData.description} 
                        onChange={(e) => handleChange({ target: { name: 'description', value: e.target.value } })} 
                    />

                    <div className="pt-4 flex justify-end gap-3">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
                        >
                            Annuler
                        </button>
                        <button 
                            type="submit"
                            className="px-8 py-2.5 rounded-xl text-white font-semibold flex items-center gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all"
                        >
                            <Check size={18} /> Attribuer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- 3. MAIN PAGE COMPONENT ---

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock Data for Employees (In real app, fetch from API)
  const employees = [
    { id: 1, name: 'Bernard Anouith' },
    { id: 2, name: 'Sarah Idrissi' },
    { id: 3, name: 'Fatiha Abassi' },
  ];

  const handleSaveTask = (taskData) => {
      const newTask = {
          id: tasks.length + 1,
          ...taskData,
          status: 'En attente',
          confirmStatus: 'Non débuté'
      };
      setTasks([...tasks, newTask]);
      setIsModalOpen(false);
      setToast({ message: "Tâche attribuée avec succès !", type: "success" });
  };

  const filteredTasks = tasks.filter(task => 
      task.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/50 p-8 font-sans text-slate-800 relative">
      
      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gestion des Tâches</h1>
            <p className="text-slate-500 mt-1 font-medium">Suivez et attribuez les tâches à votre équipe.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 font-semibold"
          >
            <Plus size={20} /> Ajouter une tâche
          </button>
        </div>
        
        <div className="mt-6 max-w-md relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
                type="text" 
                placeholder="Rechercher une tâche..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
            />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">#</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Employé</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tâche</th>
                <th className="text-center px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Statut Employé</th>
                <th className="text-center px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Statut Validation</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTasks.length === 0 ? (
                 <tr>
                    <td colSpan="6" className="p-10 text-center text-slate-400">
                        <div className="flex flex-col items-center">
                            <FileText size={40} className="mb-2 opacity-20" />
                            <p>Aucune tâche trouvée</p>
                        </div>
                    </td>
                 </tr>
              ) : (
                filteredTasks.map((task, index) => (
                  <tr key={task.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 text-slate-500 font-medium">{index + 1}</td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                {task.employeeName.charAt(0)}
                            </div>
                            <span className="font-semibold text-slate-800">{task.employeeName}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <p className="text-sm text-slate-600 max-w-xs truncate" title={task.description}>
                            {task.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                            <Calendar size={12} /> {task.startDate} • {task.days} jours
                        </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                           {task.status}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                           {task.confirmStatus}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Modifier">
                            <Edit2 size={18} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Supprimer">
                            <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        employees={employees}
        onSave={handleSaveTask}
      />
    </div>
  );
};

export default TaskManager;