import React, { useEffect, useState } from 'react';
import { 
    Users, Film, Activity, Eye, TrendingUp, Clock, UserPlus
} from 'lucide-react';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className="relative overflow-hidden bg-[#1a1a1a]/80 backdrop-blur-xl p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
    <div className={`absolute top-0 right-0 p-8 opacity-5 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform ${color.text}`}>
        <Icon size={80} />
    </div>
    
    <div className="relative z-10 flex flex-col justify-between h-full">
      <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center bg-opacity-10 ${color.bg} ${color.text}`}>
        <Icon size={20} />
      </div>
      <div>
        <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
        <p className="text-sm text-gray-400 font-medium uppercase tracking-wider mt-1">{title}</p>
      </div>
      {subtitle && (
         <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-gray-500">
            <span className={color.text}>{subtitle}</span>
         </div>
      )}
    </div>
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const socket = useSocket();
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    totalUsers: 0, 
    totalContent: 0, 
    totalViews: 0,
    totalInteractions: 0,
    activeUsers: 0
  });

  const [widgets, setWidgets] = useState({
    topContent: [], 
    recentUsers: [] // Real data only
  });

  // Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, liveRes, widgetsRes] = await Promise.all([
          api.get('/admin/dashboard/stats'),
          api.get('/admin/dashboard/live'),
          api.get('/admin/dashboard/widgets')
        ]);
        
        setStats({ 
            ...statsRes.data, 
            activeUsers: liveRes.data.activeUsers 
        });
        setWidgets(widgetsRes.data);
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Socket Listeners for Real-time Updates
  useEffect(() => {
    if (!socket) return;

    // Listener: Real-time Active Users (if backend broadcasts generic ping or specific connection events)
    // For now, we update strictly on data events to keep it precise.
    
    // 1. New User Registered
    socket.on('user_registered', (newUser) => {
        // Update Total Count
        setStats(prev => ({ ...prev, totalUsers: prev.totalUsers + 1 }));
        
        // Update Feed
        setWidgets(prev => ({
            ...prev,
            recentUsers: [newUser, ...prev.recentUsers].slice(0, 10)
        }));
    });

    // 2. New Content Created
    socket.on('content_created', () => {
        setStats(prev => ({ ...prev, totalContent: prev.totalContent + 1 }));
    });

    return () => {
        socket.off('user_registered');
        socket.off('content_created');
    };
  }, [socket]);

  return (
    <div className="space-y-8 pb-10 animate-fade-in max-w-7xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-gray-400 mt-1">Real-time overview of your platform performance.</p>
      </div>

      {/* 1. Stat Tiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            title="Total Users" 
            value={stats.totalUsers.toLocaleString()} 
            icon={Users} 
            color={{ bg: 'bg-blue-500', text: 'text-blue-500' }} 
            subtitle="Registered Accounts"
        />
        <StatCard 
            title="Active Content" 
            value={stats.totalContent.toLocaleString()} 
            icon={Film} 
            color={{ bg: 'bg-red-500', text: 'text-red-500' }} 
            subtitle="Movies, Series, Shorts"
        />
        <StatCard 
            title="Total Views" 
            value={stats.totalViews.toLocaleString()} 
            icon={Eye} 
            color={{ bg: 'bg-purple-500', text: 'text-purple-500' }} 
            subtitle="Lifetime Plays"
        />
         <StatCard 
            title="Live Sessions" 
            value={stats.activeUsers} 
            icon={Activity} 
            color={{ bg: 'bg-green-500', text: 'text-green-500' }} 
            subtitle="Connected Now"
        />
      </div>

      {/* 2. Content & Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Top Performing Content */}
        <div className="lg:col-span-2 bg-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden flex flex-col h-[500px]">
             <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
                        <TrendingUp size={18} />
                    </div>
                    <h3 className="font-bold text-white">Top Content</h3>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-black/20 text-xs uppercase font-medium sticky top-0 backdrop-blur-md">
                        <tr>
                            <th className="px-6 py-4">Title</th>
                            <th className="px-6 py-4 text-center">Type</th>
                            <th className="px-6 py-4 text-right">Views</th>
                            <th className="px-6 py-4 text-right">Rating</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {widgets.topContent.length === 0 ? (
                            <tr><td colSpan="4" className="p-8 text-center text-gray-600">No content data available</td></tr>
                        ) : widgets.topContent.map(item => (
                            <tr key={item.id} className="hover:bg-white/5 transition-colors group cursor-default">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded bg-gray-800 flex-shrink-0 overflow-hidden">
                                            {item.thumbnailUrl ? (
                                                <img src={item.thumbnailUrl} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-600"><Film size={14} /></div>
                                            )}
                                        </div>
                                        <span className="font-medium text-white group-hover:text-[#E50914] transition-colors">{item.title}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${item.type === 'movie' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'}`}>
                                        {item.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-medium text-white">{item.views.toLocaleString()}</td>
                                <td className="px-6 py-4 text-right text-yellow-500 font-bold">{item.rating?.toFixed(1) || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Live User Feed */}
        <div className="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden flex flex-col h-[500px]">
             <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                        <UserPlus size={18} />
                    </div>
                    <h3 className="font-bold text-white">New Registrations</h3>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-green-500 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Live
                </div>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
                {widgets.recentUsers.length === 0 ? (
                    <p className="text-center text-gray-500 text-sm">No recent users.</p>
                ) : widgets.recentUsers.map(user => (
                    <div key={user.id} className="flex items-start gap-4 animate-slide-in">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xs font-bold text-white ring-2 ring-black">
                            {user.fullName?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user.fullName || 'Unknown User'}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <span className="text-[10px] text-gray-600 whitespace-nowrap">
                            {new Date(user.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
}
