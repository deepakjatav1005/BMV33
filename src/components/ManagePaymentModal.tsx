import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { X, Clock, Plus, IndianRupee, Globe, CheckCircle, RefreshCw, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { db } from '../services/dataService';
import { cn, formatDateDDMMYYYY } from '../lib/utils';
import { Booking, BookingPayment } from '../types';

const ManagePaymentModal = ({ 
  isOpen, 
  onClose, 
  booking, 
  onUpdate,
  currentUserUid
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  booking: Booking | null,
  onUpdate: () => void,
  currentUserUid?: string
}) => {
  const [payments, setPayments] = useState<BookingPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [newPayment, setNewPayment] = useState({
    amount: 0,
    paymentMode: 'Cash' as any,
    paymentType: 'Regular' as any,
    paymentDate: format(new Date(), 'yyyy-MM-dd')
  });

  const fetchPayments = useCallback(async () => {
    if (!booking) return;
    setLoading(true);
    try {
      const { data, error } = await db.from('booking_payments')
        .select('*')
        .eq('booking_id', booking.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const mappedPayments: BookingPayment[] = (data || []).map((p: any) => ({
        id: p.id,
        bookingId: p.booking_id,
        amount: p.amount,
        paymentMode: p.payment_mode,
        paymentDate: p.payment_date,
        paymentType: p.payment_type || 'Regular',
        createdAt: p.created_at
      }));
      
      setPayments(mappedPayments);
    } catch (err) {
      console.error('Fetch payments error:', err);
      toast.error('Failed to fetch payment records');
    } finally {
      setLoading(false);
    }
  }, [booking?.id]);

  useEffect(() => {
    if (isOpen && booking) {
      fetchPayments();
    }
  }, [isOpen, booking?.id, fetchPayments]);

  const handleRegisterPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;
    if (newPayment.amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const today = format(new Date(), 'yyyy-MM-dd');
    if (newPayment.paymentDate < today) {
      toast.error('Back date entry not allowed');
      return;
    }

    const targetAmount = Number(booking.updatedAmount || booking.totalAmount || 0);
    const currentTotal = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const inputAmount = parseFloat(newPayment.amount.toString()) || 0;

    const pending = targetAmount - currentTotal;
    if (pending <= 0.01 && targetAmount > 0) {
      toast.error('Payment already completed. Cannot add more transactions.');
      return;
    }

    if (currentTotal + inputAmount > targetAmount + 0.9) {
      toast.error(`Overpayment not allowed. Due amount is ₹${Math.max(0, targetAmount - currentTotal).toLocaleString()}`);
      return;
    }

    setLoading(true);
    try {
      const { error: payError } = await db.from('booking_payments').insert([{
        booking_id: booking.id,
        amount: inputAmount,
        payment_mode: newPayment.paymentMode,
        payment_date: newPayment.paymentDate,
        payment_type: newPayment.paymentType
      }]);

      if (payError) throw payError;

      const { data: latestPayments, error: fetchErr } = await db.from('booking_payments')
        .select('amount')
        .eq('booking_id', booking.id);
      
      if (fetchErr) throw fetchErr;

      const totalCredited = (latestPayments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      const finalTargetAmount = Number(booking.updatedAmount || booking.totalAmount || 0);
      
      const isNowPaid = totalCredited >= (finalTargetAmount - 0.1) && finalTargetAmount > 0;
      const updateData: any = {
        advance_amount: totalCredited,
        payment_status: isNowPaid ? 'Paid' : 'Pending',
        is_locked: true 
      };

      if (isNowPaid && booking.status !== 'cancelled') {
        updateData.status = 'completed';
      }

      await db.from('bookings').update(updateData).eq('id', booking.id);

      toast.success('Payment registered successfully');
      setIsRegistering(false);
      setNewPayment({
        amount: 0,
        paymentMode: 'Cash',
        paymentType: 'Regular',
        paymentDate: format(new Date(), 'yyyy-MM-dd')
      });
      if (onUpdate) onUpdate(); 
      await fetchPayments();
    } catch (err) {
      console.error('Register payment error:', err);
      toast.error('Failed to register payment');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !booking) return null;

  const totalAmount = Number(booking.updatedAmount || booking.totalAmount || 0);
  const totalRegular = (payments || []).filter(p => p.paymentType === 'Regular').reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalAdvance = (payments || []).filter(p => p.paymentType === 'Advance').reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalDiscount = (payments || []).filter(p => p.paymentType === 'Discount').reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  
  const totalPaid = totalRegular + totalAdvance;
  const bookingReceived = totalPaid + totalDiscount;
  const pendingAmount = Math.max(0, totalAmount - bookingReceived);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Payment Records</h3>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-gray-500 font-medium">{booking.partyName || booking.visitorName} • {booking.targetName}</p>
                {booking.isLocked && (
                  <span className="bg-red-100 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-tight">
                    <Lock size={10} /> Locked
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 shadow-sm">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-1">Booking Amount</span>
              <span className="text-2xl font-black text-blue-900">₹{(totalAmount || 0).toLocaleString()}</span>
            </div>
            <div className="bg-green-50/50 p-6 rounded-3xl border border-green-100 shadow-sm">
              <span className="text-[10px] font-black text-green-600 uppercase tracking-widest block mb-1">Received Amount</span>
              <span className="text-2xl font-black text-green-900">₹{(bookingReceived || 0).toLocaleString()}</span>
            </div>
            <div className="bg-red-50/50 p-6 rounded-3xl border border-red-100 shadow-sm">
              <span className="text-[10px] font-black text-red-600 uppercase tracking-widest block mb-1">Pending Amount</span>
              <span className="text-2xl font-black text-red-900">₹{Math.max(0, pendingAmount).toLocaleString()}</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-bold text-gray-900 flex items-center tracking-tight">
                <Clock className="mr-2 text-orange-600" size={20} />
                Transaction History
              </h4>
              {pendingAmount > 0 && booking.status !== 'completed' && booking.status !== 'paid' && !isRegistering && currentUserUid === booking.ownerId && (
                <button 
                  onClick={() => setIsRegistering(true)}
                  className="px-6 py-2 bg-orange-600 text-white rounded-xl font-bold text-sm hover:bg-orange-700 transition-all flex items-center shadow-lg shadow-orange-100"
                >
                  <Plus size={16} className="mr-2" />
                  Register Payment
                </button>
              )}
            </div>

            {isRegistering && (
              <motion.form 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleRegisterPayment}
                className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-200 mb-8 space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Paid Amount (₹)</label>
                    <input 
                      required
                      type="number"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 font-bold"
                      value={newPayment.amount || ''}
                      onChange={(e) => setNewPayment({...newPayment, amount: parseFloat(e.target.value) || 0})}
                      max={pendingAmount}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Payment Type</label>
                    <select 
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 font-bold"
                      value={newPayment.paymentType}
                      onChange={(e) => {
                        const type = e.target.value as any;
                        setNewPayment({
                          ...newPayment, 
                          paymentType: type,
                          paymentMode: type === 'Discount' ? 'Adjustment' : 'Cash'
                        });
                      }}
                    >
                      <option value="Regular">Regular Payment</option>
                      <option value="Advance">Advance Payment</option>
                      <option value="Discount">Discount / Adj.</option>
                    </select>
                  </div>
                  {newPayment.paymentType !== 'Discount' && (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Payment Mode</label>
                      <select 
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 font-bold"
                        value={newPayment.paymentMode}
                        onChange={(e) => setNewPayment({...newPayment, paymentMode: e.target.value as any})}
                      >
                        <option value="Cash">Cash</option>
                        <option value="Online">Online</option>
                        <option value="PhonePe">PhonePe</option>
                        <option value="GPay">GPay</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Payment Date</label>
                    <input 
                      required
                      type="date"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 font-bold"
                      value={newPayment.paymentDate}
                      onChange={(e) => setNewPayment({...newPayment, paymentDate: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button 
                    type="button"
                    onClick={() => setIsRegistering(false)}
                    className="flex-1 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-100"
                  >
                    Save Entry
                  </button>
                </div>
              </motion.form>
            )}

            <div className="space-y-4">
              {loading && !isRegistering && (
                <div className="flex justify-center p-8">
                  <RefreshCw className="animate-spin text-orange-600" size={32} />
                </div>
              )}
              
              {!loading && payments.length === 0 ? (
                <div className="text-center p-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                     <IndianRupee size={24} />
                  </div>
                  <p className="text-gray-500 font-medium">No payment records found yet.</p>
                </div>
              ) : (
                payments.map(p => (
                  <div key={p.id} className="flex justify-between items-center p-5 bg-white border border-gray-100 rounded-2xl hover:shadow-md transition-all group">
                    <div className="flex items-center space-x-5">
                      <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                        {p.paymentMode === 'Online' || p.paymentMode === 'PhonePe' || p.paymentMode === 'GPay' ? <Globe size={28} /> : <IndianRupee size={28} />}
                      </div>
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          <span className="font-black text-xl text-gray-900">₹{(Number(p.amount) || 0).toLocaleString()}</span>
                          <span className={cn(
                            "text-[10px] uppercase font-black px-2.5 py-1 rounded-full tracking-wider",
                            p.paymentType === 'Discount' ? "bg-purple-100 text-purple-600" : 
                            p.paymentType === 'Advance' ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"
                          )}>
                            {p.paymentType || 'Regular'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                          {p.paymentMode} • {formatDateDDMMYYYY(p.paymentDate)}
                        </p>
                      </div>
                    </div>
                    {pendingAmount === 0 && p === payments[0] && (
                       <div className="flex items-center text-green-600 font-black text-[10px] uppercase tracking-widest bg-green-50 px-4 py-2 rounded-full border border-green-100 shadow-sm">
                         <CheckCircle size={14} className="mr-2" strokeWidth={3} />
                         Fully Paid
                       </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-gray-100 bg-gray-50/50">
          <button 
            onClick={onClose}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-gray-200 text-lg flex items-center justify-center"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ManagePaymentModal;
