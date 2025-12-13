import React, { useState, useEffect } from 'react';
import { 
  Factory, Package, DollarSign, TrendingUp, Calendar, AlertCircle, 
  BarChart3, PieChart, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell, PieChart as RePieChart, Pie
} from 'recharts';
import { productionAPI, productAPI } from '../../services/api';
import SpotlightCard from '../../util/SpotlightCard';

export default function ProductionDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProductions: 0,
    totalQuantity: 0,
    totalCost: 0,
    thisMonthProductions: 0
  });
  const [chartData, setChartData] = useState([]);
  const [productDistribution, setProductDistribution] = useState([]);
  const [recentProductions, setRecentProductions] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productions, productsList] = await Promise.all([
        productionAPI.getAll(),
        productAPI.getAll()
      ]);

      setProducts(productsList);

      // --- CALCULATE KPIS ---
      const totalQuantity = productions.reduce((sum, p) => sum + parseInt(p.quantity || 0), 0);
      const totalCost = productions.reduce((sum, p) => sum + (parseFloat(p.totalCost) || 0), 0);
      
      const now = new Date();
      const thisMonth = productions.filter(p => {
        const prodDate = new Date(p.date);
        return prodDate.getMonth() === now.getMonth() && 
               prodDate.getFullYear() === now.getFullYear();
      });

      setStats({
        totalProductions: productions.length,
        totalQuantity,
        totalCost,
        thisMonthProductions: thisMonth.length
      });

      // --- PREPARE CHART DATA (Last 6 Months) ---
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return d.toISOString().slice(0, 7); // YYYY-MM
      }).reverse();

      const timelineData = last6Months.map(month => {
        const monthlyProds = productions.filter(p => p.date.startsWith(month));
        return {
          name: new Date(month + '-01').toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
          productions: monthlyProds.length,
          cost: monthlyProds.reduce((sum, p) => sum + (parseFloat(p.totalCost) || 0), 0),
          quantity: monthlyProds.reduce((sum, p) => sum + parseInt(p.quantity || 0), 0)
        };
      });
      setChartData(timelineData);

      // --- PRODUCT DISTRIBUTION ---
      const dist = {};
      productions.forEach(p => {
        const prodName = productsList.find(prod => prod.id == p.productId)?.nom || 'Inconnu';
        if (!dist[prodName]) dist[prodName] = 0;
        dist[prodName] += parseInt(p.quantity || 0);
      });
      
      const pieData = Object.entries(dist)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // Top 5
      
      setProductDistribution(pieData);

      // --- RECENT PRODUCTIONS ---
      setRecentProductions(productions.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5));

    } catch (error) {
      console.error('Error loading production data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#018790', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  const cards = [
    { title: 'Total Productions', value: stats.totalProductions, icon: Factory, color: 'text-[#018790]', bg: 'bg-[#018790]/10' },
    { title: 'Quantité Totale', value: stats.totalQuantity, icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Coût Total', value: `${Math.round(stats.totalCost).toLocaleString()} DH`, icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Ce Mois', value: stats.thisMonthProductions, icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-50' }
  ];

  if (loading) {
     return <div className="p-10 text-center text-slate-500">Chargement du tableau de bord...</div>;
  }

  return (
    <div className="w-full min-h-screen bg-transparent p-6 space-y-8 animate-[fade-in_0.6s_ease-out]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-transparent p-6 rounded-3xl border border-slate-100/50">
        <div>
          <h1 className="text-2xl font-extrabold text-[#018790]">Dashboard Production</h1>
          <p className="text-slate-500">Vue d'ensemble et analytique de fabrication</p>
        </div>
        <div className="mt-4 sm:mt-0">
            <button 
                onClick={() => navigate('/admin/production')}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#005461] hover:bg-[#016f76] text-white rounded-xl transition-all shadow-lg shadow-cyan-900/20 font-bold"
            >
                Gérer Production <ArrowRight size={18} />
            </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <SpotlightCard key={idx} theme="light" className="flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{card.title}</span>
              <card.icon className={card.color} size={18} />
            </div>
            <div>
              <div className={`text-2xl font-black ${card.color === 'text-[#018790]' ? 'text-[#005461]' : 'text-slate-800'}`}>{card.value}</div>
            </div>
          </SpotlightCard>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart: Evolution */}
        <SpotlightCard theme="light" className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <BarChart3 className="text-[#018790]" size={20} />
              Évolution des Coûts & Productions
            </h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#018790" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#018790" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="cost" stroke="#018790" strokeWidth={3} fillOpacity={1} fill="url(#colorCost)" name="Coût (DH)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SpotlightCard>

        {/* Pie Chart: Distribution */}
        <SpotlightCard theme="light">
           <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <PieChart className="text-emerald-500" size={20} />
              Top Produits (Qté)
            </h3>
          </div>
          <div className="h-64 w-full flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={productDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {productDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </SpotlightCard>
      </div>

      {/* Recent Activity Table */}
      <SpotlightCard theme="light" className="overflow-hidden p-0">
        <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-lg text-slate-800">Dernières Productions</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-[#005461]/5 text-[#005461] uppercase font-bold text-xs">
                    <tr>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Produit</th>
                        <th className="px-6 py-4">Quantité</th>
                        <th className="px-6 py-4 text-right">Coût Total</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {recentProductions.map((p, i) => {
                        const product = products.find(prod => prod.id == p.productId);
                        return (
                            <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900">
                                    {new Date(p.date).toLocaleDateString('fr-FR')}
                                </td>
                                <td className="px-6 py-4 flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                                      {product?.image && <img src={product.image} className="w-full h-full object-cover" alt="" />}
                                   </div>
                                    <span className="text-slate-700 font-semibold">{product?.nom || 'Inconnu'}</span>
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                    {p.quantity} <span className="text-xs text-slate-400">{product?.uniteCalcul}</span>
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-[#018790]">
                                    {parseFloat(p.totalCost || 0).toFixed(2)} DH
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
}
