import React, { useState, useEffect } from 'react';
import { 
  Calendar, Package, Truck, ArrowRight, Check, ChevronDown, AlertCircle, Plus, X, Search
} from 'lucide-react';

// Mock APIs
const transfersAPI = {
  getAll: async () => {
    const response = await fetch('http://localhost:3000/stockTransfers');
    return response.json();
  },
  create: async (transfer) => {
    const response = await fetch('http://localhost:3000/stockTransfers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transfer)
    });
    return response.json();
  },
  update: async (id, data) => {
    const response = await fetch(`http://localhost:3000/stockTransfers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
};

const movementsAPI = {
  create: async (movement) => {
    const response = await fetch('http://localhost:3000/stockMovements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(movement)
    });
    return response.json();
  }
};

const productsAPI = {
  getAll: async () => {
    const response = await fetch('http://localhost:3000/products');
    return response.json();
  }
};

const warehousesAPI = {
  getAll: async () => {
    const response = await fetch('http://localhost:3000/warehouses');
    return response.json();
  }
};

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Transfer Modal Component
const TransferModal = ({ isOpen, onClose, onSave, products, warehouses }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    productId: '',
    quantity: '',
    sourceWarehouse: '',
    destinationWarehouse: ''
  });

  const [error, setError] = useState('');

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.sourceWarehouse === formData.destinationWarehouse) {
      setError('L\'entrepôt source et destination ne peuvent pas être identiques.');
      return;
    }

    if (!formData.productId || !formData.quantity || !formData.sourceWarehouse || !formData.destinationWarehouse) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const selectedProduct = products.find(p => String(p.id) === String(formData.productId));
    
    onSave({
      ...formData,
      productName: selectedProduct?.name,
      quantity: parseInt(formData.quantity),
      status: 'En cours',
      userId: '1',
      userName: 'Bernard Anouith'
    });

    // Reset form
    setFormData({
      date: new Date().toISOString().slice(0, 10),
      productId: '',
      quantity: '',
      sourceWarehouse: '',
      destinationWarehouse: ''
    });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Truck className="text-blue-600" size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Nouveau Transfert</h2>
              <p className="text-xs text-slate-500 mt-0.5">Déplacer des produits entre entrepôts</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition">
            <X size={20}/>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                Date <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="date" 
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  value={formData.date}
                  onChange={e => handleFieldChange('date', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Product */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                Produit <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select 
                  className="w-full pl-12 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 outline-none appearance-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  value={formData.productId}
                  onChange={e => handleFieldChange('productId', e.target.value)}
                  required
                >
                  <option value="">-- Choisir un produit --</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                Quantité <span className="text-red-400">*</span>
              </label>
              <input 
                type="number" 
                min="1"
                step="1"
                placeholder="Ex: 10" 
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                value={formData.quantity}
                onChange={e => handleFieldChange('quantity', e.target.value)}
                required
              />
            </div>

            {/* Source Warehouse */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                De l'entrepôt <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select 
                  className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 outline-none appearance-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  value={formData.sourceWarehouse}
                  onChange={e => handleFieldChange('sourceWarehouse', e.target.value)}
                  required
                >
                  <option value="">-- Choisir --</option>
                  {warehouses.map(warehouse => (
                    <option key={warehouse.id} value={warehouse.name}>{warehouse.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Destination Warehouse */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                Vers l'entrepôt <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select 
                  className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 outline-none appearance-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  value={formData.destinationWarehouse}
                  onChange={e => handleFieldChange('destinationWarehouse', e.target.value)}
                  required
                >
                  <option value="">-- Choisir --</option>
                  {warehouses.map(warehouse => (
                    <option key={warehouse.id} value={warehouse.name}>{warehouse.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all"
            >
              Annuler
            </button>
            <button 
              type="submit"
              className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
            >
              <Check size={20} />
              Confirmer le transfert
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Page Component
export default function StockTransferPage() {
  const [transfers, setTransfers] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [transfersData, productsData, warehousesData] = await Promise.all([
        transfersAPI.getAll(),
        productsAPI.getAll(),
        warehousesAPI.getAll()
      ]);
      setTransfers(transfersData);
      setProducts(productsData);
      setWarehouses(warehousesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransfer = async (transfer) => {
    try {
      await transfersAPI.create(transfer);
      loadData();
    } catch (error) {
      console.error('Error creating transfer:', error);
    }
  };

  const handleCompleteTransfer = async (id) => {
    try {
      // Find the transfer
      const transfer = transfers.find(t => String(t.id) === String(id));
      if (!transfer) return;

      // Update transfer status to Complété
      await transfersAPI.update(id, { status: 'Complété' });

      // Create two stock movements: Exit from source, Entry to destination
      const currentDate = new Date().toISOString().slice(0, 10);
      const currentUser = {
        id: '1',
        name: 'Bernard Anouith',
        avatar: 'https://i.pravatar.cc/150?img=33'
      };

      // Exit movement from source warehouse
      await movementsAPI.create({
        productId: transfer.productId,
        productName: transfer.productName,
        type: 'Sortie',
        reason: `Transfert vers ${transfer.destinationWarehouse}`,
        quantity: -Math.abs(transfer.quantity),
        warehouse: transfer.sourceWarehouse,
        date: currentDate,
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        note: `Transfert #${transfer.id}`
      });

      // Entry movement to destination warehouse
      await movementsAPI.create({
        productId: transfer.productId,
        productName: transfer.productName,
        type: 'Entrée',
        reason: `Transfert depuis ${transfer.sourceWarehouse}`,
        quantity: Math.abs(transfer.quantity),
        warehouse: transfer.destinationWarehouse,
        date: currentDate,
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        note: `Transfert #${transfer.id}`
      });

      loadData();
    } catch (error) {
      console.error('Error completing transfer:', error);
    }
  };

  const filteredTransfers = transfers.filter(transfer =>
    transfer.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.sourceWarehouse?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.destinationWarehouse?.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="min-h-screen bg-slate-50/50 p-8 font-sans text-slate-800">
      
      {/* HEADER */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Transfert de Stock</h1>
            <p className="text-slate-500 mt-1 font-medium">Déplacez des produits entre vos entrepôts.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 font-semibold"
          >
            <Plus size={20} /> Nouveau Transfert
          </button>
        </div>

        {/* Search */}
        <div className="relative mt-6 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher un transfert..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" 
          />
        </div>
      </div>

      {/* TRANSFERS TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Historique des Transferts</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Produit</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Quantité</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">De</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Vers</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Statut</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTransfers.map((transfer) => (
                <tr key={transfer.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-slate-400" />
                      {formatDate(transfer.date)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-800">{transfer.productName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-lg font-black text-blue-600">{transfer.quantity}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-lg font-medium">
                      {transfer.sourceWarehouse}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <ArrowRight size={16} className="text-slate-400" />
                      <span className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-lg font-medium">
                        {transfer.destinationWarehouse}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {transfer.status === 'Complété' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <Check size={14} />
                        Complété
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-100">
                        <Truck size={14} />
                        En cours
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {transfer.status === 'En cours' && (
                      <button
                        onClick={() => handleCompleteTransfer(transfer.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-sm"
                        title="Marquer comme complété"
                      >
                        <Check size={14} />
                        Marquer Complété
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredTransfers.length === 0 && (
            <div className="p-10 text-center text-slate-400 flex flex-col items-center">
              <Truck size={40} className="mb-2 opacity-20" />
              <p>Aucun transfert trouvé</p>
            </div>
          )}
        </div>
      </div>

      {/* Transfer Modal */}
      <TransferModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddTransfer}
        products={products}
        warehouses={warehouses}
      />
    </div>
  );
}
