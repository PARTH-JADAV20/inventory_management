import React, { useState } from 'react';
import { CustomerList } from '../Components/Credit/CustomerList';
import { CustomerDetailModal } from '../Components/Credit/CustomerDetailModal';
import { NewCreditModal } from '../Components/Credit/NewCreditModal';
import { CreditHeader } from '../Components/Credit/CreditHeader';
import './CreditSales.css';

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
            status: 'Pending'
        },
        {
            id: 2,
            customerId: 1,
            date: '2025-04-05',
            item: 'Mouse',
            amount: 500,
            status: 'Cleared'
        },
        {
            id: 3,
            customerId: 2,
            date: '2025-04-15',
            item: 'Keyboard',
            amount: 2500,
            status: 'Cleared'
        }
    ]);

    const handleNewCredit = (creditData) => {
        const newCustomer = !creditData.existingCustomerId;
        if (newCustomer) {
            const newCustomerId = customers.length + 1;
            setCustomers([...customers, {
                id: newCustomerId,
                name: creditData.customerName,
                phone: creditData.phone,
                totalCredit: parseFloat(creditData.amount),
                lastTransaction: creditData.date,
                status: 'Pending'
            }]);
            setTransactions([...transactions, {
                id: transactions.length + 1,
                customerId: newCustomerId,
                date: creditData.date,
                item: creditData.item,
                amount: parseFloat(creditData.amount),
                status: 'Pending'
            }]);
        } else {
            const customerId = parseInt(creditData.existingCustomerId);
            setCustomers(customers.map(c =>
                c.id === customerId
                    ? {
                        ...c,
                        totalCredit: c.totalCredit + parseFloat(creditData.amount),
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
                amount: parseFloat(creditData.amount),
                status: 'Pending'
            }]);
        }
        setShowNewCreditModal(false);
    };

    const handlePaymentUpdate = (transactionId, paymentMode) => {
        setTransactions(transactions.map(t =>
            t.id === transactionId
                ? { ...t, status: 'Cleared' }
                : t
        ));
        const customerId = transactions.find(t => t.id === transactionId).customerId;
        const pendingTransactions = transactions.filter(t => t.customerId === customerId && t.status === 'Pending');
        setCustomers(customers.map(c =>
            c.id === customerId
                ? {
                    ...c,
                    status: pendingTransactions.length === 1 ? 'Cleared' : 'Pending',
                    totalCredit: pendingTransactions.length === 1
                        ? 0
                        : pendingTransactions.reduce((sum, t) => sum + t.amount, 0)
                }
                : c
        ));
        console.log(`Payment cleared for transaction ${transactionId} via ${paymentMode}`);
    };

    return (
        <div className="credit-sales-container">
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