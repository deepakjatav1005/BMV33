import React, { useState, useEffect } from 'react';
import { Star, RotateCcw, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { db } from '../lib/supabase';
import { cn, generateUUID } from '../lib/utils';
import { Review } from '../types';

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
                  <Star key={i} size={18} fill={i < Math.round(currentRating || 0) ? "currentColor" : "none"} className={i < Math.round(currentRating || 0) ? "text-yellow-500" : "text-gray-200"} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center font-bold text-xl uppercase shadow-inner">
                    {review.userName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{review.userName}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center text-yellow-500 space-x-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "text-yellow-500" : "text-gray-200"} />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed italic">"{review.comment}"</p>
            </div>
          ))}
          {reviews.length === 0 && (
            <div className="col-span-full py-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No reviews for this item yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewSection;
