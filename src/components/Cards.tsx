import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Users, IndianRupee } from 'lucide-react';
import { Venue, ServiceProvider } from '../types';
import { resolveUrl } from '../services/dataService';

export const VenueCard = React.memo(({ venue }: { venue: Venue, key?: any }) => (
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
          loading="lazy"
          referrerPolicy="no-referrer"
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
));

export const ServiceCard = React.memo(({ service }: { service: ServiceProvider, key?: any }) => {
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
            loading="lazy"
            referrerPolicy="no-referrer"
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
});
