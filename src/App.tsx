/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, useState, useEffect, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { 
  HashRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useNavigate, 
  useParams,
  useSearchParams,
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
  AlertCircle,
  IndianRupee,
  ChevronRight,
  ChevronDown,
  Filter,
  Trash2,
  Edit2,
  Image as ImageIcon,
  Image,
  Loader,
  Check,
  Phone,
  Upload,
  Palette,
  Sparkles,
  Briefcase,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  Download,
  BarChart2,
  XCircle,
  Info,
  Shirt,
  WashingMachine,
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
  FileText,
  LayoutDashboard,
  Lightbulb,
  ChefHat,
  PersonStanding,
  HandHelping,
  Layout,
  Users2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast, Toaster } from 'react-hot-toast';
import { format } from 'date-fns';

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

import { supabase } from './supabase';
import { locations } from './data/locations';
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
    whyPlanTitle: "Why Plan with BOOK MY VANUE?",
    verifiedPartners: "Verified Partners",
    bestPrices: "Best Prices",
    support247: "24/7 Support",
    footerCopyright: "© 2026 BOOK MY VANUE India. All rights reserved.",
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
    whyPlanTitle: "BOOK MY VANUE के साथ योजना क्यों बनाएं?",
    verifiedPartners: "सत्यापित भागीदार",
    bestPrices: "सर्वोत्तम मूल्य",
    support247: "24/7 सहायता",
    footerCopyright: "© 2026 BOOK MY VANUE इंडिया। सर्वाधिकार सुरक्षित।",
    joinAsOwner: "वेन्यू मालिक के रूप में जुड़ें",
    joinAsProvider: "सेवा प्रदाता के रूप में जुड़ें",
    register: "पंजीकरण करें",
    termsAndConditions: "नियम और शर्तें",
    helpCenter: "सहायता केंद्र",
    contactUs: "संपर्क करें",
    loginNow: "अभी लॉगिन करें"
  }
};

const LanguageContext = React.createContext({
  lang: 'en',
  setLang: (lang: string) => {},
  t: (key: string) => key
});

const useTranslation = () => React.useContext(LanguageContext);

// --- Location Data ---
const LOCATION_DATA = locations;

import { CNZLogo } from './components/CNZLogo';
import { PoweredByCNZ } from './components/PoweredByCNZ';
import { UserProfile, Venue, ServiceProvider, Booking, UserRole, VenueType, Review, CatalogueItem, CatalogueLevel, SubscriptionPlan, UserSubscription, AppBanner, AppNotification, ServiceType, ServiceTypePhoto } from './types';

declare var Razorpay: any;

