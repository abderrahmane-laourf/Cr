import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, DollarSign, Package, Users, Activity, 
  TrendingUp, TrendingDown, Calendar, Search, CreditCard, 
  RotateCw, Filter, ArrowUpRight, ArrowDownRight, Briefcase, Megaphone
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { clientAPI, adsAPI, productAPI, employeeAPI, paymentAPI } from '../../services/api';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function GeneralDashboard() {
  const [loading, setLoading] = useState(true);
  const [colis, setColis] = useState([]);
  const [ads, setAds] = useState([]);
  const [products, setProducts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [payments, setPayments] = useState([]);
  const [currencyExchange, setCurrencyExchange] = useState([]);
  
  // Filters
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [phoneSearch, setPhoneSearch] = useState('');

  // Currency Form
  const [newCurrency, setNewCurrency] = useState({ usd: '', rate: '', notes: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load Colis (LocalStorage primarily)
      const savedColis = localStorage.getItem('colis');
      let colisData = [];
      if (savedColis) {
        colisData = JSON.parse(savedColis);
      } else {
        colisData = await clientAPI.getAll().catch(() => []);
      }
      setColis(colisData);

      // Load all data from API
      const [adsData, productsData, employeesData, paymentsData] = await Promise.all([
        adsAPI.getAll().catch(() => []),
        productAPI.getAll().catch(() => []),
        employeeAPI.getAll().catch(() => []),
        paymentAPI.getAll().catch(() => [])
      ]);
      
      setAds(adsData);
      setProducts(productsData);
      setEmployees(employeesData);
      setPayments(paymentsData);

      // Load Currency Exchange
      const savedCurrency = localStorage.getItem('currency_exchange');
      if (savedCurrency) setCurrencyExchange(JSON.parse(savedCurrency));

    } catch (error) {
      console.error("Error loading data", error);
    } finally {
      setLoading(false);
    }
  };

  const addCurrencyRecord = () => {
    if(!newCurrency.usd || !newCurrency.rate) return;
    const newItem = {
        id: Date.now(),
        date: new Date().toISOString(),
        usd: parseFloat(newCurrency.usd),
        rate: parseFloat(newCurrency.rate),
        notes: newCurrency.notes,
        totalDh: parseFloat(newCurrency.usd) * parseFloat(newCurrency.rate)
    };
    const updated = [newItem, ...currencyExchange];
    setCurrencyExchange(updated);
    localStorage.setItem('currency_exchange', JSON.stringify(updated));
    setNewCurrency({ usd: '', rate: '', notes: '' });
  };

  const metrics = useMemo(() => {
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    end.setHours(23, 59, 59, 999);

    // Filter Colis
    const filteredColis = colis.filter(c => {
        const d = new Date(c.dateCreated || c.createdAt || c.date);
        if(d < start || d > end) return false;
        if(selectedEmployee !== 'all' && c.employee !== selectedEmployee) return false;
        if(selectedProduct !== 'all' && c.productId !== selectedProduct) return false;
        if(phoneSearch && !c.tel?.includes(phoneSearch)) return false;
        return true;
    });

    // Filter Ads
    const filteredAds = ads.filter(a => {
        const d = new Date(a.date);
        if(d < start || d > end) return false;
        if(selectedProduct !== 'all' && a.product !== selectedProduct) return false; 
        return true;
    });

    // --- Marketing ---
    const totalSpend = filteredAds.reduce((sum, a) => sum + (parseFloat(a.amount) || parseFloat(a.spend) || parseFloat(a.spent) || 0), 0);
    const confirmedAllTime = filteredColis.filter(c => ['Confirmé', 'Packaging', 'Out for Delivery', 'Livré', 'Retourné', 'Returned', 'Expédié'].includes(c.stage)).length;
    
    const deliveredCount = filteredColis.filter(c => c.stage === 'Livré').length;
    const totalOrders = filteredColis.length; 

    // CPA / CPL
    const costPerConfirm = confirmedAllTime > 0 ? totalSpend / confirmedAllTime : 0;
    const costPerDelivered = deliveredCount > 0 ? totalSpend / deliveredCount : 0;

    // --- Confirmation ---
    const confirmRate = totalOrders > 0 ? (confirmedAllTime / totalOrders) * 100 : 0;
    const deliveryRate = confirmedAllTime > 0 ? (deliveredCount / confirmedAllTime) * 100 : 0;

    // --- Stock & Revenue ---
    const restStock = products.reduce((sum, p) => sum + (parseInt(p.stock) || parseInt(p.stockTotal) || 0), 0);
    
    const revenue = filteredColis
        .filter(c => c.stage === 'Livré')
        .reduce((sum, c) => sum + (parseFloat(c.prix) || parseFloat(c.price) || 0), 0);
    
    const aov = deliveredCount > 0 ? revenue / deliveredCount : 0;

    // --- Expenses Breakdown ---
    const totalSalaries = payments.reduce((sum, p) => sum + (parseFloat(p.net) || 0), 0);
    const shippingCost = deliveredCount * 25; // Estimate 25 DH per delivery
    
    const expensesData = [
      { name: 'Publicité', value: totalSpend, color: '#EF4444' },
      { name: 'Salaires', value: totalSalaries, color: '#3B82F6' },
      { name: 'Livraison', value: shippingCost, color: '#F59E0B' }
    ];

    // --- Currency ---
    const totalCurrencyDh = currencyExchange.reduce((sum, item) => sum + item.totalDh, 0);

    // --- Leaderboard ---
    const prodMap = {};
    filteredColis.forEach(c => {
        const pName = c.productName || c.produitName || 'Inconnu';
        prodMap[pName] = (prodMap[pName] || 0) + 1;
    });
    const topProducts = Object.entries(prodMap)
        .sort((a,b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

    // Top Employee
    const empMap = {};
    filteredColis.forEach(c => {
        const eName = c.employee || 'Non assigné';
        if(!empMap[eName]) empMap[eName] = { total: 0, confirmed: 0, delivered: 0 };
        empMap[eName].total++;
        if(['Confirmé', 'Packaging', 'Out for Delivery', 'Livré', 'Retourné'].includes(c.stage)) empMap[eName].confirmed++;
        if(c.stage === 'Livré') empMap[eName].delivered++;
    });
    const topEmployees = Object.entries(empMap)
        .map(([name, stats]) => ({
            name,
            total: stats.total,
            confRate: stats.total > 0 ? (stats.confirmed / stats.total) * 100 : 0,
            delivRate: stats.confirmed > 0 ? (stats.delivered / stats.confirmed) * 100 : 0
        }))
        .sort((a,b) => b.confRate - a.confRate)
        .slice(0, 5);

    // --- Sales Trend (Last 7 days) ---
    const salesTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const daySales = colis.filter(c => {
        const cDate = new Date(c.dateCreated || c.createdAt || c.date);
        return cDate.toISOString().split('T')[0] === dateStr && c.stage === 'Livré';
      }).reduce((sum, c) => sum + (parseFloat(c.prix) || parseFloat(c.price) || 0), 0);
      
      salesTrend.push({
        date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        ventes: daySales
      });
    }

    return {
        totalSpend,
        confirmedAllTime,
        deliveredCount,
        costPerConfirm,
        costPerDelivered,
        confirmRate,
        deliveryRate,
        restStock,
        revenue,
        aov,
        totalCurrencyDh,
        totalSalaries,
        expensesData,
        topProducts,
        topEmployees,
        salesTrend
    };
  }, [colis, ads, products, payments, currencyExchange, dateRange, selectedProduct, selectedEmployee, phoneSearch]);

  const uniqueEmployees = [...new Set(colis.map(c => c.employee).filter(Boolean))];

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
       {/* 1. FILTER SECTION (Yellow/Gold Bar) */}
       <div className="bg-gradient-to-r from-amber-100 to-amber-50 border-b border-amber-200 p-4 rounded-2xl flex flex-wrap gap-4 items-center shadow-sm">
          <div className="flex items-center gap-2 text-amber-800 font-bold mr-4">
              <Filter size={20} />
              <span>Filtres</span>
          </div>
          
          <div className="bg-white p-1 rounded-lg border border-amber-200 flex items-center shadow-sm">
              <input type="date" value={dateRange.startDate} onChange={e => setDateRange({...dateRange, startDate: e.target.value})} className="bg-transparent px-2 py-1 text-sm font-bold text-slate-700 outline-none" />
              <span className="text-slate-400 font-bold px-1">-</span>
              <input type="date" value={dateRange.endDate} onChange={e => setDateRange({...dateRange, endDate: e.target.value})} className="bg-transparent px-2 py-1 text-sm font-bold text-slate-700 outline-none" />
          </div>

          <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} className="px-4 py-2 rounded-lg border border-amber-200 bg-white text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-300">
              <option value="all">Tous les produits</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
          </select>

          <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)} className="px-4 py-2 rounded-lg border border-amber-200 bg-white text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-300">
              <option value="all">Tous les employés</option>
              {uniqueEmployees.map(e => <option key={e} value={e}>{e}</option>)}
          </select>

          <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Recherche Tel..." 
                value={phoneSearch}
                onChange={e => setPhoneSearch(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-lg border border-amber-200 bg-white text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-300 w-48"
              />
          </div>
          
          <button onClick={loadData} className="ml-auto p-2 bg-amber-200 hover:bg-amber-300 rounded-lg text-amber-900 transition-colors">
            <RotateCw size={20} />
          </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {/* 2. MARKETING CARD (Blue) */}
           <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
               <div className="relative">
                   <div className="flex items-center gap-2 mb-4">
                       <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Megaphone size={20} /></div>
                       <h3 className="font-bold text-slate-700">Marketing</h3>
                   </div>
                   <div className="space-y-4">
                       <div>
                           <p className="text-xs text-slate-400 font-bold uppercase">Total Spend</p>
                           <p className="text-2xl font-black text-slate-800">{metrics.totalSpend.toLocaleString()} DH</p>
                       </div>
                       <div className="grid grid-cols-2 gap-2">
                           <div className="bg-blue-50 p-2 rounded-lg">
                               <p className="text-[10px] text-blue-500 font-bold">Cost/Confirmé</p>
                               <p className="text-lg font-bold text-blue-700">{metrics.costPerConfirm.toFixed(2)}</p>
                           </div>
                           <div className="bg-indigo-50 p-2 rounded-lg">
                               <p className="text-[10px] text-indigo-500 font-bold">Cost/Livré</p>
                               <p className="text-lg font-bold text-indigo-700">{metrics.costPerDelivered.toFixed(2)}</p>
                           </div>
                       </div>
                   </div>
               </div>
           </div>

           {/* 3. CONFIRMATION CARD (Purple) */}
           <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
               <div className="relative">
                   <div className="flex items-center gap-2 mb-4">
                       <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Users size={20} /></div>
                       <h3 className="font-bold text-slate-700">Call Center</h3>
                   </div>
                   <div className="space-y-4">
                       <div>
                           <p className="text-xs text-slate-400 font-bold uppercase">Total Confirmé</p>
                           <p className="text-2xl font-black text-slate-800">{metrics.confirmedAllTime}</p>
                       </div>
                       <div className="grid grid-cols-2 gap-2">
                           <div className="bg-purple-50 p-2 rounded-lg">
                               <p className="text-[10px] text-purple-500 font-bold">% Confirmation</p>
                               <p className="text-lg font-bold text-purple-700">{metrics.confirmRate.toFixed(1)}%</p>
                           </div>
                           <div className="bg-pink-50 p-2 rounded-lg">
                               <p className="text-[10px] text-pink-500 font-bold">% Livraison</p>
                               <p className="text-lg font-bold text-pink-700">{metrics.deliveryRate.toFixed(1)}%</p>
                           </div>
                       </div>
                   </div>
               </div>
           </div>

           {/* 4. STOCK & LOGISTICS (Emerald) */}
           <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
               <div className="relative">
                   <div className="flex items-center gap-2 mb-4">
                       <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Package size={20} /></div>
                       <h3 className="font-bold text-slate-700">Stock & Livraison</h3>
                   </div>
                   <div className="space-y-3">
                       <div className="flex justify-between items-center">
                           <span className="text-xs font-bold text-slate-500">Rest Stock</span>
                           <span className="text-lg font-bold text-slate-800">{metrics.restStock} pcs</span>
                       </div>
                       <div className="h-px bg-slate-100"></div>
                       <div>
                           <p className="text-xs text-slate-400 font-bold uppercase">Chiffre d'Affaires (Livré)</p>
                           <p className="text-2xl font-black text-emerald-600">{metrics.revenue.toLocaleString()} DH</p>
                       </div>
                       <div className="text-right">
                           <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold">
                               AOV: {metrics.aov.toFixed(0)} DH
                           </span>
                       </div>
                   </div>
               </div>
           </div>

           {/* 5. CURRENCY TOTAL (Orange) */}
           <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
               <div className="relative">
                   <div className="flex items-center gap-2 mb-4">
                       <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><DollarSign size={20} /></div>
                       <h3 className="font-bold text-slate-700">Achat Solde</h3>
                   </div>
                   <div className="flex flex-col h-full justify-between">
                       <div>
                           <p className="text-xs text-slate-400 font-bold uppercase">Total Acheté (DH)</p>
                           <p className="text-2xl font-black text-orange-600">{metrics.totalCurrencyDh.toLocaleString()} DH</p>
                       </div>
                       <p className="text-xs text-slate-400 mt-4 leading-relaxed">
                           Suivi des achats de devise USD pour le financement des publicités.
                       </p>
                   </div>
               </div>
           </div>
       </div>

       {/* 6. LEADERBOARDS & TABLES */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Products */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <TrendingUp size={18} className="text-slate-400"/> Top Produits
                </h3>
                <div className="space-y-3">
                    {metrics.topProducts.map((p, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                                    ${i === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-200 text-slate-600'}`}>
                                    {i+1}
                                </div>
                                <span className="font-semibold text-slate-700 text-sm whitespace-nowrap overflow-hidden text-ellipsis w-32">{p.name}</span>
                            </div>
                            <span className="font-bold text-slate-800">{p.count} ventes</span>
                        </div>
                    ))}
                    {metrics.topProducts.length === 0 && <p className="text-center text-slate-400 py-4">Aucune donnée</p>}
                </div>
            </div>

            {/* Top Employees */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 lg:col-span-2">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Users size={18} className="text-slate-400"/> Performance Équipe
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-50/50">
                            <tr>
                                <th className="px-4 py-3 rounded-l-lg">Employé</th>
                                <th className="px-4 py-3 text-center">Total</th>
                                <th className="px-4 py-3 text-center">Taux Conf.</th>
                                <th className="px-4 py-3 text-center rounded-r-lg">Taux Livr.</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {metrics.topEmployees.map((e, i) => (
                                <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3 font-bold text-slate-700">{e.name}</td>
                                    <td className="px-4 py-3 text-center">{e.total}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                            e.confRate >= 50 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {e.confRate.toFixed(1)}%
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center font-bold text-slate-600">{e.delivRate.toFixed(1)}%</td>
                                </tr>
                            ))}
                             {metrics.topEmployees.length === 0 && (
                                <tr><td colSpan="4" className="text-center py-6 text-slate-400">Aucune donnée</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
       </div>

       {/* 6. CHARTS SECTION */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart - Expenses Breakdown */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Activity size={18} className="text-slate-400"/>
                    Répartition des Dépenses
                </h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={metrics.expensesData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {metrics.expensesData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value.toLocaleString()} DH`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    {metrics.expensesData.map((item, i) => (
                        <div key={i} className="p-2 bg-slate-50 rounded-lg">
                            <p className="text-xs text-slate-500 font-semibold">{item.name}</p>
                            <p className="text-sm font-bold text-slate-800">{item.value.toLocaleString()} DH</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Line Chart - Sales Trend */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <TrendingUp size={18} className="text-slate-400"/>
                    Évolution des Ventes (7 derniers jours)
                </h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={metrics.salesTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                            <XAxis 
                                dataKey="date" 
                                tick={{ fontSize: 12 }}
                                stroke="#94A3B8"
                            />
                            <YAxis 
                                tick={{ fontSize: 12 }}
                                stroke="#94A3B8"
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    borderRadius: '12px', 
                                    border: 'none', 
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                                }}
                                formatter={(value) => [`${value.toLocaleString()} DH`, 'Ventes']}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="ventes" 
                                stroke="#10B981" 
                                strokeWidth={3}
                                dot={{ fill: '#10B981', r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
       </div>

       {/* 7. ACHAT SOLDE TABLE */}
       <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        <DollarSign size={20} className="text-orange-500"/>
                        Historique Achat Solde (USD)
                    </h3>
                    <p className="text-slate-400 text-sm">Gestion des recharges pour ADS</p>
                </div>
                
                {/* Add Form */}
                <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <input 
                        type="number" placeholder="USD Amount" 
                        value={newCurrency.usd} onChange={e => setNewCurrency({...newCurrency, usd: e.target.value})}
                        className="w-24 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-orange-400"
                    />
                    <input 
                        type="number" placeholder="Taux (ex: 9.6)" 
                        value={newCurrency.rate} onChange={e => setNewCurrency({...newCurrency, rate: e.target.value})}
                         className="w-24 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-orange-400"
                    />
                    <input 
                        type="text" placeholder="Note (ex: Tmn zwin)" 
                         value={newCurrency.notes} onChange={e => setNewCurrency({...newCurrency, notes: e.target.value})}
                         className="w-32 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-orange-400"
                    />
                    <button onClick={addCurrencyRecord} className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg transition-colors">
                        <TrendingUp size={18} />
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-orange-50 text-orange-800 text-xs uppercase font-bold">
                        <tr>
                            <th className="px-6 py-4 rounded-l-xl">Date</th>
                            <th className="px-6 py-4">Montant USD</th>
                            <th className="px-6 py-4">Taux (DH)</th>
                            <th className="px-6 py-4">Total DH</th>
                            <th className="px-6 py-4 rounded-r-xl">Notes</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {currencyExchange.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 text-slate-500">{new Date(item.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 font-bold text-slate-700">{item.usd} $</td>
                                <td className="px-6 py-4 font-medium text-slate-600">{item.rate}</td>
                                <td className="px-6 py-4 font-bold text-orange-600">{item.totalDh.toFixed(2)} DH</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                        item.notes?.includes('zwin') ? 'bg-emerald-100 text-emerald-700' :
                                        item.notes?.includes('khayb') ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                        {item.notes || '-'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                         {currencyExchange.length === 0 && (
                            <tr><td colSpan="5" className="text-center py-8 text-slate-400 italic">Aucun historique d'achat</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
       </div>
    </div>
  );
}
