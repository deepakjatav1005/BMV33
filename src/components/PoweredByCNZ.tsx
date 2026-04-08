import React from 'react';
import { CNZLogo } from './CNZLogo';

export const PoweredByCNZ: React.FC = () => {
  return (
    <div className="inline-flex items-center bg-[#0a0f1e] border border-gray-800/40 rounded-2xl px-4 py-2 shadow-xl">
      <div className="flex items-center space-x-3">
        <CNZLogo size="sm" lightText={true} />
        
        <div className="flex flex-col items-start text-left">
          <span className="text-[#00d1ff] font-black text-[8px] tracking-[0.2em] uppercase leading-none mb-0.5">
            POWERED BY
          </span>
          <h3 className="text-white text-xs font-bold tracking-tight leading-none mb-0.5">
            CHANCHAL NET ZONE
          </h3>
          <p className="text-gray-500 text-[7px] font-semibold uppercase tracking-[0.1em] opacity-80 leading-none">
            © 2026 HEMLATA JATAV
          </p>
        </div>
      </div>
    </div>
  );
};
