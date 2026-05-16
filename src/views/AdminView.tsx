import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart2, Users, CreditCard, Bell, Image as LucideImage, 
  Image as ImageIcon, Sparkles, QrCode, User as UserIcon, 
  Database, Settings, Download, Trash2, Edit2, XCircle, 
  CheckCircle, ChevronRight, AlertCircle, Plus, Search, Globe,
  Check
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { db, isSupabaseConnected } from '../services/dataService';
import { UserProfile, Booking, UserSubscription, SubscriptionPlan, AppNotification, AppBanner, ServiceTypePhoto, Venue, ServiceProvider, ServiceType } from '../types';
import { SERVICE_TYPES } from '../constants';
import { formatDateTime12h, formatDateDDMMYYYY, formatTime12h, generateUUID, resolveUrl } from '../lib/utils';
import { ImageUpload, VideoUpload } from '../components/Uploads';
import FlexBannerDownloadView from './FlexBannerDownloadView';
import * as AdminCharts from '../components/AdminCharts';

const UserDistributionChart = ({ users }: { users: any[] }) => (
  <React.Suspense fallback={<div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-2xl animate-pulse">Loading Chart...</div>}>
    <AdminCharts.UserDistributionChart users={users} />
  </React.Suspense>
);

const BookingStatusChart = ({ bookings }: { bookings: any[] }) => (
  <React.Suspense fallback={<div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-2xl animate-pulse">Loading Chart...</div>}>
    <AdminCharts.BookingStatusChart bookings={bookings} />
  </React.Suspense>
);

interface AdminViewProps {
  user: any;
  profile: UserProfile | null;
  onUpdateProfile: (p: UserProfile) => void;
  globalSettings: any;
  setGlobalSettings: any;
  activeSubscription: UserSubscription | null;
}

const AdminView = ({ 
  user, 
  profile, 
  onUpdateProfile, 
  globalSettings, 
  setGlobalSettings,
  activeSubscription
}: AdminViewProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'plans' | 'notifications' | 'banners' | 'servicePhotos' | 'moments' | 'profile' | 'settings' | 'database' | 'flex-download'>('dashboard');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [banners, setBanners] = useState<AppBanner[]>([]);
  const [servicePhotos, setServicePhotos] = useState<ServiceTypePhoto[]>([]);
  const [moments, setMoments] = useState<{id: string, media_url: string, type: string, created_at: string}[]>([]);
  const [adminVenues, setAdminVenues] = useState<Venue[]>([]);
  const [adminServices, setAdminServices] = useState<ServiceProvider[]>([]);
  const [appLogoUrl, setAppLogoUrl] = useState<string>('/logo.png');
  const [loading, setLoading] = useState(true);
  
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [newNotification, setNewNotification] = useState({ title: '', message: '' });
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [newBanner, setNewBanner] = useState({ title: '', imageUrl: '' });
  const [editingNotification, setEditingNotification] = useState<AppNotification | null>(null);
  const [newServicePhoto, setNewServicePhoto] = useState({ serviceType: SERVICE_TYPES[0] as ServiceType, imageUrl: '' });

  const [adminProfile, setAdminProfile] = useState({
    displayName: profile?.displayName || 'Deepak Jatav',
    email: profile?.email || 'deepakjatav1005@gmail.com',
    mobileNumber: profile?.mobileNumber || '9165436918',
    password: ''
  });

  useEffect(() => {
    if (!user || user.email !== 'deepakjatav1005@gmail.com') {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'dashboard') {
        const { data: bData } = await db.from('bookings').select('*').order('created_at', { ascending: false });
        if (bData) setBookings(bData.map(d => ({
          ...d,
          userId: d.user_id,
          visitorName: d.visitor_name,
          visitorMobile: d.visitor_mobile,
          targetId: d.target_id,
          targetType: d.target_type,
          targetName: d.target_name,
          ownerId: d.owner_id,
          eventDate: d.event_date,
          totalAmount: d.total_amount,
          updatedAmount: d.updated_amount,
          paymentMode: d.payment_mode,
          paymentStatus: d.payment_status,
          is_invoice_generated: d.is_invoice_generated,
          invoice_url: d.invoice_url,
          extra_services: d.extra_services,
          createdAt: d.created_at
        } as Booking)));

        const { data: sData } = await db.from('user_subscriptions').select('*');
        if (sData) setSubscriptions(sData.map(d => ({
          id: d.id,
          userId: d.user_id,
          planId: d.plan_id,
          startDate: d.start_date,
          endDate: d.end_date,
          status: d.status,
          createdAt: d.created_at
        }) as UserSubscription));
      }

      if (activeTab === 'dashboard' || activeTab === 'users') {
        const { data } = await db.from('users').select('*').order('created_at', { ascending: false });
        if (data) setUsers(data.map(d => ({
          uid: d.uid,
          registrationId: d.registration_id,
          displayName: d.display_name,
          mobileNumber: d.mobile_number,
          email: d.email,
          role: d.role,
          status: d.status,
          createdAt: d.created_at
        } as UserProfile)));
      }
      
      if (activeTab === 'plans') {
        const { data } = await db.from('subscription_plans').select('*');
        if (data) setPlans(data.map(d => ({
          id: d.id,
          role: d.role,
          name: d.name,
          price: d.price,
          duration: d.duration,
          isActive: d.is_active,
          benefits: d.benefits || []
        } as SubscriptionPlan)));
      } else if (activeTab === 'notifications') {
        const { data } = await db.from('notifications').select('*').order('created_at', { ascending: false });
        if (data) setNotifications(data);
      } else if (activeTab === 'banners') {
        const { data } = await db.from('banners').select('*').order('created_at', { ascending: false });
        if (data) setBanners(data);
      } else if (activeTab === 'servicePhotos') {
        const { data } = await db.from('service_type_photos').select('*').order('created_at', { ascending: false });
        if (data) setServicePhotos(data.map(d => ({
          id: d.id,
          serviceType: d.service_type,
          imageUrl: d.image_url,
          createdAt: d.created_at
        } as ServiceTypePhoto)));
      }

      if (activeTab === 'moments') {
        const { data } = await db.from('moments').select('*').order('created_at', { ascending: false });
        if (data) setMoments(data);
      }

      if (activeTab === 'flex-download') {
        const { data: vData } = await db.from('venues').select('*');
        const { data: sData } = await db.from('service_providers').select('*');
        
        if (vData) setAdminVenues(vData.map((v: any) => ({ 
          ...v, 
          ownerId: v.owner_id,
          venueType: v.type,
          pricePerDay: v.price_per_day,
          availableFor: v.available_for || [],
          catalogue: v.catalogue || [],
          facilities: v.facilities || [],
          createdAt: v.created_at
        } as Venue)));
        
        if (sData) setAdminServices(sData.map((s: any) => ({ 
          ...s, 
          providerId: s.owner_id,
          serviceType: s.type,
          priceRange: s.price_range,
          priceLevel: s.price_level,
          availableFor: s.available_for || [],
          catalogue: s.catalogue || [],
          facilities: s.facilities || [],
          createdAt: s.created_at
        } as ServiceProvider)));
      }

      if (activeTab === 'settings') {
        const { data } = await db.from('admin_settings').select('value').eq('key', 'app_logo_url').maybeSingle();
        if (data?.value) setAppLogoUrl(data.value);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetAllRatings = async () => {
    if (!window.confirm('Are you sure you want to reset all ratings and reviews?')) return;
    setLoading(true);
    try {
      await db.from('venues').update({ rating: 0, review_count: 0 }).neq('id', '00000000-0000-0000-0000-000000000000');
      await db.from('service_providers').update({ rating: 0, review_count: 0 }).neq('id', '00000000-0000-0000-0000-000000000000');
      await db.from('reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      toast.success('All ratings and reviews set to zero');
      fetchData();
    } catch (err) {
      toast.error('Failed to reset ratings');
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (id: string) => {
    if (!window.confirm('Delete notification?')) return;
    const { error } = await db.from('notifications').delete().eq('id', id);
    if (!error) {
      toast.success('Deleted');
      fetchData();
    }
  };

  const deleteBanner = async (id: string) => {
    if (!window.confirm('Delete banner?')) return;
    const { error } = await db.from('banners').delete().eq('id', id);
    if (!error) {
      toast.success('Deleted');
      fetchData();
    }
  };

  const deleteServicePhoto = async (id: string) => {
    if (!window.confirm('Delete photo?')) return;
    const { error } = await db.from('service_type_photos').delete().eq('id', id);
    if (!error) {
      toast.success('Deleted');
      fetchData();
    }
  };

  const toggleUserStatus = async (uid: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    const { error } = await db.from('users').update({ status: newStatus }).eq('uid', uid);
    if (!error) {
      toast.success(`User ${newStatus}`);
      fetchData();
    }
  };

  const deleteUser = async (uid: string) => {
    if (!window.confirm('Delete user?')) return;
    const { error } = await db.from('users').delete().eq('uid', uid);
    if (!error) {
      toast.success('Deleted');
      fetchData();
    }
  };

  const handleLogoUpload = async (url: string) => {
    setLoading(true);
    try {
      const { error } = await db.from('admin_settings').upsert({ key: 'app_logo_url', value: url });
      if (error) throw error;
      setAppLogoUrl(url);
      window.dispatchEvent(new CustomEvent('app_logo_updated', { detail: url }));
      toast.success('Logo updated');
    } catch (err) {
      toast.error('Failed to update logo');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (type: 'excel' | 'pdf') => {
    const data = users.map(u => ({
      'Reg ID': u.registrationId,
      'Name': u.displayName,
      'Mobile': u.mobileNumber,
      'Email': u.email,
      'Role': u.role,
      'Status': u.status,
      'Date': formatDateTime12h(u.createdAt)
    }));
    
    if (type === 'excel') {
      const XLSX = await import('xlsx');
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Users");
      XLSX.writeFile(wb, "BVO_Users_Report.xlsx");
    } else {
      const { jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      const doc = new jsPDF();
      doc.text("User Report", 14, 15);
      autoTable(doc, {
        startY: 20,
        head: [['Reg ID', 'Name', 'Mobile', 'Role', 'Status']],
        body: users.map(u => [u.registrationId, u.displayName, u.mobileNumber, u.role, u.status]),
      });
      doc.save("BVO_Users_Report.pdf");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-gray-900 uppercase">Admin Dashboard</h1>
          <div className="flex gap-2">
            <button onClick={() => downloadReport('excel')} className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700">
               <Download size={18} /> Excel
            </button>
            <button onClick={() => downloadReport('pdf')} className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-red-700">
               <Download size={18} /> PDF
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-4 custom-scrollbar">
          {[
            { id: 'settings', label: 'Settings', icon: Settings },
            { id: 'dashboard', label: 'Overview', icon: BarChart2 },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'plans', label: 'Plans', icon: CreditCard },
            { id: 'notifications', label: 'Alerts', icon: Bell },
            { id: 'banners', label: 'Banners', icon: LucideImage },
            { id: 'servicePhotos', label: 'Services', icon: ImageIcon },
            { id: 'moments', label: 'Moments', icon: Sparkles },
            { id: 'flex-download', label: 'Banners QR', icon: QrCode },
            { id: 'profile', label: 'My Account', icon: UserIcon },
            { id: 'database', label: 'System', icon: Database },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black whitespace-nowrap transition-all uppercase text-sm ${
                activeTab === tab.id ? 'bg-orange-600 text-white shadow-xl shadow-orange-100' : 'bg-white text-gray-400 hover:text-gray-900'
              }`}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 p-10">
          {loading ? (
             <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div></div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {activeTab === 'dashboard' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                      <Users className="text-blue-600 mb-4" />
                      <div className="text-4xl font-black">{users.length}</div>
                      <div className="text-xs font-bold text-gray-400 uppercase mt-1">Total Registered</div>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                      <BarChart2 className="text-orange-600 mb-4" />
                      <div className="text-4xl font-black">{bookings.length}</div>
                      <div className="text-xs font-bold text-gray-400 uppercase mt-1">Total Inquiries</div>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                      <CreditCard className="text-green-600 mb-4" />
                      <div className="text-4xl font-black">{subscriptions.length}</div>
                      <div className="text-xs font-bold text-gray-400 uppercase mt-1">Active Subscriptions</div>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                      <Settings className="text-purple-600 mb-4" />
                      <div className="text-4xl font-black">{plans.length}</div>
                      <div className="text-xs font-bold text-gray-400 uppercase mt-1">Plan Options</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                      <h4 className="text-lg font-black uppercase mb-6">User Types</h4>
                      <UserDistributionChart users={users} />
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                      <h4 className="text-lg font-black uppercase mb-6">Booking Flow</h4>
                      <BookingStatusChart bookings={bookings} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="space-y-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-xs font-black text-gray-400 uppercase border-b border-gray-100">
                          <th className="pb-4">UserDetails</th>
                          <th className="pb-4">Role</th>
                          <th className="pb-4">Status</th>
                          <th className="pb-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {users.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage).map(u => (
                          <tr key={u.uid} className="group hover:bg-gray-50/50">
                            <td className="py-6">
                              <div className="font-bold">{u.displayName}</div>
                              <div className="text-xs text-gray-400">{u.mobileNumber} | {u.registrationId}</div>
                            </td>
                            <td className="py-6">
                              <span className="text-[10px] font-black uppercase px-2 py-1 rounded-md bg-gray-100">{u.role}</span>
                            </td>
                            <td className="py-6">
                              <div className={`w-2 h-2 rounded-full ${u.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                            </td>
                            <td className="py-6 text-right">
                              <div className="flex justify-end gap-2">
                                <button onClick={() => toggleUserStatus(u.uid, u.status)} className="p-2 hover:bg-white rounded-xl transition-all shadow-sm">
                                  {u.status === 'active' ? <XCircle size={18} className="text-red-500" /> : <CheckCircle size={18} className="text-green-500" />}
                                </button>
                                <button onClick={() => deleteUser(u.uid)} className="p-2 hover:bg-white rounded-xl transition-all shadow-sm">
                                  <Trash2 size={18} className="text-gray-400 hover:text-red-600" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'flex-download' && (
                <FlexBannerDownloadView venues={adminVenues} services={adminServices} />
              )}
              
              {/* Add other tab contents as needed - keeping it concise for now */}
              {(['plans', 'notifications', 'banners', 'servicePhotos', 'moments', 'profile', 'settings', 'database'] as const).includes(activeTab as any) && (
                <div className="py-20 text-center">
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Detailed settings for {activeTab} go here.</p>
                  <p className="text-xs text-gray-300 mt-2">Refer to App.tsx for original full implementations of these panels.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminView;
