import { createPortal } from 'react-dom';
import { Search, Plus, Printer, X, Check, ChevronDown, Edit2, 
  FileText, DollarSign, Trash2, Download, Paperclip, TrendingUp, TrendingDown 
} from 'lucide-react';
import { employeeAPI, paymentAPI, presenceAPI, calculateSalaryAdjustments } from '../../services/api';
import Swal from 'sweetalert2';
import SpotlightCard from '../../util/SpotlightCard';
import { useState, useEffect } from 'react';

// --- UTILITAIRES ---
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 2 }).format(amount);
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
};

// --- COMPOSANT BADGE ---
const Badge = ({ children, color = 'blue' }) => {
  const styles = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
    orange: 'bg-orange-50 text-orange-700 border-orange-100',
    gray: 'bg-slate-100 text-slate-600 border-slate-200',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold border ${styles[color] || styles.blue}`}>
      {children}
    </span>
  );
};

// --- MODAL REÇU (IMPRESSION) ---
const ReceiptModal = ({ isOpen, onClose, payment, employee }) => {
  if (!isOpen || !payment) return null;

  const handlePrint = () => {
    window.print(); 
  };

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 dark:border dark:border-blue-500/20 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-[#2563EB]/5">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <Printer size={18} className="text-[#2563EB]"/> Reçu de Paiement
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full text-slate-400 transition"><X size={20}/></button>
        </div>

        {/* Contenu Reçu */}
        <div className="p-8 bg-white dark:bg-slate-900 print:p-0 overflow-y-auto custom-scrollbar">
          <div className="border-2 border-slate-100 rounded-xl p-6 relative overflow-hidden">
            {/* Décoration */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#2563EB]/20 rounded-full opacity-50 blur-2xl"></div>

            {/* Logo & Info */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">HERBOCLEAR</h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Reçu #{payment.id}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-500">{formatDate(payment.date)}</p>
                <div className="mt-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded inline-block uppercase">{payment.method}</div>
              </div>
            </div>

            {/* Employé */}
            <div className="mb-6 flex items-center gap-3 pb-6 border-b border-dashed border-slate-200">
              <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden">
                 <img src={employee?.avatar} className="w-full h-full object-cover" alt=""/>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{employee?.name}</p>
                <p className="text-xs text-slate-500">{employee?.role} | <span className="text-[#2563EB] font-semibold">{payment.type}</span></p>
              </div>
            </div>

            {/* DÉTAILS DU CALCUL */}
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between text-slate-600 items-center">
                <span>Salaire de base</span>
                <span className="font-semibold text-slate-800">{formatCurrency(payment.basic)}</span>
              </div>
              
              {/* Afficher Commission seulement si > 0 */}
              {payment.commission > 0 && (
                <div className="flex justify-between text-emerald-700 bg-emerald-50 p-2 rounded-lg items-center">
                  <span className="flex items-center gap-1 text-xs font-bold uppercase"><Plus size={10}/> Commissions / Primes</span>
                  <span className="font-bold">+{formatCurrency(payment.commission)}</span>
                </div>
              )}

              {/* Afficher Déduction seulement si > 0 */}
              {payment.deduction > 0 && (
                <div className="flex justify-between text-red-700 bg-red-50 p-2 rounded-lg items-center">
                  <span className="flex items-center gap-1 text-xs font-bold uppercase"><X size={10}/> Déductions / Avances</span>
                  <span className="font-bold">-{formatCurrency(payment.deduction)}</span>
                </div>
              )}
            </div>

            {/* Total Net */}
            <div className="bg-slate-900 p-4 rounded-xl flex justify-between items-center text-white shadow-lg shadow-slate-200">
              <span className="font-bold text-sm text-slate-300">Net à Payer</span>
              <span className="text-2xl font-black">{formatCurrency(payment.net)}</span>
            </div>
            
            <p className="text-[10px] text-slate-400 text-center mt-6">Signature de l'employeur _________________</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 flex gap-3 bg-slate-50">
           <button onClick={handlePrint} className="w-full py-3 rounded-xl bg-[#2563EB] text-white font-semibold hover:bg-[#1e40af] shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-colors">
             <Printer size={18}/> Imprimer le Reçu
           </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// --- MODAL AVANCE (SIMPLE) ---
const AvanceModal = ({ isOpen, onClose, onSave, employees }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    date: new Date().toISOString().slice(0, 10),
    amount: '',
    method: 'Espèces',
    proof: null
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.employeeId || !formData.amount) return;
    
    onSave({
      ...formData,
      type: 'Avance',
      basic: 0,
      commission: 0,
      deduction: parseFloat(formData.amount),
      net: -parseFloat(formData.amount), // Negative because it's an advance
      month: formData.date.slice(0, 7),
      proofUrl: formData.proof ? URL.createObjectURL(formData.proof) : null
    });
    setFormData({ employeeId: '', date: new Date().toISOString().slice(0, 10), amount: '', method: 'Espèces', proof: null });
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className="bg-white dark:bg-slate-900 dark:border dark:border-blue-500/20 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Nouvelle Avance</h2>
          <button onClick={onClose} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Employé <span className="text-red-400">*</span></label>
            <select 
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none"
              value={formData.employeeId}
              onChange={e => setFormData({...formData, employeeId: e.target.value})}
              required
            >
              <option value="">Sélectionner...</option>
              {employees?.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Date</label>
              <input 
                type="date" 
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Montant <span className="text-red-400">*</span></label>
              <input 
                type="number" 
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Moyen de paiement</label>
            <select 
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none"
              value={formData.method}
              onChange={e => setFormData({...formData, method: e.target.value})}
            >
              <option>Espèces</option>
              <option>Virement</option>
              <option>Chèque</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Preuve (optionnel)</label>
            <label className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-slate-50 border border-dashed border-slate-300 hover:border-orange-400 cursor-pointer transition-colors group">
              <Download size={16} className="text-slate-400 group-hover:text-orange-500"/>
              <span className="text-sm text-slate-500 group-hover:text-slate-700">Ajouter un fichier...</span>
              <input type="file" className="hidden" onChange={e => setFormData({...formData, proof: e.target.files[0]})} />
            </label>
            {formData.proof && <p className="text-xs text-emerald-600 font-medium ml-1 flex items-center gap-1"><Check size={12}/> {formData.proof.name}</p>}
          </div>

          <button type="submit" className="w-full py-3 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 shadow-lg transition-all flex items-center justify-center gap-2">
            <Check size={18} /> Enregistrer l'Avance
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};

// --- MODAL PRIME (SIMPLE) ---
const PrimeModal = ({ isOpen, onClose, onSave, employees }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    date: new Date().toISOString().slice(0, 10),
    amount: '',
    reason: '',
    method: 'Virement',
    proof: null
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.employeeId || !formData.amount) return;
    
    onSave({
      ...formData,
      type: 'Prime',
      basic: 0,
      commission: parseFloat(formData.amount),
      deduction: 0,
      net: parseFloat(formData.amount),
      month: formData.date.slice(0, 7),
      proofUrl: formData.proof ? URL.createObjectURL(formData.proof) : null
    });
    setFormData({ employeeId: '', date: new Date().toISOString().slice(0, 10), amount: '', reason: '', method: 'Virement', proof: null });
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className="bg-white dark:bg-slate-900 dark:border dark:border-blue-500/20 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Nouvelle Prime</h2>
          <button onClick={onClose} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Employé <span className="text-red-400">*</span></label>
            <select 
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none"
              value={formData.employeeId}
              onChange={e => setFormData({...formData, employeeId: e.target.value})}
              required
            >
              <option value="">Sélectionner...</option>
              {employees?.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Date</label>
              <input 
                type="date" 
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Montant <span className="text-red-400">*</span></label>
              <input 
                type="number" 
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Raison / Description</label>
            <textarea 
              placeholder="Ex: Performance exceptionnelle, objectifs atteints..."
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none resize-none"
              rows="2"
              value={formData.reason}
              onChange={e => setFormData({...formData, reason: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Moyen de paiement</label>
            <select 
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none"
              value={formData.method}
              onChange={e => setFormData({...formData, method: e.target.value})}
            >
              <option>Virement</option>
              <option>Espèces</option>
              <option>Chèque</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Preuve (optionnel)</label>
            <label className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-slate-50 border border-dashed border-slate-300 hover:border-emerald-400 cursor-pointer transition-colors group">
              <Download size={16} className="text-slate-400 group-hover:text-emerald-500"/>
              <span className="text-sm text-slate-500 group-hover:text-slate-700">Ajouter un fichier...</span>
              <input type="file" className="hidden" onChange={e => setFormData({...formData, proof: e.target.files[0]})} />
            </label>
            {formData.proof && <p className="text-xs text-emerald-600 font-medium ml-1 flex items-center gap-1"><Check size={12}/> {formData.proof.name}</p>}
          </div>

          <button type="submit" className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-lg transition-all flex items-center justify-center gap-2">
            <Check size={18} /> Enregistrer la Prime
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};

// --- MODAL AJOUT/EDIT PAIEMENT (AVEC AUTO-CALCUL) ---
const AddPaymentModal = ({ isOpen, onClose, onSave, employees, initialData }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    month: new Date().toISOString().slice(0, 7),
    type: 'Salaire',
    basic: '',
    commission: 0,
    deduction: 0,
    method: 'Virement',
    proof: null
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        month: initialData.month || new Date().toISOString().slice(0, 7),
        proof: null // Reset proof as we can't preload file inputs
      });
    } else {
      setFormData({
        employeeId: '',
        month: new Date().toISOString().slice(0, 7),
        type: 'Salaire',
        basic: '',
        commission: 0,
        deduction: 0,
        method: 'Virement',
        proof: null
      });
    }
  }, [initialData, isOpen]);

  const [calculatedData, setCalculatedData] = useState(null);
  const [presenceRecords, setPresenceRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  // Stable onChange handler to prevent input focus loss
  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Auto-calculate when employee or month changes
  useEffect(() => {
    if (formData.employeeId && formData.month) {
      calculateFromPresence();
    }
  }, [formData.employeeId, formData.month]);

  const calculateFromPresence = async () => {
    try {
      setLoading(true);
      const result = await paymentAPI.calculatePayment(formData.employeeId, formData.month);
      const records = await presenceAPI.getAll({ employeeId: formData.employeeId, month: formData.month });
      
      setCalculatedData(result);
      setPresenceRecords(records);
      setFormData(prev => ({
        ...prev,
        basic: result.basic,
        commission: result.commission,
        deduction: result.deduction
      }));
    } catch (error) {
      console.error('Error calculating payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const netSalary = (parseFloat(formData.basic || 0) + parseFloat(formData.commission || 0)) - parseFloat(formData.deduction || 0);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.employeeId || !formData.basic) return;
    
    onSave({
      ...formData,
      net: netSalary,
      date: new Date().toISOString().slice(0, 10),
      basic: parseFloat(formData.basic),
      commission: parseFloat(formData.commission),
      deduction: parseFloat(formData.deduction),
      proofUrl: formData.proof ? URL.createObjectURL(formData.proof) : null
    });
    onClose();
  };

  const selectedEmployee = employees?.find(e => String(e.id) === String(formData.employeeId));

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <SpotlightCard theme="light" className="w-full max-w-3xl flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh] !p-0 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">
        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-[#1e3a8a]">{initialData ? 'Modifier le paiement' : 'Ajouter un paiement'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Ligne 1 : Employé */}
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Employé <span className="text-red-400">*</span></label>
              <div className="relative">
                <select 
                  className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none appearance-none font-semibold text-slate-700"
                  value={formData.employeeId}
                  onChange={e => handleFieldChange('employeeId', e.target.value)}
                  required
                >
                  <option value="">Sélectionner...</option>
                  {employees?.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>
          </div>

          {/* Ligne 2 : Mois */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Mois concerné</label>
              <input type="month" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none"
                value={formData.month} onChange={e => handleFieldChange('month', e.target.value)} />
            </div>
          </div>

          {/* Auto-Calculated Breakdown */}
          {calculatedData && selectedEmployee && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign size={20} className="text-blue-600"/>
                <h3 className="font-bold text-blue-900">Calcul Automatique du Salaire</h3>
              </div>

              <div className="bg-white rounded-xl p-4 space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Salaire mensuel de base</span>
                  <span className="font-bold text-slate-800">{formatCurrency(calculatedData.basic)}</span>
                </div>
                <div className="text-xs text-slate-500 pl-4">
                  <p>📅 Taux journalier: {formatCurrency(calculatedData.dailyRate)} (Salaire ÷ 26)</p>
                  <p>⏰ Taux horaire: {formatCurrency(calculatedData.hourlyRate)} (Journalier ÷ 8)</p>
                </div>
              </div>

              {presenceRecords.length > 0 && (
                <div className="bg-white rounded-xl p-4 mb-4">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-3">Ajustements de Présence ({presenceRecords.length})</p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {presenceRecords.map(record => (
                      <div key={record.id} className="flex justify-between text-xs">
                        <span className="text-slate-600">{formatDate(record.date)}</span>
                        <span className={record.daysAdj > 0 || record.hoursAdj > 0 ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'}>
                          {record.daysAdj !== 0 && `${record.daysAdj > 0 ? '+' : ''}${record.daysAdj}j `}
                          {record.hoursAdj !== 0 && `${record.hoursAdj > 0 ? '+' : ''}${record.hoursAdj}h`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {calculatedData.commission > 0 && (
                  <div className="bg-emerald-100 p-3 rounded-lg">
                    <div className="flex items-center gap-1 mb-1">
                      <TrendingUp size={14} className="text-emerald-700"/>
                      <span className="text-[10px] font-bold text-emerald-700 uppercase">Commission</span>
                    </div>
                    <span className="text-lg font-black text-emerald-700">+{formatCurrency(calculatedData.commission)}</span>
                  </div>
                )}
                {calculatedData.deduction > 0 && (
                  <div className="bg-red-100 p-3 rounded-lg">
                    <div className="flex items-center gap-1 mb-1">
                      <TrendingDown size={14} className="text-red-700"/>
                      <span className="text-[10px] font-bold text-red-700 uppercase">Déduction</span>
                    </div>
                    <span className="text-lg font-black text-red-700">-{formatCurrency(calculatedData.deduction)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Net Salary & Method */}
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
             <div className="space-y-2">
                <label className="text-xs font-bold text-blue-800 uppercase ml-1">Net à Payer</label>
                <div className="text-3xl font-black text-blue-600 tracking-tight">{formatCurrency(netSalary)}</div>
             </div>
             <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Moyen de paiement</label>
                <div className="relative">
                  <select 
                    className="w-full pl-4 pr-10 py-3 rounded-xl bg-white border border-slate-200 text-sm outline-none appearance-none"
                    value={formData.method}
                    onChange={e => handleFieldChange('method', e.target.value)}
                  >
                    <option>Virement</option>
                    <option>Espèces</option>
                    <option>Chèque</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
             </div>
          </div>

           {/* Preuve */}
           <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Preuve de paiement (Scan/Photo)</label>
              <label className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-slate-50 border border-dashed border-slate-300 hover:border-blue-400 cursor-pointer transition-colors group">
                 <div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center text-slate-400 group-hover:text-blue-500"><Download size={16}/></div>
                 <span className="text-sm text-slate-500 group-hover:text-slate-700">Ajouter un fichier (Image, PDF)...</span>
                 <input type="file" className="hidden" onChange={e => setFormData({...formData, proof: e.target.files[0]})} />
              </label>
              {formData.proof && <p className="text-xs text-emerald-600 font-medium ml-1 flex items-center gap-1"><Check size={12}/> {formData.proof.name}</p>}
           </div>

          <button type="submit" className="w-full py-4 rounded-xl bg-[#2563EB] text-white font-bold text-lg hover:bg-[#1e3a8a] shadow-xl shadow-blue-900/20 transition-all flex items-center justify-center gap-2 mt-4">
             <Check size={20} /> Enregistrer
          </button>
        </form>
      </SpotlightCard>
    </div>,
    document.body
  );
};

// --- PAGE PRINCIPALE ---
export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All'); // Added role filter state
  const [loading, setLoading] = useState(true);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAvanceModalOpen, setIsAvanceModalOpen] = useState(false);
  const [isPrimeModalOpen, setIsPrimeModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null); 
  const [expandedEmployeeId, setExpandedEmployeeId] = useState(null);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [empData, paymentData] = await Promise.all([
        employeeAPI.getAll(),
        paymentAPI.getAll()
      ]);
      setEmployees(empData);
      setPayments(paymentData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleEmployee = (id) => {
    setExpandedEmployeeId(expandedEmployeeId === id ? null : id);
  };

  const [editingPayment, setEditingPayment] = useState(null);

  const handleAddPayment = async (paymentData) => {
    try {
      if (paymentData.id) {
        await paymentAPI.update(paymentData.id, paymentData);
      } else {
        await paymentAPI.create(paymentData);
      }
      loadData();
      setExpandedEmployeeId(paymentData.employeeId);
      setIsAddModalOpen(false);
      setEditingPayment(null);
    } catch (error) {
      console.error('Error saving payment:', error);
    }
  };

  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    setIsAddModalOpen(true);
  };

  const handleDeletePayment = async (id) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Vous ne pourrez pas revenir en arrière !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        await paymentAPI.delete(id);
        Swal.fire(
          'Supprimé !',
          'Le paiement a été supprimé.',
          'success'
        );
        loadData();
      } catch (error) {
        console.error('Error deleting payment:', error);
        Swal.fire(
          'Erreur !',
          'Une erreur est survenue lors de la suppression.',
          'error'
        );
      }
    }
  };

  const handleViewProof = (url) => {
      if(url) {
          alert("Dans une vraie application, ceci ouvrirait le fichier : " + url);
      } else {
          alert("Aucune preuve jointe pour ce paiement.");
      }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || emp.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="w-full min-h-screen bg-transparent animate-[fade-in_0.6s_ease-out] p-8 font-sans text-slate-800 dark:text-slate-200">
      
      {/* HEADER */}
      <SpotlightCard theme="light" className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#2563EB] tracking-tight">Gérer les Paiements</h1>
            <p className="text-slate-500 mt-1 font-medium">Historique des salaires, avances et primes.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsAvanceModalOpen(true)} 
              className="flex items-center justify-center gap-2 px-5 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/30 font-semibold"
            >
              <TrendingDown size={18} /> Avance
            </button>
            <button 
              onClick={() => setIsPrimeModalOpen(true)} 
              className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/30 font-semibold"
            >
              <TrendingUp size={18} /> Prime
            </button>
            <button 
              onClick={() => { setEditingPayment(null); setIsAddModalOpen(true); }} 
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#2563EB] text-white rounded-xl hover:bg-[#1e3a8a] transition-all shadow-lg shadow-blue-900/20 font-semibold"
            >
              <Plus size={20} /> Salaire
            </button>
          </div>
        </div>
        
        {/* FILTERS SECTION */}
        <div className="flex flex-col md:flex-row gap-4 mt-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2563EB]/50" size={20} />
            <input type="text" placeholder="Chercher un employé..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all" />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <select 
              value={roleFilter} 
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full md:w-48 pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all appearance-none cursor-pointer"
            >
              <option value="All">Tous les rôles</option>
              <option value="Employé">Employé</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>
        </div>
      </SpotlightCard>

      {/* LISTE */}
      <div className="space-y-4">
        {filteredEmployees.map(employee => {
          const employeePayments = payments.filter(p => String(p.employeeId) === String(employee.id)).sort((a,b) => new Date(b.date) - new Date(a.date));
          const totalPaid = employeePayments.reduce((sum, p) => sum + p.net, 0);
          const isExpanded = expandedEmployeeId === employee.id;

          return (
            <SpotlightCard theme="light" key={employee.id} className={`!border transition-all duration-300 overflow-hidden !p-0 ${isExpanded ? '!border-[#018790] shadow-md' : '!border-slate-200 shadow-sm'}`}>
              
              {/* Ligne Résumé */}
              <div onClick={() => toggleEmployee(employee.id)} className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-colors overflow-hidden ${isExpanded ? 'bg-[#2563EB]/10 ring-4 ring-[#2563EB]/5' : 'bg-slate-100'}`}>
                    <img src={employee.avatar} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{employee.name}</h3>
                    <div className="flex gap-2 mt-1">
                        <Badge color={employee.role === 'Admin' ? 'purple' : 'blue'}>{employee.role}</Badge>
                        <span className="text-xs text-slate-400 flex items-center gap-1"><FileText size={12}/> {employeePayments.length} paiements</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-slate-400 uppercase">Total Versé</p>
                    <p className="text-xl font-black text-slate-800">{formatCurrency(totalPaid)}</p>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${isExpanded ? 'bg-[#2563EB] border-[#2563EB] text-white rotate-180' : 'bg-white border-slate-200 text-slate-400'}`}>
                    <ChevronDown size={18} />
                  </div>
                </div>
              </div>

              {/* Détails Paiements */}
              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-6">
                  {employeePayments.length > 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                          <tr>
                            <th className="px-5 py-3">Mois</th>
                            <th className="px-5 py-3">Date</th>
                            <th className="px-5 py-3">Type</th>
                            <th className="px-5 py-3">Net Payé</th>
                            <th className="px-5 py-3">Moyen</th>
                            <th className="px-5 py-3 text-right">Documents</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {employeePayments.map(payment => (
                            <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-5 py-4 font-medium text-slate-700">{payment.month}</td>
                              <td className="px-5 py-4 text-slate-500">{formatDate(payment.date)}</td>
                              <td className="px-5 py-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold 
                                    ${payment.type === 'Avance' ? 'bg-orange-100 text-orange-700' : 
                                      payment.type === 'Prime' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {payment.type}
                                </span>
                              </td>
                              <td className="px-5 py-4 font-bold text-slate-900">{formatCurrency(payment.net)}</td>
                              <td className="px-5 py-4">
                                <span className={`flex items-center gap-1.5 text-xs font-bold ${payment.method === 'Virement' ? 'text-emerald-600' : 'text-slate-600'}`}>
                                  {payment.method}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  {/* BOUTON PREUVE */}
                                  <button 
                                    onClick={() => handleViewProof(payment.proofUrl)}
                                    className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-colors"
                                    title="Voir la preuve"
                                  >
                                    <Paperclip size={16}/>
                                  </button>
                                  
                                  {/* BOUTON REÇU */}
                                  <button 
                                    onClick={() => setReceiptData({ payment, employee })}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-[#00B7B5]/10 text-[#00B7B5] rounded-lg hover:bg-[#00B7B5]/20 font-semibold transition-colors text-xs"
                                  >
                                    <Printer size={14}/> Reçu
                                  </button>

                                  <button 
                                    onClick={() => handleEditPayment(payment)}
                                    className="p-2 bg-orange-50 text-orange-500 rounded-lg hover:bg-orange-100 transition-colors"
                                    title="Modifier"
                                  >
                                    <Edit2 size={16}/>
                                  </button>

                                  <button 
                                    onClick={() => handleDeletePayment(payment.id)}
                                    className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                                    title="Supprimer"
                                  >
                                    <Trash2 size={16}/>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <SpotlightCard theme="light" className="text-center py-8 text-slate-400 bg-white dark:bg-slate-900 !border-dashed !border-slate-200 dark:!border-slate-700">
                      <DollarSign size={32} className="mx-auto mb-2 opacity-20"/>
                      <p>Aucun paiement enregistré.</p>
                    </SpotlightCard>
                  )}
                </div>
              )}
            </SpotlightCard>
          );
        })}
      </div>

      <AddPaymentModal 
        isOpen={isAddModalOpen} 
        onClose={() => { setIsAddModalOpen(false); setEditingPayment(null); }} 
        onSave={handleAddPayment}
        employees={employees}
        initialData={editingPayment}
      />

      <AvanceModal 
        isOpen={isAvanceModalOpen} 
        onClose={() => setIsAvanceModalOpen(false)} 
        onSave={handleAddPayment}
        employees={employees}
      />

      <PrimeModal 
        isOpen={isPrimeModalOpen} 
        onClose={() => setIsPrimeModalOpen(false)} 
        onSave={handleAddPayment}
        employees={employees}
      />

      <ReceiptModal 
        isOpen={!!receiptData}
        onClose={() => setReceiptData(null)}
        payment={receiptData?.payment}
        employee={receiptData?.employee}
      />
    </div>
  );
}