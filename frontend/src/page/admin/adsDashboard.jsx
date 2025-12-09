import React, { useState, useEffect } from 'react';
import { 
  Target, TrendingUp, DollarSign, Users, Package, Plus, Trash2, 
  Save, Filter, BarChart3, AlertCircle, CheckCircle, AlertTriangle, XCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { productAPI, employeeAPI, businessAPI, adsAPI } from '../../services/api';

const MarketingPlanner = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [products, setProducts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [targetProfiles, setTargetProfiles] = useState([]);
  const [plan, setPlan] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtres
  const [filters, setFilters] = useState({
    employee: 'all',
    product: 'all',
    platform: 'all',
    campaignType: 'all',
    business: 'all'
  });

  // Formulaire de plan
  const [planForm, setPlanForm] = useState({
    product: '',
    business: '',
    platform: 'facebook',
    campaignType: 'messages',
    duration: 30,
    dailyBudget: 10,
    excellent: 5,
    good: 8,
    review: 12,
    stop: 15,
    selectedProfile: ''
  });

  // Formulaire d'enregistrement
  const [recordForm, setRecordForm] = useState({
    product: '',
    employee: '',
    business: '',
    campaignName: '',
    date: new Date().toISOString().split('T')[0],
    spent: 0,
    results: 0,
    targetProfile: ''
  });

  const platforms = [
    { value: 'facebook', label: 'Facebook', color: '#1877f2' },
    { value: 'tiktok', label: 'TikTok', color: '#000000' },
    { value: 'google', label: 'Google', color: '#4285f4' },
    { value: 'snapchat', label: 'Snapchat', color: '#fffc00' }
  ];

  const campaignTypes = [
    { value: 'messages', label: 'Messages' },
    { value: 'leads', label: 'Conversions' },
    { value: 'sales', label: 'Ventes' }
  ];

  // Charger les données depuis les APIs et localStorage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger produits, employés, entreprises et campagnes depuis les APIs
      const [productsData, employeesData, businessesData, adsData] = await Promise.all([
        productAPI.getAll(),
        employeeAPI.getAll(),
        businessAPI.getAll(),
        adsAPI.getAll()
      ]);

      setProducts(productsData.map(p => p.name || p.nom));
      setEmployees(employeesData.map(e => e.name));
      setBusinesses(businessesData);
      
      // Extraire les noms de campagnes uniques depuis les ads
      const uniqueCampaigns = [...new Set(adsData.map(ad => ad.campaignName).filter(Boolean))];
      setCampaigns(uniqueCampaigns);

      // Charger les profils cibles, plan et enregistrements depuis localStorage
      const savedProfiles = JSON.parse(localStorage.getItem('marketing_profiles') || '[]');
      const savedPlan = JSON.parse(localStorage.getItem('marketing_plan') || 'null');
      const savedRecords = JSON.parse(localStorage.getItem('marketing_records') || '[]');

      setTargetProfiles(savedProfiles);
      setPlan(savedPlan);
      setRecords(savedRecords);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sauvegarder dans localStorage
  const saveToStorage = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Sauvegarder le profil cible
  const saveTargetProfile = () => {
    const name = prompt('Nom du profil cible:');
    if (name && name.trim()) {
      const profile = {
        id: Date.now(),
        name: name.trim(),
        excellent: planForm.excellent,
        good: planForm.good,
        review: planForm.review,
        stop: planForm.stop
      };
      const updated = [...targetProfiles, profile];
      setTargetProfiles(updated);
      saveToStorage('marketing_profiles', updated);
      alert('Profil cible sauvegardé avec succès!');
    }
  };

  // Charger un profil cible
  const loadTargetProfile = (profileId) => {
    const profile = targetProfiles.find(p => p.id == profileId);
    if (profile) {
      setPlanForm(prev => ({
        ...prev,
        excellent: profile.excellent,
        good: profile.good,
        review: profile.review,
        stop: profile.stop,
        selectedProfile: profileId
      }));
    }
  };

  // Sauvegarder le plan
  const savePlan = () => {
    if (!planForm.product) {
      alert('Veuillez sélectionner un produit');
      return;
    }
    
    const newPlan = {
      ...planForm,
      totalBudget: planForm.duration * planForm.dailyBudget,
      createdAt: new Date().toISOString()
    };
    
    setPlan(newPlan);
    saveToStorage('marketing_plan', newPlan);
    alert('Plan sauvegardé avec succès!');
    setActiveTab(2);
  };

  // Ajouter un enregistrement
  const addRecord = () => {
    if (!recordForm.product || !recordForm.employee || !recordForm.business || !recordForm.campaignName) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const cpr = recordForm.results > 0 ? recordForm.spent / recordForm.results : 0;
    
    // Déterminer le statut basé sur le profil cible
    let status = 'none';
    let statusColor = 'gray';
    
    if (recordForm.results > 0 && recordForm.targetProfile) {
      const profile = targetProfiles.find(p => p.id == recordForm.targetProfile);
      if (profile) {
        if (cpr <= profile.excellent) {
          status = 'excellent';
          statusColor = 'green';
        } else if (cpr <= profile.good) {
          status = 'good';
          statusColor = 'blue';
        } else if (cpr <= profile.stop) {
          status = 'review';
          statusColor = 'orange';
        } else {
          status = 'stop';
          statusColor = 'red';
        }
      }
    }

    const newRecord = {
      id: Date.now(),
      ...recordForm,
      cpr,
      status,
      statusColor,
      platform: plan?.platform || 'facebook',
      campaignType: plan?.campaignType || 'messages'
    };

    const updated = [...records, newRecord];
    setRecords(updated);
    saveToStorage('marketing_records', updated);

    // Réinitialiser le formulaire
    setRecordForm({
      product: '',
      employee: '',
      business: '',
      campaignName: '',
      date: new Date().toISOString().split('T')[0],
      spent: 0,
      results: 0,
      targetProfile: ''
    });

    alert('Enregistrement ajouté avec succès!');
  };

  // Supprimer un enregistrement
  const deleteRecord = (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet enregistrement?')) {
      const updated = records.filter(r => r.id !== id);
      setRecords(updated);
      saveToStorage('marketing_records', updated);
    }
  };

  // Filtrer les enregistrements
  const filteredRecords = records.filter(record => {
    if (filters.employee !== 'all' && record.employee !== filters.employee) return false;
    if (filters.product !== 'all' && record.product !== filters.product) return false;
    if (filters.platform !== 'all' && record.platform !== filters.platform) return false;
    if (filters.campaignType !== 'all' && record.campaignType !== filters.campaignType) return false;
    if (filters.business !== 'all' && record.business !== filters.business) return false;
    return true;
  }).sort((a, b) => new Date(a.date) - new Date(b.date));

  // Calculer les statistiques
  const stats = {
    totalSpent: filteredRecords.reduce((sum, r) => sum + Number(r.spent), 0),
    totalResults: filteredRecords.reduce((sum, r) => sum + Number(r.results), 0),
    avgCPR: 0,
    performance: 'none'
  };

  if (stats.totalResults > 0) {
    stats.avgCPR = stats.totalSpent / stats.totalResults;
    
    if (plan) {
      if (stats.avgCPR <= plan.excellent) {
        stats.performance = 'excellent';
      } else if (stats.avgCPR <= plan.good) {
        stats.performance = 'good';
      } else {
        stats.performance = 'poor';
      }
    }
  }

  // Données pour le graphique de tendance
  const trendData = filteredRecords.map(r => ({
    date: new Date(r.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    cpr: r.cpr
  }));

  // Analyse des écarts
  const variance = {
    targetCPR: plan ? (plan.excellent + plan.good) / 2 : 0,
    actualCPR: stats.avgCPR,
    costVariance: 0,
    resultsGap: 0,
    budgetStatus: 'within'
  };

  if (variance.targetCPR > 0) {
    variance.costVariance = ((variance.actualCPR - variance.targetCPR) / variance.targetCPR * 100).toFixed(1);
    
    const expectedResults = plan ? (plan.totalBudget / variance.targetCPR) : 0;
    variance.resultsGap = stats.totalResults - expectedResults;
    
    if (plan && stats.totalSpent > plan.totalBudget) {
      variance.budgetStatus = 'over';
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-semibold">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap');
          body { font-family: 'Tajawal', sans-serif; }
        `}
      </style>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Planificateur Marketing</h1>
        <p className="text-slate-500">Système de gestion et d'analyse des campagnes publicitaires</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
        {[
          { id: 1, label: 'Objectif & Stratégie', icon: Target },
          { id: 2, label: 'Suivi Quotidien', icon: BarChart3 },
          { id: 3, label: 'Évaluation & Analyse', icon: TrendingUp }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Objectif & Stratégie */}
      {activeTab === 1 && (
        <div className="space-y-6">
          {/* Inputs de campagne */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Package size={20} className="text-blue-600" />
              Paramètres de la Campagne
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Produit</label>
                <select
                  value={planForm.product}
                  onChange={(e) => setPlanForm({ ...planForm, product: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner...</option>
                  {products.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Entreprise</label>
                <select
                  value={planForm.business}
                  onChange={(e) => setPlanForm({ ...planForm, business: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner...</option>
                  {businesses.map(b => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Plateforme</label>
                <select
                  value={planForm.platform}
                  onChange={(e) => setPlanForm({ ...planForm, platform: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {platforms.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Type de Campagne</label>
                <select
                  value={planForm.campaignType}
                  onChange={(e) => setPlanForm({ ...planForm, campaignType: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {campaignTypes.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Budget Settings */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <DollarSign size={20} className="text-green-600" />
              Configuration du Budget
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Durée (jours)</label>
                <input
                  type="number"
                  value={planForm.duration}
                  onChange={(e) => setPlanForm({ ...planForm, duration: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Budget Quotidien ($)</label>
                <input
                  type="number"
                  value={planForm.dailyBudget}
                  onChange={(e) => setPlanForm({ ...planForm, dailyBudget: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Budget Total ($)</label>
                <input
                  type="text"
                  value={(planForm.duration * planForm.dailyBudget).toFixed(2)}
                  readOnly
                  className="w-full px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg font-bold text-blue-600"
                />
              </div>
            </div>
          </div>

          {/* CPR Targets */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold mb-4">Critères de Coût (CPR Targets)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4">
                <label className="block text-xs font-bold text-green-700 mb-2 uppercase">Excellent (≤)</label>
                <input
                  type="number"
                  value={planForm.excellent}
                  onChange={(e) => setPlanForm({ ...planForm, excellent: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  step="0.01"
                />
              </div>

              <div className="bg-blue-50 border-2 border-blue-500 rounded-xl p-4">
                <label className="block text-xs font-bold text-blue-700 mb-2 uppercase">Bon (≤)</label>
                <input
                  type="number"
                  value={planForm.good}
                  onChange={(e) => setPlanForm({ ...planForm, good: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                />
              </div>

              <div className="bg-orange-50 border-2 border-orange-500 rounded-xl p-4">
                <label className="block text-xs font-bold text-orange-700 mb-2 uppercase">Révision (≤)</label>
                <input
                  type="number"
                  value={planForm.review}
                  onChange={(e) => setPlanForm({ ...planForm, review: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  step="0.01"
                />
              </div>

              <div className="bg-red-50 border-2 border-red-500 rounded-xl p-4">
                <label className="block text-xs font-bold text-red-700 mb-2 uppercase">Arrêt (≥)</label>
                <input
                  type="number"
                  value={planForm.stop}
                  onChange={(e) => setPlanForm({ ...planForm, stop: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  step="0.01"
                />
              </div>
            </div>

            {/* Profils cibles */}
            <div className="flex gap-3">
              <select
                value={planForm.selectedProfile}
                onChange={(e) => loadTargetProfile(e.target.value)}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Charger un profil cible...</option>
                {targetProfiles.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <button
                onClick={saveTargetProfile}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold"
              >
                Sauvegarder comme Profil
              </button>
            </div>
          </div>

          {/* Save Plan Button */}
          <button
            onClick={savePlan}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors shadow-lg flex items-center justify-center gap-2"
          >
            <Save size={24} />
            Sauvegarder le Plan
          </button>
        </div>
      )}

      {/* Tab 2: Suivi Quotidien */}
      {activeTab === 2 && (
        <div className="space-y-6">
          {/* Formulaire d'enregistrement */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold mb-4">Ajouter un Enregistrement Quotidien</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Produit *</label>
                <select
                  value={recordForm.product}
                  onChange={(e) => setRecordForm({ ...recordForm, product: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner...</option>
                  {products.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Employé *</label>
                <select
                  value={recordForm.employee}
                  onChange={(e) => setRecordForm({ ...recordForm, employee: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner...</option>
                  {employees.map(e => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Entreprise *</label>
                <select
                  value={recordForm.business}
                  onChange={(e) => setRecordForm({ ...recordForm, business: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner...</option>
                  {businesses.map(b => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nom de Campagne *</label>
                <select
                  value={recordForm.campaignName}
                  onChange={(e) => setRecordForm({ ...recordForm, campaignName: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner...</option>
                  {campaigns.map(campaign => (
                    <option key={campaign} value={campaign}>{campaign}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Date</label>
                <input
                  type="date"
                  value={recordForm.date}
                  onChange={(e) => setRecordForm({ ...recordForm, date: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Dépense ($)</label>
                <input
                  type="number"
                  value={recordForm.spent}
                  onChange={(e) => setRecordForm({ ...recordForm, spent: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Résultats</label>
                <input
                  type="number"
                  value={recordForm.results}
                  onChange={(e) => setRecordForm({ ...recordForm, results: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Profil Cible (pour comparaison)</label>
                <select
                  value={recordForm.targetProfile}
                  onChange={(e) => setRecordForm({ ...recordForm, targetProfile: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Aucun</option>
                  {targetProfiles.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={addRecord}
                  className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Ajouter
                </button>
              </div>
            </div>
          </div>

          {/* Filtres */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Filter size={20} className="text-blue-600" />
              Filtres
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <select
                value={filters.employee}
                onChange={(e) => setFilters({ ...filters, employee: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les employés</option>
                {employees.map(e => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>

              <select
                value={filters.product}
                onChange={(e) => setFilters({ ...filters, product: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les produits</option>
                {products.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>

              <select
                value={filters.business}
                onChange={(e) => setFilters({ ...filters, business: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Toutes les entreprises</option>
                {businesses.map(b => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>

              <select
                value={filters.platform}
                onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Toutes les plateformes</option>
                {platforms.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>

              <select
                value={filters.campaignType}
                onChange={(e) => setFilters({ ...filters, campaignType: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les types</option>
                {campaignTypes.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table des enregistrements */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Détails</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Plateforme</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Dépense</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Résultats</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">CPR</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Statut</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-4 py-8 text-center text-slate-500">
                        Aucun enregistrement trouvé
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map(record => (
                      <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium">
                          {new Date(record.date).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-bold text-slate-900">{record.product}</div>
                          <div className="text-xs text-slate-500">{record.campaignName}</div>
                          <div className="text-xs text-slate-400">{record.employee}</div>
                          {record.business && (
                            <div className="text-xs text-blue-600 font-semibold mt-1">🏢 {record.business}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">
                            {platforms.find(p => p.value === record.platform)?.label || record.platform}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-bold">${record.spent.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm font-bold text-blue-600">{record.results}</td>
                        <td className="px-4 py-3 text-sm font-bold">${record.cpr.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                            record.status === 'excellent' ? 'bg-green-100 text-green-700' :
                            record.status === 'good' ? 'bg-blue-100 text-blue-700' :
                            record.status === 'review' ? 'bg-orange-100 text-orange-700' :
                            record.status === 'stop' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {record.status === 'excellent' ? 'Excellent' :
                             record.status === 'good' ? 'Bon' :
                             record.status === 'review' ? 'Révision' :
                             record.status === 'stop' ? 'Arrêt' :
                             'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => deleteRecord(record.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Évaluation & Analyse */}
      {activeTab === 3 && (
        <div className="space-y-6">
          {/* Résumé et Analyse */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Résumé Général */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold mb-6">Résumé Général</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-slate-500 mb-1">Dépense Totale</div>
                  <div className="text-3xl font-black text-slate-900">${stats.totalSpent.toFixed(2)}</div>
                </div>

                <div>
                  <div className="text-sm text-slate-500 mb-1">Résultats Totaux</div>
                  <div className="text-2xl font-bold text-blue-600">{stats.totalResults}</div>
                </div>

                <div>
                  <div className="text-sm text-slate-500 mb-1">CPR Moyen</div>
                  <div className="text-4xl font-black text-slate-900">${stats.avgCPR.toFixed(2)}</div>
                </div>

                <div className="pt-4">
                  {stats.performance === 'excellent' && (
                    <div className="bg-green-100 border-2 border-green-500 rounded-xl p-4 flex items-center gap-3">
                      <CheckCircle className="text-green-600" size={32} />
                      <div>
                        <div className="font-bold text-green-900 text-lg">Performance Exceptionnelle</div>
                        <div className="text-sm text-green-700">Objectifs largement dépassés!</div>
                      </div>
                    </div>
                  )}
                  
                  {stats.performance === 'good' && (
                    <div className="bg-blue-100 border-2 border-blue-500 rounded-xl p-4 flex items-center gap-3">
                      <CheckCircle className="text-blue-600" size={32} />
                      <div>
                        <div className="font-bold text-blue-900 text-lg">Bonne Performance</div>
                        <div className="text-sm text-blue-700">Résultats satisfaisants</div>
                      </div>
                    </div>
                  )}
                  
                  {stats.performance === 'poor' && (
                    <div className="bg-red-100 border-2 border-red-500 rounded-xl p-4 flex items-center gap-3">
                      <AlertCircle className="text-red-600" size={32} />
                      <div>
                        <div className="font-bold text-red-900 text-lg">Nécessite Amélioration</div>
                        <div className="text-sm text-red-700">Optimisation requise</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Analyse des Écarts */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold mb-6">Analyse des Écarts</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="text-xs text-slate-500 mb-1">CPR Cible</div>
                    <div className="text-xl font-bold text-slate-900">${variance.targetCPR.toFixed(2)}</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="text-xs text-slate-500 mb-1">CPR Réel</div>
                    <div className="text-xl font-bold text-blue-600">${variance.actualCPR.toFixed(2)}</div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-sm text-slate-600 mb-2">Écart de Coût</div>
                  <div className={`text-2xl font-black ${
                    variance.costVariance < 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {variance.costVariance > 0 ? '+' : ''}{variance.costVariance}%
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {variance.costVariance < 0 ? 'Économie réalisée' : 'Dépassement'}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-sm text-slate-600 mb-2">Écart Résultats</div>
                  <div className={`text-2xl font-black ${
                    variance.resultsGap > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {variance.resultsGap > 0 ? '+' : ''}{variance.resultsGap.toFixed(0)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {variance.resultsGap > 0 ? 'Surplus' : 'Déficit'}
                  </div>
                </div>

                <div className={`rounded-lg p-4 ${
                  variance.budgetStatus === 'within' 
                    ? 'bg-green-100 border-2 border-green-500' 
                    : 'bg-red-100 border-2 border-red-500'
                }`}>
                  <div className={`font-bold ${
                    variance.budgetStatus === 'within' ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {variance.budgetStatus === 'within' ? '✓ Dans le Budget' : '⚠ Budget Dépassé'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Graphique de Tendance */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold mb-6">Courbe de Performance (CPR)</h3>
            
            {trendData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="cpr" 
                      stroke="#2563eb" 
                      strokeWidth={3}
                      fill="rgba(37, 99, 235, 0.1)"
                      dot={{ fill: '#2563eb', r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-slate-400">
                Aucune donnée disponible pour le graphique
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingPlanner;
