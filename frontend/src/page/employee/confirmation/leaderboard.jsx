import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Minus, Snowflake, Crown, ChevronLeft, ChevronRight, Calendar, Target, Gift, Star, Timer, Zap, ArrowRight, Wallet, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- MOCK DATA ---
const PERFORMERS = [
  { id: 1, name: 'Fatima Zahra', role: 'Sales Manager', points: 150, avatar: 'https://i.pravatar.cc/150?u=1', status: 'stable' },
  { id: 2, name: 'Salma Idrissi', role: 'Sales', points: 132, avatar: 'https://i.pravatar.cc/150?u=2', status: 'up' },
  { id: 3, name: 'Nadia Senhaji', role: 'Sales', points: 120, avatar: 'https://i.pravatar.cc/150?u=3', status: 'up' },
  { id: 4, name: 'Imane Chakir', role: 'Sales', points: 98, avatar: 'https://i.pravatar.cc/150?u=4', status: 'up' },
  { id: 5, name: 'Hajar El Alami', role: 'Sales', points: 85, avatar: 'https://i.pravatar.cc/150?u=5', status: 'stable' },
  { id: 6, name: 'Khadija Amrani', role: 'Sales', points: 72, avatar: 'https://i.pravatar.cc/150?u=6', status: 'up' },
  { id: 7, name: 'Zineb Tazi', role: 'Sales', points: 65, avatar: 'https://i.pravatar.cc/150?u=7', status: 'down' },
  { id: 8, name: 'Meryem Bennis', role: 'Sales', points: 40, avatar: 'https://i.pravatar.cc/150?u=8', status: 'up' },
];

const DEFAULT_CHALLENGES = [
  {
    id: 1,
    title: "Master Confirmation",
    description: "Atteindre un taux de confirmation supérieur à 20%",
    target: "20% Taux",
    reward: "Bonus 500 DH",
    endDate: "2023-12-31",
    theme: "from-purple-600 to-blue-600",
  },
  {
    id: 2,
    title: "Sprint Livraison",
    description: "Livrer plus de 50 colis cette semaine",
    target: "50 Colis",
    reward: "Bonus 400 DH",
    endDate: "2023-12-25",
    theme: "from-orange-500 to-red-600",
  }
];

// NEW: Weekly Targets Data
const WEEKLY_TARGETS = [
  { id: 1, target: 20, reward: '200 DH', claimed: false, label: 'Palier 1' },
  { id: 2, target: 35, reward: '400 DH', claimed: false, label: 'Palier 2' },
  { id: 3, target: 50, reward: '800 DH', claimed: false, label: 'Palier 3' },
];

// --- COMPONENTS ---

const PodiumCard = ({ user, rank }) => {
  const isFirst = rank === 1;
  const isSecond = rank === 2;
  const isThird = rank === 3;

  return (
    <div className={`
      relative flex flex-col items-center bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 hover:shadow-lg transition-all duration-200 p-6 transition-transform hover:-translate-y-1
      ${isFirst ? 'order-1 md:-mt-8 w-full md:w-80 shadow-xl shadow-yellow-500/10 border-yellow-100 scale-105 z-10' : 'order-2 md:order-none w-full md:w-64'}
      ${isSecond ? 'order-2 md:mt-4' : ''}
      ${isThird ? 'order-3 md:mt-4' : ''}
    `}>
      {isFirst && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2">
           <Crown className="w-12 h-12 text-yellow-400 fill-yellow-400 animate-bounce" />
        </div>
      )}
      <div className={`
        absolute -top-3 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-md border-2 border-white
        ${isFirst ? 'bg-yellow-400' : isSecond ? 'bg-slate-400' : 'bg-orange-400'}
      `}>
        #{rank}
      </div>
      <div className={`
        relative rounded-full p-1 mb-3
        ${isFirst ? 'bg-gradient-to-br from-yellow-300 to-yellow-500' : isSecond ? 'bg-gradient-to-br from-slate-300 to-slate-400' : 'bg-gradient-to-br from-orange-300 to-orange-400'}
      `}>
         <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full border-4 border-white object-cover" />
      </div>
      <h3 className="font-bold text-slate-800 text-lg text-center leading-tight">{user.name}</h3>
      {isFirst && <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full font-bold mt-1 mb-2 uppercase tracking-wide">Sales Manager</span>}
      <div className="flex flex-col items-center mt-2">
        <span className={`text-3xl font-black ${isFirst ? 'text-yellow-500' : 'text-slate-700'}`}>
          {user.points}
        </span>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Colis Livrés</span>
      </div>
      {isFirst && <div className="w-full h-1 bg-gradient-to-r from-transparent via-yellow-200 to-transparent mt-4" />}
    </div>
  );
};

