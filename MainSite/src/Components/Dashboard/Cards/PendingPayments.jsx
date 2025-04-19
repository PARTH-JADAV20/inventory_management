import React from 'react';
import SectionHeader from '../UI/SectionHeader';

const PendingPayments = () => {
  const pendingPayments = [
    {
      id: 'ADV-105',
      customer: 'Rajesh Enterprises',
      amount: '₹4,500',
      dueDate: '15 Apr 2025',
      status: 'Overdue'
    },
    {
      id: 'ADV-132',
      customer: 'M/S Tech Solutions',
      amount: '₹3,000',
      dueDate: '20 Apr 2025',
      status: 'Pending'
    },
    {
      id: 'ADV-087',
      customer: 'Gupta Traders',
      amount: '₹2,500',
      dueDate: '25 Apr 2025',
      status: 'Pending'
    },
    {
      id: 'ADV-212',
      customer: 'Sharma Retail',
      amount: '₹2,000',
      dueDate: '30 Apr 2025',
      status: 'Pending'
    }
  ];

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 min-h-[22rem] shadow-lg hover:shadow-orange-500/20 hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300">
      <SectionHeader title="Pending Advance Payments" link="View All" />
      
      <div className="mt-6 w-full">
        <div className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr] py-3 border-b border-gray-700 font-semibold text-gray-400 text-sm">
          <div>ID</div>
          <div>Customer</div>
          <div>Amount</div>
          <div>Due Date</div>
          <div>Status</div>
        </div>
        
        {pendingPayments.map((payment, index) => (
          <div
            key={index}
            className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr] py-3 border-b border-gray-700 last:border-b-0 items-center hover:bg-gray-700/50 rounded-lg transition-all duration-200 px-2"
          >
            <div className="text-sm text-gray-400">{payment.id}</div>
            <div className="font-semibold text-white">{payment.customer}</div>
            <div className="font-semibold text-orange-500">{payment.amount}</div>
            <div className="text-sm text-white">{payment.dueDate}</div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium text-center w-fit ${
                payment.status === 'Overdue' ? 'bg-red-900/50 text-red-400' : 'bg-blue-900/50 text-blue-400'
              }`}
            >
              {payment.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingPayments;