import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Wallet, AlertCircle, 
  Plus, Minus, Trash2, Calendar, FileText, CheckCircle, X, Search,
  Smartphone, Hash, LayoutGrid, List, Banknote, CreditCard, ArrowRightLeft, History,
  ArrowDownCircle, ArrowUpCircle
} from 'lucide-react';
import Swal from 'sweetalert2';
import { employeeAPI } from '../../services/api';

// --- MOCK DATA FOR PHONES ---
const MOCK_PHONES = {
    '1': ['0661-123456', '0662-987654'], // Bernard
    '2': ['0663-112233', '0664-445566'], // Sarah
    '3': ['0665-778899'], // Fatiha
};

// --- UTILITY COMPONENTS ---

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

// --- MODAL COMPONENT ---

const TransactionModal = ({ isOpen, onClose, onSave, mode, employees }) => {
    // mode: 'IN_ESPECE', 'OUT_ESPECE', 'IN_VIREMENT', 'OUT_VIREMENT'

    const isIncome = mode?.startsWith('IN');
    const isVirementContext = mode?.includes('VIREMENT');
    const isEspeceContext = mode?.includes('ESPECE');
    
    // Form State
    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        caisseRef: 'Caisse 1',
        employeeId: '',
        phoneNumber: ''
    });

    const [availablePhones, setAvailablePhones] = useState([]);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                amount: '',
                description: '',
                date: new Date().toISOString().split('T')[0],
                caisseRef: 'Caisse 1',
                employeeId: '',
                phoneNumber: ''
            });
            setAvailablePhones([]);
        }
    }, [isOpen]);

    // Handle Employee Selection (Only for OUT_VIREMENT aka Recharge)
    const handleEmployeeChange = (e) => {
        const empId = e.target.value;
        setFormData(prev => ({ ...prev, employeeId: empId, phoneNumber: '' }));
        setAvailablePhones(MOCK_PHONES[empId] || []);
    };

    const handlePhoneSelect = (phone) => {
        const emp = employees.find(e => e.id === formData.employeeId);
        setFormData(prev => ({
            ...prev,
            phoneNumber: phone,
            description: `Recharge ${phone} - ${emp?.name || ''}`
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Determine Category strictly based on MODE
        let category = 'Autre';
        if (isEspeceContext) category = 'Espèce'; // Used for both IN and OUT in Espèce tab
        if (isVirementContext) category = 'Virement'; // Used for both IN and OUT in Virement tab

        onSave({ 
            ...formData, 
            amount: parseFloat(formData.amount),
            type: isIncome ? 'IN' : 'OUT',
            category: category
        });
    };

    if (!isOpen) return null;

    const getTitle = () => {
        if (mode === 'IN_ESPECE') return 'Alimenter Espèce';
        if (mode === 'OUT_ESPECE') return 'Nouvelle Charge Espèce';
        if (mode === 'IN_VIREMENT') return 'Alimenter Virement';
        if (mode === 'OUT_VIREMENT') return 'Nouvelle Recharge (Virement)';
    };

    const getHeaderColor = () => {
        if (isIncome) return 'bg-emerald-50/50 text-emerald-700';
        if (isEspeceContext) return 'bg-amber-50/50 text-amber-700'; // Expense Espèce
        return 'bg-blue-50/50 text-blue-700'; // Expense Virement
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border-t-4 border-t-slate-100">
                
                {/* Header */}
                <div className={`flex justify-between items-center px-8 py-6 border-b border-slate-100 ${getHeaderColor()} rounded-t-3xl`}>
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            {isIncome ? <Plus size={20}/> : (isEspeceContext ? <Banknote size={20}/> : <Smartphone size={20}/>)}
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

                    {/* RECHARGE SPECIFIC FLOW (Only for OUT_VIREMENT) */}
                    {mode === 'OUT_VIREMENT' && (
                        <div className="space-y-4 bg-blue-50/50 p-5 rounded-2xl border border-blue-100 animate-in slide-in-from-top-2">
                            <div className="group">
                                <label className="block text-xs font-bold text-blue-800 mb-1.5 ml-1 uppercase tracking-wider">1. Sélectionner l'Employé</label>
                                <select 
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-white border border-blue-200 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    value={formData.employeeId}
                                    onChange={handleEmployeeChange}
                                >
                                    <option value="">-- Choisir --</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                                    ))}
                                </select>
                            </div>
                            
                            {formData.employeeId && (
                                <div className="group animate-in fade-in slide-in-from-top-1">
                                    <label className="block text-xs font-bold text-blue-800 mb-2 ml-1 uppercase tracking-wider">2. Choisir le Numéro</label>
                                    <div className="space-y-2">
                                        {availablePhones.length > 0 ? availablePhones.map((phone, idx) => (
                                            <label key={idx} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${formData.phoneNumber === phone ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-blue-100 text-slate-600 hover:border-blue-300'}`}>
                                                <input 
                                                    type="radio" 
                                                    name="phone" 
                                                    required
                                                    className="hidden" 
                                                    checked={formData.phoneNumber === phone}
                                                    onChange={() => handlePhoneSelect(phone)}
                                                />
                                                <Smartphone size={18} className={formData.phoneNumber === phone ? 'text-white' : 'text-blue-400'} />
                                                <span className="font-mono font-bold text-sm">{phone}</span>
                                            </label>
                                        )) : (
                                            <div className="text-sm text-slate-500 italic p-2">Aucun numéro associé à cet employé.</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

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
                                rows="2"
                                required
                                readOnly={mode === 'OUT_VIREMENT'} // Read-only if auto-generated for recharge
                                placeholder="Description de l'opération..."
                                className={`w-full px-4 py-3 rounded-xl border text-slate-700 text-sm outline-none transition-all resize-none
                                    ${(mode === 'OUT_VIREMENT') 
                                        ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' 
                                        : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'}`}
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button 
                            type="submit"
                            className={`w-full py-3.5 rounded-xl text-white font-bold flex items-center justify-center gap-2 shadow-lg transition-all transform active:scale-95
                                ${isIncome ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30' : ''}
                                ${isEspeceContext && !isIncome ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/30' : ''}
                                ${isVirementContext && !isIncome ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30' : ''}
                            `}
                        >
                            {isIncome ? 'Confirmer Alimentation' : 'Confirmer Dépense'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- STAT CARD COMPONENT ---
const StatCard = ({ title, amount, type, icon: Icon }) => {
    // type: 'in', 'out', 'balance'
    
    let colorClass, bgClass, iconColor;
    if (type === 'in') {
        colorClass = 'text-emerald-700';
        bgClass = 'bg-emerald-50 border-emerald-100';
        iconColor = 'text-emerald-500';
    } else if (type === 'out') {
         colorClass = 'text-red-700';
        bgClass = 'bg-red-50 border-red-100';
        iconColor = 'text-red-500';
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

// --- DASHBOARD: CHARGE ESPECE ---
const EspeceDashboard = ({ transactions, searchTerm, onDelete }) => {
    // Filter only ESPECE (or Autre for compatibility)
    // Both IN and OUT for history, but specific category match
    const especeTransactions = transactions.filter(t => 
        (t.category === 'Espèce' || t.category === 'Autre') && 
        (t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
         (t.caisseRef && t.caisseRef.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    // Calculate Stats
    const totalIn = especeTransactions.filter(t => t.type === 'IN').reduce((sum, t) => sum + t.amount, 0);
    const totalOut = especeTransactions.filter(t => t.type === 'OUT').reduce((sum, t) => sum + t.amount, 0);
    const currentBalance = totalIn - totalOut;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <StatCard title="Total Entrées" amount={totalIn} type="in" icon={ArrowDownCircle} />
                 <StatCard title="Total Dépenses" amount={totalOut} type="out" icon={ArrowUpCircle} />
                 <StatCard title="Solde Espèce" amount={currentBalance} type="balance" icon={Wallet} />
            </div>

            {/* List */}
             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                    <List size={20} className="text-slate-400"/>
                    <h3 className="font-bold text-slate-800">Historique Charge Espèce</h3>
                </div>
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/3">Motif</th>
                            <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Montant</th>
                            <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {especeTransactions.length === 0 ? (
                            <tr><td colSpan="5" className="p-8 text-center text-slate-400 italic">Aucune opération</td></tr>
                        ) : (
                            especeTransactions.map(t => (
                                <tr key={t.id} className="hover:bg-amber-50/30 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{t.date}</td>
                                    <td className="px-6 py-4">
                                        {t.type === 'IN' ? (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                <TrendingUp size={12} className="mr-1"/> Alimentation
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                                                <Banknote size={12} className="mr-1"/> Dépense
                                            </span>
                                        )}
                                    </td>
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

// --- DASHBOARD: CHARGE VIREMENT (RECHARGE) ---
const VirementDashboard = ({ transactions, employees, searchTerm, onDelete }) => {
    // Filter only VIREMENT
    const virementTransactions = transactions.filter(t => 
        (t.category === 'Virement' || t.category === 'Recharge') &&
        (t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
         (t.caisseRef && t.caisseRef.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    const totalIn = virementTransactions.filter(t => t.type === 'IN').reduce((sum, t) => sum + t.amount, 0);
    const totalOut = virementTransactions.filter(t => t.type === 'OUT').reduce((sum, t) => sum + t.amount, 0);
    const currentBalance = totalIn - totalOut;

    const rechargesOnly = virementTransactions.filter(t => t.type === 'OUT' && t.phoneNumber);

    // Group by Phone
    const phonesStats = rechargesOnly.reduce((acc, curr) => {
        const phone = curr.phoneNumber;
        if (!acc[phone]) {
            acc[phone] = {
                phone,
                employeeName: employees.find(e => e.id == curr.employeeId)?.name || 'Inconnu',
                total: 0,
                lastDate: curr.date
            };
        }
        acc[phone].total += curr.amount;
        if (new Date(curr.date) > new Date(acc[phone].lastDate)) {
            acc[phone].lastDate = curr.date;
        }
        return acc;
    }, {});
    
    const phoneStatsList = Object.values(phonesStats).sort((a, b) => b.total - a.total);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
             {/* Stats Cards */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Total Alimentation" amount={totalIn} type="in" icon={ArrowDownCircle} />
                <StatCard title="Total Recharges" amount={totalOut} type="out" icon={Smartphone} />
                <StatCard title="Solde Virement" amount={currentBalance} type="balance" icon={CreditCard} />
            </div>

            {/* Breakdown Table */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* List of Transactions */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                        <History size={20} className="text-slate-400"/>
                        <h3 className="font-bold text-slate-800">Historique Virement</h3>
                    </div>
                    <div className="overflow-y-auto max-h-[400px] custom-scrollbar">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-100 sticky top-0">
                                <tr>
                                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Date</th>
                                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Description</th>
                                    <th className="text-right px-6 py-3 text-xs font-bold text-slate-500 uppercase">Mnt.</th>
                                    <th className="text-right px-6 py-3 text-xs font-bold text-slate-500 uppercase"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {virementTransactions.map(t => (
                                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-3 text-xs font-bold text-slate-500">{t.date}</td>
                                        <td className="px-6 py-3 text-sm text-slate-700">
                                            {t.type === 'IN' ? <span className="text-emerald-600 font-bold flex items-center gap-1"><Plus size={12}/> Alimentation</span> : t.description}
                                        </td>
                                        <td className={`px-6 py-3 text-right font-mono font-bold text-sm ${t.type === 'IN' ? 'text-emerald-600' : 'text-blue-600'}`}>
                                            {t.type === 'IN' ? '+' : '-'}{t.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <button onClick={() => onDelete(t.id)} className="p-1 text-slate-400 hover:text-red-500" title="Supprimer">
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                 </div>

                {/* By Phone */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                        <List size={20} className="text-slate-400"/>
                        <h3 className="font-bold text-slate-800">Détail par Numéro</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Numéro</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Employé</th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {phoneStatsList.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="p-8 text-center text-slate-400 italic">Aucune recharge</td>
                                    </tr>
                                ) : (
                                    phoneStatsList.map((stat, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">{stat.phone}</span>
                                                <div className="text-[10px] text-slate-400 mt-1">{stat.lastDate}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-600">
                                                {stat.employeeName}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="font-bold text-red-600">-{stat.total.toLocaleString()} MAD</span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MAIN PAGE ---

const PetiteCaissePage = ({ defaultTab = 'espece' }) => {
    // State initialization
    const [transactions, setTransactions] = useState(() => {
        const saved = localStorage.getItem('pettyCash_transactions');
        return saved ? JSON.parse(saved) : [];
    });

    const [employees, setEmployees] = useState([]); 
    const [activeTab, setActiveTab] = useState(defaultTab);
    
    // UI State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState(''); // 'IN_ESPECE' | 'OUT_ESPECE' | 'IN_VIREMENT' | 'OUT_VIREMENT'
    const [toast, setToast] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setActiveTab(defaultTab);
    }, [defaultTab]);

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

    useEffect(() => {
        localStorage.setItem('pettyCash_transactions', JSON.stringify(transactions));
    }, [transactions]);

    // Independent Balances (Re-calc for Header)
    const calculateBalance = (category) => {
        return transactions.reduce((acc, t) => {
            let cat = t.category;
            if (cat === 'Autre') cat = 'Espèce';
            if (cat === 'Recharge') cat = 'Virement';

            if (cat === category) {
                return acc + (t.type === 'IN' ? t.amount : -t.amount);
            }
            return acc;
        }, 0);
    };

    const balanceEspece = calculateBalance('Espèce');
    const balanceVirement = calculateBalance('Virement');

    const handleOpenModal = (action) => {
        const categoryContext = activeTab === 'espece' ? 'ESPECE' : 'VIREMENT';
        setModalMode(`${action}_${categoryContext}`);
        setIsModalOpen(true);
    };

    const handleSaveTransaction = (data) => {
        const newTransaction = {
            id: Date.now(),
            ...data
        };
        setTransactions([newTransaction, ...transactions]);
        setIsModalOpen(false);
        setToast({ message: "Opération enregistrée avec succès !", type: "success" });
        setTimeout(() => setToast(null), 3000);
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Supprimer ?',
            text: "Cette action est irréversible et modifiera le solde.",
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

    const currentBalance = activeTab === 'espece' ? balanceEspece : balanceVirement;
    const isLowBalance = currentBalance < 100;

    return (
        <div className="min-h-screen bg-slate-50/50 p-8 font-sans text-slate-800 relative">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        {activeTab === 'espece' ? 'Gestion Charge Espèce' : 'Gestion Charge Virement'}
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">
                        {activeTab === 'espece' ? 'Suivi de la caisse espèces' : 'Suivi des recharges et virements'}
                    </p>
                </div>
                
                {/* Balance & Actions */}
                <div className="flex items-center gap-4">
                     <button 
                        onClick={() => handleOpenModal('IN')}
                        className="flex items-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 font-bold"
                    >
                        <Plus size={20} /> 
                        {activeTab === 'espece' ? 'Alimenter Espèce' : 'Alimenter Virement'}
                    </button>

                    <div className={`rounded-2xl shadow-sm border px-6 py-4 flex items-center gap-4 transition-all
                        ${isLowBalance ? 'bg-red-50 border-red-200 animate-pulse' : 'bg-white border-slate-200'}`}>
                        <div className={`p-3 rounded-xl ${isLowBalance ? 'bg-red-100 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            <Wallet size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                {activeTab === 'espece' ? 'Solde Espèce' : 'Solde Virement'}
                            </p>
                            <p className={`text-2xl font-black ${isLowBalance ? 'text-red-700' : 'text-slate-800'}`}>
                                {currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Switching (Internal) */}
             <div className="bg-white rounded-2xl p-1.5 flex w-full max-w-md shadow-sm border border-slate-200 mb-8">
                <button 
                    onClick={() => setActiveTab('espece')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all
                    ${activeTab === 'espece' ? 'bg-amber-100 text-amber-800 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <Banknote size={18} /> Charge Espèce
                </button>
                <button 
                    onClick={() => setActiveTab('virement')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all
                    ${activeTab === 'virement' ? 'bg-blue-100 text-blue-800 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <Smartphone size={18} /> Charge Virement
                </button>
            </div>

            {/* ACTION BAR & CONTENT */}
             <div className="flex flex-col gap-6">
                
                {/* Search & Add Button */}
                <div className="flex gap-4">
                     <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Rechercher..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" 
                        />
                    </div>
                    <button 
                        onClick={() => handleOpenModal('OUT')}
                        className={`flex items-center gap-2 px-8 py-3 rounded-xl text-white font-bold shadow-lg transition-transform active:scale-95
                             ${activeTab === 'espece' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'}
                        `}
                    >
                        {activeTab === 'espece' ? <Banknote size={20}/> : <Smartphone size={20}/>}
                        {activeTab === 'espece' ? 'Ajouter Charge Espèce' : 'Nouvelle Recharge'}
                    </button>
                </div>

                {/* Dashboard Views */}
                {activeTab === 'espece' && (
                    <EspeceDashboard transactions={transactions} searchTerm={searchTerm} onDelete={handleDelete} />
                )}

                {activeTab === 'virement' && (
                    <VirementDashboard transactions={transactions} employees={employees} searchTerm={searchTerm} onDelete={handleDelete} />
                )}

             </div>

            <TransactionModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSaveTransaction}
                mode={modalMode}
                employees={employees}
            />
        </div>
    );
};

export default PetiteCaissePage;
