import React from 'react';
import { Construction, Sparkles, Clock, Rocket } from 'lucide-react';

/**
 * Enhanced Coming Soon component with beautiful design
 */
export default function ComingSoon({ 
  title = "Bientôt Disponible", 
  message = "Cette fonctionnalité est en cours de développement." 
}) {
  return (
    <div className="w-full h-full bg-transparent flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#005461]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#005461]/3 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content Card */}
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200/50 p-12 max-w-2xl w-full backdrop-blur-sm">
        
        {/* Decorative Header Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#005461] via-emerald-500 to-[#005461] rounded-t-3xl"></div>
        
        <div className="flex flex-col items-center text-center space-y-8">
          
          {/* Icon Container with Animation */}
          <div className="relative">
            {/* Outer Glow Ring */}
            <div className="absolute inset-0 bg-[#005461]/10 rounded-3xl blur-2xl scale-110 animate-pulse"></div>
            
            {/* Main Icon Box */}
            <div className="relative w-28 h-28 bg-gradient-to-br from-[#005461] to-[#007a8f] rounded-3xl flex items-center justify-center shadow-xl transform hover:scale-105 transition-transform duration-300">
              <Construction size={56} className="text-white" strokeWidth={1.5} />
              
              {/* Sparkle Decorations */}
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles size={16} className="text-white" />
              </div>
            </div>
          </div>

          {/* Title & Message */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
              {title}
            </h1>
            <p className="text-lg text-slate-600 max-w-md mx-auto leading-relaxed">
              {message}
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full pt-6">
            
            {/* Card 1 */}
            <div className="bg-gradient-to-br from-[#005461]/5 to-transparent rounded-2xl p-6 border border-[#005461]/10 hover:border-[#005461]/30 transition-all duration-300 group">
              <div className="w-12 h-12 bg-[#005461]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#005461]/20 transition-colors">
                <Clock size={24} className="text-[#005461]" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">En Développement</h3>
              <p className="text-sm text-slate-500">Notre équipe travaille activement</p>
            </div>

            {/* Card 2 */}
            <div className="bg-gradient-to-br from-emerald-500/5 to-transparent rounded-2xl p-6 border border-emerald-500/10 hover:border-emerald-500/30 transition-all duration-300 group">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                <Sparkles size={24} className="text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Nouveautés</h3>
              <p className="text-sm text-slate-500">Fonctionnalités innovantes</p>
            </div>

            {/* Card 3 */}
            <div className="bg-gradient-to-br from-blue-500/5 to-transparent rounded-2xl p-6 border border-blue-500/10 hover:border-blue-500/30 transition-all duration-300 group">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                <Rocket size={24} className="text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Bientôt Prêt</h3>
              <p className="text-sm text-slate-500">Lancement imminent</p>
            </div>
            
          </div>

          {/* Loading Bar Animation */}
          <div className="w-full max-w-md pt-4">
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#005461] to-emerald-500 rounded-full animate-progress"></div>
            </div>
            <p className="text-xs text-slate-400 mt-2">Progression en cours...</p>
          </div>

        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes progress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        
        .animate-progress {
          animation: progress 3s ease-in-out infinite;
        }
        
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}