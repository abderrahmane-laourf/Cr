import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  CheckCircle, Calendar, Truck, Package, Users, RefreshCw, Filter, 
  TrendingUp, TrendingDown, Target, Wallet, ChevronRight, 
  AlertCircle, MapPin, BarChart3, ArrowUpRight, RotateCcw
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend 
} from 'recharts';

// ============================================================================
// UI COMPONENTS (Reusable)
// ============================================================================

const SpotlightCard = ({ children, className = "", onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}
    >
      <div className="relative z-10 p-4 h-full">
        {children}
      </div>
    </div>
  );
};

const InputField = ({ label, type = "text", value, onChange, options }) => (
  <div className="group flex flex-col gap-1">
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-focus-within:text-[#2563EB] transition-colors">
      {label}
    </label>
    <div className="relative">
      {options ? (
        <select 
          value={value}
          onChange={onChange}
          className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 outline-none transition-all appearance-none cursor-pointer"
        >
          {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      ) : (
        <input 
          type={type} 
          value={value}
          onChange={onChange}
          className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 outline-none transition-all"
        />
      )}
    </div>
  </div>
);

const StatBadge = ({ icon: Icon, label, value, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    red: 'bg-red-50 text-red-700 border-red-100',
  };
  return (
    <div className={`flex flex-col p-2.5 rounded-xl border ${colors[color] || colors.blue}`}>
      <span className="text-[9px] uppercase font-bold opacity-70 mb-0.5 flex items-center gap-1">
        {Icon && <Icon size={10} />} {label}
      </span>
      <span className="text-lg font-black leading-tight">{value}</span>
    </div>
  );
};

// Add Tajawal Font
const fontStyle = document.createElement('style');
fontStyle.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
  body { font-family: 'Tajawal', sans-serif; }
`;
document.head.appendChild(fontStyle);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ConfirmationTeamDashboard = () => {
  const location = useLocation();
  const isManager = location.pathname.includes('manager');
  const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const currentUserName = user.name || 'Sarah';

  // --- STATE ---
  const [orders, setOrders] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    employee: isManager ? 'all' : currentUserName,
    product: 'all',
    pipeline: 'all'
  });
  
  // KPIs
  const [kpis, setKpis] = useState({ confirmed: 0, scheduled: 0, inTransit: 0, delivered: 0, returned: 0, total: 0 });
  const [kpisAmmex, setKpisAmmex] = useState({ confirmed: 0, scheduled: 0, inTransit: 0, delivered: 0, returned: 0, total: 0 });
  const [kpisAgadir, setKpisAgadir] = useState({ confirmed: 0, scheduled: 0, inTransit: 0, delivered: 0, returned: 0, total: 0 });
  const [kpisRetournerAmmex, setKpisRetournerAmmex] = useState(0);
  const [kpisRetournerAgadir, setKpisRetournerAgadir] = useState(0);
  const [employeeStats, setEmployeeStats] = useState([]);
  const [deliveryRate, setDeliveryRate] = useState(0);

  // Challenges
  const [availableChallenges, setAvailableChallenges] = useState([]);
  const [myActiveChallenges, setMyActiveChallenges] = useState([]);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);

  // --- EFFECT ---
  useEffect(() => {
    generateData();
    loadChallenges();
  }, []);

  useEffect(() => {
    if (availableChallenges.length > 1) {
      const timer = setInterval(() => {
        setCurrentChallengeIndex((prev) => (prev + 1) % availableChallenges.length);
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [availableChallenges.length]);

  useEffect(() => {
    applyFilters();
  }, [filters, orders]);

  // --- LOGIC: DATA GENERATION ---
  const generateData = () => {
    const savedColis = localStorage.getItem('colis');
    const allColis = savedColis ? JSON.parse(savedColis) : [];
    const savedProducts = localStorage.getItem('products');
    const allProducts = savedProducts ? JSON.parse(savedProducts) : [];
    
    const uniqueEmployees = [...new Set(allColis.map(c => c.employee).filter(Boolean))];
    
    const newOrders = allColis.map(c => ({
      id: c.id,
      emp: c.employee || 'Non assigné',
      product: c.productName || allProducts.find(p => p.id === c.productId)?.nom || 'Produit inconnu',
      status: c.stage || 'Reporter',
      date: c.dateCreated ? c.dateCreated.split('T')[0] : new Date().toISOString().split('T')[0],
      pipelineId: c.pipelineId || 1,
      pipeline: c.pipelineId === 2 ? 'Agadir' : 'Ammex'
    }));

    setOrders(newOrders);
    setEmployees(uniqueEmployees.length > 0 ? uniqueEmployees : ["Sarah", "Mohamed", "Khaled", "Huda", "Karim"]);
    setProducts([...new Set(newOrders.map(o => o.product))]);
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
    
    setFilters(prev => ({ ...prev, dateFrom: thirtyDaysAgoStr, dateTo: todayStr }));
  };

  const applyFilters = () => {
    if (orders.length === 0) return;

    const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : new Date(new Date().setDate(new Date().getDate() - 30));
    const dateTo = filters.dateTo ? new Date(filters.dateTo) : new Date();
    dateTo.setHours(23, 59, 59);

    const filtered = orders.filter(o => {
      const orderDate = new Date(o.date);
      const dateMatch = orderDate >= dateFrom && orderDate <= dateTo;
      const empMatch = filters.employee === 'all' || o.emp === filters.employee;
      const prodMatch = filters.product === 'all' || o.product === filters.product;
      const pipelineMatch = filters.pipeline === 'all' || o.pipeline === filters.pipeline;
      return dateMatch && empMatch && prodMatch && pipelineMatch;
    });

    const calculateKPIs = (data) => ({
      confirmed: data.filter(o => o.status === "Confirmé" || o.status === "Reporter").length,
      scheduled: data.filter(o => o.status === "Confirmé avec date").length,
      inTransit: data.filter(o => o.status === "Out for Delivery" || o.status === "Packaging").length,
      delivered: data.filter(o => o.status === "Livré").length,
      returned: data.filter(o => o.status === "Annulé" || o.status === "Retourné").length,
      total: data.length
    });

    const mainKpis = calculateKPIs(filtered);
    setKpis(mainKpis);

    const ammexOrders = filtered.filter(o => o.pipeline === 'Ammex');
    setKpisAmmex(calculateKPIs(ammexOrders));

    const agadirOrders = filtered.filter(o => o.pipeline === 'Agadir');
    setKpisAgadir(calculateKPIs(agadirOrders));

    setKpisRetournerAmmex(ammexOrders.filter(o => o.status === "Retourner" || o.status === "Retourner-AG").length);
    setKpisRetournerAgadir(agadirOrders.filter(o => o.status === "Retourner" || o.status === "Retourner-AG").length);

    const totalClosed = mainKpis.delivered + mainKpis.returned;
    const rate = totalClosed > 0 ? Math.round((mainKpis.delivered / totalClosed) * 100) : 0;
    setDeliveryRate(rate);

    calculateEmployeeStats(filtered);
  };

  const calculateEmployeeStats = (filteredOrders) => {
    const stats = {};
    employees.forEach(emp => {
      stats[emp] = { confirmed: 0, scheduled: 0, inTransit: 0, delivered: 0, returned: 0, total: 0, rate: 0 };
    });

    filteredOrders.forEach(o => {
      if (!stats[o.emp]) stats[o.emp] = { confirmed: 0, scheduled: 0, inTransit: 0, delivered: 0, returned: 0, total: 0, rate: 0 };
      stats[o.emp].total++;
      if (o.status === "Confirmé" || o.status === "Reporter") stats[o.emp].confirmed++;
      else if (o.status === "Confirmé avec date") stats[o.emp].scheduled++;
      else if (o.status === "Out for Delivery" || o.status === "Packaging") stats[o.emp].inTransit++;
      else if (o.status === "Livré") stats[o.emp].delivered++;
      else if (o.status === "Annulé" || o.status === "Retourné") stats[o.emp].returned++;
    });

    Object.keys(stats).forEach(emp => {
      const totalClosed = stats[emp].delivered + stats[emp].returned;
      stats[emp].rate = totalClosed > 0 ? Math.round((stats[emp].delivered / totalClosed) * 100) : 0;
    });

    const sortedStats = Object.keys(stats)
      .map(name => ({ name, ...stats[name] }))
      .sort((a, b) => b.delivered - a.delivered);

    setEmployeeStats(sortedStats);
  };

  // --- LOGIC: CHALLENGES ---
  const loadChallenges = () => {
    setMyActiveChallenges([
      { id: 'c1', title: 'Sprint Confirmation', description: 'Confirmez 50 commandes cette semaine.', target: 50, type: 'confirmed', reward: '200 DH', color: 'from-blue-500 to-indigo-600' }
    ]);
    setAvailableChallenges([
      { id: 'c2', title: 'Objectif Livraison', description: 'Atteignez 30 colis livrés avec succès.', target: 30, type: 'delivered', reward: '300 DH' },
      { id: 'c3', title: 'Excellence Taux', description: 'Maintenez un taux de livraison de 80% (min 10 colis).', target: 80, type: 'rate', reward: '500 DH' }
    ]);
  };

  const registerChallenge = (id) => {
    const challenge = availableChallenges.find(c => c.id === id);
    if (challenge) {
      setMyActiveChallenges(prev => [...prev, { ...challenge, color: 'from-emerald-500 to-teal-600' }]);
      setAvailableChallenges(prev => prev.filter(c => c.id !== id));
      setCurrentChallengeIndex(0);
    }
  };

  const getProgress = (type, target) => {
    let current = 0;
    if (type === 'confirmed') current = kpis.confirmed;
    else if (type === 'delivered') current = kpis.delivered;
    else if (type === 'rate') current = deliveryRate;
    const percent = Math.min(Math.round((current / target) * 100), 100);
    return { current, percent };
  };

  const formatNumber = (num) => num.toLocaleString('fr-FR');

  // --- CHARTS DATA ---
  const rateChartData = [
    { name: 'Livré', value: kpis.delivered, color: '#10b981' }, // Emerald
    { name: 'Retourné', value: kpis.returned, color: '#ef4444' }, // Red
  ];

  return (
    <div className="min-h-screen bg-transparent p-4 space-y-4 animate-[fade-in_0.6s_ease-out]">
      
      {/* 1. Header & Filters */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-[#2563EB] flex items-center gap-2">
            <Users size={28} />
            Dashboard Confirmation
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Suivi des performances et gestion des commandes (Date + Employé + Produit)</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 w-full xl:w-auto">
          <InputField label="Du" type="date" value={filters.dateFrom} onChange={e => setFilters({...filters, dateFrom: e.target.value})} />
          <InputField label="Au" type="date" value={filters.dateTo} onChange={e => setFilters({...filters, dateTo: e.target.value})} />
          
          {isManager && (
            <InputField 
              label="Employé" 
              value={filters.employee} 
              onChange={e => setFilters({...filters, employee: e.target.value})}
              options={[{value: 'all', label: "Toute l'équipe"}, ...employees.map(e => ({value: e, label: e}))]} 
            />
          )}

          <InputField 
            label="Produit" 
            value={filters.product} 
            onChange={e => setFilters({...filters, product: e.target.value})}
            options={[{value: 'all', label: "Tous"}, ...products.map(p => ({value: p, label: p}))]} 
          />

          <InputField 
            label="Pipeline" 
            value={filters.pipeline} 
            onChange={e => setFilters({...filters, pipeline: e.target.value})}
            options={[{value: 'all', label: "Tous"}, {value: 'Ammex', label: 'Ammex'}, {value: 'Agadir', label: 'Agadir'}]} 
          />

          <div className="flex items-end gap-2">
            <button onClick={applyFilters} className="h-[34px] px-3 bg-[#2563EB] text-white rounded-lg hover:bg-[#1e40af] transition-colors shadow-lg shadow-blue-900/20 flex items-center justify-center">
              <Filter size={16} />
            </button>
            <button onClick={generateData} className="h-[34px] px-3 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. CHALLENGES SECTION (Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Active Challenges */}
        {myActiveChallenges.length > 0 && (
          <SpotlightCard className="lg:col-span-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Target size={14} className="text-orange-500" /> Mes Objectifs en Cours
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myActiveChallenges.map(challenge => {
                const { current, percent } = getProgress(challenge.type, challenge.target);
                return (
                  <div key={challenge.id} className="relative bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <div className="text-xs font-bold text-slate-800">{challenge.title}</div>
                        <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                            <Wallet size={10} className="text-[#2563EB]"/> {challenge.reward} à la clé
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-slate-800">{current}</span>
                        <span className="text-[10px] text-slate-400 font-medium">/{challenge.target}</span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r ${challenge.color} transition-all duration-1000 ease-out`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SpotlightCard>
        )}

        {/* Carousel Available Challenges */}
        {availableChallenges.length > 0 && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e3a8a] to-[#2563EB] text-white p-4 shadow-xl lg:col-span-1 flex flex-col justify-center min-h-[160px]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mr-8 -mt-8 blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[9px] font-bold mb-2 backdrop-blur-sm border border-white/10">
                🔥 Challenge Dispo
              </div>
              <h2 className="text-lg font-bold mb-1">{availableChallenges[currentChallengeIndex].title}</h2>
              <p className="text-white/80 text-[10px] mb-3 line-clamp-2">{availableChallenges[currentChallengeIndex].description}</p>
              
              <div className="flex justify-between items-end">
                  <div className="text-[10px] font-medium space-y-0.5">
                      <div className="flex items-center gap-1"><Target size={10} className="text-orange-300"/> Obj: {availableChallenges[currentChallengeIndex].target}</div>
                      <div className="flex items-center gap-1"><Wallet size={10} className="text-emerald-300"/> Gain: {availableChallenges[currentChallengeIndex].reward}</div>
                  </div>
                  <button 
                    onClick={() => registerChallenge(availableChallenges[currentChallengeIndex].id)}
                    className="px-3 py-1.5 bg-white text-[#1e3a8a] rounded-lg text-[10px] font-bold shadow-lg hover:bg-slate-50 transition-colors flex items-center gap-1"
                  >
                    Participer <ChevronRight size={12} />
                  </button>
              </div>
              
              {/* Dots */}
              {availableChallenges.length > 1 && (
                <div className="flex gap-1 mt-3 justify-center">
                  {availableChallenges.map((_, idx) => (
                    <div key={idx} className={`h-1 rounded-full transition-all duration-300 ${idx === currentChallengeIndex ? 'w-3 bg-white' : 'w-1 bg-white/40'}`} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. KEY METRICS (Top Row) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SpotlightCard className="border-l-4 border-l-blue-500">
          <div className="flex justify-between items-start mb-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirmées</span>
            <div className="p-1 bg-blue-50 text-blue-600 rounded-lg"><CheckCircle size={14} /></div>
          </div>
          <div className="text-2xl font-black text-slate-800">{formatNumber(kpis.confirmed)}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Prêtes pour expédition</p>
        </SpotlightCard>

        <SpotlightCard className="border-l-4 border-l-purple-500">
          <div className="flex justify-between items-start mb-1">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reportées</span>
             <div className="p-1 bg-purple-50 text-purple-600 rounded-lg"><Calendar size={14} /></div>
          </div>
          <div className="text-2xl font-black text-slate-800">{formatNumber(kpis.scheduled)}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Confirmées avec date future</p>
        </SpotlightCard>

        <SpotlightCard className="border-l-4 border-l-amber-500">
           <div className="flex justify-between items-start mb-1">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">En Cours</span>
             <div className="p-1 bg-amber-50 text-amber-600 rounded-lg"><Truck size={14} /></div>
          </div>
          <div className="text-2xl font-black text-slate-800">{formatNumber(kpis.inTransit)}</div>
          <div className="flex justify-between items-center mt-0.5">
             <p className="text-[10px] text-slate-400">Chez le livreur</p>
             <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1 py-0.5 rounded">Comm: ~120DH</span>
          </div>
        </SpotlightCard>

        {/* Global Dark Card */}
        <div className="relative overflow-hidden rounded-2xl bg-[#1e3a8a] p-4 shadow-lg text-white border border-slate-700">
           <div className="absolute top-0 right-0 p-2 opacity-10"><Package size={48} /></div>
           <div className="relative z-10">
               <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">Total Traité</div>
               <div className="text-2xl font-black text-white mb-0.5">{formatNumber(kpis.total)}</div>
               <p className="text-[10px] text-slate-300">Dans le filtre sélectionné</p>
               <div className="mt-2 pt-2 border-t border-white/10 flex justify-between text-[10px]">
                   <span>Ammex: {formatNumber(kpisAmmex.total)}</span>
                   <span>Agadir: {formatNumber(kpisAgadir.total)}</span>
               </div>
           </div>
        </div>
      </div>

      {/* 4. PIPELINE DETAILS (Ammex / Agadir / Returns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        
        {/* Ammex (Compact) - REMOVED RETOURNE & A RETOURNER */}
        <SpotlightCard>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-50">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center"><MapPin size={16}/></div>
                <div>
                    <h3 className="font-bold text-slate-800 text-sm">Ste de livraison</h3>
                    <p className="text-[10px] text-slate-500">{formatNumber(kpisAmmex.total)} Colis</p>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
                <StatBadge label="Envoyé" value={formatNumber(kpisAmmex.confirmed)} color="blue" />
                <StatBadge label="En Cours" value={formatNumber(kpisAmmex.inTransit)} color="amber" />
                <StatBadge label="Livrés" value={formatNumber(kpisAmmex.delivered)} color="green" />
            </div>
        </SpotlightCard>

        {/* Agadir (Compact) - REMOVED RETOURNE & A RETOURNER */}
        <SpotlightCard>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-50">
                <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center"><MapPin size={16}/></div>
                <div>
                    <h3 className="font-bold text-slate-800 text-sm">Livraison Agadir</h3>
                    <p className="text-[10px] text-slate-500">{formatNumber(kpisAgadir.total)} Colis</p>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
                <StatBadge label="Envoyé" value={formatNumber(kpisAgadir.confirmed)} color="blue" />
                <StatBadge label="En Cours" value={formatNumber(kpisAgadir.inTransit)} color="amber" />
                <StatBadge label="Livrés" value={formatNumber(kpisAgadir.delivered)} color="green" />
            </div>
        </SpotlightCard>

        {/* NEW CARD: GESTION RETOURNER (TOTAL ONLY) */}
        <SpotlightCard>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-50">
                <div className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center"><RotateCcw size={16}/></div>
                <div>
                    <h3 className="font-bold text-slate-800 text-sm">Gestion Retourner</h3>
                    <p className="text-[10px] text-slate-500">Action requise</p>
                </div>
            </div>
            <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-red-100 bg-red-50 h-[88px]">
                <span className="text-[10px] uppercase font-bold opacity-70 mb-1 text-red-700">Total à Retourner</span>
                <span className="text-3xl font-black text-red-700">{formatNumber(kpisRetournerAmmex + kpisRetournerAgadir)}</span>
            </div>
        </SpotlightCard>

        {/* Global Summary (Vertical - Compact) */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col justify-center">
             <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 text-center">Global</h3>
             <div className="space-y-2">
                 <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                     <span className="text-[10px] font-bold text-slate-500 uppercase">Envoyé</span>
                     <span className="font-bold text-blue-600 text-sm">{formatNumber(kpisAmmex.confirmed + kpisAgadir.confirmed)}</span>
                 </div>
                 <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                     <span className="text-[10px] font-bold text-slate-500 uppercase">Livrés</span>
                     <span className="font-bold text-green-600 text-sm">{formatNumber(kpisAmmex.delivered + kpisAgadir.delivered)}</span>
                 </div>
                 <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                     <span className="text-[10px] font-bold text-slate-500 uppercase">Retournés</span>
                     <span className="font-bold text-red-600 text-sm">{formatNumber(kpisAmmex.returned + kpisAgadir.returned)}</span>
                 </div>
             </div>
        </div>

      </div>

      {/* 5. PERFORMANCE ANALYTICS & CHARTS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        
        {/* Delivered Card */}
        <SpotlightCard className="flex flex-col justify-between border-l-4 border-l-green-500">
           <div>
               <div className="flex items-center gap-2 mb-1">
                   <div className="p-1.5 bg-green-50 rounded-lg text-green-600"><CheckCircle size={16} /></div>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Colis Livrés</span>
               </div>
               <div className="text-2xl font-black text-green-600 mb-1">{formatNumber(kpis.delivered)}</div>
               <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-1">
                   <div className="h-full bg-green-500" style={{width: `${kpis.total > 0 ? (kpis.delivered/kpis.total)*100 : 0}%`}}></div>
               </div>
               <p className="text-[10px] text-slate-400">Taux par rapport au total traité</p>
           </div>
           <div className="mt-3 pt-2 border-t border-slate-100">
               <div className="flex justify-between text-[10px]">
                   <span className="font-bold text-slate-500">Commission Estimée</span>
                   <span className="font-black text-green-600">{formatNumber(kpis.delivered * 15)} DH</span>
               </div>
           </div>
        </SpotlightCard>

        {/* Returned Card */}
        <SpotlightCard className="flex flex-col justify-between border-l-4 border-l-red-500">
           <div>
               <div className="flex items-center gap-2 mb-1">
                   <div className="p-1.5 bg-red-50 rounded-lg text-red-600"><AlertCircle size={16} /></div>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Colis Retournés</span>
               </div>
               <div className="text-2xl font-black text-red-600 mb-1">{formatNumber(kpis.returned)}</div>
               <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-1">
                   <div className="h-full bg-red-500" style={{width: `${kpis.total > 0 ? (kpis.returned/kpis.total)*100 : 0}%`}}></div>
               </div>
               <p className="text-[10px] text-slate-400">Taux par rapport au total traité</p>
           </div>
           <div className="mt-3 pt-2 border-t border-slate-100">
                <div className="p-1.5 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2">
                    <TrendingDown size={12} className="text-red-500"/>
                    <div>
                        <span className="text-[9px] font-bold text-red-700 uppercase block">Perte Potentielle</span>
                        <span className="text-[10px] font-black text-red-600">-{formatNumber(kpis.returned * 5)} DH</span>
                    </div>
                </div>
           </div>
        </SpotlightCard>

        {/* Delivery Rate Chart (Recharts) */}
        <SpotlightCard className="flex flex-col items-center justify-center">
            <h3 className="text-xs font-bold text-slate-600 uppercase mb-2 flex items-center gap-2">
                <BarChart3 size={14} className="text-[#2563EB]" /> Taux de Réussite
            </h3>
            <div className="relative w-32 h-32">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={rateChartData}
                            cx="50%" cy="50%"
                            innerRadius={40} outerRadius={60}
                            paddingAngle={5}
                            dataKey="value"
                            startAngle={90} endAngle={-270}
                        >
                            {rateChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                            ))}
                        </Pie>
                        <RechartsTooltip />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl font-black text-slate-800">{deliveryRate}%</span>
                    <span className="text-[9px] uppercase font-bold text-slate-400">Succès</span>
                </div>
            </div>
            <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Livré
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Retourné
                </div>
            </div>
        </SpotlightCard>

      </div>

      {/* 6. EMPLOYEE TABLE (Manager Only) */}
      {isManager && (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
           <Users size={16} className="text-[#2563EB]" />
           <h3 className="font-bold text-slate-800 text-sm">Performance de l'Équipe</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Employé</th>
                <th className="px-4 py-3 text-center">Confirmé</th>
                <th className="px-4 py-3 text-center text-purple-600">Reporté</th>
                <th className="px-4 py-3 text-center text-amber-600">En Cours</th>
                <th className="px-4 py-3 text-center text-emerald-600">Livré</th>
                <th className="px-4 py-3 text-center text-red-600">Retourné</th>
                <th className="px-4 py-3 text-center">Taux</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employeeStats.map(emp => (
                <tr key={emp.name} className="hover:bg-slate-50/80 transition-colors font-medium">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center font-bold text-[10px]">
                        {emp.name.charAt(0)}
                      </div>
                      <span className="text-slate-700 font-bold">{emp.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-slate-600">{emp.confirmed}</td>
                  <td className="px-4 py-3 text-center text-purple-600 bg-purple-50/30">{emp.scheduled}</td>
                  <td className="px-4 py-3 text-center text-amber-600 bg-amber-50/30">{emp.inTransit}</td>
                  <td className="px-4 py-3 text-center text-emerald-600 font-bold bg-emerald-50/30">{emp.delivered}</td>
                  <td className="px-4 py-3 text-center text-red-600 bg-red-50/30">{emp.returned}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${emp.rate >= 50 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {emp.rate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

    </div>
  );
}

export default ConfirmationTeamDashboard;