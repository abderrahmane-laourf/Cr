import React, { useState, useEffect } from 'react';
import { Users, CreditCard, UserCheck, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { employeeAPI, paymentAPI, presenceAPI } from '../../services/api';

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    totalPayments: 0,
    pendingPresence: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Fetch employees
      const employees = await employeeAPI.getAll();
      
      // Fetch payments
      const payments = await paymentAPI.getAll();
      
      // Fetch presence
      const presence = await presenceAPI.getAll();

      setStats({
        totalEmployees: employees.length,
        activeEmployees: employees.filter(e => e.active).length,
        totalPayments: payments.reduce((sum, p) => sum + p.net, 0),
        pendingPresence: presence.length
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const cards = [
    {
      title: 'Total Employés',
      value: stats.totalEmployees,
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      path: '/admin/employees'
    },
    {
      title: 'Employés Actifs',
      value: stats.activeEmployees,
      icon: UserCheck,
      color: 'emerald',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      path: '/admin/employees'
    },
    {
      title: 'Paiements Total',
      value: `${Math.round(stats.totalPayments).toLocaleString()} MAD`,
      icon: DollarSign,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      path: '/admin/paiement'
    },
    {
      title: 'Ajustements Présence',
      value: stats.pendingPresence,
      icon: Calendar,
      color: 'orange',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      path: '/admin/presence'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 p-8 font-sans text-slate-800">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Dashboard - Gestion des Employés
        </h1>
        <p className="text-slate-500 mt-1 font-medium">
          Vue d'ensemble de votre équipe et des paiements
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              onClick={() => navigate(card.path)}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${card.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className={card.iconColor} size={24} />
                </div>
                <TrendingUp className="text-slate-300 group-hover:text-emerald-500 transition-colors" size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
                {card.title}
              </h3>
              <p className="text-3xl font-black text-slate-800">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Actions Rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/admin/employees')}
            className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <Users className="text-slate-400 group-hover:text-blue-600" size={24} />
            <div className="text-left">
              <h3 className="font-bold text-slate-800">Gérer Employés</h3>
              <p className="text-xs text-slate-500">Voir la liste complète</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/admin/paiement')}
            className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 hover:border-purple-500 hover:bg-purple-50 transition-all group"
          >
            <CreditCard className="text-slate-400 group-hover:text-purple-600" size={24} />
            <div className="text-left">
              <h3 className="font-bold text-slate-800">Nouveau Paiement</h3>
              <p className="text-xs text-slate-500">Enregistrer un paiement</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/admin/presence')}
            className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 hover:border-orange-500 hover:bg-orange-50 transition-all group"
          >
            <UserCheck className="text-slate-400 group-hover:text-orange-600" size={24} />
            <div className="text-left">
              <h3 className="font-bold text-slate-800">Ajuster Présence</h3>
              <p className="text-xs text-slate-500">Gérer les ajustements</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
