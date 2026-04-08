import React from 'react';
import { CNZLogo } from './CNZLogo';

export const PoweredByCNZ: React.FC = () => {
  return (
    <div className="inline-flex items-center bg-[#0a0f1e] border border-gray-800/40 rounded-[2.5rem] px-6 md:px-10 py-6 md:py-8 shadow-2xl max-w-full overflow-hidden">
      <div className="flex flex-col md:flex-row items-center md:items-center space-y-6 md:space-y-0 md:space-x-12">
        <CNZLogo size="xl" lightText={true} />
        
        <div className="flex flex-col items-center md:items-start space-y-1 text-center md:text-left">
          <span className="text-[#00d1ff] font-black text-xs md:text-sm tracking-[0.25em] uppercase">
            POWERED BY
          </span>
          <h3 className="text-white text-2xl md:text-4xl font-bold tracking-tight">
            CHANCHAL NET ZONE
          </h3>
          <p className="text-gray-500 text-[10px] md:text-[12px] font-semibold uppercase tracking-[0.15em] opacity-80">
            © 2026 HEMLATA JATAV - ARCHITECT OWNER
          </p>
        </div>
      </div>
    </div>
  );
};
