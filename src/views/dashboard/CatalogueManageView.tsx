import React, { useState, useEffect } from 'react';
import { Building2, Image as ImageIcon, Plus, Trash2, X, Play } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { db } from '../lib/supabase';
import { cn } from '../lib/utils';
import { resolveUrl } from '../services/dataService';
import { Venue, ServiceProvider, CatalogueItem, CatalogueLevel, UserSubscription } from '../types';
import { ImageUpload, VideoUpload } from '../components/Uploads';

const CatalogueManageView = ({ 
  venues, 
  services,
  globalSettings,
  activeSubscription,
  onUpgrade
}: { 
  venues: Venue[], 
  services: ServiceProvider[],
  globalSettings?: any,
  activeSubscription?: UserSubscription | null,
  onUpgrade?: () => void
}) => {
  const [activeType, setActiveType] = useState<'venue' | 'service'>(venues.length > 0 ? 'venue' : 'service');
  const [selectedId, setSelectedId] = useState<string>(
    activeType === 'venue' ? (venues[0]?.id || '') : (services[0]?.id || '')
  );
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState<Partial<CatalogueItem>>({
    id: Math.random().toString(36).substring(2, 9),
    level: activeType === 'venue' ? 'rooms(ac)' : 'work sample',
    capacity: 0,
    priceRate: 0,
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
      setNewItem(prev => ({ ...prev, id: Math.random().toString(36).substring(2, 9), level: 'rooms(ac)' }));
    } else {
      setSelectedId(services[0]?.id || '');
      setNewItem(prev => ({ ...prev, id: Math.random().toString(36).substring(2, 9), level: 'work sample' }));
    }
  }, [activeType, venues.length, services.length]);

  const handleAddItem = async () => {
    if (!selectedItem || !newItem.level) {
      toast.error('Please select level');
      return;
    }
    setLoading(true);
    try {
      const updatedCatalogue = [...(selectedItem.catalogue || []), { ...newItem, id: newItem.id || Math.random().toString(36).substring(2, 9) } as CatalogueItem];
      const table = activeType === 'venue' ? 'venues' : 'service_providers';
      
      const { error } = await db.from(table).update({ catalogue: updatedCatalogue }).eq('id', selectedItem.id);
      if (error) throw error;
      
      setNewItem({ 
        id: Math.random().toString(36).substring(2, 9),
        level: activeType === 'venue' ? 'rooms(ac)' : 'work sample', 
        capacity: 0, 
        priceRate: 0,
        images: [], 
        videos: [], 
        description: '' 
      });
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
    
    const { error } = await db.from(table).update({ catalogue: updatedCatalogue }).eq('id', selectedItem.id);
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Level/Category</label>
                  <select 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                    value={newItem.level}
                    onChange={(e) => setNewItem({...newItem, level: e.target.value as CatalogueLevel})}
                  >
                    {levels.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Capacity</label>
                  <input 
                    type="number"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                    value={newItem.capacity}
                    onChange={(e) => setNewItem({...newItem, capacity: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price Rate (₹)</label>
                  <input 
                    type="number"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 font-bold"
                    placeholder="e.g. 5000"
                    value={newItem.priceRate}
                    onChange={(e) => setNewItem({...newItem, priceRate: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>

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
                  multiple={true}
                  onUpload={(url) => {
                    if (url) {
                      const urls = Array.isArray(url) ? url : [url];
                      const currentImages = newItem.images || [];
                      const subEnabled = globalSettings?.subscriptionEnabled === true;
                      const hasSub = !subEnabled || (activeSubscription && activeSubscription.status === 'active');
                      const maxPhotos = subEnabled ? (hasSub ? 50 : 2) : 50;

                      if (currentImages.length + urls.length > maxPhotos) {
                        toast.error(`Subscription required for more than ${maxPhotos} photos`);
                        if (subEnabled && !hasSub && onUpgrade) onUpgrade();
                        return;
                      }
                      setNewItem(prev => ({...prev, images: [...(prev.images || []), ...urls]}));
                    }
                  }}
                />
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {newItem.images?.filter(img => img !== '').map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center p-1">
                      <img src={resolveUrl(img)} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                      <button 
                        onClick={() => setNewItem(prev => ({...prev, images: prev.images?.filter((_, idx) => idx !== i)}))}
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
                  label="Upload Videos (Max 60 seconds)" 
                  multiple={true}
                  onUpload={(url) => {
                    if (url) {
                      const currentVideos = newItem.videos || [];
                      const subEnabled = globalSettings?.subscriptionEnabled === true;
                      const hasSub = !subEnabled || (activeSubscription && activeSubscription.status === 'active');
                      const maxVideos = subEnabled ? (hasSub ? 10 : 0) : 10;

                      if (currentVideos.length + 1 > maxVideos) {
                        toast.error(maxVideos === 0 ? "Subscription required to upload videos" : `Subscription required for more than ${maxVideos} videos`);
                        if (subEnabled && !hasSub && onUpgrade) onUpgrade();
                        return;
                      }
                      setNewItem(prev => ({...prev, videos: [...(prev.videos || []), url]}));
                    }
                  }}
                />
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {newItem.videos?.map((vid, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center p-1">
                      <video src={resolveUrl(vid)} className="w-full h-full object-contain" />
                      <button 
                        onClick={() => setNewItem(prev => ({...prev, videos: prev.videos?.filter((_, idx) => idx !== i)}))}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-md"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
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
                        <div key={idx} className="w-full aspect-square bg-gray-50 rounded-xl shadow-sm overflow-hidden flex items-center justify-center p-1 border border-gray-100">
                          <img src={resolveUrl(img)} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                      ))}
                    </div>
                    {item.videos && item.videos.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {item.videos.slice(0, 2).map((vid, idx) => (
                          <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center p-1 border border-gray-100">
                            <video src={resolveUrl(vid)} className="w-full h-full object-contain opacity-80" />
                            <Play size={16} className="absolute text-white drop-shadow-md" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-black text-orange-600 uppercase text-sm tracking-wider">{item.level}</h4>
                        <div className="flex flex-wrap gap-4 mt-1">
                          {activeType === 'venue' && <span className="text-xs text-gray-500 font-bold">Capacity: {item.capacity} persons</span>}
                          {item.priceRate && <span className="text-xs text-orange-600 font-black">Price: ₹{item.priceRate.toLocaleString()}</span>}
                        </div>
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
      </div>
    </div>
  );
};

export default CatalogueManageView;
