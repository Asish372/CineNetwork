import React, { useState, useEffect } from 'react';
import { X, Save, Upload, FileText, Image, Shield, AlertCircle, Trash2, Plus, MonitorPlay, Globe } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function EpisodeEditor({ episode, seasonId, onClose, onSave }) {
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState('metadata');
    const [loading, setLoading] = useState(false);
    
    // Initial State
    const [formData, setFormData] = useState({
        episodeNumber: '',
        title: '',
        synopsis: '',
        productionCode: '',
        runtime: '', // e.g., "45m"
        airDate: '',
        videoUrl: '', 
        thumbnailUrl: '',
        posterUrl: '',
        spriteUrl: '',
        manifestUrl: '',
        drmPolicy: '',
        status: 'draft',
        isPremiere: false,
        isFree: false, // Default locked
        isFinale: false,
        tags: [],
        subtitles: [], // [{ lang: 'en', url: '...' }]
        audioTracks: [], // [{ lang: 'en', url: '...' }]
        restrictRegions: [], // ['US']
        seoMeta: { title: '', description: '' }
    });

    // Ingest State
    const [sourceFile, setSourceFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [ingestStatus, setIngestStatus] = useState('idle'); // idle, uploading, processing, complete

    useEffect(() => {
        if (episode) {
            setFormData({
                ...episode,
                airDate: episode.airDate ? episode.airDate.split('T')[0] : '',
                tags: episode.tags || [],
                subtitles: episode.subtitles || [],
                audioTracks: episode.audioTracks || [],
                restrictRegions: episode.restrictRegions || [],
                seoMeta: episode.seoMeta || { title: '', description: '' }
            });
        } else {
            // Auto-increment logic would go here ideally
            setFormData(prev => ({ ...prev, episodeNumber: 1 })); 
        }
    }, [episode]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleArrayInput = (e, field) => {
        const val = e.target.value;
        setFormData(prev => ({
            ...prev,
            [field]: val.split(',').map(s => s.trim())
        }));
    };

    const handleNestedChange = (e, parent, key) => {
        const val = e.target.value;
        setFormData(prev => ({
            ...prev,
            [parent]: { ...prev[parent], [key]: val }
        }));
    };

    // List Handlers (Subtitles/Audio)
    const addListItem = (field, itemTemplate) => {
        setFormData(prev => ({ ...prev, [field]: [...prev[field], itemTemplate] }));
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

    const validate = () => {
        if (formData.status === 'published' && !formData.manifestUrl) {
            addToast('Cannot publish without Manifest URL (Process video first)', 'error');
            return false;
        }
        if (!formData.title) return false;
        return true;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            const payload = { ...formData, seasonId };
            let res;
            if (episode?.id) {
                res = await api.put(`/series/episodes/${episode.id}`, payload);
                addToast('Episode updated!', 'success');
            } else {
                res = await api.post(`/series/seasons/${seasonId}/episodes`, payload);
                addToast('Episode created!', 'success');
            }
            onSave(res.data);
            onClose();
        } catch (error) {
            console.error(error);
            addToast('Failed to save episode', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        if(e.target.files && e.target.files[0]) {
            setSourceFile(e.target.files[0]);
            // Clear manual URL if file is selected
            setFormData(prev => ({ ...prev, videoUrl: '' }));
        }
    };

    const triggerIngest = () => {
        if (!formData.videoUrl && !sourceFile) return addToast('Source URL or File required for ingest', 'error');
        
        setIngestStatus('uploading');
        setUploadProgress(0);
        addToast('Ingest Job queued', 'success');

        // Simulate Upload & Processing
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            setUploadProgress(progress);
            if(progress >= 100) {
                clearInterval(interval);
                setIngestStatus('processing');
                
                setTimeout(() => {
                    setIngestStatus('complete');
                    setFormData(prev => ({
                        ...prev,
                        manifestUrl: 'https://cdn.cinenetwork.com/hls/master.m3u8',
                        runtime: '45m 12s',
                        videoUrl: sourceFile ? `s3://bucket/uploads/${sourceFile.name}` : prev.videoUrl
                    }));
                    addToast('Ingest Completed (Mock)', 'success');
                }, 2000);
            }
        }, 500);
    };

    const tabs = [
        { id: 'metadata', label: 'Metadata', icon: FileText },
        { id: 'media', label: 'Media & Source', icon: Image },
        { id: 'tracks', label: 'Subs & Audio', icon: Globe },
        { id: 'publishing', label: 'Publishing & Rights', icon: Shield },
    ];

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-[#1a1a1a] w-full max-w-5xl rounded-xl border border-white/10 flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/10">
                    <div>
                        <h2 className="text-xl font-bold text-white">
                            {episode ? `Edit Episode: ${formData.title}` : 'New Episode'}
                        </h2>
                        <p className="text-sm text-gray-500 font-mono mt-1">
                            ID: {episode?.id || 'NEW'} • {formData.episodeNumber ? `S?E${formData.episodeNumber}` : 'Unnumbered'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Body - Flex Grow with Scroll */}
                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    {/* Sidebar Tabs */}
                    <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 p-4 flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto shrink-0">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-shrink-0 md:w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors whitespace-nowrap ${
                                    activeTab === tab.id 
                                    ? 'bg-[#E50914] text-white font-medium' 
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-8">
                        {activeTab === 'metadata' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Episode Number</label>
                                        <input 
                                            type="number" name="episodeNumber"
                                            value={formData.episodeNumber} onChange={handleChange}
                                            className="w-full bg-black/40 border border-white/10 rounded p-2.5 text-white focus:border-[#E50914] outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Title</label>
                                    <input 
                                        type="text" name="title"
                                        value={formData.title} onChange={handleChange}
                                        className="w-full bg-black/40 border border-white/10 rounded p-2.5 text-white focus:border-[#E50914] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Synopsis</label>
                                    <textarea 
                                        name="synopsis" rows={4}
                                        value={formData.synopsis} onChange={handleChange}
                                        className="w-full bg-black/40 border border-white/10 rounded p-2.5 text-white focus:border-[#E50914] outline-none resize-none"
                                    />
                                </div>
                                <div className="flex gap-6 pt-4 border-t border-white/5">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="checkbox" name="isPremiere"
                                            checked={formData.isPremiere} onChange={handleChange}
                                            className="accent-[#E50914] w-4 h-4"
                                        />
                                        <span className="text-white text-sm">Season Premiere</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="checkbox" name="isFinale"
                                            checked={formData.isFinale} onChange={handleChange}
                                            className="accent-[#E50914] w-4 h-4"
                                        />
                                        <span className="text-white text-sm">Season Finale</span>
                                    </label>
                                </div>
                                <div className="pt-2">
                                     <label className="flex items-center gap-2 cursor-pointer p-3 bg-green-900/20 border border-green-500/30 rounded-lg hover:bg-green-900/30 transition-colors">
                                        <input 
                                            type="checkbox" name="isFree"
                                            checked={formData.isFree} onChange={handleChange}
                                            className="accent-green-500 w-5 h-5"
                                        />
                                        <div>
                                            <span className="text-green-400 font-bold block text-sm">Free Access</span>
                                            <span className="text-green-300/60 text-xs">Unlock this episode for non-subscribed users (Teaser/Pilot)</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        )}

                        {activeTab === 'media' && (
                            <div className="space-y-8">
                                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-3">
                                    <MonitorPlay className="text-blue-400 shrink-0 mt-0.5" size={18} />
                                    <div className="flex-1">
                                        <h4 className="text-blue-400 font-medium text-sm">Automated Ingest Workflow</h4>
                                        <p className="text-blue-300/60 text-xs mt-1">Uploading a source file will trigger the transcoding pipeline. HLS manifests and sprite maps will be generated automatically.</p>
                                    </div>
                                    <button onClick={triggerIngest} className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded shadow-lg hover:bg-blue-600">
                                        Start Ingest
                                    </button>
                                </div>

                                <div className="space-y-4">
                                     <div>
                                        <label className="block text-sm text-gray-400 mb-2">Source Video</label>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            {/* File Upload Option */}
                                            <div className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center transition-colors ${sourceFile ? 'border-green-500/50 bg-green-500/10' : 'border-white/10 bg-black/20 hover:border-white/20'}`}>
                                                <input type="file" id="ep-file-upload" className="hidden" accept="video/*" onChange={handleFileSelect} />
                                                <label htmlFor="ep-file-upload" className="cursor-pointer space-y-2">
                                                    <Upload size={24} className={sourceFile ? 'text-green-500 mx-auto' : 'text-gray-500 mx-auto'} />
                                                    <div className="text-xs">
                                                        {sourceFile ? (
                                                            <span className="text-green-500 font-bold">{sourceFile.name}</span>
                                                        ) : (
                                                            <span className="text-gray-400">Click to Upload File</span>
                                                        )}
                                                    </div>
                                                </label>
                                            </div>

                                            {/* URL Option */}
                                            <div>
                                                 <input 
                                                    type="text" name="videoUrl"
                                                    value={formData.videoUrl} onChange={handleChange}
                                                    placeholder="Or enter S3 URL..."
                                                    className="w-full h-full bg-black/40 border border-white/10 rounded p-4 text-white focus:border-[#E50914] outline-none text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    {ingestStatus !== 'idle' && (
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs text-gray-400">
                                                <span>{ingestStatus === 'uploading' ? 'Uploading...' : ingestStatus === 'processing' ? 'Processing...' : 'Complete'}</span>
                                                <span>{uploadProgress}%</span>
                                            </div>
                                            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                                                <div 
                                                    className={`h-full transition-all duration-300 ${ingestStatus === 'complete' ? 'bg-green-500' : 'bg-blue-500'}`} 
                                                    style={{ width: `${uploadProgress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}

                                     <div>
                                        <label className="block text-sm text-gray-400 mb-1">HLS Manifest URL (Master)</label>
                                        <input 
                                            type="text" name="manifestUrl"
                                            value={formData.manifestUrl} onChange={handleChange}
                                            placeholder="Generated after ingest..."
                                            className="w-full bg-black/40 border border-white/10 rounded p-2.5 text-white focus:border-[#E50914] outline-none opacity-75 font-mono text-xs"
                                            readOnly
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Thumbnail URL</label>
                                        <input 
                                            type="text" name="thumbnailUrl"
                                            value={formData.thumbnailUrl} onChange={handleChange}
                                            className="w-full bg-black/40 border border-white/10 rounded p-2.5 text-white focus:border-[#E50914] outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Poster URL (Vertical)</label>
                                        <input 
                                            type="text" name="posterUrl"
                                            value={formData.posterUrl} onChange={handleChange}
                                            className="w-full bg-black/40 border border-white/10 rounded p-2.5 text-white focus:border-[#E50914] outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'tracks' && (
                            <div className="space-y-8">
                                {/* Subtitles */}
                                <div>
                                    <div className="flex justify-between items-end mb-3">
                                        <label className="text-sm text-gray-400">Subtitle Tracks</label>
                                        <button onClick={() => addListItem('subtitles', { lang: '', url: '' })} className="text-xs flex items-center gap-1 text-[#E50914] hover:underline"><Plus size={12} /> Add Track</button>
                                    </div>
                                    <div className="space-y-2">
                                        {formData.subtitles.map((track, idx) => (
                                            <div key={idx} className="flex gap-2">
                                                <input 
                                                    placeholder="Lang (en)" 
                                                    value={track.lang} 
                                                    onChange={(e) => updateListItem('subtitles', idx, 'lang', e.target.value)}
                                                    className="w-24 bg-black/50 border border-white/10 rounded p-2 text-sm text-white outline-none"
                                                />
                                                <input 
                                                    placeholder="URL (vtt/srt)" 
                                                    value={track.url} 
                                                    onChange={(e) => updateListItem('subtitles', idx, 'url', e.target.value)}
                                                    className="flex-1 bg-black/50 border border-white/10 rounded p-2 text-sm text-white outline-none"
                                                />
                                                <button onClick={() => removeListItem('subtitles', idx)} className="p-2 text-gray-500 hover:text-red-500"><Trash2 size={14} /></button>
                                            </div>
                                        ))}
                                        {formData.subtitles.length === 0 && <p className="text-xs text-gray-600 italic">No subtitles added.</p>}
                                    </div>
                                </div>

                                {/* Audio Tracks */}
                                <div>
                                    <div className="flex justify-between items-end mb-3">
                                        <label className="text-sm text-gray-400">Audio Tracks</label>
                                        <button onClick={() => addListItem('audioTracks', { lang: '', url: '' })} className="text-xs flex items-center gap-1 text-[#E50914] hover:underline"><Plus size={12} /> Add Audio</button>
                                    </div>
                                    <div className="space-y-2">
                                        {formData.audioTracks.map((track, idx) => (
                                            <div key={idx} className="flex gap-2">
                                                <input 
                                                    placeholder="Lang (en)" 
                                                    value={track.lang} 
                                                    onChange={(e) => updateListItem('audioTracks', idx, 'lang', e.target.value)}
                                                    className="w-24 bg-black/50 border border-white/10 rounded p-2 text-sm text-white outline-none"
                                                />
                                                <input 
                                                    placeholder="URL (aac/mp3)" 
                                                    value={track.url} 
                                                    onChange={(e) => updateListItem('audioTracks', idx, 'url', e.target.value)}
                                                    className="flex-1 bg-black/50 border border-white/10 rounded p-2 text-sm text-white outline-none"
                                                />
                                                <button onClick={() => removeListItem('audioTracks', idx)} className="p-2 text-gray-500 hover:text-red-500"><Trash2 size={14} /></button>
                                            </div>
                                        ))}
                                         {formData.audioTracks.length === 0 && <p className="text-xs text-gray-600 italic">No audio tracks added.</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'publishing' && (
                             <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Status</label>
                                        <select 
                                            name="status"
                                            value={formData.status} onChange={handleChange}
                                            className="w-full bg-black/40 border border-white/10 rounded p-2.5 text-white focus:border-[#E50914] outline-none"
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="published">Published</option>
                                            <option value="archived">Archived</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Air Date</label>
                                        <input 
                                            type="date" name="airDate"
                                            value={formData.airDate} onChange={handleChange}
                                            className="w-full bg-black/40 border border-white/10 rounded p-2.5 text-white focus:border-[#E50914] outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Runtime</label>
                                        <input 
                                            type="text" name="runtime"
                                            value={formData.runtime} onChange={handleChange}
                                            placeholder="e.g. 45m 30s"
                                            className="w-full bg-black/40 border border-white/10 rounded p-2.5 text-white focus:border-[#E50914] outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">DRM Policy</label>
                                        <select 
                                            name="drmPolicy"
                                            value={formData.drmPolicy} onChange={handleChange}
                                            className="w-full bg-black/40 border border-white/10 rounded p-2.5 text-white focus:border-[#E50914] outline-none"
                                        >
                                            <option value="">None (Clear Key)</option>
                                            <option value="widevine-cenc">Widevine CENC (Standard)</option>
                                            <option value="fairplay">Fairplay (Apple)</option>
                                        </select>
                                    </div>
                                </div>


                             </div>
                        )}
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
                        {loading ? 'Saving...' : <><Save size={18} /> Save Episode</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
