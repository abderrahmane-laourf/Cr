import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, Calendar, 
  PieChart as PieIcon, BarChart2, Filter, Download
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

const API_URL = 'http://localhost:3000';
const SHIPPING_COST_ESTIMATE = 25; // MAD per order

// --- UTILITY ---
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount);
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
const PIE_COLORS = ['#EF4444', '#F59E0B', '#3B82F6']; // Red (Ads), Orange (Shipping), Blue (Goods)

const ReportsDashboard = () => {
  // State
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // First day of current month
    endDate: new Date().toISOString().split('T')[0]
  });
  
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState('product'); // 'product', 'employee', 'city'

  // Load Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [clientsRes, productsRes, adsRes] = await Promise.all([
          fetch(`${API_URL}/clients`).catch(() => ({ ok: false, json: async () => [] })),
          fetch(`${API_URL}/products`).catch(() => ({ ok: false, json: async () => [] })),
          fetch(`${API_URL}/ads`).catch(() => ({ ok: false, json: async () => [] }))
        ]);

        const clientsData = clientsRes.ok ? await clientsRes.json() : [];
        const productsData = productsRes.ok ? await productsRes.json() : [];
        const adsData = adsRes.ok ? await adsRes.json() : [];

        setClients(clientsData);
        setProducts(productsData);
        setAds(adsData);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- CALCULATIONS ---
  const kpiData = useMemo(() => {
    if (loading) return null;

    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    end.setHours(23, 59, 59, 999); // Include full end day

    // 1. Filter Data by Date
    // Note: Assuming 'dateCreated' for clients and 'date' for ads
    const filteredClients = clients.filter(c => {
      const d = new Date(c.dateCreated);
      // Filter out Cancelled/Returned if necessary (assuming 'Livré' or all valid orders for now)
      const validStage = c.stage !== 'Annulé' && c.stage !== 'Retour'; 
      return d >= start && d <= end && validStage;
    });

    const filteredAds = ads.filter(a => {
      const d = new Date(a.date);
      return d >= start && d <= end;
    });

    // 2. Calculate Revenue
    const totalRevenue = filteredClients.reduce((sum, c) => sum + (parseFloat(c.price) || 0), 0);
    const totalOrders = filteredClients.length;

    // 3. Calculate COGS (Cost of Goods Sold)
    const totalCOGS = filteredClients.reduce((sum, c) => {
      // Find product
      const product = products.find(p => p.id === c.produitId || p.nom === c.produitName);
      if (product) {
        return sum + ((parseFloat(product.prixAchat || 0)) * (parseInt(c.nbPiece) || 1));
      }
      return sum;
    }, 0);

    // 4. Calculate Other Expenses
    const totalAdsMetric = filteredAds.reduce((sum, a) => sum + (parseFloat(a.spent) || 0), 0);
    const totalShipping = totalOrders * SHIPPING_COST_ESTIMATE;
    
    const totalExpenses = totalCOGS + totalAdsMetric + totalShipping;
    
    // 5. Net Profit
    const netProfit = totalRevenue - totalExpenses;
    const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalOrders,
      totalExpenses,
      netProfit,
      margin,
      breakdown: [
        { name: 'Publicité (Ads)', value: totalAdsMetric },
        { name: 'Livraison (Est.)', value: totalShipping },
        { name: 'Marchandise (COGS)', value: totalCOGS },
      ],
      filteredClients
    };
  }, [loading, clients, products, ads, dateRange]);

  // --- CHART DATA PREPARATION ---
  const chartData = useMemo(() => {
    if (!kpiData) return { barData: [], tableData: [] };

    const { filteredClients } = kpiData;
    const grouped = {};

    filteredClients.forEach(c => {
      let key = 'Inconnu';
      if (groupBy === 'product') key = c.produitName || 'Inconnu';
      else if (groupBy === 'employee') key = c.nom || 'Inconnu'; // Assuming client 'nom' is mostly useful, but maybe we want the Agent/Employee? Client DB usually has 'employeeId' or similar if assigned. db.json clients doesn't seem to have employeeId clearly, simplified here. *Correction*: db.json clients only has client info. I will group by 'villeName' for Cities and 'produitName' for products.
      else if (groupBy === 'city') key = c.villeName || 'Inconnu';

      if (!grouped[key]) grouped[key] = { name: key, revenue: 0, orders: 0 };
      grouped[key].revenue += (parseFloat(c.price) || 0);
      grouped[key].orders += 1;
    });

    // Convert to Array and Sort
    const dataArray = Object.values(grouped).sort((a, b) => b.revenue - a.revenue);

    return {
      barData: dataArray.slice(0, 5), // Top 5 for chart
      tableData: dataArray // All for table
    };
  }, [kpiData, groupBy]);

  if (loading) return <div className="p-10 text-center">Chargement des rapports...</div>;

  return (
    <div className="min-h-screen bg-slate-50/50 p-8 font-sans text-slate-800">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
           <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tableau de Bord Financier</h1>
           <p className="text-slate-500 mt-1 font-medium">Analysez vos profits, dépenses et performances.</p>
        </div>
        
        {/* Date Filter */}
        <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
           <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-2">
              <Calendar size={16} className="text-slate-400"/>
              <input 
                type="date" 
                value={dateRange.startDate}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                className="bg-transparent text-sm font-bold text-slate-700 outline-none"
              />
           </div>
           <span className="text-slate-300 font-bold">-</span>
           <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-2">
              <input 
                type="date" 
                value={dateRange.endDate}
                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                className="bg-transparent text-sm font-bold text-slate-700 outline-none"
              />
           </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Net Profit */}
        <div className={`p-6 rounded-2xl shadow-sm border ${kpiData.netProfit >= 0 ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-red-600 text-white border-red-500'}`}>
           <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                 <DollarSign size={24} className="text-white" />
              </div>
              <span className="bg-white/20 px-2 py-1 rounded-lg text-xs font-bold backdrop-blur-sm">Net</span>
           </div>
           <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">Résultat Net (Safi Rib7)</p>
           <h3 className="text-4xl font-black">{formatCurrency(kpiData.netProfit)}</h3>
           <p className="mt-2 text-sm font-medium opacity-90">Marge Nette: {kpiData.margin.toFixed(1)}%</p>
        </div>

         {/* Revenue */}
         <div className="p-6 rounded-2xl shadow-sm border border-slate-200 bg-white">
           <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                 <TrendingUp size={24} />
              </div>
           </div>
           <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Chiffre d'Affaires</p>
           <h3 className="text-3xl font-black text-slate-900">{formatCurrency(kpiData.totalRevenue)}</h3>
           <p className="mt-2 text-sm text-slate-500">{kpiData.totalOrders} Commandes livrées</p>
        </div>

        {/* Expenses */}
        <div className="p-6 rounded-2xl shadow-sm border border-slate-200 bg-white">
           <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-red-50 rounded-xl text-red-600">
                 <TrendingDown size={24} />
              </div>
           </div>
           <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Dépenses</p>
           <h3 className="text-3xl font-black text-slate-900">{formatCurrency(kpiData.totalExpenses)}</h3>
           <p className="mt-2 text-sm text-slate-500">Coût total (Ads + Goods + Ship)</p>
        </div>

        {/* Ad Spend Specific */}
        <div className="p-6 rounded-2xl shadow-sm border border-slate-200 bg-white">
           <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                 <PieIcon size={24} />
              </div>
           </div>
           <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Budget Ads</p>
           <h3 className="text-3xl font-black text-slate-900">{formatCurrency(kpiData.breakdown[0].value)}</h3>
           <p className="mt-2 text-sm text-slate-500">Dépensé sur la période</p>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Pie Chart: Expenses */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
           <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <PieIcon size={18} className="text-slate-400"/>
              Répartition des Coûts
           </h3>
           <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                      data={kpiData.breakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {kpiData.breakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                 </PieChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Bar Chart: Best Sellers */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
           <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <BarChart2 size={18} className="text-slate-400"/>
              Top 5 Produits (Chiffre d'Affaires)
           </h3>
           <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData.barData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={150} tick={{fontSize: 12}} />
                    <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                        formatter={(value) => formatCurrency(value)}
                    />
                    <Bar dataKey="revenue" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20} />
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>

       {/* DETAILED TABLE */}
       <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
             <h3 className="font-bold text-lg text-slate-900">Détails des Ventes</h3>
             <div className="flex items-center bg-slate-50 rounded-lg p-1 border border-slate-200">
                 <button 
                  onClick={() => setGroupBy('product')}
                  className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${groupBy === 'product' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   Par Produit
                 </button>
                 <button 
                  onClick={() => setGroupBy('city')}
                  className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${groupBy === 'city' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   Par Ville
                 </button>
             </div>
          </div>
          
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {groupBy === 'product' ? 'Produit' : groupBy === 'city' ? 'Ville' : 'Élément'}
                </th>
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Commandes</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Chiffre d'Affaires</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">% du Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {chartData.tableData.length === 0 ? (
                <tr>
                   <td colSpan="4" className="text-center py-8 text-slate-400 font-medium">Aucune donnée sur cette période</td>
                </tr>
              ) : (
                chartData.tableData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-700">{row.name}</td>
                    <td className="px-6 py-4 text-right text-sm text-slate-600">{row.orders}</td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-emerald-600">{formatCurrency(row.revenue)}</td>
                    <td className="px-6 py-4 text-right text-sm text-slate-400">
                      {((row.revenue / kpiData.totalRevenue) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
       </div>
    </div>
  );
};

export default ReportsDashboard;
