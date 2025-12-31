import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Plus, Search, Trash2, Edit2, Save, X, Package, 
  AlertCircle, TrendingUp, TrendingDown, Box, Truck,
  ChevronDown, ChevronUp, CheckCircle2, Printer, Check
} from 'lucide-react';
import { productAPI, settingsAPI } from '../../services/api';

export default function PackagingPage() {
  // --- States ---
  const [view, setView] = useState('stock'); // 'stock' or 'preparation'
  const [packagings, setPackagings] = useState([]);
  const [products, setProducts] = useState([]);
  const [packagingTypes, setPackagingTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);

  // --- Mock Data for Preparation (Hada ghat-jibou mn l-API d les commandes) ---
  const [preparationOrders, setPreparationOrders] = useState([
    { 
      id: 'p1', 
      productName: 'Huile d\'Argan 50ml', 
      totalPieces: 120, 
      orders: [
        { id: 'CMD-8821', qty: 50, status: 'pending' },
        { id: 'CMD-8825', qty: 70, status: 'pending' },
      ]
    },
    { 
      id: 'p2', 
      productName: 'Savon Noir Premium', 
      totalPieces: 45, 
      orders: [
        { id: 'CMD-9012', qty: 45, status: 'pending' },
      ]
    }
  ]);

  // --- Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPackaging, setCurrentPackaging] = useState(null);
  const [formData, setFormData] = useState({
    id: '', productId: '', piecesPerPackage: 1, alertStock: 10, currentStock: 0, name: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const prods = await productAPI.getAll();
      setProducts(prods);
      setPackagingTypes(settingsAPI.getPackagingTypes());
      const saved = localStorage.getItem('packagings');
      if (saved) setPackagings(JSON.parse(saved));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---
  const savePackagings = (newPkgs) => {
    setPackagings(newPkgs);
    localStorage.setItem('packagings', JSON.stringify(newPkgs));
  };

  const handleActionRapid = (prodId) => {
    // Mark everything in this product group as prepared
    setPreparationOrders(prev => prev.map(p => {
      if (p.id === prodId) {
        return { ...p, orders: p.orders.map(o => ({ ...o, status: 'prepared' })) };
      }
      return p;
    }));
  };

  const markOneAsPrepared = (prodId, orderId) => {
    setPreparationOrders(prev => prev.map(p => {
      if (p.id === prodId) {
        return { ...p, orders: p.orders.map(o => o.id === orderId ? { ...o, status: 'prepared' } : o) };
      }
      return p;
    }));
  };

  const getStockStatus = (stock, alert) => {
    if (stock <= alert) return { color: 'red', label: 'Alerte', icon: AlertCircle };
    if (stock <= alert * 2) return { color: 'orange', label: 'Faible', icon: TrendingDown };
    return { color: 'emerald', label: 'Bon', icon: TrendingUp };
  };

  const filteredPackagings = packagings.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    products.find(prod => prod.id == p.productId)?.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- UI Components (Internal) ---
  const StockView = () => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      <table className="w-full text-left">
        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
          <tr>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Emballage</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Produit</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Stock</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Statut</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredPackagings.map(pkg => {
            const status = getStockStatus(pkg.currentStock, pkg.alertStock);
            const product = products.find(p => p.id == pkg.productId);
            return (
              <tr key={pkg.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{pkg.name}</td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{product?.nom || '---'}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`font-black text-lg ${pkg.currentStock <= pkg.alertStock ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>
                    {pkg.currentStock}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-${status.color}-50 dark:bg-${status.color}-900/20 text-${status.color}-600 border border-${status.color}-100`}>
                    <status.icon size={12} /> {status.label}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => { setCurrentPackaging(pkg); setFormData(pkg); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => { if(confirm('Supprimer?')) savePackagings(packagings.filter(p => p.id !== pkg.id)) }} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const PreparationView = () => (
    <div className="space-y-4">
      {preparationOrders.map(group => (
        <div key={group.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Group Header */}
          <div 
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            onClick={() => setExpandedRow(expandedRow === group.id ? null : group.id)}
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-lg flex flex-col items-center justify-center shadow-lg shadow-blue-500/20">
                <span className="text-lg font-black leading-none">{group.totalPieces}</span>
                <span className="text-[8px] font-bold uppercase">pcs</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100">{group.productName}</h3>
                <p className="text-xs text-slate-500 font-medium">{group.orders.length} Commandes en attente</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={(e) => { e.stopPropagation(); handleActionRapid(group.id); }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2"
              >
                <Check size={16} /> Tout Marquer Prêt
              </button>
              {expandedRow === group.id ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
            </div>
          </div>

          {/* Expanded Orders List */}
          {expandedRow === group.id && (
            <div className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 p-4 animate-in slide-in-from-top-2 duration-200">
              <div className="grid gap-2">
                {group.orders.map(order => (
                  <div key={order.id} className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-6">
                      <span className="font-mono font-bold text-blue-600 text-sm">{order.id}</span>
                      <span className="text-sm font-black text-slate-700 dark:text-slate-200">{order.qty} pièces</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {order.status === 'prepared' ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 size={14} /> Sticker Prêt
                          </span>
                          <button className="p-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors" title="Imprimer Sticker">
                            <Printer size={16} />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => markOneAsPrepared(group.id, order.id)}
                          className="px-3 py-1.5 border border-slate-200 dark:border-slate-600 text-xs font-bold rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                        >
                          Marquer préparé
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Navigation / Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Package className="text-blue-600" /> Logistique & Packaging
            </h1>
            <div className="flex gap-4 mt-3">
              <button 
                onClick={() => setView('stock')}
                className={`text-sm font-bold pb-1 transition-all border-b-2 ${view === 'stock' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}
              >
                Stock Emballages
              </button>
              <button 
                onClick={() => setView('preparation')}
                className={`text-sm font-bold pb-1 transition-all border-b-2 ${view === 'preparation' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}
              >
                À Préparer
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Chercher..." 
                className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl border-none text-sm w-64 focus:ring-2 ring-blue-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => { setCurrentPackaging(null); setFormData({id:'', productId: products[0]?.id || '', piecesPerPackage:1, alertStock:10, currentStock:0, name:''}); setIsModalOpen(true); }}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/20"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Content View */}
        {view === 'stock' ? <StockView /> : <PreparationView />}

      </div>

      {/* Simplified Modal (Single File Friendly) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-slate-100">{currentPackaging ? 'Modifier' : 'Nouveau Packaging'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form className="p-6 space-y-4" onSubmit={(e) => {
              e.preventDefault();
              if (currentPackaging) {
                savePackagings(packagings.map(p => p.id === currentPackaging.id ? formData : p));
              } else {
                savePackagings([...packagings, { ...formData, id: Date.now().toString() }]);
              }
              setIsModalOpen(false);
            }}>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Type</label>
                <select className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required>
                  <option value="">-- Type --</option>
                  {packagingTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Produit</label>
                <select className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg" value={formData.productId} onChange={e => setFormData({...formData, productId: e.target.value})} required>
                  <option value="">-- Produit --</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Stock Actuel</label>
                  <input type="number" className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg" value={formData.currentStock} onChange={e => setFormData({...formData, currentStock: parseInt(e.target.value)})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Alerte</label>
                  <input type="number" className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg" value={formData.alertStock} onChange={e => setFormData({...formData, alertStock: parseInt(e.target.value)})} />
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors mt-4">Enregistrer</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}