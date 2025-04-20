import React from 'react';

const SectionHeader = ({ title, link }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold text-white border-l-4 border-orange-500 pl-3">{title}</h3>
      {link && (
        <a href="#" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
          {link}
        </a>
      )}
    </div>
  );
};

export default SectionHeader;