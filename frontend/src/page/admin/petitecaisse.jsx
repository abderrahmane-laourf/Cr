import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Wallet, AlertCircle, 
  Plus, Minus, Trash2, Calendar, FileText, CheckCircle, X, Search 
} from 'lucide-react';
import Swal from 'sweetalert2';
import { employeeAPI } from '../../services/api';

// --- UTILITY COMPONENTS ---

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

// --- MODAL COMPONENT ---

const TransactionModal = ({ isOpen, onClose, onSave, type, employees }) => {
    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        category: 'Autre', // 'Autre' or 'Recharge'
        employeeId: '',
        whatsapp: ''
    });

    useEffect(() => {
        if (isOpen) {
            setFormData({
                amount: '',
                description: '',
                date: new Date().toISOString().split('T')[0],
                category: 'Autre',
                employeeId: '',
                whatsapp: ''
            });
        }
    }, [isOpen]);

    const handleEmployeeChange = (e) => {
        const empId = e.target.value;
        const emp = employees.find(e => e.id === empId);
        
        if (emp) {
            setFormData(prev => ({
                ...prev,
                employeeId: empId,
                whatsapp: emp.phone,
                amount: 10, // Default 10 DH
                description: `Recharge ${emp.name}` // Auto Description
            }));
        } else {
            setFormData(prev => ({ ...prev, employeeId: '', whatsapp: '', amount: '', description: '' }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ 
            ...formData, 
            amount: parseFloat(formData.amount),
            type: type // 'IN' or 'OUT'
        });
    };

    if (!isOpen) return null;

    const isIncome = type === 'IN';
    const isRecharge = formData.category === 'Recharge';

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col animate-in zoom-in-95 duration-200 border-t-4 border-t-slate-100">
                <div className={`flex justify-between items-center px-8 py-6 border-b border-slate-100 ${isIncome ? 'bg-emerald-50/50' : 'bg-red-50/50'} rounded-t-3xl`}>
                    <div>
                        <h2 className={`text-xl font-bold flex items-center gap-2 ${isIncome ? 'text-emerald-700' : 'text-red-700'}`}>
                            {isIncome ? <Plus size={20}/> : <Minus size={20}/>}
                            {isIncome ? 'Alimenter la Caisse' : 'Enregistrer une Dépense'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white hover:bg-slate-100 text-slate-400 hover:text-red-500 rounded-full transition-colors shadow-sm">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    
                    {/* Date Field (Always Visible) */}
                    <div className="group">
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Date</label>
                        <input 
                            type="date"
                            required
                            className="w-full pl-4 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                            value={formData.date}
                            onChange={(e) => setFormData({...formData, date: e.target.value})}
                        />
                    </div>

                    {/* Expense Category Selector */}
                    {!isIncome && (
                         <div className="group">
                            <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Type de Dépense</label>
                            <div className="flex gap-2">
                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, category: 'Autre'})}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${formData.category === 'Autre' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200'}`}
                                >
                                    Autre
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, category: 'Recharge'})}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${formData.category === 'Recharge' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200'}`}
                                >
                                    Recharge
                                </button>
                            </div>
                         </div>
                    )}

                    {/* Recharge Specific Fields */}
                    {isRecharge && !isIncome && (
                        <div className="space-y-4 bg-blue-50 p-4 rounded-xl border border-blue-100 animate-in slide-in-from-top-2">
                            <div className="group">
                                <label className="block text-xs font-bold text-blue-800 mb-1.5 ml-1 uppercase tracking-wider">Employé (Recharge)</label>
                                <select 
                                    className="w-full pl-4 pr-4 py-3 rounded-xl bg-white border border-blue-200 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    value={formData.employeeId}
                                    onChange={handleEmployeeChange}
                                >
                                    <option value="">Sélectionner un employé</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="group">
                                <label className="block text-xs font-bold text-blue-800 mb-1.5 ml-1 uppercase tracking-wider">Numéro WhatsApp</label>
                                <input 
                                    type="text"
                                    readOnly
                                    placeholder="Sélectionnez un employé..."
                                    className="w-full pl-4 pr-4 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-sm font-mono cursor-not-allowed"
                                    value={formData.whatsapp}
                                />
                            </div>
                        </div>
                    )}

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
                            rows="2"
                            required
                            placeholder={isIncome ? "Ex: Retrait banque..." : "Ex: Taxi, Café..."}
                            className="w-full pl-4 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    <div className="pt-2">
                        <button 
                            type="submit"
                            className={`w-full py-3.5 rounded-xl text-white font-bold flex items-center justify-center gap-2 shadow-lg transition-all transform active:scale-95
                                ${isIncome ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30' : 'bg-red-600 hover:bg-red-700 shadow-red-500/30'}
                            `}
                        >
                            {isIncome ? 'Confirmer Ajout' : 'Confirmer Dépense'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- MAIN PAGE ---

const PetiteCaissePage = () => {
    // State initialization with LocalStorage
    const [transactions, setTransactions] = useState(() => {
        const saved = localStorage.getItem('pettyCash_transactions');
        return saved ? JSON.parse(saved) : [];
    });

    const [employees, setEmployees] = useState([]); // Employee Data
    
    // Derived State
    const [balance, setBalance] = useState(0);
    
    // UI State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [transactionType, setTransactionType] = useState('OUT'); // 'IN' or 'OUT'
    const [toast, setToast] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch Employees
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const data = await employeeAPI.getAll();
                setEmployees(data);
            } catch (error) {
                console.error("Error fetching employees:", error);
            }
        };
        fetchEmployees();
    }, []);

    // Effect to calculate totals/balance and save to LS
    useEffect(() => {
        let inc = 0;
        let exp = 0;
        
        transactions.forEach(t => {
            if(t.type === 'IN') inc += t.amount;
            else exp += t.amount;
        });

        setBalance(inc - exp);
        localStorage.setItem('pettyCash_transactions', JSON.stringify(transactions));
    }, [transactions]);

    const handleOpenModal = (type) => {
        setTransactionType(type);
        setIsModalOpen(true);
    };

    const handleSaveTransaction = (data) => {
        const newTransaction = {
            id: Date.now(),
            ...data
        };
        setTransactions([newTransaction, ...transactions]);
        setIsModalOpen(false);
        setToast({ message: data.type === 'IN' ? "Montant ajouté !" : "Dépense enregistrée !", type: "success" });
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Supprimer ?',
            text: "Attention, cela modifiera le solde actuel.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler'
        }).then((result) => {
            if (result.isConfirmed) {
                setTransactions(transactions.filter(t => t.id !== id));
                Swal.fire('Supprimé!', 'L\'opération a été annulée.', 'success');
            }
        });
    };

    const filteredTransactions = transactions.filter(t => 
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isLowBalance = balance < 100;

    return (
        <div className="min-h-screen bg-slate-50/50 p-8 font-sans text-slate-800 relative">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Title */}
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gestion de la Petite Caisse</h1>
                <p className="text-slate-500 mt-1 font-medium">Suivi de la trésorerie et des menues dépenses.</p>
            </div>

            {/* Dashboard Cards (Reduced to Balance Only as requested) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                
                {/* Balance Card */}
                <div className={`rounded-2xl shadow-sm border p-6 flex flex-col justify-between transition-all md:col-span-3
                    ${isLowBalance 
                        ? 'bg-red-50 border-red-200 animate-pulse' 
                        : 'bg-white border-slate-200'
                    }`}>
                    <div className="flex justify-between items-start mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center 
                            ${isLowBalance ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                            <Wallet size={24} />
                        </div>
                        {isLowBalance && (
                            <span className="bg-red-200 text-red-800 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                <AlertCircle size={12} /> Solde Bas
                            </span>
                        )}
                    </div>
                    <div>
                        <h3 className={`font-bold text-[10px] uppercase tracking-wider mb-1 
                            ${isLowBalance ? 'text-red-500' : 'text-slate-500'}`}>
                            Solde Actuel (الرصيد الحالي)
                        </h3>
                        <p className={`text-5xl font-black ${isLowBalance ? 'text-red-700' : 'text-slate-900'}`}>
                            {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
                            <span className="text-lg opacity-50 ml-2 font-medium">MAD</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Actions & Ledger */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                 <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Rechercher une opération..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                    />
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => handleOpenModal('IN')}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 font-bold"
                    >
                        <Plus size={20} /> Alimenter
                    </button>
                    <button 
                        onClick={() => handleOpenModal('OUT')}
                        className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 font-bold"
                    >
                        <Minus size={20} /> Dépense
                    </button>
                </div>
            </div>

            {/* Transaction List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/2">Motif / Description</th>
                            <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Montant</th>
                            <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredTransactions.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-10 text-center text-slate-400">
                                    <div className="flex flex-col items-center">
                                        <FileText size={40} className="mb-2 opacity-20" />
                                        <p>Aucune opération enregistrée</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredTransactions.map((t) => (
                                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="opacity-50"/> {t.date}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {t.type === 'IN' ? (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                <TrendingUp size={12} className="mr-1"/> Alimentation
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                                                <TrendingDown size={12} className="mr-1"/> Dépense
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-800 font-medium">
                                        {t.description}
                                    </td>
                                    <td className={`px-6 py-4 text-right font-mono font-bold ${t.type === 'IN' ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {t.type === 'IN' ? '+' : '-'}{t.amount.toLocaleString()} MAD
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleDelete(t.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Supprimer">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <TransactionModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSaveTransaction}
                type={transactionType}
                employees={employees}
            />
        </div>
    );
};

export default PetiteCaissePage;
