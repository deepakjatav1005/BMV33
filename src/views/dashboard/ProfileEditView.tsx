import React, { useState } from 'react';
import { db } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { UserProfile } from '../../types';
import ImageUpload from '../../components/ImageUpload';
import { LOCATION_DATA } from '../../constants';

interface ProfileEditViewProps {
  user: any;
  profile: UserProfile | null;
  onUpdate: (p: UserProfile) => void;
}

const ProfileEditView: React.FC<ProfileEditViewProps> = ({ user, profile, onUpdate }) => {
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

export default ProfileEditView;
