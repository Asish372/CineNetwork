import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Save, ArrowLeft, Image, FileText, BarChart2, Globe, 
    Shield, Layers, UploadCloud, Copy, Trash2, Plus, Users, 
    Calendar, Tag, Film, MonitorPlay, ArrowRight
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import SeriesManager from '../components/SeriesManager';
import MediaManager from '../components/MediaManager';

export default function ContentDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const isNew = id === 'new';
    
    const [loading, setLoading] = useState(!isNew);
    const [activeTab, setActiveTab] = useState('metadata');
    
    // Ingest State
    const [ingestStep, setIngestStep] = useState(1); // 1. Source, 2. Options, 3. Progress
    const [sourceFile, setSourceFile] = useState(null);
    const [sourceUrl, setSourceUrl] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [jobStatus, setJobStatus] = useState('idle'); // idle, uploading, transcode_queued, processing, complete, error
    const [ingestOptions, setIngestOptions] = useState({
        preset: 'hls-adaptive-1080p',
        proRes: false,
        hdr: false,
        drm: true,
        generateSprites: true
    });

    // Initial Form State
    const [formData, setFormData] = useState({
        title: '',
        primaryTitleMap: {}, // { en: '', es: '' }
        type: 'movie',
        status: 'draft',
        shortDescription: '',
        description: '', // long description
        thumbnailUrl: '',
        posterUrl: '',
        spriteUrl: '',
        videoUrl: '',
        releaseDate: '',
        rating: 0,
        studio: '',
        ageRating: 'PG-13',
        visibility: 'public',
        isVip: false,
        seasonCount: 0,
        episodeCount: 0,
        
        // Arrays / JSON
        genres: [], 
        tags: [],
        countries: [],
        languages: [],
        cast: [], // [{ name, role, photoUrl }]
        crew: [], // [{ name, role }]
        collections: []
    });

    useEffect(() => {
        if (!isNew) {
            fetchContent();
        }
    }, [id]);

    // Helper: Ensure value is an array
    const ensureArray = (val) => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        try {
            // Try parsing if string
            if (typeof val === 'string') {
                const parsed = JSON.parse(val);
                return Array.isArray(parsed) ? parsed : [];
            }
        } catch (e) {
            console.warn('Failed to parse array:', val);
        }
        return [];
    };

    const fetchContent = async () => {
        try {
            const res = await api.get(`/content/${id}`);
            // Ensure array/obj defaults if null
            setFormData(prev => ({
                ...prev,
                ...res.data,
                cast: ensureArray(res.data.cast),
                crew: ensureArray(res.data.crew),
                tags: ensureArray(res.data.tags),
                countries: ensureArray(res.data.countries),
                maturityFlags: ensureArray(res.data.maturityFlags),
                collections: ensureArray(res.data.collections),
                languages: ensureArray(res.data.languages),
                externalIds: res.data.externalIds || { imdb: '', tmdb: '' },
                primaryTitleMap: res.data.primaryTitleMap || {},
                genres: res.data.genre ? [res.data.genre] : ensureArray(res.data.genres)
            }));
        } catch (error) {
            console.error(error);
            addToast('Error loading content', 'error');
            navigate('/catalog');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Helper for Array inputs (comma separated)
    const handleArrayInput = (e, field) => {
        const val = e.target.value;
        setFormData(prev => ({
            ...prev,
            [field]: val.split(',').map(s => s.trim())
        }));
    };

    // Helper for Nested Object inputs (External IDs)
    const handleNestedChange = (e, parent, key) => {
        const val = e.target.value;
        setFormData(prev => ({
            ...prev,
            [parent]: { ...prev[parent], [key]: val }
        }));
    };

    // Helper for List of Objects (Cast/Crew)
    const addListItem = (field, itemTemplate) => {
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], itemTemplate]
        }));
    };

    const updateListItem = (field, index, key, value) => {
        const newList = [...formData[field]];
        newList[index][key] = value;
        setFormData(prev => ({ ...prev, [field]: newList }));
    };

    const removeListItem = (field, index) => {
        const newList = [...formData[field]];
        newList.splice(index, 1);
        setFormData(prev => ({ ...prev, [field]: newList }));
    };

    const handleSubmit = async (e) => {
        if(e) e.preventDefault();
        try {
            const payload = {
                ...formData,
                genre: formData.genres?.[0] || formData.genre // Map array back to single string for backend
            };

            if (isNew) {
                await api.post('/content', payload);
                addToast('Content created', 'success');
            } else {
                await api.put(`/content/${id}`, payload);
                addToast('Content updated', 'success');
            }
            if(isNew) navigate('/catalog');
        } catch (error) {
            console.error(error);
            addToast('Failed to save', 'error');
        }
    };

    const handleDelete = async () => {
        if(!confirm('Are you sure you want to delete this title?')) return;
        try {
            await api.delete(`/content/${id}`);
            addToast('Content deleted', 'success');
            navigate('/catalog');
        } catch (error) {
            addToast('Delete failed', 'error');
        }
    };

    const handleDuplicate = async () => {
        try {
            const { id: _, createdAt, updatedAt, ...copyData } = formData;
            await api.post('/content', { ...copyData, title: `${formData.title} (Copy)`, status: 'draft' });
            addToast('Content duplicated', 'success');
            navigate('/catalog');
        } catch (error) {
            addToast('Duplicate failed', 'error');
        }
    };

    // --- Ingest Handlers ---

    const handleIngestFileSelect = (e) => {
        if(e.target.files && e.target.files[0]) {
            setSourceFile(e.target.files[0]);
            setSourceUrl(''); // clear URL if file selected
        }
    };

    const startIngest = () => {
        if(!sourceFile && !sourceUrl) return addToast('Please select a video file or enter a URL', 'error');
        
        setIngestStep(3); // Go to progress
        setJobStatus('uploading');
        setUploadProgress(0);

        // 1. Simulate Upload
        let progress = 0;
        const uploadInterval = setInterval(() => {
            progress += 5;
            setUploadProgress(progress);
            if(progress >= 100) {
                clearInterval(uploadInterval);
                setJobStatus('transcode_queued');
                startTranscodeSimulation();
            }
        }, 200);
    };

    const startTranscodeSimulation = () => {
        setTimeout(() => {
            setJobStatus('processing');
            // Mock completion after 3 seconds
            setTimeout(() => {
                setJobStatus('complete');
                addToast('Ingest Complete! Video is ready.', 'success');
                // Update form with mock URLs
                setFormData(prev => ({
                    ...prev,
                    videoUrl: 'https://cdn.cinenetwork.com/hls/master.m3u8',
                    spriteUrl: 'https://cdn.cinenetwork.com/sprites/sheet.jpg',
                    duration: 7240 // mock duration
                }));
            }, 3000);
        }, 1000);
    };

    const resetIngest = () => {
        setIngestStep(1);
        setJobStatus('idle');
        setSourceFile(null);
        setSourceUrl('');
        setUploadProgress(0);
    };

    const tabs = [
        { id: 'metadata', label: 'Metadata', icon: FileText },
        { id: 'media', label: 'Media & Assets', icon: Image },
        ...(['series', 'short'].includes(formData.type) ? [{ id: 'seasons', label: 'Seasons & Episodes', icon: Layers }] : []),
        { id: 'ingest', label: 'Ingest & Renditions', icon: MonitorPlay },
    ];

    const handleNext = () => {
        const currentIndex = tabs.findIndex(t => t.id === activeTab);
        if (currentIndex < tabs.length - 1) {
            setActiveTab(tabs[currentIndex + 1].id);
            window.scrollTo(0, 0);
        } else {
            navigate('/catalog');
        }
    };

    const handleBack = () => {
        const currentIndex = tabs.findIndex(t => t.id === activeTab);
        if (currentIndex > 0) {
            setActiveTab(tabs[currentIndex - 1].id);
            window.scrollTo(0, 0);
        }
    };

    if (loading) return <div className="p-8 text-center text-white">Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-[#0a0a0a] z-10 py-4 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/catalog')} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                            {isNew ? 'New Title' : formData.title}
                            {!isNew && <span className={`text-xs px-2 py-0.5 rounded uppercase ${formData.status === 'published' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>{formData.status}</span>}
                        </h1>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">{isNew ? 'Draft' : `ID: ${formData.id}`}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {!isNew && (
                        <>
                            <button onClick={handleDelete} className="p-2 hover:bg-white/10 text-gray-400 hover:text-red-500 rounded transition-colors" title="Delete">
                                <Trash2 size={18} />
                            </button>
                            <button onClick={handleDuplicate} className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded transition-colors" title="Duplicate">
                                <Copy size={18} />
                            </button>
                            <div className="h-6 w-px bg-white/10 mx-2"></div>
                        </>
                    )}
                    <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors">Preview</button>
                    <button onClick={handleSubmit} className="flex items-center gap-2 px-6 py-2 bg-[#E50914] hover:bg-red-700 text-white rounded-lg font-bold shadow-lg shadow-red-900/20 transition-all">
                        <Save size={18} />
                        <span>{isNew ? 'Create' : 'Save Changes'}</span>
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-white/10 mb-8 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                            ${activeTab === tab.id 
                                ? 'border-[#E50914] text-[#E50914]' 
                                : 'border-transparent text-gray-400 hover:text-white hover:border-white/20'}
                        `}
                    >
                        <tab.icon size={16} />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="bg-[#1a1a1a] rounded-xl border border-white/10 p-6 md:p-8 animate-fade-in min-h-[60vh]">
                
                {activeTab === 'metadata' && (
                    <form onSubmit={(e) => e.preventDefault()} className="space-y-10">
                        {/* 1. Core Identity */}
                        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="col-span-2 space-y-6">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Film size={20} className="text-[#E50914]" /> Core Identity
                                </h3>
                                
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Primary Title <span className="text-red-500">*</span></label>
                                    <input name="title" value={formData.title} onChange={handleChange} required className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none text-lg font-medium" placeholder="Official Title" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                     <div>
                                        <label className="block text-sm text-gray-400 mb-1">Short Description</label>
                                        <textarea name="shortDescription" value={formData.shortDescription || ''} onChange={handleChange} rows={2} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none" placeholder="Catchy one-liner..." />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Long Description</label>
                                        <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={4} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-red-500 outline-none" placeholder="Full synopsis..." />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6 bg-black/20 p-6 rounded-xl border border-white/5 h-fit">
                                <h4 className="text-sm font-bold text-gray-300">Quick Settings</h4>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Type</label>
                                        <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white outline-none">
                                            <option value="movie">Movie</option>
                                            <option value="series">Series</option>
                                            <option value="short">Short</option>
                                        </select>
                                    </div>
                                    
                                    {['series', 'short'].includes(formData.type) && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Seasons</label>
                                                <input 
                                                    type="number" 
                                                    name="seasonCount" 
                                                    value={formData.seasonCount || 0} 
                                                    onChange={handleChange} 
                                                    className="w-full bg-black/50 border border-white/10 rounded p-2 text-white outline-none" 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Episodes</label>
                                                <input 
                                                    type="number" 
                                                    name="episodeCount" 
                                                    value={formData.episodeCount || 0} 
                                                    onChange={handleChange} 
                                                    className="w-full bg-black/50 border border-white/10 rounded p-2 text-white outline-none" 
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Genre</label>
                                        <select 
                                            name="genre" 
                                            value={formData.genres[0] || ''} 
                                            onChange={(e) => setFormData(prev => ({ ...prev, genres: [e.target.value] }))} 
                                            className="w-full bg-black/50 border border-white/10 rounded p-2 text-white outline-none"
                                        >
                                            <option value="">Select Genre...</option>
                                            <option value="Drama">Drama</option>
                                            <option value="Action">Action</option>
                                            <option value="Series">Series</option>
                                            <option value="Odia Movies">Odia Movies</option>
                                            <option value="Comedy">Comedy</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Language</label>
                                        <select 
                                            name="language" 
                                            value={formData.languages[0] || 'Odia'} 
                                            onChange={(e) => setFormData(prev => ({ ...prev, languages: [e.target.value] }))} 
                                            className="w-full bg-black/50 border border-white/10 rounded p-2 text-white outline-none"
                                        >
                                            <option value="Odia">Odia</option>
                                            <option value="Hindi">Hindi</option>
                                            <option value="Sambalpuri">Sambalpuri</option>
                                            <option value="English">English</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Status</label>
                                        <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white outline-none">
                                            <option value="draft">Draft</option>
                                            <option value="published">Published</option>
                                            <option value="archived">Archived</option>
                                        </select>
                                    </div>

                                    {/* Fake Stats Controls */}
                                    <div className="pt-4 border-t border-white/5 space-y-3">
                                        <h5 className="text-xs font-bold text-gray-300">Engagement Stats</h5>
                                        
                                        <label className="flex items-center justify-between cursor-pointer">
                                            <span className="text-xs text-gray-400">Show Fake Stats</span>
                                            <div className="relative inline-block w-8 h-4 align-middle select-none transition duration-200 ease-in">
                                                <input 
                                                    type="checkbox" 
                                                    name="showFakeStats" 
                                                    checked={formData.showFakeStats || false} 
                                                    onChange={handleChange} 
                                                    className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                                />
                                                <label className={`toggle-label block overflow-hidden h-4 rounded-full cursor-pointer ${formData.showFakeStats ? 'bg-red-500' : 'bg-gray-700'}`}></label>
                                            </div>
                                        </label>

                                        {formData.showFakeStats && (
                                            <div className="grid grid-cols-2 gap-2 animate-fade-in">
                                                <div>
                                                    <label className="block text-[10px] text-gray-500 mb-1">Fake Views</label>
                                                    <input 
                                                        type="number" 
                                                        name="fakeViews" 
                                                        value={formData.fakeViews || 0} 
                                                        onChange={handleChange} 
                                                        className="w-full bg-black/50 border border-white/10 rounded p-1 text-white text-xs outline-none" 
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] text-gray-500 mb-1">Fake Likes</label>
                                                    <input 
                                                        type="number" 
                                                        name="fakeLikes" 
                                                        value={formData.fakeLikes || 0} 
                                                        onChange={handleChange} 
                                                        className="w-full bg-black/50 border border-white/10 rounded p-1 text-white text-xs outline-none" 
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <hr className="border-white/5" />

                        {/* 2. Cast & Crew */}
                        <section className="space-y-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Users size={20} className="text-[#E50914]" /> Cast & Crew
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Cast List */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <label className="text-sm text-gray-400">Cast Members</label>
                                        <button onClick={() => addListItem('cast', { name: '', role: '' })} className="text-xs flex items-center gap-1 text-[#E50914] hover:underline"><Plus size={12} /> Add Actor</button>
                                    </div>
                                    <div className="space-y-2">
                                        {formData.cast.map((member, idx) => (
                                            <div key={idx} className="flex gap-2">
                                                <input 
                                                    placeholder="Actor Name" 
                                                    value={member.name} 
                                                    onChange={(e) => updateListItem('cast', idx, 'name', e.target.value)}
                                                    className="flex-1 bg-black/50 border border-white/10 rounded p-2 text-sm text-white outline-none"
                                                />
                                                <input 
                                                    placeholder="Role (e.g. Hero)" 
                                                    value={member.role} 
                                                    onChange={(e) => updateListItem('cast', idx, 'role', e.target.value)}
                                                    className="flex-1 bg-black/50 border border-white/10 rounded p-2 text-sm text-white outline-none"
                                                />
                                                <button onClick={() => removeListItem('cast', idx)} className="p-2 text-gray-500 hover:text-red-500"><Trash2 size={14} /></button>
                                            </div>
                                        ))}
                                        {formData.cast.length === 0 && <p className="text-xs text-gray-600 italic">No cast added.</p>}
                                    </div>
                                </div>

                                {/* Crew List */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <label className="text-sm text-gray-400">Crew Members</label>
                                        <button onClick={() => addListItem('crew', { name: '', role: '' })} className="text-xs flex items-center gap-1 text-[#E50914] hover:underline"><Plus size={12} /> Add Crew</button>
                                    </div>
                                     <div className="space-y-2">
                                        {formData.crew.map((member, idx) => (
                                            <div key={idx} className="flex gap-2">
                                                <input 
                                                    placeholder="Name" 
                                                    value={member.name} 
                                                    onChange={(e) => updateListItem('crew', idx, 'name', e.target.value)}
                                                    className="flex-1 bg-black/50 border border-white/10 rounded p-2 text-sm text-white outline-none"
                                                />
                                                <input 
                                                    placeholder="Role (e.g. Director)" 
                                                    value={member.role} 
                                                    onChange={(e) => updateListItem('crew', idx, 'role', e.target.value)}
                                                    className="flex-1 bg-black/50 border border-white/10 rounded p-2 text-sm text-white outline-none"
                                                />
                                                 <button onClick={() => removeListItem('crew', idx)} className="p-2 text-gray-500 hover:text-red-500"><Trash2 size={14} /></button>
                                            </div>
                                        ))}
                                         {formData.crew.length === 0 && <p className="text-xs text-gray-600 italic">No crew added.</p>}
                                    </div>
                                </div>
                            </div>
                        </section>


                    </form>
                )}

                {activeTab === 'media' && (
                    <MediaManager 
                        content={formData} 
                        onUpdate={(newData) => setFormData(prev => ({ ...prev, ...newData }))} 
                    />
                )}

                {activeTab === 'seasons' && (
                    <SeriesManager seriesId={id} />
                )}

                {activeTab === 'policies' && (
                    <div className="space-y-8">
                        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
                             <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <Shield size={20} className="text-[#E50914]" /> Content Policy
                            </h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Attached Policy</label>
                                    <select className="w-full bg-black/40 border border-white/10 rounded p-3 text-white outline-none">
                                        <option value="">Select a Policy...</option>
                                        <option value="1">Global SVOD Standard</option>
                                        <option value="2">US Premium Rental</option>
                                        <option value="3">Free AVOD</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-2">Determines pricing, DRM protection, and regional availability.</p>
                                </div>
                                <div className="space-y-4">
                                     <div className="p-4 bg-white/5 rounded border border-white/5">
                                        <h4 className="text-sm font-bold text-white mb-2">Current Rules</h4>
                                        <ul className="text-xs text-gray-400 space-y-1">
                                            <li>• Type: Subscription</li>
                                            <li>• DRM: Widevine Enabled</li>
                                            <li>• Regions: Global</li>
                                        </ul>
                                     </div>
                                </div>
                             </div>
                        </div>
                    </div>
                )}
                
                {activeTab === 'ingest' && (
                    <div className="space-y-8 animate-fade-in">
                         {/* Header Section */}
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <MonitorPlay size={20} className="text-[#E50914]" /> Video Ingest & Processing
                                </h3>
                                <p className="text-sm text-gray-400 mt-1">Upload mezzanine files, configure ABR recipes, and manage DRM.</p>
                            </div>
                            <div className="text-right">
                                <div className={`text-sm font-medium ${jobStatus === 'complete' ? 'text-green-500' : jobStatus === 'processing' ? 'text-blue-500' : 'text-gray-500'}`}>
                                    Status: {jobStatus.toUpperCase().replace('_', ' ')}
                                </div>
                                {jobStatus !== 'idle' && (
                                    <button onClick={resetIngest} className="text-xs text-red-500 hover:underline mt-1">Reset Workflow</button>
                                )}
                            </div>
                        </div>

                        {/* Workflow Stepper */}
                         <div className="bg-[#111] border border-white/10 rounded-xl p-6">
                            {/* Step 1: Source Selection */}
                            {ingestStep === 1 && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="bg-black/40 border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-white/20 transition-colors group relative">
                                            <UploadCloud size={48} className="text-gray-600 group-hover:text-white mb-4 transition-colors" />
                                            <h4 className="text-white font-medium mb-1">Upload Video File</h4>
                                            <p className="text-xs text-gray-500 mb-4">Drag & drop or browse (MP4, MOV, MKV)</p>
                                            <label className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded cursor-pointer transition-colors text-sm">
                                                Browse Files
                                                <input type="file" className="hidden" accept="video/*" onChange={handleIngestFileSelect} />
                                            </label>
                                            {sourceFile && (
                                                <div className="mt-4 p-2 bg-green-500/10 border border-green-500/20 text-green-500 rounded text-xs flex items-center gap-2">
                                                    <CheckCircle size={12} /> {sourceFile.name} ({(sourceFile.size / (1024*1024)).toFixed(2)} MB)
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col justify-center space-y-4">
                                            <div className="text-center text-gray-500 text-xs uppercase tracking-widest font-bold">OR</div>
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-2">Import from URL (S3 / FTP)</label>
                                                <input 
                                                    value={sourceUrl}
                                                    onChange={(e) => setSourceUrl(e.target.value)}
                                                    placeholder="s3://bucket/path/to/video.mp4"
                                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-[#E50914] outline-none font-mono text-sm"
                                                />
                                            </div>
                                            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-300">
                                                <p className="font-bold mb-1">Processing Policy</p>
                                                <ul className="list-disc list-inside opacity-80">
                                                    <li>All uploads are automatically transcoded.</li>
                                                    <li>Non-compliant specs will be rejected.</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    
                                     <div className="flex justify-end pt-4 border-t border-white/5">
                                        <button 
                                            onClick={() => setIngestStep(2)}
                                            disabled={!sourceFile && !sourceUrl}
                                            className="px-6 py-2 bg-white text-black font-bold rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Next: Configuration
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Options */}
                            {ingestStep === 2 && (
                                <div className="space-y-6">
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <h4 className="font-bold text-white text-sm">Transcoding Profile</h4>
                                            <div className="space-y-2">
                                                {['hls-adaptive-1080p', 'hls-adaptive-4k', 'mp4-download-only'].map(opt => (
                                                    <label key={opt} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${ingestOptions.preset === opt ? 'bg-[#E50914]/10 border-[#E50914]' : 'bg-black/20 border-white/5 hover:border-white/10'}`}>
                                                        <input 
                                                            type="radio" 
                                                            name="preset" 
                                                            checked={ingestOptions.preset === opt}
                                                            onChange={() => setIngestOptions(prev => ({ ...prev, preset: opt }))}
                                                            className="accent-[#E50914]"
                                                        />
                                                        <span className="text-sm text-white font-medium capitalize">{opt.replace(/-/g, ' ')}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="font-bold text-white text-sm">Additional Features</h4>
                                             <div className="space-y-3">
                                                 <label className="flex items-center justify-between p-3 bg-black/20 border border-white/5 rounded-lg">
                                                    <span className="text-sm text-gray-300">Enable DRM (Widevine/Fairplay)</span>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={ingestOptions.drm} 
                                                        onChange={(e) => setIngestOptions(prev => ({ ...prev, drm: e.target.checked }))}
                                                        className="w-5 h-5 accent-[#E50914]" 
                                                    />
                                                </label>
                                                 <label className="flex items-center justify-between p-3 bg-black/20 border border-white/5 rounded-lg">
                                                    <span className="text-sm text-gray-300">Generate Sprite Map (VTT)</span>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={ingestOptions.generateSprites} 
                                                        onChange={(e) => setIngestOptions(prev => ({ ...prev, generateSprites: e.target.checked }))}
                                                        className="w-5 h-5 accent-[#E50914]" 
                                                    />
                                                </label>
                                             </div>
                                        </div>
                                     </div>

                                     <div className="flex justify-between pt-4 border-t border-white/5">
                                        <button onClick={() => setIngestStep(1)} className="text-gray-400 hover:text-white text-sm">Back</button>
                                        <button 
                                            onClick={startIngest}
                                            className="px-8 py-2 bg-[#E50914] text-white font-bold rounded shadow-lg shadow-red-900/20 hover:bg-red-700 transition-colors"
                                        >
                                            Start Processing
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Progress & Status */}
                            {ingestStep === 3 && (
                                <div className="py-8 text-center max-w-lg mx-auto">
                                    {jobStatus === 'uploading' && (
                                        <div className="space-y-4">
                                            <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
                                                <UploadCloud size={32} />
                                            </div>
                                            <h3 className="text-xl font-bold text-white">Uploading Source...</h3>
                                            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                                                <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                                            </div>
                                            <p className="text-sm text-gray-400">{uploadProgress}% Complete</p>
                                        </div>
                                    )}

                                    {(jobStatus === 'transcode_queued' || jobStatus === 'processing') && (
                                        <div className="space-y-4">
                                            <div className="w-16 h-16 rounded-full bg-yellow-500/10 text-yellow-500 flex items-center justify-center mx-auto mb-4">
                                                <RefreshCw size={32} className="animate-spin" />
                                            </div>
                                            <h3 className="text-xl font-bold text-white">Transcoding & Packaging</h3>
                                            <p className="text-sm text-gray-400">Converting to HLS, generating keys, and creating renditions.</p>
                                            <div className="flex justify-center gap-2 mt-4">
                                                <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce"></span>
                                                <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-100"></span>
                                                <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-200"></span>
                                            </div>
                                        </div>
                                    )}

                                    {jobStatus === 'complete' && (
                                        <div className="space-y-6">
                                            <div className="w-20 h-20 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto mb-4">
                                                <CheckCircle size={40} />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-white">Ingest Successful</h3>
                                                <p className="text-gray-400 mt-2">Your content is ready for streaming.</p>
                                            </div>
                                            
                                            <div className="bg-white/5 rounded-lg p-4 text-left space-y-2 text-xs font-mono text-gray-300">
                                                <div className="flex justify-between">
                                                    <span>Manifest:</span>
                                                    <span className="text-green-500">master.m3u8</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Duration:</span>
                                                    <span>{Math.floor(formData.duration / 60)}m {formData.duration % 60}s</span>
                                                </div>
                                            </div>

                                            <button 
                                                onClick={() => setActiveTab('metadata')}
                                                className="px-6 py-2 bg-white text-black font-bold rounded hover:bg-gray-200 transition-colors"
                                            >
                                                Return to Details
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                         </div>
                    </div>
                )} 
                
                {['subtitles', 'analytics'].includes(activeTab) && (
                    <div className="text-center py-20 text-gray-500">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            {React.createElement(tabs.find(t => t.id === activeTab)?.icon, { size: 32, className: 'opacity-50' })}
                        </div>
                        <h3 className="text-lg font-medium text-gray-400 mb-2">{tabs.find(t => t.id === activeTab)?.label}</h3>
                        <p className="text-sm opacity-60">This module is under development.</p>
                    </div>
                )}

                
                {/* Wizard Navigation Footer */}
                <div className="flex justify-between mt-12 pt-6 border-t border-white/5">
                    <button 
                        onClick={handleBack} 
                        disabled={activeTab === tabs[0].id}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === tabs[0].id ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
                    >
                        Back
                    </button>
                    <button 
                        onClick={handleNext} 
                        className="px-8 py-2 bg-[#E50914] text-white font-bold rounded shadow-lg shadow-red-900/20 hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                        {activeTab === tabs[tabs.length - 1].id ? 'Finish' : 'Next'}
                        {activeTab !== tabs[tabs.length - 1].id && <ArrowRight size={18} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
