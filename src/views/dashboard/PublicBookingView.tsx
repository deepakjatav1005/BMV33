import React, { useState, useMemo } from 'react';
import { Calendar, User, IndianRupee, Music, Check, X, Lock, Unlock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { db } from '../../lib/supabase';
import { cn, formatDateDDMMYYYY, formatTime12h } from '../../lib/utils';
import { Booking, UserProfile, UserSubscription } from '../../types';

const PublicBookingView = ({ 
  user, 
  profile, 
  bookings, 
  onUpdate,
  globalSettings,
  activeSubscription,
  onUpgrade
}: { 
  user: any, 
  profile: UserProfile | null, 
  bookings: Booking[], 
  onUpdate?: () => void,
  globalSettings?: any,
  activeSubscription?: UserSubscription | null,
  onUpgrade?: () => void
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  const filteredBookings = useMemo(() => bookings.filter(b => {
    // 1. Separate Sent vs Received
    if (profile?.role === 'user') {
      // Regular users only see their own sent bookings
      if (b.userId !== user?.uid) return false;
    } else if (profile?.role !== 'admin') {
      // Providers/Owners see their received public bookings AND sent public bookings
      if (b.ownerId !== user?.uid && b.userId !== user?.uid) return false;
    }

    // 2. Hide manual bookings from this view (they have their own tab)
    if (b.isManual) return false;
    
    // 3. Optional: Hide if completed (or leave visible for history)
    if (b.status === 'completed') return false;

    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'pending' && b.status === 'pending') ||
                         (statusFilter === 'confirmed' && (b.status === 'confirmed' || b.status === 'approved' || b.status === 'paid')) ||
                         (statusFilter === 'cancelled' && b.status === 'cancelled');
    const matchesDate = !dateFilter || b.eventDate === dateFilter;
    
    return matchesStatus && matchesDate;
  }), [bookings, statusFilter, dateFilter, profile?.role, user?.uid]);

  const sortedBookings = useMemo(() => [...filteredBookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [filteredBookings]);
  
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isCallSatisfied, setIsCallSatisfied] = useState(false);

  const handleStatus = async (id: string, status: string) => {
    if (status === 'confirmed') {
      if (!isCallSatisfied) {
        toast.error('Checking call confirmation is required');
        return;
      }
    }
    
    try {
      const { error } = await db.from('bookings').update({ status }).eq('id', id);
      if (error) throw error;
      
      toast.success('Status updated to ' + status);
      setIsAcceptModalOpen(false);
      setIsCallSatisfied(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Update status error:', err);
      toast.error('Failed to update booking status');
    }
  };

  const handleToggleLock = async (id: string, isLocked: boolean) => {
    if (isLocked && globalSettings?.subscriptionEnabled === true && (!activeSubscription || activeSubscription.status !== 'active')) {
      if (onUpgrade) onUpgrade();
      else toast.error('Premium feature: Please get a valid subscription');
      return;
    }
    try {
      const { error } = await db.from('bookings').update({ is_locked: isLocked ? 1 : 0 }).eq('id', id);
      if (error) throw error;
      toast.success(isLocked ? 'Booking Locked' : 'Booking Unlocked');
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error('Failed to update lock status');
    }
  };

  return (
    <div className="space-y-6 md:space-y-10 px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="w-full">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 truncate">{profile?.role === 'user' ? 'My Bookings' : 'Public Booking'}</h2>
          <p className="text-sm text-gray-500 mt-1">{profile?.role === 'user' ? 'View and track your booking requests' : 'Accept and manage public booking requests'}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select 
            className="flex-1 md:flex-none px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[10px] md:text-sm font-bold focus:ring-2 focus:ring-orange-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Accepted</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input 
            type="date" 
            className="flex-1 md:flex-none px-2 py-2 md:px-3 md:py-2 bg-gray-50 border border-gray-200 rounded-xl text-[10px] md:text-sm font-bold focus:ring-2 focus:ring-orange-500"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {sortedBookings.map(b => (
          <div key={b.id} className="bg-gray-50 rounded-2xl md:rounded-3xl p-3 md:p-6 border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="w-full">
              <div className="flex items-center space-x-2 mb-1 flex-wrap gap-y-1">
                <span className="font-bold text-sm md:text-lg truncate max-w-[160px] md:max-w-none">{b.visitorName || b.partyName}</span>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[7px] md:text-[10px] font-bold uppercase",
                  b.status === 'confirmed' ? "bg-green-100 text-green-700" :
                  b.status === 'pending' ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"
                )}>
                  {b.status === 'confirmed' ? 'Accepted' : b.status}
                </span>
                {b.isLocked && (
                  <span className="px-2 py-0.5 rounded-full text-[7px] md:text-[10px] font-bold uppercase bg-red-100 text-red-700 flex items-center gap-1">
                    <Lock size={10} /> LOCKED
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center text-[9px] md:text-sm text-gray-500 gap-1.5 md:gap-x-4 md:gap-y-2 mt-2">
                <span className="flex items-center"><Calendar size={12} className="mr-1 text-orange-600" /> {formatDateDDMMYYYY(b.eventDate)}</span>
                <span className="flex items-center">
                  <User size={12} className="mr-1 text-orange-600" /> 
                  {globalSettings?.subscriptionEnabled === true && (!activeSubscription || activeSubscription.status !== 'active') 
                    ? (b.visitorMobile ? `******${b.visitorMobile.slice(-4)}` : 'Hidden')
                    : b.visitorMobile
                  }
                </span>
                <span className="flex items-center bg-orange-50 text-orange-700 px-2 py-1 rounded-lg border border-orange-100 font-bold"><IndianRupee size={12} className="mr-1" /> {Number(b.updatedAmount || b.totalAmount || 0).toLocaleString()}</span>
                {b.eventType && <span className="flex items-center px-2 py-1 bg-white border border-gray-100 rounded-lg"><Music size={12} className="mr-1 text-orange-600" /> {b.eventType}</span>}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {b.status === 'pending' && (
                <button 
                  onClick={() => {
                    if (globalSettings?.subscriptionEnabled === true && (!activeSubscription || activeSubscription.status !== 'active')) {
                      if (onUpgrade) onUpgrade();
                      else toast.error('Premium feature: Please get a valid subscription');
                      return;
                    }
                    setSelectedBooking(b);
                    setIsAcceptModalOpen(true);
                  }}
                  className="flex-1 md:flex-none justify-center px-4 py-2 bg-green-600 text-white rounded-xl text-xs md:text-sm font-bold flex items-center space-x-2 border border-green-700 shadow-md"
                >
                  <Check size={16} />
                  <span>Accept</span>
                </button>
              )}
              {b.status === 'pending' && (
                <button 
                  onClick={() => handleStatus(b.id, 'cancelled')}
                  className="flex-1 md:flex-none justify-center px-4 py-2 bg-white text-red-600 border border-red-100 rounded-xl text-xs md:text-sm font-bold flex items-center space-x-2"
                >
                  <X size={16} />
                  <span>Reject</span>
                </button>
              )}

              {/* Lock/Unlock Toggle */}
              {(b.status === 'confirmed' || b.status === 'approved' || b.status === 'paid') && (b.ownerId === user?.uid || profile?.role === 'admin') && (
                <button
                  onClick={() => handleToggleLock(b.id, !b.isLocked)}
                  className={cn(
                    "flex-1 md:flex-none justify-center px-4 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center space-x-2 transition-all border shadow-sm",
                    b.isLocked 
                      ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100" 
                      : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                  )}
                >
                  {b.isLocked ? <Lock size={16} className="text-red-600" /> : <Unlock size={16} className="text-green-600" />}
                  <span>{b.isLocked ? 'Unlock' : 'Lock'}</span>
                </button>
              )}
            </div>
          </div>
        ))}
        {sortedBookings.length === 0 && <p className="text-gray-500 text-center py-10">No public bookings found.</p>}
      </div>

      {isAcceptModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-gray-100">
            <h3 className="text-2xl font-black mb-6 text-gray-900 tracking-tight">Confirm Booking</h3>
            <div className="space-y-6">
              <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                <p className="text-sm text-orange-800">Please ensure you have discussed the event details and pricing with the visitor before confirming.</p>
              </div>
              
              <label className="flex items-start space-x-3 cursor-pointer group">
                <div className="mt-1">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    checked={isCallSatisfied}
                    onChange={(e) => setIsCallSatisfied(e.target.checked)}
                  />
                </div>
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  I have connected with the visitor via call and I am satisfied to proceed with this booking request.
                </span>
              </label>

              <div className="flex space-x-4">
                <button 
                  onClick={() => {
                    setIsAcceptModalOpen(false);
                    setIsCallSatisfied(false);
                  }} 
                  className="flex-1 py-3 bg-gray-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => selectedBooking && handleStatus(selectedBooking.id, 'confirmed')} 
                  disabled={!isCallSatisfied}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-bold transition-all",
                    isCallSatisfied ? "bg-orange-600 text-white shadow-lg shadow-orange-200" : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  )}
                >
                  Confirm Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicBookingView;
