import React, { useState, useEffect } from 'react';
import { Trophy, Plus, X, Edit2, Trash2, Save, Calendar, Target, Gift, Image as ImageIcon, ToggleLeft, ToggleRight, Users, Award, CheckCircle } from 'lucide-react';

export default function Challenges() {
  const [challenges, setChallenges] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [showWinnersModal, setShowWinnersModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target: '',
    reward: '',
    startDate: '',
    endDate: '',
    image: '',
    color: '#2563EB',
    active: true,
    winners: [] // Array of employee IDs who completed the challenge
  });

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = () => {
    const saved = localStorage.getItem('challenges');
    if (saved) {
      setChallenges(JSON.parse(saved));
    }
  };

  const saveChallenges = (data) => {
    localStorage.setItem('challenges', JSON.stringify(data));
    setChallenges(data);
  };

  const handleOpenModal = (challenge = null) => {
    if (challenge) {
      setEditingChallenge(challenge);
      setFormData(challenge);
    } else {
      setEditingChallenge(null);
      setFormData({
        title: '',
        description: '',
        target: '',
        reward: '',
        startDate: '',
        endDate: '',
        image: '',
        color: '#2563EB',
        active: true,
        winners: []
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingChallenge(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingChallenge) {
      const updated = challenges.map(c => 
        c.id === editingChallenge.id ? { ...formData, id: c.id } : c
      );
      saveChallenges(updated);
    } else {
      const newChallenge = {
        ...formData,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };
      saveChallenges([...challenges, newChallenge]);
    }
    
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce challenge ?')) {
      const filtered = challenges.filter(c => c.id !== id);
      saveChallenges(filtered);
    }
  };

  const handleToggleActive = (id) => {
    const updated = challenges.map(c => 
      c.id === id ? { ...c, active: !c.active } : c
    );
    saveChallenges(updated);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleShowWinners = (challenge) => {
    setSelectedChallenge(challenge);
    setShowWinnersModal(true);
  };

  const predefinedColors = [
    { name: 'Bleu', value: '#2563EB' },
    { name: 'Indigo', value: '#4F46E5' },
    { name: 'Violet', value: '#7C3AED' },
    { name: 'Emeraude', value: '#059669' },
    { name: 'Orange', value: '#EA580C' },
    { name: 'Rose', value: '#DB2777' }
  ];

  // Mock employees data - in real app, load from localStorage or API
  const mockEmployees = [
    { id: 1, name: 'Ahmed Benali', sales: 25 },
    { id: 2, name: 'Fatima Zahra', sales: 22 },
    { id: 3, name: 'Karim Essadi', sales: 18 },
  ];

  return (
    <div className="w-full min-h-screen bg-slate-50 pb-16 animate-[fade-in_0.6s_ease-out]">
      <div className="w-full px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-xl shadow-md shadow-blue-500/20">
                <Trophy className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Gestion des Challenges
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Créez et gérez les challenges pour motiver votre équipe
                </p>
              </div>
            </div>
            
            <button
              onClick={() => handleOpenModal()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:scale-95 flex items-center gap-2 shadow-md shadow-blue-500/20"
            >
              <Plus size={20} />
              Nouveau Challenge
            </button>
          </div>
        </div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl p-12 text-center border border-dashed border-slate-300 shadow-sm">
              <Trophy className="mx-auto text-slate-300 mb-4" size={64} />
              <p className="text-slate-500 text-lg mb-4 font-semibold">Aucun challenge créé</p>
              <button
                onClick={() => handleOpenModal()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md shadow-blue-500/20"
              >
                Créer votre premier challenge
              </button>
            </div>
          ) : (
            challenges.map((challenge) => (
              <div
                key={challenge.id}
                className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-200"
              >
                {/* Challenge Header with Color */}
                <div
                  className="h-32 relative"
                  style={{
                    background: `linear-gradient(135deg, ${challenge.color} 0%, ${challenge.color}dd 100%)`
                  }}
                >
                  {challenge.image && (
                    <img
                      src={challenge.image}
                      alt={challenge.title}
                      className="w-full h-full object-cover opacity-50"
                    />
                  )}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={() => handleToggleActive(challenge.id)}
                      className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-all shadow-md"
                      title={challenge.active ? 'Actif' : 'Inactif'}
                    >
                      {challenge.active ? (
                        <ToggleRight className="text-emerald-600" size={20} />
                      ) : (
                        <ToggleLeft className="text-slate-400" size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Challenge Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-slate-900">{challenge.title}</h3>
                    {challenge.active && (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200">
                        Actif
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {challenge.description}
                  </p>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="p-2 bg-blue-600 rounded-lg">
                        <Target className="text-white" size={16} />
                      </div>
                      <span className="font-semibold text-slate-900 text-sm">
                        Objectif: {challenge.target} ventes
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="p-2 bg-purple-600 rounded-lg">
                        <Gift className="text-white" size={16} />
                      </div>
                      <span className="font-semibold text-slate-900 text-sm">
                        {challenge.reward}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="p-2 bg-slate-600 rounded-lg">
                        <Calendar className="text-white" size={16} />
                      </div>
                      <span className="text-slate-700 text-xs font-medium">
                        {new Date(challenge.startDate).toLocaleDateString('fr-FR')} - {' '}
                        {new Date(challenge.endDate).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>

                  {/* Winners Section */}
                  {challenge.winners && challenge.winners.length > 0 && (
                    <div className="mb-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Award className="text-emerald-600" size={18} />
                          <span className="text-sm font-bold text-emerald-900">
                            {challenge.winners.length} Gagnant{challenge.winners.length > 1 ? 's' : ''}
                          </span>
                        </div>
                        <button
                          onClick={() => handleShowWinners(challenge)}
                          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                        >
                          Voir →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleOpenModal(challenge)}
                      className="flex-1 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 font-semibold"
                    >
                      <Edit2 size={16} />
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(challenge.id)}
                      className="flex-1 px-4 py-2.5 bg-white text-red-600 border-2 border-red-200 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2 font-semibold"
                    >
                      <Trash2 size={16} />
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal - Create/Edit Challenge */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Trophy size={24} />
                  </div>
                  {editingChallenge ? 'Modifier le Challenge' : 'Nouveau Challenge'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Titre du Challenge *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="Ex: Challenge 20 Ventes"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                    placeholder="Décrivez le challenge..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Objectif (ventes) *
                    </label>
                    <input
                      type="number"
                      name="target"
                      value={formData.target}
                      onChange={handleChange}
                      required
                      min="1"
                      className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Récompense *
                    </label>
                    <input
                      type="text"
                      name="reward"
                      value={formData.reward}
                      onChange={handleChange}
                      required
                      className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="500 DH"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Date de début *
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      required
                      className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Date de fin *
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      required
                      className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">
                    Couleur du thème
                  </label>
                  <div className="flex flex-wrap gap-3 mb-3">
                    {predefinedColors.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                        className={`w-14 h-14 rounded-xl border-2 transition-all shadow-md ${
                          formData.color === color.value
                            ? 'border-slate-900 scale-110 ring-2 ring-slate-300'
                            : 'border-slate-200 hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    className="w-24 h-12 rounded-lg border-2 border-slate-200 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    URL de l'image (optionnel)
                  </label>
                  <div className="flex gap-3">
                    <div className="p-3 bg-slate-100 rounded-lg">
                      <ImageIcon className="text-slate-500" size={20} />
                    </div>
                    <input
                      type="url"
                      name="image"
                      value={formData.image}
                      onChange={handleChange}
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  {formData.image && (
                    <div className="mt-3 rounded-lg overflow-hidden border-2 border-slate-200">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-full h-40 object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <input
                    type="checkbox"
                    name="active"
                    id="active"
                    checked={formData.active}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="active" className="text-sm font-semibold text-slate-700">
                    Challenge actif (visible dans le dashboard)
                  </label>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-semibold"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 font-semibold shadow-md shadow-blue-500/20"
                  >
                    <Save size={20} />
                    {editingChallenge ? 'Mettre à jour' : 'Créer le Challenge'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Winners Modal */}
        {showWinnersModal && selectedChallenge && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-5 flex justify-between items-center rounded-t-2xl">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Award size={24} />
                  </div>
                  Employés Réussis
                </h3>
                <button
                  onClick={() => setShowWinnersModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6">
                <div className="mb-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <h4 className="font-bold text-slate-900 mb-1">{selectedChallenge.title}</h4>
                  <p className="text-sm text-slate-600">Objectif: {selectedChallenge.target} ventes</p>
                </div>

                <div className="space-y-3">
                  {mockEmployees.filter(emp => emp.sales >= selectedChallenge.target).map((employee, index) => (
                    <div key={employee.id} className="flex items-center justify-between p-4 bg-white border-2 border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{employee.name}</p>
                          <p className="text-sm text-slate-600">{employee.sales} ventes</p>
                        </div>
                      </div>
                      <CheckCircle className="text-emerald-600" size={24} />
                    </div>
                  ))}
                  
                  {mockEmployees.filter(emp => emp.sales >= selectedChallenge.target).length === 0 && (
                    <div className="text-center py-8">
                      <Users className="mx-auto text-slate-300 mb-3" size={48} />
                      <p className="text-slate-500">Aucun employé n'a encore réussi ce challenge</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-2xl">
                <button
                  onClick={() => setShowWinnersModal(false)}
                  className="w-full px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-semibold"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
