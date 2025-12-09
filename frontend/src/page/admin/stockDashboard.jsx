import React, { useState, useEffect } from 'react';
import { 
  Package, AlertTriangle, AlertCircle, Truck, TrendingUp, TrendingDown,
  Calendar, RefreshCw, Download, Search, Trophy, Ban, Warehouse
} from 'lucide-react';
import { 
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import Swal from 'sweetalert2';

const InventoryDashboard = () => {
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dashboardData, setDashboardData] = useState(null);

  // Générer des données de test
  const handleRefresh = () => {
    Swal.fire({
      title: 'Régénérer les données ?',
      text: 'Cela va réinitialiser toutes les données du dashboard',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0f172a',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Oui, régénérer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        generateData();
        Swal.fire({
          title: 'Données régénérées !',
          text: 'Le dashboard a été mis à jour',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
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
      { id: "p1", name: "iPhone 15 Pro Max", price: 13500, dist: [5, 2, 1], alert: 2 },
      { id: "p2", name: "Chargeur Anker 20W", price: 150, dist: [200, 50, 20], alert: 20 },
      { id: "p3", name: "Machine à Café Pro", price: 25000, dist: [10, 0, 0], alert: 2 },
      { id: "p4", name: "Sac Laptop Vintage", price: 200, dist: [40, 0, 0], alert: 5 },
      { id: "p5", name: "Protection Écran", price: 15, dist: [300, 100, 50], alert: 50 },
      { id: "p6", name: "Montre Connectée", price: 100, dist: [100, 50, 0], alert: 30 },
      { id: "p7", name: "Écouteurs Bluetooth", price: 300, dist: [0, 0, 0], alert: 5 }
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
      totalQty: 0,
      totalValue: 0,
      alerts: 0,
      damaged: 0,
      transitValue: 0,
      returnValue: 0,
      damagedValue: 0,
      inactiveValue: 0,
      transitCount: 0
    };

    let warehouseData = {};
    let productStats = [];
    let dailySales = {};
    let matrixData = [];

    warehouses.forEach(w => {
      warehouseData[w.id] = {
        name: w.name,
        capacity: w.capacity,
        items: [],
        total: 0
      };
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

      productStats.push({
        name: p.name,
        price: p.price,
        stock: totalStock,
        value: stockValue,
        sold,
        returned,
        isDead
      });

      matrixData.push({
        name: p.name,
        stock: totalStock,
        sold,
        returned,
        transit
      });
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

    setDashboardData({
      kpi,
      warehouses: warehouseData,
      warehouseMeta: warehouses,
      salesChart: salesChartData,
      stockDistribution,
      topSales: salesSorted[0] || {},
      flopSales: salesSorted[salesSorted.length - 1] || {},
      topValue: valueSorted[0] || {},
      flopValue: valueSorted[valueSorted.length - 1] || {},
      topReturn: returnSorted[0] || {},
      flopReturn: returnSorted[returnSorted.length - 1] || {},
      deadStock: deadItems[0] || null,
      matrixData
    });
  };

  useEffect(() => {
    calculateDashboard();
  }, []);

  const fmt = (n) => parseFloat(n).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + " DH";
  const num = (n) => parseInt(n).toLocaleString('fr-FR');

  if (!dashboardData) return <div className="p-8">Chargement...</div>;

  const { kpi, warehouses, warehouseMeta, salesChart, stockDistribution, topSales, flopSales, topValue, flopValue, topReturn, flopReturn, deadStock, matrixData } = dashboardData;

  const filteredMatrix = matrixData.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      {/* Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Tableau de Bord Central</h1>
          <p className="text-slate-500 mt-1">Système de Gestion Intelligente des Stocks</p>
        </div>

        <div className="flex flex-wrap gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Date Début</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Date Fin</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50"
            />
          </div>
          <button
            onClick={calculateDashboard}
            className="mt-auto px-5 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition-all"
          >
            Appliquer
          </button>
          <button
            onClick={handleRefresh}
            className="mt-auto px-5 py-2 border border-slate-900 text-slate-900 rounded-lg font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <RefreshCw size={16} /> Générer
          </button>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <span className="text-sm text-slate-500 font-semibold">📦 Stock Général</span>
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          </div>
          <div className="text-3xl font-black text-blue-600">{num(kpi.totalQty)}</div>
          <div className="text-xs text-slate-500 mt-2">Total unités ({matrixData.length} produits)</div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <span className="text-sm text-slate-500 font-semibold">⚠️ Alertes Stock</span>
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
          </div>
          <div className="text-3xl font-black text-orange-500">{kpi.alerts}</div>
          <div className="text-xs text-slate-500 mt-2">Produits au seuil minimum</div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <span className="text-sm text-slate-500 font-semibold">💔 Endommagés</span>
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
          </div>
          <div className="text-3xl font-black text-red-600">{kpi.damaged}</div>
          <div className="text-xs text-slate-500 mt-2">Unités déclarées pertes</div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <span className="text-sm text-slate-500 font-semibold">🚚 En Transit</span>
            <span className="w-2 h-2 rounded-full bg-purple-600"></span>
          </div>
          <div className="text-3xl font-black text-purple-600">{kpi.transitCount}</div>
          <div className="text-xs text-slate-500 mt-2">Commandes expédiées</div>
        </div>
      </div>

      {/* Financial Summary + Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">💰 Résumé Financier</h3>
            <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold">MAD</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 bg-blue-50 border border-blue-100 rounded-xl p-4">
              <div className="text-xs text-blue-600 mb-1">Valeur Totale Stock (Actifs)</div>
              <div className="text-2xl font-black text-blue-600">{fmt(kpi.totalValue)}</div>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <div className="text-xs text-slate-500 mb-1">Stock Dormant</div>
              <div className="text-base font-bold text-slate-700">{fmt(kpi.inactiveValue)}</div>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <div className="text-xs text-slate-500 mb-1">Endommagés (Perte)</div>
              <div className="text-base font-bold text-red-600">{fmt(kpi.damagedValue)}</div>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <div className="text-xs text-slate-500 mb-1">Marchandise Expédiée</div>
              <div className="text-base font-bold text-purple-600">{fmt(kpi.transitValue)}</div>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <div className="text-xs text-slate-500 mb-1">Retours</div>
              <div className="text-base font-bold text-orange-500">{fmt(kpi.returnValue)}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold mb-6">📈 Analyse Graphique</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="ventes" stroke="#2563eb" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stockDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {stockDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => fmt(value)} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* VS Comparisons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <h4 className="text-sm text-slate-500 font-bold mb-4">🔥 Performance Ventes</h4>
          <div className="flex gap-3">
            <div className="flex-1 bg-gradient-to-b from-white to-green-50 border-b-4 border-green-500 rounded-lg p-3">
              <span className="inline-block bg-green-100 text-green-600 text-xs font-bold px-2 py-1 rounded mb-2">TOP 1</span>
              <div className="font-bold text-sm truncate">{topSales.name || '--'}</div>
              <div className="text-xs text-slate-500 flex justify-between mt-1">
                <span>Ventes</span>
                <b className="text-slate-900">{topSales.sold || 0}</b>
              </div>
            </div>
            <div className="flex-1 bg-gradient-to-b from-white to-red-50 border-b-4 border-red-500 rounded-lg p-3">
              <span className="inline-block bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded mb-2">FLOP 1</span>
              <div className="font-bold text-sm truncate">{flopSales.name || '--'}</div>
              <div className="text-xs text-slate-500 flex justify-between mt-1">
                <span>Ventes</span>
                <b className="text-slate-900">{flopSales.sold || 0}</b>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <h4 className="text-sm text-slate-500 font-bold mb-4">💎 Valeur Actifs</h4>
          <div className="flex gap-3">
            <div className="flex-1 bg-gradient-to-b from-white to-blue-50 border-b-4 border-blue-500 rounded-lg p-3">
              <span className="inline-block bg-blue-100 text-blue-600 text-xs font-bold px-2 py-1 rounded mb-2">PLUS CHER</span>
              <div className="font-bold text-sm truncate">{topValue.name || '--'}</div>
              <div className="text-xs text-slate-500 flex justify-between mt-1">
                <span>Valeur</span>
                <b className="text-slate-900">{topValue.value ? fmt(topValue.value) : '0'}</b>
              </div>
            </div>
            <div className="flex-1 bg-gradient-to-b from-white to-slate-50 border-b-4 border-slate-300 rounded-lg p-3">
              <span className="inline-block bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded mb-2">MOINS CHER</span>
              <div className="font-bold text-sm truncate">{flopValue.name || '--'}</div>
              <div className="text-xs text-slate-500 flex justify-between mt-1">
                <span>Valeur</span>
                <b className="text-slate-900">{flopValue.value ? fmt(flopValue.value) : '0'}</b>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <h4 className="text-sm text-slate-500 font-bold mb-4">↩️ Retours</h4>
          <div className="flex gap-3">
            <div className="flex-1 bg-gradient-to-b from-white to-red-50 border-b-4 border-red-500 rounded-lg p-3">
              <span className="inline-block bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded mb-2">PLUS RETOURS</span>
              <div className="font-bold text-sm truncate">{topReturn.name || '--'}</div>
              <div className="text-xs text-slate-500 flex justify-between mt-1">
                <span>Nombre</span>
                <b className="text-slate-900">{topReturn.returned || 0}</b>
              </div>
            </div>
            <div className="flex-1 bg-gradient-to-b from-white to-green-50 border-b-4 border-green-500 rounded-lg p-3">
              <span className="inline-block bg-green-100 text-green-600 text-xs font-bold px-2 py-1 rounded mb-2">MOINS RETOURS</span>
              <div className="font-bold text-sm truncate">{flopReturn.name || '--'}</div>
              <div className="text-xs text-slate-500 flex justify-between mt-1">
                <span>Nombre</span>
                <b className="text-slate-900">{flopReturn.returned || 0}</b>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dead Stock Alert */}
      {deadStock ? (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-6 mb-8 flex justify-between items-center shadow-sm">
          <div>
            <h4 className="text-red-600 font-bold text-sm uppercase mb-1">Produit Inactif (Valeur Max)</h4>
            <h2 className="text-2xl font-black text-slate-900">{deadStock.name}</h2>
            <div className="text-sm text-slate-600 mt-2">
              Quantité: <b>{deadStock.stock}</b> | Valeur Bloquée: <b>{fmt(deadStock.value)}</b>
            </div>
          </div>
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-md">
            🕸️
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-6 mb-8 flex justify-between items-center shadow-sm">
          <div>
            <h4 className="text-green-600 font-bold text-sm uppercase mb-1">Excellent</h4>
            <h2 className="text-2xl font-black text-green-600">Aucun Stock Dormant</h2>
          </div>
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-md">
            ✨
          </div>
        </div>
      )}

      {/* Warehouses */}
      <h3 className="text-2xl font-bold mb-6">🏭 Distribution Entrepôts</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {warehouseMeta.map(wh => {
          const data = warehouses[wh.id];
          const fillPercent = Math.round((data.total / data.capacity) * 100);
          const barColor = fillPercent > 85 ? 'bg-red-500' : fillPercent > 50 ? 'bg-orange-500' : 'bg-green-500';
          
          return (
            <div key={wh.id} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                <span className="font-bold flex items-center gap-2">
                  <Warehouse size={18} className="text-blue-600" />
                  {data.name}
                </span>
                <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-semibold">N°{wh.id}</span>
              </div>

              <div className="flex gap-3 mb-4">
                <div className="flex-1 bg-slate-50 rounded-lg p-3 text-center">
                  <div className="text-xl font-black text-blue-600">{num(data.total)}</div>
                  <div className="text-xs text-slate-500 mt-1">Total Unités</div>
                </div>
                <div className="flex-1 bg-slate-50 rounded-lg p-3 text-center">
                  <div className="text-xl font-black text-blue-600">{data.items.length}</div>
                  <div className="text-xs text-slate-500 mt-1">Types Produits</div>
                </div>
              </div>

              <div className="max-h-32 overflow-y-auto bg-slate-50 rounded-lg border border-slate-100 mb-4">
                {data.items.length > 0 ? (
                  data.items.sort((a, b) => b.qty - a.qty).map((item, idx) => (
                    <div key={idx} className="flex justify-between px-3 py-2 border-b border-slate-100 last:border-0 text-sm bg-white even:bg-slate-50">
                      <span className="truncate">{item.name}</span>
                      <b>{item.qty}</b>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-slate-400 text-sm">Vide</div>
                )}
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-2">
                  <span>Remplissage: {fillPercent}%</span>
                  <span>Capacité: {num(data.capacity)}</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${fillPercent}%` }}></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold mb-4">📋 Matrice Détaillée des Mouvements</h3>
          
          <div className="flex gap-3 items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-sm font-bold text-slate-500">Filtrer:</span>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase text-xs">Nom Produit</th>
                <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase text-xs">Stock Restant</th>
                <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase text-xs">Livré (Sales)</th>
                <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase text-xs">Retourné</th>
                <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase text-xs">En Cours (Transit)</th>
                <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase text-xs">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMatrix.map((item, idx) => {
                const dotColor = item.stock === 0 ? 'bg-red-500' : item.stock < 10 ? 'bg-purple-500' : 'bg-green-500';
                
                return (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold">{item.name}</td>
                    <td className="px-6 py-4 text-blue-600">
                      {item.stock}
                      <span className={`inline-block w-2 h-2 rounded-full ml-2 ${dotColor}`}></span>
                    </td>
                    <td className="px-6 py-4">{item.sold}</td>
                    <td className="px-6 py-4 text-red-600">{item.returned}</td>
                    <td className="px-6 py-4 text-purple-600">{item.transit}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-400">Actif</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;
