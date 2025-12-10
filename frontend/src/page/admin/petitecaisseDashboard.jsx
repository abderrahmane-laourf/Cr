import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Wallet, Smartphone, Users, 
  ArrowUpRight, ArrowDownLeft, Filter, Trophy, AlertTriangle, 
  BarChart3, PieChart, Calendar
} from 'lucide-react';
import { employeeAPI } from '../../services/api';
import {  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const PetiteCaisseDashboard = () => {
    // Note: Same key as petitecaisse.jsx for shared data
    const [transactions, setTransactions] = useState([]);
    const [employees, setEmployees] = useState([]);
    
    // Filters
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState('All');
    const [viewType, setViewType] = useState('All'); // 'All', 'Treasury', 'Telecom'

    // Mock Budget for Phone Recharges (Monthly)
    const PHONE_BUDGET = 5000;

    useEffect(() => {
        // Load Data
        const saved = localStorage.getItem('pettyCash_transactions');
        if (saved) setTransactions(JSON.parse(saved));

        // Load Employees
        const fetchEmployees = async () => {
            try {
                const data = await employeeAPI.getAll();
                setEmployees(data);
            } catch (e) { console.error(e); }
        };
        fetchEmployees();

        // Default Date Range (Current Month)
        const date = new Date();
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
        setDateFrom(firstDay);
        setDateTo(lastDay);
    }, []);

    // --- PROCESSING DATA ---
    
    // 1. Filter Transactions
    const filteredTransactions = transactions.filter(t => {
        const tDate = t.date;
        const matchDate = (!dateFrom || tDate >= dateFrom) && (!dateTo || tDate <= dateTo);
        const matchEmp = selectedEmployee === 'All' || t.employeeId == selectedEmployee; // Loose equality for ID string/number mismatch
        
        let matchType = true;
        if (viewType === 'Treasury') matchType = t.category !== 'Virement' && t.category !== 'Recharge';
        if (viewType === 'Telecom') matchType = t.category === 'Virement' || t.category === 'Recharge';

        return matchDate && matchEmp && matchType;
    });

    // 2. Treasury Stats (Income vs General Expenses)
    // Exclude 'Virement' from General Expenses if we consider them separate, 
    // or include everything. The prompt says "Income vs General Expenses (Rent, Utilities)".
    // Usually 'Espèce' tab items are General.
    const treasuryData = filteredTransactions.filter(t => t.category !== 'Virement' && t.category !== 'Recharge');
    const totalIncome = treasuryData.filter(t => t.type === 'IN').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = treasuryData.filter(t => t.type === 'OUT').reduce((sum, t) => sum + t.amount, 0);
    const netBalance = totalIncome - totalExpenses;

    // 3. Phone Recharge Stats
    const telecomData = filteredTransactions.filter(t => (t.category === 'Virement' || t.category === 'Recharge') && t.type === 'OUT');
    const totalTelecomSpent = telecomData.reduce((sum, t) => sum + t.amount, 0);
    const budgetUsage = Math.min((totalTelecomSpent / PHONE_BUDGET) * 100, 100);

    // 4. Top Consumers Logic
    const consumerStats = {};
    telecomData.forEach(t => {
        const empName = employees.find(e => e.id == t.employeeId)?.name || 'Inconnu';
        if (!consumerStats[empName]) consumerStats[empName] = 0;
        consumerStats[empName] += t.amount;
    });
    
    // Convert to array and sort
    const rankedConsumers = Object.entries(consumerStats)
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => b.amount - a.amount);

    const topConsumer = rankedConsumers.length > 0 ? rankedConsumers[0] : null;
    const lowConsumer = rankedConsumers.length > 0 ? rankedConsumers[rankedConsumers.length - 1] : null;

    // Chart Data (Last 7 days or Aggregated by Date)
    const chartData = Object.values(filteredTransactions.reduce((acc, t) => {
        if (!acc[t.date]) acc[t.date] = { date: t.date, income: 0, expense: 0 };
        if (t.type === 'IN') acc[t.date].income += t.amount;
        else acc[t.date].expense += t.amount;
        return acc;
    }, {})).sort((a, b) => new Date(a.date) - new Date(b.date));

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-sans text-slate-800">
            
            {/* HEADER & FILTERS */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 mb-8">
                <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                            <BarChart3 className="text-indigo-600" size={32} />
                            Tableau de Bord Trésorerie
                        </h1>
                        <p className="text-slate-500 font-medium mt-1">Suivi des Dépenses & Budget Téléphonie</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                        <div className="bg-white px-3 py-2 rounded-xl border border-slate-200 flex items-center gap-2 shadow-sm">
                            <Calendar size={16} className="text-slate-400"/>
                            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="bg-transparent text-xs font-bold outline-none font-mono"/>
                            <span className="text-slate-300">-</span>
                            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="bg-transparent text-xs font-bold outline-none font-mono"/>
                        </div>
                        
                        <div className="bg-white px-3 py-2 rounded-xl border border-slate-200 flex items-center gap-2 shadow-sm">
                            <Users size={16} className="text-slate-400"/>
                            <select 
                                value={selectedEmployee} 
                                onChange={e => setSelectedEmployee(e.target.value)}
                                className="bg-transparent text-xs font-bold outline-none w-32"
                            >
                                <option value="All">Tous les employés</option>
                                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION A: General Treasury */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <KpiCard 
                    title="Total Entrées (Income)" 
                    amount={totalIncome} 
                    icon={TrendingUp} 
                    color="text-emerald-700" 
                    bg="bg-emerald-50" 
                    border="border-emerald-100"
                    trend="+12% vs last month"
                />
                <KpiCard 
                    title="Total Dépenses (General)" 
                    amount={totalExpenses} 
                    icon={TrendingDown} 
                    color="text-red-700" 
                    bg="bg-red-50" 
                    border="border-red-100"
                    trend=""
                />
                <KpiCard 
                    title="Solde Net (Cash)" 
                    amount={netBalance} 
                    icon={Wallet} 
                    color="text-blue-700" 
                    bg="bg-blue-50" 
                    border="border-blue-100"
                    trend="Available Cash"
                />
            </div>

            {/* SECTION B: TELECOM & BUDGET */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                
                {/* 1. Budget Monitoring */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-violet-500 to-fuchsia-500"></div>
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-xl bg-violet-100 text-violet-600">
                                <Smartphone size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Budget Téléphonie</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Consommation Mensuelle</p>
                            </div>
                        </div>

                        <div className="mb-2 flex justify-between items-end">
                            <span className="text-4xl font-black text-slate-800">{totalTelecomSpent.toLocaleString()} <span className="text-sm font-bold text-slate-400">MAD</span></span>
                            <span className="text-sm font-bold text-slate-500">/ {PHONE_BUDGET.toLocaleString()} MAD</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden mb-4 border border-slate-100">
                            <div 
                                className={`h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-1
                                    ${budgetUsage > 90 ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-violet-500 to-fuchsia-500'}
                                `}
                                style={{ width: `${budgetUsage}%` }}
                            >
                            </div>
                        </div>
                        <p className={`text-xs font-bold ${budgetUsage > 90 ? 'text-red-500' : 'text-slate-400'}`}>
                            {budgetUsage > 100 ? 'Budget Dépassé !' : `Vous avez utilisé ${budgetUsage.toFixed(1)}% du budget.`}
                        </p>
                    </div>
                </div>

                {/* 2. Top Consumer (The "Winner") */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex items-center justify-between group hover:border-red-200 transition-colors">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Highest Spender</p>
                        {topConsumer ? (
                            <>
                                <h3 className="text-2xl font-black text-slate-800 mb-1">{topConsumer.name}</h3>
                                <p className="text-red-600 font-bold bg-red-50 px-2 py-1 rounded-lg inline-block">-{topConsumer.amount.toLocaleString()} MAD</p>
                            </>
                        ) : (
                            <p className="text-slate-400 italic">Aucune donnée</p>
                        )}
                    </div>
                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                        <TrendingDown size={32} />
                    </div>
                </div>

                {/* 3. Bottom Consumer (The "Saver") */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex items-center justify-between group hover:border-emerald-200 transition-colors">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Most Economical</p>
                        {lowConsumer ? (
                            <>
                                <h3 className="text-2xl font-black text-slate-800 mb-1">{lowConsumer.name}</h3>
                                <p className="text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-lg inline-block">-{lowConsumer.amount.toLocaleString()} MAD</p>
                            </>
                        ) : (
                            <p className="text-slate-400 italic">Aucune donnée</p>
                        )}
                    </div>
                    <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                        <Trophy size={32} />
                    </div>
                </div>
            </div>

            {/* SECTION C: CHART & LIST */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Chart */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-bold text-lg text-slate-800 mb-6">Aperçu Financier</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                                <XAxis dataKey="date" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                                <YAxis tick={{fontSize: 10}} tickLine={false} axisLine={false} tickFormatter={(value) => `${value/1000}k`}/>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                    cursor={{fill: '#f8fafc'}}
                                />
                                <Bar dataKey="income" name="Entrées" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                <Bar dataKey="expense" name="Dépenses" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top 5 Consumers List */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-slate-800">Top Consommation (Téléphone)</h3>
                        <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800">Voir tout</button>
                    </div>
                    <div className="p-0">
                        {rankedConsumers.slice(0, 5).map((r, idx) => (
                            <div key={idx} className="flex items-center justify-between px-6 py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {idx + 1}
                                    </div>
                                    <span className="font-bold text-slate-700">{r.name}</span>
                                </div>
                                <span className="font-mono font-bold text-slate-800">-{r.amount.toLocaleString()} <span className="text-xs text-slate-400">DH</span></span>
                            </div>
                        ))}
                        {rankedConsumers.length === 0 && (
                            <div className="p-8 text-center text-slate-400 text-sm">Aucune donnée de recharge.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const KpiCard = ({ title, amount, icon: Icon, color, bg, border, trend }) => (
    <div className={`p-6 rounded-3xl shadow-sm border ${border} ${bg} flex flex-col justify-between hover:shadow-md transition-all`}>
        <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-2xl bg-white/60 backdrop-blur-sm ${color}`}>
                <Icon size={24} />
            </div>
            {trend && <span className="text-[10px] font-bold uppercase tracking-wider bg-white/50 px-2 py-1 rounded-lg text-slate-500">{trend}</span>}
        </div>
        <div>
            <p className={`text-xs font-bold uppercase tracking-widest opacity-70 mb-1 ${color}`}>{title}</p>
            <h3 className={`text-3xl font-black tracking-tight ${color}`}>{amount.toLocaleString()} <span className="text-sm opacity-60">MAD</span></h3>
        </div>
    </div>
);

export default PetiteCaisseDashboard;
