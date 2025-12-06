import React from 'react';
import { Trophy, TrendingUp, Minus, Snowflake, Crown } from 'lucide-react';

const PERFORMERS = [
  { id: 1, name: 'Fatima Zahra', role: 'Sales Manager', points: 2850, avatar: 'https://i.pravatar.cc/150?u=1', status: 'stable' },
  { id: 2, name: 'Salma Idrissi', role: 'Sales', points: 2680, avatar: 'https://i.pravatar.cc/150?u=2', status: 'up' },
  { id: 3, name: 'Nadia Senhaji', role: 'Sales', points: 2450, avatar: 'https://i.pravatar.cc/150?u=3', status: 'up' },
  { id: 4, name: 'Imane Chakir', role: 'Sales', points: 2100, avatar: 'https://i.pravatar.cc/150?u=4', status: 'up' },
  { id: 5, name: 'Hajar El Alami', role: 'Sales', points: 1950, avatar: 'https://i.pravatar.cc/150?u=5', status: 'stable' },
  { id: 6, name: 'Khadija Amrani', role: 'Sales', points: 1880, avatar: 'https://i.pravatar.cc/150?u=6', status: 'up' },
  { id: 7, name: 'Zineb Tazi', role: 'Sales', points: 1750, avatar: 'https://i.pravatar.cc/150?u=7', status: 'down' },
  { id: 8, name: 'Meryem Bennis', role: 'Sales', points: 1620, avatar: 'https://i.pravatar.cc/150?u=8', status: 'up' },
];

const PodiumCard = ({ user, rank }) => {
  const isFirst = rank === 1;
  const isSecond = rank === 2;
  const isThird = rank === 3;

  return (
    <div className={`
      relative flex flex-col items-center bg-white rounded-2xl shadow-sm border border-slate-100 p-6 transition-transform hover:-translate-y-1
      ${isFirst ? 'order-1 md:-mt-8 w-full md:w-80 shadow-xl shadow-yellow-500/10 border-yellow-100 scale-105 z-10' : 'order-2 md:order-none w-full md:w-64'}
      ${isSecond ? 'order-2 md:mt-4' : ''}
      ${isThird ? 'order-3 md:mt-4' : ''}
    `}>
      {/* Crown for #1 */}
      {isFirst && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2">
           <Crown className="w-12 h-12 text-yellow-400 fill-yellow-400 animate-bounce" />
        </div>
      )}

      {/* Badge used for Rank */}
      <div className={`
        absolute -top-3 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-md border-2 border-white
        ${isFirst ? 'bg-yellow-400' : isSecond ? 'bg-slate-400' : 'bg-orange-400'}
      `}>
        #{rank}
      </div>

      {/* Avatar */}
      <div className={`
        relative rounded-full p-1 mb-3
        ${isFirst ? 'bg-gradient-to-br from-yellow-300 to-yellow-500' : isSecond ? 'bg-gradient-to-br from-slate-300 to-slate-400' : 'bg-gradient-to-br from-orange-300 to-orange-400'}
      `}>
         <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full border-4 border-white object-cover" />
      </div>

      <h3 className="font-bold text-slate-800 text-lg text-center leading-tight">{user.name}</h3>
      {isFirst && <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full font-bold mt-1 mb-2 uppercase tracking-wide">Sales Manager</span>}
      
      <div className="flex items-center gap-1 mt-2">
        <span className={`text-2xl font-black ${isFirst ? 'text-yellow-500' : 'text-slate-700'}`}>
          {user.points}
        </span>
        <span className="text-xs font-bold text-slate-400 uppercase">PTS</span>
      </div>

      {isFirst && (
         <div className="w-full h-1 bg-gradient-to-r from-transparent via-yellow-200 to-transparent mt-4" />
      )}
    </div>
  );
};

export default function Leaderboard() {
  const top3 = PERFORMERS.slice(0, 3);
  const rest = PERFORMERS.slice(3);
  const maxPoints = PERFORMERS[0].points;

  const getStatusBadge = (status) => {
    switch(status) {
      case 'up': return <span className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold"><TrendingUp size={14} /> ON FIRE</span>;
      case 'stable': return <span className="flex items-center gap-1 px-2 py-1 bg-slate-50 text-slate-500 rounded-lg text-xs font-bold"><Minus size={14} /> Stable</span>;
      case 'down': return <span className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-500 rounded-lg text-xs font-bold"><Snowflake size={14} /> Cold</span>;
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
          <Trophy size={14} />
          Challenge Sales Octobre
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900">Top Performers</h1>
        <p className="text-slate-500 font-medium">Classement des meilleures vendeuses</p>
      </div>

      {/* Podium Section */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 pt-8 pb-4">
        <PodiumCard user={top3[1]} rank={2} /> {/* Second Place - Left */}
        <PodiumCard user={top3[0]} rank={1} /> {/* First Place - Center */}
        <PodiumCard user={top3[2]} rank={3} /> {/* Third Place - Right */}
      </div>

      {/* List Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {rest.map((user, index) => {
          const rank = index + 4;
          const progressWidth = (user.points / maxPoints) * 100;

          return (
            <div 
              key={user.id} 
              className="flex items-center gap-4 p-4 md:p-6 border-b border-slate-50 last:border-none hover:bg-slate-50/50 transition-colors group"
            >
              {/* Rank */}
              <span className="w-6 text-center font-bold text-slate-400 group-hover:text-slate-600">
                {rank}
              </span>

              {/* Avatar */}
              <img src={user.avatar} alt={user.name} className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover" />

              {/* Info & Progress */}
              <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                
                <div className="md:col-span-3">
                   <h4 className="font-bold text-slate-800 truncate">{user.name}</h4>
                </div>

                <div className="md:col-span-6 w-full hidden md:block">
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
                      style={{ width: `${progressWidth}%` }}
                    />
                  </div>
                </div>

                <div className="md:col-span-3 flex items-center justify-between md:justify-end gap-4">
                   <span className="font-black text-slate-800">{user.points} <span className="text-slate-400 text-xs font-bold">PTS</span></span>
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
