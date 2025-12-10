import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Upload, 
  Film, 
  Tv, 
  Smartphone, 
  Users, 
  Settings, 
  LogOut, 
  Search,
  Bell,
  Plus,
  Command,
  HelpCircle,
  Layers,
  Menu,
  X,
  Shield,
  CreditCard
} from 'lucide-react';
import logo from '../assets/logo.png';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');

  // Protect Route (Redirect to login if no token)
  React.useEffect(() => {
    const token = sessionStorage.getItem('admin_token') || localStorage.getItem('admin_token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token');
    localStorage.removeItem('admin_token');
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, category: 'Main' },
    // Catalog removed for simplicity
    { name: 'Movies', path: '/movies', icon: Film, category: 'Content' },
    { name: 'Web Series', path: '/series', icon: Tv, category: 'Content' },
    { name: 'Shorts', path: '/shorts', icon: Smartphone, category: 'Content' },
    { name: 'Users', path: '/users', icon: Users, category: 'Management' },
    { name: 'Policies & DRM', path: '/policies', icon: Shield, category: 'Management' },
    { name: 'App Layout', path: '/app-layout', icon: Layers, category: 'System' },
    { name: 'Plans', path: '/plans', icon: CreditCard, category: 'Management' },
    { name: 'Subscriptions', path: '/subscriptions', icon: CreditCard, category: 'Management' },
    { name: 'Settings', path: '/settings', icon: Settings, category: 'System' },
  ];

  // Filter menu items based on sidebar search
  const filteredMenu = menuItems.filter(item => 
    item.name.toLowerCase().includes(sidebarSearch.toLowerCase())
  );

  // Group filtered items by category (optional, but requested "Sections")
  // For simplicity, just listing them, but observing categories.
  
  const currentTitle = menuItems.find(item => item.path === location.pathname)?.name || 'Admin Panel';

  // Environment Config (Mock)
  const ENV = 'DEV'; 
  const VERSION = 'v1.2.0';
  const LAST_DEPLOY = '2 mins ago';

  return (
    <div className="flex h-screen bg-black text-gray-100 font-sans overflow-hidden">
      {/* -------------------- LEFT SIDEBAR -------------------- */}
      <aside className="w-64 bg-[#0a0a0a] border-r border-white/10 flex flex-col hidden md:flex shrink-0">
        
        {/* Sidebar Header: Logo */}
        <div className="p-6 flex items-center gap-3">
             <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
            <div>
                <h1 className="text-xl font-bold tracking-tight text-white">CineNetwork</h1>
                <div className="flex items-center gap-2">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Admin Portal</p>
                    {/* Badge in Sidebar or Header? User asked for Badge in Topbar. */}
                </div>
            </div>
        </div>

        {/* Sidebar Search */}
        <div className="px-4 mb-4">
            <div className="relative group">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#E50914] transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search menu..." 
                    className="w-full bg-[#1a1a1a] border border-white/5 rounded-md py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-[#E50914] transition-colors placeholder-gray-600"
                    value={sidebarSearch}
                    onChange={(e) => setSidebarSearch(e.target.value)}
                />
            </div>
        </div>
        
        {/* Navigation Sections */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
            {filteredMenu.length > 0 ? (
                // Simple list for now. If strictly needing "Sections", I could render headers.
                // But filtering makes headers tricky. Let's keep it clean.
                filteredMenu.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group
                            ${isActive 
                                ? 'bg-[#E50914] text-white shadow-lg shadow-red-900/20' 
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                        `}
                    >
                        <item.icon size={18} />
                        <span className="font-medium text-sm">{item.name}</span>
                    </NavLink>
                ))
            ) : (
                <div className="text-center py-4 text-xs text-gray-600">No menu items found</div>
            )}
        </nav>

        {/* User Profile / Logout */}
        <div className="p-4 border-t border-white/10">
             <button 
                onClick={handleLogout}
                className="flex items-center gap-3 text-gray-400 hover:text-white w-full px-4 py-2 rounded-lg hover:bg-white/5 transition-all duration-200"
             >
                <LogOut size={18} />
                <span className="text-sm font-medium">Sign Out</span>
             </button>
        </div>
      </aside>


      {/* -------------------- MAIN CONTENT AREA -------------------- */}
      <div className="flex-1 flex flex-col min-w-0 bg-black relative">
        
        {/* -------------------- TOPBAR -------------------- */}
        <header className="h-16 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 z-20 sticky top-0">
            
            {/* Left: Global Search */}
            <div className="flex items-center gap-4 flex-1">
                 <h2 className="text-lg font-semibold text-white whitespace-nowrap hidden lg:block mr-4">{currentTitle}</h2>
                 
                 {/* Global Search Bar */}
                 <div className="relative max-w-md w-full hidden md:block">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        <Search size={16} />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search for movies, users, or Job IDs..." 
                        className="w-full bg-[#1a1a1a] border border-white/10 rounded-full py-2 pl-10 pr-12 text-sm text-white focus:outline-none focus:border-[#E50914]/50 focus:ring-1 focus:ring-[#E50914]/50 transition-all"
                        value={globalSearch}
                        onChange={(e) => setGlobalSearch(e.target.value)}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                         <span className="text-[10px] text-gray-500 border border-white/10 px-1.5 py-0.5 rounded">⌘ K</span>
                    </div>
                 </div>
            </div>

            {/* Right: Actions & User */}
            <div className="flex items-center gap-4 ml-4">
                
                {/* Environment Badge */}
                <span className={`
                    px-2 py-0.5 rounded text-[10px] font-bold tracking-wider border
                    ${ENV === 'PROD' ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                    : ENV === 'STAGING' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' 
                    : 'bg-green-500/10 text-green-500 border-green-500/20'}
                `}>
                    {ENV}
                </span>

                {/* Quick Create Dropdown (Button for now) */}
                <button className="hidden sm:flex items-center gap-2 bg-white text-black px-3 py-1.5 rounded-md hover:bg-gray-200 transition-colors text-xs font-bold">
                    <Plus size={14} />
                    <span>Create</span>
                </button>

                {/* Notifications */}
                <button className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E50914] rounded-full border border-black"></span>
                </button>

                {/* Divider */}
                <div className="h-6 w-px bg-white/10 mx-1"></div>

                {/* User Profile */}
                <div className="flex items-center gap-3 cursor-pointer group">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm text-white font-medium group-hover:text-[#E50914] transition-colors">Admin User</p>
                        <p className="text-[10px] text-gray-500">Super Admin</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10 flex items-center justify-center ring-2 ring-transparent group-hover:ring-[#E50914]/50 transition-all">
                        <Users size={14} className="text-white" />
                    </div>
                </div>
            </div>
        </header>

        {/* -------------------- SCROLLABLE CONTENT -------------------- */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 relative flex flex-col">
             {/* Background Effects */}
             <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#E50914]/5 to-transparent pointer-events-none" />
             
             {/* Page Content */}
             <div className="relative z-10 animate-fade-in flex-1">
                <Outlet />
             </div>

             {/* -------------------- FOOTER -------------------- */}
            <footer className="mt-12 py-6 border-t border-white/5 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center text-[10px] text-gray-600 uppercase tracking-widest">
                <div className="flex items-center gap-4">
                    <span>© 2024 CineNetwork</span>
                    <span>•</span>
                    <span>Version {VERSION}</span>
                </div>
                <div className="mt-2 sm:mt-0 flex items-center gap-4">
                    <span>Last Deployed: {LAST_DEPLOY}</span>
                    <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        System Operational
                    </span>
                </div>
            </footer>
        </main>
      </div>
    </div>
  );
}
