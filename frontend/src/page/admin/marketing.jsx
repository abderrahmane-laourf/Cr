import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, Plus, Edit2, Trash2, X, Check, ChevronDown, 
  Target, Database, FileText, BarChart3, Calendar, DollarSign,
  TrendingUp, AlertCircle, CheckCircle, Filter, Save, Eye,
  Megaphone, ArrowRight, Activity
} from 'lucide-react';
import Swal from 'sweetalert2';

// ============================================================================
// UI COMPONENTS (Reusable)
// ============================================================================

const SpotlightCard = ({ children, className = "", theme = "light", onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
      theme === 'dark' 
        ? 'bg-[#1e3a8a] border-slate-700 shadow-xl' 
        : 'bg-white border-slate-100 shadow-sm hover:shadow-md'
    } ${className}`}>
      <div className="relative z-10 p-6 h-full">
        {children}
      </div>
    </div>
  );
};

const InputField = ({ label, type = "text", placeholder, options, value, onChange, disabled, required = true }) => (
  <div className="group">
    <label className="block text-xs font-bold text-slate-500 mb-2 ml-1 uppercase tracking-widest group-focus-within:text-[#2563EB] transition-colors">
      {label} {required && !disabled && <span className="text-red-400">*</span>}
    </label>
    <div className="relative">
      {options ? (
        <div className="relative">
          <select 
            disabled={disabled}
            className={`w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 outline-none transition-all duration-200 appearance-none disabled:bg-slate-100 disabled:text-slate-500 cursor-pointer`}
            value={value}
            onChange={onChange}
          >
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          {!disabled && <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><ChevronDown size={14} /></div>}
        </div>
      ) : (
        <input 
          type={type} 
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full pl-4 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium placeholder-slate-400 focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 outline-none transition-all duration-200 disabled:bg-slate-100 disabled:text-slate-500`}
          value={value}
          onChange={onChange}
        />
      )}
    </div>
  </div>
);

