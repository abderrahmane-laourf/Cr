import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, Package, DollarSign, User, Calendar, 
  Phone, MapPin, AlertTriangle, Eye, Filter, Clock, FileText
} from 'lucide-react';
import { productAPI } from '../../../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ManagerApprovals() {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [filterProduct, setFilterProduct] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filterDate, filterProduct, pendingOrders]);

  const loadData = async () => {
    const savedColis = JSON.parse(localStorage.getItem('colis')) || [];
    const productsData = await productAPI.getAll().catch(() => []);
    setProducts(productsData);

    // Filter orders that are delivered, paid, and pending approval
    const pending = savedColis.filter(c => 
      (c.stage === 'Livré-AG' || c.stage === 'Livré') &&
      c.isPaid &&
      c.pendingApproval &&
      c.pipelineId === 2
    );

    setPendingOrders(pending);
    setFilteredOrders(pending);
  };

  const applyFilters = () => {
    let filtered = [...pendingOrders];

    if (filterDate) {
      filtered = filtered.filter(o => {
        const orderDate = new Date(o.paidAt || o.dateCreated).toISOString().split('T')[0];
        return orderDate === filterDate;
      });
    }

    if (filterProduct !== 'all') {
      filtered = filtered.filter(o => o.productId == filterProduct);
    }

    setFilteredOrders(filtered);
  };

  // Removed approve/reject functionality as per requirements

  const printApprovalsList = () => {
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString('fr-FR');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    // Title
    doc.setFontSize(20);
    doc.text('Liste des Approbations en Attente', 105, 20, null, null, 'center');
    
    // Subtitle
    doc.setFontSize(12);
    doc.text(`Généré par: ${currentUser.name || 'N/A'}`, 20, 30);
    doc.text(`Date: ${currentDate}`, 20, 37);
    
    // Table
    const tableData = filteredOrders.map(order => {
      const product = products.find(p => p.id === order.productId);
      return [
        order.id,
        order.clientName,
        product?.nom || 'N/A',
        order.prix,
        new Date(order.paidAt).toLocaleDateString('fr-FR'),
        order.paidBy
      ];
    });
    
    autoTable(doc, {
      startY: 45,
      head: [['ID', 'Client', 'Produit', 'Montant (DH)', 'Date Paiement', 'Payé par']],
      body: tableData,
      theme: 'grid',
      styles: { cellPadding: 3, fontSize: 10 },
      headStyles: { fillColor: [249, 115, 22], textColor: 255 }
    });
    
    // Save the PDF
    doc.save(`approbations-en-attente-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 px-4 sm:px-0">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="text-orange-600" size={24} />
          Approbations en Attente
        </h1>
        <p className="text-sm sm:text-base text-slate-500 font-medium">
          Validez les paiements des livreurs
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="text-orange-600" size={20} />
            <p className="text-xs font-bold text-slate-500 uppercase">En attente</p>
          </div>
          <p className="text-2xl font-extrabold text-orange-600">{pendingOrders.length}</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="text-emerald-600" size={20} />
            <p className="text-xs font-bold text-slate-500 uppercase">Montant Total</p>
          </div>
          <p className="text-2xl font-extrabold text-emerald-600">
            {pendingOrders.reduce((sum, o) => sum + (parseFloat(o.prix) || 0), 0).toFixed(2)} DH
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="text-slate-600" size={20} />
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">Filtres</h3>
          </div>
          <button
            onClick={printApprovalsList}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors text-sm font-bold"
          >
            <FileText size={16} />
            Imprimer Liste
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Date de paiement</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Produit</label>
            <select
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
            >
              <option value="all">Tous les produits</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>{product.nom}</option>
              ))}
            </select>
          </div>
        </div>
        {(filterDate || filterProduct !== 'all') && (
          <button
            onClick={() => {
              setFilterDate('');
              setFilterProduct('all');
            }}
            className="mt-3 text-xs sm:text-sm text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1"
          >
            Réinitialiser tous les filtres
          </button>
        )}
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">Aucune approbation en attente</h3>
            <p className="text-slate-500">Toutes les commandes ont été traitées</p>
          </div>
        ) : (
          filteredOrders.map(order => {
            const product = products.find(p => p.id === order.productId);
            
            return (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 flex items-center justify-between">
                  <span className="text-white font-bold text-sm">Commande #{order.id}</span>
                  <span className="bg-white/20 text-white px-2 py-1 rounded-full text-xs font-bold">
                    {order.prix} DH
                  </span>
                </div>

                <div className="p-4 sm:p-5 space-y-4">
                  {/* Client Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="text-slate-400" size={16} />
                      <div>
                        <p className="text-xs text-slate-500">Client</p>
                        <p className="font-bold text-slate-900">{order.clientName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="text-slate-400" size={16} />
                      <div>
                        <p className="text-xs text-slate-500">Téléphone</p>
                        <p className="font-mono text-slate-900">{order.tel}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="text-slate-400" size={16} />
                      <div>
                        <p className="text-xs text-slate-500">Produit</p>
                        <p className="font-medium text-slate-900">{product?.nom || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="text-slate-400" size={16} />
                      <div>
                        <p className="text-xs text-slate-500">Ville</p>
                        <p className="font-medium text-slate-900">{order.ville || 'Agadir'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-xs font-bold text-orange-900 mb-2">Informations de paiement</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-orange-700">Payé par</p>
                        <p className="font-bold text-orange-900">{order.paidBy}</p>
                      </div>
                      <div>
                        <p className="text-orange-700">Date de paiement</p>
                        <p className="font-bold text-orange-900">
                          {new Date(order.paidAt).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="bg-orange-50 p-3 rounded-lg text-center">
                    <p className="text-orange-700 font-bold">En attente de validation</p>
                    <p className="text-orange-600 text-sm mt-1">Validation désactivée</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}