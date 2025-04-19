import React, { useState } from 'react';
import { FiUser, FiDollarSign, FiCalendar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export const CustomerList = ({ customers, searchTerm, onSelectCustomer }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const customersPerPage = 4;
    
    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastCustomer = currentPage * customersPerPage;
    const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
    const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);
    const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-xl p-8 mb-10">
            <h2 className="text-2xl font-bold text-slate-200 mb-6">Customers ({filteredCustomers.length})</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                {currentCustomers.map(customer => (
                    <div
                        key={customer.id}
                        className="bg-gradient-to-br from-slate-800 to-slate-800/70 p-6 rounded-2xl shadow-md border border-slate-700/50 hover:border-blue-500/30 hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer group"
                        onClick={() => onSelectCustomer(customer)}
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-3 group-hover:scale-110 transition-transform duration-300">
                                <FiUser className="text-white text-2xl" />
                            </div>
                            <div>
                                <h3 className="text-lg text-slate-200 font-bold group-hover:text-white transition-colors">{customer.name}</h3>
                                <p className="text-slate-400 text-sm">{customer.phone}</p>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 text-slate-300">
                                    <FiDollarSign className="text-blue-500" />
                                    <span className="text-sm">Total Credit:</span>
                                </div>
                                <span className="font-bold text-lg text-slate-200">₹{customer.totalCredit.toLocaleString()}</span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 text-slate-300">
                                    <FiCalendar className="text-blue-500" />
                                    <span className="text-sm">Last Transaction:</span>
                                </div>
                                <span className="font-medium text-slate-300">{new Date(customer.lastTransaction).toLocaleDateString()}</span>
                            </div>
                            
                            <div className="flex items-center justify-between mt-4">
                                <span
                                    className={`px-4 py-1 rounded-full text-sm font-bold ${
                                        customer.status.toLowerCase() === 'pending'
                                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                            : 'bg-green-500/20 text-green-300 border border-green-500/30'
                                    }`}
                                >
                                    {customer.status}
                                </span>
                                
                                <button
                                    className="py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSelectCustomer(customer);
                                    }}
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {filteredCustomers.length === 0 && (
                <div className="text-center py-16">
                    <p className="text-slate-400 text-lg">No customers found matching your search</p>
                </div>
            )}
            
            {filteredCustomers.length > customersPerPage && (
                <div className="flex justify-center gap-3 mt-8">
                    <button
                        className="p-2 bg-slate-800 text-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-700"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        aria-label="Previous page"
                    >
                        <FiChevronLeft className="text-lg" />
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            className={`w-10 h-10 rounded-lg text-sm font-semibold flex items-center justify-center ${
                                currentPage === page
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                            onClick={() => handlePageChange(page)}
                            aria-label={`Page ${page}`}
                        >
                            {page}
                        </button>
                    ))}
                    
                    <button
                        className="p-2 bg-slate-800 text-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-700"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        aria-label="Next page"
                    >
                        <FiChevronRight className="text-lg" />
                    </button>
                </div>
            )}
        </div>
    );
};