import React, { useState, useEffect } from 'react';
import { 
  Phone, MapPin, Check, X, Clock, Navigation, 
  ChevronDown, Search, Filter, RefreshCw, Plus, 
  User, Package, Truck, AlertTriangle, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- STAGE CONSTANTS ---
const STAGE_EN_ROUTE = 'Out for Delivery-AG';
const STAGE_LIVRE = 'Livré-AG';
const STAGE_REPORTE = 'Reporter-AG';
const STAGE_ANNULE = 'Annulé-AG';
const STAGE_PACKAGING = 'Packaging-AG';

// Mapping for UI
const STAGE_DISPLAY = {
  [STAGE_EN_ROUTE]: { label: 'En Route', color: 'bg-blue-100 text-blue-700' },
  [STAGE_LIVRE]: { label: 'Livré', color: 'bg-emerald-100 text-emerald-700' },
  [STAGE_REPORTE]: { label: 'Reporté', color: 'bg-amber-100 text-amber-700' },
  [STAGE_ANNULE]: { label: 'Annulé', color: 'bg-red-100 text-red-700' },
  [STAGE_PACKAGING]: { label: 'Packaging', color: 'bg-orange-100 text-orange-700' },
};

const ParcelCard = ({ parcel, onStatusChange, product }) => {
  const [expanded, setExpanded] = useState(false);

  const displayInfo = STAGE_DISPLAY[parcel.stage] || { label: parcel.stage, color: 'bg-slate-100 text-slate-700' };

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 mb-3 relative group transition-all ${
        parcel.stage === STAGE_LIVRE ? 'opacity-75' : ''
    }`}>
      {/* CARD HEADER / MAIN INFO */}
      <div className="flex gap-4" onClick={() => setExpanded(!expanded)}>
          {/* Image / Icon Placeholder */}
          <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 shrink-0 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
             {product?.image ? (
                <img src={product.image} className="w-full h-full object-cover" alt="prod" />
             ) : (
                <Package className="text-slate-300 dark:text-slate-600" size={24} />
             )}
          </div>
          
          <div className="min-w-0 flex-1">
             <div className="flex justify-between items-start">
                  <h4 className="font-bold text-sm truncate text-slate-900 dark:text-slate-100 leading-tight">{product?.nom || 'Produit'}</h4>
                  <p className="text-xs font-black text-slate-700 dark:text-slate-300 whitespace-nowrap">{parcel.prix} DH</p>
             </div>
             
             {/* Client Details */}
             <div className="mt-1 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                   <User size={12} className="text-slate-400 dark:text-slate-500" />
                   <span className="font-semibold truncate">{parcel.clientName}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                   <MapPin size={12} className="text-slate-400 dark:text-slate-500" />
                   <span className="truncate">{parcel.quartier || 'Agadir'}</span>
                </div>
             </div>
          </div>
      </div>
      
      {/* Status Badge */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50 dark:border-slate-800">
          <div className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 ${displayInfo.color} dark:bg-opacity-20`}>
             {parcel.stage === STAGE_LIVRE ? <Check size={12}/> : parcel.stage === STAGE_REPORTE ? <Clock size={12}/> : <Truck size={12}/>}
             {displayInfo.label}
          </div>
          <button onClick={() => setExpanded(!expanded)} className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
             {expanded ? 'Masquer' : 'Détails'}
          </button>
      </div>

      {/* EXPANDED ACTIONS */}
      {expanded && (
        <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-2">
            
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400 mb-4 px-1">
                <div className="flex items-center gap-2"><Phone size={14}/> {parcel.tel}</div>
                {parcel.commentaire && <div className="col-span-2 text-amber-600 dark:text-amber-500 flex items-center gap-1"><AlertCircle size={14}/> {parcel.commentaire}</div>}
            </div>

            {/* ACTION BUTTONS */}
            <div className="grid grid-cols-4 gap-2">
                <a href={`tel:${parcel.tel}`} className="flex flex-col items-center justify-center bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 p-3 rounded-2xl transition-colors">
                    <Phone size={20} />
                    <span className="text-[10px] font-bold mt-1">Appel</span>
                </a>
                <button className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 p-3 rounded-2xl transition-colors">
                    <Navigation size={20} />
                    <span className="text-[10px] font-bold mt-1">GPS</span>
                </button>
                <button 
                    onClick={() => onStatusChange(parcel.id, STAGE_REPORTE)} 
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-colors ${parcel.stage === STAGE_REPORTE ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-600 dark:text-amber-400'}`}
                >
                    <Clock size={20} />
                    <span className="text-[10px] font-bold mt-1">Reporter</span>
                </button>
                <button 
                    onClick={() => onStatusChange(parcel.id, STAGE_LIVRE)} 
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-colors ${parcel.stage === STAGE_LIVRE ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'}`}
                >
                    <Check size={20} />
                    <span className="text-[10px] font-bold mt-1">Livré</span>
                </button>
            </div>
            
             <button 
                onClick={() => onStatusChange(parcel.id, STAGE_ANNULE)} 
                className="w-full mt-3 py-2 text-xs font-bold text-red-400 dark:text-red-500 hover:text-red-500 dark:hover:text-red-400 flex items-center justify-center gap-1 transition-colors"
            >
                <X size={14} /> Annuler la livraison
            </button>
        </div>
      )}
    </div>
  );
};

export default function DeliveryRunPage() {
  const navigate = useNavigate();
  const [run, setRun] = useState([]);
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('active'); // active, delivered, all 
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: '', description: '', type: 'success' });
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // 1. Role Protection & Load User
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    setCurrentUser(user);
    // 2. Load Real Data
    loadRun(user);
  }, [navigate]);

  const loadRun = (user) => {
    const savedColis = JSON.parse(localStorage.getItem('colis')) || [];
    const savedProducts = JSON.parse(localStorage.getItem('products')) || [];
    
    setProducts(savedProducts);

    // Filter Logic for "My Run" - ONLY AGADIR PIPELINE (pipelineId = 2)
    let myRun = savedColis.filter(c => {
         // MUST be Agadir Pipeline (pipelineId === 2)
         if (c.pipelineId !== 2) return false;

         // Must be in Agadir Pipeline Stages
         const isAgadirStage = [STAGE_EN_ROUTE, STAGE_LIVRE, STAGE_REPORTE, STAGE_ANNULE, STAGE_PACKAGING].includes(c.stage);
         if (!isAgadirStage) return false;

         return true; 
    });

    setRun(myRun);
  };

  const showNotification = (title, description, type = 'success') => {
    setToastMessage({ title, description, type });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleStatusChange = (id, newStage) => {
     const saved = JSON.parse(localStorage.getItem('colis')) || [];
     const updatedColis = saved.map(c => {
       if (c.id === id) {
         return { ...c, stage: newStage };
       }
       return c;
     });
     localStorage.setItem('colis', JSON.stringify(updatedColis));
     loadRun(currentUser);
     showNotification('Mise à jour', `Statut changé : ${newStage}`);
     if(navigator.vibrate) navigator.vibrate(50);
  };

  const filteredRun = run.filter(p => {
    if (filter === 'active') return [STAGE_EN_ROUTE, STAGE_PACKAGING].includes(p.stage);
    if (filter === 'delivered') return [STAGE_LIVRE].includes(p.stage);
    if (filter === 'exceptions') return [STAGE_REPORTE, STAGE_ANNULE].includes(p.stage);
    return true;
  });

  return (
    <div className="pb-24 bg-transparent min-h-screen text-slate-800 dark:text-slate-200">
      <div className="w-full p-4">
       {/* Header */}
       <div className="flex items-center justify-between mb-6 pt-2">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <Truck className="text-orange-600" size={28} />
              Livraison Agadir
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Bonne route, {currentUser?.name} !</p>
          </div>
          <div className="flex gap-2">
              <button 
                onClick={() => {
                    const demoData = [
                        { id: Date.now() + 1, clientName: "Mouna Tazi", tel: "0600112233", ville: "Agadir", quartier: "Talborjt", prix: 300, stage: 'Out for Delivery-AG', dateCreated: new Date().toISOString(), productName: "Pack Cheveux", pipelineId: 2 },
                        { id: Date.now() + 2, clientName: "Karim Benani", tel: "0611223344", ville: "Agadir", quartier: "Hay Mohammadi", prix: 150, stage: 'Out for Delivery-AG', dateCreated: new Date().toISOString(), productName: "Savon Noir", pipelineId: 2 },
                        { id: Date.now() + 3, clientName: "Laila Alami", tel: "0622334455", ville: "Agadir", quartier: "Dakhla", prix: 450, stage: 'Livré-AG', dateCreated: new Date().toISOString(), productName: "Pack Complet", pipelineId: 2 },
                        { id: Date.now() + 4, clientName: "Ahmed Rifi", tel: "0633445566", ville: "Agadir", quartier: "Founty", prix: 200, stage: 'Out for Delivery-AG', dateCreated: new Date().toISOString(), productName: "Huile d'Argan", pipelineId: 2 }
                    ];
                    const existing = JSON.parse(localStorage.getItem('colis')) || [];
                    const newColis = [...existing, ...demoData];
                    localStorage.setItem('colis', JSON.stringify(newColis));
                    loadRun(currentUser);
                    showNotification('Mode Démo', `${demoData.length} colis exemples ajoutés !`);
                }}
                className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold text-xs active:scale-95 transition-transform"
              >
                + Test
              </button>
              <button onClick={() => loadRun(currentUser)} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 active:scale-95 transition-transform shadow-sm flex items-center justify-center"><RefreshCw size={20} className={filteredRun.length === 0 ? 'animate-spin' : ''}/></button>
          </div>
       </div>
       
       {/* Status Filters */}
       <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
             <button onClick={() => setFilter('active')} className={`flex-1 min-w-[100px] py-3 text-xs font-bold rounded-2xl transition-all border ${filter === 'active' ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                En Cours ({run.filter(r => [STAGE_EN_ROUTE, STAGE_PACKAGING].includes(r.stage)).length})
             </button>
             <button onClick={() => setFilter('delivered')} className={`flex-1 min-w-[100px] py-3 text-xs font-bold rounded-2xl transition-all border ${filter === 'delivered' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                Livrés ({run.filter(r => [STAGE_LIVRE].includes(r.stage)).length})
             </button>
             <button onClick={() => setFilter('exceptions')} className={`flex-1 min-w-[100px] py-3 text-xs font-bold rounded-2xl transition-all border ${filter === 'exceptions' ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                Autre ({run.filter(r => [STAGE_REPORTE, STAGE_ANNULE].includes(r.stage)).length})
             </button>
       </div>

       {/* List */}
       <div className="space-y-1 w-full text-slate-800 dark:text-slate-200">
          {filteredRun.map(parcel => (
             <ParcelCard 
                key={parcel.id} 
                parcel={parcel} 
                onStatusChange={handleStatusChange} 
                product={products.find(p => p.id === parcel.productId)}
             />
          ))}
          
          {filteredRun.length === 0 && (
             <div className="flex flex-col items-center justify-center py-20 text-slate-300 dark:text-slate-600">
                <Truck size={64} className="mb-4 opacity-20" />
                <p className="text-sm font-bold">Aucun colis dans cette liste.</p>
             </div>
          )}
       </div>

       {/* Toast */}
        {showToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-[90%] px-4">
          <div className={`px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border ${
            toastMessage.type === 'error' ? 'bg-red-500 border-red-600' : 'bg-slate-800 dark:bg-slate-950 border-slate-900 dark:border-slate-800'
          } text-white animate-in slide-in-from-bottom-5 fade-in duration-300`}>
            {toastMessage.type === 'error' ? <AlertTriangle size={24} /> : <Check size={24} />}
            <div>
              <p className="font-bold text-base">{toastMessage.title}</p>
              <p className="text-xs font-medium opacity-80">{toastMessage.description}</p>
            </div>
          </div>
        </div>
       )}
      </div>
    </div>
  );
}
