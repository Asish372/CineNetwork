import React, { useState, useEffect } from 'react';
import { Layout, Save, Plus, Trash2, GripVertical, Search, ArrowUp, ArrowDown, Edit2, X, Image as ImageIcon, Smartphone, Film, Layers } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import ContentPickerModal from '../components/ContentPickerModal';

const AppLayout = () => {
    const [activePage, setActivePage] = useState('home');
    const [layout, setLayout] = useState({ heroContent: [], sections: [] });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { addToast } = useToast();
    
    // Available Genres
    const GENRES = ['Action', 'Drama', 'Comedy', 'Thriller', 'Romance', 'Horror', 'Sci-Fi'];

    // Section Types
    const SECTION_TYPES = [
        { id: 'trending', label: 'Trending Now', isAuto: true },
        { id: 'new_arrivals', label: 'New Arrivals', isAuto: true },
        { id: 'genre_row', label: 'Genre Row', isAuto: true, requiresGenre: true },
        { id: 'curated', label: 'Curated Collection', isAuto: false },
        { id: 'continue_watching', label: 'Continue Watching', isAuto: true },
    ];
    
    // Search & Add States
    const [isContentModalOpen, setIsContentModalOpen] = useState(false);
    const [activeSectionId, setActiveSectionId] = useState(null);

    useEffect(() => {
        fetchLayout();
    }, [activePage]);

    const ensureArray = (data) => {
        if (Array.isArray(data)) return data;
        if (typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                return Array.isArray(parsed) ? parsed : [];
            } catch (e) {
                return [];
            }
        }
        return [];
    };

    const fetchLayout = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/layout/${activePage}`);
            setLayout({
                heroContent: ensureArray(res.data.heroContent),
                sections: ensureArray(res.data.sections).map(s => ({
                    ...s,
                    contentIds: ensureArray(s.contentIds)
                }))
            });
        } catch (error) {
            console.error(error);
            addToast('Failed to load layout', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.post(`/layout/${activePage}`, layout);
            addToast('Layout saved successfully', 'success');
        } catch (error) {
            console.error(error);
            addToast('Failed to save layout', 'error');
        } finally {
            setSaving(false);
        }
    };

    const removeContent = (sectionId, itemId) => {
        if (sectionId === 'hero') {
            setLayout(prev => ({
                ...prev,
                heroContent: prev.heroContent.filter(i => i.id !== itemId)
            }));
        } else {
            setLayout(prev => ({
                ...prev,
                sections: prev.sections.map(s => 
                    s.id === sectionId 
                        ? { ...s, contentIds: (s.contentIds || []).filter(i => i.id !== itemId) }
                        : s
                )
            }));
        }
    };

    const addSection = (type) => {
        const newSection = {
            id: Date.now().toString(),
            type: type.id,
            title: type.label,
            order: layout.sections.length,
            contentIds: [],
            genre: '', // For genre_row
        };
        setLayout(prev => ({
            ...prev,
            sections: [...prev.sections, newSection]
        }));
    };

    const removeSection = (id) => {
        setLayout(prev => ({
            ...prev,
            sections: prev.sections.filter(s => s.id !== id)
        }));
    };

    const moveSection = (index, direction) => {
        const newSections = [...layout.sections];
        if (direction === 'up' && index > 0) {
            [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
        }
        if (direction === 'down' && index < newSections.length - 1) {
            [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
        }
        setLayout(prev => ({ ...prev, sections: newSections }));
    };

    const updateSection = (id, field, value) => {
        setLayout(prev => ({
            ...prev,
            sections: prev.sections.map(s => s.id === id ? { ...s, [field]: value } : s)
        }));
    };

    const openContentPicker = (sectionId) => {
        setActiveSectionId(sectionId);
        setIsContentModalOpen(true);
    };

    const handleContentSelection = (items) => {
        if (!activeSectionId) return;

        if (activeSectionId === 'hero') {
            const existingIds = new Set(layout.heroContent.map(i => i.id));
            const newItems = items.filter(i => !existingIds.has(i.id));
            setLayout(prev => ({
                ...prev,
                heroContent: [...prev.heroContent, ...newItems]
            }));
        } else {
            setLayout(prev => ({
                ...prev,
                sections: prev.sections.map(s => {
                    if (s.id === activeSectionId) {
                         const existingIds = new Set((s.contentIds || []).map(i => i.id));
                         const newItems = items.filter(i => !existingIds.has(i.id));
                         return { ...s, contentIds: [...(s.contentIds || []), ...newItems] };
                    }
                    return s;
                })
            }));
        }
        setIsContentModalOpen(false);
        setActiveSectionId(null);
    };
    
    return (
        <div className="p-6 md:p-8 max-w-[1600px] mx-auto text-white pb-24 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 tracking-tight">
                        <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
                           <Layout size={28} />
                        </div>
                        App Layout Management
                    </h1>
                    <p className="text-gray-400 text-sm mt-2 ml-1">Customize the structure and content of your mobile application's main screens.</p>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-[#E50914] text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save size={20} />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <ContentPickerModal 
                isOpen={isContentModalOpen}
                onClose={() => setIsContentModalOpen(false)}
                onSelect={handleContentSelection}
                initialSelection={
                    activeSectionId === 'hero' 
                        ? layout.heroContent 
                        : (layout.sections.find(s => s.id === activeSectionId)?.contentIds || [])
                }
             />

            {/* Page Tabs */}
            <div className="flex bg-[#1a1a1a]/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/5 w-fit mb-8 shadow-inner">
                {['home', 'shorts'].map(page => (
                    <button
                        key={page}
                        onClick={() => setActivePage(page)}
                        className={`px-8 py-2.5 rounded-xl capitalize font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
                            activePage === page 
                            ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' 
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        {page === 'home' ? <Smartphone size={16} /> : <Film size={16} />}
                        {page} Screen
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                
                {/* LEFT COLUMN: BUILDER */}
                <div className="xl:col-span-8 space-y-8">
                    
                    {/* 1. HERO SLIDER */}
                    <div className="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-3 text-white">
                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                        <ImageIcon size={20} />
                                    </div>
                                    Hero Slider
                                </h2>
                                <p className="text-xs text-gray-400 mt-1 ml-11">Featured content displayed at the top of the {activePage} screen.</p>
                            </div>
                            <button 
                                onClick={() => openContentPicker('hero')}
                                className="text-xs font-bold px-4 py-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white border border-blue-500/20 hover:border-blue-500 transition-all flex items-center gap-2"
                            >
                                <Plus size={14} /> Add Content
                            </button>
                        </div>
                        
                        <div className="p-6 bg-gradient-to-b from-black/20 to-transparent">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {layout.heroContent.map((item, index) => (
                                    <div key={item.id} className="group relative bg-[#1a1a1a] rounded-xl overflow-hidden border border-white/10 aspect-video shadow-md hover:border-blue-500/50 transition-all">
                                        <div className="absolute top-2 left-2 z-10 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-mono border border-white/10">
                                            #{index + 1}
                                        </div>
                                        <img 
                                            src={item.thumbnailUrl || item.posterUrl} 
                                            alt={item.title} 
                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-3 pt-8">
                                            <p className="text-xs font-bold truncate text-white">{item.title}</p>
                                        </div>
                                        <button 
                                            onClick={() => removeContent('hero', item.id)}
                                            className="absolute top-2 right-2 p-1.5 bg-red-500/80 backdrop-blur-sm rounded-lg text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 scale-90 group-hover:scale-100"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                                {layout.heroContent.length === 0 && (
                                    <div className="col-span-full border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 gap-3 min-h-[160px]">
                                        <ImageIcon size={32} className="opacity-20" />
                                        <p className="text-sm">Slider is empty.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 2. SECTIONS */}
                    <div className="space-y-6">
                         <div className="flex justify-between items-center px-2">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <Layers className="text-gray-500" /> Content Sections
                            </h2>
                             <div className="relative group">
                                <button className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-200 transition shadow-lg shadow-white/5">
                                    <Plus size={18} /> Add Section
                                </button>
                                <div className="absolute right-0 top-full mt-2 w-64 bg-[#1a1a1a] backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl hidden group-hover:block z-20 p-2 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="text-xs font-bold text-gray-500 px-3 py-2 uppercase tracking-wider">Select Type</div>
                                    {SECTION_TYPES.map(type => (
                                        <button
                                            key={type.id}
                                            onClick={() => addSection(type)}
                                            className="w-full text-left px-3 py-3 hover:bg-white/10 rounded-lg flex flex-col gap-0.5 transition-colors group/item"
                                        >
                                            <span className="font-bold text-white group-hover/item:text-red-500 transition-colors">{type.label}</span>
                                            <span className="text-[10px] text-gray-500">{type.isAuto ? 'Automatic • Dynamic Content' : 'Manual • Hand-picked'}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                        {layout.sections.map((section, index) => (
                            <div key={section.id} className="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden transition-all hover:border-white/10 group shadow-lg">
                                {/* Section Header */}
                                <div className="bg-black/20 p-4 pl-2 flex items-center gap-4 border-b border-white/5">
                                     <div className="flex flex-col gap-1 text-gray-600 w-8 items-center">
                                        <button onClick={() => moveSection(index, 'up')} disabled={index === 0} className="p-1 hover:text-white hover:bg-white/5 rounded disabled:opacity-20 transition-colors"><ArrowUp size={16}/></button>
                                        <div className="h-0.5 w-4 bg-white/5 rounded-full"></div>
                                        <button onClick={() => moveSection(index, 'down')} disabled={index === layout.sections.length-1} className="p-1 hover:text-white hover:bg-white/5 rounded disabled:opacity-20 transition-colors"><ArrowDown size={16}/></button>
                                    </div>
                                    
                                    <div className="flex-1 py-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${
                                                section.isAuto ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'
                                            }`}>
                                                {SECTION_TYPES.find(t => t.id === section.type)?.label || section.type}
                                            </span>
                                            {section.type === 'genre_row' && (
                                                <select 
                                                    value={section.genre || ''}
                                                    onChange={(e) => updateSection(section.id, 'genre', e.target.value)}
                                                    className="bg-black/40 border border-white/20 rounded px-2 py-0.5 text-xs text-white outline-none focus:border-red-500"
                                                >
                                                    <option value="">Select Genre</option>
                                                    {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                                                </select>
                                            )}
                                        </div>
                                        <input 
                                            type="text" 
                                            value={section.title}
                                            onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                                            className="bg-transparent text-xl font-bold outline-none placeholder-gray-600 w-full text-white border-b border-transparent focus:border-white/20 pb-1 transition-colors"
                                            placeholder="Section Title"
                                        />
                                    </div>

                                    <div className="flex items-center gap-2 pr-2">
                                         <button 
                                            onClick={() => openContentPicker(section.id)}
                                            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all border border-white/5 hover:border-white/20"
                                            title="Add Content"
                                        >
                                            <Plus size={18} />
                                        </button>
                                        
                                        <button onClick={() => removeSection(section.id)} className="p-2.5 text-gray-500 hover:text-red-500 bg-transparent hover:bg-red-500/10 rounded-xl transition-all">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Content Strip */}
                                <div className="p-5 bg-black/10">
                                     <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent items-center min-h-[140px]">
                                        {(section.contentIds || []).map(item => (
                                            <div key={item.id} className="relative group/card shrink-0 w-28 animate-fade-in cursor-grab active:cursor-grabbing">
                                                <img src={item.posterUrl} className="w-full aspect-[2/3] object-cover rounded-lg border border-white/5 shadow-lg group-hover/card:shadow-xl transition-all" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity rounded-lg" />
                                                <button 
                                                    onClick={() => removeContent(section.id, item.id)}
                                                    className="absolute top-1 right-1 bg-red-600 rounded-md p-1 text-white opacity-0 group-hover/card:opacity-100 transition hover:bg-red-700 shadow-lg"
                                                >
                                                    <X size={12} />
                                                </button>
                                                <p className="text-[10px] truncate mt-2 text-gray-400 font-medium text-center">{item.title}</p>
                                            </div>
                                        ))}
                                        
                                        {/* Add Button Tile */}
                                        <button 
                                            onClick={() => openContentPicker(section.id)}
                                            className="shrink-0 w-28 aspect-[2/3] rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-gray-500 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all group/add"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover/add:scale-110 transition-transform">
                                                <Plus size={20} />
                                            </div>
                                            <span className="text-xs font-bold">Add Item</span>
                                        </button>
                                    </div>
                                </div>

                            </div>
                        ))}
                        </div>

                        {layout.sections.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                     <Layers size={32} className="opacity-30" />
                                </div>
                                <h3 className="text-gray-300 font-bold text-xl mb-2">Start Building Your Page</h3>
                                <p className="text-gray-500 text-sm mb-8 max-w-sm text-center">Add sections to organize your content. You can mix automatic feeds with manually curated collections.</p>
                                <button onClick={() => addSection(SECTION_TYPES[0])} className="text-black bg-white px-6 py-2.5 rounded-lg font-bold hover:bg-gray-200 transition">
                                    Add First Section
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: PREVIEW / TIPS */}
                <div className="xl:col-span-4 space-y-6">
                    <div className="bg-[#1a1a1a]/80 backdrop-blur-xl p-6 rounded-2xl border border-white/5 sticky top-24 shadow-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                                <Smartphone size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-white">Live Preview</h3>
                        </div>

                        <div className="relative mx-auto border-[8px] border-black rounded-[2.5rem] h-[600px] w-[300px] bg-black shadow-2xl overflow-hidden ring-1 ring-white/10">
                             {/* Mobile Status Bar Mock */}
                             <div className="absolute top-0 inset-x-0 h-6 bg-black z-20 flex justify-between px-4 items-center">
                                 <span className="text-[10px] text-white font-bold">9:41</span>
                                 <div className="flex gap-1">
                                     <div className="w-3 h-3 bg-white/20 rounded-full"></div>
                                     <div className="w-3 h-3 bg-white/20 rounded-full"></div>
                                 </div>
                             </div>

                             {/* Content Area */}
                             <div className="h-full overflow-y-auto bg-[#0a0a0a] scrollbar-hide pt-0">
                                 {/* Hero */}
                                 <div className="w-full aspect-[2/3] relative bg-gray-900 mb-6">
                                    {layout.heroContent[0] && (
                                        <>
                                            <img src={layout.heroContent[0].posterUrl} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>
                                            <div className="absolute bottom-4 left-4 right-4 text-center">
                                                <div className="text-xs font-bold text-white mb-2">{layout.heroContent[0].title}</div>
                                                <div className="flex justify-center gap-2">
                                                    <div className="bg-white text-black text-[10px] font-bold px-3 py-1.5 rounded">Play</div>
                                                    <div className="bg-white/20 text-white text-[10px] font-bold px-3 py-1.5 rounded">+ List</div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                 </div>

                                 {/* Sections */}
                                 <div className="space-y-6 pb-20 px-4">
                                     {layout.sections.map(s => (
                                         <div key={s.id} className="space-y-2">
                                             <div className="text-xs font-bold text-white">{s.title}</div>
                                             <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                                                 {(s.contentIds || []).length > 0 ? (
                                                     (s.contentIds || []).slice(0, 4).map(i => (
                                                         <div key={i.id} className="w-24 shrink-0 aspect-[2/3] bg-gray-800 rounded overflow-hidden">
                                                             <img src={i.posterUrl} className="w-full h-full object-cover" />
                                                         </div>
                                                     ))
                                                 ) : (
                                                     [1,2,3].map(sk => <div key={sk} className="w-24 shrink-0 aspect-[2/3] bg-white/5 rounded animate-pulse"></div>)
                                                 )}
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                             </div>

                             {/* Bottom Nav Mock */}
                             <div className="absolute bottom-0 inset-x-0 h-16 bg-black/90 backdrop-blur border-t border-white/5 z-20 flex justify-around items-center px-2">
                                 <div className="text-red-500 flex flex-col items-center gap-1"><Smartphone size={16} /><span className="text-[8px]">Home</span></div>
                                 <div className="text-gray-500 flex flex-col items-center gap-1"><Search size={16} /><span className="text-[8px]">Search</span></div>
                                 <div className="text-gray-500 flex flex-col items-center gap-1"><Film size={16} /><span className="text-[8px]">Shorts</span></div>
                             </div>
                        </div>
                        
                        <p className="text-center text-xs text-gray-500 mt-6 font-mono">Real-time Layout Preview</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AppLayout;
