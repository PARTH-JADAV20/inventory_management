import React, { useState } from 'react';
import { FiX, FiUser, FiPackage, FiDollarSign, FiCalendar } from 'react-icons/fi';

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
        <div
            className="fixed inset-0 bg-black/70 flex justify-center items-center z-[1000] animate-[fadeIn_0.4s_ease]"
            onClick={onClose}
        >
            <div
                className="bg-slate-900/95 backdrop-blur-2xl rounded-3xl w-[900px] max-h-[90vh] overflow-y-auto p-10 shadow-[0_10px_40px_rgba(0,0,0,0.4)] border border-white/10 animate-[slideIn_0.4s_ease] xl:w-[800px] md:w-[95%] md:p-6"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-3xl font-extrabold text-slate-200 tracking-tight xl:text-2xl">Add Credit</h2>
                    <button
                        className="bg-gradient-to-br from-slate-700 to-slate-600 text-slate-200 p-3 rounded-full text-2xl cursor-pointer hover:from-blue-600 hover:to-purple-600 hover:text-white hover:rotate-90 transition-all duration-300"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        <FiX />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-10">
                    <div className="flex flex-col gap-8">
                        <h3 className="text-xl text-slate-200 font-extrabold mb-3 xl:text-lg">Customer Information</h3>
                        <div className="flex flex-col flex-1">
                            <label className="flex items-center gap-3 text-lg text-slate-200 font-extrabold mb-3 xl:text-base">
                                <FiUser className="text-blue-500 text-2xl" />
                                Select Existing Customer
                            </label>
                            <select
                                name="existingCustomerId"
                                value={formData.existingCustomerId}
                                onChange={handleChange}
                                className={`py-4 px-5 border rounded-xl text-lg bg-slate-800 text-slate-200 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none ${
                                    errors.customerName ? 'border-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.2)]' : 'border-slate-600'
                                } xl:text-base`}
                            >
                                <option value="">New Customer</option>
                                {existingCustomers.map(customer => (
                                    <option key={customer.id} value={customer.id}>
                                        {customer.name} ({customer.phone})
                                    </option>
                                ))}
                            </select>
                            {errors.customerName && (
                                <span className="text-red-500 text-base mt-2 font-medium xl:text-sm">{errors.customerName}</span>
                            )}
                        </div>
                        {!formData.existingCustomerId && (
                            <>
                                <div className="flex flex-col flex-1">
                                    <label className="flex items-center gap-3 text-lg text-slate-200 font-extrabold mb-3 xl:text-base">
                                        <FiUser className="text-blue-500 text-2xl" />
                                        Customer Name
                                    </label>
                                    <input
                                        type="text"
                                        name="customerName"
                                        value={formData.customerName}
                                        onChange={handleChange}
                                        className={`py-4 px-5 border rounded-xl text-lg bg-slate-800 text-slate-200 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none ${
                                            errors.customerName ? 'border-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.2)]' : 'border-slate-600'
                                        } xl:text-base`}
                                    />
                                    {errors.customerName && (
                                        <span className="text-red-500 text-base mt-2 font-medium xl:text-sm">{errors.customerName}</span>
                                    )}
                                </div>
                                <div className="flex flex-col flex-1">
                                    <label className="flex items-center gap-3 text-lg text-slate-200 font-extrabold mb-3 xl:text-base">
                                        <FiUser className="text-blue-500 text-2xl" />
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className={`py-4 px-5 border rounded-xl text-lg bg-slate-800 text-slate-200 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none ${
                                            errors.phone ? 'border-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.2)]' : 'border-slate-600'
                                        } xl:text-base`}
                                    />
                                    {errors.phone && (
                                        <span className="text-red-500 text-base mt-2 font-medium xl:text-sm">{errors.phone}</span>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                    <div className="flex flex-col gap-8">
                        <h3 className="text-xl text-slate-200 font-extrabold mb-3 xl:text-lg">Credit Details</h3>
                        <div className="flex flex-col flex-1">
                            <label className="flex items-center gap-3 text-lg text-slate-200 font-extrabold mb-3 xl:text-base">
                                <FiPackage className="text-blue-500 text-2xl" />
                                Item Description
                            </label>
                            <input
                                type="text"
                                name="item"
                                value={formData.item}
                                onChange={handleChange}
                                className={`py-4 px-5 border rounded-xl text-lg bg-slate-800 text-slate-200 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none ${
                                    errors.item ? 'border-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.2)]' : 'border-slate-600'
                                } xl:text-base`}
                            />
                            {errors.item && (
                                <span className="text-red-500 text-base mt-2 font-medium xl:text-sm">{errors.item}</span>
                            )}
                        </div>
                        <div className="flex gap-8 xl:gap-6 md:flex-col md:gap-6">
                            <div className="flex flex-col flex-1">
                                <label className="flex items-center gap-3 text-lg text-slate-200 font-extrabold mb-3 xl:text-base">
                                    <FiDollarSign className="text-blue-500 text-2xl" />
                                    Amount
                                </label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    className={`py-4 px-5 border rounded-xl text-lg bg-slate-800 text-slate-200 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none ${
                                        errors.amount ? 'border-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.2)]' : 'border-slate-600'
                                    } xl:text-base`}
                                />
                                {errors.amount && (
                                    <span className="text-red-500 text-base mt-2 font-medium xl:text-sm">{errors.amount}</span>
                                )}
                            </div>
                            <div className="flex flex-col flex-1">
                                <label className="flex items-center gap-3 text-lg text-slate-200 font-extrabold mb-3 xl:text-base">
                                    <FiCalendar className="text-blue-500 text-2xl" />
                                    Date
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    className="py-4 px-5 border border-slate-600 rounded-xl text-lg bg-slate-800 text-slate-200 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none xl:text-base"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-8 justify-end xl:gap-6 md:flex-col">
                        <button
                            type="button"
                            className="py-4 px-10 bg-gradient-to-br from-slate-700 to-slate-600 text-slate-200 font-extrabold rounded-xl hover:from-slate-600 hover:to-slate-500 hover:-translate-y-1 hover:shadow-[0_6px_24px_rgba(0,0,0,0.3)] transition-all duration-300 xl:px-8 md:w-full md:text-center md:py-3"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="py-4 px-10 bg-gradient-to-br from-blue-600 to-purple-600 text-white font-extrabold rounded-xl hover:from-blue-700 hover:to-purple-700 hover:-translate-y-1 hover:shadow-[0_6px_24px_rgba(37,99,235,0.5)] transition-all duration-300 xl:px-8 md:w-full md:text-center md:py-3"
                        >
                            Add Credit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};