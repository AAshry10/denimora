import React from 'react';
import './PriceDisplay.css';

const PriceDisplay = ({ product, className = '', showLabel = false }) => {
  // Check discount status - prioritize discount_active flag
  const hasDiscount = product.discount_active === true && 
    product.discount_percent && 
    product.discount_percent > 0;
  
  const originalPrice = product.original_price || product.price;
  const displayPrice = product.display_price || product.price_after_discount || product.price;

  if (!hasDiscount) {
    return (
      <div className={`price-display ${className}`}>
        {showLabel && <span className="price-label">Price: </span>}
        <span className="current-price">LE {Number(displayPrice).toFixed(2)}</span>
      </div>
    );
  }

  return (
    <div className={`price-display has-discount ${className}`}>
      {showLabel && <span className="price-label">Price: </span>}
      <div className="discount-price-container">
        <span className="discounted-price">LE {Number(displayPrice).toFixed(2)}</span>
        <div className="original-and-badge">
          <span className="original-price">LE {Number(originalPrice).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default PriceDisplay;