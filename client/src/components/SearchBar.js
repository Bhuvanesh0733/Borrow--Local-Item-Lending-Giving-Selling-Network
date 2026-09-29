import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';

export default function SearchBar({ initialValue = '', compact = false }) {
  const [q, setQ] = useState(initialValue);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <form className={`search-bar ${compact ? 'compact' : ''}`} onSubmit={handleSubmit}>
      <span className="search-icon">🔍</span>
      <input
        type="text" value={q} onChange={e => setQ(e.target.value)}
        placeholder="Search items near you..."
        className="search-input"
      />
      <button type="submit" className="btn btn-primary btn-sm search-btn">Search</button>
    </form>
  );
}
