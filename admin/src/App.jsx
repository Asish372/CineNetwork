import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import { AuthProvider } from './context/AuthContext';

// Context & Utils
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';

// Layout
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Catalog from './pages/Catalog';
import ContentDetail from './pages/ContentDetail';
import Policies from './pages/Policies';
import Settings from './pages/Settings';
import Movies from './pages/Movies';
import Series from './pages/Series';
import Shorts from './pages/Shorts';
import Users from './pages/Users';
import AppLayout from './pages/AppLayout';
import Plans from './pages/Plans';
import Subscriptions from './pages/Subscriptions';

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <Router>
          <AuthProvider>
            <SocketProvider>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                
                {/* Protected Routes */}
                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/catalog" element={<Catalog />} />
                  <Route path="/content/:id" element={<ContentDetail />} />
                  <Route path="/policies" element={<Policies />} />
                  <Route path="/app-layout" element={<AppLayout />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/movies" element={<Movies />} />
                  <Route path="/series" element={<Series />} />
                  <Route path="/shorts" element={<Shorts />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/plans" element={<Plans />} />
                  <Route path="/subscriptions" element={<Subscriptions />} />
                </Route>
    
                {/* Redirect Root to Dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                {/* 404 Fallback */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </SocketProvider>
          </AuthProvider>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
