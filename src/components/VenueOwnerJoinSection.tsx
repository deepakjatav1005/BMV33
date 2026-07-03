import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Building2, Sparkles, Tent } from 'lucide-react';
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
    id: 'Banquet Hall', 
    labelEn: 'Banquet Hall', 
    labelHi: 'बैंक्वेट हॉल', 
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
    labelHi: 'कम्युनिटी हॉल', 
    defaultImg: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=1200' 
  }
];

const VenueOwnerJoinSection: React.FC<VenueOwnerJoinSectionProps> = ({ lang = 'en', t }) => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>('Marriage Garden');
  const [photoMap, setPhotoMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [userInteracted, setUserInteracted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
      } finally {
        setLoading(false);
      }
    };

    fetchVenuePhotos();

    // Set up realtime channel to keep photos updated
    const channel = db.channel('venue_photos_home')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'venue_photos' }, fetchVenuePhotos)
      .subscribe();

    return () => {
      db.removeChannel(channel);
    };
  }, []);

  // Auto rotation timer
  useEffect(() => {
    if (userInteracted) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setActiveCategory((prev) => {
        const currentIndex = CATEGORIES.findIndex(c => c.id === prev);
        const nextIndex = (currentIndex + 1) % CATEGORIES.length;
        return CATEGORIES[nextIndex].id;
      });
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [userInteracted]);

  const handleNavigate = () => {
    navigate(`/registration?role=owner&type=${encodeURIComponent(activeCategory)}`);
  };

  const handleCategorySelect = (id: string) => {
    setUserInteracted(true);
    setActiveCategory(id);
  };

  // Resolve active image url (uploaded image or stock default fallback)
  const currentCategoryConfig = CATEGORIES.find(c => c.id === activeCategory) || CATEGORIES[0];
  const activeImageUrl = photoMap[activeCategory] || currentCategoryConfig.defaultImg;

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="relative rounded-[3rem] overflow-hidden shadow-2xl bg-slate-900 border border-slate-800 text-white min-h-[520px] flex flex-col justify-between group"
        >
          {/* Background Image with smooth cross-fade */}
          <div className="absolute inset-0 z-0">
            <AnimatePresence mode="wait">
              <motion.img 
                key={activeCategory + '_' + activeImageUrl}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 0.35, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                src={resolveUrl(activeImageUrl)} 
                alt={`${activeCategory} Banner Background`} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/85 to-slate-900/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
          </div>

          {/* Banner Content Container */}
          <div className="relative z-10 w-full flex flex-col md:flex-row items-stretch justify-between gap-12 p-8 sm:p-12 md:p-16">
            
            {/* Left side: Information and Action */}
            <div className="flex-1 flex flex-col justify-center items-start text-left max-w-2xl">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
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
                  'Register your banquet hall, resort, marriage garden, or community hall with India\'s premier event planning platform. Grow your bookings, build your online presence, and manage your calendar effortlessly.',
                  'भारत के अग्रणी इवेंट प्लानिंग प्लेटफॉर्म के साथ अपने बैंक्वेट हॉल, रिसॉर्ट, मैरिज गार्डन या कम्युनिटी हॉल का पंजीकरण करें। अपनी बुकिंग बढ़ाएं, अपनी ऑनलाइन पहचान बनाएं और अपने कैलेंडर को आसानी से प्रबंधित करें।'
                )}
              </p>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleNavigate}
                className="inline-flex items-center space-x-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm sm:text-base px-8 py-4 rounded-2xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/45 transition-all duration-300"
              >
                <span>{translate('registerAsOwnerBtn', 'Register as Venue Owner', 'वेन्यू मालिक के रूप में पंजीकरण करें')}</span>
                <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform duration-300" />
              </motion.button>
            </div>

            {/* Right side: Category selection controls */}
            <div className="flex-1 flex flex-col justify-center items-start md:items-end gap-4 min-w-[280px]">
              <div className="w-full max-w-sm bg-slate-950/60 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
                <div className="text-left">
                  <span className="text-xs font-black tracking-wider text-orange-400 uppercase">
                    {translate('selectCategoryPreview', 'Interactive Preview', 'इंटरैक्टिव पूर्वावलोकन')}
                  </span>
                  <h4 className="text-sm font-bold text-slate-300">
                    {translate('clickCategoryToSee', 'Select Category Venue', 'श्रेणी चुनें')}
                  </h4>
                </div>

                <div className="flex flex-col gap-2.5">
                  {CATEGORIES.map((cat) => {
                    const isSelected = activeCategory === cat.id;
                    const hasCustomPhoto = !!photoMap[cat.id];
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleCategorySelect(cat.id)}
                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border text-sm font-bold transition-all duration-300 text-left ${
                          isSelected
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 border-transparent text-white shadow-md shadow-orange-500/10'
                            : 'bg-slate-900/50 hover:bg-slate-800/80 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Tent size={16} className={isSelected ? 'text-white' : 'text-slate-500'} />
                          <span>{lang === 'hi' ? cat.labelHi : cat.labelEn}</span>
                        </div>
                        {hasCustomPhoto && (
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            isSelected ? 'bg-white text-orange-600' : 'bg-slate-800 text-orange-400 border border-orange-500/20'
                          }`}>
                            {translate('customTag', 'Live Upload', 'लाइव अपलोड')}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

          {/* Bottom decorative bar */}
          <div className="bg-slate-950/30 backdrop-blur-sm border-t border-slate-800/40 px-8 py-4 flex flex-wrap justify-between items-center text-xs text-slate-400 gap-4 z-10">
            <span className="font-semibold flex items-center gap-1.5 text-slate-300">
              <Sparkles size={14} className="text-amber-400" />
              {translate('exclusiveBenefits', 'Verified partner benefits: Multi-city search presence, integrated booking engine, zero commission bookings.', 'सत्यापित साथी लाभ: बहु-शहर खोज उपस्थिति, एकीकृत बुकिंग इंजन, शून्य कमीशन बुकिंग।')}
            </span>
            <span className="font-mono text-[10px]">
              Active Category: <strong className="text-orange-400">{activeCategory}</strong>
            </span>
          </div>

        </motion.div>
      </div>
    </section>
  );
};

export default VenueOwnerJoinSection;
