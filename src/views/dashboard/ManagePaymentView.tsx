import React, { useState, useMemo } from 'react';
import { IndianRupee, Calendar, Lock, Unlock, Edit2, Plus, CheckCircle, Download } from 'lucide-react';
import { db } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Booking, UserProfile, UserSubscription } from '../../types';
import { formatDateDDMMYYYY, cn } from '../../lib/utils';
import ManagePaymentModal from '../../components/ManagePaymentModal';
import { generateInvoice } from '../../services/invoiceService';

interface ManagePaymentViewProps {
  user: any;
  profile: UserProfile | null;
  bookings: Booking[];
  onUpdate?: () => void;
  globalSettings: any;
  activeSubscription?: UserSubscription | null;
  onUpgrade?: () => void;
}

const ManagePaymentView: React.FC<ManagePaymentViewProps> = ({ 
  user, 
  profile, 
  bookings, 
  onUpdate, 
  globalSettings,
  activeSubscription,
  onUpgrade
}) => {
  const [dateFilter, setDateFilter] = useState<string>('');
  const [isAmountModalOpen, setIsAmountModalOpen] = useState(false);
  const [isPaymentRecordModalOpen, setIsPaymentRecordModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [newAmount, setNewAmount] = useState(0);
  const [editableExtraServices, setEditableExtraServices] = useState<any[]>([]);

  const filteredBookings = useMemo(() => bookings.filter(b => {
    // Show confirmed/paid bookings that are not completed
    if (b.status === 'cancelled' || b.status === 'completed') return false;
    
    // Only show if user is owner/admin or it belongs to them
    if (profile?.role !== 'admin' && b.ownerId !== user?.uid) return false;

    const matchesDate = !dateFilter || b.eventDate === dateFilter;
    return matchesDate;
  }), [bookings, dateFilter, user?.uid, profile?.role]);

  const sortedBookings = useMemo(() => [...filteredBookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [filteredBookings]);

  const handleUpdateAmount = async () => {
    if (!selectedBooking) return;
    
    // Lock if payment already exists
    if (selectedBooking.payments && selectedBooking.payments.length > 0) {
      toast.error('Amount cannot be updated after first payment transaction');
      return;
    }

    const { error } = await db.from('bookings').update({ 
      updated_amount: newAmount,
      extra_services: editableExtraServices,
      is_invoice_generated: false 
    }).eq('id', selectedBooking.id);

    if (!error) {
      toast.success('Booking amount updated');
      setIsAmountModalOpen(false);
      setSelectedBooking(null);
      if (onUpdate) onUpdate();
    } else {
      toast.error('Failed to update amount');
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
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Manage Payment</h2>
          <p className="text-sm text-gray-500 mt-1">Update amounts and record transactions for locked bookings</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <input 
            type="date" 
            className="flex-1 md:flex-none px-2 py-2 md:px-3 md:py-2 bg-gray-50 border border-gray-200 rounded-xl text-[10px] md:text-sm font-bold focus:ring-2 focus:ring-orange-500"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {sortedBookings.map(b => {
           const subTotal = Number(b.updatedAmount || b.totalAmount || 0);
           const paymentsTotal = (b.payments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
           const pendingAmount = Math.max(0, subTotal - paymentsTotal);

           return (
          <div key={b.id} className="bg-gray-50 rounded-2xl md:rounded-3xl p-3 md:p-6 border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-all">
            <div className="w-full">
              <div className="flex items-center space-x-2 mb-1 flex-wrap gap-y-1">
                <span className="font-bold text-sm md:text-lg truncate max-w-[160px] md:max-w-none">{b.targetName}</span>
                <span className="px-2 py-0.5 rounded-full text-[7px] md:text-[10px] font-bold uppercase bg-orange-100 text-orange-700">
                  LOCKED
                </span>
              </div>
              <div className="flex flex-wrap items-center text-[9px] md:text-sm text-gray-500 gap-1.5 md:gap-x-4 md:gap-y-2 mt-2">
                <span className="flex items-center bg-white px-2 py-1 md:px-3 md:py-1 rounded-lg border border-gray-100 shadow-sm"><Calendar size={10} className="mr-1 text-orange-600" /> {formatDateDDMMYYYY(b.eventDate)}</span>
                <span className="flex items-center bg-white px-2 py-1 md:px-3 md:py-1 rounded-lg border border-gray-100 shadow-sm"><IndianRupee size={10} className="mr-1 text-orange-600" /> Total: {subTotal.toLocaleString()}</span>
                <span className="flex items-center bg-white px-2 py-1 md:px-3 md:py-1 rounded-lg border border-green-100 text-green-700 shadow-sm">Paid: {paymentsTotal.toLocaleString()}</span>
                <span className="flex items-center bg-orange-50 text-orange-700 px-2 py-1 md:px-3 md:py-1 rounded-lg border border-orange-100 font-bold">Pending: {pendingAmount.toLocaleString()}</span>
                {b.isLocked && <span className="flex items-center bg-red-50 text-red-700 px-2 py-1 rounded-lg border border-red-100 font-black"><Lock size={10} className="mr-1" /> LOCKED</span>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <button 
                onClick={() => handleToggleLock(b.id, !b.isLocked)}
                className={cn(
                  "flex-1 md:flex-none justify-center px-4 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center space-x-2 transition-all border shadow-sm",
                  b.isLocked 
                    ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100" 
                    : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                )}
              >
                {b.isLocked ? <Lock size={16} /> : <Unlock size={16} />}
                <span>{b.isLocked ? 'Unlock' : 'Lock'}</span>
              </button>
              <button 
                disabled={b.payments && b.payments.length > 0}
                onClick={() => {
                  if (b.payments && b.payments.length > 0) {
                    toast.error('Amount cannot be updated after first payment transaction');
                    return;
                  }
                  setSelectedBooking(b);
                  setNewAmount(b.updatedAmount || b.totalAmount);
                  setEditableExtraServices(b.extra_services || []);
                  setIsAmountModalOpen(true);
                }}
                className={cn(
                  "flex-1 md:flex-none justify-center px-4 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center space-x-2 transition-all border shadow-sm",
                  (b.payments && b.payments.length > 0) ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" : "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100"
                )}
              >
                <Edit2 size={16} />
                <span>Update Amount</span>
              </button>
              <button 
                disabled={pendingAmount < 1}
                onClick={() => {
                  setSelectedBooking(b);
                  setIsPaymentRecordModalOpen(true);
                }}
                className={cn(
                  "flex-1 md:flex-none justify-center px-4 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center space-x-2 transition-all shadow-lg",
                  pendingAmount < 1 
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed shadow-none" 
                    : "bg-green-600 text-white hover:bg-green-700 shadow-green-100"
                )}
              >
                {pendingAmount < 1 ? <CheckCircle size={16} /> : <Plus size={16} />}
                <span>{pendingAmount < 1 ? 'Fully Paid' : 'Add Payment'}</span>
              </button>
              <button 
                onClick={async () => {
                  try {
                    const pdfBlob = await generateInvoice(b, 0, profile, bookings, globalSettings);
                    const url = URL.createObjectURL(pdfBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `Invoice-${b.id.substring(0, 8).toUpperCase()}.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    toast.success('Invoice downloaded successfully');
                  } catch (err) {
                    toast.error('Failed to generate invoice');
                  }
                }}
                className="flex-1 md:flex-none justify-center px-4 py-2 bg-purple-600 text-white rounded-xl text-xs md:text-sm font-bold flex items-center space-x-2 hover:bg-purple-700 shadow-lg shadow-purple-100"
              >
                <Download size={16} />
                <span>Invoice</span>
              </button>
            </div>
          </div>
        )})}
        {sortedBookings.length === 0 && <p className="text-gray-500 text-center py-10">No locked bookings with pending payments found.</p>}
      </div>

      {isAmountModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">Update Booking Amount</h3>
            <div className="space-y-6">
              {editableExtraServices.length > 0 && (
                <div className="space-y-3">
                  <label className="block text-xs font-black text-orange-600 uppercase tracking-widest">Update Amenities Rates</label>
                  <div className="space-y-2">
                    {editableExtraServices.map((service, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="flex-1 text-xs font-bold text-gray-700 uppercase truncate">{service.name}</span>
                        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-1">
                          <span className="text-[10px] font-black text-gray-400">₹</span>
                          <input 
                            type="number" 
                            className="w-20 text-xs font-black text-orange-600 focus:outline-none"
                            value={service.amount}
                            onChange={(e) => {
                              const newVal = parseFloat(e.target.value) || 0;
                              const updated = [...editableExtraServices];
                              updated[idx] = { ...updated[idx], amount: newVal };
                              setEditableExtraServices(updated);
                              
                              const newExtrasTotal = updated.reduce((sum, s) => sum + s.amount, 0);
                              const oldExtrasTotal = editableExtraServices.reduce((sum, s) => sum + s.amount, 0);
                              setNewAmount(prev => prev - oldExtrasTotal + newExtrasTotal);
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-bold mb-1 text-gray-700">Final Total Amount (INR)</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 font-bold text-orange-600" 
                  value={newAmount} 
                  onChange={e => setNewAmount(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="flex space-x-4">
                <button onClick={() => setIsAmountModalOpen(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold">Cancel</button>
                <button onClick={handleUpdateAmount} className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-bold">Update</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isPaymentRecordModalOpen && (
        <ManagePaymentModal 
          isOpen={isPaymentRecordModalOpen}
          onClose={() => setIsPaymentRecordModalOpen(false)}
          booking={selectedBooking}
          currentUserUid={user?.uid}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
};

export default ManagePaymentView;
