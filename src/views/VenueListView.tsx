import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { db } from '../services/dataService';
import { Venue } from '../types';
import { locations as LOCATION_DATA } from '../data/locations';
import { VenueCard } from '../components/Cards';

const VenueListView = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  
  const [selectedState, setSelectedState] = useState(searchParams.get('state') || '');
  const [selectedDistrict, setSelectedDistrict] = useState(searchParams.get('district') || '');
  const [selectedBlock, setSelectedBlock] = useState(searchParams.get('block') || '');

  const states = Object.keys(LOCATION_DATA || {});
  const districts = selectedState ? Object.keys(LOCATION_DATA[selectedState] || {}) : [];
  const blocks = (selectedState && selectedDistrict && LOCATION_DATA[selectedState]) ? (LOCATION_DATA[selectedState][selectedDistrict] || []) : [];

  useEffect(() => {
    let ignore = false;
    const fetchVenues = async () => {
      const { data: venuesData } = await db.from('venues').select('*');
      if (ignore) return;
      
      let data = (venuesData || []).map(d => ({
        id: d.id,
        ownerId: d.owner_id,
        name: d.name,
        venueType: d.venue_type,
        state: d.state,
        district: d.district,
        block: d.block,
        capacity: d.capacity,
        pricePerDay: d.price_per_day,
        images: d.images,
        rating: d.rating,
        reviewCount: d.review_count,
        createdAt: d.created_at
      } as Venue));
      
      const type = searchParams.get('type')?.toLowerCase().replace('+', ' ');
      const search = searchParams.get('search')?.toLowerCase();

      if (type) {
        data = data.filter(v => v.venueType?.toLowerCase() === type || v.venueType?.toLowerCase().includes(type));
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

export default VenueListView;
