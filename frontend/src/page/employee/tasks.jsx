import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, Clock, AlertCircle, ChevronRight, Search, 
  Filter, Eye, MessageSquare, Award, Calendar, X, Send
} from 'lucide-react';

const EmployeeTaskPage = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [activeTab, setActiveTab] = useState('todo'); // todo, completed
  const [searchTerm, setSearchTerm] = useState('');
  
  // Simulation of logged-in employee (e.g., Mohamed Amine with ID 1)
  const CURRENT_EMPLOYEE_ID = "1";

  useEffect(() => {
    // Mock data - In a real app, fetch from API filtering by employeeId
    const mockTasks = [
      {
        id: 1,
        employeeId: "1",
        title: "Rapport Mensuel",
        description: "Préparer le rapport mensuel des ventes et l'envoyer à la direction",
        startDate: "2024-01-15",
        days: 3,
        priority: "high",
        seenByEmployee: false,
        seenAt: null,
        employeeResponse: null,
        completionProof: null,
        completedAt: null,
        status: "pending"
      },
      {
        id: 3,
        employeeId: "1",
        title: "Réunion Projet Alpha",
        description: "Organiser la réunion d'équipe pour le projet Alpha avec les départements concernés.",
        startDate: "2024-01-20",
        days: 1,
        priority: "normal",
        seenByEmployee: true,
        seenAt: "2024-01-20T09:00:00",
        employeeResponse: "Salle de réunion réservée pour 14h.",
        completionProof: null,
        completedAt: null,
        status: "in_progress"
      },
      {
        id: 99,
        employeeId: "1",
        title: "Inventaire Stock",
        description: "Faire l'inventaire complet du stock matière première.",
        startDate: "2024-01-10",
        days: 2,
        priority: "high",
        seenByEmployee: true,
        seenAt: "2024-01-10T08:00:00",
        employeeResponse: "Inventaire terminé.",
        completionProof: "Fichier Excel envoyé par mail.",
        completedAt: "2024-01-12T16:00:00",
        status: "completed"
      }
    ];

    setTasks(mockTasks);
  }, []);

  const handleViewTask = (task) => {
    // Mark as seen if not already seen
    if (!task.seenByEmployee) {
      const updatedTasks = tasks.map(t => 
        t.id === task.id 
          ? { ...t, seenByEmployee: true, seenAt: new Date().toISOString() } 
          : t
      );
      setTasks(updatedTasks);
      
      // Update the selected task to reflect the change immediately in the modal
      setSelectedTask({ ...task, seenByEmployee: true, seenAt: new Date().toISOString() });
    } else {
      setSelectedTask(task);
    }
  };

  const handleTaskUpdate = (taskId, updates) => {
    const updatedTasks = tasks.map(t => 
      t.id === taskId ? { ...t, ...updates } : t
    );
    setTasks(updatedTasks);
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask({ ...selectedTask, ...updates });
    }
  };

  const submitResponse = (response) => {
    if (!selectedTask) return;
    handleTaskUpdate(selectedTask.id, {
      employeeResponse: response,
      responseAt: new Date().toISOString(),
      status: "in_progress"
    });
  };

  const submitCompletion = (proof) => {
    if (!selectedTask) return;
    handleTaskUpdate(selectedTask.id, {
      completionProof: proof,
      completedAt: new Date().toISOString(),
      status: "completed"
    });
  };

  // Filter tasks based on active tab
  const filteredTasks = tasks.filter(task => {
    if (activeTab === 'todo') {
      return task.status !== 'completed';
    } else {
      return task.status === 'completed';
    }
  }).filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    task.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Mes Tâches</h1>
        <p className="text-slate-500 mt-2">Gérez vos tâches assignées, répondez et confirmez leur réalisation.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">
              {tasks.filter(t => t.status !== 'completed').length}
            </p>
            <p className="text-sm font-medium text-slate-500">En attente</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">
              {tasks.filter(t => t.status === 'completed').length}
            </p>
            <p className="text-sm font-medium text-slate-500">Terminées</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">
              {tasks.filter(t => !t.seenByEmployee).length}
            </p>
            <p className="text-sm font-medium text-slate-500">Non lues</p>
          </div>
        </div>
      </div>

      {/* Task List Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Tabs & Search */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-4 bg-slate-50/50">
          <div className="flex bg-slate-200/50 p-1 rounded-xl self-start">
            <button
              onClick={() => setActiveTab('todo')}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'todo' 
                  ? 'bg-white text-slate-800 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              À Faire
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'completed' 
                  ? 'bg-white text-slate-800 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Terminées
            </button>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* List */}
        <div className="divide-y divide-slate-100">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <p>Aucune tâche trouvée</p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <div 
                key={task.id} 
                onClick={() => handleViewTask(task)}
                className={`p-5 hover:bg-slate-50 transition-colors cursor-pointer group flex items-start justify-between gap-4 ${!task.seenByEmployee ? 'bg-blue-50/30' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`mt-1 w-3 h-3 rounded-full flex-shrink-0 ${
                    !task.seenByEmployee 
                      ? 'bg-blue-500 animate-pulse' 
                      : task.status === 'completed' 
                        ? 'bg-emerald-500' 
                        : 'bg-slate-300'
                  }`} />
                  
                  <div>
                    <h3 className={`font-semibold text-slate-800 group-hover:text-blue-600 transition-colors ${task.status === 'completed' ? 'line-through opacity-70' : ''}`}>
                      {task.title || "Tâche sans titre"}
                    </h3>
                    <p className={`text-sm text-slate-600 mt-1 line-clamp-2 ${task.status === 'completed' ? 'opacity-70' : ''}`}>
                      {task.description}
                    </p>
                    
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded-md">
                        <Calendar size={12} />
                        {new Date(task.startDate).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded-md">
                        <Clock size={12} />
                        {task.days} jour(s)
                      </div>
                      
                      {task.priority && (
                        <span className={`text-xs font-bold px-2 py-1 rounded-md bg-opacity-10 border ${
                          task.priority === 'high' ? 'text-red-600 bg-red-50 border-red-200' :
                          task.priority === 'low' ? 'text-slate-500 bg-slate-100 border-slate-200' :
                          'text-blue-600 bg-blue-50 border-blue-200'
                        }`}>
                          {task.priority === 'high' ? 'Urgent' : task.priority === 'low' ? 'Basse' : 'Normale'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="self-center">
                  <ChevronRight className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
          onSubmitResponse={submitResponse}
          onSubmitCompletion={submitCompletion}
        />
      )}
    </div>
  );
};

// --- Task Detail Modal Simulation ---
const TaskDetailModal = ({ task, onClose, onSubmitResponse, onSubmitCompletion }) => {
  const [response, setResponse] = useState('');
  const [proof, setProof] = useState('');
  const [view, setView] = useState('details'); // details, reply, complete

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{task.title}</h2>
            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">
                {task.status === 'completed' ? 'TERMINÉ' : 'EN COURS'}
              </span>
              <span>•</span>
              <span>{task.days} jours alloués</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <X size={24} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Main Description */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h3>
            <p className="text-slate-700 leading-relaxed">{task.description}</p>
          </div>

          {/* Timeline / History */}
          <div className="space-y-4">
            {/* Seen Status */}
            {task.seenByEmployee && (
              <div className="flex gap-3">
                <div className="mt-1">
                  <Eye size={18} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Vu</p>
                  <p className="text-xs text-slate-400">
                    {new Date(task.seenAt).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
            )}

            {/* Existing Response */}
            {task.employeeResponse && (
              <div className="flex gap-3">
                <div className="mt-1">
                  <MessageSquare size={18} className="text-indigo-400" />
                </div>
                <div className="bg-indigo-50 p-3 rounded-lg rounded-tl-none border border-indigo-100 w-full">
                  <p className="text-sm text-indigo-900 font-medium">Votre réponse</p>
                  <p className="text-sm text-indigo-700 mt-1">{task.employeeResponse}</p>
                </div>
              </div>
            )}

            {/* Completion Proof */}
            {task.completionProof && (
              <div className="flex gap-3">
                <div className="mt-1">
                  <Award size={18} className="text-emerald-500" />
                </div>
                <div className="bg-emerald-50 p-3 rounded-lg rounded-tl-none border border-emerald-100 w-full">
                  <p className="text-sm text-emerald-900 font-medium">Tâche complétée</p>
                  <p className="text-sm text-emerald-700 mt-1">{task.completionProof}</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Forms */}
          {task.status !== 'completed' && (
            <div className="border-t border-slate-100 pt-6 mt-6">
              {view === 'details' && (
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setView('reply')}
                    className="flex justify-center items-center gap-2 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold transition-all"
                  >
                    <MessageSquare size={18} />
                    Répondre
                  </button>
                  <button 
                    onClick={() => setView('complete')}
                    className="flex justify-center items-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/20 transition-all"
                  >
                    <CheckCircle size={18} />
                    Terminer la tâche
                  </button>
                </div>
              )}

              {view === 'reply' && (
                <div className="animate-in slide-in-from-bottom-5 duration-200">
                  <h3 className="font-bold text-slate-800 mb-3">Envoyer une réponse</h3>
                  <textarea
                    placeholder="Écrivez votre message ici..."
                    className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none resize-none h-32"
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                  />
                  <div className="flex justify-end gap-3 mt-3">
                    <button onClick={() => setView('details')} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg">Annuler</button>
                    <button 
                      onClick={() => { onSubmitResponse(response); setView('details'); }}
                      disabled={!response.trim()}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Envoyer
                    </button>
                  </div>
                </div>
              )}

              {view === 'complete' && (
                <div className="animate-in slide-in-from-bottom-5 duration-200">
                  <h3 className="font-bold text-slate-800 mb-3">Confirmer la réalisation</h3>
                  <div className="bg-blue-50 p-4 rounded-xl mb-4 text-blue-800 text-sm">
                    Veuillez fournir une preuve ou un commentaire final confirmant que la tâche a été exécutée correctement.
                  </div>
                  <textarea
                    placeholder="Ex: Rapport envoyé, Client appelé, Stock vérifié..."
                    className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none h-32"
                    value={proof}
                    onChange={(e) => setProof(e.target.value)}
                  />
                  <div className="flex justify-end gap-3 mt-3">
                    <button onClick={() => setView('details')} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg">Annuler</button>
                    <button 
                      onClick={() => { onSubmitCompletion(proof); onClose(); }}
                      disabled={!proof.trim()}
                      className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <CheckCircle size={18} />
                      Marquer comme terminé
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeTaskPage;
