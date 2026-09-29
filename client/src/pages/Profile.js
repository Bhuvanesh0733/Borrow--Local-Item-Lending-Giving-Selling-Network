import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ItemCard from '../components/ItemCard';
import './Profile.css';

export default function Profile() {
  const { id } = useParams();
  const { user: me } = useAuth();
  const [profile, setProfile] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingForm, setRatingForm] = useState({ score: 5, comment: '', requestId: '' });
  const [showRateForm, setShowRateForm] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/users/${id}`),
      api.get(`/items?limit=20`)
    ]).then(([userRes, itemsRes]) => {
      setProfile(userRes.data.user);
      setRatings(userRes.data.ratings);
      setItems(itemsRes.data.items.filter(i => (i.owner?._id || i.owner) === id));
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const submitRating = async (e) => {
    e.preventDefault();
    try {
      await api.post('/ratings', { ...ratingForm, rated: id });
      toast.success('Rating submitted!');
      setShowRateForm(false);
      const r = await api.get(`/users/${id}`);
      setProfile(r.data.user);
      setRatings(r.data.ratings);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit rating');
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!profile) return <div className="page"><div className="container"><p>User not found.</p></div></div>;

  const isMe = me?._id === id || me?.id === id;
  const avgRating = ratings.length ? (ratings.reduce((s, r) => s + r.score, 0) / ratings.length).toFixed(1) : null;

  return (
    <div className="page profile-page">
      <div className="container">
        <motion.div className="profile-header card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="profile-avatar">
            {profile.avatar
              ? <img src={`${process.env.REACT_APP_SOCKET_URL}${profile.avatar}`} alt={profile.name} />
              : <span>{profile.name?.[0]?.toUpperCase()}</span>}
          </div>
          <div className="profile-info">
            <h1>{profile.name}</h1>
            {profile.bio && <p className="profile-bio">{profile.bio}</p>}
            {profile.location?.address && <p className="profile-location">📍 {profile.location.address}</p>}
          </div>
          <div className="profile-stats">
            <div className="profile-stat">
              <span className="gradient-text">{profile.trustScore || 0}</span>
              <span>Trust Score</span>
            </div>
            <div className="profile-stat">
              <span className="gradient-text">{avgRating || '—'}</span>
              <span>Avg Rating</span>
            </div>
            <div className="profile-stat">
              <span className="gradient-text">{ratings.length}</span>
              <span>Reviews</span>
            </div>
          </div>
          {isMe
            ? <Link to="/settings" className="btn btn-ghost btn-sm">Edit Profile</Link>
            : me && <button className="btn btn-primary btn-sm" onClick={() => setShowRateForm(true)}>⭐ Rate</button>}
        </motion.div>

        {showRateForm && (
          <motion.form className="rate-form card" onSubmit={submitRating}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <h3>Leave a Rating</h3>
            <div className="star-picker">
              {[1,2,3,4,5].map(s => (
                <button key={s} type="button"
                  className={`star-btn ${ratingForm.score >= s ? 'active' : ''}`}
                  onClick={() => setRatingForm(f => ({ ...f, score: s }))}>★</button>
              ))}
            </div>
            <input className="form-input" placeholder="Request ID (required)" value={ratingForm.requestId}
              onChange={e => setRatingForm(f => ({ ...f, requestId: e.target.value }))} required />
            <textarea className="form-input" rows={2} placeholder="Comment (optional)"
              value={ratingForm.comment} onChange={e => setRatingForm(f => ({ ...f, comment: e.target.value }))} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowRateForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm">Submit</button>
            </div>
          </motion.form>
        )}

        {/* Items */}
        {items.length > 0 && (
          <div className="profile-section">
            <h2 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Listed Items</h2>
            <div className="items-grid">
              {items.map((item, i) => <ItemCard key={item._id} item={item} index={i} />)}
            </div>
          </div>
        )}

        {/* Ratings */}
        {ratings.length > 0 && (
          <div className="profile-section">
            <h2 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Reviews</h2>
            <div className="ratings-list">
              {ratings.map((r, i) => (
                <motion.div key={r._id} className="rating-card card"
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <div className="rating-header">
                    <div className="rating-avatar">{r.rater?.name?.[0]?.toUpperCase()}</div>
                    <span className="rating-name">{r.rater?.name}</span>
                    <div className="rating-stars">{'★'.repeat(r.score)}{'☆'.repeat(5 - r.score)}</div>
                  </div>
                  {r.comment && <p className="rating-comment">{r.comment}</p>}
                  <span className="rating-date">{new Date(r.createdAt).toLocaleDateString()}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
