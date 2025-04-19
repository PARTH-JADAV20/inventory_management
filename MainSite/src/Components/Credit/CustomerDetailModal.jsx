import React, { useState } from 'react';
import { FiX, FiDollarSign, FiCalendar, FiCheck, FiCreditCard, FiArrowRight } from 'react-icons/fi';
import { PartialPaymentHistory } from './PartialPaymentHistory';

export const CustomerDetailModal = ({ customer, transactions, onClose, onPaymentUpdate }) => {
    const [paymentMode, setPaymentMode] = useState('');
    const [paymentAmount, setPaymentAmount] = useState('');
    const [processingTransactionId, setProcessingTransactionId] = useState(null);

    const totalPending = transactions
        .filter(trans => trans.status === 'Pending')
        .reduce((sum, trans) => sum + trans.amount, 0);

    const handlePayment = (transactionId, maxAmount) => {
        if (!paymentMode) {
            alert('Please select a payment mode');
            return;
        }
        if (!paymentAmount || paymentAmount <= 0) {
            alert('Please enter a valid payment amount');
            return;
        }
        if (parseFloat(paymentAmount) > maxAmount) {
            alert(`Payment amount cannot exceed ₹${maxAmount.toLocaleString()}`);
            return;
        }
        
        setProcessingTransactionId(transactionId);
        
        // Simulate processing delay
        setTimeout(() => {
            onPaymentUpdate(transactionId, paymentMode, parseFloat(paymentAmount));
            setPaymentMode('');
            setPaymentAmount('');
            setProcessingTransactionId(null);
        }, 800);
    };

    return (
        <div
            className="fixed inset-0 bg-black/70 flex justify-center items-center z-[1000] backdrop-blur-sm animate-[fadeIn_0.3s_ease]"
            onClick={onClose}
        >
            <div
                className="bg-slate-900 rounded-3xl w-[1000px] max-h-[90vh] overflow-y-auto animate-[slideIn_0.3s_ease] border border-slate-700/50 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 p-6 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-3">
                            <FiCreditCard className="text-white text-2xl" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{customer.name}</h2>
                            <p className="text-slate-400">{customer.phone}</p>
                        </div>
                    </div>
                    <button
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2 rounded-full hover:text-white transition-colors"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        <FiX className="text-xl" />
                    </button>
                </div>
                
                {/* Content */}
                <div className="p-6">
                    {/* Customer Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-slate-800/70 rounded-2xl p-5 border border-slate-700/50">
                            <div className="flex items-center gap-3 mb-2">
                                <FiDollarSign className="text-blue-500" />
                                <h3 className="text-slate-300 font-medium">Total Credit</h3>
                            </div>
                            <p className="text-2xl font-bold text-white">₹{customer.totalCredit.toLocaleString()}</p>
                        </div>
                        
                        <div className="bg-slate-800/70 rounded-2xl p-5 border border-slate-700/50">
                            <div className="flex items-center gap-3 mb-2">
                                <FiDollarSign className="text-blue-500" />
                                <h3 className="text-slate-300 font-medium">Pending Amount</h3>
                            </div>
                            <p className="text-2xl font-bold text-white">₹{totalPending.toLocaleString()}</p>
                        </div>
                        
                        <div className="bg-slate-800/70 rounded-2xl p-5 border border-slate-700/50">
                            <div className="flex items-center gap-3 mb-2">
                                <FiCalendar className="text-blue-500" />
                                <h3 className="text-slate-300 font-medium">Last Transaction</h3>
                            </div>
                            <p className="text-2xl font-bold text-white">{new Date(customer.lastTransaction).toLocaleDateString()}</p>
                        </div>
                    </div>
                    
                    {/* Transactions */}
                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-white mb-4">Transaction History</h3>
                        <div className="bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-700/50">
                            <div className="grid grid-cols-[1fr_2fr_1fr_1fr_auto] p-4 text-slate-400 font-medium text-sm border-b border-slate-700 md:hidden">
                                <span>Date</span>
                                <span>Item</span>
                                <span>Amount</span>
                                <span>Status</span>
                                <span>Action</span>
                            </div>
                            
                            {transactions.length === 0 ? (
                                <div className="p-6 text-center text-slate-400">
                                    No transactions found for this customer
                                </div>
                            ) : (
                                <>
                                    {transactions.map((trans) => (
                                        <div
                                            key={trans.id}
                                            className="grid grid-cols-[1fr_2fr_1fr_1fr_auto] p-4 border-b border-slate-700/50 text-slate-300 hover:bg-slate-700/30 transition-all md:grid-cols-1 md:gap-3"
                                        >
                                            <div className="flex items-center md:justify-between">
                                                <span className="md:text-slate-400 md:text-sm md:font-medium">Date:</span>
                                                <span>{new Date(trans.date).toLocaleDateString()}</span>
                                            </div>
                                            
                                            <div className="flex items-center md:justify-between">
                                                <span className="md:text-slate-400 md:text-sm md:font-medium">Item:</span>
                                                <span className="font-medium">{trans.item}</span>
                                            </div>
                                            
                                            <div className="flex items-center md:justify-between">
                                                <span className="md:text-slate-400 md:text-sm md:font-medium">Amount:</span>
                                                <span className="font-bold">₹{trans.amount.toLocaleString()}</span>
                                            </div>
                                            
                                            <div className="flex items-center md:justify-between">
                                                <span className="md:text-slate-400 md:text-sm md:font-medium">Status:</span>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                        trans.status.toLowerCase() === 'pending'
                                                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                                            : 'bg-green-500/20 text-green-300 border border-green-500/30'
                                                    }`}
                                                >
                                                    {trans.status}
                                                </span>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 md:flex-wrap md:mt-2">
                                                {trans.status === 'Pending' && (
                                                    <>
                                                        <input
                                                            type="number"
                                                            placeholder="Amount"
                                                            value={paymentAmount}
                                                            onChange={(e) => setPaymentAmount(e.target.value)}
                                                            className="py-2 px-3 border border-slate-600 rounded-lg text-sm bg-slate-700 text-slate-200 focus:border-blue-500 focus:outline-none w-24 md:flex-1"
                                                            aria-label="Payment amount"
                                                        />
                                                        <select
                                                            value={paymentMode}
                                                            onChange={(e) => setPaymentMode(e.target.value)}
                                                            className="py-2 px-3 border border-slate-600 rounded-lg text-sm bg-slate-700 text-slate-200 focus:border-blue-500 focus:outline-none w-32 md:flex-1"
                                                            aria-label="Select payment mode"
                                                        >
                                                            <option value="">Payment Mode</option>
                                                            <option value="Cash">Cash</option>
                                                            <option value="Online">Online</option>
                                                            <option value="Cheque">Cheque</option>
                                                        </select>
                                                        <button
                                                            className="flex items-center gap-1 py-2 px-4 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-500 transition-colors disabled:bg-slate-600 disabled:text-slate-400 md:flex-1"
                                                            onClick={() => handlePayment(trans.id, trans.amount)}
                                                            disabled={!paymentMode || !paymentAmount || processingTransactionId === trans.id}
                                                        >
                                                            {processingTransactionId === trans.id ? (
                                                                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                            ) : (
                                                                <FiCheck className="text-sm" />
                                                            )}
                                                            {processingTransactionId === trans.id ? 'Processing...' : 'Pay Now'}
                                                        </button>
                                                    </>
                                                )}
                                                
                                                {trans.status === 'Cleared' && (
                                                    <span className="text-green-400 flex items-center gap-1">
                                                        <FiCheck /> Paid
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                    
                    {/* Payment History */}
                    {transactions.some(trans => trans.payments && trans.payments.length > 0) && (
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-white mb-4">Payment History</h3>
                            {transactions.map(trans => (
                                trans.payments && trans.payments.length > 0 && (
                                    <PartialPaymentHistory
                                        key={trans.id}
                                        transaction={trans}
                                    />
                                )
                            ))}
                        </div>
                    )}
                </div>
                
                {/* Footer */}
                <div className="sticky bottom-0 border-t border-slate-800 p-6 bg-slate-900/95 backdrop-blur-xl flex justify-end">
                    <button
                        className="py-2 px-6 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition-colors"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};