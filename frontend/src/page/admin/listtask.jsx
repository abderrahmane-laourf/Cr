import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Edit2, Trash2, X, Check, Calendar, AlertCircle, 
  CheckCircle, ChevronDown, FileText, Eye, EyeOff, MessageSquare, 
  Clock, Award, ChevronRight 
} from 'lucide-react';

// --- 1. UTILITY COMPONENTS ---

const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-6 right-6 z-[60] animate-in slide-in-from-right-10 fade-in duration-300">
      <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md
        ${type === "success" ? "bg-emerald-50/90 border-emerald-200 text-emerald-800" : "bg-red-50/90 border-red-200 text-red-800"}`}>
        {type === "success" ? (
          <CheckCircle size={24} className="text-emerald-500" />
        ) : (
          <AlertCircle size={24} className="text-red-500" />
        )}
        <div>
          <h4 className="font-bold text-sm">{type === "success" ? "Succès" : "Erreur"}</h4>
          <p className="text-xs opacity-90">{message}</p>
        </div>
        <button onClick={onClose} className="ml-4 opacity-50 hover:opacity-100">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

const InputField = ({ label, type = "text", placeholder, value, onChange, disabled }) => (
  <div className="group">
    <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider group-focus-within:text-blue-600 transition-colors">
      {label} {!disabled && <span className="text-red-400">*</span>}
    </label>
    <input
      type={type}
      disabled={disabled}
      placeholder={placeholder}
      className="w-full pl-4 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 disabled:bg-slate-100 disabled:text-slate-500"
      value={value}
      onChange={onChange}
    />
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
        className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 appearance-none disabled:bg-slate-100 disabled:text-slate-500 cursor-pointer"
        value={value}
        onChange={onChange}
      >
        <option value="">Sélectionner</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name}
          </option>
        ))}
      </select>
      {!disabled && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <ChevronDown size={16} />
        </div>
      )}
    </div>
  </div>
);

const TextAreaField = ({ label, placeholder, value, onChange, disabled, required = true }) => (
  <div className="group">
    <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider group-focus-within:text-blue-600 transition-colors">
      {label} {!disabled && required && <span className="text-red-400">*</span>}
    </label>
    <textarea
      rows={3}
      disabled={disabled}
      placeholder={placeholder}
      className="w-full pl-4 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 disabled:bg-slate-100 disabled:text-slate-500 resize-none"
      value={value}
      onChange={onChange}
    />
  </div>
);

// --- 2. TASK MODAL COMPONENT ---

const TaskModal = ({ isOpen, onClose, employees, onSave }) => {
  const [formData, setFormData] = useState({
    employeeId: "",
    startDate: new Date().toISOString().split("T")[0],
    days: 1,
    priority: "normal",
    description: "",
  });

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        employeeId: "",
        startDate: new Date().toISOString().split("T")[0],
        days: 1,
        priority: "normal",
        description: "",
      });
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.employeeId || !formData.description) return;

    const emp = employees.find((e) => e.id.toString() === formData.employeeId.toString());

    onSave({ ...formData, employeeName: emp ? emp.name : "Inconnu" });
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
          <button
            onClick={onClose}
            className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <SelectField
            label="Employé"
            options={employees}
            value={formData.employeeId}
            onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Date de début"
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange({ target: { name: "startDate", value: e.target.value } })}
            />
            <SelectField
              label="Priorité"
              options={[
                { id: "low", name: "Basse" },
                { id: "normal", name: "Normale" },
                { id: "high", name: "Haute" },
              ]}
              value={formData.priority}
              onChange={(e) => handleChange({ target: { name: "priority", value: e.target.value } })}
            />
          </div>

          <InputField
            label="Durée (Jours)"
            type="number"
            value={formData.days}
            onChange={(e) => handleChange({ target: { name: "days", value: e.target.value } })}
          />

          <TextAreaField
            label="Description de la tâche"
            placeholder="Détails de la tâche..."
            value={formData.description}
            onChange={(e) => handleChange({ target: { name: "description", value: e.target.value } })}
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

// --- 3. TASK DETAIL MODAL ---

const TaskDetailModal = ({ isOpen, onClose, task, onUpdate }) => {
  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Détails de la Tâche</h2>
            <p className="text-sm text-slate-500">Suivi et réponse de l'employé</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-6 overflow-y-auto">
          {/* Task Info */}
          <div className="bg-slate-50 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                {task.employeeName?.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{task.employeeName}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar size={12} />
                  {new Date(task.startDate).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                  <span>•</span>
                  <Clock size={12} />
                  {task.days} jour(s)
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-600 bg-white rounded-xl p-4 border border-slate-100">{task.description}</p>
          </div>

          {/* Visibility Status */}
          <div
            className={`flex items-center gap-4 p-4 rounded-2xl border-2 ${
              task.seenByEmployee ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
            }`}
          >
            {task.seenByEmployee ? (
              <>
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Eye size={20} className="text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-emerald-800">Vu par l'employé</p>
                  <p className="text-xs text-emerald-600">
                    {task.seenAt
                      ? `Le ${new Date(task.seenAt).toLocaleDateString("fr-FR")} à ${new Date(task.seenAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`
                      : "Date non disponible"}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center animate-pulse">
                  <EyeOff size={20} className="text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-amber-800">En attente de lecture</p>
                  <p className="text-xs text-amber-600">L'employé n'a pas encore consulté cette tâche</p>
                </div>
              </>
            )}
          </div>

          {/* Employee Response */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare size={18} className="text-slate-400" />
              <h4 className="font-bold text-slate-700 uppercase text-xs tracking-wider">Réponse de l'employé</h4>
            </div>
            {task.employeeResponse ? (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                <p className="text-sm text-blue-800">{task.employeeResponse}</p>
                {task.responseAt && (
                  <p className="text-xs text-blue-500 mt-2">
                    Répondu le {new Date(task.responseAt).toLocaleDateString("fr-FR")}
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-slate-100 border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center">
                <MessageSquare size={24} className="text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Aucune réponse pour le moment</p>
              </div>
            )}
          </div>

          {/* Proof of Completion */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Award size={18} className="text-slate-400" />
              <h4 className="font-bold text-slate-700 uppercase text-xs tracking-wider">Preuve de Terminer</h4>
            </div>
            {task.completionProof ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-emerald-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-emerald-800 font-medium">Tâche complétée</p>
                    <p className="text-sm text-emerald-700 mt-1">{task.completionProof}</p>
                    {task.completedAt && (
                      <p className="text-xs text-emerald-500 mt-2">
                        Complété le {new Date(task.completedAt).toLocaleDateString("fr-FR")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-100 border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center">
                <Award size={24} className="text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Pas encore de preuve de complétion</p>
              </div>
            )}
          </div>
        </div>

        <div className="px-8 py-5 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 rounded-xl text-slate-600 font-semibold bg-white border border-slate-200 hover:bg-slate-100 transition-all"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 4. TASK CARD COMPONENT ---

const TaskCard = ({ task, index, onView, onEdit, onDelete }) => {
  const getProgressState = () => {
    if (task.completionProof) return "completed";
    if (task.employeeResponse) return "responded";
    if (task.seenByEmployee) return "seen";
    return "unseen";
  };

  const state = getProgressState();

  const stateConfig = {
    unseen: {
      bg: "bg-amber-50 border-amber-200",
      badge: "bg-amber-100 text-amber-700 border-amber-300",
      badgeText: "Non vu",
      icon: EyeOff,
      iconColor: "text-amber-500",
      pulse: true,
    },
    seen: {
      bg: "bg-blue-50 border-blue-200",
      badge: "bg-blue-100 text-blue-700 border-blue-300",
      badgeText: "Vu",
      icon: Eye,
      iconColor: "text-blue-500",
      pulse: false,
    },
    responded: {
      bg: "bg-indigo-50 border-indigo-200",
      badge: "bg-indigo-100 text-indigo-700 border-indigo-300",
      badgeText: "Répondu",
      icon: MessageSquare,
      iconColor: "text-indigo-500",
      pulse: false,
    },
    completed: {
      bg: "bg-emerald-50 border-emerald-200",
      badge: "bg-emerald-100 text-emerald-700 border-emerald-300",
      badgeText: "Terminé",
      icon: CheckCircle,
      iconColor: "text-emerald-500",
      pulse: false,
    },
  };

  const config = stateConfig[state];
  const StateIcon = config.icon;

  return (
    <div
      className={`group relative rounded-2xl border-2 p-5 transition-all duration-300 hover:shadow-lg cursor-pointer ${config.bg}`}
      onClick={() => onView(task)}
    >
      {/* Pulse indicator for unseen */}
      {config.pulse && (
        <div className="absolute -top-1 -right-1 w-4 h-4">
          <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 animate-ping"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* Employee Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-700 font-bold text-lg shadow-sm border border-slate-200">
              {task.employeeName?.charAt(0)}
            </div>
            <div
              className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center bg-white shadow-sm ${config.iconColor}`}
            >
              <StateIcon size={14} />
            </div>
          </div>

          {/* Task Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-slate-800 truncate">{task.employeeName}</h3>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${config.badge}`}
              >
                {config.badgeText}
              </span>
            </div>
            <p className="text-sm text-slate-600 line-clamp-2 mb-2">{task.description}</p>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {new Date(task.startDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {task.days} jour(s)
              </span>
              {task.priority && (
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                  task.priority === 'high' ? 'bg-red-50 text-red-600 border-red-100' :
                  task.priority === 'low' ? 'bg-slate-100 text-slate-500 border-slate-200' :
                  'bg-blue-50 text-blue-600 border-blue-100'
                }`}>
                  {task.priority === 'high' ? 'Haute' : task.priority === 'low' ? 'Basse' : 'Normale'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task);
            }}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition"
          >
            <Trash2 size={16} />
          </button>
          <ChevronRight size={18} className="text-slate-400 ml-1" />
        </div>
      </div>

      {/* Progress indicators */}
      {(task.employeeResponse || task.completionProof) && (
        <div className="mt-4 pt-4 border-t border-slate-200/50 flex items-center gap-4">
          {task.employeeResponse && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <MessageSquare size={14} className="text-indigo-400" />
              <span className="truncate max-w-[150px]">{task.employeeResponse}</span>
            </div>
          )}
          {task.completionProof && (
            <div className="flex items-center gap-2 text-xs text-emerald-600">
              <Award size={14} />
              <span>Preuve ajoutée</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- 5. MAIN PAGE COMPONENT ---

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Mock data with new fields
    const mockTasks = [
      {
        id: 1,
        employeeName: "Mohamed Amine",
        employeeId: "1",
        description: "Préparer le rapport mensuel des ventes et l'envoyer à la direction",
        startDate: "2024-01-15",
        days: 3,
        priority: "high",
        seenByEmployee: true,
        seenAt: "2024-01-15T09:30:00",
        employeeResponse: "J'ai commencé à travailler sur le rapport. Je le terminerai avant la date limite.",
        responseAt: "2024-01-15T10:00:00",
        completionProof: "Rapport envoyé par email à direction@company.com le 17/01/2024",
        completedAt: "2024-01-17T16:00:00",
      },
      {
        id: 2,
        employeeName: "Sara Benali",
        employeeId: "2",
        description: "Mettre à jour la base de données clients avec les nouvelles informations",
        startDate: "2024-01-18",
        days: 2,
        priority: "normal",
        seenByEmployee: true,
        seenAt: "2024-01-18T08:15:00",
        employeeResponse: "Bien reçu, je m'en occupe immédiatement.",
        responseAt: "2024-01-18T08:30:00",
        completionProof: null,
        completedAt: null,
      },
      {
        id: 3,
        employeeName: "Karim Zaki",
        employeeId: "3",
        description: "Organiser la réunion d'équipe pour le projet Alpha",
        startDate: "2024-01-20",
        days: 1,
        priority: "low",
        seenByEmployee: true,
        seenAt: "2024-01-20T11:00:00",
        employeeResponse: null,
        responseAt: null,
        completionProof: null,
        completedAt: null,
      },
      {
        id: 4,
        employeeName: "Fatima Alaoui",
        employeeId: "4",
        description: "Réviser les contrats fournisseurs avant signature",
        startDate: "2024-01-22",
        days: 5,
        priority: "high",
        seenByEmployee: false,
        seenAt: null,
        employeeResponse: null,
        responseAt: null,
        completionProof: null,
        completedAt: null,
      },
      {
        id: 5,
        employeeName: "Youssef El Amrani",
        employeeId: "5",
        description: "Former les nouveaux employés sur le système CRM",
        startDate: "2024-01-25",
        days: 2,
        priority: "normal",
        seenByEmployee: false,
        seenAt: null,
        employeeResponse: null,
        responseAt: null,
        completionProof: null,
        completedAt: null,
      },
    ];

    const mockEmployees = [
      { id: "1", name: "Mohamed Amine" },
      { id: "2", name: "Sara Benali" },
      { id: "3", name: "Karim Zaki" },
      { id: "4", name: "Fatima Alaoui" },
      { id: "5", name: "Youssef El Amrani" },
    ];

    setTasks(mockTasks);
    setEmployees(mockEmployees);
  };

  const handleSaveTask = async (taskData) => {
    const newTask = {
      id: Date.now(),
      ...taskData,
      seenByEmployee: false,
      seenAt: null,
      employeeResponse: null,
      responseAt: null,
      completionProof: null,
      completedAt: null,
    };
    setTasks([newTask, ...tasks]);
    setIsModalOpen(false);
    setToast({ message: "Tâche attribuée avec succès !", type: "success" });
  };

  const getTaskState = (task) => {
    if (task.completionProof) return "completed";
    if (task.employeeResponse) return "responded";
    if (task.seenByEmployee) return "seen";
    return "unseen";
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterState === "all") return matchesSearch;
    return matchesSearch && getTaskState(task) === filterState;
  });

  const stats = {
    total: tasks.length,
    unseen: tasks.filter((t) => !t.seenByEmployee).length,
    seen: tasks.filter((t) => t.seenByEmployee && !t.employeeResponse).length,
    responded: tasks.filter((t) => t.employeeResponse && !t.completionProof).length,
    completed: tasks.filter((t) => t.completionProof).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8 font-sans text-slate-800">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Gestion des Tâches</h1>
            <p className="text-slate-500 mt-2 font-medium">Suivez et attribuez les tâches à votre équipe</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 font-semibold"
          >
            <Plus size={20} /> Nouvelle tâche
          </button>
        </div>



        {/* Search */}
        <div className="mt-6 relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher une tâche ou un employé..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Task Grid */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-16 text-center">
          <FileText size={48} className="text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-400">Aucune tâche trouvée</h3>
          <p className="text-sm text-slate-400 mt-1">Ajoutez une nouvelle tâche pour commencer</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredTasks.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              index={index}
              onView={(t) => setSelectedTask(t)}
              onEdit={(t) => console.log("Edit", t)}
              onDelete={(t) => {
                setTasks(tasks.filter((task) => task.id !== t.id));
                setToast({ message: "Tâche supprimée", type: "success" });
              }}
            />
          ))}
        </div>
      )}

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employees={employees}
        onSave={handleSaveTask}
      />

      <TaskDetailModal isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} task={selectedTask} />
    </div>
  );
};

export default TaskManager;
