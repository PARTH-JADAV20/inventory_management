import React, { useState } from 'react';
import { CustomerList } from '../Components/Credit/CustomerList';
import { CustomerDetailModal } from '../Components/Credit/CustomerDetailModal';
import { NewCreditModal } from '../Components/Credit/NewCreditModal';
import { CreditHeader } from '../Components/Credit/CreditHeader';

function CreditSales() {
    const [search, setSearch] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [showNewCreditModal, setShowNewCreditModal] = useState(false);
    const [customers, setCustomers] = useState([
        {
            id: 1,
            name: 'John Doe',
            phone: '+91 98765 43210',
            totalCredit: 1500,
            lastTransaction: '2025-04-10',
            status: 'Pending'
        },
        {
            id: 2,
            name: 'Jane Smith',
            phone: '+91 98765 43211',
            totalCredit: 2500,
            lastTransaction: '2025-04-15',
            status: 'Cleared'
        }
    ]);
    const [transactions, setTransactions] = useState([
        {
            id: 1,
            customerId: 1,
            date: '2025-04-10',
            item: 'Laptop',
            amount: 1000,
            status: 'Pending',
            originalAmount: 1000,
            payments: []
        },
        {
            id: 2,
            customerId: 1,
            date: '2025-04-05',
            item: 'Mouse',
            amount: 500,
            status: 'Cleared',
            originalAmount: 500,
            payments: [
                { amount: 500, mode: 'Cash', date: '2025-04-05' }
            ]
        },
        {
            id: 3,
            customerId: 2,
            date: '2025-04-15',
            item: 'Keyboard',
            amount: 2500,
            status: 'Cleared',
            originalAmount: 2500,
            payments: [
                { amount: 2500, mode: 'Online', date: '2025-04-15' }
            ]
        }
    ]);

    const handleNewCredit = (creditData) => {
        const newCustomer = !creditData.existingCustomerId;
        const amount = parseFloat(creditData.amount);
        if (newCustomer) {
            const newCustomerId = customers.length + 1;
            setCustomers([...customers, {
                id: newCustomerId,
                name: creditData.customerName,
                phone: creditData.phone,
                totalCredit: amount,
                lastTransaction: creditData.date,
                status: 'Pending'
            }]);
            setTransactions([...transactions, {
                id: transactions.length + 1,
                customerId: newCustomerId,
                date: creditData.date,
                item: creditData.item,
                amount: amount,
                status: 'Pending',
                originalAmount: amount,
                payments: []
            }]);
        } else {
            const customerId = parseInt(creditData.existingCustomerId);
            setCustomers(customers.map(c =>
                c.id === customerId
                    ? {
                        ...c,
                        totalCredit: c.totalCredit + amount,
                        lastTransaction: creditData.date,
                        status: 'Pending'
                    }
                    : c
            ));
            setTransactions([...transactions, {
                id: transactions.length + 1,
                customerId: customerId,
                date: creditData.date,
                item: creditData.item,
                amount: amount,
                status: 'Pending',
                originalAmount: amount,
                payments: []
            }]);
        }
        setShowNewCreditModal(false);
    };

    const handlePaymentUpdate = (transactionId, paymentMode, paymentAmount) => {
        const transaction = transactions.find(t => t.id === transactionId);
        const customerId = transaction.customerId;
        const payment = {
            amount: parseFloat(paymentAmount),
            mode: paymentMode,
            date: new Date().toISOString().split('T')[0]
        };

        setTransactions(transactions.map(t =>
            t.id === transactionId
                ? {
                    ...t,
                    amount: t.amount - payment.amount,
                    payments: [...t.payments, payment],
                    status: (t.amount - payment.amount) <= 0 ? 'Cleared' : 'Pending'
                }
                : t
        ));

        const customerTransactions = transactions.filter(t => t.customerId === customerId);
        const pendingTransactions = customerTransactions.filter(t => t.status === 'Pending' && t.id !== transactionId);
        const updatedTransaction = customerTransactions.find(t => t.id === transactionId);
        if (updatedTransaction && updatedTransaction.amount > payment.amount) {
            pendingTransactions.push(updatedTransaction);
        }

        setCustomers(customers.map(c =>
            c.id === customerId
                ? {
                    ...c,
                    status: pendingTransactions.length === 0 ? 'Cleared' : 'Pending',
                    totalCredit: pendingTransactions.reduce((sum, t) => sum + (t.id === transactionId ? (t.amount - payment.amount) : t.amount), 0)
                }
                : c
        ));

        console.log(`Payment of ₹${paymentAmount} cleared for transaction ${transactionId} via ${paymentMode}`);
    };

    return (
        <div className="max-w-[1920px] mx-auto mt-20 p-12 bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen transition-all duration-500 xl:p-8 md:p-6">
            <CreditHeader
                search={search}
                setSearch={setSearch}
                onNewCredit={() => setShowNewCreditModal(true)}
            />
            <CustomerList
                customers={customers}
                searchTerm={search}
                onSelectCustomer={setSelectedCustomer}
            />
            {selectedCustomer && (
                <CustomerDetailModal
                    customer={selectedCustomer}
                    transactions={transactions.filter(t => t.customerId === selectedCustomer.id)}
                    onClose={() => setSelectedCustomer(null)}
                    onPaymentUpdate={handlePaymentUpdate}
                />
            )}
            {showNewCreditModal && (
                <NewCreditModal
                    onClose={() => setShowNewCreditModal(false)}
                    onSubmit={handleNewCredit}
                    existingCustomers={customers}
                />
            )}
        </div>
    );
}

export default CreditSales;