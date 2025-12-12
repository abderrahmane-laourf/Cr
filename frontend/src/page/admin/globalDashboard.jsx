import React, { useState, useEffect } from 'react';
import {
  DollarSign, TrendingUp, TrendingDown, Package, Users, ShoppingCart,
  MessageCircle, CheckCircle, Truck, RefreshCw, AlertCircle, Award,
  BarChart3, Activity, Megaphone, Box, CreditCard, ArrowUp, ArrowDown
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend, LabelList
} from 'recharts';
import { productAPI, employeeAPI, adsAPI } from '../../services/api';

const GlobalDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateDashboardData();
  }, []);

  const generateDashboardData = async () => {
    setLoading(true);
    
    try {
      // 1. Récupération des données brutes
      const colisData = JSON.parse(localStorage.getItem('colis') || '[]');
      const productsData = await productAPI.getAll() || [];
      const employeesData = await employeeAPI.getAll() || [];
      // const adsData = await adsAPI.getAll() || []; // Ancienne source (Optional: keep if needed for other metrics)
      
      // NOUVEAU : Récupération depuis le module "Sold" (Gestionnaire Dollar)
      const soldData = JSON.parse(localStorage.getItem('usd_trans_final') || '[]');

      // 2. Calculs Marketing (Ads) basés sur "Sold"
      const adSpend = soldData.reduce((sum, t) => sum + (parseFloat(t.mad || 0)), 0);
      const totalMessages = 0; // Donnée non présente dans "Sold", à voir si on la garde ou on la retire
      const costPerMessage = 0; // Non calculable sans messages
      
      // 3. Calculs Pipeline (Colis)
      const totalLeads = colisData.length;
      const confirmedCols = colisData.filter(c => ['Confirmé', 'Expédié', 'En livraison', 'Livré'].includes(c.stage));
      const confirmedCount = confirmedCols.length;
      
      const deliveredCols = colisData.filter(c => c.stage === 'Livré');
      const deliveredCount = deliveredCols.length;
      
      const confRate = totalLeads > 0 ? (confirmedCount / totalLeads) * 100 : 0;
      const delRate = confirmedCount > 0 ? (deliveredCount / confirmedCount) * 100 : 0;
      
      // Calcul CPA / CPL avec le nouveau adSpend
      const cpa = confirmedCount > 0 ? adSpend / confirmedCount : 0;
      const cpl = deliveredCount > 0 ? adSpend / deliveredCount : 0;
      
      // 4. Calculs Stock & Produits
      const initialStock = productsData.reduce((sum, p) => sum + (parseInt(p.initialStock || 0)), 0); 
      const currentStock = productsData.reduce((sum, p) => sum + (parseInt(p.stock || 0)), 0);
      const stockFix = currentStock + deliveredCount; 
      const stockRest = currentStock;
      
      const returnsCount = colisData.filter(c => ['Retourné', 'Annulé', 'Échec livraison'].includes(c.stage)).length;
      const pendingCount = colisData.filter(c => ['En attente', 'Reporter', 'Packaging'].includes(c.stage)).length;
      
      // 5. Calculs Livraison & Revenus
      const revenue = deliveredCols.reduce((sum, c) => sum + (parseFloat(c.prix || 0)), 0);
      const totalPieces = deliveredCols.reduce((sum, c) => sum + (parseInt(c.nbPiece || 1)), 0);
      const avgParcelPrice = deliveredCount > 0 ? revenue / deliveredCount : 0;
      const avgPiecePrice = totalPieces > 0 ? revenue / totalPieces : 0;
      const avgCart = avgParcelPrice; 
      
      // 6. Recharges (Si disponible dans une collection 'recharges')
      // NOTE: Le module "Sold" gère aussi les achats de solde (USD). 
      // On peut agréger ici le total USD acheté si "Sold" sert à ça.
      // D'après sold.jsx, c'est "Dépensé en Ads", donc adSpend ci-dessus est correct.
      // On garde recharges séparé si c'est des entrées de fond, ou on l'ignore si c'est couvert par adSpend.
      const rechargesData = JSON.parse(localStorage.getItem('recharges') || '[]');
      const rechUSD = rechargesData.reduce((sum, r) => sum + (parseFloat(r.amountUSD || 0)), 0);
      const exchRate = 10.5; // Taux fixe ou config
      const rechDH = rechUSD * exchRate; 
      const rechCount = rechargesData.length;
      
      // 7. Financier
      const salaries = employeesData.reduce((sum, e) => sum + (parseFloat(e.salary || 0)), 0);
      const commissions = confirmedCols.reduce((sum, c) => sum + (parseFloat(c.commission || 0)), 0); 
      const fixedCosts = 5000; 
      const stockCost = 0; 
      
      const netProfit = revenue - salaries - commissions - adSpend - rechDH - fixedCosts - stockCost;
      
      // 8. Aggregation par Produit
      const productStats = {};
      colisData.forEach(c => {
        if (!c.productId) return;
        if (!productStats[c.productId]) {
          const p = productsData.find(prod => prod.id == c.productId);
          productStats[c.productId] = { 
            name: p ? p.nom : 'Inconnu', 
            sales: 0, 
            revenue: 0, 
            confirmed: 0, 
            delivered: 0, 
            total: 0 
          };
        }
        const stats = productStats[c.productId];
        stats.total++;
        if (['Confirmé', 'Livré', 'Expédié'].includes(c.stage)) stats.confirmed++;
        if (c.stage === 'Livré') {
          stats.delivered++;
          stats.sales++;
          stats.revenue += parseFloat(c.prix || 0);
        }
      });
      
      const productsList = Object.values(productStats).map(p => ({
        ...p,
        confRate: p.total > 0 ? (p.confirmed / p.total) * 100 : 0,
        delRate: p.confirmed > 0 ? (p.delivered / p.confirmed) * 100 : 0
      }));
      
      if (productsList.length === 0) productsList.push({ name: 'Aucun', sales: 0, revenue: 0, confRate: 0, delRate: 0 });

      // 9. Aggregation par Employé
      const employeeStats = {};
      colisData.forEach(c => {
        const empName = c.employee || 'Inconnu';
        if (!employeeStats[empName]) {
            employeeStats[empName] = { name: empName, sales: 0, confirmed: 0, delivered: 0, total: 0, parcels: 0 };
        }
        const stats = employeeStats[empName];
        stats.total++;
        if (['Confirmé', 'Livré', 'Expédié'].includes(c.stage)) stats.confirmed++;
        if (c.stage === 'Livré') {
            stats.delivered++;
            stats.sales++; 
        }
        if (['Confirmé', 'Livré', 'Expédié', 'En livraison'].includes(c.stage)) stats.parcels++;
      });
      
      const employeesList = Object.values(employeeStats).map(e => ({
        ...e,
        confRate: e.total > 0 ? (e.confirmed / e.total) * 100 : 0,
        delRate: e.confirmed > 0 ? (e.delivered / e.confirmed) * 100 : 0
      }));
        
      if (employeesList.length === 0) employeesList.push({ name: 'Aucun', sales: 0, confRate: 0, delRate: 0, parcels: 0 });

      setData({
        marketing: { adSpend, totalMessages, costPerMessage, cpa, cpl },
        confirmation: { confirmed: confirmedCount, totalLeads, confRate, delivered: deliveredCount, delRate },
        stock: { stockFix, stockRest, delivered: deliveredCount, returns: returnsCount, pending: pendingCount, avgSend: 0, avgRet: 0 },
        delivery: { totalParcels: deliveredCount, totalPieces, avgParcelPrice, avgPiecePrice, avgCart, revenue },
        recharge: { rechUSD, exchRate, rechDH, rechCount },
        financial: { revenue, salaries, commissions, adSpend, rechDH, fixedCosts, stockCost, netProfit },
        logistics: { parcelsSent: confirmedCount, parcelsDelivered: deliveredCount, rate: delRate },
        products: productsList,
        employees: employeesList
      });
      
    } catch (error) {
        console.error("Erreur calcul dashboard:", error);
    } finally {
        setLoading(false);
    }
  };

  const fmt = (n) => parseFloat(n).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const num = (n) => parseInt(n).toLocaleString('fr-FR');

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-600 border-t-transparent mx-auto mb-4 shadow-lg"></div>
          <p className="text-slate-700 font-semibold text-lg">Chargement des données...</p>
        </div>
      </div>
    );
  }

  const topProduct = [...data.products].sort((a, b) => b.sales - a.sales)[0];
  const flopProduct = [...data.products].sort((a, b) => a.sales - b.sales)[0];
  const topEmployee = [...data.employees].sort((a, b) => b.sales - a.sales)[0];
  const flopEmployee = [...data.employees].sort((a, b) => a.sales - b.sales)[0];

  const chartDataLogistics = [
    { name: 'Livré', value: data.logistics.parcelsDelivered, fill: '#10b981' },
    { name: 'Retourné', value: data.stock.returns, fill: '#ef4444' },
    { name: 'En cours', value: Math.max(0, data.logistics.parcelsSent - data.logistics.parcelsDelivered), fill: '#3b82f6' }
  ];

  const chartDataFinancial = [
    { name: 'Salaires', value: data.financial.salaries },
    { name: 'Marketing', value: data.financial.adSpend },
    { name: 'Logistique', value: data.financial.rechDH },
    { name: 'Autres', value: data.financial.commissions + data.financial.fixedCosts + data.financial.stockCost }
  ].filter(item => item.value > 0);

  const COLORS_FIN = ['#8b5cf6', '#f59e0b', '#ef4444', '#64748b'];

  return (
    <div className="w-full min-h-screen bg-slate-50 animate-[fade-in_0.6s_ease-out]">
      {/* Header */}
      <div className="bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border-b border-slate-100 sticky top-0 z-10">
        <div className="w-full px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-xl shadow-md shadow-blue-500/20">
                <Activity className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Tableau de Bord Global
                </h1>
                <p className="text-sm text-slate-600 mt-1">Analyses complètes de l'activité en temps réel</p>
              </div>
            </div>
            <button 
              onClick={generateDashboardData}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:scale-95 flex items-center gap-2 shadow-md shadow-blue-500/20"
            >
              <RefreshCw size={20} />
              Actualiser
            </button>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 py-8 space-y-8">
        
        {/* 1. Marketing Section */}
        <Section title="📢 Marketing" subtitle="Analyses Marketing">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <KPICard 
              label="Dépenses Marketing" 
              value={`${fmt(data.marketing.adSpend)} DH`}
              color="blue"
              icon={<Megaphone size={20} />}
            />
            <KPICard 
              label="Messages Envoyés" 
              value={num(data.marketing.totalMessages)}
              color="blue"
              icon={<MessageCircle size={20} />}
            />
            <KPICard 
              label="Coût par Message" 
              value={`${fmt(data.marketing.costPerMessage)} DH`}
              color="purple"
            />
            <KPICard 
              label="Coût par Acquisition (CPA)" 
              value={`${fmt(data.marketing.cpa)} DH`}
              color="purple"
            />
            <KPICard 
              label="Coût par Livraison (CPL)" 
              value={`${fmt(data.marketing.cpl)} DH`}
              color="purple"
            />
          </div>
        </Section>

        {/* 2. Confirmation Section */}
        <Section title="✅ Confirmation" subtitle="Suivi des Confirmations">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard 
              label="Commandes Confirmées" 
              value={num(data.confirmation.confirmed)}
              color="green"
              icon={<CheckCircle size={20} />}
            />
            <KPICard 
              label="Taux de Confirmation" 
              value={`${fmt(data.confirmation.confRate)}%`}
              color="green"
              trend="up"
            />
            <KPICard 
              label="Commandes Livrées" 
              value={num(data.confirmation.delivered)}
              color="green"
              icon={<Truck size={20} />}
            />
            <KPICard 
              label="Taux de Livraison" 
              value={`${fmt(data.confirmation.delRate)}%`}
              color="green"
              trend="up"
            />
          </div>
        </Section>

        {/* 3. Stock Section */}
        <Section title="📦 Stock" subtitle="Gestion des Stocks">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <KPICard 
              label="Stock Total" 
              value={num(data.stock.stockFix)}
              color="orange"
              icon={<Box size={20} />}
            />
            <KPICard 
              label="Stock Restant" 
              value={num(data.stock.stockRest)}
              color="orange"
            />
            <KPICard 
              label="Total Livré" 
              value={num(data.stock.delivered)}
              color="green"
            />
            <KPICard 
              label="Retours" 
              value={num(data.stock.returns)}
              color="red"
              trend="down"
            />
            <KPICard 
              label="En Traitement" 
              value={num(data.stock.pending)}
              color="blue"
            />
            <KPICard 
              label="Moyenne Envoi/Jour" 
              value={num(data.stock.avgSend)}
              color="blue"
            />
          </div>
        </Section>

        {/* 4. Delivery Section */}
        <Section title="🚚 Livraison" subtitle="Métriques de Livraison">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <KPICard 
              label="Colis Livrés" 
              value={num(data.delivery.totalParcels)}
              color="green"
            />
            <KPICard 
              label="Pièces Livrées" 
              value={num(data.delivery.totalPieces)}
              color="green"
            />
            <KPICard 
              label="Prix Moyen Colis" 
              value={`${fmt(data.delivery.avgParcelPrice)} DH`}
              color="blue"
            />
            <KPICard 
              label="Prix Moyen Pièce" 
              value={`${fmt(data.delivery.avgPiecePrice)} DH`}
              color="blue"
            />
            <KPICard 
              label="Panier Moyen" 
              value={`${fmt(data.delivery.avgCart)} DH`}
              color="purple"
            />
            <KPICard 
              label="Chiffre d'Affaires" 
              value={`${fmt(data.delivery.revenue)} DH`}
              color="green"
              icon={<DollarSign size={20} />}
            />
          </div>
        </Section>

        {/* 5. Recharge Section */}
        <Section title="💳 Recharges & Frais" subtitle="Recharges & Expédition">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <KPICard 
              label="Achat Solde ($)" 
              value={`${fmt(data.recharge.rechUSD)} $`}
              color="red"
              icon={<CreditCard size={20} />}
            />
            <KPICard 
              label="Taux de Change" 
              value={fmt(data.recharge.exchRate)}
              color="orange"
            />
            <KPICard 
              label="Achat Solde (DH)" 
              value={`${fmt(data.recharge.rechDH)} DH`}
              color="red"
            />
            <KPICard 
              label="Nombre de Recharges" 
              value={num(data.recharge.rechCount)}
              color="blue"
            />
            <KPICard 
              label="Total Recharges" 
              value={`${fmt(data.recharge.rechDH)} DH`}
              color="red"
            />
          </div>
        </Section>

        {/* 6. Top vs Flop Section */}
        <Section title="🏆 Performance" subtitle="Analyse des Performances">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <TopFlopCard 
              title="Produit (Ventes)"
              topName={topProduct.name}
              topValue={num(topProduct.sales)}
              flopName={flopProduct.name}
              flopValue={num(flopProduct.sales)}
            />
            <TopFlopCard 
              title="Produit (Revenus)"
              topName={topProduct.name}
              topValue={`${fmt(topProduct.revenue)} DH`}
              flopName={flopProduct.name}
              flopValue={`${fmt(flopProduct.revenue)} DH`}
            />
            <TopFlopCard 
              title="Produit (Taux Conf.)"
              topName={[...data.products].sort((a, b) => b.confRate - a.confRate)[0].name}
              topValue={`${fmt([...data.products].sort((a, b) => b.confRate - a.confRate)[0].confRate)}%`}
              flopName={[...data.products].sort((a, b) => a.confRate - b.confRate)[0].name}
              flopValue={`${fmt([...data.products].sort((a, b) => a.confRate - b.confRate)[0].confRate)}%`}
            />
            <TopFlopCard 
              title="Produit (Taux Livr.)"
              topName={[...data.products].sort((a, b) => b.delRate - a.delRate)[0].name}
              topValue={`${fmt([...data.products].sort((a, b) => b.delRate - a.delRate)[0].delRate)}%`}
              flopName={[...data.products].sort((a, b) => a.delRate - b.delRate)[0].name}
              flopValue={`${fmt([...data.products].sort((a, b) => a.delRate - b.delRate)[0].delRate)}%`}
            />
            <TopFlopCard 
              title="Employé (Ventes)"
              topName={topEmployee.name}
              topValue={num(topEmployee.sales)}
              flopName={flopEmployee.name}
              flopValue={num(flopEmployee.sales)}
            />
            <TopFlopCard 
              title="Employé (Taux Conf.)"
              topName={[...data.employees].sort((a, b) => b.confRate - a.confRate)[0].name}
              topValue={`${fmt([...data.employees].sort((a, b) => b.confRate - a.confRate)[0].confRate)}%`}
              flopName={[...data.employees].sort((a, b) => a.confRate - b.confRate)[0].name}
              flopValue={`${fmt([...data.employees].sort((a, b) => a.confRate - b.confRate)[0].confRate)}%`}
            />
            <TopFlopCard 
              title="Employé (Taux Livr.)"
              topName={[...data.employees].sort((a, b) => b.delRate - a.delRate)[0].name}
              topValue={`${fmt([...data.employees].sort((a, b) => b.delRate - a.delRate)[0].delRate)}%`}
              flopName={[...data.employees].sort((a, b) => a.delRate - b.delRate)[0].name}
              flopValue={`${fmt([...data.employees].sort((a, b) => a.delRate - b.delRate)[0].delRate)}%`}
            />
            <TopFlopCard 
              title="Employé (Colis)"
              topName={[...data.employees].sort((a, b) => b.parcels - a.parcels)[0].name}
              topValue={num([...data.employees].sort((a, b) => b.parcels - a.parcels)[0].parcels)}
              flopName={[...data.employees].sort((a, b) => a.parcels - b.parcels)[0].name}
              flopValue={num([...data.employees].sort((a, b) => a.parcels - b.parcels)[0].parcels)}
            />
          </div>
        </Section>

        {/* 7. Final Calculation */}
        <Section title="🧮 Bilan & Logistique" subtitle="Performance Financière et Opérationnelle">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Financial Block */}
            <div className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 p-6 flex flex-col hover:shadow-lg transition-all duration-200">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3 pb-3 border-b-2 border-slate-100">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <BarChart3 size={20} className="text-blue-600" />
                </div>
                Détails Financiers
              </h3>
              
              <div className="flex flex-col xl:flex-row gap-6 h-full">
                {/* Table */}
                <div className="flex-1 space-y-3">
                  <div className="space-y-1">
                    <FinancialRow label="Chiffre d'Affaires" value={`${fmt(data.financial.revenue)} DH`} type="plus" />
                  </div>
                  <div className="space-y-1 bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">Dépenses</p>
                    <FinancialRow label="Salaires" value={`${fmt(data.financial.salaries)} DH`} type="minus" />
                    <FinancialRow label="Marketing" value={`${fmt(data.financial.adSpend)} DH`} type="minus" />
                    <FinancialRow label="Logistique" value={`${fmt(data.financial.rechDH)} DH`} type="minus" />
                    <FinancialRow label="Autres Frais" value={`${fmt(data.financial.fixedCosts + data.financial.commissions)} DH`} type="minus" />
                  </div>
                  <div className="pt-3 mt-auto border-t-2 border-gray-100">
                    <FinancialRow 
                      label="Bénéfice Net" 
                      value={`${fmt(data.financial.netProfit)} DH`} 
                      type={data.financial.netProfit >= 0 ? 'profit' : 'loss'}
                      isTotal
                    />
                  </div>
                </div>

                {/* Donut Chart */}
                <div className="w-full xl:w-1/2 min-h-[220px] flex items-center justify-center relative">
                   <ResponsiveContainer width="100%" height={220}>
                     <PieChart>
                       <Pie
                         data={chartDataFinancial}
                         cx="50%"
                         cy="50%"
                         innerRadius={50}
                         outerRadius={70}
                         paddingAngle={5}
                         dataKey="value"
                       >
                         {chartDataFinancial.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS_FIN[index % COLORS_FIN.length]} />
                         ))}
                       </Pie>
                       <Tooltip formatter={(val) => `${fmt(val)} DH`} />
                       <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '11px'}} />
                     </PieChart>
                   </ResponsiveContainer>
                   {chartDataFinancial.length === 0 && <p className="absolute text-xs text-gray-400">Aucune donnée</p>}
                </div>
              </div>
            </div>

            {/* Logistics Block */}
            <div className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 p-6 flex flex-col hover:shadow-lg transition-all duration-200">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3 pb-3 border-b-2 border-slate-100">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <Activity size={20} className="text-emerald-600" />
                </div>
                Performance Logistique
              </h3>

              <div className="grid grid-cols-3 gap-4 mb-6">
                 <div className="p-4 bg-blue-50 rounded-xl text-center">
                    <div className="text-2xl font-bold text-blue-700">{num(data.logistics.parcelsSent)}</div>
                    <div className="text-xs font-bold text-blue-400 uppercase mt-1">Total Actif</div>
                 </div>
                 <div className="p-4 bg-green-50 rounded-xl text-center">
                    <div className="text-2xl font-bold text-green-700">{num(data.logistics.parcelsDelivered)}</div>
                    <div className="text-xs font-bold text-green-400 uppercase mt-1">Livrés</div>
                 </div>
                 <div className="p-4 bg-purple-50 rounded-xl text-center">
                    <div className="text-2xl font-bold text-purple-700">{fmt(data.logistics.rate)}%</div>
                    <div className="text-xs font-bold text-purple-400 uppercase mt-1">Taux</div>
                 </div>
              </div>

              <div className="flex-1 min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartDataLogistics} layout="vertical" margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" tick={{fontSize: 12, fontWeight: 500}} width={70} />
                    <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24} animationDuration={1000}>
                       <LabelList dataKey="value" position="right" fontSize={12} fontWeight="bold" formatter={(val) => num(val)} />
                       {chartDataLogistics.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.fill} />
                       ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </Section>
      </div>
    </div>
  );
};

