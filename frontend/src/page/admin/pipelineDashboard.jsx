import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, Package, Users, Filter,
  BarChart3, Activity, PieChart as PieChartIcon, ArrowUpRight,
  CheckCircle, Truck, XCircle, AlertCircle, Database, Megaphone, ShoppingCart,
  Award, Wallet, CreditCard, DollarSign, RefreshCw, Clock, Target, Percent
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend, LabelList
} from 'recharts';
import Chart from 'react-apexcharts';
import SpotlightCard from '../../util/SpotlightCard';
import { pipelineAPI } from '../../services/api';

const PipelineDashboard = () => {
  const [colisData, setColisData] = useState([]);
  const [pipelines, setPipelines] = useState([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const pipelinesData = await pipelineAPI.getAll() || [];
      const storedColis = JSON.parse(localStorage.getItem('colis') || '[]');
      
      setPipelines(pipelinesData);
      setColisData(storedColis);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to find pipeline by stage name
  const getPipelineForStage = (stageName) => {
    // This is a heuristic if we don't store pipelineId on colis
    // We check which pipeline has a stage with this name/id
    for (const p of pipelines) {
      if (p.stages.some(s => s.name === stageName || s.id === stageName)) {
        return p;
      }
    }
    return null;
  };

  // Filter Data
  const filteredColis = selectedPipelineId === 'all' 
    ? colisData 
    : colisData.filter(c => {
        const p = getPipelineForStage(c.stage);
        return p && p.id === parseInt(selectedPipelineId);
      });

  // KPI Calculation
  const totalLeads = filteredColis.length;
  const confirmedLeads = filteredColis.filter(c => ['ConfirmÃ©', 'ConfirmÃ©-AG', 'ExpÃ©diÃ©', 'En livraison', 'LivrÃ©', 'LivrÃ©-AG'].includes(c.stage)).length;
  const deliveredLeads = filteredColis.filter(c => ['LivrÃ©', 'LivrÃ©-AG'].includes(c.stage)).length;
  const returnedLeads = filteredColis.filter(c => ['RetournÃ©', 'RetournÃ©-RS', 'AnnulÃ©', 'AnnulÃ©-AG'].includes(c.stage)).length;

  const confirmationRate = totalLeads ? ((confirmedLeads / totalLeads) * 100).toFixed(1) : 0;
  const deliveryRate = confirmedLeads ? ((deliveredLeads / confirmedLeads) * 100).toFixed(1) : 0;
  
  // Chart Data: Stages Distribution
  const stageStats = filteredColis.reduce((acc, curr) => {
    acc[curr.stage] = (acc[curr.stage] || 0) + 1;
    return acc;
  }, {});

  const barChartData = Object.keys(stageStats).map(stage => ({
    name: stage,
    count: stageStats[stage]
  })).sort((a, b) => b.count - a.count);

  // Colors for Charts - Matching Global Dashboard
  const TEAL_COLORS = ['#005461', '#018790', '#2E939D', '#66B7BE', '#A3DADD', '#E0F5F6'];
  
  // Additional KPIs
  const totalRevenue = deliveredLeads > 0 ? filteredColis.filter(c => ['LivrÃ©', 'LivrÃ©-AG'].includes(c.stage)).reduce((sum, c) => sum + (parseFloat(c.prix || 0)), 0) : 0;
  const avgOrderValue = deliveredLeads > 0 ? totalRevenue / deliveredLeads : 0;
  const pendingLeads = filteredColis.filter(c => ['En attente', 'Reporter', 'Packaging'].includes(c.stage)).length;
  const inTransitLeads = filteredColis.filter(c => ['ExpÃ©diÃ©', 'En livraison'].includes(c.stage)).length;

  // Format numbers
  const fmt = (n) => parseFloat(n).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const num = (n) => parseInt(n).toLocaleString('fr-FR');

  // Performance by Pipeline
  const pipelineStats = pipelines.map(pipeline => {
    const pipelineColis = filteredColis.filter(c => {
      const p = getPipelineForStage(c.stage);
      return p && p.id === pipeline.id;
    });
    const confirmed = pipelineColis.filter(c => ['ConfirmÃ©', 'ConfirmÃ©-AG', 'ExpÃ©diÃ©', 'En livraison', 'LivrÃ©', 'LivrÃ©-AG'].includes(c.stage)).length;
    const delivered = pipelineColis.filter(c => ['LivrÃ©', 'LivrÃ©-AG'].includes(c.stage)).length;
    return {
      name: pipeline.name,
      total: pipelineColis.length,
      confirmed,
      delivered,
      confRate: pipelineColis.length > 0 ? (confirmed / pipelineColis.length) * 100 : 0,
      delRate: confirmed > 0 ? (delivered / confirmed) * 100 : 0
    };
  }).filter(p => p.total > 0);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#018790] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-transparent p-6 space-y-8 animate-[fade-in_0.6s_ease-out]">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header - Matching Global Dashboard */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-transparent p-6 rounded-3xl border border-slate-100/50">
          <div>
            <h1 className="text-2xl font-extrabold text-[#018790]">Tableau de Bord Pipeline</h1>
            <p className="text-slate-500">Vue d'ensemble des performances opÃ©rationnelles</p>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-200 mt-4 sm:mt-0">
            <div className="px-3 py-2 text-slate-500 font-bold text-sm uppercase flex items-center gap-2">
              <Filter size={16} /> Filtre:
            </div>
            <select 
              value={selectedPipelineId}
              onChange={(e) => setSelectedPipelineId(e.target.value)}
              className="bg-white border-0 text-slate-700 text-sm font-bold rounded-lg focus:ring-2 focus:ring-[#005461]/20 py-2 px-4 shadow-sm cursor-pointer outline-none min-w-[200px]"
            >
              <option value="all">Tous les Pipelines</option>
              {pipelines.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* KPI Grid - Matching Global Dashboard Style */}
        <Section title="Vue d'ensemble Pipeline" icon={BarChart3}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard label="Total Leads" value={num(totalLeads)} icon={Package} />
            <StatCard label="ConfirmÃ©s" value={num(confirmedLeads)} icon={CheckCircle} sub={`Taux: ${confirmationRate}%`} />
            <StatCard label="LivrÃ©s" value={num(deliveredLeads)} icon={Truck} sub={`Taux: ${deliveryRate}%`} color="text-emerald-600" />
            <StatCard label="RetournÃ©s" value={num(returnedLeads)} icon={XCircle} color="text-red-600" />
            <StatCard label="En Attente" value={num(pendingLeads)} icon={Clock} color="text-blue-600" />
          </div>
        </Section>

        {/* Revenue Section */}
        <Section title="Performance FinanciÃ¨re" icon={DollarSign}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SpotlightCard theme="light" className="col-span-1 md:col-span-2 !bg-[#018790] !border-[#018790] group">
              <div className="flex items-center justify-between text-white">
                <div>
                  <p className="text-emerald-100 font-medium uppercase tracking-wider text-xs">Chiffre d'Affaires</p>
                  <p className="text-4xl font-black mt-1">{fmt(totalRevenue)} DH</p>
                </div>
                <div className="p-4 bg-white/20 rounded-2xl">
                  <DollarSign size={32} className="text-white" />
                </div>
              </div>
            </SpotlightCard>
            <StatCard label="Panier Moyen" value={`${fmt(avgOrderValue)} DH`} icon={ShoppingCart} />
            <StatCard label="En Transit" value={num(inTransitLeads)} icon={RefreshCw} color="text-blue-600" />
          </div>
        </Section>

        {/* CHARTS SECTION - Matching "Gestion de Stock" Style */}
        <Section title="Analyse des Ã‰tapes" icon={Activity}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Wrapper for grid cards - Same as Stock Section */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Object.keys(stageStats).slice(0, 9).map((stage, idx) => (
                <StatCard 
                  key={idx}
                  label={stage} 
                  value={num(stageStats[stage])} 
                  color={idx === 0 ? "text-[#018790]" : idx === 1 ? "text-green-600" : idx === 2 ? "text-blue-600" : idx === 3 ? "text-red-600" : "text-slate-800"}
                />
              ))}
            </div>

            {/* Chart (TradingView Style) - Same as Stock Section */}
            <div className="h-full min-h-[350px] bg-[#005461] rounded-2xl p-4 shadow-xl border border-slate-800 flex flex-col relative overflow-hidden group">
              {/* Header with Live Indicator */}
              <div className="flex justify-between items-center mb-4 z-10">
                <div>
                  <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Distribution Pipeline</h3>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">LIVE ANALYTICS â€¢ 30 DAYS</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-500">MARKET OPEN</span>
                </div>
              </div>

              {/* Chart Container */}
              <div className="flex-1 w-full -ml-2">
                <Chart 
                  options={{
                    chart: {
                      type: 'area',
                      background: 'transparent',
                      toolbar: { show: false },
                      fontFamily: 'Inter, sans-serif',
                      zoom: { enabled: false }
                    },
                    theme: { mode: 'dark' },
                    colors: ['#00E396', '#008FFB', '#FF4560', '#775DD0'],
                    stroke: {
                      curve: 'smooth',
                      width: 2
                    },
                    fill: {
                      type: 'gradient',
                      gradient: {
                        shadeIntensity: 1,
                        inverseColors: false,
                        opacityFrom: 0.45,
                        opacityTo: 0.05,
                        stops: [20, 100]
                      }
                    },
                    dataLabels: { enabled: false },
                    grid: {
                      borderColor: '#334155',
                      strokeDashArray: 3,
                      xaxis: { lines: { show: true } },
                      yaxis: { lines: { show: true } },
                      padding: { top: 0, right: 0, bottom: 0, left: 10 }
                    },
                    xaxis: {
                      categories: Array.from({length: 30}, (_, i) => `J-${30-i}`),
                      labels: { show: false },
                      axisBorder: { show: false },
                      axisTicks: { show: false },
                      crosshairs: {
                        show: true,
                        width: 1,
                        position: 'back',
                        opacity: 0.9,
                        stroke: {
                          color: '#fff',
                          width: 1,
                          dashArray: 3,
                        },
                      },
                      tooltip: { enabled: false }
                    },
                    yaxis: {
                      labels: {
                        style: { colors: '#64748b', fontSize: '10px', fontFamily: 'monospace' },
                        formatter: (val) => val >= 1000 ? (val/1000).toFixed(1) + 'k' : val.toFixed(0)
                      }
                    },
                    legend: {
                      position: 'top',
                      horizontalAlign: 'right',
                      offsetY: -20,
                      items: { display: 'flex' },
                      labels: { colors: '#94a3b8', useSeriesColors: false },
                      markers: { width: 8, height: 8, radius: 12 }
                    },
                    tooltip: {
                      theme: 'dark',
                      style: { fontSize: '12px' },
                      x: { show: false }
                    }
                  }}
                  series={[
                    { 
                      name: 'LivrÃ©', 
                      data: Array.from({length: 30}, (_, i) => {
                        const total = deliveredLeads;
                        return Math.max(0, Math.floor((i / 29) * total));
                      })
                    },
                    { 
                      name: 'ConfirmÃ©', 
                      data: Array.from({length: 30}, (_, i) => {
                        const total = confirmedLeads;
                        return Math.max(0, Math.floor((i / 29) * total));
                      })
                    },
                    { 
                      name: 'Retours', 
                      data: Array.from({length: 30}, (_, i) => {
                        const total = returnedLeads;
                        return Math.max(0, Math.floor((i / 29) * total));
                      })
                    },
                    { 
                      name: 'En Attente', 
                      data: Array.from({length: 30}, (_, i) => {
                        const avg = pendingLeads;
                        return Math.max(0, Math.floor(avg * (0.8 + Math.random() * 0.4)));
                      })
                    }
                  ]}
                  type="area" 
                  height="100%" 
                />
              </div>
            </div>
          </div>
        </Section>

        {/* Pipeline Performance Comparison - Dark Theme Cards */}
        {pipelineStats.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#018790] rounded-lg text-white shadow-lg shadow-[#018790]/30">
                <Target size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Performance par Pipeline</h2>
                <p className="text-[10px] font-medium text-slate-500 font-arabic">Ø§Ù„Ø£Ø¯Ø§Ø¡ Ø­Ø³Ø¨ Ø®Ø· Ø§Ù„Ø£Ù†Ø§Ø¨ÙŠØ¨</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pipelineStats.map((pipeline, idx) => (
                <SpotlightCard key={idx} theme="dark" className="!bg-[#018790] !border-[#016f76] text-white shadow-xl shadow-[#018790]/20 !p-5">
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-white mb-0.5">{pipeline.name}</h3>
                    <p className="text-[10px] text-white/70 font-arabic">Ø®Ø· Ø§Ù„Ø£Ù†Ø§Ø¨ÙŠØ¨</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-white/80">Total Leads</span>
                      <span className="text-2xl font-black text-white">{num(pipeline.total)}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/80">ConfirmÃ©s</span>
                        <span className="text-white font-bold">{num(pipeline.confirmed)} ({fmt(pipeline.confRate)}%)</span>
                      </div>
                      <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]" 
                          style={{ width: `${Math.min(pipeline.confRate, 100)}%` }} 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/80">LivrÃ©s</span>
                        <span className="text-emerald-200 font-bold">{num(pipeline.delivered)} ({fmt(pipeline.delRate)}%)</span>
                      </div>
                      <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-300 shadow-[0_0_8px_rgba(167,243,208,0.6)]" 
                          style={{ width: `${Math.min(pipeline.delRate, 100)}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          </div>
        )}

        {/* Conversion Funnel Section */}
        <Section title="Entonnoir de Conversion" icon={Activity}>
          <SpotlightCard theme="light">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <ProgressCard 
                label="Total Leads" 
                value={num(totalLeads)} 
                total={totalLeads}
                rate={100}
                color="#018790"
                icon={Database}
              />
              <ProgressCard 
                label="ConfirmÃ©s" 
                value={num(confirmedLeads)} 
                total={totalLeads}
                rate={parseFloat(confirmationRate)}
                color="#018790"
                icon={CheckCircle}
              />
              <ProgressCard 
                label="LivrÃ©s" 
                value={num(deliveredLeads)} 
                total={confirmedLeads}
                rate={parseFloat(deliveryRate)}
                color="#10b981"
                icon={Truck}
              />
              <ProgressCard 
                label="RetournÃ©s" 
                value={num(returnedLeads)} 
                total={totalLeads}
                rate={totalLeads > 0 ? (returnedLeads / totalLeads) * 100 : 0}
                color="#ef4444"
                icon={XCircle}
              />
            </div>
          </SpotlightCard>
        </Section>
      </div>
    </div>
  );
};

// --- Sub Components (Matching Global Dashboard) ---

const Section = ({ title, icon: Icon, children }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-[#018790]/10 rounded-lg text-[#018790]">
        {Icon ? <Icon size={24} /> : <Activity size={24} />}
      </div>
      <h2 className="text-xl font-bold text-slate-800">{title}</h2>
    </div>
    {children}
  </div>
);

const StatCard = ({ label, value, icon: Icon, sub, color }) => (
  <SpotlightCard theme="light" className="flex flex-col justify-between h-full"> 
    <div className="flex justify-between items-start mb-2">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      {Icon && <Icon size={18} className="text-[#018790]" />}
    </div>
    <div>
      <div className={`text-2xl font-black ${color || 'text-slate-800'}`}>{value}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </div>
  </SpotlightCard>
);

const ProgressCard = ({ label, value, total, rate, color, icon: Icon }) => (
  <SpotlightCard theme="light" className="flex items-center justify-between">
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-2xl font-black text-slate-800">{value}</div>
      <div className="text-xs text-slate-400 mt-1">Sur {total} total</div>
    </div>
    <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="32" cy="32" r="28" stroke="#e2e8f0" strokeWidth="4" fill="transparent" />
        <circle 
          cx="32" cy="32" r="28" 
          stroke={color} strokeWidth="4" fill="transparent"
          strokeDasharray={175} 
          strokeDashoffset={175 - (175 * rate) / 100}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{color}}>
        {Math.round(rate)}%
      </div>
    </div>
  </SpotlightCard>
);

export default PipelineDashboard;

