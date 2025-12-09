import React, { useState, useEffect } from 'react';
import { User, Package, Save, RotateCcw, DollarSign, TrendingUp } from 'lucide-react';
import { employeeAPI, productAPI } from '../../services/api';
import Swal from 'sweetalert2';

const CommissionsPage = () => {
  const [employees, setEmployees] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [commissions, setCommissions] = useState({});
  const [bulkValues, setBulkValues] = useState({ c1: '', c2: '', c3: '' });
  const [saveSuccess, setSaveSuccess] = useState(false);
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
    }
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
      alert('Veuillez entrer au moins une valeur');
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
    setTimeout(() => setApplySuccess(false), 1500);
  };

  // Sauvegarder les données
  const saveData = () => {
    Swal.fire({
      title: 'Sauvegarder les commissions ?',
      text: 'Les modifications seront enregistrées',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Oui, sauvegarder',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.setItem('sys_commissions', JSON.stringify(commissions));
        Swal.fire({
          title: 'Sauvegardé !',
          text: 'Les commissions ont été enregistrées avec succès',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
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
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Oui, réinitialiser',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        setCommissions({});
        localStorage.removeItem('sys_commissions');
        setSelectedEmployee(null);
        Swal.fire({
          title: 'Réinitialisé !',
          text: 'Toutes les commissions ont été supprimées',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-8 font-sans">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <DollarSign className="text-blue-600" size={32} />
              Gestion des Commissions
            </h1>
            <p className="text-slate-500 mt-1 font-medium">
              Définissez les commissions par employé et par produit
            </p>
          </div>
          <button
            onClick={resetData}
            className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-semibold shadow-sm"
          >
            <RotateCcw size={18} />
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Sélection employé */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="text-blue-600" size={24} />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Sélectionner un employé
            </label>
            <select
              value={selectedEmployee?.id || ''}
              onChange={(e) => loadTable(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="">-- Choisir un employé --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.role || 'Employé'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Apply */}
      {selectedEmployee && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="text-blue-600" size={20} />
            Application Rapide (Bulk Apply)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Prix 1 */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Commission Prix 1
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={bulkValues.c1}
                  onChange={(e) => setBulkValues({ ...bulkValues, c1: e.target.value })}
                  placeholder="Ex: 10"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Prix 2 */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Commission Prix 2
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={bulkValues.c2}
                  onChange={(e) => setBulkValues({ ...bulkValues, c2: e.target.value })}
                  placeholder="Ex: 25"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Prix 3 */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Commission Prix 3
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={bulkValues.c3}
                  onChange={(e) => setBulkValues({ ...bulkValues, c3: e.target.value })}
                  placeholder="Ex: 40"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Bouton Apply */}
            <div className="flex items-end">
              <button
                onClick={applyBulk}
                className={`w-full py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 ${
                  applySuccess
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {applySuccess ? '✅ Appliqué' : 'Appliquer à tous'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tableau */}
      {selectedEmployee ? (
        <div className="space-y-4">
          {/* Boutons d'action */}
          <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800">Commissions par produit</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => loadTable(selectedEmployee.id)}
                className="px-6 py-2.5 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-all font-semibold border border-slate-200"
              >
                Annuler
              </button>
              <button
                onClick={saveData}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-lg shadow-blue-500/30 flex items-center gap-2"
              >
                <Save size={18} />
                Sauvegarder
              </button>
            </div>
          </div>

          {/* Tableau */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Produit
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Prix 1
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Prix 2
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Prix 3
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map(product => (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                            <Package className="text-slate-600" size={20} />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{product.name || product.nom}</div>
                            <div className="text-xs text-slate-500">{product.categorie || 'Produit'}</div>
                          </div>
                        </div>
                      </td>
                      {['c1', 'c2', 'c3'].map((col, idx) => (
                        <td key={col} className="px-6 py-4">
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 font-medium">
                              Prix: {product[`price${idx + 1}`] || product.price || 0} DH
                            </span>
                            <div className="relative w-full max-w-[160px]">
                              <input
                                type="number"
                                value={getCommission(selectedEmployee.id, product.id, col)}
                                onChange={(e) => updateCommission(selectedEmployee.id, product.id, col, e.target.value)}
                                placeholder="0"
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-blue-600 font-semibold text-center focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
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
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
          <User className="mx-auto text-slate-300 mb-4" size={64} />
          <h3 className="text-xl font-bold text-slate-700 mb-2">Aucun employé sélectionné</h3>
          <p className="text-slate-500">Veuillez sélectionner un employé pour commencer</p>
        </div>
      )}
    </div>
  );
};

export default CommissionsPage;
