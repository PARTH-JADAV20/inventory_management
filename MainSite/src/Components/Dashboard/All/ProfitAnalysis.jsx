import React from 'react';
import SectionHeader from '../UI/SectionHeader';

const ProfitAnalysis = () => {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 min-h-[22rem] shadow-lg hover:shadow-orange-500/20 hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300">
      <SectionHeader title="Profit Analysis" link="View All" />
      
      <div className="h-64 mt-6">
        <svg viewBox="0 0 300 150" width="100%" height="100%" className="overflow-visible">
          <line x1="10" y1="130" x2="290" y2="130" stroke="#3a3f4b" strokeWidth="1" />
          <line x1="10" y1="10" x2="10" y2="130" stroke="#3a3f4b" strokeWidth="1" />
          
          <text x="30" y="145" className="fill-gray-400 text-xs">Jan</text>
          <text x="70" y="145" className="fill-gray-400 text-xs">Feb</text>
          <text x="110" y="145" className="fill-gray-400 text-xs">Mar</text>
          <text x="150" y="145" className="fill-gray-400 text-xs">Apr</text>
          <text x="190" y="145" className="fill-gray-400 text-xs">May</text>
          <text x="230" y="145" className="fill-gray-400 text-xs">Jun</text>
          <text x="270" y="145" className="fill-gray-400 text-xs">Jul</text>
          
          <text x="5" y="130" className="fill-gray-400 text-xs">0</text>
          <text x="5" y="110" className="fill-gray-400 text-xs">20</text>
          <text x="5" y="90" className="fill-gray-400 text-xs">40</text>
          <text x="5" y="70" className="fill-gray-400 text-xs">60</text>
          <text x="5" y="50" className="fill-gray-400 text-xs">80</text>
          <text x="0" y="30" className="fill-gray-400 text-xs">100</text>
          
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#ff6b35', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#ff9f7a', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <polyline
            points="30,60 70,45 110,65 150,55 190,40 230,70 270,50"
            fill="none"
            stroke="url(#chartGradient)"
            strokeWidth="2"
            className="transition-all duration-500"
          />
          
          <circle cx="30" cy="60" r="4" fill="#ff6b35" className="hover:scale-125 transition-transform" />
          <circle cx="70" cy="45" r="4" fill="#ff6b35" className="hover:scale-125 transition-transform" />
          <circle cx="110" cy="65" r="4" fill="#ff6b35" className="hover:scale-125 transition-transform" />
          <circle cx="150" cy="55" r="4" fill="#ff6b35" className="hover:scale-125 transition-transform" />
          <circle cx="190" cy="40" r="4" fill="#ff6b35" className="hover:scale-125 transition-transform" />
          <circle cx="230" cy="70" r="4" fill="#ff6b35" className="hover:scale-125 transition-transform" />
          <circle cx="270" cy="50" r="4" fill="#ff6b35" className="hover:scale-125 transition-transform" />
        </svg>
      </div>
    </div>
  );
};

export default ProfitAnalysis;