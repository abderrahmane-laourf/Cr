import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, Calendar, 
  Filter, Plus, Trash2, Settings, Target, BarChart2 
} from 'lucide-react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    ReferenceLine, AreaChart, Area, PieChart, Pie, Cell, Legend 
} from 'recharts';

const SoldPage = () => {
    // --- STATE ---
    const [transactions, setTransactions] = useState([]);
    const [settings, setSettings] = useState({ good: 10.40, bad: 10.60 });
    
    // Filters state
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [filterPlatform, setFilterPlatform] = useState('all');

    // Input state
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        platform: 'Facebook',
        mad: '',
        rate: ''
    });

    // Preview state
    const [previewUsd, setPreviewUsd] = useState(0);

    // Initial Load
    useEffect(() => {
        const savedTrans = localStorage.getItem('usd_trans_final');
        const savedSettings = localStorage.getItem('usd_settings_final');
        
        if (savedTrans) setTransactions(JSON.parse(savedTrans));
        if (savedSettings) setSettings(JSON.parse(savedSettings));

        // Default Filter Dates (Last 30 Days)
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);
        setDateTo(end.toISOString().split('T')[0]);
        setDateFrom(start.toISOString().split('T')[0]);
    }, []);

    // --- ACTIONS ---

    const handleSaveSettings = () => {
        if (settings.good >= settings.bad) {
            alert("Le taux 'Excellent' doit être inférieur au taux 'Élevé'");
            return;
        }
        localStorage.setItem('usd_settings_final', JSON.stringify(settings));
        alert("Paramètres sauvegardés !");
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            // Calc preview
            if (name === 'mad' || name === 'rate') {
                const mad = parseFloat(name === 'mad' ? value : prev.mad);
                const rate = parseFloat(name === 'rate' ? value : prev.rate);
                if (mad && rate) setPreviewUsd(mad / rate);
                else setPreviewUsd(0);
            }
            return updated;
        });
    };

    const handleAddTransaction = () => {
        if (!formData.mad || !formData.rate) return;
        
        const newTrans = {
            id: Date.now(),
            date: formData.date,
            platform: formData.platform,
            mad: parseFloat(formData.mad),
            rate: parseFloat(formData.rate),
            usd: parseFloat(formData.mad) / parseFloat(formData.rate)
        };

        const updated = [newTrans, ...transactions];
        setTransactions(updated);
        localStorage.setItem('usd_trans_final', JSON.stringify(updated));

        // Reset Form
        setFormData(prev => ({ ...prev, mad: '', rate: '' }));
        setPreviewUsd(0);
    };

    const handleDelete = (id) => {
        if (window.confirm("Supprimer cette opération ?")) {
            const updated = transactions.filter(t => t.id !== id);
            setTransactions(updated);
            localStorage.setItem('usd_trans_final', JSON.stringify(updated));
        }
    };

    const handleGenerateMock = () => {
        const mock = [
            {id:1, date:'2025-10-01', platform:'Facebook', mad:1050, rate:10.5, usd:100},
            {id:2, date:'2025-10-05', platform:'TikTok', mad:1590, rate:10.6, usd:150},
            {id:3, date:'2025-10-10', platform:'Google', mad:2080, rate:10.4, usd:200}
        ];
        setTransactions(mock);
        localStorage.setItem('usd_trans_final', JSON.stringify(mock));
    };

    // --- COMPUTED DATA ---

    // Filter Logic
    const filteredTransactions = transactions.filter(t => {
        const tDate = t.date;
        const matchDate = (!dateFrom || tDate >= dateFrom) && (!dateTo || tDate <= dateTo);
        const matchPlat = filterPlatform === 'all' || t.platform === filterPlatform;
        return matchDate && matchPlat;
    });

    // KPIs
    const totalMad = filteredTransactions.reduce((acc, t) => acc + t.mad, 0);
    const totalUsd = filteredTransactions.reduce((acc, t) => acc + t.usd, 0);
    const avgRate = totalUsd > 0 ? (totalMad / totalUsd) : 0;
    const rates = filteredTransactions.map(t => t.rate);
    const bestRate = rates.length ? Math.min(...rates) : 0;
    const worstRate = rates.length ? Math.max(...rates) : 0;
    const count = filteredTransactions.length;

    // Chart Data (Evolution)
    const chartData = [...filteredTransactions]
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map(t => ({
            date: t.date.slice(5), // mm-dd
            rate: t.rate,
            good: settings.good,
            bad: settings.bad
        }));

    // Pie Data (Platform distribution)
    const platformStats = filteredTransactions.reduce((acc, t) => {
        acc[t.platform] = (acc[t.platform] || 0) + t.usd;
        return acc;
    }, {});
    
    const pieData = Object.keys(platformStats).map(key => ({
        name: key,
        value: platformStats[key]
    }));

    const COLORS = ['#1877F2', '#000000', '#EA4335', '#FACC15', '#64748B'];

    // Helper for badges
    const getRateBadge = (rate) => {
        if (rate <= settings.good) return { label: 'Excellent', color: 'bg-emerald-100 text-emerald-700' };
        if (rate >= settings.bad) return { label: 'Élevé', color: 'bg-red-100 text-red-700' };
        return { label: 'Normal', color: 'bg-slate-100 text-slate-600' };
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-sans text-slate-800">
            
            {/* HERADER */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                   <h1 className="text-3xl font-extrabold text-[#025e6d] tracking-tight flex items-center gap-3">
                      <DollarSign className="text-emerald-600" size={32} />
                      Gestionnaire Dollar
                   </h1>
                   <p className="text-slate-600 font-medium mt-1">Suivi des taux de change et dépenses publicitaires</p>
                </div>
                <button onClick={handleGenerateMock} className="text-sm font-bold text-slate-400 hover:text-emerald-600 transition-colors">
                    🔄 Charger Données Démo
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                
                {/* 1. INPUT CARD */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 p-6 border-t-4 border-t-emerald-500">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Plus className="bg-emerald-100 text-emerald-600 rounded-lg p-1" size={24}/>
                        Nouvelle Transaction
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <div className="group">
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Date</label>
                            <input 
                                type="date" 
                                name="date"
                                value={formData.date}
                                onChange={handleInputChange}
                                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>
                        <div className="group">
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Plateforme</label>
                            <select 
                                name="platform"
                                value={formData.platform}
                                onChange={handleInputChange}
                                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            >
                                <option value="Facebook">Facebook</option>
                                <option value="TikTok">TikTok</option>
                                <option value="Google">Google</option>
                                <option value="Snapchat">Snapchat</option>
                                <option value="Other">Autre</option>
                            </select>
                        </div>
                        <div className="group">
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Montant (MAD)</label>
                            <input 
                                type="number" 
                                name="mad"
                                placeholder="0.00"
                                value={formData.mad}
                                onChange={handleInputChange}
                                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>
                         <div className="group">
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Taux Change</label>
                            <input 
                                type="number" 
                                name="rate"
                                placeholder="Ex: 10.50"
                                value={formData.rate}
                                onChange={handleInputChange}
                                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-xs font-bold text-slate-400 uppercase">Conversion (Est.)</p>
                                <p className="text-xl font-black text-emerald-600">{previewUsd.toFixed(2)} $</p>
                            </div>
                            {formData.rate && (
                                <span className={`text-xs font-bold px-3 py-1 rounded-lg ${getRateBadge(parseFloat(formData.rate)).color}`}>
                                    {getRateBadge(parseFloat(formData.rate)).label}
                                </span>
                            )}
                        </div>
                        <button 
                            onClick={handleAddTransaction}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                        >
                            Ajouter
                        </button>
                    </div>
                </div>

                {/* 2. SETTINGS CARD */}
                <div className="bg-amber-50 rounded-3xl shadow-sm border border-amber-200 p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Settings size={100} className="text-amber-900"/>
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
                            <Target size={20}/> Objectifs Taux
                        </h2>
                        
                        <div className="space-y-4">
                            <div className="flex items-center justify-between bg-white/60 p-3 rounded-xl backdrop-blur-sm">
                                <span className="text-sm font-bold text-emerald-700">Excellent (&lt;)</span>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    value={settings.good}
                                    onChange={(e) => setSettings({...settings, good: parseFloat(e.target.value)})}
                                    className="w-20 text-center font-bold bg-transparent border-b-2 border-emerald-300 focus:outline-none text-emerald-800"
                                />
                            </div>
                            <div className="flex items-center justify-between bg-white/60 p-3 rounded-xl backdrop-blur-sm">
                                <span className="text-sm font-bold text-red-700">Élevé (&gt;)</span>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    value={settings.bad}
                                    onChange={(e) => setSettings({...settings, bad: parseFloat(e.target.value)})}
                                    className="w-20 text-center font-bold bg-transparent border-b-2 border-red-300 focus:outline-none text-red-800"
                                />
                            </div>
                        </div>

                        <button 
                            onClick={handleSaveSettings}
                            className="mt-6 w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-colors shadow-md"
                        >
                            Mettre à jour
                        </button>
                    </div>
                </div>
            </div>

            {/* FILTERS BAR */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center mb-8">
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                    <Filter size={16} className="text-slate-400"/>
                    <span className="text-xs font-bold text-slate-500 uppercase">Filtres</span>
                </div>
                <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block"></div>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="bg-transparent text-sm font-bold text-slate-600 outline-none hover:bg-slate-50 rounded-lg p-1 transition-colors"/>
                <span className="text-slate-300 font-bold">-</span>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="bg-transparent text-sm font-bold text-slate-600 outline-none hover:bg-slate-50 rounded-lg p-1 transition-colors"/>
                
                <select 
                    value={filterPlatform} 
                    onChange={e => setFilterPlatform(e.target.value)}
                    className="ml-auto bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl px-4 py-2 focus:outline-none"
                >
                    <option value="all">Toutes les plateformes</option>
                    <option value="Facebook">Facebook</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Google">Google</option>
                    <option value="Snapchat">Snapchat</option>
                    <option value="Other">Autre</option>
                </select>
            </div>

            {/* DASHBOARD KPIS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <KpiCard title="Total Dépensé (MAD)" value={totalMad} unit="MAD" color="text-slate-800" bg="bg-white" border="border-slate-200" icon={WalletIcon} />
                <KpiCard title="Total Converti (USD)" value={totalUsd} unit="$" color="text-emerald-700" bg="bg-emerald-50" border="border-emerald-100" icon={DollarIcon} />
                <KpiCard title="Taux Moyen" value={avgRate.toFixed(3)} unit="MAD/$" color="text-blue-700" bg="bg-blue-50" border="border-blue-100" icon={TrendingIcon} />
                <div className="grid grid-rows-2 gap-4">
                     <div className="bg-emerald-100 rounded-2xl p-4 flex items-center justify-between border border-emerald-200">
                        <span className="text-xs font-bold text-emerald-800 uppercase">Meilleur Taux</span>
                        <span className="text-xl font-black text-emerald-900">{bestRate.toFixed(3)}</span>
                     </div>
                     <div className="bg-red-50 rounded-2xl p-4 flex items-center justify-between border border-red-100">
                        <span className="text-xs font-bold text-red-800 uppercase">Pire Taux</span>
                        <span className="text-xl font-black text-red-900">{worstRate.toFixed(3)}</span>
                     </div>
                </div>
            </div>

            {/* CHARTS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 p-6 min-h-[300px]">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                        < TrendingUp size={20} className="text-blue-500"/>
                        Évolution du Taux de Change
                    </h3>
                    <div className="h-64 w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                                <XAxis dataKey="date" tick={{fontSize:10}} axisLine={false} tickLine={false}/>
                                <YAxis domain={['auto', 'auto']} tick={{fontSize:10}} axisLine={false} tickLine={false}/>
                                <Tooltip contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 10px 15px -3px rgba(0,0,0,0.1)'}}/>
                                <Area type="monotone" dataKey="rate" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRate)" strokeWidth={3} />
                                <ReferenceLine y={settings.good} stroke="#10b981" strokeDasharray="3 3" label={{ position: 'right', value: 'Excellent', fill: '#10b981', fontSize: 10 }} />
                                <ReferenceLine y={settings.bad} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'right', value: 'Élevé', fill: '#ef4444', fontSize: 10 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 min-h-[300px]">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <BarChart2 size={20} className="text-purple-500"/>
                        Répartition par Plateforme
                    </h3>
                    <div className="h-64 w-full flex justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 font-bold text-slate-800">
                    Historique des Transactions
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-extrabold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Plateforme</th>
                                <th className="px-6 py-4">Montant (MAD)</th>
                                <th className="px-6 py-4">Taux</th>
                                <th className="px-6 py-4 text-emerald-600">Total (USD)</th>
                                <th className="px-6 py-4 text-center">Évaluation</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredTransactions.length === 0 ? (
                                <tr><td colSpan="7" className="p-8 text-center text-slate-400 italic">Aucune transaction trouvée.</td></tr>
                            ) : (
                                filteredTransactions.map(t => {
                                    const badge = getRateBadge(t.rate);
                                    let platColor = "bg-slate-100 text-slate-600";
                                    if(t.platform === 'Facebook') platColor = "bg-blue-100 text-blue-700";
                                    if(t.platform === 'TikTok') platColor = "bg-black text-white";
                                    if(t.platform === 'Google') platColor = "bg-red-100 text-red-700";
                                    if(t.platform === 'Snapchat') platColor = "bg-yellow-100 text-yellow-800";

                                    return (
                                        <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-slate-700 text-sm whitespace-nowrap">{t.date}</td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs font-bold px-3 py-1 rounded-lg ${platColor}`}>{t.platform}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-600">{t.mad.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-sm font-mono font-bold text-slate-800">{t.rate.toFixed(3)}</td>
                                            <td className="px-6 py-4 text-base font-black text-emerald-600">{t.usd.toFixed(2)} $</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${badge.color}`}>{badge.label}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => handleDelete(t.id)} className="p-2 bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors">
                                                    <Trash2 size={16}/>
                                                </button>
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
    );
};

// Icons (Simple SVG Wrappers for KPI usage)
const WalletIcon = () => <div className="p-3 bg-slate-100 text-slate-600 rounded-xl"><DollarSign size={24}/></div>;
const DollarIcon = () => <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl"><DollarSign size={24}/></div>;
const TrendingIcon = () => <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><TrendingUp size={24}/></div>;

const KpiCard = ({ title, value, unit, color, bg, border, icon: Icon }) => (
    <div className={`p-6 rounded-3xl shadow-sm border ${border} ${bg} flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden`}>
        <div className="flex justify-between items-start mb-4 relative z-10">
            <Icon />
            <span className={`text-xs font-bold uppercase tracking-wider opacity-60 ${color}`}>{unit}</span>
        </div>
        <div className="relative z-10">
            <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1 opacity-80">{title}</p>
            <h3 className={`text-3xl font-black ${color}`}>{typeof value === 'number' ? value.toLocaleString() : value}</h3>
        </div>
    </div>
);

export default SoldPage;
