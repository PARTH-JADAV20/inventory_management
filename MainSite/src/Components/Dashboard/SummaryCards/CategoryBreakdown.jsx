import React from 'react';

const CategoryBreakdown = ({ categories }) => {
  return (
    <div className="mt-2 pt-3 px-4 border-t border-gray-700">
      {categories.map((category, index) => (
        <div key={index} className="flex justify-between mb-2 text-sm text-gray-300 hover:text-white transition-colors">
          <span className="text-gray-400">{category.name}</span>
          <span className="font-semibold">{category.value}</span>
        </div>
      ))}
    </div>
  );
};

export default CategoryBreakdown;