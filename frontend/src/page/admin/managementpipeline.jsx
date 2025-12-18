import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, GripVertical, Edit2, X, Trash2, AlertTriangle, RotateCw } from 'lucide-react';
import Swal from 'sweetalert2';
import { pipelineAPI } from '../../services/api';

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
    name: 'Livraison Ammex',
    color: 'bg-blue-600',
    isDefault: true,
    stages: [
      { id: 'Reporter', name: 'Reporter', color: 'bg-amber-500', active: true, status: 'pending', locked: true },
      { id: 'Confirmé', name: 'Confirmé', color: 'bg-purple-500', active: true, status: 'confirmed', locked: true },
      { id: 'Packaging', name: 'Packaging', color: 'bg-orange-500', active: true, status: 'packaging', locked: true },
      { id: 'Out for Delivery', name: 'Out for Delivery', color: 'bg-blue-500', active: true, status: 'out_for_delivery', locked: true },
      { id: 'Livré', name: 'Livré', color: 'bg-green-500', active: true, status: 'delivered', locked: true },
      { id: 'Annulé', name: 'Annulé', color: 'bg-red-500', active: true, status: 'cancelled', locked: true }
    ]
  },
  {
    id: 2,
    name: 'Livreur Agadir',
    color: 'bg-emerald-600',
    isDefault: true,
    stages: [
      { id: 'Reporter-AG', name: 'Reporter', color: 'bg-amber-500', active: true, status: 'pending', locked: true },
      { id: 'Confirmé-AG', name: 'Confirmé', color: 'bg-purple-500', active: true, status: 'confirmed', locked: true },
      { id: 'Packaging-AG', name: 'Packaging', color: 'bg-orange-500', active: true, status: 'packaging', locked: true },
      { id: 'Out for Delivery-AG', name: 'Out for Delivery', color: 'bg-blue-500', active: true, status: 'out_for_delivery', locked: true },
      { id: 'Livré-AG', name: 'Livré', color: 'bg-green-500', active: true, status: 'delivered', locked: true },
      { id: 'Annulé-AG', name: 'Annulé', color: 'bg-red-500', active: true, status: 'cancelled', locked: true }
    ]
  },
  {
    id: 3,
    name: 'Retourner Stocker',
    color: 'bg-slate-600',
    isDefault: true,
    stages: [
      { id: 'Retourner-RS', name: 'Retourner', color: 'bg-slate-500', active: true, status: 'returned', locked: true }
    ]
  },
  {
    id: 4,
    name: 'Annulé',
    color: 'bg-red-600',
    isDefault: true,
    stages: [
      { id: 'Annulé-AN', name: 'Annulé', color: 'bg-red-500', active: true, status: 'cancelled', locked: true }
    ]
  }
];

