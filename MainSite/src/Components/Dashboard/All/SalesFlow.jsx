import React from 'react';
import '../../../App.css';
import SectionHeader from '../UI/SectionHeader';

const SalesFlow = () => {
  const salesTypes = [
    {
      type: 'Cash Sales',
      total: '₹45,000',
      label: "Today's total"
    },
    {
      type: 'Online Sales',
      total: '₹52,000',
      label: "Today's total"
    },
    {
      type: 'Credit Sales',
      total: '₹18,500',
      label: "Today's total"
    }
  ];

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-lg hover:shadow-orange-500/20 hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300">
      <SectionHeader title="Sales Flow" link="View Report" />
      
      <div className="mt-6 space-y-4">
        {salesTypes.map((sale, index) => (
          <div
            key={index}
            className="flex justify-between items-center py-4 border-b border-gray-700 last:border-b-0 hover:bg-gray-700/50 rounded-lg transition-all duration-200 px-2"
          >
            <div className="sales-info">
              <div className="text-sm font-semibold text-white">{sale.type}</div>
              <div className="text-xs text-gray-400">{sale.label}</div>
            </div>
            <div className="text-lg font-bold text-orange-500">{sale.total}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesFlow;