import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Edit2, Trash2, Eye, X, Upload, Check, 
  Package, FileText, DollarSign, ChevronLeft, ChevronRight, 
  Camera, AlertCircle, CheckCircle, ChevronDown, Printer,
  AlertTriangle, ShoppingCart, Info
} from 'lucide-react';
import { productAPI, warehouseAPI } from '../../services/api';
import Swal from 'sweetalert2';

// ============================================
// CONSTANTS & CONFIGURATION
// ============================================

const PRODUCT_TYPES = ['Matière Première', 'Fabriqué', 'Produit Pré'];
const PRODUCT_CATEGORIES = ['Cosmétique', 'Alimentaire', 'Pharmaceutique', 'Autre'];
const UNITE_CALCUL = ['ml', 'L', 'g', 'kg', 'unité', 'pièce'];
const BUSINESS_OPTIONS = ['Herboclear', 'Commit'];

// ============================================
// UTILITY COMPONENTS
// ============================================

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
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          {!disabled && <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><ChevronLeft className="rotate-[-90deg]" size={14} /></div>}
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

const Step1 = ({ formData, handleInputChange, isViewMode, setFormData }) => (
  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
    <div className="flex justify-center mb-8">
      <div className="relative group">
        <div className="w-32 h-32 rounded-2xl bg-slate-50 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden ring-1 ring-slate-100">
           {formData.image ? <img src={formData.image} alt="Produit" className="w-full h-full object-cover" /> : <Package size={48} className="text-slate-300" />}
        </div>
        {!isViewMode && (
          <label className="absolute bottom-1 right-1 bg-blue-600 p-2.5 rounded-full text-white cursor-pointer shadow-lg hover:bg-blue-700 transition-all">
            <Camera size={16} />
            <input type="button" className="hidden" onClick={() => setFormData(p => ({...p, image: `https://images.unsplash.com/photo-${1556228720195 + Math.floor(Math.random()*1000)}?w=200&h=200&fit=crop`}))} />
          </label>
        )}
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="md:col-span-2">
        <InputField label="Nom du Produit" value={formData.nom} onChange={(e) => handleInputChange('nom', e)} disabled={isViewMode} placeholder="Ex: Sérum Vitamine C" />
      </div>
      <InputField label="Type de Produit" type="select" options={PRODUCT_TYPES} value={formData.type} onChange={(e) => handleInputChange('type', e)} disabled={isViewMode} />
      <InputField label="Catégorie" type="select" options={PRODUCT_CATEGORIES} value={formData.categorie} onChange={(e) => handleInputChange('categorie', e)} disabled={isViewMode} />
      <InputField label="Unité de Calcul" type="select" options={UNITE_CALCUL} value={formData.uniteCalcul} onChange={(e) => handleInputChange('uniteCalcul', e)} disabled={isViewMode} />
      <InputField label="Business" type="select" options={BUSINESS_OPTIONS} value={formData.business} onChange={(e) => handleInputChange('business', e)} disabled={isViewMode} />
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

const Step3 = ({ formData, handleInputChange, isViewMode, setFormData, warehouses = [] }) => (
  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
    <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-6 flex items-start gap-3">
      <ShoppingCart className="text-orange-600 shrink-0 mt-0.5" size={18} />
      <div><h4 className="text-sm font-bold text-orange-800">Gestion du Stock</h4><p className="text-xs text-orange-600 mt-1">Configurez les quantités et les alertes de stock.</p></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

const Step4 = ({ formData, handleInputChange, isViewMode }) => (
  <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-5">
    <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 flex items-start gap-3">
      <Info className="text-purple-600 shrink-0 mt-0.5" size={18} />
      <div><h4 className="text-sm font-bold text-purple-800">Informations Détaillées</h4><p className="text-xs text-purple-600 mt-1">Ajoutez toutes les informations produit pour vos clients.</p></div>
    </div>
    
    <InputField label="Description" textarea value={formData.description} onChange={(e) => handleInputChange('description', e)} disabled={isViewMode} placeholder="Description complète du produit..." required={false} />
    <InputField label="🥣 Ingrédients" textarea value={formData.ingredients} onChange={(e) => handleInputChange('ingredients', e)} disabled={isViewMode} placeholder="Liste des ingrédients..." required={false} />
    <InputField label="📖 Mode d'Emploi" textarea value={formData.modeEmploi} onChange={(e) => handleInputChange('modeEmploi', e)} disabled={isViewMode} placeholder="Instructions d'utilisation..." required={false} />
    <InputField label="⛔ Utilisations Interdites" textarea value={formData.utilisationsInterdites} onChange={(e) => handleInputChange('utilisationsInterdites', e)} disabled={isViewMode} placeholder="Contre-indications et précautions..." required={false} />
    <InputField label="❓ FAQ" textarea value={formData.faq} onChange={(e) => handleInputChange('faq', e)} disabled={isViewMode} placeholder="Questions fréquentes et réponses..." required={false} />
    <InputField label="🗣️ Script de Vente" textarea value={formData.scriptVente} onChange={(e) => handleInputChange('scriptVente', e)} disabled={isViewMode} placeholder="Arguments de vente..." required={false} />
  </div>
);

// ============================================
// VIEW PRODUCT MODAL
// ============================================

const ViewProductModal = ({ isOpen, onClose, product }) => {
  if (!isOpen || !product) return null;

  const InfoSection = ({ icon: Icon, title, content, color = "blue" }) => {
    if (!content) return null;
    return (
      <div className={`bg-${color}-50 border border-${color}-100 rounded-xl p-4`}>
        <div className="flex items-center gap-2 mb-2">
          <Icon size={18} className={`text-${color}-600`} />
          <h4 className={`font-bold text-sm text-${color}-800`}>{title}</h4>
        </div>
        <p className={`text-sm text-${color}-700 whitespace-pre-line`}>{content}</p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
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
        
        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar space-y-6">
          {/* Pricing Grid */}
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

          {/* Stock Info */}
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

          {/* Detailed Info */}
          <div className="space-y-4">
            <InfoSection icon={FileText} title="Description" content={product.description} color="slate" />
            <InfoSection icon={Package} title="🥣 Ingrédients" content={product.ingredients} color="green" />
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

const ProductModal = ({ isOpen, onClose, mode, initialData, onSave, warehouses = [] }) => {
  const [step, setStep] = useState(1);
  
  const emptyForm = {
    nom: '', image: '', type: PRODUCT_TYPES[0], categorie: PRODUCT_CATEGORIES[0],
    uniteCalcul: UNITE_CALCUL[0], business: BUSINESS_OPTIONS[0],
    prixAchat: '', prix1: '', prix2: '', prix3: '',
    fragile: false, stock: '', alerteStock: '', warehouse: '',
    description: '', ingredients: '', modeEmploi: '', utilisationsInterdites: '', faq: '', scriptVente: ''
  };

  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      if ((mode === 'edit' || mode === 'view') && initialData) {
        setFormData({ ...emptyForm, ...initialData });
      } else {
        setFormData(emptyForm);
      }
    }
  }, [isOpen, mode, initialData]);

  if (!isOpen) return null;

  const isViewMode = mode === 'view';
  const modalTitle = mode === 'add' ? 'Ajouter un Produit' : mode === 'edit' ? 'Modifier le Produit' : 'Détails du Produit';

  const handleInputChange = (field, e) => {
    const value = e.target.type === 'number' ? e.target.value : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.nom.trim()) {
      Swal.fire('Erreur', 'Le nom du produit est requis', 'error');
      return;
    }
    
    // Convert string numbers to actual numbers before saving
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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
          <div><h2 className="text-2xl font-bold text-slate-800">{modalTitle}</h2></div>
          <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors"><X size={24} /></button>
        </div>
        
        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
          <Stepper step={step} setStep={setStep} />
          {step === 1 && <Step1 formData={formData} handleInputChange={handleInputChange} isViewMode={isViewMode} setFormData={setFormData} />}
          {step === 2 && <Step2 formData={formData} handleInputChange={handleInputChange} isViewMode={isViewMode} />}
          {step === 3 && <Step3 formData={formData} handleInputChange={handleInputChange} isViewMode={isViewMode} setFormData={setFormData} warehouses={warehouses} />}
          {step === 4 && <Step4 formData={formData} handleInputChange={handleInputChange} isViewMode={isViewMode} />}
        </div>
        
        <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 rounded-b-3xl flex justify-between items-center">
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} className="px-6 py-2.5 rounded-xl text-slate-600 font-semibold hover:bg-white border border-transparent hover:border-slate-200 flex items-center gap-2 transition-all"><ChevronLeft size={18} /> Précédent</button>
          ) : <div />}
          
          {step < 4 ? (
             <button onClick={() => setStep(step + 1)} className="px-8 py-3 rounded-xl text-white font-semibold flex items-center gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all">Suivant <ChevronRight size={18} /></button>
          ) : (
             !isViewMode && (
                <button onClick={handleSubmit} className="px-8 py-3 rounded-xl text-white font-semibold flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/30 transition-all">
                    <Check size={18} /> {mode === 'add' ? 'Créer le produit' : 'Sauvegarder'}
                </button>
             )
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('Tous');
  const [categoryFilter, setCategoryFilter] = useState('Tous');
  const [businessFilter, setBusinessFilter] = useState('Tous');
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);
  
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const [productsData, warehousesData] = await Promise.all([
        productAPI.getAll(),
        warehouseAPI.getAll()
      ]);
      setProducts(productsData);
      setWarehouses(warehousesData);
    } catch (error) {
      console.error('Error loading products:', error);
      showToast('Erreur de chargement des produits', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (productData) => {
    try {
      if (modalMode === 'add') {
        await productAPI.create(productData);
        showToast("Produit ajouté avec succès !", "success");
      } else if (modalMode === 'edit') {
        await productAPI.update(selectedProduct.id, productData);
        showToast("Modifications enregistrées !", "success");
      }
      setIsModalOpen(false);
      loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      showToast('Erreur lors de la sauvegarde', 'error');
    }
  };

  const handleDelete = async (id) => {
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
        await productAPI.delete(id);
        Swal.fire('Supprimé !', 'Le produit a été supprimé.', 'success');
        loadProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        Swal.fire('Erreur !', 'Une erreur est survenue lors de la suppression.', 'error');
      }
    }
  };

  const handlePrint = (product) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Fiche Produit - ${product.nom}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #1e293b; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }
            .section { margin: 20px 0; padding: 15px; background: #f8fafc; border-left: 4px solid #3b82f6; }
            .section h2 { color: #3b82f6; margin-top: 0; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .info { margin: 10px 0; }
            .label { font-weight: bold; color: #64748b; }
          </style>
        </head>
        <body>
          <h1>${product.nom}</h1>
          <div class="grid">
            <div class="info"><span class="label">Type:</span> ${product.type}</div>
            <div class="info"><span class="label">Catégorie:</span> ${product.categorie}</div>
            <div class="info"><span class="label">Unité:</span> ${product.uniteCalcul}</div>
            <div class="info"><span class="label">Fragile:</span> ${product.fragile ? 'Oui' : 'Non'}</div>
          </div>
          
          <div class="section">
            <h2>Tarification</h2>
            <div class="grid">
              <div class="info"><span class="label">Prix d'achat:</span> ${product.prixAchat} MAD</div>
              <div class="info"><span class="label">Prix vente 1:</span> ${product.prix1} MAD</div>
              <div class="info"><span class="label">Prix vente 2:</span> ${product.prix2} MAD</div>
              <div class="info"><span class="label">Prix vente 3:</span> ${product.prix3} MAD</div>
            </div>
          </div>
          
          <div class="section">
            <h2>Stock</h2>
            <div class="info"><span class="label">Quantité:</span> ${product.stock} ${product.uniteCalcul}</div>
            <div class="info"><span class="label">Alerte:</span> ${product.alerteStock} ${product.uniteCalcul}</div>
          </div>
          
          ${product.description ? `<div class="section"><h2>Description</h2><p>${product.description}</p></div>` : ''}
          ${product.ingredients ? `<div class="section"><h2>🥣 Ingrédients</h2><p>${product.ingredients}</p></div>` : ''}
          ${product.modeEmploi ? `<div class="section"><h2>📖 Mode d'Emploi</h2><p>${product.modeEmploi}</p></div>` : ''}
          ${product.utilisationsInterdites ? `<div class="section"><h2>⛔ Utilisations Interdites</h2><p>${product.utilisationsInterdites}</p></div>` : ''}
          ${product.faq ? `<div class="section"><h2>❓ FAQ</h2><p>${product.faq}</p></div>` : ''}
          ${product.scriptVente ? `<div class="section"><h2>🗣️ Script de Vente</h2><p>${product.scriptVente}</p></div>` : ''}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleOpenView = (product) => {
    setViewProduct(product);
    setIsViewModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setModalMode('edit');
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleOpenAdd = () => {
    setModalMode('add');
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const filteredProducts = products.filter(prod => {
    const matchesSearch = (prod.nom && prod.nom.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'Tous' || prod.type === typeFilter;
    const matchesCategory = categoryFilter === 'Tous' || prod.categorie === categoryFilter;
    const matchesBusiness = businessFilter === 'Tous' || prod.business === businessFilter;
    return matchesSearch && matchesType && matchesCategory && matchesBusiness;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 p-8 font-sans text-slate-800 relative">
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gestion des Produits</h1>
            <p className="text-slate-500 mt-1 font-medium">Gérez votre catalogue de produits efficacement.</p>
          </div>
          <button 
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 font-semibold"
          >
            <Plus size={20} /> Ajouter un produit
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mt-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input type="text" placeholder="Rechercher par nom..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
          </div>
          
          <div className="relative">
            <select 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full md:w-48 pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
            >
              <option value="Tous">Tous les types</option>
              {PRODUCT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
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
              {PRODUCT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
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
              {BUSINESS_OPTIONS.map(biz => <option key={biz} value={biz}>{biz}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">#</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Image</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nom</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Catégorie</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Entrepôt</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Stock</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Achat</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Vente 1</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.map((product, index) => {
                const isLowStock = product.stock <= product.alerteStock;
                return (
                  <tr key={product.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-600">{index + 1}</td>
                    <td className="px-6 py-4">
                      <img src={product.image} alt={product.nom} className="w-12 h-12 rounded-lg object-cover shadow-sm ring-1 ring-slate-100" />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="block font-semibold text-slate-800">{product.nom}</span>
                        <span className="text-xs text-slate-400">{product.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                        {product.categorie}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {product.warehouse ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                          {product.warehouse}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-slate-800">{product.stock || 0}</span>
                        <span className="text-xs text-slate-400">{product.uniteCalcul}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">{product.prixAchat} MAD</td>
                    <td className="px-6 py-4 text-sm font-semibold text-emerald-600">{product.prix1} MAD</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenView(product)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Voir"><Eye size={18} /></button>
                        <button onClick={() => handleOpenEdit(product)} className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition" title="Modifier"><Edit2 size={18} /></button>
                        <button onClick={() => handlePrint(product)} className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition" title="Imprimer"><Printer size={18} /></button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Supprimer"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="p-10 text-center text-slate-400 flex flex-col items-center">
                <Package size={40} className="mb-2 opacity-20" />
                <p>Aucun produit trouvé</p>
            </div>
          )}
        </div>
      </div>

      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        mode={modalMode}
        initialData={selectedProduct}
        onSave={handleSave}
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
