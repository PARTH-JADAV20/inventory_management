import React from 'react';
import { FiSearch, FiPlus } from 'react-icons/fi';
import './CreditHeader.css';

export const CreditHeader = ({ search, setSearch, onNewCredit }) => {
    return (
        <div className="credit-header">
            <div className="header-left">
                <h1>Credit Management Dashboard</h1>
                <p className="subtitle">Manage customer credits with ease</p>
            </div>
            <div className="header-right">
                <div className="search-container">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search customers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="search-input"
                        aria-label="Search customers"
                    />
                </div>
                <button className="new-credit-btn" onClick={onNewCredit} aria-label="Add new credit">
                    <FiPlus />
                    <span>Add Credit</span>
                </button>
            </div>
        </div>
    );
};