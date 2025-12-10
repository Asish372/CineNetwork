import React, { useState, useEffect } from 'react';
import { 
    Plus, ChevronDown, ChevronRight, Play, Trash2, Edit, Calendar, Upload 
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import EpisodeEditor from './EpisodeEditor';
import SeasonEditor from './SeasonEditor';

export default function SeriesManager({ seriesId }) {
    const { addToast } = useToast();
    const [seasons, setSeasons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingEpisode, setEditingEpisode] = useState(null); // { episode, seasonId }
    const [editingSeason, setEditingSeason] = useState(null); // season object
    const [expandedSeason, setExpandedSeason] = useState(null);

    useEffect(() => {
        fetchSeasons();
    }, [seriesId]);

    const fetchSeasons = async () => {
        try {
            const res = await api.get(`/series/${seriesId}/seasons`);
            setSeasons(res.data);
        } catch (error) {
            console.error(error);
            addToast('Failed to load seasons', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddSeason = async () => {
        const seasonNumber = seasons.length + 1;
        try {
            await api.post(`/series/${seriesId}/seasons`, {
                seasonNumber,
                title: `Season ${seasonNumber}`
            });
            addToast('Season added', 'success');
            fetchSeasons();
        } catch (error) {
            addToast('Failed to create season', 'error');
        }
    };

    const handleBulkImport = () => {
        // Placeholder for CSV Import Logic
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.onchange = (e) => {
             const file = e.target.files[0];
             if(file) addToast(`Importing episodes from ${file.name}... (Mock)`, 'success');
        };
        input.click();
    };

    const handleDeleteSeason = async (id) => {
        if (!confirm('Start deletion? This will delete all episodes in this season.')) return;
        try {
            await api.delete(`/series/seasons/${id}`);
            addToast('Season deleted', 'success');
            fetchSeasons();
        } catch (error) {
            addToast('Delete failed', 'error');
        }
    };

    const toggleSeason = (id) => {
        setExpandedSeason(expandedSeason === id ? null : id);
    };

    if (loading) return <div className="text-gray-500 text-sm">Loading series data...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Seasons & Episodes</h3>
                <div className="flex gap-2">
                     <button 
                        onClick={handleBulkImport}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded text-sm transition-colors"
                    >
                        <Upload size={14} />
                        <span>Bulk Import Episodes</span>
                    </button>
                    <button 
                        onClick={handleAddSeason}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-sm transition-colors"
                    >
                        <Plus size={16} />
                        <span>Add Season</span>
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {seasons.length === 0 ? (
                    <div className="text-center p-8 border border-dashed border-white/10 rounded-xl text-gray-500">
                        No seasons found. Start by adding one.
                    </div>
                ) : (
                    seasons.map(season => (
                        <div key={season.id} className="bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden">
                            {/* Season Header */}
                            <div 
                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
                                onClick={() => toggleSeason(season.id)}
                            >
                                <div className="flex items-center gap-4">
                                    {expandedSeason === season.id ? <ChevronDown size={20} className="text-gray-400" /> : <ChevronRight size={20} className="text-gray-400" />}
                                    <div>
                                        <h4 className="font-bold text-white flex items-center gap-3">
                                            {season.title || `Season ${season.seasonNumber}`}
                                            <span className="text-xs font-normal text-gray-500 uppercase px-2 py-0.5 border border-white/10 rounded">{season.status}</span>
                                        </h4>
                                        <p className="text-xs text-gray-500">{season.episodes?.length || 0} Episodes</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setEditingSeason(season); }}
                                        className="p-2 hover:bg-white/10 rounded text-gray-400"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteSeason(season.id); }} className="p-2 hover:bg-white/10 rounded text-red-500"><Trash2 size={16} /></button>
                                </div>
                            </div>

                            {/* Episodes List (Expanded) */}
                            {expandedSeason === season.id && (
                                <div className="border-t border-white/5 bg-black/20 p-4">
                                    <div className="space-y-2">
                                        {season.episodes?.map(episode => (
                                            <div key={episode.id} className="flex items-center justify-between p-3 rounded hover:bg-white/5 transition-colors group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-gray-400">
                                                        {episode.episodeNumber}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-white">{episode.title}</p>
                                                        <p className="text-xs text-gray-500 flex items-center gap-2">
                                                            <Calendar size={10} /> {episode.airDate || 'Not Scheduled'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${episode.status === 'published' ? 'text-green-500 bg-green-500/10' : 'text-yellow-500 bg-yellow-500/10'}`}>
                                                        {episode.status}
                                                    </span>
                                                    <button 
                                                        onClick={() => setEditingEpisode({ episode, seasonId: season.id })}
                                                        className="p-1.5 hover:bg-white/10 rounded text-blue-400"
                                                    >
                                                        <Edit size={14} />
                                                    </button>
                                                    <button className="p-1.5 hover:bg-white/10 rounded text-red-500"><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button 
                                        onClick={() => setEditingEpisode({ episode: null, seasonId: season.id })}
                                        className="w-full mt-4 py-2 border border-dashed border-white/20 rounded text-sm text-gray-400 hover:text-white hover:border-white/40 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Plus size={14} /> Add Episode
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Episode Editor Modal */}
            {editingEpisode && (
                <EpisodeEditor 
                    episode={editingEpisode.episode} 
                    seasonId={editingEpisode.seasonId}
                    onClose={() => setEditingEpisode(null)}
                    onSave={() => {
                        fetchSeasons();
                    }}
                />
            )}

            {/* Season Editor Modal */}
            {editingSeason && (
                <SeasonEditor 
                    season={editingSeason}
                    contentId={seriesId}
                    onClose={() => setEditingSeason(null)}
                    onSave={() => {
                        fetchSeasons();
                    }}
                />
            )}
        </div>
    );
}
