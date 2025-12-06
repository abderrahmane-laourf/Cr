import React, { useState, useEffect } from 'react';
import { Plus, GripVertical, Edit2, X, Trash2 } from 'lucide-react';

const DELIVERY_STATUSES = [
  { id: 'pending', label: 'En attente', color: 'bg-yellow-500' },
  { id: 'confirmed', label: 'Confirmé', color: 'bg-purple-500' },
  { id: 'in_progress', label: 'En cours', color: 'bg-blue-500' },
  { id: 'packaging', label: 'Packaging', color: 'bg-orange-500' },
  { id: 'shipped', label: 'Expédié', color: 'bg-teal-500' },
  { id: 'out_for_delivery', label: 'En livraison', color: 'bg-indigo-500' },
  { id: 'delivered', label: 'Livré', color: 'bg-green-500' },
  { id: 'failed_delivery', label: 'Échec livraison', color: 'bg-orange-600' },
  { id: 'returned', label: 'Retourné', color: 'bg-purple-600' },
  { id: 'cancelled', label: 'Annulé', color: 'bg-red-500' },
  { id: 'refunded', label: 'Remboursé', color: 'bg-pink-500' }
];

const INITIAL_PIPELINES = [
  {
    id: 1,
    name: 'Pipeline Principal',
    color: 'bg-blue-600',
    stages: [
      { id: 1, name: 'Reporter', color: 'bg-slate-500', active: true, status: 'pending', locked: true },
      { id: 2, name: 'Confirmé', color: 'bg-purple-500', active: true, status: 'confirmed', locked: true },
      { id: 3, name: 'Packaging', color: 'bg-orange-500', active: true, status: 'packaging' },
      { id: 4, name: 'Out for Delivery', color: 'bg-blue-500', active: true, status: 'out_for_delivery' },
      { id: 5, name: 'Livré', color: 'bg-green-500', active: true, status: 'delivered' },
      { id: 6, name: 'Annulé', color: 'bg-red-500', active: true, status: 'cancelled' }
    ]
  }
];

