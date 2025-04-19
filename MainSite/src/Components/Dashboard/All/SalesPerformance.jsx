import React from 'react';
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
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-lg hover:shadow-orange-500/20 hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300">
      <SectionHeader title="Top Selling Products" link="View All" />
      
      <div className="mt-6 space-y-4">
        {products.map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-center py-4 border-b border-gray-700 last:border-b-0 hover:bg-gray-700/50 rounded-lg transition-all duration-200 px-2"
          >
            <div className="flex flex-col gap-1">
              <div className="text-sm font-semibold text-white">{item.product}</div>
              <div className="text-xs text-gray-400">{item.quantity}</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-orange-500">{item.sales}</div>
              <div
                className={`text-xs mt-1 ${item.positive ? 'text-green-500' : 'text-red-500'}`}
              >
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