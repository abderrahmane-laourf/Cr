import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Wallet, AlertCircle, 
  Plus, Minus, Trash2, Calendar, FileText, CheckCircle, X, Search,
  Building, ArrowRightLeft, History, ArrowDownCircle, ArrowUpCircle
} from 'lucide-react';
import Swal from 'sweetalert2';

// Utility Components
const Toast = ({ message, type = 'success', onClose }) => {
  if (!message) return null;
  return (
    <div className="fixed top-6 right-6 z-[60] animate-in slide-in-from-right-10 fade-in duration-300">
      <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md
        ${type === 'success' ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800' : 'bg-blue-50/90 border-blue-200 text-blue-800'}`}>
        {type === 'success' ? <CheckCircle size={24} className="text-emerald-500" /> : <AlertCircle size={24} className="text-blue-500" />}
        <div>
          <h4 className="font-bold text-sm">{type === 'success' ? 'Succès' : 'Info'}</h4>
          <p className="text-xs opacity-90">{message}</p>
        </div>
        <button onClick={onClose} className="ml-4 opacity-50 hover:opacity-100"><X size={16}/></button>
      </div>
    </div>
  );
};

// Modal Component for Investment Transactions
const InvestmentModal = ({ isOpen, onClose, onSave, mode, employees }) => {
  // mode: 'INVESTMENT_IN', 'INVESTMENT_OUT'
  const isIncome = mode === 'INVESTMENT_IN';
  
  // Form State
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    investmentType: 'Matériel',
    employeeId: ''
  });

  const [availableEmployees, setAvailableEmployees] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        investmentType: 'Matériel',
        employeeId: ''
      });
      setAvailableEmployees(employees);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    onSave({ 
      ...formData, 
      amount: parseFloat(formData.amount),
      type: isIncome ? 'IN' : 'OUT',
      category: 'Investissement'
    });
  };

  if (!isOpen) return null;

  const getTitle = () => {
    return isIncome ? 'Nouvel Investissement' : 'Retrait d\'Investissement';
  };

  const getHeaderColor = () => {
    return isIncome ? 'bg-emerald-50/50 text-emerald-700' : 'bg-amber-50/50 text-amber-700';
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border-t-4 border-t-slate-100">
        
        {/* Header */}
        <div className={`flex justify-between items-center px-8 py-6 border-b border-slate-100 ${getHeaderColor()} rounded-t-3xl`}>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              {isIncome ? <Plus size={20}/> : <Minus size={20}/>}
              {getTitle()}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 bg-white hover:bg-slate-100 text-slate-400 hover:text-red-500 rounded-full transition-colors shadow-sm">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5 overflow-y-auto custom-scrollbar">
          
          {/* Date Field */}
          <div className="group">
            <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Date</label>
            <input 
              type="date"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
          </div>

          {/* Investment Type */}
          <div className="group">
            <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Type d'Investissement</label>
            <select 
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
              value={formData.investmentType}
              onChange={(e) => setFormData({...formData, investmentType: e.target.value})}
            >
              <option value="Matériel">Matériel</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Technologie">Technologie</option>
              <option value="Formation">Formation</option>
              <option value="Marketing">Marketing</option>
              <option value="Autre">Autre</option>
            </select>
          </div>

          {/* Amount & Description */}
          <div className="space-y-4">
            <div className="group">
              <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Montant (MAD)</label>
              <div className="relative">
                <input 
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full pl-4 pr-12 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-lg font-mono font-bold focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">MAD</span>
              </div>
            </div>

            <div className="group">
              <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Motif / Description</label>
              <textarea 
                rows="3"
                required
                placeholder="Description de l'investissement..."
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm outline-none transition-all resize-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              className={`w-full py-3.5 rounded-xl text-white font-bold flex items-center justify-center gap-2 shadow-lg transition-all transform active:scale-95
                ${isIncome ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30' : 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/30'}
              `}
            >
              {isIncome ? 'Confirmer Investissement' : 'Confirmer Retrait'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, amount, type, icon: Icon }) => {
  let colorClass, bgClass, iconColor;
  if (type === 'in') {
    colorClass = 'text-emerald-700';
    bgClass = 'bg-emerald-50 border-emerald-100';
    iconColor = 'text-emerald-500';
  } else if (type === 'out') {
    colorClass = 'text-amber-700';
    bgClass = 'bg-amber-50 border-amber-100';
    iconColor = 'text-amber-500';
  } else {
    colorClass = 'text-slate-800';
    bgClass = 'bg-white border-slate-200';
    iconColor = 'text-slate-400';
  }

  return (
    <div className={`p-5 rounded-2xl border shadow-sm flex items-center gap-4 ${bgClass}`}>
      <div className={`p-3 rounded-xl bg-white shadow-sm ${iconColor}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className={`text-xs font-bold uppercase tracking-wider opacity-70 ${colorClass}`}>{title}</p>
        <h3 className={`text-2xl font-black ${colorClass}`}>{amount.toLocaleString()} <span className="text-sm font-medium opacity-60">MAD</span></h3>
      </div>
    </div>
  );
};

// Investment Dashboard Component
const InvestmentDashboard = ({ transactions, searchTerm, onDelete }) => {
  // Filter only Investment transactions
  const investmentTransactions = transactions.filter(t => 
    t.category === 'Investissement' &&
    (t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
     (t.investmentType && t.investmentType.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  // Calculate Stats
  const totalIn = investmentTransactions.filter(t => t.type === 'IN').reduce((sum, t) => sum + t.amount, 0);
  const totalOut = investmentTransactions.filter(t => t.type === 'OUT').reduce((sum, t) => sum + t.amount, 0);
  const currentBalance = totalIn - totalOut;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Investissements" amount={totalIn} type="in" icon={ArrowDownCircle} />
        <StatCard title="Total Retraits" amount={totalOut} type="out" icon={ArrowUpCircle} />
        <StatCard title="Solde Investissements" amount={currentBalance} type="balance" icon={Building} />
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <History size={20} className="text-slate-400"/>
          <h3 className="font-bold text-slate-800">Historique des Investissements</h3>
        </div>
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Investissement</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/3">Motif</th>
              <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Montant</th>
              <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {investmentTransactions.length === 0 ? (
              <tr><td colSpan="6" className="p-8 text-center text-slate-400 italic">Aucun investissement enregistré</td></tr>
            ) : (
              investmentTransactions.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">{t.date}</td>
                  <td className="px-6 py-4">
                    {t.type === 'IN' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                        <TrendingUp size={12} className="mr-1"/> Investissement
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                        <TrendingDown size={12} className="mr-1"/> Retrait
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-800">{t.investmentType}</td>
                  <td className="px-6 py-4 text-sm text-slate-800">{t.description}</td>
                  <td className={`px-6 py-4 text-right font-bold font-mono ${t.type === 'IN' ? 'text-emerald-600' : 'text-amber-700'}`}>
                    {t.type === 'IN' ? '+' : '-'}{t.amount.toLocaleString()} MAD
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => onDelete(t.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Supprimer">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Main Investment Management Component
const InvestmentManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [employees] = useState([
    { id: '1', name: 'Bernard' },
    { id: '2', name: 'Sarah' },
    { id: '3', name: 'Fatiha' },
    { id: '4', name: 'Karim' },
    { id: '5', name: 'Huda' }
  ]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [showToast, setShowToast] = useState({ message: '', type: 'success' });
  const [modalMode, setModalMode] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load transactions from localStorage on component mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem('investments');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    } else {
      // Initialize with sample data if empty
      const sampleTransactions = [
        {
          id: '1',
          date: '2025-12-01',
          amount: 5000,
          description: 'Achat de nouveaux ordinateurs pour l\'équipe',
          type: 'IN',
          category: 'Investissement',
          investmentType: 'Technologie'
        },
        {
          id: '2',
          date: '2025-12-05',
          amount: 2000,
          description: 'Formation des employés sur les nouvelles technologies',
          type: 'IN',
          category: 'Investissement',
          investmentType: 'Formation'
        },
        {
          id: '3',
          date: '2025-12-10',
          amount: 1000,
          description: 'Maintenance des équipements informatiques',
          type: 'OUT',
          category: 'Investissement',
          investmentType: 'Technologie'
        }
      ];
      setTransactions(sampleTransactions);
      localStorage.setItem('investments', JSON.stringify(sampleTransactions));
    }
  }, []);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('investments', JSON.stringify(transactions));
  }, [transactions]);

  const showToastMessage = (message, type = 'success') => {
    setShowToast({ message, type });
    setTimeout(() => setShowToast({ message: '', type }), 3000);
  };

  const handleAddTransaction = (transactionData) => {
    const newTransaction = {
      ...transactionData,
      id: Date.now().toString()
    };
    
    setTransactions(prev => [...prev, newTransaction]);
    setIsModalOpen(false);
    showToastMessage(
      transactionData.type === 'IN' 
        ? 'Investissement ajouté avec succès!' 
        : 'Retrait d\'investissement effectué!'
    );
  };

  const handleDeleteTransaction = (id) => {
    Swal.fire({
      title: 'Êtes-vous sûr?',
      text: "Cette action est irréversible!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, supprimer!',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        setTransactions(prev => prev.filter(t => t.id !== id));
        showToastMessage('Transaction supprimée avec succès!', 'success');
      }
    });
  };

  const openModal = (mode) => {
    setModalMode(mode);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16" dir="ltr">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-4 bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Building className="text-blue-600" />
              Gestion des Investissements
            </h1>
            <p className="text-sm text-gray-500 mt-1">Suivi des investissements et retraits</p>
          </div>
          
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Recherche</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <button 
              onClick={() => openModal('INVESTMENT_IN')}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              Nouvel Investissement
            </button>
            
            <button 
              onClick={() => openModal('INVESTMENT_OUT')}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors flex items-center gap-2"
            >
              <Minus size={16} />
              Retrait d'Investissement
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'dashboard'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="flex items-center gap-2">
              <Building size={18} />
              Vue d'ensemble
            </div>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <InvestmentDashboard 
            transactions={transactions} 
            searchTerm={searchTerm}
            onDelete={handleDeleteTransaction}
          />
        )}

        {/* Toast Notification */}
        {showToast.message && (
          <Toast 
            message={showToast.message} 
            type={showToast.type} 
            onClose={() => setShowToast({ message: '', type: 'success' })}
          />
        )}

        {/* Transaction Modal */}
        {isModalOpen && (
          <InvestmentModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleAddTransaction}
            mode={modalMode}
            employees={employees}
          />
        )}
      </div>
    </div>
  );
};

export default InvestmentManagement;