export default function PipelineSettings() {
  // Load from localStorage or use initial
  const [pipelines, setPipelines] = useState(() => {
    const saved = localStorage.getItem('pipelines');
    return saved ? JSON.parse(saved) : INITIAL_PIPELINES;
  });
  
  const [showNewStageModal, setShowNewStageModal] = useState(false);
  const [showNewPipelineModal, setShowNewPipelineModal] = useState(false);
  const [newPipelineName, setNewPipelineName] = useState('');
  const [newPipelineColor, setNewPipelineColor] = useState('bg-blue-600');
  const [newStageName, setNewStageName] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [selectedColor, setSelectedColor] = useState('bg-blue-500');
  const [editingStage, setEditingStage] = useState(null);
  const [currentPipelineId, setCurrentPipelineId] = useState(null);
  const [draggedStage, setDraggedStage] = useState(null);
  const [draggedOverStage, setDraggedOverStage] = useState(null);

  const colors = [
    'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500',
    'bg-teal-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500'
  ];

  // Save to localStorage whenever pipelines change
  useEffect(() => {
    localStorage.setItem('pipelines', JSON.stringify(pipelines));
  }, [pipelines]);

  const handleAddPipeline = () => {
    if (!newPipelineName.trim()) return;

    const newPipeline = {
      id: Date.now(),
      name: newPipelineName,
      color: newPipelineColor,
      stages: []
    };

    setPipelines(prev => [...prev, newPipeline]);
    setNewPipelineName('');
    setNewPipelineColor('bg-blue-600');
    setShowNewPipelineModal(false);
  };

  const handleAddStage = () => {
    if (!newStageName.trim()) return;

    const newStage = {
      id: Date.now(),
      name: newStageName,
      color: selectedColor,
      active: true,
      status: selectedStatus
    };

    setPipelines(prev => prev.map(pipeline => 
      pipeline.id === currentPipelineId ? { ...pipeline, stages: [...pipeline.stages, newStage] } : pipeline
    ));

    setNewStageName('');
    setSelectedStatus('pending');
    setSelectedColor('bg-blue-500');
    setShowNewStageModal(false);
  };

  const handleToggleStage = (stageId) => {
    setPipelines(prev => prev.map(pipeline => ({
      ...pipeline,
      stages: pipeline.stages.map(stage =>
        stage.id === stageId ? { ...stage, active: !stage.active } : stage
      )
    })));
  };

  const handleDeleteStage = (stageId) => {
    setPipelines(prev => prev.map(pipeline => ({
      ...pipeline,
      stages: pipeline.stages.filter(stage => stage.id !== stageId)
    })));
  };

  const handleDeletePipeline = (pipelineId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce pipeline et toutes ses étapes ?')) {
      setPipelines(prev => prev.filter(p => p.id !== pipelineId));
    }
  };

  const handleEditStage = (stage) => {
    setEditingStage(stage);
    setNewStageName(stage.name);
    setSelectedColor(stage.color);
    setSelectedStatus(stage.status);
    setShowNewStageModal(true);
  };

  const handleUpdateStage = () => {
    if (!newStageName.trim() || !editingStage) return;

    setPipelines(prev => prev.map(pipeline => ({
      ...pipeline,
      stages: pipeline.stages.map(stage =>
        stage.id === editingStage.id
          ? { ...stage, name: newStageName, color: selectedColor, status: selectedStatus }
          : stage
      )
    })));

    setEditingStage(null);
    setNewStageName('');
    setSelectedStatus('pending');
    setSelectedColor('bg-blue-500');
    setShowNewStageModal(false);
  };

  const handleStageDragStart = (e, pipelineId, stage) => {
    setDraggedStage({ pipelineId, stage });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleStageDragOver = (e, pipelineId, targetStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverStage({ pipelineId, stage: targetStage });
  };

  const handleStageDrop = (e, pipelineId, targetStage) => {
    e.preventDefault();
    
    if (!draggedStage || draggedStage.pipelineId !== pipelineId) return;
    
    setPipelines(prev => prev.map(pipeline => {
      if (pipeline.id !== pipelineId) return pipeline;
      
      const stages = [...pipeline.stages];
      const draggedIndex = stages.findIndex(s => s.id === draggedStage.stage.id);
      const targetIndex = stages.findIndex(s => s.id === targetStage.id);
      
      if (draggedIndex === -1 || targetIndex === -1) return pipeline;
      
      // Reorder stages
      const [removed] = stages.splice(draggedIndex, 1);
      stages.splice(targetIndex, 0, removed);
      
      return { ...pipeline, stages };
    }));
    
    setDraggedStage(null);
    setDraggedOverStage(null);
  };

  const handleStageDragEnd = () => {
    setDraggedStage(null);
    setDraggedOverStage(null);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gestion Pipeline</h1>
              <p className="text-slate-500 mt-1 font-medium">Gérez les étapes de votre pipeline de vente</p>
            </div>
            <button 
              onClick={() => setShowNewPipelineModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 font-semibold">
              <Plus size={20} /> Nouveau Pipeline
            </button>
          </div>
        </div>

        {/* Pipelines List */}
        {pipelines.map((pipeline) => (
          <div key={pipeline.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
            {/* Pipeline Header */}
            <div className={`${pipeline.color} px-6 py-4 flex items-center gap-3`}>
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-bold shadow-sm text-slate-700">
                {pipeline.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-white font-semibold text-lg">{pipeline.name}</h2>
                <p className="text-white/80 text-sm">{pipeline.stages.length} étapes</p>
              </div>
              <button
                onClick={() => handleDeletePipeline(pipeline.id)}
                className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all backdrop-blur-sm"
                title="Supprimer le pipeline"
              >
                <Trash2 size={20} />
              </button>
            </div>

            {/* Stages List */}
            <div className="divide-y divide-slate-100">
              {pipeline.stages.map((stage, index) => (
                <div
                  key={stage.id}
                  draggable={!stage.locked}
                  onDragStart={(e) => handleStageDragStart(e, pipeline.id, stage)}
                  onDragOver={(e) => handleStageDragOver(e, pipeline.id, stage)}
                  onDrop={(e) => handleStageDrop(e, pipeline.id, stage)}
                  onDragEnd={handleStageDragEnd}
                  className={`flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors ${
                    !stage.active ? 'opacity-50' : ''
                  } ${
                    draggedOverStage?.stage?.id === stage.id ? 'border-t-2 border-blue-500' : ''
                  } ${
                    draggedStage?.stage?.id === stage.id ? 'opacity-50' : ''
                  }`}
                >
                  {/* Drag Handle */}
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-medium text-sm w-6">{index + 1}</span>
                    <button className={`text-slate-400 hover:text-slate-600 ${stage.locked ? 'cursor-not-allowed opacity-30' : 'cursor-move'}`}>
                      <GripVertical size={20} />
                    </button>
                  </div>

                  {/* Stage Icon */}
                  <div className={`w-10 h-10 ${stage.color} rounded-lg flex items-center justify-center shadow-sm`}>
                    <span className="text-white font-bold">{stage.name.charAt(0)}</span>
                  </div>

                  {/* Stage Info */}
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-800">{stage.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500">Pipeline stage</span>
                      <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                        {DELIVERY_STATUSES.find(s => s.id === stage.status)?.label}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    {/* Toggle Switch */}
                    <button
                      onClick={() => handleToggleStage(stage.id)}
                      disabled={stage.locked}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                        stage.locked ? 'opacity-50 cursor-not-allowed' : ''
                      } ${stage.active ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${
                        stage.active ? 'translate-x-5' : ''
                      }`} />
                    </button>

                    <span className={`text-xs font-medium ${stage.active ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {stage.active ? 'Active' : 'Inactive'}
                    </span>

                    {/* Edit & Delete */}
                    {!stage.locked && (
                      <>
                        <button
                          onClick={() => handleEditStage(stage)}
                          className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteStage(stage.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                    {stage.locked && (
                      <span className="text-xs text-slate-400 px-2">🔒 Protégé</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Stage Button */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => {
                  setEditingStage(null);
                  setCurrentPipelineId(pipeline.id);
                  setShowNewStageModal(true);
                }}
                className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all font-medium flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Ajouter Stage
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for New Pipeline */}
      {showNewPipelineModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-800">Nouveau Pipeline</h3>
              <button onClick={() => setShowNewPipelineModal(false)} className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition">
                <X size={20} />
              </button>
            </div>

            {/* Pipeline Name */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Nom du Pipeline</label>
              <input
                type="text"
                value={newPipelineName}
                onChange={(e) => setNewPipelineName(e.target.value)}
                placeholder="Ex: Pipeline de Vente"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
              />
            </div>

            {/* Color Picker */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Couleur</label>
              <div className="flex gap-2 flex-wrap">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewPipelineColor(color)}
                    className={`w-10 h-10 ${color} rounded-lg transition-transform hover:scale-110 ${
                      newPipelineColor === color ? 'ring-2 ring-offset-2 ring-slate-400' : ''
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowNewPipelineModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 border border-slate-200 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleAddPipeline}
                disabled={!newPipelineName.trim()}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for New/Edit Stage */}
      {showNewStageModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-800">
                {editingStage ? 'Modifier Stage' : 'Nouveau Stage'}
              </h3>
              <button onClick={() => setShowNewStageModal(false)} className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition">
                <X size={20} />
              </button>
            </div>

            {/* Stage Name */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Nom du Stage</label>
              <input
                type="text"
                value={newStageName}
                onChange={(e) => setNewStageName(e.target.value)}
                placeholder="Ex: Livraison en cours"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
              />
            </div>

            {/* Delivery Status */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Statut de Livraison</label>
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {DELIVERY_STATUSES.map((status) => (
                  <button
                    key={status.id}
                    onClick={() => setSelectedStatus(status.id)}
                    className={`px-3 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                      selectedStatus === status.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${status.color}`} />
                      {status.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowNewStageModal(false);
                  setEditingStage(null);
                  setNewStageName('');
                  setSelectedStatus('pending');
                  setSelectedColor('bg-blue-500');
                }}
                className="flex-1 px-4 py-2.5 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 border border-slate-200 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={editingStage ? handleUpdateStage : handleAddStage}
                disabled={!newStageName.trim()}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
              >
                {editingStage ? 'Mettre à jour' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}