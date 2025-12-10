import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Edit2, Trash2, Eye, X, Upload, Check, 
  Package, FileText, DollarSign, ChevronLeft, ChevronRight, 
  Camera, AlertCircle, CheckCircle, ChevronDown, Printer,
  AlertTriangle, ShoppingCart, Info
} from 'lucide-react';

// ============================================
// MOCK API SERVICES
// ============================================
import { productAPI, settingsAPI, warehouseAPI } from '../../services/api';
import Swal from 'sweetalert2';

// ============================================
// UTILITY COMPONENTS
// ============================================

const InputField = ({ label, type = "text", placeholder, options, value, onChange, disabled, required = true, textarea = false }) => (
  <div className="group">
    <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider group-focus-within:text-blue-600 transition-colors">
      {label} {required && !disabled && <span className="text-red-400">*</span>}
    </label>
    <div className="relative">
      {options ? (
        <div className="relative">
          <select 
            disabled={disabled}
            className={`w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 appearance-none disabled:bg-slate-100 disabled:text-slate-500 cursor-pointer`}
            value={value}
            onChange={onChange}
          >
            <option value="" disabled>Sélectionner...</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          {!disabled && <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><ChevronDown size={14} /></div>}
        </div>
      ) : textarea ? (
        <textarea 
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full pl-4 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 disabled:bg-slate-100 disabled:text-slate-500 min-h-[100px] resize-y`}
          value={value}
          onChange={onChange}
          rows={4}
        />
      ) : (
        <input 
          type={type} 
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full pl-4 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 disabled:bg-slate-100 disabled:text-slate-500`}
          value={value}
          onChange={onChange}
          step={type === 'number' ? '0.01' : undefined}
          min={type === 'number' ? '0' : undefined}
        />
      )}
    </div>
  </div>
);

