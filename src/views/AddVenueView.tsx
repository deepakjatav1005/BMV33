import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { db } from '../lib/supabase';
import { UserProfile, FacilityItem } from '../types';
import { 
  VENUE_TYPES, 
  EVENT_TYPES, 
  VENUE_SITE_LEVELS, 
  VENUE_FACILITIES 
} from '../constants';
import { cn, generateUUID, resolveUrl } from '../lib/utils';
import LocationPicker from '../components/LocationPicker';
import { ImageUpload, VideoUpload } from '../components/Uploads';
import FacilityDetailsEditor from '../components/FacilityDetailsEditor';

interface AddVenueViewProps {
  user: any;
  profile: UserProfile | null;
}

const AddVenueView: React.FC<AddVenueViewProps> = ({ user, profile }) => {
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
      
      if (error) {
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
              {VENUE_TYPES.map(type => (
                <option key={type} value={type}>{type.toUpperCase()}</option>
              ))}
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

export default AddVenueView;
