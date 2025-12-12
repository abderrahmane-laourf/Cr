import React, { useState, useEffect } from 'react';
import { 
  MapPin, Navigation, Phone, User, Truck, Package, 
  Clock, CheckCircle, XCircle, Filter, Search, RefreshCw 
} from 'lucide-react';

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
    <div className="space-y-4 sm:space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Navigation className="text-blue-600" size={28} />
            Tracking du Livreur
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Suivi GPS en temps réel • {livreurs.length} livreur(s)
          </p>
        </div>
        
        {/* Auto Refresh Toggle */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-xs sm:text-sm font-medium text-slate-600 flex items-center gap-1">
              <RefreshCw size={14} />
              Auto-refresh (10s)
            </span>
          </label>
        </div>
      </div>

      {/* Livreurs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {livreurs.map(livreur => (
          <div
            key={livreur.id}
            onClick={() => setSelectedLivreur(livreur)}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-blue-300 transition-all cursor-pointer overflow-hidden"
          >
            {/* Header */}
            <div className={`p-4 sm:p-5 border-b border-slate-100 ${
              livreur.status === 'active' 
                ? 'bg-gradient-to-r from-blue-50 to-emerald-50' 
                : 'bg-slate-50'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
                    {livreur.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">{livreur.name}</h3>
                    <p className="text-xs text-slate-500">{livreur.phone}</p>
                  </div>
                </div>
                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold ${
                  livreur.status === 'active'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {livreur.status === 'active' ? 'En tournée' : 'Disponible'}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-2 sm:p-3 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">À livrer</p>
                  <p className="text-lg sm:text-xl font-bold text-blue-600">{livreur.assignedPackages}</p>
                </div>
                <div className="bg-white p-2 sm:p-3 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Livrés</p>
                  <p className="text-lg sm:text-xl font-bold text-emerald-600">{livreur.deliveredToday}</p>
                </div>
              </div>
            </div>

            {/* GPS Info */}
            <div className="p-4 sm:p-5 space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="text-blue-600 mt-0.5 flex-shrink-0" size={18} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 mb-1">Position GPS</p>
                  <p className="text-xs sm:text-sm font-mono text-slate-700 truncate">
                    {livreur.gps.lat.toFixed(6)}, {livreur.gps.lng.toFixed(6)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{livreur.gps.lastUpdate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Navigation size={14} />
                  <span>{livreur.gps.speed} km/h</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <a
                  href={`https://www.google.com/maps?q=${livreur.gps.lat},${livreur.gps.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm font-medium"
                >
                  <MapPin size={16} />
                  Voir sur Maps
                </a>
                <a
                  href={`tel:${livreur.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  <Phone size={18} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {livreurs.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center">
          <Truck className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Aucun livreur trouvé</h3>
          <p className="text-slate-500">Modifiez vos filtres ou ajoutez des livreurs</p>
        </div>
      )}

      {/* Selected Livreur Modal (Optional - for detailed view) */}
      {selectedLivreur && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedLivreur(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Détails du Livreur</h2>
                <button
                  onClick={() => setSelectedLivreur(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                  {selectedLivreur.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedLivreur.name}</h3>
                  <p className="text-blue-100">{selectedLivreur.phone}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* GPS Map with OpenStreetMap */}
              <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden border-2 border-slate-200 relative">
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight="0"
                  marginWidth="0"
                  src={`https://maps.google.com/maps?q=${selectedLivreur.gps.lat},${selectedLivreur.gps.lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  title="Livreur Location Map"
                ></iframe>
                <div className="absolute top-3 left-3 bg-white px-3 py-2 rounded-lg shadow-md text-xs font-medium text-slate-700">
                  <MapPin className="inline-block mr-1" size={14} />
                  Position actuelle
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl text-center">
                  <Package className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold text-blue-600">{selectedLivreur.assignedPackages}</p>
                  <p className="text-xs text-slate-600 mt-1">À livrer</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl text-center">
                  <CheckCircle className="w-6 h-6 mx-auto mb-2 text-emerald-600" />
                  <p className="text-2xl font-bold text-emerald-600">{selectedLivreur.deliveredToday}</p>
                  <p className="text-xs text-slate-600 mt-1">Livrés</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl text-center">
                  <Navigation className="w-6 h-6 mx-auto mb-2 text-slate-600" />
                  <p className="text-2xl font-bold text-slate-800">{selectedLivreur.gps.speed}</p>
                  <p className="text-xs text-slate-600 mt-1">km/h</p>
                </div>
              </div>

              {/* GPS Details */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900">Informations GPS</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Dernière mise à jour</span>
                    <span className="font-medium">{selectedLivreur.gps.lastUpdate}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Vitesse actuelle</span>
                    <span className="font-medium">{selectedLivreur.gps.speed} km/h</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Batterie</span>
                    <span className="font-medium">{selectedLivreur.gps.battery}%</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Statut</span>
                    <span className={`font-medium ${
                      selectedLivreur.status === 'active' ? 'text-emerald-600' : 'text-slate-600'
                    }`}>
                      {selectedLivreur.status === 'active' ? 'En tournée' : 'Disponible'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackingLivreur;
