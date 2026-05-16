import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { db } from '../lib/supabase';
import { UserProfile, FacilityItem } from '../types';
import { 
  SERVICE_TYPES, 
  EVENT_TYPES, 
  SERVICE_FACILITY_OPTIONS 
} from '../constants';
import { cn, generateUUID, resolveUrl } from '../lib/utils';
import LocationPicker from '../components/LocationPicker';
import { ImageUpload, VideoUpload } from '../components/Uploads';
import FacilityDetailsEditor from '../components/FacilityDetailsEditor';

interface AddServiceProviderViewProps {
  user: any;
  profile: UserProfile | null;
}

const AddServiceProviderView: React.FC<AddServiceProviderViewProps> = ({ user, profile }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    pincode: profile?.pincode || '',
    serviceType: SERVICE_TYPES[0],
    priceRange: '',
    priceLevel: 'Budget',
    images: [] as string[],
    video_url: '',
    facilities: [] as string[],
    facilityDetails: [] as FacilityItem[],
    availableFor: [] as string[],
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
        video_url: formData.video_url,
        facilities: formData.facilities,
        facility_details: formData.facilityDetails,
        available_for: formData.availableFor,
        latitude: formData.latitude,
        longitude: formData.longitude,
        state: profile?.state || '',
        district: profile?.district || '',
        block: profile?.block || '',
        pincode: formData.pincode || profile?.pincode || '',
        owner_id: user?.uid,
        provider_id: user?.uid,
        rating: 0,
        review_count: 0,
        catalogue: formData.catalogue
      }]);
      
      if (error) throw error;
      
      toast.success('Service added successfully!');
      navigate('/dashboard');
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
        <h1 className="text-3xl font-bold text-gray-900">Add Your Service</h1>
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
            <label className="block text-sm font-bold text-gray-700 mb-2">Service Name</label>
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
              {SERVICE_TYPES.map(type => (
                <option key={type} value={type}>{type.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Price Level</label>
            <select 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              value={formData.priceLevel}
              onChange={(e) => setFormData({...formData, priceLevel: e.target.value})}
            >
              <option value="Budget">Budget</option>
              <option value="Mid-Range">Mid-Range</option>
              <option value="Premium">Premium</option>
              <option value="Luxury">Luxury</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Price Range (e.g. 500-2000 per day)</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              value={formData.priceRange}
              onChange={(e) => setFormData({...formData, priceRange: e.target.value})}
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

          <div className="md:col-span-2 border-t border-gray-100 pt-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-gray-700">Geo-Tag Location (Optional)</label>
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
            <label className="block text-sm font-bold text-gray-700">Media Uploads</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ImageUpload 
                label="Add Photos" 
                multiple={true}
                onUpload={(url) => {
                  const urls = Array.isArray(url) ? url : [url];
                  setFormData(prev => ({...prev, images: [...(prev.images || []), ...urls]}));
                }}
              />
              <VideoUpload 
                label="Add Video (Max 60s)" 
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
            <label className="block text-sm font-bold text-gray-700 mb-2 font-black uppercase text-xs tracking-widest text-orange-600 border-b pb-2">1. Service Available For (Select Events)</label>
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
            <label className="block text-sm font-bold text-gray-700 mb-2 font-black uppercase text-xs tracking-widest text-orange-600 border-b pb-2">2. Detailed Service Options (Rates & Units)</label>
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
          {loading ? 'Adding Service...' : 'List Service'}
        </button>
      </form>
    </div>
  );
};

export default AddServiceProviderView;
