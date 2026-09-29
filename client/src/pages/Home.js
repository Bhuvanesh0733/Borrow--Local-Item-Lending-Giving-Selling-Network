import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import SearchBar from '../components/SearchBar';
import ItemCard from '../components/ItemCard';
import './Home.css';

const HOW_IT_WORKS = [
  { icon: '📍', num: '01', title: 'Pin Your Location', desc: 'Set your area to discover items nearby and let lenders find you.' },
  { icon: '🔍', num: '02', title: 'Browse & Search', desc: 'Find tools, books, gear — anything you need on the interactive map.' },
  { icon: '🤝', num: '03', title: 'Request & Connect', desc: 'Send a request. Once accepted, a private chat is unlocked.' },
  { icon: '⭐', num: '04', title: 'Rate & Build Trust', desc: 'Leave ratings to build your community trust score.' },
];

const CATEGORIES = [
  { emoji: '🔧', name: 'Tools', value: 'tools' },
  { emoji: '💻', name: 'Electronics', value: 'electronics' },
  { emoji: '📚', name: 'Books', value: 'books' },
  { emoji: '⚽', name: 'Sports', value: 'sports' },
  { emoji: '👕', name: 'Clothing', value: 'clothing' },
  { emoji: '🪑', name: 'Furniture', value: 'furniture' },
  { emoji: '🍳', name: 'Kitchen', value: 'kitchen' },
  { emoji: '📦', name: 'Other', value: 'other' },
];

const STATS = [
  { val: '10K+', label: 'Items Listed' },
  { val: '5K+', label: 'Happy Users' },
  { val: '$2M+', label: 'Saved Together' },
  { val: '50+', label: 'Categories' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/items?limit=8').then(r => setFeatured(r.data.items)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-glow hero-glow-1" />
          <div className="hero-glow hero-glow-2" />
          <div className="hero-glow hero-glow-3" />
        </div>
        <div className="container hero-content">
          <motion.div className="hero-text"
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
            <span className="hero-eyebrow">🌍 Local Lending Network</span>
            <h1 className="hero-title">
              Borrow, Lend &<br />
              <span className="gradient-text">Build Community</span>
            </h1>
            <p className="hero-desc">
              Find items you need nearby. Lend what you don't use. Save money, reduce waste, and connect with your neighbors.
            </p>
            <div className="hero-search">
              <SearchBar />
            </div>
            <div className="hero-ctas">
              <Link to="/map" className="btn btn-primary btn-lg">🗺 Explore Map</Link>
              <Link to="/register" className="btn btn-outline btn-lg">Join Free →</Link>
            </div>
            <div className="hero-trust">
              <div className="trust-avatars">
                {['A','B','C','D'].map(l => <div key={l} className="trust-avatar">{l}</div>)}
              </div>
              <span>Trusted by <strong>5,000+</strong> neighbors</span>
            </div>
          </motion.div>

          <motion.div className="hero-map-preview"
            initial={{ opacity: 0, scale: 0.88, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}>
            <div className="map-preview-card">
              <div className="map-preview-inner">
                <div className="map-grid" />
                {/* Simulated streets */}
                <div className="map-road-h" style={{ top: '40%' }} />
                <div className="map-road-h" style={{ top: '65%' }} />
                <div className="map-road-v" style={{ left: '35%' }} />
                <div className="map-road-v" style={{ left: '70%' }} />
                {/* Blocks */}
                <div className="map-block" style={{ top: '15%', left: '10%', width: '22%', height: '20%' }} />
                <div className="map-block" style={{ top: '15%', left: '40%', width: '28%', height: '18%' }} />
                <div className="map-block" style={{ top: '45%', left: '38%', width: '30%', height: '17%' }} />
                <div className="map-block" style={{ top: '70%', left: '10%', width: '22%', height: '20%' }} />

                {/* Pins */}
                <div className="map-pin pin-1">
                  <div className="map-pin-dot"><span>🔧</span></div>
                  <div className="map-pin-shadow" />
                </div>
                <div className="map-pin pin-2">
                  <div className="map-pin-dot"><span>📚</span></div>
                  <div className="map-pin-shadow" />
                </div>
                <div className="map-pin pin-3">
                  <div className="map-pin-dot"><span>🎁</span></div>
                  <div className="map-pin-shadow" />
                </div>
                <div className="map-pin pin-4">
                  <div className="map-pin-dot"><span>💻</span></div>
                  <div className="map-pin-shadow" />
                </div>

                {/* Popup */}
                <div className="map-preview-popup">
                  <div className="popup-img">🔧</div>
                  <div className="popup-info">
                    <strong>Power Drill</strong>
                    <span>Free · 0.3km away</span>
                  </div>
                </div>

                <div className="map-preview-label">
                  <span className="pulse-dot" />
                  <span>24 live items near you</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container stats-grid">
          {STATS.map(({ val, label }, i) => (
            <motion.div key={label} className="stat-card"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }} viewport={{ once: true }}>
              <span className="stat-value gradient-text">{val}</span>
              <span className="stat-label">{label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <div className="container">
          <h2 className="section-title">Browse by Category</h2>
          <div className="cat-grid">
            {CATEGORIES.map((cat, i) => (
              <motion.div key={cat.value}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }} viewport={{ once: true }}>
                <Link to={`/search?category=${cat.value}`} className="cat-item">
                  <span className="cat-emoji">{cat.emoji}</span>
                  {cat.name}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="how-section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="how-grid">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div key={step.title} className="how-card"
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
                <div className="how-step-num">{step.num}</div>
                <span className="how-icon">{step.icon}</span>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Items */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Nearby</h2>
            <Link to="/search" className="btn btn-ghost btn-sm">View All →</Link>
          </div>
          {loading ? (
            <div className="flex-center" style={{ padding: '60px 0' }}><div className="spinner" /></div>
          ) : (
            <div className="items-grid">
              {featured.map((item, i) => <ItemCard key={item._id} item={item} index={i} />)}
            </div>
          )}
          {!loading && featured.length === 0 && (
            <div className="empty-state">
              <p>No items yet. <Link to="/list">Be the first to list one!</Link></p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <motion.div className="cta-card"
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="cta-orbs">
              <div className="cta-orb cta-orb-1" />
              <div className="cta-orb cta-orb-2" />
            </div>
            <h2>Have something to share?</h2>
            <p>List your items in under 2 minutes and start earning trust in your community.</p>
            <Link to="/list" className="btn btn-primary btn-lg">🚀 List an Item</Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
