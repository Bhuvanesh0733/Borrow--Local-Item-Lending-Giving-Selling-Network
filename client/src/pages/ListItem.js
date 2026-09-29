import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import api from '../api/axios';
import './ListItem.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const STEPS = ['Details', 'Photos', 'Pricing', 'Location'];

// ✅ Fix: flies the map to the pinned position
function ChangeView({ position }) {
  const map = useMap();
  const prev = useRef(null);
  useEffect(() => {
    if (position && JSON.stringify(position) !== JSON.stringify(prev.current)) {
      map.flyTo(position, 15, { animate: true, duration: 1.0 });
      prev.current = position;
    }
  }, [position, map]);
  return null;
}

function LocationPicker({ position, setPosition }) {
  useMapEvents({ click(e) { setPosition([e.latlng.lat, e.latlng.lng]); } });
  return position ? <Marker position={position} /> : null;
}

export default function ListItem() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [mapPos, setMapPos] = useState(null);
  const fileRef = useRef();

  const [form, setForm] = useState({
    title: '', description: '', category: 'tools', condition: 'good',
    listingType: 'borrow', price: '', isFree: false, borrowDuration: '',
    images: [], address: ''
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    set('images', files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async () => {
    if (!mapPos) return toast.error('Please pin your location on the map');
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'images') v.forEach(f => fd.append('images', f));
        else fd.append(k, v);
      });
      fd.set('location', JSON.stringify({
        type: 'Point',
        coordinates: [mapPos[1], mapPos[0]],
        address: form.address
      }));
      await api.post('/items', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Item listed successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to list item');
    }
    setSubmitting(false);
  };

  const pinMyLocation = () => {
    navigator.geolocation.getCurrentPosition(pos => {
      setMapPos([pos.coords.latitude, pos.coords.longitude]);
    });
  };

  const canNext = () => {
    if (step === 0) return form.title && form.description && form.category && form.condition;
    if (step === 2) return form.listingType;
    return true;
  };

  return (
    <div className="page list-item-page">
      <div className="container">
        <h1 className="list-title">List an Item</h1>

        {/* Progress */}
        <div className="steps-bar">
          {STEPS.map((s, i) => (
            <div key={s} className={`step ${i <= step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
              <div className="step-dot">{i < step ? '✓' : i + 1}</div>
              <span>{s}</span>
            </div>
          ))}
        </div>

        <motion.div className="list-form card"
          key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>

          {/* Step 0: Details */}
          {step === 0 && (
            <div className="form-step">
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)}
                  placeholder="e.g. Power Drill, Mountain Bike, Camping Tent" />
              </div>
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea className="form-input" rows={4} value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Describe the item, its features, and any important details..." />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-input" value={form.category} onChange={e => set('category', e.target.value)}>
                    {['tools','electronics','books','sports','clothing','furniture','kitchen','other'].map(c =>
                      <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Condition *</label>
                  <select className="form-input" value={form.condition} onChange={e => set('condition', e.target.value)}>
                    {['new','like-new','good','fair','poor'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Photos */}
          {step === 1 && (
            <div className="form-step">
              <div className="upload-area" onClick={() => fileRef.current.click()}>
                <input ref={fileRef} type="file" multiple accept="image/*" onChange={handleFiles} hidden />
                <span className="upload-icon">📸</span>
                <p>Click to upload photos (up to 5)</p>
                <span className="upload-hint">JPG, PNG, WebP — max 5MB each</span>
              </div>
              {previews.length > 0 && (
                <div className="preview-grid">
                  {previews.map((p, i) => (
                    <div key={i} className="preview-img">
                      <img src={p} alt="" />
                      {i === 0 && <span className="preview-main">Main</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Pricing */}
          {step === 2 && (
            <div className="form-step">
              <div className="form-group">
                <label className="form-label">Listing Type *</label>
                <div className="type-cards">
                  {[['borrow','🔄','Lend / Borrow','Temporary loan with a return date'],
                    ['sell','💰','Sell','Permanent sale for a price'],
                    ['give','🎁','Give Away','Free, no strings attached']].map(([val, icon, label, desc]) => (
                    <div key={val} className={`type-card ${form.listingType === val ? 'active' : ''}`}
                      onClick={() => set('listingType', val)}>
                      <span className="type-icon">{icon}</span>
                      <strong>{label}</strong>
                      <span>{desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {form.listingType !== 'give' && (
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      {form.listingType === 'borrow' ? 'Deposit / Fee (optional)' : 'Price ($)'}
                    </label>
                    <input className="form-input" type="number" min="0" value={form.price}
                      onChange={e => set('price', e.target.value)} placeholder="0.00" />
                  </div>
                  {form.listingType === 'borrow' && (
                    <div className="form-group">
                      <label className="form-label">Max Borrow Duration (days)</label>
                      <input className="form-input" type="number" min="1" value={form.borrowDuration}
                        onChange={e => set('borrowDuration', e.target.value)} placeholder="e.g. 7" />
                    </div>
                  )}
                </div>
              )}

              {form.listingType !== 'give' && (
                <label className="filter-toggle-row" style={{ fontSize: '0.9rem', gap: '10px' }}>
                  <input type="checkbox" checked={form.isFree} onChange={e => set('isFree', e.target.checked)} />
                  <span>Mark as Free (override price)</span>
                </label>
              )}
            </div>
          )}

          {/* Step 3: Location */}
          {step === 3 && (
            <div className="form-step">
              <div className="form-group">
                <label className="form-label">Address / Area (optional)</label>
                <input className="form-input" value={form.address} onChange={e => set('address', e.target.value)}
                  placeholder="e.g. Downtown, Brooklyn, NY" />
              </div>
              <div className="location-map-wrap">
                <div className="location-map-header">
                  <span>Click on the map to pin your item's location</span>
                  <button className="btn btn-ghost btn-sm" onClick={pinMyLocation}>📍 Use My Location</button>
                </div>
                <MapContainer center={mapPos || [20.5937, 78.9629]} zoom={mapPos ? 15 : 5} style={{ height: '320px', borderRadius: '12px' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
                  <ChangeView position={mapPos} />
                  <LocationPicker position={mapPos} setPosition={setMapPos} />
                </MapContainer>
                {mapPos && <p className="location-coords">📍 {mapPos[0].toFixed(5)}, {mapPos[1].toFixed(5)}</p>}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="form-nav">
            {step > 0 && <button className="btn btn-ghost" onClick={() => setStep(s => s - 1)}>← Back</button>}
            <div style={{ flex: 1 }} />
            {step < STEPS.length - 1 ? (
              <button className="btn btn-primary" onClick={() => setStep(s => s + 1)} disabled={!canNext()}>
                Next →
              </button>
            ) : (
              <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Listing...' : '🚀 Publish Item'}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
