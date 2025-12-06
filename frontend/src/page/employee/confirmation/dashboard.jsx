import React from 'react';
import { LayoutDashboard } from 'lucide-react';

export default function ConfirmationDashboard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
      <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4">
        <LayoutDashboard size={32} />
      </div>
      <h2 className="text-xl font-bold text-slate-800">Tableau de Bord Confirmation</h2>
      <p className="text-slate-500 max-w-sm mt-2">
        Cette fonctionnalité est en cours de développement. Bientôt disponible !
      </p>
    </div>
  );
}
