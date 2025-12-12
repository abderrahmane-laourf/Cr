import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Filter, FileText, CheckCircle, AlertCircle, 
  Calendar, User, DollarSign, Clock, Paperclip, Check, X,
  ChevronDown, ArrowRight, Eye, Trash2
} from 'lucide-react';
import Swal from 'sweetalert2';

// --- 1. UTILITY COMPONENTS ---

const Toast = ({ message, type = 'success', onClose }) => {
  if (!message) return null;
  return (
    <div className="fixed top-6 right-6 z-[60] animate-in slide-in-from-right-10 fade-in duration-300">
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

const InputField = ({ label, type = "text", placeholder, value, onChange, disabled }) => (
  <div className="group">
    <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider group-focus-within:text-blue-600 transition-colors">
      {label} {!disabled && <span className="text-red-400">*</span>}
    </label>
    <div className="relative">
      <input 
        type={type} 
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full pl-4 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 disabled:bg-slate-100 disabled:text-slate-500`}
        value={value}
        onChange={onChange}
      />
    </div>
  </div>
);

const SelectField = ({ label, options, value, onChange, disabled, onAdd }) => (
    <div className="group">
      <div className="flex justify-between items-center mb-1.5 ml-1">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider group-focus-within:text-blue-600 transition-colors">
            {label} {!disabled && <span className="text-red-400">*</span>}
        </label>
        {onAdd && !disabled && (
            <button type="button" onClick={onAdd} className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                <Plus size={10} /> Nouveau
            </button>
        )}
      </div>
      <div className="relative">
        <select 
            disabled={disabled}
            className={`w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 appearance-none disabled:bg-slate-100 disabled:text-slate-500 cursor-pointer`}
            value={value}
            onChange={onChange}
        >
            <option value="">Sélectionner</option>
            {options.map((opt, idx) => (
                <option key={idx} value={opt}>{opt}</option>
            ))}
        </select>
        {!disabled && <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><ChevronDown size={16} /></div>}
      </div>
    </div>
);

// --- 2. MODAL COMPONENT ---

const DebtModal = ({ isOpen, onClose, onSave, mode = 'add', initialData = null }) => {
    const isViewOnly = mode === 'view';
    
    const [formData, setFormData] = useState({
        creationDate: new Date().toISOString().split('T')[0],
        project: 'Alpha',
        supplier: '',
        amount: '',
        paymentMethod: '',
        dueDate: '',
        responsible: '',
        note: '',
        file: null
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(initialData);
            } else {
                setFormData({
                    creationDate: new Date().toISOString().split('T')[0],
                    project: 'Alpha',
                    supplier: '',
                    amount: '',
                    paymentMethod: '',
                    dueDate: '',
                    responsible: '',
                    note: '',
                    file: null
                });
            }
        }
    }, [isOpen, initialData]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">
                            {mode === 'add' ? 'Ajouter une Dette' : mode === 'view' ? 'Détails de la Dette' : 'Modifier la Dette'}
                        </h2>
                        <p className="text-sm text-slate-500">
                            {mode === 'add' ? 'Enregistrer une nouvelle facture fournisseur' : 'Informations complètes'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar space-y-6">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InputField 
                            label="Date de Création" 
                            type="date"
                            value={formData.date || formData.creationDate} 
                            onChange={(e) => handleChange('creationDate', e.target.value)}
                            disabled={isViewOnly} 
                        />
                        <InputField 
                            label="Projet" 
                            value={formData.project} 
                            disabled={true}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <SelectField 
                            label="Fournisseur" 
                            options={['Global Info', 'Ikea Business', 'Office Depot', 'Bricoma']} 
                            value={formData.supplier} 
                            onChange={(e) => handleChange('supplier', e.target.value)} 
                            onAdd={() => alert("Fonctionnalité d'ajout rapide de fournisseur à implémenter")}
                            disabled={isViewOnly}
                        />
                        <InputField 
                            label="Responsable" 
                            placeholder="Nom du responsable"
                            value={formData.responsible} 
                            onChange={(e) => handleChange('responsible', e.target.value)} 
                            disabled={isViewOnly}
                        />
                    </div>

                    <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InputField 
                            label="Montant (MAD)" 
                            type="number"
                            placeholder="0.00"
                            value={formData.amount} 
                            onChange={(e) => handleChange('amount', e.target.value)} 
                            disabled={isViewOnly}
                        />
                        <SelectField 
                            label="Méthode de Paiement" 
                            options={['Chèque', 'Virement', 'Espèces', 'Traite']} 
                            value={formData.paymentMethod} 
                            onChange={(e) => handleChange('paymentMethod', e.target.value)} 
                            onAdd={() => alert("Ajouter méthode")}
                            disabled={isViewOnly}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InputField 
                            label="Date d'échéance" 
                            type="date"
                            value={formData.dueDate} 
                            onChange={(e) => handleChange('dueDate', e.target.value)} 
                            disabled={isViewOnly}
                        />
                        <div className="group">
                             <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">
                                Preuve / Fichier
                            </label>
                            <label className={`flex items-center gap-3 w-full p-3 rounded-xl bg-slate-50 border border-dashed border-slate-300 ${!isViewOnly ? 'cursor-pointer hover:bg-slate-100' : ''} transition-colors`}>
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                    <Paperclip size={16} />
                                </div>
                                <span className="text-sm text-slate-500 truncate">
                                    {formData.file ? (typeof formData.file === 'string' ? formData.file : formData.file.name) : "Aucun fichier joint"}
                                </span>
                                {!isViewOnly && <input type="file" className="hidden" onChange={(e) => handleChange('file', e.target.files[0])} />}
                            </label>
                        </div>
                    </div>

                    <div className="group">
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">
                            Note / Observation
                        </label>
                        <textarea 
                            rows="2"
                            disabled={isViewOnly}
                            className="w-full pl-4 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none disabled:bg-slate-100 disabled:text-slate-500"
                            placeholder="Notes supplémentaires..."
                            value={formData.note}
                            onChange={(e) => handleChange('note', e.target.value)}
                        />
                    </div>

                    {!isViewOnly && (
                        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                            <button 
                                type="button" 
                                onClick={onClose}
                                className="px-6 py-2.5 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
                            >
                                Annuler
                            </button>
                            <button 
                                type="submit"
                                className="px-8 py-2.5 rounded-xl text-white font-semibold flex items-center gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all"
                            >
                                <Check size={18} /> Enregistrer
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

// --- 2.5 PAYMENT PROOF MODAL ---

const PaymentProofModal = ({ isOpen, onClose, onConfirm }) => {
    const [file, setFile] = useState(null);

    useEffect(() => {
        if (!isOpen) setFile(null);
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (file) {
            onConfirm(file);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <CheckCircle className="text-emerald-500" /> Confirmer Paiement
                        </h2>
                        <p className="text-sm text-slate-500">Veuillez joindre une preuve de paiement</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="group">
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">
                            Preuve de paiement (Reçu/Virement) <span className="text-red-400">*</span>
                        </label>
                        <label className={`flex flex-col items-center justify-center gap-3 w-full h-32 rounded-xl bg-slate-50 border-2 border-dashed ${file ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-300 hover:bg-slate-100'} cursor-pointer transition-all`}>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${file ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                                {file ? <Check size={24} /> : <Paperclip size={24} />}
                            </div>
                            <span className="text-sm text-slate-600 font-medium truncate max-w-[200px]">
                                {file ? file.name : "Cliquez pour déposer un fichier"}
                            </span>
                            <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files[0])} />
                        </label>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
                        >
                            Annuler
                        </button>
                        <button 
                            type="submit"
                            disabled={!file}
                            className="px-6 py-2.5 rounded-xl text-white font-bold flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30 transition-all"
                        >
                            <CheckCircle size={18} /> Confirmer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- 3. MAIN PAGE COMPONENT ---

const DebtsPage = () => {
  const [activeTab, setActiveTab] = useState('open'); // 'open' | 'history'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [pendingDebtId, setPendingDebtId] = useState(null);

  // Load from LocalStorage
  const [debts, setDebts] = useState(() => {
    const saved = localStorage.getItem('finance_debts_db');
    return saved ? JSON.parse(saved) : [
      { id: 1, date: '2024-12-01', project: 'Alpha', supplier: 'Global Info', amount: 15000, paymentMethod: 'Chèque', dueDate: '2024-12-08', status: 'Ouvert', responsible: 'Ahmed', note: 'Facture N°123', proofFile: null, type: 'Bichda' },
      { id: 2, date: '2024-11-20', project: 'Alpha', supplier: 'Bricoma', amount: 3200, paymentMethod: 'Espèces', dueDate: '2024-12-05', status: 'Ouvert', responsible: 'Sarah', note: 'Achat peinture', proofFile: null, type: 'Service' },
      { id: 3, date: '2024-10-15', project: 'Alpha', supplier: 'Office Depot', amount: 5000, paymentMethod: 'Virement', dueDate: '2024-10-30', status: 'Payé', responsible: 'Ali', note: 'Mobilier bureau', proofFile: 'proof.jpg', type: 'Loan' },
    ];
  });

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('finance_debts_db', JSON.stringify(debts));
  }, [debts]);

  const handleOpenAdd = () => {
      setModalMode('add');
      setSelectedDebt(null);
      setIsModalOpen(true);
  };

  const handleOpenView = (debt) => {
      setModalMode('view');
      setSelectedDebt(debt);
      setIsModalOpen(true);
  };

  const handleSave = (data) => {
      const newDebt = {
          id: Date.now(),
          date: data.creationDate,
          project: data.project,
          supplier: data.supplier,
          amount: parseFloat(data.amount) || 0,
          paymentMethod: data.paymentMethod,
          dueDate: data.dueDate,
          status: 'Ouvert', // Default
          responsible: data.responsible,
          note: data.note,
          file: data.file,
          proofFile: null,
          type: data.type || 'Service' // Default type
      };
      setDebts([newDebt, ...debts]);
      setIsModalOpen(false);
      setToast({ message: "Dette enregistrée avec succès", type: "success" });
      setTimeout(() => setToast(null), 3000);
  };

  const handleMarkAsPaid = (id) => {
      setPendingDebtId(id);
      setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = (file) => {
      setDebts(debts.map(d => d.id === pendingDebtId ? { ...d, status: 'Payé', proofFile: file } : d));
      setIsPaymentModalOpen(false);
      setPendingDebtId(null);
      setToast({ message: "Dette marquée comme payée ! Preuve enregistrée.", type: "success" });
      setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = (id) => {
    Swal.fire({
        title: 'Êtes-vous sûr ?',
        text: "Cette action est irréversible !",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Oui, supprimer !',
        cancelButtonText: 'Annuler'
    }).then((result) => {
        if (result.isConfirmed) {
            setDebts(debts.filter(d => d.id !== id));
            Swal.fire('Supprimé!', 'La dette a été supprimée.', 'success');
        }
    });
  };

  const calculatePriority = (dueDate) => {
      const due = new Date(dueDate);
      const today = new Date();
      const diffTime = due - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return { label: `En retard (${Math.abs(diffDays)}j)`, color: 'text-red-600 bg-red-50 border-red-100' };
      if (diffDays <= 3) return { label: `Urgent (${diffDays}j)`, color: 'text-orange-600 bg-orange-50 border-orange-100' };
      return { label: `Dans ${diffDays}j`, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' };
  };

  const filteredDebts = debts.filter(d => {
      const matchesSearch = d.supplier.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = activeTab === 'open' ? d.status === 'Ouvert' : d.status === 'Payé';
      return matchesSearch && matchesTab;
  });

  // Sort by due date (Urgent first)
  const sortedDebts = [...filteredDebts].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  return (
    <div className="min-h-screen bg-slate-50/50 p-8 font-sans text-slate-800 relative">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gestion des Dettes</h1>
            <p className="text-slate-500 mt-1 font-medium">Suivi des factures fournisseurs et échéances.</p>
          </div>
          <button 
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 font-semibold"
          >
            <Plus size={20} /> Ajouter une dette
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mt-6 items-end">
             <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Rechercher par fournisseur..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                />
            </div>
            
            <div className="flex bg-slate-100 p-1 rounded-xl">
                <button 
                    onClick={() => setActiveTab('open')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'open' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    En Cours
                </button>
                <button 
                    onClick={() => setActiveTab('history')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Historique
                </button>
            </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fournisseur / Projet</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Montant</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Dates</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Paiement</th>
                <th className="text-center px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Priorité</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sortedDebts.length === 0 ? (
                 <tr>
                    <td colSpan="6" className="p-10 text-center text-slate-400">
                        <div className="flex flex-col items-center">
                            <FileText size={40} className="mb-2 opacity-20" />
                            <p>Aucune dette trouvée dans cet onglet</p>
                        </div>
                    </td>
                 </tr>
              ) : (
                sortedDebts.map((debt) => {
                  const priority = calculatePriority(debt.dueDate);
                  return (
                    <tr key={debt.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4">
                            <div className="flex flex-col">
                                <span className="font-bold text-slate-800 text-sm">{debt.supplier}</span>
                                <span className="text-xs text-slate-400">{debt.project}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                             <span className="font-mono font-bold text-slate-900">{debt.amount.toLocaleString()} MAD</span>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs flex items-center gap-1.5 text-slate-600">
                                    <Calendar size={12} className="text-slate-400"/> Créé: {debt.date}
                                </span>
                                <span className="text-xs flex items-center gap-1.5 text-slate-600">
                                    <Clock size={12} className="text-slate-400"/> Échéance: {debt.dueDate}
                                </span>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                             <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                {debt.paymentMethod}
                             </span>
                             {debt.responsible && <div className="text-[10px] text-slate-400 mt-1">Resp: {debt.responsible}</div>}
                        </td>
                        <td className="px-6 py-4 text-center">
                            {activeTab === 'open' ? (
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${priority.color}`}>
                                    {priority.label}
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                    Payé
                                </span>
                            )}
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                                {activeTab === 'open' && (
                                    <button 
                                        onClick={() => handleMarkAsPaid(debt.id)}
                                        className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition" 
                                        title="Marquer comme payé"
                                    >
                                        <CheckCircle size={18} />
                                    </button>
                                )}
                                <button onClick={() => handleOpenView(debt)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Voir les détails">
                                    <Eye size={18} />
                                </button>
                                <button onClick={() => handleDelete(debt.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Supprimer">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DebtModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave}
        mode={modalMode}
        initialData={selectedDebt}
      />

      <PaymentProofModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onConfirm={handleConfirmPayment}
      />
    </div>
  );
};

export default DebtsPage;
