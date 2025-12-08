import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, Save, Plus, Trash2, Edit2, RotateCw, CheckCircle, AlertCircle, 
  Layers, Package, Database, Briefcase, Tag, Ruler
} from 'lucide-react';
import { settingsAPI, businessAPI } from '../../services/api';

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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100/50 text-blue-600 rounded-lg">
                        <Icon size={18} />
                    </div>
                    <h3 className="font-bold text-slate-800">{title}</h3>
                </div>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">{items.length}</span>
            </div>

            <div className="p-4 border-b border-slate-100">
                <form onSubmit={handleAddItem} className="flex gap-2">
                    <input 
                        type="text" 
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        placeholder={placeholder}
                        className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                    />
                    <button 
                        type="submit" 
                        disabled={loading || !newItem.trim()}
                        className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <Plus size={20} />
                    </button>
                </form>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar max-h-[300px]">
                {items.length === 0 && (
                    <div className="text-center p-8 text-slate-400 italic text-sm">Aucune donnée</div>
                )}
                {items.map((item, idx) => (
                    <div key={idx} className="group flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100">
                        <span className="text-sm font-medium text-slate-700">{item}</span>
                        <button 
                            onClick={() => handleDeleteItem(item)}
                            className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SettingsPage = () => {
    const navigate = useNavigate();
    return (
         <div className="min-h-screen bg-slate-50/50 p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header */}
                <div>
                     <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <Settings className="text-slate-800" size={32} />
                        Paramètres Généraux
                    </h1>
                     <p className="text-slate-500 mt-2 font-medium">Gérez les listes déroulantes et configurations globales de l'application.</p>
                </div>

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
                        title="Magasins / Entrepôts" 
                        icon={Database} 
                        dataKey="settings_stores"
                        fetcher={settingsAPI.getStores}
                    />

                    {/* SECTION: BUSINESS UNITS (Table View) */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col md:col-span-2 lg:col-span-3">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-100/50 text-blue-600 rounded-lg">
                                    <Briefcase size={18} />
                                </div>
                                <h3 className="font-bold text-slate-800">Business Units (Détails API)</h3>
                            </div>
                            <button 
                                onClick={() => navigate('/admin/business')}
                                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                <Plus size={14} /> Ajouter
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-3">Business</th>
                                        <th className="px-6 py-3">API ID</th>
                                        <th className="px-6 py-3">Token</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    <BusinessListRow /> 
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

// Simple Icon Wrapper if Lucide doesn't have 'Tag' exported as 'TagsIcon' or similar naming conflict
const TagsIcon = (props) => <Tag {...props} />;



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

    if (loading) return <tr><td colSpan="3" className="p-4 text-center text-slate-400">Chargement...</td></tr>;
    if (businesses.length === 0) return <tr><td colSpan="3" className="p-4 text-center text-slate-400">Aucun business configuré</td></tr>;

    return (
        <>
            {businesses.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-semibold text-slate-700">{b.name}</td>
                    <td className="px-6 py-3 font-mono text-xs text-slate-500 bg-slate-50 rounded mx-2">{b.apiId || '-'}</td>
                    <td className="px-6 py-3 font-mono text-xs text-slate-400">{b.apiToken ? '••••••••' + b.apiToken.slice(-4) : '-'}</td>
                </tr>
            ))}
        </>
    );
};

export default SettingsPage;
