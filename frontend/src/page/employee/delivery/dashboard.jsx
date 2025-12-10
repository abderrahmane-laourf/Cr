import React, { useState, useEffect } from 'react';
import { 
  Truck, Package, MapPin, Navigation, Phone, CheckCircle, 
  XCircle, Clock, Calendar, DollarSign, ChevronRight 
} from 'lucide-react';
import { employeeAPI } from '../../../services/api';

const StatCard = ({ title, value, icon: Icon, color, subValue }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
    <div>
      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-2xl font-extrabold text-slate-800">{value}</h3>
      {subValue && <p className="text-xs text-slate-400 mt-1 font-medium">{subValue}</p>}
    </div>
    <div className={`p-3 rounded-xl ${color} text-white shadow-md`}>
      <Icon size={24} />
    </div>
  </div>
);

export default function DeliveryDashboard() {
  const [stats, setStats] = useState({
    delivered: 12,
    pending: 8,
    returned: 2,
    cash: 1450,
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Header Mobile-First */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-extrabold text-slate-900">Bonjour, Livreur 👋</h1>
        <p className="text-slate-500 font-medium">Prêt pour la tournée d'aujourd'hui ?</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard 
          title="Livrés" 
          value={stats.delivered} 
          icon={CheckCircle} 
          color="bg-emerald-500" 
          subValue="Sur 22 colis"
        />
        <StatCard 
          title="En attente" 
          value={stats.pending} 
          icon={Clock} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Cash (DH)" 
          value={`${stats.cash} DH`} 
          icon={DollarSign} 
          color="bg-slate-800"
        />
        <StatCard 
          title="Retours" 
          value={stats.returned} 
          icon={XCircle} 
          color="bg-red-500" 
        />
      </div>

      {/* Action Button */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-2">Démarrer la tournée</h2>
          <p className="text-blue-100 text-sm mb-4">Il vous reste {stats.pending} colis à livrer dans la zone Agadir Centre.</p>
          <button className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold text-sm shadow-sm active:scale-95 transition-transform flex items-center gap-2">
            <Navigation size={18} />
            Lancer le GPS
          </button>
        </div>
        <MapPin className="absolute -right-4 -bottom-4 text-white opacity-10 w-32 h-32 rotate-12" />
      </div>

      {/* Recent Activity / Next Stop */}
      <div>
        <h3 className="font-bold text-slate-800 mb-4 text-lg">Prochain Arrêt</h3>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg">
                1
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-slate-800">Mme. Fatima Zahra</h4>
                <p className="text-sm text-slate-500">Quartier Talborjt, Rue 12</p>
                <div className="flex gap-2 mt-2">
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">250 DH</span>
                    <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold">COD</span>
                </div>
            </div>
            <a href="tel:+212600000000" className="p-3 bg-emerald-50 text-emerald-600 rounded-full hover:bg-emerald-100">
                <Phone size={20} />
            </a>
        </div>
      </div>
    </div>
  );
}
