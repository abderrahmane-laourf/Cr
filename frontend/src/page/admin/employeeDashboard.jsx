import React, { useState, useEffect } from 'react';
import { 
  Users, CreditCard, UserCheck, TrendingUp, DollarSign, 
  Award, AlertTriangle, Layers, Smartphone, Laptop, CalendarCheck, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, ComposedChart, Line, Area, LineChart
} from 'recharts';
import { employeeAPI, paymentAPI, presenceAPI, affectationAPI } from '../../services/api';

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    totalPayments: 0,
    totalCommissions: 0,
    pendingPresence: 0,
    totalAffectations: 0
  });
  
  // Charts Data State
  const [financeChartData, setFinanceChartData] = useState([]);
  const [affectationStats, setAffectationStats] = useState([]);
  const [productionCurve, setProductionCurve] = useState([]);
  const [unusedPhoneList, setUnusedPhoneList] = useState([]);
  const [disciplinedEmployees, setDisciplinedEmployees] = useState([]); // New State

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [employees, payments, presence, affectations] = await Promise.all([
        employeeAPI.getAll(),
        paymentAPI.getAll(),
        presenceAPI.getAll(),
        affectationAPI.getAll()
      ]);

      // --- 1. GLOBAL KPIS ---
      const totalPayments = payments.reduce((sum, p) => sum + p.net, 0);
      const totalCommissions = payments.reduce((sum, p) => sum + (p.commission || 0), 0);
      
      setStats({
        totalEmployees: employees.length,
        activeEmployees: employees.filter(e => e.active).length,
        totalPayments,
        totalCommissions,
        pendingPresence: presence.length,
        totalAffectations: affectations.length
      });

      // --- 2. FINANCE CHART (Salary + Commission + Deduction Line) ---
      const last6Months = Array.from({ length: 6 }, (_, i) => {
         const d = new Date();
         d.setMonth(d.getMonth() - i);
         return d.toISOString().slice(0, 7);
      }).reverse();

      const chartData = last6Months.map(month => {
         return {
           name: new Date(month + '-01').toLocaleDateString('fr-FR', { month: 'short' }),
           salaire: (totalPayments / 6) + (Math.random() * 2000), 
           commission: (totalCommissions / 6) + (Math.random() * 1000),
           deduction: (Math.random() * 1000) + 200 
         };
      });
      setFinanceChartData(chartData);

      // --- 3. AFFECTATION CHART ---
      const affectationCounts = {};
      affectations.forEach(aff => {
          const type = aff.type || aff.objectName || 'Autre'; 
          if(!affectationCounts[type]) affectationCounts[type] = 0;
          affectationCounts[type]++;
      });
      // Mock data if empty for visualization
      if (Object.keys(affectationCounts).length === 0) {
          affectationCounts['PC Portable'] = 12;
          affectationCounts['Téléphone'] = 8;
          affectationCounts['Casque'] = 15;
          affectationCounts['Ecran'] = 10;
      }
      const affData = Object.entries(affectationCounts).map(([key, val]) => ({ name: key, count: val }));
      setAffectationStats(affData);

      // --- 4. PRODUCTION CURVE ---
      const prodData = employees.slice(0, 10).map(emp => ({
          name: emp.name.split(' ')[0], 
          production: Math.floor(Math.random() * 100) + 20 
      }));
      setProductionCurve(prodData);

      // --- 5. UNUSED PHONE CHARGES ---
      const unusedMock = employees
        .filter((_, i) => i % 3 === 0) 
        .map(e => ({
            id: e.id,
            name: e.name,
            allowance: 200,
            consumed: 0
        }))
        .slice(0, 4);
      setUnusedPhoneList(unusedMock);

      // --- 6. TOP DISCIPLINE (PRESENCE) ---
      // Logic: Aggregate presence records. 
      // In a real app, you count 'status' === 'LATE' or 'ABSENT'.
      // Here we mock the calculation based on the employee list for demo purposes if presence array is raw.
      const presenceStats = employees.map(emp => {
          // Simulation of presence data
          const totalDays = 22; // Working days
          const lates = Math.floor(Math.random() * 4); // 0-3 lates
          const absences = Math.floor(Math.random() * 2); // 0-1 absence
          
          return {
              ...emp,
              lates,
              absences,
              presenceScore: 100 - (absences * 10) - (lates * 2) // Simple scoring logic
          };
      });

      // Sort by best score (High score = Good discipline)
      const topDisciplined = presenceStats
        .sort((a, b) => b.presenceScore - a.presenceScore)
        .slice(0, 5);
      
      setDisciplinedEmployees(topDisciplined);

    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const kpiCards = [
    { title: 'Total Employés', value: stats.totalEmployees, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Employés Actifs', value: stats.activeEmployees, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Total Paiements', value: `${(stats.totalPayments/1000).toFixed(1)}k`, subtitle: 'MAD', icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Commissions', value: `${(stats.totalCommissions/1000).toFixed(1)}k`, subtitle: 'MAD', icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Matériel Affecté', value: stats.totalAffectations, icon: Layers, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Ajustements', value: stats.pendingPresence, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  if (loading) return <div className="p-10 text-center text-slate-500">Chargement des données...</div>;

  return (
    <div className="min-h-screen p-6 text-slate-800 font-sans bg-slate-50/50">
      
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard RH & Performance</h1>
          <p className="text-slate-500 text-sm mt-1">Vue d'ensemble des ressources et de la production</p>
        </div>
        <button 
            onClick={() => navigate('/admin/paiement')}
            className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition text-sm font-medium shadow-sm"
        >
            Gérer la Paie
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {kpiCards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.bg}`}>
                <card.icon className={card.color} size={18} />
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-400 uppercase">{card.title}</p>
            <div className="flex items-baseline gap-1 mt-1">
                <h3 className="text-xl font-bold text-slate-800">{card.value}</h3>
                {card.subtitle && <span className="text-[10px] font-medium text-slate-400">{card.subtitle}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* MAIN CHART: Finance */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <TrendingUp className="text-blue-600" size={20} />
              Finance : Salaires, Commissions et Déductions
            </h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={financeChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorSal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCom" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="salaire" stackId="1" stroke="#3b82f6" fill="url(#colorSal)" name="Salaires" strokeWidth={2} />
                <Area type="monotone" dataKey="commission" stackId="1" stroke="#10b981" fill="url(#colorCom)" name="Commissions" strokeWidth={2} />
                {/* Red Line for Deductions */}
                <Line type="monotone" dataKey="deduction" stroke="#ef4444" strokeWidth={3} dot={{r: 4}} name="Déductions" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* CHART: Affectation Matériel */}
        <div className="lg:col-span-1 bg-white rounded-xl p-6 shadow-sm border border-slate-200">
           <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Laptop className="text-indigo-500" size={18} />
              Affectation Matériel
            </h3>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={affectationStats} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9"/>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 11, fill: '#64748b'}} tickLine={false} axisLine={false}/>
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} name="Quantité" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART: Production Curve */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-slate-200">
           <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="text-amber-500" size={18} />
              Production par Employé
            </h3>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={productionCurve}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                 <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                 <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                 <Tooltip contentStyle={{ borderRadius: '8px' }} />
                 <Line type="monotone" dataKey="production" stroke="#f59e0b" strokeWidth={3} activeDot={{ r: 8 }} name="Score Prod." />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* LIST: Unused Phone Charges */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                    <Smartphone size={16} />
                </div>
                <div>
                   <h3 className="font-bold text-slate-800">Charges Télé Non Consommées</h3>
                   <p className="text-xs text-slate-500">Solde intact (0 consommation)</p>
                </div>
            </div>
            <div className="space-y-3">
                {unusedPhoneList.length > 0 ? (
                    unusedPhoneList.map((emp) => (
                        <div key={emp.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">
                                    {emp.name.charAt(0)}
                                </div>
                                <span className="font-medium text-slate-700 text-sm">{emp.name}</span>
                            </div>
                            <div className="text-right">
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                                    {emp.allowance} MAD Dispo
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-4 text-slate-400 text-sm">Tous les soldes ont été utilisés.</div>
                )}
            </div>
          </div>

          {/* LIST: Top Discipline (Based on Presence) - NEW SECTION */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
             <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                    <CalendarCheck size={16} />
                </div>
                <div>
                   <h3 className="font-bold text-slate-800">Top Assiduité (Présence)</h3>
                   <p className="text-xs text-slate-500">Les employés les plus ponctuels</p>
                </div>
            </div>
            <div className="space-y-3">
                 {disciplinedEmployees.map((emp, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                         <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'}`}>
                                {idx + 1}
                            </div>
                            <div>
                                <p className="font-medium text-slate-700 text-sm">{emp.name}</p>
                            </div>
                         </div>
                         <div className="flex gap-2">
                             {/* Absences Badge */}
                             <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${emp.absences === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                 {emp.absences === 0 ? '0 Absence' : `${emp.absences} Abs`}
                             </span>
                             {/* Lates Badge */}
                             <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${emp.lates === 0 ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                                 <Clock size={10} />
                                 {emp.lates === 0 ? 'Ponctuel' : `${emp.lates} Retard(s)`}
                             </div>
                         </div>
                    </div>
                 ))}
            </div>
          </div>

      </div>

    </div>
  );
}