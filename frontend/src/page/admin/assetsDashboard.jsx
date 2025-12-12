import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Building, AlertTriangle, Search, 
  DollarSign, Archive, Wrench, Package, CheckCircle
} from 'lucide-react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function AssetsDashboard() {
  const [assets, setAssets] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Load from LocalStorage on mount - THIS IS THE SHARED DATA SOURCE
  // It reads from the same key that the 'AssetsPage' will now use or if it uses a real API, it should come from there.
  // For now, assuming they share 'assets_inventory_v1' or similar, but since the user said "relation data of this dashboard with list actifs",
  // I will make them share the same localStorage key: 'assets_db'.
  useEffect(() => {
    const saved = localStorage.getItem('assets_db');
    if (saved) {
      setAssets(JSON.parse(saved));
    }
  }, []);

  // Filter Logic
  const filteredAssets = assets.filter(asset => {
    const textMatch = (asset.name?.toLowerCase().includes(filterText.toLowerCase()) || 
                      asset.category?.toLowerCase().includes(filterText.toLowerCase()));
    
    const catMatch = filterCategory === 'All' || asset.category === filterCategory;
    
    // Mapping French statuses to codes if needed, or direct match
    const statusMatch = filterStatus === 'All' || 
                        (filterStatus === 'Damaged' ? asset.status === 'Endommagé' : asset.status !== 'Endommagé');
    
    let dateMatch = true;
    if (dateFrom && asset.date) dateMatch = dateMatch && asset.date >= dateFrom;
    if (dateTo && asset.date) dateMatch = dateMatch && asset.date <= dateTo;

    return textMatch && catMatch && statusMatch && dateMatch;
  });

  // KPI Calculations
  const stats = {
    totalValue: filteredAssets.reduce((sum, a) => sum + (Number(a.purchaseValue) || Number(a.value) || 0), 0),
    totalCount: filteredAssets.reduce((sum, a) => sum + (Number(a.quantity) || 1), 0), // Use Quantity if available, else 1
    uniqueAssets: filteredAssets.length,
    
    // Risk Stats
    damagedUniqueCount: filteredAssets.filter(a => a.status === 'Endommagé').length,
    damagedTotalCount: filteredAssets.filter(a => a.status === 'Endommagé').reduce((sum, a) => sum + (Number(a.quantity) || 1), 0),
    damagedValue: filteredAssets.filter(a => a.status === 'Endommagé').reduce((sum, a) => sum + (Number(a.purchaseValue) || Number(a.value) || 0), 0),
  };

  // Chart Data: Value by Category
  const categoryData = Object.entries(filteredAssets.reduce((acc, curr) => {
    const val = Number(curr.purchaseValue) || Number(curr.value) || 0;
    acc[curr.category] = (acc[curr.category] || 0) + val;
    return acc;
  }, {})).map(([name, value]) => ({ name, value }));

  // Chart Data: Status Distribution
  const statusData = [
      { name: 'Bon État', value: stats.totalCount - stats.damagedTotalCount },
      { name: 'Endommagé', value: stats.damagedTotalCount }
  ];

  // Unique Categories for Filter
  const categories = [...new Set(assets.map(a => a.category))].filter(Boolean);

  // Print Logic
  const handlePrintContract = () => {
    const printWindow = window.open('', '_blank');
    const currentDate = new Date().toLocaleDateString('ar-MA');
    
    // Generate Rows from filteredAssets for consistency
    const rows = filteredAssets.map(asset => `
      <tr>
        <td>${asset.name}</td>
        <td>${asset.category}</td>
        <td>${asset.status || 'N/A'}</td>
        <td>${asset.id}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <title>محضر استلام عهدة - Dashboard Report</title>
        <style>
          body { font-family: 'Arial', sans-serif; padding: 40px; direction: rtl; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .title { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .sub-title { font-size: 18px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 30px; }
          th, td { border: 1px solid #000; padding: 12px; text-align: center; }
          th { background-color: #f8f9fa; font-weight: bold; }
          .content { margin-top: 30px; line-height: 1.6; font-size: 16px; }
          .footer { margin-top: 80px; display: flex; justify-content: space-between; page-break-inside: avoid; }
          .signature-section { text-align: center; width: 250px; }
          .signature-box { border: 1px solid #000; height: 100px; margin-top: 15px; border-radius: 8px; }
          @media print {
            @page { margin: 1cm; size: A4; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">تقرير جرد الأصول العامة</div>
          <div class="sub-title">General Assets Inventory Report</div>
        </div>

        <div class="content">
          <p><strong>تاريخ التقرير:</strong> ${currentDate}</p>
          <br />
          
          <table>
            <thead>
              <tr>
                <th width="35%">الاسم (Item)</th>
                <th width="25%">الفئة (Category)</th>
                <th width="25%">الحالة (Status)</th>
                <th width="15%">الكود (Code)</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <div class="signature-section">
            <p><strong>توقيع المسؤول</strong></p>
            <div class="signature-box"></div>
          </div>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-sans text-slate-800">
      
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Building className="text-blue-600" size={32} />
            Tableau de Bord des Actifs
          </h1>
          <p className="text-slate-600 font-medium mt-1">
            Vue d'ensemble et analyse du patrimoine
          </p>
        </div>
        <button 
           onClick={handlePrintContract}
           className="flex items-center gap-2 px-6 py-2.5 bg-white text-slate-700 font-bold rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
        >
           <archive size={18} /> 
           <span>Imprimer Contrat</span>
        </button>
      </div>

      {/* KPI Section - Two Rows */}
      {/* Row 1: General Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Package size={24} /></div>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase">Types d'Actifs</p>
            <h3 className="text-3xl font-black text-slate-900">{stats.uniqueAssets}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Archive size={24} /></div>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase">Quantité Totale</p>
            <h3 className="text-3xl font-black text-slate-900">{stats.totalCount}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><DollarSign size={24} /></div>
                <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded">CAPEX</span>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase">Valeur Financière Totale</p>
            <h3 className="text-3xl font-black text-slate-900">{stats.totalValue.toLocaleString()} <span className="text-sm text-slate-400">DH</span></h3>
        </div>
      </div>

      {/* Row 2: Risk Stats (Red) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-red-50/50 p-6 rounded-2xl border border-red-100 flex flex-col justify-between hover:bg-red-50 transition-colors">
             <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="text-red-500" size={20} />
                <span className="text-red-700 font-bold text-sm">Types Endommagés</span>
             </div>
             <h3 className="text-2xl font-black text-red-700">{stats.damagedUniqueCount}</h3>
        </div>
        <div className="bg-red-50/50 p-6 rounded-2xl border border-red-100 flex flex-col justify-between hover:bg-red-50 transition-colors">
             <div className="flex items-center gap-2 mb-2">
                <Wrench className="text-red-500" size={20} />
                <span className="text-red-700 font-bold text-sm">Unités à Réparer</span>
             </div>
             <h3 className="text-2xl font-black text-red-700">{stats.damagedTotalCount}</h3>
        </div>
        <div className="bg-red-50/50 p-6 rounded-2xl border border-red-100 flex flex-col justify-between hover:bg-red-50 transition-colors">
             <div className="flex items-center gap-2 mb-2">
                <DollarSign className="text-red-500" size={20} />
                <span className="text-red-700 font-bold text-sm">Perte de Valeur Estimée</span>
             </div>
             <h3 className="text-2xl font-black text-red-700">{stats.damagedValue.toLocaleString()} <span className="text-sm opacity-70">DH</span></h3>
        </div>
      </div>

      {/* Analysis Section: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Investissement par Catégorie</h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{fontSize: 10}} interval={0} />
                        <YAxis tick={{fontSize: 12}} />
                        <Tooltip cursor={{fill: 'transparent'}} />
                        <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Valeur (DH)" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
         </div>

         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Santé du Parc (Ratio)</h3>
            <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            <Cell fill="#10B981" /> {/* Good */}
                            <Cell fill="#EF4444" /> {/* Damaged */}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
         </div>
      </div>

      {/* Filters & Inventory */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
         <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-end">
                <div className="w-full md:w-1/3 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Recherche (Nom, Catégorie...)" 
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-sm"
                    />
                </div>
                
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                     <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-400 uppercase">Depuis</label>
                        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                     </div>
                     <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-400 uppercase">Jusqu'à</label>
                        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold" />
                     </div>
                     <div className="flex flex-col gap-1 min-w-[140px]">
                        <label className="text-xs font-bold text-slate-400 uppercase">Catégorie</label>
                        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold">
                            <option value="All">Toutes</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                     </div>
                     <div className="flex flex-col gap-1 min-w-[140px]">
                        <label className="text-xs font-bold text-slate-400 uppercase">État</label>
                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold">
                            <option value="All">Tous</option>
                            <option value="Good">Bon État</option>
                            <option value="Damaged">Endommagé</option>
                        </select>
                     </div>
                </div>
            </div>
         </div>

         {/* Table */}
         <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left">
                <thead className="bg-slate-50/50">
                    <tr>
                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Actif</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Info Achat</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase text-center">Quantité</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase text-right">Valeur Totale</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase text-center">État</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {filteredAssets.length > 0 ? (
                        filteredAssets.map(asset => (
                            <tr key={asset.id} className="group hover:bg-slate-50/80 transition-colors">
                                <td className="py-4 px-6">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-800 text-sm">{asset.name}</span>
                                        <span className="text-xs text-slate-400">{asset.category} • {asset.project || '-'}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-600">{asset.date || asset.purchaseDate}</span>
                                        <span className="text-xs text-slate-400">PU: {(Number(asset.purchaseValue) || Number(asset.unitPrice) || Number(asset.value)).toLocaleString()} DH</span>
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-center">
                                    <span className="inline-block bg-slate-100 text-slate-700 font-bold px-2 py-1 rounded text-xs">
                                        x{asset.quantity || 1}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-right font-bold text-slate-800 text-sm">
                                    {(Number(asset.purchaseValue) || Number(asset.value) || 0).toLocaleString()} DH
                                </td>
                                <td className="py-4 px-6 text-center">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                                        asset.status === 'Endommagé' 
                                            ? 'bg-red-50 text-red-600 border-red-100' 
                                            : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                    }`}>
                                        {asset.status === 'Endommagé' ? <AlertTriangle size={12}/> : <CheckCircle size={12}/>}
                                        {asset.status}
                                    </span>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="py-12 text-center text-slate-400 text-sm">
                                Aucun actif trouvé dans votre inventaire.
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
