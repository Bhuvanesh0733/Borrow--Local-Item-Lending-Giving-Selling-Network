import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import SearchBar from '../components/SearchBar';
import ItemCard from '../components/ItemCard';
import './SearchResults.css';

const CATEGORIES = ['tools', 'electronics', 'books', 'sports', 'clothing', 'furniture', 'kitchen', 'other'];

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    listingType: searchParams.get('listingType') || '',
    isFree: searchParams.get('isFree') === 'true',
  });

  const q = searchParams.get('q') || '';

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (q) params.set('q', q);
      if (filters.category) params.set('category', filters.category);
      if (filters.listingType) params.set('listingType', filters.listingType);
      if (filters.isFree) params.set('isFree', 'true');
      const r = await api.get(`/items?${params}`);
      setItems(r.data.items);
      setTotal(r.data.total);
      setPages(r.data.pages);
    } catch {}
    setLoading(false);
  }, [q, filters, page]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const applyFilter = (key, val) => {
    setFilters(f => ({ ...f, [key]: val }));
    setPage(1);
  };

  return (
    <div className="page search-page">
      <div className="container">
        <div className="search-header">
          <SearchBar initialValue={q} />
        </div>

        <div className="search-layout">
          {/* Filters sidebar */}
          <aside className="filters-sidebar card">
            <h3 className="filters-title">Filters</h3>

            <div className="filter-group">
              <label className="form-label">Category</label>
              <select className="form-input" value={filters.category}
                onChange={e => applyFilter('category', e.target.value)}>
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="filter-group">
              <label className="form-label">Type</label>
              <div className="filter-radio-group">
                {[['', 'All'], ['borrow', 'Borrow'], ['sell', 'Sell'], ['give', 'Give Away']].map(([val, label]) => (
                  <label key={val} className={`filter-radio ${filters.listingType === val ? 'active' : ''}`}>
                    <input type="radio" name="listingType" value={val}
                      checked={filters.listingType === val}
                      onChange={() => applyFilter('listingType', val)} />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-toggle-row">
                <input type="checkbox" checked={filters.isFree}
                  onChange={e => applyFilter('isFree', e.target.checked)} />
                <span>Free items only</span>
              </label>
            </div>

            <button className="btn btn-ghost btn-sm" style={{ width: '100%' }}
              onClick={() => { setFilters({ category: '', listingType: '', isFree: false }); setPage(1); }}>
              Clear Filters
            </button>
          </aside>

          {/* Results */}
          <div className="search-results">
            <div className="results-meta">
              <span>{total} results{q ? ` for "${q}"` : ''}</span>
            </div>

            {loading ? (
              <div className="flex-center" style={{ padding: '80px 0' }}><div className="spinner" /></div>
            ) : items.length === 0 ? (
              <div className="empty-state">
                <p>No items found. Try different filters or <a href="/list">list your own!</a></p>
              </div>
            ) : (
              <>
                <div className="items-grid">
                  {items.map((item, i) => <ItemCard key={item._id} item={item} index={i} />)}
                </div>
                {pages > 1 && (
                  <div className="pagination">
                    {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                      <button key={p} className={`page-btn ${page === p ? 'active' : ''}`}
                        onClick={() => setPage(p)}>{p}</button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
