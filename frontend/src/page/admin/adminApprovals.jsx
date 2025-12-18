import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, Package, DollarSign, User, Calendar, 
  Phone, MapPin, AlertTriangle, Filter, Clock, Truck, FileText
} from 'lucide-react';
import { productAPI, villeAPI } from '../../services/api';

export default function AdminApprovals() {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [villes, setVilles] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [filterLivreur, setFilterLivreur] = useState('all');
  const [filterProduct, setFilterProduct] = useState('all');
  const [livreurs, setLivreurs] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filterDate, filterLivreur, filterProduct, pendingOrders]);

  const loadData = async () => {
    const savedColis = JSON.parse(localStorage.getItem('colis') || '[]');
    const productsData = await productAPI.getAll().catch(() => []);
    const villesData = await villeAPI.getAll().catch(() => []);
    
    setProducts(productsData);
    setVilles(villesData);

    const pending = savedColis.filter(c => 
      (c.stage === 'LivrÃ©-AG' || c.stage === 'LivrÃ©') &&
      c.isPaid &&
      c.pendingApproval &&
      c.pipelineId === 2
    );

    const uniqueLivreurs = [...new Set(pending.map(o => o.paidBy).filter(Boolean))];
    setLivreurs(uniqueLivreurs);

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

    if (filterLivreur !== 'all') {
      filtered = filtered.filter(o => o.paidBy === filterLivreur);
    }

    if (filterProduct !== 'all') {
      filtered = filtered.filter(o => o.productId == filterProduct);
    }

    setFilteredOrders(filtered);
  };

  // Removed approve/reject functionality as per requirements

  const printAdminApprovalsList = () => {
    const currentDate = new Date();
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    const totalAmount = filteredOrders.reduce((sum, o) => sum + (parseFloat(o.prix) || 0), 0);
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Approbations Admin - ${currentDate.toLocaleDateString('fr-FR')}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            padding: 30px;
            background: #f8f9fa;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            border-bottom: 4px solid #dc2626;
            padding-bottom: 25px;
            margin-bottom: 35px;
          }
          .header h1 {
            font-size: 32px;
            color: #1e293b;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .header .meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 15px;
          }
          .alert-box {
            background: #fef2f2;
            border-left: 4px solid #dc2626;
            padding: 20px;
            margin-bottom: 30px;
            border-radius: 8px;
          }
          .alert-box h3 {
            color: #991b1b;
            margin-bottom: 10px;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 30px;
          }
          .stat-card {
            background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
            color: white;
            padding: 25px;
            border-radius: 12px;
            text-align: center;
          }
          .stat-card label {
            display: block;
            font-size: 12px;
            text-transform: uppercase;
            opacity: 0.9;
            margin-bottom: 8px;
          }
          .stat-card value {
            display: block;
            font-size: 32px;
            font-weight: bold;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          thead {
            background: #dc2626;
            color: white;
          }
          th {
            padding: 14px 12px;
            text-align: left;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
          }
          td {
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 14px;
            color: #334155;
          }
          tbody tr:hover {
            background: #fee2e2;
          }
          .footer {
            margin-top: 40px;
            padding-top: 25px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 12px;
          }
          @media print {
            body { background: white; padding: 0; }
            .container { box-shadow: none; padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ðŸ”´ Approbations Admin</h1>
            <div class="meta">
              <span>GÃ©nÃ©rÃ© le ${currentDate.toLocaleString('fr-FR')}</span>
              <span style="font-weight: 600;">Admin: ${currentUser.name || 'N/A'}</span>
            </div>
          </div>

          <div class="alert-box">
            <h3>ðŸ”’ Validation Finale Requise</h3>
            <p>Les commandes suivantes nÃ©cessitent votre validation finale pour complÃ©ter les paiements.</p>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <label>En Attente</label>
              <value>${filteredOrders.length}</value>
            </div>
            <div class="stat-card">
              <label>Montant Total</label>
              <value>${totalAmount.toFixed(2)} DH</value>
            </div>
            <div class="stat-card">
              <label>Moyenne/Commande</label>
              <value>${filteredOrders.length > 0 ? (totalAmount / filteredOrders.length).toFixed(2) : '0.00'} DH</value>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Date Paiement</th>
                <th>Client</th>
                <th>TÃ©lÃ©phone</th>
                <th>Produit</th>
                <th>Livreur</th>
                <th>Montant</th>
              </tr>
            </thead>
            <tbody>
              ${filteredOrders.map(order => {
                const product = products.find(p => p.id === order.productId);
                return `
                  <tr>
                    <td><strong>#${order.id}</strong></td>
                    <td>${new Date(order.paidAt).toLocaleString('fr-FR')}</td>
                    <td>${order.clientName}</td>
                    <td>${order.tel}</td>
                    <td>${product?.nom || 'N/A'}</td>
                    <td><strong>${order.paidBy}</strong></td>
                    <td><strong>${order.prix} DH</strong></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p><strong>Document administratif</strong></p>
            <p>Liste des paiements en attente de validation finale - GÃ©nÃ©rÃ© le ${currentDate.toLocaleString('fr-FR')}</p>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const stats = {
    total: filteredOrders.length,
    totalAmount: filteredOrders.reduce((sum, o) => sum + (parseFloat(o.prix) || 0), 0)
  };

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 lg:p-8">
      <div className="w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <AlertTriangle className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Approbations Paiements
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Validez les paiements marquÃ©s par les livreurs
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
            <div className="bg-orange-50 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="text-orange-600" size={18} />
                <p className="text-xs font-bold text-orange-900 uppercase">En attente</p>
              </div>
              <p className="text-2xl font-extrabold text-orange-600">{stats.total}</p>
            </div>

            <div className="bg-emerald-50 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="text-emerald-600" size={18} />
                <p className="text-xs font-bold text-emerald-900 uppercase">Montant</p>
              </div>
              <p className="text-2xl font-extrabold text-emerald-600">
                {stats.totalAmount.toFixed(2)} DH
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="text-blue-600" size={18} />
                <p className="text-xs font-bold text-blue-900 uppercase">Livreurs</p>
              </div>
              <p className="text-2xl font-extrabold text-blue-600">{livreurs.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="text-slate-600" size={20} />
              <h3 className="font-bold text-slate-800">Filtres</h3>
            </div>
            <button
              onClick={printAdminApprovalsList}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 flex items-center justify-center gap-2 font-bold"
            >
              <FileText size={16} />
              Imprimer Liste
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Date</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Livreur</label>
              <select
                value={filterLivreur}
                onChange={(e) => setFilterLivreur(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              >
                <option value="all">Tous</option>
                {livreurs.map(livreur => (
                  <option key={livreur} value={livreur}>{livreur}</option>
                ))}
              </select>
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
          {(filterDate || filterLivreur !== 'all' || filterProduct !== 'all') && (
            <button
              onClick={() => {
                setFilterDate('');
                setFilterLivreur('all');
                setFilterProduct('all');
              }}
              className="mt-3 text-xs sm:text-sm text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1"
            >
              RÃ©initialiser tous les filtres
            </button>
          )}
        </div>

        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Aucune approbation</h3>
              <p className="text-slate-500">Toutes les commandes ont Ã©tÃ© traitÃ©es</p>
            </div>
          ) : (
            filteredOrders.map(order => {
              const product = products.find(p => p.id === order.productId);
              
              return (
                <div key={order.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 flex items-center justify-between">
                    <span className="text-white font-bold">Commande #{order.id}</span>
                    <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {order.prix} DH
                    </span>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="text-slate-400" size={16} />
                        <div>
                          <p className="text-xs text-slate-500">Client</p>
                          <p className="font-bold">{order.clientName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="text-slate-400" size={16} />
                        <div>
                          <p className="text-xs text-slate-500">TÃ©lÃ©phone</p>
                          <p className="font-mono">{order.tel}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="text-slate-400" size={16} />
                        <div>
                          <p className="text-xs text-slate-500">Produit</p>
                          <p className="font-medium">{product?.nom || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Truck className="text-slate-400" size={16} />
                        <div>
                          <p className="text-xs text-slate-500">Livreur</p>
                          <p className="font-bold text-blue-600">{order.paidBy}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-orange-50 p-3 rounded-lg">
                      <p className="text-xs font-bold text-orange-900 mb-2">Paiement</p>
                      <p className="text-xs text-orange-700">
                        PayÃ© le {new Date(order.paidAt).toLocaleString('fr-FR')}
                      </p>
                    </div>

                    <div className="bg-orange-50 p-3 rounded-lg text-center">
                      <p className="text-orange-700 font-bold">En attente de validation</p>
                      <p className="text-orange-600 text-sm mt-1">Validation dÃ©sactivÃ©e</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
