import React, { useState } from 'react';
import { FiX, FiDollarSign, FiCalendar, FiCheck } from 'react-icons/fi';
import './CustomerDetailModal.css';

export const CustomerDetailModal = ({ customer, transactions, onClose, onPaymentUpdate }) => {
    const [paymentMode, setPaymentMode] = useState('');

    const handlePayment = (transactionId) => {
        if (!paymentMode) {
            alert('Please select a payment mode');
            return;
        }
        onPaymentUpdate(transactionId, paymentMode);
        setPaymentMode('');
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h2 style={{color: 'gray'}}>{customer.name}</h2>
                        <p className="customer-phone">{customer.phone}</p>
                    </div>
                    <button className="close-btn" onClick={onClose} aria-label="Close modal">
                        <FiX />
                    </button>
                </div>
                <div className="modal-body">
                    <div className="customer-summary">
                        <div className="summary-item">
                            {/* <FiDollarSign className="summary-icon" /> */}
                            <div>
                                <h4>Total Credit</h4>
                                <p>₹{customer.totalCredit.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="summary-item">
                            <FiCalendar className="summary-icon" />
                            <div>
                                <h4>Last Transaction</h4>
                                <p>{new Date(customer.lastTransaction).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                    <div className="transactions-list">
                        <h3 style={{color: 'gray'}}>Transaction History</h3>
                        <div className="transaction-header">
                            <span>Date</span>
                            <span>Item</span>
                            <span>Amount</span>
                            <span>Status</span>
                            <span>Action</span>
                        </div>
                        {transactions.map(trans => (
                            <div key={trans.id} className="transaction-item">
                                <div className="trans-date">
                                    {new Date(trans.date).toLocaleDateString()}
                                </div>
                                <div className="trans-item">{trans.item}</div>
                                <div className="trans-amount">₹{trans.amount.toLocaleString()}</div>
                                <div className={`trans-status status-${trans.status.toLowerCase()}`}>
                                    {trans.status}
                                </div>
                                <div className="trans-action">
                                    {trans.status === 'Pending' && (
                                        <>
                                            <select
                                                value={paymentMode}
                                                onChange={(e) => setPaymentMode(e.target.value)}
                                                className="payment-mode"
                                                aria-label="Select payment mode"
                                            >
                                                <option value="">Select Payment Mode</option>
                                                <option value="Cash">Cash</option>
                                                <option value="Online">Online</option>
                                                <option value="Cheque">Cheque</option>
                                            </select>
                                            <button
                                                className="btn-clear-payment"
                                                onClick={() => handlePayment(trans.id)}
                                                disabled={!paymentMode}
                                            >
                                                <FiCheck /> Clear Bill
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};