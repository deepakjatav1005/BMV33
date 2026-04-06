import React from 'react';
import { CNZLogo } from './CNZLogo';

export const PoweredByCNZ: React.FC = () => {
  return (
    <div className="inline-flex items-center bg-[#0a0f1e] border border-gray-800/40 rounded-[2.5rem] px-10 py-8 shadow-2xl">
      <div className="flex items-center space-x-12">
        <CNZLogo size="xl" lightText={true} />
        
        <div className="flex flex-col items-start space-y-1">
          <span className="text-[#00d1ff] font-black text-sm tracking-[0.25em] uppercase">
            POWERED BY
          </span>
          <h3 className="text-white text-4xl font-bold tracking-tight">
            CHANCHAL NET ZONE
          </h3>
          <p className="text-gray-500 text-[12px] font-semibold uppercase tracking-[0.15em] opacity-80">
            © 2026 HEMLATA JATAV - ARCHITECT OWNER
          </p>
        </div>
      </div>
    </div>
  );
};