// Section Component
const Section = ({ title, subtitle, children }) => (
  <div className="space-y-5">
    <div className="bg-white rounded-xl p-5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
          {title}
        </h2>
        <p className="text-sm text-slate-600 mt-1">{subtitle}</p>
      </div>
    </div>
    <div>{children}</div>
  </div>
);

// KPI Card Component
const KPICard = ({ label, value, color, icon, trend }) => {
  const gradients = {
    blue: 'from-blue-500 to-indigo-500',
    purple: 'from-purple-500 to-pink-500',
    green: 'from-emerald-500 to-teal-500',
    orange: 'from-orange-500 to-amber-500',
    red: 'from-red-500 to-rose-500'
  };

  const bgColors = {
    blue: 'bg-blue-50',
    purple: 'bg-purple-50',
    green: 'bg-emerald-50',
    orange: 'bg-orange-50',
    red: 'bg-red-50'
  };

  const iconColors = {
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    green: 'text-emerald-600',
    orange: 'text-orange-600',
    red: 'text-red-600'
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 relative overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradients[color]}`}></div>
      <div className="flex items-start justify-between mb-3">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</div>
        {icon && (
          <div className={`p-2 ${bgColors[color]} rounded-lg`}>
            <div className={iconColors[color]}>{icon}</div>
          </div>
        )}
        {trend === 'up' && <ArrowUp size={18} className="text-emerald-600" />}
        {trend === 'down' && <ArrowDown size={18} className="text-red-600" />}
      </div>
      <div className="text-3xl font-black text-slate-900">{value}</div>
    </div>
  );
};

// Top vs Flop Card Component
const TopFlopCard = ({ title, topName, topValue, flopName, flopValue }) => (
  <div className="bg-white rounded-xl p-5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 hover:shadow-lg transition-all duration-200">
    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">{title}</div>
    <div className="grid grid-cols-2 gap-3">
      {/* Top */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-4">
        <div className="text-xs font-bold px-3 py-1.5 bg-emerald-600 text-white rounded-lg mb-3 inline-block shadow-md">
          🏆 Top
        </div>
        <div className="text-xs font-semibold text-slate-700 truncate mb-2">{topName || '--'}</div>
        <div className="text-lg font-black text-emerald-700">{topValue}</div>
      </div>
      
      {/* Flop */}
      <div className="bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 rounded-xl p-4">
        <div className="text-xs font-bold px-3 py-1.5 bg-red-600 text-white rounded-lg mb-3 inline-block shadow-md">
          📉 Flop
        </div>
        <div className="text-xs font-semibold text-slate-700 truncate mb-2">{flopName || '--'}</div>
        <div className="text-lg font-black text-red-700">{flopValue}</div>
      </div>
    </div>
  </div>
);

// Financial Row Component
const FinancialRow = ({ label, value, type, isTotal }) => {
  const getColor = () => {
    if (type === 'plus') return 'text-green-600';
    if (type === 'minus') return 'text-red-600';
    if (type === 'profit') return 'text-green-600';
    if (type === 'loss') return 'text-red-600';
    return 'text-gray-700';
  };

  return (
    <div className={`flex items-center justify-between py-2 ${isTotal ? 'font-bold' : ''}`}>
      <span className={`${isTotal ? 'text-lg text-gray-900' : 'text-sm text-gray-600'}`}>
        {label}
      </span>
      <span className={`${isTotal ? 'text-xl' : 'text-sm font-medium'} ${getColor()}`}>
        {value}
      </span>
    </div>
  );
};

export default GlobalDashboard;