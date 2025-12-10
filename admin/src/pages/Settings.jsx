import React, { useState, useEffect } from 'react';
import { 
    Settings as SettingsIcon, Save, Bell, Smartphone, 
    Monitor, Globe, Sliders, Image as ImageIcon, Plus, Trash2, Search, Upload, ChevronRight
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Settings() {
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState('genres');
    
    // Genre Management
    const [genres, setGenres] = useState([
        { name: 'Drama', image: 'https://images.unsplash.com/photo-1528659223381-897d286ec40c?auto=format&fit=crop&q=80&w=200' }, 
        { name: 'Action', image: 'https://images.unsplash.com/photo-1552083974-1863461911dd?auto=format&fit=crop&q=80&w=200' }, 
        { name: 'Series', image: null }, 
        { name: 'Odia Movies', image: null }, 
        { name: 'Comedy', image: null }
    ]);
    const [newGenre, setNewGenre] = useState('');

    const handleAddGenre = () => {
        if(!newGenre) return;
        if(genres.find(g => g.name.toLowerCase() === newGenre.toLowerCase())) {
            addToast('Category already exists', 'error');
            return;
        }
        setGenres([...genres, { name: newGenre, image: null }]);
        setNewGenre('');
        addToast('Category Added', 'success');
    };

    const removeGenre = (name) => {
        setGenres(genres.filter(gen => gen.name !== name));
        addToast('Category Removed', 'success');
    };

    const handleGenreImageUpload = (index, e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const mockUrl = URL.createObjectURL(file);
            
            const updatedGenres = [...genres];
            updatedGenres[index].image = mockUrl;
            setGenres(updatedGenres);
            
            addToast(`Image uploaded for ${updatedGenres[index].name}`, 'success');
        }
    };

    // Tabs
    const tabs = [
        { id: 'genres', label: 'Categories / Genres', icon: Sliders },
        { id: 'featured', label: 'Featured Banner', icon: ImageIcon },
        { id: 'general', label: 'App Settings', icon: SettingsIcon },
    ];

    return (
        <div className="max-w-6xl mx-auto pb-20 p-6 animate-fade-in">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
                            <SettingsIcon size={28} />
                        </div>
                        Settings
                    </h1>
                    <p className="text-gray-400 mt-2 ml-1">Configure global application settings and content categories.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 border ${
                            activeTab === tab.id 
                            ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-900/20' 
                            : 'bg-[#1a1a1a]/40 text-gray-400 border-white/5 hover:bg-white/5 hover:text-white'
                        }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Container */}
            <div className="bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-8 min-h-[500px] shadow-2xl relative overflow-hidden">
                {/* Decorative gradients */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] -z-10" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] -z-10" />

                
                {/* Genre Manager */}
                {activeTab === 'genres' && (
                    <div className="animate-fade-in max-w-5xl mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 border-b border-white/5 pb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">Content Categories</h3>
                                <p className="text-gray-400 text-sm max-w-lg">Manage genres and their display thumbnails for the app. These categories help users filter content.</p>
                            </div>
                            
                            <div className="flex w-full md:w-auto gap-2 bg-black/40 p-1.5 rounded-xl border border-white/10 focus-within:border-purple-500/50 transition-colors">
                                <div className="relative flex-1">
                                    <input 
                                        value={newGenre}
                                        onChange={(e) => setNewGenre(e.target.value)}
                                        placeholder="Add new category..."
                                        className="w-full bg-transparent border-none py-2.5 pl-4 pr-4 text-white placeholder-gray-500 focus:ring-0"
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddGenre()}
                                    />
                                </div>
                                <button onClick={handleAddGenre} className="px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold flex items-center gap-2 transition-colors shadow-lg shadow-purple-900/20">
                                    <Plus size={18} /> Add
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {genres.map((g, index) => (
                                <div key={index} className="group relative bg-black/40 border border-white/5 p-4 rounded-xl hover:border-white/20 hover:bg-white/[0.02] transition-all duration-300">
                                    <div className="flex items-center gap-4">
                                        {/* Image Upload Area */}
                                        <div className="relative w-16 h-16 shrink-0 bg-white/5 rounded-lg overflow-hidden flex items-center justify-center border border-white/5 group-hover:border-white/20 transition-colors">
                                            {g.image ? (
                                                <>
                                                    <img src={g.image} alt={g.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                        <Upload size={16} className="text-white" />
                                                    </div>
                                                </>
                                            ) : (
                                                <ImageIcon size={20} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
                                            )}
                                            
                                            <input 
                                                type="file" 
                                                className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                                                title="Upload Thumbnail"
                                                onChange={(e) => handleGenreImageUpload(index, e)}
                                            />
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-white font-bold truncate group-hover:text-purple-400 transition-colors">{g.name}</h4>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mt-1">
                                                {g.image ? <span className="text-green-500">Image Set</span> : 'No Image'}
                                            </p>
                                        </div>
                                        
                                        <button onClick={() => removeGenre(g.name)} className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Featured Manager - Placeholder */}
                {activeTab === 'featured' && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500 animate-fade-in">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                            <ImageIcon size={40} className="opacity-50" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Banner Management</h3>
                        <p className="max-w-md text-center mb-8">This module will allow you to customize promotional banners used throughout the application.</p>
                        <button className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors">
                            View Roadmap
                        </button>
                    </div>
                )}

                 {/* General - Placeholder */}
                 {activeTab === 'general' && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500 animate-fade-in">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                            <SettingsIcon size={40} className="opacity-50" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">General Configuration</h3>
                        <p className="max-w-md text-center">Global app settings such as language, region, and security policies are currently managed via the codebase config.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
