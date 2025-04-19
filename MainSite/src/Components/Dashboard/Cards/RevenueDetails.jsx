import React from 'react';
import SectionHeader from '../UI/SectionHeader';

const RevenueDetails = () => {
  const revenue = [
    {
      category: 'Retail Sales',
      items: [
        { name: 'Product A Sales', amount: '₹15,200', date: 'Today' },
        { name: 'Product B Sales', amount: '₹12,800', date: 'Today' },
        { name: 'Product C Sales', amount: '₹20,500', date: 'Yesterday' }
      ]
    },
    {
      category: 'Services',
      items: [
        { name: 'Installation Services', amount: '₹8,500', date: 'Today' },
        { name: 'Maintenance Contracts', amount: '₹12,000', date: 'Yesterday' },
        { name: 'Custom Solutions', amount: '₹5,500', date: '2 days ago' }
      ]
    },
    {
      category: 'Wholesale',
      items: [
        { name: 'Bulk Order - Client #42', amount: '₹9,000', date: 'Today' },
        { name: 'Distributor Purchase', amount: '₹6,000', date: 'Yesterday' }
      ]
    }
  ];

  return (
    <div className="bg-slate-800 rounded-lg p-5 h-full xl:p-4 md:p-3">
      <SectionHeader title="Revenue Sources" link="View All" />
      
      <div className="mt-5">
        {revenue.map((category, index) => (
          <div key={index} className="mb-5 last:mb-0">
            <h4 className="text-base font-medium text-green-500 mb-2.5 pb-2 border-b border-slate-700 xl:text-sm md:text-sm">
              {category.category}
            </h4>
            
            <div className="flex flex-col gap-2.5">
              {category.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center py-2 border-b border-slate-700 last:border-b-0 xl:py-1.5 md:py-1"
                >
                  <div className="revenue-item-info">
                    <div className="text-sm mb-0.5 xl:text-xs md:text-xs">{item.name}</div>
                    <div className="text-xs text-slate-400 xl:text-[11px] md:text-[11px]">{item.date}</div>
                  </div>
                  <div className="text-[15px] font-medium text-green-500 xl:text-sm md:text-sm">{item.amount}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RevenueDetails;