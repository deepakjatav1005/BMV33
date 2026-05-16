import React from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, BarChart2, Calendar, CheckCircle, IndianRupee } from 'lucide-react';
import { Booking, UserProfile } from '../../types';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import { resolveUrl } from '../../lib/utils';

interface OverviewViewProps {
  profile: UserProfile | null;
  stats: {
    total: number;
    pending: number;
    approved: number;
    completed: number;
  };
  todayBookings: Booking[];
  onTabChange: (tab: string) => void;
}

const OverviewView: React.FC<OverviewViewProps> = ({ profile, stats, todayBookings, onTabChange }) => {
  return (
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
              onClick={() => onTabChange('public-booking')}
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
  );
};

export default OverviewView;
