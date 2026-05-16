import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { 
  MapPin, Star, User, Home, Check, IndianRupee, Sparkles, 
  CheckCircle, Clock, Database as DeIcon, MessageSquare, Loader
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { db } from '../lib/supabase';
import { cn, resolveUrl, generateUUID, generateTransactionId, sendWhatsAppAlert } from '../lib/utils';
import { Venue, UserProfile } from '../types';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import ReviewSection from '../components/ReviewSection';
import LocationDisplay from '../components/LocationDisplay';

const VenueDetailView = ({ user, profile }: { user: any, profile: UserProfile | null }) => {
  const { id } = useParams();
  const location = useLocation();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingDate, setBookingDate] = useState('');
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
  const [ownerProfile, setOwnerProfile] = useState<any>(null);
  const [stats, setStats] = useState({ completed: 0, totalItems: 0, pending: 0, totalRequests: 0 });

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
        facilities: data.facilities || [],
        catalogue: data.catalogue || [],
        facilityDetails: data.facility_details || [],
        latitude: data.latitude,
        longitude: data.longitude,
        createdAt: data.created_at
      } as Venue);

      // Fetch owner profile
      const { data: userData } = await db
        .from('users')
        .select('*')
        .eq('uid', data.owner_id)
        .single();
      if (userData) setOwnerProfile(userData);

      // Fetch stats
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
      setBookingStatus('idle');
      return;
    }
    if (!/^\d{10}$/.test(visitorMobile)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setBookingStatus('loading');
    try {
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

      let totalAmount = 0;
      const start = new Date(bookingDate);
      const end = endDate ? new Date(endDate) : start;
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      if (bookingMode === 'complete') {
        totalAmount = (venue?.pricePerDay || 0) * diffDays;
      } else {
        const selectedAmenities = venue?.catalogue?.filter(c => selectedItems.includes(c.id || '')) || [];
        totalAmount = selectedAmenities.reduce((sum, item) => sum + (item.priceRate || 0), 0) * diffDays;
      }

      const selectedAmenitiesList = venue?.catalogue?.filter(c => selectedItems.includes(c.id || '')) || [];
      const extraServices = selectedAmenitiesList.map(item => ({ 
        name: item.level, 
        amount: (item.priceRate || 0) * diffDays 
      }));

      const { error } = await db.from('bookings').insert([{
        id: generateUUID(),
        user_id: user?.uid || 'visitor',
        target_id: venue?.id,
        target_type: 'venue',
        target_name: venue?.name + (bookingMode === 'partial' ? ' (Selected Amenities)' : ''),
        owner_id: venue?.ownerId,
        event_date: bookingDate,
        end_date: endDate || bookingDate,
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
      }]);

      if (error) throw error;

      // Send WhatsApp Alert to Provider
      try {
        const { data: ownerProfileData } = await db.from('users').select('mobile_number').eq('uid', venue?.ownerId).single();
        if (ownerProfileData?.mobile_number) {
          const alertMsg = `New Booking Query for ${venue?.name}!\nVisitor: ${visitorName}\nMobile: ${visitorMobile}\nDate: ${bookingDate}\nMessage: ${message || 'No message'}`;
          sendWhatsAppAlert(ownerProfileData.mobile_number, alertMsg);
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
  if (!venue) return <div className="text-center py-20">Venue not found</div>;

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
            src={resolveUrl(venue.images?.[0]) || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1920'} 
            alt={venue.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Venue Info Header */}
      <div className="max-w-7xl mx-auto px-4 mt-10">
        <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
          <div className="flex-1 text-center md:text-left">
             <span className="bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-4 inline-block">
               {venue.venueType}
             </span>
             <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 break-words leading-[1.1]">{venue.name}</h1>
             
             <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4 text-gray-500 mb-6">
               <div className="flex items-center bg-gray-50 px-4 py-2 rounded-xl">
                 <MapPin size={18} className="mr-2 text-orange-500 shrink-0" />
                 <span className="font-bold text-sm md:text-base">{venue.district}, {venue.state}</span>
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
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Presented By</p>
                 <p className="font-bold text-gray-900 leading-tight">{ownerProfile?.display_name || 'Venue Partner'}</p>
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
                     <DeIcon size={10} className="mr-1" />
                     {stats.totalItems} Items
                   </div>
                 </div>
               </div>
             </div>
          </div>
          
          <div className="shrink-0 w-full md:w-auto">
             <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-orange-100 text-center">
                <span className="block text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-80 underline underline-offset-4 font-sans">Full Venue Rate</span>
                <span className="text-2xl md:text-3xl font-black">₹{venue.pricePerDay?.toLocaleString()}</span>
                <span className="block text-xs font-bold mt-1 opacity-80 uppercase tracking-tighter">Per day / full venue</span>
             </div>
          </div>
        </div>
      </div>

      {venue.latitude && venue.longitude && (
        <div className="max-w-7xl mx-auto px-4 mt-8">
          <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <LocationDisplay 
              latitude={venue.latitude} 
              longitude={venue.longitude} 
              businessName={venue.name} 
            />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 mt-10">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-wrap gap-8 justify-around">
           <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shadow-sm">
                 <Star size={24} />
              </div>
              <div>
                 <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1 font-sans">Experience</span>
                 <span className="text-xl font-black text-gray-900 leading-none">{venue.rating > 0 ? venue.rating : 'New'} Stars</span>
              </div>
           </div>
           <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                 <MessageSquare size={24} />
              </div>
              <div>
                 <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1 font-sans">Reviews</span>
                 <span className="text-xl font-black text-gray-900 leading-none">{venue.reviewCount || 0} Total</span>
              </div>
           </div>
           <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shadow-sm">
                 <User size={24} />
              </div>
              <div>
                 <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1 font-sans">Capacity</span>
                 <span className="text-xl font-black text-gray-900 leading-none">{venue.capacity || 'N/A'}+ Guests</span>
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
                {venue.availableFor?.map((item, idx) => (
                  <span key={idx} className="bg-orange-50 text-orange-700 px-4 py-2 rounded-xl text-sm font-bold border border-orange-100">
                    {item}
                  </span>
                ))}
              </div>
            </section>

            <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">About this venue</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{venue.description}</p>
            </section>

            <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Facilities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {venue.facilities.map((facility, idx) => (
                  <div key={idx} className="flex items-center space-x-3 text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                      <Check size={14} strokeWidth={3} />
                    </div>
                    <span className="font-bold text-sm uppercase tracking-tight">{facility}</span>
                  </div>
                ))}
              </div>
            </section>

            {venue.facilityDetails && venue.facilityDetails.length > 0 && (
              <section className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden min-w-0">
                <h3 className="text-2xl font-bold mb-8 text-gray-900 underline decoration-orange-500 decoration-4 underline-offset-8 italic uppercase tracking-tighter">Facility Details & Rate List</h3>
                <div className="overflow-x-auto -mx-6 md:mx-0">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-orange-600 text-white">
                      <tr>
                        <th className="px-6 py-4 font-black text-[10px] uppercase tracking-[0.2em]">Sr.</th>
                        <th className="px-6 py-4 font-black text-[10px] uppercase tracking-[0.2em]">Facility</th>
                        <th className="px-6 py-4 font-black text-[10px] uppercase tracking-[0.2em]">Rate</th>
                        <th className="px-6 py-4 font-black text-[10px] uppercase tracking-[0.2em] text-center">Unit</th>
                        <th className="px-6 py-4 font-black text-[10px] uppercase tracking-[0.2em] text-center">Photo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 bg-white">
                      {venue.facilityDetails.map((f, i) => (
                        <tr key={f.id || i} className="hover:bg-orange-50/50 transition-all group group/row">
                          <td className="px-6 py-4 text-xs font-bold text-gray-400">{i + 1}</td>
                          <td className="px-6 py-4">
                            <span className="text-gray-900 font-black text-sm uppercase tracking-tight">{f.name}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-orange-700 font-black text-lg">₹{f.rate.toLocaleString()}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter whitespace-nowrap">{f.unit}</span>
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

            {venue.catalogue && venue.catalogue.length > 0 && (
              <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-2xl font-bold mb-8 text-gray-900">Catalogue</h3>
                <div className="space-y-12">
                  {venue.catalogue.map((item, idx) => (
                    <div key={idx} className="space-y-4">
                      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <h4 className="font-black text-orange-600 uppercase tracking-widest">{item.level}</h4>
                        <div className="flex gap-2 items-center">
                          {item.capacity > 0 && (
                            <span className="text-[10px] font-black bg-white text-gray-600 px-3 py-1.5 rounded-full border border-gray-200 uppercase tracking-tight">
                              Capacity: {item.capacity}
                            </span>
                          )}
                          {item.priceRate && (
                            <span className="text-xs font-black bg-orange-600 text-white px-4 py-1.5 rounded-full shadow-md flex items-center">
                              <IndianRupee size={12} className="mr-0.5" /> {item.priceRate.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm italic">{item.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {item.images.map((img, imgIdx) => (
                          <div key={imgIdx} className="aspect-square rounded-2xl overflow-hidden border-2 border-gray-100 shadow-sm hover:border-orange-200 transition-all">
                            <img 
                              src={resolveUrl(img)} 
                              alt={`${item.level} ${imgIdx + 1}`} 
                              className="w-full h-full object-contain hover:scale-110 transition-transform duration-500" 
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {venue.catalogue && venue.catalogue.length > 0 && (
              <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-2xl font-bold mb-6 text-gray-900 underline decoration-orange-500 decoration-4 underline-offset-8 italic uppercase tracking-tighter">Available Categories & Packages</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {venue.catalogue.map((cat, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-orange-50 rounded-2xl border border-orange-100 group hover:border-orange-300 transition-all hover:shadow-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white rounded-xl border border-orange-200 flex items-center justify-center text-orange-600 shadow-sm">
                          <Sparkles size={20} />
                        </div>
                        <div>
                          <span className="block text-xs font-black text-orange-700 uppercase tracking-widest leading-none mb-1">{cat.level}</span>
                          <p className="text-[9px] text-gray-500 font-black uppercase tracking-tight italic">{cat.description || 'Premium Service'}</p>
                        </div>
                      </div>
                      <div className="bg-white px-3 py-1.5 rounded-xl border border-orange-200 shadow-inner group-hover:scale-105 transition-transform">
                        <span className="text-xs font-black text-orange-600">₹{cat.priceRate?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <ReviewSection 
                targetId={venue.id} 
                targetType="venue" 
                targetName={venue.name}
                currentRating={venue.rating} 
                onReviewAdded={fetchVenue}
                user={user}
              />
            </section>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-2xl border border-orange-100 sticky top-24">
                  <div className="flex items-baseline space-x-2 mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  {bookingMode === 'complete' 
                    ? `₹${venue.pricePerDay?.toLocaleString()}` 
                    : `₹${(venue?.facility_details?.filter(c => selectedItems.includes(c.id || '')).reduce((sum, item) => sum + (item.priceRate || 0), 0) || 0).toLocaleString()}`
                  }
                </span>
                <span className="text-gray-500">/ day</span>
              </div>
              
              {bookingStatus === 'success' ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check size={32} />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Query Sent!</h4>
                  <p className="text-gray-500">The owner will contact you shortly.</p>
                  <button 
                    onClick={() => setBookingStatus('idle')}
                    className="mt-6 text-orange-600 font-bold hover:underline"
                  >
                    Send another query
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBooking} className="space-y-5">
                  {!user && (
                    <>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 font-sans">Full Name</label>
                        <input 
                          required
                          type="text" 
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                          placeholder="Your Name"
                          value={visitorName}
                          onChange={(e) => setVisitorName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 font-sans">Mobile Number</label>
                        <input 
                          required
                          type="tel" 
                          maxLength={10}
                          pattern="[0-9]{10}"
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                          placeholder="10-digit mobile"
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
                    <label className="block text-sm font-bold text-gray-700 mb-2 font-sans">Event Details</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      placeholder="e.g. Wedding Ceremony, Birthday"
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 font-sans">Your Full Address</label>
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
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-black text-orange-600 uppercase tracking-widest font-sans">Booking Mode</label>
                      <div className="bg-white px-3 py-1 rounded-full border border-orange-200">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Choose Package</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={() => setBookingMode('complete')}
                        className={cn(
                          "flex-1 py-2 rounded-xl text-xs font-bold transition-all border",
                          bookingMode === 'complete' ? "bg-orange-600 text-white border-orange-600 shadow-md" : "bg-white text-gray-600 border-gray-200"
                        )}
                      >
                        Complete Venue
                      </button>
                      <button 
                        type="button"
                        onClick={() => setBookingMode('partial')}
                        className={cn(
                          "flex-1 py-2 rounded-xl text-xs font-bold transition-all border",
                          bookingMode === 'partial' ? "bg-orange-600 text-white border-orange-600 shadow-md" : "bg-white text-gray-600 border-gray-200"
                        )}
                      >
                        Select Amenities
                      </button>
                    </div>

                    {bookingMode === 'partial' && venue.facility_details && (
                      <div className="space-y-2 mt-4 pt-4 border-t border-orange-100">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest font-sans">Available Amenities Category</label>
                        <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2">
                          {venue.facility_details.filter(c => c.priceRate && c.priceRate > 0).map(item => (
                            <label key={item.id} className="flex items-center justify-between p-2 bg-white rounded-xl border border-orange-100 cursor-pointer hover:border-orange-300 transition-colors">
                              <div className="flex items-center space-x-2">
                                <input 
                                  type="checkbox"
                                  className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                                  checked={selectedItems.includes(item.id || '')}
                                  onChange={(e) => {
                                    if (e.target.checked) setSelectedItems([...selectedItems, item.id || '']);
                                    else setSelectedItems(selectedItems.filter(id => id !== item.id));
                                  }}
                                />
                                <span className="text-xs font-bold text-gray-700 uppercase leading-none font-sans">{item.name}</span>
                              </div>
                              <span className="text-xs font-black text-orange-600">₹{item.priceRate?.toLocaleString()}</span>
                            </label>
                          ))}
                          {(!venue.facility_details || venue.facility_details.filter(c => c.priceRate && c.priceRate > 0).length === 0) && (
                            <p className="text-[10px] text-gray-400 italic font-sans">No priced amenities available.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none font-sans">Date Start From</label>
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
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none font-sans">Date To</label>
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
                      <label className="block text-sm font-bold text-gray-700 mb-2 font-sans">Start Time</label>
                      <input 
                        required
                        type="time" 
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 font-sans">End Time</label>
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
                    <label className="block text-sm font-bold text-gray-700 mb-2 font-sans">Message (Optional)</label>
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
                    className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-700 shadow-xl shadow-orange-200 transition-all disabled:opacity-50 font-sans"
                  >
                    {bookingStatus === 'loading' ? 'Sending...' : 'Send Booking Query'}
                  </button>
                </form>
              )}
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-gray-900 px-2 font-sans">Availability Calendar</h4>
              <AvailabilityCalendar targetId={venue.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueDetailView;
