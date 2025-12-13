import React, { useState, useEffect } from 'react';
import { 
  Search, Calendar, Truck, Package, Edit2, 
  CheckCircle, AlertCircle, X, Save
} from 'lucide-react';
import { deliveryPaymentAPI } from '../../services/api';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-6 right-6 z-60 animate-in slide-in-from-right-10 fade-in duration-300">
      <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md
        ${type === 'success' ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800' : 'bg-red-50/90 border-red-200 text-red-800'}`}>
        {type === 'success' ? <CheckCircle size={24} className="text-emerald-500" /> : <AlertCircle size={24} className="text-red-500" />}
        <div>
          <h4 className="font-bold text-sm">{type === 'success' ? 'Succès' : 'Erreur'}</h4>
          <p className="text-xs opacity-90">{message}</p>
        </div>
        <button onClick={onClose} className="ml-4 opacity-50 hover:opacity-100"><X size={16}/></button>
      </div>
    </div>
  );
};

const EditPriceModal = ({ isOpen, onClose, payment, onSave }) => {
  const [prixColis, setPrixColis] = useState(0);

  // Reset state when modal opens with new payment
  React.useEffect(() => {
    if (isOpen && payment) {
      setPrixColis(payment.prixColis);
    }
  }, [isOpen, payment]);

  if (!isOpen || !payment) return null;

  const handleSubmit = () => {
    onSave(payment.id, prixColis);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Modifier Prix Colis</h2>
            <p className="text-sm text-slate-500 mt-1">Ref: {payment?.refColis} - {payment?.clientNom}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Prix Colis
            </label>
            <div className="relative">
              <input 
                type="number"
                step="0.01"
                value={prixColis}
                onChange={(e) => setPrixColis(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">DH</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Type: {payment?.typeLivraison}</p>
          </div>
        </div>
        
        <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 rounded-b-3xl flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-slate-600 font-semibold hover:bg-white border border-slate-200 transition-all"
          >
            Annuler
          </button>
          <button 
            onClick={handleSubmit}
            className="px-8 py-3 rounded-xl text-white font-semibold flex items-center gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all"
          >
            <Save size={18} /> Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
};

export default function HistoriquePaiementLivraison() {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const [stats, setStats] = useState({
    totalColis: 0,
    totalAmmex: 0,
    totalAgadir: 0
  });

  useEffect(() => {
    loadPayments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterPayments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, dateFilter, typeFilter, payments]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await deliveryPaymentAPI.getAll();
      setPayments(data);
      calculateStats(data);
    } catch (error) {
      console.error('Error loading payments:', error);
      showToast('Erreur de chargement des paiements', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = [...payments];

    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.clientNom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.clientPhone?.includes(searchTerm) ||
        p.refColis?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateFilter) {
      filtered = filtered.filter(p => p.dateLivraison?.startsWith(dateFilter));
    }

    if (typeFilter) {
      filtered = filtered.filter(p => p.typeLivraison === typeFilter);
    }

    setFilteredPayments(filtered);
    calculateStats(filtered);
  };

  const calculateStats = (data) => {
    const stats = data.reduce((acc, payment) => {
      acc.totalColis += 1;
      if (payment.typeLivraison === 'Ammex') {
        acc.totalAmmex += 1;
      } else if (payment.typeLivraison === 'Agadir') {
        acc.totalAgadir += 1;
      }
      return acc;
    }, {
      totalColis: 0,
      totalAmmex: 0,
      totalAgadir: 0
    });

    setStats(stats);
  };

  const handleEditPrice = (payment) => {
    setSelectedPayment(payment);
    setIsEditModalOpen(true);
  };

  const handleSavePrice = async (paymentId, newPrice) => {
    try {
      await deliveryPaymentAPI.updatePrices(paymentId, { prixColis: newPrice });
      showToast('Prix mis à jour avec succès !', 'success');
      setIsEditModalOpen(false);
      loadPayments();
    } catch (error) {
      console.error('Error updating price:', error);
      showToast('Erreur lors de la mise à jour', 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  return (
    <div className="w-full min-h-screen bg-transparent p-6 space-y-8 animate-[fade-in_0.6s_ease-out]">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-transparent p-6 rounded-3xl border border-slate-100/50">
        <div>
          <h1 className="text-2xl font-extrabold text-[#018790]">Historique Paiements Livraison</h1>
          <p className="text-slate-500">Suivi des paiements de livraison par colis</p>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Search size={12}/> Recherche</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#018790]/50" size={18} />
              <input 
                type="text" 
                placeholder="Client, téléphone ou ref..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#018790]/10 focus:border-[#018790] transition-all" 
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Calendar size={12}/> Date</label>
            <div className="relative">
              <input 
                type="date" 
                value={dateFilter} 
                onChange={(e) => setDateFilter(e.target.value)} 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#018790] focus:ring-4 focus:ring-[#018790]/10 transition-all" 
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Truck size={12}/> Type</label>
            <div className="relative">
              <select 
                value={typeFilter} 
                onChange={(e) => setTypeFilter(e.target.value)} 
                className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#018790]/10 focus:border-[#018790] transition-all appearance-none cursor-pointer"
              >
                <option value="">Tous les types</option>
                <option value="Ammex">Ammex</option>
                <option value="Agadir">Agadir</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Package className="text-[#018790]" size={24} />
            <span className="text-xs font-bold text-slate-400 uppercase">Total Colis</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats.totalColis}</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Truck className="text-purple-600" size={24} />
            <span className="text-xs font-bold text-slate-400 uppercase">Livraisons Ammex</span>
          </div>
          <div className="text-3xl font-extrabold text-purple-600">{stats.totalAmmex}</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Truck className="text-orange-600" size={24} />
            <span className="text-xs font-bold text-slate-400 uppercase">Livraisons Agadir</span>
          </div>
          <div className="text-3xl font-extrabold text-orange-600">{stats.totalAgadir}</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#005461]/5 border-b border-[#005461]/10">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-bold text-[#005461] uppercase tracking-wider">Ref Colis</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-[#005461] uppercase tracking-wider">Client</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-[#005461] uppercase tracking-wider">Téléphone</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-[#005461] uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-[#005461] uppercase tracking-wider">Type</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-[#005461] uppercase tracking-wider">Prix Colis</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-[#005461] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPayments.length === 0 && !loading && (
                <tr>
                  <td colSpan="7" className="p-10 text-center text-slate-400">
                    <Package size={40} className="mx-auto mb-2 opacity-20" />
                    <p>Aucun paiement trouvé</p>
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan="7" className="p-10 text-center text-slate-400">
                    Chargement...
                  </td>
                </tr>
              )}
              {filteredPayments.map((payment) => {
                return (
                  <tr key={payment.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-semibold text-blue-600">{payment.refColis}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800">{payment.clientNom}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{payment.clientPhone}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{payment.dateLivraison}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                        payment.typeLivraison === 'Ammex' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {payment.typeLivraison}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-extrabold text-green-600 text-lg">{payment.prixColis ? payment.prixColis.toFixed(2) : '0.00'} DH</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleEditPrice(payment)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Edit2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <EditPriceModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        payment={selectedPayment}
        onSave={handleSavePrice}
      />
    </div>
  );
}
