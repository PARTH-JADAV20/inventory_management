import React from 'react';
import { FiCreditCard } from 'react-icons/fi';

export const PartialPaymentHistory = ({ transaction }) => {
    const totalPaid = transaction.payments.reduce((sum, payment) => sum + payment.amount, 0);
    const percentagePaid = (totalPaid / transaction.originalAmount) * 100;
    
    return (
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-5 mb-4">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <FiCreditCard className="text-blue-500" />
                    <h4 className="font-bold text-white">{transaction.item}</h4>
                </div>
                <div className="text-sm">
                    <span className="text-slate-400">Original Amount: </span>
                    <span className="text-white font-bold">₹{transaction.originalAmount.toLocaleString()}</span>
                </div>
            </div>
            
            {/* Progress bar */}
            <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Payment Progress</span>
                    <span className="text-blue-400 font-medium">{percentagePaid.toFixed(0)}% complete</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-purple-600" 
                        style={{ width: `${percentagePaid}%` }}
                    ></div>
                </div>
            </div>
            
            <div className="overflow-hidden rounded-xl border border-slate-700/50">
                <div className="grid grid-cols-3 p-3 text-xs text-slate-400 font-medium bg-slate-800/70">
                    <span>Date</span>
                    <span>Amount</span>
                    <span>Mode</span>
                </div>
                
                {transaction.payments.map((payment, index) => (
                    <div
                        key={index}
                        className="grid grid-cols-3 p-3 border-t border-slate-700/50 text-sm text-slate-300 hover:bg-slate-700/30 transition-all"
                    >
                        <span>{new Date(payment.date).toLocaleDateString()}</span>
                        <span className="font-medium">₹{payment.amount.toLocaleString()}</span>
                        <span>{payment.mode}</span>
                    </div>
                ))}
                
                <div className="grid grid-cols-3 p-3 border-t border-slate-700 text-sm font-bold text-white bg-slate-800/70">
                    <span>Total</span>
                    <span>₹{totalPaid.toLocaleString()}</span>
                    <span>{transaction.status}</span>
                </div>
            </div>
        </div>
    );
};