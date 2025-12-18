import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign, TrendingUp, TrendingDown, Package, Users, ShoppingCart,
  MessageCircle, CheckCircle, Truck, RefreshCw, AlertCircle, Award,
  BarChart3, Activity, Megaphone, Box, CreditCard, ArrowUp, ArrowDown,
  Percent, Wallet, FileText, Filter, Search, RotateCw, Calendar, User, Briefcase, Folder,Layers 
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend, LabelList
} from 'recharts';
import Chart from 'react-apexcharts';
import { productAPI, employeeAPI, businessAPI } from '../../services/api';
import SpotlightCard from '../../util/SpotlightCard';
import { useTheme } from '../../context/ThemeContext';

const GlobalDashboard = () => {
  const { isDarkMode } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState('All');
  const [selectedBusiness, setSelectedBusiness] = useState('All');
  const [selectedProject, setSelectedProject] = useState('All');

  const [employees, setEmployees] = useState([]);
  const [products, setProducts] = useState([]);
  const [businesses, setBusinesses] = useState([]);

  useEffect(() => {
    loadLists();
    generateDashboardData();
  }, []);

  // Re-generate data when filters change
  useEffect(() => {
    generateDashboardData();
  }, [dateFrom, dateTo, selectedEmployee, selectedProduct, selectedBusiness, selectedProject]);

  const loadLists = async () => {
      try {
          const [emps, prods, bus] = await Promise.all([
              employeeAPI.getAll().catch(()=>[]),
              productAPI.getAll().catch(()=>[]),
              businessAPI.getAll().catch(()=>[])
          ]);
          setEmployees(emps);
          setProducts(prods);
          setBusinesses(bus);
      } catch (e) {
          console.error("Error loading lists", e);
      }
  };

  const generateDashboardData = useCallback(async () => {
    setLoading(true);
    
    try {
      // Data Retrieval
      // Mock Data Generator for Testing
      const generateMockData = () => {
        const statuses = ['Nouveau', 'ConfirmÃ©', 'ExpÃ©diÃ©', 'En livraison', 'LivrÃ©', 'Reporter', 'AnnulÃ©', 'Pas de rÃ©ponse'];
        const mockEmployees = ['Omar Amrani', 'Sarah Benali', 'Karim Tazi', 'Mouna Idrissi'];
        const mockProducts = [
             {id: '1', nom: 'Pack SantÃ©', prixVente: 299}, {id: '2', nom: 'Montre Luxe', prixVente: 450}, 
             {id: '3', nom: 'Parfum Oud', prixVente: 199}, {id: '4', nom: 'CrÃ¨me Visage', prixVente: 150}
        ];
        
        return Array.from({length: 150}, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 30)); // Last 30 days
            
            const product = mockProducts[Math.floor(Math.random() * mockProducts.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            
            return {
                id: i,
                dateCreated: date.toISOString().split('T')[0],
                clientName: `Client ${i}`,
                ville: ['Casablanca', 'Rabat', 'Marrakech', 'Tanger'][Math.floor(Math.random() * 4)],
                status: status, // Legacy field
                stage: status, // Current field
                prix: product.prixVente,
                productId: product.id,
                productName: product.nom,
                employee: mockEmployees[Math.floor(Math.random() * mockEmployees.length)],
                nbPiece: 1 + Math.floor(Math.random() * 2),
                business: Math.random() > 0.5 ? 'Commit' : 'Herboclear' // Match business API
            };
        });
      };

      // Data Retrieval with Fallback to Mock
      let rawColisData = JSON.parse(localStorage.getItem('colis') || '[]');
      if (rawColisData.length === 0) {
          rawColisData = generateMockData();
          console.log("Using Mock Data for Dashboard Testing");
      }
      const productsData = await productAPI.getAll() || [];
      const employeesData = await employeeAPI.getAll() || [];
      const soldData = JSON.parse(localStorage.getItem('usd_trans_final') || '[]');
      const rechargesData = JSON.parse(localStorage.getItem('recharges') || '[]');
      const packagingData = JSON.parse(localStorage.getItem('packaging') || '[]');

      // Apply Filters
      let colisData = rawColisData;

      if (dateFrom) {
          colisData = colisData.filter(c => c.dateCreated >= dateFrom);
      }
      if (dateTo) {
          colisData = colisData.filter(c => c.dateCreated <= dateTo);
      }
      if (selectedEmployee !== 'All') {
          colisData = colisData.filter(c => c.employee === selectedEmployee);
      }
      if (selectedProduct !== 'All') {
          // Assuming product name is stored or we map ID
          colisData = colisData.filter(c => c.productName === selectedProduct || c.productId === selectedProduct);
      }
      if (selectedBusiness !== 'All') {
          colisData = colisData.filter(c => c.business === selectedBusiness);
      }
      if (selectedProject !== 'All') {
          colisData = colisData.filter(c => c.project === selectedProject);
      }

      // 1. Marketing
      const adSpend = soldData.reduce((sum, t) => sum + (parseFloat(t.mad || 0)), 0);
      const totalMessages = 0; // Placeholder
      const costPerMessage = 0; // Placeholder
      const totalLeads = colisData.length;
      const confirmedCols = colisData.filter(c => ['ConfirmÃ©', 'ExpÃ©diÃ©', 'En livraison', 'LivrÃ©'].includes(c.stage));
      const confirmedCount = confirmedCols.length;
      const deliveredCols = colisData.filter(c => c.stage === 'LivrÃ©');
      const deliveredCount = deliveredCols.length;

      const cpa = confirmedCount > 0 ? adSpend / confirmedCount : 0;
      const cpl = deliveredCount > 0 ? adSpend / deliveredCount : 0;

      // Mock Trading History for Marketing (30 Days)
      const marketingHistory = Array.from({length: 30}, (_, i) => {
          // Trend Simulation
          const baseSpend = adSpend > 0 ? adSpend / 30 : 500;
          const trendFactor = 1 + (Math.sin(i / 5) * 0.2); // Wave pattern
          const randomFactor = 0.8 + Math.random() * 0.4; // Noise
          
          const dailySpend = baseSpend * trendFactor * randomFactor;
          const dailyMessages = Math.floor((dailySpend / (0.5 + Math.random() * 0.2)));
          const costMsg = dailyMessages > 0 ? dailySpend / dailyMessages : 0;
          
          // Conversion Funnel
          const conversionRate = 0.05 + (Math.random() * 0.02); // 5-7%
          const dailyLeads = Math.floor(dailyMessages * conversionRate);
          const dailyAcquisitions = Math.floor(dailyLeads * 0.4); // 40% close rate

          return {
              day: `J-${30 - i}`,
              spend: dailySpend,
              messages: dailyMessages,
              costMsg: costMsg,
              cpa: dailyAcquisitions > 0 ? dailySpend / dailyAcquisitions : 0,
              cpl: dailyLeads > 0 ? dailySpend / dailyLeads : 0
          };
      });

      // 2. Confirmation
      const confRate = totalLeads > 0 ? (confirmedCount / totalLeads) * 100 : 0;
      const delRate = confirmedCount > 0 ? (deliveredCount / confirmedCount) * 100 : 0;

      // Mock History for Confirmation/Delivery (30 Days)
      const confirmationHistory = Array.from({length: 30}, (_, i) => {
          // Trend: Generally improving or stable
          const baseLeads = 30 + Math.floor(Math.sin(i / 3) * 10) + (Math.random() * 10);
          
          // Apply realistic rates
          const dailyConfRate = 45 + (Math.random() * 15); // 45-60%
          const dailyDelRate = 70 + (Math.random() * 10); // 70-80%
          
          const dailyConfirmed = Math.floor(baseLeads * (dailyConfRate / 100));
          const dailyDelivered = Math.floor(dailyConfirmed * (dailyDelRate / 100));

          return {
              day: `J-${30 - i}`,
              leads: baseLeads,
              confirmed: dailyConfirmed,
              delivered: dailyDelivered,
              confRate: dailyConfRate,
              delRate: dailyDelRate
          };
      });

      // 3. Stock
      const currentStock = productsData.reduce((sum, p) => sum + (parseInt(p.stock || 0)), 0);
      const stockRest = currentStock;
      // Derived stock logic can be complex without history, making assumptions:
      // Stock Total = Current + Delivered (Simple Assumption)
      const stockFix = currentStock + deliveredCount; 
      
      const returnsCount = colisData.filter(c => ['RetournÃ©', 'AnnulÃ©', 'Ã‰chec livraison'].includes(c.stage)).length;
      const pendingCount = colisData.filter(c => ['En attente', 'Reporter', 'Packaging'].includes(c.stage)).length;
      const avgSend = confirmedCount > 0 ? (confirmedCount / 30).toFixed(0) : 0; // Avg per month assumption or total
      const packagingStock = packagingData.length > 0 ? packagingData.reduce((sum, p) => sum + (parseInt(p.quantity || 0)), 0) : 0;

      // Mock History for Stock/Logistics (30 Days)
      const stockHistory = Array.from({length: 30}, (_, i) => {
          // Simulation
          const dailyDelivered = Math.floor(Math.random() * 20) + 5;
          const dailyReturned = Math.floor(Math.random() * 5);
          const dailyPending = Math.floor(Math.random() * 15) + 10;
          
          return {
              day: `J-${30 - i}`,
              delivered: dailyDelivered,
              returned: dailyReturned,
              pending: dailyPending
          };
      });

      // 4. Delivery Results
      const revenue = deliveredCols.reduce((sum, c) => sum + (parseFloat(c.prix || 0)), 0);
      const totalPieces = deliveredCols.reduce((sum, c) => sum + (parseInt(c.nbPiece || 1)), 0);
      const avgParcelPrice = deliveredCount > 0 ? revenue / deliveredCount : 0;
      const avgPiecePrice = totalPieces > 0 ? revenue / totalPieces : 0;
      const avgCart = avgParcelPrice; // Same as parcel price usually

      // 5. Recharges
      const rechUSD = rechargesData.reduce((sum, r) => sum + (parseFloat(r.amountUSD || 0)), 0);
      const exchRate = 10.5; // Fixed or config
      const rechDH = rechUSD * exchRate;
      const rechCount = rechargesData.length;

      // 6. Financials
      const salaries = employeesData.reduce((sum, e) => sum + (parseFloat(e.salary || 0)), 0);
      const commissions = confirmedCols.reduce((sum, c) => sum + (parseFloat(c.commission || 0)), 0);
      const fixedCosts = 5000; // Static estimate
      const stockCost = 0; // Needs data
      const otherCosts = fixedCosts + stockCost; // Grouped
      
      const netProfit = revenue - salaries - commissions - adSpend - rechDH - fixedCosts;

      // 7. Performance Charts Data
      // Product Stats
      const productStats = {};
      colisData.forEach(c => {
        if (!c.productId) return;
        if (!productStats[c.productId]) {
          const p = productsData.find(prod => prod.id == c.productId);
          productStats[c.productId] = { 
            name: p ? p.nom : 'Inconnu', 
            sales: 0, revenue: 0, confirmed: 0, total: 0, delivered: 0
          };
        }
        const stats = productStats[c.productId];
        stats.total++;
        if (['ConfirmÃ©', 'LivrÃ©', 'ExpÃ©diÃ©', 'En livraison'].includes(c.stage)) stats.confirmed++;
        if (c.stage === 'LivrÃ©') {
          stats.delivered++;
          stats.sales++;
          stats.revenue += parseFloat(c.prix || 0);
        }
      });
      const productsList = Object.values(productStats).map(p => ({
        ...p,
        confRate: p.total > 0 ? (p.confirmed / p.total) * 100 : 0,
        delRate: p.confirmed > 0 ? (p.delivered / p.confirmed) * 100 : 0
      }));

      // Employee Stats
      const employeeStats = {};
      colisData.forEach(c => {
        const empName = c.employee || 'Inconnu';
        if (!employeeStats[empName]) {
            employeeStats[empName] = { name: empName, sales: 0, confirmed: 0, delivered: 0, total: 0, parcels: 0 };
        }
        const stats = employeeStats[empName];
        stats.total++;
        if (['ConfirmÃ©', 'LivrÃ©', 'ExpÃ©diÃ©', 'En livraison'].includes(c.stage)) stats.confirmed++;
        if (c.stage === 'LivrÃ©') {
            stats.delivered++;
            stats.sales++; 
        }
        if (['ConfirmÃ©', 'LivrÃ©', 'ExpÃ©diÃ©', 'En livraison'].includes(c.stage)) stats.parcels++;
      });
      const employeesList = Object.values(employeeStats).map(e => ({
        ...e,
        confRate: e.total > 0 ? (e.confirmed / e.total) * 100 : 0,
        delRate: e.confirmed > 0 ? (e.delivered / e.confirmed) * 100 : 0
      }));

      // Mock History for Delivery (30 Days)
      const deliveryHistory = Array.from({length: 30}, (_, i) => {
           const dailyParcels = Math.floor(Math.random() * 25) + 5;
           const dailyPieces = dailyParcels * (1 + Math.random());
           const dailyRevenue = dailyParcels * (avgCart || 350) + (Math.random() * 1000);

           return {
               day: `J-${30 - i}`,
               parcels: dailyParcels,
               pieces: Math.floor(dailyPieces),
               revenue: dailyRevenue
           };
      });

      setData({
        marketing: { adSpend, totalMessages, costPerMessage, cpa, cpl, history: marketingHistory },
        confirmation: { confirmed: confirmedCount, totalLeads, confRate, delivered: deliveredCount, delRate, history: confirmationHistory },
        stock: { stockFix, stockRest, delivered: deliveredCount, returns: returnsCount, pending: pendingCount, avgSend, packaging: packagingStock, history: stockHistory },
        delivery: { totalParcels: deliveredCount, totalPieces, avgParcelPrice, avgPiecePrice, avgCart, revenue, history: deliveryHistory },
        recharge: { rechUSD, exchRate, rechDH, rechCount, totalRech: rechDH },
        financial: { revenue, salaries, commissions, adSpend, rechDH, otherCosts, netProfit },
        products: productsList,
        employees: employeesList,
        logistics: {
             sent: confirmedCount,
             delivered: deliveredCount,
             returned: returnsCount,
             postponed: pendingCount,
             noAnswer: 12, // Mock logic or real count
             cancel: 8,    // Mock logic or real count
             refused: 5    // Mock logic or real count
        }
      });
      
    } catch (error) {
        console.error("Erreur calcul dashboard:", error);
    } finally {
        setLoading(false);
    }
  }, [dateFrom, dateTo, selectedEmployee, selectedProduct, selectedBusiness, selectedProject]);

  const fmt = (n) => parseFloat(n).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const num = (n) => parseInt(n).toLocaleString('fr-FR');
  
  if (loading || !data) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#2563EB] border-t-transparent"></div>
      </div>
    );
  }

  // --- Charts Data Preparation ---

  // B. Financial Distribution (Pie)
  const expenseChartData = [
      { name: 'Salaires', value: data.financial.salaries, color: '#2563EB' },
      { name: 'Marketing', value: data.financial.adSpend, color: '#6366F1' },
      { name: 'Logistique', value: data.financial.rechDH, color: '#fbbf24' },
      { name: 'Autres', value: data.financial.otherCosts, color: '#94a3b8' }
  ].filter(i => i.value > 0);

  // C. Logistics Pie (Summary Card)
  const logisticsChartData = [
      { name: 'LivrÃ©', value: data.logistics.delivered, color: '#10b981' },
      { name: 'RetournÃ©', value: data.logistics.returned, color: '#ef4444' },
      { name: 'En cours', value: Math.max(0, data.logistics.sent - data.logistics.delivered - data.logistics.returned), color: '#3b82f6' }
  ].filter(i => i.value > 0);

  // D. Top/Bottom Lists
  const sortDesc = (arr, key) => [...arr].sort((a,b) => b[key] - a[key]);
  const sortAsc = (arr, key) => [...arr].sort((a,b) => a[key] - b[key]);

  const topProductsSales = sortDesc(data.products, 'sales').slice(0, 3);
  const bottomProductsSales = sortAsc(data.products.filter(p=>p.sales>0), 'sales').slice(0, 3);

  const topEmployeeStats = sortDesc(data.employees.filter(e=>e.parcels>5), 'delRate')[0] || {name: 'Omar Amrani', delRate: 92, parcels: 154};
  const bottomEmployeeStats = sortAsc(data.employees.filter(e=>e.parcels>5), 'delRate')[0] || {name: 'Karim Tazi', delRate: 45, parcels: 28};
  
  // Example data for lists if empty
  const displayTopProducts = topProductsSales.length > 0 ? topProductsSales : [
      {name: 'Parfum Oud', sales: 120}, {name: 'CrÃ©me Visage', sales: 95}, {name: 'Pack Cheveux', sales: 82}
  ];
  const displayBottomProducts = bottomProductsSales.length > 0 ? bottomProductsSales : [
       {name: 'Gel Douche', sales: 12}, {name: 'Savon Noir', sales: 8}, {name: 'Huile Argan', sales: 5}
  ];


  return (
    <div className="w-full min-h-screen bg-transparent p-6 space-y-8 animate-[fade-in_0.6s_ease-out] dark:text-slate-200">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-transparent p-6 rounded-3xl border border-slate-100/50">
            <div>
                <h1 className="text-2xl font-extrabold text-[#1d4ed8]">Tableau de Bord Global</h1>
                <p className="text-slate-500">Vue d'ensemble des performances opÃ©rationnelles</p>
            </div>
            <div className="flex gap-3 mt-4 sm:mt-0">
                <button onClick={generateDashboardData} className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-[#2563EB] rounded-xl hover:bg-slate-100 transition-colors font-bold border border-slate-200">
                    <RotateCw size={18} />
                    <span>Actualiser</span>
                </button>
            </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
             <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
                {/* Date From */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Calendar size={12}/> Date DÃ©but</label>
                    <input 
                        type="date" 
                        value={dateFrom} 
                        onChange={e => setDateFrom(e.target.value)}
                        className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 text-sm font-semibold transition-all text-slate-600 w-full" 
                    />
                </div>
                {/* Date To */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Calendar size={12}/> Date Fin</label>
                    <input 
                        type="date" 
                        value={dateTo} 
                        onChange={e => setDateTo(e.target.value)}
                        className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 text-sm font-semibold transition-all text-slate-600 w-full" 
                    />
                </div>
                {/* Employee */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><User size={12}/> EmployÃ©</label>
                    <div className="relative">
                        <select 
                            value={selectedEmployee} 
                            onChange={e => setSelectedEmployee(e.target.value)}
                            className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 text-sm font-semibold text-slate-600 appearance-none cursor-pointer transition-all shadow-sm"
                        >
                            <option value="All">Tous les employÃ©s</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.name}>{emp.name}</option>
                            ))}
                        </select>
                        <User className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                    </div>
                </div>
                {/* Product */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Package size={12}/> Produit</label>
                    <div className="relative">
                        <select 
                            value={selectedProduct} 
                            onChange={e => setSelectedProduct(e.target.value)}
                            className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 text-sm font-semibold text-slate-600 appearance-none cursor-pointer transition-all shadow-sm"
                        >
                            <option value="All">Tous les produits</option>
                            {products.map(p => (
                                <option key={p.id} value={p.nom}>{p.nom}</option>
                            ))}
                        </select>
                        <Package className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                    </div>
                </div>
                {/* Business */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Briefcase size={12}/> Business</label>
                    <div className="relative">
                        <select 
                            value={selectedBusiness} 
                            onChange={e => setSelectedBusiness(e.target.value)}
                            className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 text-sm font-semibold text-slate-600 appearance-none cursor-pointer transition-all shadow-sm"
                        >
                            <option value="All">Tous les business</option>
                            {businesses.map(b => (
                                <option key={b.id} value={b.name}>{b.name}</option>
                            ))}
                        </select>
                        <Briefcase className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                    </div>
                </div>
             </div>
        </div>

        {/* 1. MARKETING */}
        <Section title="Marketing" icon={Megaphone}>


            {/* Trading-Style Market Tracker */}
            <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp size={18} className="text-[#2563EB]" />
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Market Tracker 30J</h3>
                        </div>
                        <p className="text-xs text-slate-500">Analyse temporelle des KPIs Marketing</p>
                    </div>
                    {/* Live Badge */}
                    <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black tracking-wider flex items-center gap-2 border border-green-100">
                        <span className="relative flex h-2 w-2">
                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                           <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        MARKET OPEN
                    </div>
                </div>

                <div className="w-full h-[400px]">
                   <Chart key={isDarkMode ? 'dark' : 'light'}
                        options={{
                            chart: {
                                type: 'area', 
                                height: 400,
                                fontFamily: 'Inter, sans-serif',
                                toolbar: { show: false },
                                zoom: { enabled: false },
                                background: 'transparent'
                            },
                            theme: { mode: isDarkMode ? 'dark' : 'light' },
                            colors: ['#2563EB', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'],
                            stroke: {
                                curve: 'smooth',
                                width: 2,
                                dashArray: [0, 0, 0, 5, 0] 
                            },
                            fill: {
                                type: 'gradient',
                                gradient: {
                                    shadeIntensity: 1,
                                    inverseColors: false,
                                    opacityFrom: 0.45,
                                    opacityTo: 0.05,
                                    stops: [20, 100]
                                }
                            },
                            dataLabels: { enabled: false },
                            grid: {
                                borderColor: isDarkMode ? '#334155' : '#f1f5f9',
                                strokeDashArray: 3,
                                xaxis: { lines: { show: true } },
                                yaxis: { lines: { show: true } },
                            },
                            xaxis: {
                                categories: (data.marketing.history || []).map(h => h.day),
                                axisBorder: { show: false },
                                axisTicks: { show: false },
                                tickAmount: 10,
                                labels: {
                                    style: { colors: isDarkMode ? '#cbd5e1' : '#94a3b8', fontSize: '10px', fontFamily: 'monospace' }
                                }
                            },
                            yaxis: [
                                {
                                    // Primary Axis: Amount (DH) & Volume
                                    title: { text: "Volume (DH / Qté)", style: { color: isDarkMode ? '#94a3b8' : '#94a3b8', fontSize: '10px' } },
                                    labels: {
                                        style: { colors: isDarkMode ? '#cbd5e1' : '#64748b', fontSize: '10px', fontFamily: 'monospace' },
                                        formatter: (val) => val >= 1000 ? (val/1000).toFixed(1) + 'k' : val.toFixed(0)
                                    }
                                },
                                {
                                    // Secondary Axis: Unit Costs (Small numbers)
                                    opposite: true,
                                    title: { text: "Coût Unitaire (DH)", style: { color: isDarkMode ? '#94a3b8' : '#94a3b8', fontSize: '10px' } },
                                    labels: {
                                        style: { colors: isDarkMode ? '#cbd5e1' : '#64748b', fontSize: '10px', fontFamily: 'monospace' },
                                        formatter: (val) => val.toFixed(1)
                                    }
                                }
                            ],
                            legend: {
                                position: 'top',
                                horizontalAlign: 'right',
                                fontFamily: 'Inter, sans-serif',
                                fontWeight: 600,
                                labels: { colors: isDarkMode ? '#cbd5e1' : '#64748b' }
                            },
                            tooltip: {
                                theme: 'dark',
                                style: { fontSize: '12px', fontFamily: 'Inter, sans-serif' },
                                x: { show: true, format: 'dd MMM' },
                                y: { formatter: (val) => val.toFixed(2) },
                                marker: { show: true },
                            }
                        }}
                        series={[
                            {
                                name: 'Dépenses (DH)',
                                type: 'area',
                                data: (data.marketing.history || []).map(h => h.spend)
                            },
                            {
                                name: 'Messages',
                                type: 'area',
                                data: (data.marketing.history || []).map(h => h.messages)
                            },
                            {
                                name: 'CPA (DH)',
                                type: 'line',
                                data: (data.marketing.history || []).map(h => h.cpa),
                                yAxisIndex: 1
                            },
                            {
                                name: 'CPL (DH)',
                                type: 'line',
                                data: (data.marketing.history || []).map(h => h.cpl),
                                yAxisIndex: 1
                            },
                            {
                                name: 'Coût/Msg (DH)',
                                type: 'line',
                                data: (data.marketing.history || []).map(h => h.costMsg),
                                yAxisIndex: 1
                            }
                        ]}
                        type="area"
                        height="100%"
                   />
                </div>
            </div>
        </Section>

        {/* 2. CONFIRMATION */}
        <Section title="Confirmation & Livraison" icon={CheckCircle}>


            {/* Advanced Visualization Grid: Funnel + Time Series */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Funnel Visualization */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div className="mb-4">
                         <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Entonnoir de Vente</h3>
                         <p className="text-xs text-slate-500">Flux de conversion (Leads → Livrés)</p>
                    </div>

                    <div className="space-y-4 relative">
                        {/* Step 1: Leads */}
                        <div className="relative z-10">
                            <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                                <span>TOTAL COMMANDES</span>
                                <span>100%</span>
                            </div>
                            <div className="h-12 bg-slate-50 rounded-xl border border-slate-100 flex items-center px-4 relative overflow-hidden group">
                                <div className="absolute left-0 top-0 bottom-0 bg-slate-200/50 w-full rounded-xl -z-10"></div>
                                <span className="font-black text-lg text-slate-700">{num(data.confirmation.totalLeads)}</span>
                            </div>
                        </div>

                        {/* Connector */}
                        <div className="flex justify-center -my-2 relative z-0">
                           <div className="w-0.5 h-6 bg-slate-300"></div>
                        </div>

                        {/* Step 2: Confirmed */}
                        <div className="relative z-10">
                             <div className="flex justify-between text-xs font-bold text-[#2563EB] mb-1">
                                <span>CONFIRMÉES</span>
                                <span>{Math.round(data.confirmation.confRate)}%</span>
                            </div>
                            <div className="h-12 bg-blue-50 rounded-xl border border-blue-100 flex items-center px-4 relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 bg-[#2563EB]/10 w-[width-based-on-rate] rounded-xl -z-10" style={{width: `${data.confirmation.confRate}%`}}></div>
                                <span className="font-black text-lg text-[#2563EB]">{num(data.confirmation.confirmed)}</span>
                            </div>
                        </div>

                         {/* Connector */}
                        <div className="flex justify-center -my-2 relative z-0">
                           <div className="w-0.5 h-6 bg-slate-300"></div>
                        </div>

                        {/* Step 3: Delivered */}
                        <div className="relative z-10">
                             <div className="flex justify-between text-xs font-bold text-[#10b981] mb-1">
                                <span>LIVRÉES</span>
                                <span>{Math.round((data.confirmation.delivered / data.confirmation.totalLeads) * 100)}% Global</span>
                            </div>
                            <div className="h-12 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center px-4 relative overflow-hidden">
                                <span className="font-black text-lg text-[#10b981]">{num(data.confirmation.delivered)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Time-Series Tracking (Trading Style) */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
                     <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Performance Temporelle</h3>
                            <p className="text-xs text-slate-500">Confirmations vs Livraisons (30 Jours)</p>
                        </div>
                    </div>
                    
                    <div className="w-full h-[300px]">
                        <Chart key={isDarkMode ? 'dark' : 'light'} 
                            options={{
                                chart: { 
                                    type: 'area', 
                                    fontFamily: 'Inter, sans-serif', 
                                    toolbar: { show: false },
                                    zoom: { enabled: false },
                                    background: 'transparent'
                                },
                                theme: { mode: isDarkMode ? 'dark' : 'light' },
                                colors: ['#2563EB', '#10b981'], 
                                fill: {
                                    type: 'gradient',
                                    gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1, stops: [0, 100] }
                                },
                                stroke: { curve: 'smooth', width: 3 },
                                dataLabels: { enabled: false },
                                grid: { borderColor: isDarkMode ? '#334155' : '#f1f5f9', strokeDashArray: 3 },
                                xaxis: {
                                    categories: (data.confirmation.history || []).map(h => h.day),
                                    labels: { show: false },
                                    tooltip: { enabled: false },
                                    axisBorder: { show: false },
                                    axisTicks: { show: false }
                                },
                                yaxis: {
                                    labels: { style: { colors: isDarkMode ? '#cbd5e1' : '#64748b', fontSize: '10px' } }
                                },
                                legend: { position: 'top', horizontalAlign: 'right', labels: { colors: isDarkMode ? '#cbd5e1' : '#64748b' } },
                                tooltip: { 
                                    theme: 'dark',
                                    style: { fontSize: '12px', fontFamily: 'Inter, sans-serif' },
                                    x: { show: true },
                                    marker: { show: true }
                                }
                            }}
                            series={[
                                { name: 'Confirmées', data: (data.confirmation.history || []).map(h => h.confirmed) },
                                { name: 'Livrées', data: (data.confirmation.history || []).map(h => h.delivered) }
                            ]}
                            type="area"
                            height="100%"
                        />
                    </div>
                </div>
            </div>
        </Section>

        {/* 3. STOCK */}
        {/* 3. STOCK & LOGISTICS */}
        <Section title="Stock & Logistique" icon={Box}>
             


             {/* B) Advanced Visualizations Grid */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 
                 {/* 1. Inventory Distribution (Donut) */}
                 <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
                    <div className="mb-4">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Distribution du Stock</h3>
                        <p className="text-xs text-slate-500">Répartition actuelle de l'inventaire</p>
                    </div>
                    <div className="flex-1 min-h-[250px] relative">
                        <Chart key={isDarkMode ? 'dark' : 'light'} 
                            options={{
                                chart: { type: 'donut', fontFamily: 'Inter, sans-serif', background: 'transparent' },
                                theme: { mode: isDarkMode ? 'dark' : 'light' },
                                labels: ['Restant', 'Livré', 'Retourné', 'Traitement'],
                                colors: ['#cbd5e1', '#10b981', '#ef4444', '#6366f1'],
                                plotOptions: {
                                    pie: { donut: { size: '75%', labels: { show: true, total: { show: true, label: 'Total', fontSize: '12px', color: isDarkMode ? '#cbd5e1' : '#64748b' } } } }
                                },
                                dataLabels: { enabled: false },
                                legend: { position: 'bottom', fontSize: '12px', labels: { colors: isDarkMode ? '#cbd5e1' : '#64748b' } },
                                stroke: { show: false },
                                tooltip: { 
                                    theme: 'dark',
                                    style: { fontSize: '12px', fontFamily: 'Inter, sans-serif' }
                                }
                            }}
                            series={[
                                data.stock.stockRest, 
                                data.stock.delivered, 
                                data.stock.returns, 
                                data.stock.pending
                            ]}
                            type="donut"
                            height="100%"
                        />
                    </div>
                 </div>

                 {/* 2. Operational Flow Time-Series (Trading Style) */}
                 <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
                     <div className="flex justify-between items-start mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Activity size={18} className="text-indigo-600" />
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Flux Opérationnel (30J)</h3>
                            </div>
                            <p className="text-xs text-slate-500">Évolution quotidienne des mouvements</p>
                        </div>
                        {/* Live Indicator */}
                         <div className="flex items-center gap-2">
                             <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                             </span>
                             <span className="text-[10px] font-bold text-indigo-500">LIVE OPS</span>
                        </div>
                    </div>
                    
                    <div className="w-full h-[300px]">
                        <Chart 
                            options={{
                                chart: { 
                                    type: 'area', 
                                    fontFamily: 'Inter, sans-serif', 
                                    toolbar: { show: false },
                                    zoom: { enabled: false },
                                    stacked: false,
                                    background: 'transparent'
                                },
                                theme: { mode: isDarkMode ? 'dark' : 'light' },
                                colors: ['#10b981', '#ef4444', '#6366f1'], 
                                fill: {
                                    type: 'gradient',
                                    gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0.1, stops: [0, 100] }
                                },
                                stroke: { curve: 'smooth', width: 2 },
                                dataLabels: { enabled: false },
                                grid: { borderColor: isDarkMode ? '#334155' : '#f1f5f9', strokeDashArray: 3 },
                                xaxis: {
                                    categories: (data.stock.history || []).map(h => h.day),
                                    labels: { show: false },
                                    axisBorder: { show: false },
                                    axisTicks: { show: false }
                                },
                                yaxis: {
                                    labels: { style: { colors: isDarkMode ? '#cbd5e1' : '#64748b', fontSize: '10px' } }
                                },
                                legend: { position: 'top', horizontalAlign: 'right', labels: { colors: isDarkMode ? '#cbd5e1' : '#64748b' } },
                                tooltip: { 
                                    theme: 'dark',
                                    style: { fontSize: '12px', fontFamily: 'Inter, sans-serif' },
                                    marker: { show: true }
                                }
                            }}
                            series={[
                                { name: 'Livrés', data: (data.stock.history || []).map(h => h.delivered) },
                                { name: 'Retours', data: (data.stock.history || []).map(h => h.returned) },
                                { name: 'En Traitement', data: (data.stock.history || []).map(h => h.pending) }
                            ]}
                            type="area"
                            height="100%"
                        />
                    </div>
                 </div>

                 {/* 3. Productivity Gauge (Bonus/Embedded) */}
                 {/* This could be integrated or added as a separate card. Let's add it as a small card below the Donut if needed, 
                     but the grid is full. I'll add it as a 3rd item in a new row OR integrate "Moyenne/Jour" prominent card.
                     
                     Actually, the prompt asked for separate visual. I'll add a Productivity Card separate.
                 */}
             </div>
             
             {/* C) Operational Efficiency & Packaging */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <SpotlightCard theme="light" className="flex items-center justify-between">
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Productivité (Envois/Jour)</h4>
                        <div className="flex items-baseline gap-2">
                             <span className="text-3xl font-black text-slate-800">{data.stock.avgSend}</span>
                             <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+12% vs Target</span>
                        </div>
                    </div>
                    <div className="h-16 w-16">
                         <Chart key={isDarkMode ? 'dark' : 'light'} 
                            options={{
                                chart: { type: 'radialBar', sparkline: { enabled: true }, background: 'transparent' },
                                theme: { mode: isDarkMode ? 'dark' : 'light' },
                                plotOptions: { 
                                    radialBar: { 
                                        hollow: { size: '50%' }, 
                                        track: { background: isDarkMode ? '#334155' : '#f1f5f9' }, 
                                        dataLabels: { show: false } 
                                    } 
                                },
                                colors: ['#6366f1'], stroke: { lineCap: 'round' },
                                tooltip: { theme: 'dark' }
                            }}
                            series={[75]} // Mock target percentage
                            type="radialBar" height="100%" width="100%"
                         />
                    </div>
                </SpotlightCard>

                <SpotlightCard theme="light" className="md:col-span-2 flex flex-col justify-center">
                     <div className="flex justify-between items-center mb-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">État des Emballages</h4>
                        <span className="text-xs font-bold text-slate-500">{num(data.stock.packaging)} Unités</span>
                     </div>
                     <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-slate-400 to-slate-600 rounded-full" 
                            style={{ width: `${Math.min((data.stock.packaging / 5000) * 100, 100)}%` }} // Assuming 5000 goal
                        ></div>
                     </div>
                     <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-mono">
                         <span>0</span>
                         <span>Critique (&lt;100)</span>
                         <span>Objectif: 5000</span>
                     </div>
                </SpotlightCard>
             </div>
        </Section>

        {/* 4. LIVRAISONS */}
        <Section title="Performances Livraison" icon={Truck}>

            {/* 1. Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                 {/* Revenue - Prominent */}
                 <div className="md:col-span-1 bg-[#2563EB] rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden group">
                     <div className="absolute right-0 top-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform">
                         <DollarSign size={100} />
                     </div>
                     <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">Chiffre d'Affaires</p>
                     <h3 className="text-4xl font-black mb-4">{fmt(data.delivery.revenue)} <span className="text-lg font-bold text-blue-200">DH</span></h3>
                     <div className="flex items-center gap-2 text-sm text-blue-100 font-medium bg-white/10 w-fit px-3 py-1 rounded-full">
                         <TrendingUp size={14} />
                         <span>+15% ce mois</span>
                     </div>
                 </div>

                 {/* Volume Metrics */}
                 <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-center">
                     <div className="flex items-center gap-3 mb-2">
                         <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><Package size={20} /></div>
                         <span className="text-slate-500 font-bold text-xs uppercase tracking-wide">Colis Livrés</span>
                     </div>
                     <span className="text-3xl font-black text-slate-800">{num(data.delivery.totalParcels)}</span>
                     <span className="text-xs text-slate-400 mt-1">Colis validés et payés</span>
                 </div>

                 <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-center">
                     <div className="flex items-center gap-3 mb-2">
                         <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Layers size={20} /></div>
                         <span className="text-slate-500 font-bold text-xs uppercase tracking-wide">Pièces Livrées</span>
                     </div>
                     <span className="text-3xl font-black text-slate-800">{num(data.delivery.totalPieces)}</span>
                     <span className="text-xs text-slate-400 mt-1">Unités individuelles</span>
                 </div>
            </div>

            {/* 2. Advanced Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* A) Revenue & Volume Tracking (Time-based) */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                             <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Évolution Revenus & Volume</h3>
                             <p className="text-xs text-slate-500">30 derniers jours</p>
                        </div>
                   </div>
                   <div className="h-[320px]">
                       <Chart key={isDarkMode ? 'dark' : 'light'}
                            options={{
                                chart: { type: 'line', toolbar: { show: false }, fontFamily: 'Inter, sans-serif', background: 'transparent' },
                                theme: { mode: isDarkMode ? 'dark' : 'light' },
                                stroke: { curve: 'smooth', width: [3, 2] },
                                colors: ['#2563EB', '#10b981'],
                                fill: { type: ['gradient', 'solid'], gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.05, stops: [0, 100] } },
                                dataLabels: { enabled: false },
                                xaxis: { 
                                    categories: (data.delivery.history || []).map(h => h.day),
                                    labels: { show: false },
                                    axisBorder: { show: false },
                                    axisTicks: { show: false }
                                },
                                yaxis: [
                                    { title: { text: "Revenus (DH)", style: { fontSize: '10px', color: isDarkMode ? '#cbd5e1' : '#64748b' } }, labels: { style: { colors: isDarkMode ? '#cbd5e1' : '#64748b' }, formatter: val => val >= 1000 ? (val/1000).toFixed(1)+'k' : val } },
                                    { opposite: true, title: { text: "Colis", style: { fontSize: '10px', color: isDarkMode ? '#cbd5e1' : '#64748b' } }, labels: { style: { colors: isDarkMode ? '#cbd5e1' : '#64748b' } } }
                                ],
                                legend: { position: 'top', labels: { colors: isDarkMode ? '#cbd5e1' : '#64748b' } },
                                grid: { borderColor: isDarkMode ? '#334155' : '#f1f5f9' },
                                tooltip: { 
                                    theme: 'dark',
                                    style: { fontSize: '12px', fontFamily: 'Inter, sans-serif' },
                                    y: { formatter: (val) => typeof val === 'number' ? val.toFixed(2) : val }
                                }
                            }}
                            series={[
                                { name: 'Chiffre d\'Affaires (DH)', type: 'area', data: (data.delivery.history || []).map(h => h.revenue) },
                                { name: 'Colis Livrés', type: 'line', data: (data.delivery.history || []).map(h => h.parcels) }
                            ]}
                            type="line"
                            height="100%"
                        />
                   </div>
                </div>

                {/* B) Average Value Analysis */}
                <div className="flex flex-col gap-6">
                    {/* Bar Chart: Averages */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex-1">
                         <div className="mb-4">
                             <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Valeurs Moyennes</h3>
                             <p className="text-xs text-slate-500">Panier vs Unité (DH)</p>
                        </div>
                        <div className="h-[200px]">
                            <Chart key={isDarkMode ? 'dark' : 'light'} 
                                options={{
                                    chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'Inter, sans-serif', background: 'transparent' },
                                    theme: { mode: isDarkMode ? 'dark' : 'light' },
                                    plotOptions: { bar: { borderRadius: 6, columnWidth: '50%', distributed: true } },
                                    colors: ['#3b82f6', '#8b5cf6', '#10b981'],
                                    dataLabels: { enabled: true, formatter: val => `${val} DH`, style: { fontSize: '10px', colors: [isDarkMode ? '#cbd5e1' : '#1e293b'] }, offsetY: -20, replaceUndefined: false },
                                    xaxis: { categories: ['Panier Moyen', 'Prix/Colis', 'Prix/Pièce'], labels: { style: { fontSize: '10px', fontWeight: 600, colors: isDarkMode ? '#cbd5e1' : '#64748b' } }, axisBorder: {show:false}, axisTicks:{show:false} },
                                    yaxis: { show: false },
                                    grid: { show: false },
                                    legend: { show: false },
                                    tooltip: { theme: 'dark' }
                                }}
                                series={[{ name: 'Valeur', data: [data.delivery.avgCart, data.delivery.avgParcelPrice, data.delivery.avgPiecePrice] }]}
                                type="bar"
                                height="100%"
                            />
                        </div>
                    </div>

                    {/* Simple Contribution Stat */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                        <div className="flex justify-between items-center mb-2">
                             <h4 className="text-xs font-bold text-slate-500 uppercase">Contribution / Colis</h4>
                             <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">High Value</span>
                        </div>
                        <p className="text-sm text-slate-600 leading-snug">
                            Chaque colis génère en moyenne <span className="font-black text-slate-800">{fmt(data.delivery.avgCart)} DH</span> de revenu.
                        </p>
                    </div>
                </div>

            </div>
        </Section>

        {/* 5. RECHARGES */}
        <Section title="Recharges & Frais" icon={CreditCard}>
             <SpotlightCard theme="light">
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                    <div className="p-4 rounded-xl bg-slate-50">
                        <p className="text-slate-500 text-xs font-bold uppercase">Achat Solde ($)</p>
                        <p className="text-xl font-black text-[#2563EB] mt-1">{fmt(data.recharge.rechUSD)} $</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50">
                        <p className="text-slate-500 text-xs font-bold uppercase">Taux de Change</p>
                        <p className="text-xl font-black text-slate-700 mt-1">{data.recharge.exchRate}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50">
                        <p className="text-slate-500 text-xs font-bold uppercase">Nombre Recharges</p>
                        <p className="text-xl font-black text-slate-700 mt-1">{data.recharge.rechCount}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50">
                        <p className="text-slate-500 text-xs font-bold uppercase">Total (DH)</p>
                        <p className="text-xl font-black text-[#2563EB] mt-1">{fmt(data.recharge.totalRech)} DH</p>
                    </div>
                 </div>
             </SpotlightCard>
        </Section>

        {/* 6. PERFORMANCE OVERVIEW (Dark Mode Widget) */}
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-[#2563EB] rounded-lg text-white shadow-lg shadow-[#2563EB]/30">
                    <Award size={20} />
                </div>
                <div>
                     <h2 className="text-lg font-bold text-slate-800">AperÃ§u des Performances</h2>
                     <p className="text-[10px] font-medium text-slate-500 font-arabic">Ù†Ø¸Ø±Ø© Ø¹Ø§Ù…Ø© Ø¹Ù„Ù‰ Ø§Ù„Ø£Ø¯Ø§Ø¡</p>
                </div>
            </div>

            {/* Section 1: Product Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* Sales & Revenue Card */}
                <SpotlightCard theme="dark" className="bg-[#2563EB]! border-[#1d4ed8]! text-white shadow-xl shadow-[#2563EB]/20 p-5!">
                    <div className="mb-4">
                        <h3 className="text-base font-bold text-white mb-0.5">Performance Produit</h3>
                        <p className="text-[10px] text-white/70 font-arabic">Ø£Ø¯Ø§Ø¡ Ø§Ù„Ù…Ù†ØªØ¬</p>
                    </div>
                    
                    <div className="space-y-5">
                        {/* Top 3 */}
                        <div>
                            <div className="mb-2">
                                <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest flex items-center gap-2">
                                    <TrendingUp size={12} /> Meilleures Ventes
                                </p>
                            </div>
                            <div className="space-y-2">
                                {displayTopProducts.map((p, i) => (
                                    <div key={i} className="relative">
                                        <div className="flex justify-between text-[10px] mb-1">
                                            <span className="text-white font-medium">{p.name}</span>
                                            <div className="text-right flex items-baseline gap-1">
                                                <span className="text-white font-bold">{num(p.sales)}</span>
                                                <span className="text-[8px] text-white/80 font-arabic">Ù…Ø¨ÙŠØ¹Ø§Øª</span>
                                            </div>
                                        </div>
                                        <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]" 
                                                style={{ width: `${Math.min((p.sales / (displayTopProducts[0]?.sales || 1)) * 100, 100)}%` }} 
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bottom 3 */}
                        <div>
                            <div className="mb-2">
                                <p className="text-[10px] font-bold text-rose-100 uppercase tracking-widest flex items-center gap-2">
                                    <TrendingDown size={12} /> Moins Performants
                                </p>
                            </div>
                            <div className="space-y-2">
                                {displayBottomProducts.map((p, i) => (
                                    <div key={i} className="relative">
                                        <div className="flex justify-between text-[10px] mb-1">
                                            <span className="text-white font-medium">{p.name}</span>
                                            <div className="text-right flex items-baseline gap-1">
                                                <span className="text-rose-100 font-bold">{num(p.sales)}</span>
                                                <span className="text-[8px] text-white/80 font-arabic">Ù…Ø¨ÙŠØ¹Ø§Øª</span>
                                            </div>
                                        </div>
                                        <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-rose-300 shadow-[0_0_8px_rgba(253,164,175,0.6)]" 
                                                style={{ width: `${Math.max((p.sales / (displayTopProducts[0]?.sales || 1)) * 100, 5)}%` }} 
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </SpotlightCard>
 {/* Performance Rates Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8">
             <h3 className="text-lg font-bold text-[#1e3a8a] mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                AperÃ§u des Performances
             </h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Best Rate */}
                <div className="relative pt-2">
                   <div className="flex justify-between items-end mb-2">
                      <div>
                         <div className="flex items-center gap-2 mb-1">
                            <span className="p-1 bg-blue-100 rounded text-blue-600"><TrendingUp size={14} /></span>
                            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Meilleur Taux (Ø£Ø¹Ù„Ù‰ Ù†Ø³Ø¨Ø©)</span>
                         </div>
                         <div className="font-bold text-slate-800 text-xl">Pack SantÃ©</div>
                      </div>
                      <div className="text-3xl font-black text-blue-600">88%</div>
                   </div>
                   <div className="w-full h-6 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                      <div className="h-full bg-linear-to-r from-blue-400 to-blue-600 rounded-full shadow-sm" style={{ width: '88%' }}></div>
                   </div>
                </div>

                {/* Lowest Rate */}
                <div className="relative pt-2">
                   <div className="flex justify-between items-end mb-2">
                      <div>
                         <div className="flex items-center gap-2 mb-1">
                            <span className="p-1 bg-red-100 rounded text-red-600"><TrendingDown size={14} /></span>
                            <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Faible Taux (Ø£Ù‚Ù„ Ù†Ø³Ø¨Ø©)</span>
                         </div>
                         <div className="font-bold text-slate-800 text-xl">Montre Luxe</div>
                      </div>
                      <div className="text-3xl font-black text-red-500">12%</div>
                   </div>
                   <div className="w-full h-6 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                      <div className="h-full bg-linear-to-r from-red-400 to-red-600 rounded-full shadow-sm" style={{ width: '12%' }}></div>
                   </div>
                </div>
             </div>
          </div>


            {/* Section 2: Employee Performance */}
            <SpotlightCard theme="dark" className="bg-[#2563EB]! border-[#1d4ed8]! text-white shadow-xl shadow-[#2563EB]/20 p-5!">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8 divide-y md:divide-y-0 md:divide-x divide-white/10">
                    
                    {/* Top Performer */}
                    <div className="flex items-center gap-4 p-2">
                        <div className="relative">
                            <div className="w-14 h-14 rounded-full border-2 border-white shadow-[0_0_15px_rgba(255,255,255,0.4)] overflow-hidden">
                                <div className="w-full h-full bg-white/20 flex items-center justify-center text-lg font-bold text-white">
                                    {(topEmployeeStats.name || 'A').charAt(0)}
                                </div>
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-white text-[#2563EB] text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-lg">
                                #1
                            </div>
                        </div>
                        <div>
                            <div className="mb-1">
                                <p className="text-white/90 font-bold uppercase tracking-widest text-[10px] leading-none">Meilleur EmployÃ©</p>
                                <p className="text-[9px] text-white/70 font-arabic mt-0.5">Ø§Ù„Ø£ÙØ¶Ù„ Ø£Ø¯Ø§Ø¡Ù‹</p>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">{topEmployeeStats.name}</h3>
                            <div className="flex gap-4">
                                <div>
                                    <p className="text-white/70 text-[9px] uppercase">Taux Livr.</p>
                                    <p className="text-white font-bold text-sm">{fmt(topEmployeeStats.delRate)}%</p>
                                    
                                </div>
                                <div>
                                    <p className="text-white/70 text-[9px] uppercase">Colis</p>
                                    <p className="text-white font-bold text-sm">{num(topEmployeeStats.parcels)}</p>
                                   
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Needs Improvement */}
                    <div className="flex items-center gap-4 p-2">
                        <div className="relative">
                            <div className="w-14 h-14 rounded-full border-2 border-rose-300/50 grayscale opacity-80 overflow-hidden">
                                <div className="w-full h-full bg-black/20 flex items-center justify-center text-lg font-bold text-slate-300">
                                    {(bottomEmployeeStats.name || 'B').charAt(0)}
                                </div>
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-rose-400 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                                !
                            </div>
                        </div>
                        <div>
                            <div className="mb-1">
                                <p className="text-rose-200 font-bold uppercase tracking-widest text-[10px] leading-none">Besoin Coaching</p>
                                <p className="text-[9px] text-white/50 font-arabic mt-0.5">ÙŠØ­ØªØ§Ø¬ ØªØ¯Ø±ÙŠØ¨</p>
                            </div>
                            <h3 className="text-lg font-bold text-white/80 mb-2">{bottomEmployeeStats.name}</h3>
                            <div className="flex gap-4">
                                <div>
                                    <p className="text-white/50 text-[9px] uppercase">Taux Livr.</p>
                                    <p className="text-rose-200 font-bold text-sm">{fmt(bottomEmployeeStats.delRate)}%</p>
                                </div>
                                <div>
                                    <p className="text-white/50 text-[9px] uppercase">Colis</p>
                                    <p className="text-white/70 font-bold text-sm">{num(bottomEmployeeStats.parcels)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </SpotlightCard>
        </div>

        {/* 7. BENEFICE NET */}
        <Section title="Bilan Financier" icon={Wallet}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Summary & Donut */}
                <SpotlightCard theme="light" className="lg:col-span-2 flex flex-col md:flex-row gap-6 items-center">
                     <div className="flex-1 space-y-4 w-full">
                         <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                             <span className="font-medium text-slate-600">Chiffre d'Affaires</span>
                             <span className="font-bold text-green-600">+{fmt(data.financial.revenue)} DH</span>
                         </div>
                         <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                             <span className="font-medium text-slate-600">DÃ©penses Totales</span>
                             <span className="font-bold text-red-500">-{fmt(data.financial.salaries + data.financial.adSpend + data.financial.rechDH + data.financial.otherCosts)} DH</span>
                         </div>
                         <div className={`flex justify-between items-center p-4 rounded-xl border-l-4 ${data.financial.netProfit >= 0 ? 'bg-blue-50 border-blue-500' : 'bg-red-50 border-red-500'}`}>
                             <span className="font-bold text-slate-800 text-lg">BÃ©nÃ©fice Net</span>
                             <span className={`font-black text-2xl ${data.financial.netProfit >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                                 {fmt(data.financial.netProfit)} DH
                             </span>
                         </div>
                     </div>
                     <div className="w-full md:w-64 h-64 mt-4 md:mt-0 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={expenseChartData}
                                    cx="50%" cy="50%" innerRadius={60} outerRadius={80}
                                    paddingAngle={5} dataKey="value"
                                >
                                    {expenseChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(val) => `${fmt(val)} DH`} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '11px'}} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-xs font-bold text-slate-400 uppercase">DÃ©penses</span>
                        </div>
                     </div>
                </SpotlightCard>

                {/* Logistics Pie */}
                <SpotlightCard theme="light" className="flex flex-col">
                    <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 text-center">Ã‰tat des Colis</h3>
                    <div className="flex-1 w-full min-h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={logisticsChartData}
                                    cx="50%" cy="50%" innerRadius={0} outerRadius={80}
                                    dataKey="value"
                                >
                                    {logisticsChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </SpotlightCard>
            </div>
        </Section>
    </div>
    </div>
  );
};

// --- Sub Components ---

const Section = ({ title, icon: Icon, children }) => (
    <div className="space-y-4">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-[#2563EB]/10 rounded-lg text-[#2563EB]">
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
            {Icon && <Icon size={18} className="text-[#2563EB]" />}
        </div>
        <div>
            <div className={`text-2xl font-black ${color || 'text-slate-800'}`}>{value}</div>
            {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
        </div>
    </SpotlightCard>
);

const ProgressCard = ({ label, value, total, rate, color, icon: Icon }) => (
   <SpotlightCard theme="light" className="flex items-center justify-between">
      <div>
         <div className="flex items-center gap-2 mb-1">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</span>
         </div>
         <div className="text-2xl font-black text-slate-800">{value}</div>
         <div className="text-xs text-slate-400 mt-1">Sur {total} total</div>
      </div>
      <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
         {/* Simple circular progress simulation using SVG */}
         <svg className="w-full h-full transform -rotate-90">
             <circle cx="32" cy="32" r="28" stroke="#e2e8f0" strokeWidth="4" fill="transparent" />
             <circle 
                cx="32" cy="32" r="28" 
                stroke={color} strokeWidth="4" fill="transparent"
                strokeDasharray={175} 
                strokeDashoffset={175 - (175 * rate) / 100}
                strokeLinecap="round"
             />
         </svg>
         <div className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{color}}>
             {Math.round(rate)}%
         </div>
      </div>
   </SpotlightCard>
);

const SimpleTable = ({ headers, rows }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                    {headers.map((h, i) => <th key={i} className={`py-2 px-3 ${i===0?'text-left':'text-right'}`}>{h}</th>)}
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {rows.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                        {row.map((cell, j) => (
                            <td key={j} className={`py-2.5 px-3 ${j===0?'text-left font-semibold text-slate-700':'text-right font-mono text-slate-600'}`}>{cell}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default GlobalDashboard;

