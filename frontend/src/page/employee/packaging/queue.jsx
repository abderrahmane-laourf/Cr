import React, { useState, useEffect, useMemo } from 'react';
import { 
  Check, Package, X, Scan, CheckCircle2, AlertTriangle, Truck, 
  CheckCircle, ChevronDown, ChevronUp, Printer, ArrowRight, Trash2, Box, Play
} from 'lucide-react';

// --- MOCKED DATA (Preserved & Enhanced) ---
const MOCK_ORDERS = [
  { 
    id: 'CMD-302', client: 'Fatima Z.', status: 'prepare', barcode: '123456',
    products: [{ id: 'P1', name: 'Serum Vitamine C', sku: 'SER001', price: 250, scanned: false }]
  },
  { 
    id: 'CMD-305', client: 'Ahmed K.', status: 'prepare', barcode: '789012',
    products: [{ id: 'P1', name: 'Serum Vitamine C', sku: 'SER001', price: 250, scanned: false }]
  },
  { 
    id: 'CMD-310', client: 'Samira R.', status: 'prepare', barcode: '345678',
    products: [
        { id: 'P4', name: 'Pack Anti-Age', sku: 'PACK001', price: 450, scanned: false },
        { id: 'P5', name: 'Masque Visage', sku: 'MAS001', price: 120, scanned: false }
    ]
  },
  { 
    id: 'CMD-311', client: 'Youssef M.', status: 'stickers', barcode: '456789',
    products: [{ id: 'P7', name: 'Gel Nettoyant', sku: 'GEL001', price: 150, scanned: false }]
  }
];

const GLOBAL_PICKUP_TIME = '16:00'; 

