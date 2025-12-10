import React, { useState, useEffect } from 'react';
import { Search, User, Mail, Phone, Calendar, Shield, MoreVertical, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async (pageNo = 1) => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/users?page=${pageNo}&limit=10`);
      setUsers(res.data.users);
      setTotalPages(res.data.pages);
      setPage(res.data.page);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  // Client-side filtering on the current page
  const filteredUsers = users.filter(user => 
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                <User size={28} />
             </div>
             User Management
          </h1>
          <p className="text-gray-400 mt-2 ml-1">Monitor and manage registered users.</p>
        </div>
        
        <div className="bg-[#1a1a1a]/80 backdrop-blur-xl p-1.5 rounded-xl border border-white/5 shadow-lg">
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors" size={18} />
                <input 
                    type="text" 
                    placeholder="Search visible users..." 
                    className="bg-transparent border-none py-2.5 pl-11 pr-4 text-white text-sm focus:ring-0 placeholder-gray-600 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#1a1a1a]/60 backdrop-blur-md p-5 rounded-xl border border-white/5 flex items-center gap-4">
              <div className="p-3 bg-green-500/20 text-green-500 rounded-lg">
                  <CheckCircle size={24} />
              </div>
              <div>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Pages</p>
                  <p className="text-2xl font-bold text-white">{totalPages}</p>
              </div>
          </div>
      </div>

      {/* Content Table */}
      <div className="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden shadow-2xl min-h-[500px] flex flex-col">
        {loading ? (
             <div className="flex flex-col items-center justify-center flex-1 text-gray-500 gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="animate-pulse">Loading users...</p>
            </div>
        ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-gray-500 gap-6">
                <div className="p-6 bg-white/5 rounded-full">
                    <User size={48} className="opacity-40" />
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-bold text-white mb-2">No users found</h3>
                    <p className="max-w-xs mx-auto mb-6">Users will appear here once they register.</p>
                </div>
            </div>
        ) : (
            <>
            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-black/20 text-xs uppercase font-bold sticky top-0 backdrop-blur-md z-10">
                        <tr>
                            <th className="px-8 py-5 text-gray-300">User Profile</th>
                            <th className="px-8 py-5 text-gray-300">Contact Details</th>
                            <th className="px-8 py-5 text-gray-300">Joined Date</th>
                            <th className="px-8 py-5 text-gray-300">Status</th>
                            <th className="px-8 py-5 text-right text-gray-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-8 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg font-bold text-sm">
                                            {user.fullName ? user.fullName.charAt(0).toUpperCase() : <User size={18} />}
                                        </div>
                                        <div>
                                            <p className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">{user.fullName || 'No Name'}</p>
                                            <p className="text-xs text-gray-500">ID: {String(user.id).substring(0, 8)}...</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-4">
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                                            <Mail size={14} className="text-blue-500" />
                                            <span>{user.email}</span>
                                        </div>
                                        {user.phone && (
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <Phone size={14} className="text-gray-600" />
                                                <span>{user.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-8 py-4">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Calendar size={14} className="text-gray-600" />
                                        <span>{new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase border ${
                                        user.email === 'admin@cinenetwork.com' 
                                        ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    }`}>
                                        {user.email === 'admin@cinenetwork.com' ? <Shield size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
                                        {user.email === 'admin@cinenetwork.com' ? 'Admin' : 'Active'}
                                    </span>
                                </td>
                                <td className="px-8 py-4 text-right">
                                    <button className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                        <MoreVertical size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination Controls */}
            <div className="p-4 border-t border-white/5 flex items-center justify-between bg-black/20">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white/5 rounded-lg text-sm text-gray-300 disabled:opacity-50 hover:bg-white/10"
                >
                    Previous
                </button>
                <span className="text-sm text-gray-400">Page {page} of {totalPages}</span>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-white/5 rounded-lg text-sm text-gray-300 disabled:opacity-50 hover:bg-white/10"
                >
                    Next
                </button>
            </div>
            </>
        )}
      </div>
    </div>
  );
}
