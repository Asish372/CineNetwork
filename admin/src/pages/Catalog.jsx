import React, { useState, useEffect } from 'react';
import { 
    Search, Filter, MoreHorizontal, Edit, Eye, Trash2, 
    CheckCircle, XCircle, ChevronDown, Plus, Film, Tv, Smartphone 
} from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

export default function Catalog() {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const [filter, setFilter] = useState({ type: 'all', status: 'all', search: '' });

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        setLoading(true);
        try {
            // Fetching all content types separately for now as backend lacks a unified /all endpoint
            // In a real scenario, /api/content/all?page=1&limit=50 would be better
            const [movies, shorts] = await Promise.all([
                api.get('/content/movies'),
                // api.get('/content/series'), 
                api.get('/content/shorts')
            ]);
            
            const allContent = [
                ...(movies.data || []), 
                ...(shorts.data || []).map(s => ({...s, type: 'short'}))
            ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setContent(allContent);
        } catch (error) {
            console.error(error);
            addToast('Failed to load catalog', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleBulkAction = async (action) => {
        if (!confirm(`Are you sure you want to ${action} ${selectedIds.length} items?`)) return;

        try {
            await api.post('/content/bulk', { action, ids: selectedIds });
            addToast(`Successfully processed ${action} for selected items`, 'success');
            fetchContent();
            setSelectedIds([]);
        } catch (error) {
            addToast('Bulk action failed', 'error');
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const selectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(filteredContent.map(c => c.id));
        } else {
            setSelectedIds([]);
        }
    };

    // Filtering Logic
    const filteredContent = content.filter(item => {
        const matchesType = filter.type === 'all' || item.type === filter.type;
        const matchesStatus = filter.status === 'all' || (item.status || 'draft') === filter.status;
        const matchesSearch = item.title.toLowerCase().includes(filter.search.toLowerCase());
        return matchesType && matchesStatus && matchesSearch;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'published': return 'bg-green-500/10 text-green-500';
            case 'archived': return 'bg-gray-500/10 text-gray-500';
            default: return 'bg-yellow-500/10 text-yellow-500'; // Draft
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'movie': return <Film size={14} />;
            case 'series': return <Tv size={14} />;
            case 'short': return <Smartphone size={14} />;
            default: return <Film size={14} />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-white">Content Catalog</h1>
                <button 
                    onClick={() => navigate('/content/new')}
                    className="flex items-center gap-2 bg-[#E50914] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#b2070f] transition-colors"
                >
                    <Plus size={18} />
                    <span>Add New</span>
                </button>
            </div>

            {/* Filters & Actions Bar */}
            <div className="bg-[#1a1a1a] p-4 rounded-xl border border-white/10 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex flex-1 items-center gap-4 w-full">
                    <div className="relative flex-1 max-w-sm">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input 
                            type="text" 
                            placeholder="Search by title, ID..." 
                            className="bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 w-full text-sm text-white focus:border-red-500 outline-none"
                            value={filter.search}
                            onChange={(e) => setFilter({...filter, search: e.target.value})}
                        />
                    </div>
                    
                    <select 
                        className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:border-red-500 outline-none"
                        value={filter.type}
                        onChange={(e) => setFilter({...filter, type: e.target.value})}
                    >
                        <option value="all">All Types</option>
                        <option value="movie">Movies</option>
                        <option value="series">Series</option>
                        <option value="short">Shorts</option>
                    </select>

                    <select 
                        className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:border-red-500 outline-none"
                        value={filter.status}
                        onChange={(e) => setFilter({...filter, status: e.target.value})}
                    >
                        <option value="all">All Status</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>

                {selectedIds.length > 0 && (
                    <div className="flex items-center gap-2 animate-fade-in">
                        <span className="text-sm text-gray-400">{selectedIds.length} select</span>
                        <div className="h-6 w-px bg-white/10 mx-2" />
                        <button onClick={() => handleBulkAction('publish')} className="text-green-500 hover:bg-green-500/10 p-2 rounded" title="Publish Selected">
                            <CheckCircle size={18} />
                        </button>
                         <button onClick={() => handleBulkAction('archive')} className="text-gray-400 hover:bg-gray-500/10 p-2 rounded" title="Archive Selected">
                            <XCircle size={18} />
                        </button>
                         <button onClick={() => handleBulkAction('delete')} className="text-red-500 hover:bg-red-500/10 p-2 rounded" title="Delete Selected">
                            <Trash2 size={18} />
                        </button>
                    </div>
                )}
            </div>

            {/* Data Table */}
            <div className="bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-black/40 text-xs uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4 w-10">
                                    <input type="checkbox" onChange={selectAll} checked={selectedIds.length === filteredContent.length && filteredContent.length > 0} className="rounded border-gray-600 bg-transparent" />
                                </th>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Release Date</th>
                                <th className="px-6 py-4">Rating</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan="7" className="p-8 text-center">Loading Content...</td></tr>
                            ) : filteredContent.length === 0 ? (
                                <tr><td colSpan="7" className="p-8 text-center">No content found</td></tr>
                            ) : (
                                filteredContent.map((item) => (
                                    <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedIds.includes(item.id)} 
                                                onChange={() => toggleSelect(item.id)}
                                                className="rounded border-gray-600 bg-transparent" 
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-14 bg-gray-800 rounded overflow-hidden shrink-0">
                                                    {item.thumbnailUrl && <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover" />}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium hover:text-red-500 cursor-pointer" onClick={() => navigate(`/content/${item.id}`)}>{item.title}</p>
                                                    <p className="text-xs text-gray-500">{item.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 capitalize">
                                                {getTypeIcon(item.type)}
                                                {item.type}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${getStatusColor(item.status || 'draft')}`}>
                                                {item.status || 'draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.releaseDate || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-yellow-500">
                                                <span className="font-bold">{item.rating?.toFixed(1) || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => navigate(`/content/${item.id}`)} className="p-1.5 hover:bg-white/10 rounded-lg text-blue-400" title="Edit">
                                                    <Edit size={16} />
                                                </button>
                                                <button className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white" title="Preview">
                                                    <Eye size={16} />
                                                </button>
                                                <button onClick={() => { setSelectedIds([item.id]); handleBulkAction('delete'); }} className="p-1.5 hover:bg-white/10 rounded-lg text-red-500" title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination (Mock) */}
                <div className="p-4 border-t border-white/5 flex justify-between items-center text-xs text-gray-500">
                    <span>Showing {filteredContent.length} items</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 bg-white/5 rounded hover:bg-white/10 disabled:opacity-50" disabled>Previous</button>
                        <button className="px-3 py-1 bg-white/5 rounded hover:bg-white/10">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
