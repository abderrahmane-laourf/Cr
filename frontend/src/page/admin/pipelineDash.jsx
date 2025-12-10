import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Search, Filter, RotateCw, Download, Database, CheckCircle, Truck, Package, XCircle, User } from 'lucide-react';
import { employeeAPI, productAPI } from '../../services/api';

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
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10 font-sans text-slate-800">
      
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1 flex items-center gap-3">
              <Database className="text-blue-600" />
              Tableau de Suivi Pipeline
            </h1>
            <p className="text-slate-500 font-medium text-sm">Vue d'ensemble des colis par étape et par produit</p>
          </div>
          <div className="flex gap-3">
            <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors font-semibold">
              <RotateCw size={18} />
              <span>Actualiser</span>
            </button>
          </div>
        </div>

        {/* Filter Bar integrated in Header */}
        <div className="mt-8 pt-6 border-t border-slate-100">
           <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600">Date Début</label>
              <input 
                type="date" 
                value={dateFrom} 
                onChange={e => setDateFrom(e.target.value)}
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-semibold transition-all" 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600">Date Fin</label>
              <input 
                type="date" 
                value={dateTo} 
                onChange={e => setDateTo(e.target.value)}
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-semibold transition-all" 
              />
            </div>
             <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600">Produit</label>
              <div className="relative">
                <select 
                  value={productSearch} 
                  onChange={e => setProductSearch(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-semibold text-slate-700 appearance-none cursor-pointer transition-all shadow-sm"
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
              <label className="text-xs font-bold text-slate-600">Employé</label>
              <div className="relative">
                <select 
                  value={selectedEmployee} 
                  onChange={e => setSelectedEmployee(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-semibold text-slate-700 appearance-none cursor-pointer transition-all shadow-sm"
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
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-bold shadow-lg shadow-slate-900/20 active:scale-95 transform duration-150"
              >
                <Filter size={18} />
                <span>Filtrer</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <KpiCard icon={<Package size={24} />} title="Confirmé" value={metrics.confirmed} color="bg-blue-500" lightColor="bg-blue-50" textColor="text-blue-600" borderColor="border-blue-100" />
        <KpiCard icon={<Package size={24} />} title="Packaging" value={metrics.packaging} color="bg-cyan-500" lightColor="bg-cyan-50" textColor="text-cyan-600" borderColor="border-cyan-100" />
        <KpiCard icon={<Truck size={24} />} title="Out for Delivery" value={metrics.inTransit} color="bg-orange-500" lightColor="bg-orange-50" textColor="text-orange-600" borderColor="border-orange-100" />
        <KpiCard icon={<CheckCircle size={24} />} title="Livré" value={metrics.delivered} color="bg-emerald-500" lightColor="bg-emerald-50" textColor="text-emerald-600" borderColor="border-emerald-100" />
        <KpiCard icon={<XCircle size={24} />} title="Annulé / Retour" value={metrics.returned} color="bg-red-500" lightColor="bg-red-50" textColor="text-red-600" borderColor="border-red-100" />
      </div>

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

function KpiCard({ title, value, color, lightColor, textColor, icon, borderColor }) {
  return (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border ${borderColor} flex flex-col items-center justify-center text-center relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
      <div className={`p-4 rounded-full ${lightColor} ${textColor} mb-3 group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
        {icon}
      </div>
      <p className="text-slate-400 text-xs font-bold mb-1 uppercase tracking-wide">{title}</p>
      <h3 className={`text-3xl font-black ${textColor} tracking-tight`}>{value.toLocaleString()}</h3>
    </div>
  );
}
