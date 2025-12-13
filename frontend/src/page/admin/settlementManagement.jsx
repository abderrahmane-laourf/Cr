import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, Package, DollarSign, User, Calendar, 
  Filter, Clock, Truck, FileText, AlertTriangle, Eye, TrendingUp,
  ChevronDown, Search, ArrowRight
} from 'lucide-react';
import Swal from 'sweetalert2';
import SpotlightCard from '../../util/SpotlightCard';

export default function SettlementManagement() {
  const [batches, setBatches] = useState([]);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showBatchDetails, setShowBatchDetails] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [filterDriver, setFilterDriver] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [drivers, setDrivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

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

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(b => 
        b.id.toLowerCase().includes(lowerTerm) ||
        b.driverName.toLowerCase().includes(lowerTerm)
      );
    }

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
  }, [filterDate, filterDriver, filterStatus, batches, searchTerm]);

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
    <div className="w-full min-h-screen bg-transparent p-6 space-y-8 animate-[fade-in_0.6s_ease-out]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-transparent p-6 rounded-3xl border border-slate-100/50">
        <div>
          <h1 className="text-2xl font-extrabold text-[#018790]">Check Livreur</h1>
          <p className="text-slate-500">Approuvez ou rejetez les demandes de versement des livreurs</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SpotlightCard theme="light" className="flex flex-col justify-between h-full">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">En attente</span>
            <Clock size={18} className="text-[#018790]" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800">{pendingSettlements.toFixed(2)} DH</div>
            <div className="text-xs text-slate-400 mt-1">{filteredBatches.filter(b => b.status === "En attente").length} versements</div>
          </div>
        </SpotlightCard>

        <SpotlightCard theme="light" className="flex flex-col justify-between h-full">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Collecté aujourd'hui</span>
            <CheckCircle size={18} className="text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600">{approvedToday.toFixed(2)} DH</div>
            <div className="text-xs text-slate-400 mt-1">{filteredBatches.filter(b => b.status === "Terminé").length} approuvés</div>
          </div>
        </SpotlightCard>

        <SpotlightCard theme="light" className="flex flex-col justify-between h-full">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Commissions totales</span>
            <TrendingUp size={18} className="text-purple-600" />
          </div>
          <div>
            <div className="text-2xl font-black text-purple-600">{totalCommissions.toFixed(2)} DH</div>
            <div className="text-xs text-slate-400 mt-1">{filteredBatches.length} lots au total</div>
          </div>
        </SpotlightCard>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
           {/* Search */}
           <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Search size={12}/> Recherche</label>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#018790]/50" size={18} />
                    <input 
                        type="text" 
                        placeholder="ID Lot, Livreur..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#018790]/10 focus:border-[#018790] transition-all" 
                    />
                </div>
            </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Calendar size={12}/> Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#018790] focus:ring-4 focus:ring-[#018790]/10 transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><User size={12}/> Livreur</label>
            <div className="relative">
              <select
                value={filterDriver}
                onChange={(e) => setFilterDriver(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#018790] focus:ring-4 focus:ring-[#018790]/10 transition-all appearance-none cursor-pointer"
              >
                <option value="all">Tous les livreurs</option>
                {drivers.map(driver => (
                  <option key={driver} value={driver}>{driver}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><AlertTriangle size={12}/> Statut</label>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#018790] focus:ring-4 focus:ring-[#018790]/10 transition-all appearance-none cursor-pointer"
              >
                <option value="all">Tous les statuts</option>
                <option value="En attente">En attente</option>
                <option value="Terminé">Terminé</option>
                <option value="Rejeté">Rejeté</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>
        
        {(filterDate || filterDriver !== 'all' || filterStatus !== 'all' || searchTerm) && (
          <button
            onClick={() => {
              setFilterDate('');
              setFilterDriver('all');
              setFilterStatus('all');
              setSearchTerm('');
            }}
            className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2 transition-colors"
          >
            <XCircle size={16} />
            Réinitialiser les filtres
          </button>
        )}
      </div>

      {/* Batches Table */}
      <SpotlightCard theme="light" className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#005461]/5 border-b border-[#005461]/10">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-bold text-[#005461] uppercase tracking-wider">Lot</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-[#005461] uppercase tracking-wider">Livreur</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-[#005461] uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-[#005461] uppercase tracking-wider">Commandes</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-[#005461] uppercase tracking-wider">Total Cash</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-[#005461] uppercase tracking-wider">Commission</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-[#005461] uppercase tracking-wider">Statut</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-[#005461] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredBatches.length === 0 ? (
                 <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-slate-400">
                        <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Aucun versement trouvé</p>
                    </td>
                 </tr>
              ) : (
                filteredBatches.map(batch => (
                  <tr key={batch.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                                <FileText size={16} />
                            </div>
                            <span className="font-bold text-slate-700 text-sm">#{batch.id}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                {batch.driverName.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-slate-700">{batch.driverName}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(batch.dateTime).toLocaleDateString('fr-FR')}
                        <div className="text-xs text-slate-400">{new Date(batch.dateTime).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</div>
                    </td>
                    <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                            {batch.orderCount} cmds
                        </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                        {batch.totalCash} DH
                    </td>
                    <td className="px-6 py-4 font-bold text-[#018790]">
                        {batch.driverCommission} DH
                    </td>
                    <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase gap-1.5
                            ${batch.status === 'Terminé' ? 'bg-emerald-100 text-emerald-700' : 
                              batch.status === 'Rejeté' ? 'bg-red-100 text-red-700' : 
                              'bg-amber-100 text-amber-700'}`}>
                            {batch.status === 'Terminé' && <CheckCircle size={12} />}
                            {batch.status === 'Rejeté' && <XCircle size={12} />}
                            {batch.status === 'En attente' && <Clock size={12} />}
                            {batch.status}
                        </span>
                        {isOverdue(batch.dateTime) && batch.status === "En attente" && (
                            <div className="mt-1 text-[10px] font-bold text-red-500 flex items-center gap-1">
                                <AlertTriangle size={10} /> RETARD
                            </div>
                        )}
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openBatchDetails(batch)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Voir détails">
                                <Eye size={18} />
                            </button>
                            {batch.status === "En attente" && (
                                <>
                                    <button onClick={() => handleApproveBatch(batch.id)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition" title="Approuver">
                                        <CheckCircle size={18} />
                                    </button>
                                    <button onClick={() => handleRejectBatch(batch.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Rejeter">
                                        <XCircle size={18} />
                                    </button>
                                </>
                            )}
                        </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SpotlightCard>

      {/* Batch Details Modal */}
      {showBatchDetails && selectedBatch && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <SpotlightCard theme="light" className="w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col !p-0 !bg-white/90">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 bg-[#005461]/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#005461]/10 rounded-lg text-[#005461]">
                  <FileText size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-[#005461] text-xl">Détails du Lot #{selectedBatch.id}</h3>
                    <p className="text-xs text-slate-500">Livreur: {selectedBatch.driverName}</p>
                </div>
              </div>
              <button 
                onClick={closeBatchDetails}
                className="p-2 hover:bg-rose-50 hover:text-rose-500 rounded-full text-slate-400 transition"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {/* Summary Header */}
              <div className="bg-gradient-to-br from-[#005461]/5 to-[#018790]/5 p-6 rounded-2xl mb-8 border border-[#005461]/10">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-xs text-[#005461] font-bold uppercase tracking-wider mb-2">Montant attendu</p>
                    <p className="text-4xl font-black text-[#005461]">{selectedBatch.totalCash} <span className="text-lg font-bold text-[#005461]/50">DH</span></p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Commission du livreur</p>
                    <p className="text-4xl font-black text-slate-700">{selectedBatch.driverCommission} <span className="text-lg font-bold text-slate-400">DH</span></p>
                  </div>
                </div>
              </div>
              
              {/* Order List */}
              <div>
                <h4 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                    <Package size={16} className="text-[#018790]" />
                    Commandes incluses ({selectedBatch.orders.length})
                </h4>
                <div className="space-y-3">
                  {selectedBatch.orders.map((order, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white rounded-xl hover:shadow-md transition-all border border-slate-100 group">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-[#005461]/10 flex items-center justify-center text-[#005461] font-bold text-xs">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">#{order.id}</p>
                          <p className="text-xs text-slate-500">{order.clientName}</p>
                        </div>
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
            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={closeBatchDetails}
                className="px-6 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-sm transition-colors shadow-sm"
              >
                Fermer
              </button>
            </div>
          </SpotlightCard>
        </div>
      )}
    </div>
  );
}              