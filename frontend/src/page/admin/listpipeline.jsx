import React, { useState, useEffect } from 'react';
import { 
  Plus, RotateCw, X, Package, AlertTriangle, Eye, Calendar, 
  CheckCircle, Search as SearchIcon, Printer, MapPin, User, Truck, Building, Phone, Clock, ArrowRight
} from 'lucide-react';
import { productAPI, villeAPI, quartierAPI, settingsAPI } from '../../services/api';

const EMPLOYEES = ['Mohamed', 'Fatima', 'Youssef', 'Amina', 'Hassan', 'Khadija'];

// Add animation style
const style = document.createElement('style');
style.textContent = `
  @keyframes slide-up {
    from { transform: translateY(100px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  .animate-slide-up {
    animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
`;
document.head.appendChild(style);

export default function ColisManagement() {
  // --- STATE ---
  const [colis, setColis] = useState(() => {
    const saved = localStorage.getItem('colis');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [products, setProducts] = useState([]);
  const [villes, setVilles] = useState([]);
  const [quartiers, setQuartiers] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  
  const [stages, setStages] = useState([]);
  const [pipelines, setPipelines] = useState([]);
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBusiness, setSelectedBusiness] = useState('all');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  
  const [colisToMove, setColisToMove] = useState(null);
  const [selectedColisForTracking, setSelectedColisForTracking] = useState(null);
  
  const [searchText, setSearchText] = useState('');
  const [searchDate, setSearchDate] = useState('');
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: '', description: '', type: 'success' });

  // --- INITIALIZATION ---
  useEffect(() => {
    loadData();
    loadPipelineStages();
    
    // Auto-refresh when localStorage changes
    const handleStorageChange = () => loadData();
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Migration: Assign pipelineId to old colis that don't have one
  useEffect(() => {
    if (pipelines.length > 0 && colis.length > 0) {
      const needsMigration = colis.some(c => !c.pipelineId);
      
      if (needsMigration) {
        console.log('🔧 Migrating old colis to assign pipelineId...');
        const defaultPipeline = pipelines.find(p => p.name === 'Livraison Ammex') || pipelines[0];
        
        const migratedColis = colis.map(c => {
          if (!c.pipelineId) {
            console.log('  ➡️ Assigning', c.clientName, 'to pipeline:', defaultPipeline.name);
            return { ...c, pipelineId: defaultPipeline.id };
          }
          return c;
        });
        
        setColis(migratedColis);
        localStorage.setItem('colis', JSON.stringify(migratedColis));
        console.log('✅ Migration complete!');
      }
    }
  }, [pipelines, colis]);

  const loadData = async () => {
    try {
      const [productsData, villesData, quartiersData, businessesData] = await Promise.all([
        productAPI?.getAll().catch(() => []) || [],
        villeAPI?.getAll().catch(() => []) || [],
        quartierAPI?.getAll().catch(() => []) || [],
        settingsAPI?.getBusinesses ? settingsAPI.getBusinesses() : Promise.resolve(['Herboclear', 'Commit'])
      ]);
      
      setProducts(productsData);
      setVilles(villesData);
      setQuartiers(quartiersData);
      setBusinesses(businessesData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const DEFAULT_PIPELINES = [
    {
      id: 1,
      name: 'Livraison Ammex',
      stages: [
        { id: 'Reporter', name: 'Reporter', color: 'bg-amber-500', active: true },
        { id: 'Confirmé', name: 'Confirmé', color: 'bg-purple-500', active: true },
        { id: 'Packaging', name: 'Packaging', color: 'bg-orange-500', active: true },
        { id: 'Out for Delivery', name: 'Out for Delivery', color: 'bg-blue-500', active: true },
        { id: 'Livré', name: 'Livré', color: 'bg-green-500', active: true },
        { id: 'Annulé', name: 'Annulé', color: 'bg-red-500', active: true }
      ]
    },
    {
      id: 2,
      name: 'Livreur Agadir',
      stages: [
        { id: 'Reporter-AG', name: 'Reporter', color: 'bg-amber-500', active: true },
        { id: 'Confirmé-AG', name: 'Confirmé', color: 'bg-purple-500', active: true },
        { id: 'Packaging-AG', name: 'Packaging', color: 'bg-orange-500', active: true },
        { id: 'Out for Delivery-AG', name: 'Out for Delivery', color: 'bg-blue-500', active: true },
        { id: 'Livré-AG', name: 'Livré', color: 'bg-green-500', active: true },
        { id: 'Annulé-AG', name: 'Annulé', color: 'bg-red-500', active: true }
      ]
    }
  ];

  const loadPipelineStages = () => {
    const saved = localStorage.getItem('pipelines');
    let allPipelines = saved ? JSON.parse(saved) : [];
    
    // If no saved pipelines or old format, use defaults
    if (!Array.isArray(allPipelines) || allPipelines.length === 0 || !allPipelines[0].stages) {
       allPipelines = DEFAULT_PIPELINES;
       localStorage.setItem('pipelines', JSON.stringify(allPipelines));
    }
    
    setPipelines(allPipelines);
    // Always use Livraison Ammex pipeline (id: 1)
    const ammexPipeline = allPipelines.find(p => p.id === 1) || allPipelines[0];
    setSelectedPipeline(ammexPipeline);
    updateStagesFromPipeline(ammexPipeline);
  };

  const updateStagesFromPipeline = (pipeline) => {
    if (!pipeline) return;
    const activeStages = pipeline.stages
      .filter(s => s.active)
      .map(s => ({
        id: s.name, // Use name as ID to match colis.stage
        title: s.name,
        color: s.color.replace('bg-', 'border-'),
        bgColor: s.color.replace('bg-', 'bg-').replace('-500', '-50').replace('-600', '-50')
      }));
    console.log('🎯 Setting stages:', activeStages.map(s => s.id));
    setStages(activeStages);
  };

  const handlePipelineChange = (pipelineId) => {
    console.log('🔄 Pipeline change called with ID:', pipelineId);
    const pipeline = pipelines.find(p => p.id === parseInt(pipelineId));
    console.log('📦 Found pipeline:', pipeline);
    if (!pipeline) return;

    // Update selected pipeline state
    setSelectedPipeline(pipeline);
    console.log('✅ Selected pipeline updated to:', pipeline.name, 'ID:', pipeline.id);
    updateStagesFromPipeline(pipeline);

    // Logic: Import 'Confirmé' -> 'Ramassé' when switching to Logistics (Agadir)
    if (pipeline.id === 2) { 
      const itemsToImport = colis.filter(c => c.stage === 'Confirmé');
      
      if (itemsToImport.length > 0) {
        const confirmImport = window.confirm(
          `Vous avez ${itemsToImport.length} colis "Confirmé". Voulez-vous les importer dans "Ramassé" ?`
        );

        if (confirmImport) {
          const updatedList = colis.map(c => {
            if (c.stage === 'Confirmé') {
              return { 
                ...c, 
                stage: 'Ramassé',
                prix: '', 
                dateReport: ''
              };
            }
            return c;
          });

          setColis(updatedList);
          localStorage.setItem('colis', JSON.stringify(updatedList));

          setToastMessage({
            title: 'Importation réussie',
            description: `${itemsToImport.length} colis déplacés vers Ramassé`,
            type: 'success'
          });
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
        }
      }
    }
  };

  const getAlerts = (colisItem) => {
    if (colisItem.stage !== 'Reporter' || !colisItem.dateReport) return null;
    const now = new Date();
    const reportDate = new Date(colisItem.dateReport);
    const hoursDiff = (reportDate - now) / (1000 * 60 * 60);
    if (hoursDiff <= 0) return { type: 'danger', message: 'Date dépassée!' };
    else if (hoursDiff <= 4) return { type: 'warning', message: 'Bientôt!' };
    return null;
  };

  // --- ACTIONS ---
  const handleDragStart = (e, colisItem) => {
    e.dataTransfer.setData('colisId', colisItem.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleLinkDrop = (e, colisId) => {
      e.preventDefault(); 
  };

  const handleDrop = (e, targetStage) => {
    e.preventDefault();
    const colisId = e.dataTransfer.getData('colisId');
    if (!colisId) return; 

    const colisToUpdate = colis.find(c => c.id.toString() === colisId.toString());

    if (!colisToUpdate || colisToUpdate.stage === targetStage) return;

    const updatedList = colis.map(c => {
        if (c.id.toString() === colisId.toString()) {
            const newColis = { ...c, stage: targetStage };
            if (targetStage === 'Confirmé') {
                newColis.prix = ''; 
                newColis.dateReport = ''; 
            }
            return newColis;
        }
        return c;
    });

    setColis(updatedList);
    localStorage.setItem('colis', JSON.stringify(updatedList));

    setToastMessage({
      title: 'Mise à jour réussie',
      description: `Le colis de ${colisToUpdate.clientName} est passé à ${targetStage}`,
      type: 'success'
    });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleAddColis = (newColisData) => {
    console.log('🆕 Adding new colis with data:', newColisData);
    console.log('📦 Current pipeline:', selectedPipeline);
    
    const newId = Math.max(...colis.map(c => c.id), 0) + 1;
    const colisWithId = { 
      id: newId, 
      ...newColisData, 
      pipelineId: selectedPipeline?.id || 1, // Associate with current pipeline
      dateCreated: new Date().toISOString(),
      status: 'En cours',
      employee: ''
    };
    
    console.log('✅ New colis created:', colisWithId);
    
    const updatedList = [...colis, colisWithId];
    setColis(updatedList);
    localStorage.setItem('colis', JSON.stringify(updatedList));
    console.log('💾 Saved to localStorage. Total colis:', updatedList.length);
    
    setShowAddModal(false);
    
    setToastMessage({ title: 'Succès', description: 'Colis ajouté avec succès', type: 'success' });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleRefresh = () => {
    loadData();
    setToastMessage({ title: 'Actualisé', description: 'Données rechargées', type: 'success' });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleResetPipelines = () => {
    if (window.confirm('Voulez-vous réinitialiser les pipelines à leur configuration par défaut?')) {
      localStorage.removeItem('pipelines');
      setPipelines(DEFAULT_PIPELINES);
      localStorage.setItem('pipelines', JSON.stringify(DEFAULT_PIPELINES));
      
      const firstPipeline = DEFAULT_PIPELINES[0];
      setSelectedPipeline(firstPipeline);
      updateStagesFromPipeline(firstPipeline);
      
      setToastMessage({ 
        title: 'Pipelines réinitialisés', 
        description: 'Les pipelines ont été restaurés à leur configuration par défaut', 
        type: 'success' 
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };


  const handleMoveColis = (targetStage) => {
    if (!colisToMove) return;
    
    const updatedList = colis.map(c => {
      if (c.id === colisToMove.id) {
         return { ...c, stage: targetStage };
      }
      return c;
    });
    setColis(updatedList);
    localStorage.setItem('colis', JSON.stringify(updatedList));
    setShowMoveModal(false);
    setColisToMove(null);
    
    setToastMessage({ title: 'Déplacé', description: 'Colis déplacé avec succès', type: 'success' });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };
  
  const handlePrintBonLivraison = (colisItem) => {
    window.print();
  };

  // --- RENDERING ---
  const filteredColis = colis.filter(item => {
    const matchesSearch = searchText === '' || 
      item.clientName?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.tel?.includes(searchText) ||
      item.productName?.toLowerCase().includes(searchText.toLowerCase());
      
    const matchesDate = searchDate === '' || item.dateCreated?.startsWith(searchDate);
    const matchesEmployee = selectedEmployee === 'all' || item.employee === selectedEmployee;
    
    // Filter by current pipeline
    const matchesPipeline = item.pipelineId === selectedPipeline?.id;
    
    // Debug logging
    if (!matchesPipeline) {
      console.log('❌ Colis filtered out:', item.clientName, 'Pipeline ID:', item.pipelineId, 'vs Selected:', selectedPipeline?.id);
    }
    
    return matchesSearch && matchesDate && matchesEmployee && matchesPipeline;
  });
  
  console.log('🔍 Total colis:', colis.length, '| Filtered:', filteredColis.length, '| Selected Pipeline ID:', selectedPipeline?.id);
  console.log('📋 Filtered colis stages:', filteredColis.map(c => `${c.clientName}: ${c.stage}`));
  console.log('🎯 Available stages:', stages.map(s => s.id));

  const getColisByStage = (stageName) => {
    return filteredColis.filter(c => {
      if (!c.stage) return false;
      
      // Normalize both stage names for comparison
      const normalizeStage = (name) => {
        let normalized = name
          .toLowerCase()
          .replace(/-ag$/i, '')     // Remove -AG suffix
          .replace(/é/g, 'e')       // Replace é with e
          .replace(/è/g, 'e')
          .replace(/ê/g, 'e')
          .trim();
        
        // Map common variations to standard names
        const mappings = {
          'confirme': 'confirmer',
          'confirmed': 'confirmer',
          'livre': 'livre',
          'delivered': 'livre',
          'annule': 'annuler',
          'cancelled': 'annuler',
          'canceled': 'annuler',
          'en cours': 'packaging',      // Map "En cours" to Packaging
          'nouveau': 'reporter',         // Map "Nouveau" to Reporter
          'out of delivery': 'out for delivery',
          'out of delevry': 'out for delivery'  // Fix typo
        };
        
        return mappings[normalized] || normalized;
      };
      
      const normalizedColisStage = normalizeStage(c.stage);
      const normalizedStageName = normalizeStage(stageName);
      
      const matches = normalizedColisStage === normalizedStageName;
      
      if (matches) {
        console.log(`✅ Match: "${c.stage}" matches "${stageName}"`);
      } else {
        console.log(`❌ No match: "${c.stage}" (normalized: "${normalizedColisStage}") vs "${stageName}" (normalized: "${normalizedStageName}")`);
      }
      
      return matches;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4">
      <div className="w-full mx-auto">
        {/* Header Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6 mb-6">
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white"><Package size={24} /></div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Livraison Ammex</h1>
                <p className="text-xs text-slate-500">Kanban Livraison Ammex</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
               <button onClick={handleRefresh} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors" title="Actualiser">
                 <RotateCw size={18} />
               </button>
               <button 
                 onClick={() => setShowAddModal(true)} 
                 className="px-6 py-2 text-white rounded-xl flex items-center gap-2 shadow-lg transition-all bg-blue-600 hover:bg-blue-700 shadow-blue-500/30"
               >
                 <Plus size={18} /> 
                 Ajouter Livraison Ammex
               </button>
            </div>
          </div>
          
          {/* Filters Row */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-6 gap-3">
             {/* Search */}
             <div className="relative md:col-span-2">
               <input 
                 type="text" 
                 value={searchText} 
                 onChange={e => setSearchText(e.target.value)} 
                 placeholder="Rechercher par nom, téléphone, produit..." 
                 className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
               />
               <SearchIcon className="absolute left-3 top-2.5 text-slate-400" size={18} />
             </div>
             
             {/* Date */}
             <input 
               type="date" 
               value={searchDate} 
               onChange={e => setSearchDate(e.target.value)} 
               className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
             />
             
             {/* Category Filter */}
             <select 
               value={selectedCategory}
               onChange={e => setSelectedCategory(e.target.value)}
               className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
             >
               <option value="all">Toutes catégories</option>
               <option value="cat1">Catégorie 1</option>
               <option value="cat2">Catégorie 2</option>
             </select>
             
             {/* Employee Filter */}
             <select 
               value={selectedEmployee}
               onChange={e => setSelectedEmployee(e.target.value)}
               className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
             >
               <option value="all">Tous employés</option>
               {EMPLOYEES.map(emp => (
                 <option key={emp} value={emp}>{emp}</option>
               ))}
             </select>
             
             {/* Business Filter */}
             <select 
               value={selectedBusiness}
               onChange={e => setSelectedBusiness(e.target.value)}
               className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
             >
               <option value="all">Tous business</option>
               {businesses.map(business => (
                 <option key={business} value={business}>{business}</option>
               ))}
             </select>
             
             {/* Project Filter - Disabled */}
             <select 
               className="px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
               disabled
             >
               <option>Projet</option>
             </select>
          </div>
        </div>

        {/* KANBAN BOARD */}
        <div className="flex flex-row gap-2 overflow-x-auto pb-4 px-1 min-h-[calc(100vh-250px)]">
          {stages.map((stage) => {
            const stageColis = getColisByStage(stage.id);
            const isReporterOrConfirmed = ['Reporter', 'Confirmé'].includes(stage.id);
            const canPrint = ['Packaging', 'Out for Delivery', 'Livré', 'Ramassé', 'En cours'].includes(stage.id);
            const showTracking = !isReporterOrConfirmed;
            // const showStatus = !isReporterOrConfirmed; // This variable is no longer needed

            return (
              <div key={stage.id} className="flex-1 min-w-[240px]" onDragOver={e => e.preventDefault()} onDrop={e => handleDrop(e, stage.id)}>
                <div className={`bg-white rounded-t-xl border-t-4 ${stage.color} p-3 shadow-sm flex justify-between`}>
                  <span className="font-bold text-slate-700">{stage.title}</span>
                  <span className="bg-slate-100 text-xs px-2 py-1 rounded-full font-bold">{stageColis.length}</span>
                </div>
                <div className={`${stage.bgColor} rounded-b-xl p-2 min-h-[500px] space-y-2 border-x border-b border-slate-200`}>
                  {stageColis.map((colisItem) => {
                    const product = products.find(p => p.id === colisItem.productId);
                    const ville = villes.find(v => v.id === colisItem.ville);
                    
                    // Check if date alert (for Reporter stage)
                    const hasDateAlert = stage.id === 'Reporter' && colisItem.dateReport && (() => {
                      const reportDate = new Date(colisItem.dateReport);
                      const now = new Date();
                      const hoursUntil = (reportDate - now) / (1000 * 60 * 60);
                      return hoursUntil <= 24 && hoursUntil >= 0;
                    })();
                    
                    // Unified Card Design
                    return (
                      <div 
                        key={colisItem.id} 
                        draggable
                        onDragStart={e => handleDragStart(e, colisItem)} 
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => handleLinkDrop(e, colisItem.id)}
                        className={`bg-white rounded-lg p-2.5 shadow-sm hover:shadow-md cursor-move border-2 transition-all group ${
                          hasDateAlert ? 'border-red-500 animate-pulse bg-red-50/10' : 'border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex gap-2 items-center">
                          {/* Product Image - Circle */}
                          <div className="w-10 h-10 rounded-full bg-slate-100 shrink-0 overflow-hidden border-2 border-white shadow-sm">
                            {product?.image ? (
                              <img src={product.image} className="w-full h-full object-cover" alt={product.nom} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package size={16} className="text-slate-400" />
                              </div>
                            )}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-xs truncate text-slate-800">{product?.nom || colisItem.productName}</h4>
                            <p className="text-[10px] text-slate-600 font-medium truncate">{colisItem.clientName}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[9px] text-slate-500 truncate flex items-center gap-0.5">
                                <MapPin size={8} /> {ville?.name || colisItem.ville}
                              </span>
                              <span className="text-[9px] text-slate-500">•</span>
                              <span className="text-[9px] text-slate-500">{colisItem.tel}</span>
                            </div>
                          </div>
                          
                          {/* Price & Actions */}
                          <div className="text-right flex flex-col items-end gap-0.5">
                            <p className="text-xs font-bold text-emerald-600 whitespace-nowrap">{colisItem.prix} DH</p>
                            
                            {hasDateAlert && (
                              <span className="text-[9px] text-red-600 font-bold flex items-center gap-0.5">
                                <AlertTriangle size={10} /> Urgent
                              </span>
                            )}
                            
                            {/* Actions Row */}
                            <div className="flex items-center gap-1 mt-1">
                              {canPrint && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handlePrintBonLivraison(colisItem); }}
                                  className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Imprimer"
                                >
                                  <Printer size={12} />
                                </button>
                              )}
                              
                              {showTracking && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setSelectedColisForTracking(colisItem); setShowTrackingModal(true); }}
                                  className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Voir Détails"
                                >
                                  <Eye size={12} />
                                </button>
                              )}

                              <button 
                                  onClick={(e) => { e.stopPropagation(); setColisToMove(colisItem); setShowMoveModal(true); }}
                                  className="md:hidden p-1.5 bg-slate-50 text-slate-500 hover:text-blue-600 rounded-lg border border-slate-200"
                              >
                                  <ArrowRight size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Date de relance for Reporter */}
                        {stage.id === 'Reporter' && colisItem.dateReport && (
                          <div className={`mt-2 pt-2 border-t ${hasDateAlert ? 'border-red-200' : 'border-slate-100'}`}>
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] text-slate-500 flex items-center gap-1">
                                <Calendar size={10} /> Relance:
                              </span>
                              <span className={`text-[10px] font-bold ${hasDateAlert ? 'text-red-600' : 'text-slate-700'}`}>
                                {new Date(colisItem.dateReport).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {stageColis.length === 0 && <div className="text-center p-8 text-slate-400 text-sm">Vide</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODALS */}
      {showAddModal && selectedPipeline?.name === 'Livreur Agadir' ? (
        <AddLogisticsModal 
          onClose={() => setShowAddModal(false)} 
          onAdd={handleAddColis} 
          employees={EMPLOYEES} 
          businesses={businesses} 
          products={products} 
          villes={villes} 
          quartiers={quartiers} 
          availableStages={stages} 
        />
      ) : showAddModal && (
        <AddCommercialModal 
          onClose={() => setShowAddModal(false)} 
          onAdd={handleAddColis} 
          employees={EMPLOYEES} 
          businesses={businesses} 
          products={products} 
          villes={villes} 
          quartiers={quartiers} 
          availableStages={stages} 
        />
      )}
      
      {showMoveModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xs p-4">
            <h3 className="font-bold text-lg mb-3">Déplacer vers...</h3>
            <div className="space-y-2">
              {stages.map(s => (
                <button key={s.id} onClick={() => handleMoveColis(s.id)} className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-sm font-medium transition-colors">
                  {s.title}
                </button>
              ))}
            </div>
            <button onClick={() => setShowMoveModal(false)} className="mt-4 w-full py-2 text-slate-400 hover:text-slate-600">Annuler</button>
          </div>
        </div>
      )}

      {showTrackingModal && selectedColisForTracking && (
        <TrackingModal
          colis={selectedColisForTracking}
          onClose={() => { setShowTrackingModal(false); setSelectedColisForTracking(null); }}
          products={products}
          villes={villes}
          quartiers={quartiers}
          handlePrint={() => handlePrintBonLivraison(selectedColisForTracking)}
        />
      )}

      {showToast && (
        <div className="fixed bottom-8 right-8 z-50 animate-slide-up">
          <div className={`px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 border ${toastMessage.type === 'warning' ? 'bg-amber-500 border-amber-600' : 'bg-emerald-600 border-emerald-700'} text-white`}>
            <CheckCircle className="w-6 h-6" />
            <div>
              <p className="font-bold">{toastMessage.title}</p>
              <p className="text-sm opacity-90">{toastMessage.description}</p>
            </div>
            <button onClick={() => setShowToast(false)} className="hover:bg-white/20 rounded-full p-1"><X size={18} /></button>
          </div>
        </div>
      )}
    </div>
  );
}

function AddCommercialModal({ onClose, onAdd, employees, businesses, products, villes, quartiers, availableStages }) {
  const [formData, setFormData] = useState({
    productId: '', productName: '', clientName: '', ville: '', quartier: '', tel: '', prix: '', 
    employee: employees[0] || '', business: businesses[0] || 'Herboclear',
    stage: 'Confirmé', commentaire: '', nbPiece: '1', dateReport: ''
  });

  const handleProductChange = (e) => {
    const p = products.find(pr => pr.id.toString() === e.target.value);
    setFormData({ ...formData, productId: e.target.value, productName: p?.nom || '', prix: p?.prix1 || '' });
  };

  const handleSubmit = () => {
    if(!formData.clientName || !formData.tel || !formData.productId) return alert("Champs obligatoires manquants");
    onAdd(formData);
  };

  const Label = ({ text }) => (
    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
      {text}
    </label>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Ajouter Client - Livraison Ammex</h2>
            <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition">
              <X size={20} />
            </button>
         </div>
         <div className="grid grid-cols-2 gap-4">
            
            <div className="col-span-2">
              <Label text="Produit" />
              <select className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.productId} onChange={handleProductChange}>
                 <option value="">Sélectionner...</option>{products.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
              </select>
            </div>
            
            <div>
              <Label text="Nom Client" />
              <input className="w-full p-3 bg-slate-50 border rounded-xl" placeholder="Ex: Mohamed" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} />
            </div>

            <div>
              <Label text="Téléphone" />
              <input className="w-full p-3 bg-slate-50 border rounded-xl" placeholder="06..." value={formData.tel} onChange={e => setFormData({...formData, tel: e.target.value})} />
            </div>
            
            <div>
              <Label text="Ville" />
              <select className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.ville} onChange={e => setFormData({...formData, ville: e.target.value})}>
                 <option value="">Sélectionner...</option>{villes.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            
            <div>
              <Label text="Quartier" />
              <input className="w-full p-3 bg-slate-50 border rounded-xl" placeholder="Quartier" value={formData.quartier} onChange={e => setFormData({...formData, quartier: e.target.value})} />
            </div>
            
            <div>
              <Label text="Prix (DH)" />
              <input className="w-full p-3 bg-slate-50 border rounded-xl" placeholder="0.00" value={formData.nbPiece > 1 ? (parseFloat(formData.prix || 0) * parseInt(formData.nbPiece)).toString() : formData.prix} onChange={e => setFormData({...formData, prix: e.target.value})} />
            </div>
            
            <div>
              <Label text="Nombre de pièces" />
              <input type="number" min="1" className="w-full p-3 bg-slate-50 border rounded-xl" placeholder="1" value={formData.nbPiece} onChange={e => setFormData({...formData, nbPiece: e.target.value})} />
            </div>
            
            <div className="col-span-2">
              <Label text="Statut" />
              <div className="flex gap-3 p-3 bg-slate-50 rounded-xl border">
                 <label className="flex gap-2 cursor-pointer items-center bg-white px-4 py-2 rounded-lg border shadow-sm flex-1 justify-center">
                     <input 
                         type="radio" 
                         name="stage"
                         checked={formData.stage === 'Confirmé'} 
                         onChange={() => setFormData({...formData, stage: 'Confirmé', dateReport: ''})} 
                         className="w-4 h-4 text-purple-600" 
                     /> 
                     <span className="font-bold text-sm text-slate-700">✓ Confirmé</span>
                 </label>
                 <label className="flex gap-2 cursor-pointer items-center bg-white px-4 py-2 rounded-lg border shadow-sm flex-1 justify-center">
                     <input 
                         type="radio" 
                         name="stage"
                         checked={formData.stage === 'Reporter'} 
                         onChange={() => setFormData({...formData, stage: 'Reporter'})} 
                         className="w-4 h-4 text-amber-600" 
                     /> 
                     <span className="font-bold text-sm text-slate-700">⏰ Reporter</span>
                 </label>
              </div>
            </div>
            
            {formData.stage === 'Reporter' && (
              <div className="col-span-2 animate-slide-up">
                <Label text="Date de Report" />
                <input type="datetime-local" className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.dateReport} onChange={e => setFormData({...formData, dateReport: e.target.value})} />
              </div>
            )}
            
            <div className="col-span-2">
              <Label text="Commentaire" />
              <textarea 
                className="w-full p-3 bg-slate-50 border rounded-xl" 
                placeholder="Notez quelque chose..." 
                rows="3"
                value={formData.commentaire} 
                onChange={e => setFormData({...formData, commentaire: e.target.value})} 
              />
            </div>
         </div>
         <div className="flex justify-end gap-3 mt-6">
            <button onClick={onClose} className="px-6 py-2 border rounded-xl hover:bg-slate-50">Annuler</button>
            <button onClick={handleSubmit} className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">Enregistrer</button>
         </div>
      </div>
    </div>
  );
}

function AddLogisticsModal({ onClose, onAdd, employees, businesses, products, villes, quartiers }) {
  const agadirVille = villes.find(v => v.name.toLowerCase() === 'agadir')?.id || 'Agadir';
  const defaultStage = 'Confirmé-AG';

  const [formData, setFormData] = useState({
    productId: '', productName: '', clientName: '', 
    ville: agadirVille, 
    quartier: '', tel: '', prix: '', 
    employee: employees[0] || '', business: businesses[0] || 'Herboclear',
    stage: defaultStage, 
    commentaire: '', nbPiece: '1', dateReport: ''
  });

  const handleProductChange = (e) => {
    const p = products.find(pr => pr.id.toString() === e.target.value);
    setFormData({ ...formData, productId: e.target.value, productName: p?.nom || '', prix: p?.prix1 || '' });
  };

  const handleSubmit = () => {
    if(!formData.clientName || !formData.tel || !formData.productId) return alert("Champs obligatoires manquants");
    onAdd(formData);
  };

  const Label = ({ text }) => (
    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
      {text}
    </label>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Truck className="text-emerald-600" size={24} /> 
              Ajouter Client - Livreur Agadir
            </h2>
            <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition">
              <X size={20} />
            </button>
         </div>
         <div className="grid grid-cols-2 gap-4">
            
            <div className="col-span-2">
              <Label text="Produit" />
              <select className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.productId} onChange={handleProductChange}>
                 <option value="">Sélectionner...</option>{products.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
              </select>
            </div>
            
            <div>
              <Label text="Nom Client" />
              <input className="w-full p-3 bg-slate-50 border rounded-xl" placeholder="Ex: Mohamed" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} />
            </div>

            <div>
              <Label text="Téléphone" />
              <input className="w-full p-3 bg-slate-50 border rounded-xl" placeholder="06..." value={formData.tel} onChange={e => setFormData({...formData, tel: e.target.value})} />
            </div>
            
            <div>
              <Label text="Quartier" />
              <input className="w-full p-3 bg-slate-50 border rounded-xl" placeholder="Quartier" value={formData.quartier} onChange={e => setFormData({...formData, quartier: e.target.value})} />
            </div>
            
            <div>
              <Label text="Prix (DH)" />
              <input className="w-full p-3 bg-slate-50 border rounded-xl" placeholder="0.00" value={formData.nbPiece > 1 ? (parseFloat(formData.prix || 0) * parseInt(formData.nbPiece)).toString() : formData.prix} onChange={e => setFormData({...formData, prix: e.target.value})} />
            </div>
            
            <div>
              <Label text="Nombre de pièces" />
              <input type="number" min="1" className="w-full p-3 bg-slate-50 border rounded-xl" placeholder="1" value={formData.nbPiece} onChange={e => setFormData({...formData, nbPiece: e.target.value})} />
            </div>
            
            <div className="col-span-2">
              <Label text="Statut" />
              <div className="flex gap-3 p-3 bg-slate-50 rounded-xl border">
                 <label className="flex gap-2 cursor-pointer items-center bg-white px-4 py-2 rounded-lg border shadow-sm flex-1 justify-center">
                     <input 
                         type="radio" 
                         name="stage-logistics"
                         checked={formData.stage === 'Confirmé-AG'} 
                         onChange={() => setFormData({...formData, stage: 'Confirmé-AG', dateReport: ''})} 
                         className="w-4 h-4 text-purple-600" 
                     /> 
                     <span className="font-bold text-sm text-slate-700">✓ Confirmé</span>
                 </label>
                 <label className="flex gap-2 cursor-pointer items-center bg-white px-4 py-2 rounded-lg border shadow-sm flex-1 justify-center">
                     <input 
                         type="radio" 
                         name="stage-logistics"
                         checked={formData.stage === 'Reporter-AG'} 
                         onChange={() => setFormData({...formData, stage: 'Reporter-AG'})} 
                         className="w-4 h-4 text-amber-600" 
                     /> 
                     <span className="font-bold text-sm text-slate-700">⏰ Reporter</span>
                 </label>
              </div>
            </div>
            
            {formData.stage === 'Reporter-AG' && (
              <div className="col-span-2 animate-slide-up">
                <Label text="Date de Report" />
                <input type="datetime-local" className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.dateReport} onChange={e => setFormData({...formData, dateReport: e.target.value})} />
              </div>
            )}
            
            <div className="col-span-2">
              <Label text="Commentaire" />
              <textarea 
                className="w-full p-3 bg-slate-50 border rounded-xl" 
                placeholder="Notez quelque chose..." 
                rows="3"
                value={formData.commentaire} 
                onChange={e => setFormData({...formData, commentaire: e.target.value})} 
              />
            </div>
         </div>
         <div className="flex justify-end gap-3 mt-6">
            <button onClick={onClose} className="px-6 py-2 border rounded-xl hover:bg-slate-50">Annuler</button>
            <button onClick={handleSubmit} className="px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700">Enregistrer Stock</button>
         </div>
      </div>
    </div>
  );
}

// --- TRACKING MODAL ---
function TrackingModal({ colis, onClose, products, villes, handlePrint }) {
  const [activeTab, setActiveTab] = useState('suivi');
  const product = products.find(p => p.id === colis.productId);
  const ville = villes.find(v => v.id === colis.ville);

  const stagesOrder = ['Reporter', 'Confirmé', 'Packaging', 'Out for Delivery', 'Livré'];
  const currentStepIndex = stagesOrder.indexOf(colis.stage);

  const tabs = [
    { id: 'suivi', label: 'Suivi', icon: MapPin },
    { id: 'expediteur', label: 'Expéditeur', icon: Building },
    { id: 'destinataire', label: 'Destinataire', icon: User },
    { id: 'livreur', label: 'Livreur', icon: Truck },
    { id: 'produit', label: 'Produit', icon: Package }
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><Eye size={24} /></div>
            <div><h2 className="text-xl font-bold text-slate-800">Détails & Suivi</h2><p className="text-sm text-slate-500">Colis #{colis.id}</p></div>
          </div>
          <div className="flex gap-2">
             <button onClick={handlePrint} className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-full transition-colors"><Printer size={20} /></button>
             <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={24} /></button>
          </div>
        </div>
        <div className="flex border-b border-slate-200 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'border-blue-600 text-blue-600 bg-blue-50/30' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/30">
          {activeTab === 'suivi' && (
            <div className="space-y-6">
              <h3 className="font-bold text-lg text-slate-800">Où se trouve votre colis ?</h3>
              <div className="relative pl-4 border-l-2 border-slate-200 space-y-8 my-6">
                {stagesOrder.map((stageName, index) => {
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  return (
                    <div key={stageName} className="relative pl-6">
                      <div className={`absolute -left-[21px] top-1 w-4 h-4 rounded-full border-2 ${isCompleted ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`} />
                      <div className={`${isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                        <span className={`font-bold text-base ${isCurrent ? 'text-blue-600' : ''}`}>{stageName}</span>
                        {isCurrent && <span className="ml-3 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-bold animate-pulse">Actuel</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {activeTab === 'expediteur' && (
            <div className="bg-white p-6 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 space-y-4">
              <InfoRow label="Entreprise / Business" value={colis.business || "Non spécifié"} />
              <InfoRow label="Responsable (Créateur)" value={colis.employee} />
              <InfoRow label="Date de création" value={new Date(colis.dateCreated).toLocaleDateString('fr-FR')} />
            </div>
          )}
          {activeTab === 'destinataire' && (
            <div className="bg-white p-6 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 space-y-4">
              <InfoRow label="Nom Complet" value={colis.clientName} />
              <InfoRow label="Téléphone" value={colis.tel} />
              <InfoRow label="Ville" value={ville?.name || colis.ville} />
              <InfoRow label="Quartier / Adresse" value={colis.quartier || "Non spécifié"} />
            </div>
          )}
          {activeTab === 'livreur' && (
            <div className="bg-white p-6 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 space-y-4">
              <InfoRow label="Livreur Assigné" value={colis.employee || "En attente d'assignation"} />
              <InfoRow label="Statut Actuel" value={colis.stage} />
              <InfoRow label="Note / Commentaire" value={colis.commentaire || "Aucun commentaire"} />
            </div>
          )}
          {activeTab === 'produit' && (
            <div className="bg-white p-6 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 space-y-4">
              <div className="flex gap-4">
                 {product?.image && <img src={product.image} alt="Produit" className="w-24 h-24 rounded-lg object-cover border" />}
                 <div className="flex-1 space-y-3">
                    <InfoRow label="Produit" value={product?.nom || colis.productName} />
                    <InfoRow label="Quantité" value={colis.nbPiece || 1} />
                    <InfoRow label="Prix Total" value={`${colis.prix} DH`} />
                 </div>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
           <button onClick={onClose} className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-medium transition-colors">Fermer</button>
        </div>
      </div>
    </div>
  );
}

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between border-b border-slate-50 last:border-0 pb-2 last:pb-0">
    <span className="text-slate-500 text-sm font-medium">{label}</span>
    <span className="text-slate-800 font-bold">{value}</span>
  </div>
);