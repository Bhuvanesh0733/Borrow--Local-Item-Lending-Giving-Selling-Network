import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (user) {
      api.get('/notifications').then(r => {
        setUnread(r.data.filter(n => !n.read).length);
      }).catch(() => {});
    }
  }, [user, location.pathname]);

  const handleLogout = () => { logout(); navigate('/'); setMenuOpen(false); };
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">◈</div>
          <span className="logo-text">Borrow</span>
        </Link>

        <div className="navbar-links">
          <Link to="/map" className={isActive('/map') ? 'active' : ''}>Explore Map</Link>
          <Link to="/search" className={isActive('/search') ? 'active' : ''}>Browse</Link>
          {user && <Link to="/requests" className={isActive('/requests') ? 'active' : ''}>Requests</Link>}
          {user && <Link to="/list" className="btn btn-primary btn-sm" style={{ marginLeft: 8 }}>+ List Item</Link>}
        </div>

        <div className="navbar-actions">
          {user ? (
            <>
              <Link to="/notifications" className="notif-btn" title="Notifications">
                🔔
                {unread > 0 && <span className="notif-badge">{unread}</span>}
              </Link>
              <div className="avatar-menu">
                <button onClick={() => setMenuOpen(!menuOpen)} className="avatar-btn" title={user.name}>
                  {user.avatar
                    ? <img src={`${process.env.REACT_APP_SOCKET_URL}${user.avatar}`} alt={user.name} />
                    : <span>{user.name?.[0]?.toUpperCase()}</span>}
                </button>
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div className="dropdown"
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}>
                      <Link to="/dashboard" onClick={() => setMenuOpen(false)}>📊 Dashboard</Link>
                      <Link to="/settings" onClick={() => setMenuOpen(false)}>⚙️ Settings</Link>
                      <div className="dropdown-divider" />
                      <button onClick={handleLogout} className="logout-btn">🚪 Logout</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
