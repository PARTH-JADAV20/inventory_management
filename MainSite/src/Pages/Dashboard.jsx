import React from 'react';
import SummaryCards from '../Components/Dashboard/SummaryCards/SummaryCards';
import TimeFilter from '../Components/Dashboard/TimeFilter/TimeFilter';
import ShopFilter from '../Components/Dashboard/ShopFilter/ShopFilter';
import RecentActivity from '../Components/Dashboard/All/RecentActivity';
import ProfitAnalysis from '../Components/Dashboard/All/ProfitAnalysis';
import SalesFlow from '../Components/Dashboard/All/SalesFlow';
import ItemProfitability from '../Components/Dashboard/All/SalesPerformance';
import PendingPayments from '../Components/Dashboard/Cards/PendingPayments';

const Dashboard = () => {
  const [activeFilter, setActiveFilter] = React.useState('Today');
  const [activeShop, setActiveShop] = React.useState('All');

  const getFilteredData = (timeFrame, shop) => {
    const getDateForTimeFrame = () => {
      const now = new Date();
      switch (timeFrame) {
        case 'Today':
          return now;
        case 'This Week':
          now.setDate(now.getDate() - 7);
          return now;
        case 'This Month':
          now.setMonth(now.getMonth() - 1);
          return now;
        default:
          return now;
      }
    };

    const shopContext = {
      shop: shop,
      description:
        shop === 'Shop A'
          ? 'Electronics (Phones, Laptops)'
          : shop === 'Shop B'
          ? 'Fashion (Clothing, Accessories)'
          : 'All Shops (Electronics & Fashion)',
    };

    return {
      startDate: getDateForTimeFrame(),
      timeFrame: timeFrame,
      ...shopContext,
    };
  };

  const filterData = getFilteredData(activeFilter, activeShop);

  return (
    <div className="p-5 bg-[#1a1f2b] text-white min-h-screen">
      {/* --- Top Header Section --- */}
      <div className="mt-[70px] mb-6">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-5 shadow-lg hover:shadow-[#ff6b35]/30 transition-all duration-300">
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Heading */}
            <h2 className="text-2xl font-bold text-[#ff6b35] tracking-tight">
              Dashboard Overview
            </h2>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <TimeFilter activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
              <ShopFilter activeShop={activeShop} setActiveShop={setActiveShop} />
            </div>
          </div>

          {/* Description */}
          <div className="mt-4 border-t border-white/10 pt-3">
            <p className="text-sm text-gray-400 leading-relaxed">
              <span className="font-medium text-white">Showing:</span> {filterData.shop} – <span>{filterData.description}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards filterData={filterData} />

      {/* Recent Activity & Profit Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div>
          <RecentActivity filterData={filterData} />
        </div>
        <div>
          <ProfitAnalysis filterData={filterData} />
        </div>
      </div>

      {/* Sales Flow & Item Profitability */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div>
          <SalesFlow filterData={filterData} />
        </div>
        <div>
          <ItemProfitability filterData={filterData} />
        </div>
      </div>

      {/* Pending Payments Full Width */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div className="md:col-span-2">
          <PendingPayments filterData={filterData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
