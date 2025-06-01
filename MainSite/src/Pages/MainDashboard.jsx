import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  AlertTriangle,
  ShoppingCart,
  Package,
  Users
} from 'lucide-react';
import {
  fetchTotalSales,
  fetchTotalExpenses,
  fetchTotalProfit,
  fetchCreditSalesSummary,
  fetchLowStock,
  fetchSalesComparison,
  fetchUsers,
  fetchLowestAdvanceUsers,
  fetchTopCreditUsers,
  fetchAdvancePayments
} from '../Components/api';

const MainDashboard = () => {
  const [shop, setShop] = useState('All');
  const [period, setPeriod] = useState('today');
  const [salesData, setSalesData] = useState({ totalSales: 0, Cash: 0, Card: 0, Online: 0, Cheque: 0, Credit: 0, Advance: 0 });
  const [expensesData, setExpensesData] = useState({ totalExpenses: 0, categories: [] });
  const [profitData, setProfitData] = useState({ totalProfit: 0, Cash: 0, Card: 0, Online: 0, Cheque: 0, Credit: 0, Advance: 0 });
  const [creditData, setCreditData] = useState({ totalCreditGiven: 0, Cash: 0, Card: 0, Online: 0, Cheque: 0 });
  const [stockAlerts, setStockAlerts] = useState([]);
  const [usersData, setUsersData] = useState({ totalUsers: 0, creditUsers: 0, advanceUsers: 0 });
  const [salesComparison, setSalesComparison] = useState({
    current: { sales: 0, expenses: 0, net: 0 },
    previous: { sales: 0, expenses: 0, net: 0 }
  });
  const [lowestAdvanceUsers, setLowestAdvanceUsers] = useState([]);
  const [topCreditUsers, setTopCreditUsers] = useState([]);
  const [advancePayments, setAdvancePayments] = useState({ totalAdvance: 0, usedAdvance: 0, Cash: 0, Card: 0, Online: 0, Cheque: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const shopValue = shop === 'All' ? 'All' : shop === 'shop1' ? 'Shop 1' : 'Shop 2';
        console.log(`Fetching data for shop: ${shopValue}, period: ${period}`);
        const [
          sales,
          expenses,
          profit,
          credits,
          stock,
          comparison,
          users,
          lowestAdvance,
          topCredit,
          advances
        ] = await Promise.all([
          fetchTotalSales(shopValue, period),
          fetchTotalExpenses(shopValue, period),
          fetchTotalProfit(shopValue, period),
          fetchCreditSalesSummary(shopValue, period),
          fetchLowStock(shopValue, period),
          fetchSalesComparison(shopValue, period),
          fetchUsers(shopValue),
          fetchLowestAdvanceUsers(shopValue),
          fetchTopCreditUsers(shopValue),
          fetchAdvancePayments(shopValue, period)
        ]);

        console.log('API Responses:', { sales, expenses, profit, credits });

        setSalesData({ ...sales, Card: sales.Card || 0 });
        setExpensesData({
          totalExpenses: expenses.totalExpenses || 0,
          categories: expenses.expensesByCategory ? Object.entries(expenses.expensesByCategory).map(([name, amount]) => ({ name, amount })) : []
        });
        setProfitData({ ...profit, Credit: profit.Credit || 0, Card: profit.Card || 0 });
        setCreditData({ ...credits, totalCreditGiven: credits.totalCreditGiven || 0, Card: credits.Card || 0 });
        setStockAlerts(stock || []);
        setSalesComparison(comparison || { current: { sales: 0, expenses: 0, net: 0 }, previous: { sales: 0, expenses: 0, net: 0 } });
        setUsersData(users || { totalUsers: 0, creditUsers: 0, advanceUsers: 0 });
        setLowestAdvanceUsers(lowestAdvance || []);
        setTopCreditUsers(topCredit || []);
        setAdvancePayments({
          totalAdvance: advances.totalAdvance || 0,
          usedAdvance: advances.usedAdvance || 0,
          Cash: advances.Cash || 0,
          Card: advances.Card || 0,
          Online: advances.Online || 0,
          Cheque: advances.Cheque || 0
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, [shop, period]);

  const handleShopChange = (e) => setShop(e.target.value);
  const handlePeriodChange = (value) => setPeriod(value);

  const salesChangePercentage = salesComparison.previous.sales !== 0
    ? ((salesComparison.current.sales - salesComparison.previous.sales) / salesComparison.previous.sales * 100).toFixed(2)
    : 'N/A';

  const formatNumber = (value) => (value ?? 0).toLocaleString();

  return (
    <main className="main-dax">
      <header className="header-dax">
        <h2 className="title-dax">Dashboard Overview</h2>
        <div className="controls-dax">
          <div className="select-container-dax">
            <select className="select-dropdown-dax" value={shop} onChange={handleShopChange}>
              <option value="All">All Shops</option>
              <option value="shop1">Shop 1</option>
              <option value="shop2">Shop 2</option>
            </select>
          </div>
          {['today', 'yesterday', 'this_week', 'this_month', 'last_month', 'last_3_months'].map((p) => (
            <button
              key={p}
              className={`button-dax ${period === p ? 'button-primary-dax' : 'button-secondary-dax'}`}
              onClick={() => handlePeriodChange(p)}
            >
              {p.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </button>
          ))}
        </div>
      </header>
      <div className="grid-5-dax">
        <div className="card-dax">
          <div className="card-header-dax">
            <h3 className="card-title-dax">Total Sales</h3>
            <TrendingUp className="icon-green-dax" />
          </div>
          <p className="card-value-dax">₹{formatNumber(salesData.totalSales)}</p>
          <p className="card-change-green-dax">
            {salesChangePercentage !== 'N/A'
              ? `${salesChangePercentage > 0 ? '+' : ''}${salesChangePercentage}% vs previous period`
              : 'N/A'}
          </p>
          <div className="card-details-dax">
            <div className="detail-row-dax"><span className="detail-label-dax">Cash:</span><span className="detail-value-dax">₹{formatNumber(salesData.Cash)}</span></div>
            <div className="detail-row-dax"><span className="detail-label-dax">Card:</span><span className="detail-value-dax">₹{formatNumber(salesData.Card)}</span></div>
            <div className="detail-row-dax"><span className="detail-label-dax">Online:</span><span className="detail-value-dax">₹{formatNumber(salesData.Online)}</span></div>
            <div className="detail-row-dax"><span className="detail-label-dax">Cheque:</span><span className="detail-value-dax">₹{formatNumber(salesData.Cheque)}</span></div>
            <div className="detail-row-dax"><span className="detail-label-dax">Credit:</span><span className="detail-value-dax">₹{formatNumber(salesData.Credit)}</span></div>
            <div className="detail-row-dax"><span className="detail-label-dax">Advance:</span><span className="detail-value-dax">₹{formatNumber(salesData.Advance)}</span></div>
          </div>
        </div>
        <div className="card-dax">
          <div className="card-header-dax">
            <h3 className="card-title-dax">Total Expenses</h3>
            <TrendingDown className="icon-red-dax" />
          </div>
          <p className="card-value-dax">₹{formatNumber(expensesData.totalExpenses)}</p>
          <p className="card-change-red-dax">
            {salesComparison.previous.expenses !== 0
              ? `${((salesComparison.current.expenses - salesComparison.previous.expenses) / salesComparison.previous.expenses * 100).toFixed(2)}% vs previous period`
              : 'N/A'}
          </p>
          <div className="card-details-dax">
            {expensesData.categories.map((cat, idx) => (
              <div key={idx} className="detail-row-dax">
                <span className="detail-label-dax">{cat.name}:</span>
                <span className="detail-value-dax">₹{formatNumber(cat.amount)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card-dax">
          <div className="card-header-dax">
            <h3 className="card-title-dax">Net Earnings</h3>
            <Wallet className="icon-blue-dax" />
          </div>
          <p className="card-value-dax">₹{formatNumber(profitData.totalProfit)}</p>
          <p className="card-change-green-dax">
            {salesComparison.previous.net !== 0
              ? `${((salesComparison.current.net - salesComparison.previous.net) / salesComparison.previous.net * 100).toFixed(2)}% vs previous period`
              : 'N/A'}
          </p>
          <div className="card-details-dax">
            <div className="detail-row-dax"><span className="detail-label-dax">Cash:</span><span className="detail-value-dax">₹{formatNumber(profitData.Cash)}</span></div>
            <div className="detail-row-dax"><span className="detail-label-dax">Card:</span><span className="detail-value-dax">₹{formatNumber(profitData.Card)}</span></div>
            <div className="detail-row-dax"><span className="detail-label-dax">Online:</span><span className="detail-value-dax">₹{formatNumber(profitData.Online)}</span></div>
            <div className="detail-row-dax"><span className="detail-label-dax">Cheque:</span><span className="detail-value-dax">₹{formatNumber(profitData.Cheque)}</span></div>
            <div className="detail-row-dax"><span className="detail-label-dax">Credit:</span><span className="detail-value-dax">₹{formatNumber(profitData.Credit)}</span></div>
            <div className="detail-row-dax"><span className="detail-label-dax">Advance:</span><span className="detail-value-dax">₹{formatNumber(profitData.Advance)}</span></div>
          </div>
        </div>
        <div className="card-dax">
          <div className="card-header-dax">
            <h3 className="card-title-dax">Advance Payments</h3>
            <CreditCard className="icon-yellow-dax" />
          </div>
          <p className="card-value-dax">₹{formatNumber(advancePayments.totalAdvance)}</p>
          <p className="card-change-yellow-dax">Used: ₹{formatNumber(advancePayments.usedAdvance)}</p>
          <div className="card-details-dax">
            <div className="detail-row-dax"><span className="detail-label-dax">Cash:</span><span className="detail-value-dax">₹{formatNumber(advancePayments.Cash)}</span></div>
            <div className="detail-row-dax"><span className="detail-label-dax">Card:</span><span className="detail-value-dax">₹{formatNumber(advancePayments.Card)}</span></div>
            <div className="detail-row-dax"><span className="detail-label-dax">Online:</span><span className="detail-value-dax">₹{formatNumber(advancePayments.Online)}</span></div>
            <div className="detail-row-dax"><span className="detail-label-dax">Cheque:</span><span className="detail-value-dax">₹{formatNumber(advancePayments.Cheque)}</span></div>
          </div>
        </div>
        <div className="card-dax">
          <div className="card-header-dax">
            <h3 className="card-title-dax">Credit Outstanding</h3>
            <AlertTriangle className="icon-orange-dax" />
          </div>
          <p className="card-value-dax">₹{formatNumber(creditData.totalCreditGiven)}</p>
          <p className="card-change-orange-dax">N/A</p>
          <div className="card-details-dax">
            <div className="detail-row-dax"><span className="detail-label-dax">Cash:</span><span className="detail-value-dax">₹{formatNumber(creditData.Cash)}</span></div>
            <div className="detail-row-dax"><span className="detail-label-dax">Card:</span><span className="detail-value-dax">₹{formatNumber(creditData.Card)}</span></div>
            <div className="detail-row-dax"><span className="detail-label-dax">Online:</span><span className="detail-value-dax">₹{formatNumber(creditData.Online)}</span></div>
            <div className="detail-row-dax"><span className="detail-label-dax">Cheque:</span><span className="detail-value-dax">₹{formatNumber(creditData.Cheque)}</span></div>
          </div>
        </div>
      </div>
      <div className="grid-3-dax">
        <div className="card-large-dax">
          <div className="card-header-large-dax">
            <h3 className="card-title-large-dax">Profit Graph</h3>
          </div>
          <div className="chart-container-dax">
            <img
              alt="Profit analysis chart showing trends over months"
              className="chart-image-dax"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXTfA_SIyRgX7METAgH_QaZNGRhf3T3xst_GdgOuFLpQSTso1N2Zhk5ZC3cwWs1F4c84MyJMH-U4x7cHz-7B5jF7Q0xnlnHTiJDlB_gEA8vluhmJRme3jAkGVluxeBY7lzr7j7pPlXau-D0LMgtMVl-tBFf1CA92-7jxImrStsYArzyt_WX7FLeBZvdv0HXvVYBLnzCRk7QNOOnQQQ7apa4jfoG3JHOg7sCKtZnGoPb7wQjz6wQyQFfLmdP91nn08j4nv6FJrgaX1R"
            />
          </div>
        </div>
        <div className="card-dax">
          <div className="card-header-large-dax">
            <h3 className="card-title-large-dax">Quick Actions</h3>
            <a className="link-dax" href="#">View All</a>
          </div>
          <div className="action-buttons-dax">
            <button className="action-button-dax button-primary-dax">
              <ShoppingCart className="icon-dax" />
              <span>New Sale / Invoice</span>
            </button>
            <button className="action-button-dax button-secondary-dax">
              <CreditCard className="icon-dax" />
              <span>Add Expense</span>
            </button>
            <button className="action-button-dax button-secondary-dax">
              <Package className="icon-dax" />
              <span>Update Stock</span>
            </button>
            <button className="action-button-dax button-secondary-dax">
              <Users className="icon-dax" />
              <span>Add New Customer</span>
            </button>
          </div>
        </div>
      </div>
      <div className="grid-2-dax">
        <div className="card-dax">
          <div className="card-header-large-dax">
            <h3 className="card-title-large-dax">Top Selling Items</h3>
            <a className="link-dax" href="#">View Report</a>
          </div>
          <div className="table-container-dax">
            <table className="table-dax">
              <thead className="table-head-dax">
                <tr>
                  <th className="table-header-dax" scope="col">Item Name</th>
                  <th className="table-header-dax table-center-dax" scope="col">Units Sold</th>
                  <th className="table-header-dax table-right-dax" scope="col">Total Revenue</th>
                </tr>
              </thead>
              <tbody>
                <tr className="table-row-dax">
                  <td className="table-cell-dax table-cell-bold-dax">Cement Bags (Brand A)</td>
                  <td className="table-cell-dax table-center-dax">1500</td>
                  <td className="table-cell-dax table-right-dax table-cell-green-dax">₹750,000</td>
                </tr>
                <tr className="table-row-dax">
                  <td className="table-cell-dax table-cell-bold-dax">TMT Steel Bars (12mm)</td>
                  <td className="table-cell-dax table-center-dax">850</td>
                  <td className="table-cell-dax table-right-dax table-cell-green-dax">₹680,000</td>
                </tr>
                <tr className="table-row-dax">
                  <td className="table-cell-dax table-cell-bold-dax">River Sand (per Ton)</td>
                  <td className="table-cell-dax table-center-dax">500</td>
                  <td className="table-cell-dax table-right-dax table-cell-green-dax">₹250,000</td>
                </tr>
                <tr className="table-row-dax">
                  <td className="table-cell-dax table-cell-bold-dax">Bricks (Standard Size)</td>
                  <td className="table-cell-dax table-center-dax">10000</td>
                  <td className="table-cell-dax table-right-dax table-cell-green-dax">₹80,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-dax">
          <div className="card-header-large-dax">
            <h3 className="card-title-large-dax">Lowest Advance Users</h3>
            <a className="link-dax" href="/advance-payments">View All</a>
          </div>
          <div className="customer-list-dax">
            {lowestAdvanceUsers.slice(0, 3).map((user, index) => (
              <div key={index} className="customer-item-dax">
                <CreditCard className="icon-yellow-dax" />
                <div className="customer-info-dax">
                  <p className="customer-name-dax">{user.name}</p>
                  <p className="customer-detail-dax">Pending: ₹{formatNumber(user.pending)}</p>
                </div>
                <a href="/advance-payments" className="view-profile-dax">View Profile</a>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid-2-dax">
        <div className="card-dax">
          <div className="card-header-large-dax">
            <h3 className="card-title-large-dax">Stock Alerts</h3>
            <a className="link-dax" href="/stock-management">Manage Stock</a>
          </div>
          <div className="stock-list-dax">
            {stockAlerts.map((item, index) => (
              <div key={index} className={`stock-item-dax ${item.stock === 0 ? 'stock-red-dax' : 'stock-yellow-dax'}`}>
                <div>
                  <p className={`stock-title-dax ${item.stock === 0 ? 'stock-title-red-dax' : 'stock-title-yellow-dax'}`}>
                    {item.stock === 0 ? 'Out of Stock' : 'Low Stock'}: {item.itemName}
                  </p>
                  <p className="stock-detail-dax">
                    Current: {item.stock} {item.unit} | Min. Level: {item.minStockLevel || 10} {item.unit}
                  </p>
                </div>
                <button className={`reorder-button-dax ${item.stock === 0 ? 'reorder-red-dax' : 'reorder-yellow-dax'}`}>
                  Reorder
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="card-dax">
          <div className="card-header-large-dax">
            <h3 className="card-title-large-dax">Top Credit Users</h3>
            <a className="link-dax" href="/credit-sales">View All</a>
          </div>
          <div className="customer-list-dax">
            {topCreditUsers.slice(0, 5).map((user, index) => (
              <div key={index} className="customer-item-dax">
                <AlertTriangle className="icon-orange-dax" />
                <div className="customer-info-dax">
                  <p className="customer-name-dax">{user.name}</p>
                  <p className="customer-detail-dax">Overdue: ₹{formatNumber(user.overdue)}</p>
                </div>
                <a href="/credit-sales" className="view-profile-dax">View Profile</a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default MainDashboard;