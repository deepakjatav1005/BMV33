import React, { useState, useMemo } from 'react';
import { Calendar, User, IndianRupee, Music, Plus, Edit2, Trash2, ShieldCheck, Search, Building2, UserCircle, MapPin, Phone } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { db } from '../../lib/supabase';
import { cn, formatDateDDMMYYYY, formatTime12h, generateUUID } from '../../lib/utils';
import { Booking, UserProfile, Venue, ServiceProvider, UserSubscription } from '../../types';

const ManuallyBookingView = ({ 
  user, 
  profile, 
  bookings, 
  venues, 
  services, 
  onUpdate,
  globalSettings,
  activeSubscription,
  onUpgrade
}: { 
  user: any, 
  profile: UserProfile | null, 
  bookings: Booking[], 
  venues: Venue[], 
  services: ServiceProvider[], 
  onUpdate?: () => void,
  globalSettings?: any,
  activeSubscription?: UserSubscription | null,
  onUpgrade?: () => void
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState<Partial<Booking>>({
    partyName: '',
    visitorMobile: '',
    partyAddress: '',
    eventDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    eventType: '',
    totalAmount: 0,
    advance_amount: 0,
    targetId: '',
    targetType: 'venue' as 'venue' | 'service',
    targetName: '',
    status: 'pending'
  });

  const filteredBookings = useMemo(() => bookings.filter(b => {
    if (!b.isManual) return false;
    if (profile?.role !== 'admin' && b.ownerId !== user?.uid) return false;
    
    const matchesSearch = (b.partyName || b.visitorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (b.visitorMobile || '').includes(searchTerm);
    return matchesSearch;
  }), [bookings, profile?.role, user?.uid, searchTerm]);

  const sortedBookings = useMemo(() => [...filteredBookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [filteredBookings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (globalSettings?.subscriptionEnabled === true && (!activeSubscription || activeSubscription.status !== 'active')) {
      if (onUpgrade) onUpgrade();
      else toast.error('Premium feature: Please get a valid subscription');
      return;
    }

    setLoading(true);
    try {
      const target = formData.targetType === 'venue' 
        ? venues.find(v => v.id === formData.targetId) 
        : services.find(s => s.id === formData.targetId);

      const bookingId = generateUUID();
      const { error } = await db.from('bookings').insert([{
        id: bookingId,
        user_id: user?.uid,
        owner_id: user?.uid,
        target_id: formData.targetId,
        target_type: formData.targetType,
        target_name: target?.name || '',
        party_name: formData.partyName,
        visitor_name: formData.partyName,
        visitor_mobile: formData.visitorMobile,
        party_address: formData.partyAddress,
        event_date: formData.eventDate,
        end_date: formData.endDate,
        start_time: formData.startTime,
        end_time: formData.endTime,
        event_type: formData.eventType,
        total_amount: formData.totalAmount,
        advance_amount: formData.advance_amount,
        status: 'pending',
        is_manual: true,
        is_locked: false,
        payment_status: 'Pending',
        created_at: new Date().toISOString()
      }]);

      if (error) throw error;

      // Handle advance payment record if provided
      if (formData.advance_amount && formData.advance_amount > 0) {
        await db.from('booking_payments').insert([{
          id: generateUUID(),
          booking_id: bookingId,
          amount: formData.advance_amount,
          payment_mode: 'Cash',
          payment_date: formData.eventDate,
          payment_type: 'Advance',
          transaction_id: 'ADV-' + bookingId.substring(0, 8).toUpperCase(),
          created_at: new Date().toISOString()
        }]);
      }

      toast.success('Manual booking created');
      setIsModalOpen(false);
      setFormData({
        partyName: '',
        visitorMobile: '',
        partyAddress: '',
        eventDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        eventType: '',
        totalAmount: 0,
        advance_amount: 0,
        targetId: '',
        targetType: 'venue',
        targetName: '',
        status: 'pending'
      });
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error('Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await db.from('bookings').delete().eq('id', id);
      if (error) throw error;
      toast.success('Booking deleted');
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error('Failed to delete booking');
    }
  };

  return (
    <div className="space-y-6 md:space-y-10 px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="w-full">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 truncate">Bookings Register</h2>
          <p className="text-sm text-gray-500 mt-1">Manual entry for offline and direct bookings</p>
        </div>
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search bookings..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="whitespace-nowrap bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 hover:bg-orange-700 shadow-lg shadow-orange-100"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add Entry</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {sortedBookings.map(b => (
          <div key={b.id} className="bg-gray-50 rounded-2xl md:rounded-3xl p-3 md:p-6 border border-gray-100 group relative">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="w-full">
                  <div className="flex items-center space-x-2 mb-1 flex-wrap gap-y-1">
                    <span className="font-bold text-sm md:text-lg text-gray-900 truncate max-w-[200px] md:max-w-none uppercase">{b.partyName || b.visitorName}</span>
                    <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-[8px] md:text-[10px] font-black tracking-widest uppercase">Manual</span>
                  </div>
                  <div className="flex flex-wrap items-center text-[10px] md:text-sm text-gray-500 gap-2 md:gap-x-6 md:gap-y-2 mt-2">
                    <span className="flex items-center bg-white px-2 py-1 rounded-lg border shadow-sm"><Calendar size={12} className="mr-1.5 text-orange-600" /> {formatDateDDMMYYYY(b.eventDate)}</span>
                    <span className="flex items-center bg-white px-2 py-1 rounded-lg border shadow-sm"><UserCircle size={12} className="mr-1.5 text-orange-600" /> {b.visitorMobile}</span>
                    <span className="flex items-center bg-white px-2 py-1 rounded-lg border shadow-sm"><Building2 size={12} className="mr-1.5 text-orange-600" /> {b.targetName?.split('(')[0].trim()}</span>
                    <span className="flex items-center bg-orange-50 text-orange-700 px-2 py-1 rounded-lg border border-orange-100 font-bold"><IndianRupee size={12} className="mr-1.5" /> {Number(b.updatedAmount || b.totalAmount || 0).toLocaleString()}</span>
                  </div>
                  {b.partyAddress && (
                    <div className="mt-3 flex items-start text-[9px] md:text-xs text-gray-400">
                      <MapPin size={12} className="mr-1.5 mt-0.5 shrink-0" />
                      <span className="uppercase">{b.partyAddress}</span>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2 w-full md:w-auto">
                   <button onClick={() => handleDelete(b.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors bg-white border border-red-50 shadow-sm">
                    <Trash2 size={20} />
                  </button>
                </div>
             </div>
          </div>
        ))}
        {sortedBookings.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
             <Plus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
             <p className="text-gray-500 font-bold">No manual bookings records found.</p>
             <p className="text-gray-400 text-sm mt-1">Add your offline bookings here to manage payments and generate reports.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-[2.5rem] p-6 md:p-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Manual Booking entry</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                <X size={28} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Business / Service</label>
                  <select 
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 appearance-none font-bold text-gray-800"
                    value={formData.targetId}
                    onChange={(e) => {
                      const id = e.target.value;
                      const type = venues.find(v => v.id === id) ? 'venue' : 'service';
                      setFormData({...formData, targetId: id, targetType: type});
                    }}
                  >
                    <option value="">Select your item</option>
                    <optgroup label="Venues">
                      {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </optgroup>
                    <optgroup label="Services">
                      {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Customer Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Enter Party Full Name"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 font-bold uppercase"
                    value={formData.partyName}
                    onChange={(e) => setFormData({...formData, partyName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      required
                      type="tel" 
                      placeholder="Customer Mobile"
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 font-bold"
                      value={formData.visitorMobile}
                      onChange={(e) => setFormData({...formData, visitorMobile: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Event Type</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Wedding, Birthday"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 font-bold uppercase"
                    value={formData.eventType}
                    onChange={(e) => setFormData({...formData, eventType: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Event Start Date</label>
                  <input 
                    required
                    type="date" 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 font-bold"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Event End Date (Optional)</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 font-bold"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Customer Address</label>
                  <textarea 
                    rows={2}
                    placeholder="Permanent or Event Address"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 font-bold uppercase"
                    value={formData.partyAddress}
                    onChange={(e) => setFormData({...formData, partyAddress: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Total Package Deal (₹)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-600" size={16} />
                    <input 
                      required
                      type="number" 
                      placeholder="Total Amount"
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 font-black text-orange-600 text-lg"
                      value={formData.totalAmount}
                      onChange={(e) => setFormData({...formData, totalAmount: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div>
                   <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Advance Received (₹)</label>
                   <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600" size={16} />
                    <input 
                      type="number" 
                      placeholder="Advance Amount"
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 font-black text-green-600 text-lg"
                      value={formData.advance_amount}
                      onChange={(e) => setFormData({...formData, advance_amount: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 pt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                >
                  Discard
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 py-4 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-orange-700 shadow-xl shadow-orange-100 transition-all disabled:opacity-50"
                >
                  {loading ? 'Registering...' : 'Complete Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManuallyBookingView;
