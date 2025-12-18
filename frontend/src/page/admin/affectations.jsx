import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Search, Plus, Edit2, Trash2, X, Check,
  Phone, MessageCircle, AlertCircle, CheckCircle,
  ChevronDown, Package, Briefcase, User, Calendar, Eye, 
  Laptop, Smartphone, Car, Armchair, MoreHorizontal, Settings
} from 'lucide-react';
import Swal from 'sweetalert2';
import { employeeAPI } from '../../services/api';
import SpotlightCard from '../../util/SpotlightCard';

// --- Toast Component ---
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-6 right-6 z-[70] animate-in slide-in-from-right-10 fade-in duration-300">
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

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in zoom-in-95 duration-300">
      <SpotlightCard theme="light" className="w-full max-w-lg flex flex-col !p-0 overflow-hidden border border-slate-200 max-h-[90vh] bg-white dark:bg-slate-900">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-[#2563EB]/5">
           <div>
             <h3 className="font-bold text-xl text-[#1e3a8a]">Détails Affectation</h3>
             <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">ID: #{affectation.id}</p>
           </div>
           <button onClick={onClose} className="p-2 bg-white/50 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 transition-colors border border-transparent hover:border-slate-100">
             <X size={20}/>
           </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8 bg-white dark:bg-slate-900">
          
          {/* Employee Profile Card */}
          <div className="flex items-center gap-5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-16 h-16 rounded-full p-1 bg-white border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
               {employee?.avatar 
                 ? <img src={employee.avatar} alt={employee.name} className="w-full h-full rounded-full object-cover"/>
                 : <span className="text-2xl font-bold text-slate-400">{employee?.name?.charAt(0)}</span>
               }
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{employee?.name}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-1.5">
                <span className="text-[10px] font-extrabold px-2.5 py-1 bg-[#2563EB]/10 text-[#2563EB] rounded-full uppercase tracking-wide border border-[#2563EB]/20">
                  {employee?.role}
                </span>
                <span className="flex items-center gap-1.5 text-slate-500 text-xs font-bold">
                  <Calendar size={14} className="text-[#2563EB]"/>
                  {new Date(affectation.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Active Product Section */}
            <div>
              <h4 className="flex items-center gap-2 text-xs font-extrabold text-[#1e3a8a] uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                <Briefcase size={16} className="text-[#2563EB]" /> Matériel Actif
              </h4>
              {affectation.productIdsActifs && affectation.productIdsActifs.length > 0 ? (
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#2563EB]/5 border border-[#2563EB]/10">
                    <div className="w-12 h-12 rounded-xl bg-white text-[#2563EB] flex items-center justify-center shadow-sm border border-[#2563EB]/20">
                        {React.createElement(getProductIcon(getProduct(affectation.productIdsActifs[0])?.category), { size: 24 })}
                    </div>
                    <div>
                        <p className="font-bold text-slate-800">{getProductName(affectation.productIdsActifs[0])}</p>
                        <p className="text-xs text-slate-600 font-medium">Assigné le {new Date(affectation.date).toLocaleDateString()}</p>
                    </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 text-xs font-bold italic text-center">
                   Aucun matériel actif assigné
                </div>
              )}
            </div>

            {/* Products to Sell Section */}
            <div>
              <h4 className="flex items-center gap-2 text-xs font-extrabold text-[#1e3a8a] uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                <Package size={16} className="text-emerald-500" /> Produits à Vendre
              </h4>
              <div className="flex flex-wrap gap-3">
                {affectation.productIdsVendre && affectation.productIdsVendre.length > 0 ? (
                  affectation.productIdsVendre.map(id => (
                    <div key={id} className="flex items-center gap-3 pl-2 pr-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-700">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                         <Package size={16} />
                      </div>
                      {getProductName(id)}
                    </div>
                  ))
                ) : (
                  <span className="text-xs font-bold text-slate-400 italic">Aucun produit à vendre</span>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* WhatsApp */}
            <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
              <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                <MessageCircle size={16} className="text-emerald-600"/> WhatsApp
              </h4>
              <div className="space-y-2.5">
                {affectation.whatsappNumbers && affectation.whatsappNumbers.length > 0 ? (
                  affectation.whatsappNumbers.map((num, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white px-3 py-2 rounded-xl shadow-sm border border-emerald-100/50">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="font-mono text-sm text-slate-700 font-bold">{num}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-emerald-600/60 font-bold italic">Aucun numéro</span>
                )}
              </div>
            </div>

            {/* Téléphone */}
            <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
              <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Phone size={16} className="text-blue-600"/> Téléphone
              </h4>
              <div className="space-y-2.5">
                {affectation.teleNumbers && affectation.teleNumbers.length > 0 ? (
                  affectation.teleNumbers.map((num, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white px-3 py-2 rounded-xl shadow-sm border border-blue-100/50">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                      <span className="font-mono text-sm text-slate-700 font-bold">{num}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-blue-600/60 font-bold italic">Aucun numéro</span>
                )}
              </div>
            </div>
          </div>

        </div>
        
        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 text-right shrink-0">
          <button onClick={onClose} className="px-8 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-xl shadow-sm hover:shadow-md transition-all">
            Fermer
          </button>
        </div>
      </SpotlightCard>
    </div>,
    document.body
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

  // Input Field Component to match Employee Page style
  const InputField = ({ label, children, required }) => (
    <div className="group">
        <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider group-focus-within:text-[#2563EB] transition-colors">
            {label} {required && <span className="text-red-400">*</span>}
        </label>
        {children}
    </div>
  );

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4 transition-all">
      <SpotlightCard theme="light" className="w-full max-w-4xl max-h-[90vh] flex flex-col !p-0 overflow-hidden border border-slate-200 bg-white dark:bg-slate-900">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-[#2563EB]/5 shrink-0">
          <div>
            <h2 className="text-2xl font-extrabold text-[#1e3a8a]">{affectation ? 'Modifier l\'affectation' : 'Nouvelle Affectation'}</h2>
            <p className="text-slate-500 text-xs font-bold mt-1">Configurez les ressources assignées à l'employé.</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-200">
            <X size={24}/>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white dark:bg-slate-900">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column: Core Info */}
            <div className="space-y-6">
               <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                  <h3 className="font-extrabold text-[#1e3a8a] mb-6 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <User size={18} className="text-[#2563EB]"/> Informations Principales
                  </h3>
                  
                  <div className="space-y-5">
                    <InputField label="Employé" required>
                      <div className="relative">
                        <select 
                          value={formData.employeeId} 
                          onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))} 
                          className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all appearance-none text-sm"
                        >
                          <option value="">Choisir un employé...</option>{employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                      </div>
                    </InputField>

                    <InputField label="Date d'affectation" required>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="date" 
                          value={formData.date} 
                          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))} 
                          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all text-sm"
                        />
                      </div>
                    </InputField>
                  </div>
               </div>

               <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                  <h3 className="font-extrabold text-[#1e3a8a] mb-6 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <Briefcase size={18} className="text-[#2563EB]"/> Matériel de Travail
                  </h3>
                  <InputField label="Actif Assigné (Usage Interne)">
                    <div className="relative">
                      <select 
                        value={formData.productIdActif} 
                        onChange={(e) => setFormData(prev => ({ ...prev, productIdActif: e.target.value }))} 
                        className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all appearance-none text-sm"
                      >
                        <option value="">Aucun actif...</option>{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 mt-2 ml-1">Sélectionnez le matériel que l'employé utilisera.</p>
                  </InputField>
               </div>
            </div>

            {/* Right Column: Products & Contact */}
            <div className="space-y-6">
              <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                 <h3 className="font-extrabold text-[#1e3a8a] mb-6 flex items-center gap-2 text-sm uppercase tracking-wide">
                   <Package size={18} className="text-emerald-600"/> Stock à Vendre
                 </h3>
                 <InputField label="Produits confiés">
                   <div className="relative mb-3">
                     <select 
                       value={""}
                       onChange={(e) => e.target.value && setFormData(prev => ({...prev, productIdsVendre: [...prev.productIdsVendre, parseInt(e.target.value)]}))} 
                       className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all appearance-none text-sm"
                     >
                       <option value="">Ajouter un produit...</option>
                       {products.filter(p => !formData.productIdsVendre.includes(p.id)).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                     </select>
                     <Plus className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                   </div>
                   
                   {/* Selected List */}
                   <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-white rounded-xl border border-slate-200 border-dashed">
                     {formData.productIdsVendre.length === 0 && <span className="text-xs font-bold text-slate-300 mx-auto self-center">Aucun produit sélectionné</span>}
                     {formData.productIdsVendre.map((pid, idx) => {
                       const prod = products.find(p => p.id === pid);
                       return (
                         <span key={idx} className="flex items-center gap-2 pl-3 pr-2 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg text-xs font-bold text-emerald-800 shadow-sm">
                           {prod?.name}
                           <button onClick={() => setFormData(prev => ({...prev, productIdsVendre: prev.productIdsVendre.filter((_, i) => i !== idx)}))} className="p-1 hover:bg-emerald-100 rounded text-emerald-600 hover:text-red-500 transition-colors"><X size={14}/></button>
                         </span>
                       );
                     })}
                   </div>
                 </InputField>
              </div>

              <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                  <h3 className="font-extrabold text-[#1e3a8a] mb-6 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <Phone size={18} className="text-slate-700"/> Coordonnées
                  </h3>
                  
                  <div className="space-y-4">
                     {/* WhatsApp */}
                     <InputField label="WhatsApp">
                       <div className="flex gap-2">
                         <input type="text" placeholder="+212 6..." className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:border-emerald-500 focus:outline-none transition-all" value={formData.newWhatsapp} onChange={e => setFormData(prev => ({...prev, newWhatsapp: e.target.value}))}/>
                         <button onClick={() => addItem('newWhatsapp', 'whatsappNumbers')} disabled={!formData.newWhatsapp} className="px-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors font-bold shadow-md shadow-emerald-500/20"><Plus size={18}/></button>
                       </div>
                       <div className="flex flex-wrap gap-2 mt-2">
                         {formData.whatsappNumbers.map((num, i) => (
                           <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100 flex items-center gap-2">{num} <button onClick={() => setFormData(prev => ({...prev, whatsappNumbers: prev.whatsappNumbers.filter((_, idx) => idx !== i)}))}><X size={12}/></button></span>
                         ))}
                       </div>
                     </InputField>

                     <div className="h-px bg-slate-200"></div>

                     {/* Phone */}
                     <InputField label="Téléphone">
                       <div className="flex gap-2">
                         <input type="text" placeholder="+212 6..." className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:border-blue-500 focus:outline-none transition-all" value={formData.newTele} onChange={e => setFormData(prev => ({...prev, newTele: e.target.value}))}/>
                         <button onClick={() => addItem('newTele', 'teleNumbers')} disabled={!formData.newTele} className="px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors font-bold shadow-md shadow-blue-500/20"><Plus size={18}/></button>
                       </div>
                       <div className="flex flex-wrap gap-2 mt-2">
                         {formData.teleNumbers.map((num, i) => (
                           <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100 flex items-center gap-2">{num} <button onClick={() => setFormData(prev => ({...prev, teleNumbers: prev.teleNumbers.filter((_, idx) => idx !== i)}))}><X size={12}/></button></span>
                         ))}
                       </div>
                     </InputField>
                  </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 shrink-0 flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-3 rounded-xl text-slate-500 font-bold hover:bg-white border border-transparent hover:border-slate-200 transition-all">
            Annuler
          </button>
          <button onClick={handleSave} className="px-8 py-3 rounded-xl bg-[#1e3a8a] text-white font-bold hover:bg-[#1e40af] shadow-lg shadow-blue-900/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2">
            <CheckCircle size={20} />
            Enregistrer l'affectation
          </button>
        </div>

      </SpotlightCard>
    </div>,
    document.body
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
      showCancelButton: true, confirmButtonColor: '#1e3a8a', cancelButtonColor: '#94a3b8', 
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
    <div className="w-full min-h-screen bg-transparent animate-[fade-in_0.6s_ease-out] p-8 font-sans text-slate-800 dark:text-slate-200 relative">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="w-full space-y-8">
        
        {/* Header Section */}
        <SpotlightCard theme="light" className="mb-6">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                 <h1 className="text-3xl font-extrabold text-[#2563EB] tracking-tight flex items-center gap-3">
                    <Briefcase className="text-[#1e3a8a]" size={32} />
                    Affectations & Matériel
                 </h1>
                 <p className="text-slate-500 font-bold mt-1">Gérez et suivez les ressources assignées aux équipes.</p>
              </div>
              
              <div className="flex items-center gap-3 w-full md:w-auto">
                 <button 
                   onClick={() => { setSelectedAffectation(null); setModalOpen(true); }} 
                   className="w-full md:w-auto px-8 py-3.5 bg-[#1e3a8a] text-white rounded-xl hover:bg-[#1e40af] shadow-lg shadow-blue-900/20 font-bold transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                 >
                   <Plus size={20} /> Nouvelle Affectation
                 </button>
              </div>
           </div>
        </SpotlightCard>

        {/* Search & Stats */}
        <div className="flex flex-col md:flex-row gap-4 px-2">
           <div className="relative flex-1 group max-w-md">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#2563EB] transition-colors" size={20} />
             <input 
               type="text" 
               placeholder="Rechercher par nom d'employé..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all shadow-sm placeholder:text-slate-400" 
             />
           </div>
        </div>

        {/* Main List */}
        <SpotlightCard theme="light" className="!p-0 overflow-hidden border border-slate-200">
           {loading ? (
             <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-4 border-[#2563EB]/20 border-t-[#2563EB] animate-spin"></div>
                <span className="font-bold">Chargement des données...</span>
             </div>
           ) : filtered.length === 0 ? (
             <div className="p-20 flex flex-col items-center justify-center text-center text-slate-400">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                   <Search size={32} className="opacity-50" />
                </div>
                <h3 className="text-lg font-bold text-slate-700">Aucune affectation trouvée</h3>
                <p className="text-slate-500 max-w-xs mt-1 text-sm font-medium">Essayez de modifier votre recherche ou ajoutez une nouvelle affectation.</p>
             </div>
           ) : (
             <div className="overflow-x-auto">
               <table className="w-full">
                 <thead>
                   <tr className="bg-[#005461]/5 border-b border-[#005461]/10">
                     <th className="px-8 py-5 text-left text-xs font-bold text-[#005461] uppercase tracking-wider">Employé</th>
                     <th className="px-6 py-5 text-left text-xs font-bold text-[#005461] uppercase tracking-wider">Matériel Actif</th>
                     <th className="px-6 py-5 text-left text-xs font-bold text-[#005461] uppercase tracking-wider">Stock Confié</th>
                     <th className="px-6 py-5 text-left text-xs font-bold text-[#005461] uppercase tracking-wider">Contact</th>
                     <th className="px-6 py-5 text-right text-xs font-bold text-[#005461] uppercase tracking-wider">Actions</th>
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
                                  <img src={emp.avatar || "https://i.pravatar.cc/150"} className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm" alt={emp.name} />
                                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${emp.active ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                               </div>
                               <div>
                                  <div className="font-bold text-slate-800 text-sm">{emp.name}</div>
                                  <div className="text-[10px] font-extrabold text-[#1e3a8a] uppercase tracking-wide mt-0.5">{emp.role}</div>
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-5">
                            {activeProduct ? (
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#2563EB]/5 text-[#2563EB] flex items-center justify-center shrink-0 border border-[#2563EB]/10">
                                   {React.createElement(getProductIcon(activeProduct.category), { size: 18 })}
                                </div>
                                <div className="leading-tight">
                                   <div className="font-bold text-slate-700 text-sm">{activeProduct.name}</div>
                                   <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{activeProduct.category}</div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-xs font-bold italic pl-2">Aucun actif</span>
                            )}
                         </td>
                         <td className="px-6 py-5">
                            {aff.productIdsVendre && aff.productIdsVendre.length > 0 ? (
                               <div className="flex flex-wrap gap-1.5">
                                  {aff.productIdsVendre.slice(0, 2).map((pid, i) => (
                                    <span key={i} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold rounded-md border border-emerald-100">
                                      {getProductName(pid)}
                                    </span>
                                  ))}
                                  {aff.productIdsVendre.length > 2 && (
                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-extrabold rounded-md border border-slate-200">+ {aff.productIdsVendre.length - 2}</span>
                                  )}
                               </div>
                            ) : (
                               <span className="text-slate-300 text-sm font-bold pl-2">-</span>
                            )}
                         </td>
                         <td className="px-6 py-5">
                            <div className="flex gap-2">
                               {aff.whatsappNumbers?.length > 0 && <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center" title="WhatsApp disponible"><MessageCircle size={14}/></div>}
                               {aff.teleNumbers?.length > 0 && <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center" title="Téléphone disponible"><Phone size={14}/></div>}
                               {(!aff.whatsappNumbers?.length && !aff.teleNumbers?.length) && <span className="text-slate-300">-</span>}
                            </div>
                         </td>
                         <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                               <button onClick={() => { setSelectedAffectation(aff); setDetailsModalOpen(true); }} className="p-2 text-slate-400 hover:text-[#2563EB] hover:bg-[#2563EB]/5 rounded-lg transition-colors"><Eye size={18}/></button>
                               <button onClick={() => { setSelectedAffectation(aff); setModalOpen(true); }} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"><Edit2 size={18}/></button>
                               <button onClick={() => handleDelete(aff.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18}/></button>
                            </div>
                         </td>
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
             </div>
           )}
        </SpotlightCard>

      </div>

      <AffectationModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setSelectedAffectation(null); }} onSave={handleSave} products={products} employees={employees} affectation={selectedAffectation} />
      <AffectationDetailsModal isOpen={detailsModalOpen} onClose={() => { setDetailsModalOpen(false); setSelectedAffectation(null); }} affectation={selectedAffectation} employees={employees} products={products} />
    </div>
  );
}