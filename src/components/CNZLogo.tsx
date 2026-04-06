import React from 'react';

interface CNZLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  lightText?: boolean;
}

/**
 * High-fidelity SVG recreation of the CNZ logo.
 * Matches the uploaded design with 3D nodes and specific color palettes.
 */
export const CNZLogo: React.FC<CNZLogoProps> = ({ className = '', size = 'md', lightText = false }) => {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12',
    xl: 'h-20'
  };

  const textColor = lightText ? '#f8fafc' : '#1e293b';

  return (
    <div className={`inline-flex items-center ${sizeClasses[size]} ${className}`}>
      <svg viewBox="0 0 450 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-auto overflow-visible">
        <defs>
          <radialGradient id="blueNodeGrad" cx="30%" cy="30%" r="70%" fx="30%" fy="30%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#2563eb" />
          </radialGradient>
          <radialGradient id="skyNodeGrad" cx="30%" cy="30%" r="70%" fx="30%" fy="30%">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="100%" stopColor="#3b82f6" />
          </radialGradient>
          <radialGradient id="limeNodeGrad" cx="30%" cy="30%" r="70%" fx="30%" fy="30%">
            <stop offset="0%" stopColor="#bef264" />
            <stop offset="100%" stopColor="#84cc16" />
          </radialGradient>
          <filter id="3dShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feOffset dx="3" dy="3" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.2" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Network Cluster Above N and Z */}
        <g filter="url(#3dShadow)">
          <path d="M220 50 L280 20 L340 50 L280 80 Z" stroke="#64748b" strokeWidth="1" opacity="0.2" />
          <circle cx="220" cy="50" r="14" fill="url(#blueNodeGrad)" />
          <circle cx="280" cy="20" r="10" fill="url(#skyNodeGrad)" />
          <circle cx="340" cy="50" r="16" fill="url(#blueNodeGrad)" />
          <circle cx="280" cy="80" r="12" fill="url(#skyNodeGrad)" />
          <circle cx="310" cy="65" r="8" fill="url(#blueNodeGrad)" />
        </g>

        {/* CNZ Typography */}
        <g filter="url(#3dShadow)">
          <text x="10" y="155" fontFamily="sans-serif" fontSize="150" fontWeight="900" fill={textColor} letterSpacing="-8">C</text>
          <circle cx="105" cy="110" r="32" fill="url(#limeNodeGrad)" />
          <text x="160" y="155" fontFamily="sans-serif" fontSize="150" fontWeight="900" fill={textColor} letterSpacing="-8">N</text>
          <text x="310" y="155" fontFamily="sans-serif" fontSize="150" fontWeight="900" fill={textColor} letterSpacing="-8">Z</text>
        </g>
      </svg>
    </div>
  );
};
