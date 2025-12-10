import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Film, Play, Eye, Star, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Movies() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  // Create Form State (Simplified)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'movie'
  });

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const res = await api.get('/content/movies');
      setMovies(res.data);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/content', formData);
      // Redirect to full editor
      navigate(`/content/${res.data.id}`);
    } catch (error) {
      alert('Error creating movie: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this movie?')) {
      try {
        await api.delete(`/content/${id}`);
        fetchMovies();
      } catch (error) {
        alert('Error deleting movie: ' + error.message);
      }
    }
  };

  const filteredMovies = movies.filter(movie => 
    movie.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
                <Film size={28} />
             </div>
             Movies
          </h1>
          <p className="text-gray-400 mt-2 ml-1">Manage your movie catalog and assets.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-[#1a1a1a]/80 backdrop-blur-xl p-1.5 rounded-xl border border-white/5 shadow-lg">
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors" size={18} />
                <input 
                    type="text" 
                    placeholder="Search movies..." 
                    className="bg-transparent border-none py-2.5 pl-11 pr-4 text-white text-sm focus:ring-0 placeholder-gray-600 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="w-px h-6 bg-white/10 mx-1"></div>
            <button 
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-[#E50914] text-white px-5 py-2.5 rounded-lg hover:bg-red-700 transition-all font-medium shadow-lg shadow-red-900/20"
            >
                <Plus size={18} />
                <span>New Movie</span>
            </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden shadow-2xl min-h-[500px] flex flex-col">
        {loading ? (
            <div className="flex flex-col items-center justify-center flex-1 text-gray-500 gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                <p className="animate-pulse">Loading library...</p>
            </div>
        ) : filteredMovies.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-gray-500 gap-6">
                <div className="p-6 bg-white/5 rounded-full">
                    <Film size={48} className="opacity-40" />
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-bold text-white mb-2">No movies found</h3>
                    <p className="max-w-xs mx-auto mb-6">Get started by creating your first movie title.</p>
                    <button onClick={() => setShowModal(true)} className="text-[#E50914] hover:text-white font-medium transition-colors">Create New</button>
                </div>
            </div>
        ) : (
            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-black/20 text-xs uppercase font-bold sticky top-0 backdrop-blur-md z-10">
                        <tr>
                            <th className="px-8 py-5 text-gray-300">Title</th>
                            <th className="px-8 py-5 text-gray-300">Status</th>
                            <th className="px-8 py-5 text-gray-300">Stats</th>
                            <th className="px-8 py-5 text-right text-gray-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredMovies.map((movie) => (
                            <tr key={movie.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-8 py-4">
                                    <div className="flex items-center gap-5">
                                        <div className="w-24 h-14 rounded-lg bg-gray-800 overflow-hidden border border-white/10 shadow-lg relative group-hover:scale-105 transition-transform duration-300">
                                            {movie.thumbnailUrl ? (
                                                <img src={movie.thumbnailUrl} alt={movie.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-600 bg-[#0a0a0a]"><Film size={20} /></div>
                                            )}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Play size={20} className="text-white fill-current" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-base font-bold text-white group-hover:text-[#E50914] transition-colors">{movie.title}</p>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1.5 font-medium">
                                                <span className="bg-white/5 px-1.5 py-0.5 rounded">{movie.year || 'N/A'}</span>
                                                <span>•</span>
                                                <span>{movie.duration || '0m'}</span>
                                                <span>•</span>
                                                <span className="text-gray-400">{movie.genre || 'Uncategorized'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-4">
                                    <div className="flex flex-col gap-2 items-start">
                                        {movie.isVip ? (
                                            <span className="px-2.5 py-1 rounded-md text-[10px] uppercase font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 tracking-wider">PREMIUM</span>
                                        ) : (
                                            <span className="px-2.5 py-1 rounded-md text-[10px] uppercase font-bold bg-green-500/10 text-green-500 border border-green-500/20 tracking-wider">FREE</span>
                                        )}
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-1.5 h-1.5 rounded-full ${movie.status === 'published' ? 'bg-blue-500' : 'bg-gray-500'}`}></div>
                                            <span className={`text-[11px] font-medium uppercase ${movie.status === 'published' ? 'text-blue-400' : 'text-gray-500'}`}>
                                                {movie.status || 'Draft'}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-4">
                                    <div className="flex items-center gap-6 text-xs font-medium">
                                        <div className="flex items-center gap-1.5 text-gray-300" title="Views">
                                            <Eye size={16} className="text-blue-500" /> 
                                            {movie.views?.toLocaleString() || 0}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-gray-300" title="Rating">
                                            <Star size={16} className="text-yellow-500 fill-current" /> 
                                            {movie.rating || 0}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-4 text-right">
                                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                        <button 
                                            onClick={() => navigate(`/content/${movie.id}`)}
                                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold uppercase tracking-wide border border-white/5 transition-colors"
                                        >
                                            <Edit2 size={14} /> Manage
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(movie.id)}
                                            className="p-2 hover:bg-red-500/10 text-gray-500 hover:text-red-500 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#1a1a1a] w-full max-w-md rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden transform transition-all scale-100">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#E50914] via-red-500 to-red-900" />
                
                <div className="flex items-center justify-between p-6 pb-2">
                    <h2 className="text-xl font-bold text-white">Create Movie</h2>
                    <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-colors bg-white/5 p-1.5 rounded-full hover:bg-white/10">
                        <X size={18} />
                    </button>
                </div>
                
                <form onSubmit={handleCreate} className="p-6 space-y-5">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Title</label>
                            <input 
                                type="text"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none placeholder-gray-600 transition-all text-sm font-medium"
                                placeholder="e.g. Inception"
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                                required
                                autoFocus
                            />
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Description</label>
                            <textarea 
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] focus:outline-none h-28 resize-none placeholder-gray-600 transition-all text-sm"
                                placeholder="Brief plot summary..."
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button 
                            type="button" 
                            onClick={() => setShowModal(false)}
                            className="flex-1 px-4 py-3 rounded-xl text-gray-400 font-bold hover:bg-white/5 transition-colors text-sm"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="flex-1 px-4 py-3 rounded-xl bg-[#E50914] text-white font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-900/20 text-sm flex items-center justify-center gap-2"
                        >
                            <span>Create & Edit Login</span>
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}

