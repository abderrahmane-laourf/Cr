import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { CheckCircle, Calendar, Truck, Package, Users, RefreshCw, Filter, TrendingUp, TrendingDown, User } from 'lucide-react';

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
  const [kpis, setKpis] = useState({
    confirmed: 0,
    scheduled: 0,
    inTransit: 0,
    delivered: 0,
    returned: 0,
    total: 0
  });
  const [kpisAmmex, setKpisAmmex] = useState({
    confirmed: 0,
    scheduled: 0,
    inTransit: 0,
    delivered: 0,
    returned: 0,
    total: 0
  });
  const [kpisAgadir, setKpisAgadir] = useState({
    confirmed: 0,
    scheduled: 0,
    inTransit: 0,
    delivered: 0,
    returned: 0,
    total: 0
  });
  const [employeeStats, setEmployeeStats] = useState([]);
  const [deliveryRate, setDeliveryRate] = useState(0);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Initialize data on component mount
  useEffect(() => {
    generateData();
  }, []);

  // Apply filters whenever they change
  useEffect(() => {
    applyFilters();
  }, [filters, orders]);

  // Update chart when delivery rate changes
  useEffect(() => {
    if (chartRef.current && chartInstance.current) {
      updateChart();
    }
  }, [kpis.delivered, kpis.returned]);

  // Load real data from localStorage
  const generateData = () => {
    // Load colis from localStorage
    const savedColis = localStorage.getItem('colis');
    const allColis = savedColis ? JSON.parse(savedColis) : [];
    
    // Load products from localStorage
    const savedProducts = localStorage.getItem('products');
    const allProducts = savedProducts ? JSON.parse(savedProducts) : [];
    
    // Get unique employees
    const uniqueEmployees = [...new Set(allColis.map(c => c.employee).filter(Boolean))];
    
    // Convert colis to orders format
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
    
    // Set default date filters (last 30 days)
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

  // Apply filters and calculate metrics
  const applyFilters = () => {
    if (orders.length === 0) return;

    const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : new Date(new Date().setDate(new Date().getDate() - 30));
    const dateTo = filters.dateTo ? new Date(filters.dateTo) : new Date();
    dateTo.setHours(23, 59, 59); // End of day

    const employee = filters.employee;
    const product = filters.product;
    const pipeline = filters.pipeline;

    // Filter orders based on criteria
    const filtered = orders.filter(o => {
      const orderDate = new Date(o.date);
      const dateMatch = orderDate >= dateFrom && orderDate <= dateTo;
      const empMatch = employee === 'all' || o.emp === employee;
      const prodMatch = product === 'all' || o.product === product;
      const pipelineMatch = pipeline === 'all' || o.pipeline === pipeline;
      
      return dateMatch && empMatch && prodMatch && pipelineMatch;
    });

    setFilteredOrders(filtered);

    // Calculate KPIs for all filtered
    const newKpis = {
      confirmed: filtered.filter(o => o.status === "Confirmé" || o.status === "Reporter").length,
      scheduled: filtered.filter(o => o.status === "Confirmé avec date").length,
      inTransit: filtered.filter(o => o.status === "Out for Delivery" || o.status === "Packaging").length,
      delivered: filtered.filter(o => o.status === "Livré").length,
      returned: filtered.filter(o => o.status === "Annulé" || o.status === "Retourné").length,
      total: filtered.length
    };

    setKpis(newKpis);

    // Calculate KPIs for Ammex
    const ammexOrders = filtered.filter(o => o.pipeline === 'Ammex');
    const newKpisAmmex = {
      confirmed: ammexOrders.filter(o => o.status === "Confirmé" || o.status === "Reporter").length,
      scheduled: ammexOrders.filter(o => o.status === "Confirmé avec date").length,
      inTransit: ammexOrders.filter(o => o.status === "Out for Delivery" || o.status === "Packaging").length,
      delivered: ammexOrders.filter(o => o.status === "Livré").length,
      returned: ammexOrders.filter(o => o.status === "Annulé" || o.status === "Retourné").length,
      total: ammexOrders.length
    };

    setKpisAmmex(newKpisAmmex);

    // Calculate KPIs for Agadir
    const agadirOrders = filtered.filter(o => o.pipeline === 'Agadir');
    const newKpisAgadir = {
      confirmed: agadirOrders.filter(o => o.status === "Confirmé" || o.status === "Reporter").length,
      scheduled: agadirOrders.filter(o => o.status === "Confirmé avec date").length,
      inTransit: agadirOrders.filter(o => o.status === "Out for Delivery" || o.status === "Packaging").length,
      delivered: agadirOrders.filter(o => o.status === "Livré").length,
      returned: agadirOrders.filter(o => o.status === "Annulé" || o.status === "Retourné").length,
      total: agadirOrders.length
    };

    setKpisAgadir(newKpisAgadir);

    // Calculate delivery rate
    const totalClosed = newKpis.delivered + newKpis.returned;
    const rate = totalClosed > 0 ? Math.round((newKpis.delivered / totalClosed) * 100) : 0;
    setDeliveryRate(rate);

    // Calculate employee stats
    calculateEmployeeStats(dateFrom, dateTo, product, pipeline);
  };

  // Calculate statistics for each employee
  const calculateEmployeeStats = (dateFrom, dateTo, product, pipeline) => {
    const stats = {};
    
    // Initialize stats for each employee
    employees.forEach(emp => {
      stats[emp] = {
        confirmed: 0,
        scheduled: 0,
        inTransit: 0,
        delivered: 0,
        returned: 0,
        total: 0,
        rate: 0
      };
    });

    // Filter orders by date, product, and pipeline
    orders.forEach(order => {
      const orderDate = new Date(order.date);
      if (orderDate >= dateFrom && orderDate <= dateTo) {
        const prodMatch = product === 'all' || order.product === product;
        const pipelineMatch = pipeline === 'all' || order.pipeline === pipeline;
        
        if (prodMatch && pipelineMatch && stats[order.emp]) {
          if (order.status === "Confirmé" || order.status === "Reporter") {
            stats[order.emp].confirmed++;
          } else if (order.status === "Confirmé avec date") {
            stats[order.emp].scheduled++;
          } else if (order.status === "Out for Delivery" || order.status === "Packaging") {
            stats[order.emp].inTransit++;
          } else if (order.status === "Livré") {
            stats[order.emp].delivered++;
          } else if (order.status === "Annulé" || order.status === "Retourné") {
            stats[order.emp].returned++;
          }
          stats[order.emp].total++;
        }
      }
    });

    // Calculate delivery rate for each employee
    const empStats = Object.entries(stats).map(([name, data]) => {
      const totalClosed = data.delivered + data.returned;
      const rate = totalClosed > 0 ? Math.round((data.delivered / totalClosed) * 100) : 0;
      return {
        name,
        ...data,
        rate
      };
    });

    setEmployeeStats(empStats);
  };

  // Initialize or update the chart
  const updateChart = () => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    
    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart
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
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: {
                family: 'Tajawal'
              }
            }
          }
        },
        cutout: '75%'
      }
    });
  };

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Format number with French locale
  const formatNumber = (num) => {
    return num.toLocaleString('fr-FR');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16" dir="ltr">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                <option value="Ammex">Livraison Ammex</option>
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

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
                <div className="text-xs text-gray-600 mb-1">Confirmés</div>
                <div className="text-xl font-bold text-blue-600">{formatNumber(kpisAmmex.confirmed)}</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Reportés</div>
                <div className="text-xl font-bold text-purple-600">{formatNumber(kpisAmmex.scheduled)}</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Livrés</div>
                <div className="text-xl font-bold text-green-600">{formatNumber(kpisAmmex.delivered)}</div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Retournés</div>
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
                <div className="text-xs text-gray-600 mb-1">Confirmés</div>
                <div className="text-xl font-bold text-blue-600">{formatNumber(kpisAgadir.confirmed)}</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Reportés</div>
                <div className="text-xl font-bold text-purple-600">{formatNumber(kpisAgadir.scheduled)}</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Livrés</div>
                <div className="text-xl font-bold text-green-600">{formatNumber(kpisAgadir.delivered)}</div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Retournés</div>
                <div className="text-xl font-bold text-red-600">{formatNumber(kpisAgadir.returned)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-green-500">
            <div className="flex justify-between items-start mb-2">
              <div className="text-xs font-bold text-gray-500 uppercase">Livré (Delivered)</div>
              <CheckCircle className="text-green-500" size={16} />
            </div>
            <div className="text-2xl font-bold text-green-600">{formatNumber(kpis.delivered)}</div>
            <div className="text-xs text-gray-500 mt-1">Commandes réussies</div>
          </div>
          
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-red-500">
            <div className="flex justify-between items-start mb-2">
              <div className="text-xs font-bold text-gray-500 uppercase">Retourné (Returned)</div>
              <TrendingDown className="text-red-500" size={16} />
            </div>
            <div className="text-2xl font-bold text-red-600">{formatNumber(kpis.returned)}</div>
            <div className="text-xs text-gray-500 mt-1">Commandes échouées</div>
          </div>
          
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-green-500" />
              Taux de Livraison (Delivery Rate)
            </h3>
            <div className="flex items-center justify-between">
              <div className="h-32 w-32">
                <canvas ref={chartRef}></canvas>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{deliveryRate}%</div>
                <div className="text-xs text-gray-500">Taux de réussite</div>
              </div>
            </div>
          </div>
        </div>

        {/* Employee Performance Table */}
        {/* Employee Performance Table - Only for Manager */}
        {isManager && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Users size={20} className="text-blue-600" />
              Performance des Employés (selon le filtre)
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
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
        )}
      </div>
    </div>
  );
};

export default ConfirmationTeamDashboard;