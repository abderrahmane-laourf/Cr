import React, { useState, useEffect } from 'react';
import { 
  Check, 
  Package, 
  X, 
  Scan, 
  CheckCircle2,
  AlertTriangle,
  Truck,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Printer,
  ArrowRight ,
  Trash2,
  Box
} from 'lucide-react';
import { productAPI } from '../../../services/api';

// --- MOCKED DATA WITH PRODUCTS LIST ---
const MOCK_ORDERS = [
  { 
    id: 'CMD-302', 
    client: 'Fatima Z.', 
    phone: '0612345678',
    address: 'Casablanca, Maarif',
    status: 'prepare', // 'prepare' | 'stickers' | 'delivered'
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
    barcode: '345678',
    products: [
      { id: 'P4', name: 'Pack Anti-Age', sku: 'PACK001', price: 450, scanned: false },
      { id: 'P5', name: 'Masque Visage', sku: 'MAS001', price: 120, scanned: false },
      { id: 'P6', name: 'Lotion Tonique', sku: 'LOT001', price: 90, scanned: false }
    ]
  }
];

// Global pickup time for all packages
const GLOBAL_PICKUP_TIME = '16:00'; // 16h00

export default function PackagingQueue() {
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  
  // Active stage selection (only one can be active at a time)
  const [activeStage, setActiveStage] = useState('prepare'); // 'prepare' | 'stickers' | 'delivered'
  
  // Scan Modal State
  const [showScanModal, setShowScanModal] = useState(false);
  const [currentScanOrder, setCurrentScanOrder] = useState(null);
  const [currentScanProduct, setCurrentScanProduct] = useState(null);
  const [scanInput, setScanInput] = useState('');
  const [scanError, setScanError] = useState('');

  // ----------------------------------------------------------------------
  // HANDLERS
  // ----------------------------------------------------------------------

  // Toggle order from prepare to stickers
  const handleTogglePrepare = (orderId) => {
    setOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, status: 'stickers' } : o
    ));
  };

  // Toggle dropdown
  const toggleExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  // Delete product from order
  const handleDeleteProduct = (orderId, productId) => {
    if (confirm('Supprimer ce produit?')) {
      setOrders(prev => prev.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            products: o.products.filter(p => p.id !== productId)
          };
        }
        return o;
      }));
    }
  };

  // Print sticker
  const handlePrintSticker = (product) => {
    alert(`Impression du sticker pour: ${product.name}`);
    // TODO: Implement actual print logic
  };

  // Open scan modal for specific product
  const handleOpenScan = (order, product) => {
    setCurrentScanOrder(order);
    setCurrentScanProduct(product);
    setScanInput('');
    setScanError('');
    setShowScanModal(true);
  };

  // Verify scan
  const handleVerifyScan = () => {
    if (scanInput.trim() === currentScanProduct.sku) {
      // Mark product as scanned
      setOrders(prev => prev.map(o => {
        if (o.id === currentScanOrder.id) {
          return {
            ...o,
            products: o.products.map(p => 
              p.id === currentScanProduct.id ? { ...p, scanned: true } : p
            )
          };
        }
        return o;
      }));
      setShowScanModal(false);
    } else {
      setScanError('Code incorrect! Vérifiez le SKU.');
    }
  };

  // Check if all products are scanned
  const allProductsScanned = (order) => {
    return order.products.every(p => p.scanned);
  };

  // Toggle to delivered (only if all scanned)
  const handleToggleDelivered = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!allProductsScanned(order)) {
      alert('Tous les produits doivent être scannés avant la livraison!');
      return;
    }
    setOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, status: 'delivered' } : o
    ));
  };

  // Filter orders
  const ordersInPrepare = orders.filter(o => o.status === 'prepare');
  const ordersInStickers = orders.filter(o => o.status === 'stickers');
  const ordersDelivered = orders.filter(o => o.status === 'delivered');
  
  const totalOrders = orders.length;
  const progress = Math.round((ordersDelivered.length / totalOrders) * 100) || 0;

  // Calculate time remaining until pickup
  const calculateTimeRemaining = () => {
    const now = new Date();
    const [hours, minutes] = GLOBAL_PICKUP_TIME.split(':').map(Number);
    const pickupTime = new Date();
    pickupTime.setHours(hours, minutes, 0, 0);
    
    // If pickup time has passed today, set it for tomorrow
    if (pickupTime < now) {
      pickupTime.setDate(pickupTime.getDate() + 1);
    }
    
    const diff = pickupTime - now;
    const hoursRemaining = Math.floor(diff / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { hours: hoursRemaining, minutes: minutesRemaining };
  };

  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // ----------------------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------------------

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Top Progress Section with Global Pickup Time */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100 mb-4 sm:mb-6">
        {/* Pickup Time Banner */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 sm:p-4 rounded-xl mb-3 sm:mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-blue-100">Ramassage Global</p>
              <p className="text-xl sm:text-2xl font-bold">{GLOBAL_PICKUP_TIME.replace(':', 'h')}</p>
            </div>
          </div>
          <div className="text-center sm:text-right w-full sm:w-auto">
            <p className="text-xs font-medium text-blue-100">Temps Restant</p>
            <p className="text-lg sm:text-xl font-bold">
              {timeRemaining.hours}h {timeRemaining.minutes}m
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-2 gap-2 sm:gap-0">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">Packaging & Préparation</h1>
            <p className="text-xs sm:text-sm text-slate-500">
              {ordersDelivered.length} / {totalOrders} commandes livrées
            </p>
          </div>
          <span className="text-xl sm:text-2xl font-bold text-blue-600">{progress}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* VISUAL PIPELINE STAGES */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-xs sm:text-sm font-bold text-gray-500 uppercase mb-3 sm:mb-4">Pipeline de Packaging</h2>
        
        {/* Stage Selector Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4 sm:mb-6">
          <button
            onClick={() => setActiveStage('prepare')}
            className={`w-full sm:flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
              activeStage === 'prepare'
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Package size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="flex-1 text-left sm:text-center">À Préparer</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeStage === 'prepare' ? 'bg-white/20 text-white' : 'bg-gray-300 text-gray-700'
            }`}>
              {ordersInPrepare.length}
            </span>
          </button>
          
          <button
            onClick={() => setActiveStage('stickers')}
            className={`w-full sm:flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
              activeStage === 'stickers'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Box size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="flex-1 text-left sm:text-center">Stickers</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeStage === 'stickers' ? 'bg-white/20 text-white' : 'bg-gray-300 text-gray-700'
            }`}>
              {ordersInStickers.length}
            </span>
          </button>
          
          <button
            onClick={() => setActiveStage('delivered')}
            className={`w-full sm:flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
              activeStage === 'delivered'
                ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <CheckCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="flex-1 text-left sm:text-center">Livrée</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeStage === 'delivered' ? 'bg-white/20 text-white' : 'bg-gray-300 text-gray-700'
            }`}>
              {ordersDelivered.length}
            </span>
          </button>
        </div>
        
        {/* Visual Pipeline Indicator - Hidden on mobile, shown on tablet+ */}
        <div className="hidden md:flex items-center justify-between relative">
          {/* Stage 1: À Préparer */}
          <div className={`flex flex-col items-center flex-1 transition-opacity ${
            activeStage === 'prepare' ? 'opacity-100' : 'opacity-30'
          }`}>
            <div className={`w-12 h-12 lg:w-16 lg:h-16 rounded-full flex items-center justify-center transition-all ${
              activeStage === 'prepare'
                ? 'bg-blue-500 shadow-lg shadow-blue-500/50' 
                : ordersInPrepare.length > 0 ? 'bg-blue-200' : 'bg-gray-200'
            }`}>
              <Package className="text-white" size={20} />
            </div>
            <p className="mt-2 text-xs font-bold text-gray-700">À Préparer</p>
          </div>

          {/* Arrow 1 */}
          <ArrowRight className="text-gray-300 mx-2" size={20} />

          {/* Stage 2: Stickers */}
          <div className={`flex flex-col items-center flex-1 transition-opacity ${
            activeStage === 'stickers' ? 'opacity-100' : 'opacity-30'
          }`}>
            <div className={`w-12 h-12 lg:w-16 lg:h-16 rounded-full flex items-center justify-center transition-all ${
              activeStage === 'stickers'
                ? 'bg-orange-500 shadow-lg shadow-orange-500/50' 
                : ordersInStickers.length > 0 ? 'bg-orange-200' : 'bg-gray-200'
            }`}>
              <Box className="text-white" size={20} />
            </div>
            <p className="mt-2 text-xs font-bold text-gray-700">Stickers</p>
          </div>

          {/* Arrow 2 */}
          <ArrowRight className="text-gray-300 mx-2" size={20} />

          {/* Stage 3: Livrée */}
          <div className={`flex flex-col items-center flex-1 transition-opacity ${
            activeStage === 'delivered' ? 'opacity-100' : 'opacity-30'
          }`}>
            <div className={`w-12 h-12 lg:w-16 lg:h-16 rounded-full flex items-center justify-center transition-all ${
              activeStage === 'delivered'
                ? 'bg-green-500 shadow-lg shadow-green-500/50' 
                : ordersDelivered.length > 0 ? 'bg-green-200' : 'bg-gray-200'
            }`}>
              <CheckCircle className="text-white" size={20} />
            </div>
            <p className="mt-2 text-xs font-bold text-gray-700">Livrée</p>
          </div>
        </div>
      </div>

      {/* SECTION 1: À PRÉPARER */}
      {activeStage === 'prepare' && (
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-sm border-2 border-blue-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2 sm:gap-0">
          <h2 className="text-base sm:text-lg font-bold text-blue-900 flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <Package className="text-white" size={16} />
            </div>
            <span className="text-sm sm:text-base">Étape 1: À Préparer</span>
          </h2>
          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-bold shadow-md">
            {ordersInPrepare.length} commande(s)
          </span>
        </div>

        {ordersInPrepare.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Aucune commande à préparer</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ordersInPrepare.map(order => (
              <div key={order.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-all gap-3 sm:gap-0">
                <div className="flex-1 w-full">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                    <span className="font-bold text-gray-900 text-sm sm:text-base">{order.id}</span>
                    <span className="text-xs sm:text-sm text-gray-500">{order.client}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {order.products.length} produit(s) • {order.address}
                  </div>
                </div>
                
                {/* Toggle Switch */}
                <label className="relative inline-flex items-center cursor-pointer w-full sm:w-auto justify-between sm:justify-start bg-gray-50 sm:bg-transparent p-2 sm:p-0 rounded-lg sm:rounded-none">
                  <span className="sm:hidden text-sm font-medium text-gray-700">Marquer comme prêt</span>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      onChange={() => handleTogglePrepare(order.id)}
                    />
                    <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="hidden sm:inline text-sm font-medium text-gray-700">Prêt</span>
                  </div>
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* SECTION 2: STICKERS (Dropdown Style) */}
      {activeStage === 'stickers' && (
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl shadow-sm border-2 border-orange-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2 sm:gap-0">
          <h2 className="text-base sm:text-lg font-bold text-orange-900 flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <Box className="text-white" size={16} />
            </div>
            <span className="text-sm sm:text-base">Étape 2: Stickers & Scan</span>
          </h2>
          <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-bold shadow-md">
            {ordersInStickers.length} commande(s)
          </span>
        </div>

        {ordersInStickers.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-xl border-2 border-dashed border-orange-300">
            <Box className="w-12 h-12 mx-auto mb-2 opacity-50 text-orange-400" />
            <p className="text-orange-600 font-medium">Aucune commande pour stickers</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ordersInStickers.map(order => (
              <div key={order.id} className="border border-gray-200 rounded-xl overflow-hidden">
                {/* Order Header - Clickable */}
                <div 
                  onClick={() => toggleExpand(order.id)}
                  className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                      <span className="font-bold text-gray-900 text-sm sm:text-base">{order.id}</span>
                      <span className="text-xs sm:text-sm text-gray-600">{order.client}</span>
                      {allProductsScanned(order) && (
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold">
                          ✓ Tous scannés
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.products.filter(p => p.scanned).length} / {order.products.length} produits scannés
                    </div>
                  </div>
                  {expandedOrderId === order.id ? 
                    <ChevronUp className="text-gray-400" size={20} /> : 
                    <ChevronDown className="text-gray-400" size={20} />
                  }
                </div>

                {/* Products List - Dropdown Content */}
                {expandedOrderId === order.id && (
                  <div className="border-t border-gray-200 bg-white p-3 sm:p-4">
                    <div className="space-y-2 mb-4">
                      {order.products.map(product => (
                        <div key={product.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 gap-3 sm:gap-2">
                          <div className="flex-1 w-full">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-800 text-sm">{product.name}</span>
                              {product.scanned && (
                                <CheckCircle2 className="text-green-600" size={16} />
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              SKU: {product.sku} • {product.price} DH
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex gap-2 w-full sm:w-auto justify-end">
                            <button
                              onClick={() => handlePrintSticker(product)}
                              className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                              title="Imprimer sticker"
                            >
                              <Printer size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(order.id, product.id)}
                              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 size={16} />
                            </button>
                            {!product.scanned && (
                              <button
                                onClick={() => handleOpenScan(order, product)}
                                className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-1 text-xs sm:text-sm font-medium"
                              >
                                <Scan size={16} />
                                <span className="hidden sm:inline">Scanner</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Livrée Toggle - Only show if all products scanned */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 gap-3 sm:gap-0">
                      <div className="flex-1">
                        <p className="font-bold text-green-900 text-sm sm:text-base">Marquer comme Livré</p>
                        <p className="text-xs text-green-700">
                          {allProductsScanned(order) ? 
                            'Tous les produits sont scannés' : 
                            `Scanner ${order.products.filter(p => !p.scanned).length} produit(s) restant(s)`
                          }
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer w-full sm:w-auto justify-between sm:justify-start">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          disabled={!allProductsScanned(order)}
                          onChange={() => handleToggleDelivered(order.id)}
                        />
                        <div className={`w-14 h-7 rounded-full peer peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600 ${
                          allProductsScanned(order) ? 'bg-gray-300' : 'bg-gray-200 cursor-not-allowed opacity-50'
                        }`}></div>
                        <span className="ml-3 text-sm font-medium text-gray-700">Livré</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* SECTION 3: LIVRÉE */}
      {activeStage === 'delivered' && (
      <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl shadow-sm border-2 border-green-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2 sm:gap-0">
          <h2 className="text-base sm:text-lg font-bold text-green-900 flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
              <CheckCircle className="text-white" size={16} />
            </div>
            <span className="text-sm sm:text-base">Étape 3: Livrée</span>
          </h2>
          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-bold shadow-md">
            {ordersDelivered.length} commande(s)
          </span>
        </div>

        {ordersDelivered.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-xl border-2 border-dashed border-green-300">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50 text-green-400" />
            <p className="text-green-600 font-medium">Aucune commande livrée</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ordersDelivered.map(order => (
              <div key={order.id} className="bg-white p-3 sm:p-4 rounded-xl border border-green-200 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                  <div className="flex-1 w-full">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                      <span className="font-bold text-gray-900 text-sm sm:text-base">{order.id}</span>
                      <span className="text-xs sm:text-sm text-gray-600">{order.client}</span>
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        Livrée
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.products.length} produit(s) • {order.address}
                    </div>
                    <div className="text-xs text-green-600 font-medium mt-1">
                      Total: {order.products.reduce((sum, p) => sum + p.price, 0)} DH
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="text-green-600" size={24} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* SCAN MODAL */}
      {showScanModal && currentScanProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="p-6 pb-2 text-center relative z-10">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-orange-100">
                <Scan className="w-6 h-6 text-orange-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Scanner le Produit</h2>
              <p className="text-sm text-slate-500 mt-1">
                Scannez le SKU: <span className="font-mono font-bold text-slate-700">{currentScanProduct.sku}</span>
              </p>
              <p className="text-xs text-slate-400 mt-2">{currentScanProduct.name}</p>
            </div>

            {/* Input Section */}
            <div className="p-6 pt-2 bg-white relative z-10">
              {scanError && (
                <div className="mb-4 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {scanError}
                </div>
              )}
              
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={scanInput}
                    onChange={(e) => {
                      setScanInput(e.target.value);
                      if (scanError) setScanError('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyScan()}
                    placeholder="Scanner ou saisir SKU..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-bold text-center tracking-widest"
                    autoFocus
                  />
                  <Scan className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowScanModal(false)}
                  className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleVerifyScan}
                  disabled={!scanInput}
                  className={`flex-[2] py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20 ${
                    !scanInput 
                      ? 'bg-slate-300 cursor-not-allowed' 
                      : 'bg-orange-600 hover:bg-orange-700 active:scale-95'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  Confirmer
                </button>
              </div>
              
              <div className="mt-4 text-center">
                 <p className="text-[10px] text-slate-400">
                   Code attendu: <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-600">{currentScanProduct.sku}</span>
                 </p>
              </div>
            </div>

          </div>
        </div>
      )}

      </div>
    </div>
  );
}
