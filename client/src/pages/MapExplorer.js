import React, { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import SearchBar from '../components/SearchBar';
import './MapExplorer.css';

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Type config
const TYPE_CONFIG = {
  borrow: { emoji: '🔄', color: '#0077FF', label: 'Borrow' },
  sell:   { emoji: '💰', color: '#9ACD00', label: 'Sell' },
  give:   { emoji: '🎁', color: '#00B96B', label: 'Give' },
};

const createCustomIcon = (type, isFree) => {
  const cfg = isFree ? { emoji: '🎁', color: '#00B96B' } : (TYPE_CONFIG[type] || TYPE_CONFIG.sell);
  return L.divIcon({
    className: '',
    html: `
      <div class="map-marker-wrap">
        <div class="map-marker" style="background:${cfg.color}">
          <span>${cfg.emoji}</span>
        </div>
        <div class="map-marker-shadow"></div>
      </div>
    `,
    iconSize: [42, 50],
    iconAnchor: [21, 48],
    popupAnchor: [0, -50],
  });
};

const myLocationIcon = L.divIcon({
  className: '',
  html: '<div class="my-location-marker"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const CATEGORIES = ['all', 'tools', 'electronics', 'books', 'sports', 'clothing', 'furniture', 'kitchen', 'other'];
const TYPES = ['all', 'borrow', 'sell', 'give'];

// Map tile — OpenStreetMap (completely free, no API key ever)
const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// ✅ Flies to a position when it changes
function FlyToPosition({ position, zoom = 14 }) {
  const map = useMap();
  const prevPos = useRef(null);
  useEffect(() => {
    if (position && JSON.stringify(position) !== JSON.stringify(prevPos.current)) {
      map.flyTo(position, zoom, { animate: true, duration: 1.2 });
      prevPos.current = position;
    }
  }, [position, zoom, map]);
  return null;
}

// ✅ Auto-fits map to show all items when items load
function FitBounds({ items }) {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (items.length > 0 && !fitted.current) {
      const validItems = items.filter(i => i.location?.coordinates?.length >= 2);
      if (validItems.length === 1) {
        const [lng, lat] = validItems[0].location.coordinates;
        map.flyTo([lat, lng], 14, { animate: true, duration: 1.0 });
      } else if (validItems.length > 1) {
        const bounds = L.latLngBounds(
          validItems.map(i => [i.location.coordinates[1], i.location.coordinates[0]])
        );
        map.flyToBounds(bounds, { padding: [60, 60], maxZoom: 15, animate: true, duration: 1.0 });
      }
      fitted.current = true;
    }
    // Reset when items change (new filter)
    if (items.length === 0) fitted.current = false;
  }, [items, map]);
  return null;
}

export default function MapExplorer() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [flyTarget, setFlyTarget] = useState(null);
  const [userPos, setUserPos] = useState(null);
  const [category, setCategory] = useState('all');
  const [listingType, setListingType] = useState('all');
  const [isFree, setIsFree] = useState(false);
  const [sideOpen, setSideOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const itemsFitted = useRef(false);

  const fetchItems = useCallback(async (lat, lng) => {
    setLoading(true);
    itemsFitted.current = false; // allow re-fit when new items load
    try {
      const params = new URLSearchParams({ limit: 200 });
      if (lat && lng) {
        params.set('lat', lat);
        params.set('lng', lng);
        params.set('radius', 25000);
      }
      if (category !== 'all') params.set('category', category);
      if (listingType !== 'all') params.set('listingType', listingType);
      if (isFree) params.set('isFree', 'true');
      const r = await api.get(`/items/map?${params}`);
      setItems(r.data);
    } catch {}
    setLoading(false);
  }, [category, listingType, isFree]);

  useEffect(() => {
    fetchItems(userPos?.[0], userPos?.[1]);
  }, [fetchItems, userPos]);

  const pinLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(
      pos => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      () => alert('Location access denied. Please allow location in browser settings.')
    );
  };

  // ✅ Click side-panel item → fly to it on map
  const handleSideItemClick = (item) => {
    setSelected(item);
    const coords = item.location?.coordinates;
    if (coords?.length >= 2) {
      setFlyTarget({ pos: [coords[1], coords[0]], zoom: 16 });
    }
  };

  const getItemImage = (item) => {
    if (item.images?.[0]) return `${process.env.REACT_APP_SOCKET_URL}${item.images[0]}`;
    return null;
  };

  return (
    <div className="map-explorer">
      {/* Top bar — 2 rows */}
      <div className="map-topbar">
        {/* Row 1: Search + Action buttons */}
        <div className="map-topbar-row1">
          <div className="map-search-wrap">
            <SearchBar compact />
          </div>
          <div className="map-topbar-actions">
            <button className="btn btn-primary btn-sm" onClick={pinLocation}>📍 My Location</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setSideOpen(o => !o)}>
              {sideOpen ? '◀ Hide' : '▶ List'}
            </button>
          </div>
        </div>

        {/* Row 2: Filters */}
        <div className="map-topbar-row2">
          <div className="map-filters">
            {/* Category dropdown */}
            <div className="filter-select-wrap">
              <select className="filter-select" value={category}
                onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
              <span className="filter-select-arrow">▾</span>
            </div>

            {/* Type pills */}
            <div className="filter-pill-group">
              {TYPES.map(t => (
                <button key={t} className={`filter-pill ${listingType === t ? 'active' : ''}`}
                  onClick={() => setListingType(t)}>
                  {t === 'all' ? 'All' : TYPE_CONFIG[t]?.label || t}
                </button>
              ))}
            </div>

            {/* Free toggle */}
            <label className={`filter-free-toggle ${isFree ? 'active' : ''}`}>
              <input type="checkbox" checked={isFree} onChange={e => setIsFree(e.target.checked)} />
              🎁 Free Only
            </label>
          </div>
        </div>
      </div>

      <div className="map-body">
        {/* Map */}
        <div className="map-container">
          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <TileLayer url={TILE_URL} attribution={TILE_ATTR} maxZoom={20} />

            {/* ✅ Fly to user location when pinned */}
            {userPos && <FlyToPosition position={userPos} zoom={14} />}

            {/* ✅ Auto-fit to items when loaded (only once, unless filters change) */}
            {!userPos && <FitBounds items={items} />}

            {/* ✅ Fly to selected item from side panel */}
            {flyTarget && <FlyToPosition position={flyTarget.pos} zoom={flyTarget.zoom} />}

            {/* User location marker */}
            {userPos && (
              <Marker position={userPos} icon={myLocationIcon}>
                <Popup>
                  <div className="map-popup" style={{ padding: 10 }}>
                    <strong>📍 Your Location</strong>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Item markers */}
            {items.map(item => {
              const coords = item.location?.coordinates;
              if (!coords || coords.length < 2) return null;
              const pos = [coords[1], coords[0]];
              const img = getItemImage(item);
              const cfg = TYPE_CONFIG[item.listingType] || TYPE_CONFIG.sell;
              const isSelected = selected?._id === item._id;

              return (
                <Marker
                  key={item._id}
                  position={pos}
                  icon={createCustomIcon(item.listingType, item.isFree)}
                  eventHandlers={{ click: () => setSelected(item) }}
                >
                  <Popup>
                    <div className="map-popup" style={{ minWidth: 190 }}>
                      <div className="map-popup-img">
                        {img
                          ? <img src={img} alt={item.title} />
                          : <span style={{ fontSize: '1.8rem' }}>{cfg.emoji}</span>}
                      </div>
                      <div className="map-popup-body">
                        <strong>{item.title}</strong>
                        <div className="map-popup-meta">
                          <span className={`badge badge-${item.listingType}`}>{item.listingType}</span>
                          {item.isFree || item.listingType === 'give'
                            ? <span className="map-popup-free">Free</span>
                            : item.price > 0
                              ? <span className="map-popup-price">${item.price}</span>
                              : <span className="map-popup-free">Free</span>}
                        </div>
                        <Link to={`/items/${item._id}`} className="map-popup-btn">View Item →</Link>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {loading && (
            <div className="map-loading"><div className="spinner" /></div>
          )}

          {/* Map Legend */}
          <div className="map-legend">
            <div className="map-legend-title">Legend</div>
            <div className="map-legend-item"><span className="legend-dot" style={{ background: '#0077FF' }} />Borrow</div>
            <div className="map-legend-item"><span className="legend-dot" style={{ background: '#9ACD00' }} />Sell</div>
            <div className="map-legend-item"><span className="legend-dot" style={{ background: '#00B96B' }} />Give Away</div>
          </div>
        </div>

        {/* Side panel */}
        <AnimatePresence>
          {sideOpen && (
            <motion.div className="map-side"
              initial={{ x: 330 }} animate={{ x: 0 }} exit={{ x: 330 }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}>
              <div className="map-side-header">
                <h3>Nearby Items</h3>
                <span className="map-side-count">{items.length}</span>
              </div>
              <div className="map-side-list">
                {items.map(item => {
                  const img = getItemImage(item);
                  const isFreeItem = item.isFree || item.listingType === 'give';
                  return (
                    <div
                      key={item._id}
                      className={`map-side-item ${selected?._id === item._id ? 'active' : ''}`}
                      onClick={() => handleSideItemClick(item)}
                    >
                      <div className="map-side-img">
                        {img
                          ? <img src={img} alt={item.title} />
                          : <span>{TYPE_CONFIG[item.listingType]?.emoji || '📦'}</span>}
                      </div>
                      <div className="map-side-info">
                        <span className="map-side-title">{item.title}</span>
                        <div className="map-side-meta">
                          <span className={`badge badge-${item.listingType}`}>{item.listingType}</span>
                          <span className={`map-side-price ${isFreeItem ? 'free' : ''}`}>
                            {isFreeItem ? 'Free' : item.price > 0 ? `$${item.price}` : 'Free'}
                          </span>
                        </div>
                      </div>
                      <Link to={`/items/${item._id}`} className="map-side-arrow" onClick={e => e.stopPropagation()}>→</Link>
                    </div>
                  );
                })}
                {items.length === 0 && !loading && (
                  <div className="map-empty">
                    <span>🗺</span>
                    <p>No items found here.</p>
                    <p>Try expanding your search or adjusting filters.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
