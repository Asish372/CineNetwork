import React, { useState, useEffect } from 'react';
import { 
    Shield, Plus, Globe, Smartphone, Lock, 
    Trash2, Edit, Save, X, Search, CheckCircle, AlertTriangle
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Policies() {
    const { addToast } = useToast();
    const [policies, setPolicies] = useState([]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    
    // Editor State
    const [editingPolicy, setEditingPolicy] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'subscription',
        price: 0,
        drmEnabled: false,
        maxDevices: 5
    });

    // Default Policies
    const defaults = [
        { id: 1, name: 'Global SVOD Standard', type: 'subscription', drmEnabled: true, maxDevices: 5 },
        { id: 2, name: 'US Premium Rental', type: 'transactional', price: 3.99, drmEnabled: true, maxDevices: 5 },
        { id: 3, name: 'Free AVOD', type: 'free', drmEnabled: false, maxDevices: 1 }
    ];

    useEffect(() => {
        // Load from Session or Defaults
        const saved = sessionStorage.getItem('admin_policies');
        if (saved) {
            setPolicies(JSON.parse(saved));
        } else {
            setPolicies(defaults);
        }
    }, []);

    const saveToSession = (newPolicies) => {
        setPolicies(newPolicies);
        sessionStorage.setItem('admin_policies', JSON.stringify(newPolicies));
    };

    const openEditor = (policy = null) => {
        setEditingPolicy(policy);
        if (policy) {
            setFormData({ ...policy });
        } else {
            setFormData({
                name: '',
                type: 'subscription',
                price: 0,
                drmEnabled: false,
                maxDevices: 5
            });
        }
        setShowModal(true);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = () => {
        if (!formData.name) return addToast('Name is required', 'error');

        let newPolicies;
        if (editingPolicy) {
            // Update
            newPolicies = policies.map(p => p.id === editingPolicy.id ? { ...formData, id: p.id } : p);
            addToast('Policy Updated', 'success');
        } else {
            // Create
            const newId = Date.now();
            newPolicies = [...policies, { ...formData, id: newId }];
            addToast('Policy Created', 'success');
        }
        
        saveToSession(newPolicies);
        setShowModal(false);
    };

    const handleDelete = (id) => {
        if(confirm('Delete this policy?')) {
            const newPolicies = policies.filter(p => p.id !== id);
            saveToSession(newPolicies);
            addToast('Policy Deleted', 'success');
        }
    };

    const filteredPolicies = policies.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="max-w-7xl mx-auto pb-20 p-6 animate-fade-in">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3 tracking-tight">
                        <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
                             <Shield size={28} /> 
                        </div>
                        Policies & DRM
                    </h1>
                    <p className="text-gray-400 text-sm mt-2 ml-1">Manage content distribution rules and monetization strategies.</p>
                </div>
                
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative group flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search policies..."
                            className="w-full bg-[#1a1a1a]/80 backdrop-blur-md border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white outline-none focus:border-red-500/50 shadow-lg"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                
                    <button 
                        onClick={() => openEditor()}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#E50914] text-white rounded-xl hover:bg-red-700 transition-all font-bold shadow-lg shadow-red-900/20 whitespace-nowrap"
                    >
                        <Plus size={18} /> New Policy
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPolicies.map(policy => (
                    <div key={policy.id} className="bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 hover:border-white/20 transition-all group duration-300 hover:shadow-2xl hover:shadow-black/50 relative overflow-hidden">
                         
                         <div className="flex justify-between items-start mb-6">
                             <div>
                                 <h3 className="text-lg font-bold text-white mb-2">{policy.name}</h3>
                                 <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border tracking-wider ${
                                     policy.type === 'free' ? 'border-green-500/30 text-green-400 bg-green-500/10' :
                                     policy.type === 'transactional' ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10' :
                                     'border-blue-500/30 text-blue-400 bg-blue-500/10'
                                 }`}>
                                     {policy.type}
                                 </span>
                             </div>
                             <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-300">
                                 <button onClick={() => openEditor(policy)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"><Edit size={16} /></button>
                                 <button onClick={() => handleDelete(policy.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                             </div>
                         </div>

                         <div className="space-y-4 text-sm text-gray-400 bg-black/20 p-4 rounded-xl border border-white/5">
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Lock size={14} className={policy.drmEnabled ? "text-green-500" : "text-gray-600"} />
                                    <span>DRM Protection</span>
                                </div>
                                <span className={policy.drmEnabled ? "text-green-500 font-bold" : "text-gray-600"}>{policy.drmEnabled ? 'Active' : 'Off'}</span>
                             </div>
                             
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Smartphone size={14} />
                                    <span>Max Devices</span>
                                </div>
                                <span className="text-white font-bold">{policy.maxDevices}</span>
                             </div>

                             {policy.type === 'transactional' && (
                                 <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                    <span className="text-yellow-500 font-medium">Price</span>
                                    <div className="text-yellow-500 font-bold text-lg">
                                        ${policy.price}
                                    </div>
                                 </div>
                             )}
                         </div>
                    </div>
                ))}
            </div>

            {/* Modal Editor */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-[#1a1a1a] w-full max-w-md rounded-2xl border border-white/10 flex flex-col shadow-2xl scale-100 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-white/10">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                {editingPolicy ? <Edit size={20} className="text-[#E50914]" /> : <Plus size={20} className="text-[#E50914]" />}
                                {editingPolicy ? 'Edit Policy' : 'Create Policy'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Policy Name</label>
                                <input 
                                    name="name" 
                                    value={formData.name} 
                                    onChange={handleChange} 
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#E50914] focus:bg-white/5 transition-colors" 
                                    placeholder="e.g. Premium Subscription"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Monetization Type</label>
                                <div className="relative">
                                    <select 
                                        name="type" 
                                        value={formData.type} 
                                        onChange={handleChange} 
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white outline-none appearance-none focus:border-[#E50914] cursor-pointer"
                                    >
                                        <option value="subscription">Subscription (SVOD)</option>
                                        <option value="transactional">Transactional (TVOD)</option>
                                        <option value="free">Free (AVOD)</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                        <Globe size={16} />
                                    </div>
                                </div>
                            </div>

                            {formData.type === 'transactional' && (
                                <div className="animate-fade-in">
                                    <label className="block text-xs font-bold text-yellow-500 uppercase tracking-widest mb-2">Price (USD)</label>
                                    <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full bg-black/40 border border-yellow-500/30 rounded-lg p-3 text-white outline-none focus:border-yellow-500" />
                                </div>
                            )}

                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <label className="flex items-center gap-4 cursor-pointer group p-3 rounded-lg border border-transparent hover:border-white/10 hover:bg-white/5 transition-all">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.drmEnabled ? 'bg-red-600 border-red-600' : 'border-gray-600'}`}>
                                         {formData.drmEnabled && <CheckCircle size={14} className="text-white" />}
                                    </div>
                                    <input type="checkbox" name="drmEnabled" checked={formData.drmEnabled} onChange={handleChange} className="hidden" />
                                    <div className="flex-1">
                                        <span className="text-sm font-bold text-white block">Enable DRM Protection</span>
                                        <span className="text-xs text-gray-500">Encrypt content to prevent piracy.</span>
                                    </div>
                                    <Lock size={18} className={formData.drmEnabled ? "text-red-500" : "text-gray-600"} />
                                </label>
                                
                                <div>
                                    <div className="flex justify-between mb-2">
                                         <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Max Concurrent Devices</label>
                                         <span className="text-xs bg-white/10 px-2 rounded text-white">{formData.maxDevices}</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="1" 
                                        max="10" 
                                        name="maxDevices" 
                                        value={formData.maxDevices} 
                                        onChange={handleChange} 
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#E50914]" 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-black/20">
                            <button onClick={() => setShowModal(false)} className="px-6 py-2.5 rounded-lg font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
                            <button onClick={handleSave} className="px-6 py-2.5 bg-[#E50914] text-white rounded-lg font-bold flex items-center gap-2 hover:bg-red-700 shadow-lg shadow-red-900/20 transition-all">
                                <Save size={18} /> Save Policy
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
