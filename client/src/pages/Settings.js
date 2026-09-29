import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './Settings.css';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    address: user?.location?.address || '',
    notifRequests: user?.notificationPrefs?.requests ?? true,
    notifMessages: user?.notificationPrefs?.messages ?? true,
    notifDueDates: user?.notificationPrefs?.dueDates ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileRef = useRef();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await api.put('/users/me', {
        name: form.name,
        bio: form.bio,
        location: { ...user?.location, address: form.address },
        notificationPrefs: {
          requests: form.notifRequests,
          messages: form.notifMessages,
          dueDates: form.notifDueDates,
        }
      });
      updateUser(r.data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAvatar(true);
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      const r = await api.post('/users/me/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser(r.data);
      toast.success('Avatar updated!');
    } catch { toast.error('Failed to upload avatar'); }
    setUploadingAvatar(false);
  };

  return (
    <div className="page settings-page">
      <div className="container">
        <h1 className="page-heading">Settings</h1>

        <div className="settings-grid">
          {/* Avatar */}
          <motion.div className="settings-section card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="settings-section-title">Profile Photo</h2>
            <div className="avatar-upload-area">
              <div className="settings-avatar">
                {user?.avatar
                  ? <img src={`${process.env.REACT_APP_SOCKET_URL}${user.avatar}`} alt={user.name} />
                  : <span>{user?.name?.[0]?.toUpperCase()}</span>}
              </div>
              <div>
                <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current.click()} disabled={uploadingAvatar}>
                  {uploadingAvatar ? 'Uploading...' : '📸 Change Photo'}
                </button>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatarUpload} />
                <p className="settings-hint">JPG, PNG or WebP. Max 5MB.</p>
              </div>
            </div>
          </motion.div>

          {/* Profile info */}
          <motion.form className="settings-section card" onSubmit={handleSave}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 className="settings-section-title">Profile Info</h2>
            <div className="form-group">
              <label className="form-label">Display Name</label>
              <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea className="form-input" rows={3} value={form.bio}
                onChange={e => set('bio', e.target.value)} placeholder="Tell others about yourself..." />
            </div>
            <div className="form-group">
              <label className="form-label">Location / Area</label>
              <input className="form-input" value={form.address}
                onChange={e => set('address', e.target.value)} placeholder="e.g. Brooklyn, NY" />
            </div>

            <h2 className="settings-section-title" style={{ marginTop: '24px' }}>Notifications</h2>
            {[
              ['notifRequests', 'New requests on my items'],
              ['notifMessages', 'New chat messages'],
              ['notifDueDates', 'Loan due date reminders'],
            ].map(([key, label]) => (
              <label key={key} className="settings-toggle">
                <span>{label}</span>
                <div className={`toggle-switch ${form[key] ? 'on' : ''}`} onClick={() => set(key, !form[key])}>
                  <div className="toggle-knob" />
                </div>
              </label>
            ))}

            <button type="submit" className="btn btn-primary" style={{ marginTop: '24px' }} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </motion.form>
        </div>
      </div>
    </div>
  );
}
