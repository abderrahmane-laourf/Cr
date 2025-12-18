import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, Save, Plus, Trash2, CheckCircle, AlertCircle, 
  Package, Database, Briefcase, Tag, Ruler, Truck, MapPin, X, Printer
} from 'lucide-react';
import { settingsAPI, businessAPI } from '../../services/api';
import SpotlightCard from '../../util/SpotlightCard';

const Toast = ({ message, type = 'success', onClose }) => {
  if (!message) return null;
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
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

const ListManager = ({ title, icon: Icon, dataKey, fetcher, placeholder = "Nouvelle valeur..." }) => {
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = () => {
        const data = fetcher();
        setItems(data);
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!newItem.trim()) return;
        if (items.includes(newItem.trim())) {
            setToast({ message: "Cette valeur existe déjà.", type: "error" });
            return;
        }

        setLoading(true);
        const updatedList = [...items, newItem.trim()];
        await settingsAPI.updateList(dataKey, updatedList);
        setItems(updatedList);
        setNewItem('');
        setLoading(false);
        setToast({ message: "Ajouté avec succès !", type: "success" });
    };

    const handleDeleteItem = async (itemToDelete) => {
        if (!window.confirm(`Supprimer "${itemToDelete}" ?`)) return;
        
        setLoading(true);
        const updatedList = items.filter(item => item !== itemToDelete);
        await settingsAPI.updateList(dataKey, updatedList);
        setItems(updatedList);
        setLoading(false);
         setToast({ message: "Supprimé avec succès !", type: "success" });
    };

    return (
        <SpotlightCard theme="light" className="h-full flex flex-col !p-0 overflow-hidden border border-slate-200">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-[#1e3a8a]/5">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#1e3a8a]/10 text-[#1e3a8a] rounded-lg">
                        <Icon size={18} />
                    </div>
                    <h3 className="font-bold text-[#1e3a8a]">{title}</h3>
                </div>
                <span className="text-xs font-bold text-[#2563EB] bg-[#2563EB]/10 px-2.5 py-1 rounded-full">{items.length}</span>
            </div>

            <div className="p-4 border-b border-slate-100 bg-white">
                <form onSubmit={handleAddItem} className="flex gap-2">
                    <input 
                        type="text" 
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        placeholder={placeholder}
                        className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all placeholder:text-slate-400"
                    />
                    <button 
                        type="submit" 
                        disabled={loading || !newItem.trim()}
                        className="p-2.5 bg-[#1e3a8a] text-white rounded-xl hover:bg-[#1e40af] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-900/20"
                    >
                        <Plus size={20} />
                    </button>
                </form>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar max-h-[300px] bg-white">
                {items.length === 0 && (
                    <div className="text-center p-8 text-slate-300 italic text-sm">Aucune donnée</div>
                )}
                {items.map((item, idx) => (
                    <div key={idx} className="group flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100">
                        <span className="text-sm font-semibold text-slate-700 ml-2">{item}</span>
                        <button 
                            onClick={() => handleDeleteItem(item)}
                            className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </SpotlightCard>
    );
};

const DebtPrintConfigSection = () => {
    const [config, setConfig] = useState({
        showDate: true,
        showSupplier: true,
        showAmount: true,
        showStatus: true,
        showDescription: true,
        companyName: '',
        footerText: ''
    });
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadConfig = async () => {
            const savedConfig = await settingsAPI.getDebtPrintConfig();
            if (savedConfig) {
                setConfig(savedConfig);
            }
        };
        loadConfig();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        await settingsAPI.updateDebtPrintConfig(config);
        setToast({ message: "Configuration impression sauvegardée !", type: "success" });
        setLoading(false);
    };

    const handleToggle = (field) => {
        setConfig(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleInputChange = (field, value) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    return (
        <SpotlightCard theme="light" className="flex flex-col md:col-span-2 lg:col-span-3 !p-0 overflow-hidden border border-slate-200">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-[#1e3a8a]/5">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100/50 text-blue-600 rounded-lg">
                        <Printer size={18} />
                    </div>
                    <h3 className="font-bold text-[#1e3a8a]">Configuration Impression Dettes</h3>
                </div>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-white">
                {/* Toggles */}
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Colonnes à afficher</h4>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { key: 'showDate', label: 'Date' },
                            { key: 'showSupplier', label: 'Fournisseur' },
                            { key: 'showAmount', label: 'Montant' },
                            { key: 'showStatus', label: 'Statut' },
                            { key: 'showDescription', label: 'Description' }
                        ].map((item) => (
                            <label key={item.key} className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${config[item.key] ? 'bg-[#2563EB] border-[#2563EB]' : 'bg-white border-slate-300 group-hover:border-[#2563EB]'}`}>
                                    {config[item.key] && <CheckCircle size={14} className="text-white" />}
                                </div>
                                <input 
                                    type="checkbox" 
                                    className="hidden" 
                                    checked={config[item.key]} 
                                    onChange={() => handleToggle(item.key)}
                                />
                                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800">{item.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Text Fields */}
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">En-tête et Pied de page</h4>
                    <div className="group">
                        <label className="block text-xs font-bold text-[#1e3a8a] mb-2 ml-1 uppercase tracking-wider">Nom de la Société (En-tête)</label>
                        <input 
                            type="text"
                            value={config.companyName}
                            onChange={(e) => handleInputChange('companyName', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all"
                            placeholder="Ex: Ma Société SARL"
                        />
                    </div>
                    <div className="group">
                        <label className="block text-xs font-bold text-[#1e3a8a] mb-2 ml-1 uppercase tracking-wider">Texte Pied de page</label>
                        <input 
                            type="text"
                            value={config.footerText}
                            onChange={(e) => handleInputChange('footerText', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all"
                            placeholder="Ex: Merci de votre confiance."
                        />
                    </div>
                </div>

                <div className="md:col-span-2 pt-4 border-t border-slate-100">
                    <button 
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#1e3a8a] text-white rounded-xl hover:bg-[#1e40af] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-900/20 font-bold"
                    >
                        <Save size={18} /> Sauvegarder la Configuration
                    </button>
                </div>
            </div>
        </SpotlightCard>
    );
};

const SettingsPage = () => {
    const navigate = useNavigate();
    return (
         <div className="w-full min-h-screen bg-transparent animate-[fade-in_0.6s_ease-out] p-8 font-sans text-slate-800 dark:text-slate-200 relative">
            <div className="w-full space-y-8">
                
                {/* Header */}
                 <SpotlightCard theme="light" className="mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold text-[#2563EB] tracking-tight flex items-center gap-3">
                                <Settings className="text-[#1e3a8a]" size={32} />
                                Paramètres Généraux
                            </h1>
                            <p className="text-slate-500 mt-1 font-medium">
                                Gérez les listes déroulantes et configurations globales de l'application.
                            </p>
                        </div>
                    </div>
                </SpotlightCard>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    
                    {/* SECTION: PRODUITS */}
                    <ListManager 
                        title="Catégories Produits" 
                        icon={TagsIcon} 
                        dataKey="settings_product_categories"
                        fetcher={settingsAPI.getProductCategories}
                    />
                    
                    <ListManager 
                        title="Types Produits" 
                        icon={Package} 
                        dataKey="settings_product_types"
                        fetcher={settingsAPI.getProductTypes}
                    />

                    <ListManager 
                        title="Unités de Mesure" 
                        icon={Ruler} 
                        dataKey="settings_units"
                        fetcher={settingsAPI.getUnits}
                        placeholder="Ex: kg, L, unité..."
                    />

                    <ListManager 
                        title="Types d'Emballage" 
                        icon={Package} 
                        dataKey="settings_packaging_types"
                        fetcher={settingsAPI.getPackagingTypes}
                        placeholder="Ex: Carton S, Enveloppe..."
                    />

                    <ListManager 
                        title="Magasins / Entrepôts" 
                        icon={Database} 
                        dataKey="settings_stores"
                        fetcher={settingsAPI.getStores}
                    />

                    <ListManager 
                        title="Quartiers Agadir" 
                        icon={MapPin} 
                        dataKey="settings_quartiers_agadir"
                        fetcher={settingsAPI.getQuartiersAgadir}
                        placeholder="Ex: Talborjt, Founty..."
                    />

                    {/* SECTION: DELIVERY CONFIGURATION */}
                    <DeliveryConfigSection />

                    {/* SECTION: DEBT PRINT CONFIGURATION */}
                    <DebtPrintConfigSection />

                    {/* SECTION: BUSINESS UNITS (Table View) */}
                    <SpotlightCard theme="light" className="flex flex-col md:col-span-2 lg:col-span-3 !p-0 overflow-hidden border border-slate-200">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-[#1e3a8a]/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#1e3a8a]/10 text-[#1e3a8a] rounded-lg">
                                    <Briefcase size={18} />
                                </div>
                                <h3 className="font-bold text-[#1e3a8a]">Business Units (Détails API)</h3>
                            </div>
                            <button 
                                onClick={() => navigate('/admin/business')}
                                className="flex items-center gap-2 px-4 py-2 bg-[#1e3a8a] text-white rounded-lg text-xs font-bold hover:bg-[#1e40af] transition-all shadow-md shadow-blue-900/20"
                            >
                                <Plus size={14} /> Ajouter
                            </button>
                        </div>
                        <div className="overflow-x-auto bg-white">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50/50 text-[#1e3a8a] font-bold uppercase text-xs border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4">Business</th>
                                        <th className="px-6 py-4">API ID</th>
                                        <th className="px-6 py-4">Token</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    <BusinessListRow /> 
                                </tbody>
                            </table>
                        </div>
                    </SpotlightCard>

                </div>
            </div>
        </div>
    );
};

// Simple Icon Wrapper if Lucide doesn't have 'Tag' exported as 'TagsIcon' or similar naming conflict
const TagsIcon = (props) => <Tag {...props} />;

const DeliveryConfigSection = () => {
    const navigate = useNavigate();
    const [config, setConfig] = useState({
        prixLivraisonAmmex: 30,
        prixLivraisonAgadir: 20
    });
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadConfig = async () => {
            const savedConfig = await settingsAPI.getDeliveryConfig();
            if (savedConfig) {
                setConfig(savedConfig);
            }
        };
        loadConfig();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        await settingsAPI.updateDeliveryConfig(config);
        setToast({ message: "Configuration sauvegardée !", type: "success" });
        setLoading(false);
    };

    const handleInputChange = (field, value) => {
        setConfig(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
    };

    return (
        <SpotlightCard theme="light" className="flex flex-col md:col-span-2 lg:col-span-3 !p-0 overflow-hidden border border-slate-200">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-[#1e3a8a]/5">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100/50 text-blue-600 rounded-lg">
                        <Truck size={18} />
                    </div>
                    <h3 className="font-bold text-[#1e3a8a]">Configuration Livraison</h3>
                </div>
                <button 
                    onClick={() => navigate('/admin/historiquepaiementlivraison')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20"
                >
                    Historique Paiements
                </button>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-white">
                <div className="group">
                    <label className="block text-xs font-bold text-[#1e3a8a] mb-2 ml-1 uppercase tracking-wider group-focus-within:text-[#2563EB] transition-colors">
                        Prix Livraison Ammex
                    </label>
                    <div className="relative">
                        <input 
                            type="number"
                            step="0.01"
                            value={config.prixLivraisonAmmex}
                            onChange={(e) => handleInputChange('prixLivraisonAmmex', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">DH</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1.5 ml-1">Prix standard pour les livraisons via Ammex</p>
                </div>

                <div className="group">
                    <label className="block text-xs font-bold text-[#1e3a8a] mb-2 ml-1 uppercase tracking-wider group-focus-within:text-[#2563EB] transition-colors">
                        Prix Livraison Agadir
                    </label>
                    <div className="relative">
                        <input 
                            type="number"
                            step="0.01"
                            value={config.prixLivraisonAgadir}
                            onChange={(e) => handleInputChange('prixLivraisonAgadir', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">DH</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1.5 ml-1">Prix standard pour les livraisons locales sur Agadir</p>
                </div>

                <div className="md:col-span-2">
                    <button 
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#1e3a8a] text-white rounded-xl hover:bg-[#1e40af] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-900/20 font-bold"
                    >
                        <Save size={18} /> Sauvegarder la Configuration
                    </button>
                </div>
            </div>
        </SpotlightCard>
    );
};

const BusinessListRow = () => {
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await businessAPI.getAll();
                setBusinesses(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <tr><td colSpan="3" className="p-8 text-center text-slate-400 animate-pulse">Chargement des données...</td></tr>;
    if (businesses.length === 0) return <tr><td colSpan="3" className="p-8 text-center text-slate-400 italic">Aucun business configuré</td></tr>;

    return (
        <>
            {businesses.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors group border-b border-slate-50 last:border-0">
                    <td className="px-6 py-4 font-bold text-slate-700">{b.name}</td>
                    <td className="px-6 py-4">
                        <span className="font-mono text-xs text-[#1e3a8a] bg-[#1e3a8a]/5 px-2 py-1 rounded border border-[#1e3a8a]/10">{b.apiId || '-'}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400 group-hover:text-slate-500 transition-colors">{b.apiToken ? '••••••••' + b.apiToken.slice(-4) : '-'}</td>
                </tr>
            ))}
        </>
    );
};

export default SettingsPage;
