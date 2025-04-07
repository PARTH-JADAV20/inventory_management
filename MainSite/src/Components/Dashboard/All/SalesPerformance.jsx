import React from 'react';
import './SalesPerformance.css';
import SectionHeader from '../UI/SectionHeader';

const SalesPerformance = ({ filterData }) => {
  const products = [
    {
      product: 'Samsung Galaxy S21',
      sales: '₹145,000',
      quantity: '29 units',
      trend: '+12%',
      positive: true
    },
    {
      product: 'iPhone 13 Pro',
      sales: '₹253,000',
      quantity: '42 units',
      trend: '+18%',
      positive: true
    },
    {
      product: 'OnePlus 9 Pro',
      sales: '₹138,000',
      quantity: '23 units',
      trend: '-4%',
      positive: false
    },
    {
      product: 'Xiaomi 11T Pro',
      sales: '₹98,000',
      quantity: '28 units',
      trend: '+8%',
      positive: true
    }
  ];

  return (
    <div className="sales-performance">
      <SectionHeader title="Top Selling Products" link="View All" />
      
      <div className="product-list">
        {products.map((item, index) => (
          <div key={index} className="product-item">
            <div className="product-info">
              <div className="product-name">{item.product}</div>
              <div className="product-quantity">{item.quantity}</div>
            </div>
            <div className="product-stats">
              <div className="product-sales">{item.sales}</div>
              <div className={`product-trend ${item.positive ? 'positive' : 'negative'}`}>
                {item.trend}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesPerformance;