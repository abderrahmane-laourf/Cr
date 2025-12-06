import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ChevronRight,
  Filter,
  Calendar
} from 'lucide-react';
import { taskAPI } from '../../services/api';

export default function EmployeeTaskPage() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all'); // all, pending, done
  
  // Get current user to filter tasks
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const userRole = currentUser.role ? currentUser.role.toLowerCase() : '';

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      // In a real app we would use taskAPI.getAll({ assignedTo: currentUser.id })
      // For now we fetch all and filter client side as per typical demo constraints
      let allTasks = await taskAPI.getAll();
      
      // Filter tasks relevant to this employee
      // Logic: Matches ID, Name, or Role (e.g. assigned to 'confirmation' group)
      const myTasks = allTasks.filter(t => 
        t.assignedTo === currentUser.name || 
        t.assignedTo === currentUser.role ||
        (t.assignedTo === 'confirmation' && userRole === 'confirmation') ||
        (t.assignedTo === 'packaging' && userRole === 'packaging')
      );
      
      setTasks(myTasks);
    } catch (error) {
      console.error("Failed to load tasks", error);
    }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      // Optimistic update
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      
      await taskAPI.update(taskId, { status: newStatus });
    } catch (error) {
      console.error("Failed to update task", error);
      loadTasks(); // Revert on error
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'pending') return t.status !== 'Terminé';
    if (filter === 'done') return t.status === 'Terminé';
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Terminé': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'En cours': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="max-w-md mx-auto pb-20">
      
      {/* Mobile Header Card */}
      <div className="bg-[#1325ec] text-white p-6 rounded-3xl shadow-lg shadow-blue-500/30 mb-6 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-1">Mes Tâches</h1>
          <p className="text-blue-100 text-sm font-medium">
            {tasks.filter(t => t.status !== 'Terminé').length} tâches en attente
          </p>
        </div>
        
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 px-1">
        <button 
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
            filter === 'all' 
              ? 'bg-white text-[#1325ec] shadow-md ring-1 ring-[#1325ec]/10' 
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          Toutes
        </button>
        <button 
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
            filter === 'pending' 
              ? 'bg-white text-[#1325ec] shadow-md ring-1 ring-[#1325ec]/10' 
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          En cours
        </button>
        <button 
          onClick={() => setFilter('done')}
          className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
             filter === 'done' 
              ? 'bg-white text-[#1325ec] shadow-md ring-1 ring-[#1325ec]/10' 
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          Terminées
        </button>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => (
            <div 
              key={task.id}
              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm transition-all active:scale-[0.98]"
            >
              <div className="flex justify-between items-start mb-3">
                 <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(task.status)}`}>
                   {task.status}
                 </span>
                 <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                   <Calendar size={12} />
                   {new Date(task.startDate || task.dateCreated).toLocaleDateString('fr-FR')}
                 </span>
              </div>
              
              <h3 className="font-bold text-slate-800 mb-1">{task.title || task.description || 'Nouvelle Tâche'}</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                {task.description}
              </p>

              {/* Action Footer */}
              <div className="flex gap-2 pt-3 border-t border-slate-50">
                {task.status !== 'Terminé' ? (
                  <>
                    {task.status !== 'En cours' && (
                      <button 
                        onClick={() => handleStatusUpdate(task.id, 'En cours')}
                        className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 transition-colors"
                      >
                        Commencer
                      </button>
                    )}
                    <button 
                      onClick={() => handleStatusUpdate(task.id, 'Terminé')}
                      className="flex-1 py-2 bg-[#1325ec] text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 active:bg-blue-800 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={16} />
                      Terminer
                    </button>
                  </>
                ) : (
                   <div className="flex-1 py-2 text-center text-emerald-600 font-bold text-sm bg-emerald-50 rounded-xl">
                     Tâche complétée
                   </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 px-6">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-slate-900 font-bold mb-1">Aucune tâche</h3>
            <p className="text-slate-500 text-sm">Vous êtes à jour ! Profitez de votre journée.</p>
          </div>
        )}
      </div>

    </div>
  );
}
