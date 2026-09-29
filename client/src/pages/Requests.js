import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import './Requests.css';

const statusColors = {
  pending: 'badge-pending',
  accepted: 'badge-accepted',
  declined: 'badge-declined',
  completed: 'badge-completed',
  cancelled: 'badge-completed'
};

export default function Requests() {
  const [tab, setTab] = useState('incoming');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fix: wrap in useCallback so it doesn't re-create on every render
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get(`/requests?type=${tab}`);
      setRequests(r.data);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
      setRequests([]);
    }
    setLoading(false);
  }, [tab]); // only re-create when tab changes

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAction = async (id, action) => {
    try {
      await api.put(`/requests/${id}/${action}`);
      toast.success(`Request ${action}ed!`);
      fetchRequests(); // refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div className="page requests-page">
      <div className="container">
        <h1 className="page-heading">Requests & Inbox</h1>

        <div className="tab-bar" style={{ marginBottom: 28 }}>
          <button className={`tab-btn ${tab === 'incoming' ? 'active' : ''}`} onClick={() => setTab('incoming')}>
            📬 Incoming
          </button>
          <button className={`tab-btn ${tab === 'outgoing' ? 'active' : ''}`} onClick={() => setTab('outgoing')}>
            📤 Outgoing
          </button>
        </div>

        {loading ? (
          <div className="flex-center" style={{ padding: '80px 0' }}><div className="spinner" /></div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <p style={{ fontSize: '2rem', marginBottom: 12 }}>{tab === 'incoming' ? '📬' : '📤'}</p>
            <p>No {tab} requests yet.</p>
            {tab === 'outgoing' && <Link to="/search" style={{ color: 'var(--accent-dark)', fontWeight: 600, marginTop: 8, display: 'inline-block' }}>Browse items →</Link>}
          </div>
        ) : (
          <div className="requests-list">
            {requests.map((req, i) => (
              <motion.div key={req._id} className="request-card card"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="req-item-img">
                  {req.item?.images?.[0]
                    ? <img src={`${process.env.REACT_APP_SOCKET_URL}${req.item.images[0]}`} alt="" />
                    : <span>📦</span>}
                </div>
                <div className="req-info">
                  <Link to={`/items/${req.item?._id}`} className="req-item-title">{req.item?.title}</Link>
                  <div className="req-meta">
                    <span className={`badge ${statusColors[req.status]}`}>{req.status}</span>
                    <span className={`badge badge-${req.type}`}>{req.type}</span>
                    <span className="req-user">
                      {tab === 'incoming' ? `from ${req.requester?.name}` : `to ${req.owner?.name}`}
                    </span>
                  </div>
                  {req.message && <p className="req-message">"{req.message}"</p>}
                  <span className="req-date">{new Date(req.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="req-actions">
                  {tab === 'incoming' && req.status === 'pending' && (
                    <>
                      <button className="btn btn-primary btn-sm" onClick={() => handleAction(req._id, 'accept')}>✓ Accept</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleAction(req._id, 'decline')}>✕ Decline</button>
                    </>
                  )}
                  {req.chatUnlocked && (
                    <Link to={`/chat/${req._id}`} className="btn btn-accent btn-sm">💬 Chat</Link>
                  )}
                  {tab === 'outgoing' && req.status === 'pending' && (
                    <button className="btn btn-ghost btn-sm" onClick={() => handleAction(req._id, 'cancel')}>Cancel</button>
                  )}
                  {req.status === 'accepted' && (
                    <button className="btn btn-ghost btn-sm" onClick={() => handleAction(req._id, 'complete')}>✓ Complete</button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
