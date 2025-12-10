import React, { useState, useEffect } from 'react';
import { X, Search, Check, Filter } from 'lucide-react';
import api from '../services/api';

const ContentPickerModal = ({ isOpen, onClose, onSelect, initialSelection = [], typeFilter = 'all' }) => {
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState(typeFilter); // 'all', 'movie', 'series', 'short'
    const [selectedIds, setSelectedIds] = useState(new Set(initialSelection.map(i => i.id)));
    const [selectedItems, setSelectedItems] = useState([...initialSelection]);

    useEffect(() => {
        if (isOpen) {
            fetchContent();
        }
    }, [isOpen, searchTerm, filterType]);

    // Update internal state if props change (re-opening with different selection)
    useEffect(() => {
        if (isOpen) {
            setSelectedIds(new Set(initialSelection.map(i => i.id)));
            setSelectedItems([...initialSelection]);
        }
    }, [isOpen]);

    const fetchContent = async () => {
        setLoading(true);
        try {
            // Re-use the layout search API which supports empty query for "all/recent"
            const res = await api.get(`/layout/search/content?query=${searchTerm}&type=${filterType}`);
            setContent(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelection = (item) => {
        const newIds = new Set(selectedIds);
        let newItems = [...selectedItems];

        if (newIds.has(item.id)) {
            newIds.delete(item.id);
            newItems = newItems.filter(i => i.id !== item.id);
        } else {
            newIds.add(item.id);
            newItems.push(item);
        }

        setSelectedIds(newIds);
        setSelectedItems(newItems);
    };

    const handleConfirm = () => {
        onSelect(selectedItems);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#1a1a1a] w-full max-w-4xl h-[85vh] rounded-2xl border border-white/10 flex flex-col shadow-2xl relative">
                
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-white">Select Content</h2>
                        <p className="text-sm text-gray-400">Choose items to add to this section</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                {/* Filters */}
                <div className="p-4 border-b border-white/10 flex gap-4 bg-black/20">
                    <div className="relative flex-1">
                        <input 
                            type="text" 
                            placeholder="Search by title..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:border-[#E50914] outline-none"
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
                    </div>
                    <div className="relative">
                        <select 
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="appearance-none bg-black/50 border border-white/10 rounded-lg pl-4 pr-10 py-2.5 text-white focus:border-[#E50914] outline-none cursor-pointer"
                        >
                            <option value="all">All Types</option>
                            <option value="movie">Movies</option>
                            <option value="series">Series</option>
                            <option value="short">Shorts</option>
                        </select>
                        <Filter className="absolute right-3 top-2.5 text-gray-500 pointer-events-none" size={16} />
                    </div>
                </div>

                {/* Grid Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E50914]"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {content.map(item => {
                                const isSelected = selectedIds.has(item.id);
                                return (
                                    <div 
                                        key={item.id}
                                        onClick={() => toggleSelection(item)}
                                        className={`
                                            relative cursor-pointer group rounded-lg overflow-hidden border-2 transition-all duration-200
                                            ${isSelected ? 'border-[#E50914] ring-2 ring-[#E50914]/30' : 'border-transparent hover:border-white/20'}
                                        `}
                                    >
                                        <div className="aspect-[2/3] bg-gray-800 relative">
                                            <img 
                                                src={item.posterUrl} 
                                                alt={item.title}
                                                className={`w-full h-full object-cover transition duration-300 ${isSelected ? 'opacity-40' : 'group-hover:scale-105'}`}
                                            />
                                            {/* Selection Overlay */}
                                            {isSelected && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="bg-[#E50914] rounded-full p-2 shadow-lg scale-110">
                                                        <Check size={24} className="text-white" strokeWidth={3} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-2 bg-[#1f1f1f]">
                                            <div className="font-semibold text-xs text-white truncate">{item.title}</div>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-[10px] text-gray-400 capitalize">{item.type}</span>
                                                <span className="text-[10px] text-gray-500">{item.year || ''}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {content.length === 0 && !loading && (
                                <div className="col-span-full text-center py-10 text-gray-500">
                                    No content found matching your search.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-white/10 bg-[#151515] flex justify-between items-center rounded-b-2xl">
                    <div className="text-sm text-gray-400">
                        {selectedItems.length} items selected
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={onClose} 
                            className="px-6 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 font-medium transition"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleConfirm}
                            className="px-8 py-2.5 bg-[#E50914] text-white rounded-lg font-bold shadow-lg shadow-red-900/20 hover:bg-red-700 transition transform hover:scale-105 active:scale-95"
                        >
                            Confirm Selection
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ContentPickerModal;
