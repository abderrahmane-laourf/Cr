import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function VerifyIdentity() {
  const navigate = useNavigate();

  const handleVerify = () => {
    // Hna t9dar tcheck OTP valid
    navigate('/NewPassword'); // ← redirect b success
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8f9fc] p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-10 flex flex-col items-center">
        
        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 text-[#1325ec]">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            <line x1="12" y1="15" x2="12" y2="17"></line>
            <circle cx="12" cy="16" r="1"></circle>
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-center text-slate-900 mb-3">Vérifiez votre identité</h1>
        <p className="text-center text-slate-500 text-sm mb-8 leading-relaxed max-w-xs">
          Entrez le code à 6 chiffres que nous avons envoyé à votre login
        </p>

        <div className="flex gap-2 mb-8 w-full justify-center">
          {[...Array(6)].map((_, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              className="w-10 h-12 sm:w-12 sm:h-14 rounded-xl border border-slate-200 bg-slate-50 text-center text-xl font-bold text-slate-800 focus:bg-white focus:border-[#1325ec] focus:ring-2 focus:ring-[#1325ec]/20 focus:outline-none transition-all shadow-sm"
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          className="w-full h-12 bg-[#1325ec] hover:bg-[#1325ec]/90 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 mb-6"
        >
          Vérifier
        </button>

        <p className="text-xs text-slate-400 text-center">
          Vous n'avez pas reçu le code?{' '}
          <a href="/" className="text-[#1325ec] font-bold hover:underline">Renvoyer le code</a>
        </p>
      </div>
    </div>
  );
}
