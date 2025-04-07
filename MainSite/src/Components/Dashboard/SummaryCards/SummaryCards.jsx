import React from 'react';
import './SummaryCards.css';
import SummaryCard from './SummaryCard';
import CategoryBreakdown from './CategoryBreakdown';

const SummaryCards = ({ filterData }) => {
  const getTimeBasedData = () => {
    switch (filterData.timeFrame) {
      case 'Today':
        return {
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
      case 'This Week':
        return {
          sales: { 
            amount: '₹824,500', 
            change: '+15.2%',
            categories: [
              { name: 'Cash', value: '₹345,000' },
              { name: 'Online', value: '₹282,000' },
              { name: 'Credit', value: '₹148,500' },
              { name: 'Advance', value: '₹49,000' }
            ]
          },
          activeUsers: {
            amount: '185',
            change: '+15',
            categories: [
              { name: 'New Users', value: '45' },
              { name: 'Returning', value: '140' }
            ]
          },
          topUsers: {
            amount: '25',
            change: '+5',
            categories: [
              { name: 'User #105 (82 orders)', value: '₹185,000' },
              { name: 'User #087 (75 orders)', value: '₹162,500' },
              { name: 'User #132 (68 orders)', value: '₹145,000' },
              { name: 'User #212 (65 orders)', value: '₹138,000' }
            ]
          },
          pendingAdvance: { 
            amount: '₹52,000', 
            count: '12',
            categories: [
              { name: 'Customer #105', value: '₹18,500' },
              { name: 'Customer #132', value: '₹15,000' },
              { name: 'Customer #087', value: '₹10,500' },
              { name: 'Customer #212', value: '₹8,000' }
            ]
          }
        };
      case 'This Month':
        return {
          sales: { 
            amount: '₹3,124,500', 
            change: '+18.7%',
            categories: [
              { name: 'Cash', value: '₹1,245,000' },
              { name: 'Online', value: '₹1,182,000' },
              { name: 'Credit', value: '₹448,500' },
              { name: 'Advance', value: '₹249,000' }
            ]
          },
          activeUsers: {
            amount: '750',
            change: '+45',
            categories: [
              { name: 'New Users', value: '180' },
              { name: 'Returning', value: '570' }
            ]
          },
          topUsers: {
            amount: '50',
            change: '+8',
            categories: [
              { name: 'User #105 (320 orders)', value: '₹585,000' },
              { name: 'User #087 (295 orders)', value: '₹522,500' },
              { name: 'User #132 (282 orders)', value: '₹485,000' },
              { name: 'User #212 (275 orders)', value: '₹458,000' }
            ]
          },
          pendingAdvance: { 
            amount: '₹152,000', 
            count: '25',
            categories: [
              { name: 'Customer #105', value: '₹58,500' },
              { name: 'Customer #132', value: '₹45,000' },
              { name: 'Customer #087', value: '₹30,500' },
              { name: 'Customer #212', value: '₹18,000' }
            ]
          }
        };
      default:
        return getTimeBasedData('Today');
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
    <div className="summary-cards">
      {summaryData.map((card, index) => (
        <div key={index} className="summary-card-container">
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