export default function PipelineSettings() {
  const [pipelines, setPipelines] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showNewStageModal, setShowNewStageModal] = useState(false);
  const [showNewPipelineModal, setShowNewPipelineModal] = useState(false);
  const [showEditPipelineModal, setShowEditPipelineModal] = useState(false);
  const [newPipelineName, setNewPipelineName] = useState('');
  const [newPipelineColor, setNewPipelineColor] = useState('bg-blue-600');
  const [newStageName, setNewStageName] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [selectedColor, setSelectedColor] = useState('bg-blue-500');
  const [editingStage, setEditingStage] = useState(null);
  const [editingPipeline, setEditingPipeline] = useState(null);
  const [currentPipelineId, setCurrentPipelineId] = useState(null);
  const [draggedStage, setDraggedStage] = useState(null);
  const [draggedOverStage, setDraggedOverStage] = useState(null);

  const colors = [
    'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500',
    'bg-teal-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-slate-600'
  ];

  useEffect(() => {
    loadPipelines();
  }, []);

  const loadPipelines = async () => {
    try {
      setLoading(true);
      const data = await pipelineAPI.getAll();
      
      // If no pipelines exist, initialize with default ones
      if (!data || data.length === 0) {
        // Save initial pipelines to API
        for (const pipeline of INITIAL_PIPELINES) {
          await pipelineAPI.create(pipeline);
        }
        setPipelines(INITIAL_PIPELINES);
      } else {
        setPipelines(data);
      }
    } catch (error) {
      console.error('Error loading pipelines:', error);
      setPipelines(INITIAL_PIPELINES);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPipelines = async () => {
    const result = await Swal.fire({
      title: 'Réinitialiser les pipelines ?',
      html: `<div class="text-left">
        <p class="mb-2">Cette action va :</p>
        <ul class="list-disc list-inside text-sm text-slate-600">
          <li>Supprimer tous les pipelines existants</li>
          <li>Restaurer les pipelines par défaut (y compris "Annulé")</li>
          <li>Réinitialiser tous les stages</li>
        </ul>
        <p class="mt-3 text-red-600 font-semibold">⚠️ Cette action est irréversible !</p>
      </div>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Oui, réinitialiser',
      cancelButtonText: 'Annuler',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        // Delete all existing pipelines
        const allPipelines = await pipelineAPI.getAll();
        for (const pipeline of allPipelines) {
          await pipelineAPI.delete(pipeline.id);
        }

        // Create default pipelines
        for (const pipeline of INITIAL_PIPELINES) {
          await pipelineAPI.create(pipeline);
        }

        setPipelines(INITIAL_PIPELINES);

        Swal.fire({
          title: 'Réinitialisé !',
          text: 'Les pipelines ont été réinitialisés avec succès.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error resetting pipelines:', error);
        Swal.fire({
          title: 'Erreur',
          text: 'Impossible de réinitialiser les pipelines.',
          icon: 'error'
        });
      }
    }
  };

  const handleAddPipeline = async () => {
    if (!newPipelineName.trim()) return;

    const newPipeline = {
      id: Date.now(),
      name: newPipelineName,
      color: newPipelineColor,
      isDefault: false,
      stages: []
    };

    try {
      await pipelineAPI.create(newPipeline);
      setPipelines(prev => [...prev, newPipeline]);
      setNewPipelineName('');
      setNewPipelineColor('bg-blue-600');
      setShowNewPipelineModal(false);
      
      Swal.fire({
        title: 'Créé !',
        text: 'Le pipeline a été créé avec succès.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error creating pipeline:', error);
      Swal.fire({
        title: 'Erreur',
        text: 'Impossible de créer le pipeline.',
        icon: 'error'
      });
    }
  };

  const handleEditPipeline = (pipeline) => {
    setEditingPipeline(pipeline);
    setNewPipelineName(pipeline.name);
    setNewPipelineColor(pipeline.color);
    setShowEditPipelineModal(true);
  };

  const handleUpdatePipeline = async () => {
    if (!newPipelineName.trim() || !editingPipeline) return;

    const updatedPipeline = {
      ...editingPipeline,
      name: newPipelineName,
      color: newPipelineColor
    };

    try {
      await pipelineAPI.update(editingPipeline.id, updatedPipeline);
      setPipelines(prev => prev.map(p => 
        p.id === editingPipeline.id ? updatedPipeline : p
      ));

      setEditingPipeline(null);
      setNewPipelineName('');
      setNewPipelineColor('bg-blue-600');
      setShowEditPipelineModal(false);

      Swal.fire({
        title: 'Modifié !',
        text: 'Le pipeline a été modifié avec succès.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error updating pipeline:', error);
      Swal.fire({
        title: 'Erreur',
        text: 'Impossible de modifier le pipeline.',
        icon: 'error'
      });
    }
  };

  const handleAddStage = async () => {
    if (!newStageName.trim()) return;

    // Get color from the selected delivery status
    const statusColor = DELIVERY_STATUSES.find(s => s.id === selectedStatus)?.color || 'bg-blue-500';

    const newStage = {
      id: Date.now(),
      name: newStageName,
      color: statusColor,
      active: true,
      status: selectedStatus,
      locked: false
    };

    try {
      const updatedPipelines = pipelines.map(pipeline => 
        pipeline.id === currentPipelineId 
          ? { ...pipeline, stages: [...pipeline.stages, newStage] } 
          : pipeline
      );
      
      const pipelineToUpdate = updatedPipelines.find(p => p.id === currentPipelineId);
      await pipelineAPI.update(currentPipelineId, pipelineToUpdate);
      
      setPipelines(updatedPipelines);
      setNewStageName('');
      setSelectedStatus('pending');
      setSelectedColor('bg-blue-500');
      setShowNewStageModal(false);
    } catch (error) {
      console.error('Error adding stage:', error);
    }
  };

  const handleToggleStage = async (stageId) => {
    try {
      const updatedPipelines = pipelines.map(pipeline => ({
        ...pipeline,
        stages: pipeline.stages.map(stage =>
          stage.id === stageId ? { ...stage, active: !stage.active } : stage
        )
      }));
      
      // Update all pipelines that were modified
      for (const pipeline of updatedPipelines) {
        const originalPipeline = pipelines.find(p => p.id === pipeline.id);
        if (JSON.stringify(originalPipeline) !== JSON.stringify(pipeline)) {
          await pipelineAPI.update(pipeline.id, pipeline);
        }
      }
      
      setPipelines(updatedPipelines);
    } catch (error) {
      console.error('Error toggling stage:', error);
    }
  };

  const handleDeleteStage = async (stageId, stageName) => {
    if (stageName.toLowerCase().includes('retour') || stageName.toLowerCase().includes('retourner')) {
      Swal.fire({
        title: 'Action non autorisée',
        text: 'Cette étape est protégée et ne peut pas être supprimée.',
        icon: 'error',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Supprimer cette étape ?',
      text: `L'étape "${stageName}" sera définitivement supprimée.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        const updatedPipelines = pipelines.map(pipeline => ({
          ...pipeline,
          stages: pipeline.stages.filter(stage => stage.id !== stageId)
        }));
        
        // Update all pipelines that were modified
        for (const pipeline of updatedPipelines) {
          const originalPipeline = pipelines.find(p => p.id === pipeline.id);
          if (JSON.stringify(originalPipeline?.stages) !== JSON.stringify(pipeline.stages)) {
            await pipelineAPI.update(pipeline.id, pipeline);
          }
        }
        
        setPipelines(updatedPipelines);
        
        Swal.fire({
          title: 'Supprimé !',
          text: 'L\'étape a été supprimée avec succès.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error deleting stage:', error);
      }
    }
  };

  const handleDeletePipeline = async (pipelineId, pipelineName) => {
    const pipeline = pipelines.find(p => p.id === pipelineId);
    if (pipeline?.isDefault || pipelineName.toLowerCase().includes('retour') || pipelineName.toLowerCase().includes('retourner')) {
      Swal.fire({
        title: 'Pipeline protégé',
        text: 'Ce pipeline est protégé et ne peut pas être supprimé.',
        icon: 'error',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Supprimer ce pipeline ?',
      html: `Le pipeline <strong>"${pipelineName}"</strong> et toutes ses <strong>${pipeline.stages.length} étapes</strong> seront définitivement supprimés.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await pipelineAPI.delete(pipelineId);
        setPipelines(prev => prev.filter(p => p.id !== pipelineId));
        
        Swal.fire({
          title: 'Supprimé !',
          text: 'Le pipeline a été supprimé avec succès.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error deleting pipeline:', error);
        Swal.fire({
          title: 'Erreur',
          text: 'Impossible de supprimer le pipeline.',
          icon: 'error'
        });
      }
    }
  };

  const handleEditStage = (stage) => {
    setEditingStage(stage);
    setNewStageName(stage.name);
    setSelectedColor(stage.color);
    setSelectedStatus(stage.status);
    setShowNewStageModal(true);
  };

  const handleUpdateStage = async () => {
    if (!newStageName.trim() || !editingStage) return;

    try {
      const updatedPipelines = pipelines.map(pipeline => ({
        ...pipeline,
        stages: pipeline.stages.map(stage =>
          stage.id === editingStage.id
            ? { ...stage, name: newStageName, color: selectedColor, status: selectedStatus }
            : stage
        )
      }));
      
      // Update all pipelines that were modified
      for (const pipeline of updatedPipelines) {
        const originalPipeline = pipelines.find(p => p.id === pipeline.id);
        if (JSON.stringify(originalPipeline) !== JSON.stringify(pipeline)) {
          await pipelineAPI.update(pipeline.id, pipeline);
        }
      }
      
      setPipelines(updatedPipelines);
      setEditingStage(null);
      setNewStageName('');
      setSelectedStatus('pending');
      setSelectedColor('bg-blue-500');
      setShowNewStageModal(false);
    } catch (error) {
      console.error('Error updating stage:', error);
    }
  };

  // Drag Stages (Reorder)
  const handleStageDragStart = (e, pipelineId, stage) => {
    setDraggedStage({ pipelineId, stage });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleStageDragOver = (e, pipelineId, targetStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedStage) {
        setDraggedOverStage({ pipelineId, stage: targetStage });
    }
  };

  const handleStageDrop = (e, pipelineId, targetStage) => {
    e.preventDefault();
    
    if (!draggedStage) return; 
    if (draggedStage.pipelineId !== pipelineId) return;
    
    setPipelines(prev => prev.map(pipeline => {
      if (pipeline.id !== pipelineId) return pipeline;
      
      const stages = [...pipeline.stages];
      const draggedIndex = stages.findIndex(s => s.id === draggedStage.stage.id);
      const targetIndex = stages.findIndex(s => s.id === targetStage.id);
      
      if (draggedIndex === -1 || targetIndex === -1) return pipeline;
      
      const [removed] = stages.splice(draggedIndex, 1);
      stages.splice(targetIndex, 0, removed);
      
      return { ...pipeline, stages };
    }));
    
    setDraggedStage(null);
    setDraggedOverStage(null);
  };

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8 animate-[fade-in_0.6s_ease-out]">
      
      {/* MAIN CONTENT */}
      <div className="flex-1 min-w-0">
        <div className="w-full">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex items-center justify-between">
                <div>
                <h1 className="text-3xl font-extrabold text-[#2563EB] tracking-tight">Configuration Pipeline</h1>
                <p className="text-slate-500 mt-1 font-medium">Gérez les étapes et les status</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={handleResetPipelines}
                    className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/30 font-semibold">
                    <RotateCw size={20} /> Réinitialiser
                  </button>
                  <button 
                    onClick={() => setShowNewPipelineModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-[#1e3a8a] text-white rounded-xl hover:bg-[#1e40af] transition-all shadow-lg shadow-blue-900/30 font-semibold">
                    <Plus size={20} /> Nouveau Pipeline
                  </button>
                </div>
            </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a8a] mx-auto mb-4"></div>
                  <p className="text-slate-600 font-medium">Chargement des pipelines...</p>
                </div>
              </div>
            ) : (
            <>
            {/* Pipelines List */}
            {pipelines.map((pipeline) => (
            <div key={pipeline.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                {/* Pipeline Header */}
                <div className={`${pipeline.color} px-6 py-4 flex items-center gap-3`}>
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-bold shadow-sm text-slate-700">
                    {pipeline.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                    <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                    {pipeline.name}
                    {pipeline.isDefault && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">🔒 Protégé</span>}
                    </h2>
                    <p className="text-white/80 text-sm">{pipeline.stages.length} étapes</p>
                </div>
                <div className="flex gap-2">
                    <button
                    onClick={() => handleEditPipeline(pipeline)}
                    className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all backdrop-blur-sm group"
                    title="Modifier le pipeline"
                    >
                    <Edit2 size={20} className="group-hover:scale-110 transition-transform" />
                    </button>
                    {!pipeline.isDefault && (
                        <button
                        onClick={() => handleDeletePipeline(pipeline.id, pipeline.name)}
                        className="p-2 bg-white/20 hover:bg-red-500 text-white rounded-lg transition-all backdrop-blur-sm group"
                        title="Supprimer le pipeline"
                        >
                        <Trash2 size={20} className="group-hover:scale-110 transition-transform" />
                        </button>
                    )}
                </div>
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
                    onDragEnd={() => { setDraggedStage(null); setDraggedOverStage(null); }}
                    className={`flex items-start gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group/stage ${
                        !stage.active ? 'opacity-50' : ''
                    } ${
                        draggedOverStage?.stage?.id === stage.id ? 'border-t-2 border-blue-500' : ''
                    } ${
                        draggedStage?.stage?.id === stage.id ? 'opacity-50' : ''
                    }`}
                    >
                    {/* Drag Handle */}
                    <div className="flex items-center gap-3 mt-2">
                        <span className="text-slate-400 font-medium text-sm w-6">{index + 1}</span>
                        <button className={`text-slate-400 hover:text-slate-600 ${stage.locked ? 'cursor-not-allowed opacity-30' : 'cursor-move'}`}>
                        <GripVertical size={20} />
                        </button>
                    </div>

                    {/* Stage Icon */}
                    <div className={`w-10 h-10 ${stage.color} rounded-lg flex items-center justify-center shadow-sm mt-1 shrink-0`}>
                        <span className="text-white font-bold">{stage.name.charAt(0)}</span>
                    </div>

                    {/* Stage Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium text-slate-800">{stage.name}</h3>
                            <div className="flex items-center gap-3">
                                <button
                                onClick={() => handleToggleStage(stage.id)}
                                disabled={stage.locked}
                                className={`w-9 h-5 flex items-center rounded-full p-1 transition-colors duration-300 ${
                                    stage.locked ? 'opacity-50 cursor-not-allowed' : ''
                                } ${stage.active ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                >
                                <div className={`bg-white w-3 h-3 rounded-full shadow-md transform duration-300 ${
                                    stage.active ? 'translate-x-4' : ''
                                }`} />
                                </button>
                                {!stage.locked && (
                                    <div className="flex gap-1">
                                        <button onClick={() => handleEditStage(stage)} className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition group">
                                            <Edit2 size={16} className="group-hover:scale-110 transition-transform" />
                                        </button>
                                        <button onClick={() => handleDeleteStage(stage.id, stage.name)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition group">
                                            <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200 uppercase font-bold tracking-wide">
                                {DELIVERY_STATUSES.find(s => s.id === stage.status)?.label}
                            </span>
                            {stage.locked && <span className="text-[10px] text-slate-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>Système</span>}
                        </div>
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
                    className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:border-[#1e3a8a] hover:text-[#1e3a8a] hover:bg-[#1e3a8a]/5 transition-all font-medium flex items-center justify-center gap-2"
                >
                    <Plus size={20} />
                    Ajouter Stage
                </button>
                </div>
            </div>
            ))}
            </>
            )}
        </div>
      </div>

      {/* Modal for New Pipeline */}
      {showNewPipelineModal && createPortal(
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
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
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 outline-none transition-all"
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
                className="flex-1 px-4 py-2.5 bg-[#1e3a8a] text-white rounded-xl hover:bg-[#1e40af] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/30"
              >
                Créer
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal for Edit Pipeline */}
      {showEditPipelineModal && createPortal(
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-800">Modifier Pipeline</h3>
              <button onClick={() => setShowEditPipelineModal(false)} className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition">
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
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 outline-none transition-all"
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
                onClick={() => setShowEditPipelineModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 border border-slate-200 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleUpdatePipeline}
                disabled={!newPipelineName.trim()}
                className="flex-1 px-4 py-2.5 bg-[#1e3a8a] text-white rounded-xl hover:bg-[#1e40af] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/30"
              >
                Mettre à jour
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal for New/Edit Stage */}
      {showNewStageModal && createPortal(
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
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
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 outline-none transition-all"
              />
            </div>

            {/* Note: Color is automatically determined by delivery status */}

            {/* Delivery Status */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Statut de Livraison</label>
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto custom-scrollbar">
                {DELIVERY_STATUSES.map((status) => (
                  <button
                    key={status.id}
                    onClick={() => setSelectedStatus(status.id)}
                    className={`px-3 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                      selectedStatus === status.id
                        ? 'border-[#005461] bg-[#005461]/10 text-[#005461]'
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
                className="flex-1 px-4 py-2.5 bg-[#005461] text-white rounded-xl hover:bg-[#016f76] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-900/30"
              >
                {editingStage ? 'Mettre à jour' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
