import React from 'react';
import { Construction } from 'lucide-react';

/**
 * Simple Coming Soon component for undeveloped pages
 */
export default function ComingSoon({ title = "Bientôt Disponible", message = "Cette fonctionnalité est en cours de développement." }) {
  return (
    <div className="min-h-screen bg-slate-50/50 p-8 font-sans text-slate-800 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 max-w-md w-full">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Icon */}
          <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center">
            <Construction size={40} className="text-blue-600" />
          </div>

          {/* Title & Message */}
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              {title}
            </h1>
            <p className="text-slate-500">
              {message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
