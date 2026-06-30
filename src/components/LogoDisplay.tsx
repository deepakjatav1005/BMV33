import React, { useState, useEffect } from 'react';
import { dataService as db, resolveUrl } from '../services/dataService';

export const LogoDisplay: React.FC = () => {
  const [logoUrl, setLogoUrl] = useState<string>('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=200');

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

  return (
    <div className="flex justify-center p-4">
      <div className="w-[180px] h-[180px] flex items-center justify-center rounded-full overflow-hidden">
        <img 
          src={resolveUrl(logoUrl) || '/logo.png'} 
          alt="BV Logo" 
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/logo.png';
          }}
        />
      </div>
    </div>
  );
};

export default LogoDisplay;
