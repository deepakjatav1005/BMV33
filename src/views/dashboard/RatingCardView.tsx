import React, { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';
import { db } from '../../lib/supabase';
import { UserProfile, Venue, ServiceProvider } from '../../types';
import { Download, QrCode } from 'lucide-react';

interface RatingCardViewProps {
  profile: UserProfile | null;
  venues: Venue[];
  services: ServiceProvider[];
}

const RatingCardView: React.FC<RatingCardViewProps> = ({ profile, venues, services }) => {
  const [selectedId, setSelectedId] = useState('');
  const [activeType, setActiveType] = useState<'venue' | 'service' | 'app'>(profile?.role === 'owner' ? 'venue' : 'service');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [appLogoUrl, setAppLogoUrl] = useState<string>('/logo.png');
  const [appName, setAppName] = useState<string>('BEST VENUE OPTION');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [appTagline, setAppTagline] = useState<string>('VENUE & EVENT & SERVICE PROVIDERS');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data: logoData } = await db.from('admin_settings').select('value').eq('key', 'app_logo_url').maybeSingle();
        if (logoData?.value) setAppLogoUrl(logoData.value);

        const { data: nameData } = await db.from('admin_settings').select('value').eq('key', 'app_name').maybeSingle();
        if (nameData?.value) setAppName(nameData.value);

        const { data: taglineData } = await db.from('admin_settings').select('value').eq('key', 'app_tagline').maybeSingle();
        if (taglineData?.value) setAppTagline(taglineData.value);
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const items = useMemo(() => {
    if (activeType === 'venue') return venues;
    if (activeType === 'service') return services;
    return [];
  }, [activeType, venues, services]);

  useEffect(() => {
    if (items.length > 0 && !selectedId && activeType !== 'app') {
      setSelectedId(items[0].id || '');
    }
    if (activeType === 'app') {
      setSelectedId('app-rating');
    }
  }, [items, selectedId, activeType]);

  const selectedItem = useMemo(() => activeType === 'app' ? { name: appName } : items.find(i => i.id === selectedId), [items, selectedId, activeType, appName]);

  useEffect(() => {
    if (selectedId) {
      let url = '';
      if (activeType === 'app') {
        url = `${window.location.origin}/#/app-rating`;
      } else {
        url = `${window.location.origin}/#${activeType === 'venue' ? '/venues/' : '/services/'}${selectedId}?review=true#reviews`;
      }
      
      QRCode.toDataURL(url, { 
        width: 600, 
        margin: 2,
        color: {
          dark: '#ea580c', // orange-600
          light: '#ffffff'
        }
      }, (err, url) => {
        if (!err) setQrDataUrl(url);
      });
    }
  }, [selectedId, activeType]);

  const downloadCard = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [76.2, 152.4] // 3 x 6 inches
    });

    const pageWidth = 76.2;
    const pageHeight = 152.4;

    // Design
    doc.setFillColor(255, 247, 237); // orange-50
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    doc.setDrawColor(234, 88, 12); // orange-600
    doc.setLineWidth(1.5);
    doc.rect(5, 5, pageWidth - 10, pageHeight - 10);

    // Header: Business Info
    const name = selectedItem?.name || profile?.displayName || "BUSINESS NAME";
    const itemAsAny = selectedItem as any;
    const address = itemAsAny?.address || (selectedItem ? [itemAsAny.block, itemAsAny.district, itemAsAny.state].filter(Boolean).join(", ") : "") || profile?.block + ", " + profile?.district || "Address not specified";
    const typeLabel = activeType === 'venue' ? (selectedItem as any)?.venueType : (selectedItem as any)?.serviceType;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    const finalName = (name || "BUSINESS NAME").toUpperCase();
    doc.text(finalName, pageWidth / 2, 20, { align: 'center', maxWidth: pageWidth - 20 });
    
    if (typeLabel) {
      doc.setFontSize(9);
      doc.setTextColor(234, 88, 12);
      const finalType = String(typeLabel).toUpperCase();
      doc.text(finalType, pageWidth / 2, 26, { align: 'center' });
    }

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(address, pageWidth / 2, typeLabel ? 32 : 28, { align: 'center', maxWidth: pageWidth - 20 });

    // Middle: QR Section
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(234, 88, 12);
    doc.text("SCAN TO RATE & REVIEW", pageWidth / 2, 48, { align: 'center' });

    if (qrDataUrl) {
      doc.addImage(qrDataUrl, 'PNG', (pageWidth - 50) / 2, 55, 50, 50);
    }

    // Footer: App Branding
    const startY = pageHeight - 23;
    
    // Split name for colors
    const splitName = (nameToSplit: string) => {
      if (!nameToSplit) return { part1: '', part2: '' };
      const n = String(nameToSplit);
      if (n.toUpperCase() === 'BEST VANUE OPTION') return { part1: 'BEST VANUE', part2: 'OPTION' };
      const words = n.split(' ');
      if (words.length > 1) {
        const p1 = words.slice(0, -1).join(' ');
        const p2 = words[words.length - 1];
        return { part1: p1, part2: p2 };
      }
      return { part1: n, part2: '' };
    };

    const { part1, part2 } = splitName(appName);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "black");
    doc.setTextColor(0, 0, 0);
    const p1Width = doc.getTextWidth(part1 + " ");
    const p2Width = doc.getTextWidth(part2);
    const totalW = p1Width + p2Width;
    const startX = (pageWidth - totalW) / 2;
    
    doc.text(part1, startX, startY);
    doc.setTextColor(234, 88, 12);
    doc.text(part2, startX + p1Width, startY);

    doc.setFontSize(6);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(150, 150, 150);
    doc.text("BEST VANUE OPTION • VENUE & EVENT SERVICE PROVIDERS", pageWidth / 2, startY + 6, { align: 'center' });

    doc.save(`RATING_CARD_${finalName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Rating Accept Card</h2>
          <p className="text-gray-500 font-medium">Generate a professional QR card for customers to rate your business</p>
        </div>
        <div className="flex bg-gray-100 p-1.5 rounded-2xl w-full md:w-auto">
          {profile?.role === 'owner' && (
            <button 
              onClick={() => { setActiveType('venue'); setSelectedId(''); }}
              className={`px-6 py-2 rounded-xl text-sm font-bold uppercase tracking-tight transition-all ${activeType === 'venue' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Venues
            </button>
          )}
          {profile?.role === 'provider' && (
            <button 
              onClick={() => { setActiveType('service'); setSelectedId(''); }}
              className={`px-6 py-2 rounded-xl text-sm font-bold uppercase tracking-tight transition-all ${activeType === 'service' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Services
            </button>
          )}
          <button 
            onClick={() => { setActiveType('app'); setSelectedId('app-rating'); }}
            className={`px-6 py-2 rounded-xl text-sm font-bold uppercase tracking-tight transition-all ${activeType === 'app' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            BVO App
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Settings Area */}
        <div className="bg-orange-50/50 p-8 rounded-[2.5rem] border border-orange-100 space-y-8">
          {activeType !== 'app' && (
            <div className="space-y-4">
              <label className="block text-xs font-black text-orange-600 uppercase tracking-widest">Select {activeType === 'venue' ? 'Venue' : 'Service'}</label>
              <div className="grid grid-cols-1 gap-3">
                {items.map(item => (
                  <button 
                    key={item.id}
                    onClick={() => setSelectedId(item.id || '')}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all font-bold ${selectedId === item.id ? 'bg-white border-orange-500 text-orange-600 shadow-lg' : 'bg-white/50 border-white hover:border-orange-200 text-gray-500'}`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-6 bg-white rounded-3xl border border-orange-100 space-y-6">
            <h4 className="font-bold text-gray-900 flex items-center">
              <QrCode size={18} className="mr-2 text-orange-600" />
              Card Preview
            </h4>
            <div className="aspect-[1/2] max-w-[200px] mx-auto bg-orange-50 rounded-2xl border border-orange-200 p-4 shadow-xl flex flex-col items-center justify-between py-8">
              <div className="text-center">
                <div className="text-[10px] font-black uppercase text-gray-900 line-clamp-2 leading-none mb-1">
                  {selectedItem?.name || "Select Item"}
                </div>
                <div className="text-[6px] font-bold text-orange-600 uppercase mb-4">
                  {activeType === 'venue' ? (selectedItem as any)?.venueType : (selectedItem as any)?.serviceType}
                </div>
              </div>

              {qrDataUrl ? (
                <div className="w-32 h-32 bg-white p-1 rounded-xl shadow-sm">
                  <img src={qrDataUrl} alt="QR Preview" className="w-full h-full" />
                </div>
              ) : (
                <div className="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center text-gray-300">
                  <QrCode size={40} />
                </div>
              )}

              <div className="text-center">
                <div className="text-[8px] font-black mb-0.5">
                  <span className="text-gray-900">BEST VANUE</span> <span className="text-orange-600">OPTION</span>
                </div>
                <div className="text-[4px] font-bold text-gray-400">VENUE & EVENT SERVICE PROVIDERS</div>
              </div>
            </div>
          </div>

          <button 
            onClick={downloadCard}
            disabled={!selectedId}
            className="w-full bg-orange-600 text-white py-5 rounded-[1.5rem] font-black text-lg flex items-center justify-center space-x-3 shadow-xl shadow-orange-200 hover:bg-orange-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={24} />
            <span className="uppercase tracking-tight">Download Professional Card</span>
          </button>
        </div>

        {/* Benefits Area */}
        <div className="space-y-10 py-4">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">Why Use Rating Cards?</h3>
            <div className="grid grid-cols-1 gap-4">
              {[
                { title: "Increase Reviews", desc: "Easier for customers to leave feedback instantly while at your venue." },
                { title: "Boost Visibility", desc: "More ratings improve your ranking in BVO search results." },
                { title: "Build Trust", desc: "Professional signage shows you care about customer experience." },
                { title: "Print & Display", desc: "Standard 3x6 inch size perfect for table tents, counters, or entryways." }
              ].map((benefit, i) => (
                <div key={i} className="flex space-x-4 p-5 bg-white rounded-3xl border border-gray-100 shadow-sm">
                  <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{benefit.title}</h4>
                    <p className="text-sm text-gray-500">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingCardView;
