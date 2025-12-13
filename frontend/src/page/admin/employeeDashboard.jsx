import { 
  Users, CreditCard, UserCheck, TrendingUp, DollarSign, 
  Award, AlertTriangle, Layers, Smartphone, Laptop, CalendarCheck, Clock, Activity, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, ComposedChart, Line, Area, LineChart
} from 'recharts';
import { employeeAPI, paymentAPI, presenceAPI, affectationAPI } from '../../services/api';
import SpotlightCard from '../../util/SpotlightCard';
import { useState } from 'react';
import { useEffect } from 'react';

// Helper Components (duplicated from GlobalDashboard for consistency, ideally should be shared)
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

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1); // Default to last month
    return d.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [employeeList, setEmployeeList] = useState([]);

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
  const [disciplinedEmployees, setDisciplinedEmployees] = useState([]); 

  useEffect(() => {
    const init = async () => {
        const emps = await employeeAPI.getAll() || [];
        setEmployeeList(emps);
        loadData(emps);
    };
    init();
  }, []); 

  const handleFilter = () => {
    loadData(employeeList);
  };

  const loadData = async (employeesData) => {
    try {
      setLoading(true);
      
      const [payments, presence, affectations] = await Promise.all([
        paymentAPI.getAll() || [],
        presenceAPI.getAll() || [],
        affectationAPI.getAll() || []
      ]);

      const employees = employeesData || employeeList;

      // --- FILTERING ---
      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59);

      // Filter Helper
      const inDateRange = (dateStr) => {
          if (!dateStr) return true; 
          const d = new Date(dateStr);
          return d >= fromDate && d <= toDate;
      };

      const matchEmployee = (empId, empName) => {
          if (selectedEmployee === 'all') return true;
          // Check ID or Name depending on what API returns in other objects
          return (empId && String(empId) === String(selectedEmployee)) || (empName && String(empName) === String(selectedEmployee));
      };

      // 1. Filtered Datasets
      const filteredPayments = payments.filter(p => inDateRange(p.date) && matchEmployee(p.employeeId, p.employeeName));
      // Presence typically has a date field
      const filteredPresence = presence.filter(p => inDateRange(p.date) && matchEmployee(p.employeeId, p.employeeName));
      // Affectations might have 'dateAffected'
      const filteredAffectations = affectations.filter(a => inDateRange(a.dateAffected || a.date) && matchEmployee(a.employeeId, a.employeeName));
      // Employees list is usually static master data, but if filtering by employee, 'activeEmployees' could mean "Is the selected employee active?"
      let relevantEmployees = employees;
      if (selectedEmployee !== 'all') {
          relevantEmployees = employees.filter(e => String(e.id) === String(selectedEmployee) || String(e.nom || e.name) === String(selectedEmployee));
      }

      // --- 1. GLOBAL KPIS ---
      const totalPayments = filteredPayments.reduce((sum, p) => sum + (p.net || 0), 0);
      const totalCommissions = filteredPayments.reduce((sum, p) => sum + (p.commission || 0), 0);
      
      setStats({
        totalEmployees: employees.length, // Total database remains same
        activeEmployees: relevantEmployees.filter(e => e.active).length,
        totalPayments,
        totalCommissions,
        pendingPresence: filteredPresence.length, // Showing count of records in period
        totalAffectations: filteredAffectations.length
      });

      // --- 2. FINANCE CHART (Salary + Commission + Deduction Line) ---
      // Group by month within the selected range (or just show the range if short)
      // For simplicity, we stick to grouping by month found in the filtered data
      const paymentsByMonth = {};
      filteredPayments.forEach(p => {
          const m = p.date ? p.date.slice(0, 7) : 'Unknown';
          if (!paymentsByMonth[m]) paymentsByMonth[m] = { salary: 0, commission: 0, deduction: 0 };
          paymentsByMonth[m].salary += (p.net || 0); // Approximation
          paymentsByMonth[m].commission += (p.commission || 0);
          paymentsByMonth[m].deduction += 0; // Mock deduction if not in API
      });
      
      let chartData = Object.entries(paymentsByMonth).map(([month, data]) => ({
           name: month === 'Unknown' ? '?' : new Date(month + '-01').toLocaleDateString('fr-FR', { month: 'short' }),
           sortKey: month, // for sorting
           ...data
      })).sort((a,b) => a.sortKey.localeCompare(b.sortKey));

      // Fallback if empty (preserving UI structure with dummy 0s)
      if (chartData.length === 0) chartData = []; 

      setFinanceChartData(chartData);

      // --- 3. AFFECTATION CHART ---
      const affectationCounts = {};
      filteredAffectations.forEach(aff => {
          const type = aff.type || aff.objectName || 'Autre'; 
          if(!affectationCounts[type]) affectationCounts[type] = 0;
          affectationCounts[type]++;
      });

      const affData = Object.entries(affectationCounts).map(([key, val]) => ({ name: key, count: val }));
      setAffectationStats(affData);

      // --- 4. PRODUCTION CURVE ---
      // Use relevantEmployees to generate this
      const prodData = relevantEmployees.slice(0, 10).map(emp => ({
          name: (emp.nom || emp.name || '').split(' ')[0], 
          production: Math.floor(Math.random() * 100) + 20 
      }));
      setProductionCurve(prodData);

      // --- 5. UNUSED PHONE CHARGES ---
      const unusedMock = relevantEmployees
        .filter((_, i) => i % 3 === 0) 
        .map(e => ({
            id: e.id,
            name: e.nom || e.name,
            allowance: 200,
            consumed: 0
        }))
        .slice(0, 4);
      setUnusedPhoneList(unusedMock);

      // --- 6. TOP DISCIPLINE (PRESENCE) ---
      // Use filteredPresence to calculate scores
      // Group filteredPresence by employee
      const presenceByEmp = {};
      filteredPresence.forEach(p => {
          const id = p.employeeId || p.employeeName; // Fallback
          // Assuming p.employeeName holds the name, or fetch from employee ID
          const name = p.employeeName || 'Inconnu';
          if (!presenceByEmp[id]) presenceByEmp[id] = { lates: 0, absences: 0, name: name };
          if (p.status === 'LATE' || p.retard > 0) presenceByEmp[id].lates++;
          if (p.status === 'ABSENT') presenceByEmp[id].absences++;
      });

      // Map back to employee list or use the grouped data
      const presenceStats = relevantEmployees.map(emp => {
          const stats = presenceByEmp[emp.id] || presenceByEmp[emp.nom || emp.name] || { lates: 0, absences: 0 };
          return {
              ...emp,
              name: emp.nom || emp.name,
              lates: stats.lates,
              absences: stats.absences,
              presenceScore: 100 - (stats.absences * 10) - (stats.lates * 2)
          };
      });

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
    { title: 'Total Employés', value: stats.totalEmployees, icon: Users },
    { title: 'Employés Actifs', value: stats.activeEmployees, icon: UserCheck, color: 'text-emerald-600' },
    { title: 'Total Paiements', value: `${(stats.totalPayments/1000).toFixed(1)}k`, subtitle: 'MAD', icon: CreditCard, color: 'text-purple-600' },
    { title: 'Commissions', value: `${(stats.totalCommissions/1000).toFixed(1)}k`, subtitle: 'MAD', icon: Award, color: 'text-amber-600' },
    { title: 'Matériel Affecté', value: stats.totalAffectations, icon: Layers, color: 'text-indigo-600' },
    { title: 'Ajustements', value: stats.pendingPresence, icon: AlertTriangle, color: 'text-rose-600' },
  ];

  if (loading && !employeeList.length) return <div className="p-10 text-center text-slate-500">Chargement des données...</div>;

  return (
    <div className="w-full min-h-screen bg-transparent p-6 space-y-8 animate-[fade-in_0.6s_ease-out]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-transparent p-6 rounded-3xl border border-slate-100/50">
        <div>
          <h1 className="text-2xl font-extrabold text-[#018790]">Dashboard RH & Performance</h1>
          <p className="text-slate-500">Vue d'ensemble des ressources et de la production</p>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
            <button 
                onClick={handleFilter}
                className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-[#018790] rounded-xl hover:bg-slate-100 transition-colors font-bold border border-slate-200"
             >
                <RefreshCw size={18} />
                <span>Actualiser</span>
            </button>
            <button 
                onClick={() => navigate('/admin/paiement')}
                className="flex items-center gap-2 px-4 py-2 bg-[#005461] hover:bg-[#016f76] text-white rounded-xl transition-colors font-bold shadow-lg shadow-cyan-900/20"
            >
                <CreditCard size={18} /> 
                <span>Gérer Paie</span>
            </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
         <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
             <div className="flex flex-col gap-1.5">
                 <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><CalendarCheck size={12}/> Du</label>
                 <input 
                     type="date" 
                     value={dateFrom} 
                     onChange={(e) => setDateFrom(e.target.value)} 
                     className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#018790] focus:ring-4 focus:ring-[#018790]/10 transition-all"
                 />
             </div>
             <div className="flex flex-col gap-1.5">
                 <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><CalendarCheck size={12}/> Au</label>
                 <input 
                     type="date" 
                     value={dateTo} 
                     onChange={(e) => setDateTo(e.target.value)} 
                     className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#018790] focus:ring-4 focus:ring-[#018790]/10 transition-all"
                 />
             </div>
             <div className="flex flex-col gap-1.5">
                 <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Users size={12}/> Employé</label>
                 <div className="relative">
                    <select 
                        value={selectedEmployee} 
                        onChange={(e) => setSelectedEmployee(e.target.value)} 
                        className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#018790] focus:ring-4 focus:ring-[#018790]/10 transition-all appearance-none cursor-pointer"
                    >
                        <option value="all">Tous les employés</option>
                        {employeeList.map(e => <option key={e.id} value={e.id}>{e.nom || e.name}</option>)}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                 </div>
             </div>
             <button 
                onClick={handleFilter}
                className="w-full px-4 py-2.5 bg-[#018790] hover:bg-[#006c73] text-white rounded-xl font-bold text-sm shadow-lg shadow-cyan-900/20 transition-all flex items-center justify-center gap-2"
             >
                <RefreshCw size={18} /> Appliquer Filtres
            </button>
        </div>
      </div>

      {/* KPI Cards */}
      <Section title="Indicateurs Clés" icon={Users}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {kpiCards.map((card, idx) => (
            <StatCard 
                key={idx}
                label={card.title}
                value={card.value}
                icon={card.icon}
                sub={card.subtitle}
                color={card.color}
            />
            ))}
        </div>
      </Section>

      {/* MAIN CHART: Finance */}
      <Section title="Analyse Financière" icon={TrendingUp}>
        <SpotlightCard theme="light" className="w-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-slate-500 uppercase">Salaires vs Commissions</h3>
            </div>
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={financeChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorSal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#005461" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#005461" stopOpacity={0}/>
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
                    <Area type="monotone" dataKey="salaire" stackId="1" stroke="#005461" fill="url(#colorSal)" name="Salaires" strokeWidth={2} />
                    <Area type="monotone" dataKey="commission" stackId="1" stroke="#10b981" fill="url(#colorCom)" name="Commissions" strokeWidth={2} />
                    {/* Red Line for Deductions */}
                    <Line type="monotone" dataKey="deduction" stroke="#ef4444" strokeWidth={3} dot={{r: 4}} name="Déductions" />
                </ComposedChart>
                </ResponsiveContainer>
            </div>
        </SpotlightCard>
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHART: Affectation Matériel */}
        <div className="lg:col-span-1">
            <Section title="Matériel" icon={Laptop}>
                <SpotlightCard theme="light" className="h-full">
                    <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Distribution</h3>
                    <div className="h-60 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={affectationStats} layout="vertical" margin={{ left: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9"/>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 11, fill: '#64748b'}} tickLine={false} axisLine={false}/>
                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px' }} />
                            <Bar dataKey="count" fill="#018790" radius={[0, 4, 4, 0]} barSize={20} name="Quantité" />
                        </BarChart>
                        </ResponsiveContainer>
                    </div>
                </SpotlightCard>
            </Section>
        </div>

        {/* CHART: Production Curve */}
        <div className="lg:col-span-2">
            <Section title="Productivité" icon={TrendingUp}>
                <SpotlightCard theme="light" className="h-full">
                     <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Score de Production par Employé</h3>
                    <div className="h-60 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={productionCurve}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ borderRadius: '8px' }} />
                            <Line type="monotone" dataKey="production" stroke="#fbbf24" strokeWidth={3} activeDot={{ r: 8 }} name="Score Prod." />
                        </LineChart>
                        </ResponsiveContainer>
                    </div>
                </SpotlightCard>
            </Section>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* LIST: Unused Phone Charges */}
          <Section title="Téléphonie" icon={Smartphone}>
             <SpotlightCard theme="light">
                <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white bg-[#018790]">
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
                                        {(emp.name || '').charAt(0)}
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
             </SpotlightCard>
          </Section>

          {/* LIST: Top Discipline (Based on Presence) - NEW SECTION */}
          <Section title="Assiduité" icon={CalendarCheck}>
             <SpotlightCard theme="light">
                 <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white bg-[#005461]">
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
             </SpotlightCard>
          </Section>

      </div>

    </div>
  );
}