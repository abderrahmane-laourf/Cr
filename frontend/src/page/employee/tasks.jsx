import React, { useState } from 'react';
import { 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  PlayCircle,
  MessageSquare,
  Check,
  Layout,
  AlertCircle,
  X,
  UploadCloud,
  FileText,
  Image as ImageIcon
} from 'lucide-react';

// --- DONNÉES DE DÉMONSTRATION ---
const DEMO_DATA = [
  {
    id: 101,
    title: "Urgent : Rappeler Client #4059",
    description: "Le client a demandé un changement d'adresse de dernière minute. Merci de valider avant expédition.",
    status: "En attente", 
    dateCreated: new Date().toISOString(),
    proof: null // Nouveau champ pour stocker la preuve
  },
  {
    id: 102,
    title: "Inventaire Zone B",
    description: "Veuillez compter les cartons restants dans la zone B.",
    status: "En attente",
    dateCreated: new Date(Date.now() - 86400000).toISOString(),
    proof: null
  },
  {
    id: 103,
    title: "Préparation Commande #9988",
    description: "Colis fragile, ajouter double protection bulles.",
    status: "En cours",
    dateCreated: new Date().toISOString(),
    proof: null
  },
  {
    id: 104,
    title: "Réunion d'équipe matin",
    description: "Briefing sur les objectifs de la semaine.",
    status: "Terminé",
    dateCreated: new Date(Date.now() - 172800000).toISOString(),
    proof: "Présence confirmée et notes prises."
  }
];

// --- COMPOSANT MODALE DE PREUVE (NOUVEAU) ---
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* En-tête Modale */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Valider la mission</h3>
            <p className="text-xs text-slate-500 truncate max-w-[250px]">{taskTitle}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Corps Modale */}
        <div className="p-6 space-y-4">
          
          {/* Zone de texte */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
              Rapport / Note <span className="text-red-400">*</span>
            </label>
            <textarea 
              value={proofText}
              onChange={(e) => setProofText(e.target.value)}
              placeholder="Expliquez brièvement comment la tâche a été réalisée..."
              className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none resize-none transition-all placeholder:text-slate-400 text-slate-700"
            />
          </div>

          {/* Zone Fichier (Simulation) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
              Pièce jointe (Photo, PDF)
            </label>
            <div 
              onClick={() => setFileAttached(!fileAttached)}
              className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group
                ${fileAttached ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'}`}
            >
              {fileAttached ? (
                <div className="flex items-center gap-3 text-emerald-600">
                  <CheckCircle2 size={24} />
                  <span className="font-medium text-sm">Fichier "photo_preuve.jpg" ajouté</span>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 bg-slate-100 group-hover:bg-blue-100 rounded-full flex items-center justify-center mb-2 transition-colors">
                    <UploadCloud size={20} className="text-slate-400 group-hover:text-blue-500" />
                  </div>
                  <p className="text-sm text-slate-500 font-medium">Cliquez pour ajouter une preuve</p>
                  <p className="text-xs text-slate-400 mt-1">JPG, PNG ou PDF</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Pied Modale */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 text-slate-500 font-bold text-sm hover:bg-slate-200 rounded-xl transition-colors"
          >
            Annuler
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!proofText.trim()}
            className="px-6 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <CheckCircle2 size={18} />
            Confirmer la fin
          </button>
        </div>
      </div>
    </div>
  );
};

