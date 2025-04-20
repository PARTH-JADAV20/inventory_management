import React from 'react';

const ShopFilter = ({ activeShop, setActiveShop }) => {
  const shops = ['All', 'Shop A', 'Shop B'];

  return (
    <div className="flex flex-row gap-2 flex-wrap">
      {shops.map((shop) => (
        <button
          key={shop}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
            activeShop === shop
              ? 'bg-gradient-to-r from-[#ff6b35] to-[#ff9f7a] text-white shadow-md'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
          }`}
          onClick={() => setActiveShop(shop)}
        >
          {shop}
        </button>
      ))}
    </div>
  );
};

export default ShopFilter;