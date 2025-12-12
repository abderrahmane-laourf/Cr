import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { CheckCircle, Calendar, Truck, Package, Users, RefreshCw, Filter, TrendingUp, TrendingDown, Trophy, Timer, Target, Gift, ChevronLeft, ChevronRight, CheckCircle2, Wallet } from 'lucide-react';
import Chart from 'chart.js/auto';

const ConfirmationTeamDashboard = () => {
  const location = useLocation();
  const isManager = location.pathname.includes('manager');
  const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const currentUserName = user.name || 'Sarah';

  // State management
  const [orders, setOrders] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    employee: isManager ? 'all' : currentUserName,
    product: 'all',
    pipeline: 'all'
  });
  
  // KPIs
  const [kpis, setKpis] = useState({
    confirmed: 0, scheduled: 0, inTransit: 0, delivered: 0, returned: 0, total: 0
  });
  const [kpisAmmex, setKpisAmmex] = useState({ confirmed: 0, scheduled: 0, inTransit: 0, delivered: 0, returned: 0, total: 0 });
  const [kpisAgadir, setKpisAgadir] = useState({ confirmed: 0, scheduled: 0, inTransit: 0, delivered: 0, returned: 0, total: 0 });
  const [kpisRetournerAmmex, setKpisRetournerAmmex] = useState(0);
  const [kpisRetournerAgadir, setKpisRetournerAgadir] = useState(0);
  const [employeeStats, setEmployeeStats] = useState([]);
  const [deliveryRate, setDeliveryRate] = useState(0);
  
  // Chart Refs
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // --- NEW CHALLENGES STATE ---
  const [availableChallenges, setAvailableChallenges] = useState([]); // Challenges in Carousel
  const [myActiveChallenges, setMyActiveChallenges] = useState([]); // Challenges registered (Progress lines)
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);

  // Initialize data on component mount
  useEffect(() => {
    generateData();
    loadChallenges();
  }, []);

  // Auto-slide for Available Challenges Carousel
  useEffect(() => {
    if (availableChallenges.length > 1) {
      const timer = setInterval(() => {
        setCurrentChallengeIndex((prev) => (prev + 1) % availableChallenges.length);
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [availableChallenges.length]);

  // Apply filters whenever they change
  useEffect(() => {
    applyFilters();
  }, [filters, orders]);

  // Update chart when delivery rate changes
  useEffect(() => {
    if (chartRef.current && kpis.total > 0) {
      updateChart();
    }
  }, [kpis.delivered, kpis.returned]);

  // --- NEW CHALLENGE LOGIC (Mock Data Only) ---

  const loadChallenges = () => {
    // 1. Example of a challenge ALREADY registered (Active)
    const activeExamples = [
      {
        id: 'c1',
        title: 'Sprint Confirmation',
        description: 'Confirmez 50 commandes cette semaine pour débloquer le bonus.',
        target: 50,
        type: 'confirmed',
        reward: '200 DH',
        color: 'from-blue-500 to-indigo-600',
        active: true
      }
    ];

    // 2. Example of challenges AVAILABLE (Not yet registered)
    const availableExamples = [
      {
        id: 'c2',
        title: 'Objectif Livraison',
        description: 'Atteignez 30 colis livrés avec succès.',
        target: 30,
        type: 'delivered',
        reward: '300 DH',
        color: 'from-orange-500 to-red-500',
        active: true
      },
      {
        id: 'c3',
        title: 'Excellence Taux',
        description: 'Maintenez un taux de livraison de 80% (min 10 colis).',
        target: 80,
        type: 'rate',
        reward: '500 DH',
        color: 'from-purple-500 to-pink-500',
        active: true
      }
    ];
    
    // Set state directly without LocalStorage
    setMyActiveChallenges(activeExamples);
    setAvailableChallenges(availableExamples);
  };

  const registerChallenge = (challengeId) => {
    // Find the challenge in the available list
    const challengeToMove = availableChallenges.find(c => c.id === challengeId);
    
    if (challengeToMove) {
      // Add to active
      setMyActiveChallenges(prev => [...prev, challengeToMove]);
      // Remove from available
      setAvailableChallenges(prev => prev.filter(c => c.id !== challengeId));
      // Reset slider index
      setCurrentChallengeIndex(0); 
    }
  };

  const getProgress = (type, target) => {
    let current = 0;
    if (type === 'confirmed') current = kpis.confirmed;
    else if (type === 'delivered') current = kpis.delivered;
    else if (type === 'rate') current = deliveryRate;
    
    // Ensure we don't divide by zero
    const percent = Math.min(Math.round((current / target) * 100), 100);
    return { current, percent };
  };

  // --- DATA GENERATION & FILTERS ---

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
    
    setFilters(prev => ({
      ...prev,
      dateFrom: thirtyDaysAgoStr,
      dateTo: todayStr
    }));
  };

  const applyFilters = () => {
    if (orders.length === 0) return;

    const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : new Date(new Date().setDate(new Date().getDate() - 30));
    const dateTo = filters.dateTo ? new Date(filters.dateTo) : new Date();
    dateTo.setHours(23, 59, 59);

    const employee = filters.employee;
    const product = filters.product;
    const pipeline = filters.pipeline;

    const filtered = orders.filter(o => {
      const orderDate = new Date(o.date);
      const dateMatch = orderDate >= dateFrom && orderDate <= dateTo;
      const empMatch = employee === 'all' || o.emp === employee;
      const prodMatch = product === 'all' || o.product === product;
      const pipelineMatch = pipeline === 'all' || o.pipeline === pipeline;
      
      return dateMatch && empMatch && prodMatch && pipelineMatch;
    });

    setFilteredOrders(filtered);

    const newKpis = {
      confirmed: filtered.filter(o => o.status === "Confirmé" || o.status === "Reporter").length,
      scheduled: filtered.filter(o => o.status === "Confirmé avec date").length,
      inTransit: filtered.filter(o => o.status === "Out for Delivery" || o.status === "Packaging").length,
      delivered: filtered.filter(o => o.status === "Livré").length,
      returned: filtered.filter(o => o.status === "Annulé" || o.status === "Retourné").length,
      total: filtered.length
    };
    setKpis(newKpis);

    // Ammex Logic
    const ammexOrders = filtered.filter(o => o.pipeline === 'Ammex');
    setKpisAmmex({
      confirmed: ammexOrders.filter(o => o.status === "Confirmé" || o.status === "Reporter").length,
      scheduled: ammexOrders.filter(o => o.status === "Confirmé avec date").length,
      inTransit: ammexOrders.filter(o => o.status === "Out for Delivery" || o.status === "Packaging").length,
      delivered: ammexOrders.filter(o => o.status === "Livré").length,
      returned: ammexOrders.filter(o => o.status === "Annulé" || o.status === "Retourné").length,
      total: ammexOrders.length
    });

    // Agadir Logic
    const agadirOrders = filtered.filter(o => o.pipeline === 'Agadir');
    setKpisAgadir({
      confirmed: agadirOrders.filter(o => o.status === "Confirmé" || o.status === "Reporter").length,
      scheduled: agadirOrders.filter(o => o.status === "Confirmé avec date").length,
      inTransit: agadirOrders.filter(o => o.status === "Out for Delivery" || o.status === "Packaging").length,
      delivered: agadirOrders.filter(o => o.status === "Livré").length,
      returned: agadirOrders.filter(o => o.status === "Annulé" || o.status === "Retourné").length,
      total: agadirOrders.length
    });

    setKpisRetournerAmmex(ammexOrders.filter(o => o.status === "Retourner" || o.status === "Retourner-AG").length);
    setKpisRetournerAgadir(agadirOrders.filter(o => o.status === "Retourner" || o.status === "Retourner-AG").length);

    const totalClosed = newKpis.delivered + newKpis.returned;
    const rate = totalClosed > 0 ? Math.round((newKpis.delivered / totalClosed) * 100) : 0;
    setDeliveryRate(rate);

    calculateEmployeeStats(dateFrom, dateTo, product, pipeline);
  };

  const calculateEmployeeStats = (dateFrom, dateTo, product, pipeline) => {
    const stats = {};
    employees.forEach(emp => {
      stats[emp] = { confirmed: 0, scheduled: 0, inTransit: 0, delivered: 0, returned: 0, total: 0, rate: 0 };
    });

    const relevantOrders = orders.filter(o => {
      const orderDate = new Date(o.date);
      return orderDate >= dateFrom && orderDate <= dateTo && 
             (product === 'all' || o.product === product) && 
             (pipeline === 'all' || o.pipeline === pipeline);
    });

    relevantOrders.forEach(o => {
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

  const updateChart = () => {
    if (!chartRef.current) return;
    const ctx = chartRef.current.getContext('2d');
    if (chartInstance.current) chartInstance.current.destroy();

    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Livré', 'Retourné'],
        datasets: [{
          data: [kpis.delivered, kpis.returned],
          backgroundColor: ['#10b981', '#ef4444'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { font: { family: 'Tajawal' } } } },
        cutout: '75%'
      }
    });
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const formatNumber = (num) => num.toLocaleString('fr-FR');

  return (
    <div className="min-h-screen bg-gray-50 pb-16" dir="ltr">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-4 bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="text-blue-600" />
              Tableau de Bord de l'Équipe de Confirmation
            </h1>
            <p className="text-sm text-gray-500 mt-1">Suivi des performances (date + employé + produit)</p>
          </div>
          
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Du</label>
              <input 
                type="date" 
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Au</label>
              <input 
                type="date" 
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {isManager && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Employé</label>
              <select 
                value={filters.employee}
                onChange={(e) => handleFilterChange('employee', e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[140px]"
              >
                <option value="all">Toute l'équipe</option>
                {employees.map(emp => (
                  <option key={emp} value={emp}>{emp}</option>
                ))}
              </select>
            </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Produit</label>
              <select 
                value={filters.product}
                onChange={(e) => handleFilterChange('product', e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[180px]"
              >
                <option value="all">Tous les produits</option>
                {products.map(prod => (
                  <option key={prod} value={prod}>{prod}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Pipeline</label>
              <select 
                value={filters.pipeline}
                onChange={(e) => handleFilterChange('pipeline', e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[140px]"
              >
                <option value="all">Tous</option>
                <option value="Ammex">Livraison Ste de livraison</option>
                <option value="Agadir">Livraison Agadir</option>
              </select>
            </div>

            <button 
              onClick={applyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Filter size={16} />
              Appliquer
            </button>
            <button 
              onClick={generateData}
              className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Données
            </button>
          </div>
        </header>

        {/* --- 2. ACTIVE CHALLENGES (PROGRESS LINES) --- */}
        {myActiveChallenges.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Target size={16} className="text-orange-500" />
              Mes Objectifs en Cours
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myActiveChallenges.map(challenge => {
                const { current, percent } = getProgress(challenge.type, challenge.target);
                return (
                  <div key={challenge.id} className="relative">
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <div className="text-sm font-bold text-slate-800">{challenge.title}</div>
                        <div className="text-xs text-slate-400">{challenge.reward} à la clé</div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-slate-800">{current}</span>
                        <span className="text-xs text-slate-400 font-medium">/{challenge.target}</span>
                      </div>
                    </div>
                    {/* Progress Line */}
                    <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r ${challenge.color} transition-all duration-1000 ease-out`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                    {percent >= 100 && (
                      <div className="absolute top-0 right-0 -mt-1 -mr-1">
                        <div className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg animate-bounce">
                          Complété!
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- 3. AVAILABLE CHALLENGES (CAROUSEL) --- */}
        {availableChallenges.length > 0 && (
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl shadow-lg p-6 mb-6 text-white relative overflow-hidden">
            {/* Background shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <div className="inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-bold mb-3 backdrop-blur-sm">
                  🔥 Nouveau Challenge
                </div>
                <h2 className="text-2xl font-bold mb-2">{availableChallenges[currentChallengeIndex].title}</h2>
                <p className="text-slate-300 text-sm mb-4 max-w-lg">{availableChallenges[currentChallengeIndex].description}</p>
                <div className="flex gap-4 text-sm font-medium">
                  <div className="flex items-center gap-1 text-orange-400">
                    <Target size={16} /> Objectif: {availableChallenges[currentChallengeIndex].target}
                  </div>
                  <div className="flex items-center gap-1 text-green-400">
                    <Wallet size={16} /> Gain: {availableChallenges[currentChallengeIndex].reward}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => registerChallenge(availableChallenges[currentChallengeIndex].id)}
                className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold shadow-xl hover:scale-105 transition-transform flex items-center gap-2"
              >
                Participer <ChevronRight size={16} />
              </button>
            </div>
            
            {/* Dots */}
            {availableChallenges.length > 1 && (
              <div className="flex justify-center gap-1 mt-6">
                {availableChallenges.map((_, idx) => (
                  <button key={idx} onClick={() => setCurrentChallengeIndex(idx)} className={`h-1.5 rounded-full transition-all ${idx === currentChallengeIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/30'}`} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-blue-500">
            <div className="flex justify-between items-start mb-2">
              <div className="text-xs font-bold text-gray-500 uppercase">Commandes Confirmées</div>
              <CheckCircle className="text-blue-500" size={16} />
            </div>
            <div className="text-2xl font-bold text-blue-600">{formatNumber(kpis.confirmed)}</div>
            <div className="text-xs text-gray-500 mt-1">Prêtes pour l'expédition</div>
          </div>
          
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-purple-500">
            <div className="flex justify-between items-start mb-2">
              <div className="text-xs font-bold text-gray-500 uppercase">Confirmées avec Date (Reporté)</div>
              <Calendar className="text-purple-500" size={16} />
            </div>
            <div className="text-2xl font-bold text-purple-600">{formatNumber(kpis.scheduled)}</div>
            <div className="text-xs text-gray-500 mt-1">Expédition future</div>
          </div>
          
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-amber-500">
            <div className="flex justify-between items-start mb-2">
              <div className="text-xs font-bold text-gray-500 uppercase">En Cours de Livraison</div>
              <Truck className="text-amber-500" size={16} />
            </div>
            <div className="text-2xl font-bold text-amber-600">{formatNumber(kpis.inTransit)}</div>
            <div className="text-xs text-gray-500 mt-1">Avec le distributeur</div>
            
            {/* Commission Example */}
            <div className="mt-3 pt-3 border-t border-amber-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-700">Commission</span>
                <span className="text-sm font-bold text-amber-600">Ex: 120 DH</span>
              </div>
              <div className="text-[10px] text-amber-600 mt-0.5 italic">Exemple illustratif</div>
            </div>
          </div>
          
          <div className="bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-800">
            <div className="flex justify-between items-start mb-2">
              <div className="text-xs font-bold text-gray-400 uppercase">Total Traité</div>
              <Package className="text-gray-400" size={16} />
            </div>
            <div className="text-2xl font-bold text-white">{formatNumber(kpis.total)}</div>
            <div className="text-xs text-gray-400 mt-1">Dans le filtre sélectionné</div>
          </div>
        </div>

        {/* Pipeline Statistics - Ammex & Agadir */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
          {/* Livraison Ammex */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Truck className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Livraison Ammex</h3>
                <p className="text-xs text-gray-500">{formatNumber(kpisAmmex.total)} colis</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Envoyer</div>
                <div className="text-xl font-bold text-blue-600">{formatNumber(kpisAmmex.confirmed)}</div>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">En cours</div>
                <div className="text-xl font-bold text-amber-600">{formatNumber(kpisAmmex.inTransit)}</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Livrés</div>
                <div className="text-xl font-bold text-green-600">{formatNumber(kpisAmmex.delivered)}</div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Retourne</div>
                <div className="text-xl font-bold text-red-600">{formatNumber(kpisAmmex.returned)}</div>
              </div>
            </div>
          </div>

          {/* Livraison Agadir */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <Truck className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Livraison Agadir</h3>
                <p className="text-xs text-gray-500">{formatNumber(kpisAgadir.total)} colis</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Envoyer</div>
                <div className="text-xl font-bold text-blue-600">{formatNumber(kpisAgadir.confirmed)}</div>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">En cours</div>
                <div className="text-xl font-bold text-amber-600">{formatNumber(kpisAgadir.inTransit)}</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Livrés</div>
                <div className="text-xl font-bold text-green-600">{formatNumber(kpisAgadir.delivered)}</div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Retourne</div>
                <div className="text-xl font-bold text-red-600">{formatNumber(kpisAgadir.returned)}</div>
              </div>
            </div>
          </div>

          {/* Retourner Ammex */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
              <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center">
                <Package className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Retourner</h3>
                <p className="text-xs text-gray-500">{formatNumber(kpisRetournerAmmex)} colis</p>
              </div>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg text-center">
              <div className="text-xs text-gray-600 mb-1">Total à retourner</div>
              <div className="text-3xl font-bold text-amber-600">{formatNumber(kpisRetournerAmmex)}</div>
            </div>
          </div>

          {/* Statistiques Globales - Tous les Pipelines */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-xl shadow-lg border border-slate-700">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-700">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <Package className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white">Statistiques Globales</h3>
                <p className="text-xs text-slate-400">Ammex + Agadir combinés</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {/* Envoyé (Confirmé) */}
              <div className="p-2 bg-slate-700/50 rounded-lg backdrop-blur-sm">
                <div className="text-[10px] text-slate-400 mb-0.5">Envoyé</div>
                <div className="text-lg font-bold text-blue-400">{formatNumber(kpisAmmex.confirmed + kpisAgadir.confirmed)}</div>
              </div>
              
              {/* En cours */}
              <div className="p-2 bg-slate-700/50 rounded-lg backdrop-blur-sm">
                <div className="text-[10px] text-slate-400 mb-0.5">En cours</div>
                <div className="text-lg font-bold text-amber-400">{formatNumber(kpisAmmex.inTransit + kpisAgadir.inTransit)}</div>
              </div>
              
              {/* Livrés */}
              <div className="p-2 bg-slate-700/50 rounded-lg backdrop-blur-sm">
                <div className="text-[10px] text-slate-400 mb-0.5">Livrés</div>
                <div className="text-lg font-bold text-green-400">{formatNumber(kpisAmmex.delivered + kpisAgadir.delivered)}</div>
              </div>
              
              {/* Retournés */}
              <div className="p-2 bg-slate-700/50 rounded-lg backdrop-blur-sm">
                <div className="text-[10px] text-slate-400 mb-0.5">Retournés</div>
                <div className="text-lg font-bold text-red-400">{formatNumber(kpisAmmex.returned + kpisAgadir.returned)}</div>
              </div>
              
              {/* Retourner */}
              <div className="p-2 bg-slate-700/50 rounded-lg backdrop-blur-sm">
                <div className="text-[10px] text-slate-400 mb-0.5">À retourner</div>
                <div className="text-lg font-bold text-amber-400">{formatNumber(kpisRetournerAmmex + kpisRetournerAgadir)}</div>
              </div>
              
              {/* Total */}
              <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-lg border border-blue-500/30">
                <div className="text-[10px] text-slate-300 mb-0.5 font-semibold">Total</div>
                <div className="text-lg font-bold text-white">{formatNumber(kpisAmmex.total + kpisAgadir.total)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Summary Cards - UPDATED TO FLEX ROW */}
        <div className="w-full flex flex-col xl:flex-row gap-6 mb-6">
            
          {/* Livré Card */}
          <div className="flex-1 bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl shadow-lg border-2 border-green-200 hover:shadow-xl transition-all min-h-[200px]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="text-white" size={24} />
                </div>
                <div>
                  <div className="text-xs font-bold text-green-700 uppercase tracking-wide">Livré</div>
                  <div className="text-[10px] text-green-600">Delivered</div>
                </div>
              </div>
            </div>
            <div className="text-4xl font-black text-green-700 mb-2">{formatNumber(kpis.delivered)}</div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 bg-green-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${kpis.total > 0 ? (kpis.delivered / kpis.total * 100) : 0}%` }}
                ></div>
              </div>
              <span className="text-xs font-semibold text-green-700">
                {kpis.total > 0 ? Math.round(kpis.delivered / kpis.total * 100) : 0}%
              </span>
            </div>
            <div className="text-xs text-green-600 mt-2 font-medium">Commandes réussies</div>
            
            {/* Commission Aperçu */}
            <div className="mt-3 pt-3 border-t border-green-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-green-700">Commission Aperçu</span>
                <span className="text-sm font-bold text-green-600">{formatNumber(kpis.delivered * 15)} DH</span>
              </div>
              <div className="text-[10px] text-green-600 mt-0.5">15 DH / colis livré</div>
            </div>
          </div>
          
          {/* Retourné Card */}
          <div className="flex-1 bg-gradient-to-br from-red-50 to-rose-50 p-8 rounded-2xl shadow-lg border-2 border-red-200 hover:shadow-xl transition-all min-h-[200px]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingDown className="text-white" size={24} />
                </div>
                <div>
                  <div className="text-xs font-bold text-red-700 uppercase tracking-wide">Retourné</div>
                  <div className="text-[10px] text-red-600">Returned</div>
                </div>
              </div>
            </div>
            <div className="text-4xl font-black text-red-700 mb-2">{formatNumber(kpis.returned)}</div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 bg-red-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 rounded-full transition-all duration-500"
                  style={{ width: `${kpis.total > 0 ? (kpis.returned / kpis.total * 100) : 0}%` }}
                ></div>
              </div>
              <span className="text-xs font-semibold text-red-700">
                {kpis.total > 0 ? Math.round(kpis.returned / kpis.total * 100) : 0}%
              </span>
            </div>
            <div className="text-xs text-red-600 mt-2 font-medium">Commandes échouées</div>
            
            {/* Commission Alert */}
            <div className="mt-3 pt-3 border-t border-red-200">
              <div className="bg-red-100 rounded-lg p-2 border border-red-300">
                <div className="flex items-center gap-2">
                  <div className="text-red-700 text-lg">⚠️</div>
                  <div className="flex-1">
                    <div className="text-[10px] font-semibold text-red-800 uppercase">Alerte Commission</div>
                    <div className="text-xs font-bold text-red-600">-{formatNumber(kpis.returned * 5)} DH perdu</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Taux de Livraison Card */}
          <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl shadow-lg border-2 border-blue-200 hover:shadow-xl transition-all min-h-[200px]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="text-white" size={24} />
              </div>
              <div>
                <div className="text-xs font-bold text-blue-700 uppercase tracking-wide">Taux de Livraison</div>
                <div className="text-[10px] text-blue-600">Delivery Rate</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-5xl font-black text-blue-700 mb-1">{deliveryRate}%</div>
                <div className="text-xs text-blue-600 font-medium">Taux de réussite</div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-green-600 font-medium flex items-center gap-1">
                      <CheckCircle size={12} /> Livrés
                    </span>
                    <span className="font-bold text-green-700">{formatNumber(kpis.delivered)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-red-600 font-medium flex items-center gap-1">
                      <TrendingDown size={12} /> Retournés
                    </span>
                    <span className="font-bold text-red-700">{formatNumber(kpis.returned)}</span>
                  </div>
                </div>
              </div>
              
              <div className="relative w-24 h-24 ml-4">
                <canvas ref={chartRef}></canvas>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-lg font-bold text-blue-700">{deliveryRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Employee Performance Table */}
        {isManager && (
        <div className="w-full">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Users size={20} className="text-blue-600" />
                Performance des Employés (selon le filtre)
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Employé</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">Confirmé</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">Reporté</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">En cours</th>
                  <th className="px-4 py-3 text-center font-medium text-green-600">Livré</th>
                  <th className="px-4 py-3 text-center font-medium text-red-600">Retourné</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">Taux de réussite</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {employeeStats.map((emp, index) => (
                  <tr key={emp.name} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                          {emp.name[0]}
                        </div>
                        <div className="font-bold">{emp.name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">{emp.confirmed}</td>
                    <td className="px-4 py-3 text-center text-purple-600">{emp.scheduled}</td>
                    <td className="px-4 py-3 text-center text-amber-600">{emp.inTransit}</td>
                    <td className="px-4 py-3 text-center text-green-600 font-bold">{emp.delivered}</td>
                    <td className="px-4 py-3 text-center text-red-600">{emp.returned}</td>
                    <td className="px-4 py-3 text-center font-bold" style={{color: emp.rate >= 50 ? '#10b981' : '#ef4444'}}>
                      {emp.rate}%
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
export default ConfirmationTeamDashboard;