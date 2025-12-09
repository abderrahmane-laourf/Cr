import React, { useState, useEffect } from 'react';
import { RefreshCw, Package, Truck, CheckCircle, Clock, ArrowLeftCircle, Filter, Search } from 'lucide-react';

const LogisticsDashboard = () => {
  // State management
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    productName: '',
    category: 'all'
  });
  const [categories, setCategories] = useState([]);
  const [kpis, setKpis] = useState({
    stock: 0,
    delivered: 0,
    inTransit: 0,
    shipped: 0,
    returned: 0
  });

  // Initialize data on component mount
  useEffect(() => {
    generateData();
  }, []);

  // Apply filters whenever they change
  useEffect(() => {
    applyFilters();
  }, [filters, products, orders]);

  // Generate sample data
  const generateData = () => {
    // Products with Categories
    const newProducts = [
      { id: "p1", name: "iPhone 15 Pro", cat: "Electronics", stock: 10 },
      { id: "p2", name: "Anker 20W Charger", cat: "Accessories", stock: 120 },
      { id: "p3", name: "Coffee Machine", cat: "Home Appliances", stock: 5 },
      { id: "p4", name: "Laptop Bag", cat: "Clothing & Bags", stock: 40 },
      { id: "p5", name: "Screen Protector", cat: "Accessories", stock: 300 },
      { id: "p6", name: "Smart Watch", cat: "Electronics", stock: 50 }
    ];

    const newOrders = [];
    const today = new Date();

    // Helper to format date YYYY-MM-DD
    const dateStr = (daysAgo) => {
      const d = new Date(); 
      d.setDate(today.getDate() - daysAgo);
      return d.toISOString().split('T')[0];
    };

    // Generate random orders for last 7 days
    for(let i = 0; i < 7; i++) {
      let d = dateStr(i);
      // p1: Delivered
      newOrders.push({ pid: "p1", qty: 1, status: "Delivered", date: d });
      // p2: Shipped Today (if i=0), Transit (if i=1), Delivered (if i>1)
      if(i === 0) newOrders.push({ pid: "p2", qty: 10, status: "Shipped", date: d }); // Shipped Today
      else if(i === 1) newOrders.push({ pid: "p2", qty: 5, status: "In Transit", date: d }); // In Transit
      else newOrders.push({ pid: "p2", qty: 3, status: "Delivered", date: d });
      
      // p5: Returns
      if(i === 2) newOrders.push({ pid: "p5", qty: 20, status: "Returned", date: d });
      
      // p6: Mixed
      if(i === 0) newOrders.push({ pid: "p6", qty: 2, status: "In Transit", date: d });
    }

    setProducts(newProducts);
    setOrders(newOrders);
    
    // Extract unique categories
    const uniqueCategories = [...new Set(newProducts.map(p => p.cat))];
    setCategories(uniqueCategories);
    
    // Set default date filters (last 30 days)
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

  // Apply filters to products and calculate KPIs
  const applyFilters = () => {
    if (products.length === 0 || orders.length === 0) return;

    const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : new Date(new Date().setDate(new Date().getDate() - 30));
    const dateTo = filters.dateTo ? new Date(filters.dateTo) : new Date();
    dateTo.setHours(23, 59, 59); // End of day

    const productName = filters.productName.toLowerCase();
    const category = filters.category;

    // Stats
    let newKpis = { stock: 0, delivered: 0, inTransit: 0, shipped: 0, returned: 0 };
    let newFilteredProducts = [];

    // Loop Products
    products.forEach(p => {
      // 1. Product Filter (Name & Cat)
      if (productName && !p.name.toLowerCase().includes(productName)) return;
      if (category !== 'all' && p.cat !== category) return;

      // 2. Filter Orders by Date & Product
      const pOrders = orders.filter(o => {
        const od = new Date(o.date);
        return o.pid === p.id && od >= dateFrom && od <= dateTo;
      });

      // 3. Aggregate metrics
      let row = {
        id: p.id,
        name: p.name,
        cat: p.cat,
        stock: p.stock,
        delivered: 0,
        inTransit: 0,
        shipped: 0,
        returned: 0
      };

      pOrders.forEach(o => {
        if (o.status === "Delivered") row.delivered += o.qty;
        if (o.status === "In Transit") row.inTransit += o.qty;
        if (o.status === "Shipped") row.shipped += o.qty;
        if (o.status === "Returned") row.returned += o.qty;
      });

      // Add to Global KPIs
      newKpis.stock += p.stock;
      newKpis.delivered += row.delivered;
      newKpis.inTransit += row.inTransit;
      newKpis.shipped += row.shipped;
      newKpis.returned += row.returned;

      newFilteredProducts.push(row);
    });

    setKpis(newKpis);
    setFilteredProducts(newFilteredProducts);
  };

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Format number with English locale
  const formatNumber = (num) => {
    return num.toLocaleString('en-US');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16" dir="ltr">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="text-blue-600" />
              Logistics Tracking Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">Monitoring inventory and daily shipping movements</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Refresh
            </button>
            <button 
              onClick={generateData} 
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Generate Data
            </button>
          </div>
        </header>

        {/* Filters Bar */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">From Date</label>
              <input 
                type="date" 
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">To Date</label>
              <input 
                type="date" 
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex-2 min-w-[200px]">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Product Name</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={filters.productName}
                  onChange={(e) => handleFilterChange('productName', e.target.value)}
                  placeholder="Search by product name..." 
                  className="w-full p-2 pr-8 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Search size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Category</label>
              <select 
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={applyFilters}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <Filter size={16} />
              Apply
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-blue-500">
            <div className="text-xs font-bold text-gray-500 uppercase mb-2">Available in Stock</div>
            <div className="text-2xl font-bold text-gray-900">{formatNumber(kpis.stock)}</div>
            <div className="text-xs text-gray-500 mt-1">Current total balance</div>
          </div>
          
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-green-500">
            <div className="text-xs font-bold text-gray-500 uppercase mb-2">Delivered</div>
            <div className="text-2xl font-bold text-gray-900">{formatNumber(kpis.delivered)}</div>
            <div className="text-xs text-gray-500 mt-1">Successful orders in the period</div>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-amber-500">
            <div className="text-xs font-bold text-gray-500 uppercase mb-2">In Transit</div>
            <div className="text-2xl font-bold text-gray-900">{formatNumber(kpis.inTransit)}</div>
            <div className="text-xs text-gray-500 mt-1">Currently at the shipping company</div>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-cyan-500">
            <div className="text-xs font-bold text-gray-500 uppercase mb-2">Shipped</div>
            <div className="text-2xl font-bold text-gray-900">{formatNumber(kpis.shipped)}</div>
            <div className="text-xs text-gray-500 mt-1">Out of stock in the specified period</div>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-red-500">
            <div className="text-xs font-bold text-gray-500 uppercase mb-2">Returned</div>
            <div className="text-2xl font-bold text-gray-900">{formatNumber(kpis.returned)}</div>
            <div className="text-xs text-gray-500 mt-1">Cancelled or returned orders</div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <span className="font-bold text-gray-900 flex items-center gap-2">
              <Package size={18} />
              Detailed Product Movement Table
            </span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package size={48} className="mx-auto mb-4 opacity-20" />
              <p>No results match the filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 font-medium text-gray-700">Product Name</th>
                    <th className="px-4 py-3 font-medium text-gray-700">Available Quantity</th>
                    <th className="px-4 py-3 font-medium text-gray-700">Delivered</th>
                    <th className="px-4 py-3 font-medium text-gray-700">In Transit</th>
                    <th className="px-4 py-3 font-medium text-gray-700">Shipped (Today)</th>
                    <th className="px-4 py-3 font-medium text-gray-700">Returned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.map(product => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block mt-1">
                          {product.cat}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded">
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-green-600 font-bold">{product.delivered}</td>
                      <td className="px-4 py-3 text-amber-600">{product.inTransit}</td>
                      <td className="px-4 py-3 text-cyan-600 font-bold">{product.shipped}</td>
                      <td className="px-4 py-3 text-red-600">{product.returned}</td>
                    </tr>
                  ))}
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