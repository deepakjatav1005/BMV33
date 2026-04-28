import React from 'react';

interface AppLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({ className = '', size = 'md', showText = true }) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-24',
    xl: 'h-32'
  };

  return (
    <div className={`inline-flex items-center ${className}`}>
      <img 
        src="/logo.png" 
        alt="Best Vanue Option Logo" 
        className={`${sizeClasses[size]} w-auto object-contain transition-transform hover:scale-105 duration-300`}
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