// --- PAGE PRINCIPALE ---
export default function EmployeeTaskPage() {
  const [tasks, setTasks] = useState(DEMO_DATA);
  const [activeTab, setActiveTab] = useState('new');
  
  // États pour la modale
  const [isProofModalOpen, setProofModalOpen] = useState(false);
  const [selectedTaskForProof, setSelectedTaskForProof] = useState(null);

  // 1. Ouvrir la modale quand on clique sur "Terminer"
  const initiateFinishTask = (task) => {
    setSelectedTaskForProof(task);
    setProofModalOpen(true);
  };

  // 2. Valider la tâche avec la preuve
  const handleConfirmProof = (proofText, hasFile) => {
    const finalProof = hasFile 
      ? `${proofText} (Pièce jointe incluse)` 
      : proofText;

    setTasks(prevTasks => prevTasks.map(task => {
      if (task.id === selectedTaskForProof.id) {
        return { 
          ...task, 
          status: 'Terminé', 
          proof: finalProof,
          dateFinished: new Date().toISOString()
        };
      }
      return task;
    }));
    
    setProofModalOpen(false);
    setSelectedTaskForProof(null);
    setActiveTab('done'); // Rediriger vers l'onglet terminé
  };

  const handleTaskAction = (taskId, action) => {
    setTasks(prevTasks => prevTasks.map(task => {
      if (task.id === taskId) {
        if (action === 'accept') {
          setActiveTab('todo');
          return { ...task, status: 'En cours' };
        }
      }
      return task;
    }));
  };

  const newTasks = tasks.filter(t => t.status === 'En attente');
  const inProgressTasks = tasks.filter(t => t.status === 'En cours');
  const doneTasks = tasks.filter(t => t.status === 'Terminé');

  const stats = [
    { label: 'À accepter', count: newTasks.length, color: 'text-amber-600', bg: 'bg-amber-100', icon: MessageSquare },
    { label: 'En cours', count: inProgressTasks.length, color: 'text-blue-600', bg: 'bg-blue-100', icon: PlayCircle },
    { label: 'Terminées', count: doneTasks.length, color: 'text-emerald-600', bg: 'bg-emerald-100', icon: CheckCircle2 },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 font-sans">
      
      {/* MODALE */}
      <ProofModal 
        isOpen={isProofModalOpen}
        onClose={() => setProofModalOpen(false)}
        onSubmit={handleConfirmProof}
        taskTitle={selectedTaskForProof?.title}
      />

      {/* HEADER & STATS */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Mes Missions</h1>
        <p className="text-slate-500 mb-6">Gérez les demandes assignées par l'administration.</p>
        
        <div className="grid grid-cols-3 gap-3 md:gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                <p className="text-xl md:text-3xl font-bold text-slate-800 mt-1">{stat.count}</p>
              </div>
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center ${stat.bg} ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ONGLETS */}
      <div className="bg-slate-100 p-1 rounded-xl inline-flex w-full md:w-auto overflow-x-auto">
        <button
          onClick={() => setActiveTab('new')}
          className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 flex items-center gap-2 justify-center whitespace-nowrap ${
            activeTab === 'new' ? 'bg-white text-slate-800 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <div className="relative">
            <MessageSquare size={16} />
            {newTasks.length > 0 && <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />}
          </div>
          Demandes ({newTasks.length})
        </button>
        <button
          onClick={() => setActiveTab('todo')}
          className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 flex items-center gap-2 justify-center whitespace-nowrap ${
            activeTab === 'todo' ? 'bg-white text-slate-800 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <PlayCircle size={16} />
          En cours
        </button>
        <button
          onClick={() => setActiveTab('done')}
          className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 flex items-center gap-2 justify-center whitespace-nowrap ${
            activeTab === 'done' ? 'bg-white text-slate-800 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <CheckCircle2 size={16} />
          Terminées
        </button>
      </div>

      {/* CONTENU */}
      <div className="min-h-[300px]">
        
        {/* ONGLET 1 : DEMANDES */}
        {activeTab === 'new' && (
          <div className="space-y-4 animate-in slide-in-from-left-4 duration-300">
            {newTasks.length === 0 ? (
               <EmptyState message="Tout est calme. Aucune nouvelle demande." />
            ) : (
              newTasks.map(task => (
                <div key={task.id} className="relative bg-white rounded-2xl p-0 border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
                  <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-amber-500"></div>
                  <div className="p-6 pl-8">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                          <AlertCircle size={24} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-800">{task.title}</h3>
                          <p className="text-sm text-slate-400 mt-1">
                            Reçu le {new Date(task.dateCreated).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full uppercase tracking-wider">
                        Action requise
                      </span>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-xl text-slate-600 text-sm leading-relaxed border border-slate-100 mb-6">
                      "{task.description}"
                    </div>

                    <div className="flex justify-end border-t border-slate-50 pt-4">
                      <button 
                        onClick={() => handleTaskAction(task.id, 'accept')}
                        className="w-full md:w-auto px-8 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <Check size={18} />
                        Accepter la mission
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ONGLET 2 : EN COURS (MODIFIÉ POUR LA PREUVE) */}
        {activeTab === 'todo' && (
          <div className="grid md:grid-cols-2 gap-4 animate-in slide-in-from-right-4 duration-300">
            {inProgressTasks.length === 0 ? (
               <div className="col-span-2"><EmptyState message="Aucune tâche en cours." icon={ClipboardList} /></div>
            ) : (
              inProgressTasks.map(task => (
                <div key={task.id} className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm flex flex-col h-full relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Clock size={100} className="text-blue-600" />
                  </div>

                  <div className="relative z-10 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[11px] font-bold uppercase tracking-wider">
                        En cours
                      </span>
                      <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                    
                    <h3 className="font-bold text-slate-800 text-lg mb-2">{task.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-6">
                      {task.description}
                    </p>
                  </div>

                  {/* Bouton modifié pour ouvrir la modale */}
                  <button 
                    onClick={() => initiateFinishTask(task)}
                    className="relative z-10 w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={18} />
                    Terminer la tâche
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* ONGLET 3 : TERMINÉES */}
        {activeTab === 'done' && (
          <div className="space-y-3 animate-in fade-in duration-500">
            {doneTasks.length === 0 ? (
               <EmptyState message="Historique vide." />
            ) : (
              doneTasks.map(task => (
                <div key={task.id} className="bg-white/60 p-5 rounded-xl border border-slate-100 flex flex-col gap-3 group hover:bg-white transition-colors">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                         <Check size={20} />
                       </div>
                       <div>
                         <h4 className="font-bold text-slate-700 line-through decoration-slate-300 decoration-2">{task.title}</h4>
                         <p className="text-xs text-slate-400">Clôturé le {new Date().toLocaleDateString()}</p>
                       </div>
                     </div>
                   </div>

                   {/* Affichage de la preuve si existante */}
                   {task.proof && (
                     <div className="ml-14 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100/50 flex items-start gap-2">
                        <FileText size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                        <p className="text-sm text-emerald-800 italic">
                          "{task.proof}"
                        </p>
                     </div>
                   )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ message, icon: Icon = Layout }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-300" />
      </div>
      <p className="text-slate-500 font-medium max-w-xs">{message}</p>
    </div>
  );
}