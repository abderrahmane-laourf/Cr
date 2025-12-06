import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, Users, CheckCircle, Truck, XCircle, 
  Calendar, RotateCw, TrendingUp, BarChart2, PieChart
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart as RePieChart, Pie, Cell, Legend 
} from 'recharts';

const API_URL = 'http://localhost:3000';
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#64748B'];

export default function PipelineDashboard() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Date Filter
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
        setLoading(true);
        // Load primarily from LocalStorage 'colis' to match the Kanban board
        const savedColis = localStorage.getItem('colis');
        if (savedColis) {
            setClients(JSON.parse(savedColis));
        } else {
             // Fallback to API if LS is empty
            const res = await fetch(`${API_URL}/clients`);
            if (res.ok) {
                setClients(await res.json());
            }
        }
    } catch (error) {
        console.error("Error loading data", error);
    } finally {
        setLoading(false);
    }
  };

  const metrics = useMemo(() => {
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    end.setHours(23, 59, 59, 999);

    const filtered = clients.filter(c => {
        // Handle various date fields (Kanban uses dateCreated)
        const dateStr = c.dateCreated || c.createdAt || c.date;
        if (!dateStr) return false;
        const d = new Date(dateStr); 
        return d >= start && d <= end;
    });

    const total = filtered.length;
    
    // Stage Counts
    const byStage = filtered.reduce((acc, c) => {
        const stage = c.stage || 'Nouveau';
        acc[stage] = (acc[stage] || 0) + 1;
        return acc;
    }, {});

    // Employee Performance
    const byEmployee = filtered.reduce((acc, c) => {
        const emp = c.employee || 'Non assigné';
        if (!acc[emp]) acc[emp] = { name: emp, total: 0, confirmed: 0, delivered: 0 };
        acc[emp].total += 1;
        if (c.stage === 'Confirmé') acc[emp].confirmed += 1;
        if (c.stage === 'Livré') acc[emp].delivered += 1;
        return acc;
    }, {});

    const employeeList = Object.values(byEmployee).sort((a,b) => b.total - a.total);

    return {
        total,
        byStage,
        employeeList,
        filtered
    };
  }, [clients, dateRange]);

  // Chart Data
  const pieData = Object.entries(metrics.byStage).map(([name, value]) => ({ name, value }));
  const barData = metrics.employeeList.slice(0, 5); // Top 5 Employees

  return (
    <div className="min-h-screen bg-slate-50/50 p-8 font-sans text-slate-800">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                    <LayoutDashboard size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Dashboard Pipeline</h1>
                    <p className="text-slate-500 text-sm font-medium">Vue d'ensemble des leads et commandes</p>
                </div>
            </div>

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
                <button onClick={loadData} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                    <RotateCw size={18} />
                </button>
            </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                        <Users size={24} />
                    </div>
                </div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Leads</p>
                <h3 className="text-3xl font-black text-slate-900">{metrics.total}</h3>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                        <CheckCircle size={24} />
                    </div>
                </div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Confirmés</p>
                <h3 className="text-3xl font-black text-slate-900">{metrics.byStage['Confirmé'] || 0}</h3>
                <p className="text-xs text-emerald-600 font-bold mt-2">
                    {metrics.total > 0 ? ((metrics.byStage['Confirmé'] || 0) / metrics.total * 100).toFixed(1) : 0}% Conv.
                </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                        <Truck size={24} />
                    </div>
                </div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Livrés</p>
                <h3 className="text-3xl font-black text-slate-900">{metrics.byStage['Livré'] || 0}</h3>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-red-50 rounded-xl text-red-600">
                        <XCircle size={24} />
                    </div>
                </div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Annulés/Retour</p>
                <h3 className="text-3xl font-black text-slate-900">
                    {(metrics.byStage['Annulé'] || 0) + (metrics.byStage['Retour'] || 0)}
                </h3>
            </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Stage Distribution */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <PieChart size={18} className="text-slate-400"/>
                    Répartition par Étape
                </h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <RechartsTooltip />
                            <Legend />
                        </RePieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Employees */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <TrendingUp size={18} className="text-slate-400"/>
                    Top Vendeurs (Nombre de Leads)
                </h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                            <RechartsTooltip cursor={{fill: 'transparent'}} />
                            <Bar dataKey="total" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} name="Total Leads" />
                         </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* Employee Detail Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-900">Détail par Employé</h3>
             </div>
             <table className="w-full">
                <thead className="bg-slate-50">
                    <tr>
                        <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Employé</th>
                        <th className="text-center px-6 py-3 text-xs font-bold text-slate-500 uppercase">Total Leads</th>
                        <th className="text-center px-6 py-3 text-xs font-bold text-emerald-600 uppercase">Confirmés</th>
                        <th className="text-center px-6 py-3 text-xs font-bold text-blue-600 uppercase">Livrés</th>
                        <th className="text-center px-6 py-3 text-xs font-bold text-slate-500 uppercase">Taux Conf.</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {metrics.employeeList.map((emp, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="px-6 py-4 text-sm font-bold text-slate-700">{emp.name}</td>
                            <td className="px-6 py-4 text-center text-sm font-medium">{emp.total}</td>
                            <td className="px-6 py-4 text-center text-sm font-bold text-emerald-600">{emp.confirmed}</td>
                            <td className="px-6 py-4 text-center text-sm font-bold text-blue-600">{emp.delivered}</td>
                            <td className="px-6 py-4 text-center text-sm text-slate-400">
                                {emp.total > 0 ? ((emp.confirmed / emp.total) * 100).toFixed(1) : 0}%
                            </td>
                        </tr>
                    ))}
                </tbody>
             </table>
        </div>
    </div>
  );
}
