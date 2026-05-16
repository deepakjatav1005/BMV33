import React, { useState, useEffect, useMemo } from 'react';
import { Home, Music, Globe, QrCode, FileText, Download, Image as ImageIcon } from 'lucide-react';
import QRCode from 'qrcode';
import { db, resolveUrl } from '../services/dataService';
import { imageUrlToBase64, cn } from '../lib/utils';
import { Venue, ServiceProvider } from '../types';
import { AppLogo } from '../components/AppLogo';

const FlexBannerDownloadView = ({ venues, services }: { venues: Venue[], services: ServiceProvider[] }) => {
  const [selectedType, setSelectedType] = useState<number>(1);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedSize, setSelectedSize] = useState('4x6');
  const [selectedInchSize, setSelectedInchSize] = useState('3x6');
  const [appName, setAppName] = useState('BEST VENUE OPTION');
  const [appTagline, setAppTagline] = useState('VENUE & EVENT & SERVICE PROVIDERS');
  const [appLogoUrl, setAppLogoUrl] = useState('/logo.png');

  const flexSizes = [
    { label: '2 x 4 Ft', value: '2x4', w: 1219.2, h: 609.6 },
    { label: '2 x 6 Ft', value: '2x6', w: 1828.8, h: 609.6 },
    { label: '3 x 6 Ft', value: '3x6', w: 1828.8, h: 914.4 },
    { label: '4 x 6 Ft', value: '4x6', w: 1828.8, h: 1219.2 },
    { label: '4 x 8 Ft', value: '4x8', w: 2438.4, h: 1219.2 },
    { label: '4 x 10 Ft', value: '4x10', w: 3048, h: 1219.2 },
    { label: '6 x 10 Ft', value: '6x10', w: 3048, h: 1828.8 },
    { label: '8 x 10 Ft', value: '8x10', w: 3048, h: 2438.4 },
    { label: '8 x 20 Ft', value: '8x20', w: 6096, h: 2438.4 },
  ];

  const cardSizes = [
    { label: '3 x 6 Inch', value: '3x6', w: 152.4, h: 76.2 },
  ];

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data: logoData } = await db.from('admin_settings').select('value').eq('key', 'app_logo_url').maybeSingle();
        if (logoData?.value) setAppLogoUrl(logoData.value);
        const { data: nameData } = await db.from('admin_settings').select('value').eq('key', 'app_name').maybeSingle();
        if (nameData?.value) setAppName(nameData.value);
        const { data: taglineData } = await db.from('admin_settings').select('value').eq('key', 'app_tagline').maybeSingle();
        if (taglineData?.value) setAppTagline(taglineData.value);
      } catch (err) {}
    };
    fetchSettings();
  }, []);

  const items = useMemo(() => {
    if (selectedType === 1) return venues;
    if (selectedType === 2) return services;
    return [];
  }, [selectedType, venues, services]);

  useEffect(() => {
    if (items.length > 0 && (!selectedItemId || !items.find(i => i.id === selectedItemId))) {
      setSelectedItemId(items[0].id || '');
    }
  }, [items, selectedItemId]);

  const selectedItem = useMemo(() => items.find(i => i.id === selectedItemId), [items, selectedItemId]);

  const generateFlex = async () => {
    const { jsPDF } = await import('jspdf');
    const sizeObj = selectedType === 4 
      ? cardSizes.find(s => s.value === selectedInchSize) 
      : flexSizes.find(s => s.value === selectedSize);
    
    if (!sizeObj) return;

    // Use landscape if width > height
    const orientation = sizeObj.w >= sizeObj.h ? 'l' : 'p';
    const doc = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: [sizeObj.w, sizeObj.h]
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    if (selectedType === 1 || selectedType === 2) {
      const item: any = selectedItem;
      if (!item) return;

      // BACKGROUND
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      // MAIN DECORATIVE BORDER
      doc.setDrawColor(234, 88, 12); // Orange Theme
      doc.setLineWidth(pageWidth * 0.015);
      doc.rect(pageWidth * 0.02, pageWidth * 0.02, pageWidth * 0.96, pageHeight - (pageWidth * 0.04), 'S');
      
      const margin = pageWidth * 0.05;
      const topY = pageHeight * 0.12;
      
      // 1. HEADER SECTION (Centered)
      // Highlight Box for Title
      doc.setFillColor(243, 244, 246);
      doc.rect(margin, topY - (pageHeight * 0.06), pageWidth - (2 * margin), pageHeight * 0.1, 'F');
      
      doc.setFontSize(pageHeight * 0.13);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      const mainTitle = selectedType === 1 ? (item.name || "VENUE NAME") : (item.name || "SERVICE NAME");
      doc.text(mainTitle.toUpperCase(), pageWidth / 2, topY, { align: 'center' });
      
      doc.setFontSize(pageHeight * 0.08);
      const subTitle1 = selectedType === 1 ? (item.ownerName || "OWNER NAME") : (item.ownerName || "PROVIDER NAME");
      doc.text(`(${subTitle1.toUpperCase()})`, pageWidth / 2, topY + (pageHeight * 0.1), { align: 'center' });

      if (selectedType === 2) {
        doc.setFontSize(pageHeight * 0.08);
        doc.text(`(${item.serviceType || "SERVICE TYPE"})`.toUpperCase(), pageWidth / 2, topY + (pageHeight * 0.19), { align: 'center' });
      }

      // 2. MAIN CONTENT AREA
      const middleY = topY + (selectedType === 2 ? pageHeight * 0.32 : pageHeight * 0.25);
      
      // LEFT PART: Available For & Amenities
      const labelFontSize = pageHeight * 0.065;
      const contentFontSize = pageHeight * 0.045;
      const leftColWidth = pageWidth * 0.55;

      doc.setFontSize(labelFontSize);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      const label1 = selectedType === 1 ? "(VENUE AVAILABLE FOR-)" : "(SERVICE AVAILABLE FOR-)";
      doc.text(label1, margin, middleY);
      
      doc.setFontSize(contentFontSize);
      doc.setFont("helvetica", "normal");
      const availableText = (item.availableFor || []).slice(0, 8).join(", ");
      doc.text(availableText.toUpperCase(), margin, middleY + (pageHeight * 0.05), { maxWidth: leftColWidth });
      
      const amenitiesY = middleY + (pageHeight * 0.22);
      doc.setFontSize(labelFontSize);
      doc.setFont("helvetica", "bold");
      const label2 = selectedType === 1 ? "(VENUE AMENITIES-)" : "(SERVICE AMENITIES-)";
      doc.text(label2, margin, amenitiesY);
      
      doc.setFontSize(contentFontSize);
      doc.setFont("helvetica", "normal");
      const amenitiesText = (item.facilities || item.catalogue?.map((c: any) => c.level) || []).slice(0, 10).join(", ");
      doc.text(amenitiesText.toUpperCase(), margin, amenitiesY + (pageHeight * 0.05), { maxWidth: leftColWidth });

      // RIGHT PART: Large Photo with Border and Shadow
      const photoSize = pageHeight * 0.5;
      const photoX = pageWidth - margin - photoSize;
      const photoY = middleY - (pageHeight * 0.05);
      
      // Simulated Shadow
      doc.setFillColor(200, 200, 200);
      doc.rect(photoX + 5, photoY + 5, photoSize, photoSize, 'F');

      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(3);
      doc.rect(photoX - 4, photoY - 4, photoSize + 8, photoSize + 8, 'S');

      if (item.images && item.images.length > 0) {
        try {
          const imgBase64 = await imageUrlToBase64(item.images[0]);
          if (imgBase64) doc.addImage(imgBase64, 'JPEG', photoX, photoY, photoSize, photoSize, undefined, 'FAST');
        } catch(e) {
          doc.setFontSize(pageHeight * 0.05);
          doc.text("PHOTO", photoX + photoSize/2, photoY + photoSize/2, { align: 'center' });
        }
      } else {
        doc.setFontSize(pageHeight * 0.05);
        doc.text("PHOTO", photoX + photoSize/2, photoY + photoSize/2, { align: 'center' });
      }

      // QR SECTION with Brackets
      const qrSize = pageHeight * 0.35;
      const qrCenterY = photoY + photoSize + (pageHeight * 0.25);
      const qrX = pageWidth - margin - (qrSize / 2);
      const actualQrY = qrCenterY - (qrSize / 2) + (pageHeight * 0.03);

      // Highlight Box for QR Text
      doc.setFillColor(255, 237, 213); // Light Orange
      doc.roundedRect(qrX - (qrSize/2) - 10, qrCenterY - (qrSize/2) - (pageHeight * 0.09), qrSize + 20, pageHeight * 0.1, 5, 5, 'F');
      
      doc.setFontSize(pageHeight * 0.045);
      doc.setTextColor(234, 88, 12); // Orange Theme
      doc.setFont("helvetica", "bold");
      doc.text("SCAN BARE CODE", qrX, qrCenterY - (qrSize / 2) - (pageHeight * 0.07), { align: 'center' });
      doc.text("FOR BOOKING", qrX, qrCenterY - (qrSize / 2) - (pageHeight * 0.02), { align: 'center' });
      
      // QR CODE Brackets
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(2.5);
      const brS = qrSize * 0.2;
      const bQrX = qrX - (qrSize / 2);
      const bQrY = actualQrY;
      doc.line(bQrX - 5, bQrY - 5, bQrX - 5 + brS, bQrY - 5);
      doc.line(bQrX - 5, bQrY - 5, bQrX - 5, bQrY - 5 + brS);
      doc.line(bQrX + qrSize + 5, bQrY - 5, bQrX + qrSize + 5 - brS, bQrY - 5);
      doc.line(bQrX + qrSize + 5, bQrY - 5, bQrX + qrSize + 5, bQrY - 5 + brS);
      doc.line(bQrX - 5, bQrY + qrSize + 5, bQrX - 5 + brS, bQrY + qrSize + 5);
      doc.line(bQrX - 5, bQrY + qrSize + 5, bQrX - 5, bQrY + qrSize + 5 - brS);
      doc.line(bQrX + qrSize + 5, bQrY + qrSize + 5, bQrX + qrSize + 5 - brS, bQrY + qrSize + 5);
      doc.line(bQrX + qrSize + 5, bQrY + qrSize + 5, bQrX + qrSize + 5, bQrY + qrSize + 5 - brS);

      try {
        const url = `${window.location.origin}/${selectedType === 1 ? 'venues' : 'services'}/${item.id}`;
        const qr = await QRCode.toDataURL(url, { width: 1000, margin: 2 });
        doc.addImage(qr, 'PNG', bQrX, bQrY, qrSize, qrSize);
      } catch(e) {}

      // 3. BOTTOM: Address
      const addressY = pageHeight * 0.8;
      
      // Highlight Box for Address
      doc.setFillColor(254, 243, 199); // Light Yellow
      doc.roundedRect(margin, addressY - (pageHeight * 0.06), pageWidth - (2 * margin), pageHeight * 0.1, 10, 10, 'F');
      
      doc.setFontSize(pageHeight * 0.08);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      const addr = item.address || [item.block, item.district].filter(Boolean).join(", ");
      doc.text(`(ADDRESS- ${addr.toUpperCase()} )`, pageWidth / 2, addressY, { align: 'center', maxWidth: pageWidth * 0.8 });

      // 4. PLATFORM BRANDING
      const brandY = pageHeight * 0.92;
      const brandLogoSize = pageHeight * 0.18;
      if (appLogoUrl) {
        try {
          const bLogo = await imageUrlToBase64(appLogoUrl);
          if (bLogo) doc.addImage(bLogo, 'PNG', margin, brandY - (brandLogoSize / 2), brandLogoSize, brandLogoSize);
        } catch(e) {}
      }

      const bTextX = margin + brandLogoSize + 10;
      doc.setFontSize(pageHeight * 0.13);
      doc.setTextColor(234, 88, 12); // Orange Name
      doc.setFont("helvetica", "bold");
      doc.text(appName.toUpperCase(), bTextX, brandY);
      
      doc.setFontSize(pageHeight * 0.05);
      doc.setTextColor(37, 99, 235); // Blue Tagline
      doc.setFont("helvetica", "normal");
      doc.text(appTagline.toUpperCase(), bTextX, brandY + (pageHeight * 0.07));

      // 5. FOOTER LINK
      doc.setFontSize(pageHeight * 0.035);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text(`VISIT FOR ONLINE BOOKING- WWW.${appName.replace(/\s+/g, '').toUpperCase()}.COM`, pageWidth / 2, pageHeight * 0.985, { align: 'center' });

    } else if (selectedType === 3) {
      // APP BRANDING BANNER
      doc.setFillColor(15, 23, 42); // slate-900 Top
      doc.rect(0, 0, pageWidth, pageHeight * 0.25, 'F');
      
      doc.setFillColor(255, 255, 255); // White Middle
      doc.rect(0, pageHeight * 0.25, pageWidth, pageHeight * 0.65, 'F');
      
      doc.setFillColor(234, 88, 12); // orange-600 Footer
      doc.rect(0, pageHeight * 0.9, pageWidth, pageHeight * 0.1, 'F');

      const margin = pageWidth * 0.05;
      
      // 1. HEADER BRANDING
      const headerY = pageHeight * 0.1;
      // Logo in header
      if (appLogoUrl) {
        try {
          const lBase64 = await imageUrlToBase64(appLogoUrl);
          if (lBase64) doc.addImage(lBase64, 'PNG', margin, headerY - (pageHeight * 0.07), pageHeight * 0.15, pageHeight * 0.15);
        } catch(e) {}
      }

      const hTextX = margin + (pageHeight * 0.18);
      doc.setFontSize(pageHeight * 0.12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(59, 130, 246); // blue-500
      doc.text("BEST VENUE", hTextX, headerY);
      const bvw = doc.getTextWidth("BEST VENUE ");
      doc.setTextColor(239, 68, 68); // red-500
      doc.text("OPTION", hTextX + bvw, headerY);
      
      doc.setFontSize(pageHeight * 0.035);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text(appTagline.toUpperCase(), hTextX, headerY + (pageHeight * 0.06), { maxWidth: pageWidth * 0.7 });

      // 2. MAIN FLEX SECTION
      const mainY = pageHeight * 0.35;
      const listHSpacing = pageHeight * 0.045;
      
      // -- LEFT: Venues --
      const vColX = margin;
      const vColW = pageWidth * 0.3;
      doc.setFontSize(pageHeight * 0.06);
      doc.setTextColor(234, 88, 12);
      doc.setFont("helvetica", "bold");
      doc.text("VENUE CATEGORIES:", vColX, mainY - (pageHeight * 0.03));
      
      doc.setFontSize(pageHeight * 0.035);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      ["• MARRIAGE GARDENS", "• HOTELS & RESORTS", "• MARRIAGE HALLS", "• RESTAURANTS", "• COMMUNITY HALLS", "• PARTY HALLS", "• MEETING HALLS"].forEach((v, i) => {
        doc.text(v, vColX, mainY + (i * listHSpacing));
      });

      // -- CENTER: Services --
      const sCol1X = vColX + vColW + (pageWidth * 0.05);
      const sColW = pageWidth * 0.55;
      const subCol1 = sCol1X;
      const subCol2 = sCol1X + (sColW / 2);
      
      doc.setFontSize(pageHeight * 0.06);
      doc.setTextColor(37, 99, 235);
      doc.setFont("helvetica", "bold");
      doc.text("SERVICE PROVIDERS:", sCol1X, mainY - (pageHeight * 0.03));
      
      doc.setFontSize(pageHeight * 0.03);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      
      const servicesLeft = ["• CATERORS", "• DHOL & BAND", "• DJ & SOUND", "• DRONE VIDEO", "• EVENT CLOTH", "• EVENT MANAGER", "• FAST FOOD", "• FLOWER DECOR", "• GHODA GADI", "• GIFT HAMPERS"];
      const servicesRight = ["• HALWAI", "• HELPERS", "• LAUNDRY", "• LIGHT DECOR", "• MAKEUP", "• MEHENDI", "• MUSICAL GROUP", "• PHOTO", "• PUJARI JI", "• STAGE DECOR", "• TENT HOUSE", "• VEHICLE RENT"];
      
      servicesLeft.forEach((s, i) => {
        doc.text(s, subCol1, mainY + (i * listHSpacing));
      });
      servicesRight.forEach((s, i) => {
        doc.text(s, subCol2, mainY + (i * listHSpacing));
      });

      // -- ILLUSTRATION / ICON at bottom right of main --
      try {
        const url = `${window.location.origin}/#/registration`;
        const qr = await QRCode.toDataURL(url, { width: 500, margin: 2, color: { dark: '#1e293b', light: '#ffffff' } });
        doc.addImage(qr, 'PNG', pageWidth - margin - (pageHeight * 0.2), pageHeight * 0.65, pageHeight * 0.2, pageHeight * 0.2);
        doc.setFontSize(pageHeight * 0.02);
        doc.setFont("helvetica", "bold");
        doc.text("REGISTER YOUR BUSINESS", pageWidth - margin - (pageHeight * 0.1), pageHeight * 0.87, { align: 'center' });
      } catch(e) {}

      const footerY3 = pageHeight * 0.96;
      doc.setFontSize(pageHeight * 0.04);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("FOR ONLINE BOOKING: WWW.BESTVENUEOPTION.COM", pageWidth / 2, footerY3, { align: 'center' });
      
      if (appLogoUrl) {
        try {
          const l64 = await imageUrlToBase64(appLogoUrl);
          if (l64) doc.addImage(l64, 'PNG', pageWidth - margin - (pageHeight * 0.15), footerY3 - (pageHeight * 0.03), pageHeight * 0.06, pageHeight * 0.06);
        } catch(e) {}
      }

    } else if (selectedType === 4) {
      // APP RATING BANNER
      doc.setFillColor(255, 247, 237); // orange-50
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      
      doc.setDrawColor(234, 88, 12); // orange-600
      doc.setLineWidth(pageWidth * 0.02);
      doc.rect(pageWidth * 0.03, pageWidth * 0.03, pageWidth * 0.94, pageHeight - (pageWidth * 0.06), 'S');
      
      const margin = pageWidth * 0.05;
      
      // Header: App Info
      if (appLogoUrl) {
        try {
          const l64 = await imageUrlToBase64(appLogoUrl);
          if (l64) doc.addImage(l64, 'PNG', pageWidth/2 - (pageHeight * 0.1), pageHeight * 0.08, pageHeight * 0.2, pageHeight * 0.2);
        } catch(e) {
             doc.setFillColor(37, 99, 235);
             doc.circle(pageWidth/2, pageHeight * 0.18, pageHeight * 0.08, 'F');
        }
      }

      doc.setFontSize(pageHeight * 0.08);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text(appName.toUpperCase(), pageWidth / 2, pageHeight * 0.35, { align: 'center' });
      
      doc.setFontSize(pageHeight * 0.04);
      doc.setTextColor(234, 88, 12);
      doc.text(appTagline.toUpperCase(), pageWidth / 2, pageHeight * 0.42, { align: 'center' });

      // QR Body
      doc.setFontSize(pageHeight * 0.06);
      doc.setTextColor(31, 41, 55);
      doc.setFont("helvetica", "bold");
      doc.text("SCAN TO RATE & REVIEW OUR APP", pageWidth / 2, pageHeight * 0.52, { align: 'center' });

      const qrSize = pageHeight * 0.35;
      const bQrX = (pageWidth - qrSize) / 2;
      const bQrY = pageHeight * 0.56;
      
      try {
        const qr = await QRCode.toDataURL(window.location.origin + "/#/app-rating", { 
          width: 1000, 
          margin: 2,
          color: { dark: '#ea580c', light: '#ffffff' } 
        });
        doc.addImage(qr, 'PNG', bQrX, bQrY, qrSize, qrSize);
      } catch(e) {}

      doc.setFontSize(pageHeight * 0.04);
      doc.setTextColor(156, 163, 175); // Gray-400
      doc.setFont("helvetica", "bold");
      doc.text("YOUR FEEDBACK MATTERS TO US", pageWidth / 2, bQrY + qrSize + (pageHeight * 0.06), { align: 'center' });

      // Footer
      doc.setFillColor(234, 88, 12);
      doc.rect(margin, pageHeight * 0.92, pageWidth - (2 * margin), pageHeight * 0.05, 'F');
      doc.setFontSize(pageHeight * 0.035);
      doc.setTextColor(255, 255, 255);
      doc.text(`VISIT - WWW.${appName.replace(/\s+/g, '').toUpperCase()}.COM`, pageWidth / 2, pageHeight * 0.955, { align: 'center' });
    }

    doc.save(`Flex_${selectedType}_${sizeObj.value}_${Date.now()}.pdf`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Flex & Banner Download</h2>
        <p className="text-gray-500 text-sm mt-1">Generate high-quality printable designs for branding and promotions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { id: 1, label: 'Venue Promotion', icon: <Home size={20} /> },
          { id: 2, label: 'Service Promotion', icon: <Music size={20} /> },
          { id: 3, label: 'App Branding', icon: <Globe size={20} /> },
          { id: 4, label: 'Rating Accept Card', icon: <QrCode size={20} /> },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setSelectedType(item.id)}
            className={cn(
              "flex flex-col items-center p-6 rounded-3xl border-2 transition-all gap-3",
              selectedType === item.id 
                ? "bg-orange-50 border-orange-500 text-orange-600 shadow-md transform scale-[1.02]" 
                : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"
            )}
          >
            <div className={cn("p-3 rounded-2xl", selectedType === item.id ? "bg-orange-500 text-white" : "bg-gray-50")}>
              {item.icon}
            </div>
            <span className="font-bold text-sm text-center line-clamp-2">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          {(selectedType === 1 || selectedType === 2) && (
            <div className="space-y-4">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest leading-none">Select {selectedType === 1 ? 'Venue' : 'Provider'}</label>
              <select 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none font-bold"
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
              >
                {items.length === 0 ? (
                  <option value="">No registered {selectedType === 1 ? 'venues' : 'services'} found</option>
                ) : (
                  items.map(i => <option key={i.id} value={i.id}>{i.name} ({selectedType === 1 ? (i as Venue).venueType : (i as ServiceProvider).serviceType})</option>)
                )}
              </select>
            </div>
          )}

          <div className="space-y-4">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest leading-none">Select Print Size</label>
            {selectedType === 4 ? (
              <select 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none font-bold"
                value={selectedInchSize}
                onChange={(e) => setSelectedInchSize(e.target.value)}
              >
                {cardSizes.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            ) : (
              <select 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none font-bold"
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
              >
                {flexSizes.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            )}
          </div>

          <div className="p-6 bg-orange-50 rounded-2xl border border-orange-100 text-sm text-orange-800 flex items-start gap-4">
            <div className="bg-orange-200 p-2 rounded-lg">
               <FileText size={20} />
            </div>
            <div>
              <p className="font-bold">Pro Graphics Generation</p>
              <p className="opacity-80">This will generate a high-DPI PDF document with {selectedType === 4 ? 'inch' : 'feet'} dimensions suitable for professional printing.</p>
            </div>
          </div>

          <button 
            onClick={generateFlex}
            disabled={(selectedType === 1 || selectedType === 2) && !selectedItemId}
            className="w-full py-4 bg-orange-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-orange-700 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={24} />
            <span>Download High-Quality PDF</span>
          </button>
        </div>

        <div className="bg-white p-2 rounded-3xl border-4 border-gray-100 shadow-inner overflow-hidden flex items-center justify-center min-h-[400px]">
          <div className="w-full aspect-[1.5/1] bg-white border border-gray-200 shadow-lg p-6 relative flex flex-col items-center justify-center text-center">
             <div className="absolute inset-0 bg-gray-50 flex items-center justify-center -z-10 text-[120px] font-black text-gray-100 select-none">FLEX</div>
             {selectedType === 1 || selectedType === 2 ? (
               <>
                 <div className="absolute top-0 left-0 w-full h-8 bg-orange-600 flex items-center px-4">
                   <span className="text-[8px] font-bold text-white uppercase tracking-widest">Promotion Banner</span>
                 </div>
                 <div className="mt-4 mb-2">
                   <h3 className="text-2xl font-black text-gray-900 uppercase leading-none">{selectedItem?.name || "Selection Name"}</h3>
                   <span className="text-orange-600 font-bold uppercase tracking-widest text-[10px]">
                     {selectedType === 1 ? (selectedItem as Venue)?.venueType : (selectedItem as ServiceProvider)?.serviceType}
                   </span>
                 </div>
                 <div className="grid grid-cols-2 gap-4 w-full px-6">
                    <div className="text-left text-[8px] space-y-1">
                       <p className="font-bold text-gray-400">AMENITIES:</p>
                       <p className="text-gray-900">Full list displayed in PDF...</p>
                    </div>
                    <div className="w-full h-24 bg-gray-100 rounded-lg overflow-hidden border border-gray-100">
                      {selectedItem?.images?.[0] ? <img src={resolveUrl(selectedItem.images[0])} className="w-full h-full object-cover" /> : <ImageIcon className="w-full h-full p-4 text-gray-300" />}
                    </div>
                 </div>
                 <div className="mt-4 flex flex-col items-center">
                    <QrCode size={32} className="text-orange-500 mb-1" />
                    <span className="text-[6px] font-bold text-orange-400 uppercase">Scan to Book</span>
                 </div>
                 <div className="mt-auto pt-4 border-t w-full flex justify-between px-4 items-end">
                    <div className="text-left leading-none">
                       <span className="block text-[10px] font-black text-blue-600">BEST VENUE</span>
                       <span className="block text-[10px] font-black text-red-600">OPTION</span>
                    </div>
                    <span className="text-[6px] font-bold text-gray-400">www.bestvenueoption.com</span>
                 </div>
               </>
             ) : selectedType === 3 ? (
               <div className="flex flex-col items-center justify-center h-full w-full bg-orange-50/30 p-8">
                  <div className="flex items-center gap-2 mb-4">
                     <AppLogo showText={false} size="xs" />
                     <div className="text-left leading-none">
                       <span className="block text-2xl font-black text-blue-600">BEST VENUE</span>
                       <span className="block text-2xl font-black text-red-600">OPTION</span>
                     </div>
                  </div>
                  <p className="text-orange-800 font-bold uppercase tracking-tighter text-xs mb-8">{appTagline}</p>
                  <div className="w-full h-12 bg-white rounded-lg border border-orange-100 mb-4 flex items-center justify-center text-[8px] font-black px-4 text-gray-400">
                    GARDEN | HOTEL | DJ | TENT | PHOTO | CATERING | BAND
                  </div>
                  <div className="mt-auto flex items-center justify-between w-full">
                     <span className="text-[10px] font-bold text-blue-600">bestvenueoption.com</span>
                     <div className="flex flex-col items-center gap-1">
                        <QrCode size={24} className="text-orange-500" />
                        <span className="text-[6px] font-bold text-gray-400 uppercase">Register Business</span>
                     </div>
                  </div>
               </div>
             ) : (
                <div className="flex flex-col items-center justify-center h-full w-full bg-white p-8">
                  <div className="w-full flex justify-between items-center mb-12">
                     <div className="text-left leading-none">
                       <span className="block text-[12px] font-black text-blue-600">BEST VENUE</span>
                       <span className="block text-[12px] font-black text-red-600">OPTION</span>
                     </div>
                     <AppLogo showText={false} size="xs" />
                  </div>
                  <h3 className="text-3xl font-black text-orange-600 mb-8 uppercase tracking-widest">Rate Our App</h3>
                  <div className="w-32 h-32 bg-orange-50 border-2 border-orange-100 flex items-center justify-center rounded-2xl shadow-sm mb-4">
                    <QrCode size={64} className="text-orange-600" />
                  </div>
                  <p className="text-xs font-black text-gray-400">SCAN & REVIEW NOW</p>
                  <div className="mt-auto text-blue-600 font-black text-[10px] tracking-widest">WWW.BESTVENUEOPTION.COM</div>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlexBannerDownloadView;
