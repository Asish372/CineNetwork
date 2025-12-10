import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, Filter, ChevronDown, CheckCircle, XCircle } from 'lucide-react';
// import { format } from 'date-fns'; // Removed to avoid dependency

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSubscriptions = async (pageNo = 1) => {
    try {
      setIsLoading(true);
      const response = await api.get(`/admin/subscriptions?page=${pageNo}&limit=10`);
      setSubscriptions(response.data.subscriptions);
      setTotalPages(response.data.pages);
      setPage(response.data.page);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions(page);
  }, [page]);

  const filteredSubscriptions = subscriptions.filter(sub => 
    sub.User?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.User?.phone?.includes(searchTerm) ||
    sub.User?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Subscriptions</h1>
          <p className="text-gray-400">Manage user memberships and payment status</p>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-3">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                    type="text" 
                    placeholder="Search visible users..." 
                    className="pl-10 pr-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#E50914]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                <Filter size={18} />
                <span>Filter</span>
            </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#1a1a1a] border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Valid From</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Valid Until</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                 <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading subscriptions...</td>
                 </tr>
              ) : filteredSubscriptions.length === 0 ? (
                 <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No subscriptions found</td>
                 </tr>
              ) : (
                filteredSubscriptions.map((sub, index) => {
                    const isExpired = new Date(sub.endDate) < new Date();
                    const status = isExpired ? 'expired' : sub.status;
                    
                    return (
                        <tr key={sub.id || index} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xs font-bold text-white">
                                        {sub.User?.fullName?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-white">{sub.User?.fullName || 'Unknown User'}</div>
                                        <div className="text-xs text-gray-500">{sub.User?.phone || sub.User?.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                    {sub.SubscriptionPlan?.name || 'Unknown Plan'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                    status === 'active' 
                                        ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                                }`}>
                                    {status === 'active' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                    <span className="capitalize">{status}</span>
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                {new Date(sub.startDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                {new Date(sub.endDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                {sub.paymentId || 'N/A'}
                            </td>
                        </tr>
                    );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between bg-[#1a1a1a]">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white/5 rounded-lg text-sm text-gray-300 disabled:opacity-50 hover:bg-white/10 border border-white/5"
            >
                Previous
            </button>
            <span className="text-sm text-gray-400">Page {page} of {totalPages}</span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-white/5 rounded-lg text-sm text-gray-300 disabled:opacity-50 hover:bg-white/10 border border-white/5"
            >
                Next
            </button>
        </div>
      </div>
    </div>
  );
}
