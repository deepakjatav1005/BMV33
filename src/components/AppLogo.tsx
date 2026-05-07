import React, { useState, useEffect } from 'react';
import { dataService as db, resolveUrl } from '../services/dataService';

// Note: If you have a file at src/assets/logo.png, you can uncomment the next line
// import logo from '../assets/logo.png';

interface AppLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({ className = '', size = 'md', showText = true }) => {
  const [logoUrl, setLogoUrl] = useState<string>('/logo.png');

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const { data } = await db.from('admin_settings').select('value').eq('key', 'app_logo_url').maybeSingle();
        if (data?.value) {
          setLogoUrl(data.value);
        }
      } catch (err) {
        console.error('Error fetching logo:', err);
      }
    };
    fetchLogo();

    const handleUpdate = (e: any) => {
      if (e.detail) setLogoUrl(e.detail);
    };

    window.addEventListener('app_logo_updated', handleUpdate);
    return () => window.removeEventListener('app_logo_updated', handleUpdate);
  }, []);

  const sizeClasses = {
    xs: 'h-6',
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-24',
    xl: 'h-32'
  };

  return (
    <div className={`inline-flex items-center space-x-3 ${className}`}>
      <div className={`${sizeClasses[size]} aspect-square rounded-full overflow-hidden flex items-center justify-center bg-white shadow-sm hover:shadow-md transition-shadow duration-300`}>
        <img 
          src={resolveUrl(logoUrl) || '/logo.png'} 
          alt="Best Vanue Option Logo" 
          className="w-full h-full object-contain p-1 transition-transform hover:scale-105 duration-500"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/logo.png';
          }}
        />
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="text-2xl font-black font-sans tracking-tight">
            <span className="text-blue-600">BEST VANUE</span> <span className="text-red-500">OPTION</span>
          </span>
          <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-gray-500 mt-1">
            VANUE & EVENT & SERVICE PROVIDERS
          </span>
        </div>
      )}
    </div>
  );
};
