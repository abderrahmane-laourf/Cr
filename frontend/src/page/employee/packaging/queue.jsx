import React, { useState, useEffect } from 'react';
import { 
  Check, Package, X, Scan, CheckCircle2, AlertTriangle, Truck, 
  CheckCircle, ChevronDown, ChevronUp, Printer, ArrowRight, Trash2, Box 
} from 'lucide-react';

// --- MOCKED DATA (PRESERVED) ---
const MOCK_ORDERS = [
  { 
    id: 'CMD-302', 
    client: 'Fatima Z.', 
    phone: '0612345678',
    address: 'Casablanca, Maarif',
    status: 'prepare',
    date: '2025-12-10',
    barcode: '123456',
    products: [
      { id: 'P1', name: 'Serum Vitamine C', sku: 'SER001', price: 250, scanned: false },
      { id: 'P2', name: 'Crème Nuit', sku: 'CRE002', price: 180, scanned: false }
    ]
  },
  { 
    id: 'CMD-305', 
    client: 'Ahmed K.', 
    phone: '0698765432',
    address: 'Rabat, Agdal',
    status: 'prepare',
    date: '2025-12-11',
    barcode: '789012',
    products: [
      { id: 'P3', name: 'Crème Hydratante', sku: 'CRE003', price: 200, scanned: false }
    ]
  },
  { 
    id: 'CMD-310', 
    client: 'Samira R.', 
    phone: '0656789012',
    address: 'Marrakech, Gueliz',
    status: 'prepare',
    date: '2025-12-12',
    barcode: '345678',
    products: [
      { id: 'P4', name: 'Pack Anti-Age', sku: 'PACK001', price: 450, scanned: false },
      { id: 'P5', name: 'Masque Visage', sku: 'MAS001', price: 120, scanned: false },
      { id: 'P6', name: 'Lotion Tonique', sku: 'LOT001', price: 90, scanned: false }
    ]
  },
  { 
    id: 'CMD-311', 
    client: 'Youssef M.', 
    phone: '0667890123',
    address: 'Fès, Ville Nouvelle',
    status: 'stickers',
    date: '2025-12-11',
    barcode: '456789',
    products: [
      { id: 'P7', name: 'Gel Nettoyant', sku: 'GEL001', price: 150, scanned: false }
    ]
  },
  { 
    id: 'CMD-312', 
    client: 'Nadia B.', 
    phone: '0678901234',
    address: 'Tanger, Centre',
    status: 'stickers',
    date: '2025-12-12',
    barcode: '567890',
    products: [
      { id: 'P8', name: 'Sérum Anti-Rides', sku: 'SER002', price: 280, scanned: true }
    ]
  }
];

const GLOBAL_PICKUP_TIME = '16:00'; 

