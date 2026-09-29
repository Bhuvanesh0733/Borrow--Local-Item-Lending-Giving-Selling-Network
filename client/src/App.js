import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MapExplorer from './pages/MapExplorer';
import SearchResults from './pages/SearchResults';
import ItemDetail from './pages/ItemDetail';
import ListItem from './pages/ListItem';
import Requests from './pages/Requests';
import Chat from './pages/Chat';
import Dashboard from './pages/Dashboard';
import Notifications from './pages/Notifications';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  return user ? children : <Navigate to="/login" />;
};

const AppRoutes = () => (
  <>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/map" element={<MapExplorer />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/items/:id" element={<ItemDetail />} />
      <Route path="/list" element={<PrivateRoute><ListItem /></PrivateRoute>} />
      <Route path="/requests" element={<PrivateRoute><Requests /></PrivateRoute>} />
      <Route path="/chat/:requestId" element={<PrivateRoute><Chat /></PrivateRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
      <Route path="/profile/:id" element={<Profile />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
    </Routes>
    <Toaster position="top-right" toastOptions={{
      style: {
        background: '#fff', color: '#0D0F14',
        border: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
        borderRadius: '12px', fontSize: '0.875rem', fontWeight: '500',
      },
      success: { iconTheme: { primary: '#9ACD00', secondary: '#fff' } },
      error: { iconTheme: { primary: '#FF3D57', secondary: '#fff' } },
    }} />
  </>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