const CheckboxField = ({ label, checked, onChange, disabled }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors">
    <div 
      onClick={() => !disabled && onChange(!checked)}
      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors cursor-pointer
        ${checked ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300 text-transparent'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <Check size={14} strokeWidth={4} />
    </div>
    <label className="text-sm font-semibold text-slate-700 cursor-pointer" onClick={() => !disabled && onChange(!checked)}>
      {label}
    </label>
  </div>
);

// ============================================
// MODAL STEP COMPONENTS
// ============================================

const Stepper = ({ step, setStep }) => {
  const steps = [ 
    { id: 1, label: "Info", icon: Package }, 
    { id: 2, label: "Prix", icon: DollarSign }, 
    { id: 3, label: "Stock", icon: ShoppingCart },
    { id: 4, label: "Détails", icon: FileText }
  ];
  
  const progress = ((step - 1) / (steps.length - 1)) * 100;
  
  return (
    <div className="mb-8 px-4">
      <div className="relative h-1 bg-slate-100 rounded-full mb-6 mx-8 mt-2">
        <div className="absolute top-0 left-0 h-full bg-blue-600 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
        <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 flex justify-between">
          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = step >= s.id;
            return (
              <button 
                key={s.id} 
                onClick={() => setStep(s.id)}
                type="button"
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 cursor-pointer
                  ${isActive ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-110' : 'bg-white border-slate-200 text-slate-300 hover:border-blue-300'}`}
                title={s.label}
              >
                <Icon size={16} />
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex justify-between px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
         {steps.map(s => <span key={s.id} className={`${step >= s.id ? 'text-blue-600' : ''}`}>{s.label}</span>)}
      </div>
    </div>
  );
};

const Step1 = ({ formData, handleInputChange, isViewMode, setFormData, settings }) => (
  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
    <div className="flex justify-center mb-8">
      <div className="relative group">
        <div className="w-32 h-32 rounded-2xl bg-slate-50 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden ring-1 ring-slate-100">
           {formData.image ? <img src={formData.image} alt="Produit" className="w-full h-full object-cover" /> : <Package size={48} className="text-slate-300" />}
        </div>
        {!isViewMode && (
          <button 
            type="button"
            onClick={() => setFormData(p => ({...p, image: `https://images.unsplash.com/photo-${1556228720195 + Math.floor(Math.random()*1000)}?w=200&h=200&fit=crop`}))}
            className="absolute bottom-1 right-1 bg-blue-600 p-2.5 rounded-full text-white cursor-pointer shadow-lg hover:bg-blue-700 transition-all border-none outline-none"
          >
            <Camera size={16} />
          </button>
        )}
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="md:col-span-2">
        <InputField label="Nom du Produit" value={formData.nom} onChange={(e) => handleInputChange('nom', e)} disabled={isViewMode} placeholder="Ex: Sérum Vitamine C" />
      </div>
      <InputField label="Type de Produit" type="select" options={settings?.types || []} value={formData.type} onChange={(e) => handleInputChange('type', e)} disabled={isViewMode} />
      <InputField label="Catégorie" type="select" options={settings?.categories || []} value={formData.categorie} onChange={(e) => handleInputChange('categorie', e)} disabled={isViewMode} />
      <InputField label="Unité de Calcul" type="select" options={settings?.units || []} value={formData.uniteCalcul} onChange={(e) => handleInputChange('uniteCalcul', e)} disabled={isViewMode} />
      <InputField label="Business" type="select" options={settings?.businesses || []} value={formData.business} onChange={(e) => handleInputChange('business', e)} disabled={isViewMode} />
    </div>
  </div>
);

const Step2 = ({ formData, handleInputChange, isViewMode }) => (
  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-start gap-3">
      <DollarSign className="text-blue-600 shrink-0 mt-0.5" size={18} />
      <div><h4 className="text-sm font-bold text-blue-800">Tarification</h4><p className="text-xs text-blue-600 mt-1">Définissez le prix d'achat et les trois prix de vente.</p></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="md:col-span-2">
        <InputField label="Prix d'Achat (MAD)" type="number" value={formData.prixAchat} onChange={(e) => handleInputChange('prixAchat', e)} disabled={isViewMode} placeholder="0.00" />
      </div>
      <InputField label="Prix de Vente 1 (MAD)" type="number" value={formData.prix1} onChange={(e) => handleInputChange('prix1', e)} disabled={isViewMode} placeholder="0.00" />
      <InputField label="Prix de Vente 2 (MAD)" type="number" value={formData.prix2} onChange={(e) => handleInputChange('prix2', e)} disabled={isViewMode} placeholder="0.00" />
      <div className="md:col-span-2">
        <InputField label="Prix de Vente 3 (MAD)" type="number" value={formData.prix3} onChange={(e) => handleInputChange('prix3', e)} disabled={isViewMode} placeholder="0.00" />
      </div>
    </div>
  </div>
);

const Step3 = ({ formData, handleInputChange, isViewMode, setFormData, settings, warehouses = [] }) => (
  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
    <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-6 flex items-start gap-3">
      <ShoppingCart className="text-orange-600 shrink-0 mt-0.5" size={18} />
      <div><h4 className="text-sm font-bold text-orange-800">Gestion du Stock</h4><p className="text-xs text-orange-600 mt-1">Configurez les quantités et les alertes de stock.</p></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <InputField label="Magasin" type="select" options={settings?.stores || []} value={formData.magasin} onChange={(e) => handleInputChange('magasin', e)} disabled={isViewMode} />
      <InputField label="Quantité en Stock" type="number" value={formData.stock} onChange={(e) => handleInputChange('stock', e)} disabled={isViewMode} placeholder="0" />
      <InputField label="Alerte de Stock" type="number" value={formData.alerteStock} onChange={(e) => handleInputChange('alerteStock', e)} disabled={isViewMode} placeholder="10" />
      <div className="md:col-span-2">
        <InputField 
          label="Entrepôt / Dépôt" 
          type="select" 
          options={['', ...warehouses.map(w => w.name)]} 
          value={formData.warehouse} 
          onChange={(e) => handleInputChange('warehouse', e)} 
          disabled={isViewMode} 
          required={false}
        />
      </div>
      <div className="md:col-span-2">
        <CheckboxField 
          label="Produit Fragile" 
          checked={formData.fragile} 
          onChange={(val) => setFormData(p => ({...p, fragile: val}))} 
          disabled={isViewMode}
        />
      </div>
    </div>
  </div>
);

const Step4 = ({ formData, handleInputChange, isViewMode, setFormData }) => {
  const [detailsType, setDetailsType] = useState('text');
  
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-5">
      <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 flex items-start gap-3">
        <Info className="text-purple-600 shrink-0 mt-0.5" size={18} />
        <div><h4 className="text-sm font-bold text-purple-800">Informations Détaillées</h4><p className="text-xs text-purple-600 mt-1">Ajoutez toutes les informations produit pour vos clients.</p></div>
      </div>
      
      {!isViewMode && (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setDetailsType('text')}
            className={`flex-1 py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all ${
              detailsType === 'text' 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            <FileText className="inline mr-2" size={18} />
            Saisir en Texte
          </button>
          <button
            type="button"
            onClick={() => setDetailsType('pdf')}
            className={`flex-1 py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all ${
              detailsType === 'pdf' 
                ? 'border-purple-500 bg-purple-50 text-purple-700' 
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            <Upload className="inline mr-2" size={18} />
            Importer un PDF
          </button>
        </div>
      )}

      {detailsType === 'text' ? (
        <>
          <InputField label="Description" textarea value={formData.description} onChange={(e) => handleInputChange('description', e)} disabled={isViewMode} placeholder="Description complète du produit..." required={false} />
          <InputField label="🥣 Ingrédients" textarea value={formData.ingredients} onChange={(e) => handleInputChange('ingredients', e)} disabled={isViewMode} placeholder="Liste des ingrédients..." required={false} />
          <InputField label="📖 Mode d'Emploi" textarea value={formData.modeEmploi} onChange={(e) => handleInputChange('modeEmploi', e)} disabled={isViewMode} placeholder="Instructions d'utilisation..." required={false} />
          <InputField label="⛔ Utilisations Interdites" textarea value={formData.utilisationsInterdites} onChange={(e) => handleInputChange('utilisationsInterdites', e)} disabled={isViewMode} placeholder="Contre-indications et précautions..." required={false} />
          <InputField label="❓ FAQ" textarea value={formData.faq} onChange={(e) => handleInputChange('faq', e)} disabled={isViewMode} placeholder="Questions fréquentes et réponses..." required={false} />
          <InputField label="🗣️ Script de Vente" textarea value={formData.scriptVente} onChange={(e) => handleInputChange('scriptVente', e)} disabled={isViewMode} placeholder="Arguments de vente..." required={false} />
        </>
      ) : (
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Fichier PDF des Détails</label>
          <label className="flex flex-col items-center gap-4 w-full px-6 py-8 rounded-xl bg-purple-50 border-2 border-dashed border-purple-300 hover:border-purple-400 cursor-pointer transition-all group">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 group-hover:bg-purple-200 transition-colors">
              <Upload size={32} />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-purple-700 group-hover:text-purple-800">Cliquez pour importer un PDF</p>
              <p className="text-xs text-purple-500 mt-1">Contenant toutes les informations du produit</p>
            </div>
            <input 
              type="file" 
              accept=".pdf" 
              className="hidden" 
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setFormData(prev => ({...prev, detailsPDF: file}));
                }
              }} 
            />
          </label>
          {formData.detailsPDF && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <CheckCircle size={18} className="text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-700">
                {typeof formData.detailsPDF === 'string' ? 'Fichier existant' : formData.detailsPDF.name}
              </span>
              <button 
                type="button"
                onClick={() => setFormData(prev => ({...prev, detailsPDF: null}))}
                className="ml-auto p-1 hover:bg-emerald-100 rounded text-emerald-600"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================
// VIEW PRODUCT MODAL
// ============================================

const ViewProductModal = ({ isOpen, onClose, product }) => {
  if (!isOpen || !product) return null;

  const InfoSection = ({ icon: Icon, title, content, color = "blue" }) => {
    if (!content) return null;
    const bgClass = `bg-${color}-50`;
    const borderClass = `border-${color}-100`;
    const iconClass = `text-${color}-600`;
    const titleClass = `text-${color}-800`;
    const textClass = `text-${color}-700`;
    
    return (
      <div className={`${bgClass} ${borderClass} border rounded-xl p-4`}>
        <div className="flex items-center gap-2 mb-2">
          <Icon size={18} className={iconClass} />
          <h4 className={`font-bold text-sm ${titleClass}`}>{title}</h4>
        </div>
        <p className={`text-sm ${textClass} whitespace-pre-line`}>{content}</p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <img src={product.image} alt={product.nom} className="w-16 h-16 rounded-xl object-cover shadow-md" />
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{product.nom}</h2>
              <p className="text-slate-500 text-sm">{product.categorie} • {product.type}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors"><X size={24} /></button>
        </div>
        
        <div className="p-8 overflow-y-auto flex-1 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-xl border border-emerald-200">
              <p className="text-xs text-emerald-600 font-bold uppercase mb-1">Prix d'Achat</p>
              <p className="text-2xl font-bold text-emerald-700">{product.prixAchat} MAD</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
              <p className="text-xs text-blue-600 font-bold uppercase mb-1">Prix Vente 1</p>
              <p className="text-2xl font-bold text-blue-700">{product.prix1} MAD</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
              <p className="text-xs text-purple-600 font-bold uppercase mb-1">Prix Vente 2</p>
              <p className="text-2xl font-bold text-purple-700">{product.prix2} MAD</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
              <p className="text-xs text-orange-600 font-bold uppercase mb-1">Prix Vente 3</p>
              <p className="text-2xl font-bold text-orange-700">{product.prix3} MAD</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500 font-bold uppercase mb-1">Stock Actuel</p>
              <p className="text-xl font-bold text-slate-700">{product.stock} {product.uniteCalcul}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500 font-bold uppercase mb-1">Alerte Stock</p>
              <p className="text-xl font-bold text-slate-700">{product.alerteStock} {product.uniteCalcul}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500 font-bold uppercase mb-1">Entrepôt</p>
              <p className="text-xl font-bold text-slate-700">{product.warehouse || 'Non défini'}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500 font-bold uppercase mb-1">Fragile</p>
              <p className="text-xl font-bold text-slate-700">{product.fragile ? '✓ Oui' : '✗ Non'}</p>
            </div>
          </div>

          <div className="space-y-4">
            <InfoSection icon={FileText} title="Description" content={product.description} color="slate" />
            <InfoSection icon={Package} title="🥣 Ingrédients" content={product.ingredients} color="emerald" />
            <InfoSection icon={Info} title="📖 Mode d'Emploi" content={product.modeEmploi} color="blue" />
            <InfoSection icon={AlertTriangle} title="⛔ Utilisations Interdites" content={product.utilisationsInterdites} color="red" />
            <InfoSection icon={FileText} title="❓ FAQ" content={product.faq} color="purple" />
            <InfoSection icon={FileText} title="🗣️ Script de Vente" content={product.scriptVente} color="orange" />
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN PRODUCT MODAL
// ============================================

const ProductModal = ({ isOpen, onClose, mode, initialData, onSave, warehouses = [], settings }) => {
  const [step, setStep] = useState(1);
  
  const emptyForm = {
    nom: '', image: '', type: settings?.types?.[0] || '', categorie: settings?.categories?.[0] || '',
    uniteCalcul: settings?.units?.[0] || '', business: settings?.businesses?.[0] || '', magasin: settings?.stores?.[0] || '',
    prixAchat: '', prix1: '', prix2: '', prix3: '',
    fragile: false, stock: '', alerteStock: '', warehouse: '',
    description: '', ingredients: '', modeEmploi: '', utilisationsInterdites: '', faq: '', scriptVente: '',
    detailsPDF: null
  };

  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      if ((mode === 'edit' || mode === 'view') && initialData) {
        setFormData({ ...emptyForm, ...initialData });
      } else {
        setFormData({
            ...emptyForm, 
            type: settings?.types?.[0] || '', 
            categorie: settings?.categories?.[0] || '',
            uniteCalcul: settings?.units?.[0] || '',
            business: settings?.businesses?.[0] || '',
            magasin: settings?.stores?.[0] || ''
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mode, initialData]);

  if (!isOpen) return null;

  const isViewMode = mode === 'view';
  const modalTitle = mode === 'add' ? 'Ajouter un Produit' : mode === 'edit' ? 'Modifier le Produit' : 'Détails du Produit';

  const handleInputChange = (field, e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.nom.trim()) {
      Swal.fire('Erreur', 'Le nom du produit est requis', 'error');
      return;
    }
    
    const dataToSave = {
      ...formData,
      prixAchat: parseFloat(formData.prixAchat) || 0,
      prix1: parseFloat(formData.prix1) || 0,
      prix2: parseFloat(formData.prix2) || 0,
      prix3: parseFloat(formData.prix3) || 0,
      stock: parseFloat(formData.stock) || 0,
      alerteStock: parseFloat(formData.alerteStock) || 10
    };
    
    onSave(dataToSave);
  };

  return (
    <div className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
      <div className={`bg-white rounded-3xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{modalTitle}</h2>
            <p className="text-slate-500 text-sm mt-1">Gérez les détails de votre produit.</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto flex-1">
          <Stepper step={step} setStep={setStep} />
          {step === 1 && <Step1 formData={formData} handleInputChange={handleInputChange} isViewMode={isViewMode} setFormData={setFormData} settings={settings} />}
          {step === 2 && <Step2 formData={formData} handleInputChange={handleInputChange} isViewMode={isViewMode} />}
          {step === 3 && <Step3 formData={formData} handleInputChange={handleInputChange} isViewMode={isViewMode} setFormData={setFormData} settings={settings} warehouses={warehouses} />}
          {step === 4 && <Step4 formData={formData} handleInputChange={handleInputChange} isViewMode={isViewMode} setFormData={setFormData} />}
        </div>
        
        <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 rounded-b-3xl flex justify-between items-center">
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} className="px-6 py-2.5 rounded-xl text-slate-600 font-semibold hover:bg-white border border-transparent hover:border-slate-200 flex items-center gap-2 transition-all">
              <ChevronLeft size={18} /> Précédent
            </button>
          ) : <div />}
          
          <div className="flex gap-3">
            {step < 4 ? (
              <button onClick={() => setStep(s => s + 1)} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2">
                Suivant <ChevronRight size={18} />
              </button>
            ) : (
              !isViewMode && (
                <button onClick={handleSubmit} className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-semibold shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-2">
                  <Check size={18} /> Enregistrer
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [warehouses, setWarehouses] = useState([]);
  const [settings, setSettings] = useState({ 
    types: [], categories: [], units: [], stores: [], businesses: [] 
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('Tous');
  const [categoryFilter, setCategoryFilter] = useState('Tous');
  const [businessFilter, setBusinessFilter] = useState('Tous');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [productsData, types, categories, units, stores, businesses, warehousesData] = await Promise.all([
        productAPI.getAll(),
        settingsAPI.getProductTypes(),
        settingsAPI.getProductCategories(),
        settingsAPI.getUnits(),
        settingsAPI.getStores(),
        settingsAPI.getBusinesses(),
        warehouseAPI.getAll().catch(() => [])
      ]);
      
      setProducts(productsData);
      setSettings({ types, categories, units, stores, businesses });
      setWarehouses(warehousesData);
    } catch (error) {
      console.error("Error loading data:", error);
      setSettings({
        types: ['Matière Première', 'Fabriqué', 'Produit Pré'],
        categories: ['Cosmétique', 'Alimentaire'],
        units: ['ml', 'g', 'kg'],
        stores: ['Magasin Principal'],
        businesses: ['Herboclear', 'Commit']
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (productData) => {
    try {
      if (modalMode === 'add') {
        const newProduct = await productAPI.create(productData);
        setProducts([...products, newProduct]);
        Swal.fire('Succès', 'Produit ajouté avec succès', 'success');
      } else {
        const updated = await productAPI.update(selectedProduct.id, productData);
        setProducts(products.map(p => p.id === updated.id ? updated : p));
        Swal.fire('Succès', 'Produit mis à jour', 'success');
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving product:", error);
      Swal.fire('Erreur', 'Impossible d\'enregistrer le produit', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: { text: "Êtes-vous sûr ? Cette action est irréversible !" },
        text: "Cette action est irréversible !",
        icon: 'warning',
      });

      if (result.isConfirmed) {
        await productAPI.delete(id);
        setProducts(products.filter(p => p.id !== id));
        Swal.fire('Supprimé !', 'Le produit a été supprimé.', 'success');
      }
    } catch (error) {
      Swal.fire('Erreur', 'Erreur lors de la suppression', 'error');
    }
  };

  const handleOpenAdd = () => {
    setModalMode('add');
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setModalMode('edit');
    setSelectedProduct(product);
    setIsModalOpen(true);
  };
  
  const handleOpenView = (product) => {
    setViewProduct(product);
    setIsViewModalOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.categorie?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'Tous' || p.type === typeFilter;
    const matchesCategory = categoryFilter === 'Tous' || p.categorie === categoryFilter;
    const matchesBusiness = businessFilter === 'Tous' || p.business === businessFilter;
    return matchesSearch && matchesType && matchesCategory && matchesBusiness;
  });

  const lowStockCount = products.filter(p => parseFloat(p.stock) <= parseFloat(p.alerteStock || 10)).length;

  return (
    <div className="min-h-screen bg-slate-50/50 p-8 font-sans text-slate-900">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6 print:hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gestion des Produits</h1>
              <p className="text-slate-500 mt-1 font-medium">Gérez votre catalogue de produits efficacement.</p>
            </div>
            
            <button 
              onClick={handleOpenAdd}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 font-semibold"
            >
              <Plus size={20} strokeWidth={2.5} />
              <span>Nouveau Produit</span>
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Rechercher par nom..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div className="relative">
              <select 
                value={typeFilter} 
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full md:w-48 pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
              >
                <option value="Tous">Tous les types</option>
                {settings.types.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>

            <div className="relative">
              <select 
                value={categoryFilter} 
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full md:w-48 pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
              >
                <option value="Tous">Toutes catégories</option>
                {settings.categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>

            <div className="relative">
              <select 
                value={businessFilter} 
                onChange={(e) => setBusinessFilter(e.target.value)}
                className="w-full md:w-48 pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
              >
                <option value="Tous">Tous Business</option>
                {settings.businesses.map(biz => <option key={biz} value={biz}>{biz}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print:shadow-none print:border-none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="px-6 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Produit</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Catégorie</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Prix Unitaire</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Business</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider print:hidden">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">Chargement...</td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                       <div className="flex flex-col items-center justify-center text-slate-400">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                          <Package size={40} className="opacity-20 text-slate-600" />
                        </div>
                        <h3 className="font-bold text-lg text-slate-700">Aucun produit trouvé</h3>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(product => {
                    const isLowStock = parseFloat(product.stock) <= parseFloat(product.alerteStock || 10);
                    return (
                      <tr key={product.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                              {product.image ? (
                                <img src={product.image} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Package className="text-slate-300" size={20} />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800">{product.nom}</div>
                              <div className="text-xs text-slate-500">{product.type}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                            {product.categorie}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-700">{product.prix1} MAD</div>
                          <div className="text-xs text-slate-400">Achat: {product.prixAchat}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-600 font-medium">{product.business}</div>
                        </td>
                        <td className="px-6 py-4">
                          {isLowStock ? (
                            <div className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-3 py-1 rounded-lg w-fit border border-orange-100">
                              <AlertTriangle size={14} />
                              <span className="text-xs font-bold">{product.stock} {product.uniteCalcul}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg w-fit border border-emerald-100">
                              <CheckCircle size={14} />
                              <span className="text-xs font-bold">{product.stock} {product.uniteCalcul}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right print:hidden">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleOpenView(product)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Voir"><Eye size={18} /></button>
                            <button onClick={() => handleOpenEdit(product)} className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors" title="Modifier"><Edit2 size={18} /></button>
                            <button onClick={handlePrint} className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Imprimer"><Printer size={18} /></button>
                            <button onClick={() => handleDelete(product.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer"><Trash2 size={18} /></button>
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
      </div>

      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        mode={modalMode}
        initialData={selectedProduct}
        onSave={handleSave}
        settings={settings}
        warehouses={warehouses}
      />

      <ViewProductModal 
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        product={viewProduct}
      />
    </div>
  );
}