// --- Error Handling ---

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
      userId: undefined, // We'll get this from supabase if needed
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
  const [visitorName, setVisitorName] = useState('');
  const [visitorMobile, setVisitorMobile] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }
    if (!user && !visitorName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!user && !visitorMobile.trim()) {
      toast.error('Please enter your mobile number');
      return;
    }
    if (!user && !/^\d{10}$/.test(visitorMobile)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsSubmitting(true);
    try {
      const feedbackData = {
        user_id: user?.uid || 'visitor',
        user_name: user?.displayName || visitorName,
        visitor_mobile: user?.mobileNumber || visitorMobile,
        rating,
        comment,
        created_at: new Date().toISOString()
      };
      console.log('Submitting app feedback:', feedbackData);
      const { error } = await supabase.from('app_feedback').insert([feedbackData]);
      if (error) throw error;
      
      toast.success('Thank you for your feedback!', {
        duration: 5000,
        icon: '🌟',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      
      setComment('');
      setVisitorName('');
      setVisitorMobile('');
      setRating(5);
      setIsSuccess(true);
      console.log('App feedback submitted successfully');
      
      // Close after 5 seconds of showing success message
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 5000);
    } catch (err) {
      toast.error('Failed to submit feedback');
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
              <h3 className="text-2xl font-bold text-gray-900">Rate Our App</h3>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

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
                    value={visitorMobile}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 10) setVisitorMobile(val);
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

const ReviewSection = ({ targetId, targetType, currentRating, onReviewAdded, user }: { 
  targetId: string, 
  targetType: 'venue' | 'service', 
  currentRating: number,
  onReviewAdded: () => void,
  user: any 
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [visitorName, setVisitorName] = useState('');
  const [visitorMobile, setVisitorMobile] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('target_id', targetId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (!error && data) {
        setReviews(data.map(d => ({
          ...d,
          targetId: d.target_id,
          targetType: d.target_type,
          userId: d.user_id,
          userName: d.user_name,
          visitorMobile: d.visitor_mobile,
          createdAt: d.created_at
        }) as Review));
      }
    };

    fetchReviews();

    const subscription = supabase
      .channel(`reviews_${targetId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'reviews',
        filter: `target_id=eq.${targetId}`
      }, fetchReviews)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [targetId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }
    if (!user && !visitorName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!user && !visitorMobile.trim()) {
      toast.error('Please enter your mobile number for future promotions');
      return;
    }
    if (!user && !/^\d{10}$/.test(visitorMobile)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsSubmitting(true);
    try {
      const reviewData = {
        target_id: targetId,
        target_type: targetType,
        user_id: user?.uid || 'visitor',
        user_name: user?.displayName || visitorName,
        visitor_mobile: user?.mobileNumber || visitorMobile,
        rating,
        comment,
        created_at: new Date().toISOString()
      };

      const { error: rError } = await supabase.from('reviews').insert([reviewData]);
      if (rError) throw rError;
      
      // Update average rating and review count on target document
      // Fetch all reviews for this target to get accurate average
      const { data: allR } = await supabase
        .from('reviews')
        .select('rating')
        .eq('target_id', targetId);
      
      const allRatings = allR || [];
      const newAvg = allRatings.reduce((acc, r) => acc + r.rating, 0) / allRatings.length;
      
      const { error: tError } = await supabase
        .from(targetType === 'venue' ? 'venues' : 'service_providers')
        .update({
          rating: Number(newAvg.toFixed(1)),
          review_count: allRatings.length
        })
        .eq('id', targetId);
      
      if (tError) throw tError;

      setComment('');
      setVisitorName('');
      setVisitorMobile('');
      setRating(5);
      setIsSuccess(true);
      toast.success('Review submitted successfully!');
      onReviewAdded();
      
      setTimeout(() => {
        setIsSuccess(false);
        setShowForm(false);
      }, 3000);
    } catch (err) {
      console.error('Review error:', err);
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-900">Ratings & Reviews</h3>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="text-orange-600 font-bold hover:text-orange-700 flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Write a Review</span>
        </button>
      </div>

      {showForm && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-50 p-6 rounded-3xl border border-orange-100"
        >
          {isSuccess ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={32} />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h4>
              <p className="text-gray-600 mb-6">Your review has been submitted successfully.</p>
              <button 
                onClick={() => {
                  setIsSuccess(false);
                  setShowForm(false);
                }}
                className="px-8 py-2 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-sm font-bold text-gray-700">Your Rating:</span>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star 
                      size={24} 
                      className={star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} 
                    />
                  </button>
                ))}
              </div>
            </div>

            {!user && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Your Name</label>
                  <input 
                    type="text"
                    required
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Mobile Number (For Promotions)</label>
                  <input 
                    type="tel"
                    required
                    maxLength={10}
                    value={visitorMobile}
                    onChange={(e) => setVisitorMobile(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white"
                    placeholder="10-digit mobile number"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Your Review</label>
              <textarea 
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white h-32 resize-none"
                placeholder="Share your experience..."
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button 
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 text-gray-500 font-bold hover:text-gray-700"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="bg-orange-600 text-white px-8 py-2 rounded-xl font-bold hover:bg-orange-700 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Post Review'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    )}

      <div className="space-y-6">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">
                    {review.userName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{review.userName}</h4>
                    <p className="text-xs text-gray-400">
                      {review.createdAt ? format(new Date(review.createdAt), 'MMM dd, yyyy') : 'Just now'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      className={i < review.rating ? 'fill-yellow-500' : 'text-gray-200'} 
                    />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">{review.comment}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-400">No reviews yet. Be the first to share your experience!</p>
          </div>
        )}
      </div>
    </div>
  );
};

/// --- Components ---

const VideoUpload = ({ 
  onUpload, 
  label = "Upload Video", 
  currentVideo = "" 
}: { 
  onUpload: (url: string) => void, 
  label?: string,
  currentVideo?: string
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Please upload a video file');
      return;
    }

    // Check duration
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = function() {
      window.URL.revokeObjectURL(video.src);
      if (video.duration > 120) {
        toast.error('Video duration should be less than 2 minutes');
        return;
      }
      
      // Proceed with upload
      uploadFile(file);
    };
    video.src = URL.createObjectURL(file);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    try {
      const filePath = `uploads/videos/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const { data, error } = await supabase.storage
        .from('images') // Reusing images bucket as it's likely the only one
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      onUpload(publicUrl);
      toast.success('Video uploaded successfully');
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error(err.message || 'Failed to upload video');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-gray-700">{label}</label>
      <div className="flex items-center space-x-4">
        <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center group">
          {currentVideo ? (
            <video src={currentVideo} className="w-full h-full object-cover" />
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
            type="file" 
            className="hidden" 
            accept="video/*" 
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      </div>
      <p className="text-[10px] text-gray-400 italic">Max duration: 2 minutes</p>
    </div>
  );
};

const ImageUpload = ({ 
  onUpload, 
  label = "Upload Image", 
  currentImage = "" 
}: { 
  onUpload: (url: string) => void, 
  label?: string,
  currentImage?: string
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Please upload a JPEG, PNG or WEBP image');
      return;
    }

    // Increased limit since we are using Supabase now, not base64 in Firestore
    if (file.size > 5 * 1024 * 1024) { 
      toast.error('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      // Client-side resizing
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      await new Promise((resolve) => (img.onload = resolve));

      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 1200;
      const MAX_HEIGHT = 1200;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);

      const blob = await new Promise<Blob | null>((resolve) => 
        canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.8)
      );

      if (!blob) throw new Error('Failed to process image');

      const filePath = `uploads/${Date.now()}_${file.name.replace(/\s+/g, '_')}.jpg`;
      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/jpeg'
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      onUpload(publicUrl);
      toast.success('Image uploaded successfully');
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error(err.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-gray-700">{label}</label>
      <div className="flex items-center space-x-4">
        <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center group">
          {currentImage ? (
            <div className="relative w-full h-full group">
              <img src={currentImage} alt="Preview" className="w-full h-full object-cover" />
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
            type="file" 
            className="hidden" 
            accept="image/jpeg,image/png" 
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      </div>
      <p className="text-[10px] text-gray-400 italic">Supported formats: JPEG, PNG (Max 1MB)</p>
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
        const { count, error } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', user.uid)
          .eq('status', 'pending');
        
        if (!error) setPendingCount(count || 0);
      };

      fetchPending();

      const subscription = supabase
        .channel(`pending_bookings_${user.uid}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'bookings',
          filter: `owner_id=eq.${user.uid}`
        }, fetchPending)
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user, profile]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
    navigate('/');
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-orange-200">EM</div>
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">BOOK MY VANUE</span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-1 text-gray-600 hover:text-orange-600 font-bold transition-all bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 hover:bg-orange-50">
                <Home size={18} />
                <span>{t('home')}</span>
              </Link>
              
              <Link to="/gallery" className="text-gray-600 hover:text-orange-600 font-medium transition-colors">{t('gallery')}</Link>
              <Link to="/search" className="text-gray-600 hover:text-orange-600 font-medium transition-colors">{t('search')}</Link>
              {user && (
                <Link to="/dashboard?tab=orders" className="flex items-center space-x-1 text-gray-600 hover:text-orange-600 font-bold transition-all bg-orange-50/50 px-4 py-2 rounded-xl border border-orange-100 hover:bg-orange-50">
                  <Calendar size={18} />
                  <span>My Bookings</span>
                </Link>
              )}
              <Link to="/about" className="text-gray-600 hover:text-orange-600 font-medium transition-colors">{t('about')}</Link>
              
              <button 
                onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-bold transition-all bg-blue-50 px-4 py-2 rounded-xl border border-blue-100"
              >
                <span>{lang === 'en' ? 'हिन्दी' : 'English'}</span>
              </button>

              {!user && (
                <>
                  <Link to="/registration" className="text-gray-600 hover:text-orange-600 font-medium transition-colors">{t('registration')}</Link>
                  <Link to="/login" className="bg-orange-600 text-white px-6 py-2 rounded-full font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-200">{t('login')}</Link>
                </>
              )}
              {user && (
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={onRateApp}
                    className="p-2 text-yellow-500 hover:bg-yellow-50 rounded-xl transition-all group"
                    title="Rate App"
                  >
                    <Star size={20} className="group-hover:scale-110 transition-transform" fill="currentColor" />
                  </button>
                  {(profile?.role === 'owner' || profile?.role === 'provider' || profile?.role === 'admin') && (
                    <Link to="/dashboard?tab=booking-manager" className="relative p-2 text-orange-600 hover:bg-orange-50 rounded-xl transition-all group" title="Booking Manager">
                      <Bell size={24} className="group-hover:scale-110 transition-transform" />
                      {pendingCount > 0 && (
                        <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white animate-pulse">
                          {pendingCount}
                        </span>
                      )}
                    </Link>
                  )}
                  <Link to={profile?.role === 'admin' ? "/admin" : "/dashboard"} className="flex items-center space-x-3 bg-orange-50 px-4 py-2 rounded-2xl border border-orange-100 hover:bg-orange-100 transition-all group">
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-orange-200">
                      {profile?.photoURL ? (
                        <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-orange-200 flex items-center justify-center text-orange-600 font-bold text-xs">
                          {profile?.displayName?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-bold text-orange-700 group-hover:text-orange-800 hidden lg:block">{profile?.displayName}</span>
                  </Link>
                  <Link to="/change-password" title="Change Password" className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all">
                    <ShieldCheck size={20} />
                  </Link>
                  {profile?.role === 'admin' && (
                    <Link to="/admin" className="bg-red-600 text-white px-6 py-2 rounded-full font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200">Admin Panel</Link>
                  )}
                  <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Logout">
                    <LogOut size={20} />
                  </button>
                </div>
              )}
            </div>

            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600">
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
    <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-orange-100 overflow-hidden"
          >
          <div className="px-4 py-6 space-y-2">
            {[
              { to: "/", label: "Home", icon: <Home size={18} />, primary: true },
              { to: "/gallery", label: "Gallery", icon: <ImageIcon size={18} /> },
              { to: "/search", label: "Search", icon: <Search size={18} /> },
              { to: "/about", label: "About", icon: <Info size={18} /> },
              ...(user ? [{ to: "/dashboard?tab=orders", label: "My Bookings", icon: <Calendar size={18} /> }] : []),
              ...(user && (profile?.role === 'owner' || profile?.role === 'provider' || profile?.role === 'admin') ? [{ to: "/dashboard?tab=booking-manager", label: "Booking Manager", icon: <Bell size={18} /> }] : []),
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
                <span>{item.label}</span>
              </Link>
            ))}

            {user ? (
              <div className="pt-4 mt-4 border-t border-gray-100 space-y-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-4">Account</p>
                {[
                  ...(profile?.role === 'owner' || profile?.role === 'provider' ? [{ to: "/dashboard?tab=booking-manager", label: `Booking Manager ${pendingCount > 0 ? `(${pendingCount})` : ''}`, icon: <Calendar size={18} /> }] : []),
                  { to: "/change-password", label: "Change Password", icon: <ShieldCheck size={18} /> },
                  { to: profile?.role === 'admin' ? "/admin" : "/dashboard", label: profile?.role === 'admin' ? "Admin Panel" : "Dashboard", icon: <LayoutDashboard size={18} /> },
                ].sort((a, b) => a.label.localeCompare(b.label)).map((item) => (
                  <Link 
                    key={item.to}
                    to={item.to} 
                    className="flex items-center space-x-3 px-4 py-3 text-gray-600 font-medium hover:bg-gray-50 rounded-2xl transition-all" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
                <button 
                  onClick={handleLogout} 
                  className="flex items-center space-x-3 px-4 py-3 text-red-600 font-bold hover:bg-red-50 rounded-2xl w-full transition-all"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="pt-4 mt-4 border-t border-gray-100 space-y-2">
                <Link to="/login" className="flex items-center space-x-3 px-4 py-3 text-orange-600 font-bold bg-orange-50 rounded-2xl transition-all" onClick={() => setIsMenuOpen(false)}>
                  <LogIn size={18} />
                  <span>Login</span>
                </Link>
                <Link to="/registration" className="flex items-center space-x-3 px-4 py-3 text-gray-600 font-medium hover:bg-gray-50 rounded-2xl transition-all" onClick={() => setIsMenuOpen(false)}>
                  <UserPlus size={18} />
                  <span>Registration</span>
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

const Hero = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const navigate = useNavigate();

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

  return (
    <div className="relative h-[750px] md:h-[850px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=2000" 
          alt="Wedding Venue" 
          className="w-full h-full object-cover brightness-50"
        />
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

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-7xl font-black text-white mb-6 drop-shadow-2xl tracking-tight"
        >
          {t('heroTitle')}
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl md:text-2xl text-gray-200 mb-12 font-medium max-w-3xl mx-auto"
        >
          {t('heroTagline')}
        </motion.p>

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

const CategorySection = () => {
  const categories = [
    { name: 'Venues', image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=400', link: '/venues' },
    { name: 'Catering', image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=400', link: '/services?type=Caterer' },
    { name: 'DJ & Music', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=400', link: '/services?type=DJ and Sounds' },
    { name: 'Tent House', image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=400', link: '/services?type=Tent House' },
    { name: 'Photography', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400', link: '/services?type=Photo and Videographer' },
    { name: 'Makeup', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=400', link: '/services?type=Makeup Artist' },
    { name: 'Decoration', image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=400', link: '/services?type=Light Decorator' },
    { name: 'Event Manager', image: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&q=80&w=400', link: '/services?type=Event Manager' },
    { name: 'Pandit Ji', image: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80&w=400', link: '/services?type=Pandit Ji Brahman' },
    { name: 'Mehendi', image: 'https://images.unsplash.com/photo-1542642837-739074a911c0?auto=format&fit=crop&q=80&w=400', link: '/services?type=Mehendi Service' },
    { name: 'Drone', image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&q=80&w=400', link: '/services?type=Drone Camera' },
    { name: 'Rentals', image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=400', link: '/services?type=Event Cloth and Jwellary on Rent' },
    { name: 'Halbai', image: 'https://images.unsplash.com/photo-1589676062352-b19035222f5f?auto=format&fit=crop&q=80&w=400', link: '/services?type=Halbai' },
    { name: 'Waiters', image: 'https://images.unsplash.com/photo-1590650153855-d9e808231d41?auto=format&fit=crop&q=80&w=400', link: '/services?type=Waiters' },
    { name: 'Dhol Bands', image: 'https://images.unsplash.com/photo-1514525253344-f814d074358a?auto=format&fit=crop&q=80&w=400', link: '/services?type=Dhol Bands' },
    { name: 'Flower Decor', image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=400', link: '/services?type=Flower Decorator' },
  ];

  return (
    <section className="py-24 bg-white overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6">
            Explore by <span className="text-orange-600">Category</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">Discover everything you need for your event with our curated categories.</p>
        </div>
        
        <div className="relative">
          <div className="flex animate-marquee-ltr space-x-8 py-10 w-max">
            {[...categories, ...categories].map((cat, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05, rotateY: 15 }}
                className="flex-shrink-0 w-64 h-80 relative rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-2xl"
              >
                <Link to={cat.link} className="block w-full h-full">
                  <img 
                    src={cat.image} 
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-0 flex flex-col items-center justify-end pb-8">
                    <h3 className="text-2xl font-black text-white uppercase tracking-widest drop-shadow-lg">{cat.name}</h3>
                    <div className="w-10 h-1 bg-orange-500 mt-2 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const VenueCard = ({ venue }: { venue: Venue, key?: any }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100"
  >
    <Link to={`/venues/${venue.id}`}>
      <div className="relative h-56">
        <img 
          src={venue.images[0] || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800'} 
          alt={venue.name} 
          className="w-full h-full object-cover"
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
            src={service.images[0] || 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=800'} 
            alt={service.name} 
            className="w-full h-full object-cover"
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
        className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-orange-100"
      >
        <div className="bg-orange-600 p-8 text-white text-center relative">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
            <CheckCircle size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold">Registration Successful!</h2>
          <p className="mt-2 opacity-90">Welcome to the BOOK MY VANUE family</p>
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
              className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-700 shadow-xl shadow-orange-200 transition-all"
            >
              Got it, Proceed to Login
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
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('password, mobile_number')
        .eq('uid', user.uid)
        .single();

      if (fetchError) throw fetchError;

      const currentStoredPassword = userData.password || userData.mobile_number;

      if (formData.currentPassword !== currentStoredPassword) {
        toast.error('Current password is incorrect');
        setLoading(false);
        return;
      }

      // Update password
      const { error: updateError } = await supabase
        .from('users')
        .update({ password: formData.newPassword })
        .eq('uid', user.uid);

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
      const { data: adminSettings } = await supabase
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

      const { data: users, error } = await supabase
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
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500" 
              placeholder="Enter 10-digit mobile number"
              value={mobileNumber} 
              onChange={e => setMobileNumber(e.target.value.replace(/\D/g, ''))} 
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
    pincode: '',
    venueType: 'Marriage Garden' as VenueType
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
      const { data: existingUser, error: checkError } = await supabase
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

      // Fetch current count for the specific role to generate ID
      const { count, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', formData.role);
      
      if (countError) throw countError;

      const nextNum = (count || 0) + 1;
      let regId = '';
      if (formData.role === 'owner') {
        regId = 'BMVVO' + (900000 + nextNum).toString();
      } else if (formData.role === 'provider') {
        regId = 'BMVSP' + (800000 + nextNum).toString();
      } else {
        regId = 'UTSAV' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      }
      
      // We'll use a dummy UID for this custom auth system or just a random one
      const uid = 'custom_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      const profileData: any = {
        uid,
        registration_id: regId,
        display_name: formData.name,
        father_name: formData.fatherName,
        mobile_number: formData.mobileNumber,
        email: formData.email,
        photo_url: formData.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + regId,
        role: formData.role,
        state: formData.state,
        district: formData.district,
        block: formData.block,
        pincode: formData.pincode,
        status: 'active'
      };

      console.log('Attempting registration with data:', profileData);

      if (formData.role === 'owner') {
        profileData.venue_type = formData.venueType;
      }

      const { error } = await supabase.from('users').insert([profileData]);
      if (error) {
        console.error('Registration Error:', error);
        throw error;
      }
      
      // Send WhatsApp Message (Mocked)
      const whatsappMsg = `*Welcome to BOOK MY VANUE!*%0A%0AHello ${formData.name}, your registration is successful.%0A%0A*Your ID:* ${regId}%0A*Your Password:* ${formData.mobileNumber}%0A%0APlease login at: ${window.location.origin}/%23/login%0A%0AThank you for joining us!`;
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
        <h1 className="text-4xl font-black text-gray-900">Join Our Network</h1>
        <Link to="/" className="flex items-center space-x-2 text-orange-600 font-bold hover:underline bg-orange-50 px-4 py-2 rounded-full">
          <Home size={20} />
          <span>Back to Home</span>
        </Link>
      </div>
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-orange-100">
        <div className="bg-orange-600 p-8 text-white text-center">
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
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500" 
                value={formData.mobileNumber} 
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 10) setFormData({...formData, mobileNumber: val});
                }} 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Gmail ID (Email)</label>
              <input required type="email" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500" 
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <ImageUpload 
                label="Profile Photo" 
                currentImage={formData.photoURL}
                onUpload={(url) => setFormData({...formData, photoURL: url})}
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
            
            {formData.role === 'owner' && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Venue Type</label>
                <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                  value={formData.venueType} onChange={e => setFormData({...formData, venueType: e.target.value as VenueType})}>
                  <option value="Marriage Garden">Marriage Garden</option>
                  <option value="Hotel">Hotel</option>
                  <option value="Marriage Hall">Marriage Hall</option>
                  <option value="Resort">Resort</option>
                </select>
              </div>
            )}

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

          <div className="md:col-span-2 pt-6">
            <button 
              disabled={loading}
              type="submit" 
              className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-700 shadow-xl shadow-orange-200 transition-all disabled:opacity-50"
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Admin Login Check
    if (regId.toLowerCase() === 'admin@eventmanager.com') {
      const { data: adminSettings } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'admin_password')
        .single();
      
      if (adminSettings && adminSettings.value === password) {
        const adminUser = { uid: 'admin_123', email: 'admin@eventmanager.com' };
        const adminProfile: UserProfile = {
          uid: 'admin_123',
          registrationId: 'ADMIN_001',
          displayName: 'System Admin',
          mobileNumber: '0000000000',
          email: 'admin@eventmanager.com',
          photoURL: null,
          role: 'admin',
          status: 'active',
          createdAt: new Date().toISOString()
        };
        onLogin(adminUser, adminProfile);
        toast.success('Welcome Admin!');
        navigate('/admin');
        setLoading(false);
        return;
      }
    }

    try {
      // Case-insensitive registration ID check
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('registration_id', regId.toUpperCase());
      
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
      <div className="bg-white rounded-3xl shadow-2xl p-8 border border-orange-100 relative">
        <Link to="/" className="absolute -top-12 left-0 flex items-center space-x-2 text-orange-600 font-bold hover:underline bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
          <Home size={18} />
          <span>Back to Home</span>
        </Link>
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-lg shadow-orange-200">EM</div>
          <h1 className="text-2xl font-bold text-gray-900">Partner Login</h1>
          <p className="text-gray-500 mt-2">Enter your credentials to access dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Registration ID</label>
            <input required type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500" 
              placeholder="UTSAV123456"
              value={regId} onChange={e => setRegId(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Password (Mobile Number)</label>
            <input required type="password" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500" 
              placeholder="••••••••••"
              value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-700 shadow-xl shadow-orange-200 transition-all disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
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
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportFilters, setReportFilters] = useState({
    name: '',
    mobile: '',
    startDate: '',
    endDate: '',
    paymentMode: '',
    paymentStatus: ''
  });
  const [displayCount, setDisplayCount] = useState(20);

  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabase.from('venues').select('images');
      if (!error && data) {
        let vImages = data.flatMap(d => d.images || []);
        // Limit to 100 latest
        vImages = vImages.slice(0, 100);
        setImages(vImages.length > 0 ? vImages : [
          'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800'
        ]);
      }
      setLoading(false);
    };
    fetchImages();
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 100 && displayCount < images.length) {
      setDisplayCount(prev => Math.min(prev + 20, 100));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Event Gallery</h1>
          <p className="text-gray-500">Glimpses of beautiful celebrations across our venues (Max 100 latest photos)</p>
        </div>
        <Link to="/" className="flex items-center space-x-2 text-orange-600 font-bold hover:underline bg-orange-50 px-4 py-2 rounded-full">
          <Home size={20} />
          <span>Home</span>
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
            {images.slice(0, displayCount).map((img, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className="aspect-square rounded-2xl overflow-hidden shadow-lg"
              >
                <img src={img} alt="Gallery" className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
          {displayCount < images.length && (
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
      <div className="w-24 h-24 bg-orange-600 rounded-3xl flex items-center justify-center text-white text-5xl font-bold mx-auto mb-8 shadow-2xl shadow-orange-200">EM</div>
      <h1 className="text-4xl font-bold text-gray-900 mb-6">{t('about')} BOOK MY VANUE</h1>
      <p className="text-xl text-gray-600 leading-relaxed mb-12">
        BOOK MY VANUE is India's premier event planning platform, dedicated to making your special moments truly unforgettable. 
        We bridge the gap between hosts and the finest venues and service providers in the country. 
        Whether it's a grand wedding, a corporate gala, or an intimate birthday party, BOOK MY VANUE provides 
        the tools and connections you need to plan with ease and celebrate with joy.
      </p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="p-8 bg-orange-50 rounded-3xl">
        <div className="text-3xl font-bold text-orange-600 mb-2">500+</div>
        <div className="text-gray-600">Verified Venues</div>
      </div>
      <div className="p-8 bg-orange-50 rounded-3xl">
        <div className="text-3xl font-bold text-orange-600 mb-2">1000+</div>
        <div className="text-gray-600">Service Partners</div>
      </div>
      <div className="p-8 bg-orange-50 rounded-3xl">
        <div className="text-3xl font-bold text-orange-600 mb-2">10k+</div>
        <div className="text-gray-600">Happy Events</div>
      </div>
    </div>
  </div>
);
};

const useAutoScroll = (speed = 0.5) => {
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
  const scrollRef = useAutoScroll(0.8);
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
                  src={service.image} 
                  alt={service.title} 
                  className="w-full h-full object-contain relative z-10 drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)] group-hover:drop-shadow-[0_25px_35px_rgba(0,0,0,0.2)] transition-all duration-500"
                  referrerPolicy="no-referrer"
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

const ServiceTypePhotosScroll = () => {
  const [photos, setServicePhotos] = useState<ServiceTypePhoto[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPhotos = async () => {
      const { data } = await supabase.from('service_type_photos').select('*').order('created_at', { ascending: false });
      if (data) setServicePhotos(data.map(d => ({
        id: d.id,
        serviceType: d.service_type,
        imageUrl: d.image_url,
        createdAt: d.created_at
      } as ServiceTypePhoto)));
    };

    fetchPhotos();

    const channel = supabase
      .channel('service_type_photos_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_type_photos' }, () => {
        fetchPhotos();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (photos.length === 0) return null;

  return (
    <div className="bg-white py-16 overflow-hidden border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <h2 className="text-3xl md:text-5xl font-black text-gray-900 flex items-center">
          <Sparkles className="mr-4 text-orange-600" size={32} />
          Explore <span className="text-orange-600 ml-2">Services</span>
        </h2>
      </div>
      <div className="relative">
        <div className="flex animate-marquee-ltr space-x-8 py-10 w-max">
          {[...photos, ...photos].map((p, idx) => (
            <motion.div 
              key={`${p.id}-${idx}`} 
              whileHover={{ scale: 1.05, rotateY: 15 }}
              onClick={() => navigate('/registration?role=provider')}
              className="flex-shrink-0 w-64 h-80 relative rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-2xl"
            >
              <img 
                src={p.imageUrl} 
                alt={p.serviceType} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-8">
                <div className="bg-white/90 backdrop-blur-sm px-6 py-2 rounded-full shadow-lg">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">{p.serviceType}</h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TermsView = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-gray-100">
          <h1 className="text-4xl font-black text-gray-900 mb-8">Terms & Conditions</h1>
          <div className="prose prose-orange max-w-none text-gray-600 space-y-6">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p>By accessing and using the BOOK MY VANUE application, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the service.</p>
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
              <p>BOOK MY VANUE acts as a facilitator between customers and providers. We are not liable for any disputes, damages, or service failures between the parties.</p>
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


const HomeView = ({ user }: { user: any }) => {
  const { t } = useTranslation();
  const venuesScrollRef = useAutoScroll(0.6);
  const topProvidersScrollRef = useAutoScroll(0.5);
  const categoriesScrollRef = useAutoScroll(0.4);
  const [featuredVenues, setFeaturedVenues] = useState<Venue[]>([]);
  const [featuredServices, setFeaturedServices] = useState<ServiceProvider[]>([]);
  const [banners, setBanners] = useState<AppBanner[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex(prev => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners]);

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        const { data: vData } = await supabase.from('venues').select('*').order('rating', { ascending: false }).limit(6);
        if (vData) setFeaturedVenues(vData.map(d => ({ 
          ...d, 
          ownerId: d.owner_id, 
          venueType: d.venue_type, 
          pricePerDay: d.price_per_day, 
          rating: d.rating || 0,
          reviewCount: d.review_count || 0,
          createdAt: d.created_at 
        }) as Venue));

        const { data: sData } = await supabase.from('service_providers').select('*').order('rating', { ascending: false }).limit(8);
        if (sData) setFeaturedServices(sData.map(d => ({ 
          ...d, 
          providerId: d.provider_id, 
          serviceType: d.service_type, 
          priceRange: d.price_range, 
          rating: d.rating || 0,
          reviewCount: d.review_count || 0,
          createdAt: d.created_at 
        }) as ServiceProvider));

        const { data: bData } = await supabase.from('banners').select('*').eq('is_active', true);
        if (bData) setBanners(bData.map(d => ({ id: d.id, title: d.title, imageUrl: d.image_url, link: d.link, isActive: d.is_active, createdAt: d.created_at }) as AppBanner));

        let { data: nData, error: nError } = await supabase.from('notifications').select('*').eq('is_active', true).order('created_at', { ascending: false });
        
        // Fallback if is_active column is missing
        if (nError && nError.message.includes('is_active')) {
          console.warn('is_active column missing in notifications, falling back');
          const { data: fallbackData, error: fallbackError } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
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

    const venueChannel = supabase
      .channel('home_venues')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'venues' }, () => {
        fetchHomeData();
      })
      .subscribe();

    const providerChannel = supabase
      .channel('home_providers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_providers' }, () => {
        fetchHomeData();
      })
      .subscribe();

    const channel = supabase
      .channel('home_notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        fetchHomeData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(venueChannel);
      supabase.removeChannel(providerChannel);
      supabase.removeChannel(channel);
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
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 1, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <img 
                  src={banners[currentBannerIndex].imageUrl} 
                  alt={banners[currentBannerIndex].title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent flex items-center">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="max-w-2xl">
                      <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
                        {banners[currentBannerIndex].title}
                      </h1>
                      <p className="text-xl text-gray-200 mb-10 leading-relaxed">
                        {t('heroTagline')}
                      </p>
                      <div className="flex flex-wrap gap-4">
                        <Link to="/venues" className="bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-orange-700 transition-all shadow-xl shadow-orange-900/20 flex items-center group">
                          {t('searchNow')}
                          <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/login" className="bg-white text-orange-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all shadow-xl flex items-center">
                          <LogIn className="mr-2" />
                          {t('loginNow')}
                        </Link>
                        <Link to="/registration?role=owner" className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all">
                          {t('joinAsOwner')}
                        </Link>
                        <Link to="/registration?role=provider" className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all">
                          {t('joinAsProvider')}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          <Hero />
        )}
      </div>

      {/* Dynamic Service & Venue Types Text */}
      <div className="bg-white py-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-center">
            {['Marriage Garden', 'Banquet Hall', 'Hotel', 'Resort', 'Party Plot', 'Catering', 'Decoration', 'Photography', 'DJ & Music', 'Makeup Artist', 'Mehendi Artist', 'Tent House', 'Security'].map((type, idx) => (
              <span key={idx} className="text-sm md:text-lg font-bold text-gray-400 hover:text-orange-500 transition-colors cursor-default uppercase tracking-widest">
                {type}
              </span>
            ))}
          </div>
        </div>
      </div>

      <ServiceTypePhotosScroll />
      <CategorySection />
      <ServiceInfoStickers />
      
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Popular Venues</h2>
              <p className="text-gray-500 mt-2">Handpicked venues for your special celebrations</p>
            </div>
            <Link to="/venues" className="text-orange-600 font-bold flex items-center hover:underline">
              View All <ChevronRight size={20} />
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
              <h2 className="text-3xl font-bold text-gray-900">Top Service Providers</h2>
              <p className="text-gray-500 mt-2">Caterers, DJs, and Decorators to make it memorable</p>
            </div>
            <Link to="/services" className="text-orange-600 font-bold flex items-center hover:underline">
              View All <ChevronRight size={20} />
            </Link>
          </div>
          <div ref={topProvidersScrollRef} className="flex overflow-x-auto pb-8 gap-6 scrollbar-hide">
            {featuredServices.length > 0 ? (
              featuredServices.slice(0, 8).map(s => (
                <div key={s.id} className="min-w-[280px] md:min-w-[320px] snap-start">
                  <ServiceCard service={s} />
                </div>
              ))
            ) : (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="min-w-[280px] md:min-w-[320px] bg-white rounded-2xl h-64 animate-pulse border border-gray-100" />
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
              <p className="text-orange-100 opacity-80">Every venue and provider is manually verified for quality and reliability.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-sm">
                <IndianRupee size={40} />
              </div>
              <h3 className="text-2xl font-bold mb-4">{t('bestPrices')}</h3>
              <p className="text-orange-100 opacity-80">Get the best rates by booking directly through our platform.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-sm">
                <Clock size={40} />
              </div>
              <h3 className="text-2xl font-bold mb-4">{t('support247')}</h3>
              <p className="text-orange-100 opacity-80">Our team is here to help you with every step of your event planning.</p>
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
      const { data, error } = await supabase
        .from('app_feedback')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Supabase error fetching feedback:', error);
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
        const { data: allData, error: allErr } = await supabase.from('app_feedback').select('rating');
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

    const channel = supabase
      .channel('app_feedback_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_feedback' }, () => {
        fetchFeedbacks();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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
          
      {/* App Rating Summary */}
      <div className="inline-flex flex-col items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-3 mb-2">
          <span className="text-4xl font-black text-gray-900">{appRating || '0.0'}</span>
          <div className="flex items-center text-yellow-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={24} fill={i < Math.round(appRating) ? "currentColor" : "none"} className={i < Math.round(appRating) ? "text-yellow-500" : "text-gray-200"} />
            ))}
          </div>
        </div>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
          Overall App Rating ({totalFeedback} Reviews)
        </p>
        <button 
          onClick={fetchFeedbacks}
          className="mt-4 text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-1"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          <span>Refresh Reviews</span>
        </button>
      </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {feedbacks.map((fb, idx) => (
            <motion.div 
              key={fb.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative group hover:shadow-xl transition-all"
            >
              <div className="flex items-center space-x-1 text-yellow-500 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill={i < fb.rating ? "currentColor" : "none"} className={i < fb.rating ? "text-yellow-500" : "text-gray-200"} />
                ))}
              </div>
              <p className="text-gray-600 italic leading-relaxed mb-8">"{fb.comment}"</p>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-xl">
                  {fb.userName?.charAt(0) || 'U'}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{fb.userName}</h4>
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Verified User</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const AvailabilityCalendar = ({ targetId }: { targetId: string }) => {
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchBookings = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('event_date')
        .eq('target_id', targetId)
        .eq('status', 'confirmed');
      
      if (!error && data) {
        setBookedDates(data.map(d => d.event_date));
      }
    };

    fetchBookings();

    const channel = supabase
      .channel(`availability_${targetId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'bookings',
        filter: `target_id=eq.${targetId}`
      }, fetchBookings)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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
          const isBooked = bookedDates.includes(date);
          const isToday = date === format(new Date(), 'yyyy-MM-dd');
          return (
            <div 
              key={date} 
              className={cn(
                "aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-all",
                isBooked ? "bg-red-50 text-red-600 border border-red-100" : "bg-gray-50 text-gray-700 hover:bg-orange-50 hover:text-orange-600 cursor-pointer",
                isToday && !isBooked && "border-2 border-orange-500"
              )}
            >
              {date.split('-')[2]}
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex items-center space-x-4 text-xs font-medium">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-50 border border-red-100 rounded-full" />
          <span className="text-gray-500">Booked</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-50 border border-gray-100 rounded-full" />
          <span className="text-gray-500">Available</span>
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
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('21:00');
  const [visitorName, setVisitorName] = useState(profile?.displayName || '');
  const [visitorMobile, setVisitorMobile] = useState(profile?.mobileNumber || '');
  const [eventType, setEventType] = useState('');
  const [message, setMessage] = useState('');
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [isCallSatisfied, setIsCallSatisfied] = useState(false);
  const [ownerProfile, setOwnerProfile] = useState<any>(null);

  const fetchVenue = async () => {
    if (!id) return;
    const { data, error } = await supabase
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
        createdAt: data.created_at
      } as Venue);

      // Fetch owner profile
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('uid', data.owner_id)
        .single();
      if (userData) setOwnerProfile(userData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVenue();

    const subscription = supabase
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
    if (!bookingDate || !visitorName || !visitorMobile || !eventType) {
      toast.error('Please fill all required fields');
      return;
    }

    setBookingStatus('loading');
    try {
      // Check for existing pending booking from this visitor for this venue
      const { data: existingPending, error: pendingError } = await supabase
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
      const { data: existingBookings, error: conflictError } = await supabase
        .from('bookings')
        .select('id, start_time, end_time')
        .eq('target_id', venue?.id)
        .eq('event_date', bookingDate)
        .eq('status', 'confirmed');

      if (conflictError) throw conflictError;

      const hasConflict = existingBookings?.some(b => {
        if (!b.start_time || !b.end_time) return true; // Assume conflict if no timing (full day)
        const bStart = b.start_time;
        const bEnd = b.end_time;
        return (startTime >= bStart && startTime < bEnd) || (endTime > bStart && endTime <= bEnd) || (startTime <= bStart && endTime >= bEnd);
      });

      if (hasConflict) {
        const proceed = true;
        if (!proceed) {
          setBookingStatus('idle');
          return;
        }
      }

      const { error } = await supabase.from('bookings').insert([{
        user_id: user?.uid || 'visitor',
        visitor_name: visitorName,
        visitor_mobile: visitorMobile,
        event_type: eventType,
        target_id: venue?.id,
        target_type: 'venue',
        target_name: venue?.name,
        owner_id: venue?.ownerId,
        event_date: bookingDate,
        start_time: startTime,
        end_time: endTime,
        status: 'pending',
        total_amount: venue?.pricePerDay || 0,
        message
      }]);

      if (error) throw error;

      // Send WhatsApp Alert to Owner
      try {
        const { data: ownerProfile } = await supabase.from('users').select('mobile_number').eq('uid', venue?.ownerId).single();
        if (ownerProfile?.mobile_number) {
          const alertMsg = `New Booking Query for ${venue?.name}!\nVisitor: ${visitorName}\nMobile: ${visitorMobile}\nEvent: ${eventType}\nDate: ${bookingDate}\nMessage: ${message || 'No message'}`;
          sendWhatsAppAlert(ownerProfile.mobile_number, alertMsg);
        }
      } catch (waErr) {
        console.error('WhatsApp alert failed:', waErr);
      }

      setBookingStatus('success');
      toast.success('Booking request sent successfully!');
    } catch (err) {
      toast.error('Failed to send booking request');
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

      {/* Profile Header */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
        <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-xl border-4 border-white shrink-0">
          <img 
            src={ownerProfile?.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${ownerProfile?.display_name || venue.name}`} 
            alt={ownerProfile?.display_name || venue.name} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{venue.name}</h1>
              <div className="flex items-center justify-center md:justify-start text-gray-500">
                <MapPin size={18} className="mr-1 text-orange-500" />
                <span>{venue.address}, {venue.district}, {venue.state}</span>
              </div>
              {ownerProfile && (
                <div className="flex flex-col space-y-1 mt-2">
                  <div className="flex items-center justify-center md:justify-start text-gray-500 text-sm font-medium">
                    <User size={14} className="mr-1 text-orange-600" />
                    <span>Owner: {ownerProfile.display_name}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-center space-x-2 bg-orange-50 px-6 py-3 rounded-2xl border border-orange-100">
              <Star size={24} className="text-yellow-500 fill-yellow-500" />
              <div className="flex flex-col items-start">
                <span className="text-2xl font-bold text-orange-700 leading-none">{venue.rating > 0 ? venue.rating : 'No Rating'}</span>
                <span className="text-xs text-orange-400 font-bold uppercase tracking-wider">{venue.reviewCount || 0} reviews</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {/* Gallery */}
          <div className="grid grid-cols-2 gap-4 h-[400px]">
            <img src={venue.images[0]} alt={venue.name} className="w-full h-full object-cover rounded-3xl col-span-2 md:col-span-1" />
            <div className="hidden md:grid grid-rows-2 gap-4">
              <img src={venue.images[1] || venue.images[0]} alt={venue.name} className="w-full h-full object-cover rounded-3xl" />
              <img src={venue.images[2] || venue.images[0]} alt={venue.name} className="w-full h-full object-cover rounded-3xl" />
            </div>
          </div>

          <div>
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="bg-gray-100 px-4 py-2 rounded-xl flex items-center space-x-2">
                <Users size={18} className="text-gray-600" />
                <span className="text-sm font-medium">{venue.capacity} Guests</span>
              </div>
              <div className="bg-gray-100 px-4 py-2 rounded-xl flex items-center space-x-2">
                <Home size={18} className="text-gray-600" />
                <span className="text-sm font-medium">Indoor & Outdoor</span>
              </div>
            </div>

            <div className="prose max-w-none text-gray-600 leading-relaxed">
              <h3 className="text-xl font-bold text-gray-900 mb-4">About this Venue</h3>
              <p>{venue.description}</p>
            </div>

            <div className="mt-10">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Available For</h3>
              <div className="flex flex-wrap gap-2">
                {venue.availableFor?.map((item, idx) => (
                  <span key={idx} className="bg-orange-50 text-orange-700 px-4 py-2 rounded-xl text-sm font-bold border border-orange-100">
                    {item}
                  </span>
                ))}
                {(!venue.availableFor || venue.availableFor.length === 0) && (
                  <span className="text-gray-400 italic text-sm">No specific event types listed</span>
                )}
              </div>
            </div>

            <div className="mt-10">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {venue.facilities?.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-3 text-gray-700">
                    <CheckCircle size={18} className="text-green-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {venue.catalogue && venue.catalogue.length > 0 && (
              <div className="mt-16">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Venue Catalogue</h3>
                <div className="space-y-12">
                  {venue.catalogue.map((item, idx) => (
                    <div key={idx} className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <h4 className="text-xl font-bold text-orange-600 uppercase tracking-wide">{item.level}</h4>
                          <div className="flex items-center text-gray-500 text-sm mt-1">
                            <Users size={14} className="mr-1" />
                            <span>Capacity: {item.capacity} persons</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {item.images.map((img, imgIdx) => (
                          <div key={imgIdx} className="aspect-square rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <img 
                              src={img} 
                              alt={`${item.level} ${imgIdx + 1}`} 
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" 
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        ))}
                        {item.videos?.map((vid, vidIdx) => (
                          <div key={vidIdx} className="aspect-square rounded-2xl overflow-hidden shadow-sm bg-black relative group">
                            <video 
                              src={vid} 
                              className="w-full h-full object-cover"
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

            <div className="mt-16">
              <ReviewSection 
                targetId={venue.id} 
                targetType="venue" 
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
                <span className="text-3xl font-bold text-gray-900">₹{(venue.pricePerDay || 0).toLocaleString()}</span>
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
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        placeholder="10-digit mobile number"
                        value={visitorMobile}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (val.length <= 10) setVisitorMobile(val);
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
                      <label className="block text-sm font-bold text-gray-700 mb-2">Event Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          required
                          type="date" 
                          className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          min={format(new Date(), 'yyyy-MM-dd')}
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
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('21:00');
  const [message, setMessage] = useState('');
  const [visitorName, setVisitorName] = useState(profile?.displayName || '');
  const [visitorMobile, setVisitorMobile] = useState(profile?.mobileNumber || '');
  const [eventType, setEventType] = useState('');
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [isCallSatisfied, setIsCallSatisfied] = useState(false);
  const [providerProfile, setProviderProfile] = useState<any>(null);

  const fetchService = async () => {
    if (!id) return;
    const { data, error } = await supabase
      .from('service_providers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (!error && data) {
      setService({
        ...data,
        providerId: data.provider_id,
        serviceType: data.service_type,
        priceRange: data.price_range,
        reviewCount: data.review_count,
        availableFor: data.available_for,
        createdAt: data.created_at
      } as ServiceProvider);

      // Fetch provider profile
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('uid', data.provider_id)
        .single();
      if (userData) setProviderProfile(userData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchService();

    const subscription = supabase
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
    if (!date) {
      toast.error('Please select a date');
      return;
    }
    if (!user && !/^\d{10}$/.test(visitorMobile)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setBookingStatus('loading');
    try {
      // Check for existing pending booking from this visitor for this service
      const { data: existingPending, error: pendingError } = await supabase
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
      const { data: existingBookings, error: conflictError } = await supabase
        .from('bookings')
        .select('id, start_time, end_time')
        .eq('target_id', service?.id)
        .eq('event_date', date)
        .eq('status', 'confirmed');

      if (conflictError) throw conflictError;

      const hasConflict = existingBookings?.some(b => {
        if (!b.start_time || !b.end_time) return true; // Assume conflict if no timing (full day)
        const bStart = b.start_time;
        const bEnd = b.end_time;
        return (startTime >= bStart && startTime < bEnd) || (endTime > bStart && endTime <= bEnd) || (startTime <= bStart && endTime >= bEnd);
      });

      if (hasConflict) {
        const proceed = true;
        if (!proceed) {
          setBookingStatus('idle');
          return;
        }
      }

      const { error } = await supabase.from('bookings').insert([{
        user_id: user?.uid || 'visitor',
        target_id: service?.id,
        target_type: 'service',
        target_name: service?.name,
        owner_id: service?.providerId,
        event_date: date,
        start_time: startTime,
        end_time: endTime,
        status: 'pending',
        total_amount: 0,
        message,
        visitor_name: visitorName,
        visitor_mobile: visitorMobile,
        event_type: eventType
      }]);

      if (error) throw error;

      // Send WhatsApp Alert to Provider
      try {
        const { data: providerProfile } = await supabase.from('users').select('mobile_number').eq('uid', service?.providerId).single();
        if (providerProfile?.mobile_number) {
          const alertMsg = `New Service Query for ${service?.name}!\nVisitor: ${visitorName}\nMobile: ${visitorMobile}\nDate: ${date}\nMessage: ${message || 'No message'}`;
          sendWhatsAppAlert(providerProfile.mobile_number, alertMsg);
        }
      } catch (waErr) {
        console.error('WhatsApp alert failed:', waErr);
      }

      setBookingStatus('success');
      toast.success('Booking inquiry sent successfully!');
    } catch (err) {
      toast.error('Failed to send inquiry');
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

      {/* Profile Header */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
          <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-xl border-4 border-white shrink-0">
            <img 
              src={providerProfile?.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${providerProfile?.display_name || service.name}`} 
              alt={providerProfile?.display_name || service.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 inline-block">
                  {service.serviceType}
                </span>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{service.name}</h1>
                <div className="flex items-center justify-center md:justify-start text-gray-500">
                  <MapPin size={18} className="mr-1 text-orange-500" />
                  <span>{service.district}, {service.state}</span>
                </div>
                {providerProfile && (
                  <div className="flex flex-col space-y-1 mt-2">
                    <div className="flex items-center justify-center md:justify-start text-gray-500 text-sm font-medium">
                      <User size={14} className="mr-1 text-purple-600" />
                      <span>Provider: {providerProfile.display_name}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-center space-x-2 bg-purple-50 px-6 py-3 rounded-2xl border border-purple-100">
                <Star size={24} className="text-yellow-500 fill-yellow-500" />
                <div className="flex flex-col items-start">
                  <span className="text-2xl font-bold text-purple-700 leading-none">{service.rating > 0 ? service.rating : 'No Rating'}</span>
                  <span className="text-xs text-purple-400 font-bold uppercase tracking-wider">{service.reviewCount || 0} reviews</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-[400px] relative mt-8 max-w-7xl mx-auto px-4">
        <img 
          src={service.images[0] || 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=1920'} 
          alt={service.name} 
          className="w-full h-full object-cover rounded-3xl"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-3xl" />
        <div className="absolute bottom-8 left-8 right-8">
          <div className="flex items-end justify-between">
            <div className="text-white">
              <p className="text-lg opacity-90 font-medium">Starting from</p>
              <p className="text-4xl font-bold">{service.priceRange}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Available For</h3>
              <div className="flex flex-wrap gap-3">
                {service.availableFor?.map((item, idx) => (
                  <span key={idx} className="bg-purple-50 text-purple-700 px-4 py-2 rounded-xl text-sm font-bold border border-purple-100">
                    {item}
                  </span>
                ))}
                {(!service.availableFor || service.availableFor.length === 0) && (
                  <span className="text-gray-400 italic text-sm">No specific event types listed</span>
                )}
              </div>
            </section>

            <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">About this Service</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{service.description}</p>
            </section>

            {service.catalogue && service.catalogue.length > 0 && (
              <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-2xl font-bold mb-8 text-gray-900">Service Catalogue</h3>
                <div className="space-y-10">
                  {service.catalogue.map((item, idx) => (
                    <div key={idx} className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-lg text-purple-600 uppercase tracking-wide">{item.level}</h4>
                        {item.capacity > 0 && (
                          <span className="text-xs font-bold bg-purple-50 text-purple-600 px-3 py-1 rounded-full">
                            Capacity: {item.capacity}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {item.images.map((img, imgIdx) => (
                          <div key={imgIdx} className="aspect-square rounded-xl overflow-hidden border border-gray-100">
                            <img 
                              src={img} 
                              alt={`${item.level} ${imgIdx + 1}`} 
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" 
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        ))}
                        {item.videos?.map((vid, vidIdx) => (
                          <div key={vidIdx} className="aspect-square rounded-xl overflow-hidden border border-gray-100 bg-black relative group">
                            <video 
                              src={vid} 
                              className="w-full h-full object-cover"
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

            <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <ReviewSection 
                targetId={service.id} 
                targetType="service" 
                currentRating={service.rating} 
                onReviewAdded={fetchService}
                user={user}
              />
            </section>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-2xl border border-orange-100 sticky top-24">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Book this Service</h3>
              
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
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                          placeholder="Enter mobile number"
                          value={visitorMobile}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            if (val.length <= 10) setVisitorMobile(val);
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
                    <label className="block text-sm font-bold text-gray-700 mb-2">Event Date</label>
                    <input 
                      required
                      type="date" 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={format(new Date(), 'yyyy-MM-dd')}
                    />
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

const BookingManagerView = ({ user, profile }: { user: any, profile: UserProfile | null }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 20;
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isAmountModalOpen, setIsAmountModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [newAmount, setNewAmount] = useState(0);
  const [expenditure, setExpenditure] = useState(0);
  const [extraServices, setExtraServices] = useState<{ name: string; amount: number }[]>([]);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'Online'>('Cash');
  const [paymentStatus, setPaymentStatus] = useState<'Pending' | 'Paid'>('Pending');
  const [manualBooking, setManualBooking] = useState({
    partyName: '',
    partyAddress: '',
    mobileNumber: '',
    eventDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '21:00',
    eventType: '',
    targetId: '',
    targetName: '',
    paymentMode: 'Cash'
  });
  const [venues, setVenues] = useState<Venue[]>([]);
  const [services, setServices] = useState<ServiceProvider[]>([]);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isCallSatisfied, setIsCallSatisfied] = useState(false);
  const [manualCallSatisfied, setManualCallSatisfied] = useState(false);

  const fetchBookings = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('owner_id', user.uid)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setBookings(data.map(d => ({
        ...d,
        userId: d.user_id,
        ownerId: d.owner_id,
        targetId: d.target_id,
        targetType: d.target_type,
        targetName: d.target_name,
        eventDate: d.event_date,
        endDate: d.end_date,
        eventType: d.event_type,
        partyName: d.party_name,
        partyAddress: d.party_address,
        visitorName: d.visitor_name,
        visitorMobile: d.visitor_mobile,
        status: d.status,
        isManual: d.is_manual,
        totalAmount: d.total_amount || 0,
        updatedAmount: d.updated_amount,
        paymentStatus: d.payment_status,
        paymentMode: d.payment_mode,
        is_invoice_generated: d.is_invoice_generated,
        invoice_url: d.invoice_url,
        createdAt: d.created_at
      } as Booking)));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    fetchBookings();

    const channel = supabase
      .channel(`booking_manager_changes_${user.uid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        fetchBookings();
      })
      .subscribe();

    const fetchMyItems = async () => {
      const { data: vData } = await supabase.from('venues').select('*').eq('owner_id', user.uid);
      if (vData) setVenues(vData.map(d => ({ id: d.id, ...d } as any)));
      
      const { data: sData } = await supabase.from('service_providers').select('*').eq('provider_id', user.uid);
      if (sData) setServices(sData.map(d => ({ id: d.id, ...d } as any)));
    };

    fetchMyItems();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const filteredBookings = bookings.filter(b => {
    const matchesManual = b.isManual;
    const isPaid = b.paymentStatus === 'Paid' || b.status === 'paid';
    if (isPaid) return false;
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchesDate = !dateFilter || b.eventDate === dateFilter;
    return matchesManual && matchesStatus && matchesDate;
  });

  const sortedBookings = [...filteredBookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = sortedBookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(sortedBookings.length / bookingsPerPage);

  const handleStatusUpdate = async (id: string, status: 'confirmed' | 'cancelled') => {
    if (status === 'confirmed' && !isCallSatisfied) {
      toast.error('Please confirm that you have called the visitor');
      return;
    }
    try {
      const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
      if (error) throw error;
      
      const booking = bookings.find(b => b.id === id);
      if (status === 'confirmed' && booking) {
        const msg = `Congratulations! Your booking for ${booking.targetName} on ${booking.eventDate} has been CONFIRMED. We look forward to serving you!`;
        sendWhatsAppAlert(booking.visitorMobile || '', msg);
      }
      
      toast.success(`Booking ${status} successfully`);
      setIsAcceptModalOpen(false);
      setIsCallSatisfied(false);
    } catch (err) {
      toast.error('Failed to update booking status');
    }
  };

  const handleUpdateAmount = async () => {
    if (!selectedBooking) return;
    const { error } = await supabase.from('bookings').update({ updated_amount: newAmount }).eq('id', selectedBooking.id);
    if (!error) {
      toast.success('Booking amount updated');
      setIsAmountModalOpen(false);
      setSelectedBooking(null);
    } else {
      toast.error('Failed to update amount');
    }
  };

  const confirmInvoice = async () => {
    if (selectedBooking) {
      const updatedBooking = {
        ...selectedBooking,
        extra_services: extraServices,
        paymentMode,
        paymentStatus: 'Pending' as 'Pending',
        status: selectedBooking.status
      };
      
      const pdfBlob = generateInvoice(updatedBooking, expenditure, profile);
      
      // Upload to Supabase Storage to get a public link
      const fileName = `invoices/INV-${selectedBooking.id.substring(0, 8)}-${Date.now()}.pdf`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, pdfBlob, { contentType: 'application/pdf' });

      let downloadUrl = '';
      if (!uploadError && uploadData) {
        const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
        downloadUrl = publicUrl;
      }

      const extraTotal = extraServices.reduce((sum, s) => sum + s.amount, 0);
      const finalAmount = (selectedBooking.updatedAmount || selectedBooking.totalAmount || 0) + expenditure + extraTotal;
      
      let msg = `Hello ${selectedBooking.partyName || selectedBooking.visitorName}, your invoice for ${selectedBooking.targetName} has been generated. Total Amount: INR ${finalAmount.toLocaleString()}. Payment Mode: ${paymentMode}. Status: Pending.`;
      if (downloadUrl) {
        msg += `\n\nDownload Invoice PDF: ${downloadUrl}`;
      }
      
      sendWhatsAppAlert(selectedBooking.visitorMobile || '', msg);
      
      await supabase.from('bookings').update({ 
        is_invoice_generated: true,
        extra_services: extraServices,
        payment_mode: paymentMode,
        payment_status: 'Pending',
        invoice_url: downloadUrl
      }).eq('id', selectedBooking.id);
      
      // Update local state for immediate UI feedback
      setBookings(prev => prev.map(b => b.id === selectedBooking.id ? { 
        ...b, 
        is_invoice_generated: true, 
        paymentStatus: 'Pending',
        paymentMode: paymentMode,
        invoice_url: downloadUrl
      } : b));
      
      setIsInvoiceModalOpen(false);
      setSelectedBooking(null);
      setExpenditure(0);
      setExtraServices([]);
      setPaymentStatus('Pending');
      toast.success('Invoice generated and shared via WhatsApp');
      
      // Explicitly fetch to ensure sync
      fetchBookings();
    }
  };

  const handleUpdatePaymentStatus = async () => {
    if (!selectedBooking) return;
    
    if (selectedBooking.paymentStatus === 'Paid' || selectedBooking.status === 'paid') {
      toast.error('This booking is already marked as PAID and cannot be updated.');
      setIsPaymentModalOpen(false);
      return;
    }

    try {
      console.log('Updating payment status for booking (Dashboard):', selectedBooking.id, 'to:', paymentStatus);
      const { error } = await supabase.from('bookings').update({ 
        payment_status: paymentStatus,
        status: paymentStatus === 'Paid' ? 'paid' : selectedBooking.status
      }).eq('id', selectedBooking.id);

      if (error) {
        console.error('Payment update error (Dashboard):', error);
        toast.error(`Error: ${error.message}`);
        throw error;
      }

      toast.success(`Payment status updated to ${paymentStatus}`);
      setIsPaymentModalOpen(false);
      setSelectedBooking(null);
      fetchBookings();
    } catch (err) {
      console.error('Payment status update failed (Dashboard):', err);
      toast.error('Failed to update payment status');
    }
  };

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

    try {
      const { error } = await supabase.from('bookings').insert([{
        user_id: user.uid,
        owner_id: user.uid,
        target_id: manualBooking.targetId,
        target_type: venues.find(v => v.id === manualBooking.targetId) ? 'venue' : 'service',
        target_name: manualBooking.targetName,
        event_date: manualBooking.eventDate,
        end_date: manualBooking.endDate,
        start_time: manualBooking.startTime,
        end_time: manualBooking.endTime,
        event_type: manualBooking.eventType,
        party_name: manualBooking.partyName,
        party_address: manualBooking.partyAddress,
        visitor_mobile: manualBooking.mobileNumber,
        status: 'confirmed',
        is_manual: true,
        payment_mode: manualBooking.paymentMode
      }]);
      if (error) throw error;
      setIsManualModalOpen(false);
      const msg = `New Manual Booking for ${manualBooking.targetName} on ${manualBooking.eventDate} (${manualBooking.startTime} - ${manualBooking.endTime}) has been created for you. Thank you!`;
      sendWhatsAppAlert(manualBooking.mobileNumber, msg);
      toast.success('Manual booking added successfully');
      setManualBooking({
        partyName: '',
        partyAddress: '',
        mobileNumber: '',
        eventDate: '',
        endDate: '',
        startTime: '09:00',
        endTime: '21:00',
        eventType: '',
        targetId: '',
        targetName: '',
        paymentMode: 'Cash'
      });
      setManualCallSatisfied(false);
    } catch (err) {
      toast.error('Failed to add manual booking');
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booking Manager</h1>
          <p className="text-gray-500 mt-1">Manage your venue and service bookings</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select 
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-orange-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Approved</option>
            <option value="cancelled">Rejected</option>
          </select>
          <input 
            type="date" 
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-orange-500"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
          <button 
            onClick={() => setIsManualModalOpen(true)}
            className="bg-orange-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center space-x-2 hover:bg-orange-700 transition-all shadow-lg shadow-orange-200"
          >
            <Plus size={20} />
            <span>Manual Booking</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {currentBookings.length > 0 ? (
          currentBookings.map(booking => (
            <div key={booking.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start space-x-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center",
                  booking.status === 'pending' ? "bg-yellow-100 text-yellow-600" :
                  booking.status === 'confirmed' ? "bg-green-100 text-green-600" :
                  "bg-red-100 text-red-600"
                )}>
                  <Calendar size={24} />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-lg text-gray-900">
                      {booking.isManual ? booking.partyName : booking.visitorName}
                    </h3>
                    {booking.isManual && (
                      <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Manual</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 font-medium">{booking.targetName} • {booking.eventType}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                    <span className="flex items-center"><Calendar size={14} className="mr-1" /> {booking.eventDate} {booking.endDate && `to ${booking.endDate}`}</span>
                    <span className="flex items-center"><Phone size={14} className="mr-1" /> {booking.visitorMobile}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {booking.status === 'pending' ? (
                  <>
                    <button 
                      onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                      className="px-6 py-2 rounded-xl font-bold text-red-600 hover:bg-red-50 transition-all"
                    >
                      Deny
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedBooking(booking);
                        setIsAcceptModalOpen(true);
                      }}
                      className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100"
                    >
                      Accept
                    </button>
                  </>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className={cn(
                      "px-4 py-2 rounded-xl font-bold text-sm uppercase tracking-wider",
                      (booking.status === 'confirmed' || booking.status === 'paid') ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                    )}>
                      {booking.status}
                    </span>
                    {booking.status === 'confirmed' || booking.status === 'paid' ? (
                      <>
                        <button 
                          disabled={booking.is_invoice_generated || booking.status === 'paid' || booking.paymentStatus === 'Paid'}
                          onClick={() => {
                            if (booking.is_invoice_generated || booking.status === 'paid' || booking.paymentStatus === 'Paid') {
                              toast.error('Amount cannot be updated after invoice generation or payment');
                              return;
                            }
                            setSelectedBooking(booking);
                            setNewAmount(booking.updatedAmount || booking.totalAmount);
                            setIsAmountModalOpen(true);
                          }}
                          className={cn(
                            "p-2 rounded-xl transition-all",
                            (booking.is_invoice_generated || booking.status === 'paid' || booking.paymentStatus === 'Paid') ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-orange-50 text-orange-600 hover:bg-orange-100"
                          )}
                          title={(booking.is_invoice_generated || booking.status === 'paid' || booking.paymentStatus === 'Paid') ? "Amount locked after invoice or payment" : "Update Amount"}
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedBooking(booking);
                            setIsInvoiceModalOpen(true);
                          }}
                          className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100"
                          title="Generate Invoice"
                        >
                          <Download size={18} />
                        </button>
                        {(booking.paymentStatus || booking.is_invoice_generated || booking.status === 'confirmed') && (
                          <button 
                            disabled={booking.paymentStatus === 'Paid' || booking.status === 'paid'}
                            onClick={() => {
                              if (booking.paymentStatus === 'Paid' || booking.status === 'paid') {
                                toast.error('Payment status is already marked as PAID');
                                return;
                              }
                              setSelectedBooking(booking);
                              setPaymentStatus(booking.paymentStatus || 'Pending');
                              setIsPaymentModalOpen(true);
                            }}
                            className={cn(
                              "flex items-center space-x-2 px-3 py-2 rounded-xl transition-all",
                              (booking.paymentStatus === 'Paid' || booking.status === 'paid') ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-green-50 text-green-600 hover:bg-green-100"
                            )}
                            title={(booking.paymentStatus === 'Paid' || booking.status === 'paid') ? "Payment already completed" : "Update Payment Status"}
                          >
                            <CreditCard size={18} />
                            <span className="text-sm font-medium">Payment Status</span>
                          </button>
                        )}
                      </>
                    ) : null}
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
              className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 md:p-10">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Manual Booking</h2>
                  <button onClick={() => setIsManualModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleManualBooking} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                    <div>
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
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        value={manualBooking.mobileNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (val.length <= 10) setManualBooking({...manualBooking, mobileNumber: val});
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
                      <input 
                        required
                        type="text" 
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none uppercase"
                        value={manualBooking.eventType}
                        onChange={(e) => setManualBooking({...manualBooking, eventType: e.target.value})}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Payment Mode</label>
                      <div className="flex space-x-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name="paymentMode" 
                            value="Cash"
                            checked={manualBooking.paymentMode === 'Cash'}
                            onChange={(e) => setManualBooking({...manualBooking, paymentMode: e.target.value})}
                            className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                          />
                          <span className="text-sm font-medium">Cash</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name="paymentMode" 
                            value="Online"
                            checked={manualBooking.paymentMode === 'Online'}
                            onChange={(e) => setManualBooking({...manualBooking, paymentMode: e.target.value})}
                            className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                          />
                          <span className="text-sm font-medium">Online</span>
                        </label>
                      </div>
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

      {/* Amount Update Modal */}
      {isAmountModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">Update Booking Amount</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="text-xs font-bold text-gray-400 uppercase mb-1">Current Details</div>
                <div className="font-bold text-gray-900">{selectedBooking?.partyName || selectedBooking?.visitorName}</div>
                <div className="text-sm text-gray-500">Original Amount: ₹{(selectedBooking?.totalAmount || 0).toLocaleString()}</div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1 text-gray-700">New Amount (INR)</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500" 
                  value={newAmount} 
                  onChange={e => setNewAmount(parseFloat(e.target.value) || 0)}
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

      {/* Invoice Modal */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">Generate Invoice</h3>
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="text-xs font-bold text-gray-400 uppercase mb-1">Booking Details</div>
                <div className="font-bold text-gray-900">{selectedBooking?.targetName}</div>
                <div className="text-sm text-gray-500">{selectedBooking?.partyName || selectedBooking?.visitorName} | {selectedBooking?.eventDate}</div>
                <div className="text-sm font-bold text-orange-600 mt-1">Base Amount: ₹{(selectedBooking?.updatedAmount || selectedBooking?.totalAmount || 0).toLocaleString()}</div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">Payment Mode</label>
                  <div className="flex space-x-4">
                    {['Cash', 'Online'].map(mode => (
                      <button
                        key={mode}
                        onClick={() => setPaymentMode(mode as any)}
                        className={cn(
                          "flex-1 py-2 px-4 rounded-xl font-bold border transition-all",
                          paymentMode === mode ? "bg-orange-600 text-white border-orange-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        )}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Additional Expenditure (INR)</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500" 
                  value={expenditure} 
                  onChange={e => setExpenditure(parseFloat(e.target.value) || 0)}
                  placeholder="Enter extra costs if any"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-gray-700">Extra Services & Charges</label>
                  <button 
                    onClick={() => setExtraServices([...extraServices, { name: '', amount: 0 }])}
                    className="text-orange-600 text-sm font-bold flex items-center hover:text-orange-700"
                  >
                    <Plus size={16} className="mr-1" /> Add Another
                  </button>
                </div>
                {extraServices.map((service, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-orange-50/50 rounded-2xl border border-orange-100">
                    <input 
                      type="text" 
                      placeholder="Service Name"
                      className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500"
                      value={service.name}
                      onChange={e => {
                        const newServices = [...extraServices];
                        newServices[index].name = e.target.value;
                        setExtraServices(newServices);
                      }}
                    />
                    <div className="flex space-x-2">
                      <input 
                        type="number" 
                        placeholder="Amount"
                        className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500"
                        value={service.amount || ''}
                        onChange={e => {
                          const newServices = [...extraServices];
                          newServices[index].amount = parseFloat(e.target.value) || 0;
                          setExtraServices(newServices);
                        }}
                      />
                      <button 
                        onClick={() => setExtraServices(extraServices.filter((_, i) => i !== index))}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <div className="text-lg font-bold text-gray-900">
                  Total: ₹{((selectedBooking?.updatedAmount || selectedBooking?.totalAmount || 0) + expenditure + extraServices.reduce((sum, s) => sum + s.amount, 0)).toLocaleString()}
                </div>
                <div className="flex space-x-3">
                  <button onClick={() => setIsInvoiceModalOpen(false)} className="px-6 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                  <button onClick={confirmInvoice} className="bg-orange-600 text-white px-8 py-2 rounded-xl font-bold hover:bg-orange-700 shadow-lg shadow-orange-200">Generate & Send</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">Update Payment Status</h3>
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="text-xs font-bold text-gray-400 uppercase mb-1">Booking Details</div>
                <div className="font-bold text-gray-900">{selectedBooking?.partyName || selectedBooking?.visitorName}</div>
                <div className="text-sm text-gray-500">{selectedBooking?.targetName}</div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-3 text-gray-700">Payment Status</label>
                <div className="flex space-x-4">
                  {['Pending', 'Paid'].map(status => (
                    <button
                      key={status}
                      onClick={() => setPaymentStatus(status as any)}
                      className={cn(
                        "flex-1 py-3 px-4 rounded-xl font-bold border transition-all",
                        paymentStatus === status ? "bg-orange-600 text-white border-orange-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                      )}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button onClick={() => setIsPaymentModalOpen(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold">Cancel</button>
                <button onClick={handleUpdatePaymentStatus} className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-200">Update Status</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAcceptModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">Confirm Booking</h3>
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
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if (num === 0) return 'Zero';
  
  const convert = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + convert(n % 10000000) : '');
  };
  
  return convert(num) + ' Rupees Only';
};

const generateInvoice = (booking: Booking, expenditure: number, providerProfile?: UserProfile | null) => {
  const doc = new jsPDF();
  const timestamp = format(new Date(), 'dd/MM/yyyy HH:mm:ss');
  const baseAmount = booking.updatedAmount || booking.totalAmount || 0;
  const extraServicesTotal = booking.extra_services?.reduce((sum, s) => sum + s.amount, 0) || 0;
  const totalAmount = baseAmount + expenditure + extraServicesTotal;
  const partyName = booking.isManual ? booking.partyName : booking.visitorName;
  const partyMobile = booking.isManual ? booking.visitorMobile : booking.visitorMobile;
  
  // --- Letterhead Header ---
  // Venue/Service Name as Heading
  doc.setFontSize(24);
  doc.setTextColor(234, 88, 12); // orange-600
  doc.setFont("helvetica", "bold");
  doc.text(booking.targetName.toUpperCase(), 105, 20, { align: 'center' });
  
  // Left side: Owner/Provider Name & Mobile
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.setFont("helvetica", "normal");
  doc.text(`Owner: ${providerProfile?.displayName || 'N/A'}`, 20, 30);
  doc.text(`Mobile: ${providerProfile?.mobileNumber || 'N/A'}`, 20, 35);
  
  // Right side: Address
  if (providerProfile) {
    const address = `${providerProfile.block || ''}, ${providerProfile.district || ''}, ${providerProfile.state || ''} - ${providerProfile.pincode || ''}`;
    doc.text(address, 190, 30, { align: 'right', maxWidth: 80 });
  }
  
  doc.setDrawColor(234, 88, 12);
  doc.setLineWidth(0.5);
  doc.line(20, 42, 190, 42);
  
  // --- Invoice Body ---
  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", 20, 55);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Invoice No: INV-${booking.id.substring(0, 8).toUpperCase()}`, 140, 55);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 140, 60);
  doc.text(`Time: ${timestamp.split(' ')[1]}`, 140, 65);
  
  // Customer Details (Bill To)
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("BILL TO:", 20, 75);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${partyName}`, 20, 83);
  doc.text(`Mobile: ${partyMobile}`, 20, 88);
  if (booking.partyAddress) {
    doc.text(`Address: ${booking.partyAddress}`, 20, 93);
  }
  doc.text(`Event: ${booking.eventType || 'N/A'}`, 20, 98);
  doc.text(`Date: ${booking.eventDate}${booking.endDate ? ' to ' + booking.endDate : ''}`, 20, 103);
  if (booking.startTime) {
    doc.text(`Timing: ${booking.startTime} - ${booking.endTime}`, 20, 108);
  }

  // Payment Mode & Status
  doc.setFont("helvetica", "bold");
  doc.text(`Payment Mode: ${booking.paymentMode || 'Not Specified'}`, 140, 75);
  doc.text(`Payment Status: ${(booking.status || 'pending').toUpperCase()}`, 140, 80);
  doc.setFont("helvetica", "normal");

  // Table Header
  doc.setFillColor(245, 245, 245);
  doc.rect(20, 120, 170, 10, 'F');
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.text("Description", 25, 127);
  doc.text("Amount (INR)", 160, 127, { align: 'right' });

  // Table Rows
  doc.setFont("helvetica", "normal");
  doc.text(`Base Booking Amount for ${booking.targetName}`, 25, 140);
  doc.text(baseAmount.toLocaleString(), 160, 140, { align: 'right' });

  let currentY = 150;
  if (expenditure > 0) {
    doc.text("Additional Expenditure", 25, currentY);
    doc.text(expenditure.toLocaleString(), 160, currentY, { align: 'right' });
    currentY += 10;
  }

  if (booking.extra_services && booking.extra_services.length > 0) {
    booking.extra_services.forEach(service => {
      doc.text(service.name, 25, currentY);
      doc.text(service.amount.toLocaleString(), 160, currentY, { align: 'right' });
      currentY += 10;
    });
  }

  // Total
  doc.setDrawColor(200);
  doc.line(20, currentY + 5, 190, currentY + 5);
  doc.setFontSize(14);
  doc.setTextColor(234, 88, 12);
  doc.setFont("helvetica", "bold");
  doc.text("Total Amount:", 110, currentY + 20);
  doc.text(`INR ${totalAmount.toLocaleString()}`, 185, currentY + 20, { align: 'right' });

  // Amount in words
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.setFont("helvetica", "italic");
  doc.text(`Amount in words: ${numberToWords(totalAmount)}`, 20, currentY + 30);

  // --- Footer ---
  doc.setDrawColor(234, 88, 12);
  doc.line(20, 265, 190, 265);
  
  // App Logo (EM) in footer
  doc.setFillColor(234, 88, 12);
  doc.circle(25, 275, 6, 'F');
  doc.setFontSize(8);
  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.text("EM", 25, 276, { align: 'center' });

  doc.setFontSize(14);
  doc.setTextColor(234, 88, 12);
  doc.text("BOOK MY VANUE", 35, 276);
  
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.setFont("helvetica", "normal");
  doc.text("ALL IN ONE BOOKING PLAT FORM FOR YOUR SPECIAL TIME", 35, 281);
  
  doc.setTextColor(234, 88, 12);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("www.bookmyvanue.in", 190, 276, { align: 'right' });

  return doc.output('blob');
};

const DashboardView = ({ user, profile, onUpdateProfile }: { user: any, profile: UserProfile | null, onUpdateProfile: (p: UserProfile) => void }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as any) || 'overview';
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'venues' | 'orders' | 'services' | 'catalogue' | 'subscription' | 'booking-manager' | 'reports'>(initialTab);
  const [reportFilters, setReportFilters] = useState({
    name: '',
    mobile: '',
    startDate: '',
    endDate: '',
    paymentMode: '',
    paymentStatus: '',
    bookingType: ''
  });

  const downloadReport = (type: 'excel' | 'pdf' = 'excel') => {
    const filteredBookings = bookings.filter(b => {
      const matchesName = b.visitorName?.toLowerCase().includes(reportFilters.name.toLowerCase()) || b.partyName?.toLowerCase().includes(reportFilters.name.toLowerCase());
      const matchesMobile = b.visitorMobile?.includes(reportFilters.mobile);
      const matchesMode = !reportFilters.paymentMode || b.paymentMode === reportFilters.paymentMode;
      const matchesStatus = !reportFilters.paymentStatus || b.paymentStatus === reportFilters.paymentStatus;
      const matchesType = !reportFilters.bookingType || (reportFilters.bookingType === 'Manual' ? b.isManual : !b.isManual);
      const bDate = new Date(b.eventDate);
      const matchesStart = !reportFilters.startDate || bDate >= new Date(reportFilters.startDate);
      const matchesEnd = !reportFilters.endDate || bDate <= new Date(reportFilters.endDate);
      return matchesName && matchesMobile && matchesMode && matchesStatus && matchesStart && matchesEnd && matchesType;
    });

    if (type === 'excel') {
      const data = filteredBookings.map((b, index) => ({
        'S.No': index + 1,
        'Request Status': b.status === 'confirmed' ? 'Accepted' : b.status === 'cancelled' ? 'Rejected' : b.status,
        'Customer Name': b.partyName || b.visitorName || 'N/A',
        'Mobile Number': b.visitorMobile || 'N/A',
        'Address': b.partyAddress || 'N/A',
        'Booking Date & Time': `${b.eventDate} ${b.startTime || ''}`,
        'Invoice Number': `INV-${b.id.substring(0, 8).toUpperCase()}`,
        'Invoice Amount (Rs)': b.updatedAmount || b.totalAmount || 0,
        'Payment Mode': b.paymentMode || 'N/A',
        'Payment Status': b.paymentStatus || 'Pending',
        'Booking Type': b.isManual ? 'Manual' : 'Order'
      }));
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");
      XLSX.writeFile(workbook, "booking_report.xlsx");
    } else {
      const doc = new jsPDF('l', 'mm', 'a4'); // Landscape
      doc.setFontSize(18);
      doc.text("Booking Transaction Report", 14, 20);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
      
      const headers = [
        ['S.No', 'Status', 'Customer', 'Mobile', 'Address', 'Date & Time', 'Invoice No', 'Amount', 'Mode', 'P.Status', 'Type']
      ];
      
      const data = filteredBookings.map((b, index) => [
        (index + 1).toString(),
        b.status === 'confirmed' ? 'Accepted' : b.status === 'cancelled' ? 'Rejected' : b.status,
        b.partyName || b.visitorName || 'N/A',
        b.visitorMobile || 'N/A',
        (b.partyAddress || 'N/A').substring(0, 20),
        `${b.eventDate} ${b.startTime || ''}`,
        `INV-${b.id.substring(0, 8).toUpperCase()}`,
        `Rs.${b.updatedAmount || b.totalAmount}`,
        b.paymentMode || 'N/A',
        b.paymentStatus || 'Pending',
        b.isManual ? 'Manual' : 'Order'
      ]);

      (doc as any).autoTable({
        head: headers,
        body: data,
        startY: 40,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [234, 88, 12] } // Orange-600
      });
      
      doc.save("booking_report.pdf");
    }
    toast.success(`Report downloaded as ${type.toUpperCase()}`);
  };

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [services, setServices] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubscriptionReminder, setShowSubscriptionReminder] = useState(false);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!profile || profile.role === 'user' || profile.role === 'admin') return;
      
      const { data: sub } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.uid)
        .eq('status', 'active')
        .maybeSingle();
      
      if (!sub) {
        setShowSubscriptionReminder(true);
        // Weekly reminder logic: check if we already reminded this week
        const lastReminded = localStorage.getItem(`last_reminded_${user.uid}`);
        const now = new Date().getTime();
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        
        if (!lastReminded || now - parseInt(lastReminded) > oneWeek) {
          const msg = `Hello ${profile.displayName}, you don't have an active subscription plan. Please subscribe to continue receiving business inquiries.`;
          sendWhatsAppAlert(profile.mobileNumber, msg);
          localStorage.setItem(`last_reminded_${user.uid}`, now.toString());
        }
      }
    };
    if (profile && user) checkSubscription();
  }, [profile, user?.uid]);

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

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as any);
    setSearchParams({ tab });
    setIsMobileMenuOpen(false);
  };

  const fetchDashboardData = async () => {
    if (!user?.uid) return;
    try {
      const { data: bData } = await supabase
        .from('bookings')
        .select('*')
        .or(`user_id.eq.${user.uid},owner_id.eq.${user.uid}`);
      
      if (bData) {
        setBookings(bData.map(d => ({
          ...d,
          userId: d.user_id,
          visitorName: d.visitor_name,
          visitorMobile: d.visitor_mobile,
          eventType: d.event_type,
          targetId: d.target_id,
          targetType: d.target_type,
          targetName: d.target_name,
          ownerId: d.owner_id,
          eventDate: d.event_date,
          totalAmount: d.total_amount,
          updatedAmount: d.updated_amount,
          paymentStatus: d.payment_status,
          paymentMode: d.payment_mode,
          is_invoice_generated: d.is_invoice_generated,
          invoice_url: d.invoice_url,
          createdAt: d.created_at
        }) as Booking));
      }

      const { data: vData } = await supabase
        .from('venues')
        .select('*')
        .eq('owner_id', user.uid);
      
      if (vData) {
        setVenues(vData.map(d => ({
          ...d,
          ownerId: d.owner_id,
          venueType: d.venue_type,
          pricePerDay: d.price_per_day,
          reviewCount: d.review_count,
          createdAt: d.created_at
        }) as Venue));
      }

      const { data: sData } = await supabase
        .from('service_providers')
        .select('*')
        .eq('provider_id', user.uid);
      
      if (sData) {
        setServices(sData.map(d => ({
          ...d,
          providerId: d.provider_id,
          serviceType: d.service_type,
          priceRange: d.price_range,
          priceLevel: d.price_level,
          reviewCount: d.review_count,
          createdAt: d.created_at
        }) as ServiceProvider));
      }
    } catch (err) {
      console.error('Dashboard data error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.uid) return;
    fetchDashboardData();

    // Realtime subscriptions
    const bookingChannel = supabase
      .channel(`dashboard_bookings_${user.uid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    const venueChannel = supabase
      .channel(`dashboard_venues_${user.uid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'venues' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    const serviceChannel = supabase
      .channel(`dashboard_services_${user.uid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_providers' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(bookingChannel);
      supabase.removeChannel(venueChannel);
      supabase.removeChannel(serviceChannel);
    };
  }, [user?.uid, profile?.role]);

  if (!user) return <Navigate to="/login" />;

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <BarChart2 size={20} />, roles: ['owner', 'provider', 'user'] },
    { id: 'booking-manager', label: 'Booking Manager', icon: <Plus size={20} />, roles: ['owner', 'provider'] },
    { id: 'catalogue', label: 'Catalogue Manage', icon: <ImageIcon size={20} />, roles: ['owner', 'provider'] },
    { id: 'orders', label: 'Order Manage', icon: <Calendar size={20} />, roles: ['owner', 'provider', 'user'] },
    { id: 'profile', label: 'Profile Manage', icon: <UserIcon size={20} /> },
    { id: 'reports', label: 'Reports', icon: <FileText size={20} />, roles: ['owner', 'provider'] },
    { id: 'services', label: 'Services Manage', icon: <Music size={20} />, roles: ['provider'] },
    { id: 'subscription', label: 'Subscription', icon: <CreditCard size={20} />, roles: ['owner', 'provider'] },
    { id: 'venues', label: 'Venue Manage', icon: <Home size={20} />, roles: ['owner'] },
  ].sort((a, b) => {
    if (a.id === 'overview') return -1;
    if (b.id === 'overview') return 1;
    return a.label.localeCompare(b.label);
  });

  const filteredMenu = menuItems.filter(item => {
    if (profile?.role === 'admin') {
      return true; // Admins can see everything
    }
    return !item.roles || item.roles.includes(profile?.role || '');
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending' || b.paymentStatus === 'Pending').length,
    approved: bookings.filter(b => b.status === 'confirmed').length,
    paid: bookings.filter(b => b.status === 'paid' || b.paymentStatus === 'Paid').length
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
                  <h2 className="font-bold text-lg">Dashboard</h2>
                  <p className="text-xs opacity-80">Welcome, {profile?.displayName}</p>
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
                      <span>{item.label}</span>
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
              className="bg-white rounded-3xl shadow-xl border border-orange-100 p-8 min-h-[600px]"
            >
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                    <span className="bg-orange-100 text-orange-600 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
                      {profile?.role}
                    </span>
                  </div>

                  {/* Profile Card */}
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                      <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white/20 shadow-xl">
                        {profile?.photoURL ? (
                          <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
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
                      <div className="text-3xl font-black text-gray-900 mb-1">{stats.paid}</div>
                      <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Paid</div>
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
              {activeTab === 'orders' && (
                <OrderManageView user={user} profile={profile} bookings={bookings} onUpdate={fetchDashboardData} />
              )}
              {activeTab === 'booking-manager' && (
                <BookingManagerView user={user} profile={profile} />
              )}
              {activeTab === 'services' && (
                <ServicesManageView user={user} services={services} />
              )}
              {activeTab === 'catalogue' && (
                <CatalogueManageView venues={venues} services={services} />
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

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                      <div>
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
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Payment Status</label>
                        <select 
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                          value={reportFilters.paymentStatus}
                          onChange={(e) => setReportFilters({...reportFilters, paymentStatus: e.target.value})}
                        >
                          <option value="">All Status</option>
                          <option value="Paid">Paid</option>
                          <option value="Pending">Pending</option>
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
                              <th className="py-4 font-bold text-gray-400 text-sm uppercase tracking-wider">Amount</th>
                              <th className="py-4 font-bold text-gray-400 text-sm uppercase tracking-wider">Mode</th>
                              <th className="py-4 font-bold text-gray-400 text-sm uppercase tracking-wider">P.Status</th>
                              <th className="py-4 font-bold text-gray-400 text-sm uppercase tracking-wider">Type</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {bookings.filter(b => {
                              const matchesName = b.visitorName?.toLowerCase().includes(reportFilters.name.toLowerCase()) || b.partyName?.toLowerCase().includes(reportFilters.name.toLowerCase());
                              const matchesMobile = b.visitorMobile?.includes(reportFilters.mobile);
                              const matchesMode = !reportFilters.paymentMode || b.paymentMode === reportFilters.paymentMode;
                              const matchesStatus = !reportFilters.paymentStatus || b.paymentStatus === reportFilters.paymentStatus;
                              const matchesType = !reportFilters.bookingType || (reportFilters.bookingType === 'Manual' ? b.isManual : !b.isManual);
                              const bDate = new Date(b.eventDate);
                              const matchesStart = !reportFilters.startDate || bDate >= new Date(reportFilters.startDate);
                              const matchesEnd = !reportFilters.endDate || bDate <= new Date(reportFilters.endDate);
                              return matchesName && matchesMobile && matchesMode && matchesStatus && matchesStart && matchesEnd && matchesType;
                            }).map((b, index) => (
                              <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="py-4 text-sm text-gray-500">{index + 1}</td>
                                <td className="py-4">
                                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                    b.status === 'confirmed' || b.status === 'paid' ? 'bg-green-100 text-green-600' : 
                                    b.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                                  }`}>
                                    {b.status === 'confirmed' ? 'Accepted' : b.status}
                                  </span>
                                </td>
                                <td className="py-4 font-bold text-gray-900">{b.partyName || b.visitorName}</td>
                                <td className="py-4 text-sm text-gray-600">{b.visitorMobile}</td>
                                <td className="py-4 text-xs text-gray-500 max-w-[150px] truncate">{b.partyAddress || 'N/A'}</td>
                                <td className="py-4 text-sm text-gray-600">
                                  {format(new Date(b.eventDate), 'MMM dd, yyyy')} {b.startTime || ''}
                                </td>
                                <td className="py-4 text-xs font-mono text-gray-500">
                                  INV-{b.id.substring(0, 8).toUpperCase()}
                                </td>
                                <td className="py-4 font-bold text-gray-900">₹{b.updatedAmount || b.totalAmount}</td>
                                <td className="py-4 text-sm text-gray-600">{b.paymentMode || 'N/A'}</td>
                                <td className="py-4">
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                    b.paymentStatus === 'Paid' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                                  }`}>
                                    {b.paymentStatus || 'Pending'}
                                  </span>
                                </td>
                                <td className="py-4 text-xs font-bold text-gray-500 uppercase">{b.isManual ? 'Manual' : 'Order'}</td>
                              </tr>
                            ))}
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
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const VenueManageView = ({ user, venues }: { user: any, venues: Venue[] }) => {
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('venues').delete().eq('id', id);
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

const OrderManageView = ({ user, profile, bookings, onUpdate }: { user: any, profile: UserProfile | null, bookings: Booking[], onUpdate?: () => void }) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  const visitorBookings = bookings.filter(b => !b.isManual);
  
  const filteredBookings = visitorBookings.filter(b => {
    const isPaid = b.paymentStatus === 'Paid' || b.status === 'paid';
    if (isPaid) return false;
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchesDate = !dateFilter || b.eventDate === dateFilter;
    return matchesStatus && matchesDate;
  });

  const sortedBookings = [...filteredBookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAmountModalOpen, setIsAmountModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [expenditure, setExpenditure] = useState(0);
  const [extraServices, setExtraServices] = useState<{ name: string; amount: number }[]>([]);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'Online'>('Cash');
  const [paymentStatus, setPaymentStatus] = useState<'Pending' | 'Paid'>('Pending');
  const [newAmount, setNewAmount] = useState(0);

  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isCallSatisfied, setIsCallSatisfied] = useState(false);

  const handleStatus = async (id: string, status: string) => {
    if (status === 'confirmed' && !isCallSatisfied) {
      toast.error('Please confirm that you have called the visitor');
      return;
    }
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
    if (!error) {
      toast.success('Status updated to ' + status);
      setIsAcceptModalOpen(false);
      setIsCallSatisfied(false);
    } else {
      toast.error('Failed to update status');
    }
  };

  const handleUpdateAmount = async () => {
    if (!selectedBooking) return;
    const { error } = await supabase.from('bookings').update({ updated_amount: newAmount }).eq('id', selectedBooking.id);
    if (!error) {
      toast.success('Booking amount updated');
      setIsAmountModalOpen(false);
      setSelectedBooking(null);
    } else {
      toast.error('Failed to update amount');
    }
  };

  const handleGenerateInvoice = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsInvoiceModalOpen(true);
  };

  const confirmInvoice = async () => {
    if (selectedBooking) {
      const updatedBooking = {
        ...selectedBooking,
        extra_services: extraServices,
        paymentMode,
        paymentStatus: 'Pending' as 'Pending',
        status: selectedBooking.status
      };
      
      const pdfBlob = generateInvoice(updatedBooking, expenditure, profile);
      
      // Upload to Supabase Storage to get a public link
      const fileName = `invoices/INV-${selectedBooking.id.substring(0, 8)}-${Date.now()}.pdf`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, pdfBlob, { contentType: 'application/pdf' });

      let downloadUrl = '';
      if (!uploadError && uploadData) {
        const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
        downloadUrl = publicUrl;
      }

      const extraTotal = extraServices.reduce((sum, s) => sum + s.amount, 0);
      const finalAmount = (selectedBooking.updatedAmount || selectedBooking.totalAmount || 0) + expenditure + extraTotal;
      
      let msg = `Hello ${selectedBooking.visitorName}, your invoice for ${selectedBooking.targetName} has been generated. Total Amount: INR ${finalAmount.toLocaleString()}. Payment Mode: ${paymentMode}. Status: Pending.`;
      if (downloadUrl) {
        msg += `\n\nDownload Invoice PDF: ${downloadUrl}`;
      }
      
      sendWhatsAppAlert(selectedBooking.visitorMobile || '', msg);
      
      await supabase.from('bookings').update({ 
        is_invoice_generated: true,
        extra_services: extraServices,
        payment_mode: paymentMode,
        payment_status: 'Pending',
        status: selectedBooking.status,
        invoice_url: downloadUrl
      }).eq('id', selectedBooking.id);
      
      if (onUpdate) onUpdate();
      
      setIsInvoiceModalOpen(false);
      setSelectedBooking(null);
      setExpenditure(0);
      setExtraServices([]);
      setPaymentStatus('Pending');
      toast.success('Invoice generated and shared via WhatsApp');
    }
  };

  const handleUpdatePaymentStatus = async () => {
    if (!selectedBooking) return;
    
    if (selectedBooking.paymentStatus === 'Paid' || selectedBooking.status === 'paid') {
      toast.error('This booking is already marked as PAID and cannot be updated.');
      setIsPaymentModalOpen(false);
      return;
    }

    try {
      console.log('Updating payment status for booking (PaymentModal):', selectedBooking.id, 'to:', paymentStatus);
      const { error } = await supabase.from('bookings').update({ 
        payment_status: paymentStatus,
        status: paymentStatus === 'Paid' ? 'paid' : selectedBooking.status
      }).eq('id', selectedBooking.id);

      if (error) {
        console.error('Payment update error (PaymentModal):', error);
        toast.error(`Error: ${error.message}`);
        throw error;
      }

      if (onUpdate) onUpdate();
      
      toast.success(`Payment status updated to ${paymentStatus}`);
      setIsPaymentModalOpen(false);
      setSelectedBooking(null);
    } catch (err) {
      console.error('Payment status update failed (PaymentModal):', err);
      toast.error('Failed to update payment status');
    }
  };

  const handlePayment = async (booking: Booking) => {
    if (!user || !profile) return;

    try {
      // 1. Create order on server
      const response = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: booking.totalAmount,
          currency: 'INR',
          receipt: `booking_${booking.id}`,
          notes: {
            userId: user.uid,
            bookingId: booking.id,
            targetName: booking.targetName
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
        name: "Event Manager",
        description: `Payment for ${booking.targetName}`,
        order_id: order.id,
        handler: async function (response: any) {
          // 3. On success, update database
          try {
            const { error } = await supabase.from('bookings').update({ 
              status: 'paid'
            }).eq('id', booking.id);
            
            if (error) throw error;
            toast.success(`Payment successful for ${booking.targetName}`);
          } catch (err) {
            toast.error('Failed to update payment status');
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
      rzp.open();

    } catch (err) {
      console.error('Razorpay error:', err);
      toast.error('Payment initialization failed');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Manage Orders</h2>
        <div className="flex flex-wrap gap-2">
          <select 
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-orange-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Approved</option>
            <option value="cancelled">Rejected</option>
            <option value="paid">Paid</option>
          </select>
          <input 
            type="date" 
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-orange-500"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {sortedBookings.map(b => (
          <div key={b.id} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-bold text-lg">{b.targetName}</span>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                  b.status === 'confirmed' ? "bg-green-100 text-green-700" : 
                  b.status === 'pending' ? "bg-yellow-100 text-yellow-700" : 
                  b.status === 'paid' ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
                )}>
                  {b.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center text-sm text-gray-500 gap-x-4 gap-y-2 mt-2">
                <span className="flex items-center bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm"><Calendar size={14} className="mr-1 text-orange-600" /> {b.eventDate}</span>
                <span className="flex items-center bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm"><IndianRupee size={14} className="mr-1 text-orange-600" /> {(b.updatedAmount || b.totalAmount || 0).toLocaleString()}</span>
                {b.startTime && <span className="flex items-center bg-orange-50 text-orange-700 px-3 py-1 rounded-lg border border-orange-100 font-bold"><Clock size={14} className="mr-1" /> {b.startTime} - {b.endTime}</span>}
              </div>
              
              <div className="mt-4 p-4 bg-white rounded-2xl border border-gray-100 space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <User size={14} className="text-gray-400" />
                    <span className="text-gray-500">Sender:</span>
                    <span className="font-bold text-gray-900">{b.visitorName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone size={14} className="text-gray-400" />
                    <span className="text-gray-500">Mobile:</span>
                    <span className="font-bold text-gray-900">{b.visitorMobile}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Tag size={14} className="text-gray-400" />
                    <span className="text-gray-500">Event:</span>
                    <span className="font-bold text-gray-900">{b.eventType || 'N/A'}</span>
                  </div>
                </div>
                {b.message && (
                  <div className="pt-2 border-t border-gray-50">
                    <p className="text-xs text-gray-500 italic flex items-start">
                      <MessageSquare size={12} className="mr-1 mt-0.5 shrink-0" />
                      <span>"{b.message}"</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              {/* Owner/Provider Actions */}
              {b.status === 'pending' && b.ownerId === user?.uid && (
                <>
                  <button 
                    onClick={() => {
                      setSelectedBooking(b);
                      setIsAcceptModalOpen(true);
                    }} 
                    className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-700"
                  >
                    Accept
                  </button>
                  <button onClick={() => handleStatus(b.id, 'cancelled')} className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-700">Reject</button>
                </>
              )}

              {(b.status === 'confirmed' || b.status === 'paid') && b.ownerId === user?.uid && (
                <>
                  <button 
                    disabled={b.is_invoice_generated || b.status === 'paid' || b.paymentStatus === 'Paid'}
                    onClick={() => {
                      if (b.is_invoice_generated || b.status === 'paid' || b.paymentStatus === 'Paid') {
                        toast.error('Amount cannot be updated after invoice generation or payment');
                        return;
                      }
                      setSelectedBooking(b);
                      setNewAmount(b.updatedAmount || b.totalAmount);
                      setIsAmountModalOpen(true);
                    }}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-bold flex items-center space-x-2 transition-all",
                      (b.is_invoice_generated || b.status === 'paid' || b.paymentStatus === 'Paid') ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-orange-100 text-orange-600 hover:bg-orange-200"
                    )}
                  >
                    <Edit2 size={16} />
                    <span>Update Amount</span>
                  </button>
                  <button 
                    onClick={() => handleGenerateInvoice(b)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <Download size={16} />
                    <span>Invoice</span>
                  </button>
                  {(b.paymentStatus || b.is_invoice_generated || b.status === 'confirmed') && (
                    <button 
                      disabled={b.paymentStatus === 'Paid' || b.status === 'paid'}
                      onClick={() => {
                        if (b.paymentStatus === 'Paid' || b.status === 'paid') {
                          toast.error('Payment status is already marked as PAID');
                          return;
                        }
                        setSelectedBooking(b);
                        setPaymentStatus(b.paymentStatus || 'Pending');
                        setIsPaymentModalOpen(true);
                      }}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-bold flex items-center space-x-2 transition-all",
                        (b.paymentStatus === 'Paid' || b.status === 'paid') ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-green-600 text-white hover:bg-green-700"
                      )}
                    >
                      <CreditCard size={16} />
                      <span>Payment Status</span>
                    </button>
                  )}
                </>
              )}
              
              {/* User Actions */}
              {b.status === 'confirmed' && b.userId === user?.uid && (
                <button 
                  onClick={() => handlePayment(b)}
                  className="bg-orange-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-orange-700 flex items-center space-x-2"
                >
                  <CreditCard size={16} />
                  <span>Pay Now</span>
                </button>
              )}
            </div>
          </div>
        ))}
        {sortedBookings.length === 0 && <p className="text-gray-500 text-center py-10">No matching orders found.</p>}
      </div>

      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">Update Payment Status</h3>
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="text-xs font-bold text-gray-400 uppercase mb-1">Booking Details</div>
                <div className="font-bold text-gray-900">{selectedBooking?.targetName}</div>
                <div className="text-sm text-gray-500">{selectedBooking?.visitorName}</div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-3 text-gray-700">Payment Status</label>
                <div className="flex space-x-4">
                  {['Pending', 'Paid'].map(status => (
                    <button
                      key={status}
                      onClick={() => setPaymentStatus(status as any)}
                      className={cn(
                        "flex-1 py-3 px-4 rounded-xl font-bold border transition-all",
                        paymentStatus === status ? "bg-orange-600 text-white border-orange-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                      )}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button onClick={() => setIsPaymentModalOpen(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold">Cancel</button>
                <button onClick={handleUpdatePaymentStatus} className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-200">Update Status</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isInvoiceModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6">Generate Invoice</h3>
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="text-xs font-bold text-gray-400 uppercase mb-1">Booking Details</div>
                <div className="font-bold text-gray-900">{selectedBooking?.targetName}</div>
                <div className="text-sm text-gray-500">{selectedBooking?.visitorName} | {selectedBooking?.eventDate}</div>
                <div className="text-sm font-bold text-orange-600 mt-1">Base Amount: ₹{(selectedBooking?.updatedAmount || selectedBooking?.totalAmount || 0).toLocaleString()}</div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">Payment Mode</label>
                  <div className="flex space-x-4">
                    {['Cash', 'Online'].map(mode => (
                      <button
                        key={mode}
                        onClick={() => setPaymentMode(mode as any)}
                        className={cn(
                          "flex-1 py-2 px-4 rounded-xl font-bold border transition-all",
                          paymentMode === mode ? "bg-orange-600 text-white border-orange-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        )}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Additional Expenditure (INR)</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500" 
                  value={expenditure} 
                  onChange={e => setExpenditure(parseFloat(e.target.value) || 0)}
                  placeholder="Enter extra costs if any"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-gray-700">Extra Services & Charges</label>
                  <button 
                    onClick={() => setExtraServices([...extraServices, { name: '', amount: 0 }])}
                    className="text-orange-600 text-sm font-bold flex items-center hover:text-orange-700"
                  >
                    <Plus size={16} className="mr-1" /> Add Another
                  </button>
                </div>
                {extraServices.map((service, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-orange-50/50 rounded-2xl border border-orange-100">
                    <input 
                      type="text" 
                      placeholder="Service Name"
                      className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500"
                      value={service.name}
                      onChange={e => {
                        const newServices = [...extraServices];
                        newServices[index].name = e.target.value;
                        setExtraServices(newServices);
                      }}
                    />
                    <div className="flex space-x-2">
                      <input 
                        type="number" 
                        placeholder="Amount"
                        className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500"
                        value={service.amount || ''}
                        onChange={e => {
                          const newServices = [...extraServices];
                          newServices[index].amount = parseFloat(e.target.value) || 0;
                          setExtraServices(newServices);
                        }}
                      />
                      <button 
                        onClick={() => setExtraServices(extraServices.filter((_, i) => i !== index))}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <div className="text-lg font-bold text-gray-900">
                  Total: ₹{((selectedBooking?.updatedAmount || selectedBooking?.totalAmount || 0) + expenditure + extraServices.reduce((sum, s) => sum + s.amount, 0)).toLocaleString()}
                </div>
                <div className="flex space-x-3">
                  <button onClick={() => setIsInvoiceModalOpen(false)} className="px-6 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                  <button onClick={confirmInvoice} className="bg-orange-600 text-white px-8 py-2 rounded-xl font-bold hover:bg-orange-700 shadow-lg shadow-orange-200">Generate & Send</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAcceptModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-6">Confirm Booking</h3>
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

      {isAmountModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-6">Update Booking Amount</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="text-xs font-bold text-gray-400 uppercase mb-1">Current Amount</div>
                <div className="text-2xl font-black text-gray-900">₹{(selectedBooking?.updatedAmount || selectedBooking?.totalAmount || 0).toLocaleString()}</div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1 text-gray-700">New Total Amount (INR)</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500" 
                  value={newAmount} 
                  onChange={e => setNewAmount(parseFloat(e.target.value) || 0)}
                  placeholder="Enter new amount"
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <button onClick={() => setIsAmountModalOpen(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold">Cancel</button>
                <button onClick={handleUpdateAmount} className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-bold">Update Amount</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ServicesManageView = ({ user, services }: { user: any, services: ServiceProvider[] }) => {
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('service_providers').delete().eq('id', id);
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

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (!user || !profile) return;
      setLoading(true);
      try {
        const { data: pData } = await supabase.from('subscription_plans').select('*').eq('role', profile.role).eq('is_active', true);
        if (pData) setPlans(pData.map(d => ({ id: d.id, name: d.name, price: d.price, duration: d.duration, role: d.role, isActive: d.is_active, createdAt: d.created_at } as SubscriptionPlan)));

        const { data: sData } = await supabase.from('user_subscriptions').select('*').eq('user_id', user.uid).eq('status', 'active').order('end_date', { ascending: false }).limit(1);
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
            userId: user.uid,
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
        name: "Event Manager",
        description: `Subscription for ${plan.name}`,
        order_id: order.id,
        handler: async function (response: any) {
          // 3. On success, update database
          const startDate = new Date();
          const endDate = new Date();
          if (plan.duration === 'month') endDate.setMonth(endDate.getMonth() + 1);
          else endDate.setFullYear(endDate.getFullYear() + 1);

          try {
            const { error } = await supabase.from('user_subscriptions').insert([{
              user_id: user.uid,
              plan_id: plan.id,
              start_date: startDate.toISOString(),
              end_date: endDate.toISOString(),
              status: 'active',
              amount: plan.price,
              payment_id: response.razorpay_payment_id,
              order_id: response.razorpay_order_id,
              signature: response.razorpay_signature
            }]);
            if (error) throw error;
            toast.success(`Subscribed to ${plan.name}`);
            window.location.reload();
          } catch (err) {
            toast.error('Failed to record subscription');
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
      rzp.open();
      
    } catch (err) {
      console.error('Razorpay error:', err);
      toast.error('Payment initialization failed');
    }
  };

  if (loading) return <div className="py-20 flex justify-center"><Loader className="animate-spin text-orange-600" /></div>;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Subscription Plans</h2>
      {currentSub && (
        <div className="bg-green-50 border border-green-100 p-6 rounded-2xl flex justify-between items-center">
          <div>
            <h3 className="font-bold text-green-800">Active Subscription</h3>
            <p className="text-sm text-green-600">Valid until {new Date(currentSub.endDate).toLocaleDateString()}</p>
          </div>
          <ShieldCheck className="text-green-600" size={32} />
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map(plan => (
          <div key={plan.id} className="bg-gray-50 border border-gray-100 p-8 rounded-3xl relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="text-3xl font-bold text-orange-600 mb-6">₹{plan.price}<span className="text-sm text-gray-500 font-normal">/{plan.duration}</span></div>
              <ul className="space-y-3 mb-8 text-sm text-gray-600">
                <li className="flex items-center"><Check size={16} className="text-green-500 mr-2" /> Business Listing</li>
                <li className="flex items-center"><Check size={16} className="text-green-500 mr-2" /> Booking Inquiries</li>
                <li className="flex items-center"><Check size={16} className="text-green-500 mr-2" /> Catalogue Access</li>
              </ul>
              <button 
                onClick={() => handleSubscribe(plan)}
                disabled={currentSub?.planId === plan.id}
                className={cn(
                  "w-full py-3 rounded-xl font-bold transition-all",
                  currentSub?.planId === plan.id ? "bg-gray-200 text-gray-500" : "bg-orange-600 text-white hover:bg-orange-700"
                )}
              >
                {currentSub?.planId === plan.id ? 'Current Plan' : 'Subscribe Now'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CatalogueManageView = ({ venues, services }: { venues: Venue[], services: ServiceProvider[] }) => {
  const [activeType, setActiveType] = useState<'venue' | 'service'>(venues.length > 0 ? 'venue' : 'service');
  const [selectedId, setSelectedId] = useState<string>(
    activeType === 'venue' ? (venues[0]?.id || '') : (services[0]?.id || '')
  );
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState<Partial<CatalogueItem>>({
    level: activeType === 'venue' ? 'rooms(ac)' : 'work sample',
    capacity: 0,
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
      setNewItem(prev => ({ ...prev, level: 'rooms(ac)' }));
    } else {
      setSelectedId(services[0]?.id || '');
      setNewItem(prev => ({ ...prev, level: 'work sample' }));
    }
  }, [activeType, venues.length, services.length]);

  const handleAddItem = async () => {
    if (!selectedItem || !newItem.level) {
      toast.error('Please select level');
      return;
    }
    setLoading(true);
    try {
      const updatedCatalogue = [...(selectedItem.catalogue || []), newItem as CatalogueItem];
      const table = activeType === 'venue' ? 'venues' : 'service_providers';
      
      const { error } = await supabase.from(table).update({ catalogue: updatedCatalogue }).eq('id', selectedItem.id);
      if (error) throw error;
      
      setNewItem({ level: activeType === 'venue' ? 'rooms(ac)' : 'work sample', capacity: 0, images: [], videos: [], description: '' });
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
    
    const { error } = await supabase.from(table).update({ catalogue: updatedCatalogue }).eq('id', selectedItem.id);
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Select Level/Category</label>
                  <select 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                    value={newItem.level}
                    onChange={(e) => setNewItem({...newItem, level: e.target.value as CatalogueLevel})}
                  >
                    {levels.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                {activeType === 'venue' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Capacity</label>
                    <input 
                      type="number"
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                      value={newItem.capacity}
                      onChange={(e) => setNewItem({...newItem, capacity: parseInt(e.target.value) || 0})}
                    />
                  </div>
                )}
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
                    onUpload={(url) => {
                      if (url) {
                        setNewItem({...newItem, images: [...(newItem.images || []), url]});
                      }
                    }}
                  />
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {newItem.images?.filter(img => img !== '').map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-100">
                        <img src={img} className="w-full h-full object-cover" />
                        <button 
                          onClick={() => setNewItem({...newItem, images: newItem.images?.filter((_, idx) => idx !== i)})}
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
                    label="Upload Videos (Max 2 mins)" 
                    onUpload={(url) => setNewItem({...newItem, videos: [...(newItem.videos || []), url]})}
                  />
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {newItem.videos?.map((vid, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-100">
                        <video src={vid} className="w-full h-full object-cover" />
                        <button 
                          onClick={() => setNewItem({...newItem, videos: newItem.videos?.filter((_, idx) => idx !== i)})}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-md"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
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
                        <img key={idx} src={img} className="w-full aspect-square object-cover rounded-xl shadow-sm" />
                      ))}
                    </div>
                    {item.videos && item.videos.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {item.videos.slice(0, 2).map((vid, idx) => (
                          <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-black flex items-center justify-center">
                            <video src={vid} className="w-full h-full object-cover opacity-80" />
                            <Play size={16} className="absolute text-white" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-black text-orange-600 uppercase text-sm tracking-wider">{item.level}</h4>
                        {activeType === 'venue' && <p className="text-xs text-gray-500 font-bold mt-1">Capacity: {item.capacity} persons</p>}
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
        {activeType === 'service' && services.length === 0 && (
          <div className="text-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <Music2 size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">Add a service first to manage its catalogue.</p>
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
    serviceType: 'Caterer',
    description: '',
    priceRange: '',
    priceLevel: 'per day',
    state: profile?.state || '',
    district: profile?.district || '',
    block: profile?.block || '',
    images: [''],
    availableFor: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('service_providers').insert([{
        name: formData.name,
        service_type: formData.serviceType,
        description: formData.description,
        price_range: formData.priceRange,
        price_level: formData.priceLevel,
        state: formData.state || profile?.state || '',
        district: formData.district || profile?.district || '',
        block: formData.block || profile?.block || '',
        city: formData.district || profile?.district || '',
        images: formData.images.filter(i => i !== ''),
        provider_id: user.uid,
        available_for: formData.availableFor,
        rating: 0,
        review_count: 0
      }]);
      if (error) {
        console.error('Add Service Supabase Error:', error);
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Register Your Service</h1>
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
              <option value="Caterer">Caterer</option>
              <option value="DJ and Sounds">DJ and Sounds</option>
              <option value="Tent House">Tent House</option>
              <option value="Photo and Videographer">Photo and Videographer</option>
              <option value="Stage Decorator">Stage Decorator</option>
              <option value="Flower Decorator">Flower Decorator</option>
              <option value="Makeup Artist">Makeup Artist</option>
              <option value="Halbai">Halbai</option>
              <option value="Event Manager">Event Manager</option>
              <option value="Waiters">Waiters</option>
              <option value="Dhol Bands">Dhol Bands</option>
              <option value="Light Decorator">Light Decorator</option>
              <option value="Drone Camera">Drone Camera</option>
              <option value="Mehendi Service">Mehendi Service</option>
              <option value="Event Cloth and Jwellary on Rent">Event Cloth and Jwellary on Rent</option>
              <option value="Fast food stalls">Fast food stalls</option>
              <option value="Loundry service">Loundry service</option>
              <option value="Helper">Helper</option>
              <option value="Pandit Ji Brahman">Pandit Ji Brahman</option>
              <option value="SPARKS AND Firecrackers">SPARKS AND Firecrackers</option>
              <option value="Ghoda Bagghi">Ghoda Bagghi</option>
              <option value="Other Related Services">Other Related Services</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:col-span-2">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">District</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none uppercase"
                value={formData.district}
                onChange={(e) => setFormData({...formData, district: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Block</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none uppercase"
                value={formData.block}
                onChange={(e) => setFormData({...formData, block: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">State</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none uppercase"
                value={formData.state}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
              />
            </div>
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

          <div className="md:col-span-2">
            <ImageUpload 
              label="Service Main Image" 
              currentImage={formData.images[0]}
              onUpload={(url) => setFormData({...formData, images: [url, ...formData.images.slice(1)]})}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Available For (Multiple Selection)</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['Weddings', 'Parties', 'Events', 'Meetings', 'Seminars', 'Special Occasion'].map(option => (
                <label key={option} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-orange-50 transition-colors">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                    checked={formData.availableFor.includes(option)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({...formData, availableFor: [...formData.availableFor, option]});
                      } else {
                        setFormData({...formData, availableFor: formData.availableFor.filter(o => o !== option)});
                      }
                    }}
                  />
                  <span className="text-sm font-medium text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg disabled:opacity-50"
        >
          {loading ? 'Registering...' : 'Register Service'}
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
      const { data, error } = await supabase.from('service_providers').select('*').eq('id', id).single();
      if (!error && data) {
        if (data.provider_id !== user.uid && profile?.role !== 'admin') {
          toast.error('Unauthorized');
          navigate('/dashboard');
          return;
        }
        setFormData({
          ...data,
          providerId: data.provider_id,
          serviceType: data.service_type,
          priceRange: data.price_range,
          priceLevel: data.price_level || 'per day',
          availableFor: data.available_for || []
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
      const { error } = await supabase.from('service_providers').update({
        name: formData.name,
        service_type: formData.serviceType,
        description: formData.description,
        price_range: formData.priceRange,
        price_level: formData.priceLevel,
        state: formData.state,
        district: formData.district,
        block: formData.block,
        images: formData.images,
        available_for: formData.availableFor
      }).eq('id', id);
      if (error) throw error;
      toast.success('Service updated successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Edit Service Error:', err);
      toast.error(`Failed to update service: ${err.message || 'Unknown error'}`);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!formData) return <div>Service not found</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Service</h1>
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
              <option value="Caterer">Caterer</option>
              <option value="DJ and Sounds">DJ and Sounds</option>
              <option value="Tent House">Tent House</option>
              <option value="Photo and Videographer">Photo and Videographer</option>
              <option value="Stage Decorator">Stage Decorator</option>
              <option value="Flower Decorator">Flower Decorator</option>
              <option value="Makeup Artist">Makeup Artist</option>
              <option value="Halbai">Halbai</option>
              <option value="Event Manager">Event Manager</option>
              <option value="Waiters">Waiters</option>
              <option value="Dhol Bands">Dhol Bands</option>
              <option value="Light Decorator">Light Decorator</option>
              <option value="Drone Camera">Drone Camera</option>
              <option value="Mehendi Service">Mehendi Service</option>
              <option value="Event Cloth and Jwellary on Rent">Event Cloth and Jwellary on Rent</option>
              <option value="Fast food stalls">Fast food stalls</option>
              <option value="Loundry service">Loundry service</option>
              <option value="Helper">Helper</option>
              <option value="Pandit Ji Brahman">Pandit Ji Brahman</option>
              <option value="SPARKS AND Firecrackers">SPARKS AND Firecrackers</option>
              <option value="Ghoda Bagghi">Ghoda Bagghi</option>
              <option value="Other Related Services">Other Related Services</option>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:col-span-2">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">District</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none uppercase"
                value={formData.district}
                onChange={(e) => setFormData({...formData, district: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Block</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none uppercase"
                value={formData.block}
                onChange={(e) => setFormData({...formData, block: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">State</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none uppercase"
                value={formData.state}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
              />
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
          <div className="md:col-span-2">
            <ImageUpload 
              label="Service Main Image" 
              currentImage={formData.images[0]}
              onUpload={(url) => setFormData({...formData, images: [url, ...formData.images.slice(1)]})}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Available For (Multiple Selection)</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['Weddings', 'Parties', 'Events', 'Meetings', 'Seminars', 'Special Occasion'].map(option => (
                <label key={option} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-orange-50 transition-colors">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                    checked={formData.availableFor?.includes(option)}
                    onChange={(e) => {
                      const current = formData.availableFor || [];
                      if (e.target.checked) {
                        setFormData({...formData, availableFor: [...current, option]});
                      } else {
                        setFormData({...formData, availableFor: current.filter(o => o !== option)});
                      }
                    }}
                  />
                  <span className="text-sm font-medium text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <button 
          type="submit"
          className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg"
        >
          Update Service
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
      const { data, error } = await supabase.from('venues').select('*').eq('id', id).single();
      if (!error && data) {
        if (data.owner_id !== user.uid && profile?.role !== 'admin') {
          toast.error('Unauthorized');
          navigate('/dashboard');
          return;
        }
        setFormData({
          ...data,
          ownerId: data.owner_id,
          venueType: data.venue_type,
          pricePerDay: data.price_per_day,
          availableFor: data.available_for || []
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
      const { error } = await supabase.from('venues').update({
        name: formData.name,
        venue_type: formData.venueType,
        description: formData.description,
        address: formData.address,
        state: formData.state,
        district: formData.district,
        block: formData.block,
        pincode: formData.pincode,
        capacity: formData.capacity,
        price_per_day: formData.pricePerDay,
        images: formData.images,
        facilities: formData.facilities,
        available_for: formData.availableFor
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Venue</h1>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:col-span-2">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">District</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none uppercase"
                value={formData.district}
                onChange={(e) => setFormData({...formData, district: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Block</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none uppercase"
                value={formData.block}
                onChange={(e) => setFormData({...formData, block: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">State</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none uppercase"
                value={formData.state}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
              />
            </div>
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

          <div className="md:col-span-2">
            <ImageUpload 
              label="Venue Main Image" 
              currentImage={formData.images[0]}
              onUpload={(url) => setFormData({...formData, images: [url, ...formData.images.slice(1)]})}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Facilities (Comma separated)</label>
            <input 
              type="text" 
              placeholder="AC, Parking, Catering, DJ, etc."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none uppercase"
              value={formData.facilities.join(', ')}
              onChange={(e) => setFormData({...formData, facilities: e.target.value.split(',').map(s => s.trim())})}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Available For (Multiple Selection)</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['Weddings', 'Parties', 'Events', 'Meetings', 'Seminars', 'Special Occasion'].map(option => (
                <label key={option} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-orange-50 transition-colors">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                    checked={formData.availableFor?.includes(option)}
                    onChange={(e) => {
                      const current = formData.availableFor || [];
                      if (e.target.checked) {
                        setFormData({...formData, availableFor: [...current, option]});
                      } else {
                        setFormData({...formData, availableFor: current.filter(o => o !== option)});
                      }
                    }}
                  />
                  <span className="text-sm font-medium text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <button 
          type="submit"
          className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg"
        >
          Update Venue
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

      const { error } = await supabase
        .from('users')
        .update({
          display_name: formData.displayName,
          father_name: formData.fatherName,
          mobile_number: formData.mobileNumber,
          email: formData.email,
          photo_url: formData.photoURL,
          state: formData.state,
          district: formData.district,
          block: formData.block,
          pincode: formData.pincode,
          venue_type: formData.venueType
        })
        .eq('uid', user.uid);

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
            currentImage={formData.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.registrationId}`}
            onUpload={(url) => setFormData({...formData, photoURL: url})}
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
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              value={formData.mobileNumber}
              onChange={(e) => setFormData({...formData, mobileNumber: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email ID</label>
            <input 
              required
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
    state: profile?.state || '',
    district: profile?.district || '',
    block: profile?.block || '',
    venueType: 'Marriage Garden',
    capacity: 0,
    pricePerDay: 0,
    images: [''],
    facilities: [''],
    availableFor: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('venues').insert([{
        name: formData.name,
        venue_type: formData.venueType,
        description: formData.description,
        address: formData.address,
        state: formData.state || profile?.state || '',
        district: formData.district || profile?.district || '',
        block: formData.block || profile?.block || '',
        pincode: formData.pincode || profile?.pincode || '',
        city: formData.district || profile?.district || '',
        capacity: formData.capacity,
        price_per_day: formData.pricePerDay,
        images: formData.images.filter(i => i !== ''),
        facilities: formData.facilities.filter(a => a !== ''),
        available_for: formData.availableFor,
        owner_id: user.uid,
        rating: 0,
        review_count: 0
      }]);
      if (error) {
        console.error('Add Venue Supabase Error:', error);
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Add Your Venue</h1>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:col-span-2">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">District</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none uppercase"
                value={formData.district}
                onChange={(e) => setFormData({...formData, district: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Block</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none uppercase"
                value={formData.block}
                onChange={(e) => setFormData({...formData, block: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">State</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none uppercase"
                value={formData.state}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
              />
            </div>
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
          <div className="md:col-span-2">
            <ImageUpload 
              label="Venue Main Image" 
              currentImage={formData.images[0]}
              onUpload={(url) => setFormData({...formData, images: [url, ...formData.images.slice(1)]})}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Facilities (Comma separated)</label>
            <input 
              type="text" 
              placeholder="AC, Parking, Catering, DJ, etc."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none uppercase"
              value={formData.facilities.join(', ')}
              onChange={(e) => setFormData({...formData, facilities: e.target.value.split(',').map(s => s.trim())})}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Available For (Multiple Selection)</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['Weddings', 'Parties', 'Events', 'Meetings', 'Seminars', 'Special Occasion'].map(option => (
                <label key={option} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-orange-50 transition-colors">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                    checked={formData.availableFor.includes(option)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({...formData, availableFor: [...formData.availableFor, option]});
                      } else {
                        setFormData({...formData, availableFor: formData.availableFor.filter(o => o !== option)});
                      }
                    }}
                  />
                  <span className="text-sm font-medium text-gray-700">{option}</span>
                </label>
              ))}
            </div>
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [services, setServices] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedState, setSelectedState] = useState(searchParams.get('state') || '');
  const [selectedDistrict, setSelectedDistrict] = useState(searchParams.get('district') || '');
  const [selectedBlock, setSelectedBlock] = useState(searchParams.get('block') || '');

  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');

  const states = Object.keys(LOCATION_DATA || {});
  const districts = selectedState ? Object.keys(LOCATION_DATA[selectedState] || {}) : [];
  const blocks = (selectedState && selectedDistrict && LOCATION_DATA[selectedState]) ? (LOCATION_DATA[selectedState][selectedDistrict] || []) : [];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [venuesRes, servicesRes] = await Promise.all([
        supabase.from('venues').select('*'),
        supabase.from('service_providers').select('*')
      ]);

      if (venuesRes.data) {
        let vData = venuesRes.data.map(d => ({
          id: d.id,
          ownerId: d.owner_id,
          name: d.name,
          venueType: d.venue_type,
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

        const query = searchTerm.toLowerCase();
        if (query) {
          vData = vData.filter(v => 
            v.name.toLowerCase().includes(query) || 
            v.venueType.toLowerCase().includes(query) ||
            v.description?.toLowerCase().includes(query)
          );
        }
        if (selectedState) vData = vData.filter(v => v.state === selectedState);
        if (selectedDistrict) vData = vData.filter(v => v.district === selectedDistrict);
        if (selectedBlock) vData = vData.filter(v => v.block === selectedBlock);
        
        setVenues(vData);
      }

      if (servicesRes.data) {
        let sData = servicesRes.data.map(d => ({
          id: d.id,
          providerId: d.provider_id,
          name: d.name,
          serviceType: d.service_type,
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

        const query = searchTerm.toLowerCase();
        if (query) {
          sData = sData.filter(s => 
            s.name.toLowerCase().includes(query) || 
            s.serviceType.toLowerCase().includes(query) ||
            s.description?.toLowerCase().includes(query)
          );
        }
        if (selectedState) sData = sData.filter(s => s.state === selectedState);
        if (selectedDistrict) sData = sData.filter(s => s.district === selectedDistrict);
        if (selectedBlock) sData = sData.filter(s => s.block === selectedBlock);
        
        setServices(sData);
      }
      setLoading(false);
    };
    fetchData();
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
      <div className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black text-gray-900">Explore Categories</h2>
          <button 
            onClick={clearFilters}
            className="text-orange-600 font-bold hover:underline flex items-center"
          >
            Clear All Filters
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          {[
            { name: 'Venues', link: '/venues', color: 'bg-blue-50 text-blue-600' },
            { name: 'Catering', link: '/services?type=Caterer', color: 'bg-orange-50 text-orange-600' },
            { name: 'DJ & Music', link: '/services?type=DJ and Sounds', color: 'bg-purple-50 text-purple-600' },
            { name: 'Tent House', link: '/services?type=Tent House', color: 'bg-green-50 text-green-600' },
            { name: 'Photography', link: '/services?type=Photo and Videographer', color: 'bg-pink-50 text-pink-600' },
            { name: 'Makeup', link: '/services?type=Makeup Artist', color: 'bg-rose-50 text-rose-600' },
            { name: 'Decoration', link: '/services?type=Light Decorator', color: 'bg-amber-50 text-amber-600' },
            { name: 'Pandit Ji', link: '/services?type=Pandit Ji Brahman', color: 'bg-red-50 text-red-600' },
            { name: 'Mehendi', link: '/services?type=Mehendi Service', color: 'bg-yellow-50 text-yellow-600' },
            { name: 'Drone', link: '/services?type=Drone Camera', color: 'bg-sky-50 text-sky-600' },
            { name: 'Rentals', link: '/services?type=Event Cloth and Jwellary on Rent', color: 'bg-cyan-50 text-cyan-600' },
            { name: 'Halbai', link: '/services?type=Halbai', color: 'bg-emerald-50 text-emerald-600' },
            { name: 'Waiters', link: '/services?type=Waiters', color: 'bg-slate-50 text-slate-600' },
            { name: 'Dhol Bands', link: '/services?type=Dhol Bands', color: 'bg-orange-50 text-orange-600' },
            { name: 'Flower Decor', link: '/services?type=Flower Decorator', color: 'bg-rose-50 text-rose-600' },
          ].map((cat, idx) => (
            <Link 
              key={idx}
              to={cat.link}
              className={cn(
                "px-6 py-3 rounded-2xl font-bold transition-all hover:scale-105 shadow-sm",
                cat.color
              )}
            >
              <span className="text-sm">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>

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

      <div className="mb-12">
        <h1 className="text-4xl font-black text-gray-900 mb-4">Results</h1>
        <p className="text-gray-500">
          Found {venues.length} venues and {services.length} services
        </p>
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

export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'en');
  
  useEffect(() => {
    localStorage.setItem('app_lang', lang);
  }, [lang]);

  const t = (key: string) => translations[lang][key] || key;

  console.log('[APP] Rendering App component');
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
  const [loading, setLoading] = useState(true);
  const [isAppRatingOpen, setIsAppRatingOpen] = useState(false);

  console.log('[APP] Current state:', { user: user?.uid, profile: profile?.role, loading });

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
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

  useEffect(() => {
    const initAndSeed = async () => {
      try {
        // Check local storage for custom session first
        const savedUser = localStorage.getItem('custom_user');
        const savedProfile = localStorage.getItem('custom_profile');
        
        if (savedUser && savedProfile) {
          setUser(JSON.parse(savedUser));
          setProfile(JSON.parse(savedProfile));
        } else {
          // Check Supabase session (if using Supabase Auth)
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser(session.user);
            const { data: profileData, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('uid', session.user.id)
              .single();
            
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
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            setUser(session.user);
            const { data: profileData, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('uid', session.user.id)
              .single();
            
            if (!profileError && profileData) {
              const rawProfile = profileData as any;
              setProfile({
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
              } as UserProfile);
            }
          } else {
            setUser(null);
            setProfile(null);
          }
        });

        // Test connection and seed demo data if needed
        /*
        const ownerId = '00000000-0000-0000-0000-000000000001'; // Demo UUIDs for Supabase
        const providerId = '00000000-0000-0000-0000-000000000002';
        
        const { data: ownerProfile } = await supabase
          .from('users')
          .select('*')
          .eq('uid', ownerId)
          .single();

        if (!ownerProfile) {
          console.log('[INIT] Seeding demo data to Supabase...');
          
          await supabase.from('users').insert([
            {
              uid: ownerId,
              registration_id: 'UTSAV111111',
              display_name: 'Demo Owner',
              father_name: 'Mr. Owner Sr.',
              mobile_number: '9876543210',
              email: 'owner@example.com',
              photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=owner',
              role: 'owner',
              state: 'Rajasthan',
              district: 'Jaipur',
              block: 'Jaipur',
              pincode: '302001',
              venue_type: 'Marriage Garden'
            },
            {
              uid: providerId,
              registration_id: 'UTSAV222222',
              display_name: 'Demo Provider',
              father_name: 'Mr. Provider Sr.',
              mobile_number: '8765432109',
              email: 'provider@example.com',
              photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=provider',
              role: 'provider',
              state: 'Rajasthan',
              district: 'Jaipur',
              block: 'Jaipur',
              pincode: '302001'
            }
          ]);

          await supabase.from('venues').insert([{
            id: '00000000-0000-0000-0000-000000000003',
            owner_id: ownerId,
            name: 'Royal Heritage Garden',
            description: 'A beautiful marriage garden with lush green lawns and modern facilities.',
            venue_type: 'Marriage Garden',
            address: '123, Heritage Road, Jaipur',
            state: 'Rajasthan',
            district: 'Jaipur',
            block: 'Jaipur',
            pincode: '302001',
            city: 'Jaipur',
            capacity: 1000,
            price_per_day: 50000,
            images: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1200'],
            facilities: ['AC Rooms', 'Parking', 'Catering', 'Power Backup'],
            rating: 0
          }]);

          await supabase.from('service_providers').insert([{
            id: '00000000-0000-0000-0000-000000000004',
            provider_id: providerId,
            name: 'Tasty Bites Catering',
            service_type: 'Caterer',
            description: 'Premium catering services for all types of events.',
            price_range: '₹500 - ₹1500 per plate',
            city: 'Jaipur',
            images: ['https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=1200'],
            rating: 0
          }]);
          
          console.log('Demo data seeded to Supabase');
        }
        */
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setLoading(false);
      }
    };
    initAndSeed();
  }, []);

  const [appRating, setAppRating] = useState(0);
  const [totalFeedback, setTotalFeedback] = useState(0);

  useEffect(() => {
    const fetchAppRating = async () => {
      const { data, error } = await supabase
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
    
    const channel = supabase
      .channel('app_feedback_footer')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_feedback' }, fetchAppRating)
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-orange-50">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-20 h-20 bg-orange-600 rounded-3xl flex items-center justify-center text-white text-4xl font-bold shadow-2xl"
        >
          EM
        </motion.div>
      </div>
    );
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      <ErrorBoundary>
        <Router>
        <div className="min-h-screen bg-white font-sans text-gray-900">
          <Toaster position="top-center" />
          
          <Navbar 
            user={user} 
            profile={profile} 
            onLogout={handleLogout} 
            onRateApp={() => setIsAppRatingOpen(true)} 
          />

          <AppRatingModal 
            isOpen={isAppRatingOpen} 
            onClose={() => setIsAppRatingOpen(false)} 
            user={user} 
          />
          
          <main>
            <Routes>
              <Route path="/" element={<HomeView user={user} />} />
              <Route path="/venues" element={<VenueListView />} />
              <Route path="/venues/:id" element={<VenueDetailView user={user} profile={profile} />} />
              <Route path="/services" element={<ServiceListView user={user} />} />
              <Route path="/search" element={<SearchResultsView />} />
              <Route path="/services/:id" element={<ServiceDetailView user={user} profile={profile} />} />
              <Route path="/dashboard" element={<DashboardView user={user} profile={profile} onUpdateProfile={setProfile} />} />
              <Route path="/admin" element={<AdminView user={user} profile={profile} onUpdateProfile={(p) => { setProfile(p); localStorage.setItem('custom_profile', JSON.stringify(p)); }} />} />
              <Route path="/add-venue" element={<AddVenueView user={user} profile={profile} />} />
              <Route path="/edit-venue/:id" element={<EditVenueView user={user} profile={profile} />} />
              <Route path="/edit-service/:id" element={<EditServiceView user={user} profile={profile} />} />
              <Route path="/add-service" element={<AddServiceView user={user} profile={profile} />} />
              <Route path="/profile" element={<ProfileEditView user={user} profile={profile} onUpdate={(p) => setProfile(p)} />} />
      <Route path="/change-password" element={<ChangePasswordView user={user} profile={profile} onUpdateProfile={setProfile} />} />
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
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>

          <footer className="bg-gray-900 text-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="col-span-1 md:col-span-2">
                  <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg text-center">EM</div>
                      <span className="text-2xl font-bold">BOOK MY VANUE</span>
                    </div>
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
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-black text-white">{appRating}</span>
                          <span className="text-gray-500">/ 5.0</span>
                          <span className="text-xs text-gray-600 ml-2">({totalFeedback} reviews)</span>
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
                    <li><a href="tel:8349076918" className="hover:text-orange-400 transition-colors">+91 8349076918</a></li>
                  </ul>
                </div>
              </div>
              <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col items-center justify-center space-y-8">
                <PoweredByCNZ />
                <div className="text-gray-500 text-sm">
                  {t('footerCopyright')}
                </div>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </ErrorBoundary>
  </LanguageContext.Provider>
  );
}

// --- Admin View ---

const AdminView = ({ user, profile, onUpdateProfile }: { user: any, profile: UserProfile | null, onUpdateProfile: (p: UserProfile) => void }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'plans' | 'notifications' | 'banners' | 'servicePhotos' | 'profile'>('dashboard');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [banners, setBanners] = useState<AppBanner[]>([]);
  const [servicePhotos, setServicePhotos] = useState<ServiceTypePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportFilters, setReportFilters] = useState({
    name: '',
    mobile: '',
    startDate: '',
    endDate: '',
    paymentMode: '',
    paymentStatus: ''
  });

  // Modal states for adding notification/banner/servicePhoto
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [newNotification, setNewNotification] = useState({ title: '', message: '' });
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [newBanner, setNewBanner] = useState({ title: '', imageUrl: '' });
  const [isServicePhotoModalOpen, setIsServicePhotoModalOpen] = useState(false);
  const [newServicePhoto, setNewServicePhoto] = useState({ serviceType: 'Caterer' as ServiceType, imageUrl: '' });
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
    displayName: profile?.displayName || 'Admin',
    email: profile?.email || 'admin@eventmanager.com',
    mobileNumber: profile?.mobileNumber || '0000000000',
    password: ''
  });

  useEffect(() => {
    if (!user || user.email !== 'admin@eventmanager.com') {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, activeTab]);

  useEffect(() => {
    if (!user || user.email !== 'admin@eventmanager.com') return;

    const channel = supabase
      .channel('admin_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subscription_plans' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'banners' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_type_photos' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'dashboard') {
        const { data: bData } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
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

        const { data: sData } = await supabase.from('user_subscriptions').select('*');
        if (sData) setSubscriptions(sData.map(d => ({
          ...d,
          userId: d.user_id,
          planId: d.plan_id,
          startDate: d.start_date,
          endDate: d.end_date,
          createdAt: d.created_at
        }) as UserSubscription));
      }

      if (activeTab === 'dashboard' || activeTab === 'users') {
        const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false });
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
        const { data } = await supabase.from('subscription_plans').select('*');
        if (data) setPlans(data.map(d => ({
          id: d.id,
          role: d.role,
          name: d.name,
          price: d.price,
          duration: d.duration,
          isActive: d.is_active
        } as SubscriptionPlan)));
      } else if (activeTab === 'notifications') {
        const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
        if (data) setNotifications(data);
      } else if (activeTab === 'banners') {
        const { data } = await supabase.from('banners').select('*').order('created_at', { ascending: false });
        if (data) setBanners(data);
      } else if (activeTab === 'servicePhotos') {
        const { data } = await supabase.from('service_type_photos').select('*').order('created_at', { ascending: false });
        if (data) setServicePhotos(data.map(d => ({
          id: d.id,
          serviceType: d.service_type,
          imageUrl: d.image_url,
          createdAt: d.created_at
        } as ServiceTypePhoto)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetAllRatings = async () => {
    if (!confirm('Are you sure you want to reset all ratings and review counts? This will set them to 0 for all venues and services and delete all existing reviews.')) return;
    
    setLoading(true);
    try {
      // Update all venues
      const { error: vError } = await supabase.from('venues').update({ rating: 0, review_count: 0 }).neq('id', '00000000-0000-0000-0000-000000000000');
      // Update all service providers
      const { error: sError } = await supabase.from('service_providers').update({ rating: 0, review_count: 0 }).neq('id', '00000000-0000-0000-0000-000000000000');
      // Delete all reviews
      const { error: rError } = await supabase.from('reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
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
    }
  };

  const deleteNotification = async (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Notification',
      message: 'Are you sure you want to delete this notification?',
      isDanger: true,
      onConfirm: async () => {
        const { error } = await supabase.from('notifications').delete().eq('id', id);
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
        const { error } = await supabase.from('banners').delete().eq('id', id);
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
        const { error } = await supabase.from('service_type_photos').delete().eq('id', id);
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
    const { error } = await supabase.from('users').update({ status: newStatus }).eq('uid', uid);
    if (!error) {
      toast.success(`User ${newStatus === 'active' ? 'enabled' : 'disabled'}`);
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, status: newStatus } : u));
    } else {
      console.error('Toggle status error:', error);
      toast.error('Failed to update user status: ' + error.message);
    }
  };

  const deleteUser = async (uid: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    const { error } = await supabase.from('users').delete().eq('uid', uid);
    if (!error) {
      toast.success('User deleted');
      setUsers(prev => prev.filter(u => u.uid !== uid));
    } else {
      toast.error('Failed to delete user');
    }
  };

  const updatePlanPrice = async (id: string, newPrice: number) => {
    if (isNaN(newPrice) || newPrice < 0) {
      toast.error('Invalid price entered');
      return;
    }
    
    setLoading(true);
    try {
      console.log(`Updating plan ${id} price to ${newPrice}`);
      const { error } = await supabase.from('subscription_plans').update({ price: newPrice }).eq('id', id);
      
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
    const { error } = await supabase.from('subscription_plans').update({ is_active: !currentStatus }).eq('id', id);
    if (!error) {
      toast.success(`Plan ${!currentStatus ? 'enabled' : 'disabled'}`);
      fetchData();
    }
  };

  const downloadReport = (type: 'excel' | 'pdf' = 'excel') => {
    if (activeTab === 'users') {
      const data = users.map(u => ({
        'Registration ID': u.registrationId,
        'Name': u.displayName,
        'Mobile': u.mobileNumber,
        'Email': u.email,
        'Role': u.role,
        'Status': u.status,
        'Created At': new Date(u.createdAt).toLocaleString()
      }));
      
      if (type === 'excel') {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
        XLSX.writeFile(workbook, "registered_users_report.xlsx");
        toast.success('User report downloaded');
      } else {
        const doc = new jsPDF();
        doc.text("Registered Users Report", 14, 15);
        (doc as any).autoTable({
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
        title: newNotification.title || 'System Update',
        message: msg.trim(),
        target_role: 'all',
        is_active: true
      }));
      
      const { error } = await supabase.from('notifications').insert(inserts);
      if (error) throw error;
      
      toast.success(`${messages.length} notification(s) added`);
      setIsNotificationModalOpen(false);
      setNewNotification({ title: '', message: '' });
      fetchData();
    } catch (err) {
      toast.error('Failed to add notifications');
    }
  };

  const handleAddBanners = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setLoading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const filePath = `banners/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(filePath);
        return { title: file.name, image_url: publicUrl, is_active: true };
      });
      
      const bannerData = await Promise.all(uploadPromises);
      const { error } = await supabase.from('banners').insert(bannerData);
      if (error) throw error;
      
      toast.success(`${files.length} banner(s) added`);
      fetchData();
    } catch (err) {
      toast.error('Failed to upload banners');
    } finally {
      setLoading(false);
    }
  };

  const handleAddServicePhotos = async (files: FileList | null, serviceType: ServiceType) => {
    if (!files || files.length === 0) return;
    
    setLoading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const filePath = `service_photos/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(filePath);
        return { service_type: serviceType, image_url: publicUrl };
      });
      
      const photoData = await Promise.all(uploadPromises);
      const { error } = await supabase.from('service_type_photos').insert(photoData);
      if (error) throw error;
      
      toast.success(`${files.length} photo(s) added for ${serviceType}`);
      fetchData();
    } catch (err) {
      toast.error('Failed to upload service photos');
    } finally {
      setLoading(false);
    }
  };

  const handleEditNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNotification) return;
    
    try {
      const { error } = await supabase
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
          await supabase
            .from('admin_settings')
            .update({ value: adminProfile.password })
            .eq('key', 'admin_password');
        }
        
        // Update mobile in admin_settings
        await supabase
          .from('admin_settings')
          .upsert({ key: 'admin_mobile', value: adminProfile.mobileNumber });

        // Also update the users table for the admin user
        await supabase
          .from('users')
          .update({
            display_name: adminProfile.displayName,
            mobile_number: adminProfile.mobileNumber,
            email: adminProfile.email,
            password: adminProfile.password || profile.password
          })
          .eq('uid', user.uid);

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
            { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'plans', label: 'Subscription Plans', icon: CreditCard },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'banners', label: 'Banners', icon: Image },
            { id: 'servicePhotos', label: 'Service Photos', icon: ImageIcon },
            { id: 'profile', label: 'Admin Profile', icon: UserIcon },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-white text-gray-600 hover:bg-gray-100'
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
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
                          <Users size={24} />
                        </div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Users</span>
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
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Paid Bookings</span>
                      </div>
                      <div className="text-3xl font-black text-gray-900">
                        {bookings.filter(b => b.paymentStatus === 'Paid' || b.status === 'paid').length}
                      </div>
                      <div className="mt-2 text-sm text-gray-500">Successfully completed</div>
                    </div>
                  </div>

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {plans.map(plan => (
                    <div key={plan.id} className="border border-gray-100 rounded-3xl p-6 hover:shadow-md transition-all">
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
                          <div className="mt-4 text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</div>
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
                        <img src={b.imageUrl} alt="Banner" className="w-full h-48 object-cover" />
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
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900">Service Type Photos</h3>
                    <div className="flex items-center space-x-4">
                      <select 
                        className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-orange-500"
                        value={newServicePhoto.serviceType}
                        onChange={(e) => setNewServicePhoto({...newServicePhoto, serviceType: e.target.value as ServiceType})}
                      >
                        {[
                          'Caterer', 'DJ and Sounds', 'Tent House', 'Photo and Videographer', 
                          'Stage Decorator', 'Flower Decorator', 'Makeup Artist', 'Halbai', 
                          'Event Manager', 'Waiters', 'Dhol Bands', 'Light Decorator', 
                          'Drone Camera', 'Mehendi Service', 'Event Cloth and Jwellary on Rent', 
                          'Fast food stalls', 'Loundry service', 'Helper', 'Pandit Ji Brahman', 
                          'SPARKS AND Firecrackers', 'Other Related Services'
                        ].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <label className="cursor-pointer bg-orange-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-orange-600 transition-all">
                        <input 
                          type="file" 
                          multiple 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleAddServicePhotos(e.target.files, newServicePhoto.serviceType)}
                        />
                        Upload Photos
                      </label>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {servicePhotos.map(p => (
                      <div key={p.id} className="group relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white">
                        <img src={p.imageUrl} alt={p.serviceType} className="w-full h-40 object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            onClick={() => deleteServicePhoto(p.id)}
                            className="bg-white text-red-600 p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                        <div className="p-3">
                          <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">{p.serviceType}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {servicePhotos.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                      <ImageIcon size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">No service type photos uploaded yet.</p>
                    </div>
                  )}
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
                      <input required type="tel" maxLength={10} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500" 
                        value={adminProfile.mobileNumber} onChange={e => setAdminProfile({...adminProfile, mobileNumber: e.target.value.replace(/\D/g, '')})} />
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
    const fetchVenues = async () => {
      const { data: venuesData, error } = await supabase
        .from('venues')
        .select('*');
      
      if (error) {
        console.error('Error fetching venues:', error);
        setLoading(false);
        return;
      }

      let data = venuesData.map(d => ({
        id: d.id,
        ownerId: d.owner_id,
        name: d.name,
        venueType: d.venue_type,
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
      
      const search = searchParams.get('search')?.toLowerCase();

      if (search) {
        data = data.filter(v => 
          v.name.toLowerCase().includes(search) || 
          v.venueType.toLowerCase().includes(search)
        );
      }

      if (selectedState) data = data.filter(v => v.state === selectedState);
      if (selectedDistrict) data = data.filter(v => v.district === selectedDistrict);
      if (selectedBlock) data = data.filter(v => v.block === selectedBlock);

      setVenues(data);
      setLoading(false);
    };
    fetchVenues();
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
    const fetchServices = async () => {
      const { data: servicesData, error } = await supabase
        .from('service_providers')
        .select('*');
      
      if (error) {
        console.error('Error fetching services:', error);
        setLoading(false);
        return;
      }

      let data = servicesData.map(d => ({
        id: d.id,
        providerId: d.provider_id,
        name: d.name,
        serviceType: d.service_type,
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
      
      const type = searchParams.get('type');
      const search = searchParams.get('search')?.toLowerCase();

      if (type) data = data.filter(s => s.serviceType === type);
      if (search) {
        data = data.filter(s => 
          s.name.toLowerCase().includes(search) || 
          s.serviceType.toLowerCase().includes(search)
        );
      }

      if (selectedState) data = data.filter(s => s.state === selectedState);
      if (selectedDistrict) data = data.filter(s => s.district === selectedDistrict);
      if (selectedBlock) data = data.filter(s => s.block === selectedBlock);

      setServices(data);
      setLoading(false);
    };
    fetchServices();
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
