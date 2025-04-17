import React from 'react';
import { FiUser, FiDollarSign, FiCalendar } from 'react-icons/fi';
import './CustomerList.css';

export const CustomerList = ({ customers, searchTerm, onSelectCustomer }) => {
    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="customers-grid">
            <div className="grid-header">
                <div>Customer</div>
                <div>Total Credit</div>
                <div>Last Transaction</div>
                <div>Status</div>
                <div>Actions</div>
            </div>
            {filteredCustomers.map(customer => (
                <div key={customer.id} className="customer-row">
                    <div className="customer-info">
                        <FiUser className="customer-icon" />
                        <div>
                            <h3>{customer.name}</h3>
                            <span>{customer.phone}</span>
                        </div>
                    </div>
                    <div className="credit-amount">
                        {/* <FiDollarSign /> */}
                        ₹{customer.totalCredit.toLocaleString()}
                    </div>
                    <div className="last-transaction">
                        <FiCalendar />
                        {new Date(customer.lastTransaction).toLocaleDateString()}
                    </div>
                    <div className={`status status-${customer.status.toLowerCase()}`}>
                        {customer.status}
                    </div>
                    <div>
                        <button
                            className="btn-view"
                            onClick={() => onSelectCustomer(customer)}
                            aria-label={`View details for ${customer.name}`}
                        >
                            View Details
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};