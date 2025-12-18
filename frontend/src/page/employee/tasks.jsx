import React, { useState } from 'react';
import { 
  ClipboardList, CheckCircle2, Clock, PlayCircle, MessageSquare, Check,
  Layout, AlertCircle, X, UploadCloud, FileText, Image as ImageIcon
} from 'lucide-react';
import SpotlightCard from '../../util/SpotlightCard';

// ============================================================================
// UI COMPONENTS
// ============================================================================

const ProofModal = ({ isOpen, onClose, onSubmit, taskTitle }) => {
  const [proofText, setProofText] = useState("");
  const [fileAttached, setFileAttached] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!proofText.trim()) return;
    onSubmit(proofText, fileAttached);
    setProofText("");
    setFileAttached(false);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Valider la mission</h3>
            <p className="text-xs text-slate-500 truncate max-w-[250px] mt-0.5">{taskTitle}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
              Rapport / Note <span className="text-red-400">*</span>
            </label>
            <textarea 
              value={proofText}
              onChange={(e) => setProofText(e.target.value)}
              placeholder="Expliquez brièvement comment la tâche a été réalisée..."
              className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] outline-none resize-none transition-all placeholder:text-slate-400 text-slate-700 font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
              Pièce jointe (Photo, PDF)
            </label>
            <div 
              onClick={() => setFileAttached(!fileAttached)}
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group
                ${fileAttached ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 hover:border-[#2563EB] hover:bg-slate-50'}`}
            >
              {fileAttached ? (
                <div className="flex items-center gap-3 text-emerald-700">
                  <CheckCircle2 size={24} className="text-emerald-500" />
                  <span className="font-bold text-sm">Fichier ajouté avec succès</span>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 bg-slate-100 group-hover:bg-[#2563EB]/10 rounded-full flex items-center justify-center mb-3 transition-colors">
                    <UploadCloud size={24} className="text-slate-400 group-hover:text-[#2563EB]" />
                  </div>
                  <p className="text-sm text-slate-600 font-bold">Cliquez pour ajouter une preuve</p>
                  <p className="text-xs text-slate-400 mt-1 font-medium">JPG, PNG ou PDF</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 text-slate-600 font-bold text-sm hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all"
          >
            Annuler
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!proofText.trim()}
            className="px-6 py-2.5 bg-[#2563EB] text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-900/20 hover:bg-[#1e40af] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <CheckCircle2 size={18} />
            Confirmer la fin
          </button>
        </div>
      </div>
    </div>
  );
};

// --- DATA ---
const DEMO_DATA = [
  { id: 101, title: "Urgent : Rappeler Client #4059", description: "Le client a demandé un changement d'adresse de dernière minute.", status: "En attente", dateCreated: new Date().toISOString(), proof: null },
  { id: 102, title: "Inventaire Zone B", description: "Veuillez compter les cartons restants dans la zone B.", status: "En attente", dateCreated: new Date(Date.now() - 86400000).toISOString(), proof: null },
  { id: 103, title: "Préparation Commande #9988", description: "Colis fragile, ajouter double protection bulles.", status: "En cours", dateCreated: new Date().toISOString(), proof: null },
  { id: 104, title: "Réunion d'équipe matin", description: "Briefing sur les objectifs de la semaine.", status: "Terminé", dateCreated: new Date(Date.now() - 172800000).toISOString(), proof: "Présence confirmée et notes prises." }
];

export default function EmployeeTaskPage() {
  const [tasks, setTasks] = useState(DEMO_DATA);
  const [activeTab, setActiveTab] = useState('new');
  const [isProofModalOpen, setProofModalOpen] = useState(false);
  const [selectedTaskForProof, setSelectedTaskForProof] = useState(null);

  const initiateFinishTask = (task) => {
    setSelectedTaskForProof(task);
    setProofModalOpen(true);
  };

  const handleConfirmProof = (proofText, hasFile) => {
    const finalProof = hasFile ? `${proofText} (Pièce jointe incluse)` : proofText;
    setTasks(prev => prev.map(t => t.id === selectedTaskForProof.id ? { ...t, status: 'Terminé', proof: finalProof, dateFinished: new Date().toISOString() } : t));
    setProofModalOpen(false);
    setSelectedTaskForProof(null);
    setActiveTab('done');
  };

  const handleTaskAction = (taskId, action) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId && action === 'accept') {
        setActiveTab('todo');
        return { ...t, status: 'En cours' };
      }
      return t;
    }));
  };

  const newTasks = tasks.filter(t => t.status === 'En attente');
  const inProgressTasks = tasks.filter(t => t.status === 'En cours');
  const doneTasks = tasks.filter(t => t.status === 'Terminé');

  const stats = [
    { label: 'À accepter', count: newTasks.length, color: 'text-amber-600', bg: 'bg-amber-100', icon: MessageSquare },
    { label: 'En cours', count: inProgressTasks.length, color: 'text-[#2563EB]', bg: 'bg-[#2563EB]/10', icon: PlayCircle },
    { label: 'Terminées', count: doneTasks.length, color: 'text-emerald-600', bg: 'bg-emerald-100', icon: CheckCircle2 },
  ];

  return (
    <div className="w-full min-h-screen bg-transparent p-6 font-sans text-slate-800 animate-[fade-in_0.5s_ease-out] space-y-8">
      
      <ProofModal 
        isOpen={isProofModalOpen}
        onClose={() => setProofModalOpen(false)}
        onSubmit={handleConfirmProof}
        taskTitle={selectedTaskForProof?.title}
      />

      {/* HEADER */}
      <SpotlightCard theme="light" className="border-none shadow-sm w-full">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
            <div>
            <h1 className="text-3xl font-extrabold text-[#2563EB] flex items-center gap-3">
                <ClipboardList size={32} /> Mes Missions
            </h1>
            <p className="text-slate-500 mt-2 font-medium">Gérez les demandes assignées par l'administration.</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 w-full xl:w-auto">
            {stats.map((stat, index) => (
                <div key={index} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center min-w-[120px] text-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${stat.bg} ${stat.color}`}>
                        <stat.icon size={20} />
                    </div>
                    <p className="text-2xl font-black text-slate-800">{stat.count}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                </div>
            ))}
            </div>
        </div>
      </SpotlightCard>

      {/* TABS */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex w-full">
        {[
            { id: 'new', label: 'Nouvelles Demandes', icon: MessageSquare, count: newTasks.length },
            { id: 'todo', label: 'En Cours', icon: PlayCircle, count: inProgressTasks.length },
            { id: 'done', label: 'Terminées', icon: CheckCircle2, count: doneTasks.length }
        ].map(tab => (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 justify-center ${
                    activeTab === tab.id 
                    ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-900/20'  
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
            >
                <div className="relative">
                    <tab.icon size={18} />
                    {tab.count > 0 && activeTab !== tab.id && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                </div>
                {tab.label} <span className="opacity-60 ml-1">({tab.count})</span>
            </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="min-h-[300px] w-full">
        {/* NEW TASKS */}
        {activeTab === 'new' && (
          <div className="space-y-4 animate-[slide-in-from-left_0.4s_ease-out]">
            {newTasks.length === 0 ? <EmptyState message="Tout est calme. Aucune nouvelle demande." /> : newTasks.map(task => (
                <SpotlightCard theme="light" key={task.id} className="border-l-4 border-l-amber-500">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                          <AlertCircle size={24} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-800">{task.title}</h3>
                          <p className="text-sm text-slate-400 mt-1 font-medium">Reçu le {new Date(task.dateCreated).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full uppercase tracking-wider">Action requise</span>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-2xl text-slate-600 text-sm leading-relaxed border border-slate-200/60 mb-6 font-medium">"{task.description}"</div>
                    <div className="flex justify-end pt-2">
                      <button onClick={() => handleTaskAction(task.id, 'accept')} className="px-8 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2">
                        <Check size={18} /> Accepter la mission
                      </button>
                    </div>
                </SpotlightCard>
            ))}
          </div>
        )}

        {/* IN PROGRESS */}
        {activeTab === 'todo' && (
          <div className="grid md:grid-cols-2 gap-6 animate-[fade-in_0.4s_ease-out]">
            {inProgressTasks.length === 0 ? <div className="col-span-2"><EmptyState message="Aucune tâche en cours." icon={ClipboardList} /></div> : inProgressTasks.map(task => (
                <SpotlightCard theme="light" key={task.id} className="flex flex-col h-full border-l-4 border-l-[#2563EB]">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Clock size={120} className="text-[#2563EB]" /></div>
                  <div className="relative z-10 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 bg-[#2563EB]/10 text-[#2563EB] rounded-lg text-[10px] font-bold uppercase tracking-wider">En cours</span>
                      <div className="animate-pulse w-2.5 h-2.5 bg-[#2563EB] rounded-full shadow-[0_0_8px_#2563EB]"></div>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-3 leading-snug">{task.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-8 font-medium">{task.description}</p>
                  </div>
                  <button onClick={() => initiateFinishTask(task)} className="relative z-10 w-full py-3.5 bg-[#2563EB] text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 hover:bg-[#1e40af] active:scale-95 transition-all flex items-center justify-center gap-2">
                    <CheckCircle2 size={18} /> Terminer la tâche
                  </button>
                </SpotlightCard>
            ))}
          </div>
        )}

        {/* DONE */}
        {activeTab === 'done' && (
          <div className="space-y-4 animate-[fade-in_0.5s_ease-out]">
            {doneTasks.length === 0 ? <EmptyState message="Historique vide." /> : doneTasks.map(task => (
                <SpotlightCard theme="light" key={task.id} className="bg-white/80 hover:bg-white border-l-4 border-l-emerald-500">
                   <div className="flex items-start gap-4 mb-4">
                       <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0"><Check size={20} strokeWidth={3} /></div>
                       <div>
                         <h4 className="font-bold text-slate-700 text-lg decoration-slate-300 decoration-2">{task.title}</h4>
                         <p className="text-xs text-slate-400 font-bold uppercase tracking-wide mt-1">Clôturé le {new Date().toLocaleDateString()}</p>
                       </div>
                   </div>
                   {task.proof && (
                     <div className="ml-14 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50 flex items-start gap-3">
                        <FileText size={18} className="text-emerald-600 mt-0.5 shrink-0" />
                        <div>
                            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1 block">Rapport de mission</span>
                            <p className="text-sm text-emerald-900 font-medium italic">"{task.proof}"</p>
                        </div>
                     </div>
                   )}
                </SpotlightCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ message, icon: Icon = Layout }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-10 h-10 text-slate-300" />
      </div>
      <p className="text-slate-500 font-bold text-lg max-w-xs">{message}</p>
    </div>
  );
}