import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Edit2, Trash2, X, Check, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    durationInDays: '30',
    features: ['']
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
        const res = await api.get('/plans');
        setPlans(res.data);
    } catch (error) {
        console.error(error);
        addToast('Failed to load plans', 'error');
    } finally {
        setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
  };

  const removeFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const openModal = (plan = null) => {
    if (plan) {
        setEditingPlan(plan);
        setFormData({
            name: plan.name,
            price: plan.price,
            durationInDays: plan.durationInDays,
            features: plan.features || []
        });
    } else {
        setEditingPlan(null);
        setFormData({
            name: '',
            price: '',
            durationInDays: '30',
            features: ['']
        });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
      setIsModalOpen(false);
      setEditingPlan(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const data = {
            ...formData,
            price: parseFloat(formData.price),
            durationInDays: parseInt(formData.durationInDays)
        };

        if (editingPlan) {
            await api.put(`/plans/${editingPlan.id}`, data);
            addToast('Plan updated successfully', 'success');
        } else {
            await api.post('/plans', data);
            addToast('Plan created successfully', 'success');
        }
        fetchPlans();
        closeModal();
    } catch (error) {
        console.error(error);
        addToast('Failed to save plan', 'error');
    }
  };

  const handleDelete = async (id) => {
      if (!window.confirm('Are you sure you want to delete this plan?')) return;
      try {
          await api.delete(`/plans/${id}`);
          addToast('Plan deleted', 'success');
          fetchPlans();
      } catch (error) {
           console.error(error);
           addToast('Failed to delete plan', 'error');
      }
  };

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto text-white pb-24 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-3 tracking-tight">
                    <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500">
                        <CreditCard size={28} />
                    </div>
                    Subscription Plans
                </h1>
                <p className="text-gray-400 text-sm mt-2 ml-1">Manage subscription packages and pricing for your users.</p>
            </div>
            <button 
                onClick={() => openModal()}
                className="flex items-center gap-2 bg-[#E50914] text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-900/20"
            >
                <Plus size={20} />
                Create New Plan
            </button>
        </div>

        {loading ? (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {plans.map((plan) => (
                    <div key={plan.id} className="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden hover:border-white/10 transition-all group shadow-xl flex flex-col">
                        <div className={`h-2 w-full bg-gradient-to-r ${plan.name.toLowerCase().includes('gold') ? 'from-yellow-400 to-yellow-600' : plan.name.toLowerCase().includes('silver') ? 'from-gray-300 to-gray-500' : 'from-red-500 to-orange-500'}`}></div>
                        
                        <div className="p-6 flex-1 flex flex-col">
                             <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                                    <p className="text-sm text-gray-500">{plan.durationInDays} Days Validity</p>
                                </div>
                                <div className="text-2xl font-bold text-white">
                                    ₹{plan.price}
                                </div>
                             </div>

                             <div className="flex-1 space-y-3 mb-6">
                                {(plan.features || []).map((feature, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                                        <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                             </div>

                             <div className="flex gap-2 mt-auto">
                                 <button 
                                    onClick={() => openModal(plan)}
                                    className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-lg transition-colors text-sm font-medium"
                                 >
                                    <Edit2 size={16} /> Edit
                                 </button>
                                 <button 
                                    onClick={() => handleDelete(plan.id)}
                                    className="flex items-center justify-center p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                                 >
                                    <Trash2 size={18} />
                                 </button>
                             </div>
                        </div>
                    </div>
                ))}

                {plans.length === 0 && (
                     <div className="col-span-full border-2 border-dashed border-white/10 rounded-xl p-12 flex flex-col items-center justify-center text-gray-500 gap-4">
                        <div className="p-4 bg-white/5 rounded-full">
                            <CreditCard size={40} className="opacity-30" />
                        </div>
                        <p className="text-lg">No subscription plans found.</p>
                        <button onClick={() => openModal()} className="text-red-500 font-bold hover:underline">Create your first plan</button>
                    </div>
                )}
            </div>
        )}

        {/* Create/Edit Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-lg border border-white/10 shadow-2xl overflow-hidden animate-scale-in">
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                        <h2 className="text-xl font-bold">{editingPlan ? 'Edit Plan' : 'Create New Plan'}</h2>
                        <button onClick={closeModal} className="p-1 hover:bg-white/10 rounded-full transition"><X size={20} /></button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-400 uppercase">Plan Name</label>
                                <input 
                                    name="name"
                                    value={formData.name} 
                                    onChange={handleInputChange}
                                    placeholder="e.g. Gold Premium"
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-red-500 outline-none transition"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-400 uppercase">Price (₹)</label>
                                <input 
                                    name="price"
                                    type="number"
                                    value={formData.price} 
                                    onChange={handleInputChange}
                                    placeholder="199"
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-red-500 outline-none transition"
                                    required
                                />
                            </div>
                        </div>

                         <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-400 uppercase">Duration (Days)</label>
                            <select 
                                name="durationInDays"
                                value={formData.durationInDays} 
                                onChange={handleInputChange}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-red-500 outline-none transition"
                            >
                                <option value="30">30 Days (Monthly)</option>
                                <option value="90">90 Days (Quarterly)</option>
                                <option value="365">365 Days (Yearly)</option>
                            </select>
                        </div>

                         <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase flex justify-between">
                                Features
                                <button type="button" onClick={addFeature} className="text-red-500 flex items-center gap-1 hover:underline"><Plus size={12}/> Add</button>
                            </label>
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                                {formData.features.map((feature, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input 
                                            value={feature}
                                            onChange={(e) => handleFeatureChange(index, e.target.value)}
                                            placeholder="e.g. Ad-free streaming"
                                            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-red-500 outline-none transition"
                                            required
                                        />
                                        {formData.features.length > 1 && (
                                            <button 
                                                type="button" 
                                                onClick={() => removeFeature(index)}
                                                className="p-2 text-gray-500 hover:text-red-500 hover:bg-white/5 rounded-lg transition"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button 
                                type="button" 
                                onClick={closeModal}
                                className="flex-1 py-3 rounded-xl font-bold bg-white/5 hover:bg-white/10 text-gray-300 transition"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="flex-1 py-3 rounded-xl font-bold bg-[#E50914] hover:bg-red-700 text-white shadow-lg shadow-red-900/20 transition"
                            >
                                {editingPlan ? 'Update Plan' : 'Create Plan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

export default Plans;
