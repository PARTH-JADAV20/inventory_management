import React, { useState, useEffect } from 'react';

const SummaryCard = ({ title, amount, change, positive, comparedTo }) => {
  const [displayAmount, setDisplayAmount] = useState('0');

  useEffect(() => {
    let start = 0;
    const end = parseFloat(amount.replace(/[^0-9.]/g, '')) || 0;
    const duration = 1000; // 1 second
    const increment = end / (duration / 16); // ~60fps
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        current = end;
        clearInterval(timer);
      }
      setDisplayAmount(
        amount.includes('₹')
          ? `₹${Math.round(current).toLocaleString('en-IN')}`
          : Math.round(current).toString()
      );
    }, 16);

    return () => clearInterval(timer);
  }, [amount]);

  return (
    <div className="px-4 py-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-gray-400">{title}</h3>
        {title === 'Net Earnings' && (
          <div className="trend-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4caf50"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
              <polyline points="17 6 23 6 23 12"></polyline>
            </svg>
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-2">{displayAmount}</div>
      <div className={`text-xs font-medium ${positive ? 'text-green-500' : 'text-red-500'}`}>
        {positive ? '↑' : '↓'} {change} {comparedTo}
      </div>
    </div>
  );
};

export default SummaryCard;