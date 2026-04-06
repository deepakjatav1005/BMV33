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
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast, Toaster } from 'react-hot-toast';
import { format } from 'date-fns';

import { supabase } from './supabase';
import { locations } from './data/locations';
import { cn } from './lib/utils';

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
      const { error } = await supabase.from('app_feedback').insert([{
        user_id: user?.uid || 'visitor',
        user_name: user?.displayName || visitorName,
        visitor_mobile: user?.mobileNumber || visitorMobile,
        rating,
        comment,
        created_at: new Date().toISOString()
      }]);
      if (error) throw error;
      toast.success('Thank you for your feedback!');
      setComment('');
      setVisitorName('');
      setVisitorMobile('');
      setRating(5);
      onClose();
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
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Rate Our App</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                      className={star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} 
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
      setShowForm(false);
      toast.success('Review submitted successfully!');
      onReviewAdded();
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
      const filePath = `uploads/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
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
            <img src={currentImage} alt="Preview" className="w-full h-full object-cover" />
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
        .channel('pending_bookings')
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
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">Event Manager</span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-1 text-gray-600 hover:text-orange-600 font-bold transition-all bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 hover:bg-orange-50">
                <Home size={18} />
                <span>Home</span>
              </Link>
              <Link to="/gallery" className="text-gray-600 hover:text-orange-600 font-medium transition-colors">Gallery</Link>
              <Link to="/venues" className="text-gray-600 hover:text-orange-600 font-medium transition-colors">Search</Link>
              <Link to="/about" className="text-gray-600 hover:text-orange-600 font-medium transition-colors">About</Link>
              
              <button 
                onClick={onRateApp}
                className="flex items-center space-x-1 text-orange-600 hover:text-orange-700 font-bold transition-all bg-orange-50 px-4 py-2 rounded-xl border border-orange-100"
              >
                <Star size={18} className="fill-orange-600" />
                <span>Rate Us</span>
              </button>

              {!user && (
                <>
                  <Link to="/registration" className="text-gray-600 hover:text-orange-600 font-medium transition-colors">Registration</Link>
                  <Link to="/login" className="bg-orange-600 text-white px-6 py-2 rounded-full font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-200">Login</Link>
                </>
              )}
              {user && (
                <div className="flex items-center space-x-4">
                  {(profile?.role === 'owner' || profile?.role === 'provider') && (
                    <Link to="/dashboard?tab=booking-manager" className="relative p-2 text-gray-600 hover:text-orange-600 transition-colors">
                      <Bell size={24} />
                      {pendingCount > 0 && (
                        <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
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
          <div className="px-4 py-4 space-y-4">
            <Link to="/" className="flex items-center space-x-2 text-orange-600 font-bold bg-orange-50 px-4 py-2 rounded-xl" onClick={() => setIsMenuOpen(false)}>
              <Home size={18} />
              <span>Home</span>
            </Link>
            <Link to="/gallery" className="block text-gray-600 font-medium" onClick={() => setIsMenuOpen(false)}>Gallery</Link>
            <Link to="/venues" className="block text-gray-600 font-medium" onClick={() => setIsMenuOpen(false)}>Search</Link>
            <Link to="/about" className="block text-gray-600 font-medium" onClick={() => setIsMenuOpen(false)}>About</Link>
            
            <button 
              onClick={() => { onRateApp(); setIsMenuOpen(false); }}
              className="flex items-center space-x-2 text-orange-600 font-bold bg-orange-50 px-4 py-2 rounded-xl w-full"
            >
              <Star size={18} className="fill-orange-600" />
              <span>Rate Us</span>
            </button>

            {user ? (
              <>
                {(profile?.role === 'owner' || profile?.role === 'provider') && (
                  <Link to="/dashboard?tab=booking-manager" className="block text-gray-600 font-medium" onClick={() => setIsMenuOpen(false)}>
                    Booking Manager {pendingCount > 0 && `(${pendingCount})`}
                  </Link>
                )}
                <Link to={profile?.role === 'admin' ? "/admin" : "/dashboard"} className="block text-gray-600 font-medium" onClick={() => setIsMenuOpen(false)}>
                  {profile?.role === 'admin' ? "Admin Panel" : "Dashboard"}
                </Link>
                <Link to="/change-password" title="Change Password" className="block text-gray-600 font-medium" onClick={() => setIsMenuOpen(false)}>Change Password</Link>
                {profile?.role === 'admin' && (
                  <Link to="/admin" className="block text-red-600 font-bold" onClick={() => setIsMenuOpen(false)}>Admin Panel</Link>
                )}
                <button onClick={handleLogout} className="block text-red-600 font-medium">Logout</button>
              </>
            ) : (
              <>
                <Link to="/registration" className="block text-gray-600 font-medium" onClick={() => setIsMenuOpen(false)}>Registration</Link>
                <Link to="/login" className="block text-orange-600 font-bold" onClick={() => setIsMenuOpen(false)}>Login</Link>
              </>
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
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
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
    if (city) params.set('city', city);
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
            <span>Join Us as Venue Owner</span>
          </Link>
          <Link to="/registration?role=provider" className="bg-white/10 backdrop-blur-sm text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-white/20 transition-all border border-white/30 flex items-center space-x-2">
            <Briefcase size={16} />
            <span>Join Us as Service Provider</span>
          </Link>
          <Link to="/registration" className="bg-pink-600/90 backdrop-blur-sm text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-pink-700 transition-all shadow-lg border border-pink-500/50 flex items-center space-x-2">
            <UserPlus size={16} />
            <span>Register</span>
          </Link>
          <Link to="/login" className="bg-white text-orange-600 px-5 py-2.5 rounded-full font-bold text-sm hover:bg-orange-50 transition-all shadow-lg flex items-center space-x-2">
            <LogIn size={16} />
            <span>Login</span>
          </Link>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-7xl font-black text-white mb-6 drop-shadow-2xl tracking-tight"
        >
          Plan Your <span className="text-orange-500">Perfect Event</span> with Confidence
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl md:text-2xl text-gray-200 mb-12 font-medium max-w-3xl mx-auto"
        >
          Discover top-rated wedding halls, farmhouses, and event services across India.
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
                placeholder="Search venues, caterers, DJs..." 
                className="w-full focus:outline-none text-gray-700 bg-transparent"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex-1 flex items-center px-4 py-3 border border-gray-100 rounded-2xl w-full">
              <MapPin className="text-orange-500 mr-3" size={20} />
              <input 
                type="text" 
                placeholder="City (e.g. Mumbai, Delhi)" 
                className="w-full focus:outline-none text-gray-700 bg-transparent"
                value={city}
                onChange={(e) => setCity(e.target.value)}
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
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none disabled:opacity-50"
            >
              <option value="">All Districts</option>
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select 
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              disabled={!selectedDistrict}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none disabled:opacity-50"
            >
              <option value="">All Blocks</option>
              {blocks.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <button 
            type="submit"
            className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-700 transition-all shadow-lg shadow-orange-200"
          >
            Search Now
          </button>
        </motion.form>
      </div>
    </div>
  );
};

const CategorySection = () => {
  const categories = [
    { name: 'Venues', icon: <Building2 />, color: 'bg-blue-50 text-blue-600', link: '/venues', desc: 'Wedding Halls & Resorts' },
    { name: 'Catering', icon: <UtensilsCrossed />, color: 'bg-orange-50 text-orange-600', link: '/services?type=Caterer', desc: 'Delicious Food Stalls' },
    { name: 'DJ & Music', icon: <Music2 />, color: 'bg-purple-50 text-purple-600', link: '/services?type=DJ and Sounds', desc: 'Sound & Lighting' },
    { name: 'Tent House', icon: <Tent />, color: 'bg-green-50 text-green-600', link: '/services?type=Tent House', desc: 'Decor & Setup' },
    { name: 'Photography', icon: <Camera />, color: 'bg-pink-50 text-pink-600', link: '/services?type=Photo and Videographer', desc: 'Capture Memories' },
    { name: 'Mehendi', icon: <Palette />, color: 'bg-yellow-50 text-yellow-600', link: '/services?type=Mehendi Service', desc: 'Traditional Art' },
    { name: 'Drone', icon: <Plane />, color: 'bg-rose-50 text-rose-600', link: '/services?type=Drone Camera', desc: 'Aerial Shots' },
    { name: 'Event Manager', icon: <Briefcase />, color: 'bg-indigo-50 text-indigo-600', link: '/services?type=Event Manager', desc: 'Expert Planning' },
    { name: 'Light Decorator', icon: <Sparkles />, color: 'bg-amber-50 text-amber-600', link: '/services?type=Light Decorator', desc: 'Night Illumination' },
    { name: 'Rentals', icon: <Gem />, color: 'bg-cyan-50 text-cyan-600', link: '/services?type=Event Cloth and Jwellary on Rent', desc: 'Jewelry & Clothes' },
    { name: 'Fast Food', icon: <Pizza />, color: 'bg-red-50 text-red-600', link: '/services?type=Fast food stalls', desc: 'Quick Bites' },
    { name: 'Laundry', icon: <WashingMachine />, color: 'bg-sky-50 text-sky-600', link: '/services?type=Loundry service', desc: 'Clean & Fresh' },
    { name: 'Helper', icon: <Users />, color: 'bg-emerald-50 text-emerald-600', link: '/services?type=Helper', desc: 'Event Support' },
    { name: 'Other', icon: <Plus />, color: 'bg-slate-50 text-slate-600', link: '/services?type=Other Related Services', desc: 'More Services' },
  ];

  return (
    <section className="py-24 bg-white overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-5">
        <div className="absolute top-10 left-10 w-64 h-64 bg-orange-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-500 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
          >
            Our Services
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-gray-900 mb-6"
          >
            Explore by <span className="text-orange-600">Category</span>
          </motion.h2>
          <div className="w-24 h-2 bg-orange-500 mx-auto rounded-full" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-8">
          {categories.map((cat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05, type: 'spring', stiffness: 100 }}
              whileHover={{ y: -10 }}
            >
              <Link 
                to={cat.link}
                className="flex flex-col items-center group"
              >
                <div className={cn(
                  "w-24 h-24 rounded-[2.5rem] flex items-center justify-center mb-4 transition-all duration-500 shadow-lg group-hover:shadow-2xl group-hover:rounded-3xl relative overflow-hidden",
                  cat.color
                )}>
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {React.cloneElement(cat.icon as React.ReactElement<any>, { size: 40, strokeWidth: 2.5 })}
                  </motion.div>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                </div>
                <span className="font-black text-gray-900 text-center text-sm group-hover:text-orange-600 transition-colors uppercase tracking-tight">{cat.name}</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">{cat.desc}</span>
              </Link>
            </motion.div>
          ))}
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
            <span className="text-[10px] font-bold text-orange-700">{venue.rating > 0 ? venue.rating : 'New'}</span>
          </div>
        </div>
        <div className="flex items-center text-gray-500 text-sm mb-3">
          <MapPin size={14} className="mr-1" />
          <span>{venue.city}, {venue.state}</span>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="text-orange-600 font-bold text-sm">
            <IndianRupee size={12} className="inline mr-1" />
            {venue.pricePerDay.toLocaleString()}/day
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
              <span className="text-[10px] font-bold text-purple-700">{service.rating > 0 ? service.rating : 'New'}</span>
            </div>
          </div>
          <div className="flex items-center text-gray-500 text-sm mb-3">
            <MapPin size={14} className="mr-1" />
            <span>{service.city}</span>
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
          <p className="mt-2 opacity-90">Welcome to the Event Manager family</p>
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
    city: '',
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
        regId = 'EVOW' + (900000 + nextNum).toString();
      } else if (formData.role === 'provider') {
        regId = 'EVSP' + (800000 + nextNum).toString();
      } else {
        regId = 'UTSAV' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      }
      
      // We'll use a dummy UID for this custom auth system or just a random one
      const uid = 'custom_' + Date.now();
      
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
        city: formData.city,
        pincode: formData.pincode
        // password is omitted to avoid schema cache issues; mobile_number is used as default password
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
      const whatsappMsg = `*Welcome to Event Manager!*%0A%0AHello ${formData.name}, your registration is successful.%0A%0A*Your ID:* ${regId}%0A*Your Password:* ${formData.mobileNumber}%0A%0APlease login at: ${window.location.origin}/%23/login%0A%0AThank you for joining us!`;
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

const AboutView = () => (
  <div className="max-w-4xl mx-auto px-4 py-20 text-center relative">
    <Link to="/" className="absolute top-0 left-0 flex items-center space-x-2 text-orange-600 font-bold hover:underline bg-orange-50 px-4 py-2 rounded-full">
      <Home size={18} />
      <span>Home</span>
    </Link>
    <div className="w-24 h-24 bg-orange-600 rounded-3xl flex items-center justify-center text-white text-5xl font-bold mx-auto mb-8 shadow-2xl shadow-orange-200">EM</div>
    <h1 className="text-4xl font-bold text-gray-900 mb-6">About Event Manager</h1>
    <p className="text-xl text-gray-600 leading-relaxed mb-12">
      Event Manager is India's premier event planning platform, dedicated to making your special moments truly unforgettable. 
      We bridge the gap between hosts and the finest venues and service providers in the country. 
      Whether it's a grand wedding, a corporate gala, or an intimate birthday party, Event Manager provides 
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
      image: "https://illustrations.popsy.co/amber/wedding.svg",
      color: "bg-pink-50",
      borderColor: "border-pink-200",
      textColor: "text-pink-600"
    },
    {
      title: "Birthday Bashes",
      description: "Fun-filled venues and decorators for the most memorable birthday parties.",
      image: "https://illustrations.popsy.co/amber/party.svg",
      color: "bg-orange-50",
      borderColor: "border-orange-200",
      textColor: "text-orange-600"
    },
    {
      title: "Corporate Events",
      description: "Professional spaces equipped with modern amenities for your business needs.",
      image: "https://illustrations.popsy.co/amber/work-from-home.svg",
      color: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-600"
    },
    {
      title: "Catering Excellence",
      description: "Top-rated caterers serving delicious cuisines for every palate.",
      image: "https://illustrations.popsy.co/amber/food.svg",
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
    <div className="bg-white py-8 overflow-hidden border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <Sparkles className="mr-2 text-orange-600" size={20} />
          Explore Services
        </h2>
      </div>
      <div className="relative flex overflow-hidden">
        <div className="flex animate-marquee-ltr whitespace-nowrap">
          {photos.map((p, idx) => (
            <motion.div 
              key={`${p.id}-${idx}`} 
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate('/registration?role=provider')}
              className="mx-4 w-64 h-40 rounded-2xl overflow-hidden shadow-lg cursor-pointer relative group flex-shrink-0"
            >
              <img src={p.imageUrl} alt={p.serviceType} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                <p className="text-white font-bold text-sm uppercase tracking-wider">{p.serviceType}</p>
                <p className="text-orange-400 text-[10px] font-bold mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Register as Provider →</p>
              </div>
            </motion.div>
          ))}
          {/* Duplicate for seamless loop */}
          {photos.map((p, idx) => (
            <motion.div 
              key={`${p.id}-${idx}-dup`} 
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate('/registration?role=provider')}
              className="mx-4 w-64 h-40 rounded-2xl overflow-hidden shadow-lg cursor-pointer relative group flex-shrink-0"
            >
              <img src={p.imageUrl} alt={p.serviceType} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                <p className="text-white font-bold text-sm uppercase tracking-wider">{p.serviceType}</p>
                <p className="text-orange-400 text-[10px] font-bold mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Register as Provider →</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const HomeView = ({ user }: { user: any }) => {
  const venuesScrollRef = useAutoScroll(0.6);
  const topProvidersScrollRef = useAutoScroll(0.5);
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
        const { data: vData } = await supabase.from('venues').select('*').gte('rating', 4).limit(3);
        if (vData) setFeaturedVenues(vData.map(d => ({ 
          ...d, 
          ownerId: d.owner_id, 
          venueType: d.venue_type, 
          pricePerDay: d.price_per_day, 
          reviewCount: d.review_count,
          createdAt: d.created_at 
        }) as Venue));

        const { data: sData } = await supabase.from('service_providers').select('*').gte('rating', 4).limit(4);
        if (sData) setFeaturedServices(sData.map(d => ({ 
          ...d, 
          providerId: d.provider_id, 
          serviceType: d.service_type, 
          priceRange: d.price_range, 
          reviewCount: d.review_count,
          createdAt: d.created_at 
        }) as ServiceProvider));

        const { data: bData } = await supabase.from('banners').select('*').eq('is_active', true);
        if (bData) setBanners(bData.map(d => ({ id: d.id, title: d.title, imageUrl: d.image_url, link: d.link, isActive: d.is_active, createdAt: d.created_at }) as AppBanner));

        const { data: nData } = await supabase.from('notifications').select('*').eq('is_active', true);
        if (nData) setNotifications(nData.map(d => ({ id: d.id, title: d.title, message: d.message, createdAt: d.created_at }) as AppNotification));
      } catch (err) {
        console.error('Home data error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  return (
    <div className="pb-20">
      {/* Notifications Bar */}
      {notifications.length > 0 && (
        <div className="bg-orange-600 text-white py-2 overflow-hidden relative">
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
                        India's Most Trusted Platform for Wedding & Event Planning. Find the perfect venue and services for your special day.
                      </p>
                      <div className="flex flex-wrap gap-4">
                        <Link to="/venues" className="bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-orange-700 transition-all shadow-xl shadow-orange-900/20 flex items-center group">
                          Explore Venues
                          <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/registration?role=owner" className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all">
                          Join as Venue Owner
                        </Link>
                        <Link to="/registration?role=provider" className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all">
                          Join as Service Provider
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
          <h2 className="text-4xl font-bold mb-16">Why Plan with Event Manager?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-sm">
                <CheckCircle size={40} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Verified Listings</h3>
              <p className="text-orange-100 opacity-80">Every venue and provider is manually verified for quality and reliability.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-sm">
                <IndianRupee size={40} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Best Price Guarantee</h3>
              <p className="text-orange-100 opacity-80">Get the best rates by booking directly through our platform.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-sm">
                <Clock size={40} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Instant Support</h3>
              <p className="text-orange-100 opacity-80">Our team is here to help you with every step of your event planning.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />
    </div>
  );
};

const TestimonialsSection = () => {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      const { data, error } = await supabase
        .from('app_feedback')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (!error && data) {
        setFeedbacks(data.map(d => ({
          id: d.id,
          userId: d.user_id,
          userName: d.user_name,
          rating: d.rating,
          comment: d.comment,
          createdAt: d.created_at
        })));
      }
    };

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

  if (feedbacks.length === 0) return null;

  return (
    <section className="py-24 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-4">What Our Users Say</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">Real stories from real people who planned their perfect events with us.</p>
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
                  <Star key={i} size={16} className={i < fb.rating ? 'fill-yellow-500' : 'text-gray-200'} />
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
        const proceed = window.confirm('This time slot is already booked for this venue. Do you still want to send a booking query?');
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
                <span>{venue.address}, {venue.city}</span>
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
                <span className="text-3xl font-bold text-gray-900">₹{venue.pricePerDay.toLocaleString()}</span>
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
        const proceed = window.confirm('This time slot is already booked for this service. Do you still want to send a booking query?');
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
                  <span>{service.city}, {service.state}</span>
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
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isAmountModalOpen, setIsAmountModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [newAmount, setNewAmount] = useState(0);
  const [expenditure, setExpenditure] = useState(0);
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
    targetName: ''
  });
  const [venues, setVenues] = useState<Venue[]>([]);
  const [services, setServices] = useState<ServiceProvider[]>([]);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isCallSatisfied, setIsCallSatisfied] = useState(false);
  const [manualCallSatisfied, setManualCallSatisfied] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchBookings = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('owner_id', user.uid)
        .eq('is_manual', true)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setBookings(data.map(d => ({
          id: d.id,
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
          visitorMobile: d.visitor_mobile,
          status: d.status,
          isManual: d.is_manual,
          is_invoice_generated: d.is_invoice_generated,
          createdAt: d.created_at
        } as Booking)));
      }
      setLoading(false);
    };

    fetchBookings();

    const channel = supabase
      .channel('booking_manager_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, (payload) => {
        if (payload.new && (payload.new as any).owner_id === user.uid) {
          fetchBookings();
        }
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
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchesDate = !dateFilter || b.eventDate === dateFilter;
    return matchesStatus && matchesDate;
  });

  const sortedBookings = [...filteredBookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
      generateInvoice(selectedBooking, expenditure);
      const finalAmount = (selectedBooking.updatedAmount || selectedBooking.totalAmount) + expenditure;
      const msg = `Hello ${selectedBooking.partyName || selectedBooking.visitorName}, your invoice for ${selectedBooking.targetName} has been generated. Total Amount: INR ${finalAmount.toLocaleString()}. Please check your PDF invoice.`;
      sendWhatsAppAlert(selectedBooking.visitorMobile || '', msg);
      
      await supabase.from('bookings').update({ is_invoice_generated: true }).eq('id', selectedBooking.id);
      
      setIsInvoiceModalOpen(false);
      setSelectedBooking(null);
      setExpenditure(0);
      toast.success('Invoice generated and shared via WhatsApp');
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
        is_manual: true
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
        targetName: ''
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
        {sortedBookings.length > 0 ? (
          sortedBookings.map(booking => (
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
                      booking.status === 'confirmed' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                    )}>
                      {booking.status}
                    </span>
                    {booking.status === 'confirmed' && (
                      <>
                        <button 
                          disabled={booking.is_invoice_generated}
                          onClick={() => {
                            if (booking.is_invoice_generated) {
                              toast.error('Amount cannot be updated after invoice generation');
                              return;
                            }
                            setSelectedBooking(booking);
                            setNewAmount(booking.updatedAmount || booking.totalAmount);
                            setIsAmountModalOpen(true);
                          }}
                          className={cn(
                            "p-2 rounded-xl transition-all",
                            booking.is_invoice_generated ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-orange-50 text-orange-600 hover:bg-orange-100"
                          )}
                          title={booking.is_invoice_generated ? "Amount locked after invoice" : "Update Amount"}
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
                      </>
                    )}
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
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        value={manualBooking.eventType}
                        onChange={(e) => setManualBooking({...manualBooking, eventType: e.target.value})}
                      />
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
                <div className="font-bold text-gray-900">{selectedBooking?.partyName}</div>
                <div className="text-sm text-gray-500">Original Amount: ₹{selectedBooking?.totalAmount.toLocaleString()}</div>
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
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">Generate Invoice</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="text-xs font-bold text-gray-400 uppercase mb-1">Booking Details</div>
                <div className="font-bold text-gray-900">{selectedBooking?.targetName}</div>
                <div className="text-sm text-gray-500">{selectedBooking?.partyName} | {selectedBooking?.eventDate}</div>
                <div className="text-sm font-bold text-orange-600 mt-1">Base Amount: ₹{(selectedBooking?.updatedAmount || selectedBooking?.totalAmount || 0).toLocaleString()}</div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1 text-gray-700">Additional Expenditure (INR)</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500" 
                  value={expenditure} 
                  onChange={e => setExpenditure(parseFloat(e.target.value) || 0)}
                  placeholder="Enter extra costs if any"
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <button onClick={() => setIsInvoiceModalOpen(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold">Cancel</button>
                <button onClick={confirmInvoice} className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-bold">Generate & Send</button>
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

const generateInvoice = (booking: Booking, expenditure: number) => {
  const doc = new jsPDF();
  const timestamp = format(new Date(), 'dd/MM/yyyy HH:mm:ss');
  const baseAmount = booking.updatedAmount || booking.totalAmount;
  const totalAmount = baseAmount + expenditure;
  const partyName = booking.isManual ? booking.partyName : booking.visitorName;
  const partyMobile = booking.isManual ? booking.visitorMobile : booking.visitorMobile; // Both use visitorMobile field in DB
  
  // Add company logo/name
  doc.setFontSize(24);
  doc.setTextColor(234, 88, 12); // orange-600
  doc.text("UTSAV EVENT MANAGER", 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Your Perfect Event Partner", 105, 28, { align: 'center' });
  
  doc.setDrawColor(234, 88, 12);
  doc.line(20, 35, 190, 35);
  
  // Invoice Details
  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text("BOOKING INVOICE", 20, 50);
  
  doc.setFontSize(10);
  doc.text(`Invoice No: INV-${booking.id.substring(0, 8).toUpperCase()}`, 140, 50);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 140, 55);
  doc.text(`Time: ${timestamp.split(' ')[1]}`, 140, 60);
  
  // Party Details
  doc.setFontSize(12);
  doc.text("Bill To:", 20, 70);
  doc.setFontSize(10);
  doc.text(`Name: ${partyName}`, 20, 78);
  doc.text(`Mobile: ${partyMobile}`, 20, 83);
  doc.text(`Event: ${booking.eventType || 'N/A'}`, 20, 88);
  doc.text(`Date: ${booking.eventDate}`, 20, 93);
  if (booking.startTime) {
    doc.text(`Timing: ${booking.startTime} - ${booking.endTime}`, 20, 98);
  }

  // Service Details
  doc.setFontSize(12);
  doc.text("Service Details:", 110, 70);
  doc.setFontSize(10);
  doc.text(`Provider: ${booking.targetName}`, 110, 78);
  doc.text(`Type: ${booking.targetType.toUpperCase()}`, 110, 83);

  // Table Header
  doc.setFillColor(245, 245, 245);
  doc.rect(20, 110, 170, 10, 'F');
  doc.setFontSize(10);
  doc.text("Description", 25, 117);
  doc.text("Amount (INR)", 160, 117, { align: 'right' });

  // Table Rows
  doc.text(`Base Booking Amount for ${booking.targetName}`, 25, 130);
  doc.text(baseAmount.toLocaleString(), 160, 130, { align: 'right' });

  if (expenditure > 0) {
    doc.text("Additional Expenditure / Extra Services", 25, 140);
    doc.text(expenditure.toLocaleString(), 160, 140, { align: 'right' });
  }

  // Total
  doc.setDrawColor(200);
  doc.line(20, 150, 190, 150);
  doc.setFontSize(14);
  doc.setTextColor(234, 88, 12);
  doc.text("Total Amount:", 110, 165);
  doc.text(`INR ${totalAmount.toLocaleString()}`, 160, 165, { align: 'right' });

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text("Thank you for choosing UTSAV EVENT MANAGER!", 105, 200, { align: 'center' });
  doc.text("This is a computer-generated invoice.", 105, 205, { align: 'center' });

  doc.save(`Invoice_${booking.visitorName}_${booking.id.substring(0, 8)}.pdf`);
};

const DashboardView = ({ user, profile, onUpdateProfile }: { user: any, profile: UserProfile | null, onUpdateProfile: (p: UserProfile) => void }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as any) || 'overview';
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'venues' | 'orders' | 'services' | 'catalogue' | 'subscription' | 'booking-manager'>(initialTab);
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

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as any);
    setSearchParams({ tab });
  };

  useEffect(() => {
    if (!user?.uid) return;

    const fetchDashboardData = async () => {
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
            is_invoice_generated: d.is_invoice_generated,
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

    fetchDashboardData();

    const subscription = supabase
      .channel('dashboard_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        fetchDashboardData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'venues' }, () => {
        fetchDashboardData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_providers' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.uid, profile?.role]);

  if (!user) return <Navigate to="/login" />;

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <BarChart2 size={20} />, roles: ['owner', 'provider', 'user'] },
    { id: 'profile', label: 'Profile Manage', icon: <UserIcon size={20} /> },
    { id: 'venues', label: 'Venue Manage', icon: <Home size={20} />, roles: ['owner'] },
    { id: 'orders', label: 'Order Manage', icon: <Calendar size={20} />, roles: ['owner', 'provider', 'user'] },
    { id: 'booking-manager', label: 'Booking Manager', icon: <Plus size={20} />, roles: ['owner', 'provider'] },
    { id: 'services', label: 'Services Manage', icon: <Music size={20} />, roles: ['provider'] },
    { id: 'catalogue', label: 'Catalogue Manage', icon: <ImageIcon size={20} />, roles: ['owner', 'provider'] },
    { id: 'subscription', label: 'Subscription', icon: <CreditCard size={20} />, roles: ['owner', 'provider'] },
  ];

  const filteredMenu = menuItems.filter(item => {
    if (profile?.role === 'admin') {
      return item.id === 'profile';
    }
    return !item.roles || item.roles.includes(profile?.role || '');
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    approved: bookings.filter(b => b.status === 'confirmed' || b.status === 'paid').length
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-3xl shadow-xl border border-orange-100 overflow-hidden sticky top-24">
            <div className="p-6 bg-orange-600 text-white">
              <h2 className="font-bold text-lg">Dashboard</h2>
              <p className="text-xs opacity-80">Welcome, {profile?.displayName}</p>
            </div>
            <nav className="p-4 space-y-2">
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
          </div>
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                        <Calendar size={24} />
                      </div>
                      <div className="text-3xl font-black text-gray-900 mb-1">{stats.total}</div>
                      <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Bookings</div>
                    </div>
                    <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center mb-4">
                        <Clock size={24} />
                      </div>
                      <div className="text-3xl font-black text-gray-900 mb-1">{stats.pending}</div>
                      <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Pending Requests</div>
                    </div>
                    <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4">
                        <CheckCircle size={24} />
                      </div>
                      <div className="text-3xl font-black text-gray-900 mb-1">{stats.approved}</div>
                      <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Approved Bookings</div>
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
                <OrderManageView user={user} profile={profile} bookings={bookings} />
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
              <p className="text-sm text-gray-500">{v.address}, {v.city}</p>
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

const OrderManageView = ({ user, profile, bookings }: { user: any, profile: UserProfile | null, bookings: Booking[] }) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  const visitorBookings = bookings.filter(b => !b.isManual);
  
  const filteredBookings = visitorBookings.filter(b => {
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchesDate = !dateFilter || b.eventDate === dateFilter;
    return matchesStatus && matchesDate;
  });

  const sortedBookings = [...filteredBookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isAmountModalOpen, setIsAmountModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [expenditure, setExpenditure] = useState(0);
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
      generateInvoice(selectedBooking, expenditure);
      
      // Also send to WhatsApp if possible
      const finalAmount = (selectedBooking.updatedAmount || selectedBooking.totalAmount) + expenditure;
      const msg = `Hello ${selectedBooking.visitorName}, your invoice for ${selectedBooking.targetName} has been generated. Total Amount: INR ${finalAmount.toLocaleString()}. Please check your PDF invoice.`;
      sendWhatsAppAlert(selectedBooking.visitorMobile, msg);
      
      await supabase.from('bookings').update({ is_invoice_generated: true }).eq('id', selectedBooking.id);
      
      setIsInvoiceModalOpen(false);
      setSelectedBooking(null);
      setExpenditure(0);
      toast.success('Invoice generated and shared via WhatsApp');
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
                <span className="flex items-center bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm"><IndianRupee size={14} className="mr-1 text-orange-600" /> {(b.updatedAmount || b.totalAmount).toLocaleString()}</span>
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
                    disabled={b.is_invoice_generated}
                    onClick={() => {
                      if (b.is_invoice_generated) {
                        toast.error('Amount cannot be updated after invoice generation');
                        return;
                      }
                      setSelectedBooking(b);
                      setNewAmount(b.updatedAmount || b.totalAmount);
                      setIsAmountModalOpen(true);
                    }}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-bold flex items-center space-x-2 transition-all",
                      b.is_invoice_generated ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-orange-100 text-orange-600 hover:bg-orange-200"
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

      {isInvoiceModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-6">Generate Invoice</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="text-xs font-bold text-gray-400 uppercase mb-1">Booking Details</div>
                <div className="font-bold text-gray-900">{selectedBooking?.targetName}</div>
                <div className="text-sm text-gray-500">{selectedBooking?.visitorName} | {selectedBooking?.eventDate}</div>
                <div className="text-sm font-bold text-orange-600 mt-1">Base Amount: ₹{(selectedBooking?.updatedAmount || selectedBooking?.totalAmount || 0).toLocaleString()}</div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1 text-gray-700">Additional Expenditure (INR)</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500" 
                  value={expenditure} 
                  onChange={e => setExpenditure(parseFloat(e.target.value) || 0)}
                  placeholder="Enter extra costs if any"
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <button onClick={() => setIsInvoiceModalOpen(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold">Cancel</button>
                <button onClick={confirmInvoice} className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-bold">Generate & Send</button>
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
              <p className="text-sm text-gray-500">{s.serviceType} • {s.city}</p>
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
                    onUpload={(url) => setNewItem({...newItem, images: [...(newItem.images || []), url]})}
                  />
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {newItem.images?.map((img, i) => (
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
    city: '',
    images: [''],
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
        city: profile?.city || '',
        state: profile?.state || '',
        district: profile?.district || '',
        block: profile?.block || '',
        images: formData.images.filter(i => i !== ''),
        provider_id: user.uid,
        rating: 0,
        review_count: 0
      }]);
      if (error) throw error;
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
              <option value="Other Related Services">Other Related Services</option>
            </select>
          </div>
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Price Range (e.g. ₹10k - ₹50k)</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
        </div>
        <button 
          type="submit"
          className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg"
        >
          Register Service
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
        if (data.provider_id !== user.uid) {
          toast.error('Unauthorized');
          navigate('/dashboard');
          return;
        }
        setFormData({
          ...data,
          providerId: data.provider_id,
          serviceType: data.service_type,
          priceRange: data.price_range,
          priceLevel: data.price_level || 'per day'
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
        city: formData.city,
        state: profile?.state || formData.state,
        district: profile?.district || formData.district,
        block: profile?.block || formData.block,
        images: formData.images
      }).eq('id', id);
      if (error) throw error;
      toast.success('Service updated successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to update service');
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
              <option value="Other Related Services">Other Related Services</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
            />
          </div>
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Price Range</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
        if (data.owner_id !== user.uid) {
          toast.error('Unauthorized');
          navigate('/dashboard');
          return;
        }
        setFormData({
          ...data,
          ownerId: data.owner_id,
          venueType: data.venue_type,
          pricePerDay: data.price_per_day
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
        city: formData.city,
        state: profile?.state || formData.state,
        district: profile?.district || formData.district,
        block: profile?.block || formData.block,
        pincode: formData.pincode,
        capacity: formData.capacity,
        price_per_day: formData.pricePerDay,
        images: formData.images,
        facilities: formData.facilities
      }).eq('id', id);
      if (error) throw error;
      toast.success('Venue updated successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to update venue');
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
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Full Address</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
              value={formData.capacity}
              onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Price Per Day (₹)</label>
            <input 
              required
              type="number" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              value={formData.pricePerDay}
              onChange={(e) => setFormData({...formData, pricePerDay: parseInt(e.target.value)})}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
            <textarea 
              required
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              value={formData.facilities.join(', ')}
              onChange={(e) => setFormData({...formData, facilities: e.target.value.split(',').map(s => s.trim())})}
            />
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
    city: profile?.city || '',
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
          city: formData.city,
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
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              value={formData.displayName}
              onChange={(e) => setFormData({...formData, displayName: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Father's Name</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    pincode: '',
    venueType: 'Marriage Garden',
    capacity: 0,
    pricePerDay: 0,
    images: [''],
    facilities: [''],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('venues').insert([{
        name: formData.name,
        venue_type: formData.venueType,
        description: formData.description,
        address: formData.address,
        city: profile?.city || '',
        state: profile?.state || '',
        district: profile?.district || '',
        block: profile?.block || '',
        pincode: profile?.pincode || '',
        capacity: formData.capacity,
        price_per_day: formData.pricePerDay,
        images: formData.images.filter(i => i !== ''),
        facilities: formData.facilities.filter(a => a !== ''),
        owner_id: user.uid
      }]);
      if (error) throw error;
      toast.success('Venue added successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to add venue');
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
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
              value={formData.capacity}
              onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Price Per Day (₹)</label>
            <input 
              required
              type="number" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              value={formData.pricePerDay}
              onChange={(e) => setFormData({...formData, pricePerDay: parseInt(e.target.value)})}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
            <textarea 
              required
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              value={formData.facilities.join(', ')}
              onChange={(e) => setFormData({...formData, facilities: e.target.value.split(',').map(s => s.trim())})}
            />
          </div>
        </div>
        <button 
          type="submit"
          className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg"
        >
          List Venue
        </button>
      </form>
    </div>
  );
};

// --- Main App ---

const SearchResultsView = () => {
  const [searchParams] = useSearchParams();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [services, setServices] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');

  const query = searchParams.get('q')?.toLowerCase() || '';
  const city = searchParams.get('city')?.toLowerCase() || '';

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
          city: d.city,
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

        if (query) {
          vData = vData.filter(v => 
            v.name.toLowerCase().includes(query) || 
            v.venueType.toLowerCase().includes(query) ||
            v.city.toLowerCase().includes(query) ||
            v.description?.toLowerCase().includes(query)
          );
        }
        if (city) vData = vData.filter(v => v.city.toLowerCase().includes(city));
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
          city: d.city,
          experience: d.experience,
          priceRange: d.price_range,
          description: d.description,
          images: d.images,
          rating: d.rating,
          reviewCount: d.review_count,
          createdAt: d.created_at
        } as ServiceProvider));

        if (query) {
          sData = sData.filter(s => 
            s.name.toLowerCase().includes(query) || 
            s.serviceType.toLowerCase().includes(query) ||
            s.city.toLowerCase().includes(query) ||
            s.description?.toLowerCase().includes(query)
          );
        }
        if (city) sData = sData.filter(s => s.city.toLowerCase().includes(city));
        if (selectedState) sData = sData.filter(s => s.state === selectedState);
        if (selectedDistrict) sData = sData.filter(s => s.district === selectedDistrict);
        if (selectedBlock) sData = sData.filter(s => s.block === selectedBlock);
        
        setServices(sData);
      }
      setLoading(false);
    };
    fetchData();
  }, [query, city, selectedState, selectedDistrict, selectedBlock]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-4">Search Results</h1>
          <p className="text-gray-500">
            Showing results for "{query}" {city && `in ${city}`}
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-3xl border border-gray-100">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">State</label>
            <select 
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedDistrict('');
                setSelectedBlock('');
              }}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
            >
              <option value="">All States</option>
              {states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">District</label>
            <select 
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setSelectedBlock('');
              }}
              disabled={!selectedState}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none disabled:opacity-50"
            >
              <option value="">All Districts</option>
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Block</label>
            <select 
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              disabled={!selectedDistrict}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none disabled:opacity-50"
            >
              <option value="">All Blocks</option>
              {blocks.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>
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
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>

          <footer className="bg-gray-900 text-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="col-span-1 md:col-span-2">
                  <div className="flex items-center space-x-4 mb-6">
                    <CNZLogo size="lg" lightText={true} />
                    <div className="h-10 w-px bg-gray-700 mx-2" />
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg text-center">EM</div>
                      <span className="text-2xl font-bold">Event Manager</span>
                    </div>
                  </div>
                  <p className="text-gray-400 max-w-sm mb-6">
                    India's premier platform for wedding and event planning. We connect you with the best venues and service providers to make your celebrations truly special.
                  </p>
                  <div className="bg-gray-800/50 p-6 rounded-3xl border border-gray-700 inline-block">
                    <div className="flex items-center space-x-4">
                      <div className="bg-orange-500/20 p-3 rounded-2xl">
                        <Star className="text-orange-500" size={24} fill="currentColor" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">App Rating</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-black text-white">4.9</span>
                          <span className="text-gray-500">/ 5.0</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsAppRatingOpen(true)}
                        className="ml-4 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all"
                      >
                        Rate Us
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-bold mb-6">Quick Links</h4>
                  <ul className="space-y-4 text-gray-400">
                    <li><Link to="/" className="hover:text-orange-400 transition-colors">Home</Link></li>
                    <li><Link to="/gallery" className="hover:text-orange-400 transition-colors">Gallery</Link></li>
                    <li><Link to="/venues" className="hover:text-orange-400 transition-colors">Search</Link></li>
                    <li><Link to="/about" className="hover:text-orange-400 transition-colors">About</Link></li>
                    <li><Link to="/registration" className="hover:text-orange-400 transition-colors">Registration</Link></li>
                    <li><Link to="/login" className="hover:text-orange-400 transition-colors">Login</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-bold mb-6">Support</h4>
                  <ul className="space-y-4 text-gray-400">
                    <li><a href="#" className="hover:text-orange-400 transition-colors">Help Center</a></li>
                    <li><a href="#" className="hover:text-orange-400 transition-colors">Contact Us</a></li>
                    <li><a href="#" className="hover:text-orange-400 transition-colors">Privacy Policy</a></li>
                  </ul>
                </div>
              </div>
              <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col items-center justify-center space-y-8">
                <PoweredByCNZ />
                <div className="text-gray-500 text-sm">
                  © 2026 Event Manager India. All rights reserved.
                </div>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

// --- Admin View ---

const AdminView = ({ user, profile, onUpdateProfile }: { user: any, profile: UserProfile | null, onUpdateProfile: (p: UserProfile) => void }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'users' | 'plans' | 'notifications' | 'banners' | 'servicePhotos' | 'profile'>('users');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [banners, setBanners] = useState<AppBanner[]>([]);
  const [servicePhotos, setServicePhotos] = useState<ServiceTypePhoto[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states for adding notification/banner/servicePhoto
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [newNotification, setNewNotification] = useState({ title: '', message: '' });
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [newBanner, setNewBanner] = useState({ title: '', imageUrl: '' });
  const [isServicePhotoModalOpen, setIsServicePhotoModalOpen] = useState(false);
  const [newServicePhoto, setNewServicePhoto] = useState({ serviceType: 'Caterer' as ServiceType, imageUrl: '' });

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

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
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

  const deleteNotification = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (!error) {
      toast.success('Notification deleted');
      setNotifications(prev => prev.filter(n => n.id !== id));
    } else {
      toast.error('Failed to delete notification');
    }
  };

  const deleteBanner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    const { error } = await supabase.from('banners').delete().eq('id', id);
    if (!error) {
      toast.success('Banner deleted');
      setBanners(prev => prev.filter(b => b.id !== id));
    } else {
      toast.error('Failed to delete banner');
    }
  };

  const deleteServicePhoto = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service photo?')) return;
    const { error } = await supabase.from('service_type_photos').delete().eq('id', id);
    if (!error) {
      toast.success('Service photo deleted');
      setServicePhotos(prev => prev.filter(p => p.id !== id));
    } else {
      toast.error('Failed to delete service photo');
    }
  };

  const toggleUserStatus = async (uid: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    const { error } = await supabase.from('users').update({ status: newStatus }).eq('uid', uid);
    if (!error) {
      toast.success(`User ${newStatus === 'active' ? 'enabled' : 'disabled'}`);
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, status: newStatus } : u));
    } else {
      toast.error('Failed to update user status');
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
    const { error } = await supabase.from('subscription_plans').update({ price: newPrice }).eq('id', id);
    if (!error) {
      toast.success('Plan price updated');
      fetchData();
    }
  };

  const togglePlanStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('subscription_plans').update({ is_active: !currentStatus }).eq('id', id);
    if (!error) {
      toast.success(`Plan ${!currentStatus ? 'enabled' : 'disabled'}`);
      fetchData();
    }
  };

  const downloadReport = () => {
    const data = users.map(u => ({
      'Registration ID': u.registrationId,
      'Name': u.displayName,
      'Mobile': u.mobileNumber,
      'Email': u.email,
      'Role': u.role,
      'Status': u.status,
      'Created At': new Date(u.createdAt).toLocaleString()
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "registered_users_report.xlsx");
    toast.success('Report downloaded as Excel');
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
        target_role: 'all'
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
            <button onClick={downloadReport} className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-orange-600 transition-colors">
              <Download size={18} />
              <span>Download User Report</span>
            </button>
          </div>
        </div>

        <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
          {[
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
              {activeTab === 'users' && (
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
                      {users.map(u => (
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
                              <button onClick={() => toggleUserStatus(u.uid, u.status)} className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600">
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
                        <span className="text-3xl font-bold text-gray-900">₹{plan.price}</span>
                        <button 
                          onClick={() => {
                            const newPrice = prompt('Enter new price:', plan.price.toString());
                            if (newPrice) updatePlanPrice(plan.id, parseFloat(newPrice));
                          }}
                          className="text-orange-500 font-bold text-sm hover:underline"
                        >
                          Edit Price
                        </button>
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
                        <button 
                          onClick={() => deleteNotification(n.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
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
                          'Fast food stalls', 'Loundry service', 'Helper', 'Other Related Services'
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
    </div>
  );
};

const VenueListView = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [cityFilter, setCityFilter] = useState(searchParams.get('city') || '');

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
        city: d.city,
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
      const city = searchParams.get('city')?.toLowerCase();

      if (search) {
        data = data.filter(v => 
          v.name.toLowerCase().includes(search) || 
          v.venueType.toLowerCase().includes(search) ||
          v.city.toLowerCase().includes(search)
        );
      }
      if (city) data = data.filter(v => v.city.toLowerCase().includes(city));

      setVenues(data);
      setLoading(false);
    };
    fetchVenues();
  }, [searchParams]);

  const handleCityFilter = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (cityFilter) newParams.set('city', cityFilter);
    else newParams.delete('city');
    setSearchParams(newParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Available Venues</h1>
        <form onSubmit={handleCityFilter} className="flex items-center space-x-2 bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm w-full md:w-auto">
          <MapPin size={18} className="text-orange-500" />
          <input 
            type="text" 
            placeholder="Filter by City..." 
            className="focus:outline-none text-sm w-full"
            value={cityFilter}
            onChange={e => setCityFilter(e.target.value)}
          />
          <button type="submit" className="bg-orange-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-orange-700">
            Filter
          </button>
        </form>
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
  const [cityFilter, setCityFilter] = useState(searchParams.get('city') || '');

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
        city: d.city,
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
      const city = searchParams.get('city')?.toLowerCase();

      if (type) data = data.filter(s => s.serviceType === type);
      if (search) {
        data = data.filter(s => 
          s.name.toLowerCase().includes(search) || 
          s.serviceType.toLowerCase().includes(search) ||
          s.city.toLowerCase().includes(search)
        );
      }
      if (city) data = data.filter(s => s.city.toLowerCase().includes(city));

      setServices(data);
      setLoading(false);
    };
    fetchServices();
  }, [searchParams]);

  const handleCityFilter = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (cityFilter) newParams.set('city', cityFilter);
    else newParams.delete('city');
    setSearchParams(newParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Event Services</h1>
        <form onSubmit={handleCityFilter} className="flex items-center space-x-2 bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm w-full md:w-auto">
          <MapPin size={18} className="text-orange-500" />
          <input 
            type="text" 
            placeholder="Filter by City..." 
            className="focus:outline-none text-sm w-full"
            value={cityFilter}
            onChange={e => setCityFilter(e.target.value)}
          />
          <button type="submit" className="bg-orange-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-orange-700">
            Filter
          </button>
        </form>
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
