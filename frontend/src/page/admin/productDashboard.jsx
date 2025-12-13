import React, { useState, useEffect } from 'react';
import { 
  Package, TrendingUp, AlertTriangle, DollarSign, 
  ShoppingCart, Layers, Activity, CheckCircle, BarChart3, Search, Filter
} from 'lucide-react';
import { productAPI } from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';
import SpotlightCard from '../../util/SpotlightCard';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export default function ProductDashboard() {
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productAPI.getAll() || [];
      setAllProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- Filtering Logic ---
  const filteredProducts = allProducts.filter(p => {
      const matchCat = selectedCategory === 'all' || p.categorie === selectedCategory;
      const matchType = selectedType === 'all' || p.type === selectedType;
      const matchSearch = !searchTerm || (p.nom && p.nom.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchCat && matchType && matchSearch;
  });

  // Unique Lists for Dropdowns
  const categories = [...new Set(allProducts.map(p => p.categorie).filter(Boolean))];
  const types = [...new Set(allProducts.map(p => p.type).filter(Boolean))];

  // --- Statistics (Based on Filtered Data) ---
  const totalProducts = filteredProducts.length;
  const lowStockProducts = filteredProducts.filter(p => p.stock <= p.alerteStock);
  const totalStockValue = filteredProducts.reduce((sum, p) => sum + (p.stock * (parseFloat(p.prixAchat) || 0)), 0);
  const fragileProducts = filteredProducts.filter(p => p.fragile).length;

  // Group by category for Chart
  const productsByCategory = filteredProducts.reduce((acc, product) => {
    const cat = product.categorie || 'Autre';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  
  const categoryChartData = Object.entries(productsByCategory).map(([name, value]) => ({ name, value }));
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Group by type
  const productsByType = filteredProducts.reduce((acc, product) => {
    const type = product.type || 'Autre';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const fmt = (n) => parseFloat(n).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const num = (n) => parseInt(n).toLocaleString('fr-FR');

  if (loading) {
     return (
        <div className="min-h-screen bg-transparent flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#018790] border-t-transparent"></div>
        </div>
     );
  }

  return (
    <div className="w-full min-h-screen bg-transparent p-6 space-y-8 animate-[fade-in_0.6s_ease-out]">
      
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 bg-transparent p-6 rounded-3xl border border-slate-100/50">
        <div>
          <h1 className="text-2xl font-extrabold text-[#018790]">Tableau de Bord Produits</h1>
          <p className="text-slate-500">Vue d'ensemble et gestion du catalogue</p>
        </div>

        <div className="flex flex-wrap items-end gap-3 w-full xl:w-auto">
             {/* Text Search */}
             <div className="flex-1 min-w-[200px] xl:w-64 relative group">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#018790]" size={16} />
                 <input 
                     type="text" 
                     placeholder="Rechercher un produit..." 
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#018790] focus:ring-2 focus:ring-[#018790]/10 transition-all"
                 />
             </div>

             {/* Category Filter */}
             <div className="flex flex-col gap-1 min-w-[140px]">
                 <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Catégorie</label>
                 <select 
                     value={selectedCategory} 
                     onChange={(e) => setSelectedCategory(e.target.value)} 
                     className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#018790] w-full"
                 >
                     <option value="all">Toutes</option>
                     {categories.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
             </div>

             {/* Type Filter */}
             <div className="flex flex-col gap-1 min-w-[140px]">
                 <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Type</label>
                 <select 
                     value={selectedType} 
                     onChange={(e) => setSelectedType(e.target.value)} 
                     className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#018790] w-full"
                 >
                     <option value="all">Tous</option>
                     {types.map(t => <option key={t} value={t}>{t}</option>)}
                 </select>
             </div>

             <button 
                onClick={() => navigate('/admin/products')}
                className="px-5 py-2.5 bg-[#005461] hover:bg-[#016f76] text-white rounded-xl shadow-lg shadow-cyan-900/20 transition-all text-sm font-bold flex items-center gap-2 h-[42px]"
            >
                <Package size={16} />
                Gérer
            </button>
        </div>
      </div>

      {/* KPI Cards */}
      <Section title="Indicateurs Clés" icon={Activity}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
                label="Produits Filtrés" 
                value={num(totalProducts)} 
                icon={Package} 
                sub={allProducts.length !== totalProducts ? `Sur ${num(allProducts.length)} total` : "Total Catalogue"} 
            />
            <StatCard 
                label="Stock Faible" 
                value={num(lowStockProducts.length)} 
                icon={AlertTriangle} 
                sub="À réapprovisionner"
                color="text-amber-500"
            />
            <StatCard 
                label="Valeur Stock" 
                value={`${fmt(totalStockValue)} DH`} 
                icon={DollarSign} 
                sub="Coût d'achat total"
                color="text-[#018790]"
            />
            <StatCard 
                label="Fragiles" 
                value={num(fragileProducts)} 
                icon={ShoppingCart} 
                sub="Manutention spéciale"
                color="text-purple-500"
            />
        </div>
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Categories Chart */}
          <div className="lg:col-span-1">
             <Section title="Répartition" icon={Layers}>
                <SpotlightCard theme="light" className="h-[400px] flex flex-col">
                    <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 text-center">Par Catégorie</h3>
                    <div className="flex-1 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryChartData}
                                    cx="50%" cy="50%" 
                                    innerRadius={60} outerRadius={80}
                                    paddingAngle={5} dataKey="value"
                                >
                                    {categoryChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(val) => num(val)} contentStyle={{borderRadius: '8px'}} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '11px'}} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center">
                                <span className="block text-2xl font-black text-slate-700">{totalProducts}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Refs</span>
                            </div>
                        </div>
                    </div>
                </SpotlightCard>
             </Section>
          </div>

          {/* Types List */}
          <div className="lg:col-span-2">
             <Section title="Segmentation" icon={BarChart3}>
                 <SpotlightCard theme="light" className="h-[400px] overflow-y-auto custom-scrollbar">
                     <div className="space-y-4">
                         {Object.entries(productsByType).map(([type, count]) => {
                             const percentage = totalProducts > 0 ? ((count / totalProducts) * 100).toFixed(1) : 0;
                             return (
                                 <div key={type} className="group">
                                     <div className="flex justify-between items-center mb-1">
                                         <span className="font-bold text-slate-700 text-sm">{type || 'Non spécifié'}</span>
                                         <div className="flex items-center gap-2">
                                             <span className="text-xs font-bold text-slate-500">{count} refs</span>
                                             <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-bold">{percentage}%</span>
                                         </div>
                                     </div>
                                     <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                         <div 
                                             className="h-full bg-gradient-to-r from-cyan-500 to-[#018790] rounded-full transition-all duration-500"
                                             style={{ width: `${percentage}%` }}
                                         />
                                     </div>
                                 </div>
                             );
                         })}
                         {Object.keys(productsByType).length === 0 && (
                             <div className="text-center text-slate-400 py-10">Aucune donnée pour cette sélection.</div>
                         )}
                     </div>
                 </SpotlightCard>
             </Section>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Low Stock Alerts */}
          <Section title="Attention Requise" icon={AlertTriangle}>
             <SpotlightCard theme="light" className="h-[400px] flex flex-col">
                 <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                        Stock Faible
                    </h3>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">{lowStockProducts.length} alertes</span>
                 </div>
                 
                 <div className="overflow-y-auto custom-scrollbar flex-1 space-y-3 p-1">
                    {lowStockProducts.length > 0 ? (
                      lowStockProducts.map(product => (
                        <div key={product.id} className="flex items-center gap-3 p-3 bg-amber-50/50 hover:bg-amber-50 rounded-xl border border-transparent hover:border-amber-200 transition-all cursor-pointer group" onClick={() => navigate('/admin/products')}>
                          <div className="w-10 h-10 rounded-lg bg-white p-1 shadow-sm border border-amber-100">
                             <img src={product.image} alt="" className="w-full h-full object-cover rounded" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-slate-800 truncate group-hover:text-amber-700 transition-colors">{product.nom}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                                Stock Actuel: <span className="font-bold text-amber-600">{product.stock}</span>
                            </p>
                          </div>
                          <div className="text-right">
                             <span className="text-[10px] uppercase font-bold text-slate-400 block">Seuil</span>
                             <span className="text-xs font-black text-slate-600">{product.alerteStock}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <CheckCircle size={40} className="mb-2 text-emerald-200" />
                        <p className="text-sm font-medium">Tout est en ordre</p>
                      </div>
                    )}
                 </div>
             </SpotlightCard>
          </Section>

          {/* Recent Products */}
          <Section title="Nouveautés" icon={TrendingUp}>
             <SpotlightCard theme="light" className="h-[400px] flex flex-col">
                 <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-slate-800">Derniers Ajouts</h3>
                    <Link to="/admin/products" className="text-xs font-bold text-[#018790] hover:underline flex items-center gap-1">
                        Tout voir <Search size={10} />
                    </Link>
                 </div>
                 
                 <div className="overflow-y-auto custom-scrollbar flex-1 space-y-3 p-1">
                    {filteredProducts.slice(0, 10).map((product, idx) => (
                      <div key={product.id || idx} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 transition-all cursor-pointer group" onClick={() => navigate('/admin/products')}>
                          <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden">
                             {product.image ? (
                                 <img src={product.image} alt="" className="w-full h-full object-cover" />
                             ) : (
                                 <div className="w-full h-full flex items-center justify-center text-slate-400"><Package size={16}/></div>
                             )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-slate-800 truncate group-hover:text-[#018790] transition-colors">{product.nom}</p>
                            <p className="text-xs text-slate-500">{product.type} • {product.categorie}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-[#018790]">{product.prix1} <span className="text-[10px] text-slate-400 font-normal">MAD</span></p>
                          </div>
                      </div>
                    ))}
                    {filteredProducts.length === 0 && (
                        <div className="text-center text-slate-400 py-10">Aucun produit trouvé.</div>
                    )}
                 </div>
             </SpotlightCard>
          </Section>

      </div>
    </div>
  );
}

// --- Local Components (Consistent with others) ---
const Section = ({ title, icon: Icon, children }) => (
    <div className="space-y-4">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-[#018790]/10 rounded-lg text-[#018790]">
                {Icon ? <Icon size={24} /> : <Activity size={24} />}
            </div>
            <h2 className="text-xl font-bold text-slate-800">{title}</h2>
        </div>
        {children}
    </div>
);

const StatCard = ({ label, value, icon: Icon, sub, color }) => (
    <SpotlightCard theme="light" className="flex flex-col justify-between h-full"> 
        <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</span>
            {Icon && <Icon size={18} className="text-[#018790]" />}
        </div>
        <div>
            <div className={`text-2xl font-black ${color || 'text-slate-800'}`}>{value}</div>
            {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
        </div>
    </SpotlightCard>
);
