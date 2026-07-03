  /**
   * @license
   * SPDX-License-Identifier: Apache-2.0
   */
  
  import React, { Component, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useNavigate, 
  useParams,
  useSearchParams,
  useLocation,
  Navigate
} from 'react-router-dom';
import { 
  Bell,
  Search, 
  RefreshCw,
  MapPin, 
  Calendar, 
  Users, 
  Star, 
  Heart, 
  Menu, 
  X, 
  Plus, 
  Settings, 
  LogOut, 
  User as UserIcon, 
  Home, 
  Music, 
  Utensils, 
  Camera, 
  Tent, 
  CheckCircle, 
  Clock, 
  Shield,
  ShieldCheck,
  Lock,
  Unlock,
  Database,
  Activity,
  FileText,
  BarChart2,
  AlertCircle,
  CloudOff,
  AlertTriangle,
  IndianRupee,
  ChevronRight,
  ChevronDown,
  Filter,
  Trash2,
  Edit2,
  Image as LucideImage,
  Image as ImageIcon,
  Loader,
  Check,
  Phone,
  Upload,
  Palette,
  Sparkles,
  Briefcase,
  CreditCard,
  ArrowRight,
  Download,
  RotateCcw,
  XCircle,
  Info,
  Shirt,
  Gem,
  Building2,
  UserPlus,
  LogIn,
  UtensilsCrossed,
  Music2,
  Plane,
  Pizza,
  Video,
  User,
  Tag,
  MessageSquare,
  Play,
  Flower2,
  LayoutDashboard,
  Lightbulb,
  ChefHat,
  PersonStanding,
  HelpingHand,
  Layout,
  Users2,
  Globe,
  MessageCircle,
  Share2,
  ArrowLeft,
  QrCode,
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast, Toaster } from 'react-hot-toast';
import { format } from 'date-fns';

// --- Custom Brand Icons ---
export const FacebookIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

export const YoutubeIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export const WhatsAppIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);
import { calculateDistance as calculateGeoDistance } from './lib/utils';

const LazyLocationPicker = React.lazy(() => import('./components/LocationPicker'));
const LocationPicker = (props: any) => (
  <React.Suspense fallback={<div className="h-[350px] bg-gray-50 rounded-3xl animate-pulse flex items-center justify-center text-gray-400 font-bold text-sm">Loading location selector...</div>}>
    <LazyLocationPicker {...props} />
  </React.Suspense>
);

const LazyLocationDisplay = React.lazy(() => import('./components/LocationDisplay'));
const LocationDisplay = (props: any) => (
  <React.Suspense fallback={<div className="h-[300px] bg-gray-50 rounded-3xl animate-pulse flex items-center justify-center text-gray-400 font-bold text-sm">Loading map view...</div>}>
    <LazyLocationDisplay {...props} />
  </React.Suspense>
);

const VenueOwnerJoinSection = React.lazy(() => import('./components/VenueOwnerJoinSection'));
const VenueOwnerJoinSectionWithSuspense = (props: any) => (
  <React.Suspense fallback={<div className="h-[420px] bg-gray-50 rounded-3xl animate-pulse flex items-center justify-center text-gray-400 font-bold text-sm">Loading Partnership Banner...</div>}>
    <VenueOwnerJoinSection {...props} />
  </React.Suspense>
);

const SubscriptionUpgradeModal = ({ isOpen, onClose, onUpgrade }: { isOpen: boolean, onClose: () => void, onUpgrade: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden p-8 text-center"
      >
        <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck size={40} />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Subscription Required</h3>
        <p className="text-gray-600 mb-8 font-medium">
          This feature requires a valid subscription plan. Please upgrade your plan to continue using all premium features of the platform.
        </p>
        <div className="flex flex-col gap-3">
          <button 
            onClick={onUpgrade}
            className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black hover:bg-orange-700 transition-all shadow-lg shadow-orange-100 text-lg"
          >
            Take Valid Subscription
          </button>
          <button 
            onClick={onClose}
            className="w-full py-4 bg-gray-50 text-gray-500 rounded-2xl font-bold hover:bg-gray-100 transition-all"
          >
            Maybe Later
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// --- Components ---
const ConfirmModal = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel', 
  isDanger = false 
}: { 
  isOpen: boolean, 
  title: string, 
  message: string, 
  onConfirm: () => void, 
  onCancel: () => void, 
  confirmText?: string, 
  cancelText?: string, 
  isDanger?: boolean 
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden p-8"
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-600 mb-8">{message}</p>
        <div className="flex space-x-4">
          <button 
            onClick={onCancel}
            className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className={cn(
              "flex-1 py-3 rounded-xl font-bold text-white transition-all shadow-lg",
              isDanger ? "bg-red-600 hover:bg-red-700 shadow-red-200" : "bg-orange-600 hover:bg-orange-700 shadow-orange-200"
            )}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

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
      
      // Map database keys to camelCase
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
    if (!booking.isLocked) {
      toast.error('Booking transaction must be locked first before adding payment.');
      return;
    }
    if (newPayment.amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const today = format(new Date(), 'yyyy-MM-dd');
    if (newPayment.paymentDate < today) {
      toast.error('Back date entry not allowed');
      return;
    }

    // Verify overpayment
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

      // Re-fetch latest payments from DB to calculate true total across all records
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
        is_locked: true // Lock the booking as soon as a payment is added
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
      // First refresh parent so UI data is updated
      if (onUpdate) onUpdate(); 
      // Then refresh local list
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
  const isFullyPaid = pendingAmount <= 0.1 && totalAmount > 0;

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
                  <span className="bg-red-100 text-red-600 text-[8px] md:text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-tight">
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
                  onClick={() => {
                    if (!booking.isLocked) {
                      toast.error('Booking transaction must be locked first before adding payment.');
                      return;
                    }
                    setIsRegistering(true);
                  }}
                  className={cn(
                    "px-6 py-2 rounded-xl font-bold text-sm transition-all flex items-center shadow-lg",
                    !booking.isLocked 
                      ? "bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 shadow-none" 
                      : "bg-orange-600 text-white hover:bg-orange-700 shadow-orange-100"
                  )}
                >
                  {!booking.isLocked ? <Lock size={16} className="mr-2" /> : <Plus size={16} className="mr-2" />}
                  {!booking.isLocked ? 'Lock to Register Payment' : 'Register Payment'}
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

// --- Location Data ---
import { locations } from './data/locations';
const LOCATION_DATA = locations;

// Mock database to remove backend connection as requested
import { dataService as db, isDatabaseConnected, setOfflineMode, resolveUrl, getIsOffline, generateUUID } from './services/dataService';
import { Database as DbIcon } from 'lucide-react';

import { cn } from './lib/utils';

// --- Translation Data ---
const translations: Record<string, any> = {
  en: {
    home: "Home",
    gallery: "Gallery",
    search: "Search",
    about: "About",
    rateUs: "Rate Us",
    registration: "Registration",
    login: "Login",
    logout: "Logout",
    adminPanel: "Admin Panel",
    dashboard: "Dashboard",
    bookingManager: "Booking Manager",
    changePassword: "Change Password",
    heroTitle: "Plan Your Perfect Event with Confidence",
    heroTagline: "ALL IN ONE BOOKING PLAT FORM FOR YOUR SPECIAL TIME",
    searchPlaceholder: "Search venues, caterers, DJs...",
    searchNow: "Search Now",
    allStates: "All States",
    allDistricts: "All Districts",
    allBlocks: "All Blocks",
    whyPlanTitle: "Why Plan with BEST VENUE OPTION?",
    verifiedPartners: "Verified Partners",
    bestPrices: "Best Prices",
    support247: "24/7 Support",
    footerCopyright: "© 2026 BEST VENUE OPTION India. All rights reserved.",
    joinAsOwner: "Join Us as Venue Owner",
    joinAsProvider: "Join Us as Service Provider",
    register: "Register",
    termsAndConditions: "Terms & Conditions",
    helpCenter: "Help Center",
    contactUs: "Contact Us",
    loginNow: "Login Now"
  },
  hi: {
    home: "होम",
    gallery: "गैलरी",
    search: "खोजें",
    about: "हमारे बारे में",
    rateUs: "हमें रेट करें",
    registration: "पंजीकरण",
    login: "लॉगिन",
    logout: "लॉगआउट",
    adminPanel: "एडमिन पैनल",
    dashboard: "डैशबोर्ड",
    bookingManager: "बुकिंग मैनेजर",
    changePassword: "पासवर्ड बदलें",
    heroTitle: "आत्मविश्वास के साथ अपने सही कार्यक्रम की योजना बनाएं",
    heroTagline: "आपके विशेष समय के लिए ऑल इन वन बुकिंग प्लेटफॉर्म",
    searchPlaceholder: "स्थान, कैटरर्स, डीजे खोजें...",
    searchNow: "अभी खोजें",
    allStates: "सभी राज्य",
    allDistricts: "सभी जिले",
    allBlocks: "सभी ब्लॉक",
    whyPlanTitle: "BEST VENUE OPTION के साथ योजना क्यों बनाएं?",
    verifiedPartners: "सत्यापित भागीदार",
    bestPrices: "सर्वोत्तम मूल्य",
    support247: "24/7 सहायता",
    footerCopyright: "© 2026 BEST VENUE OPTION इंडिया। सर्वाधिकार सुरक्षित।",
    joinAsOwner: "वेन्यू मालिक के रूप में जुड़ें",
    joinAsProvider: "सेवा प्रदाता के रूप में जुड़ें",
    register: "पंजीकरण करें",
    termsAndConditions: "नियम और शर्तें",
    helpCenter: "सहायता केंद्र",
    contactUs: "संपर्क करें",
    loginNow: "अभी लॉगिन करें",
    
    // Dashboard & Sidebar Tabs
    "overview": "अवलोकन",
    "profile manage": "प्रोफाइल प्रबंधन",
    "venue manage": "वेन्यू प्रबंधन",
    "services manage": "सेवा प्रबंधन",
    "catalogue manage": "कैटलॉग प्रबंधन",
    "manually booking": "मैनुअल बुकिंग",
    "my bookings": "मेरी बुकिंग",
    "public booking": "पब्लिक बुकिंग",
    "manage payment": "भुगतान प्रबंधन",
    "rating accept card": "रेटिंग क्यूआर कार्ड",
    "reports": "रिपोर्ट्स",
    "subscription": "सब्सक्रिप्शन",
    "query or complaint": "सवाल या शिकायत",
    "reset password": "पासवर्ड रीसेट करें",
    "dashboard menu": "डैशबोर्ड मेनू",
    "welcome": "स्वागत हे",
    "owner": "मालिक",
    "provider": "सेवा प्रदाता",
    "user": "उपयोगकर्ता",
    "admin": "एडमिन",
    
    // Exact casing match fallbacks
    "Overview": "अवलोकन",
    "Profile Manage": "प्रोफाइल प्रबंधन",
    "Venue Manage": "वेन्यू प्रबंधन",
    "Services Manage": "सेवा प्रबंधन",
    "Catalogue Manage": "कैटलॉग प्रबंधन",
    "Manually Booking": "मैनुअल बुकिंग",
    "My Bookings": "मेरी बुकिंग",
    "Public Booking": "पब्लिक बुकिंग",
    "Manage Payment": "भुगतान प्रबंधन",
    "Rating Accept Card": "रेटिंग क्यूआर कार्ड",
    "Reports": "रिपोर्ट्स",
    "Subscription": "सब्सक्रिप्शन",
    "Query or Complaint": "सवाल या शिकायत",
    "Reset Password": "पासवर्ड रीसेट करें",
    "Dashboard Menu": "डैशबोर्ड मेनू",
    "Welcome": "स्वागत हे",
    "Venue Owner": "वेन्यू मालिक",
    "Service Provider": "सेवा प्रदाता",
    "Regular User": "सामान्य उपयोगकर्ता",
    "Monthly Plan": "मासिक प्लान",
    "Annual Plan": "वार्षिक प्लान",
    "Active Subscription": "सक्रिय सदस्यता",
    "Expired": "समाप्त",
    "Renewal Date": "नवीनीकरण तिथि",
    
    // Form Inputs & Details
    "Name": "नाम",
    "Full Name": "पूरा नाम",
    "Email": "ईमेल",
    "Email Address": "ईमेल पता",
    "Mobile Number": "मोबाइल नंबर",
    "Phone Number": "फ़ोन नंबर",
    "Password": "पासवर्ड",
    "Confirm Password": "पासवर्ड की पुष्टि करें",
    "Current Password": "वर्तमान पासवर्ड",
    "New Password": "नया पासवर्ड",
    "Role": "भूमिका",
    "Select Role": "भूमिका चुनें",
    "State": "राज्य",
    "District": "जिला",
    "Block": "ब्लॉक",
    "City": "शहर",
    "Address": "पता",
    "Full Address": "पूरा पता",
    "Description": "विवरण",
    "Price": "कीमत",
    "Price per Day": "प्रति दिन की कीमत",
    "Capacity": "क्षमता",
    "Status": "स्थिति",
    "Date": "तारीख",
    "Event Date": "कार्यक्रम की तारीख",
    "Time": "समय",
    "Start Time": "शुरू होने का समय",
    "End Time": "समाप्त होने का समय",
    "Event Type": "कार्यक्रम का प्रकार",
    "Select Event Type": "कार्यक्रम का प्रकार चुनें",
    
    // General Actions & Common UI Words
    "Submit": "जमा करें",
    "Cancel": "रद्द करें",
    "Save": "सहेजें",
    "Save Changes": "बदलाव सहेजें",
    "Edit": "संपादित करें",
    "Delete": "हटाएं",
    "Add New": "नया जोड़ें",
    "Update": "अपडेट करें",
    "Upload": "अपलोड करें",
    "Upload Image": "छवि अपलोड करें",
    "Download": "डाउनलोड करें",
    "Download Invoice": "इनवॉइस डाउनलोड करें",
    "Search Now": "अभी खोजें",
    "Book Now": "अभी बुक करें",
    "Send Request": "अनुरोध भेजें",
    "Accept": "स्वीकार करें",
    "Reject": "अस्वीकार करें",
    "Pending": "लंबित",
    "Confirmed": "पुष्टि की गई",
    "Cancelled": "रद्द किया गया",
    "Approved": "स्वीकृत",
    "Completed": "पूरा हुआ",
    "Paid": "भुगतान किया गया",
    "Unpaid": "अवैतनिक",
    "Lock Booking": "बुकिंग लॉक करें",
    "Unlock Booking": "बुकिंग अनलॉक करें",
    "Select State": "राज्य चुनें",
    "Select District": "जिला चुनें",
    "Select Block": "ब्लॉक चुनें",
    
    // Other common sections
    "Catering": "कैटरिंग",
    "Decoration": "सजावट",
    "Photography": "फोटोग्राफी",
    "Music / DJ": "संगीत / डीजे",
    "Explore Venues": "वेन्यू खोजें",
    "Explore Services": "सेवाएं खोजें",
    "Featured Venues": "विशेष रुप से प्रदर्शित वेन्यू",
    "Featured Services": "विशेष रुप से प्रदर्शित सेवाएं",
    "Reviews": "समीक्षाएं",
    "Rating": "रेटिंग",
    "Write a Review": "समीक्षा लिखें",
    "View on Map": "मानचित्र पर देखें",
    "Call Owner": "मालिक को कॉल करें",
    "WhatsApp Owner": "मालिक को व्हाट्सएप करें",
    "Share": "साझा करें",
    "Veg/Non-Veg": "शाकाहारी/मांसाहारी",
    "Amenities": "सुविधाएं",
    "Facilities": "सुविधाएं",
    "Total Venues": "कुल वेन्यू",
    "Total Service Providers": "कुल सेवा प्रदाता",
    "Total Bookings": "कुल बुकिंग",
    "Total Users": "कुल उपयोगकर्ता",
    "Today's Bookings": "आज की बुकिंग",
    "Pending Bookings": "लंबित बुकिंग",
    "Confirmed Bookings": "पुष्टि की गई बुकिंग",
    "Completed Bookings": "पूरी हुई बुकिंग",
    "Revenue": "राजस्व",
    "Total Revenue": "कुल राजस्व",
    "Download User Report": "उपयोगकर्ता रिपोर्ट डाउनलोड करें",
    "Download Booking Report": "बुकिंग रिपोर्ट डाउनलोड करें",
    "Generate Invoice": "इनवॉइस जनरेट करें",
    "Booking Reports": "बुकिंग रिपोर्ट",
    "Filter by Date": "तारीख के अनुसार फ़िल्टर करें",
    "Filter by Status": "स्थिति के अनुसार फ़िल्टर करें",
    "BEST VENUE OPTION is India's premier event planning platform, dedicated to making your special moments truly unforgettable. We bridge the gap between hosts and the finest venues and service providers in the country. Whether it's a grand wedding, a corporate gala, or an intimate birthday party, BEST VENUE OPTION provides the tools and connections you need to plan with ease and celebrate with joy.": "BEST VENUE OPTION भारत का प्रमुख इवेंट प्लानिंग प्लेटफॉर्म है, जो आपके विशेष क्षणों को वास्तव में अविस्मरणीय बनाने के लिए समर्पित है। हम देश के बेहतरीन वेन्यू और सेवा प्रदाताओं के बीच की दूरी को पाटते हैं। चाहे वह एक भव्य शादी हो, एक कॉर्पोरेट उत्सव हो, या एक छोटा सा जन्मदिन समारोह हो, BEST VENUE OPTION आपको आसान योजना बनाने और खुशियों के साथ उत्सव मनाने के लिए आवश्यक उपकरण और संपर्क प्रदान करता है।",
    "Verified Venues": "सत्यापित वेन्यू",
    "Service Partners": "सेवा भागीदार",
    "Happy Events": "सफल कार्यक्रम",
    "Marriage Garden": "मैरिज गार्डन",
    "Banquet Hall": "बैंक्वेट हॉल",
    "Hotel": "होटल",
    "Resort": "रिसॉर्ट",
    "Party Plot": "पार्टी प्लॉट",
    "DJ & Music": "डीजे और संगीत",
    "Makeup Artist": "मेकअप आर्टिस्ट",
    "Mehendi Artist": "मेहंदी आर्टिस्ट",
    "Tent House": "टेंट हाउस",
    "Security": "सुरक्षा",
    "OUR": "हमारे",
    "MOMENTS": "पल",
    "OUR MOMENTS": "हमारे यादगार पल",
    "Beautiful celebrations captured on our platform": "हमारे प्लेटफॉर्म पर कैद किए गए खूबसूरत समारोह",
    "Glimpses of beautiful celebrations and special moments": "सुंदर उत्सवों और विशेष क्षणों की झलकियाँ",
    "Our Moments Gallery": "हमारी गैलरी",
    "Admin highlight photos will appear here": "एडमिन द्वारा हाईलाइट की गई तस्वीरें यहाँ दिखाई देंगी",
    "Popular Venues": "लोकप्रिय वेन्यू",
    "Handpicked venues for your special celebrations": "आपके विशेष समारोहों के लिए चुनिंदा वेन्यू",
    "View All": "सभी देखें",
    "Top Service Providers": "शीर्ष सेवा प्रदाता",
    "Caterers, DJs, and Decorators to make it memorable": "इसे यादगार बनाने के लिए कैटरर्स, डीजे और डेकोरेटर्स",
    "System Update": "सिस्टम अपडेट",
    "Now user can access all features of app": "अब उपयोगकर्ता ऐप की सभी सुविधाओं का उपयोग कर सकते हैं",
    "System Update: Now user can access all features of app": "सिस्टम अपडेट: अब उपयोगकर्ता ऐप की सभी सुविधाओं का उपयोग कर सकते हैं",
    "MySQL Connected": "MySQL कनेक्टेड",
    "Working Offline": "ऑफ़लाइन काम कर रहे हैं",
    "Local Storage Active": "लोकल स्टोरेज सक्रिय",
    "Connection Failed": "कनेक्शन विफल",
    "Every venue and provider is manually verified for quality and reliability.": "गुणवत्ता और विश्वसनीयता के लिए प्रत्येक वेन्यू और प्रदाता को मैन्युअल रूप से सत्यापित किया जाता है।",
    "Get the best rates by booking directly through our platform.": "हमारे प्लेटफॉर्म के माध्यम से सीधे बुकिंग करके सर्वोत्तम दरें प्राप्त करें।",
    "Our team is here to help you with every step of your event planning.": "हमारी टीम आपके इवेंट प्लानिंग के हर कदम पर आपकी मदद करने के लिए तैयार है।",
    "Admin Panel": "एडमिन पैनल",
    "Home": "होम",
    "Gallery": "गैलरी",
    "Search": "खोज",
    "About": "हमारे बारे में",
    "Registration": "पंजीकरण",
    "Login": "लॉगिन",
    "Logout": "लॉगआउट",
    "Marriage Hall": "मैरिज हॉल",
    "Venue Type": "वेन्यू का प्रकार",
    "Pincode": "पिनकोड",
    "Update Profile": "प्रोफाइल अपडेट करें",
    "Clear All Filters": "सभी फ़िल्टर साफ़ करें",
    "Event Gallery": "इवेंट गैलरी"
  }
};

const LanguageContext = React.createContext({
  lang: 'en',
  setLang: (lang: string) => {},
  t: (key: string) => key
});

const useTranslation = () => React.useContext(LanguageContext);

const HINDI_DICT: Record<string, string> = {
  // Navigation / Auth
  "home": "होम",
  "gallery": "गैलरी",
  "search": "खोज",
  "about": "हमारे बारे में",
  "registration": "पंजीकरण",
  "login": "लॉगिन",
  "logout": "लॉगआउट",
  "admin panel": "एडमिन पैनल",
  "dashboard": "डैशबोर्ड",
  "booking manager": "बुकिंग मैनेजर",
  "change password": "पासवर्ड बदलें",
  "forgot password": "पासवर्ड भूल गए",
  "forgot password?": "पासवर्ड भूल गए?",
  "send reset link": "रीसेट लिंक भेजें",
  "back to login": "लॉगिन पर वापस जाएं",
  "sign in to your account": "अपने खाते में साइन इन करें",
  "sign in": "साइन इन करें",
  "create account": "खाता बनाएं",
  "already have an account?": "पहले से ही एक खाता है?",
  "don't have an account?": "खाता नहीं है?",
  "register now": "अभी पंजीकरण करें",
  "register": "पंजीकरण करें",
  "rate us": "हमें रेट करें",
  "user profile": "उपयोगकर्ता प्रोफ़ाइल",
  "update profile": "प्रोफ़ाइल अपडेट करें",

  // Roles
  "venue owner": "वेन्यू मालिक",
  "service provider": "सेवा प्रदाता",
  "regular user": "सामान्य उपयोगकर्ता",
  "admin": "एडमिन",
  "regular_user": "सामान्य उपयोगकर्ता",
  "owner": "मालिक",
  "provider": "सेवा प्रदाता",

  // Core Pages titles & subheadings
  "plan your perfect event with confidence": "आत्मविश्वास के साथ अपने सही कार्यक्रम की योजना बनाएं",
  "all in one booking plat form for your special time": "आपके विशेष समय के लिए ऑल इन वन बुकिंग प्लेटफॉर्म",
  "popular venues": "लोकप्रिय वेन्यू",
  "handpicked venues for your special celebrations": "आपके विशेष समारोहों के लिए चुनिंदा वेन्यू",
  "view all": "सभी देखें",
  "top service providers": "शीर्ष सेवा प्रदाता",
  "caterers, djs, and decorators to make it memorable": "इसे यादगार बनाने के लिए कैटरर्स, डीजे और डेकोरेटर्स",
  "why plan with best venue option?": "BEST VENUE OPTION के साथ योजना क्यों बनाएं?",
  "verified partners": "सत्यापित भागीदार",
  "best prices": "सर्वोत्तम मूल्य",
  "24/7 support": "24/7 सहायता",
  "every venue and provider is manually verified for quality and reliability.": "गुणवत्ता और विश्वसनीयता के लिए प्रत्येक वेन्यू और प्रदाता को मैन्युअल रूप से सत्यापित किया जाता है।",
  "get the best rates by booking directly through our platform.": "हमारे प्लेटफॉर्म के माध्यम से सीधे बुकिंग करके सर्वोत्तम दरें प्राप्त करें।",
  "our team is here to help you with every step of your event planning.": "हमारी टीम आपके इवेंट प्लानिंग के हर कदम पर आपकी मदद करने के लिए तैयार है।",
  "join us as venue owner": "वेन्यू मालिक के रूप में जुड़ें",
  "join us as service provider": "सेवा प्रदाता के रूप में जुड़ें",
  "terms & conditions": "नियम और शर्तें",
  "help center": "सहायता केंद्र",
  "contact us": "संपर्क करें",
  "about us": "हमारे बारे में",
  "our moments gallery": "हमारी गैलरी",
  "admin highlight photos will appear here": "एडमिन द्वारा हाईलाइट की गई तस्वीरें यहाँ दिखाई देंगी",
  "event gallery": "इवेंट गैलरी",
  "glimpses of beautiful celebrations and special moments": "सुंदर उत्सवों और विशेष क्षणों की झलकियाँ",
  "beautiful celebrations captured on our platform": "हमारे प्लेटफॉर्म पर कैद किए गए खूबसूरत समारोह",
  "clear all filters": "सभी फ़िल्टर साफ़ करें",

  // System Monitor / Statuses
  "mysql connected": "MySQL कनेक्टेड",
  "working offline": "ऑफ़लाइन काम कर रहे हैं",
  "local storage active": "लोकल स्टोरेज सक्रिय",
  "connection failed": "कनेक्शन विफल",
  "system update": "सिस्टम अपडेट",
  "now user can access all features of app": "अब उपयोगकर्ता ऐप की सभी सुविधाओं का उपयोग कर सकते हैं",
  "system update: now user can access all features of app": "सिस्टम अपडेट: अब उपयोगकर्ता ऐप की सभी सुविधाओं का उपयोग कर सकते हैं",

  // Dashboard / Tabs
  "overview": "अवलोकन",
  "profile manage": "प्रोफाइल प्रबंधन",
  "venue manage": "वेन्यू प्रबंधन",
  "services manage": "सेवा प्रबंधन",
  "catalogue manage": "कैटलॉग प्रबंधन",
  "manually booking": "मैनुअल बुकिंग",
  "my bookings": "मेरी बुकिंग",
  "public booking": "पब्लिक बुकिंग",
  "manage payment": "भुगतान प्रबंधन",
  "rating accept card": "रेटिंग क्यूआर कार्ड",
  "reports": "रिपोर्ट्स",
  "subscription": "सब्सक्रिप्शन",
  "query or complaint": "सवाल या शिकायत",
  "reset password": "पासवर्ड रीसेट करें",
  "dashboard menu": "डैशबोर्ड मेनू",
  "welcome": "स्वागत हे",
  "monthly plan": "मासिक प्लान",
  "annual plan": "वार्षिक प्लान",
  "active subscription": "सक्रिय सदस्यता",
  "expired": "समाप्त",
  "renewal date": "नवीनीकरण तिथि",

  // Form Fields & Labels
  "name": "नाम",
  "full name": "पूरा नाम",
  "email": "ईमेल",
  "email address": "ईमेल पता",
  "mobile number": "मोबाइल नंबर",
  "phone number": "फ़ोन नंबर",
  "confirm password": "पासवर्ड की पुष्टि करें",
  "current password": "वर्तमान पासवर्ड",
  "new password": "नया पासवर्ड",
  "role": "भूमिका",
  "select role": "भूमिका चुनें",
  "state": "राज्य",
  "district": "जिला",
  "block": "ब्लॉक",
  "city": "शहर",
  "address": "पता",
  "full address": "पूरा पता",
  "description": "विवरण",
  "price": "कीमत",
  "price per day": "प्रति दिन की कीमत",
  "capacity": "क्षमता",
  "status": "स्थिति",
  "date": "तारीख",
  "event date": "कार्यक्रम की तारीख",
  "time": "समय",
  "start time": "शुरू होने का समय",
  "end time": "समाप्त होने का समय",
  "event type": "कार्यक्रम का प्रकार",
  "select event type": "कार्यक्रम का प्रकार चुनें",
  "pincode": "पिनकोड",
  "venue type": "वेन्यू का प्रकार",

  // Venue Types & Service Types
  "marriage garden": "मैरिज गार्डन",
  "banquet hall": "बैंक्वेट हॉल",
  "hotel": "होटल",
  "resort": "रिसॉर्ट",
  "party plot": "पार्टी प्लॉट",
  "catering": "कैटरिंग",
  "decoration": "सजावट",
  "photography": "फोटोग्राफी",
  "dj & music": "डीजे और संगीत",
  "makeup artist": "मेकअप आर्टिस्ट",
  "mehendi artist": "मेहंदी आर्टिस्ट",
  "tent house": "टेंट हाउस",
  "security": "सुरक्षा",
  "marriage hall": "मैरिज हॉल",
  "restorent": "होटल / रेस्टोरेंट",
  "community halls": "सामुदायिक भवन",
  "community hall": "सामुदायिक भवन",

  // Actions
  "submit": "जमा करें",
  "cancel": "रद्द करें",
  "save": "सहेजें",
  "save changes": "बदलाव सहेजें",
  "edit": "संपादित करें",
  "delete": "हटाएं",
  "add new": "नया जोड़ें",
  "add new venue": "नया वेन्यू जोड़ें",
  "add new service": "नई सेवा जोड़ें",
  "update": "अपडेट करें",
  "upload": "अपलोड करें",
  "upload image": "छवि अपलोड करें",
  "download": "डाउनलोड करें",
  "download invoice": "इनवॉइस डाउनलोड करें",
  "search now": "अभी खोजें",
  "book now": "अभी बुक करें",
  "send request": "अनुरोध भेजें",
  "accept": "स्वीकार करें",
  "reject": "अस्वीकार करें",
  "pending": "लंबित",
  "confirmed": "पुष्टि की गई",
  "cancelled": "रद्द किया गया",
  "approved": "स्वीकृत",
  "completed": "पूरा हुआ",
  "paid": "भुगतान किया गया",
  "unpaid": "अवैतनिक",
  "lock booking": "बुकिंग लॉक करें",
  "unlock booking": "बुकिंग अनलॉक करें",
  "select state": "राज्य चुनें",
  "select district": "जिला चुनें",
  "select block": "ब्लॉक चुनें",
  "view on map": "मानचित्र पर देखें",
  "call owner": "मालिक को कॉल करें",
  "whatsapp owner": "मालिक को व्हाट्सएप करें",
  "share": "साझा करें",
  "write a review": "समीक्षा लिखें",
  "pay now": "अभी भुगतान करें",

  // Services/Amenities details
  "veg/non-veg": "शाकाहारी/मांसाहारी",
  "amenities": "सुविधाएं",
  "facilities": "सुविधाएं",
  "total venues": "कुल वेन्यू",
  "total service providers": "कुल सेवा प्रदाता",
  "total bookings": "कुल बुकिंग",
  "total users": "कुल उपयोगकर्ता",
  "today's bookings": "आज की बुकिंग",
  "pending bookings": "लंबित बुकिंग",
  "confirmed bookings": "पुष्टि की गई बुकिंग",
  "completed bookings": "पूरी हुई बुकिंग",
  "revenue": "राजस्व",
  "total revenue": "कुल राजस्व",
  "download user report": "उपयोगकर्ता रिपोर्ट डाउनलोड करें",
  "download booking report": "बुकिंग रिपोर्ट डाउनलोड करें",
  "generate invoice": "इनवॉइस जनरेट करें",
  "booking reports": "बुकिंग रिपोर्ट",
  "filter by date": "तारीख के अनुसार फ़िल्टर करें",
  "filter by status": "स्थिति के अनुसार फ़िल्टर करें",

  // Placeholders
  "search venues, caterers, djs...": "स्थान, कैटरर्स, डीजे खोजें...",
  "enter your full name": "अपना पूरा नाम दर्ज करें",
  "enter your email address": "अपना ईमेल पता दर्ज करें",
  "enter your mobile number": "अपना मोबाइल नंबर दर्ज करें",
  "enter your password": "अपना पासवर्ड दर्ज करें",
  "confirm your password": "अपने पासवर्ड की पुष्टि करें",
  "enter full address": "पूरा पता दर्ज करें",
  "enter pincode": "पिनकोड दर्ज करें",
  "enter capacity": "क्षमता दर्ज करें",
  "enter price": "कीमत दर्ज करें",
  "enter description": "विवरण दर्ज करें",

  // Facilities
  "rooms(ac)": "कमरे (एसी)",
  "rooms(non ac)": "कमरे (बिना एसी)",
  "dinner hall": "भोजन कक्ष",
  "wedding hall": "शादी हॉल",
  "stage site": "स्टेज साइट",
  "cattering hall": "कैटरिंग हॉल",
  "parking side": "पार्किंग स्थल",
  "party hall": "पार्टी हॉल",
  "meeting hall": "मीटिंग हॉल",
  "reshort site": "रिसॉर्ट साइट",
  "reception site": "रिसेप्शन साइट",
  "garden site": "गार्डन साइट",
  "ground": "मैदान",
  "indoor site": "इंडोर साइट",
  "outdoor site": "आउटडोर साइट",

  // Event types
  "wedding": "शादी",
  "sangeet": "संगीत समारोह",
  "engagement": "सगाई",
  "haldi": "हल्दी समारोह",
  "birthday party": "जन्मदिन की पार्टी",
  "anivviversary": "सालगिरह",
  "corporate events": "कॉर्पोरेट इवेंट्स",
  "seminar": "सेमीनार",
  "workshop": "कार्यशाला",
  "exhibition": "प्रदर्शनी",
  "music concert": "संगीत कार्यक्रम",
  "special occasion": "विशेष अवसर",

  // Extra details
  "veg per plate": "शाकाहारी प्रति प्लेट",
  "non-veg per plate": "मांसाहारी प्रति प्लेट",
  "advance payment required": "अग्रिम भुगतान आवश्यक",
  "advance booking price": "अग्रिम बुकिंग मूल्य",
  "minimum advance payment": "न्यूनतम अग्रिम भुगतान",
  "about best venue option": "BEST VENUE OPTION के बारे में",
  "quick links": "त्वरित लिंक",
  "connect with us": "हमसे जुड़ें",
  "all rights reserved.": "सर्वाधिकार सुरक्षित।",
  "offline mode": "ऑफ़लाइन मोड",
  "reconnect": "पुनः कनेक्ट करें",
  "retry": "पुनः प्रयास करें",
  "database connection failure": "डेटाबेस कनेक्शन विफलता",
  "working offline with local data": "स्थानीय डेटा के साथ ऑफ़लाइन काम कर रहे हैं",
  "mysql connection live": "MySQL कनेक्शन लाइव",

  // States
  "madhya pradesh": "मध्य प्रदेश",
  "rajasthan": "राजस्थान",
  "uttar pradesh": "उत्तर प्रदेश",
  "gujarat": "गुजरात",
  "maharashtra": "महाराष्ट्र",
  "delhi": "दिल्ली",
  "punjab": "पंजाब",
  "haryana": "हरियाणा",
  "bihar": "बिहार",
  "chhattisgarh": "छत्तीसगढ़",
  
  // Custom headers
  "explore our top-rated options": "हमारे सर्वश्रेष्ठ विकल्पों को देखें",
  "find the best venue or service provider for your next big event": "अपने अगले बड़े कार्यक्रम के लिए सर्वोत्तम वेन्यू या सेवा प्रदाता खोजें",
  "active members": "सक्रिय सदस्य",
  "verified partners reviews": "सत्यापित भागीदारों की समीक्षा",
  "success celebrations": "सफल उत्सव",
  "bestseller": "बेस्टसेलर",
  "featured": "विशेष रुप से प्रदर्शित",
  "verified": "सत्यापित",
  "book now directly": "सीधे बुक करें",
  "facilities & amenities": "सुविधाएं और सेवाएं",
  "pricing plans": "मूल्य निर्धारण योजनाएं",
  "transparent pricing for everyone": "सभी के लिए पारदर्शी मूल्य निर्धारण",
  "choose a plan that fits your business needs": "एक योजना चुनें जो आपके व्यावसायिक आवश्यकताओं के अनुकूल हो",
  "get started": "शुरू करें",
  "current plan": "वर्तमान योजना",
  "upgrade": "अपग्रेड करें",
  "unlimited bookings": "असीमित बुकिंग",
  "advanced reports": "उन्नत रिपोर्ट",
  "priority support": "प्राथमिकता सहायता",
  "custom branding": "कस्टम ब्रांडिंग",
  "analytics dashboard": "एनालिटिक्स डैशबोर्ड",

  // Extra missing/screenshot strings
  "search keywords": "खोज कीवर्ड",
  "search venues or services...": "वेन्यू या सेवाएं खोजें...",
  "all states": "सभी राज्य",
  "all districts": "सभी जिले",
  "all blocks": "सभी ब्लॉक",
  "results": "परिणाम",
  "back to home": "होम पर वापस जाएं",
  "login portal": "लॉगिन पोर्टल",
  "enter your credentials to continue": "जारी रखने के लिए अपनी साख दर्ज करें",
  "registration id / email": "पंजीकरण आईडी / ईमेल",
  "password": "पासवर्ड",
  "login now": "अभी लॉगिन करें",
  "register here": "यहाँ पंजीकरण करें",
  "account does not exist": "खाता मौजूद नहीं है",
  "invalid credentials": "अमान्य क्रेडेंशियल",
  "registration portal": "पंजीकरण पोर्टल",
  "partner registration": "भागीदार पंजीकरण",
  "join india's largest event planning network": "भारत के सबसे बड़े इवेंट प्लानिंग नेटवर्क से जुड़ें",
  "personal details": "व्यक्तिगत विवरण",
  "father's name": "पिता का नाम",
  "mobile number (password)": "मोबाइल नंबर (पासवर्ड)",
  "gmail id (optional)": "जीमेल आईडी (वैकल्पिक)",
  "profile photo": "प्रोफ़ाइल फ़ोटो",
  "select file": "फ़ाइल चुनें",
  "supported formats: jpeg, png, webp, gif (max 20mb). suggested dimensions: 1200×1200px (1:1 ratio).": "समर्थित प्रारूप: JPEG, PNG, WEBP, GIF (अधिकतम 20MB)। सुझाए गए आयाम: 1200×1200px (1:1 अनुपात)।",
  "business details": "व्यावसायिक विवरण",
  "i am a...": "मैं हूँ...",
  "i am a ...": "मैं हूँ...",
  "i agree to the ": "मैं ",
  " and ": " और ",
  " of best venue option.": " BEST VENUE OPTION के नियम और शर्तों से सहमत हूँ।",
  "what our users say": "हमारे उपयोगकर्ता क्या कहते हैं",
  "real stories from real people who planned their perfect events with us.": "उन वास्तविक लोगों की वास्तविक कहानियाँ जिन्होंने हमारे साथ अपने आदर्श कार्यक्रमों की योजना बनाई।",
  "total reviews": "कुल समीक्षाएं",
  "verified user": "सत्यापित उपयोगकर्ता",
  "verified users": "सत्यापित उपयोगकर्ता",
  "support": "सहायता",
  "cookies policy": "कुकीज़ नीति",
  "powered by chanchal net zone": "संचालित द्वारा CHANCHAL NET ZONE",
  "plan your perfect event": "अपने आदर्श कार्यक्रम की योजना बनाएं",
  "everything you need to host an unforgettable celebration, all in one place.": "एक अविस्मरणीय उत्सव की मेजबानी करने के लिए आपको जो कुछ भी चाहिए, वह सब एक ही स्थान पर।",
  "birthday bashes": "जन्मदिन की पार्टियां",
  "fun-filled venues and decorators for the most memorable birthday parties.": "सबसे यादगार जन्मदिन पार्टियों के लिए मस्ती से भरे वेन्यू और डेकोरेटर्स।",
  "explore by ": "श्रेणी के अनुसार ",
  "category": "खोजें",
  "discover everything you need for your event with our curated categories.": "हमारी क्यूरेटेड श्रेणियों के साथ अपने कार्यक्रम के लिए आवश्यक सभी चीजें खोजें।",
  "join us as": "हमारे साथ जुड़ें ",
  "caterers": "कैटरर्स",
  "djs": "डीजे",
  "decorators": "डेकोरेटर्स",
  "venues": "वेन्यू",
  "services": "सेवाएं",
  "privacy policy": "गोपनीयता नीति",
  "select plan/amenities category": "योजना/सुविधाएं श्रेणी चुनें",
  "available amenities category": "उपलब्ध सुविधाएं श्रेणी",
  "total": "कुल",
  "complete": "पूर्ण",
  "dashboard overview": "डैशबोर्ड अवलोकन",
  "today's bookings alert": "आज की बुकिंग अलर्ट",
  "you have": "आपके पास",
  "booking(s) scheduled for today.": "बुकिंग आज के लिए निर्धारित है।",
  "location not set": "स्थान सेट नहीं है",
  "best venue option": "BEST VENUE OPTION",
  "best venue": "बेस्ट वेन्यू",
  "option": "ऑप्शन",
  "venue & event & service providers": "वेन्यू, इवेंट और सेवा प्रदाता",
  "powered by": "संचालित द्वारा",
  "chanchal net zone": "CHANCHAL NET ZONE",
  "location & distance": "स्थान और दूरी",
  "get directions": "दिशा-निर्देश प्राप्त करें",
  "google maps key not configured. directions available via external link.": "Google Maps कुंजी कॉन्फ़िगर नहीं की गई है। बाहरी लिंक के माध्यम से दिशा-निर्देश उपलब्ध हैं।",
  "view location on maps": "मानचित्र पर स्थान देखें",
  "error loading google maps. visit google cloud console to enable 'maps javascript api'.": "Google Maps लोड करने में त्रुटि। 'Maps JavaScript API' को सक्षम करने के लिए Google Cloud Console पर जाएं।",
  "view on maps instead": "इसके बजाय मानचित्र पर देखें",
  "select location on map": "मानचित्र पर स्थान चुनें",
  "use current location": "वर्तमान स्थान का उपयोग करें",
  "loading map...": "मानचित्र लोड हो रहा है...",
  "* click anywhere on the map to set your business location pin.": "* अपने व्यवसाय का स्थान सेट करने के लिए मानचित्र पर कहीं भी क्लिक करें।",
  "query & complaint portal": "पूछताछ और शिकायत पोर्टल",
  "query and complaint portal": "पूछताछ और शिकायत पोर्टल",
  "query/complaint portal": "पूछताछ/शिकायत पोर्टल",
  "review registered inquiries, suggestions, and complaints from members. update status with professional remarks.": "सदस्यों से पंजीकृत पूछताछ, सुझावों और शिकायतों की समीक्षा करें। पेशेवर टिप्पणियों के साथ स्थिति अपडेट करें।",
  "submit suggestions, report issues, or query the administration. track your request resolutions in real-time.": "सुझाव प्रस्तुत करें, समस्याओं की रिपोर्ट करें, या प्रशासन से पूछताछ करें। वास्तविक समय में अपने अनुरोध के समाधान को ट्रैक करें।",
  "refresh list": "सूची ताज़ा करें",
  "retrieving queries and complaints...": "पूछताछ और शिकायतें प्राप्त की जा रही हैं...",
  "new message": "नया संदेश",
  "submit your queries or suggestion directly to the system managers.": "अपनी पूछताछ या सुझाव सीधे सिस्टम प्रबंधकों को प्रस्तुत करें।",
  "sender name": "प्रेषक का नाम",
  "enter your name": "अपना नाम दर्ज करें",
  "your active mobile": "आपका सक्रिय मोबाइल",
  "message category": "संदेश श्रेणी",
  "complaint": "शिकायत",
  "suggestion": "सुझाव",
  "query/inquiry": "पूछताछ",
  "query": "पूछताछ",
  "your address": "आपका पता",
  "your residential / business address": "आपका आवासीय / व्यावसायिक पता",
  "query / complaint details": "पूछताछ / शिकायत विवरण",
  "write your suggestions or details of your query here. please be specific...": "यहाँ अपनी पूछताछ या सुझाव का विवरण लिखें। कृपया स्पष्ट रूप से लिखें...",
  "sending message...": "संदेश भेजा जा रहा है...",
  "submit message": "संदेश भेजें",
  "your communication log": "आपका संचार लॉग",
  "check administrative replies and tracking statuses here.": "यहाँ प्रशासनिक उत्तर और ट्रैकिंग स्थिति की जाँच करें।",
  "your message:": "आपका संदेश:",
  "resolved by administration": "प्रशासन द्वारा हल किया गया",
  "official remark / answer:": "आधिकारिक टिप्पणी / उत्तर:",
  "status: pending administrative reply. our team is reviewing this query.": "स्थिति: प्रशासनिक उत्तर लंबित है। हमारी टीम इस पूछताछ की समीक्षा कर रही है।",
  "you haven't submitted any queries or complaints yet.": "आपने अभी तक कोई पूछताछ या शिकायत दर्ज नहीं की है।",
  "roster filters": "रोस्टर फ़िल्टर",
  "all statuses": "सभी स्थितियां",
  "all categories": "सभी श्रेणियां",
  "complaints": "शिकायतें",
  "suggestions": "सुझाव",
  "queries": "पूछताछ",
  "search name, mobile, query text...": "नाम, मोबाइल, पूछताछ टेक्स्ट खोजें...",
  "roster history": "रोस्टर इतिहास",
  "sender details": "प्रेषक का विवरण",
  "detail summary": "विवरण सारांश",
  "no queries or complaints found matching the filters.": "फ़िल्टर से मेल खाने वाली कोई पूछताछ या शिकायत नहीं मिली।",
  "complaint action": "शिकायत पर कार्रवाई",
  "message query detail": "संदेश पूछताछ विवरण",
  "administrative remark / answer": "प्रशासनिक टिप्पणी / उत्तर",
  "already resolved": "पहले से ही हल किया गया",
  "update remark": "टिप्पणी अपडेट करें",
  "submit remark & resolve": "टिप्पणी जमा करें और हल करें",
  "resolving...": "हल किया जा रहा है...",
  "click on any query card or row to take resolution actions.": "समाधान कार्रवाई करने के लिए किसी भी पूछताछ कार्ड या पंक्ति पर क्लिक करें।",
  "profile settings": "प्रोफ़ाइल सेटिंग्स",
  "email id (optional)": "ईमेल आईडी (वैकल्पिक)",
  "narsinghpur": "नरसिंहपुर",
  "madhyapradesh": "मध्य प्रदेश",
  "bhopal": "भोपाल",
  "indore": "इंदौर",
  "jabalpur": "जबलपुर",
  "gwalior": "ग्वालियर",
  "sagar": "सागर",
  "satna": "सतना",
  "rewa": "रीवा",
  "ujjain": "उज्जैन",
  "hoshangabad": "होशंगाबाद",
  "sehore": "सीहोर",
  "vidisha": "विदिशा",
  "raisen": "रायसेन",
  "betul": "बैतूल",
  "pipariya": "पिपरिया",
  "itarsi": "इटारसी",
  "shajapur": "शाजापुर",
  "dewas": "देवास",
  "khandwa": "खंडवा",
  "khargone": "खरगोन",
  "chhindwara": "छिंदवाड़ा",
  "katni": "कटनी",
  "singrauli": "सिंगरौली",
  "shahdol": "शहडोल",
  "damoh": "दमोह",
  "panna": "पन्ना",
  "tikamgarh": "टीकमगढ़",
  "guna": "गुना",
  "shivpuri": "शिवपुरी",
  "datia": "दतिया",
  "sheopur": "श्योपुर",
  "bhind": "भिंड",
  "morena": "मुरैना",
  "mandsaur": "मंदसौर",
  "neemuch": "नीमच",
  "ratlam": "रतलाम",
  "dhar": "धार",
  "jhabua": "झाबुआ",
  "alirajpur": "अलीराजपुर",
  "barwani": "बड़वानी",
  "burhanpur": "बुरहानपुर",
  "harda": "हरदा",
  "anuppur": "अनूपपुर",
  "umaria": "उमरिया",
  "sidhi": "सीधी",
  "balaghat": "बालाघाट",
  "mandla": "मंडला",
  "seoni": "सिवनी",
  "dindori": "डिंडोरी",
  "narmadapuram": "नर्मदापुरम",
  "makeup": "मेकअप",
  "event manager": "इवेंट मैनेजर",
  "event managers": "इवेंट मैनेजर",
  "pandit ji": "पंडित जी",
  "pujari ji": "पुजारी जी",
  "mehendi": "मेहंदी",
  "drone": "ड्रोन",
  "rentals": "किराया",
  "waiters": "वेटर्स",
  "helpers": "हेल्पर्स/वेटर्स",
  "dhol bands": "ढोल और बैंड",
  "flower decor": "फूलों की सजावट",
  "id": "आईडी",
  "id:": "आईडी:",
  "s.no": "क्र.सं.",
  "customer": "ग्राहक",
  "mobile": "मोबाइल",
  "invoice no": "इनवॉइस नंबर",
  "paid amount": "भुगतान की गई राशि",
  "pending amount": "लंबित राशि",
  "type": "प्रकार",
  "action": "कार्रवाई",
  "year": "वर्ष",
  "all years": "सभी वर्ष",
  "customer name...": "ग्राहक का नाम...",
  "all modes": "सभी मोड",
  "all types": "सभी प्रकार",
  "order": "ऑर्डर",
  "manual": "मैनुअल",
  "cash": "नकद",
  "online": "ऑनलाइन",
  "search name": "नाम खोजें",
  "payment mode": "भुगतान का प्रकार",
  "booking type": "बुकिंग का प्रकार",
  "start date": "प्रारंभ तिथि",
  "end date": "अंतिम तिथि",
  "total received": "कुल प्राप्त",
  "total discount": "कुल छूट",
  "total pending": "कुल लंबित",
  "complete count": "सफल बुकिंग संख्या",
  "elite plans": "एलीट प्लान्स",
  "professional business expansion protocol": "व्यावसायिक व्यवसाय विस्तार प्रोटोकॉल",
  "active plan benefits": "सक्रिय प्लान के लाभ",
  "premium status": "प्रीमियम स्थिति",
  "active": "सक्रिय",
  "unlimited listing": "असीमित लिस्टिंग",
  "direct customer contact": "सीधे ग्राहक से संपर्क",
  "featured visibility": "विशेष रूप से प्रदर्शित दृश्यता",
  "active plan": "सक्रिय प्लान",
  "buy this plan": "यह प्लान खरीदें",
  "loading premium plans...": "प्रीमियम प्लान लोड हो रहे हैं...",
  "besic plan": "बेसिक प्लान",
  "basic plan": "बेसिक प्लान",
  "all roles": "सभी भूमिकाएं",
  "venue owners": "वेन्यू मालिक",
  "service providers": "सेवा प्रदाता"
};

function getHindiTranslation(text: string): string | null {
  if (!text) return null;
  const clean = text.trim();
  const lower = clean.toLowerCase();

  if (HINDI_DICT[lower]) {
    return HINDI_DICT[lower];
  }

  // Fallback to translations.hi
  if (translations && translations.hi) {
    if (translations.hi[clean] !== undefined) {
      return translations.hi[clean];
    }
    if (translations.hi[lower] !== undefined) {
      return translations.hi[lower];
    }
    const foundKey = Object.keys(translations.hi).find(k => k.toLowerCase() === lower);
    if (foundKey && translations.hi[foundKey] !== undefined) {
      return translations.hi[foundKey];
    }
  }

  const punctuationRegex = /^(.+?)([:\s?.]*)$/;
  const match = clean.match(punctuationRegex);
  if (match) {
    const coreText = match[1];
    const punctuation = match[2];
    const coreLower = coreText.trim().toLowerCase();
    if (HINDI_DICT[coreLower]) {
      return HINDI_DICT[coreLower] + punctuation;
    }
  }

  // Dynamic Regex-based Translations
  const venuesCountMatch = clean.match(/^venues\s*\((\d+)\)$/i);
  if (venuesCountMatch) {
    return `वेन्यू (${venuesCountMatch[1]})`;
  }

  const servicesCountMatch = clean.match(/^services\s*\((\d+)\)$/i);
  if (servicesCountMatch) {
    return `सेवाएं (${servicesCountMatch[1]})`;
  }

  const verifiedUsersMatch = clean.match(/^(\d+)\s+verified\s+users$/i);
  if (verifiedUsersMatch) {
    return `${verifiedUsersMatch[1]} सत्यापित उपयोगकर्ता`;
  }

  const happyEventsMatch = clean.match(/^(\d+k?\+?)\s+happy\s+events$/i);
  if (happyEventsMatch) {
    return `${happyEventsMatch[1]} सफल कार्यक्रम`;
  }

  const verifiedVenuesMatch = clean.match(/^(\d+k?\+?)\s+verified\s+venues$/i);
  if (verifiedVenuesMatch) {
    return `${verifiedVenuesMatch[1]} सत्यापित वेन्यू`;
  }

  const servicePartnersMatch = clean.match(/^(\d+k?\+?)\s+service\s+partners$/i);
  if (servicePartnersMatch) {
    return `${servicePartnersMatch[1]} सेवा भागीदार`;
  }

  const venuesServicesMatch = clean.match(/^Found\s+(\d+)\s+venues\s+and\s+(\d+)\s+services$/i);
  if (venuesServicesMatch) {
    return `हमें ${venuesServicesMatch[1]} वेन्यू और ${venuesServicesMatch[2]} सेवाएं मिलीं`;
  }

  const venuesMatch = clean.match(/^Found\s+(\d+)\s+venues$/i);
  if (venuesMatch) {
    return `हमें ${venuesMatch[1]} वेन्यू मिले`;
  }

  const servicesMatch = clean.match(/^Found\s+(\d+)\s+services$/i);
  if (servicesMatch) {
    return `हमें ${servicesMatch[1]} सेवाएं मिलीं`;
  }

  const reviewsMatch = clean.match(/^(\d+)\s+reviews$/i);
  if (reviewsMatch) {
    return `${reviewsMatch[1]} समीक्षाएं`;
  }

  const ratingsMatch = clean.match(/^(\d+)\s+ratings$/i);
  if (ratingsMatch) {
    return `${ratingsMatch[1]} रेटिंग`;
  }

  const bookingsMatch = clean.match(/^(\d+)\s+bookings$/i);
  if (bookingsMatch) {
    return `${bookingsMatch[1]} बुकिंग`;
  }

  const capacityMatch = clean.match(/^Capacity:\s*(\d+)$/i);
  if (capacityMatch) {
    return `क्षमता: ${capacityMatch[1]} व्यक्ति`;
  }

  const priceDayMatch = clean.match(/^Price:\s*₹?\s*([\d,]+)\s*\/\s*Day$/i);
  if (priceDayMatch) {
    return `कीमत: ₹${priceDayMatch[1]} / दिन`;
  }

  const priceMatch = clean.match(/^Price:\s*₹?\s*([\d,]+)$/i);
  if (priceMatch) {
    return `कीमत: ₹${priceMatch[1]}`;
  }

  const ownerMatch = clean.match(/^Owner:\s*(.+)$/i);
  if (ownerMatch) {
    return `मालिक: ${ownerMatch[1]}`;
  }

  const approxDistanceMatch = clean.match(/^Approx\.\s*([\d.]+)\s*km\s*away\s*from\s*you$/i);
  if (approxDistanceMatch) {
    return `आपसे लगभग ${approxDistanceMatch[1]} किमी दूर`;
  }

  const entriesMatchingMatch = clean.match(/^Found\s*(\d+)\s*entries\s*matching\s*current\s*criteria$/i);
  if (entriesMatchingMatch) {
    return `वर्तमान मानदंडों से मेल खाने वाली ${entriesMatchingMatch[1]} प्रविष्टियां मिलीं`;
  }

  const ratingsValueMatch = clean.match(/^Rating:\s*([\d.]+)\s*\/\s*5$/i);
  if (ratingsValueMatch) {
    return `रेटिंग: ${ratingsValueMatch[1]} / 5`;
  }

  const totalBookingsMatch = clean.match(/^Total Bookings \(([\d]+)\)$/i);
  if (totalBookingsMatch) {
    return `कुल बुकिंग (${totalBookingsMatch[1]})`;
  }

  const designedForMatch = clean.match(/^Designed for professional (.+?)s$/i);
  if (designedForMatch) {
    const role = designedForMatch[1].toLowerCase();
    const roleHindi = HINDI_DICT[role] || (role === 'provider' ? 'सेवा प्रदाता' : role === 'owner' ? 'वेन्यू मालिक' : role);
    return `पेशेवर ${roleHindi} के लिए डिज़ाइन किया गया`;
  }

  const perDurationMatch = clean.match(/^\/\s*(month|year|day)$/i);
  if (perDurationMatch) {
    const duration = perDurationMatch[1].toLowerCase();
    const durationHindi = duration === 'month' ? 'महीना' : duration === 'year' ? 'वर्ष' : 'दिन';
    return `/ ${durationHindi}`;
  }

  const validUntilMatch = clean.match(/^Valid until:\s*(.+)$/i);
  if (validUntilMatch) {
    return `वैधता तिथि: ${validUntilMatch[1]}`;
  }

  const welcomeMatch = clean.match(/^Welcome,\s*(.+)$/i);
  if (welcomeMatch) {
    return `स्वागत है, ${welcomeMatch[1]}`;
  }

  const bookingScheduledMatch = clean.match(/^booking\(s\)\s+scheduled\s+for\s+today\.?$/i);
  if (bookingScheduledMatch) {
    return `बुकिंग आज के लिए निर्धारित है।`;
  }

  return null;
}

function translateElement(el: Node) {
  if (el.nodeType === Node.TEXT_NODE) {
    const text = el.nodeValue || '';
    const trimmed = text.trim();
    if (trimmed) {
      const translation = getHindiTranslation(trimmed);
      if (translation && translation !== trimmed) {
        if (!(el as any).__originalText) {
          (el as any).__originalText = text;
        }
        const leadingSpace = text.match(/^\s*/)?.[0] || '';
        const trailingSpace = text.match(/\s*$/)?.[0] || '';
        el.nodeValue = leadingSpace + translation + trailingSpace;
      }
    }
  } else if (el.nodeType === Node.ELEMENT_NODE) {
    const element = el as HTMLElement;
    const tagName = element.tagName.toLowerCase();
    if (tagName === 'script' || tagName === 'style' || tagName === 'code' || tagName === 'iframe') {
      return;
    }

    if (tagName === 'input' || tagName === 'textarea') {
      const placeholder = element.getAttribute('placeholder');
      if (placeholder) {
        const trimmed = placeholder.trim();
        const translation = getHindiTranslation(trimmed);
        if (translation && translation !== trimmed) {
          if (!element.hasAttribute('data-original-placeholder')) {
            element.setAttribute('data-original-placeholder', placeholder);
          }
          element.setAttribute('placeholder', translation);
        }
      }
    }

    if (tagName === 'option') {
      const text = element.textContent || '';
      const trimmed = text.trim();
      const translation = getHindiTranslation(trimmed);
      if (translation && translation !== trimmed) {
        if (!(element as any).__originalText) {
          (element as any).__originalText = text;
        }
        element.textContent = translation;
      }
    }

    let child = element.firstChild;
    while (child) {
      translateElement(child);
      child = child.nextSibling;
    }
  }
}

function restoreElement(el: Node) {
  if (el.nodeType === Node.TEXT_NODE) {
    if ((el as any).__originalText !== undefined) {
      el.nodeValue = (el as any).__originalText;
    }
  } else if (el.nodeType === Node.ELEMENT_NODE) {
    const element = el as HTMLElement;
    const tagName = element.tagName.toLowerCase();
    if (tagName === 'script' || tagName === 'style' || tagName === 'code' || tagName === 'iframe') {
      return;
    }

    if (tagName === 'input' || tagName === 'textarea') {
      const origPlaceholder = element.getAttribute('data-original-placeholder');
      if (origPlaceholder) {
        element.setAttribute('placeholder', origPlaceholder);
      }
    }

    if (tagName === 'option') {
      if ((element as any).__originalText !== undefined) {
        element.textContent = (element as any).__originalText;
      }
    }

    let child = element.firstChild;
    while (child) {
      restoreElement(child);
      child = child.nextSibling;
    }
  }
}

let isTranslatingNow = false;

const DOMTranslator = () => {
  const { lang } = useTranslation();

  React.useEffect(() => {
    if (lang === 'hi') {
      translateElement(document.body);

      const observer = new MutationObserver((mutations) => {
        if (isTranslatingNow) return;
        isTranslatingNow = true;
        for (const mutation of mutations) {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              translateElement(node);
            });
          } else if (mutation.type === 'attributes' && mutation.attributeName === 'placeholder') {
            translateElement(mutation.target);
          }
        }
        isTranslatingNow = false;
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['placeholder']
      });

      return () => {
        observer.disconnect();
      };
    } else {
      restoreElement(document.body);
    }
  }, [lang]);

  return null;
};

import { AppLogo } from './components/AppLogo';
import { LogoDisplay } from './components/LogoDisplay';
import { PoweredByCNZ } from './components/PoweredByCNZ';
import { UserProfile, Venue, ServiceProvider, Booking, BookingPayment, UserRole, VenueType, Review, CatalogueItem, CatalogueLevel, SubscriptionPlan, UserSubscription, AppBanner, AppNotification, ServiceType, ServiceTypePhoto, FacilityItem } from './types';

declare var Razorpay: any;

// --- Constants ---
const VENUE_FACILITIES = [
  'ROOMS(AC)', 'ROOMS(NON AC)', 'DINNER HALL', 'WEDDING HALL', 'STAGE SITE', 
  'CATTERING HALL', 'PARKING SIDE', 'PARTY HALL', 'MEETING HALL', 'RESHORT SITE', 
  'RECEPTION SITE', 'GARDEN SITE', 'GROUND', 'INDOOR SITE', 'OUTDOOR SITE'
];

const VENUE_SITE_LEVELS = [
  'rooms(non ac)', 'rooms(ac)', 'wedding hall', 'dinner hall', 'reception', 
  'stage site', 'ground', 'garden', 'dinning hall', 'kitchin hall', 
  'parking site', 'party hall', 'seminar hall', 'meeting hall'
];

const EVENT_TYPES = [
  'WEDDING', 'SANGEET', 'ENGAGEMENT', 'HALDI', 'BIRTHDAY PARTY', 'ANIVVIVERSARY', 
  'CORPORATE EVENTS', 'SEMINAR', 'WORKSHOP', 'EXHIBITION', 'MUSIC CONCERT', 'SPECIAL OCCASION'
];

const VENUE_TYPES = [
  'marriage garden', 
  'hotel', 
  'marriage hall', 
  'restorent', 
  'community halls',
  'community hall'
].sort();

const SERVICE_TYPES = [
  'dj and sound service',
  'tent house',
  'photo and videography',
  'drone photo and videography',
  'stage decorator',
  'caterers',
  'halwai',
  'flower decorators',
  'dhol and bands',
  'ghoda gadi',
  'light decorators',
  'mehendi artist',
  'makeup artist',
  'fast foods service',
  'laundry services',
  'event cloth and jewelry',
  'musical group',
  'vehicle on rent',
  'pujari ji',
  'event managers',
  'helpers',
  'gifts and hampers',
  'other related services'
].sort();

const AVAILABLE_FOR_OPTIONS = [
  'marriage', 'party', 'function', 'meetings', 'special event', 'conferences'
].sort();

const VENUE_FACILITY_OPTIONS = [
  'ac rooms', 'non ac rooms', 'conference halls', 'lowns', 'parking', 'halls', 
  'dyning hall', 'marriage hall', 'party hall', 'meeting hall', 'enterence', 
  'securities', 'stage site', 'gardens', 'sweeming pools', 'receptions'
].sort();

const SERVICE_FACILITY_OPTIONS = [
  'service with full garrenty', 'doorstep service', 'supply service only', 
  'take from shope service', 'as per work service', 'delavery service'
].sort();

const getCurrentYear = () => {
  return new Date().getFullYear();
};

const formatTime12h = (timeStr: string | null | undefined) => {
  if (!timeStr) return '';
  try {
    // Handle timestamp strings that might be passed here
    if (timeStr.includes('T') || timeStr.includes('-')) {
      const d = new Date(timeStr);
      if (!isNaN(d.getTime())) {
        return format(d, 'hh:mm a');
      }
    }

    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    
    const hours = parts[0];
    const minutes = parts[1].split(' ')[0]; // Remove any trailing info like ' AM' or ' PM'
    
    const h = parseInt(hours);
    if (isNaN(h)) return timeStr;
    
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    const m = minutes.padStart(2, '0');
    return `${h12.toString().padStart(2, '0')}:${m} ${ampm}`;
  } catch (err) {
    return timeStr;
  }
};

const formatDateTime12h = (date: Date | string | null | undefined) => {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return typeof date === 'string' ? date : '';
    return format(d, 'dd/MM/yyyy hh:mm a');
  } catch {
    return typeof date === 'string' ? date : '';
  }
};

const formatDateDDMMYYYY = (date: Date | string | null | undefined) => {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return typeof date === 'string' ? date : '';
    return format(d, 'dd/MM/yyyy');
  } catch {
    return typeof date === 'string' ? date : '';
  }
};

const generateTransactionId = (ownerRegId: string, count: number, isManual: boolean = false) => {
  // Extract only the numeric part from the registration ID (e.g., BVOVO900001 -> 900001)
  const idNumber = ownerRegId.replace(/\D/g, '') || '000000';
  const type = isManual ? 'MB' : 'PB';
  // Serial number resets annually, passed as a count of bookings for the user in the current year
  const serial = (count + 1).toString().padStart(4, '0');
  return `BVO/${idNumber}/${type}/${serial}`;
};

const MultiSelect = ({ 
  label, 
  options, 
  selected, 
  onChange, 
  canAddCustom = false 
}: { 
  label: string, 
  options: string[], 
  selected: string[], 
  onChange: (items: string[]) => void,
  canAddCustom?: boolean
}) => {
  const [customValue, setCustomValue] = useState('');

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(i => i !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customValue.trim() && !selected.includes(customValue.trim())) {
      onChange([...selected, customValue.trim()]);
      setCustomValue('');
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-bold text-gray-700">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => toggleOption(opt)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-bold border transition-all",
              selected.includes(opt)
                ? "bg-orange-600 text-white border-orange-600 shadow-md"
                : "bg-white text-gray-500 border-gray-100 hover:border-orange-200"
            )}
          >
            {opt}
          </button>
        ))}
        {selected.filter(i => !options.includes(i)).map(custom => (
          <button
            key={custom}
            type="button"
            onClick={() => toggleOption(custom)}
            className="px-4 py-2 rounded-xl text-sm font-bold bg-orange-100 text-orange-600 border border-orange-200 flex items-center space-x-2"
          >
            <span>{custom}</span>
            <X size={14} />
          </button>
        ))}
      </div>
      {canAddCustom && (
        <div className="flex space-x-2">
          <input 
            type="text" 
            placeholder="Add custom... (e.g. Wi-Fi)"
            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
          />
          <button 
            type="button"
            onClick={handleAddCustom}
            className="px-4 py-2 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-colors"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
};

const AdminCharts = React.lazy(() => import('./components/AdminCharts'));
const QueryComplaintView = React.lazy(() => import('./components/QueryComplaintView'));

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    providerInfo: any[];
  }
}

export function handleDatabaseError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: undefined, // We'll get this from db if needed
      email: null,
      emailVerified: false,
      isAnonymous: false,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Database Error: ', JSON.stringify(errInfo));
  toast.error(`Database error: ${errInfo.error}`);
  throw new Error(JSON.stringify(errInfo));
}

export class ErrorBoundary extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || "";
      const isDatabasePermissionError = errorMessage.startsWith('{') && (
        errorMessage.toLowerCase().includes("permission") ||
        errorMessage.toLowerCase().includes("insufficient") ||
        errorMessage.toLowerCase().includes("unauthorized")
      );
      
      const isSessionExpired = localStorage.getItem('session_expired_flag') === 'true' || isDatabasePermissionError;

      if (isSessionExpired) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-amber-50 p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center border border-amber-100">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-amber-600" size={32} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">your session expired please login again</h1>
              <p className="text-gray-600 mb-6">
                Your session has expired or timed out due to inactivity. Please log in again to securely access your account.
              </p>
              <button 
                onClick={() => {
                  localStorage.removeItem('session_expired_flag');
                  localStorage.removeItem('custom_user');
                  localStorage.removeItem('custom_profile');
                  window.location.href = '/login';
                }}
                className="w-full bg-orange-600 text-white py-3 rounded-2xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-100"
              >
                Go to Login
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={64} />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-6">
              {this.state.error?.message?.startsWith('{') 
                ? "A database permission error occurred. Please check your security rules."
                : "An unexpected error occurred. Please try refreshing the page."}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-700 transition-all"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// --- Review Section Component ---

const AppRatingModal = ({ isOpen, onClose, user }: { isOpen: boolean, onClose: () => void, user: any }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [visitorName, setVisitorName] = useState(user?.displayName || '');
  const [visitorMobile, setVisitorMobile] = useState(user?.mobileNumber || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [existingFeedbackId, setExistingFeedbackId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (user) {
        setVisitorName(user.displayName || '');
        setVisitorMobile(user.mobileNumber || '');
      }
      fetchExistingFeedback();
    }
  }, [isOpen, user]);

  // Re-fetch if visitor manually changes mobile number
  useEffect(() => {
    if (isOpen && !user && visitorMobile.length === 10) {
      fetchExistingFeedback();
    }
  }, [visitorMobile, isOpen, user]);

  const fetchExistingFeedback = async () => {
    try {
      const vMobile = user?.mobileNumber || visitorMobile;
      if (!vMobile && !user?.uid) return;

      let query = db.from('app_feedback').select('*');
      
      if (user?.uid) {
        // Registered User: match by user_id OR their mobile
        const uid = user.uid;
        if (vMobile && vMobile.length === 10) {
          query = query.or(`user_id.eq.${uid},visitor_mobile.eq.${vMobile}`);
        } else {
          query = query.eq('user_id', uid);
        }
      } else if (vMobile && vMobile.length === 10) {
        // Visitor: match by mobile only
        query = query.eq('visitor_mobile', vMobile);
      } else {
        return;
      }

      const { data, error } = await query.maybeSingle();

      if (data && !error) {
        setExistingFeedbackId(data.id);
        setRating(data.rating || 5);
        setComment(data.comment || '');
        if (!user) {
          setVisitorName(data.user_name || '');
          setVisitorMobile(data.visitor_mobile || '');
        }
      } else {
        // Reset if no record found for the new mobile
        setExistingFeedbackId(null);
      }
    } catch (err) {
      console.error('Error fetching existing feedback:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }
    const currentName = user?.displayName || visitorName;
    const currentMobile = user?.mobileNumber || visitorMobile;

    if (!currentName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!currentMobile.trim() || !/^\d{10}$/.test(currentMobile)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsSubmitting(true);
    try {
      const feedbackData: any = {
        id: generateUUID(),
        user_id: user?.uid || null,
        user_name: currentName,
        visitor_mobile: currentMobile,
        rating,
        comment,
        created_at: new Date().toISOString()
      };

      // Best effort to find existing record ID just before submission
      let finalId = existingFeedbackId;
      if (!finalId) {
        let checkQuery = db.from('app_feedback').select('id');
        if (user?.uid) {
          checkQuery = checkQuery.or(`user_id.eq.${user.uid},visitor_mobile.eq.${currentMobile}`);
        } else {
          checkQuery = checkQuery.eq('visitor_mobile', currentMobile);
        }
        const { data: doubleCheck } = await checkQuery.maybeSingle();
        finalId = doubleCheck?.id;
      }

      if (finalId) {
        const { error } = await db.from('app_feedback').update(feedbackData).eq('id', finalId);
        if (error) throw error;
        toast.success('Your app feedback has been updated!');
      } else {
        const { error } = await db.from('app_feedback').insert([feedbackData]);
        if (error) throw error;
        toast.success('Thank you for your feedback!');
      }
      
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 3000);
    } catch (err: any) {
      toast.error(`Failed to submit feedback: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden"
      >
        {isSuccess ? (
          <div className="p-12 text-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12 }}
              className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Check size={40} strokeWidth={3} />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
            <p className="text-gray-600 mb-8">Your feedback has been successfully recorded. We appreciate your support!</p>
            <button 
              onClick={onClose}
              className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition-all"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-black text-gray-900">
                  {existingFeedbackId ? 'Update Your Feedback' : 'Rate Our App'}
                </h3>
                <p className="text-sm text-gray-500">We value your opinion!</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {existingFeedbackId && (
              <div className="mb-6 bg-orange-50 border border-orange-100 p-4 rounded-2xl flex items-start space-x-3">
                <ShieldCheck className="text-orange-600 mt-1 shrink-0" size={18} />
                <div>
                  <span className="block text-xs font-bold text-orange-700 uppercase tracking-wider mb-1">Existing feedback found!</span>
                  <p className="text-[10px] text-orange-600 leading-tight">Your previous ratings and comments are loaded. Submitting will update your existing feedback instead of creating a duplicate.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ... existing form fields ... */}
            <div className="flex flex-col items-center py-4 bg-orange-50 rounded-2xl">
              <span className="text-sm font-bold text-orange-600 mb-3 uppercase tracking-wider">Your Experience</span>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star 
                      size={36} 
                      fill={star <= rating ? "currentColor" : "none"}
                      className={star <= rating ? 'text-yellow-500' : 'text-gray-300'} 
                    />
                  </button>
                ))}
              </div>
            </div>

            {!user && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Your Name</label>
                  <input 
                    type="text"
                    required
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Mobile Number</label>
                  <input 
                    type="tel"
                    required
                    maxLength={10}
                    pattern="[0-9]{10}"
                    value={visitorMobile}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setVisitorMobile(val);
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    placeholder="10-digit mobile number"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Feedback</label>
              <textarea 
                required
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                placeholder="What do you think about our app?"
              />
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-200 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        </div>
        )}
      </motion.div>
    </div>
  );
};

// --- Review System ---
const ReviewSection = ({ 
  targetId, 
  targetType, 
  targetName, 
  currentRating, 
  onReviewAdded,
  user 
}: { 
  targetId: string, 
  targetType: 'venue' | 'service', 
  targetName: string, 
  currentRating: number, 
  onReviewAdded: () => void,
  user: any 
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [visitorName, setVisitorName] = useState(user?.displayName || '');
  const [visitorMobile, setVisitorMobile] = useState(user?.mobileNumber || '');
  const [hasExistingReview, setHasExistingReview] = useState(false);
  
  const fetchReviews = async () => {
    const { data } = await db.from('reviews').select('*').eq('target_id', targetId).order('created_at', { ascending: false });
    if (data) {
      const uniqueReviews: Review[] = [];
      const seenIds = new Set();
      
      data.forEach(d => {
        if (!seenIds.has(d.id)) {
          seenIds.add(d.id);
          uniqueReviews.push({
            id: d.id,
            userId: d.user_id,
            userName: d.visitor_name,
            visitorMobile: d.visitor_mobile,
            rating: d.rating,
            comment: d.comment,
            createdAt: d.created_at
          } as Review);
        }
      });
      setReviews(uniqueReviews);
      
      // Auto-populate for current user if they have a review
      const currentMobile = user?.mobileNumber || visitorMobile;
      const myReview = data.find(r => 
        (user?.uid && r.user_id === user.uid) || 
        (currentMobile && r.visitor_mobile === currentMobile)
      );
      if (myReview) {
        setHasExistingReview(true);
        setRating(myReview.rating);
        setComment(myReview.comment);
        if (!user) {
          setVisitorName(myReview.visitor_name);
          setVisitorMobile(myReview.visitor_mobile);
        }
      } else {
        setHasExistingReview(false);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      setVisitorName(user.displayName || '');
      setVisitorMobile(user.mobileNumber || '');
    }
    fetchReviews();
  }, [targetId, user]);

  // Re-check for existing review if visitor manually changes mobile number
  useEffect(() => {
    if (!user && visitorMobile.length === 10) {
      fetchReviews();
    }
  }, [visitorMobile, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentName = user?.displayName || visitorName;
    const currentMobile = user?.mobileNumber || visitorMobile;

    if (currentMobile.length !== 10) {
      toast.error('Mobile number must be 10 digits');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Check if this visitor/user already reviewed this target
      let existingReviewData = null;
      
      if (user?.uid) {
        const { data: byUser } = await db.from('reviews')
          .select('id')
          .eq('target_id', targetId)
          .eq('user_id', user.uid)
          .maybeSingle();
        
        if (byUser) {
          existingReviewData = byUser;
        } else {
          // Fallback to mobile if user record not found but mobile matches
          const { data: byMobile } = await db.from('reviews')
            .select('id')
            .eq('target_id', targetId)
            .eq('visitor_mobile', currentMobile)
            .maybeSingle();
          existingReviewData = byMobile;
        }
      } else {
        const { data: byMobile } = await db.from('reviews')
          .select('id')
          .eq('target_id', targetId)
          .eq('visitor_mobile', currentMobile)
          .maybeSingle();
        existingReviewData = byMobile;
      }

      const reviewPayload = {
        visitor_name: currentName,
        visitor_mobile: currentMobile,
        rating,
        comment,
        user_id: user?.uid || null,
        updated_at: new Date().toISOString()
      };

      if (existingReviewData) {
        const { error } = await db.from('reviews').update(reviewPayload).eq('id', existingReviewData.id);
        if (error) throw error;
        toast.success('Your review has been updated!');
      } else {
        const { error } = await db.from('reviews').insert([{
          id: generateUUID(),
          ...reviewPayload,
          target_id: targetId,
          created_at: new Date().toISOString()
        }]);
        if (error) throw error;
        toast.success('Review submitted successfully!');
      }
      
      // Update the average rating and review count on the target
      await fetchTargetData();
      
      setComment('');
      if (!user) {
        setVisitorName('');
        setVisitorMobile('');
      }
      await fetchReviews();
      onReviewAdded();
    } catch (err) {
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchTargetData = async () => {
    // Recalculate rating from all reviews for accuracy
    const { data: allReviews } = await db.from('reviews').select('rating').eq('target_id', targetId);
    if (allReviews && allReviews.length > 0) {
      const avg = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;
      const table = targetType === 'venue' ? 'venues' : 'service_providers';
      await db.from(table).update({ 
        rating: Math.round(avg * 10) / 10, 
        review_count: allReviews.length 
      }).eq('id', targetId);
    }
  };

  return (
    <div id="reviews" className="mt-12 space-y-8">
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {hasExistingReview ? 'Edit Your Review' : `Rate & Review ${targetName}`}
          </h3>
          {hasExistingReview && (
            <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-orange-100 flex items-center">
              <RotateCcw size={12} className="mr-1" />
              Updating Existing Review
            </span>
          )}
        </div>
        {hasExistingReview && (
          <div className="mb-6 bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start space-x-3">
            <Info className="text-blue-600 mt-1 shrink-0" size={18} />
            <div>
              <span className="block text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">Duplicate Entry Prevented</span>
              <p className="text-[10px] text-blue-600 leading-tight">
                {user ? "A review from your account already exists. " : "A review matching your mobile number already exists. "}
                Submitting this form will replace your previous review data with the new values.
              </p>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none"
              >
                <Star
                  size={32}
                  className={cn(
                    "transition-all",
                    star <= rating ? "text-yellow-500 fill-yellow-500 scale-110" : "text-gray-300"
                  )}
                />
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              required
              type="text"
              placeholder="Your Name"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
            />
            <input
              required
              type="tel"
              maxLength={10}
              pattern="[0-9]{10}"
              placeholder="Your Mobile Number"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
              value={visitorMobile}
              onChange={(e) => setVisitorMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
            />
          </div>
          <textarea
            required
            placeholder="Tell us about your experience..."
            rows={4}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "w-full bg-orange-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-orange-100 transition-all",
              isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-orange-700"
            )}
          >
            {isSubmitting ? 'Submitting...' : hasExistingReview ? 'Update My Review' : 'Submit Review'}
          </button>
        </form>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-2xl font-bold text-gray-900">Guest Reviews ({reviews.length})</h3>
          
          <div className="inline-flex items-center bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100 space-x-4">
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-black text-gray-900 leading-none">{currentRating || '0.0'}</span>
              <div className="flex items-center text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill={i < Math.round(currentRating) ? "currentColor" : "none"} className={i < Math.round(currentRating) ? "text-yellow-500" : "text-gray-200"} />
                ))}
              </div>
            </div>
            <div className="h-10 w-px bg-gray-100" />
            <div className="text-left">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                Average Rating
              </p>
              <p className="text-xs font-black text-gray-900">{reviews.length} Experiences</p>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-10">
            <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => {
              const currentMobile = user?.mobileNumber || visitorMobile;
              const isMyReview = (user?.uid && review.userId === user.uid) || 
                                 (currentMobile && review.visitorMobile === currentMobile);
              return (
                <div key={review.id} className={cn(
                  "bg-white p-6 rounded-3xl border shadow-sm transition-all",
                  isMyReview ? "border-orange-500 ring-2 ring-orange-500/10" : "border-gray-100"
                )}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-gray-900">{review.userName}</h4>
                          {isMyReview && (
                            <span className="bg-orange-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-tighter">Your Review</span>
                          )}
                        </div>
                        <div className="flex items-center mt-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={14}
                              className={cn(
                                s <= review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-200"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatDateDDMMYYYY(review.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-600 italic">"{review.comment}"</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">No reviews yet. Be the first to share your experience!</p>
          </div>
        )}
      </div>
    </div>
  );
};

const VideoUpload = ({ 
  onUpload, 
  label = "Upload Video", 
  currentVideo = "",
  multiple = false
}: { 
  onUpload: (url: string) => void | Promise<any>, 
  label?: string,
  currentVideo?: string,
  multiple?: boolean
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (!file.type.startsWith('video/')) {
            toast.error(`File ${file.name} is not a video`);
            continue;
          }

          // Check duration
          const video = document.createElement('video');
          video.preload = 'metadata';
          try {
            await new Promise<void>((resolve, reject) => {
              video.onloadedmetadata = function() {
                window.URL.revokeObjectURL(video.src);
                if (video.duration > 60) { 
                  toast.error(`Video ${file.name} is too long (max 60 seconds)`);
                  reject('duration');
                } else {
                  resolve();
                }
              };
              video.onerror = () => reject('metadata');
              video.src = URL.createObjectURL(file);
            });
            await uploadFile(file);
          } catch (err) {
            if (err === 'metadata') toast.error(`Could not load video metadata for ${file.name}`);
          }
      }
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const uploadFile = async (file: File) => {
    try {
      const filePath = `uploads/videos/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const { error } = await db.storage
        .from('images') 
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type // Explicitly set content type for videos
        });

      if (error) throw error;

      const { data: { publicUrl } } = db.storage
        .from('images')
        .getPublicUrl(filePath);

      await onUpload(publicUrl);
      toast.success(`Video ${file.name} uploaded`);
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error(err.message || 'Failed to upload video');
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-gray-700">{label}</label>
      <div className="flex items-center space-x-4">
        <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center group">
          {currentVideo ? (
            <video src={resolveUrl(currentVideo)} className="w-full h-full object-cover" />
          ) : (
            <Video className="text-gray-300" size={32} />
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <Loader className="animate-spin text-orange-600" size={20} />
            </div>
          )}
        </div>
        <label className="cursor-pointer bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-all shadow-sm">
          <Upload size={16} />
          <span>{isUploading ? 'Uploading...' : 'Select Video'}</span>
          <input 
            ref={fileInputRef}
            type="file" 
            className="hidden" 
            accept="video/*" 
            multiple={multiple}
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      </div>
      <p className="text-[10px] text-gray-400 italic">Max duration: 60 seconds. Suggested: High quality 1080p.</p>
    </div>
  );
};

const ImageUpload = ({ 
  onUpload, 
  label = "Upload Image", 
  currentImage = "",
  multiple = false,
  isCircle = false
}: { 
  onUpload: (url: string | string[]) => void | Promise<any>, 
  label?: string,
  currentImage?: string,
  multiple?: boolean,
  isCircle?: boolean
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    setIsUploading(true);
    
    try {
      const uploadPromises = files.map(async (file) => {
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
          throw new Error(`File ${file.name} is not a valid image`);
        }

        if (file.size > 20 * 1024 * 1024) { 
          throw new Error(`File ${file.name} is too large (max 20MB)`);
        }

        if (file.type === 'image/gif') {
          return await uploadRawFile(file);
        } else {
          return await processAndUpload(file);
        }
      });

      const urls = await Promise.all(uploadPromises);
      const filteredUrls = urls.filter(u => u) as string[];
      
      if (filteredUrls.length > 0) {
        if (multiple) {
          await onUpload(filteredUrls);
        } else {
          await onUpload(filteredUrls[0]);
        }
      }
    } catch (err: any) {
      console.error('Final upload error:', err);
      toast.error(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const processAndUpload = async (file: File): Promise<string | null> => {
    try {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      const SIZE = 1200; // Increased size slightly
      canvas.width = SIZE;
      canvas.height = SIZE;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Fill with white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, SIZE, SIZE);

      // Fit image into square frame while maintaining aspect ratio (object-contain behavior)
      const scale = Math.min(SIZE / img.width, SIZE / img.height);
      const x = (SIZE / 2) - (img.width / 2) * scale;
      const y = (SIZE / 2) - (img.height / 2) * scale;
      const width = img.width * scale;
      const height = img.height * scale;

      ctx.drawImage(img, x, y, width, height);

      const blob = await new Promise<Blob | null>((resolve) => 
        canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.85)
      );

      if (!blob) throw new Error('Failed to process image');

      const filePath = `uploads/${Date.now()}_${Math.random().toString(36).substr(2, 5)}_${file.name.replace(/\s+/g, '_')}.jpg`;
      
      const { error } = await db.storage
        .from('images')
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/jpeg'
        });

      if (error) throw error;

      const { data: { publicUrl } } = db.storage
        .from('images')
        .getPublicUrl(filePath);

      URL.revokeObjectURL(img.src);
      return publicUrl;
    } catch (err) {
      console.error('Process error:', err);
      throw err;
    }
  };

  const uploadRawFile = async (file: File): Promise<string | null> => {
    try {
      const filePath = `uploads/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const { error } = await db.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (error) throw error;

      const { data: { publicUrl } } = db.storage
        .from('images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.error('Raw upload error:', err);
      throw err;
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-gray-700">{label}</label>
      <div className="flex items-center space-x-4">
        <div className={cn(
          "relative w-24 h-24 overflow-hidden bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center group",
          isCircle ? "rounded-full" : "rounded-2xl"
        )}>
          {currentImage ? (
            <div className="relative w-full h-full group">
              <img src={resolveUrl(currentImage)} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onUpload('');
                }}
                className="absolute top-1 right-1 bg-red-600 text-white p-1.5 rounded-full shadow-lg hover:bg-red-700 transition-colors z-10"
                title="Remove Photo"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ) : (
            <ImageIcon className="text-gray-300" size={32} />
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <Loader className="animate-spin text-orange-600" size={20} />
            </div>
          )}
        </div>
        <label className="cursor-pointer bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-all shadow-sm">
          <Upload size={16} />
          <span>{isUploading ? 'Uploading...' : 'Select File'}</span>
          <input 
            ref={fileInputRef}
            type="file" 
            className="hidden" 
            accept="image/*" 
            multiple={multiple}
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      </div>
      <p className="text-[10px] text-gray-400 italic">Supported formats: JPEG, PNG, WEBP, GIF (Max 20MB). Suggested dimensions: 1200x1200px (1:1 ratio).</p>
    </div>
  );
};

const DatabaseStatusIndicator = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [errCode, setErrCode] = useState<string | null>(null);
  const [outboundIp, setOutboundIp] = useState<string | null>(null);
  const [troubleshooting, setTroubleshooting] = useState<string[]>([]);

  useEffect(() => {
    const check = async () => {
      const offline = (window as any).forceOffline || false;
      setIsOffline(offline);
      if (offline && !dbError) {
        try {
          const response = await fetch('/api/health');
          const data = await response.json();
          if (data.status === 'error') {
            setDbError(data.error_message || "Database connection failed");
            setErrCode(data.error_code || "ETIMEDOUT");
            setOutboundIp(data.outbound_ip || "Unknown");
            setTroubleshooting(data.troubleshooting || []);
          }
        } catch (e) {
          // Fallback if network is completely unreachable
        }
      }
    };
    
    check();
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, [dbError]);

  const handleReconnect = async () => {
    setIsChecking(true);
    try {
      const response = await fetch('/api/health?force=true');
      const result = await response.json();
      
      if (response.ok && result.status === 'ok') {
        // Force back to online
        (window as any).forceOffline = false;
        setIsOffline(false);
        setDbError(null);
        toast.success('Database reconnected successfully!');
        window.location.reload(); // Refresh to resync
      } else {
        const errorMsg = result.error_message || result.error || result.database || 'Database is still unreachable.';
        toast.error(errorMsg);
        setDbError(errorMsg);
        setErrCode(result.error_code || "ETIMEDOUT");
        setOutboundIp(result.outbound_ip || "Unknown");
        setTroubleshooting(result.troubleshooting || []);
        console.warn('Reconnect failed:', result);
      }
    } catch (err) {
      toast.error('Connection failed (Network error).');
    } finally {
      setIsChecking(false);
    }
  };

  if (!isOffline) return null;

  return (
    <div className="flex items-center space-x-2 bg-red-50 border border-red-100 px-3 py-1.5 rounded-xl cursor-default group relative">
      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
      <span className="text-[10px] font-black text-red-600 uppercase tracking-tight">Offline Mode</span>
      <button 
        onClick={handleReconnect}
        disabled={isChecking}
        className="ml-2 text-[9px] font-black bg-red-600 text-white px-2 py-0.5 rounded-lg hover:bg-red-700 transition-colors uppercase"
      >
        {isChecking ? '...' : 'Retry'}
      </button>
      
      {/* Tooltip */}
      <div className="absolute top-full right-0 mt-2 w-72 p-4 bg-white rounded-2xl shadow-xl border border-red-100 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-[100] text-left">
        <p className="text-xs text-gray-800 font-extrabold mb-1">
          MySQL Connection Failure ({errCode || "ETIMEDOUT"})
        </p>
        <p className="text-[10px] text-red-600 font-semibold mb-2 leading-snug break-words">
          Error: {dbError || "Connection timed out. MySQL host not responding."}
        </p>
        {outboundIp && (
          <div className="bg-gray-50 border border-gray-100 p-1.5 rounded-lg mb-2 flex justify-between items-center text-[9px]">
            <span className="text-gray-500 font-medium">Your Outbound IP:</span>
            <code className="text-orange-600 font-black">{outboundIp}</code>
          </div>
        )}
        <div className="space-y-1">
          <p className="text-[9px] text-gray-800 font-extrabold uppercase tracking-wider">Troubleshooting Steps:</p>
          <ul className="text-[9px] text-gray-600 list-disc pl-3.5 space-y-1 font-medium">
            {troubleshooting.length > 0 ? (
              troubleshooting.map((step, idx) => (
                <li key={idx} className="leading-tight">{step}</li>
              ))
            ) : (
              <>
                <li className="leading-tight">Go to CPanel/Hostinger -&gt; Remote MySQL</li>
                <li className="leading-tight">Add <code className="bg-gray-100 px-1 rounded text-red-500">%</code> to whitelist all IPs</li>
                <li className="leading-tight">Verify Host, Port, and Credentials in settings</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

const Navbar = ({ user, profile, onLogout, onRateApp }: { user: any, profile: UserProfile | null, onLogout: () => void, onRateApp: () => void }) => {
  const { lang, setLang, t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && profile && (profile.role === 'owner' || profile.role === 'provider')) {
      const fetchPending = async () => {
        const { count, error } = await db
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', user?.uid)
          .eq('status', 'pending');
        
        if (!error) setPendingCount(count || 0);
      };

      fetchPending();

      const subscription = db
        .channel(`pending_bookings_${user?.uid}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'bookings',
          filter: `owner_id=eq.${user?.uid}`
        }, fetchPending)
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user, profile]);

  const handleLogout = async () => {
    await db.auth.signOut();
    onLogout();
    navigate('/');
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center group">
              <AppLogo size="md" />
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-1 text-gray-600 hover:text-orange-600 font-bold transition-all bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 hover:bg-orange-50">
                <Home size={18} />
                <span>{t('home')}</span>
              </Link>
              
              <Link to="/gallery" className="text-gray-600 hover:text-orange-600 font-medium transition-colors">{t('gallery')}</Link>
              <Link to="/search" className="text-gray-600 hover:text-orange-600 font-medium transition-colors">{t('search')}</Link>
              <Link to="/about" className="text-gray-600 hover:text-orange-600 font-medium transition-colors">{t('about')}</Link>
              
              <DatabaseStatusIndicator />
              
              <button 
                onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-bold transition-all bg-blue-50 px-4 py-2 rounded-xl border border-blue-100"
              >
                <span>{lang === 'en' ? 'हिन्दी' : 'English'}</span>
              </button>

              {user ? (
                <div className="flex items-center space-x-4">
                  {profile?.role === 'admin' ? (
                    <Link to="/admin" className="bg-red-600 text-white px-5 py-2 rounded-full font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200">{t('Admin Panel')}</Link>
                  ) : (
                    <Link to="/dashboard" className="bg-orange-600 text-white px-5 py-2 rounded-full font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-200">{t('Dashboard')}</Link>
                  )}
                  <button 
                    onClick={handleLogout} 
                    className="flex items-center space-x-1.5 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 px-4 py-2 rounded-full font-bold transition-all border border-gray-200"
                  >
                    <LogOut size={16} />
                    <span>{t('Logout')}</span>
                  </button>
                </div>
              ) : (
                <>
                  <Link to="/registration" className="text-gray-600 hover:text-orange-600 font-medium transition-colors">{t('registration')}</Link>
                  <Link to="/login" className="bg-orange-600 text-white px-6 py-2 rounded-full font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-200">{t('login')}</Link>
                </>
              )}
            </div>

            <div className="md:hidden flex items-center space-x-3">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 p-1">
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
    <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="md:hidden bg-white border-b border-orange-100 overflow-hidden"
          >
          <div className="px-4 py-6 space-y-2">
            {[
              { to: "/", label: "Home", icon: <Home size={18} />, primary: true },
              { to: "/gallery", label: "Gallery", icon: <ImageIcon size={18} /> },
              { to: "/search", label: "Search", icon: <Search size={18} /> },
              { to: "/about", label: "About", icon: <Info size={18} /> },
            ].map((item) => (
              <Link 
                key={item.to}
                to={item.to} 
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all",
                  item.primary ? "text-orange-600 font-bold bg-orange-50" : "text-gray-600 font-medium hover:bg-gray-50"
                )}
              >
                {item.icon}
                <span>{t(item.label)}</span>
              </Link>
            ))}

            <button 
              onClick={() => {
                setLang(lang === 'en' ? 'hi' : 'en');
                setIsMenuOpen(false);
              }}
              className="flex items-center space-x-3 px-4 py-3 w-full text-blue-600 font-bold bg-blue-50 rounded-2xl transition-all mt-2"
            >
              <Globe size={18} />
              <span>{lang === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>

            {user ? (
              <div className="pt-4 mt-4 border-t border-gray-100 space-y-2">
                <Link 
                  to={profile?.role === 'admin' ? "/admin" : "/dashboard"} 
                  className="flex items-center space-x-3 px-4 py-3 text-orange-600 font-bold bg-orange-50 rounded-2xl transition-all" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LayoutDashboard size={18} />
                  <span>{profile?.role === 'admin' ? t('Admin Panel') : t('Dashboard')}</span>
                </Link>
                <button 
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center space-x-3 px-4 py-3 w-full text-red-600 font-bold bg-red-50 hover:bg-red-100 rounded-2xl transition-all mt-2"
                >
                  <LogOut size={18} />
                  <span>{t('Logout')}</span>
                </button>
              </div>
            ) : (
              <div className="pt-4 mt-4 border-t border-gray-100 space-y-2">
                <Link to="/login" className="flex items-center space-x-3 px-4 py-3 text-orange-600 font-bold bg-orange-50 rounded-2xl transition-all" onClick={() => setIsMenuOpen(false)}>
                  <LogIn size={18} />
                  <span>{t('Login')}</span>
                </Link>
                <Link to="/registration" className="flex items-center space-x-3 px-4 py-3 text-gray-600 font-medium hover:bg-gray-50 rounded-2xl transition-all" onClick={() => setIsMenuOpen(false)}>
                  <UserPlus size={18} />
                  <span>{t('Registration')}</span>
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
      </nav>
    </>
  );
};

const Hero = ({ banners }: { banners: AppBanner[] }) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const navigate = useNavigate();
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    if (banners.length > 0) {
      const timer = setInterval(() => {
        setCurrentBanner(prev => (prev + 1) % banners.length);
      }, 15000);
      return () => clearInterval(timer);
    }
  }, [banners.length]);

  const states = Object.keys(LOCATION_DATA || {});
  const districts = selectedState ? Object.keys(LOCATION_DATA[selectedState] || {}) : [];
  const blocks = (selectedState && selectedDistrict && LOCATION_DATA[selectedState]) ? (LOCATION_DATA[selectedState][selectedDistrict] || []) : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (selectedState) params.set('state', selectedState);
    if (selectedDistrict) params.set('district', selectedDistrict);
    if (selectedBlock) params.set('block', selectedBlock);
    navigate(`/search?${params.toString()}`);
  };

  const defaultBanner = "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=2000";

  return (
    <div className="relative h-[750px] md:h-[850px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.img 
            key={banners[currentBanner]?.imageUrl || 'default'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            src={resolveUrl(banners[currentBanner]?.imageUrl) || defaultBanner} 
            alt="Wedding Venue" 
            className="w-full h-full object-cover brightness-50"
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>
      </div>
      
      <div className="relative z-10 max-w-6xl w-full px-4 text-center">
        {/* Highlighted Navigation Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          <Link to="/registration?role=owner" className="bg-orange-600/90 backdrop-blur-sm text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-orange-700 transition-all shadow-lg border border-orange-500/50 flex items-center space-x-2">
            <Building2 size={16} />
            <span>{t('joinAsOwner')}</span>
          </Link>
          <Link to="/registration?role=provider" className="bg-white/10 backdrop-blur-sm text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-white/20 transition-all border border-white/30 flex items-center space-x-2">
            <Briefcase size={16} />
            <span>{t('joinAsProvider')}</span>
          </Link>
          <Link to="/registration" className="bg-pink-600/90 backdrop-blur-sm text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-pink-700 transition-all shadow-lg border border-pink-500/50 flex items-center space-x-2">
            <UserPlus size={16} />
            <span>{t('register')}</span>
          </Link>
          <Link to="/login" className="bg-white text-orange-600 px-5 py-2.5 rounded-full font-bold text-sm hover:bg-orange-50 transition-all shadow-lg flex items-center space-x-2">
            <LogIn size={16} />
            <span>{t('login')}</span>
          </Link>
        </motion.div>

        <motion.form 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSearch}
          className="bg-white/95 backdrop-blur-md p-6 rounded-[3rem] shadow-2xl space-y-4 max-w-5xl mx-auto border border-white/20"
        >
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="flex-1 flex items-center px-4 py-3 border border-gray-100 rounded-2xl w-full">
              <Search className="text-orange-500 mr-3" size={20} />
              <input 
                type="text" 
                placeholder={t('searchPlaceholder')} 
                className="w-full focus:outline-none text-gray-700 bg-transparent"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select 
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedDistrict('');
                setSelectedBlock('');
              }}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
            >
              <option value="">{t('allStates')}</option>
              {states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select 
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setSelectedBlock('');
              }}
              disabled={!selectedState}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none disabled:opacity-50"
            >
              <option value="">{t('allDistricts')}</option>
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select 
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              disabled={!selectedDistrict}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none disabled:opacity-50"
            >
              <option value="">{t('allBlocks')}</option>
              {blocks.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <button 
            type="submit"
            className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-700 transition-all shadow-lg shadow-orange-200"
          >
            {t('searchNow')}
          </button>
        </motion.form>
      </div>
    </div>
  );
};

const CategorySection = ({ onInteraction }: { onInteraction?: (enabled: boolean) => void }) => {
  return (
    <section 
      className="py-16 md:py-24 bg-white overflow-hidden relative group/section" 
      onMouseEnter={() => onInteraction?.(false)}
      onMouseLeave={() => onInteraction?.(true)}
      onFocus={() => onInteraction?.(false)}
      onBlur={() => onInteraction?.(true)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6">
            Explore by <span className="text-orange-600">Category</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">Discover everything you need for your event with our curated categories.</p>
        </div>
        <CategoryDisplay />
      </div>
    </section>
  );
};

const CategoryDisplay = () => {
  const navigate = useNavigate();
  const [allUploadedPhotos, setAllUploadedPhotos] = useState<any[]>([]);
  
  const defaultCategories = [
    { name: 'Venues', image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=400', link: '/venues' },
    { name: 'Catering', image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=400', link: '/services?type=caterers', serviceType: 'caterers' },
    { name: 'DJ & Music', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=400', link: '/services?type=dj and sound service', serviceType: 'dj and sound service' },
    { name: 'Tent House', image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=400', link: '/services?type=tent house', serviceType: 'tent house' },
    { name: 'Photography', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400', link: '/services?type=photo and videography', serviceType: 'photo and videography' },
    { name: 'Makeup', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=400', link: '/services?type=makeup artist', serviceType: 'makeup artist' },
    { name: 'Decoration', image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=400', link: '/services?type=light decorators', serviceType: 'light decorators' },
    { name: 'Event Manager', image: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&q=80&w=400', link: '/services?type=event managers', serviceType: 'event managers' },
    { name: 'Pandit Ji', image: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80&w=400', link: '/services?type=pujari ji', serviceType: 'pujari ji' },
    { name: 'Mehendi', image: 'https://images.unsplash.com/photo-1542642837-739074a911c0?auto=format&fit=crop&q=80&w=400', link: '/services?type=mehendi artist', serviceType: 'mehendi artist' },
    { name: 'Drone', image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&q=80&w=400', link: '/services?type=drone photo and videography', serviceType: 'drone photo and videography' },
    { name: 'Rentals', image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=400', link: '/services?type=event cloth and jewelry', serviceType: 'event cloth and jewelry' },
    { name: 'Halwai', image: 'https://images.unsplash.com/photo-1589676062352-b19035222f5f?auto=format&fit=crop&q=80&w=400', link: '/services?type=halwai', serviceType: 'halwai' },
    { name: 'Waiters', image: 'https://images.unsplash.com/photo-1590650153855-d9e808231d41?auto=format&fit=crop&q=80&w=400', link: '/services?type=helpers', serviceType: 'helpers' },
    { name: 'Dhol Bands', image: 'https://images.unsplash.com/photo-1514525253344-f814d074358a?auto=format&fit=crop&q=80&w=400', link: '/services?type=dhol and bands', serviceType: 'dhol and bands' },
    { name: 'Flower Decor', image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=400', link: '/services?type=flower decorators', serviceType: 'flower decorators' },
  ];
  
  const [displayCategories, setDisplayCategories] = useState<any[]>(defaultCategories);

  useEffect(() => {
    const fetchPhotos = async () => {
      const { data } = await db.from('service_type_photos').select('*');
      if (data && data.length > 0) {
        setAllUploadedPhotos(data);
        
        const uploadedCategories = data.map((p: any) => ({
          name: p.service_type || 'Special Service',
          image: p.image_url,
          serviceType: p.service_type,
          isUploaded: true
        }));
        
        setDisplayCategories(uploadedCategories);
      } else {
        // Keep keeping defaults if nothing uploaded
        setDisplayCategories(defaultCategories);
      }
    };
    fetchPhotos();
    
    const channel = db.channel('category_photos_display')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_type_photos' }, fetchPhotos)
      .subscribe();
      
    return () => { db.removeChannel(channel); };
  }, []);

  const getNavigatePath = (type: string, name: string) => {
    const searchTerm = (type || name).toLowerCase();
    return `/search?q=${encodeURIComponent(searchTerm)}`;
  };

  return (
    <div className="relative overflow-hidden min-h-[200px] flex items-center justify-center">
      {displayCategories.length > 0 ? (
        <div className="flex animate-marquee-ltr space-x-8 py-10 w-max hover:[animation-play-state:paused]">
          {[...displayCategories, ...displayCategories].map((cat: any, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.02 }}
              className="flex-shrink-0 w-64 h-80 relative rounded-[2rem] overflow-hidden group cursor-pointer shadow-xl border border-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                navigate(getNavigatePath(cat.serviceType || '', cat.name));
              }}
            >
              <div className="block w-full h-full text-left">
                {(cat.image && (cat.image.includes('.mp4') || cat.image.includes('video'))) ? (
                  <video 
                    src={resolveUrl(cat.image)} 
                    className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                    autoPlay 
                    muted 
                    loop 
                    playsInline
                  />
                ) : (
                  <img 
                    src={resolveUrl(cat.image)} 
                    alt={cat.name}
                    className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className="absolute inset-x-0 bottom-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 flex items-center justify-center">
                  <h3 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em] text-center line-clamp-1">{cat.name}</h3>
                </div>
                {cat.isUploaded && (
                  <div className="absolute top-4 right-4 bg-orange-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter z-20">
                    Pro
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-400 font-medium font-mono text-sm uppercase tracking-widest">Explore diverse categories soon...</p>
        </div>
      )}
    </div>
  );
};

// --- Utilities ---


const VenueCard = ({ venue }: { venue: Venue, key?: any }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100"
  >
    <Link to={`/venues/${venue.id}`}>
      <div className="relative h-56">
        <img 
          src={resolveUrl(venue.images?.[0]) || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800'} 
          alt={venue.name} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{venue.name}</h3>
          <div className="flex items-center space-x-1 bg-orange-50 px-2 py-0.5 rounded-lg">
            <Star size={12} className="text-yellow-500 fill-yellow-500" />
            <span className="text-[10px] font-bold text-orange-700">
              {venue.rating > 0 ? `${venue.rating} (${venue.reviewCount || 0})` : 'New'}
            </span>
          </div>
        </div>
        <div className="flex items-center text-gray-500 text-sm mb-3">
          <MapPin size={14} className="mr-1" />
          <span>{venue.district}, {venue.state}</span>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="text-orange-600 font-bold text-sm">
            <IndianRupee size={12} className="inline mr-1" />
            {(venue.pricePerDay || 0).toLocaleString()}/day
          </div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{venue.venueType}</div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <div className="flex items-center text-gray-600 text-sm">
            <Users size={14} className="mr-1" />
            <span>Up to {venue.capacity} guests</span>
          </div>
          <button className="text-orange-600 font-bold text-sm hover:underline">View Details</button>
        </div>
      </div>
    </Link>
  </motion.div>
);

const ServiceCard = ({ service }: { service: ServiceProvider, key?: any }) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100"
    >
      <Link to={`/services/${service.id}`}>
        <div className="relative h-48">
          <img 
            src={resolveUrl(service.images?.[0]) || 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=800'} 
            alt={service.name} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        </div>
        <div className="p-5">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{service.name}</h3>
            <div className="flex items-center space-x-1 bg-purple-50 px-2 py-0.5 rounded-lg">
              <Star size={12} className="text-yellow-500 fill-yellow-500" />
              <span className="text-[10px] font-bold text-purple-700">
                {service.rating > 0 ? `${service.rating} (${service.reviewCount || 0})` : 'New'}
              </span>
            </div>
          </div>
          <div className="flex items-center text-gray-500 text-sm mb-3">
            <MapPin size={14} className="mr-1" />
            <span>{service.district}, {service.state}</span>
          </div>
          <div className="mb-4">
            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest bg-purple-50 px-2 py-1 rounded-md">
              {service.serviceType}
            </span>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-gray-50">
            <span className="text-orange-600 font-bold text-sm">{service.priceRange}</span>
            <button className="text-orange-600 font-bold text-sm hover:underline">View Details</button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// --- Pages ---

// --- New Views ---

const RegistrationSuccessModal = ({ isOpen, onClose, regId, mobileNumber }: { isOpen: boolean, onClose: () => void, regId: string, mobileNumber: string }) => {
  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-orange-100 max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <div className="bg-orange-600 p-8 text-white text-center relative">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
            <CheckCircle size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold">Registration Successful!</h2>
          <p className="mt-2 opacity-90">Welcome to the BEST VENUE OPTION family</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">Your Registration ID</p>
                <p className="text-2xl font-black text-gray-900 font-mono">{regId}</p>
              </div>
              <button onClick={() => handleCopy(regId)} className="p-2 bg-white text-orange-600 rounded-xl shadow-sm hover:bg-orange-100 transition-colors">
                <Plus size={20} className="rotate-45" />
              </button>
            </div>
            <div className="h-px bg-orange-200" />
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">Your Initial Password</p>
                <p className="text-2xl font-black text-gray-900 font-mono">{mobileNumber}</p>
              </div>
              <button onClick={() => handleCopy(mobileNumber)} className="p-2 bg-white text-orange-600 rounded-xl shadow-sm hover:bg-orange-100 transition-colors">
                <Plus size={20} className="rotate-45" />
              </button>
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex items-start space-x-3">
            <AlertCircle className="text-blue-600 mt-0.5" size={20} />
            <p className="text-sm text-blue-800">
              Please note down these credentials. You can also send a welcome message to your WhatsApp number <strong>{mobileNumber}</strong>.
            </p>
          </div>

          <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-100 space-y-3">
            <h4 className="font-bold text-yellow-800 flex items-center">
              <Star size={18} className="mr-2 fill-yellow-500 text-yellow-500" />
              Unlock Premium Features
            </h4>
            <p className="text-sm text-yellow-700">
              Get full access to the booking manager, unlimited venue listings, and smart analytics by subscribing to a professional plan.
            </p>
            <Link 
              to="/pricing" 
              className="inline-block bg-yellow-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-yellow-700 transition-colors shadow-lg shadow-yellow-200"
              onClick={onClose}
            >
              View Subscription Plans
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => {
                const whatsappMsg = `*Welcome to Event Manager!*%0A%0AHello, your registration is successful.%0A%0A*Your ID:* ${regId}%0A*Your Password:* ${mobileNumber}%0A%0APlease login at: ${window.location.origin}/%23/login%0A%0AThank you for joining us!`;
                window.open(`https://wa.me/91${mobileNumber}?text=${whatsappMsg}`, '_blank');
              }}
              className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-green-700 shadow-xl shadow-green-200 transition-all flex items-center justify-center space-x-2"
            >
              <span>Send WhatsApp Welcome</span>
            </button>

            <button 
              onClick={onClose}
              className="w-full bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold text-lg hover:bg-gray-200 transition-all"
            >
              Skip, Proceed to Login
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const ChangePasswordView = ({ user, profile, onUpdateProfile }: { user: any, profile: UserProfile | null, onUpdateProfile: (p: UserProfile) => void }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  if (!user || !profile) return <Navigate to="/login" />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword.length !== 10) {
      toast.error('New password must be exactly 10 characters long');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // Verify current password
      const { data: userData, error: fetchError } = await db
        .from('users')
        .select('password, mobile_number')
        .eq('uid', user?.uid)
        .single();

      if (fetchError) throw fetchError;

      const currentStoredPassword = userData.password || userData.mobile_number;

      if (formData.currentPassword !== currentStoredPassword) {
        toast.error('Current password is incorrect');
        setLoading(false);
        return;
      }

      // Update password
      const { error: updateError } = await db
        .from('users')
        .update({ password: formData.newPassword })
        .eq('uid', user?.uid);

      if (updateError) throw updateError;

      const updatedProfile = { ...profile, password: formData.newPassword };
      onUpdateProfile(updatedProfile);
      localStorage.setItem('custom_profile', JSON.stringify(updatedProfile));

      toast.success('Password updated successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error('Failed to update password: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 border border-orange-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mx-auto mb-4">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>
          <p className="text-gray-500 mt-2">Update your account security</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Current Password</label>
            <input 
              required 
              type="password" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
              value={formData.currentPassword}
              onChange={e => setFormData({...formData, currentPassword: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">New Password (10 characters)</label>
            <input 
              required 
              type="password" 
              maxLength={10}
              minLength={10}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
              value={formData.newPassword}
              onChange={e => setFormData({...formData, newPassword: e.target.value})}
            />
            <p className="text-[10px] text-gray-400 mt-1">Must be exactly 10 numerical or text characters</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Confirm New Password</label>
            <input 
              required 
              type="password" 
              maxLength={10}
              minLength={10}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
              value={formData.confirmPassword}
              onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
            />
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-700 shadow-xl shadow-orange-200 transition-all disabled:opacity-50 mt-4"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

const ForgotPasswordView = () => {
  const navigate = useNavigate();
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(mobileNumber)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      // Check if it's admin first
      const { data: adminSettings } = await db
        .from('admin_settings')
        .select('*');
      
      const adminMobile = adminSettings?.find(s => s.key === 'admin_mobile')?.value;
      const adminPass = adminSettings?.find(s => s.key === 'admin_password')?.value;

      if (adminMobile === mobileNumber) {
        const whatsappMsg = `*Admin Password Recovery - Event Manager!*%0A%0AHello Admin, here are your login details:%0A%0A*Your ID:* admin%0A*Your Password:* ${adminPass}%0A%0APlease login at: ${window.location.origin}/%23/login%0A%0AThank you!`;
        const waUrl = `https://wa.me/91${mobileNumber}?text=${whatsappMsg}`;
        window.open(waUrl, '_blank');
        toast.success('Admin login details sent to your WhatsApp!');
        navigate('/login');
        return;
      }

      const { data: users, error } = await db
        .from('users')
        .select('registration_id, password, display_name')
        .eq('mobile_number', mobileNumber)
        .maybeSingle();

      if (error) throw error;

      if (!users) {
        toast.error('Mobile number not found in our records');
        setLoading(false);
        return;
      }

      const whatsappMsg = `*Password Recovery - Event Manager!*%0A%0AHello ${users.display_name}, here are your login details:%0A%0A*Your ID:* ${users.registration_id}%0A*Your Password:* ${users.password}%0A%0APlease login at: ${window.location.origin}/%23/login%0A%0AThank you!`;
      const waUrl = `https://wa.me/91${mobileNumber}?text=${whatsappMsg}`;
      
      window.open(waUrl, '_blank');
      toast.success('Login details sent to your WhatsApp!');
      navigate('/login');
    } catch (err) {
      toast.error('Failed to recover password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-32">
      <div className="bg-white rounded-3xl shadow-2xl p-8 border border-orange-100">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-lg shadow-orange-200">?</div>
          <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>
          <p className="text-gray-500 mt-2">Enter your registered mobile number to receive your credentials on WhatsApp</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Mobile Number</label>
            <input 
              required 
              type="tel" 
              maxLength={10}
              pattern="[0-9]{10}"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500" 
              placeholder="Enter 10-digit mobile number"
              value={mobileNumber} 
              onChange={e => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))} 
            />
          </div>
          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-700 shadow-xl shadow-orange-200 transition-all disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Submit'}
          </button>
        </form>
        
        <p className="text-center mt-8 text-gray-500">
          Remember your password? <Link to="/login" className="text-orange-600 font-bold hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
};

const RegistrationView = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [successData, setSuccessData] = useState<{ isOpen: boolean, regId: string, mobileNumber: string }>({
    isOpen: false,
    regId: '',
    mobileNumber: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    mobileNumber: '',
    email: '',
    photoURL: '',
    role: (searchParams.get('role') as UserRole) || 'owner',
    state: '',
    district: '',
    block: '',
    pincode: ''
  });

  useEffect(() => {
    const role = searchParams.get('role') as UserRole;
    if (role && (role === 'owner' || role === 'provider')) {
      setFormData(prev => ({ ...prev, role }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (formData.mobileNumber.length !== 10) {
        toast.error('Mobile number must be exactly 10 digits');
        setLoading(false);
        return;
      }

      // Check for duplicate mobile number
      const { data: existingUser, error: checkError } = await db
        .from('users')
        .select('uid')
        .eq('mobile_number', formData.mobileNumber)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      if (existingUser) {
        toast.error('This mobile number is already registered. Please login or use forgot password.');
        navigate('/forgot-password');
        setLoading(false);
        return;
      }

      // Fetch the highest registration ID for the specific role to generate next ID
      const { data: usersWithRole, error: roleError } = await db
        .from('users')
        .select('registration_id')
        .eq('role', formData.role);
      
      if (roleError) throw roleError;

      let nextNum = 1;
      const prefix = formData.role === 'owner' ? 'BVOVO' : (formData.role === 'provider' ? 'BVOSP' : 'UTSAV');
      
      if (usersWithRole && usersWithRole.length > 0) {
        // Extract numbers only from IDs starting with our target prefix
        const nums = usersWithRole
          .filter(u => (u.registration_id || '').startsWith(prefix))
          .map(u => {
            const idStr = u.registration_id || '';
            const match = idStr.match(/\d+$/);
            return match ? parseInt(match[0]) : 0;
          })
          .filter(n => n > 0);
        
        if (nums.length > 0) {
          const maxNum = Math.max(...nums);
          // Auto-increment logic based on specific start numbers
          if (formData.role === 'owner') {
            // If we have 900001, next is (900001 - 900000) + 1 = 2.
            // When we generate: 'BVOVO' + (900000 + 2) = BVOVO900002.
            nextNum = maxNum >= 900000 ? (maxNum - 900000) + 1 : 1;
          } else if (formData.role === 'provider') {
            // If we have 800001, next is (800001 - 800000) + 1 = 2.
            // When we generate: 'BVOSP' + (800000 + 2) = BVOSP800002.
            nextNum = maxNum >= 800000 ? (maxNum - 800000) + 1 : 1;
          } else {
            nextNum = maxNum + 1;
          }
        }
      }

      let regId = '';
      if (formData.role === 'owner') {
        regId = 'BVOVO' + (900000 + nextNum).toString();
      } else if (formData.role === 'provider') {
        regId = 'BVOSP' + (800000 + nextNum).toString();
      } else {
        const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        regId = 'UTSAV' + Date.now().toString().slice(-6) + randomSuffix;
      }
      
      // Use the helper to generate a UUID for better uniqueness
      const uid = generateUUID();
      
      const profileData: any = {
        uid,
        registration_id: regId,
        display_name: formData.name,
        father_name: formData.fatherName,
        mobile_number: formData.mobileNumber,
        email: formData.email || null,
        password: formData.mobileNumber, // Set mobile number as initial password
        photo_url: formData.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + regId,
        role: formData.role,
        state: formData.state,
        district: formData.district,
        block: formData.block,
        pincode: formData.pincode,
        status: 'active'
      };

      console.log('Attempting registration with data:', profileData);

      const { error } = await db.from('users').insert([profileData]);
      if (error) {
        console.error('Registration Error:', error);
        
        // Comprehensive error handling for duplicate values
        const errMsg = error.message || String(error);
        if (errMsg.includes('Duplicate entry')) {
          if (errMsg.includes('registration_id')) {
            toast.error('Registration ID conflict. Please try again (the ID will be recalculated).');
          } else if (errMsg.includes('mobile_number')) {
            toast.error('This mobile number is already registered.');
          } else if (errMsg.includes('PRIMARY')) {
            toast.error('System ID conflict. Please try again.');
          } else {
            toast.error(`Duplicate value error: ${errMsg}`);
          }
        } else if (errMsg.includes('column "venue_type" does not exist') || errMsg.includes('schema cache')) {
          toast.error('Registration failed: DB schema outdated. Please run the MASTER SQL SCRIPT migration section.', { duration: 10000 });
        } else {
          toast.error(`Registration failed: ${errMsg}`);
        }
        throw new Error(errMsg);
      }
      
      // Send WhatsApp Message (Mocked)
      const whatsappMsg = `*Welcome to BEST VENUE OPTION!*%0A%0AHello ${formData.name}, your registration is successful.%0A%0A*Your ID:* ${regId}%0A*Your Password:* ${formData.mobileNumber}%0A%0APlease login at: ${window.location.origin}/%23/login%0A%0AThank you for joining us!`;
      const waUrl = `https://wa.me/91${formData.mobileNumber}?text=${whatsappMsg}`;
      
      // In a real app, you'd call a backend API to send this. 
      // For this demo, we'll open the WA link in a new tab if the user wants, 
      // but the request says "sent massage", so we'll simulate it.
      console.log('WhatsApp Message Sent:', waUrl);

      setSuccessData({
        isOpen: true,
        regId,
        mobileNumber: formData.mobileNumber
      });
    } catch (err: any) {
      console.error('Registration Exception:', err);
      toast.error(`Registration failed: ${err.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Registration Portal</h1>
        <Link to="/" className="flex items-center space-x-2 text-orange-600 font-bold hover:underline bg-orange-50 px-4 py-2 rounded-full">
          <Home size={20} />
          <span>Back to Home</span>
        </Link>
      </div>

      <AnimatePresence>
        {successData.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] md:max-h-[90vh]"
            >
              <div className="bg-orange-600 p-8 md:p-10 text-white text-center flex-shrink-0">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <CheckCircle size={40} className="text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Registration Successful!</h2>
                <p className="opacity-90 mt-2 text-sm md:text-base font-medium">Welcome to the BVO Professional Network</p>
              </div>
              
              <div className="p-6 md:p-10 overflow-y-auto space-y-6 md:space-y-8 flex-grow custom-scrollbar overscroll-contain">
                <div className="bg-orange-50 p-6 rounded-[2rem] border border-orange-100 text-center shadow-inner">
                  <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-2">Your Unique Business ID</p>
                  <p className="text-2xl md:text-4xl font-black text-gray-900 font-mono tracking-wider">{successData.regId}</p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:gap-6">
                  <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 shadow-sm relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 bg-orange-100 text-orange-600 rounded-bl-xl opacity-0 group-hover:opacity-100 transition-opacity">
                      <Lock size={14} />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Temporary Password</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">{successData.mobileNumber}</p>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(successData.mobileNumber);
                          toast.success('Password copied');
                        }}
                        className="bg-white px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-orange-600 font-black text-[9px] md:text-[10px] uppercase tracking-widest border border-orange-100 hover:bg-orange-600 hover:text-white transition-all shadow-sm"
                      >
                        COPY
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-3 font-bold italic border-t border-gray-200 pt-3">Default: Mobile number as initial password.</p>
                  </div>

                  <div className="p-6 border-2 border-dashed border-gray-200 rounded-3xl text-sm text-gray-500 leading-relaxed bg-gray-50/30">
                    <p className="font-bold text-gray-700 mb-2 font-black uppercase text-xs tracking-widest">Next Steps:</p>
                    <ul className="space-y-2 list-disc list-inside font-bold text-xs">
                      <li>Use your ID and Mobile to Login</li>
                      <li>Complete your business profile</li>
                      <li>Add photos and services to your catalogue</li>
                      <li>Subscribe to a plan to start receiving leads</li>
                    </ul>
                  </div>
                </div>

                <button 
                  onClick={() => navigate('/login')}
                  className="w-full bg-gray-900 text-white py-4 md:py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-orange-100 active:scale-95 text-sm md:text-base"
                >
                  Proceed to Login
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-orange-100 relative">
        <div className="bg-orange-600 p-8 text-white text-center flex flex-col items-center">
          <div className="bg-white/20 p-4 rounded-full mb-4">
            <Users size={32} />
          </div>
          <h1 className="text-3xl font-bold">Partner Registration</h1>
          <p className="mt-2 opacity-90">Join India's largest event planning network</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-orange-600 border-b pb-2">Personal Details</h3>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
              <input required type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500" 
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Father's Name</label>
              <input required type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500" 
                value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Mobile Number (Password)</label>
              <input 
                required 
                type="tel" 
                maxLength={10}
                pattern="[0-9]{10}"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500" 
                value={formData.mobileNumber} 
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setFormData({...formData, mobileNumber: val});
                }} 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Gmail ID (Optional)</label>
              <input type="email" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500" 
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <ImageUpload 
                label="Profile Photo" 
                currentImage={formData.photoURL}
                onUpload={(url) => setFormData({...formData, photoURL: Array.isArray(url) ? url[0] : url})}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg text-orange-600 border-b pb-2">Business Details</h3>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">I am a...</label>
              <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})}>
                <option value="owner">Venue Owner</option>
                <option value="provider">Service Provider</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">State</label>
                <select required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                  value={formData.state} onChange={e => setFormData({...formData, state: e.target.value, district: '', block: ''})}>
                  <option value="">Select State</option>
                  {Object.keys(LOCATION_DATA || {}).map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">District</label>
                <select required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                  disabled={!formData.state}
                  value={formData.district} onChange={e => setFormData({...formData, district: e.target.value, block: ''})}>
                  <option value="">Select District</option>
                  {formData.state && LOCATION_DATA[formData.state] && Object.keys(LOCATION_DATA[formData.state]).map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Block</label>
                <select required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                  disabled={!formData.district}
                  value={formData.block} onChange={e => setFormData({...formData, block: e.target.value})}>
                  <option value="">Select Block</option>
                  {formData.state && formData.district && LOCATION_DATA[formData.state]?.[formData.district]?.map(block => (
                    <option key={block} value={block}>{block}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Pincode</label>
                <input required type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500" 
                  value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-4 pt-6">
            <div className="flex items-start space-x-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <input 
                id="terms"
                type="checkbox" 
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500" 
              />
              <label htmlFor="terms" className="text-sm text-gray-600 font-medium">
                I agree to the <Link to="/terms" state={{ fromRegistration: true }} className="text-orange-600 font-bold hover:underline">Terms & Conditions</Link> and <Link to="/privacy" state={{ fromRegistration: true }} className="text-orange-600 font-bold hover:underline">Privacy Policy</Link> of Best Venue Option.
              </label>
            </div>

            <button 
              disabled={loading || !termsAccepted}
              type="submit" 
              className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-700 shadow-xl shadow-orange-200 transition-all disabled:opacity-50 disabled:bg-gray-400"
            >
              {loading ? 'Registering...' : 'Register Now'}
            </button>
          </div>
        </form>
        <RegistrationSuccessModal 
          isOpen={successData.isOpen}
          onClose={() => {
            setSuccessData({ ...successData, isOpen: false });
            navigate('/login');
          }}
          regId={successData.regId}
          mobileNumber={successData.mobileNumber}
        />
      </div>
    </div>
  );
};

const LoginView = ({ onLogin }: { onLogin: (user: any, profile: UserProfile) => void }) => {
  const navigate = useNavigate();
  const [regId, setRegId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('session_expired_flag') === 'true') {
      toast.error('your session expired please login again', { id: 'session-expired-toast' });
      localStorage.removeItem('session_expired_flag');
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Admin Login Check
    if (regId.toLowerCase() === 'deepakjatav1005@gmail.com' || regId === '9165436918') {
      const { data: adminUserInDb } = await db
        .from('users')
        .select('*')
        .eq('email', 'deepakjatav1005@gmail.com')
        .single();
      
      const adminPass = adminUserInDb?.password || '9165436918';
      
      if (password === adminPass) {
        const u = { uid: adminUserInDb?.uid || 'admin_123', email: 'deepakjatav1005@gmail.com' };
        const p: UserProfile = adminUserInDb ? {
          uid: adminUserInDb.uid,
          registrationId: adminUserInDb.registration_id,
          displayName: adminUserInDb.display_name,
          mobileNumber: adminUserInDb.mobile_number,
          email: adminUserInDb.email,
          photoURL: adminUserInDb.photo_url,
          role: 'admin',
          status: 'active',
          createdAt: adminUserInDb.created_at
        } : {
          uid: 'admin_123',
          registrationId: 'ADMIN_001',
          displayName: 'Deepak Jatav',
          mobileNumber: '9165436918',
          email: 'deepakjatav1005@gmail.com',
          photoURL: null,
          role: 'admin',
          status: 'active',
          createdAt: new Date().toISOString()
        };
        onLogin(u, p);
        toast.success('Welcome Deepak Jatav!');
        navigate('/admin');
        setLoading(false);
        return;
      }
    }

    try {
      // Case-insensitive registration ID check
      const { data: users, error } = await db
        .from('users')
        .select('*')
        .eq('registration_id', (regId || "").toUpperCase());
      
      if (error) throw error;
      
      if (!users || users.length === 0) {
        toast.error('Invalid Registration ID');
        setLoading(false);
        return;
      }

      const rawProfile = users[0];

      if (rawProfile.status === 'disabled') {
        toast.error('Your account has been disabled by admin');
        setLoading(false);
        return;
      }

      const storedPassword = rawProfile.password || rawProfile.mobile_number;

      if (storedPassword !== password) {
        toast.error('Invalid Password');
        setLoading(false);
        return;
      }

      const profile: UserProfile = {
        uid: rawProfile.uid,
        registrationId: rawProfile.registration_id,
        displayName: rawProfile.display_name,
        fatherName: rawProfile.father_name,
        mobileNumber: rawProfile.mobile_number,
        password: rawProfile.password,
        email: rawProfile.email,
        photoURL: rawProfile.photo_url,
        role: rawProfile.role,
        state: rawProfile.state,
        district: rawProfile.district,
        block: rawProfile.block,
        pincode: rawProfile.pincode,
        venueType: rawProfile.venue_type,
        status: rawProfile.status,
        createdAt: rawProfile.created_at
      };

      // Mock user object for the app
      const user = {
        uid: profile.uid,
        displayName: profile.displayName,
        email: profile.email,
        photoURL: profile.photoURL,
        mobileNumber: profile.mobileNumber
      };

      onLogin(user, profile);
      toast.success('Welcome back, ' + profile.displayName);
      navigate('/dashboard');
    } catch (err) {
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-32">
      <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 border border-orange-100 relative">
        <Link to="/" className="absolute -top-12 left-0 flex items-center space-x-2 text-orange-600 font-bold hover:underline bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
          <Home size={18} />
          <span>Back to Home</span>
        </Link>
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center bg-orange-50 p-4 rounded-full text-orange-600 mb-4">
            <Lock size={32} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Login Portal</h1>
          <p className="text-gray-500 mt-2 font-medium">Enter your credentials to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Registration ID / Email</label>
            <input required type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500" 
              placeholder="Deepak / UTSAV123456"
              value={regId} onChange={e => setRegId(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
            <input required type="password" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500" 
              placeholder="••••••••••"
              value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-700 shadow-xl shadow-orange-200 transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Login Now'}
          </button>
          <div className="text-center mt-4">
            <Link to="/forgot-password" title="Forgot Password?" className="text-sm text-orange-600 font-medium hover:underline">Forgot Password?</Link>
          </div>
        </form>
        
        <p className="text-center mt-8 text-gray-500">
          Don't have an account? <Link to="/registration" className="text-orange-600 font-bold hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
};

const GalleryView = () => {
  const { t } = useTranslation();
  const [media, setMedia] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(20);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const [vRes, mRes, sRes] = await Promise.all([
          db.from('venues').select('images'),
          db.from('moments').select('media_url'),
          db.from('service_type_photos').select('image_url')
        ]);

        let allMedia: string[] = [];
        if (vRes.data) allMedia.push(...vRes.data.flatMap(d => d.images || []));
        if (mRes.data) allMedia.push(...mRes.data.map(d => d.media_url));
        if (sRes.data) allMedia.push(...sRes.data.map(d => d.image_url));

        // Filter out empty and limit
        allMedia = allMedia.filter(m => !!m).slice(0, 150);
        
        setMedia(allMedia.length > 0 ? allMedia : [
          'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800'
        ]);
      } catch (err) {
        console.error('Gallery fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 100 && displayCount < media.length) {
      setDisplayCount(prev => Math.min(prev + 20, 150));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('Event Gallery')}</h1>
          <p className="text-gray-500">{t('Glimpses of beautiful celebrations and special moments')}</p>
        </div>
        <Link to="/" className="flex items-center space-x-2 text-orange-600 font-bold hover:underline bg-orange-50 px-4 py-2 rounded-full">
          <Home size={20} />
          <span>{t('Home')}</span>
        </Link>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div 
          className="max-h-[800px] overflow-y-auto pr-2 custom-scrollbar"
          onScroll={handleScroll}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {media.slice(0, displayCount).map((url, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className="aspect-square rounded-2xl overflow-hidden shadow-lg bg-gray-100"
              >
                {url.includes('.mp4') || url.includes('video') ? (
                  <video 
                    src={resolveUrl(url)} 
                    className="w-full h-full object-cover cursor-pointer" 
                    loop 
                    onClick={e => {
                      if (e.currentTarget.paused) e.currentTarget.play();
                      else e.currentTarget.pause();
                    }} 
                  />
                ) : (
                  <img src={resolveUrl(url)} alt="Gallery" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                )}
              </motion.div>
            ))}
          </div>
          {displayCount < media.length && (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const AboutView = () => {
  const { t } = useTranslation();
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center relative">
      <Link to="/" className="absolute top-0 left-0 flex items-center space-x-2 text-orange-600 font-bold hover:underline bg-orange-50 px-4 py-2 rounded-full">
        <Home size={18} />
        <span>{t('home')}</span>
      </Link>
      <div className="inline-flex items-center justify-center bg-orange-100 p-6 rounded-full text-orange-600 mb-8 mt-4">
        <Info size={48} />
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-6">{t('about')} BEST VENUE OPTION</h1>
      <p className="text-xl text-gray-600 leading-relaxed mb-12">
        {t("BEST VENUE OPTION is India's premier event planning platform, dedicated to making your special moments truly unforgettable. We bridge the gap between hosts and the finest venues and service providers in the country. Whether it's a grand wedding, a corporate gala, or an intimate birthday party, BEST VENUE OPTION provides the tools and connections you need to plan with ease and celebrate with joy.")}
      </p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="p-8 bg-orange-50 rounded-3xl">
        <div className="text-3xl font-bold text-orange-600 mb-2">500+</div>
        <div className="text-gray-600">{t("Verified Venues")}</div>
      </div>
      <div className="p-8 bg-orange-50 rounded-3xl">
        <div className="text-3xl font-bold text-orange-600 mb-2">1000+</div>
        <div className="text-gray-600">{t("Service Partners")}</div>
      </div>
      <div className="p-8 bg-orange-50 rounded-3xl">
        <div className="text-3xl font-bold text-orange-600 mb-2">10k+</div>
        <div className="text-gray-600">{t("Happy Events")}</div>
      </div>
    </div>
  </div>
);
};

const useAutoScroll = (speed = 0.2) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationFrameId: number;
    let isHovered = false;

    const scroll = () => {
      if (!isHovered && scrollContainer) {
        scrollContainer.scrollLeft += speed;
        
        // Reset to start if reached the end
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth - 1) {
          scrollContainer.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    const handleMouseEnter = () => { isHovered = true; };
    const handleMouseLeave = () => { isHovered = false; };

    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);
    scrollContainer.addEventListener('touchstart', handleMouseEnter);
    scrollContainer.addEventListener('touchend', handleMouseLeave);

    animationFrameId = requestAnimationFrame(scroll);

    return () => {
      cancelAnimationFrame(animationFrameId);
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
      scrollContainer.removeEventListener('touchstart', handleMouseEnter);
      scrollContainer.removeEventListener('touchend', handleMouseLeave);
    };
  }, [speed]);

  return scrollRef;
};

const ServiceInfoStickers = () => {
  const scrollRef = useAutoScroll(0.2);
  const services = [
    {
      title: "Grand Weddings",
      description: "From royal palaces to intimate gardens, find your dream wedding venue.",
      image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600",
      color: "bg-pink-50",
      borderColor: "border-pink-200",
      textColor: "text-pink-600"
    },
    {
      title: "Birthday Bashes",
      description: "Fun-filled venues and decorators for the most memorable birthday parties.",
      image: "https://images.unsplash.com/photo-1530103043960-ef38714abb15?auto=format&fit=crop&q=80&w=600",
      color: "bg-orange-50",
      borderColor: "border-orange-200",
      textColor: "text-orange-600"
    },
    {
      title: "Corporate Events",
      description: "Professional spaces equipped with modern amenities for your business needs.",
      image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=600",
      color: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-600"
    },
    {
      title: "Catering Excellence",
      description: "Top-rated caterers serving delicious cuisines for every palate.",
      image: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=600",
      color: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-600"
    }
  ];

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-4">Plan Your Perfect Event</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">Everything you need to host an unforgettable celebration, all in one place.</p>
        </div>

        <div ref={scrollRef} className="flex overflow-x-auto pt-10 pb-12 gap-8 scrollbar-hide px-4">
          {services.map((service, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 1, scale: 0.9, rotate: idx % 2 === 0 ? -2 : 2 }}
              whileInView={{ scale: 1, rotate: 0 }}
              whileHover={{ scale: 1.05, rotate: idx % 2 === 0 ? 2 : -2 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              viewport={{ once: true, margin: "-50px" }}
              className={`min-w-[280px] md:min-w-[320px] snap-start relative p-8 rounded-[2.5rem] border-2 ${service.borderColor} ${service.color} group cursor-default shadow-lg hover:shadow-2xl transition-all duration-300`}
            >
              <div className="mb-6 relative h-48 flex items-center justify-center">
                <div className="absolute inset-0 bg-white/60 blur-3xl rounded-full scale-125 group-hover:scale-110 transition-transform duration-500" />
                <img 
                  src={resolveUrl(service.image)} 
                  alt={service.title} 
                  className="w-full h-full object-contain relative z-10 drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)] group-hover:drop-shadow-[0_25px_35px_rgba(0,0,0,0.2)] transition-all duration-500"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>
              <h3 className={`text-2xl font-black ${service.textColor} mb-3`}>{service.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed font-semibold">
                {service.description}
              </p>
              
              {/* Decorative "Sticker" elements */}
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full border-2 border-dashed border-gray-200 shadow-lg flex items-center justify-center rotate-12 group-hover:rotate-45 transition-all duration-500 z-20">
                <div className={`w-10 h-10 rounded-full ${service.color} flex items-center justify-center`}>
                  <Sparkles size={20} className={service.textColor} />
                </div>
              </div>
              
              <div className="absolute -bottom-2 -left-2 w-10 h-10 bg-white rounded-xl border-2 border-gray-100 shadow-md flex items-center justify-center -rotate-12 group-hover:rotate-0 transition-all duration-500 z-20">
                <div className={`w-8 h-8 rounded-lg ${service.color} opacity-50`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const MomentsHomeSection = ({ onInteraction }: { onInteraction?: (enabled: boolean) => void }) => {
  const { t } = useTranslation();
  const [moments, setMoments] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMoments = async () => {
      const { data } = await db.from('moments').select('*').order('created_at', { ascending: false }).limit(10);
      if (data) setMoments(data);
    };
    fetchMoments();

    const channel = db.channel('moments_home_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'moments' }, fetchMoments)
      .subscribe();
      
    return () => { db.removeChannel(channel); };
  }, []);

  if (moments.length === 0) {
    // If no moments, show a fun placeholder to keep the section visible for the user/admin to see where it is
    return (
      <div 
        className="bg-gray-50 py-16 border-b border-gray-100" 
        onMouseEnter={() => onInteraction?.(false)}
        onMouseLeave={() => onInteraction?.(true)}
        onFocus={() => onInteraction?.(false)}
        onBlur={() => onInteraction?.(true)}
      >
        <div className="max-w-7xl mx-auto px-4 text-center">
           <Camera className="mx-auto text-gray-300 mb-4" size={48} />
           <h2 className="text-2xl font-black text-gray-400 uppercase tracking-widest">{t('Our Moments Gallery')}</h2>
           <p className="text-gray-400 mt-2 text-sm italic">{t('Admin highlight photos will appear here')}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-gray-50 py-16 overflow-hidden border-b border-gray-100"
      onMouseEnter={() => onInteraction?.(false)}
      onMouseLeave={() => onInteraction?.(true)}
      onFocus={() => onInteraction?.(false)}
      onBlur={() => onInteraction?.(true)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <h2 className="text-3xl md:text-5xl font-black text-gray-900 flex items-center">
          <Camera className="mr-4 text-orange-600" size={32} />
          {t('OUR')} <span className="text-orange-600 ml-2">{t('MOMENTS')}</span>
        </h2>
        <p className="text-gray-500 mt-2">{t('Beautiful celebrations captured on our platform')}</p>
      </div>
      <div className="relative">
        <div className="flex animate-marquee-ltr space-x-6 py-4 w-max hover:[animation-play-state:paused]">
          {[...moments, ...moments].map((m, idx) => (
            <motion.div 
              key={`${m.id}-${idx}`} 
              whileHover={{ scale: 1.05 }}
              className="flex-shrink-0 w-80 h-64 relative rounded-[2rem] overflow-hidden group cursor-pointer shadow-xl bg-gray-100"
            >
              {m.type === 'video' || (m.media_url && m.media_url.includes('.mp4')) ? (
                <video 
                  src={resolveUrl(m.media_url)} 
                  className="w-full h-full object-cover" 
                  autoPlay 
                  muted 
                  loop 
                  playsInline 
                />
              ) : (
                <img 
                  src={resolveUrl(m.media_url)} 
                  alt="Moment" 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ServiceTypePhotosScroll = ({ onInteraction }: { onInteraction?: (enabled: boolean) => void }) => {
  const [photos, setServicePhotos] = useState<ServiceTypePhoto[]>([]);
  const navigate = useNavigate();

  const handleInteraction = (enabled: boolean) => {
    if (onInteraction) onInteraction(enabled);
  };

  useEffect(() => {
    const fetchPhotos = async () => {
      const { data } = await db.from('service_type_photos').select('*').order('created_at', { ascending: false });
      if (data) setServicePhotos(data.map(d => ({
        id: d.id,
        serviceType: d.service_type,
        imageUrl: d.image_url,
        createdAt: d.created_at
      } as ServiceTypePhoto)));
    };

    fetchPhotos();

    const channel = db
      .channel('service_type_photos_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_type_photos' }, () => {
        fetchPhotos();
      })
      .subscribe();

    return () => {
      db.removeChannel(channel);
    };
  }, []);

  if (photos.length === 0) return null;

  return (
    <div 
      className="bg-white py-16 overflow-hidden border-b border-gray-100"
      onMouseEnter={() => handleInteraction(false)}
      onMouseLeave={() => handleInteraction(true)}
      onFocus={() => handleInteraction(false)}
      onBlur={() => handleInteraction(true)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <h2 className="text-3xl md:text-5xl font-black text-gray-900 flex items-center">
          <Sparkles className="mr-4 text-orange-600" size={32} />
          JOIN US <span className="text-orange-600 ml-2">AS</span>
        </h2>
      </div>
      <div className="relative">
        <div className="flex animate-marquee-ltr space-x-8 py-10 w-max hover:[animation-play-state:paused]">
          {[...photos, ...photos].map((p, idx) => (
            <motion.div 
              key={`${p.id}-${idx}`} 
              whileHover={{ scale: 1.05, rotateY: 15 }}
              onClick={() => navigate(`/registration?role=provider&type=${encodeURIComponent(p.serviceType)}`)}
              className="flex-shrink-0 w-64 h-80 relative rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-2xl"
            >
              <div className="w-full h-full bg-gray-50 flex items-center justify-center p-2">
                <img 
                  src={resolveUrl(p.imageUrl)} 
                  alt={p.serviceType} 
                  className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105" 
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-5 bg-white/90 backdrop-blur-md border-t border-gray-100/50 flex items-center justify-center shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em] text-center line-clamp-1">{p.serviceType}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TermsView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const fromRegistration = location.state?.fromRegistration;

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {fromRegistration && (
          <button 
            onClick={() => navigate(-1)}
            className="mb-8 flex items-center text-orange-600 font-bold hover:text-orange-700 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Go Back to Registration
          </button>
        )}
        <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-gray-100">
          <h1 className="text-4xl font-black text-gray-900 mb-8">Terms & Conditions</h1>
          <div className="prose prose-orange max-w-none text-gray-600 space-y-6">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p>By accessing and using the BEST VENUE OPTION application, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the service.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">2. User Responsibilities</h2>
              <p>Users are responsible for providing accurate information during registration and booking. Any misuse of the platform or fraudulent activities will lead to immediate account termination.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">3. Booking & Payments</h2>
              <p>Bookings are subject to availability and confirmation by the venue owner or service provider. Payments made through the platform or directly are governed by the respective cancellation policies.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">4. Liability</h2>
              <p>BEST VENUE OPTION acts as a facilitator between customers and providers. We are not liable for any disputes, damages, or service failures between the parties.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">5. Contact Information</h2>
              <p>For any queries or support, please contact us at:</p>
              <ul className="list-none space-y-2 mt-2">
                <li className="flex items-center space-x-2">
                  <Phone size={16} className="text-orange-600" />
                  <span>+91 8349076918</span>
                </li>
                <li className="flex items-center space-x-2">
                  <MessageSquare size={16} className="text-orange-600" />
                  <span>Chanchalnetzone2026@gmail.com</span>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};


const FALLBACK_VENUES: Venue[] = [
  {
    id: "v-fallback-1",
    ownerId: "system",
    name: "Royal Heritage Marriage Garden",
    description: "Spacious and elegant marriage garden with lush green lawns, perfect for grand weddings and celebrations.",
    venueType: "marriage garden",
    address: "Hoshangabad Road, near AIIMS",
    state: "Madhya Pradesh",
    district: "Bhopal",
    block: "Bhopal",
    pincode: "462026",
    capacity: 1500,
    pricePerDay: 75000,
    images: ["https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800"],
    facilities: ["Lush Green Lawns", "AC Banquet Hall", "Ample Parking", "Catering Service", "Decorative Lighting"],
    rating: 4.9,
    reviewCount: 128,
    createdAt: new Date().toISOString()
  },
  {
    id: "v-fallback-2",
    ownerId: "system",
    name: "Grand Plaza Banquet Hall",
    description: "Modern fully air-conditioned banquet hall with beautiful interior decoration, luxurious lighting, and premium sound systems.",
    venueType: "marriage hall",
    address: "Vijay Nagar, opposite C21 Mall",
    state: "Madhya Pradesh",
    district: "Indore",
    block: "Indore",
    pincode: "452010",
    capacity: 600,
    pricePerDay: 45000,
    images: ["https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800"],
    facilities: ["Air Conditioning", "Valet Parking", "Stage Setup", "Bridal Rooms", "Sound System"],
    rating: 4.7,
    reviewCount: 95,
    createdAt: new Date().toISOString()
  },
  {
    id: "v-fallback-3",
    ownerId: "system",
    name: "The Palms Luxury Resort",
    description: "Exquisite luxury resort featuring premium cottages, swimming pool, sprawling lawns, and scenic backdrops for destination weddings.",
    venueType: "hotel",
    address: "Bhedaghat Road",
    state: "Madhya Pradesh",
    district: "Jabalpur",
    block: "Jabalpur",
    pincode: "482003",
    capacity: 2000,
    pricePerDay: 150000,
    images: ["https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800"],
    facilities: ["Luxury Cottages", "Swimming Pool", "Destination Wedding Lawn", "Multi-cuisine Restaurant", "24/7 Security"],
    rating: 4.8,
    reviewCount: 74,
    createdAt: new Date().toISOString()
  }
];

const FALLBACK_SERVICES: ServiceProvider[] = [
  {
    id: "s-fallback-1",
    providerId: "system",
    name: "Chanchal Gourmet Catering",
    serviceType: "caterers",
    description: "Professional catering services serving exquisite Indian, Chinese, and Continental cuisines with impeccable service.",
    priceRange: "₹300 - ₹800 Per Plate",
    priceLevel: "as per plate",
    state: "Madhya Pradesh",
    district: "Bhopal",
    block: "Bhopal",
    images: ["https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=800"],
    rating: 4.9,
    reviewCount: 112,
    createdAt: new Date().toISOString()
  },
  {
    id: "s-fallback-2",
    providerId: "system",
    name: "Beat Drop DJ & Sound System",
    serviceType: "dj and sound service",
    description: "Premium high-fidelity JBL sound setup, intelligent moving head lights, trussing, and professional wedding DJs.",
    priceRange: "₹15,000 - ₹35,000 Per Event",
    priceLevel: "as per work",
    state: "Madhya Pradesh",
    district: "Bhopal",
    block: "Bhopal",
    images: ["https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800"],
    rating: 4.8,
    reviewCount: 84,
    createdAt: new Date().toISOString()
  },
  {
    id: "s-fallback-3",
    providerId: "system",
    name: "Dream Frame Photography",
    serviceType: "photo and videography",
    description: "Candid photography, cinematic wedding films, pre-wedding shoots, and high-end albums captured by experts.",
    priceRange: "₹25,000 - ₹60,000 Per Event",
    priceLevel: "as per work",
    state: "Madhya Pradesh",
    district: "Indore",
    block: "Indore",
    images: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800"],
    rating: 4.9,
    reviewCount: 96,
    createdAt: new Date().toISOString()
  },
  {
    id: "s-fallback-4",
    providerId: "system",
    name: "Royal Tent House & Decorators",
    serviceType: "tent house",
    description: "Premium water-proof pandals, designer tents, exquisite draping, and luxury seating arrangements.",
    priceRange: "₹40,000 - ₹90,000 Per Event",
    priceLevel: "as per work",
    state: "Madhya Pradesh",
    district: "Gwalior",
    block: "Gwalior",
    images: ["https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=800"],
    rating: 4.7,
    reviewCount: 53,
    createdAt: new Date().toISOString()
  }
];

const HomeView = ({ user, forceRateOpen = false }: { user: any, forceRateOpen?: boolean }) => {
  const { t, lang } = useTranslation();
  const venuesScrollRef = useAutoScroll(0.05);
  const topProvidersScrollRef = useAutoScroll(0.04);
  const categoriesScrollRef = useAutoScroll(0.03);
  const [featuredVenues, setFeaturedVenues] = useState<Venue[]>(FALLBACK_VENUES);
  const [featuredServices, setFeaturedServices] = useState<ServiceProvider[]>(FALLBACK_SERVICES);
  const [banners, setBanners] = useState<AppBanner[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  useEffect(() => {
    if (forceRateOpen) {
       setTimeout(() => {
         const rateBtn = document.querySelector('[title="Rate App"]') as HTMLButtonElement;
         if (rateBtn) {
           rateBtn.click();
         } else {
           // Fallback if button not found
           const event = new CustomEvent('open-app-rating');
           window.dispatchEvent(event);
         }
       }, 500);
    }
  }, [forceRateOpen]);

  const [activeTab, setActiveTab] = useState(0);
  const [isAppRatingOpen, setIsAppRatingOpen] = useState(forceRateOpen);
  const [loading, setLoading] = useState(true);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);

  useEffect(() => {
    if (banners.length > 1 && isAutoScrollEnabled) {
      const interval = setInterval(() => {
        setCurrentBannerIndex(prev => (prev + 1) % banners.length);
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [banners, isAutoScrollEnabled]);

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        const { data: vData } = await db.from('venues').select('*').order('rating', { ascending: false }).limit(6);
        if (vData && vData.length > 0) {
          setFeaturedVenues(vData.map(d => ({ 
            ...d, 
            ownerId: d.owner_id, 
            venueType: d.venue_type || d.type, 
            pricePerDay: d.price_per_day, 
            rating: d.rating || 0,
            reviewCount: d.review_count || 0,
            createdAt: d.created_at 
          }) as Venue));
        } else {
          setFeaturedVenues(FALLBACK_VENUES);
        }

        const { data: sData } = await db.from('service_providers').select('*').order('rating', { ascending: false }).limit(8);
        if (sData && sData.length > 0) {
          setFeaturedServices(sData.map(d => ({ 
            ...d, 
            ownerId: d.owner_id, 
            serviceType: d.service_type || d.type, 
            priceRange: d.price_range, 
            rating: d.rating || 0,
            reviewCount: d.review_count || 0,
            createdAt: d.created_at 
          }) as ServiceProvider));
        } else {
          setFeaturedServices(FALLBACK_SERVICES);
        }

        const { data: bData } = await db.from('banners').select('*').eq('is_active', true);
        if (bData) setBanners(bData.map(d => ({ id: d.id, title: d.title, imageUrl: d.image_url, link: d.link, isActive: d.is_active, createdAt: d.created_at }) as AppBanner));

        let { data: nData, error: nError } = await db.from('notifications').select('*').eq('is_active', true).order('created_at', { ascending: false });
        
        // Fallback if is_active column is missing
        if (nError && nError.message.includes('is_active')) {
          console.warn('is_active column missing in notifications, falling back');
          const { data: fallbackData, error: fallbackError } = await db.from('notifications').select('*').order('created_at', { ascending: false });
          nData = fallbackData;
          nError = fallbackError;
        }

        if (nError) console.error('Notifications fetch error:', nError);
        if (nData) {
          console.log('Fetched notifications:', nData.length);
          setNotifications(nData.map(d => ({ id: d.id, title: d.title, message: d.message, createdAt: d.created_at }) as AppNotification));
        }
      } catch (err) {
        console.error('Home data error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();

    const venueChannel = db
      .channel('home_venues')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'venues' }, () => {
        fetchHomeData();
      })
      .subscribe();

    const providerChannel = db
      .channel('home_providers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_providers' }, () => {
        fetchHomeData();
      })
      .subscribe();

    const channel = db
      .channel('home_notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        fetchHomeData();
      })
      .subscribe();

    return () => {
      db.removeChannel(venueChannel);
      db.removeChannel(providerChannel);
      db.removeChannel(channel);
    };
  }, []);

  return (
    <div className="pb-20 pt-16">
      {/* Notifications Bar - Sticky below header */}
      {notifications.length > 0 && (
        <div className="sticky top-[64px] z-40 bg-orange-600 text-white py-2 overflow-hidden shadow-md">
          <div className="flex animate-marquee-ltr whitespace-nowrap">
            {notifications.map(n => (
              <span key={n.id} className="mx-10 font-medium flex items-center">
                <Bell size={14} className="mr-2" />
                {n.title}: {n.message}
              </span>
            ))}
            {/* Duplicate for seamless loop */}
            {notifications.map(n => (
              <span key={`${n.id}-dup`} className="mx-10 font-medium flex items-center">
                <Bell size={14} className="mr-2" />
                {n.title}: {n.message}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Hero Section with Banners */}
      <div className="relative h-[600px] md:h-[700px] overflow-hidden">
        {banners.length > 0 ? (
          <div className="absolute inset-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentBannerIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="absolute inset-0"
                onMouseEnter={() => setIsAutoScrollEnabled(false)}
                onMouseLeave={() => setIsAutoScrollEnabled(true)}
              >
                <img 
                  src={resolveUrl(banners[currentBannerIndex].imageUrl)} 
                  alt={banners[currentBannerIndex].title}
                  className="w-full h-full object-cover brightness-[0.7]"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end pb-24">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="flex flex-wrap gap-4">
                      <Link to="/search" className="bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-orange-700 transition-all shadow-xl shadow-orange-900/20 flex items-center group">
                        {t('searchNow')}
                        <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                      <Link to="/login" className="bg-white text-orange-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all shadow-xl flex items-center">
                        <LogIn className="mr-2" />
                        {t('loginNow')}
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          <Hero banners={banners} />
        )}
      </div>

      {/* Dynamic Service & Venue Types Text & Tagline */}
      <div className="bg-white py-14 border-b border-gray-100 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <LogoDisplay />
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-4 tracking-tighter uppercase">
              {t('heroTitle')}
            </h1>
            <p className="text-lg md:text-xl text-gray-500 max-w-3xl mx-auto italic font-medium leading-relaxed">
              {t('heroTagline')}
            </p>
          </motion.div>
          
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6">
            {['Marriage Garden', 'Marriage Hall', 'Hotel', 'Resort', 'Party Plot', 'Catering', 'Decoration', 'Photography', 'DJ & Music', 'Makeup Artist', 'Mehendi Artist', 'Tent House', 'Security'].map((type, idx) => (
              <span key={idx} className="text-xs md:text-sm font-black text-gray-400 hover:text-orange-500 transition-colors cursor-default uppercase tracking-[0.3em]">
                {t(type)}
              </span>
            ))}
          </div>
        </div>
      </div>

      <MomentsHomeSection onInteraction={setIsAutoScrollEnabled} />
      <VenueOwnerJoinSectionWithSuspense lang={lang} t={t} />
      <ServiceTypePhotosScroll onInteraction={setIsAutoScrollEnabled} />
      <CategorySection onInteraction={setIsAutoScrollEnabled} />
      <ServiceInfoStickers />
      
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{t('Popular Venues')}</h2>
              <p className="text-gray-500 mt-2">{t('Handpicked venues for your special celebrations')}</p>
            </div>
            <Link to="/venues" className="text-orange-600 font-bold flex items-center hover:underline">
              {t('View All')} <ChevronRight size={20} />
            </Link>
          </div>
          <div ref={venuesScrollRef} className="flex overflow-x-auto pb-8 gap-8 scrollbar-hide">
            {featuredVenues.length > 0 ? (
              featuredVenues.slice(0, 6).map(v => (
                <div key={v.id} className="min-w-[320px] md:min-w-[400px] snap-start">
                  <VenueCard venue={v} />
                </div>
              ))
            ) : (
              [1, 2, 3].map(i => (
                <div key={i} className="min-w-[320px] md:min-w-[400px] bg-white rounded-2xl h-80 animate-pulse border border-gray-100" />
              ))
            )}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{t('Top Service Providers')}</h2>
              <p className="text-gray-500 mt-2">{t('Caterers, DJs, and Decorators to make it memorable')}</p>
            </div>
            <Link to="/services" className="text-orange-600 font-bold flex items-center hover:underline">
              {t('View All')} <ChevronRight size={20} />
            </Link>
          </div>
          <div ref={topProvidersScrollRef} className="flex overflow-x-auto pb-8 gap-6 scrollbar-hide">
            {featuredServices.length > 0 ? (
              featuredServices.slice(0, 8).map(s => (
                <div key={s.id} className="min-w-[320px] md:min-w-[400px] snap-start">
                  <ServiceCard service={s} />
                </div>
              ))
            ) : (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="min-w-[320px] md:min-w-[400px] bg-white rounded-2xl h-64 animate-pulse border border-gray-100" />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-orange-600 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/20 rounded-full -ml-32 -mb-32 blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-4xl font-bold mb-16">{t('whyPlanTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-sm">
                <CheckCircle size={40} />
              </div>
              <h3 className="text-2xl font-bold mb-4">{t('verifiedPartners')}</h3>
              <p className="text-orange-100 opacity-80">{t('Every venue and provider is manually verified for quality and reliability.')}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-sm">
                <IndianRupee size={40} />
              </div>
              <h3 className="text-2xl font-bold mb-4">{t('bestPrices')}</h3>
              <p className="text-orange-100 opacity-80">{t('Get the best rates by booking directly through our platform.')}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-sm">
                <Clock size={40} />
              </div>
              <h3 className="text-2xl font-bold mb-4">{t('support247')}</h3>
              <p className="text-orange-100 opacity-80">{t('Our team is here to help you with every step of your event planning.')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <div id="testimonials">
        <TestimonialsSection />
      </div>
    </div>
  );
};

// --- Testimonials Section Component ---
const TestimonialsSection = () => {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [appRating, setAppRating] = useState(0);
  const [totalFeedback, setTotalFeedback] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchFeedbacks = async () => {
    try {
      console.log('Fetching app feedback...');
      const { data, error } = await db
        .from('app_feedback')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Database error fetching feedback:', error);
        return;
      }

      if (data) {
        console.log('Fetched app feedback count:', data.length);
        setFeedbacks(data.map(d => ({
          id: d.id,
          userId: d.user_id,
          userName: d.user_name,
          rating: d.rating,
          comment: d.comment,
          createdAt: d.created_at
        })));

        // Calculate average rating
        const { data: allData, error: allErr } = await db.from('app_feedback').select('rating');
        if (allErr) {
          console.error('Error fetching all ratings:', allErr);
        } else if (allData && allData.length > 0) {
          const sum = allData.reduce((acc, curr) => acc + (curr.rating || 0), 0);
          setAppRating(parseFloat((sum / allData.length).toFixed(1)));
          setTotalFeedback(allData.length);
        } else {
          setAppRating(0);
          setTotalFeedback(0);
        }
      }
    } catch (err) {
      console.error('Error fetching testimonials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();

    const channel = db
      .channel('app_feedback_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_feedback' }, () => {
        fetchFeedbacks();
      })
      .subscribe();

    return () => {
      db.removeChannel(channel);
    };
  }, []);

  if (loading) return null;
  
  // If no feedbacks, show a placeholder or nothing
  if (feedbacks.length === 0) {
    return (
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-black text-gray-900 mb-4">What Our Users Say</h2>
          <p className="text-gray-500">No reviews yet. Be the first to rate us!</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-4">What Our Users Say</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-8">Real stories from real people who planned their perfect events with us.</p>
          
          <div className="inline-flex items-center bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100 space-x-4">
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-black text-gray-900 leading-none">{appRating || '0.0'}</span>
              <div className="flex items-center text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill={i < Math.round(appRating) ? "currentColor" : "none"} className={i < Math.round(appRating) ? "text-yellow-500" : "text-gray-200"} />
                ))}
              </div>
            </div>
            <div className="h-10 w-px bg-gray-100" />
            <div className="text-left">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                Total Reviews
              </p>
              <p className="text-xs font-black text-gray-900">{totalFeedback} Verified Users</p>
            </div>
          </div>
        </div>

        {/* Horizontal Scrolling Marquee */}
        <div className="relative group overflow-hidden">
          <div className="flex w-full">
            <motion.div 
              animate={{ x: [-100 * feedbacks.length, 0] }}
              transition={{ 
                duration: Math.max(feedbacks.length * 8, 60), 
                repeat: Infinity, 
                ease: "linear" 
              }}
              className="flex space-x-8 whitespace-nowrap py-4"
            >
              {[...feedbacks, ...feedbacks].map((fb, idx) => (
                <div key={`${fb.id}-${idx}`} className="inline-block w-[320px] md:w-[400px] bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all whitespace-normal">
                  <div className="flex items-center space-x-1 text-yellow-500 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < fb.rating ? "currentColor" : "none"} className={i < fb.rating ? "text-yellow-500" : "text-gray-200"} />
                    ))}
                  </div>
                  <p className="text-gray-600 italic leading-relaxed mb-6 line-clamp-3 text-sm">"{fb.comment}"</p>
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-lg shadow-inner uppercase">
                      {fb.userName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{fb.userName}</h4>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">Verified User</p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
          {/* Fading Edges */}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />
        </div>

        <div className="mt-16 text-center">
          <button 
            onClick={() => {
              const rateBtn = document.querySelector('[title="Rate App"]') as HTMLButtonElement;
              if (rateBtn) rateBtn.click();
            }}
            className="inline-flex items-center space-x-2 bg-orange-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-orange-700 transition-all shadow-xl shadow-orange-200 grow-animation hover:scale-105"
          >
            <span>Rate Our Platform</span>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
};

const AvailabilityCalendar = ({ targetId }: { targetId: string }) => {
  const [bookedDates, setBookedDates] = useState<{date: string, endDate?: string, status: string, startTime?: string, endTime?: string}[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchBookings = async () => {
      const { data, error } = await db
        .from('bookings')
        .select('event_date, end_date, status, start_time, end_time')
        .eq('target_id', targetId)
        .in('status', ['confirmed', 'paid', 'approved', 'completed']);
      
      if (!error && data) {
        setBookedDates(data.map(d => ({ 
          date: d.event_date ? d.event_date.split('T')[0] : '', 
          endDate: d.end_date ? d.end_date.split('T')[0] : '',
          status: d.status,
          startTime: d.start_time,
          endTime: d.end_time
        })));
      }
    };

    fetchBookings();

    const channel = db
      .channel(`availability_${targetId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'bookings',
        filter: `target_id=eq.${targetId}`
      }, fetchBookings)
      .subscribe();

    return () => {
      db.removeChannel(channel);
    };
  }, [targetId]);

  const daysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Array(new Date(year, month + 1, 0).getDate()).fill(null).map((_, i) => {
      const d = new Date(year, month, i + 1);
      return format(d, 'yyyy-MM-dd');
    });
  };

  const monthName = format(currentMonth, 'MMMM yyyy');
  const days = daysInMonth(currentMonth);

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-gray-900">{monthName}</h3>
        <div className="flex space-x-2">
          <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronRight size={20} className="rotate-180" />
          </button>
          <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{d}</div>
        ))}
        {new Array(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()).fill(null).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map(date => {
          const matchedBookings = bookedDates.filter(d => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const checkDate = new Date(date);
            if (checkDate < today) return false;

            if (d.endDate) {
              return date >= d.date && date <= d.endDate;
            }
            return d.date === date;
          });
          const isBooked = matchedBookings.length > 0;
          const isToday = date === format(new Date(), 'yyyy-MM-dd');
          
          return (
            <div 
              key={date} 
              className={cn(
                "aspect-square flex flex-col items-center justify-center rounded-xl text-[10px] md:text-sm font-medium transition-all relative overflow-hidden group",
                isBooked ? "bg-red-50 text-red-700 border-2 border-red-500 shadow-sm" : "bg-gray-50 text-gray-700 hover:bg-orange-50 hover:text-orange-600 cursor-pointer",
                isToday && !isBooked && "ring-2 ring-orange-500 ring-offset-2 ring-offset-white"
              )}
            >
              <span className={cn(isBooked ? "font-black" : "")}>{date.split('-')[2]}</span>
              {isBooked && (
                <div className="absolute inset-0 bg-transparent transition-opacity flex flex-col items-center justify-center pointer-events-none p-0.5">
                   <span className="text-[6px] md:text-[8px] font-black uppercase px-1 rounded-sm shadow-sm border bg-red-100 text-red-900 border-red-200">
                    BOOKED
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-8 flex flex-wrap gap-6 border-t border-gray-100 pt-6">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-md bg-red-600 border border-red-200 shadow-sm" />
          <span className="text-xs font-bold text-gray-600 uppercase tracking-tight">Booked</span>
        </div>
        <div className="flex items-center space-x-2 ml-auto">
          <div className="w-4 h-4 rounded-md bg-gray-100 border border-gray-200" />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-tight">Available</span>
        </div>
      </div>
    </div>
  );
};

const VenueDetailView = ({ user, profile }: { user: any, profile: UserProfile | null }) => {
    const { id } = useParams();
    const [venue, setVenue] = useState<Venue | null>(null);
    const [loading, setLoading] = useState(true);
    const [bookingDate, setBookingDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('21:00');
    const [visitorName, setVisitorName] = useState(profile?.displayName || '');
    const [visitorMobile, setVisitorMobile] = useState(profile?.mobileNumber || '');
    const [eventType, setEventType] = useState('');
    const [visitorAddress, setVisitorAddress] = useState(profile?.pincode ? `${profile.state || ''}, ${profile.district || ''}, ${profile.block || ''}, ${profile.pincode || ''}` : '');
    const [message, setMessage] = useState('');
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [bookingMode, setBookingMode] = useState<'complete' | 'partial'>('complete');
    const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success'>('idle');
    const [isCallSatisfied, setIsCallSatisfied] = useState(false);
    const [ownerProfile, setOwnerProfile] = useState<any>(null);
    const [stats, setStats] = useState({ completed: 0, totalItems: 0, pending: 0, totalRequests: 0 });

    // Update form when profile loads
    useEffect(() => {
        if (profile) {
            if (!visitorName) setVisitorName(profile.displayName || '');
            if (!visitorMobile) setVisitorMobile(profile.mobileNumber || '');
            if (!visitorAddress && profile.pincode) {
                setVisitorAddress(`${profile.state || ''}, ${profile.district || ''}, ${profile.block || ''}, ${profile.pincode || ''}`);
            }
        }
    }, [profile]);

    useEffect(() => {
      const params = new URLSearchParams(location.search);
      if (params.get('review') === 'true') {
        setTimeout(() => {
          const rs = document.getElementById('reviews');
          if (rs) rs.scrollIntoView({ behavior: 'smooth' });
        }, 1000);
      }
    }, [location]);

  const fetchVenue = async () => {
    if (!id) return;
    const { data, error } = await db
      .from('venues')
      .select('*')
      .eq('id', id)
      .single();
    
    if (!error && data) {
      setVenue({
        ...data,
        ownerId: data.owner_id,
        venueType: data.venue_type,
        pricePerDay: data.price_per_day,
        reviewCount: data.review_count,
        availableFor: data.available_for,
        site_levels: data.site_levels || [],
        facilities: data.facilities || [],
        catalogue: data.catalogue || [],
        facilityDetails: data.facility_details || [],
        createdAt: data.created_at
      } as Venue);

      // Fetch owner profile
      const { data: userData } = await db
        .from('users')
        .select('*')
        .eq('uid', data.owner_id)
        .single();
      if (userData) setOwnerProfile(userData);

    // Fetch owner stats
    const [vCount, sCount, bCount, pCount, tCount] = await Promise.all([
      db.from('venues').select('id', { count: 'exact', head: true }).eq('owner_id', data.owner_id),
      db.from('service_providers').select('id', { count: 'exact', head: true }).eq('provider_id', data.owner_id),
      db.from('bookings').select('id', { count: 'exact', head: true })
        .eq('owner_id', data.owner_id)
        .in('status', ['completed', 'Success', 'paid', 'Paid']),
      db.from('bookings').select('id', { count: 'exact', head: true })
        .eq('owner_id', data.owner_id)
        .eq('status', 'pending'),
      db.from('bookings').select('id', { count: 'exact', head: true })
        .eq('owner_id', data.owner_id)
        .neq('status', 'cancelled')
    ]);

    setStats({
      totalItems: (Number(vCount?.count) || 0) + (Number(sCount?.count) || 0),
      completed: (Number(bCount?.count) || 0),
      pending: (Number(pCount?.count) || 0),
      totalRequests: (Number(tCount?.count) || 0)
    });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVenue();

    const subscription = db
      .channel(`venue_${id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'venues',
        filter: `id=eq.${id}`
      }, fetchVenue)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [id]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate || !visitorName || !visitorMobile || !eventType || !visitorAddress) {
      toast.error('Please fill all required fields');
      return;
    }

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    if (bookingDate < todayStr) {
      toast.error('Back date booking not allowed');
      return;
    }

    setBookingStatus('loading');
    try {
      // Calculate days if endDate is provided
      const start = new Date(bookingDate);
      const end = endDate ? new Date(endDate) : start;
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      let totalAmount = 0;
      if (bookingMode === 'complete') {
        totalAmount = (venue?.pricePerDay || 0) * diffDays;
      } else {
        const selCats = venue?.catalogue?.filter(c => selectedItems.includes(c.id || '')) || [];
        const selFacs = venue?.facilityDetails?.filter(f => selectedItems.includes(f.id || '')) || [];
        const catTotal = selCats.reduce((sum, item) => sum + (item.priceRate || 0), 0);
        const facTotal = selFacs.reduce((sum, item) => sum + (item.rate || 0), 0);
        totalAmount = (catTotal + facTotal) * diffDays;
      }

      // Check for existing pending booking from this visitor for this venue
      const { data: existingPending, error: pendingError } = await db
        .from('bookings')
        .select('id')
        .eq('target_id', venue?.id)
        .eq('visitor_mobile', visitorMobile)
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      if (existingPending && existingPending.length > 0) {
        toast.error('You already have a pending booking query for this venue. Please wait for a response.');
        setBookingStatus('idle');
        return;
      }

      // Check for existing booking on this date and overlapping time slot
      const { data: existingBookings, error: conflictError } = await db
        .from('bookings')
        .select('id, start_time, end_time')
        .eq('target_id', venue?.id)
        .eq('event_date', bookingDate)
        .in('status', ['confirmed', 'paid']);

      if (conflictError) throw conflictError;

      const hasConflict = existingBookings?.some(b => {
        if (!b.start_time || !b.end_time || !startTime || !endTime) return true; 
        return (startTime >= b.start_time && startTime < b.end_time) || 
               (endTime > b.start_time && endTime <= b.end_time) || 
               (startTime <= b.start_time && endTime >= b.end_time);
      });

      if (hasConflict) {
        const proceed = window.confirm('Warning: This venue already has a confirmed booking for the selected date and time. Do you still want to send a booking request?');
        if (!proceed) {
          setBookingStatus('idle');
          return;
        }
      }

      // Get calendar year start date (January 1st)
      const now = new Date();
      const yearStart = new Date(now.getFullYear(), 0, 1).toISOString();

      const { count, error: countError } = await db.from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', venue?.ownerId)
        .gte('created_at', yearStart);

      if (countError) console.error('Count query error:', countError);
      
      const ownerRegId = ownerProfile?.registration_id || ownerProfile?.registrationId || 'BVO';
      const tid = generateTransactionId(ownerRegId, count || 0);

      const selCats = venue?.catalogue?.filter(c => selectedItems.includes(c.id || '')) || [];
      const selFacs = venue?.facilityDetails?.filter(f => selectedItems.includes(f.id || '')) || [];
      const extraServices = [
        ...selCats.map(item => ({ name: item.level, amount: Math.round((item.priceRate || 0) * diffDays) })),
        ...selFacs.map(item => ({ name: item.name, amount: Math.round((item.rate || 0) * diffDays) }))
      ];

      const bookingData = {
        id: generateUUID(),
        user_id: user?.uid || 'visitor',
        visitor_name: visitorName,
        visitor_mobile: visitorMobile,
        event_type: eventType,
        target_id: venue?.id,
        target_type: 'venue',
        target_name: venue?.name + (bookingMode === 'partial' ? ' (Selected Amenities)' : ' (Complete Venue)'),
        owner_id: venue?.ownerId,
        event_date: bookingDate,
        end_date: endDate || bookingDate,
        start_time: startTime,
        end_time: endTime,
        status: 'pending',
        total_amount: Number(totalAmount),
        message: message || '',
        party_address: visitorAddress,
        transaction_id: tid,
        extra_services: extraServices
      };

      const { error } = await db.from('bookings').insert([bookingData]);

      if (error) throw error;

      // Send WhatsApp Alert to Owner
      try {
        const { data: ownerProfile } = await db.from('users').select('mobile_number').eq('uid', venue?.ownerId).single();
        if (ownerProfile?.mobile_number) {
          const alertMsg = `New Booking Query for ${venue?.name}!\nVisitor: ${visitorName}\nMobile: ${visitorMobile}\nAddress: ${visitorAddress}\nEvent: ${eventType}\nDate: ${bookingDate}\nMessage: ${message || 'No message'}`;
          sendWhatsAppAlert(ownerProfile.mobile_number, alertMsg);
        }
      } catch (waErr) {
        console.error('WhatsApp alert failed:', waErr);
      }

      setBookingStatus('success');
      toast.success('Booking request sent successfully!');
    } catch (err: any) {
      console.error('Booking Error:', err);
      toast.error(`Failed to send booking request: ${err.message || 'Unknown error'}`);
      setBookingStatus('idle');
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!venue) return <div className="h-screen flex items-center justify-center text-xl font-bold">Venue not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex justify-between items-center">
        <Link to="/" className="inline-flex items-center space-x-2 text-gray-600 hover:text-orange-600 font-bold bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 transition-all">
          <Home size={18} />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Gallery Section - Full width and clean */}
      <div className="mb-10">
        <div className="w-full rounded-[2rem] overflow-hidden shadow-2xl relative group h-[300px] md:h-[500px]">
          <img 
            src={resolveUrl(venue.images?.[0])} 
            alt={venue.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Venue Info Header - Below Gallery */}
      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm mb-10 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
        <div className="flex-1 text-center md:text-left min-w-0">
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 break-words leading-[1.1]">{venue.name}</h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4 text-gray-500 mb-6">
            <div className="flex items-center bg-gray-50 px-4 py-2 rounded-xl">
              <MapPin size={18} className="mr-2 text-orange-500 shrink-0" />
              <span className="font-bold text-sm md:text-base">{venue.address}, {venue.district}, {venue.state}</span>
            </div>
            <div className="flex items-center bg-orange-50 px-4 py-2 rounded-xl border border-orange-100">
              <Star size={18} className="mr-2 text-yellow-500 fill-yellow-500" />
              <span className="font-bold text-orange-700 text-sm md:text-base">{venue.rating > 0 ? venue.rating : 'New'} ({venue.reviewCount || 0} reviews)</span>
            </div>
          </div>
          
          <div className="flex items-center justify-center md:justify-start space-x-4">
            <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md border-2 border-white shrink-0">
              <img 
                src={resolveUrl(ownerProfile?.photo_url) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${ownerProfile?.display_name || venue.name}`} 
                alt={ownerProfile?.display_name || venue.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Managed By</p>
              <p className="font-bold text-gray-900 leading-tight">{ownerProfile?.display_name || 'Venue Manager'}</p>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <div className="flex items-center text-[9px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100 uppercase tracking-tighter" title="Successfully Completed Bookings">
                  <CheckCircle size={10} className="mr-1" />
                  {stats.completed} Completed
                </div>
                <div className="flex items-center text-[9px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100 uppercase tracking-tighter" title="Total Booking Requests Received (All Statuses)">
                  <Clock size={10} className="mr-1" />
                  {stats.totalRequests} Requests
                </div>
                <div className="flex items-center text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 uppercase tracking-tighter" title="Total Managed Venues & Services">
                  <DbIcon size={10} className="mr-1" />
                  {stats.totalItems} Items
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="shrink-0 flex flex-col items-center justify-center space-y-2">
           <div className="bg-gradient-to-br from-orange-500 to-pink-600 text-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-orange-100 text-center min-w-[200px]">
              <span className="block text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-80 underline underline-offset-4">Starting From</span>
              <span className="text-3xl md:text-4xl font-black">₹{(venue.pricePerDay || 0).toLocaleString()}</span>
              <span className="block text-xs font-bold mt-1 opacity-80">per event day</span>
           </div>
        </div>
      </div>

      {venue.latitude && venue.longitude && (
        <div className="mb-12 bg-white p-6 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
          <LocationDisplay 
            latitude={venue.latitude} 
            longitude={venue.longitude} 
            businessName={venue.name} 
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* Main Highlights Bar */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-wrap gap-8 justify-around">
             <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                   <Users size={24} />
                </div>
                <div>
                   <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Capacity</span>
                   <span className="text-xl font-black text-gray-900">{venue.capacity} Guests</span>
                </div>
             </div>
             <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shadow-sm">
                   <Home size={24} />
                </div>
                <div>
                   <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Venue Type</span>
                   <span className="text-xl font-black text-gray-900">{venue.venueType}</span>
                </div>
             </div>
             <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shadow-sm">
                   <CheckCircle size={24} />
                </div>
                <div>
                   <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Availability</span>
                   <span className="text-xl font-black text-gray-900">Immediate</span>
                </div>
             </div>
          </div>

          <div>
            <div className="prose max-w-none text-gray-600 leading-relaxed">
              <h3 className="text-xl font-bold text-gray-900 mb-4">About this Venue</h3>
              <p>{venue.description}</p>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-black text-orange-600 uppercase tracking-widest mb-3">Event Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {venue.availableFor?.length ? venue.availableFor.map((item, idx) => (
                    <span key={idx} className="bg-orange-50 text-orange-700 px-3 py-1.5 rounded-xl text-[10px] font-black border border-orange-100 uppercase tracking-tight">
                      {item}
                    </span>
                  )) : <span className="text-gray-400 italic text-xs">No specific events listed</span>}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-black text-purple-600 uppercase tracking-widest mb-3">Available Levels</h3>
                <div className="flex flex-wrap gap-2">
                  {venue.site_levels?.length ? venue.site_levels.map((item, idx) => (
                    <span key={idx} className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-xl text-[10px] font-black border border-purple-100 uppercase tracking-tight">
                      {item}
                    </span>
                  )) : <span className="text-gray-400 italic text-xs">No specific levels listed</span>}
                </div>
              </div>
            </div>

            {/* Removed Facilities Offered Level as requested */}

            {venue.catalogue && venue.catalogue.length > 0 && (
              <div className="mt-16">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Venue Catalogue</h3>
                <div className="space-y-12">
                  {venue.catalogue.map((item, idx) => (
                    <div key={idx} className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <h4 className="text-xl font-bold text-orange-600 uppercase tracking-wide">{item.level}</h4>
                          <div className="flex items-center gap-4 text-gray-500 text-sm mt-1">
                            <div className="flex items-center">
                              <Users size={14} className="mr-1" />
                              <span>Capacity: {item.capacity} persons</span>
                            </div>
                            {item.priceRate !== undefined && (
                              <div className="flex items-center text-orange-600 font-bold">
                                <IndianRupee size={12} className="mr-0.5" />
                                <span>₹{item.priceRate.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {item.images.map((img, imgIdx) => (
                          <div key={imgIdx} className="aspect-square rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-gray-50 border border-gray-100">
                            <img 
                              src={img} 
                              alt={`${item.level} ${imgIdx + 1}`} 
                              className="w-full h-full object-contain hover:scale-105 transition-transform duration-500" 
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        ))}
                        {item.videos?.map((vid, vidIdx) => (
                          <div key={vidIdx} className="aspect-square rounded-2xl overflow-hidden shadow-sm bg-black relative group">
                            <video 
                              src={vid} 
                              className="w-full h-full object-contain"
                              controls
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {venue.facilityDetails && venue.facilityDetails.length > 0 && (
              <div className="mt-16">
                <h3 className="text-2xl font-bold mb-6 text-gray-900 underline decoration-orange-500 decoration-4 underline-offset-8 italic uppercase tracking-tighter">Facilities & Price Chart</h3>
                <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xl overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-orange-600 text-white">
                      <tr>
                        <th className="px-6 py-4 font-black text-xs uppercase tracking-widest">Sr No.</th>
                        <th className="px-6 py-4 font-black text-xs uppercase tracking-widest">Facility Name</th>
                        <th className="px-6 py-4 font-black text-xs uppercase tracking-widest">Rate (₹)</th>
                        <th className="px-6 py-4 font-black text-xs uppercase tracking-widest text-center">Unit</th>
                        <th className="px-6 py-4 font-black text-xs uppercase tracking-widest text-center">Photo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-bold">
                      {venue.facilityDetails.map((f, i) => (
                        <tr key={f.id || i} className="hover:bg-orange-50/30 transition-all group">
                          <td className="px-6 py-4 text-gray-400 text-sm">{i + 1}</td>
                          <td className="px-6 py-4 text-gray-900 text-lg decoration-orange-300 group-hover:underline underline-offset-4">{f.name}</td>
                          <td className="px-6 py-4 text-orange-600 font-black text-xl">₹{f.rate.toLocaleString()}</td>
                          <td className="px-6 py-4 text-center">
                             <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[10px] uppercase tracking-tighter whitespace-nowrap">{f.unit}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {f.photoUrl ? (
                              <div className="relative inline-block">
                                <img src={resolveUrl(f.photoUrl)} className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md mx-auto group-hover:scale-110 transition-transform" referrerPolicy="no-referrer" alt={f.name} />
                                <div className="absolute inset-0 rounded-2xl ring-1 ring-black/5" />
                              </div>
                            ) : (
                              <span className="text-gray-300 italic text-[10px] font-black uppercase">Not Available</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {venue.rateChart && venue.rateChart.length > 0 && (
              <div className="mt-16">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Rate Chart</h3>
                <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 font-bold text-gray-700">Item / Service</th>
                        <th className="px-6 py-4 font-bold text-gray-700 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {venue.rateChart.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-gray-600">{item.item}</td>
                          <td className="px-6 py-4 text-gray-900 font-bold text-right">₹{item.price.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {venue.catalogue && venue.catalogue.length > 0 && (
              <div className="mt-16">
                <h3 className="text-2xl font-bold mb-6 text-gray-900 underline decoration-orange-500 decoration-4 underline-offset-8 italic uppercase tracking-tighter">Amenities Category Offered</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {venue.catalogue.map((cat, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-orange-50 rounded-2xl border border-orange-100 group hover:border-orange-300 transition-all hover:shadow-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white rounded-xl border border-orange-200 flex items-center justify-center text-orange-600 shadow-sm">
                          <CheckCircle size={20} />
                        </div>
                        <div>
                          <span className="block text-xs font-black text-orange-700 uppercase tracking-widest leading-none mb-1">{cat.level}</span>
                          <p className="text-[9px] text-gray-500 font-black uppercase tracking-tight italic">{cat.description || 'Verified Facility'}</p>
                        </div>
                      </div>
                      <div className="bg-white px-3 py-1.5 rounded-xl border border-orange-200 shadow-inner group-hover:scale-105 transition-transform">
                        <span className="text-xs font-black text-orange-600">₹{cat.priceRate?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-16">
              <ReviewSection 
                targetId={venue.id} 
                targetType="venue" 
                targetName={venue.name}
                currentRating={venue.rating} 
                onReviewAdded={fetchVenue}
                user={user}
              />
            </div>
          </div>
        </div>

        {/* Booking Card */}
        <div className="lg:col-span-1 space-y-8">
          <div className="sticky top-24 space-y-8">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
              <div className="flex items-baseline space-x-2 mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  {bookingMode === 'complete' 
                    ? `₹${(venue.pricePerDay || 0).toLocaleString()}`
                    : `₹${(() => {
                        const selCats = venue?.catalogue?.filter(c => selectedItems.includes(c.id || '')) || [];
                        const selFacs = venue?.facilityDetails?.filter(f => selectedItems.includes(f.id || '')) || [];
                        const catTotal = selCats.reduce((sum, item) => sum + (item.priceRate || 0), 0);
                        const facTotal = selFacs.reduce((sum, item) => sum + (item.rate || 0), 0);
                        return catTotal + facTotal;
                      })().toLocaleString()}`
                  }
                </span>
                <span className="text-gray-500">/ day</span>
              </div>

              {bookingStatus === 'success' ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Request Sent!</h3>
                  <p className="text-gray-500 mb-6">The owner will review your request and get back to you soon.</p>
                  <Link to="/venues" className="block w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all">
                    Back to Search
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleBooking} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Your Name</label>
                      <input 
                        required
                        type="text" 
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        placeholder="Full Name"
                        value={visitorName}
                        onChange={(e) => setVisitorName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Mobile Number</label>
                      <input 
                        required
                        type="tel" 
                        maxLength={10}
                        pattern="[0-9]{10}"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        placeholder="10-digit mobile number"
                        value={visitorMobile}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setVisitorMobile(val);
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Event Type</label>
                      <input 
                        required
                        type="text" 
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        placeholder="e.g. Wedding, Birthday, Seminar"
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Your Full Address</label>
                      <textarea 
                        required
                        rows={2}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        placeholder="Village/City, Block, District, State, Pincode"
                        value={visitorAddress}
                        onChange={(e) => setVisitorAddress(e.target.value)}
                      />
                    </div>

                    <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="block text-xs font-black text-orange-600 uppercase tracking-widest">Select Plan/Amenities Category</label>
                        <div className="bg-white px-3 py-1 rounded-full border border-orange-200">
                          <span className="text-[10px] font-bold text-gray-500 uppercase">Available Categories</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button 
                          type="button"
                          onClick={() => {
                            setBookingMode('complete');
                            setSelectedItems([]);
                          }}
                          className={cn(
                            "w-full py-4 rounded-xl font-bold transition-all border flex items-center justify-between px-6 shadow-sm",
                            bookingMode === 'complete' 
                              ? "bg-orange-600 text-white border-orange-600 scale-[1.02]" 
                              : "bg-white text-gray-700 border-gray-200 hover:border-orange-200"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", bookingMode === 'complete' ? "border-white" : "border-gray-300")}>
                              {bookingMode === 'complete' && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                            </div>
                            <span className="text-sm uppercase tracking-wide">Complete Venue / Service</span>
                          </div>
                          {bookingMode === 'complete' && <CheckCircle size={18} />}
                        </button>

                        <div className={cn(
                          "w-full p-1 rounded-2xl border transition-all",
                          bookingMode === 'partial' ? "bg-orange-50 border-orange-200" : "bg-gray-50 border-gray-100"
                        )}>
                          <button 
                            type="button"
                            onClick={() => setBookingMode('partial')}
                            className={cn(
                              "w-full py-4 rounded-xl font-bold transition-all flex items-center justify-between px-6 shadow-sm",
                              bookingMode === 'partial' 
                                ? "bg-orange-600 text-white border-orange-600" 
                                : "bg-white text-gray-500 border-gray-100"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", bookingMode === 'partial' ? "border-white" : "border-gray-300")}>
                                {bookingMode === 'partial' && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                              </div>
                              <span className="text-sm uppercase tracking-wide">Select Multiple Amenities</span>
                            </div>
                            {bookingMode === 'partial' && <Plus size={18} />}
                          </button>

                          {bookingMode === 'partial' && (venue.catalogue || venue.facilityDetails) && (
                            <div className="p-2 space-y-2 mt-2">
                              <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                {[
                                  ...(venue.catalogue || []).filter(c => c.level && (Number(c.priceRate) > 0)).map(c => ({ id: c.id, name: c.level, price: Number(c.priceRate), unit: c.unit || 'unit' })),
                                  ...(venue.facilityDetails || []).filter(f => f.name && (Number(f.rate) > 0)).map(f => ({ id: f.id, name: f.name, price: Number(f.rate), unit: f.unit || 'unit' }))
                                ].map(item => (
                                  <label key={item.id} className={cn(
                                    "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all hover:shadow-md",
                                    selectedItems.includes(item.id || '') 
                                      ? "bg-white border-orange-400 shadow-orange-50" 
                                      : "bg-white/50 border-orange-100"
                                  )}>
                                    <div className="flex items-center space-x-3">
                                      <div className={cn(
                                        "w-5 h-5 rounded flex items-center justify-center border transition-colors",
                                        selectedItems.includes(item.id || '') ? "bg-orange-600 border-orange-600" : "bg-white border-gray-300"
                                      )}>
                                        {selectedItems.includes(item.id || '') && <Check size={14} className="text-white" />}
                                        <input 
                                          type="checkbox"
                                          className="hidden"
                                          checked={selectedItems.includes(item.id || '')}
                                          onChange={(e) => {
                                            if (e.target.checked) setSelectedItems([...selectedItems, item.id || '']);
                                            else setSelectedItems(selectedItems.filter(id => id !== item.id));
                                          }}
                                        />
                                      </div>
                                      <span className="text-xs font-bold text-gray-700 uppercase tracking-tight">{item.name}</span>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-xs font-black text-orange-600 block">₹{item.price?.toLocaleString()}</span>
                                      <span className="text-[8px] text-gray-400 uppercase font-black tracking-widest">{item.unit}</span>
                                    </div>
                                  </label>
                                ))}
                                {(!venue.catalogue || venue.catalogue.filter(c => Number(c.priceRate) > 0).length === 0) && (venue.facilityDetails?.filter(f => Number(f.rate) > 0).length === 0) && (
                                  <div className="text-center py-8">
                                    <p className="text-xs text-gray-400 italic">No priced amenities available for this venue.</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Date Start From</label>
                        <div className="relative">
                          <input 
                            required
                            type="date" 
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm"
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                            min={format(new Date(), 'yyyy-MM-dd')}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Date To</label>
                        <div className="relative">
                          <input 
                            required
                            type="date" 
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={bookingDate || format(new Date(), 'yyyy-MM-dd')}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Start Time</label>
                        <input 
                          required
                          type="time" 
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">End Time</label>
                        <input 
                          required
                          type="time" 
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Message (Optional)</label>
                      <textarea 
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        placeholder="Any special requirements?"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                    </div>
                  </div>

                  <button 
                    disabled={bookingStatus === 'loading'}
                    type="submit" 
                    className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-700 shadow-xl shadow-orange-200 transition-all disabled:opacity-50"
                  >
                    {bookingStatus === 'loading' ? 'Sending...' : 'Send Booking Query'}
                  </button>
                </form>
              )}
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-gray-900 px-2">Availability Calendar</h4>
              <AvailabilityCalendar targetId={venue.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ServiceDetailView = ({ user, profile }: { user: any, profile: UserProfile | null }) => {
  const { id } = useParams();
  const [service, setService] = useState<ServiceProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('21:00');
  const [message, setMessage] = useState('');
  const [visitorName, setVisitorName] = useState(profile?.displayName || '');
  const [visitorMobile, setVisitorMobile] = useState(profile?.mobileNumber || '');
  const [eventType, setEventType] = useState('');
  const [visitorAddress, setVisitorAddress] = useState(profile?.pincode ? `${profile.state || ''}, ${profile.district || ''}, ${profile.block || ''}, ${profile.pincode || ''}` : '');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [bookingMode, setBookingMode] = useState<'complete' | 'partial'>('complete');
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [isCallSatisfied, setIsCallSatisfied] = useState(false);
  const [providerProfile, setProviderProfile] = useState<any>(null);
  const [stats, setStats] = useState({ completed: 0, totalItems: 0, pending: 0, totalRequests: 0 });

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      if (!visitorName) setVisitorName(profile.displayName || '');
      if (!visitorMobile) setVisitorMobile(profile.mobileNumber || '');
      if (!visitorAddress && profile.pincode) {
        setVisitorAddress(`${profile.state || ''}, ${profile.district || ''}, ${profile.block || ''}, ${profile.pincode || ''}`);
      }
    }
  }, [profile]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('review') === 'true') {
      setTimeout(() => {
        const rs = document.getElementById('reviews');
        if (rs) rs.scrollIntoView({ behavior: 'smooth' });
      }, 1000);
    }
  }, [location]);

  const fetchService = async () => {
    if (!id) return;
    const { data, error } = await db
      .from('service_providers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (!error && data) {
      setService({
        ...data,
        ownerId: data.owner_id || data.provider_id,
        serviceType: data.service_type || data.type,
        priceRange: data.price_range,
        reviewCount: data.review_count,
        availableFor: data.available_for,
        facilities: data.facilities || [],
        catalogue: data.catalogue || [],
        facilityDetails: data.facility_details || [],
        latitude: data.latitude,
        longitude: data.longitude,
        createdAt: data.created_at
      } as ServiceProvider);

      // Fetch provider profile
      const ownerId = data.owner_id || data.provider_id;
      const { data: userData } = await db
        .from('users')
        .select('*')
        .eq('uid', ownerId)
        .single();
      if (userData) setProviderProfile(userData);

      // Fetch stats
      const [vCount, sCount, bCount, pCount, tCount] = await Promise.all([
        db.from('venues').select('id', { count: 'exact', head: true }).eq('owner_id', ownerId),
        db.from('service_providers').select('id', { count: 'exact', head: true }).eq('provider_id', ownerId),
        db.from('bookings').select('id', { count: 'exact', head: true })
          .eq('owner_id', ownerId)
          .in('status', ['completed', 'Success', 'paid', 'Paid']),
        db.from('bookings').select('id', { count: 'exact', head: true })
          .eq('owner_id', ownerId)
          .eq('status', 'pending'),
        db.from('bookings').select('id', { count: 'exact', head: true })
          .eq('owner_id', ownerId)
          .neq('status', 'cancelled')
      ]);

      setStats({
        totalItems: (Number(vCount?.count) || 0) + (Number(sCount?.count) || 0),
        completed: (Number(bCount?.count) || 0),
        pending: (Number(pCount?.count) || 0),
        totalRequests: (Number(tCount?.count) || 0)
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchService();

    const subscription = db
      .channel(`service_${id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'service_providers',
        filter: `id=eq.${id}`
      }, fetchService)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [id]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !visitorName || !visitorMobile || !eventType || !visitorAddress) {
      toast.error('Please fill all required fields');
      return;
    }

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    if (date < todayStr) {
      toast.error('Back date booking not allowed');
      setBookingStatus('idle');
      return;
    }
    if (!/^\d{10}$/.test(visitorMobile)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setBookingStatus('loading');
    try {
      // Check for existing pending booking from this visitor for this service
      const { data: existingPending, error: pendingError } = await db
        .from('bookings')
        .select('id')
        .eq('target_id', service?.id)
        .eq('visitor_mobile', visitorMobile)
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      if (existingPending && existingPending.length > 0) {
        toast.error('You already have a pending booking query for this service. Please wait for a response.');
        setBookingStatus('idle');
        return;
      }

      // Check for existing booking on this date and overlapping time slot
      const { data: existingBookings, error: conflictError } = await db
        .from('bookings')
        .select('id, start_time, end_time')
        .eq('target_id', service?.id)
        .eq('event_date', date)
        .in('status', ['confirmed', 'paid']);

      if (conflictError) throw conflictError;

      const hasConflict = existingBookings?.some(b => {
        if (!b.start_time || !b.end_time || !startTime || !endTime) return true;
        return (startTime >= b.start_time && startTime < b.end_time) || 
               (endTime > b.start_time && endTime <= b.end_time) || 
               (startTime <= b.start_time && endTime >= b.end_time);
      });

      if (hasConflict) {
        const proceed = window.confirm('Warning: This service provider already has a confirmed booking for the selected date and time. Do you still want to send a booking request?');
        if (!proceed) {
          setBookingStatus('idle');
          return;
        }
      }

      // Get calendar year start date (January 1st)
      const now = new Date();
      const yearStart = new Date(now.getFullYear(), 0, 1).toISOString();

      const { count, error: countError } = await db.from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', service?.ownerId)
        .gte('created_at', yearStart);
      
      if (countError) console.error('Count query error:', countError);

      const providerRegId = providerProfile?.registration_id || providerProfile?.registrationId || 'BVO';
      const tid = generateTransactionId(providerRegId, count || 0);

      // Extract first numeric price from priceRange if possible
      const priceMatch = service?.priceRange?.match(/\d+/);
      const basePrice = priceMatch ? parseInt(priceMatch[0]) : 0;

      let totalAmount = 0;
      const start = new Date(date);
      const end = endDate ? new Date(endDate) : start;
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      if (bookingMode === 'complete') {
        totalAmount = basePrice * diffDays;
      } else {
        const selCats = service?.catalogue?.filter(c => selectedItems.includes(c.id || '')) || [];
        const selFacs = service?.facilityDetails?.filter(f => selectedItems.includes(f.id || '')) || [];
        const catTotal = selCats.reduce((sum, item) => sum + (item.priceRate || 0), 0);
        const facTotal = selFacs.reduce((sum, item) => sum + (item.rate || 0), 0);
        totalAmount = (catTotal + facTotal) * diffDays;
      }

      const selCatsList = service?.catalogue?.filter(c => selectedItems.includes(c.id || '')) || [];
      const selFacsList = service?.facilityDetails?.filter(f => selectedItems.includes(f.id || '')) || [];
      const extraServices = [
        ...selCatsList.map(item => ({ name: item.level, amount: Math.round((item.priceRate || 0) * diffDays) })),
        ...selFacsList.map(item => ({ name: item.name, amount: Math.round((item.rate || 0) * diffDays) }))
      ];

      const bookingData = {
        id: generateUUID(),
        user_id: user?.uid || 'visitor',
        target_id: service?.id,
        target_type: 'service',
        target_name: service?.name + (bookingMode === 'partial' ? ' (Selected Amenities)' : ''),
        owner_id: service?.ownerId,
        event_date: date,
        end_date: endDate || date,
        start_time: startTime,
        end_time: endTime,
        status: 'pending',
        total_amount: totalAmount,
        updated_amount: totalAmount,
        message: message || '',
        visitor_name: visitorName,
        visitor_mobile: visitorMobile,
        party_address: visitorAddress,
        event_type: eventType,
        transaction_id: tid,
        extra_services: extraServices
      };

      const { error } = await db.from('bookings').insert([bookingData]);

      if (error) throw error;

      // Send WhatsApp Alert to Provider
      try {
        const { data: providerProfile } = await db.from('users').select('mobile_number').eq('uid', service?.ownerId).single();
        if (providerProfile?.mobile_number) {
          const alertMsg = `New Service Query for ${service?.name}!\nVisitor: ${visitorName}\nMobile: ${visitorMobile}\nAddress: ${visitorAddress}\nDate: ${date}\nMessage: ${message || 'No message'}`;
          sendWhatsAppAlert(providerProfile.mobile_number, alertMsg);
        }
      } catch (waErr) {
        console.error('WhatsApp alert failed:', waErr);
      }

      setBookingStatus('success');
      toast.success('Booking inquiry sent successfully!');
    } catch (err: any) {
      console.error('Inquiry Error:', err);
      toast.error(`Failed to send inquiry: ${err.message || 'Unknown error'}`);
      setBookingStatus('idle');
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader className="animate-spin text-orange-600" /></div>;
  if (!service) return <div className="text-center py-20">Service not found</div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <Link to="/" className="inline-flex items-center space-x-2 text-gray-600 hover:text-orange-600 font-bold bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 transition-all">
          <Home size={18} />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Gallery Section */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="w-full rounded-[2rem] overflow-hidden shadow-2xl relative group h-[300px] md:h-[500px]">
          <img 
            src={resolveUrl(service.images?.[0]) || 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=1920'} 
            alt={service.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Service Info Header */}
      <div className="max-w-7xl mx-auto px-4 mt-10">
        <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
          <div className="flex-1 text-center md:text-left min-w-0">
             <span className="bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-4 inline-block">
               {service.serviceType}
             </span>
             <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 break-words leading-[1.1]">{service.name}</h1>
             
             <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4 text-gray-500 mb-6">
               <div className="flex items-center bg-gray-50 px-4 py-2 rounded-xl">
                 <MapPin size={18} className="mr-2 text-orange-500 shrink-0" />
                 <span className="font-bold text-sm md:text-base">{service.district}, {service.state}</span>
               </div>
               <div className="flex items-center bg-purple-50 px-4 py-2 rounded-xl border border-purple-100">
                 <Star size={18} className="mr-2 text-yellow-500 fill-yellow-500" />
                 <span className="font-bold text-purple-700 text-sm md:text-base">{service.rating > 0 ? service.rating : 'New'} ({service.reviewCount || 0} reviews)</span>
               </div>
             </div>

             <div className="flex items-center justify-center md:justify-start space-x-4">
               <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md border-2 border-white shrink-0">
                 <img 
                   src={resolveUrl(providerProfile?.photo_url) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${providerProfile?.display_name || service.name}`} 
                   alt={providerProfile?.display_name || service.name} 
                   className="w-full h-full object-cover"
                   referrerPolicy="no-referrer"
                 />
               </div>
               <div className="text-left">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Provider</p>
                 <p className="font-bold text-gray-900 leading-tight">{providerProfile?.display_name || 'Service Partner'}</p>
                 <div className="flex flex-wrap items-center gap-2 mt-1.5">
                   <div className="flex items-center text-[9px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100 uppercase tracking-tighter" title="Successfully Completed Bookings">
                     <CheckCircle size={10} className="mr-1" />
                     {stats.completed} Completed
                   </div>
                   <div className="flex items-center text-[9px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100 uppercase tracking-tighter" title="Total Booking Requests Received (All Statuses)">
                     <Clock size={10} className="mr-1" />
                     {stats.totalRequests} Requests
                   </div>
                   <div className="flex items-center text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 uppercase tracking-tighter" title="Total Managed Venues & Services">
                     <DbIcon size={10} className="mr-1" />
                     {stats.totalItems} Items
                   </div>
                 </div>
               </div>
             </div>
          </div>
          
          <div className="shrink-0">
             <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-purple-100 text-center min-w-[220px]">
                <span className="block text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-80 underline underline-offset-4">Package Starts</span>
                <span className="text-2xl md:text-3xl font-black">{service.priceRange}</span>
                <span className="block text-xs font-bold mt-1 opacity-80">customizable pricing</span>
             </div>
          </div>
        </div>
      </div>

      {service.latitude && service.longitude && (
        <div className="max-w-7xl mx-auto px-4 mt-8">
          <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <LocationDisplay 
              latitude={service.latitude} 
              longitude={service.longitude} 
              businessName={service.name} 
            />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 mt-10">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-wrap gap-8 justify-around">
           <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shadow-sm">
                 <Star size={24} />
              </div>
              <div>
                 <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Experience</span>
                 <span className="text-xl font-black text-gray-900">{service.rating > 0 ? service.rating : 'New'} Stars</span>
              </div>
           </div>
           <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shadow-sm">
                 <MessageSquare size={24} />
              </div>
              <div>
                 <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Reviews</span>
                 <span className="text-xl font-black text-gray-900">{service.reviewCount || 0} Total</span>
              </div>
           </div>
           <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
                 <User size={24} />
              </div>
              <div>
                 <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Expertise</span>
                 <span className="text-xl font-black text-gray-900">{service.serviceType}</span>
              </div>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Available For & Portfolio</h3>
              <div className="flex flex-wrap gap-3">
                {[...(service.availableFor || []), ...(service.catalogue?.map(c => c.level) || [])].filter((v, i, a) => a.indexOf(v) === i).map((item, idx) => (
                  <span key={idx} className="bg-purple-50 text-purple-700 px-4 py-2 rounded-xl text-sm font-bold border border-purple-100">
                    {item}
                  </span>
                ))}
                {(!service.availableFor || service.availableFor.length === 0) && (!service.catalogue || service.catalogue.length === 0) && (
                  <span className="text-gray-400 italic text-sm">No specific event types listed</span>
                )}
              </div>
            </section>

            <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">About this Service</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{service.description}</p>
            </section>

            {service.facilities && service.facilities.length > 0 && (
              <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-2xl font-bold mb-6 text-gray-900">Facilities Offered</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {service.facilities.map((facility, idx) => (
                    <div key={idx} className="flex items-center space-x-3 text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center shrink-0">
                        <Check size={14} strokeWidth={3} />
                      </div>
                      <span className="font-bold text-sm uppercase">{facility}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {service.facilityDetails && service.facilityDetails.length > 0 && (
              <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden min-w-0">
                <h3 className="text-2xl font-bold mb-8 text-gray-900 underline decoration-purple-500 decoration-4 underline-offset-8 italic uppercase tracking-tighter">Facility Details & Rate List</h3>
                <div className="overflow-x-auto -mx-8 md:mx-0">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-purple-600 text-white">
                      <tr>
                        <th className="px-6 py-4 font-black text-[10px] uppercase tracking-[0.2em]">Sr.</th>
                        <th className="px-6 py-4 font-black text-[10px] uppercase tracking-[0.2em]">Facility</th>
                        <th className="px-6 py-4 font-black text-[10px] uppercase tracking-[0.2em]">Rate</th>
                        <th className="px-6 py-4 font-black text-[10px] uppercase tracking-[0.2em] text-center">Unit</th>
                        <th className="px-6 py-4 font-black text-[10px] uppercase tracking-[0.2em] text-center">Photo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 bg-white">
                      {service.facilityDetails.map((f, i) => (
                        <tr key={f.id || i} className="hover:bg-purple-50/50 transition-all group group/row">
                          <td className="px-6 py-4 text-xs font-bold text-gray-400">{i + 1}</td>
                          <td className="px-6 py-4">
                            <span className="text-gray-900 font-black text-sm uppercase tracking-tight">{f.name}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-purple-700 font-black text-lg">₹{f.rate.toLocaleString()}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter whitespace-nowrap">{f.unit}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {f.photoUrl ? (
                              <div className="relative inline-block group-hover/row:scale-110 transition-transform duration-300">
                                <img src={resolveUrl(f.photoUrl)} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-lg mx-auto" referrerPolicy="no-referrer" alt={f.name} />
                                <div className="absolute inset-0 rounded-2xl ring-1 ring-black/5" />
                              </div>
                            ) : (
                              <span className="text-gray-200 font-black uppercase text-[8px] tracking-[0.2em]">No Photo</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {service.catalogue && service.catalogue.length > 0 && (
              <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-2xl font-bold mb-8 text-gray-900">Service Catalogue</h3>
                <div className="space-y-10">
                  {service.catalogue.map((item, idx) => (
                    <div key={idx} className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-lg text-purple-600 uppercase tracking-wide">{item.level}</h4>
                        <div className="flex gap-2 items-center">
                          {item.capacity > 0 && (
                            <span className="text-xs font-bold bg-purple-50 text-purple-600 px-3 py-1 rounded-full">
                              Capacity: {item.capacity}
                            </span>
                          )}
                          {item.priceRate && (
                            <span className="text-xs font-black bg-orange-50 text-orange-600 px-3 py-1 rounded-full border border-orange-100 flex items-center">
                              <IndianRupee size={10} className="mr-0.5" /> {item.priceRate.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {item.images.map((img, imgIdx) => (
                          <div key={imgIdx} className="aspect-square rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                            <img 
                              src={resolveUrl(img)} 
                              alt={`${item.level} ${imgIdx + 1}`} 
                              className="w-full h-full object-contain hover:scale-105 transition-transform duration-500" 
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        ))}
                        {item.videos?.map((vid, vidIdx) => (
                          <div key={vidIdx} className="aspect-square rounded-xl overflow-hidden border border-gray-100 bg-black relative group">
                            <video 
                              src={resolveUrl(vid)} 
                              className="w-full h-full object-contain"
                              controls
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {service.rateChart && (
              <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-2xl font-bold mb-6 text-gray-900">Rate Chart</h3>
                <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                  <div className="space-y-2">
                    {service.rateChart.map((rate, idx) => (
                      <div key={idx} className="flex justify-between items-center border-b border-orange-100 pb-2 last:border-0">
                        <span className="text-gray-700 font-medium">{rate.item}</span>
                        <span className="text-orange-600 font-bold">₹{rate.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {service.catalogue && service.catalogue.length > 0 && (
              <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-2xl font-bold mb-6 text-gray-900 underline decoration-purple-500 decoration-4 underline-offset-8 italic uppercase tracking-tighter">Services & Package Categories</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {service.catalogue.map((cat, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-purple-50 rounded-2xl border border-purple-100 group hover:border-purple-300 transition-all hover:shadow-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white rounded-xl border border-purple-200 flex items-center justify-center text-purple-600 shadow-sm">
                          <Sparkles size={20} />
                        </div>
                        <div>
                          <span className="block text-xs font-black text-purple-700 uppercase tracking-widest leading-none mb-1">{cat.level}</span>
                          <p className="text-[9px] text-gray-500 font-black uppercase tracking-tight italic">{cat.description || 'Premium Service'}</p>
                        </div>
                      </div>
                      <div className="bg-white px-3 py-1.5 rounded-xl border border-purple-200 shadow-inner group-hover:scale-105 transition-transform">
                        <span className="text-xs font-black text-purple-600">₹{cat.priceRate?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {service.catalogue && service.catalogue.length > 0 && (
              <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-2xl font-bold mb-6 text-gray-900">Service Categories & Amenities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {service.catalogue.map((cat, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-purple-50 rounded-2xl border border-purple-100 group hover:border-purple-300 transition-colors">
                      <div>
                        <span className="block text-xs font-black text-purple-600 uppercase tracking-widest mb-1">{cat.level}</span>
                        <p className="text-[10px] text-gray-500 uppercase font-black">{cat.description || 'PROFESSIONAL PACKAGE'}</p>
                      </div>
                      <div className="bg-white px-4 py-2 rounded-xl border border-purple-200 shadow-sm group-hover:scale-105 transition-transform">
                        <span className="text-sm font-black text-purple-600">₹{cat.priceRate?.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <ReviewSection 
                targetId={service.id} 
                targetType="service" 
                targetName={service.name}
                currentRating={service.rating} 
                onReviewAdded={fetchService}
                user={user}
              />
            </section>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-2xl border border-orange-100 sticky top-24">
              <div className="flex items-baseline space-x-2 mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  {bookingMode === 'complete' 
                    ? service.priceRange
                    : `₹${(() => {
                        const selCats = service?.catalogue?.filter(c => selectedItems.includes(c.id || '')) || [];
                        const selFacs = service?.facilityDetails?.filter(f => selectedItems.includes(f.id || '')) || [];
                        const catTotal = selCats.reduce((sum, item) => sum + (item.priceRate || 0), 0);
                        const facTotal = selFacs.reduce((sum, item) => sum + (item.rate || 0), 0);
                        return (catTotal + facTotal).toLocaleString();
                      })()}`
                  }
                </span>
                <span className="text-gray-500">/ package</span>
              </div>
              <h3 className="text-2xl font-bold mb-6 text-gray-900 sr-only">Book this Service</h3>
              
              {bookingStatus === 'success' ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check size={32} />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Inquiry Sent!</h4>
                  <p className="text-gray-500">The service provider will contact you shortly.</p>
                  <button 
                    onClick={() => setBookingStatus('idle')}
                    className="mt-6 text-orange-600 font-bold hover:underline"
                  >
                    Send another inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBooking} className="space-y-4">
                  {!user && (
                    <>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Your Name</label>
                        <input 
                          required
                          type="text" 
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                          placeholder="Enter your name"
                          value={visitorName}
                          onChange={(e) => setVisitorName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Mobile Number</label>
                        <input 
                          required
                          type="tel" 
                          maxLength={10}
                          pattern="[0-9]{10}"
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                          placeholder="Enter mobile number"
                          value={visitorMobile}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setVisitorMobile(val);
                          }}
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Event Type</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      placeholder="e.g. Wedding, Birthday"
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Your Full Address</label>
                    <textarea 
                      required
                      rows={2}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      placeholder="Village/City, Block, District, State, Pincode"
                      value={visitorAddress}
                      onChange={(e) => setVisitorAddress(e.target.value)}
                    />
                  </div>

                  <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-black text-purple-600 uppercase tracking-widest">Booking Mode</label>
                      <div className="bg-white px-3 py-1 rounded-full border border-purple-200">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Available Amenities Category</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={() => setBookingMode('complete')}
                        className={cn(
                          "flex-1 py-2 rounded-xl text-xs font-bold transition-all border",
                          bookingMode === 'complete' ? "bg-purple-600 text-white border-purple-600 shadow-md" : "bg-white text-gray-600 border-gray-200"
                        )}
                      >
                        Complete Package
                      </button>
                      <button 
                        type="button"
                        onClick={() => setBookingMode('partial')}
                        className={cn(
                          "flex-1 py-2 rounded-xl text-xs font-bold transition-all border",
                          bookingMode === 'partial' ? "bg-purple-600 text-white border-purple-600 shadow-md" : "bg-white text-gray-600 border-gray-200"
                        )}
                      >
                        Select Amenities
                      </button>
                    </div>

                    {bookingMode === 'partial' && (service.catalogue || service.facilityDetails) && (
                      <div className="space-y-2 mt-4 pt-4 border-t border-purple-100">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Available Amenities Category</label>
                        <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2">
                          {[
                            ...(service.catalogue || []).filter(c => c.level && (Number(c.priceRate) > 0)).map(c => ({ id: c.id, name: c.level, price: Number(c.priceRate), unit: c.unit || 'unit' })),
                            ...(service.facilityDetails || []).filter(f => f.name && (Number(f.rate) > 0)).map(f => ({ id: f.id, name: f.name, price: Number(f.rate), unit: f.unit || 'unit' }))
                          ].map(item => (
                            <label key={item.id} className="flex items-center justify-between p-2 bg-white rounded-xl border border-purple-100 cursor-pointer hover:border-purple-300 transition-colors">
                              <div className="flex items-center space-x-2">
                                <input 
                                  type="checkbox"
                                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                  checked={selectedItems.includes(item.id || '')}
                                  onChange={(e) => {
                                    if (e.target.checked) setSelectedItems([...selectedItems, item.id || '']);
                                    else setSelectedItems(selectedItems.filter(id => id !== item.id));
                                  }}
                                />
                                <span className="text-xs font-bold text-gray-700 uppercase">{item.name}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-xs font-black text-purple-600 block">₹{item.price?.toLocaleString()}</span>
                                <span className="text-[8px] text-gray-400 uppercase font-black tracking-widest">{item.unit}</span>
                              </div>
                            </label>
                          ))}
                          {(!service.catalogue || service.catalogue.filter(c => Number(c.priceRate) > 0).length === 0) && (service.facilityDetails?.filter(f => Number(f.rate) > 0).length === 0) && (
                            <p className="text-[10px] text-gray-400 italic">No priced amenities available.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Date Start From</label>
                      <input 
                        required
                        type="date" 
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        min={format(new Date(), 'yyyy-MM-dd')}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Date To</label>
                      <input 
                        required
                        type="date" 
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={date || format(new Date(), 'yyyy-MM-dd')}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Start Time</label>
                      <input 
                        required
                        type="time" 
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">End Time</label>
                      <input 
                        required
                        type="time" 
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                    <textarea 
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      placeholder="Any special requirements?"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>

                  <button 
                    disabled={bookingStatus === 'loading'}
                    type="submit" 
                    className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-700 shadow-xl shadow-orange-200 transition-all disabled:opacity-50"
                  >
                    {bookingStatus === 'loading' ? 'Sending...' : 'Send Booking Query'}
                  </button>
                </form>
              )}

              <div className="mt-8 space-y-4">
                <h4 className="font-bold text-gray-900 px-2">Availability Calendar</h4>
                <AvailabilityCalendar targetId={service.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ManuallyBookingView = ({ 
  user, 
  profile, 
  bookings: parentBookings, 
  venues: parentVenues, 
  services: parentServices, 
  onUpdate,
  globalSettings,
  activeSubscription,
  onUpgrade
}: { 
  user: any, 
  profile: UserProfile | null, 
  bookings?: Booking[], 
  venues?: Venue[], 
  services?: ServiceProvider[], 
  onUpdate?: () => void,
  globalSettings?: any,
  activeSubscription?: UserSubscription | null,
  onUpgrade?: () => void
}) => {
  const [bookings, setBookings] = useState<Booking[]>(parentBookings || []);
  const [loading, setLoading] = useState(!parentBookings);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 20;
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isAmountModalOpen, setIsAmountModalOpen] = useState(false);
  const [isPaymentRecordModalOpen, setIsPaymentRecordModalOpen] = useState(false);
  const [isCallSatisfied, setIsCallSatisfied] = useState(false);
  const [newAmount, setNewAmount] = useState<number>(0);
  const [editableExtraServices, setEditableExtraServices] = useState<any[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<'Pending' | 'Paid'>('Pending');
  
  const [manualBooking, setManualBooking] = useState<{
    partyName: string;
    partyAddress: string;
    mobileNumber: string;
    eventDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    eventType: string;
    targetId: string;
    targetName: string;
    totalAmount: number;
    bookingMode: 'complete' | 'partial';
    selectedItems: string[];
  }>({
    partyName: '',
    partyAddress: '',
    mobileNumber: '',
    eventDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '21:00',
    eventType: 'Wedding',
    targetId: '',
    targetName: '',
    totalAmount: 0,
    bookingMode: 'complete',
    selectedItems: []
  });
  const [venues, setVenues] = useState<Venue[]>(parentVenues || []);
  const [services, setServices] = useState<ServiceProvider[]>(parentServices || []);

  useEffect(() => {
    if (parentVenues) setVenues(parentVenues);
    if (parentServices) setServices(parentServices);
    if (parentBookings) setBookings(parentBookings);
  }, [parentVenues, parentServices, parentBookings]);

  useEffect(() => {
    const item = [...venues, ...services].find(i => i.id === manualBooking.targetId);
    if (manualBooking.bookingMode === 'partial' && item) {
      if (item.catalogue) {
        const start = new Date(manualBooking.eventDate);
        const end = manualBooking.endDate ? new Date(manualBooking.endDate) : start;
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        
        const selectedAmenities = item.catalogue.filter(c => manualBooking.selectedItems.includes(c.id || ''));
        const amenitiesTotal = selectedAmenities.reduce((sum, item) => sum + (item.priceRate || 0), 0) * diffDays;
        setManualBooking(prev => ({ ...prev, totalAmount: amenitiesTotal }));
      }
    } else if (manualBooking.bookingMode === 'complete' && item) {
       const start = new Date(manualBooking.eventDate);
       const end = manualBooking.endDate ? new Date(manualBooking.endDate) : start;
       const diffTime = Math.abs(end.getTime() - start.getTime());
       const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
       
       let basePrice = 0;
       if (item && 'pricePerDay' in item) {
         basePrice = (item as Venue).pricePerDay || 0;
       } else if (item && 'priceRange' in item) {
         const priceMatch = (item as ServiceProvider).priceRange?.match(/\d+/);
         basePrice = priceMatch ? parseInt(priceMatch[0]) : 0;
       }
       
       setManualBooking(prev => ({ ...prev, totalAmount: basePrice * diffDays }));
    }
  }, [manualBooking.bookingMode, manualBooking.selectedItems, manualBooking.eventDate, manualBooking.endDate, manualBooking.targetId, venues, services]);
  
  const [manualCallSatisfied, setManualCallSatisfied] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchBookings = async () => {
    if (!user) return;
    if (onUpdate) {
      onUpdate();
      return;
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchBookings();

    const fetchMyItems = async () => {
      const vQuery = db.from('venues').select('*');
      if (profile?.role !== 'admin') vQuery.eq('owner_id', user?.uid);
      const { data: vData } = await vQuery;
      if (vData) setVenues(vData.map(d => ({ 
        id: d.id, 
        ...d,
        reviewCount: d.review_count,
        ownerId: d.owner_id,
        venueType: d.venue_type,
        pricePerDay: d.price_per_day
      } as any)));
      
      const sQuery = db.from('service_providers').select('*');
      if (profile?.role !== 'admin') {
        const { data: sp1 } = await db.from('service_providers').select('*').eq('provider_id', user?.uid);
        const { data: sp2 } = await db.from('service_providers').select('*').eq('owner_id', user?.uid);
        const sCombined = [...(sp1 || []), ...(sp2 || [])];
        const sDataFiltered = sCombined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
        setServices(sDataFiltered.map(d => ({ 
          id: d.id, 
          ...d,
          reviewCount: d.review_count,
          ownerId: d.owner_id || d.provider_id,
          serviceType: d.service_type || d.type,
          priceRange: d.price_range
        } as any)));
      } else {
        const { data: sData } = await sQuery;
        if (sData) setServices(sData.map(d => ({ 
          id: d.id, 
          ...d,
          reviewCount: d.review_count,
          ownerId: d.owner_id || d.provider_id,
          serviceType: d.service_type || d.type,
          priceRange: d.price_range
        } as any)));
      }
    };

    fetchMyItems();
  }, [user]);

  const filteredBookings = (bookings || []).filter(b => {
    // Show only manual bookings without payments in Manual Booking
    if (!b.isManual) return false;
    
    // Hide if payment exists (moves to Manage Payment)
    if (b.payments && b.payments.length > 0) return false;

    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'pending' && b.status === 'pending') ||
                         (statusFilter === 'confirmed' && (b.status === 'confirmed' || b.status === 'approved')) ||
                         (statusFilter === 'cancelled' && b.status === 'cancelled');
    const matchesDate = !dateFilter || b.eventDate === dateFilter;
    return matchesStatus && matchesDate;
  });

  const sortedBookings = [...filteredBookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = sortedBookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(sortedBookings.length / bookingsPerPage);

  const handleToggleLock = async (id: string, isLocked: boolean) => {
    if (isLocked && globalSettings?.subscriptionEnabled && (!activeSubscription || activeSubscription.status !== 'active')) {
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

  const handleStatusUpdate = async (id: string, status: 'confirmed' | 'cancelled') => {
    try {
      const { error } = await db.from('bookings').update({ status }).eq('id', id);
      if (error) throw error;
      toast.success(`Booking ${status} successfully`);
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error('Failed to update booking status');
    }
  };

  const handleUpdateAmount = async () => {
    if (!selectedBooking) return;
    try {
      const { error } = await db.from('bookings').update({
        total_amount: newAmount,
        updated_amount: newAmount,
        extra_services: editableExtraServices
      }).eq('id', selectedBooking.id);
      
      if (error) throw error;
      toast.success('Amount updated successfully');
      setIsAmountModalOpen(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error('Failed to update amount');
    }
  };

  useEffect(() => {
    const item = [...venues, ...services].find(v => v.id === manualBooking.targetId);
    if (!item) return;

    let total = 0;
    const start = new Date(manualBooking.eventDate);
    const end = manualBooking.endDate ? new Date(manualBooking.endDate) : start;
    const diffTime = Math.max(0, end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    if (manualBooking.bookingMode === 'complete') {
      const basePrice = 'pricePerDay' in item ? (item.pricePerDay || 0) : (parseInt(item.priceRange?.match(/\d+/)?.[0] || '0'));
      total = basePrice * diffDays;
    } else {
      const selCats = (item as any).catalogue?.filter((c: any) => manualBooking.selectedItems.includes(c.id || '')) || [];
      const selFacs = (item as any).facilityDetails?.filter((f: any) => manualBooking.selectedItems.includes(f.id || '')) || [];
      const catTotal = selCats.reduce((sum: number, i: any) => sum + (i.priceRate || 0), 0);
      const facTotal = selFacs.reduce((sum: number, i: any) => sum + (i.rate || 0), 0);
      total = (catTotal + facTotal) * diffDays;
    }

    if (total !== manualBooking.totalAmount) {
      setManualBooking(prev => ({ ...prev, totalAmount: total }));
    }
  }, [manualBooking.targetId, manualBooking.eventDate, manualBooking.endDate, manualBooking.bookingMode, manualBooking.selectedItems]);

  const handleManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBooking.targetId || !manualBooking.eventDate || !manualBooking.partyName) {
      toast.error('Please fill required fields');
      return;
    }

    if (!manualCallSatisfied) {
      toast.error('Please confirm that you have called the party');
      return;
    }

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    if (manualBooking.eventDate < todayStr) {
      toast.error('Back date entry not allowed');
      return;
    }

    setLoading(true);
    try {
      // Get current year start date (January 1st)
      const now = new Date();
      const yearStart = new Date(now.getFullYear(), 0, 1).toISOString();

      const { count } = await db.from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user?.uid)
        .gte('created_at', yearStart);
      
      const targetVenue = venues.find(v => v.id === manualBooking.targetId);
      const isService = !targetVenue;
      const tid = generateTransactionId(profile?.registrationId || 'BVO', count || 0, true);

      let extraServices: any[] = [];
      let finalTargetName = manualBooking.targetName;
      let finalTotalAmount = manualBooking.totalAmount;

      const start = new Date(manualBooking.eventDate);
      const end = manualBooking.endDate ? new Date(manualBooking.endDate) : start;
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      if (manualBooking.bookingMode === 'partial' && (targetVenue?.catalogue || (targetVenue as any)?.facilityDetails)) {
        const selCats = targetVenue?.catalogue?.filter(c => manualBooking.selectedItems.includes(c.id || '')) || [];
        const selFacs = (targetVenue as any)?.facilityDetails?.filter((f: any) => manualBooking.selectedItems.includes(f.id || '')) || [];
        
        extraServices = [
          ...selCats.map(item => ({ name: item.level, amount: Math.round((item.priceRate || 0) * diffDays) })),
          ...selFacs.map(item => ({ name: item.name, amount: Math.round((item.rate || 0) * diffDays) }))
        ];
        finalTargetName = manualBooking.targetName + ' (Amenities)';
        
        // If the user didn't override the amount (i.e. it's still default or 0), 
        // set it to the sum of amenities.
        const amenitiesTotal = extraServices.reduce((sum, s) => sum + s.amount, 0);
        if (finalTotalAmount === 0 || finalTotalAmount === (targetVenue?.pricePerDay || 0)) {
           finalTotalAmount = amenitiesTotal;
        }
      } else if (!isService) {
        finalTargetName = manualBooking.targetName + ' (Venue)';
      }

      const bookingId = generateUUID();
      const { error } = await db.from('bookings').insert([{
        id: bookingId,
        user_id: user?.uid,
        owner_id: user?.uid,
        target_id: manualBooking.targetId,
        target_type: isService ? 'service' : 'venue',
        target_name: finalTargetName,
        event_date: manualBooking.eventDate,
        end_date: manualBooking.endDate || null,
        start_time: manualBooking.startTime,
        end_time: manualBooking.endTime,
        event_type: manualBooking.eventType,
        party_name: manualBooking.partyName,
        party_address: manualBooking.partyAddress,
        visitor_mobile: manualBooking.mobileNumber,
        status: (Number(finalTotalAmount) > 0 && paymentStatus === 'Paid') ? 'completed' : 'confirmed',
        is_manual: true,
        payment_mode: 'Cash',
        payment_status: paymentStatus || 'Pending',
        total_amount: Number(finalTotalAmount) || 0,
        updated_amount: Number(finalTotalAmount) || 0,
        transaction_id: tid,
        extra_services: extraServices
      }]);
      if (error) throw error;

      // Register payment record if Paid
      if (paymentStatus === 'Paid' && Number(finalTotalAmount) > 0) {
        await db.from('booking_payments').insert([{
          booking_id: bookingId,
          amount: Number(finalTotalAmount),
          payment_mode: 'Cash',
          payment_date: manualBooking.eventDate,
          payment_type: 'Regular',
          transaction_id: tid
        }]);
      }
      setIsManualModalOpen(false);
      const whatsappMsg = `*BOOKING CONFIRMATION - BEST VENUE OPTION*%0A%0A` +
        `Hello *${manualBooking.partyName}*, your booking for *${finalTargetName}* has been confirmed!%0A%0A` +
        `*BOOKING DETAILS:*%0A` +
        `━━━━━━━━━━━━━━━%0A` +
        `*Date:* ${formatDateDDMMYYYY(manualBooking.eventDate)}${manualBooking.endDate ? ' to ' + formatDateDDMMYYYY(manualBooking.endDate) : ''}%0A` +
        `*Time:* ${formatTime12h(manualBooking.startTime)} - ${formatTime12h(manualBooking.endTime)}%0A` +
        `*Event:* ${manualBooking.eventType}%0A%0A` +
        `*FINANCIAL SUMMARY:*%0A` +
        `*Total Amount:* ₹${finalTotalAmount.toLocaleString()}%0A` +
        `*Paid Status:* ${paymentStatus || 'Pending'}%0A%0A` +
        `Thank you for choosing *BEST VENUE OPTION*! We are committed to making your event grand and successful.`;
      
      sendWhatsAppAlert(manualBooking.mobileNumber, whatsappMsg);
      toast.success('Manual booking added and locked as accepted');
      fetchBookings();
      setManualBooking({
        partyName: '',
        partyAddress: '',
        mobileNumber: '',
        eventDate: '',
        endDate: '',
        startTime: '09:00',
        endTime: '21:00',
        eventType: 'Wedding',
        targetId: '',
        targetName: '',
        totalAmount: 0,
        bookingMode: 'complete',
        selectedItems: []
      });
      setManualCallSatisfied(false);
      if (onUpdate) onUpdate();
      fetchBookings();
    } catch (err: any) {
      console.error('Manual Booking Error:', err);
      if (err.message?.includes('column "start_time" does not exist')) {
        toast.error('Database schema error: start_time column missing. Please run the FIX_DISTRICT_COLUMN.sql script.');
      } else {
        toast.error(`Failed to add manual booking: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 md:space-y-10 px-0">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 md:mb-10">
        <div className="w-full">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Booking Manager</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your venue and service bookings</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:items-center gap-2 md:gap-3 w-full lg:w-auto">
          <select 
            className="px-2 py-2 md:px-3 md:py-2 bg-gray-50 border border-gray-200 rounded-xl text-[10px] sm:text-sm font-bold focus:ring-2 focus:ring-orange-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Approved</option>
            <option value="cancelled">Rejected</option>
            <option value="paid">Paid</option>
          </select>
          <input 
            type="date" 
            className="px-2 py-2 md:px-3 md:py-2 bg-gray-50 border border-gray-200 rounded-xl text-[10px] sm:text-sm font-bold focus:ring-2 focus:ring-orange-500"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
          <button 
            onClick={() => setIsManualModalOpen(true)}
            className="col-span-2 sm:col-span-1 bg-orange-600 text-white px-3 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-[10px] sm:text-base flex items-center justify-center space-x-1 sm:space-x-2 hover:bg-orange-700 transition-all shadow-lg shadow-orange-200 whitespace-nowrap"
          >
            <Plus size={14} className="sm:size-[18px]" />
            <span>Manual Entry</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6">
        {currentBookings.length > 0 ? (
          currentBookings.map(booking => (
            <div key={booking.id} className="bg-white rounded-2xl md:rounded-3xl p-3 md:p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
              <div className="flex items-start space-x-3 md:space-x-4 min-w-0">
                <div className={cn(
                  "flex-shrink-0 w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-2xl flex items-center justify-center",
                  booking.status === 'pending' ? "bg-yellow-100 text-yellow-600" :
                  booking.status === 'confirmed' ? "bg-green-100 text-green-600" :
                  "bg-red-100 text-red-600"
                )}>
                  <Calendar size={isDesktop ? 24 : 16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center flex-wrap gap-1 md:gap-2">
                    <h3 className="font-bold text-sm md:text-lg text-gray-900 truncate max-w-[140px] md:max-w-none">
                      {booking.isManual ? booking.partyName : booking.visitorName}
                    </h3>
                    {booking.isManual && (
                      <span className="bg-gray-100 text-gray-500 text-[6px] md:text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase">Manual</span>
                    )}
                    {booking.isLocked && (
                      <span className="bg-red-50 text-red-600 text-[6px] md:text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 uppercase border border-red-100">
                        <Lock size={10} /> Locked
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] md:text-sm text-gray-500 font-medium truncate">{booking.targetName} • {booking.eventType}</p>
                  <div className="flex flex-wrap items-center gap-x-2 md:gap-x-4 gap-y-1 mt-1.5 md:mt-2 text-[9px] md:text-sm text-gray-400">
                    <span className="flex items-center whitespace-nowrap"><Calendar size={10} className="mr-0.5 md:mr-1" /> {formatDateDDMMYYYY(booking.eventDate)}</span>
                    <span className="flex items-center whitespace-nowrap"><Phone size={10} className="mr-0.5 md:mr-1" /> {booking.visitorMobile}</span>
                    {booking.partyAddress && <span className="flex items-center col-span-2 md:col-span-1"><MapPin size={10} className="mr-0.5 md:mr-1" /> {booking.partyAddress}</span>}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-start md:justify-end gap-2 md:gap-3 border-t border-gray-50 pt-3 md:border-none md:pt-0">
                {booking.status === 'pending' ? (
                  <>
                    <button 
                      onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                      className="px-4 py-1.5 md:px-6 md:py-2 rounded-lg md:rounded-xl font-bold text-xs md:text-base text-red-600 hover:bg-red-50 transition-all border border-red-100 md:border-none"
                    >
                      Deny
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedBooking(booking);
                        setIsAcceptModalOpen(true);
                      }}
                      className="px-4 py-1.5 md:px-6 md:py-2 bg-green-600 text-white rounded-lg md:rounded-xl font-bold text-xs md:text-base hover:bg-green-700 transition-all shadow-lg shadow-green-100"
                    >
                      Accept
                    </button>
                  </>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn(
                      "px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl font-bold text-[9px] md:text-sm uppercase tracking-wider",
                      (booking.status === 'confirmed' || booking.status === 'paid' || booking.status === 'completed' || booking.paymentStatus === 'Paid') ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                    )}>
                      {(booking.status === 'paid' || booking.status === 'completed' || booking.paymentStatus === 'Paid') ? 'Completed' : (booking.status === 'confirmed' ? 'Accepted' : booking.status)}
                    </span>
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                      {/* Lock/Unlock Toggle */}
                      {(booking.status === 'confirmed' || booking.status === 'approved' || booking.status === 'paid') && (booking.ownerId === user?.uid || profile?.role === 'admin') && (
                        <button
                          onClick={() => handleToggleLock(booking.id, !booking.isLocked)}
                          className={cn(
                            "flex-1 md:flex-none justify-center px-4 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center space-x-2 transition-all border shadow-sm",
                            booking.isLocked 
                              ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100" 
                              : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                          )}
                        >
                          {booking.isLocked ? <Lock size={16} className="text-red-600" /> : <Unlock size={16} className="text-green-600" />}
                          <span>{booking.isLocked ? 'Unlock Booking' : 'Lock Booking'}</span>
                        </button>
                      )}
                    </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
          <div className="text-center py-20 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-500">Your booking requests and manual entries will appear here.</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-10">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="p-2 rounded-xl border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            <ChevronRight size={20} className="rotate-180" />
          </button>
          <span className="font-bold text-gray-600">Page {currentPage} of {totalPages}</span>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className="p-2 rounded-xl border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Manual Booking Modal */}
      <AnimatePresence>
        {isManualModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsManualModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-3xl md:rounded-[40px] shadow-2xl overflow-hidden max-h-[95vh] flex flex-col mx-2 md:mx-4"
            >
              <div className="p-4 sm:p-6 md:p-10 overflow-y-auto scrollbar-hide">
                <div className="flex justify-between items-center mb-6 md:mb-8 sticky top-0 bg-white z-10 pb-2 border-b border-gray-50 md:border-none">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">Manual Booking</h2>
                  <button onClick={() => setIsManualModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleManualBooking} className="space-y-4 md:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Select Venue/Service</label>
                      <select 
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        value={manualBooking.targetId}
                        onChange={(e) => {
                          const id = e.target.value;
                          const name = [...venues, ...services].find(i => i.id === id)?.name || '';
                          setManualBooking({...manualBooking, targetId: id, targetName: name});
                        }}
                      >
                        <option value="">Select an item</option>
                        <optgroup label="Venues">
                          {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                        </optgroup>
                        <optgroup label="Services">
                          {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </optgroup>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Party Name</label>
                      <input 
                        required
                        type="text" 
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none uppercase"
                        value={manualBooking.partyName}
                        onChange={(e) => setManualBooking({...manualBooking, partyName: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Mobile Number</label>
                      <input 
                        required
                        type="tel" 
                        maxLength={10}
                        pattern="[0-9]{10}"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        value={manualBooking.mobileNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setManualBooking({...manualBooking, mobileNumber: val});
                        }}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Party Address</label>
                      <input 
                        required
                        type="text" 
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none uppercase"
                        value={manualBooking.partyAddress}
                        onChange={(e) => setManualBooking({...manualBooking, partyAddress: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Start Date</label>
                      <input 
                        required
                        type="date" 
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        value={manualBooking.eventDate}
                        onChange={(e) => setManualBooking({...manualBooking, eventDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">End Date (Optional)</label>
                      <input 
                        type="date" 
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        value={manualBooking.endDate}
                        onChange={(e) => setManualBooking({...manualBooking, endDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Start Time</label>
                      <input 
                        required
                        type="time" 
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        value={manualBooking.startTime}
                        onChange={(e) => setManualBooking({...manualBooking, startTime: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">End Time</label>
                      <input 
                        required
                        type="time" 
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        value={manualBooking.endTime}
                        onChange={(e) => setManualBooking({...manualBooking, endTime: e.target.value})}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Event Type</label>
                      <select 
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        value={manualBooking.eventType}
                        onChange={(e) => setManualBooking({...manualBooking, eventType: e.target.value})}
                      >
                        {['Wedding', 'Reception', 'Engagement', 'Haldi', 'Mehendi', 'Sangeet', 'Birthday Party', 'Anniversary', 'Corporate Event', 'Seminar', 'Exhibition', 'Others'].map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    {(() => {
                      const item = [...venues, ...services].find(v => v.id === manualBooking.targetId);
                      if (!item) return null;
                      
                      return (
                        <div className="md:col-span-2 bg-orange-50 p-4 rounded-2xl border border-orange-100 space-y-4">
                          <div className="flex justify-between items-center">
                            <label className="block text-xs font-black text-orange-600 uppercase tracking-widest">Booking Mode</label>
                            <div className="bg-white px-3 py-1 rounded-full border border-orange-200">
                              <span className="text-[10px] font-bold text-gray-500 uppercase">Available Amenities Category</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              type="button"
                              onClick={() => setManualBooking({...manualBooking, bookingMode: 'complete'})}
                              className={cn(
                                "flex-1 py-2 rounded-xl text-xs font-bold transition-all border",
                                manualBooking.bookingMode === 'complete' ? "bg-orange-600 text-white border-orange-600 shadow-md" : "bg-white text-gray-600 border-gray-200"
                              )}
                            >
                              Complete {'venueType' in item ? 'Venue' : 'Package'}
                            </button>
                            <button 
                              type="button"
                              onClick={() => setManualBooking({...manualBooking, bookingMode: 'partial'})}
                              className={cn(
                                "flex-1 py-2 rounded-xl text-xs font-bold transition-all border",
                                manualBooking.bookingMode === 'partial' ? "bg-orange-600 text-white border-orange-600 shadow-md" : "bg-white text-gray-600 border-gray-200"
                              )}
                            >
                              Select Amenities
                            </button>
                          </div>

                          {manualBooking.bookingMode === 'partial' && (
                            <div className="space-y-2 mt-4 pt-4 border-t border-orange-100">
                              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Available Amenities Category</label>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
                                {[
                                  ...((item as any).catalogue || []).filter((c: any) => c.priceRate && c.priceRate > 0).map((c: any) => ({ id: c.id, name: c.level, price: c.priceRate, unit: c.unit || 'unit' })),
                                  ...((item as any).facilityDetails || []).filter((f: any) => f.rate && f.rate > 0).map((f: any) => ({ id: f.id, name: f.name, price: f.rate, unit: f.unit || 'unit' }))
                                ].map(amenityItem => (
                                  <label key={amenityItem.id} className="flex items-center justify-between p-2 bg-white rounded-xl border border-orange-100 cursor-pointer hover:border-orange-300 transition-colors">
                                    <div className="flex items-center space-x-2">
                                      <input 
                                        type="checkbox"
                                        className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                                        checked={manualBooking.selectedItems.includes(amenityItem.id || '')}
                                        onChange={(e) => {
                                          if (e.target.checked) setManualBooking({...manualBooking, selectedItems: [...manualBooking.selectedItems, amenityItem.id || '']});
                                          else setManualBooking({...manualBooking, selectedItems: manualBooking.selectedItems.filter(id => id !== amenityItem.id)});
                                        }}
                                      />
                                      <span className="text-[10px] font-bold text-gray-700 uppercase">{amenityItem.name}</span>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-[10px] font-black text-orange-600 block">₹{amenityItem.price?.toLocaleString()}</span>
                                      <span className="text-[8px] text-gray-400 uppercase font-black tracking-widest">{amenityItem.unit}</span>
                                    </div>
                                  </label>
                                ))}
                                {(!item.catalogue && !(item as any).facilityDetails) && (
                                  <p className="text-[10px] text-gray-400 italic">No priced amenities available.</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Total Amount (₹)</label>
                      <input 
                        type="number" 
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none font-bold text-orange-600"
                        value={manualBooking.totalAmount}
                        onChange={(e) => setManualBooking({...manualBooking, totalAmount: parseFloat(e.target.value) || 0})}
                      />
                      <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wider">
                        {manualBooking.bookingMode === 'complete' 
                          ? "Enter full venue price for selected dates" 
                          : "Calculated based on selected amenities. You can override manually."}
                      </p>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-start space-x-3 cursor-pointer group mt-2">
                      <div className="mt-1">
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                          checked={manualCallSatisfied}
                          onChange={(e) => setManualCallSatisfied(e.target.checked)}
                        />
                      </div>
                      <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                        I have connected with the party via call and I am satisfied to proceed with this manual booking request.
                      </span>
                    </label>
                  </div>

                  <button 
                    type="submit" 
                    disabled={!manualCallSatisfied}
                    className={cn(
                      "w-full py-4 rounded-2xl font-bold text-lg transition-all mt-4",
                      manualCallSatisfied ? "bg-orange-600 text-white shadow-xl shadow-orange-200 hover:bg-orange-700" : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    )}
                  >
                    Confirm Manual Booking
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {isAmountModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6">Update Booking Amount</h3>
            <div className="space-y-6">
              {editableExtraServices.length > 0 && (
                <div className="space-y-3">
                  <label className="block text-xs font-black text-orange-600 uppercase tracking-widest">Update Amenities Rates</label>
                  <div className="space-y-2">
                    {editableExtraServices.map((service: any, idx: number) => (
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
                              setNewAmount(prev => Math.max(0, prev - oldExtrasTotal + newExtrasTotal));
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
                  placeholder="Enter new amount"
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <button onClick={() => setIsAmountModalOpen(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold">Cancel</button>
                <button onClick={handleUpdateAmount} className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-bold">Update</button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  onClick={() => selectedBooking && handleStatusUpdate(selectedBooking.id, 'confirmed')} 
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

      {isPaymentRecordModalOpen && (
        <ManagePaymentModal 
          isOpen={isPaymentRecordModalOpen}
          onClose={() => setIsPaymentRecordModalOpen(false)}
          booking={selectedBooking}
          currentUserUid={user?.uid}
          onUpdate={() => {
            if (onUpdate) onUpdate();
            fetchBookings();
          }}
        />
      )}
    </div>
  );
};
// --- Location Data ---
// Moved to top

const sendWhatsAppAlert = (mobile: string, message: string) => {
  // Ensure mobile number is in correct format (remove spaces, add country code if missing)
  let formattedMobile = mobile.replace(/\s+/g, '');
  if (formattedMobile.length === 10) {
    formattedMobile = '91' + formattedMobile;
  }
  const url = `https://wa.me/${formattedMobile}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};

const numberToWords = (num: number): string => {
  if (isNaN(num) || num === null) return 'Zero';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const absNum = Math.floor(Math.abs(num));
  if (absNum === 0) return 'Zero';
  
  const convert = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + convert(n % 10000000) : '');
  };
  
  return convert(absNum) + ' Rupees Only';
};

const imageUrlToBase64 = async (url: string): Promise<string | null> => {
  if (!url) return null;
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error('Error fetching image for invoice:', e);
    return null;
  }
};

const fetchAndAddHindiFont = async (doc: any) => {
  try {
    const fontUrl = "https://raw.githubusercontent.com/google/fonts/main/ofl/hind/Hind-Regular.ttf";
    const res = await fetch(fontUrl);
    if (!res.ok) throw new Error("Font fetch failed");
    const arrayBuffer = await res.arrayBuffer();
    
    const bytes = new Uint8Array(arrayBuffer);
    let binary = "";
    const chunkSize = 65536;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, chunk as any);
    }
    const base64Font = btoa(binary);
    
    doc.addFileToVFS("Hind-Regular.ttf", base64Font);
    doc.addFont("Hind-Regular.ttf", "Hind", "normal");
    return true;
  } catch (err) {
    console.warn("Could not load Hindi font, falling back to default font", err);
    return false;
  }
};

const renderTextToImage = (
  text: string, 
  fontSize: number, 
  isBold: boolean, 
  color: string = '#000000', 
  scaleFactor: number = 2.8346
): { dataUrl: string, width: number, height: number, baselineOffset: number, leftPaddingOffset: number, textWidthOffset: number } => {
  if (!text || !text.trim()) {
    return { dataUrl: '', width: 0, height: 0, baselineOffset: 0, leftPaddingOffset: 0, textWidthOffset: 0 };
  }
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { dataUrl: '', width: 0, height: 0, baselineOffset: 0, leftPaddingOffset: 0, textWidthOffset: 0 };
  }
  
  const scale = 4;
  const scaledFontSize = fontSize * scale;
  const fontStyle = `${isBold ? '700' : '400'} ${scaledFontSize}px "Hind", "Noto Sans Devanagari", "Inter", sans-serif`;
  ctx.font = fontStyle;
  
  const metrics = ctx.measureText(text);
  const textWidth = Math.ceil(metrics.width);
  const textHeight = Math.ceil(scaledFontSize * 1.5);
  
  canvas.width = textWidth + 20; // 10px padding on each side
  canvas.height = textHeight;
  
  ctx.font = fontStyle;
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = color;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const baselineY = Math.ceil(scaledFontSize * 1.1);
  ctx.fillText(text, 10, baselineY);
  
  const scaleToPdf = (fontSize / scaleFactor) / scaledFontSize;
  const widthInPdf = canvas.width * scaleToPdf;
  const heightInPdf = canvas.height * scaleToPdf;
  
  return {
    dataUrl: canvas.toDataURL('image/png'),
    width: widthInPdf,
    height: heightInPdf,
    baselineOffset: baselineY * scaleToPdf,
    leftPaddingOffset: 10 * scaleToPdf,
    textWidthOffset: textWidth * scaleToPdf
  };
};

const generateInvoice = async (booking: Booking, expenditure: number, providerProfile?: UserProfile | null, allBookings: Booking[] = [], globalSettings: any = null) => {
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;
  const doc = new jsPDF();
  
  const hasHindiFont = await fetchAndAddHindiFont(doc);
  const defaultFont = hasHindiFont ? "Hind" : "helvetica";

  const setDocFont = (d: any, style: 'normal' | 'bold' | 'italic') => {
    if (hasHindiFont) {
      d.setFont("Hind", "normal");
    } else {
      d.setFont("helvetica", style);
    }
  };

  const drawText = (d: any, text: string | string[], x: number, y: number, options?: { align?: 'left' | 'right' | 'center', maxWidth?: number, fontSize?: number, isBold?: boolean, color?: string }) => {
    if (!text) return;
    const align = options?.align || 'left';
    const fontSize = options?.fontSize || d.getFontSize();
    const isBold = options?.isBold !== undefined ? options.isBold : false;
    const color = options?.color || '#000000';
    
    if (Array.isArray(text)) {
      let currentY = y;
      text.forEach(line => {
        drawText(d, line, x, currentY, options);
        currentY += fontSize * 0.4 + 4;
      });
      return;
    }

    if (/[\u0900-\u097F]/.test(text)) {
      const imgInfo = renderTextToImage(text, fontSize, isBold, color, d.internal.scaleFactor);
      if (imgInfo && imgInfo.dataUrl) {
        const { dataUrl, width, height, baselineOffset, leftPaddingOffset, textWidthOffset } = imgInfo;
        let drawX = x;
        if (align === 'left') {
          drawX = x - leftPaddingOffset;
        } else if (align === 'right') {
          drawX = x - (leftPaddingOffset + textWidthOffset);
        } else if (align === 'center') {
          drawX = x - (leftPaddingOffset + textWidthOffset / 2);
        }
        const drawY = y - baselineOffset;
        d.addImage(dataUrl, 'PNG', drawX, drawY, width, height, undefined, 'FAST');
      }
    } else {
      d.text(text, x, y, options);
    }
  };
  
  // Fetch latest booking from database to ensure it's 100% updated in real-time
  let latestBooking = booking;
  try {
    const { data: bData, error: bErr } = await db.from('bookings').select('*').eq('id', booking.id).maybeSingle();
    if (bData && !bErr) {
      latestBooking = {
        ...booking,
        updatedAmount: Number(bData.updated_amount !== undefined ? bData.updated_amount : (bData.updatedAmount !== undefined ? bData.updatedAmount : booking.updatedAmount)) || 0,
        totalAmount: Number(bData.total_amount !== undefined ? bData.total_amount : (bData.totalAmount !== undefined ? bData.totalAmount : booking.totalAmount)) || 0,
        status: bData.status || booking.status,
        paymentStatus: bData.payment_status || bData.paymentStatus || booking.paymentStatus,
        paymentMode: bData.payment_mode || bData.paymentMode || booking.paymentMode,
        isManual: bData.is_manual !== undefined ? bData.is_manual : (bData.isManual !== undefined ? bData.isManual : booking.isManual),
        extra_services: typeof bData.extra_services === 'string' ? JSON.parse(bData.extra_services) : (bData.extra_services || booking.extra_services || []),
        partyName: bData.party_name || bData.partyName || booking.partyName,
        partyAddress: bData.party_address || bData.partyAddress || booking.partyAddress,
        visitorName: bData.visitor_name || bData.visitorName || booking.visitorName,
        visitorMobile: bData.visitor_mobile || bData.visitorMobile || booking.visitorMobile,
        targetName: bData.target_name || bData.targetName || booking.targetName,
        eventType: bData.event_type || bData.eventType || booking.eventType,
        eventDate: bData.event_date || bData.eventDate || booking.eventDate,
        endDate: bData.end_date || bData.endDate || booking.endDate,
        startTime: bData.start_time || bData.startTime || booking.startTime,
        endTime: bData.end_time || bData.endTime || booking.endTime,
      };
    }
  } catch (e) {
    console.error('Error fetching latest booking for invoice:', e);
  }

  // Fetch App Branding from admin_settings
  let appLogoUrl = '/logo.png';
  let appName = 'BEST VENUE OPTION';
  let appTagline = 'VENUE & EVENT & SERVICE PROVIDERS';
  
  try {
    const { data: settings } = await db.from('admin_settings').select('*');
    if (settings) {
      const logo = settings.find(s => s.key === 'app_logo_url')?.value;
      const name = settings.find(s => s.key === 'app_name')?.value;
      const tagline = settings.find(s => s.key === 'app_tagline')?.value;
      if (logo) appLogoUrl = logo;
      if (name) appName = name;
      if (tagline) appTagline = tagline;
    }
  } catch (e) {
    console.warn('Error fetching app settings for invoice:', e);
  }

  const timestamp = format(new Date(), 'dd/MM/yyyy hh:mm:ss a');
  const fullTotalRecord = Number(latestBooking.updatedAmount || 0) || Number(latestBooking.totalAmount || 0) || 0;
  const extraServicesTotal = (latestBooking.extra_services || []).reduce((sum, s) => sum + (Number(s.amount || 0) || 0), 0);
  const baseAmount = Math.max(0, fullTotalRecord - extraServicesTotal);
  const subTotalActual = Number(fullTotalRecord + (Number(expenditure || 0) || 0));
  
  // Accurately sum all payments, fetch if empty
  let invoicePayments: any[] = [];
  try {
    const { data: pData, error: pErr } = await db.from('booking_payments').select('*').eq('booking_id', latestBooking.id);
    if (pData && !pErr) {
      invoicePayments = pData.map((p: any) => ({
        id: p.id,
        booking_id: p.booking_id,
        bookingId: p.booking_id,
        amount: Number(p.amount) || 0,
        paymentMode: p.payment_mode || p.paymentMode,
        paymentDate: p.payment_date || p.paymentDate,
        paymentType: p.payment_type || p.paymentType,
        transaction_id: p.transaction_id || p.transactionId || p.id?.substring(0, 8).toUpperCase(),
        createdAt: p.created_at || p.createdAt
      }));
    }
  } catch (e) {
    console.error('Invoice: Failed to fetch payments in real-time', e);
  }

  // Fallback to latestBooking.payments if database query failed or returned empty
  if (invoicePayments.length === 0 && latestBooking.payments && latestBooking.payments.length > 0) {
    invoicePayments = latestBooking.payments.map((p: any) => ({
      ...p,
      amount: Number(p.amount) || 0,
      booking_id: latestBooking.id,
      bookingId: latestBooking.id,
    }));
  }

  const relatedPayments = (invoicePayments || []).filter((p: any) => 
    p && (p.booking_id === latestBooking.id || p.bookingId === latestBooking.id || p.id === latestBooking.id)
  );
  
  // Fetch logo base64 once
  let logoBase64: string | null = null;
  try {
    logoBase64 = await imageUrlToBase64(appLogoUrl);
  } catch (err) {
    console.warn('Could not fetch app logo for invoice');
  }

  const totalReceived = relatedPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const balanceDue = Math.max(0, subTotalActual - totalReceived);
  
  const isPaid = balanceDue <= 0 && subTotalActual > 0;
  const partyName = latestBooking.isManual ? latestBooking.partyName : (latestBooking.visitorName || latestBooking.partyName);
  const partyMobile = latestBooking.isManual ? latestBooking.visitorMobile : (latestBooking.visitorMobile || '');

  // CUSTOM INVOICE NUMBER LOGIC
  const bookingTypePrefix = latestBooking.isManual ? 'MB' : 'PB';
  
  // Calculate Serial Number
  const currentYear = new Date().getFullYear();
  const providerBookingsThisYear = allBookings
    .filter(b => {
      const bYear = new Date(b.createdAt || new Date()).getFullYear();
      return b.ownerId === latestBooking.ownerId && bYear === currentYear;
    })
    .sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
  
  const bookingIndex = providerBookingsThisYear.findIndex(b => b.id === latestBooking.id);
  const serialNo = (bookingIndex !== -1 ? bookingIndex + 1 : providerBookingsThisYear.length + 1).toString().padStart(4, '0');
  
  const customInvoiceNo = `BVO/${bookingTypePrefix}/${serialNo}`;
  
  const getDisplayStatus = () => {
    const status = (latestBooking.status || 'pending').toLowerCase();
    if (isPaid || status === 'completed') return 'COMPLETED';
    if (!globalSettings?.subscriptionEnabled) return 'PAID';
    if (status === 'confirmed' || status === 'approved' || status === 'paid') return 'CONFIRMED';
    return status.toUpperCase();
  };

  // --- MODULAR DRAWERS ---
  const drawHeader = (d: any) => {
    const headerTitle = (booking.targetName || "BUSINESS").split('(')[0].trim().toUpperCase();
    d.setFontSize(20);
    d.setTextColor(234, 88, 12); 
    setDocFont(d, "bold");
    drawText(d, headerTitle, 105, 12, { align: 'center', maxWidth: 170, isBold: true, color: '#EA580C', fontSize: 20 });
    
    d.setFontSize(9);
    d.setTextColor(0);
    setDocFont(d, "normal");
    drawText(d, `Owner: ${providerProfile?.displayName || 'N/A'}`, 20, 20, { fontSize: 9 });
    drawText(d, `Mobile: ${providerProfile?.mobileNumber || 'N/A'}`, 20, 24, { fontSize: 9 });
    
    if (providerProfile) {
      const address = `${providerProfile.block || ''}, ${providerProfile.district || ''}, ${providerProfile.state || ''} - ${providerProfile.pincode || ''}`;
      drawText(d, address, 190, 20, { align: 'right', maxWidth: 80, fontSize: 9 });
    }
    
    d.setDrawColor(234, 88, 12);
    d.setLineWidth(0.4);
    d.line(20, 28, 190, 28);

    d.setFontSize(12);
    d.setTextColor(0);
    setDocFont(d, "bold");
    drawText(d, "INVOICE", 20, 36, { isBold: true, fontSize: 12 });
    
    d.setFontSize(8);
    setDocFont(d, "normal");
    d.setTextColor(100);
    drawText(d, `Invoice No: ${customInvoiceNo || 'N/A'}`, 190, 34, { align: 'right', fontSize: 8 });
    drawText(d, `Date: ${formatDateDDMMYYYY(new Date()) || ''}`, 190, 37, { align: 'right', fontSize: 8 });
    drawText(d, `Time: ${formatTime12h(new Date().toLocaleTimeString()) || ''}`, 190, 40, { align: 'right', fontSize: 8 });
    
    return 45; 
  };

  const drawFooter = (d: any) => {
    const footerBaseline = 282;
    d.setDrawColor(234, 88, 12);
    d.setLineWidth(0.3);
    d.line(20, footerBaseline, 190, footerBaseline);
    
    if (logoBase64 && logoBase64.startsWith('data:image')) {
      try {
        d.addImage(logoBase64, 'PNG', 20.5, 283, 8, 8, undefined, 'FAST');
      } catch (err) {
        console.warn('drawFooter: image error', err);
      }
    }

    const nameParts = (() => {
      const n = String(appName || 'BEST VENUE OPTION');
      if (n.toUpperCase() === 'BEST VANUE OPTION') return { part1: 'BEST VANUE', part2: 'OPTION' };
      const words = n.split(' ');
      if (words.length > 1) {
        const mid = Math.ceil(words.length / 2);
        return { part1: words.slice(0, mid).join(' '), part2: words.slice(mid).join(' ') };
      }
      return { part1: n, part2: '' };
    })();

    d.setFontSize(11);
    setDocFont(d, "bold");
    d.setTextColor(77, 121, 255); 
    drawText(d, nameParts.part1, 32, 288, { isBold: true, fontSize: 11, color: '#4D79FF' });
    if (nameParts.part2) {
      const part1Width = d.getTextWidth(nameParts.part1 + ' ');
      d.setTextColor(255, 77, 77); 
      drawText(d, nameParts.part2, 32 + part1Width, 288, { isBold: true, fontSize: 11, color: '#FF4D4D' });
    }
    
    d.setFontSize(7);
    d.setTextColor(100);
    setDocFont(d, "normal");
    drawText(d, appTagline.toUpperCase(), 32, 292, { fontSize: 7 });
    
    d.setTextColor(234, 88, 12);
    d.setFontSize(9);
    setDocFont(d, "bold");
    drawText(d, "WWW.BESTVENUEOPTION.COM", 190, 288, { align: 'right', isBold: true, fontSize: 9, color: '#EA580C' });

    d.setFontSize(8);
    d.setTextColor(150);
    setDocFont(d, "normal");
    drawText(d, "Thank you for choosing Best Venue Option!", 105, 274, { align: 'center', fontSize: 8 }); 
    d.setFontSize(7);
    drawText(d, "This is a computer generated invoice and does not require a physical signature.", 105, 278, { align: 'center', fontSize: 7 });
  };

  const sanitizeName = (n: string) => {
    if (!n) return 'Service';
    let cleaned = n.trim();
    // More aggressive sanitization to remove "Level 1", "L1", "1. ", etc.
    cleaned = cleaned.replace(/^(Level|L|Item)?\s*\d+\s*[.:-]*\s*/i, '');
    // Also remove any leading digit followed by space or dot
    cleaned = cleaned.replace(/^\d+[\s.]+\s*/, '');
    return cleaned || 'Facility Service';
  };

  const addTransactionHistory = (startY: number) => {
    let localY = startY;
    if (relatedPayments.length > 0) {
      if (localY > 210) { drawFooter(doc); doc.addPage(); drawHeader(doc); localY = 45; }
      
      setDocFont(doc, "bold");
      doc.setFontSize(10);
      doc.setTextColor(234, 88, 12);
      drawText(doc, "TRANSACTION HISTORY", 20, localY, { isBold: true, fontSize: 10, color: '#EA580C' });
      localY += 6;

      const txRows = relatedPayments.map(p => {
        const dateRaw = p.paymentDate || p.createdAt;
        const justDate = format(new Date(dateRaw), 'dd/MM/yyyy');
        return [
          justDate,
          (p.paymentType || 'Payment').toUpperCase(),
          (p.paymentMode || 'N/A').toUpperCase(),
          Number(p.amount || 0).toLocaleString()
        ];
      });

      autoTable(doc, {
        startY: localY,
        head: [[
          { content: 'Date', styles: { halign: 'left' } },
          { content: 'Type', styles: { halign: 'left' } },
          { content: 'Mode', styles: { halign: 'left' } },
          { content: 'Amount', styles: { halign: 'right' } }
        ]],
        body: txRows,
        theme: 'grid',
        headStyles: { font: defaultFont, fillColor: [234, 88, 12], textColor: [255, 255, 255], fontStyle: 'bold' },
        margin: { left: 20, right: 20 },
        columnStyles: {
          0: { cellWidth: 35, halign: 'left' },
          1: { cellWidth: 45, halign: 'left' },
          2: { cellWidth: 45, halign: 'left' },
          3: { cellWidth: 45, halign: 'right' }
        },
        styles: { 
          font: defaultFont, 
          fontSize: 8, 
          lineColor: [200, 200, 200], 
          lineWidth: 0.2,
          cellPadding: 4,
          valign: 'middle'
        },
        willDrawCell: (data) => {
          if (data.section === 'body' || data.section === 'head') {
            const text = data.cell.text.join('\n');
            if (/[\u0900-\u097F]/.test(text)) {
              (data.cell as any).rawHindiText = text;
              data.cell.text = [];
            }
          }
        },
        didDrawCell: (data) => {
          const rawHindiText = (data.cell as any).rawHindiText;
          if (rawHindiText) {
            const isHeader = data.section === 'head';
            const fontSize = isHeader ? 8 : 8;
            const isBold = isHeader;
            const color = isHeader ? '#FFFFFF' : '#000000';
            const imgInfo = renderTextToImage(rawHindiText, fontSize, isBold, color, doc.internal.scaleFactor);
            if (imgInfo && imgInfo.dataUrl) {
              const { dataUrl, width, height, leftPaddingOffset } = imgInfo;
              const paddingLeft = 4;
              let x = data.cell.x + paddingLeft - leftPaddingOffset;
              if (data.column.index === 3) { // Amount is right aligned
                x = data.cell.x + data.cell.width - width - paddingLeft + leftPaddingOffset;
              }
              const y = data.cell.y + (data.cell.height - height) / 2;
              doc.addImage(dataUrl, 'PNG', x, y, width, height, undefined, 'FAST');
            }
          }
        },
        didDrawPage: (data) => {
          drawHeader(doc);
          drawFooter(doc);
        }
      });

      localY = (doc as any).lastAutoTable.finalY + 8;
    }
    return localY;
  };

  let currentY = drawHeader(doc);

  // Customer Details (Bill To)
  doc.setFontSize(10);
  doc.setTextColor(0);
  setDocFont(doc, "bold");
  drawText(doc, "BILL TO:", 20, currentY, { isBold: true, fontSize: 10 });
  
  doc.setFontSize(9);
  setDocFont(doc, "normal");
  drawText(doc, `Name: ${partyName || 'N/A'}`, 20, currentY + 6, { fontSize: 9 });
  drawText(doc, `Mobile: ${partyMobile}`, 20, currentY + 10, { fontSize: 9 });
  
  let billToY = currentY + 14;
  if (booking.partyAddress) {
    const addr = `Address: ${booking.partyAddress}`;
    const splitAddr = doc.splitTextToSize(addr, 90);
    drawText(doc, splitAddr, 20, billToY, { fontSize: 9 });
    billToY += (splitAddr.length * 4);
  }
  
  drawText(doc, `Event: ${booking.eventType || 'N/A'}`, 20, billToY, { fontSize: 9 });
  drawText(doc, `Date: ${formatDateDDMMYYYY(booking.eventDate)}${booking.endDate ? ' to ' + formatDateDDMMYYYY(booking.endDate) : ''}`, 20, billToY + 4, { fontSize: 9 });
  if (booking.startTime) {
    drawText(doc, `Timing: ${formatTime12h(booking.startTime)} - ${formatTime12h(booking.endTime)}`, 20, billToY + 8, { fontSize: 9 });
  }

  setDocFont(doc, "bold");
  drawText(doc, `Booking Status:`, 140, currentY + 6, { isBold: true, fontSize: 9 });
  setDocFont(doc, "normal");
  drawText(doc, `${getDisplayStatus()}`, 190, currentY + 6, { align: 'right', fontSize: 9 });
  
  setDocFont(doc, "bold");
  drawText(doc, `Payment Status:`, 140, currentY + 10, { isBold: true, fontSize: 9 });
  setDocFont(doc, "normal");
  drawText(doc, `${(isPaid ? 'PAID' : 'PENDING')}`, 190, currentY + 10, { align: 'right', fontSize: 9 });

  // Items Table
  const tableRows = [];
  if (baseAmount > 0) {
    const displayName = (booking.targetName || 'Booking').split('(')[0].trim();
    tableRows.push([`Base Booking Amount for ${sanitizeName(displayName)}`, `${baseAmount.toLocaleString()}`]);
  }
  if (expenditure > 0) {
    tableRows.push(['Additional Expenditure', `${Math.round(expenditure).toLocaleString()}`]);
  }
  if (booking.extra_services && booking.extra_services.length > 0) {
    booking.extra_services.forEach(s => {
      tableRows.push([sanitizeName(s.name), `${Math.round(s.amount || 0).toLocaleString()}`]);
    });
  }

  autoTable(doc, {
    startY: Math.max(currentY + 25, billToY + 12),
    head: [[
      { content: 'Description', styles: { halign: 'left' } },
      { content: 'Amount', styles: { halign: 'right' } }
    ]],
    body: tableRows,
    theme: 'grid',
    headStyles: { font: defaultFont, fillColor: [234, 88, 12], textColor: [255, 255, 255], fontStyle: 'bold' },
    margin: { left: 20, right: 20 },
    columnStyles: { 0: { cellWidth: 120, halign: 'left' }, 1: { cellWidth: 50, halign: 'right' } },
    styles: { 
      font: defaultFont, 
      fontSize: 9, 
      lineColor: [200, 200, 200], 
      lineWidth: 0.2,
      cellPadding: 4,
      valign: 'middle'
    },
    willDrawCell: (data) => {
      if (data.section === 'body' || data.section === 'head') {
        const text = data.cell.text.join('\n');
        if (/[\u0900-\u097F]/.test(text)) {
          (data.cell as any).rawHindiText = text;
          data.cell.text = [];
        }
      }
    },
    didDrawCell: (data) => {
      const rawHindiText = (data.cell as any).rawHindiText;
      if (rawHindiText) {
        const isHeader = data.section === 'head';
        const fontSize = isHeader ? 9 : 9;
        const isBold = isHeader;
        const color = isHeader ? '#FFFFFF' : '#000000';
        const imgInfo = renderTextToImage(rawHindiText, fontSize, isBold, color, doc.internal.scaleFactor);
        if (imgInfo && imgInfo.dataUrl) {
          const { dataUrl, width, height, leftPaddingOffset } = imgInfo;
          const paddingLeft = 4;
          let x = data.cell.x + paddingLeft - leftPaddingOffset;
          if (data.column.index === 1) { // Amount is right aligned
            x = data.cell.x + data.cell.width - width - paddingLeft + leftPaddingOffset;
          }
          const y = data.cell.y + (data.cell.height - height) / 2;
          doc.addImage(dataUrl, 'PNG', x, y, width, height, undefined, 'FAST');
        }
      }
    },
    didDrawPage: (data) => {
      drawHeader(doc);
      drawFooter(doc);
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(10);
  doc.setTextColor(0);
  setDocFont(doc, "bold");
  drawText(doc, "Final Booking Total:", 110, currentY, { isBold: true, fontSize: 10 });
  drawText(doc, `${Number(subTotalActual || 0).toLocaleString()}`, 190, currentY, { align: 'right', isBold: true, fontSize: 10 });
  currentY += 5;
  doc.setFontSize(9);
  setDocFont(doc, "normal");
  drawText(doc, "Total Amount Paid:", 110, currentY, { fontSize: 9 });
  drawText(doc, `${Number(totalReceived || 0).toLocaleString()}`, 190, currentY, { align: 'right', fontSize: 9 });
  currentY += 5;
  doc.setFontSize(10);
  
  const balanceColor = balanceDue > 0 ? '#DC2626' : '#16A34A';
  drawText(doc, "Balance Due:", 110, currentY, { isBold: true, fontSize: 10, color: balanceColor });
  drawText(doc, `${Number(balanceDue || 0).toLocaleString()}`, 190, currentY, { align: 'right', isBold: true, fontSize: 10, color: balanceColor });
  currentY += 10;

  const finalY = addTransactionHistory(currentY);

  doc.setFontSize(9);
  doc.setTextColor(0);
  setDocFont(doc, "italic");
  const words = `Amount in words (Balance): ${numberToWords(Math.round(balanceDue || 0))}`;
  const splitWords = doc.splitTextToSize(words, 170);
  let wordsY = finalY;
  if (wordsY > 260) { drawFooter(doc); doc.addPage(); drawHeader(doc); wordsY = 45; }
  drawText(doc, splitWords, 20, wordsY, { fontSize: 9 });
  
  drawFooter(doc);
  
  doc.save(`Invoice_${customInvoiceNo.replace(/\//g, '_')}.pdf`);
  toast.success('Professional Invoice Downloaded');
  
  return doc.output('blob');
};

// --- Custom Brand Icons for Footer ---
// (Definitions removed from here)
const RatingCardView = ({ profile, venues, services }: { profile: UserProfile | null, venues: Venue[], services: ServiceProvider[] }) => {
  const [selectedId, setSelectedId] = useState('');
  const [activeType, setActiveType] = useState<'venue' | 'service' | 'app'>(profile?.role === 'owner' ? 'venue' : 'service');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [appLogoUrl, setAppLogoUrl] = useState<string>('/logo.png');
  const [appName, setAppName] = useState<string>('BEST VENUE OPTION');
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
      
      import('qrcode').then((QRCodeModule) => {
        const QRCode = QRCodeModule.default || QRCodeModule;
        QRCode.toDataURL(url, { 
          width: 600, 
          margin: 2,
          color: {
            dark: '#ea580c', // orange-600
            light: '#ffffff'
          }
        }, (err: any, url: string) => {
          if (!err) setQrDataUrl(url);
        });
      }).catch(err => {
        console.error("Failed to load qrcode library:", err);
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
    const splitName = (name: string) => {
      if (!name) return { part1: '', part2: '' };
      const n = String(name);
      if (n.toUpperCase() === 'BEST VANUE OPTION') return { part1: 'BEST VANUE', part2: 'OPTION' };
      const words = n.split(' ');
      if (words.length > 1) {
        const mid = Math.ceil(words.length / 2);
        return { part1: words.slice(0, mid).join(' '), part2: words.slice(mid).join(' ') };
      }
      return { part1: name, part2: '' };
    };
    const nameParts = splitName(appName);

    // Logo and Name on same line
    if (appLogoUrl) {
      try {
        doc.addImage(appLogoUrl, 'PNG', pageWidth/2 - 25, startY - 6, 8, 8);
      } catch (e) {
        doc.setFillColor(77, 121, 255);
        doc.circle(pageWidth/2 - 21, startY - 2, 2, 'F');
      }
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    
    const startTextX = pageWidth/2 - 15;
    doc.setTextColor(77, 121, 255); // Blue
    doc.text(nameParts.part1, startTextX, startY);
    
    if (nameParts.part2) {
      const part1Width = doc.getTextWidth(nameParts.part1 + ' ');
      doc.setTextColor(255, 77, 77); // Red
      doc.text(nameParts.part2, startTextX + part1Width, startY);
    }

    // Tagline below
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(154, 52, 18);
    doc.text(appTagline, pageWidth / 2, startY + 8, { align: 'center' });
    
    doc.setFontSize(6);
    doc.setTextColor(77, 121, 255);
    doc.text("www.bestvenueoption.com", pageWidth / 2, startY + 12, { align: 'center' });
    
    doc.save(`Review_Card_${name}.pdf`);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rating Accept Card</h2>
          <p className="text-gray-500 text-sm mt-1">Download your custom QR card for customers to rate your business</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
           <button 
             onClick={() => { setActiveType('venue'); setSelectedId(''); }}
             className={cn("px-4 py-2 rounded-lg font-bold text-xs transition-all", activeType === 'venue' ? "bg-orange-600 text-white shadow-md" : "text-gray-500 hover:bg-gray-200")}
           >
             Venue
           </button>
           <button 
             onClick={() => { setActiveType('service'); setSelectedId(''); }}
             className={cn("px-4 py-2 rounded-lg font-bold text-xs transition-all", activeType === 'service' ? "bg-orange-600 text-white shadow-md" : "text-gray-500 hover:bg-gray-200")}
           >
             Service
           </button>
           <button 
             onClick={() => { setActiveType('app'); setSelectedId('app-rating'); }}
             className={cn("px-4 py-2 rounded-lg font-bold text-xs transition-all", activeType === 'app' ? "bg-orange-600 text-white shadow-md" : "text-gray-500 hover:bg-gray-200")}
           >
             App Rating
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Select Business to Generate For</label>
            {activeType !== 'app' ? (
              <select 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none font-bold text-gray-900 shadow-sm"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
              >
                {items.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
                {items.length === 0 && <option value="">No items found</option>}
              </select>
            ) : (
              <div className="w-full px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl font-bold text-orange-600 shadow-inner">
                Official {appName} Rating Card
              </div>
            )}
          </div>

          <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 italic text-sm text-orange-700">
            {activeType === 'app' 
              ? "Scanning this QR code will directly take your customers to the App Rating & Review page."
              : `Scanning this QR code will directly take your customers to your ${activeType === 'venue' ? 'Venue' : 'Service'} page where they can leave ratings and reviews.`
            }
          </div>

          <button 
            onClick={downloadCard}
            disabled={!selectedId}
            className="w-full py-4 bg-orange-600 text-white rounded-2xl font-bold hover:bg-orange-700 transition-all shadow-xl shadow-orange-100 flex items-center justify-center space-x-2"
          >
            <Download size={20} />
            <span>Download PDF Card</span>
          </button>
        </div>

        <div className="flex flex-col items-center">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Card Preview</label>
          <div className="relative w-[300px] aspect-[1/1.414] bg-orange-50 rounded-2xl border-4 border-orange-600 p-6 flex flex-col items-center justify-between text-center shadow-2xl overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
             <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-200/20 rounded-full -ml-16 -mb-16 blur-3xl"></div>

             <div className="space-y-1 w-full">
               <p className="font-black text-gray-900 uppercase tracking-tight truncate w-full text-xl">
                 {selectedItem?.name || "Business Name"}
               </p>
               <p className="text-[10px] font-bold text-gray-500 uppercase px-4 truncate">
                  {(() => { const i = selectedItem as any; return i?.address || (selectedItem ? [i?.block, i?.district, i?.state].filter(Boolean).join(", ") : ""); })() || "Address Placeholder"}
               </p>
             </div>

             <div className="my-4">
               <h2 className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-2">Scan to Rate Us</h2>
               {qrDataUrl ? (
                 <div className="p-4 bg-white rounded-2xl border-2 border-orange-100 shadow-inner">
                   <img src={qrDataUrl} className="w-32 h-32" alt="QR Code Preview" />
                 </div>
               ) : (
                 <div className="w-32 h-32 bg-gray-100 rounded-2xl flex items-center justify-center animate-pulse">
                   <QrCode size={48} className="text-gray-300" />
                 </div>
               )}
             </div>

             <div className="border-t-2 border-orange-200 pt-3 w-full flex flex-col items-center">
               <div className="flex items-center gap-2 mb-1">
                 <div className="shadow-sm rounded-full overflow-hidden">
                   <AppLogo size="xs" showText={false} />
                 </div>
                 <h1 className="text-xl font-black tracking-tighter leading-none flex gap-1">
                   {(() => {
                     const name = appName || 'BEST VENUE OPTION';
                     if (name === 'BEST VENUE OPTION') {
                       return (
                         <>
                           <span className="text-[#4d79ff]">BEST VENUE</span>
                           <span className="text-[#ff4d4d]">OPTION</span>
                         </>
                       );
                     }
                     const words = name.split(' ');
                     if (words.length > 1) {
                       const mid = Math.ceil(words.length / 2);
                       return (
                         <>
                           <span className="text-[#4d79ff]">{words.slice(0, mid).join(' ')}</span>
                           <span className="text-[#ff4d4d]">{words.slice(mid).join(' ')}</span>
                         </>
                       );
                     }
                     return <span className="text-[#4d79ff]">{name}</span>;
                   })()}
                 </h1>
               </div>
               <p className="text-[7px] uppercase tracking-widest font-black text-orange-800">{appTagline}</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardView = ({ 
  user, 
  profile, 
  onUpdateProfile, 
  globalSettings,
  activeSubscription,
  onUpgradeNeeded
}: { 
  user: any, 
  profile: UserProfile | null, 
  onUpdateProfile: (p: UserProfile) => void, 
  globalSettings: any,
  activeSubscription: UserSubscription | null,
  onUpgradeNeeded: () => void
}) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialTab = searchParams.get('tab') || 'overview';
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
  const [downloadingReportInvoiceId, setDownloadingReportInvoiceId] = useState<string | null>(null);

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
      const XLSX = await import('xlsx');
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");
      XLSX.writeFile(workbook, `Booking_Report_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);
    } else {
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;
      const doc = new jsPDF('l', 'mm', 'a4'); // Landscape
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

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [services, setServices] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubscriptionReminder, setShowSubscriptionReminder] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!profile || profile.role === 'user' || profile.role === 'admin') return;
      
      // FIX: Check if subscription requirement is globally enabled
      if (!globalSettings || !globalSettings.subscriptionEnabled) {
        setShowSubscriptionReminder(false);
        setIsSubscriptionModalOpen(false);
        return;
      }
      
      // If admin, bypass
      if (user?.email === 'deepakjatav1005@gmail.com') return;
      
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
          // Weekly reminder logic: check if we already reminded this week
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
      setActiveTab(tab as any);
    }
  }, [searchParams]);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTabChange = async (tab: string) => {
    if (tab === 'logout') {
      await db.auth.signOut();
      navigate('/');
      return;
    }
    setActiveTab(tab as any);
    setSearchParams({ tab });
    setIsMobileMenuOpen(false);
  };

  const fetchDashboardData = useCallback(async () => {
    if (!user?.uid) return;
    try {
      let bData: any[] = [];
      let pData: any[] = [];

      // Fetch bookings and payments separately because the MySQL proxy doesn't support nested joins
      if (profile?.role === 'admin') {
        const { data: bookings } = await db.from('bookings').select('*').order('created_at', { ascending: false });
        const { data: payments } = await db.from('booking_payments').select('*');
        bData = bookings || [];
        pData = payments || [];
      } else {
        const { data: cb } = await db.from('bookings').select('*').eq('user_id', user?.uid);
        const { data: pb } = await db.from('bookings').select('*').eq('owner_id', user?.uid);
        const combined = [...(cb || []), ...(pb || [])];
        bData = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
        
        if (bData.length > 0) {
          const bookingIds = bData.map(b => b.id);
          // Fetch payments for these bookings
          const { data: payments } = await db.from('booking_payments').select('*').in('booking_id', bookingIds);
          pData = payments || [];
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
            isAmountUpdated: !!d.is_amount_updated,
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

      const sQuery = db.from('service_providers').select('*');
      if (profile?.role !== 'admin') {
        // Handle both provider_id and owner_id for service_providers
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
        const { data: sData } = await sQuery;
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

    const venueChannel = db
      .channel(`dashboard_venues_${user?.uid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'venues' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    const serviceChannel = db
      .channel(`dashboard_services_${user?.uid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_providers' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    const paymentChannel = db
      .channel(`dashboard_payments_${user?.uid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'booking_payments' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      db.removeChannel(bookingChannel);
      db.removeChannel(venueChannel);
      db.removeChannel(serviceChannel);
      db.removeChannel(paymentChannel);
    };
  }, [user?.uid, profile?.role]);

  if (!user) return <Navigate to="/login" />;

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <BarChart2 size={20} />, roles: ['owner', 'provider', 'user'] },
    { id: 'profile', label: 'Profile Manage', icon: <UserIcon size={20} />, roles: ['owner', 'provider', 'user'] },
    { id: 'venues', label: 'Venue Manage', icon: <Home size={20} />, roles: ['owner'] },
    { id: 'services', label: 'Services Manage', icon: <Music size={20} />, roles: ['provider'] },
    { id: 'catalogue', label: 'Catalogue Manage', icon: <ImageIcon size={20} />, roles: ['owner', 'provider'] },
    { id: 'manually-booking', label: 'Manually Booking', icon: <Plus size={20} />, roles: ['owner', 'provider'] },
    { id: 'public-booking', label: profile?.role === 'user' ? 'My Bookings' : 'Public Booking', icon: <Calendar size={20} />, roles: ['owner', 'provider', 'user'] },
    { id: 'manage-payment', label: 'Manage Payment', icon: <IndianRupee size={20} />, roles: ['owner', 'provider'] },
    { id: 'rating-card', label: 'Rating Accept Card', icon: <QrCode size={20} />, roles: ['owner', 'provider'] },
    { id: 'reports', label: 'Reports', icon: <FileText size={20} />, roles: ['owner', 'provider'] },
    { id: 'subscription', label: 'Subscription', icon: <CreditCard size={20} />, roles: ['owner', 'provider'] },
    { id: 'query-complaint', label: 'Query or Complaint', icon: <MessageSquare size={20} />, roles: ['owner', 'provider', 'user'] },
    { id: 'logout', label: 'Logout', icon: <LogOut size={20} />, roles: ['owner', 'provider', 'user'] },
    { id: 'reset-password', label: 'Reset password', icon: <ShieldCheck size={20} />, roles: ['owner', 'provider', 'user'] },
  ];

  const filteredMenu = menuItems.filter(item => {
    if (profile?.role === 'admin') {
      return true; // Admins can see everything
    }
    return !item.roles || item.roles.includes(profile?.role || '');
  });

  const stats = useMemo(() => {
    const isPaidFunc = (b: Booking) => {
      const base = Number(b.updatedAmount) || Number(b.totalAmount) || 0;
      const paymentsTotal = (b.payments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      return (paymentsTotal >= (base - 0.1) && base > 0) || (b.status || '').toLowerCase() === 'paid' || (b.status || '').toLowerCase() === 'completed' || b.paymentStatus === 'Paid';
    };

    const countCompleted = bookings.filter(b => isPaidFunc(b)).length;

    return {
      total: bookings.length || 0,
      pending: bookings.filter(b => !b.isManual && b.status === 'pending').length || 0,
      approved: bookings.filter(b => (b.isManual || b.status === 'confirmed' || b.status === 'approved') && !isPaidFunc(b)).length || 0,
      completed: countCompleted
    };
  }, [bookings]);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayBookings = useMemo(() => 
    bookings.filter(b => b.eventDate === todayStr && b.status !== 'cancelled'),
    [bookings, todayStr]
  );

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
                <span>{t('Dashboard Menu')}</span>
              </div>
              <ChevronDown className={cn("transition-transform", isMobileMenuOpen && "rotate-180")} />
            </button>
          </div>

          <div className="lg:hidden mb-6 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex space-x-2 min-w-max">
              {filteredMenu.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    handleTabChange(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    "px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all",
                    activeTab === item.id 
                      ? "bg-orange-600 text-white shadow-md" 
                      : "bg-white text-gray-500 border border-gray-100"
                  )}
                >
                  <div className="flex items-center space-x-2">
                    {item.icon}
                    <span>{t(item.label)}</span>
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
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={cn(
                  "bg-white rounded-3xl shadow-xl border border-orange-100 overflow-hidden sticky top-24 lg:block",
                  !isDesktop && !isMobileMenuOpen && "hidden"
                )}
              >
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 bg-orange-600 text-white"
                >
                  <h2 className="font-bold text-lg">{t('Dashboard')}</h2>
                  <p className="text-xs opacity-80">{t('Welcome')}, {profile?.displayName}</p>
                </motion.div>
                <motion.nav 
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.05
                      }
                    }
                  }}
                  className="p-4 space-y-2 max-h-[60vh] overflow-y-auto lg:max-h-none"
                >
                  {filteredMenu.map(item => (
                    <motion.button
                      key={item.id}
                      variants={{
                        hidden: { opacity: 0, x: -20 },
                        visible: { opacity: 1, x: 0 }
                      }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleTabChange(item.id)}
                      className={cn(
                        "w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold transition-all",
                        activeTab === item.id 
                          ? "bg-orange-50 text-orange-600 shadow-sm" 
                          : "text-gray-500 hover:bg-gray-50"
                      )}
                    >
                      {item.icon}
                      <span>{t(item.label)}</span>
                    </motion.button>
                  ))}
                </motion.nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {/* Subscription Reminder */}
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
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                    <span className="bg-orange-100 text-orange-600 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
                      {profile?.role}
                    </span>
                  </div>

                  {/* Today's Booking Alert */}
                  {todayBookings.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center animate-pulse">
                          <Clock size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-orange-900 text-lg">Today's Bookings Alert</h3>
                          <p className="text-orange-700 text-sm">
                            You have <span className="font-black underline">{todayBookings.length}</span> booking(s) scheduled for today.
                          </p>
                        </div>
                      </div>
                      <div className="flex -space-x-2">
                        {todayBookings.slice(0, 3).map((b, i) => (
                          <div key={b.id} className="w-10 h-10 rounded-full border-2 border-white bg-orange-200 flex items-center justify-center text-[10px] font-bold text-orange-700 shadow-sm overflow-hidden">
                            {b.partyName?.charAt(0) || b.visitorName?.charAt(0) || '?'}
                          </div>
                        ))}
                        {todayBookings.length > 3 && (
                          <div className="w-10 h-10 rounded-full border-2 border-white bg-orange-600 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                            +{todayBookings.length - 3}
                          </div>
                        )}
                        <button 
                          onClick={() => handleTabChange('public-booking')}
                          className="ml-4 bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-orange-700 transition shadow-lg"
                        >
                          View All
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Profile Card */}
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                      <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white/20 shadow-xl">
                        {profile?.photoURL ? (
                          <img 
                            src={resolveUrl(profile.photoURL)} 
                            alt={profile.displayName} 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full bg-white/20 flex items-center justify-center text-4xl font-bold">
                            {profile?.displayName?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="text-center md:text-left">
                        <h3 className="text-3xl font-black mb-2">{profile?.displayName}</h3>
                        <p className="text-orange-100 font-medium mb-4 flex items-center justify-center md:justify-start">
                          <MapPin size={16} className="mr-2" />
                          {profile?.district || profile?.block || 'Location not set'}, {profile?.state}
                        </p>
                        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                          <span className="bg-white/20 px-4 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                            ID: {profile?.registrationId}
                          </span>
                          <span className="bg-white/20 px-4 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                            {profile?.mobileNumber}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                        <Calendar size={24} />
                      </div>
                      <div className="text-3xl font-black text-gray-900 mb-1">{stats.total}</div>
                      <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total</div>
                    </div>
                    <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center mb-4">
                        <Clock size={24} />
                      </div>
                      <div className="text-3xl font-black text-gray-900 mb-1">{stats.pending}</div>
                      <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Pending</div>
                    </div>
                    <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4">
                        <CheckCircle size={24} />
                      </div>
                      <div className="text-3xl font-black text-gray-900 mb-1">{stats.approved}</div>
                      <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Approved</div>
                    </div>
                    <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                        <IndianRupee size={24} />
                      </div>
                      <div className="text-3xl font-black text-gray-900 mb-1">{stats.completed}</div>
                      <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Complete</div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'profile' && (
                <ProfileEditView user={user} profile={profile} onUpdate={onUpdateProfile} />
              )}
              {activeTab === 'venues' && (
                <VenueManageView user={user} venues={venues} />
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
                <ServicesManageView user={user} services={services} />
              )}
              {activeTab === 'catalogue' && (
                <CatalogueManageView 
                  user={user}
                  venues={venues} 
                  services={services} 
                  globalSettings={globalSettings}
                  activeSubscription={activeSubscription}
                  onUpgrade={onUpgradeNeeded}
                />
              )}
              {activeTab === 'reports' && (
                <div className="space-y-8">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900">Booking Reports</h3>
                      <div className="flex space-x-4">
                        <button onClick={() => downloadReport('excel')} className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-green-700 transition-colors">
                          <Download size={18} />
                          <span>Excel</span>
                        </button>
                        <button onClick={() => downloadReport('pdf')} className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-red-700 transition-colors">
                          <Download size={18} />
                          <span>PDF</span>
                        </button>
                      </div>
                    </div>

                    {/* Aggregate Stats Section */}
                    {(() => {
                      const filteredForReport = bookings.filter(b => {
                        if (reportFilters.year && !b.eventDate.startsWith(reportFilters.year)) return false;
                        if (reportFilters.name && !((b.visitorName || '').toLowerCase().includes(reportFilters.name.toLowerCase()) || (b.partyName || '').toLowerCase().includes(reportFilters.name.toLowerCase()))) return false;
                        if (reportFilters.mobile && !(b.visitorMobile || '').includes(reportFilters.mobile)) return false;
                        if (reportFilters.startDate && b.eventDate < reportFilters.startDate) return false;
                        if (reportFilters.endDate && b.eventDate > reportFilters.endDate) return false;
                        if (reportFilters.paymentMode && b.paymentMode !== reportFilters.paymentMode) return false;
                        if (reportFilters.bookingType === 'Order' && b.isManual) return false;
                        if (reportFilters.bookingType === 'Manual' && !b.isManual) return false;
                        return true;
                      });

                      const years = Array.from(new Set(bookings.map(b => b.eventDate.split('-')[0]))).sort((a,b) => b.localeCompare(a));
                      
                      const aggregates = filteredForReport.reduce((acc, b) => {
                        const total = Math.floor(Number(b.updatedAmount) || Number(b.totalAmount) || 0);
                        const totalReceived = Math.floor((b.payments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0));
                        const discountOnly = Math.floor((b.payments || []).filter(p => p.paymentType === 'Discount').reduce((sum, p) => sum + (Number(p.amount) || 0), 0));
                        const cashPaid = Math.max(0, totalReceived - discountOnly);
                        
                        const pending = Math.max(0, total - totalReceived);
                        const isPaid = (pending <= 0 && total > 0) || (b.status || '').toLowerCase() === 'paid' || (b.status || '').toLowerCase() === 'completed' || b.paymentStatus === 'Paid';
                        
                        return {
                          total: (Number(acc.total) || 0) + total,
                          paid: (Number(acc.paid) || 0) + cashPaid,
                          discount: (Number(acc.discount) || 0) + discountOnly,
                          pending: (Number(acc.pending) || 0) + pending,
                          count: (Number(acc.count) || 0) + 1,
                          completeCount: (Number(acc.completeCount) || 0) + (isPaid ? 1 : 0)
                        };
                      }, { total: 0, paid: 0, discount: 0, pending: 0, count: 0, completeCount: 0 });

                      return (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                          <div className="bg-blue-50/70 p-5 rounded-3xl border border-blue-100 flex flex-col items-center shadow-sm">
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1 text-center">Total Bookings ({aggregates.count})</span>
                            <span className="text-xl font-black text-blue-900">₹{(aggregates.total || 0).toLocaleString()}</span>
                          </div>
                          <div className="bg-green-50/70 p-5 rounded-3xl border border-green-100 flex flex-col items-center shadow-sm">
                            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Total Received</span>
                            <span className="text-xl font-black text-green-900">₹{(aggregates.paid || 0).toLocaleString()}</span>
                          </div>
                          <div className="bg-purple-50/70 p-5 rounded-3xl border border-purple-100 flex flex-col items-center shadow-sm">
                            <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1">Total Discount</span>
                            <span className="text-xl font-black text-purple-900">₹{(aggregates.discount || 0).toLocaleString()}</span>
                          </div>
                          <div className="bg-red-50/70 p-5 rounded-3xl border border-red-100 flex flex-col items-center shadow-sm">
                            <span className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Total Pending</span>
                            <span className="text-xl font-black text-red-900">₹{(aggregates.pending || 0).toLocaleString()}</span>
                          </div>
                          <div className="bg-indigo-50/70 p-5 rounded-3xl border border-indigo-100 flex flex-col items-center shadow-sm">
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Complete Count</span>
                            <span className="text-xl font-black text-indigo-900">{aggregates.completeCount || 0}</span>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Year</label>
                        <select 
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold"
                          value={reportFilters.year}
                          onChange={(e) => setReportFilters({...reportFilters, year: e.target.value})}
                        >
                          <option value="">All Years</option>
                          {Array.from(new Set(bookings.map(b => b.eventDate.split('-')[0]))).sort((a,b) => b.localeCompare(a)).map(y => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                      <div className="lg:col-span-1">
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Search Name</label>
                        <input 
                          type="text" 
                          placeholder="Customer name..."
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                          value={reportFilters.name}
                          onChange={(e) => setReportFilters({...reportFilters, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Mobile</label>
                        <input 
                          type="text" 
                          placeholder="Mobile number..."
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                          value={reportFilters.mobile}
                          onChange={(e) => setReportFilters({...reportFilters, mobile: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Start Date</label>
                        <input 
                          type="date" 
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                          value={reportFilters.startDate}
                          onChange={(e) => setReportFilters({...reportFilters, startDate: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">End Date</label>
                        <input 
                          type="date" 
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                          value={reportFilters.endDate}
                          onChange={(e) => setReportFilters({...reportFilters, endDate: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Payment Mode</label>
                        <select 
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                          value={reportFilters.paymentMode}
                          onChange={(e) => setReportFilters({...reportFilters, paymentMode: e.target.value})}
                        >
                          <option value="">All Modes</option>
                          <option value="Cash">Cash</option>
                          <option value="Online">Online</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Booking Type</label>
                        <select 
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                          value={reportFilters.bookingType}
                          onChange={(e) => setReportFilters({...reportFilters, bookingType: e.target.value})}
                        >
                          <option value="">All Types</option>
                          <option value="Order">Order</option>
                          <option value="Manual">Manual</option>
                        </select>
                      </div>
                    </div>

                    <div className="overflow-x-auto pb-4">
                      <div className="min-w-[1200px]">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-gray-100 pb-4">
                              <th className="py-4 font-bold text-gray-400 text-sm uppercase tracking-wider">S.No</th>
                              <th className="py-4 font-bold text-gray-400 text-sm uppercase tracking-wider">Status</th>
                              <th className="py-4 font-bold text-gray-400 text-sm uppercase tracking-wider">Customer</th>
                              <th className="py-4 font-bold text-gray-400 text-sm uppercase tracking-wider">Mobile</th>
                              <th className="py-4 font-bold text-gray-400 text-sm uppercase tracking-wider">Address</th>
                              <th className="py-4 font-bold text-gray-400 text-sm uppercase tracking-wider">Date & Time</th>
                              <th className="py-4 font-bold text-gray-400 text-sm uppercase tracking-wider">Invoice No</th>
                              <th className="py-4 font-bold text-gray-400 text-sm uppercase tracking-wider">Total</th>
                              <th className="py-4 font-bold text-gray-400 text-sm uppercase tracking-wider text-orange-600">Paid Amount</th>
                              <th className="py-4 font-bold text-gray-400 text-sm uppercase tracking-wider text-green-600">Discount</th>
                              <th className="py-4 font-bold text-gray-400 text-sm uppercase tracking-wider text-blue-600">Pending Amount</th>
                              <th className="py-4 font-bold text-gray-400 text-sm uppercase tracking-wider">Type</th>
                              <th className="py-4 font-bold text-gray-400 text-sm uppercase tracking-wider">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {bookings.filter(b => {
                              const matchesName = (b.visitorName?.toLowerCase() || '').includes(reportFilters.name.toLowerCase()) || (b.partyName?.toLowerCase() || '').includes(reportFilters.name.toLowerCase());
                              const matchesMobile = (b.visitorMobile || '').includes(reportFilters.mobile);
                              const matchesMode = !reportFilters.paymentMode || b.paymentMode === reportFilters.paymentMode;
                              const matchesType = !reportFilters.bookingType || (reportFilters.bookingType === 'Manual' ? b.isManual : !b.isManual);
                              const bDate = new Date(b.eventDate);
                              const matchesStart = !reportFilters.startDate || bDate >= new Date(reportFilters.startDate);
                              const matchesEnd = !reportFilters.endDate || bDate <= new Date(reportFilters.endDate);
                              const matchesYear = !reportFilters.year || b.eventDate.startsWith(reportFilters.year);
                              return matchesName && matchesMobile && matchesMode && matchesStart && matchesEnd && matchesType && matchesYear;
                            }).map((b, index) => {
                             const subTotal = Math.floor(Number(b.updatedAmount) || Number(b.totalAmount) || 0);
                              const totalReceived = Math.floor((b.payments || []).reduce((acc, p) => acc + (Number(p.amount) || 0), 0));
                              const discountTotal = Math.floor((b.payments || []).filter(p => p.paymentType === 'Discount').reduce((acc, p) => acc + (Number(p.amount) || 0), 0));
                              const cashPaidTotal = Math.max(0, totalReceived - discountTotal);
                              const pending = Math.max(0, subTotal - totalReceived);
                              const isPaid = (pending <= 0 && subTotal > 0) || (b.status || '').toLowerCase() === 'paid' || (b.status || '').toLowerCase() === 'completed' || b.paymentStatus === 'Paid';
                              
                              return (
                                <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                                  <td className="py-4 text-sm text-gray-500">{index + 1}</td>
                                  <td className="py-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                      isPaid ? 'bg-green-100 text-green-600' : 
                                      b.status === 'confirmed' || b.status === 'approved' ? 'bg-blue-100 text-blue-600' : 
                                      b.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'
                                    }`}>
                                      {isPaid ? 'Completed' : (b.status || 'PENDING').toUpperCase()}
                                    </span>
                                  </td>
                                  <td className="py-4 font-bold text-gray-900">{b.partyName || b.visitorName || 'N/A'}</td>
                                  <td className="py-4 text-sm text-gray-600">{b.visitorMobile || 'N/A'}</td>
                                  <td className="py-4 text-xs text-gray-500 max-w-[150px] truncate">{b.partyAddress || 'N/A'}</td>
                                  <td className="py-4 text-sm text-gray-600">
                                    {formatDateDDMMYYYY(b.eventDate)} {b.startTime ? formatTime12h(b.startTime) : ''}
                                  </td>
                                  <td className="py-4 text-xs font-mono text-gray-500">
                                    {(b.transaction_id || ('INV-' + (b.id || '').substring(0, 8))).toUpperCase()}
                                  </td>
                                  <td className="py-4 font-bold text-gray-900">₹{(subTotal || 0).toLocaleString()}</td>
                                  <td className="py-4 font-bold text-orange-600">₹{(cashPaidTotal || 0).toLocaleString()}</td>
                                  <td className="py-4 font-bold text-green-600">₹{(discountTotal || 0).toLocaleString()}</td>
                                  <td className="py-4 font-black text-blue-600">₹{(pending || 0).toLocaleString()}</td>
                                  <td className="py-4 text-xs font-bold text-gray-500 uppercase">{b.isManual ? 'Manual' : 'Order'}</td>
                                  <td className="py-4">
                                    <button 
                                      disabled={downloadingReportInvoiceId === b.id}
                                      onClick={async () => {
                                        try {
                                          setDownloadingReportInvoiceId(b.id);
                                          await generateInvoice(b, 0, profile, bookings, globalSettings);









                                          
                                          // Mark as generated
                                          db.from('bookings').update({ is_invoice_generated: true }).eq('id', b.id).then(() => {
                                             fetchDashboardData();
                                          });
                                        } catch (err) {
                                          console.error('Download error:', err);
                                          toast.error('Failed to generate invoice');
                                        } finally {
                                          setDownloadingReportInvoiceId(null);
                                        }
                                      }}
                                      className={cn(
                                        "p-2 text-orange-600 hover:bg-orange-100 rounded-xl transition-all",
                                        downloadingReportInvoiceId === b.id && "opacity-50 cursor-not-allowed"
                                      )}
                                      title="Download PDF Invoice"
                                    >
                                      {downloadingReportInvoiceId === b.id ? (
                                        <Loader size={18} className="animate-spin" />
                                      ) : (
                                        <Download size={18} />
                                      )}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'subscription' && (
                <SubscriptionManageView user={user} profile={profile} />
              )}
              {activeTab === 'rating-card' && (
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm min-h-[500px]">
                  <RatingCardView profile={profile} venues={venues} services={services} />
                </div>
              )}
              {activeTab === 'query-complaint' && (
                <React.Suspense fallback={
                  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mb-4"></div>
                    <span className="text-sm font-bold text-gray-500">Loading Query & Complaint Portal...</span>
                  </div>
                }>
                  <QueryComplaintView user={user} profile={profile} />
                </React.Suspense>
              )}
              {activeTab === 'reset-password' && (
                <div className="bg-white rounded-3xl p-3 md:p-8 border border-orange-100 shadow-sm min-h-[500px]">
                  <ChangePasswordView user={user} profile={profile} onUpdateProfile={onUpdateProfile} />
                </div>
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

const VenueManageView = ({ user, venues }: { user: any, venues: Venue[] }) => {
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await db.from('venues').delete().eq('id', id);
      if (error) throw error;
      toast.success('Venue deleted');
      setDeletingId(null);
    } catch (err) {
      toast.error('Failed to delete venue');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Manage Venues</h2>
        <button 
          onClick={() => navigate('/add-venue')}
          className="bg-orange-600 text-white px-6 py-2 rounded-xl font-bold flex items-center space-x-2 hover:bg-orange-700"
        >
          <Plus size={18} />
          <span>Add Venue</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {venues.map(v => (
          <div key={v.id} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">{v.name}</h3>
              <p className="text-sm text-gray-500">{v.address}, {v.district}, {v.state}</p>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => navigate(`/edit-venue/${v.id}`)} className="p-2 bg-white text-blue-600 rounded-lg shadow-sm hover:bg-blue-50">
                <Edit2 size={18} />
              </button>
              {deletingId === v.id ? (
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleDelete(v.id)}
                    className="bg-red-600 text-white text-xs px-2 py-1 rounded font-bold"
                  >
                    Confirm
                  </button>
                  <button 
                    onClick={() => setDeletingId(null)}
                    className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded font-bold"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setDeletingId(v.id)} 
                  className="p-2 bg-white text-red-600 rounded-lg shadow-sm hover:bg-red-50"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
        {venues.length === 0 && <p className="text-gray-500 col-span-2 text-center py-10">No venues added yet.</p>}
      </div>
    </div>
  );
};

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
    if (isLocked && globalSettings?.subscriptionEnabled && (!activeSubscription || activeSubscription.status !== 'active')) {
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
                  {globalSettings?.subscriptionEnabled && (!activeSubscription || activeSubscription.status !== 'active') 
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
                    if (globalSettings?.subscriptionEnabled && (!activeSubscription || activeSubscription.status !== 'active')) {
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

const ManagePaymentView = ({ 
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
  globalSettings: any,
  activeSubscription?: UserSubscription | null,
  onUpgrade?: () => void
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [isAmountModalOpen, setIsAmountModalOpen] = useState(false);
  const [isPaymentRecordModalOpen, setIsPaymentRecordModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [newAmount, setNewAmount] = useState(0);
  const [editableExtraServices, setEditableExtraServices] = useState<any[]>([]);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const filteredBookings = useMemo(() => bookings.filter(b => {
    // Show confirmed/paid bookings that are not completed
    if (b.status === 'cancelled' || b.status === 'completed') return false;
    
    // Only show if user is owner/admin or it belongs to them
    if (profile?.role !== 'admin' && b.ownerId !== user?.uid) return false;

    // For manual bookings, show only when locked by the user
    if (b.isManual && !b.isLocked) return false;

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
      is_invoice_generated: false,
      is_amount_updated: true
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
    if (isLocked && globalSettings?.subscriptionEnabled && (!activeSubscription || activeSubscription.status !== 'active')) {
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
                <span className="bg-blue-50 text-blue-800 text-[10px] md:text-xs px-2.5 py-1 rounded-lg font-bold border border-blue-100 shadow-sm flex items-center">
                  Customer: {b.isManual ? b.partyName : (b.visitorName || b.partyName || 'N/A')}
                </span>
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
                onClick={() => {
                  if (pendingAmount < 1) return;
                  if (!b.isLocked) {
                    toast.error('Please lock this booking transaction first before adding payments');
                    return;
                  }
                  if (!b.isAmountUpdated) {
                    toast.error('Please update/confirm the booking amount under Manage Payment first before adding a payment transaction.');
                    return;
                  }
                  setSelectedBooking(b);
                  setIsPaymentRecordModalOpen(true);
                }}
                className={cn(
                  "flex-1 md:flex-none justify-center px-4 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center space-x-2 transition-all shadow-lg",
                  pendingAmount < 1 
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed shadow-none" 
                    : (!b.isLocked || !b.isAmountUpdated)
                      ? "bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 shadow-none"
                      : "bg-green-600 text-white hover:bg-green-700 shadow-green-100"
                )}
              >
                {pendingAmount < 1 ? <CheckCircle size={16} /> : (!b.isLocked || !b.isAmountUpdated) ? <Lock size={16} /> : <Plus size={16} />}
                <span>{pendingAmount < 1 ? 'Fully Paid' : !b.isLocked ? 'Lock to Pay' : !b.isAmountUpdated ? 'Update Amount First' : 'Add Payment'}</span>
              </button>
              <button 
                disabled={isDownloading === b.id}
                onClick={async () => {
                  try {
                    setIsDownloading(b.id);
                    await generateInvoice(b, 0, profile, bookings, globalSettings);









                  } catch (err) {
                    toast.error('Failed to generate invoice');
                  } finally {
                    setIsDownloading(null);
                  }
                }}
                className={cn(
                  "flex-1 md:flex-none justify-center px-4 py-2 bg-purple-600 text-white rounded-xl text-xs md:text-sm font-bold flex items-center space-x-2 hover:bg-purple-700 shadow-lg shadow-purple-100 transition-all",
                  isDownloading === b.id && "opacity-70 cursor-not-allowed bg-purple-500"
                )}
              >
                {isDownloading === b.id ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                <span>{isDownloading === b.id ? 'Downloading...' : 'Invoice'}</span>
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

const ServicesManageView = ({ user, services }: { user: any, services: ServiceProvider[] }) => {
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await db.from('service_providers').delete().eq('id', id);
      if (error) throw error;
      toast.success('Service deleted');
      setDeletingId(null);
    } catch (err) {
      toast.error('Failed to delete service');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Manage Services</h2>
        <button 
          onClick={() => navigate('/add-service')}
          className="bg-orange-600 text-white px-6 py-2 rounded-xl font-bold flex items-center space-x-2 hover:bg-orange-700"
        >
          <Plus size={18} />
          <span>Add Service</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map(s => (
          <div key={s.id} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">{s.name}</h3>
              <p className="text-sm text-gray-500">{s.serviceType} • {s.district}, {s.state}</p>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => navigate(`/edit-service/${s.id}`)} className="p-2 bg-white text-blue-600 rounded-lg shadow-sm hover:bg-blue-50">
                <Edit2 size={18} />
              </button>
              {deletingId === s.id ? (
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleDelete(s.id)}
                    className="bg-red-600 text-white text-xs px-2 py-1 rounded font-bold"
                  >
                    Confirm
                  </button>
                  <button 
                    onClick={() => setDeletingId(null)}
                    className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded font-bold"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setDeletingId(s.id)} 
                  className="p-2 bg-white text-red-600 rounded-lg shadow-sm hover:bg-red-50"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
        {services.length === 0 && <p className="text-gray-500 col-span-2 text-center py-10">No services added yet.</p>}
      </div>
    </div>
  );
};

const SubscriptionManageView = ({ user, profile }: { user: any, profile: UserProfile | null }) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSub, setCurrentSub] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [appLogoUrl, setAppLogoUrl] = useState('/logo.png');

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (!user || !profile) return;
      setLoading(true);
      try {
        // Fetch App Logo
        const { data: logoData } = await db.from('admin_settings').select('value').eq('key', 'app_logo_url').maybeSingle();
        if (logoData?.value) setAppLogoUrl(logoData.value);

        const { data: pData } = await db.from('subscription_plans').select('*').eq('role', profile.role).eq('is_active', true);
        if (pData) {
          setPlans(pData.map(d => ({ 
            id: d.id, 
            name: d.name, 
            price: d.price, 
            duration: d.duration, 
            role: d.role, 
            isActive: d.is_active, 
            benefits: d.benefits || [],
            createdAt: d.created_at 
          } as SubscriptionPlan)));
        }

        const { data: sData } = await db.from('user_subscriptions').select('*').eq('user_id', user?.uid).eq('status', 'active').order('end_date', { ascending: false }).limit(1);
        if (sData && sData.length > 0) {
          const d = sData[0];
          setCurrentSub({ id: d.id, userId: d.user_id, planId: d.plan_id, startDate: d.start_date, endDate: d.end_date, status: d.status, amount: d.amount, createdAt: d.created_at });
        }
      } catch (err) {
        console.error('Subscription data error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscriptionData();
  }, [user, profile]);

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!user || !profile) return;
    
    try {
      // 1. Create order on server
      const response = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: plan.price,
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
          notes: {
            userId: user?.uid,
            planId: plan.id,
            planName: plan.name
          }
        })
      });
      
      if (!response.ok) throw new Error('Failed to create order');
      const order = await response.json();
      
      // 2. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "BEST VENUE OPTION",
        description: `Subscription for ${plan.name}`,
        image: resolveUrl(appLogoUrl),
        order_id: order.id,
        handler: async function (response: any) {
          // 3. On success, update database
          const startDate = new Date();
          const endDate = new Date();
          const duration = plan.duration.toLowerCase();
          
          if (duration.includes('year')) {
            endDate.setFullYear(endDate.getFullYear() + 1);
          } else if (duration.includes('6 month') || duration.includes('half')) {
            endDate.setMonth(endDate.getMonth() + 6);
          } else if (duration.includes('3 month') || duration.includes('quarter')) {
            endDate.setMonth(endDate.getMonth() + 3);
          } else {
            endDate.setMonth(endDate.getMonth() + 1);
          }

          try {
            const { error: subError } = await db.from('user_subscriptions').insert([{
              id: generateUUID(),
              user_id: user?.uid,
              plan_id: plan.id,
              plan_name: plan.name || 'Premium Plan',
              duration: plan.duration || 'Monthly',
              validation_duration: plan.duration || 'Monthly',
              start_date: startDate.toISOString().split('T')[0],
              end_date: endDate.toISOString().split('T')[0],
              status: 'active',
              amount: plan.price,
              payment_id: response.razorpay_payment_id,
              order_id: response.razorpay_order_id,
              signature: response.razorpay_signature,
              created_at: new Date().toISOString()
            }]);
            
            if (subError) throw subError;
            
            // Also update the user's role if needed or store in a separate table
            // But we already have the subscription record.
            
            toast.success(`Subscribed to ${plan.name}`);
            window.location.reload();
          } catch (err: any) {
            console.error('Subscription Insert Error:', err);
            toast.error('Failed to record subscription detail: ' + (err.message || 'Unknown error'));
          }
        },
        prefill: {
          name: profile.displayName || profile.mobileNumber,
          email: profile.email || '',
          contact: profile.mobileNumber
        },
        theme: {
          color: "#ea580c"
        }
      };
      
      const rzp = new Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast.error('Payment Failed: ' + response.error.description);
      });
      rzp.open();
      
    } catch (err) {
      console.error('Razorpay error:', err);
      toast.error('Payment initialization failed');
    }
  };

  if (loading) return <div className="py-40 flex flex-col items-center justify-center space-y-4"><RefreshCw className="animate-spin text-orange-600" size={48} /><p className="text-orange-600 font-bold animate-pulse">Loading Premium Plans...</p></div>;

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 md:p-10 rounded-[2.5rem] border border-orange-100 shadow-2xl shadow-orange-100/20 gap-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full -mr-20 -mt-20 blur-3xl opacity-50 group-hover:scale-110 transition-transform duration-700" />
        <div className="flex items-center gap-8 relative z-10">
          <div className="bg-orange-50 p-6 rounded-3xl shadow-xl border border-orange-100 text-orange-600">
            <Sparkles size={48} className="animate-pulse" />
          </div>
        </div>
        <div className="text-center md:text-right relative z-10">
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter leading-none mb-3">ELITE <span className="text-orange-600">PLANS</span></h2>
          <p className="text-gray-500 font-black uppercase tracking-widest text-[10px] md:text-xs">Professional Business Expansion Protocol</p>
          <div className="flex justify-center md:justify-end gap-2 mt-4">
            <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse delay-100" />
            <span className="w-2 h-2 rounded-full bg-orange-200 animate-pulse delay-200" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-12">
        {currentSub && (
          <div className="bg-green-50 border border-green-200 p-8 rounded-[2rem] flex flex-col md:flex-row justify-between items-center shadow-sm">
            <div className="flex items-center space-x-6 mb-4 md:mb-0">
              <div className="bg-green-600 p-4 rounded-2xl text-white shadow-lg">
                <ShieldCheck size={32} />
              </div>
              <div>
                <h3 className="text-xl font-black text-green-800 uppercase tracking-tight">Active Plan Benefits</h3>
                <p className="text-green-600 font-bold">Valid until: {format(new Date(currentSub.endDate), 'dd MMM yyyy')}</p>
              </div>
            </div>
            <div className="bg-white px-6 py-3 rounded-2xl border border-green-100 font-black text-green-600 shadow-sm">
              PREMIUM STATUS
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {plans.map(plan => (
            <div key={plan.id} className={cn(
              "bg-white border-4 p-8 rounded-[2.5rem] relative overflow-hidden transition-all hover:scale-[1.02] shadow-xl",
              currentSub?.planId === plan.id ? "border-green-500 shadow-green-100" : "border-gray-50 hover:border-orange-200 shadow-gray-100"
            )}>
              {currentSub?.planId === plan.id && (
                <div className="absolute top-0 right-0 bg-green-500 text-white px-6 py-2 rounded-bl-3xl font-black text-[10px] uppercase tracking-widest">
                  Active
                </div>
              )}
              <div className="relative z-10">
                <h3 className="text-2xl font-black mb-1 uppercase tracking-tight text-gray-900">{plan.name}</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Designed for professional {plan.role}s</p>
                <div className="text-5xl font-black text-orange-600 mb-8 tracking-tighter">
                  ₹{plan.price}
                  <span className="text-sm text-gray-400 font-bold uppercase tracking-widest ml-2">/ {plan.duration}</span>
                </div>
                
                <div className="space-y-4 mb-10">
                  {(plan.benefits && plan.benefits.length > 0 ? plan.benefits : ['Unlimited Listing', 'Direct Customer Contact', 'Featured Visibility']).map((benefit, i) => (
                    <div key={i} className="flex items-center space-x-3 text-gray-600 font-medium">
                      <div className="bg-orange-100 p-1 rounded-lg text-orange-600">
                        <Check size={14} />
                      </div>
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => handleSubscribe(plan)}
                  disabled={currentSub?.planId === plan.id}
                  className={cn(
                    "w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all",
                    currentSub?.planId === plan.id 
                      ? "bg-green-50 text-green-600 cursor-default" 
                      : "bg-gray-900 text-white hover:bg-orange-600 hover:shadow-2xl hover:shadow-orange-200 active:scale-95"
                  )}
                >
                  {currentSub?.planId === plan.id ? 'Active Plan' : 'Buy This Plan'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const FacilityDetailsEditor = ({ facilities, onChange }: { facilities: FacilityItem[], onChange: (f: FacilityItem[]) => void }) => {
  const [newFacility, setNewFacility] = useState<Partial<FacilityItem>>({
    name: '',
    rate: 0,
    unit: '',
    photoUrl: ''
  });

  const handleAdd = () => {
    if (!newFacility.name || !newFacility.unit) {
      toast.error('Facility Name and Unit are required');
      return;
    }
    const item: FacilityItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: newFacility.name!,
      rate: newFacility.rate || 0,
      unit: newFacility.unit!,
      photoUrl: newFacility.photoUrl || ''
    };
    onChange([...facilities, item]);
    setNewFacility({ name: '', rate: 0, unit: '', photoUrl: '' });
  };

  const handleRemove = (id: string) => {
    onChange(facilities.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Facility Name</label>
            <input 
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 uppercase"
              placeholder="e.g. Catering"
              value={newFacility.name}
              onChange={(e) => setNewFacility({...newFacility, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Rate (₹)</label>
            <input 
              type="number"
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 font-bold"
              placeholder="500"
              value={newFacility.rate}
              onChange={(e) => setNewFacility({...newFacility, rate: parseFloat(e.target.value) || 0})}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Unit</label>
            <input 
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 uppercase"
              placeholder="per plate / per set"
              value={newFacility.unit}
              onChange={(e) => setNewFacility({...newFacility, unit: e.target.value})}
            />
          </div>
          <div>
             <ImageUpload 
              label="Photo" 
              onUpload={(url) => setNewFacility(prev => ({...prev, photoUrl: (Array.isArray(url) ? url[0] : url) || ''}))}
            />
             {newFacility.photoUrl && (
               <div className="relative w-10 h-10 mt-1">
                 <img src={resolveUrl(newFacility.photoUrl)} className="w-full h-full object-cover rounded-lg border" />
                 <button onClick={() => setNewFacility(prev => ({...prev, photoUrl: ''}))} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5">
                   <X size={10} />
                 </button>
               </div>
             )}
          </div>
        </div>
        <button 
          type="button"
          onClick={handleAdd}
          className="w-full bg-orange-600 text-white py-2 rounded-xl text-sm font-bold hover:bg-orange-700 transition-all flex items-center justify-center space-x-2"
        >
          <Plus size={16} />
          <span>Add to List</span>
        </button>
      </div>

      {facilities.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
          <table className="w-full text-left border-collapse bg-white">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">Sr No.</th>
                <th className="px-4 py-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">Facility Name</th>
                <th className="px-4 py-2 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Rate</th>
                <th className="px-4 py-2 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Unit</th>
                <th className="px-4 py-2 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Photo</th>
                <th className="px-4 py-2 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {facilities.map((f, i) => (
                <tr key={f.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-xs font-bold text-gray-500">{i + 1}</td>
                  <td className="px-4 py-3 text-xs font-black text-gray-900 uppercase">{f.name}</td>
                  <td className="px-4 py-3 text-xs font-black text-orange-600 text-center">₹{f.rate}</td>
                  <td className="px-4 py-3 text-[10px] text-gray-500 font-bold uppercase text-center">{f.unit}</td>
                  <td className="px-4 py-3 text-center">
                    {f.photoUrl ? (
                      <img src={resolveUrl(f.photoUrl)} className="w-8 h-8 rounded-lg object-cover mx-auto" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-[10px] text-gray-300 italic uppercase">None</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button 
                      type="button" 
                      onClick={() => handleRemove(f.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const CatalogueManageView = ({ 
  user,
  venues, 
  services,
  globalSettings,
  activeSubscription,
  onUpgrade
}: { 
  user: any,
  venues: Venue[], 
  services: ServiceProvider[],
  globalSettings?: any,
  activeSubscription?: UserSubscription | null,
  onUpgrade?: () => void
}) => {
  const [activeType, setActiveType] = useState<'venue' | 'service'>(venues.length > 0 ? 'venue' : 'service');
  const [selectedId, setSelectedId] = useState<string>(
    activeType === 'venue' ? (venues[0]?.id || '') : (services[0]?.id || '')
  );
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState<Partial<CatalogueItem>>({
    id: Math.random().toString(36).substr(2, 9),
    level: activeType === 'venue' ? 'rooms(ac)' : 'work sample',
    capacity: 0,
    priceRate: 0,
    unit: 'person',
    images: [],
    videos: [],
    description: ''
  });

  const selectedItem = activeType === 'venue' 
    ? venues.find(v => v.id === selectedId) 
    : services.find(s => s.id === selectedId);

  const venueLevels: CatalogueLevel[] = [
    'rooms(ac)', 'rooms(non ac)', 'dinner hall', 'wedding hall', 'stage site', 
    'cattering hall', 'parking site', 'party hall', 'meeting hall', 
    'reshort site', 'counter site', 'garden site', 'ground', 'Indoor', 'Outdoor'
  ];

  const serviceLevels: CatalogueLevel[] = [
    'work sample', 'portfolio'
  ];

  const levels = activeType === 'venue' ? venueLevels : serviceLevels;

  useEffect(() => {
    if (activeType === 'venue') {
      setSelectedId(venues[0]?.id || '');
      setNewItem(prev => ({ ...prev, id: Math.random().toString(36).substr(2, 9), level: 'rooms(ac)' }));
    } else {
      setSelectedId(services[0]?.id || '');
      setNewItem(prev => ({ ...prev, id: Math.random().toString(36).substr(2, 9), level: 'work sample' }));
    }
  }, [activeType, venues.length, services.length]);

  const handleAddItem = async () => {
    if (!selectedItem || !newItem.level) {
      toast.error('Please select level');
      return;
    }
    setLoading(true);
    try {
      const updatedCatalogue = [...(selectedItem.catalogue || []), { ...newItem, id: newItem.id || Math.random().toString(36).substr(2, 9) } as CatalogueItem];
      const table = activeType === 'venue' ? 'venues' : 'service_providers';
      
      const { error } = await db.from(table).update({ catalogue: updatedCatalogue }).eq('id', selectedItem.id);
      if (error) throw error;
      
      setNewItem({ 
        id: Math.random().toString(36).substr(2, 9),
        level: activeType === 'venue' ? 'rooms(ac)' : 'work sample', 
        capacity: 0, 
        priceRate: 0,
        unit: 'person',
        images: [], 
        videos: [], 
        description: '' 
      });
      toast.success('Catalogue item added');
    } catch (err) {
      toast.error('Failed to add catalogue item');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (idx: number) => {
    if (!selectedItem || !selectedItem.catalogue) return;
    const updatedCatalogue = selectedItem.catalogue.filter((_, i) => i !== idx);
    const table = activeType === 'venue' ? 'venues' : 'service_providers';
    
    const { error } = await db.from(table).update({ catalogue: updatedCatalogue }).eq('id', selectedItem.id);
    if (!error) {
      toast.success('Catalogue item removed');
    } else {
      toast.error('Failed to remove catalogue item');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Catalogue Manage</h2>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveType('venue')}
            className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", activeType === 'venue' ? "bg-white text-orange-600 shadow-sm" : "text-gray-500")}
          >
            Venues
          </button>
          <button 
            onClick={() => setActiveType('service')}
            className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", activeType === 'service' ? "bg-white text-orange-600 shadow-sm" : "text-gray-500")}
          >
            Services
          </button>
        </div>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Select {activeType === 'venue' ? 'Venue' : 'Service'}</label>
          <select 
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            <option value="">Select an item</option>
            {activeType === 'venue' 
              ? venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)
              : services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)
            }
          </select>
        </div>

        {selectedItem && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-lg font-bold">Add New Item to Catalogue</h3>
              
              {activeType === 'venue' && (
                <div className="flex bg-orange-50 p-1 rounded-xl mb-4">
                  <button 
                    onClick={() => setNewItem({...newItem, level: 'Indoor'})}
                    className={cn("flex-1 py-2 rounded-lg text-xs font-bold transition-all", newItem.level === 'Indoor' ? "bg-orange-600 text-white shadow-md" : "text-orange-600")}
                  >
                    Indoor Photos
                  </button>
                  <button 
                    onClick={() => setNewItem({...newItem, level: 'Outdoor'})}
                    className={cn("flex-1 py-2 rounded-lg text-xs font-bold transition-all", newItem.level === 'Outdoor' ? "bg-orange-600 text-white shadow-md" : "text-orange-600")}
                  >
                    Outdoor Photos
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Level/Category</label>
                  <select 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                    value={newItem.level}
                    onChange={(e) => setNewItem({...newItem, level: e.target.value as CatalogueLevel})}
                  >
                    {levels.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Capacity</label>
                  <input 
                    type="number"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                    value={newItem.capacity}
                    onChange={(e) => setNewItem({...newItem, capacity: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price Rate (₹)</label>
                  <input 
                    type="number"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 font-bold"
                    placeholder="e.g. 5000"
                    value={newItem.priceRate}
                    onChange={(e) => setNewItem({...newItem, priceRate: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Unit</label>
                  <select 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                  >
                    <option value="Complete Item">Complete Item</option>
                    <option value="complete">Complete</option>
                    <option value="per day">Per Day</option>
                    <option value="per hour">Per Hour</option>
                    <option value="per plate">Per Plate</option>
                    <option value="per unit">Per Unit</option>
                    <option value="person">Per Guest</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                <textarea 
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                  rows={2}
                  placeholder={activeType === 'service' ? "Describe this work sample..." : "Describe this level..."}
                  value={newItem.description}
                  onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                />
              </div>

              <div className="md:col-span-2">
                <ImageUpload 
                  label="Upload Photos (Multiple)" 
                  multiple={true}
                  onUpload={(url) => {
                    if (url) {
                      const urls = Array.isArray(url) ? url : [url];
                      const currentImages = newItem.images || [];
                      const subEnabled = globalSettings?.subscriptionEnabled;
                      const isAdmin = user?.email === 'deepakjatav1005@gmail.com';
                      const hasSub = (activeSubscription && activeSubscription.status === 'active') || isAdmin;
                      const maxPhotos = (subEnabled && !hasSub) ? 2 : 10;

                      if (currentImages.length + urls.length > maxPhotos) {
                        toast.error(`Subscription required for more than ${maxPhotos} photos`);
                        if (subEnabled && !hasSub && onUpgrade) onUpgrade();
                        return;
                      }
                      setNewItem(prev => ({...prev, images: [...(prev.images || []), ...urls]}));
                    }
                  }}
                />
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {newItem.images?.filter(img => img !== '').map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center p-1">
                      <img src={resolveUrl(img)} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                      <button 
                        onClick={() => setNewItem(prev => ({...prev, images: prev.images?.filter((_, idx) => idx !== i)}))}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-md"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <VideoUpload 
                  label="Upload Videos (Max 60 seconds)" 
                  multiple={true}
                  onUpload={(url) => {
                    if (url) {
                      const currentVideos = newItem.videos || [];
                      const subEnabled = globalSettings?.subscriptionEnabled;
                      const isAdmin = user?.email === 'deepakjatav1005@gmail.com';
                      const hasSub = (activeSubscription && activeSubscription.status === 'active') || isAdmin;
                      const maxVideos = (subEnabled && !hasSub) ? 0 : 5;

                      if (currentVideos.length + 1 > maxVideos) {
                        toast.error(maxVideos === 0 ? "Subscription required to upload videos" : `Subscription required for more than ${maxVideos} videos`);
                        if (subEnabled && !hasSub && onUpgrade) onUpgrade();
                        return;
                      }
                      setNewItem(prev => ({...prev, videos: [...(prev.videos || []), url]}));
                    }
                  }}
                />
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {newItem.videos?.map((vid, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center p-1">
                      <video src={resolveUrl(vid)} className="w-full h-full object-contain" />
                      <button 
                        onClick={() => setNewItem(prev => ({...prev, videos: prev.videos?.filter((_, idx) => idx !== i)}))}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-md"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleAddItem}
                disabled={loading}
                className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition-all disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add to Catalogue'}
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold">Existing Catalogue</h3>
              {selectedItem.catalogue?.map((item, i) => (
                <div key={i} className="bg-white p-5 rounded-3xl border border-gray-100 flex flex-col md:flex-row gap-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-full md:w-48 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {item.images.slice(0, 4).map((img, idx) => (
                        <div key={idx} className="w-full aspect-square bg-gray-50 rounded-xl shadow-sm overflow-hidden flex items-center justify-center p-1 border border-gray-100">
                          <img src={resolveUrl(img)} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                      ))}
                    </div>
                    {item.videos && item.videos.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {item.videos.slice(0, 2).map((vid, idx) => (
                          <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center p-1 border border-gray-100">
                            <video src={resolveUrl(vid)} className="w-full h-full object-contain opacity-80" />
                            <Play size={16} className="absolute text-white drop-shadow-md" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-black text-orange-600 uppercase text-sm tracking-wider">{item.level}</h4>
                        <div className="flex flex-wrap gap-4 mt-1">
                          {activeType === 'venue' && <span className="text-xs text-gray-500 font-bold">Capacity: {item.capacity} persons</span>}
                          {item.priceRate && <span className="text-xs text-orange-600 font-black">Price: ₹{item.priceRate.toLocaleString()}</span>}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRemoveItem(i)}
                        className="text-red-600 hover:bg-red-50 p-2 rounded-xl transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-3 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
              {(!selectedItem.catalogue || selectedItem.catalogue.length === 0) && (
                <div className="text-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                  <ImageIcon size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 font-medium">No catalogue items added yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeType === 'venue' && venues.length === 0 && (
          <div className="text-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">Add a venue first to manage its catalogue.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const AddServiceView = ({ user, profile }: { user: any, profile: UserProfile | null }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    serviceType: SERVICE_TYPES[0],
    description: '',
    priceRange: '',
    priceLevel: 'per day',
    images: [] as string[],
    video_url: '',
    facilities: [] as string[],
    facilityDetails: [] as FacilityItem[],
    availableFor: [] as string[],
    city: profile?.district || '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    catalogue: [] as string[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await db.from('service_providers').insert([{
        id: generateUUID(),
        name: formData.name,
        type: formData.serviceType,
        service_type: formData.serviceType,
        description: formData.description,
        price_range: formData.priceRange,
        price_level: formData.priceLevel,
        images: formData.images.filter(i => i !== ''),
        city: formData.city || profile?.district || '',
        video_url: formData.video_url,
        facilities: formData.facilities,
        facility_details: formData.facilityDetails,
        available_for: formData.availableFor,
        latitude: formData.latitude,
        longitude: formData.longitude,
        provider_id: user?.uid,
        owner_id: user?.uid,
        state: profile?.state || '',
        district: profile?.district || '',
        block: profile?.block || '',
        pincode: profile?.pincode || '',
        rating: 0,
        review_count: 0,
        catalogue: formData.catalogue
      }]);
      if (error) {
        console.error('Add Service Error:', error);
        if (error.message?.includes('column "facilities" does not exist') || error.message?.includes('schema cache')) {
          toast.error('Failed to add service: DB schema outdated. Please run the MASTER SQL SCRIPT migration section in the Database settings panel.', { duration: 10000 });
        } else {
          toast.error(`Failed to add service: ${error.message || 'Unknown error'}`);
        }
        throw error;
      }
      toast.success('Service added successfully!');
      navigate('/dashboard?tab=services');
    } catch (err: any) {
      console.error('Add Service Error:', err);
      toast.error(`Failed to add service: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Register Your Service</h1>
        <button 
          onClick={() => navigate('/dashboard?tab=services')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          title="Close"
        >
          <X size={28} />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Business Name</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none uppercase"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Service Type</label>
            <select 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              value={formData.serviceType}
              onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
            >
              <option value="">Select Service Type</option>
              {SERVICE_TYPES.map(type => (
                <option key={type} value={type} className="capitalize">{type}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Price Range (e.g. ₹10k - ₹50k)</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none uppercase"
                value={formData.priceRange}
                onChange={(e) => setFormData({...formData, priceRange: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Price Level</label>
              <select 
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                value={formData.priceLevel}
                onChange={(e) => setFormData({...formData, priceLevel: e.target.value})}
              >
                <option value="per day">per day</option>
                <option value="as per hour">as per hour</option>
                <option value="as per time">as per time</option>
                <option value="as per item">as per item</option>
                <option value="as per plate">as per plate</option>
                <option value="as per work">as per work</option>
              </select>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
            <textarea 
              required
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none uppercase"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="md:col-span-2 border-t border-gray-100 pt-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-gray-700">Geo-Tag Location (Optional)</label>
              <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-400 font-bold uppercase">Skip to leave empty</span>
            </div>
            <LocationPicker 
              onLocationSelect={(lat, lng) => setFormData({...formData, latitude: lat, longitude: lng})}
            />
          </div>

          <div className="md:col-span-2 space-y-4">
            <label className="block text-sm font-bold text-gray-700">Media Uploads (Photos & Videos)</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ImageUpload 
                label="Add Service Photos" 
                multiple={true}
                onUpload={(url) => {
                  const urls = Array.isArray(url) ? url : [url];
                  setFormData(prev => ({...prev, images: [...(prev.images || []), ...urls]}));
                }}
              />
              <VideoUpload 
                label="Add Service Video (Max 60s)" 
                currentVideo={formData.video_url}
                onUpload={(url) => setFormData(prev => ({...prev, video_url: url}))}
              />
            </div>
            {formData.images.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-4">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border">
                    <img src={resolveUrl(img)} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <button 
                      type="button"
                      onClick={() => setFormData(prev => ({...prev, images: (prev.images || []).filter((_, i) => i !== idx)}))}
                      className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-lg"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2 font-black uppercase text-xs tracking-widest text-purple-600 border-b pb-2">1. Service Available For (Select Events)</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              {EVENT_TYPES.map(option => (
                <label key={option} className="flex items-center space-x-2 p-3 bg-white rounded-xl border border-gray-100 cursor-pointer hover:bg-purple-50 transition-colors shadow-sm">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    checked={formData.availableFor?.includes(option)}
                    onChange={(e) => {
                      const current = formData.availableFor || [];
                      if (e.target.checked) setFormData({...formData, availableFor: [...current, option]});
                      else setFormData({...formData, availableFor: current.filter(o => o !== option)});
                    }}
                  />
                  <span className="text-[10px] font-black text-gray-700 uppercase">{option}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2 font-black uppercase text-xs tracking-widest text-purple-600 border-b pb-2">2. Detailed Facility Listing (Rates & Units)</label>
            <FacilityDetailsEditor 
              facilities={formData.facilityDetails}
              onChange={(details) => setFormData({...formData, facilityDetails: details})}
            />
          </div>
        </div>
        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Register Service'}
        </button>
      </form>
    </div>
  );
};

const EditServiceView = ({ user, profile }: { user: any, profile: UserProfile | null }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    const fetchService = async () => {
      if (!id) return;
      const { data, error } = await db.from('service_providers').select('*').eq('id', id).single();
      if (!error && data) {
        if (data.owner_id !== user?.uid && profile?.role !== 'admin') {
          toast.error('Unauthorized');
          navigate('/dashboard');
          return;
        }
        setFormData({
          ...data,
          ownerId: data.owner_id || data.provider_id,
          serviceType: data.service_type || data.type,
          priceRange: data.price_range,
          priceLevel: data.price_level || 'per day',
          video_url: data.video_url || '',
          availableFor: data.available_for || [],
          facilities: data.facilities || [],
          facilityDetails: data.facility_details || [],
          latitude: data.latitude,
          longitude: data.longitude
        });
      }
      setLoading(false);
    };
    fetchService();
  }, [id, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      const { error } = await db.from('service_providers').update({
        name: formData.name,
        type: formData.serviceType,
        service_type: formData.serviceType,
        description: formData.description,
        price_range: formData.priceRange,
        price_level: formData.priceLevel,
        images: formData.images,
        city: formData.city,
        video_url: formData.video_url,
        available_for: formData.availableFor,
        facilities: formData.facilities,
        facility_details: formData.facilityDetails,
        latitude: formData.latitude,
        longitude: formData.longitude
      }).eq('id', id);
      if (error) throw error;
      toast.success('Service updated successfully!');
      navigate('/dashboard?tab=services');
    } catch (err: any) {
      console.error('Edit Service Error:', err);
      toast.error(`Failed to update service: ${err.message || 'Unknown error'}`);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!formData) return <div>Service not found</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Edit Service</h1>
        <button 
          onClick={() => navigate('/dashboard?tab=services')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          title="Close"
        >
          <X size={28} />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Business Name</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Service Type</label>
            <select 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              value={formData.serviceType}
              onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
            >
              <option value="">Select Service Type</option>
              {SERVICE_TYPES.map(type => (
                <option key={type} value={type} className="capitalize">{type}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Price Range</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none uppercase"
                value={formData.priceRange}
                onChange={(e) => setFormData({...formData, priceRange: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Price Level</label>
              <select 
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                value={formData.priceLevel}
                onChange={(e) => setFormData({...formData, priceLevel: e.target.value})}
              >
                <option value="per day">per day</option>
                <option value="as per hour">as per hour</option>
                <option value="as per time">as per time</option>
                <option value="as per item">as per item</option>
                <option value="as per plate">as per plate</option>
                <option value="as per work">as per work</option>
              </select>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
            <textarea 
              required
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none uppercase"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="md:col-span-2 border-t border-gray-100 pt-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-gray-700">Geo-Tag Location (Optional)</label>
              <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-400 font-bold uppercase">Skip to leave empty</span>
            </div>
            <LocationPicker 
              initialLocation={formData.latitude ? { lat: formData.latitude, lng: formData.longitude } : undefined}
              onLocationSelect={(lat, lng) => setFormData({...formData, latitude: lat, longitude: lng})}
            />
          </div>
          <div className="md:col-span-2 space-y-4">
            <label className="block text-sm font-bold text-gray-700">Media Uploads (Photos & Videos)</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ImageUpload 
                label="Add Service Photos" 
                multiple={true}
                onUpload={(url) => {
                  const urls = Array.isArray(url) ? url : [url];
                  setFormData(prev => ({...prev, images: [...(prev.images || []), ...urls]}));
                }}
              />
              <VideoUpload 
                label="Add Service Video (Max 60s)" 
                currentVideo={formData.video_url}
                onUpload={(url) => setFormData(prev => ({...prev, video_url: url}))}
              />
            </div>
            {formData.images?.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-4">
                {formData.images.map((img: string, idx: number) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border">
                    <img src={resolveUrl(img)} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <button 
                      type="button"
                      onClick={() => setFormData(prev => ({...prev, images: (prev.images || []).filter((_: any, i: number) => i !== idx)}))}
                      className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-lg"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2 font-black uppercase text-xs tracking-widest text-purple-600 border-b pb-2">1. Service Available For (Select Events)</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              {EVENT_TYPES.map(option => (
                <label key={option} className="flex items-center space-x-2 p-3 bg-white rounded-xl border border-gray-100 cursor-pointer hover:bg-purple-50 transition-colors shadow-sm">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    checked={formData.availableFor?.includes(option)}
                    onChange={(e) => {
                      const current = formData.availableFor || [];
                      if (e.target.checked) setFormData({...formData, availableFor: [...current, option]});
                      else setFormData({...formData, availableFor: current.filter(o => o !== option)});
                    }}
                  />
                  <span className="text-[10px] font-black text-gray-700 uppercase">{option}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2 font-black uppercase text-xs tracking-widest text-purple-600 border-b pb-2">2. Detailed Facility Listing (Rates & Units)</label>
            <FacilityDetailsEditor 
              facilities={formData.facilityDetails}
              onChange={(details) => setFormData({...formData, facilityDetails: details})}
            />
          </div>
        </div>
        <button 
          type="submit"
          className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg"
        >
          Update Service
        </button>
        <button 
          type="button"
          onClick={() => navigate('/dashboard?tab=services')}
          className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all mt-4"
        >
          Cancel & Exit
        </button>
      </form>
    </div>
  );
};

const EditVenueView = ({ user, profile }: { user: any, profile: UserProfile | null }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    const fetchVenue = async () => {
      if (!id) return;
      const { data, error } = await db.from('venues').select('*').eq('id', id).single();
      if (!error && data) {
        if (data.owner_id !== user?.uid && profile?.role !== 'admin') {
          toast.error('Unauthorized');
          navigate('/dashboard');
          return;
        }
        setFormData({
          ...data,
          ownerId: data.owner_id,
          venueType: data.venue_type,
          pricePerDay: data.price_per_day,
          video_url: data.video_url || '',
          availableFor: data.available_for || [],
          facilities: data.facilities || [],
          facilityDetails: data.facility_details || [],
          siteLevels: data.site_levels || [],
          latitude: data.latitude,
          longitude: data.longitude
        });
      }
      setLoading(false);
    };
    fetchVenue();
  }, [id, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      const { error } = await db.from('venues').update({
        name: formData.name,
        type: formData.venueType,
        venue_type: formData.venueType,
        description: formData.description,
        address: formData.address,
        pincode: formData.pincode,
        capacity: formData.capacity,
        price_per_day: formData.pricePerDay,
        images: formData.images,
        city: formData.city,
        video_url: formData.video_url,
        facilities: formData.facilities,
        facility_details: formData.facilityDetails,
        available_for: formData.availableFor,
        site_levels: formData.siteLevels,
        latitude: formData.latitude,
        longitude: formData.longitude
      }).eq('id', id);
      if (error) throw error;
      toast.success('Venue updated successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Edit Venue Error:', err);
      toast.error(`Failed to update venue: ${err.message || 'Unknown error'}`);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!formData) return <div>Venue not found</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Edit Venue</h1>
        <button 
          onClick={() => navigate('/dashboard?tab=venues')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          title="Close"
        >
          <X size={28} />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Venue Name</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none uppercase"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Venue Type</label>
            <select 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              value={formData.venueType}
              onChange={(e) => setFormData({...formData, venueType: e.target.value})}
            >
              <option value="Marriage Garden">Marriage Garden</option>
              <option value="Hotel">Hotel</option>
              <option value="Marriage Hall">Marriage Hall</option>
              <option value="Resort">Resort</option>
              <option value="Community Hall">Community Hall</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Pincode</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              value={formData.pincode}
              onChange={(e) => setFormData({...formData, pincode: e.target.value})}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Full Address</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none uppercase"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Capacity (Guests)</label>
            <input 
              required
              type="number" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              value={formData.capacity || ''}
              onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 0})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Price Per Day (₹)</label>
            <input 
              required
              type="number" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              value={formData.pricePerDay || ''}
              onChange={(e) => setFormData({...formData, pricePerDay: parseInt(e.target.value) || 0})}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
            <textarea 
              required
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none uppercase"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="md:col-span-2 border-t border-gray-100 pt-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-gray-700">Geo-Tag Location (Optional)</label>
              <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-400 font-bold uppercase">Skip to leave empty</span>
            </div>
            <LocationPicker 
              initialLocation={formData.latitude ? { lat: formData.latitude, lng: formData.longitude } : undefined}
              onLocationSelect={(lat, lng) => setFormData({...formData, latitude: lat, longitude: lng})}
            />
          </div>

          <div className="md:col-span-2 space-y-4">
            <label className="block text-sm font-bold text-gray-700">Media Uploads (Photos & Videos)</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ImageUpload 
                label="Add Venue Photos" 
                multiple={true}
                onUpload={(url) => {
                  const urls = Array.isArray(url) ? url : [url];
                  setFormData(prev => ({...prev, images: [...(prev?.images || []), ...urls]}));
                }}
              />
              <VideoUpload 
                label="Add Venue Video (Max 60s)" 
                currentVideo={formData.video_url}
                onUpload={(url) => setFormData(prev => ({...prev, video_url: url}))}
              />
            </div>
            {formData.images?.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-4">
                {formData.images.map((img: string, idx: number) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border">
                    <img src={resolveUrl(img)} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <button 
                      type="button"
                      onClick={() => setFormData(prev => ({...prev, images: (prev.images || []).filter((_: any, i: number) => i !== idx)}))}
                      className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-lg"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2 font-black uppercase text-xs tracking-widest text-orange-600 border-b pb-2">1. Venue Available For (Select Events)</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              {EVENT_TYPES.map(option => (
                <label key={option} className="flex items-center space-x-2 p-3 bg-white rounded-xl border border-gray-100 cursor-pointer hover:bg-orange-50 transition-colors shadow-sm">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                    checked={formData.availableFor?.includes(option)}
                    onChange={(e) => {
                      const current = formData.availableFor || [];
                      if (e.target.checked) setFormData({...formData, availableFor: [...current, option]});
                      else setFormData({...formData, availableFor: current.filter(o => o !== option)});
                    }}
                  />
                  <span className="text-[10px] font-black text-gray-700 uppercase">{option}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2 font-black uppercase text-xs tracking-widest text-orange-600 border-b pb-2">2. Venue Site Level (Select Available Areas)</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              {VENUE_SITE_LEVELS.map(option => (
                <label key={option} className="flex items-center space-x-2 p-3 bg-white rounded-xl border border-gray-100 cursor-pointer hover:bg-orange-50 transition-colors shadow-sm">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                    checked={formData.siteLevels?.includes(option)}
                    onChange={(e) => {
                      const current = formData.siteLevels || [];
                      if (e.target.checked) setFormData({...formData, siteLevels: [...current, option]});
                      else setFormData({...formData, siteLevels: current.filter(o => o !== option)});
                    }}
                  />
                  <span className="text-[10px] font-black text-gray-700 uppercase">{option}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            {/* Removed Facilities Offered Level as per request */}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2 font-black uppercase text-xs tracking-widest text-orange-600 border-b pb-2">3. Detailed Facility Listing (Rates & Units)</label>
            <FacilityDetailsEditor 
              facilities={formData.facilityDetails}
              onChange={(details) => setFormData({...formData, facilityDetails: details})}
            />
          </div>
        </div>
        <button 
          type="submit"
          disabled={loading}
          className={cn(
            "w-full bg-orange-600 text-white py-4 rounded-xl font-bold transition-all shadow-lg",
            loading ? "opacity-70 cursor-not-allowed" : "hover:bg-orange-700"
          )}
        >
          {loading ? 'Updating Venue...' : 'Update Venue Detail'}
        </button>
      </form>
    </div>
  );
};

const ProfileEditView = ({ user, profile, onUpdate }: { user: any, profile: UserProfile | null, onUpdate: (p: UserProfile) => void }) => {
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    fatherName: profile?.fatherName || '',
    mobileNumber: profile?.mobileNumber || '',
    email: profile?.email || '',
    photoURL: profile?.photoURL || '',
    state: profile?.state || '',
    district: profile?.district || '',
    block: profile?.block || '',
    pincode: profile?.pincode || '',
    venueType: profile?.venueType || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.mobileNumber.length !== 10) {
        toast.error('Mobile number must be exactly 10 digits');
        return;
      }

      const updatePayload: any = {
        display_name: formData.displayName,
        father_name: formData.fatherName,
        mobile_number: formData.mobileNumber,
        photo_url: formData.photoURL,
        state: formData.state,
        district: formData.district,
        block: formData.block,
        pincode: formData.pincode,
        venue_type: formData.venueType
      };

      if (formData.email) {
        updatePayload.email = formData.email;
      }

      const { error } = await db
        .from('users')
        .update(updatePayload)
        .eq('uid', user?.uid);

      if (error) throw error;
      
      const updatedProfile = { ...profile, ...formData } as UserProfile;
      onUpdate(updatedProfile);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex flex-col items-center mb-6 space-y-4">
          <ImageUpload 
            label="Profile Photo" 
            isCircle={true}
            currentImage={formData.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.registrationId}`}
            onUpload={(url) => setFormData(prev => ({...prev, photoURL: Array.isArray(url) ? url[0] : url}))}
          />
          <p className="text-sm text-gray-500 font-mono">ID: {profile?.registrationId}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none uppercase"
              value={formData.displayName}
              onChange={(e) => setFormData({...formData, displayName: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Father's Name</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none uppercase"
              value={formData.fatherName}
              onChange={(e) => setFormData({...formData, fatherName: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Mobile Number</label>
            <input 
              required
              type="tel" 
              maxLength={10}
              pattern="[0-9]{10}"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              value={formData.mobileNumber}
              onChange={(e) => setFormData({...formData, mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10)})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email ID (Optional)</label>
            <input 
              type="email" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">State</label>
            <select required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              value={formData.state} onChange={e => setFormData({...formData, state: e.target.value, district: '', block: ''})}>
              <option value="">Select State</option>
              {Object.keys(LOCATION_DATA || {}).map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">District</label>
            <select required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              disabled={!formData.state}
              value={formData.district} onChange={e => setFormData({...formData, district: e.target.value, block: ''})}>
              <option value="">Select District</option>
              {formData.state && LOCATION_DATA[formData.state] && Object.keys(LOCATION_DATA[formData.state]).map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Block</label>
            <select required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              disabled={!formData.district}
              value={formData.block} onChange={e => setFormData({...formData, block: e.target.value})}>
              <option value="">Select Block</option>
              {formData.state && formData.district && LOCATION_DATA[formData.state] && LOCATION_DATA[formData.state][formData.district] && LOCATION_DATA[formData.state][formData.district].map(block => (
                <option key={block} value={block}>{block}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Pincode</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              value={formData.pincode}
              onChange={(e) => setFormData({...formData, pincode: e.target.value})}
            />
          </div>
          {profile?.role === 'owner' && (
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Venue Type</label>
              <select 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                value={formData.venueType}
                onChange={(e) => setFormData({...formData, venueType: e.target.value})}
              >
                <option value="Marriage Garden">Marriage Garden</option>
                <option value="Hotel">Hotel</option>
                <option value="Marriage Hall">Marriage Hall</option>
                <option value="Resort">Resort</option>
                <option value="Community Hall">Community Hall</option>
              </select>
            </div>
          )}
        </div>

        <button 
          type="submit"
          className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg"
        >
          Update Profile
        </button>
      </form>
    </div>
  );
};

const AddVenueView = ({ user, profile }: { user: any, profile: UserProfile | null }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    pincode: profile?.pincode || '',
    venueType: VENUE_TYPES[0],
    capacity: 0,
    pricePerDay: 0,
    images: [] as string[],
    video_url: '',
    facilities: [] as string[],
    facilityDetails: [] as FacilityItem[],
    availableFor: [] as string[],
    siteLevels: [] as string[],
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    catalogue: [] as string[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await db.from('venues').insert([{
        id: generateUUID(),
        name: formData.name,
        type: formData.venueType,
        venue_type: formData.venueType,
        description: formData.description,
        address: formData.address,
        state: profile?.state || '',
        district: profile?.district || '',
        block: profile?.block || '',
        pincode: formData.pincode || profile?.pincode || '',
        capacity: formData.capacity,
        price_per_day: formData.pricePerDay,
        images: formData.images.filter(i => i !== ''),
        video_url: formData.video_url,
        facilities: formData.facilities,
        facility_details: formData.facilityDetails,
        available_for: formData.availableFor,
        site_levels: formData.siteLevels,
        latitude: formData.latitude,
        longitude: formData.longitude,
        owner_id: user?.uid,
        rating: 0,
        review_count: 0,
        catalogue: formData.catalogue
      }]);
      
      console.log('Submitting venue to DB:', { name: formData.name, owner: user.uid });
      if (error) {
        console.error('Add Venue Error:', error);
        toast.error(`Failed to add venue: ${error.message}`);
        throw error;
      }
      toast.success('Venue added successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Add Venue Error:', err);
      toast.error(`Failed to add venue: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add Your Venue</h1>
        <button 
          onClick={() => navigate('/dashboard')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          title="Close"
        >
          <X size={28} />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Venue Name</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none uppercase"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Venue Type</label>
            <select 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              value={formData.venueType}
              onChange={(e) => setFormData({...formData, venueType: e.target.value})}
            >
              <option value="Marriage Garden">Marriage Garden</option>
              <option value="Hotel">Hotel</option>
              <option value="Marriage Hall">Marriage Hall</option>
              <option value="Resort">Resort</option>
              <option value="Community Hall">Community Hall</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Full Address</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none uppercase"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Pincode</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              value={formData.pincode}
              onChange={(e) => setFormData({...formData, pincode: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Capacity (Guests)</label>
            <input 
              required
              type="number" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              value={formData.capacity || ''}
              onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 0})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Price Per Day (₹)</label>
            <input 
              required
              type="number" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              value={formData.pricePerDay || ''}
              onChange={(e) => setFormData({...formData, pricePerDay: parseInt(e.target.value) || 0})}
            />
          </div>

          <div className="md:col-span-2 border-t border-gray-100 pt-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-gray-700">Geo-Tag Location (Optional)</label>
              <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-400 font-bold uppercase">Skip to leave empty</span>
            </div>
            <LocationPicker 
              onLocationSelect={(lat, lng) => setFormData({...formData, latitude: lat, longitude: lng})}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
            <textarea 
              required
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none uppercase"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
          <div className="md:col-span-2 space-y-4">
            <label className="block text-sm font-bold text-gray-700">Media Uploads (Photos & Videos)</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ImageUpload 
                label="Add Venue Photos" 
                multiple={true}
                onUpload={(url) => {
                  const urls = Array.isArray(url) ? url : [url];
                  setFormData(prev => ({...prev, images: [...(prev.images || []), ...urls]}));
                }}
              />
              <VideoUpload 
                label="Add Venue Video (Max 60s)" 
                currentVideo={formData.video_url}
                onUpload={(url) => setFormData(prev => ({...prev, video_url: url}))}
              />
            </div>
            {formData.images.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-4">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border">
                    <img src={resolveUrl(img)} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <button 
                      type="button"
                      onClick={() => setFormData(prev => ({...prev, images: (prev.images || []).filter((_, i) => i !== idx)}))}
                      className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-lg"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2 font-black uppercase text-xs tracking-widest text-orange-600 border-b pb-2">1. Venue Available For (Select Events)</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              {EVENT_TYPES.map(option => (
                <label key={option} className="flex items-center space-x-2 p-3 bg-white rounded-xl border border-gray-100 cursor-pointer hover:bg-orange-50 transition-colors shadow-sm">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                    checked={formData.availableFor?.includes(option)}
                    onChange={(e) => {
                      const current = formData.availableFor || [];
                      if (e.target.checked) setFormData({...formData, availableFor: [...current, option]});
                      else setFormData({...formData, availableFor: current.filter(o => o !== option)});
                    }}
                  />
                  <span className="text-[10px] font-black text-gray-700 uppercase">{option}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2 font-black uppercase text-xs tracking-widest text-orange-600 border-b pb-2">2. Venue Site Level (Select Available Areas)</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              {VENUE_SITE_LEVELS.map(option => (
                <label key={option} className="flex items-center space-x-2 p-3 bg-white rounded-xl border border-gray-100 cursor-pointer hover:bg-orange-50 transition-colors shadow-sm">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                    checked={formData.siteLevels?.includes(option)}
                    onChange={(e) => {
                      const current = formData.siteLevels || [];
                      if (e.target.checked) setFormData({...formData, siteLevels: [...current, option]});
                      else setFormData({...formData, siteLevels: current.filter(o => o !== option)});
                    }}
                  />
                  <span className="text-[10px] font-black text-gray-700 uppercase">{option}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            {/* Removed Facilities Offered Level as per request */}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2 font-black uppercase text-xs tracking-widest text-orange-600 border-b pb-2">3. Detailed Facility Listing (Rates & Units)</label>
            <FacilityDetailsEditor 
              facilities={formData.facilityDetails}
              onChange={(details) => setFormData({...formData, facilityDetails: details})}
            />
          </div>
        </div>
        <button 
          type="submit"
          disabled={loading}
          className={cn(
            "w-full bg-orange-600 text-white py-4 rounded-xl font-bold transition-all shadow-lg",
            loading ? "opacity-70 cursor-not-allowed" : "hover:bg-orange-700"
          )}
        >
          {loading ? 'Adding Venue...' : 'List Venue'}
        </button>
      </form>
    </div>
  );
};

// --- Main App ---

const SearchResultsView = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [services, setServices] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedState, setSelectedState] = useState(searchParams.get('state') || '');
  const [selectedDistrict, setSelectedDistrict] = useState(searchParams.get('district') || '');
  const [selectedBlock, setSelectedBlock] = useState(searchParams.get('block') || '');

  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');

  useEffect(() => {
    setSearchTerm(searchParams.get('q') || '');
    setSelectedState(searchParams.get('state') || '');
    setSelectedDistrict(searchParams.get('district') || '');
    setSelectedBlock(searchParams.get('block') || '');
  }, [searchParams]);

  const states = Object.keys(LOCATION_DATA || {});
  const districts = selectedState ? Object.keys(LOCATION_DATA[selectedState] || {}) : [];
  const blocks = (selectedState && selectedDistrict && LOCATION_DATA[selectedState]) ? (LOCATION_DATA[selectedState][selectedDistrict] || []) : [];

  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      setLoading(true);
      const [venuesRes, servicesRes, usersRes] = await Promise.all([
        db.from('venues').select('*'),
        db.from('service_providers').select('*'),
        db.from('users').select('*')
      ]);

      const venuesData = venuesRes.data || [];
      const servicesData = servicesRes.data || [];
      const usersData = usersRes.data || [];

      if (ignore) return;

      // Process Venues including Synth
      let vData = venuesData.map(d => ({
        id: d.id,
        ownerId: d.owner_id,
        name: d.name,
        venueType: d.type,
        state: d.state,
        district: d.district,
        block: d.block,
        pincode: d.pincode,
        address: d.address,
        capacity: d.capacity,
        pricePerDay: d.price_per_day,
        description: d.description,
        images: d.images,
        facilities: d.facilities,
        rating: d.rating,
        reviewCount: d.review_count,
        catalogue: d.catalogue,
        createdAt: d.created_at
      } as Venue));

      const existingOwnerIds = new Set(venuesData.map(d => d.owner_id));
      const synthVenues = usersData
        .filter(u => u.role === 'owner' && !existingOwnerIds.has(u.uid))
        .map(u => ({
          id: 'synth_' + u.uid,
          ownerId: u.uid,
          name: (u.display_name || 'Business') + "'s Venue",
          venueType: (u.venue_type || 'marriage garden') as VenueType,
          state: u.state,
          district: u.district,
          block: u.block,
          pincode: u.pincode,
          address: `${u.block}, ${u.district}, ${u.state}`,
          capacity: 0,
          pricePerDay: 0,
          description: `A registered ${u.venue_type || 'Venue'} on BVO. Professional and ready to host.`,
          images: u.photo_url ? [u.photo_url] : ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800'],
          facilities: [],
          rating: 0,
          reviewCount: 0,
          createdAt: u.created_at
        } as Venue));
      
      vData = [...vData, ...synthVenues];

      const query = searchTerm.toLowerCase();
      if (query) {
        vData = vData.filter(v => 
          (v.name?.toLowerCase() || '').includes(query) || 
          (v.venueType?.toLowerCase() || '').includes(query) ||
          (v.description?.toLowerCase() || '').includes(query)
        );
      }
      if (selectedState) vData = vData.filter(v => v.state === selectedState);
      if (selectedDistrict) vData = vData.filter(v => v.district === selectedDistrict);
      if (selectedBlock) vData = vData.filter(v => v.block === selectedBlock);
      
      setVenues(vData);

      // Process Services including Synth
      let sData = servicesData.map(d => ({
        id: d.id,
        ownerId: d.owner_id || d.provider_id,
        providerId: d.owner_id || d.provider_id,
        name: d.name,
        serviceType: d.service_type || d.type,
        state: d.state,
        district: d.district,
        block: d.block,
        experience: d.experience,
        priceRange: d.price_range,
        description: d.description,
        images: d.images,
        rating: d.rating,
        reviewCount: d.review_count,
        createdAt: d.created_at
      } as ServiceProvider));

      const existingProviderIds = new Set(servicesData.map(d => d.provider_id));
      const synthServices = usersData
        .filter(u => u.role === 'provider' && !existingProviderIds.has(u.uid))
        .map(u => ({
          id: 'synth_' + u.uid,
          providerId: u.uid,
          name: u.display_name,
          serviceType: (u.service_type || 'dj and sound service') as ServiceType,
          state: u.state,
          district: u.district,
          block: u.block,
          experience: 'Professional',
          priceRange: 'Contact for details',
          description: `Registered ${u.service_type || 'service'} on BVO platform.`,
          images: u.photo_url ? [u.photo_url] : ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800'],
          rating: 0,
          reviewCount: 0,
          createdAt: u.created_at
        } as ServiceProvider));

      sData = [...sData, ...synthServices];

      if (query) {
        sData = sData.filter(s => 
          (s.name?.toLowerCase() || '').includes(query) || 
          (s.serviceType?.toLowerCase() || '').includes(query) ||
          (s.description?.toLowerCase() || '').includes(query)
        );
      }
      if (selectedState) sData = sData.filter(s => s.state === selectedState);
      if (selectedDistrict) sData = sData.filter(s => s.district === selectedDistrict);
      if (selectedBlock) sData = sData.filter(s => s.block === selectedBlock);
      
      setServices(sData);
      setLoading(false);
    };
    fetchData();
    return () => { ignore = true; };
  }, [searchTerm, selectedState, selectedDistrict, selectedBlock]);

  const clearFilters = () => {
    setSelectedState('');
    setSelectedDistrict('');
    setSelectedBlock('');
    setSearchTerm('');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-orange-100 mb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-50 rounded-full -ml-16 -mb-16 blur-2xl" />
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row gap-8 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-bold text-gray-700 mb-3 ml-1">Search Keywords</label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                <input 
                  type="text"
                  placeholder="Search venues or services..."
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full lg:w-auto flex-[2]">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 ml-1">State</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <select 
                    value={selectedState}
                    onChange={(e) => {
                      setSelectedState(e.target.value);
                      setSelectedDistrict('');
                      setSelectedBlock('');
                    }}
                    className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-orange-500 outline-none appearance-none"
                  >
                    <option value="">All States</option>
                    {states.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 ml-1">District</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <select 
                    value={selectedDistrict}
                    onChange={(e) => {
                      setSelectedDistrict(e.target.value);
                      setSelectedBlock('');
                    }}
                    disabled={!selectedState}
                    className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-orange-500 outline-none disabled:opacity-50 appearance-none"
                  >
                    <option value="">All Districts</option>
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 ml-1">Block</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <select 
                    value={selectedBlock}
                    onChange={(e) => setSelectedBlock(e.target.value)}
                    disabled={!selectedDistrict}
                    className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-orange-500 outline-none disabled:opacity-50 appearance-none"
                  >
                    <option value="">All Blocks</option>
                    {blocks.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">Results</h1>
          <p className="text-gray-500">
            Found {venues.length} venues and {services.length} services
          </p>
        </div>
        <button 
          onClick={clearFilters}
          className="bg-orange-50 text-orange-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-orange-100 transition-all flex items-center w-fit"
        >
          <RotateCcw size={16} className="mr-2" />
          {t('Clear All Filters')}
        </button>
      </div>

      {loading ? (
        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <div key={i} className="bg-gray-100 h-80 rounded-2xl animate-pulse" />)}
          </div>
        </div>
      ) : (
        <div className="space-y-16">
          {venues.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                <Building2 className="mr-3 text-orange-600" />
                Venues ({venues.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {venues.map(v => <VenueCard key={v.id} venue={v} />)}
              </div>
            </div>
          )}

          {services.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                <Briefcase className="mr-3 text-orange-600" />
                Services ({services.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {services.map(s => <ServiceCard key={s.id} service={s} />)}
              </div>
            </div>
          )}

          {venues.length === 0 && services.length === 0 && (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <Search size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-2xl font-bold text-gray-400">No results found matching your search</h3>
              <p className="text-gray-500 mt-2">Try different keywords or check your spelling</p>
              <Link to="/" className="mt-8 inline-block bg-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-700 transition-all">
                Back to Home
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const DatabaseMonitor = () => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected' | 'mock'>('checking');
  const [errorMessage, setErrorMessage] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);

  const check = useCallback(async () => {
    if (!isDatabaseConnected || getIsOffline()) {
      setStatus('mock');
      return;
    }

    setIsRetrying(true);
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      
      if (response.ok && data.status === 'ok') {
        setStatus('connected');
        setOfflineMode(false);
      } else {
        setStatus('disconnected');
        setErrorMessage(data.error || data.database || 'Database unreachable');
        setOfflineMode(true);
      }
    } catch (err: any) {
      setStatus('disconnected');
      setErrorMessage(err.message || 'Network connection lost');
      setOfflineMode(true);
    } finally {
      setIsRetrying(false);
    }
  }, []);

  useEffect(() => {
    check();
    const interval = setInterval(check, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [check]);

  if (status === 'checking') return null;

  return (
    <div className="fixed bottom-6 left-6 z-[200]">
      <AnimatePresence>
        {status === 'disconnected' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex items-center space-x-3 bg-red-600 text-white px-4 py-3 rounded-2xl shadow-2xl border border-red-500 max-w-sm"
          >
            <div className="bg-red-500/30 p-2 rounded-xl">
              <CloudOff size={20} className="animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">{t('Connection Failed')}</p>
              <p className="text-xs text-red-100 truncate opacity-90">{errorMessage}</p>
            </div>
            <button 
              onClick={check} 
              disabled={isRetrying}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw size={18} className={isRetrying ? "animate-spin" : ""} />
            </button>
          </motion.div>
        )}

        {status === 'mock' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-3 bg-orange-600 text-white px-4 py-3 rounded-2xl shadow-2xl border border-orange-500"
          >
            <div className="bg-orange-500/30 p-2 rounded-xl">
              <DbIcon size={20} />
            </div>
            <div>
              <p className="font-bold text-sm">{t('Working Offline')}</p>
              <p className="text-xs text-orange-100 opacity-90">{t('Local Storage Active')}</p>
            </div>
            <button 
              onClick={() => {
                setOfflineMode(false);
                check();
              }}
              className="ml-2 bg-white/20 hover:bg-white/30 p-2 rounded-lg"
            >
              <RefreshCw size={14} className={isRetrying ? "animate-spin" : ""} />
            </button>
          </motion.div>
        )}

        {status === 'connected' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900/90 text-white px-3 py-1.5 rounded-full text-[9px] uppercase font-bold tracking-widest border border-emerald-500/30 backdrop-blur-sm flex items-center gap-2"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span>{t('MySQL Connected')}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CookiesView = () => (
  <div className="max-w-4xl mx-auto px-4 py-32">
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <h1 className="text-4xl font-bold mb-8 text-gray-900">Cookies Policy</h1>
      <div className="prose max-w-none space-y-6 text-gray-700">
        <p className="text-sm font-bold text-orange-600 uppercase tracking-widest mb-4">Last updated: October 2023</p>
        <p>This Cookies Policy explains how Best Venue Option ("we", "us", and "our") uses cookies and similar technologies to recognize you when you visit our website at <a href="https://www.bestvenueoption.com" className="text-orange-600 hover:underline">www.bestvenueoption.com</a>.</p>
        
        <h2 className="text-2xl font-bold text-gray-900 mt-8">What are cookies?</h2>
        <p>Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.</p>
        
        <h2 className="text-2xl font-bold text-gray-900 mt-8">Why do we use cookies?</h2>
        <p>We use first-party and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our Website to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our Website.</p>
        
        <h2 className="text-2xl font-bold text-gray-900 mt-8">Types of cookies we use:</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Essential Cookies:</strong> Necessary to provide you with services available through our Website.</li>
          <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our Website.</li>
          <li><strong>Preference Cookies:</strong> Allow the Website to remember choices you make (such as your language).</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-8">How can I control cookies?</h2>
        <p>You have the right to decide whether to accept or reject cookies. You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website may be restricted.</p>
        
        <p>If you have any questions about our use of cookies or other technologies, please email us at <a href="mailto:Chanchalnetzone2026@gmail.com" className="text-orange-600 hover:underline">Chanchalnetzone2026@gmail.com</a>.</p>
      </div>
    </div>
  </div>
);

export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'en');
  
  useEffect(() => {
    console.log(`[DATABASE] Mode: ${isDatabaseConnected ? 'REAL DATABASE' : 'MOCK DATA'}`);
    if (isDatabaseConnected) {
      // Test connection
      db.from('users').select('uid').limit(1).then(({ error }) => {
        if (error) {
          console.error('[DATABASE] Connection test failed:', error.message);
          toast.error('Database connection failed. Please check your database settings.');
        } else {
          console.log('[DATABASE] Connection test successful!');
        }
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('app_lang', lang);
  }, [lang]);

  const t = React.useCallback((key: string) => {
    if (!key) return '';
    const cleanKey = String(key).trim();
    if (translations[lang] && translations[lang][cleanKey] !== undefined) {
      return translations[lang][cleanKey];
    }
    // Case-insensitive fallback
    const lowerKey = cleanKey.toLowerCase();
    if (translations[lang]) {
      const foundKey = Object.keys(translations[lang]).find(k => k.toLowerCase() === lowerKey);
      if (foundKey && translations[lang][foundKey] !== undefined) {
        return translations[lang][foundKey];
      }
    }
    return key;
  }, [lang]);

  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('custom_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('custom_profile');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  
  const contextValue = React.useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  const handleUpdateProfile = useCallback((p: UserProfile) => {
    setProfile(p);
    localStorage.setItem('custom_profile', JSON.stringify(p));
  }, []);

  const [loading, setLoading] = useState(true);
  const [activeSubscription, setActiveSubscription] = useState<UserSubscription | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isAppRatingOpen, setIsAppRatingOpen] = useState(false);
  const [globalSettings, setGlobalSettings] = useState({ 
    subscriptionEnabled: true,
    appName: 'BEST VENUE OPTION',
    appLogoUrl: '/logo.png',
    appTagline: 'VENUE & EVENT & SERVICE PROVIDERS'
  });

  console.log('[APP] Current state:', { user: user?.uid, profile: profile?.role, loading });

  const handleLogout = async () => {
    try {
      await db.auth.signOut();
      localStorage.removeItem('custom_user');
      localStorage.removeItem('custom_profile');
      setUser(null);
      setProfile(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    }
  };

  // 5-minute Inactivity Logout Logic
  useEffect(() => {
    if (!user) return;

    let timeout: NodeJS.Timeout;

    const resetTimer = () => {
      if (timeout) clearTimeout(timeout);
      
      timeout = setTimeout(() => {
        localStorage.setItem('session_expired_flag', 'true');
        handleLogout();
        toast.error('your session expired please login again', { id: 'session-expired' });
      }, 5 * 60 * 1000); // 5 minutes
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    
    resetTimer(); // Initialize

    return () => {
      if (timeout) clearTimeout(timeout);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [user, handleLogout]);

  useEffect(() => {
    let authSubscription: any = null;

    const initAndSeed = async () => {
      const loadingTimeout = setTimeout(() => {
        setLoading(current => {
          if (current) {
            console.warn('Initialization taking too long, forcing loading to false');
            return false;
          }
          return current;
        });
      }, 5000);

      try {
        const { data: settings } = await db.from('admin_settings').select('*');
        if (settings) {
          const subEnabled = settings.find(s => s.key === 'subscription_enabled');
          const appNameSetting = settings.find(s => s.key === 'app_name');
          const appLogoSetting = settings.find(s => s.key === 'app_logo_url');
          const appTaglineSetting = settings.find(s => s.key === 'app_tagline');

          setGlobalSettings(prev => ({
            ...prev,
            subscriptionEnabled: subEnabled ? (subEnabled.value === 'true' || subEnabled.value === true) : prev.subscriptionEnabled,
            appName: appNameSetting ? appNameSetting.value : prev.appName,
            appLogoUrl: appLogoSetting ? appLogoSetting.value : prev.appLogoUrl,
            appTagline: appTaglineSetting ? appTaglineSetting.value : prev.appTagline
          }));
        }

        // Fetch user's active subscription if logged in
        if (user?.uid) {
          const { data: subData } = await db.from('user_subscriptions')
            .select('*')
            .eq('user_id', user.uid)
            .eq('status', 'active')
            .order('end_date', { ascending: false })
            .limit(1);
          
          if (subData && subData.length > 0) {
            const d = subData[0];
            setActiveSubscription({
              id: d.id,
              userId: d.user_id,
              planId: d.plan_id,
              startDate: d.start_date,
              endDate: d.end_date,
              status: d.status,
              amount: d.amount,
              createdAt: d.created_at
            });
          } else {
            setActiveSubscription(null);
          }
        }
        
        // Check local storage for custom session first
        const savedUser = localStorage.getItem('custom_user');
        const savedProfile = localStorage.getItem('custom_profile');
        
        if (savedUser && savedProfile) {
          setUser(JSON.parse(savedUser));
          setProfile(JSON.parse(savedProfile));
        } else {
          // Check session
          const { data: { session } } = await db.auth.getSession();
          if (session?.user) {
            setUser(session.user);
            const { data: profileData, error: profileError } = await db
              .from('users')
              .select('*')
              .eq('uid', session.user.id)
              .maybeSingle();
            
            if (!profileError && profileData) {
              const rawProfile = profileData as any;
              const mappedProfile = {
                uid: rawProfile.uid,
                registrationId: rawProfile.registration_id,
                displayName: rawProfile.display_name,
                fatherName: rawProfile.father_name,
                mobileNumber: rawProfile.mobile_number,
                email: rawProfile.email,
                photoURL: rawProfile.photo_url,
                role: rawProfile.role,
                state: rawProfile.state,
                district: rawProfile.district,
                block: rawProfile.block,
                pincode: rawProfile.pincode,
                venueType: rawProfile.venue_type,
                createdAt: rawProfile.created_at
              } as UserProfile;
              setProfile(mappedProfile);
              localStorage.setItem('custom_user', JSON.stringify(session.user));
              localStorage.setItem('custom_profile', JSON.stringify(mappedProfile));
            }
          }
        }

        // Listen for auth changes
        const { data: { subscription } } = db.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            setUser(session.user);
            const { data: profileData, error: profileError } = await db
              .from('users')
              .select('*')
              .eq('uid', session.user.id)
              .maybeSingle();
            
            if (!profileError && profileData) {
              const rawProfile = profileData as any;
              const freshProfile = {
                uid: rawProfile.uid,
                registrationId: rawProfile.registration_id,
                displayName: rawProfile.display_name,
                fatherName: rawProfile.father_name,
                mobileNumber: rawProfile.mobile_number,
                email: rawProfile.email,
                photoURL: rawProfile.photo_url,
                role: rawProfile.role,
                state: rawProfile.state,
                district: rawProfile.district,
                block: rawProfile.block,
                pincode: rawProfile.pincode,
                venueType: rawProfile.venue_type,
                createdAt: rawProfile.created_at
              } as UserProfile;
              setProfile(freshProfile);
              localStorage.setItem('custom_user', JSON.stringify(session.user));
              localStorage.setItem('custom_profile', JSON.stringify(freshProfile));

              // Fetch User Subscription on Auth Change
              const { data: subData } = await db.from('user_subscriptions')
                .select('*')
                .eq('user_id', session.user.id)
                .eq('status', 'active')
                .order('end_date', { ascending: false })
                .limit(1);
              
              if (subData && subData.length > 0) {
                const d = subData[0];
                setActiveSubscription({
                  id: d.id,
                  userId: d.user_id,
                  planId: d.plan_id,
                  startDate: d.start_date,
                  endDate: d.end_date,
                  status: d.status,
                  amount: d.amount,
                  createdAt: d.created_at
                });
              } else {
                setActiveSubscription(null);
              }
            }
          } else {
            // Only clear if we don't have a saved user in localStorage (prevents refresh logout)
            const savedUser = localStorage.getItem('custom_user');
            if (!savedUser) {
              setUser(null);
              setProfile(null);
              setActiveSubscription(null);
              localStorage.removeItem('custom_user');
              localStorage.removeItem('custom_profile');
            }
          }
        });
        authSubscription = subscription;
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        clearTimeout(loadingTimeout);
        setLoading(false);
      }
    };
    initAndSeed();

    return () => {
      if (authSubscription) {
        if (typeof authSubscription.unsubscribe === 'function') {
           authSubscription.unsubscribe();
        } else if (db.removeChannel) {
           db.removeChannel(authSubscription);
        }
      }
    };
  }, []);

  const [appRating, setAppRating] = useState(0);
  const [totalFeedback, setTotalFeedback] = useState(0);

  useEffect(() => {
    const fetchAppRating = async () => {
      const { data, error } = await db
        .from('app_feedback')
        .select('rating');
      
      if (!error && data) {
        if (data.length > 0) {
          const sum = data.reduce((acc, curr) => acc + (curr.rating || 0), 0);
          const avg = sum / data.length;
          setAppRating(parseFloat(avg.toFixed(1)));
          setTotalFeedback(data.length);
        } else {
          setAppRating(0);
          setTotalFeedback(0);
        }
      }
    };
    fetchAppRating();
    
    const channel = db
      .channel('app_feedback_footer')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_feedback' }, fetchAppRating)
      .subscribe();
      
    return () => {
      db.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const handleOpenRating = () => setIsAppRatingOpen(true);
    window.addEventListener('open-app-rating', handleOpenRating);
    return () => window.removeEventListener('open-app-rating', handleOpenRating);
  }, []);

    if (loading) {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-orange-50/50">
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="flex flex-col items-center space-y-4"
          >
            <div className="h-16 w-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-center">
              <span className="text-2xl font-black text-blue-600">BEST VENUE </span>
              <span className="text-2xl font-black text-red-500">OPTION</span>
            </div>
          </motion.div>
        </div>
      );
    }

  return (
    <LanguageContext.Provider value={contextValue}>
      <DOMTranslator />
      <DatabaseMonitor />
      <Router>
        <div className="min-h-screen bg-white font-sans text-gray-900">
          <Toaster position="top-center" />
          
          <Navbar 
            user={user} 
            profile={profile} 
            onLogout={handleLogout} 
            onRateApp={() => setIsAppRatingOpen(true)} 
          />
          
          <SubscriptionUpgradeModal 
            isOpen={isUpgradeModalOpen}
            onClose={() => setIsUpgradeModalOpen(false)}
            onUpgrade={() => {
              setIsUpgradeModalOpen(false);
              // Navigate to my-subscription tab in profile or similar
              // For now we'll just redirect to pricing
              window.location.href = "/#/pricing";
            }}
          />

          <AppRatingModal 
            isOpen={isAppRatingOpen} 
            onClose={() => setIsAppRatingOpen(false)} 
            user={user} 
          />
          
          <main>
            <Routes>
              <Route path="/" element={<HomeView user={user} />} />
              <Route path="/app-rating" element={<HomeView user={user} forceRateOpen={true} />} />
              <Route path="/venues" element={<VenueListView />} />
              <Route path="/venues/:id" element={<VenueDetailView user={user} profile={profile} />} />
              <Route path="/services" element={<ServiceListView user={user} />} />
              <Route path="/search" element={<SearchResultsView />} />
              <Route path="/services/:id" element={<ServiceDetailView user={user} profile={profile} />} />
              <Route path="/dashboard" element={<DashboardView user={user} profile={profile} onUpdateProfile={handleUpdateProfile} globalSettings={globalSettings} activeSubscription={activeSubscription} onUpgradeNeeded={() => setIsUpgradeModalOpen(true)} />} />
              <Route path="/admin" element={<AdminView user={user} profile={profile} onUpdateProfile={handleUpdateProfile} globalSettings={globalSettings} setGlobalSettings={setGlobalSettings} activeSubscription={activeSubscription} onLogout={handleLogout} />} />
              <Route path="/add-venue" element={<AddVenueView user={user} profile={profile} />} />
              <Route path="/edit-venue/:id" element={<EditVenueView user={user} profile={profile} />} />
              <Route path="/edit-service/:id" element={<EditServiceView user={user} profile={profile} />} />
              <Route path="/add-service" element={<AddServiceView user={user} profile={profile} />} />
              <Route path="/profile" element={<ProfileEditView user={user} profile={profile} onUpdate={handleUpdateProfile} />} />
      <Route path="/change-password" element={<ChangePasswordView user={user} profile={profile} onUpdateProfile={handleUpdateProfile} />} />
      <Route path="/forgot-password" element={<ForgotPasswordView />} />
      <Route path="/registration" element={<RegistrationView />} />
              <Route path="/login" element={<LoginView onLogin={(u, p) => { 
                setUser(u); 
                setProfile(p);
                localStorage.setItem('custom_user', JSON.stringify(u));
                localStorage.setItem('custom_profile', JSON.stringify(p));
              }} />} />
              <Route path="/gallery" element={<GalleryView />} />
              <Route path="/about" element={<AboutView />} />
              <Route path="/terms" element={<TermsView />} />
              <Route path="/privacy" element={<PrivacyView />} />
              <Route path="/cookies" element={<CookiesView />} />
              <Route path="/pricing" element={<PricingView />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>

          <footer className="bg-gray-900 text-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="col-span-1 md:col-span-2">
                  <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
                    <AppLogo size="md" />
                  </div>
                  <p className="text-gray-400 max-w-sm mb-6">
                    {t('heroTagline')}
                  </p>
                  <div className="bg-gray-800/50 p-6 rounded-3xl border border-gray-700 inline-block">
                    <div className="flex items-center space-x-4">
                      <div className="bg-orange-500/20 p-3 rounded-2xl">
                        <Star className="text-orange-500" size={24} fill="currentColor" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">App Rating</p>
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                size={14} 
                                className={cn(
                                  star <= Math.round(appRating) ? "text-orange-500 fill-orange-500" : "text-gray-600"
                                )} 
                              />
                            ))}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl font-black text-white">{appRating}</span>
                            <span className="text-gray-500 font-bold">/ 5.0</span>
                            <span className="text-xs text-gray-600 ml-2 whitespace-nowrap">({totalFeedback} reviews)</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsAppRatingOpen(true)}
                        className="ml-4 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all"
                      >
                        {t('rateUs')}
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-bold mb-6">Quick Links</h4>
                  <ul className="space-y-4 text-gray-400">
                    <li><Link to="/" className="hover:text-orange-400 transition-colors">{t('home')}</Link></li>
                    <li><Link to="/gallery" className="hover:text-orange-400 transition-colors">{t('gallery')}</Link></li>
                    <li><Link to="/venues" className="hover:text-orange-400 transition-colors">{t('search')}</Link></li>
                    <li><Link to="/about" className="hover:text-orange-400 transition-colors">{t('about')}</Link></li>
                    <li><Link to="/registration" className="hover:text-orange-400 transition-colors">{t('registration')}</Link></li>
                    <li><Link to="/login" className="hover:text-orange-400 transition-colors">{t('login')}</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-bold mb-6">Support</h4>
                  <ul className="space-y-4 text-gray-400">
                    <li><a href="#" className="hover:text-orange-400 transition-colors">Help Center</a></li>
                    <li><a href="mailto:Chanchalnetzone2026@gmail.com" className="hover:text-orange-400 transition-colors">Contact Us</a></li>
                    <li><Link to="/terms" className="hover:text-orange-400 transition-colors">Terms & Conditions</Link></li>
                    <li><Link to="/cookies" className="hover:text-orange-400 transition-colors">Cookies Policy</Link></li>
                    <li><a href="tel:8349076918" className="hover:text-orange-400 transition-colors">+91 8349076918</a></li>
                  </ul>
                </div>
              </div>
              <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col items-center justify-center space-y-6">
                <PoweredByCNZ />
                <div className="flex flex-wrap items-center justify-center gap-3 bg-gray-800/30 p-3 rounded-2xl border border-gray-800/50 backdrop-blur-sm">
                  <a 
                    href="https://www.facebook.com/profile.php?id=61588995675011" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-8 h-8 flex items-center justify-center rounded-md bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-all duration-300 transform hover:scale-110 shadow-sm border border-[#1877F2]/20 group"
                    title="Follow us on Facebook"
                  >
                    <FacebookIcon size={16} className="group-hover:scale-110 transition-transform" />
                  </a>
                  <a 
                    href="https://www.youtube.com/@BestVanueOption" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-8 h-8 flex items-center justify-center rounded-md bg-[#FF0000]/10 text-[#FF0000] hover:bg-[#FF0000] hover:text-white transition-all duration-300 transform hover:scale-110 shadow-sm border border-[#FF0000]/20 group"
                    title="Subscribe to our YouTube Channel"
                  >
                    <YoutubeIcon size={16} className="group-hover:scale-110 transition-transform" />
                  </a>
                  <a 
                    href="https://chat.whatsapp.com/HdawgS9kChJ3JY4vui3YMi?mode=gi_t" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-8 h-8 flex items-center justify-center rounded-md bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all duration-300 transform hover:scale-110 shadow-sm border border-[#25D366]/20 group"
                    title="Join our WhatsApp Group"
                  >
                    <WhatsAppIcon size={16} className="group-hover:scale-110 transition-transform" />
                  </a>
                  <a 
                    href="https://www.bestvenueoption.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-8 h-8 flex items-center justify-center rounded-md bg-orange-600/10 text-orange-600 hover:bg-orange-600 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-sm border border-orange-600/20 group"
                    title="Visit Website"
                  >
                    <Globe size={16} className="group-hover:rotate-12 transition-transform" />
                  </a>
                </div>
                <div className="text-gray-500 text-sm">
                  {t('footerCopyright')}
                </div>
              </div>
            </div>
          </footer>
          
          <CookiePolicyBanner />
          <BVOAssistant />
        </div>
      </Router>
    </LanguageContext.Provider>
  );
}

// --- Admin View Components ---

// --- Flex & Banner Download View (Admin) ---
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
    const sizeObj = selectedType === 4 
      ? cardSizes.find(s => s.value === selectedInchSize) 
      : flexSizes.find(s => s.value === selectedSize);
    
    if (!sizeObj) return;

    const { jsPDF } = await import('jspdf');

    // Use landscape if width > height
    const orientation = sizeObj.w >= sizeObj.h ? 'l' : 'p';
    const doc = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: [sizeObj.w, sizeObj.h]
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const isLandscape = pageWidth > pageHeight;

    const splitName = (name: string) => {
      if (!name) return { part1: '', part2: '' };
      const n = String(name);
      if (n.toUpperCase() === 'BEST VANUE OPTION') return { part1: 'BEST VANUE', part2: 'OPTION' };
      const words = n.split(' ');
      if (words.length > 1) {
        const mid = Math.ceil(words.length / 2);
        return { part1: words.slice(0, mid).join(' '), part2: words.slice(mid).join(' ') };
      }
      return { part1: n, part2: '' };
    };

    const draw3DText = (text: string, x: number, y: number, options: any, color1: [number, number, number], color2: [number, number, number]) => {
      const offset = pageHeight * 0.003;
      doc.setTextColor(color2[0], color2[1], color2[2]);
      doc.text(text, x + offset, y + offset, options);
      doc.setTextColor(color1[0], color1[1], color1[2]);
      doc.text(text, x, y, options);
    };

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
          doc.addImage(item.images[0], 'JPEG', photoX, photoY, photoSize, photoSize, undefined, 'FAST');
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
        const QRCodeLib = await import('qrcode');
        const QRCode = QRCodeLib.default || QRCodeLib;
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
      // APP BRANDING BANNER - IMPROVED WITH BACKGROUND COMBINATION & BOUNDARY CHECKS
      // Background Layers
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
        const QRCodeLib = await import('qrcode');
        const QRCode = QRCodeLib.default || QRCodeLib;
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
      // APP RATING BANNER - UPDATED TO MATCH VENUE/SERVICE CARD STYLE
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
        const QRCodeLib = await import('qrcode');
        const QRCode = QRCodeLib.default || QRCodeLib;
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
                  items.map(i => <option key={i.id} value={i.id}>{i.name} ({selectedType === 1 ? i.venueType : i.serviceType})</option>)
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

const AdminView = ({ 
  user, 
  profile, 
  onUpdateProfile, 
  globalSettings, 
  setGlobalSettings,
  activeSubscription,
  onLogout
}: { 
  user: any, 
  profile: UserProfile | null, 
  onUpdateProfile: (p: UserProfile) => void, 
  globalSettings: any, 
  setGlobalSettings: any,
  activeSubscription: UserSubscription | null,
  onLogout?: () => void
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'plans' | 'notifications' | 'banners' | 'servicePhotos' | 'moments' | 'venue-photos' | 'profile' | 'settings' | 'database' | 'flex-download' | 'query-complaint'>('dashboard');
  const [venuePhotos, setVenuePhotos] = useState<{id: string, image_url: string, venue_type?: string, created_at: string}[]>([]);
  const [uploadVenueType, setUploadVenueType] = useState<string>('Marriage Garden');
  const [adminVenuePhotoFilter, setAdminVenuePhotoFilter] = useState<string>('All');
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
  const [reportFilters, setReportFilters] = useState({
    name: '',
    mobile: '',
    startDate: '',
    endDate: '',
    paymentMode: '',
    paymentStatus: '',
    year: new Date().getFullYear().toString()
  });

  // Modal states for adding notification/banner/servicePhoto
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [newNotification, setNewNotification] = useState({ title: '', message: '' });
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [newBanner, setNewBanner] = useState({ title: '', imageUrl: '' });
  const [isServicePhotoModalOpen, setIsServicePhotoModalOpen] = useState(false);
  const [newServicePhoto, setNewServicePhoto] = useState({ serviceType: SERVICE_TYPES[0] as ServiceType, imageUrl: '' });
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDanger?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const [editingNotification, setEditingNotification] = useState<AppNotification | null>(null);

  // Admin profile state
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

  useEffect(() => {
    if (!user || user.email !== 'deepakjatav1005@gmail.com') return;

    const channel = db
      .channel('admin_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subscription_plans' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'banners' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_type_photos' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'venue_photos' }, fetchData)
      .subscribe();

    return () => {
      db.removeChannel(channel);
    };
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
          isAmountUpdated: !!d.is_amount_updated,
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

      if (activeTab === 'venue-photos') {
        const { data } = await db.from('venue_photos').select('*').order('created_at', { ascending: false });
        if (data) setVenuePhotos(data);
      }

      if (activeTab === 'flex-download') {
        const { data: vData } = await db.from('venues').select('*');
        const { data: sData } = await db.from('service_providers').select('*');
        
        const { data: pData } = await db.from('user_profiles').select('id, displayName');
        const profileMap = (pData || []).reduce((acc: any, p: any) => {
          acc[p.id] = p.displayName;
          return acc;
        }, {});

        if (vData) setAdminVenues(vData.map((v: any) => ({ 
          ...v, 
          ownerId: v.owner_id,
          venueType: v.type,
          pricePerDay: v.price_per_day,
          availableFor: v.available_for || [],
          catalogue: v.catalogue || [],
          facilities: v.facilities || [],
          ownerName: profileMap[v.owner_id] || 'Owner',
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
          ownerName: profileMap[s.owner_id] || 'Provider',
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
    setConfirmConfig({
      isOpen: true,
      title: 'Reset All Ratings',
      message: 'Are you sure you want to reset all ratings and review counts? This will set them to 0 for all venues and services and delete all existing reviews.',
      isDanger: true,
      onConfirm: async () => {
        setLoading(true);
        try {
          // Update all venues
          const { error: vError } = await db.from('venues').update({ rating: 0, review_count: 0 }).neq('id', '00000000-0000-0000-0000-000000000000');
          // Update all service providers
          const { error: sError } = await db.from('service_providers').update({ rating: 0, review_count: 0 }).neq('id', '00000000-0000-0000-0000-000000000000');
          // Delete all reviews
          const { error: rError } = await db.from('reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          
          if (vError || sError || rError) {
            console.error('Reset error:', { vError, sError, rError });
            throw new Error('Failed to reset some data');
          }
          
          toast.success('All ratings and reviews have been reset');
        } catch (err) {
          console.error('Reset error:', err);
          toast.error('Failed to reset ratings');
        } finally {
          setLoading(false);
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const deleteNotification = async (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Notification',
      message: 'Are you sure you want to delete this notification?',
      isDanger: true,
      onConfirm: async () => {
        const { error } = await db.from('notifications').delete().eq('id', id);
        if (!error) {
          toast.success('Notification deleted');
          setNotifications(prev => prev.filter(n => n.id !== id));
        } else {
          toast.error('Failed to delete notification');
        }
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const deleteBanner = async (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Banner',
      message: 'Are you sure you want to delete this banner?',
      isDanger: true,
      onConfirm: async () => {
        console.log('Deleting banner:', id);
        const { error } = await db.from('banners').delete().eq('id', id);
        if (!error) {
          toast.success('Banner deleted');
          setBanners(prev => prev.filter(b => b.id !== id));
        } else {
          console.error('Delete banner error:', error);
          toast.error(`Failed to delete banner: ${error.message}`);
        }
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const deleteServicePhoto = async (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Service Photo',
      message: 'Are you sure you want to delete this service photo?',
      isDanger: true,
      onConfirm: async () => {
        console.log('Deleting service photo:', id);
        const { error } = await db.from('service_type_photos').delete().eq('id', id);
        if (!error) {
          toast.success('Service photo deleted');
          setServicePhotos(prev => prev.filter(p => p.id !== id));
        } else {
          console.error('Delete service photo error:', error);
          toast.error(`Failed to delete service photo: ${error.message}`);
        }
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const toggleUserStatus = async (uid: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    console.log(`Toggling user ${uid} status to ${newStatus}`);
    const { error } = await db.from('users').update({ status: newStatus }).eq('uid', uid);
    if (!error) {
      toast.success(`User ${newStatus === 'active' ? 'enabled' : 'disabled'}`);
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, status: newStatus } : u));
    } else {
      console.error('Toggle status error:', error);
      toast.error('Failed to update user status: ' + error.message);
    }
  };

  const deleteUser = async (uid: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete User',
      message: 'Are you sure you want to delete this user?',
      isDanger: true,
      onConfirm: async () => {
        const { error } = await db.from('users').delete().eq('uid', uid);
        if (!error) {
          toast.success('User deleted');
          setUsers(prev => prev.filter(u => u.uid !== uid));
        } else {
          toast.error('Failed to delete user');
        }
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const updatePlanPrice = async (id: string, newPrice: number) => {
    if (isNaN(newPrice) || newPrice < 0) {
      toast.error('Invalid price entered');
      return;
    }
    
    setLoading(true);
    try {
      console.log(`Updating plan ${id} price to ${newPrice}`);
      const { error } = await db.from('subscription_plans').update({ price: newPrice }).eq('id', id);
      
      if (error) throw error;
      
      toast.success('Plan price updated successfully');
      setPlans(prev => prev.map(p => p.id === id ? { ...p, price: newPrice } : p));
    } catch (err: any) {
      console.error('Update plan error:', err);
      toast.error('Failed to update plan price: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const togglePlanStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await db.from('subscription_plans').update({ is_active: !currentStatus }).eq('id', id);
    if (!error) {
      toast.success(`Plan ${!currentStatus ? 'enabled' : 'disabled'}`);
      fetchData();
    }
  };

  const downloadReport = async (type: 'excel' | 'pdf' = 'excel') => {
    if (activeTab === 'users') {
      const data = users.map(u => ({
        'Registration ID': u.registrationId,
        'Name': u.displayName,
        'Mobile': u.mobileNumber,
        'Email': u.email,
        'Role': u.role,
        'Status': u.status,
        'Created At': formatDateTime12h(u.createdAt)
      }));
      
      if (type === 'excel') {
        const XLSX = await import('xlsx');
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
        XLSX.writeFile(workbook, "registered_users_report.xlsx");
        toast.success('User report downloaded');
      } else {
        const { jsPDF } = await import('jspdf');
        const autoTable = (await import('jspdf-autotable')).default;
        const doc = new jsPDF();
        doc.text("Registered Users Report", 14, 15);
        autoTable(doc, {
          startY: 20,
          head: [['Reg ID', 'Name', 'Mobile', 'Email', 'Role', 'Status']],
          body: users.map(u => [u.registrationId, u.displayName, u.mobileNumber, u.email, u.role, u.status]),
        });
        doc.save("registered_users_report.pdf");
        toast.success('User report downloaded');
      }
    }
  };

  const handleAddNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotification.message) return;
    
    // Support multiple notifications separated by new lines
    const messages = newNotification.message.split('\n').filter(m => m.trim());
    
    try {
      const inserts = messages.map(msg => ({
        id: generateUUID(),
        title: newNotification.title || 'System Update',
        message: msg.trim(),
        target_role: 'all',
        is_active: true
      }));
      
      const { error } = await db.from('notifications').insert(inserts);
      if (error) {
        console.error('Add Notification Error:', error);
        
        // Retry without target_role if schema is old
        if (error.message?.includes('column "target_role" does not exist') || error.message?.includes('schema cache')) {
           const retryInserts = messages.map(msg => ({
            id: generateUUID(),
            title: newNotification.title || 'System Update',
            message: msg.trim(),
            is_active: true
          }));
          const { error: retryError } = await db.from('notifications').insert(retryInserts);
          if (retryError) throw retryError;
          toast.success(`${messages.length} notification(s) added (Legacy mode)`);
        } else {
          toast.error(`Failed to add notifications: ${error.message}`);
          throw error;
        }
      } else {
        toast.success(`${messages.length} notification(s) added`);
      }
      
      setIsNotificationModalOpen(false);
      setNewNotification({ title: '', message: '' });
      fetchData();
    } catch (err) {
      console.error('Final Notification Error:', err);
      toast.error('Failed to submit notifications. Check SQL Master Script in App.tsx');
    }
  };

  const handleAddBanners = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setLoading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const filePath = `banners/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        const { error: uploadError } = await db.storage.from('images').upload(filePath, file);
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = db.storage.from('images').getPublicUrl(filePath);
        return { id: generateUUID(), title: file.name, image_url: publicUrl, is_active: true };
      });
      
      const bannerData = await Promise.all(uploadPromises);
      const { error } = await db.from('banners').insert(bannerData);
      if (error) throw error;
      
      toast.success(`${files.length} banner(s) added`);
      fetchData();
    } catch (err) {
      toast.error('Failed to upload banners');
    } finally {
      setLoading(false);
    }
  };

  const handleAddServicePhotoUrl = async (url: string | string[]) => {
    if (!url) return;
    const urls = Array.isArray(url) ? url : [url];
    setLoading(true);
    try {
      const inserts = urls.map(u => {
        let finalType = 'image';
        if (u.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/)) finalType = 'video';
        return { 
          id: generateUUID(),
          service_type: newServicePhoto.serviceType, 
          image_url: finalType === 'image' ? u : null,
          video_url: finalType === 'video' ? u : null,
          type: finalType
        };
      });
      
      console.log('Inserting service photos:', inserts);
      const { error } = await db.from('service_type_photos').insert(inserts);
      if (error) throw error;
      toast.success(`${inserts.length} item(s) added successfully`);
      fetchData();
    } catch (err: any) {
      console.error('Service Photo Save Error:', err);
      toast.error(`Save failed: ${err.message || 'Check SQL RLS policies'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMoment = async (url: string | string[], type: 'image' | 'video' | 'gif') => {
    if (!url) return;
    const urls = Array.isArray(url) ? url : [url];
    setLoading(true);
    try {
      const inserts = urls.map(u => {
        let finalType = type;
        if (u.toLowerCase().endsWith('.gif')) finalType = 'gif';
        if (u.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/)) finalType = 'video';
        return { 
          id: generateUUID(),
          media_url: u,
          type: finalType
        };
      });

      console.log('Inserting moments:', inserts);
      const { error } = await db.from('moments').insert(inserts);
      if (error) throw error;
      toast.success(`${inserts.length} moment(s) added successfully`);
      fetchData();
    } catch (err) {
      toast.error('Failed to add moment(s)');
    } finally {
      setLoading(false);
    }
  };

  const deleteMoment = async (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Moment',
      message: 'Are you sure you want to delete this moment?',
      isDanger: true,
      onConfirm: async () => {
        const { error } = await db.from('moments').delete().eq('id', id);
        if (!error) {
          toast.success('Moment deleted');
          fetchData();
        } else {
          toast.error('Failed to delete moment');
        }
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleAddVenuePhoto = async (url: string | string[]) => {
    if (!url) return;
    const urls = Array.isArray(url) ? url : [url];
    setLoading(true);
    try {
      const inserts = urls.map(u => ({ 
        id: generateUUID(),
        image_url: u,
        venue_type: uploadVenueType
      }));
      const { error } = await db.from('venue_photos').insert(inserts);
      if (error) throw error;
      toast.success(`${inserts.length} venue photo(s) added successfully for ${uploadVenueType}`);
      fetchData();
    } catch (err: any) {
      toast.error(`Failed to add venue photo(s): ${err.message || 'Error'}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteVenuePhoto = async (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Venue Photo',
      message: 'Are you sure you want to delete this venue photo?',
      isDanger: true,
      onConfirm: async () => {
        const { error } = await db.from('venue_photos').delete().eq('id', id);
        if (!error) {
          toast.success('Venue photo deleted');
          fetchData();
        } else {
          toast.error('Failed to delete venue photo');
        }
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleEditNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNotification) return;
    
    try {
      const { error } = await db
        .from('notifications')
        .update({
          title: editingNotification.title,
          message: editingNotification.message
        })
        .eq('id', editingNotification.id);
        
      if (error) throw error;
      
      toast.success('Notification updated');
      setEditingNotification(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to update notification');
    }
  };

  const handleLogoUpload = async (url: string) => {
    if (!url) return;
    setLoading(true);
    try {
      const { error } = await db.from('admin_settings').upsert({ key: 'app_logo_url', value: url });
      if (error) throw error;
      setAppLogoUrl(url);
      toast.success('App Logo updated successfully');
      // Dispatch custom event so other components (like AppLogo) can update if they listen
      window.dispatchEvent(new CustomEvent('app_logo_updated', { detail: url }));
    } catch (err: any) {
      console.error('Logo Update Error:', err);
      toast.error(`Failed to update app logo: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const updateAdminProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profile) {
      if (adminProfile.mobileNumber.length !== 10) {
        toast.error('Mobile number must be exactly 10 digits');
        return;
      }
      try {
        // Update password in admin_settings
        if (adminProfile.password) {
          await db
            .from('admin_settings')
            .update({ value: adminProfile.password })
            .eq('key', 'admin_password');
        }
        
        // Update mobile in admin_settings
        await db
          .from('admin_settings')
          .upsert({ key: 'admin_mobile', value: adminProfile.mobileNumber });

        // Also update the users table for the admin user
        await db
          .from('users')
          .update({
            display_name: adminProfile.displayName,
            mobile_number: adminProfile.mobileNumber,
            email: adminProfile.email,
            password: adminProfile.password || profile.password
          })
          .eq('uid', user?.uid);

        const updatedProfile = {
          ...profile,
          displayName: adminProfile.displayName,
          email: adminProfile.email,
          mobileNumber: adminProfile.mobileNumber,
          password: adminProfile.password || profile.password
        };
        onUpdateProfile(updatedProfile);
        toast.success('Admin profile updated successfully');
        setAdminProfile({ ...adminProfile, password: '' });
      } catch (err) {
        toast.error('Failed to update admin profile');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Control Panel</h1>
          <div className="flex space-x-4">
            <button onClick={() => downloadReport('excel')} className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-orange-600 transition-colors">
              <Download size={18} />
              <span>Download User Report</span>
            </button>
          </div>
        </div>

        <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'settings', label: 'App Settings', icon: Settings },
            { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'plans', label: 'Subscription Plans', icon: CreditCard },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'banners', label: 'Banners', icon: LucideImage },
            { id: 'servicePhotos', label: 'Service Photos', icon: ImageIcon },
            { id: 'moments', label: 'Moments Photos', icon: Sparkles },
            { id: 'venue-photos', label: 'Venue Photos', icon: Building2 },
            { id: 'flex-download', label: 'Flex & Banner', icon: QrCode },
            { id: 'query-complaint', label: 'Query or Complaint', icon: MessageSquare },
            { id: 'profile', label: 'Admin Profile', icon: UserIcon },
            { id: 'database', label: 'Database & Security', icon: Database },
            { id: 'logout', label: 'Logout', icon: LogOut },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={async () => {
                if (tab.id === 'logout') {
                  await db.auth.signOut();
                  if (onLogout) onLogout();
                  navigate('/');
                } else {
                  setActiveTab(tab.id as any);
                }
              }}
              className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all ${
                tab.id === 'logout'
                  ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'
                  : activeTab === tab.id ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900">System Overview</h3>
                    <button 
                      onClick={resetAllRatings}
                      className="bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors flex items-center space-x-2"
                    >
                      <Trash2 size={16} />
                      <span>Reset All Ratings</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
                      <div className="flex items-center justify-between mb-4">
                        <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
                          <Users size={24} />
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Users</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${isDatabaseConnected ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {isDatabaseConnected ? 'LIVE DB' : 'MOCK DB'}
                          </span>
                        </div>
                      </div>
                      <div className="text-3xl font-black text-gray-900">{users.length}</div>
                      <div className="mt-2 text-sm text-gray-500">
                        {users.filter(u => u.role === 'owner').length} Owners | {users.filter(u => u.role === 'provider').length} Providers
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="bg-orange-50 p-3 rounded-2xl text-orange-600">
                          <Calendar size={24} />
                        </div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Bookings</span>
                      </div>
                      <div className="text-3xl font-black text-gray-900">{bookings.length}</div>
                      <div className="mt-2 text-sm text-gray-500">All time inquiries</div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="bg-yellow-50 p-3 rounded-2xl text-yellow-600">
                          <Clock size={24} />
                        </div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Bookings</span>
                      </div>
                      <div className="text-3xl font-black text-gray-900">
                        {bookings.filter(b => b.paymentStatus === 'Pending' || b.status === 'pending').length}
                      </div>
                      <div className="mt-2 text-sm text-gray-500">Awaiting payment/confirmation</div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="bg-green-50 p-3 rounded-2xl text-green-600">
                          <CheckCircle size={24} />
                        </div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Completed Successfully</span>
                      </div>
                      <div className="text-3xl font-black text-gray-900">
                        {bookings.filter(b => b.paymentStatus === 'Paid' || b.status === 'paid' || b.status === 'completed').length}
                      </div>
                      <div className="mt-2 text-sm text-gray-500">All paid bookings confirmed</div>
                    </div>
                  </div>

                    <div className="bg-orange-600 text-white p-8 rounded-[2.5rem] shadow-xl shadow-orange-200">
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="bg-white/20 p-3 rounded-2xl">
                          <Globe size={24} />
                        </div>
                        <h4 className="text-xl font-bold">Custom Domain Checklist</h4>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
                          <p className="text-sm opacity-90">Verify <span className="font-bold underline">bookmyvenue.in</span> domain pointing is configured in your DNS.</p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
                          <p className="text-sm opacity-90">Ensure your server environment has <span className="font-bold">MYSQL_HOST</span>, <span className="font-bold">MYSQL_USER</span>, and <span className="font-bold">MYSQL_PASSWORD</span> set correctly.</p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
                          <p className="text-sm opacity-90">SSL (HTTPS) is required for stable frontend-backend encryption.</p>
                        </div>
                        <div className="pt-4 mt-4 border-t border-white/20">
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">Server Info / DNS A Record</p>
                          <div className="bg-white/10 p-3 rounded-xl flex items-center justify-between">
                            <span className="font-mono text-xs">145.79.14.145</span>
                            <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-md">Primary IP</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <React.Suspense fallback={
                      <div className="h-[350px] col-span-2 flex items-center justify-center bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm text-gray-500">
                        <div className="flex flex-col items-center">
                          <Loader className="animate-spin text-orange-500 mb-3" size={32} />
                          <span className="font-medium text-sm">Loading charts and statistics...</span>
                        </div>
                      </div>
                    }>
                      <AdminCharts users={users} bookings={bookings} />
                    </React.Suspense>

                  <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Subscription Statistics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h4 className="font-bold text-gray-700 border-b pb-2">Venue Owners</h4>
                        <div className="flex justify-between items-center p-4 bg-green-50 rounded-2xl">
                          <span className="font-bold text-green-700">Active Subscriptions</span>
                          <span className="text-2xl font-black text-green-800">
                            {users.filter(u => u.role === 'owner' && subscriptions.some(s => s.userId === u.uid && s.status === 'active')).length}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-red-50 rounded-2xl">
                          <span className="font-bold text-red-700">Inactive/Unsubscribed</span>
                          <span className="text-2xl font-black text-red-800">
                            {users.filter(u => u.role === 'owner' && !subscriptions.some(s => s.userId === u.uid && s.status === 'active')).length}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-blue-50 rounded-2xl">
                          <span className="font-bold text-blue-700">Total Registered</span>
                          <span className="text-2xl font-black text-blue-800">
                            {users.filter(u => u.role === 'owner').length}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-bold text-gray-700 border-b pb-2">Service Providers</h4>
                        <div className="flex justify-between items-center p-4 bg-green-50 rounded-2xl">
                          <span className="font-bold text-green-700">Active Subscriptions</span>
                          <span className="text-2xl font-black text-green-800">
                            {users.filter(u => u.role === 'provider' && subscriptions.some(s => s.userId === u.uid && s.status === 'active')).length}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-red-50 rounded-2xl">
                          <span className="font-bold text-red-700">Inactive/Unsubscribed</span>
                          <span className="text-2xl font-black text-red-800">
                            {users.filter(u => u.role === 'provider' && !subscriptions.some(s => s.userId === u.uid && s.status === 'active')).length}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-blue-50 rounded-2xl">
                          <span className="font-bold text-blue-700">Total Registered</span>
                          <span className="text-2xl font-black text-blue-800">
                            {users.filter(u => u.role === 'provider').length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="space-y-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-100 pb-4">
                          <th className="py-4 font-bold text-gray-400 text-sm uppercase tracking-wider">User</th>
                          <th className="py-4 font-bold text-gray-400 text-sm uppercase tracking-wider">Role</th>
                          <th className="py-4 font-bold text-gray-400 text-sm uppercase tracking-wider">Registered At</th>
                          <th className="py-4 font-bold text-gray-400 text-sm uppercase tracking-wider">Status</th>
                          <th className="py-4 font-bold text-gray-400 text-sm uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {users.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage).map(u => (
                          <tr key={u.uid} className="hover:bg-gray-50 transition-colors">
                            <td className="py-4">
                              <div className="font-bold text-gray-900">{u.displayName}</div>
                              <div className="text-sm text-gray-500">{u.registrationId} | {u.mobileNumber}</div>
                            </td>
                            <td className="py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                u.role === 'owner' ? 'bg-blue-100 text-blue-600' : 
                                u.role === 'provider' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="py-4 text-sm text-gray-500 font-bold">
                              {formatDateTime12h(u.createdAt)}
                            </td>
                            <td className="py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                u.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                              }`}>
                                {u.status}
                              </span>
                            </td>
                            <td className="py-4">
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => toggleUserStatus(u.uid, u.status)} 
                                  className={`p-2 rounded-lg transition-colors ${u.status === 'active' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                                  title={u.status === 'active' ? 'Disable User' : 'Enable User'}
                                >
                                  {u.status === 'active' ? <XCircle size={18} /> : <CheckCircle size={18} />}
                                </button>
                                <button onClick={() => deleteUser(u.uid)} className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600">
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {users.length > usersPerPage && (
                    <div className="flex justify-center items-center space-x-4 pt-6">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        className="p-2 rounded-xl bg-gray-100 text-gray-600 disabled:opacity-50 hover:bg-gray-200 transition-colors"
                      >
                        <ChevronRight size={20} className="rotate-180" />
                      </button>
                      <span className="font-bold text-gray-600">
                        Page {currentPage} of {Math.ceil(users.length / usersPerPage)}
                      </span>
                      <button
                        disabled={currentPage === Math.ceil(users.length / usersPerPage)}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className="p-2 rounded-xl bg-gray-100 text-gray-600 disabled:opacity-50 hover:bg-gray-200 transition-colors"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'plans' && (
                <div className="space-y-8">
                  <div className="bg-orange-50/50 p-8 rounded-[2rem] border border-orange-100 mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Create New Subscription Plan</h3>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      setLoading(true);
                      const formData = new FormData(e.currentTarget);
                      const newPlan = {
                        id: generateUUID(),
                        name: formData.get('name') as string,
                        role: formData.get('role') as string,
                        price: parseFloat(formData.get('price') as string),
                        duration: formData.get('duration') as string,
                        benefits: (formData.get('benefits') as string).split('\n').filter(b => b.trim()),
                        is_active: true
                      };
                      
                      try {
                        const { error } = await db.from('subscription_plans').insert([newPlan]);
                        if (error) throw error;
                        toast.success('New plan created successfully');
                        (e.target as HTMLFormElement).reset();
                        fetchData();
                      } catch (err: any) {
                        toast.error('Failed to create plan: ' + err.message);
                      } finally {
                        setLoading(false);
                      }
                    }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Plan Name</label>
                        <input name="name" required placeholder="e.g. Gold Plan" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">User Role</label>
                        <select name="role" required className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none">
                          <option value="owner">Venue Owner</option>
                          <option value="provider">Service Provider</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Price (₹)</label>
                        <input name="price" type="number" required placeholder="0.00" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
                      </div>
                      <div className="lg:col-span-1">
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Duration</label>
                        <select name="duration" required className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none">
                          <option value="monthly">1 Month</option>
                          <option value="quarterly">3 Months</option>
                          <option value="half-yearly">6 Months</option>
                          <option value="yearly">1 Year</option>
                        </select>
                      </div>
                      <div className="lg:col-span-5">
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Plan Benefits (One per line)</label>
                        <textarea 
                          name="benefits" 
                          rows={3} 
                          placeholder="e.g. Premium Business Listing&#10;Unlimited Inquiries&#10;Featured Status"
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[2rem] focus:ring-2 focus:ring-orange-500 outline-none"
                        ></textarea>
                      </div>
                      <div className="lg:col-span-5 flex justify-end">
                        <button type="submit" className="bg-orange-600 text-white px-10 py-3.5 rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-200">
                          Create Subscription Plan
                        </button>
                      </div>
                    </form>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {plans.map(plan => (
                      <div key={plan.id} className="border border-gray-100 rounded-3xl p-6 hover:shadow-md transition-all bg-white relative group">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                          <p className="text-gray-500 uppercase text-xs font-bold tracking-widest">{plan.role} - {plan.duration}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          plan.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {plan.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="flex-1">
                          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Plan Price (₹)</label>
                          <div className="flex items-center space-x-2">
                            <input 
                              id={`plan-price-${plan.id}`}
                              type="number" 
                              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
                              defaultValue={plan.price}
                            />
                            <button 
                              onClick={() => {
                                const input = document.getElementById(`plan-price-${plan.id}`) as HTMLInputElement;
                                if (input) {
                                  const newPrice = parseFloat(input.value);
                                  updatePlanPrice(plan.id, newPrice);
                                }
                              }}
                              className="p-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors shadow-sm"
                              title="Update Price"
                            >
                              <Check size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => togglePlanStatus(plan.id, plan.isActive)}
                        className={`w-full py-3 rounded-xl font-bold transition-colors ${
                          plan.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                      >
                        {plan.isActive ? 'Disable Plan' : 'Enable Plan'}
                      </button>
                    </div>
                  ))}
                </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900">System Notifications</h3>
                    <button onClick={() => setIsNotificationModalOpen(true)} className="bg-orange-500 text-white px-4 py-2 rounded-xl font-bold">Add New</button>
                  </div>
                  <div className="space-y-4">
                    {notifications.map(n => (
                      <div key={n.id} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-gray-900 mb-1">{n.title}</h4>
                          <p className="text-gray-600 text-sm">{n.message}</p>
                          <div className="mt-4 text-xs text-gray-400">{formatDateDDMMYYYY(n.createdAt)} {formatTime12h(n.createdAt)}</div>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => setEditingNotification(n)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 size={20} />
                          </button>
                          <button 
                            onClick={() => deleteNotification(n.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {isNotificationModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                      <div className="bg-white rounded-3xl p-8 max-w-md w-full">
                        <h3 className="text-2xl font-bold mb-6">Add Notifications</h3>
                        <form onSubmit={handleAddNotification} className="space-y-4">
                          <div>
                            <label className="block text-sm font-bold mb-1">Common Title (Optional)</label>
                            <input type="text" className="w-full px-4 py-3 bg-gray-50 border rounded-xl" 
                              placeholder="e.g. Important Update"
                              value={newNotification.title} onChange={e => setNewNotification({...newNotification, title: e.target.value})} />
                          </div>
                          <div>
                            <label className="block text-sm font-bold mb-1">Messages (One per line)</label>
                            <textarea required className="w-full px-4 py-3 bg-gray-50 border rounded-xl" rows={5}
                              placeholder="Enter multiple messages, one on each line..."
                              value={newNotification.message} onChange={e => setNewNotification({...newNotification, message: e.target.value})} />
                          </div>
                          <div className="flex space-x-4 pt-4">
                            <button type="button" onClick={() => setIsNotificationModalOpen(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold">Cancel</button>
                            <button type="submit" className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-bold">Add All</button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {editingNotification && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                      <div className="bg-white rounded-3xl p-8 max-w-md w-full">
                        <h3 className="text-2xl font-bold mb-6">Edit Notification</h3>
                        <form onSubmit={handleEditNotification} className="space-y-4">
                          <div>
                            <label className="block text-sm font-bold mb-1">Title</label>
                            <input type="text" className="w-full px-4 py-3 bg-gray-50 border rounded-xl" 
                              value={editingNotification.title} onChange={e => setEditingNotification({...editingNotification, title: e.target.value})} />
                          </div>
                          <div>
                            <label className="block text-sm font-bold mb-1">Message</label>
                            <textarea required className="w-full px-4 py-3 bg-gray-50 border rounded-xl" rows={5}
                              value={editingNotification.message} onChange={e => setEditingNotification({...editingNotification, message: e.target.value})} />
                          </div>
                          <div className="flex space-x-4 pt-4">
                            <button type="button" onClick={() => setEditingNotification(null)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold">Cancel</button>
                            <button type="submit" className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-bold">Update</button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'banners' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900">Home Page Banners</h3>
                    <label className="cursor-pointer bg-orange-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-orange-600 transition-all">
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleAddBanners(e.target.files)}
                      />
                      Add Multiple Banners
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {banners.map(b => (
                      <div key={b.id} className="group relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                        <img src={resolveUrl(b.imageUrl)} alt="Banner" className="w-full h-48 object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            onClick={() => deleteBanner(b.id)}
                            className="bg-white text-red-600 p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
                          >
                            <Trash2 size={24} />
                          </button>
                        </div>
                        <div className="p-3 bg-white">
                          <p className="text-xs font-bold text-gray-500 truncate">{b.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'servicePhotos' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Service Type Photos & Videos</h3>
                    <div className="flex items-center space-x-4">
                      <select 
                        className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-orange-500"
                        value={newServicePhoto.serviceType}
                        onChange={(e) => setNewServicePhoto({...newServicePhoto, serviceType: e.target.value as ServiceType})}
                      >
                        {SERVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-orange-50/50 p-8 rounded-[2rem] border border-orange-100 mb-8">
                    <div className="space-y-4">
                      <p className="text-sm font-bold text-orange-600">Selected Category: <span className="uppercase">{newServicePhoto.serviceType}</span></p>
                      <ImageUpload 
                        label="Upload Photo or GIF" 
                        multiple={true}
                        onUpload={(url) => handleAddServicePhotoUrl(url)} 
                      />
                    </div>
                    <div className="space-y-4">
                      <p className="text-sm font-bold text-orange-600">Selected Category: <span className="uppercase">{newServicePhoto.serviceType}</span></p>
                      <VideoUpload 
                        label="Upload Video (Max 60s)" 
                        onUpload={(url) => handleAddServicePhotoUrl(url)} 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {servicePhotos.map(p => (
                      <div key={p.id} className="group relative aspect-video rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white">
                        {p.imageUrl.includes('.mp4') || p.imageUrl.includes('video') ? (
                          <video 
                            src={resolveUrl(p.imageUrl)} 
                            className="w-full h-full object-cover cursor-pointer" 
                            loop 
                            onClick={e => {
                              if (e.currentTarget.paused) e.currentTarget.play();
                              else e.currentTarget.pause();
                            }} 
                          />
                        ) : (
                          <img src={resolveUrl(p.imageUrl)} alt={p.serviceType} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                          <p className="text-[10px] font-black text-white uppercase tracking-wider truncate">{p.serviceType}</p>
                        </div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                          <button 
                            onClick={() => {
                              // To update, we just set the type in the dropdown and let them re-upload
                              setNewServicePhoto({ ...newServicePhoto, serviceType: p.serviceType });
                              toast(`Selected ${p.serviceType}. Upload a new photo to replace this one.`);
                            }}
                            className="bg-white text-orange-600 p-2 rounded-full shadow-lg hover:bg-orange-50 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => deleteServicePhoto(p.id)}
                            className="bg-white text-red-600 p-2 rounded-full shadow-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'moments' && (
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Special Moments</h3>
                      <p className="text-sm text-gray-500">Highlight photos and videos of your best events</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-orange-50/50 p-8 rounded-[2rem] border border-orange-100">
                    <ImageUpload 
                      label="Upload Highlight Photo/GIF" 
                      multiple={true}
                      onUpload={(url) => handleAddMoment(url, 'image')} 
                    />
                    <VideoUpload 
                      label="Upload Highlight Video (Max 60s)" 
                      onUpload={(url) => handleAddMoment(url, 'video')} 
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {moments.map(m => (
                      <div key={m.id} className="group relative aspect-square rounded-[1.5rem] overflow-hidden border border-gray-100 shadow-sm bg-white">
                        {m.type === 'video' || m.media_url.includes('.mp4') ? (
                          <video 
                            src={resolveUrl(m.media_url)} 
                            className="w-full h-full object-cover cursor-pointer" 
                            loop 
                            onClick={e => {
                              if (e.currentTarget.paused) e.currentTarget.play();
                              else e.currentTarget.pause();
                            }} 
                          />
                        ) : (
                          <img src={resolveUrl(m.media_url)} alt="Moment" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            onClick={() => deleteMoment(m.id)}
                            className="bg-white text-red-600 p-2 rounded-full shadow-lg hover:bg-red-50"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {moments.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                      <Sparkles size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">No moments uploaded yet.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'venue-photos' && (
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Venue Photos (Category-Wise)</h3>
                      <p className="text-sm text-gray-500">Upload and manage background photos category-wise for the "Join us as venue owner" homepage section.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Upload Section */}
                    <div className="lg:col-span-1 bg-orange-50/50 p-6 rounded-[2rem] border border-orange-100/80 space-y-5">
                      <div>
                        <label className="block text-sm font-black text-orange-800 mb-2">1. Select Venue Category</label>
                        <select
                          value={uploadVenueType}
                          onChange={(e) => setUploadVenueType(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-orange-200 bg-white text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="Marriage Garden">Marriage Garden</option>
                          <option value="Marriage Hall">Marriage Hall</option>
                          <option value="Hotel">Hotel</option>
                          <option value="Resort">Resort</option>
                          <option value="Community Hall">Community Hall</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-black text-orange-800">2. Upload Photo(s)</label>
                        <p className="text-xs text-orange-700/80">Selected category: <strong className="font-extrabold">{uploadVenueType}</strong></p>
                        <ImageUpload 
                          label={`Upload for ${uploadVenueType}`} 
                          multiple={true}
                          onUpload={(url) => handleAddVenuePhoto(url)} 
                        />
                      </div>
                    </div>

                    {/* Filter and Gallery Section */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Filter Bar */}
                      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-gray-100">
                        <span className="text-xs font-black uppercase text-gray-400 mr-2">Filter Category:</span>
                        {['All', 'Marriage Garden', 'Marriage Hall', 'Hotel', 'Resort', 'Community Hall'].map((cat) => {
                          const isSelected = adminVenuePhotoFilter === cat;
                          return (
                            <button
                              key={cat}
                              onClick={() => setAdminVenuePhotoFilter(cat)}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                                isSelected
                                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/10'
                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                              }`}
                            >
                              {cat}
                            </button>
                          );
                        })}
                      </div>

                      {/* Photo Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {venuePhotos
                          .filter(p => adminVenuePhotoFilter === 'All' || (p.venue_type || 'Marriage Garden') === adminVenuePhotoFilter)
                          .map(p => (
                            <div key={p.id} className="group relative aspect-video rounded-[1.5rem] overflow-hidden border border-gray-100 shadow-sm bg-white">
                              <img src={resolveUrl(p.image_url)} alt="Venue Photo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              
                              {/* Category Badge overlay */}
                              <div className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur-sm text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                                {p.venue_type || 'Marriage Garden'}
                              </div>

                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button 
                                  onClick={() => deleteVenuePhoto(p.id)}
                                  className="bg-white text-red-600 p-2.5 rounded-full shadow-lg hover:bg-red-50 transition-colors"
                                  title="Delete Photo"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>

                      {venuePhotos.filter(p => adminVenuePhotoFilter === 'All' || (p.venue_type || 'Marriage Garden') === adminVenuePhotoFilter).length === 0 && (
                        <div className="text-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                          <LucideImage size={40} className="mx-auto text-gray-300 mb-3" />
                          <p className="text-gray-500 text-sm font-medium">No custom photos uploaded yet under {adminVenuePhotoFilter === 'All' ? 'any category' : `"${adminVenuePhotoFilter}"`}.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="max-w-4xl mx-auto space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-gray-900">App Branding</h3>
                      <p className="text-gray-500">Update the application logo and other visual assets that appear throughout the platform.</p>
                      
                      <div className="bg-orange-50 p-8 rounded-[2.5rem] border border-orange-100 flex flex-col items-center space-y-6">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-orange-200">
                          <img 
                            src={resolveUrl(appLogoUrl)} 
                            alt="Current App Logo" 
                            className="h-32 w-auto object-contain" 
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/logo.png';
                            }}
                          />
                        </div>
                        <div className="w-full text-center py-4 bg-orange-100 rounded-2xl border-2 border-orange-200">
                          <p className="text-sm text-orange-800 font-bold uppercase tracking-wider">
                            Logo Specifications:
                          </p>
                          <p className="text-lg font-black text-orange-900 mt-1">
                            Taller (1:2 Aspect Ratio)
                          </p>
                          <p className="text-xs text-orange-700 font-medium">
                            Example: 512x1024px Recommended
                          </p>
                        </div>
                        <div className="w-full">
                          <ImageUpload 
                            label="Upload New App Logo" 
                            onUpload={handleLogoUpload} 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-gray-900">Maintenance & Security</h3>
                      <p className="text-gray-500">Global system controls and security configurations.</p>

                      <div className="bg-orange-50 p-8 rounded-[2.5rem] border border-orange-100 flex flex-col space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-orange-900">Subscription Requirement</h4>
                            <p className="text-sm text-orange-700">Toggle if users need a paid plan to receive bookings.</p>
                          </div>
                          <button 
                            onClick={async () => {
                              const newValue = globalSettings.subscriptionEnabled ? 'false' : 'true';
                              // Use upsert for admin_settings
                              const { error } = await db.from('admin_settings').upsert({ key: 'subscription_enabled', value: newValue });
                              if (!error) {
                                setGlobalSettings((prev: any) => ({...prev, subscriptionEnabled: newValue === 'true'}));
                                toast.success(`Subscriptions ${newValue === 'true' ? 'Enabled' : 'Disabled'}`);
                              }
                            }}
                            className={cn(
                              "w-14 h-7 rounded-full relative transition-all duration-300",
                              globalSettings.subscriptionEnabled ? "bg-orange-600" : "bg-gray-300"
                            )}
                          >
                            <div className={cn(
                              "absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300",
                              globalSettings.subscriptionEnabled ? "left-8" : "left-1"
                            )} />
                          </button>
                        </div>
                      </div>

                      <div className="bg-red-50 p-8 rounded-[2.5rem] border border-red-100 space-y-6">
                        <div className="flex items-center space-x-4 text-red-700">
                          <AlertCircle size={24} />
                          <h4 className="font-bold">Danger Zone</h4>
                        </div>
                        <button 
                          onClick={resetAllRatings}
                          className="w-full bg-white text-red-600 py-4 rounded-2xl font-bold border-2 border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all flex items-center justify-center space-x-2"
                        >
                          <Trash2 size={20} />
                          <span>Wipe All Reviews & Ratings</span>
                        </button>
                        <p className="text-xs text-red-500 text-center">This action cannot be undone. All user-submitted reviews will be permanently deleted.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="max-w-md mx-auto">
                  <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 mb-8">
                    <h4 className="text-orange-800 font-bold mb-2">Admin Profile Overview</h4>
                    <div className="space-y-2 text-sm text-orange-700">
                      <div className="flex justify-between"><span>Name:</span> <span className="font-bold">{profile?.displayName}</span></div>
                      <div className="flex justify-between"><span>Email:</span> <span className="font-bold">{profile?.email}</span></div>
                      <div className="flex justify-between"><span>Mobile:</span> <span className="font-bold">{profile?.mobileNumber}</span></div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Update Admin Profile</h3>
                  <form onSubmit={updateAdminProfile} className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Display Name</label>
                      <input required type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500" 
                        value={adminProfile.displayName} onChange={e => setAdminProfile({...adminProfile, displayName: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                      <input required type="email" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500" 
                        value={adminProfile.email} onChange={e => setAdminProfile({...adminProfile, email: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Mobile Number (For Recovery)</label>
                      <input required type="tel" maxLength={10} pattern="[0-9]{10}" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500" 
                        value={adminProfile.mobileNumber} onChange={e => setAdminProfile({...adminProfile, mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10)})} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">New Password (Optional)</label>
                      <input type="password" placeholder="Enter new password to change" 
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500" 
                        value={adminProfile.password} onChange={e => setAdminProfile({...adminProfile, password: e.target.value})} />
                    </div>
                    <button type="submit" className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-200">
                      Update Profile
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'flex-download' && (
                <FlexBannerDownloadView venues={adminVenues} services={adminServices} />
              )}

              {activeTab === 'query-complaint' && (
                <React.Suspense fallback={
                  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mb-4"></div>
                    <span className="text-sm font-bold text-gray-500">Loading Query & Complaint Portal...</span>
                  </div>
                }>
                  <QueryComplaintView user={user} profile={profile} />
                </React.Suspense>
              )}

              {activeTab === 'database' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className={`p-8 rounded-[2.5rem] border-2 shadow-sm ${isDatabaseConnected ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                      <div className="flex items-center justify-between mb-6">
                        <div className={`p-4 rounded-2xl ${isDatabaseConnected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                          <Database size={24} />
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${isDatabaseConnected ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'}`}>
                          {isDatabaseConnected ? 'CONNECTED' : 'OFFLINE'}
                        </span>
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">MySQL Connectivity</h4>
                      <p className="text-sm text-gray-600 leading-relaxed mb-6">
                        {isDatabaseConnected 
                          ? 'App is currently communicating with live MySQL database environment.' 
                          : 'App is running in Offline/Mock mode. Check environment variables.'}
                      </p>
                      <button 
                        onClick={async () => {
                          const { error } = await db.from('users').select('count', { count: 'exact', head: true });
                          if (error) toast.error(`Health check failed: ${error.message}`);
                          else toast.success('Database responding correctly!');
                        }}
                        className="w-full bg-white border-2 border-gray-100 py-3 rounded-2xl font-bold text-gray-900 hover:bg-gray-50 transition-all"
                      >
                        Run Connection Test
                      </button>
                    </div>

                    <div className="p-8 rounded-[2.5rem] border-2 border-blue-100 bg-blue-50 shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <div className="bg-blue-500 p-4 rounded-2xl text-white">
                          <Shield size={24} />
                        </div>
                        <span className="text-xs font-bold text-blue-700 bg-blue-200 px-3 py-1 rounded-full uppercase tracking-tighter">Secure</span>
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">MySQL Master Script</h4>
                      <p className="text-sm text-gray-600 leading-relaxed mb-6">
                        Ensure your MySQL database has all required tables by running this script in your database manager (phpMyAdmin).
                      </p>
                      <button 
                        onClick={() => {
                          const script = document.getElementById('sql-master-script-hidden')?.innerText || '';
                          navigator.clipboard.writeText(script);
                          toast.success('SQL Script copied!');
                        }}
                        className="w-full bg-blue-600 text-white py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                      >
                        Copy SQL Script
                      </button>
                    </div>

                    <div className="p-8 rounded-[2.5rem] border-2 border-orange-100 bg-orange-50 shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <div className="bg-orange-500 p-4 rounded-2xl text-white">
                          <Settings size={24} />
                        </div>
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">MySQL Settings</h4>
                      <p className="text-sm text-gray-600 leading-relaxed mb-6">
                        Verify your settings if connection is intermittent.
                      </p>
                      <ul className="text-xs text-orange-800 space-y-2 font-medium">
                        <li>• Enable Remote MySQL on your hosting provider</li>
                        <li>• Whitelist outbound IP address</li>
                        <li>• Ensure credentials (host, database, user, pass) match perfectly</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-gray-900 rounded-[2rem] p-8 shadow-2xl">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-white font-bold">SQL Setup Preview</h4>
                      <span className="text-gray-500 text-xs font-mono">schema_v1.0.sql</span>
                    </div>
                    <pre id="sql-master-script-hidden" className="text-green-400 font-mono text-[10px] h-64 overflow-y-auto custom-scrollbar">
{`-- MYSQL MASTER SQL SETUP
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.users (
    uid TEXT PRIMARY KEY,
    registration_id TEXT UNIQUE,
    display_name TEXT,
    mobile_number TEXT UNIQUE,
    email TEXT,
    role TEXT,
    status TEXT DEFAULT 'active',
    password TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES public.users(uid) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    venue_type TEXT,
    capacity INTEGER,
    price_per_day NUMERIC,
    rating NUMERIC DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    images TEXT[],
    video_url TEXT,
    address TEXT,
    pincode TEXT,
    state TEXT,
    district TEXT,
    block TEXT,
    facilities TEXT[],
    facility_details JSONB,
    available_for TEXT[],
    site_levels TEXT[],
    latitude NUMERIC,
    longitude NUMERIC,
    catalogue TEXT[]
);

CREATE TABLE IF NOT EXISTS public.service_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES public.users(uid) ON DELETE CASCADE,
    name TEXT NOT NULL,
    service_type TEXT,
    description TEXT,
    price_range TEXT,
    price_level TEXT,
    rating NUMERIC DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    images TEXT[],
    video_url TEXT,
    pincode TEXT,
    state TEXT,
    district TEXT,
    block TEXT,
    facilities TEXT[],
    facility_details JSONB,
    available_for TEXT[],
    latitude NUMERIC,
    longitude NUMERIC,
    catalogue TEXT[]
);

CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT,
    owner_id TEXT,
    visitor_name TEXT,
    visitor_mobile TEXT,
    target_id UUID,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    image_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    message TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.complaints (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    sender_name VARCHAR(255),
    sender_mobile VARCHAR(50),
    sender_address TEXT,
    category VARCHAR(100),
    detail TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    remark TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`}
                    </pre>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        isDanger={confirmConfig.isDanger}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

const VenueListView = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [selectedState, setSelectedState] = useState(searchParams.get('state') || '');
  const [selectedDistrict, setSelectedDistrict] = useState(searchParams.get('district') || '');
  const [selectedBlock, setSelectedBlock] = useState(searchParams.get('block') || '');

  const states = Object.keys(LOCATION_DATA || {});
  const districts = selectedState ? Object.keys(LOCATION_DATA[selectedState] || {}) : [];
  const blocks = (selectedState && selectedDistrict && LOCATION_DATA[selectedState]) ? (LOCATION_DATA[selectedState][selectedDistrict] || []) : [];

  useEffect(() => {
    let ignore = false;
    const fetchVenues = async () => {
      setLoading(true);
      const [venuesRes, usersRes] = await Promise.all([
        db.from('venues').select('*'),
        db.from('users').select('*').eq('role', 'owner')
      ]);
      
      const venuesData = venuesRes.data || [];
      const usersData = usersRes.data || [];

      if (ignore) return;

      let data = venuesData.map(d => ({
        id: d.id,
        ownerId: d.owner_id,
        name: d.name,
        venueType: d.type,
        state: d.state,
        district: d.district,
        block: d.block,
        pincode: d.pincode,
        address: d.address,
        capacity: d.capacity,
        pricePerDay: d.price_per_day,
        description: d.description,
        images: d.images,
        facilities: d.facilities,
        rating: d.rating,
        reviewCount: d.review_count,
        catalogue: d.catalogue,
        createdAt: d.created_at
      } as Venue));

      // Add users who don't have a venue record yet
      const existingOwnerIds = new Set(venuesData.map(d => d.owner_id));
      const synthVenues = usersData
        .filter(u => !existingOwnerIds.has(u.uid))
        .map(u => ({
          id: 'synth_' + u.uid,
          ownerId: u.uid,
          name: (u.display_name || 'Business') + "'s Venue",
          venueType: (u.venue_type || 'marriage garden') as VenueType,
          state: u.state,
          district: u.district,
          block: u.block,
          pincode: u.pincode,
          address: `${u.block}, ${u.district}, ${u.state}`,
          capacity: 0,
          pricePerDay: 0,
          description: `A registered ${u.venue_type || 'Venue'} on BVO. Professional and ready to host your event.`,
          images: u.photo_url ? [u.photo_url] : ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800'],
          facilities: [],
          rating: 0,
          reviewCount: 0,
          createdAt: u.created_at
        } as Venue));

      data = [...data, ...synthVenues];
      
      const type = searchParams.get('type')?.toLowerCase();
      const search = searchParams.get('search')?.toLowerCase();

      if (type) {
        const lowerType = type.toLowerCase();
        data = data.filter(v => {
          const vType = (v.venueType?.toLowerCase() || '');
          return vType === lowerType || vType.includes(lowerType) || lowerType.includes(vType);
        });
      }
      if (search) {
        data = data.filter(v => 
          (v.name?.toLowerCase() || '').includes(search) || 
          (v.venueType?.toLowerCase() || '').includes(search)
        );
      }

      if (selectedState) data = data.filter(v => v.state === selectedState);
      if (selectedDistrict) data = data.filter(v => v.district === selectedDistrict);
      if (selectedBlock) data = data.filter(v => v.block === selectedBlock);

      setVenues(data);
      setLoading(false);
    };
    fetchVenues();
    return () => { ignore = true; };
  }, [searchParams, selectedState, selectedDistrict, selectedBlock]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Available Venues</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full md:w-auto">
          <select 
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              setSelectedDistrict('');
              setSelectedBlock('');
            }}
            className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none shadow-sm"
          >
            <option value="">All States</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select 
            value={selectedDistrict}
            onChange={(e) => {
              setSelectedDistrict(e.target.value);
              setSelectedBlock('');
            }}
            disabled={!selectedState}
            className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none disabled:opacity-50 shadow-sm"
          >
            <option value="">All Districts</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select 
            value={selectedBlock}
            onChange={(e) => setSelectedBlock(e.target.value)}
            disabled={!selectedDistrict}
            className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none disabled:opacity-50 shadow-sm"
          >
            <option value="">All Blocks</option>
            {blocks.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="bg-gray-100 h-80 rounded-2xl animate-pulse" />)}
        </div>
      ) : venues.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {venues.map(v => <VenueCard key={v.id} venue={v} />)}
        </div>
      ) : (
        <div className="text-center py-20">
          <AlertCircle size={64} className="mx-auto text-gray-200 mb-4" />
          <h3 className="text-2xl font-bold text-gray-400">No venues found matching your criteria</h3>
        </div>
      )}
    </div>
  );
};

const PrivacyView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const fromRegistration = location.state?.fromRegistration;

  return (
    <div className="max-w-4xl mx-auto px-4 py-32">
      {fromRegistration && (
        <button 
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center text-orange-600 font-bold hover:text-orange-700 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Go Back to Registration
        </button>
      )}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose max-w-none text-gray-700 space-y-6">
          <p>At Best Venue Option, we prioritize your privacy. This policy outlines how we handle your data.</p>
          <h2 className="text-2xl font-bold text-gray-900 mt-8">1. Information We Collect</h2>
          <p>We collect information you provide directly to us during registration, such as your name, mobile number, and business details.</p>
          <h2 className="text-2xl font-bold text-gray-900 mt-8">2. How We Use Your Information</h2>
          <p>Your information is used to provide our services, connect you with visitors, and improve your experience on our platform.</p>
          <h2 className="text-2xl font-bold text-gray-900 mt-8">3. Data Security</h2>
          <p>We implement industry-standard security measures to protect your data from unauthorized access.</p>
        </div>
      </div>
    </div>
  );
};

const PricingView = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await db.from('subscription_plans').select('*').eq('is_active', true);
        if (error) throw error;
        if (data) {
          setPlans(data.map((d: any) => ({
            id: d.id,
            name: d.name,
            price: d.price,
            duration: d.duration,
            benefits: d.benefits || [],
            role: d.role,
            isActive: d.is_active,
            createdAt: d.created_at
          })));
        }
      } catch (err) {
        console.error('Error fetching pricing plans:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-32">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-4 tracking-tighter uppercase">Subscription Plans</h1>
        <p className="text-xl text-gray-500">Simple, transparent pricing for growing your business.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <div key={plan.id} className={cn(
              "bg-white rounded-[3rem] p-10 border-2 transition-all hover:scale-[1.02] flex flex-col",
              i === 1 ? "border-orange-500 shadow-2xl shadow-orange-100 scale-105 relative z-10" : "border-gray-100 shadow-xl"
            )}>
              {i === 1 && <span className="absolute top-0 right-10 -translate-y-1/2 bg-orange-600 text-white px-6 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">Most Popular</span>}
              <div className="mb-2 flex justify-between items-start">
                <h3 className="text-2xl font-black uppercase">{plan.name}</h3>
                <span className="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded-md uppercase text-gray-500">{plan.role}</span>
              </div>
              <div className="mb-8">
                <span className="text-5xl font-black">₹{plan.price}</span>
                <span className="text-gray-500 ml-2 font-bold tracking-tight">/{plan.duration}</span>
              </div>
              <ul className="space-y-4 mb-10 flex-grow">
                {plan.benefits.map((b, idx) => (
                  <li key={idx} className="flex items-center text-gray-600 font-medium text-sm">
                    <CheckCircle size={18} className="text-green-500 mr-3 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => navigate('/login')}
                className={cn(
                  "w-full py-5 rounded-[1.5rem] font-black text-lg transition-all shadow-lg",
                  i === 1 ? "bg-orange-600 text-white hover:bg-orange-700 shadow-orange-200" : "bg-gray-900 text-white hover:bg-black shadow-gray-200"
                )}
              >
                Get Started Now
              </button>
            </div>
          ))}
          {plans.length === 0 && (
            <div className="col-span-full text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
              <p className="text-gray-500 font-bold">No active plans available at the moment. Please check back later.</p>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-20 text-center">
        <button onClick={() => navigate('/login')} className="text-gray-400 font-bold hover:text-gray-600 transition-colors uppercase tracking-wider text-sm">
          Already have an account? Login here
        </button>
      </div>
    </div>
  );
};

const ServiceListView = ({ user }: { user: any }) => {
  const [services, setServices] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [selectedState, setSelectedState] = useState(searchParams.get('state') || '');
  const [selectedDistrict, setSelectedDistrict] = useState(searchParams.get('district') || '');
  const [selectedBlock, setSelectedBlock] = useState(searchParams.get('block') || '');

  const states = Object.keys(LOCATION_DATA || {});
  const districts = selectedState ? Object.keys(LOCATION_DATA[selectedState] || {}) : [];
  const blocks = (selectedState && selectedDistrict && LOCATION_DATA[selectedState]) ? (LOCATION_DATA[selectedState][selectedDistrict] || []) : [];

  useEffect(() => {
    let ignore = false;
    const fetchServices = async () => {
      const [providersRes, usersRes] = await Promise.all([
        db.from('service_providers').select('*'),
        db.from('users').select('*').eq('role', 'provider')
      ]);
      
      const servicesData = providersRes.data || [];
      const usersData = usersRes.data || [];

      if (ignore) return;

      let data = servicesData.map(d => ({
        id: d.id,
        ownerId: d.owner_id || d.provider_id,
        providerId: d.owner_id || d.provider_id,
        name: d.name,
        serviceType: d.service_type || d.type,
        state: d.state,
        district: d.district,
        block: d.block,
        experience: d.experience,
        priceRange: d.price_range,
        description: d.description,
        images: d.images,
        rating: d.rating,
        reviewCount: d.review_count,
        createdAt: d.created_at
      } as ServiceProvider));

      // Add users who don't have a service record yet
      const existingProviderIds = new Set(servicesData.map(d => d.provider_id));
      const synthServices = usersData
        .filter(u => !existingProviderIds.has(u.uid))
        .map(u => ({
          id: 'synth_' + u.uid,
          providerId: u.uid,
          name: u.display_name,
          serviceType: (u.service_type || 'dj and sound service') as ServiceType,
          state: u.state,
          district: u.district,
          block: u.block,
          experience: 'Professional',
          priceRange: 'Contact for details',
          description: `Registered ${u.service_type || 'service provider'} on BVO platform. Contact for bookings and details.`,
          images: u.photo_url ? [u.photo_url] : ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800'],
          rating: 0,
          reviewCount: 0,
          createdAt: u.created_at
        } as ServiceProvider));

      data = [...data, ...synthServices];
      
      const type = searchParams.get('type')?.toLowerCase();
      const search = searchParams.get('search')?.toLowerCase();

      if (type) {
        const lowerType = type.toLowerCase();
        data = data.filter(s => {
          const sType = (s.serviceType?.toLowerCase() || '');
          return sType === lowerType || sType.includes(lowerType) || lowerType.includes(sType);
        });
      }
      if (search) {
        data = data.filter(s => 
          (s.name?.toLowerCase() || '').includes(search) || 
          (s.serviceType?.toLowerCase() || '').includes(search)
        );
      }

      if (selectedState) data = data.filter(s => s.state === selectedState);
      if (selectedDistrict) data = data.filter(s => s.district === selectedDistrict);
      if (selectedBlock) data = data.filter(s => s.block === selectedBlock);

      setServices(data);
      setLoading(false);
    };
    fetchServices();
    return () => { ignore = true; };
  }, [searchParams, selectedState, selectedDistrict, selectedBlock]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Event Services</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full md:w-auto">
          <select 
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              setSelectedDistrict('');
              setSelectedBlock('');
            }}
            className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none shadow-sm"
          >
            <option value="">All States</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select 
            value={selectedDistrict}
            onChange={(e) => {
              setSelectedDistrict(e.target.value);
              setSelectedBlock('');
            }}
            disabled={!selectedState}
            className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none disabled:opacity-50 shadow-sm"
          >
            <option value="">All Districts</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select 
            value={selectedBlock}
            onChange={(e) => setSelectedBlock(e.target.value)}
            disabled={!selectedDistrict}
            className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none disabled:opacity-50 shadow-sm"
          >
            <option value="">All Blocks</option>
            {blocks.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {loading ? (
          [1, 2, 3, 4].map(i => <div key={i} className="bg-gray-100 h-64 rounded-2xl animate-pulse" />)
        ) : (
          services.map(s => <ServiceCard key={s.id} service={s} />)
        )}
      </div>
    </div>
  );
};

const CookiePolicyBanner = () => {
  const [show, setShow] = useState(!localStorage.getItem('cookieConsent'));
  
  if (!show) return null;

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-6 left-6 right-6 z-[100] md:max-w-md"
    >
      <div className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 flex flex-col space-y-4">
        <div className="flex items-center space-x-3 text-orange-600">
          <Shield size={24} />
          <h4 className="font-black uppercase tracking-tight">Cookie Policy</h4>
        </div>
        <p className="text-gray-600 text-sm font-medium">
          We use cookies to enhance your event booking experience. By continuing to use BVO, you agree to our data policy.
        </p>
        <div className="flex space-x-2">
          <button 
            onClick={() => {
              localStorage.setItem('cookieConsent', 'true');
              setShow(false);
            }}
            className="flex-1 bg-gray-900 text-white py-3 rounded-2xl font-bold hover:bg-black transition-all"
          >
            Accept
          </button>
          <Link 
            to="/privacy" 
            className="px-6 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-600 hover:bg-gray-100 transition-all text-sm flex items-center justify-center"
          >
            Read More
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

const BVOAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const helpOptions = [
    { label: "How to Register?", action: () => { setStep(1); } },
    { label: "Login Issues", action: () => { setStep(2); } },
    { label: "Book a Venue", action: () => { navigate('/search?type=marriage+garden'); setIsOpen(false); } },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[101]">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-72 md:w-80 bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
          >
            <div className="bg-orange-600 p-6 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bot size={24} />
                <h4 className="font-bold">BVO Assistant</h4>
              </div>
              <button onClick={() => setIsOpen(false)}><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
              {step === 0 && (
                <>
                  <p className="text-gray-600 font-medium">Hi! How can I help you today with Best Venue Option?</p>
                  <div className="space-y-2">
                    {helpOptions.map(opt => (
                      <button 
                        key={opt.label}
                        onClick={opt.action}
                        className="w-full text-left p-3 rounded-xl bg-orange-50 text-orange-700 font-bold text-sm border border-orange-100 hover:bg-orange-100 transition-all"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
              {step === 1 && (
                <div className="space-y-4 text-sm">
                  <p className="text-gray-700">Registration is simple! Click the **Register** button in the header, choose your role (Owner, Provider, or User), and fill in your details.</p>
                  <button onClick={() => setStep(0)} className="text-orange-600 font-bold">← Back</button>
                </div>
              )}
              {step === 2 && (
                <div className="space-y-4 text-sm">
                  <p className="text-gray-700">If you're having trouble logging in, ensure your mobile number is registered and you're using the correct password. You can also contact support.</p>
                  <button onClick={() => setStep(0)} className="text-orange-600 font-bold">← Back</button>
                </div>
              )}
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Powered by BVO Support</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-orange-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-orange-700 transition-all hover:rotate-12 transform"
      >
        <MessageCircle size={32} />
      </button>
    </div>
  );
};
