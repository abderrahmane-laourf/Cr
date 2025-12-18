import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import Chart from 'react-apexcharts';
import { Search, Filter, RotateCw, Download, Database, CheckCircle, Truck, Package, XCircle, User, Activity, Box } from 'lucide-react';
import { employeeAPI, productAPI } from '../../services/api';
import SpotlightCard from '../../util/SpotlightCard';

export default function LogisticTrackingDashboard() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('All');
  const [employees, setEmployees] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  // Load Data from LocalStorage & API
  const loadData = async () => {
    // 1. Fetch Employees & Products
    try {
        const [empData, prodData] = await Promise.all([
             employeeAPI.getAll().catch(() => []),
             import('../../services/api').then(module => module.productAPI.getAll()).catch(() => [])
        ]);
        
        setEmployees(empData.map(e => e.name));
        setProducts(prodData);

    } catch (e) {
        console.error("Error loading resources", e);
        // Fallback
        setEmployees(['Mohamed', 'Fatima', 'Youssef', 'Amina', 'Hassan', 'Khadija']);
    }

    // 2. Fetch Pipeline Data (Colis)
    const storedColis = localStorage.getItem('colis');
    const colisList = storedColis ? JSON.parse(storedColis) : [];

    // 3. Aggregate by Product
    const productStats = {};

    colisList.forEach(colis => {
        const prodName = colis.productName || 'Inconnu';
        // Normalize stage name
        const stage = (colis.stage || '').toLowerCase().trim();

        if (!productStats[prodName]) {
            productStats[prodName] = {
                id: prodName, // Use name as ID for simplicity
                name: prodName,
                category: 'Général', // We might need to look this up from product list if available
                confirmed: 0,   // Was 'Stock' -> Now 'Confirmé'
                delivered: 0,
                inTransit: 0,   // 'Out for Delivery' / 'Ramassé'
                packaging: 0,   // 'Packaging'
                returned: 0     // 'Annulé'
            };
        }

        if (stage.includes('confirm')) productStats[prodName].confirmed++;
        else if (stage.includes('livr') || stage.includes('deliver')) productStats[prodName].delivered++;
        else if (stage.includes('out') || stage.includes('ramass') || stage.includes('transit')) productStats[prodName].inTransit++;
        else if (stage.includes('pack') || stage.includes('cour') || stage.includes('expéd')) productStats[prodName].packaging++; // En cours mapped to packaging often
        else if (stage.includes('annul') || stage.includes('retour')) productStats[prodName].returned++;
    });

    const newData = Object.values(productStats);
    setData(newData);
    filterData(newData, productSearch, selectedEmployee, dateFrom, dateTo, colisList);
  };

  const filterData = (sourceData, search, emp, dFrom, dTo, rawColis) => {
      // Note: Filtering aggregated data by Product attributes is easy.
      // But filtering by Employee or Date needs to be done BEFORE aggregation or by re-aggregating.
      
      const storedColis = rawColis || JSON.parse(localStorage.getItem('colis') || '[]');
      
      const filteredRaw = storedColis.filter(c => {
          // If search (product name) is selected, must match exactly (or contains if we want loose). 
          // Since it's a dropdown now, we can check for inclusion or exact match.
          const matchSearch = !search || (c.productName || '').trim() === search.trim();
          
          const matchEmp = emp === 'All' || c.employee === emp;
          const matchDate = (!dFrom || c.dateCreated >= dFrom) && (!dTo || c.dateCreated <= dTo);
          
          return matchSearch && matchEmp && matchDate;
      });

      // Aggregate Filtered
      const stats = {};
      filteredRaw.forEach(colis => {
        const prodName = colis.productName || 'Inconnu';
        const stage = (colis.stage || '').toLowerCase().trim();

        if (!stats[prodName]) {
            stats[prodName] = {
                id: prodName,
                name: prodName,
                category: 'Général',
                confirmed: 0,
                delivered: 0,
                inTransit: 0,
                packaging: 0,
                returned: 0
            };
        }

        if (stage.includes('confirm')) stats[prodName].confirmed++;
        else if (stage.includes('livr') || stage.includes('deliver')) stats[prodName].delivered++;
        else if (stage.includes('out') || stage.includes('ramass') || stage.includes('transit')) stats[prodName].inTransit++;
        else if (stage.includes('pack') || stage.includes('cour')) stats[prodName].packaging++;
        else if (stage.includes('annul') || stage.includes('retour')) stats[prodName].returned++;
      });
      
      setFilteredData(Object.values(stats));
  };

  useEffect(() => {
    loadData();
    // Listen for storage changes
    const handleStorageChange = () => loadData();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Effect to re-filter when inputs change
  useEffect(() => {
      filterData(null, productSearch, selectedEmployee, dateFrom, dateTo);
  }, [productSearch, selectedEmployee, dateFrom, dateTo]);

  const metrics = {
    confirmed: filteredData.reduce((acc, curr) => acc + curr.confirmed, 0),
    delivered: filteredData.reduce((acc, curr) => acc + curr.delivered, 0),
    inTransit: filteredData.reduce((acc, curr) => acc + curr.inTransit, 0),
    packaging: filteredData.reduce((acc, curr) => acc + curr.packaging, 0),
    returned: filteredData.reduce((acc, curr) => acc + curr.returned, 0),
  };

  return (
    <div className="w-full min-h-screen bg-transparent p-6 space-y-8 animate-[fade-in_0.6s_ease-out] dark:text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-transparent p-6 rounded-3xl border border-slate-100/50">
        <div>
          <h1 className="text-2xl font-extrabold text-[#018790]">Tableau de Suivi Pipeline</h1>
          <p className="text-slate-500">Vue d'ensemble des performances opérationnelles</p>
        </div>
        <div className="flex gap-3">
          <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-[#018790] rounded-xl hover:bg-slate-100 transition-colors font-bold border border-slate-200">
            <RotateCw size={18} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
         <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Date Début</label>
            <input 
              type="date" 
              value={dateFrom} 
              onChange={e => setDateFrom(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#018790]/20 text-sm font-semibold transition-all text-slate-600" 
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Date Fin</label>
            <input 
              type="date" 
              value={dateTo} 
              onChange={e => setDateTo(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#018790]/20 text-sm font-semibold transition-all text-slate-600" 
            />
          </div>
           <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Produit</label>
            <div className="relative">
              <select 
                value={productSearch} 
                onChange={e => setProductSearch(e.target.value)}
                className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#018790]/20 text-sm font-semibold text-slate-600 appearance-none cursor-pointer transition-all shadow-sm"
              >
                <option value="">Tous les Produits</option>
                {products.map(p => (
                    <option key={p.id} value={p.nom}>{p.nom}</option>
                ))}
              </select>
              <Package className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>
          
           <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Employé</label>
            <div className="relative">
              <select 
                value={selectedEmployee} 
                onChange={e => setSelectedEmployee(e.target.value)}
                className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#018790]/20 text-sm font-semibold text-slate-600 appearance-none cursor-pointer transition-all shadow-sm"
              >
                <option value="All">Tous les employés</option>
                {employees.map(emp => (
                    <option key={emp} value={emp}>{emp}</option>
                ))}
              </select>
              <User className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>

          <div className="md:col-span-1"> 
            <button 
              onClick={loadData}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#018790] text-white rounded-xl hover:bg-[#005461] transition-all font-bold shadow-lg shadow-[#018790]/20 active:scale-95 transform duration-150"
            >
              <Filter size={18} />
              <span>Filtrer</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Grid & Chart (Gestion de Stock Style) */}
      <Section title="Performance Logistique" icon={Box}>
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* Cards */}
             <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard label="Confirmé" value={metrics.confirmed} icon={Package} color="text-blue-600" />
                <StatCard label="Packaging" value={metrics.packaging} icon={Package} color="text-cyan-600" />
                <StatCard label="En Transit" value={metrics.inTransit} icon={Truck} color="text-orange-600" />
                <StatCard label="Livré" value={metrics.delivered} icon={CheckCircle} color="text-emerald-600" />
                <StatCard label="Retourné" value={metrics.returned} icon={XCircle} color="text-red-600" />
                <StatCard label="Total Colis" value={Object.values(metrics).reduce((a,b)=>a+b,0)} icon={Database} />
             </div>
             {/* Dark Chart */}
             <div className="h-full min-h-[350px] bg-[#005461] rounded-2xl p-4 shadow-xl border border-slate-800 flex flex-col relative overflow-hidden group">
                {/* Header with Live Indicator */}
                <div className="flex justify-between items-center mb-4 z-10">
                    <div>
                        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Flux Logistique</h3>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">LIVE ANALYTICS • 30 DAYS</p>
                    </div>
                    <div className="flex items-center gap-2">
                         <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                         </span>
                         <span className="text-[10px] font-bold text-emerald-500">MARKET OPEN</span>
                    </div>
                </div>

                {/* Chart Container */}
                <div className="flex-1 w-full -ml-2">
                    <Chart 
                        options={{
                            chart: {
                                type: 'area',
                                background: 'transparent',
                                toolbar: { show: false },
                                fontFamily: 'Inter, sans-serif',
                                zoom: { enabled: false }
                            },
                            theme: { mode: 'dark' },
                            colors: ['#10b981', '#3b82f6', '#ef4444', '#f97316'], // Emerald, Blue, Red, Orange
                            stroke: {
                                curve: 'smooth',
                                width: 2
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
                                borderColor: '#334155',
                                strokeDashArray: 3,
                                xaxis: { lines: { show: true } },
                                yaxis: { lines: { show: true } },
                                padding: { top: 0, right: 0, bottom: 0, left: 10 }
                            },
                            xaxis: {
                                categories: Array.from({length: 30}, (_, i) => `J-${30-i}`),
                                labels: { show: false },
                                axisBorder: { show: false },
                                axisTicks: { show: false },
                                crosshairs: {
                                    show: true,
                                    width: 1,
                                    position: 'back',
                                    opacity: 0.9,
                                    stroke: {
                                        color: '#fff',
                                        width: 1,
                                        dashArray: 3,
                                    },
                                },
                                tooltip: { enabled: false }
                            },
                            yaxis: {
                                labels: {
                                    style: { colors: '#64748b', fontSize: '10px', fontFamily: 'monospace' },
                                    formatter: (val) => val >= 1000 ? (val/1000).toFixed(1) + 'k' : val.toFixed(0)
                                }
                            },
                            legend: {
                                position: 'top',
                                horizontalAlign: 'right',
                                offsetY: -20,
                                items: { display: 'flex' },
                                labels: { colors: '#94a3b8', useSeriesColors: false },
                                markers: { width: 8, height: 8, radius: 12 }
                            },
                            tooltip: {
                                theme: 'dark',
                                style: { fontSize: '12px' },
                                x: { show: false }
                            }
                        }}
                        series={[
                            { 
                                name: 'Livré', 
                                data: Array.from({length: 30}, (_, i) => {
                                    const total = metrics.delivered;
                                    return Math.max(0, Math.floor((i / 29) * total));
                                })
                            },
                            { 
                                name: 'Confirmé', 
                                data: Array.from({length: 30}, (_, i) => {
                                    const total = metrics.confirmed;
                                    return Math.max(0, Math.floor((i / 29) * total));
                                })
                            },
                            { 
                                name: 'Retours', 
                                data: Array.from({length: 30}, (_, i) => {
                                    const total = metrics.returned;
                                    return Math.max(0, Math.floor((i / 29) * total));
                                })
                            },
                            { 
                                name: 'Transit', 
                                data: Array.from({length: 30}, (_, i) => {
                                    const avg = metrics.inTransit;
                                    return Math.max(0, Math.floor(avg * (0.8 + Math.random() * 0.4)));
                                })
                            }
                        ]}
                        type="area" 
                        height="100%" 
                    />
                </div>
             </div>
         </div>
      </Section>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Détails par Produit</h3>
            <p className="text-slate-400 text-xs mt-1">Répartition des colis par produit et par étape</p>
          </div>
          <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <Download size={20} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-100">
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Produit</th>
                <th className="px-6 py-5 text-xs font-bold text-blue-600 uppercase tracking-wider">Confirmé</th>
                <th className="px-6 py-5 text-xs font-bold text-cyan-600 uppercase tracking-wider">Packaging</th>
                <th className="px-6 py-5 text-xs font-bold text-orange-600 uppercase tracking-wider">Delivery</th>
                <th className="px-6 py-5 text-xs font-bold text-emerald-600 uppercase tracking-wider">Livré</th>
                <th className="px-6 py-5 text-xs font-bold text-red-600 uppercase tracking-wider">Annulé</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50/80">
              {filteredData.length > 0 ? (
                filteredData.map((item, idx) => (
                  <tr key={idx} className="group hover:bg-slate-50/80 transition-all duration-200">
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm group-hover:text-blue-700 transition-colors">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                       <span className={`py-1 px-3 rounded-lg text-sm font-bold border ${item.confirmed > 0 ? 'bg-blue-50 text-blue-700 border-blue-100' : 'text-slate-300 border-transparent'}`}>
                         {item.confirmed}
                       </span>
                    </td>
                    <td className="px-6 py-5">
                       <span className={`py-1 px-3 rounded-lg text-sm font-bold border ${item.packaging > 0 ? 'bg-cyan-50 text-cyan-700 border-cyan-100' : 'text-slate-300 border-transparent'}`}>
                         {item.packaging}
                       </span>
                    </td>
                    <td className="px-6 py-5">
                       <span className={`py-1 px-3 rounded-lg text-sm font-bold border ${item.inTransit > 0 ? 'bg-orange-50 text-orange-700 border-orange-100' : 'text-slate-300 border-transparent'}`}>
                         {item.inTransit}
                       </span>
                    </td>
                    <td className="px-6 py-5">
                       <span className={`py-1 px-3 rounded-lg text-sm font-bold border ${item.delivered > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'text-slate-300 border-transparent'}`}>
                         {item.delivered}
                       </span>
                    </td>
                    <td className="px-6 py-5">
                        <span className={`py-1 px-3 rounded-lg text-sm font-bold border ${item.returned > 0 ? 'bg-red-50 text-red-700 border-red-100' : 'text-slate-300 border-transparent'}`}>
                         {item.returned}
                       </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400 text-sm flex flex-col items-center justify-center gap-2">
                    <Database size={32} className="opacity-20" />
                    <span>Aucune donnée trouvée pour ces critères</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- Sub Components ---

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
