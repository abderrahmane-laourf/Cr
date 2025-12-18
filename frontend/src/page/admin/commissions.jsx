import React, { useState, useEffect } from 'react';
import { User, Package, Save, RotateCcw, DollarSign, TrendingUp, CheckCircle, AlertCircle, X, ChevronDown } from 'lucide-react';
import { employeeAPI, productAPI } from '../../services/api';
import Swal from 'sweetalert2';
import SpotlightCard from '../../util/SpotlightCard';

// --- COMPOSANTS UTILITAIRES ---

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

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

const CommissionsPage = () => {
  const [employees, setEmployees] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [commissions, setCommissions] = useState({});
  const [bulkValues, setBulkValues] = useState({ c1: '', c2: '', c3: '' });
  const [toast, setToast] = useState(null);
  const [applySuccess, setApplySuccess] = useState(false);

  // Charger les données au montage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [empsData, prodsData] = await Promise.all([
        employeeAPI.getAll(),
        productAPI.getAll()
      ]);
      
      setEmployees(empsData);
      setProducts(prodsData);
      
      // Charger les commissions depuis localStorage
      const savedCommissions = JSON.parse(localStorage.getItem('sys_commissions') || '{}');
      setCommissions(savedCommissions);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      showToast('Erreur lors du chargement des données', 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  // Charger le tableau pour un employé
  const loadTable = (employeeId) => {
    const emp = employees.find(e => e.id === employeeId);
    setSelectedEmployee(emp);
    setBulkValues({ c1: '', c2: '', c3: '' });
  };

  // Obtenir la commission pour un employé/produit
  const getCommission = (empId, prodId, column) => {
    return commissions[empId]?.[prodId]?.[column] || '';
  };

  // Mettre à jour une commission
  const updateCommission = (empId, prodId, column, value) => {
    setCommissions(prev => ({
      ...prev,
      [empId]: {
        ...prev[empId],
        [prodId]: {
          ...prev[empId]?.[prodId],
          [column]: value
        }
      }
    }));
  };

  // Appliquer les valeurs en masse
  const applyBulk = () => {
    if (!selectedEmployee) return;
    if (!bulkValues.c1 && !bulkValues.c2 && !bulkValues.c3) {
      showToast('Veuillez entrer au moins une valeur', 'error');
      return;
    }

    const newCommissions = { ...commissions };
    if (!newCommissions[selectedEmployee.id]) {
      newCommissions[selectedEmployee.id] = {};
    }

    products.forEach(product => {
      if (!newCommissions[selectedEmployee.id][product.id]) {
        newCommissions[selectedEmployee.id][product.id] = {};
      }
      
      if (bulkValues.c1) {
        newCommissions[selectedEmployee.id][product.id].c1 = bulkValues.c1;
      }
      if (bulkValues.c2) {
        newCommissions[selectedEmployee.id][product.id].c2 = bulkValues.c2;
      }
      if (bulkValues.c3) {
        newCommissions[selectedEmployee.id][product.id].c3 = bulkValues.c3;
      }
    });

    setCommissions(newCommissions);
    setApplySuccess(true);
    showToast('Commissions appliquées avec succès !', 'success');
    setTimeout(() => setApplySuccess(false), 1500);
  };

  // Sauvegarder les données
  const saveData = () => {
    Swal.fire({
      title: 'Sauvegarder les commissions ?',
      text: 'Les modifications seront enregistrées',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1e3a8a',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, sauvegarder',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.setItem('sys_commissions', JSON.stringify(commissions));
        showToast('Les commissions ont été enregistrées avec succès', 'success');
      }
    });
  };

  // Réinitialiser
  const resetData = () => {
    Swal.fire({
      title: 'Réinitialiser toutes les commissions ?',
      text: 'Cette action est irréversible !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Oui, réinitialiser',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        setCommissions({});
        localStorage.removeItem('sys_commissions');
        setSelectedEmployee(null);
        showToast('Toutes les commissions ont été supprimées', 'success');
      }
    });
  };

  return (
    <div className="w-full min-h-screen bg-transparent animate-[fade-in_0.6s_ease-out] p-8 font-sans text-slate-800 dark:text-slate-200 relative">
      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <SpotlightCard theme="light" className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#2563EB] tracking-tight flex items-center gap-3">
              <DollarSign className="text-[#1e3a8a]" size={32} />
              Gestion des Commissions
            </h1>
            <p className="text-slate-500 mt-1 font-medium">
              Définissez les commissions par employé et par produit.
            </p>
          </div>
          <button
            onClick={resetData}
            className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-100 transition-all font-semibold shadow-sm"
          >
            <RotateCcw size={18} />
            Réinitialiser
          </button>
        </div>

        {/* Sélection employé */}
        <div className="mt-8">
            <label className="block text-xs font-bold text-slate-500 mb-2 ml-1 uppercase tracking-wider">
              Sélectionner un employé
            </label>
           <div className="relative max-w-md">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2563EB]">
                <User size={20} />
            </div>
            <select
                value={selectedEmployee?.id || ''}
                onChange={(e) => loadTable(e.target.value)}
                className="w-full pl-11 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] focus:bg-white transition-all appearance-none cursor-pointer"
            >
                <option value="">-- Choisir un employé --</option>
                {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.role || 'Employé'})
                </option>
                ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
           </div>
        </div>
      </SpotlightCard>

      {/* Bulk Apply */}
      {selectedEmployee && (
        <SpotlightCard theme="light" className="mb-6 !bg-[#2563EB]/5 border-[#2563EB]/10">
          <h3 className="text-lg font-bold text-[#1e3a8a] mb-6 flex items-center gap-2">
            <TrendingUp className="text-[#2563EB]" size={20} />
            Application Rapide (Bulk Apply)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Prix 1 */}
            <div>
              <label className="block text-xs font-bold text-[#1e3a8a]/70 mb-2 ml-1">
                Commission Prix 1
              </label>
              <input
                type="number"
                value={bulkValues.c1}
                onChange={(e) => setBulkValues({ ...bulkValues, c1: e.target.value })}
                placeholder="Ex: 10"
                className="w-full px-4 py-3 bg-white border border-[#1e3a8a]/20 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all placeholder:text-slate-300"
              />
            </div>

            {/* Prix 2 */}
            <div>
              <label className="block text-xs font-bold text-[#1e3a8a]/70 mb-2 ml-1">
                Commission Prix 2
              </label>
              <input
                type="number"
                value={bulkValues.c2}
                onChange={(e) => setBulkValues({ ...bulkValues, c2: e.target.value })}
                placeholder="Ex: 25"
                className="w-full px-4 py-3 bg-white border border-[#1e3a8a]/20 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all placeholder:text-slate-300"
              />
            </div>

            {/* Prix 3 */}
            <div>
              <label className="block text-xs font-bold text-[#1e3a8a]/70 mb-2 ml-1">
                Commission Prix 3
              </label>
              <input
                type="number"
                value={bulkValues.c3}
                onChange={(e) => setBulkValues({ ...bulkValues, c3: e.target.value })}
                placeholder="Ex: 40"
                className="w-full px-4 py-3 bg-white border border-[#1e3a8a]/20 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all placeholder:text-slate-300"
              />
            </div>

            {/* Bouton Apply */}
            <div className="flex items-end">
              <button
                onClick={applyBulk}
                className={`w-full py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
                  applySuccess
                    ? 'bg-emerald-600 text-white shadow-emerald-500/30'
                    : 'bg-[#1e3a8a] text-white hover:bg-[#1e40af] shadow-blue-900/20'
                }`}
              >
                {applySuccess ? (
                    <>
                        <CheckCircle size={18} /> Appliqué
                    </>
                ) : (
                    <>
                        <TrendingUp size={18} /> Appliquer à tous
                    </>
                )}
              </button>
            </div>
          </div>
        </SpotlightCard>
      )}

      {/* Tableau */}
      {selectedEmployee ? (
        <SpotlightCard theme="light" className="p-0 overflow-hidden">
          {/* Boutons d'action Header Table */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-[#2563EB]/5">
            <h3 className="text-lg font-bold text-[#1e3a8a]">Commissions par produit</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => loadTable(selectedEmployee.id)}
                className="px-6 py-2.5 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-all font-semibold border border-slate-200"
              >
                Annuler
              </button>
              <button
                onClick={saveData}
                className="px-6 py-2.5 bg-[#1e3a8a] text-white rounded-lg hover:bg-[#1e40af] transition-all font-semibold shadow-lg shadow-blue-900/20 flex items-center gap-2"
              >
                <Save size={18} />
                Sauvegarder
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-[#2563EB]/5 border-b border-[#2563EB]/10">
                <tr>
                    <th className="px-6 py-5 text-left text-xs font-bold text-[#1e3a8a] uppercase tracking-wider">
                    Produit
                    </th>
                    <th className="px-6 py-5 text-center text-xs font-bold text-[#1e3a8a] uppercase tracking-wider">
                    Prix 1
                    </th>
                    <th className="px-6 py-5 text-center text-xs font-bold text-[#1e3a8a] uppercase tracking-wider">
                    Prix 2
                    </th>
                    <th className="px-6 py-5 text-center text-xs font-bold text-[#1e3a8a] uppercase tracking-wider">
                    Prix 3
                    </th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                {products.map(product => (
                    <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#2563EB]/5 flex items-center justify-center text-[#2563EB]">
                            <Package size={24} strokeWidth={1.5} />
                        </div>
                        <div>
                            <div className="font-bold text-slate-800 text-sm">{product.name || product.nom}</div>
                            <div className="text-xs text-[#2563EB] font-medium">{product.categorie || 'Produit'}</div>
                        </div>
                        </div>
                    </td>
                    {['c1', 'c2', 'c3'].map((col, idx) => (
                        <td key={col} className="px-6 py-4">
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-medium border border-slate-200">
                             P.V: {product[`price${idx + 1}`] || product.price || 0} DH
                            </span>
                            <div className="relative w-full max-w-[120px]">
                            <input
                                type="number"
                                value={getCommission(selectedEmployee.id, product.id, col)}
                                onChange={(e) => updateCommission(selectedEmployee.id, product.id, col, e.target.value)}
                                placeholder="0"
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[#1e3a8a] font-bold text-center focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] focus:bg-white transition-all shadow-sm placeholder:text-slate-300"
                            />
                            </div>
                        </div>
                        </td>
                    ))}
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
        </SpotlightCard>
      ) : (
        <div className="mt-8 flex flex-col items-center justify-center p-12 opacity-50">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
            <User className="text-slate-300" size={48} />
          </div>
          <h3 className="text-xl font-bold text-slate-400 mb-2">Aucun employé sélectionné</h3>
          <p className="text-slate-400">Veuillez sélectionner un employé ci-dessus pour gérer ses commissions</p>
        </div>
      )}
    </div>
  );
};

export default CommissionsPage;
