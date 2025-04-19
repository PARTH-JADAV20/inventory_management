import React from 'react';
import SectionHeader from '../UI/SectionHeader';

const RecentActivity = () => {
  const activities = [
    {
      type: 'Payment Received',
      info: 'customer/invoice/123',
      amount: '₹45,000',
      time: '2 hours ago'
    },
    {
      type: 'Invoice Due',
      info: 'invoice/ab456',
      amount: '₹45,000',
      time: '3 days ago'
    },
    {
      type: 'New Subscription',
      info: 'subscription/xz345',
      amount: '₹45,000',
      time: '5 days ago'
    }
  ];

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-lg hover:shadow-orange-500/20 hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300">
      <SectionHeader title="Recent Activity" link="View All" />
      
      <div className="mt-6 space-y-4">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="flex justify-between py-4 border-b border-gray-700 last:border-b-0 hover:bg-gray-700/50 rounded-lg transition-all duration-200 px-2"
          >
            <div className="activity-details">
              <div className="text-sm font-semibold text-white">{activity.type}</div>
              <div className="text-xs text-indigo-400">{activity.info}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-white">{activity.amount}</div>
              <div className="text-xs text-gray-400">{activity.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;