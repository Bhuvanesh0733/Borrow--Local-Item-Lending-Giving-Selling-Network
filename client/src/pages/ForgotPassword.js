import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import './Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset link sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-glow auth-glow-1" />
        <div className="auth-glow auth-glow-2" />
      </div>
      <motion.div className="auth-card card"
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <div className="auth-logo"><span>◈</span> Borrow</div>
        <h1 className="auth-title">Reset Password</h1>
        <p className="auth-sub">We'll send you a reset link</p>

        {sent ? (
          <div className="auth-success">
            <span>✅</span>
            <p>Check your email for the reset link.</p>
            <Link to="/login" className="btn btn-primary" style={{ marginTop: '16px' }}>Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" required value={email}
                onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p className="auth-switch"><Link to="/login">← Back to Login</Link></p>
      </motion.div>
    </div>
  );
}
