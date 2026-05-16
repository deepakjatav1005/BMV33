import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { db } from '../services/dataService';
import { ServiceProvider, ServiceType } from '../types';
import { locations as LOCATION_DATA } from '../data/locations';
import { ServiceCard } from '../components/Cards';

const ServiceListView = () => {
  const [services, setServices] = useState<ServiceProvider[]>([]);
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
    const fetchServices = async () => {
      const [providersRes, usersRes] = await Promise.all([
        db.from('service_providers').select('*'),
        db.from('users').select('*').eq('role', 'provider')
      ]);
      
      const servicesData = providersRes.data || [];
      const usersData = usersRes.data || [];

      if (ignore) return;

      let data = servicesData.map(d => ({
        id: d.id,
        ownerId: d.owner_id || d.provider_id,
        providerId: d.owner_id || d.provider_id,
        name: d.name,
        serviceType: d.service_type || d.type,
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

      // Add users who don't have a service record yet
      const existingProviderIds = new Set(servicesData.map(d => d.provider_id));
      const synthServices = usersData
        .filter(u => !existingProviderIds.has(u.uid))
        .map(u => ({
          id: 'synth_' + u.uid,
          providerId: u.uid,
          name: u.display_name,
          serviceType: (u.service_type || 'dj and sound service') as ServiceType,
          state: u.state,
          district: u.district,
          block: u.block,
          experience: 'Professional',
          priceRange: 'Contact for details',
          description: `Registered ${u.service_type || 'service provider'} on BVO platform. Contact for bookings and details.`,
          images: u.photo_url ? [u.photo_url] : ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800'],
          rating: 0,
          reviewCount: 0,
          createdAt: u.created_at
        } as ServiceProvider));

      data = [...data, ...synthServices];
      
      const type = searchParams.get('type')?.toLowerCase();
      const search = searchParams.get('search')?.toLowerCase();

      if (type) {
        const lowerType = type.toLowerCase();
        data = data.filter(s => {
          const sType = (s.serviceType?.toLowerCase() || '');
          return sType === lowerType || sType.includes(lowerType) || lowerType.includes(sType);
        });
      }
      if (search) {
        data = data.filter(s => 
          (s.name?.toLowerCase() || '').includes(search) || 
          (s.serviceType?.toLowerCase() || '').includes(search)
        );
      }

      if (selectedState) data = data.filter(s => s.state === selectedState);
      if (selectedDistrict) data = data.filter(s => s.district === selectedDistrict);
      if (selectedBlock) data = data.filter(s => s.block === selectedBlock);

      setServices(data);
      setLoading(false);
    };
    fetchServices();
    return () => { ignore = true; };
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

export default ServiceListView;
