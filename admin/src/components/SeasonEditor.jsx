import React, { useState, useEffect } from 'react';
import { X, Save, Upload } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function SeasonEditor({ season, contentId, onClose, onSave }) {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        seasonNumber: '',
        title: '',
        summary: '',
        releaseDate: '',
        posterUrl: '',
        status: 'draft'
    });

    useEffect(() => {
        if (season) {
            setFormData({
                ...season,
                releaseDate: season.releaseDate ? season.releaseDate.split('T')[0] : '', // Format YYYY-MM-DD
            });
        }
    }, [season]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { ...formData, contentId };
            let res;
            if (season?.id) {
                res = await api.put(`/series/seasons/${season.id}`, payload);
                addToast('Season updated!', 'success');
            } else {
                // If creating completely new (though we usually quick-create in parent)
                // This path might be used later
                res = await api.post(`/series/${contentId}/seasons`, payload);
                addToast('Season created!', 'success');
            }
            onSave(res.data);
            onClose();
        } catch (error) {
            console.error(error);
            addToast('Failed to save season', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-[#1a1a1a] w-full max-w-2xl rounded-xl border border-white/10 flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white">
                        {season ? `Edit ${season.title}` : 'New Season'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Season Number</label>
                            <input 
                                type="number" name="seasonNumber"
                                value={formData.seasonNumber} onChange={handleChange}
                                className="w-full bg-black/40 border border-white/10 rounded p-3 text-white focus:border-[#E50914] outline-none"
                            />
                        </div>
                        <div>
                             <label className="block text-sm text-gray-400 mb-1">Status</label>
                             <select 
                                name="status"
                                value={formData.status} onChange={handleChange}
                                className="w-full bg-black/40 border border-white/10 rounded p-3 text-white focus:border-[#E50914] outline-none"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Title</label>
                        <input 
                            type="text" name="title"
                            value={formData.title} onChange={handleChange}
                            className="w-full bg-black/40 border border-white/10 rounded p-3 text-white focus:border-[#E50914] outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                             <label className="block text-sm text-gray-400 mb-1">Poster URL</label>
                            <div className="flex gap-2">
                                <input 
                                    type="text" name="posterUrl"
                                    value={formData.posterUrl} onChange={handleChange}
                                    placeholder="https://"
                                    className="flex-1 bg-black/40 border border-white/10 rounded p-3 text-white focus:border-[#E50914] outline-none"
                                />
                                <button type="button" className="p-3 bg-white/10 hover:bg-white/20 rounded text-gray-400 hover:text-white">
                                    <Upload size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 rounded font-medium text-gray-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={loading}
                        className="px-6 py-2 bg-[#E50914] hover:bg-[#b2070f] text-white rounded font-medium transition-colors flex items-center gap-2"
                    >
                        {loading ? 'Saving...' : <><Save size={18} /> Save Season</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
