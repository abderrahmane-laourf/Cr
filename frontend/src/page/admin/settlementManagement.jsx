import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, Package, DollarSign, User, Calendar, 
  Filter, Clock, Truck, FileText, AlertTriangle, Eye
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function SettlementManagement() {
  const [batches, setBatches] = useState([]);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showBatchDetails, setShowBatchDetails] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [filterDriver, setFilterDriver] = useState('all');
  const [drivers, setDrivers] = useState([]);

  // Mock data for settlement batches
  useEffect(() => {
    const mockBatches = [
      {
        id: "BAT-2025-001",
        driverName: "Ahmed Benali",
        dateTime: "2025-12-12T10:30:00",
        orderCount: 5,
        totalCash: 850,
        driverCommission: 125,
        status: "En attente",
        orders: [
          { id: "CMD-2025-003", clientName: "Youssef Tazi", cashCollected: 85 },
          { id: "CMD-2025-004", clientName: "Amina Kadiri", cashCollected: 320 },
          { id: "CMD-2025-005", clientName: "Omar Rifi", cashCollected: 175 },
          { id: "CMD-2025-012", clientName: "Sara El Mansouri", cashCollected: 150 },
          { id: "CMD-2025-015", clientName: "Mehdi Karimi", cashCollected: 120 }
        ]
      },
      {
        id: "BAT-2025-002",
        driverName: "Karim Essadi",
        dateTime: "2025-12-11T14:45:00",
        orderCount: 3,
        totalCash: 540,
        driverCommission: 75,
        status: "En attente",
        orders: [
          { id: "CMD-2025-008", clientName: "Fatima Zahra", cashCollected: 200 },
          { id: "CMD-2025-009", clientName: "Hassan Bouazza", cashCollected: 180 },
          { id: "CMD-2025-011", clientName: "Nadia Amrani", cashCollected: 160 }
        ]
      },
      {
        id: "BAT-2025-003",
        driverName: "Youssef Tazi",
        dateTime: "2025-12-10T09:15:00",
        orderCount: 4,
        totalCash: 680,
        driverCommission: 100,
        status: "En attente",
        orders: [
          { id: "CMD-2025-001", clientName: "Mohamed Alami", cashCollected: 150 },
          { id: "CMD-2025-002", clientName: "Leila Chraibi", cashCollected: 220 },
          { id: "CMD-2025-006", clientName: "Samir Rahmouni", cashCollected: 180 },
          { id: "CMD-2025-007", clientName: "Khadija El Fassi", cashCollected: 130 }
        ]
      }
    ];

    const uniqueDrivers = [...new Set(mockBatches.map(b => b.driverName))];
    setDrivers(uniqueDrivers);
    setBatches(mockBatches);
    setFilteredBatches(mockBatches);
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...batches];

    if (filterDate) {
      filtered = filtered.filter(b => {
        const batchDate = new Date(b.dateTime).toISOString().split('T')[0];
        return batchDate === filterDate;
      });
    }

    if (filterDriver !== 'all') {
      filtered = filtered.filter(b => b.driverName === filterDriver);
    }

    setFilteredBatches(filtered);
  }, [filterDate, filterDriver, batches]);

  // Check for overdue batches (more than 48 hours)
  const isOverdue = (batchDateTime) => {
    const batchDate = new Date(batchDateTime);
    const now = new Date();
    const diffHours = Math.abs(now - batchDate) / 36e5;
    return diffHours > 48;
  };

  const handleApproveBatch = (batchId) => {
    Swal.fire({
      title: 'Confirmer l\'approbation',
      text: 'Êtes-vous sûr de vouloir approuver ce versement ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, approuver',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#EF4444'
    }).then((result) => {
      if (result.isConfirmed) {
        // In a real app, this would update the backend
        const updatedBatches = batches.map(batch => 
          batch.id === batchId ? { ...batch, status: "Terminé" } : batch
        );
        setBatches(updatedBatches);
        
        Swal.fire({
          title: 'Approuvé!',
          text: 'Le versement a été approuvé avec succès.',
          icon: 'success',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
      }
    });
  };

  const handleRejectBatch = (batchId) => {
    Swal.fire({
      title: 'Rejeter le versement',
      text: 'Veuillez entrer la raison du rejet:',
      input: 'textarea',
      inputPlaceholder: 'Exemple: Manque 50DH',
      inputAttributes: {
        'aria-label': 'Raison du rejet'
      },
      showCancelButton: true,
      confirmButtonText: 'Rejeter',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      inputValidator: (value) => {
        if (!value) {
          return 'Vous devez entrer une raison pour le rejet!';
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // In a real app, this would update the backend
        const updatedBatches = batches.map(batch => 
          batch.id === batchId ? { ...batch, status: "Rejeté", rejectionReason: result.value } : batch
        );
        setBatches(updatedBatches);
        
        Swal.fire({
          title: 'Rejeté!',
          text: 'Le versement a été rejeté avec succès.',
          icon: 'warning',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
      }
    });
  };

  const openBatchDetails = (batch) => {
    setSelectedBatch(batch);
    setShowBatchDetails(true);
  };

  const closeBatchDetails = () => {
    setShowBatchDetails(false);
    setSelectedBatch(null);
  };

  // Calculate statistics
  const pendingSettlements = filteredBatches
    .filter(b => b.status === "En attente")
    .reduce((sum, b) => sum + b.totalCash, 0);

  const approvedToday = filteredBatches
    .filter(b => b.status === "Terminé" && new Date(b.dateTime).toDateString() === new Date().toDateString())
    .reduce((sum, b) => sum + b.totalCash, 0);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
            <DollarSign className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Gestion des Versements
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Approuvez ou rejetez les demandes de versement des livreurs
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
          <div className="bg-orange-50 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="text-orange-600" size={18} />
              <p className="text-xs font-bold text-orange-900 uppercase">Versements en attente</p>
            </div>
            <p className="text-2xl font-extrabold text-orange-600">{pendingSettlements.toFixed(2)} DH</p>
          </div>

          <div className="bg-emerald-50 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="text-emerald-600" size={18} />
              <p className="text-xs font-bold text-emerald-900 uppercase">Collecté aujourd'hui</p>
            </div>
            <p className="text-2xl font-extrabold text-emerald-600">
              {approvedToday.toFixed(2)} DH
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="text-slate-600" size={20} />
          <h3 className="font-bold text-slate-800">Filtres</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Livreur</label>
            <select
              value={filterDriver}
              onChange={(e) => setFilterDriver(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            >
              <option value="all">Tous</option>
              {drivers.map(driver => (
                <option key={driver} value={driver}>{driver}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Batches List */}
      <div className="space-y-4">
        {filteredBatches.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">Aucun versement</h3>
            <p className="text-slate-500">Aucun versement correspondant aux filtres</p>
          </div>
        ) : (
          filteredBatches.map(batch => (
            <div 
              key={batch.id} 
              className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all duration-200 ${
                isOverdue(batch.dateTime) && batch.status === "En attente" 
                  ? 'border-red-500 shadow-red-100' 
                  : 'border-slate-200'
              }`}
            >
              {/* Batch Header */}
              <div className={`px-4 py-3 flex items-center justify-between ${
                batch.status === "Terminé" 
                  ? 'bg-emerald-500' 
                  : batch.status === "Rejeté" 
                    ? 'bg-red-500' 
                    : isOverdue(batch.dateTime) 
                      ? 'bg-red-500' 
                      : 'bg-green-500'
              }`}>
                <span className="text-white font-bold">Lot #{batch.id}</span>
                <div className="flex items-center gap-2">
                  {isOverdue(batch.dateTime) && batch.status === "En attente" && (
                    <span className="bg-white/20 text-white px-2 py-1 rounded-full text-xs font-bold">
                      EN RETARD
                    </span>
                  )}
                  <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {batch.totalCash} DH
                  </span>
                </div>
              </div>

              {/* Batch Content */}
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="text-slate-400" size={16} />
                    <div>
                      <p className="text-xs text-slate-500">Livreur</p>
                      <p className="font-bold">{batch.driverName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="text-slate-400" size={16} />
                    <div>
                      <p className="text-xs text-slate-500">Date/Heure</p>
                      <p className="font-medium">
                        {new Date(batch.dateTime).toLocaleDateString('fr-FR')} à{' '}
                        {new Date(batch.dateTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="text-slate-400" size={16} />
                    <div>
                      <p className="text-xs text-slate-500">Commandes</p>
                      <p className="font-bold">{batch.orderCount} commandes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="text-slate-400" size={16} />
                    <div>
                      <p className="text-xs text-slate-500">Commission</p>
                      <p className="font-bold text-emerald-600">{batch.driverCommission} DH</p>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className={`p-3 rounded-lg ${
                  batch.status === "Terminé" 
                    ? 'bg-emerald-50 text-emerald-700' 
                    : batch.status === "Rejeté" 
                      ? 'bg-red-50 text-red-700' 
                      : 'bg-orange-50 text-orange-700'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase mb-1">
                        {batch.status === "Terminé" ? "Approuvé" : 
                         batch.status === "Rejeté" ? "Rejeté" : "En attente"}
                      </p>
                      {batch.status === "Rejeté" && batch.rejectionReason && (
                        <p className="text-xs">Raison: {batch.rejectionReason}</p>
                      )}
                    </div>
                    {batch.status === "Terminé" && (
                      <CheckCircle className="text-emerald-600" size={20} />
                    )}
                    {batch.status === "Rejeté" && (
                      <XCircle className="text-red-600" size={20} />
                    )}
                    {batch.status === "En attente" && (
                      <Clock className="text-orange-600" size={20} />
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openBatchDetails(batch)}
                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 font-bold"
                  >
                    <Eye size={16} />
                    Voir détails
                  </button>
                  
                  {batch.status === "En attente" && (
                    <>
                      <button
                        onClick={() => handleApproveBatch(batch.id)}
                        className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2 font-bold"
                      >
                        <CheckCircle size={16} />
                        Accepter
                      </button>
                      <button
                        onClick={() => handleRejectBatch(batch.id)}
                        className="flex-1 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 flex items-center justify-center gap-2 font-bold"
                      >
                        <XCircle size={16} />
                        Rejeter
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Batch Details Modal */}
      {showBatchDetails && selectedBatch && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg">Détails du Lot #{selectedBatch.id}</h3>
              <button 
                onClick={closeBatchDetails}
                className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition"
              >
                <XCircle size={20} />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Summary Header */}
              <div className="bg-green-50 p-4 rounded-xl mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-green-700 font-bold">Montant attendu</p>
                    <p className="text-xl font-extrabold text-green-600">{selectedBatch.totalCash} DH</p>
                  </div>
                  <div>
                    <p className="text-sm text-emerald-700 font-bold">Commission du livreur</p>
                    <p className="text-xl font-extrabold text-emerald-600">{selectedBatch.driverCommission} DH</p>
                  </div>
                </div>
              </div>
              
              {/* Order List */}
              <div>
                <h4 className="font-bold text-slate-800 mb-3">Commandes incluses dans ce lot:</h4>
                <div className="space-y-3">
                  {selectedBatch.orders.map((order, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-bold text-slate-800">#{order.id}</p>
                        <p className="text-sm text-slate-600">{order.clientName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-800">{order.cashCollected} DH</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={closeBatchDetails}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-medium"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}