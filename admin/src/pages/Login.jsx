import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import logo from '../assets/logo.png';

export default function Login() {
  const [email, setEmail] = useState('admin');
  const [password, setPassword] = useState('258022');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Clear existing sessions when landing on Login
  React.useEffect(() => {
    localStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_token');
  }, []);

  const { login } = useAuth();

  // Clear existing sessions when landing on Login
  React.useEffect(() => {
    localStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_token');
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password, rememberMe);
      navigate('/dashboard'); 
    } catch (error) {
      alert("Login Failed: " + (error.response?.data?.message || "Invalid credentials"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] relative overflow-hidden">
      
      {/* Animated Background Orbs */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      <div className="w-full max-w-md bg-black/40 p-12 rounded-2xl backdrop-blur-xl border border-white/10 shadow-2xl relative z-10 flex flex-col items-center">
        
        {/* Centered Logo */}
        <img 
            src={logo} 
            alt="CineNetwork" 
            className="mb-8 object-contain hover:scale-105 transition-transform duration-300" 
            style={{ height: '80px', maxWidth: '250px' }} 
        />

        <h1 className="text-3xl font-bold text-white mb-8 self-start w-full text-center">Admin Login</h1>

        <form onSubmit={handleLogin} className="space-y-6 w-full">
          <div className="space-y-4">
            <div className="relative">
              <input 
                type="text"
                className="w-full bg-[#333] text-white px-5 py-4 rounded bg-[#333333] focus:outline-none focus:bg-[#454545] border-b-2 border-transparent focus:border-red-600 transition-all peer placeholder-transparent"
                placeholder="Email or phone number"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label 
                htmlFor="email"
                className="absolute left-5 top-4 text-gray-400 text-sm transition-all peer-focus:text-xs peer-focus:-top-2 peer-focus:text-gray-200 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 pointer-events-none"
              >
                Username or Email
              </label>
            </div>

            <div className="relative">
              <input 
                type="password"
                className="w-full bg-[#333] text-white px-5 py-4 rounded bg-[#333333] focus:outline-none focus:bg-[#454545] border-b-2 border-transparent focus:border-red-600 transition-all peer placeholder-transparent"
                placeholder="Password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
               <label 
                htmlFor="password"
                className="absolute left-5 top-4 text-gray-400 text-sm transition-all peer-focus:text-xs peer-focus:-top-2 peer-focus:text-gray-200 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 pointer-events-none"
              >
                Password
              </label>
            </div>
          </div>

          <button 
            disabled={loading}
            className={`w-full py-4 rounded font-bold text-white text-lg mt-4 transition cursor-pointer flex items-center justify-center gap-2 ${
                loading ? 'bg-red-800' : 'bg-[#E50914] hover:bg-[#c11119] shadow-lg shadow-red-900/40'
            }`}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            {!loading && <ArrowRight size={20} />}
          </button>
          
          <div className="flex justify-between items-center text-sm text-gray-400 mt-2 w-full px-1">
             <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  className="accent-red-600 w-4 h-4 cursor-pointer" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
             </div>
             <button type="button" className="hover:text-white transition-colors">Need help?</button>
          </div>

        </form>
      </div>
    </div>
  );
}
