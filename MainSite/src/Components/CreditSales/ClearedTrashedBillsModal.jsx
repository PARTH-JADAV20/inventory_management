import React, { useState, useEffect, useContext } from 'react';
import { format } from 'date-fns';
import { Search, AlertCircle } from 'lucide-react';
import { ShopContext } from '../ShopContext/ShopContext';
import { fetchTrashedCreditSales, restoreCreditSaleFromTrash } from '../api';
import './ClearedTrashedBillsModal.css';

function ClearedTrashedBillsModal({ shop, onClose }) {
  const { shop: contextShop } = useContext(ShopContext);
  const [trashedBills, setTrashedBills] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('trashedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTrashedBills();
  }, [page, sortBy, sortOrder]);

  useEffect(() => {
    setPage(1); // Reset to page 1 on search change
    fetchTrashedBills();
  }, [search]);

  const fetchTrashedBills = async () => {
    setLoading(true);
    try {
      const currentShop = shop || contextShop;
      if (!currentShop) {
        throw new Error('Shop ID is not provided');
      }
      const response = await fetchTrashedCreditSales(
        currentShop,
        page,
        limit,
        sortBy,
        sortOrder,
        search.trim() || undefined
      );
      const bills = Array.isArray(response.data) ? response.data : [];
      setTrashedBills(bills);
      setTotalPages(response.totalPages || 1);
      setError('');
    } catch (err) {
      console.error('Error fetching trashed bills:', err);
      setError('Failed to load bills. Please try again.');
      setTrashedBills([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id) => {
    if (!window.confirm('Are you sure you want to restore this bill?')) return;
    try {
      const currentShop = shop || contextShop;
      if (!currentShop) {
        throw new Error('Shop ID is not provided');
      }
      await restoreCreditSaleFromTrash(currentShop, id);
      fetchTrashedBills();
    } catch (err) {
      console.error('Error restoring bill:', err);
      setError('Failed to restore bill. Please try again.');
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const formatDate = (dateStr) => {
    if (!dateStr || isNaN(new Date(dateStr).getTime())) return 'N/A';
    try {
      return format(new Date(dateStr), 'd MMMM yyyy');
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="modal-overlay-dax" role="dialog" aria-labelledby="modal-title-dax">
      <div className="modal-content-dax">
        <div className="modal-header-dax">
          <h2 id="modal-title-dax">Cleared & Trashed Bills</h2>
          <button
            className="close-btn-dax"
            onClick={onClose}
            aria-label="Close modal"
            disabled={loading}
          >
            ×
          </button>
        </div>
        <div className="modal-body-dax">
          {error && (
            <div className="error-message-dax">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          <div className="search-bar-dax">
            <Search size={18} className="search-icon-dax" />
            <input
              type="text"
              placeholder="Search by bill number, customer name, or phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search bills"
              disabled={loading}
            />
          </div>
          {loading ? (
            <div className="loading-dax">
              <div className="spinner-dax"></div>
              Loading bills...
            </div>
          ) : trashedBills.length === 0 ? (
            <div className="no-data-dax">
              <p>No cleared or trashed bills found.</p>
              <p>Try adjusting your search or check back later.</p>
            </div>
          ) : (
            <div className="table-container-dax">
              <table className="bills-table-dax" aria-label="Cleared and trashed bills table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('billNumber')} aria-sort={sortBy === 'billNumber' ? sortOrder : 'none'}>
                      Bill No {sortBy === 'billNumber' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('customerName')} aria-sort={sortBy === 'customerName' ? sortOrder : 'none'}>
                      Customer {sortBy === 'customerName' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('phoneNumber')} aria-sort={sortBy === 'phoneNumber' ? sortOrder : 'none'}>
                      Phone {sortBy === 'phoneNumber' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('totalAmount')} aria-sort={sortBy === 'totalAmount' ? sortOrder : 'none'}>
                      Total Amount {sortBy === 'totalAmount' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('status')} aria-sort={sortBy === 'status' ? sortOrder : 'none'}>
                      Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('trashedAt')} aria-sort={sortBy === 'trashedAt' ? sortOrder : 'none'}>
                      Trashed At {sortBy === 'trashedAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trashedBills.map((bill) => (
                    <tr key={bill._id}>
                      <td>{bill.billNumber}</td>
                      <td>{bill.customerName}</td>
                      <td>{bill.phoneNumber}</td>
                      <td>₹{(bill.totalAmount || 0).toFixed(2)}</td>
                      <td className={`status-${(bill.status || 'Unknown').toLowerCase()}-dax`}>
                        {bill.status || 'Unknown'}
                      </td>
                      <td>{formatDate(bill.trashedAt)}</td>
                      <td>
                        <button
                          className="restore-btn-dax"
                          onClick={() => handleRestore(bill._id)}
                          disabled={loading}
                          aria-label={`Restore bill ${bill.billNumber}`}
                        >
                          Restore
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="pagination-dax">
            <button
              disabled={page === 1 || loading}
              onClick={() => setPage(page - 1)}
              className="page-btn-dax"
              aria-label="Previous page"
            >
              Previous
            </button>
            <span aria-live="polite">Page {page} of {totalPages}</span>
            <button
              disabled={page === totalPages || loading}
              onClick={() => setPage(page + 1)}
              className="page-btn-dax"
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClearedTrashedBillsModal;