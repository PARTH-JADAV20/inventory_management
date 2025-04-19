import React from 'react';
import SectionHeader from '../UI/SectionHeader';

const ExpenseDetails = () => {
  const expenses = [
    {
      category: 'Inventory',
      items: [
        { name: 'Stock Replenishment - Electronics', amount: '₹8,500', date: 'Today' },
        { name: 'New Product Line - Accessories', amount: '₹6,300', date: 'Yesterday' },
        { name: 'Supplier Payment - Wholesale', amount: '₹7,200', date: '2 days ago' }
      ]
    },
    {
      category: 'Utilities',
      items: [
        { name: 'Electricity Bill', amount: '₹2,800', date: 'Today' },
        { name: 'Internet & Phone', amount: '₹1,200', date: 'Yesterday' },
        { name: 'Water Bill', amount: '₹1,500', date: '3 days ago' }
      ]
    },
    {
      category: 'Operating Expenses',
      items: [
        { name: 'Staff Salaries', amount: '₹3,500', date: 'Today' },
        { name: 'Shop Rent', amount: '₹4,000', date: 'Yesterday' }
      ]
    }
  ];

  return (
    <div className="bg-slate-800 rounded-lg p-5 h-full xl:p-4 md:p-3">
      <SectionHeader title="Expense Breakdown" link="View All" />
      
      <div className="mt-5">
        {expenses.map((category, index) => (
          <div key={index} className="mb-5 last:mb-0">
            <h4 className="text-base font-medium text-orange-500 mb-2.5 pb-2 border-b border-slate-700 xl:text-sm md:text-sm">
              {category.category}
            </h4>
            
            <div className="flex flex-col gap-2.5">
              {category.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center py-2 border-b border-slate-700 last:border-b-0 xl:py-1.5 md:py-1"
                >
                  <div className="expense-item-info">
                    <div className="text-sm mb-0.5 xl:text-xs md:text-xs">{item.name}</div>
                    <div className="text-xs text-slate-400 xl:text-[11px] md:text-[11px]">{item.date}</div>
                  </div>
                  <div className="text-[15px] font-medium text-red-500 xl:text-sm md:text-sm">{item.amount}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseDetails;