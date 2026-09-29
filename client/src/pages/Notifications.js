import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import './Notifications.css';

const icons = { request: '📬', message: '💬', accepted: '✅', declined: '❌', due_date: '⏰', rating: '⭐' };

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications').then(r => setNotifications(r.data)).finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="page notif-page">
      <div className="container">
        <div className="notif-header">
          <h1 className="page-heading">Notifications</h1>
          {notifications.some(n => !n.read) && (
            <button className="btn btn-ghost btn-sm" onClick={markAllRead}>Mark all read</button>
          )}
        </div>

        {loading ? (
          <div className="flex-center" style={{ padding: '80px 0' }}><div className="spinner" /></div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">No notifications yet.</div>
        ) : (
          <div className="notif-list">
            {notifications.map((n, i) => (
              <motion.div key={n._id}
                className={`notif-item card ${!n.read ? 'unread' : ''}`}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                onClick={() => !n.read && markRead(n._id)}>
                <span className="notif-icon">{icons[n.type] || '🔔'}</span>
                <div className="notif-body">
                  <strong>{n.title}</strong>
                  <p>{n.body}</p>
                  <span className="notif-time">{new Date(n.createdAt).toLocaleString()}</span>
                </div>
                {n.link && (
                  <Link to={n.link} className="btn btn-ghost btn-sm" onClick={e => e.stopPropagation()}>View →</Link>
                )}
                {!n.read && <span className="unread-dot" />}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
