import React, { useState, useEffect } from 'react';
import { dataService as db, resolveUrl } from '../services/dataService';

// Note: If you have a file at src/assets/logo.png, you can uncomment the next line
// import logo from '../assets/logo.png';

interface AppLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  circleBg?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({ className = '', size = 'md', showText = true, circleBg = true }) => {
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
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-24 w-24',
    xl: 'h-32 w-32'
  };

  return (
    <div className={`inline-flex items-center space-x-3 ${className}`}>
      <div className={`${sizeClasses[size]} aspect-square flex-shrink-0 flex items-center justify-center group rounded-full bg-white p-1 border-2 border-orange-500 shadow-md overflow-hidden`}>
        <img 
          src={resolveUrl(logoUrl) || '/logo.png'} 
          alt="Best Venue Option Logo" 
          className="w-full h-full object-contain p-0.5 rounded-full transition-all duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/logo.png';
          }}
        />
      </div>
      {showText && (
        <div className="flex flex-col justify-center py-1">
          <div className="flex items-center space-x-1 mb-0.5">
            <span className="text-xl md:text-2xl font-black tracking-tighter leading-none text-blue-600">BEST VENUE</span>
            <span className="text-xl md:text-2xl font-black tracking-tighter leading-none text-red-500">OPTION</span>
          </div>
          <p className="text-[7px] md:text-[9px] font-black tracking-widest uppercase text-gray-400 leading-none">
            VENUE & EVENT & SERVICE PROVIDERS
          </p>
        </div>
      )}
    </div>
  );
};
