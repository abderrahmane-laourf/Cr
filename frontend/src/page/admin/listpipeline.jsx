import React, { useState, useEffect } from 'react';
import { 
  Plus, RotateCw, X, Package, AlertTriangle, Eye, Calendar, 
  CheckCircle, Search as SearchIcon, Printer, MapPin, User, Truck, Building, Phone, Clock
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    let allPipelines = saved ? JSON.parse(saved) : [];
    if (allPipelines.length === 0) allPipelines = [DEFAULT_PIPELINE];
    
    setPipelines(allPipelines);
    const pipelineToUse = selectedPipeline || allPipelines[0];
    setSelectedPipeline(pipelineToUse);
    updateStagesFromPipeline(pipelineToUse);
  };

  const updateStagesFromPipeline = (pipeline) => {
    const activeStages = pipeline.stages
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
      updateStagesFromPipeline(pipeline);
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
  };

  const handleDrop = (e, targetStage) => {
    e.preventDefault();
    const colisId = e.dataTransfer.getData('colisId');
    const colisToUpdate = colis.find(c => c.id.toString() === colisId.toString());

    if (!colisToUpdate || colisToUpdate.stage === targetStage) return;

    let updatedColisData = null;
    setColis(prevColis => 
      prevColis.map(c => {
        if (c.id.toString() === colisId.toString()) {
          const newColis = { ...c, stage: targetStage };
          if (targetStage === 'Confirmé') {
            newColis.prix = ''; 
            newColis.dateReport = ''; 
          }
          updatedColisData = newColis;
          return newColis;
        }
        return c;
      })
    );

    if(updatedColisData) {
        const newColisList = colis.map(c => c.id === colisId ? updatedColisData : c);
        localStorage.setItem('colis', JSON.stringify(newColisList));
    }

    setToastMessage({
      title: 'Mise à jour réussie',
      description: `Le colis de ${colisToUpdate.clientName} est passé à ${targetStage}`,
      type: 'success'
    });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleAddColis = (newColis) => {
    const updatedList = [...colis, { 
      ...newColis, 
      id: Date.now().toString(),
      dateCreated: new Date().toISOString()
    }];
    setColis(updatedList);
    localStorage.setItem('colis', JSON.stringify(updatedList));
    setShowAddModal(false);
    setToastMessage({ title: 'Succès', description: 'Client ajouté', type: 'success' });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleRefresh = () => {
    loadData();
    loadPipelineStages();
    setToastMessage({ title: 'Actualisé', description: 'Données mises à jour', type: 'success' });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleMoveColis = (targetStage) => {
    if (!colisToMove) return;
    const updatedList = colis.map(c => {
        if(c.id === colisToMove.id) {
            const updated = { ...c, stage: targetStage };
            if(targetStage === 'Confirmé') updated.dateReport = '';
            return updated;
        }
        return c;
    });
    setColis(updatedList);
    localStorage.setItem('colis', JSON.stringify(updatedList));
    setToastMessage({ title: 'Déplacé', description: `${colisToMove.clientName} → ${targetStage}`, type: 'success' });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
    setShowMoveModal(false);
    setColisToMove(null);
  };

  // --- PRINT FUNCTION ---
  const handlePrintBonLivraison = (colisItem) => {
    const product = products.find(p => p.id === colisItem.productId);
    const ville = villes.find(v => v.id === colisItem.ville);

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Bon de Livraison - ${colisItem.clientName}</title>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #2563EB; }
            .invoice-info { text-align: right; }
            .grid { display: flex; gap: 40px; margin-bottom: 40px; }
            .box { flex: 1; border: 1px solid #ddd; padding: 20px; border-radius: 8px; }
            .box h3 { border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 0; color: #555; }
            table { w-full; width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background: #f8f9fa; text-align: left; padding: 12px; border-bottom: 2px solid #ddd; }
            td { padding: 12px; border-bottom: 1px solid #eee; }
            .total { text-align: right; font-size: 20px; font-weight: bold; margin-top: 20px; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 20px; }
            .barcode { text-align: center; margin: 20px 0; border: 1px solid #000; padding: 10px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">${colisItem.business || 'VOTRE ENTREPRISE'}</div>
            <div class="invoice-info">
              <h1>BON DE LIVRAISON</h1>
              <p>N° CMD: #${colisItem.id.slice(-6)}</p>
              <p>Date: ${new Date().toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
          <div class="grid">
            <div class="box">
              <h3>EXPÉDITEUR</h3>
              <p><strong>${colisItem.business || 'Entreprise'}</strong></p>
              <p>Responsable: ${colisItem.employee}</p>
              <p>Entrepôt Central</p>
            </div>
            <div class="box">
              <h3>DESTINATAIRE</h3>
              <p><strong>${colisItem.clientName}</strong></p>
              <p>${colisItem.tel}</p>
              <p>${colisItem.quartier || ''}</p>
              <p>${ville?.name || colisItem.ville}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Désignation</th>
                <th>Quantité</th>
                <th>Prix Unitaire</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${product?.nom || colisItem.productName}</td>
                <td>${colisItem.nbPiece || 1}</td>
                <td>${colisItem.prix} DH</td>
                <td>${colisItem.prix} DH</td>
              </tr>
            </tbody>
          </table>
          <div class="total">TOTAL À PAYER: ${colisItem.prix} DH</div>
          <div style="text-align: center; margin-top: 40px;">
            <div class="barcode">||| |||| || ||||| |||| || ||| ${colisItem.id}</div>
            <p>Signature du client</p>
          </div>
          <div class="footer">Merci de votre confiance !</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // --- RENDERING & SORTING ---
  const filteredColis = colis.filter(c => {
    if (selectedEmployee !== 'all' && c.employee !== selectedEmployee) return false;
    if (searchText) {
      const lower = searchText.toLowerCase();
      return c.clientName?.toLowerCase().includes(lower) || c.tel?.includes(lower) || c.productName?.toLowerCase().includes(lower);
    }
    if (searchDate) {
      return c.dateCreated?.startsWith(searchDate);
    }
    return true;
  });

  const sortedColis = [...filteredColis].sort((a, b) => {
    // 1. Alerts come first (Overdue or Soon)
    const alertA = getAlerts(a);
    const alertB = getAlerts(b);
    if (alertA && !alertB) return -1;
    if (!alertA && alertB) return 1;

    // 2. If both are in Reporter stage, sort by DateReport ascending
    if (a.stage === 'Reporter' && b.stage === 'Reporter') {
        if (!a.dateReport) return 1;
        if (!b.dateReport) return -1;
        return new Date(a.dateReport) - new Date(b.dateReport);
    }

    // 3. Default sort by creation date (Newest first)
    return new Date(b.dateCreated) - new Date(a.dateCreated);
  });

  const getColisByStage = (stageId) => sortedColis.filter(c => c.stage === stageId);

  return (
    <div className="min-h-screen bg-slate-50/50 p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Header Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6 mb-6">
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white"><Package size={24} /></div>
              <h1 className="text-2xl font-bold text-slate-900">Gestion des Colis</h1>
            </div>
            <div className="flex gap-2 flex-wrap">
               {/* Pipeline Selector */}
               <select 
                 value={selectedPipeline?.id || ''} 
                 onChange={e => handlePipelineChange(e.target.value)} 
                 className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
               >
                 {pipelines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
               </select>
               
               <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                 <option value="all">Tous les employés</option>
                 {EMPLOYEES.map(e => <option key={e} value={e}>{e}</option>)}
               </select>
               <button onClick={handleRefresh} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"><RotateCw size={18} /></button>
               <button onClick={() => setShowAddModal(true)} className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all"><Plus size={18} /> Ajouter</button>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
             <div className="relative flex-1">
               <input type="text" value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="Rechercher par nom, téléphone, produit..." className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
               <SearchIcon className="absolute left-3 top-2.5 text-slate-400" size={18} />
             </div>
             <input type="date" value={searchDate} onChange={e => setSearchDate(e.target.value)} className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          </div>
        </div>

        {/* KANBAN BOARD */}
        <div className="flex flex-row gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-200px)]">
          {stages.map((stage) => {
            const stageColis = getColisByStage(stage.id);
            
            // Logic vars
            const isReporterOrConfirmed = ['Reporter', 'Confirmé'].includes(stage.id);
            const canPrint = ['Packaging', 'Out for Delivery', 'Livré'].includes(stage.id);
            const showTracking = !isReporterOrConfirmed;
            const showStatus = !isReporterOrConfirmed;

            return (
              <div key={stage.id} className="flex-shrink-0 w-80" onDragOver={e => e.preventDefault()} onDrop={e => handleDrop(e, stage.id)}>
                <div className={`bg-white rounded-t-xl border-t-4 ${stage.color} p-3 shadow-sm flex justify-between`}>
                  <span className="font-bold text-slate-700">{stage.title}</span>
                  <span className="bg-slate-100 text-xs px-2 py-1 rounded-full font-bold">{stageColis.length}</span>
                </div>
                <div className={`${stage.bgColor} rounded-b-xl p-2 min-h-[600px] space-y-2 border-x border-b border-slate-200`}>
                  {stageColis.map((colisItem) => {
                    const alert = getAlerts(colisItem);
                    const product = products.find(p => p.id === colisItem.productId);
                    const ville = villes.find(v => v.id === colisItem.ville);
                    
                    return (
                      <div key={colisItem.id} draggable onDragStart={e => handleDragStart(e, colisItem)} className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md cursor-move border border-slate-200 group">
                        <div className="flex gap-3">
                           <div className="w-12 h-12 rounded-lg bg-slate-100 shrink-0 overflow-hidden">
                             {product?.image ? <img src={product.image} className="w-full h-full object-cover"/> : <Package className="m-3 text-slate-400"/>}
                           </div>
                           <div className="min-w-0 flex-1">
                             <h4 className="font-bold text-sm truncate">{product?.nom}</h4>
                             
                             {/* CLIENT INFO */}
                             <div className="mt-1 flex flex-col gap-0.5">
                                <div className="flex items-center gap-1 text-[11px] text-slate-600">
                                   <User size={10} className="text-slate-400" />
                                   <span className="font-semibold truncate">{colisItem.clientName}</span>
                                </div>
                                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                                   <Phone size={10} className="text-slate-400" />
                                   <span>{colisItem.tel}</span>
                                </div>
                                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                                   <MapPin size={10} className="text-slate-400" />
                                   <span className="truncate">{ville?.name} {colisItem.quartier ? `- ${colisItem.quartier}` : ''}</span>
                                </div>
                             </div>

                             <div className="flex items-center justify-between mt-2">
                                <p className="text-xs font-bold text-emerald-600">{colisItem.prix} DH</p>
                                
                                {/* Status Icon */}
                                {showStatus && (
                                  <div className="flex items-center gap-1 bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-medium">
                                    <Truck size={10} />
                                    <span className="max-w-[60px] truncate">{colisItem.status || 'En cours'}</span>
                                  </div>
                                )}
                             </div>
                           </div>
                           {alert && <AlertTriangle className="text-amber-500 w-4 h-4" />}
                        </div>

                        {/* DATE CONFIRMATION (REPORTER ONLY) */}
                        {stage.id === 'Reporter' && colisItem.dateReport && (
                           <div className="mt-2 flex items-center justify-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 p-2 rounded-lg border border-slate-200">
                              <Clock size={14} className="text-slate-500" />
                              <span>{new Date(colisItem.dateReport).toLocaleDateString('fr-FR', {day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'})}</span>
                           </div>
                        )}
                        
                        <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center">
                           <span className="text-[10px] text-slate-400">{colisItem.employee}</span>
                           <div className="flex gap-1">
                              <button onClick={() => { setColisToMove(colisItem); setShowMoveModal(true); }} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 md:hidden"><RotateCw size={14} /></button>
                              
                              {canPrint && (
                                <button onClick={() => handlePrintBonLivraison(colisItem)} className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded transition-colors" title="Imprimer Bon">
                                  <Printer size={14} />
                                </button>
                              )}
                              
                              {showTracking && (
                                <button onClick={() => { setSelectedColisForTracking(colisItem); setShowTrackingModal(true); }} className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded transition-colors" title="Voir le suivi">
                                  <Eye size={14} />
                                </button>
                              )}
                           </div>
                        </div>
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
      {showAddModal && <AddClientModal onClose={() => setShowAddModal(false)} onAdd={handleAddColis} employees={EMPLOYEES} businesses={businesses} products={products} villes={villes} quartiers={quartiers} />}
      
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

// --- ADD CLIENT MODAL WITH LABELS ---
function AddClientModal({ onClose, onAdd, employees, businesses, products, villes, quartiers }) {
  const [formData, setFormData] = useState({
    productId: '', productName: '', clientName: '', ville: '', quartier: '', 
    tel: '', prix: '', employee: employees[0] || '', business: businesses[0] || 'Herboclear',
    stage: 'Reporter', commentaire: '', nbPiece: '1', dateReport: ''
  });
  const [isReporter, setIsReporter] = useState(true);
  const [isConfirmed, setIsConfirmed] = useState(false);

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
            <h2 className="text-xl font-bold">Ajouter un Colis</h2>
            <button onClick={onClose}><X className="text-slate-400" /></button>
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
              <input className="w-full p-3 bg-slate-50 border rounded-xl" placeholder="0.00" value={formData.prix} onChange={e => setFormData({...formData, prix: e.target.value})} />
            </div>
            
            <div>
              <Label text="Nombre de pièces" />
              <input type="number" min="1" className="w-full p-3 bg-slate-50 border rounded-xl" placeholder="1" value={formData.nbPiece} onChange={e => setFormData({...formData, nbPiece: e.target.value})} />
            </div>
            
            <div className="col-span-2">
              <Label text="Statut Initial" />
              <div className="flex gap-4 p-3 bg-slate-50 rounded-xl border">
                 <label className="flex gap-2 cursor-pointer items-center"><input type="checkbox" checked={isReporter} onChange={e => {setIsReporter(true); setIsConfirmed(false); setFormData({...formData, stage: 'Reporter'})}} className="w-4 h-4" /> <span className="font-medium text-slate-700">Reporter</span></label>
                 <label className="flex gap-2 cursor-pointer items-center"><input type="checkbox" checked={isConfirmed} onChange={e => {setIsConfirmed(true); setIsReporter(false); setFormData({...formData, stage: 'Confirmé'})}} className="w-4 h-4" /> <span className="font-medium text-slate-700">Confirmé</span></label>
              </div>
            </div>
            
            {isReporter && (
              <div className="col-span-2">
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
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <InfoRow label="Entreprise / Business" value={colis.business || "Non spécifié"} />
              <InfoRow label="Responsable (Créateur)" value={colis.employee} />
              <InfoRow label="Date de création" value={new Date(colis.dateCreated).toLocaleDateString('fr-FR')} />
            </div>
          )}
          {activeTab === 'destinataire' && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <InfoRow label="Nom Complet" value={colis.clientName} />
              <InfoRow label="Téléphone" value={colis.tel} />
              <InfoRow label="Ville" value={ville?.name || colis.ville} />
              <InfoRow label="Quartier / Adresse" value={colis.quartier || "Non spécifié"} />
            </div>
          )}
          {activeTab === 'livreur' && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <InfoRow label="Livreur Assigné" value={colis.employee || "En attente d'assignation"} />
              <InfoRow label="Statut Actuel" value={colis.stage} />
              <InfoRow label="Note / Commentaire" value={colis.commentaire || "Aucun commentaire"} />
            </div>
          )}
          {activeTab === 'produit' && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
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