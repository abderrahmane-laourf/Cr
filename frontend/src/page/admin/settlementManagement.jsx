import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, Package, DollarSign, User, Calendar, 
  Filter, Clock, Truck, FileText, AlertTriangle, Eye, TrendingUp
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function SettlementManagement() {
  const [batches, setBatches] = useState([]);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showBatchDetails, setShowBatchDetails] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [filterDriver, setFilterDriver] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
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
        status: "Terminé",
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

    if (filterStatus !== 'all') {
      filtered = filtered.filter(b => b.status === filterStatus);
    }

    setFilteredBatches(filtered);
  }, [filterDate, filterDriver, filterStatus, batches]);

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
      confirmButtonColor: '#2563EB',
      cancelButtonColor: '#64748B'
    }).then((result) => {
      if (result.isConfirmed) {
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
      cancelButtonColor: '#64748B',
      inputValidator: (value) => {
        if (!value) {
          return 'Vous devez entrer une raison pour le rejet!';
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
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

  const totalCommissions = filteredBatches
    .reduce((sum, b) => sum + b.driverCommission, 0);

  return (
    <div className="w-full min-h-screen bg-slate-50 p-4 sm:p-6 animate-[fade-in_0.6s_ease-out]">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-blue-600 rounded-xl shadow-md shadow-blue-500/20">
            <DollarSign className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Check Livreur
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Approuvez ou rejetez les demandes de versement des livreurs
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100">
          <div className="bg-white p-6 rounded-xl border-2 border-blue-200 shadow-lg shadow-blue-500/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-blue-600 rounded-xl shadow-md">
                <Clock className="text-white" size={24} />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">En attente</p>
            </div>
            <p className="text-4xl font-black text-slate-900">{pendingSettlements.toFixed(2)} DH</p>
            <p className="text-xs text-slate-600 mt-2 font-semibold">{filteredBatches.filter(b => b.status === "En attente").length} versements</p>
          </div>

          <div className="bg-white p-6 rounded-xl border-2 border-blue-200 shadow-lg shadow-blue-500/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-blue-600 rounded-xl shadow-md">
                <CheckCircle className="text-white" size={24} />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Collecté aujourd'hui</p>
            </div>
            <p className="text-4xl font-black text-slate-900">{approvedToday.toFixed(2)} DH</p>
            <p className="text-xs text-slate-600 mt-2 font-semibold">{filteredBatches.filter(b => b.status === "Terminé").length} approuvés</p>
          </div>

          <div className="bg-white p-6 rounded-xl border-2 border-blue-200 shadow-lg shadow-blue-500/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-blue-600 rounded-xl shadow-md">
                <TrendingUp className="text-white" size={24} />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Commissions totales</p>
            </div>
            <p className="text-4xl font-black text-slate-900">{totalCommissions.toFixed(2)} DH</p>
            <p className="text-xs text-slate-600 mt-2 font-semibold">{filteredBatches.length} lots au total</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Filter className="text-blue-600" size={20} />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">Filtres</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Livreur</label>
            <select
              value={filterDriver}
              onChange={(e) => setFilterDriver(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
            >
              <option value="all">Tous les livreurs</option>
              {drivers.map(driver => (
                <option key={driver} value={driver}>{driver}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Statut</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
            >
              <option value="all">Tous les statuts</option>
              <option value="En attente">En attente</option>
              <option value="Terminé">Terminé</option>
              <option value="Rejeté">Rejeté</option>
            </select>
          </div>
        </div>
        
        {(filterDate || filterDriver !== 'all' || filterStatus !== 'all') && (
          <button
            onClick={() => {
              setFilterDate('');
              setFilterDriver('all');
              setFilterStatus('all');
            }}
            className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2 transition-colors"
          >
            <XCircle size={16} />
            Réinitialiser les filtres
          </button>
        )}
      </div>

      {/* Batches List */}
      <div className="space-y-4">
        {filteredBatches.length === 0 ? (
          <div className="bg-white p-12 rounded-xl text-center shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100">
            <Package className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">Aucun versement</h3>
            <p className="text-slate-500">Aucun versement correspondant aux filtres</p>
          </div>
        ) : (
          filteredBatches.map(batch => (
            <div 
              key={batch.id} 
              className={`bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border overflow-hidden hover:shadow-lg transition-all duration-200 ${
                isOverdue(batch.dateTime) && batch.status === "En attente" 
                  ? 'border-blue-200 ring-2 ring-red-100' 
                  : 'border-slate-100'
              }`}
            >
              {/* Batch Header */}
              <div className={`px-6 py-4 flex items-center justify-between ${
                batch.status === "Terminé" 
                  ? 'bg-blue-600' 
                  : batch.status === "Rejeté" 
                    ? 'bg-blue-600' 
                    : isOverdue(batch.dateTime) 
                      ? 'bg-blue-600' 
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <FileText className="text-white" size={20} />
                  </div>
                  <span className="text-white font-bold text-lg">Lot #{batch.id}</span>
                </div>
                <div className="flex items-center gap-3">
                  {isOverdue(batch.dateTime) && batch.status === "En attente" && (
                    <span className="bg-white/20 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                      <AlertTriangle size={14} />
                      EN RETARD
                    </span>
                  )}
                  <span className="bg-white/20 text-white px-4 py-1.5 rounded-full text-sm font-bold">
                    {batch.totalCash} DH
                  </span>
                </div>
              </div>

              {/* Batch Content */}
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <User className="text-blue-600" size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Livreur</p>
                      <p className="font-bold text-slate-900">{batch.driverName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <Calendar className="text-slate-600" size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Date/Heure</p>
                      <p className="font-semibold text-slate-700 text-sm">
                        {new Date(batch.dateTime).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <Package className="text-slate-600" size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Commandes</p>
                      <p className="font-bold text-slate-900">{batch.orderCount}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <DollarSign className="text-slate-900" size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Commission</p>
                      <p className="font-bold text-slate-900">{batch.driverCommission} DH</p>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className={`p-4 rounded-lg ${
                  batch.status === "Terminé" 
                    ? 'bg-blue-600 border border-blue-200' 
                    : batch.status === "Rejeté" 
                      ? 'bg-blue-600 border border-blue-200' 
                      : 'bg-blue-600 border border-blue-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-xs font-bold uppercase mb-1 flex items-center gap-2 ${
                        batch.status === "Terminé" ? 'text-slate-900' :
                        batch.status === "Rejeté" ? 'text-slate-900' : 'text-slate-600'
                      }`}>
                        {batch.status === "Terminé" && <CheckCircle size={16} />}
                        {batch.status === "Rejeté" && <XCircle size={16} />}
                        {batch.status === "En attente" && <Clock size={16} />}
                        {batch.status}
                      </p>
                      {batch.status === "Rejeté" && batch.rejectionReason && (
                        <p className="text-xs text-slate-900 mt-1">Raison: {batch.rejectionReason}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => openBatchDetails(batch)}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 font-semibold shadow-md shadow-blue-500/20"
                  >
                    <Eye size={18} />
                    Voir détails
                  </button>
                  
                  {batch.status === "En attente" && (
                    <>
                      <button
                        onClick={() => handleApproveBatch(batch.id)}
                        className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 font-semibold shadow-md shadow-blue-500/10"
                      >
                        <CheckCircle size={18} />
                        Accepter
                      </button>
                      <button
                        onClick={() => handleRejectBatch(batch.id)}
                        className="flex-1 py-3 bg-white text-slate-900 border-2 border-blue-200 rounded-lg hover:bg-blue-600 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 font-semibold"
                      >
                        <XCircle size={18} />
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-indigo-600">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <FileText className="text-white" size={24} />
                </div>
                <h3 className="font-bold text-white text-xl">Détails du Lot #{selectedBatch.id}</h3>
              </div>
              <button 
                onClick={closeBatchDetails}
                className="p-2 hover:bg-white/20 rounded-lg text-white transition"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Summary Header */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl mb-6 border border-blue-200">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-blue-700 font-bold mb-2">Montant attendu</p>
                    <p className="text-3xl font-black text-blue-600">{selectedBatch.totalCash} DH</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-900 font-bold mb-2">Commission du livreur</p>
                    <p className="text-3xl font-black text-slate-900">{selectedBatch.driverCommission} DH</p>
                  </div>
                </div>
              </div>
              
              {/* Order List */}
              <div>
                <h4 className="font-bold text-slate-900 mb-4 text-lg">Commandes incluses ({selectedBatch.orders.length})</h4>
                <div className="space-y-3">
                  {selectedBatch.orders.map((order, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <span className="font-bold text-blue-600 text-sm">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">#{order.id}</p>
                          <p className="text-sm text-slate-600">{order.clientName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900 text-lg">{order.cashCollected} DH</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={closeBatchDetails}
                className="px-6 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 font-medium transition-colors"
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