import React from 'react';
import './Dashboard.css';
import SummaryCards from '../Components/Dashboard/SummaryCards/SummaryCards';
import TimeFilter from '../Components/Dashboard/TimeFilter/TimeFilter';
import RecentActivity from '../Components/Dashboard/All/RecentActivity';
import ProfitAnalysis from '../Components/Dashboard/All/ProfitAnalysis';
import SalesFlow from '../Components/Dashboard/All/SalesFlow';
import ItemProfitability from '../Components/Dashboard/All/SalesPerformance';
// import ExpenseDetails from '../Dashboard/Cards/ExpenseDetails';
// import RevenueDetails from '../Dashboard/Cards/RevenueDetails';
import PendingPayments from '../Components/Dashboard/Cards/PendingPayments';

const Dashboard = () => {
  const [activeFilter, setActiveFilter] = React.useState('Today');

  const getFilteredData = (timeFrame) => {
    // Helper function to get date based on timeframe
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

    return {
      startDate: getDateForTimeFrame(),
      timeFrame: timeFrame
    };
  };

  const filterData = getFilteredData(activeFilter);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Dashboard Overview</h2>
        <TimeFilter activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
      </div>

      <SummaryCards filterData={filterData} />

      <div className="dashboard-grid">
        <div className="dashboard-grid-item">
          <RecentActivity filterData={filterData} />
        </div>
        <div className="dashboard-grid-item">
          <ProfitAnalysis filterData={filterData} />
        </div>
      </div>

      {/* <div className="dashboard-grid">
        <div className="dashboard-grid-item">
          <ExpenseDetails filterData={filterData} />
        </div>
        <div className="dashboard-grid-item">
          <RevenueDetails filterData={filterData} />
        </div>
      </div> */}

      <div className="dashboard-grid">
        <div className="dashboard-grid-item">
          <SalesFlow filterData={filterData} />
        </div>
        <div className="dashboard-grid-item">
          <ItemProfitability filterData={filterData} />
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-grid-item full-width">
          <PendingPayments filterData={filterData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;