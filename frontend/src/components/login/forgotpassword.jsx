import React from 'react';
import { useNavigate } from 'react-router-dom'; // ← import hook

export default function ForgotPassword() {
  const navigate = useNavigate(); // ← initialize navigate

  const handlverifytocken = () => {
    // logic dyal verification
    navigate('/verify_tocken'); // ← redirect programmatically
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8f9fc] p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-10">
        <h1 className="text-2xl font-bold text-center text-slate-900 mb-3">
          Réinitialiser votre mot de passe
        </h1>
        <p className="text-center text-slate-500 text-sm mb-8 leading-relaxed">
          Entrez  login pour recevoir un code de réinitialisation.
        </p>

        <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-700 ml-1">
                Login
            </label>
            <input
              type="text"
              placeholder="entrer votre login"
              className="w-full h-12 rounded-xl bg-white border border-slate-200 text-slate-900 px-4 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1325ec]/50 focus:border-[#1325ec] transition-all"
            />
          </div>

          <button
            type="button"
            onClick={handlverifytocken} // ← call navigate correctly
            className="w-full h-12 mt-2 bg-[#1325ec] hover:bg-[#1325ec]/90 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95"
          >
            Envoyer le code de réinitialisation
          </button>
        </form>

        <div className="w-full text-center mt-6">
          <a
            href="/"
            className="text-slate-400 text-sm font-medium hover:text-slate-600 underline decoration-slate-300 underline-offset-4 transition-colors"
          >
            Retour à la connexion
          </a>
        </div>
      </div>
    </div>
  );
}