const Badge = ({ label, color }) => {
    const colorStyles = {
        emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        blue: 'bg-blue-50 text-blue-700 border-blue-100',
        orange: 'bg-orange-50 text-orange-700 border-orange-100',
        red: 'bg-red-50 text-red-700 border-red-100',
        slate: 'bg-slate-50 text-slate-700 border-slate-100',
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${colorStyles[color] || colorStyles.slate}`}>
            {label}
        </span>
    );
};

// ============================================================================
// CONSTANTES
// ============================================================================

const CAMPAIGN_TYPES = ['Message', 'Messenger', 'Leads', 'Achat Direct'];
const EMPLOYEES = ['Ahmed Benali', 'Fatima Zahra', 'Youssef Alami', 'Khadija Mansouri'];
const PRODUCTS = ['Herboclear Premium', 'Herboclear Classic', 'Detox Plus', 'Slim Tea'];

// ============================================================================
// MODAL AJOUT CAMPAGNE
// ============================================================================

const AddCampaignModal = ({ isOpen, onClose, onSave, platform, editMode = false, initialData }) => {
  const [formData, setFormData] = useState({
    type: 'Message',
    employee: EMPLOYEES[0],
    product: PRODUCTS[0],
    startDate: new Date().toISOString().split('T')[0],
    duration: 7,
    plannedDailySpend: 100,
    requiredDailyResults: 10,
    rules: { excellent: 0.10, stable: 0.20, review: 0.30 }
  });

  useEffect(() => {
    if (isOpen) {
        if (editMode && initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                type: 'Message',
                employee: EMPLOYEES[0],
                product: PRODUCTS[0],
                startDate: new Date().toISOString().split('T')[0],
                duration: 7,
                plannedDailySpend: 100,
                requiredDailyResults: 10,
                rules: { excellent: 0.10, stable: 0.20, review: 0.30 }
            });
        }
    }
  }, [isOpen, editMode, initialData]);

  if (!isOpen) return null;

  const expectedDailyCost = formData.requiredDailyResults > 0 
    ? (formData.plannedDailySpend / formData.requiredDailyResults).toFixed(2) 
    : 0;

  const handleSubmit = () => {
    const campaign = {
      id: editMode ? initialData.id : Date.now(),
      platform,
      ...formData,
      createdAt: editMode ? initialData.createdAt : new Date().toISOString()
    };
    onSave(campaign);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 transition-all">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] animate-[scale-in_0.2s_ease-out] border border-slate-100">
        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-extrabold text-[#1e3a8a]">{editMode ? 'Modifier' : 'Nouvelle'} Campagne</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Plateforme: <span className="font-bold text-slate-700">{platform}</span></p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-8 overflow-y-auto flex-1 no-scrollbar">
          <div className="mb-8">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wider">
              <div className="p-1.5 bg-[#1e3a8a]/10 rounded-lg text-[#1e3a8a]"><Target size={16} /></div> 
              Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField label="Type" type="select" options={CAMPAIGN_TYPES} value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} />
              <InputField label="Employé" type="select" options={EMPLOYEES} value={formData.employee} onChange={(e) => setFormData({...formData, employee: e.target.value})} />
              <InputField label="Produit" type="select" options={PRODUCTS} value={formData.product} onChange={(e) => setFormData({...formData, product: e.target.value})} />
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wider">
              <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600"><Calendar size={16} /></div>
              Timing & Budget
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <InputField label="Date début" type="date" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
              <InputField label="Durée (Jours)" type="number" value={formData.duration} onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})} />
              <InputField label="Budget/Jour ($)" type="number" value={formData.plannedDailySpend} onChange={(e) => setFormData({...formData, plannedDailySpend: parseFloat(e.target.value)})} />
              <InputField label="Obj. Résultats" type="number" value={formData.requiredDailyResults} onChange={(e) => setFormData({...formData, requiredDailyResults: parseInt(e.target.value)})} />
            </div>
          </div>

           <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <div className="flex justify-between items-start mb-4">
                 <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider">
                    <div className="p-1.5 bg-orange-100 rounded-lg text-orange-600"><TrendingUp size={16} /></div>
                    Règles CPA (Coût par Résultat)
                </h3>
                <div className="px-3 py-1 bg-white border border-slate-200 rounded-lg shadow-sm">
                     <span className="text-xs font-bold text-slate-500 uppercase mr-2">CPA Cible</span>
                     <span className="text-sm font-black text-[#2563EB]">${expectedDailyCost}</span>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField label="Excellent (<)" type="number" step="0.01" value={formData.rules.excellent} onChange={(e) => setFormData({...formData, rules: {...formData.rules, excellent: parseFloat(e.target.value)}})} />
              <InputField label="Stable (<)" type="number" step="0.01" value={formData.rules.stable} onChange={(e) => setFormData({...formData, rules: {...formData.rules, stable: parseFloat(e.target.value)}})} />
              <InputField label="À revoir (<)" type="number" step="0.01" value={formData.rules.review} onChange={(e) => setFormData({...formData, rules: {...formData.rules, review: parseFloat(e.target.value)}})} />
            </div>
          </div>
        </div>
        
        <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 rounded-b-3xl flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-slate-600 font-bold text-sm hover:bg-white border border-transparent hover:border-slate-200 transition-all">
            Annuler
          </button>
          <button onClick={handleSubmit} className="px-8 py-3 rounded-xl text-white font-bold text-sm flex items-center gap-2 bg-[#2563EB] hover:bg-[#1e40af] shadow-lg shadow-blue-900/20 transition-all">
            <Check size={18} /> {editMode ? 'Sauvegarder' : 'Créer la campagne'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ============================================================================
// TAB 1: OBJECTIFS
// ============================================================================

const ObjectifsTab = ({ campaigns, onAddCampaign, onDeleteCampaign, onEditCampaign, platform }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [campaignToEdit, setCampaignToEdit] = useState(null);
  const [filters, setFilters] = useState({ employee: 'Tous', product: 'Tous', dateFrom: '', dateTo: '' });

  const filteredCampaigns = campaigns.filter(c => {
    if (filters.employee !== 'Tous' && c.employee !== filters.employee) return false;
    if (filters.product !== 'Tous' && c.product !== filters.product) return false;
    if (filters.dateFrom && c.startDate < filters.dateFrom) return false;
    if (filters.dateTo && c.startDate > filters.dateTo) return false;
    return true;
  });

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Confirmer la suppression ?',
      text: "Cette action est irréversible. L'historique sera conservé mais détaché.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#94A3B8',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) onDeleteCampaign(id);
    });
  };

  const handleEdit = (campaign) => {
    setCampaignToEdit(campaign);
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <SpotlightCard className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#1e3a8a]/10 rounded-lg text-[#1e3a8a]"><Filter size={20} /></div>
            <h3 className="font-bold text-slate-800 text-lg">Filtrer les Campagnes</h3>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] text-white rounded-xl hover:bg-[#1e40af] transition-all font-bold text-sm shadow-lg shadow-blue-900/20"
          >
            <Plus size={18} /> Nouvelle Campagne
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <InputField label="Employé" type="select" options={['Tous', ...EMPLOYEES]} value={filters.employee} onChange={e => setFilters({...filters, employee: e.target.value})} />
            <InputField label="Produit" type="select" options={['Tous', ...PRODUCTS]} value={filters.product} onChange={e => setFilters({...filters, product: e.target.value})} />
            <InputField label="Date Début" type="date" value={filters.dateFrom} onChange={e => setFilters({...filters, dateFrom: e.target.value})} />
            <InputField label="Date Fin" type="date" value={filters.dateTo} onChange={e => setFilters({...filters, dateTo: e.target.value})} />
        </div>
      </SpotlightCard>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Campagne</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Objectifs (Jour)</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Seuils CPA</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCampaigns.length > 0 ? filteredCampaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 text-sm">{campaign.product}</span>
                      <span className="text-xs text-slate-500 mt-0.5">{campaign.employee} • {campaign.type}</span>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 font-medium bg-slate-100 w-fit px-1.5 py-0.5 rounded">
                         <Calendar size={10} /> {new Date(campaign.startDate).toLocaleDateString('fr-FR')} ({campaign.duration}j)
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                     <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-xs max-w-[140px]">
                            <span className="text-slate-500">Budget:</span>
                            <span className="font-bold text-slate-800">${campaign.plannedDailySpend}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs max-w-[140px]">
                            <span className="text-slate-500">Résultats:</span>
                            <span className="font-bold text-slate-800">{campaign.requiredDailyResults}</span>
                        </div>
                        <div className="h-px w-[140px] bg-slate-100 my-0.5"/>
                         <div className="flex items-center justify-between text-xs max-w-[140px]">
                            <span className="text-slate-500 font-bold">CPA Cible:</span>
                            <span className="font-black text-[#2563EB]">${(campaign.plannedDailySpend / campaign.requiredDailyResults).toFixed(2)}</span>
                        </div>
                     </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-2 max-w-xs">
                       <Badge color="emerald" label={`< $${campaign.rules.excellent}`} />
                       <Badge color="blue" label={`< $${campaign.rules.stable}`} />
                       <Badge color="orange" label={`< $${campaign.rules.review}`} />
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                     <div className="flex justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setSelectedCampaign(campaign)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"><Eye size={18}/></button>
                        <button onClick={() => handleEdit(campaign)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"><Edit2 size={18}/></button>
                        <button onClick={() => handleDelete(campaign.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={18}/></button>
                     </div>
                  </td>
                </tr>
              )) : (
                 <tr>
                     <td colSpan={4} className="py-12 text-center text-slate-400">
                         <div className="flex flex-col items-center gap-2">
                             <Database size={32} className="opacity-20"/>
                             <p>Aucune campagne trouvée pour ces filtres.</p>
                         </div>
                     </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddCampaignModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={onAddCampaign} platform={platform} />
      
      {isEditModalOpen && campaignToEdit && (
        <AddCampaignModal 
          isOpen={isEditModalOpen} 
          onClose={() => { setIsEditModalOpen(false); setCampaignToEdit(null); }} 
          onSave={(updated) => { onEditCampaign(updated); setIsEditModalOpen(false); setCampaignToEdit(null); }} 
          platform={platform}
          editMode={true}
          initialData={campaignToEdit}
        />
      )}

      {selectedCampaign && (
         <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
             <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-lg shadow-2xl relative">
                 <button onClick={() => setSelectedCampaign(null)} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full"><X size={20}/></button>
                 <h3 className="text-xl font-bold text-slate-800 mb-1">{selectedCampaign.product}</h3>
                 <p className="text-sm text-slate-500 mb-6">{selectedCampaign.employee} • {selectedCampaign.type}</p>
                 <div className="grid grid-cols-2 gap-4 mb-6">
                     <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <p className="text-xs font-bold text-slate-400 uppercase">Budget</p>
                         <p className="text-lg font-bold text-slate-800">${selectedCampaign.plannedDailySpend}</p>
                     </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <p className="text-xs font-bold text-slate-400 uppercase">Résultats</p>
                         <p className="text-lg font-bold text-slate-800">{selectedCampaign.requiredDailyResults}</p>
                     </div>
                 </div>
                 <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Règles de Coût</h4>
                 <div className="space-y-2">
                     <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                         <span className="text-xs font-bold text-emerald-700">Excellent</span>
                         <span className="text-sm font-bold text-emerald-800">&lt; ${selectedCampaign.rules.excellent}</span>
                     </div>
                     <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl border border-blue-100">
                         <span className="text-xs font-bold text-blue-700">Stable</span>
                         <span className="text-sm font-bold text-blue-800">&lt; ${selectedCampaign.rules.stable}</span>
                     </div>
                 </div>
             </div>
         </div>
      )}
    </div>
  );
};

// ============================================================================
// TAB 2: RAPPORT (Fixed Data Persistence & Logic)
// ============================================================================

const DataEntryModal = ({ campaigns, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    campaignId: '',
    date: new Date().toISOString().split('T')[0],
    actualSpend: '',
    actualResults: ''
  });

  const handleSubmit = () => {
    if (!formData.campaignId || !formData.actualSpend || !formData.actualResults) {
      Swal.fire('Erreur', 'Veuillez remplir tous les champs', 'error');
      return;
    }
    // We only need the ID, but we grab the object for the snapshot
    const selectedCampaign = campaigns.find(c => c.id === parseInt(formData.campaignId));
    
    const dataEntry = {
      id: Date.now(),
      campaignId: parseInt(formData.campaignId),
      // IMPORTANT: We store a snapshot, but use ID to look up live rules
      campaignSnapshot: selectedCampaign, 
      date: formData.date,
      actualSpend: parseFloat(formData.actualSpend),
      actualResults: parseInt(formData.actualResults),
      cost: parseFloat(formData.actualSpend) / parseInt(formData.actualResults),
      platform: selectedCampaign?.platform || 'Unknown'
    };
    onSave(dataEntry);
  };

  const cpa = (formData.actualSpend && formData.actualResults > 0) 
    ? (parseFloat(formData.actualSpend) / parseInt(formData.actualResults)).toFixed(2) 
    : '0.00';

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg animate-[scale-in_0.2s_ease-out] border border-slate-100">
         <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
             <h3 className="font-bold text-lg text-slate-800">Saisie des Performances</h3>
             <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-red-500"/></button>
         </div>
         <div className="p-6 space-y-5">
             <div className="group">
                <label className="block text-xs font-bold text-slate-500 mb-2 ml-1 uppercase tracking-widest">Campagne Active</label>
                <div className="relative">
                    <select 
                        value={formData.campaignId} 
                        onChange={(e) => setFormData({...formData, campaignId: e.target.value})}
                        className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 outline-none appearance-none cursor-pointer"
                    >
                        <option value="">Sélectionner...</option>
                        {campaigns.map(c => (
                            <option key={c.id} value={c.id}>{c.product} - {c.employee} ({c.type})</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14}/>
                </div>
             </div>
             <InputField label="Date" type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
             <div className="grid grid-cols-2 gap-4">
                <InputField label="Dépense ($)" type="number" placeholder="0.00" value={formData.actualSpend} onChange={(e) => setFormData({...formData, actualSpend: e.target.value})} />
                <InputField label="Résultats" type="number" placeholder="0" value={formData.actualResults} onChange={(e) => setFormData({...formData, actualResults: e.target.value})} />
             </div>
             <div className="bg-[#2563EB]/5 rounded-xl p-4 border border-[#2563EB]/10 flex justify-between items-center">
                 <span className="text-sm font-bold text-[#2563EB]">CPA Calculé</span>
                 <span className="text-xl font-black text-[#2563EB]">${cpa}</span>
             </div>
         </div>
         <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-3xl flex justify-end gap-3">
             <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-slate-500 font-bold text-sm hover:bg-white border border-transparent hover:border-slate-200">Annuler</button>
             <button onClick={handleSubmit} className="px-6 py-2.5 rounded-xl bg-[#2563EB] text-white font-bold text-sm hover:bg-[#1e40af] shadow-lg shadow-blue-900/20">Enregistrer</button>
         </div>
      </div>
    </div>,
    document.body
  );
}

const RapportTab = ({ dataEntries, campaigns, onDeleteEntry, onSaveData }) => {
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', product: 'Tous', employee: 'Tous', status: 'Tous', sortOrder: 'newest', sequence: 'non' });
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);

  // KEY FIX: Get the LIVE campaign if available, else fall back to snapshot
  const getEffectiveCampaign = (entry) => {
      const liveCampaign = campaigns.find(c => c.id === entry.campaignId);
      // Fallback to entry.campaign (old code) or entry.campaignSnapshot (new code)
      return liveCampaign || entry.campaignSnapshot || entry.campaign;
  };

  const getStatus = (cost, campaign) => {
    if (!campaign || !campaign.rules) return { label: 'N/A', color: 'slate' };
    if (cost < campaign.rules.excellent) return { label: 'Excellent', color: 'emerald' };
    if (cost < campaign.rules.stable) return { label: 'Stable', color: 'blue' };
    if (cost < campaign.rules.review) return { label: 'À revoir', color: 'orange' };
    return { label: 'Perte', color: 'red' };
  };

  const isPartOfConsecutiveSequence = (entry, minDays) => {
    if (minDays <= 0) return true;
    
    // Filter entries for the same campaign only
    const campaignEntries = dataEntries
        .filter(e => e.campaignId === entry.campaignId)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const effectiveC = getEffectiveCampaign(entry);
    const currentStatus = getStatus(entry.cost, effectiveC);
    const currentDate = new Date(entry.date).toISOString().split('T')[0];

    // Build a SET of dates that have this specific status
    // This handles cases where multiple entries exist for the same day with different statuses
    const datesWithStatus = new Set();
    for (const e of campaignEntries) {
      const dateStr = new Date(e.date).toISOString().split('T')[0];
      const eCampaign = getEffectiveCampaign(e);
      const status = getStatus(e.cost, eCampaign);
      if (status.label === currentStatus.label) {
        datesWithStatus.add(dateStr);
      }
    }

    // Check for sequences within the dates that have the status
    const sortedDates = Array.from(datesWithStatus).sort();
    
    for (let i = 0; i < sortedDates.length; i++) {
      const startDate = sortedDates[i];
      
      let sequence = [startDate];
      for (let j = i + 1; j < sortedDates.length; j++) {
        const nextDate = sortedDates[j];
        const lastDate = sequence[sequence.length - 1];
        const dayDiff = Math.round((new Date(nextDate) - new Date(lastDate)) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
            sequence.push(nextDate);
        } else {
            break;
        }
      }

      if (sequence.length >= minDays && sequence.includes(currentDate)) return true;
    }
    return false;
  };

  const filteredEntries = dataEntries.filter(entry => {
    const campaign = getEffectiveCampaign(entry);
    if (!campaign) return false; // Should not happen

    if (filters.dateFrom && entry.date < filters.dateFrom) return false;
    if (filters.dateTo && entry.date > filters.dateTo) return false;
    if (filters.product !== 'Tous' && campaign.product !== filters.product) return false;
    if (filters.employee !== 'Tous' && campaign.employee !== filters.employee) return false;
    
    if (filters.status !== 'Tous') {
      const status = getStatus(entry.cost, campaign);
      if (status.label !== filters.status) return false;
    }
    if (filters.sequence === 'oui' && !isPartOfConsecutiveSequence(entry, 2)) return false;
    return true;
  }).sort((a, b) => filters.sortOrder === 'newest' ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date));

  return (
    <div className="space-y-6">
        <SpotlightCard className="p-6">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><Filter size={20} /></div>
                    <h3 className="font-bold text-slate-800 text-lg">Rapport Quotidien</h3>
                </div>
                <button 
                    onClick={() => setIsEntryModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] text-white rounded-xl hover:bg-[#1e40af] transition-all font-bold text-sm shadow-lg shadow-blue-900/20"
                >
                    <Plus size={18} /> Ajouter Donnée
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-3">
                <InputField label="Du" type="date" value={filters.dateFrom} onChange={e => setFilters({...filters, dateFrom: e.target.value})} />
                <InputField label="Au" type="date" value={filters.dateTo} onChange={e => setFilters({...filters, dateTo: e.target.value})} />
                <InputField label="Produit" type="select" options={['Tous', ...PRODUCTS]} value={filters.product} onChange={e => setFilters({...filters, product: e.target.value})} />
                <InputField label="Employé" type="select" options={['Tous', ...EMPLOYEES]} value={filters.employee} onChange={e => setFilters({...filters, employee: e.target.value})} />
                <InputField label="Statut" type="select" options={['Tous', 'Excellent', 'Stable', 'À revoir', 'Perte']} value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} />
                <InputField label="Séquence" type="select" options={['Non', 'Oui']} value={filters.sequence === 'oui' ? 'Oui' : 'Non'} onChange={e => setFilters({...filters, sequence: e.target.value === 'Oui' ? 'oui' : 'non'})} />
                <InputField label="Tri" type="select" options={['Plus récent', 'Plus ancien']} value={filters.sortOrder === 'newest' ? 'Plus récent' : 'Plus ancien'} onChange={e => setFilters({...filters, sortOrder: e.target.value === 'Plus récent' ? 'newest' : 'oldest'})} />
            </div>
        </SpotlightCard>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
             <div className="overflow-x-auto">
                 <table className="w-full">
                     <thead className="bg-slate-50 border-b border-slate-100">
                         <tr>
                             <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Date</th>
                             <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Campagne</th>
                             <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase">Dépense</th>
                             <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase">Résultats</th>
                             <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase">CPA</th>
                             <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase">Statut</th>
                             <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase">Action</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                         {filteredEntries.map(entry => {
                             const campaign = getEffectiveCampaign(entry);
                             const status = getStatus(entry.cost, campaign);
                             
                             return (
                                 <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                                     <td className="px-6 py-4 text-sm font-bold text-slate-700">{new Date(entry.date).toLocaleDateString('fr-FR')}</td>
                                     <td className="px-6 py-4">
                                         <div className="flex flex-col">
                                             <span className="font-bold text-slate-800 text-sm">{campaign?.product || 'Inconnu'}</span>
                                             <span className="text-xs text-slate-500">{campaign?.employee}</span>
                                         </div>
                                     </td>
                                     <td className="px-6 py-4 text-center font-bold text-slate-800">${entry.actualSpend.toFixed(2)}</td>
                                     <td className="px-6 py-4 text-center font-bold text-slate-800">{entry.actualResults}</td>
                                     <td className="px-6 py-4 text-center font-black text-[#2563EB]">${entry.cost.toFixed(2)}</td>
                                     <td className="px-6 py-4 text-center">
                                         <Badge color={status.color} label={status.label} />
                                     </td>
                                     <td className="px-6 py-4 text-center">
                                         <button onClick={() => { 
                                             Swal.fire({
                                                 title: 'Supprimer ?', icon: 'warning', showCancelButton: true,
                                                 confirmButtonColor: '#EF4444', confirmButtonText: 'Oui', cancelButtonText: 'Non'
                                             }).then((r) => r.isConfirmed && onDeleteEntry(entry.id));
                                          }} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                                             <Trash2 size={18}/>
                                         </button>
                                     </td>
                                 </tr>
                             );
                         })}
                         {filteredEntries.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-slate-400">Aucune donnée.</td></tr>}
                     </tbody>
                 </table>
             </div>
        </div>
        
        {isEntryModalOpen && (
            <DataEntryModal 
                campaigns={campaigns} 
                onSave={(data) => { onSaveData(data); setIsEntryModalOpen(false); }} 
                onClose={() => setIsEntryModalOpen(false)} 
            />
        )}
    </div>
  );
};

// ============================================================================
// TAB 3: ANALYSE (Fixed Data Persistence)
// ============================================================================

const AnalyseTab = ({ dataEntries, campaigns }) => {
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', product: 'Tous', employee: 'Tous' });
  const [compareProductA, setCompareProductA] = useState(PRODUCTS[0]);
  const [compareEmployeeA, setCompareEmployeeA] = useState('Tous');
  const [compareProductB, setCompareProductB] = useState(PRODUCTS[1] || PRODUCTS[0]);
  const [compareEmployeeB, setCompareEmployeeB] = useState('Tous');

  // KEY FIX: Effective Campaign
  const getEffectiveCampaign = (entry) => {
    const liveCampaign = campaigns.find(c => c.id === entry.campaignId);
    return liveCampaign || entry.campaignSnapshot || entry.campaign;
  };

  const getStatus = (cost, campaign) => {
    if (!campaign || !campaign.rules) return 'N/A';
    if (cost < campaign.rules.excellent) return 'Excellent';
    if (cost < campaign.rules.stable) return 'Stable';
    if (cost < campaign.rules.review) return 'À revoir';
    return 'Perte';
  };

  const filteredEntries = dataEntries.filter(entry => {
    const campaign = getEffectiveCampaign(entry);
    if (!campaign) return false;

    if (filters.dateFrom && entry.date < filters.dateFrom) return false;
    if (filters.dateTo && entry.date > filters.dateTo) return false;
    if (filters.product !== 'Tous' && campaign.product !== filters.product) return false;
    if (filters.employee !== 'Tous' && campaign.employee !== filters.employee) return false;
    return true;
  });

  const statusFrequency = { 'Excellent': 0, 'Stable': 0, 'À revoir': 0, 'Perte': 0 };
  filteredEntries.forEach(e => {
      const c = getEffectiveCampaign(e);
      const s = getStatus(e.cost, c);
      if (statusFrequency[s] !== undefined) statusFrequency[s]++;
  });

  const actualTotalsGlobal = {
    spend: dataEntries.reduce((sum, e) => sum + e.actualSpend, 0),
    results: dataEntries.reduce((sum, e) => sum + e.actualResults, 0),
    avgCost: 0
  };
  actualTotalsGlobal.avgCost = actualTotalsGlobal.results > 0 ? actualTotalsGlobal.spend / actualTotalsGlobal.results : 0;

  // Use LIVE campaign targets to compare
  const targetTotalsEntryBasedGlobal = {
    spend: dataEntries.reduce((sum, e) => {
        const c = getEffectiveCampaign(e);
        return sum + (c?.plannedDailySpend || 0);
    }, 0),
    results: dataEntries.reduce((sum, e) => {
        const c = getEffectiveCampaign(e);
        return sum + (c?.requiredDailyResults || 0);
    }, 0),
    avgCost: 0
  };
  targetTotalsEntryBasedGlobal.avgCost = targetTotalsEntryBasedGlobal.results > 0 ? targetTotalsEntryBasedGlobal.spend / targetTotalsEntryBasedGlobal.results : 0;

  const differenceGlobal = {
    spend: actualTotalsGlobal.spend - targetTotalsEntryBasedGlobal.spend,
    results: actualTotalsGlobal.results - targetTotalsEntryBasedGlobal.results,
    avgCost: actualTotalsGlobal.avgCost - targetTotalsEntryBasedGlobal.avgCost
  };

  const getProductStats = (productName, employeeName) => {
    const entries = dataEntries.filter(e => {
        const c = getEffectiveCampaign(e);
        if (!c) return false;
        if (filters.dateFrom && e.date < filters.dateFrom) return false;
        if (filters.dateTo && e.date > filters.dateTo) return false;
        if (productName !== 'Tous' && c.product !== productName) return false;
        if (employeeName !== 'Tous' && c.employee !== employeeName) return false;
        return true;
    });

    const actuals = {
        spend: entries.reduce((sum, e) => sum + e.actualSpend, 0),
        results: entries.reduce((sum, e) => sum + e.actualResults, 0),
        avgCost: 0
    };
    actuals.avgCost = actuals.results > 0 ? actuals.spend / actuals.results : 0;
    
    const targets = {
        spend: entries.reduce((sum, e) => {
            const c = getEffectiveCampaign(e);
            return sum + (c?.plannedDailySpend || 0);
        }, 0),
        results: entries.reduce((sum, e) => {
            const c = getEffectiveCampaign(e);
            return sum + (c?.requiredDailyResults || 0);
        }, 0),
        avgCost: 0
    }
    targets.avgCost = targets.results > 0 ? targets.spend / targets.results : 0;

    const diff = {
        spend: actuals.spend - targets.spend,
        results: actuals.results - targets.results,
        avgCost: actuals.avgCost - targets.avgCost
    };
    return { actuals, targets, diff };
  };

  const statsA = getProductStats(compareProductA, compareEmployeeA);
  const statsB = getProductStats(compareProductB, compareEmployeeB);

  return (
    <div className="space-y-6">
        <SpotlightCard className="p-6">
             <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><BarChart3 size={20} /></div>
                <h3 className="font-bold text-slate-800 text-lg">Analyse Globale</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <InputField label="Du" type="date" value={filters.dateFrom} onChange={e => setFilters({...filters, dateFrom: e.target.value})} />
                <InputField label="Au" type="date" value={filters.dateTo} onChange={e => setFilters({...filters, dateTo: e.target.value})} />
                <InputField label="Produit" type="select" options={['Tous', ...PRODUCTS]} value={filters.product} onChange={e => setFilters({...filters, product: e.target.value})} />
                <InputField label="Employé" type="select" options={['Tous', ...EMPLOYEES]} value={filters.employee} onChange={e => setFilters({...filters, employee: e.target.value})} />
             </div>
        </SpotlightCard>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <SpotlightCard className="lg:col-span-1 p-6 flex flex-col justify-center">
                 <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6 text-center">Distribution des Statuts</h4>
                 <div className="flex justify-around items-end h-64 px-2">
                     {Object.entries(statusFrequency).map(([status, count]) => {
                         const max = Math.max(...Object.values(statusFrequency), 1);
                         const h = (count / max) * 100;
                         const colors = { 
                             'Excellent': 'bg-emerald-500 ring-emerald-200', 
                             'Stable': 'bg-blue-500 ring-blue-200', 
                             'À revoir': 'bg-orange-500 ring-orange-200', 
                             'Perte': 'bg-red-500 ring-red-200' 
                         };
                         return (
                             <div key={status} className="flex flex-col items-center group w-14">
                                 <div className="mb-2 text-sm font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">{count}</div>
                                 <div className={`w-full rounded-t-xl transition-all duration-500 relative group-hover:ring-4 ${colors[status]}`} style={{height: `${Math.max(h, 5)}%`}}></div>
                                 <div className="mt-3 text-[10px] font-bold text-slate-500 uppercase text-center">{status}</div>
                             </div>
                         )
                     })}
                 </div>
             </SpotlightCard>

             <SpotlightCard className="lg:col-span-2 p-0 overflow-hidden flex flex-col">
                 <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                     <h3 className="font-bold text-slate-800">Performance Globale (vs Objectifs)</h3>
                 </div>
                 <div className="overflow-x-auto flex-1">
                     <table className="w-full h-full">
                         <thead className="bg-slate-50 border-b border-slate-100">
                             <tr>
                                 <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Indicateur</th>
                                 <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">Dépenses</th>
                                 <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">Résultats</th>
                                 <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">CPA Moyen</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-50">
                             <tr className="hover:bg-blue-50/10">
                                 <td className="px-6 py-4 font-bold text-blue-600">Objectif</td>
                                 <td className="px-6 py-4 text-center font-mono text-slate-600">${targetTotalsEntryBasedGlobal.spend.toFixed(0)}</td>
                                 <td className="px-6 py-4 text-center font-mono text-slate-600">{targetTotalsEntryBasedGlobal.results}</td>
                                 <td className="px-6 py-4 text-center font-mono text-slate-600">${targetTotalsEntryBasedGlobal.avgCost.toFixed(2)}</td>
                             </tr>
                             <tr className="hover:bg-emerald-50/10">
                                 <td className="px-6 py-4 font-bold text-emerald-600">Réel</td>
                                 <td className="px-6 py-4 text-center font-mono text-slate-800 font-bold">${actualTotalsGlobal.spend.toFixed(0)}</td>
                                 <td className="px-6 py-4 text-center font-mono text-slate-800 font-bold">{actualTotalsGlobal.results}</td>
                                 <td className="px-6 py-4 text-center font-mono text-slate-800 font-bold">${actualTotalsGlobal.avgCost.toFixed(2)}</td>
                             </tr>
                             <tr className="bg-slate-50/50">
                                 <td className="px-6 py-4 font-bold text-slate-600">Différence</td>
                                 <td className={`px-6 py-4 text-center font-bold ${differenceGlobal.spend > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                     {differenceGlobal.spend > 0 ? '+' : ''}{differenceGlobal.spend.toFixed(0)}
                                 </td>
                                 <td className={`px-6 py-4 text-center font-bold ${differenceGlobal.results >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                     {differenceGlobal.results >= 0 ? '+' : ''}{differenceGlobal.results}
                                 </td>
                                 <td className={`px-6 py-4 text-center font-bold ${differenceGlobal.avgCost <= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                     {differenceGlobal.avgCost > 0 ? '+' : ''}{differenceGlobal.avgCost.toFixed(2)}
                                 </td>
                             </tr>
                         </tbody>
                     </table>
                 </div>
             </SpotlightCard>
        </div>

        <SpotlightCard className="p-6">
             <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
                 <TrendingUp size={20} className="text-[#018790]"/> Comparateur A/B
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex bg-white border border-slate-200 p-2 rounded-full shadow-lg z-10 text-slate-400 font-bold text-xs">VS</div>
                 
                 {/* Side A */}
                 <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                     <div className="grid grid-cols-2 gap-3 mb-4">
                         <InputField label="Produit A" type="select" options={['Tous', ...PRODUCTS]} value={compareProductA} onChange={e => setCompareProductA(e.target.value)} />
                         <InputField label="Employé A" type="select" options={['Tous', ...EMPLOYEES]} value={compareEmployeeA} onChange={e => setCompareEmployeeA(e.target.value)} />
                     </div>
                     <div className="space-y-3">
                         <div className="flex justify-between p-3 bg-white rounded-xl shadow-sm">
                             <span className="text-xs font-bold text-slate-400 uppercase">Dépenses Réelles</span>
                             <span className="font-bold text-slate-800">${statsA.actuals.spend.toFixed(0)}</span>
                         </div>
                         <div className="flex justify-between p-3 bg-white rounded-xl shadow-sm">
                             <span className="text-xs font-bold text-slate-400 uppercase">Résultats</span>
                             <span className="font-bold text-slate-800">{statsA.actuals.results}</span>
                         </div>
                         <div className="flex justify-between p-3 bg-white rounded-xl shadow-sm border-l-4 border-[#018790]">
                             <span className="text-xs font-bold text-slate-500 uppercase">CPA Moyen</span>
                             <span className="font-black text-[#018790]">${statsA.actuals.avgCost.toFixed(2)}</span>
                         </div>
                     </div>
                 </div>

                 {/* Side B */}
                 <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                     <div className="grid grid-cols-2 gap-3 mb-4">
                         <InputField label="Produit B" type="select" options={['Tous', ...PRODUCTS]} value={compareProductB} onChange={e => setCompareProductB(e.target.value)} />
                         <InputField label="Employé B" type="select" options={['Tous', ...EMPLOYEES]} value={compareEmployeeB} onChange={e => setCompareEmployeeB(e.target.value)} />
                     </div>
                     <div className="space-y-3">
                         <div className="flex justify-between p-3 bg-white rounded-xl shadow-sm">
                             <span className="text-xs font-bold text-slate-400 uppercase">Dépenses Réelles</span>
                             <span className="font-bold text-slate-800">${statsB.actuals.spend.toFixed(0)}</span>
                         </div>
                         <div className="flex justify-between p-3 bg-white rounded-xl shadow-sm">
                             <span className="text-xs font-bold text-slate-400 uppercase">Résultats</span>
                             <span className="font-bold text-slate-800">{statsB.actuals.results}</span>
                         </div>
                         <div className="flex justify-between p-3 bg-white rounded-xl shadow-sm border-l-4 border-blue-500">
                             <span className="text-xs font-bold text-slate-500 uppercase">CPA Moyen</span>
                             <span className="font-black text-blue-600">${statsB.actuals.avgCost.toFixed(2)}</span>
                         </div>
                     </div>
                 </div>
             </div>
        </SpotlightCard>
    </div>
  );
};

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function MarketingPage({ platform = 'WhatsApp' }) {
  const [activeTab, setActiveTab] = useState('objectifs');
  const [campaigns, setCampaigns] = useState([]);
  const [dataEntries, setDataEntries] = useState([]);

  // UseEffect for Loading
  useEffect(() => {
    try {
        const savedCampaigns = localStorage.getItem(`marketing_campaigns_${platform}`);
        const savedData = localStorage.getItem(`marketing_data_${platform}`);
        
        // Safety check to ensure we don't crash on invalid JSON
        if (savedCampaigns) setCampaigns(JSON.parse(savedCampaigns));
        if (savedData) setDataEntries(JSON.parse(savedData));
    } catch (e) {
        console.error("Error loading localStorage data:", e);
    }
  }, [platform]);

  // UseEffect for Saving
  useEffect(() => { 
      localStorage.setItem(`marketing_campaigns_${platform}`, JSON.stringify(campaigns)); 
  }, [campaigns, platform]);

  useEffect(() => { 
      localStorage.setItem(`marketing_data_${platform}`, JSON.stringify(dataEntries)); 
  }, [dataEntries, platform]);

  const handleAddCampaign = (c) => setCampaigns([...campaigns, c]);
  const onEditCampaign = (updated) => setCampaigns(campaigns.map(c => c.id === updated.id ? updated : c));
  const handleDeleteCampaign = (id) => setCampaigns(campaigns.filter(c => c.id !== id));
  const handleSaveData = (d) => setDataEntries([...dataEntries, d]);
  const handleDeleteEntry = (id) => setDataEntries(dataEntries.filter(e => e.id !== id));

  const tabs = [
    { id: 'objectifs', label: 'Objectifs & Campagnes', icon: Target },
    { id: 'rapport', label: 'Rapport Quotidien', icon: FileText },
    { id: 'analyse', label: 'Analyse & Stats', icon: Activity }
  ];

  return (
    <div className="w-full min-h-screen bg-transparent p-6 font-sans text-slate-800 dark:text-slate-200 animate-[fade-in_0.5s_ease-out]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 bg-white p-6 rounded-3xl border border-slate-100/50">
          <div>
            <div className="flex items-center gap-3 mb-1">
                 <div className="p-2 bg-slate-50 rounded-xl shadow-sm border border-slate-100"><Megaphone className="text-[#018790]" size={24}/></div>
                 <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Marketing <span className="text-[#018790]">{platform}</span></h1>
            </div>
            <p className="text-slate-500 font-medium ml-1">Gérez vos campagnes, suivez les coûts et analysez la rentabilité.</p>
          </div>
          <div className="flex bg-slate-50 p-1.5 rounded-2xl shadow-sm border border-slate-100">
             {tabs.map(tab => (
                 <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                        activeTab === tab.id 
                        ? 'bg-[#018790] text-white shadow-lg shadow-teal-900/20' 
                        : 'text-slate-500 hover:bg-white'
                    }`}
                 >
                     <tab.icon size={16} /> {tab.label}
                 </button>
             ))}
          </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'objectifs' && <ObjectifsTab campaigns={campaigns} onAddCampaign={handleAddCampaign} onDeleteCampaign={handleDeleteCampaign} onEditCampaign={onEditCampaign} platform={platform} />}
        {activeTab === 'rapport' && <RapportTab dataEntries={dataEntries} campaigns={campaigns} onDeleteEntry={handleDeleteEntry} onSaveData={handleSaveData} />}
        {activeTab === 'analyse' && <AnalyseTab dataEntries={dataEntries} campaigns={campaigns} />}
      </div>
    </div>
  );
}