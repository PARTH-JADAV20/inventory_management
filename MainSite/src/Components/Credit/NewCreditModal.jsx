import React, { useState } from 'react';
import { FiX, FiUser, FiPackage, FiDollarSign, FiCalendar } from 'react-icons/fi';
import './NewCreditModal.css';

export const NewCreditModal = ({ onClose, onSubmit, existingCustomers }) => {
    const [formData, setFormData] = useState({
        existingCustomerId: '',
        customerName: '',
        phone: '',
        item: '',
        amount: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        if (!formData.existingCustomerId && !formData.customerName)
            newErrors.customerName = 'Select an existing customer or enter a new name';
        if (!formData.existingCustomerId && !formData.phone)
            newErrors.phone = 'Phone is required for new customers';
        if (!formData.item) newErrors.item = 'Item description is required';
        if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Enter a valid amount';
        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = validateForm();
        if (Object.keys(newErrors).length === 0) {
            onSubmit(formData);
        } else {
            setErrors(newErrors);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (name === 'existingCustomerId' && value) {
            const customer = existingCustomers.find(c => c.id === parseInt(value));
            setFormData(prev => ({
                ...prev,
                customerName: customer ? customer.name : '',
                phone: customer ? customer.phone : ''
            }));
        }
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 style={{color: 'gray'}}>Add Credit</h2>
                    <button className="close-btn" onClick={onClose} aria-label="Close modal">
                        <FiX />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="credit-form">
                    <div className="form-section">
                        <h3 style={{color: '#808080'}}>Customer Information</h3>
                        <div className="form-group">
                            <label>
                                <FiUser className="input-icon" />
                                Select Existing Customer
                            </label>
                            <select
                                name="existingCustomerId"
                                value={formData.existingCustomerId}
                                onChange={handleChange}
                                className={errors.customerName ? 'error' : ''}
                            >
                                <option value="">New Customer</option>
                                {existingCustomers.map(customer => (
                                    <option key={customer.id} value={customer.id}>
                                        {customer.name} ({customer.phone})
                                    </option>
                                ))}
                            </select>
                            {errors.customerName && (
                                <span className="error-message">{errors.customerName}</span>
                            )}
                        </div>
                        {!formData.existingCustomerId && (
                            <>
                                <div className="form-group">
                                    <label>
                                        <FiUser className="input-icon" />
                                        Customer Name
                                    </label>
                                    <input
                                        type="text"
                                        name="customerName"
                                        value={formData.customerName}
                                        onChange={handleChange}
                                        className={errors.customerName ? 'error' : ''}
                                    />
                                    {errors.customerName && (
                                        <span className="error-message">{errors.customerName}</span>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label>
                                        <FiUser className="input-icon" />
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className={errors.phone ? 'error' : ''}
                                    />
                                    {errors.phone && (
                                        <span className="error-message">{errors.phone}</span>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                    <div className="form-section">
                        <h3>Credit Details</h3>
                        <div className="form-group">
                            <label>
                                <FiPackage className="input-icon" />
                                Item Description
                            </label>
                            <input
                                type="text"
                                name="item"
                                value={formData.item}
                                onChange={handleChange}
                                className={errors.item ? 'error' : ''}
                            />
                            {errors.item && (
                                <span className="error-message">{errors.item}</span>
                            )}
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>
                                    <FiDollarSign className="input-icon" />
                                    Amount
                                </label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    className={errors.amount ? 'error' : ''}
                                />
                                {errors.amount && (
                                    <span className="error-message">{errors.amount}</span>
                                )}
                            </div>
                            <div className="form-group">
                                <label>
                                    <FiCalendar className="input-icon" />
                                    Date
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-submit">
                            Add Credit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};