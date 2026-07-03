import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Building2, Sparkles } from 'lucide-react';
import { dataService as db, resolveUrl } from '../services/dataService';

interface VenueOwnerJoinSectionProps {
  lang?: string;
  t?: (key: string) => string;
}

const VenueOwnerJoinSection: React.FC<VenueOwnerJoinSectionProps> = ({ lang = 'en', t }) => {
  const navigate = useNavigate();
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

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
        if (!error && data && data.length > 0) {
          // Use the latest uploaded venue photo
          setPhotoUrl(data[0].image_url);
        } else {
          // Premium default placeholder
          setPhotoUrl('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1200');
        }
      } catch (err) {
        console.error('Failed to fetch venue photos for homepage section:', err);
        setPhotoUrl('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1200');
      } finally {
        setLoading(false);
      }
    };

    fetchVenuePhotos();
  }, []);

  const handleNavigate = () => {
    navigate('/registration?role=owner');
  };

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="relative rounded-[3rem] overflow-hidden shadow-2xl bg-slate-900 border border-slate-800 text-white min-h-[420px] flex items-center group cursor-pointer"
          onClick={handleNavigate}
        >
          {/* Background Image with elegant overlays */}
          <div className="absolute inset-0 z-0">
            {photoUrl && (
              <img 
                src={resolveUrl(photoUrl)} 
                alt="Venue Owner Banner Background" 
                className="w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-1000 ease-out"
                referrerPolicy="no-referrer"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
          </div>

          {/* Banner Content */}
          <div className="relative z-10 max-w-3xl px-8 py-16 md:px-16 flex flex-col justify-center items-start text-left">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              viewport={{ once: true }}
              className="inline-flex items-center space-x-2 bg-orange-500/20 text-orange-400 border border-orange-500/30 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider mb-6"
            >
              <Building2 size={16} />
              <span>{translate('venueOwnerPartner', 'Venue Owner Partnership', 'वेन्यू मालिक साझेदारी')}</span>
              <Sparkles size={12} className="animate-pulse" />
            </motion.div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-6 leading-tight">
              {translate('joinAsOwner', 'Join Us as Venue Owner', 'वेन्यू मालिक के रूप में जुड़ें')}
            </h2>

            <p className="text-slate-300 text-base sm:text-lg mb-8 leading-relaxed font-medium">
              {translate(
                'venueOwnerBannerText',
                'Register your banquet hall, resort, or marriage garden with India\'s premier event planning platform. Grow your bookings, build your online presence, and manage your calendar effortlessly.',
                'भारत के अग्रणी इवेंट प्लानिंग प्लेटफॉर्म के साथ अपने बैंक्वेट हॉल, रिसॉर्ट या मैरिज गार्डन का पंजीकरण करें। अपनी बुकिंग बढ़ाएं, अपनी ऑनलाइन पहचान बनाएं और अपने कैलेंडर को आसानी से प्रबंधित करें।'
              )}
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm sm:text-base px-8 py-4 rounded-2xl shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation(); // Prevent duplicate trigger
                handleNavigate();
              }}
            >
              <span>{translate('registerAsOwnerBtn', 'Register as Venue Owner', 'वेन्यू मालिक के रूप में पंजीकरण करें')}</span>
              <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform duration-300" />
            </motion.button>
          </div>

          {/* Decorative Corner Element */}
          <div className="absolute right-8 bottom-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500 hidden md:block">
            <Building2 size={120} className="text-white" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default VenueOwnerJoinSection;
