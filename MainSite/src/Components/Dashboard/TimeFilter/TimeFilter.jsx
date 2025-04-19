import React from 'react';

const TimeFilter = ({ activeFilter, setActiveFilter }) => {
  const filters = ['Today', 'This Week', 'This Month'];

  return (
    <div className="flex gap-2 flex-wrap">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => setActiveFilter(filter)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
            ${
              activeFilter === filter
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
            }
          `}
        >
          {filter}
        </button>
      ))}
    </div>
  );
};

export default TimeFilter;