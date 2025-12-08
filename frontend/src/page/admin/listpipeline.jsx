import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  RotateCw, 
  X, 
  Bell, 
  Package, 
  AlertTriangle, 
  Eye, 
  Calendar, 
  CheckCircle // Added CheckCircle for the toast
} from 'lucide-react';
import { productAPI, villeAPI, quartierAPI, settingsAPI } from '../../services/api';

const EMPLOYEES = ['Mohamed', 'Fatima', 'Youssef', 'Amina', 'Hassan', 'Khadija'];
// BUSINESSES replaced by dynamic settings


// Add animation style
const style = document.createElement('style');
style.textContent = `
  @keyframes slide-up {
    from {
      transform: translateY(100px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  .animate-slide-up {
    animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
`;
document.head.appendChild(style);

export default function ColisManagement() {
  const [colis, setColis] = useState(() => {
    const saved = localStorage.getItem('colis');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [products, setProducts] = useState([]);
  const [villes, setVilles] = useState([]);
  const [quartiers, setQuartiers] = useState([]);
  const [stages, setStages] = useState([]);
  const [pipelines, setPipelines] = useState([]);
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [businesses, setBusinesses] = useState([]); // Dynamic Businesses
  
  // Toast State
  const [showToast, setShowToast] = useState(false);
// ...

  const loadData = async () => {
    try {
      const [productsData, villesData, quartiersData, businessesData] = await Promise.all([
        productAPI.getAll().catch(() => []),
        villeAPI.getAll().catch(() => []),
        quartierAPI.getAll().catch(() => []),
        Promise.resolve(settingsAPI.getBusinesses())
      ]);
      
      setProducts(productsData);
      setVilles(villesData);
      setQuartiers(quartiersData);
      setBusinesses(businessesData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Default Pipeline matching Management Settings
  const DEFAULT_PIPELINE = {
    id: 1,
    name: 'Pipeline Principal',
    stages: [
      { id: 1, name: 'Reporter', color: 'bg-slate-500', active: true },
      { id: 2, name: 'Confirmé', color: 'bg-purple-500', active: true },
      { id: 3, name: 'Packaging', color: 'bg-orange-500', active: true },
      { id: 4, name: 'Out for Delivery', color: 'bg-blue-500', active: true },
      { id: 5, name: 'Livré', color: 'bg-green-500', active: true },
      { id: 6, name: 'Annulé', color: 'bg-red-500', active: true }
    ]
  };

  const loadPipelineStages = () => {
    const saved = localStorage.getItem('pipelines');
    let allPipelines = [];

    if (saved) {
      allPipelines = JSON.parse(saved);
    }
    
    // Fallback to default if empty
    if (allPipelines.length === 0) {
      allPipelines = [DEFAULT_PIPELINE];
    }

    setPipelines(allPipelines);
      
    const pipelineToUse = selectedPipeline || allPipelines[0];
    setSelectedPipeline(pipelineToUse);
    
    const activeStages = pipelineToUse.stages
      .filter(s => s.active)
      .map(s => ({
        id: s.name,
        title: s.name,
        color: s.color.replace('bg-', 'border-'),
        bgColor: s.color.replace('bg-', 'bg-').replace('-500', '-50')
      }));
    setStages(activeStages);
  };

  const handlePipelineChange = (pipelineId) => {
    const pipeline = pipelines.find(p => p.id === parseInt(pipelineId));
    if (pipeline) {
      setSelectedPipeline(pipeline);
      const activeStages = pipeline.stages
        .filter(s => s.active)
        .map(s => ({
          id: s.name,
          title: s.name,
          color: s.color.replace('bg-', 'border-'),
          bgColor: s.color.replace('bg-', 'bg-').replace('-500', '-50')
        }));
      setStages(activeStages);
    }
  };

  const getAlerts = (colisItem) => {
    if (colisItem.stage !== 'Reporter' || !colisItem.dateReport) return null;
    
    const now = new Date();
    const reportDate = new Date(colisItem.dateReport);
    const hoursDiff = (reportDate - now) / (1000 * 60 * 60);
    
    if (hoursDiff <= 0) {
      return { type: 'danger', message: 'Date dépassée!' };
    } else if (hoursDiff <= 4) {
      return { type: 'warning', message: 'Bientôt!' };
    }
    return null;
  };

  // --- DRAG AND DROP HANDLERS ---
  const handleDragStart = (e, colisItem) => {
    e.dataTransfer.setData('colisId', colisItem.id);
    // Optional: Add a class to body to indicate dragging
    document.body.classList.add('dragging-active');
  };

  const handleDrop = async (e, targetStage) => {
    e.preventDefault();
    document.body.classList.remove('dragging-active');
    const colisId = e.dataTransfer.getData('colisId');
    
    // Find the colis BEFORE updating state to get its name for the Toast
    const colisToUpdate = colis.find(c => c.id === colisId);

    // If dropping in same stage, do nothing
    if (!colisToUpdate || colisToUpdate.stage === targetStage) return;

    let updatedColisData = null;

    // 1. Optimistic UI Update (Update State Immediately)
    setColis(prevColis => 
      prevColis.map(c => {
        if (c.id === colisId) {
          const newColis = { ...c, stage: targetStage };
          
          if (targetStage === 'Confirmé') {
            newColis.prix = '';
          }
          
          if (!['Reporter', 'Confirmé'].includes(targetStage)) {
            if (!newColis.status) {
              newColis.status = 'Nouveau colis';
            }
          }
          updatedColisData = newColis;
          return newColis;
        }
        return c;
      })
    );

    // 2. Trigger Success Toast Immediately
    setToastMessage({
      title: 'Mise à jour réussie',
      description: `Le colis de ${colisToUpdate.clientName} est passé à ${targetStage}`,
      type: 'success'
    });
    setShowToast(true);
    
    // Hide toast after 3 seconds
    setTimeout(() => setShowToast(false), 3000);
    
    // 3. Backend Update (Background)
    if (updatedColisData) {
      try {
        const response = await fetch(`http://localhost:3000/colis/${colisId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            stage: targetStage,
            prix: updatedColisData.prix,
            status: updatedColisData.status
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update');
        }
      } catch (error) {
        console.error('Error updating colis:', error);
        // Optional: Revert state or show error toast here if backend fails
        setToastMessage({
          title: 'Attention',
          description: 'Sauvegarde locale uniquement (Erreur serveur)',
          type: 'warning'
        });
        setShowToast(true);
      }
    }
  };

  const handleAddColis = (newColis) => {
    setColis([...colis, { 
      ...newColis, 
      id: Date.now().toString(),
      dateCreated: new Date().toISOString()
    }]);
    setShowAddModal(false);
    setToastMessage({
      title: 'Client ajouté avec succès!',
      description: 'Le colis a été créé dans le pipeline',
      type: 'success'
    });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleRefresh = () => {
    loadData();
    loadPipelineStages();
    setToastMessage({
      title: 'Données actualisées!',
      description: 'Les informations ont été mises à jour',
      type: 'success'
    });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleMoveColis = async (targetStage) => {
    if (!colisToMove) return;
    
    // Optimistic Update
    setColis(prevColis => 
      prevColis.map(c => {
        if (c.id === colisToMove.id) {
          const newColis = { ...c, stage: targetStage };
          if (targetStage === 'Confirmé') newColis.prix = '';
          if (!['Reporter', 'Confirmé'].includes(targetStage) && !newColis.status) {
            newColis.status = 'Nouveau colis';
          }
          return newColis;
        }
        return c;
      })
    );
    
    // Show Toast
    setToastMessage({
      title: 'Client déplacé avec succès!',
      description: `${colisToMove.clientName} → ${targetStage}`,
      type: 'success'
    });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
    
    setShowMoveModal(false);

    // Backend Update
    try {
      const updateData = { stage: targetStage };
      if (targetStage === 'Confirmé') updateData.prix = '';
      if (!['Reporter', 'Confirmé'].includes(targetStage) && !colisToMove.status) {
        updateData.status = 'Nouveau colis';
      }
      
      await fetch(`http://localhost:3000/colis/${colisToMove.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
    } catch (error) {
      console.error('Error updating colis:', error);
    }
    setColisToMove(null);
  };

  const filteredColis = colis.filter(c => {
    if (selectedEmployee !== 'all' && c.employee !== selectedEmployee) return false;
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      const matchesName = c.clientName?.toLowerCase().includes(searchLower);
      const matchesPhone = c.tel?.toLowerCase().includes(searchLower);
      const matchesProduct = c.productName?.toLowerCase().includes(searchLower);
      if (!matchesName && !matchesPhone && !matchesProduct) return false;
    }
    if (searchDate) {
      const colisDate = c.dateCreated ? new Date(c.dateCreated).toISOString().split('T')[0] : null;
      if (colisDate !== searchDate) return false;
    }
    return true;
  });

  const sortedColis = [...filteredColis].sort((a, b) => {
    const alertA = getAlerts(a);
    const alertB = getAlerts(b);
    if (alertA && !alertB) return -1;
    if (!alertA && alertB) return 1;
    return 0;
  });

  const getColisByStage = (stageId) => {
    return sortedColis.filter(c => c.stage === stageId);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Liste des Colis</h1>
                <p className="text-slate-500 mt-1 font-medium text-sm md:text-base">Gérez vos commandes par étape</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              {pipelines.length > 0 && (
                <select
                  value={selectedPipeline?.id || ''}
                  onChange={(e) => handlePipelineChange(e.target.value)}
                  className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white border-2 border-blue-500 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all shadow-lg w-full md:w-auto"
                >
                  {pipelines.map(pipeline => (
                    <option key={pipeline.id} value={pipeline.id} className="bg-white text-slate-800">
                      {pipeline.name}
                    </option>
                  ))}
                </select>
              )}

              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-full md:w-auto"
              >
                <option value="all">Tous les employés</option>
                {EMPLOYEES.map(emp => (
                  <option key={emp} value={emp}>{emp}</option>
                ))}
              </select>

              <div className="flex gap-2">
                <button
                  onClick={handleRefresh}
                  className="flex-1 md:flex-none justify-center px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 flex items-center gap-2 text-slate-700 font-semibold transition-all"
                >
                  <RotateCw className="w-4 h-4" />
                  <span className="md:hidden lg:inline">Actualiser</span>
                </button>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex-1 md:flex-none justify-center flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  <span className="whitespace-nowrap">Ajouter</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mt-4 pt-4 border-t border-slate-200">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <SearchIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            
            <div className="w-full md:w-64">
              <div className="relative">
                <input
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <Calendar className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {(searchText || searchDate) && (
              <button
                onClick={() => {
                  setSearchText('');
                  setSearchDate('');
                }}
                className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 text-sm font-semibold transition-all flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Effacer
              </button>
            )}
          </div>
        </div>

        {/* Kanban Board - Responsive: Horizontal Scroll on Mobile */}
        <div className="flex flex-row gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-200px)] snap-x snap-mandatory md:snap-none px-1 md:px-0">
          {stages.map((stage) => {
            const stageColis = getColisByStage(stage.id);
            
            return (
              <div
                key={stage.id}
                className="flex-shrink-0 w-[85vw] md:w-80 snap-center first:pl-0"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                <div className={`bg-white rounded-t-xl border-t-4 ${stage.color} p-3 shadow-sm`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 text-sm">{stage.title}</span>
                      <span className="bg-slate-100 text-xs px-2 py-0.5 rounded-full font-medium text-slate-600">
                        {stageColis.length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`${stage.bgColor} rounded-b-xl p-2 min-h-[600px] space-y-2 border-x border-b border-slate-200 transition-colors`}>
                  {stageColis.map((colisItem) => {
                    const alert = getAlerts(colisItem);
                    const isReportOrConfirmed = ['Reporter', 'Confirmé'].includes(stage.id);
                    const product = products.find(p => p.id === colisItem.productId);
                    const ville = villes.find(v => v.id === colisItem.ville);
                    
                    return (
                      <div
                        key={colisItem.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, colisItem)}
                        className="bg-white rounded-lg p-2 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-move border border-slate-200 relative flex gap-3 group active:cursor-grabbing active:scale-95"
                      >
                        <div className="shrink-0 relative">
                          {product?.image ? (
                            <img src={product.image} alt={product.nom} className="w-16 h-16 object-cover rounded-lg" />
                          ) : (
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                              <Package className="w-6 h-6 text-blue-600" />
                            </div>
                          )}
                          
                          {alert && (
                            <div className={`absolute -top-1 -right-1 w-4 h-4 ${
                              alert.type === 'danger' ? 'bg-red-500' : 'bg-orange-500'
                            } rounded-full flex items-center justify-center border-2 border-white`}>
                              <div className="w-1.5 h-1.5 bg-white rounded-full" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start pr-6">
                              <h3 className="font-bold text-slate-800 text-xs truncate" title={product?.nom || colisItem.productName}>
                                {product?.nom || colisItem.productName}
                              </h3>
                            </div>
                            
                            <div className="text-[10px] text-slate-500 leading-tight mt-0.5 space-y-0.5">
                              <p className="truncate"><span className="font-semibold text-slate-700">{colisItem.clientName}</span></p>
                              <p className="truncate">{colisItem.tel} • {ville?.name}</p>
                              
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`font-bold ${(colisItem.prix || colisItem.price) ? 'text-emerald-600' : 'text-slate-400'}`}>
                                  {(colisItem.prix || colisItem.price) ? `${colisItem.prix || colisItem.price} DH` : 'Prix: --'}
                                </span>
                                {stage.id === 'Reporter' && colisItem.dateReport && (
                                  <span className="flex items-center gap-0.5 text-orange-600 font-medium">
                                    <Calendar className="w-2.5 h-2.5" />
                                    {new Date(colisItem.dateReport).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                                  </span>
                                )}
                              </div>

                              {!isReportOrConfirmed && colisItem.status && (
                                <span className="inline-block px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-medium mt-0.5">
                                  {colisItem.status}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-slate-100">
                            <span className="text-[9px] text-slate-400 truncate max-w-[60px]" title={colisItem.employee}>
                              {colisItem.employee}
                            </span>
                            
                            {!isReportOrConfirmed && (
                              <div className="flex gap-1">
                                <button 
                                  onClick={() => {
                                    setSelectedColisForTracking(colisItem);
                                    setShowTrackingModal(true);
                                  }}
                                  className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                                  title="Suivi"
                                >
                                  <Eye className="w-3 h-3" />
                                </button>
                                <button 
                                  onClick={() => console.log('Export ticket:', colisItem.id)}
                                  className="p-1 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors"
                                  title="Ticket"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                  </svg>
                                </button>
                              </div>
                            )}
                            
                            <button 
                              onClick={() => {
                                setColisToMove(colisItem);
                                setShowMoveModal(true);
                              }}
                              className="p-1 bg-emerald-100 text-emerald-600 rounded hover:bg-emerald-200 transition-colors md:hidden"
                              title="Déplacer"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {stageColis.length === 0 && (
                    <div className="text-center p-8 text-slate-400 italic">
                      Aucun colis
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <AddClientModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddColis}
          employees={EMPLOYEES}
          businesses={businesses}
          products={products}
          villes={villes}
          quartiers={quartiers}
        />
      )}

      {/* NEW IMPROVED SUCCESS TOAST */}
      {showToast && (
        <div className="fixed bottom-8 right-8 z-50 animate-slide-up">
          <div className={`px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 border ${
            toastMessage.type === 'warning' 
              ? 'bg-amber-500 text-white border-amber-600' 
              : 'bg-emerald-600 text-white border-emerald-700'
          }`}>
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              {toastMessage.type === 'warning' ? (
                <AlertTriangle className="w-6 h-6 text-white" />
              ) : (
                <CheckCircle className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg leading-tight">{toastMessage.title}</p>
              <p className="text-sm text-white/90 font-medium">{toastMessage.description}</p>
            </div>
            <button 
              onClick={() => setShowToast(false)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Move Client Modal */}
      {showMoveModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Déplacer le colis</h3>
              <button onClick={() => setShowMoveModal(false)} className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {stages.map(stage => (
                <button
                  key={stage.id}
                  onClick={() => handleMoveColis(stage.id)}
                  className={`w-full p-3 rounded-xl text-left font-medium transition-all flex items-center justify-between ${
                    colisToMove?.stage === stage.id 
                      ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  {stage.title}
                  {colisToMove?.stage === stage.id && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      {showTrackingModal && selectedColisForTracking && (
        <TrackingModal
          colis={selectedColisForTracking}
          onClose={() => {
            setShowTrackingModal(false);
            setSelectedColisForTracking(null);
          }}
          products={products}
          villes={villes}
          quartiers={quartiers}
        />
      )}
    </div>
  );
}

// AddClientModal and TrackingModal components remain the same as your previous code...
// Just including simple SearchIcon for the search input
function SearchIcon(props) {
  return (
    <svg 
      {...props} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function AddClientModal({ onClose, onAdd, employees, businesses, products, villes, quartiers }) {
  const [formData, setFormData] = useState({
    productId: '',
    productName: '',
    clientName: '',
    ville: '',
    quartier: '',
    tel: '',
    prix: '',
    employee: employees[0] || '',
    business: businesses[0] || 'Herboclear',
    stage: 'Reporter',
    commentaire: '',
    nbPiece: '1',
    dateReport: ''
  });

  const [isReporter, setIsReporter] = useState(true);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [filteredQuartiers, setFilteredQuartiers] = useState([]);

  useEffect(() => {
    if (formData.ville) {
      setFilteredQuartiers(quartiers.filter(q => q.villeId === formData.ville));
    } else {
      setFilteredQuartiers([]);
    }
  }, [formData.ville, quartiers]);

  const handleProductChange = (e) => {
    const productId = e.target.value;
    const product = products.find(p => p.id === productId);
    setFormData({
      ...formData,
      productId,
      productName: product?.nom || '',
      prix: product?.prix1 || ''
    });
  };

  const handleReporterChange = (checked) => {
    setIsReporter(checked);
    if (checked) {
      setIsConfirmed(false);
      setFormData({ ...formData, stage: 'Reporter' });
    }
  };

  const handleConfirmedChange = (checked) => {
    setIsConfirmed(checked);
    if (checked) {
      setIsReporter(false);
      setFormData({ ...formData, stage: 'Confirmé', dateReport: '' });
    }
  };

  const handleSubmit = () => {
    if (!formData.clientName || !formData.tel || !formData.productId) {
      alert('Veuillez remplir les champs obligatoires');
      return;
    }
    
    if (isReporter && !formData.dateReport) {
      alert('Veuillez sélectionner une date de confirmation');
      return;
    }
    
    onAdd(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Ajouter un Client</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Statut du Colis</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={isReporter}
                    onChange={(e) => handleReporterChange(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-6 h-6 border-2 border-slate-300 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 flex items-center justify-center transition-all">
                    {isReporter && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className={`font-medium ${isReporter ? 'text-blue-600' : 'text-slate-600'}`}>Reporter</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={isConfirmed}
                    onChange={(e) => handleConfirmedChange(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-6 h-6 border-2 border-slate-300 rounded peer-checked:bg-emerald-600 peer-checked:border-emerald-600 flex items-center justify-center transition-all">
                    {isConfirmed && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className={`font-medium ${isConfirmed ? 'text-emerald-600' : 'text-slate-600'}`}>Confirmé</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Business *</label>
              <select value={formData.business} onChange={(e) => setFormData({...formData, business: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all">
                {businesses.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Produit *</label>
              <select value={formData.productId} onChange={handleProductChange} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all">
                <option value="">Sélectionner un produit</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.nom} - {p.categorie}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Employé *</label>
              <select value={formData.employee} onChange={(e) => setFormData({...formData, employee: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all">
                {employees.map(emp => (
                  <option key={emp} value={emp}>{emp}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Nom Client *</label>
              <input type="text" value={formData.clientName} onChange={(e) => setFormData({...formData, clientName: e.target.value})} placeholder="Mohamed" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Téléphone *</label>
              <input type="tel" value={formData.tel} onChange={(e) => setFormData({...formData, tel: e.target.value})} placeholder="0666666666" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Ville</label>
              <select value={formData.ville} onChange={(e) => setFormData({...formData, ville: e.target.value, quartier: ''})} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all">
                <option value="">Sélectionner</option>
                {villes.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Quartier</label>
              <input type="text" value={formData.quartier} onChange={(e) => setFormData({...formData, quartier: e.target.value})} placeholder="Quartier" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Prix (DH)</label>
              <input type="number" value={formData.prix} onChange={(e) => setFormData({...formData, prix: e.target.value})} placeholder="Prix" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
            </div>

            {isReporter && (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Date de Confirmation *</label>
                <input type="datetime-local" value={formData.dateReport} onChange={(e) => setFormData({...formData, dateReport: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Nb de pièce</label>
              <input type="number" value={formData.nbPiece} onChange={(e) => setFormData({...formData, nbPiece: e.target.value})} min="1" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
            </div>



            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Commentaire</label>
              <textarea value={formData.commentaire} onChange={(e) => setFormData({...formData, commentaire: e.target.value})} placeholder="Notes..." rows="3" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 border border-slate-200 transition-all">
              Annuler
            </button>
            <button onClick={handleSubmit} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold shadow-lg shadow-blue-500/30 transition-all">
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tracking Modal Component
function TrackingModal({ colis, onClose, products, villes, quartiers }) {
  const [activeTab, setActiveTab] = useState('suivi');
  
  const product = products.find(p => p.id === colis.productId);
  const ville = villes.find(v => v.id === colis.ville);
  const quartier = quartiers.find(q => q.id === colis.quartier);

  // Mock tracking events
  const trackingEvents = [
    {
      id: 1,
      status: 'Colis créé',
      description: 'Le colis a été enregistré dans le système',
      date: colis.dateCreated || new Date().toISOString(),
      completed: true
    },
    {
      id: 2,
      status: 'En préparation',
      description: 'Le colis est en cours de préparation',
      date: colis.dateCreated || new Date().toISOString(),
      completed: colis.stage !== 'Reporter'
    },
    {
      id: 3,
      status: 'Expédié',
      description: 'Le colis a été expédié',
      date: null,
      completed: ['Packaging', 'Out for Delivery', 'Livré'].includes(colis.stage)
    },
    {
      id: 4,
      status: 'En livraison',
      description: 'Le colis est en cours de livraison',
      date: null,
      completed: ['Out for Delivery', 'Livré'].includes(colis.stage)
    },
    {
      id: 5,
      status: 'Livré',
      description: 'Le colis a été livré au destinataire',
      date: null,
      completed: colis.stage === 'Livré'
    }
  ];

  const tabs = [
    { id: 'suivi', label: 'Suivi', icon: '📦' },
    { id: 'expediteur', label: 'Expéditeur', icon: '📤' },
    { id: 'destinataire', label: 'Destinataire', icon: '📥' },
    { id: 'livreur', label: 'Livreur', icon: '🚚' },
    { id: 'produit', label: 'Produit', icon: '📋' }
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Suivi de Colis</h2>
              <p className="text-sm text-slate-500">#{colis.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-white/50'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Suivi Tab */}
          {activeTab === 'suivi' && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-slate-800 mb-4">Historique de suivi</h3>
              <div className="relative">
                {trackingEvents.map((event, index) => (
                  <div key={event.id} className="flex gap-4 pb-8 last:pb-0">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        event.completed ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}>
                        {event.completed ? (
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <div className="w-3 h-3 bg-white rounded-full" />
                        )}
                      </div>
                      {index < trackingEvents.length - 1 && (
                        <div className={`w-0.5 h-full mt-2 ${event.completed ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      )}
                    </div>

                    <div className="flex-1 pb-2">
                      <div className={`font-bold ${event.completed ? 'text-slate-800' : 'text-slate-400'}`}>
                        {event.status}
                      </div>
                      <div className={`text-sm ${event.completed ? 'text-slate-600' : 'text-slate-400'}`}>
                        {event.description}
                      </div>
                      {event.date && (
                        <div className="text-xs text-slate-400 mt-1">
                          {new Date(event.date).toLocaleString('fr-FR')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expéditeur Tab */}
          {activeTab === 'expediteur' && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-slate-800 mb-4">Informations Expéditeur</h3>
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <InfoRow label="Business" value={colis.business || 'Commit'} />
                <InfoRow label="Employé" value={colis.employee || 'N/A'} />
                <InfoRow label="Date de création" value={colis.dateCreated ? new Date(colis.dateCreated).toLocaleString('fr-FR') : 'N/A'} />
              </div>
            </div>
          )}

          {/* Destinataire Tab */}
          {activeTab === 'destinataire' && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-slate-800 mb-4">Informations Destinataire</h3>
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <InfoRow label="Nom" value={colis.clientName} />
                <InfoRow label="Téléphone" value={colis.tel} />
                <InfoRow label="Ville" value={ville?.name || 'N/A'} />
                <InfoRow label="Quartier" value={colis.quartier || 'N/A'} />
                {colis.commentaire && (
                  <div>
                    <div className="text-xs font-bold text-slate-500 mb-1">COMMENTAIRE</div>
                    <div className="text-sm text-slate-700">{colis.commentaire}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Livreur Tab */}
          {activeTab === 'livreur' && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-slate-800 mb-4">Informations Livreur</h3>
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <InfoRow label="Livreur assigné" value={colis.employee || 'Non assigné'} />
                <InfoRow label="Statut actuel" value={colis.stage} />
                {colis.status && <InfoRow label="Détails" value={colis.status} />}
                {colis.dateReport && (
                  <InfoRow 
                    label="Date de report" 
                    value={new Date(colis.dateReport).toLocaleString('fr-FR')} 
                  />
                )}
              </div>
            </div>
          )}

          {/* Produit Tab */}
          {activeTab === 'produit' && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-slate-800 mb-4">Informations Produit</h3>
              <div className="bg-slate-50 rounded-xl p-4 space-y-4">
                {product?.image && (
                  <div className="flex justify-center">
                    <img src={product.image} alt={product.nom} className="w-32 h-32 object-cover rounded-lg" />
                  </div>
                )}
                <InfoRow label="Produit" value={product?.nom || colis.productName || 'N/A'} />
                <InfoRow label="Catégorie" value={product?.categorie || 'N/A'} />
                <InfoRow label="Prix" value={colis.prix || colis.price ? `${colis.prix || colis.price} DH` : 'N/A'} />
                <InfoRow label="Nombre de pièces" value={colis.nbPiece || '1'} />
                {product?.description && (
                  <div>
                    <div className="text-xs font-bold text-slate-500 mb-1">DESCRIPTION</div>
                    <div className="text-sm text-slate-700">{product.description}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold shadow-lg shadow-blue-500/30 transition-all"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <div className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">{label}</div>
      <div className="text-sm font-medium text-slate-800">{value}</div>
    </div>
  );
}