import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Building2, Sparkles } from 'lucide-react';
import { dataService as db, resolveUrl } from '../services/dataService';

interface VenueOwnerJoinSectionProps {
  lang?: string;
  t?: (key: string) => string;
}

interface CategoryConfig {
  id: string;
  labelEn: string;
  labelHi: string;
  defaultImg: string;
}

const CATEGORIES: CategoryConfig[] = [
  { 
    id: 'Marriage Garden', 
    labelEn: 'Marriage Garden', 
    labelHi: 'मैरिज गार्डन', 
    defaultImg: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1200' 
  },
  { 
    id: 'Marriage Hall', 
    labelEn: 'Marriage Hall', 
    labelHi: 'मैरिज हॉल', 
    defaultImg: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1200' 
  },
  { 
    id: 'Hotel', 
    labelEn: 'Hotel', 
    labelHi: 'होटल', 
    defaultImg: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200' 
  },
  { 
    id: 'Resort', 
    labelEn: 'Resort', 
    labelHi: 'रिसॉर्ट', 
    defaultImg: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1200' 
  },
  { 
    id: 'Community Hall', 
    labelEn: 'Community Hall', 
    labelHi: 'सामुदायिक भवन', 
    defaultImg: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=1200' 
  },
  { 
    id: 'Restaurent', 
    labelEn: 'Restaurent', 
    labelHi: 'रेस्टोरेंट', 
    defaultImg: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200' 
  },
  { 
    id: 'Restaurant', 
    labelEn: 'Restaurant', 
    labelHi: 'रेस्टोरेंट', 
    defaultImg: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200' 
  },
  { 
    id: 'Benquet Hall', 
    labelEn: 'Benquet Hall', 
    labelHi: 'बैंक्वेट हॉल', 
    defaultImg: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=1200' 
  },
  { 
    id: 'Banquet Hall', 
    labelEn: 'Banquet Hall', 
    labelHi: 'बैंक्वेट हॉल', 
    defaultImg: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=1200' 
  }
];

const VenueOwnerJoinSection: React.FC<VenueOwnerJoinSectionProps> = ({ lang = 'en', t }) => {
  const navigate = useNavigate();
  const [photoMap, setPhotoMap] = useState<Record<string, string>>({});

  // Translate helper if prop 't' is not provided
  const translate = (key: string, englishFallback: string, hindiFallback: string) => {
    if (t) {
      const translated = t(key);
      if (translated && translated !== key) return translated;
    }
    return lang === 'hi' ? hindiFallback : englishFallback;
  };

  useEffect(() => {
    const fetchVenuePhotos = async () => {
      try {
        const { data, error } = await db.from('venue_photos').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          // Build a map of category -> latest image_url
          const map: Record<string, string> = {};
          // Since it's ordered descending by created_at, the first one we find for a category will be the latest
          data.forEach((p: any) => {
            const vType = p.venue_type || 'Marriage Garden';
            if (!map[vType]) {
              map[vType] = p.image_url;
            }
          });
          setPhotoMap(map);
        }
      } catch (err) {
        console.error('Failed to fetch category wise venue photos:', err);
      }
    };

    fetchVenuePhotos();

    // Set up realtime channel to keep photos updated
    const channel = db.channel('venue_photos_home_marquee')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'venue_photos' }, fetchVenuePhotos)
      .subscribe();

    return () => {
      db.removeChannel(channel);
    };
  }, []);

  // Build the list of items for the marquee
  const items = CATEGORIES.map((cat) => {
    const imageUrl = photoMap[cat.id] || cat.defaultImg;
    const label = lang === 'hi' ? cat.labelHi : cat.labelEn;
    return {
      id: cat.id,
      rawType: cat.id,
      venueType: label,
      imageUrl: imageUrl
    };
  });

  // Duplicate items to make the marquee flow smoothly (at least 15 items)
  const displayItems = [...items, ...items, ...items];

  return (
    <div className="bg-white py-16 overflow-hidden border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <h2 className="text-3xl md:text-5xl font-black text-gray-900 flex items-center">
          <Building2 className="mr-4 text-orange-600 animate-pulse" size={32} />
          {translate('joinAsOwnerTitle', 'JOIN US AS VENUE OWNER', 'वेन्यू मालिक के रूप में जुड़ें')}
        </h2>
      </div>
      <div className="relative">
        <div className="flex animate-marquee-ltr space-x-8 py-10 w-max hover:[animation-play-state:paused]">
          {displayItems.map((p, idx) => (
            <motion.div 
              key={`${p.id}-${idx}`} 
              whileHover={{ scale: 1.05, rotateY: 15 }}
              onClick={() => navigate(`/registration?role=owner&type=${encodeURIComponent(p.rawType)}`)}
              className="flex-shrink-0 w-64 h-80 relative rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-2xl"
            >
              <div className="w-full h-full bg-gray-50 flex items-center justify-center p-2">
                <img 
                  src={resolveUrl(p.imageUrl)} 
                  alt={p.venueType} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-5 bg-white/90 backdrop-blur-md border-t border-gray-100/50 flex items-center justify-center shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em] text-center line-clamp-1">{p.venueType}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VenueOwnerJoinSection;
