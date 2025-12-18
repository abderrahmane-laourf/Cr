import React, { useState, useEffect } from 'react';
import { 
  Wallet, Package, DollarSign, CheckCircle, Clock, 
  FileText, Truck, AlertTriangle, TrendingUp, ArrowRight 
} from 'lucide-react';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import SpotlightCard from '../../../util/SpotlightCard';

export default function Portefeuille() {
  const [orders, setOrders] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [adminSettings, setAdminSettings] = useState({});

  // Calculate totals for displayed orders
  const calculateTotals = (orderList) => {
    const deliveredUnpaid = orderList.filter(order => order.status === 'À verser');
    
    const totalCashToPay = deliveredUnpaid.reduce((sum, order) => sum + order.cashCollected, 0);
    const totalEarnings = deliveredUnpaid.reduce((sum, order) => sum + order.commission, 0);
    
    return { totalCashToPay, totalEarnings, count: deliveredUnpaid.length };
  };

  const [totals, setTotals] = useState({ totalCashToPay: 0, totalEarnings: 0, count: 0 });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setTotals(calculateTotals(orders));
  }, [orders]);

  const loadData = () => {
    // Mock current user data
    const user = {
      id: 1,
      name: "Ahmed Benali",
      role: "Livreur",
      location: "Agadir"
    };
    setCurrentUser(user);

    // Mock admin settings for Agadir
    const settings = {
      deliveryZone: "Agadir",
      commissionPerOrder: 25, // Default commission per order in DH
      fallbackCommission: 20
    };
    setAdminSettings(settings);

    // Mock orders data with various statuses
    const mockOrders = [
      // Undelivered orders (En cours de livraison)
      {
        id: "CMD-2025-001",
        clientName: "Karim El Mansouri",
        cashCollected: 150,
        commission: settings.commissionPerOrder,
        status: "En cours de livraison",
        date: "2025-12-10"
      },
      {
        id: "CMD-2025-002",
        clientName: "Fatima Zahraoui",
        cashCollected: 230,
        commission: settings.commissionPerOrder,
        status: "En cours de livraison",
        date: "2025-12-10"
      },
      // Delivered but unpaid orders (À verser) - actionable
      {
        id: "CMD-2025-003",
        clientName: "Youssef Tazi",
        cashCollected: 85,
        commission: settings.commissionPerOrder,
        status: "À verser",
        date: "2025-12-11"
      },
      {
        id: "CMD-2025-004",
        clientName: "Amina Kadiri",
        cashCollected: 320,
        commission: settings.commissionPerOrder,
        status: "À verser",
        date: "2025-12-11"
      },
      {
        id: "CMD-2025-005",
        clientName: "Omar Rifi",
        cashCollected: 175,
        commission: settings.commissionPerOrder,
        status: "À verser",
        date: "2025-12-12"
      },
      // Pending validation orders (En attente)
      {
        id: "CMD-2025-006",
        clientName: "Samira Bouazza",
        cashCollected: 95,
        commission: settings.commissionPerOrder,
        status: "En attente",
        date: "2025-12-11"
      },
      // Settled orders (Terminé)
      {
        id: "CMD-2025-007",
        clientName: "Hassan Kabbaj",
        cashCollected: 210,
        commission: settings.commissionPerOrder,
        status: "Terminé",
        date: "2025-12-10"
      }
    ];

    setOrders(mockOrders);
  };

  const handleSettleAmount = () => {
    // Find orders that are ready to be settled (À verser)
    const ordersToSettle = orders.filter(order => order.status === 'À verser');
    
    if (ordersToSettle.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Aucune commande à verser',
        text: 'Il n\'y a aucune commande prête à être versée.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
      return;
    }

    // Show success toast notification
    Swal.fire({
      icon: 'success',
      title: 'Demande envoyée!',
      text: 'Votre demande a été envoyée au responsable.',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });

    // Update status of "À verser" orders to "En attente"
    const updatedOrders = orders.map(order => 
      order.status === 'À verser' 
        ? { ...order, status: 'En attente' } 
        : order
    );
    
    setOrders(updatedOrders);
  };

  const generateSettlementPDF = () => {
    // Find orders that are currently in "En attente" status (recently settled)
    const settledOrders = orders.filter(order => order.status === 'En attente');
    
    if (settledOrders.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Aucune commande à inclure',
        text: 'Il n\'y a aucune commande récemment versée à inclure dans le PDF.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
      return;
    }

    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString('fr-FR');
    
    // Add company header
    doc.setFontSize(22);
    doc.setTextColor(5, 150, 105);
    doc.text('PETIT BON DE VERSEMENT', 105, 20, null, null, 'center');
    
    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25);
    
    // Driver info section
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Livreur: ${currentUser?.name}`, 20, 35);
    doc.text(`Date: ${currentDate}`, 20, 42);
    doc.text(`Zone: ${adminSettings.deliveryZone}`, 20, 49);
    
    // Table header
    doc.setFontSize(14);
    doc.setTextColor(5, 150, 105);
    doc.text('DÉTAIL DES COMMANDES', 20, 65);
    
    // Table
    autoTable(doc, {
      startY: 70,
      head: [['ID', 'Client', 'Montant (DH)', 'Commission (DH)']],
      body: settledOrders.map(order => [
        order.id,
        order.clientName,
        order.cashCollected.toFixed(2),
        order.commission.toFixed(2)
      ]),
      theme: 'striped',
      styles: { cellPadding: 3, fontSize: 10 },
      headStyles: { fillColor: [5, 150, 105], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 255, 240] }
    });
    
    // Calculate totals
    const totalCashToHandOver = settledOrders.reduce((sum, order) => sum + order.cashCollected, 0);
    const totalDriverEarnings = settledOrders.reduce((sum, order) => sum + order.commission, 0);
    const netAmount = totalCashToHandOver - totalDriverEarnings;
    
    // Summary section
    const finalY = doc.lastAutoTable.finalY + 15;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    // Vertical line separator
    doc.setLineWidth(0.3);
    doc.line(130, finalY - 5, 130, finalY + 35);
    
    // Left column - Totals
    doc.text('TOTALS:', 20, finalY);
    doc.setFontSize(10);
    doc.text(`Montant Collecté: ${totalCashToHandOver.toFixed(2)} DH`, 25, finalY + 7);
    doc.text(`Vos Commissions: ${totalDriverEarnings.toFixed(2)} DH`, 25, finalY + 14);
    
    // Right column - Net amount to hand over
    doc.setFontSize(12);
    doc.setTextColor(5, 150, 105);
    doc.text('À REMETTRE:', 140, finalY);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`${netAmount.toFixed(2)} DH`, 140, finalY + 10);
    
    // Reset font
    doc.setFont(undefined, 'normal');
    
    // Signature section
    const signatureY = finalY + 40;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Signature du livreur:', 20, signatureY);
    doc.line(60, signatureY + 2, 120, signatureY + 2);
    
    doc.text('Signature du responsable:', 130, signatureY);
    doc.line(170, signatureY + 2, 195, signatureY + 2);
    
    // Footer
    const footerY = signatureY + 20;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Document généré électroniquement - ' + new Date().toLocaleString('fr-FR'), 105, footerY, null, null, 'center');
    
    // Save the PDF
    doc.save(`bon-versement-${currentUser?.name.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "En cours de livraison":
        return <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-xs font-bold ring-1 ring-slate-200 dark:ring-slate-700">
          <Truck size={12} />
          En cours
        </span>;
      case "À verser":
        return <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold ring-1 ring-blue-200 dark:ring-blue-800/30">
          <DollarSign size={12} />
          À verser
        </span>;
      case "En attente":
        return <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs font-bold ring-1 ring-orange-200 dark:ring-orange-800/30">
          <Clock size={12} />
          En attente
        </span>;
      case "Terminé":
        return <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold ring-1 ring-emerald-200 dark:ring-emerald-800/30">
          <CheckCircle size={12} />
          Terminé
        </span>;
      default:
        return <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-xs font-bold">
          <AlertTriangle size={12} />
          {status}
        </span>;
    }
  };

  const getOrderRowClass = (status) => {
    if (status === "En cours de livraison") {
      return "opacity-70";
    }
    return "";
  };

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8 font-sans text-slate-800 dark:text-slate-200 pb-24">
      <div className="w-full mx-auto space-y-6">
        
        {/* HEADER */}
        <SpotlightCard className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                <Wallet className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Mon Portefeuille</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Gérez vos versements et commissions</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={generateSettlementPDF}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-bold shadow-sm"
              >
                <FileText size={16} />
                <span>Bon de versement</span>
              </button>
            </div>
          </div>
        </SpotlightCard>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SpotlightCard className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
                À verser
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Montant à remettre</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{totals.totalCashToPay.toFixed(2)} DH</h3>
            </div>
          </SpotlightCard>

          <SpotlightCard className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                Gains
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Mes Commissions</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{totals.totalEarnings.toFixed(2)} DH</h3>
            </div>
          </SpotlightCard>

          <SpotlightCard className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <Package className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-full">
                En attente
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Colis à verser</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{totals.count}</h3>
            </div>
          </SpotlightCard>
        </div>

        {/* ACTION BANNER */}
        {totals.count > 0 && (
          <div className="bg-emerald-900 dark:bg-emerald-950 rounded-2xl p-6 text-white shadow-lg shadow-emerald-900/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                  <DollarSign className="w-6 h-6 text-emerald-300" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Prêt à verser ?</h3>
                  <p className="text-emerald-200 text-sm">Vous avez {totals.count} commandes livrées en attente de versement.</p>
                </div>
              </div>
              <button 
                onClick={handleSettleAmount}
                className="px-6 py-3 bg-white text-emerald-900 rounded-xl font-bold hover:bg-emerald-50 transition-all shadow-lg flex items-center gap-2 group"
              >
                <span>Demander le versement</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* ORDERS LIST */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-800/20">
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Historique des commandes</h3>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {orders.length} commandes
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                  <th className="p-4">Commande</th>
                  <th className="p-4">Client</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Montant</th>
                  <th className="p-4 text-right">Commission</th>
                  <th className="p-4 text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="p-4">
                      <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                        {order.id}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-700 dark:text-slate-200 text-sm">{order.clientName}</div>
                    </td>
                    <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
                      {new Date(order.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="p-4 text-right font-bold text-slate-700 dark:text-slate-200">
                      {order.cashCollected.toFixed(2)} DH
                    </td>
                    <td className="p-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      +{order.commission.toFixed(2)} DH
                    </td>
                    <td className="p-4 text-center">
                      {getStatusBadge(order.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {orders.length === 0 && (
            <div className="p-12 text-center text-slate-400">
              <Package size={48} className="mx-auto mb-4 opacity-50" />
              <p>Aucune commande trouvée</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}