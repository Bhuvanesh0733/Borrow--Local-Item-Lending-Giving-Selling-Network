import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ItemCard from '../components/ItemCard';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('listed');
  const [items, setItems] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        if (tab === 'listed') {
          const r = await api.get('/items?limit=50');
          setItems(r.data.items.filter(i => i.owner?._id === (user?._id || user?.id) || i.owner === (user?._id || user?.id)));
        } else {
          const type = tab === 'active' ? 'outgoing' : 'incoming';
          const r = await api.get(`/requests?type=${type}`);
          setRequests(r.data);
        }
      } catch {}
      setLoading(false);
    };
    fetchAll();
  }, [tab, user]);

  const deleteItem = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await api.delete(`/items/${id}`);
      setItems(prev => prev.filter(i => i._id !== id));
      toast.success('Item deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="page dashboard-page">
      <div className="container">
        {/* Profile header */}
        <motion.div className="dashboard-header card"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="dash-avatar">
            {user?.avatar
              ? <img src={`${process.env.REACT_APP_SOCKET_URL}${user.avatar}`} alt={user.name} />
              : <span>{user?.name?.[0]?.toUpperCase()}</span>}
          </div>
          <div className="dash-user-info">
            <h1>{user?.name}</h1>
            <p>{user?.email}</p>
            {user?.bio && <p className="dash-bio">{user.bio}</p>}
          </div>
          <div className="dash-stats">
            <div className="dash-stat">
              <span className="dash-stat-val gradient-text">{user?.trustScore || 0}</span>
              <span>Trust Score</span>
            </div>
            <div className="dash-stat">
              <span className="dash-stat-val gradient-text">{user?.ratingCount || 0}</span>
              <span>Ratings</span>
            </div>
          </div>
          <Link to="/settings" className="btn btn-ghost btn-sm">Edit Profile</Link>
        </motion.div>

        {/* Tabs */}
        <div className="tab-bar" style={{ marginBottom: '24px' }}>
          {[['listed', '📦 My Items'], ['active', '🔄 Borrowing'], ['lending', '📬 Lending']].map(([val, label]) => (
            <button key={val} className={`tab-btn ${tab === val ? 'active' : ''}`} onClick={() => setTab(val)}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex-center" style={{ padding: '60px 0' }}><div className="spinner" /></div>
        ) : (
          <>
            {tab === 'listed' && (
              <div>
                <div className="dash-section-header">
                  <h2>My Listed Items</h2>
                  <Link to="/list" className="btn btn-primary btn-sm">+ Add Item</Link>
                </div>
                {items.length === 0
                  ? <div className="empty-state">You haven't listed anything yet. <Link to="/list">List your first item!</Link></div>
                  : <div className="items-grid">
                      {items.map((item, i) => (
                        <div key={item._id} className="dash-item-wrap">
                          <ItemCard item={item} index={i} />
                          <button className="btn btn-danger btn-sm dash-delete-btn" onClick={() => deleteItem(item._id)}>Delete</button>
                        </div>
                      ))}
                    </div>}
              </div>
            )}

            {(tab === 'active' || tab === 'lending') && (
              <div className="requests-list">
                {requests.length === 0
                  ? <div className="empty-state">No {tab === 'active' ? 'active borrows' : 'lending requests'}.</div>
                  : requests.map((req, i) => (
                      <motion.div key={req._id} className="request-card card"
                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <div className="req-item-img">
                          {req.item?.images?.[0]
                            ? <img src={`${process.env.REACT_APP_SOCKET_URL}${req.item.images[0]}`} alt="" />
                            : <span>📦</span>}
                        </div>
                        <div className="req-info">
                          <Link to={`/items/${req.item?._id}`} className="req-item-title">{req.item?.title}</Link>
                          <div className="req-meta">
                            <span className={`badge badge-${req.status}`}>{req.status}</span>
                            <span className={`badge badge-${req.type}`}>{req.type}</span>
                          </div>
                          {req.dueDate && (
                            <span className="req-due">Due: {new Date(req.dueDate).toLocaleDateString()}</span>
                          )}
                        </div>
                        {req.chatUnlocked && (
                          <Link to={`/chat/${req._id}`} className="btn btn-accent btn-sm">💬 Chat</Link>
                        )}
                      </motion.div>
                    ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
