import React, { useState, useMemo } from 'react';
import { RefreshCw, Package, Truck, CheckCircle, Clock, ArrowLeftCircle, Box , Search, Warehouse, AlertCircle, XCircle, TrendingUp } from 'lucide-react';

// SpotlightCard Component
const SpotlightCard = ({ children, className = "", spotlightColor = "rgba(255, 255, 255, 0.25)" }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-transparent border border-[#018790] ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
        }}
      />
      {children}
    </div>
  );
};

const LogisticsDashboard = () => {
  const today = new Date();
  const dateStr = (daysAgo) => {
    const d = new Date();
    d.setDate(today.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  const initialProducts = [
    { id: "p2", name: "Anker 20W Charger", cat: "Accessories", stock: 120, packed: 80, warehouse: "Agadir" },
    { id: "p3", name: "Coffee Machine", cat: "Home Appliances", stock: 5, packed: 5, warehouse: "Casa" },
    { id: "p4", name: "Laptop Bag", cat: "Clothing & Bags", stock: 40, packed: 10, warehouse: "Tanger" },
    { id: "p5", name: "Screen Protector", cat: "Accessories", stock: 300, packed: 200, warehouse: "Agadir" },
  ];

  const totalPackagingMaterial = 500;
  const totalProductStock = initialProducts.reduce((acc, p) => acc + (p.stock || 0), 0);

  const initialOrders = (() => {
    const arr = [];
    for (let i = 0; i < 7; i++) {
      const d = dateStr(i);
      arr.push({ pid: "p1", qty: 1, status: "Delivered", date: d });
      if (i === 0) arr.push({ pid: "p2", qty: 10, status: "Shipped", date: d });
      else if (i === 1) arr.push({ pid: "p2", qty: 5, status: "In Transit", date: d });
      else arr.push({ pid: "p2", qty: 3, status: "Delivered", date: d });
      if (i === 2) arr.push({ pid: "p5", qty: 20, status: "Returned", date: d });
      if (i === 0) arr.push({ pid: "p6", qty: 2, status: "In Transit", date: d });
    }
    return arr;
  })();

  const todayStr = today.toISOString().split('T')[0];
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

  const initialCategories = [...new Set(initialProducts.map(p => p.cat))];
  const initialWarehouses = [...new Set(initialProducts.map(p => p.warehouse))];

  const [products, setProducts] = useState(initialProducts);
  const [orders, setOrders] = useState(initialOrders);
  const [warehouses, setWarehouses] = useState(initialWarehouses);
  const [filters, setFilters] = useState({
    dateFrom: thirtyDaysAgoStr,
    dateTo: todayStr,
    productName: '',
    category: 'all',
    sequence: 'non'
  });
  const [categories, setCategories] = useState(initialCategories);

  const regenerate = () => {
    const newProducts = initialProducts.map(p => ({ ...p }));
    const newOrders = (() => {
      const arr = [];
      for (let i = 0; i < 7; i++) {
        const d = dateStr(i);
        arr.push({ pid: "p1", qty: 1, status: "Delivered", date: d });
        if (i === 0) arr.push({ pid: "p2", qty: 10, status: "Shipped", date: d });
        else if (i === 1) arr.push({ pid: "p2", qty: 5, status: "In Transit", date: d });
        else arr.push({ pid: "p2", qty: 3, status: "Delivered", date: d });
        if (i === 2) arr.push({ pid: "p5", qty: 20, status: "Returned", date: d });
        if (i === 0) arr.push({ pid: "p6", qty: 2, status: "In Transit", date: d });
      }
      return arr;
    })();
    setProducts(newProducts);
    setOrders(newOrders);
    setCategories([...new Set(newProducts.map(p => p.cat))]);
    setWarehouses([...new Set(newProducts.map(p => p.warehouse))]);
  };

  const computed = useMemo(() => {
    const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : new Date(new Date().setDate(new Date().getDate() - 30));
    const dateTo = filters.dateTo ? new Date(filters.dateTo) : new Date();
    dateTo.setHours(23, 59, 59);
    const productName = filters.productName.toLowerCase();
    const category = filters.category;
    const sequence = filters.sequence;

    let newKpis = { stock: 0, delivered: 0, inTransit: 0, shipped: 0, returned: 0 };
    let newFilteredProducts = [];
    const ws = {};
    const dist = {};
    products.forEach(p => {
      if (productName && !p.name.toLowerCase().includes(productName)) return;
      if (category !== 'all' && p.cat !== category) return;
      const pOrders = orders.filter(o => {
        const od = new Date(o.date);
        return o.pid === p.id && od >= dateFrom && od <= dateTo;
      });

      // Sequence Filter Logic
      if (sequence === 'oui') {
        if (pOrders.length < 2) return; // Need at least 2 dates for a sequence
        
        // Sort by date ascending
        const sortedOrders = [...pOrders].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Check for consecutive dates and same status
        const firstStatus = sortedOrders[0].status;
        let isSequence = true;
        
        for (let i = 0; i < sortedOrders.length - 1; i++) {
          const current = sortedOrders[i];
          const next = sortedOrders[i+1];
          
          // Check status consistency
          if (current.status !== firstStatus || next.status !== firstStatus) {
            isSequence = false;
            break;
          }
          
          // Check consecutive dates (diff must be 1 day)
          const d1 = new Date(current.date);
          const d2 = new Date(next.date);
          const diffTime = Math.abs(d2 - d1);
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays !== 1) {
            isSequence = false;
            break;
          }
        }
        
        if (!isSequence) return;
      }

      let row = { id: p.id, name: p.name, cat: p.cat, stock: p.stock, packed: p.packed || 0, warehouse: p.warehouse, delivered: 0, inTransit: 0, shipped: 0, returned: 0 };
      pOrders.forEach(o => {
        if (o.status === "Delivered") row.delivered += o.qty;
        if (o.status === "In Transit") row.inTransit += o.qty;
        if (o.status === "Shipped") row.shipped += o.qty;
        if (o.status === "Returned") row.returned += o.qty;
      });
      newKpis.stock += p.stock;
      newKpis.delivered += row.delivered;
      newKpis.inTransit += row.inTransit;
      newKpis.shipped += row.shipped;
      newKpis.returned += row.returned;
      if (!ws[p.warehouse]) ws[p.warehouse] = { name: p.warehouse, stock: 0, delivered: 0, inTransit: 0, shipped: 0, returned: 0 };
      ws[p.warehouse].stock += p.stock;
      ws[p.warehouse].delivered += row.delivered;
      ws[p.warehouse].inTransit += row.inTransit;
      ws[p.warehouse].shipped += row.shipped;
      ws[p.warehouse].returned += row.returned;
      if (!dist[p.warehouse]) dist[p.warehouse] = { name: p.warehouse, items: [], total: 0, capacity: 0 };
      dist[p.warehouse].items.push({ name: p.name, qty: p.stock });
      dist[p.warehouse].total += p.stock;
      newFilteredProducts.push(row);
    });
    Object.keys(dist).forEach(k => {
      const t = dist[k].total;
      dist[k].capacity = Math.max(t * 2, 100);
    });
    const warehouseMeta = Object.keys(dist).map((name, idx) => ({ id: idx + 1, name, capacity: dist[name].capacity }));
    return { filteredProducts: newFilteredProducts, kpis: newKpis, warehouseStats: ws, warehouseDistribution: dist, warehouseMeta };
  }, [filters, products, orders]);

  const { filteredProducts, kpis, warehouseStats, warehouseDistribution, warehouseMeta } = computed;

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatNumber = (num) => {
    return num.toLocaleString('en-US');
  };

  return (
    <div className="min-h-screen bg-transparent pb-16" dir="ltr">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-xl">
                <Package className="text-emerald-600 w-8 h-8" />
              </div>
              Logistics Tracking
            </h1>
            <p className="text-slate-500 mt-2 ml-1">Monitoring inventory and daily shipping movements</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
            >
              Refresh
            </button>
            <button 
              onClick={regenerate} 
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Generate Data
            </button>
          </div>
        </header>

        {/* Filters Bar */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8">
          <div className="flex flex-wrap gap-6 items-end">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">From Date</label>
              <input 
                type="date" 
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">To Date</label>
              <input 
                type="date" 
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
            <div className="flex-2 min-w-[200px]">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Product Name</label>
              <div className="relative">
                <select 
                  value={filters.productName}
                  onChange={(e) => handleFilterChange('productName', e.target.value)}
                  className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500 transition-all appearance-none"
                >
                  <option value="">All Products</option>
                  {[...new Set(products.map(p => p.name))].sort().map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-400">
                    <Search size={18} />
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
              <select 
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500 transition-all"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Séquence</label>
              <select 
                value={filters.sequence}
                onChange={(e) => handleFilterChange('sequence', e.target.value)}
                className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500 transition-all"
              >
                <option value="non">NON</option>
                <option value="oui">OUI</option>
              </select>
            </div>
          </div>
        </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <SpotlightCard spotlightColor="rgba(1, 135, 144, 0.3)">
            <div className="relative z-10 p-5 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Box className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">STOCK</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800 mb-1">{formatNumber(kpis.stock)}</div>
                <div className="text-xs text-slate-500 font-medium">Available Balance</div>
              </div>
            </div>
          </SpotlightCard>

          <SpotlightCard spotlightColor="rgba(1, 135, 144, 0.3)">
            <div className="relative z-10 p-5 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <Package className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">PACKING</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800 mb-1">{totalPackagingMaterial}</div>
                <div className="text-xs text-slate-500 font-medium">Materials Left</div>
              </div>
            </div>
          </SpotlightCard>
          
          <SpotlightCard spotlightColor="rgba(1, 135, 144, 0.3)">
            <div className="relative z-10 p-5 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">DONE</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800 mb-1">{formatNumber(kpis.delivered)}</div>
                <div className="text-xs text-slate-500 font-medium">Delivered Orders</div>
              </div>
            </div>
          </SpotlightCard>

          <SpotlightCard spotlightColor="rgba(1, 135, 144, 0.3)">
            <div className="relative z-10 p-5 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <Truck className="w-5 h-5 text-amber-600" />
                </div>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">TRANSIT</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800 mb-1">{formatNumber(kpis.inTransit)}</div>
                <div className="text-xs text-slate-500 font-medium">On The Way</div>
              </div>
            </div>
          </SpotlightCard>

          <SpotlightCard spotlightColor="rgba(1, 135, 144, 0.3)">
            <div className="relative z-10 p-5 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-cyan-50 rounded-lg">
                  <Clock className="w-5 h-5 text-cyan-600" />
                </div>
                <span className="text-xs font-bold text-cyan-600 bg-cyan-50 px-2 py-1 rounded-full">SHIPPED</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800 mb-1">{formatNumber(kpis.shipped)}</div>
                <div className="text-xs text-slate-500 font-medium">Sent Today</div>
              </div>
            </div>
          </SpotlightCard>

          <SpotlightCard spotlightColor="rgba(1, 135, 144, 0.3)">
            <div className="relative z-10 p-5 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-red-50 rounded-lg">
                  <ArrowLeftCircle className="w-5 h-5 text-red-600" />
                </div>
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">RETURN</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800 mb-1">{formatNumber(kpis.returned)}</div>
                <div className="text-xs text-slate-500 font-medium">Returned Items</div>
              </div>
            </div>
          </SpotlightCard>
        </div>

        {/* Performance Rates Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8">
             <h3 className="text-lg font-bold text-[#005461] mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Aperçu des Performances
             </h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Best Rate */}
                <div className="relative pt-2">
                   <div className="flex justify-between items-end mb-2">
                      <div>
                         <div className="flex items-center gap-2 mb-1">
                            <span className="p-1 bg-emerald-100 rounded text-emerald-600"><TrendingUp size={14} /></span>
                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Meilleur Taux (أعلى نسبة)</span>
                         </div>
                         <div className="font-bold text-slate-800 text-xl">Pack Santé</div>
                      </div>
                      <div className="text-3xl font-black text-emerald-600">88%</div>
                   </div>
                   <div className="w-full h-6 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full shadow-sm" style={{ width: '88%' }}></div>
                   </div>
                </div>

                {/* Lowest Rate */}
                <div className="relative pt-2">
                   <div className="flex justify-between items-end mb-2">
                      <div>
                         <div className="flex items-center gap-2 mb-1">
                            <span className="p-1 bg-red-100 rounded text-red-600"><TrendingDown size={14} /></span>
                            <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Faible Taux (أقل نسبة)</span>
                         </div>
                         <div className="font-bold text-slate-800 text-xl">Montre Luxe</div>
                      </div>
                      <div className="text-3xl font-black text-red-500">12%</div>
                   </div>
                   <div className="w-full h-6 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                      <div className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full shadow-sm" style={{ width: '12%' }}></div>
                   </div>
                </div>
             </div>
          </div>

        {/* Distribution Entrepôts */}
        {warehouseMeta.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Warehouse className="text-slate-400" />
              Warehouse Distribution
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {warehouseMeta.map(wh => {
                const data = warehouseDistribution[wh.name] || { items: [], total: 0, capacity: 100 };
                const fillPercent = Math.round((data.total / wh.capacity) * 100);
                const barColor = fillPercent > 85 ? 'bg-red-500' : fillPercent > 50 ? 'bg-amber-500' : 'bg-emerald-500';
                return (
                  <div key={wh.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-6">
                      <span className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
                        {wh.name}
                      </span>
                      <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">#{wh.id}</span>
                    </div>
                    
                    <div className="flex gap-4 mb-6">
                      <div className="flex-1 bg-slate-50 rounded-2xl p-4 text-center">
                        <div className="text-2xl font-black text-slate-800">{formatNumber(data.total)}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Units</div>
                      </div>
                      <div className="flex-1 bg-slate-50 rounded-2xl p-4 text-center">
                        <div className="text-2xl font-black text-slate-800">{data.items.length}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Types</div>
                      </div>
                    </div>

                    <div className="max-h-40 overflow-y-auto pr-2 mb-6">
                      {data.items.length > 0 ? (
                        <div className="space-y-2">
                          {data.items.sort((a, b) => b.qty - a.qty).map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                              <span className="text-sm font-medium text-slate-700 truncate pr-2">{item.name}</span>
                              <span className="text-sm font-bold text-slate-900 bg-white px-2 py-1 rounded-lg shadow-sm">{formatNumber(item.qty)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-slate-400 text-sm italic bg-slate-50 rounded-xl">No items in stock</div>
                      )}
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                        <span>Capacity Usage</span>
                        <span>{fillPercent}%</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${barColor} transition-all duration-1000 ease-out`} style={{ width: `${fillPercent}%` }}></div>
                      </div>
                      <div className="text-right mt-2 text-xs text-slate-400">
                        Max Capacity: {formatNumber(wh.capacity)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="text-emerald-500" />
                Detailed Product Movement
              </h3>
              <p className="text-slate-500 text-sm mt-1">Comprehensive breakdown of stock and shipping status</p>
            </div>
            <span className="px-4 py-2 bg-emerald-50 text-emerald-700 text-sm font-bold rounded-xl border border-emerald-100">
              {filteredProducts.length} Active Items
            </span>
          </div>
          
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-slate-300 w-10 h-10" />
              </div>
              <h3 className="text-slate-900 font-medium text-lg">No products found</h3>
              <p className="text-slate-500 mt-1">Try adjusting your filters to see results</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/50 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-4 rounded-tl-2xl">Product Details</th>
                    <th className="px-6 py-4">Warehouse</th>
                    <th className="px-6 py-4 text-center">Total Stock</th>
                    <th className="px-6 py-4 text-center">Packed</th>
                    <th className="px-6 py-4 text-center">To Pack</th>
                    <th className="px-6 py-4 text-center">Delivered</th>
                    <th className="px-6 py-4 text-center">In Transit</th>
                    <th className="px-6 py-4 text-center">Shipped</th>
                    <th className="px-6 py-4 text-center rounded-tr-2xl">Returned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map(product => {
                    const toPack = product.stock - product.packed;
                    return (
                    <tr key={product.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{product.name}</div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                          {product.cat}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-lg inline-block">
                          {product.warehouse}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-slate-800 text-base">
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg">
                           {product.packed}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <span className={`font-bold px-3 py-1 rounded-lg text-xs ${toPack > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                           {toPack > 0 ? `-${toPack}` : 'Complete'}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-emerald-600">{product.delivered}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-amber-600">{product.inTransit}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-cyan-600">{product.shipped}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {product.returned > 0 ? (
                          <span className="font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">{product.returned}</span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogisticsDashboard;