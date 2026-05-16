import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { 
  BarChart2, Calendar, User as UserIcon, Home, Music, 
  CreditCard, QrCode, FileText, IndianRupee, Image as ImageIcon,
  Menu, ChevronDown, AlertCircle, Clock, MapPin, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { db } from '../lib/supabase';
import { Venue, ServiceProvider, Booking, UserProfile, UserSubscription } from '../types';
import { cn, formatDateDDMMYYYY, resolveUrl, sendWhatsAppAlert } from '../lib/utils';
import AppLogo from '../components/AppLogo';

// Sub-views
import OverviewView from './dashboard/OverviewView';
import ProfileEditView from './dashboard/ProfileEditView';
import VenueManageView from './dashboard/VenueManageView';
import ServicesManageView from './dashboard/ServicesManageView';
import PublicBookingView from './dashboard/PublicBookingView';
import ManuallyBookingView from './dashboard/ManuallyBookingView';
import ManagePaymentView from './dashboard/ManagePaymentView';
import CatalogueManageView from './dashboard/CatalogueManageView';
import ReportsView from './dashboard/ReportsView';
import SubscriptionManageView from './dashboard/SubscriptionManageView';
import RatingCardView from './dashboard/RatingCardView';

interface DashboardViewProps {
  user: any;
  profile: UserProfile | null;
  onUpdateProfile: (p: UserProfile) => void;
  globalSettings: any;
  activeSubscription: UserSubscription | null;
  onUpgradeNeeded: () => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ 
  user, 
  profile, 
  onUpdateProfile, 
  globalSettings,
  activeSubscription,
  onUpgradeNeeded
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as any) || 'overview';
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [reportFilters, setReportFilters] = useState({
    name: '',
    mobile: '',
    startDate: '',
    endDate: '',
    paymentMode: '',
    bookingType: '',
    year: new Date().getFullYear().toString()
  });

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [services, setServices] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubscriptionReminder, setShowSubscriptionReminder] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        toast.error('Session expired due to inactivity');
        db.auth.signOut().then(() => {
          window.location.href = '/login';
        });
      }, 5 * 60 * 1000); // 5 minutes inactivity
    };

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    activityEvents.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      clearTimeout(timeout);
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
    setIsMobileMenuOpen(false);
  };

  const fetchDashboardData = useCallback(async () => {
    if (!user?.uid) return;
    try {
      let bData: any[] = [];
      let pData: any[] = [];

      if (profile?.role === 'admin') {
        const { data: bookingsRes } = await db.from('bookings').select('*').order('created_at', { ascending: false });
        const { data: paymentsRes } = await db.from('booking_payments').select('*');
        bData = bookingsRes || [];
        pData = paymentsRes || [];
      } else {
        const { data: cb } = await db.from('bookings').select('*').eq('user_id', user?.uid);
        const { data: pb } = await db.from('bookings').select('*').eq('owner_id', user?.uid);
        const combined = [...(cb || []), ...(pb || [])];
        bData = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
        
        if (bData.length > 0) {
          const bookingIds = bData.map(b => b.id);
          const { data: paymentsRes } = await db.from('booking_payments').select('*').in('booking_id', bookingIds);
          pData = paymentsRes || [];
        }
      }
      
      if (bData) {
        setBookings(bData.map(d => {
          const relatedPayments = pData.filter(p => p.booking_id === d.id);
          return {
            ...d,
            userId: d.user_id,
            ownerId: d.owner_id,
            targetId: d.target_id,
            targetType: d.target_type,
            targetName: d.target_name,
            eventDate: d.event_date,
            endDate: d.end_date,
            startTime: d.start_time,
            endTime: d.end_time,
            status: d.status,
            totalAmount: d.total_amount || 0,
            updatedAmount: d.updated_amount,
            advance_amount: d.advance_amount || 0,
            eventType: d.event_type,
            partyName: d.party_name,
            partyAddress: d.party_address,
            visitorName: d.visitor_name,
            visitorMobile: d.visitor_mobile,
            paymentStatus: d.payment_status ? (d.payment_status.charAt(0).toUpperCase() + d.payment_status.slice(1)) : 'Pending',
            paymentMode: d.payment_mode,
            isManual: d.is_manual,
            isLocked: !!d.is_locked,
            is_invoice_generated: d.is_invoice_generated,
            invoice_url: d.invoice_url,
            extra_services: d.extra_services || [],
            payments: relatedPayments.map((p: any) => ({
              id: p.id,
              bookingId: p.booking_id,
              amount: p.amount,
              paymentMode: p.payment_mode,
              paymentDate: p.payment_date,
              paymentType: p.payment_type || 'Regular',
              transaction_id: p.transaction_id,
              createdAt: p.created_at
            })),
            createdAt: d.created_at
          } as Booking;
        }));
      }

      const vQuery = db.from('venues').select('*');
      if (profile?.role !== 'admin') {
        vQuery.eq('owner_id', user?.uid);
      }
      const { data: vData } = await vQuery;
      
      if (vData) {
        setVenues(vData.map(d => ({
          ...d,
          ownerId: d.owner_id,
          venueType: d.venue_type || d.type,
          pricePerDay: d.price_per_day,
          availableFor: d.available_for || [],
          catalogue: d.catalogue || [],
          reviewCount: d.review_count,
          createdAt: d.created_at
        }) as Venue));
      }

      if (profile?.role !== 'admin') {
        const { data: sp1 } = await db.from('service_providers').select('*').eq('provider_id', user?.uid);
        const { data: sp2 } = await db.from('service_providers').select('*').eq('owner_id', user?.uid);
        const sCombined = [...(sp1 || []), ...(sp2 || [])];
        const sDataFiltered = sCombined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
        
        setServices(sDataFiltered.map(d => ({
          ...d,
          ownerId: d.owner_id || d.provider_id,
          providerId: d.provider_id || d.owner_id,
          serviceType: d.service_type || d.type,
          priceRange: d.price_range,
          priceLevel: d.price_level,
          availableFor: d.available_for || [],
          catalogue: d.catalogue || [],
          reviewCount: d.review_count,
          createdAt: d.created_at
        }) as ServiceProvider));
      } else {
        const { data: sData } = await db.from('service_providers').select('*');
        if (sData) {
          setServices(sData.map(d => ({
            ...d,
            ownerId: d.owner_id || d.provider_id,
            providerId: d.provider_id || d.owner_id,
            serviceType: d.service_type || d.type,
            priceRange: d.price_range,
            priceLevel: d.price_level,
            availableFor: d.available_for || [],
            catalogue: d.catalogue || [],
            reviewCount: d.review_count,
            createdAt: d.created_at
          }) as ServiceProvider));
        }
      }
    } catch (err) {
      console.error('Dashboard data error:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, profile?.role]);

  useEffect(() => {
    if (!user?.uid) return;
    fetchDashboardData();

    // Realtime subscriptions
    const bookingChannel = db
      .channel(`dashboard_bookings_${user?.uid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      db.removeChannel(bookingChannel);
    };
  }, [user?.uid, profile?.role, fetchDashboardData]);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!profile || profile.role === 'user' || profile.role === 'admin') return;
      
      if (!globalSettings.subscriptionEnabled) {
        setShowSubscriptionReminder(false);
        setIsSubscriptionModalOpen(false);
        return;
      }
      
      try {
        const { data: sub, error } = await db
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user?.uid)
          .eq('status', 'active')
          .maybeSingle();
        
        if (error) throw error;
        
        if (!sub) {
          setShowSubscriptionReminder(true);
          setIsSubscriptionModalOpen(true);
          const lastReminded = localStorage.getItem(`last_reminded_${user?.uid}`);
          const now = new Date().getTime();
          const oneWeek = 7 * 24 * 60 * 60 * 1000;
          
          if (!lastReminded || now - parseInt(lastReminded) > oneWeek) {
            const msg = `Hello ${profile.displayName}, you don't have an active subscription plan. Please subscribe to continue receiving business inquiries.`;
            sendWhatsAppAlert(profile.mobileNumber, msg);
            localStorage.setItem(`last_reminded_${user?.uid}`, now.toString());
          }
        }
      } catch (err) {
        console.error("Error checking subscription:", err);
      }
    };
    if (profile && user) checkSubscription();
  }, [profile, user?.uid, globalSettings.subscriptionEnabled]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  if (!user) return <Navigate to="/login" />;

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <BarChart2 size={20} />, roles: ['owner', 'provider', 'user'] },
    { id: 'manually-booking', label: 'Manually Booking', icon: <Plus size={20} />, roles: ['owner', 'provider'] },
    { id: 'public-booking', label: profile?.role === 'user' ? 'My Bookings' : 'Public Booking', icon: <Calendar size={20} />, roles: ['owner', 'provider', 'user'] },
    { id: 'manage-payment', label: 'Manage Payment', icon: <IndianRupee size={20} />, roles: ['owner', 'provider'] },
    { id: 'catalogue', label: 'Catalogue Manage', icon: <ImageIcon size={20} />, roles: ['owner', 'provider'] },
    { id: 'profile', label: 'Profile Manage', icon: <UserIcon size={20} /> },
    { id: 'reports', label: 'Reports', icon: <FileText size={20} />, roles: ['owner', 'provider'] },
    { id: 'services', label: 'Services Manage', icon: <Music size={20} />, roles: ['provider'] },
    { id: 'subscription', label: 'Subscription', icon: <CreditCard size={20} />, roles: ['owner', 'provider'] },
    { id: 'rating-card', label: 'Rating Accept Card', icon: <QrCode size={20} />, roles: ['owner', 'provider'] },
    { id: 'venues', label: 'Venue Manage', icon: <Home size={20} />, roles: ['owner'] },
  ].sort((a, b) => {
    if (a.id === 'overview') return -1;
    if (b.id === 'overview') return 1;
    return a.label.localeCompare(b.label);
  });

  const filteredMenu = menuItems.filter(item => {
    if (profile?.role === 'admin') return true;
    return !item.roles || item.roles.includes(profile?.role || '');
  });

  const stats = useMemo(() => {
    const isPaidFunc = (b: Booking) => {
      const base = Number(b.updatedAmount) || Number(b.totalAmount) || 0;
      const paymentsTotal = (b.payments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      return (paymentsTotal >= (base - 0.1) && base > 0) || (b.status || '').toLowerCase() === 'paid' || (b.status || '').toLowerCase() === 'completed' || b.paymentStatus === 'Paid';
    };

    return {
      total: bookings.length || 0,
      pending: bookings.filter(b => !b.isManual && b.status === 'pending').length || 0,
      approved: bookings.filter(b => (b.isManual || b.status === 'confirmed' || b.status === 'approved') && !isPaidFunc(b)).length || 0,
      completed: bookings.filter(b => isPaidFunc(b)).length
    };
  }, [bookings]);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayBookings = useMemo(() => 
    bookings.filter(b => b.eventDate === todayStr && b.status !== 'cancelled'),
    [bookings, todayStr]
  );

  const downloadReport = async (type: 'excel' | 'pdf' = 'excel') => {
    const filteredBookings = bookings.filter(b => {
      const bName = (b.visitorName || b.partyName || '').toLowerCase();
      const bMobile = b.visitorMobile || '';
      const matchesName = !reportFilters.name || bName.includes(reportFilters.name.toLowerCase());
      const matchesMobile = !reportFilters.mobile || bMobile.includes(reportFilters.mobile);
      const matchesMode = !reportFilters.paymentMode || b.paymentMode === reportFilters.paymentMode;
      const matchesType = !reportFilters.bookingType || (reportFilters.bookingType === 'Manual' ? b.isManual : !b.isManual);
      const bDate = new Date(b.eventDate);
      const matchesStart = !reportFilters.startDate || bDate >= new Date(reportFilters.startDate);
      const matchesEnd = !reportFilters.endDate || bDate <= new Date(reportFilters.endDate);
      const matchesYear = !reportFilters.year || b.eventDate.startsWith(reportFilters.year);
      return matchesName && matchesMobile && matchesMode && matchesStart && matchesEnd && matchesType && matchesYear;
    });

    if (type === 'excel') {
      const XLSX = await import('xlsx');
      const data = filteredBookings.map((b, index) => {
        const total = Number(b.updatedAmount || b.totalAmount || 0);
        const totalReceived = (b.payments || []).reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
        const discTotal = (b.payments || []).filter(p => p.paymentType === 'Discount').reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
        const cashPaid = totalReceived - discTotal;
        const pending = Math.max(0, total - totalReceived);
        
        return {
          'S.No': index + 1,
          'Status': (pending <= 0.1 && total > 0) ? 'Completed' : (b.status === 'cancelled' ? 'Cancelled' : b.status ? b.status.toUpperCase() : 'PENDING'),
          'Party Name': b.partyName || b.visitorName || 'N/A',
          'Mobile': b.visitorMobile || 'N/A',
          'Date': formatDateDDMMYYYY(b.eventDate),
          'Invoice No': b.transaction_id || `INV-${(b.id || '').substring(0, 8).toUpperCase()}`,
          'Actual Amount': total.toLocaleString(),
          'Cash Paid': cashPaid.toLocaleString(),
          'Discount': discTotal.toLocaleString(),
          'Pending Amount': pending.toLocaleString(),
          'Type': b.isManual ? 'Manual' : 'Order'
        };
      });
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");
      XLSX.writeFile(workbook, `Booking_Report_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);
    } else {
      const { jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      const doc = new jsPDF('l', 'mm', 'a4');
      doc.setFontSize(18);
      doc.text("Booking Transaction Report", 14, 20);
      doc.setFontSize(10);
      doc.text(`Generated on: ${format(new Date(), 'dd/MM/yyyy hh:mm a')}`, 14, 30);
      
      const tableHeaders = [
        ['S.No', 'Status', 'Customer', 'Mobile', 'Date', 'Inv No', 'Total', 'Paid(Cash)', 'Disc.', 'Pending', 'Type']
      ];
      
      const pdfData = filteredBookings.map((b, index) => {
        const total = Math.round(b.updatedAmount || b.totalAmount || 0);
        const totalRec = Math.round((b.payments || []).reduce((acc, p) => acc + (p.amount || 0), 0));
        const disc = Math.round((b.payments || []).filter(p => p.paymentType === 'Discount').reduce((acc, p) => acc + (p.amount || 0), 0));
        const cash = totalRec - disc;
        const pending = Math.max(0, total - totalRec);
        
        return [
          (index + 1).toString(),
          (pending <= 1 && total > 0) ? 'COMPLETED' : (b.status || 'PENDING').toUpperCase(),
          (b.partyName || b.visitorName || 'N/A').substring(0, 20),
          b.visitorMobile || 'N/A',
          formatDateDDMMYYYY(b.eventDate),
          (b.transaction_id || b.id.substring(0, 8)).toUpperCase(),
          total.toLocaleString(),
          cash.toLocaleString(),
          disc.toLocaleString(),
          pending.toLocaleString(),
          b.isManual ? 'M' : 'O'
        ];
      });

      autoTable(doc, {
        head: tableHeaders,
        body: pdfData,
        startY: 40,
        theme: 'grid',
        styles: { fontSize: 7, font: 'helvetica' },
        headStyles: { fillColor: [234, 88, 12] }
      });
      
      doc.save(`Booking_Report_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
    }
    toast.success(`Report downloaded as ${type.toUpperCase()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="lg:hidden mb-4">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-full bg-orange-600 text-white p-4 rounded-2xl font-bold flex items-center justify-between shadow-lg"
            >
              <div className="flex items-center space-x-2">
                <Menu size={20} />
                <span>Dashboard Menu</span>
              </div>
              <ChevronDown className={cn("transition-transform", isMobileMenuOpen && "rotate-180")} />
            </button>
          </div>

          <div className="lg:hidden mb-6 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex space-x-2 min-w-max">
              {filteredMenu.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={cn(
                    "px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all",
                    activeTab === item.id 
                      ? "bg-orange-600 text-white shadow-md" 
                      : "bg-white text-gray-500 border border-gray-100"
                  )}
                >
                  <div className="flex items-center space-x-2">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {(isMobileMenuOpen || isDesktop) && (
              <motion.div 
                initial={!isDesktop ? { opacity: 0, height: 0, y: -20 } : false}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={!isDesktop ? { opacity: 0, height: 0, y: -20 } : undefined}
                className={cn(
                  "bg-white rounded-3xl shadow-xl border border-orange-100 overflow-hidden sticky top-24 lg:block",
                  !isDesktop && !isMobileMenuOpen && "hidden"
                )}
              >
                <div className="p-6 bg-orange-600 text-white">
                  <h2 className="font-bold text-lg">Dashboard</h2>
                  <p className="text-xs opacity-80">Welcome, {profile?.displayName}</p>
                </div>
                <nav className="p-4 space-y-2 max-h-[60vh] overflow-y-auto lg:max-h-none">
                  {filteredMenu.map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={cn(
                        "w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold transition-all",
                        activeTab === item.id 
                          ? "bg-orange-50 text-orange-600 shadow-sm" 
                          : "text-gray-500 hover:bg-gray-50"
                      )}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  ))}
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {showSubscriptionReminder && (
            <div className="mb-8 bg-red-50 border border-red-100 rounded-3xl p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-red-900">No Active Subscription</h3>
                  <p className="text-red-600 text-sm">Please subscribe to a plan to receive and manage business inquiries.</p>
                </div>
              </div>
              <button 
                onClick={() => handleTabChange('subscription')}
                className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-700 transition-colors"
              >
                View Plans
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-3xl shadow-xl border border-orange-100 p-3 md:p-8 min-h-[500px] md:min-h-[600px] overflow-hidden"
            >
              {activeTab === 'overview' && (
                <OverviewView profile={profile} stats={stats} todayBookings={todayBookings} onTabChange={handleTabChange} />
              )}
              {activeTab === 'profile' && (
                <ProfileEditView user={user} profile={profile} onUpdate={onUpdateProfile} />
              )}
              {activeTab === 'venues' && (
                <VenueManageView user={user} venues={venues} onUpdate={fetchDashboardData} />
              )}
              {activeTab === 'public-booking' && (
                <PublicBookingView 
                  user={user} 
                  profile={profile} 
                  bookings={bookings} 
                  onUpdate={fetchDashboardData} 
                  globalSettings={globalSettings}
                  activeSubscription={activeSubscription}
                  onUpgrade={onUpgradeNeeded}
                />
              )}
              {activeTab === 'manually-booking' && (
                <ManuallyBookingView 
                  user={user} 
                  profile={profile} 
                  bookings={bookings} 
                  venues={venues} 
                  services={services} 
                  onUpdate={fetchDashboardData}
                  globalSettings={globalSettings}
                  activeSubscription={activeSubscription}
                  onUpgrade={onUpgradeNeeded}
                />
              )}
              {activeTab === 'manage-payment' && (
                <ManagePaymentView 
                  user={user} 
                  profile={profile} 
                  bookings={bookings} 
                  onUpdate={fetchDashboardData} 
                  globalSettings={globalSettings}
                  activeSubscription={activeSubscription}
                  onUpgrade={onUpgradeNeeded}
                />
              )}
              {activeTab === 'services' && (
                <ServicesManageView user={user} services={services} onUpdate={fetchDashboardData} />
              )}
              {activeTab === 'catalogue' && (
                <CatalogueManageView user={user} venues={venues} services={services} />
              )}
              {activeTab === 'reports' && (
                <ReportsView 
                  bookings={bookings} 
                  reportFilters={reportFilters} 
                  setReportFilters={setReportFilters} 
                  downloadReport={downloadReport} 
                  profile={profile}
                  globalSettings={globalSettings}
                  fetchDashboardData={fetchDashboardData}
                />
              )}
              {activeTab === 'subscription' && (
                <SubscriptionManageView user={user} profile={profile} />
              )}
              {activeTab === 'rating-card' && (
                <RatingCardView profile={profile} venues={venues} services={services} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {isSubscriptionModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSubscriptionModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden p-8 text-center"
            >
              <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <CreditCard size={40} />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Activate Your Business</h2>
              <p className="text-gray-500 mb-8">You don't have an active subscription. Subscribe to a plan to start receiving and managing business inquiries.</p>
              
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    handleTabChange('subscription');
                    setIsSubscriptionModalOpen(false);
                  }}
                  className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold hover:bg-orange-700 shadow-xl shadow-orange-200 transition-all"
                >
                  View Subscription Plans
                </button>
                <button 
                  onClick={() => setIsSubscriptionModalOpen(false)}
                  className="w-full bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                >
                  I'll do it later
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardView;
