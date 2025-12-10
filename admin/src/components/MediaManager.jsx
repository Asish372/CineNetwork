import React, { useState } from 'react';
import { 
    Image, Film, RefreshCw, Upload, Scissors, 
    MonitorPlay, FileJson, CheckCircle, AlertCircle 
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function MediaManager({ content, onUpdate }) {
    const { addToast } = useToast();
    const [generatingSprite, setGeneratingSprite] = useState(false);
    const [regeneratingThumb, setRegeneratingThumb] = useState(false);
    
    // Local state for visuals before saving
    const [mediaData, setMediaData] = useState({
        thumbnailUrl: content.thumbnailUrl || '',
        posterUrl: content.posterUrl || '',
        spriteUrl: content.spriteUrl || '',
        videoUrl: content.videoUrl || ''
    });

    const handleInputChange = (field, value) => {
        const newData = { ...mediaData, [field]: value };
        setMediaData(newData);
        onUpdate(newData); // Propagate up to parent form
    };

    const handleFileUpload = async (e, field) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            addToast('Uploading...', 'info');
            // Assuming api.post is a wrapper around axios
            // We need to ensure Content-Type is multipart/form-data, 
            // but axios usually sets this automatically when data is FormData
            // If api wrapper sets 'Content-Type': 'application/json', we might need to override
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            // Adjust path to be a full URL if needed, or relative
            // The backend returns { file: '/uploads/filename.ext' }
            const fullUrl = `http://localhost:5000${res.data.file}`; // Start with localhost for dev
            
            handleInputChange(field, fullUrl);
            addToast('File uploaded successfully', 'success');
        } catch (error) {
            console.error(error);
            addToast('Upload failed: ' + (error.response?.data?.msg || error.message), 'error');
        }
    };

    const triggerSpriteGen = () => {
        if (!mediaData.videoUrl) return addToast('Video source required first', 'error');
        
        setGeneratingSprite(true);
        addToast('Sprite generation queued (FFmpeg)', 'info');
        
        // Mock Async Process
        setTimeout(() => {
            const mockUrl = 'https://cdn.cinenetwork.com/sprites/sprite_sheet_01.jpg';
            handleInputChange('spriteUrl', mockUrl);
            setGeneratingSprite(false);
            addToast('Sprite sheet generated!', 'success');
        }, 2000);
    };

    const triggerThumbRegen = () => {
        if (!mediaData.videoUrl) return addToast('Video source required', 'error');
        
        setRegeneratingThumb(true);
        addToast('Extracting auto-thumbnail...', 'info');
        
        setTimeout(() => {
            const mockThumb = 'https://cdn.cinenetwork.com/thumbs/auto_extract_01.jpg';
            handleInputChange('thumbnailUrl', mockThumb);
            setRegeneratingThumb(false);
            addToast('Thumbnail extracted!', 'success');
        }, 1500);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            
            {/* Section 1: Visual Assets */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Landscape Thumbnail */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                            <Image size={16} className="text-[#E50914]" /> Landscape Thumbnail (16:9)
                        </label>
                        <button 
                            onClick={triggerThumbRegen}
                            disabled={regeneratingThumb}
                            className="text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300 disabled:opacity-50"
                        >
                            <RefreshCw size={12} className={regeneratingThumb ? "animate-spin" : ""} />
                            {regeneratingThumb ? 'Extracting...' : 'Auto-Extract'}
                        </button>
                    </div>
                    
                    <div className="aspect-video bg-black/40 border border-white/10 rounded-xl overflow-hidden relative group">
                        {mediaData.thumbnailUrl ? (
                            <img src={mediaData.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
                                <Image size={48} className="mb-2 opacity-50" />
                                <span className="text-xs">No Image</span>
                            </div>
                        )}
                        
                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                             <label className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm cursor-pointer">
                                <Upload size={20} />
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden"
                                    onChange={(e) => handleFileUpload(e, 'thumbnailUrl')}
                                />
                             </label>
                        </div>
                    </div>

                    <input 
                        value={mediaData.thumbnailUrl}
                        onChange={(e) => handleInputChange('thumbnailUrl', e.target.value)}
                        placeholder="https://..." 
                        className="w-full bg-black/50 border border-white/10 rounded p-3 text-xs text-gray-300 font-mono outline-none focus:border-[#E50914]" 
                    />
                </div>

                {/* Vertical Poster */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                         <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                            <Film size={16} className="text-[#E50914]" /> Portrait Poster (2:3)
                        </label>
                         <label className="text-xs flex items-center gap-1 text-gray-500 hover:text-white cursor-pointer">
                            <Upload size={12} /> Upload File
                            <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, 'posterUrl')}
                            />
                        </label>
                    </div>

                    <div className="flex gap-6">
                        <div className="w-32 aspect-[2/3] bg-black/40 border border-white/10 rounded-xl overflow-hidden shrink-0 relative group">
                             {mediaData.posterUrl ? (
                                <img src={mediaData.posterUrl} alt="Poster" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
                                    <Film size={24} className="mb-2 opacity-50" />
                                    <span className="text-[10px]">No Poster</span>
                                </div>
                            )}
                             {/* Overlay for Poster */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                 <label className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm cursor-pointer">
                                    <Upload size={16} />
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden"
                                        onChange={(e) => handleFileUpload(e, 'posterUrl')}
                                    />
                                 </label>
                            </div>
                        </div>
                        <div className="flex-1 space-y-4">
                             <div className="p-4 bg-white/5 rounded-lg border border-white/5 text-xs text-gray-400">
                                <p className="mb-2">Recommended Dimensions:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>1000x1500px (High Res)</li>
                                    <li>Max size: 5MB</li>
                                    <li>Format: JPG/WEBP</li>
                                </ul>
                             </div>
                             <input 
                                value={mediaData.posterUrl}
                                onChange={(e) => handleInputChange('posterUrl', e.target.value)}
                                placeholder="https://..." 
                                className="w-full bg-black/50 border border-white/10 rounded p-3 text-xs text-gray-300 font-mono outline-none focus:border-[#E50914]" 
                            />
                        </div>
                    </div>
                </div>
            </div>

            <hr className="border-white/5" />

            {/* Section 2: Sprites & Scrubbing */}
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Scissors size={20} className="text-[#E50914]" /> Sprite Map Gen
                    </h3>
                    <button 
                        onClick={triggerSpriteGen}
                        disabled={generatingSprite}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        {generatingSprite ? <RefreshCw size={16} className="animate-spin" /> : <Scissors size={16} />}
                        <span>{generatingSprite ? 'Generating...' : 'Generate Sprites'}</span>
                    </button>
                </div>

                <div className="bg-[#111] border border-white/10 rounded-xl p-6">
                    <div className="flex items-start gap-6">
                        <div className="w-64 aspect-video bg-black rounded-lg border border-white/5 flex items-center justify-center relative overflow-hidden">
                             {mediaData.spriteUrl ? (
                                <img src={mediaData.spriteUrl} alt="Sprite Sheet" className="opacity-50 hover:opacity-100 transition-opacity" />
                             ) : (
                                <div className="text-center p-4">
                                    <MonitorPlay size={32} className="mx-auto text-gray-700 mb-2" />
                                    <p className="text-[10px] text-gray-600">No Sprite Generated</p>
                                </div>
                             )}
                             {mediaData.spriteUrl && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <span className="bg-black/80 px-2 py-1 rounded text-[10px] text-white">Sprite Preview</span>
                                </div>
                             )}
                        </div>

                        <div className="flex-1 space-y-4">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Sprite Image URL</label>
                                <input 
                                    value={mediaData.spriteUrl}
                                    readOnly
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded p-2 text-xs text-green-500 font-mono outline-none" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">VTT Mapping (JSON/VTT)</label>
                                <div className="w-full h-24 bg-[#0a0a0a] border border-white/10 rounded p-2 text-[10px] text-gray-400 font-mono overflow-y-auto">
                                    {mediaData.spriteUrl ? (
                                        `WEBVTT\n\n00:00:00.000 --> 00:00:10.000\n${mediaData.spriteUrl}#xywh=0,0,160,90\n\n00:00:10.000 --> 00:00:20.000\n${mediaData.spriteUrl}#xywh=160,0,160,90`
                                    ) : (
                                        "// VTT content will appear here after generation..."
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
