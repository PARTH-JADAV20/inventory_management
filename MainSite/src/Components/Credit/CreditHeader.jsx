import React from 'react';
import { FiSearch, FiPlus, FiCreditCard } from 'react-icons/fi';

export const CreditHeader = ({ search, setSearch, onNewCredit }) => {
    return (
        <div className="flex flex-col gap-6 mb-10">
            <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-8 rounded-3xl shadow-lg">
                <div className="flex justify-between items-center md:flex-col md:items-start md:gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-lg">
                            <FiCreditCard className="text-3xl text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-white tracking-tight">Credit Management</h1>
                            <p className="text-white/80 font-medium mt-1">Track and manage customer credits</p>
                        </div>
                    </div>
                    <button
                        className="flex items-center gap-2 py-3 px-6 bg-white text-orange-600 rounded-xl font-bold shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all duration-300 md:w-full md:justify-center"
                        onClick={onNewCredit}
                        aria-label="Add new credit"
                    >
                        <FiPlus className="text-lg" />
                        <span>Add Credit</span>
                    </button>
                </div>
            </div>

            <div className="bg-orange-100/90 dark:bg-orange-950 backdrop-blur-xl p-6 rounded-3xl shadow-lg">
                <div className="relative w-full max-w-lg mx-auto">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400 text-xl" />
                    <input
                        type="text"
                        placeholder="Search customers by name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full py-3 pl-12 pr-4 border border-orange-300 dark:border-orange-700 rounded-xl text-base bg-orange-50 dark:bg-orange-900 text-orange-800 dark:text-orange-100 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 focus:outline-none transition-all duration-300"
                        aria-label="Search customers"
                    />
                </div>
            </div>
        </div>


    );
};