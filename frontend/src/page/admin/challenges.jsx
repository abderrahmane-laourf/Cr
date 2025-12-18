import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Trophy, Plus, X, Edit2, Trash2, Save, Calendar, Target, 
  Gift, Image as ImageIcon, ToggleLeft, ToggleRight, Users, 
  Award, CheckCircle, ChevronDown, Search, Filter 
} from 'lucide-react';

// ============================================================================
// 1. UTILITY COMPONENTS (Premium Style)
// ============================================================================

const SpotlightCard = ({ children, className = "", onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}
    >
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
};

const InputField = ({ label, type = "text", value, onChange, name, placeholder, required, min }) => (
  <div className="group flex flex-col gap-1.5">
    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest group-focus-within:text-[#2563EB] transition-colors">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <div className="relative">
      <input 
        type={type} 
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 outline-none transition-all"
      />
    </div>
  </div>
);

const TextAreaField = ({ label, value, onChange, name, placeholder, required, rows = 3 }) => (
    <div className="group flex flex-col gap-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest group-focus-within:text-[#2563EB] transition-colors">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <textarea 
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={rows}
          className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 outline-none transition-all resize-none"
        />
      </div>
    </div>
);

// ============================================================================
// 2. MAIN COMPONENT
// ============================================================================

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
    color: '#2563EB', // Default Blue
    active: true,
    winners: [] 
  });

  // Mock Employees for Winners List
  const mockEmployees = [
    { id: 1, name: 'Ahmed Benali', sales: 25 },
    { id: 2, name: 'Fatima Zahra', sales: 22 },
    { id: 3, name: 'Karim Essadi', sales: 18 },
  ];

  const predefinedColors = [
    { name: 'Bleu', value: '#2563EB' },
    { name: 'Bleu', value: '#2563EB' },
    { name: 'Violet', value: '#7C3AED' },
    { name: 'Emeraude', value: '#059669' },
    { name: 'Orange', value: '#EA580C' },
    { name: 'Rose', value: '#DB2777' }
  ];

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
    if (window.confirm('ÃŠtes-vous sÃ»r de vouloir supprimer ce challenge ?')) {
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

  return (
    <div className="w-full min-h-screen bg-transparent p-8 font-sans text-slate-800 dark:text-slate-200 animate-[fade-in_0.5s_ease-out]">
      
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
              <Trophy className="text-[#2563EB]" size={32} />
              Gestion des Challenges
            </h1>
            <p className="text-slate-500 mt-1 font-medium">Motivez votre Ã©quipe avec des objectifs et des rÃ©compenses.</p>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-3 bg-[#1e3a8a] text-white rounded-xl hover:bg-[#1e40af] transition-all shadow-lg shadow-blue-900/20 font-bold"
          >
            <Plus size={20} />
            Nouveau Challenge
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.length === 0 ? (
            <div className="col-span-full py-20 text-center text-slate-400">
                <div className="bg-white p-8 rounded-3xl inline-flex flex-col items-center shadow-sm border border-slate-200">
                    <Trophy size={64} className="mb-4 opacity-20" />
                    <p className="font-medium text-lg">Aucun challenge actif</p>
                    <p className="text-sm">Commencez par en crÃ©er un !</p>
                </div>
            </div>
        ) : (
            challenges.map((challenge) => (
                <SpotlightCard key={challenge.id} className="flex flex-col h-full !p-0">
                    
                    {/* Card Header (Gradient Image) */}
                    <div 
                        className="h-36 relative w-full overflow-hidden"
                        style={{
                            background: `linear-gradient(135deg, ${challenge.color} 0%, ${challenge.color}dd 100%)`
                        }}
                    >
                        {challenge.image && (
                            <img src={challenge.image} alt={challenge.title} className="w-full h-full object-cover opacity-30 mix-blend-overlay" />
                        )}
                        
                        {/* Active Toggle */}
                        <button
                            onClick={(e) => { e.stopPropagation(); handleToggleActive(challenge.id); }}
                            className="absolute top-4 right-4 bg-white/20 backdrop-blur-md border border-white/30 p-1.5 rounded-lg hover:bg-white/30 transition-all group"
                            title={challenge.active ? 'DÃ©sactiver' : 'Activer'}
                        >
                            {challenge.active ? (
                                <ToggleRight className="text-white" size={24} />
                            ) : (
                                <ToggleLeft className="text-white/60" size={24} />
                            )}
                        </button>

                        <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-xl font-bold text-white shadow-sm leading-tight mb-1">{challenge.title}</h3>
                            <div className="flex items-center gap-2 text-white/90 text-xs font-medium bg-black/10 backdrop-blur-sm w-fit px-2 py-1 rounded-lg border border-white/10">
                                <Calendar size={12} />
                                {new Date(challenge.startDate).toLocaleDateString('fr-FR')} - {new Date(challenge.endDate).toLocaleDateString('fr-FR')}
                            </div>
                        </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 flex-1 flex flex-col">
                        <p className="text-sm text-slate-600 mb-6 line-clamp-2 min-h-[40px] font-medium">
                            {challenge.description}
                        </p>

                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                                <div className="text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><Target size={12}/> Objectif</div>
                                <div className="text-lg font-black text-slate-800">{challenge.target}</div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                                <div className="text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><Gift size={12}/> Gain</div>
                                <div className="text-lg font-black" style={{ color: challenge.color }}>{challenge.reward}</div>
                            </div>
                        </div>

                        {/* Winners & Actions Footer */}
                        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                            <button 
                                onClick={() => handleShowWinners(challenge)}
                                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#2563EB] transition-colors"
                            >
                                <Award size={16} />
                                {challenge.winners?.length || 0} Gagnant(s)
                            </button>

                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={() => handleOpenModal(challenge)}
                                    className="p-2 text-slate-400 hover:text-[#2563EB] hover:bg-[#2563EB]/10 rounded-lg transition-colors"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button 
                                    onClick={() => handleDelete(challenge.id)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </SpotlightCard>
            ))
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && createPortal(
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                
                {/* Modal Header */}
                <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                            {editingChallenge ? <Edit2 className="text-[#2563EB]" /> : <Plus className="text-[#2563EB]" />}
                            {editingChallenge ? 'Modifier le Challenge' : 'Nouveau Challenge'}
                        </h2>
                    </div>
                    <button onClick={handleCloseModal} className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar">
                    <div className="space-y-6">
                        <InputField label="Titre du Challenge" name="title" value={formData.title} onChange={handleChange} required placeholder="Ex: Sprint de NoÃ«l" />
                        
                        <TextAreaField label="Description" name="description" value={formData.description} onChange={handleChange} required placeholder="DÃ©tails du challenge..." />

                        <div className="grid grid-cols-2 gap-5">
                            <InputField label="Objectif (Ventes)" type="number" name="target" value={formData.target} onChange={handleChange} required min="1" placeholder="20" />
                            <InputField label="RÃ©compense" name="reward" value={formData.reward} onChange={handleChange} required placeholder="500 DH" />
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <InputField label="Date de dÃ©but" type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
                            <InputField label="Date de fin" type="date" name="endDate" value={formData.endDate} onChange={handleChange} required />
                        </div>

                        {/* Color Picker */}
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Couleur du thÃ¨me</label>
                            <div className="flex flex-wrap gap-3">
                                {predefinedColors.map((color) => (
                                    <button
                                        key={color.value}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                                        className={`w-10 h-10 rounded-xl transition-all shadow-sm ${
                                            formData.color === color.value
                                            ? 'ring-2 ring-offset-2 ring-slate-400 scale-110'
                                            : 'hover:scale-105 opacity-80 hover:opacity-100'
                                        }`}
                                        style={{ backgroundColor: color.value }}
                                        title={color.name}
                                    />
                                ))}
                                <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-slate-200">
                                    <input
                                        type="color"
                                        name="color"
                                        value={formData.color}
                                        onChange={handleChange}
                                        className="w-[150%] h-[150%] absolute -top-1/4 -left-1/4 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Image URL */}
                        <div>
                            <InputField label="URL de l'image (Optionnel)" type="url" name="image" value={formData.image} onChange={handleChange} placeholder="https://..." />
                            {formData.image && (
                                <div className="mt-3 h-32 w-full rounded-xl overflow-hidden border border-slate-200">
                                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                                </div>
                            )}
                        </div>

                        {/* Active Toggle */}
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                <input 
                                    type="checkbox" 
                                    name="active" 
                                    id="active" 
                                    checked={formData.active} 
                                    onChange={handleChange}
                                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                    style={{
                                        right: formData.active ? '0' : 'auto',
                                        left: formData.active ? 'auto' : '0',
                                        borderColor: formData.active ? '#2563EB' : '#cbd5e1'
                                    }}
                                />
                                <label 
                                    htmlFor="active" 
                                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${formData.active ? 'bg-[#2563EB]' : 'bg-slate-300'}`}
                                ></label>
                            </div>
                            <label htmlFor="active" className="text-sm font-bold text-slate-700 cursor-pointer">
                                Challenge Actif
                            </label>
                        </div>
                    </div>

                    <div className="pt-8 flex justify-end gap-3 border-t border-slate-100 mt-6">
                        <button 
                            type="button" 
                            onClick={handleCloseModal}
                            className="px-6 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
                        >
                            Annuler
                        </button>
                        <button 
                            type="submit"
                            className="px-8 py-2.5 rounded-xl text-white font-bold flex items-center gap-2 bg-[#1e3a8a] hover:bg-[#1e40af] shadow-lg shadow-blue-900/20 transition-all"
                        >
                            <Save size={18} /> {editingChallenge ? 'Mettre Ã  jour' : 'CrÃ©er'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
      )}

      {/* WINNERS MODAL */}
      {showWinnersModal && selectedChallenge && createPortal(
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg flex flex-col animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Award className="text-yellow-500" /> Gagnants
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">{selectedChallenge.title}</p>
                    </div>
                    <button onClick={() => setShowWinnersModal(false)} className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8">
                    <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Objectif Atteint</span>
                        <span className="font-black text-[#2563EB] text-lg">{selectedChallenge.target} Ventes</span>
                    </div>

                    <div className="space-y-3">
                        {mockEmployees.filter(emp => emp.sales >= selectedChallenge.target).map((employee, index) => (
                            <div key={employee.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                        #{index + 1}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800">{employee.name}</p>
                                        <p className="text-xs text-slate-500 font-medium">{employee.sales} ventes</p>
                                    </div>
                                </div>
                                <CheckCircle className="text-emerald-500" size={20} />
                            </div>
                        ))}
                        
                        {mockEmployees.filter(emp => emp.sales >= selectedChallenge.target).length === 0 && (
                            <div className="text-center py-10">
                                <Users className="mx-auto text-slate-300 mb-3" size={48} />
                                <p className="text-slate-500 font-medium">Aucun gagnant pour le moment.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
      )}

    </div>
  );
}
