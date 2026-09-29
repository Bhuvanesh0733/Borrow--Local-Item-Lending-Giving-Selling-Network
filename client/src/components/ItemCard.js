import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './ItemCard.css';

const typeLabel = { borrow: 'Borrow', sell: 'Sell', give: 'Free' };
const typeClass = { borrow: 'badge-borrow', sell: 'badge-sell', give: 'badge-give' };

export default function ItemCard({ item, index = 0 }) {
  const img = item.images?.[0]
    ? `${process.env.REACT_APP_SOCKET_URL}${item.images[0]}`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={`/items/${item._id}`} className="item-card card">
        <div className="item-card-img">
          {img
            ? <img src={img} alt={item.title} />
            : <div className="item-card-placeholder">📦</div>}
          <span className={`badge ${typeClass[item.listingType]}`}>
            {typeLabel[item.listingType]}
          </span>
        </div>
        <div className="item-card-body">
          <h3 className="item-card-title">{item.title}</h3>
          <div className="item-card-meta">
            <span className="item-card-category">{item.category}</span>
            <span className="item-card-price">
              {item.isFree || item.listingType === 'give'
                ? <span className="free-tag">Free</span>
                : item.price > 0 ? `$${item.price}` : 'Free'}
            </span>
          </div>
          {item.owner && (
            <div className="item-card-owner">
              <div className="owner-avatar">{item.owner.name?.[0]?.toUpperCase()}</div>
              <span>{item.owner.name}</span>
              {item.owner.trustScore > 0 && (
                <span className="trust-score">⭐ {item.owner.trustScore}</span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
