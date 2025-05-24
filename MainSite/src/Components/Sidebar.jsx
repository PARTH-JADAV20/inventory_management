import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const isSalesOnly = location.pathname === '/salespage';

  return (
    <div className="sidebar">
      <div className="logo">
        <h2>BusinessPro</h2>
      </div>
      <ul className="nav-links">
        {isSalesOnly ? (
          <li>
            <NavLink
              to="/salespage"
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              <span className="icon">💰</span> Sales Entry
            </NavLink>
          </li>
        ) : (
          <>
            <li>
              <NavLink
                to="/"
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                <span className="icon">📊</span> Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/stock-management"
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                <span className="icon">📦</span> Stock Management
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/sales-entry"
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                <span className="icon">💰</span> Sales Entry
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/advance-payments"
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                <span className="icon">💳</span> Advance Payments
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/credit-sales"
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                <span className="icon">🧾</span> Credit Sales
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/expense-tracking"
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                <span className="icon">📝</span> Expense Tracking
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/customers"
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                <span className="icon">🧑</span> Customers
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;