export default function Leaderboard() {
  const top3 = PERFORMERS.slice(0, 3);
  const rest = PERFORMERS.slice(3);
  const maxPoints = PERFORMERS[0].points;
  
  const [challenges, setChallenges] = useState(DEFAULT_CHALLENGES);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);

  useEffect(() => {
    // Load logic here if needed
  }, []);

  // Auto slide
  useEffect(() => {
    const timer = setInterval(() => {
        setCurrentChallengeIndex((prev) => (prev + 1) % challenges.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [challenges.length]);

  const nextChallenge = () => setCurrentChallengeIndex((prev) => (prev + 1) % challenges.length);
  const prevChallenge = () => setCurrentChallengeIndex((prev) => (prev - 1 + challenges.length) % challenges.length);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'up': return <span className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold"><TrendingUp size={14} /> ON FIRE</span>;
      case 'stable': return <span className="flex items-center gap-1 px-2 py-1 bg-slate-50 text-slate-500 rounded-lg text-xs font-bold"><Minus size={14} /> Stable</span>;
      case 'down': return <span className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-500 rounded-lg text-xs font-bold"><Snowflake size={14} /> Cold</span>;
      default: return null;
    }
  };

  const currentChallenge = challenges[currentChallengeIndex];

  return (
    <div className="w-full space-y-8 pb-10 bg-slate-50 min-h-screen">
      


      {/* --- CHALLENGES SLIDER --- */}
      <div className="w-full px-4 sm:px-6 lg:px-8 -mt-4">
        <div className="w-full">
            <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Star size={14} /> Challenge Spécial
                </h3>
                <div className="flex gap-1">
                    <button onClick={prevChallenge} className="p-1.5 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <ChevronLeft size={16} />
                    </button>
                    <button onClick={nextChallenge} className="p-1.5 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            <div className={`relative overflow-hidden rounded-2xl shadow-lg bg-gradient-to-r ${currentChallenge.theme || 'from-violet-600 to-indigo-600'} text-white transition-all duration-500`}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-20 -mt-20 blur-2xl"></div>
                <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-1 text-center md:text-left space-y-3">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white border border-white/20">
                            <Timer size={12} />
                            Fin le {currentChallenge.endDate ? new Date(currentChallenge.endDate).toLocaleDateString('fr-FR') : 'Bientôt'}
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black leading-tight">
                            {currentChallenge.title}
                        </h3>
                        <p className="text-white/90 text-sm max-w-lg">
                            {currentChallenge.description}
                        </p>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                        {/* Challenge Image */}
                        {currentChallenge.image && (
                          <div className="w-48 h-32 rounded-xl overflow-hidden shadow-xl border-2 border-white/30">
                            <img 
                              src={currentChallenge.image} 
                              alt={currentChallenge.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        {/* Stats */}
                        <div className="flex flex-wrap justify-center gap-3">
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl min-w-[100px] text-center">
                                <div className="text-xl font-bold">{currentChallenge.target}</div>
                                <div className="text-[10px] text-white/60 font-medium uppercase">Objectif</div>
                            </div>
                            <div className="bg-white text-slate-900 p-4 rounded-xl min-w-[100px] text-center shadow-xl transform scale-105">
                                <div className="text-xl font-bold text-orange-600">{currentChallenge.reward}</div>
                                <div className="text-[10px] text-slate-500 font-bold uppercase">Gain</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                    {challenges.map((_, idx) => (
                        <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentChallengeIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`} />
                    ))}
                </div>
            </div>
        </div>
      </div>
      
      {/* Header */}
      <div className="text-center space-y-2 px-4 sm:px-6 lg:px-8 pt-4">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900">Leaderboard</h1>
        <p className="text-slate-600 font-medium">Classement par colis livrés</p>
      </div>

      {/* Podium Section */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 pt-2 pb-4 px-4 sm:px-6 lg:px-8">
        <PodiumCard user={top3[1]} rank={2} /> 
        <PodiumCard user={top3[0]} rank={1} /> 
        <PodiumCard user={top3[2]} rank={3} /> 
      </div>

      {/* List Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mx-4 sm:mx-6 lg:mx-8 w-full">
        {rest.map((user, index) => {
          const rank = index + 4;
          const progressWidth = (user.points / maxPoints) * 100;

          return (
            <div key={user.id} className="flex items-center gap-4 p-4 md:p-6 border-b border-slate-50 last:border-none hover:bg-slate-50/50 transition-colors group">
              <span className="w-8 text-center font-bold text-slate-400 group-hover:text-slate-600 text-lg">#{rank}</span>
              <img src={user.avatar} alt={user.name} className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-slate-100" />
              <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-4">
                   <h4 className="font-bold text-slate-800 truncate text-base">{user.name}</h4>
                   <span className="text-xs text-slate-400 hidden md:inline-block">{user.role}</span>
                </div>
                <div className="md:col-span-5 w-full hidden md:block px-2">
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full shadow-sm" style={{ width: `${progressWidth}%` }} />
                  </div>
                </div>
                <div className="md:col-span-3 flex items-center justify-between md:justify-end gap-3">
                   <div className="flex flex-col items-end">
                       <span className="font-black text-slate-800 text-lg">{user.points}</span>
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">LIVRÉS</span>
                   </div>
                   <div className="scale-90 md:scale-100">{getStatusBadge(user.status)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}