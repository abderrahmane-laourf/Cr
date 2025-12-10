import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, MapPin, Truck, CheckCircle, Clock, XCircle, 
  ChevronRight, Phone, User, MoreHorizontal, Package, AlertTriangle 
} from 'lucide-react';

export default function GlobalDispatchPage() {
  // --- REAL DATA LOADING ---
  const [colis, setColis] = useState([]);
  const [products, setProducts] = useState([]);
  const [villes, setVilles] = useState([]);
  const [pipelines, setPipelines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState('all');

  useEffect(() => {
    const loadData = () => {
      try {
        const storedColis = JSON.parse(localStorage.getItem('colis')) || [];
        const storedProducts = JSON.parse(localStorage.getItem('products')) || [];
        const storedVilles = JSON.parse(localStorage.getItem('villes')) || [];
        const storedPipelines = JSON.parse(localStorage.getItem('pipelines')) || [];
        
        // Filter ONLY for Agadir Pipeline (Pipeline ID 2)
        // We assume Pipeline 2 is "Livreur Agadir" based on previous context
        const agadirPipeline = storedPipelines.find(p => p.id === 2);
        
        // Filter colis that belong to this pipeline
        // Note: In your system, link depends on 'pipelineId' or stage name convention
        const agadirColis = storedColis.filter(c => {
             // If pipelineId exists, use it. OR check if stage ends with -AG
             return c.pipelineId === 2 || (c.stage && c.stage.endsWith('-AG'));
        });

        setColis(agadirColis);
        setProducts(storedProducts);
        setVilles(storedVilles);
        setPipelines(storedPipelines);
      } catch (error) {
        console.error("Error loading dispatch data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    // Refresh every 5s for "Real Time" feel
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  // --- DERIVED DATA & STATS ---
  const filteredParcels = colis.filter(p => {
    const product = products.find(prod => prod.id === p.productId);
    const productName = product?.nom || p.productName || '';
    
    const searchString = `${p.clientName} ${p.tel} ${p.id} ${productName} ${p.ville}`.toLowerCase();
    const matchSearch = searchString.includes(searchTerm.toLowerCase());
    const matchStage = filterStage === 'all' || p.stage === filterStage;
    
    return matchSearch && matchStage;
  });

  // Dashboard Counts
  const stats = {
    packaging: colis.filter(c => c.stage === 'Packaging-AG').length,
    road: colis.filter(c => c.stage === 'Out for Delivery-AG').length,
    delivered: colis.filter(c => c.stage === 'Livré-AG').length,
    postponed: colis.filter(c => c.stage === 'Reporter-AG').length,
    total: colis.length
  };

  // Helper for Status Badge
  const StatusBadge = ({ stage }) => {
    if (!stage) return <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-xs">Inconnu</span>;
    
    if (stage.includes('Livré')) return (
        <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1 w-fit">
            <CheckCircle size={10} /> Livré
        </span>
    );
    if (stage.includes('Packaging')) return (
        <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1 w-fit">
            <Package size={10} /> Packaging
        </span>
    );
    if (stage.includes('Out for Delivery')) return (
        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1 w-fit">
            <Truck size={10} /> En Route
        </span>
    );
    if (stage.includes('Reporter')) return (
        <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1 w-fit">
            <Clock size={10} /> Reporté
        </span>
    );
    if (stage.includes('Annulé')) return (
        <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1 w-fit">
            <XCircle size={10} /> Annulé
        </span>
    );

    return <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-full text-xs font-bold uppercase">{stage}</span>;
  };

  if (loading) return <div className="p-10 text-center">Chargement du Dispatch...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* --- DASHBOARD HEADER (AGADIR PIPELINE) --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
               <div className="flex items-center gap-3 text-slate-500 font-bold text-xs uppercase tracking-wider mb-2">
                   <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Package size={16}/></div>
                   À Préparer
               </div>
               <div className="text-3xl font-black text-slate-800">{stats.packaging}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
               <div className="flex items-center gap-3 text-slate-500 font-bold text-xs uppercase tracking-wider mb-2">
                   <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Truck size={16}/></div>
                   En Route
               </div>
               <div className="text-3xl font-black text-slate-800">{stats.road}</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 rounded-2xl shadow-lg shadow-emerald-500/20 text-white flex flex-col justify-between transform hover:scale-[1.02] transition-transform">
               <div className="flex items-center gap-3 text-emerald-100 font-bold text-xs uppercase tracking-wider mb-2">
                   <div className="p-2 bg-white/20 rounded-lg"><CheckCircle size={16}/></div>
                   Livrés (Succès)
               </div>
               <div className="text-3xl font-black">{stats.delivered}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
               <div className="flex items-center gap-3 text-slate-500 font-bold text-xs uppercase tracking-wider mb-2">
                   <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><AlertTriangle size={16}/></div>
                   Reportés
               </div>
               <div className="text-3xl font-black text-slate-800">{stats.postponed}</div>
          </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
         <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
               <Truck className="text-blue-600" /> Dispatch - Livreur Agadir
            </h1>
            <p className="text-slate-500 text-sm mt-1">Supervision temps réel des livraisons actives.</p>
         </div>
         <div className="flex items-center gap-3">
             <div className="px-4 py-2 bg-slate-50 rounded-xl text-slate-600 font-bold text-sm border border-slate-200">
                Total: {filteredParcels.length} colis
             </div>
         </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
             <input 
               type="text" 
               placeholder="Rechercher client, téléphone, ID..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium"
             />
          </div>
          
          <div className="relative">
             <select 
               value={filterStage} 
               onChange={(e) => setFilterStage(e.target.value)}
               className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium appearance-none cursor-pointer"
             >
                <option value="all">Tous les Statuts</option>
                <option value="Packaging-AG">📦 Packaging</option>
                <option value="Out for Delivery-AG">🚀 En Route</option>
                <option value="Livré-AG">✅ Livré</option>
                <option value="Reporter-AG">🕒 Reporté</option>
                <option value="Annulé-AG">❌ Annulé</option>
             </select>
             <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                     <th className="px-6 py-4">ID</th>
                     <th className="px-6 py-4">Client</th>
                     <th className="px-6 py-4">Produit</th>
                     <th className="px-6 py-4">Lieu</th>
                     <th className="px-6 py-4">Livreur</th>
                     <th className="px-6 py-4">Projet</th>
                     <th className="px-6 py-4">Prix</th>
                     <th className="px-6 py-4">Statut</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {filteredParcels.map(parcel => {
                      const product = products.find(p => p.id === parcel.productId);
                      const ville = villes.find(v => v.id === parcel.ville);
                      return (
                         <tr key={parcel.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 text-xs font-bold text-slate-400">#{parcel.id.substring(0, 8)}...</td>
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                     {parcel.clientName ? parcel.clientName.charAt(0).toUpperCase() : '?'}
                                  </div>
                                  <div>
                                     <div className="font-bold text-slate-800 text-sm">{parcel.clientName}</div>
                                     <div className="text-xs text-slate-500">{parcel.tel}</div>
                                  </div>
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-2">
                                 {product?.image && <img src={product.image} className="w-6 h-6 rounded-full object-cover" />}
                                 <span className="text-sm font-medium text-slate-700">{product?.nom || 'Inconnu'}</span>
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                  <MapPin size={14} className="text-slate-400" />
                                  <span>{parcel.quartier || ''}, {ville?.name || parcel.ville}</span>
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-2">
                                 <User size={14} className="text-slate-400" />
                                 <span className="text-sm font-bold text-slate-700">{parcel.employee || 'Non assigné'}</span>
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                                 {parcel.business || 'N/A'}
                               </span>
                            </td>
                            <td className="px-6 py-4">
                               <span className="text-sm font-extrabold text-slate-900 bg-slate-100 px-2 py-1 rounded">{parcel.prix} DH</span>
                            </td>
                            <td className="px-6 py-4">
                               <StatusBadge stage={parcel.stage} />
                            </td>
                         </tr>
                      );
                  })}
               </tbody>
            </table>
         </div>
         {filteredParcels.length === 0 && (
            <div className="p-10 text-center text-slate-400">
               <p>Aucun colis dans ce pipeline pour le moment.</p>
            </div>
         )}
      </div>
    </div>
  );
}
