import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CheckCircle, 
  Package, 
  Truck, 
  XCircle,
  Clock,
  TrendingUp,
  Search,
  Filter
} from 'lucide-react';

const STAGES = [
  { id: 'Reporter', label: 'Reporter', color: 'bg-slate-500', textColor: 'text-slate-700', bgLight: 'bg-slate-50' },
  { id: 'Confirmé', label: 'Confirmé', color: 'bg-purple-500', textColor: 'text-purple-700', bgLight: 'bg-purple-50' },
  { id: 'Packaging', label: 'Packaging', color: 'bg-orange-500', textColor: 'text-orange-700', bgLight: 'bg-orange-50' },
  { id: 'Out for Delivery', label: 'En Livraison', color: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-50' },
  { id: 'Livré', label: 'Livré', color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-50' },
  { id: 'Annulé', label: 'Annulé', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-50' },
];

export default function ConfirmationDashboard() {
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [clientsRes, productsRes, citiesRes] = await Promise.all([
        fetch('http://localhost:3001/clients'),
        fetch('http://localhost:3001/products'),
        fetch('http://localhost:3001/villes')
      ]);

      const clientsData = await clientsRes.json();
      const productsData = await productsRes.json();
      const citiesData = await citiesRes.json();

      setClients(clientsData);
      setProducts(productsData);
      setCities(citiesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const stats = {
    total: clients.length,
    reporter: clients.filter(c => c.stage === 'Reporter').length,
    confirmed: clients.filter(c => c.stage === 'Confirmé').length,
    packaging: clients.filter(c => c.stage === 'Packaging').length,
    delivery: clients.filter(c => c.stage === 'Out for Delivery').length,
    delivered: clients.filter(c => c.stage === 'Livré').length,
    cancelled: clients.filter(c => c.stage === 'Annulé').length,
  };

  // Get today's confirmations
  const today = new Date().toISOString().split('T')[0];
  const todayConfirmations = clients.filter(c => {
    const clientDate = c.dateModified ? new Date(c.dateModified).toISOString().split('T')[0] : null;
    return c.stage === 'Confirmé' && clientDate === today;
  }).length;

  // Filter clients
  const filteredClients = clients.filter(client => {
    const matchesStage = selectedStage === 'all' || client.stage === selectedStage;
    const matchesSearch = searchTerm === '' || 
      client.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.tel?.includes(searchTerm) ||
      client.produitName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStage && matchesSearch;
  });

  const getStageConfig = (stage) => {
    return STAGES.find(s => s.id === stage) || STAGES[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tableau de Bord Confirmation</h1>
            <p className="text-slate-500 mt-1 font-medium">Vue d'ensemble des clients par étape</p>
          </div>
          <div className="w-16 h-16 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center">
            <LayoutDashboard size={32} />
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Clients */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Clients</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Users size={24} />
            </div>
          </div>
        </div>

        {/* Confirmed Today */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Confirmés Aujourd'hui</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{todayConfirmations}</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <CheckCircle size={24} />
            </div>
          </div>
        </div>

        {/* In Packaging */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">En Packaging</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{stats.packaging}</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
              <Package size={24} />
            </div>
          </div>
        </div>

        {/* Delivered */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Livrés</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.delivered}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
              <Truck size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Stage Statistics */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Répartition par Étape</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {STAGES.map(stage => {
            const count = clients.filter(c => c.stage === stage.id).length;
            const percentage = stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : 0;
            
            return (
              <div key={stage.id} className={`${stage.bgLight} rounded-xl p-4 border border-slate-200`}>
                <div className={`w-10 h-10 ${stage.color} rounded-lg flex items-center justify-center mb-2`}>
                  <span className="text-white font-bold text-lg">{count}</span>
                </div>
                <p className={`text-sm font-semibold ${stage.textColor}`}>{stage.label}</p>
                <p className="text-xs text-slate-500 mt-1">{percentage}%</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher par nom, téléphone, produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all"
              />
            </div>
          </div>

          {/* Stage Filter */}
          <div className="flex gap-2 flex-wrap overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedStage('all')}
              className={`px-3 py-2 rounded-xl font-medium transition-all text-sm whitespace-nowrap ${
                selectedStage === 'all'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tous ({stats.total})
            </button>
            {STAGES.map(stage => {
              const count = clients.filter(c => c.stage === stage.id).length;
              return (
                <button
                  key={stage.id}
                  onClick={() => setSelectedStage(stage.id)}
                  className={`px-3 py-2 rounded-xl font-medium transition-all text-sm whitespace-nowrap ${
                    selectedStage === stage.id
                      ? `${stage.color} text-white shadow-lg`
                      : `${stage.bgLight} ${stage.textColor} hover:opacity-80`
                  }`}
                >
                  {stage.label} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Client List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">
            Liste des Clients {selectedStage !== 'all' && `- ${getStageConfig(selectedStage).label}`}
          </h2>
          <p className="text-sm text-slate-500 mt-1">{filteredClients.length} client(s) trouvé(s)</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Téléphone</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Produit</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Ville</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Quantité</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Étape</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <Filter size={32} className="text-slate-300" />
                      <p>Aucun client trouvé</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const stageConfig = getStageConfig(client.stage);
                  const clientDate = client.dateModified 
                    ? new Date(client.dateModified).toLocaleDateString('fr-FR')
                    : new Date(client.dateCreated).toLocaleDateString('fr-FR');

                  return (
                    <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{client.nom}</div>
                        <div className="text-sm text-slate-500">{client.adresse}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-700">{client.tel}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{client.produitName}</div>
                        <div className="text-sm text-slate-500">{client.price} DH</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-700">{client.villeName}</div>
                        <div className="text-sm text-slate-500">{client.quartierName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-sm font-semibold">
                          {client.nbPiece} pcs
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-lg ${stageConfig.color} text-white text-sm font-semibold`}>
                          {stageConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{clientDate}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
