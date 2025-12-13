import React, { useState, useEffect } from 'react';
import { 
  MapPin, Navigation, Phone, User, Truck, Package, 
  Clock, CheckCircle, XCircle, Filter, Search, RefreshCw, X 
} from 'lucide-react';
import SpotlightCard from '../../util/SpotlightCard';

const TrackingLivreur = () => {
  const [livreurs, setLivreurs] = useState([]);
  const [selectedLivreur, setSelectedLivreur] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadLivreurs();
    
    // Auto-refresh every 10 seconds if enabled
    if (autoRefresh) {
      const interval = setInterval(loadLivreurs, 10000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadLivreurs = () => {
    // Get all employees with role 'delivery' or 'livreur'
    const employees = JSON.parse(localStorage.getItem('employees')) || [];
    const deliveryEmployees = employees.filter(e => 
      e.role === 'delivery' || e.role === 'livreur'
    );

    // Get all colis for Agadir pipeline
    const colis = JSON.parse(localStorage.getItem('colis')) || [];
    const agadirColis = colis.filter(c => c.pipelineId === 2);

    // Map livreurs with their assigned packages and mock GPS data
    const livreursWithData = deliveryEmployees.map(emp => {
      const assignedPackages = agadirColis.filter(c => 
        c.employee === emp.name && 
        (c.stage === 'Out for Delivery-AG' || c.stage === 'Packaging-AG')
      );

      const deliveredPackages = agadirColis.filter(c => 
        c.employee === emp.name && 
        (c.stage === 'Livré-AG' || c.stage === 'Livré')
      );

      // Mock GPS coordinates (in a real app, this would come from a GPS tracking service)
      const mockGPS = {
        lat: 30.4278 + (Math.random() - 0.5) * 0.1, // Agadir area
        lng: -9.5981 + (Math.random() - 0.5) * 0.1,
        lastUpdate: new Date().toLocaleTimeString('fr-FR'),
        speed: Math.floor(Math.random() * 60), // km/h
        battery: Math.floor(Math.random() * 40) + 60, // 60-100%
      };

      return {
        ...emp,
        assignedPackages: assignedPackages.length,
        deliveredToday: deliveredPackages.length,
        gps: mockGPS,
        status: assignedPackages.length > 0 ? 'active' : 'idle',
      };
    });

    setLivreurs(livreursWithData);
  };

  return (
    <div className="w-full min-h-screen bg-transparent animate-[fade-in_0.6s_ease-out] p-8 font-sans text-slate-800 pb-20">
      {/* Header */}
      <SpotlightCard theme="light" className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
            <h1 className="text-3xl font-extrabold text-[#018790] flex items-center gap-3">
                <Navigation className="text-[#005461]" size={32} />
                Tracking du Livreur
            </h1>
            <p className="text-slate-500 mt-1 font-medium">
                Suivi GPS en temps réel • {livreurs.length} livreur(s) connectés
            </p>
            </div>
            
            {/* Auto Refresh Toggle */}
            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
            <label className="flex items-center gap-3 cursor-pointer select-none">
                <div className="relative">
                    <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#005461]"></div>
                </div>
                <span className="text-sm font-bold text-slate-600 flex items-center gap-1.5">
                <RefreshCw size={14} className={autoRefresh ? "animate-spin" : ""} />
                Auto-refresh
                </span>
            </label>
            </div>
        </div>
      </SpotlightCard>

      {/* Livreurs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {livreurs.map(livreur => (
          <SpotlightCard
            key={livreur.id}
            theme="light"
            className="!p-0 overflow-hidden cursor-pointer group hover:border-[#018790]/50 transition-all"
            onClick={() => setSelectedLivreur(livreur)}
          >
            {/* Card Header */}
            <div className={`p-6 border-b border-slate-100 ${
              livreur.status === 'active' 
                ? 'bg-gradient-to-r from-[#005461]/5 to-[#018790]/5' 
                : 'bg-slate-50/50'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#005461] font-bold shadow-sm ring-2 ring-white">
                    {livreur.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg group-hover:text-[#005461] transition-colors">{livreur.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">{livreur.phone}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  livreur.status === 'active'
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}>
                  {livreur.status === 'active' ? 'En tournée' : 'Disponible'}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">À livrer</p>
                  <p className="text-2xl font-extrabold text-[#005461]">{livreur.assignedPackages}</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Livrés</p>
                  <p className="text-2xl font-extrabold text-emerald-600">{livreur.deliveredToday}</p>
                </div>
              </div>
            </div>

            {/* GPS Info */}
            <div className="p-6 space-y-4 bg-white">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <MapPin size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Position GPS</p>
                  <p className="text-sm font-mono font-bold text-slate-700 truncate bg-slate-50 p-2 rounded-lg border border-slate-100">
                    {livreur.gps.lat.toFixed(6)}, {livreur.gps.lng.toFixed(6)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs font-medium text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-[#018790]" />
                  <span>{livreur.gps.lastUpdate}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Navigation size={14} className="text-[#018790]" />
                  <span>{livreur.gps.speed} km/h</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <a
                  href={`https://www.google.com/maps?q=${livreur.gps.lat},${livreur.gps.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 py-2.5 bg-[#005461] text-white rounded-xl hover:bg-[#016f76] transition-all flex items-center justify-center gap-2 text-sm font-bold shadow-md shadow-cyan-900/20"
                >
                  <MapPin size={16} />
                  Localiser
                </a>
                <a
                  href={`tel:${livreur.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors border border-slate-200"
                >
                  <Phone size={20} />
                </a>
              </div>
            </div>
          </SpotlightCard>
        ))}
      </div>

      {/* Empty State */}
      {livreurs.length === 0 && (
        <SpotlightCard theme="light" className="p-16 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
            <Truck className="text-slate-300" size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Aucun livreur trouvé</h3>
          <p className="text-slate-500">Modifiez vos filtres ou ajoutez des livreurs au système.</p>
        </SpotlightCard>
      )}

      {/* Selected Livreur Modal */}
      {selectedLivreur && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedLivreur(null)}
        >
          <SpotlightCard 
            theme="light"
            className="!p-0 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-[#005461] text-white p-6 z-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2"><Truck size={20}/> Détails du Livreur</h2>
                <button
                  onClick={() => setSelectedLivreur(null)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center text-3xl font-bold text-white shadow-xl">
                  {selectedLivreur.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{selectedLivreur.name}</h3>
                  <div className="flex items-center gap-2 mt-1 opacity-90">
                    <Phone size={14} />
                    <span className="text-sm">{selectedLivreur.phone}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-8 bg-white">
              {/* GPS Map with OpenStreetMap */}
              <div className="space-y-3">
                 <h4 className="font-bold text-[#005461] flex items-center gap-2 text-sm uppercase tracking-wide">
                    <MapPin size={16} /> Position en temps réel
                 </h4>
                 <div className="aspect-video bg-slate-100 rounded-2xl overflow-hidden border-2 border-slate-100 relative shadow-inner">
                    <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight="0"
                    marginWidth="0"
                    src={`https://maps.google.com/maps?q=${selectedLivreur.gps.lat},${selectedLivreur.gps.lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    title="Livreur Location Map"
                    className="opacity-90 hover:opacity-100 transition-opacity"
                    ></iframe>
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur p-2 rounded-lg shadow-sm text-xs font-bold text-[#005461] border border-[#005461]/10 flex items-center gap-2">
                     <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                     </span>
                    En direct
                    </div>
                 </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#005461]/5 p-4 rounded-2xl text-center border border-[#005461]/10">
                  <Package className="w-6 h-6 mx-auto mb-2 text-[#005461]" />
                  <p className="text-3xl font-extrabold text-[#005461]">{selectedLivreur.assignedPackages}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">À livrer</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-2xl text-center border border-emerald-100">
                  <CheckCircle className="w-6 h-6 mx-auto mb-2 text-emerald-600" />
                  <p className="text-3xl font-extrabold text-emerald-600">{selectedLivreur.deliveredToday}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Livrés</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100">
                  <Navigation className="w-6 h-6 mx-auto mb-2 text-slate-600" />
                  <p className="text-3xl font-extrabold text-slate-800">{selectedLivreur.gps.speed}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">km/h</p>
                </div>
              </div>

              {/* GPS Details */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <h4 className="font-bold text-[#005461] mb-4 text-sm uppercase tracking-wide">Informations Détaillées</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-slate-200/50">
                    <span className="text-slate-500 font-medium">Dernière mise à jour</span>
                    <span className="font-bold text-slate-700">{selectedLivreur.gps.lastUpdate}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-200/50">
                    <span className="text-slate-500 font-medium">Vitesse actuelle</span>
                    <span className="font-bold text-slate-700">{selectedLivreur.gps.speed} km/h</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-200/50">
                    <span className="text-slate-500 font-medium">Batterie Appareil</span>
                    <span className="font-bold text-slate-700">{selectedLivreur.gps.battery}%</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500 font-medium">Statut</span>
                    <span className={`font-bold px-2 py-0.5 rounded text-xs ${
                      selectedLivreur.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {selectedLivreur.status === 'active' ? 'EN TOURNÉE' : 'DISPONIBLE'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </SpotlightCard>
        </div>
      )}
    </div>
  );
};

export default TrackingLivreur;
