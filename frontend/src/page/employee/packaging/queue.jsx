import React, { useState, useEffect } from 'react';
import { 
  Check, 
  Package, 
  Camera, 
  X, 
  Scan, 
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Truck
} from 'lucide-react';
import { productAPI } from '../../../services/api';

// --- MOCKED DATA FOR DEMO IF API FAILS ---
const MOCK_ORDERS = [
  { id: 'CMD-302', client: 'Fatima Z.', product: 'Serum Vitamine C', quantity: 2, status: 'pending', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=200', barcode: '123456' },
  { id: 'CMD-305', client: 'Ahmed K.', product: 'Crème Hydratante', quantity: 1, status: 'pending', image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?auto=format&fit=crop&q=80&w=200', barcode: '789012' },
  { id: 'CMD-310', client: 'Samira R.', product: 'Pack Anti-Age', quantity: 1, status: 'completed', image: 'https://images.unsplash.com/photo-1556228578-8c858564a275?auto=format&fit=crop&q=80&w=200', barcode: '345678' }
];

// Global pickup time for all packages
const GLOBAL_PICKUP_TIME = '16:00'; // 16h00

export default function PackagingQueue() {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'completed'
  const [orders, setOrders] = useState(MOCK_ORDERS);
  
  // Modal State
  const [showScanModal, setShowScanModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scanStatus, setScanStatus] = useState('idle'); // idle, error, success
  const [errorMessage, setErrorMessage] = useState('');

  // ----------------------------------------------------------------------
  // LOGIC
  // ----------------------------------------------------------------------

  const handleOpenScan = (order) => {
    setSelectedOrder(order);
    setBarcodeInput('');
    setScanStatus('idle');
    setErrorMessage('');
    setShowScanModal(true);
  };

  const handleVerify = () => {
    if (!selectedOrder) return;

    // Verify Logic
    // In real scenario this matches selectedOrder.sku or product.barcode
    // Here we strictly check against the mock barcode or just ID for simplicity if barcode missing
    const targetCode = selectedOrder.barcode || selectedOrder.id;
    
    if (barcodeInput === targetCode) {
      setScanStatus('success');
      
      // Auto close and move after delay
      setTimeout(() => {
        confirmOrder(selectedOrder.id);
        setShowScanModal(false);
      }, 1500);
    } else {
      setScanStatus('error');
      setErrorMessage('Produit incorrect. Code-barres non correspondant.');
    }
  };

  const confirmOrder = (orderId) => {
    setOrders(prev => prev.map(o => 
      o.id === orderId 
        ? { ...o, status: 'completed', completedAt: new Date().toISOString() } 
        : o
    ));
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const completedOrders = orders.filter(o => o.status === 'completed');
  
  const currentList = activeTab === 'pending' ? pendingOrders : completedOrders;
  const progress = Math.round((completedOrders.length / orders.length) * 100) || 0;

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
    <div className="max-w-md mx-auto min-h-screen pb-20 md:pb-0 md:max-w-4xl">
      
      {/* Top Progress Section with Global Pickup Time */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6 sticky top-0 md:static z-10">
        {/* Pickup Time Banner */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-blue-100">Ramassage Global</p>
              <p className="text-2xl font-bold">{GLOBAL_PICKUP_TIME.replace(':', 'h')}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-blue-100">Temps Restant</p>
            <p className="text-xl font-bold">
              {timeRemaining.hours}h {timeRemaining.minutes}m
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex justify-between items-end mb-2">
          <div>
            <h1 className="text-xl font-bold text-slate-900">File d'emballage</h1>
            <p className="text-sm text-slate-500">
              {pendingOrders.length} commandes en attente
            </p>
          </div>
          <span className="text-2xl font-bold text-blue-600">{progress}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'pending' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          À Préparer <span className="ml-1 opacity-80 text-xs px-1.5 py-0.5 bg-blue-100/50 rounded-full">{pendingOrders.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'completed' 
              ? 'bg-white text-emerald-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Prêt / Livré <span className="ml-1 opacity-80 text-xs px-1.5 py-0.5 bg-emerald-100/50 rounded-full">{completedOrders.length}</span>
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {currentList.map(order => (
          <div 
            key={order.id} 
            className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 transition-all hover:shadow-md"
          >
            {/* Image */}
            <div className="relative shrink-0">
              <img 
                src={order.image} 
                alt={order.product} 
                className="w-16 h-16 object-cover rounded-xl bg-slate-50"
              />
              <span className="absolute -bottom-2 -right-2 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white shadow-sm">
                QTÉ {order.quantity}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                  {order.id}
                </span>
              </div>
              <h3 className="font-bold text-slate-800 text-sm truncate">{order.product}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{order.client}</p>
            </div>

            {/* Action Button */}
            {activeTab === 'pending' ? (
              <button
                onClick={() => handleOpenScan(order)}
                className="w-12 h-12 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-300 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all group"
              >
                <Check className="w-6 h-6 group-hover:scale-110 transition-transform" strokeWidth={3} />
              </button>
            ) : (
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            )}
          </div>
        ))}

        {currentList.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Package className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">Aucune commande ici</p>
          </div>
        )}
      </div>

      {/* SCAN MODAL */}
      {showScanModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="p-6 pb-2 text-center relative z-10">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
                <Scan className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Vérification Requise</h2>
              <p className="text-sm text-slate-500 mt-1 max-w-[200px] mx-auto">
                Scannez le code-barres pour confirmer la commande <span className="font-mono font-bold text-slate-700">{selectedOrder.id}</span>
              </p>
            </div>

            {/* Simple Camera Mock View */}
            <div className="relative px-6 py-4">
              <div className="aspect-square bg-slate-900 rounded-3xl relative overflow-hidden ring-4 ring-slate-100">
                {/* Mock Camera UI Overlay */}
                <div className="absolute inset-0 flex items-center justify-center border-[2px] border-white/30 m-8 rounded-xl">
                  <div className="w-full h-0.5 bg-red-500 absolute top-1/2 -translate-y-1/2 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse" />
                </div>
                <div className="absolute top-4 right-4 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-md">
                  Live View
                </div>
                {/* Image acting as camera feed */}
                <img 
                  src={selectedOrder.image} 
                  className="w-full h-full object-cover opacity-50 blur-sm scale-110" 
                  alt="Camera Feed" 
                />
              </div>
            </div>

            {/* Input Section */}
            <div className="p-6 pt-2 bg-white relative z-10">
              {scanStatus === 'error' && (
                <div className="mb-4 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {errorMessage}
                </div>
              )}
              
              {scanStatus === 'success' ? (
                <div className="mb-4 bg-emerald-50 text-emerald-600 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 justify-center animate-in zoom-in duration-300">
                  <CheckCircle2 className="w-5 h-5" />
                  Code confirmé !
                </div>
              ) : (
                <div className="flex gap-2 mb-4">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={barcodeInput}
                      onChange={(e) => {
                        setBarcodeInput(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      placeholder="Saisir code-barres..."
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-center tracking-widest"
                      autoFocus
                    />
                    <Scan className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowScanModal(false)}
                  className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleVerify}
                  disabled={!barcodeInput || scanStatus === 'success'}
                  className={`flex-[2] py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20
                    ${!barcodeInput 
                      ? 'bg-slate-300 cursor-not-allowed' 
                      : scanStatus === 'success' 
                        ? 'bg-emerald-500' 
                        : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                    }
                  `}
                >
                  {scanStatus === 'success' ? (
                    <>Transfert en cours...</>
                  ) : (
                    <>
                      Confirmer <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
              
              <div className="mt-4 text-center">
                 <p className="text-[10px] text-slate-400">
                   Code démo pour test: <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-600">{selectedOrder.barcode}</span>
                 </p>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
