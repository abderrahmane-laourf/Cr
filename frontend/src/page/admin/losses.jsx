import React, { useState, useEffect } from 'react';
import { AlertTriangle, Plus, Trash2, Search, X, Check, Package, Calendar, CheckCircle, AlertCircle, User } from 'lucide-react';
import Swal from 'sweetalert2';

// API Configuration - assuming standard json-server behavior
const API_URL = 'http://localhost:3000';

// Toast Component for better user feedback
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

export default function LossesPage() {
  const [losses, setLosses] = useState([]);
  const [products, setProducts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    productId: '',
    employeeId: '',
    quantity: 1,
    reason: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [lossesRes, productsRes, employeesRes] = await Promise.all([
        fetch(`${API_URL}/losses`).catch(() => ({ ok: false, json: async () => [] })), // Handle potential 404 if not created yet
        fetch(`${API_URL}/products`),
        fetch(`${API_URL}/employees`)
      ]);

      if (lossesRes.ok) {
        setLosses(await lossesRes.json());
      } else {
        // Fallback for demo if endpoint doesn't exist
        console.warn('Endpoint /losses not found, using local state or empty array');
      }

      if (productsRes.ok) {
        setProducts(await productsRes.json());
      }

      if (employeesRes.ok) {
        setEmployees(await employeesRes.json());
      }

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.productId || !formData.quantity || !formData.date || !formData.employeeId) {
      showToast('Veuillez remplir tous les champs obligatoires (Date, Produit, Employé, Quantité)', 'error');
      return;
    }

    try {
      const product = products.find(p => p.id === formData.productId);
      const employee = employees.find(e => e.id === formData.employeeId);
      const newLoss = {
        id: Date.now().toString(),
        ...formData,
        productName: product ? product.nom : 'Inconnu',
        employeeName: employee ? employee.name : 'Inconnu',
        dateRecorded: new Date().toISOString()
      };

      // Attempt to save to backend
      const response = await fetch(`${API_URL}/losses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLoss)
      });

      if (response.ok) {
        setLosses([...losses, newLoss]);
        setIsModalOpen(false);
        setFormData({
            date: new Date().toISOString().split('T')[0],
            productId: '',
            employeeId: '',
            quantity: 1,
            reason: ''
        });
        showToast('Perte enregistrée avec succès !', 'success');
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Error saving loss:', error);
      showToast('Impossible d\'enregistrer la perte. Vérifiez que le serveur est démarré.', 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Cette action est irréversible !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        await fetch(`${API_URL}/losses/${id}`, { method: 'DELETE' });
        setLosses(losses.filter(l => l.id !== id));
        Swal.fire('Supprimé !', 'L\'enregistrement a été supprimé.', 'success');
      } catch (error) {
        console.error('Error deleting:', error);
        Swal.fire('Erreur', 'Erreur lors de la suppression', 'error');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-8 font-sans text-slate-800 relative">
      
      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                <AlertTriangle size={24} />
             </div>
             <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gestion des Pertes</h1>
                <p className="text-slate-500 mt-1 font-medium">Suivi des produits perdus ou endommagés</p>
             </div>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-500/30 font-semibold"
          >
            <Plus size={20} /> Enregistrer une perte
          </button>
        </div>
      </div>

      {/* List / Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Produit</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Employé</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Quantité</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Raison</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {losses.length > 0 ? (
                losses.map((loss) => (
                  <tr key={loss.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-slate-400" />
                        {new Date(loss.date).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                         <Package size={16} className="text-blue-500" />
                         <span className="font-bold text-slate-800">{loss.productName}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                         <User size={16} className="text-emerald-500" />
                         <span className="font-medium text-slate-700">{loss.employeeName || <span className="italic text-slate-400">Non spécifié</span>}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                         {loss.quantity}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {loss.reason || <span className="italic text-slate-400">Aucune description</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button 
                         onClick={() => handleDelete(loss.id)}
                         className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" 
                         title="Supprimer"
                       >
                         <Trash2 size={18} />
                       </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                   <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                         <AlertTriangle size={32} className="opacity-20" />
                         <span>Aucune perte enregistrée</span>
                      </div>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Styled like Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
             
             {/* Modal Header */}
             <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
               <div className="flex items-center gap-3">
                  <div className="bg-red-50 p-2 rounded-lg text-red-600">
                     <AlertTriangle size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Nouvelle Perte</h2>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors"><X size={24} /></button>
             </div>

             {/* Modal Body */}
             <div className="p-8 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   
                   {/* Date */}
                   <div className="group">
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider group-focus-within:text-blue-600 transition-colors">
                         Date de perte <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                         <input 
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({...formData, date: e.target.value})}
                            className="w-full pl-4 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200"
                         />
                         <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                      </div>
                   </div>

                   {/* Produit */}
                   <div className="group">
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider group-focus-within:text-blue-600 transition-colors">
                         Produit <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                         <select
                            value={formData.productId}
                            onChange={(e) => setFormData({...formData, productId: e.target.value})}
                            className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 appearance-none cursor-pointer"
                         >
                            <option value="">Sélectionner un produit</option>
                            {products.map(p => (
                               <option key={p.id} value={p.id}>{p.nom}</option>
                            ))}
                         </select>
                         <Package className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                      </div>
                   </div>

                   {/* Employé */}
                   <div className="group">
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider group-focus-within:text-blue-600 transition-colors">
                         Employé <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                         <select
                            value={formData.employeeId}
                            onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                            className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 appearance-none cursor-pointer"
                         >
                            <option value="">Sélectionner un employé</option>
                            {employees.map(e => (
                               <option key={e.id} value={e.id}>{e.name}</option>
                            ))}
                         </select>
                         <User className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                      </div>
                   </div>

                   {/* Quantité */}
                   <div className="group">
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider group-focus-within:text-blue-600 transition-colors">
                         Quantité Perdue/Endommagée <span className="text-red-400">*</span>
                      </label>
                      <input 
                         type="number"
                         min="1"
                         value={formData.quantity}
                         onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                         className="w-full pl-4 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200"
                         placeholder="0"
                      />
                   </div>

                   {/* Description */}
                   <div className="group md:col-span-2">
                       <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider group-focus-within:text-blue-600 transition-colors">
                         Description / Cause
                       </label>
                       <textarea 
                          rows="3"
                          value={formData.reason}
                          onChange={(e) => setFormData({...formData, reason: e.target.value})}
                          className="w-full pl-4 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 resize-none"
                          placeholder="Ex: Cassé lors du transport, Péremption..."
                       />
                   </div>

                </div>
             </div>

             {/* Footer */}
             <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 rounded-b-3xl flex justify-end items-center gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl text-slate-600 font-semibold hover:bg-white border border-transparent hover:border-slate-200 transition-all"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleSave}
                  className="px-8 py-3 rounded-xl text-white font-semibold flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/30 transition-all"
                >
                  <Check size={18} /> Sauvegarder
                </button>
             </div>

          </div>
        </div>
      )}

    </div>
  );
}
