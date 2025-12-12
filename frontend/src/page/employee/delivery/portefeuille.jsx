import React, { useState, useEffect } from 'react';
import { Wallet, Package, DollarSign, CheckCircle, Clock, FileText, Truck, AlertTriangle } from 'lucide-react';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
        return <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">
          <Truck size={12} />
          En cours
        </span>;
      case "À verser":
        return <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
          <DollarSign size={12} />
          À verser
        </span>;
      case "En attente":
        return <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
          <Clock size={12} />
          En attente
        </span>;
      case "Terminé":
        return <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
          <CheckCircle size={12} />
          Terminé
        </span>;
      default:
        return <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">
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
    <div className="min-h-screen bg-slate-50 pb-24 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-2 pt-6">
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
          <Wallet className="text-emerald-600" size={28} />
          Portefeuille Livreur
        </h1>
        <p className="text-base text-slate-600 font-medium">
          Gérez vos collectes et commissions
        </p>
      </div>

      {/* Orders Table */}
      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Package className="text-slate-600" size={20} />
            Toutes les Commandes
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Liste complète de vos commandes avec leur statut financier
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="w-16 h-16 mx-auto text-slate-300" />
            <h3 className="text-lg font-medium text-slate-900 mt-4">Aucune commande</h3>
            <p className="text-slate-500 mt-1">Vous n'avez pas encore de commandes assignées</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">ID Commande</th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Client</th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Montant Collecté</th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Commission</th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {orders.map((order, index) => (
                  <tr key={index} className={`${getOrderRowClass(order.status)} hover:bg-slate-50/80 transition-colors duration-150`}>
                    <td className="py-4 px-6">
                      <span className="font-mono text-sm font-bold text-slate-900">#{order.id}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-slate-900">{order.clientName}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{order.cashCollected.toFixed(2)} DH</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-emerald-600">{order.commission.toFixed(2)} DH</div>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(order.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sticky Bottom Summary Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="text-center sm:text-left">
                <p className="text-sm text-slate-600">Total à verser</p>
                <p className="text-xl font-bold text-slate-900">{totals.totalCashToPay.toFixed(2)} DH</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-sm text-slate-600">Vos commissions</p>
                <p className="text-xl font-bold text-emerald-600">{totals.totalEarnings.toFixed(2)} DH</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-sm text-slate-600">Commandes concernées</p>
                <p className="text-xl font-bold text-blue-600">{totals.count}</p>
              </div>
            </div>
            
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={generateSettlementPDF}
                className="flex-1 sm:flex-none px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <FileText size={20} />
                <span className="hidden sm:inline">Bon de versement</span>
                <span className="sm:hidden">Bon</span>
              </button>
              
              <button
                onClick={handleSettleAmount}
                disabled={totals.count === 0}
                className={`flex-1 sm:flex-none px-4 py-3 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors ${
                  totals.count === 0
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                }`}
              >
                <DollarSign size={20} />
                <span className="hidden sm:inline">Verser le montant</span>
                <span className="sm:hidden">Verser</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}