export default function PackagingQueue() {
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [activeStage, setActiveStage] = useState('prepare'); 
  const [showConsecutiveOnly, setShowConsecutiveOnly] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [currentScanOrder, setCurrentScanOrder] = useState(null);
  const [currentScanProduct, setCurrentScanProduct] = useState(null);
  const [scanInput, setScanInput] = useState('');
  const [scanError, setScanError] = useState('');
  const [selectedProductFilter, setSelectedProductFilter] = useState('All');

  // --- LOGIC (PRESERVED) ---
  const handleTogglePrepare = (orderId) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'stickers' } : o));
  };

  const toggleExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const handleDeleteProduct = (orderId, productId) => {
    if (window.confirm('Supprimer ce produit?')) {
      setOrders(prev => prev.map(o => {
        if (o.id === orderId) {
          return { ...o, products: o.products.filter(p => p.id !== productId) };
        }
        return o;
      }));
    }
  };

  const handlePrintSticker = (product) => {
    alert(`Impression du sticker pour: ${product.name}`);
  };

  const handleOpenScan = (order, product) => {
    setCurrentScanOrder(order);
    setCurrentScanProduct(product);
    setScanInput('');
    setScanError('');
    setShowScanModal(true);
  };

  const handleVerifyScan = () => {
    if (scanInput.trim() === currentScanProduct.sku) {
      setOrders(prev => prev.map(o => {
        if (o.id === currentScanOrder.id) {
          return {
            ...o,
            products: o.products.map(p => p.id === currentScanProduct.id ? { ...p, scanned: true } : p)
          };
        }
        return o;
      }));
      setShowScanModal(false);
    } else {
      setScanError('Code incorrect! Vérifiez le SKU.');
    }
  };

  const allProductsScanned = (order) => {
    return order.products.every(p => p.scanned);
  };

  const handleToggleDelivered = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!allProductsScanned(order)) {
      alert('Tous les produits doivent être scannés avant la livraison!');
      return;
    }
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'delivered' } : o));
  };

  const ordersInPrepare = orders.filter(o => o.status === 'prepare');
  const ordersInStickers = orders.filter(o => o.status === 'stickers');
  const ordersDelivered = orders.filter(o => o.status === 'delivered');
  
  const totalOrders = orders.length;
  const progress = Math.round((ordersDelivered.length / totalOrders) * 100) || 0;

  const calculateTimeRemaining = () => {
    const now = new Date();
    const [hours, minutes] = GLOBAL_PICKUP_TIME.split(':').map(Number);
    const pickupTime = new Date();
    pickupTime.setHours(hours, minutes, 0, 0);
    if (pickupTime < now) pickupTime.setDate(pickupTime.getDate() + 1);
    const diff = pickupTime - now;
    return { 
        hours: Math.floor(diff / (1000 * 60 * 60)), 
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)) 
    };
  };

  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining());

  useEffect(() => {
    const timer = setInterval(() => setTimeRemaining(calculateTimeRemaining()), 60000);
    return () => clearInterval(timer);
  }, []);

  // --- STATS CALCULATION ---
  const allProducts = orders.flatMap(o => o.products);
  const uniqueProducts = [...new Set(allProducts.map(p => p.name))];

  const getFilteredStats = () => {
      let relevantOrders = ordersInStickers; // Focus on packaging stage
      let relevantProducts = relevantOrders.flatMap(o => o.products);

      if (selectedProductFilter !== 'All') {
          relevantProducts = relevantProducts.filter(p => p.name === selectedProductFilter);
      }

      const productsRemaining = relevantProducts.filter(p => !p.scanned).length;
      // Mock packaging stock logic or just use products remaining as "packages to do"
      const packagingRemaining = productsRemaining; 

      return { productsRemaining, packagingRemaining };
  };

  const { productsRemaining, packagingRemaining } = getFilteredStats();


  // --- RENDER ---
  return (
    <div className="w-full min-h-screen bg-transparent p-4 md:p-8 font-sans text-slate-800 dark:text-slate-200 animate-[fade-in_0.5s_ease-out]">
      
      {/* TOP STATS CARD */}
      <div className="glass-card p-6 mb-6 w-full">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Box className="text-orange-500" /> État de l'Emballage
              </h2>
              <select 
                  value={selectedProductFilter} 
                  onChange={(e) => setSelectedProductFilter(e.target.value)}
                  className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              >
                  <option value="All">Tous les produits</option>
                  {uniqueProducts.map(p => (
                      <option key={p} value={p}>{p}</option>
                  ))}
              </select>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                  <p className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">Produits Restants</p>
                  <p className="text-2xl font-black text-orange-600">{productsRemaining}</p>
                  <p className="text-[10px] text-orange-400 mt-1">Articles à scanner</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Emballage Restant</p>
                  <p className="text-2xl font-black text-blue-600">{packagingRemaining}</p>
                  <p className="text-[10px] text-blue-400 mt-1">Unités nécessaires</p>
              </div>
          </div>
      </div>
      
      {/* 1. HEADER & PROGRESS */}
      <div className="glass-card p-6 mb-6">
        
        {/* Pickup Timer Banner */}
        <div className="bg-gradient-to-r from-[#018790] to-teal-600 text-white p-4 rounded-xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-teal-900/10">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-inner">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-teal-100 uppercase tracking-wider">Ramassage Global</p>
              <p className="text-2xl font-black">{GLOBAL_PICKUP_TIME.replace(':', 'h')}</p>
            </div>
          </div>
          <div className="text-center sm:text-right bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/10 w-full sm:w-auto">
            <p className="text-[10px] font-bold text-teal-100 uppercase mb-0.5">Temps Restant</p>
            <p className="text-xl font-bold font-mono">
              {timeRemaining.hours}h {timeRemaining.minutes}m
            </p>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-end mb-2 gap-1">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Package className="text-[#018790]" /> Pipeline Packaging
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              <span className="text-slate-900 font-bold">{ordersDelivered.length}</span> / {totalOrders} commandes livrées aujourd'hui
            </p>
          </div>
          <span className="text-3xl font-black text-[#018790]">{progress}%</span>
        </div>
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-[#018790] to-teal-400 rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_#018790]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 2. PIPELINE STAGE SELECTOR */}
      <div className="frosted-panel p-2 mb-6 flex flex-col sm:flex-row gap-2">
          
          <button
            onClick={() => setActiveStage('prepare')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-3 ${
              activeStage === 'prepare'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-transparent text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Package size={18} />
            <span>À Préparer</span>
            <span className={`px-2 py-0.5 rounded-md text-xs font-black ${activeStage === 'prepare' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
              {ordersInPrepare.length}
            </span>
          </button>
          
          <button
            onClick={() => setActiveStage('stickers')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-3 ${
              activeStage === 'stickers'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                : 'bg-transparent text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Box size={18} />
            <span>Stickers</span>
            <span className={`px-2 py-0.5 rounded-md text-xs font-black ${activeStage === 'stickers' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
              {ordersInStickers.length}
            </span>
          </button>
          
          <button
            onClick={() => setActiveStage('delivered')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-3 ${
              activeStage === 'delivered'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                : 'bg-transparent text-slate-500 hover:bg-slate-50'
            }`}
          >
            <CheckCircle size={18} />
            <span>Livrée</span>
            <span className={`px-2 py-0.5 rounded-md text-xs font-black ${activeStage === 'delivered' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
              {ordersDelivered.length}
            </span>
          </button>
      </div>

      {/* 3. CONTENT AREA */}
      <div className="min-h-[400px]">
        
        {/* STAGE 1: À PRÉPARER */}
        {activeStage === 'prepare' && (
          <div className="space-y-4 animate-[slide-in-from-left_0.3s_ease-out]">
            {ordersInPrepare.length === 0 ? (
               <EmptyState icon={Package} message="Tout est prêt ! Aucune commande en attente." />
            ) : (
              ordersInPrepare.map(order => (
                <div key={order.id} className="group premium-card p-5 rounded-2xl hover:shadow-md transition-all hover:border-blue-300 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500"></div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pl-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-black text-slate-800 text-lg">{order.id}</span>
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold uppercase">{order.client}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                        <Box size={14} className="text-blue-500"/>
                        {order.products.length} produit(s)
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        {order.address}
                      </div>
                    </div>
                    
                    <button 
                        onClick={() => handleTogglePrepare(order.id)}
                        className="w-full sm:w-auto px-6 py-3 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 group-hover:shadow-lg shadow-blue-500/20"
                    >
                        <Check size={18} /> Marquer Prêt
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* STAGE 2: STICKERS (Expandable) */}
        {activeStage === 'stickers' && (
          <div className="space-y-4 animate-[slide-in-from-right_0.3s_ease-out]">
            {ordersInStickers.length === 0 ? (
               <EmptyState icon={Box} message="Aucune commande en attente de stickers." />
            ) : (
              ordersInStickers.map(order => (
                <div key={order.id} className="premium-card rounded-2xl overflow-hidden hover:shadow-md transition-all">
                  
                  {/* Header */}
                  <div 
                    onClick={() => toggleExpand(order.id)}
                    className="flex items-center justify-between p-5 cursor-pointer hover:bg-white/10 dark:hover:bg-white/5 transition-colors border-l-4 border-l-orange-500"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-black text-slate-800 text-lg">{order.id}</span>
                        <span className="text-sm font-bold text-slate-600">{order.client}</span>
                        {allProductsScanned(order) && (
                          <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 size={12} /> Prêt à livrer
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-slate-400">
                        {order.products.filter(p => p.scanned).length} / {order.products.length} scannés
                      </p>
                    </div>
                    <div className={`p-2 rounded-full bg-slate-100 transition-transform duration-300 ${expandedOrderId === order.id ? 'rotate-180' : ''}`}>
                        <ChevronDown size={20} className="text-slate-500" />
                    </div>
                  </div>

                  {/* Body */}
                  {expandedOrderId === order.id && (
                    <div className="p-5 border-t border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/30 space-y-3">
                      {order.products.map(product => (
                        <div key={product.id} className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white/80 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm gap-4">
                          
                          <div className="flex-1 flex items-center gap-4 w-full">
                             <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${product.scanned ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                 {product.scanned ? <CheckCircle2 size={20}/> : <Package size={20}/>}
                             </div>
                             <div>
                                 <p className="font-bold text-slate-800 text-sm">{product.name}</p>
                                 <p className="text-xs font-mono text-slate-500 mt-0.5">{product.sku} • <span className="text-slate-400">{product.price} DH</span></p>
                             </div>
                          </div>

                          <div className="flex gap-2 w-full sm:w-auto">
                             <button onClick={() => handlePrintSticker(product)} className="p-2.5 bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 rounded-lg transition-colors" title="Imprimer">
                                 <Printer size={18} />
                             </button>
                             <button onClick={() => handleDeleteProduct(order.id, product.id)} className="p-2.5 bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 rounded-lg transition-colors" title="Supprimer">
                                 <Trash2 size={18} />
                             </button>
                             {!product.scanned && (
                                <button 
                                    onClick={() => handleOpenScan(order, product)}
                                    className="flex-1 sm:flex-none px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20"
                                >
                                    <Scan size={16} /> Scanner
                                </button>
                             )}
                          </div>
                        </div>
                      ))}

                      {/* Delivery Action */}
                      <div className="mt-4 pt-4 border-t border-slate-200 flex justify-end">
                          <button
                             onClick={() => handleToggleDelivered(order.id)}
                             disabled={!allProductsScanned(order)}
                             className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                                 allProductsScanned(order)
                                 ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20'
                                 : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                             }`}
                          >
                              <Truck size={18} /> Marquer comme Livré
                          </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* STAGE 3: LIVRÉE */}
        {activeStage === 'delivered' && (
          <div className="space-y-4 animate-[fade-in_0.5s_ease-out]">
            {ordersDelivered.length === 0 ? (
               <EmptyState icon={CheckCircle} message="Aucune commande livrée aujourd'hui." />
            ) : (
              ordersDelivered.map(order => (
                <div key={order.id} className="premium-card p-5 rounded-2xl flex items-center justify-between opacity-80 hover:opacity-100 transition-all">
                   <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                           <Check size={24} strokeWidth={3} />
                       </div>
                       <div>
                           <h3 className="font-bold text-slate-800 text-lg line-through decoration-slate-300 decoration-2">{order.id}</h3>
                           <p className="text-sm font-medium text-slate-500">{order.client} • {order.address}</p>
                       </div>
                   </div>
                   <div className="text-right hidden sm:block">
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total</p>
                       <p className="text-lg font-black text-emerald-600">{order.products.reduce((sum, p) => sum + p.price, 0)} DH</p>
                   </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>

      {/* SCAN MODAL (Bottom Sheet Style on Mobile) */}
      {showScanModal && currentScanProduct && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowScanModal(false)} />
          
          <div className="bg-white w-full sm:w-[400px] rounded-t-3xl sm:rounded-3xl shadow-2xl relative z-10 animate-[slide-up_0.3s_ease-out] overflow-hidden">
            
            {/* Header */}
            <div className="bg-orange-500 p-6 text-center pt-8 pb-10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="relative z-10">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-inner">
                        <Scan className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-1">Scanner le Produit</h2>
                    <p className="text-orange-100 text-sm font-medium">{currentScanProduct.name}</p>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 -mt-4 bg-white rounded-t-3xl relative">
                
                {scanError && (
                    <div className="mb-4 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 border border-red-100 animate-pulse">
                        <AlertTriangle className="w-4 h-4" /> {scanError}
                    </div>
                )}

                <div className="space-y-4">
                    <div className="relative">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Code SKU Attendu: {currentScanProduct.sku}</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={scanInput}
                                onChange={(e) => {
                                    setScanInput(e.target.value);
                                    if (scanError) setScanError('');
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && handleVerifyScan()}
                                placeholder="Scanner ici..."
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-mono text-lg font-bold text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-center tracking-wider"
                                autoFocus
                            />
                            <Scan className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => setShowScanModal(false)}
                            className="flex-1 py-3.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleVerifyScan}
                            disabled={!scanInput}
                            className={`flex-[2] py-3.5 rounded-xl font-bold text-white shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all ${
                                !scanInput ? 'bg-slate-300 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700 active:scale-95'
                            }`}
                        >
                            <Check className="w-5 h-5" /> Confirmer
                        </button>
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Helper for Empty State
function EmptyState({ icon: Icon, message }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center glass-card rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-bold text-lg max-w-xs">{message}</p>
        </div>
    );
}