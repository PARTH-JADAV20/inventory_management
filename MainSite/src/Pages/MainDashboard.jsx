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
  fetchPendingAdvances, 
  fetchCreditSalesSummary, 
  fetchLowStock, 
  fetchRecentSales, 
  fetchSalesComparison 
} from '../Components/api';

const MainDashboard = () => {
  const [shop, setShop] = useState('all');
  const [period, setPeriod] = useState('today');
  const [salesData, setSalesData] = useState({ totalSales: 0, Cash: 0, Online: 0, Cheque: 0, Credit: 0, Advance: 0 });
  const [expensesData, setExpensesData] = useState({ totalExpenses: 0, Cash: 0, Online: 0, Cheque: 0 });
  const [profitData, setProfitData] = useState({ totalProfit: 0, Cash: 0, Online: 0, Cheque: 0, Credit: 0, Advance: 0 });
  const [advanceData, setAdvanceData] = useState({ totalPendingAdvance: 0, Cash: 0, Online: 0, Cheque: 0 });
  const [creditData, setCreditData] = useState({ totalCreditGiven: 0, Cash: 0, Online: 0, Cheque: 0 });
  const [stockAlerts, setStockAlerts] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [salesComparison, setSalesComparison] = useState({ yesterdayComparison: { percentage: 'N/A' } });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sales, expenses, profit, advances, credits, stock, salesRecent, comparison] = await Promise.all([
          fetchTotalSales(shop, period),
          fetchTotalExpenses(shop, period),
          fetchTotalProfit(shop, period),
          fetchPendingAdvances(shop, period),
          fetchCreditSalesSummary(shop, period),
          fetchLowStock(shop, period),
          fetchRecentSales(shop, period),
          fetchSalesComparison(shop)
        ]);
        setSalesData(sales);
        setExpensesData(expenses);
        setProfitData(profit);
        setAdvanceData(advances);
        setCreditData(credits);
        setStockAlerts(stock);
        setRecentSales(salesRecent);
        setSalesComparison(comparison);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchData();
  }, [shop, period]);

  const handleShopChange = (e) => setShop(e.target.value);
  const handlePeriodChange = (value) => setPeriod(value);

  return (
    <main className="main-dax">
      <header className="header-dax">
        <h2 className="title-dax">Dashboard Overview</h2>
        <div className="controls-dax">
          <div className="select-container-dax">
            <select className="select-dropdown-dax" value={shop} onChange={handleShopChange}>
              <option value="all">All Shops</option>
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
          <p className="card-value-dax">₹{salesData.totalSales.toLocaleString()}</p>
          <p className="card-change-green-dax">
            {salesComparison.yesterdayComparison.percentage !== 'N/A' 
              ? `${salesComparison.yesterdayComparison.percentage > 0 ? '+' : ''}${salesComparison.yesterdayComparison.percentage}% vs yesterday`
              : 'N/A'}
          </p>
          <div className="card-details-dax">
            <div className="detail-row-dax"><span className="detail-label-dax">Cash:</span><span className="detail-value-dax">₹{salesData.Cash.toLocaleString()}</span></div>
            <div className="detail-row-dax"><span className="detail-label-dax">Online:</span><span className="detail-value-dax">₹{salesData.Online.toLocaleString()}</span></div>
            <div className="detail-row-dax"><span className="detail-label-dax">Card:</span><span className="detail-value-dax">₹{salesData.Credit.toLocaleString()}</span></div>
            <div className="detail-row-dax"><span className="detail-label-dax">Cheque:</span><span className="detail-value-dax">₹{salesData.Cheque.toLocaleString()}</span></div>
            <div className="detail-row-dax"><span className="detail-label-dax">Advance:</span><span className="detail-value-dax">₹{salesData.Advance.toLocaleString()}</span></div>
          </div>
        </div>
        <div className="card-dax">
          <div className="card-header-dax">
            <h3 className="card-title-dax">Total Expenses</h3>
            <TrendingDown className="icon-red-dax" />
          </div>
          <p className="card-value-dax">₹{expensesData.totalExpenses.toLocaleString()}</p>
          <p className="card-change-red-dax">N/A</p>
          <div className="card-details-dax">
            <div className="detail-row-dax"><span className="detail-label-dax">Cash:</span><span className="detail-value-dax">₹{expensesData.Cash.toLocaleString()}</span></div>
            <div className="detail-row-dax"><span className="detail-label-dax">Online:</span><span className="detail-value-dax">₹{expensesData.Online.toLocaleString()}</span></div>
            <div className="detail-row-dax"><span className="detail-label-dax">Cheque:</span><span className="detail-value-dax">₹{expensesData.Cheque.toLocaleString()}</span></div>
          </div>
        </div>
        <div className="card-dax">
          <div className="card-header-dax">
            <h3 className="card-title-dax">Net Earnings</h3>
            <Wallet className="icon-blue-dax" />
          </div>
          <p className="card-value-dax">₹{profitData.totalProfit.toLocaleString()}</p>
          <p className="card-change-green-dax">N/A</p>
          <div className="card-details-dax">
            <div className="detail-row-dax"><span className="detail-label-dax">Cash:</span><span className="detail-value-dax">₹{profitData.Cash.toLocaleString()}</span></div>
            <div className="detail-row-dax"><span className="detail-label-dax">Online:</span><span className="detail-value-dax">₹{profitData.Online.toLocaleString()}</span></div>
            <div className="detail-row-dax"><span className="detail-label-dax">Cheque:</span><span className="detail-value-dax">₹{profitData.Cheque.toLocaleString()}</span></div>
            <div className="detail-row-dax"><span className="detail-label-dax">Credit:</span><span className="detail-value-dax">₹{profitData.Credit.toLocaleString()}</span></div>
            <div className="detail-row-dax"><span className="detail-label-dax">Advance:</span><span className="detail-value-dax">₹{profitData.Advance.toLocaleString()}</span></div>
          </div>
        </div>
        <div className="card-dax">
          <div className="card-header-dax">
            <h3 className="card-title-dax">Advances</h3>
            <CreditCard className="icon-yellow-dax" />
          </div>
          <p className="card-value-dax">₹{advanceData.totalPendingAdvance.toLocaleString()}</p>
          <p className="card-change-yellow-dax">N/A</p>
          <div className="card-details-dax">
            <div className="detail-row-dax"><span className="detail-label-dax">Cash:</span><span className="detail-value-dax">₹{advanceData.Cash.toLocaleString()}</span></div>
            <div className="detail-row-dax"><span className="detail-label-dax">Online:</span><span className="detail-value-dax">₹{advanceData.Online.toLocaleString()}</span></div>
            <div className="detail-row-dax"><span className="detail-label-dax">Cheque:</span><span className="detail-value-dax">₹{advanceData.Cheque.toLocaleString()}</span></div>
          </div>
        </div>
        <div className="card-dax">
          <div className="card-header-dax">
            <h3 className="card-title-dax">Credit Overdue</h3>
            <AlertTriangle className="icon-orange-dax" />
          </div>
          <p className="card-value-dax">₹{creditData.totalCreditGiven.toLocaleString()}</p>
          <p className="card-change-orange-dax">N/A</p>
          <div className="card-details-dax">
            <div className="detail-row-dax"><span className="detail-label-dax">Cash:</span><span className="detail-value-dax">₹{creditData.Cash.toLocaleString()}</span></div>
            <div className="detail-row-dax"><span className="detail-label-dax">Online:</span><span className="detail-value-dax">₹{creditData.Online.toLocaleString()}</span></div>
            <div className="detail-row-dax"><span className="detail-label-dax">Cheque:</span><span className="detail-value-dax">₹{creditData.Cheque.toLocaleString()}</span></div>
          </div>
        </div>
      </div>
      <div className="grid-3-dax">
        <div className="card-large-dax">
          <div className="card-header-large-dax">
            <h3 className="card-title-large-dax">Sales & Profit Trends</h3>
            <div className="button-group-dax">
              <button className="button-dax button-primary-dax">Monthly</button>
              <button className="button-dax button-secondary-dax">Quarterly</button>
              <button className="button-dax button-secondary-dax">Yearly</button>
            </div>
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
            <h3 className="card-title-large-dax">Recent Sales</h3>
            <a className="link-dax" href="/advance-payments">View All</a>
          </div>
          <div className="customer-list-dax">
            {recentSales.slice(0, 3).map((sale, index) => (
              <div key={index} className="customer-item-dax">
                <CreditCard className="icon-yellow-dax" />
                <div className="customer-info-dax">
                  <p className="customer-name-dax">{sale.customerName || 'Unknown'}</p>
                  <p className="customer-detail-dax">Sale: ₹{sale.amount.toLocaleString()} ({sale.date})</p>
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
                    Current: {item.stock} {item.unit} | Min. Level: {item.minStockLevel} {item.unit}
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
            <h3 className="card-title-large-dax">Credit Overdue</h3>
            <select className="select-dropdown-small-dax">
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Quarter</option>
            </select>
          </div>
          <div className="customer-list-dax">
            {recentSales.filter(sale => sale.paymentMethod === 'Credit').slice(0, 5).map((sale, index) => (
              <div key={index} className="customer-item-dax">
                <AlertTriangle className="icon-orange-dax" />
                <div className="customer-info-dax">
                  <p className="customer-name-dax">{sale.customerName || 'Unknown'}</p>
                  <p className="customer-detail-dax">Overdue: ₹{sale.amount.toLocaleString()} ({sale.date})</p>
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