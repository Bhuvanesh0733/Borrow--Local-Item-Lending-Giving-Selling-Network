import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './ItemDetail.css';

export default function ItemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [requesting, setRequesting] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [reqMsg, setReqMsg] = useState('');

  useEffect(() => {
    api.get(`/items/${id}`).then(r => setItem(r.data)).catch(() => navigate('/search')).finally(() => setLoading(false));
  }, [id, navigate]);

  const handleRequest = async () => {
    if (!user) return navigate('/login');
    setRequesting(true);
    try {
      const type = item.listingType === 'sell' ? 'buy' : item.listingType === 'give' ? 'free' : 'borrow';
      await api.post('/requests', { item: item._id, owner: item.owner._id, type, message: reqMsg });
      toast.success('Request sent!');
      setShowRequestForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    }
    setRequesting(false);
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!item) return null;

  const isOwner = user?._id === item.owner._id || user?.id === item.owner._id;
  const imgs = item.images?.length ? item.images : [];

  return (
    <div className="page item-detail-page">
      <div className="container">
        <Link to="/search" className="back-link">← Back to Browse</Link>

        <div className="item-detail-grid">
          {/* Images */}
          <motion.div className="item-images" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="item-main-img">
              {imgs.length > 0
                ? <img src={`${process.env.REACT_APP_SOCKET_URL}${imgs[activeImg]}`} alt={item.title} />
                : <div className="img-placeholder">📦</div>}
            </div>
            {imgs.length > 1 && (
              <div className="img-thumbs">
                {imgs.map((img, i) => (
                  <button key={i} className={`img-thumb ${activeImg === i ? 'active' : ''}`}
                    onClick={() => setActiveImg(i)}>
                    <img src={`${process.env.REACT_APP_SOCKET_URL}${img}`} alt="" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div className="item-info" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="item-badges">
              <span className={`badge badge-${item.listingType}`}>{item.listingType}</span>
              {item.isFree && <span className="badge badge-free">Free</span>}
              <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--gray-400)' }}>
                {item.condition}
              </span>
            </div>

            <h1 className="item-title">{item.title}</h1>

            <div className="item-price">
              {item.isFree || item.listingType === 'give'
                ? <span className="price-free">Free</span>
                : item.price > 0
                  ? <span className="price-paid">${item.price}</span>
                  : <span className="price-free">Free</span>}
              {item.listingType === 'borrow' && item.borrowDuration && (
                <span className="price-duration">for {item.borrowDuration} days</span>
              )}
            </div>

            <p className="item-desc">{item.description}</p>

            <div className="item-meta-row">
              <span>📂 {item.category}</span>
              <span>👁 {item.views} views</span>
              {item.location?.address && <span>📍 {item.location.address}</span>}
            </div>

            {/* Owner */}
            <Link to={`/profile/${item.owner._id}`} className="owner-card card">
              <div className="owner-avatar-lg">
                {item.owner.avatar
                  ? <img src={`${process.env.REACT_APP_SOCKET_URL}${item.owner.avatar}`} alt={item.owner.name} />
                  : <span>{item.owner.name?.[0]?.toUpperCase()}</span>}
              </div>
              <div>
                <span className="owner-name">{item.owner.name}</span>
                {item.owner.trustScore > 0 && (
                  <span className="owner-trust">⭐ {item.owner.trustScore} trust score ({item.owner.ratingCount} ratings)</span>
                )}
              </div>
              <span className="owner-arrow">→</span>
            </Link>

            {/* Actions */}
            {!isOwner && item.isAvailable && (
              <div className="item-actions">
                {!showRequestForm ? (
                  <button className="btn btn-primary btn-lg" style={{ width: '100%' }}
                    onClick={() => setShowRequestForm(true)}>
                    {item.listingType === 'borrow' ? '🔄 Request to Borrow'
                      : item.listingType === 'give' ? '🎁 Request for Free'
                      : '💰 Request to Buy'}
                  </button>
                ) : (
                  <div className="request-form card">
                    <h4>Send a message with your request</h4>
                    <textarea className="form-input" rows={3} value={reqMsg}
                      onChange={e => setReqMsg(e.target.value)}
                      placeholder="Introduce yourself and explain why you need this item..." />
                    <div className="request-form-actions">
                      <button className="btn btn-ghost" onClick={() => setShowRequestForm(false)}>Cancel</button>
                      <button className="btn btn-primary" onClick={handleRequest} disabled={requesting}>
                        {requesting ? 'Sending...' : 'Send Request'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {isOwner && (
              <div className="item-actions">
                <Link to={`/list?edit=${item._id}`} className="btn btn-outline">Edit Item</Link>
                <span className="badge badge-accepted">Your Item</span>
              </div>
            )}

            {!item.isAvailable && (
              <div className="unavailable-notice">This item is currently unavailable</div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
