import { createPortal } from 'react-dom';
import React, { useState, useEffect } from 'react';
import { 
  Plus, RotateCw, X, Package, AlertTriangle, Eye, Calendar, 
  CheckCircle, Search as SearchIcon, Printer, MapPin, User, Truck, Phone, Clock, Zap, ArrowRight
} from 'lucide-react';
import { productAPI, villeAPI, quartierAPI } from '../../../services/api';

const EMPLOYEES = ['Mohamed', 'Fatima', 'Youssef', 'Amina', 'Hassan', 'Khadija'];

// Default Pipelines (Backup)
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

export default function ConfirmationClients() {
  const [colis, setColis] = useState([]);
  const [products, setProducts] = useState([]);
  const [villes, setVilles] = useState([]);
  const [quartiers, setQuartiers] = useState([]);
  
  const [stages, setStages] = useState([]);
  const [pipelines, setPipelines] = useState([]);
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  
  const [colisToMove, setColisToMove] = useState(null);
  const [selectedColisForTracking, setSelectedColisForTracking] = useState(null);
  
  const [searchText, setSearchText] = useState('');
  
  // Filters for Agadir
  const [filterAgadirStage, setFilterAgadirStage] = useState('all');
  const [filterAgadirStartDate, setFilterAgadirStartDate] = useState('');
  const [filterAgadirEndDate, setFilterAgadirEndDate] = useState('');

  // Get Current User
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  // Toast
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

  const loadData = async () => {
    try {
      const [productsData, villesData, quartiersData] = await Promise.all([
        productAPI.getAll().catch(() => []),
        villeAPI.getAll().catch(() => []),
        quartierAPI.getAll().catch(() => [])
      ]);
      
      setProducts(productsData);
      setVilles(villesData);
      setQuartiers(quartiersData);

      const savedColis = localStorage.getItem('colis');
      if (savedColis) {
        setColis(JSON.parse(savedColis));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadPipelineStages = () => {
    const saved = localStorage.getItem('pipelines');
    let allPipelines = saved ? JSON.parse(saved) : [];
    
    // If no saved pipelines or old format, use defaults
    if (!allPipelines || allPipelines.length === 0 || !allPipelines[0].stages) {
      allPipelines = DEFAULT_PIPELINES;
      localStorage.setItem('pipelines', JSON.stringify(DEFAULT_PIPELINES));
    }
    
    setPipelines(allPipelines);
    const pipelineToUse = selectedPipeline || allPipelines[0];
    setSelectedPipeline(pipelineToUse);
    updateStagesFromPipeline(pipelineToUse);
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
    setStages(activeStages);
  };

  const handlePipelineChange = (pipelineId) => {
    const pipeline = pipelines.find(p => p.id === parseInt(pipelineId));
    if (!pipeline) return;

    setSelectedPipeline(pipeline);
    updateStagesFromPipeline(pipeline);
  };

  const handleRefresh = () => {
    loadData();
    setToastMessage({ title: 'Actualisé', description: 'Données rechargées', type: 'success' });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleAddColis = (newColis) => {
    const pipelineId = selectedPipeline?.id;
    const colisWithId = { 
      ...newColis, 
      id: Date.now().toString(),
      dateCreated: new Date().toISOString(),
      pipelineId: pipelineId,
      // Force assign to current employee if adding
      employee: currentUser.name || newColis.employee
    };
    
    const updatedList = [...colis, colisWithId];
    setColis(updatedList);
    localStorage.setItem('colis', JSON.stringify(updatedList));
    
    setShowAddModal(false);
    
    setToastMessage({ title: 'Succès', description: 'Colis ajouté avec succès', type: 'success' });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // --- DRAG AND DROP ---
  const handleDragStart = (e, colisItem) => {
    e.dataTransfer.setData('colisId', colisItem.id);
  };

  const handleDrop = (e, targetStageId) => {
    e.preventDefault();
    const colisId = e.dataTransfer.getData('colisId');
    const colisItem = colis.find(c => c.id === colisId);
    
    if (!colisItem) return;

    // RESTRICTION: Employee can only move between 'Reporter' and 'Confirmé'
    // Normalize names to check
    const isReporterOrConfirmedTarget = ['reporter', 'confirmed', 'confirmer', 'confirmé'].some(s => targetStageId.toLowerCase().includes(s));
    const isReporterOrConfirmedSource = ['reporter', 'confirmed', 'confirmer', 'confirmé'].some(s => colisItem.stage.toLowerCase().includes(s));

    // Actually, sticking to strict stage names from the pipeline might be safer, but let's use the normalized check logic or just simplified check
    // The stages in 'stages' state have IDs like 'Reporter', 'Confirmé', 'Packaging' etc.
    if (!['Reporter', 'Confirmé'].includes(targetStageId)) {
        setToastMessage({ 
            title: 'Action refusée', 
            description: 'Vous ne pouvez déplacer que vers Reporter ou Confirmé.', 
            type: 'warning' 
        });
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        return;
    }

    const updatedList = colis.map(c => {
      if (c.id === colisId) {
        return { 
          ...c, 
          stage: targetStageId,
          // Clear price if moving to confirmed? Admin logic had this.
          // prix: targetStageId === 'Confirmé' ? '' : c.prix 
          // User didn't explicitly ask to clear price, but usually confirmation involves price check. keeping it simple.
        };
      }
      return c;
    });

    setColis(updatedList);
    localStorage.setItem('colis', JSON.stringify(updatedList));
    
    setToastMessage({ title: 'Succès', description: 'Colis déplacé', type: 'success' });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleMoveColis = (targetStageId) => {
    if (!colisToMove) return;
    
    // Check permission (same as drag and drop)
    if (!['Reporter', 'Confirmé'].includes(targetStageId)) {
        setToastMessage({ 
            title: 'Action refusée', 
            description: 'Vous ne pouvez déplacer que vers Reporter ou Confirmé.', 
            type: 'warning' 
        });
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        return;
    }

    const updatedList = colis.map(c => {
      if (c.id === colisToMove.id) {
         return { ...c, stage: targetStageId };
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

  // --- FILTERING ---
  const filteredColis = colis.filter(c => {
    // 1. Employee Filter (STRICT: Only show my colis)
    if (currentUser.name && c.employee !== currentUser.name) return false;

    // 2. Search
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      const matchesName = c.clientName?.toLowerCase().includes(searchLower);
      const matchesPhone = c.tel?.toLowerCase().includes(searchLower);
      const matchesProduct = c.productName?.toLowerCase().includes(searchLower);
      if (!matchesName && !matchesPhone && !matchesProduct) return false;
    }

    return true;
  });

  // Separate colis by pipeline with additional filters
  const ammexColis = filteredColis.filter(c => c.pipelineId === 1);
  
  const agadirColis = filteredColis.filter(c => {
    if (c.pipelineId !== 2) return false;
    
    // Normalize stage for filtering (remove -AG suffix)
    const normalizeStage = (stage) => stage?.replace(/-AG$/i, '') || '';
    const normalizedColisStage = normalizeStage(c.stage);
    
    // Filter by stage
    if (filterAgadirStage !== 'all' && normalizedColisStage !== filterAgadirStage) return false;
    
    // Filter by date range
    if (filterAgadirStartDate || filterAgadirEndDate) {
      const colisDate = new Date(c.dateCreated);
      if (filterAgadirStartDate && colisDate < new Date(filterAgadirStartDate)) return false;
      if (filterAgadirEndDate) {
        const endDate = new Date(filterAgadirEndDate);
        endDate.setHours(23, 59, 59, 999);
        if (colisDate > endDate) return false;
      }
    }
    
    return true;
  });

  const getColisByStage = (stageName, pipelineId) => {
    const targetColis = pipelineId === 1 ? ammexColis : agadirColis;
    return targetColis.filter(c => {
      if (!c.stage) return false;
      
      // Normalize both stage names for comparison
      const normalizeStage = (name) => {
        let normalized = name
          .toLowerCase()
          .replace(/-ag$/i, '')
          .replace(/é/g, 'e')
          .replace(/è/g, 'e')
          .replace(/ê/g, 'e')
          .trim();
        
        const mappings = {
          'confirme': 'confirmer',
          'confirmed': 'confirmer',
          'livre': 'livre',
          'delivered': 'livre',
          'annule': 'annuler',
          'cancelled': 'annuler',
          'canceled': 'annuler',
          'en cours': 'packaging',
          'nouveau': 'reporter',
          'out of delivery': 'out for delivery',
          'out of delevry': 'out for delivery'
        };
        
        return mappings[normalized] || normalized;
      };
      
      const normalizedColisStage = normalizeStage(c.stage);
      const normalizedStageName = normalizeStage(stageName);
      
      return normalizedColisStage === normalizedStageName;
    });

  };

  // --- STATS CALCULATION ---
  const calculateDailyStats = () => {
    const today = new Date().toDateString();
    const myColis = filteredColis; 
    
    const confirmedToday = myColis.filter(c => 
       (c.stage === 'Confirmé' || c.stage === 'Confirmé-AG' || c.stage === 'Livré' || c.stage === 'Livré-AG') && 
       new Date(c.dateCreated).toDateString() === today 
    );

    const countToday = confirmedToday.length;

    // TIERED COMMISSION LOGIC
    // "3 prix par produit donc 3 comitions"
    const calculateCommission = (colisItem) => {
        const product = products.find(p => p.id === colisItem.productId);
        if (!product) return 10; // Default base

        // Example Logic: Deduce commission tier based on selling price
        // You can adjust these rules or use specific fields from 'product' if available
        const price = parseFloat(colisItem.prix);
        
        // Tier 1 (High Price)
        if (price >= (product.prixVente * 1.5)) return 25; 
        // Tier 2 (Standard Price)
        if (price >= product.prixVente) return 15;
        // Tier 3 (Low/Discount Price)
        return 10;
    };

    const estimatedEarnings = confirmedToday.reduce((total, c) => total + calculateCommission(c), 0);

    return { 
        confirmedToday: countToday, 
        totalActive: myColis.length, 
        estimatedEarnings 
    };
  };

  const stats = calculateDailyStats();

  return (
    <div className="min-h-screen bg-transparent p-4 font-sans dark:text-slate-200">
      <div className="w-full mx-auto max-w-[1800px]">
        
        {/* GAMIFIED DASHBOARD HEADER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 animate-in slide-in-from-top duration-500">
            {/* Card 1: Productivity (High Energy) */}
            <div className="glass-card bg-white dark:bg-gradient-to-br dark:from-violet-600/90 dark:to-purple-700/90 p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Zap size={100} className="text-teal-500 dark:text-yellow-300" /></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-teal-100 dark:bg-white/20 rounded-xl backdrop-blur-sm"><Zap size={20} className="text-teal-500 dark:text-yellow-300 fill-teal-500 dark:fill-yellow-300" /></div>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white">Productivité Fort ⚡</h3>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-5xl font-black tracking-tight text-teal-600 dark:text-white">{stats.confirmedToday}</span>
                        <span className="mb-2 font-medium text-slate-500 dark:text-purple-200">validations jour</span>
                    </div>
                    <div className="mt-4 bg-slate-100 dark:bg-black/20 rounded-full h-2 w-full overflow-hidden">
                        <div className="bg-teal-500 dark:bg-yellow-400 h-full rounded-full" style={{ width: `${Math.min(stats.confirmedToday * 10, 100)}%` }}></div>
                    </div>
                    <p className="text-xs mt-2 text-slate-500 dark:text-purple-200">Objectif: 10 🔥 - Keep Pushing!</p>
                </div>
            </div>

            {/* Card 2: Motivational Commission (Cagnotte) */}
            <div className="glass-card p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform">
                 <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-50 rounded-full group-hover:bg-emerald-100 transition-colors"></div>
                 <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600"><Truck size={20} /></div>
                        <h3 className="font-bold text-lg text-slate-800">Ma Cagnotte 💰</h3>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-5xl font-black tracking-tight text-emerald-600">{stats.estimatedEarnings}</span>
                        <span className="mb-2 font-bold text-emerald-600 text-xl">DH</span>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs mt-3">
                        <p className="font-bold text-slate-400 uppercase tracking-widest mb-2 text-[10px]">Structure Commission</p>
                        <div className="space-y-1.5 font-medium">
                            <div className="flex justify-between items-center text-slate-500">
                                <span>Prix 1</span>
                                <span className="font-bold">Commission 1</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-600">
                                <span>Prix 2</span>
                                <span className="font-bold">Commission 2</span>
                            </div>
                            <div className="flex justify-between items-center text-emerald-600">
                                <span>Prix 3</span>
                                <span className="font-bold">Commission 3</span>
                            </div>
                        </div>
                    </div>
                 </div>
            </div>
        </div>

        {/* LIVRAISON AGADIR */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white">
                <Truck size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Livraison Agadir</h2>
                <p className="text-xs text-slate-500">{agadirColis.length} colis</p>
              </div>
            </div>
            <button 
              onClick={() => { setSelectedPipeline(pipelines[1]); setShowAddModal(true); }} 
              className="px-4 py-2 bg-green-600 text-white rounded-xl flex items-center gap-2 shadow-lg shadow-green-500/30 hover:bg-green-700 transition-all"
            >
              <Plus size={18} /> Ajouter
            </button>
          </div>
          
          {/* Filters for Agadir */}
          <div className="flex flex-wrap gap-3 mb-4 p-4 bg-green-50/50 dark:bg-green-900/20 rounded-xl">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Recherche</label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input 
                  type="text" 
                  value={searchText} 
                  onChange={e => setSearchText(e.target.value)} 
                  placeholder="Nom, téléphone, produit..." 
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                />
              </div>
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Catégorie</label>
              <select 
                value={filterAgadirStage} 
                onChange={(e) => setFilterAgadirStage(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
              >
                <option value="all">Toutes les catégories</option>
                <option value="Reporter">Reporter</option>
                <option value="Confirmé">Confirmé</option>
                <option value="Packaging">Packaging</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Livré">Livré</option>
                <option value="Annulé">Annulé</option>
              </select>
            </div>
            <div className="flex-1 min-w-[160px]">
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Date début</label>
              <input 
                type="date" 
                value={filterAgadirStartDate} 
                onChange={(e) => setFilterAgadirStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div className="flex-1 min-w-[160px]">
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Date fin</label>
              <input 
                type="date" 
                value={filterAgadirEndDate} 
                onChange={(e) => setFilterAgadirEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
              />
            </div>
            {(filterAgadirStage !== 'all' || filterAgadirStartDate || filterAgadirEndDate) && (
              <button 
                onClick={() => { setFilterAgadirStage('all'); setFilterAgadirStartDate(''); setFilterAgadirEndDate(''); }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-all self-end"
              >
                Réinitialiser
              </button>
            )}
          </div>
          
          <div className="flex flex-row gap-2 overflow-x-auto pb-4 px-1 min-h-[400px]">
            {pipelines[1]?.stages.filter(s => s.active).map((stage) => {
              const stageColis = getColisByStage(stage.name, 2);
              const isReporterOrConfirmed = ['Reporter', 'Confirmé'].includes(stage.name);
              const canDrag = isReporterOrConfirmed;

              const checkUrgency = (item) => {
                if (stage.name !== 'Reporter' || !item.dateReport) return false;
                const reportDate = new Date(item.dateReport);
                const now = new Date();
                const hoursUntil = (reportDate - now) / (1000 * 60 * 60);
                return hoursUntil <= 24; 
              };

              if (stage.name === 'Reporter') {
                stageColis.sort((a, b) => {
                  const urgentA = checkUrgency(a);
                  const urgentB = checkUrgency(b);
                  if (urgentA && !urgentB) return -1;
                  if (!urgentA && urgentB) return 1;
                  return new Date(a.dateReport) - new Date(b.dateReport);
                });
              }

              return (
                <div key={stage.id} className="flex-1 min-w-[240px]" onDragOver={e => e.preventDefault()} onDrop={e => handleDrop(e, stage.name)}>
                  <div className={`frosted-panel !rounded-b-none border-t-4 ${stage.color} p-3 flex justify-between`}>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{stage.name}</span>
                    <span className="bg-slate-100 dark:bg-slate-800 text-xs px-2 py-1 rounded-full font-bold">{stageColis.length}</span>
                  </div>
                  <div className={`frosted-panel !rounded-t-none p-2 min-h-[500px] space-y-2`}>
                    {stageColis.map((colisItem) => {
                      const product = products.find(p => p.id === colisItem.productId);
                      const ville = villes.find(v => v.id === colisItem.ville);
                      const hasDateAlert = checkUrgency(colisItem);
                    
                    // Design A: Reporter & Confirmé
                    if (isReporterOrConfirmed) {
                      return (
                        <div 
                          key={colisItem.id} 
                          draggable={canDrag}
                          onDragStart={e => handleDragStart(e, colisItem)} 
                          className={`premium-card rounded-lg p-2.5 cursor-move transition-all ${
                            hasDateAlert ? 'border-2 border-red-500 animate-pulse !bg-red-50/20 dark:!bg-red-900/20' : ''
                          }`}
                        >
                          <div className="flex gap-2 items-center">
                            <div className="w-10 h-10 rounded-full bg-slate-100 shrink-0 overflow-hidden border-2 border-white shadow-sm">
                              {product?.image ? (
                                <img src={product.image} className="w-full h-full object-cover" alt={product.nom} />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center"><Package size={16} className="text-slate-400" /></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-xs truncate text-slate-800">{product?.nom || colisItem.productName}</h4>
                              <p className="text-[10px] text-slate-600 font-medium truncate">{colisItem.clientName}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] text-slate-500 truncate flex items-center gap-0.5"><MapPin size={8} /> {ville?.name || colisItem.ville}</span>
                                <span className="text-[9px] text-slate-500">•</span>
                                <span className="text-[9px] text-slate-500">{colisItem.tel}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-emerald-600 whitespace-nowrap">{colisItem.prix} DH</p>
                              {hasDateAlert && <span className="text-[9px] text-red-600 font-bold flex items-center gap-0.5 mt-0.5"><AlertTriangle size={10} /> Urgent</span>}
                              <button 
                                onClick={(e) => { e.stopPropagation(); setColisToMove(colisItem); setShowMoveModal(true); }}
                                className="md:hidden mt-2 p-1.5 bg-blue-50 text-blue-600 rounded-lg shadow-sm border border-blue-100"
                                title="Déplacer"
                              >
                                <ArrowRight size={14} />
                              </button>
                            </div>
                          </div>
                          
                          {stage.name === 'Reporter' && colisItem.dateReport && (
                            <div className={`mt-2 pt-2 border-t ${hasDateAlert ? 'border-red-200' : 'border-slate-100'}`}>
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] text-slate-500 flex items-center gap-1"><Calendar size={10} /> Relance:</span>
                                <span className={`text-[10px] font-bold ${hasDateAlert ? 'text-red-600' : 'text-slate-700'}`}>
                                  {new Date(colisItem.dateReport).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    } else {
                      // Design B: Other Stages (Read Only mostly for employee)
                      return (
                        <div 
                          key={colisItem.id} 
                          className="premium-card rounded-lg p-2.5 opacity-90"
                        >
                        <div className="flex gap-2 items-start">
                          <div className="w-10 h-10 rounded-full bg-slate-100 shrink-0 overflow-hidden border-2 border-white shadow-sm">
                            {product?.image ? <img src={product.image} className="w-full h-full object-cover" alt={product.nom} /> : <div className="w-full h-full flex items-center justify-center"><Package size={16} className="text-slate-400" /></div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-xs truncate text-slate-800">{product?.nom || colisItem.productName}</h4>
                            <p className="text-[10px] text-slate-600 font-medium truncate">{colisItem.clientName}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] text-slate-500 truncate flex items-center gap-0.5"><MapPin size={8} /> {ville?.name || colisItem.ville}</span>
                                <span className="text-[9px] text-slate-500">{colisItem.tel}</span>
                            </div>
                            <p className="text-xs font-bold text-emerald-600 mt-1">{colisItem.prix} DH</p>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                           <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[9px] font-bold"><Truck size={10} /> {colisItem.status || 'En cours'}</span>
                           <button 
                             onClick={() => { setSelectedColisForTracking(colisItem); setShowTrackingModal(true); }}
                             className="px-2 py-1 border border-blue-300 text-blue-600 hover:bg-blue-50 rounded text-[9px] font-bold transition-colors"
                           >
                             <Eye size={12} />
                           </button>
                        </div>
                      </div>
                    );
                    }
                  })}
                  {stageColis.length === 0 && <div className="text-center p-8 text-slate-400 dark:text-slate-500 text-sm">Vide</div>}
                </div>
              </div>
            );
            })}
          </div>
        </div>
        
        {/* Modals */}
        {showAddModal && (
          <AddClientModal 
             onClose={() => setShowAddModal(false)}
             onAdd={handleAddColis}
             employees={EMPLOYEES}
             currentUser={currentUser}
             products={products}
             villes={villes}
             quartiers={quartiers}
             isLogistics={selectedPipeline?.id === 2}
          />
        )}
        
        {showMoveModal && createPortal(
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-xs p-4 animate-in zoom-in-95 duration-200">
                <h3 className="font-bold text-lg mb-3">Déplacer vers...</h3>
                <div className="space-y-2">
                  {stages
                    .filter(s => ['Reporter', 'Confirmé'].includes(s.id)) // Only show allowed stages for employee
                    .map(s => (
                    <button key={s.id} onClick={() => handleMoveColis(s.id)} className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-sm font-medium transition-colors">
                      {s.title}
                    </button>
                  ))}
                </div>
                <button onClick={() => setShowMoveModal(false)} className="mt-4 w-full py-2 text-slate-400 hover:text-slate-600">Annuler</button>
              </div>
            </div>,
            document.body
        )}
        
        {showTrackingModal && selectedColisForTracking && (
          <TrackingModal 
             colis={selectedColisForTracking} 
             onClose={() => setShowTrackingModal(false)}
             products={products}
             villes={villes}
             quartiers={quartiers}
          />
        )}

        {showToast && (
          <div className="fixed bottom-8 right-8 z-50 animate-bounce">
            <div className={`px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 text-white ${toastMessage.type === 'warning' ? 'bg-amber-500' : 'bg-emerald-600'}`}>
              {toastMessage.type === 'warning' ? <AlertTriangle /> : <CheckCircle />}
              <div>
                <p className="font-bold">{toastMessage.title}</p>
                <p className="text-sm">{toastMessage.description}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Subcomponents
// Custom Input Component defined OUTSIDE to prevent focus loss
const InputGroup = ({ icon: Icon, children }) => (
  <div className="relative group">
     <div className="absolute left-3 top-3 text-slate-400 group-focus-within:text-pink-500 transition-colors pointer-events-none">
       <Icon size={18} />
     </div>
     {children}
  </div>
);

function AddClientModal({ onClose, onAdd, employees, currentUser, products, villes, quartiers, isLogistics }) {
  const [formData, setFormData] = useState({
    productId: '',
    productName: '',
    clientName: '',
    ville: isLogistics ? 'Agadir' : '',
    quartier: '',
    tel: '',
    prix: '',
    employee: currentUser.name || '',
    business: 'Commit',
    stage: isLogistics ? 'Reporter-AG' : 'Reporter',
    commentaire: '',
    nbPiece: '1',
    dateReport: ''
  });

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [quartiersAgadir, setQuartiersAgadir] = useState([]);
  
  const BUSINESSES = ['Commit', 'Herboclear', 'Other'];

  useEffect(() => {
    if (isLogistics) {
      // Load quartiers from settings for Agadir
      import('../../../services/api').then(({ settingsAPI }) => {
        const quartiers = settingsAPI.getQuartiersAgadir();
        setQuartiersAgadir(quartiers);
      });
    }
  }, [isLogistics]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
  };

  // Removed internal InputGroup definition from here to fix focus loss bug

  const inputClasses = "w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-400 transition-all font-medium text-slate-700 placeholder:text-slate-400";

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] w-full max-w-lg p-8 shadow-2xl shadow-purple-500/20 max-h-[90vh] overflow-y-auto scrollbar-hide">
        
        {/* Header Friendly */}
        <div className="text-center mb-8">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 shadow-lg ${isLogistics ? 'bg-emerald-100 text-emerald-600' : 'bg-pink-100 text-pink-600'}`}>
                {isLogistics ? <Truck size={32} /> : <User size={32} />}
            </div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {isLogistics ? 'Nouveau Colis Agadir' : 'Nouveau Colis'}
            </h2>
            <p className="text-slate-500 text-sm font-medium">Remplissez les infos ci-dessous ✨</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1: Client Info */}
            <div className="grid grid-cols-2 gap-4">
                 <InputGroup icon={User}>
                     <input 
                       required placeholder="Nom Client" 
                       className={inputClasses}
                       value={formData.clientName}
                       onChange={e => setFormData({...formData, clientName: e.target.value})}
                     />
                 </InputGroup>
                 <InputGroup icon={Phone}>
                     <input 
                       required placeholder="Téléphone" 
                       className={inputClasses}
                       value={formData.tel}
                       onChange={e => setFormData({...formData, tel: e.target.value})}
                     />
                 </InputGroup>
            </div>
            
            {/* Row 2: Product Info */}
            <div className="grid grid-cols-2 gap-4">
                 <div className="relative">
                    <div className="absolute left-3 top-3 text-slate-400"><Package size={18} /></div>
                    <select 
                       required
                       className={`${inputClasses} appearance-none cursor-pointer`}
                       value={formData.productId}
                       onChange={e => {
                         const p = products.find(pr => pr.id === e.target.value);
                         setFormData({...formData, productId: e.target.value, productName: p?.nom || '', prix: p?.prixVente || ''});
                       }}
                    >
                       <option value="">Produit</option>
                       {products.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
                    </select>
                 </div>
                 <InputGroup icon={CheckCircle}>
                     <input 
                       placeholder="Prix" 
                       className={inputClasses}
                       value={formData.prix}
                       onChange={e => setFormData({...formData, prix: e.target.value})}
                     />
                 </InputGroup>
            </div>

            {/* Row 3: Location */}
            <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                    <div className="absolute left-3 top-3 text-slate-400"><MapPin size={18} /></div>
                    <select 
                       className={`${inputClasses} appearance-none`}
                       value={formData.ville} 
                       onChange={e => setFormData({...formData, ville: e.target.value})}
                       disabled={isLogistics} 
                    >
                       <option value="">Ville</option>
                       {villes.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                       {isLogistics && <option value="Agadir">Agadir</option>}
                    </select>
                </div>

                <div className="relative">
                    <div className="absolute left-3 top-3 text-slate-400"><MapPin size={18} /></div>
                    <select 
                       required={isLogistics}
                       className={`${inputClasses} appearance-none`}
                       value={formData.quartier}
                       onChange={e => setFormData({...formData, quartier: e.target.value})}
                    >
                       <option value="">Quartier</option>
                       {isLogistics ? (
                         quartiersAgadir.map((q, idx) => <option key={idx} value={q}>{q}</option>)
                       ) : (
                         quartiers.filter(q => q.villeId === formData.ville).map(q => <option key={q.id} value={q.name}>{q.name}</option>)
                       )}
                    </select>
                </div>
            </div>
            
            {/* Row 4: Quantity */}
            <div className="grid grid-cols-1">
                <InputGroup icon={Package}>
                     <input 
                       type="number"
                       min="1"
                       placeholder="Nombre de pièces"
                       className={inputClasses}
                       value={formData.nbPiece}
                       onChange={e => setFormData({...formData, nbPiece: e.target.value})}
                     />
                </InputGroup>
            </div>

            {/* Row 5: Comment */}
            <div className="relative">
                <div className="absolute left-3 top-3 text-slate-400"><AlertTriangle size={18} /></div>
                <textarea 
                   placeholder="Un petit commentaire ? (optionnel)"
                   className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-400 transition-all font-medium text-slate-700 placeholder:text-slate-400 h-24 resize-none"
                   value={formData.commentaire}
                   onChange={e => setFormData({...formData, commentaire: e.target.value})}
                />
            </div>
            
            {/* Stage Selection - Switch for Agadir, Cards for Ammex */}
            <div className="bg-slate-50 p-4 rounded-2xl">
               <div className="flex items-center justify-between mb-3">
                 <label className="flex items-center gap-3 cursor-pointer">
                   <div className="relative">
                     <input 
                       type="checkbox" 
                       className="sr-only peer"
                       checked={isConfirmed} 
                       onChange={(e) => { 
                         setIsConfirmed(e.target.checked);
                         setFormData({
                           ...formData, 
                           stage: e.target.checked ? (isLogistics ? 'Confirmé-AG' : 'Confirmé') : (isLogistics ? 'Reporter-AG' : 'Reporter'),
                           dateReport: e.target.checked ? '' : formData.dateReport
                         });
                       }}
                     />
                     <div className="w-12 h-6 bg-slate-300 rounded-full peer-checked:bg-emerald-500 transition-all"></div>
                     <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                   </div>
                   <div className="flex items-center gap-2">
                     {isConfirmed ? (
                       <>
                         <CheckCircle size={20} className="text-emerald-600" />
                         <span className="font-bold text-emerald-600">Confirmé</span>
                       </>
                     ) : (
                       <>
                         <Calendar size={20} className="text-amber-600" />
                         <span className="font-bold text-amber-600">Reporter</span>
                       </>
                     )}
                   </div>
                 </label>
               </div>
            
            {/* Date Picker with Animation */}
            {!isConfirmed && (
              <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                  <InputGroup icon={Clock}>
                      <input 
                        type="datetime-local" 
                        required 
                        className="w-full pl-10 pr-4 py-3 bg-amber-50 border-2 border-amber-100 rounded-2xl text-amber-800 focus:ring-2 focus:ring-amber-400 focus:border-transparent font-bold transition-all"
                        value={formData.dateReport}
                        onChange={e => setFormData({...formData, dateReport: e.target.value})}
                      />
                  </InputGroup>
              </div>
            )}
            
            {/* Warning for Logistics */}
            {isLogistics && (
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex items-center gap-3 text-emerald-700">
                    <Truck size={20} />
                    <span className="text-sm font-bold">Ajout direct au pipeline Agadir 🚀</span>
                </div>
            )}
            
            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-dashed border-slate-200">
              <button 
                type="button" 
                onClick={onClose} 
                className="py-3 px-6 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                className={`py-3 px-6 rounded-2xl font-bold text-white shadow-lg shadow-purple-200 transform hover:-translate-y-1 transition-all ${
                    isLogistics 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                    : 'bg-gradient-to-r from-pink-500 to-purple-600'
                }`}
              >
                C'est parti ! 🚀
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

function TrackingModal({ colis, onClose, products, villes }) {
    const product = products.find(p => p.id === colis.productId);
    const ville = villes.find(v => v.id === colis.ville);
    
    return createPortal(
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Détails du Colis</h3>
                    <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-red-500"/></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-4">
                         <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden">
                             {product?.image ? <img src={product.image} className="w-full h-full object-cover"/> : <Package className="m-4 text-slate-400"/>}
                         </div>
                         <div>
                             <h4 className="font-bold text-lg">{product?.nom || colis.productName}</h4>
                             <p className="text-slate-500">{colis.clientName}</p>
                         </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-slate-50 p-3 rounded-lg"><p className="text-slate-500 text-xs">Téléphone</p><p className="font-bold">{colis.tel}</p></div>
                        <div className="bg-slate-50 p-3 rounded-lg"><p className="text-slate-500 text-xs">Ville</p><p className="font-bold">{ville?.name || colis.ville}</p></div>
                        <div className="bg-slate-50 p-3 rounded-lg"><p className="text-slate-500 text-xs">Prix</p><p className="font-bold text-emerald-600">{colis.prix} DH</p></div>
                        <div className="bg-slate-50 p-3 rounded-lg"><p className="text-slate-500 text-xs">Status</p><p className="font-bold text-blue-600">{colis.status || colis.stage}</p></div>
                    </div>
                    {colis.dateReport && (
                        <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                            <p className="text-amber-800 text-xs font-bold">Date de Report</p>
                            <p className="text-amber-900 font-mono">{new Date(colis.dateReport).toLocaleString()}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}