import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Four04 from "./Components/Four04";
import Sidebar from './Components/Sidebar';
import Navbar from './Components/Navbar';
import Dashboard from "./Pages/MainDashboard";
import CreditSales from "./Pages/CreditSalesDashboard";
import StockManage from "./Components/StockManage/StockManage";
import AdvancePayments from "./Components/AdvancePayments/AdvancePayments";
import SalesEntry from "./Components/SalesEntry/SalesEntry";
import Customers from "./Components/Customers/Customers";
import ExpenseTracker from "./Components/ExpenseTracker/ExpenseTracker";

function App() {
  const [allowedAccess, setAllowedAccess] = useState(null);

  const pageTitles = {
    '/': 'Dashboard',
    '/stock-management': 'Stock Management',
    '/sales-entry': 'Sales Entry',
    '/advance-payments': 'Advance Payments',
    '/expense-tracking': 'Expense Tracking',
    '/customers': 'Customers',
    '/credit-sales': 'Credit Sales',
  };
  

  useEffect(() => {
    const allowedReferrer = "https://codingame2048.netlify.app/"; 
    // const allowedReferrer = "http://localhost:5173/"; 
    const referrer = document.referrer;
    const params = new URLSearchParams(window.location.search);

  
    const fromDummySite = referrer.includes(allowedReferrer) && params.get("auth") === "true";
    const alreadyAuthorized = sessionStorage.getItem("authorized-entry");
  
    if (fromDummySite) {
      // ✅ Success path — allow and store session
      sessionStorage.setItem("authorized-entry", "true");
      setAllowedAccess(true);
  
      // Remove ?auth=true from URL after validation
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (alreadyAuthorized === "true") {
      // ✅ Still in same session/tab
      setAllowedAccess(true);
    } else {
      // ❌ Access denied
      setAllowedAccess(false);
    }
  }, []);
 

  useEffect(() => {
    const handleUnload = () => {
      sessionStorage.removeItem("authorized-entry");
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  useEffect(() => {
    const handleUnload = () => {
      sessionStorage.removeItem("authorized-entry");
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  if (!allowedAccess) {
    return <Four04 />;
  }


  return (
    <Router>
      <div className="stock-management-container">
        <Sidebar />
        <div className="main-wrapper">
          <Navbar pageTitles={pageTitles} />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/stock-management" element={<StockManage />} />
            <Route path="/sales-entry" element={<SalesEntry />} />
            <Route path="/advance-payments" element={<AdvancePayments />} />
            <Route path="/expense-tracking" element={<ExpenseTracker />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/credit-sales" element={<CreditSales />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;