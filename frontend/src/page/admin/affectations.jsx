import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Plus, Edit2, Trash2, X, Check,
  Phone, MessageCircle, AlertCircle, CheckCircle,
  ChevronDown, Package, Briefcase, User, Calendar, Eye, 
  Laptop, Smartphone, Car, Armchair, MoreHorizontal
} from 'lucide-react';
import Swal from 'sweetalert2';
import { employeeAPI } from '../../services/api';

// --- Toast Component ---
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-6 right-6 z-[70] animate-in slide-in-from-right-10 fade-in duration-300">
      <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-xl border backdrop-blur-md
        ${type === 'success' ? 'bg-emerald-50/95 border-emerald-200 text-emerald-800' : 'bg-red-50/95 border-red-200 text-red-800'}`}>
        {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
        <div>
          <h4 className="font-bold text-sm">{type === 'success' ? 'Succès' : 'Erreur'}</h4>
          <p className="text-xs opacity-90">{message}</p>
        </div>
        <button onClick={onClose} className="ml-4 opacity-50 hover:opacity-100"><X size={16}/></button>
      </div>
    </div>
  );
};

// --- Helper: Icon per Category ---
const getProductIcon = (category) => {
  const cat = category?.toLowerCase() || '';
  if (cat.includes('ordi') || cat.includes('mac') || cat.includes('pc')) return Laptop;
  if (cat.includes('phone') || cat.includes('mobile')) return Smartphone;
  if (cat.includes('voiture') || cat.includes('véhicule')) return Car;
  if (cat.includes('bureau') || cat.includes('chaise')) return Armchair;
  return Package;
};

// --- DETAILS MODAL (VOIR) - PREMIUM ---
const AffectationDetailsModal = ({ isOpen, onClose, affectation, employees, products }) => {
  if (!isOpen || !affectation) return null;

  const employee = employees.find(e => e.id === affectation.employeeId);
  const getProductName = (id) => products.find(p => p.id === id)?.name || 'Inconnu';
  const getProduct = (id) => products.find(p => p.id === id);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden max-h-[90vh]">
        
        {/* Header with visual flair */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6 flex justify-between items-start text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="font-bold text-2xl tracking-tight">Détails Affectation</h3>
            <p className="text-blue-100 text-sm mt-1">ID: #{affectation.id}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors relative z-10 backdrop-blur-md">
            <X size={20}/>
          </button>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-10 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-10 -translate-x-10 pointer-events-none"></div>
        </div>
        
        {/* Scrollable Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">
          
          {/* Employee Profile Card */}
          <div className="flex items-center gap-5 p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-16 h-16 rounded-full p-1 bg-white border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
               {employee?.avatar 
                 ? <img src={employee.avatar} alt={employee.name} className="w-full h-full rounded-full object-cover"/>
                 : <span className="text-2xl font-bold text-slate-400">{employee?.name?.charAt(0)}</span>
               }
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{employee?.name}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-1.5">
                <span className="text-xs font-bold px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg uppercase tracking-wide">
                  {employee?.role}
                </span>
                <span className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                  <Calendar size={14} className="text-slate-400"/>
                  {new Date(affectation.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Active Product Section */}
            <div>
              <h4 className="flex items-center gap-2 text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                <Briefcase size={16} className="text-indigo-500" /> Matériel Actif
              </h4>
              {affectation.productIdsActifs && affectation.productIdsActifs.length > 0 ? (
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                    <div className="w-12 h-12 rounded-xl bg-white text-indigo-600 flex items-center justify-center shadow-sm">
                        {React.createElement(getProductIcon(getProduct(affectation.productIdsActifs[0])?.category), { size: 24 })}
                    </div>
                    <div>
                        <p className="font-bold text-slate-800">{getProductName(affectation.productIdsActifs[0])}</p>
                        <p className="text-xs text-slate-600 font-medium">Assigné le {new Date(affectation.date).toLocaleDateString()}</p>
                    </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 text-sm italic text-center">
                   Aucun matériel actif assigné
                </div>
              )}
            </div>

            {/* Products to Sell Section */}
            <div>
              <h4 className="flex items-center gap-2 text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                <Package size={16} className="text-emerald-500" /> Produits à Vendre
              </h4>
              <div className="flex flex-wrap gap-3">
                {affectation.productIdsVendre && affectation.productIdsVendre.length > 0 ? (
                  affectation.productIdsVendre.map(id => (
                    <div key={id} className="flex items-center gap-3 pl-2 pr-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-medium text-slate-700">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                         <Package size={16} />
                      </div>
                      {getProductName(id)}
                    </div>
                  ))
                ) : (
                  <span className="text-sm text-slate-400 italic">Aucun produit à vendre</span>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* WhatsApp */}
            <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
              <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                <MessageCircle size={16} className="text-emerald-600"/> WhatsApp
              </h4>
              <div className="space-y-2.5">
                {affectation.whatsappNumbers && affectation.whatsappNumbers.length > 0 ? (
                  affectation.whatsappNumbers.map((num, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white px-3 py-2 rounded-xl shadow-sm border border-emerald-100/50">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="font-mono text-sm text-slate-700 font-medium">{num}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-emerald-600/60 italic">Aucun numéro enregistré</span>
                )}
              </div>
            </div>

            {/* Téléphone */}
            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
              <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Phone size={16} className="text-blue-600"/> Téléphone
              </h4>
              <div className="space-y-2.5">
                {affectation.teleNumbers && affectation.teleNumbers.length > 0 ? (
                  affectation.teleNumbers.map((num, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white px-3 py-2 rounded-xl shadow-sm border border-blue-100/50">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                      <span className="font-mono text-sm text-slate-700 font-medium">{num}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-blue-600/60 italic">Aucun numéro enregistré</span>
                )}
              </div>
            </div>
          </div>

        </div>
        
        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 text-right shrink-0">
          <button onClick={onClose} className="px-8 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-xl shadow-sm hover:shadow-md transition-all">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

// --- ADD/EDIT MODAL - MODERN & CLEAN ---
const AffectationModal = ({ isOpen, onClose, onSave, products, employees, affectation }) => {
  const [formData, setFormData] = useState({ 
    date: '', employeeId: '', productIdsVendre: [], productIdActif: '', 
    whatsappNumbers: [], teleNumbers: [], newWhatsapp: '', newTele: '' 
  });

  useEffect(() => {
    if (isOpen) {
      const defaultDate = new Date().toISOString().split('T')[0];
      if (affectation) {
        setFormData({
          date: affectation.date || defaultDate,
          employeeId: affectation.employeeId,
          productIdsVendre: affectation.productIdsVendre || [],
          productIdActif: affectation.productIdsActifs?.[0] || '',
          whatsappNumbers: affectation.whatsappNumbers || [],
          teleNumbers: affectation.teleNumbers || [],
          newWhatsapp: '', newTele: ''
        });
      } else {
        setFormData({ date: defaultDate, employeeId: '', productIdsVendre: [], productIdActif: '', whatsappNumbers: [], teleNumbers: [], newWhatsapp: '', newTele: '' });
      }
    }
  }, [isOpen, affectation]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!formData.employeeId || !formData.date) { Swal.fire('Attention', 'Veuillez remplir les champs obligatoires (Employé et Date)', 'warning'); return; }
    onSave({
      id: affectation?.id || Date.now(),
      date: formData.date,
      employeeId: parseInt(formData.employeeId),
      productIdsVendre: formData.productIdsVendre,
      productIdsActifs: formData.productIdActif ? [parseInt(formData.productIdActif)] : [],
      whatsappNumbers: formData.whatsappNumbers,
      teleNumbers: formData.teleNumbers
    });
    onClose();
  };

  const addItem = (field, listField) => {
    if (formData[field].trim()) {
      setFormData(prev => ({ ...prev, [listField]: [...prev[listField], prev[field]], [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">{affectation ? 'Modifier l\'affectation' : 'Nouvelle Affectation'}</h2>
            <p className="text-slate-500 text-sm mt-1">Configurez les ressources assignées à l'employé.</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-all">
            <X size={24}/>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/30">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column: Core Info */}
            <div className="space-y-6">
               <div className="bg-white p-6 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <User size={18} className="text-blue-500"/> Informations Principales
                  </h3>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Employé <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <select 
                          value={formData.employeeId} 
                          onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))} 
                          className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none"
                        >
                          <option value="">Choisir un employé...</option>{employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date d'affectation <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="date" 
                          value={formData.date} 
                          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))} 
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                        />
                      </div>
                    </div>
                  </div>
               </div>

               <div className="bg-white p-6 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Briefcase size={18} className="text-indigo-500"/> Matériel de Travail
                  </h3>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Actif Assigné (Usage Interne)</label>
                    <div className="relative">
                      <select 
                        value={formData.productIdActif} 
                        onChange={(e) => setFormData(prev => ({ ...prev, productIdActif: e.target.value }))} 
                        className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none"
                      >
                        <option value="">Aucun actif...</option>{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Sélectionnez le matériel que l'employé utilisera (ex: PC, Téléphone Pro).</p>
                  </div>
               </div>
            </div>

            {/* Right Column: Products & Contact */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100">
                 <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                   <Package size={18} className="text-emerald-500"/> Stock à Vendre
                 </h3>
                 <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Produits confiés</label>
                   <div className="relative mb-3">
                     <select 
                       value={""}
                       onChange={(e) => e.target.value && setFormData(prev => ({...prev, productIdsVendre: [...prev.productIdsVendre, parseInt(e.target.value)]}))} 
                       className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all appearance-none"
                     >
                       <option value="">Ajouter un produit...</option>
                       {products.filter(p => !formData.productIdsVendre.includes(p.id)).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                     </select>
                     <Plus className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                   </div>
                   
                   {/* Selected List */}
                   <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                     {formData.productIdsVendre.length === 0 && <span className="text-xs text-slate-400 mx-auto self-center">Aucun produit sélectionné</span>}
                     {formData.productIdsVendre.map((pid, idx) => {
                       const prod = products.find(p => p.id === pid);
                       return (
                         <span key={idx} className="flex items-center gap-2 pl-3 pr-2 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 shadow-sm">
                           {prod?.name}
                           <button onClick={() => setFormData(prev => ({...prev, productIdsVendre: prev.productIdsVendre.filter((_, i) => i !== idx)}))} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-red-500 transition-colors"><X size={14}/></button>
                         </span>
                       );
                     })}
                   </div>
                 </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Phone size={18} className="text-slate-700"/> Coordonnées
                  </h3>
                  
                  <div className="space-y-4">
                     {/* WhatsApp */}
                     <div>
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex justify-between">WhatsApp <span className="text-xs font-normal text-slate-400 lowercase">{formData.whatsappNumbers.length} numéros</span></label>
                       <div className="flex gap-2">
                         <input type="text" placeholder="+212 6..." className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500 focus:outline-none transition-all" value={formData.newWhatsapp} onChange={e => setFormData(prev => ({...prev, newWhatsapp: e.target.value}))}/>
                         <button onClick={() => addItem('newWhatsapp', 'whatsappNumbers')} disabled={!formData.newWhatsapp} className="px-4 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 disabled:opacity-50 transition-colors font-bold"><Plus size={18}/></button>
                       </div>
                       <div className="flex flex-wrap gap-2 mt-2">
                         {formData.whatsappNumbers.map((num, i) => (
                           <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100 flex items-center gap-2">{num} <button onClick={() => setFormData(prev => ({...prev, whatsappNumbers: prev.whatsappNumbers.filter((_, idx) => idx !== i)}))}><X size={12}/></button></span>
                         ))}
                       </div>
                     </div>

                     <div className="h-px bg-slate-50"></div>

                     {/* Phone */}
                     <div>
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex justify-between">Téléphone <span className="text-xs font-normal text-slate-400 lowercase">{formData.teleNumbers.length} numéros</span></label>
                       <div className="flex gap-2">
                         <input type="text" placeholder="+212 6..." className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:outline-none transition-all" value={formData.newTele} onChange={e => setFormData(prev => ({...prev, newTele: e.target.value}))}/>
                         <button onClick={() => addItem('newTele', 'teleNumbers')} disabled={!formData.newTele} className="px-4 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 disabled:opacity-50 transition-colors font-bold"><Plus size={18}/></button>
                       </div>
                       <div className="flex flex-wrap gap-2 mt-2">
                         {formData.teleNumbers.map((num, i) => (
                           <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100 flex items-center gap-2">{num} <button onClick={() => setFormData(prev => ({...prev, teleNumbers: prev.teleNumbers.filter((_, idx) => idx !== i)}))}><X size={12}/></button></span>
                         ))}
                       </div>
                     </div>
                  </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-100 bg-white shrink-0 flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-3 rounded-xl text-slate-500 font-bold hover:bg-slate-50 transition-colors">
            Annuler
          </button>
          <button onClick={handleSave} className="px-8 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 shadow-xl shadow-slate-900/10 transition-all transform hover:-translate-y-0.5 flex items-center gap-2">
            <CheckCircle size={20} />
            Enregistrer l'affectation
          </button>
        </div>

      </div>
    </div>
  );
};

// --- Main Page ---
export default function AffectationsPage() {
  const [affectations, setAffectations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [products, setProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedAffectation, setSelectedAffectation] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [empData] = await Promise.all([employeeAPI.getAll()]);
      setEmployees(empData);
      
      // MOCK PRODUCTS for demo
      setProducts([
        { id: 1, name: 'MacBook Pro M2', category: 'Informatique' },
        { id: 2, name: 'iPhone 15 Pro', category: 'Téléphonie' },
        { id: 3, name: 'Bureau Assis-Debout', category: 'Mobilier' },
        { id: 4, name: 'Clio 5', category: 'Véhicule' }
      ]);

      const stored = localStorage.getItem('affectations');
      if (stored) setAffectations(JSON.parse(stored));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSave = (data) => {
    let updated = [...affectations];
    const idx = updated.findIndex(a => a.id === data.id);
    if (idx >= 0) updated[idx] = data; else updated.push(data);
    setAffectations(updated);
    localStorage.setItem('affectations', JSON.stringify(updated));
    setToast({ message: 'Affectation enregistrée !', type: 'success' });
    setModalOpen(false); setSelectedAffectation(null);
  };

  const handleDelete = (id) => {
    Swal.fire({ 
      title: 'Êtes-vous sûr ?', text: "Cette action est irréversible.", icon: 'warning', 
      showCancelButton: true, confirmButtonColor: '#1e293b', cancelButtonColor: '#94a3b8', 
      confirmButtonText: 'Oui, supprimer', cancelButtonText: 'Annuler',
      background: '#fff', borderRadius: '1rem'
    }).then(r => {
      if (r.isConfirmed) {
        const updated = affectations.filter(a => a.id !== id);
        setAffectations(updated);
        localStorage.setItem('affectations', JSON.stringify(updated));
        setToast({ message: 'Affectation supprimée', type: 'success' });
      }
    });
  };

  const filtered = affectations.filter(aff => {
    const emp = employees.find(e => e.id == aff.employeeId);
    return emp && emp.name.toLowerCase().includes(searchTerm.toLowerCase());
  });
  const getEmployee = (id) => employees.find(e => e.id == id);
  const getProductName = (id) => products.find(p => p.id == id)?.name || 'N/A';
  const getProduct = (id) => products.find(p => p.id == id);

  return (
    <div className="w-full min-h-screen bg-slate-50 animate-[fade-in_0.6s_ease-out]/50 p-6 md:p-10 font-sans text-slate-800">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100">
           <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                 <Briefcase size={32} />
              </div>
              <div>
                 <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Affectations</h1>
                 <p className="text-slate-600 font-medium mt-1">Gérez et suivez les ressources assignées aux équipes.</p>
              </div>
           </div>
           
           <div className="flex items-center gap-3 w-full md:w-auto">
              <button 
                onClick={() => { setSelectedAffectation(null); setModalOpen(true); }} 
                className="w-full md:w-auto px-8 py-3.5 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 shadow-xl shadow-slate-900/10 font-bold transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <Plus size={20} /> Nouvelle Affectation
              </button>
           </div>
        </div>

        {/* Search & Stats */}
        <div className="flex flex-col md:flex-row gap-4">
           <div className="relative flex-1 group">
             <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
             <input 
               type="text" 
               placeholder="Rechercher par nom d'employé..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-14 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-700 font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm placeholder:text-slate-400" 
             />
           </div>
        </div>

        {/* Main List */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
           {loading ? (
             <div className="p-12 text-center text-slate-400">Chargement des données...</div>
           ) : filtered.length === 0 ? (
             <div className="p-20 flex flex-col items-center justify-center text-center text-slate-400">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                   <Search size={32} className="opacity-50" />
                </div>
                <h3 className="text-lg font-bold text-slate-700">Aucune affectation trouvée</h3>
                <p className="text-slate-500 max-w-xs mt-1">Essayez de modifier votre recherche ou ajoutez une nouvelle affectation.</p>
             </div>
           ) : (
             <div className="overflow-x-auto">
               <table className="w-full">
                 <thead>
                   <tr className="border-b border-slate-100 bg-slate-50/50">
                     <th className="px-8 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Employé</th>
                     <th className="px-6 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Matériel Actif</th>
                     <th className="px-6 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Stock Confié</th>
                     <th className="px-6 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                     <th className="px-6 py-5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                   {filtered.map(aff => {
                     const emp = getEmployee(aff.employeeId);
                     if (!emp) return null;
                     const activeProduct = aff.productIdsActifs?.[0] ? getProduct(aff.productIdsActifs[0]) : null;

                     return (
                       <tr key={aff.id} className="group hover:bg-slate-50/80 transition-colors">
                         <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                               <div className="relative">
                                  <img src={emp.avatar || "https://i.pravatar.cc/150"} className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm" alt={emp.name} />
                                  <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${emp.active ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                               </div>
                               <div>
                                  <div className="font-bold text-slate-800 text-base">{emp.name}</div>
                                  <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block mt-1">{emp.role}</div>
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-5">
                            {activeProduct ? (
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                   {React.createElement(getProductIcon(activeProduct.category), { size: 20 })}
                                </div>
                                <div className="leading-tight">
                                   <div className="font-bold text-slate-700 text-sm">{activeProduct.name}</div>
                                   <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{activeProduct.category}</div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-sm italic pl-2">Aucun actif</span>
                            )}
                         </td>
                         <td className="px-6 py-5">
                            {aff.productIdsVendre && aff.productIdsVendre.length > 0 ? (
                               <div className="flex flex-wrap gap-1.5">
                                  {aff.productIdsVendre.slice(0, 2).map((pid, i) => (
                                    <span key={i} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100/50">
                                      {getProductName(pid)}
                                    </span>
                                  ))}
                                  {aff.productIdsVendre.length > 2 && (
                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg">+ {aff.productIdsVendre.length - 2}</span>
                                  )}
                               </div>
                            ) : (
                               <span className="text-slate-400 text-sm italic pl-2">-</span>
                            )}
                         </td>
                         <td className="px-6 py-5">
                            <div className="flex gap-2">
                               {aff.whatsappNumbers?.length > 0 && <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center" title="WhatsApp disponible"><MessageCircle size={14}/></div>}
                               {aff.teleNumbers?.length > 0 && <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center" title="Téléphone disponible"><Phone size={14}/></div>}
                               {(!aff.whatsappNumbers?.length && !aff.teleNumbers?.length) && <span className="text-slate-300">-</span>}
                            </div>
                         </td>
                         <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-1">
                               <button onClick={() => { setSelectedAffectation(aff); setDetailsModalOpen(true); }} className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"><Eye size={18}/></button>
                               <button onClick={() => { setSelectedAffectation(aff); setModalOpen(true); }} className="p-2.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"><Edit2 size={18}/></button>
                               <button onClick={() => handleDelete(aff.id)} className="p-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={18}/></button>
                            </div>
                         </td>
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
             </div>
           )}
        </div>

      </div>

      <AffectationModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setSelectedAffectation(null); }} onSave={handleSave} products={products} employees={employees} affectation={selectedAffectation} />
      <AffectationDetailsModal isOpen={detailsModalOpen} onClose={() => { setDetailsModalOpen(false); setSelectedAffectation(null); }} affectation={selectedAffectation} employees={employees} products={products} />
    </div>
  );
}