export default function PackagingQueue() {
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [activeStage, setActiveStage] = useState('prepare'); 
  const [expandedGroupId, setExpandedGroupId] = useState(null); // For Dropdown in Prepare
  const [expandedOrderId, setExpandedOrderId] = useState(null); // For Stickers tab
  const [showScanModal, setShowScanModal] = useState(false);
  const [currentScanProduct, setCurrentScanProduct] = useState(null);
  const [currentScanOrder, setCurrentScanOrder] = useState(null);
  const [scanInput, setScanInput] = useState('');
  const [scanError, setScanError] = useState('');

  // --- LOGIC: Grouping for "À Préparer" ---
  // هادي هي الـ Logic اللي كتجمع السلعة حسب النوع باش تعرف شحال غتهز فدقة
  const groupedPrepare = useMemo(() => {
    const groups = {};
    orders.filter(o => o.status === 'prepare').forEach(order => {
      order.products.forEach(p => {
        if (!groups[p.name]) {
          groups[p.name] = { name: p.name, sku: p.sku, total: 0, orders: [] };
        }
        groups[p.name].total += 1;
        // Avoid pushing the same order multiple times for the same product group
        if (!groups[p.name].orders.some(o => o.orderId === order.id)) {
          const pieces = order.products.length;
          const price = order.products.reduce((s, pr) => s + (pr.price || 0), 0);
          groups[p.name].orders.push({ orderId: order.id, client: order.client, pieces, price });
        }
      });
    });
    return Object.values(groups);
  }, [orders]);

  // --- ACTIONS ---
  const handleMarkAsPrepared = (orderId) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'stickers' } : o));
    console.log(`Impression auto du Bon pour ${orderId}`); // Auto-print logic
  };

  const handleRapidPrepareAll = (productName) => {
    // كيدوز كاع الطلبيات اللي فيهم هاد المنتج للمرحلة الجاية
    setOrders(prev => prev.map(o => {
      const hasProduct = o.products.some(p => p.name === productName);
      if (o.status === 'prepare' && hasProduct) {
        return { ...o, status: 'stickers' };
      }
      return o;
    }));
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
      setScanError('SKU Incorrect!');
    }
  };

  // --- TIME CALCULATION ---
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0 });
  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const pickup = new Date();
      pickup.setHours(16, 0, 0);
      const diff = pickup - now;
      setTimeRemaining({
        hours: Math.max(0, Math.floor(diff / 3600000)),
        minutes: Math.max(0, Math.floor((diff % 3600000) / 60000))
      });
    };
    calc();
    const timer = setInterval(calc, 60000);
    return () => clearInterval(timer);
  }, []);

  const progress = Math.round((orders.filter(o => o.status === 'delivered').length / orders.length) * 100) || 0;

  return (
    <div className="w-full min-h-screen bg-transparent p-4 md:p-8 font-sans text-slate-800 animate-[fade-in_0.5s_ease-out]">
      
      {/* 1. HEADER & TIMER (Keep your style) */}
      <div className="glass-card p-6 mb-6">
        <div className="bg-gradient-to-r from-[#018790] to-teal-600 text-white p-4 rounded-xl mb-6 flex items-center justify-between shadow-lg shadow-teal-900/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm"><Truck /></div>
            <div>
              <p className="text-xs font-bold text-teal-100 uppercase tracking-wider">Ramassage</p>
              <p className="text-2xl font-black">16h00</p>
            </div>
          </div>
          <div className="text-right bg-white/10 px-4 py-2 rounded-lg border border-white/10">
            <p className="text-[10px] font-bold text-teal-100 uppercase">Temps Restant</p>
            <p className="text-xl font-bold font-mono">{timeRemaining.hours}h {timeRemaining.minutes}m</p>
          </div>
        </div>

        <div className="flex justify-between items-end mb-2">
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Package className="text-[#018790]" /> Pipeline Logistique
            </h1>
            <span className="text-3xl font-black text-[#018790]">{progress}%</span>
        </div>
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#018790] transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* 2. STAGE SELECTOR (Tabs) */}
      <div className="frosted-panel p-2 mb-6 flex gap-2">
          {['prepare', 'stickers', 'delivered'].map((stage) => (
            <button
              key={stage}
              onClick={() => setActiveStage(stage)}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                activeStage === stage ? 'bg-[#018790] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {stage === 'prepare' && <Play size={18} />}
              {stage === 'stickers' && <Box size={18} />}
              {stage === 'delivered' && <CheckCircle size={18} />}
              <span className="capitalize">{stage === 'prepare' ? 'À Préparer' : stage}</span>
            </button>
          ))}
      </div>

      {/* 3. MAIN CONTENT */}
      <div className="min-h-[400px]">
        
        {/* --- STAGE: À PRÉPARER (The New Grouped View) --- */}
        {activeStage === 'prepare' && (
          <div className="space-y-4">
            {groupedPrepare.length === 0 ? <EmptyState icon={Check} message="Tout est emballé !" /> : (
              groupedPrepare.map((group, idx) => (
                <div key={idx} className="premium-card rounded-2xl overflow-hidden border border-slate-200">
                  {/* Product Header (Dropdown Trigger) */}
                  <div 
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-all"
                    onClick={() => setExpandedGroupId(expandedGroupId === group.name ? null : group.name)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex flex-col items-center justify-center shadow-lg shadow-blue-200">
                        <span className="text-2xl font-extrabold leading-none">{group.total}</span>
                        <span className="text-[8px] font-bold uppercase">pcs</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-extrabold text-slate-900">{group.name}</h3>
                        <p className="text-sm text-slate-600 font-medium">SKU: {group.sku}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleRapidPrepareAll(group.name); }}
                            className="hidden md:flex px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black rounded-lg transition-all"
                        >
                            TOUT PRÉPARER
                        </button>
                        {expandedGroupId === group.name ? <ChevronUp /> : <ChevronDown />}
                    </div>
                  </div>

                  {/* Dropdown Content (Orders List) */}
                  {expandedGroupId === group.name && (
                    <div className="bg-slate-50/50 p-4 border-t border-slate-100 space-y-2">
                        {group.orders.map((order, i) => (
                          <div key={i} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-4">
                              <span className="font-mono font-extrabold text-blue-600">{order.orderId}</span>
                              <div>
                                <div className="text-sm font-semibold text-slate-800">{order.client}</div>
                                <div className="text-sm text-slate-500 mt-1 flex items-center gap-3">
                                  <span className="font-bold">{order.pieces} pcs</span>
                                  <span className="font-mono">{order.price} MAD</span>
                                  {order.pieces >= 2 && (
                                    <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">Multi-piece</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button 
                              onClick={() => handleMarkAsPrepared(order.orderId)}
                              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-[#018790] hover:text-white rounded-lg text-xs font-bold transition-all"
                            >
                              <Printer size={14} /> Prêt & Imprimer
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* --- STAGE: STICKERS (The Scan Stage) --- */}
        {activeStage === 'stickers' && (
           <div className="space-y-4">
            {orders.filter(o => o.status === 'stickers').map(order => (
               <div key={order.id} className="premium-card rounded-2xl border-l-4 border-l-orange-500 overflow-hidden">
                  <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}>
                      <div>
                        <span className="text-lg font-extrabold text-slate-900">{order.id}</span>
                        <p className="text-sm text-slate-600">{order.client} • {order.products.length} articles</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {order.products.every(p => p.scanned) && <CheckCircle2 className="text-emerald-500" size={20} />}
                        <ChevronDown className={`transition-transform ${expandedOrderId === order.id ? 'rotate-180' : ''}`} />
                      </div>
                  </div>

                  {expandedOrderId === order.id && (
                    <div className="p-4 bg-slate-50 border-t space-y-3">
                        {order.products.map(p => (
                          <div key={p.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                            <div>
                              <p className="text-sm font-bold text-slate-800">{p.name}</p>
                              <p className="text-xs font-mono text-slate-500">{p.sku}</p>
                            </div>
                            {p.scanned ? (
                              <span className="text-emerald-500 text-xs font-bold flex items-center gap-1"><CheckCircle size={14} /> Scanné</span>
                            ) : (
                              <button 
                                onClick={() => { setCurrentScanOrder(order); setCurrentScanProduct(p); setShowScanModal(true); }}
                                className="px-3 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-lg flex items-center gap-2"
                              >
                                <Scan size={14} /> Scanner
                              </button>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
               </div>
            ))}
           </div>
        )}

        {/* --- STAGE: DELIVERED --- */}
        {activeStage === 'delivered' && (
            <div className="space-y-3">
                {orders.filter(o => o.status === 'delivered').map(o => (
                    <div key={o.id} className="premium-card p-4 rounded-2xl flex items-center gap-4 opacity-70">
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center"><Check size={20} strokeWidth={3}/></div>
                        <div>
                            <p className="font-bold text-slate-800">{o.id}</p>
                            <p className="text-xs text-slate-500">Livré avec succès</p>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* 4. SCAN MODAL (Keep your Logic) */}
      {showScanModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95">
                <div className="bg-orange-500 p-8 text-center text-white">
                    <Scan className="w-12 h-12 mx-auto mb-4" />
                    <h2 className="text-xl font-black">Vérification Produit</h2>
                    <p className="text-orange-100 text-sm">{currentScanProduct?.name}</p>
                </div>
                <div className="p-6">
                    {scanError && <div className="mb-4 text-red-500 text-xs font-bold text-center bg-red-50 py-2 rounded-lg">{scanError}</div>}
                    <input 
                        autoFocus
                        type="text" 
                        className="w-full p-4 bg-slate-100 border-2 border-slate-200 rounded-2xl text-center font-mono font-bold text-xl outline-none focus:border-orange-500"
                        placeholder="Scanner le SKU..."
                        value={scanInput}
                        onChange={(e) => { setScanInput(e.target.value); setScanError(''); }}
                        onKeyDown={(e) => e.key === 'Enter' && handleVerifyScan()}
                    />
                    <div className="flex gap-2 mt-4">
                        <button onClick={() => setShowScanModal(false)} className="flex-1 py-3 font-bold text-slate-400">Annuler</button>
                        <button onClick={handleVerifyScan} className="flex-[2] py-3 bg-orange-600 text-white rounded-xl font-black shadow-lg shadow-orange-200">CONFIRMER</button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, message }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-slate-300">
            <Icon size={48} className="mb-4 opacity-20" />
            <p className="font-bold">{message}</p>
        </div>
    );
}