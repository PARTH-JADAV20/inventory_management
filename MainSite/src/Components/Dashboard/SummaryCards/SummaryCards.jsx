import React from 'react';
import SummaryCard from './SummaryCard';
import CategoryBreakdown from './CategoryBreakdown';

const SummaryCards = ({ filterData }) => {
  const getTimeBasedData = () => {
    const baseData = {
      sales: { 
        amount: '₹124,500', 
        change: '+12.5%',
        categories: [
          { name: 'Cash', value: '₹45,000' },
          { name: 'Online', value: '₹52,000' },
          { name: 'Credit', value: '₹18,500' },
          { name: 'Advance', value: '₹9,000' }
        ]
      },
      activeUsers: {
        amount: '45',
        change: '+5',
        categories: [
          { name: 'New Users', value: '12' },
          { name: 'Returning', value: '33' }
        ]
      },
      topUsers: {
        amount: '15',
        change: '+2',
        categories: [
          { name: 'User #105 (25 orders)', value: '₹45,000' },
          { name: 'User #087 (22 orders)', value: '₹38,500' },
          { name: 'User #132 (20 orders)', value: '₹35,000' },
          { name: 'User #212 (18 orders)', value: '₹32,000' }
        ]
      },
      pendingAdvance: { 
        amount: '₹12,000', 
        count: '4',
        categories: [
          { name: 'Customer #105', value: '₹4,500' },
          { name: 'Customer #132', value: '₹3,000' },
          { name: 'Customer #087', value: '₹2,500' },
          { name: 'Customer #212', value: '₹2,000' }
        ]
      }
    };

    // Adjust data based on shop
    if (filterData.shop === 'Shop B') {
      baseData.sales.amount = '₹150,000';
      baseData.activeUsers.amount = '60';
      baseData.topUsers.amount = '20';
      baseData.pendingAdvance.amount = '₹15,000';
    }

    switch (filterData.timeFrame) {
      case 'This Week':
        return {
          ...baseData,
          sales: { ...baseData.sales, amount: filterData.shop === 'Shop B' ? '₹900,000' : '₹824,500', change: '+15.2%' },
          activeUsers: { ...baseData.activeUsers, amount: filterData.shop === 'Shop B' ? '200' : '185', change: '+15' },
          topUsers: { ...baseData.topUsers, amount: filterData.shop === 'Shop B' ? '30' : '25', change: '+5' },
          pendingAdvance: { ...baseData.pendingAdvance, amount: filterData.shop === 'Shop B' ? '₹60,000' : '₹52,000', count: '12' }
        };
      case 'This Month':
        return {
          ...baseData,
          sales: { ...baseData.sales, amount: filterData.shop === 'Shop B' ? '₹3,500,000' : '₹3,124,500', change: '+18.7%' },
          activeUsers: { ...baseData.activeUsers, amount: filterData.shop === 'Shop B' ? '800' : '750', change: '+45' },
          topUsers: { ...baseData.topUsers, amount: filterData.shop === 'Shop B' ? '55' : '50', change: '+8' },
          pendingAdvance: { ...baseData.pendingAdvance, amount: filterData.shop === 'Shop B' ? '₹180,000' : '₹152,000', count: '25' }
        };
      default:
        return baseData;
    }
  };

  const timeData = getTimeBasedData();
  
  const summaryData = [
    {
      title: 'Total Sales',
      amount: timeData.sales.amount,
      change: timeData.sales.change,
      positive: true,
      comparedTo: `vs previous ${filterData?.timeFrame?.toLowerCase() || 'period'}`,
      categories: timeData.sales.categories
    },
    {
      title: 'Active Users',
      amount: timeData.activeUsers.amount,
      change: timeData.activeUsers.change,
      positive: true,
      comparedTo: `total users this ${filterData?.timeFrame?.toLowerCase() || 'period'}`,
      categories: timeData.activeUsers.categories
    },
    {
      title: 'Top Active Users',
      amount: timeData.topUsers.amount,
      change: timeData.topUsers.change,
      positive: true,
      comparedTo: 'most orders',
      categories: timeData.topUsers.categories
    },
    {
      title: 'Pending Advances',
      amount: timeData.pendingAdvance.amount,
      change: timeData.pendingAdvance.count,
      positive: false,
      comparedTo: 'pending payments',
      categories: timeData.pendingAdvance.categories
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      {summaryData.map((card, index) => (
        <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden shadow-lg hover:shadow-orange-500/20 hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300">
          <SummaryCard 
            title={card.title}
            amount={card.amount}
            change={card.change}
            positive={card.positive}
            comparedTo={card.comparedTo}
          />
          {card.categories.length > 0 && (
            <CategoryBreakdown categories={card.categories} />
          )}
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;