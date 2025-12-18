import React, { useState, useEffect } from 'react';
import { 
  Package, AlertTriangle, Truck, TrendingUp, TrendingDown,
  Warehouse, Box, DollarSign, Activity, AlertCircle, RefreshCw, Search
} from 'lucide-react';
import { 
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import Swal from 'sweetalert2';
import SpotlightCard from '../../util/SpotlightCard';

const InventoryDashboard = () => {
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dashboardData, setDashboardData] = useState(null);

  // --- LOGIC: Data Generation & Calculation ---

  const handleRefresh = () => {
    Swal.fire({
      title: 'Régénérer les données ?',
      text: 'Cela va réinitialiser toutes les données du dashboard',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1e3a8a',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Oui, régénérer',
      cancelButtonText: 'Annuler',
      background: '#fff', 
      borderRadius: '1rem'
    }).then((result) => {
      if (result.isConfirmed) {
        generateData();
        Swal.fire({
          title: 'Données régénérées !',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          confirmButtonColor: '#1e3a8a'
        });
      }
    });
  };

  const generateData = () => {
    const warehouses = [
      { id: 1, name: "Entrepôt Principal", capacity: 5000 },
      { id: 2, name: "Centre-Ville", capacity: 1000 },
      { id: 3, name: "Magasin", capacity: 500 }
    ];

    const products = [
      { id: "p1", name: "iPhone 15 Pro Max", price: 13500, dist: [5, 2, 1], alert: 2, catalogue: "Électronique" },
      { id: "p2", name: "Chargeur Anker 20W", price: 150, dist: [200, 50, 20], alert: 20, catalogue: "Accessoires" },
      { id: "p3", name: "Machine à Café Pro", price: 25000, dist: [10, 0, 0], alert: 2, catalogue: "Électroménager" },
      { id: "p4", name: "Sac Laptop Vintage", price: 200, dist: [40, 0, 0], alert: 5, catalogue: "Accessoires" },
      { id: "p5", name: "Protection Écran", price: 15, dist: [300, 100, 50], alert: 50, catalogue: "Accessoires" },
      { id: "p6", name: "Montre Connectée", price: 100, dist: [100, 50, 0], alert: 30, catalogue: "Électronique" },
      { id: "p7", name: "Écouteurs Bluetooth", price: 300, dist: [0, 0, 0], alert: 5, catalogue: "Électronique" }
    ];

    const orders = [];
    const today = new Date();
    
    for(let i = 0; i < 10; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      orders.push({ pid: "p1", qty: 1, status: "delivered", date: dateStr });
      orders.push({ pid: "p2", qty: Math.floor(Math.random() * 5) + 1, status: "delivered", date: dateStr });
      orders.push({ pid: "p6", qty: 2, status: "delivered", date: dateStr });
      if(i % 2 === 0) orders.push({ pid: "p6", qty: 1, status: "returned", date: dateStr });
      if(i === 0) orders.push({ pid: "p5", qty: 5, status: "shipped", date: dateStr });
    }

    const losses = [{ pid: "p5", qty: 20, date: today.toISOString().split('T')[0] }];

    localStorage.setItem('inv_warehouses', JSON.stringify(warehouses));
    localStorage.setItem('inv_products', JSON.stringify(products));
    localStorage.setItem('inv_orders', JSON.stringify(orders));
    localStorage.setItem('inv_losses', JSON.stringify(losses));
    
    calculateDashboard();
  };

  const calculateDashboard = () => {
    const warehouses = JSON.parse(localStorage.getItem('inv_warehouses') || '[]');
    const products = JSON.parse(localStorage.getItem('inv_products') || '[]');
    const orders = JSON.parse(localStorage.getItem('inv_orders') || '[]');
    const losses = JSON.parse(localStorage.getItem('inv_losses') || '[]');

    if (products.length === 0) {
      generateData();
      return;
    }

    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    toDate.setHours(23, 59, 59);

    let kpi = {
      totalQty: 0, totalValue: 0, alerts: 0, damaged: 0,
      transitValue: 0, returnValue: 0, damagedValue: 0, inactiveValue: 0, transitCount: 0
    };

    let warehouseData = {};
    let productStats = [];
    let dailySales = {};
    let matrixData = [];
    let catalogueStats = {};

    warehouses.forEach(w => {
      warehouseData[w.id] = { name: w.name, capacity: w.capacity, items: [], total: 0 };
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    products.forEach(p => {
      const totalStock = p.dist.reduce((a, b) => a + b, 0);
      
      p.dist.forEach((qty, idx) => {
        if (qty > 0) {
          const whId = idx + 1;
          if (warehouseData[whId]) {
            warehouseData[whId].items.push({ name: p.name, qty });
            warehouseData[whId].total += qty;
          }
        }
      });

      const stockValue = totalStock * p.price;
      kpi.totalQty += totalStock;
      kpi.totalValue += stockValue;
      if (totalStock <= p.alert) kpi.alerts++;

      const filteredOrders = orders.filter(o => {
        const orderDate = new Date(o.date);
        return o.pid === p.id && orderDate >= fromDate && orderDate <= toDate;
      });

      const productLosses = losses.filter(l => l.pid === p.id);
      let sold = 0, returned = 0, transit = 0, damaged = 0;

      filteredOrders.forEach(o => {
        if (o.status === "delivered") {
          sold += o.qty;
          if (!dailySales[o.date]) dailySales[o.date] = 0;
          dailySales[o.date] += o.qty;
        }
        if (o.status === "returned") returned += o.qty;
        if (o.status === "shipped") transit += o.qty;
      });

      productLosses.forEach(l => damaged += l.qty);
      kpi.transitValue += transit * p.price;
      kpi.returnValue += returned * p.price;
      kpi.damagedValue += damaged * p.price;
      kpi.damaged += damaged;
      kpi.transitCount += transit;

      const allSales = orders.filter(o => o.pid === p.id && o.status === "delivered");
      const hasRecentSale = allSales.some(o => new Date(o.date) > thirtyDaysAgo);
      const isDead = !hasRecentSale && totalStock > 0;
      if (isDead) kpi.inactiveValue += stockValue;

      productStats.push({ name: p.name, price: p.price, stock: totalStock, value: stockValue, sold, returned, isDead });
      matrixData.push({ name: p.name, stock: totalStock, sold, returned, transit });

      const cat = p.catalogue || 'Autres';
      if (!catalogueStats[cat]) catalogueStats[cat] = { name: cat, count: 0, stock: 0, value: 0 };
      catalogueStats[cat].count += 1;
      catalogueStats[cat].stock += totalStock;
      catalogueStats[cat].value += stockValue;
    });

    const salesChartData = Object.keys(dailySales)
      .sort()
      .map(date => ({
        date: new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        ventes: dailySales[date]
      }));

    const activeValue = kpi.totalValue - kpi.inactiveValue;
    const stockDistribution = [
      { name: 'Actif', value: activeValue, color: '#10b981' },
      { name: 'Dormant', value: kpi.inactiveValue, color: '#64748b' },
      { name: 'Endommagé', value: kpi.damagedValue, color: '#ef4444' }
    ];

    const salesSorted = [...productStats].sort((a, b) => b.sold - a.sold);
    const valueSorted = [...productStats].sort((a, b) => b.value - a.value);
    const returnSorted = [...productStats].sort((a, b) => b.returned - a.returned);
    const deadItems = productStats.filter(s => s.isDead).sort((a, b) => b.value - a.value);

    // Packaging Stats
    const currentPackagings = JSON.parse(localStorage.getItem('packagings') || '[]');
    const packagedProductIds = new Set(currentPackagings.map(p => String(p.productId)));
    const packagedCount = products.filter(p => packagedProductIds.has(String(p.id))).length;
    const nonPackagedCount = products.length - packagedCount;
    
    const packagingDistribution = [
      { name: 'Emballé', value: packagedCount, color: '#10b981' },
      { name: 'Non Emballé', value: nonPackagedCount, color: '#ef4444' }
    ];

    setDashboardData({
      kpi, warehouses: warehouseData, warehouseMeta: warehouses, salesChart: salesChartData, stockDistribution,
      topSales: salesSorted[0] || {}, flopSales: salesSorted[salesSorted.length - 1] || {},
      topValue: valueSorted[0] || {}, flopValue: valueSorted[valueSorted.length - 1] || {},
      topReturn: returnSorted[0] || {}, flopReturn: returnSorted[returnSorted.length - 1] || {},
      deadStock: deadItems[0] || null, matrixData,
      catalogueData: Object.values(catalogueStats).sort((a,b) => b.stock - a.stock),
      packagings: currentPackagings,
      packagingDistribution
    });
  };

  useEffect(() => { calculateDashboard(); }, []);

  const fmt = (n) => parseFloat(n).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + " DH";
  const num = (n) => parseInt(n).toLocaleString('fr-FR');

  if (!dashboardData) return (
    <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#2563EB] border-t-transparent"></div>
    </div>
  );

  const { kpi, warehouses, warehouseMeta, salesChart, stockDistribution, topSales, flopSales, topValue, flopValue, topReturn, flopReturn, deadStock, matrixData } = dashboardData;
  const filteredMatrix = matrixData.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // --- UI COMPONENTS ---
  const Section = ({ title, icon: Icon, children }) => (
    <div className="space-y-4">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-[#1e3a8a]/10 dark:bg-[#1e3a8a]/20 rounded-lg text-[#1e3a8a] dark:text-blue-400">
                {Icon ? <Icon size={24} /> : <Activity size={24} />}
            </div>
            <h2 className="text-xl font-bold text-[#1e3a8a] dark:text-blue-400">{title}</h2>
        </div>
        {children}
    </div>
  );

  const StatCard = ({ label, value, icon: Icon, sub, color }) => (
    <SpotlightCard theme="light" className="flex flex-col justify-between h-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"> 
        <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</span>
            {Icon && <Icon size={18} className="text-[#2563EB] dark:text-blue-400" />}
        </div>
        <div>
            <div className={`text-2xl font-black ${color || 'text-slate-800 dark:text-slate-200'}`}>{value}</div>
            {sub && <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">{sub}</div>}
        </div>
    </SpotlightCard>
  );

  return (
    <div className="w-full min-h-screen bg-transparent p-6 space-y-8 animate-[fade-in_0.6s_ease-out] text-slate-800 dark:text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 bg-transparent p-6 rounded-3xl border border-slate-100/50 dark:border-slate-700/50">
        <div>
          <h1 className="text-3xl font-extrabold text-[#2563EB]">Tableau de Bord Central</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Système de Gestion Intelligente des Stocks</p>
        </div>

        <div className="flex flex-wrap gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
           <div className="flex flex-col gap-1">
             <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Date Début</label>
             <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-[#1e3a8a] dark:focus:border-blue-500" />
           </div>
           <div className="flex flex-col gap-1">
             <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Date Fin</label>
             <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-[#1e3a8a] dark:focus:border-blue-500" />
           </div>
           <button onClick={calculateDashboard} className="mt-auto px-5 py-2.5 bg-[#1e3a8a] text-white rounded-xl font-bold text-sm hover:bg-[#1e40af] transition-all shadow-md shadow-blue-900/20">Appliquer</button>
           <button onClick={handleRefresh} className="mt-auto px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"><RefreshCw size={18} /></button>
        </div>
      </div>

      {/* 1. KPIs */}
      <Section title="Indicateurs Clés" icon={Activity}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Stock Général" value={num(kpi.totalQty)} icon={Package} sub={`${matrixData.length} Produits Distribués`} color="text-[#1e3a8a] dark:text-blue-400" />
            <StatCard label="Alertes Stock" value={kpi.alerts} icon={AlertTriangle} sub="Produits au seuil minimum" color="text-amber-500" />
            <StatCard label="Endommagés" value={kpi.damaged} icon={AlertCircle} sub="Unités déclarées pertes" color="text-rose-500" />
            <StatCard label="En Transit" value={kpi.transitCount} icon={Truck} sub="Expéditions en cours" color="text-indigo-500" />
        </div>
      </Section>

      {/* 2. PACKAGING OVERVIEW - REMOVED AS REQUESTED */}

      {/* 3. FINANCIALS & CHARTS */}
      <Section title="Bilan & Analyse" icon={DollarSign}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Financial Box */}
              <SpotlightCard theme="light" className="flex flex-col gap-6 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-4">
                      <h3 className="text-lg font-bold text-[#1e3a8a] dark:text-blue-400">Résumé Financier</h3>
                      <span className="bg-[#1e3a8a]/10 dark:bg-[#1e3a8a]/30 text-[#1e3a8a] dark:text-blue-300 px-3 py-1 rounded-lg text-xs font-bold">MAD</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 bg-[#1e3a8a] text-white rounded-2xl p-5 shadow-lg shadow-blue-900/20 relative overflow-hidden">
                          <div className="relative z-10">
                              <p className="text-blue-100/80 text-xs font-bold uppercase tracking-wide mb-1">Valeur Totale Stock (Actifs)</p>
                              <p className="text-3xl font-black">{fmt(kpi.totalValue)}</p>
                          </div>
                          <div className="absolute -right-4 -bottom-8 opacity-10"><DollarSign size={100}/></div>
                      </div>
                      
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">Stock Dormant</div>
                        <div className="text-lg font-black text-slate-700 dark:text-slate-300">{fmt(kpi.inactiveValue)}</div>
                      </div>
                      <div className="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-3 border border-rose-100 dark:border-rose-800/30">
                        <div className="text-xs text-rose-500 dark:text-rose-400 font-bold mb-1">Pertes (Endommagé)</div>
                        <div className="text-lg font-black text-rose-600 dark:text-rose-400">{fmt(kpi.damagedValue)}</div>
                      </div>
                      <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3 border border-indigo-100 dark:border-indigo-800/30">
                        <div className="text-xs text-indigo-500 dark:text-indigo-400 font-bold mb-1">En Transit</div>
                        <div className="text-lg font-black text-indigo-600 dark:text-indigo-400">{fmt(kpi.transitValue)}</div>
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3 border border-orange-100 dark:border-orange-800/30">
                        <div className="text-xs text-orange-500 dark:text-orange-400 font-bold mb-1">Retours</div>
                        <div className="text-lg font-black text-orange-600 dark:text-orange-400">{fmt(kpi.returnValue)}</div>
                      </div>
                  </div>
              </SpotlightCard>

              {/* Charts Box */}
              <SpotlightCard theme="light" className="flex flex-col gap-6 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-4">
                      <h3 className="text-lg font-bold text-[#1e3a8a] dark:text-blue-400">Dynamique des Stocks</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
                       <div className="h-48 w-full">
                          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 text-center">Évolution Ventes</p>
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={salesChart}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                              <Tooltip contentStyle={{background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff'}} />
                              <Line type="monotone" dataKey="ventes" stroke="#2563EB" strokeWidth={3} dot={{r: 3, fill:'#2563EB'}} />
                            </LineChart>
                          </ResponsiveContainer>
                       </div>
                       <div className="h-48 w-full">
                          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 text-center">Répartition Valeur</p>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={stockDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                                {stockDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                              </Pie>
                              <Tooltip contentStyle={{background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff'}} />
                            </PieChart>
                          </ResponsiveContainer>
                       </div>
                  </div>
              </SpotlightCard>
          </div>
      </Section>

      {/* 4. PERFORMANCE COMPARISON (Top/Flop) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <SpotlightCard theme="light" className="border-t-4 border-t-emerald-500 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
             <div className="flex justify-between items-start mb-4">
                 <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-black px-2 py-1 rounded">PERFORMANCE VENTES</span>
                 <TrendingUp size={16} className="text-emerald-500"/>
             </div>
             <div className="space-y-4">
                 <div className="flex justify-between items-center">
                     <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{topSales.name || '-'}</span>
                     <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">+{topSales.sold}</span>
                 </div>
                 <div className="h-px bg-slate-100 dark:bg-slate-700 w-full"></div>
                 <div className="flex justify-between items-center opacity-60">
                     <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{flopSales.name || '-'}</span>
                     <span className="font-mono font-bold text-slate-500 dark:text-slate-400">{flopSales.sold}</span>
                 </div>
             </div>
         </SpotlightCard>
         
         <SpotlightCard theme="light" className="border-t-4 border-t-blue-500 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
             <div className="flex justify-between items-start mb-4">
                 <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-black px-2 py-1 rounded">VALEUR ACTIFS</span>
                 <DollarSign size={16} className="text-blue-500"/>
             </div>
             <div className="space-y-4">
                 <div className="flex justify-between items-center">
                     <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{topValue.name || '-'}</span>
                     <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{topValue.value ? (topValue.value > 1000 ? (topValue.value/1000).toFixed(1)+'k' : topValue.value) : 0}</span>
                 </div>
                 <div className="h-px bg-slate-100 dark:bg-slate-700 w-full"></div>
                 <div className="flex justify-between items-center opacity-60">
                     <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{flopValue.name || '-'}</span>
                     <span className="font-mono font-bold text-slate-500 dark:text-slate-400">{flopValue.value ? (flopValue.value > 1000 ? (flopValue.value/1000).toFixed(1)+'k' : flopValue.value) : 0}</span>
                 </div>
             </div>
         </SpotlightCard>

         <SpotlightCard theme="light" className="border-t-4 border-t-rose-500 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
             <div className="flex justify-between items-start mb-4">
                 <span className="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 text-[10px] font-black px-2 py-1 rounded">TAUX RETOURS</span>
                 <TrendingDown size={16} className="text-rose-500"/>
             </div>
             <div className="space-y-4">
                 <div className="flex justify-between items-center">
                     <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{topReturn.name || '-'}</span>
                     <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{topReturn.returned}</span>
                 </div>
                 <div className="h-px bg-slate-100 dark:bg-slate-700 w-full"></div>
                 <div className="flex justify-between items-center opacity-60">
                     <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{flopReturn.name || '-'}</span>
                     <span className="font-mono font-bold text-slate-500 dark:text-slate-400">{flopReturn.returned}</span>
                 </div>
             </div>
         </SpotlightCard>
      </div>

       {/* Dead Stock Alert Banner */}
       {deadStock ? (
        <SpotlightCard theme="light" className="!bg-red-50 dark:!bg-red-900/20 !border-red-200 dark:!border-red-800/50 flex justify-between items-center shadow-none">
          <div>
            <h4 className="text-red-600 dark:text-red-400 font-bold text-xs uppercase mb-1 flex items-center gap-2"><AlertCircle size={14}/> Produit Inactif (Valeur Max)</h4>
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">{deadStock.name}</h2>
            <div className="text-sm text-slate-700 dark:text-slate-300 font-medium mt-1">
              Ce produit bloque <b>{fmt(deadStock.value)}</b> de trésorerie (Stock: {deadStock.stock})
            </div>
          </div>
          <div className="hidden sm:flex w-12 h-12 bg-white dark:bg-slate-800 rounded-full items-center justify-center text-2xl shadow-md">🕸️</div>
        </SpotlightCard>
      ) : (
        <SpotlightCard theme="light" className="!bg-emerald-50 dark:!bg-emerald-900/20 !border-emerald-200 dark:!border-emerald-800/50 flex justify-between items-center shadow-none">
          <div>
            <h4 className="text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase mb-1">Excellent</h4>
            <h2 className="text-xl font-black text-emerald-800 dark:text-emerald-200">Aucun Stock Dormant</h2>
          </div>
          <div className="hidden sm:flex w-12 h-12 bg-white dark:bg-slate-800 rounded-full items-center justify-center text-2xl shadow-md">✨</div>
        </SpotlightCard>
      )}

      {/* 5. WAREHOUSES */}
      <Section title="Distribution Entrepôts" icon={Warehouse}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {warehouseMeta.map(wh => {
            const data = warehouses[wh.id];
            const fillPercent = Math.round((data.total / data.capacity) * 100);
            const barColor = fillPercent > 85 ? 'bg-red-500' : fillPercent > 50 ? 'bg-orange-500' : 'bg-[#2563EB]';
            
            return (
              <SpotlightCard key={wh.id} theme="light" className="flex flex-col border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 dark:border-slate-700">
                  <span className="font-bold flex items-center gap-2 text-[#1e3a8a] dark:text-blue-400">
                    <Warehouse size={18} /> {data.name}
                  </span>
                  <span className="bg-[#1e3a8a]/10 dark:bg-[#1e3a8a]/30 text-[#1e3a8a] dark:text-blue-300 px-2 py-1 rounded text-[10px] font-black">N°{wh.id}</span>
                </div>

                <div className="flex gap-3 mb-4">
                  <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center border border-slate-100 dark:border-slate-700">
                    <div className="text-lg font-black text-[#1e3a8a] dark:text-blue-400">{num(data.total)}</div>
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-1">Total Unités</div>
                  </div>
                  <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center border border-slate-100 dark:border-slate-700">
                    <div className="text-lg font-black text-[#1e3a8a] dark:text-blue-400">{data.items.length}</div>
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-1">Types</div>
                  </div>
                </div>

                <div className="max-h-24 overflow-y-auto bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 mb-4 custom-scrollbar">
                  {data.items.length > 0 ? (
                    data.items.sort((a, b) => b.qty - a.qty).map((item, idx) => (
                      <div key={idx} className="flex justify-between px-3 py-1.5 border-b border-slate-100 dark:border-slate-700 last:border-0 text-xs font-medium bg-white dark:bg-slate-900 even:bg-slate-50 dark:even:bg-slate-800/50">
                        <span className="truncate text-slate-600 dark:text-slate-300">{item.name}</span>
                        <b className="text-slate-700 dark:text-slate-200">{item.qty}</b>
                      </div>
                    ))
                  ) : <div className="p-3 text-center text-slate-400 text-xs italic">Vide</div>}
                </div>

                <div className="mt-auto">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1.5">
                    <span>Remplissage: {fillPercent}%</span>
                    <span>Capacité: {num(data.capacity)}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${fillPercent}%` }}></div>
                  </div>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      </Section>

      {/* 6. DETAILED TABLE */}
      <SpotlightCard theme="light" className="!p-0 border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#1e3a8a]/5 dark:bg-[#1e3a8a]/20">
          <h3 className="text-lg font-bold text-[#1e3a8a] dark:text-blue-400">Matrice des Mouvements</h3>
          
          <div className="relative w-full md:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
             <input
               type="text"
               placeholder="Rechercher..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 focus:border-[#1e3a8a] outline-none"
             />
          </div>
        </div>

        <div className="overflow-x-auto bg-white dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Nom Produit</th>
                <th className="px-6 py-4 text-left font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Stock</th>
                <th className="px-6 py-4 text-left font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Vendus</th>
                <th className="px-6 py-4 text-left font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Retours</th>
                <th className="px-6 py-4 text-left font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Transit</th>
                <th className="px-6 py-4 text-left font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {filteredMatrix.map((item, idx) => {
                const dotColor = item.stock === 0 ? 'bg-red-500' : item.stock < 10 ? 'bg-amber-500' : 'bg-emerald-500';
                return (
                  <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">{item.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
                        <span className="font-mono text-[#1e3a8a] dark:text-blue-400 font-bold">{item.stock}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-600 dark:text-slate-400">{item.sold}</td>
                    <td className="px-6 py-4 font-mono font-bold text-rose-500 dark:text-rose-400">{item.returned}</td>
                    <td className="px-6 py-4 font-mono font-bold text-indigo-500 dark:text-indigo-400">{item.transit}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase rounded-md border border-emerald-100 dark:border-emerald-800">Actif</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SpotlightCard>

    </div>
  );
};

export default InventoryDashboard;
