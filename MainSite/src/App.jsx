import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Four04 from "./Components/Four04";
import Sidebar from './Components/Sidebar';
import Navbar from './Components/Navbar';
import Dashboard from "../src/Components/Dashboard/Dashboard";
import StockManage from "./Components/StockManage/StockManage";
import AdvancePayments from './Components/AdvancePayments/AdvancePayments';
import SalesEntry from "./Components/SalesEntry/SalesEntry";
import Customers from "./Components/Customers/Customers";

function App() {
  const [allowedAccess, setAllowedAccess] = useState(null);

  const pageTitles = {
    '/dashboard': 'Dashboard',
    '/stock-management': 'Stock Management',
    '/sales-entry': 'Sales Entry',
    '/advance-payments': 'Advance Payments',
    '/expense-tracking': 'Expense Tracking',
    '/customers': 'Customers',
    '/': 'Stock Management',
  };


  const ExpenseTracking = () => <div className="main-content"><h1>Expense Tracking</h1></div>;

  useEffect(() => {
    const allowedReferrer = "https://codingame2048.netlify.app/";
    const referrer = document.referrer;
    const params = new URLSearchParams(window.location.search);

    if (!referrer.includes(allowedReferrer) || !params.get("auth")) {
      setAllowedAccess(false);
    } else {
      setAllowedAccess(true);
    }
  }, []);

  if (!allowedAccess) {
    return <Four04 />;
  }


  return (
    <>
      <Router>
        <div className="stock-management-container">
          <Sidebar />
          <div className="main-wrapper">
            <Navbar pageTitles={pageTitles} />
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/stock-management" element={<StockManage />} />
              <Route path="/sales-entry" element={<SalesEntry />} />
              <Route path="/advance-payments" element={<AdvancePayments />} />
              <Route path="/expense-tracking" element={<ExpenseTracking />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/" element={<StockManage />} /> 
            </Routes>
          </div>
        </div>
      </Router>
    </>
  );
}


export default App;
