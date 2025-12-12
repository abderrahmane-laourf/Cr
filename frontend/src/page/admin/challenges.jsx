import React, { useState, useEffect } from 'react';
import { Trophy, Plus, X, Edit2, Trash2, Save, Calendar, Target, Gift, Image as ImageIcon, ToggleLeft, ToggleRight } from 'lucide-react';

export default function Challenges() {
  const [challenges, setChallenges] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target: '',
    reward: '',
    startDate: '',
    endDate: '',
    image: '',
    color: '#f59e0b',
    active: true
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
        color: '#f59e0b',
        active: true
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
      // Update existing challenge
      const updated = challenges.map(c => 
        c.id === editingChallenge.id ? { ...formData, id: c.id } : c
      );
      saveChallenges(updated);
    } else {
      // Add new challenge
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

  const predefinedColors = [
    { name: 'Orange', value: '#f59e0b' },
    { name: 'Rouge', value: '#ef4444' },
    { name: 'Violet', value: '#a855f7' },
    { name: 'Bleu', value: '#3b82f6' },
    { name: 'Vert', value: '#10b981' },
    { name: 'Rose', value: '#ec4899' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Trophy className="text-orange-500" size={32} />
              Gestion des Challenges
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Créez et gérez les challenges pour motiver votre équipe
            </p>
          </div>
          
          <button
            onClick={() => handleOpenModal()}
            className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors flex items-center gap-2 shadow-lg"
          >
            <Plus size={20} />
            Nouveau Challenge
          </button>
        </div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl p-12 text-center border border-dashed border-gray-300">
              <Trophy className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500 text-lg mb-4">Aucun challenge créé</p>
              <button
                onClick={() => handleOpenModal()}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Créer votre premier challenge
              </button>
            </div>
          ) : (
            challenges.map((challenge) => (
              <div
                key={challenge.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
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
                      className="p-2 bg-white bg-opacity-90 rounded-lg hover:bg-opacity-100 transition-all"
                      title={challenge.active ? 'Actif' : 'Inactif'}
                    >
                      {challenge.active ? (
                        <ToggleRight className="text-green-500" size={20} />
                      ) : (
                        <ToggleLeft className="text-gray-400" size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Challenge Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900">{challenge.title}</h3>
                    {challenge.active && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        Actif
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {challenge.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Target className="text-orange-500" size={16} />
                      <span className="font-medium text-gray-700">
                        Objectif: {challenge.target} ventes
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Gift className="text-purple-500" size={16} />
                      <span className="font-medium text-gray-700">
                        Récompense: {challenge.reward}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="text-blue-500" size={16} />
                      <span className="text-gray-600">
                        {new Date(challenge.startDate).toLocaleDateString('fr-FR')} - {' '}
                        {new Date(challenge.endDate).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => handleOpenModal(challenge)}
                      className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      <Edit2 size={16} />
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(challenge.id)}
                      className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2 font-medium"
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

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Trophy className="text-orange-500" />
                  {editingChallenge ? 'Modifier le Challenge' : 'Nouveau Challenge'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre du Challenge *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Ex: Challenge 20 Ventes"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Décrivez le challenge..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Objectif (nombre de ventes) *
                    </label>
                    <input
                      type="number"
                      name="target"
                      value={formData.target}
                      onChange={handleChange}
                      required
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Récompense *
                    </label>
                    <input
                      type="text"
                      name="reward"
                      value={formData.reward}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="500 DH"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de début *
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de fin *
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur du thème
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {predefinedColors.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                        className={`w-12 h-12 rounded-lg border-2 transition-all ${
                          formData.color === color.value
                            ? 'border-gray-900 scale-110'
                            : 'border-gray-300 hover:scale-105'
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
                    className="w-20 h-10 rounded-lg border border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL de l'image (optionnel)
                  </label>
                  <div className="flex gap-2">
                    <ImageIcon className="text-gray-400 mt-2" size={20} />
                    <input
                      type="url"
                      name="image"
                      value={formData.image}
                      onChange={handleChange}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  {formData.image && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-gray-200">
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

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="active"
                    id="active"
                    checked={formData.active}
                    onChange={handleChange}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                  />
                  <label htmlFor="active" className="text-sm font-medium text-gray-700">
                    Challenge actif (visible dans le dashboard)
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <Save size={20} />
                    {editingChallenge ? 'Mettre à jour' : 'Créer le Challenge'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
